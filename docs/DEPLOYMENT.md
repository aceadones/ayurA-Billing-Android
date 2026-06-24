# ayurA Billing — Clinic Tablet Deployment

Guide for setting up the Samsung Galaxy A7 Lite (or similar) as a dedicated billing kiosk, remotely.

---

## WhatsApp Business API (one-time setup)

1. Create a [Meta Business](https://business.facebook.com) account for the clinic.
2. Add **WhatsApp** → **API Setup** → get **Phone Number ID** and **Permanent Access Token**.
3. On the tablet: Admin login → **Admin → WhatsApp** → paste credentials → **Test connection** → Save.
4. (Recommended) Create a **utility template** in Meta (e.g. `invoice_ready`) with 4 body variables:
   - `{{1}}` patient name
   - `{{2}}` invoice ID
   - `{{3}}` total amount
   - `{{4}}` clinic name
5. Front desk: enter patient phone on invoice → **Send via WhatsApp** → PDF delivered silently (~₹0.12/msg for new patients).

No PC required at the clinic after this.

---

## Kiosk options (no root required first)

### Level 1 — Soft kiosk (built into app)

Admin → **Device** → enable **Soft kiosk mode**.

- Blocks Android back button from exiting the app at the home screen.
- Does **not** stop power-off, recent apps, or Settings.

### Level 2 — Screen Pinning (zero code, good for trial)

On the tablet:

1. Open ayurA Billing.
2. Recent apps → tap the app icon → **Pin this app**.
3. Unpin requires PIN/pattern you set on the tablet.

Good for testing. Staff can still power off the tablet.

### Level 3 — Device Owner / Lock Task (recommended for production)

**Does not require root.** One-time setup via USB + ADB when you visit the clinic (or guide someone locally):

```bash
# Factory reset OR ensure no Google accounts on device first
adb shell dpm set-device-owner com.nextlayerlabs.ayura.billing/.DeviceAdminReceiver
```

Then the app can call Android **Lock Task Mode** — home button, recents, and status bar are disabled. Power button still works (hardware limitation without custom ROM).

> The DeviceAdminReceiver must be added to the Android project (`npx cap add android` then native code). Contact developer for the APK build with kiosk receiver included.

### Level 4 — Samsung Knox Manage / Knox Configure

If the clinic buys Samsung tablets with Knox:

- **Knox Configure** (free for small deployments) can push a kiosk profile over USB or QR.
- **Knox Manage** (paid MDM) lets you lock/unlock remotely from another state — ideal for your “I’m in another state” scenario.
- Does **not** require rooting. Knox stays intact.

---

## Rooting, Knox, and LineageOS

| Approach | Root needed? | Knox | Remote manage? | Recommendation |
|----------|-------------|------|----------------|----------------|
| Screen pinning | No | Safe | No | Quick trial |
| Device Owner kiosk | No | Safe | Limited | Best free lockdown |
| Knox Manage MDM | No | Safe | **Yes** | **Best if remote support needed** |
| Root + custom kiosk app | Yes | **Trips Knox permanently** | Maybe | Avoid on clinic hardware |
| LineageOS | Yes (usually) | **Trips Knox** | Hard | Only if tablet is unusably slow |

**Samsung A7 Lite (SM-T220):** LineageOS support is limited/unofficial for this model. Rooting trips **Knox Warranty Bit (0x1)** — Samsung Pay, Secure Folder, some enterprise features break forever.

**If the tablet lags on Android 14:**

1. Disable Samsung/auto updates on the clinic Wi‑Fi router if possible.
2. Clear cache, remove bloatware (without root: disable unused apps in Settings).
3. Factory reset + fresh install of **only** ayurA Billing.
4. LineageOS only if you accept: no Knox, no Samsung support, you become the IT person remotely.

**Do not root** unless you are comfortable maintaining a custom ROM from another state.

---

## Power off / restart behaviour

| Event | Soft kiosk | Device Owner | Screen pin |
|-------|-----------|--------------|------------|
| Power off & on | Boots to Android home | Can boot straight to app* | Boots to home |
| Back button | Blocked in app | Blocked | Blocked when pinned |
| Recent apps | Still accessible | Blocked | Blocked when pinned |
| Settings | Still accessible | Blocked | Blocked when pinned |

\*Requires `BOOT_COMPLETED` receiver + Lock Task — part of full kiosk native build.

**Without Device Owner:** after restart, staff must open ayurA Billing manually (or tap pinned app). You cannot force “only this app” without Device Owner or Knox.

---

## Remote setup (you in another state)

**Works well if you plan ahead:**

1. **Before shipping the tablet:** pre-install APK, complete onboarding, configure WhatsApp API, test invoice send.
2. **Use Knox Manage or similar MDM** (~₹500–2000/mo) to push updates, lock device, restart remotely.
3. **Document front desk steps** on paper at the clinic (unlock PIN, sync button, what to do if Wi‑Fi drops).
4. **WhatsApp token expiry:** use a **System User permanent token** in Meta — does not expire weekly.
5. **App updates:** build new APK → send link or MDM push. No automatic OTA unless you add Capgo or similar later.

**Hard to do remotely without help on-site:**

- First Device Owner ADB setup (needs USB once).
- Wi‑Fi password entry, Meta business verification (may need clinic documents).
- Hardware failures, tablet replacement.

**Verdict:** WhatsApp API + pre-configured tablet is **fine** to maintain from another state. Full hardware kiosk lockdown needs **one visit** or a local person following a short checklist once.

---

## Build & install APK

```bash
npm run build
npx cap sync android
npx cap open android
# Build → Generate Signed APK in Android Studio
```

Install APK on tablet, run onboarding once, lock front desk PIN, store admin password securely (password manager — share with mom only).

---

## Archived: Baileys bridge

The old Hermes-style bridge is in `archive/whatsapp-bridge/` if you ever want a zero-Meta-cost setup with a clinic PC running 24/7.
