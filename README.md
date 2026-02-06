# Better Canvas Quiz (LTI 1.3 MVP)

This is a minimal LTI 1.3 Advantage tool skeleton for Canvas, built as Vercel API routes.

## Quick start

1) Generate keys

```bash
node scripts/generate-keys.mjs
```

2) Set environment variables in Vercel

Required:
- `LTI_CLIENT_ID`
- `LTI_DEPLOYMENT_ID`
- `LTI_PLATFORM_ISSUER`
- `LTI_PLATFORM_AUTH_URL`
- `LTI_PLATFORM_JWKS_URL`
- `LTI_PUBLIC_JWK`
- `LTI_PRIVATE_KEY_PEM`

Canvas defaults (production, Instructure-hosted):
- `LTI_PLATFORM_ISSUER=https://canvas.instructure.com`
- `LTI_PLATFORM_AUTH_URL=https://sso.canvaslms.com/api/lti/authorize_redirect`
- `LTI_PLATFORM_JWKS_URL=https://sso.canvaslms.com/api/lti/security/jwks`

Canvas test/beta:
- `LTI_PLATFORM_ISSUER=https://canvas.test.instructure.com` or `https://canvas.beta.instructure.com`
- `LTI_PLATFORM_AUTH_URL=https://sso.test.canvaslms.com/api/lti/authorize_redirect` or `https://sso.beta.canvaslms.com/api/lti/authorize_redirect`
- `LTI_PLATFORM_JWKS_URL=https://sso.test.canvaslms.com/api/lti/security/jwks` or `https://sso.beta.canvaslms.com/api/lti/security/jwks`

If your Canvas is self-hosted, confirm issuer/auth/jwks URLs with your admin.

3) Deploy to Vercel

- Create a new Vercel project from this folder.
- After deploy, your base URL will look like: `https://better-canvas-quiz.vercel.app`

## Canvas LTI 1.3

LTI endpoints are currently disabled to fit the Vercel Hobby function limit.
If you upgrade plans or want LTI 1.3 enabled again, re-add the LTI routes.

## Token-based Canvas API (teacher access token)

If you can't use LTI 1.3, you can use a teacher access token for basic roster and grade sync.

Env vars:
- `CANVAS_BASE_URL` (e.g., `https://k12.instructure.com`)
- `CANVAS_ACCESS_TOKEN` (personal access token)
- `TEACHER_PASSCODE` (shared passcode for teacher UI)
- `SESSION_SECRET` (random string for session signing)

Endpoints:
- `GET /api/canvas/me` (test token)
- `GET /api/canvas/courses`
- `GET /api/canvas/enrollments?course_id=123`
- `POST /api/canvas/grade` JSON:
  `{ "course_id": "123", "assignment_id": "456", "user_id": "789", "score": 95 }`

UI routes:
- `/` (landing page with role selection)
- `/teacher` (teacher console, passcode protected)
- `/student` (student quiz with integrity log)
