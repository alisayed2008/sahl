import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

// Default export a single React component (App) — Tailwind CSS required in the project
// Usage notes (see README below in comments):
// - Install: npm i react framer-motion html2canvas
// - Tailwind must be configured in the project (create-react-app + tailwind or Next.js + tailwind)
// - Backend: replace `mockFetchResult` with real API call to your server (/api/results?stage=...&term=...&q=...)

export default function App() {
  const [stage, setStage] = useState("3 ثانوي");
  const [term, setTerm] = useState("الترم الأول");
  const [queryBy, setQueryBy] = useState("رقم الجلوس");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dark, setDark] = useState(true);
  const cardRef = useRef(null);
  const [error, setError] = useState("");

  // Mock fetch - replace with your real API call
  async function mockFetchResult({ stage, term, type, q }) {
    // emulate validation and delay
    await new Promise((r) => setTimeout(r, 900));
    if (!q) return { success: false, message: "ادخل رقم جلوس أو اسم أو رقم قومي" };

    // sample result structure
    return {
      success: true,
      data: {
        studentName: type === "الاسم" ? q : "أحمد محمد علي",
        seatNumber: type === "رقم الجلوس" ? q : "123456",
        nationalId: type === "الرقم القومي" ? q : "29001011234567",
        stage,
        term,
        subjects: [
          { name: "لغة عربية", max: 100, min: 0, grade: 82 },
          { name: "لغة إنجليزية", max: 100, min: 0, grade: 75 },
          { name: "رياضيات", max: 100, min: 0, grade: 68 },
          { name: "فيزياء", max: 100, min: 0, grade: 74 },
          { name: "كيمياء", max: 100, min: 0, grade: 70 },
        ],
      },
    };
  }

  async function handleSubmit(e) {
    e && e.preventDefault();
    setError("");
    setResult(null);

    // basic client-side validation
    if (!query.trim()) {
      setError("اكتب قيمة للبحث");
      return;
    }

    setLoading(true);
    try {
      // replace mockFetchResult with real fetch to your server
      const res = await mockFetchResult({ stage, term, type: queryBy, q: query.trim() });
      if (!res.success) {
        setError(res.message || "حصل خطأ");
        setResult(null);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  function calcTotals(subjects) {
    const totalMax = subjects.reduce((s, x) => s + x.max, 0);
    const totalGrade = subjects.reduce((s, x) => s + x.grade, 0);
    const percent = ((totalGrade / totalMax) * 100).toFixed(2);
    return { totalMax, totalGrade, percent };
  }

  async function exportCardAsImage() {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const canvas = await html2canvas(el, { scale: 2 });
    const url = canvas.toDataURL("image/png");
    const w = window.open("_blank");
    if (w) {
      w.document.write(`<img src="${url}" alt="نتيجة" style="max-width:100%;height:auto;">`);
    }
  }

  // Small presentational helpers
  const stages = [
    "أولى ثانوي",
    "ثانية ثانوي",
    "ثالثة ثانوي",
    "الصف الثالث الإعدادي",
  ];

  const terms = ["الترم الأول", "الترم الثاني"];
  const queryOptions = ["رقم الجلوس", "الاسم", "الرقم القومي"];

  return (
    <div className={dark ? "min-h-screen bg-gray-900 text-gray-100" : "min-h-screen bg-white text-gray-900"}>
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">منصة استعلام النتائج</h1>
            <p className="text-sm opacity-80">استعلم عن نتائج الطلاب برقم الجلوس، الاسم أو الرقم القومي</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">الموضع</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={dark} onChange={() => setDark(!dark)} />
                <div className={`w-12 h-6 rounded-full peer-focus:ring-2 peer-focus:ring-offset-2 ${dark ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                <span className={`absolute left-1 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${dark ? 'translate-x-6' : 'translate-x-0'}`}></span>
              </label>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
            >
              أعلى
            </button>
          </div>
        </header>

        <main>
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit}
            className={dark ? 'bg-gray-800 p-5 rounded-2xl shadow-lg' : 'bg-white p-5 rounded-2xl shadow'}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="col-span-1 md:col-span-1">
                <label className="block text-sm mb-2">المرحلة</label>
                <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full rounded-md p-2 bg-transparent border border-gray-700">
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">الترم</label>
                <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full rounded-md p-2 bg-transparent border border-gray-700">
                  {terms.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">نوع البحث</label>
                <select value={queryBy} onChange={(e) => setQueryBy(e.target.value)} className="w-full rounded-md p-2 bg-transparent border border-gray-700">
                  {queryOptions.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">ادخل القيمة</label>
                <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-md p-2 bg-transparent border border-gray-700" placeholder={queryBy} />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setQuery(''); setResult(null); setError(''); }} className="px-4 py-2 rounded-md border">مسح</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white">{loading ? 'جاري البحث...' : 'استعلام'}</button>
            </div>

            {error && <p className="mt-3 text-red-400">{error}</p>}
          </motion.form>

          <section className="mt-6">
            {loading && (
              <div className="p-6 bg-transparent rounded-lg">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-40 bg-gray-700 rounded"></div>
                </div>
              </div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                ref={cardRef}
                className={dark ? 'mt-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-5 shadow-2xl' : 'mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow'}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">نتيجة الطالب</h2>
                    <p className="text-sm opacity-80">{result.studentName} — {result.seatNumber} — {result.nationalId}</p>
                    <p className="text-xs mt-1 opacity-60">{result.stage} — {result.term}</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={exportCardAsImage} className="px-3 py-2 rounded-md bg-green-500 text-white">مشاركة كصورة</button>
                    <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="px-3 py-2 rounded-md border">نسخ رابط</button>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase opacity-80">
                        <th className="py-2">المادة</th>
                        <th className="py-2">الدرجة العظمى</th>
                        <th className="py-2">الدرجة الصغرى</th>
                        <th className="py-2">درجة الطالب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((s) => (
                        <tr key={s.name} className="border-t border-gray-600/30">
                          <td className="py-2">{s.name}</td>
                          <td className="py-2">{s.max}</td>
                          <td className="py-2">{s.min}</td>
                          <td className="py-2 font-medium">{s.grade}</td>
                        </tr>
                      ))}

                      <tr className="border-t border-gray-600/30 font-semibold">
                        <td className="py-2">المجموع النهائي</td>
                        <td className="py-2">{calcTotals(result.subjects).totalMax}</td>
                        <td className="py-2">-</td>
                        <td className="py-2">{calcTotals(result.subjects).totalGrade}</td>
                      </tr>

                      <tr className="border-t border-gray-600/30 font-semibold">
                        <td className="py-2">الدرجة المئوية</td>
                        <td className="py-2" colSpan={2}></td>
                        <td className="py-2">{calcTotals(result.subjects).percent}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">حفظ PDF (خارجي)</button>
                  <button className="px-4 py-2 rounded-md border">طباعة</button>
                </div>
              </motion.div>
            )}

            {!loading && !result && (
              <div className="mt-6 p-6 rounded-lg border border-dashed border-gray-600/30 text-center">
                <p className="opacity-80">ابدا بالبحث هتظهر نتيجة هنا بشكل جميل ومضيء</p>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-8 text-xs opacity-70 text-center">صمم بواسطة - واجهة قابلة للتعديل لتتكامل مع أي API نتائج.</footer>
      </div>
    </div>
  );
}

/*
README (موجز سريع):
1) حفظ الملف كمكون React (مثال: src/App.jsx) ضمن مشروع React/Next.js مع Tailwind.
2) تثبيت الحزم: npm i framer-motion html2canvas
3) إعداد Tailwind (إن لم يكن موجود).
4) ربط الدالة mockFetchResult بدعوة فعلية لواجهة الـ API التي سترجع نتيجة بالشكل:
   { success: true, data: { studentName, seatNumber, nationalId, stage, term, subjects: [{name,max,min,grade}, ...] } }
5) لتحسين: استبدل الحفظ PDF بزر يحول الـ DOM لصورة ثم يولد PDF عبر jsPDF أو سيرفر.
*/
