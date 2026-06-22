# Divine Trinity — Feature Test Guide

**App URL:** https://divine-trinity.vercel.app  
**Purpose:** End-to-end walkthrough of every user-facing feature.  
**Time estimate:** ~45–60 minutes for the full flow; individual sections can be tested independently.

---

## Before You Start

### 1. Staff accounts you need

Log in as the **Superadmin** first and create the following accounts via  
**Settings → Add Staff Member** (sidebar link):

| Name (suggested) | Role | Room | Email (suggested) |
|---|---|---|---|
| Dr. Emeka Obi | Doctor | Room 1 | doctor@test.com |
| Nurse Amaka | Nurse | — | nurse@test.com |
| Receptionist Tolu | Receptionist | — | receptionist@test.com |
| Lab Tech Bola | Lab Technician | — | labtech@test.com |

> **Note:** Supabase email confirmation must be **OFF** for accounts to activate immediately.  
> In Supabase → Authentication → Settings → "Enable email confirmations" → toggle OFF.

### 2. Run the demo seed (optional but recommended)

In Supabase → SQL Editor, paste and run the contents of  
`supabase/migrations/004_demo.sql`.  
This populates the superadmin charts and creates 8 realistic patients at various stages.

### 3. Use two browser windows

Many tests require switching roles. Open a second window (or use Incognito) to stay logged in as two roles at once.

---

## Section 1 — Superadmin

**Login:** Use your superadmin credentials.

### 1.1 Dashboard

| # | Action | Expected result |
|---|---|---|
| 1 | Go to `/dashboard` | KPIs show: Today's Patients, Completed Consultations, Lab Orders, Revenue (₦). All numbers, no crashes. |
| 2 | Check the "Patients / Day" line chart | Shows bars for the last 7 days. Days with demo seed data should have non-zero values. |
| 3 | Check the "Revenue" bar chart | Shows ₦ amounts (not "N amounts"). Days with payments show non-zero bars. |
| 4 | Check "Current Stage Distribution" | Horizontal bars show active patients by stage (Registered, In Triage, etc.). |
| 5 | Check "Test Volume" pie chart | Pie slices appear for lab tests that have been ordered. |
| 6 | Scroll to the Live Queue table | Rows of today's patients. Click any row. | Should navigate to that patient's folder (`/patients/:id`). |
| 7 | Click **Refresh** button | Spinner spins, then data reloads without error. |

### 1.2 Staff Management (`/settings`)

| # | Action | Expected result |
|---|---|---|
| 8 | Click **Settings** in the sidebar | Staff Management page loads. Staff grouped by role (Superadmins, Doctors, etc.). |
| 9 | Click **Add Staff Member** | Sheet slides in with form fields: Full Name, Email, Initial Password, Role, (Room if Doctor). |
| 10 | Create a Doctor: fill form, choose Role = Doctor, pick Room 1, click **Create Account** | Success toast. New doctor appears in the Doctors section. |
| 11 | Click **Deactivate** on any staff member (not yourself) | Button turns green "Activate". Status badge changes to Inactive. |
| 12 | Click **Activate** on the same member | Status reverts to Active. |
| 13 | Try to click **Deactivate** on your own account | Toast error: "You cannot deactivate your own account". Nothing changes. |

### 1.3 Catalog Management (`/reports`)

| # | Action | Expected result |
|---|---|---|
| 14 | Click **Reports** in the sidebar | Catalog Management page with Drugs and Lab Tests tabs. |
| 15 | Drugs tab: see pre-seeded drugs (Clomiphene, Progesterone, etc.) all marked Active. |  |
| 16 | Add a drug: Name = "Test Drug", Price = 5000, click **Add** | Success toast. New drug appears in the list. |
| 17 | Click the toggle icon on "Test Drug" | Status changes to Inactive. Row dims. |
| 18 | Click toggle again | Status returns to Active. |
| 19 | Switch to **Lab Tests** tab | Pre-seeded tests visible (Couples Test, AMH, SFA, etc.). |
| 20 | Add a lab test: Name = "Hormone Panel", Code = "HP-001", Price = 12000, click **Add** | Test appears in list. |
| 21 | Try to add a test with a duplicate code (e.g. "CT-001") | Error from Supabase about unique constraint — or graceful error message. |

