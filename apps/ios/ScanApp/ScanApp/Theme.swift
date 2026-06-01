//
//  Theme.swift
//  ScanApp
//
//  Created by Antigravity on 5/31/26.
//

import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 255, 255, 255)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

enum AppTheme: String, CaseIterable, Identifiable {
    case dark = "dark"
    case light = "light"
    case monokai = "monokai"
    case dracula = "dracula"
    case nord = "nord"
    case solarizedDark = "solarized-dark"
    
    var id: String { self.rawValue }
    
    var name: String {
        switch self {
        case .dark: return "Dark Default"
        case .light: return "Light Mode"
        case .monokai: return "Monokai"
        case .dracula: return "Dracula"
        case .nord: return "Nord"
        case .solarizedDark: return "Solarized Dark"
        }
    }
    
    var isDark: Bool {
        return self != .light
    }
    
    var bg: Color {
        switch self {
        case .dark: return Color(hex: "#0a0a0c")
        case .light: return Color(hex: "#f9fafb")
        case .monokai: return Color(hex: "#272822")
        case .dracula: return Color(hex: "#282a36")
        case .nord: return Color(hex: "#2e3440")
        case .solarizedDark: return Color(hex: "#002b36")
        }
    }
    
    var surface: Color {
        switch self {
        case .dark: return Color(hex: "#121216")
        case .light: return Color(hex: "#ffffff")
        case .monokai: return Color(hex: "#1e1f1c")
        case .dracula: return Color(hex: "#1e1f29")
        case .nord: return Color(hex: "#3b4252")
        case .solarizedDark: return Color(hex: "#073642")
        }
    }
    
    var surfaceElevated: Color {
        switch self {
        case .dark: return Color(hex: "#1e1e24")
        case .light: return Color(hex: "#f3f4f6")
        case .monokai: return Color(hex: "#3e3d32")
        case .dracula: return Color(hex: "#44475a")
        case .nord: return Color(hex: "#434c5e")
        case .solarizedDark: return Color(hex: "#586e75")
        }
    }
    
    var primary: Color {
        switch self {
        case .dark: return Color(hex: "#10b981")
        case .light: return Color(hex: "#059669")
        case .monokai: return Color(hex: "#a6e22e")
        case .dracula: return Color(hex: "#bd93f9")
        case .nord: return Color(hex: "#88c0d0")
        case .solarizedDark: return Color(hex: "#2aa198")
        }
    }
    
    var text: Color {
        switch self {
        case .dark: return Color(hex: "#f3f4f6")
        case .light: return Color(hex: "#1f2937")
        case .monokai: return Color(hex: "#f8f8f2")
        case .dracula: return Color(hex: "#f8f8f2")
        case .nord: return Color(hex: "#eceff4")
        case .solarizedDark: return Color(hex: "#93a1a1")
        }
    }
    
    var textSecondary: Color {
        switch self {
        case .dark: return Color(hex: "#9ca3af")
        case .light: return Color(hex: "#4b5563")
        case .monokai: return Color(hex: "#cfcfc2")
        case .dracula: return Color(hex: "#6272a4")
        case .nord: return Color(hex: "#d8dee9")
        case .solarizedDark: return Color(hex: "#839496")
        }
    }
    
    var border: Color {
        switch self {
        case .dark: return Color(hex: "#27272a")
        case .light: return Color(hex: "#e5e7eb")
        case .monokai: return Color(hex: "#49483e")
        case .dracula: return Color(hex: "#44475a")
        case .nord: return Color(hex: "#4c566a")
        case .solarizedDark: return Color(hex: "#073642")
        }
    }
}
