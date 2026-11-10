import {
  CourseDiagramKind,
  CourseOfferKind,
  CoursePublicationStatus,
} from "@prisma/client";

export type SeedLesson = {
  title: string;
  summary?: string;
  durationMinutes?: number;
  isPreview?: boolean;
  previewAsset?: string;
};

export type SeedModule = {
  title: string;
  summary?: string;
  lessons: SeedLesson[];
};

export type SeedCourse = {
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
  modules: SeedModule[];
};

export type SeedCategory = {
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
};

export type SeedPath = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverAsset: string;
  published: boolean;
  sortOrder: number;
  steps: {
    courseSlug: string;
    title: string;
    summary: string;
    slug?: string;
    body?: string;
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
    noIndex?: boolean;
  }[];
};

const published = CoursePublicationStatus.PUBLISHED;

function course(
  input: Omit<SeedCourse, "lessonCount" | "durationHours" | "diagramKind" | "chainNodes"> &
    Partial<Pick<SeedCourse, "diagramKind" | "chainNodes">>,
): SeedCourse {
  const lessons = input.modules.flatMap((mod) => mod.lessons);
  const minutes = lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes ?? 0), 0);
  return {
    diagramKind: CourseDiagramKind.BOUNDARY,
    chainNodes: [],
    ...input,
    lessonCount: lessons.length,
    durationHours: (minutes / 60).toFixed(1),
  };
}

export const EXTRA_CATEGORIES: SeedCategory[] = [
  {
    slug: "data",
    title: "داده",
    summary: "مدل، پرس‌وجو و ذخیره‌ای که با سؤال محصول جور باشد.",
    sortOrder: 4,
  },
  {
    slug: "delivery",
    title: "تحویل نرم‌افزار",
    summary: "از تغییر روزانه تا تست و بازآرایی، بدون نمایش تشریفاتی.",
    sortOrder: 5,
  },
];

