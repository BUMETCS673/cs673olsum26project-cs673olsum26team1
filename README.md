# Bariatric Path
## Overview
A web-based clinical workflow platform that digitizes and centralizes the bariatric surgery evaluation process. The system replaces fragmented tools like spreadsheets, phone calls, and paper checklists with a unified platform for patients, coordinators, and program directors.

Patients can track their evaluation progress through a self-service portal, coordinators can manage and update patient statuses from a centralized dashboard, and program directors gain real-time visibility into the overall evaluation pipeline.

## Core Features

### Patient Portal
- Secure login via Firebase Authentication
- View evaluation progress across all clinical stages
- Submit required patient information
- BMI calculation and eligibility check
- View next steps in the bariatric evaluation process

### Coordinator Dashboard
- View and manage all patient evaluations
- Search patients by:
  - Name
  - MRN
  - Date of birth
- Filter patients by:
  - Insurance type
  - Specialist type
- Update patient status across evaluation stages
- Assign and track specialist recommendations

### Evaluation Workflow System
- Multi-stage bariatric evaluation pipeline:
  - Surgeon evaluation
  - Psychology evaluation
  - Dietitian evaluation
  - Endoscopic evaluation
- Centralized tracking of patient progress
- Structured status updates per evaluation stage

### Clinical Logic & Recommendations
- BMI-based eligibility assessment (≥ 27 threshold)
- Specialist recommendation logic based on patient data
- Standardized evaluation rules across the system

## Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express REST API  
- **Database:** PostgreSQL with Prisma ORM  
- **Authentication:** Firebase Authentication  
- **Testing:** Jest, React Testing Library, Cypress/Playwright  
- **Version Control:** Git + GitHub  
- **CI/CD:** GitHub Actions  
- **Containerization:** Docker  
- **Code Quality:** ESLint  
- **Security Testing:** OWASP ZAP  
- **Deployment:** DigitalOcean  
- **Project Management:** Jira  
- **IDE:** Visual Studio Code  

## Notes

- Prisma is used for database modeling and persistence  
- Shared utility functions ensure consistent BMI calculations  
- All protected routes require authentication  
- Patient progress is persisted in PostgreSQL  

## Team Members

- Shaima Nimeri — Requirements Lead, Design/Implementation Lead, Team Lead  
- Fatimah Hassan — Security Lead, Configuration Lead  
- Kolya Gavlisin — QA Lead, Design/Implementation Lead  
- Kai Fernandes — Team Lead, Configuration Lead  
- Jianing Li — Requirement Lead