# ⚡ Lagos On Chain (LOC) — Gidi Radar & Solana Lifestyle OS

> **Transforming Lagos youth culture, nightlife, street dining, and underground events into a high-speed, on-chain lifestyle economy powered by Solana.**

![Solana](https://img.shields.io/badge/Network-Solana%20Devnet-14F195?style=for-the-badge&logo=solana)
![License](https://img.shields.io/badge/License-MIT-9945FF?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20MVP-FF8A00?style=for-the-badge)

---

## 🌟 The Vision

Nigeria ranks **#2 globally in crypto adoption** (Chainalysis). Millions of Nigerian youth already use crypto daily to bypass traditional banking bottlenecks (failed POS machines at venues, high transaction fees, and currency devaluation). 

**Lagos On Chain** gives youth a reason to spend, explore, and flex on-chain locally:
1. **The Gidi Radar Map**: An interactive, high-contrast dark cyber map featuring curated underground checkpoints across the Mainland (Yaba, Surulere, Ikeja) and Island (Victoria Island, Lekki, Ikoyi).
2. **Under ₦10,000 Food Radar**: Hand-curated food joints (Korede Spaghetti, Glover Court Suya, Amala Shitta, White House) offering exclusive perks and discounts for on-chain visitors.
3. **Solana Actions & Blinks**: 1-click social ticketing directly inside Twitter/X feeds and WhatsApp. Zero bank app delays, instant compressed NFT (cNFT) ticket passes.
4. **Proof-of-Physical-Vibe (PoPV)**: Geofenced venue check-in via dynamic NFC/QR pucks, rewarding real exploration with collectible cNFT explorer badges.
5. **Sustainable Founder Cash Flow**: Automated 3.5% ticketing commission routed directly to the founder treasury on every transaction.

---

## 🛠️ Architecture & Tech Stack

```
lagos_on_chain/
├── index.html          # Semantic HTML5 shell with responsive tabs & modal drawers
├── styles/
│   └── main.css        # Cyber-Lagos dark aesthetic, glassmorphic cards, responsive grid
├── js/
│   ├── data.js         # Curated database of 25+ real Lagos spots & underground events
│   ├── map.js          # Leaflet map engine with clean dark tiles & custom glowing pins
│   ├── wallet.js       # Solana wallet adapter (Phantom, Solflare, Social Privy/Web3Auth) + Faucet
│   ├── popv.js         # Proof-of-Physical-Vibe NFC/QR validation & zero-gas cNFT minting
│   ├── blinks.js       # Dialect-compliant Solana Action cards for 1-click ticketing
│   └── app.js          # Master orchestrator, search/filter, and Founder Treasury telemetry
└── server.py           # Zero-dependency local Python HTTP server with clean CORS
```

* **Frontend**: Vanilla HTML5, Modern Vanilla CSS (No heavy framework overhead, <5MB total footprint).
* **Mapping**: Leaflet.js with high-performance dark tiles & custom SVG glowing pins.
* **Web3 Integration**: Solana Wallet Adapter with Phantom, Solflare, and Web3Auth/Privy simulated social login for non-crypto users.
* **Transactions**: Solana Actions & Blinks (Dialect spec) + State Compression (cNFTs).

---

## 🚀 Quick Start & Local Run

### Prerequisites
* Python 3.8+ (for zero-dependency local serving)
* Any modern web browser or mobile browser

### 1. Clone the repository
```bash
git clone https://github.com/ayodejierioluwa/lagos-on-chain.git
cd lagos-on-chain
```

### 2. Start the local server
```bash
python3 server.py
```

### 3. Open in Browser
Visit **`http://localhost:8080`** in your browser.

---

## 🎟️ Testing the Features

1. **Claim Test SOL & USDC**: Click the **🚰 Faucet** button in the header.
2. **Explore the Map**: Filter by *Mainland*, *Island*, *Under ₦10k Food*, or *Events*.
3. **Mint a PoPV Badge**: Click **Scan PoPV NFC / Check-in** to simulate physical venue verification.
4. **1-Click Blink Ticketing**: Head to **Events & Blinks** and purchase a ticket pass to *Street Souk 2026* to inspect the dynamic anti-scalp ticket pass.
5. **Inspect Founder Economics**: Open the **Founder Revenue** tab to see your 3.5% commission credited in real time.

---

## 🤝 Target Ecosystem Collaborators

* **Superteam Nigeria**: Driving local consumer Solana adoption through developer grants.
* **Youth Event Collectives**: Street Souk, STIIM, Mainland BlockParty, WAFFLESNCREAM.
* **Local Food Merchants**: Fast, zero-POS-failure payments via Solana Pay.

---

## 📄 License

MIT License © 2026 Erioluwa Ayodeji & Lagos On Chain Contributors.
