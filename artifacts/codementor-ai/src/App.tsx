import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  useAskDoctor, useAskMentor, useCreateAttempt, useGetAttempts, useGetDashboard,
  useGetProblem, useGetProblems, useGetProfile, useHealthCheck, useLoginUser,
  useRegisterUser, useUpdateAttempt, useUpdateProfile,
  getGetAttemptsQueryKey, getGetDashboardQueryKey, getGetProblemQueryKey,
  getGetProblemsQueryKey, getGetProfileQueryKey, getHealthCheckQueryKey, setAuthTokenGetter,
} from '@workspace/api-client-react';
import type { Attempt, Profile } from '@workspace/api-client-react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Bug, Check,
  CheckCircle2, ChevronDown, CircleHelp, Code2, Compass, FileCode2, Filter,
  Flame, GraduationCap, History, Lightbulb, LogOut, Menu, Play, Plus,
  Save, Search, Send, Settings2, Sparkles, Terminal, WandSparkles, X,
} from 'lucide-react';
import NotFound from '@/pages/not-found';
import { runJavaScriptInWorker } from '@/lib/run-javascript';

type AuthValue = { token: string | null; user: Profile | null; signIn: (token: string, user: Profile) => void; signOut: () => void };
const AuthContext = createContext<AuthValue | null>(null);
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 20_000 } } });
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Auth context is unavailable');
  return context;
};
const storageToken = () => localStorage.getItem('codementor_token');
const storageUser = (): Profile | null => {
  try { return JSON.parse(localStorage.getItem('codementor_user') || 'null') as Profile | null; } catch { return null; }
};
setAuthTokenGetter(storageToken);
const initials = (name?: string) => (name || 'Learner').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const prettyDate = (date?: string) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently';
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';
const button = (cls = '') => `btn ${cls}`;

function Brand() {
  return <Link href="/" className="brand" data-testid="link-brand"><span className="brand-mark"><Code2 size={19} /></span><span>CodeMentor<span style={{ color: '#6858df' }}> AI</span></span></Link>;
}

function HealthStatus() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60_000 } });
  const ready = health.data?.status === 'ok' || health.data?.status === 'healthy';
  return <span data-testid="status-app-readiness" title={health.isError ? 'Readiness check unavailable' : ready ? 'All systems ready' : 'Checking app readiness'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: health.isError ? '#b17b25' : '#6e9e82', fontSize: 11 }}><span style={{ width: 7, height: 7, borderRadius: 8, background: health.isError ? '#d9a44e' : ready ? '#61b889' : '#a9acbd' }} />{health.isError ? 'App status unknown' : ready ? 'Ready to learn' : 'Checking readiness'}</span>;
}

function NavLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [location] = useLocation();
  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/practice', label: 'Practice', icon: Code2 },
    { href: '/doctor', label: 'Code doctor', icon: Bug },
    { href: '/history', label: 'History', icon: History },
  ];
  return <>{items.map((item) => {
    const Icon = item.icon;
    return <Link key={item.href} href={item.href} onClick={onNavigate} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`nav-link ${location === item.href ? 'active' : ''}`}><Icon size={17} /><span>{item.label}</span></Link>;
  })}</>;
}

function ProfileSettings({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const update = useUpdateProfile();
  const client = useQueryClient();
  const [name, setName] = useState(profile.display_name);
  const [skill, setSkill] = useState(profile.skill_level);
  const [language, setLanguage] = useState(profile.preferred_language);
  const save = () => update.mutate({ data: { display_name: name, skill_level: skill, preferred_language: language } }, {
    onSuccess: (updated) => {
      client.setQueryData(getGetProfileQueryKey(), updated);
      localStorage.setItem('codementor_user', JSON.stringify(updated));
      onClose();
    },
  });
  return <div style={{ position: 'fixed', inset: 0, background: '#25274455', zIndex: 50, display: 'grid', placeItems: 'center', padding: 16 }} onClick={onClose}>
    <section className="panel panel-pad animate-enter" style={{ width: 'min(100%,430px)' }} onClick={(event) => event.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><div><div className="section-title">Your learning profile</div><div className="section-sub">Tune your coach to fit you.</div></div><button className={button('btn-quiet')} aria-label="Close profile settings" data-testid="button-close-settings" onClick={onClose}><X size={18} /></button></div>
      <div style={{ display: 'grid', gap: 16 }}>
        <label><span className="field-label">Display name</span><input className="field" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" /></label>
        <label><span className="field-label">Skill level</span><select className="field" value={skill} onChange={(e) => setSkill(e.target.value as Profile['skill_level'])} data-testid="select-profile-skill"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label><span className="field-label">Preferred language</span><select className="field" value={language} onChange={(e) => setLanguage(e.target.value as Profile['preferred_language'])} data-testid="select-profile-language"><option>JavaScript</option><option>Python</option><option>Java</option></select></label>
        {update.isError && <div style={{ color: '#bd5750', fontSize: 12 }} data-testid="status-profile-error">{errorText(update.error)}</div>}
        <button className={button('btn-primary')} onClick={save} disabled={update.isPending} data-testid="button-save-profile">{update.isPending ? 'Saving…' : 'Save profile'}</button>
      </div>
    </section>
  </div>;
}

function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const title = location === '/practice' ? 'Practice room' : location === '/doctor' ? 'Code doctor' : location === '/history' ? 'Learning history' : 'Learning overview';
  const profile = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), enabled: Boolean(storageToken()) } });
  const activeUser = profile.data || user;
  return <div className="app-shell">
    <aside className="sidebar">
      <Brand /><div className="nav-label">Your workspace</div><nav className="nav-list"><NavLinks /></nav>
      <div className="sidebar-note"><div style={{ display: 'flex', gap: 9, alignItems: 'center', color: '#6253d6', fontSize: 12, fontWeight: 700 }}><Sparkles size={16} />A little every day</div><p style={{ fontSize: 11, lineHeight: 1.6, color: '#898ba0', margin: '8px 0 0' }}>Small practice sessions build lasting instincts.</p></div>
      <button className="nav-link" style={{ border: 0, background: 'transparent', marginTop: 15 }} onClick={() => setSettings(true)} data-testid="button-open-settings"><Settings2 size={17} />Profile settings</button>
      <button className="nav-link" style={{ border: 0, background: 'transparent' }} onClick={signOut} data-testid="button-sidebar-sign-out"><LogOut size={17} />Log out</button>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" data-testid="button-mobile-menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button><span className="topbar-title">{title}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}><HealthStatus /><button onClick={() => setSettings(true)} style={{ display: 'flex', alignItems: 'center', gap: 9, border: 0, background: 'transparent', color: '#4f5268' }} data-testid="button-user-profile"><span className="avatar">{initials(activeUser?.display_name)}</span><span className="topbar-title" style={{ color: '#50536a' }}>{activeUser?.display_name || 'Learner'}</span></button><button className={button('btn-quiet')} onClick={signOut} title="Sign out" data-testid="button-sign-out"><LogOut size={16} /></button></div>
      </header>
      {menuOpen && <div className="mobile-nav"><NavLinks mobile onNavigate={() => setMenuOpen(false)} /></div>}
      {children}
    </div>
    {settings && activeUser && <ProfileSettings profile={activeUser} onClose={() => setSettings(false)} />}
  </div>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => { if (!token) setLocation('/login'); }, [token, setLocation]);
  if (!token) return null;
  return <AppShell>{children}</AppShell>;
}

