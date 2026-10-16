// AeroWings AI Flight Copilot - Ultra-Clean Multilingual Speech Synthesis Engine
import { AiLanguageCode } from '../types/airline';

type VoiceListener = (state: {
  isSpeaking: boolean;
  isMuted: boolean;
  currentText: string;
  language?: AiLanguageCode;
}) => void;

// Accurate BCP-47 and voice identifier priorities
export const LANGUAGE_LOCALE_MAP: Record<AiLanguageCode, string[]> = {
  kn: ['kn-IN', 'kn', 'kannada', 'Google ಕನ್ನಡ'],
  te: ['te-IN', 'te', 'telugu', 'Google తెలుగు'],
  ta: ['ta-IN', 'ta', 'tamil', 'Google தமிழ்'],
  hi: ['hi-IN', 'hi', 'hindi', 'Google हिन्दी', 'Lekha', 'Kalpana', 'Hemant', 'Swara', 'Madhur'],
  ml: ['ml-IN', 'ml', 'malayalam', 'Google മലയാളം'],
  mr: ['mr-IN', 'mr', 'marathi', 'Google मराठी'],
  bn: ['bn-IN', 'bn-BD', 'bn', 'bengali', 'bangla', 'Google বাংলা'],
  gu: ['gu-IN', 'gu', 'gujarati', 'Google ગુજરાતી'],
  en: ['en-IN', 'en-US', 'en-GB', 'en-AU', 'en', 'Google UK English Female', 'Samantha'],
  fr: ['fr-FR', 'fr-CA', 'fr', 'French', 'Thomas', 'Amelie'],
  es: ['es-ES', 'es-MX', 'es-US', 'es', 'Spanish', 'Monica', 'Jorge'],
  ar: ['ar-SA', 'ar-AE', 'ar-EG', 'ar', 'Arabic', 'Maged', 'Tarik'],
  de: ['de-DE', 'de-AT', 'de', 'German', 'Anna', 'Markus'],
};

// Clean text for perfect pronunciation without TTS glitching
function sanitizeSpeechText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[*_#`~\[\]]/g, '') // remove markdown
    .replace(/\s+/g, ' ')
    .replace(/[•●★►→]/g, '')
    .trim();
}

// Phonetic dictionary for crystal-clear natural pronunciation when native Indic/foreign voice is absent on user OS
const PHONETIC_MAP: Record<AiLanguageCode, Record<string, string>> = {
  kn: {
    'ನಮಸ್ಕಾರ': 'Namaskara',
    'ವಿಮಾನ': 'Vimaana',
    'ವಿಮಾನಗಳು': 'Vimaanagalu',
    'ಆಯ್ಕೆಯಾಗಿದೆ': 'Aaykeyaagide',
    'ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ': 'Aaykemaadalaagide',
    'ಹಂತ': 'Hanta',
    'ಪ್ರಯಾಣಿಕರ': 'Prayaanikara',
    'ವಿವರಗಳಿಗೆ': 'Vivaragalige',
    'ಮುಂದುವರಿಯಿರಿ': 'Munduvariyiri',
    'ದಾಖಲೆಗಳು': 'Daakhalegalu',
    'ಪರಿಶೀಲಿಸಲಾಗಿದೆ': 'Parishiilisalaagide',
    'ಆಸನ': 'Aasana',
    'ಸಂಖ್ಯೆ': 'Sankhye',
    'ನಿಯೋಜಿಸಲಾಗಿದೆ': 'Niyojisalaagide',
    'ಬುಕಿಂಗ್': 'Booking',
    'ದೃಢೀಕರಿಸಲಾಗಿದೆ': 'Dridheekarisalaagide',
    'ಡಿಜಿಟಲ್': 'Digital',
    'ಇ-ಟಿಕೆಟ್': 'E-ticket',
    'ಸಿದ್ಧವಾಗಿದೆ': 'Siddhavaagide',
    'ಹವಾಮಾನ': 'Havaamaana',
    'ಎಚ್ಚರಿಕೆ': 'Eccharike',
    'ರದ್ದುಗೊಂಡಿದೆ': 'Raddugondide',
    'ರೂಪಾಯಿ': 'Roopaayi',
    'ಮರುಪಾವತಿ': 'Marupaavati',
    'ತಕ್ಷಣ': 'Takshana',
    'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ': 'Prakriyegolisalaagide',
    'ಧನ್ಯವಾದಗಳು': 'Dhanyavaadagalu',
    'ಸುಸ್ವಾಗತ': 'Susvaagatha',
    'ಆಧಾರ್': 'Aadhaar'
  },
  te: {
    'నమస్కారం': 'Namaskaram',
    'విమానం': 'Vimaanam',
    'విమానాలు': 'Vimaanaalu',
    'ఎంపిక': 'Empika',
    'చేయబడింది': 'Cheyabadindi',
    'దశ': 'Dasha',
    'ప్రయాణికుల': 'Prayaaneekula',
    'వివరాలకు': 'Vivaraalaku',
    'వెళ్లండి': 'Vellandi',
    'పత్రాలు': 'Patraalu',
    'ధృవీకరించబడ్డాయి': 'Dhruveekarincha baddaayi',
    'సీటు': 'Seatu',
    'సంఖ్య': 'Sankhya',
    'కేటాయించబడింది': 'Ketaayincha badindi',
    'బుకింగ్': 'Booking',
    'ధృవీకరించబడింది': 'Dhruveekarincha badindi',
    'వాతావరణ': 'Vaathaavarana',
    'హెచ్చరిక': 'Heccharika',
    'రద్దు': 'Raddu',
    'రూపాయలు': 'Roopaayalu',
    'రీఫండ్': 'Refund',
    'సిద్ధంగా': 'Siddhangaa',
    'ఉంది': 'Undi',
    'ధన్యవాదాలు': 'Dhanyavaadaalu'
  },
  ta: {
    'வணக்கம்': 'Vanakkam',
    'விமானம்': 'Vimaanam',
    'விமானங்கள்': 'Vimaanangal',
    'தேர்ந்தெடுக்கப்பட்டது': 'Therndhedukkappattadhu',
    'படி': 'Padi',
    'பயணிகள்': 'Payanigal',
    'விவரங்களுக்கு': 'Vivarangalukku',
    'செல்லவும்': 'Sellavum',
    'ஆவணங்கள்': 'Aavanangal',
    'சரிபார்க்கப்பட்டன': 'Saripaarkkappattana',
    'இருக்கை': 'Irukkai',
    'எண்': 'Enn',
    'ஒதுக்கப்பட்டது': 'Odhukkappattadhu',
    'முன்பதிவு': 'Munpadhivu',
    'உறுதி': 'Urudhi',
    'செய்யப்பட்டது': 'Seyyappattadhu',
    'மின்-டிக்கெட்': 'Min-ticket',
    'தயாராக': 'Thayaaraaga',
    'உள்ளது': 'Ulladhu',
    'வானிலை': 'Vaanilai',
    'எச்சரிக்கை': 'Eccharikkai',
    'ரத்து': 'Ratthu',
    'ரூபாய்': 'Roobaay',
    'நன்றி': 'Nandri'
  },
  hi: {
    'नमस्ते': 'Namaste',
    'उड़ान': 'Udaan',
    'उड़ानें': 'Udaanein',
    'चयन': 'Chayan',
    'चरण': 'Charan',
    'यात्री': 'Yaatri',
    'विवरण': 'Vivaran',
    'सत्यापित': 'Satyaapit',
    'सीट': 'Seat',
    'संख्या': 'Sankhya',
    'आवंटित': 'Aavantit',
    'बुकिंग': 'Booking',
    'पुष्टि': 'Pushti',
    'तैयार': 'Taiyaar',
    'मौसम': 'Mausam',
    'चेतावनी': 'Chetaavani',
    'रद्द': 'Radd',
    'रिफंड': 'Refund',
    'धन्यवाद': 'Dhanyavaad'
  },
  ml: {
    'നമസ്കാരം': 'Namaskaram',
    'ഫ്ലൈറ്റ്': 'Flight',
    'തിരഞ്ഞെടുത്തു': 'Thiranjeduthu',
    'യാത്രക്കാരുടെ': 'Yaathrakkaarude',
    'വിവരങ്ങൾ': 'Vivarangal',
    'സീറ്റ്': 'Seat',
    'ബുക്കിംഗ്': 'Booking',
    'സ്ഥിരീകരിച്ചു': 'Stheereekaricchu'
  },
  mr: {
    'नमस्कार': 'Namaskar',
    'उड्डाण': 'Uddaan',
    'निवडले': 'Nivadle',
    'पायरी': 'Paayri',
    'प्रवासी': 'Pravaasi',
    'तपशील': 'Tapsheel',
    'पडताळणी': 'Padtaalani'
  },
  bn: {
    'নমস্কার': 'Nomoshkaar',
    'ফ্লাইট': 'Flight',
    'নির্বাচিত': 'Nirbaachito',
    'ধাপ': 'Dhaap',
    'যাত্রী': 'Yaatri',
    'তথ্য': 'Tothyo'
  },
  gu: {
    'નમસ્તે': 'Namaste',
    'ફ્લાઇટ': 'Flight',
    'પસંદ': 'Pasand',
    'સ્ટેપ': 'Step',
    'મુસાફરોની': 'Musaafaroni',
    'વિગતો': 'Vigato'
  },
  en: {},
  fr: {},
  es: {},
  ar: {},
  de: {}
};

