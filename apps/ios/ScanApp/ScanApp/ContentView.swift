//
//  ContentView.swift
//  ScanApp
//
//  Created by Antigravity on 5/31/26.
//

import SwiftUI
import Combine
import AVFoundation
import UniformTypeIdentifiers
import PhotosUI
import Vision
#if canImport(FirebaseAnalytics)
import FirebaseAnalytics
#endif

// Helper function for conditional analytics logging
private func logAnalyticsEvent(_ name: String, parameters: [String: Any]? = nil) {
    #if canImport(FirebaseAnalytics)
    Analytics.logEvent(name, parameters: parameters)
    #endif
}

struct ContentView: View {
    @AppStorage("selectedTheme") private var selectedThemeRaw = AppTheme.dark.rawValue
    @StateObject private var history = HistoryManager.shared
    
    @State private var activeTab = "scan"
    @State private var isFlashOn = false
    @State private var cameraPosition = AVCaptureDevice.Position.back
    
    // Scan Results Sheet
    @State private var scanResult: String? = nil
    @State private var scanFormat: String = ""
    @State private var showResultSheet = false
    @State private var selectedPhotoItem: PhotosPickerItem? = nil
    
    // Settings & History Sheets
    @State private var showSettingsSheet = false
    @State private var showHistorySheet = false
    
    // Toast Notification
    @State private var toastMessage: String? = nil
    @State private var showToast = false
    
    // Barcode Generator Form
    @State private var generateText = "https://scanapp.org"
    @State private var generateFormat = BarcodeFormat.qr
    @State private var generatedImage: UIImage? = nil
    
    var activeTheme: AppTheme {
        AppTheme(rawValue: selectedThemeRaw) ?? .dark
    }
    