function PublicHeader() {
  return <header style={{ height: 76, padding: '0 clamp(20px,7vw,100px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fbfbfe' }}><Brand /><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Link href="/login" className={button('btn-quiet')} data-testid="link-login">Sign in</Link><Link href="/register" className={button('btn-primary')} data-testid="link-register">Start learning <ArrowRight size={15} /></Link></div></header>;
}

function Landing() {
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 60_000 } });
  return <div style={{ minHeight: '100dvh', background: '#fbfbfe' }}>
    <PublicHeader />
    <main>
      <section style={{ minHeight: 535, display: 'grid', gridTemplateColumns: '1.05fr .95fr', alignItems: 'center', gap: 40, padding: '52px clamp(22px,9vw,130px) 75px', background: 'radial-gradient(circle at 82% 39%, #f0efff 0, #f0efff 16%, transparent 16.2%), #fbfbfe' }}>
        <div className="animate-enter"><div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#eeedff', color: '#6252d6', borderRadius: 99, padding: '8px 12px', fontSize: 11, fontWeight: 700 }}><Sparkles size={14} />Your patient, personal coding coach</div><h1 style={{ fontSize: 'clamp(44px,6vw,72px)', letterSpacing: '-3.8px', lineHeight: 1.02, margin: '25px 0 20px', maxWidth: 620 }}>Your Personal<br /><span style={{ color: '#6858e5' }}>Coding Mentor</span></h1><p style={{ color: '#85889c', lineHeight: 1.8, maxWidth: 480, fontSize: 15 }}>A coach that meets you where you are, remembers what trips you up, and helps you find the answer yourself.</p><div style={{ display: 'flex', gap: 12, marginTop: 27, flexWrap: 'wrap' }}><Link href="/register" className={button('btn-primary')} data-testid="button-hero-start">Create your free account <ArrowRight size={16} /></Link><Link href="/login" className={button('btn-outline')} data-testid="button-hero-login">I already have an account</Link></div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28 }}><HealthStatus /></div></div>
        <div style={{ position: 'relative', minHeight: 350, display: 'grid', placeItems: 'center' }} className="animate-enter"><div style={{ width: 'min(100%,400px)', background: '#fff', border: '1px solid #e8e7f5', borderRadius: 22, boxShadow: '0 24px 70px #55508b18', padding: 23, transform: 'rotate(1deg)' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 23 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="brand-mark"><Code2 size={18} /></span><div><strong style={{ fontSize: 13 }}>Today’s session</strong><div style={{ fontSize: 10, color: '#989bae', marginTop: 3 }}>A good day to learn something new</div></div></div><span className="badge easy">Easy start</span></div><div style={{ background: '#22283a', color: '#e6e9f2', padding: 19, borderRadius: 13, font: '11px/2 var(--app-font-mono)' }}><div style={{ color: '#949bb1' }}>01&nbsp;&nbsp;<span style={{ color: '#c99bf4' }}>function</span> greet(name) {'{'}</div><div>02&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b3d58a' }}>return</span> `Hello, ${'{'}name{'}'}!`;</div><div>03&nbsp;&nbsp;{'}'}</div><div style={{ color: '#8790a9', marginTop: 9 }}>04&nbsp;&nbsp;greet(<span style={{ color: '#ebbe86' }}>'you'</span>);</div></div><div className="response-card" style={{ marginTop: 17, display: 'flex', gap: 10, alignItems: 'flex-start' }}><span style={{ color: '#715fe2' }}><Lightbulb size={17} /></span><span>Nice start. Want a hint about what the <code>return</code> keyword does?</span></div><div style={{ marginTop: 17, display: 'flex', justifyContent: 'space-between', color: '#9295a9', fontSize: 10 }}><span>One step at a time</span><span style={{ color: '#6a5bdd', fontWeight: 700 }}>Your coach remembers</span></div></div><span style={{ position: 'absolute', right: 3, bottom: 4, width: 68, height: 68, borderRadius: 22, background: '#e7f5ee', color: '#4d9d76', display: 'grid', placeItems: 'center', transform: 'rotate(-8deg)' }}><GraduationCap size={30} /></span></div>
      </section>
      <section style={{ padding: '55px clamp(22px,9vw,130px) 65px', background: '#f5f5fc' }}><div style={{ maxWidth: 640 }}><div style={{ color: '#6858db', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1.2 }}>A smarter way to practice</div><h2 style={{ fontSize: 35, letterSpacing: '-1.4px', margin: '13px 0' }}>Built around how you learn.</h2><p style={{ color: '#85889c', lineHeight: 1.8, fontSize: 14 }}>No lectures to sit through. Just thoughtful practice and guidance that gets more personal over time.</p></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginTop: 29 }}><Feature icon={<Compass size={19} />} title="Adapts to your level" body="Find challenges at the right level and build confidence one skill at a time." /><Feature icon={<Bug size={19} />} title="Code Doctor" body="Bring confusing code or errors and get a practical next step." /><Feature icon={<Lightbulb size={19} />} title="Socratic coach" body="Get thoughtful questions and hints that help you solve it yourself." /></div></section>
      <section style={{ padding: '58px clamp(22px,9vw,130px)', background: '#fbfbfe' }}><div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 28px' }}><div style={{ color: '#6858db', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1.2 }}>How it works</div><h2 style={{ fontSize: 31, letterSpacing: '-1px', margin: '12px 0' }}>Three steps to your next breakthrough.</h2></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14 }}>{[{ step: '01', title: 'Create an account', body: 'Set your experience level and preferred language.' }, { step: '02', title: 'Choose a problem', body: 'Start with one of six JavaScript practice challenges.' }, { step: '03', title: 'Learn by doing', body: 'Run your code, ask for a hint, and save your progress.' }].map((item) => <article className="panel" key={item.step} style={{ padding: 20 }}><span style={{ color: '#6858db', font: '700 12px var(--app-font-mono)' }}>{item.step}</span><h3 style={{ fontSize: 15, margin: '12px 0 7px' }}>{item.title}</h3><p style={{ color: '#898ca0', fontSize: 12, lineHeight: 1.7, margin: 0 }}>{item.body}</p></article>)}</div></section>
      <section style={{ padding: '68px 24px', textAlign: 'center', background: '#ecebfc' }}><h2 style={{ fontSize: 32, letterSpacing: '-1px', margin: '0 0 12px' }}>Your next breakthrough starts small.</h2><p style={{ color: '#81849a', fontSize: 14, margin: '0 0 24px' }}>Show up curious. We’ll help with the rest.</p><Link href="/register" className={button('btn-primary')} data-testid="button-bottom-register">Start Coding for Free <ArrowRight size={15} /></Link></section>
    </main>
    <footer style={{ padding: 24, textAlign: 'center', fontSize: 11, color: '#9a9cad' }}>CodeMentor AI · Made for the long way around.</footer>
    {health.isError && <span data-testid="status-health-error" style={{ display: 'none' }}>{errorText(health.error)}</span>}
  </div>;
}

