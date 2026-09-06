export type Locale = 'ru' | 'en' | 'ar'

export const DEFAULT_LOCALE: Locale = 'ru'

export const LOCALE_NAMES: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  ar: 'AR',
}

export const LOCALE_LABELS: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  ar: 'العربية',
}

export const LOCALE_DIR: Record<Locale, 'ltr' | 'rtl'> = {
  ru: 'ltr',
  en: 'ltr',
  ar: 'rtl',
}

// ─── All UI strings ───────────────────────────────────────────────────────────

export interface Translations {
  // Navbar
  nav_galleries: string
  nav_contact: string

  // Homepage hero
  hero_location: string
  hero_subtitle: string
  hero_description: string
  hero_cta_galleries: string
  hero_cta_contact: string

  // Homepage sections
  specialties_label: string
  specialties_heading: string
  approach_label: string
  approach_quote: string
  approach_body: string
  cta_label: string
  cta_heading: string
  cta_body: string
  cta_button: string
  contact_label: string
  contact_heading: string
  contact_whatsapp: string
  contact_instagram: string

  // Gallery categories
  cat_wedding: string
  cat_portrait: string
  cat_event: string
  cat_family: string
  cat_newborn: string
  cat_commercial: string
  cat_landscape: string
  cat_other: string

  // Galleries archive page
  galleries_all: string
  galleries_empty_title: string
  galleries_empty_cat: string
  galleries_demo_notice: string

  // Gallery card
  card_preview: string

  // Gallery page
  gallery_back: string
  gallery_photos_one: string
  gallery_photos_many: string
  gallery_favorites: string
  gallery_share: string
  gallery_download_all: string
  gallery_no_photos_title: string
  gallery_no_photos_desc: string

  // Share
  share_copy: string
  share_copied: string
  share_whatsapp: string
  share_more: string
  share_link_copied: string

  // Favorites
  fav_heading: string
  fav_empty_title: string
  fav_empty_desc: string
  fav_download: string
  fav_clear: string
  fav_add: string
  fav_remove: string

  // Lightbox
  lb_close: string
  lb_prev: string
  lb_next: string
  lb_download: string
  lb_fav_add: string
  lb_fav_remove: string

  // Footer
  footer_nav: string
  footer_contact: string
  footer_home: string
  footer_rights: string

  // Downloads
  download_photo: string

  // Mobile bar labels
  mobile_favorites: string
  mobile_download: string
}

// ─── RUSSIAN (default) ───────────────────────────────────────────────────────

const ru: Translations = {
  nav_galleries: 'Галереи',
  nav_contact: 'Контакты',

  hero_location: 'Шарм-эль-Шейх, Египет',
  hero_subtitle: 'Фотография',
  hero_description: 'Запечатляем вечные моменты с редакционным взглядом. Свадьбы, портреты, мероприятия и многое другое.',
  hero_cta_galleries: 'Смотреть галереи',
  hero_cta_contact: 'Связаться',

  specialties_label: 'Специализации',
  specialties_heading: 'Что мы снимаем',
  approach_label: 'Наш подход',
  approach_quote: '«Каждый кадр рассказывает историю. Каждый момент — сохранён навсегда.»',
  approach_body: 'Базируясь в живом городе Шарм-эль-Шейх, мы привносим чистый редакционный взгляд в каждую съёмку — будь то интимная свадьба, семейная сессия или корпоративное мероприятие.',
  cta_label: 'Ваши галереи',
  cta_heading: 'Галереи клиентов',
  cta_body: 'Если вы снимались у нас, ваши фотографии ждут вас. Просматривайте и скачивайте воспоминания.',
  cta_button: 'Открыть галереи',
  contact_label: 'Работаем вместе',
  contact_heading: 'Связаться',
  contact_whatsapp: 'WhatsApp',
  contact_instagram: 'Instagram',

  cat_wedding: 'Свадьба',
  cat_portrait: 'Портрет',
  cat_event: 'Мероприятие',
  cat_family: 'Семья',
  cat_newborn: 'Новорождённые',
  cat_commercial: 'Коммерческое',
  cat_landscape: 'Пейзаж',
  cat_other: 'Другое',

  galleries_all: 'Все',
  galleries_empty_title: 'Галерей пока нет',
  galleries_empty_cat: 'В этой категории пока нет галерей.',
  galleries_demo_notice: 'Предпросмотр — добавьте свои галереи через Admin',

  card_preview: 'Превью',

  gallery_back: 'Все галереи',
  gallery_photos_one: 'фото',
  gallery_photos_many: 'фото',
  gallery_favorites: 'Избранное',
  gallery_share: 'Поделиться',
  gallery_download_all: 'Скачать всё',
  gallery_no_photos_title: 'Фото пока нет',
  gallery_no_photos_desc: 'Фотографии появятся здесь после загрузки фотографом.',

  share_copy: 'Копировать ссылку',
  share_copied: 'Ссылка скопирована!',
  share_whatsapp: 'Поделиться в WhatsApp',
  share_more: 'Ещё варианты…',
  share_link_copied: 'Ссылка скопирована в буфер обмена!',

  fav_heading: 'Избранное',
  fav_empty_title: 'Нет избранного',
  fav_empty_desc: 'Нажмите на сердечко на любом фото, чтобы сохранить его здесь.',
  fav_download: 'Скачать',
  fav_clear: 'Очистить избранное',
  fav_add: 'Добавить в избранное',
  fav_remove: 'Убрать из избранного',

  lb_close: 'Закрыть',
  lb_prev: 'Назад',
  lb_next: 'Вперёд',
  lb_download: 'Скачать фото',
  lb_fav_add: 'В избранное',
  lb_fav_remove: 'Убрать из избранного',

  footer_nav: 'Навигация',
  footer_contact: 'Контакты',
  footer_home: 'Главная',
  footer_rights: 'Все права защищены.',

  download_photo: 'Скачать фото',
  mobile_favorites: 'Избранное',
  mobile_download: 'Скачать',
}

