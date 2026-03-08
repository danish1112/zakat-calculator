"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ZAKAT_RATE         = 0.025;
const GOLD_NISAB_GRAMS   = 85;
const SILVER_NISAB_GRAMS = 595;
const DEFAULT_GOLD_PRICE  = 16473;
const DEFAULT_SILVER_PRICE = 285;

// ─── Translations ─────────────────────────────────────────────────────────────
const LANGS = {
  en: {
    code: "en", flag: "🇬🇧", label: "English", dir: "ltr",
    title: "Zakat Calculator", subtitle: "حاسبة الزكاة",
    tabCalc: "🧮 Calculator", tabGuide: "📖 Zakat Guide",
    hawlTap: "tap for Hawl guide",
    secCash: "💵 Cash & Liquid Assets",
    secGold: "🥇 Gold & Silver",
    secMarket: "Market Prices — update to today's rates",
    secLiab: "📉 Liabilities to Deduct",
    fCash: "Cash & Bank Savings", fInv: "Stocks & Investments", fInvH: "Market value today",
    fBiz: "Business Inventory / Assets", fBizH: "Goods for sale, working capital",
    fRec: "Money Owed to You", fRecH: "Loans you expect back",
    fOther: "Other Zakatable Assets",
    fGoldG: "Gold (grams)", fGoldH: "Savings jewellery, coins, bars",
    fSilverG: "Silver (grams)", fGoldP: "Gold price / gram", fSilverP: "Silver price / gram",
    fDebts: "Outstanding Debts", fDebtsH: "Credit cards, loans due now",
    fExp: "Essential Expenses Due", fExpH: "Bills due within lunar year",
    sumTitle: "📋 Summary", sumTotal: "Total Assets", sumLiab: "Liabilities",
    sumNet: "Net Zakatable", sumNisab: "Nisab (Silver)", sumStatus: "Status",
    sumMet: "✓ Nisab Met", sumBelow: "✗ Below Nisab",
    chartTitle: "📊 Asset Breakdown", chartEmpty: "Enter asset values above to see your wealth breakdown",
    zakatDue: "Zakat Due (2.5%)", enterAssets: "Enter your assets to calculate",
    belowNisab: "Below Nisab — not obligatory yet",
    netWealth: "Net Zakatable Wealth",
    printBtn: "🖨️ Print / Save PDF",
    shareBtn: "🔗 Share",
    resetBtn: "↺ Reset",
    whatsappBtn: "📅 WhatsApp Reminder",
    startFill: "Start by entering your assets below",
    fieldsFilled: (n, t) => `${n} of ${t} fields filled`,
    footer: "All amounts in Indian Rupees (INR) · Gold & silver rates as of 28 Feb 2026",
    footerNote: "This is an estimate only — consult a qualified Islamic scholar for your situation",
    madeBy: "Made with ❤️ by Danish",
    shareTextFn: (zakat, net) =>
      `🌙 I just calculated my Zakat!\n\nNet Zakatable Wealth: ₹${net}\nZakat Due (2.5%): ₹${zakat}\n\nCalculate yours for free 👇\nhttps://zakat-calculator-kappa.vercel.app`,
    waMsgFn: (zakat) =>
      `🌙 *Zakat Reminder* 🌙\n\nYour estimated Zakat this year is *${zakat}*.\n\nDon't forget to pay before Ramadan ends — it only takes a moment! 🤲\n\n📲 Calculate again: https://zakat-calculator-kappa.vercel.app`,
    waBtn: "Send to WhatsApp",
    waPhone: "Phone number (with country code)",
    waPhonePh: "e.g. 919876543210",
    waSend: "Open WhatsApp",
    waCopied: "Text copied to clipboard!",
    copied: "Link copied!",
    resetConfirm: "Reset all values to zero?",
    shareTitle: "Share Zakat Result",
    shareVia: "Share via",
    shareOr: "or copy link",
    copyLink: "Copy Link",
    shareWhatsapp: "WhatsApp",
    shareFacebook: "Facebook",
    shareTwitter: "Twitter / X",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram (copy text)",
    shareEmail: "Email",
    shareMore: "More options...",
    modalClose: "Close",
  },
  ar: {
    code: "ar", flag: "🇸🇦", label: "عربي", dir: "rtl",
    title: "حاسبة الزكاة", subtitle: "Zakat Calculator",
    tabCalc: "🧮 الحاسبة", tabGuide: "📖 دليل الزكاة",
    hawlTap: "اضغط لدليل الحول",
    secCash: "💵 النقد والأصول السائلة",
    secGold: "🥇 الذهب والفضة",
    secMarket: "أسعار السوق — حدّث بالأسعار الحالية",
    secLiab: "📉 الديون والالتزامات",
    fCash: "النقد والمدخرات البنكية", fInv: "الأسهم والاستثمارات", fInvH: "القيمة السوقية اليوم",
    fBiz: "مخزون / أصول تجارية", fBizH: "بضاعة للبيع ورأس المال العامل",
    fRec: "الأموال المستحقة لك", fRecH: "القروض التي تتوقع استردادها",
    fOther: "أصول زكوية أخرى",
    fGoldG: "الذهب (جرام)", fGoldH: "المجوهرات والعملات والسبائك",
    fSilverG: "الفضة (جرام)", fGoldP: "سعر الذهب / جرام", fSilverP: "سعر الفضة / جرام",
    fDebts: "الديون المستحقة", fDebtsH: "بطاقات الائتمان والقروض",
    fExp: "النفقات الأساسية المستحقة", fExpH: "الفواتير المستحقة خلال العام",
    sumTitle: "📋 الملخص", sumTotal: "إجمالي الأصول", sumLiab: "الالتزامات",
    sumNet: "الثروة الزكوية الصافية", sumNisab: "النصاب (الفضة)", sumStatus: "الحالة",
    sumMet: "✓ بلغ النصاب", sumBelow: "✗ دون النصاب",
    chartTitle: "📊 توزيع الأصول", chartEmpty: "أدخل قيم الأصول لرؤية توزيع ثروتك",
    zakatDue: "الزكاة المستحقة (٢.٥٪)", enterAssets: "أدخل أصولك للحساب",
    belowNisab: "دون النصاب — غير واجبة بعد",
    netWealth: "الثروة الزكوية الصافية",
    printBtn: "🖨️ طباعة / PDF",
    shareBtn: "🔗 مشاركة",
    resetBtn: "↺ إعادة تعيين",
    whatsappBtn: "📅 تذكير واتساب",
    startFill: "ابدأ بإدخال أصولك أدناه",
    fieldsFilled: (n, t) => `${n} من ${t} حقول مملوءة`,
    footer: "جميع المبالغ بالروبية الهندية (INR) · أسعار المعادن حتى ٢٨ فبراير ٢٠٢٦",
    footerNote: "هذا تقدير فقط — استشر عالماً إسلامياً مؤهلاً لحالتك",
    madeBy: "صُنع بـ ❤️ بواسطة Danish",
    shareTextFn: (zakat, net) =>
      `🌙 حسبت زكاتي للتو!\n\nالثروة الزكوية الصافية: ₹${net}\nالزكاة المستحقة (٢.٥٪): ₹${zakat}\n\nاحسب زكاتك مجاناً 👇\nhttps://zakat-calculator-kappa.vercel.app`,
    waMsgFn: (zakat) =>
      `🌙 *تذكير الزكاة* 🌙\n\nزكاتك المقدرة هذا العام *${zakat}*\n\nلا تنسَ الأداء قبل انتهاء رمضان 🤲\n\n📲 احسب مجدداً: https://zakat-calculator-kappa.vercel.app`,
    waBtn: "إرسال عبر واتساب",
    waPhone: "رقم الهاتف (مع رمز الدولة)",
    waPhonePh: "مثال: 919876543210",
    waSend: "فتح واتساب",
    waCopied: "تم نسخ النص!",
    copied: "تم نسخ الرابط!",
    resetConfirm: "هل تريد إعادة تعيين جميع القيم؟",
    shareTitle: "مشاركة نتيجة الزكاة",
    shareVia: "مشاركة عبر",
    shareOr: "أو نسخ الرابط",
    copyLink: "نسخ الرابط",
    shareWhatsapp: "واتساب",
    shareFacebook: "فيسبوك",
    shareTwitter: "تويتر / X",
    shareTelegram: "تيليغرام",
    shareInstagram: "إنستغرام (نسخ النص)",
    shareEmail: "البريد الإلكتروني",
    shareMore: "خيارات أخرى...",
    modalClose: "إغلاق",
  },
  ur: {
    code: "ur", flag: "🇵🇰", label: "اردو", dir: "rtl",
    title: "زکوٰۃ کیلکولیٹر", subtitle: "Zakat Calculator",
    tabCalc: "🧮 حساب", tabGuide: "📖 زکوٰۃ گائیڈ",
    hawlTap: "حول کی رہنمائی",
    secCash: "💵 نقد اور مائع اثاثے",
    secGold: "🥇 سونا اور چاندی",
    secMarket: "مارکیٹ قیمتیں — آج کی شرح اپ ڈیٹ کریں",
    secLiab: "📉 قابل کٹوتی واجبات",
    fCash: "نقد اور بینک بچت", fInv: "اسٹاک اور سرمایہ کاری", fInvH: "آج کی مارکیٹ قدر",
    fBiz: "کاروباری انوینٹری / اثاثے", fBizH: "فروخت کا سامان اور ورکنگ کیپٹل",
    fRec: "آپ کا واجب الوصول", fRecH: "قرض جو واپس ملنے کی توقع ہے",
    fOther: "دیگر قابل زکوٰۃ اثاثے",
    fGoldG: "سونا (گرام)", fGoldH: "زیورات، سکے، ڈلیاں",
    fSilverG: "چاندی (گرام)", fGoldP: "سونے کی قیمت / گرام", fSilverP: "چاندی کی قیمت / گرام",
    fDebts: "واجب الادا قرض", fDebtsH: "کریڈٹ کارڈ، ادھار",
    fExp: "لازمی اخراجات", fExpH: "سال کے اندر ادا کیے جانے والے بل",
    sumTitle: "📋 خلاصہ", sumTotal: "کل اثاثے", sumLiab: "واجبات",
    sumNet: "خالص قابل زکوٰۃ", sumNisab: "نصاب (چاندی)", sumStatus: "حیثیت",
    sumMet: "✓ نصاب پورا ہوا", sumBelow: "✗ نصاب سے کم",
    chartTitle: "📊 اثاثوں کی تقسیم", chartEmpty: "اثاثوں کی قیمت درج کریں تاکہ تقسیم نظر آئے",
    zakatDue: "زکوٰۃ واجب (٢.٥٪)", enterAssets: "حساب کے لیے اثاثے درج کریں",
    belowNisab: "نصاب سے کم — ابھی واجب نہیں",
    netWealth: "خالص قابل زکوٰۃ دولت",
    printBtn: "🖨️ پرنٹ / PDF",
    shareBtn: "🔗 شیئر",
    resetBtn: "↺ ری سیٹ",
    whatsappBtn: "📅 واٹس ایپ یاددہانی",
    startFill: "نیچے اثاثے درج کریں",
    fieldsFilled: (n, t) => `${n} از ${t} فیلڈز`,
    footer: "تمام رقوم ہندوستانی روپے (INR) میں · قیمتیں ٢٨ فروری ٢٠٢٦ تک",
    footerNote: "یہ صرف ایک اندازہ ہے — اپنے معاملے کے لیے کسی مستند عالم سے رجوع کریں",
    madeBy: "Danish کی طرف سے ❤️ کے ساتھ بنایا",
    shareTextFn: (zakat, net) =>
      `🌙 میں نے ابھی اپنی زکوٰۃ حساب کی!\n\nخالص قابل زکوٰۃ دولت: ₹${net}\nزکوٰۃ واجب (٢.٥٪): ₹${zakat}\n\nاپنی مفت حساب کریں 👇\nhttps://zakat-calculator-kappa.vercel.app`,
    waMsgFn: (zakat) =>
      `🌙 *زکوٰۃ یاددہانی* 🌙\n\nاس سال آپ کی تخمینی زکوٰۃ *${zakat}* ہے۔\n\nرمضان ختم ہونے سے پہلے ادا کریں 🤲\n\n📲 دوبارہ حساب: https://zakat-calculator-kappa.vercel.app`,
    waBtn: "واٹس ایپ پر بھیجیں",
    waPhone: "فون نمبر (کنٹری کوڈ سمیت)",
    waPhonePh: "مثال: 919876543210",
    waSend: "واٹس ایپ کھولیں",
    waCopied: "متن کاپی ہو گیا!",
    copied: "لنک کاپی ہو گیا!",
    resetConfirm: "تمام قیمتیں صفر کریں؟",
    shareTitle: "زکوٰۃ نتیجہ شیئر کریں",
    shareVia: "شیئر کریں",
    shareOr: "یا لنک کاپی کریں",
    copyLink: "لنک کاپی",
    shareWhatsapp: "واٹس ایپ",
    shareFacebook: "فیس بک",
    shareTwitter: "ٹوئٹر / X",
    shareTelegram: "ٹیلیگرام",
    shareInstagram: "انسٹاگرام (متن کاپی)",
    shareEmail: "ای میل",
    shareMore: "مزید اختیارات...",
    modalClose: "بند کریں",
  },
  hi: {
    code: "hi", flag: "🇮🇳", label: "हिंदी", dir: "ltr",
    title: "ज़कात कैलकुलेटर", subtitle: "Zakat Calculator",
    tabCalc: "🧮 कैलकुलेटर", tabGuide: "📖 ज़कात गाइड",
    hawlTap: "हॉल गाइड देखें",
    secCash: "💵 नकद और तरल संपत्ति",
    secGold: "🥇 सोना और चाँदी",
    secMarket: "बाज़ार भाव — आज की दर अपडेट करें",
    secLiab: "📉 देनदारियाँ काटें",
    fCash: "नकद और बैंक बचत", fInv: "शेयर और निवेश", fInvH: "आज का बाज़ार मूल्य",
    fBiz: "व्यापारिक माल / संपत्ति", fBizH: "बिक्री योग्य माल, कार्यशील पूँजी",
    fRec: "आपको देय राशि", fRecH: "वापस मिलने वाले क़र्ज़",
    fOther: "अन्य ज़कात योग्य संपत्ति",
    fGoldG: "सोना (ग्राम)", fGoldH: "गहने, सिक्के, बार",
    fSilverG: "चाँदी (ग्राम)", fGoldP: "सोने का भाव / ग्राम", fSilverP: "चाँदी का भाव / ग्राम",
    fDebts: "बकाया क़र्ज़", fDebtsH: "क्रेडिट कार्ड, लोन",
    fExp: "आवश्यक खर्चे", fExpH: "इस साल देय बिल",
    sumTitle: "📋 सारांश", sumTotal: "कुल संपत्ति", sumLiab: "देनदारियाँ",
    sumNet: "शुद्ध ज़कात योग्य", sumNisab: "निसाब (चाँदी)", sumStatus: "स्थिति",
    sumMet: "✓ निसाब पूरा", sumBelow: "✗ निसाब से कम",
    chartTitle: "📊 संपत्ति विवरण", chartEmpty: "विवरण देखने के लिए संपत्ति दर्ज करें",
    zakatDue: "देय ज़कात (2.5%)", enterAssets: "गणना के लिए संपत्ति दर्ज करें",
    belowNisab: "निसाब से कम — अभी अनिवार्य नहीं",
    netWealth: "शुद्ध ज़कात योग्य धन",
    printBtn: "🖨️ प्रिंट / PDF",
    shareBtn: "🔗 शेयर",
    resetBtn: "↺ रीसेट",
    whatsappBtn: "📅 WhatsApp रिमाइंडर",
    startFill: "नीचे अपनी संपत्ति दर्ज करें",
    fieldsFilled: (n, t) => `${n} / ${t} फ़ील्ड भरे`,
    footer: "सभी राशियाँ भारतीय रुपये (INR) में · सोने-चाँदी की दर 28 फ़रवरी 2026 तक",
    footerNote: "यह केवल अनुमान है — अपनी स्थिति के लिए किसी इस्लामी विद्वान से सलाह लें",
    madeBy: "Danish द्वारा ❤️ से बनाया गया",
    shareTextFn: (zakat, net) =>
      `🌙 मैंने अभी अपनी ज़कात कैलकुलेट की!\n\nशुद्ध ज़कात योग्य धन: ₹${net}\nदेय ज़कात (2.5%): ₹${zakat}\n\nअपनी मुफ़्त कैलकुलेट करें 👇\nhttps://zakat-calculator-kappa.vercel.app`,
    waMsgFn: (zakat) =>
      `🌙 *ज़कात रिमाइंडर* 🌙\n\nइस साल आपकी अनुमानित ज़कात *${zakat}* है।\n\nरमज़ान खत्म होने से पहले अदा करें! 🤲\n\n📲 दोबारा कैलकुलेट: https://zakat-calculator-kappa.vercel.app`,
    waBtn: "WhatsApp पर भेजें",
    waPhone: "फ़ोन नंबर (कंट्री कोड सहित)",
    waPhonePh: "जैसे: 919876543210",
    waSend: "WhatsApp खोलें",
    waCopied: "टेक्स्ट कॉपी हो गया!",
    copied: "लिंक कॉपी हो गया!",
    resetConfirm: "सभी मान शून्य करें?",
    shareTitle: "ज़कात परिणाम शेयर करें",
    shareVia: "इनके ज़रिए शेयर करें",
    shareOr: "या लिंक कॉपी करें",
    copyLink: "लिंक कॉपी करें",
    shareWhatsapp: "WhatsApp",
    shareFacebook: "Facebook",
    shareTwitter: "Twitter / X",
    shareTelegram: "Telegram",
    shareInstagram: "Instagram (टेक्स्ट कॉपी)",
    shareEmail: "Email",
    shareMore: "और विकल्प...",
    modalClose: "बंद करें",
  },
};