export const EXTRA_COURSES: SeedCourse[] = [
  course({
    slug: "sql-for-engineers",
    title: "SQL برای مهندس",
    summary: "پرس‌وجو را از روی سؤال محصول بنویس، نه از روی عادت SELECT *.",
    description:
      "دوره‌ای برای کسی که جدول دارد ولی هنوز مطمئن نیست JOIN، فیلتر و ایندکس را کجا خرج کند. مثال‌ها روی مسئلهٔ گزارش و صحت داده است، نه دستورهای جدا از زمینه.",
    categorySlug: "data",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "980000",
    compareAtToman: "1250000",
    levelLabel: "متوسط",
    featured: true,
    sortOrder: 7,
    coverAsset: "/artwork/courses/sql-for-engineers.svg",
    indexLabel: "۰۷",
    diagramCode: "QUERY / ROW",
    publishedAt: new Date("2026-02-10T00:00:00.000Z"),
    modules: [
      {
        title: "سؤال قبل از دستور",
        summary: "هر پرس‌وجو باید یک سؤال مشخص را جواب بدهد.",
        lessons: [
          { title: "چه سطری را می‌خواهیم و چرا", durationMinutes: 16, isPreview: true, summary: "خروجی را قبل از FROM بنویس." },
          { title: "فیلتر، مرتب‌سازی و محدودیت", durationMinutes: 18 },
          { title: "NULL را جدی بگیر", durationMinutes: 14, summary: "مقایسه با NULL با = یکی نیست." },
        ],
      },
      {
        title: "چند جدول",
        lessons: [
          { title: "کلید و رابطه", durationMinutes: 20 },
          { title: "INNER و LEFT را با مثال سفارش", durationMinutes: 24 },
          { title: "تجمیع بدون دو برابر شمردن", durationMinutes: 22 },
        ],
      },
      {
        title: "خواندن طرح اجرا",
        lessons: [
          { title: "ایندکس چه چیزی را ارزان می‌کند", durationMinutes: 18 },
          { title: "وقتی پرس‌وجو کند است", durationMinutes: 20 },
          { title: "تمرین: گزارش ثبت‌نام", durationMinutes: 26 },
        ],
      },
    ],
  }),
  course({
    slug: "postgres-practice",
    title: "Postgres از نزدیک",
    summary: "نوع، قید، تراکنش و مهاجرت؛ پایگاه را مثل یک سرویس بشناس.",
    description:
      "برای کسی که SQL را بلد است و می‌خواهد طرح جدول، قید یکتایی، تراکنش و مهاجرت را طوری بنویسد که فردا قابل تغییر بماند.",
    categorySlug: "data",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "1890000",
    levelLabel: "متوسط",
    featured: false,
    sortOrder: 8,
    coverAsset: "/artwork/courses/postgres-practice.svg",
    indexLabel: "۰۸",
    diagramCode: "TABLE / TX",
    publishedAt: new Date("2026-03-02T00:00:00.000Z"),
    modules: [
      {
        title: "طرح جدول",
        lessons: [
          { title: "نوع مناسب به جای رشتهٔ همه‌کاره", durationMinutes: 18, isPreview: true },
          { title: "قید یکتایی و کلید خارجی", durationMinutes: 20 },
          { title: "زمان و منطقهٔ زمانی", durationMinutes: 16 },
        ],
      },
      {
        title: "تراکنش",
        lessons: [
          { title: "چه چیزی باید اتمی باشد", durationMinutes: 18 },
          { title: "ایزوله‌سازی را با تعارض ببین", durationMinutes: 22 },
          { title: "قفل و بن‌بست در کار روزمره", durationMinutes: 16 },
        ],
      },
      {
        title: "مهاجرت",
        lessons: [
          { title: "تغییر سازگار با دادهٔ موجود", durationMinutes: 20 },
          { title: "ایندکس همزمان", durationMinutes: 14 },
          { title: "تمرین: افزودن وضعیت سفارش", durationMinutes: 24 },
        ],
      },
    ],
  }),
  course({
    slug: "git-daily",
    title: "گیت در کار روزانه",
    summary: "تاریخچهٔ قابل‌خواندن؛ نه انبوهی از کامیت‌های «فیکس».",
    description:
      "دورهٔ رایگان برای عادت‌های روزمره: شاخهٔ کوتاه، کامیت قابل‌توضیح، و بیرون آمدن از وضعیت درهم بدون پاک کردن تاریخ.",
    categorySlug: "delivery",
    publicationStatus: published,
    offerKind: CourseOfferKind.FREE,
    priceToman: "0",
    levelLabel: "مقدماتی",
    featured: true,
    sortOrder: 9,
    coverAsset: "/artwork/courses/git-daily.svg",
    indexLabel: "۰۹",
    diagramCode: "COMMIT / BRANCH",
    diagramKind: CourseDiagramKind.CHAIN,
    chainNodes: ["WORK", "COMMIT", "MAIN"],
    publishedAt: new Date("2026-01-15T00:00:00.000Z"),
    modules: [
      {
        title: "یک تغییر، یک داستان",
        lessons: [
          { title: "وضعیت، مرحله و کامیت", durationMinutes: 14, isPreview: true },
          { title: "پیام کامیت که فردا به کارت می‌آید", durationMinutes: 12 },
          { title: "diff را قبل از ثبت بخوان", durationMinutes: 16 },
        ],
      },
      {
        title: "شاخه",
        lessons: [
          { title: "شاخهٔ کوتاه برای یک مسئله", durationMinutes: 15 },
          { title: "ادغام و rebase را با هم قاطی نکن", durationMinutes: 18 },
          { title: "تعارض را حل کن، تاریخ را پاک نکن", durationMinutes: 16 },
        ],
      },
      {
        title: "بازگشت",
        lessons: [
          { title: "وقتی کامیت اشتباه رفته روی شاخهٔ مشترک", durationMinutes: 14 },
          { title: "بازیابی فایل بدون reset خطرناک", durationMinutes: 12 },
        ],
      },
    ],
  }),
  course({
    slug: "testing-without-theater",
    title: "تست بدون نمایش",
    summary: "تستی که با تغییر رفتار می‌شکند، نه با تغییر نام متغیر.",
    description:
      "عادت نوشتن تست برای قانون کسب‌وکار و مرزهای شکننده. هدف پوشش صوری نیست؛ هدف این است که اشتباه فردا را امروز ببینی.",
    categorySlug: "delivery",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "1350000",
    levelLabel: "متوسط",
    featured: false,
    sortOrder: 10,
    coverAsset: "/artwork/courses/testing-without-theater.svg",
    indexLabel: "۱۰",
    diagramCode: "ASSERT / BEHAVIOR",
    publishedAt: new Date("2026-04-04T00:00:00.000Z"),
    modules: [
      {
        title: "چه چیزی ارزش تست دارد",
        lessons: [
          { title: "قانون در برابر جزئیات پیاده‌سازی", durationMinutes: 16, isPreview: true },
          { title: "یک ادعا در هر تست", durationMinutes: 14 },
          { title: "نام تست مثل شرح باگ", durationMinutes: 12 },
        ],
      },
      {
        title: "مرزها",
        lessons: [
          { title: "ورودی نامعتبر و حالت خالی", durationMinutes: 18 },
          { title: "زمان و شناسه را تزریق کن", durationMinutes: 16 },
          { title: "تست یکپارچه فقط جایی که قرارداد مهم است", durationMinutes: 20 },
        ],
      },
      {
        title: "تمرین",
        lessons: [
          { title: "قیمت بعد از تخفیف", durationMinutes: 22 },
          { title: "وقتی تست سبز است ولی محصول غلط است", durationMinutes: 14 },
        ],
      },
    ],
  }),
  course({
    slug: "http-contracts",
    title: "قرارداد HTTP",
    summary: "وضعیت، بدنه و خطا بخشی از رابط‌اند، نه جزئیات فریم‌ورک.",
    description:
      "طراحی API را از روش، مسیر و کد وضعیت شروع می‌کنیم. تمرکز روی قراردادی است که کلاینت بتواند به آن تکیه کند.",
    categorySlug: "architecture",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "1490000",
    compareAtToman: "1750000",
    levelLabel: "متوسط",
    featured: false,
    sortOrder: 11,
    coverAsset: "/artwork/courses/http-contracts.svg",
    indexLabel: "۱۱",
    diagramCode: "METHOD / STATUS",
    publishedAt: new Date("2026-05-12T00:00:00.000Z"),
    modules: [
      {
        title: "منبع و روش",
        lessons: [
          { title: "اسم منبع به جای فعل در مسیر", durationMinutes: 15, isPreview: true },
          { title: "GET نباید چیزی را عوض کند", durationMinutes: 14 },
          { title: "ایجاد، جایگزینی و به‌روزرسانی جزئی", durationMinutes: 18 },
        ],
      },
      {
        title: "خطا",
        lessons: [
          { title: "۴۰۰، ۴۰۱، ۴۰۳ و ۴۰۴ را قاطی نکن", durationMinutes: 16 },
          { title: "بدنهٔ خطا که قابل‌نمایش است", durationMinutes: 14 },
          { title: "تکرار درخواست و یک‌بار مصرف بودن", durationMinutes: 18 },
        ],
      },
      {
        title: "نسخه و سازگاری",
        lessons: [
          { title: "فیلد جدید را بشکن، فیلد قدیمی را ناگهان حذف نکن", durationMinutes: 16 },
          { title: "تمرین: قرارداد خرید دوره", durationMinutes: 22 },
        ],
      },
    ],
  }),
  course({
    slug: "auth-without-magic",
    title: "احراز هویت بدون جادو",
    summary: "نشست، رمز و مرز اعتماد را خودت بتوانی توضیح بدهی.",
    description:
      "از هش رمز تا کوکی نشست و تفاوت ورود با مجوز. کتابخانه کمک می‌کند، ولی تصمیم امنیتی را پنهان نمی‌کند.",
    categorySlug: "systems-security",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "2150000",
    levelLabel: "پیشرفته",
    featured: true,
    sortOrder: 12,
    coverAsset: "/artwork/courses/auth-without-magic.svg",
    indexLabel: "۱۲",
    diagramCode: "SESSION / BOUNDARY",
    publishedAt: new Date("2026-06-01T00:00:00.000Z"),
    modules: [
      {
        title: "رمز",
        lessons: [
          { title: "چرا رمز را ذخیره نمی‌کنیم", durationMinutes: 14, isPreview: true },
          { title: "هش کند و نمک", durationMinutes: 16 },
          { title: "بازیابی رمز بدون لو دادن حساب", durationMinutes: 18 },
        ],
      },
      {
        title: "نشست",
        lessons: [
          { title: "کوکی HttpOnly و عمر نشست", durationMinutes: 18 },
          { title: "خروج و باطل کردن نشست‌ها", durationMinutes: 14 },
          { title: "ورود از دستگاه تازه", durationMinutes: 16 },
        ],
      },
      {
        title: "مجوز",
        lessons: [
          { title: "احراز هویت با مجوز یکی نیست", durationMinutes: 15 },
          { title: "بررسی سمت سرور برای هر عمل حساس", durationMinutes: 18 },
          { title: "تمرین: نقش دانشجو و صاحب", durationMinutes: 20 },
        ],
      },
    ],
  }),
  course({
    slug: "refactor-in-place",
    title: "بازآرایی سرِ جایش",
    summary: "رفتار را نگه دار و شکل کد را عوض کن؛ یک قدم در هر بار.",
    description:
      "برای کدبیسی که باید همین هفته تغییر کند. بازآرایی‌های کوچک، تست محافظ، و پرهیز از بازنویسی بزرگ بدون شبکهٔ ایمنی.",
    categorySlug: "delivery",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "1620000",
    levelLabel: "متوسط",
    featured: false,
    sortOrder: 13,
    coverAsset: "/artwork/courses/refactor-in-place.svg",
    indexLabel: "۱۳",
    diagramCode: "BEHAVIOR / SHAPE",
    publishedAt: new Date("2026-06-20T00:00:00.000Z"),
    modules: [
      {
        title: "قبل از جابه‌جایی",
        lessons: [
          { title: "رفتار فعلی را نام‌گذاری کن", durationMinutes: 14, isPreview: true },
          { title: "تست محافظ برای مسیر اصلی", durationMinutes: 16 },
          { title: "یک تعهد، یک نوع تغییر", durationMinutes: 12 },
        ],
      },
      {
        title: "حرکت‌های کوچک",
        lessons: [
          { title: "استخراج تابع وقتی نام پیدا شد", durationMinutes: 16 },
          { title: "دادهٔ درهم را به شیء کوچک برگردان", durationMinutes: 18 },
          { title: "شاخهٔ شرطی را کم کن نه پنهان", durationMinutes: 16 },
        ],
      },
      {
        title: "توقف به‌موقع",
        lessons: [
          { title: "بازنویسی وقتی بازآرایی کافی نیست", durationMinutes: 14 },
          { title: "تمرین: تابع قیمت‌گذاری", durationMinutes: 24 },
        ],
      },
    ],
  }),
  course({
    slug: "background-jobs",
    title: "کار پس‌زمینه",
    summary: "صف، تکرار و شکست؛ کاری که نباید داخل درخواست وب بماند.",
    description:
      "پیش‌فروش دوره‌ای دربارهٔ جدا کردن کار کند از پاسخ HTTP. تاریخ انتشار نهایی بعد از تمام شدن نمونه‌های صف اعلام می‌شود.",
    categorySlug: "systems-security",
    publicationStatus: published,
    offerKind: CourseOfferKind.PRE_SALE,
    priceToman: "1680000",
    compareAtToman: "1980000",
    levelLabel: "متوسط",
    featured: false,
    sortOrder: 14,
    coverAsset: "/artwork/courses/background-jobs.svg",
    indexLabel: "۱۴",
    diagramCode: "QUEUE / RETRY",
    diagramKind: CourseDiagramKind.CHAIN,
    chainNodes: ["HTTP", "QUEUE", "WORKER"],
    publishedAt: new Date("2026-08-01T00:00:00.000Z"),
    modules: [
      {
        title: "چه کاری باید بیرون برود",
        lessons: [
          { title: "پاسخ کاربر را معطل ایمیل نکن", durationMinutes: 14, isPreview: true },
          { title: "پیام صف چه چیزی را حمل کند", durationMinutes: 16 },
        ],
      },
      {
        title: "شکست",
        lessons: [
          { title: "تکرار، مهلت و کار مرده", durationMinutes: 18 },
          { title: "یک‌بار اجرا شدن را طراحی کن", durationMinutes: 18 },
          { title: "تمرین: صدور لایسنس بعد از پرداخت", durationMinutes: 20 },
        ],
      },
    ],
  }),
  course({
    slug: "rtl-interfaces",
    title: "رابط راست‌به‌چپ",
    summary: "چیدمان فارسی که با ترجمهٔ یک دکمه به‌هم نریزد.",
    description:
      "جهت، فاصله، عدد و فرم در رابط فارسی. دوره کوتاه است و روی جزئیاتی می‌ماند که در محصول واقعی دیده می‌شوند.",
    categorySlug: "fundamentals",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "790000",
    levelLabel: "مقدماتی",
    featured: false,
    sortOrder: 15,
    coverAsset: "/artwork/courses/rtl-interfaces.svg",
    indexLabel: "۱۵",
    diagramCode: "DIR / START",
    publishedAt: new Date("2026-07-08T00:00:00.000Z"),
    modules: [
      {
        title: "جهت",
        lessons: [
          { title: "dir و شروع منطقی به جای چپ و راست", durationMinutes: 16, isPreview: true },
          { title: "آیکون و فلش که جهت دارند", durationMinutes: 12 },
          { title: "عدد و قیمت در متن فارسی", durationMinutes: 14 },
        ],
      },
      {
        title: "فرم",
        lessons: [
          { title: "برچسب، خطا و ترتیب خواندن", durationMinutes: 15 },
          { title: "ورودی انگلیسی داخل صفحهٔ فارسی", durationMinutes: 14 },
          { title: "تمرین: کارت دوره", durationMinutes: 18 },
        ],
      },
    ],
  }),
  course({
    slug: "domain-words",
    title: "واژه‌های دامنه",
    summary: "اسم چیزها را از زبان مسئله بردار، نه از نام جدول.",
    description:
      "مدل‌سازی را با واژه‌هایی شروع می‌کنیم که مدرس و خریدار هر دو می‌فهمند: دوره، سفارش، دسترسی. بعد می‌بینیم این واژه‌ها کجا نباید به جزئیات پایگاه نشت کنند.",
    categorySlug: "architecture",
    publicationStatus: published,
    offerKind: CourseOfferKind.PAID,
    priceToman: "2280000",
    levelLabel: "پیشرفته",
    featured: true,
    sortOrder: 16,
    coverAsset: "/artwork/courses/domain-words.svg",
    indexLabel: "۱۶",
    diagramCode: "WORD / MODEL",
    publishedAt: new Date("2026-09-01T00:00:00.000Z"),
    modules: [
      {
        title: "زبان مشترک",
        lessons: [
          { title: "یک اسم، یک معنی", durationMinutes: 16, isPreview: true },
          { title: "وضعیت‌هایی که واقعاً فرق دارند", durationMinutes: 18 },
          { title: "چه کلمه‌ای را در رابط نشان ندهیم", durationMinutes: 12 },
        ],
      },
      {
        title: "مرز مدل",
        lessons: [
          { title: "قانون قیمت داخل دامنه", durationMinutes: 20 },
          { title: "درگاه و پایگاه مهمان‌اند", durationMinutes: 18 },
          { title: "شناسه را با معنی قاطی نکن", durationMinutes: 14 },
        ],
      },
      {
        title: "تمرین ژرفا",
        lessons: [
          { title: "سفارش، پرداخت و دسترسی سه چیزند", durationMinutes: 22 },
          { title: "بازبینی واژه‌های یک صفحهٔ خرید", durationMinutes: 16 },
        ],
      },
    ],
  }),
];

