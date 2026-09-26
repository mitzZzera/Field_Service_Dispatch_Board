"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "Unassigned" | "En route" | "On site" | "Completed";
type Priority = "Low" | "Normal" | "High" | "Urgent";

type Job = {
  id: string;
  customer: string;
  address: string;
  service: string;
  priority: Priority;
  status: Status;
  technician: string;
  time: string;
  duration: string;
  notes: string;
};

type Technician = {
  name: string;
  role: string;
  color: string;
  status: "Available" | "On job" | "Off duty";
  jobs: number;
};

const demoJobs: Job[] = [
  { id: "JOB-1048", customer: "Northline Market", address: "18 Harbor Street", service: "Cold room inspection", priority: "Urgent", status: "Unassigned", technician: "", time: "08:30", duration: "90 min", notes: "Freezer is warming after overnight outage." },
  { id: "JOB-1049", customer: "Mara Lewis", address: "42 Willow Lane", service: "HVAC maintenance", priority: "Normal", status: "En route", technician: "Maya Patel", time: "09:15", duration: "60 min", notes: "Annual maintenance visit." },
  { id: "JOB-1050", customer: "Cedar & Co.", address: "7 Market Square", service: "Electrical repair", priority: "High", status: "On site", technician: "Jordan Lee", time: "10:00", duration: "120 min", notes: "Lights flickering in the retail area." },
  { id: "JOB-1051", customer: "Hearthside Dental", address: "110 King Road", service: "Generator test", priority: "Normal", status: "Completed", technician: "Sam Rivera", time: "10:30", duration: "45 min", notes: "Quarterly backup generator test." },
  { id: "JOB-1052", customer: "Lumen Apartments", address: "2A River Walk", service: "Plumbing callout", priority: "High", status: "Unassigned", technician: "", time: "11:45", duration: "75 min", notes: "Leaking valve in basement utility room." },
  { id: "JOB-1053", customer: "Eastside Bakery", address: "26 Oak Avenue", service: "Oven calibration", priority: "Low", status: "En route", technician: "Maya Patel", time: "13:00", duration: "60 min", notes: "Calibrate deck oven before afternoon bake." },
];

const technicians: Technician[] = [
  { name: "Maya Patel", role: "HVAC specialist", color: "#7bd8c1", status: "On job", jobs: 4 },
  { name: "Jordan Lee", role: "Electrical lead", color: "#ffb45e", status: "On job", jobs: 3 },
  { name: "Sam Rivera", role: "General technician", color: "#b4a4ff", status: "Available", jobs: 2 },
  { name: "Avery Chen", role: "Plumbing specialist", color: "#7eb8ff", status: "Available", jobs: 1 },
];

const statuses: Status[] = ["Unassigned", "En route", "On site", "Completed"];

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2);
}

function nextStatus(status: Status): Status {
  const index = statuses.indexOf(status);
  return statuses[(index + 1) % statuses.length];
}

