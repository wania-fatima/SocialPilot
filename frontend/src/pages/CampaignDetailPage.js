import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

function PostModal({ post, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [saving, setSaving] = useState(false);

  const doUpdate = async (updates) => {
    setSaving(true);
    try {
      await onUpdate(post._id, updates);
    } catch {
      toast.error('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const saveCaption = async () => {
    await doUpdate({ caption });
    setEditing(false);
    toast.success('Caption saved!');
  };

  const approve = async () => { await doUpdate({ status: 'approved' }); toast.success('✅ Approved!'); onClose(); };
  const reject  = async () => { await doUpdate({ status: 'rejected' }); toast.success('❌ Rejected.'); onClose(); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Day {post.day} — {post.platform}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`flag-dot ${post.performanceFlag}`}></span>
              {post.postType} · {post.postingTime}
              {post.date && ` · ${new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Performance mini stats */}
        <div className="mini-stats">
          <div className="mini-stat">
            <div className="mini-stat-label">❤️ Likes</div>
            <div className="mini-stat-value">{post.predictedLikes?.toLocaleString()}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">💬 Comments</div>
            <div className="mini-stat-value">{post.predictedComments?.toLocaleString()}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">👁 Reach</div>
            <div className="mini-stat-value">
              {post.predictedReach >= 1000 ? (post.predictedReach/1000).toFixed(1)+'K' : post.predictedReach}
            </div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">⚡ Score</div>
            <div className="mini-stat-value" style={{ color: post.performanceFlag === 'green' ? 'var(--green)' : post.performanceFlag === 'yellow' ? 'var(--yellow)' : 'var(--red)', textTransform: 'uppercase', fontSize: 14 }}>
              {post.performanceFlag}
            </div>
          </div>
        </div>

        {/* Caption */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caption</div>
            <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>
          {editing ? (
            <div>
              <textarea className="inline-edit" value={caption} onChange={e => setCaption(e.target.value)} />
              <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={saveCaption} disabled={saving}>
                {saving ? 'Saving...' : 'Save caption'}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{caption}</p>
          )}
        </div>

        {/* Hashtags */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Hashtags</div>
          <div className="tags">
            {post.hashtags?.map((h, i) => <span key={i} className="tag">{h}</span>)}
          </div>
        </div>

        {/* Visual idea */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>🎨 Visual Idea</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', lineHeight: 1.7 }}>
            {post.visualIdea}
          </p>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="btn btn-success" onClick={approve} disabled={saving || post.status === 'approved'}>
            ✅ Approve
          </button>
          <button className="btn btn-danger" onClick={reject} disabled={saving || post.status === 'rejected'}>
            ❌ Reject
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        {post.status !== 'draft' && (
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            Status: <span style={{ color: post.status === 'approved' ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{post.status}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => { fetchCampaign(); }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await axios.get(`/api/campaigns/${id}`);
      setCampaign(res.data.campaign);
    } catch {
      toast.error('Failed to load campaign.');
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId, updates) => {
    const res = await axios.put(`/api/campaigns/${id}/posts/${postId}`, updates);
    setCampaign(prev => ({
      ...prev,
      posts: prev.posts.map(p => p._id === postId ? { ...p, ...res.data.post } : p),
      stats: {
        ...prev.stats,
        approvedPosts: prev.posts.filter(p =>
          p._id === postId ? updates.status === 'approved' : p.status === 'approved'
        ).length,
      },
    }));
    if (selectedPost?._id === postId) setSelectedPost(prev => ({ ...prev, ...updates }));
  };

  const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;

  if (loading) return <><Navbar /><div className="container page-content" style={{ color: 'var(--text-muted)', paddingTop: 60, textAlign: 'center' }}>Loading campaign...</div></>;
  if (!campaign) return <><Navbar /><div className="container page-content">Campaign not found.</div></>;

  const uniquePlatforms = [...new Set(campaign.posts?.map(p => p.platform))];
  const filteredPosts = campaign.posts?.filter(p => {
    if (filterPlatform !== 'All' && p.platform !== filterPlatform) return false;
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onUpdate={updatePost} />}

      <div className="container page-content">
        {/* Back */}
        <Link to="/dashboard" className="back-link">← Dashboard</Link>

        {/* Header */}
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-bright)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Content Calendar
              </div>
              <h1>{campaign.campaignName}</h1>
              <p>{campaign.brandName} · {campaign.niche} · {campaign.toneOfVoice} tone · {campaign.duration} days</p>
            </div>
            <div className="platform-badges">
              {campaign.targetPlatforms?.map(p => <span key={p} className="platform-badge">{p}</span>)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Posts</div>
            <div className="stat-value">{campaign.stats?.totalPosts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{campaign.stats?.approvedPosts}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Predicted Reach</div>
            <div className="stat-value" style={{ color: 'var(--purple-bright)' }}>{fmt(campaign.stats?.totalPredictedReach)}</div>
            <div className="stat-change">▲ +34.2% forecast</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Engagement</div>
            <div className="stat-value">{campaign.stats?.avgEngagementRate}%</div>
            <div className="stat-change">▲ +27% vs manual</div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <select className="filter-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            <option value="All">All Platforms</option>
            {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
            {filteredPosts?.length} posts
          </span>
        </div>

        {/* Legend */}
        <div className="legend">
          <span className="legend-item"><span className="flag-dot green"></span> High performance</span>
          <span className="legend-item"><span className="flag-dot yellow"></span> Medium</span>
          <span className="legend-item"><span className="flag-dot red"></span> Needs improvement</span>
          <span style={{ marginLeft: 'auto', fontSize: 12 }}>Click any post to view details</span>
        </div>

        {/* Calendar */}
        <div className="calendar-grid">
          {filteredPosts?.map(post => (
            <div
              key={post._id}
              className={`calendar-cell ${post.status !== 'draft' ? post.status : ''}`}
              onClick={() => setSelectedPost(post)}
            >
              <div className="cell-day">
                Day {post.day}
                {post.date && ` · ${new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </div>
              <div className="cell-platform">
                <span className={`flag-dot ${post.performanceFlag}`}></span>
                {post.platform}
              </div>
              <div className="cell-type">{post.postType} · {post.postingTime}</div>
              <div className="cell-caption">{post.caption}</div>
              {post.status !== 'draft' && (
                <div style={{ marginTop: 8, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: post.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                  {post.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