function Feature({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return <article className="panel" style={{ padding: 22 }}><div style={{ width: 39, height: 39, display: 'grid', placeItems: 'center', borderRadius: 12, background: '#efedff', color: '#6654df', marginBottom: 16 }}>{icon}</div><strong style={{ fontSize: 14 }}>{title}</strong><p style={{ color: '#898ca0', fontSize: 12, lineHeight: 1.7, margin: '9px 0 0' }}>{body}</p></article>;
}

function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const registerMode = mode === 'register';
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();
  const login = useLoginUser();
  const register = useRegisterUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [skill, setSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [language, setLanguage] = useState<'JavaScript' | 'Python' | 'Java'>('JavaScript');
  const [formError, setFormError] = useState('');
  const loading = login.isPending || register.isPending;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (password.length < (registerMode ? 8 : 1)) { setFormError(registerMode ? 'Use at least 8 characters for your password.' : 'Enter your password to continue.'); return; }
    if (registerMode) register.mutate({ data: { display_name: name.trim(), email, password, skill_level: skill, preferred_language: language } }, { onSuccess: (result) => { signIn(result.token, result.user); setLocation('/dashboard'); }, onError: (error) => setFormError(errorText(error)) });
    else login.mutate({ data: { email, password } }, { onSuccess: (result) => { signIn(result.token, result.user); setLocation('/dashboard'); }, onError: (error) => setFormError(errorText(error)) });
  };
  return <div className="auth-page">
    <aside className="auth-aside"><Brand /><div className="auth-copy"><div style={{ color: '#6959dd', fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 19 }}>A better way to get unstuck</div><h1>{registerMode ? 'You don’t have to figure it out alone.' : 'Pick up right where you left off.'}</h1><p>{registerMode ? 'Build confidence one small problem at a time, with a coach that learns what works for you.' : 'Your practice space is ready. Let’s make today’s session count.'}</p><div style={{ display: 'flex', gap: 11, alignItems: 'center', color: '#747895', fontSize: 12, marginTop: 27 }}><span style={{ color: '#6654df' }}><CheckCircle2 size={17} /></span>Gentle guidance, tailored to your pace</div></div><div style={{ color: '#999bae', fontSize: 11 }}>CodeMentor AI · Learning, one insight at a time</div></aside>
    <main className="auth-main"><div className="auth-card"><Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#8c8fa3', fontSize: 11, marginBottom: 26 }} data-testid="link-back-home">← Back to home</Link><h2>{registerMode ? 'Create your account' : 'Welcome back'}</h2><p className="intro">{registerMode ? 'A few details, then we’ll get to the fun part.' : 'Sign in to continue your learning journey.'}</p>
      <form className="auth-form" onSubmit={submit}>
        {registerMode && <label><span className="field-label">What should we call you?</span><input className="field" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" data-testid="input-display-name" /></label>}
        <label><span className="field-label">Email address</span><input className="field" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" data-testid="input-email" /></label>
        <label><span className="field-label">Password</span><div style={{ position: 'relative' }}><input className="field" style={{ paddingRight: 68 }} type={showPassword ? 'text' : 'password'} required minLength={registerMode ? 8 : 1} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={registerMode ? 'At least 8 characters' : 'Your password'} autoComplete={registerMode ? 'new-password' : 'current-password'} data-testid="input-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} data-testid="button-toggle-password" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: '#686b82', fontSize: 11, fontWeight: 700 }}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        {registerMode && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label><span className="field-label">I’m a</span><select className="field" value={skill} onChange={(e) => setSkill(e.target.value as typeof skill)} data-testid="select-skill-level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label><span className="field-label">I’m learning</span><select className="field" value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} data-testid="select-language"><option>JavaScript</option><option>Python</option><option>Java</option></select></label></div>}
        {formError && <div role="alert" data-testid="status-auth-error" style={{ borderRadius: 10, padding: 11, background: '#fff0ef', color: '#b84f49', fontSize: 12 }}>{formError}</div>}
        <button className={button('btn-primary')} type="submit" disabled={loading} data-testid="button-auth-submit" style={{ width: '100%', marginTop: 3 }}>{loading ? 'Just a moment…' : registerMode ? 'Create my account' : 'Sign in'}{!loading && <ArrowRight size={15} />}</button>
      </form><div className="auth-links">{registerMode ? <>Already have an account? <Link href="/login" style={{ color: '#6252d4', fontWeight: 700 }} data-testid="link-switch-login">Sign in</Link></> : <>New to CodeMentor? <Link href="/register" style={{ color: '#6252d4', fontWeight: 700 }} data-testid="link-switch-register">Create an account</Link></>}</div>
    </div></main>
  </div>;
}

