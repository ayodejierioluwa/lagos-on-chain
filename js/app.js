/**
 * LAGOS ON CHAIN (LOC) — MASTER APPLICATION ORCHESTRATOR
 * Coordinates map views, discovery feeds, wallet interactions, and treasury tracking.
 */

class LagosApp {
  constructor() {
    this.currentTab = "radar";
    this.currentFilter = "all";
    this.currentSubFilter = "all";
    this.searchQuery = "";

    this.treasury = {
      volumeNgn: 8450000,
      founderEarnedNgn: 295750,
      founderEarnedSol: 1.89
    };

    this.loadTreasury();
  }

  init() {
    // Setup Top Navigation
    this.setupTabs();

    // Setup Wallet & Faucet Handlers
    this.setupWalletEvents();

    // Setup Filter Pills & Search
    this.setupFilters();

    // Populate Sidebar Feed & Under-10k Grid
    this.renderSpotsSidebar(window.LAGOS_DATA.spots);
    this.renderUnder10kGrid(window.LAGOS_DATA.spots);

    // Initialize Blinks & Passport
    window.lagosBlinks.renderBlinksFeed();
    window.lagosPoPV.updatePassportUI();

    // Initialize Map
    if (window.lagosMap) {
      window.lagosMap.init();
    }

    // Modal listeners
    this.setupModalListeners();

    // Update Counter badge
    const countAllEl = document.getElementById("count-all");
    if (countAllEl) countAllEl.textContent = window.LAGOS_DATA.spots.length;

    console.log("⚡ Lagos On Chain (LOC) Initialized Successfully.");
  }

  setupTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        const btn = e.target.closest(".nav-tab") || tab;
        const targetView = btn.dataset.tab;
        this.switchTab(targetView);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active tab buttons
    document.querySelectorAll(".nav-tab").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === tabId);
    });

    // Update active view sections
    document.querySelectorAll(".tab-view").forEach(v => {
      v.classList.toggle("active", v.id === `view-${tabId}`);
    });

    // Refresh map size if switching to radar
    if (tabId === "radar" && window.lagosMap && window.lagosMap.map) {
      setTimeout(() => {
        window.lagosMap.map.invalidateSize();
      }, 100);
    }
  }

  setupFilters() {
    // Main radar filter pills
    const pills = document.querySelectorAll(".filter-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentFilter = pill.dataset.filter;
        this.applyRadarFilters();
      });
    });

    // Search Box
    const searchInput = document.getElementById("radar-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value;
        this.applyRadarFilters();
      });
    }

    // Under-10k Subfilters
    const subPills = document.querySelectorAll(".pill-btn");
    subPills.forEach(sp => {
      sp.addEventListener("click", () => {
        subPills.forEach(p => p.classList.remove("active"));
        sp.classList.add("active");
        this.currentSubFilter = sp.dataset.subfilter;
        this.renderUnder10kGrid(window.LAGOS_DATA.spots);
      });
    });
  }

  applyRadarFilters() {
    const filtered = window.lagosMap.filterMarkers(this.currentFilter, this.searchQuery);
    this.renderSpotsSidebar(filtered);
  }

  renderSpotsSidebar(spots) {
    const feed = document.getElementById("spots-feed");
    if (!feed) return;

    feed.innerHTML = "";

    if (spots.length === 0) {
      feed.innerHTML = `
        <div style="text-align:center; padding: 24px; color: #64748b;">
          <p>No spots match your search query.</p>
        </div>
      `;
      return;
    }

    spots.forEach(spot => {
      const card = document.createElement("div");
      card.className = "spot-mini-card";
      
      card.innerHTML = `
        <div class="spot-mini-header">
          <span class="spot-mini-name">${spot.name}</span>
          <span class="spot-tier-chip">${spot.priceTier}</span>
        </div>
        <div class="spot-mini-lga">📍 ${spot.lga} • <span style="text-transform:uppercase;">${spot.zone}</span></div>
        <div class="spot-mini-perk">🎁 ${spot.perk}</div>
        <div class="spot-mini-actions">
          <span class="price-tag">₦${spot.priceNgn.toLocaleString()}</span>
          <button class="btn-checkin-mini" data-spot-id="${spot.id}">Check-in</button>
        </div>
      `;

      // Click card to fly on map
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-checkin-mini")) {
          window.lagosPoPV.openCheckInModal(spot);
        } else {
          window.lagosMap.flyToSpot(spot.lat, spot.lng);
        }
      });

      feed.appendChild(card);
    });
  }

  renderUnder10kGrid(allSpots) {
    const grid = document.getElementById("under10k-grid");
    if (!grid) return;

    grid.innerHTML = "";
    let foodSpots = allSpots.filter(s => s.category === "under10k");

    if (this.currentSubFilter !== "all") {
      foodSpots = foodSpots.filter(s => s.subCategory === this.currentSubFilter);
    }

    foodSpots.forEach(spot => {
      const card = document.createElement("div");
      card.className = "food-card";

      const approxSol = (spot.priceNgn / (window.LAGOS_DATA.market.solUsd * window.LAGOS_DATA.market.usdcNgn)).toFixed(3);
      const approxUsdc = (spot.priceNgn / window.LAGOS_DATA.market.usdcNgn).toFixed(2);

      card.innerHTML = `
        <span class="food-card-badge">${spot.priceTier}</span>
        <div>
          <h3 class="food-card-title">${spot.name}</h3>
          <div class="food-card-lga">📍 ${spot.lga} • ${spot.zone.toUpperCase()}</div>
          <p class="food-card-desc">${spot.vibe}</p>
          <div class="food-card-perk-box">
            <span class="perk-label">VERIFIED GIDI PERK</span>
            <span class="perk-detail">${spot.perk}</span>
          </div>
        </div>

        <div class="food-card-footer">
          <div class="food-price-stack">
            <span class="food-naira-price">₦${spot.priceNgn.toLocaleString()}</span>
            <span class="food-crypto-price">~${approxSol} SOL / $${approxUsdc} USDC</span>
          </div>
          <button class="btn btn-secondary-glass" onclick="window.lagosApp.flyAndCheckIn('${spot.id}')">
            <span>📍 Map & Check-in</span>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  flyAndCheckIn(spotId) {
    const spot = window.LAGOS_DATA.spots.find(s => s.id === spotId);
    if (!spot) return;

    this.switchTab("radar");
    setTimeout(() => {
      window.lagosMap.flyToSpot(spot.lat, spot.lng);
    }, 200);
  }

  setupWalletEvents() {
    const walletBtn = document.getElementById("wallet-btn");
    const faucetBtn = document.getElementById("faucet-btn");
    const walletModal = document.getElementById("wallet-modal");

    if (walletBtn) {
      walletBtn.addEventListener("click", () => {
        if (window.lagosWallet.state.isConnected) {
          window.lagosWallet.disconnect();
          window.showToast("Wallet Disconnected", "purple");
        } else {
          walletModal.classList.add("open");
        }
      });
    }

    if (faucetBtn) {
      faucetBtn.addEventListener("click", () => {
        const bal = window.lagosWallet.airdropFaucet();
        window.showToast(`🚰 Faucet Airdrop: +1.0 SOL & +$25 USDC added! (Balance: ${bal.sol} SOL)`, "green");
      });
    }

    // Modal Wallet Selectors
    document.getElementById("connect-phantom")?.addEventListener("click", () => {
      window.lagosWallet.connect("phantom");
      walletModal.classList.remove("open");
      window.showToast("🟣 Connected to Phantom Wallet (Devnet)", "green");
    });

    document.getElementById("connect-solflare")?.addEventListener("click", () => {
      window.lagosWallet.connect("solflare");
      walletModal.classList.remove("open");
      window.showToast("🔥 Connected to Solflare Wallet", "green");
    });

    document.getElementById("connect-social")?.addEventListener("click", () => {
      window.lagosWallet.connect("social");
      walletModal.classList.remove("open");
      window.showToast("🌐 Youth Social Pass Activated (No Seed Phrase Needed)", "green");
    });
  }

  setupModalListeners() {
    // Quick check-in button on map
    document.getElementById("quick-checkin-btn")?.addEventListener("click", () => {
      window.lagosPoPV.openCheckInModal(window.LAGOS_DATA.spots[0]);
    });

    // Checkin modal close
    document.getElementById("checkin-modal-close")?.addEventListener("click", () => {
      window.lagosPoPV.closeModal();
    });

    // Confirm Mint
    document.getElementById("confirm-mint-btn")?.addEventListener("click", () => {
      window.lagosPoPV.confirmMint();
    });

    // Blink modal close
    document.getElementById("blink-modal-close")?.addEventListener("click", () => {
      document.getElementById("blink-modal")?.classList.remove("open");
    });

    // Wallet modal close
    document.getElementById("wallet-modal-close")?.addEventListener("click", () => {
      document.getElementById("wallet-modal")?.classList.remove("open");
    });
  }

  loadTreasury() {
    try {
      const saved = localStorage.getItem("loc_founder_treasury");
      if (saved) {
        this.treasury = JSON.parse(saved);
        this.updateTreasuryUI();
      }
    } catch (e) {
      console.warn("Treasury load error:", e);
    }
  }

  creditTreasury(volumeSol, founderCutSol, founderCutNgn) {
    const volNgn = volumeSol * window.LAGOS_DATA.market.solUsd * window.LAGOS_DATA.market.usdcNgn;
    this.treasury.volumeNgn += Math.round(volNgn);
    this.treasury.founderEarnedNgn += Math.round(founderCutNgn);
    this.treasury.founderEarnedSol = parseFloat((this.treasury.founderEarnedSol + founderCutSol).toFixed(3));

    try {
      localStorage.setItem("loc_founder_treasury", JSON.stringify(this.treasury));
    } catch (e) {
      console.warn("Treasury save error:", e);
    }
    this.updateTreasuryUI();
  }

  updateTreasuryUI() {
    const volEl = document.getElementById("treasury-volume-display");
    const earnEl = document.getElementById("treasury-founder-earnings");

    if (volEl) volEl.textContent = `₦${this.treasury.volumeNgn.toLocaleString()}`;
    if (earnEl) earnEl.textContent = `₦${this.treasury.founderEarnedNgn.toLocaleString()}`;
  }
}

// Global Toast System
window.showToast = function(message, theme = "green") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${theme === "purple" ? "toast-purple" : ""}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Initialize on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  window.lagosApp = new LagosApp();
  window.lagosApp.init();
});
