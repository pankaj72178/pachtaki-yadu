/* ============================================================
   Lightweight bilingual (English / हिंदी) layer.
   Tag any static element with data-i18n="key" (textContent) or
   data-i18n-ph="key" (placeholder). The toggle in the nav flips
   the whole UI and remembers the choice in localStorage.
   NOTE: <option value="..."> values stay English so the backend
   keeps receiving canonical values — only the visible label flips.
   ============================================================ */
(function () {
  const T = {
    en: {
      "nav.notices": "NOTICES",
      "nav.services": "SERVICES",
      "nav.events": "EVENTS",
      "nav.agriculture": "AGRICULTURE",
      "nav.jobs": "JOBS",
      "nav.complaints": "COMPLAINTS",
      "nav.village": "ABOUT VILLAGE",
      "nav.author": "ABOUT AUTHOR",

      "hero.title": "Pachtaki Yadu",
      "hero.subtitle": "Digital Village Governance Portal",
      "hero.register": "REGISTER COMPLAINT",
      "hero.notices": "VIEW NOTICES",

      "sec.notices": "📢 Public Notices",
      "sec.services": "🏛️ Government Services",
      "sec.events": "📅 Village Events",
      "sec.agriculture": "🌾 Agriculture Support",
      "sec.jobs": "💼 Job Opportunities",
      "sec.budget": "💰 Budget & Expenditure",
      "sec.suggestions": "💡 Suggestions & Ideas",

      "cmp.heading": "👤 Citizen Section — Register a Complaint",
      "cmp.subtitle":
        "Sign in to file a complaint. You'll get a confirmation email once it's submitted.",
      "cmp.fullName": "Full Name",
      "cmp.selectWard": "Select Ward",
      "cmp.selectCategory": "Select Category",
      "cmp.describe": "Describe the issue...",
      "cmp.submit": "SUBMIT COMPLAINT",
      "cmp.pinHint": "📍 Tap the map to pin the issue's location (optional)",
      "cmp.community": "🗣️ Community Complaints",
      "cmp.communitySub":
        "Public — visible to everyone. The identity of who filed each complaint stays private.",
      "cmp.mapView": "🗺️ Issues on the map",
      "cmp.search": "Search complaints...",
      "cmp.allCategories": "All categories",
      "cmp.allWards": "All wards",
      "cmp.allStatuses": "All statuses",

      "sev.low": "🟢 Low Priority",
      "sev.medium": "🟡 Medium Priority",
      "sev.high": "🔴 High Priority",

      "cat.road": "🛣️ Road & Infrastructure",
      "cat.water": "💧 Water Supply",
      "cat.electricity": "⚡ Electricity",
      "cat.sanitation": "🧹 Sanitation",
      "cat.other": "📝 Other",

      "village.title": "About Our Village",
      "author.title": "About The Author",
    },
    hi: {
      "nav.notices": "सूचनाएँ",
      "nav.services": "सेवाएँ",
      "nav.events": "कार्यक्रम",
      "nav.agriculture": "कृषि",
      "nav.jobs": "नौकरियाँ",
      "nav.complaints": "शिकायतें",
      "nav.village": "गाँव के बारे में",
      "nav.author": "लेखक के बारे में",

      "hero.title": "पछतकी यदु",
      "hero.subtitle": "डिजिटल ग्राम शासन पोर्टल",
      "hero.register": "शिकायत दर्ज करें",
      "hero.notices": "सूचनाएँ देखें",

      "sec.notices": "📢 सार्वजनिक सूचनाएँ",
      "sec.services": "🏛️ सरकारी सेवाएँ",
      "sec.events": "📅 गाँव के कार्यक्रम",
      "sec.agriculture": "🌾 कृषि सहायता",
      "sec.jobs": "💼 रोज़गार के अवसर",
      "sec.budget": "💰 बजट और व्यय",
      "sec.suggestions": "💡 सुझाव और विचार",

      "cmp.heading": "👤 नागरिक अनुभाग — शिकायत दर्ज करें",
      "cmp.subtitle":
        "शिकायत दर्ज करने के लिए साइन इन करें। जमा होते ही आपको पुष्टिकरण ईमेल मिलेगा।",
      "cmp.fullName": "पूरा नाम",
      "cmp.selectWard": "वार्ड चुनें",
      "cmp.selectCategory": "श्रेणी चुनें",
      "cmp.describe": "समस्या का विवरण दें...",
      "cmp.submit": "शिकायत जमा करें",
      "cmp.pinHint": "📍 समस्या का स्थान चिह्नित करने के लिए मानचित्र पर टैप करें (वैकल्पिक)",
      "cmp.community": "🗣️ सामुदायिक शिकायतें",
      "cmp.communitySub":
        "सार्वजनिक — सभी को दिखती हैं। शिकायत दर्ज करने वाले की पहचान निजी रहती है।",
      "cmp.mapView": "🗺️ मानचित्र पर समस्याएँ",
      "cmp.search": "शिकायतें खोजें...",
      "cmp.allCategories": "सभी श्रेणियाँ",
      "cmp.allWards": "सभी वार्ड",
      "cmp.allStatuses": "सभी स्थितियाँ",

      "sev.low": "🟢 निम्न प्राथमिकता",
      "sev.medium": "🟡 मध्यम प्राथमिकता",
      "sev.high": "🔴 उच्च प्राथमिकता",

      "cat.road": "🛣️ सड़क और बुनियादी ढाँचा",
      "cat.water": "💧 जल आपूर्ति",
      "cat.electricity": "⚡ बिजली",
      "cat.sanitation": "🧹 स्वच्छता",
      "cat.other": "📝 अन्य",

      "village.title": "हमारे गाँव के बारे में",
      "author.title": "लेखक के बारे में",
    },
  };

  let lang = localStorage.getItem("lang") || "en";

  function apply(l) {
    if (!T[l]) l = "en";
    lang = l;
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = T[l][el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const v = T[l][el.getAttribute("data-i18n-ph")];
      if (v != null) el.setAttribute("placeholder", v);
    });

    const btn = document.getElementById("langToggle");
    if (btn) btn.textContent = l === "en" ? "हिं" : "EN";
  }

  // Public API
  window.I18N = { apply, get: () => lang, t: (k) => (T[lang] && T[lang][k]) || k };
  window.toggleLang = () => apply(lang === "en" ? "hi" : "en");

  document.addEventListener("DOMContentLoaded", () => apply(lang));
})();
