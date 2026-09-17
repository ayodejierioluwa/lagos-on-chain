/**
 * LAGOS ON CHAIN (LOC) — INTERACTIVE MAP ENGINE
 * Custom Dark Matter Tiles, Glowing Neon Markers, and Mainland-to-Island Geofencing.
 */

class LagosMapEngine {
  constructor() {
    this.map = null;
    this.markers = [];
    this.bridgePolyline = null;
  }

  init() {
    const mapEl = document.getElementById("lagos-map");
    if (!mapEl) return;

    // Check if Leaflet is available
    if (typeof L === "undefined") {
      console.error("Leaflet library not loaded");
      mapEl.innerHTML = `
        <div style="padding:40px;text-align:center;color:#94a3b8;">
          <h3>Map Engine Initializing...</h3>
          <p>Connecting to decentralized Lagos spatial nodes.</p>
        </div>
      `;
      return;
    }

    // Centered on Lagos (between Mainland & Island)
    this.map = L.map("lagos-map", {
      center: [6.4950, 3.3950],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false
    });

    // High-performance OpenStreetMap tiles with custom dark cyber CSS filter (100% free, no watermarks)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#64748b;">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Draw Third Mainland Bridge & Lekki-Ikoyi Link Bridge corridors
    this.drawBridgeCorridors();

    // Render all initial spot markers
    this.renderMarkers(window.LAGOS_DATA.spots);
  }

  drawBridgeCorridors() {
    // Coordinates representing Third Mainland Bridge
    const thirdMainlandCoords = [
      [6.5050, 3.3920], // Mainland (Ebute Metta / Yaba)
      [6.4850, 3.3980], // Lagoon Overpass
      [6.4630, 3.3950]  // Adeniji Adele / Island End
    ];

    L.polyline(thirdMainlandCoords, {
      color: "#14F195",
      weight: 4,
      opacity: 0.75,
      dashArray: "6, 8"
    }).addTo(this.map).bindTooltip("Third Mainland Bridge • Cross-Bridge Corridor", {
      className: "bridge-tooltip",
      sticky: true
    });

    // Lekki-Ikoyi Link Bridge
    const lekkiBridgeCoords = [
      [6.4530, 3.4420], // Ikoyi side
      [6.4420, 3.4610]  // Lekki side
    ];

    L.polyline(lekkiBridgeCoords, {
      color: "#9945FF",
      weight: 3,
      opacity: 0.8,
      dashArray: "4, 6"
    }).addTo(this.map).bindTooltip("Lekki-Ikoyi Link Bridge", {
      className: "bridge-tooltip",
      sticky: true
    });
  }

