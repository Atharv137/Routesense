# RouteSense Security Specification

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created by an authenticated user whose `request.auth.uid == userId`.
2. **Immutable Role Invariant**: Users cannot self-elevate to privileged roles (`operations_manager` or `admin`). On initial creation, role must be `passenger` (or valid verified crew registration where privileged role changes require `isOpsManagerOrAdmin()`).
3. **Owner PII Isolation**: Personal profile data (such as email, phone) can only be read by the owner `request.auth.uid == userId` or `isOpsManagerOrAdmin()`.
4. **Ticket Integrity**: Tickets can be created by authenticated passengers or conductors. Tickets cannot be altered or re-assigned to different passengers.
5. **Incident Accountability**: Drivers and operations managers can log fleet incidents; incidents must have valid severity, type, and non-empty description. Only ops managers can mark incidents resolved or edit resolution notes.
6. **Fleet Vehicle & Route Security**: Corridor route maps, fares, and fleet buses are managed and updated by authorized crew/operations staff.
7. **Default-Deny Catch-All**: Any unspecified path or document write is strictly rejected by default.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated User Creation**: Anonymous or unauthenticated write to `/users/spoofed_uid`.
2. **UID Spoofing**: Authenticated user with UID `user_abc` attempting to create `/users/user_xyz`.
3. **Privilege Escalation**: Authenticated standard passenger attempting to set `role: "admin"` or `role: "operations_manager"` on their user doc.
4. **PII Snooping**: Normal commuter attempting a direct `get()` on `/users/{otherUserId}` to read their private phone/email.
5. **Ghost Field Injection**: Attempting to create a user or ticket with undocumented shadow fields (`__isAdmin: true`).
6. **Denial of Wallet ID Poisoning**: Attempting to write a document with an ID longer than 128 characters or containing SQL/script injection characters.
7. **Ticket Forgery**: Modifying total fare or passenger ID of an existing ticket by an unauthorized client.
8. **Orphaned Write**: Creating a ticket for a non-existent or invalid route ID.
9. **Tampering with Terminal State**: Overwriting or modifying an already resolved incident or closed conductor shift.
10. **Driver Incident Spoofing**: A passenger attempting to file an operational breakdown incident disguised as a driver.
11. **Chat Log Exfiltration**: Reading AI transit copilot conversations belonging to another user.
12. **Notification Broadcast Tampering**: An unauthenticated user writing to `/notifications/{notifId}`.
