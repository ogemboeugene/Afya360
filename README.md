# Afya360 - Comprehensive Kenya Healthcare App

A modern, comprehensive healthcare mobile application built with React Native and Expo, designed specifically for the Kenyan healthcare ecosystem.

## Project Overview

Afya360 is a comprehensive healthcare management app that provides users with:
- Digital health records management
- Medication tracking and reminders
- Healthcare provider directory and appointment booking
- Emergency services and contacts
- Insurance management and billing
- Health facilities finder
- Prescription scanning and drug interaction checking

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Storage**: Expo SecureStore & AsyncStorage
- **Camera**: Expo Camera & Document Picker
- **Location**: Expo Location
- **Notifications**: Expo Notifications
- **Icons**: Expo Vector Icons
- **Authentication**: Biometric & PIN-based security

## Project Structure

```
src/
├── assets/                 # Static assets (images, icons)
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (buttons, inputs)
│   ├── forms/            # Form components
│   ├── cards/            # Card components for data display
│   ├── modals/           # Modal and overlay components
│   └── common/           # Common components (logo, headers)
├── screens/              # Screen components organized by feature
│   ├── onboarding/       # App onboarding flow
│   ├── auth/             # Authentication screens
│   ├── dashboard/        # Main dashboard and home
│   ├── health/           # Health records management
│   ├── medications/      # Medication management
│   ├── providers/        # Healthcare providers
│   ├── emergency/        # Emergency services
│   ├── facilities/       # Healthcare facilities
│   ├── insurance/        # Insurance management
│   └── profile/          # User profile management
├── navigation/           # Navigation configuration
├── services/             # External services and APIs
│   ├── api/              # API client and endpoints
│   ├── storage/          # Local storage services
│   ├── notifications/    # Notification services
│   ├── location/         # Location services
│   └── camera/           # Camera and scanning services
├── hooks/                # Custom React hooks
├── context/              # React Context providers
├── data/                 # Data schemas and mock data
├── utils/                # Utility functions
├── styles/               # Global styles and theming
├── types/                # TypeScript type definitions
└── constants/            # App-wide constants
```

# Getting Started

> **Note**: Make sure you have completed the [React Native Development Environment](https://reactnative.dev/docs/set-up-your-environment) setup and have Expo CLI installed globally (`npm install -g @expo/cli`).

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository and navigate to project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   expo start
   ```
4. Run on device/simulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Development Guidelines

### File Naming Conventions

- **Components**: PascalCase (e.g., `LoginScreen.tsx`, `PrimaryButton.tsx`)
- **Files**: camelCase (e.g., `apiClient.ts`, `storageService.ts`)
- **Directories**: camelCase (e.g., `components`, `services`)

### Implementation Priority

The project structure is complete with placeholder files. Implement in this order:

1. **Core Setup**: Complete types, constants, and styles
2. **Authentication Flow**: Implement auth context and screens
3. **Navigation**: Complete app navigator with all routes
4. **Core UI Components**: Build reusable components
5. **Feature Screens**: Implement each screen with detailed instructions
6. **Services Integration**: Add API client and external services

### Key Features to Implement

- Phone verification with OTP
- Biometric authentication
- Health records management
- Medication tracking and scanning
- Provider directory and appointments
- Emergency services
- Insurance management

## Environment Configuration

Create `.env` file with:
```
EXPO_PUBLIC_API_BASE_URL=https://api.afya360.co.ke
EXPO_PUBLIC_ENVIRONMENT=development
```

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
