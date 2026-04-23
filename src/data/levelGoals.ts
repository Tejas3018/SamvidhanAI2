import { LevelGoal } from '@/types/learning';

export interface RealLifeEvent {
  id: string;
  title: string;
  description: string;
  year?: number;
  relatedArticles: string[];
  levelId: number;
  icon: string;
}

export const levelGoals: LevelGoal[] = [
  {
    levelId: 1,
    goal: 'Understand the foundation and making of the Constitution',
    reward: 'Constitutional Pioneer Badge',
    badgeId: 'first-step',
    bonusXP: 50,
  },
  {
    levelId: 2,
    goal: 'Master all six Fundamental Rights',
    reward: 'Rights Defender Badge',
    badgeId: 'rights-champion',
    bonusXP: 75,
  },
  {
    levelId: 3,
    goal: 'Learn your duties as a citizen',
    reward: 'Responsible Citizen Badge',
    bonusXP: 60,
  },
  {
    levelId: 4,
    goal: 'Understand state policy guidelines',
    reward: 'Policy Scholar Badge',
    bonusXP: 65,
  },
  {
    levelId: 5,
    goal: 'Know how the Union Government works',
    reward: 'Governance Expert Badge',
    bonusXP: 80,
  },
  {
    levelId: 6,
    goal: 'Understand state-level governance',
    reward: 'State Affairs Badge',
    bonusXP: 70,
  },
  {
    levelId: 7,
    goal: 'Master the judicial system',
    reward: 'Justice Seeker Badge',
    bonusXP: 85,
  },
  {
    levelId: 8,
    goal: 'Understand constitutional amendments',
    reward: 'Constitution Scholar Badge',
    badgeId: 'constitution-scholar',
    bonusXP: 100,
  },
];

