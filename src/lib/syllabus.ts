// Compact UPSC syllabus taxonomy used by the Final Checker for coverage scoring.
export type SyllabusSection = {
  key: string;
  label: string;
  micro_topics: string[];
};

export const UPSC_SYLLABUS: SyllabusSection[] = [
  {
    key: "prelims",
    label: "Prelims (GS + CSAT)",
    micro_topics: [
      "History of India & Indian National Movement",
      "Indian & World Geography",
      "Indian Polity & Governance",
      "Economic & Social Development",
      "Environment, Ecology, Biodiversity, Climate Change",
      "General Science",
      "Current Affairs (national & international)",
      "CSAT — Comprehension, Reasoning, Quantitative Aptitude",
    ],
  },
  {
    key: "gs1",
    label: "GS Paper I",
    micro_topics: [
      "Indian Heritage & Culture",
      "Modern Indian History (1750–present)",
      "Post-independence Consolidation",
      "World History (Industrial Revolution, World Wars, Decolonisation)",
      "Indian Society & Diversity",
      "Role of Women, Population, Poverty, Urbanisation",
      "Physical Geography",
      "Resource Distribution & Industrial Location",
      "Geophysical Phenomena (earthquakes, cyclones)",
    ],
  },
  {
    key: "gs2",
    label: "GS Paper II",
    micro_topics: [
      "Indian Constitution — features, amendments, basic structure",
      "Union & State Executive, Parliament, Judiciary",
      "Federalism & Centre–State Relations",
      "Constitutional & Statutory Bodies",
      "Governance, Transparency, RTI, e-Governance",
      "Welfare Schemes & Vulnerable Sections",
      "Health, Education, Human Resources",
      "International Relations — India & Neighbourhood, Bilateral, Global Groupings",
    ],
  },
  {
    key: "gs3",
    label: "GS Paper III",
    micro_topics: [
      "Indian Economy — growth, development, employment",
      "Agriculture, Food Security, PDS",
      "Infrastructure — energy, transport, ports",
      "Science & Technology, IT, Space, Biotech",
      "Environment, Conservation, EIA",
      "Disaster Management",
      "Internal Security — extremism, cyber, borders",
      "Money laundering & Organised Crime",
    ],
  },
  {
    key: "gs4",
    label: "GS Paper IV (Ethics)",
    micro_topics: [
      "Ethics & Human Interface",
      "Attitude, Aptitude, Emotional Intelligence",
      "Moral Thinkers — Indian & Western",
      "Public/Civil Service Values",
      "Probity in Governance",
      "Case Studies application",
    ],
  },
  {
    key: "essay",
    label: "Essay",
    micro_topics: [
      "Philosophical themes",
      "Socio-economic themes",
      "Polity & governance themes",
      "Science, technology & society",
      "Environment & sustainability",
      "International affairs & India's role",
    ],
  },
  {
    key: "current_affairs",
    label: "Current Affairs Integration",
    micro_topics: [
      "Government schemes & programmes",
      "Recent Supreme Court judgements",
      "Reports & indices (NITI Aayog, UN, World Bank)",
      "Bilateral & multilateral developments",
      "Economic survey & budget highlights",
      "Major committees & their recommendations",
    ],
  },
];

export const SYLLABUS_PROMPT_DIGEST = UPSC_SYLLABUS.map(
  (s) => `${s.key} | ${s.label}: ${s.micro_topics.join("; ")}`,
).join("\n");
