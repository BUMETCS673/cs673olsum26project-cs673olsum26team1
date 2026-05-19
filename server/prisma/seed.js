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
  await prisma.user.deleteMany({});
  console.log('Cleared existing data');

  // Create sample users
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

  // Create sample patients with varied data for testing search
  const patientsData = [
    {
      mrn: 'MRN001',
      name: 'John Smith',
      dateOfBirth: new Date('1985-03-15'),
      bmi: 28.5,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN002',
      name: 'Mary Johnson',
      dateOfBirth: new Date('1990-07-22'),
      bmi: 32.1,
      visitType: 'Follow-up',
    },
    {
      mrn: 'MRN003',
      name: 'Michael Brown',
      dateOfBirth: new Date('1978-11-10'),
      bmi: 31.8,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN004',
      name: 'Sarah Williams',
      dateOfBirth: new Date('1992-05-08'),
      bmi: 29.3,
      visitType: 'Post-Surgery',
    },
    {
      mrn: 'MRN005',
      name: 'James Davis',
      dateOfBirth: new Date('1988-12-30'),
      bmi: 35.2,
      visitType: 'Follow-up',
    },
    {
      mrn: 'MRN006',
      name: 'Emma Wilson',
      dateOfBirth: new Date('1995-01-20'),
      bmi: 26.4,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN007',
      name: 'David Miller',
      dateOfBirth: new Date('1982-09-14'),
      bmi: 33.7,
      visitType: 'Follow-up',
    },
    {
      mrn: 'MRN008',
      name: 'Lisa Anderson',
      dateOfBirth: new Date('1987-06-25'),
      bmi: 30.1,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN009',
      name: 'Christopher Taylor',
      dateOfBirth: new Date('1975-04-18'),
      bmi: 36.2,
      visitType: 'Follow-up',
    },
    {
      mrn: 'MRN010',
      name: 'Olivia Thomas',
      dateOfBirth: new Date('1993-10-02'),
      bmi: 27.4,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN011',
      name: 'Daniel Harris',
      dateOfBirth: new Date('1980-02-12'),
      bmi: 34.0,
      visitType: 'Post-Surgery',
    },
    {
      mrn: 'MRN012',
      name: 'Sophia Martin',
      dateOfBirth: new Date('1998-08-29'),
      bmi: 25.9,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN013',
      name: 'Anthony Garcia',
      dateOfBirth: new Date('1989-11-04'),
      bmi: 32.8,
      visitType: 'Follow-up',
    },
    {
      mrn: 'MRN014',
      name: 'Ava Robinson',
      dateOfBirth: new Date('1991-06-10'),
      bmi: 29.6,
      visitType: 'Post-Surgery',
    },
    {
      mrn: 'MRN015',
      name: 'Joshua Clark',
      dateOfBirth: new Date('1984-01-27'),
      bmi: 37.1,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN016',
      name: 'Isabella Rodriguez',
      dateOfBirth: new Date('1996-03-05'),
      bmi: 28.0,
      visitType: 'Follow-up',
    },
    {
      mrn: 'MRN017',
      name: 'Ethan Lewis',
      dateOfBirth: new Date('1983-12-16'),
      bmi: 33.3,
      visitType: 'Initial Consultation',
    },
    {
      mrn: 'MRN018',
      name: 'Mia Walker',
      dateOfBirth: new Date('1994-09-09'),
      bmi: 26.7,
      visitType: 'Post-Surgery',
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
    console.log(`  - ${p.name} (MRN: ${p.mrn}, DOB: ${p.dateOfBirth.toISOString().split('T')[0]})`);
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