// General Indic Script to Phonetic Transliteration Engine
// Enables English/General OS speech engines to pronounce any text in Kannada, Telugu, Tamil, Hindi, etc.
// with natural cadence when native voices are missing.

const INDIC_VOWELS: Record<string, string> = {
  // Kannada
  '\u0C85': 'a', '\u0C86': 'aa', '\u0C87': 'i', '\u0C88': 'ee', '\u0C89': 'u', '\u0C8A': 'oo',
  '\u0C8B': 'ri', '\u0C8E': 'e', '\u0C8F': 'e', '\u0C90': 'ai', '\u0C92': 'o', '\u0C93': 'o', '\u0C94': 'au',
  // Telugu
  '\u0C05': 'a', '\u0C06': 'aa', '\u0C07': 'i', '\u0C08': 'ee', '\u0C09': 'u', '\u0C0A': 'oo',
  '\u0C0B': 'ri', '\u0C0E': 'e', '\u0C0F': 'e', '\u0C10': 'ai', '\u0C12': 'o', '\u0C13': 'o', '\u0C14': 'au',
  // Tamil
  '\u0B85': 'a', '\u0B86': 'aa', '\u0B87': 'i', '\u0B88': 'ee', '\u0B89': 'u', '\u0B8A': 'oo',
  '\u0B8E': 'e', '\u0B8F': 'e', '\u0B90': 'ai', '\u0B92': 'o', '\u0B93': 'o', '\u0B94': 'au',
  // Devanagari (Hindi / Marathi)
  '\u0905': 'a', '\u0906': 'aa', '\u0907': 'i', '\u0908': 'ee', '\u0909': 'u', '\u090A': 'oo',
  '\u090B': 'ri', '\u090F': 'e', '\u0910': 'ai', '\u0913': 'o', '\u0914': 'au',
  // Bengali
  '\u0985': 'a', '\u0986': 'aa', '\u0987': 'i', '\u0988': 'ee', '\u0989': 'u', '\u098A': 'oo',
  '\u098F': 'e', '\u0990': 'ai', '\u0993': 'o', '\u0994': 'au',
  // Malayalam
  '\u0D05': 'a', '\u0D06': 'aa', '\u0D07': 'i', '\u0D08': 'ee', '\u0D09': 'u', '\u0D0A': 'oo',
  '\u0D0E': 'e', '\u0D0F': 'e', '\u0D10': 'ai', '\u0D12': 'o', '\u0D13': 'o', '\u0D14': 'au',
  // Gujarati
  '\u0A85': 'a', '\u0A86': 'aa', '\u0A87': 'i', '\u0A88': 'ee', '\u0A89': 'u', '\u0A8A': 'oo',
  '\u0A8F': 'e', '\u0A90': 'ai', '\u0A93': 'o', '\u0A94': 'au'
};

const INDIC_MATRAS: Record<string, string> = {
  // Kannada
  '\u0CBE': 'aa', '\u0CBF': 'i', '\u0CC0': 'ee', '\u0CC1': 'u', '\u0CC2': 'oo',
  '\u0CC3': 'ri', '\u0CC6': 'e', '\u0CC7': 'e', '\u0CC8': 'ai', '\u0CCA': 'o', '\u0CCB': 'o', '\u0CCC': 'au',
  // Telugu
  '\u0C3E': 'aa', '\u0C3F': 'i', '\u0C40': 'ee', '\u0C41': 'u', '\u0C42': 'oo',
  '\u0C43': 'ri', '\u0C46': 'e', '\u0C47': 'e', '\u0C48': 'ai', '\u0C4A': 'o', '\u0C4B': 'o', '\u0C4C': 'au',
  // Tamil
  '\u0BBE': 'aa', '\u0BBF': 'i', '\u0BC0': 'ee', '\u0BC1': 'u', '\u0BC2': 'oo',
  '\u0BC6': 'e', '\u0BC7': 'e', '\u0BC8': 'ai', '\u0BCA': 'o', '\u0BCB': 'o', '\u0BCC': 'au',
  // Devanagari (Hindi / Marathi)
  '\u093E': 'aa', '\u093F': 'i', '\u0940': 'ee', '\u0941': 'u', '\u0942': 'oo',
  '\u0943': 'ri', '\u0947': 'e', '\u0948': 'ai', '\u094B': 'o', '\u094C': 'au',
  // Bengali
  '\u09BE': 'aa', '\u09BF': 'i', '\u09C0': 'ee', '\u09C1': 'u', '\u09C2': 'oo',
  '\u09C7': 'e', '\u09C8': 'ai', '\u09CB': 'o', '\u09CC': 'au',
  // Malayalam
  '\u0D3E': 'aa', '\u0D3F': 'i', '\u0D40': 'ee', '\u0D41': 'u', '\u0D42': 'oo',
  '\u0D46': 'e', '\u0D47': 'e', '\u0D48': 'ai', '\u0D4A': 'o', '\u0D4B': 'o', '\u0D4C': 'au',
  // Gujarati
  '\u0ABE': 'aa', '\u0ABF': 'i', '\u0AC0': 'ee', '\u0AC1': 'u', '\u0AC2': 'oo',
  '\u0AC7': 'e', '\u0AC8': 'ai', '\u0ACB': 'o', '\u0ACC': 'au'
};

const INDIC_VIRAMAS = new Set(['\u0CCD', '\u0C4D', '\u0BCD', '\u094D', '\u09CD', '\u0D4D', '\u0ACD']);
const INDIC_ANUSVARA: Record<string, string> = {
  '\u0C82': 'm', '\u0C02': 'm', '\u0B82': 'm', '\u0902': 'n', '\u0982': 'ng', '\u0D02': 'm', '\u0A82': 'n'
};

const INDIC_CONSONANTS: Record<string, string> = {
  // Kannada consonants
  '\u0C95': 'k', '\u0C96': 'kh', '\u0C97': 'g', '\u0C98': 'gh', '\u0C99': 'ng',
  '\u0C9A': 'ch', '\u0C9B': 'chh', '\u0C9C': 'j', '\u0C9D': 'jh', '\u0C9E': 'ny',
  '\u0C9F': 't', '\u0CA0': 'th', '\u0CA1': 'd', '\u0CA2': 'dh', '\u0CA3': 'n',
  '\u0CA4': 't', '\u0CA5': 'th', '\u0CA6': 'd', '\u0CA7': 'dh', '\u0CA8': 'n',
  '\u0CAA': 'p', '\u0CAB': 'ph', '\u0CAC': 'b', '\u0CAD': 'bh', '\u0CAE': 'm',
  '\u0CAF': 'y', '\u0CB0': 'r', '\u0CB1': 'r', '\u0CB2': 'l', '\u0CB3': 'l',
  '\u0CB5': 'v', '\u0CB6': 'sh', '\u0CB7': 'sh', '\u0CB8': 's', '\u0CB9': 'h',
  // Telugu consonants
  '\u0C15': 'k', '\u0C16': 'kh', '\u0C17': 'g', '\u0C18': 'gh', '\u0C19': 'ng',
  '\u0C1A': 'ch', '\u0C1B': 'chh', '\u0C1C': 'j', '\u0C1D': 'jh', '\u0C1E': 'ny',
  '\u0C1F': 't', '\u0C20': 'th', '\u0C21': 'd', '\u0C22': 'dh', '\u0C23': 'n',
  '\u0C24': 't', '\u0C25': 'th', '\u0C26': 'd', '\u0C27': 'dh', '\u0C28': 'n',
  '\u0C2A': 'p', '\u0C2B': 'ph', '\u0C2C': 'b', '\u0C2D': 'bh', '\u0C2E': 'm',
  '\u0C2F': 'y', '\u0C30': 'r', '\u0C31': 'r', '\u0C32': 'l', '\u0C33': 'l',
  '\u0C35': 'v', '\u0C36': 'sh', '\u0C37': 'sh', '\u0C38': 's', '\u0C39': 'h',
  // Tamil consonants
  '\u0B95': 'k', '\u0B99': 'ng', '\u0B9A': 'ch', '\u0B9C': 'j', '\u0B9E': 'ny',
  '\u0B9F': 't', '\u0BA3': 'n', '\u0BA4': 'th', '\u0BA8': 'n', '\u0BA9': 'n',
  '\u0BAA': 'p', '\u0BAE': 'm', '\u0BAF': 'y', '\u0BB0': 'r', '\u0BB1': 'r',
  '\u0BB2': 'l', '\u0BB3': 'l', '\u0BB4': 'zh', '\u0BB5': 'v', '\u0BB7': 'sh',
  '\u0BB8': 's', '\u0BB9': 'h',
  // Devanagari (Hindi / Marathi)
  '\u0915': 'k', '\u0916': 'kh', '\u0917': 'g', '\u0918': 'gh', '\u0919': 'ng',
  '\u091A': 'ch', '\u091B': 'chh', '\u091C': 'j', '\u091D': 'jh', '\u091E': 'ny',
  '\u091F': 't', '\u0920': 'th', '\u0921': 'd', '\u0922': 'dh', '\u0923': 'n',
  '\u0924': 't', '\u0925': 'th', '\u0926': 'd', '\u0927': 'dh', '\u0928': 'n',
  '\u092A': 'p', '\u092B': 'ph', '\u092C': 'b', '\u092D': 'bh', '\u092E': 'm',
  '\u092F': 'y', '\u0930': 'r', '\u0932': 'l', '\u0933': 'l', '\u0935': 'v',
  '\u0936': 'sh', '\u0937': 'sh', '\u0938': 's', '\u0939': 'h'
};

