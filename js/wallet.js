/**
 * LAGOS ON CHAIN (LOC) — WALLET & SOLANA ADAPTER ENGINE
 * Supports Phantom, Solflare, and Non-Crypto Youth Social Login (Privy/Web3Auth model)
 * with a built-in Dev Faucet for testing live on-chain check-ins and ticket bookings.
 */

class LagosWalletAdapter {
  constructor() {
    this.state = {
      isConnected: false,
      walletType: null, // 'phantom' | 'solflare' | 'social'
      publicKey: null,
      balanceSol: 0,
      balanceUsdc: 0,
      network: "Solana Devnet (Simulation)"
    };

    this.initFromStorage();
  }

  initFromStorage() {
    try {
      const saved = localStorage.getItem("loc_wallet_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isConnected && parsed.publicKey) {
          this.state = parsed;
          this.updateUI();
        }
      }
    } catch (e) {
      console.warn("Storage read error:", e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem("loc_wallet_state", JSON.stringify(this.state));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  }

  connect(type) {
    let mockAddr = "";
    if (type === "phantom") {
      mockAddr = "Gidi7X" + Math.random().toString(36).substring(2, 8) + "Phantom" + Math.random().toString(36).substring(2, 6);
    } else if (type === "solflare") {
      mockAddr = "Flare9" + Math.random().toString(36).substring(2, 8) + "Solflare" + Math.random().toString(36).substring(2, 6);
    } else {
      mockAddr = "youth_privy_" + Math.random().toString(36).substring(2, 10) + ".sol";
    }

    this.state.isConnected = true;
    this.state.walletType = type;
    this.state.publicKey = mockAddr;
    
    // Initial dev balance if empty
    if (this.state.balanceSol === 0) {
      this.state.balanceSol = 1.85;
      this.state.balanceUsdc = 45.00;
    }

    this.saveToStorage();
    this.updateUI();
    this.dispatchWalletEvent("wallet:connected", this.state);
    return this.state;
  }

  disconnect() {
    this.state.isConnected = false;
    this.state.walletType = null;
    this.state.publicKey = null;
    this.saveToStorage();
    this.updateUI();
    this.dispatchWalletEvent("wallet:disconnected", null);
  }

  airdropFaucet() {
    if (!this.state.isConnected) {
      this.connect("phantom");
    }
    this.state.balanceSol = parseFloat((this.state.balanceSol + 1.0).toFixed(3));
    this.state.balanceUsdc = parseFloat((this.state.balanceUsdc + 25.0).toFixed(2));
    this.saveToStorage();
    this.updateUI();
    this.dispatchWalletEvent("wallet:balanceUpdated", this.state);
    return {
      sol: this.state.balanceSol,
      usdc: this.state.balanceUsdc
    };
  }

  deductFunds(solAmount, usdcAmount = 0) {
    if (this.state.balanceSol < solAmount && this.state.balanceUsdc < usdcAmount) {
      return false;
    }
    if (solAmount > 0) {
      this.state.balanceSol = Math.max(0, parseFloat((this.state.balanceSol - solAmount).toFixed(3)));
    }
    if (usdcAmount > 0) {
      this.state.balanceUsdc = Math.max(0, parseFloat((this.state.balanceUsdc - usdcAmount).toFixed(2)));
    }
    this.saveToStorage();
    this.updateUI();
    this.dispatchWalletEvent("wallet:balanceUpdated", this.state);
    return true;
  }

  updateUI() {
    const btn = document.getElementById("wallet-btn");
    const btnLabel = document.getElementById("wallet-btn-label");
    const passportChip = document.getElementById("passport-wallet-chip");
    const passportHandle = document.getElementById("passport-user-handle");

    if (!btn || !btnLabel) return;

    if (this.state.isConnected) {
      btn.classList.add("connected");
      const short = this.state.publicKey.slice(0, 4) + "..." + this.state.publicKey.slice(-4);
      btnLabel.textContent = `${short} (${this.state.balanceSol} SOL)`;
      
      if (passportChip) {
        passportChip.textContent = this.state.publicKey;
      }
      if (passportHandle) {
        passportHandle.textContent = this.state.walletType === "social" 
          ? this.state.publicKey 
          : "gidi_" + this.state.publicKey.slice(0, 5).toLowerCase() + ".sol";
      }
    } else {
      btn.classList.remove("connected");
      btnLabel.textContent = "Connect Wallet";
      if (passportChip) passportChip.textContent = "Not Connected (Tap Connect)";
      if (passportHandle) passportHandle.textContent = "gidi_guest.sol";
    }
  }

  dispatchWalletEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

window.lagosWallet = new LagosWalletAdapter();
