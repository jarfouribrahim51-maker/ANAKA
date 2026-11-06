export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- متجر دار الأواني المغربية (Dar El Awani) - كود قاعدة البيانات سوبابيز (Supabase PostgreSQL)
-- قم بنسخ هذا الكود بالكامل ولصقه في SQL Editor داخل Supabase ثم اضغط على Run
-- ====================================================================

-- 1. جدول الأقسام (Categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    icon_name TEXT DEFAULT 'Layers',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول المنتجات والأواني (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    image TEXT NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 10,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    badge TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. جدول إعدادات المتجر ومعلومات التواصل (Store Settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT NOT NULL DEFAULT 'دار الأواني المغربية',
    whatsapp_number TEXT NOT NULL DEFAULT '212600123456',
    store_phone TEXT NOT NULL DEFAULT '0522001122',
    announcement_text TEXT DEFAULT '🚚 التوصيل بالمجان لجميع مدن المغرب للطلبات فوق 300 درهم • الدفع عند الاستلام',
    free_shipping_threshold NUMERIC DEFAULT 300,
    standard_shipping_fee NUMERIC DEFAULT 35,
    currency TEXT DEFAULT 'DH',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. جدول الطلبات (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    notes TEXT,
    subtotal NUMERIC NOT NULL,
    shipping_fee NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    payment_method TEXT DEFAULT 'cod',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. جدول تفاصيل المنتجات داخل كل طلبية (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    image TEXT
);

-- 6. جدول الزبائن المسجلين (Customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. جدول الإشعارات المتزامنة (Notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- new_order, order_status, product_added, price_discount, stock_alert, customer_registered, offer, system
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'admin', 'customer'
    target_user_email TEXT, -- البريد الإلكتروني للزبون في حال كان الإشعار خاصاً به
    order_id TEXT,
    product_id TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- إعدادات الأمان وسياسات الوصول (Row Level Security - RLS)
-- ====================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بقراءة الأقسام والمنتجات والإعدادات
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Store Settings" ON public.store_settings FOR SELECT USING (true);

-- السماح للزبائن بإنشاء طلبات جديدة من الموقع
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);

-- السماح بالقراءة والإدارة العامة (للإدارة والتطوير عبر مفتاح Anon)
CREATE POLICY "Allow All on Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Store Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All on Notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- ملء البيانات الأولية للمتجر (Initial Data Seeding)
-- ====================================================================

-- 1. إدخال الأقسام الـ 10 للمتجر
INSERT INTO public.categories (id, name, short_name, icon_name, description)
VALUES
('cookware', 'الكوكوط وأواني الطهي', 'الكوكوط والقدور', 'Flame', 'أجود طناجر الضغط الإينوكس وقدور الطهي السريع بأعلى معايير الأمان.'),
('airfryer', 'الإير فراير (Air Fryer)', 'القلايات الهوائية', 'Zap', 'قلايات هوائية حديثة لطهي صحي ومقرمش بدون زيوت.'),
('glasses', 'الكيسان والكؤوس', 'الكيسان والبرارد', 'Wine', 'كؤوس الشاي المغربي المنقوشة وأطقم الكريستال الفاخرة.'),
('plates', 'الطباسل والصحون', 'الطباسل والصحون', 'Disc', 'صحون سيراميك وبورسلان وطباسل مغربية بأشكال وأحجام راقية.'),
('pans_pots', 'المقالي والكسكاسات والقدور', 'المقالي والكسكاس', 'Soup', 'مقالي جرانيت مانعة للالتصاق، كسكاس وبرمة للكسكس، والقدور التركية.'),
('appliances', 'أجهزة المطبخ الكهربائية', 'الأجهزة الكهربائية', 'Cpu', 'الهاشوارات، الخلاطات، طاحونات التوابل وعصارات الفواكه.'),
('ovens', 'الفران وأجهزة الطهي', 'الفران والشوايات', 'SquareDot', 'أفران كهربائية، آلات البانيني، شوايات صحية، وآلات الكريب.'),
('spices', 'العطرية وعلب تنظيم التوابل', 'منظمات العطرية', 'Grid', 'حوامل التوابل الدوارة وعلب التخزين الزجاجية المحكمة.'),
('utensils', 'أدوات المطبخ اليومية', 'أدوات المطبخ', 'Utensils', 'سكاكين الشيف، أدوات السيليكون، المقشرات ومستلزمات الطبخ اليومية.'),
('tableware', 'مستلزمات المائدة والديكور', 'المائدة والديكور', 'Sparkles', 'صواني التقديم المغربية الأصيلة، سلال الدوم، ومفارش المائدة الراقية.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. إدخال إعدادات المتجر
INSERT INTO public.store_settings (id, store_name, whatsapp_number, store_phone, announcement_text, free_shipping_threshold, standard_shipping_fee, currency)
VALUES (
    'default',
    'دار الأواني المغربية',
    '212600123456',
    '0522001122',
    '🚚 التوصيل بالمجان لجميع مدن المغرب للطلبات فوق 300 درهم • الدفع نقداً عند الاستلام حتى تشوف السلعة ديالك!',
    300,
    35,
    'DH'
)
ON CONFLICT (id) DO NOTHING;

-- 3. إدخال المنتجات الأساسية
INSERT INTO public.products (id, name, category_id, price, original_price, image, description, features, in_stock, stock_quantity, rating, reviews_count, badge, is_featured)
VALUES
(
    'prod-cocotte-8l',
    'كوكوط إينوكس 8 لتر الأصلية بنظام أمان ثلاثي وقاعدة حرارية',
    'cookware',
    490,
    650,
    '/src/assets/images/product_cocotte_cooker_1793710812745.jpg',
    'طنجرة ضغط إينوكس 18/10 عالية الجودة سعة 8 لتر، مناسبة للعائلات والطهي السريع للحوم والخضار في دقائق معدودة، مزودة بنظام فتح وإغلاق سلس وصمام أمان مزدوج وقاعدة ثلاثية الطبقات توزع الحرارة بتساوٍ.',
    '["مصنوعة من الفولاذ المقاوم للصدأ إينوكس 18/10 الممتاز", "سعة 8 لتر كافية لـ 6 إلى 10 أشخاص", "نظام أمان ثلاثي مع صمام تفريغ البخار المحكم", "قاعدة حرارية كبسولية مناسبة لجميع أنواع المواقد", "مقابض عازلة للحرارة ومريحة في الحمل"]'::jsonb,
    true,
    18,
    4.9,
    142,
    'الأكثر مبيعاً',
    true
),
(
    'prod-airfryer-6l',
    'قلاية هوائية رقمية Air Fryer سعة 6 لتر بنافذة زجاجية ولمس ذكي',
    'airfryer',
    580,
    790,
    '/src/assets/images/product_airfryer_black_1793710813797.jpg',
    'إير فراير عصرية بقوة 1800 واط مع شاشة لمس ذكية، تتيح لك طهي أشهى المأكولات بنسبة دهون أقل بنسبة 85% مع نافذة زجاجية لمراقبة الطهي دون فتح الدرج.',
    '["سعة عائلية 6 لتر تكفي لكمية كبيرة دفعة واحدة", "نافذة أمامية زجاجية مع إضاءة داخلية", "8 برامج طهي ذكية مبرمجة مسبقاً", "تقنية تدوير الهواء الساخن 360 درجة", "سلة مانعة للالتصاق خالية من المواد الضارة"]'::jsonb,
    true,
    14,
    4.95,
    98,
    'عرض خاص',
    true
),
(
    'prod-tea-set-luxury',
    'طقم كؤوس الشاي المغربي الملكي بالنقش الذهبي مع براد إينوكس أصيل',
    'glasses',
    360,
    480,
    '/src/assets/images/product_tea_glasses_1793710813055.jpg',
    'طقم شاي مغربي راقي يجمع بين الأصالة والعصرية، مكون من 6 كؤوس شاي مرصعة بالنقوش الذهبية الموريسكية، وبراد شاي إينوكس منقوش بجودة عالية غير قابل للصدأ.',
    '["6 كؤوس شاي زجاجية عالية المقاومة للحرارة بنقش ذهبي فاخر", "براد شاي مغربي أصيل بسعة 1.2 لتر مع أرجل مزخرفة", "مقبض عازل للحرارة وتصميم يضمن صب الشاي بسلاسة", "نقوش يدوية متقنة تضفي لمسة بهجة على صينية الضيافة المغربية"]'::jsonb,
    true,
    25,
    4.88,
    86,
    'الأكثر طلباً',
    true
),
(
    'prod-dinner-set-ceramic',
    'طقم أواني وصحون مائدة سيراميك راقية (18 قطعة) مقاومة للحرارة',
    'plates',
    430,
    560,
    '/src/assets/images/product_dinner_plates_1793710813858.jpg',
    'طقم صحون مائدة فاخر بتصميم هادئ وحواف ناعمة، يضم 6 صحون رئيسية، 6 صحون مقبلات وسلطات، و6 زلايف حساء. مناسب للاستعمال اليومي وللمناسبات والضيافة الراقية.',
    '["18 قطعة متكاملة مصنوعة من الخزف والسيراميك الصلب", "مقاومة للخدش والتشققات وغسالة الأواني والميكروويف", "حواف بنية دافئة تمنح المائدة لمسة دافئة وفخمة", "تعبئة آمنة تضمن وصول المنتج سليماً 100%"]'::jsonb,
    true,
    20,
    4.85,
    64,
    'تصميم راقي',
    true
),
(
    'prod-keskas-moroccan',
    'برمة وكسكاس إينوكس مغربي أصلي سعة 8 لتر لتفوار الكسكس',
    'pans_pots',
    320,
    420,
    'https://images.unsplash.com/photo-1584990347449-399a87d60ff3?auto=format&fit=crop&w=800&q=80',
    'الكسكاس المغربي التقليدي مصنوع من الإينوكس الصافي المقاوم للصدأ، محكم الإغلاق لمنع تسرب البخار وضمان تفوار الكسكس والخضار واللحم بنتيجة معسلة ولذيذة.',
    '["إينوكس غذائي متين لا يصدأ ولا يغير طعم الأكل", "غطاء زجاجي مقوى مع مقبض عازل للحرارة", "ثقوب الكسكاس مدروسة لمرور متوازن للبخار", "سعة 8 لتر مناسبة للعائلات والجمعات المغربية"]'::jsonb,
    true,
    19,
    4.9,
    77,
    NULL,
    false
),
(
    'prod-granite-pans-3pcs',
    'طقم مقالي جرانيت ألمانية غير لاصقة (3 مقالي: 20، 24، 28 سم)',
    'pans_pots',
    350,
    470,
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
    'ثلاث مقالي جرانيت متينة بملمس حجري فاخر تمنع التصاق الأكل تماماً وتمكنك من الطهي بدون قطرة زيت. مقابض ذات ملمس خشب ناعم ومقاومة للحرارة.',
    '["طلاء جرانيت صحي 5 طبقات خالٍ من مادة PFOA", "3 أحجام مختلفة تلبي جميع احتياجات القلي", "توزيع متساوٍ للحرارة يوفر استهلاك الغاز", "تنظيف فائق السهولة بمسحة خفيفة"]'::jsonb,
    true,
    30,
    4.92,
    110,
    'تخفيض 25%',
    true
),
(
    'prod-electric-hachoir-3l',
    'هاشوار كهربائية احترافية 3 لتر 4 شفرات إينوكس ومحرك نحاسي نقي',
    'appliances',
    240,
    320,
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
    'المساعد الأول لكل ربة بيت مغربية! هاشوار قوية بوعاء إينوكس كبير 3 لتر غير قابل للكسر، تفرم اللحم، تقطع البصل والقزبر والمعدنوس، وتطحن المكسرات في ثوانٍ.',
    '["محرك نحاسي قوي 500 واط مع سرعتين للتحكم", "وعاء من الإينوكس سعة 3 لتر مقاوم للصدمات", "4 شفرات حادة مزدوجة من الفولاذ غير القابل للصدأ", "قاعدة مطاطية مانعة للانزلاق أثناء التشغيل"]'::jsonb,
    true,
    45,
    4.86,
    195,
    'ضرورية في كل مطبخ',
    true
),
(
    'prod-moroccan-tray-silver',
    'صينية الشاي المغربية الفضية الملكية المنقوشة (سنيّة مغربية أصيلة 45 سم)',
    'tableware',
    310,
    420,
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    'صينية تقليدية مغربية فاخرة بقطر 45 سم، مزينة بنقوش أرابيسك أصيلة مستوحاة من الصانع التقليدي الفاسي. لمعان فضي دائم ومقاوم للبقع يزين جلسات الشاي والمناسبات.',
    '["نقوش مغربية يدوية أصيلة ومتقنة", "أرجل نحاسية صغيرة تمنح الصينية ثباتاً وارتفاعاً راقياً", "طلاء فضي لامع مقاوم للحرارة والرطوبة", "حجم واسع يتسع لبراد شاي كبير و12 كأساً"]'::jsonb,
    true,
    15,
    4.95,
    68,
    'صناعة تقليدية',
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    features = EXCLUDED.features;

-- تم اكتمال إعداد الجداول والبيانات بنجاح!
`;
