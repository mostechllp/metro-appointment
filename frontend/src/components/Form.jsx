import React, { useState } from 'react';
import API from '../api';
import EmirateSelect from './EmirateSelect';

export default function Form({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', phone: '+971', emirate: '', address: '', email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key, val) => {
    setForm({ ...form, [key]: val });
    setErrors({ ...errors, [key]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\+971\d{9}$/.test(form.phone))
      e.phone = 'Phone must be +971 followed by 9 digits';
    if (!form.emirate) e.emirate = 'Please select an emirate';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post('/submissions', form);
      onSuccess(res.data.submission);
      setForm({ name: '', phone: '+971', emirate: '', address: '', email: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-header">
        <h3>Book an Appointment</h3>
        <p>Fill in your details and we'll send your consultation link.</p>
      </div>

      <form onSubmit={submit}>
        <div className="form-grid">
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
            {errors.phone
              ? <span className="error">{errors.phone}</span>
              : <span className="phone-hint">UAE format: +971 followed by 9 digits</span>
            }
          </div>

          <EmirateSelect
            value={form.emirate}
            onChange={(v) => update('emirate', v)}
            error={errors.emirate}
          />

          <div className="form-group">
            <label>Email</label>
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
              rows={3}
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Building, street, area..."
            />
          </div>

          <div className="form-group full">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}