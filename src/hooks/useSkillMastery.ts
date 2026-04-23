import { useState, useEffect, useCallback } from 'react';
import { SkillMastery } from '@/types/learning';

const SKILL_MASTERY_KEY = 'samvidhan_skill_mastery';

type SkillType = 'articles' | 'amendments' | 'cases' | 'reasoning' | 'scenarios';

const defaultSkills: SkillMastery[] = [
  { skill: 'articles', level: 0, questionsAttempted: 0, correctAnswers: 0, lastUpdated: new Date().toISOString() },
  { skill: 'amendments', level: 0, questionsAttempted: 0, correctAnswers: 0, lastUpdated: new Date().toISOString() },
  { skill: 'cases', level: 0, questionsAttempted: 0, correctAnswers: 0, lastUpdated: new Date().toISOString() },
  { skill: 'reasoning', level: 0, questionsAttempted: 0, correctAnswers: 0, lastUpdated: new Date().toISOString() },
  { skill: 'scenarios', level: 0, questionsAttempted: 0, correctAnswers: 0, lastUpdated: new Date().toISOString() },
];

export function useSkillMastery() {
  const [skills, setSkills] = useState<SkillMastery[]>(defaultSkills);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SKILL_MASTERY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all skills exist
        const merged = defaultSkills.map(def => {
          const found = parsed.find((s: SkillMastery) => s.skill === def.skill);
          return found || def;
        });
        setSkills(merged);
      } catch {
        setSkills(defaultSkills);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SKILL_MASTERY_KEY, JSON.stringify(skills));
    }
  }, [skills, isLoaded]);

  const recordSkillAttempt = useCallback((skillType: SkillType, isCorrect: boolean) => {
    setSkills(prev =>
      prev.map(s => {
        if (s.skill !== skillType) return s;
        
        const newAttempted = s.questionsAttempted + 1;
        const newCorrect = isCorrect ? s.correctAnswers + 1 : s.correctAnswers;
        const newLevel = Math.round((newCorrect / newAttempted) * 100);
        
        return {
          ...s,
          questionsAttempted: newAttempted,
          correctAnswers: newCorrect,
          level: newLevel,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  }, []);

  const getSkillLevel = useCallback((skillType: SkillType) => {
    const skill = skills.find(s => s.skill === skillType);
    return skill?.level || 0;
  }, [skills]);

  const getSkillStats = useCallback((skillType: SkillType) => {
    return skills.find(s => s.skill === skillType);
  }, [skills]);

  const getOverallMastery = useCallback(() => {
    const totalAttempted = skills.reduce((sum, s) => sum + s.questionsAttempted, 0);
    const totalCorrect = skills.reduce((sum, s) => sum + s.correctAnswers, 0);
    if (totalAttempted === 0) return 0;
    return Math.round((totalCorrect / totalAttempted) * 100);
  }, [skills]);

  const getWeakestSkills = useCallback((limit: number = 2) => {
    return [...skills]
      .filter(s => s.questionsAttempted > 0)
      .sort((a, b) => a.level - b.level)
      .slice(0, limit);
  }, [skills]);

  const getStrongestSkills = useCallback((limit: number = 2) => {
    return [...skills]
      .filter(s => s.questionsAttempted > 0)
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
  }, [skills]);

  return {
    skills,
    isLoaded,
    recordSkillAttempt,
    getSkillLevel,
    getSkillStats,
    getOverallMastery,
    getWeakestSkills,
    getStrongestSkills,
  };
}
