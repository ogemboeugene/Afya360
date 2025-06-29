/**
 * INTERACTION CHECKER SCREEN
 * 
 * PURPOSE:
 * - Check for drug interactions
 * - Display interaction severity and recommendations
 * - Provide alternative medication suggestions
 * 
 * COMPONENTS TO INCLUDE:
 * - Current medications list (checkboxes for selection)
 * - Add medication to check button
 * - Interaction results section:
 *   - Severity level indicators (minor/moderate/major/contraindicated)
 *   - Interaction mechanism explanation
 *   - Clinical significance
 *   - Management recommendations
 * - Alternative medications suggestions
 * - Drug-food/alcohol interaction warnings
 * 
 * FEATURES:
 * - Real-time interaction checking
 * - Severity-based color coding
 * - Detailed interaction explanations
 * - Alternative drug suggestions
 * 
 * INTEGRATION:
 * - Uses DrugInteractionService
 * - Links to current medication list
 * - Connects to DrugInformationService for alternatives
 * 
 * NAVIGATION:
 * - Drug Details: DrugDetailScreen
 * - Add Medication: DrugSearchScreen
 * - Alternatives: DrugDetailScreen (alternative)
 */
