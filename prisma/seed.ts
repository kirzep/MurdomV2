// prisma/seed.ts
import { PrismaClient, TreatmentType, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const catData = [
  {
    name: 'Мурзик',
    avatarUrl: '/uploads/1749603972080-730252446.jpg',
    arrivalDate: new Date('2022-01-15'),
    birthYear: 2021,
    status: 'В приюте',
    notes: 'Очень ласковый и игривый кот.',
    treatments: [
      { type: TreatmentType.WORMS, date: new Date('2022-01-16'), productName: 'Милпразон' },
      { type: TreatmentType.FLEAS, date: new Date('2022-01-16'), productName: 'Бравекто' },
      { type: TreatmentType.VACCINATION, date: new Date('2022-02-01'), productName: 'Нобивак', vaccinationStage: 'first' },
      { type: TreatmentType.VACCINATION, date: new Date('2022-02-22'), productName: 'Нобивак', vaccinationStage: 'second' },
    ],
    documents: [
      { fileName: 'Паспорт Мурзика', filePath: '/uploads/1749606963671-135340987.pdf', fileType: 'application/pdf' },
    ],
  },
  {
    name: 'Барсик',
    avatarUrl: '/uploads/1749605329191-410768461.jpg',
    arrivalDate: new Date('2022-03-10'),
    birthYear: 2020,
    status: 'В приюте',
    notes: 'Спокойный и независимый кот.',
    treatments: [
        { type: TreatmentType.WORMS, date: new Date('2022-03-11'), productName: 'Каниквантел' },
        { type: TreatmentType.FLEAS, date: new Date('2022-03-11'), productName: 'Стронгхолд' },
        { type: TreatmentType.VACCINATION, date: new Date('2022-03-25'), productName: 'Пуревакс', vaccinationStage: 'first' },
        { type: TreatmentType.VACCINATION, date: new Date('2022-04-15'), productName: 'Пуревакс', vaccinationStage: 'second' },
        { type: TreatmentType.VACCINATION, date: new Date('2023-04-10'), productName: 'Пуревакс', vaccinationStage: 'revaccination' },
    ],
    documents: [],
  },
  {
    name: 'Рыжик',
    avatarUrl: '/uploads/1749605396132-321961147.jpg',
    arrivalDate: new Date('2022-05-20'),
    birthYear: 2022,
    status: 'В приюте',
    notes: 'Очень активный и любопытный котенок.',
    treatments: [
        { type: TreatmentType.WORMS, date: new Date('2022-05-21'), productName: 'Дронтал' },
        { type: TreatmentType.VACCINATION, date: new Date('2022-06-05'), productName: 'Фелоцел', vaccinationStage: 'first' },
    ],
    documents: [
        { fileName: 'Анализы Рыжика', filePath: '/uploads/1749607993360-595625906.pdf', fileType: 'application/pdf' },
    ],
  },
  {
    name: 'Васька',
    avatarUrl: '/uploads/1749606118699-589078098.jpg',
    arrivalDate: new Date('2023-01-05'),
    birthYear: 2019,
    status: 'Дома',
    notes: 'Уехал в новый дом 2023-03-15',
    treatments: [
        { type: TreatmentType.VACCINATION, date: new Date('2023-01-20'), productName: 'Нобивак', vaccinationStage: 'revaccination' },
    ],
    documents: [],
  },
  {
    name: 'Матроскин',
    avatarUrl: '/uploads/1749606424909-57074632.jpg',
    arrivalDate: new Date('2023-02-12'),
    birthYear: 2021,
    status: 'В приюте',
    notes: 'Предпочитает быть единственным котом в доме.',
    treatments: [
        { type: TreatmentType.WORMS, date: new Date('2023-02-13'), productName: 'Милпразон' },
    ],
    documents: [],
  },
  {
    name: 'Дымок',
    avatarUrl: '/uploads/1749609361559-454553769.jpg',
    arrivalDate: new Date('2023-04-01'),
    birthYear: 2023,
    status: 'В приюте',
    notes: 'Найден на улице, очень пугливый.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Пушок',
    avatarUrl: '/uploads/1749609864680-610276863.jpg',
    arrivalDate: new Date('2023-05-18'),
    birthYear: 2022,
    status: 'В приюте',
    notes: 'Любит спать на коленях.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Черныш',
    avatarUrl: '/uploads/1749610531133-994867088.jpg',
    arrivalDate: new Date('2023-06-02'),
    birthYear: 2020,
    status: 'Умерли',
    notes: 'Радуга 2023-07-10',
    treatments: [],
    documents: [],
  },
  {
    name: 'Белка',
    avatarUrl: '/uploads/1749611915568-153933955.jpg',
    arrivalDate: new Date('2023-07-20'),
    birthYear: 2023,
    status: 'В приюте',
    notes: 'Игривая и ласковая кошечка.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Снежок',
    avatarUrl: '/uploads/1749612198606-60867654.jpg',
    arrivalDate: new Date('2023-08-11'),
    birthYear: 2021,
    status: 'В приюте',
    notes: 'Белоснежный красавец.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Мурка',
    avatarUrl: '/uploads/1749613519614-698692979.jpg',
    arrivalDate: new Date('2023-09-01'),
    birthYear: 2018,
    status: 'В приюте',
    notes: 'Очень мудрая и спокойная кошка.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Симба',
    avatarUrl: '/uploads/1749603972080-730252446.jpg',
    arrivalDate: new Date('2023-10-14'),
    birthYear: 2023,
    status: 'В приюте',
    notes: 'Копия короля льва.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Багира',
    avatarUrl: '/uploads/1749605329191-410768461.jpg',
    arrivalDate: new Date('2023-11-05'),
    birthYear: 2022,
    status: 'В приюте',
    notes: 'Грациозная черная пантера.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Том',
    avatarUrl: '/uploads/1749605396132-321961147.jpg',
    arrivalDate: new Date('2023-12-01'),
    birthYear: 2020,
    status: 'Дома',
    notes: 'Уехал в новый дом 2024-01-15',
    treatments: [],
    documents: [],
  },
  {
    name: 'Джерри',
    avatarUrl: '/uploads/1749606118699-589078098.jpg',
    arrivalDate: new Date('2024-01-10'),
    birthYear: 2023,
    status: 'В приюте',
    notes: 'Неразлучен с Томом.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Леопольд',
    avatarUrl: '/uploads/1749606424909-57074632.jpg',
    arrivalDate: new Date('2024-02-03'),
    birthYear: 2017,
    status: 'В приюте',
    notes: 'Давайте жить дружно!',
    treatments: [],
    documents: [],
  },
  {
    name: 'Матильда',
    avatarUrl: '/uploads/1749609361559-454553769.jpg',
    arrivalDate: new Date('2024-03-12'),
    birthYear: 2021,
    status: 'В приюте',
    notes: 'Аристократичная особа.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Гав',
    avatarUrl: '/uploads/1749609864680-610276863.jpg',
    arrivalDate: new Date('2024-04-05'),
    birthYear: 2024,
    status: 'В приюте',
    notes: 'Котенок с именем щенка.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Кот в сапогах',
    avatarUrl: '/uploads/1749610531133-994867088.jpg',
    arrivalDate: new Date('2024-05-01'),
    birthYear: 2022,
    status: 'В приюте',
    notes: 'Носит воображаемые сапоги.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Чеширский',
    avatarUrl: '/uploads/1749611915568-153933955.jpg',
    arrivalDate: new Date('2024-06-10'),
    birthYear: 2020,
    status: 'В приюте',
    notes: 'Улыбается, даже когда спит.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Бегемот',
    avatarUrl: '/uploads/1749612198606-60867654.jpg',
    arrivalDate: new Date('2024-07-03'),
    birthYear: 2019,
    status: 'Дома',
    notes: 'Уехал в новый дом 2024-08-15',
    treatments: [],
    documents: [],
  },
  {
    name: 'Азазелло',
    avatarUrl: '/uploads/1749613519614-698692979.jpg',
    arrivalDate: new Date('2024-08-01'),
    birthYear: 2021,
    status: 'В приюте',
    notes: 'Рыжий и коварный.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Коровьев',
    avatarUrl: '/uploads/1749603972080-730252446.jpg',
    arrivalDate: new Date('2024-09-01'),
    birthYear: 2020,
    status: 'В приюте',
    notes: 'Носит воображаемое пенсне.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Гелла',
    avatarUrl: '/uploads/1749605329191-410768461.jpg',
    arrivalDate: new Date('2024-10-01'),
    birthYear: 2022,
    status: 'В приюте',
    notes: 'Красивая, но с характером.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Фрида',
    avatarUrl: '/uploads/1749605396132-321961147.jpg',
    arrivalDate: new Date('2024-11-01'),
    birthYear: 2023,
    status: 'В приюте',
    notes: 'Мечтательная и задумчивая.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Низа',
    avatarUrl: '/uploads/1749606118699-589078098.jpg',
    arrivalDate: new Date('2024-12-01'),
    birthYear: 2021,
    status: 'В приюте',
    notes: 'Прибыла из жарких стран.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Иешуа',
    avatarUrl: '/uploads/1749606424909-57074632.jpg',
    arrivalDate: new Date('2025-01-01'),
    birthYear: 2020,
    status: 'В приюте',
    notes: 'Добрый и всепрощающий.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Воланд',
    avatarUrl: '/uploads/1749609361559-454553769.jpg',
    arrivalDate: new Date('2025-02-01'),
    birthYear: 2018,
    status: 'В приюте',
    notes: 'Просто наблюдает.',
    treatments: [],
    documents: [],
  },
  {
    name: 'Понтий Пилат',
    avatarUrl: '/uploads/1749609864680-610276863.jpg',
    arrivalDate: new Date('2025-03-01'),
    birthYear: 2019,
    status: 'Умерли',
    notes: 'Радуга 2025-04-10',
    treatments: [],
    documents: [],
  },
];

const userData = [
  {
    name: 'Admin',
    email: 'admin@gmail.com',
    role: Role.DEVELOPER,
    isProfileSetupComplete: true,
    image: '/uploads/1749603972080-730252446.jpg',
  },
  {
    name: 'Medical Staff',
    email: 'medical@example.com',
    role: Role.MEDICAL_STAFF,
    isProfileSetupComplete: true,
    image: '/uploads/1749605329191-410768461.jpg',
  },
  {
    name: 'Trusted Person',
    email: 'trusted@example.com',
    role: Role.TRUSTED_PERSON,
    isProfileSetupComplete: true,
    image: '/uploads/1749605396132-321961147.jpg',
  },
  {
    name: 'Volunteer',
    email: 'volunteer@example.com',
    role: Role.VOLUNTEER,
    isProfileSetupComplete: true,
    image: '/uploads/1749606118699-589078098.jpg',
  },
];

async function main() {
  console.log('Start seeding...');

  // Clear the database
  await prisma.cat.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed users
  for (const user of userData) {
    const hashedPassword = await bcrypt.hash('12345', 10);

    await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  // Seed cats
  const users = await prisma.user.findMany();
  for (const cat of catData) {
    const creator = users[Math.floor(Math.random() * users.length)];
    await prisma.cat.create({
      data: {
        name: cat.name,
        avatarUrl: cat.avatarUrl,
        arrivalDate: cat.arrivalDate,
        birthYear: cat.birthYear,
        status: cat.status,
        notes: cat.notes,
        creatorId: creator.id,
        treatments: {
          create: cat.treatments,
        },
        documents: {
          create: cat.documents,
        },
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