    var body: some View {
        ZStack {
            // Global Background
            activeTheme.bg
                .ignoresSafeArea()
                .animation(.easeInOut(duration: 0.25), value: selectedThemeRaw)
            
            // Main Content View based on Tab
            ZStack {
                if activeTab == "scan" {
                    ScanTabView(
                        isFlashOn: $isFlashOn,
                        cameraPosition: $cameraPosition,
                        selectedPhotoItem: $selectedPhotoItem,
                        activeTheme: activeTheme,
                        onScan: { text, format in
                            // Vibrate and set result
                            self.scanResult = text
                            self.scanFormat = format
                            self.history.add(text: text, format: format)
                            
                            // Log event
                            logAnalyticsEvent("scan_success", parameters: [
                                "format": format,
                                "content_length": text.count
                            ])
                            
                            withAnimation(.spring()) {
                                self.showResultSheet = true
                            }
                        }
                    )
                    .ignoresSafeArea()
                } else if activeTab == "generate" {
                    GenerateTabView(
                        generateText: $generateText,
                        generateFormat: $generateFormat,
                        generatedImage: $generatedImage,
                        activeTheme: activeTheme,
                        showToast: { msg in triggerToast(msg) }
                    )
                }
            }
            
            // Floating Bottom Tab Bar Container Overlay
            VStack {
                Spacer()
                CustomTabBar(
                    activeTab: $activeTab,
                    showHistorySheet: $showHistorySheet,
                    showSettingsSheet: $showSettingsSheet,
                    activeTheme: activeTheme
                )
                .padding(.horizontal)
                .padding(.bottom, 24) // Floating spacing
            }
            .ignoresSafeArea(.keyboard, edges: .bottom)
            
            // Floating Toast notification
            if showToast, let message = toastMessage {
                VStack {
                    Spacer()
                    Text(message)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.vertical, 12)
                        .padding(.horizontal, 24)
                        .background(Color(hex: "#1f2937"))
                        .cornerRadius(25)
                        .shadow(radius: 8)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                        .padding(.bottom, 120)
                }
                .zIndex(20)
            }
        }
        // Native Bottom Sheet for Settings
        .sheet(isPresented: $showSettingsSheet) {
            SettingsSheetView(
                selectedThemeRaw: $selectedThemeRaw,
                activeTheme: activeTheme,
                showToast: { msg in triggerToast(msg) }
            )
            .onAppear {
                logAnalyticsEvent("settings_open", parameters: nil)
            }
            .settingsSheetDetents()
        }
        // Native Bottom Sheet for History
        .sheet(isPresented: $showHistorySheet) {
            HistorySheetView(
                history: history,
                activeTheme: activeTheme,
                showToast: { msg in triggerToast(msg) },
                onSelect: { item in
                    logAnalyticsEvent("history_click", parameters: [
                        "format": item.format,
                        "content_length": item.text.count
                    ])
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        self.scanResult = item.text
                        self.scanFormat = item.format
                        self.showResultSheet = true
                    }
                }
            )
            .onAppear {
                logAnalyticsEvent("history_open", parameters: nil)
            }
            .settingsSheetDetents()
        }
        // Native Bottom Sheet for Scan Result
        .sheet(isPresented: $showResultSheet) {
            if let result = scanResult {
                ScanResultSheetView(
                    text: result,
                    format: scanFormat,
                    activeTheme: activeTheme,
                    onDismiss: {
                        self.scanResult = nil
                    },
                    showToast: { msg in triggerToast(msg) }
                )
                .settingsSheetDetents()
            }
        }
        .onChange(of: selectedPhotoItem) { newItem in
            if newItem != nil {
                logAnalyticsEvent("photo_selection", parameters: nil)
            }
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    scanImageFromGallery(image)
                } else if newItem != nil {
                    triggerToast("Failed to load image data")
                }
            }
        }
        .onChange(of: selectedThemeRaw) { newTheme in
            logAnalyticsEvent("theme_change", parameters: [
                "theme": newTheme
            ])
        }
    }
    
    private func triggerToast(_ message: String) {
        toastMessage = message
        withAnimation(.spring()) {
            showToast = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                showToast = false
            }
        }
    }
    
    private func scanImageFromGallery(_ image: UIImage) {
        guard let cgImage = image.cgImage else {
            triggerToast("Invalid image format")
            return
        }
        
        let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        let request = VNDetectBarcodesRequest { request, error in
            guard error == nil else {
                DispatchQueue.main.async {
                    triggerToast("Error reading image")
                }
                return
            }
            
            guard let results = request.results as? [VNBarcodeObservation],
                  let firstResult = results.first else {
                DispatchQueue.main.async {
                    triggerToast("No QR/barcode detected")
                }
                return
            }
            
            let payload = firstResult.payloadStringValue ?? ""
            let symbology = firstResult.symbology.rawValue
            let formatName = cleanSymbologyName(symbology)
            
            DispatchQueue.main.async {
                if !payload.isEmpty {
                    self.scanResult = payload
                    self.scanFormat = formatName
                    self.showResultSheet = true
                    self.history.add(text: payload, format: formatName)
                    triggerToast("Scanned from image successfully!")
                } else {
                    triggerToast("Empty barcode payload")
                }
                // Reset picker item so the same image can be reselected if desired
                self.selectedPhotoItem = nil
            }
        }
        
        do {
            try requestHandler.perform([request])
        } catch {
            print("Failed to perform Vision request: \(error)")
            DispatchQueue.main.async {
                triggerToast("Failed to process image")
            }
        }
    }
    
    private func cleanSymbologyName(_ raw: String) -> String {
        let clean = raw.replacingOccurrences(of: "VNBarcodeSymbology", with: "")
        if clean.isEmpty {
            return "QR"
        }
        if clean.lowercased().contains("qr") { return "QR Code" }
        if clean.lowercased().contains("aztec") { return "Aztec" }
        if clean.lowercased().contains("pdf417") { return "PDF417" }
        if clean.lowercased().contains("ean") { return "EAN" }
        if clean.lowercased().contains("upc") { return "UPC" }
        if clean.lowercased().contains("code128") { return "Code 128" }
        if clean.lowercased().contains("code39") { return "Code 39" }
        if clean.lowercased().contains("datamatrix") { return "Data Matrix" }
        return clean.uppercased()
    }
}

