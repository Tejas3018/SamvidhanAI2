import { Game } from '@/types';

export const games: Game[] = [
  {
    id: 'courtroom-cross-examination',
    title: 'Courtroom Cross-Examination',
    description: 'Cross-examine witnesses, expose contradictions, and build constitutional arguments in court',
    icon: '🧑‍⚖️',
    difficulty: 'Hard',
    category: 'Role-Play',
    isAvailable: true
  },
  {
    id: 'voter-impact-simulator',
    title: 'Voter Impact Simulator',
    description: 'Design election policies and simulate their impact on democracy and voter groups',
    icon: '🗳️',
    difficulty: 'Hard',
    category: 'Simulation',
    isAvailable: true
  },
  {
    id: 'emergency-1975',
    title: 'Emergency Mode: 1975',
    description: 'Experience the 1975 Emergency through critical decisions that shape democracy',
    icon: '🚨',
    difficulty: 'Hard',
    category: 'Narrative',
    isAvailable: true
  },
  {
    id: 'escape-room',
    title: 'Constitution Escape Room',
    description: 'Solve constitutional puzzles to unlock doors and escape the room',
    icon: '🚪',
    difficulty: 'Hard',
    category: 'Puzzle',
    isAvailable: true
  },
  {
    id: 'rights-hotline',
    title: 'Rights Violation Hotline',
    description: 'Run a hotline, classify complaints, identify violations, and suggest legal remedies',
    icon: '📞',
    difficulty: 'Medium',
    category: 'Role-Play',
    isAvailable: true
  },
  {
    id: 'constitutional-courtroom',
    title: 'Constitutional Courtroom',
    description: 'Role-play as Judge, Petitioner or Respondent in constitutional disputes',
    icon: '⚖️',
    difficulty: 'Hard',
    category: 'Role-Play',
    isAvailable: true
  },
  {
    id: 'case-law-detective',
    title: 'Case Law Detective',
    description: 'Investigate famous cases, identify articles, and predict judgments',
    icon: '🔎',
    difficulty: 'Hard',
    category: 'Investigation',
    isAvailable: true
  },
  {
    id: 'ai-debate',
    title: 'AI vs You: Constitutional Debate',
    description: 'Challenge the AI in a constitutional debate and defend your stance',
    icon: '🤖',
    difficulty: 'Hard',
    category: 'Debate',
    isAvailable: true
  },
  {
    id: 'match-article',
    title: 'Match the Article',
    description: 'Match Constitutional articles with their correct rights or provisions',
    icon: '🎯',
    difficulty: 'Easy',
    category: 'Matching',
    isAvailable: true
  },
  {
    id: 'quiz-battle',
    title: 'Constitution Quiz Battle',
    description: 'Test your knowledge with rapid-fire questions against the clock',
    icon: '⚔️',
    difficulty: 'Medium',
    category: 'Quiz',
    isAvailable: true
  },
  {
    id: 'guess-article',
    title: 'Guess the Article',
    description: 'Read a description and identify which Article it refers to',
    icon: '🔍',
    difficulty: 'Medium',
    category: 'Guessing',
    isAvailable: true
  },
  {
    id: 'scenario-challenge',
    title: 'Scenario Challenge',
    description: 'Apply constitutional knowledge to real-life scenarios',
    icon: '🧩',
    difficulty: 'Hard',
    category: 'Application',
    isAvailable: true
  },
  {
    id: 'timeline-master',
    title: 'Amendment Timeline',
    description: 'Arrange important amendments in chronological order',
    icon: '📅',
    difficulty: 'Medium',
    category: 'Ordering',
    isAvailable: true
  },
  {
    id: 'word-scramble',
    title: 'Constitutional Word Scramble',
    description: 'Unscramble words related to the Constitution',
    icon: '🔤',
    difficulty: 'Easy',
    category: 'Word Game',
    isAvailable: true
  }
];

// Match the Article game data
export const matchArticleData = [
  { article: 'Article 14', right: 'Equality before Law' },
  { article: 'Article 17', right: 'Abolition of Untouchability' },
  { article: 'Article 19', right: 'Freedom of Speech' },
  { article: 'Article 21', right: 'Right to Life' },
  { article: 'Article 32', right: 'Constitutional Remedies' },
  { article: 'Article 44', right: 'Uniform Civil Code' },
  { article: 'Article 51A', right: 'Fundamental Duties' },
  { article: 'Article 368', right: 'Amendment Procedure' },
];

