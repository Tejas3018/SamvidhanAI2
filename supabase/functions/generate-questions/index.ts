import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Level topics mapping for generating relevant questions
const levelTopics: Record<number, { title: string; topics: string[] }> = {
  1: {
    title: "Introduction to the Constitution",
    topics: [
      "History of the Constitution",
      "Constituent Assembly and its key members like Dr. B.R. Ambedkar",
      "Preamble of India and its key words like Justice, Liberty, Equality, Fraternity",
      "Basic Structure Doctrine established by Kesavananda Bharati case"
    ]
  },
  2: {
    title: "Fundamental Rights",
    topics: [
      "Right to Equality (Articles 14-18)",
      "Right to Freedom (Articles 19-22)",
      "Right against Exploitation (Articles 23-24)",
      "Right to Freedom of Religion (Articles 25-28)",
      "Cultural & Educational Rights (Articles 29-30)",
      "Right to Constitutional Remedies (Article 32)"
    ]
  },
  3: {
    title: "Fundamental Duties",
    topics: [
      "Article 51A and its 11 fundamental duties",
      "Duties towards Nation like respecting national symbols",
      "Duties towards Society like promoting harmony",
      "Environmental duties",
      "Scientific temper and spirit of inquiry"
    ]
  },
  4: {
    title: "Directive Principles of State Policy",
    topics: [
      "Socialist Principles (Articles 38, 39, 41-43)",
      "Gandhian Principles (Articles 40, 43, 46-48)",
      "Liberal-Intellectual Principles (Articles 44-45, 48A, 49-51)",
      "Difference between DPSP and Fundamental Rights"
    ]
  },
  5: {
    title: "Union Government",
    topics: [
      "President of India - election, powers, impeachment",
      "Parliament - Lok Sabha and Rajya Sabha composition and powers",
      "Prime Minister and Council of Ministers",
      "Legislative procedures and types of bills"
    ]
  },
  6: {
    title: "State Government",
    topics: [
      "Governor - appointment, powers, discretionary powers",
      "State Legislature - composition and functioning",
      "Chief Minister and State Council of Ministers",
      "Centre-State relations"
    ]
  },
  7: {
    title: "Judiciary",
    topics: [
      "Supreme Court - composition, jurisdiction, appointment of judges",
      "High Courts - powers and jurisdiction",
      "Subordinate Courts structure",
      "Judicial Review and its importance",
      "Public Interest Litigation (PIL)"
    ]
  },
  8: {
    title: "Amendments and Evolution",
    topics: [
      "Amendment Process under Article 368",
      "Key Amendments like 42nd, 44th, 73rd, 74th amendments",
      "Landmark Constitutional cases",
      "Evolution of the Constitution over time"
    ]
  }
};

// Simple in-memory rate limiting (per IP, resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per window
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional authentication - log user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await supabaseClient.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        // Auth failed, but allow anonymous access
      }
    }
    
    console.log(`Generate Questions request from ${userId ? `user ${userId}` : `anonymous (${clientIP})`}`);

    const { type, level, levelId, count = 5, topic, difficulty, includeScenarios = false } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAIAPIKEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating ${count} ${type} questions for level: ${level || levelId}, difficulty: ${difficulty || 'normal'}`);

    let systemPrompt = '';
    let userPrompt = '';

    // Difficulty adjustment
    const difficultyGuide = {
      easy: 'Focus on basic factual questions. Include hints in the question. Use simple language. Avoid complex scenarios.',
      normal: 'Mix of factual and application-based questions. Standard difficulty.',
      hard: 'Focus on scenario-based questions requiring analysis. Include complex situations. Test deep understanding and legal reasoning.',
    };

    const difficultyLevel = difficulty || 'normal';

    if (type === 'level') {
      // Level-specific questions based on topics
      const levelInfo = levelTopics[levelId] || levelTopics[1];
      
      // Calculate scenario percentage based on difficulty
      const scenarioPercent = includeScenarios ? (difficultyLevel === 'hard' ? 50 : difficultyLevel === 'easy' ? 20 : 35) : 0;
      
      systemPrompt = `You are an expert on the Indian Constitution. Generate educational multiple choice questions specifically about the topics covered in "${levelInfo.title}". Questions should be clear, educational, and test understanding of the specific constitutional concepts.`;
      
      userPrompt = `Generate ${count} unique MCQ questions about the Indian Constitution specifically covering these topics:

Level: ${levelInfo.title}
Topics to cover:
${levelInfo.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Difficulty: ${difficultyLevel.toUpperCase()}
${difficultyGuide[difficultyLevel as keyof typeof difficultyGuide]}

${scenarioPercent > 0 ? `IMPORTANT: At least ${Math.round(count * scenarioPercent / 100)} questions should be SCENARIO-BASED (presenting a real-life situation where constitutional knowledge is needed, like "A person is arrested and denied a lawyer. Which right is violated?").` : ''}

Requirements:
- Questions should ONLY be about the listed topics
- Follow the difficulty guidelines strictly
- Make questions educational and test real understanding
- Include questions about specific article numbers where relevant

For each question, provide:
1. A clear, well-formed question (or a scenario followed by a question)
2. Four answer options (one correct, three plausible but incorrect)
3. The index of the correct answer (0-3)
4. A helpful explanation of why the answer is correct
5. Article reference if applicable
6. "isScenario": true/false to indicate if it's a scenario-based question

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Who is known as the Father of the Indian Constitution?",
    "options": ["Jawaharlal Nehru", "Mahatma Gandhi", "Dr. B.R. Ambedkar", "Sardar Patel"],
    "correctAnswer": 2,
    "explanation": "Dr. B.R. Ambedkar was the Chairman of the Drafting Committee and is widely regarded as the chief architect of the Indian Constitution.",
    "articleReference": "Constituent Assembly",
    "isScenario": false
  }
]`;
    } else if (type === 'scenario') {
      systemPrompt = `You are an expert on the Indian Constitution. Generate scenario-based multiple choice questions that test practical understanding of constitutional rights, duties, and provisions. Each scenario should present a real-life situation where constitutional knowledge is needed.`;
      
      const levelDescriptions: Record<string, string> = {
        'beginner': 'Basic scenarios about fundamental rights like freedom of speech, right to education, equality before law',
        'intermediate': 'More nuanced scenarios involving directive principles, fundamental duties, and citizenship rights',
        'advanced': 'Complex scenarios involving constitutional remedies, emergency provisions, and judicial powers',
        'expert': 'Highly complex scenarios involving constitutional amendments, federalism, and inter-state relations'
      };
      
      userPrompt = `Generate ${count} unique scenario-based MCQ questions about the Indian Constitution at the ${level} level. 
      