// MARK: - Viewfinder Outlines & Shape
struct ViewfinderCornersShape: Shape {
    let cornerLength: CGFloat
    let cornerRadius: CGFloat
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Top Left
        path.move(to: CGPoint(x: rect.minX, y: rect.minY + cornerLength))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cornerRadius))
        path.addArc(
            center: CGPoint(x: rect.minX + cornerRadius, y: rect.minY + cornerRadius),
            radius: cornerRadius,
            startAngle: Angle(degrees: 180),
            endAngle: Angle(degrees: 270),
            clockwise: false
        )
        path.addLine(to: CGPoint(x: rect.minX + cornerLength, y: rect.minY))
        
        // Top Right
        path.move(to: CGPoint(x: rect.maxX - cornerLength, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.maxX - cornerRadius, y: rect.minY))
        path.addArc(
            center: CGPoint(x: rect.maxX - cornerRadius, y: rect.minY + cornerRadius),
            radius: cornerRadius,
            startAngle: Angle(degrees: 270),
            endAngle: Angle(degrees: 0),
            clockwise: false
        )
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY + cornerLength))
        
        // Bottom Right
        path.move(to: CGPoint(x: rect.maxX, y: rect.maxY - cornerLength))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - cornerRadius))
        path.addArc(
            center: CGPoint(x: rect.maxX - cornerRadius, y: rect.maxY - cornerRadius),
            radius: cornerRadius,
            startAngle: Angle(degrees: 0),
            endAngle: Angle(degrees: 90),
            clockwise: false
        )
        path.addLine(to: CGPoint(x: rect.maxX - cornerLength, y: rect.maxY))
        
        // Bottom Left
        path.move(to: CGPoint(x: rect.minX + cornerLength, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX + cornerRadius, y: rect.maxY))
        path.addArc(
            center: CGPoint(x: rect.minX + cornerRadius, y: rect.maxY - cornerRadius),
            radius: cornerRadius,
            startAngle: Angle(degrees: 90),
            endAngle: Angle(degrees: 180),
            clockwise: false
        )
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY - cornerLength))
        
        return path
    }
}

struct ViewfinderCorners: View {
    let size: CGSize
    let color: Color
    
    var body: some View {
        ViewfinderCornersShape(cornerLength: 28, cornerRadius: 16)
            .stroke(color, style: StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round))
            .frame(width: size.width, height: size.height)
    }
}

struct LaserLine: View {
    let size: CGSize
    let color: Color
    @State private var animate = false
    
    var body: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    gradient: Gradient(colors: [.clear, color, .clear]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(width: size.width - 16, height: 3)
            .shadow(color: color, radius: 4)
            .offset(y: animate ? size.height / 2 - 8 : -size.height / 2 + 8)
            .onAppear {
                withAnimation(
                    Animation.easeInOut(duration: 2.2)
                        .repeatForever(autoreverses: true)
                ) {
                    animate = true
                }
            }
    }
}

// MARK: - Scan Tab View
struct ScanTabView: View {
    @Binding var isFlashOn: Bool
    @Binding var cameraPosition: AVCaptureDevice.Position
    @Binding var selectedPhotoItem: PhotosPickerItem?
    let activeTheme: AppTheme
    var onScan: (String, String) -> Void
    
    let viewfinderSize = CGSize(width: 250, height: 250)
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Live Camera View
                CameraView(isFlashOn: $isFlashOn, cameraPosition: $cameraPosition, onScan: onScan)
                    .ignoresSafeArea()
                
                // Viewfinder Bounds Corners (No shadow overlay, just the smooth 4 corners)
                ViewfinderCorners(size: viewfinderSize, color: activeTheme.primary)
                
                // Laser Line Animation
                LaserLine(size: viewfinderSize, color: activeTheme.primary)
                
