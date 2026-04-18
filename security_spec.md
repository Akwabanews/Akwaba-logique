# Firestore Security Specification - Akwaba Info

## Data Invariants
1. **Articles/Events**: Only verified admins can create/update/delete.
2. **Notifications**:
    - Users can only read their own notifications or global ones.
    - Only admins can create notifications.
    - Users can only update the `read` status of their own notifications.
3. **Users**:
    - Users can only read/write their own profile.
    - Admins cannot be self-assigned.
4. **Comments/Subscribers**:
    - Public can create, but only admins can manage (delete/update).

## The Dirty Dozen Payloads
Below are 12 malicious payloads that should be blocked by the rules:

### 1. Identity Spoofing (Notification Takeover)
- **Target**: `/notifications/some-id`
- **Payload**: `{ "userId": "victim-uid", "title": "Hacked", "message": "...", "read": false, "date": "..." }`
- **Actor**: Non-admin user trying to send a notification to another user.
- **Expected**: `PERMISSION_DENIED`

### 2. State Shortcutting (Illegal Field Update)
- **Target**: `/articles/news-1`
- **Payload**: `{ "views": 999999 }`
- **Actor**: Regular user trying to inject view counts.
- **Expected**: `PERMISSION_DENIED`

### 3. Resource Poisoning (Large ID)
- **Target**: `/articles/A`.repeat(200)
- **Payload**: `{ ...valid article... }`
- **Actor**: Attacker trying to inflate document storage with massive IDs.
- **Expected**: `PERMISSION_DENIED`

### 4. PII Blanket Read
- **Target**: `/users/another-user`
- **Payload**: `get()`
- **Actor**: Authenticated user trying to read someone else's profile.
- **Expected**: `PERMISSION_DENIED`

### 5. Shadow Field Injection
- **Target**: `/users/my-uid`
- **Payload**: `{ "username": "me", "isAdmin": true }`
- **Actor**: User trying to grant themselves admin privileges.
- **Expected**: `PERMISSION_DENIED` (via `affectedKeys().hasOnly`)

### 6. Relational Orphan (Article without Category)
- **Target**: `/articles/new-art`
- **Payload**: `{ "id": "...", "title": "...", "category": "non-existent-cat", ... }`
- **Actor**: Admin trying to bypass enum validation.
- **Expected**: `PERMISSION_DENIED` (via `isValidArticle`)

### 7. Global Consistency Leak
- **Target**: `/notifications/notif-1`
- **Payload**: `{ "userId": "missing-user", ... }`
- **Actor**: Admin creating a notification for a non-existent user.
- **Expected**: `PERMISSION_DENIED` (via `existsCheck`)

### 8. Value Poisoning (Invalid Type)
- **Target**: `/notifications/notif-1`
- **Payload**: `{ "read": "not-a-boolean" }`
- **Actor**: Admin or user trying to break schema types.
- **Expected**: `PERMISSION_DENIED`

### 9. Temporal Integrity (Client Timestamp)
- **Target**: `/articles/art-1`
- **Payload**: `{ "date": "2000-01-01T00:00:00Z" }`
- **Actor**: Admin trying to set past dates for new articles.
- **Expected**: `PERMISSION_DENIED` (via `request.time` check)

### 10. Query Trust Bypassing
- **Target**: `/notifications`
- **Query**: `db.collection('notifications').get()`
- **Actor**: Authenticated user trying to fetch ALL notifications without a filter.
- **Expected**: `PERMISSION_DENIED` (Rule must enforce `resource.data.userId == request.auth.uid`)

### 11. Immortal Field Mutation
- **Target**: `/users/my-uid`
- **Payload**: `{ "createdAt": "new-date" }`
- **Actor**: User trying to change their registration date.
- **Expected**: `PERMISSION_DENIED`

### 12. List Denial of Wallet
- **Target**: `/notifications`
- **Scenario**: Rule uses `get()` inside a `list` operation logic.
- **Expected**: `PERMISSION_DENIED` (Forbidden by coding standards).

## Audit Result
This spec will be used to verify the `firestore.rules` against these threats.
