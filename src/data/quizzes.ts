import { QuizQuestion } from '@/types';

export const quizzesByLevel: { [levelId: number]: QuizQuestion[] } = {
  1: [
    {
      id: '1-1',
      question: 'When was the Constitution of India adopted?',
      options: ['26th January 1950', '26th November 1949', '15th August 1947', '26th January 1949'],
      correctAnswer: 1,
      explanation: 'The Constitution was adopted on 26th November 1949, and came into effect on 26th January 1950.',
      articleReference: 'Historical Context'
    },
    {
      id: '1-2',
      question: 'Who is known as the "Father of the Indian Constitution"?',
      options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Dr. B.R. Ambedkar', 'Sardar Patel'],
      correctAnswer: 2,
      explanation: 'Dr. B.R. Ambedkar was the Chairman of the Drafting Committee and is called the Father of the Indian Constitution.',
      articleReference: 'Constituent Assembly'
    },
    {
      id: '1-3',
      question: 'How many members were in the Constituent Assembly initially?',
      options: ['299', '389', '284', '300'],
      correctAnswer: 1,
      explanation: 'The Constituent Assembly initially had 389 members, which later reduced to 299 after partition.',
      articleReference: 'Constituent Assembly'
    },
    {
      id: '1-4',
      question: 'The word "Secular" was added to the Preamble by which Amendment?',
      options: ['42nd Amendment', '44th Amendment', '1st Amendment', '52nd Amendment'],
      correctAnswer: 0,
      explanation: 'The 42nd Amendment (1976) added the words "Socialist", "Secular", and "Integrity" to the Preamble.',
      articleReference: 'Preamble'
    },
    {
      id: '1-5',
      question: 'Which part of the Constitution contains the Preamble?',
      options: ['Part I', 'Part II', 'It is not a part', 'Part III'],
      correctAnswer: 2,
      explanation: 'The Preamble is not a part of the Constitution but serves as an introduction to it.',
      articleReference: 'Preamble'
    }
  ],
  2: [
    {
      id: '2-1',
      question: 'Right to Equality is guaranteed under which Articles?',
      options: ['Articles 14-18', 'Articles 19-22', 'Articles 23-24', 'Articles 25-28'],
      correctAnswer: 0,
      explanation: 'Articles 14 to 18 deal with the Right to Equality, including equality before law and prohibition of discrimination.',
      articleReference: 'Articles 14-18'
    },
    {
      id: '2-2',
      question: 'Which Fundamental Right is called the "Heart and Soul" of the Constitution?',
      options: ['Right to Equality', 'Right to Freedom', 'Right to Constitutional Remedies', 'Right to Education'],
      correctAnswer: 2,
      explanation: 'Dr. Ambedkar called Article 32 (Right to Constitutional Remedies) the heart and soul of the Constitution.',
      articleReference: 'Article 32'
    },
    {
      id: '2-3',
      question: 'Right to Property is now a:',
      options: ['Fundamental Right', 'Legal Right', 'Directive Principle', 'Fundamental Duty'],
      correctAnswer: 1,
      explanation: 'Right to Property was removed from Fundamental Rights by the 44th Amendment and made a legal right under Article 300A.',
      articleReference: 'Article 300A'
    },
    {
      id: '2-4',
      question: 'Which Article prohibits untouchability?',
      options: ['Article 14', 'Article 15', 'Article 17', 'Article 18'],
      correctAnswer: 2,
      explanation: 'Article 17 abolishes untouchability and forbids its practice in any form.',
      articleReference: 'Article 17'
    },
    {
      id: '2-5',
      question: 'Protection against arbitrary arrest is provided under:',
      options: ['Article 19', 'Article 20', 'Article 21', 'Article 22'],
      correctAnswer: 3,
      explanation: 'Article 22 provides protection against arrest and detention in certain cases.',
      articleReference: 'Article 22'
    }
  ],
  3: [
    {
      id: '3-1',
      question: 'Fundamental Duties were added by which Amendment?',
      options: ['42nd Amendment', '44th Amendment', '52nd Amendment', '73rd Amendment'],
      correctAnswer: 0,
      explanation: 'The 42nd Amendment (1976) added Fundamental Duties under Article 51A.',
      articleReference: 'Article 51A'
    },
    {
      id: '3-2',
      question: 'How many Fundamental Duties are there currently?',
      options: ['10', '11', '12', '9'],
      correctAnswer: 1,
      explanation: 'There are 11 Fundamental Duties. The 11th duty (to provide education) was added by the 86th Amendment.',
      articleReference: 'Article 51A'
    },
    {
      id: '3-3',
      question: 'Fundamental Duties are taken from which country\'s Constitution?',
      options: ['USA', 'UK', 'USSR', 'France'],
      correctAnswer: 2,
      explanation: 'Fundamental Duties were inspired by the Constitution of the former USSR.',
      articleReference: 'Article 51A'
    },
    {
      id: '3-4',
      question: 'Which Fundamental Duty relates to protecting the environment?',
      options: ['Duty (g)', 'Duty (h)', 'Duty (i)', 'Duty (j)'],
      correctAnswer: 0,
      explanation: 'Article 51A(g) states the duty to protect and improve the natural environment.',
      articleReference: 'Article 51A(g)'
    },
    {
      id: '3-5',
      question: 'Are Fundamental Duties enforceable by courts?',
      options: ['Yes, directly', 'No, they are not justiciable', 'Only by Supreme Court', 'Only during Emergency'],
      correctAnswer: 1,
      explanation: 'Fundamental Duties are not directly enforceable by courts, unlike Fundamental Rights.',
      articleReference: 'Article 51A'
    }
  ]
};

export const getQuizForLevel = (levelId: number): QuizQuestion[] => {
  return quizzesByLevel[levelId] || [];
};
