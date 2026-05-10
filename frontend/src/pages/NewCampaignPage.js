import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const PLATFORMS = ['Instagram', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok'];
const TONES = ['Bold & punchy', 'Friendly & warm', 'Data-driven', 'Witty', 'Inspiring', 'Professional'];
const TONE_MAP = { 'Bold & punchy': 'casual', 'Friendly & warm': 'casual', 'Data-driven': 'professional', 'Witty': 'humorous', 'Inspiring': 'inspirational', 'Professional': 'professional' };
const GOALS = [
  { label: 'Grow followers', sub: 'Reach new audiences', icon: '🚀' },
  { label: 'Boost engagement', sub: 'More likes & comments', icon: '❤️' },
  { label: 'Drive sales', sub: 'Convert into customers', icon: '💰' },
  { label: 'Build brand awareness', sub: 'Get your name out there', icon: '📣' },
];
const DURATIONS = [
  { val: 7, label: '7', sub: 'days' },
  { val: 15, label: '15', sub: 'days' },
  { val: 30, label: '30', sub: 'days' },
];

const STEP_ICONS = ['🎯', '🎨', '✦', '📅'];
const STEP_LABELS = ['Goals', 'Brand', 'Platforms', 'Launch'];

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    campaignName: '',
    niche: '',
    brandName: '',
    brandDescription: '',
    toneOfVoice: 'casual',
    toneLabel: '',
    goals: [],
    targetPlatforms: [],
    duration: 30,
    customInstructions: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const toggleGoal = (g) => {
    const current = form.goals;
    setForm({ ...form, goals: current.includes(g) ? current.filter(x => x !== g) : [...current, g] });
  };

  const togglePlatform = (p) => {
    const current = form.targetPlatforms;
    setForm({ ...form, targetPlatforms: current.includes(p) ? current.filter(x => x !== p) : [...current, p] });
  };

  const setTone = (label) => {
    setForm({ ...form, toneLabel: label, toneOfVoice: TONE_MAP[label] || 'casual' });
  };

  const canNext = () => {
    if (step === 0) return form.goals.length > 0;
    if (step === 1) return form.brandName.trim() && form.niche.trim();
    if (step === 2) return form.targetPlatforms.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.campaignName.trim()) {
      toast.error('Please enter a campaign name.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/campaigns', form);
      toast.success('Campaign created! Your calendar is ready 🎉');
      navigate(`/campaigns/${res.data.campaign._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container page-content">
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Campaign Wizard
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Build your next {form.duration} days
            </h1>
          </div>

          {/* Step indicator */}
          <div className="wizard-steps" style={{ marginTop: 28, marginBottom: 36 }}>
            {STEP_ICONS.map((icon, i) => (
              <>
                <div key={i} className={`wizard-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                  {i < step ? '✓' : icon}
                </div>
                {i < STEP_ICONS.length - 1 && <div key={`line-${i}`} className={`wizard-line ${i < step ? 'done' : ''}`} />}
              </>
            ))}
          </div>

          {/* ── STEP 0: Goals ── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                What's your main goal?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                We'll tune the AI to optimize for this.
              </p>
              {GOALS.map(g => (
                <div
                  key={g.label}
                  className={`goal-card ${form.goals.includes(g.label) ? 'selected' : ''}`}
                  onClick={() => toggleGoal(g.label)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{g.icon}</span>
                    <div>
                      <h4>{g.label}</h4>
                      <p>{g.sub}</p>
                    </div>
                    {form.goals.includes(g.label) && (
                      <div style={{ marginLeft: 'auto', width: 22, height: 22, background: 'var(--purple)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: Brand ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Tell us about your brand
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                The AI will write in your voice.
              </p>
              <div className="form-group">
                <label>Brand name</label>
                <input
                  placeholder="e.g. Lumen Studio"
                  value={form.brandName}
                  onChange={e => setForm({ ...form, brandName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Your niche / industry</label>
                <input
                  placeholder="e.g. Fashion, Fitness, SaaS, Food"
                  value={form.niche}
                  onChange={e => setForm({ ...form, niche: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>What you do</label>
                <textarea
                  placeholder="We design minimalist productivity tools for indie founders. Clean visuals, useful tips, occasional behind-the-scenes."
                  value={form.brandDescription}
                  onChange={e => setForm({ ...form, brandDescription: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tone of voice</label>
                <div className="chips-row">
                  {TONES.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`chip ${form.toneLabel === t ? 'selected' : ''}`}
                      onClick={() => setTone(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Platforms & duration ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Where do you post?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                Select all the platforms you're active on.
              </p>
              <div className="form-group">
                <label>Target platforms</label>
                <div className="chips-row">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`chip ${form.targetPlatforms.includes(p) ? 'selected' : ''}`}
                      onClick={() => togglePlatform(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 24 }}>
                <label>Calendar duration</label>
                <div className="duration-selector" style={{ marginTop: 10 }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d.val}
                      type="button"
                      className={`duration-btn ${form.duration === d.val ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, duration: d.val })}
                    >
                      {d.label}
                      <span className="sub">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 20 }}>
                <label>Start date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Final / Launch ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                Ready to launch 🚀
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                Give your campaign a name and we'll generate your calendar.
              </p>

              {/* Summary */}
              <div className="card" style={{ marginBottom: 20, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Brand</div>
                    <div style={{ fontWeight: 600 }}>{form.brandName}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Niche</div>
                    <div style={{ fontWeight: 600 }}>{form.niche}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Duration</div>
                    <div style={{ fontWeight: 600 }}>{form.duration} days</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Platforms</div>
                    <div style={{ fontWeight: 600 }}>{form.targetPlatforms.join(', ')}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Tone</div>
                    <div style={{ fontWeight: 600 }}>{form.toneLabel || form.toneOfVoice}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Goals</div>
                    <div style={{ fontWeight: 600 }}>{form.goals.join(', ')}</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Campaign name</label>
                <input
                  placeholder="e.g. Summer 2025 Push"
                  value={form.campaignName}
                  onChange={e => setForm({ ...form, campaignName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Custom instructions (optional)</label>
                <textarea
                  placeholder="Any specific requests? e.g. 'Focus on Ramadan themes', 'Always include a CTA'"
                  value={form.customInstructions}
                  onChange={e => setForm({ ...form, customInstructions: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
            <button
              type="button"
              onClick={() => step === 0 ? navigate('/dashboard') : setStep(step - 1)}
              className="btn btn-ghost"
              style={{ minWidth: 100 }}
            >
              {step === 0 ? 'Cancel' : '← Back'}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn btn-primary"
                disabled={!canNext()}
                style={{ minWidth: 140 }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={loading || !form.campaignName.trim()}
                style={{ minWidth: 200 }}
              >
                {loading ? '⏳ Generating...' : '🚀 Generate Calendar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
