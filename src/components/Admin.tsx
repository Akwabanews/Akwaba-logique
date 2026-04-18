import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Plus, 
  Trash, 
  Edit3, 
  Save, 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ArrowLeft,
  Search,
  ChevronRight,
  Eye,
  Send,
  Copy,
  Check,
  Calendar,
  X,
  Smartphone,
  MapPin,
  LogIn,
  Youtube,
  ImagePlus,
  Video,
  MessageSquare,
  Mail,
  Phone,
  Map as MapIcon,
  Info,
  Facebook,
  Twitter,
  Users,
  AlertTriangle,
  Megaphone,
  Globe,
  Tag,
  MonitorOff,
  User,
  Camera,
  Type,
  Bold,
  Italic,
  Link,
  List as ListIcon,
  TrendingUp,
  Mic,
  Music,
  Headset
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article, Event, SiteSettings, Comment, Subscriber, MediaAsset, SupportMessage } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FirestoreService } from '../lib/firebase';

export const AdminLogin = ({ onLogin, onEmailLogin, onPhoneLogin }: { onLogin: () => void, onEmailLogin: () => void, onPhoneLogin: () => void }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
      >
        <div className="flex flex-col items-center gap-6 mb-8 text-center">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Lock size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black">Espace Admin</h2>
            <p className="text-slate-400 text-sm mt-1">Authentification requise pour accéder au tableau de bord.</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={onLogin}
            className="w-full bg-white border-2 border-slate-100 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <LogIn size={20} className="text-primary" />
            Continuer avec Google
          </button>
          
          <button 
            onClick={onEmailLogin}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <Mail size={20} />
            Email / Mot de passe
          </button>
          
          <button 
            onClick={onPhoneLogin}
            className="w-full bg-white border-2 border-slate-100 text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3"
          >
            <Phone size={20} />
            Mobile (OTP)
          </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-widest">
          Akwaba Info • Système de Gestion de Contenu
        </p>
      </motion.div>
    </div>
  );
};

