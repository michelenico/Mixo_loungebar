# Security Specification: Mixò Lounge Bar

## 1. Data Invariants
1. **Administrative Boundary**: Only authenticated users whose UID is registered in the `/admins` collection or who possess the verified bootstrapped admin email (`michelenico4@gmail.com`) can read/write administrative configurations (`/appConfig`), update any reservation, or alter system records.
2. **Role Escalation Defense**: Normal users cannot self-promote to 'admin'. The `role` field on `/users/{userId}` can only be set to 'admin' by existing admins, and `/admins` collection is strictly admin-writable.
3. **Reservation Integrity**: Customers can create reservations with valid contact info and slot details. They can only read their own reservation unless they are an admin.
4. **App Configuration Lock**: Public users can read `/appConfig` (so customers see the live menu, events, gallery, and schedule), but only administrators can write or update `/appConfig`.
5. **Coupon Protection**: Users can read their own coupons (`userId == request.auth.uid`), while admins can view and mark coupons as redeemed.
6. **Input Boundaries**: All strings are bound by explicit size limits (`.size() <= MAX`), preventing denial-of-wallet / memory flooding attacks.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)
1. **Payload 1 (Privilege Escalation on User Profile)**:
   Unauthenticated or regular user tries to write `{ "role": "admin" }` into their own `/users/{uid}`.
   *Expected*: PERMISSION_DENIED.
2. **Payload 2 (Unverified Admin Email Spoofing)**:
   Attacker creates account with `michelenico4@gmail.com` but `email_verified: false` and attempts to write to `/appConfig/menu`.
   *Expected*: PERMISSION_DENIED.
3. **Payload 3 (Arbitrary Admin Document Injection)**:
   Regular user attempts to create document in `/admins/{attackerUid}`.
   *Expected*: PERMISSION_DENIED.
4. **Payload 4 (Public AppConfig Mutation)**:
   Non-admin user attempts `setDoc` or `updateDoc` on `/appConfig/menu` to tamper with prices.
   *Expected*: PERMISSION_DENIED.
5. **Payload 5 (Unauthenticated Reservation Snooping)**:
   Unauthenticated actor tries to query all `/reservations`.
   *Expected*: PERMISSION_DENIED.
6. **Payload 6 (Cross-User Reservation Read)**:
   User B attempts to read a reservation where `userId == 'UserA'`.
   *Expected*: PERMISSION_DENIED.
7. **Payload 7 (Oversized Payload / Wallet Drain Attack)**:
   Attacker sends a reservation with a 2MB name string.
   *Expected*: PERMISSION_DENIED (size bounds enforced).
8. **Payload 8 (Shadow Update Field Injection)**:
   Attacker tries to patch reservation with `{ "status": "confirmed", "isVipForever": true }`.
   *Expected*: PERMISSION_DENIED (strict key allowlisting).
9. **Payload 9 (Cross-User Coupon Theft)**:
   User B attempts to query `/coupons` belonging to User A.
   *Expected*: PERMISSION_DENIED.
10. **Payload 10 (Direct Write to Catch-All Unprotected Path)**:
    Attacker writes to `/system_secrets/keys`.
    *Expected*: PERMISSION_DENIED (default-deny catch-all).
11. **Payload 11 (ID Path Traversal / Poisoning)**:
    Attacker passes invalid path characters (e.g. `../../admin`).
    *Expected*: PERMISSION_DENIED.
12. **Payload 12 (Admin Impersonation on Coupon Redemption)**:
    Regular user attempts to update a coupon status from 'active' to 'redeemed'.
    *Expected*: PERMISSION_DENIED.