// ─── ENGLISH ─────────────────────────────────────────────────────────────────

const en: Translations = {
  nav_galleries: 'Galleries',
  nav_contact: 'Contact',

  hero_location: 'Sharm El Sheikh, Egypt',
  hero_subtitle: 'Photography',
  hero_description: 'Capturing timeless moments with an editorial eye. Weddings, portraits, events, and more.',
  hero_cta_galleries: 'View Galleries',
  hero_cta_contact: 'Get in Touch',

  specialties_label: 'Specialties',
  specialties_heading: 'What We Capture',
  approach_label: 'The Approach',
  approach_quote: '"Every frame tells a story. Every moment, preserved forever."',
  approach_body: 'Based in the vibrant city of Sharm El Sheikh, we bring a clean, editorial perspective to every shoot — whether it\'s an intimate wedding, a family session, or a corporate event.',
  cta_label: 'Your Galleries',
  cta_heading: 'View Client Galleries',
  cta_body: 'If you\'ve had a session with us, your photos are waiting. Browse and download your memories.',
  cta_button: 'Go to Galleries',
  contact_label: 'Let\'s Work Together',
  contact_heading: 'Get in Touch',
  contact_whatsapp: 'WhatsApp',
  contact_instagram: 'Instagram',

  cat_wedding: 'Wedding',
  cat_portrait: 'Portrait',
  cat_event: 'Event',
  cat_family: 'Family',
  cat_newborn: 'Newborn',
  cat_commercial: 'Commercial',
  cat_landscape: 'Landscape',
  cat_other: 'Other',

  galleries_all: 'All',
  galleries_empty_title: 'No galleries yet',
  galleries_empty_cat: 'No galleries in this category yet.',
  galleries_demo_notice: 'Preview — add your real galleries from admin',

  card_preview: 'Preview',

  gallery_back: 'All Galleries',
  gallery_photos_one: 'photo',
  gallery_photos_many: 'photos',
  gallery_favorites: 'Favorites',
  gallery_share: 'Share',
  gallery_download_all: 'Download All',
  gallery_no_photos_title: 'No photos yet',
  gallery_no_photos_desc: 'Photos will appear here once the photographer uploads them.',

  share_copy: 'Copy link',
  share_copied: 'Link copied!',
  share_whatsapp: 'Share via WhatsApp',
  share_more: 'More options…',
  share_link_copied: 'Link copied to clipboard!',

  fav_heading: 'Favorites',
  fav_empty_title: 'No favorites yet',
  fav_empty_desc: 'Tap the heart icon on any photo to save it here.',
  fav_download: 'Download',
  fav_clear: 'Clear All Favorites',
  fav_add: 'Add to favorites',
  fav_remove: 'Remove from favorites',

  lb_close: 'Close',
  lb_prev: 'Previous photo',
  lb_next: 'Next photo',
  lb_download: 'Download photo',
  lb_fav_add: 'Add to favorites',
  lb_fav_remove: 'Remove from favorites',

  footer_nav: 'Navigation',
  footer_contact: 'Contact',
  footer_home: 'Home',
  footer_rights: 'All rights reserved.',

  download_photo: 'Download photo',
  mobile_favorites: 'Favorites',
  mobile_download: 'Download',
}