                // Floating Status Pill Label (Positioned high to prevent overlap with viewfinder borders)
                VStack {
                    Text("Scan with privacy")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 18)
                        .background(Color.black.opacity(0.6))
                        .clipShape(Capsule())
                        .overlay(
                            Capsule().stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                        .padding(.top, geometry.safeAreaInsets.top > 0 ? geometry.safeAreaInsets.top + 6 : 16)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
                .ignoresSafeArea()
                
                // Floating Controls Pill Container
                VStack {
                    Spacer()
                    HStack(spacing: 20) {
                        // Flashlight
                        Button(action: {
                            isFlashOn.toggle()
                            logAnalyticsEvent("flash_toggle", parameters: [
                                "is_on": isFlashOn ? 1 : 0
                            ])
                        }) {
                            Image(systemName: isFlashOn ? "bolt.fill" : "bolt.slash.fill")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(isFlashOn ? activeTheme.primary : .white)
                                .frame(width: 44, height: 44)
                        }
                        
                        Divider()
                            .frame(height: 24)
                            .background(Color.white.opacity(0.2))
                        
                        // Switch Camera
                        Button(action: {
                            let newPos: AVCaptureDevice.Position = cameraPosition == .back ? .front : .back
                            cameraPosition = newPos
                            logAnalyticsEvent("camera_switch", parameters: [
                                "position": newPos == .back ? "back" : "front"
                            ])
                        }) {
                            Image(systemName: "camera.rotate.fill")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                        }
                        
                        Divider()
                            .frame(height: 24)
                            .background(Color.white.opacity(0.2))
                        
                        // Choose Photo
                        PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.white)
                                .frame(width: 44, height: 44)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 6)
                    .background(Color.black.opacity(0.6))
                    .clipShape(Capsule())
                    .overlay(Capsule().stroke(Color.white.opacity(0.12), lineWidth: 1))
                    .padding(.bottom, geometry.safeAreaInsets.bottom > 0 ? geometry.safeAreaInsets.bottom + 120 : 130)
                }
                .frame(maxWidth: .infinity)
                .ignoresSafeArea()
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .ignoresSafeArea()
        .onAppear {
            logAnalyticsEvent("scan_start", parameters: nil)
        }
    }
}

// MARK: - Generate Tab View
struct GenerateTabView: View {
    @Binding var generateText: String
    @Binding var generateFormat: BarcodeFormat
    @Binding var generatedImage: UIImage?
    let activeTheme: AppTheme
    var showToast: (String) -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack {
                    Text("Generate Barcode")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(activeTheme.text)
                    Spacer()
                }
                .padding(.top, 24)
                
