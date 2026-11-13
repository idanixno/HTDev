/**
 * Seed: OWNER admin + STUDENT accounts + Persian demo catalog.
 * Passwords come from env (never hardcode production secrets).
 *
 *   SEED_ADMIN_PASSWORD   (default: ChangeMeAdmin!23)
 *   SEED_STUDENT_PASSWORD (default: ChangeMeStudent!23)
 */
import {
  ActivityActorKind,
  CouponDiscountType,
  CourseDiagramKind,
  CourseOfferKind,
  CoursePublicationStatus,
  GatewayCredentialsStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEventType,
  OrderStatus,
  PaymentProvider,
  PaymentTransactionStatus,
  Prisma,
  PrismaClient,
  SpotPlayerAccessSource,
  SpotPlayerLicenseStatus,
  TicketAuthorRole,
  TicketStatus,
  UserRole,
} from "@prisma/client";
import * as argon2 from "argon2";
import {
  EXTRA_ARTICLES,
  EXTRA_CATEGORIES,
  EXTRA_COURSES,
  EXTRA_FAQS,
  EXTRA_PATHS,
  EXTRA_STUDENTS,
  type SeedCourse,
  type SeedPath,
} from "./sample-catalog";

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
  ...EXTRA_CATEGORIES,
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
    description: `این دوره دربارهٔ **فکر کردن در سیستم‌های توزیع‌شده** است: جایی که تأخیر، شکست جزئی و تکرار، استثنا نیستند — قاعده‌اند. هدف این است که قبل از انتخاب ابزار، *مدل ذهنی* درستی برای تصمیم‌گیری بسازید.

## چه چیزی یاد می‌گیرید؟

- تشخیص مرزهای سازگاری و دسترس‌پذیری در سرویس‌های واقعی
- طراحی صف، retry و idempotency بدون پنهان‌کردن شکست
- خواندن علائم جزئی‌شکست قبل از اینکه به حادثه تبدیل شوند
- نوشتن قرارداد بین سرویس‌ها که در حضور تأخیر هم پایدار بماند

### برای چه کسانی مناسب است؟

اگر بک‌اند، معماری یا پلتفرم کار می‌کنید و با صف، کش، یا سرویس‌های چندنودی سروکار دارید، این مسیر برای شماست. آشنایی با HTTP و دیتابیس کافی است؛ نیازی به تجربهٔ قبلی با Kubernetes نیست.

> قاعدهٔ اصلی دوره: **قبل از scale کردن، شکست را طراحی کنید.** ابزارها دیرتر می‌آیند.

## نقشهٔ ذهنی دوره

![نمودار مفهومی فکر کردن توزیع‌شده](/artwork/courses/distributed-thinking.svg)

## نمونهٔ قرارداد ساده

\`\`\`ts
type Job = {
  id: string;
  attempt: number;
  payload: unknown;
};

async function handle(job: Job) {
  // idempotent: همان id دوباره اجرا شود، اثر جانبی تکراری نسازد
  await processOnce(job.id, job.payload);
}
\`\`\`

برای جزئیات بیشتر به [کاتالوگ معماری](/courses?category=architecture) سر بزنید.

## مقایسهٔ سریع رویکردها

| رویکرد | وقتی مناسب است | ریسک اصلی |
| --- | --- | --- |
| همگام / درخواست-پاسخ | مسیرهای کوتاه و حیاتی | زنجیرهٔ شکست |
| صف و پردازش ناهمگام | کار سنگین و قابل تکرار | تأخیر و duplicate |
| eventual consistency | دامنهٔ قابل‌تحمل | پیچیدگی خواندن |

---

!faq[آیا دوره هنوز کامل ضبط شده؟]
خیر — وضعیت فعلی **به‌زودی** است. با پیش‌ثبت‌نام، به محض انتشار از طریق پیامک خبر می‌دهیم.
!/faq

!faq[پیش‌نیاز برنامه‌نویسی چیست؟]
تسلط عملی به یک زبان بک‌اند (مثلاً TypeScript یا Go) و تجربهٔ کار با API کافی است. مفاهیم پیشرفته را از صفر جمع می‌کنیم.
!/faq
`,
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
  ...EXTRA_COURSES,
];

const LINUX_STEP_BODY = [
  "## محیط اجرا را بشناس",
  "",
  "قبل از معماری، باید بدانی برنامه کجا اجرا می‌شود. این صفحه شرح گام است. درس کامل دوره، بعد از خرید، در اسپات‌پلیر باز می‌شود.",
  "",
  "### سه کار اول",
  "",
  "- ترمینال را باز کن",
  "- مسیر فعلی را ببین",
  "- یک فایل را جابه‌جا کن",
  "",
  "| کار | دستور | چرا |",
  "| --- | --- | --- |",
  "| مسیر | pwd | بدانی کجایی |",
  "| فهرست | ls | فایل‌ها را ببینی |",
  "| جابه‌جایی | mv | بدون کپی اضافه |",
  "",
  "!video[نمونهٔ کوتاه و عمومی](/previews/lesson-preview.mp4)",
  "",
  "![طرح دورهٔ لینوکس](/artwork/courses/linux-intro.svg)",
  "",
  "```bash",
  "pwd",
  "ls",
  "```",
  "",
  "!course[linux-intro]",
  "",
].join("\n");

