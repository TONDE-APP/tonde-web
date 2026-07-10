'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'FR' | 'EN' | 'RN' | 'SW';

const translations: Record<Language, {
  title: string; subtitle: string; emailLabel: string; emailPlaceholder: string;
  passwordLabel: string; passwordPlaceholder: string; remember: string;
  forgotPassword: string; submit: string; loading: string; noAccount: string;
  signUp: string; errorInvalid: string; errorRequired: string;
  panelTitle: string; panelSubtitle: string; panelSlogan: string;
}> = {
  FR: {
    title: 'Connexion', subtitle: 'Bienvenue ! Veuillez entrer vos informations.',
    emailLabel: 'Adresse e-mail', emailPlaceholder: 'vous@exemple.com',
    passwordLabel: 'Mot de passe', passwordPlaceholder: '••••••••',
    remember: 'Se souvenir 30 jours', forgotPassword: 'Mot de passe oublié ?',
    submit: 'Se connecter', loading: 'Connexion...', noAccount: 'Pas encore de compte ?', signUp: "S'inscrire",
    errorInvalid: 'Identifiants incorrects. Veuillez réessayer.', errorRequired: 'Veuillez remplir tous les champs.',
    panelTitle: "Transformer l'attente en dignité.",
    panelSubtitle: "Apportez de l'ordre et de la clarté à vos usagers grâce à l'infrastructure de gestion de flux la plus performante de la sous-région.",
    panelSlogan: '« Votre temps a de la valeur. Tonde le respecte. »',
  },
  EN: {
    title: 'Sign In', subtitle: 'Welcome back! Please enter your details.',
    emailLabel: 'Email address', emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password', passwordPlaceholder: '••••••••',
    remember: 'Remember for 30 days', forgotPassword: 'Forgot password?',
    submit: 'Sign in', loading: 'Signing in...', noAccount: "Don't have an account?", signUp: 'Sign up',
    errorInvalid: 'Invalid credentials. Please try again.', errorRequired: 'Please fill in all fields.',
    panelTitle: 'Turning waiting into dignity.',
    panelSubtitle: 'Bring order and clarity to your users with the most powerful queue management infrastructure in the sub-region.',
    panelSlogan: '"Your time has value. Tonde respects it."',
  },
  RN: {
    title: 'Injira', subtitle: 'Murakaza neza! Injiza amakuru yawe.',
    emailLabel: 'Aderesi ya imeri', emailPlaceholder: 'wewe@urugero.com',
    passwordLabel: 'Ijambo ryibanga', passwordPlaceholder: '••••••••',
    remember: 'Ibuka iminsi 30', forgotPassword: 'Wibagiwe ijambo ryibanga?',
    submit: 'Injira', loading: 'Injira...', noAccount: 'Nta konti ufite?', signUp: 'Iyandikishe',
    errorInvalid: 'Amakuru atari yo. Gerageza nanone.', errorRequired: 'Uzuza imirima yose.',
    panelTitle: 'Guhindura iterero ubwiza.',
    panelSubtitle: "Zana umutunganyirizo no gucungura inzira z'abakiriya bawe.",
    panelSlogan: '« Igihe cyawe gifite agaciro. Tonde igishima. »',
  },
  SW: {
    title: 'Ingia', subtitle: 'Karibu tena! Tafadhali ingiza maelezo yako.',
    emailLabel: 'Anwani ya barua pepe', emailPlaceholder: 'wewe@mfano.com',
    passwordLabel: 'Nywila', passwordPlaceholder: '••••••••',
    remember: 'Kumbuka siku 30', forgotPassword: 'Umesahau nywila?',
    submit: 'Ingia', loading: 'Ingia...', noAccount: 'Huna akaunti?', signUp: 'Jisajili',
    errorInvalid: 'Vitambulisho vibaya. Jaribu tena.', errorRequired: 'Tafadhali jaza sehemu zote.',
    panelTitle: 'Kubadilisha kusubiri kuwa heshima.',
    panelSubtitle: 'Leta utaratibu na uwazi kwa watumiaji wako kupitia miundombinu bora zaidi ya usimamizi wa foleni.',
    panelSlogan: '"Wakati wako una thamani. Tonde unauenzi."',
  },
};

