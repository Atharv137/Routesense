# RouteSense: React/TypeScript to Flutter/Firebase Migration Guide

This document details the architectural translation, structural mapping, and technical decisions involved in migrating **RouteSense — Fleet Visibility & Operations** from React 18 / TypeScript / Vite to **Flutter / Dart / Firebase**.

---

## 1. Technology Stack Conversion Matrix

| Dimension | Legacy Web Stack | Final Migrated Architecture |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.x | **Dart 3.x** |
| **Frontend Framework** | React 18 + Vite | **Flutter 3.x** |
| **State Management** | React Context (`OperationsContext.tsx`) | **Provider Pattern** (`ChangeNotifier` & `MultiProvider`) |
| **Database / BaaS** | LocalStorage / Mock in-memory state | **Cloud Firestore** (Real-Time Streams & Offline Persistence) |
| **Authentication** | Mock state in React Context | **Firebase Authentication** (Email/Password, Tokens & User Models) |
| **File Storage** | Base64 strings | **Firebase Storage** (5MB Limit, Image MIME, Secure Rules) |
| **Security / RBAC** | Client-side role checks | **Dual-Layer RBAC**: UI guards + Production `firestore.rules` |
| **QR Code Engine** | Inline SVG / Canvas generator | **`qr_flutter`** Native High-Performance QR Painter |
| **Styling & Design** | Tailwind CSS utility classes | **`ThemeData` & `AppColors`** tokens with responsive layouts |

---

## 2. Component & File Mapping Guide

### Core State & Business Logic
| React Source File | Flutter Target File | Description |
| :--- | :--- | :--- |
| `src/context/OperationsContext.tsx` | `lib/providers/*.dart` | Split into modular providers (`AuthProvider`, `TicketProvider`, `BusProvider`, `IncidentProvider`, `RouteProvider`, `DashboardProvider`). |
| `src/services/busSimulation.ts` | `lib/services/bus_simulation_engine.dart` | Deterministic GPS interpolation engine running on a 3-second `Timer.periodic`. |
| `src/services/storage.ts` | `lib/services/firestore_service.dart` | Reactive stream controllers and Firestore cache layer with offline queueing. |
| `src/types/index.ts` | `lib/models/*.dart` | Strongly-typed Dart classes with `fromJson()` and `toJson()` serialization. |

### UI Screens & Components
| React Component | Flutter Screen / Widget | Responsibilities |
| :--- | :--- | :--- |
| `src/components/Navbar.tsx` | `lib/widgets/common/app_header.dart` + `bottom_nav_bar.dart` | Adaptive role-based navigation, brand header, offline toggle, notification modal. |
| `src/components/RoleSwitcher.tsx` | `lib/widgets/common/quick_role_switcher.dart` | Horizontal tester chip bar for instant zero-login role toggling. |
| `src/components/Dashboard.tsx` | `lib/screens/operations/operations_dashboard_screen.dart` | Command Center KPI metrics, live triage queue, and bottleneck alerts. |
| `src/components/BusTracker.tsx` | `lib/widgets/common/simulation_map_widget.dart` | High-contrast schematic corridor map showing live moving buses and stops. |
| `src/components/Ticketing.tsx` | `lib/screens/conductor/ticket_logger_modal.dart` & `passenger/digital_ticketing_modal.dart` | Fare computation, stop selection, passenger counter, and instant ticket generation. |
| `src/components/TicketHistory.tsx` | `lib/screens/conductor/ticket_history_screen.dart` | Searchable and filterable ticket audit log with revenue sums. |
| `src/components/IncidentReporting.tsx` | `lib/screens/driver/incident_report_modal.dart` | Incident dispatch modal with photo attachment, severity levels, and delay minutes. |
| `src/components/ShiftSummary.tsx` | `lib/screens/conductor/shift_summary_screen.dart` | Cash-in-hand reconciliation, digital revenue tally, and shift sign-off. |
| `src/components/RecurringIssues.tsx` | `lib/screens/operations/recurring_issues_screen.dart` | 7-day clustering intelligence with bottleneck recommendations and confidence scoring. |

---

## 3. Data Model Translation Reference

All interfaces from `src/types/index.ts` have been faithfully converted to Dart classes with full type safety:

- **`User` ➔ `UserModel`** (`lib/models/user_model.dart`):
  Includes `uid`, `email`, `name`, `role`, `phone`, `employeeId`, `busAssigned`, `routeAssigned`, and `shiftStatus`.
- **`Route` ➔ `RouteModel`** (`lib/models/route_model.dart`):
  Includes `scheduledStops` (with `isMajor` and `distanceFromPrevKm`), `farePerStop`, `baseFare`, and dynamic `calculateFare(from, to)`.
- **`Bus` ➔ `BusModel`** (`lib/models/bus_model.dart`):
  Includes `currentPassengers`, `capacity`, `currentLoad`, `currentSpeed`, `nextStop`, `etaNextStopMin`, `status`, and helper getters (`isOnTime`, `isDelayed`, `isBreakdown`).
- **`Ticket` ➔ `TicketModel`** (`lib/models/ticket_model.dart`):
  Includes `qrCodeData`, `paymentType` (`cash` / `razorpay_digital`), `totalFare`, `passengerCount`, and `issuedByRole`.
- **`Incident` ➔ `IncidentModel`** (`lib/models/incident_model.dart`):
  Includes `type`, `severity`, `status` (`open` / `resolved`), `delayMinutes`, `locationName`, `photoUrl`, and `resolutionNotes`.
- **`RecurringIssue` ➔ `RecurringIssueModel`** (`lib/models/recurring_issue_model.dart`):
  Includes `incidentCount`, `period`, `peakProblemPeriod`, `recommendation`, `confidenceScore`, and `affectedStops`.

---

## 4. Telemetry Simulation Architecture

The simulation engine (`BusSimulationEngine`) preserves exact parity with the original simulation:
1. Every **3 seconds**, an internal timer triggers a state calculation across all active buses.
2. The bus moves along the ordered stops of its assigned corridor.
3. Coordinates (`latitude`, `longitude`) interpolate smoothly between waypoints.
4. When reaching a stop, the bus updates `nextStop`, recalculates `etaNextStopMin` (based on distance and speed), fluctuates passenger boarding/alighting realistically, and adjusts `currentLoad` (%).
5. **No Google Maps API billing or key is required**: The simulation displays on an optimized schematic canvas that functions completely offline and reliably across any device.

---

## 5. Security & Deployment

The repository includes ready-to-deploy Firebase rules:
- **`firebase/firestore.rules`**: Granular role-based security rules covering read/write access for each collection.
- **`firebase/storage.rules`**: Storage security rules enforcing image-only uploads and a 5MB size limit.
