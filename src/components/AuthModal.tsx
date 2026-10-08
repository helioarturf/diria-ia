import React, { useState } from 'react';
import { UserProfile, ExperienceRole, ExperienceLevel, ResponseStyle } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: ExperienceRole;
  experienceLevel: ExperienceLevel;
  responseStyle: ResponseStyle;
  province: string;
  institutionOrFirm?: string;
  oaaNumber?: string;
  phone?: string;
  isRegisteredLawyer?: boolean;
  createdAt: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onUpdateUser: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

const DEMO_ACCOUNTS: {
  email: string;
  pass: string;
  user: AuthUser;
  label: string;
  badge: string;
}[] = [
  {
    email: 'advogado@diria.ao',
    pass: '123456',
    label: 'Dr. Manuel Francisco',
    badge: 'Advogado / OAA 4.892',
    user: {
      id: 'usr-adv-1',
      name: 'Dr. Manuel Francisco',
      email: 'advogado@diria.ao',
      role: 'Advogado / Jurista',
      experienceLevel: 'Avançado / Especialista',
      responseStyle: 'Parecer Técnico Forense',
      province: 'Luanda (Comarca Central, Viana, Belas, Cacuaco)',
      institutionOrFirm: 'Sociedade de Advogados & Associados',
      oaaNumber: '4892/OAA',
      phone: '+244 923 881 200',
      isRegisteredLawyer: true,
      createdAt: '2025-01-10',
    },
  },
  {
    email: 'cidadao@diria.ao',
    pass: '123456',
    label: 'Helena Santos',
    badge: 'Cidadã / Luanda',
    user: {
      id: 'usr-cid-2',
      name: 'Helena Santos',
      email: 'cidadao@diria.ao',
      role: 'Cidadão / Utente',
      experienceLevel: 'Iniciante',
      responseStyle: 'Prático & Directo',
      province: 'Luanda (Comarca Central, Viana, Belas, Cacuaco)',
      institutionOrFirm: 'Particular',
      phone: '+244 912 345 678',
      createdAt: '2025-02-15',
    },
  },
  {
    email: 'estudante@diria.ao',
    pass: '123456',
    label: 'Afonso Kiala',
    badge: 'Estudante FDUAN',
    user: {
      id: 'usr-est-3',
      name: 'Afonso Kiala',
      email: 'estudante@diria.ao',
      role: 'Estudante de Direito',
      experienceLevel: 'Intermédio',
      responseStyle: 'Equilibrado & Fundamentado',
      province: 'Luanda (Comarca Central, Viana, Belas, Cacuaco)',
      institutionOrFirm: 'Faculdade de Direito da UAN',
      phone: '+244 934 567 890',
      createdAt: '2025-03-01',
    },
  },
  {
    email: 'empresa@diria.ao',
    pass: '123456',
    label: 'Eng. Paulo Miranda',
    badge: 'Empresário / Gestor RH',
    user: {
      id: 'usr-emp-4',
      name: 'Eng. Paulo Miranda',
      email: 'empresa@diria.ao',
      role: 'Empresário / Gestor de RH',
      experienceLevel: 'Intermédio',
      responseStyle: 'Prático & Directo',
      province: 'Benguela (Comarca de Benguela e Lobito)',
      institutionOrFirm: 'Grupo Comercial do Sul, Lda.',
      phone: '+244 945 678 901',
      createdAt: '2025-03-12',
    },
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onUpdateUser,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(() => {
    if (currentUser) return 'profile';
    return initialMode;
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<ExperienceRole>('Cidadão / Utente');
  const [regLevel, setRegLevel] = useState<ExperienceLevel>('Iniciante');
  const [regStyle, setRegStyle] = useState<ResponseStyle>('Prático & Directo');
  const [regProvince, setRegProvince] = useState('Luanda (Comarca Central, Viana, Belas, Cacuaco)');
  const [regInstitution, setRegInstitution] = useState('');
  const [regOaa, setRegOaa] = useState('');
  const [regError, setRegError] = useState('');

  // Profile edit form state (when logged in)
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editInstitution, setEditInstitution] = useState(currentUser?.institutionOrFirm || '');
  const [editOaa, setEditOaa] = useState(currentUser?.oaaNumber || '');
  const [editProvince, setEditProvince] = useState(currentUser?.province || 'Luanda');
  const [editRole, setEditRole] = useState<ExperienceRole>(currentUser?.role || 'Cidadão / Utente');
  const [editLevel, setEditLevel] = useState<ExperienceLevel>(currentUser?.experienceLevel || 'Iniciante');
  const [editStyle, setEditStyle] = useState<ResponseStyle>(currentUser?.responseStyle || 'Prático & Directo');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync mode with currentUser if it changes
  React.useEffect(() => {
    if (currentUser) {
      setMode('profile');
      setEditName(currentUser.name);
      setEditPhone(currentUser.phone || '');
      setEditInstitution(currentUser.institutionOrFirm || '');
      setEditOaa(currentUser.oaaNumber || '');
      setEditProvince(currentUser.province);
      setEditRole(currentUser.role);
      setEditLevel(currentUser.experienceLevel);
      setEditStyle(currentUser.responseStyle);
    } else {
      setMode(initialMode);
    }
  }, [currentUser, initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle Role Change to preset defaults
  const handleRoleSelection = (role: ExperienceRole) => {
    setRegRole(role);
    if (role === 'Advogado / Jurista') {
      setRegLevel('Avançado / Especialista');
      setRegStyle('Parecer Técnico Forense');
    } else if (role === 'Estudante de Direito') {
      setRegLevel('Intermédio');
      setRegStyle('Equilibrado & Fundamentado');
    } else if (role === 'Empresário / Gestor de RH') {
      setRegLevel('Intermédio');
      setRegStyle('Prático & Directo');
    } else {
      setRegLevel('Iniciante');
      setRegStyle('Prático & Directo');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Por favor preencha o e-mail e a palavra-passe.');
      return;
    }

    // Check demo accounts first
    const matchedDemo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (matchedDemo) {
      if (loginPassword.length < 4) {
        setLoginError('A palavra-passe deve ter pelo menos 4 caracteres.');
        return;
      }
      onLogin(matchedDemo.user);
      onClose();
      return;
    }

    // Check localStorage registered accounts
    try {
      const storedUsersRaw = localStorage.getItem('diria_registered_users');
      if (storedUsersRaw) {
        const storedUsers: (AuthUser & { passwordHash?: string })[] = JSON.parse(storedUsersRaw);
        const existing = storedUsers.find(
          (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
        );
        if (existing) {
          onLogin(existing);
          onClose();
          return;
        }
      }
    } catch {
      // ignore
    }

    // Allow instant standard login for custom email
    const inferredRole: ExperienceRole = loginEmail.includes('adv')
      ? 'Advogado / Jurista'
      : loginEmail.includes('est')
      ? 'Estudante de Direito'
      : loginEmail.includes('emp')
      ? 'Empresário / Gestor de RH'
      : 'Cidadão / Utente';

    const customUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: loginEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: loginEmail.trim(),
      role: inferredRole,
      experienceLevel: inferredRole === 'Advogado / Jurista' ? 'Avançado / Especialista' : 'Intermédio',
      responseStyle: inferredRole === 'Advogado / Jurista' ? 'Parecer Técnico Forense' : 'Prático & Directo',
      province: 'Luanda (Comarca Central, Viana, Belas, Cacuaco)',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onLogin(customUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Indique o seu nome completo ou denominação.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Indique um endereço de e-mail válido.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('A palavra-passe deve conter no mínimo 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('As palavras-passe não coincidem.');
      return;
    }
    if (regRole === 'Advogado / Jurista' && !regOaa.trim()) {
      setRegError('Para o perfil de Advogado/Jurista, informe o número de Cédula OAA.');
      return;
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      role: regRole,
      experienceLevel: regLevel,
      responseStyle: regStyle,
      province: regProvince,
      institutionOrFirm: regInstitution.trim(),
      oaaNumber: regOaa.trim(),
      isRegisteredLawyer: regRole === 'Advogado / Jurista' && !!regOaa.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Save locally
    try {
      const stored = localStorage.getItem('diria_registered_users');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newUser);
      localStorage.setItem('diria_registered_users', JSON.stringify(list));
    } catch {
      // ignore
    }

    onLogin(newUser);
    onClose();
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: AuthUser = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim(),
      institutionOrFirm: editInstitution.trim(),
      oaaNumber: editOaa.trim(),
      province: editProvince,
      role: editRole,
      experienceLevel: editLevel,
      responseStyle: editStyle,
      isRegisteredLawyer: editRole === 'Advogado / Jurista' && !!editOaa.trim(),
    };

    onUpdateUser(updated);
    setProfileSuccess(true);
    setTimeout(() => {
      setProfileSuccess(false);
      onClose();
    }, 800);
  };

  const loadDemo = (demo: (typeof DEMO_ACCOUNTS)[0]) => {
    setLoginEmail(demo.email);
    setLoginPassword(demo.pass);
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[22px] text-amber-400">
                {mode === 'profile' ? 'manage_accounts' : mode === 'register' ? 'person_add' : 'lock'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold font-headline text-white tracking-tight">
                  {mode === 'profile'
                    ? 'Conta & Perfil do Utilizador'
                    : mode === 'register'
                    ? 'Criar Nova Conta na DirIA'
                    : 'Entrar na Conta'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono border border-amber-400/30">
                  Angola
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {mode === 'profile'
                  ? 'Gira as credenciais, província e adaptação da inteligência jurídica'
                  : mode === 'register'
                  ? 'Acesso completo ao directório OAA, calculadoras e minutas'
                  : 'Aceda às suas consultas salvas e perfil personalizado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switcher when not in profile edit */}
        {!currentUser && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRegError('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              Criar Conta (Cadastro)
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* ===================== MODE: LOGIN ===================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2 text-xs">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-rose-600">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: advogado@diria.ao ou o seu e-mail"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Em caso de perda de acesso, utilize as contas rápidas de demonstração ou crie uma nova conta com o seu e-mail institucional.')}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Esqueceu a palavra-passe?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Palavra-passe de acesso"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Entrar na Conta
              </button>

              {/* Demo Profiles One-Click Access */}
              <div className="pt-3 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Acesso Rápido de Teste (Predefinições)
                  </span>
                  <span className="text-[10px] text-slate-400">1-clique</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => loadDemo(demo)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        loginEmail === demo.email
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="font-semibold text-slate-900 text-xs truncate">
                        {demo.label}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate mt-0.5">
                        {demo.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setRegError('');
                    }}
                    className="font-semibold text-slate-900 hover:underline cursor-pointer"
                  >
                    Registar agora gratuitamente
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ===================== MODE: REGISTER ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2 text-xs">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-rose-600">error</span>
                  <span>{regError}</span>
                </div>
              )}

              {/* Step 1: Personal info */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="ex: Dr. António Van-Dúnem"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Correio Electrónico (E-mail) *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ex: contacto@escritorio.ao"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Palavra-passe (mín. 6 carac.) *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Confirmar Palavra-passe *
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Contacto Telefónico / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+244 923 000 000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Província / Comarca
                    </label>
                    <select
                      value={regProvince}
                      onChange={(e) => setRegProvince(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    >
                      <option value="Luanda (Comarca Central, Viana, Belas, Cacuaco)">Luanda</option>
                      <option value="Benguela (Comarca de Benguela e Lobito)">Benguela</option>
                      <option value="Huíla (Comarca do Lubango)">Huíla</option>
                      <option value="Huambo">Huambo</option>
                      <option value="Cabinda">Cabinda</option>
                      <option value="Cuanza Sul (Sumbe/Porto Amboim)">Cuanza Sul</option>
                      <option value="Cuanza Norte (Ndalatando)">Cuanza Norte</option>
                      <option value="Malanje">Malanje</option>
                      <option value="Uíge">Uíge</option>
                      <option value="Zaire (Soyo/Mbanza Kongo)">Zaire</option>
                      <option value="Namibe">Namibe</option>
                      <option value="Cunene">Cunene</option>
                      <option value="Bié">Bié</option>
                      <option value="Moxico">Moxico</option>
                      <option value="Lunda Norte">Lunda Norte</option>
                      <option value="Lunda Sul">Lunda Sul</option>
                      <option value="Cuando Cubango">Cuando Cubango</option>
                      <option value="Bengo (Caxito)">Bengo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Experience Profile Selection */}
              <div className="pt-2 border-t border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Selecione o seu Perfil de Utilizador
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        role: 'Cidadão / Utente',
                        icon: 'person',
                        desc: 'Linguagem simples, direitos e passos práticos',
                      },
                      {
                        role: 'Advogado / Jurista',
                        icon: 'gavel',
                        desc: 'Rigor forense, artigos, peças e prazos',
                      },
                      {
                        role: 'Estudante de Direito',
                        icon: 'school',
                        desc: 'Fundamentação doutrinária e sistemática',
                      },
                      {
                        role: 'Empresário / Gestor de RH',
                        icon: 'business_center',
                        desc: 'Riscos trabalhistas, AGT, conformidade',
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleRoleSelection(item.role)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        regRole === item.role
                          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-800">
                          {item.icon}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs truncate">
                          {item.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 leading-tight">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lawyer specific fields */}
              {regRole === 'Advogado / Jurista' && (
                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-purple-900 font-semibold text-xs">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Dados da Ordem dos Advogados de Angola (OAA)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-purple-950 mb-0.5">
                        N.º de Cédula Profissional OAA *
                      </label>
                      <input
                        type="text"
                        value={regOaa}
                        onChange={(e) => setRegOaa(e.target.value)}
                        placeholder="ex: 4.892/OAA"
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-purple-950 mb-0.5">
                        Escritório ou Sociedade
                      </label>
                      <input
                        type="text"
                        value={regInstitution}
                        onChange={(e) => setRegInstitution(e.target.value)}
                        placeholder="ex: Miranda & Associados"
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {regRole !== 'Advogado / Jurista' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Instituição / Universidade / Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={regInstitution}
                    onChange={(e) => setRegInstitution(e.target.value)}
                    placeholder="ex: Faculdade de Direito UAN, Sonangol, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                Finalizar Cadastro e Aceder
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Já possui conta criada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginError('');
                    }}
                    className="font-semibold text-slate-900 hover:underline cursor-pointer"
                  >
                    Iniciar Sessão
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ===================== MODE: PROFILE & LOGOUT ===================== */}
          {mode === 'profile' && currentUser && (
            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  <span>Conta e perfil actualizados com sucesso!</span>
                </div>
              )}

              {/* User badge display */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{currentUser.name}</h3>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-medium">
                        {currentUser.role}
                      </span>
                      {currentUser.oaaNumber && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-medium">
                          {currentUser.oaaNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMode('login');
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Terminar Sessão
                </button>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Contacto Telefónico
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+244 923 000 000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Papel / Perfil
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as ExperienceRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Cidadão / Utente">Cidadão / Utente</option>
                    <option value="Estudante de Direito">Estudante de Direito</option>
                    <option value="Advogado / Jurista">Advogado / Jurista</option>
                    <option value="Empresário / Gestor de RH">Empresário / Gestor de RH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nível de Experiência
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermédio">Intermédio</option>
                    <option value="Avançado / Especialista">Avançado / Especialista</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Estilo de Resposta Desejado
                  </label>
                  <select
                    value={editStyle}
                    onChange={(e) => setEditStyle(e.target.value as ResponseStyle)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Prático & Directo">Prático & Directo</option>
                    <option value="Equilibrado & Fundamentado">Equilibrado & Fundamentado</option>
                    <option value="Parecer Técnico Forense">Parecer Técnico Forense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Província / Comarca
                  </label>
                  <input
                    type="text"
                    value={editProvince}
                    onChange={(e) => setEditProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {editRole === 'Advogado / Jurista' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Cédula OAA
                    </label>
                    <input
                      type="text"
                      value={editOaa}
                      onChange={(e) => setEditOaa(e.target.value)}
                      placeholder="ex: 4.892/OAA"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Escritório / Sociedade
                    </label>
                    <input
                      type="text"
                      value={editInstitution}
                      onChange={(e) => setEditInstitution(e.target.value)}
                      placeholder="ex: Ferreira & Advogados"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
