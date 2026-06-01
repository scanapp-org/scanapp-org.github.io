//
//  CameraView.swift
//  ScanApp
//
//  Created by Antigravity on 5/31/26.
//

import SwiftUI
@preconcurrency import AVFoundation

struct CameraView: UIViewControllerRepresentable {
    @Binding var isFlashOn: Bool
    @Binding var cameraPosition: AVCaptureDevice.Position
    var onScan: (String, String) -> Void // Returns (text, formatType)
    
    func makeUIViewController(context: Context) -> CameraViewController {
        let controller = CameraViewController()
        controller.onScan = onScan
        return controller
    }
    
    func updateUIViewController(_ uiViewController: CameraViewController, context: Context) {
        uiViewController.setFlash(isFlashOn)
        uiViewController.setCameraPosition(cameraPosition)
    }
}

class CameraViewController: UIViewController {
    var onScan: ((String, String) -> Void)?
    
    var captureSession: AVCaptureSession?
    var previewLayer: AVCaptureVideoPreviewLayer?
    private var currentInput: AVCaptureDeviceInput?
    private var metadataOutput = AVCaptureMetadataOutput()
    
    private let sessionQueue = DispatchQueue(label: "org.scanapp.cameraSessionQueue")
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        
        checkPermissionsAndSetup()
    }
    
    override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
        previewLayer?.frame = view.layer.bounds
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        startSession()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        stopSession()
    }
    
    private func checkPermissionsAndSetup() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                if granted {
                    DispatchQueue.main.async {
                        self?.setupSession()
                    }
                }
            }
        default:
            break
        }
    }
    
    private func setupSession() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }
            
            let session = AVCaptureSession()
            session.beginConfiguration()
            session.sessionPreset = .hd1920x1080 // matches ScanApp web resolution high quality
            
            guard let videoCaptureDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
                  let videoInput = try? AVCaptureDeviceInput(device: videoCaptureDevice) else {
                return
            }
            
            if session.canAddInput(videoInput) {
                session.addInput(videoInput)
                self.currentInput = videoInput
            } else {
                return
            }
            
            if session.canAddOutput(self.metadataOutput) {
                session.addOutput(self.metadataOutput)
                self.metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
                
                // Set supported barcode metadata types
                self.metadataOutput.metadataObjectTypes = [
                    .qr, .code128, .code39, .code93, .ean8, .ean13, .upce, .pdf417, .dataMatrix, .aztec, .itf14
                ]
            } else {
                return
            }
            
            session.commitConfiguration()
            self.captureSession = session
            
            DispatchQueue.main.async {
                let preview = AVCaptureVideoPreviewLayer(session: session)
                preview.frame = self.view.layer.bounds
                preview.videoGravity = .resizeAspectFill
                self.view.layer.addSublayer(preview)
                self.previewLayer = preview
                
                self.startSession()
            }
        }
    }
    
    func startSession() {
        sessionQueue.async { [weak self] in
            guard let session = self?.captureSession, !session.isRunning else { return }
            session.startRunning()
        }
    }
    
    func stopSession() {
        sessionQueue.async { [weak self] in
            guard let session = self?.captureSession, session.isRunning else { return }
            session.stopRunning()
        }
    }
    
    func setFlash(_ isOn: Bool) {
        sessionQueue.async { [weak self] in
            guard let device = self?.currentInput?.device, device.hasTorch else { return }
            do {
                try device.lockForConfiguration()
                device.torchMode = isOn ? .on : .off
                device.unlockForConfiguration()
            } catch {
                print("Flashlight setting failed: \(error)")
            }
        }
    }
    
    func setCameraPosition(_ position: AVCaptureDevice.Position) {
        sessionQueue.async { [weak self] in
            guard let self = self,
                  let session = self.captureSession,
                  let currentInput = self.currentInput,
                  currentInput.device.position != position else { return }
            
            session.beginConfiguration()
            session.removeInput(currentInput)
            
            guard let newDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position),
                  let newInput = try? AVCaptureDeviceInput(device: newDevice) else {
                // roll back
                session.addInput(currentInput)
                session.commitConfiguration()
                return
            }
            
            if session.canAddInput(newInput) {
                session.addInput(newInput)
                self.currentInput = newInput
            } else {
                session.addInput(currentInput)
            }
            session.commitConfiguration()
        }
    }
}

extension CameraViewController: AVCaptureMetadataOutputObjectsDelegate {
    // MARK: - AVCaptureMetadataOutputObjectsDelegate
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard let metadataObject = metadataObjects.first,
              let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject,
              let stringValue = readableObject.stringValue else { return }
        
        let typeName = readableObject.type.rawValue.replacingOccurrences(of: "org.iso.", with: "").uppercased()
        
        // Haptic feedback
        AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
        
        onScan?(stringValue, typeName)
    }
}
