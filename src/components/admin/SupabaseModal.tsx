import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  ExternalLink,
  Key,
  FileCode,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabaseSQL';
import {
  clearSupabaseConfig,
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectedSuccess?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectedSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'keys' | 'guide'>('sql');
  const [copiedSql, setCopiedSql] = useState(false);

  // Form state
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    counts?: { products: number; categories: number };
  } | null>(null);

  if (!isOpen) return null;

  const isAlreadyConfigured = Boolean(currentConfig.url && currentConfig.anonKey);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback
      setCopiedSql(true);
    }
  };

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(url, anonKey);
      if (onConnectedSuccess) {
        onConnectedSuccess();
      }
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult({
      success: false,
      message: 'تم قطع الاتصال بسوبابيز. المتجر يعمل الآن بالتخزين المحلي (LocalStorage).',
    });
    if (onConnectedSuccess) {
      onConnectedSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 text-right">
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">ربط المتجر بقاعدة بيانات سوبابيز (Supabase)</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAlreadyConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isAlreadyConfigured ? '🟢 متصل حالياً' : '⚪ غير متصل'}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                كود SQL كامل ومطابق لمنتجات وأقسام المتجر مع إدخال مفاتيح الربط
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-stone-50 border-b border-stone-200 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>1. كود SQL الكامل (انسخه من هنا)</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'keys'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2. إدخال مفاتيح الربط (URL & Anon Key)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. طريقة الحصول على المفاتيح</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: SQL SCHEMA & SEED DATA */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
                <div>
                  <p className="font-bold text-sm mb-1">
                    كود SQL جاهز للتنفيذ بنقرة واحدة 🚀
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    هذا الكود يقوم بإنشاء جميع الجداول (المنتجات، الأقسام الـ 10، إعدادات المتجر، الطلبات)
                    وسياسات الأمان (RLS) وتعبئة الأواني المغربية بالكامل.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all shrink-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ كود SQL بالكامل</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code viewer with pre */}
              <div className="relative rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-xs overflow-x-auto border border-stone-800 max-h-[380px]">
                <div className="sticky top-0 right-0 float-right mb-2">
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1.5 border border-stone-700"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'تم النسخ' : 'نسخ الكود'}</span>
                  </button>
                </div>

                <pre className="text-left font-mono text-[11px] leading-relaxed text-emerald-300 select-all">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: KEYS CONFIGURATION FORM */}
          {activeTab === 'keys' && (
            <div className="space-y-5">
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-xs text-amber-950">
                <p className="font-bold mb-1">
                  أدخل المفاتيح التي نسختها من لوحة تحكم سوبابيز (Supabase)
                </p>
                <p className="text-amber-800">
                  بمجرد إدخال الرابط والمفتاح والضغط على "اختبار وحفظ"، سيبدأ المتجر بالقراءة والكتابة مباشرة في قاعدة بيانات سوبابيز الخاصة بك!
                </p>
              </div>

              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    1. رابط المشروع (Project URL) *
                  </label>
                  <input
                    type="url"
                    required
                    dir="ltr"
                    placeholder="https://your-project-ref.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-stone-400 block mt-1">
                    تجدها في Supabase ➔ Project Settings ➔ API ➔ Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    2. المفتاح العام (Project API Key - anon / public) *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                  <span className="text-[11px] text-stone-400 block mt-1">
                    تجدها في Supabase ➔ Project Settings ➔ API ➔ Project API keys ➔ anon (public)
                  </span>
                </div>

                {/* Test Feedback Result */}
                {testResult && (
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-semibold ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{testResult.message}</p>
                      {testResult.counts && (
                        <p className="text-[11px] mt-1 font-normal">
                          عدد المنتجات المتصلة في سوبابيز: {testResult.counts.products} منتجات | عدد الأقسام: {testResult.counts.categories}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-200">
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري اختبار الاتصال بقاعدة البيانات...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>اختبار الاتصال وحفظ المفاتيح</span>
                      </>
                    )}
                  </button>

                  {isAlreadyConfigured && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-4 py-3 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-xl font-semibold text-xs transition-colors"
                    >
                      قطع الاتصال والعودة للوضع المحلي
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: STEP BY STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-stone-700">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-sm text-stone-900">
                  خطوات ربط المتجر مع سوبابيز من البداية:
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-stone-900">إنشاء مشروع جديد في سوبابيز:</p>
                      <p className="text-stone-500">
                        ادخل إلى <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-bold">supabase.com</a> واضغط على New Project وحدد اسم المشروع وكلمة مرور قاعدة البيانات.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-stone-900">تنفيذ كود SQL:</p>
                      <p className="text-stone-500">
                        من القائمة الجانبية اليسرى في سوبابيز، اختر <strong>SQL Editor</strong>، ثم اضغط <strong>New Query</strong>، والصق كود SQL الذي نسخته من التبويب الأول، ثم اضغط على زر <strong>Run</strong> الأخضر.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-stone-900">نسخ المفاتيح:</p>
                      <p className="text-stone-500">
                        اذهب إلى <strong>Project Settings</strong> (أيقونة الترس بالأسفل) ➔ ثم <strong>API</strong>، وانسخ:
                      </p>
                      <ul className="list-disc list-inside mt-1 font-mono text-[11px] text-stone-600 space-y-1">
                        <li><strong>Project URL</strong> (مثال: https://xyz.supabase.co)</li>
                        <li><strong>Project API keys ➔ anon public</strong> (المفتاح الطويل)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <p className="font-bold text-stone-900">لصق المفاتيح في المتجر:</p>
                      <p className="text-stone-500">
                        عد إلى التبويب الثاني "إدخال مفاتيح الربط" هنا في المتجر، والصق الرابط والمفتاح واضغط <strong>اختبار الاتصال وحفظ المفاتيح</strong>. مبروك! متجرك متصل الآن بقاعدة بيانات حقيقية سحابية.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