export const EXTRA_PATHS: SeedPath[] = [
  {
    slug: "data-before-dashboard",
    title: "داده را قبل از نمودار بفهم",
    summary: "از پرس‌وجو تا طرح Postgres، بدون پرش به ابزار نمایش.",
    description:
      "اگر گزارش یا حساب کاربری می‌سازی، اول سؤال و جدول را روشن کن. این مسیر ترتیب پیشنهادی است و خرید یک دوره بقیه را اجباری نمی‌کند.",
    coverAsset: "/artwork/paths/data-before-dashboard.svg",
    published: true,
    sortOrder: 3,
    steps: [
      {
        courseSlug: "sql-for-engineers",
        title: "پرس‌وجوی دقیق",
        summary: "سؤال را به SQL قابل‌توضیح تبدیل کن.",
      },
      {
        courseSlug: "postgres-practice",
        title: "طرح و تراکنش",
        summary: "جدول را طوری عوض کن که دادهٔ موجود نشکند.",
      },
    ],
  },
  {
    slug: "ship-a-small-change",
    title: "یک تغییر کوچک را سالم برسان",
    summary: "گیت، تست و بازآرایی برای کسی که همین هفته باید کد را تحویل بدهد.",
    description:
      "مسیر تحویل روزانه. هر گام دورهٔ جداست؛ رایگان یا پولی بودنش روی همان صفحهٔ دوره نوشته شده است.",
    coverAsset: "/artwork/paths/ship-a-small-change.svg",
    published: true,
    sortOrder: 4,
    steps: [
      {
        courseSlug: "git-daily",
        title: "تاریخچهٔ خوانا",
        summary: "تغییر را کوچک و قابل‌برگشت ثبت کن.",
      },
      {
        courseSlug: "testing-without-theater",
        title: "شبکهٔ ایمنی",
        summary: "رفتاری را تست کن که نباید بی‌صدا عوض شود.",
      },
      {
        courseSlug: "refactor-in-place",
        title: "شکل بهتر، رفتار قبلی",
        summary: "بعد از تست، ساختار را یک قدم جابه‌جا کن.",
      },
    ],
  },
  {
    slug: "account-and-access",
    title: "حساب، پرداخت، دسترسی",
    summary: "واژه‌ها و مرز اعتماد برای محصولی که دوره می‌فروشد.",
    description:
      "این مسیر برای فهم تفاوت ورود، سفارش و دسترسی ویدیو است. لایسنس اسپات‌پلیر همچنان مرحلهٔ جداگانه‌ای است و اینجا موفق فرض نمی‌شود.",
    coverAsset: "/artwork/paths/account-and-access.svg",
    published: true,
    sortOrder: 5,
    steps: [
      {
        courseSlug: "auth-without-magic",
        title: "ورود و مجوز",
        summary: "نشست را بفهم، بعد سراغ پرداخت برو.",
      },
      {
        courseSlug: "domain-words",
        title: "سه مفهوم جدا",
        summary: "سفارش، پرداخت و دسترسی را یکی ننام.",
      },
      {
        courseSlug: "background-jobs",
        title: "کار بعد از پرداخت",
        summary: "پیش‌فروش؛ صدور دسترسی نباید پاسخ درگاه را معطل کند.",
      },
    ],
  },
];

