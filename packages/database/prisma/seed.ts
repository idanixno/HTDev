/**
 * Seed: OWNER admin + STUDENT accounts + Persian demo catalog.
 * Passwords come from env (never hardcode production secrets).
 *
 *   SEED_ADMIN_PASSWORD   (default: ChangeMeAdmin!23)
 *   SEED_STUDENT_PASSWORD (default: ChangeMeStudent!23)
 */
import {
  CourseDiagramKind,
  CourseOfferKind,
  CoursePublicationStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const ARGON2_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTS);
}

async function upsertUser(input: {
  username: string;
  email: string;
  phone: string | null;
  displayName: string;
  role: UserRole;
  password: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}) {
  const usernameNormalized = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  return prisma.user.upsert({
    where: { usernameNormalized },
    create: {
      username: input.username.trim(),
      usernameNormalized,
      email,
      phone: input.phone,
      displayName: input.displayName,
      role: input.role,
      passwordHash,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
      phoneVerifiedAt: input.phoneVerified ? new Date() : null,
    },
    update: {
      email,
      phone: input.phone,
      displayName: input.displayName,
      role: input.role,
      passwordHash,
      emailVerifiedAt: input.emailVerified ? new Date() : null,
      phoneVerifiedAt: input.phoneVerified ? new Date() : null,
    },
  });
}

type SeedCourse = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  categorySlug: string;
  publicationStatus: CoursePublicationStatus;
  offerKind: CourseOfferKind;
  priceToman: string;
  compareAtToman?: string;
  levelLabel: string;
  durationHours: string;
  lessonCount: number;
  featured: boolean;
  sortOrder: number;
  coverAsset: string;
  indexLabel: string;
  diagramCode: string;
  diagramKind: CourseDiagramKind;
  chainNodes: string[];
  publishedAt?: Date;
  modules: {
    title: string;
    summary?: string;
    lessons: { title: string; summary?: string; durationMinutes?: number; isPreview?: boolean }[];
  }[];
};

const CATEGORIES = [
  {
    slug: "fundamentals",
    title: "مبانی برنامه‌نویسی",
    summary: "از مسئله تا ساختار؛ پایه‌های فکر کردن مثل یک مهندس.",
    sortOrder: 1,
  },
  {
    slug: "architecture",
    title: "معماری نرم‌افزار",
    summary: "مرزها، لایه‌ها و تصمیم‌هایی که سیستم را زنده نگه می‌دارند.",
    sortOrder: 2,
  },
  {
    slug: "systems-security",
    title: "سیستم و امنیت",
    summary: "سیستم‌عامل، اعتماد در مرزها، و عادت‌های دفاعی.",
    sortOrder: 3,
  },
] as const;

