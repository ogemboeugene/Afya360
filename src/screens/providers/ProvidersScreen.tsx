/**
 * PROVIDERS SCREEN
 * 
 * PURPOSE:
 * - Browse and search healthcare providers
 * - Filter providers by specialty and location
 * - Display provider ratings and availability
 * 
 * COMPONENTS TO INCLUDE:
 * - Search bar with location input
 * - Filter options:
 *   - Specialty dropdown
 *   - Distance radius
 *   - Insurance accepted
 *   - Gender preference
 *   - Language spoken
 *   - Availability (today, this week)
 *   - Consultation fees range
 * - Provider cards displaying:
 *   - Provider photo and name
 *   - Specialty and credentials
 *   - Rating and review count
 *   - Distance from user
 *   - Next available appointment
 *   - Consultation fees
 * - Map view toggle
 * - Favorite providers section
 * 
 * FEATURES:
 * - Location-based search
 * - Real-time availability checking
 * - Provider comparison
 * - Favorites management
 * 
 * INTEGRATION:
 * - Uses ProvidersService
 * - Links to LocationService for proximity
 * - Connects to AppointmentService for availability
 * 
 * NAVIGATION:
 * - Provider Detail: ProviderDetailScreen
 * - Map View: ProvidersMapScreen
 * - Book Appointment: AppointmentBookingScreen
 */
