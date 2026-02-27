# eco-car
🌱 Carbon Wise
Most car platforms stop at "zero tailpipe emissions" Carbon Wise looks at the whole story.
A vehicle’s carbon footprint doesn't start at the dealership; it starts at the mine and ends at the scrapyard. I built Carbon Wise to cut through the marketing noise and show the real environmental impact of our cars from the CO₂ generated during battery manufacturing to the energy used for every mile driven.

💡 Why I Built This
I didn’t want my first full-stack project to be just another "To-Do" list. I wanted to tackle a real-world mess: the confusion surrounding EV vs. ICE (Internal Combustion Engine) sustainability. Carbon Wise is designed to help people make decisions based on data, not just slogans, by calculating the "breakeven point" where an EV’s manufacturing debt is finally paid off by its efficiency.

🚗 Key Features
1. Full Lifecycle Tracking: Compare cars by make, model, and year with a focus on manufacturing, operational, and disposal emissions.
2. The "Breakeven" Calculator: See exactly how many years or miles it takes for an EV to become cleaner than its gas-powered counterpart.
3. Granular Breakdowns: Visualizations that separate the "hidden" emissions (like battery production) from the "obvious" ones (fuel/electricity).
4. Direct Comparisons: Side-by-side snapshots of EV vs. ICE impact over 10+ years.

🛠 The Tech Behind the Data
To keep the app fast and the data accurate, I used a modern stack focused on performance and clean API design:

1. Frontend: Built with React and Vite for a snappy UI, styled with Tailwind CSS.

2. Backend: A high-performance FastAPI (Python) server to handle complex emission calculations.

3. Data Pipeline: I built a custom JSON enrichment pipeline to process and clean lifecycle emission datasets, ensuring the comparisons stay grounded in scientific reality.
📁 Project Structure
eco-car/
├── frontend/          # React + Vite UI
├── backend/           # FastAPI API
├── data-processing/   # Data cleaning & emission calculations

⚙️ How to Run It Locally
1. Backend
cd backend
uvicorn main:app --reload

Runs on:
http://localhost:8000

2. Frontend
cd frontend
npm install
npm run dev

Runs on:
http://localhost:5173

What Makes It Different
Instead of focusing only on tailpipe emissions, Carbon Wise includes:
Battery manufacturing impact
Lifecycle analysis
Long-term emission comparison
Transparent metrics
It’s built as a learning project, but with a real-world problem in mind.
Future Plans

User-adjustable mileage input

Country-based electricity grid modeling

Better ranking algorithms

Deployment with live API
