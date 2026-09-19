export type PatientStatus = "فعال" | "نیازمند پیگیری" | "درمان تکمیل‌شده";

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  fileNumber: string;
  lastVisit: string;
  status: PatientStatus;
  treatment: string;
  summary: string;
}

export interface AnalysisResult {
  title: string;
  confidence: number;
  description: string;
  recommendation: string;
}

export const patients: Patient[] = [
  {
    id: "p-101",
    name: "سارا احمدی",
    age: 29,
    phone: "۰۹۱۲۱۲۳۴۵۶۷",
    fileNumber: "DV-1405-101",
    lastVisit: "۲۲ شهریور ۱۴۰۵",
    status: "نیازمند پیگیری",
    treatment: "بررسی پوسیدگی دندان مولر",
    summary:
      "بیمار با حساسیت به سرما در ناحیه مولر فک پایین مراجعه کرده است. در معاینه اولیه نشانه‌های پوسیدگی سطحی مشاهده شد. بررسی تصویر جدید و ارزیابی نیاز به ترمیم پیشنهاد می‌شود.",
  },
  {
    id: "p-102",
    name: "امیرحسین رضایی",
    age: 37,
    phone: "۰۹۱۲۷۶۵۴۳۲۱",
    fileNumber: "DV-1405-102",
    lastVisit: "۱۸ شهریور ۱۴۰۵",
    status: "فعال",
    treatment: "کنترل درمان ریشه",
    summary:
      "درمان ریشه دندان پرمولر در جلسه قبل انجام شده است. وضعیت بافت اطراف ریشه پایدار گزارش شده و بیمار درد قابل توجهی ندارد. کنترل تصویری دوره‌ای توصیه می‌شود.",
  },
  {
    id: "p-103",
    name: "نگار محمدی",
    age: 24,
    phone: "۰۹۳۵۲۲۱۱۰۹۸",
    fileNumber: "DV-1405-103",
    lastVisit: "۹ شهریور ۱۴۰۵",
    status: "درمان تکمیل‌شده",
    treatment: "جرم‌گیری و ارزیابی لثه",
    summary:
      "جرم‌گیری کامل انجام شده و التهاب لثه کاهش یافته است. رعایت بهداشت دهان رضایت‌بخش است. ویزیت دوره‌ای شش‌ماهه برای بررسی وضعیت لثه پیشنهاد می‌شود.",
  },
  {
    id: "p-104",
    name: "کیان نادری",
    age: 42,
    phone: "۰۹۱۹۸۷۶۵۴۳۲",
    fileNumber: "DV-1405-104",
    lastVisit: "۲ شهریور ۱۴۰۵",
    status: "فعال",
    treatment: "بررسی ایمپلنت",
    summary:
      "فرایند درمان ایمپلنت در ناحیه دندان خلفی فک بالا در حال انجام است. ترمیم بافت نرم مناسب بوده و نشانه‌ای از عفونت گزارش نشده است. ادامه درمان طبق برنامه انجام شود.",
  },
];

const analysisResults: AnalysisResult[] = [
  {
    title: "احتمال پوسیدگی سطحی",
    confidence: 87,
    description:
      "در ناحیه سطح جونده دندان مولر، تغییر تیرگی خفیفی دیده می‌شود که می‌تواند با پوسیدگی اولیه سازگار باشد.",
    recommendation:
      "معاینه بالینی، تست حساسیت و در صورت نیاز تهیه رادیوگرافی بایت‌وینگ پیشنهاد می‌شود.",
  },
  {
    title: "نشانه واضحی از ضایعه مشاهده نشد",
    confidence: 92,
    description:
      "در تصویر بارگذاری‌شده تغییر ساختاری مشخص یا ناحیه مشکوک قابل توجهی تشخیص داده نشد.",
    recommendation:
      "نتیجه باید همراه با معاینه بالینی تفسیر شود و جایگزین نظر دندان‌پزشک نیست.",
  },
  {
    title: "احتمال التهاب لثه",
    confidence: 81,
    description:
      "قرمزی و تغییر فرم حاشیه لثه در بخش قابل مشاهده تصویر می‌تواند نشان‌دهنده التهاب موضعی باشد.",
    recommendation:
      "ارزیابی شاخص‌های لثه، بررسی پلاک و آموزش بهداشت دهان توصیه می‌شود.",
  },
];

// API stub: این تابع در مرحله اتصال بک‌اند با درخواست واقعی جایگزین می‌شود.
export async function analyzeDentalImage(
  patientId: string,
  image: File,
): Promise<AnalysisResult> {
  void patientId;
  void image;
  await new Promise((resolve) => setTimeout(resolve, 900));
  return analysisResults[Math.floor(Math.random() * analysisResults.length)];
}

export async function getPatients(): Promise<Patient[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return patients;
}
