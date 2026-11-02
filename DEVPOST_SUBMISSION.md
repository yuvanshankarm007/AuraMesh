# Devpost Submission Story: AuraMesh AI

### Tagline
Autonomous Multi-Agent Skin Diagnostic & VTO Concierge with Bidirectional Negotiation.

---

### Inspiration
Walking into a beauty department store or browsing an online skincare catalogue is overwhelming. Consumers often buy multiple trendy active ingredients (e.g. strong AHA exfoliants combined with harsh retinoids) that destroy their acid mantle and cause severe breakouts. Concurrently, cosmetic shade mismatch results in over **30% return rates** in e-commerce.

We asked: *What if e-commerce wasn't just a flat search bar, but an ensemble of expert AI specialists collaborating on your behalf?* An aesthetician diagnosing your skin, a pharmacologist ensuring chemical safety, a makeup artist matching your exact undertone via AR, and a smart commerce concierge keeping the whole bundle strictly under budget.

---

### What It Does
**AuraMesh AI** is an autonomous e-commerce concierge powered by **Perfect Corp’s YouCam APIs** and an enterprise-grade multi-agent bidirectional web:

1. **Precision Diagnostic Telemetry:** Users take a selfie or select a persona. The Dermatology Agent queries the YouCam Skin Analysis API to assess 7 parameters: acne, pores, texture, wrinkles, spots, dark circles, and redness, calculating biological skin age and barrier health.
2. **Clinical Formulation & Vehicle Constraints:** The Formulation Agent synthesizes a personalized AM/PM regimen while enforcing contraindication rules (e.g. no drying alcohols, no comedogenic waxes). It commands the Stylist Agent to only use lightweight water-gel cosmetic vehicles.
3. **Harmonized Virtual Try-On (VTO):** The Stylist Agent matches the user’s detected undertone (Warm, Cool, Neutral, or Olive) and applies YouCam VTO foundation, blush, and lip shades with an interactive before-and-after split view.
4. **Autonomous Peer Negotiation:** If the aggregated basket exceeds the user’s budget, the Commerce Agent negotiates peer-to-peer with the Formulation Agent to identify bio-equivalent ingredient substitutes (e.g. replacing expensive encapsulated retinal with clinical Bakuchiol dupe), recovering savings and achieving consensus without human intervention.

---

### How We Built It
* **Bidirectional Web Topology:** Structured across 3 vertical tiers (Tier 1 Executive/Governance, Tier 2 Domain Specialist Peer Web, Tier 3 Grounded Workers). Edges support two-way message passing, hop-count monitoring (`MAX_HOPS = 4`), and vector clock correlation.
* **YouCam API Integration:** Integrated YouCam’s `/task/skin-analysis` and `/task/makeup-vto` endpoints using an asynchronous task-polling pattern and pre-signed upload channels.
* **Zero-Crash Demo Guard:** Following the `sponsor-api-guard` standard, every sponsor API call is protected with a 6-second timeout, error boundary, and instant fallback to realistic clinical mock vectors so live demos never fail.
* **Modern Stack:** React 19, TypeScript, Tailwind CSS, Lucide icons, and Canvas Confetti.

---

### Challenges We Ran Into
* **Preventing Circular Loops in Decentralized Peer Webs:** When agents can freely message horizontal peers, cyclic ping-pong negotiations (e.g. Commerce asking for discounts $\leftrightarrow$ Formulation re-adding actives) can occur. We resolved this by building a Tier 1 **Convergence Monitor** that tracks monotonic hop counts and forces arbitration if negotiations exceed 4 hops.
* **Harmonizing Clinical Diagnostics with Cosmetic Finishes:** Ensuring the makeup try-on finish (dewy vs satin vs matte) dynamically adapts to the dermatology agent's barrier integrity rating.

---

### Accomplishments We're Proud Of
* Fully functioning, end-to-end multi-agent orchestration that completes in under 3 seconds in the browser.
* Real-time SVG topology visualizer rendering glowing message flow and directional edges as agents deliberate.
* Zero build errors and clean responsive layout that works flawlessly on desktop and mobile.

---

### What We Learned
* How to orchestrate agentic systems that transcend simple sequential chains (DAGs) into rich bidirectional negotiation graphs.
* The power and accuracy of Perfect Corp's YouCam facial landmark and skin analysis engine for real-world retail workflows.

---

### What's Next for AuraMesh AI
1. **Dynamic Shopify & WooCommerce App Store Plugin:** Direct 1-click embed for cosmetic brand storefronts.
2. **Longitudinal Progress Tracking (ChronoSkin):** Comparing Day 1 vs Day 30 YouCam skin selfies to verify active ingredient efficacy over time.
3. **Multi-Modal Voice Consultation:** Allowing users to talk to the CEO Orchestrator via real-time conversational audio.