function transliterateIndicToRoman(text: string): string {
  let output = '';
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const char = text[i];
    const nextChar = i + 1 < len ? text[i + 1] : '';

    if (INDIC_VOWELS[char]) {
      output += INDIC_VOWELS[char];
    } else if (INDIC_CONSONANTS[char]) {
      const base = INDIC_CONSONANTS[char];
      if (nextChar && INDIC_VIRAMAS.has(nextChar)) {
        output += base;
        i++; // skip virama
      } else if (nextChar && INDIC_MATRAS[nextChar]) {
        output += base + INDIC_MATRAS[nextChar];
        i++; // skip matra
      } else if (nextChar && INDIC_VOWELS[nextChar]) {
        output += base;
      } else {
        // Inherent 'a' vowel
        output += base + 'a';
      }
    } else if (INDIC_MATRAS[char]) {
      output += INDIC_MATRAS[char];
    } else if (INDIC_ANUSVARA[char]) {
      output += INDIC_ANUSVARA[char];
    } else if (!INDIC_VIRAMAS.has(char)) {
      output += char;
    }
  }

  // Clean up any repeated awkward double-vowels or spaces
  return output
    .replace(/aaa+/g, 'aa')
    .replace(/eee+/g, 'ee')
    .replace(/ooo+/g, 'oo')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toPhoneticPronunciation(text: string, lang: AiLanguageCode): string {
  if (lang === 'en' || !text) return text;
  
  // 1. Check dictionary word replacement first for maximum accuracy
  const dict = PHONETIC_MAP[lang];
  let result = text;
  if (dict && Object.keys(dict).length > 0) {
    for (const [key, val] of Object.entries(dict)) {
      result = result.split(key).join(val);
    }
  }

  // 2. If text still contains non-Latin characters (Indic scripts range 0x0900 to 0x0D7F)
  if (/[\u0900-\u0D7F]/.test(result)) {
    // Dynamically transliterate full sentence without dropping words or substituting generic sentences
    result = transliterateIndicToRoman(result);
  }

  return result;
}