const PATHS: SeedPath[] = [
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
        slug: "linux-intro",
        title: "شروع با سیستم",
        summary: "آشنایی عملی با محیط اجرا.",
        seoTitle: "شروع با سیستم | گام اول مسیر مهندسی",
        seoDescription:
          "گام اول نقشهٔ راه: محیط اجرا، جدول دستورها، فیلم نمونه و دورهٔ لینوکس. هر دوره جدا خریده می‌شود.",
        body: LINUX_STEP_BODY,
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
  ...EXTRA_PATHS,
];

function measuredCourse(course: SeedCourse) {
  const lessons = course.modules.flatMap((mod) => mod.lessons);
  const minutes = lessons.reduce(
    (sum, lesson) => sum + (lesson.durationMinutes ?? 0),
    0,
  );
  return {
    lessonCount: lessons.length,
    durationHours:
      minutes > 0
        ? new Prisma.Decimal((minutes / 60).toFixed(1))
        : new Prisma.Decimal(course.durationHours),
  };
}

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

    const measured = measuredCourse(course);
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
        durationHours: measured.durationHours,
        lessonCount: measured.lessonCount,
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
        durationHours: measured.durationHours,
        lessonCount: measured.lessonCount,
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
            previewAsset: lesson.isPreview
              ? lesson.previewAsset?.trim() || "/previews/lesson-preview.mp4"
              : null,
            videoAsset: "/previews/lesson-preview.mp4",
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
          slug: step.slug ?? step.courseSlug,
          title: step.title,
          summary: step.summary,
          body: step.body ?? "",
          seoTitle: step.seoTitle ?? null,
          seoDescription: step.seoDescription ?? null,
          ogImage: step.ogImage ?? null,
          noIndex: step.noIndex ?? false,
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
    displayName: "مدیر DXCode",
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
    ...EXTRA_STUDENTS,
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
  const commerce = await seedCommerce(createdStudents);
  const support = await seedSupport(admin, createdStudents);
  const analytics = await seedAnalyticsFixtures(admin, createdStudents);
  const cms = await seedCms(admin);
  const journal = await seedJournal(admin);

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
        commerce,
        support,
        analytics,
        cms,
        journal,
        note: "Passwords from SEED_ADMIN_PASSWORD / SEED_STUDENT_PASSWORD (see README). Runtime payment adapters never invent PAID. Analytics seed inserts explicit historical PAID fixtures for admin charts only. No SUCCEEDED SpotPlayer licenses.",
      },
      null,
      2,
    ),
  );
}

/**
 * Historical PAID rows for admin analytics charts.
 * Explicit seed fixtures — NOT produced by gateway verify. Payment adapters still
 * never mark PAID without a real verify path.
 */
