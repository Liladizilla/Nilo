# Nilo Firestore Security Specification

## Data Invariants
1. `users/{userId}`: A user can only read and write their own profile document (`userId == request.auth.uid`). Users cannot grant themselves admin status.
2. `users/{userId}/saved/{savedId}`: A user can only access and write their own saved opportunities subcollection.
3. `users/{userId}/rules/{ruleId}`: A user can only manage their own notification alert rules.
4. `entities/{entityId}`: Read allowed for all authenticated users. Writes allowed for authenticated users with valid schema and size limits.
5. `signals/{signalId}`: Read allowed for all authenticated users. Writes allowed for authenticated users with valid schema.
6. `events/{eventId}`: Read allowed for all authenticated users. Writes allowed for authenticated users.
7. `opportunities/{opportunityId}`: Read allowed for all authenticated users. Status update or creation requires authenticated user and valid opportunity schema.
8. `opportunities/{opportunityId}/actions/{actionId}`: An action must reference the user's UID (`incoming().userId == request.auth.uid`).
9. `opportunities/{opportunityId}/outcomes/{outcomeId}`: An outcome must reference the user's UID (`incoming().userId == request.auth.uid`).
10. `sources/{sourceId}`: Read allowed for authenticated users; writes guarded by schema checks.
11. Catch-all `match /{document=**}` denies all unhandled paths.

## The Dirty Dozen Payloads (Targeting Rejection)
1. **Ghost Field Injection in User**: Attacker injects `{ role: "admin", hacked: true }` into `/users/{attackerUid}`. -> REJECTED.
2. **User Profile Impersonation**: Attacker attempts to update `/users/{victimUid}`. -> REJECTED.
3. **Huge String Denial-of-Wallet**: Attacker attempts to write a 2MB string into `entity.name`. -> REJECTED.
4. **Invalid Entity Type**: Attacker writes `{ type: "malicious_system" }`. -> REJECTED.
5. **Action UID Spoofing**: Attacker writes an action under an opportunity with `userId: "victimUid"`. -> REJECTED.
6. **Outcome UID Spoofing**: Attacker writes an outcome with `userId: "victimUid"`. -> REJECTED.
7. **Negative Score in Opportunity**: Attacker sets `overallScore: -500`. -> REJECTED.
8. **Unauthenticated List on Entities**: Unauthenticated user lists `/entities`. -> REJECTED.
9. **Unauthenticated Read on User Saved**: Anonymous or unauthenticated user gets `/users/{uid}/saved/{id}`. -> REJECTED.
10. **ID Poisoning Attack**: Attacker uses path variable with special characters e.g. `../` or oversized ID (>128 chars). -> REJECTED.
11. **Direct Access to Private User Rules by Other Users**: User A queries `/users/{userB}/rules`. -> REJECTED.
12. **Malformed Signal Category**: Attacker creates signal with `signalCategory: "RANDOM_JUNK"`. -> REJECTED.
