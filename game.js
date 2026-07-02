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
//back
document.getElementById("backBtn").onclick = () => {
    window.location.href = "index.html";
};

// ==========================
// Load Game
// ==========================

async function loadGame(){


    const snap =
    await get(ref(db,"games/"+gameId));

    if(!snap.exists()){

        name.textContent = "Game Not Found";

        return;

    }

    const game = snap.val();

    image.src = game.image;

    name.textContent = game.name;

    description.textContent =
    game.description || "";


    devices.innerHTML = "";


    let canBuy = false;


    Object.keys(game.devices || {}).forEach(device=>{

        const d = game.devices[device];

        if(!d.enabled) return;


        const div =
        document.createElement("div");

        div.className = "device";


        if(d.link && d.link.trim()!=""){

            canBuy = true;

            div.innerHTML =
            "✅ " + device;

        }else{

            div.innerHTML =
            "⏳ " + device + " (Coming Soon)";

        }


        devices.appendChild(div);

    });


    // ==========================
    // Buy Area
    // ==========================
    const user = auth.currentUser;

let purchased = false;


if(user){

const libSnap = await get(
ref(
db,
"users/"+user.uid+"/library/"+gameId
)
);


purchased = libSnap.exists();

}
    if(purchased){

buyArea.innerHTML = `

<button
style="
width:100%;
padding:15px;
background:#16a34a;
color:white;
border:none;
border-radius:12px;
">

📚 Already Purchased

</button>

`;

}

else if(canBuy){

        buyArea.innerHTML = `
            <h2>
                🪙 ${game.coin} Coins
            </h2>

            <button id="buyBtn">
                🛒 Add To Cart
            </button>
        `;


        document
        .getElementById("buyBtn")
        .onclick = ()=>{

            addToCart(gameId);

        };

    }else{

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

async function addToCart(id){

    if(!auth.currentUser){

        alert("Please Login First");

        location.href = "login.html";

        return;

    }


    await set(

        ref(
            db,
            "users/"+auth.currentUser.uid+"/cart/"+id
        ),

        true

    );


    alert("✅ Added To Cart");

    location.href = "cart.html";

}


// ==========================

loadGame();

// ==========================
// Check Purchase
// ==========================

purchased = false;

if(auth.currentUser){

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


// ==========================
// Buy Area
// ==========================

if(purchased){

    buyArea.innerHTML = `
        <button
        style="
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
else if(canBuy){

    buyArea.innerHTML = `
        <h2>
            🪙 ${game.coin} Coins
        </h2>

        <button id="buyBtn">
            🛒 Add To Cart
        </button>
    `;

    document
    .getElementById("buyBtn")
    .onclick = ()=>{

        addToCart(gameId);

    };

}
else{

    buyArea.innerHTML = `
        <div id="coming">

            ⏳ Coming Soon

        </div>
    `;

}

// ==========================
// Check Purchase
// ==========================

let purchased = false;

if(auth.currentUser){

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