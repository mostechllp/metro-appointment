import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // 👈 Import useSearchParams
import {
  Users,
  Calendar,
  LogOut,
  RefreshCw,
  Search,
  Menu,
  CheckCircle2,
  Send,
  Download
} from 'lucide-react';
import API from '../api';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import ExportModal from '../components/ExportModal';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState({});
  
  const navigate = useNavigate();
  
  // 👈 Use URL Search Params for the active tab
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'registrations';

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

  const updateAttendance = async (id, attendance) => {
    setSubmissions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, attendance } : s))
    );
    setSavingAttendance((prev) => ({ ...prev, [id]: true }));

    try {
      await API.patch(`/admin/submissions/${id}/attendance`, { attendance });
    } catch (err) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === id
            ? { ...s, attendance: attendance === 'attended' ? 'not-attended' : 'attended' }
            : s
        )
      );
      alert(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setSavingAttendance((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

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
  };

  const tabs = [
    { key: 'registrations', label: 'Registrations', icon: Users, count: stats.total },
    { key: 'events', label: 'Manage Events', icon: Calendar }
  ];

  // 👈 Helper to change tab and update URL
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
    setSidebarOpen(false);
  };

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
                  onClick={() => handleTabChange(t.key)} // 👈 Use the helper
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
              <span>Total Registrations</span>
              <strong>{stats.total}</strong>
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
                  ? 'All submitted event registrations'
                  : 'Create and manage your events and meeting links'}
              </p>
            </div>

            <div className="admin-actions">
              {activeTab === 'registrations' && (
                <>
                  <div className="admin-search">
                    <Search size={16} />
                    <input
                      placeholder="Search name, phone, email…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="admin-refresh" onClick={fetchData} title="Refresh">
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                  </button>
                </>
              )}
            </div>
          </div>

          {activeTab === 'events' ? (
            <EventsTab />
          ) : loading ? (
            <div className="admin-empty">Loading submissions…</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">
              {searchQuery ? 'No results matching your search.' : 'No submissions yet.'}
            </div>
          ) : (
            <RegistrationsTab
              submissions={filtered}
              updateAttendance={updateAttendance}
              savingAttendance={savingAttendance}
            />
          )}
        </main>
      </div>
    </>
  );
}

/* ============================================================
   TAB 1 — Registrations (Grouped by Event)
   ============================================================ */