async function seedAnalyticsFixtures(
  admin: { id: string },
  students: { id: string; username: string }[],
) {
  const paidCourse = await prisma.course.findFirst({
    where: {
      publicationStatus: CoursePublicationStatus.PUBLISHED,
      offerKind: CourseOfferKind.PAID,
    },
    orderBy: { sortOrder: "asc" },
  });
  if (!paidCourse || students.length === 0) {
    return { paidOrders: 0, activityLogs: 0, note: "skipped — missing course/students" };
  }

  const now = new Date();
  const fixtures: Array<{
    id: string;
    dayOffset: number;
    studentIndex: number;
    discountToman: number;
  }> = [
    { id: "seed_analytics_paid_01", dayOffset: 28, studentIndex: 0, discountToman: 0 },
    { id: "seed_analytics_paid_02", dayOffset: 25, studentIndex: 1, discountToman: 0 },
    { id: "seed_analytics_paid_03", dayOffset: 21, studentIndex: 2, discountToman: 50000 },
    { id: "seed_analytics_paid_04", dayOffset: 18, studentIndex: 0, discountToman: 0 },
    { id: "seed_analytics_paid_05", dayOffset: 14, studentIndex: 3, discountToman: 0 },
    { id: "seed_analytics_paid_06", dayOffset: 11, studentIndex: 1, discountToman: 100000 },
    { id: "seed_analytics_paid_07", dayOffset: 8, studentIndex: 2, discountToman: 0 },
    { id: "seed_analytics_paid_08", dayOffset: 5, studentIndex: 0, discountToman: 0 },
    { id: "seed_analytics_paid_09", dayOffset: 3, studentIndex: 3, discountToman: 0 },
    { id: "seed_analytics_paid_10", dayOffset: 1, studentIndex: 1, discountToman: 50000 },
  ];

  let paidOrders = 0;
  for (const f of fixtures) {
    const student = students[f.studentIndex % students.length]!;
    const list = Number(paidCourse.priceToman);
    const amount = Math.max(0, list - f.discountToman);
    const paidAt = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - f.dayOffset,
        10 + (f.dayOffset % 5),
        15,
      ),
    );

    await prisma.order.upsert({
      where: { id: f.id },
      create: {
        id: f.id,
        userId: student.id,
        courseId: paidCourse.id,
        listPriceToman: paidCourse.priceToman,
        discountToman: f.discountToman,
        amountToman: amount,
        currency: "IRT",
        status: OrderStatus.PAID,
        paymentProvider: f.dayOffset % 2 === 0
          ? PaymentProvider.ZARINPAL
          : PaymentProvider.AQAYE_PARDAKHT,
        paidAt,
        createdAt: paidAt,
      },
      update: {
        status: OrderStatus.PAID,
        amountToman: amount,
        discountToman: f.discountToman,
        paidAt,
      },
    });

    await prisma.paymentTransaction.upsert({
      where: { idempotencyKey: `seed:analytics:${f.id}` },
      create: {
        orderId: f.id,
        provider:
          f.dayOffset % 2 === 0
            ? PaymentProvider.ZARINPAL
            : PaymentProvider.AQAYE_PARDAKHT,
        status: PaymentTransactionStatus.VERIFIED,
        amountToman: amount,
        gatewayAuthority: `SEED-ANALYTICS-${f.id}`,
        gatewayRefId: `SEED-REF-${f.id}`,
        idempotencyKey: `seed:analytics:${f.id}`,
        verifiedAt: paidAt,
      },
      update: {
        status: PaymentTransactionStatus.VERIFIED,
        amountToman: amount,
        verifiedAt: paidAt,
      },
    });
    paidOrders += 1;
  }

  // Stagger student createdAt so user-registration series has shape.
  for (let i = 0; i < students.length; i++) {
    const s = students[i]!;
    const createdAt = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - (20 - i * 4),
        9,
      ),
    );
    await prisma.user.update({
      where: { id: s.id },
      data: { createdAt },
    });
  }

  const activitySeeds = [
    {
      id: "seed_activity_course_publish",
      action: "course.update",
      entityType: "Course",
      entityId: paidCourse.id,
      summary: "انتشار دورهٔ نمونه برای دمو ادمین",
    },
    {
      id: "seed_activity_gateway",
      action: "payment.gateway.update",
      entityType: "PaymentGatewaySetting",
      entityId: "ZARINPAL",
      summary: "فعال‌سازی نمایش درگاه زرین‌پال در seed",
    },
    {
      id: "seed_activity_cms",
      action: "cms.home.update",
      entityType: "CmsHomeContent",
      entityId: "home",
      summary: "تنظیم محتوای صفحهٔ خانه",
    },
  ];

  for (const a of activitySeeds) {
    await prisma.activityLog.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        actorKind: ActivityActorKind.OWNER,
        actorId: admin.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        summary: a.summary,
        metadata: { seed: true },
      },
      update: {
        summary: a.summary,
        actorId: admin.id,
      },
    });
  }

  // Pending provisioning samples (never SUCCEEDED).
  const pendingStudent = students[0]!;
  await prisma.spotPlayerLicense.upsert({
    where: {
      userId_courseId: {
        userId: pendingStudent.id,
        courseId: paidCourse.id,
      },
    },
    create: {
      id: "seed_license_pending_analytics",
      userId: pendingStudent.id,
      courseId: paidCourse.id,
      orderId: "seed_analytics_paid_01",
      accessSource: SpotPlayerAccessSource.PAID_ORDER,
      status: SpotPlayerLicenseStatus.PENDING,
      idempotencyKey: `access:${pendingStudent.id}:${paidCourse.id}`,
      attemptCount: 0,
    },
    update: {
      status: SpotPlayerLicenseStatus.PENDING,
      licenseKey: null,
      spotPlayerLicenseId: null,
    },
  });

  return {
    paidOrders,
    activityLogs: activitySeeds.length,
    pendingLicenses: 1,
    note: "PAID rows are analytics seed fixtures only; adapters still require real verify.",
  };
}

