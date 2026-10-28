import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const NEWS_URL = 'https://mastermine-news-app-7tby.bolt.host/';
const apps = [
  { name: 'MasterMine GX', desc: 'Gaming, browsing & useful links', icon: '🌐', color: 'purple' },
  { name: 'MasterMine NEWS', desc: 'Discover what is happening', icon: '📰', color: 'red', url: NEWS_URL },
  { name: 'MasterMine Docs', desc: 'Write and download documents', icon: '📝', color: 'blue' },
  { name: 'MasterMine Slides', desc: 'Build a presentation slide by slide', icon: '📊', color: 'orange' },
  { name: 'MasterMine Drive', desc: 'Keep track of files on this device', icon: '☁️', color: 'cyan' },
  { name: 'MasterMine Sheets', desc: 'Edit a simple spreadsheet', icon: '📈', color: 'green' },
  { name: 'MasterMine Meet', desc: 'Create a meeting invite', icon: '🎥', color: 'blue' },
  { name: 'MasterMine Chat', desc: 'A local message board', icon: '💬', color: 'purple' },
  { name: 'MasterMine Planner', desc: 'Organise your tasks', icon: '📅', color: 'orange' },
  { name: 'MasterMine Mail', desc: 'Write and save email drafts', icon: '✉️', color: 'red' },
  { name: 'MasterMine Studio', desc: 'Make and download a drawing', icon: '🎨', color: 'purple' },
  { name: 'MasterMine Notes', desc: 'Save your ideas and reminders', icon: '📒', color: 'green' },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch { return fallback; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
function downloadText(filename, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function safeFileName(value, fallback = 'MasterMine-File') {
  const cleaned = String(value || fallback)
    .replace(/[\\/:*?"<>|]/g, '-')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return cleaned || fallback;
}
function downloadMasterFile(filename, format, extension, data) {
  const payload = {
    ...data,
    format,
    formatVersion: 1,
    extension,
    updatedAt: new Date().toISOString()
  };
  const mime = 'application/vnd.mastermine.' + extension.replace(/^\./, '') + '+json;charset=utf-8';
  downloadText(filename, JSON.stringify(payload, null, 2), mime);
}
async function readMasterFile(file, expectedFormat) {
  const payload = JSON.parse(await file.text());
  if (!payload || payload.format !== expectedFormat || payload.formatVersion !== 1) {
    throw new Error('Unsupported MasterMine file format');
  }
  return payload;
}
function escapeTextAsHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>');
}
const panelStyle = { background: 'var(--card-bg, #fff)', border: '1px solid var(--card-border, #dedbea)', borderRadius: 20, padding: 24, marginTop: 28, color: 'var(--text-color, #242033)' };
const fieldStyle = { boxSizing: 'border-box', width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cfc8df', font: 'inherit', margin: '6px 0 12px' };
const btnStyle = { border: 0, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', font: 'inherit', margin: '4px 6px 4px 0' };

function App() {
  const [search, setSearch] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [note, setNote] = useState(() => readStorage('mm-notes', ''));
  const [tasks, setTasks] = useState(() => readStorage('mm-tasks', []));
  const [newTask, setNewTask] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [docTitle, setDocTitle] = useState(() => readStorage('mm-doc-title', 'My document'));
  const [docText, setDocText] = useState(() => readStorage('mm-doc-text', ''));
  const [slides, setSlides] = useState(() => readStorage('mm-slides', [{ title: 'Welcome to MasterMine Slides', body: 'Add your ideas here.' }]));
  const [slideIndex, setSlideIndex] = useState(0);
  const [sheet, setSheet] = useState(() => readStorage('mm-sheet', [['Item', 'Quantity', 'Price'], ['Apples', '3', '1.50'], ['Pears', '2', '2.00']]));
  const [chatMessages, setChatMessages] = useState(() => readStorage('mm-chat', []));
  const [chatInput, setChatInput] = useState('');
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailDrafts, setMailDrafts] = useState(() => readStorage('mm-mail-drafts', []));
  const [meetingTitle, setMeetingTitle] = useState('MasterMine meeting');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingInvite, setMeetingInvite] = useState('');
  const [driveFiles, setDriveFiles] = useState(() => readStorage('mm-drive-files', []));
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const filteredApps = useMemo(() => apps.filter(app => `${app.name} ${app.desc}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const activeApp = apps.find(app => app.name === activeTool);
  const toolTitle = activeTool === 'notes' ? '📒 MasterMine Notes' : activeTool === 'planner' ? '📅 MasterMine Planner' : activeApp ? `${activeApp.icon} ${activeApp.name}` : '';

  function persist(key, value, message = 'Saved on this device 💜') {
    setSaveMessage(writeStorage(key, value) ? message : 'Could not save in this browser.');
  }
  function goToApps() {
    setActiveTool(null);
    document.getElementById('apps')?.scrollIntoView({ behavior: 'smooth' });
  }
  function launchApp(app) {
    if (app.url) { window.open(app.url, '_blank', 'noopener,noreferrer'); return; }
    setActiveTool(app.name === 'MasterMine Notes' ? 'notes' : app.name === 'MasterMine Planner' ? 'planner' : app.name);
    setSaveMessage('');
    if (app.name === 'MasterMine Studio') setTimeout(() => clearCanvas(), 50);
  }
  function updateNote(value) { setNote(value); persist('mm-notes', value); }
  function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    const updated = [...tasks, { id: `${Date.now()}-${Math.random()}`, title, done: false }];
    setTasks(updated); persist('mm-tasks', updated, 'Task saved 💜'); setNewTask('');
  }
  function toggleTask(id) {
    const updated = tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);
    setTasks(updated); writeStorage('mm-tasks', updated);
  }
  function deleteTask(id) {
    const updated = tasks.filter(task => task.id !== id); setTasks(updated); writeStorage('mm-tasks', updated);
  }
  function updateDocTitle(value) { setDocTitle(value); writeStorage('mm-doc-title', value); }
  function updateDocText(value) { setDocText(value); persist('mm-doc-text', value); }
  function updateSlides(next) { setSlides(next); persist('mm-slides', next, 'Presentation saved 💜'); }
  function updateCell(r, c, value) {
    const next = sheet.map(row => [...row]);
    while (next.length <= r) next.push([]);
    next[r][c] = value; setSheet(next); writeStorage('mm-sheet', next);
  }
  function addSheetRow() { const next = [...sheet, Array(Math.max(3, ...sheet.map(r => r.length))).fill('')]; setSheet(next); writeStorage('mm-sheet', next); }
  function sheetValue(value) {
    if (typeof value !== 'string' || !value.startsWith('=')) return value;
    const sum = value.match(/^=SUM\(([A-Z])(\d+):([A-Z])(\d+)\)$/i);
    if (sum && sum[1].toUpperCase() === sum[3].toUpperCase()) {
      const col = sum[1].toUpperCase().charCodeAt(0) - 65, start = Number(sum[2]) - 1, end = Number(sum[4]) - 1;
      return sheet.slice(Math.min(start, end), Math.max(start, end) + 1).reduce((total, row) => total + (Number(row[col]) || 0), 0);
    }
    const num = value.match(/^=(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/);
    if (num) {
      const a = Number(num[1]), b = Number(num[3]);
      if (num[2] === '+') return a + b;
      if (num[2] === '-') return a - b;
      if (num[2] === '*') return a * b;
      if (num[2] === '/' && b !== 0) return a / b;
    }
    return value;
  }
  function sendChat(event) {
    event.preventDefault(); const message = chatInput.trim(); if (!message) return;
    const next = [...chatMessages, { id: Date.now(), message, time: new Date().toLocaleString() }];
    setChatMessages(next); persist('mm-chat', next, 'Message saved 💜'); setChatInput('');
  }
  function saveMailDraft(event) {
    event.preventDefault();
    const next = [...mailDrafts, { id: Date.now(), to: mailTo, subject: mailSubject, body: mailBody, saved: new Date().toLocaleString() }];
    setMailDrafts(next); persist('mm-mail-drafts', next, 'Draft saved on this device 💜');
  }
  function createMeeting(event) {
    event.preventDefault();
    const invite = `${meetingTitle}\nWhen: ${meetingDate || 'Time not set'}\nCreated with MasterMine HUB.\nNote: This is an invitation draft, not a live video call link.`;
    setMeetingInvite(invite);
  }
  function addDriveFiles(event) {
    const selected = Array.from(event.target.files || []);
    const next = [...driveFiles, ...selected.map(file => ({ id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, size: file.size, type: file.type }))];
    setDriveFiles(next); persist('mm-drive-files', next, 'File list saved. Files remain on your device.');
    event.target.value = '';
  }
  function clearCanvas() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function canvasPoint(event) {
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }
  function startDraw(event) {
    const canvas = canvasRef.current; if (!canvas) return;
    drawing.current = true; const p = canvasPoint(event); const ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#6441a5';
    canvas.setPointerCapture(event.pointerId);
  }
  function draw(event) {
    if (!drawing.current || !canvasRef.current) return;
    const p = canvasPoint(event); const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  function stopDraw() { drawing.current = false; }
  useEffect(() => { if (activeTool === 'MasterMine Studio') clearCanvas(); }, [activeTool]);

  const button = (label, onClick, color = '#eee8ff') => <button type="button" style={{ ...btnStyle, background: color }} onClick={onClick}>{label}</button>;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">M</span><span><strong>MasterMine</strong>HUB</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="sidebar-nav">
        <button className="nav-item active" onClick={goToApps}><span>⌂</span> Home</button>
        <button className="nav-item" onClick={() => launchApp(apps[4])}><span>☁</span> My files</button>
        <button className="nav-item" onClick={() => { setSearch(''); goToApps(); }}><span>★</span> All apps</button>
      </nav>
      <div className="sidebar-profile"><div className="profile-icon">MM</div><div><strong>MasterMine ID</strong><p>Your workspace</p></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace / <strong>{activeTool ? toolTitle : 'Home'}</strong></div><div className="topbar-badge">✦ MasterMine ecosystem</div></header>
      <section className="hero">
        <div className="hero-copy"><div className="hero-eyebrow">✦ YOUR DIGITAL WORLD</div><h1>Welcome to MasterMine HUB.</h1><p>All your apps. All your ideas. One place.</p><div className="hero-actions"><button className="primary-btn" onClick={goToApps}>Explore your apps ↗</button><button className="secondary-btn" onClick={goToApps}>Discover HUB</button></div></div>
        <div className="hero-art" aria-hidden="true"><div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div><div className="hero-logo">MM<span>✦</span></div></div><div className="hero-caption">MADE FOR YOUR WORLD</div>
      </section>
      <section className="apps-section" id="apps">
        <div className="section-heading"><div><div className="section-eyebrow">YOUR WORKSPACE</div><h2>Your apps</h2><p>{filteredApps.length} apps in your ecosystem</p></div><label className="search-box"><span>⌕</span><input type="search" placeholder="Search apps..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search apps" /></label></div>
        <div className="app-grid">{filteredApps.map(app => <article className="app-card" key={app.name}><div className={`app-icon ${app.color}`}>{app.icon}</div><div className="app-card-title">{app.name}</div><p>{app.desc}</p><button className="launch-btn" onClick={() => launchApp(app)}>Open app <span>↗</span></button></article>)}</div>
        {filteredApps.length === 0 && <p className="empty">No apps match that search. Try another name!</p>}
      </section>

      {activeTool && <section style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><h2 style={{ marginTop: 0 }}>{toolTitle}</h2>{button('Close ✕', () => setActiveTool(null))}</div>

        {activeTool === 'MasterMine Docs' && <div><p>Write a document in MasterMine's own format. Your text autosaves in this browser.</p><label>Document title<input style={fieldStyle} value={docTitle} onChange={e => updateDocTitle(e.target.value)} /></label><textarea aria-label="Document content" style={{ ...fieldStyle, minHeight: 260, resize: 'vertical' }} placeholder="Start writing your document..." value={docText} onChange={e => updateDocText(e.target.value)} />{button('Download .masterdocx', () => downloadMasterFile(safeFileName(docTitle, 'My-document') + '.masterdocx', 'MasterMine Docs', '.masterdocx', { title: docTitle || 'My document', content: escapeTextAsHtml(docText), plainText: docText }), '#e1edff')}{button('Clear document', () => { updateDocText(''); })}<label>Open a .masterdocx file<input style={fieldStyle} type="file" accept=".masterdocx,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Docs'); let text = typeof payload.plainText === 'string' ? payload.plainText : null; if (text === null && typeof payload.content === 'string') text = new DOMParser().parseFromString(payload.content, 'text/html').body.innerText; if (text === null && typeof payload.body === 'string') text = payload.body; if (typeof text !== 'string') throw new Error('Missing document text'); updateDocTitle(typeof payload.title === 'string' ? payload.title : 'My document'); updateDocText(text); setSaveMessage('MasterMine document opened 💜'); } catch { alert('Could not open that .masterdocx file.'); } finally { e.target.value = ''; } }} /></label><p>{saveMessage || 'Autosaves in this browser.'}</p></div>        {activeTool === 'MasterMine Slides' && <div><p>Create a presentation and save it as a MasterMine Slides file.</p><label>Slide title<input style={fieldStyle} value={slides[slideIndex]?.title || ''} onChange={e => updateSlides(slides.map((s,i) => i === slideIndex ? { ...s, title: e.target.value } : s))} /></label><label>Slide content<textarea style={{ ...fieldStyle, minHeight: 150 }} value={slides[slideIndex]?.body || ''} onChange={e => updateSlides(slides.map((s,i) => i === slideIndex ? { ...s, body: e.target.value } : s))} /></label><p>Slide {slideIndex + 1} of {slides.length}</p>{button('← Previous', () => setSlideIndex(Math.max(0, slideIndex - 1)))}{button('Next →', () => setSlideIndex(Math.min(slides.length - 1, slideIndex + 1)))}{button('+ Add slide', () => { const next = [...slides, { title: 'New slide', body: '' }]; updateSlides(next); setSlideIndex(next.length - 1); }, '#e4f7e8')}{button('Delete slide', () => { if (slides.length < 2) return; const next = slides.filter((_,i) => i !== slideIndex); updateSlides(next); setSlideIndex(Math.max(0, slideIndex - 1)); })}{button('Download .masterslides', () => downloadMasterFile('MasterMine-Presentation.masterslides', 'MasterMine Slides', '.masterslides', { slides }), '#ffefd9')}<label>Open a .masterslides file<input style={fieldStyle} type="file" accept=".masterslides,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Slides'); if (!Array.isArray(payload.slides) || !payload.slides.every(s => s && typeof s.title === 'string' && typeof s.body === 'string')) throw new Error('Invalid slides'); updateSlides(payload.slides); setSlideIndex(0); setSaveMessage('Presentation opened 💜'); } catch { alert('Could not open that .masterslides file.'); } finally { e.target.value = ''; } }} /></label><p>{saveMessage}</p></div>        {activeTool === 'MasterMine Sheets' && <div><p>Edit cells directly. Basic formulas supported: =2+2, =5*3 and =SUM(B2:B4). Changes save in this browser.</p><div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%' }}><tbody>{sheet.map((row,r) => <tr key={r}>{Array.from({ length: Math.max(3, ...sheet.map(x => x.length)) }, (_,c) => <td key={c} style={{ border: '1px solid #d8d2e5', padding: 0 }}><input aria-label={'Cell ' + String.fromCharCode(65+c) + (r+1)} value={row[c] ?? ''} onChange={e => updateCell(r,c,e.target.value)} style={{ width: 100, boxSizing: 'border-box', padding: 9, border: 0, font: 'inherit', background: r===0 ? '#eee8ff' : 'white' }} title={row[c] || ''} /></td>)}</tr>)}</tbody></table></div>{button('+ Add row', addSheetRow)}{button('Download .mastersheets', () => downloadMasterFile('MasterMine-Spreadsheet.mastersheets', 'MasterMine Sheets', '.mastersheets', { cells: sheet }), '#e4f7e8')}{button('Export CSV', () => downloadText('MasterMine-Spreadsheet.csv', sheet.map(row => row.map(v => '"' + String(v ?? '').replace(/"/g,'""') + '"').join(',')).join('\n'), 'text/csv'))}<label>Open a .mastersheets file<input style={fieldStyle} type="file" accept=".mastersheets,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Sheets'); if (!Array.isArray(payload.cells) || !payload.cells.every(row => Array.isArray(row))) throw new Error('Invalid sheet'); setSheet(payload.cells); persist('mm-sheet', payload.cells, 'Spreadsheet opened 💜'); } catch { alert('Could not open that .mastersheets file.'); } finally { e.target.value = ''; } }} /></label><p>Formula results are shown in the table below:</p><div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse' }}><tbody>{sheet.map((row,r) => <tr key={r}>{row.map((v,c) => <td key={c} style={{ border: '1px solid #d8d2e5', padding: 8 }}>{String(sheetValue(v))}</td>)}</tr>)}</tbody></table></div></div>        {activeTool === 'MasterMine Drive' && <div><p>Choose files to list them here. This demo stores a list of filenames in this browser; the actual files stay on your device and are not uploaded to a cloud drive.</p><input type="file" multiple onChange={addDriveFiles} style={fieldStyle} />{button('Download .masterdrive file list', () => downloadMasterFile('MasterMine-Drive.masterdrive', 'MasterMine Drive', '.masterdrive', { files: driveFiles }), '#e1edff')}<label>Open a .masterdrive file list<input style={fieldStyle} type="file" accept=".masterdrive,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Drive'); if (!Array.isArray(payload.files)) throw new Error('Invalid file list'); setDriveFiles(payload.files); persist('mm-drive-files', payload.files, 'Drive file list opened 💜'); } catch { alert('Could not open that .masterdrive file.'); } finally { e.target.value = ''; } }} /></label><ul>{driveFiles.map(file => <li key={file.id}>{file.name} — {Math.max(1, Math.round(file.size / 1024))} KB</li>)}</ul>{driveFiles.length > 0 && button('Clear file list', () => { setDriveFiles([]); persist('mm-drive-files', []); })}</div>        {activeTool === 'MasterMine GX' && <div><p>A simple web launchpad. Search the web or open a popular site. Save your shortcuts in a MasterMine GX file.</p><form onSubmit={e => { e.preventDefault(); const q = e.currentTarget.elements.webquery.value.trim(); if (q) window.open('https://duckduckgo.com/?q=' + encodeURIComponent(q), '_blank', 'noopener,noreferrer'); }}><input name="webquery" style={fieldStyle} placeholder="Search the web with DuckDuckGo..." /> <button className="primary-btn" type="submit">Search ↗</button></form><div>{[['DuckDuckGo','https://duckduckgo.com'],['Wikipedia','https://wikipedia.org'],['YouTube','https://youtube.com'],['GitHub','https://github.com']].map(([name,url]) => button(name, () => window.open(url, '_blank', 'noopener,noreferrer')))}</div>{button('Download .mastergx shortcuts', () => downloadMasterFile('MasterMine-GX.mastergx', 'MasterMine GX', '.mastergx', { shortcuts: [['DuckDuckGo','https://duckduckgo.com'],['Wikipedia','https://wikipedia.org'],['YouTube','https://youtube.com'],['GitHub','https://github.com']] }))}<p>This is a launchpad, not a full browser engine.</p></div>        {activeTool === 'MasterMine Meet' && <div><p>Create a meeting invitation you can copy or share. This does not start a live video call.</p><form onSubmit={createMeeting}><label>Meeting name<input style={fieldStyle} value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} /></label><label>Date and time<input type="datetime-local" style={fieldStyle} value={meetingDate} onChange={e => setMeetingDate(e.target.value)} /></label><button className="primary-btn" type="submit">Create invitation</button></form>{meetingInvite && <><textarea readOnly style={{ ...fieldStyle, minHeight: 100 }} value={meetingInvite} />{button('Download .mastermeet', () => downloadMasterFile(safeFileName(meetingTitle, 'MasterMine-Meeting') + '.mastermeet', 'MasterMine Meet', '.mastermeet', { title: meetingTitle, dateTime: meetingDate, invite: meetingInvite }))}{button('Copy invite', () => navigator.clipboard?.writeText(meetingInvite))}</>}<label>Open a .mastermeet file<input style={fieldStyle} type="file" accept=".mastermeet,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Meet'); setMeetingTitle(typeof payload.title === 'string' ? payload.title : 'MasterMine meeting'); setMeetingDate(typeof payload.dateTime === 'string' ? payload.dateTime : ''); setMeetingInvite(typeof payload.invite === 'string' ? payload.invite : ''); setSaveMessage('Meeting file opened 💜'); } catch { alert('Could not open that .mastermeet file.'); } finally { e.target.value = ''; } }} /></label></div>        {activeTool === 'MasterMine Chat' && <div><p>A simple local message board. Messages are saved only in this browser and are not sent to other people.</p><div style={{ display: 'grid', gap: 8, maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>{chatMessages.map(m => <div key={m.id} style={{ padding: 12, background: '#f2effa', borderRadius: 12 }}><div>{m.message}</div><small>{m.time}</small></div>)}</div><form onSubmit={sendChat} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><input style={{ ...fieldStyle, flex: 1, minWidth: 160, margin: 0 }} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Write a message..." /><button className="primary-btn" type="submit">Send</button></form>{button('Download .masterchat', () => downloadMasterFile('MasterMine-Chat.masterchat', 'MasterMine Chat', '.masterchat', { messages: chatMessages }))}{button('Clear messages', () => { setChatMessages([]); persist('mm-chat', []); })}<label>Open a .masterchat file<input style={fieldStyle} type="file" accept=".masterchat,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Chat'); if (!Array.isArray(payload.messages) || !payload.messages.every(m => m && typeof m.message === 'string')) throw new Error('Invalid chat'); setChatMessages(payload.messages); persist('mm-chat', payload.messages, 'Chat history opened 💜'); } catch { alert('Could not open that .masterchat file.'); } finally { e.target.value = ''; } }} /></label></div>        {activeTool === 'MasterMine Mail' && <div><p>Compose and save drafts on this device. This demo does not send email.</p><form onSubmit={saveMailDraft}><label>To<input style={fieldStyle} type="email" value={mailTo} onChange={e => setMailTo(e.target.value)} placeholder="name@example.com" /></label><label>Subject<input style={fieldStyle} value={mailSubject} onChange={e => setMailSubject(e.target.value)} placeholder="Email subject" /></label><label>Message<textarea style={{ ...fieldStyle, minHeight: 140 }} value={mailBody} onChange={e => setMailBody(e.target.value)} placeholder="Write your email..." /></label><button className="primary-btn" type="submit">Save draft</button></form><h3>Saved drafts</h3>{mailDrafts.length ? mailDrafts.map(d => <div key={d.id} style={{ padding: 12, border: '1px solid #ddd6eb', borderRadius: 10, margin: '8px 0' }}><strong>{d.subject || '(No subject)'}</strong><p>To: {d.to || '(No recipient)'}</p><p>{d.body}</p>{button('Download .mastermail', () => downloadMasterFile(safeFileName(d.subject || 'MasterMine-Email-Draft') + '.mastermail', 'MasterMine Mail', '.mastermail', { draft: d }))}</div>) : <p>No drafts yet.</p>}<label>Open a .mastermail file into the composer<input style={fieldStyle} type="file" accept=".mastermail,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Mail'); const d = payload.draft; if (!d || typeof d !== 'object') throw new Error('Invalid draft'); setMailTo(typeof d.to === 'string' ? d.to : ''); setMailSubject(typeof d.subject === 'string' ? d.subject : ''); setMailBody(typeof d.body === 'string' ? d.body : ''); setSaveMessage('Email draft opened 💜'); } catch { alert('Could not open that .mastermail file.'); } finally { e.target.value = ''; } }} /></label></div>        {activeTool === 'MasterMine Studio' && <div><p>Draw with your pointer or touchscreen. Save the editable project as .masterstudio or export a PNG picture.</p><canvas ref={canvasRef} width="900" height="420" onPointerDown={startDraw} onPointerMove={draw} onPointerUp={stopDraw} onPointerCancel={stopDraw} onPointerLeave={stopDraw} style={{ width: '100%', maxWidth: 900, height: 'auto', border: '1px solid #d8d2e5', borderRadius: 12, touchAction: 'none', cursor: 'crosshair', background: 'white' }} />{button('Clear canvas', clearCanvas)}{button('Download .masterstudio', () => { const canvas = canvasRef.current; if (!canvas) return; downloadMasterFile('MasterMine-Artwork.masterstudio', 'MasterMine Studio', '.masterstudio', { imageDataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }); }, '#e4f7e8')}{button('Export PNG', () => { const canvas = canvasRef.current; if (!canvas) return; const a = document.createElement('a'); a.download = 'MasterMine-Artwork.png'; a.href = canvas.toDataURL('image/png'); a.click(); })}<label>Open a .masterstudio project<input style={fieldStyle} type="file" accept=".masterstudio,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Studio'); if (typeof payload.imageDataUrl !== 'string' || !payload.imageDataUrl.startsWith('data:image/png;base64,')) throw new Error('Invalid artwork'); const image = new Image(); image.onload = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height); setSaveMessage('Studio project opened 💜'); }; image.onerror = () => alert('Could not read the image in this project.'); image.src = payload.imageDataUrl; } catch { alert('Could not open that .masterstudio file.'); } finally { e.target.value = ''; } }} /></label></div>        {activeTool === 'notes' && <div><p>Your notes save automatically in this browser.</p><textarea value={note} onChange={e => updateNote(e.target.value)} placeholder="Write your ideas here..." aria-label="Your notes" style={{ ...fieldStyle, minHeight: 220, resize: 'vertical' }} /><p>{saveMessage || ('💜 ' + note.length + ' characters')}</p>{button('Download .masternotes', () => downloadMasterFile('MasterMine-Notes.masternotes', 'MasterMine Notes', '.masternotes', { note }))}<label>Open a .masternotes file<input style={fieldStyle} type="file" accept=".masternotes,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Notes'); if (typeof payload.note !== 'string') throw new Error('Invalid notes'); updateNote(payload.note); setSaveMessage('Notes opened 💜'); } catch { alert('Could not open that .masternotes file.'); } finally { e.target.value = ''; } }} /></label></div>        {activeTool === 'planner' && <div><p>Add tasks and tick them off when they're done.</p><form onSubmit={addTask} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}><input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="What do you need to do?" aria-label="New task" style={{ ...fieldStyle, flex: 1, minWidth: 180, margin: 0 }} /><button className="primary-btn" type="submit">+ Add task</button></form>{tasks.length === 0 ? <p>No tasks yet. Add your first task! ✨</p> : <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>{tasks.map(task => <li key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} aria-label={'Mark ' + task.title + ' as ' + (task.done ? 'not done' : 'done')} /><span style={{ flex: 1, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? .6 : 1 }}>{task.title}</span>{button('Delete', () => deleteTask(task.id))}</li>)}</ul>}<p>✅ {tasks.filter(t => t.done).length} of {tasks.length} tasks completed</p>{button('Download .masterplan', () => downloadMasterFile('MasterMine-Planner.masterplan', 'MasterMine Planner', '.masterplan', { tasks }))}<label>Open a .masterplan file<input style={fieldStyle} type="file" accept=".masterplan,application/json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { const payload = await readMasterFile(file, 'MasterMine Planner'); if (!Array.isArray(payload.tasks) || !payload.tasks.every(t => t && typeof t.title === 'string' && typeof t.done === 'boolean')) throw new Error('Invalid tasks'); setTasks(payload.tasks); persist('mm-tasks', payload.tasks, 'Planner list opened 💜'); } catch { alert('Could not open that .masterplan file.'); } finally { e.target.value = ''; } }} /></label></div>        <p style={{ marginTop: 18, fontSize: 13, opacity: .75 }}>💡 These are starter versions. Data is saved in this browser only unless stated otherwise; clearing browser data may remove it.</p>
      </section>}
      <footer>© 2010 MasterMine HUB · Made for your digital world 💜</footer>
    </main>
  </div>;
}
export default App;
