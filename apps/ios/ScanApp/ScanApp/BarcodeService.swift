//
//  BarcodeService.swift
//  ScanApp
//
//  Created by Antigravity on 5/31/26.
//

import SwiftUI
import CoreImage.CIFilterBuiltins

enum BarcodeFormat: String, CaseIterable, Identifiable, Codable {
    case qr = "QR_CODE"
    case code128 = "CODE_128"
    case pdf417 = "PDF_417"
    case aztec = "AZTEC"
    
    var id: String { self.rawValue }
    
    var displayName: String {
        switch self {
        case .qr: return "QR Code"
        case .code128: return "Code 128"
        case .pdf417: return "PDF 417"
        case .aztec: return "Aztec"
        }
    }
}

class BarcodeService {
    static let shared = BarcodeService()
    private let context = CIContext()
    
    func generate(text: String, format: BarcodeFormat, size: CGSize = CGSize(width: 512, height: 512)) -> UIImage? {
        guard !text.isEmpty else { return nil }
        let data = Data(text.utf8)
        var ciImage: CIImage?
        
        switch format {
        case .qr:
            let filter = CIFilter.qrCodeGenerator()
            filter.message = data
            filter.correctionLevel = "H" // High error correction
            ciImage = filter.outputImage
            
        case .code128:
            let filter = CIFilter.code128BarcodeGenerator()
            filter.message = data
            filter.quietSpace = 10
            ciImage = filter.outputImage
            
        case .pdf417:
            let filter = CIFilter.pdf417BarcodeGenerator()
            filter.message = data
            ciImage = filter.outputImage
            
        case .aztec:
            let filter = CIFilter.aztecCodeGenerator()
            filter.message = data
            ciImage = filter.outputImage
        }
        
        guard let rawImage = ciImage else { return nil }
        
        // Upscale the image without anti-aliasing to keep pixel sharp
        let scaleX = size.width / rawImage.extent.size.width
        let scaleY = size.height / rawImage.extent.size.height
        
        // QR/Aztec should be square and even-scaled; 1D barcodes like Code128 need stretching
        let finalScaleX = scaleX
        let finalScaleY = (format == .qr || format == .aztec) ? scaleX : scaleY
        
        let transformed = rawImage.transformed(by: CGAffineTransform(scaleX: finalScaleX, y: finalScaleY))
        
        guard let cgImage = context.createCGImage(transformed, from: transformed.extent) else { return nil }
        return UIImage(cgImage: cgImage)
    }
}