                // Form Container
                VStack(alignment: .leading, spacing: 20) {
                    // Selector
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Barcode Format")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(activeTheme.textSecondary)
                        
                        Picker("Format", selection: $generateFormat) {
                            ForEach(BarcodeFormat.allCases) { format in
                                Text(format.displayName).tag(format)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(4)
                        .background(activeTheme.bg)
                        .cornerRadius(12)
                    }
                    
                    // Text Input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Content / URL")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(activeTheme.textSecondary)
                        
                        TextField("Enter text or URL", text: $generateText)
                            .padding(14)
                            .background(activeTheme.bg)
                            .foregroundColor(activeTheme.text)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(activeTheme.border, lineWidth: 1)
                            )
                            .autocapitalization(.none)
                            .disableAutocorrection(true)
                    }
                }
                .padding(20)
                .background(activeTheme.surface)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(activeTheme.isDark ? 0.3 : 0.05), radius: 10, y: 4)
                
                // Live Barcode Preview Card
                VStack(spacing: 16) {
                    if let image = BarcodeService.shared.generate(text: generateText, format: generateFormat) {
                        Image(uiImage: image)
                            .resizable()
                            .interpolation(.none)
                            .scaledToFit()
                            .frame(width: 220, height: 220)
                            .padding(16)
                            .background(Color.white)
                            .cornerRadius(12)
                            .shadow(radius: 4)
                            
                        HStack(spacing: 16) {
                            // Copy Action
                            Button(action: {
                                UIPasteboard.general.image = image
                                showToast("Copied image to clipboard!")
                            }) {
                                Label("Copy Image", systemImage: "doc.on.doc.fill")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .padding(.vertical, 12)
                                    .frame(maxWidth: .infinity)
                                    .background(activeTheme.primary)
                                    .cornerRadius(12)
                            }
                            
                            // Share Link Action
                            ShareLink(item: Image(uiImage: image), preview: SharePreview("Generated Barcode", image: Image(uiImage: image))) {
                                Label("Share", systemImage: "square.and.arrow.up")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(activeTheme.text)
                                    .padding(.vertical, 12)
                                    .frame(maxWidth: .infinity)
                                    .background(activeTheme.surfaceElevated)
                                    .cornerRadius(12)
                                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(activeTheme.border, lineWidth: 1))
                            }
                        }
                    } else {
                        VStack(spacing: 12) {
                            Image(systemName: "qrcode")
                                .font(.system(size: 64))
                                .foregroundColor(activeTheme.textSecondary.opacity(0.4))
                            Text("Enter some text above to generate a barcode")
                                .font(.system(size: 14))
                                .foregroundColor(activeTheme.textSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .frame(height: 280)
                    }
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .background(activeTheme.surface)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(activeTheme.isDark ? 0.3 : 0.05), radius: 10, y: 4)
                
                Spacer(minLength: 120)
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Translucent & Liquid UI Helpers
struct VisualEffectBlur: UIViewRepresentable {
    var effect: UIBlurEffect
    var isDark: Bool
    
    func makeUIView(context: Context) -> UIVisualEffectView {
        let view = UIVisualEffectView(effect: effect)
        view.overrideUserInterfaceStyle = isDark ? .dark : .light
        return view
    }
    
    func updateUIView(_ uiView: UIVisualEffectView, context: Context) {
        uiView.effect = effect
        uiView.overrideUserInterfaceStyle = isDark ? .dark : .light
    }
}

struct LiquidBackground: View {
    let activeTheme: AppTheme
    
    var body: some View {
        ZStack {
            // Material blur that conforms to light/dark theme dynamically
            VisualEffectBlur(effect: UIBlurEffect(style: .systemUltraThinMaterial), isDark: activeTheme.isDark)
                .ignoresSafeArea()
            
            // Dynamic colorful ambient glow
            GeometryReader { geo in
                ZStack {
                    Circle()
                        .fill(activeTheme.primary.opacity(activeTheme.isDark ? 0.18 : 0.25))
                        .frame(width: 260, height: 260)
                        .blur(radius: 50)
                        .offset(x: -30, y: geo.size.height * 0.1)
                    
                    Circle()
                        .fill(Color.blue.opacity(activeTheme.isDark ? 0.15 : 0.22))
                        .frame(width: 200, height: 200)
                        .blur(radius: 40)
                        .offset(x: geo.size.width - 120, y: geo.size.height * 0.4)
                }
            }
            .ignoresSafeArea()
            
            // Tint layer for contrast matching light/dark style
            (activeTheme.isDark ? Color.black.opacity(0.15) : Color.white.opacity(0.3))
                .ignoresSafeArea()
        }
    }
}

// MARK: - Settings Sheet View (Native Grouped Translucent Style)
struct SettingsSheetView: View {
    @Binding var selectedThemeRaw: String
    let activeTheme: AppTheme
    var showToast: (String) -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // 100% Liquid background
            LiquidBackground(activeTheme: activeTheme)
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Settings")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(activeTheme.text)
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(activeTheme.textSecondary)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 24)
                .padding(.bottom, 12)
                
                ScrollView {
                    VStack(spacing: 24) {
                        
                        // SECTION 1: APPEARANCE
                        VStack(alignment: .leading, spacing: 0) {
                            Text("APPEARANCE")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(activeTheme.textSecondary)
                                .padding(.leading, 16)
                                .padding(.bottom, 6)
                            
                            VStack(spacing: 0) {
                                HStack(spacing: 12) {
                                    // Colored icon
                                    Image(systemName: "paintbrush.fill")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(width: 28, height: 28)
                                        .background(Color.purple)
                                        .cornerRadius(6)
                                    
                                    Text("Theme")
                                        .font(.system(size: 16))
                                        .foregroundColor(activeTheme.text)
                                    
                                    Spacer()
                                    
                                    Picker("Theme", selection: $selectedThemeRaw) {
                                        ForEach(AppTheme.allCases) { theme in
                                            Text(theme.name).tag(theme.rawValue)
                                        }
                                    }
                                    .pickerStyle(.menu)
                                    .lineLimit(1)
                                    .fixedSize(horizontal: true, vertical: false)
                                    .foregroundColor(activeTheme.primary)
                                    .padding(.vertical, 4)
                                    .padding(.horizontal, 8)
                                    .background(.thinMaterial)
                                    .cornerRadius(8)
                                }
                                .padding(.vertical, 10)
                                .padding(.horizontal, 16)
                            }
                            .background(.ultraThinMaterial)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1)
                            )
                        }
                        .padding(.horizontal, 20)
                        
                        // SECTION 2: PRIVACY & PRIVILEGES
                        VStack(alignment: .leading, spacing: 0) {
                            Text("PRIVACY & SECURITY")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(activeTheme.textSecondary)
                                .padding(.leading, 16)
                                .padding(.bottom, 6)
                            
                            VStack(spacing: 0) {
                                HStack(spacing: 12) {
                                    Image(systemName: "checkmark.shield.fill")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(width: 28, height: 28)
                                        .background(Color.green)
                                        .cornerRadius(6)
                                    
                                    Text("Local Processing")
                                        .font(.system(size: 16))
                                        .foregroundColor(activeTheme.text)
                                    
                                    Spacer()
                                    
                                    Text("Active")
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(activeTheme.primary)
                                }
                                .padding(.vertical, 12)
                                .padding(.horizontal, 16)
                            }
                            .background(.ultraThinMaterial)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1)
                            )
                            
                            Text("Scanning and generating is fully local. No camera feed, images, or barcode data is ever sent to a server.")
                                .font(.system(size: 12))
                                .foregroundColor(activeTheme.textSecondary)
                                .lineSpacing(3)
                                .padding(.horizontal, 16)
                                .padding(.top, 8)
                        }
                        .padding(.horizontal, 20)
                        
                        // SECTION 3: SUPPORT & LEGAL
                        VStack(alignment: .leading, spacing: 0) {
                            Text("INFO & SUPPORT")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(activeTheme.textSecondary)
                                .padding(.leading, 16)
                                .padding(.bottom, 6)
                            
                            VStack(spacing: 0) {
                                // Website Row
                                Button(action: {
                                    if let url = URL(string: "https://scanapp.org") {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    HStack(spacing: 12) {
                                        Image(systemName: "globe")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(.white)
                                            .frame(width: 28, height: 28)
                                            .background(Color.orange)
                                            .cornerRadius(6)
                                        
                                        Text("Website")
                                            .font(.system(size: 16))
                                            .foregroundColor(activeTheme.text)
                                        
                                        Spacer()
                                        
                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundColor(activeTheme.textSecondary.opacity(0.5))
                                    }
                                    .padding(.vertical, 10)
                                    .padding(.horizontal, 16)
                                }
                                
                                Divider()
                                    .background(activeTheme.isDark ? Color.white.opacity(0.12) : Color.black.opacity(0.06))
                                    .padding(.leading, 56)
                                
                                // Version Row
                                HStack(spacing: 12) {
                                    Image(systemName: "info.circle.fill")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(width: 28, height: 28)
                                        .background(Color.gray)
                                        .cornerRadius(6)
                                    
                                    Text("Version")
                                        .font(.system(size: 16))
                                        .foregroundColor(activeTheme.text)
                                    
                                    Spacer()
                                    
                                    Text("2.0.0")
                                        .font(.system(size: 15))
                                        .foregroundColor(activeTheme.textSecondary)
                                }
                                .padding(.vertical, 10)
                                .padding(.horizontal, 16)
                            }
                            .background(.ultraThinMaterial)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1)
                            )
                        }
                        .padding(.horizontal, 20)
                        
                        // Footer
                        VStack(spacing: 8) {
                            Text("Built with ❤️ by ScanApp")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(activeTheme.textSecondary.opacity(0.8))
                        }
                        .padding(.vertical, 32)
                    }
                }
            }
        }
    }
}

