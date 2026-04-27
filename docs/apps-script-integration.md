# Google Apps Script Integration

Handles optional integrations triggered after a movement is created or edited:

1. PDF generation per movement
2. Google Drive storage
3. Google Sheets sync (full DB replica)

> **Note:** Email notifications are handled by **Resend**, not by Google Apps Script.
> See [email.md](email.md) for email configuration.

## Required environment variables

```env
GOOGLE_APPS_SCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/<script_hash>/exec"
GOOGLE_APPS_SCRIPT_SECRET="your_shared_secret"
GOOGLE_DRIVE_FOLDER_ID="drive_folder_id"    # Used by Apps Script
GOOGLE_SHEET_ID="google_sheet_id"           # Used by Apps Script
```

These variables are optional for local development. If `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`
is not set, integrations are skipped silently.

## How it works

1. Movement is created/edited (`POST /api/movements`, `PATCH /api/movements/[id]`).
2. Movement is saved to DB first.
3. `processMovimientoIntegrations` runs as a fire-and-forget postprocess.
4. On failure, the movement is **not** lost — error fields are updated instead:
   - `pdf_error`, `notification_error`, `sync_error`
   - Audit log entry is created.

## Manual PDF regeneration

- Endpoint: `POST /api/movements/[id]/regenerate-pdf`
- UI: "Regenerar PDF" button on the movement detail page.

## Expected Apps Script response

```json
{
  "ok": true,
  "message": "...",
  "pdfUrl": "https://...",
  "driveFileId": "...",
  "sheetSynced": true
}
```

On failure, return `{ "ok": false, "error": "description" }`.

## Key files

| File                                       | Description                                 |
| ------------------------------------------ | ------------------------------------------- |
| `services/google/client.ts`                | Webhook client with shared-secret auth      |
| `services/google/apps-script-documents.ts` | PDF generation request                      |
| `services/google/sheets-sync.ts`           | Sheets sync request                         |
| `services/google/movement-postprocess.ts`  | Orchestrates all integrations post-movement |
| `services/google/types.ts`                 | Shared types for GAS payloads               |

## Apps Script setup

1. Create a Google Apps Script project.
2. Deploy as **Web App** (Execute as: your Google account).
3. On first deployment, authorize scopes: Drive, SpreadsheetApp.
4. Store the shared secret in Apps Script **Properties Service**.
5. Validate the `x-app-script-secret` header on every incoming request.
6. Set `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` to the deployment URL.