export default function DispatchBoard() {
  const [activeView, setActiveView] = useState("Dispatch");
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState({ dailyLimit: 6, defaultView: "Dispatch", notifications: true });
  const [form, setForm] = useState({
    customer: "",
    address: "",
    service: "General inspection",
    priority: "Normal" as Priority,
    technician: "",
    time: "14:00",
    duration: "60 min",
    notes: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("field-dispatch-jobs");
      if (!saved) return;
      try {
        setJobs(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem("field-dispatch-jobs");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("field-dispatch-jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("field-dispatch-settings");
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") setSettings((current) => ({ ...current, ...parsed }));
      } catch {
        window.localStorage.removeItem("field-dispatch-settings");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const matchesQuery = [job.customer, job.address, job.service, job.technician].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesPriority = priorityFilter === "All priorities" || job.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  }), [jobs, query, priorityFilter]);

  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter((job) => job.status === "En route" || job.status === "On site").length,
    unassigned: jobs.filter((job) => job.status === "Unassigned").length,
    completed: jobs.filter((job) => job.status === "Completed").length,
  }), [jobs]);

  function updateJob(id: string, updates: Partial<Job>) {
    setJobs((current) => current.map((job) => job.id === id ? { ...job, ...updates } : job));
    setToast("Job updated");
  }

  function submitJob(event: { preventDefault: () => void }) {
    event.preventDefault();
    const newJob: Job = {
      id: "JOB-" + (1054 + jobs.length),
      ...form,
      status: form.technician ? "En route" : "Unassigned",
    };
    setJobs((current) => [newJob, ...current]);
    setIsModalOpen(false);
    setForm({ customer: "", address: "", service: "General inspection", priority: "Normal", technician: "", time: "14:00", duration: "60 min", notes: "" });
    setToast("New job added to the board");
  }

  function saveSettings(event: { preventDefault: () => void }) {
    event.preventDefault();
    window.localStorage.setItem("field-dispatch-settings", JSON.stringify(settings));
    setActiveView(settings.defaultView);
    setIsSettingsOpen(false);
    setToast("Settings saved");
  }

  return (
    <main className="dispatch-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">R<span>/</span>24</div>
          <div><strong>Routeboard</strong><small>FIELD OPERATIONS</small></div>
        </div>
        <div className="workspace-select"><span className="workspace-dot" /> Atlas Services <b>⌄</b></div>
        <span className="sidebar-kicker">WORKSPACE</span>
        <nav className="side-nav" aria-label="Main navigation">
          {[
            ["Dispatch", "⌘"],
            ["Jobs", "▣"],
            ["Technicians", "♙"],
            ["Customers", "◎"],
            ["Reports", "⌁"],
          ].map(([label, icon]) => (
            <button key={label} className={activeView === label ? "side-link active" : "side-link"} onClick={() => setActiveView(label)}>
              <span>{icon}</span>{label}<em>{label === "Jobs" ? jobs.length : label === "Technicians" ? technicians.length : ""}</em>
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="coverage-card"><span className="pulse-dot" /><div><b>Coverage is healthy</b><small>4 technicians online</small></div><span>↗</span></div>
        <button className="settings-link" onClick={() => { setIsSettingsOpen(true); setIsAccountMenuOpen(false); }}><span>⚙</span><div><b>Settings</b><small>Workspace preferences</small></div><em>→</em></button>
        <div className="profile-wrap">
          <button className="profile-chip" onClick={() => setIsAccountMenuOpen((open) => !open)} aria-expanded={isAccountMenuOpen}><div className="avatar avatar-indigo">DS</div><div><b>Dimitar Shopov</b><small>Dispatcher</small></div><span className="profile-chevron">{isAccountMenuOpen ? "⌃" : "⌄"}</span></button>
          {isAccountMenuOpen && <div className="profile-menu"><button onClick={() => { setIsAccountMenuOpen(false); setIsSettingsOpen(true); }}>Profile settings <span>↗</span></button><button onClick={() => { setIsAccountMenuOpen(false); setToast("Keyboard shortcuts are available in the full app"); }}>Keyboard shortcuts <span>⌘</span></button><button onClick={() => { setIsAccountMenuOpen(false); setToast("Demo session kept active"); }}>Keep demo session <span>✓</span></button></div>}
        </div>
      </aside>

      <section className="main-panel">
        <header className="top-header">
          <div className="mobile-brand"><div className="brand-mark">R<span>/</span>24</div><strong>Routeboard</strong></div>
          <div className="breadcrumb"><span>Operations</span><b>/</b><strong>{activeView}</strong></div>
          <div className="header-actions"><button className="icon-button">⌕</button><button className="icon-button notification">♢<i /></button><div className="avatar avatar-indigo">DS</div></div>
        </header>

        {activeView === "Dispatch" ? (
          <>
            <div className="page-heading">
              <div><p className="eyebrow">TUESDAY · OCTOBER 14, 2025</p><h1>Good morning, Dimitar <span>✦</span></h1><p className="heading-sub">Here’s what’s happening across your field team today.</p></div>
              <button className="primary-action" onClick={() => setIsModalOpen(true)}>＋ New job</button>
            </div>

            <div className="stats-grid">
              <article className="stat-card"><span className="stat-icon blue">▣</span><div><small>Jobs today</small><strong>{stats.total}</strong><p><b className="positive">+2</b> from yesterday</p></div><span className="sparkline blue-line" /></article>
              <article className="stat-card"><span className="stat-icon orange">◷</span><div><small>Active in field</small><strong>{stats.active}</strong><p><b className="neutral">Live</b> right now</p></div><span className="sparkline orange-line" /></article>
              <article className="stat-card"><span className="stat-icon purple">!</span><div><small>Needs assignment</small><strong>{stats.unassigned}</strong><p><b className="warning">Attention</b> required</p></div><span className="sparkline purple-line" /></article>
              <article className="stat-card"><span className="stat-icon green">✓</span><div><small>Completed</small><strong>{stats.completed}</strong><p><b className="positive">82%</b> on-time rate</p></div><span className="sparkline green-line" /></article>
            </div>

            <div className="board-toolbar">
              <div><h2>Today’s dispatch</h2><span className="live-badge"><i /> Live board</span></div>
              <div className="toolbar-actions"><label className="search-box">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jobs..." /></label><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></select><button className="filter-button">☷ Filter</button></div>
            </div>

            <div className="dispatch-board">
              {statuses.map((status) => {
                const columnJobs = filteredJobs.filter((job) => job.status === status);
                return <section className={"board-column " + status.toLowerCase().replace(" ", "-")} key={status}>
                  <div className="column-heading"><div><span className="column-dot" /><h3>{status}</h3><b>{columnJobs.length}</b></div><button onClick={() => setToast(`${status} column options opened`)} aria-label={`${status} column options`}>•••</button></div>
                  <div className="job-stack">
                    {columnJobs.map((job) => <article className="job-card" key={job.id}>
                      <div className="job-card-top"><span className="job-id">{job.id}</span><span className={"priority " + job.priority.toLowerCase()}>{job.priority}</span></div>
                      <h4>{job.customer}</h4><p className="job-address">⌖ {job.address}</p>
                      <div className="job-service"><span>◈</span><b>{job.service}</b><small>{job.duration}</small></div>
                      <div className="job-time"><span>◷ {job.time}</span><span>• {job.notes}</span></div>
                      <div className="job-footer"><div className="assigned-tech">{job.technician ? <><span className="avatar" style={{ background: technicians.find((tech) => tech.name === job.technician)?.color || "#c6cdd5" }}>{initials(job.technician)}</span><span>{job.technician}</span></> : <span className="unassigned-label">＋ Assign technician</span>}</div><button className="advance-button" onClick={() => updateJob(job.id, { status: nextStatus(job.status) })} title="Advance job status">→</button></div>
                      {status !== "Completed" && <select className="tech-select" value={job.technician} onChange={(event) => updateJob(job.id, { technician: event.target.value, status: event.target.value && status === "Unassigned" ? "En route" : status })}><option value="">Assign technician...</option>{technicians.map((tech) => <option key={tech.name}>{tech.name}</option>)}</select>}
                    </article>)}
                    {columnJobs.length === 0 && <div className="empty-column">No jobs here</div>}
                  </div>
                  {status === "Unassigned" && <button className="add-column-job" onClick={() => setIsModalOpen(true)}>＋ Add job</button>}
                </section>;
              })}
            </div>
          </>
        ) : (
          <div className="secondary-view">
            <div className="page-heading"><div><p className="eyebrow">ROUTEBOARD WORKSPACE</p><h1>{activeView}</h1><p className="heading-sub">A focused view of your field operation.</p></div><button className="primary-action" onClick={() => setIsModalOpen(true)}>＋ New job</button></div>
            <div className="secondary-grid"><div className="directory-card"><div className="card-title"><h2>{activeView === "Technicians" ? "Technician directory" : activeView === "Customers" ? "Customer accounts" : activeView === "Jobs" ? "All jobs" : "Weekly performance"}</h2><span>Updated just now</span></div>{activeView === "Technicians" ? technicians.map((tech) => <div className="directory-row" key={tech.name}><span className="avatar" style={{ background: tech.color }}>{initials(tech.name)}</span><div><b>{tech.name}</b><small>{tech.role}</small></div><span className={"status-pill " + tech.status.toLowerCase().replace(" ", "-")}>{tech.status}</span><strong>{tech.jobs} jobs</strong></div>) : activeView === "Customers" ? Array.from(new Set(jobs.map((job) => job.customer))).map((customer) => <div className="directory-row" key={customer}><span className="customer-icon">◎</span><div><b>{customer}</b><small>{jobs.filter((job) => job.customer === customer).length} service requests</small></div><span className="status-pill available">Active</span><strong>View →</strong></div>) : <div className="summary-grid"><div><small>Total jobs</small><strong>{stats.total}</strong></div><div><small>Completed</small><strong>{stats.completed}</strong></div><div><small>Unassigned</small><strong>{stats.unassigned}</strong></div></div>}</div><div className="insight-card"><span className="insight-kicker">FIELD NOTE</span><h3>Clear ownership keeps every visit moving.</h3><p>Assign the next available technician, keep job notes visible, and let the board tell the story at a glance.</p><button onClick={() => setActiveView("Dispatch")}>Back to dispatch →</button></div></div>
          </div>
        )}
      </section>

      {isModalOpen && <div role="presentation" className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }}><form className="job-modal" onSubmit={submitJob}><div className="modal-header"><div><span className="eyebrow">NEW WORK ORDER</span><h2>Create a job</h2></div><button type="button" onClick={() => setIsModalOpen(false)}>×</button></div><div className="form-grid"><label>Customer<input required value={form.customer} onChange={(event) => setForm({ ...form, customer: event.target.value })} placeholder="e.g. Northline Market" /></label><label>Service<select value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}><option>General inspection</option><option>HVAC maintenance</option><option>Electrical repair</option><option>Plumbing callout</option><option>Equipment installation</option></select></label><label>Address<input required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Street and number" /></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></label><label>Scheduled time<input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label><label>Duration<select value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })}><option>30 min</option><option>60 min</option><option>90 min</option><option>120 min</option></select></label><label>Assign technician<select value={form.technician} onChange={(event) => setForm({ ...form, technician: event.target.value })}><option value="">Leave unassigned</option>{technicians.map((tech) => <option key={tech.name}>{tech.name}</option>)}</select></label><label className="wide-field">Job notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="What should the technician know?" rows={3} /></label></div><div className="modal-actions"><button type="button" className="ghost-button" onClick={() => setIsModalOpen(false)}>Cancel</button><button className="primary-action" type="submit">Create work order →</button></div></form></div>}
      {isSettingsOpen && <div role="presentation" className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsSettingsOpen(false); }}><form className="job-modal settings-modal" onSubmit={saveSettings}><div className="modal-header"><div><span className="eyebrow">ROUTEBOARD SETTINGS</span><h2>Workspace preferences</h2></div><button type="button" onClick={() => setIsSettingsOpen(false)}>×</button></div><p className="settings-intro">Tune the board for the way your field team works. These preferences are saved in this browser.</p><div className="settings-list"><label>Maximum jobs per day<small>Used as the planning capacity for your dispatch team.</small><input type="number" min="1" max="24" value={settings.dailyLimit} onChange={(event) => setSettings({ ...settings, dailyLimit: Math.max(1, Math.min(24, Number(event.target.value) || 1)) })} /></label><label>Default workspace view<small>Choose which view opens when you save these preferences.</small><select value={settings.defaultView} onChange={(event) => setSettings({ ...settings, defaultView: event.target.value })}><option>Dispatch</option><option>Jobs</option><option>Technicians</option><option>Customers</option><option>Reports</option></select></label><label className="settings-toggle" aria-label="Operational notifications"><span><b>Operational notifications</b><small>Show lightweight confirmations after board actions.</small></span><input type="checkbox" checked={settings.notifications} onChange={(event) => setSettings({ ...settings, notifications: event.target.checked })} /><i /></label></div><div className="modal-actions"><button type="button" className="ghost-button" onClick={() => setIsSettingsOpen(false)}>Cancel</button><button className="primary-action" type="submit">Save preferences →</button></div></form></div>}
      {toast && <div className="toast-message">✓ {toast}</div>}
    </main>
  );
}




