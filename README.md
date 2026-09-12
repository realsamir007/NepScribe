# NepScribe
NepScribe is an AI-powered medical scribe designed to help doctors document patient consultations. Instead of manually writing clinical notes during or after an appointment, the system would process a consented doctor–patient conversation and generate a structured clinical note.

## Workflow

Consent-based consultation audio  
→ Speech recognition  
→ Speaker diarization  
→ Transcript cleanup  
→ Retrieval-augmented generation  
→ SOAP note draft  
→ Clinician review

## Current Features

- User registration and login
- JWT authentication
- Consultation management
- Audio upload
- Processing job creation
- PostgreSQL database
- Python AI worker
- Whisper integration planned

## Technology Stack

- React
- TypeScript
- Vite
- Express.js
- PostgreSQL
- Python
- Whisper
- LangChain
- Docker

## Project Status

Backend foundation and asynchronous processing-job workflow are implemented.