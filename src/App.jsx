import { useState } from 'react';
import './App.css';

const NEWS_URL = 'https://mastermine-news-app-7tby.bolt.host/';

const apps = [
  { name: 'MasterMine GX', desc: 'Your gaming browser & ChatMGX AI', icon: '🌐', color: 'purple' },
  { name: 'MasterMine NEWS', desc: 'Discover what is happening', icon: '📰', color: 'red', url: NEWS_URL },
  { name: 'MasterMine Docs', desc: 'Write documents and stories', icon: '📝', color: 'blue' },
  { name: 'MasterMine Slides', desc: 'Create amazing presentations', icon: '📊', color: 'orange' },
  { name: 'MasterMine Drive', desc: 'Your files, all in one place', icon: '☁️', color: 'cyan' },
  { name: 'MasterMine Sheets', desc: 'Spreadsheets, formulas & charts', icon: '📈', color: 'green' },
  { name: 'MasterMine Meet', desc: 'Meet and collaborate', icon: '🎥', color: 'blue' },
  { name: 'MasterMine Chat', desc: 'Messages and group chats', icon: '💬', color: 'purple' },
  { name: 'MasterMine Planner', desc: 'Organise your tasks', icon: '📅', color: 'orange' },
  { name: 'MasterMine Mail', desc: 'Your inbox, simplified', icon: '✉️', color: 'red' },
  { name: 'MasterMine Studio', desc: 'Bring your creative ideas to life', icon: '🎨', color: 'purple' },
  { name: 'MasterMine Notes', desc: 'Save your ideas and reminders', icon: '📒', color: 'green' },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function App() {
  const [search, setSearch] = useState('');
  const [activeTool, setActiveTool] = useState(null);
  const [note, setNote] = useState(() => readStorage('mm-notes', ''));
  const [tasks, setTasks] = useState(() => readStorage('mm-tasks', []));
  const [newTask, setNewTask] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const filteredApps = apps.filter((app) =>
    `${app.name} ${app.desc}`.toLowerCase().includes(search.toLowerCase())
  );

  function goToApps() {
    setActiveTool(null);
    document.getElementById('apps')?.scrollIntoView({ behavior: 'smooth' });
  }

  function launchApp(app) {
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (app.name === 'MasterMine Notes') {
      setActiveTool('notes');
      setSaveMessage('');
      return;
    }

    if (app.name === 'MasterMine Planner') {
      setActiveTool('planner');
      setSaveMessage('');
      return;
    }

    setActiveTool(app.name);
  }

  function updateNote(value) {
    setNote(value);
    setSaveMessage(
      writeStorage('mm-notes', value)
        ? 'Saved on this device 💜'
        : 'Could not save. Browser storage may be full.'
    );
  }

  function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;

    const updated = [
      ...tasks,
      { id: `${Date.now()}-${Math.random()}`, title, done: false },
    ];

    setTasks(updated);
    setSaveMessage(
      writeStorage('mm-tasks', updated)
        ? 'Task saved 💜'
        : 'Could not save this task.'
    );
    setNewTask('');
  }

  function toggleTask(id) {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setTasks(updated);
    writeStorage('mm-tasks', updated);
  }

  function deleteTask(id) {
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    writeStorage('mm-tasks', updated);
  }

  const activeApp = apps.find((app) => app.name === activeTool);
  const toolTitle = activeTool === 'notes'
    ? '📒 MasterMine Notes'
    : activeTool === 'planner'
      ? '📅 MasterMine Planner'
      : activeApp
        ? `${activeApp.icon} ${activeApp.name}`
        : '';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <span><strong>MasterMine</strong>HUB</span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={goToApps}>
            <span>⌂</span> Home
          </button>
          <button className="nav-item" onClick={() => launchApp(apps[4])}>
            <span>☁</span> My files
          </button>
          <button className="nav-item" onClick={() => {
            setSearch('');
            goToApps();
          }}>
            <span>★</span> Favourites
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="profile-icon">MM</div>
          <div>
            <strong>MasterMine ID</strong>
            <p>Your workspace</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace / <strong>{activeTool ? toolTitle : 'Home'}</strong>
          </div>
          <div className="topbar-badge">✦ MasterMine ecosystem</div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="hero-eyebrow">✦ YOUR DIGITAL WORLD</div>
            <h1>Welcome to MasterMine HUB.</h1>
            <p>All your apps. All your ideas. One place.</p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={goToApps}>
                Explore your apps ↗
              </button>
              <button className="secondary-btn" onClick={goToApps}>
                Discover HUB
              </button>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>
            <div className="hero-logo">MM<span>✦</span></div>
          </div>

          <div className="hero-caption">MADE FOR YOUR WORLD</div>
        </section>

        <section className="apps-section" id="apps">
          <div className="section-heading">
            <div>
              <div className="section-eyebrow">YOUR WORKSPACE</div>
              <h2>Your apps</h2>
              <p>{filteredApps.length} apps in your ecosystem</p>
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search apps..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search apps"
              />
            </label>
          </div>

          <div className="app-grid">
            {filteredApps.map((app) => (
              <article className="app-card" key={app.name}>
                <div className={`app-icon ${app.color}`}>{app.icon}</div>
                <div className="app-card-title">{app.name}</div>
                <p>{app.desc}</p>
                <button className="launch-btn" onClick={() => launchApp(app)}>
                  Open app <span>↗</span>
                </button>
              </article>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <p className="empty">No apps match that search. Try another name!</p>
          )}
        </section>

        {activeTool && (
          <section
            style={{
              background: 'var(--card-bg, #fff)',
              border: '1px solid var(--card-border, #dedbea)',
              borderRadius: '20px',
              padding: '24px',
              marginTop: '28px',
              color: 'var(--text-color, #242033)',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}>
              <h2 style={{ marginTop: 0 }}>{toolTitle}</h2>
              <button className="launch-btn" onClick={() => setActiveTool(null)}>
                Close ✕
              </button>
            </div>

            {activeTool === 'notes' && (
              <>
                <p>Your notes save automatically in this browser.</p>
                <textarea
                  value={note}
                  onChange={(event) => updateNote(event.target.value)}
                  placeholder="Write your ideas here..."
                  aria-label="Your notes"
                  style={{
                    width: '100%',
                    minHeight: '220px',
                    boxSizing: 'border-box',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #cfc8df',
                    font: 'inherit',
                    resize: 'vertical',
                  }}
                />
                <p>{saveMessage || `💜 ${note.length} characters`}</p>
              </>
            )}

            {activeTool === 'planner' && (
              <>
                <p>Add tasks and tick them off when they're done.</p>
                <form
                  onSubmit={addTask}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    placeholder="What do you need to do?"
                    aria-label="New task"
                    style={{
                      flex: '1',
                      minWidth: '180px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #cfc8df',
                      font: 'inherit',
                    }}
                  />
                  <button className="primary-btn" type="submit">+ Add task</button>
                </form>

                {tasks.length === 0 ? (
                  <p>No tasks yet. Add your first task! ✨</p>
                ) : (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'grid',
                    gap: '10px',
                  }}>
                    {tasks.map((task) => (
                      <li key={task.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          aria-label={`Mark ${task.title} as ${task.done ? 'not done' : 'done'}`}
                        />
                        <span style={{
                          flex: 1,
                          textDecoration: task.done ? 'line-through' : 'none',
                          opacity: task.done ? 0.6 : 1,
                        }}>
                          {task.title}
                        </span>
                        <button className="launch-btn" onClick={() => deleteTask(task.id)}>
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p>✅ {tasks.filter((task) => task.done).length} of {tasks.length} tasks completed</p>
                {saveMessage && <p>{saveMessage}</p>}
              </>
            )}

            {activeTool !== 'notes' && activeTool !== 'planner' && (
              <div>
                <p>Welcome to {activeApp?.name}! Its full features haven't been built yet.</p>
                <p>💜 It's part of the MasterMine HUB ecosystem.</p>
              </div>
            )}
          </section>
        )}

        <footer>© 2010 MasterMine HUB · Made for your digital world 💜</footer>
      </main>
    </div>
  );
}

export default App;
