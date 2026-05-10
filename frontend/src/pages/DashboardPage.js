import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/campaigns');
      setCampaigns(res.data.campaigns);
    } catch {
      toast.error('Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`/api/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c._id !== id));
      toast.success('Campaign deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;

  const totalReach = campaigns.reduce((s, c) => s + (c.stats?.totalPredictedReach || 0), 0);
  const totalPosts = campaigns.reduce((s, c) => s + (c.stats?.totalPosts || 0), 0);

  return (
    <>
      <Navbar />
      <div className="container page-content">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Dashboard
              </div>
              <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Here's an overview of your content strategy.</p>
            </div>
            <Link to="/campaigns/new" className="btn btn-primary btn-lg">
              + New Campaign
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Campaigns</div>
            <div className="stat-value">{campaigns.length}</div>
            <div className="stat-change">📅 All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Campaigns</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="stat-change">▲ Running now</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Predicted Reach</div>
            <div className="stat-value" style={{ color: 'var(--purple-bright)' }}>{fmt(totalReach)}</div>
            <div className="stat-change">▲ Across all campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Posts Planned</div>
            <div className="stat-value">{totalPosts}</div>
            <div className="stat-change">📝 Content pieces</div>
          </div>
        </div>

        {/* Campaigns */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>Your Campaigns</div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>⏳</div>
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.5 }}>📅</div>
            <h3>No campaigns yet</h3>
            <p>Create your first campaign to get an AI-generated content calendar.</p>
            <Link to="/campaigns/new" className="btn btn-primary btn-lg">
              Create your first campaign →
            </Link>
          </div>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map(campaign => (
              <Link key={campaign._id} to={`/campaigns/${campaign._id}`} className="campaign-card">
                {/* Delete button */}
                <button
                  onClick={(e) => deleteCampaign(e, campaign._id, campaign.campaignName)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
                    color: '#ef4444', borderRadius: 6, padding: '4px 10px',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  Delete
                </button>

                <div style={{ paddingRight: 60 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div className="campaign-name">{campaign.campaignName}</div>
                  </div>
                  <div className="campaign-meta">
                    {campaign.niche} · {campaign.duration} days
                  </div>
                  <div className="platform-badges" style={{ marginBottom: 16 }}>
                    {campaign.targetPlatforms?.map(p => (
                      <span key={p} className="platform-badge">{p}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>👁 {fmt(campaign.stats?.totalPredictedReach || 0)} reach</span>
                    <span>📝 {campaign.stats?.totalPosts || 0} posts</span>
                    <span>✅ {campaign.stats?.approvedPosts || 0} approved</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
