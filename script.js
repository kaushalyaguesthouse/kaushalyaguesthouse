"use strict";

const { API_BASE_URL: BACKEND_URL, REQUEST_TIMEOUT_MS = 15000 } = window.KGH_CONFIG || {};
const ROOM_PRICES = { "AC Room": 1500, "Non AC Room": 1200 };
const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initTheme();
  initLanguage();
  initHeroSlider();
  initGallery();
  initBooking();
  initReviews();
  initRevealAnimations();
  document.getElementById("year").textContent = new Date().getFullYear();
});

window.addEventListener("pageshow", () => resetBookingButton());

function initNavigation() {
  const header = document.querySelector(".site-header");
  const menuButton = document.getElementById("menuBtn");
  const links = document.getElementById("navLinks");
  const closeMenu = () => {
    links.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    links.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  });
  links.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30), { passive: true });
}

function initTheme() {
  const button = document.getElementById("darkBtn");
  const saved = localStorage.getItem("kgh-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.toggle("dark", saved ? saved === "dark" : prefersDark);
  const update = () => {
    const dark = document.body.classList.contains("dark");
    button.textContent = dark ? "☀" : "☾";
    button.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  };
  update();
  button.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("kgh-theme", document.body.classList.contains("dark") ? "dark" : "light");
    update();
  });
}

const translations = {
  navRooms: "कमरे", navRestaurant: "रेस्तरां", navGallery: "गैलरी", navReviews: "समीक्षाएँ", navContact: "संपर्क", bookNow: "बुक करें",
  heroEyebrow: "गोमो में आपका हार्दिक स्वागत", heroTitle: "आराम से रहें।<br><em>घर जैसा महसूस करें।</em>", heroCopy: "आरामदायक कमरे, आत्मीय सेवा और घर जैसा भोजन—गोमो मुख्य बाजार के बीचों-बीच।", checkAvailability: "उपलब्धता देखें", callUs: "कॉल करें", station: "गोमो स्टेशन से", support: "24 घंटे सहायता", starting: "कमरे यहाँ से",
  aboutEyebrow: "अपनापन और आराम", welcomeTitle: "गोमो के बीचों-बीच आपका सुविधाजनक ठहराव", welcomeCopy: "गोमो मुख्य बाजार स्थित कौशल्या गेस्ट हाउस परिवारों, जोड़ों और व्यावसायिक यात्रियों के लिए साफ-सुथरे, विशाल कमरे प्रदान करता है। आरामदायक बिस्तर, वाई-फाई, पार्किंग, रेस्तरां और रेलवे स्टेशन तक आसान पहुँच का आनंद लें।",
  stayEyebrow: "अपनी पसंद से रहें", roomsTitle: "सुकून भरी रातों के लिए कमरे", roomsCopy: "आरामदायक यात्रा के लिए जरूरी सुविधाएँ और हमारी आत्मीय सेवा।", popular: "सबसे लोकप्रिय", acRoom: "वातानुकूलित कमरा", nonAcRoom: "सामान्य नॉन-एसी कमरा", perNight: "/ रात", airConditioning: "एयर कंडीशनिंग", wifi: "मुफ्त वाई-फाई", bathroom: "अटैच्ड बाथरूम", housekeeping: "रोजाना सफाई", familyFriendly: "परिवार के अनुकूल", chooseRoom: "यह कमरा चुनें",
  diningEyebrow: "ताजा और स्वादिष्ट", restaurantTitle: "अपनापन के साथ परोसा अच्छा भोजन", restaurantCopy: "सुबह ताजे नाश्ते से शुरुआत करें, दोपहर का भरपूर भोजन करें या रात के खाने के साथ दिन खत्म करें। हमारा भूतल का पारिवारिक रेस्तरां दिन भर स्वादिष्ट शाकाहारी घरेलू भोजन परोसता है।", detailsEyebrow: "हर जरूरी सुविधा", featuresTitle: "सुविधाजनक ठहराव के लिए सब कुछ", wifiCopy: "अपनी यात्रा के दौरान जुड़े रहें।", parking: "मुफ्त पार्किंग", parkingCopy: "होटल के मेहमानों के लिए सुविधाजनक पार्किंग।", centralLocation: "मुख्य स्थान", locationCopy: "मुख्य बाजार, स्टेशन से केवल 650 मीटर।", supportCopy: "हर समय सहायता उपलब्ध है।",
  lookEyebrow: "एक नजर डालें", galleryTitle: "आपके ठहराव की एक झलक", galleryHint: "तस्वीर को पूरा देखने के लिए चुनें।", feedbackEyebrow: "मेहमानों की राय", reviewsTitle: "हमारे मेहमानों के अनुभव", reviewsCopy: "हर ठहराव को बेहतर बनाने में हमारी मदद के लिए अपनी ईमानदार राय दें।", writeReview: "समीक्षा लिखें", yourName: "आपका नाम", emailAddress: "ईमेल पता", yourRating: "आपकी रेटिंग", yourReview: "आपकी समीक्षा", submitReview: "समीक्षा भेजें",
  reserveEyebrow: "अपनी यात्रा की योजना बनाएँ", bookingTitle: "अपना कमरा बुक करें", bookingCopy: "अपनी तारीखें और कमरा चुनें। पुष्टि से पहले हम तुरंत कुल मूल्य बताएँगे।", longStay: "लंबे ठहराव का लाभ", offerCopy: "7 रात रुकें और केवल 6 रातों का भुगतान करें। हर सातवीं रात मुफ्त है।", fullName: "पूरा नाम", mobile: "मोबाइल नंबर", checkIn: "चेक-इन", checkOut: "चेक-आउट", roomType: "कमरे का प्रकार", adults: "वयस्क", children: "बच्चे", specialRequest: "विशेष अनुरोध", paymentMethod: "भुगतान का तरीका", advanceOnline: "30% अग्रिम ऑनलाइन भुगतान", securePayment: "रेजरपे द्वारा सुरक्षित भुगतान", payHotel: "होटल में भुगतान", payArrival: "आगमन पर भुगतान करें", stayLength: "ठहराव", roomTotal: "कुल कमरे का मूल्य", advanceDue: "अभी देय अग्रिम", confirmBooking: "बुकिंग की पुष्टि करें"
};