// MARK: - Custom Floating Tab Bar (iOS 18 / HIG inspired style)
struct CustomTabBar: View {
    @Binding var activeTab: String
    @Binding var showHistorySheet: Bool
    @Binding var showSettingsSheet: Bool
    let activeTheme: AppTheme
    
    var body: some View {
        HStack(spacing: 4) {
            // Scan Tab Button
            tabButton(title: "Scan", icon: "qrcode.viewfinder", tab: "scan")
            
            // Generate Tab Button
            // tabButton(title: "Generate", icon: "qrcode", tab: "generate")
            
            // History Tab Button (triggers bottom sheet modal)
            sheetButton(title: "History", icon: "clock.fill", isPresented: $showHistorySheet)
            
            // Settings Tab Button (triggers bottom sheet modal)
            sheetButton(title: "Settings", icon: "gearshape.fill", isPresented: $showSettingsSheet)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(
            activeTheme.surface.opacity(0.85)
        )
        .clipShape(Capsule())
        .overlay(
            Capsule().stroke(activeTheme.border.opacity(0.5), lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(activeTheme.isDark ? 0.35 : 0.08), radius: 12, y: 6)
    }
    
    @ViewBuilder
    private func tabButton(title: String, icon: String, tab: String) -> some View {
        let isSelected = activeTab == tab && !showHistorySheet && !showSettingsSheet
        
        Button(action: {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                activeTab = tab
            }
        }) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .bold))
                if isSelected {
                    Text(title)
                        .font(.system(size: 12, weight: .bold))
                }
            }
            .foregroundColor(isSelected ? .white : activeTheme.textSecondary)
            .padding(.vertical, 10)
            .padding(.horizontal, 14)
            .background(
                Group {
                    if isSelected {
                        Capsule()
                            .fill(activeTheme.primary)
                    }
                }
            )
        }
    }
    
    @ViewBuilder
    private func sheetButton(title: String, icon: String, isPresented: Binding<Bool>) -> some View {
        let isSelected = isPresented.wrappedValue
        
        Button(action: {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                isPresented.wrappedValue = true
            }
        }) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .bold))
                if isSelected {
                    Text(title)
                        .font(.system(size: 12, weight: .bold))
                }
            }
            .foregroundColor(isSelected ? .white : activeTheme.textSecondary)
            .padding(.vertical, 10)
            .padding(.horizontal, 14)
            .background(
                Group {
                    if isSelected {
                        Capsule()
                            .fill(activeTheme.primary)
                    }
                }
            )
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

