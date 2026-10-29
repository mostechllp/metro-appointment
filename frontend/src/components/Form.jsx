import React, { useState, useEffect } from 'react';
import API from '../api';
import EmirateSelect from './EmirateSelect';
import SearchableSelect from './SearchableSelect'; // 👈 Import it

export default function Form({ onSuccess }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    eventId: '', 
    name: '', phone: '+971', emirate: '', address: '', email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch available events on load
  useEffect(() => {
    API.get('/submissions/active-events').then(res => {
      setEvents(res.data);
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, eventId: res.data[0]._id })); 
      }
    });
  }, []);

  const update = (key, val) => {
    setForm({ ...form, [key]: val });
    setErrors({ ...errors, [key]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.eventId) e.eventId = 'Please select an event';
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\+971\d{9}$/.test(form.phone)) e.phone = 'Phone must be +971 followed by 9 digits';
    if (!form.emirate) e.emirate = 'Please select an emirate';
    
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Valid email is required to receive your certificate';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    console.log("Submitting Payload:", form);
    try {
      const res = await API.post('/submissions', form);
      onSuccess(res.data.submission);
      
      setForm({ eventId: form.eventId, name: '', phone: '+971', emirate: '', address: '', email: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Format events into the { value, label } format required by SearchableSelect
  const eventOptions = events.map(ev => ({
    value: ev._id,
    label: `${ev.title} - ${new Date(ev.date).toLocaleString()}`
  }));

  return (
    <div className="form-wrap">
      <div className="form-header">
        <h3>Register for an Event</h3>
        <p>Fill in your details to receive your meeting link and certificate.</p>
      </div>

      <form onSubmit={submit}>
        <div className="form-grid">
          
          {/* Event Selection Dropdown (Replaced) */}
          <div className="form-group full">
            <label>Select Event <span className="req">*</span></label>
            
            <SearchableSelect 
              options={eventOptions}
              value={form.eventId}
              onChange={(val) => update('eventId', val)}
              placeholder="Search and select an event..."
              error={errors.eventId}
            />

            {errors.eventId && <span className="error" style={{ marginTop: 6, display: 'block' }}>{errors.eventId}</span>}
          </div>

          <div className="form-group">
            <label>Full Name <span className="req">*</span></label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., Ahmed Ali"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number <span className="req">*</span></label>
            <input
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+971501234567"
              maxLength={13}
            />
            {errors.phone ? <span className="error">{errors.phone}</span> : <span className="phone-hint">UAE format: +971 followed by 9 digits</span>}
          </div>

          <EmirateSelect
            value={form.emirate}
            onChange={(v) => update('emirate', v)}
            error={errors.emirate}
          />

          <div className="form-group">
            <label>Email <span className="req">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group full">
            <label>Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Building, street, area..."
            />
          </div>

          <div className="form-group full">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Register Now'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}