function initLanguage() {
  const button = document.getElementById("langBtn");
  const originals = new Map([...document.querySelectorAll("[data-i18n]")].map((node) => [node, node.innerHTML]));
  let hindi = false;
  button.addEventListener("click", () => {
    hindi = !hindi;
    document.documentElement.lang = hindi ? "hi" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.innerHTML = hindi ? (translations[node.dataset.i18n] || originals.get(node)) : originals.get(node);
    });
    button.textContent = hindi ? "English" : "हिन्दी";
    button.setAttribute("aria-label", `Switch language to ${hindi ? "English" : "Hindi"}`);
  });
}

function initHeroSlider() {
  const hero = document.querySelector(".hero");
  const dots = document.querySelector(".slide-dots");
  const images = ["Outside front.jpg", "Reception.jpg", "Room3.JPG", "Restaurant1.JPG"];
  let index = 0;
  let timer;
  images.forEach((src) => { const image = new Image(); image.src = src; });
  const show = (next) => {
    index = next;
    hero.style.backgroundImage = `url("${images[index]}")`;
    dots.querySelectorAll("button").forEach((dot, i) => dot.classList.toggle("active", i === index));
  };
  images.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show hotel image ${i + 1}`);
    dot.addEventListener("click", () => { show(i); restart(); });
    dots.append(dot);
  });
  const restart = () => {
    clearInterval(timer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => show((index + 1) % images.length), 5500);
  };
  show(0);
  restart();
}

function initGallery() {
  const buttons = [...document.querySelectorAll(".gallery button")];
  const dialog = document.getElementById("lightbox");
  const display = dialog.querySelector("img");
  let index = 0;
  const show = (next) => {
    index = (next + buttons.length) % buttons.length;
    const image = buttons[index].querySelector("img");
    display.src = image.src;
    display.alt = image.alt;
  };
  buttons.forEach((button, i) => button.addEventListener("click", () => { show(i); dialog.showModal(); document.body.classList.add("lightbox-open"); }));
  dialog.querySelector(".lightbox-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
  dialog.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
  dialog.addEventListener("keydown", (event) => { if (event.key === "ArrowLeft") show(index - 1); if (event.key === "ArrowRight") show(index + 1); });
}

function localDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const BOOKING_SUBMISSION_KEY = "kgh-booking-submission";
let isSubmitting = false;
let bookingSubmission = loadBookingSubmission();

function generateIdempotencyKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadBookingSubmission() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(BOOKING_SUBMISSION_KEY));
    return stored && stored.key && stored.signature ? stored : null;
  } catch {
    sessionStorage.removeItem(BOOKING_SUBMISSION_KEY);
    return null;
  }
}

function getBookingIdempotencyKey(signature) {
  if (!bookingSubmission || bookingSubmission.signature !== signature) {
    bookingSubmission = { key: generateIdempotencyKey(), signature, ended: false };
    sessionStorage.setItem(BOOKING_SUBMISSION_KEY, JSON.stringify(bookingSubmission));
  }
  return bookingSubmission.key;
}

function endBookingSubmission(success) {
  if (success) {
    bookingSubmission = null;
    sessionStorage.removeItem(BOOKING_SUBMISSION_KEY);
  } else if (bookingSubmission) {
    bookingSubmission.ended = true;
    sessionStorage.setItem(BOOKING_SUBMISSION_KEY, JSON.stringify(bookingSubmission));
  }
}

async function parseBackendResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      try { data = await response.json(); } catch { data = null; }
    } else {
      await response.text();
    }
  }
  if (!response.ok) throw new Error(fallbackMessage);
  return data || {};
}

async function apiFetch(path, options = {}) {
  if (!BACKEND_URL || !BACKEND_URL.startsWith("https://")) throw new Error("The booking service is not configured securely.");
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
  try {
    return await fetch(`${BACKEND_URL}${path}`, { ...options, signal: controller ? controller.signal : options.signal });
  } catch (error) {
    if (error && error.name === "AbortError") throw new Error("The booking service took too long to respond. Please try again.");
    throw new Error(navigator.onLine === false ? "You are offline. Reconnect and try again." : "The booking service could not be reached. Please try again.");
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function normalizeOrderResponse(payload) {
  const envelope = payload && typeof payload === "object" ? payload : {};
  const order = envelope.order && typeof envelope.order === "object" ? envelope.order : envelope.data?.order || envelope.data || envelope;
  return {
    success: envelope.success !== false,
    orderId: order.order_id || order.id || envelope.order_id,
    keyId: envelope.key_id || envelope.key || envelope.razorpay_key_id || envelope.data?.key_id || envelope.data?.key,
    amount: Number(order.amount ?? envelope.amount),
    currency: order.currency || envelope.currency || "INR"
  };
}

function calculateBookingTotals(checkIn, checkOut, roomType) {
  if (!checkIn || !checkOut || !ROOM_PRICES[roomType]) return null;
  const nights = Math.round((localDate(checkOut) - localDate(checkIn)) / 86400000);
  if (!Number.isInteger(nights) || nights < 1) return null;
  const billableNights = nights - Math.floor(nights / 7);
  const total = billableNights * ROOM_PRICES[roomType];
  return { nights, billableNights, total, advance: Math.round(total * .3) };
}

function initBooking() {
  const form = document.getElementById("bookingForm");
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const room = document.getElementById("room");
  const button = document.getElementById("bookingBtn");
  const message = document.getElementById("bookingMessage");
  const today = new Date();
  const dateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  checkin.min = dateString(today);

  const totals = () => calculateBookingTotals(checkin.value, checkout.value, room.value);
  const showFieldError = (field, text) => {
    let error = field.parentElement.querySelector(".field-error");
    if (!error) { error = document.createElement("small"); error.className = "field-error"; error.id = `${field.id}-error`; field.parentElement.append(error); field.setAttribute("aria-describedby", error.id); }
    error.textContent = text;
    field.setAttribute("aria-invalid", String(Boolean(text)));
  };
  const validateBooking = () => {
    const rules = [
      [document.getElementById("name"), document.getElementById("name").value.trim().length >= 2, "Enter your full name (at least 2 characters)."],
      [document.getElementById("phone"), /^(?:\+91)?[6-9]\d{9}$/.test(document.getElementById("phone").value.replace(/[\s-]/g, "")), "Enter a valid 10-digit Indian mobile number."],
      [document.getElementById("email"), document.getElementById("email").validity.valid && Boolean(document.getElementById("email").value.trim()), "Enter a valid email address."],
      [checkin, Boolean(checkin.value) && checkin.value >= dateString(new Date()), "Choose today or a future check-in date."],
      [checkout, Boolean(totals()), "Check-out must be after check-in."],
      [document.getElementById("adults"), Number.isInteger(Number(document.getElementById("adults").value)) && Number(document.getElementById("adults").value) >= 1 && Number(document.getElementById("adults").value) <= 6, "Choose between 1 and 6 adults."],
      [document.getElementById("children"), Number.isInteger(Number(document.getElementById("children").value)) && Number(document.getElementById("children").value) >= 0 && Number(document.getElementById("children").value) <= 4, "Choose between 0 and 4 children."]
    ];
    rules.forEach(([field, valid, text]) => showFieldError(field, valid ? "" : text));
    return rules.every(([, valid]) => valid);
  };
  const updatePrice = () => {
    const cost = totals();
    document.getElementById("nightsDisplay").textContent = cost ? `${cost.nights} night${cost.nights === 1 ? "" : "s"}${cost.billableNights < cost.nights ? ` (${cost.nights - cost.billableNights} free)` : ""}` : "Select dates";
    document.getElementById("totalDisplay").textContent = cost ? rupees.format(cost.total) : "—";
    document.getElementById("advanceDisplay").textContent = cost ? rupees.format(cost.advance) : "—";
  };
  checkin.addEventListener("change", () => {
    if (checkin.value) {
      const minimumCheckout = localDate(checkin.value);
      minimumCheckout.setDate(minimumCheckout.getDate() + 1);
      checkout.min = dateString(minimumCheckout);
      if (checkout.value && checkout.value < checkout.min) checkout.value = "";
    }
    updatePrice();
  });
  [checkout, room].forEach((field) => field.addEventListener("change", updatePrice));
  document.querySelectorAll('input[name="payment_method"]').forEach((input) => input.addEventListener("change", () => document.querySelector(".advance-row").hidden = input.value === "later" && input.checked));
  document.querySelectorAll(".choose-room").forEach((choose) => choose.addEventListener("click", () => { room.value = choose.dataset.room; updatePrice(); document.getElementById("booking").scrollIntoView({ behavior: "smooth" }); }));
  form.addEventListener("input", () => {
    if (bookingSubmission?.ended) {
      bookingSubmission = null;
      sessionStorage.removeItem(BOOKING_SUBMISSION_KEY);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    message.className = "form-message";
    message.replaceChildren();
    const cost = totals();
    if (!validateBooking() || !form.checkValidity()) { form.reportValidity(); message.textContent = "Please correct the highlighted booking details."; form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    if (!cost) { message.textContent = "Check-out must be at least one day after check-in."; checkout.focus(); return; }
    const paymentMethod = form.querySelector('input[name="payment_method"]:checked').value;
    const data = {
      customer_name: document.getElementById("name").value.trim(), phone: document.getElementById("phone").value.replace(/[\s-]/g, ""), email: document.getElementById("email").value.trim(), room_type: room.value,
      check_in: checkin.value, check_out: checkout.value, adults: Number(document.getElementById("adults").value), children: Number(document.getElementById("children").value), amount: cost.total,
      payment_type: paymentMethod === "advance" ? "Razorpay" : "Pay Later", special_request: document.getElementById("request").value.trim()
    };
    if (paymentMethod === "later") data.payment_status = "Pending";
    const signature = JSON.stringify({ ...data, payment_method: paymentMethod });
    const idempotencyKey = getBookingIdempotencyKey(signature);
    isSubmitting = true;
    button.disabled = true;
    button.textContent = "Please wait…";
    let checkoutOpened = false;
    try {
      if (paymentMethod === "later") {
        await createBooking(data, cost, idempotencyKey);
      } else {
        checkoutOpened = await startOnlinePayment(data, cost, idempotencyKey);
      }
    } catch (error) {
      console.error("Booking request failed:", error && error.message ? error.message : "Unknown error");
      endBookingSubmission(false);
      message.textContent = error.message || "We could not complete the booking. Please try again or call us.";
    } finally {
      if (paymentMethod === "later" || !checkoutOpened) resetBookingButton();
    }
  });
}

async function startOnlinePayment(data, cost, idempotencyKey) {
  if (!window.Razorpay) throw new Error("The secure payment service is unavailable. Please choose pay at hotel or try again.");
  if (!Number.isSafeInteger(cost.advance) || cost.advance < 1) throw new Error("The payment amount is invalid. Please reselect your dates.");
  const response = await apiFetch("/create-order", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify({ amount: cost.advance }) });
  const order = normalizeOrderResponse(await parseBackendResponse(response, "Unable to start secure payment. Please try again."));
  if (!order.success || !order.orderId || !order.keyId || !Number.isSafeInteger(order.amount) || order.amount < 1) throw new Error("The payment service returned an invalid order. Please try again.");
  const razorpay = new window.Razorpay({
    key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId, name: "Kaushalya Guest House", description: `30% advance for ${cost.nights}-night stay`, prefill: { name: data.customer_name, email: data.email, contact: data.phone }, theme: { color: "#102b28" },
    handler: async (payment) => {
      const message = document.getElementById("bookingMessage");
      try {
        await verifyRazorpayPayment(payment);
        const bookingData = { ...data, razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id, razorpay_signature: payment.razorpay_signature };
        await createBooking(bookingData, cost, idempotencyKey);
      } catch (error) {
        console.error("Payment completion failed:", error && error.message ? error.message : "Unknown error");
        if (error.bookingFinalizationFailed) {
          message.className = "form-message";
          message.textContent = `Payment was received, but booking confirmation is pending. Please contact support and provide Razorpay payment ID ${payment.razorpay_payment_id}. Do not make another payment.`;
        } else {
          message.className = "form-message";
          message.textContent = error.message || "Payment verification failed. No booking was created. Please contact support before trying again.";
        }
      } finally {
        resetBookingButton();
      }
    },
    modal: { escape: true, confirm_close: true, ondismiss: () => { document.getElementById("bookingMessage").textContent = "Payment cancelled. No booking was created; you can safely try again."; endBookingSubmission(false); resetBookingButton(); } }
  });
  razorpay.on("payment.failed", () => { document.getElementById("bookingMessage").textContent = "Payment failed. No booking was created; please try again."; endBookingSubmission(false); resetBookingButton(); });
  razorpay.open();
  return true;
}

async function verifyRazorpayPayment(paymentData) {
  const response = await apiFetch("/verify-payment", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ razorpay_order_id: paymentData.razorpay_order_id, razorpay_payment_id: paymentData.razorpay_payment_id, razorpay_signature: paymentData.razorpay_signature })
  });
  const result = await parseBackendResponse(response, "Payment verification failed. No booking was created. Please contact support before trying again.");
  if (!(result.success === true || result.verified === true || result.data?.verified === true)) throw new Error("Payment verification failed. No booking was created. Please contact support before trying again.");
  return result;
}

function resetBookingButton() {
  isSubmitting = false;
  const button = document.getElementById("bookingBtn");
  button.disabled = false;
  button.textContent = "Confirm booking";
}

function getWhatsAppBookingUrl(message) {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const text = encodeURIComponent(message);
  return isMobile
    ? `https://wa.me/916205416451?text=${text}`
    : `https://web.whatsapp.com/send?phone=916205416451&text=${text}`;
}