// ─── Formatting ───────────────────────────────────────────────────────────────
const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val));
const formatIndian = (val) => {
  const n = Math.round(parseFloat(val));
  return isNaN(n) ? "" : new Intl.NumberFormat("en-IN").format(n);
};
const stripCommas = (str) => String(str).replace(/,/g, "");
const formatCompact = (val) => {
  const n = Math.round(val);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};

// ─── useIndianInput ───────────────────────────────────────────────────────────
const useIndianInput = (initial) => {
  const [display, setDisplay] = useState(initial === 0 ? "" : formatIndian(initial));
  const inputRef = useRef(null);
  const numeric = parseFloat(stripCommas(display)) || 0;
  const onChange = (e) => {
    const raw = stripCommas(e.target.value);
    if (!/^\d*\.?\d*$/.test(raw)) return;
    if (raw === "" || raw === ".") { setDisplay(raw); return; }
    const [intPart, decPart] = raw.split(".");
    const formattedInt = intPart === "" ? "" : new Intl.NumberFormat("en-IN").format(parseInt(intPart, 10));
    const newDisplay = decPart !== undefined ? formattedInt + "." + decPart : formattedInt;
    const oldCursor = e.target.selectionStart ?? 0;
    const commasBefore = (e.target.value.slice(0, oldCursor).match(/,/g) || []).length;
    const rawCursor = oldCursor - commasBefore;
    const newCommasBefore = (newDisplay.slice(0, rawCursor).match(/,/g) || []).length;
    setDisplay(newDisplay);
    requestAnimationFrame(() => { if (inputRef.current) inputRef.current.setSelectionRange(rawCursor + newCommasBefore, rawCursor + newCommasBefore); });
  };
  const onBlur  = () => { const n = parseFloat(stripCommas(display)); setDisplay(isNaN(n) || n === 0 ? "" : formatIndian(n)); };
  const onFocus = (e) => { const l = e.target.value.length; e.target.setSelectionRange(l, l); };
  // expose setDisplay so parent can force a value
  return { display, setDisplay, numeric, onChange, onBlur, onFocus, inputRef };
};

// ─── Hijri Date ───────────────────────────────────────────────────────────────
const HIJRI_MONTHS_EN = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah"];
const HIJRI_MONTHS_AR = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
const getHijriDate = () => {
  const today = new Date();
  const jd = Math.floor((today.getTime() / 86400000) + 2440587.5);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
            Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l) / 709);
  const day   = l - Math.floor((709 * month) / 24);
  const year  = 30 * n + j - 30;
  return { day, month, year };
};

