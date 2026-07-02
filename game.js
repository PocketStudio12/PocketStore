import { auth, db } from "./firebase-config.js";

import {
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ==========================
// Get Game ID
// ==========================

const params = new URLSearchParams(location.search);
const gameId = params.get("id");

// ==========================
// Elements
// ==========================

const image = document.getElementById("image");
const name = document.getElementById("name");
const description = document.getElementById("description");
const devices = document.getElementById("devices");
const buyArea = document.getElementById("buyArea");
const shareBtn = document.getElementById("shareBtn");
const backBtn = document.getElementById("backBtn");

// Back Button
backBtn.onclick = () => {
    location.href = "index.html";
};

// ==========================
// Load Game
// ==========================

async function loadGame() {

    const snap = await get(ref(db, "games/" + gameId));

    if (!snap.exists()) {

        name.textContent = "Game Not Found";
        return;

    }

    const game = snap.val();

    // Share Button
    if (shareBtn) {
        shareBtn.onclick = () => shareGame(gameId);
    }

    // Game Info
    image.src = game.image;
    name.textContent = game.name;
    description.textContent = game.description || "";

    // Devices
    devices.innerHTML = "";

    let canBuy = false;

    Object.keys(game.devices || {}).forEach(device => {

        const d = game.devices[device];

        if (!d.enabled) return;

        const div = document.createElement("div");
        div.className = "device";

        if (d.link && d.link.trim() !== "") {

            canBuy = true;
            div.textContent = "✅ " + device;

        } else {

            div.textContent = "⏳ " + device + " (Coming Soon)";

        }

        devices.appendChild(div);

    });

    // Purchase Check

    let purchased = false;

    if (auth.currentUser) {

        const libSnap = await get(
            ref(
                db,
                "users/" +
                auth.currentUser.uid +
                "/library/" +
                gameId
            )
        );

        purchased = libSnap.exists();

    }

    // Buy Area

    if (purchased) {

        buyArea.innerHTML = `
            <button style="
                width:100%;
                padding:15px;
                background:#16a34a;
                color:white;
                border:none;
                border-radius:12px;
                font-size:18px;
            ">
                📚 Already Purchased
            </button>
        `;

    }
    else if (canBuy) {

        buyArea.innerHTML = `
            <h2>🪙 ${game.coin} Coins</h2>

            <button id="buyBtn">
                🛒 Add To Cart
            </button>
        `;

        document.getElementById("buyBtn").onclick = () => {
            addToCart(gameId);
        };

    }
    else {

        buyArea.innerHTML = `
            <div id="coming">
                ⏳ Coming Soon
            </div>
        `;

    }

}
// ==========================
// Add To Cart
// ==========================

async function addToCart(id) {

    if (!auth.currentUser) {

        alert("Please login first.");
        location.href = "login.html";
        return;

    }

    await set(

        ref(
            db,
            "users/" + auth.currentUser.uid + "/cart/" + id
        ),

        true

    );

    alert("✅ Added to Cart");

    location.href = "cart.html";

}

// ==========================
// Share Game
// ==========================

async function shareGame(id) {

    const snap = await get(ref(db, "games/" + id));

    if (!snap.exists()) {
        alert("Game not found.");
        return;
    }

    const game = snap.val();

    const link = `${location.origin}/game.html?id=${id}`;

    if (navigator.share) {

        try {

            await navigator.share({
                title: game.name,
                text: game.description,
                url: link
            });

        } catch (err) {
            console.log(err);
        }

    } else {

        await navigator.clipboard.writeText(link);
        alert("Game link copied!");

    }

}

// ==========================
// Start
// ==========================

loadGame();