import { Level } from '@/types';

export const levels: Level[] = [
  {
    id: 1,
    title: "Introduction to the Constitution",
    description: "Learn about the making of India's Constitution and its basic structure",
    icon: "📜",
    topics: [
      "History of the Constitution",
      "Constituent Assembly",
      "Preamble of India",
      "Basic Structure Doctrine"
    ],
    videos: [
      { id: "LkbV3FRAP-I", title: "Making of Indian Constitution - Complete History", duration: "18:42" },
      { id: "7CkD52k9H4s", title: "Constituent Assembly & Dr. B.R. Ambedkar", duration: "15:30" },
      { id: "Q7BEZkgVWvU", title: "Preamble of India - Every Word Explained", duration: "12:15" }
    ],
    xpReward: 100,
    isUnlocked: true,
    isCompleted: false,
    progress: 0
  },
  {
    id: 2,
    title: "Fundamental Rights",
    description: "Explore the six fundamental rights guaranteed to every Indian citizen",
    icon: "⚖️",
    topics: [
      "Right to Equality (Art. 14-18)",
      "Right to Freedom (Art. 19-22)",
      "Right against Exploitation (Art. 23-24)",
      "Right to Freedom of Religion (Art. 25-28)",
      "Cultural & Educational Rights (Art. 29-30)",
      "Right to Constitutional Remedies (Art. 32)"
    ],
    videos: [
      { id: "M7XYHs8wdcc", title: "Fundamental Rights - Complete Overview", duration: "25:18" },
      { id: "aTc0cV9saXA", title: "Right to Equality & Freedom Explained", duration: "18:45" },
      { id: "MvY-dQY13jE", title: "Article 32 - Right to Constitutional Remedies", duration: "14:20" }
    ],
    xpReward: 150,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 3,
    title: "Fundamental Duties",
    description: "Understand the 11 duties every citizen must follow",
    icon: "🤝",
    topics: [
      "Article 51A Overview",
      "Duties towards Nation",
      "Duties towards Society",
      "Environmental Duties",
      "Scientific Temper"
    ],
    videos: [
      { id: "XFm7NcbNQz4", title: "11 Fundamental Duties - Article 51A", duration: "16:30" },
      { id: "8R_I3cVk6n4", title: "Duties of Indian Citizens Explained", duration: "12:45" }
    ],
    xpReward: 120,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 4,
    title: "Directive Principles",
    description: "Learn about the guidelines for governance and policy-making",
    icon: "🎯",
    topics: [
      "Socialist Principles",
      "Gandhian Principles",
      "Liberal-Intellectual Principles",
      "DPSP vs Fundamental Rights"
    ],
    videos: [
      { id: "7oVrpGgHqvg", title: "Directive Principles of State Policy - DPSP", duration: "22:15" },
      { id: "o_Ay_iDRAbc", title: "DPSP vs Fundamental Rights - Key Differences", duration: "14:30" }
    ],
    xpReward: 130,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 5,
    title: "Union Government",
    description: "Explore the structure and powers of the Central Government",
    icon: "🏛️",
    topics: [
      "President of India",
      "Parliament - Lok Sabha & Rajya Sabha",
      "Prime Minister & Council of Ministers",
      "Union Executive Powers"
    ],
    videos: [
      { id: "2-Y4Lz22Tao", title: "President of India - Powers & Election", duration: "20:45" },
      { id: "N6iPfRHu8B8", title: "Indian Parliament - Lok Sabha & Rajya Sabha", duration: "28:30" },
      { id: "pRWD1DL_Sfc", title: "Prime Minister & Cabinet Ministers", duration: "18:15" }
    ],
    xpReward: 160,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 6,
    title: "State Government",
    description: "Understand how state governments function in India",
    icon: "🏢",
    topics: [
      "Governor",
      "State Legislature",
      "Chief Minister",
      "State Executive"
    ],
    videos: [
      { id: "fxYT0GMsFvM", title: "Governor - Role & Powers Explained", duration: "16:20" },
      { id: "OBqfvNLilfA", title: "State Legislature & Chief Minister", duration: "19:45" }
    ],
    xpReward: 140,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 7,
    title: "Judiciary",
    description: "Discover India's independent judicial system",
    icon: "⚖️",
    topics: [
      "Supreme Court",
      "High Courts",
      "Subordinate Courts",
      "Judicial Review",
      "PIL - Public Interest Litigation"
    ],
    videos: [
      { id: "e4G1KllNxzk", title: "Supreme Court of India - Complete Guide", duration: "24:30" },
      { id: "0FxDSx9p1FM", title: "Indian Judiciary System Explained", duration: "20:15" },
      { id: "g1T6mCrVNcg", title: "Public Interest Litigation (PIL)", duration: "14:45" }
    ],
    xpReward: 170,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  },
  {
    id: 8,
    title: "Amendments & Evolution",
    description: "Learn how the Constitution changes and evolves",
    icon: "📝",
    topics: [
      "Amendment Process (Art. 368)",
      "Key Amendments",
      "Landmark Cases",
      "Constitutional Evolution"
    ],
    videos: [
      { id: "L3vE_VGMRCE", title: "Constitutional Amendments - Article 368", duration: "18:40" },
      { id: "9C_n3Hpjm3k", title: "Important Amendments in Indian Constitution", duration: "22:30" }
    ],
    xpReward: 180,
    isUnlocked: false,
    isCompleted: false,
    progress: 0
  }
];

export const badges = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first level',
    icon: '🎯',
    isEarned: false
  },
  {
    id: 'rights-champion',
    name: 'Rights Champion',
    description: 'Master Fundamental Rights',
    icon: '🏆',
    isEarned: false
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    description: 'Score 100% on any quiz',
    icon: '⭐',
    isEarned: false
  },
  {
    id: 'constitution-scholar',
    name: 'Constitution Scholar',
    description: 'Complete all levels',
    icon: '🎓',
    isEarned: false
  },
  {
    id: 'curious-mind',
    name: 'Curious Mind',
    description: 'Ask 10 questions to the AI',
    icon: '🧠',
    isEarned: false
  },
  {
    id: 'game-champion',
    name: 'Game Champion',
    description: 'Win 5 games',
    icon: '🎮',
    isEarned: false
  }
];
