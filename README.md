# EstateIQ AI - AI-Powered Real Estate Investment Advisor

EstateIQ AI is a premium, production-quality decision-support platform engineered for Real Estate Investment Managers in the luxury Dubai market. Designed with a Bloomberg-meets-Vercel dashboard aesthetic, this platform bridges real estate metrics, financial underwriting, and AI-enabled client relationship workflows.

This project is built to demonstrate deep business value, sales-enablement capabilities, and technical excellence in real estate placement interviews.

---

## 🚀 Key Business Features (MVP)

1. **Vercel-Inspired Landing Page**: High-impact hero page with animated statistics (curated property count, 97% prediction accuracy, 8.9% average yields).
2. **Executive Overview Dashboard**: Active indicators of total listings, clients, average yields, and sorted community investment hotspots.
3. **Property Directory & Comparison**: 
   - A filtered list of **45 curated Dubai listings** across Palm Jumeirah, Downtown Dubai, Dubai Marina, JBR, Business Bay, JVC, and Dubai Hills Estate.
   - Select up to 3 properties to compare side-by-side. The interface calculates and highlights the optimal asset for each metric (lowest price, highest yield, highest score).
4. **Weighted Investment Score**: circular indicators showcasing a weighted metric (30% Yield, 25% Appreciation, 15% Infrastructure, 10% Developer Rating, 10% Demand, 10% Liquidity). Proximity metrics dynamically calculate the neighborhood infrastructure rating.
5. **"Explain Like an Investment Manager" (AI Pitch)**: Analyzes client preferences (budget, risk tolerance, goals) to generate structured investor theses and copyable client email drafts.
6. **Objection Handling Simulator**: A sales-enablement training block. Managers select common buyer objections (e.g., "Price too high", "Yield is low", "Not Emaar", "Far from Metro"), and the AI compiles persuasive, metric-backed rebuttals based on the specific asset.
7. **CRM Client Profiles & drag-and-drop Kanban Board**: 
   - Manage client profiles with logged meeting notes and follow-ups.
   - Advance deals dynamically across 6 stages (*New Lead, Contacted, Meeting Scheduled, Negotiation, Closed, Lost*) using native HTML5 drag-and-drop, syncing state to the database in real-time.
8. **Underwriting Calculators**: ROI cash flow calculations and mortgage principal amortization schedules visualized with area charts.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript), Tailwind CSS, Framer Motion, Recharts, Leaflet / React Leaflet, Lucide Icons.
- **Backend**: FastAPI (Python 3.11), Uvicorn, Pydantic, Pandas.
- **Database**: PostgreSQL (psycopg2 pool).
- **AI Integrations**: OpenAI API (GPT-4o-mini).

---

## 💻 Local Setup & Run Instructions

### 1. Database Configuration
Ensure a local PostgreSQL instance is running on port `5432`.
Create a `.env` file in the root folder using the template below. Replace the `DB_PASSWORD` placeholder with your local database password:

```env
DB_PASSWORD="your_postgres_password"
OPENAI_API_KEY="your_openai_api_key"
```

To initialize the schema and automatically seed the database with the 45 curated Dubai properties, CRM profiles, and pipeline stages:
```bash
pip install psycopg2-binary
python database/seed.py
```

### 2. Run the FastAPI Backend
Install backend packages and start the API server:
```bash
pip install -r backend/requirements.txt
python -m backend.main
```
The backend server will run on `http://127.0.0.1:8000`.

### 3. Run the Next.js Frontend
Navigate to the frontend directory, install dependencies, and run the developer server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. Bypassing login can be performed instantly via the **Demo Login** button.

---

## 📂 Project Structure
```
EstateIQ-AI/
├── database/            # Schema declarations & python seeder script
│   ├── schema.sql
│   └── seed.py
├── backend/             # FastAPI backend
│   ├── routes/          # API routers (properties, crm, advisor)
│   ├── main.py          # CORS setup & app runner
│   ├── db.py            # psycopg2 pool manager
│   ├── models.py        # Pydantic schemas
│   └── requirements.txt
└── frontend/            # Next.js frontend
    ├── src/
    │   ├── app/         # Pages router shell
    │   ├── components/  # Reusable Map UI components
    │   └── ...
    └── package.json
```