async function seedCms(admin: { id: string }) {
  await prisma.cmsHomeContent.upsert({
    where: { id: "home" },
    create: {
      id: "home",
      heroEyebrow: "LEARN · BUILD · GROW",
      heroTitle: "از یادگیری کد تا درک مهندسی",
      heroSubtitle:
        "دانش فناوری را عمیق یاد بگیر، واقعی بساز و حرفه‌ای رشد کن.",
      primaryCtaLabel: "شروع یادگیری",
      primaryCtaHref: "/courses",
      secondaryCtaLabel: "نقشه راه",
      secondaryCtaHref: "/paths",
    },
    update: {
      heroEyebrow: "LEARN · BUILD · GROW",
      heroTitle: "از یادگیری کد تا درک مهندسی",
      heroSubtitle:
        "دانش فناوری را عمیق یاد بگیر، واقعی بساز و حرفه‌ای رشد کن.",
      primaryCtaLabel: "شروع یادگیری",
      primaryCtaHref: "/courses",
      secondaryCtaLabel: "نقشه راه",
      secondaryCtaHref: "/paths",
    },
  });

  await prisma.cmsFooterContent.upsert({
    where: { id: "footer" },
    create: {
      id: "footer",
      brandName: "DXCode",
      brandTagline: "LEARN · BUILD · GROW",
      brandKicker: "استودیو",
      footerBlurb:
        "DXCode جایی است برای یادگیری عمیق فناوری؛ از اولین مسئله تا تصمیم‌های مهندسی. دوره، مسیر روشن و تمرین واقعی — تا مهارت قابل‌اتکا بسازی، نه فقط تئوری حفظ‌کردنی.",
      headerLinks: [
        { href: "/courses", label: "دوره‌ها", match: "/courses" },
        { href: "/paths", label: "مسیرها", match: "/paths" },
        { href: "/journal", label: "مقالات", match: "/journal" },
      ],
      footerGroups: [
        {
          label: "یادگیری",
          links: [
            { href: "/courses", label: "دوره‌ها" },
            { href: "/paths", label: "مسیرهای یادگیری" },
            { href: "/journal", label: "مقالات" },
          ],
        },
        {
          label: "درباره",
          links: [
            { href: "/faq", label: "پرسش‌های رایج" },
            { href: "/terms", label: "شرایط استفاده" },
          ],
        },
      ],
      mobileGroups: [
        {
          label: "یادگیری",
          links: [
            { href: "/courses", label: "دوره‌ها" },
            { href: "/paths", label: "مسیرهای یادگیری" },
            { href: "/journal", label: "مقالات" },
          ],
        },
        {
          label: "درباره",
          links: [
            { href: "/faq", label: "پرسش‌ها" },
            { href: "/terms", label: "شرایط استفاده" },
          ],
        },
      ],
      guestCtaLabel: "ورود",
      guestCtaHref: "/login",
      authedCtaLabel: "حساب من",
      authedCtaHref: "/dashboard",
      showCart: false,
      showThemeToggle: true,
      trustsLabel: "اعتماد و پرداخت",
      mobileMenuTitle: "منو",
      mobileMenuLine: "دوره‌ها، مسیرها و حساب — یک صفحه.",
    },
    update: {
      brandName: "DXCode",
      brandTagline: "LEARN · BUILD · GROW",
      brandKicker: "استودیو",
      footerBlurb:
        "DXCode جایی است برای یادگیری عمیق فناوری؛ از اولین مسئله تا تصمیم‌های مهندسی. دوره، مسیر روشن و تمرین واقعی — تا مهارت قابل‌اتکا بسازی، نه فقط تئوری حفظ‌کردنی.",
    },
  });

  const faqs = [
    {
      id: "seed_faq_1",
      question: "دسترسی ویدیو چگونه فعال می‌شود؟",
      answer:
        "پس از پرداخت موفق و verify درگاه، لایسنس اسپات‌پلیر به‌صورت جداگانه پرویژن می‌شود. موفقیت لایسنس ساختگی نیست.",
      sortOrder: 1,
    },
    {
      id: "seed_faq_2",
      question: "آیا می‌توانم از کوپن استفاده کنم؟",
      answer:
        "در صفحهٔ خرید، کد کوپن را وارد کنید. تخفیف فقط روی سرور محاسبه می‌شود.",
      sortOrder: 2,
    },
    {
      id: "seed_faq_3",
      question: "پشتیبانی چگونه کار می‌کند؟",
      answer:
        "از پنل دانشجو تیکت داخلی بسازید. تلگرام فقط مرجع تکمیلی است.",
      sortOrder: 3,
    },
    ...EXTRA_FAQS,
  ];

  for (const f of faqs) {
    await prisma.cmsFaqItem.upsert({
      where: { id: f.id },
      create: {
        id: f.id,
        question: f.question,
        answer: f.answer,
        sortOrder: f.sortOrder,
        published: true,
      },
      update: {
        question: f.question,
        answer: f.answer,
        sortOrder: f.sortOrder,
        published: true,
      },
    });
  }

  await prisma.activityLog.upsert({
    where: { id: "seed_activity_faq" },
    create: {
      id: "seed_activity_faq",
      actorKind: ActivityActorKind.OWNER,
      actorId: admin.id,
      action: "cms.faq.create",
      entityType: "CmsFaqItem",
      entityId: "seed_faq_1",
      summary: "ایجاد FAQهای اولیه",
      metadata: { seed: true, count: faqs.length },
    },
    update: { summary: "ایجاد FAQهای اولیه" },
  });

  const purchaseNotes = [
    {
      id: "seed_purchase_note_price",
      body: "قیمت به تومان است و تخفیف فقط روی سرور حساب می‌شود.",
      sortOrder: 1,
    },
    {
      id: "seed_purchase_note_faq",
      body: "پرسش‌های عمومی در [پرسش‌های رایج](/faq) جمع شده‌اند.",
      sortOrder: 2,
    },
  ];

  for (const note of purchaseNotes) {
    await prisma.coursePurchaseNote.upsert({
      where: { id: note.id },
      create: {
        id: note.id,
        courseId: null,
        body: note.body,
        sortOrder: note.sortOrder,
        published: true,
      },
      update: {
        courseId: null,
        body: note.body,
        sortOrder: note.sortOrder,
        published: true,
      },
    });
  }

  return { home: 1, faq: faqs.length, purchaseNotes: purchaseNotes.length };
}