async function createBooking(data, cost, idempotencyKey) {
  const response = await apiFetch("/create-booking", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(data) });
  let result;
  try {
    result = await parseBackendResponse(response, "Booking could not be created. Please try again or contact support.");
    const booking = result.booking && typeof result.booking === "object" ? result.booking : result.data?.booking || result.data || result;
    result = { ...result, booking_id: booking.booking_id || booking.id || result.booking_id };
    if (result.success === false || !result.booking_id) throw new Error("Booking could not be created. Please try again or contact support.");
  } catch (error) {
    if (data.razorpay_payment_id) error.bookingFinalizationFailed = true;
    throw error;
  }

  const whatsapp = `🏨 Kaushalya Guest House\n\nBooking ID: ${result.booking_id}\nGuest: ${data.customer_name}\nPhone: ${data.phone}\nEmail: ${data.email}\nRoom: ${data.room_type}\nGuests: ${data.adults} adult(s), ${data.children} child(ren)\nCheck-in: ${data.check_in}\nCheck-out: ${data.check_out}\nNights: ${cost.nights}\nPayment: ${data.payment_type}\nTotal: ₹${data.amount}\nSpecial request: ${data.special_request || "None"}`;
  const whatsappUrl = getWhatsAppBookingUrl(whatsapp);
  const message = document.getElementById("bookingMessage");
  const whatsappLink = document.createElement("a");
  whatsappLink.href = whatsappUrl;
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.textContent = "Continue on WhatsApp (optional)";
  message.className = "form-message success";
  message.replaceChildren(document.createTextNode(`Booking ${result.booking_id} confirmed. `), whatsappLink);
  endBookingSubmission(true);
  document.getElementById("bookingForm").reset();
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

