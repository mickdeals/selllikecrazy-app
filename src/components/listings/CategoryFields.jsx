import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CATEGORY_GROUPS } from '../../lib/categories'

/**
 * CategoryFields — renders dynamic fields based on category group
 * Used in both Sell.jsx (items) and Browse (filters)
 */
export function CategoryFields({ group, values = {}, onChange }) {
  if (!group || !group.fields || group.fields.length === 0) return null

  const update = (id, value) => onChange({ ...values, [id]: value })

  return (
    <div>
      <div className="section-label" style={{ padding: 0, marginBottom: 14 }}>
        {group.icon} {group.label} details
      </div>

      {group.fields.map(field => (
        <div key={field.id} className="form-group">
          <label className="input-label">
            {field.label}
            {field.required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}
          </label>

          {field.type === 'text' && (
            <input className="input" value={values[field.id] || ''}
              onChange={e => update(field.id, e.target.value)}
              placeholder={field.placeholder} />
          )}

          {field.type === 'number' && (
            <input className="input" type="number" value={values[field.id] || ''}
              onChange={e => update(field.id, e.target.value)}
              placeholder={field.placeholder}
              min={field.min} max={field.max} />
          )}

          {field.type === 'month' && (
            <input className="input" type="month" value={values[field.id] || ''}
              onChange={e => update(field.id, e.target.value)} />
          )}

          {field.type === 'date' && (
            <input className="input" type="date" value={values[field.id] || ''}
              onChange={e => update(field.id, e.target.value)} />
          )}

          {field.type === 'select' && (
            <div style={{ position: 'relative' }}>
              <select className="input" value={values[field.id] || ''}
                onChange={e => update(field.id, e.target.value)}
                style={{ appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
                <option value="">Select...</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={16} color="var(--muted)"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          )}

          {field.type === 'multicheck' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {field.options.map(opt => {
                const selected = (values[field.id] || []).includes(opt)
                return (
                  <button key={opt} type="button"
                    onClick={() => {
                      const current = values[field.id] || []
                      update(field.id, selected ? current.filter(x => x !== opt) : [...current, opt])
                    }}
                    style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${selected ? 'var(--red)' : 'var(--border)'}`, background: selected ? '#FFF0F3' : 'var(--bg)', color: selected ? 'var(--red)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    {selected ? '✓ ' : ''}{opt}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * CategoryGroupPicker — the full category group selector shown on SellTypeSelector
 */
export function CategoryGroupPicker({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {CATEGORY_GROUPS.map(group => (
        <button key={group.id} onClick={() => onSelect(group)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', background: selected?.id === group.id ? group.bg : 'white', border: `1.5px solid ${selected?.id === group.id ? group.color : 'var(--border)'}`, borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          <span style={{ fontSize: 28 }}>{group.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: selected?.id === group.id ? group.color : 'var(--text)', textAlign: 'center', lineHeight: 1.3 }}>{group.label}</span>
        </button>
      ))}
    </div>
  )
}