async function seedJournal(admin: { id: string }) {
  const notes = [
    {
      id: "seed_article_syllabus",
      slug: "read-the-syllabus",
      title: "قبل از خرید، سرفصل را چطور بخوانیم",
      summary:
        "سرفصل، سطح و پیش‌نمایش رایگان باید به سؤال «این دوره برای من است؟» جواب بدهند.",
      coverAsset: "/artwork/journal/read-the-syllabus.svg",
      sortOrder: 1,
      readingMinutes: 4,
      body: `خرید یک دوره تصمیم محصولی است، نه فقط یک پرداخت.

## چه چیزی را در صفحه دوره جدی بگیریم

عنوان جذاب کافی نیست. خلاصه باید بگوید مسئله چیست، سطح برای چه کسی است، و سرفصل تا کجا پیش می‌رود. اگر درسی با برچسب پیش‌نمایش وجود دارد، همان را قبل از پرداخت ببینید — نه نقل‌قول‌های ساختگی.

## چه چیزی را از صفحه انتظار نداشته باشیم

DXCode پلیر ویدیوی مستقل ندارد. ویدیوی محافظت‌شده بعد از ثبت دسترسی، در اسپات‌پلیر باز می‌شود. پیشرفت تماشا در این وب‌سایت نمایش داده نمی‌شود چون از ارائه‌دهنده خوانده نمی‌شود.

اگر سرفصل با هدف شما جور نیست، دوره را نخرید. مسیر یادگیری فقط ترتیب پیشنهادی است و اشتراک اجباری نمی‌سازد.`,
    },
    {
      id: "seed_article_access",
      slug: "payment-and-access",
      title: "پرداخت موفق با دسترسی ویدیو یکی نیست",
      summary:
        "وضعیت سفارش و وضعیت لایسنس اسپات‌پلیر دو مرحله جدا هستند.",
      coverAsset: "/artwork/journal/payment-and-access.svg",
      sortOrder: 2,
      readingMinutes: 3,
      body: `بعد از بازگشت از درگاه، مرورگر به‌تنهایی سفارش را پرداخت‌شده نمی‌کند. سرور نتیجه را با درگاه تطبیق می‌دهد و فقط همان پاسخ معتبر، وضعیت سفارش را عوض می‌کند.

## بعد از پرداخت چه می‌بینید

در حساب شما، سفارش با وضعیت واقعی‌اش ثبت می‌شود. اگر دوره پولی باشد، صدور لایسنس اسپات‌پلیر جداگانه شروع می‌شود. تا وقتی ارائه‌دهنده کلید را برگرداند، صفحه دسترسی موفقیت را نشان نمی‌دهد.

## دوره رایگان

دوره رایگان از درگاه پرداخت عبور نمی‌کند. ثبت‌نام و درخواست دسترسی کافی است، اما لایسنس همچنان به پاسخ واقعی اسپات‌پلیر وابسته است.

اگر دسترسی ساخته نشد، از تیکت پشتیبانی داخل حساب پیگیری کنید. شماره یا کلید ساختگی در رابط نمایش داده نمی‌شود.`,
    },
    {
      id: "seed_article_catalog",
      slug: "one-instructor-catalog",
      title: "این کاتالوگ بازار مدرس‌ها نیست",
      summary:
        "DXCode آموزش یک مدرس است و موضوع دوره‌ها به یک زبان یا فریم‌ورک محدود نمی‌شود.",
      coverAsset: "/artwork/journal/one-instructor.svg",
      sortOrder: 3,
      readingMinutes: 3,
      body: `هر دوره در DXCode متعلق به همین مجموعه است. دسته‌ها موضوع را جدا می‌کنند — معماری، سیستم، امنیت، یا هر قلمرو دیگری که بعداً منتشر شود — ولی فروشنده و پشتیبانی چندمدرسه نیست.

## مسیر را با دسته قاطی نکنید

دسته برای پیدا کردن موضوع است. مسیر یادگیری ترتیب پیشنهادی چند دوره است و می‌تواند درس اجباری و اختیاری را فقط در حد توضیح همان مسیر نشان دهد. خرید هر دوره مستقل است؛ اشتراک سراسری وجود ندارد.

وقتی دوره تازه‌ای منتشر یا پیش‌فروش می‌شود، همان وضعیت روی کارت و صفحه دوره دیده می‌شود. عدد دانشجو، امتیاز ساختگی، یا وعده نتیجه شغلی در این صفحات جایی ندارد.`,
    },
    {
      id: "seed_article_format",
      slug: "note-format",
      title: "قالب مقاله: تصویر، فیلم و کد",
      summary: "یک مقاله می‌تواند تیتر، فهرست، تصویر، فیلم و قطعهٔ کد داشته باشد.",
      seoTitle: "قالب مقاله DXCode | تصویر، فیلم و کد",
      seoDescription:
        "در مقاله DXCode می‌توان تیتر، تصویر، فیلم کوتاه و کد را کنار متن نوشت. عنوان صفحه همان h1 است.",
      sortOrder: 20,
      readingMinutes: 3,
      body: `عنوان مقاله، h1 صفحه است. تیترهای داخل متن از سطح بخش شروع می‌شوند.

## بخش

یک جمله با **تأکید**، یک \`نمونه\` و لینک [دوره‌ها](/courses).

### زیربخش

- تصویر و فیلم فایل عمومی هستند
- درس خریده‌شده همچنان در اسپات‌پلیر باز می‌شود

> نقل یک جمله، جدا از پاراگراف.

![جلد نمونه](/artwork/courses/clean-architecture.svg)

!video[نمونهٔ کوتاه](/previews/lesson-preview.mp4)

\`\`\`python
def boundary(entity):
    return entity.rules
\`\`\`

#### جزئیات

1. عنوان سئو می‌تواند با عنوان صفحه فرق داشته باشد
2. اگر عنوان سئو خالی باشد، عنوان مقاله استفاده می‌شود`,
    },
    ...EXTRA_ARTICLES,
  ];

  for (const note of notes) {
    await prisma.article.upsert({
      where: { id: note.id },
      create: {
        ...note,
        published: true,
        publishedAt: new Date(),
      },
      update: {
        slug: note.slug,
        title: note.title,
        summary: note.summary,
        body: note.body,
        sortOrder: note.sortOrder,
        readingMinutes: note.readingMinutes,
        coverAsset:
          "coverAsset" in note && note.coverAsset ? note.coverAsset : null,
        ...("seoTitle" in note ? { seoTitle: note.seoTitle ?? null } : {}),
        ...("seoDescription" in note
          ? { seoDescription: note.seoDescription ?? null }
          : {}),
        ...("ogImage" in note ? { ogImage: note.ogImage ?? null } : {}),
        ...("noIndex" in note ? { noIndex: Boolean(note.noIndex) } : {}),
        published: true,
      },
    });
  }

  await prisma.activityLog.upsert({
    where: { id: "seed_activity_journal" },
    create: {
      id: "seed_activity_journal",
      actorKind: ActivityActorKind.OWNER,
      actorId: admin.id,
      action: "article.create",
      entityType: "Article",
      entityId: "seed_article_syllabus",
      summary: "انتشار مقالات آموزشی اولیه",
      metadata: { seed: true, count: notes.length },
    },
    update: { summary: "انتشار مقالات آموزشی اولیه" },
  });

  return { articles: notes.length };
}