let isReviewSubmitting = false;

function initReviews() {
  const form = document.getElementById("reviewForm");
  const rating = document.getElementById("reviewRating");
  const stars = [...document.querySelectorAll("#starRating button")];
  const message = document.getElementById("reviewFormMessage");
  const text = document.getElementById("reviewText");
  const button = document.getElementById("reviewSubmitBtn");
  const setRating = (value) => {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
    rating.value = safeValue || "";
    stars.forEach((star) => { const selected = Number(star.dataset.rating) <= safeValue; star.classList.toggle("active", selected); star.setAttribute("aria-checked", String(Number(star.dataset.rating) === safeValue)); });
    document.getElementById("ratingMessage").textContent = safeValue ? `${safeValue} star${safeValue === 1 ? "" : "s"} selected.` : "Select 1 to 5 stars.";
  };
  stars.forEach((star) => { star.addEventListener("click", () => setRating(Number(star.dataset.rating))); star.addEventListener("keydown", (event) => { const current = Number(rating.value) || 1; if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setRating(Math.min(5, current + 1)); } if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setRating(Math.max(1, current - 1)); } }); });
  text.addEventListener("input", () => document.getElementById("reviewCharacterCount").textContent = text.value.length);
  loadReviews();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isReviewSubmitting) return;
    message.className = "form-message";
    const payload = { customer_name: document.getElementById("reviewName").value.trim(), customer_email: document.getElementById("reviewEmail").value.trim(), rating: Number(rating.value), review: text.value.trim() };
    if (payload.customer_name.length < 2) { message.textContent = "Please enter a name with at least 2 characters."; return; }
    if (!rating.value) { message.textContent = "Please choose a star rating."; stars[0].focus(); return; }
    if (!form.checkValidity() || payload.review.length < 10) { form.reportValidity(); message.textContent = "Please complete every review field correctly."; return; }
    isReviewSubmitting = true;
    button.disabled = true;
    button.textContent = "Submitting…";
    try {
      const response = await apiFetch("/create-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await parseBackendResponse(response, "Your review could not be submitted. Please try again.");
      if (result.success === false) throw new Error("Your review could not be submitted. Please try again.");
      form.reset(); setRating(0); document.getElementById("reviewCharacterCount").textContent = "0";
      message.className = "form-message success";
      message.textContent = "Thank you. Your review was submitted for moderation and will appear after approval.";
    } catch (error) {
      console.error(error);
      message.textContent = error.message || "Your review could not be submitted. Please try again.";
    } finally {
      isReviewSubmitting = false;
      button.disabled = false;
      button.textContent = "Submit review";
    }
  });
}