const LANGUAGES: Language[] = ['FR', 'EN', 'RN', 'SW'];
const languageFlags: Record<Language, string> = { FR: '🇫🇷', EN: '🇬🇧', RN: '🇧🇮', SW: '🇹🇿' };

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('FR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const t = translations[lang];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError(t.errorRequired); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    router.push('/dashboard');
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%', height: '44px', backgroundColor: '#0D1221',
    border: `1px solid ${focused ? '#6C47FF' : '#334155'}`, borderRadius: '8px',
    padding: '0 14px', fontSize: '14px', color: '#f1f5f9', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxShadow: focused ? '0 0 0 3px rgba(108,71,255,0.2)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' as const,
  });

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0E1A', fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT PANEL — Form ── */}
      <div className="flex flex-col w-full lg:w-1/2 min-h-screen" style={{ backgroundColor: '#0F1628' }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6C47FF' }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path d="M11 2L20 7V15L11 20L2 15V7L11 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <path d="M11 2V20M2 7L20 15M20 7L2 15" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-wide">TONDE</span>
          </div>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: '#1A2235', border: '1px solid #334155' }}>
            {LANGUAGES.map((l) => (
              <button key={l} onClick={() => setLang(l)} aria-label={`Langue ${l}`} aria-pressed={lang === l}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
                style={{ backgroundColor: lang === l ? '#6C47FF' : 'transparent', color: lang === l ? '#ffffff' : '#64748b' }}>
                <span aria-hidden="true">{languageFlags[l]}</span><span>{l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="font-bold mb-1" style={{ fontSize: '28px', color: '#ffffff', lineHeight: 1.25 }}>{t.title}</h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>{t.subtitle}</p>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg p-3 mb-6"
                style={{ backgroundColor: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)' }}>
                <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#F43F5E" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 11h.01" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: '13px', color: '#F43F5E' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                  {t.emailLabel}
                </label>
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                  placeholder={t.emailPlaceholder} disabled={loading} style={inputStyle(emailFocused)} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                  {t.passwordLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                    placeholder={t.passwordPlaceholder} disabled={loading}
                    style={{ ...inputStyle(passwordFocused), paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: '#6C47FF', cursor: 'pointer' }} />
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{t.remember}</span>
                </label>
                <button type="button" style={{ fontSize: '13px', color: '#6C47FF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                  {t.forgotPassword}
                </button>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', height: '44px', backgroundColor: '#6C47FF', color: '#ffffff', border: 'none',
                  borderRadius: '8px', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px', transition: 'background-color 0.15s', opacity: loading ? 0.8 : 1 }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#7c5cff'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#6C47FF'; }}>
                {loading ? (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"
                    style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2a10 10 0 0 1 10 10" /></svg>{t.loading}</>
                ) : t.submit}
              </button>
            </form>

            <p className="text-center mt-6" style={{ fontSize: '13px', color: '#64748b' }}>
              {t.noAccount}{' '}
              <button type="button" style={{ color: '#6C47FF', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {t.signUp}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center pb-6" style={{ fontSize: '11px', color: '#334155' }}>
          © {new Date().getFullYear()} TONDE. Tous droits réservés.
        </p>
      </div>

      {/* ── RIGHT PANEL — Visual ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden px-12"
        style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4f35c4 50%, #3b2a9e 100%)' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        <div className="relative z-10 text-center max-w-md">
          <h2 className="font-bold mb-3" style={{ fontSize: '34px', color: '#ffffff', lineHeight: 1.2 }}>{t.panelTitle}</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75, marginBottom: '24px' }}>{t.panelSubtitle}</p>
          <div style={{ borderLeft: '3px solid rgba(255,255,255,0.5)', paddingLeft: '16px', marginBottom: '40px' }}>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{t.panelSlogan}</p>
          </div>

          {/* Mock dashboard card */}
          <div className="rounded-xl p-4 text-left"
            style={{ backgroundColor: 'rgba(255,255,255,0.97)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)' }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Rapport Mensuel</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6C47FF' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Revenus</span>
                </div>
                <div className="flex items-center gap-1">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Dépenses</span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-2" style={{ height: '80px', marginBottom: '8px' }}>
              {[45, 65, 50, 80, 60, 90, 70, 85, 55, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div style={{ width: '100%', height: `${h * 0.8}%`, backgroundColor: i === 5 ? '#6C47FF' : '#e2e8f0', borderRadius: '3px 3px 0 0' }} />
                  <div style={{ width: '60%', height: `${h * 0.4}%`, backgroundColor: i === 5 ? '#4f35c4' : '#cbd5e1', borderRadius: '3px 3px 0 0' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct'].map((m) => (
                <span key={m} style={{ fontSize: '9px', color: '#94a3b8', flex: 1, textAlign: 'center' }}>{m}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: i === 0 ? '20px' : '8px', height: '8px', borderRadius: '4px',
                backgroundColor: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