export const EXTRA_FAQS = [
  {
    id: "seed_faq_4",
    question: "تخفیف روی کارت دوره از کجا می‌آید؟",
    answer:
      "اگر برای دوره قیمت قبلی ثبت شده باشد و از قیمت فعلی بیشتر باشد، همان تفاوت روی کارت نشان داده می‌شود. کوپن جداست و فقط هنگام تسویه‌حساب روی سرور حساب می‌شود.",
    sortOrder: 4,
  },
  {
    id: "seed_faq_5",
    question: "سبد خرید یعنی همهٔ دوره‌ها با یک پرداخت تمام می‌شوند؟",
    answer:
      "نه. سبد فقط فهرست دوره‌هایی است که جدا کرده‌ای. پرداخت هر دوره جداست و مبلغ را سرور در صفحهٔ خرید همان دوره حساب می‌کند.",
    sortOrder: 5,
  },
  {
    id: "seed_faq_6",
    question: "دورهٔ رایگان هم لایسنس ویدیو می‌خواهد؟",
    answer:
      "ثبت‌نام رایگان از درگاه رد نمی‌شود، ولی ویدیوی محافظت‌شده همچنان به پاسخ اسپات‌پلیر وابسته است. تا صدور لایسنس، دسترسی موفق نشان داده نمی‌شود.",
    sortOrder: 6,
  },
  {
    id: "seed_faq_7",
    question: "پیش‌فروش با دورهٔ منتشرشده چه فرقی دارد؟",
    answer:
      "پیش‌فروش یعنی سرفصل و قیمت اعلام شده، ولی برنامهٔ انتشار هنوز نهایی است. وضعیت روی کارت و صفحهٔ دوره نوشته می‌شود.",
    sortOrder: 7,
  },
  {
    id: "seed_faq_8",
    question: "مسیر یادگیری را باید کامل بخرم؟",
    answer:
      "نه. مسیر فقط ترتیب پیشنهادی است. هر دوره را جدا می‌توانی بخری یا رها کنی.",
    sortOrder: 8,
  },
  {
    id: "seed_faq_9",
    question: "اگر پرداخت نامعلوم ماند چه کار کنم؟",
    answer:
      "وضعیت سفارش در حسابت همان چیزی است که سرور بعد از تطبیق با درگاه ثبت کرده. اگر هنوز نامعلوم است، از تیکت پشتیبانی پیگیری کن و صفحه را پرداخت‌شده فرض نکن.",
    sortOrder: 9,
  },
];

