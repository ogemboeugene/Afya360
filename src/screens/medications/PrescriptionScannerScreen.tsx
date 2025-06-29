/**
 * PRESCRIPTION SCANNER SCREEN
 * 
 * PURPOSE:
 * - Scan prescription documents
 * - Extract medication information using OCR
 * - Add scanned medications to user's list
 * 
 * COMPONENTS TO INCLUDE:
 * - Camera viewfinder with scan overlay
 * - Scan instruction overlay
 * - Captured image preview
 * - OCR extraction results:
 *   - Detected medications
 *   - Dosages and frequencies
 *   - Doctor information
 *   - Date issued
 * - Confirm/edit extracted information
 * - Add to medications button
 * 
 * FEATURES:
 * - Document edge detection
 * - OCR text extraction
 * - Medication information parsing
 * - Prescription validation
 * 
 * INTEGRATION:
 * - Uses CameraService
 * - Links to OCRService for text extraction
 * - Connects to DrugInformationService for validation
 * 
 * NAVIGATION:
 * - Success: MedicationsScreen (with new medications)
 * - Edit: AddMedicationScreen (pre-filled)
 * - Cancel: Previous screen
 */