// MARK: - Scan Result Sheet View (True Native Sheet with Translucency support)
struct ScanResultSheetView: View {
    let text: String
    let format: String
    let activeTheme: AppTheme
    var onDismiss: () -> Void
    var showToast: (String) -> Void
    @Environment(\.dismiss) var dismiss
    
    var isURL: Bool {
        if let url = URL(string: text), url.scheme != nil {
            return true
        }
        return false
    }
    
    var body: some View {
        ZStack {
            // Liquid background
            LiquidBackground(activeTheme: activeTheme)
            
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        Text("Scan Result")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(activeTheme.text)
                        Spacer()
                        Button(action: {
                            dismiss()
                            onDismiss()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(activeTheme.textSecondary)
                        }
                    }
                    .padding(.top, 24)
                    
                    // Text Detail Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Image(systemName: isURL ? "link.circle.fill" : "text.justify.left")
                                .font(.system(size: 28))
                                .foregroundColor(activeTheme.primary)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text(isURL ? "URL / LINK" : "TEXT")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(activeTheme.textSecondary)
                                Text(isURL ? "Website Link" : "Plain Text")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(activeTheme.text)
                            }
                            Spacer()
                        }
                        .padding(.bottom, 4)
                        
                        Text(text)
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(activeTheme.text)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .textSelection(.enabled)
                    }
                    .padding(16)
                    .background(.ultraThinMaterial)
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1))
                    
                    // Meta info card
                    VStack(spacing: 8) {
                        HStack {
                            Text("Barcode Format")
                                .font(.system(size: 13))
                                .foregroundColor(activeTheme.textSecondary)
                            Spacer()
                            Text(format)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(activeTheme.text)
                        }
                        Divider().background(activeTheme.isDark ? Color.white.opacity(0.12) : Color.black.opacity(0.06))
                        HStack {
                            Text("Scanned Time")
                                .font(.system(size: 13))
                                .foregroundColor(activeTheme.textSecondary)
                            Spacer()
                            Text(DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium))
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(activeTheme.text)
                        }
                    }
                    .padding(14)
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(activeTheme.isDark ? Color.white.opacity(0.1) : Color.black.opacity(0.05), lineWidth: 1))
                    
                    // Action Buttons
                    HStack(spacing: 12) {
                        // Copy
                        Button(action: {
                            UIPasteboard.general.string = text
                            showToast("Copied to clipboard!")
                        }) {
                            VStack(spacing: 6) {
                                Image(systemName: "doc.on.doc.fill")
                                    .font(.system(size: 16))
                                Text("Copy")
                                    .font(.system(size: 11, weight: .bold))
                            }
                            .foregroundColor(activeTheme.text)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(.thinMaterial)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1))
                        }
                        
                        // Share
                        ShareLink(item: text) {
                            VStack(spacing: 6) {
                                Image(systemName: "square.and.arrow.up")
                                    .font(.system(size: 16))
                                Text("Share")
                                    .font(.system(size: 11, weight: .bold))
                            }
                            .foregroundColor(activeTheme.text)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(.thinMaterial)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1))
                        }
                        
                        // Open link (if URL)
                        if isURL {
                            Button(action: {
                                if let url = URL(string: text) {
                                    UIApplication.shared.open(url)
                                }
                            }) {
                                VStack(spacing: 6) {
                                    Image(systemName: "safari.fill")
                                        .font(.system(size: 16))
                                    Text("Open Link")
                                        .font(.system(size: 11, weight: .bold))
                                }
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(activeTheme.primary)
                                .cornerRadius(12)
                            }
                        }
                    }
                    
                    // Scan Another button
                    Button(action: {
                        dismiss()
                        onDismiss()
                    }) {
                        Text("Scan Another")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(isURL ? AnyShapeStyle(.ultraThinMaterial) : AnyShapeStyle(activeTheme.primary))
                            .cornerRadius(32)
                            .overlay(
                                RoundedRectangle(cornerRadius: 32)
                                    .stroke(isURL ? (activeTheme.isDark ? Color.white.opacity(0.2) : Color.black.opacity(0.1)) : Color.clear, lineWidth: 1)
                            )
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - Scan History Sheet View (True Native Sheet with Translucency)
struct HistorySheetView: View {
    @ObservedObject var history: HistoryManager
    let activeTheme: AppTheme
    var showToast: (String) -> Void
    var onSelect: (HistoryItem) -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // Liquid background
            LiquidBackground(activeTheme: activeTheme)
            
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    HStack {
                        Text("Scan History")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(activeTheme.text)
                        Spacer()
                        
                        if !history.items.isEmpty {
                            Button(action: {
                                history.clearAll()
                                showToast("History cleared!")
                            }) {
                                Text("Clear All")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(activeTheme.primary)
                            }
                            .padding(.trailing, 12)
                        }
                        
                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(activeTheme.textSecondary)
                        }
                    }
                    .padding(.top, 24)
                    
                    if history.items.isEmpty {
                        VStack(spacing: 16) {
                            Image(systemName: "clock.arrow.circlepath")
                                .font(.system(size: 48))
                                .foregroundColor(activeTheme.textSecondary.opacity(0.6))
                            Text("No scans recorded yet")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(activeTheme.textSecondary)
                        }
                        .padding(.vertical, 64)
                    } else {
                        VStack(spacing: 12) {
                            ForEach(history.items) { item in
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(item.text)
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(activeTheme.text)
                                            .lineLimit(1)
                                        Text("\(item.format) • \(item.timeFormatted)")
                                            .font(.system(size: 11))
                                            .foregroundColor(activeTheme.textSecondary)
                                    }
                                    Spacer()
                                    
                                    // Quick copy button
                                    Button(action: {
                                        UIPasteboard.general.string = item.text
                                        showToast("Copied to clipboard!")
                                    }) {
                                        Image(systemName: "doc.on.doc.fill")
                                            .font(.system(size: 14))
                                            .foregroundColor(activeTheme.textSecondary)
                                            .padding(8)
                                            .background(.thinMaterial)
                                            .cornerRadius(6)
                                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1))
                                    }
                                    
                                    // Delete button
                                    Button(action: {
                                        history.remove(item: item)
                                    }) {
                                        Image(systemName: "trash.fill")
                                            .font(.system(size: 14))
                                            .foregroundColor(.red.opacity(0.8))
                                            .padding(8)
                                            .background(.thinMaterial)
                                            .cornerRadius(6)
                                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1))
                                    }
                                }
                                .padding(12)
                                .background(.ultraThinMaterial)
                                .cornerRadius(12)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(activeTheme.isDark ? Color.white.opacity(0.15) : Color.black.opacity(0.08), lineWidth: 1))
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    onSelect(item)
                                    dismiss()
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

extension View {
    @ViewBuilder
    func settingsSheetDetents() -> some View {
        if #available(iOS 16.4, *) {
            self.presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
                .presentationBackground(.clear)
        } else if #available(iOS 16.0, *) {
            self.presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
                .presentationBackground(.clear)
        } else {
            self
        }
    }
}