Level focus: ${levelDescriptions[level] || levelDescriptions['beginner']}

For each question, provide:
1. A realistic scenario (2-3 sentences describing a situation)
2. Four answer options (one correct, three plausible but incorrect)
3. The index of the correct answer (0-3)
4. An explanation of why the answer is correct
5. The related constitutional article or provision

Return ONLY a valid JSON array with this exact structure:
[
  {
    "scenario": "A college student is denied admission solely because of their caste. The student believes this violates their rights.",
    "options": ["File a complaint with local police", "Approach the High Court under Article 226", "Write to the President", "Accept the decision"],
    "correctAnswer": 1,
    "explanation": "Under Article 15, discrimination on grounds of caste is prohibited. The student can approach the High Court under Article 226 for enforcement of fundamental rights.",
    "relatedArticle": "Article 15 - Prohibition of discrimination"
  }
]`;
    } else if (type === 'quiz') {
      systemPrompt = `You are an expert on the Indian Constitution. Generate educational multiple choice questions that test knowledge of constitutional articles, amendments, and provisions.`;
      
      userPrompt = `Generate ${count} unique MCQ questions about the Indian Constitution for a general quiz.

Questions should cover:
- Fundamental Rights (Part III)
- Directive Principles (Part IV)
- Fundamental Duties (Part IVA)
- Constitutional amendments
- Key constitutional provisions

Difficulty: ${difficultyLevel.toUpperCase()}
${difficultyGuide[difficultyLevel as keyof typeof difficultyGuide]}

For each question, provide:
1. A clear question
2. Four answer options (one correct, three plausible but incorrect)
3. The index of the correct answer (0-3)
4. An explanation of the correct answer
5. Article reference if applicable

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Which article of the Indian Constitution abolishes untouchability?",
    "options": ["Article 14", "Article 15", "Article 17", "Article 19"],
    "correctAnswer": 2,
    "explanation": "Article 17 of the Indian Constitution abolishes untouchability and forbids its practice in any form.",
    "articleReference": "Article 17"
  }
]`;
    } else if (type === 'micro-check') {
      // Single quick question for video micro-checks
      const levelInfo = levelTopics[levelId] || levelTopics[1];
      
      systemPrompt = `You are an expert on the Indian Constitution. Generate a single quick-check question to test understanding of a specific topic. The question should be straightforward but educational.`;
      
      userPrompt = `Generate 1 simple MCQ question about this topic: "${topic || levelInfo.topics[0]}"

Requirements:
- Make it simple and quick to answer
- Should take less than 30 seconds to answer
- Focus on one key concept
- Include a helpful explanation

Return ONLY a valid JSON array with exactly one question:
[
  {
    "question": "Which article guarantees the right to equality?",
    "options": ["Article 12", "Article 14", "Article 16", "Article 18"],
    "correctAnswer": 1,
    "explanation": "Article 14 guarantees equality before law and equal protection of laws to all persons in India.",
    "articleReference": "Article 14"
  }
]`;
    } else if (type === 'revision') {
      // Short revision quiz (3-5 questions) focusing on core concepts
      const levelInfo = levelTopics[levelId] || levelTopics[1];
      
      systemPrompt = `You are an expert on the Indian Constitution. Generate a short revision quiz focusing on the most important concepts from a specific level. Questions should reinforce core learning.`;
      
      userPrompt = `Generate ${count || 5} revision MCQ questions about the core concepts from "${levelInfo.title}".

Focus topics:
${levelInfo.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Requirements:
- Focus on the MOST IMPORTANT concepts
- Questions should be clear and reinforce learning
- Mix of recall and understanding questions
- Include article numbers where relevant

Return ONLY a valid JSON array:
[
  {
    "question": "The correct question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Clear explanation of the answer.",
    "articleReference": "Article X"
  }
]`;
    } else if (type === 'weak-areas') {
      // Questions specifically for practicing weak areas
      systemPrompt = `You are an expert on the Indian Constitution. Generate questions specifically about weak topics the user needs to practice. Focus on building understanding from multiple angles.`;
      
      userPrompt = `Generate ${count} MCQ questions specifically about this topic/article: "${topic}"

Requirements:
- Focus ONLY on this specific topic
- Approach the topic from different angles
- Build understanding progressively
- Include clear explanations
- Vary the difficulty slightly

Return ONLY a valid JSON array:
[
  {
    "question": "The correct question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Clear explanation of the answer.",
    "articleReference": "Article X"
  }
]`;
    } else {
      throw new Error('Invalid question type');
    }

    console.log('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content;
    
    // Parse the JSON from the response
    let questions;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse questions:', parseError, 'Content:', content);
      throw new Error('Failed to parse generated questions');
    }

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