const COURSES: SeedCourse[] = [
  {
    slug: "clean-architecture",
    title: "معماری تمیز در عمل",
    summary: "مرزهای روشن؛ کدی که با تغییر نمی‌شکند.",
    description:
      "این دوره مرزهای دامنه، کاربرد و زیرساخت را با مثال‌های واقعی جدا می‌کند. تمرکز روی تصمیم‌هایی است که هزینهٔ تغییر را پایین نگه می‌دارند — نه روی شعارهای معماری.",
    categorySlug: "architecture",
    publicationStatus: CoursePublicationStatus.PUBLISHED,
    offerKind: CourseOfferKind.PAID,
    priceToman: "2400000",
    levelLabel: "پیشرفته",
    durationHours: "18",
    lessonCount: 42,
    featured: true,
    sortOrder: 1,
    coverAsset: "/artwork/courses/clean-architecture.svg",
    indexLabel: "۰۱",
    diagramCode: "BOUNDARY / ۰۱",
    diagramKind: CourseDiagramKind.BOUNDARY,
    chainNodes: [],
    publishedAt: new Date("2025-09-01T00:00:00.000Z"),
    modules: [
      {
        title: "مرزهای دامنه",
        summary: "کجا دامنه تمام می‌شود و زیرساخت شروع می‌شود؟",
        lessons: [
          { title: "چرا معماری تمیز؟", durationMinutes: 18, isPreview: true },
          { title: "موجودیت‌ها و قوانین کسب‌وکار", durationMinutes: 24 },
          { title: "موارد کاربرد در برابر کنترلرها", durationMinutes: 22 },
        ],
      },
      {
        title: "وابستگی‌ها و آداپترها",
        lessons: [
          { title: "قانون وابستگی", durationMinutes: 20 },
          { title: "آداپترهای ورودی و خروجی", durationMinutes: 28 },
          { title: "تست بدون زیرساخت", durationMinutes: 26 },
        ],
      },
      {
        title: "پروژهٔ عملی",
        lessons: [
          { title: "طراحی یک سرویس آموزشی", durationMinutes: 35 },
          { title: "بازبینی مرزها", durationMinutes: 22 },
        ],
      },
    ],
  },
  {
    slug: "linux-intro",
    title: "شروع کار با Linux",
    summary: "یک شروع عملی برای کار با سیستم‌عامل.",
    description:
      "از شِل تا مجوزها و فرایندها؛ دوره‌ای کوتاه برای کسانی که می‌خواهند روی لینوکس با اطمینان کار کنند — رایگان و قابل‌دسترسی پس از ثبت‌نام.",
    categorySlug: "fundamentals",
    publicationStatus: CoursePublicationStatus.PUBLISHED,
    offerKind: CourseOfferKind.FREE,
    priceToman: "0",
    levelLabel: "مقدماتی",
    durationHours: "3",
    lessonCount: 12,
    featured: true,
    sortOrder: 2,
    coverAsset: "/artwork/courses/linux-intro.svg",
    indexLabel: "۰۳",
    diagramCode: "SYSTEM LAYERS",
    diagramKind: CourseDiagramKind.CHAIN,
    chainNodes: ["USER / SHELL", "KERNEL", "HARDWARE"],
    publishedAt: new Date("2025-08-15T00:00:00.000Z"),
    modules: [
      {
        title: "شِل و مسیرها",
        lessons: [
          { title: "ترمینال به‌عنوان ابزار فکر", durationMinutes: 12, isPreview: true },
          { title: "مسیرها، پیوندها و یافتن فایل‌ها", durationMinutes: 16 },
          { title: "مجوزها و مالکیت", durationMinutes: 18 },
        ],
      },
      {
        title: "فرایندها",
        lessons: [
          { title: "اجرا، سیگنال، پس‌زمینه", durationMinutes: 20 },
          { title: "لاگ و عیب‌یابی ساده", durationMinutes: 15 },
        ],
      },
    ],
  },
  {
    slug: "api-security",
    title: "امنیت API در عمل",
    summary: "اعتماد را در مرزهای سیستم طراحی کنید.",
    description:
      "پیش‌فروش دوره‌ای دربارهٔ توکن‌ها، مرزهای اعتماد، و الگوهای دفاعی برای API. تاریخ انتشار نهایی پس از تأیید برنامهٔ تولید اعلام می‌شود.",
    categorySlug: "systems-security",
    publicationStatus: CoursePublicationStatus.PUBLISHED,
    offerKind: CourseOfferKind.PRE_SALE,
    priceToman: "1900000",
    compareAtToman: "2200000",
    levelLabel: "متوسط",
    durationHours: "12",
    lessonCount: 30,
    featured: true,
    sortOrder: 3,
    coverAsset: "/artwork/courses/api-security.svg",
    indexLabel: "۰۴",
    diagramCode: "TRUST BOUNDARIES",
    diagramKind: CourseDiagramKind.CHAIN,
    chainNodes: ["CLIENT", "AUTH / TOKEN", "API"],
    publishedAt: new Date("2025-10-01T00:00:00.000Z"),
    modules: [
      {
        title: "مرز اعتماد",
        lessons: [
          { title: "مدل تهدید برای API", durationMinutes: 22, isPreview: true },
          { title: "احراز هویت در برابر مجوزدهی", durationMinutes: 24 },
        ],
      },
      {
        title: "توکن و نشست",
        lessons: [
          { title: "JWT و محدودیت‌هایش", durationMinutes: 26 },
          { title: "چرخش و ابطال", durationMinutes: 20 },
        ],
      },
    ],
  },
  {
    slug: "typescript-depth",
    title: "TypeScript عمیق",
    summary: "نوع‌ها به‌عنوان قرارداد؛ نه تزئین.",
    description:
      "از تایپ‌های پایه تا مدل‌سازی دامنه با TypeScript. مناسب کسانی که می‌خواهند خطای زمان اجرا را به قرارداد زمان طراحی تبدیل کنند.",
    categorySlug: "fundamentals",
    publicationStatus: CoursePublicationStatus.PUBLISHED,
    offerKind: CourseOfferKind.PAID,
    priceToman: "1600000",
    levelLabel: "متوسط",
    durationHours: "14",
    lessonCount: 36,
    featured: false,
    sortOrder: 4,
    coverAsset: "/artwork/courses/typescript-depth.svg",
    indexLabel: "۰۲",
    diagramCode: "TYPE / CONTRACT",
    diagramKind: CourseDiagramKind.BOUNDARY,
    chainNodes: [],
    publishedAt: new Date("2025-07-20T00:00:00.000Z"),
    modules: [
      {
        title: "قرارداد نوع",
        lessons: [
          { title: "نوع در برابر مقدار", durationMinutes: 18, isPreview: true },
          { title: "اتحاد، تقاطع، باریک‌سازی", durationMinutes: 28 },
        ],
      },
      {
        title: "مدل دامنه",
        lessons: [
          { title: "برندینگ و اینواریانت‌ها", durationMinutes: 24 },
          { title: "خطای قابل‌پیش‌بینی", durationMinutes: 20 },
        ],
      },
    ],
  },
  {
    slug: "distributed-thinking",
    title: "فکر کردن توزیع‌شده",
    summary: "شکست، تأخیر و تکرار؛ واقعیت سیستم‌های واقعی.",
    description:
      "به‌زودی: دوره‌ای دربارهٔ سازگاری، صف‌ها و تصمیم‌گیری در حضور شکست جزئی. هنوز در مرحلهٔ تولید محتواست.",
    categorySlug: "architecture",
    publicationStatus: CoursePublicationStatus.PUBLISHED,
    offerKind: CourseOfferKind.COMING_SOON,
    priceToman: "0",
    levelLabel: "پیشرفته",
    durationHours: "10",
    lessonCount: 24,
    featured: false,
    sortOrder: 5,
    coverAsset: "/artwork/courses/distributed-thinking.svg",
    indexLabel: "۰۵",
    diagramCode: "PARTIAL FAILURE",
    diagramKind: CourseDiagramKind.CHAIN,
    chainNodes: ["CLIENT", "QUEUE", "WORKER"],
    modules: [
      {
        title: "مفاهیم پایه",
        lessons: [
          { title: "شکست جزئی چیست؟", durationMinutes: 15, isPreview: true },
          { title: "تأخیر در برابر دسترس‌پذیری", durationMinutes: 18 },
        ],
      },
    ],
  },
  {
    slug: "observability-lab",
    title: "آزمایشگاه مشاهده‌پذیری",
    summary: "لاگ، متریک و ردپا؛ دیدن سیستم در حال اجرا.",
    description:
      "پیش‌نویس داخلی — هنوز برای کاتالوگ عمومی منتشر نشده. پس از تکمیل نمونه‌ها منتشر می‌شود.",
    categorySlug: "systems-security",
    publicationStatus: CoursePublicationStatus.DRAFT,
    offerKind: CourseOfferKind.PAID,
    priceToman: "1750000",
    levelLabel: "متوسط",
    durationHours: "8",
    lessonCount: 20,
    featured: false,
    sortOrder: 99,
    coverAsset: "/artwork/courses/observability-lab.svg",
    indexLabel: "۰۶",
    diagramCode: "SIGNALS / TRACE",
    diagramKind: CourseDiagramKind.CHAIN,
    chainNodes: ["APP", "COLLECTOR", "VIEW"],
    modules: [
      {
        title: "سیگنال‌ها",
        lessons: [{ title: "سه ستون مشاهده‌پذیری", durationMinutes: 20 }],
      },
    ],
  },
];