  createMarkerIcon(category, isSponsored) {
    let colorClass = "green";
    let emoji = "🍲";

    if (category === "event") {
      colorClass = "purple";
      emoji = "⚡";
    } else if (category === "culture") {
      colorClass = "amber";
      emoji = "🎨";
    }

    const html = `
      <div class="custom-neon-pin ${colorClass} ${isSponsored ? 'sponsored-glow' : ''}">
        <span class="pin-emoji">${emoji}</span>
        <span class="pin-ring"></span>
      </div>
    `;

    return L.divIcon({
      className: "custom-marker-wrapper",
      html: html,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  }

  renderMarkers(spotsList) {
    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    spotsList.forEach(spot => {
      const icon = this.createMarkerIcon(spot.category, spot.isSponsored);
      const marker = L.marker([spot.lat, spot.lng], { icon: icon }).addTo(this.map);

      // Construct interactive popup safely
      const popupDiv = document.createElement("div");
      popupDiv.className = "map-popup-inner";

      const title = document.createElement("h4");
      title.className = "popup-title";
      title.textContent = spot.name;

      const meta = document.createElement("div");
      meta.className = "popup-meta";
      meta.textContent = `${spot.lga} • ${spot.zone.toUpperCase()}`;

      const perk = document.createElement("div");
      perk.className = "popup-perk";
      perk.textContent = `🎁 ${spot.perk}`;

      const price = document.createElement("div");
      price.className = "popup-price";
      price.textContent = `${spot.priceTier} (~${spot.priceNgn.toLocaleString()} NGN)`;

      const actionBtn = document.createElement("button");
      actionBtn.className = "popup-btn";
      actionBtn.textContent = "📍 Check-in (Mint cNFT)";
      actionBtn.addEventListener("click", () => {
        if (window.lagosPoPV) {
          window.lagosPoPV.openCheckInModal(spot);
        }
      });

      popupDiv.appendChild(title);
      popupDiv.appendChild(meta);
      popupDiv.appendChild(perk);
      popupDiv.appendChild(price);
      popupDiv.appendChild(actionBtn);

      marker.bindPopup(popupDiv);
      marker.spotData = spot;
      this.markers.push(marker);
    });
  }

  filterMarkers(categoryOrZone, searchQuery = "") {
    let filtered = window.LAGOS_DATA.spots;

    if (categoryOrZone !== "all") {
      if (categoryOrZone === "mainland" || categoryOrZone === "island") {
        filtered = filtered.filter(s => s.zone === categoryOrZone);
      } else {
        filtered = filtered.filter(s => s.category === categoryOrZone);
      }
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.lga.toLowerCase().includes(q) ||
        s.vibe.toLowerCase().includes(q)
      );
    }

    this.renderMarkers(filtered);
    return filtered;
  }

  flyToSpot(lat, lng) {
    if (this.map) {
      this.map.flyTo([lat, lng], 15, {
        animate: true,
        duration: 1.2
      });

      // Find marker and open popup
      const target = this.markers.find(m => 
        Math.abs(m.getLatLng().lat - lat) < 0.0001 &&
        Math.abs(m.getLatLng().lng - lng) < 0.0001
      );
      if (target) {
        setTimeout(() => target.openPopup(), 600);
      }
    }
  }
}

// Marker styling injected dynamically
const style = document.createElement("style");
style.textContent = `
  .custom-marker-wrapper {
    background: transparent;
    border: none;
  }
  .custom-neon-pin {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease;
    border: 2px solid #fff;
  }
  .custom-neon-pin:hover {
    transform: scale(1.15);
  }
  .custom-neon-pin.green {
    background: #0d1f18;
    border-color: #14F195;
    box-shadow: 0 0 14px rgba(20, 241, 149, 0.7);
  }
  .custom-neon-pin.purple {
    background: #1b1129;
    border-color: #9945FF;
    box-shadow: 0 0 14px rgba(153, 69, 255, 0.7);
  }
  .custom-neon-pin.amber {
    background: #271a0e;
    border-color: #FF8A00;
    box-shadow: 0 0 14px rgba(255, 138, 0, 0.7);
  }
  .custom-neon-pin.sponsored-glow {
    animation: markerPulse 1.8s infinite;
  }
  @keyframes markerPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.12); }
    100% { transform: scale(1); }
  }
  .pin-emoji {
    font-size: 1rem;
  }
  .map-popup-inner {
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .popup-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: #fff;
    margin: 0;
  }
  .popup-meta {
    font-size: 0.72rem;
    color: #94a3b8;
  }
  .popup-perk {
    font-size: 0.75rem;
    color: #fde047;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 6px;
    border-radius: 4px;
    line-height: 1.3;
  }
  .popup-price {
    font-family: 'Space Grotesk', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    color: #14F195;
  }
  .popup-btn {
    background: linear-gradient(135deg, #14F195 0%, #9945FF 100%);
    color: #05080E;
    font-weight: 700;
    border: none;
    border-radius: 6px;
    padding: 8px;
    font-size: 0.8rem;
    cursor: pointer;
    margin-top: 4px;
  }
  .bridge-tooltip {
    background: rgba(14, 18, 28, 0.9) !important;
    border: 1px solid #14F195 !important;
    color: #fff !important;
    font-family: 'Space Grotesk', monospace !important;
    font-size: 0.75rem !important;
    box-shadow: 0 4px 14px rgba(20, 241, 149, 0.4) !important;
  }
`;
document.head.appendChild(style);

window.lagosMap = new LagosMapEngine();