### 1.4 Role protection

| # | Action | Expected result |
|---|---|---|
| 22 | Log in as the **Nurse** account, then manually navigate to `/settings` | Redirected to `/dashboard`. Nurse never sees Staff Management. |
| 23 | Same for `/reports` | Redirected to `/dashboard`. |

---

## Section 2 — Patient Self-Registration (QR Flow)

**No login required for this section.**

| # | Action | Expected result |
|---|---|---|
| 24 | Log in as **Receptionist**, click **QR Code** in the sidebar | QR Page shows a scannable QR code and the registration URL. |
| 25 | Click **Copy link** | Toast or button text changes to "Copied!". Paste the link into a new tab. |
| 26 | On the registration page (`/patient-register`): fill in Wife's Surname, Other Names, Phone, Husband details, DOB, etc. Click **Submit** | Success screen: "Your details have been submitted." |
| 27 | Back in the Receptionist window, refresh the dashboard | New patient appears in the **Self-Registered (Unconfirmed)** section as a draft. |
| 28 | Click **Review & Confirm** on that draft | ConfirmDraftSheet slides in. Review the pre-filled details. |
| 29 | Assign a patient code (auto-generated), click **Confirm Registration** | Patient moves to the Registered section. Status badge = Registered. |

---

## Section 3 — Receptionist Manual Registration

**Login:** Receptionist account.