// ─── ARABIC ───────────────────────────────────────────────────────────────────

const ar: Translations = {
  nav_galleries: 'المعارض',
  nav_contact: 'تواصل',

  hero_location: 'شرم الشيخ، مصر',
  hero_subtitle: 'تصوير',
  hero_description: 'نلتقط اللحظات الخالدة بعين تحريرية. حفلات الزفاف والبورتريهات والفعاليات والمزيد.',
  hero_cta_galleries: 'عرض المعارض',
  hero_cta_contact: 'تواصل معنا',

  specialties_label: 'التخصصات',
  specialties_heading: 'ماذا نلتقط',
  approach_label: 'أسلوبنا',
  approach_quote: '«كل إطار يحكي قصة. كل لحظة محفوظة إلى الأبد.»',
  approach_body: 'انطلاقاً من مدينة شرم الشيخ النابضة بالحياة، نُضفي منظوراً تحريرياً نظيفاً على كل جلسة تصوير — سواء كانت حفل زفاف حميمياً أو جلسة عائلية أو حدثاً تجارياً.',
  cta_label: 'معارضك',
  cta_heading: 'معارض العملاء',
  cta_body: 'إذا أجريت جلسة تصوير معنا، فصورك بانتظارك. تصفّح وحمّل ذكرياتك.',
  cta_button: 'الذهاب إلى المعارض',
  contact_label: 'نعمل معاً',
  contact_heading: 'تواصل معنا',
  contact_whatsapp: 'واتساب',
  contact_instagram: 'إنستغرام',

  cat_wedding: 'زفاف',
  cat_portrait: 'بورتريه',
  cat_event: 'فعالية',
  cat_family: 'عائلة',
  cat_newborn: 'حديث الولادة',
  cat_commercial: 'تجاري',
  cat_landscape: 'مناظر طبيعية',
  cat_other: 'أخرى',

  galleries_all: 'الكل',
  galleries_empty_title: 'لا توجد معارض بعد',
  galleries_empty_cat: 'لا توجد معارض في هذه الفئة بعد.',
  galleries_demo_notice: 'معاينة — أضف معارضك الحقيقية من لوحة التحكم',

  card_preview: 'معاينة',

  gallery_back: 'كل المعارض',
  gallery_photos_one: 'صورة',
  gallery_photos_many: 'صور',
  gallery_favorites: 'المفضلة',
  gallery_share: 'مشاركة',
  gallery_download_all: 'تحميل الكل',
  gallery_no_photos_title: 'لا توجد صور بعد',
  gallery_no_photos_desc: 'ستظهر الصور هنا بمجرد رفعها من قِبل المصوّر.',

  share_copy: 'نسخ الرابط',
  share_copied: 'تم نسخ الرابط!',
  share_whatsapp: 'مشاركة عبر واتساب',
  share_more: 'المزيد من الخيارات…',
  share_link_copied: 'تم نسخ الرابط إلى الحافظة!',

  fav_heading: 'المفضلة',
  fav_empty_title: 'لا توجد مفضلة بعد',
  fav_empty_desc: 'اضغط على أيقونة القلب على أي صورة لحفظها هنا.',
  fav_download: 'تحميل',
  fav_clear: 'مسح كل المفضلة',
  fav_add: 'إضافة إلى المفضلة',
  fav_remove: 'إزالة من المفضلة',

  lb_close: 'إغلاق',
  lb_prev: 'الصورة السابقة',
  lb_next: 'الصورة التالية',
  lb_download: 'تحميل الصورة',
  lb_fav_add: 'إضافة إلى المفضلة',
  lb_fav_remove: 'إزالة من المفضلة',

  footer_nav: 'التنقل',
  footer_contact: 'تواصل',
  footer_home: 'الرئيسية',
  footer_rights: 'جميع الحقوق محفوظة.',

  download_photo: 'تحميل الصورة',
  mobile_favorites: 'المفضلة',
  mobile_download: 'تحميل',
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const TRANSLATIONS: Record<Locale, Translations> = { ru, en, ar }
