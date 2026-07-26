# Kaushalya Guest House

Public website for Kaushalya Guest House in Gomoh, Jharkhand. The site is a static, responsive frontend designed for GitHub Pages.

## Local preview

Serve the repository root with any static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Frontend integrations

- Booking requests use the existing hosted booking service.
- Online advance payments use Razorpay Checkout through that booking service.
- The backend sends transactional booking confirmation emails.
- Successful bookings offer an optional pre-filled WhatsApp message.

The website remains usable as a static page if a third-party script is temporarily unavailable, but booking submission and payment require their respective remote services.

## Admin frontend production guide

The static admin suite lives in `admin/` and supports keyboard navigation, persistent per-tab dark mode, responsive layouts from 320px through desktop, offline feedback, and print-friendly booking, invoice, revenue, and occupancy views.

### Accessibility and responsive verification

- Use the **Skip to main content** link and navigate all controls with Tab/Shift+Tab. Escape closes the mobile navigation.
- Test at 320, 375, 414, 768, and 1024 CSS pixels, plus a large desktop viewport. Wide data tables scroll horizontally rather than clipping content.
- Test light/dark modes and forced browser zoom at 200%. Motion is minimized when the operating system requests reduced motion.
- In browser print preview, verify booking summaries, invoices, revenue reports, and occupancy reports. Navigation and interactive controls are intentionally omitted.

### Security and failure behavior

Admin credentials are stored only in `sessionStorage` and removed on logout or an unauthorized response. API error payloads, tokens, secrets, payment identifiers, and raw internal identifiers must never be rendered. Network failures receive offline-safe, actionable messages without exposing backend details.

### Quality checks

```bash
npm test
npm run check
git diff --check
```
