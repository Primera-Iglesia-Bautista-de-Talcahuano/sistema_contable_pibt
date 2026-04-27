# Business Flow Diagrams

## Fund Request Flow (Solicitud de Fondos)

A ministry submits a fund request (intention). Treasury reviews it, registers the transfer,
and the ministry must later submit a settlement with receipts.

```mermaid
sequenceDiagram
    actor Minister as Ministry (OPERATOR)
    actor Treasury as Treasury (ADMIN/OPERATOR)
    participant System as System
    participant Email as Resend (Email)

    Minister->>System: Submit fund request (amount + description)
    System->>System: Check against ministry budget
    System->>Email: Notify treasury (new request)
    Email-->>Treasury: Email — new request [OVER BUDGET if applicable]

    Treasury->>System: Review request → Approve or Reject

    alt Approved
        System->>Email: Notify ministry (approved)
        Email-->>Minister: Email — request approved
        Treasury->>System: Register bank transfer
        System->>Email: Notify ministry (transfer registered)
        Email-->>Minister: Email — transfer done, submit settlement within 30 days
    else Rejected
        System->>Email: Notify ministry (rejected)
        Email-->>Minister: Email — request rejected
    end
```

### States

```mermaid
stateDiagram-v2
    [*] --> PENDING : Ministry submits request
    PENDING --> APPROVED : Treasury approves
    PENDING --> REJECTED : Treasury rejects
    APPROVED --> TRANSFER_REGISTERED : Treasury registers transfer
    TRANSFER_REGISTERED --> SETTLED : Ministry submits settlement
    REJECTED --> [*]
    SETTLED --> [*]
```

---

## Settlement Flow (Rendición de Fondos)

After receiving a transfer, the ministry submits expense receipts for treasury review.

```mermaid
sequenceDiagram
    actor Minister as Ministry (OPERATOR)
    actor Treasury as Treasury (ADMIN/OPERATOR)
    participant System as System
    participant Email as Resend (Email)

    Note over Minister: Transfer has been registered (30-day window)

    Minister->>System: Submit settlement
    Minister->>System: Upload receipts (boletas / invoices)
    System->>System: Link receipts to settlement

    Treasury->>System: Review settlement → Approve or Reject

    alt Approved
        System->>Email: Notify ministry (settlement approved)
        Email-->>Minister: Email — settlement approved
        System->>System: Mark intention as SETTLED
    else Rejected
        System->>Email: Notify ministry (settlement rejected)
        Email-->>Minister: Email — settlement rejected, resubmit
        Minister->>System: Resubmit corrected settlement
    end
```

---

## Movement Registration Flow (Movimientos)

Standard income or expense recording with audit trail and optional integrations.

```mermaid
flowchart TD
    A([User creates movement]) --> B[API validates session + Zod schema]
    B --> C[Service saves to DB]
    C --> D[Folio assigned via increment_and_get_folio RPC]
    D --> E[Audit log entry created]
    E --> F{Integrations enabled?}
    F -- Yes --> G[Google Apps Script webhook]
    G --> H[PDF generated + saved to Drive]
    G --> I[Google Sheets sync]
    F -- Yes --> J[Resend email notification]
    J --> K([Treasury + registering user notified])
    F -- No --> L([Done])
    H --> L
    I --> L
```

### Movement states

```mermaid
stateDiagram-v2
    [*] --> ACTIVE : Created
    ACTIVE --> ACTIVE : Edited
    ACTIVE --> CANCELLED : Logically cancelled (no physical delete)
    CANCELLED --> [*]
```

---

## Scheduled Reminders

A Supabase cron job (`supabase/migrations/20260426000002_reminder_cron.sql`) runs periodically
and sends a summary email to treasury when there are pending items.

```mermaid
flowchart LR
    Cron([Cron trigger]) --> Q[Query pending intentions + settlements + missing transfers]
    Q --> Check{Any pending?}
    Check -- Yes --> Email[Resend summary email → treasury]
    Check -- No --> Skip([Skip])
```
