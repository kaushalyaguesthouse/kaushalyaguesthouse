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
  if (window.emailjs) window.emailjs.init("XkkCrNFvEe1DQzBvG");
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const cost = totals();
    if (!form.checkValidity()) { form.reportValidity(); message.textContent = "Please complete all required fields correctly."; return; }
    if (!cost) { message.textContent = "Check-out must be at least one day after check-in."; checkout.focus(); return; }
    const paymentMethod = form.querySelector('input[name="payment_method"]:checked').value;
    const data = {
      customer_name: document.getElementById("name").value.trim(), phone: document.getElementById("phone").value.replace(/[\s-]/g, ""), email: document.getElementById("email").value.trim(), room_type: room.value,
      check_in: checkin.value, check_out: checkout.value, adults: Number(document.getElementById("adults").value), children: Number(document.getElementById("children").value), amount: cost.total,
      payment_type: paymentMethod === "advance" ? "Advance Payment" : "Pay Later", payment_status: "Pending", razorpay_payment_id: null, special_request: document.getElementById("request").value.trim()
    };
    button.disabled = true;
    button.textContent = "Please wait…";
    try {
      if (paymentMethod === "later") await createBooking(data, cost);
      else await startOnlinePayment(data, cost);
    } catch (error) {
      console.error(error);
      message.textContent = error.message || "We could not complete the booking. Please try again or call us.";
      button.disabled = false;
      button.textContent = "Confirm booking";
    }
  });
}

async function startOnlinePayment(data, cost) {
  if (!window.Razorpay) throw new Error("The secure payment service is unavailable. Please choose pay at hotel or try again.");
  const response = await fetch(`${BACKEND_URL}/create-order`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: cost.advance }) });
  const order = await response.json();
  if (!response.ok || !order.success) throw new Error(order.message || "Unable to start secure payment.");
  const razorpay = new window.Razorpay({ key: order.key_id, amount: order.amount, currency: "INR", order_id: order.order_id, name: "Kaushalya Guest House", description: `30% advance for ${cost.nights}-night stay`, prefill: { name: data.customer_name, email: data.email, contact: data.phone }, theme: { color: "#102b28" }, handler: async (payment) => { data.payment_status = "Paid"; data.razorpay_payment_id = payment.razorpay_payment_id; await createBooking(data, cost); }, modal: { ondismiss: resetBookingButton } });
  razorpay.on("payment.failed", () => { document.getElementById("bookingMessage").textContent = "Payment failed. No booking was created; please try again."; resetBookingButton(); });
  razorpay.open();
}

function resetBookingButton() {
  const button = document.getElementById("bookingBtn");
  button.disabled = false;
  button.textContent = "Confirm booking";
}

async function createBooking(data, cost) {
  const idempotencyKey =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const response = await fetch(`${BACKEND_URL}/create-booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Booking could not be created.");
  }

  if (window.emailjs) {
    window.emailjs
      .send("service_k4u106n", "template_gmf6drc", {
        customer_name: data.customer_name,
        customer_email: data.email,
        booking_id: result.booking_id,
        room_type: data.room_type,
        check_in: data.check_in,
        check_out: data.check_out,
        payment_type: data.payment_type,
        amount: data.amount
      })
      .catch((error) =>
        console.warn("Confirmation email could not be sent", error)
      );
  }

  const whatsapp =
    `🏨 Kaushalya Guest House\n\n` +
    `Booking ID: ${result.booking_id}\n` +
    `Guest: ${data.customer_name}\n` +
    `Phone: ${data.phone}\n` +
    `Email: ${data.email}\n` +
    `Room: ${data.room_type}\n` +
    `Guests: ${data.adults} adult(s), ${data.children} child(ren)\n` +
    `Check-in: ${data.check_in}\n` +
    `Check-out: ${data.check_out}\n` +
    `Nights: ${cost.nights}\n` +
    `Payment: ${data.payment_type}\n` +
    `Status: ${data.payment_status}\n` +
    `Total: ₹${data.amount}\n` +
    `Special request: ${data.special_request || "None"}`;

  document.getElementById("bookingMessage").classList.add("success");
  document.getElementById("bookingMessage").textContent =
    `Booking ${result.booking_id} confirmed. Opening WhatsApp…`;

  document.getElementById("bookingForm").reset();
  resetBookingButton();

  window.location.href =
    `https://wa.me/916205416451?text=${encodeURIComponent(whatsapp)}`;
}

function initReviews() {
  const form = document.getElementById("reviewForm");
  const rating = document.getElementById("reviewRating");
  const stars = [...document.querySelectorAll("#starRating button")];
  const message = document.getElementById("reviewFormMessage");
  const text = document.getElementById("reviewText");
  const setRating = (value) => {
    rating.value = value;
    stars.forEach((star) => { const selected = Number(star.dataset.rating) <= value; star.classList.toggle("active", selected); star.setAttribute("aria-checked", String(Number(star.dataset.rating) === value)); });
    document.getElementById("ratingMessage").textContent = `${value} star${value === 1 ? "" : "s"} selected.`;
  };
  stars.forEach((star) => { star.addEventListener("click", () => setRating(Number(star.dataset.rating))); star.addEventListener("keydown", (event) => { const current = Number(rating.value) || 1; if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setRating(Math.min(5, current + 1)); } if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setRating(Math.max(1, current - 1)); } }); });
  text.addEventListener("input", () => document.getElementById("reviewCharacterCount").textContent = text.value.length);
  form.addEventListener("submit", (event) => {
    event.preventDefault(); message.className = "form-message";
    if (!rating.value) { message.textContent = "Please choose a star rating."; stars[0].focus(); return; }
    if (!form.checkValidity()) { form.reportValidity(); message.textContent = "Please complete every review field correctly."; return; }
    const review = { name: document.getElementById("reviewName").value.trim(), rating: Number(rating.value), text: text.value.trim() };
    renderReview(review);
    form.reset(); setRating(0); document.getElementById("reviewCharacterCount").textContent = "0";
    message.className = "form-message success"; message.textContent = "Thank you! Your review has been added to this page.";
  });
}

function renderReview(review) {
  const article = document.createElement("article");
  article.className = "testimonial";
  const stars = document.createElement("div"); stars.className = "stars"; stars.setAttribute("aria-label", `${review.rating} out of 5 stars`); stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const quote = document.createElement("blockquote"); quote.textContent = `“${review.text}”`;
  const byline = document.createElement("p"); byline.textContent = `— ${review.name}`;
  article.append(stars, quote, byline);
  document.getElementById("reviewsContainer").prepend(article);
}

function initRevealAnimations() {
  if (!("IntersectionObserver" in window)) return;
  const elements = document.querySelectorAll(".room-card, .feature-grid article, .testimonial, .section-heading, .split-image, .split-copy");
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .12 });
  elements.forEach((element) => { element.classList.add("reveal"); observer.observe(element); });
}
