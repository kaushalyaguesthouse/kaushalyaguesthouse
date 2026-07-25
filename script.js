/* ===========================================
   KAUSHALYA GUEST HOUSE
   SCRIPT v7
=========================================== */

// ============================
// EMAILJS INITIALIZATION
// ============================

if (typeof emailjs !== "undefined") {
    emailjs.init("XkkCrNFvEe1DQzBvG");
}



const BACKEND_URL = "https://kaushalya-
// ============================
// DARK MODE
// ============================

const darkBtn = document.getElementById("darkBtn");

if (darkBtn) {

    darkBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        darkBtn.innerHTML =
            document.body.classList.contains("dark")
            ? "☀️"
            : "🌙";

    });

}

// ============================
// LANGUAGE BUTTON
// ============================

const langBtn = document.getElementById("langBtn");

let english = true;

if (langBtn) {

    langBtn.addEventListener("click", () => {

        english = !english;

        if (english) {

            langBtn.innerHTML = "हिन्दी";

            document.querySelector(".hero h1").innerHTML =
                "Kaushalya Guest House";

            document.querySelector(".hero p").innerHTML =
                "Comfortable Stay in the Heart of Gomoh";

        }

        else {

            langBtn.innerHTML = "English";

            document.querySelector(".hero h1").innerHTML =
                "कौशल्या गेस्ट हाउस";

            document.querySelector(".hero p").innerHTML =
                "गोमो के मुख्य बाजार में आरामदायक ठहराव";

        }

    });

}

// ============================
// HERO IMAGE SLIDER
// ============================

const hero = document.querySelector(".hero");

if (hero) {

    const heroImages = [

        "Outside front.jpg",
        "Reception.jpg",
        "Room3.JPG",
        "Restaurant1.JPG"

    ];

    let heroIndex = 0;

    hero.style.backgroundImage =
        `url('${heroImages[0]}')`;

    setInterval(() => {

        heroIndex++;

        if (heroIndex >= heroImages.length) {

            heroIndex = 0;

        }

        hero.style.backgroundImage =
            `url('${heroImages[heroIndex]}')`;

    }, 5000);

}

// ============================
// GALLERY LIGHTBOX
// ============================

const galleryImages =
document.querySelectorAll(".gallery img");

const lightbox =
document.createElement("div");

lightbox.style.cssText = `
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,.92);
display:none;
justify-content:center;
align-items:center;
z-index:999999;
cursor:pointer;
`;

lightbox.innerHTML = `
<img
style="
max-width:92%;
max-height:92%;
border-radius:16px;
box-shadow:0 15px 45px rgba(0,0,0,.4);
">
`;

document.body.appendChild(lightbox);

const lightImage =
lightbox.querySelector("img");

galleryImages.forEach(img=>{

img.addEventListener("click",()=>{

lightbox.style.display="flex";

lightImage.src=img.src;

});

});

lightbox.onclick=()=>{

lightbox.style.display="none";

};

// ============================
// DATE VALIDATION
// ============================

const checkin =
document.getElementById("checkin");

const checkout =
document.getElementById("checkout");

if(checkin && checkout){

const today =
new Date().toISOString().split("T")[0];

checkin.min=today;

checkin.addEventListener("change",()=>{

checkout.min=checkin.value;

});

}

// ============================
// BOOKING FORM
// ============================

const form = document.getElementById("bookingForm");
const bookingBtn = document.getElementById("bookingBtn");

