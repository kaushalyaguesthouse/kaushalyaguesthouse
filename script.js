"use strict";

const BACKEND_URL = "https://kaushalya-backend.onrender.com";
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

  const totals = () => {
    if (!checkin.value || !checkout.value) return null;
    const nights = Math.round((localDate(checkout.value) - localDate(checkin.value)) / 86400000);
    if (nights < 1) return null;
    const billableNights = nights - Math.floor(nights / 7);
    const total = billableNights * ROOM_PRICES[room.value];
    return { nights, billableNights, total, advance: Math.round(total * .3) };
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
    if (!form.checkValidity()) { form.reportValidity(); message.textContent = "Please complete all required fields correctly."; return; }
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
    try {
      if (paymentMethod === "later") {
        await createBooking(data, cost, idempotencyKey);
      } else {
        await startOnlinePayment(data, cost, idempotencyKey);
        return;
      }
    } catch (error) {
      console.error(error);
      message.textContent = error.message || "We could not complete the booking. Please try again or call us.";
    } finally {
      if (paymentMethod === "later") resetBookingButton();
    }
  });
}

async function startOnlinePayment(data, cost, idempotencyKey) {
  if (!window.Razorpay) throw new Error("The secure payment service is unavailable. Please choose pay at hotel or try again.");
  const response = await fetch(`${BACKEND_URL}/create-order`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: cost.advance }) });
  const order = await parseBackendResponse(response, "Unable to start secure payment. Please try again.");
  if (!order.success || !order.order_id) throw new Error("Unable to start secure payment. Please try again.");
  const razorpay = new window.Razorpay({
    key: order.key_id, amount: order.amount, currency: "INR", order_id: order.order_id, name: "Kaushalya Guest House", description: `30% advance for ${cost.nights}-night stay`, prefill: { name: data.customer_name, email: data.email, contact: data.phone }, theme: { color: "#102b28" },
    handler: async (payment) => {
      const message = document.getElementById("bookingMessage");
      try {
        await verifyRazorpayPayment(payment);
        const bookingData = { ...data, razorpay_order_id: payment.razorpay_order_id, razorpay_payment_id: payment.razorpay_payment_id, razorpay_signature: payment.razorpay_signature };
        await createBooking(bookingData, cost, idempotencyKey);
      } catch (error) {
        console.error(error);
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
    modal: { ondismiss: () => { endBookingSubmission(false); resetBookingButton(); } }
  });
  razorpay.on("payment.failed", () => { document.getElementById("bookingMessage").textContent = "Payment failed. No booking was created; please try again."; endBookingSubmission(false); resetBookingButton(); });
  razorpay.open();
}

async function verifyRazorpayPayment(paymentData) {
  const response = await fetch(`${BACKEND_URL}/verify-payment`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ razorpay_order_id: paymentData.razorpay_order_id, razorpay_payment_id: paymentData.razorpay_payment_id, razorpay_signature: paymentData.razorpay_signature })
  });
  const result = await parseBackendResponse(response, "Payment verification failed. No booking was created. Please contact support before trying again.");
  if (!result.success) throw new Error("Payment verification failed. No booking was created. Please contact support before trying again.");
  return result;
}

function resetBookingButton() {
  isSubmitting = false;
  const button = document.getElementById("bookingBtn");
  button.disabled = false;
  button.textContent = "Confirm booking";
}

async function createBooking(data, cost, idempotencyKey) {
  const response = await fetch(`${BACKEND_URL}/create-booking`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(data) });
  let result;
  try {
    result = await parseBackendResponse(response, "Booking could not be created. Please try again or contact support.");
    if (!result.success || !result.booking_id) throw new Error("Booking could not be created. Please try again or contact support.");
  } catch (error) {
    if (data.razorpay_payment_id) error.bookingFinalizationFailed = true;
    throw error;
  }

  const whatsapp = `🏨 Kaushalya Guest House\n\nBooking ID: ${result.booking_id}\nGuest: ${data.customer_name}\nPhone: ${data.phone}\nEmail: ${data.email}\nRoom: ${data.room_type}\nGuests: ${data.adults} adult(s), ${data.children} child(ren)\nCheck-in: ${data.check_in}\nCheck-out: ${data.check_out}\nNights: ${cost.nights}\nPayment: ${data.payment_type}\nTotal: ₹${data.amount}\nSpecial request: ${data.special_request || "None"}`;
  const message = document.getElementById("bookingMessage");
  const whatsappLink = document.createElement("a");
  whatsappLink.href = `https://wa.me/916205416451?text=${encodeURIComponent(whatsapp)}`;
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener";
  whatsappLink.textContent = "Continue on WhatsApp (optional)";
  message.className = "form-message success";
  message.replaceChildren(document.createTextNode(`Booking ${result.booking_id} confirmed. `), whatsappLink);
  endBookingSubmission(true);
  document.getElementById("bookingForm").reset();
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
      const response = await fetch(`${BACKEND_URL}/create-review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
    const response = await fetch(`${BACKEND_URL}/reviews`);
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