async function seedSupport(
  admin: { id: string },
  students: { id: string; username: string; displayName?: string }[],
) {
  const sara = students.find((s) => s.username === "sara");
  const reza = students.find((s) => s.username === "reza");
  const course = await prisma.course.findFirst({
    where: {
      publicationStatus: CoursePublicationStatus.PUBLISHED,
      offerKind: CourseOfferKind.PAID,
    },
    orderBy: { sortOrder: "asc" },
  });

  let tickets = 0;
  let messages = 0;
  let notifications = 0;

  if (sara) {
    const open = await prisma.ticket.upsert({
      where: { id: "seed_ticket_sara_open" },
      create: {
        id: "seed_ticket_sara_open",
        userId: sara.id,
        courseId: course?.id ?? null,
        subject: "سؤال درباره دسترسی دوره",
        description:
          "سلام، پس از خرید هنوز لایسنس اسپات‌پلیر را نمی‌بینم. وضعیت سفارش را چک کرده‌ام.",
        status: TicketStatus.OPEN,
        telegramRef: null,
      },
      update: {
        subject: "سؤال درباره دسترسی دوره",
        description:
          "سلام، پس از خرید هنوز لایسنس اسپات‌پلیر را نمی‌بینم. وضعیت سفارش را چک کرده‌ام.",
        status: TicketStatus.OPEN,
        courseId: course?.id ?? null,
      },
    });
    tickets += 1;

    await prisma.ticketMessage.deleteMany({ where: { ticketId: open.id } });
    await prisma.ticketMessage.create({
      data: {
        id: "seed_msg_sara_1",
        ticketId: open.id,
        authorId: sara.id,
        authorRole: TicketAuthorRole.STUDENT,
        body: open.description,
      },
    });
    messages += 1;

    const n1 = await prisma.notification.upsert({
      where: { id: "seed_notify_sara_ticket" },
      create: {
        id: "seed_notify_sara_ticket",
        userId: sara.id,
        eventType: NotificationEventType.TICKET_CREATED,
        title: "تیکت ثبت شد",
        body: `تیکت «${open.subject}» ثبت شد.`,
        payload: { ticketId: open.id },
      },
      update: {
        title: "تیکت ثبت شد",
        body: `تیکت «${open.subject}» ثبت شد.`,
        readAt: null,
      },
    });
    notifications += 1;
    await prisma.notificationDelivery.deleteMany({
      where: { notificationId: n1.id },
    });
    await prisma.notificationDelivery.create({
      data: {
        notificationId: n1.id,
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.SENT,
        templateKey: "notify.ticket_created",
        sentAt: new Date(),
        attemptCount: 1,
      },
    });
  }

  if (reza) {
    const waiting = await prisma.ticket.upsert({
      where: { id: "seed_ticket_reza_waiting" },
      create: {
        id: "seed_ticket_reza_waiting",
        userId: reza.id,
        courseId: course?.id ?? null,
        subject: "مشکل پخش ویدیو",
        description:
          "ویدیوی جلسه اول روی ویندوز پخش نمی‌شود. از اسپات‌پلیر نسخه جدید استفاده می‌کنم.",
        status: TicketStatus.WAITING_FOR_USER,
      },
      update: {
        status: TicketStatus.WAITING_FOR_USER,
        courseId: course?.id ?? null,
      },
    });
    tickets += 1;

    await prisma.ticketMessage.deleteMany({ where: { ticketId: waiting.id } });
    await prisma.ticketMessage.createMany({
      data: [
        {
          id: "seed_msg_reza_1",
          ticketId: waiting.id,
          authorId: reza.id,
          authorRole: TicketAuthorRole.STUDENT,
          body: waiting.description,
        },
        {
          id: "seed_msg_reza_2",
          ticketId: waiting.id,
          authorId: admin.id,
          authorRole: TicketAuthorRole.ADMIN,
          body: "لطفاً نسخه دقیق اسپات‌پلیر و اسکرین‌شات خطا را بفرستید.",
        },
      ],
    });
    messages += 2;

    const n2 = await prisma.notification.upsert({
      where: { id: "seed_notify_reza_reply" },
      create: {
        id: "seed_notify_reza_reply",
        userId: reza.id,
        eventType: NotificationEventType.TICKET_REPLY,
        title: "پاسخ جدید تیکت",
        body: `پاسخ جدیدی برای تیکت «${waiting.subject}» ثبت شد.`,
        payload: { ticketId: waiting.id },
      },
      update: {
        body: `پاسخ جدیدی برای تیکت «${waiting.subject}» ثبت شد.`,
        readAt: null,
      },
    });
    notifications += 1;
    await prisma.notificationDelivery.deleteMany({
      where: { notificationId: n2.id },
    });
    await prisma.notificationDelivery.createMany({
      data: [
        {
          notificationId: n2.id,
          channel: NotificationChannel.IN_APP,
          status: NotificationDeliveryStatus.SENT,
          templateKey: "notify.ticket_reply",
          sentAt: new Date(),
          attemptCount: 1,
        },
        {
          notificationId: n2.id,
          channel: NotificationChannel.EMAIL,
          status: NotificationDeliveryStatus.SENT,
          templateKey: "notify.ticket_reply",
          destination: "reza@example.com",
          sentAt: new Date(),
          attemptCount: 1,
        },
      ],
    });
  }

  return { tickets, messages, notifications };
}

