# RouteSense — Fleet Visibility & Operations
## Flutter + Firebase Enterprise Edition

RouteSense is a transit operations, rapid ticketing, fleet visibility, and incident intelligence platform built with **Flutter**, **Dart**, and **Firebase (Cloud Firestore, Firebase Authentication, Firebase Storage)**.

---

## 🚀 Key Highlights & Capabilities

- **Role-Based Access Control (RBAC):**
  - **Passenger (Commuter):** Corridor lookup, stop-to-stop fare inquiry, instant digital ticket booking, high-contrast QR pass inspection, and live simulated bus tracking.
  - **Conductor (On-Board):** Mobile point-of-sale (POS) rapid ticketing, cash and digital revenue tracking, shift collection reconciliation, and passenger load monitoring.
  - **Driver (In-Cab):** Real-time GPS speedometer, waypoint sequence checklist, next stop ETA countdown, and one-tap emergency incident dispatch.
  - **Operations Manager (Command Center):** Network fleet map, live bus roster, on-time performance KPI analytics, real-time incident resolution triage, and automated 7-day corridor bottleneck detection.

- **Deterministic Fleet Telemetry Simulation:**
  - Mirrors real GPS transit behavior with a 3-second heartbeat cycle.
  - Smooth deterministic waypoint interpolation across scheduled stops with live headway, load percentages, and velocity calculations.
  - **No external map API dependencies or billing keys required** — runs seamlessly anywhere using high-contrast schematic rendering.

- **Offline-First Resilience:**
  - Local operational queue preserves tickets and incident reports during network dropouts.
  - Automatic and manual synchronization back to Cloud Firestore with conflict resolution.

- **Production Security Rules:**
  - Strict Cloud Firestore security rules (`firebase/firestore.rules`) enforcing RBAC across `/users`, `/routes`, `/buses`, `/trips`, `/tickets`, `/incidents`, `/shifts`, and `/recurring_issues`.
  - Firebase Storage security rules (`firebase/storage.rules`) safeguarding photo uploads with MIME and 5MB size validation.

---

## 📂 Architecture & Directory Structure

```
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart         # Design system color tokens
│   │   │   ├── app_constants.dart      # Application constants
│   │   │   └── initial_data.dart       # Seed data for routes, buses & demo users
│   │   ├── theme/
│   │   │   └── app_theme.dart          # High-contrast accessible Flutter theme
│   │   ├── utils/
│   │   │   └── formatters.dart         # Date, currency (₹), and distance formatters
│   │   └── validators/
│   │       └── form_validators.dart    # Form validation logic
│   ├── models/                         # Strong POJO models with JSON serialization
│   │   ├── bus_model.dart
│   │   ├── incident_model.dart
│   │   ├── notification_model.dart
│   │   ├── recurring_issue_model.dart
│   │   ├── route_model.dart
│   │   ├── shift_model.dart
│   │   ├── ticket_model.dart
│   │   ├── trip_model.dart
│   │   └── user_model.dart
│   ├── providers/                      # Provider state management layer
│   │   ├── auth_provider.dart
│   │   ├── bus_provider.dart
│   │   ├── dashboard_provider.dart
│   │   ├── incident_provider.dart
│   │   ├── route_provider.dart
│   │   ├── ticket_provider.dart
│   │   └── trip_provider.dart
│   ├── screens/                        # UI screens organized by operational role
│   │   ├── auth/                       # Splash, Login, and Sign-Up screens
│   │   ├── conductor/                  # Shift Console, POS Ticketing, Shift Reconcile
│   │   ├── driver/                     # Cab Telemetry, Incident Dispatch, Waypoints
│   │   ├── operations/                 # Command Center, Fleet Map, Analytics, Issues
│   │   ├── passenger/                  # Route Search, Live Tracker, QR Tickets
│   │   └── main_shell_screen.dart      # Dynamic adaptive shell with role switcher
│   ├── services/                       # Data services & background simulation
│   │   ├── auth_service.dart
│   │   ├── bus_simulation_engine.dart  # 3-second periodic telemetry loop
│   │   ├── firestore_service.dart      # Reactive stream engine & Firestore mirrors
│   │   └── storage_service.dart        # Firebase Storage photo uploader
│   ├── widgets/
│   │   └── common/                     # Reusable widgets (Header, Map, QR, Badges)
│   └── main.dart                       # MultiProvider root entry point
├── firebase/
│   ├── firestore.rules                 # Cloud Firestore RBAC rules
│   └── storage.rules                   # Firebase Storage security rules
├── pubspec.yaml                        # Flutter package configuration
├── MIGRATION.md                        # React to Flutter component mapping guide
└── README.md
```

---

## 👥 Demo Accounts (Instant Role Switching)

The application includes a built-in top testing bar allowing instantaneous role switching without re-authenticating:

| Role | Name | Email | Default Password |
| :--- | :--- | :--- | :--- |
| **Conductor** | Anita Deshmukh | `anita.conductor@routesense.city` | `password123` |
| **Driver** | Rajesh Kumar | `rajesh.driver@routesense.city` | `password123` |
| **Operations Manager** | Siddharth Rao | `siddharth.ops@routesense.city` | `password123` |
| **Passenger** | Pooja Sharma | `pooja.commuter@gmail.com` | `password123` |

---

## 🛠️ Local Development & Running the App

1. Ensure Flutter 3.16+ is installed on your workstation.
2. Run `flutter pub get` to install all dependencies:
   - `provider: ^6.1.2`
   - `intl: ^0.19.0`
   - `uuid: ^4.3.3`
   - `qr_flutter: ^4.1.0`
3. Run the application:
   ```bash
   flutter run -d chrome     # Web target
   flutter run -d android    # Android device/emulator
   flutter run -d ios        # iOS device/simulator
   ```

---

## 🔒 Security Model

All database operations are governed by the strict rules defined in `/firebase/firestore.rules`:
- Passwords are never stored in plain text.
- Passengers can only read their own digital QR tickets.
- Conductors and Operations Managers can issue tickets and view shift reconciliations.
- Drivers can log incident reports and update trip telemetry.
- Operations Managers possess network-wide oversight and incident resolution authority.

<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio</h2>

  <p>The fastest path from prompt to production with Gemini.</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>
