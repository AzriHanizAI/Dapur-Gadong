# Dapur Gadong — Local WhatsApp Commerce PWA (BIBD & Baiduri QR Checkout)

**Live Demo:** https://dapur-gadong.bolt.host/

## The Business Problem
Home-based food vendors, boutique fashion sellers, Instagram merchants, and F&B cafes across Bandar Seri Begawan and Gadong lose hours every day manually replying to DMs, calculating district delivery fees, copying customer addresses, and verifying bank transfer screenshots. Traditional e-commerce platforms often create too much friction for Bruneian shoppers who prefer fast, conversational WhatsApp checkouts.

## The Solution
**Dapur Gadong** is an installable Progressive Web App (PWA) designed specifically for Brunei's social-commerce buying habits:

* **Mobile-First Installable Catalog (PWA):** Customers browse menus or product collections, customize options, and manage their cart directly on their phone—with "Add to Home Screen" support for an app-like experience without App Store friction.
* **Local QR Payment & Receipt Verification Flow:** Displays merchant **BIBD QuickPay / BIBD Pay** or **Baiduri** QR codes alongside an interactive receipt uploader so buyers can attach proof of transfer during checkout.
* **Automated WhatsApp Order Payload Generator:** Formats itemized orders, quantities, delivery fees, total BND amount, and delivery addresses into a clean, structured WhatsApp message sent directly to the vendor.
* **Live Inventory & Order Logging:** Backed by a cloud database to track stock availability, order IDs, and payment statuses in real time.

## Ideal For
* Home-based food & dessert vendors (*Gerai* / Instagram kitchens)
* Cafes, bakeries, and pop-up F&B stalls
* Local fashion boutiques and pre-order sellers

## Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS (Progressive Web App / Mobile-First UI)
* **Backend & Database:** Supabase (PostgreSQL database for product catalog, order logs, and receipt storage)
* **Integrations:** WhatsApp (`wa.me`) Deep-Linking & Local Bank QR Payment Flow

---
*Built by Azri Haniz at **FlowEdge AI Enterprise** — Custom Web Apps, PWAs & AI Automation for Brunei SMEs.*