// Guess the Article game data
export const guessArticleData = [
  {
    description: 'This article ensures that no person shall be deprived of his life or personal liberty except according to procedure established by law.',
    answer: 'Article 21',
    hint: 'Right to Life and Personal Liberty'
  },
  {
    description: 'This article prohibits discrimination on grounds of religion, race, caste, sex, or place of birth.',
    answer: 'Article 15',
    hint: 'Part of Right to Equality'
  },
  {
    description: 'This article abolishes untouchability and forbids its practice in any form.',
    answer: 'Article 17',
    hint: 'Abolition of Untouchability'
  },
  {
    description: 'This article empowers the Supreme Court to issue writs for enforcement of Fundamental Rights.',
    answer: 'Article 32',
    hint: 'Called Heart and Soul of Constitution'
  },
  {
    description: 'This article contains the provisions for amendment of the Constitution.',
    answer: 'Article 368',
    hint: 'Located in Part XX'
  }
];

// Scenario Challenge data organized by levels
export const scenarioLevels = [
  {
    level: 1,
    name: 'Beginner',
    description: 'Basic constitutional rights scenarios',
    scenarios: [
      {
        scenario: 'A student is denied admission to a government college solely because of their caste. Which Fundamental Right is violated?',
        options: ['Right to Equality', 'Right to Freedom', 'Right against Exploitation', 'Cultural Rights'],
        correctAnswer: 0,
        explanation: 'This violates Article 15 which prohibits discrimination on grounds of caste.',
        relatedArticle: 'Article 15'
      },
      {
        scenario: 'A factory is employing children below 14 years of age. Which right is being violated?',
        options: ['Right to Equality', 'Right against Exploitation', 'Right to Freedom', 'Right to Education'],
        correctAnswer: 1,
        explanation: 'Article 24 prohibits employment of children below 14 years in factories, mines, or hazardous employment.',
        relatedArticle: 'Article 24'
      },
      {
        scenario: 'A person is arrested but not informed about the grounds of arrest. Which right is violated?',
        options: ['Article 19', 'Article 20', 'Article 21', 'Article 22'],
        correctAnswer: 3,
        explanation: 'Article 22(1) mandates that every person arrested must be informed of the grounds of arrest.',
        relatedArticle: 'Article 22'
      },
      {
        scenario: 'A school refuses to admit a 7-year-old child from a poor family. Which right is violated?',
        options: ['Right to Equality', 'Right to Education', 'Right to Freedom', 'Cultural Rights'],
        correctAnswer: 1,
        explanation: 'Article 21A guarantees free and compulsory education for children aged 6-14 years.',
        relatedArticle: 'Article 21A'
      },
      {
        scenario: 'A journalist is prevented from publishing a news article by the government. Which right is affected?',
        options: ['Right to Education', 'Right to Life', 'Freedom of Speech and Expression', 'Right to Property'],
        correctAnswer: 2,
        explanation: 'Article 19(1)(a) guarantees freedom of speech and expression, including freedom of press.',
        relatedArticle: 'Article 19'
      }
    ]
  },
  {
    level: 2,
    name: 'Intermediate',
    description: 'Workplace and social scenarios',
    scenarios: [
      {
        scenario: 'An employer pays different wages to male and female workers for the same work. Which provision is violated?',
        options: ['Article 14', 'Article 15', 'Article 16', 'Article 39(d)'],
        correctAnswer: 3,
        explanation: 'Article 39(d) directs the State to ensure equal pay for equal work for both men and women.',
        relatedArticle: 'Article 39(d)'
      },
      {
        scenario: 'A group of workers are forced to work without wages under threat of violence. Which right is violated?',
        options: ['Right to Freedom', 'Right against Exploitation', 'Right to Equality', 'Right to Life'],
        correctAnswer: 1,
        explanation: 'Article 23 prohibits traffic in human beings and forced labor (begar).',
        relatedArticle: 'Article 23'
      },
      {
        scenario: 'A private company refuses to hire someone because of their religion. Can the person seek remedy under Article 15?',
        options: ['Yes, Article 15 applies to private companies', 'No, Fundamental Rights apply only against State', 'Yes, if the company receives government funding', 'No, religious discrimination is not covered'],
        correctAnswer: 1,
        explanation: 'Fundamental Rights under Part III generally apply against State action, not private entities (with some exceptions).',
        relatedArticle: 'Article 12'
      },
      {
        scenario: 'A peaceful protest is being conducted by citizens. The police disperse them without any reason. Which right is violated?',
        options: ['Freedom of Speech', 'Right to Assemble Peacefully', 'Right to Life', 'Right to Property'],
        correctAnswer: 1,
        explanation: 'Article 19(1)(b) guarantees citizens the right to assemble peaceably and without arms.',
        relatedArticle: 'Article 19(1)(b)'
      },
      {
        scenario: 'A person is detained for 30 days without being produced before a magistrate. Which right is violated?',
        options: ['Article 20', 'Article 21', 'Article 22', 'Article 23'],
        correctAnswer: 2,
        explanation: 'Article 22(2) requires that an arrested person be produced before a magistrate within 24 hours.',
        relatedArticle: 'Article 22'
      }
    ]
  },
  {
    level: 3,
    name: 'Advanced',
    description: 'Complex legal scenarios',
    scenarios: [
      {
        scenario: 'A state government makes a law that contradicts a Central law on a subject in the Concurrent List. Which law prevails?',
        options: ['State law always prevails', 'Central law prevails', 'Both are void', 'Supreme Court decides'],
        correctAnswer: 1,
        explanation: 'Under Article 254, if there is a conflict between Central and State law on Concurrent List, Central law prevails.',
        relatedArticle: 'Article 254'
      },
      {
        scenario: 'The President wants to proclaim Emergency but the Cabinet has not advised. Can the President still declare Emergency?',
        options: ['Yes, President has absolute power', 'No, written advice from Cabinet is mandatory', 'Yes, with Parliament approval', 'No, only PM can declare'],
        correctAnswer: 1,
        explanation: 'After the 44th Amendment, Emergency can only be proclaimed on written advice from the Cabinet.',
        relatedArticle: 'Article 352'
      },
      {
        scenario: 'A law passed by Parliament is struck down by the Supreme Court. Parliament then passes a constitutional amendment to validate the law. Is this valid?',
        options: ['Always valid', 'Invalid if it violates Basic Structure', 'Valid with 2/3 majority', 'Invalid completely'],
        correctAnswer: 1,
        explanation: 'As per Kesavananda Bharati case, even constitutional amendments cannot violate the Basic Structure of the Constitution.',
        relatedArticle: 'Article 368'
      },
      {
        scenario: 'A person accused of a crime is compelled to give blood samples for DNA testing. Does this violate Article 20(3)?',
        options: ['Yes, it is self-incrimination', 'No, only testimonial compulsion is prohibited', 'Yes, bodily evidence cannot be taken', 'Depends on court order'],
        correctAnswer: 1,
        explanation: 'Article 20(3) protects against testimonial compulsion. Physical/medical evidence like blood samples are not covered.',
        relatedArticle: 'Article 20(3)'
      },
      {
        scenario: 'A religious institution wants to manage its own affairs. Can the State interfere?',
        options: ['Never, absolute religious freedom', 'Yes, for public order, morality, and health', 'Only with religious leaders consent', 'Only during emergency'],
        correctAnswer: 1,
        explanation: 'Article 25-26 allow religious freedom subject to public order, morality, and health.',
        relatedArticle: 'Article 25-26'
      }
    ]
  },
  {
    level: 4,
    name: 'Expert',
    description: 'Real court cases and landmark judgments',
    scenarios: [
      {
        scenario: 'Maneka Gandhi was denied a passport without being given reasons. The Supreme Court expanded which right in this case?',
        options: ['Right to Travel', 'Right to Life and Personal Liberty', 'Right to Information', 'Right to Property'],
        correctAnswer: 1,
        explanation: 'In Maneka Gandhi v. Union of India (1978), Article 21 was expanded to include the right to travel abroad.',
        relatedArticle: 'Article 21'
      },
      {
        scenario: 'In Vishaka v. State of Rajasthan, the Supreme Court laid down guidelines for preventing what at workplaces?',
        options: ['Child Labor', 'Sexual Harassment', 'Caste Discrimination', 'Religious Discrimination'],
        correctAnswer: 1,
        explanation: 'The Vishaka Guidelines (1997) were laid down to prevent sexual harassment at workplaces, derived from Article 21.',
        relatedArticle: 'Article 21'
      },
      {
        scenario: 'In Olga Tellis v. Bombay Municipal Corporation, the Supreme Court held that right to livelihood is part of which right?',
        options: ['Right to Work', 'Right to Equality', 'Right to Life', 'Right to Property'],
        correctAnswer: 2,
        explanation: 'The Court held that right to livelihood is an integral part of right to life under Article 21.',
        relatedArticle: 'Article 21'
      },
      {
        scenario: 'The Right to Privacy was declared a Fundamental Right in which landmark case?',
        options: ['Kesavananda Bharati Case', 'K.S. Puttaswamy Case', 'Golaknath Case', 'Minerva Mills Case'],
        correctAnswer: 1,
        explanation: 'In Justice K.S. Puttaswamy v. Union of India (2017), privacy was declared a fundamental right under Article 21.',
        relatedArticle: 'Article 21'
      },
      {
        scenario: 'The concept of "Creamy Layer" in reservations was introduced by which case?',
        options: ['Mandal Commission Case', 'Indra Sawhney Case', 'M. Nagaraj Case', 'Ashoka Kumar Thakur Case'],
        correctAnswer: 1,
        explanation: 'Indra Sawhney v. Union of India (1992) introduced the creamy layer concept to exclude affluent OBCs from reservation.',
        relatedArticle: 'Article 16(4)'
      }
    ]
  }
];

// Legacy export for backward compatibility
export const scenarioData = scenarioLevels[0].scenarios;
