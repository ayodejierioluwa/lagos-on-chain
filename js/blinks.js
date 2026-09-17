/**
 * LAGOS ON CHAIN (LOC) — SOLANA ACTIONS & BLINKS ENGINE
 * Renders Dialect-compliant Solana Action cards for 1-click social ticketing,
 * handles transaction execution, and credits founder commissions.
 */

class LagosBlinksEngine {
  constructor() {
    this.purchasedTickets = [];
    this.loadTickets();
  }

  loadTickets() {
    try {
      const saved = localStorage.getItem("loc_purchased_tickets");
      if (saved) {
        this.purchasedTickets = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Tickets load error:", e);
    }
  }

  saveTickets() {
    try {
      localStorage.setItem("loc_purchased_tickets", JSON.stringify(this.purchasedTickets));
    } catch (e) {
      console.warn("Tickets save error:", e);
    }
  }

  renderBlinksFeed() {
    const feedEl = document.getElementById("blinks-feed");
    if (!feedEl) return;

    feedEl.innerHTML = "";
    const events = window.LAGOS_DATA.events;

    events.forEach(evt => {
      const card = document.createElement("div");
      card.className = "blink-action-card";

      // Banner section
      const banner = document.createElement("div");
      banner.className = "blink-card-banner";
      banner.style.background = evt.bannerColor;

      const tag = document.createElement("span");
      tag.className = "blink-action-tag";
      tag.textContent = "SOLANA ACTION • BLINK";
      banner.appendChild(tag);

      // Content section
      const content = document.createElement("div");
      content.className = "blink-card-content";

      const siteHeader = document.createElement("div");
      siteHeader.className = "blink-site-header";
      siteHeader.innerHTML = `<span>⚡</span><span>lagosonchain.xyz</span><span>•</span><span>${evt.organizer}</span>`;

      const title = document.createElement("h3");
      title.className = "blink-action-title";
      title.textContent = evt.title;

      const desc = document.createElement("p");
      desc.className = "blink-action-desc";
      desc.textContent = evt.desc;

      // Specs
      const specs = document.createElement("div");
      specs.className = "blink-ticket-specs";
      specs.innerHTML = `
        <div class="blink-spec-item">
          <span>DATE & TIME</span>
          <span>${evt.date}</span>
        </div>
        <div class="blink-spec-item">
          <span>LOCATION</span>
          <span>${evt.venue}</span>
        </div>
        <div class="blink-spec-item">
          <span>PRICE</span>
          <span style="color: #14F195">${evt.priceSol} SOL (~₦${evt.priceNgn.toLocaleString()})</span>
        </div>
      `;

      // Controls
      const controls = document.createElement("div");
      controls.className = "blink-action-controls";

      const btnRow = document.createElement("div");
      btnRow.className = "blink-buttons-row";

      const btn1 = document.createElement("button");
      btn1.className = "btn-blink-amount";
      btn1.textContent = `1x Ticket (${evt.priceSol} SOL)`;
      btn1.addEventListener("click", () => this.executeBlinkPurchase(evt, 1, evt.priceSol));

      const btn2 = document.createElement("button");
      btn2.className = "btn-blink-amount";
      btn2.textContent = `2x Duo Pass (${(evt.priceSol * 1.9).toFixed(2)} SOL)`;
      btn2.addEventListener("click", () => this.executeBlinkPurchase(evt, 2, (evt.priceSol * 1.9)));

      btnRow.appendChild(btn1);
      btnRow.appendChild(btn2);

      const footerNote = document.createElement("div");
      footerNote.className = "blink-footer-note";
      footerNote.innerHTML = `<span>🔒 Verified Solana Action • Anti-Scalp cNFT Ticket</span>`;

      controls.appendChild(btnRow);
      controls.appendChild(footerNote);

      content.appendChild(siteHeader);
      content.appendChild(title);
      content.appendChild(desc);
      content.appendChild(specs);
      content.appendChild(controls);

      card.appendChild(banner);
      card.appendChild(content);

      feedEl.appendChild(card);
    });
  }

  executeBlinkPurchase(evt, qty, totalSol) {
    if (!window.lagosWallet.state.isConnected) {
      window.lagosWallet.connect("phantom");
    }

    if (window.lagosWallet.state.balanceSol < totalSol) {
      if (window.showToast) {
        window.showToast(`⚠️ Insufficient SOL (${window.lagosWallet.state.balanceSol} SOL). Tap "Faucet" for test SOL!`, "purple");
      }
      return;
    }

    // Deduct SOL
    window.lagosWallet.deductFunds(totalSol, 0);

    // Calculate founder fee (3.5%)
    const founderCutSol = totalSol * 0.035;
    const founderCutNgn = totalSol * window.LAGOS_DATA.market.solUsd * window.LAGOS_DATA.market.usdcNgn * 0.035;

    // Credit treasury
    if (window.lagosApp) {
      window.lagosApp.creditTreasury(totalSol, founderCutSol, founderCutNgn);
    }

    // Generate ticket
    const ticket = {
      id: "ticket_" + Date.now(),
      eventTitle: evt.title,
      venue: evt.venue,
      date: evt.date,
      quantity: qty,
      paidSol: totalSol,
      purchasedAt: new Date().toLocaleDateString(),
      ticketHash: "TKT_" + Math.random().toString(36).substring(2, 10).toUpperCase()
    };

    this.purchasedTickets.push(ticket);
    this.saveTickets();

    // Show confirmation modal
    this.showTicketModal(ticket, evt);

    if (window.showToast) {
      window.showToast(`🎟️ Ticket confirmed on Solana! 3.5% fee sent to Founder Treasury.`, "green");
    }
  }

  showTicketModal(ticket, evt) {
    const modal = document.getElementById("blink-modal");
    const container = document.getElementById("blink-modal-card-container");
    if (!modal || !container) return;

    container.innerHTML = `
      <div style="text-align:center; padding: 10px;">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">🎟️✨</div>
        <div class="header-tag" style="margin-bottom: 6px;">OFFICIAL SOLANA TICKET PASS</div>
        <h3 style="font-size: 1.25rem; font-weight:800; margin-bottom: 4px;">${ticket.eventTitle}</h3>
        <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 16px;">${ticket.venue} • ${ticket.date}</p>

        <!-- Dynamic Simulated Ticket QR -->
        <div style="background:#fff; padding:16px; border-radius:12px; display:inline-block; margin-bottom:14px; box-shadow: 0 0 20px rgba(20,241,149,0.3);">
          <div style="width:140px; height:140px; background: repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 14px 14px; border: 4px solid #000; border-radius: 6px;"></div>
        </div>

        <div style="font-family: 'Space Grotesk', monospace; font-size: 0.9rem; font-weight:700; color: #14F195; margin-bottom: 6px;">
          ${ticket.ticketHash}
        </div>
        <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 16px;">
          Anti-Scalping cNFT Verified • Scan at Door with Venue Puck
        </div>

        <button class="btn btn-solana-primary btn-full" onclick="document.getElementById('blink-modal').classList.remove('open')">
          Save to Apple Wallet / Phantom Pass
        </button>
      </div>
    `;

    modal.classList.add("open");
  }
}

window.lagosBlinks = new LagosBlinksEngine();
