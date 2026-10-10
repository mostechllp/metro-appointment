import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Link2,
  LogOut,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  Search,
  Menu
} from 'lucide-react';
import API from '../api';
import Header from '../components/Header';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [edits, setEdits] = useState({});
  const [activeTab, setActiveTab] = useState('registrations');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/submissions');
      setSubmissions(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }));
  };

  const saveEdit = async (sub) => {
    const edit = edits[sub._id] || {};
    const platform = edit.platform ?? sub.platform;
    const meetingLink = edit.meetingLink ?? sub.meetingLink;

    if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
      alert('Link must start with http:// or https://');
      return;
    }

    try {
      await API.patch(`/admin/submissions/${sub._id}`, { platform, meetingLink });
      await fetchData();
      setEdits((prev) => {
        const copy = { ...prev };
        delete copy[sub._id];
        return copy;
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving');
    }
  };

  const copyLink = (id, link) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  // Filter by search query
  const filtered = submissions.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.emirate?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: submissions.length,
    withLink: submissions.filter((s) => s.meetingLink).length,
    pending: submissions.filter((s) => !s.meetingLink).length
  };

 const tabs = [
  { key: 'registrations', label: 'Registrations', icon: Users, count: stats.total },
  { key: 'meetings', label: 'Meeting Link', icon: Link2 }
];

  return (
    <>
      <Header />
      <div className="admin-layout">
        {/* MOBILE TOPBAR */}
        <div className="admin-mobile-bar">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <span className="admin-mobile-title">
            {tabs.find((t) => t.key === activeTab)?.label}
          </span>
        </div>

        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <div className="sidebar-logo">MS</div>
            <div>
              <div className="sidebar-title">Metro Starcare</div>
              <div className="sidebar-sub">Admin Panel</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`sidebar-item ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(t.key);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} />
                  <span>{t.label}</span>
                  {t.count > 0 && <span className="sidebar-badge">{t.count}</span>}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-stats">
            <div className="stat-row">
              <span>Total</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-row">
              <span>With link</span>
              <strong style={{ color: '#22a06b' }}>{stats.withLink}</strong>
            </div>
            <div className="stat-row">
              <span>Pending</span>
              <strong style={{ color: '#db2c66' }}>{stats.pending}</strong>
            </div>
          </div>

          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </aside>

        {/* OVERLAY for mobile */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* MAIN CONTENT */}
        <main className="admin-main">
          <div className="admin-main-header">
            <div>
              <h1 className="admin-page-title">
                {tabs.find((t) => t.key === activeTab)?.label}
              </h1>
              <p className="admin-page-sub">
                {activeTab === 'registrations'
  ? 'All submitted appointment requests'
  : 'Set the global meeting link shown to every patient'}
              </p>
            </div>

            <div className="admin-actions">
  {activeTab === 'registrations' && (
    <div className="admin-search">
      <Search size={16} />
      <input
        placeholder="Search name, phone, email…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )}
  {activeTab === 'registrations' && (
    <button className="admin-refresh" onClick={fetchData} title="Refresh">
      <RefreshCw size={16} className={loading ? 'spin' : ''} />
    </button>
  )}
</div>
          </div>

          {activeTab === 'meetings' ? (
  <MeetingsTab />
) : loading ? (
  <div className="admin-empty">Loading submissions…</div>
) : filtered.length === 0 ? (
  <div className="admin-empty">
    {searchQuery
      ? 'No results matching your search.'
      : 'No submissions yet.'}
  </div>
) : (
  <RegistrationsTab submissions={filtered} />
)}
        </main>
      </div>
    </>
  );
}

/* ============================================================
   TAB 1 — Registrations (read-only table)
   ============================================================ */
function RegistrationsTab({ submissions }) {
  return (
    <div className="reg-cards">
      {submissions.map((s) => (
        <div key={s._id} className="reg-card">
          <div className="reg-card-head">
            <div>
              <div className="reg-name">{s.name}</div>
              <div className="reg-date">
                {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            <div className={`reg-status ${s.meetingLink ? 'ok' : 'pending'}`}>
              {s.meetingLink ? 'Link ready' : 'Pending'}
            </div>
          </div>

          <div className="reg-grid">
            <div className="reg-field">
              <span className="reg-label">Phone</span>
              <span className="reg-value">
                <a href={`tel:${s.phone}`}>{s.phone}</a>
              </span>
            </div>
            <div className="reg-field">
              <span className="reg-label">Email</span>
              <span className="reg-value">
                {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : '—'}
              </span>
            </div>
            <div className="reg-field">
              <span className="reg-label">Emirate</span>
              <span className="reg-value">{s.emirate}</span>
            </div>
            <div className="reg-field">
              <span className="reg-label">Address</span>
              <span className="reg-value">{s.address || '—'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   TAB 2 — Global Meeting Link (one common link)
   ============================================================ */
function MeetingsTab() {
  const [platform, setPlatform] = useState('google');
  const [meetingLink, setMeetingLink] = useState('');
  const [original, setOriginal] = useState({ platform: 'google', meetingLink: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/admin/meeting-link');
        const data = res.data || { platform: 'google', meetingLink: '' };
        setPlatform(data.platform || 'google');
        setMeetingLink(data.meetingLink || '');
        setOriginal({
          platform: data.platform || 'google',
          meetingLink: data.meetingLink || ''
        });
      } catch {
        setError('Failed to load current link');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasUnsaved =
    platform !== original.platform || meetingLink !== original.meetingLink;

  const save = async () => {
    setError('');

    if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
      setError('Link must start with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      const res = await API.put('/admin/meeting-link', { platform, meetingLink });
      setOriginal({
        platform: res.data.platform,
        meetingLink: res.data.meetingLink
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const platformName =
    { google: 'Google Meet', teams: 'Microsoft Teams', zoom: 'Zoom', other: 'Other' }[
      platform
    ] || 'Meeting';

  if (loading) return <div className="admin-empty">Loading…</div>;

  return (
    <div className="global-link-wrap">
      <div className="global-link-card">
        <div className="global-link-header">
          <div className="global-link-icon">
            <Link2 size={22} />
          </div>
          <div>
            <h3>Global Meeting Link</h3>
            <p>Every patient who submits the form will see this link.</p>
          </div>
        </div>

        <div className="form-group">
          <label>Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="google">Google Meet</option>
            <option value="teams">Microsoft Teams</option>
            <option value="zoom">Zoom</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Meeting Link</label>
          <div className="meet-input-wrap">
            <input
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
            />
            {meetingLink && (
              <button
                type="button"
                className="meet-icon-btn"
                onClick={copy}
                title="Copy link"
              >
                {copied ? (
                  <CheckCircle2 size={16} style={{ color: '#22a06b' }} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            )}
          </div>
          <span className="meet-hint">
            Patients will see this link in a popup after submitting the form.
          </span>
        </div>

        {error && <p className="login-error">{error}</p>}

        <div className="global-link-actions">
          <button
            className="btn"
            onClick={save}
            disabled={!hasUnsaved || saving}
          >
            {saving
              ? 'Saving…'
              : saved
              ? '✓ Saved'
              : hasUnsaved
              ? 'Save Link'
              : 'No changes'}
          </button>

          {meetingLink && (
            <a
              className="btn btn-outline"
              href={meetingLink}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={14} /> Test Link
            </a>
          )}
        </div>

        {original.meetingLink && !hasUnsaved && (
          <div className="global-link-active">
            <div className="active-label">Currently active</div>
            <div className="active-value">
              <strong>{platformName}:</strong> {original.meetingLink}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}