| # | Action | Expected result |
|---|---|---|
| 30 | Click **New Patient** button (top right of dashboard) or go to `/patients/new` | Registration form loads. |
| 31 | Fill in: Surname = "Testlast", Other Names = "Firstname Mid", Phone = "08012345678". Fill optional husband fields. Click **Register Patient** | Patient created with status = Registered. Patient code auto-assigned (DTF-YYYY-####). Redirect to dashboard or patient list. |
| 32 | Go to **Patients** in the sidebar | All patients list. Search by surname "Testlast". |
| 33 | Click the patient row | Patient Folder opens (`/patients/:id`). |

---

## Section 4 — Nurse / Triage

**Login:** Nurse account.

| # | Action | Expected result |
|---|---|---|
| 34 | Go to `/dashboard` | Nurse Dashboard shows sections: Registered (waiting for triage), In Triage, Ready for Consultation, Awaiting Lab. KPI cards at top. |
| 35 | In the **Registered** section, click **Start Triage** on the manually registered test patient | Patient status → in_triage. Moves to In Triage section. |
| 36 | Click **Record Vitals** (or the triage action) | TriageSheet slides in with vitals form: BP Systolic/Diastolic, Pulse, Weight, Temperature, Perspiration. |
| 37 | Fill in all vitals fields (e.g. BP 120/80, Pulse 72, Weight 60, Temp 36.8). Click **Save & Advance** | Patient moves to **Ready for Consultation**. Room assignment visible. |
| 38 | Verify the patient now shows in the "Ready for Consultation" section with an assigned room number. | Room number displayed (e.g. Room 1). |

---

## Section 5 — Doctor / Consultation

**Login:** Doctor account (Room 1).

| # | Action | Expected result |
|---|---|---|
| 39 | Go to `/dashboard` | Doctor Dashboard shows "Ready Queue" filtered to Room 1. The triaged patient should appear. |
| 40 | Click **Start Consultation** | Patient status → in_consultation. Navigate to ConsultationPage (`/consultations/:id`). |
| 41 | In the **SOAP** tab, fill in all four fields (Subjective, Objective, Assessment, Plan). Click **Save SOAP** | Toast: "SOAP notes saved". Fields retain values if you navigate away and back. |
| 42 | Switch to **Prescriptions** tab. Click **Add Prescription**. Select a drug (e.g. Clomiphene), set Quantity = 10. Click **Add** | Drug appears in the prescription list with calculated cost. |
| 43 | Switch to **Lab Orders** tab. Click **Add Lab Order**. Select a test (e.g. TVS). Click **Add** | Order appears in list with status "ordered". |
| 44 | Click **Send to Lab** (appears because there are pending lab orders) | Patient status → awaiting_lab. Button disappears. SOAP and add-forms become read-only. |
| 45 | Alternatively (after removing lab orders): click **Finalize Consultation** | Patient status → completed. Redirect to dashboard. |

---

## Section 6 — Nurse Assigns Lab Tech

**Login:** Nurse account.

| # | Action | Expected result |
|---|---|---|
| 46 | Go to `/dashboard` | Patient from step 44 now appears in the **Awaiting Lab** section. |
| 47 | Click **Assign Lab Tech** | AssignLabSheet slides in. Shows unassigned lab orders for that patient. |
| 48 | For each order, select a Lab Tech from the dropdown (e.g. "Lab Tech Bola"). Click **Assign** | Order shows as assigned. When all orders are assigned, sheet closes automatically. |
| 49 | Patient disappears from Awaiting Lab (status → lab_in_progress if assignment triggers it, or stays awaiting_lab — either is valid). | |

---

## Section 7 — Lab Technician

**Login:** Lab Tech account.

| # | Action | Expected result |
|---|---|---|
| 50 | Go to `/dashboard` | Lab Tech Dashboard shows assigned orders, grouped by patient. |
| 51 | Click **Start** on an order | Status → in_progress. Button changes to show a results textarea + Submit. |
| 52 | Type result notes (e.g. "TVS: Endometrial thickness 8mm. Dominant follicle 18mm on right."). Click **Submit Results** | Status → completed. Order moves to "Completed Today" section. |
| 53 | If the patient had multiple orders, repeat for all of them. When the last order is submitted, patient status auto-advances. | Patient status → results_ready. |

---

## Section 8 — Doctor Reviews Results

**Login:** Doctor account.

| # | Action | Expected result |
|---|---|---|
| 54 | Go to `/dashboard` | Patient appears in a green "Results Ready" banner section. |
| 55 | Click the patient or **Open Consultation** | ConsultationPage shows a green "Results Ready — All lab results are in" banner. |
| 56 | Switch to the **Lab Orders** tab | Completed orders show result notes entered by the lab tech. Read-only. |
| 57 | Update SOAP Plan if needed. Click **Save SOAP** | Saves successfully (SOAP is editable when results_ready). |
| 58 | Click **Finalize Consultation** in the banner (or bottom of SOAP tab) | Patient status → completed. |

---

## Section 9 — Billing / Finance

### Patient Folder Billing Tab

**Login:** Any role (Receptionist or Superadmin recommended).

| # | Action | Expected result |
|---|---|---|
| 59 | Go to **Patients** → click the completed test patient | Patient Folder loads. |
| 60 | Click the **Billing** tab | Shows: Total Charges, Amount Paid, Balance Due KPIs. Charges ledger table below. |
| 61 | Charges for prescriptions and lab orders should appear automatically (auto-created by triggers). Verify: one charge per drug prescribed, one per lab test ordered. | |
| 62 | Click **Record Payment**. Enter Amount = 20000, Note = "Cash payment". Click **Save** | Payment appears in the Payments list. Balance Due decreases. |
| 63 | Click the **Clinical** tab | Read-only view of prescriptions and lab orders with result notes. |

### Finance Overview Page

**Login:** Receptionist or Superadmin.

| # | Action | Expected result |
|---|---|---|
| 64 | Click **Finance** in the sidebar | Finance page loads with KPI cards: Outstanding Bills, Settled Today, No Charges Yet, Revenue Collected. |
| 65 | **Outstanding Balances** section lists patients with an unpaid balance. The test patient (partial payment) appears here. | |
| 66 | **Settled Today** section lists patients where balance = 0. | |
| 67 | Click **View Folder** on any patient row | Opens Patient Folder to the Billing tab. |

---

## Section 10 — Patient Folder (Full)

**Login:** Any role.

| # | Action | Expected result |
|---|---|---|
| 68 | Open any completed patient's folder | Header strip: patient code, name, status badge, phone. |
| 69 | Vitals strip below header shows BP, Pulse, Weight, Temp from triage. | |
| 70 | **Billing** tab loads correctly with charges and payments. | |
| 71 | **Clinical** tab shows prescriptions (drug, qty, cost) and lab orders (test name, status, result notes). | |

---

## Section 11 — Live Queue View

**Login:** Any role.

| # | Action | Expected result |
|---|---|---|
| 72 | Go to `/queue` | Kanban board with columns for each patient status. Drag is not required — just verify patients appear in the correct columns. |
| 73 | Navigate between all 7 non-draft columns: Registered, In Triage, Ready, Consulting, Awaiting Lab, Lab In Progress, Completed. | |

---

## Section 12 — Edge Cases & Guards

| # | Scenario | Expected result |
|---|---|---|
| 74 | Navigate to `/settings` as a Nurse | Redirected to `/dashboard`. |
| 75 | Navigate to a URL that doesn't exist (e.g. `/xyz`) | 404 page: "Page not found" with Back to Dashboard button. |
| 76 | Go to `/login` when already logged in | Should redirect to `/dashboard` (or show login — acceptable either way). |
| 77 | Try to add a prescription with no drug selected | Button stays disabled or shows inline validation. |
| 78 | Try to add a lab order with no test selected | Same as above. |
| 79 | Try to finalize a consultation when there are pending lab orders | "Send to Lab" is shown instead of "Finalize". Finalize only appears after results are ready or if no lab orders exist. |
| 80 | Refresh the page mid-consultation | Page reloads into the same consultation with all SOAP data intact (persisted in Supabase). |

---

## Section 13 — QR Code Page

**Login:** Receptionist.

| # | Action | Expected result |
|---|---|---|
| 81 | Click **QR Code** in the sidebar | Large QR code displayed with registration URL below it. |
| 82 | Click **Copy link** | URL is copied. Paste to verify it points to `/patient-register` on the live domain. |
| 83 | Click **Print QR code** | Browser print dialog opens. QR + clinic name formatted for printing. |
| 84 | Scan the QR code with a phone | Phone browser opens the patient self-registration form. |

---

## Section 14 — Full End-to-End Run

Run the full patient journey from scratch using the test accounts:

1. **Receptionist** registers a new patient manually → status: `registered`
2. **Nurse** starts triage → records vitals → assigns Room 1 → status: `ready_for_consultation`
3. **Doctor (Room 1)** starts consultation → writes SOAP → adds 1 prescription + 1 lab order → sends to lab → status: `awaiting_lab`
4. **Nurse** assigns the lab tech to the pending order → status transitions
5. **Lab Tech** starts the order → submits results → status: `results_ready`
6. **Doctor** opens the results → reads lab notes → finalizes → status: `completed`
7. **Receptionist** opens Patient Folder → Billing tab → records full payment → balance = ₦0
8. **Superadmin** checks dashboard → confirms patient count and revenue updated

**Total steps:** ~20 minutes for one complete patient cycle.

---

## Quick Reference — Status Flow

```
registered → in_triage → ready_for_consultation → in_consultation
                                                        ↓
                                               (with lab orders)
                                                  awaiting_lab → lab_in_progress → results_ready
                                                        ↓
                                                   completed
                                               (no lab orders)
                                                   completed
```

---

## Known Limitations (not bugs)

- **Email confirmation** must be OFF in Supabase for staff creation to work instantly.
- **Payment method** is always "in_app" — cash/POS/transfer distinction is a future feature.
- **Lab file uploads** (result PDFs) — UI field exists but file storage is not yet wired up; text notes only.
- **Mobile layout** — functional but optimised for desktop/tablet (1024px+).
