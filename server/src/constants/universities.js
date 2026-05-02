// Bangladesh university list — used for student email domain validation
export const UNIVERSITIES = [
  // ── TOP PRIVATE (Dhaka) ──────────────────────────────
  {
    id: "nsu",
    name: "North South University (NSU)",
    domain: "northsouth.edu",
    city: "Dhaka",
  },
  {
    id: "bracu",
    name: "BRAC University (BRACU)",
    domain: "g.bracu.ac.bd",
    city: "Dhaka",
  },
  {
    id: "aiub",
    name: "American International University (AIUB)",
    domain: "aiub.edu",
    city: "Dhaka",
  },
  {
    id: "iub",
    name: "Independent University Bangladesh (IUB)",
    domain: "iub.edu.bd",
    city: "Dhaka",
  },
  {
    id: "uiu",
    name: "United International University (UIU)",
    domain: "uiu.ac.bd",
    city: "Dhaka",
  },
  {
    id: "ewu",
    name: "East West University (EWU)",
    domain: "ewubd.edu",
    city: "Dhaka",
  },
  {
    id: "aust",
    name: "Ahsanullah University of Science & Tech",
    domain: "aust.edu",
    city: "Dhaka",
  },
  {
    id: "diu",
    name: "Daffodil International University (DIU)",
    domain: "diu.edu.bd",
    city: "Dhaka",
  },
  {
    id: "seu",
    name: "Southeast University (SEU)",
    domain: "seu.edu.bd",
    city: "Dhaka",
  },
  {
    id: "stamford",
    name: "Stamford University Bangladesh",
    domain: "stamforduniversity.edu.bd",
    city: "Dhaka",
  },
  {
    id: "bup",
    name: "Bangladesh University of Professionals",
    domain: "bup.edu.bd",
    city: "Dhaka",
  },
  {
    id: "iut",
    name: "Islamic University of Technology (IUT)",
    domain: "iut-dhaka.edu",
    city: "Gazipur",
  },

  // ── PUBLIC UNIVERSITIES ───────────────────────────────
  {
    id: "du",
    name: "University of Dhaka (DU)",
    domain: "du.ac.bd",
    city: "Dhaka",
  },
  {
    id: "buet",
    name: "Bangladesh Univ of Eng & Tech (BUET)",
    domain: "buet.ac.bd",
    city: "Dhaka",
  },
  {
    id: "ju",
    name: "Jahangirnagar University (JU)",
    domain: "juniv.edu",
    city: "Dhaka",
  },
  {
    id: "bau",
    name: "Bangladesh Agricultural University (BAU)",
    domain: "bau.edu.bd",
    city: "Mymensingh",
  },
  {
    id: "sust",
    name: "Shahjalal Univ of Sci & Tech (SUST)",
    domain: "sust.edu",
    city: "Sylhet",
  },
  {
    id: "ru",
    name: "University of Rajshahi (RU)",
    domain: "ru.ac.bd",
    city: "Rajshahi",
  },
  {
    id: "cu",
    name: "University of Chittagong (CU)",
    domain: "cu.ac.bd",
    city: "Chittagong",
  },
  {
    id: "ku",
    name: "Khulna University (KU)",
    domain: "ku.ac.bd",
    city: "Khulna",
  },
  {
    id: "ruet",
    name: "Rajshahi Univ of Eng & Tech (RUET)",
    domain: "ruet.ac.bd",
    city: "Rajshahi",
  },
  {
    id: "cuet",
    name: "Chittagong Univ of Eng & Tech (CUET)",
    domain: "cuet.ac.bd",
    city: "Chittagong",
  },
  {
    id: "kuet",
    name: "Khulna Univ of Eng & Tech (KUET)",
    domain: "kuet.ac.bd",
    city: "Khulna",
  },
  {
    id: "pust",
    name: "Pabna University of Sci & Tech (PUST)",
    domain: "pust.ac.bd",
    city: "Pabna",
  },
  {
    id: "brur",
    name: "Begum Rokeya University (BRUR)",
    domain: "brur.ac.bd",
    city: "Rangpur",
  },
  {
    id: "nstu",
    name: "Noakhali Science & Tech University (NSTU)",
    domain: "nstu.edu.bd",
    city: "Noakhali",
  },
  {
    id: "just",
    name: "Jessore University of Sci & Tech (JUST)",
    domain: "just.edu.bd",
    city: "Jessore",
  },
];

// All valid student email domains
export const STUDENT_EMAIL_DOMAINS = UNIVERSITIES.map((u) => u.domain);

// Get university by domain
export const getUniversityByDomain = (domain) =>
  UNIVERSITIES.find((u) => u.domain === domain);

// Get university by id
export const getUniversityById = (id) => UNIVERSITIES.find((u) => u.id === id);
