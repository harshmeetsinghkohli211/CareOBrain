# CareOBrain

**AI Cognitive Companion & Clinical Rehabilitation Platform (Smrithi Sathi)**

🚀 **Live Deployment:** [https://harshmeetsinghkohli211.github.io/CareOBrain/](https://harshmeetsinghkohli211.github.io/CareOBrain/)

An interactive cognitive training, neuro-rehabilitation, and clinical decision support system.

## Features
- **Targeted Therapy & Medication**: Rehabilitation pathways for Alzheimer's, Stroke, Parkinson's, MCI, and Brain Trauma.
- **Doctor Clinical Decision Support (Neo4j CDS)**: Medical scan report intake, OCR extraction, knowledge graph traversal, and ranked treatment prescriptions.
- **Prescription Care Plan**: Real-time synchronization between doctor recommendations and patient daily routine.
- **Interactive Mini-Games**: Joint Mobility Challenge, ROM Exercises, Pattern Recall, and cognitive therapies.
- **Multilingual Support**: English, Hindi (हिंदी), Assamese (অসমীয়া), Bengali (বাংলা), Manipuri (মৈতৈলোন্), and Mizo (Mizo ṭawng).

## Run Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+ (for Neo4j CDS backend)

### 1. Frontend & Client Portal
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### 2. Doctor CDS Backend (Optional for standalone graph reasoning)
```bash
cd neo4j-cds
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