if (form) {

form.addEventListener("submit", async function (e) {

e.preventDefault();

bookingBtn.disabled = true;
bookingBtn.innerHTML = "Please Wait...";

try {

const room = document.getElementById("room").value;

const roomPrice =
room === "AC Room"
? 1500
: 1200;

const paymentMethod =
document.querySelector(
'input[name="payment_method"]:checked'
).value;

const bookingData = {

customer_name:
document.getElementById("name").value.trim(),

phone:
document.getElementById("phone").value.trim(),

email:
document.getElementById("email").value.trim(),

room_type:
room,

check_in:
document.getElementById("checkin").value,

check_out:
document.getElementById("checkout").value,

adults:
parseInt(document.getElementById("adults").value) || 1,

children:
parseInt(document.getElementById("children").value) || 0,

amount:
roomPrice,

payment_type:
paymentMethod === "advance"
? "Advance Payment"
: "Pay Later",

payment_status:"Pending",

razorpay_payment_id:null,

special_request:
document.getElementById("request").value

};

// ============================
// PAY LATER
// ============================

if(paymentMethod==="later"){

await createBooking(bookingData);

bookingBtn.disabled=false;
bookingBtn.innerHTML="Confirm Booking";

return;

}

// ============================
// CREATE RAZORPAY ORDER
// ============================

const orderResponse =
await fetch(
BACKEND_URL + "/create-order",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

amount: roomPrice * 0.30

})

}

);

const order = await orderResponse.json();

if (!orderResponse.ok || !order.success) {
    throw new Error(
        order.message || "Unable to create order"
    );
}

const options={

key: order.key_id,

amount:order.amount,

currency:"INR",

order_id:order.order_id,

name:"Kaushalya Guest House",

description:"Advance Booking",

handler:async function(response){

bookingData.payment_status="Paid";

bookingData.razorpay_payment_id=
response.razorpay_payment_id;

await createBooking(bookingData);

},

prefill:{

name:bookingData.customer_name,

email:bookingData.email,

contact:bookingData.phone

},

theme:{

color:"#0B2545"

}

};

const razor=new Razorpay(options);

razor.on("payment.failed",function(){

alert("Payment Failed");

bookingBtn.disabled=false;
bookingBtn.innerHTML="Confirm Booking";

});

razor.open();

}

catch(error){

console.error(error);

alert(error.message);

bookingBtn.disabled=false;
bookingBtn.innerHTML="Confirm Booking";

}

});

}

// ============================
// CREATE BOOKING
// ============================

async function createBooking(data){

try{

const response = await fetch(

BACKEND_URL + "/create-booking",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(data)

}

);

const result = await response.json();

if(!result.success){

throw new Error(result.message || "Booking Failed");

}

// ============================
// EMAIL CONFIRMATION
// ============================

const emailParams={

customer_name:data.customer_name,

customer_email:data.email,

booking_id:result.booking_id,

room_type:data.room_type,

check_in:data.check_in,

check_out:data.check_out,

payment_type:data.payment_type,

amount:data.amount

};

try{

await emailjs.send(

"service_k4u106n",

"template_gmf6drc",

emailParams

);

console.log("Email Sent");

}catch(emailError){

console.log("Email Error:",emailError);

}

// ============================
// WHATSAPP
// ============================

const message =

`🏨 Kaushalya Guest House

Booking ID : ${result.booking_id}

Guest : ${data.customer_name}

Phone : ${data.phone}

Email : ${data.email}

Room : ${data.room_type}

Adults : ${data.adults}

Children : ${data.children}

Check In : ${data.check_in}

Check Out : ${data.check_out}

Payment : ${data.payment_type}

Status : ${data.payment_status}

Amount : ₹${data.amount}

Special Request :
${data.special_request || "None"}
`;

alert(

`Booking Confirmed!

Booking ID:
${result.booking_id}

Thank you for choosing
Kaushalya Guest House.`

);

const whatsappURL =
"https://wa.me/916205416451?text=" +
encodeURIComponent(message);

// Redirect to WhatsApp
window.location.href = whatsappURL;

form.reset();

bookingBtn.disabled = false;

bookingBtn.innerHTML = "Confirm Booking";

}

catch(error){

console.error(error);

alert(error.message || "Server Error");

bookingBtn.disabled=false;

bookingBtn.innerHTML="Confirm Booking";

}

}
// ============================
// GUEST REVIEW SYSTEM
// ============================

const reviewForm =
document.getElementById("reviewForm");

const reviewName =
document.getElementById("reviewName");

const reviewEmail =
document.getElementById("reviewEmail");

const reviewRating =
document.getElementById("reviewRating");

const reviewText =
document.getElementById("reviewText");

const reviewSubmitBtn =
document.getElementById("reviewSubmitBtn");

const reviewFormMessage =
document.getElementById("reviewFormMessage");

const ratingMessage =
document.getElementById("ratingMessage");