// ─── Guide Data ───────────────────────────────────────────────────────────────
const GUIDE = [
  { icon: "🕌", title: "What is Zakat?",
    body: "Zakat is one of the Five Pillars of Islam — an obligatory annual charity of 2.5% on wealth held above the Nisab threshold for one full lunar year (Hawl). It purifies wealth and redistributes it to those in need.",
    tip: "Zakat is due once every lunar year from the date your wealth first reached Nisab." },
  { icon: "⚖️", title: "What is Nisab?",
    body: "Nisab is the minimum wealth threshold. If your net wealth equals or exceeds 85g of gold OR 595g of silver for a full year, Zakat becomes obligatory. Most scholars use silver Nisab as it is lower, ensuring more people contribute.",
    tip: "At today's rates: Gold Nisab ≈ ₹14,00,205 · Silver Nisab ≈ ₹1,69,575" },
  { icon: "💵", title: "Cash & Savings",
    body: "Include all cash on hand plus money in savings, current, salary, or fixed deposit accounts. Use the balance on your Zakat date (anniversary of first reaching Nisab).",
    examples: ["Savings account balance", "Cash at home", "Fixed/recurring deposits"] },
  { icon: "📈", title: "Stocks & Investments",
    body: "Use the current market value of shares and mutual fund units (NAV × units). For Provident Fund, include only the amount currently withdrawable by you.",
    examples: ["Share portfolio market value", "Mutual fund NAV", "Withdrawable EPF/PPF balance"] },
  { icon: "🏪", title: "Business Assets",
    body: "Include inventory held for sale, raw materials, and working capital cash. Fixed assets like equipment, furniture, or property used in the business are NOT zakatable.",
    examples: ["Shop inventory for sale", "Business cash & bank balance", "Raw materials for production"] },
  { icon: "🤝", title: "Money Owed to You",
    body: "Include loans given to others that you are confident will be repaid. If recovery is uncertain, most scholars say you may defer Zakat until repayment is received.",
    examples: ["Personal loans given to others", "Security deposits you expect back", "Advance salary payments"] },
  { icon: "🥇", title: "Gold & Silver",
    body: "Gold worn regularly for personal use is debated — many scholars exempt one normal jewellery set. Gold kept as savings, investment, coins, or bars is definitely zakatable. Silver is generally always zakatable.",
    examples: ["Gold coins, bars, extra jewellery", "Silver utensils or ornaments", "Digital gold holdings"] },
  { icon: "📉", title: "Liabilities",
    body: "Deduct debts currently due or payable this year. For long-term loans (home loan, car loan), only deduct the instalments due in the current year — not the full outstanding balance.",
    examples: ["Credit card balance due", "Personal loan EMI due this month", "Rent or bills overdue"] },
  { icon: "🎁", title: "Who Receives Zakat?",
    body: "The Quran (9:60) specifies 8 categories: the poor, the needy, Zakat administrators, new Muslims, freeing captives (historical), debtors, in the path of Allah, and stranded travellers.",
    tip: "Zakat cannot be given to parents, children, spouse, or non-Muslims (per most schools)." },
];

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const COLORS = ["#c8a96e","#5cb86a","#5b8ee6","#e07c5b","#a06ec8","#e0c85b","#5bc8c8"];
const DonutChart = ({ data, emptyText }) => {
  const [hov, setHov] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return (
    <div style={{ textAlign:"center", padding:"2.5rem 1rem", color:"#4a5a4c", fontSize:"0.85rem" }}>{emptyText}</div>
  );
  const R = 80, r = 48, cx = 100, cy = 100;
  let cursor = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const rawAngle = (d.value / total) * 2 * Math.PI;
    const angle = Math.max(rawAngle, 0.02);
    const isSingle = data.length === 1;
    let path;
    if (isSingle) {
      path = [`M ${cx} ${cy - R}`, `A ${R} ${R} 0 1 1 ${cx - 0.001} ${cy - R}`, `L ${cx - 0.001} ${cy - r}`, `A ${r} ${r} 0 1 0 ${cx} ${cy - r}`, "Z"].join(" ");
    } else {
      const x1 = cx + R * Math.cos(cursor), y1 = cy + R * Math.sin(cursor);
      const x2 = cx + R * Math.cos(cursor + angle), y2 = cy + R * Math.sin(cursor + angle);
      const ix1 = cx + r * Math.cos(cursor), iy1 = cy + r * Math.sin(cursor);
      const ix2 = cx + r * Math.cos(cursor + angle), iy2 = cy + r * Math.sin(cursor + angle);
      const lg = angle > Math.PI ? 1 : 0;
      path = `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${ix2} ${iy2} A${r} ${r} 0 ${lg} 0 ${ix1} ${iy1}Z`;
    }
    cursor += rawAngle;
    return { ...d, color: COLORS[i % COLORS.length], pct: ((d.value / total) * 100).toFixed(1), path };
  });
  const active = hov ? slices.find(s => s.label === hov) : null;
  return (
    <div className="donut-wrap">
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color}
            style={{ opacity: hov && hov !== s.label ? 0.25 : 1, cursor:"pointer", transition:"opacity 0.2s, transform 0.15s", transformOrigin:"100px 100px", transform: hov === s.label ? "scale(1.04)" : "scale(1)" }}
            onMouseEnter={() => setHov(s.label)} onMouseLeave={() => setHov(null)} />
        ))}
        <text x="100" y="95"  textAnchor="middle" fill="#f0ece3" fontSize="14" fontWeight="600">{active ? active.pct+"%" : "Total"}</text>
        <text x="100" y="112" textAnchor="middle" fill="#7a8a7d" fontSize="8.5">{active ? active.label : formatINR(total)}</text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className={`legend-row ${hov === s.label ? "legend-hov" : ""}`}
            onMouseEnter={() => setHov(s.label)} onMouseLeave={() => setHov(null)}>
            <span className="legend-dot" style={{ background: s.color }} />
            <span className="legend-name">{s.label}</span>
            <span className="legend-pct">{s.pct}%</span>
            <span className="legend-amt">{formatINR(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Print ────────────────────────────────────────────────────────────────────
// ─── Print / PDF ─────────────────────────────────────────────────────────────
// Works on all platforms including iOS Safari and Android Chrome.
// Strategy: inject a full-page overlay into the CURRENT document, then call
// window.print(). CSS @media print hides everything except the overlay.
// On mobile "Print → Save as PDF" in the browser share sheet saves the PDF.
const triggerPrint = (data) => {
  const { rows, totalAssets, totalLiabilities, net, nisab, meetsNisab, zakatDue, gp, sp } = data;
  const today = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  const assetRows = rows.filter(r => r.s === "a").map(r =>
    `<tr><td>${r.l}</td><td>${formatINR(r.v)}</td></tr>`).join("");
  const liabRows  = rows.filter(r => r.s === "l").map(r =>
    `<tr><td>${r.l}</td><td>${formatINR(r.v)}</td></tr>`).join("");
  const zColor     = meetsNisab ? "#1a6e2a" : "#888";
  const zBorder    = meetsNisab ? "#5cb86a" : "#e07c7c";
  const zBg        = meetsNisab ? "#f0faf2" : "#fdf5f5";
  const zStatusClr = meetsNisab ? "#2a8a3a" : "#c05050";

  // Remove any existing overlay
  const prev = document.getElementById("__zakat_print_overlay");
  if (prev) prev.remove();

  const overlay = document.createElement("div");
  overlay.id = "__zakat_print_overlay";
  overlay.innerHTML = `
    <style>
      #__zakat_print_overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: #fff; overflow-y: auto;
        font-family: 'Outfit', 'Segoe UI', sans-serif;
        color: #1a1a1a;
        -webkit-overflow-scrolling: touch;
      }
      #__zakat_print_overlay .p-inner {
        max-width: 600px; margin: 0 auto; padding: 32px 28px 48px;
      }
      #__zakat_print_overlay .p-logo {
        text-align: center; border-bottom: 2px solid #c8a96e;
        padding-bottom: 18px; margin-bottom: 22px;
      }
      #__zakat_print_overlay .p-arabic {
        font-family: 'Amiri', 'Arial', serif; font-size: 24px;
        color: #c8a96e; display: block; margin-bottom: 4px;
      }
      #__zakat_print_overlay h1 { font-size: 20px; font-weight: 600; }
      #__zakat_print_overlay .p-date { color: #aaa; font-size: 12px; margin-top: 3px; }
      #__zakat_print_overlay .p-sec {
        font-size: 9px; text-transform: uppercase; letter-spacing: .12em;
        color: #c8a96e; font-weight: 700; margin: 20px 0 6px;
        border-bottom: 1px solid #ede0c8; padding-bottom: 3px;
      }
      #__zakat_print_overlay table { width: 100%; border-collapse: collapse; }
      #__zakat_print_overlay tr { border-bottom: 1px solid #f2ece0; }
      #__zakat_print_overlay td { padding: 7px 3px; font-size: 13px; }
      #__zakat_print_overlay td:last-child { text-align: right; color: #7a5a20; font-weight: 500; }
      #__zakat_print_overlay .p-sbox {
        background: #faf7f0; border: 1px solid #e8ddc0;
        border-radius: 10px; padding: 14px 16px; margin-top: 20px;
      }
      #__zakat_print_overlay .p-sr {
        display: flex; justify-content: space-between;
        padding: 5px 0; font-size: 13px; color: #666;
        border-bottom: 1px solid #ede8d8;
      }
      #__zakat_print_overlay .p-sr:last-child { border-bottom: none; }
      #__zakat_print_overlay .p-sr.bold {
        color: #1a1a1a; font-weight: 700; font-size: 14px; padding-top: 8px;
      }
      #__zakat_print_overlay .p-zbox {
        margin-top: 20px; border: 2px solid ${zBorder};
        border-radius: 12px; padding: 18px; text-align: center; background: ${zBg};
      }
      #__zakat_print_overlay .p-zlabel {
        font-size: 9px; letter-spacing: .15em; text-transform: uppercase;
        color: #c8a96e; margin-bottom: 6px; font-weight: 600;
      }
      #__zakat_print_overlay .p-zamt {
        font-size: 32px; font-weight: 700; color: ${zColor};
      }
      #__zakat_print_overlay .p-zstatus {
        font-size: 12px; color: ${zStatusClr}; margin-top: 5px;
      }
      #__zakat_print_overlay .p-actions {
        display: flex; gap: 10px; margin-top: 24px;
      }
      #__zakat_print_overlay .p-btn {
        flex: 1; padding: 13px; border: none; border-radius: 10px;
        font-size: 15px; font-family: inherit; font-weight: 600; cursor: pointer;
      }
      #__zakat_print_overlay .p-btn-print { background: #1a6e2a; color: #fff; }
      #__zakat_print_overlay .p-btn-close { background: #f0ece3; color: #555; }
      #__zakat_print_overlay .p-foot {
        margin-top: 18px; font-size: 10px; color: #bbb;
        text-align: center; line-height: 1.8;
      }
      /* When printing: hide the app, show only the overlay */
      @media print {
        body > *:not(#__zakat_print_overlay) { display: none !important; }
        #__zakat_print_overlay {
          position: static !important; overflow: visible !important;
        }
        #__zakat_print_overlay .p-actions { display: none !important; }
      }
    </style>
    <div class="p-inner">
      <div class="p-logo">
        <span class="p-arabic">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْم</span>
        <h1>Zakat Calculation Summary</h1>
        <p class="p-date">Prepared on ${today}</p>
      </div>
      ${assetRows ? `<div class="p-sec">Assets</div><table>${assetRows}</table>` : ""}
      ${liabRows  ? `<div class="p-sec">Liabilities</div><table>${liabRows}</table>`  : ""}
      <div class="p-sbox">
        <div class="p-sr"><span>Total Assets</span><span>${formatINR(totalAssets)}</span></div>
        <div class="p-sr"><span>Total Liabilities</span><span>− ${formatINR(totalLiabilities)}</span></div>
        <div class="p-sr bold"><span>Net Zakatable Wealth</span><span>${formatINR(net)}</span></div>
        <div class="p-sr" style="color:#aaa;font-size:12px">
          <span>Nisab (Silver 595g × ₹${sp}/g)</span><span>${formatINR(nisab)}</span>
        </div>
      </div>
      <div class="p-zbox">
        <div class="p-zlabel">Zakat Due @ 2.5%</div>
        <div class="p-zamt">${meetsNisab ? formatINR(zakatDue) : "Not Obligatory"}</div>
        <div class="p-zstatus">${meetsNisab
          ? "✓ Nisab threshold met — Zakat is obligatory"
          : "✗ Wealth is below the Nisab threshold"}</div>
      </div>
      <div class="p-actions">
        <button class="p-btn p-btn-print" id="__zakat_print_btn">🖨️ Print / Save as PDF</button>
        <button class="p-btn p-btn-close" id="__zakat_close_btn">✕ Close</button>
      </div>
      <p class="p-foot">
        Gold: ₹${gp}/gram &nbsp;·&nbsp; Silver: ₹${sp}/gram &nbsp;·&nbsp; ${today}<br/>
        Made with ❤️ by Danish · Consult a qualified Islamic scholar for your situation.
      </p>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("__zakat_print_btn").onclick = () => window.print();
  document.getElementById("__zakat_close_btn").onclick = () => overlay.remove();
};
// ─── Brand SVG Icons ──────────────────────────────────────────────────────────
const BrandIcons = {
  whatsapp: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  facebook: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  twitter: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  ),
  telegram: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#2AABEE">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  instagram: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="url(#ig-grad)">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529"/>
          <stop offset="50%" stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  ),
  email: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#c8a96e">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  ),
  more: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#8aaa8c">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
    </svg>
  ),
};

// ─── Share Modal ──────────────────────────────────────────────────────────────
const ShareModal = ({ onClose, t }) => {
  const [copied, setCopied] = useState(false);
  const [igCopied, setIgCopied] = useState(false);
  const url = "https://zakat-calculator-kappa.vercel.app";
  // Privacy-safe share text — NO financial data
  const shareText = `🌙 Calculate your Zakat for free this Ramadan!\n\nCheck how much Zakat you owe in under 2 minutes 👇\n${url}\n\n#Zakat #Ramadan #Islam`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl  = encodeURIComponent(url);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };
  const copyForInsta = async () => {
    try { await navigator.clipboard.writeText(shareText); } catch {}
    setIgCopied(true); setTimeout(() => setIgCopied(false), 2500);
  };
  const nativeShare = () => {
    if (navigator.share) navigator.share({ title: "Zakat Calculator", text: shareText, url }).catch(() => {});
  };

  const platforms = [
    { label: "WhatsApp",  color: "#25D366", bg: "#0d1f10", href: `https://wa.me/?text=${encodedText}`,                                              icon: BrandIcons.whatsapp },
    { label: "Facebook",  color: "#1877F2", bg: "#0a0f1f", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,                      icon: BrandIcons.facebook },
    { label: "X / Twitter",color:"#ffffff", bg: "#111111", href: `https://twitter.com/intent/tweet?text=${encodedText}`,                             icon: BrandIcons.twitter  },
    { label: "Telegram",  color: "#2AABEE", bg: "#0a1520", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent("🌙 Calculate your Zakat for free!")}`, icon: BrandIcons.telegram },
    { label: "Email",     color: "#c8a96e", bg: "#1a1508", href: `mailto:?subject=Free Zakat Calculator&body=${encodedText}`,                        icon: BrandIcons.email    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-left">
            <div style={{ width:36,height:36,borderRadius:10,background:"#1a2a10",border:"1px solid #c8a96e30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem" }}>🔗</div>
            <div>
              <div className="modal-title">Share Calculator</div>
              <div className="modal-sub">Spread the word — free for everyone</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Platform grid */}
        <div style={{ padding:"1.1rem 1.25rem 0" }}>
          <div className="share-section-label">Share via</div>
          <div className="share-grid">
            {platforms.map((p, i) => (
              <a key={i} href={p.href} target="_blank" rel="noreferrer" className="share-tile" style={{ "--pc": p.color, "--bg": p.bg }}>
                <div className="share-tile-icon">{p.icon}</div>
                <span className="share-tile-label">{p.label}</span>
              </a>
            ))}
            {/* Instagram — copy text, then open app */}
            <button className="share-tile" style={{ "--pc": "#E1306C", "--bg": "#1a0a12" }} onClick={copyForInsta}>
              <div className="share-tile-icon">{BrandIcons.instagram}</div>
              <span className="share-tile-label">{igCopied ? "✓ Copied!" : "Instagram"}</span>
              {igCopied && <span className="share-tile-hint">Paste in caption</span>}
            </button>
            {/* Native share (mobile) */}
            {typeof navigator !== "undefined" && navigator.share && (
              <button className="share-tile" style={{ "--pc":"#8aaa8c","--bg":"#101a10" }} onClick={nativeShare}>
                <div className="share-tile-icon">{BrandIcons.more}</div>
                <span className="share-tile-label">More</span>
              </button>
            )}
          </div>

          {/* Instagram note */}
          {igCopied && (
            <div className="share-ig-note">
              📋 Caption copied! Open Instagram → New Post → paste in caption
            </div>
          )}
        </div>

        {/* Copy link */}
        <div style={{ padding:"1rem 1.25rem 1.25rem" }}>
          <div className="share-section-label">Or copy link</div>
          <div className="share-copy-row">
            <div className="share-copy-url">{url}</div>
            <button className="share-copy-btn" onClick={copyLink}>
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── WhatsApp Reminder Modal ─────────────────────────────────────────────────
// WA icon SVG
const WAIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const WA_TEMPLATES = [
  {
    id: "self",
    label: "Remind Myself",
    emoji: "🔔",
    desc: "Personal reminder to pay Zakat",
    msgFn: (zakat, hasZakat) =>
      hasZakat
        ? `🌙 *Zakat Reminder — Don't Forget!*\n\nMy Zakat this year: *${zakat}*\n\nMake sure to pay before Ramadan ends. Every rupee counts! 🤲\n\n📲 Recalculate anytime:\nhttps://zakat-calculator-kappa.vercel.app`
        : `🌙 *Zakat Reminder*\n\nTime to calculate my Zakat!\n\nDon't forget this important pillar of Islam 🤲\n\n📲 Calculate now:\nhttps://zakat-calculator-kappa.vercel.app`,
  },
  {
    id: "family",
    label: "Family / Friend",
    emoji: "👨‍👩‍👧",
    desc: "Gentle reminder to someone you care about",
    msgFn: (zakat, hasZakat) =>
      `Assalamu Alaikum! 🌙\n\nJust wanted to remind you — have you calculated your Zakat this year?\n\nIt only takes 2 minutes with this free calculator:\nhttps://zakat-calculator-kappa.vercel.app\n\nMay Allah accept it from all of us 🤲`,
  },
  {
    id: "community",
    label: "Community / Group",
    emoji: "🕌",
    desc: "Share with your masjid or WhatsApp group",
    msgFn: (zakat, hasZakat) =>
      `🌙 *Ramadan Reminder — Zakat*\n\nDear brothers & sisters,\n\nAs Ramadan passes, let's not forget our Zakat. It is one of the Five Pillars of Islam.\n\n📲 *Free Zakat Calculator:*\nhttps://zakat-calculator-kappa.vercel.app\n\nCalculate in under 2 minutes, in your language.\n\nJazakAllah Khair 🤲`,
  },
  {
    id: "custom",
    label: "Custom",
    emoji: "✏️",
    desc: "Write your own message",
    msgFn: (zakat, hasZakat) =>
      hasZakat
        ? `🌙 Reminder: My Zakat this year is ${zakat}.\n\nhttps://zakat-calculator-kappa.vercel.app`
        : `🌙 Calculate your Zakat:\nhttps://zakat-calculator-kappa.vercel.app`,
  },
];

const WhatsAppModal = ({ onClose, zakatDue, t }) => {
  const [phone, setPhone]       = useState("");
  const [templateId, setTemplateId] = useState("self");
  const [customMsg, setCustomMsg]   = useState("");
  const [copied, setCopied]     = useState(false);
  const [step, setStep]         = useState("template"); // "template" | "send"

  const hasZakat = zakatDue > 0;
  const zakatFmt = formatCompact(zakatDue);
  const tpl = WA_TEMPLATES.find(t => t.id === templateId);
  const baseMsg = templateId === "custom"
    ? (customMsg || tpl.msgFn(zakatFmt, hasZakat))
    : tpl.msgFn(zakatFmt, hasZakat);
  const displayMsg = templateId === "custom" && customMsg ? customMsg : baseMsg;

  const openWA = () => {
    const clean = phone.replace(/\D/g, "");
    const url = clean
      ? `https://wa.me/${clean}?text=${encodeURIComponent(displayMsg)}`
      : `https://wa.me/?text=${encodeURIComponent(displayMsg)}`;
    window.open(url, "_blank");
  };

  const copyMsg = async () => {
    try { await navigator.clipboard.writeText(displayMsg); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-wa" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-head">
          <div className="modal-head-left">
            <div className="wa-header-icon"><WAIcon /></div>
            <div>
              <div className="modal-title">WhatsApp Reminder</div>
              <div className="modal-sub">
                {hasZakat ? `Zakat due: ${zakatFmt}` : "Share the calculator with others"}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wa-body">
          {/* Step 1: Template picker */}
          <div className="wa-step-label">1. Choose message type</div>
          <div className="wa-templates">
            {WA_TEMPLATES.map(tp => (
              <button key={tp.id}
                className={`wa-tpl-btn ${templateId === tp.id ? "wa-tpl-active" : ""}`}
                onClick={() => setTemplateId(tp.id)}>
                <span className="wa-tpl-emoji">{tp.emoji}</span>
                <div>
                  <div className="wa-tpl-label">{tp.label}</div>
                  <div className="wa-tpl-desc">{tp.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom text area */}
          {templateId === "custom" && (
            <textarea
              className="wa-custom-input"
              rows={5}
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              placeholder={tpl.msgFn(zakatFmt, hasZakat)}
            />
          )}

          {/* Message preview */}
          {templateId !== "custom" && (
            <>
              <div className="wa-step-label" style={{ marginTop:"1rem" }}>Preview</div>
              <div className="wa-bubble-wrap">
                <div className="wa-bubble">{displayMsg}</div>
                <div className="wa-bubble-tail" />
              </div>
            </>
          )}

          {/* Step 2: Send */}
          <div className="wa-step-label" style={{ marginTop:"1rem" }}>2. Send to</div>
          <div className="wa-phone-row">
            <div className="wa-phone-prefix">+</div>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Country code + number  e.g. 919876543210"
              className="wa-phone-input"
            />
          </div>
          <div className="wa-phone-hint">Leave blank → WhatsApp opens, you choose recipient</div>

          {/* Actions */}
          <div className="wa-actions">
            <button className="wa-send-btn" onClick={openWA}>
              <WAIcon />
              Open in WhatsApp
            </button>
            <button className="wa-copy-btn" onClick={copyMsg}>
              {copied
                ? <><span>✓</span> Copied!</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> Copy</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// ─── Hijri Modal ──────────────────────────────────────────────────────────────
const HijriModal = ({ onClose, meetsNisab, t }) => {
  const h = getHijriDate();
  const today = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  const monthName = (t.code === "ar" ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN)[h.month - 1];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} dir={t.dir}>
        <div className="modal-head">
          <div className="modal-head-left">
            <span style={{ fontSize:"1.6rem" }}>🌙</span>
            <div>
              <div className="modal-title">Hijri Date & Hawl Guide</div>
              <div className="modal-sub">Islamic calendar & Zakat timing</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>{t.modalClose} ✕</button>
        </div>
        <div style={{ padding:"0 1.25rem 1.5rem" }}>
          <div className="hijri-date-block">
            <div className="hijri-date-item"><div className="hijri-date-label">Hijri Date</div><div className="hijri-date-value">{h.day} {monthName}</div></div>
            <div className="hijri-date-divider" />
            <div className="hijri-date-item"><div className="hijri-date-label">Hijri Year</div><div className="hijri-date-value">{h.year} AH</div></div>
            <div className="hijri-date-divider" />
            <div className="hijri-date-item"><div className="hijri-date-label">Gregorian</div><div className="hijri-date-value" style={{fontSize:"0.82rem"}}>{today}</div></div>
          </div>
          <div style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.08em", color:"#c8a96e", margin:"1rem 0 0.5rem" }}>Your Nisab Status</div>
          <div className="hijri-nisab-note">
            {meetsNisab
              ? <><strong>✓ Your wealth meets Nisab.</strong> Zakat becomes obligatory once this wealth has been maintained for one full lunar year (Hawl — 354 days). If today marks that anniversary, Zakat is due now.</>
              : <>Your current net zakatable wealth is below the Nisab threshold. <strong>Zakat is not yet obligatory.</strong> Track when your wealth first reaches Nisab — your Hawl starts from that date.</>
            }
          </div>
          <div className="hijri-hawl-box">
            <div className="hijri-hawl-label">What is Hawl?</div>
            <div className="hijri-hawl-text">Hawl is one complete lunar year (12 Islamic months = ~354 days). Your wealth must remain above Nisab for the entire Hawl. Zakat is calculated and paid at the end of each Hawl.</div>
            <div className="hijri-months">
              {(t.code === "ar" ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN).map((m, i) => (
                <div key={i} className={`hijri-month-chip ${i + 1 === h.month ? "hmc-active" : ""}`}>
                  {m.split(" ")[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Input Row ────────────────────────────────────────────────────────────────
const InputRow = ({ label, hint, field, prefix = "₹" }) => (
  <div className="irow">
    <div className="irow-labels">
      <span className="irow-label">{label}</span>
      {hint && <span className="irow-hint">{hint}</span>}
    </div>
    <div className="irow-input">
      <span className="irow-pre">{prefix}</span>
      <input ref={field.inputRef} type="text" inputMode="numeric"
        value={field.display} onChange={field.onChange} onBlur={field.onBlur} onFocus={field.onFocus}
        placeholder="0" autoComplete="off" />
    </div>
  </div>
);

// ─── Guide Tab ────────────────────────────────────────────────────────────────
const GuideTab = () => {
  const [active, setActive] = useState(0);
  const s = GUIDE[active];
  return (
    <div className="guide-wrap">
      <div className="guide-sidebar">
        {GUIDE.map((g, i) => (
          <button key={i} className={`gsb-btn ${i === active ? "gsb-active" : ""}`} onClick={() => setActive(i)}>
            <span className="gsb-icon">{g.icon}</span>
            <span className="gsb-title">{g.title}</span>
          </button>
        ))}
      </div>
      <div className="guide-content">
        <div className="gc-icon">{s.icon}</div>
        <h3 className="gc-title">{s.title}</h3>
        <p className="gc-body">{s.body}</p>
        {s.examples && (
          <div className="gc-examples">
            <p className="gc-ex-label">Common Examples</p>
            {s.examples.map((ex, i) => (
              <div key={i} className="gc-ex-row"><span className="gc-ex-dot">◆</span><span>{ex}</span></div>
            ))}
          </div>
        )}
        {s.tip && (
          <div className="gc-tip"><span className="gc-tip-icon">💡</span><span>{s.tip}</span></div>
        )}
        <div className="gc-pager">
          <button className="gc-page-btn" onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}>← Previous</button>
          <span className="gc-page-num">{active + 1} of {GUIDE.length}</span>
          <button className="gc-page-btn" onClick={() => setActive(Math.min(GUIDE.length - 1, active + 1))} disabled={active === GUIDE.length - 1}>Next →</button>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Menu ───────────────────────────────────────────────────────────
const SettingsMenu = ({ langCode, setLangCode, onWA, onPrint }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    // Use capture phase so we catch clicks before anything else
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [open]);

  const pick = (fn) => { setOpen(false); fn(); };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="topbar-icon-btn btn-settings"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.49.49 0 00.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
        <span className="btn-label">Settings</span>
      </button>

      {open && (
        <div
          className="settings-dropdown"
          onClick={e => e.stopPropagation()}
        >
          <div className="settings-section-label">🌐 Language</div>
          {Object.values(LANGS).map(l => (
            <button
              key={l.code}
              className={`settings-option ${l.code === langCode ? "settings-option-active" : ""}`}
              onClick={() => pick(() => setLangCode(l.code))}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {l.code === langCode && <span style={{ marginLeft:"auto", color:"#c8a96e", fontSize:"0.68rem" }}>✓</span>}
            </button>
          ))}
          <div className="settings-divider" />
          <button className="settings-option" onClick={() => pick(onWA)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>WhatsApp Reminder</span>
          </button>
          <button className="settings-option" onClick={() => pick(onPrint)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#c8a96e">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            <span>Print / Save PDF</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, show }) => (
  <div className={`toast ${show ? "toast-show" : ""}`}>{msg}</div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ZakatCalculator() {
  const [tab, setTab]         = useState("calc");
  const [langCode, setLangCode] = useState("en");
  const [showHijri, setShowHijri]     = useState(false);
  const [showShare, setShowShare]     = useState(false);
  const [showWA, setShowWA]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast]             = useState({ msg: "", show: false });

  const t = LANGS[langCode];

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2200);
  }, []);

  const cashSavings    = useIndianInput(0);
  const investments    = useIndianInput(0);
  const businessAssets = useIndianInput(0);
  const receivables    = useIndianInput(0);
  const otherAssets    = useIndianInput(0);
  const goldGrams      = useIndianInput(0);
  const silverGrams    = useIndianInput(0);
  const goldPrice      = useIndianInput(DEFAULT_GOLD_PRICE);
  const silverPrice    = useIndianInput(DEFAULT_SILVER_PRICE);
  const debts          = useIndianInput(0);
  const expenses       = useIndianInput(0);

  const allFields = [cashSavings, investments, businessAssets, receivables, otherAssets, goldGrams, silverGrams, goldPrice, silverPrice, debts, expenses];

  const handleReset = () => {
   // if (!window.confirm(t.resetConfirm)) return;
    // Directly call setDisplay on each field — no stale closure issues
    cashSavings.setDisplay("");
    investments.setDisplay("");
    businessAssets.setDisplay("");
    receivables.setDisplay("");
    otherAssets.setDisplay("");
    goldGrams.setDisplay("");
    silverGrams.setDisplay("");
    debts.setDisplay("");
    expenses.setDisplay("");
    goldPrice.setDisplay(formatIndian(DEFAULT_GOLD_PRICE));
    silverPrice.setDisplay(formatIndian(DEFAULT_SILVER_PRICE));
    showToast("↺ All fields reset");
  };

  const goldValue   = goldGrams.numeric * goldPrice.numeric;
  const silverValue = silverGrams.numeric * silverPrice.numeric;
  const totalAssets = cashSavings.numeric + investments.numeric + businessAssets.numeric +
    receivables.numeric + goldValue + silverValue + otherAssets.numeric;
  const totalLiabilities   = debts.numeric + expenses.numeric;
  const netZakatableWealth = Math.max(0, totalAssets - totalLiabilities);
  const goldNisabValue     = GOLD_NISAB_GRAMS * goldPrice.numeric;
  const silverNisabValue   = SILVER_NISAB_GRAMS * silverPrice.numeric;
  const nisabThreshold     = Math.min(goldNisabValue, silverNisabValue);
  const meetsNisab         = netZakatableWealth >= nisabThreshold && netZakatableWealth > 0;
  const zakatDue           = meetsNisab ? netZakatableWealth * ZAKAT_RATE : 0;

  const chartData = [
    { label: t.fCash,    value: cashSavings.numeric },
    { label: t.fInv,     value: investments.numeric },
    { label: t.fBiz,     value: businessAssets.numeric },
    { label: t.fRec,     value: receivables.numeric },
    { label: t.fGoldG,   value: goldValue },
    { label: t.fSilverG, value: silverValue },
    { label: t.fOther,   value: otherAssets.numeric },
  ].filter(d => d.value > 0);

  const printRows = [
    { s:"a", l: t.fCash,    v: cashSavings.numeric },
    { s:"a", l: t.fInv,     v: investments.numeric },
    { s:"a", l: t.fBiz,     v: businessAssets.numeric },
    { s:"a", l: t.fRec,     v: receivables.numeric },
    { s:"a", l:`${t.fGoldG} (${goldGrams.numeric}g × ₹${goldPrice.numeric}/g)`, v: goldValue },
    { s:"a", l:`${t.fSilverG} (${silverGrams.numeric}g × ₹${silverPrice.numeric}/g)`, v: silverValue },
    { s:"a", l: t.fOther,   v: otherAssets.numeric },
    { s:"l", l: t.fDebts,   v: debts.numeric },
    { s:"l", l: t.fExp,     v: expenses.numeric },
  ].filter(r => r.v > 0);

  const filled   = [cashSavings, investments, businessAssets, receivables, otherAssets, goldGrams, silverGrams, debts, expenses].filter(f => f.numeric > 0).length;
  const total9   = 9;
  const progress = Math.round((filled / total9) * 100);

  // Hijri pill data
  const hd = getHijriDate();
  const monthNamePill = (langCode === "ar" ? HIJRI_MONTHS_AR : HIJRI_MONTHS_EN)[hd.month - 1];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f0b; min-height: 100vh; font-family: 'Outfit', sans-serif; -webkit-text-size-adjust: 100%; }
        input, select, textarea { font-size: 16px !important; }

        .page { min-height: 100vh; background: radial-gradient(ellipse 90% 50% at 50% -5%, #162e1c 0%, #0a0f0b 55%); padding: 0 0 6rem; }

        /* ── Topbar ── */
        .topbar { background: #0d1410; border-bottom: 1px solid #1a2e1c; padding: 1.1rem 1.25rem 0; position: sticky; top: 0; z-index: 50; overflow: visible; }
        .topbar-inner { max-width: 900px; margin: 0 auto; }
        .topbar-row1 { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.9rem; flex-wrap: wrap; }
        .topbar-brand { flex: 1; min-width: 0; }
        .topbar-arabic { font-family: 'Amiri', serif; font-size: 1.1rem; color: #c8a96e; display: block; line-height: 1; }
        .topbar-title { font-size: 1.2rem; font-weight: 600; color: #f0ece3; letter-spacing: -0.01em; }
        .topbar-actions { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }

        /* ── Hijri pill ── */
        .hijri-pill { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.3rem 0.75rem 0.3rem 0.55rem; background: #0d1a10; border: 1px solid #c8a96e35; border-radius: 100px; cursor: pointer; transition: all 0.25s; }
        .hijri-pill:hover { background: #121e14; border-color: #c8a96e70; box-shadow: 0 0 12px #c8a96e18; }
        .hijri-pill-moon { font-size: 0.9rem; animation: moonpulse 3s ease-in-out infinite; }
        @keyframes moonpulse { 0%,100% { filter: drop-shadow(0 0 3px #c8a96e40); } 50% { filter: drop-shadow(0 0 7px #c8a96e90); } }
        .hijri-pill-text { display: flex; flex-direction: column; }
        .hijri-pill-date { font-size: 0.75rem; font-weight: 600; color: #c8a96e; line-height: 1.2; white-space: nowrap; }
        .hijri-pill-year { font-size: 0.6rem; color: #4a6a4c; line-height: 1; white-space: nowrap; }

        /* ── Action buttons in topbar ── */
        .topbar-icon-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.7rem; border-radius: 8px; border: 1px solid; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.76rem; font-weight: 500; transition: all 0.18s; background: transparent; white-space: nowrap; }
        .btn-share    { border-color: #c8a96e45; color: #c8a96e; }
        .btn-share:hover    { background: #c8a96e12; border-color: #c8a96e80; }
        .btn-reset    { border-color: #e07c5b40; color: #e07c5b; }
        .btn-reset:hover    { background: #e07c5b10; border-color: #e07c5b70; }
        .btn-settings { border-color: #3a5a3c60; color: #6a8a6c; }
        .btn-settings:hover { background: #1a2a1a; border-color: #6a8a6c; color: #c8d4ca; }

        /* ── Settings dropdown ── */
        .settings-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: #0f1810; border: 1px solid #2a4a2c; border-radius: 12px; overflow: hidden; min-width: 200px; z-index: 500; box-shadow: 0 16px 48px #000d; }
        .settings-section-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; padding: 0.7rem 0.9rem 0.35rem; }
        .settings-option { display: flex; align-items: center; gap: 0.55rem; width: 100%; padding: 0.55rem 0.9rem; background: none; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.81rem; color: #7a9a7c; text-align: left; transition: background 0.15s; }
        .settings-option:hover { background: #152015; color: #f0ece3; }
        .settings-option-active { color: #c8a96e !important; background: #141a08 !important; }
        .settings-divider { height: 1px; background: #1a2a1c; margin: 0.3rem 0; }

        /* ── Tabs ── */
        .tabs { display: flex; }
        .tab-btn { padding: 0.6rem 1.1rem; background: none; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.86rem; font-weight: 500; color: #4a6a4c; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn:hover { color: #8aaa8c; }
        .tab-btn.tab-active { color: #c8a96e; border-bottom-color: #c8a96e; }

        /* ── Main ── */
        .main { max-width: 900px; margin: 0 auto; padding: 1.25rem 1rem 0; }
        .calc-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.25rem; align-items: start; }

        /* ── Cards ── */
        .card { background: #0f1810; border: 1px solid #1a2e1c; border-radius: 14px; overflow: hidden; margin-bottom: 1rem; }
        .card-head { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1.2rem; border-bottom: 1px solid #1a2e1c; background: #0c1410; }
        .card-head-icon { font-size: 1rem; }
        .card-head-title { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #c8a96e; }
        .card-body { padding: 0.8rem 1.2rem 1rem; }
        .subdivider { font-size: 0.67rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; padding: 0.7rem 0 0.2rem; border-top: 1px dashed #1a2a1c; margin-top: 0.3rem; }

        /* ── Input rows ── */
        .irow { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.52rem 0; border-bottom: 1px solid #141e14; }
        .irow:last-child { border-bottom: none; }
        .irow-labels { flex: 1; min-width: 0; }
        .irow-label { display: block; color: #ccc9c0; font-size: 0.84rem; }
        .irow-hint { display: block; color: #3a5a3c; font-size: 0.7rem; margin-top: 1px; }
        .irow-input { display: flex; align-items: center; background: #080d09; border: 1px solid #243826; border-radius: 7px; overflow: hidden; transition: border-color 0.15s; width: 155px; flex-shrink: 0; }
        .irow-input:focus-within { border-color: #c8a96e; background: #0a1009; }
        .irow-pre { padding: 0 0.45rem; color: #3a5a3c; font-size: 0.78rem; user-select: none; white-space: nowrap; }
        .irow-input input { flex: 1; background: transparent; border: none; outline: none; color: #f0ece3; font-family: 'Outfit', sans-serif; font-size: 16px; padding: 0.42rem 0.35rem 0.42rem 0; min-width: 0; }
        .irow-input input::placeholder { color: #1e3020; }

        /* ── Progress ── */
        .progress-wrap { margin-bottom: 1rem; }
        .progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
        .progress-label { font-size: 0.7rem; color: #4a6a4c; }
        .progress-pct { font-size: 0.7rem; color: #c8a96e; font-weight: 500; }
        .progress-track { height: 3px; background: #1a2e1c; border-radius: 2px; }
        .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #3a7a3c, #c8a96e); transition: width 0.4s ease; }

        /* ── Right col ── */
        .right-col { position: sticky; top: 108px; display: flex; flex-direction: column; gap: 1rem; }

        /* ── Summary ── */
        .sum-row { display: flex; justify-content: space-between; align-items: center; padding: 0.48rem 0; border-bottom: 1px solid #141e14; font-size: 0.84rem; color: #6a8a6c; }
        .sum-row:last-child { border-bottom: none; }
        .sum-row.sum-strong { color: #d4cfc6; font-weight: 500; }
        .sum-val { color: #c8a96e; font-weight: 500; font-variant-numeric: tabular-nums; }
        .sum-row.sum-strong .sum-val { color: #e0d4b8; }
        .nisab-pill { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; padding: 0.15rem 0.6rem; border-radius: 100px; font-weight: 500; }
        .nisab-pill.met { background: #1a3a1e; color: #5cb86a; border: 1px solid #2a4a2e; }
        .nisab-pill.no  { background: #3a1a1a; color: #b85c5c; border: 1px solid #4a2a2a; }

        /* ── Result card ── */
        .result-card { background: linear-gradient(140deg, #162a16, #0e1a0e); border: 1px solid #c8a96e30; border-radius: 14px; padding: 1.2rem; text-align: center; position: relative; overflow: hidden; }
        .result-card.glowing { border-color: #c8a96e60; box-shadow: 0 0 28px #c8a96e18; }
        .result-card::before { content:''; position:absolute; top:-50px; left:50%; transform:translateX(-50%); width:160px; height:80px; background:radial-gradient(#c8a96e15, transparent 70%); pointer-events:none; }
        .result-arabic { font-family: 'Amiri', serif; color: #c8a96e; font-size: 0.76rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.3rem; display: block; }
        .result-amount { font-size: 2.1rem; font-weight: 600; color: #f0ece3; letter-spacing: -0.03em; line-height: 1.1; }
        .result-amount.result-zero { color: #3a5a3c; }
        .result-note { margin-top: 0.4rem; color: #4a6a4c; font-size: 0.73rem; line-height: 1.4; }

        /* ── Donut ── */
        .donut-wrap { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; justify-content: center; }
        .donut-legend { flex: 1; min-width: 140px; display: flex; flex-direction: column; gap: 0.28rem; }
        .legend-row { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; padding: 0.18rem 0.35rem; border-radius: 5px; transition: background 0.15s; }
        .legend-row:hover, .legend-hov { background: #152015; }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
        .legend-name { flex: 1; color: #7a9a7c; font-size: 0.73rem; }
        .legend-pct { color: #c8a96e; font-size: 0.7rem; font-weight: 500; margin-right: 0.2rem; }
        .legend-amt { color: #4a6a4c; font-size: 0.68rem; font-variant-numeric: tabular-nums; }

        /* ── Sticky bar ── */
        .sticky-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: #0b1210f2; backdrop-filter: blur(14px); border-top: 1px solid #1e3020; padding: 0.65rem 1.25rem; }
        .sticky-bar-inner { max-width: 900px; margin: 0 auto; display: flex; align-items: center; gap: 0.65rem; }
        .sticky-left { display: flex; align-items: center; gap: 1.1rem; flex: 1; min-width: 0; }
        .sticky-divider { width: 1px; height: 30px; background: #1e3020; flex-shrink: 0; }
        .sticky-label { font-size: 0.65rem; color: #3a5a3c; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.1rem; }
        .sticky-amount { font-size: 1.25rem; font-weight: 600; color: #c8a96e; letter-spacing: -0.02em; line-height: 1; }
        .sticky-amount.sticky-zero { color: #2a4a2c; }
        .sticky-net { font-size: 0.85rem; font-weight: 500; color: #4a7a4c; font-variant-numeric: tabular-nums; line-height: 1; }
        .sticky-btns { display: flex; gap: 0.4rem; flex-shrink: 0; }
        .sticky-print-btn { background: #1a1006; border: 1px solid #4a3010; color: #c8a96e; padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.74rem; font-weight: 500; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 0.3rem; }
        .sticky-print-btn:hover { background: #241508; border-color: #c8a96e; }

        /* ── Modal shared ── */
        .modal-overlay { position: fixed; inset: 0; background: #0009; backdrop-filter: blur(8px); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadein 0.2s ease; }
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        .modal-box { background: #0e1810; border: 1px solid #1e3a2a; border-radius: 18px; width: 100%; max-width: 460px; overflow: hidden; box-shadow: 0 24px 60px #000c, 0 0 0 1px #c8a96e15; animation: slideup 0.25s ease; }
        @keyframes slideup { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        .modal-wa { max-width: 420px; }
        .modal-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.1rem 1.25rem 0.9rem; border-bottom: 1px solid #1a2e1c; background: #0c1610; }
        .modal-head-left { display: flex; gap: 0.75rem; align-items: flex-start; }
        .modal-title { font-size: 1rem; font-weight: 600; color: #f0ece3; }
        .modal-sub { font-size: 0.73rem; color: #4a6a4c; margin-top: 2px; }
        .modal-close { background: #1a2a1c; border: 1px solid #2a3d2c; color: #7a8a7d; padding: 0.25rem 0.65rem; border-radius: 20px; cursor: pointer; font-size: 0.72rem; font-family: 'Outfit', sans-serif; transition: all 0.2s; flex-shrink: 0; }
        .modal-close:hover { background: #2a3d2c; color: #f0ece3; }

        /* ── Share modal ── */
        .share-section-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; margin-bottom: 0.6rem; }
        .share-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.55rem; }
        .share-tile { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; padding: 0.8rem 0.4rem 0.6rem; background: var(--bg, #0a1209); border: 1px solid #1a3020; border-radius: 12px; cursor: pointer; transition: all 0.18s; text-decoration: none; font-family: 'Outfit', sans-serif; position: relative; }
        .share-tile:hover { border-color: var(--pc, #c8a96e); background: color-mix(in srgb, var(--pc,#c8a96e) 8%, var(--bg,#0a1209)); transform: translateY(-2px); box-shadow: 0 4px 16px #0006; }
        .share-tile-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; }
        .share-tile-label { font-size: 0.68rem; color: #7a9a7c; text-align: center; line-height: 1.2; font-weight: 500; }
        .share-tile-hint { font-size: 0.6rem; color: #3a5a3c; text-align: center; }
        .share-ig-note { margin-top: 0.65rem; background: #1a0a12; border: 1px solid #E1306C30; border-radius: 8px; padding: 0.55rem 0.85rem; font-size: 0.75rem; color: #c06080; line-height: 1.4; }
        .share-copy-row { display: flex; gap: 0.5rem; }
        .share-copy-url { flex: 1; background: #0a1209; border: 1px solid #1a3020; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.73rem; color: #4a6a4c; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .share-copy-btn { background: #1a2a10; border: 1px solid #c8a96e40; color: #c8a96e; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.76rem; font-weight: 600; transition: all 0.2s; white-space: nowrap; }
        .share-copy-btn:hover { background: #251e0a; border-color: #c8a96e; }

        /* ── WhatsApp modal ── */
        .modal-wa { max-width: 460px; }
        .wa-header-icon { width: 38px; height: 38px; background: #0d2010; border: 1px solid #25D36630; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wa-body { padding: 1rem 1.25rem 1.25rem; }
        .wa-step-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; margin-bottom: 0.5rem; }
        .wa-templates { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.75rem; }
        .wa-tpl-btn { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.55rem 0.65rem; background: #0a1209; border: 1px solid #1a3020; border-radius: 9px; cursor: pointer; text-align: left; transition: all 0.15s; font-family: 'Outfit', sans-serif; }
        .wa-tpl-btn:hover { border-color: #25D36650; background: #0d1a0d; }
        .wa-tpl-active { border-color: #25D366 !important; background: #0d1f0d !important; box-shadow: 0 0 0 1px #25D36620; }
        .wa-tpl-emoji { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .wa-tpl-label { font-size: 0.78rem; font-weight: 600; color: #c8d4ca; line-height: 1.2; }
        .wa-tpl-desc { font-size: 0.65rem; color: #3a5a3c; margin-top: 2px; line-height: 1.3; }
        .wa-custom-input { width: 100%; background: #0a1209; border: 1px solid #243826; border-radius: 8px; padding: 0.65rem 0.85rem; color: #c8d4ca; font-family: 'Outfit', sans-serif; font-size: 0.82rem; outline: none; resize: none; transition: border-color 0.15s; line-height: 1.6; box-sizing: border-box; }
        .wa-custom-input:focus { border-color: #25D366; }
        .wa-bubble-wrap { position: relative; margin-bottom: 0.25rem; }
        .wa-bubble { background: #1a2e10; border: 1px solid #25D36625; border-radius: 12px 12px 12px 3px; padding: 0.75rem 0.9rem; font-size: 0.78rem; color: #8aaa8c; white-space: pre-line; line-height: 1.65; max-height: 130px; overflow-y: auto; }
        .wa-phone-row { display: flex; align-items: center; background: #0a1209; border: 1px solid #243826; border-radius: 8px; overflow: hidden; transition: border-color 0.15s; margin-bottom: 0.3rem; }
        .wa-phone-row:focus-within { border-color: #25D366; }
        .wa-phone-prefix { padding: 0 0.6rem; color: #25D36680; font-size: 0.9rem; font-weight: 600; border-right: 1px solid #243826; }
        .wa-phone-input { flex: 1; background: transparent; border: none; outline: none; color: #f0ece3; font-family: 'Outfit', sans-serif; font-size: 0.85rem; padding: 0.5rem 0.75rem; }
        .wa-phone-input::placeholder { color: #2a4a2c; font-size: 0.78rem; }
        .wa-phone-hint { font-size: 0.67rem; color: #2a4a2c; margin-bottom: 0.9rem; }
        .wa-actions { display: flex; gap: 0.5rem; }
        .wa-send-btn { flex: 1; background: linear-gradient(135deg, #128C7E, #25D366); color: #fff; border: none; border-radius: 10px; padding: 0.7rem 1rem; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: opacity 0.2s; }
        .wa-send-btn:hover { opacity: 0.88; }
        .wa-copy-btn { display: flex; align-items: center; gap: 0.35rem; background: #1a2a10; border: 1px solid #2a4a1c; color: #7a9a7c; padding: 0.7rem 1rem; border-radius: 10px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.8rem; font-weight: 500; transition: all 0.2s; white-space: nowrap; }
        .wa-copy-btn:hover { background: #1e3010; color: #c8a96e; border-color: #c8a96e40; }

        /* ── Hijri modal (shared with ShareModal structure) ── */
        .hijri-date-block { background: #0a1209; border: 1px solid #1a3020; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .hijri-date-item { text-align: center; min-width: 0; }
        .hijri-date-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; margin-bottom: 0.3rem; }
        .hijri-date-value { font-family: 'Amiri', serif; font-size: 1.0rem; color: #c8a96e; font-weight: 700; }
        .hijri-date-divider { width: 1px; height: 36px; background: #1a3020; flex-shrink: 0; }
        .hijri-nisab-note { background: #0a1a0c; border: 1px solid #1a3a1c; border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.81rem; color: #5a8a5c; line-height: 1.55; margin-bottom: 0.9rem; }
        .hijri-nisab-note strong { color: #8fcc94; }
        .hijri-hawl-box { background: #131a0e; border: 1px dashed #2a4a1c; border-radius: 8px; padding: 0.7rem 0.9rem; }
        .hijri-hawl-label { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.1em; color: #3a5a3c; margin-bottom: 0.35rem; }
        .hijri-hawl-text { font-size: 0.81rem; color: #6a8a6c; line-height: 1.5; }
        .hijri-months { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.28rem; margin-top: 0.9rem; }
        .hijri-month-chip { background: #0a1209; border: 1px solid #1a2a1c; border-radius: 6px; padding: 0.25rem 0.3rem; text-align: center; font-size: 0.66rem; color: #3a5a3c; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hijri-month-chip.hmc-active { border-color: #c8a96e50; color: #c8a96e; background: #151a08; }

        /* ── Toast ── */
        .toast { position: fixed; bottom: 5rem; left: 50%; transform: translateX(-50%) translateY(10px); background: #0e1a10; border: 1px solid #c8a96e50; border-radius: 100px; padding: 0.5rem 1.25rem; font-size: 0.82rem; color: #c8a96e; white-space: nowrap; pointer-events: none; opacity: 0; transition: all 0.3s ease; z-index: 500; }
        .toast-show { opacity: 1; transform: translateX(-50%) translateY(0); }

        /* ── Guide ── */
        .guide-wrap { display: flex; background: #0f1810; border: 1px solid #1a2e1c; border-radius: 14px; overflow: hidden; min-height: 540px; }
        .guide-sidebar { width: 195px; flex-shrink: 0; border-right: 1px solid #1a2e1c; background: #0c1410; overflow-y: auto; }
        .gsb-btn { display: flex; align-items: flex-start; gap: 0.55rem; width: 100%; padding: 0.65rem 0.9rem; background: none; border: none; border-left: 2px solid transparent; cursor: pointer; text-align: left; transition: all 0.15s; }
        .gsb-btn:hover { background: #142014; }
        .gsb-active { background: #162a18 !important; border-left-color: #c8a96e !important; }
        .gsb-icon { font-size: 0.95rem; flex-shrink: 0; margin-top: 1px; }
        .gsb-title { font-family: 'Outfit', sans-serif; font-size: 0.77rem; color: #7a9a7c; line-height: 1.3; }
        .gsb-active .gsb-title { color: #e0d4b8; }
        .guide-content { flex: 1; padding: 1.6rem 1.6rem 1.1rem; overflow-y: auto; }
        .gc-icon { font-size: 2.2rem; margin-bottom: 0.65rem; }
        .gc-title { font-size: 1.15rem; font-weight: 600; color: #f0ece3; margin-bottom: 0.65rem; }
        .gc-body { color: #8aaa8c; font-size: 0.88rem; line-height: 1.75; }
        .gc-examples { margin-top: 1.1rem; background: #0a1209; border: 1px solid #1a2e1c; border-radius: 10px; padding: 0.9rem 1rem; }
        .gc-ex-label { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.1em; color: #c8a96e; margin-bottom: 0.55rem; }
        .gc-ex-row { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.83rem; color: #5a8a5c; padding: 0.18rem 0; }
        .gc-ex-dot { color: #c8a96e; font-size: 0.42rem; margin-top: 0.42rem; flex-shrink: 0; }
        .gc-tip { margin-top: 1rem; background: #1a2e14; border: 1px solid #2a4a1c; border-radius: 8px; padding: 0.7rem 0.9rem; display: flex; gap: 0.55rem; font-size: 0.82rem; color: #6a9a6c; line-height: 1.5; }
        .gc-tip-icon { font-size: 0.95rem; flex-shrink: 0; }
        .gc-pager { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; padding-top: 0.9rem; border-top: 1px solid #1a2e1c; }
        .gc-page-btn { background: #152015; border: 1px solid #243824; color: #7a9a7c; padding: 0.35rem 0.85rem; border-radius: 7px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.78rem; transition: all 0.15s; }
        .gc-page-btn:hover:not(:disabled) { background: #1e2e1e; color: #f0ece3; }
        .gc-page-btn:disabled { opacity: 0.3; cursor: default; }
        .gc-page-num { font-size: 0.77rem; color: #3a5a3c; }

        .footer-note { color: #2a4a2c; font-size: 0.71rem; text-align: center; line-height: 1.7; padding: 1.25rem 0 0; }
        .made-by { margin-top: 0.5rem; padding: 0.5rem 0 0; border-top: 1px solid #141e14; display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.71rem; color: #2a4a2c; }
        .made-by-heart { color: #8a3a3a; }
        .made-by-name { color: #3a6a3c; font-weight: 500; }

        /* ── Responsive ── */
        @media (max-width: 700px) {
          .calc-grid { grid-template-columns: 1fr; }
          .right-col { position: static; }
          .topbar-title { font-size: 1rem; }
          .topbar-arabic { font-size: 0.95rem; }
          .hijri-pill-year { display: none; }
          .btn-label { display: none; }
          .topbar-icon-btn { padding: 0.3rem 0.5rem; }
          .guide-wrap { flex-direction: column; }
          .guide-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #1a2e1c; display: flex; overflow-x: auto; padding: 0.4rem; gap: 0.2rem; }
          .gsb-btn { flex-shrink: 0; border-left: none; border-bottom: 2px solid transparent; border-radius: 7px; flex-direction: column; align-items: center; padding: 0.38rem 0.55rem; min-width: 60px; }
          .gsb-active { border-bottom-color: #c8a96e !important; }
          .irow-input { width: 135px; }
          .sticky-amount { font-size: 1.05rem; }
          .sticky-net { font-size: 0.78rem; }
          .sticky-btns { gap: 0.3rem; }
          .sticky-print-btn { font-size: 0.68rem; padding: 0.36rem 0.55rem; }
          .share-grid { grid-template-columns: repeat(3, 1fr); }
          .settings-dropdown { right: -1rem; }
        }
      `}</style>

      {/* ── Modals ── */}
      {showHijri && <HijriModal onClose={() => setShowHijri(false)} meetsNisab={meetsNisab} t={t} />}
      {showShare  && <ShareModal onClose={() => setShowShare(false)} t={t} />}
      {showWA     && <WhatsAppModal onClose={() => setShowWA(false)} zakatDue={zakatDue} t={t} />}
      {/* settings backdrop handled by useEffect */}

      <Toast msg={toast.msg} show={toast.show} />

      {/* ── Topbar ── */}
      <div className="topbar" dir={t.dir}>
        <div className="topbar-inner">
          <div className="topbar-row1">
            <div className="topbar-brand">
              <span className="topbar-arabic">{t.subtitle}</span>
              <span className="topbar-title">{t.title}</span>
            </div>

            <div className="topbar-actions">
              {/* Hijri date pill */}
              <button className="hijri-pill" onClick={() => setShowHijri(true)}>
                <span className="hijri-pill-moon">🌙</span>
                <span className="hijri-pill-text">
                  <span className="hijri-pill-date">{hd.day} {monthNamePill}</span>
                  <span className="hijri-pill-year">{hd.year} AH · {t.hawlTap}</span>
                </span>
              </button>

              {/* Share */}
              <button className="topbar-icon-btn btn-share" onClick={() => setShowShare(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                <span className="btn-label">Share</span>
              </button>

              {/* Reset */}
              <button className="topbar-icon-btn btn-reset" onClick={handleReset}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                <span className="btn-label">Reset</span>
              </button>

              {/* Settings ⚙ */}
              <SettingsMenu
                langCode={langCode}
                setLangCode={setLangCode}
                onWA={() => setShowWA(true)}
                onPrint={() => triggerPrint({ rows: printRows, totalAssets, totalLiabilities, net: netZakatableWealth, nisab: nisabThreshold, meetsNisab, zakatDue, gp: goldPrice.numeric, sp: silverPrice.numeric })}
              />
            </div>
          </div>

          <div className="tabs" dir="ltr">
            <button className={`tab-btn ${tab === "calc" ? "tab-active" : ""}`} onClick={() => setTab("calc")}>{t.tabCalc}</button>
            <button className={`tab-btn ${tab === "guide" ? "tab-active" : ""}`} onClick={() => setTab("guide")}>{t.tabGuide}</button>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="main" dir={t.dir}>

          {/* ── CALCULATOR TAB ── */}
          {tab === "calc" && (
            <>
              <div className="progress-wrap">
                <div className="progress-row">
                  <span className="progress-label">{filled === 0 ? t.startFill : t.fieldsFilled(filled, total9)}</span>
                  <span className="progress-pct">{progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
              </div>

              <div className="calc-grid">
                {/* Left: inputs */}
                <div>
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">💵</span><span className="card-head-title">{t.secCash.replace("💵 ","")}</span></div>
                    <div className="card-body">
                      <InputRow label={t.fCash}  field={cashSavings} />
                      <InputRow label={t.fInv}   hint={t.fInvH}  field={investments} />
                      <InputRow label={t.fBiz}   hint={t.fBizH}  field={businessAssets} />
                      <InputRow label={t.fRec}   hint={t.fRecH}  field={receivables} />
                      <InputRow label={t.fOther} field={otherAssets} />
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">🥇</span><span className="card-head-title">{t.secGold.replace("🥇 ","")}</span></div>
                    <div className="card-body">
                      <InputRow label={t.fGoldG}   hint={t.fGoldH}  field={goldGrams}   prefix="g" />
                      <InputRow label={t.fSilverG}  field={silverGrams} prefix="g" />
                      <div className="subdivider">{t.secMarket}</div>
                      <InputRow label={t.fGoldP}
                        hint={goldGrams.numeric > 0 ? `Value: ${formatINR(goldValue)} · Nisab(85g)=${formatINR(goldNisabValue)}` : `Nisab (85g) = ${formatINR(goldNisabValue)}`}
                        field={goldPrice} />
                      <InputRow label={t.fSilverP}
                        hint={silverGrams.numeric > 0 ? `Value: ${formatINR(silverValue)} · Nisab(595g)=${formatINR(silverNisabValue)}` : `Nisab (595g) = ${formatINR(silverNisabValue)}`}
                        field={silverPrice} />
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">📉</span><span className="card-head-title">{t.secLiab.replace("📉 ","")}</span></div>
                    <div className="card-body">
                      <InputRow label={t.fDebts} hint={t.fDebtsH} field={debts} />
                      <InputRow label={t.fExp}   hint={t.fExpH}   field={expenses} />
                    </div>
                  </div>
                </div>

                {/* Right: summary */}
                <div className="right-col">
                  <div className={`result-card ${meetsNisab ? "glowing" : ""}`}>
                    <span className="result-arabic">{t.zakatDue}</span>
                    <div className={`result-amount ${zakatDue === 0 ? "result-zero" : ""}`}>
                      {zakatDue === 0 ? "—" : formatINR(zakatDue)}
                    </div>
                    {meetsNisab && <p className="result-note">2.5% of {formatINR(netZakatableWealth)}</p>}
                    {!meetsNisab && netZakatableWealth > 0 && <p className="result-note">{t.belowNisab}</p>}
                    {totalAssets === 0 && <p className="result-note">{t.enterAssets}</p>}
                  </div>
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">📋</span><span className="card-head-title">{t.sumTitle.replace("📋 ","")}</span></div>
                    <div className="card-body">
                      <div className="sum-row"><span>{t.sumTotal}</span><span className="sum-val">{formatINR(totalAssets)}</span></div>
                      <div className="sum-row"><span>{t.sumLiab}</span><span className="sum-val">−{formatINR(totalLiabilities)}</span></div>
                      <div className="sum-row sum-strong"><span>{t.sumNet}</span><span className="sum-val">{formatINR(netZakatableWealth)}</span></div>
                      <div className="sum-row"><span>{t.sumNisab}</span><span className="sum-val">{formatINR(nisabThreshold)}</span></div>
                      <div className="sum-row">
                        <span>{t.sumStatus}</span>
                        <span className={`nisab-pill ${meetsNisab ? "met" : "no"}`}>{meetsNisab ? t.sumMet : t.sumBelow}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-head"><span className="card-head-icon">📊</span><span className="card-head-title">{t.chartTitle.replace("📊 ","")}</span></div>
                    <div className="card-body">
                      <DonutChart data={chartData} emptyText={t.chartEmpty} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="footer-note">
                {t.footer}<br />{t.footerNote}
                <span className="made-by">Made with <span className="made-by-heart">❤️</span> by <span className="made-by-name">Danish</span></span>
              </p>
            </>
          )}

          {tab === "guide" && <GuideTab />}
        </div>
      </div>

      {/* ── Sticky Bar ── */}
      <div className="sticky-bar">
        <div className="sticky-bar-inner">
          <div className="sticky-left">
            <div>
              <div className="sticky-label">{t.zakatDue}</div>
              <div className={`sticky-amount ${zakatDue === 0 ? "sticky-zero" : ""}`}>
                {zakatDue === 0 ? (netZakatableWealth > 0 ? t.sumBelow.replace("✗ ","") : "—") : formatINR(zakatDue)}
              </div>
            </div>
            <div className="sticky-divider" />
            <div>
              <div className="sticky-label">{t.netWealth}</div>
              <div className="sticky-net">{formatINR(netZakatableWealth)}</div>
            </div>
          </div>
          <div className="sticky-btns">
            <button className="sticky-print-btn" onClick={() => setShowShare(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
              Share
            </button>
            <button className="sticky-print-btn" onClick={() => triggerPrint({ rows: printRows, totalAssets, totalLiabilities, net: netZakatableWealth, nisab: nisabThreshold, meetsNisab, zakatDue, gp: goldPrice.numeric, sp: silverPrice.numeric })}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
              PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}