const PATHS = [
  {
    slug: "from-first-problem",
    title: "از اولین مسئله تا معماری",
    summary: "مسیر پیشنهادی برای شروع عمیق؛ از لینوکس و تایپ تا مرزهای دامنه.",
    description:
      "اگر تازه مسیر مهندسی را جدی شروع کرده‌ای، این نقشه ترتیب پیشنهادی دوره‌ها را نشان می‌دهد — نه یک اشتراک اجباری.",
    coverAsset: "/artwork/paths/from-first-problem.svg",
    published: true,
    sortOrder: 1,
    steps: [
      {
        courseSlug: "linux-intro",
        title: "شروع با سیستم",
        summary: "آشنایی عملی با محیط اجرا.",
      },
      {
        courseSlug: "typescript-depth",
        title: "قرارداد با نوع‌ها",
        summary: "قبل از معماری بزرگ، مدل را سخت‌گیر کن.",
      },
      {
        courseSlug: "clean-architecture",
        title: "مرزهای تمیز",
        summary: "تصمیم‌های معماری روی پایهٔ محکم.",
      },
    ],
  },
  {
    slug: "trust-at-the-edge",
    title: "اعتماد در مرز سیستم",
    summary: "مسیر امنیت API و فکر کردن دربارهٔ شکست.",
    description:
      "برای کسانی که سرویس عمومی می‌سازند و می‌خواهند مرز اعتماد را آگاهانه طراحی کنند.",
    coverAsset: "/artwork/paths/trust-at-the-edge.svg",
    published: true,
    sortOrder: 2,
    steps: [
      {
        courseSlug: "api-security",
        title: "امنیت API",
        summary: "پیش‌فروش؛ آماده‌سازی ذهنیت دفاعی.",
      },
      {
        courseSlug: "distributed-thinking",
        title: "شکست جزئی",
        summary: "به‌زودی؛ ادامهٔ مسیر اعتماد.",
      },
    ],
  },
];