async function loadReviews() {
  const container = document.getElementById("reviewsContainer");
  try {
    const response = await apiFetch("/reviews");
    const result = await parseBackendResponse(response, "Guest reviews are temporarily unavailable.");
    const reviews = Array.isArray(result) ? result : (Array.isArray(result.reviews) ? result.reviews : []);
    container.replaceChildren();
    if (!reviews.length) {
      const empty = document.createElement("p");
      empty.textContent = "No guest reviews have been published yet.";
      container.append(empty);
      return;
    }
    reviews.forEach(renderReview);
  } catch (error) {
    console.error(error);
    const unavailable = document.createElement("p");
    unavailable.textContent = "Guest reviews are temporarily unavailable.";
    container.replaceChildren(unavailable);
  }
}

function renderReview(review) {
  const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating) || 1)));
  const article = document.createElement("article");
  article.className = "testimonial";
  const stars = document.createElement("div"); stars.className = "stars"; stars.setAttribute("aria-label", `${rating} out of 5 stars`); stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
  const quote = document.createElement("blockquote"); quote.textContent = `“${String(review.review ?? review.text ?? "")}”`;
  const byline = document.createElement("p"); byline.textContent = `— ${String(review.customer_name ?? review.name ?? "Guest")}`;
  article.append(stars, quote, byline);
  document.getElementById("reviewsContainer").append(article);
}

function initRevealAnimations() {
  if (!("IntersectionObserver" in window)) return;
  const elements = document.querySelectorAll(".room-card, .feature-grid article, .testimonial, .section-heading, .split-image, .split-copy");
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .12 });
  elements.forEach((element) => { element.classList.add("reveal"); observer.observe(element); });
}

// Small, side-effect-free surface used by the production regression suite.
window.KGH_TEST = Object.freeze({ calculateBookingTotals, normalizeOrderResponse, getWhatsAppBookingUrl });