function PageHeading({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>;
}
function LoadingCard({ text = 'Bringing your learning space into focus…' }: { text?: string }) {
  return <div className="panel panel-pad" role="status" data-testid="status-loading"><div className="section-title">One moment</div><div className="section-sub">{text}</div><div style={{ display: 'grid', gap: 10, marginTop: 20 }}><div style={{ height: 12, width: '63%', background: '#f0f0f7', borderRadius: 8 }} /><div style={{ height: 10, width: '90%', background: '#f3f3f8', borderRadius: 8 }} /><div style={{ height: 10, width: '76%', background: '#f3f3f8', borderRadius: 8 }} /></div></div>;
}
function ErrorCard({ error, retry }: { error: unknown; retry: () => void }) {
  return <div className="empty-state" data-testid="status-load-error"><div className="empty-icon"><CircleHelp size={21} /></div><strong>We couldn’t load this just now.</strong><p style={{ color: '#898ca0', fontSize: 12 }}>{errorText(error)}</p><button className={button('btn-outline')} onClick={retry} data-testid="button-retry">Try again</button></div>;
}
function EmptyState({ title, detail, icon = <BookOpen size={20} />, action }: { title: string; detail: string; icon?: ReactNode; action?: ReactNode }) {
  return <div className="empty-state" data-testid="status-empty"><div className="empty-icon">{icon}</div><strong>{title}</strong><p style={{ color: '#898ca0', fontSize: 12, maxWidth: 360, lineHeight: 1.65, margin: '8px auto 15px' }}>{detail}</p>{action}</div>;
}

function DashboardPage() {
  const auth = useAuth();
  const profileQuery = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), enabled: Boolean(auth.token) } });
  const dashboard = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey(), enabled: Boolean(auth.token) } });
  const problems = useGetProblems({}, { query: { queryKey: getGetProblemsQueryKey({}), enabled: Boolean(auth.token) } });
  const [, setLocation] = useLocation();
  const name = profileQuery.data?.display_name || auth.user?.display_name || 'there';
  const skillLevel = profileQuery.data?.skill_level || auth.user?.skill_level || 'Beginner';
  const preferredLanguage = profileQuery.data?.preferred_language || auth.user?.preferred_language || 'JavaScript';
  if (dashboard.isLoading) return <main className="page"><LoadingCard /></main>;
  if (dashboard.isError) return <main className="page"><ErrorCard error={dashboard.error} retry={() => dashboard.refetch()} /></main>;
  const data = dashboard.data;
  if (!data) return <main className="page"><EmptyState title="Your learning space is ready" detail="Start with one small problem, and your progress will appear here." action={<button className={button('btn-primary')} onClick={() => setLocation('/practice')} data-testid="button-first-practice">Find a first problem</button>} /></main>;
  const stats = [
    { title: 'Problems attempted', value: data.attempted, foot: 'Every attempt is progress', icon: <FileCode2 size={16} /> },
    { title: 'Solved', value: data.solved, foot: 'Keep building your skills', icon: <CheckCircle2 size={16} /> },
    { title: 'Solve rate', value: `${data.solve_rate.toFixed(0)}%`, foot: 'Solved attempts', icon: <ArrowUpRight size={16} /> },
    { title: 'Avg hints used', value: Number(data.avg_hints).toFixed(1), foot: 'Learning at your own pace', icon: <Lightbulb size={16} /> },
  ];
  const maxWeaknessCount = Math.max(1, ...data.top_weaknesses.map((item) => item.count));
  const startProblem = (problemId: string) => {
    sessionStorage.setItem('codementor_next_problem', problemId);
    setLocation('/practice');
  };
  return <main className="page animate-enter">
    <section className="panel welcome-banner"><div><h2>Hello, {name.split(' ')[0]}.</h2><p>{skillLevel} Explorer · Learning {preferredLanguage} · Ready to make a little progress today?</p></div><button className={button('btn-primary')} onClick={() => setLocation('/practice')} data-testid="button-dashboard-practice">Pick a problem <ArrowRight size={15} /></button></section>
    <div className="metric-grid" style={{ marginTop: 19 }}>{stats.map((stat) => <div className="panel metric-card" key={stat.title} data-testid={`card-metric-${stat.title.toLowerCase().replaceAll(' ', '-')}`}><span className="metric-icon">{stat.icon}</span><div className="metric-kicker">{stat.title}</div><div className="metric-value">{stat.value}</div><div className="metric-foot">{stat.foot}</div></div>)}</div>
    <section className="panel panel-pad" style={{ marginTop: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><div><div className="section-title">Keep on coding</div><div className="section-sub">Pick up a small challenge and keep your momentum.</div></div><Link href="/practice" className={button('btn-quiet')} data-testid="link-all-problems">All problems <ArrowRight size={14} /></Link></div>
      {problems.isError ? <div role="alert" style={{ color: '#bd5750', fontSize: 12 }}>Practice problems couldn't load. <button className={button('btn-quiet')} onClick={() => problems.refetch()} data-testid="button-retry-dashboard-problems">Try again</button></div> : problems.data?.length ? <div className="problem-grid">{problems.data.slice(0, 3).map((problem) => <article className="panel problem-card" key={problem.id} data-testid={`card-dashboard-problem-${problem.id}`}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className={`badge ${problem.difficulty}`}>{problem.difficulty}</span><span style={{ fontSize: 10, color: '#999bac' }}>{problem.language}</span></div><strong style={{ fontSize: 14 }}>{problem.title}</strong><p style={{ color: '#898ca0', fontSize: 11, lineHeight: 1.6, margin: 0, flex: 1 }}>{problem.description}</p><button className={button('btn-soft')} style={{ alignSelf: 'flex-start' }} onClick={() => startProblem(problem.id)} data-testid={`button-dashboard-problem-${problem.id}`}>Continue <ArrowRight size={14} /></button></article>)}</div> : <div className="section-sub">Loading your practice problems…</div>}
    </section>
    <div className="content-grid"><section className="panel panel-pad"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}><div><div className="section-title">Recent practice</div><div className="section-sub">A little progress adds up.</div></div><Link href="/history" className={button('btn-quiet')} data-testid="link-all-attempts">See all <ArrowRight size={14} /></Link></div>
      {data.recent_attempts.length ? data.recent_attempts.slice(0, 5).map((attempt) => <AttemptRow key={attempt.id} attempt={attempt} />) : <div style={{ marginTop: 16 }}><EmptyState title="No attempts yet" detail="Your completed sessions will show up here." action={<button className={button('btn-soft')} onClick={() => setLocation('/practice')} data-testid="button-begin-practice">Start practicing</button>} /></div>}
    </section><div className="stack"><section className="panel panel-pad"><div className="section-title">What you’re building</div><div className="section-sub">Your consistency matters more than speed.</div><div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>Learning journey</span><strong>{data.completion_pct}%</strong></div><div className="progress-track" style={{ marginTop: 10 }}><div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, data.completion_pct))}%` }} /></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9a9cad', marginTop: 9 }}><span>Keep going</span><span>{data.solved} solved</span></div></section>
      <section className="panel panel-pad"><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ color: '#6858df' }}><Flame size={17} /></span><div><div className="section-title">Your Weak Spots</div><div className="section-sub">Concepts your coach has noticed more than once.</div></div></div>{data.top_weaknesses.length ? <div aria-label="Weak concept counts" role="img" style={{ display: 'grid', gap: 13, marginTop: 20 }}>{data.top_weaknesses.slice(0, 6).map((item) => <div key={item.concept}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 11, color: '#60637b', marginBottom: 6 }}><span>{item.concept}</span><span>{item.count}</span></div><div className="progress-track" role="progressbar" aria-label={`${item.concept}: ${item.count} occurrences`} aria-valuemin={0} aria-valuemax={maxWeaknessCount} aria-valuenow={item.count}><div className="progress-fill" style={{ width: `${Math.max(8, (item.count / maxWeaknessCount) * 100)}%` }} /></div></div>)}</div> : <p style={{ color: '#8b8da0', fontSize: 12, lineHeight: 1.6, margin: '16px 0 0' }}>No recurring patterns yet. Keep trying problems and your coach will spot what to work on.</p>}</section></div></div>
  </main>;
}

function AttemptRow({ attempt, expandable = false }: { attempt: Attempt; expandable?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return <div className="list-row" style={{ alignItems: 'flex-start' }} data-testid={`row-attempt-${attempt.id}`}><div style={{ minWidth: 0, flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{attempt.problem_title || 'Practice session'}</div><div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 7, flexWrap: 'wrap' }}><span className={`badge status-${attempt.status}`}>{attempt.status.replace('_', ' ')}</span><span style={{ fontSize: 10, color: '#9699aa' }}>{attempt.language} · {prettyDate(attempt.updated_at)}</span></div>{expandable && expanded && <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', background: '#22283a', color: '#e4e6ee', borderRadius: 10, padding: 14, font: '11px/1.7 var(--app-font-mono)', marginTop: 13 }}>{attempt.code || 'No saved code.'}{attempt.output && `\n\nOutput:\n${attempt.output}`}</pre>}</div>{expandable && <button className={button('btn-quiet')} onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Collapse saved code' : 'Expand saved code'} data-testid={`button-expand-attempt-${attempt.id}`}><ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : undefined }} /></button>}</div>;
}

function PracticePage() {
  const auth = useAuth();
  const client = useQueryClient();
  const [difficulty, setDifficulty] = useState('');
  const [language, setLanguage] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'hint' | 'explain' | 'debug' | 'review' | 'similar' | 'solution' | 'ask'>('hint');
  const [question, setQuestion] = useState('');
  const [mentorReply, setMentorReply] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState('');
  const params = useMemo(() => ({ ...(difficulty ? { difficulty: difficulty as 'easy' | 'medium' | 'hard' } : {}), ...(language ? { language: language as 'JavaScript' | 'Python' | 'Java' } : {}) }), [difficulty, language]);
  const problems = useGetProblems(params, { query: { queryKey: getGetProblemsQueryKey(params), enabled: Boolean(auth.token) } });
  const problem = useGetProblem(selectedId, { query: { queryKey: getGetProblemQueryKey(selectedId), enabled: Boolean(selectedId && auth.token) } });
  const create = useCreateAttempt();
  const mentor = useAskMentor();
  const attempts = useGetAttempts({ query: { queryKey: getGetAttemptsQueryKey(), enabled: Boolean(auth.token) } });
  const selected = problem.data || problems.data?.find((item) => item.id === selectedId);
  useEffect(() => {
    const nextProblem = sessionStorage.getItem('codementor_next_problem');
    if (nextProblem) {
      sessionStorage.removeItem('codementor_next_problem');
      setSelectedId(nextProblem);
      setCode(problems.data?.find((item) => item.id === nextProblem)?.starter_code || '');
    }
  }, [problems.data]);
  const choose = (id: string) => {
    setSelectedId(id);
    setCode(problems.data?.find((item) => item.id === id)?.starter_code || '');
    setOutput('');
    setMentorReply('');
    setFeedback('');
    setHintsUsed(0);
  };
  const saveAttempt = (status: 'in_progress' | 'solved' | 'stuck', resultText = output) => {
    if (!selected) return;
    setFeedback('');
    create.mutate({ data: { problem_id: selected.id, language: selected.language as 'JavaScript' | 'Python' | 'Java', code, output: resultText || null, status, hints_used: hintsUsed } }, {
      onSuccess: () => { setFeedback(status === 'solved' ? 'Nice work. Your solved attempt is saved.' : 'Your work is saved to learning history.'); client.invalidateQueries({ queryKey: getGetAttemptsQueryKey() }); client.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); },
      onError: (error) => setFeedback(errorText(error)),
    });
  };
  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running your code…');
    try {
      setOutput(await runJavaScriptInWorker(code));
    } catch (error) {
      setOutput(`Runner error: ${errorText(error)}`);
    } finally {
      setIsRunning(false);
    }
  };
  const ask = () => {
    if (!selected) return;
    if (mode === 'solution' && !window.confirm('The mentor believes in you — sure you want to see the full solution?')) return;
    mentor.mutate({ data: { mode, problem_id: selected.id, code, language: selected.language as 'JavaScript' | 'Python' | 'Java', ...(mode === 'solution' ? { user_text: 'confirm-show-solution' } : question ? { user_text: question } : {}) } }, { onSuccess: (result) => { setMentorReply(result.reply); setHintsUsed(result.hints_used); setQuestion(''); }, onError: (error) => setMentorReply(errorText(error)) });
  };
  if (problems.isLoading) return <main className="page"><LoadingCard text="Finding the right problems for you…" /></main>;
  if (problems.isError) return <main className="page"><ErrorCard error={problems.error} retry={() => problems.refetch()} /></main>;
  return <main className="page animate-enter">
    <PageHeading title={selected ? selected.title : 'Choose your next challenge'} subtitle={selected ? `${selected.language} · Work through it at your own pace.` : 'Practice that meets you where you are.'} action={selected ? <button className={button('btn-outline')} onClick={() => choose('')} data-testid="button-back-problems"><ArrowDownRight size={15} />All problems</button> : undefined} />
    {!selected ? <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}><label style={{ position: 'relative' }}><Filter size={14} style={{ position: 'absolute', top: 13, left: 12, color: '#888ba0' }} /><select className="field" style={{ width: 160, paddingLeft: 34 }} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} data-testid="select-filter-difficulty"><option value="">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><select className="field" style={{ width: 170 }} value={language} onChange={(e) => setLanguage(e.target.value)} data-testid="select-filter-language"><option value="">All languages</option><option>JavaScript</option><option>Python</option><option>Java</option></select></div>
      {problems.data?.length ? <div className="problem-grid">{problems.data.map((item) => <article className="panel problem-card" key={item.id} data-testid={`card-problem-${item.id}`}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className={`badge ${item.difficulty}`}>{item.difficulty}</span><span style={{ fontSize: 10, color: '#999bac' }}>{item.language}</span></div><strong style={{ fontSize: 15 }}>{item.title}</strong><p style={{ color: '#898ca0', fontSize: 12, lineHeight: 1.65, margin: 0, flex: 1 }}>{item.description}</p><button className={button('btn-soft')} style={{ alignSelf: 'flex-start' }} onClick={() => choose(item.id)} data-testid={`button-start-problem-${item.id}`}>Open problem <ArrowRight size={14} /></button></article>)}</div> : <EmptyState title="No problems match those filters" detail="Try another level or language to see more practice." icon={<Search size={20} />} action={<button className={button('btn-outline')} onClick={() => { setDifficulty(''); setLanguage(''); }} data-testid="button-clear-filters">Clear filters</button>} />}
      {attempts.data?.length === 0 && <p style={{ textAlign: 'center', color: '#9699aa', fontSize: 11, marginTop: 22 }}>A first attempt is a great place to start.</p>}
    </> : <div className="content-grid" style={{ gridTemplateColumns: 'minmax(0,1.25fr) minmax(280px,.75fr)' }}>
      <section className="stack"><div className="panel panel-pad"><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}><span className={`badge ${selected.difficulty}`}>{selected.difficulty}</span><span style={{ color: '#9698ab', fontSize: 11 }}>{selected.language}</span></div><div style={{ fontSize: 13, lineHeight: 1.8, color: '#666a82', whiteSpace: 'pre-wrap' }}>{selected.description}</div></div>
        <div className="editor-wrap"><div className="editor-head"><span><Terminal size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />solution.{selected.language === 'Python' ? 'py' : selected.language === 'Java' ? 'java' : 'js'}</span><span>Editable workspace</span></div><textarea className="code-input" aria-label="Code editor" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} data-testid="textarea-code-editor" /></div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}><button className={button('btn-primary')} onClick={runCode} disabled={isRunning} data-testid="button-run-code"><Play size={14} />{isRunning ? 'Running…' : 'Run code'}</button><button className={button('btn-outline')} onClick={() => saveAttempt('in_progress')} disabled={create.isPending || isRunning} data-testid="button-save-attempt"><Save size={14} />Save</button><button className={button('btn-soft')} onClick={() => saveAttempt('solved')} disabled={create.isPending || isRunning} data-testid="button-mark-solved"><Check size={15} />I solved it</button></div>
        <section><div className="section-title" style={{ marginBottom: 10 }}>Output</div><pre className="console" data-testid="text-code-output">{output || 'Run your code to see output here.'}</pre>{feedback && <div role="status" data-testid="status-attempt-feedback" style={{ color: feedback.includes('saved') ? '#4d8d6a' : '#bb5750', fontSize: 12, marginTop: 8 }}>{feedback}</div>}</section>
      </section>
      <section className="panel panel-pad" style={{ alignSelf: 'start' }}><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span className="empty-icon" style={{ margin: 0, width: 36, height: 36 }}><Sparkles size={17} /></span><div><div className="section-title">Ask your mentor</div><div className="section-sub">Hints without giving it all away.</div></div></div>
        <div className="tabs" style={{ marginTop: 18 }}>{([{ key: 'hint', label: 'Give Hint' }, { key: 'explain', label: 'Explain Concept' }, { key: 'debug', label: 'Help Debug' }, { key: 'review', label: 'Review Approach' }, { key: 'similar', label: 'Similar Problem' }, { key: 'solution', label: 'Show Solution' }, { key: 'ask', label: 'Ask' }] as const).map(({ key, label }) => <button key={key} className={`tab ${mode === key ? 'active' : ''}`} onClick={() => setMode(key)} data-testid={`button-mentor-mode-${key}`}>{label}</button>)}</div>
        <label style={{ display: 'block', marginTop: 16 }}><span className="field-label">{mode === 'ask' ? 'What would you like to know?' : 'Add a question (optional)'}</span><textarea className="field" rows={3} maxLength={4000} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Tell your mentor what you’re thinking…" data-testid="textarea-mentor-question" /></label>
        <button className={button('btn-primary')} style={{ width: '100%', marginTop: 11 }} onClick={ask} disabled={mentor.isPending} data-testid="button-ask-mentor">{mentor.isPending ? 'Thinking…' : mode === 'solution' ? 'Show solution' : 'Ask mentor'}<Send size={14} /></button>
        {mentor.isError && <div role="alert" style={{ color: '#bd5750', fontSize: 11, marginTop: 10 }} data-testid="status-mentor-error">{errorText(mentor.error)}</div>}
        {mentorReply && <div className="response-card" style={{ marginTop: 15 }} data-testid="text-mentor-response">{mentorReply}{hintsUsed > 0 && <div style={{ color: '#9188c9', fontSize: 10, marginTop: 10 }}>Hints used this session: {hintsUsed}</div>}</div>}
      </section>
    </div>}
  </main>;
}

function DoctorPage() {
  const doctor = useAskDoctor();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'JavaScript' | 'Python' | 'Java'>('JavaScript');
  const [mode, setMode] = useState<'debug' | 'improve'>('debug');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reply, setReply] = useState('');
  const submit = () => {
    if (!code.trim()) { setNotice('Paste a small piece of code first, and the doctor can take a look.'); return; }
    setNotice('');
    doctor.mutate({ data: { mode, code, language, ...(mode === 'debug' && error.trim() ? { error } : {}) } }, { onSuccess: (result) => setReply(result.reply), onError: (failure) => setReply(errorText(failure)) });
  };
  return <main className="page animate-enter"><PageHeading title="Code doctor" subtitle="Bring the code that’s puzzling you. Leave with a clearer next step." />
    <div className="content-grid" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(280px,.8fr)' }}>
      <section className="panel panel-pad"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, marginBottom: 19 }}><div><div className="section-title">Your workspace</div><div className="section-sub">A focused place to debug or improve.</div></div><select className="field" style={{ width: 145 }} value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} data-testid="select-doctor-language"><option>JavaScript</option><option>Python</option><option>Java</option></select></div>
        <div className="tabs" style={{ marginBottom: 15 }}><button className={`tab ${mode === 'debug' ? 'active' : ''}`} onClick={() => setMode('debug')} data-testid="button-doctor-mode-debug"><Bug size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Debug</button><button className={`tab ${mode === 'improve' ? 'active' : ''}`} onClick={() => setMode('improve')} data-testid="button-doctor-mode-improve"><WandSparkles size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />Improve</button></div>
        <textarea className="field" style={{ minHeight: 310, background: '#22283a', color: '#e4e7f0', font: '12px/1.8 var(--app-font-mono)', borderColor: '#31384b' }} value={code} onChange={(e) => setCode(e.target.value)} placeholder={'Paste your code here…\\n\\nKeep it focused on the part you want help with.'} spellCheck={false} data-testid="textarea-doctor-code" />
        {mode === 'debug' && <label style={{ display: 'block', marginTop: 15 }}><span className="field-label">Error message (optional)</span><textarea className="field" rows={2} value={error} onChange={(e) => setError(e.target.value)} placeholder="Paste the error message, if you have one." data-testid="textarea-doctor-error" /></label>}
        {notice && <div role="alert" data-testid="status-doctor-validation" style={{ color: '#bb5750', marginTop: 10, fontSize: 12 }}>{notice}</div>}
        <button className={button('btn-primary')} onClick={submit} disabled={doctor.isPending} style={{ marginTop: 15 }} data-testid="button-submit-doctor">{doctor.isPending ? 'Reviewing your code…' : mode === 'debug' ? 'Help me debug' : 'Suggest improvements'}<ArrowRight size={15} /></button>
      </section>
      <section className="panel panel-pad" style={{ alignSelf: 'start' }}><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span className="empty-icon" style={{ margin: 0, width: 36, height: 36 }}><Lightbulb size={17} /></span><div><div className="section-title">A clearer way forward</div><div className="section-sub">{mode === 'debug' ? 'Let’s follow the clues.' : 'Make it cleaner, one change at a time.'}</div></div></div>
        {reply ? <div className="response-card" style={{ marginTop: 18 }} data-testid="text-doctor-response">{reply}</div> : <EmptyState title="Your diagnosis will appear here" detail={mode === 'debug' ? 'Share a code snippet and any error message. We’ll work through the cause together.' : 'Share the code you want to improve. Your doctor will suggest practical refinements.'} icon={<Bug size={20} />} />}
        {doctor.isError && <div role="alert" data-testid="status-doctor-api-error" style={{ color: '#bd5750', fontSize: 12, marginTop: 12 }}>{errorText(doctor.error)}</div>}
      </section>
    </div>
  </main>;
}

function HistoryPage() {
  const auth = useAuth();
  const client = useQueryClient();
  const attempts = useGetAttempts({ query: { queryKey: getGetAttemptsQueryKey(), enabled: Boolean(auth.token) } });
  const update = useUpdateAttempt();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const saveEdit = (attempt: Attempt) => update.mutate({ attemptId: attempt.id, data: { code: draft } }, { onSuccess: () => { setEditing(null); client.invalidateQueries({ queryKey: getGetAttemptsQueryKey() }); }, onError: () => undefined });
  return <main className="page animate-enter"><PageHeading title="Your learning history" subtitle="Every attempt is part of how you get better." action={<Link href="/practice" className={button('btn-primary')} data-testid="button-history-practice"><Plus size={15} />New practice</Link>} />
    {attempts.isLoading ? <LoadingCard text="Gathering your saved sessions…" /> : attempts.isError ? <ErrorCard error={attempts.error} retry={() => attempts.refetch()} /> : !attempts.data?.length ? <EmptyState title="Your history starts with one attempt" detail="Save a practice session to keep your code and revisit it whenever you need." icon={<History size={20} />} action={<Link href="/practice" className={button('btn-primary')} data-testid="button-empty-history-practice">Explore practice <ArrowRight size={15} /></Link>} /> :
      <section className="panel panel-pad"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f1f5' }}><div><div className="section-title">Saved sessions</div><div className="section-sub">{attempts.data.length} {attempts.data.length === 1 ? 'attempt' : 'attempts'} saved</div></div><History size={18} color="#7a6ce2" /></div>
        {update.isError && <div role="alert" style={{ color: '#b84f49', fontSize: 12, marginTop: 12 }} data-testid="status-history-update-error">{errorText(update.error)}</div>}
        {attempts.data.map((attempt) => <div key={attempt.id} style={{ padding: '14px 0', borderBottom: '1px solid #f0f1f5' }} data-testid={`history-attempt-${attempt.id}`}>
          <AttemptRow attempt={attempt} expandable />
          {editing === attempt.id && <div style={{ marginTop: 12 }}><textarea className="field" rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} data-testid={`textarea-edit-attempt-${attempt.id}`} /><div style={{ display: 'flex', gap: 8, marginTop: 8 }}><button className={button('btn-primary')} onClick={() => saveEdit(attempt)} disabled={update.isPending} data-testid={`button-save-edit-${attempt.id}`}>Save changes</button><button className={button('btn-outline')} onClick={() => setEditing(null)} data-testid={`button-cancel-edit-${attempt.id}`}>Cancel</button></div></div>}
          {editing !== attempt.id && <button className={button('btn-quiet')} style={{ fontSize: 11, marginTop: 3 }} onClick={() => { setEditing(attempt.id); setDraft(attempt.code); }} data-testid={`button-edit-attempt-${attempt.id}`}>Edit saved code</button>}
        </div>)}
      </section>}
  </main>;
}

function RedirectDashboard() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation('/dashboard'); }, [setLocation]);
  return null;
}

function App() {
  const [token, setToken] = useState<string | null>(storageToken);
  const [user, setUser] = useState<Profile | null>(storageUser);
  const [, setLocation] = useLocation();
  const auth = useMemo<AuthValue>(() => ({
    token, user,
    signIn: (nextToken, nextUser) => { queryClient.clear(); localStorage.setItem('codementor_token', nextToken); localStorage.setItem('codementor_user', JSON.stringify(nextUser)); setToken(nextToken); setUser(nextUser); },
    signOut: () => { queryClient.clear(); sessionStorage.removeItem('codementor_next_problem'); localStorage.removeItem('codementor_token'); localStorage.removeItem('codementor_user'); setToken(null); setUser(null); setLocation('/login'); },
  }), [token, user, setLocation]);
  return <QueryClientProvider client={queryClient}><AuthContext.Provider value={auth}><Switch>
    <Route path="/" component={Landing} />
    <Route path="/register">{token ? <RedirectDashboard /> : <AuthPage mode="register" />}</Route>
    <Route path="/login">{token ? <RedirectDashboard /> : <AuthPage mode="login" />}</Route>
    <Route path="/dashboard"><RequireAuth><DashboardPage /></RequireAuth></Route>
    <Route path="/practice"><RequireAuth><PracticePage /></RequireAuth></Route>
    <Route path="/doctor"><RequireAuth><DoctorPage /></RequireAuth></Route>
    <Route path="/history"><RequireAuth><HistoryPage /></RequireAuth></Route>
    <Route component={NotFound} />
  </Switch></AuthContext.Provider></QueryClientProvider>;
}

export default App;