export const AdminDashboard = ({ 
  articles, 
  events,
  comments,
  subscribers,
  mediaLibrary,
  settings,
  stats,
  onEditArticle,
  onEditEvent, 
  onCreateArticle,
  onCreateEvent, 
  onDeleteArticle,
  onDeleteEvent, 
  onDeleteComment,
  onSaveSettings,
  onLogout,
  onGenerateCode 
}: { 
  articles: Article[], 
  events: Event[],
  comments: Comment[],
  subscribers: Subscriber[],
  mediaLibrary: MediaAsset[],
  settings: SiteSettings,
  stats?: any,
  onEditArticle: (a: Article) => void,
  onEditEvent: (e: Event) => void,
  onCreateArticle: () => void,
  onCreateEvent: () => void,
  onDeleteArticle: (id: string) => void,
  onDeleteEvent: (id: string) => void,
  onDeleteComment: (id: string) => void,
  onSaveSettings: (s: SiteSettings) => void,
  onLogout: () => void,
  onGenerateCode: () => void
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'events' | 'comments' | 'subscribers' | 'media' | 'settings' | 'analytics' | 'alerts' | 'support'>('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);
  const [newCategory, setNewCategory] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTopic, setAlertTopic] = useState('Urgent');

  // Support Management
  const [allSupportMessages, setAllSupportMessages] = useState<Record<string, SupportMessage[]>>({});
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (activeTab === 'support') {
      const unsub = FirestoreService.subscribeToAllSupportMessages((userId, msgs) => {
        setAllSupportMessages(prev => ({ ...prev, [userId]: msgs }));
      });
      return unsub;
    }
  }, [activeTab]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeChatUserId) return;
    const adminMsg: SupportMessage = {
      id: Date.now().toString(),
      userId: activeChatUserId,
      userName: 'Support Akwaba',
      content: replyText,
      date: new Date().toISOString(),
      isAdmin: true
    };
    setReplyText('');
    await FirestoreService.sendSupportMessage(adminMsg);
  };

  const onSendAlert = async () => {
    if (!alertTitle || !alertMessage) return;
    const notif = {
        id: Date.now().toString(),
        userId: 'global',
        topic: alertTopic,
        title: alertTitle,
        message: alertMessage,
        date: new Date().toISOString(),
        read: false,
        type: alertTopic === 'Urgent' ? 'urgent' : 'article'
    } as any;
    
    // In a real app we'd call FirestoreService.sendNotification
    // For now we'll just alert that it's sent
    alert(`Alerte envoyée : ${alertTitle}`);
    setAlertTitle('');
    setAlertMessage('');
  };
  
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComments = comments.filter(c => 
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredMedia = mediaLibrary.filter(m => m.url.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight">Tableau de Bord</h2>
            <p className="text-slate-400 text-sm">Contrôle total : articles, événements, commentaires, SEO et paramètres.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onGenerateCode}
            className="px-5 py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all flex items-center gap-2 text-sm"
          >
            <Copy size={18} /> Export Code
          </button>
          {(activeTab === 'articles' || activeTab === 'events') && (
            <button 
              onClick={activeTab === 'articles' ? onCreateArticle : onCreateEvent}
              className="px-5 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
            >
              <Plus size={18} /> {activeTab === 'articles' ? 'Nouvel Article' : 'Nouvel Événement'}
            </button>
          )}
          <button 
            onClick={onLogout}
            className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button 
          onClick={() => setActiveTab('articles')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'articles' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Articles
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'events' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Agenda
        </button>
        <button 
          onClick={() => setActiveTab('comments')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'comments' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Modération
        </button>
        <button 
          onClick={() => setActiveTab('media')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'media' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Médias
        </button>
        <button 
          onClick={() => setActiveTab('subscribers')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'subscribers' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Abonnés
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'alerts' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Alertes Push
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'analytics' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Statistiques
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'support' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Support Client
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "px-6 py-4 font-black transition-all border-b-2 shrink-0 text-sm",
            activeTab === 'settings' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          Paramètres
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          {activeTab !== 'settings' && (
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher..."
                className="w-full bg-white border border-slate-100 rounded-2xl pl-14 pr-6 py-4 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {activeTab === 'settings' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
              {/* Infos Contact */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-8">
                <h3 className="text-xl font-black flex items-center gap-2"><Mail className="text-primary" /> Coordonnées du Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Contact</label>
                    <input 
                      type="email"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      value={tempSettings.email}
                      onChange={(e) => setTempSettings({...tempSettings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Téléphone</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      value={tempSettings.phone}
                      onChange={(e) => setTempSettings({...tempSettings, phone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Réseaux Sociaux</label>
                    <div className="grid grid-cols-3 gap-4">
                      <input type="text" placeholder="Facebook URL" className="bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none" value={tempSettings.facebookUrl} onChange={e => setTempSettings({...tempSettings, facebookUrl: e.target.value})} />
                      <input type="text" placeholder="Twitter URL" className="bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none" value={tempSettings.twitterUrl} onChange={e => setTempSettings({...tempSettings, twitterUrl: e.target.value})} />
                      <input type="text" placeholder="Instagram URL" className="bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none" value={tempSettings.instagramUrl} onChange={e => setTempSettings({...tempSettings, instagramUrl: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Breaking News Banner */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2 text-red-500"><Megaphone /> Bandeau Urgent</h3>
                <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                  <input 
                    type="checkbox" 
                    checked={tempSettings.urgentBannerActive}
                    onChange={e => setTempSettings({...tempSettings, urgentBannerActive: e.target.checked})}
                    className="w-6 h-6 accent-red-500"
                  />
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-red-700">Activer le bandeau d'alerte en haut du site</label>
                    <input 
                      type="text" 
                      placeholder="Texte du message urgent..."
                      className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border border-red-200"
                      value={tempSettings.urgentBannerText}
                      onChange={e => setTempSettings({...tempSettings, urgentBannerText: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2 text-slate-700"><MonitorOff /> Mode Maintenance</h3>
                <div className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
                  tempSettings.maintenanceMode ? "bg-slate-100 border-slate-300" : "bg-emerald-50 border-emerald-100"
                )}>
                  <input 
                    type="checkbox" 
                    checked={tempSettings.maintenanceMode}
                    onChange={e => setTempSettings({...tempSettings, maintenanceMode: e.target.checked})}
                    className="w-6 h-6 accent-slate-900"
                  />
                  <div>
                    <p className="text-sm font-bold">Le site est {tempSettings.maintenanceMode ? "Hors ligne (Maintenance)" : "En ligne"}</p>
                    <p className="text-[10px] text-slate-500">Activez ce mode pour suspendre l'accès public durant des travaux.</p>
                  </div>
                </div>
              </div>

              {/* À Propos */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2"><Info className="text-primary" /> À propos du Journal</h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="aboutText"]') as HTMLTextAreaElement;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const selectedText = text.substring(start, end);
                        const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                        setTempSettings({...tempSettings, aboutText: newText});
                      }}
                      className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                      title="Gras"
                    >
                      <Bold size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="aboutText"]') as HTMLTextAreaElement;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const selectedText = text.substring(start, end);
                        const newText = text.substring(0, start) + `\n### ${selectedText}` + text.substring(end);
                        setTempSettings({...tempSettings, aboutText: newText});
                      }}
                      className="px-2 py-1 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500 text-[10px] font-black"
                      title="Titre"
                    >
                      H3
                    </button>
                  </div>
                </div>
                <textarea 
                  name="aboutText"
                  value={tempSettings.aboutText}
                  onChange={e => setTempSettings({...tempSettings, aboutText: e.target.value})}
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[200px]"
                  placeholder="Décrivez votre journal, sa mission, son équipe..."
                />
              </div>

              {/* Ads Configuration */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2"><Globe /> Emplacements Publicitaires (JSON/HTML)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <textarea placeholder="Ad Slot Header" className="bg-slate-100 rounded-xl p-4 text-xs font-mono h-24" value={tempSettings.adSlotHeader} onChange={e => setTempSettings({...tempSettings, adSlotHeader: e.target.value})} />
                  <textarea placeholder="Ad Slot Sidebar" className="bg-slate-100 rounded-xl p-4 text-xs font-mono h-24" value={tempSettings.adSlotSidebar} onChange={e => setTempSettings({...tempSettings, adSlotSidebar: e.target.value})} />
                </div>
              </div>

              {/* Dynamic Categories */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-2"><Tag /> Gestion des Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {tempSettings.categories?.map((cat, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-black">
                      {cat}
                      <button onClick={() => setTempSettings({...tempSettings, categories: tempSettings.categories.filter(c => c !== cat)})} className="text-red-500 hover:scale-110"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Nouvelle catégorie..."
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="flex-1 bg-slate-50 rounded-xl px-4 py-2 text-sm outline-none border border-slate-100"
                  />
                  <button 
                    onClick={() => {
                      if(newCategory && !tempSettings.categories.includes(newCategory)) {
                        setTempSettings({...tempSettings, categories: [...tempSettings.categories, newCategory]});
                        setNewCategory('');
                      }
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="sticky bottom-4 z-10 flex justify-end">
                <button 
                  onClick={() => onSaveSettings(tempSettings)}
                  className="bg-primary text-white font-black px-12 py-5 rounded-3xl hover:scale-105 transition-all shadow-2xl shadow-primary/40 flex items-center gap-3 border-4 border-white"
                >
                  <Save size={24} /> ENREGISTRER TOUTE LA CONFIGURATION
                </button>
              </div>
            </motion.div>
          ) : activeTab === 'support' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[70vh]"
            >
              {/* Sidebar: Chats List */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black italic">Support Direct</h3>
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {Object.keys(allSupportMessages).length === 0 ? (
                    <div className="p-10 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <MessageSquare size={24} />
                      </div>
                      <p className="text-xs text-slate-400 font-bold">Aucun chat actif.</p>
                    </div>
                  ) : (
                    Object.entries(allSupportMessages).map(([userId, msgs]) => {
                      const lastMsg = msgs[msgs.length - 1];
                      const user = msgs.find(m => !m.isAdmin);
                      return (
                        <div 
                          key={userId}
                          onClick={() => setActiveChatUserId(userId)}
                          className={cn(
                            "p-5 cursor-pointer transition-all hover:bg-slate-50 flex gap-4 items-center",
                            activeChatUserId === userId ? "bg-primary/5 border-r-4 border-primary" : ""
                          )}
                        >
                          <img 
                            src={user?.userPhoto || `https://ui-avatars.com/api/?name=${user?.userName || 'User'}`} 
                            className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-sm truncate">{user?.userName || 'Utilisateur'}</h4>
                              <span className="text-[9px] text-slate-400 font-bold">{format(new Date(lastMsg.date), 'HH:mm')}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{lastMsg.isAdmin ? 'Vous: ' : ''}{lastMsg.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* main: Chat view */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col relative">
                {activeChatUserId ? (
                  <>
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                        {allSupportMessages[activeChatUserId][0]?.userName[0] || '?'}
                      </div>
                      <div>
                        <h3 className="font-black text-sm">{allSupportMessages[activeChatUserId][0]?.userName}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeChatUserId}</p>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 african-pattern">
                      {allSupportMessages[activeChatUserId].map((msg) => (
                        <div key={msg.id} className={cn("flex flex-col", msg.isAdmin ? "items-end" : "items-start")}>
                          <div className={cn(
                            "max-w-[70%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm",
                            msg.isAdmin ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                            {msg.isAdmin ? 'Moi (Support)' : msg.userName} • {format(new Date(msg.date), 'HH:mm')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 border-t border-slate-100 flex gap-4 bg-white">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                        placeholder="Répondre à l'utilisateur..."
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                      <button 
                        onClick={handleSendReply}
                        className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Send size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <Headset size={48} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic">Gestionnaire de Support</h3>
                      <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Sélectionnez une discussion à gauche pour commencer à répondre aux lecteurs en temps réel.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'alerts' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-200">
                     <Megaphone size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black">Diffusion d'Alerte</h3>
                     <p className="text-xs text-slate-400">Envoyez une notification push à tous les utilisateurs ou selon une catégorie.</p>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sujet / Thème</label>
                      <select 
                        className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100"
                        value={alertTopic}
                        onChange={e => setAlertTopic(e.target.value)}
                      >
                        <option value="Urgent">⚠️ Urgent (Flash Info)</option>
                        <option value="Afrique">🌍 Afrique</option>
                        <option value="Tech">💻 Technologie</option>
                        <option value="Économie">📈 Économie</option>
                        <option value="Politique">🏛️ Politique</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Titre de l'alerte</label>
                       <input 
                         type="text"
                         placeholder="Ex: Coupure d'électricité majeure..."
                         className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none border border-slate-100"
                         value={alertTitle}
                         onChange={e => setAlertTitle(e.target.value)}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message complet</label>
                    <textarea 
                      placeholder="Contenu de la notification..."
                      className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm outline-none border border-slate-100 min-h-[100px]"
                      value={alertMessage}
                      onChange={e => setAlertMessage(e.target.value)}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      onClick={onSendAlert}
                      className="w-full md:w-auto bg-red-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-200"
                    >
                      <Send size={18} /> DIFFUSER L'ALERTE MAINTENANT
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-4">
                <h4 className="font-bold flex items-center gap-2"><Smartphone size={18} /> Conseils pour les notifications</h4>
                <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                  <li>Utilisez des titres courts et percutants (moins de 50 caractères).</li>
                  <li>Le message doit encourager le clic sans être trompeur.</li>
                  <li>Les alertes <strong>Urgentes</strong> s'affichent sous forme de bandeau rouge sur le site.</li>
                  <li>Ciblez des catégories spécifiques pour augmenter le taux de lecture.</li>
                </ul>
              </div>
            </motion.div>
          ) : activeTab === 'analytics' ? (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-2">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Total Vues</div>
                  <div className="text-4xl font-black italic">{(stats?.totalViews || articles.reduce((acc, a) => acc + (a.views || 0), 0)).toLocaleString()}</div>
                  <div className="text-emerald-500 text-[10px] font-bold">+12% cette semaine</div>
                </div>
                <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-2">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Total Likes</div>
                  <div className="text-4xl font-black italic">{articles.reduce((acc, a) => acc + (a.likes || 0), 0).toLocaleString()}</div>
                  <div className="text-emerald-500 text-[10px] font-bold">+5% cette semaine</div>
                </div>
                <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-xl space-y-2">
                  <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Abonnés</div>
                  <div className="text-4xl font-black italic">{(stats?.totalSubscribers || subscribers.length).toLocaleString()}</div>
                  <div className="text-emerald-500 text-[10px] font-bold">En progression</div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black italic">Performance par Catégorie</h3>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Vues Cumulées</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {(stats?.categoryStats || ['Afrique', 'Monde', 'Politique', 'Tech', 'Sport']).map((item: any) => {
                    const cat = typeof item === 'string' ? item : item.name;
                    const catViews = typeof item === 'string' ? articles.filter(a => a.category === cat).reduce((acc, a) => acc + (a.views || 0), 0) : item.count;
                    const percentage = Math.min(100, (catViews / 5000) * 100);
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span>{cat}</span>
                          <span>{catViews.toLocaleString()} vues</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-white space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <TrendingUp size={120} />
                </div>
                <h3 className="text-xl font-black italic">Articles les plus performants</h3>
                <div className="space-y-4">
                  {articles.sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-primary font-black italic text-lg">#{i+1}</span>
                        <span className="font-bold text-sm line-clamp-1">{a.title}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400">{(a.views || 0).toLocaleString()} vues</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'subscribers' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-black text-xl">Liste des Abonnés Newsletter</h3>
                  <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                    <Copy size={14}/> Télécharger CSV
                  </button>
               </div>
               <div className="divide-y divide-slate-100">
                  {filteredSubscribers.map(sub => (
                    <div key={sub.id} className="flex justify-between items-center px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{sub.email[0].toUpperCase()}</div>
                        <span className="text-sm font-medium">{sub.email}</span>
                      </div>
                      <span className="text-xs text-slate-400">{sub.date}</span>
                    </div>
                  ))}
               </div>
            </div>
          ) : activeTab === 'media' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group relative">
                   <div className="aspect-square bg-slate-100">
                      {item.type === 'image' ? (
                        <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500"><Youtube size={32}/></div>
                      )}
                   </div>
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       <button onClick={() => {navigator.clipboard.writeText(item.url); alert("Copié !")}} className="p-2 bg-white rounded-full text-slate-900"><Copy size={16}/></button>
                       <button className="p-2 bg-white rounded-full text-red-500"><Trash size={16}/></button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-4 bg-slate-50/50 border-bottom border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-6">Nom / Titre</div>
                <div className="col-span-2">{activeTab === 'articles' ? 'Catégorie' : activeTab === 'events' ? 'Lieu' : 'Date'}</div>
                <div className="col-span-2">Date / Likes</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-100">
                {activeTab === 'articles' && filteredArticles.map(article => (
                  <div key={article.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {article.image && <img src={article.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">{article.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Par {article.author}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs font-bold text-slate-600 italic">
                      {article.category}
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono">
                      {article.date}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onEditArticle(article)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteArticle(article.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'events' && filteredEvents.map(event => (
                  <div key={event.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {event.image && <img src={event.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight line-clamp-1">{event.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{event.category}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs font-bold text-slate-600 line-clamp-1">
                      {event.location}
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono">
                      {event.date}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onEditEvent(event)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {activeTab === 'comments' && filteredComments.map(comment => (
                  <div key={comment.id} className="grid grid-cols-12 px-6 py-4 items-start hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 space-y-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{comment.username}</span>
                        <span className="text-[10px] text-slate-400">• {(comment as any).articleTitle || 'Article inconnu'}</span>
                      </div>
                      <p className="text-xs text-slate-600 italic line-clamp-2">"{comment.content}"</p>
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 font-mono mt-1">
                      {comment.date}
                    </div>
                    <div className="col-span-2 text-xs text-slate-400 mt-1">
                      {comment.likes} J'aime
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pr-2">
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-2 bg-slate-50 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {((activeTab === 'articles' && filteredArticles.length === 0) || 
                  (activeTab === 'events' && filteredEvents.length === 0) || 
                  (activeTab === 'comments' && filteredComments.length === 0)) && (
                  <div className="py-20 text-center space-y-4">
                    <div className="p-4 bg-slate-50 w-20 h-20 rounded-full mx-auto flex items-center justify-center text-slate-200">
                      <FileText size={40} />
                    </div>
                    <p className="text-slate-400 font-medium italic">Aucun contenu trouvé.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-slate-400">Statistiques</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold uppercase text-slate-400">Total Articles</p>
                <p className="text-3xl font-black mt-1 font-mono tracking-tighter">{articles.length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-[10px] font-bold uppercase text-slate-400">Commentaires</p>
                <p className="text-3xl font-black mt-1 font-mono tracking-tighter">{comments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              <Settings size={20} />
              <h4 className="font-bold">Accès Rapide</h4>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('settings')}
                className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold flex items-center gap-2"
              >
                <Info size={14} /> Modifier "À Propos"
              </button>
              <button 
                onClick={() => setActiveTab('comments')}
                className="w-full text-left px-4 py-3 bg-slate-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold flex items-center gap-2"
              >
                <MessageSquare size={14} /> Modération Globale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminEditor = ({ 
  type,
  data, 
  categories,
  onSave, 
  onCancel 
}: { 
  type: 'article' | 'event',
  data: any, 
  categories: string[],
  onSave: (d: any) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState<any>({
    id: data.id || Date.now().toString(),
    slug: data.slug || '',
    title: data.title || '',
    date: data.date || new Date().toISOString().split('T')[0],
    image: data.image || '',
    video: data.video || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    imageCredit: data.imageCredit || '',
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    socialImage: data.socialImage || '',
    status: data.status || 'published',
    scheduledAt: data.scheduledAt || '',
    audioUrl: data.audioUrl || '',
    gallery: data.gallery || [],
    isPremium: data.isPremium || false,
    // Article specific
    ...(type === 'article' ? {
      category: data.category || 'Afrique',
      author: data.author || 'Équipe Akwaba Info',
      authorRole: data.authorRole || 'Journaliste',
      source: data.source || '',
      readingTime: data.readingTime || '4 min',
      views: data.views || 0,
      likes: data.likes || 0,
      tags: data.tags || [],
    } : {
      // Event specific
      location: data.location || '',
      category: data.category || 'Événement Culturel',
    }),
    ...data
  });
  
  const [previewMode, setPreviewMode] = useState(false);

  // Fallback if categories is empty
  const availableCategories = categories.length > 0 
    ? categories 
    : (type === 'article' 
        ? ['À la une', 'Urgent', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Histoire', 'Sport', 'Afrique', 'Monde', 'Tech']
        : ['Concert', 'Conférence', 'Exposition', 'Festival', 'Sport', 'Événement Culturel']
      );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all text-sm"
        >
          <ArrowLeft size={18} /> Revenir au tableau de bord
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "px-5 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all",
              previewMode ? "bg-slate-200 text-slate-700" : "bg-white border border-slate-200 text-slate-500"
            )}
          >
            {previewMode ? <Edit3 size={18} /> : <Eye size={18} />}
            {previewMode ? "Éditer" : "Aperçu"}
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-primary text-white rounded-xl flex items-center gap-2 font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm"
          >
            <Check size={18} /> Enregistrer {type === 'article' ? "l'article" : "l'événement"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {previewMode ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl min-h-[600px] animate-in fade-in slide-in-from-bottom-2">
              <h1 className="text-4xl font-black mb-6">{formData.title || "Titre de l'élément"}</h1>
              {formData.image && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                  <img src={formData.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              {formData.video && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-black flex items-center justify-center text-white">
                  <div className="text-center space-y-2">
                    <Youtube size={48} className="mx-auto text-red-500" />
                    <p className="text-xs font-bold">Vidéo YouTube configurée</p>
                  </div>
                </div>
              )}
              {type === 'event' && (
                <div className="flex items-center gap-4 mb-6 text-primary font-bold">
                  <span className="flex items-center gap-1"><Calendar size={18} /> {formData.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={18} /> {formData.location}</span>
                </div>
              )}
              <div className="markdown-body">
                <ReactMarkdown>{formData.content || "*Aucun contenu pour le moment...*"}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Titre {type === 'article' ? "de l'article" : "de l'événement"}</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Entrez un titre percutant..."
                  className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-5 text-2xl font-black outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Contenu de la Rédaction</label>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Gras"
                      >
                        <Bold size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Italique"
                      >
                        <Italic size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `[${selectedText}](url)` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Lien"
                      >
                        <Link size={16} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `\n- ${selectedText}` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="p-2 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500"
                        title="Liste"
                      >
                        <ListIcon size={16} />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                      <button 
                        type="button"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                          if (!textarea) return;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const selectedText = text.substring(start, end);
                          const newText = text.substring(0, start) + `### ${selectedText}` + text.substring(end);
                          setFormData({...formData, content: newText});
                        }}
                        className="px-2 py-1 hover:bg-white hover:text-primary rounded-lg transition-all text-slate-500 text-[10px] font-black"
                        title="Titre"
                      >
                        H3
                      </button>
                    </div>
                  </div>
                  <textarea 
                    name="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Saisissez votre texte ici. Utilisez les boutons ci-dessus pour la mise en forme..."
                    className="w-full bg-white border border-slate-100 rounded-3xl px-6 py-6 min-h-[500px] text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 shadow-sm resize-y"
                  />
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Info size={12} /> Conseil : Séparez vos paragraphes par une ligne vide pour une meilleure lecture.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-lg space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest">Métadonnées</h4>
            
            <div className="space-y-6">
              {/* --- Section: Général --- */}
              <div className="space-y-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest"><Info size={14}/> Infos Générales</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut de Publication</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setFormData({...formData, status: 'published'})}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                        formData.status === 'published' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500"
                      )}
                    >
                      Publié
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, status: 'draft'})}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                        formData.status === 'draft' ? "bg-slate-500 text-white shadow-lg" : "text-slate-50"
                      )}
                    >
                      Brouillon
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Planifier pour le (Optionnel)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.scheduledAt || ''}
                    onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="titre-de-l-element"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 appearance-none font-bold italic text-primary"
                  >
                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date de Publication</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
                {type === 'article' && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <input 
                      type="checkbox" 
                      checked={formData.isPremium}
                      onChange={e => setFormData({...formData, isPremium: e.target.checked})}
                      className="w-5 h-5 accent-amber-600"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-700">Contenu Premium</p>
                      <p className="text-[8px] text-amber-500">Réserver cet article aux abonnés Premium.</p>
                    </div>
                  </div>
                )}
                {type === 'event' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lieu de l'événement</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                        placeholder="Ex: Cotonou, Bénin"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* --- Section: Rédaction --- */}
              {type === 'article' && (
                <div className="space-y-4 border-b border-slate-50 pb-6">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest"><User size={14}/> La Rédaction</div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom de l'auteur</label>
                    <input 
                      type="text" 
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Rôle / Fonction</label>
                    <input 
                      type="text" 
                      value={formData.authorRole || ''}
                      onChange={(e) => setFormData({...formData, authorRole: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: Journaliste Reporter"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source de l'information</label>
                    <input 
                      type="text" 
                      value={(formData as Article).source || ''}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: Agence Ivoirienne de Presse"
                    />
                  </div>
                </div>
              )}

              {/* --- Section: Médias --- */}
              <div className="space-y-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest"><ImagePlus size={14}/> Médias & Source</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Image Principale</label>
                  <div className="relative">
                    <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.image || ''}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="URL directe de l'image (https://...)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source / Crédit Photo</label>
                  <div className="relative">
                    <Camera size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.imageCredit || ''}
                      onChange={(e) => setFormData({...formData, imageCredit: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="Ex: AFP / Justin Kpatcha"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Vidéo (YouTube)</label>
                  <div className="relative">
                    <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    <input 
                      type="text" 
                      value={formData.video || ''}
                      onChange={(e) => setFormData({...formData, video: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Audio (Podcast/MP3)</label>
                  <div className="relative">
                    <Check size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input 
                      type="text" 
                      value={formData.audioUrl || ''}
                      onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                      className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                      placeholder="URL directe du fichier audio (https://...)"
                    />
                  </div>
                </div>
              </div>

              {/* --- Section: Résumé --- */}
              <div className="space-y-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest"><Type size={14}/> Accroche</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Résumé (Extrait court)</label>
                  <textarea 
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 min-h-[100px] resize-none"
                    placeholder="Un court résumé qui s'affichera sur la page d'accueil..."
                  />
                </div>
              </div>

              {/* --- Section: SEO --- */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest"><Globe size={14}/> Référencement (SEO)</div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre Google</label>
                  <input 
                    type="text" 
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Méta Description</label>
                  <textarea 
                    value={formData.seoDescription || ''}
                    onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-primary/10 h-20"
                    placeholder="Méta description pour Google..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Image Partage Social</label>
                  <input 
                    type="text" 
                    value={formData.socialImage || ''}
                    onChange={(e) => setFormData({...formData, socialImage: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-[10px] outline-none focus:ring-2 focus:ring-primary/10"
                    placeholder="URL image Facebook/Twitter"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExportModal = ({ articles, events, onClose }: { articles: Article[], events: Event[], onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const [activeExport, setActiveExport] = useState<'articles' | 'events'>('articles');
  
  const articleCode = `export const MOCK_ARTICLES: Article[] = ${JSON.stringify(articles, null, 2)};`;
  const eventCode = `export const MOCK_EVENTS: Event[] = ${JSON.stringify(events, null, 2)};`;

  const code = activeExport === 'articles' ? articleCode : eventCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black italic">Code d'Exportation</h3>
            <p className="text-xs text-slate-400 font-medium">Copiez ce code et collez-le dans constants.ts</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex bg-slate-100 p-1 m-4 rounded-xl w-fit">
          <button 
            onClick={() => setActiveExport('articles')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black transition-all",
              activeExport === 'articles' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Articles
          </button>
          <button 
            onClick={() => setActiveExport('events')}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black transition-all",
              activeExport === 'events' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Événements
          </button>
        </div>

        <div className="p-8 pt-2">
          <div className="relative">
            <textarea 
              readOnly
              className="w-full h-[350px] bg-slate-900 text-emerald-400 font-mono text-[10px] p-6 rounded-2xl outline-none"
              value={code}
            />
            <button 
              onClick={handleCopy}
              className={cn(
                "absolute top-4 right-4 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-xs transition-all shadow-xl",
                copied ? "bg-emerald-500 text-white" : "bg-white text-slate-900 border border-slate-200"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copié !" : "Copier le code"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