const ratingStars =
document.querySelectorAll(".rating-star");

const reviewCharacterCount =
document.getElementById("reviewCharacterCount");

const reviewsContainer =
document.getElementById("reviewsContainer");

const averageRating =
document.getElementById("averageRating");

const averageStars =
document.getElementById("averageStars");

const reviewCount =
document.getElementById("reviewCount");

// ============================
// SELECT STAR RATING
// ============================

if (ratingStars.length > 0) {

ratingStars.forEach(star => {

star.addEventListener("click", () => {

const selectedRating =
Number(star.dataset.rating);

reviewRating.value =
String(selectedRating);

ratingStars.forEach(currentStar => {

const currentRating =
Number(currentStar.dataset.rating);

const isSelected =
currentRating <= selectedRating;

currentStar.classList.toggle(
"active",
isSelected
);

currentStar.classList.toggle(
"selected",
isSelected
);

});

if (ratingMessage) {

ratingMessage.textContent =
`${selectedRating} star${
selectedRating === 1 ? "" : "s"
} selected`;

}

});

});

}

// ============================
// REVIEW CHARACTER COUNT
// ============================

if (reviewText && reviewCharacterCount) {

reviewText.addEventListener("input", () => {

reviewCharacterCount.textContent =
String(reviewText.value.length);

});

}

// ============================
// SUBMIT GUEST REVIEW
// ============================

if (reviewForm) {

reviewForm.addEventListener(
"submit",
async function (event) {

event.preventDefault();

const selectedRating =
Number(reviewRating.value);

if (
!Number.isInteger(selectedRating) ||
selectedRating < 1 ||
selectedRating > 5
) {

reviewFormMessage.textContent =
"Please select a star rating.";

reviewFormMessage.style.color =
"#c0392b";

return;

}

reviewSubmitBtn.disabled = true;

reviewSubmitBtn.textContent =
"Submitting Review...";

reviewFormMessage.textContent = "";

try {

const response = await fetch(
BACKEND_URL + "/create-review",
{

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({

customer_name:
reviewName.value.trim(),

customer_email:
reviewEmail.value.trim(),

rating:
selectedRating,

review:
reviewText.value.trim()

})

}
);

const result = await response.json();

if (!response.ok || !result.success) {

throw new Error(
result.message ||
"Unable to submit your review."
);

}

reviewFormMessage.textContent =
"Thank you! Your review has been submitted and will appear after approval.";

reviewFormMessage.style.color =
"#188038";

reviewForm.reset();

reviewRating.value = "";

ratingStars.forEach(star => {

star.classList.remove("active");

});

if (ratingMessage) {

ratingMessage.textContent =
"Tap a star to select your rating.";

}

if (reviewCharacterCount) {

reviewCharacterCount.textContent = "0";

}

}
catch (error) {

console.error(
"REVIEW SUBMISSION ERROR:",
error
);

reviewFormMessage.textContent =
error.message ||
"Unable to submit your review.";

reviewFormMessage.style.color =
"#c0392b";

}
finally {

reviewSubmitBtn.disabled = false;

reviewSubmitBtn.textContent =
"Submit Review";

}

}
);

}

// ============================
// CREATE REVIEW CARD
// ============================

function createReviewCard(review) {

const card =
document.createElement("article");

card.className = "review-card";

const stars =
document.createElement("div");

stars.className =
"review-card-stars";

stars.textContent =
"★".repeat(review.rating) +
"☆".repeat(5 - review.rating);

const reviewContent =
document.createElement("p");

reviewContent.className =
"review-card-text";

reviewContent.textContent =
review.review;

const footer =
document.createElement("div");

footer.className =
"review-card-footer";

const guestName =
document.createElement("span");

guestName.className =
"review-card-name";

guestName.textContent =
review.customer_name;

const reviewDate =
document.createElement("span");

if (review.created_at) {

reviewDate.textContent =
new Date(
review.created_at
).toLocaleDateString(
"en-IN",
{
day: "numeric",
month: "short",
year: "numeric"
}
);

}

footer.appendChild(guestName);

footer.appendChild(reviewDate);

card.appendChild(stars);

card.appendChild(reviewContent);

card.appendChild(footer);

// Owner reply

if (
review.owner_reply &&
String(review.owner_reply).trim()
) {

const ownerReply =
document.createElement("div");

ownerReply.className =
"owner-reply";

const ownerTitle =
document.createElement("strong");

ownerTitle.textContent =
"Kaushalya Guest House";

const ownerText =
document.createElement("p");

ownerText.textContent =
review.owner_reply;

ownerReply.appendChild(ownerTitle);

ownerReply.appendChild(ownerText);

card.appendChild(ownerReply);

}

return card;

}

