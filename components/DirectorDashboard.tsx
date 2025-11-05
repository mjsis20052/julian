import React, { useState, useMemo, useRef } from 'react';
import { User, UserProfileData, Note } from '../types';
import { HomeIcon, UsersIcon, ChartBarIcon, MessageSquareIcon, BellIcon, UserIcon as ProfileIcon, ChevronDownIcon, LogoutIcon, AppearanceIcon, BookOpenIcon } from './Icons';
import { Theme, BorderStyle, FontStyle } from '../App';
import { NotificationPanel } from './NotificationPanel';
import { ProfileView } from './ProfileView';
import { AppearanceView } from './AppearanceModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  userProfiles: Record<number, UserProfileData>;
  onUpdateProfile: (userId: number, data: UserProfileData) => void;
  userNotes: Note[];
  onUpdateNotes: (notes: Note[]) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  borderStyle: BorderStyle;
  setBorderStyle: (style: BorderStyle) => void;
  fontStyle: FontStyle;
  setFontStyle: (style: FontStyle) => void;
  notifications: any[];
  markNotificationsAsRead: (userId: number) => void;
}

const WelcomeBanner: React.FC<{ user: User, unreadNotifications: number, onBellClick: () => void }> = ({ user, unreadNotifications, onBellClick }) => (
    <div className="welcome-banner animate-fade-in relative">
        <button onClick={onBellClick} className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/10 transition-colors z-10">
            <BellIcon className="w-6 h-6 text-[--color-text-secondary]" />
            {unreadNotifications > 0 && <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-[--color-primary]"></span>}
        </button>
        <h1 className="text-4xl font-bold text-[--color-text-primary] mb-2">Bienvenido, {user.name.split(' ')[0]}</h1>
        <p className="text-lg text-[--color-text-secondary]">Resumen general de la institución.</p>
    </div>
);

const BottomNavButton: React.FC<{label: string, icon: React.ReactNode, active: boolean, onClick: () => void}> = ({ label, icon, active, onClick}) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full pt-3 pb-2 text-sm transition-colors duration-300 relative ${active ? 'text-[--color-accent]' : 'text-[--color-text-secondary] hover:text-[--color-text-primary]'}`}>
      {icon}
      <span className="text-xs font-medium text-center">{label}</span>
      {active && <div className="absolute bottom-0 w-10 h-1 bg-[--color-accent] rounded-full"></div>}
    </button>
);

export const DirectorDashboard: React.FC<DashboardProps> = (props) => {
  const { user, onLogout, allUsers, userProfiles, onUpdateProfile, userNotes, onUpdateNotes, theme, setTheme, borderStyle, setBorderStyle, fontStyle, setFontStyle, notifications, markNotificationsAsRead } = props;
  
  const [activeView, setActiveView] = useState('inicio');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const myNotifications = useMemo(() => notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [notifications, user.id]);
  const unreadNotifications = useMemo(() => myNotifications.filter(n => !n.read).length, [myNotifications]);

  const renderCurrentView = () => {
    switch(activeView) {
      case 'inicio': return <div className="glass-card p-8 text-center"><h2 className="text-2xl font-bold">Inicio</h2><p className="text-[--color-text-secondary]">Dashboard con KPIs (asistencia, rendimiento, etc.).</p></div>;
      case 'personal': return <div className="glass-card p-8 text-center"><h2 className="text-2xl font-bold">Personal</h2><p className="text-[--color-text-secondary]">Gestión de docentes, auxiliares y preceptores.</p></div>;
      case 'alumnos': return <div className="glass-card p-8 text-center"><h2 className="text-2xl font-bold">Alumnos</h2><p className="text-[--color-text-secondary]">Supervisión y gestión de alumnos.</p></div>;
      case 'estadisticas': return <div className="glass-card p-8 text-center"><h2 className="text-2xl font-bold">Estadísticas</h2><p className="text-[--color-text-secondary]">Reportes globales y análisis institucional.</p></div>;
      case 'comunicados': return <div className="glass-card p-8 text-center"><h2 className="text-2xl font-bold">Comunicados</h2><p className="text-[--color-text-secondary]">Envío de comunicados globales a toda la institución.</p></div>;
      case 'profile': return <ProfileView viewedUser={user} currentUser={user} profileData={userProfiles[user.id] || {}} onUpdateProfile={(data) => onUpdateProfile(user.id, data)} onBack={() => setActiveView('inicio')} />;
      case 'appearance': return <AppearanceView currentTheme={theme} onSetTheme={setTheme} currentBorderStyle={borderStyle} onSetBorderStyle={setBorderStyle} currentFontStyle={fontStyle} onSetFontStyle={setFontStyle} />;
      default: return null;
    }
  };

  const profilePic = userProfiles[user.id]?.profilePicture;
  
  return (
    <>
      <header className="bg-[--color-header-bg] backdrop-blur-lg sticky top-0 z-30 border-b border-black/10 transition-colors duration-500">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button onClick={() => setActiveView('inicio')} className="flex items-center gap-3 cursor-pointer"><BookOpenIcon className="h-12 w-12 text-[--color-accent]" /><span className="text-xl font-bold">Panel Directivo</span></button>
          <div className="relative z-50" ref={userMenuRef}>
            <button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 transition-colors">
              {profilePic ? <img src={profilePic} alt="Perfil" className="w-8 h-8 rounded-full object-cover bg-[--color-secondary]"/> : <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[--color-secondary]"><ProfileIcon className="w-5 h-5 text-[--color-accent]"/></div>}
              <ChevronDownIcon className={`w-5 h-5 text-[--color-text-secondary] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}/>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 solid-card animate-fade-in-up p-2" style={{animationDuration: '0.2s'}}>
                 <button onClick={() => setActiveView('profile')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><ProfileIcon/>Mi Perfil</button>
                 <button onClick={() => setActiveView('appearance')} className="w-full flex items-center gap-3 text-left px-3 py-2 text-[--color-text-primary] hover:bg-black/5 rounded-lg transition-colors"><AppearanceIcon/>Apariencia</button>
                 <div className="p-2 mt-2 border-t border-[--color-border]"><button onClick={onLogout} className="w-full flex items-center gap-3 text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><LogoutIcon/>Cerrar Sesión</button></div>
              </div>
            )}
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-24 md:pb-0 relative">
          <WelcomeBanner user={user} unreadNotifications={unreadNotifications} onBellClick={() => setIsNotificationPanelOpen(p => !p)} />
          {isNotificationPanelOpen && <NotificationPanel notifications={myNotifications} onClose={() => setIsNotificationPanelOpen(false)} onMarkAllRead={() => markNotificationsAsRead(user.id)} />}
          <div className="mt-8">{renderCurrentView()}</div>
        </div>
      </main>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[--color-primary] border-t border-[--color-border] z-40 shadow-[0_-2px_10px_rgba(var(--color-shadow-rgb),0.1)]">
        <nav className="flex justify-around items-center">
          <BottomNavButton label="Inicio" icon={<HomeIcon className="w-6 h-6"/>} active={activeView === 'inicio'} onClick={() => setActiveView('inicio')}/>
          <BottomNavButton label="Personal" icon={<UsersIcon className="w-6 h-6"/>} active={activeView === 'personal'} onClick={() => setActiveView('personal')}/>
          <BottomNavButton label="Alumnos" icon={<ProfileIcon className="w-6 h-6"/>} active={activeView === 'alumnos'} onClick={() => setActiveView('alumnos')}/>
          <BottomNavButton label="Stats" icon={<ChartBarIcon className="w-6 h-6"/>} active={activeView === 'estadisticas'} onClick={() => setActiveView('estadisticas')}/>
          <BottomNavButton label="Avisos" icon={<MessageSquareIcon className="w-6 h-6"/>} active={activeView === 'comunicados'} onClick={() => setActiveView('comunicados')}/>
        </nav>
      </div>
    </>
  );
};
