# Security Specification - Akwaba Info

## Data Invariants
1. An article must have a valid `id`, `slug`, `title`, and `category`.
2. Access to create/update/delete articles is restricted to authenticated administrators.
3. Authenticated admins are identified by their email (`akwabanewsinfo@gmail.com`).
4. Read access to articles and events is public.
5. Search listing is public.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Unauthenticated Write**: Attempting to create an article without being logged in.
2. **Identity Spoofing**: Logged in user (non-admin) trying to create an article.
3. **Ghost Field Update**: Authenticated admin trying to add a restricted field if we had any.
4. **Invalid ID Poisoning**: Trying to create a document with an ID containing special characters or being too long.
5. **Schema Violation**: Creating an article with a missing title or invalid category.
6. **Type Mismatch**: Sending a string for the `views` count instead of a number.
7. **Resource Poisoning**: Sending a 2MB content string (exceeding Firestore 1MB document limit or our internal limit).
8. **Malicious Slug**: Injecting script tags or very long strings into the slug.
9. **Event Orphan**: Creating an event without a location.
10. **Admin Self-Promotion**: A regular user trying to add their email to an admin list (if we used an admin collection).
11. **Negative Counters**: Sending a negative value for `views` or `likes`.
12. **Timestamp Forgery**: Sending a client-side timestamp for `createdAt` instead of `request.time`.

## Test Runner Logic
The following rules will ensure all above payloads return `PERMISSION_DENIED`.