// ============================
// DISPLAY REVIEW SUMMARY
// ============================

function updateReviewSummary(reviews) {

const totalReviews =
reviews.length;

if (totalReviews === 0) {

averageRating.textContent = "New";

averageStars.textContent = "☆☆☆☆☆";

reviewCount.textContent =
"Be the first guest to leave a review";

return;

}

const totalRating =
reviews.reduce(
(total, review) =>
total + Number(review.rating),
0
);

const calculatedAverage =
totalRating / totalReviews;

averageRating.textContent =
calculatedAverage.toFixed(1);

const roundedAverage =
Math.round(calculatedAverage);

averageStars.textContent =
"★".repeat(roundedAverage) +
"☆".repeat(5 - roundedAverage);

reviewCount.textContent =
`Based on ${totalReviews} approved guest review${
totalReviews === 1 ? "" : "s"
}`;

}

// ============================
// LOAD APPROVED REVIEWS
// ============================

async function loadApprovedReviews() {

if (!reviewsContainer) {

return;

}

try {

const response = await fetch(
BACKEND_URL + "/reviews"
);

const result = await response.json();

if (!response.ok || !result.success) {

throw new Error(
result.message ||
"Unable to load reviews."
);

}

const reviews =
Array.isArray(result.reviews)
? result.reviews
: [];

reviewsContainer.innerHTML = "";

updateReviewSummary(reviews);

if (reviews.length === 0) {

const emptyState =
document.createElement("div");

emptyState.className =
"reviews-empty-state";

const emptyIcon =
document.createElement("span");

emptyIcon.textContent = "⭐";

const emptyText =
document.createElement("p");

emptyText.textContent =
"Approved guest reviews will appear here.";

emptyState.appendChild(emptyIcon);

emptyState.appendChild(emptyText);

reviewsContainer.appendChild(
emptyState
);

return;

}

reviews.forEach(review => {

reviewsContainer.appendChild(
createReviewCard(review)
);

});

}
catch (error) {

console.error(
"LOAD REVIEWS ERROR:",
error
);

reviewsContainer.innerHTML = "";

const errorState =
document.createElement("div");

errorState.className =
"reviews-empty-state";

const errorText =
document.createElement("p");

errorText.textContent =
"Guest reviews are temporarily unavailable.";

errorState.appendChild(errorText);

reviewsContainer.appendChild(
errorState
);

}

}

loadApprovedReviews();
// ============================
// ADVANCE AMOUNT
// ============================

const roomSelect=
document.getElementById("room");

const advanceBox=
document.getElementById("advanceAmount");

if(roomSelect && advanceBox){

roomSelect.addEventListener("change",()=>{

if(roomSelect.value==="AC Room"){

advanceBox.innerHTML=
"Advance Amount : ₹450";

}

else{

advanceBox.innerHTML=
"Advance Amount : ₹360";

}

});

}

// ============================
// SCROLL ANIMATION
// ============================

const sections=
document.querySelectorAll("section");

const observer=new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},

{

threshold:.15

}

);

sections.forEach(section=>{

observer.observe(section);

});

// ============================
// BACK TO TOP BUTTON
// ============================

const topButton=document.createElement("button");

topButton.className="backTop";

topButton.innerHTML='<i class="fa-solid fa-arrow-up"></i>';

document.body.appendChild(topButton);

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

topButton.style.display="flex";

}else{

topButton.style.display="none";

}

});

topButton.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

// ============================
// PAGE LOADED
// ============================

window.addEventListener("load",()=>{

console.log("Kaushalya Guest House v7 Loaded Successfully");

});