export const realLifeEvents: RealLifeEvent[] = [
  // Level 1 - Constitution Making
  {
    id: 'independence-1947',
    title: 'Independence & Constitution Making (1947-1950)',
    description: 'After independence, the Constituent Assembly worked for nearly 3 years to draft the Constitution.',
    year: 1950,
    relatedArticles: ['Preamble', 'Article 1'],
    levelId: 1,
    icon: '🇮🇳',
  },
  {
    id: 'kesavananda-bharati',
    title: 'Kesavananda Bharati Case (1973)',
    description: 'Established the "Basic Structure Doctrine" - Parliament cannot alter fundamental features of Constitution.',
    year: 1973,
    relatedArticles: ['Article 368'],
    levelId: 1,
    icon: '⚖️',
  },

  // Level 2 - Fundamental Rights
  {
    id: 'emergency-1975',
    title: 'Emergency Period (1975-1977)',
    description: 'Fundamental rights were suspended during the Emergency. Article 21 could not be enforced.',
    year: 1975,
    relatedArticles: ['Article 21', 'Article 352'],
    levelId: 2,
    icon: '🚨',
  },
  {
    id: 'internet-shutdowns',
    title: 'Internet Shutdowns Debate',
    description: 'Supreme Court ruled that internet access is part of the Right to Freedom of Expression (Article 19).',
    year: 2020,
    relatedArticles: ['Article 19', 'Article 21'],
    levelId: 2,
    icon: '🌐',
  },
  {
    id: 'aadhaar-case',
    title: 'Aadhaar & Right to Privacy (2017)',
    description: 'Supreme Court declared Right to Privacy as a fundamental right under Article 21.',
    year: 2017,
    relatedArticles: ['Article 21'],
    levelId: 2,
    icon: '🔒',
  },

  // Level 3 - Fundamental Duties
  {
    id: 'swachh-bharat',
    title: 'Swachh Bharat Mission',
    description: 'Based on Article 51A(g) - duty to protect and improve the natural environment.',
    year: 2014,
    relatedArticles: ['Article 51A(g)'],
    levelId: 3,
    icon: '🧹',
  },
  {
    id: 'rte-act',
    title: 'Right to Education Act (2009)',
    description: 'Enforces Article 51A(k) - duty of parents to provide education to children.',
    year: 2009,
    relatedArticles: ['Article 51A(k)', 'Article 21A'],
    levelId: 3,
    icon: '📚',
  },

  // Level 4 - DPSP
  {
    id: 'mgnrega',
    title: 'MGNREGA (Right to Work)',
    description: 'Implements DPSP provisions on right to work and livelihood.',
    year: 2005,
    relatedArticles: ['Article 41', 'Article 43'],
    levelId: 4,
    icon: '👷',
  },
  {
    id: 'uniform-civil-code',
    title: 'Uniform Civil Code Debate',
    description: 'Article 44 directs state to implement UCC - a continuing constitutional debate.',
    relatedArticles: ['Article 44'],
    levelId: 4,
    icon: '📜',
  },

  // Level 5 - Union Government
  {
    id: 'president-rule',
    title: "President's Rule in States",
    description: 'Article 356 has been invoked 100+ times since 1951 to dismiss state governments.',
    relatedArticles: ['Article 356'],
    levelId: 5,
    icon: '🏛️',
  },
  {
    id: 'money-bill-controversy',
    title: 'Money Bill Controversies',
    description: 'Aadhaar and other bills passed as Money Bills to bypass Rajya Sabha, sparking debates.',
    year: 2016,
    relatedArticles: ['Article 110'],
    levelId: 5,
    icon: '💰',
  },

  // Level 6 - State Government
  {
    id: 'floor-tests',
    title: 'Political Floor Tests',
    description: 'Several state governments have been tested through floor tests to prove majority.',
    relatedArticles: ['Article 164'],
    levelId: 6,
    icon: '🗳️',
  },
  {
    id: 'governor-discretion',
    title: "Governor's Discretionary Powers",
    description: 'Multiple cases where governors delayed bills or acted against state government advice.',
    relatedArticles: ['Article 163', 'Article 200'],
    levelId: 6,
    icon: '👔',
  },

  // Level 7 - Judiciary
  {
    id: 'collegium-system',
    title: 'Collegium System for Judges',
    description: 'Supreme Court judges are appointed through the collegium system, not executive.',
    year: 1993,
    relatedArticles: ['Article 124', 'Article 217'],
    levelId: 7,
    icon: '⚖️',
  },
  {
    id: 'sabrimala-case',
    title: 'Sabarimala Temple Case',
    description: 'Supreme Court allowed women of all ages to enter the temple (Right to Worship).',
    year: 2018,
    relatedArticles: ['Article 25', 'Article 14'],
    levelId: 7,
    icon: '🛕',
  },
  {
    id: 'section-377',
    title: 'Section 377 Verdict',
    description: 'SC decriminalized homosexuality as it violated right to privacy and dignity.',
    year: 2018,
    relatedArticles: ['Article 21', 'Article 14'],
    levelId: 7,
    icon: '🏳️‍🌈',
  },

  // Level 8 - Amendments
  {
    id: 'gst-amendment',
    title: 'GST Amendment (101st)',
    description: 'One of the biggest tax reforms in India - unified indirect tax system.',
    year: 2016,
    relatedArticles: ['Article 246A'],
    levelId: 8,
    icon: '💵',
  },
  {
    id: 'ews-reservation',
    title: 'EWS Reservation (103rd)',
    description: '10% reservation for economically weaker sections in general category.',
    year: 2019,
    relatedArticles: ['Article 15(6)', 'Article 16(6)'],
    levelId: 8,
    icon: '📊',
  },
  {
    id: 'article-370',
    title: 'Article 370 Abrogation',
    description: 'Special status of Jammu & Kashmir was revoked in 2019.',
    year: 2019,
    relatedArticles: ['Article 370', 'Article 35A'],
    levelId: 8,
    icon: '🗺️',
  },
];

export const getLevelGoal = (levelId: number): LevelGoal | undefined => {
  return levelGoals.find(g => g.levelId === levelId);
};

export const getRealLifeEventsForLevel = (levelId: number): RealLifeEvent[] => {
  return realLifeEvents.filter(e => e.levelId === levelId);
};
