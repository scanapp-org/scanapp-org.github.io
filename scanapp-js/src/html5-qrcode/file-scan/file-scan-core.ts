/**
 * @fileoverview
 * Core components for file based scannnig.
 * 
 * @author mebjas <minhazav@gmail.com>
 * 
 * The word "QR Code" is registered trademark of DENSO WAVE INCORPORATED
 * http://www.denso-wave.com/qrcode/faqpatent-e.html
 */

/**
 * Interface for callback when a file is selected by user using the button.
 */
export type OnFileSelected = (file: File) => void;
