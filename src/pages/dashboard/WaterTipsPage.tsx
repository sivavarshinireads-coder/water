import React, { useEffect, useState } from 'react';
import { Lightbulb, Info, Sparkles, ChevronRight, ThumbsUp, Activity, Check, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { getUserSummary } from '../../api/auth';
import {
  PageLayout, DashboardHero, HeroBadge, LoadingState, SectionHeader
} from '../../components/ui';
import Card from '../../components/ui/Card';
import {
  waterSavingHabits,
  waterFacts,
  getConservationTier,
  ConservationTierInfo
} from '../../utils/waterTipsData';

const WaterTipsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Stateful habit tracker state, persists in localStorage
  const [checkedHabits, setCheckedHabits] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('aquatrack_checked_habits');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Fact index state
  const [factIndex, setFactIndex] = useState(0);
  const [fadeFact, setFadeFact] = useState(true);

  useEffect(() => {
    getUserSummary()
      .then(setData)
      .catch(() => setError('Failed to load usage data for recommendations.'))
      .finally(() => setLoading(false));
  }, []);

  // Save habits state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aquatrack_checked_habits', JSON.stringify(checkedHabits));
    } catch (e) {
      console.error('Failed to save habits checklist', e);
    }
  }, [checkedHabits]);

  const toggleHabit = (id: string) => {
    setCheckedHabits(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNextFact = () => {
    setFadeFact(false);
    setTimeout(() => {
      setFactIndex(prev => (prev + 1) % waterFacts.length);
      setFadeFact(true);
    }, 200);
  };

  if (loading) return <LoadingState message="Analyzing consumption patterns..." />;
  if (error) return <div className="error-center">{error}</div>;

  // Extract usage data to determine the tier
  let myUsage = 0;
  let avgUsage = 3000; // default average from API

  if (data?.monthlyUsage && data.monthlyUsage.length > 0) {
    // Current month is the last element
    const latestMonth = data.monthlyUsage[data.monthlyUsage.length - 1];
    myUsage = latestMonth.usage || 0;
  }

  if (data?.apartmentComparison && data.apartmentComparison.length > 0) {
    const latestComp = data.apartmentComparison[data.apartmentComparison.length - 1];
    if (latestComp.avgUsage) {
      avgUsage = latestComp.avgUsage;
    }
  }

  // Calculate conservation tier details
  const tier: ConservationTierInfo = getConservationTier(myUsage, avgUsage);

  // Calculate total saved water today
  const totalSaved = waterSavingHabits.reduce((acc, habit) => {
    if (checkedHabits[habit.id]) {
      return acc + habit.savings;
    }
    return acc;
  }, 0);

  // Gauge circular mathematics
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * tier.score) / 100;

  // Target goal (e.g. 150 liters saved max)
  const savingsTarget = 150;
  const liquidHeightPercentage = Math.min(100, (totalSaved / savingsTarget) * 100);

  return (
    <PageLayout>
      <DashboardHero
        title="Water Conservation Portal"
        subtitle="Dynamic water saving actions, personalized dashboard metrics, and community conservation benchmarks."
        badges={
          <>
            <HeroBadge><Lightbulb size={14} className="text-amber-500" /> Usage: {myUsage} L</HeroBadge>
            <HeroBadge><Activity size={14} /> Building Avg: {avgUsage} L</HeroBadge>
            <HeroBadge><Sparkles size={14} /> Level: {tier.name}</HeroBadge>
          </>
        }
      />

      <div className="ui-grid ui-grid--2" style={{ marginBottom: 24 }}>
        {/* Eco-Score standing card */}
        <Card padding="lg" className="eco-standing-card">
          <div className="flex-row-between" style={{ marginBottom: 16 }}>
            <h3 className="ui-panel-title" style={{ margin: 0 }}>
              <TrendingUp size={18} /> Your Conservation Standing
            </h3>
            <span className={`eco-badge ${tier.badgeClass}`}>
              {tier.name}
            </span>
          </div>

          <div className="ui-grid ui-grid--2" style={{ gap: 20, alignItems: 'center' }}>
            <div className="eco-score-circle">
              <svg className="eco-score-svg">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={tier.name.includes('High') ? '#f59e0b' : '#0d9488'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <span className="eco-score-value">{tier.score}</span>
              <span className="eco-score-label">Eco-Score</span>
            </div>

            <div>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginBottom: '8px' }}>
                Your performance grade:
              </p>
              <h4 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--brand-600)', margin: '0 0 10px 0', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                {tier.grade}
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate-500)' }}>/ A+ Max</span>
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--slate-700)', lineHeight: '1.5', fontWeight: 500 }}>
                {tier.feedback}
              </p>
            </div>
          </div>
        </Card>

        {/* Dynamic Habit Tracker Liquid Wave */}
        <Card padding="lg">
          <h3 className="ui-panel-title" style={{ marginBottom: 16 }}>
            <Activity size={18} /> Habit Savings Tracker
          </h3>
          <div className="ui-grid ui-grid--2" style={{ gap: 20, alignItems: 'center' }}>
            <div className="liquid-wave-container">
              <div
                className="liquid-wave"
                style={{ height: `${liquidHeightPercentage}%` }}
              />
              <div className="liquid-text">
                <span className={`liquid-number ${liquidHeightPercentage >= 50 ? 'light-text' : ''}`}>
                  {totalSaved}
                </span>
                <div className={`liquid-unit ${liquidHeightPercentage >= 50 ? 'light-text' : ''}`}>
                  L Saved
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-800)', marginBottom: 8 }}>
                Daily Conservation Challenge
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: '1.5', marginBottom: 12 }}>
                Complete water-saving routines to fill up the savings reservoir! Target: <b>150 Liters</b>.
              </p>
              {totalSaved > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-700)', fontSize: '12px', fontWeight: 600, background: 'var(--green-50)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--green-200)' }}>
                  <CheckCircle2 size={16} /> Saving {totalSaved}L of water today!
                </div>
              ) : (
                <div style={{ color: 'var(--slate-500)', fontSize: '12px', fontStyle: 'italic' }}>
                  No challenges selected yet. Start marking habits below!
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <SectionHeader
        title="Personalized Recommendations"
        description={`Tailored actions built specifically for your current usage tier (${tier.name})`}
      />

      {/* Grid of Dynamic tips based on user tier */}
      <div className="water-tips-grid">
        {tier.tips.map((tip, idx) => (
          <div className="water-tip-card" key={idx}>
            <div className="water-tip-header">
              <h4 className="water-tip-title">{tip.title}</h4>
              <span className="water-tip-savings">{tip.savings}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: '1.5', flex: 1 }}>
              {tip.description}
            </p>
            <div className="flex-row-between" style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--slate-400)', fontWeight: 600 }}>DIFFICULTY</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: tip.difficulty === 'Easy' ? 'var(--green-700)' : tip.difficulty === 'Medium' ? 'var(--brand-700)' : 'var(--amber-700)',
                background: tip.difficulty === 'Easy' ? 'var(--green-50)' : tip.difficulty === 'Medium' ? 'var(--brand-50)' : 'var(--amber-50)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {tip.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="ui-grid ui-grid--2">
        {/* Habit items selection list */}
        <Card padding="lg">
          <h3 className="ui-panel-title" style={{ marginBottom: 4 }}>
            Habit Routine Checklist
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginBottom: 20 }}>
            Check the habits you completed today to measure your immediate saving impact.
          </p>

          <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {waterSavingHabits.map(habit => {
              const isChecked = !!checkedHabits[habit.id];
              return (
                <div
                  key={habit.id}
                  className={`water-habit-item ${isChecked ? 'active' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <div className="water-habit-content">
                    <div className="water-habit-checkbox">
                      {isChecked && <Check size={14} />}
                    </div>
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--slate-800)', margin: 0 }}>
                        {habit.title}
                      </p>
                      <p style={{ fontSize: '11.5px', color: 'var(--slate-500)', margin: '2px 0 0 0' }}>
                        {habit.description}
                      </p>
                    </div>
                  </div>
                  <span className="water-habit-savings-bubble">
                    +{habit.savings}L
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Trivia carousel */}
        <div className="trivia-card flex-col-between" style={{ minHeight: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-700)', fontWeight: 700, fontSize: '15px', marginBottom: 16 }}>
              <Info size={18} />
              <span>Did You Know?</span>
            </div>
            
            <div className={fadeFact ? 'fade-in-text' : ''} style={{ minHeight: '100px' }}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--slate-800)', lineHeight: '1.6', margin: 0 }}>
                "{waterFacts[factIndex].fact}"
              </p>
            </div>
          </div>

          <div className="flex-row-between" style={{ borderTop: '1px solid var(--brand-200)', paddingTop: 16, marginTop: 16 }}>
            <span style={{ fontSize: '11.5px', color: 'var(--slate-500)', fontWeight: 500 }}>
              Fact {factIndex + 1} of {waterFacts.length}
            </span>
            <button
              onClick={handleNextFact}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--brand-700)',
                cursor: 'pointer'
              }}
            >
              Next Fact <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WaterTipsPage;