export const EXTRA_ARTICLES = [
  {
    id: "seed_article_sql",
    slug: "question-before-query",
    title: "قبل از JOIN، سؤال را بنویس",
    summary: "پرس‌وجوی خوب با نام جدول شروع نمی‌شود؛ با سطری شروع می‌شود که باید ببینی.",
    coverAsset: "/artwork/journal/question-before-query.svg",
    sortOrder: 4,
    readingMinutes: 5,
    body: `خیلی از پرس‌وجوهای کند، کند نیستند؛ بی‌سؤال‌اند. اول نوشته می‌شود SELECT * و بعد امیدواریم WHERE نجاتمان بدهد.

## یک خط برای خروجی

قبل از باز کردن ویرایشگر، بنویس این گزارش کدام سطر را به چه کسی نشان می‌دهد. اگر جواب «همه چیز» است، هنوز سؤال نداری.

## JOIN جای مدل نیست

رابطهٔ جدول‌ها را JOIN بیان می‌کند، ولی معنی «سفارش پرداخت‌شده» را نه. آن معنی باید در وضعیت سفارش باشد، نه در ترکیبی که فقط امروز کار می‌کند.

وقتی سؤال روشن شد، ایندکس و طرح اجرا ابزارند. زودتر از سؤال سراغشان نرو.`,
  },
  {
    id: "seed_article_commit",
    slug: "a-commit-you-can-read",
    title: "کامیتی که هفتهٔ بعد خوانده می‌شود",
    summary: "پیام کامیت برای تو در همان ساعت نوشته نمی‌شود؛ برای کسی است که باید تغییر را برگرداند.",
    coverAsset: "/artwork/journal/a-commit-you-can-read.svg",
    sortOrder: 5,
    readingMinutes: 4,
    body: `«فیکس» و «آپدیت» تاریخچه نمی‌سازند. هفتهٔ بعد فقط می‌فهمی چیزی عوض شده، نه چرا.

## یک مسئله در هر کامیت

اگر هم قیمت را عوض کردی و هم متن دکمه را، برگشت یکی دیگری را هم برمی‌گرداند. جدا کردنشان کندتر به نظر می‌رسد و ارزان‌تر درمی‌آید.

## بدنهٔ پیام

سطر اول بگوید چه رفتاری عوض شد. اگر تصمیم غیرواضح است، دو خط دلیل کافی است. لینک تیکت اگر هست، جایگزین توضیح نیست.

شاخهٔ بلند این عادت را خراب می‌کند. تغییر را کوچک نگه دار تا پیام مجبور شود دقیق باشد.`,
  },
  {
    id: "seed_article_status",
    slug: "three-words-for-access",
    title: "سفارش، پرداخت، دسترسی",
    summary: "این سه کلمه در ژرفا یکی نیستند و صفحه نباید آن‌ها را یکی نشان بدهد.",
    coverAsset: "/artwork/journal/three-words-for-access.svg",
    sortOrder: 6,
    readingMinutes: 4,
    body: `کاربر اغلب می‌پرسد «خریدم، پس چرا ویدیو باز نمی‌شود؟» جواب در قاطی شدن سه وضعیت است.

## سفارش

سفارش یعنی قصد خرید یک دوره با مبلغی که سرور حساب کرده. تا تطبیق با درگاه، پرداخت‌شده نیست.

## پرداخت

پرداخت وقتی ثبت می‌شود که سرور پاسخ درگاه را تأیید کند. برگشت مرورگر به‌تنهایی کافی نیست.

## دسترسی

دسترسی ویدیوی محافظت‌شده لایسنس اسپات‌پلیر است. حتی سفارش پرداخت‌شده تا جواب ارائه‌دهنده، دسترسی موفق نیست.

اگر این سه را در یک برچسب سبز جمع کنی، پشتیبانی فردا باید همان را باز کند.`,
  },
  {
    id: "seed_article_test",
    slug: "tests-that-name-the-bug",
    title: "تستی که اسم باگ را دارد",
    summary: "نام تست باید بگوید چه رفتاری نباید بشکند، نه اینکه کدام تابع صدا زده شده.",
    coverAsset: "/artwork/journal/tests-that-name-the-bug.svg",
    sortOrder: 7,
    readingMinutes: 4,
    body: `تستی که با تغییر نام متغیر قرمز می‌شود، شبکهٔ ایمنی نیست. فقط بازنویسی را گران می‌کند.

## یک رفتار

«قیمت بعد از تخفیف از قیمت فعلی کمتر است» یک تست است. «متد calculate را صدا می‌زند» تست نیست؛ جزئیات امروزِ پیاده‌سازی است.

## مسیر خالی و ورودی بد

محصول بیشتر از مسیر قشنگ، در سبد خالی و کد تخفیف نامعتبر می‌شکند. همان‌ها را اول بنویس.

اگر تست‌ها سبزند و کاربر هنوز قیمت غلط می‌بیند، ادعاها رفتار را توصیف نکرده‌اند. پوشش را بالا نبر؛ ادعا را عوض کن.`,
  },
  {
    id: "seed_article_rtl",
    slug: "logical-start-not-left",
    title: "در فارسی، شروع صفحه سمت راست است",
    summary: "چپ و راست فیزیکی برای فاصله و آیکون، رابط را با یک تغییر زبان خراب می‌کند.",
    coverAsset: "/artwork/journal/logical-start-not-left.svg",
    sortOrder: 8,
    readingMinutes: 3,
    body: `حاشیهٔ چپ در صفحه‌ای که جهت راست‌به‌چپ دارد، حاشیهٔ انتهای خط است نه ابتدای آن.

## شروع منطقی

فاصله، خط زیر لینک فعال، و نشانه‌گذاری آیتم انتخاب‌شده باید از شروع خط بیایند. در فارسی شروع، راست است.

## چیزی که جهت دارد

فلش «بعدی» اگر همیشه به چپ باشد، در فارسی عقب است. آیکونی که جهت ندارد لازم نیست قرینه شود.

قیمت و عدد را در متن فارسی با ارقام فارسی نشان بده، ولی ورودی شناسهٔ انگلیسی را به زور راست‌چین نکن.`,
  },
];

export const EXTRA_STUDENTS = [
  {
    username: "parisa",
    email: "parisa@example.com",
    phone: "09124444444",
    displayName: "پریسا کریمی",
  },
  {
    username: "hossein",
    email: "hossein@example.com",
    phone: "09125555555",
    displayName: "حسین مرادی",
  },
  {
    username: "maryam",
    email: "maryam@example.com",
    phone: "09126666666",
    displayName: "مریم نوری",
  },
  {
    username: "kavian",
    email: "kavian@example.com",
    phone: null,
    displayName: "کاویان شریفی",
  },
];
