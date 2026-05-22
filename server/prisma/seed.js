// AI-USAGE SUMMARY
// Tools: Vs Code Copilot
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation, data modeling, and sample data creation for seeding the database
// Human Contributions: prompting AI for the the sample data required, adding comments, testing the seed script,
// and ensuring data variety for comprehensive testing of search functionality
// The seed script creates a variety of users, patients, audits, and notifications
// with different attributes to test the search functionality effectively.
// Notes: I had an issue with reading the env file, so I added an explicit path to the dotenv
// config to ensure it works correctly.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (optional, for clean seeding)
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.patient.deleteMany({});
  // commented out user deletion to preserve auth functionality; can be uncommented if you want a full reset
  //await prisma.user.deleteMany({});
  console.log('Cleared existing data');

  // Create sample users
  // commented out user creation to preserve auth functionality; can be uncommented if you want a full reset
  // Note: In a real application, users would be created via the auth flow, but we create some here for testing purposes.
  /*
  const coordinator = await prisma.user.create({
    data: {
      firebaseUid: 'coordinator-001',
      name: 'Jane Coordinator',
      email: 'coordinator@example.com',
      role: 'COORDINATOR',
    },
  });

  const director = await prisma.user.create({
    data: {
      firebaseUid: 'director-001',
      name: 'Dr. John Director',
      email: 'director@example.com',
      role: 'PROGRAM_DIRECTOR',
    },
  });

  const patient = await prisma.user.create({
    data: {
      firebaseUid: 'patient-001',
      name: 'Alice Patient',
      email: 'patient@example.com',
      role: 'PATIENT',
    },
  });

  console.log('Created users:', { coordinator, director, patient });
  */

  // visitType is the specialist type assigned by BMI:
  //   "Not Eligible"                  BMI < 27
  //   "Obesity Medicine Specialist"   BMI 27-29.9
  //   "Endoscopic Obesity Specialist" BMI 30-34.9
  //   "Bariatric Surgeon"             BMI 35+
  //
  // Checklist items per specialist type (others stay "not required"):
  //   Obesity Medicine (5):   insurance, labs, consult, dietitian, psychologist
  //   Endoscopic      (7):   + endoscopy, cardiology
  //   Bariatric       (10):  + sleep, barium, hematology
  //
  // Insurance status options: "not clear" | "clear" | "self pay"
  // Checklist item status options: "not required" | "not complete" | "ordered" | "in progress" | "complete"

  const patientsData = [
    // --- Obesity Medicine Specialist (BMI 27-29.9) ---
    {
      mrn: 'MRN001',
      name: 'John Smith',
      dateOfBirth: new Date('1985-03-15'),
      bmi: 28.5,
      visitType: 'Obesity Medicine Specialist',
      insurance: 'clear',
      labs: 'complete',
      consult: 'complete',
      dietitian: 'in progress',
      psychologist: 'not complete',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN004',
      name: 'Sarah Williams',
      dateOfBirth: new Date('1992-05-08'),
      bmi: 29.3,
      visitType: 'Obesity Medicine Specialist',
      insurance: 'self pay',
      labs: 'ordered',
      consult: 'not complete',
      dietitian: 'not complete',
      psychologist: 'not complete',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN010',
      name: 'Olivia Thomas',
      dateOfBirth: new Date('1993-10-02'),
      bmi: 27.4,
      visitType: 'Obesity Medicine Specialist',
      insurance: 'clear',
      labs: 'complete',
      consult: 'complete',
      dietitian: 'complete',
      psychologist: 'ordered',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN014',
      name: 'Ava Robinson',
      dateOfBirth: new Date('1991-06-10'),
      bmi: 29.6,
      visitType: 'Obesity Medicine Specialist',
      insurance: 'clear',
      labs: 'complete',
      consult: 'ordered',
      dietitian: 'not complete',
      psychologist: 'not complete',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN016',
      name: 'Isabella Rodriguez',
      dateOfBirth: new Date('1996-03-05'),
      bmi: 28.0,
      visitType: 'Obesity Medicine Specialist',
      insurance: 'self pay',
      labs: 'ordered',
      consult: 'in progress',
      dietitian: 'not complete',
      psychologist: 'not complete',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    // --- Endoscopic Obesity Specialist (BMI 30-34.9) ---
    {
      mrn: 'MRN002',
      name: 'Mary Johnson',
      dateOfBirth: new Date('1990-07-22'),
      bmi: 32.1,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'not clear',
      labs: 'in progress',
      consult: 'ordered',
      dietitian: 'not complete',
      psychologist: 'not complete',
      endoscopy: 'not complete',
      cardiology: 'not complete',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN003',
      name: 'Michael Brown',
      dateOfBirth: new Date('1978-11-10'),
      bmi: 31.8,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'self pay',
      labs: 'complete',
      consult: 'complete',
      dietitian: 'complete',
      psychologist: 'ordered',
      endoscopy: 'in progress',
      cardiology: 'ordered',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN007',
      name: 'David Miller',
      dateOfBirth: new Date('1982-09-14'),
      bmi: 33.7,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'clear',
      labs: 'complete',
      consult: 'in progress',
      dietitian: 'ordered',
      psychologist: 'in progress',
      endoscopy: 'not complete',
      cardiology: 'not complete',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN008',
      name: 'Lisa Anderson',
      dateOfBirth: new Date('1987-06-25'),
      bmi: 30.1,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'not clear',
      labs: 'in progress',
      consult: 'ordered',
      dietitian: 'not complete',
      psychologist: 'not complete',
      endoscopy: 'not complete',
      cardiology: 'not complete',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN011',
      name: 'Daniel Harris',
      dateOfBirth: new Date('1980-02-12'),
      bmi: 34.0,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'self pay',
      labs: 'complete',
      consult: 'complete',
      dietitian: 'complete',
      psychologist: 'complete',
      endoscopy: 'complete',
      cardiology: 'complete',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN013',
      name: 'Anthony Garcia',
      dateOfBirth: new Date('1989-11-04'),
      bmi: 32.8,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'not clear',
      labs: 'not complete',
      consult: 'not complete',
      dietitian: 'not complete',
      psychologist: 'not complete',
      endoscopy: 'not complete',
      cardiology: 'not complete',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN017',
      name: 'Ethan Lewis',
      dateOfBirth: new Date('1983-12-16'),
      bmi: 33.3,
      visitType: 'Endoscopic Obesity Specialist',
      insurance: 'clear',
      labs: 'in progress',
      consult: 'complete',
      dietitian: 'ordered',
      psychologist: 'not complete',
      endoscopy: 'not complete',
      cardiology: 'not complete',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    // --- Bariatric Surgeon (BMI 35+) ---
    {
      mrn: 'MRN005',
      name: 'James Davis',
      dateOfBirth: new Date('1988-12-30'),
      bmi: 35.2,
      visitType: 'Bariatric Surgeon',
      insurance: 'clear',
      labs: 'complete',
      consult: 'complete',
      dietitian: 'complete',
      psychologist: 'complete',
      endoscopy: 'complete',
      cardiology: 'in progress',
      sleep: 'ordered',
      barium: 'not complete',
      hematology: 'not complete',
    },
    {
      mrn: 'MRN009',
      name: 'Christopher Taylor',
      dateOfBirth: new Date('1975-04-18'),
      bmi: 36.2,
      visitType: 'Bariatric Surgeon',
      insurance: 'self pay',
      labs: 'complete',
      consult: 'in progress',
      dietitian: 'ordered',
      psychologist: 'not complete',
      endoscopy: 'not complete',
      cardiology: 'not complete',
      sleep: 'not complete',
      barium: 'not complete',
      hematology: 'not complete',
    },
    {
      mrn: 'MRN015',
      name: 'Joshua Clark',
      dateOfBirth: new Date('1984-01-27'),
      bmi: 37.1,
      visitType: 'Bariatric Surgeon',
      insurance: 'clear',
      labs: 'complete',
      consult: 'complete',
      dietitian: 'in progress',
      psychologist: 'in progress',
      endoscopy: 'ordered',
      cardiology: 'not complete',
      sleep: 'ordered',
      barium: 'not complete',
      hematology: 'not complete',
    },
    // --- Not Eligible (BMI < 27) ---
    {
      mrn: 'MRN006',
      name: 'Emma Wilson',
      dateOfBirth: new Date('1995-01-20'),
      bmi: 26.4,
      visitType: 'Not Eligible',
      insurance: 'not clear',
      labs: 'not required',
      consult: 'not required',
      dietitian: 'not required',
      psychologist: 'not required',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN012',
      name: 'Sophia Martin',
      dateOfBirth: new Date('1998-08-29'),
      bmi: 25.9,
      visitType: 'Not Eligible',
      insurance: 'self pay',
      labs: 'not required',
      consult: 'not required',
      dietitian: 'not required',
      psychologist: 'not required',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
    {
      mrn: 'MRN018',
      name: 'Mia Walker',
      dateOfBirth: new Date('1994-09-09'),
      bmi: 26.7,
      visitType: 'Not Eligible',
      insurance: 'clear',
      labs: 'not required',
      consult: 'not required',
      dietitian: 'not required',
      psychologist: 'not required',
      endoscopy: 'not required',
      cardiology: 'not required',
      sleep: 'not required',
      barium: 'not required',
      hematology: 'not required',
    },
  ];

  const patients = await Promise.all(
    patientsData.map((data) =>
      prisma.patient.create({
        data,
      })
    )
  );

  console.log(`Created ${patients.length} sample patients`);

  // Create some audit logs
  await prisma.auditLog.create({
    data: {
      patientId: patients[0].id,
      userId: coordinator.id,
      column: 'insurance',
      oldValue: 'not clear',
      newValue: 'clear',
    },
  });

  await prisma.auditLog.create({
    data: {
      patientId: patients[1].id,
      userId: coordinator.id,
      column: 'visitType',
      oldValue: 'Initial Consultation',
      newValue: 'Follow-up',
    },
  });

  await prisma.auditLog.create({
    data: {
      patientId: patients[2].id,
      userId: director.id,
      column: 'bmi',
      oldValue: '31.8',
      newValue: '30.2',
    },
  });

  await prisma.auditLog.create({
    data: {
      patientId: patients[3].id,
      userId: coordinator.id,
      column: 'insurance',
      oldValue: 'not clear',
      newValue: 'clear',
    },
  });

  // Create some notifications
  await prisma.notification.create({
    data: {
      patientId: patients[0].id,
      message: 'Your consultation has been scheduled',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patients[4].id,
      message: 'Your lab results are available',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patients[5].id,
      message: 'Please confirm your follow-up appointment',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patients[6].id,
      message: 'Insurance information needs updating',
      isRead: false,
    },
  });

  console.log('Database seed completed successfully!');
  console.log('\nSample patients created:');
  patients.forEach((p) => {
    console.log(`  - ${p.name} (MRN: ${p.mrn}, BMI: ${p.bmi}, Type: ${p.visitType}, Insurance: ${p.insurance})`);
  });
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
