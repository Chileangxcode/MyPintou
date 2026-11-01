# Real-Time Data Synchronization & Cloud Messaging Setup Guide

This guide details the hybrid real-time architecture for the University Student Management System, enabling instant Admin-to-Student synchronization without manual page refreshes.

---

## 1. Architecture Overview

```
 ┌──────────────────────┐        Write (Targeted Batch)       ┌────────────────────────┐
 │   Admin / Teacher    │ ─────────────────────────────────>  │  Google Apps Script    │
 │      Interface       │                                     │  (LockService Atomic)  │
 └──────────────────────┘                                     └────────────────────────┘
            │                                                              │
            │ Optimistic UI (0ms)                                          │ Commits single row
            ▼                                                              ▼
 ┌──────────────────────┐        Multi-Tab Broadcast (<5ms)   ┌────────────────────────┐
 │   dataSyncService    │ <================================== │     Google Sheets      │
 │  (Multi-Transport)   │                                     │ (Single Source of Truth)│
 └──────────────────────┘                                     └────────────────────────┘
      │            │                                                       │
      │            │ Cloud WebSocket (<50ms)                               │ Emits Event Metadata
      ▼            ▼                                                       ▼
 ┌──────────────────────┐        Instant UI Update (0ms)      ┌────────────────────────┐
 │   Student Portal /   │ <────────────────────────────────── │ Supabase / Firebase /  │
 │  Connected Devices   │                                     │ Apps Script sync_events│
 └──────────────────────┘                                     └────────────────────────┘
```

The system implements a **three-tier synchronization strategy**:

1. **Tier 1: Instant Local & Cross-Tab Realtime (0ms - 5ms)**
   - Utilizes `BroadcastChannel("pintou_realtime_sync_v1")` and cross-window `storage` events.
   - Works immediately out-of-the-box with **zero external credentials**.
   - Whenever an Admin or Teacher modifies a score, attendance, or student record, all connected Student tabs, Admin tabs, and preview windows on the same device receive the update instantly.

2. **Tier 2: Cloud Realtime WebSockets (< 50ms Cross-Device Delivery)**
   - Pluggable support for **Supabase Realtime** or **Firebase Realtime Database**.
   - Connected devices across different networks (e.g. Teacher on laptop in office, Student on phone at home) receive instant push notifications.
   - **Data Security Guarantee**: Broadcast events contain **only metadata** (`eventId`, `entityType`, `recordId`, `action`, `timestamp`, `version`). Private student names, IDs, grades, or scores are **never broadcast publicly**.

3. **Tier 3: Smart Adaptive Delta Polling Fallback**
   - Active when no external cloud WebSocket credentials are provided.
   - Polls the dedicated `action=sync_events&since=<timestamp>` endpoint.
   - Operates directly against Google Apps Script `CacheService` without reading Google Sheets cells.
   - Pauses when the browser tab is inactive or the device goes offline.
   - Uses exponential backoff (8s -> 16s -> 32s -> max 45s) on network blips.

---

## 2. Event Specification

All real-time messages adhere to the standardized event envelope:

```json
{
  "eventId": "evt_1793467416351_9963",
  "entityType": "score",
  "recordId": "23537",
  "action": "score.updated",
  "timestamp": 1793467416351,
  "version": 1
}
```

### Supported Entity & Action Types:
- `student.created`, `student.updated`, `student.deleted`
- `score.created`, `score.updated`, `score.deleted`, `score.reset`
- `attendance.updated`
- `announcement.created`, `announcement.updated`, `announcement.deleted`
- `class.updated`
- `config.updated`

---

## 3. Option A: Connecting Supabase Realtime (Recommended for Multi-Device Realtime)

Supabase provides a free, scalable WebSocket real-time engine.

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `StudentManagementSystem`.
3. In Project Settings -> **API**, copy your:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon public key** (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6...`)

### Step 2: Configure Frontend Environment Variables
In your `frontend/.env` file:
```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Step 3: Configure Apps Script Webhook (Optional for Server-side Push)
In your Google Spreadsheet -> Extensions -> **Apps Script** -> Project Settings -> **Script Properties**:
- Add property: `REALTIME_WEBHOOK_URL`
- Value: `https://xyzcompany.supabase.co/rest/v1/rpc/broadcast_student_event` (or your edge function webhook)

---

## 4. Option B: Running with Zero-Configuration Fallback

If no external cloud keys are added:
- **Same-Device & Multi-Tab Real-time**: Fully active (< 5ms) via `BroadcastChannel`.
- **Cross-Device Sync**: Handled automatically via `dataSyncService` adaptive polling against `sync_events` (8s active interval, 30s background interval, 0ms pause when hidden).
- Zero spreadsheet quota exhaustion.

