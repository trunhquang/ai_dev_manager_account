# Security Specification: AI Dev Account Manager

## 1. Data Invariants
- Admin users can perform all operations.
- Developers can READ all accounts and projects.
- Developers can CREATE and UPDATE projects they are working on (sessions/handoffs).
- AIAccount status can only be modified by admins.
- Token counts should be updated during sessions.
- Projects are assigned to one account at a time.
- Transfers must record both the previous and new account.

## 2. Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a user profile with `role: 'admin'` as a normal user.
2. **Access Escalation**: Attempt to update an AI account's `dailyTokenLimit` as a developer.
3. **Ghost Fields**: Attempt to add `isVIP: true` to a project document.
4. **Invalid Type**: Send a string for `dailyTokenLimit`.
5. **ID Poisoning**: Set a project ID to a 1MB string of junk characters.
6. **Self-Assigned Rights**: Attempt to change own user document `role`.
7. **Negative Tokens**: Set `currentTokenLeft` to -100.
8. **Invalid Status**: Set project status to 'deleted' (not in enum).
9. **Orphaned Sessions**: Create a session for a non-existent project ID.
10. **Time Spoofing**: Set `transferredAt` to a date in the future (client time).
11. **Shadow Update**: Attempt to update `createdAt` of a project.
12. **Anonymous Write**: Attempt to create a project without authentication.

## 3. Test Runner (Draft Rules)
The tests will ensure that authorized roles can perform their duties while block attacks.

```typescript
// firestore.rules.test.ts (Pseudo code logic)
// - expect(create('users/attacker', {role: 'admin'})).toBeDenied()
// - expect(update('accounts/acc1', {currentTokenLeft: 100})).toSucceedFor('admin')
// - expect(update('accounts/acc1', {currentTokenLeft: 100})).toBeDeniedFor('developer')
```