// Automatic multilingual phrase localization for system and user navigation announcements
function localizeCommonAnnouncement(text: string, lang: AiLanguageCode): string {
  if (lang === 'en' || !text) return text;
  // If text already contains Indic/Arabic scripts, preserve authentic native text
  if (/[\u0900-\u0D7F\u0600-\u06FF]/.test(text)) return text;

  const lower = text.toLowerCase();
  
  if (lower.includes('step 1') || lower.includes('step 1:')) {
    const map: Record<string, string> = {
      kn: 'ಹಂತ 1: ನಿಮ್ಮ ಆದ್ಯತೆಯ ವಿಮಾನ ಮತ್ತು ಕ್ಯಾಬಿನ್ ಆಯ್ಕೆಮಾಡಿ. 100% ತಕ್ಷಣ ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
      te: 'దశ 1: మీ ప్రాధాన్య విమానాన్ని ఎంచుకోండి. 100% తక్షణ రీఫండ్ రక్షణ కలదు.',
      ta: 'படி 1: உங்கள் விருப்பமான விமானத்தைத் தேர்ந்தெடுக்கவும். 100% உடனடி பணத்தைத் திரும்பப் பெறுதல் பாதுகாப்பு.',
      hi: 'चरण 1: अपनी पसंदीदा उड़ान का चयन करें। 100% तत्काल रिफंड सुरक्षा सक्रिय है।',
      ml: 'സ്റ്റെപ്പ് 1: നിങ്ങളുടെ ഫ്ലൈറ്റ് തിരഞ്ഞെടുക്കുക.',
      mr: 'पायरी 1: आपली आवडती फ्लाईट निवडा. 100% परतावा हमी लागू.',
      bn: 'ধাপ ১: আপনার পছন্দের ফ্লাইট নির্বাচন করুন।',
      gu: 'સ્ટેપ ૧: તમારી પસંદગીની ફ્લાઇટ પસંદ કરો. ૧૦૦% રિફંડ ગેરંટી ઉપલબ્ધ છે.',
      fr: 'Étape 1: Choisissez votre vol avec garantie de remboursement.',
      es: 'Paso 1: Elija su vuelo con garantía de reembolso instantáneo.',
      de: 'Schritt 1: Wählen Sie Ihren Flug mit 100% Rückerstattungsgarantie.',
      ar: 'الخطوة 1: اختر رحلتك المفضلة مع ضمان استرداد الأموال بنسبة 100%.'
    };
    return map[lang] || text;
  }

  if (lower.includes('step 2') || lower.includes('step 2:')) {
    const map: Record<string, string> = {
      kn: 'ಹಂತ 2: ಪ್ರಯಾಣಿಕರ ವಿವರಗಳು ಮತ್ತು ಆಧಾರ್ ಅಥವಾ ಪಾಸ್‌ಪೋರ್ಟ್ ದಾಖಲೆ ಪರಿಶೀಲನೆ.',
      te: 'దశ 2: ప్రయాణికుల వివరాలు మరియు ఆధార్ లేదా పాస్‌పోర్ట్ ధృవీకరణ.',
      ta: 'படி 2: பயணிகள் விவரங்கள் மற்றும் ஆதார் அல்லது பாஸ்போர்ட் சரிபார்ப்பு.',
      hi: 'चरण 2: यात्री विवरण और पहचान पत्र का सत्यापन करें।',
      ml: 'സ്റ്റെപ്പ് 2: യാത്രക്കാരുടെ വിവരങ്ങളും രേഖകളും നൽകുക.',
      mr: 'पायरी 2: प्रवासी माहिती आणि आधार/पासपोर्ट पडताळणी.',
      bn: 'ধাপ ২: যাত্রীদের বিবরণ এবং পরিচয় যাচাইকরণ।',
      gu: 'સ્ટેપ ૨: મુસાફરોની વિગતો અને આધાર/પાસપોર્ટ ચકાસણી.',
      fr: 'Étape 2: Renseignez les coordonnées des passagers et les pièces d\'identité.',
      es: 'Paso 2: Ingrese los datos de los pasajeros y documentos oficiales.',
      de: 'Schritt 2: Passagierdaten und Ausweisdokumente eingeben.',
      ar: 'الخطوة 2: بيانات المسافرين والتحقق من الهوية.'
    };
    return map[lang] || text;
  }

  if (lower.includes('step 3') || lower.includes('step 3:')) {
    const map: Record<string, string> = {
      kn: 'ಹಂತ 3: ಕ್ಯಾಬಿನ್ ಸೀಟ್ ಆಯ್ಕೆ. ನಿಮ್ಮ ನೆಚ್ಚಿನ ಆಸನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      te: 'దశ 3: క్యాబిన్ సీటు ఎంపిక. కిటికీ లేదా నడవ సీటును ఎంచుకోండి.',
      ta: 'படி 3: இருக்கை தேர்வு. உங்களுக்குப் பிடித்த இருக்கையைத் தேர்ந்தெடுக்கவும்.',
      hi: 'चरण 3: सीट चयन। अपनी पसंदीदा खिड़की या गलियारे वाली सीट चुनें।',
      ml: 'സ്റ്റെപ്പ് 3: നിങ്ങളുടെ ಇരിപ്പിടം തിരഞ്ഞെടുക്കുക.',
      mr: 'पायरी 3: सीट निवड. विंडो किंवा आयल सीट निवडा.',
      bn: 'ধাপ ৩: আসন নির্বাচন করুন। আপনার পছন্দের উইন্ডো বা আইল আসন বেছে নিন।',
      gu: 'સ્ટેપ ૩: સીટ પસંદગી કરો.',
      fr: 'Étape 3: Choix de vos sièges en cabine.',
      es: 'Paso 3: Selección de asientos en cabina.',
      de: 'Schritt 3: Sitzplatzwahl in der Kabine.',
      ar: 'الخطوة 3: اختيار المقاعد في المقصورة.'
    };
    return map[lang] || text;
  }

  if (lower.includes('step 4') || lower.includes('step 4:')) {
    const map: Record<string, string> = {
      kn: 'ಹಂತ 4: ಉಚಿತ ಲಗೇಜ್ ಮತ್ತು ಊಟದ ಆಯ್ಕೆ. 7 ಕೆಜಿ ಕ್ಯಾಬಿನ್ ಮತ್ತು 15 ಕೆಜಿ ಚೆಕ್-ಇನ್ ಉಚಿತ.',
      te: 'దశ 4: ఉచిత లగేజీ మరియు భోజన ఎంపికలు. 7 కేజీల క్యాಬಿನ್ మరియు 15 కేజీల ಚೆಕ್-ಇನ್ ಉಚಿತಂ.',
      ta: 'படி 4: இலவச லக்கேஜ் மற்றும் உணவுத் தேர்வுகள்.',
      hi: 'चरण 4: सामान और भोजन चयन। 7 किग्रा केबिन और 15 किग्रा चेक-इन सामान शामिल है।',
      ml: 'സ്റ്റെപ്പ് 4: ലഗേജ്, ഭക്ഷണ തിരഞ്ഞെടുപ്പുകൾ.',
      mr: 'पायरी 4: सामान आणि जेवण पर्याय.',
      bn: 'ধাপ ৪: লাগেজ ও খাবার পছন্দ।',
      gu: 'સ્ટેપ ૪: બેગેજ અને ભોજન વિકલ્પો.',
      fr: 'Étape 4: Bagages et repas à bord inclus.',
      es: 'Paso 4: Equipaje y comidas a bordo.',
      de: 'Schritt 4: Freigepäck und Bordverpflegung.',
      ar: 'الخطوة 4: الأمتعة والوجبات على متن الطائرة.'
    };
    return map[lang] || text;
  }

  if (lower.includes('step 5') || lower.includes('step 5:')) {
    const map: Record<string, string> = {
      kn: 'ಹಂತ 5: ಪರಿಶೀಲನೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿ. 100% ತಕ್ಷಣ ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
      te: 'దశ 5: మీ ప్రయాణ సమీక్ష మరియు సురಕ್ಷಿತ చెల్లింపు. 100% ತಕ್ಷಣ ರೀಫಂಡ್ పాలసీ కలదు.',
      ta: 'படி 5: மதிப்பாய்வு மற்றும் பாதுகாப்பான கட்டணம். 100% உடனடி பணத்தைத் திரும்பப் பெறுதல் பாதுகாப்பு.',
      hi: 'चरण 5: समीक्षा और सुरक्षित भुगतान। 100% त्वरित रिफंड सुरक्षा सक्रिय है।',
      ml: 'സ്റ്റെപ്പ് 5: അവലോകനവും സുരക്ഷിത പേയ്‌മെന്റും.',
      mr: 'पायरी 5: पुनरावलोकन आणि सुरक्षित देयक. 100% परतावा संरक्षण.',
      bn: 'ধাপ ৫: বিবরণ পর্যালোচনা এবং নিরাপদ পেমেন্ট।',
      gu: 'સ્ટેપ ૫: સમીક્ષા અને સુરક્ષಿತ ચુકવણી.',
      fr: 'Étape 5: Récapitulatif et paiement sécurisé.',
      es: 'Paso 5: Resumen y pago seguro.',
      de: 'Schritt 5: Buchungsübersicht und sichere Zahlung.',
      ar: 'الخطوة 5: مراجعة الرحلة والدفع الآمن.'
    };
    return map[lang] || text;
  }

  if (lower.includes('verification incomplete') || lower.includes('visa verification are mandatory')) {
    const map: Record<string, string> = {
      kn: 'ಪರಿಶೀಲನೆ ಅಪೂರ್ಣವಾಗಿದೆ. ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು ಪ್ರಯಾಣಿಕರ ವಿವರಗಳು ಮತ್ತು ಆಧಾರ್/ಪಾಸ್‌ಪೋರ್ಟ್ ದಾಖಲೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
      te: 'ధృవీకరణ అసంపూర్ణంగా ఉంది. దయచేసి వివరాలను నమోదు చేయండి.',
      ta: 'சரிபார்ப்பு முழுமையடையவில்லை. பயணிகளின் விவரங்களை நிரப்பவும்.',
      hi: 'सत्यापन अधूरा है। कृपया आगे बढ़ने से पहले यात्री विवरण और पहचान पत्र की जांच करें।',
      ml: 'പരിശോധന അപൂർണ്ണമാണ്. ദയവായി വിവരങ്ങൾ നൽകുക.',
      mr: 'पडताळणी अपूर्ण आहे. कृपया माहिती पूर्ण करा.',
      bn: 'যাচাইকরণ অসম্পূর্ণ। অনুগ্রহ করে বিবরণ পূরণ করুন।',
      gu: 'ચકાસણી અધૂરી છે. કૃપા કરીને વિગતો પૂર્ણ કરો.',
      fr: 'Vérification incomplète. Veuillez compléter vos coordonnées.',
      es: 'Verificación incompleta. Por favor complete los datos.',
      de: 'Überprüfung unvollständig. Bitte vervollständigen Sie die Daten.',
      ar: 'التحقق غير مكتمل. يرجى إدخال البيانات المطلوبة.'
    };
    return map[lang] || text;
  }

  if (lower.includes('verified successfully') || lower.includes('verified.')) {
    const map: Record<string, string> = {
      kn: 'ಪ್ರಯಾಣಿಕರ ದಾಖಲೆಗಳು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
      te: 'ప్రయాణీకుల పత్రాలు విజయవంతంగా ధృవీకరించబడ్డాయి.',
      ta: 'பயணிகள் ஆவணங்கள் வெற்றிகரமாக சரிபார்க்கப்பட்டன.',
      hi: 'यात्री पहचान दस्तावेज सफलतापूर्वक सत्यापित हो गए हैं।',
      ml: 'യാത്രക്കാരുടെ രേഖകൾ വിജയകരമായി പരിശോധിച്ചു.',
      mr: 'प्रवासी कागदपत्रे यशस्वीरित्या पडताळली गेली आहेत.',
      bn: 'যাত্রীদের নথি সফলভাবে যাচাই করা হয়েছে।',
      gu: 'મુસાફરોની વિગતો સફળતાપૂર્વક ચકાસવામાં આવી છે.',
      fr: 'Documents des passagers vérifiés avec succès.',
      es: 'Documentos de los pasajeros verificados con éxito.',
      de: 'Passagierdokumente erfolgreich überprüft.',
      ar: 'تم التحقق من وثائق المسافرين بنجاح.'
    };
    return map[lang] || text;
  }

  if (lower.includes('proceeding to seat selection') || lower.includes('seat selection')) {
    const map: Record<string, string> = {
      kn: 'ದಾಖಲೆಗಳು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಆಸನ ಆಯ್ಕೆಗೆ ಮುಂದುವರಿಯಲಾಗುತ್ತಿದೆ.',
      te: 'పత్రాలు ధృవీకరించబడ్డాయి. సీటు ఎంపికకు వెళ్తున్నాము.',
      ta: 'ஆவணங்கள் சரிபார்க்கப்பட்டன. இருக்கை தேர்வுக்கு செல்கிறோம்.',
      hi: 'दस्तावेज सत्यापित। अब सीट चयन की ओर बढ़ रहे हैं।',
      ml: 'രേഖകൾ പരിശോധിച്ചു. ഇരിപ്പിടം തിരഞ്ഞെടുക്കലിലേക്ക് പോകുന്നു.',
      mr: 'कागदपत्रे पडताळली. आता सीट निवडीकडे जात आहोत.',
      bn: 'নথি যাচাই সম্পন্ন। আসন নির্বাচনে এগিয়ে যাচ্ছি।',
      gu: 'દસ્તાવેજો ચકાસાયા. હવે સીટ પસંદગી તરફ જઈ રહ્યા છીએ.',
      fr: 'Documents vérifiés. Passage à la sélection des sièges.',
      es: 'Documentos verificados. Pasando a la selección de asientos.',
      de: 'Dokumente überprüft. Weiter zur Sitzplatzwahl.',
      ar: 'تم التحقق من الوثائق. الانتقال إلى اختيار المقاعد.'
    };
    return map[lang] || text;
  }

  if (lower.includes('booking is confirmed') || lower.includes('payment authorized') || lower.includes('otp verified')) {
    const map: Record<string, string> = {
      kn: 'ಪಾವತಿ ಅನುಮೋದಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಏರೋವಿಂಗ್ಸ್ ವಿಮಾನ ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಇ-ಟಿಕೆಟ್ ಸಿದ್ಧವಾಗಿದೆ.',
      te: 'చెల్లింపు పూర్తయింది! మీ ఏరోవిಂಗ್స్ విమాన బుకింగ్ ధృవీకరించబడింది మరియు ఇ-టికెట్ సిద్ధంగా ఉంది.',
      ta: 'கட்டணம் செலுத்தப்பட்டது! உங்கள் ஏರೋவிங்ಸ್ விமான முன்பதிவு உறுதி செய்யப்பட்டது மற்றும் மின்-டிக்கெட் தயாராக உள்ளது.',
      hi: 'भुगतान सफल! आपकी एयरोविंग्स उड़ान बुकिंग की पुष्टि हो गई है और ई-टिकट तैयार है।',
      ml: 'പേയ്‌മെന്റ് വിജയകരം! നിങ്ങളുടെ എയ്റോവിങ്സ് ഫ്ലൈറ്റ് ബുക്കിംഗ് സ്ഥിരീകരിച്ചു.',
      mr: 'पेमेंट यशस्वी! आपली एरोविंग्स फ्लाईट बुकिंग पुष्टी झाली आहे आणि ई-तिकीट तयार आहे.',
      bn: 'পেমেন্ট সম্পন্ন! আপনার অ্যারোউইংস ফ্লাইট বুকিং নিশ্চিত হয়েছে এবং ই-টিকিট প্রস্তুত।',
      gu: 'ચુકવણી સફળ! તમારી એરોવિંગ્સ ફ્લાઇટ બુકિંગની પુષ્ટિ થઈ ગઈ છે.',
      fr: 'Paiement autorisé ! Votre réservation AeroWings est confirmée.',
      es: '¡Pago autorizado! Su reserva de vuelo está confirmada.',
      de: 'Zahlung autorisiert! Ihre Flugbuchung ist bestätigt.',
      ar: 'تم الدفع بنجاح! تم تأكيد حجز رحلتكم.'
    };
    return map[lang] || text;
  }

  return text;
}