function RegistrationsTab({ submissions, updateAttendance, savingAttendance }) {
  // 👈 Export Modal State
  const [exportConfig, setExportConfig] = useState({ isOpen: false, eventId: null, title: '' });
  const [isExporting, setIsExporting] = useState(false);

  // 👈 Handle Export Download
  const handleExport = async (format) => {
    if (!exportConfig.eventId) return;
    setIsExporting(true);
    try {
      const res = await API.get(`/admin/export/${exportConfig.eventId}?format=${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = res.headers['content-disposition'];
      let filename = `registrations.${format === 'excel' ? 'xlsx' : format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setExportConfig({ isOpen: false, eventId: null, title: '' });
    } catch (err) {
      alert('Failed to download file');
    } finally {
      setIsExporting(false);
    }
  };

  // 1. Group submissions by Event ID
  const groupedSubmissions = submissions.reduce((groups, sub) => {
    const eventId = sub.eventId?._id || 'legacy';
    
    if (!groups[eventId]) {
      groups[eventId] = {
        eventDetails: sub.eventId || null,
        items: []
      };
    }
    
    groups[eventId].items.push(sub);
    return groups;
  }, {});

  // 2. Convert object to array and sort groups
  const sortedGroups = Object.values(groupedSubmissions).sort((a, b) => {
    if (!a.eventDetails) return 1;
    if (!b.eventDetails) return -1;
    return new Date(b.eventDetails.date) - new Date(a.eventDetails.date);
  });

  return (
    <div className="grouped-reg-list">
      {sortedGroups.map((group) => {
        const { eventDetails, items } = group;
        
        const groupTitle = eventDetails 
          ? eventDetails.title 
          : 'Legacy Registrations (No Event)';
          
        const groupSubtitle = eventDetails
          ? `${new Date(eventDetails.date).toLocaleString()} - ${eventDetails.durationMinutes} mins`
          : 'Older registrations created before events were added';

        return (
          <div key={eventDetails?._id || 'legacy'} className="event-group" style={{ marginBottom: 40 }}>
            
            {/* Group Header */}
            <div className="event-group-header">
              <div>
                <h3 className="event-group-title">
                  {eventDetails ? '📅' : '📁'} {groupTitle}
                </h3>
                <p className="event-group-subtitle">{groupSubtitle}</p>
              </div>
              
              {/* Header Actions & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="event-group-badge">
                  {items.length} {items.length === 1 ? 'Registration' : 'Registrations'}
                </div>
                
                {eventDetails && (
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}
                    onClick={() => setExportConfig({ isOpen: true, eventId: eventDetails._id, title: eventDetails.title })}
                  >
                    <Download size={14} /> Export
                  </button>
                )}
              </div>
            </div>

            {/* Group Cards Grid */}
            <div className="reg-cards">
              {items.map((s) => {
                const attendance = s.attendance || 'attended';
                const isSaving = savingAttendance?.[s._id];

                return (
                  <div key={s._id} className="reg-card">
                    <div className="reg-card-head">
                      <div>
                        <div className="reg-name">{s.name}</div>
                        <div className="reg-date">
                          Registered: {new Date(s.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={`reg-status ${attendance === 'attended' ? 'ok' : 'pending'}`}>
                        {attendance === 'attended' ? 'Attended' : 'Not Attended'}
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
                    </div>

                    <div className="attendance-row">
                      <label className="attendance-label">
                        <CheckCircle2 size={14} />
                        Attendance
                      </label>
                      <div className="attendance-select-wrap">
                        <select
                          className={`attendance-select ${attendance}`}
                          value={attendance}
                          onChange={(e) => updateAttendance(s._id, e.target.value)}
                          disabled={isSaving}
                        >
                          <option value="attended">✓ Attended</option>
                          <option value="not-attended">✕ Not Attended</option>
                        </select>
                        {isSaving && <RefreshCw size={14} className="spin attendance-spinner" />}
                      </div>
                    </div>
                    
                    {s.certificateSent && (
                      <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#22a06b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Send size={12} /> Certificate emailed automatically
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 👈 Render Export Modal */}
      <ExportModal
        isOpen={exportConfig.isOpen}
        onClose={() => !isExporting && setExportConfig({ isOpen: false, eventId: null, title: '' })}
        onExport={handleExport}
        isExporting={isExporting}
        eventTitle={exportConfig.title}
      />
    </div>
  );
}

/* ============================================================
   TAB 2 — Events Manager (Create, Edit, Delete)
   ============================================================ */
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null, title: '' });
  const [processing, setProcessing] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setMeetingLink(''); setDate(''); setDuration(60);
  };

  const handleEditClick = (ev) => {
    const dateObj = new Date(ev.date);
    const localISOTime = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    setEditingId(ev._id);
    setTitle(ev.title);
    setMeetingLink(ev.meetingLink);
    setDate(localISOTime);
    setDuration(ev.durationMinutes);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (event) => {
    setConfirmConfig({ isOpen: true, id: event._id, title: event.title });
  };

  const confirmDelete = async () => {
    if (!confirmConfig.id) return;
    setProcessing(true);
    
    try {
      await API.delete(`/admin/events/${confirmConfig.id}`);
      if (editingId === confirmConfig.id) resetForm(); 
      fetchEvents();
      setConfirmConfig({ isOpen: false, id: null, title: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setProcessing(false);
    }
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        meetingLink,
        date: new Date(date).toISOString(),
        durationMinutes: Number(duration)
      };

      if (editingId) {
        await API.put(`/admin/events/${editingId}`, payload);
      } else {
        await API.post('/admin/events', payload);
      }
      
      resetForm();
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="global-link-wrap" style={{ maxWidth: 850 }}>
      
      {/* CREATE / EDIT EVENT FORM */}
      <div className="global-link-card" style={{ marginBottom: 30, border: editingId ? '2px solid var(--maroon)' : '1px solid var(--border)' }}>
        <div className="global-link-header">
          <div className="global-link-icon"><Calendar size={22} /></div>
          <div>
            <h3>{editingId ? 'Edit Event Details' : 'Create New Event'}</h3>
            <p>{editingId ? 'Update the details for this event.' : 'Set the date, time, and link for the upcoming session.'}</p>
          </div>
        </div>

        <form onSubmit={submitEvent}>
          <div className="form-group">
            <label>Event Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Breast Cancer Awareness" />
          </div>
          
          <div className="form-group">
            <label>Meeting Link</label>
            <input required value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Date & Time</label>
              <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input required type="number" min="15" step="15" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update Event' : 'Create Event'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm} disabled={saving}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LIST OF EVENTS */}
      <h3 style={{ color: 'var(--maroon-deep)', marginBottom: 16 }}>Upcoming & Past Events</h3>
      
      {loading ? <p>Loading events…</p> : events.length === 0 ? <p>No events created yet.</p> : (
        <div className="reg-cards">
          {events.map(ev => {
            const dateObj = new Date(ev.date);
            return (
              <div key={ev._id} className="reg-card" style={{ borderLeft: ev.status === 'completed' ? '4px solid #22a06b' : ev.status === 'ongoing' ? '4px solid var(--accent)' : '4px solid var(--maroon-light)' }}>
                <div className="reg-card-head">
                  <div>
                    <div className="reg-name">{ev.title}</div>
                    <div className="reg-date">
                      {dateObj.toLocaleString()} ({ev.durationMinutes} mins)
                    </div>
                  </div>
                  <div className={`reg-status ${ev.status === 'completed' ? 'ok' : ev.status === 'ongoing' ? 'pending' : ''}`} style={{
                    background: ev.status === 'upcoming' ? '#f0f0f0' : '',
                    color: ev.status === 'upcoming' ? '#666' : ''
                  }}>
                    {ev.status.toUpperCase()}
                  </div>
                </div>
                
                <div style={{ marginTop: 12, fontSize: '0.85rem', wordBreak: 'break-all' }}>
                  <a href={ev.meetingLink} target="_blank" rel="noreferrer" style={{ color: 'var(--maroon)' }}>
                    {ev.meetingLink}
                  </a>
                </div>
                
                {ev.certificatesSent && (
                  <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#22a06b', fontWeight: 600 }}>
                    ✓ Certificates sent to attendees
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }}
                    onClick={() => handleEditClick(ev)}
                    disabled={ev.status === 'completed'} 
                  >
                    Edit
                  </button>
                  <button 
                    className="btn" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1, background: '#e74c3c' }}
                    onClick={() => openDeleteModal(ev)}
                  >
                    Delete
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 👈 RENDER THE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => !processing && setConfirmConfig({ isOpen: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        isProcessing={processing}
        title="Delete Event?"
        message={`Are you sure you want to delete "${confirmConfig.title}"? This will permanently delete all patient registrations linked to this event. This action cannot be undone.`}
        confirmText="Yes, Delete"
        variant="danger"
      />

    </div>
  );
}