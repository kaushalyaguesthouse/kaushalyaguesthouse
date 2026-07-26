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