class AIVoiceEngine {
  private isMutedState: boolean = false;
  private isSpeakingState: boolean = false;
  private currentTextState: string = '';
  private currentLanguageState: AiLanguageCode = 'en';
  private listeners: Set<VoiceListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('aerowings_ai_voice_muted');
        this.isMutedState = savedMute !== null ? savedMute === 'true' : true;
        const savedLang = localStorage.getItem('aerowings_ai_lang') as AiLanguageCode;
        if (savedLang) {
          this.currentLanguageState = savedLang;
        }
      } catch {
        this.isMutedState = true;
      }

      if ('speechSynthesis' in window) {
        const load = () => {
          this.availableVoices = window.speechSynthesis.getVoices() || [];
          if (this.availableVoices.length > 0) {
            this.voicesLoaded = true;
          }
        };

        window.speechSynthesis.onvoiceschanged = load;
        load();
      }
    }
  }

  private refreshVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.availableVoices = v;
        this.voicesLoaded = true;
      }
    }
  }

  public getLanguage(): AiLanguageCode {
    return this.currentLanguageState;
  }

  public setLanguage(lang: AiLanguageCode) {
    this.currentLanguageState = lang;
    try {
      localStorage.setItem('aerowings_ai_lang', lang);
    } catch {}
    this.notify();
  }

  public findVoiceForLanguage(langCode: AiLanguageCode): { voice: SpeechSynthesisVoice | null; isNativeVoice: boolean } {
    this.refreshVoices();

    const searchLocales = LANGUAGE_LOCALE_MAP[langCode] || ['en-US', 'en'];
    const twoLetterCode = langCode.toLowerCase().slice(0, 2);

    // 1. Direct match by exact lang tag or voice name
    for (const prefix of searchLocales) {
      const lowerPrefix = prefix.toLowerCase();
      const exactMatch = this.availableVoices.find(
        v => v.lang.toLowerCase() === lowerPrefix || v.name.toLowerCase().includes(lowerPrefix)
      );
      if (exactMatch) {
        return { voice: exactMatch, isNativeVoice: true };
      }
    }

    // 2. Match by 2-letter ISO language prefix on v.lang (e.g. "kn" in "kn-IN")
    const startsMatch = this.availableVoices.find(
      v => v.lang.toLowerCase().startsWith(twoLetterCode + '-') || v.lang.toLowerCase() === twoLetterCode
    );
    if (startsMatch) {
      return { voice: startsMatch, isNativeVoice: true };
    }

    // 3. If Indian language and no specific native voice found, look for any Indian voice (hi-IN or en-IN)
    if (['kn', 'te', 'ta', 'hi', 'ml', 'mr', 'bn', 'gu'].includes(langCode)) {
      const indianVoice = this.availableVoices.find(
        v => v.lang.toLowerCase().includes('-in') || v.lang.toLowerCase().includes('_in') || v.name.toLowerCase().includes('india')
      );
      if (indianVoice) {
        return { voice: indianVoice, isNativeVoice: false };
      }
    }

    // 4. Default to cleanest English voice
    const defaultVoice = this.availableVoices.find(v => v.lang.toLowerCase().startsWith('en')) || this.availableVoices[0] || null;
    return { voice: defaultVoice, isNativeVoice: false };
  }

  public subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeakingState,
      isMuted: this.isMutedState,
      currentText: this.currentTextState,
      language: this.currentLanguageState,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(l =>
      l({
        isSpeaking: this.isSpeakingState,
        isMuted: this.isMutedState,
        currentText: this.currentTextState,
        language: this.currentLanguageState,
      })
    );
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public setMuted(muted: boolean) {
    this.isMutedState = muted;
    try {
      localStorage.setItem('aerowings_ai_voice_muted', muted ? 'true' : 'false');
    } catch {}
    if (muted) {
      this.stop();
      this.currentTextState = '';
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMutedState);
    return this.isMutedState;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isSpeakingState = false;
    this.notify();
  }

  private speakViaBrowserSynthesis(
    text: string,
    lang: AiLanguageCode,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeakingState = false;
      this.notify();
      options?.onEnd?.();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const { voice, isNativeVoice } = this.findVoiceForLanguage(lang);
      const textToUtter = (lang === 'en' || isNativeVoice) ? text : toPhoneticPronunciation(text, lang);
      const utterance = new SpeechSynthesisUtterance(textToUtter);
      this.currentUtterance = utterance;

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = LANGUAGE_LOCALE_MAP[lang]?.[0] || 'en-US';
      }

      if (['kn', 'te', 'ta', 'ml'].includes(lang)) {
        utterance.rate = options?.rate ?? 0.92;
        utterance.pitch = options?.pitch ?? 1.02;
      } else if (['hi', 'mr', 'gu', 'bn'].includes(lang)) {
        utterance.rate = options?.rate ?? 0.95;
        utterance.pitch = options?.pitch ?? 1.0;
      } else {
        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
      }

      utterance.volume = 1.0;
      this.isSpeakingState = true;
      this.notify();

      utterance.onstart = () => {
        this.isSpeakingState = true;
        this.notify();
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        this.currentUtterance = null;
        this.notify();
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeakingState = false;
        this.currentUtterance = null;
        this.notify();
        options?.onEnd?.();
      };

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {}
      }, 40);
    } catch (err) {
      this.isSpeakingState = false;
      this.notify();
      options?.onEnd?.();
    }
  }

  public getLocalizedGreeting(langCode?: AiLanguageCode): string {
    const lang = langCode || this.currentLanguageState || 'en';
    const greetings: Record<string, string> = {
      en: 'Welcome to AeroWings Airlines! Multilingual website and AI voice assistant are now set to English.',
      hi: 'एरोविंग्स एयरलाइंस में आपका स्वागत है! वेबसाइट और वॉयस असिस्टेंट अब हिंदी में सक्रिय हैं।',
      kn: 'ಏರೋವಿಂಗ್ಸ್ ಏರ್‌ಲೈನ್ಸ್‌ಗೆ ಸ್ವಾಗತ! ವೆಬ್‌ಸೈಟ್ ಮತ್ತು ಧ್ವನಿ ಸಹಾಯಕ ಈಗ ಕನ್ನಡದಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ.',
      te: 'ఏరోవింగ్స్ ఎయిర్‌లైన్స్‌కు స్వాగతం! వెబ్‌సೈట్ మరియు వాయిస్ అసిస్టెంట్ ఇప్పుడు తెలుగులో అందుబాటులో ఉన్నాయి.',
      ta: 'ஏரோவிங்ஸ் ஏர்லைன்ஸுக்கு வரவேற்கிறோம்! இணையதளம் மற்றும் குரல் உதவியாளர் இப்போது தமிழில் செயல்படுகின்றன.',
      ml: 'എയറോവിംഗ്സ് എയർലൈൻസിലേക്ക് സ്വാഗതം! വെബ്സൈറ്റും വോയ്സ് അസിസ്റ്റന്റും ഇപ്പോൾ മലയാളത്തിലാണ്.',
      mr: 'एरोविंग्स एअरलाइन्समध्ये आपले स्वागत आहे! वेबसाईट आणि व्हॉइस असिस्टंट आता मराठीत सक्रिय आहेत.',
      bn: 'অ্যারোউইংস এয়ারলাইন্সে স্বাগতম! ওয়েবসাইট এবং ভয়েস অ্যাসিস্ট্যান্ট এখন বাংলায় সক্রিয়।',
      gu: 'એરોવિંગ્સ એરલાઇન્સમાં આપનું સ્વાગત છે! વેબસાઇટ અને વૉઇસ આસિસ્ટન્ટ હવે ગુજરાતીમાં સક્રિય છે.',
      es: '¡Bienvenido a AeroWings Airlines! El sitio web y el asistente de voz ahora están en español.',
      fr: 'Bienvenue chez AeroWings Airlines ! Le site web et l’assistant vocal sont désormais en français.'
    };
    return greetings[lang] || greetings.en;
  }

  public speak(
    rawText: string,
    optionsOrInterrupt?:
      | boolean
      | {
          lang?: AiLanguageCode;
          interrupt?: boolean;
          rate?: number;
          pitch?: number;
          onStart?: () => void;
          onEnd?: () => void;
        },
    optionalLang?: AiLanguageCode
  ) {
    const options =
      typeof optionsOrInterrupt === 'boolean'
        ? { interrupt: optionsOrInterrupt, lang: optionalLang }
        : optionsOrInterrupt;
    const lang = optionalLang || options?.lang || this.currentLanguageState || 'en';
    this.currentLanguageState = lang;
    const sanitized = sanitizeSpeechText(rawText);
    const text = localizeCommonAnnouncement(sanitized, lang);
    this.currentTextState = text;

    if (this.isMutedState || !text) {
      this.notify();
      return;
    }

    if (typeof window === 'undefined') {
      this.notify();
      return;
    }

    if (options?.interrupt !== false) {
      this.stop();
    }

    // For non-English regional languages (or when native voice is not installed in browser),
    // use our high-clarity /api/ai/tts stream first so Kannada, Telugu, Hindi, Tamil, etc. speak in authentic native voice!
    const { isNativeVoice } = this.findVoiceForLanguage(lang);
    const shouldUseCloudTts = lang !== 'en' || !isNativeVoice;

    if (shouldUseCloudTts && typeof Audio !== 'undefined') {
      try {
        const ttsUrl = `/api/ai/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text.slice(0, 200))}`;
        const audio = new Audio(ttsUrl);
        this.currentAudio = audio;
        this.isSpeakingState = true;
        this.notify();

        audio.onplay = () => {
          this.isSpeakingState = true;
          this.notify();
          options?.onStart?.();
        };

        audio.onended = () => {
          this.isSpeakingState = false;
          this.currentAudio = null;
          this.notify();
          options?.onEnd?.();
        };

        audio.onerror = () => {
          this.currentAudio = null;
          // Fallback to browser speech synthesis if cloud audio fails
          this.speakViaBrowserSynthesis(text, lang, options);
        };

        audio.play().catch(() => {
          this.currentAudio = null;
          this.speakViaBrowserSynthesis(text, lang, options);
        });
        return;
      } catch {
        // Fallback to browser speech synthesis
      }
    }

    this.speakViaBrowserSynthesis(text, lang, options);
  }

  // Real-Time API narration for booking workflow
  public async narrateBookingStep(params: {
    step: number;
    stepName: string;
    language?: AiLanguageCode;
    flight?: any;
    passengers?: any[];
    seat?: any;
    pnr?: string;
    totalAmount?: number;
    customPrompt?: string;
  }) {
    const lang = params.language || this.currentLanguageState || 'en';

    try {
      const res = await fetch('/api/ai/narrate-booking-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: params.step,
          stepName: params.stepName,
          language: lang,
          flight: params.flight,
          passengers: params.passengers,
          seat: params.seat,
          pnr: params.pnr,
          totalAmount: params.totalAmount,
          customPrompt: params.customPrompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.speechText) {
          this.speak(data.speechText, { lang });
          return data.speechText;
        }
      }
    } catch (err) {
      console.warn('[AI Voice] Fallback to client speech synthesis:', err);
    }

    // Local fallback if server API is unreachable
    this.speakLocalizedStep(params.step, params.stepName, lang);
  }

  public speakLocalizedStep(step: number, stepName: string, lang: AiLanguageCode = this.currentLanguageState) {
    const stepAnnouncements: Record<number, Record<AiLanguageCode, string>> = {
      1: {
        en: 'Step 1: Select your preferred flight and cabin class. 100% instant refund guarantee is active.',
        kn: 'ಹಂತ 1: ನಿಮ್ಮ ಆದ್ಯತೆಯ ವಿಮಾನ ಮತ್ತು ಕ್ಯಾಬಿನ್ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ. 100% ತಕ್ಷಣ ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
        te: 'దశ 1: మీ ప్రాధాన్య విమానాన్ని మరియు క్యాబిన్ క్లాస్‌ను ఎంచుకోండి. 100% తక్షణ రీఫండ్ రక్షణ కలదు.',
        ta: 'படி 1: உங்கள் விருப்பமான விமானம் மற்றும் வகுப்பைத் தேர்ந்தெடுக்கவும். 100% உடனடி பணத்தைத் திரும்பப் பெறும் வசதி உண்டு.',
        hi: 'चरण 1: अपनी पसंदीदा उड़ान और केबिन क्लास चुनें। 100% तत्काल रिफंड सुरक्षा उपलब्ध है।',
        ml: 'സ്റ്റെപ്പ് 1: നിങ്ങളുടെ ഫ്ലൈറ്റും ക്യാബിൻ ക്ലാസും തിരഞ്ഞെടുക്കുക.',
        mr: 'पायरी 1: आपली आवडती फ्लाईट आणि केबिन क्लास निवडा. 100% परतावा हमी लागू.',
        bn: 'ধাপ ১: আপনার পছন্দের ফ্লাইট এবং কেবিন ক্লাস নির্বাচন করুন।',
        gu: 'સ્ટેપ ૧: તમારી પસંદગીની ફ્લાઇટ અને ક્લાસ પસંદ કરો. ૧૦૦% રિફંડ ગેરંટી ઉપલબ્ધ છે.',
        fr: 'Étape 1: Choisissez votre vol et votre classe de cabine avec garantie de remboursement.',
        es: 'Paso 1: Elija su vuelo y clase de cabina con garantía de reembolso instantáneo.',
        ar: 'الخطوة 1: اختر رحلتك المفضلة ودرجة المقصورة مع ضمان استرداد الأموال بنسبة 100%.',
        de: 'Schritt 1: Wählen Sie Ihren Flug und Ihre Kabinenklasse mit 100% Rückerstattungsgarantie.',
      },
      2: {
        en: 'Step 2: Traveler details and government document verification. Please enter Aadhaar, PAN, or Passport.',
        kn: 'ಹಂತ 2: ಪ್ರಯಾಣಿಕರ ವಿವರಗಳು ಮತ್ತು ಆಧಾರ್ ಅಥವಾ ಪಾಸ್‌ಪೋರ್ಟ್ ದಾಖಲೆ ಪರಿಶೀಲನೆ.',
        te: 'దశ 2: ప్రయాణికుల వివరాలు మరియు ఆధార్ లేదా పాస్‌పోర్ట్ ధృవీకరణ.',
        ta: 'படி 2: பயணிகள் விவரங்கள் மற்றும் ஆதார் அல்லது பாஸ்போர்ட் சரிபார்ப்பு.',
        hi: 'चरण 2: यात्री विवरण और आधार या पासपोर्ट पहचान पत्र का सत्यापन करें।',
        ml: 'സ്റ്റെപ്പ് 2: യാത്രക്കാരുടെ വിവരങ്ങളും ആധാർ രേഖകളും നൽകുക.',
        mr: 'पायरी 2: प्रवासी माहिती आणि आधार/पासपोर्ट पडताळणी.',
        bn: 'ধাপ ২: যাত্রীদের বিবরণ এবং আধার বা পাসপোর্ট তথ্য দিন।',
        gu: 'સ્ટેપ ૨: મુસાફરોની વિગતો અને આધાર/પાસપોર્ટ ઓળખ ચકાસણી.',
        fr: 'Étape 2: Renseignez les coordonnées des passagers et la vérification des pièces d\'identité.',
        es: 'Paso 2: Ingrese los datos de los pasajeros y verificación de documentos oficiales.',
        ar: 'الخطوة 2: بيانات المسافرين والتحقق من وثائق الهوية وجواز السفر.',
        de: 'Schritt 2: Passagierdaten eingeben und Ausweisdokumente überprüfen.',
      },
      3: {
        en: 'Step 3: Cabin seat selection. Pick your favorite window or aisle seat with extra legroom.',
        kn: 'ಹಂತ 3: ಕ್ಯಾಬಿನ್ ಸೀಟ್ ಆಯ್ಕೆ. ನಿಮ್ಮ ನೆಚ್ಚಿನ ಕಿಟಕಿ ಅಥವಾ ಹಜಾರದ ಆಸನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
        te: 'దశ 3: క్యాబిన్ సీటు ఎంపిక. కిటికీ లేదా నడవ సీటును సులభంగా ఎంచుకోండి.',
        ta: 'படி 3: இருக்கை தேர்வு. உங்களுக்குப் பிடித்த சாளர அல்லது பாதை இருக்கையைத் தேர்ந்தெடுக்கவும்.',
        hi: 'चरण 3: सीट चयन। अपनी पसंदीदा खिड़की या गलियारे वाली सीट चुनें।',
        ml: 'സ്റ്റെപ്പ് 3: നിങ്ങളുടെ ഇരിപ്പിടം തിരഞ്ഞെടുക്കുക.',
        mr: 'पायरी 3: सीट निवड. विंडो किंवा आयल सीट निवडा.',
        bn: 'ধাপ ৩: আসন নির্বাচন করুন। আপনার পছন্দের উইন্ডো বা আইল আসন বেছে নিন।',
        gu: 'સ્ટેપ ૩: સીટ પસંદગી. તમારી મનપસંદ વિન્ડો અથવા આઇલ સીટ પસંદ કરો.',
        fr: 'Étape 3: Choix de vos sièges en cabine (hublot, couloir ou espace jambes).',
        es: 'Paso 3: Selección de asientos (ventana, pasillo o espacio adicional).',
        ar: 'الخطوة 3: اختيار المقاعد في المقصورة بجانب النافذة أو الممر.',
        de: 'Schritt 3: Sitzplatzwahl in der Kabine mit Fenster- oder Gangplatz.',
      },
      4: {
        en: 'Step 4: Baggage allowance and in-flight gourmet meals. 7 kg cabin and 15 kg check-in baggage are free.',
        kn: 'ಹಂತ 4: ಉಚಿತ ಲಗೇಜ್ ಮತ್ತು ಊಟದ ಆಯ್ಕೆ. 7 ಕೆಜಿ ಕ್ಯಾಬಿನ್ ಮತ್ತು 15 ಕೆಜಿ ಚೆಕ್-ಇನ್ ಬ್ಯಾಗೇಜ್ ಸಂಪೂರ್ಣ ಉಚಿತ.',
        te: 'దశ 4: ఉచిత లగేజీ మరియు భోజన ఎంపికలు. 7 కేజీల క్యాబిన్ మరియు 15 కేజీల చెక్-ఇన్ లగేజీ ఉచితం.',
        ta: 'படி 4: இலவச லக்கேஜ் மற்றும் உணவுத் தேர்வுகள். 7 கிலோ கேபின் மற்றும் 15 கிலோ செக்-இன் இலவசம்.',
        hi: 'चरण 4: सामान और भोजन चयन। 7 किग्रा केबिन और 15 किग्रा चेक-इन सामान मुफ्त शामिल है।',
        ml: 'സ്റ്റെപ്പ് 4: ലഗേജ്, ഭക്ഷണ തിരഞ്ഞെടുപ്പുകൾ. 7 കിലോഗ്രാം കാബിൻ, 15 കിലോഗ്രാം ചെക്ക്-ഇൻ സൗജന്യമാണ്.',
        mr: 'पायरी 4: सामान आणि जेवण पर्याय. 7 किलो केबिन आणि 15 किलो चेक-इन मोफत.',
        bn: 'ধাপ ৪: লাগেজ ও খাবার পছন্দ। ৭ কেজি কেবিন ও ১৫ কেজি চেক-ইন সম্পূর্ণ ফ্রি।',
        gu: 'સ્ટેપ ૪: બેગેજ અને ભોજન વિકલ્પો. ૭ કિલો કેબિન અને ૧૫ કિલો ચેક-ઇન ફ્રી છે.',
        fr: 'Étape 4: Bagages et repas à bord. 7 kg en cabine et 15 kg en soute inclus gratuitement.',
        es: 'Paso 4: Equipaje y comidas a bordo. 7 kg de cabina y 15 kg de bodega incluidos gratis.',
        ar: 'الخطوة 4: الأمتعة والوجبات على متن الطائرة. 7 كجم حقيبة يد و15 كجم شحن مجاناً.',
        de: 'Schritt 4: Freigepäck und Bordverpflegung. 7 kg Handgepäck und 15 kg Aufgabegepäck inklusive.',
      },
      5: {
        en: 'Step 5: Review itinerary and secure payment. AeroWings zero-fee 100% instant refund is active.',
        kn: 'ಹಂತ 5: ಪರಿಶೀಲನೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿ. 100% ತಕ್ಷಣ ಮರುಪಾವತಿ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ.',
        te: 'దశ 5: మీ ప్రయాణ సమీక్ష మరియు సురక్షిత చెల్లింపు. 100% తక్షణ రీఫండ్ పాలసీ కలదు.',
        ta: 'படி 5: மதிப்பாய்வு மற்றும் பாதுகாப்பான கட்டணம். 100% உடனடி பணத்தைத் திரும்பப் பெறுதல் பாதுகாப்பு.',
        hi: 'चरण 5: समीक्षा और सुरक्षित भुगतान। 100% त्वरित रिफंड सुरक्षा सक्रिय है।',
        ml: 'സ്റ്റെപ്പ് 5: അവലോകനവും സുരക്ഷിത പേയ്‌മെന്റും.',
        mr: 'पायरी 5: पुनरावलोकन आणि सुरक्षित देयक. 100% त्वरित परतावा संरक्षण.',
        bn: 'ধাপ ৫: বিবরণ পর্যালোচনা এবং নিরাপদ পেমেন্ট।',
        gu: 'સ્ટેપ ૫: સમીક્ષા અને સુરક્ષિત ચુકવણી. ૧૦૦% ત્વરિત રિફંડ સુરક્ષા.',
        fr: 'Étape 5: Récapitulatif et paiement sécurisé avec protection de remboursement à 100%.',
        es: 'Paso 5: Resumen y pago seguro con protección de reembolso total del 100%.',
        ar: 'الخطوة 5: مراجعة الرحلة والدفع الآمن مع حماية استرداد الأموال بنسبة 100%.',
        de: 'Schritt 5: Buchungsübersicht und sichere Zahlung mit 100% Sofort-Rückerstattungsschutz.',
      },
    };

    const text = stepAnnouncements[step]?.[lang] || stepAnnouncements[step]?.en || `Step ${step}`;
    this.speak(text, { lang });
  }

  // Multilingual announcements across all booking touchpoints
  public announceSearch(origin: string, dest: string, flightCount: number, weather: string, lang: AiLanguageCode = this.currentLanguageState) {
    if (lang === 'kn') {
      this.speak(
        `${origin} ನಿಂದ ${dest} ಗೆ ${flightCount} ವಿಮಾನಗಳು ಲಭ್ಯವಿವೆ. ಹವಾಮಾನವು ${weather} ಆಗಿದೆ. ಸುರಕ್ಷಿತ ಪ್ರಯಾಣಕ್ಕೆ ಏರೋವಿಂಗ್ಸ್ ಸ್ವಾಗತಿಸುತ್ತದೆ.`,
        { lang: 'kn' }
      );
    } else if (lang === 'te') {
      this.speak(
        `${origin} నుండి ${dest} కు ${flightCount} విమానాలు అందుబాటులో ఉన్నాయి. వాతావరణం ${weather} గా ఉంది. ఏರೋವಿಂಗ್ಸ್‌కు స్వాగతం.`,
        { lang: 'te' }
      );
    } else if (lang === 'ta') {
      this.speak(
        `${origin} லிருந்து ${dest} க்கு ${flightCount} விமானங்கள் கிடைக்கின்றன. வானிலை ${weather} ஆக உள்ளது. ஏரோவிங்ஸ் வரவேற்கிறது.`,
        { lang: 'ta' }
      );
    } else if (lang === 'hi') {
      this.speak(
        `${origin} से ${dest} के लिए ${flightCount} उड़ानें उपलब्ध हैं। मौसम ${weather} है। एयरोविंग्स में आपका स्वागत है।`,
        { lang: 'hi' }
      );
    } else if (lang === 'ml') {
      this.speak(
        `${origin} ൽ നിന്ന് ${dest} ലേക്ക് ${flightCount} ഫ്ലൈറ്റുകൾ ലഭ്യമാണ്. കാലാവസ്ഥ ${weather} ആണ്.`,
        { lang: 'ml' }
      );
    } else if (lang === 'mr') {
      this.speak(
        `${origin} ते ${dest} साठी ${flightCount} उड्डाणे उपलब्ध आहेत. हवामान ${weather} आहे.`,
        { lang: 'mr' }
      );
    } else if (lang === 'bn') {
      this.speak(
        `${origin} থেকে ${dest} এর জন্য ${flightCount} টি ফ্লাইট পাওয়া গেছে। আবহাওয়া ${weather}।`,
        { lang: 'bn' }
      );
    } else if (lang === 'gu') {
      this.speak(
        `${origin} થી ${dest} માટે ${flightCount} ફ્લાઇટ્સ ઉપલબ્ધ છે. હવામાન ${weather} છે.`,
        { lang: 'gu' }
      );
    } else if (lang === 'fr') {
      this.speak(
        `${flightCount} vols trouvés de ${origin} à ${dest}. Météo: ${weather}. Bienvenue sur AeroWings.`,
        { lang: 'fr' }
      );
    } else if (lang === 'es') {
      this.speak(
        `Se encontraron ${flightCount} vuelos de ${origin} a ${dest}. Clima: ${weather}.`,
        { lang: 'es' }
      );
    } else if (lang === 'ar') {
      this.speak(
        `تم العثور على ${flightCount} رحلة من ${origin} إلى ${dest}. حالة الطقس: ${weather}.`,
        { lang: 'ar' }
      );
    } else if (lang === 'de') {
      this.speak(
        `${flightCount} Flüge von ${origin} nach ${dest} gefunden. Wetter: ${weather}.`,
        { lang: 'de' }
      );
    } else {
      this.speak(
        `Found ${flightCount} flights from ${origin} to ${dest}. Route weather is ${weather}. AI weather auto-refund is active.`,
        { lang: 'en' }
      );
    }
  }

  public announceFlightSelected(
    airline: string,
    flightNumber: string,
    origin: string,
    dest: string,
    price?: number | string,
    weatherCondition?: string,
    lang: AiLanguageCode = this.currentLanguageState
  ) {
    if (lang === 'kn') {
      this.speak(
        `${airline} ವಿಮಾನ ${flightNumber} (${origin} ನಿಂದ ${dest}) ಆಯ್ಕೆಯಾಗಿದೆ. ಹಂತ 2: ಪ್ರಯಾಣಿಕರ ವಿವರಗಳಿಗೆ ಮುಂದುವರಿಯಿರಿ.`,
        { lang: 'kn' }
      );
    } else if (lang === 'te') {
      this.speak(
        `${airline} విమానం ${flightNumber} (${origin} నుండి ${dest}) ఎంపిక చేయబడింది. దశ 2: ప్రయాణికుల వివరాలకు వెళ్లండి.`,
        { lang: 'te' }
      );
    } else if (lang === 'ta') {
      this.speak(
        `${airline} விமானம் ${flightNumber} (${origin} லிருந்து ${dest}) தேர்ந்தெடுக்கப்பட்டது. படி 2: பயணிகள் விவரங்களுக்கு செல்லவும்.`,
        { lang: 'ta' }
      );
    } else if (lang === 'hi') {
      this.speak(
        `${airline} उड़ान ${flightNumber} (${origin} से ${dest}) का चयन हो गया है। चरण 2: यात्री विवरण की ओर बढ़ें।`,
        { lang: 'hi' }
      );
    } else {
      const weatherInfo = weatherCondition ? ` Weather is ${weatherCondition}.` : '';
      this.speak(`Selected ${airline} flight ${flightNumber} from ${origin} to ${dest}.${weatherInfo} Moving to passenger details.`, { lang: 'en' });
    }
  }

  public announcePassengerVerified(passengerIndex: number, name: string, lang: AiLanguageCode = this.currentLanguageState) {
    if (lang === 'kn') {
      this.speak(`ಪ್ರಯಾಣಿಕ ${passengerIndex} (${name}) ಅವರ ದಾಖಲೆಗಳು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.`, { lang: 'kn' });
    } else if (lang === 'te') {
      this.speak(`ప్రయాణీకుడు ${passengerIndex} (${name}) పత్రాలు విజయవంతంగా ధృవీకరించబడ్డాయి.`, { lang: 'te' });
    } else if (lang === 'ta') {
      this.speak(`பயணி ${passengerIndex} (${name}) ஆவணங்கள் வெற்றிகரமாக சரிபார்க்கப்பட்டன.`, { lang: 'ta' });
    } else if (lang === 'hi') {
      this.speak(`यात्री ${passengerIndex} (${name}) के पहचान दस्तावेज सत्यापित हो गए हैं।`, { lang: 'hi' });
    } else {
      this.speak(`Passenger ${passengerIndex} identity details verified successfully.`, { lang: 'en' });
    }
  }

  public announceSeatAssigned(seatNumber: string, seatTypeDescOrPax?: string, paxName?: string, lang: AiLanguageCode = this.currentLanguageState) {
    if (lang === 'kn') {
      this.speak(`ಆಸನ ಸಂಖ್ಯೆ ${seatNumber} ನಿಯೋಜಿಸಲಾಗಿದೆ.`, { lang: 'kn' });
    } else if (lang === 'te') {
      this.speak(`సీటు సంఖ్య ${seatNumber} కేటాయించబడింది.`, { lang: 'te' });
    } else if (lang === 'ta') {
      this.speak(`இருக்கை எண் ${seatNumber} ஒதுக்கப்பட்டது.`, { lang: 'ta' });
    } else if (lang === 'hi') {
      this.speak(`सीट संख्या ${seatNumber} आवंटित कर दी गई है।`, { lang: 'hi' });
    } else {
      const desc = seatTypeDescOrPax && !paxName ? ` to ${seatTypeDescOrPax}` : seatTypeDescOrPax ? ` (${seatTypeDescOrPax})` : '';
      const pax = paxName ? ` for ${paxName}` : '';
      this.speak(`Seat ${seatNumber}${desc} assigned${pax}.`, { lang: 'en' });
    }
  }

  public announceBookingConfirmed(pnr: string, passengerCount: number, flightNumber: string, lang: AiLanguageCode = this.currentLanguageState) {
    if (lang === 'kn') {
      this.speak(
        `ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಪಿಎನ್‌ಆರ್ ಕೋಡ್ ${pnr}. ವಿಮಾನ ಸಂಖ್ಯೆ ${flightNumber}. ಡಿಜಿಟಲ್ ಇ-ಟಿಕೆಟ್ ಸಿದ್ಧವಾಗಿದೆ.`,
        { lang: 'kn' }
      );
    } else if (lang === 'te') {
      this.speak(
        `బుకింగ్ ధృవీకరించబడింది! మీ పిఎన్‌ఆర్ కోడ్ ${pnr}. విమానం ${flightNumber}. డిజిటల్ ఇ-టికెట్ సిద్ధంగా ఉంది.`,
        { lang: 'te' }
      );
    } else if (lang === 'ta') {
      this.speak(
        `முன்பதிவு உறுதி செய்யப்பட்டது! உங்கள் பிஎன்ஆர் குறியீடு ${pnr}. விமானம் ${flightNumber}. மின்-டிக்கெட் தயாராக உள்ளது.`,
        { lang: 'ta' }
      );
    } else if (lang === 'hi') {
      this.speak(
        `बुकिंग की पुष्टि हो गई है! आपका पीएनआर कोड ${pnr} है। उड़ान संख्या ${flightNumber}। आपका डिजिटल ई-टिकट तैयार है।`,
        { lang: 'hi' }
      );
    } else {
      this.speak(
        `Booking confirmed! PNR code is ${pnr} for ${passengerCount} traveler on flight ${flightNumber}. E-ticket generated.`,
        { lang: 'en' }
      );
    }
  }

  public announceWeatherAutoCancellation(
    flightNumber: string,
    refundAmount: number,
    condition: string,
    airport: string,
    lang: AiLanguageCode = this.currentLanguageState
  ) {
    if (lang === 'kn') {
      this.speak(
        `ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ${airport} ನಲ್ಲಿ ${condition} ಕಾರಣದಿಂದ ವಿಮಾನ ${flightNumber} ರದ್ದುಗೊಂಡಿದೆ. ರೂಪಾಯಿ ${refundAmount} ಪೂರ್ಣ 100% ಮರುಪಾವತಿಯನ್ನು ತಕ್ಷಣ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ.`,
        { lang: 'kn', pitch: 1.05 }
      );
    } else if (lang === 'te') {
      this.speak(
        `వాతావరణ హెచ్చరిక: ${airport} వద్ద ${condition} కారణంగా ఫ్లైట్ ${flightNumber} రద్దు చేయబడింది. రూపాయలు ${refundAmount} పూర్తి రీఫండ్ ప్రారంభించబడింది.`,
        { lang: 'te', pitch: 1.05 }
      );
    } else if (lang === 'ta') {
      this.speak(
        `வானிலை எச்சரிக்கை: ${airport} இல் ${condition} காரணமாக விமானம் ${flightNumber} ரத்து செய்யப்பட்டது. ரூபாய் ${refundAmount} முழு பணத்தைத் திரும்பப் பெறப்பட்டுள்ளது.`,
        { lang: 'ta', pitch: 1.05 }
      );
    } else if (lang === 'hi') {
      this.speak(
        `मौसम चेतावनी: ${airport} पर ${condition} के कारण उड़ान ${flightNumber} रद्द कर दी गई है। ₹${refundAmount} का 100% पूरा रिफंड आपके खाते में जमा कर दिया गया है।`,
        { lang: 'hi', pitch: 1.05 }
      );
    } else {
      this.speak(
        `Weather Alert: Flight ${flightNumber} at ${airport} has been auto-cancelled due to ${condition}. AeroWings 100% full refund of ${refundAmount} rupees has been processed instantly.`,
        { lang: 'en', pitch: 1.05 }
      );
    }
  }

  public testPronunciation(lang: AiLanguageCode = this.currentLanguageState) {
    this.currentLanguageState = lang;
    if (lang === 'kn') {
      this.speak('ನಮಸ್ಕಾರ! ಏರೋವಿಂಗ್ಸ್ AI ಕನ್ನಡ ಧ್ವನಿ ಸಹಾಯಕ ಸಂಪೂರ್ಣ ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಮ್ಮ ವಿಮಾನ ಪ್ರಯಾಣ ಸುಖಕರವಾಗಿರಲಿ.', { lang: 'kn' });
    } else if (lang === 'te') {
      this.speak('నమస్కారం! ఏరోవింగ్స్ AI తెలుగు వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది. మీ విమాన ప్రయాణం శుభప్రదం కావాలని ఆశిస్తున్నాము.', { lang: 'te' });
    } else if (lang === 'ta') {
      this.speak('வணக்கம்! ஏரோவிங்ஸ் AI தமிழ் குரல் வழிகாட்டி தயாராக உள்ளது. உங்கள் விமான பயணம் இனிதாக அமைய வாழ்த்துகள்.', { lang: 'ta' });
    } else if (lang === 'hi') {
      this.speak('नमस्ते! एयरोविंग्स AI हिन्दी वॉइस असिस्टेंट पूरी तरह सक्रिय है। आपकी सुखद यात्रा की कामना करते हैं।', { lang: 'hi' });
    } else if (lang === 'ml') {
      this.speak('നമസ്കാരം! എയ്റോവിങ്സ് മലയാളം വോയ്സ് അസിസ്റ്റന്റ് സജ്ജമാണ്. ശുഭയാത്ര നേരുന്നു.', { lang: 'ml' });
    } else if (lang === 'mr') {
      this.speak('नमस्कार! एरोविंग्स मराठी व्हॉइस असिस्टंट सक्रिय आहे. आपला प्रवास सुखकर होवो.', { lang: 'mr' });
    } else if (lang === 'bn') {
      this.speak('নমস্কার! অ্যারোউইংস বাংলা ভয়েস অ্যাসিস্ট্যান্ট প্রস্তুত। আপনার যাত্রা শুভ হোক।', { lang: 'bn' });
    } else if (lang === 'gu') {
      this.speak('નમસ્તે! એરોવિંગ્સ ગુજરાતી વોઈસ આસિસ્ટન્ટ સક્રિય છે. તમારી યાત્રા મંગલમય રહે.', { lang: 'gu' });
    } else if (lang === 'fr') {
      this.speak('Bonjour! Bienvenue à bord d’AeroWings. Votre assistant vocal intelligent est actif.', { lang: 'fr' });
    } else if (lang === 'es') {
      this.speak('¡Hola! Bienvenido a bordo de AeroWings. Su asistente de voz inteligente está activo.', { lang: 'es' });
    } else if (lang === 'de') {
      this.speak('Guten Tag! Willkommen an Bord von AeroWings. Ihr intelligenter Sprachassistent ist aktiv.', { lang: 'de' });
    } else if (lang === 'ar') {
      this.speak('مرحباً بكم في إيرووينغز. مساعد الصوت الذكي جاهز لمساعدتكم.', { lang: 'ar' });
    } else {
      this.speak('Hello! AeroWings AI Multilingual Flight Copilot is active and ready to assist you.', { lang: 'en' });
    }
  }
}

export const aiVoice = new AIVoiceEngine();