async function seedCatalog() {
  const categoryBySlug = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        title: cat.title,
        summary: cat.summary,
        sortOrder: cat.sortOrder,
      },
      update: {
        title: cat.title,
        summary: cat.summary,
        sortOrder: cat.sortOrder,
      },
    });
    categoryBySlug.set(cat.slug, row.id);
  }

  const courseBySlug = new Map<string, string>();

  for (const course of COURSES) {
    const categoryId = categoryBySlug.get(course.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category ${course.categorySlug}`);
    }

    const row = await prisma.course.upsert({
      where: { slug: course.slug },
      create: {
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: course.description,
        categoryId,
        publicationStatus: course.publicationStatus,
        offerKind: course.offerKind,
        priceToman: new Prisma.Decimal(course.priceToman),
        compareAtToman: course.compareAtToman
          ? new Prisma.Decimal(course.compareAtToman)
          : null,
        levelLabel: course.levelLabel,
        durationHours: new Prisma.Decimal(course.durationHours),
        lessonCount: course.lessonCount,
        featured: course.featured,
        sortOrder: course.sortOrder,
        coverAsset: course.coverAsset,
        indexLabel: course.indexLabel,
        diagramCode: course.diagramCode,
        diagramKind: course.diagramKind,
        chainNodes: course.chainNodes,
        publishedAt: course.publishedAt ?? null,
      },
      update: {
        title: course.title,
        summary: course.summary,
        description: course.description,
        categoryId,
        publicationStatus: course.publicationStatus,
        offerKind: course.offerKind,
        priceToman: new Prisma.Decimal(course.priceToman),
        compareAtToman: course.compareAtToman
          ? new Prisma.Decimal(course.compareAtToman)
          : null,
        levelLabel: course.levelLabel,
        durationHours: new Prisma.Decimal(course.durationHours),
        lessonCount: course.lessonCount,
        featured: course.featured,
        sortOrder: course.sortOrder,
        coverAsset: course.coverAsset,
        indexLabel: course.indexLabel,
        diagramCode: course.diagramCode,
        diagramKind: course.diagramKind,
        chainNodes: course.chainNodes,
        publishedAt: course.publishedAt ?? null,
      },
    });
    courseBySlug.set(course.slug, row.id);

    await prisma.lesson.deleteMany({ where: { courseId: row.id } });
    await prisma.curriculumModule.deleteMany({ where: { courseId: row.id } });

    let lessonSort = 0;
    for (const [moduleIndex, mod] of course.modules.entries()) {
      const moduleRow = await prisma.curriculumModule.create({
        data: {
          courseId: row.id,
          title: mod.title,
          summary: mod.summary ?? null,
          sortOrder: moduleIndex + 1,
        },
      });
      for (const lesson of mod.lessons) {
        lessonSort += 1;
        await prisma.lesson.create({
          data: {
            courseId: row.id,
            moduleId: moduleRow.id,
            title: lesson.title,
            summary: lesson.summary ?? null,
            sortOrder: lessonSort,
            durationMinutes: lesson.durationMinutes ?? null,
            isPreview: lesson.isPreview ?? false,
          },
        });
      }
    }
  }

  for (const path of PATHS) {
    const pathRow = await prisma.learningPath.upsert({
      where: { slug: path.slug },
      create: {
        slug: path.slug,
        title: path.title,
        summary: path.summary,
        description: path.description,
        coverAsset: path.coverAsset,
        published: path.published,
        sortOrder: path.sortOrder,
      },
      update: {
        title: path.title,
        summary: path.summary,
        description: path.description,
        coverAsset: path.coverAsset,
        published: path.published,
        sortOrder: path.sortOrder,
      },
    });

    await prisma.learningPathStep.deleteMany({ where: { pathId: pathRow.id } });

    for (const [i, step] of path.steps.entries()) {
      const courseId = courseBySlug.get(step.courseSlug);
      if (!courseId) {
        throw new Error(`Missing course ${step.courseSlug} for path ${path.slug}`);
      }
      await prisma.learningPathStep.create({
        data: {
          pathId: pathRow.id,
          courseId,
          title: step.title,
          summary: step.summary,
          sortOrder: i + 1,
        },
      });
    }
  }

  return {
    categories: CATEGORIES.length,
    courses: COURSES.length,
    paths: PATHS.length,
    publishedCourses: COURSES.filter(
      (c) => c.publicationStatus === CoursePublicationStatus.PUBLISHED,
    ).length,
  };
}

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeAdmin!23";
  const studentPassword =
    process.env.SEED_STUDENT_PASSWORD ?? "ChangeMeStudent!23";

  const admin = await upsertUser({
    username: "admin",
    email: "admin@zharfa.local",
    phone: "09120000000",
    displayName: "مدیر ژرفا",
    role: UserRole.OWNER,
    password: adminPassword,
    emailVerified: true,
    phoneVerified: true,
  });

  const students = [
    {
      username: "sara",
      email: "sara@example.com",
      phone: "09121111111",
      displayName: "سارا محمدی",
    },
    {
      username: "reza",
      email: "reza@example.com",
      phone: "09122222222",
      displayName: "رضا احمدی",
    },
    {
      username: "niloofar",
      email: "niloofar@example.com",
      phone: "09123333333",
      displayName: "نیلوفر رضایی",
    },
    {
      username: "amir",
      email: "amir@example.com",
      phone: null,
      displayName: "امیر حسینی",
    },
  ];

  const createdStudents = [];
  for (const s of students) {
    createdStudents.push(
      await upsertUser({
        ...s,
        role: UserRole.STUDENT,
        password: studentPassword,
        emailVerified: true,
        phoneVerified: Boolean(s.phone),
      }),
    );
  }

  const catalog = await seedCatalog();

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        admin: { id: admin.id, username: admin.username, email: admin.email },
        students: createdStudents.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
        })),
        catalog,
        note: "Passwords from SEED_ADMIN_PASSWORD / SEED_STUDENT_PASSWORD (see README)",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
