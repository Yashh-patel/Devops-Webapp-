import React, { useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_API_URL || '/api';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_COLORS   = { todo: '#64748b', 'in-progress': '#3b82f6', done: '#10b981' };
const STATUS_LABELS   = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

/* ─── API helpers ─── */
const api = {
  get:    (path) => fetch(`${API}${path}`).then(r => r.json()),
  post:   (path, body) => fetch(`${API}${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => r.json()),
  patch:  (path, body) => fetch(`${API}${path}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path) => fetch(`${API}${path}`, { method:'DELETE' }).then(r => r.json()),
};

/* ─── TaskCard ─── */
function TaskCard({ task, onDelete, onStatusChange }) {
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: 12,
      padding: '16px', marginBottom: 12, borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}`,
      transition: 'transform 0.15s', cursor: 'default',
    }}
    onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
    onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
        <div style={{ flex:1 }}>
          <h3 style={{ fontSize:15, fontWeight:600, marginBottom:4, color:'#f1f5f9' }}>{task.title}</h3>
          {task.description && <p style={{ fontSize:13, color:'#94a3b8', marginBottom:10 }}>{task.description}</p>}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Badge color={STATUS_COLORS[task.status]} label={STATUS_LABELS[task.status]} />
            <Badge color={PRIORITY_COLORS[task.priority]} label={task.priority} />
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <select
            value={task.status}
            onChange={e => onStatusChange(task.id, e.target.value)}
            style={{ fontSize:12, background:'#0f172a', color:'#e2e8f0', border:'1px solid #334155', borderRadius:6, padding:'4px 6px', cursor:'pointer' }}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button onClick={() => onDelete(task.id)} style={{
            background:'transparent', border:'1px solid #ef4444', color:'#ef4444',
            borderRadius:6, padding:'4px 8px', fontSize:12, cursor:'pointer'
          }}>✕ Delete</button>
        </div>
      </div>
    </div>
  );
}

function Badge({ color, label }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}55`,
      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize'
    }}>{label}</span>
  );
}

/* ─── AddTaskModal ─── */
function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title:'', description:'', priority:'medium', status:'todo' });
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    await onAdd(form);
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#00000088', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
      <div style={{ background:'#1e293b', borderRadius:16, padding:32, width:'100%', maxWidth:480, border:'1px solid #334155' }}>
        <h2 style={{ marginBottom:20, fontSize:20, fontWeight:700 }}>Add New Task</h2>
        <label style={labelStyle}>Title *</label>
        <input style={inputStyle} value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="Task title..." />
        {error && <p style={{ color:'#ef4444', fontSize:12, marginTop:4 }}>{error}</p>}
        <label style={labelStyle}>Description</label>
        <textarea style={{...inputStyle, height:80, resize:'vertical'}} value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Optional description..." />
        <div style={{ display:'flex', gap:12 }}>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:24 }}>
          <button onClick={onClose} style={{ flex:1, padding:'10px', background:'transparent', border:'1px solid #334155', borderRadius:8, color:'#94a3b8', cursor:'pointer' }}>Cancel</button>
          <button onClick={submit} style={{ flex:1, padding:'10px', background:'#0d9488', border:'none', borderRadius:8, color:'white', fontWeight:600, cursor:'pointer' }}>Add Task</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'10px 12px', color:'#e2e8f0', fontSize:14, marginBottom:14, outline:'none', display:'block' };
const labelStyle = { display:'block', fontSize:12, fontWeight:600, color:'#94a3b8', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' };

/* ─── Stat Card ─── */
function StatCard({ label, value, color }) {
  return (
    <div style={{ background:'#1e293b', border:`1px solid ${color}44`, borderRadius:12, padding:'16px 20px', flex:1, textAlign:'center' }}>
      <div style={{ fontSize:32, fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:12, color:'#64748b', marginTop:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState('all');
  const [priority, setPriority] = useState('all');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (priority !== 'all') params.set('priority', priority);
      const data = await api.get(`/tasks?${params}`);
      setTasks(data.tasks || []);
      setError('');
    } catch {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [filter, priority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (form) => {
    await api.post('/tasks', form);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/tasks/${id}`, { status });
    setTasks(prev => prev.map(t => t.id === id ? {...t, status} : t));
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a' }}>
      {/* Header */}
      <header style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#14b8a6' }}>⚡ TaskManager</h1>
          <p style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Powered by Docker & CI/CD</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background:'#0d9488', border:'none', borderRadius:8, color:'white', padding:'10px 20px', fontWeight:600, cursor:'pointer', fontSize:14 }}>+ New Task</button>
      </header>

      <main style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>
        {/* Stats */}
        <div style={{ display:'flex', gap:12, marginBottom:28 }}>
          <StatCard label="Total" value={stats.total} color="#14b8a6" />
          <StatCard label="To Do" value={stats.todo} color="#64748b" />
          <StatCard label="In Progress" value={stats.inProgress} color="#3b82f6" />
          <StatCard label="Done" value={stats.done} color="#10b981" />
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:6 }}>
            {['all','todo','in-progress','done'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${filter===s ? '#0d9488' : '#334155'}`, background: filter===s ? '#0d948822' : 'transparent', color: filter===s ? '#14b8a6' : '#94a3b8', cursor:'pointer', fontSize:13, fontWeight: filter===s ? 600 : 400 }}>{s === 'all' ? 'All' : STATUS_LABELS[s]}</button>
            ))}
          </div>
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', borderRadius:20, padding:'6px 14px', fontSize:13, cursor:'pointer' }}>
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Content */}
        {error && (
          <div style={{ background:'#ef444422', border:'1px solid #ef4444', borderRadius:10, padding:16, color:'#fca5a5', marginBottom:20 }}>{error}</div>
        )}
        {loading ? (
          <div style={{ textAlign:'center', color:'#64748b', padding:60 }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign:'center', color:'#64748b', padding:60 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
            <p>No tasks found. Add one above!</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={deleteTask} onStatusChange={updateStatus} />
          ))
        )}
      </main>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} onAdd={addTask} />}
    </div>
  );
}
