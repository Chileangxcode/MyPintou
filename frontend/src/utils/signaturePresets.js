/**
 * Realistic E-Signatures and Official Cambodian University Stamp Presets
 * Generates transparent high-resolution SVG Data URIs for instant preview & printing.
 */

// Helper to convert SVG string to base64 data URI
function svgToDataUri(svgString) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svgString);
}

/**
 * Authentic Circular Red Cambodian University Seal / Stamp SVG
 */
export const DEFAULT_OFFICIAL_STAMP = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Outer stamp border with slight vintage texture -->
  <circle cx="100" cy="100" r="92" fill="none" stroke="#dc2626" stroke-width="4.5" stroke-dasharray="120 1 80 1" opacity="0.92" />
  <circle cx="100" cy="100" r="85" fill="none" stroke="#dc2626" stroke-width="1.8" opacity="0.88" />
  <circle cx="100" cy="100" r="60" fill="none" stroke="#dc2626" stroke-width="2.5" opacity="0.9" />

  <!-- Circular path for Top Khmer Text -->
  <def>
    <path id="topArc" d="M 22 100 A 78 78 0 0 1 178 100" fill="none" />
    <path id="bottomArc" d="M 178 100 A 78 78 0 0 1 22 100" fill="none" />
  </def>

  <!-- Top Curved Text: National University / Cambodia -->
  <text fill="#dc2626" font-size="10" font-family="'Kantumruy Pro', 'Battambang', sans-serif" font-weight="bold" letter-spacing="1">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">
      ★ ព្រះរាជាណាចក្រកម្ពុជា ★
    </textPath>
  </text>

  <!-- Bottom Curved Text -->
  <text fill="#dc2626" font-size="9" font-family="'Montserrat', sans-serif" font-weight="bold" letter-spacing="1.5">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
      ★ OFFICIAL UNIVERSITY SEAL ★
    </textPath>
  </text>

  <!-- Center Emblem: 5-Pointed Star and Official Stamp Text -->
  <g transform="translate(100, 100)" text-anchor="middle" fill="#dc2626">
    <!-- Star -->
    <path d="M 0,-34 L 4,-20 L 18,-20 L 7,-11 L 11,3 L 0,-6 L -11,3 L -7,-11 L -18,-20 L -4,-20 Z" opacity="0.85" />

    <!-- Center Khmer Text -->
    <text y="-2" font-size="12" font-family="'Kantumruy Pro', 'Battambang', sans-serif" font-weight="bold">ត្រាផ្លូវការ</text>
    <text y="14" font-size="8.5" font-family="'Montserrat', sans-serif" font-weight="bold" letter-spacing="1">ACADEMIC</text>
    <text y="24" font-size="7.5" font-family="'Montserrat', sans-serif" font-weight="bold" letter-spacing="1.5">REGISTRAR</text>
  </g>

  <!-- Star accents -->
  <circle cx="27" cy="100" r="2.5" fill="#dc2626" />
  <circle cx="173" cy="100" r="2.5" fill="#dc2626" />
</svg>
`);

/**
 * Rector / Dean Elegant Fountain Pen Signature SVG
 */
export const DEFAULT_RECTOR_SIGNATURE = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 90" width="260" height="90">
  <path d="M 25 55 Q 35 15, 52 28 Q 70 42, 60 70 Q 55 80, 80 45 Q 98 22, 110 50 Q 120 72, 135 48 T 160 52 Q 175 35, 195 55 Q 210 68, 235 40" 
        fill="none" stroke="#1e3a8a" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.92" />
  <path d="M 45 42 Q 95 38, 145 46 Q 190 52, 240 38" 
        fill="none" stroke="#1e3a8a" stroke-width="2.2" stroke-linecap="round" opacity="0.88" />
  <!-- Underline Flourish -->
  <path d="M 30 75 Q 85 70, 150 72 Q 210 74, 245 68" 
        fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
  <path d="M 215 68 Q 235 66, 250 62" 
        fill="none" stroke="#1e3a8a" stroke-width="1.8" stroke-linecap="round" opacity="0.75" />
</svg>
`);

/**
 * Lecturer / Professor Cursive Signature SVG
 */
export const DEFAULT_LECTURER_SIGNATURE = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 90" width="250" height="90">
  <path d="M 20 60 Q 40 18, 62 35 Q 75 48, 85 30 Q 98 12, 115 42 Q 125 60, 140 40 Q 155 20, 170 52 Q 182 72, 205 38 T 235 45" 
        fill="none" stroke="#0f172a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
  <!-- Flourish loop -->
  <path d="M 48 45 Q 85 28, 130 35 Q 175 42, 220 32" 
        fill="none" stroke="#0f172a" stroke-width="1.9" stroke-linecap="round" opacity="0.8" />
  <path d="M 25 72 Q 90 68, 160 70 Q 210 71, 238 65" 
        fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" opacity="0.85" />
</svg>
`);

const KHMER_NUMERALS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

export function toKhmerDigits(num) {
  return String(num).replace(/\d/g, (d) => KHMER_NUMERALS[Number(d)] || d);
}

/**
 * Formats a JS Date into authentic Khmer date format:
 * ថ្ងៃទី ២៣ ខែតុលា ឆ្នាំ២០២៦
 */
export function formatKhmerDate(date = new Date()) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = toKhmerDigits(d.getDate());
  const month = KHMER_MONTHS[d.getMonth()];
  const year = toKhmerDigits(d.getFullYear());
  return `ថ្ងៃទី ${day} ខែ${month} ឆ្នាំ${year}`;
}
