"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, Bookmark, BookmarkCheck,
  CalendarDays, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Code2,
  Copy, Download, ExternalLink, Flame, FlaskConical, LayoutDashboard,
  Library, Menu, MessageSquareText, Moon, NotebookPen, Search, ShieldCheck, Siren, Sun,
  Target, X, Zap
} from "lucide-react";
import {
  assignmentList, chapters, glossary, incidents, labs, navItems, questions, roadmap, scripts
} from "../../lib/course";

const iconMap = {
  LayoutDashboard, BookOpen, CalendarDays, FlaskConical, ClipboardCheck, Code2,
  MessageSquareText, Siren, Library, BarChart3, NotebookPen
};

const initialState = {
  chapters: [], labs: [], roadmap: [], bookmarks: [], notes: {}, quizResults: {},
  visits: [], studyDates: [], lastChapter: 1, startedAt: null, lastStudyDate: null
};

function CodeBlock({ code, language = "sql", onCopy, onDownload }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopy?.("Clipboard access was unavailable. Select and copy the code manually.");
    }
  }
  return (
    <div className="code-block">
      <div className="code-head">
        <span>{language.toUpperCase()}</span>
        <div style={{ display: "flex", gap: 7 }}>
          {onDownload && <button className="icon-button" title="Download script" onClick={onDownload}><Download size={13} /></button>}
          <button className="icon-button" title="Copy code" onClick={copy}><Copy size={13} />{copied && <span style={{ marginLeft: 5 }}>Copied</span>}</button>
        </div>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function ProgressBar({ value }) {
  return <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

function Badge({ children, tone }) {
  return <span className={`badge ${tone || ""}`}>{children}</span>;
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subtitle">{description}</p></div>
      {action}
    </div>
  );
}

export default function Academy({ path = [] }) {
  const route = path.join("/") || "dashboard";
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageError, setStorageError] = useState("");
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("dba-academy-progress");
        if (saved) setState({ ...initialState, ...JSON.parse(saved) });
        setReady(true);
      } catch {
        setStorageAvailable(false);
        setStorageError("Progress could not be loaded from local storage. Your current browser may be blocking local storage.");
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || !storageAvailable) return;
    let timer;
    try {
      localStorage.setItem("dba-academy-progress", JSON.stringify(state));
    } catch {
      timer = window.setTimeout(() => setStorageError("Progress could not be saved. Check browser storage availability and space."), 0);
    }
    return () => window.clearTimeout(timer);
  }, [ready, state, storageAvailable]);

  useEffect(() => {
    if (!ready || route === "dashboard" || route === "/") return;
    const visitKey = route;
    const timer = window.setTimeout(() => setState((current) => {
        const visits = [visitKey, ...current.visits.filter((entry) => entry !== visitKey)].slice(0, 6);
        const chapterMatch = route.match(/^chapters\/chapter-(\d+)$/);
        const lastStudyDate = new Date().toISOString().slice(0, 10);
        return {
          ...current,
          visits,
          studyDates: [...new Set([...(current.studyDates || []), lastStudyDate])].slice(-60),
          lastChapter: chapterMatch ? Number(chapterMatch[1]) : current.lastChapter,
          lastStudyDate,
          startedAt: current.startedAt || lastStudyDate
        };
      }), 0);
    return () => window.clearTimeout(timer);
  }, [ready, route]);

  const setNotice = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };
  const change = (field, value) => setState((current) => ({ ...current, [field]: value }));
  const chapterDone = (id) => change("chapters", state.chapters.includes(id) ? state.chapters.filter((x) => x !== id) : [...state.chapters, id]);
  const labDone = (id) => change("labs", state.labs.includes(id) ? state.labs.filter((x) => x !== id) : [...state.labs, id]);
  const dayDone = (day) => change("roadmap", state.roadmap.includes(day) ? state.roadmap.filter((x) => x !== day) : [...state.roadmap, day]);
  const bookmark = (id) => change("bookmarks", state.bookmarks.includes(id) ? state.bookmarks.filter((x) => x !== id) : [...state.bookmarks, id]);
  const markQuiz = (id, correct) => change("quizResults", { ...state.quizResults, [id]: correct });
  const saveNote = (id, value) => change("notes", { ...state.notes, [id]: value });

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return [
      ...chapters.filter((item) => `${item.title} ${item.summary} ${item.lesson}`.toLowerCase().includes(term)).slice(0, 5)
        .map((item) => ({ title: item.title, subtitle: `Chapter ${item.id}`, href: `/chapters/${item.slug}` })),
      ...labs.filter((item) => item.title.toLowerCase().includes(term)).slice(0, 3)
        .map((item) => ({ title: item.title, subtitle: `Lab ${String(item.id).padStart(2, "0")}`, href: `/labs/${item.id}` })),
      ...glossary.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(term)).slice(0, 3)
        .map((item) => ({ title: item.term, subtitle: "Glossary", href: "/glossary" }))
    ].slice(0, 8);
  }, [search]);

  const titleForRoute = route.split("/")[0].replaceAll("-", " ");
  const chapterSlug = route.startsWith("chapters/") ? route.split("/")[1] : "";
  const chapter = chapters.find((item) => item.slug === chapterSlug);
  const lab = route.startsWith("labs/") ? labs.find((item) => item.id === Number(route.split("/")[1])) : null;
  const day = route.startsWith("roadmap/day-") ? roadmap.find((item) => item.day === Number(route.split("/")[1].replace("day-", ""))) : null;
  const incident = route.startsWith("war-room/") ? incidents.find((item) => item.id === Number(route.split("/")[1])) : null;
  const completedCount = state.chapters.length + state.labs.length + state.roadmap.length;
  const allCount = chapters.length + labs.length + roadmap.length;
  const overall = Math.round(completedCount / allCount * 100);
  const continueChapter = chapters.find((item) => item.id === state.lastChapter) || chapters[0];
  const selectedNav = route === "dashboard" ? "/" : `/${route.split("/")[0]}`;

  return (
    <div className="app-shell">
      {menuOpen && <button aria-label="Close navigation" onClick={() => setMenuOpen(false)} style={{ background: "rgba(20,30,55,.22)", border: 0, inset: 0, position: "fixed", zIndex: 15 }} />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <Link className="brand" href="/">
          <span className="brand-mark"><ShieldCheck size={19} /></span>
          <span><span className="brand-name">Production DBA<br />Academy</span><span className="brand-sub">SQL Server learning path</span></span>
        </Link>
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="nav-caption">{group.section}</div>
            {group.links.map(([label, href, icon]) => {
              const Icon = iconMap[icon];
              return <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link ${selectedNav === href ? "active" : ""}`}>
                <Icon size={15} strokeWidth={1.8} />{label}
                {href === "/book" && <span className="nav-count">20</span>}
                {href === "/labs" && <span className="nav-count">50</span>}
              </Link>;
            })}
          </div>
        ))}
        <div className="sidebar-foot">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span>Course progress</span><strong>{overall}%</strong></div>
          <ProgressBar value={overall} />
          <div style={{ marginTop: 10 }}>A guided foundation—not a substitute for supervised production experience.</div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={17} /></button>
          <div className="top-actions">
            <div className="search-box"><Search size={14} color="#9aa3b2" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search lessons, labs..." aria-label="Search lessons and labs" /></div>
            <button className="icon-button" aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? <Moon size={15} /> : <Sun size={15} />}</button>
          </div>
          {search && <div className="card" style={{ background: "#fff", boxShadow: "0 10px 30px #18213a18", maxHeight: 340, overflow: "auto", padding: 8, position: "absolute", right: 34, top: 54, width: 290, zIndex: 25 }}>
            {searchResults.length ? searchResults.map((item) => <Link key={`${item.href}-${item.title}`} href={item.href} onClick={() => setSearch("")} className="list-row" style={{ border: 0, padding: 9 }}>
              <span className="row-icon"><Search size={13} /></span><span className="row-copy"><span className="row-title">{item.title}</span><span className="row-sub">{item.subtitle}</span></span>
            </Link>) : <div className="empty-state" style={{ padding: 18 }}>No matching lesson or lab.</div>}
          </div>}
        </header>
        <main className="main-content">
          <nav className="crumbs breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Academy</Link><ChevronRight size={12} aria-hidden="true" />
            <span style={{ textTransform: "capitalize" }}>{titleForRoute}</span>
          </nav>
          {storageError && <div className="callout warning" role="status">{storageError}</div>}
          {toast && <div className="callout" role="status">{toast}</div>}
          {chapter ? <ChapterPage chapter={chapter} state={state} onDone={() => chapterDone(chapter.id)} onBookmark={() => bookmark(chapter.id)} onNote={(value) => saveNote(`chapter-${chapter.id}`, value)} onNotice={setNotice} onQuiz={(correct) => markQuiz(`chapter-${chapter.id}`, correct)} /> :
            lab ? <LabPage lab={lab} done={state.labs.includes(lab.id)} onDone={() => labDone(lab.id)} onNotice={setNotice} /> :
              day ? <DayPage day={day} done={state.roadmap.includes(day.day)} onDone={() => dayDone(day.day)} /> :
                incident ? <IncidentPage incident={incident} onNotice={setNotice} /> :
                  <SectionPage route={route} state={state} overall={overall} completedCount={completedCount}
                    onChapterDone={chapterDone} onDayDone={dayDone} onBookmark={bookmark}
                    onQuiz={markQuiz} onNote={saveNote} onNotice={setNotice}
                    continueChapter={continueChapter} search={search} />}
          <div className="footer-note">Technical examples are for isolated learning environments. Verify SQL Server version, edition, permissions, and current Microsoft documentation before applying a procedure.</div>
        </main>
      </div>
    </div>
  );
}

function SectionPage({ route, state, overall, completedCount, onChapterDone, onDayDone, onBookmark, onQuiz, onNote, onNotice, continueChapter }) {
  switch (route) {
    case "dashboard": return <Dashboard state={state} overall={overall} completedCount={completedCount} continueChapter={continueChapter} />;
    case "book": return <BookPage state={state} />;
    case "roadmap": return <RoadmapPage state={state} onDayDone={onDayDone} />;
    case "labs": return <LabsPage state={state} />;
    case "assignments": return <AssignmentsPage state={state} onChapterDone={onChapterDone} />;
    case "scripts": return <ScriptsPage onNotice={onNotice} />;
    case "interview": return <InterviewPage state={state} onQuiz={onQuiz} />;
    case "interview/final": return <InterviewPage state={state} onQuiz={onQuiz} finalExam />;
    case "war-room": return <WarRoomPage />;
    case "glossary": return <GlossaryPage />;
    case "progress": return <ProgressPage state={state} overall={overall} completedCount={completedCount} onReset={() => {
      if (window.confirm("Reset all chapters, labs, roadmap progress, bookmarks, notes, and quiz results on this browser?")) {
        localStorage.removeItem("dba-academy-progress");
        window.location.reload();
      }
    }} />;
    case "notes": return <NotesPage state={state} onNote={onNote} onBookmark={onBookmark} />;
    default: return <Dashboard state={state} overall={overall} completedCount={completedCount} continueChapter={continueChapter} />;
  }
}

function Dashboard({ state, overall, completedCount, continueChapter }) {
  const nextDay = roadmap.find((item) => !state.roadmap.includes(item.day)) || roadmap[59];
  const quizEntries = Object.values(state.quizResults);
  const correctCount = quizEntries.filter(Boolean).length;
  const studyDates = new Set(state.studyDates || []);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (!studyDates.has(todayKey)) today.setDate(today.getDate() - 1);
  let streak = 0;
  while (studyDates.has(today.toISOString().slice(0, 10))) {
    streak += 1;
    today.setDate(today.getDate() - 1);
  }
  const recent = state.visits.map((visit) => {
    const match = visit.match(/^chapters\/(chapter-\d+)$/);
    return match ? chapters.find((item) => item.slug === match[1]) : null;
  }).filter(Boolean).slice(0, 3);
  return <>
    <PageHeading eyebrow="Your learning workspace" title="Good progress starts with a clear next step." description="Build practical SQL Server DBA skills through focused lessons, safe labs, and realistic incident practice." />
    <div className="stat-grid">
      <StatCard label="Overall completion" value={`${overall}%`} note={`${completedCount} learning items completed`} icon={Target} />
      <StatCard label="Chapters completed" value={`${state.chapters.length} / 20`} note="Book progress" icon={BookOpen} />
      <StatCard label="Labs completed" value={`${state.labs.length} / 50`} note="Hands-on practice" icon={FlaskConical} />
      <StatCard label="Quiz accuracy" value={quizEntries.length ? `${Math.round(correctCount / quizEntries.length * 100)}%` : "—"} note={quizEntries.length ? `${quizEntries.length} answers recorded` : "Take a knowledge check"} icon={Zap} />
    </div>
    <div className="dashboard-grid">
      <div>
        <div className="card continue-card">
          <div className="eyebrow" style={{ color: "#acbcff" }}>Continue learning</div>
          <h2 style={{ color: "#fff", fontSize: 21, margin: "9px 0 7px" }}>Chapter {continueChapter.id}: {continueChapter.title}</h2>
          <p className="muted" style={{ fontSize: 11, lineHeight: 1.7, margin: "0 0 17px", maxWidth: 475 }}>{continueChapter.summary}</p>
          <Link className="button dark-secondary" href={`/chapters/${continueChapter.slug}`}>Open chapter <ArrowRight size={13} /></Link>
        </div>
        <div className="card panel" style={{ marginTop: 17 }}>
          <div className="panel-heading"><h2>Continue your roadmap</h2><Link className="small muted" href="/roadmap">View all <ArrowRight size={12} /></Link></div>
          <div className="list-row">
            <div className="row-icon"><CalendarDays size={15} /></div>
            <div className="row-copy"><div className="row-title">Day {nextDay.day} · {nextDay.focus}</div><div className="row-sub">{nextDay.objective}</div></div>
            <Link className="button secondary small-button" href={`/roadmap/day-${nextDay.day}`}>Open</Link>
          </div>
          <div style={{ marginTop: 14 }}><div className="stat-top"><span>60-day roadmap</span><span>{state.roadmap.length}/60 days</span></div><div style={{ marginTop: 8 }}><ProgressBar value={state.roadmap.length / 60 * 100} /></div></div>
        </div>
        <div className="card panel" style={{ marginTop: 17 }}>
          <div className="panel-heading"><h2>Recently visited</h2><span className="small muted">Pick up where you left off</span></div>
          {recent.length ? recent.map((item) => <Link key={item.id} className="list-row" href={`/chapters/${item.slug}`}>
            <div className="row-icon"><BookOpen size={14} /></div><div className="row-copy"><div className="row-title">Chapter {item.id}: {item.title}</div><div className="row-sub">{item.part}</div></div><ChevronRight size={14} color="#a0a8b7" />
          </Link>) : <div className="empty-state" style={{ padding: 18 }}>Your recently visited chapters will appear here.</div>}
        </div>
      </div>
      <div>
        <div className="card panel">
          <div className="panel-heading"><h2>Today&apos;s focus</h2><Badge tone="blue">60-day plan</Badge></div>
          <div className="row-title" style={{ lineHeight: 1.6 }}>{nextDay.objective}</div>
          <div className="row-sub" style={{ lineHeight: 1.7, marginTop: 9 }}>{nextDay.exercise}</div>
          <Link className="button secondary small-button" href={`/roadmap/day-${nextDay.day}`} style={{ marginTop: 15 }}>View daily task <ChevronRight size={12} /></Link>
        </div>
        <div className="card panel" style={{ marginTop: 17 }}>
          <div className="panel-heading"><h2>Learning streak</h2><Flame size={17} color="#d58b23" /></div>
          <div className="stat-value" style={{ marginTop: 0 }}>{streak} {streak === 1 ? "day" : "days"}</div>
          <div className="row-sub">Consecutive study days recorded in this browser. Keep practicing regularly.</div>
        </div>
        <div className="callout warning" style={{ marginTop: 17 }}><strong>Production safety</strong><br />Practice only on a separate Developer Edition lab. Never test destructive commands on production systems.</div>
      </div>
    </div>
  </>;
}

function StatCard({ label, value, note, icon: Icon }) {
  return <div className="card stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={15} /></span></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

function BookPage({ state }) {
  const [filter, setFilter] = useState("All");
  const shown = chapters.filter((item) => filter === "All" || item.level === filter);
  const parts = [...new Set(shown.map((item) => item.part))];
  return <>
    <PageHeading eyebrow="The complete book" title="SQL Server Production DBA foundations" description="Twenty chapters connecting database fundamentals to the day-to-day responsibilities of a production DBA." />
    <div className="tab-row">{["All", "Beginner", "Intermediate", "Advanced"].map((item) => <button key={item} className={`tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
    {parts.map((part) => <section key={part}><div className="part-label">{part}</div><div className="card">
      {shown.filter((item) => item.part === part).map((item) => <Link key={item.id} className="chapter-row list-row" href={`/chapters/${item.slug}`}>
        <span className="chapter-number">{state.chapters.includes(item.id) ? <Check size={14} color="#168263" /> : String(item.id).padStart(2, "0")}</span>
        <span className="row-copy"><span className="row-title">Chapter {item.id} · {item.title}</span><span className="row-sub">{item.summary}</span></span>
        <Badge>{item.level}</Badge><ChevronRight size={14} color="#a0a8b7" />
      </Link>)}
    </div></section>)}
  </>;
}

function ChapterPage({ chapter, state, onDone, onBookmark, onNote, onNotice, onQuiz }) {
  const previous = chapters[chapter.id - 2];
  const next = chapters[chapter.id];
  const isBookmarked = state.bookmarks.includes(chapter.id);
  return <>
    <PageHeading eyebrow={`Chapter ${String(chapter.id).padStart(2, "0")} · ${chapter.part}`} title={chapter.title} description={chapter.summary}
      action={<button className="button secondary" onClick={onBookmark}>{isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}{isBookmarked ? "Bookmarked" : "Bookmark"}</button>} />
    <div className="content-grid">
      <article className="article">
        <div className="card panel">
          <div className="eyebrow">Learning objectives</div>
          <ul>{chapter.objectives.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <h2>How it works</h2><p>{chapter.lesson}</p>
        <h2>In a company</h2><p>{chapter.example}</p>
        <div className="callout"><strong>DBA perspective</strong><br />Connect technical evidence to business impact. Record what you checked, what changed, who approved it, and how you validated the outcome.</div>
        <h2>Try it in your lab</h2><p>Use an isolated SQL Server Developer Edition environment. Confirm your selected instance and database before running any command.</p>
        <ol>{chapter.tasks.map((task) => <li key={task}>{task}</li>)}</ol>
        <CodeBlock code={chapter.code} onCopy={(message) => message && onNotice(message)} />
        <h3>Expected result</h3><p>{chapter.output}</p>
        <div className="callout warning"><strong>Safety note</strong><br />{chapter.caution}</div>
        <h2>Practical assignment</h2>
        <div className="card panel"><p style={{ marginTop: 0 }}>Complete the following evidence-based tasks:</p><ul>{chapter.tasks.map((task) => <li key={task}>{task}</li>)}</ul><label style={{ alignItems: "flex-start", display: "flex", gap: 9, fontSize: 11, marginTop: 13 }}><input type="checkbox" checked={state.chapters.includes(chapter.id)} onChange={onDone} /> I completed the chapter and saved my lab evidence.</label></div>
        <h2>Knowledge check</h2>
        <InlineQuiz chapter={chapter} onQuiz={onQuiz} onNotice={onNotice} />
        <h2>Personal notes</h2><textarea className="form-control note-area" defaultValue={state.notes[`chapter-${chapter.id}`] || ""} onChange={(event) => onNote(event.target.value)} placeholder="Capture decisions, questions, and lab results..." />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          {previous ? <Link className="button secondary" href={`/chapters/${previous.slug}`}><ArrowLeft size={13} /> Previous chapter</Link> : <span />}
          {next && <Link className="button" href={`/chapters/${next.slug}`}>Next chapter <ArrowRight size={13} /></Link>}
        </div>
      </article>
      <aside className="right-rail">
        <div className="card rail-card"><div className="rail-title">On this page</div>{["How it works", "In a company", "Try it in your lab", "Practical assignment", "Knowledge check"].map((item) => <Link className="rail-link" key={item} href="#">{item}</Link>)}</div>
        <div className="card rail-card"><div className="rail-title">Chapter progress</div><div className="small" style={{ marginBottom: 10 }}>{state.chapters.includes(chapter.id) ? "Completed" : "Not completed"}</div><ProgressBar value={state.chapters.includes(chapter.id) ? 100 : 0} /></div>
        <div className="card rail-card"><div className="rail-title">Official references</div><Link className="rail-link" href="https://learn.microsoft.com/en-us/sql/sql-server/" target="_blank" rel="noreferrer">SQL Server documentation <ExternalLink size={10} /></Link></div>
      </aside>
    </div>
  </>;
}

function InlineQuiz({ chapter, onQuiz, onNotice }) {
  const [selected, setSelected] = useState(-1);
  const [checked, setChecked] = useState(false);
  const question = `Which approach best reflects a production-safe DBA practice for ${chapter.title.toLowerCase()}?`;
  const options = ["Gather evidence, work in a lab or approved change, and validate the outcome.", "Apply an unreviewed change directly to production.", "Assume one command's success guarantees service recovery.", "Skip documenting the result when the issue appears resolved."];
  return <div className="card panel"><div className="row-title">{question}</div>{options.map((option, index) => <button key={option} className={`choice ${selected === index ? "selected" : ""} ${checked && index === 0 ? "correct" : ""} ${checked && selected === index && index !== 0 ? "incorrect" : ""}`} onClick={() => { setSelected(index); setChecked(false); }}>{String.fromCharCode(65 + index)}. {option}</button>)}
    <button className="button small-button" disabled={selected < 0} onClick={() => { const correct = selected === 0; setChecked(true); onQuiz(correct); onNotice(correct ? "Chapter knowledge check saved." : "Answer saved. Review the safety principle and try again."); }}>{checked ? "Check again" : "Check answer"}</button>
    {checked && <p className="small muted" style={{ lineHeight: 1.6 }}>{selected === 0 ? "Correct. Production work depends on scoped evidence, approval, a recovery path, and validation." : "Not quite. Prefer evidence-led, approved, reversible actions and verify the service afterward."}</p>}
  </div>;
}

function RoadmapPage({ state, onDayDone }) {
  const [filter, setFilter] = useState("All");
  const groups = [...new Set(roadmap.map((item) => item.focus))].filter((group) => filter === "All" || group === filter);
  return <>
    <PageHeading eyebrow="60-day guided plan" title="A structured path from fundamentals to operations" description="Each day pairs a lesson with a practical exercise and an evidence-based assignment. This is a foundation, not a guarantee of production readiness." />
    <div className="card panel" style={{ marginBottom: 17 }}><div className="stat-top"><span>Roadmap progress</span><span>{state.roadmap.length} / 60 days</span></div><div style={{ marginTop: 10 }}><ProgressBar value={state.roadmap.length / 60 * 100} /></div></div>
    <div className="tab-row">{["All", ...new Set(roadmap.map((item) => item.focus))].map((item) => <button className={`tab ${filter === item ? "active" : ""}`} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    {groups.map((group) => <section key={group}><div className="part-label">{group}</div><div className="card">{roadmap.filter((item) => item.focus === group).map((item) => <Link className="list-row" href={`/roadmap/day-${item.day}`} key={item.day} style={{ padding: "12px 15px" }}>
      <span className="chapter-number">{state.roadmap.includes(item.day) ? <Check size={14} color="#168263" /> : `D${String(item.day).padStart(2, "0")}`}</span><span className="row-copy"><span className="row-title">Day {item.day}: {item.objective}</span><span className="row-sub">{item.exercise}</span></span><ChevronRight size={14} color="#a0a8b7" />
    </Link>)}</div></section>)}
  </>;
}

function DayPage({ day, done, onDone }) {
  return <>
    <PageHeading eyebrow={`Roadmap · Day ${day.day}`} title={day.focus} description={day.objective} action={<Badge tone={done ? "green" : "blue"}>{done ? "Completed" : "In progress"}</Badge>} />
    <div className="content-grid"><article className="article">
      <div className="card panel"><div className="eyebrow">Today&apos;s lesson</div><p>{day.lesson}</p><h3>Learning objective</h3><p>{day.objective}</p></div>
      <h2>Practical exercise</h2><p>{day.exercise}</p>
      <h2>Command to try</h2><CodeBlock code={day.command} /><h3>Expected output</h3><p>{day.expected}</p>
      <h2>Assignment</h2><p>{day.assignment}</p><h2>Knowledge check</h2><div className="callout">{day.quiz}</div>
      <h2>Completion checklist</h2><div className="card panel">{day.checklist.map((item) => <div key={item} className="list-row"><CheckCircle2 size={15} color="#8390a3" /><span className="row-title">{item}</span></div>)}<label style={{ display: "flex", gap: 9, fontSize: 11, marginTop: 15 }}><input type="checkbox" checked={done} onChange={onDone} /> Mark day {day.day} complete</label></div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>{day.day > 1 && <Link className="button secondary" href={`/roadmap/day-${day.day - 1}`}><ArrowLeft size={13} /> Previous day</Link>}{day.day < 60 && <Link className="button" href={`/roadmap/day-${day.day + 1}`}>Next day <ArrowRight size={13} /></Link>}</div>
    </article><aside className="right-rail"><div className="card rail-card"><div className="rail-title">Study scope</div><p className="small muted">Allow 45–90 minutes for reading, hands-on practice, and evidence notes. Adjust the pace to your environment.</p></div></aside></div>
  </>;
}

function LabsPage({ state }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const shown = labs.filter((item) => (filter === "All" || item.level === filter) && item.title.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeading eyebrow="Hands-on practice" title="Practical lab library" description="Fifty guided labs for a dedicated local SQL Server Developer Edition environment. Commands are examples—read each warning before execution." />
    <div className="card panel" style={{ marginBottom: 15 }}><div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 10 }}><div className="search-box" style={{ flex: "1 1 220px" }}><Search size={14} color="#9aa3b2" /><input placeholder="Filter labs..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="tab-row" style={{ border: 0, margin: 0 }}>{["All", "Beginner", "Intermediate", "Advanced"].map((item) => <button key={item} className={`tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div></div></div>
    <div className="card">{shown.map((item) => <Link href={`/labs/${item.id}`} key={item.id} className="list-row" style={{ padding: "13px 15px" }}>
      <span className="chapter-number">{state.labs.includes(item.id) ? <Check size={14} color="#168263" /> : String(item.id).padStart(2, "0")}</span><span className="row-copy"><span className="row-title">{item.title}</span><span className="row-sub">{item.topic} · {item.objective}</span></span><Badge>{item.level}</Badge><ChevronRight size={14} color="#a0a8b7" />
    </Link>)}</div>
    <p className="small muted" style={{ marginTop: 10 }}>Showing {shown.length} of 50 labs.</p>
  </>;
}

function LabPage({ lab, done, onDone, onNotice }) {
  return <>
    <PageHeading eyebrow={`Practical lab ${String(lab.id).padStart(2, "0")} · ${lab.level}`} title={lab.title} description={lab.objective} />
    <div className="content-grid"><article className="article">
      <div className="card panel"><div className="eyebrow">Prerequisites</div><p>{lab.prerequisite}</p><h3>Environment</h3><p>Dedicated local SQL Server Developer Edition instance and SSMS. Never use a production or shared system for exercises.</p></div>
      <h2>Instructions</h2><ol>{lab.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <h2>Script</h2><CodeBlock code={lab.command} onCopy={(message) => message && onNotice(message)} />
      <h3>Expected output</h3><p>{lab.expected}</p><div className="callout warning"><strong>Important warning</strong><br />{lab.warning}</div>
      <h2>Completion criteria</h2><div className="card panel"><label style={{ display: "flex", gap: 9, fontSize: 11 }}><input type="checkbox" checked={done} onChange={onDone} /> I verified the result and saved my lab notes.</label></div>
      <div style={{ marginTop: 20 }}><Link className="button secondary" href="/labs"><ArrowLeft size={13} /> Back to labs</Link></div>
    </article><aside className="right-rail"><div className="card rail-card"><div className="rail-title">Lab details</div><div className="rail-link">Topic: {lab.topic}</div><div className="rail-link">Difficulty: {lab.level}</div><div className="rail-link">Lab number: {lab.id} of 50</div></div></aside></div>
  </>;
}

function AssignmentsPage({ state, onChapterDone }) {
  return <>
    <PageHeading eyebrow="Apply what you learn" title="Chapter assignments" description="Assignments ask you to produce practical evidence—not just read through a topic. Save your results in chapter notes." />
    <div className="card">{assignmentList.map((item) => <div className="list-row" key={item.id} style={{ padding: "14px 16px" }}><span className="row-icon"><ClipboardCheck size={15} /></span><span className="row-copy"><Link className="row-title" href={`/chapters/${chapters[item.chapterId - 1].slug}`}>{item.title}</Link><span className="row-sub">{item.description}</span></span><label className="small" style={{ alignItems: "center", display: "flex", gap: 6 }}><input type="checkbox" checked={state.chapters.includes(item.chapterId)} onChange={() => onChapterDone(item.chapterId)} />Done</label></div>)}</div>
  </>;
}

function ScriptsPage({ onNotice }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = ["All", ...new Set(scripts.map((item) => item.category))];
  const shown = scripts.filter((item) => (category === "All" || item.category === category) && `${item.title} ${item.purpose}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeading eyebrow="Copy-ready reference" title="SQL script library" description="Read-only starting points for common operational checks. Verify permissions, version support, and context before use." />
    <div className="card panel" style={{ marginBottom: 15 }}><div className="search-box" style={{ width: "100%" }}><Search size={14} color="#9aa3b2" /><input placeholder="Search scripts..." value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
    <div className="tab-row">{categories.map((item) => <button key={item} className={`tab ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {shown.map((item) => <div className="card panel" key={item.title} style={{ marginBottom: 12 }}>
      <div className="panel-heading"><div><h3>{item.title}</h3><div className="row-sub">{item.category}</div></div><Badge tone="blue">Read only</Badge></div>
      <p className="small muted" style={{ lineHeight: 1.7 }}>{item.purpose}</p><div className="small muted">Permissions: {item.permissions}</div>
      <CodeBlock code={item.code} onCopy={(message) => message && onNotice(message)} onDownload={() => downloadText(`${item.title.toLowerCase().replaceAll(" ", "-")}.sql`, item.code)} />
      <div className="callout warning">Check target instance and selected database. This script provides a starting point, not a substitute for a reviewed production monitoring solution.</div>
    </div>)}
    <p className="small muted">The library intentionally avoids automatic session termination, shrinking, backup deletion, or unreviewed configuration changes.</p>
  </>;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

function InterviewPage({ state, onQuiz, finalExam = false }) {
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(0);
  const examQuestions = finalExam ? questions.filter((_, index) => index % 4 === 0) : questions;
  const categories = finalExam ? ["All"] : ["All", ...new Set(questions.map((item) => item.category))];
  const filtered = examQuestions.filter((item) => category === "All" || item.category === category);
  const pages = Math.ceil(filtered.length / 10);
  const visible = filtered.slice(page * 10, page * 10 + 10);
  const recorded = Object.keys(state.quizResults).length;
  const examAnswered = examQuestions.filter((item) => state.quizResults[item.id] !== undefined).length;
  const examCorrect = examQuestions.filter((item) => state.quizResults[item.id] === true).length;
  return <>
    <PageHeading eyebrow={finalExam ? "Final examination" : "Assessment & interview preparation"} title={finalExam ? "50-question final exam" : "Build your DBA judgment"} description={finalExam ? "Complete 50 multiple-choice questions across the curriculum. Your answers are recorded locally as you go." : "A 200-question practice bank across the full curriculum. Questions emphasize evidence, safe decisions, and operational reasoning."} action={!finalExam && <Link className="button" href="/interview/final">Start final exam <ArrowRight size={13} /></Link>} />
    <div className="stat-grid"><StatCard label={finalExam ? "Exam questions" : "Question bank"} value={finalExam ? "50" : "200"} note={finalExam ? "Across all 20 chapters" : "10 per chapter"} icon={MessageSquareText} /><StatCard label={finalExam ? "Exam answered" : "Answered"} value={finalExam ? `${examAnswered} / 50` : recorded} note={finalExam && examAnswered ? `${Math.round(examCorrect / examAnswered * 100)}% correct so far` : "Saved in this browser"} icon={CheckCircle2} /><StatCard label="Final practical" value="1" note="End-to-end DBA exercise" icon={FlaskConical} /><StatCard label="Study topics" value="20" note="One set per chapter" icon={Target} /></div>
    <div className="tab-row">{categories.map((item) => <button key={item} className={`tab ${category === item ? "active" : ""}`} onClick={() => { setCategory(item); setPage(0); }}>{item}</button>)}</div>
    {visible.map((question) => <QuestionCard key={question.id} question={question} state={state} onQuiz={onQuiz} />)}
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}><button className="button secondary" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ArrowLeft size={13} /> Previous</button><span className="small muted" style={{ alignSelf: "center" }}>Page {page + 1} of {Math.max(1, pages)} · {filtered.length} questions</span><button className="button secondary" disabled={page >= pages - 1} onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}>Next <ArrowRight size={13} /></button></div>
    {finalExam && <div className="callout" style={{ marginTop: 18 }}>Exam progress is stored per question. Review incorrect answers and retake any item; use the practical assessment below as a separate exercise.</div>}
    <div className="callout" style={{ marginTop: 18 }}>Final practical assessment: create an inventory, define recovery objectives, verify a lab restore, review access, investigate a simulated incident, and present evidence and follow-up actions.</div>
  </>;
}

function QuestionCard({ question, state, onQuiz }) {
  const [selected, setSelected] = useState(-1);
  const saved = state.quizResults[question.id];
  const [checked, setChecked] = useState(saved !== undefined);
  return <div className="card panel" style={{ marginBottom: 12 }}>
    <div className="panel-heading"><Badge>{question.category}</Badge><span className="small muted">Chapter {question.chapterId} · Question {question.id.split("-")[1]}/10</span></div>
    <div className="row-title" style={{ fontSize: 12, margin: "12px 0" }}>{question.question}</div>
    {question.options.map((option, index) => <button key={option} className={`choice ${selected === index ? "selected" : ""} ${checked && index === question.answer ? "correct" : ""} ${checked && selected === index && index !== question.answer ? "incorrect" : ""}`} onClick={() => { setSelected(index); setChecked(false); }}>{String.fromCharCode(65 + index)}. {option}</button>)}
    <div style={{ alignItems: "center", display: "flex", gap: 12, marginTop: 11 }}><button className="button small-button" disabled={selected < 0} onClick={() => { const correct = selected === question.answer; setChecked(true); onQuiz(question.id, correct); }}>{checked ? "Update answer" : "Check answer"}</button>{checked && <span className="small muted">{selected === question.answer ? "Correct" : "Review the explanation"}</span>}</div>
    {checked && <div className="callout" style={{ marginBottom: 0 }}>{question.explanation}</div>}
  </div>;
}

function WarRoomPage() {
  return <>
    <PageHeading eyebrow="Production DBA War Room" title="Investigate before you act" description="Twenty incident simulations. Choose a first response, then review the root cause, resolution, and validation evidence." />
    <div className="callout warning"><strong>Training mode:</strong> Scenarios are fictional. Use incident procedures and change approvals in real environments; do not make unreviewed production changes.</div>
    <div className="card">{incidents.map((item) => <Link key={item.id} href={`/war-room/${item.id}`} className="list-row" style={{ padding: "14px 15px" }}><span className="chapter-number">{String(item.id).padStart(2, "0")}</span><span className="row-copy"><span className="row-title">{item.title}</span><span className="row-sub">{item.situation}</span></span><Badge tone="amber">Scenario</Badge><ChevronRight size={14} color="#a0a8b7" /></Link>)}</div>
  </>;
}

function IncidentPage({ incident }) {
  const [choice, setChoice] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  return <>
    <PageHeading eyebrow={`War Room · Incident ${String(incident.id).padStart(3, "0")}`} title={incident.title} description={incident.situation} />
    <div className="content-grid"><article className="article">
      <div className="card panel"><div className="eyebrow">Business impact</div><p>Service availability or performance may be affected. Establish scope and communicate through the incident lead before making changes.</p><h3>Initial triage</h3><p>{incident.investigate}</p></div>
      <h2>Choose your first action</h2>{incident.choices.map((item, index) => <button key={item} className={`choice ${choice === index ? "selected" : ""} ${revealed && index === incident.correct ? "correct" : ""} ${revealed && choice === index && index !== incident.correct ? "incorrect" : ""}`} onClick={() => { setChoice(index); setRevealed(false); }}><span>{String.fromCharCode(65 + index)}.</span>{item}</button>)}
      <button className="button" disabled={choice < 0} onClick={() => setRevealed(true)}>Submit investigation <ArrowRight size={13} /></button>
      {revealed && <div style={{ marginTop: 16 }}>
        <div className={`callout ${choice === incident.correct ? "" : "warning"}`}><strong>{choice === incident.correct ? "Good first response." : "That action increases risk."}</strong><br />Root cause: {incident.cause}</div>
        <h2>Investigation and resolution</h2><p>{incident.investigate}</p><p>{incident.resolution}</p><h3>Validate</h3><p>{incident.validate}</p>
      </div>}
      <div style={{ marginTop: 21 }}><Link className="button secondary" href="/war-room"><ArrowLeft size={13} /> All incidents</Link></div>
    </article><aside className="right-rail"><div className="card rail-card"><div className="rail-title">Incident workflow</div>{["Scope impact", "Collect evidence", "Identify cause", "Choose approved action", "Validate and communicate"].map((item) => <div className="rail-link" key={item}><CheckCircle2 size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />{item}</div>)}</div></aside></div>
  </>;
}

function GlossaryPage() {
  const [query, setQuery] = useState("");
  const filtered = glossary.filter((item) => `${item.term} ${item.definition} ${item.example}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeading eyebrow="Searchable reference" title="SQL Server DBA glossary" description={`${glossary.length} operational terms with plain-English definitions and examples.`} />
    <div className="card panel" style={{ marginBottom: 15 }}><div className="search-box" style={{ width: "100%" }}><Search size={14} color="#9aa3b2" /><input autoFocus placeholder="Search terms..." value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
    <div className="card">{filtered.map((item) => <div key={item.term} className="list-row" style={{ alignItems: "flex-start", display: "block", padding: "13px 16px" }}><div className="row-title">{item.term}</div><div className="row-sub" style={{ lineHeight: 1.65 }}>{item.definition}</div><div className="small" style={{ color: "#68758a", lineHeight: 1.6, marginTop: 6 }}><strong>Example:</strong> {item.example}</div></div>)}</div>
    <p className="small muted" style={{ marginTop: 10 }}>{filtered.length} terms found.</p>
  </>;
}

function ProgressPage({ state, overall, completedCount, onReset }) {
  const quizCount = Object.keys(state.quizResults).length;
  const correct = Object.values(state.quizResults).filter(Boolean).length;
  return <>
    <PageHeading eyebrow="Your learning record" title="Progress and results" description="Progress, notes, bookmarks, and quiz answers are stored in this browser only." action={<button className="button secondary" onClick={onReset}><X size={13} /> Reset progress</button>} />
    <div className="stat-grid"><StatCard label="Overall completion" value={`${overall}%`} note={`${completedCount} / ${chapters.length + labs.length + roadmap.length} items`} icon={BarChart3} /><StatCard label="Chapters" value={`${state.chapters.length} / 20`} note="Completed chapters" icon={BookOpen} /><StatCard label="Practical labs" value={`${state.labs.length} / 50`} note="Completed labs" icon={FlaskConical} /><StatCard label="Quiz score" value={quizCount ? `${correct}/${quizCount}` : "—"} note={quizCount ? `${Math.round(correct / quizCount * 100)}% correct` : "No answers recorded"} icon={Target} /></div>
    <div className="dashboard-grid"><div className="card panel"><div className="panel-heading"><h2>Course milestones</h2></div>{[["Book chapters", state.chapters.length, 20], ["Practical labs", state.labs.length, 50], ["Roadmap days", state.roadmap.length, 60]].map(([label, value, max]) => <div key={label} style={{ margin: "17px 0" }}><div className="stat-top"><span>{label}</span><span>{value} / {max}</span></div><div style={{ marginTop: 7 }}><ProgressBar value={value / max * 100} /></div></div>)}</div>
      <div className="card panel"><div className="panel-heading"><h2>Study data</h2></div><div className="list-row"><span className="row-icon"><Clock3 size={15} /></span><span className="row-copy"><span className="row-title">Started</span><span className="row-sub">{state.startedAt || "Not started yet"}</span></span></div><div className="list-row"><span className="row-icon"><Flame size={15} /></span><span className="row-copy"><span className="row-title">Study days recorded</span><span className="row-sub">{(state.studyDates || []).length} distinct days</span></span></div><div className="list-row"><span className="row-icon"><Bookmark size={15} /></span><span className="row-copy"><span className="row-title">Bookmarks</span><span className="row-sub">{state.bookmarks.length} chapters saved</span></span></div><div className="list-row"><span className="row-icon"><NotebookPen size={15} /></span><span className="row-copy"><span className="row-title">Notes</span><span className="row-sub">{Object.values(state.notes).filter(Boolean).length} entries</span></span></div></div></div>
    <div className="callout" style={{ marginTop: 18 }}>Progress is not uploaded to a server. Clearing browser data also clears this record. Export or copy important notes separately.</div>
  </>;
}

function NotesPage({ state, onNote, onBookmark }) {
  const saved = chapters.filter((item) => state.bookmarks.includes(item.id) || state.notes[`chapter-${item.id}`]);
  return <>
    <PageHeading eyebrow="Personal workspace" title="Notes and bookmarks" description="Keep private study notes in this browser and bookmark chapters for quick access." />
    {!saved.length && <div className="card empty-state">No notes or bookmarks yet. Open a chapter to save a note or bookmark it.</div>}
    {saved.map((item) => <div className="card panel" key={item.id} style={{ marginBottom: 12 }}>
      <div className="panel-heading"><div><Link className="row-title" href={`/chapters/${item.slug}`}>Chapter {item.id}: {item.title}</Link><div className="row-sub">{item.part}</div></div><button className="icon-button" aria-label="Toggle bookmark" onClick={() => onBookmark(item.id)}>{state.bookmarks.includes(item.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}</button></div>
      <textarea className="form-control note-area" value={state.notes[`chapter-${item.id}`] || ""} onChange={(event) => onNote(`chapter-${item.id}`, event.target.value)} placeholder="Add your notes..." />
    </div>)}
  </>;
}