async function seedCommerce(
  students: { id: string; username: string }[],
) {
  const zarinpalCreds = Boolean(process.env.ZARINPAL_MERCHANT_ID?.trim());
  // Sandbox pin `sandbox` is usable without a merchant PIN (docs).
  const aqayeSandbox =
    (process.env.AQAYE_PARDAKHT_SANDBOX ?? "true").toLowerCase() !== "false";
  const aqayeCreds =
    Boolean(process.env.AQAYE_PARDAKHT_PIN?.trim()) || aqayeSandbox;

  for (const provider of [
    PaymentProvider.ZARINPAL,
    PaymentProvider.AQAYE_PARDAKHT,
  ] as const) {
    const present =
      provider === PaymentProvider.ZARINPAL ? zarinpalCreds : aqayeCreds;
    await prisma.paymentGatewaySetting.upsert({
      where: { provider },
      create: {
        provider,
        technicalEnabled: true,
        checkoutVisible: true,
        isDefault: provider === PaymentProvider.AQAYE_PARDAKHT,
        sandboxMode: true,
        credentialsStatus: present
          ? GatewayCredentialsStatus.PRESENT
          : GatewayCredentialsStatus.MISSING,
      },
      update: {
        credentialsStatus: present
          ? GatewayCredentialsStatus.PRESENT
          : GatewayCredentialsStatus.MISSING,
      },
    });
  }

  const coupons = [
    {
      code: "DEEP20",
      discountType: CouponDiscountType.PERCENT,
      percentOff: "20",
      maxDiscountToman: "500000",
      maxRedemptions: 100,
    },
    {
      code: "TOMAN50K",
      discountType: CouponDiscountType.FIXED_TOMAN,
      amountOffToman: "50000",
      minOrderToman: "200000",
      maxRedemptions: 50,
    },
  ] as const;

  for (const c of coupons) {
    const codeNormalized = c.code.toUpperCase();
    await prisma.coupon.upsert({
      where: { codeNormalized },
      create: {
        code: c.code,
        codeNormalized,
        discountType: c.discountType,
        percentOff: "percentOff" in c ? c.percentOff : null,
        amountOffToman: "amountOffToman" in c ? c.amountOffToman : null,
        minOrderToman: "minOrderToman" in c ? c.minOrderToman : null,
        maxDiscountToman: "maxDiscountToman" in c ? c.maxDiscountToman : null,
        maxRedemptions: c.maxRedemptions,
        active: true,
      },
      update: {
        code: c.code,
        discountType: c.discountType,
        percentOff: "percentOff" in c ? c.percentOff : null,
        amountOffToman: "amountOffToman" in c ? c.amountOffToman : null,
        minOrderToman: "minOrderToman" in c ? c.minOrderToman : null,
        maxDiscountToman: "maxDiscountToman" in c ? c.maxDiscountToman : null,
        maxRedemptions: c.maxRedemptions,
        active: true,
      },
    });
  }

  const paidCourse = await prisma.course.findFirst({
    where: {
      publicationStatus: CoursePublicationStatus.PUBLISHED,
      offerKind: CourseOfferKind.PAID,
    },
    orderBy: { sortOrder: "asc" },
  });
  const sara = students.find((s) => s.username === "sara");
  const reza = students.find((s) => s.username === "reza");

  let sampleOrders = 0;
  if (paidCourse && sara) {
    // Honest sample: awaiting gateway — never seeded as PAID without verify.
    const pending = await prisma.order.upsert({
      where: { id: "seed_order_sara_pending" },
      create: {
        id: "seed_order_sara_pending",
        userId: sara.id,
        courseId: paidCourse.id,
        listPriceToman: paidCourse.priceToman,
        discountToman: 0,
        amountToman: paidCourse.priceToman,
        currency: "IRT",
        status: OrderStatus.AWAITING_GATEWAY,
        paymentProvider: PaymentProvider.ZARINPAL,
      },
      update: {
        status: OrderStatus.AWAITING_GATEWAY,
        listPriceToman: paidCourse.priceToman,
        amountToman: paidCourse.priceToman,
      },
    });
    await prisma.paymentTransaction.upsert({
      where: { idempotencyKey: "seed:zarinpal:sara-pending" },
      create: {
        orderId: pending.id,
        provider: PaymentProvider.ZARINPAL,
        status: PaymentTransactionStatus.REDIRECTED,
        amountToman: paidCourse.priceToman,
        gatewayAuthority: "SEED-AUTHORITY-SARA",
        idempotencyKey: "seed:zarinpal:sara-pending",
      },
      update: {
        status: PaymentTransactionStatus.REDIRECTED,
      },
    });
    sampleOrders += 1;
  }

  if (paidCourse && reza) {
    await prisma.order.upsert({
      where: { id: "seed_order_reza_failed" },
      create: {
        id: "seed_order_reza_failed",
        userId: reza.id,
        courseId: paidCourse.id,
        listPriceToman: paidCourse.priceToman,
        discountToman: 0,
        amountToman: paidCourse.priceToman,
        currency: "IRT",
        status: OrderStatus.FAILED,
        paymentProvider: PaymentProvider.AQAYE_PARDAKHT,
      },
      update: {
        status: OrderStatus.FAILED,
        listPriceToman: paidCourse.priceToman,
        amountToman: paidCourse.priceToman,
      },
    });
    sampleOrders += 1;
  }

  const spotKeyPresent = Boolean(process.env.SPOTPLAYER_API_KEY?.trim());
  await prisma.spotPlayerSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      technicalEnabled: true,
      testMode: true,
      credentialsStatus: spotKeyPresent
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING,
      licenseEndpoint: "https://panel.spotplayer.ir/license/edit/",
    },
    update: {
      credentialsStatus: spotKeyPresent
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING,
    },
  });

  // Placeholder SpotPlayer course ids for demo mapping — not real licenses.
  const freeCourse = await prisma.course.findFirst({
    where: {
      publicationStatus: CoursePublicationStatus.PUBLISHED,
      offerKind: CourseOfferKind.FREE,
    },
  });
  let mappings = 0;
  if (paidCourse) {
    await prisma.spotPlayerCourseMapping.upsert({
      where: { courseId: paidCourse.id },
      create: {
        courseId: paidCourse.id,
        spotPlayerCourseId: "seed_spotplayer_paid_course_placeholder",
        enabled: true,
      },
      update: {
        spotPlayerCourseId: "seed_spotplayer_paid_course_placeholder",
        enabled: true,
      },
    });
    mappings += 1;
  }
  // Free courses are watched on-site; do not enable SpotPlayer mapping for them.
  if (freeCourse) {
    await prisma.spotPlayerCourseMapping.deleteMany({
      where: { courseId: freeCourse.id },
    });
  }

  return {
    coupons: coupons.length,
    gatewaySettings: 2,
    sampleOrders,
    spotPlayerMappings: mappings,
    spotPlayerLicensesSeeded: 0,
    note: "No PAID sample orders and no SUCCEEDED SpotPlayer licenses — require real provider responses.",
    spotPlayerLicenseDefault: SpotPlayerLicenseStatus.PENDING,
  };
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
