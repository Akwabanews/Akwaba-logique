import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Heart, 
  Share2, 
  Clock, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  Home,
  Globe,
  Map,
  User,
  Mail,
  Camera,
  MessageSquare,
  X,
  Send,
  CreditCard,
  Smartphone,
  Facebook,
  Twitter,
  Linkedin,
  TrendingUp,
  Filter,
  Bell,
  BellRing,
  Languages,
  Calendar,
  Lock,
  Plus,
  Trash,
  Edit3,
  Save,
  FileText,
  LogOut,
  LayoutDashboard,
  Settings,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  MonitorOff,
  Youtube,
  Bookmark,
  Activity,
  Award,
  Flag,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MOCK_ARTICLES, MOCK_EVENTS } from './constants';
import { Article, Comment, Event, SiteSettings, Subscriber, MediaAsset, Poll, Classified, LiveBlog, AppNotification } from './types';
import { cn, optimizeImage, getYoutubeId } from './lib/utils';
import { AdminLogin, AdminDashboard, AdminEditor, ExportModal } from './components/Admin';
import { 
  FirestoreService, 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  setupRecaptcha, 
  sendPhoneOtp, 
  auth 
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// --- Components ---

const Badge = ({ children, category }: { children: React.ReactNode; category?: string }) => {
  const colors: Record<string, string> = {
    'Afrique': 'bg-orange-500 text-white',
    'Monde': 'bg-blue-500 text-white',
    'Tech': 'bg-slate-500 text-white',
    'Économie': 'bg-emerald-600 text-white',
    'Politique': 'bg-red-600 text-white',
    'Culture': 'bg-amber-500 text-white',
    'Urgent': 'bg-red-700 text-white animate-pulse',
    'Science': 'bg-purple-600 text-white',
    'Santé': 'bg-teal-500 text-white',
    'Histoire': 'bg-stone-600 text-white',
    'Sport': 'bg-indigo-600 text-white',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
      category ? colors[category] || 'bg-slate-200 text-slate-700' : 'bg-slate-200 text-slate-700'
    )}>
      {children}
    </span>
  );
};

const HeroSlideshow = ({ 
  articles, 
  onArticleClick, 
  onBookmark, 
  bookmarkedIds 
}: { 
  articles: Article[]; 
  onArticleClick: (a: Article) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  bookmarkedIds: Set<string>;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  return (
    <div className="relative h-[300px] md:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl group">
      <AnimatePresence mode="wait">
        <motion.div
          key={articles[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => onArticleClick(articles[currentIndex])}
        >
          {articles[currentIndex].image && (
            <img 
              src={optimizeImage(articles[currentIndex].image, 1200)} 
              alt={articles[currentIndex].title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={(e) => { e.stopPropagation(); onBookmark(articles[currentIndex].id, e); }}
              className={cn(
                "p-3 rounded-full backdrop-blur-md transition-all shadow-xl",
                bookmarkedIds.has(articles[currentIndex].id) ? "bg-primary text-white" : "bg-white/20 text-white hover:bg-white/40"
              )}
            >
              <Bookmark size={24} fill={bookmarkedIds.has(articles[currentIndex].id) ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4">
            <Badge category={articles[currentIndex].category}>{articles[currentIndex].category}</Badge>
            <h2 className="text-white font-display font-black text-2xl md:text-4xl mt-4 leading-[1.1] tracking-tight">
              {articles[currentIndex].title}
            </h2>
            <div className="flex items-center gap-4 mt-4 text-white/70 text-sm font-medium">
              <span>{format(new Date(articles[currentIndex].date), 'dd MMM yyyy', { locale: fr })}</span>
              <span>•</span>
              <span>{articles[currentIndex].author}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 right-6 flex gap-2">
        {articles.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentIndex ? "bg-primary w-6" : "bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const TrendingSection = ({ 
  articles, 
  onArticleClick, 
  onBookmark, 
  bookmarkedIds 
}: { 
  articles: Article[]; 
  onArticleClick: (a: Article) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  bookmarkedIds: Set<string>;
}) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <TrendingUp size={20} />
        </div>
        <h2 className="font-black text-2xl">Tendances</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <div 
            key={article.id} 
            onClick={() => onArticleClick(article)}
            className="flex gap-4 items-start cursor-pointer group relative"
          >
            <span className="text-4xl font-black text-slate-200 group-hover:text-primary transition-colors">
              0{idx + 1}
            </span>
            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-start">
                <Badge category={article.category}>{article.category}</Badge>
                <button 
                  onClick={(e) => { e.stopPropagation(); onBookmark(article.id, e); }}
                  className={cn(
                    "transition-colors",
                    bookmarkedIds.has(article.id) ? "text-primary" : "text-slate-300 hover:text-primary"
                  )}
                >
                  <Bookmark size={14} fill={bookmarkedIds.has(article.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <h3 className="font-display font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                <span>{article.author}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5"><Eye size={10} /> {article.views}</span>
                {article.commentsCount !== undefined && article.commentsCount > 0 && (
                  <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {article.commentsCount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ArticleCard = ({ article, onClick, variant = 'horizontal', onBookmark, isBookmarked }: { 
  article: Article; 
  onClick: () => void; 
  variant?: 'horizontal' | 'vertical' | 'hero';
  onBookmark?: (id: string, e: React.MouseEvent) => void;
  isBookmarked?: boolean;
}) => {
  if (variant === 'hero') {
    return (
      <motion.div 
        id={`article-card-hero-${article.id}`}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative h-[240px] w-full rounded-2xl overflow-hidden shadow-xl cursor-pointer group bg-slate-100"
      >
        {article.image && (
          <img 
            id={`article-img-hero-${article.id}`}
            src={optimizeImage(article.image, 600)} 
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={(e) => onBookmark?.(article.id, e)}
            className={cn(
              "p-2 rounded-full backdrop-blur-md transition-all",
              isBookmarked ? "bg-primary text-white" : "bg-black/20 text-white hover:bg-black/40"
            )}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <Badge category={article.category}>{article.category}</Badge>
          <h2 className="text-white font-display font-bold text-xl mt-2 leading-tight line-clamp-2">
            {article.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
            <span>{format(new Date(article.date), 'dd MMM yyyy', { locale: fr })}</span>
            <span>•</span>
            <span>{article.author}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      id={`article-card-${variant}-${article.id}`}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer flex hover:shadow-md transition-shadow",
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      )}
    >
      {article.image && (
        <div className={cn(
          "relative overflow-hidden",
          variant === 'vertical' ? 'w-full h-40' : 'w-24 h-24 shrink-0'
        )}>
          <img 
            id={`article-img-${variant}-${article.id}`}
            src={optimizeImage(article.image, variant === 'vertical' ? 500 : 200)} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          {variant === 'vertical' && (
             <div className="absolute top-2 right-2 z-10">
                <button 
                  onClick={(e) => onBookmark?.(article.id, e)}
                  className={cn(
                    "p-1.5 rounded-full backdrop-blur-md transition-all",
                    isBookmarked ? "bg-primary text-white" : "bg-black/20 text-white hover:bg-black/40"
                  )}
                >
                  <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
             </div>
          )}
        </div>
      )}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-1">
            <Badge category={article.category}>{article.category}</Badge>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">{article.readingTime}</span>
              {variant === 'horizontal' && (
                <button 
                  onClick={(e) => onBookmark?.(article.id, e)}
                  className={cn(
                    "transition-colors",
                    isBookmarked ? "text-primary" : "text-slate-300 hover:text-primary"
                  )}
                >
                  <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          </div>
          <h3 className={cn(
            "font-display font-bold text-slate-900 leading-snug line-clamp-2",
            variant === 'vertical' ? 'text-base' : 'text-sm'
          )}>
            {article.title}
          </h3>
          {variant === 'vertical' && article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {article.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
          <span className="font-bold">{article.author}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><Eye size={10} /> {article.views}</span>
            <span className="flex items-center gap-0.5"><Heart size={10} /> {article.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserProfileView = ({ 
  user, 
  likedArticles, 
  savedArticles, 
  comments, 
  followedAuthors,
  followedCategories,
  badges,
  points,
  onArticleClick, 
  onLogout,
  onFollowAuthor,
  onFollowCategory
}: { 
  user: FirebaseUser, 
  likedArticles: Article[], 
  savedArticles: Article[], 
  comments: Comment[],
  followedAuthors: string[],
  followedCategories: string[],
  badges: string[],
  points: number,
  onArticleClick: (a: Article) => void,
  onLogout: () => void,
  onFollowAuthor: (name: string) => void,
  onFollowCategory: (cat: string) => void
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'liked' | 'activity'>('saved');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-10 py-10"
    >
      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5">
           <User size={120} />
        </div>
        <img 
          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} 
          className="w-32 h-32 rounded-full border-4 border-primary shadow-xl"
        />
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-black">{user.displayName || 'Utilisateur Akwaba'}</h2>
          <p className="text-slate-500 font-bold">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
             <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 min-w-[80px]">
                <span className="font-black text-primary text-xl">{savedArticles.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Favoris</span>
             </div>
             <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 min-w-[80px]">
                <span className="font-black text-primary text-xl">{likedArticles.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Likes</span>
             </div>
             <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 min-w-[80px]">
                <span className="font-black text-primary text-xl">{comments.length}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Messages</span>
             </div>
          </div>
        </div>
        <div className="md:ml-auto flex flex-col gap-3">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex border-b border-slate-100">
           {(['saved', 'liked', 'activity'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-8 py-4 text-sm font-black uppercase tracking-widest transition-all relative",
                 activeTab === tab ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"
               )}
             >
               {tab === 'saved' ? 'Mes Favoris' : tab === 'liked' ? 'Mes J\'aime' : 'Mon Activité'}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'saved' && (
            savedArticles.length > 0 ? savedArticles.map(a => (
              <ArticleCard key={a.id} article={a} variant="vertical" onClick={() => onArticleClick(a)} isBookmarked={true} />
            )) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                 <Bookmark size={48} className="mx-auto text-slate-200" />
                 <p className="text-slate-400 font-bold">Vous n'avez pas encore d'articles enregistrés.</p>
              </div>
            )
          )}
          {activeTab === 'liked' && (
            likedArticles.length > 0 ? likedArticles.map(a => (
              <ArticleCard key={a.id} article={a} variant="vertical" onClick={() => onArticleClick(a)} />
            )) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                 <Heart size={48} className="mx-auto text-slate-200" />
                 <p className="text-slate-400 font-bold">On dirait que vous n'avez pas encore aimé d'articles.</p>
              </div>
            )
          )}
          {activeTab === 'activity' && (
            comments.length > 0 ? comments.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commentaire</span>
                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(c.date), 'dd/MM/yyyy')}</span>
                 </div>
                 <p className="text-slate-600 italic text-sm">"{c.content}"</p>
                 <button className="text-primary text-xs font-bold hover:underline">Voir l'article</button>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                 <MessageSquare size={48} className="mx-auto text-slate-200" />
                 <p className="text-slate-400 font-bold">Aucun commentaire publié pour le moment.</p>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};
const ArticleCarousel = ({ 
  articles, 
  onArticleClick, 
  onBookmark, 
  bookmarkedIds 
}: { 
  articles: Article[], 
  onArticleClick: (a: Article) => void,
  onBookmark: (id: string, e: React.MouseEvent) => void,
  bookmarkedIds: Set<string>
}) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, articles.length - itemsPerPage);
  const next = () => setScrollIndex(prev => Math.min(prev + 1, maxIndex));
  const prev = () => setScrollIndex(prev => Math.max(prev - 1, 0));

  return (
    <div className="mt-16 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black">Continuer la lecture</h3>
        <div className="flex gap-2">
          <button 
            onClick={prev} 
            disabled={scrollIndex === 0}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={next} 
            disabled={scrollIndex === maxIndex}
            className="p-2 rounded-full bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden -mx-4 px-4">
        <motion.div 
          animate={{ x: `-${scrollIndex * (100 / itemsPerPage)}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex gap-6"
        >
          {articles.map((article) => (
            <div 
              key={article.id} 
              className={cn(
                "shrink-0",
                itemsPerPage === 1 ? "w-full" : 
                itemsPerPage === 2 ? "w-[calc(50%-12px)]" : 
                "w-[calc(25%-18px)]"
              )}
            >
              <ArticleCard 
                article={article} 
                variant="vertical" 
                onClick={() => onArticleClick(article)} 
                onBookmark={onBookmark}
                isBookmarked={bookmarkedIds.has(article.id)}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const EventSection = ({ events, onEventClick, onSeeAll }: { events: Event[], onEventClick: (e: Event) => void, onSeeAll: () => void }) => {
  return (
    <section className="py-20 border-t border-slate-100">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="font-black text-3xl md:text-4xl tracking-tighter">Agenda Culturel</h2>
          <p className="text-slate-500 mt-2">Les événements à ne pas manquer</p>
        </div>
        <button 
          onClick={onSeeAll}
          className="text-primary font-bold flex items-center gap-2 group"
        >
          Voir tout l'agenda <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.map((event) => (
          <motion.div 
            key={event.id}
            id={`event-card-home-${event.id}`}
            whileHover={{ y: -10 }}
            onClick={() => onEventClick(event)}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
              {event.image && (
                <img 
                  id={`event-img-home-${event.id}`}
                  src={optimizeImage(event.image, 500)} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                  {event.category}
                </span>
                <h3 className="text-white font-bold text-lg leading-tight">{event.title}</h3>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <Calendar size={14} className="text-primary" />
                {format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                <Map size={14} className="text-primary" />
                {event.location}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const EventDetailView = ({ event, onBack }: { event: Event, onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <button onClick={onBack} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Retour
      </button>
      
      <div className="space-y-4 text-center">
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          {event.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
          {event.title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500 font-bold">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
          </div>
          <div className="flex items-center gap-2">
            <Map size={18} className="text-primary" />
            {event.location}
          </div>
        </div>
      </div>

      {(event.image || event.video) && (
        <div className="space-y-6">
          {event.video && getYoutubeId(event.video) && (
            <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900/5 aspect-video">
              <iframe 
                src={`https://www.youtube.com/embed/${getYoutubeId(event.video)}`}
                title={event.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          )}
          {event.image && (
            <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900/5">
              <img 
                id={`event-detail-img-${event.id}`}
                src={optimizeImage(event.image, 1200)} 
                alt={event.title}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto block"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              {event.imageCredit && (
                <div className="px-6 py-3 bg-slate-900/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={12} /> Source : {event.imageCredit}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="markdown-body text-lg leading-relaxed">
          <ReactMarkdown>{event.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

const GoogleAd = ({ className, label = "Annonce Google" }: { className?: string, label?: string }) => (
  <div className={cn("bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[100px]", className)}>
    <div className="absolute top-0 right-0 bg-slate-200 px-2 py-0.5 text-[8px] font-bold text-slate-500 uppercase">Ad</div>
    <span className="text-[9px] text-slate-400 uppercase font-bold mb-1">{label}</span>
    <div className="w-12 h-px bg-slate-200 mb-2" />
    <div className="text-slate-300 font-bold text-sm">Espace Publicitaire</div>
  </div>
);

const SkeletonArticleCard = () => (
  <div className="bg-white rounded-[40px] p-6 space-y-4 shadow-sm border border-slate-100 animate-pulse">
    <div className="w-full aspect-[16/10] bg-slate-100 rounded-3xl" />
    <div className="space-y-3">
      <div className="h-4 bg-slate-100 rounded-full w-1/4" />
      <div className="h-6 bg-slate-100 rounded-full w-full" />
      <div className="h-6 bg-slate-100 rounded-full w-2/3" />
      <div className="flex justify-between items-center pt-4">
        <div className="h-4 bg-slate-100 rounded-full w-20" />
        <div className="flex gap-2">
           <div className="h-4 w-4 bg-slate-100 rounded-full" />
           <div className="h-4 w-4 bg-slate-100 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonArticleDetail = () => (
  <div className="max-w-4xl mx-auto space-y-8 py-10 animate-pulse">
    <div className="h-4 w-20 bg-slate-200 rounded-full mx-auto" />
    <div className="h-12 w-3/4 bg-slate-200 rounded-2xl mx-auto" />
    <div className="h-4 w-1/4 bg-slate-200 rounded-full mx-auto" />
    <div className="w-full aspect-video bg-slate-200 rounded-[40px]" />
    <div className="space-y-4">
       <div className="h-4 bg-slate-200 rounded-full w-full" />
       <div className="h-4 bg-slate-200 rounded-full w-full" />
       <div className="h-4 bg-slate-200 rounded-full w-4/5" />
    </div>
  </div>
);

const GalleryLightbox = ({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) => {
  const [index, setIndex] = useState(initialIndex);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4 md:p-10"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white p-4 hover:bg-white/10 rounded-full transition-colors z-[1001]">
        <X size={32} />
      </button>
      
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img 
            key={index}
            src={images[index]}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-full max-h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        {images.length > 1 && (
          <>
            <button 
              onClick={() => setIndex(prev => (prev - 1 + images.length) % images.length)}
              className="absolute left-6 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={() => setIndex(prev => (prev + 1) % images.length)}
              className="absolute right-6 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>
      
      <div className="absolute bottom-10 flex gap-2 overflow-x-auto p-4 max-w-full">
        {images.map((img, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={cn(
              "w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all",
              index === i ? "border-primary scale-110" : "border-transparent opacity-50"
            )}
          >
            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const ExchangeRatesWidget = ({ rates }: { rates: Record<string, number> }) => (
  <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-white/10 overflow-hidden relative group">
    <div className="absolute top-0 right-0 p-3 opacity-10">
      <Globe size={80} />
    </div>
    <div className="flex items-center gap-2 mb-2">
      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
        <Languages size={18} />
      </div>
      <h3 className="font-black text-xs uppercase tracking-widest">Marché des Changes</h3>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(rates).map(([pair, rate]) => (
        <div key={pair} className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400">{pair}</div>
          <div className="text-lg font-black tracking-tight">{rate.toFixed(2)}</div>
        </div>
      ))}
    </div>
    <div className="pt-2 flex items-center gap-1 text-[8px] font-bold text-emerald-400 animate-pulse">
       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> EN DIRECT
    </div>
  </div>
);

const AudioPlayer = ({ article }: { article: Article }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToSpeak = `${article.title}. Par ${article.author}. ${article.excerpt}. ${article.content.substring(0, 1000)}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'fr-FR';
      utterance.onend = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 group">
      <button 
        onClick={togglePlay}
        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform"
      >
        {isPlaying ? <Bell size={24} className="animate-pulse" /> : <TrendingUp size={24} className="rotate-90" />}
      </button>
      <div className="flex-1 space-y-1">
         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Écouter l'article</div>
         <div className="text-sm font-bold text-slate-700">{isPlaying ? 'Lecture en cours...' : 'Version audio disponible'}</div>
      </div>
      {isPlaying && (
        <div className="flex items-center gap-half h-4">
           {[...Array(4)].map((_, i) => (
             <motion.div 
               key={i}
               animate={{ height: [8, 16, 8] }}
               transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
               className="w-1 bg-primary rounded-full"
             />
           ))}
        </div>
      )}
    </div>
  );
};

const ClassifiedsView = ({ classifieds, onBack }: { classifieds: Classified[], onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  const filtered = activeTab === 'all' ? classifieds : classifieds.filter(c => c.category === activeTab);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-10 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <button onClick={onBack} className="text-primary text-xs font-bold flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Retour
          </button>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Petites <span className="text-primary">Annonces</span></h2>
          <p className="text-slate-500 font-medium">Le marché communautaire d'Akwaba Info.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform">
          <Plus size={20} /> Publier une annonce
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {['all', 'emploi', 'immobilier', 'véhicules', 'services', 'divers'].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              activeTab === cat ? "bg-slate-900 text-white" : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
            )}
          >
            {cat === 'all' ? 'Toutes' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.length > 0 ? filtered.map(item => (
          <div key={item.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
               {item.imageUrl && (
                 <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
               )}
               <div className="absolute top-4 left-4">
                 <Badge>{item.category}</Badge>
               </div>
               {item.price && (
                 <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-2xl font-black text-sm">
                   {item.price}
                 </div>
               )}
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                <div className="flex items-center gap-1"><Map size={14} /> {item.location}</div>
                <div className="flex items-center gap-1"><Clock size={14} /> {format(new Date(item.date), 'dd MMM')}</div>
              </div>
              <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
              <div className="h-px bg-slate-50" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {item.username[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.username}</span>
                </div>
                <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Détails</button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="p-8 bg-slate-50 rounded-[40px] max-w-sm mx-auto border-2 border-dashed border-slate-200">
                <Search size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">Aucune annonce trouvée dans cette catégorie.</p>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LiveBlogView = ({ blog, onBack }: { blog: LiveBlog, onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-10 space-y-8"
    >
       <div className="space-y-4">
        <button onClick={onBack} className="text-primary text-xs font-bold flex items-center gap-1 mb-2">
          <ArrowLeft size={14} /> Retour à l'accueil
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" /> EN DIRECT
          </div>
          <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Live Blog</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight italic">{blog.title}</h1>
      </div>

      <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-0 before:w-px before:bg-slate-100">
        {blog.updates.map((update, idx) => (
          <motion.div 
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-16 space-y-3"
          >
            <div className="absolute left-[18px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="flex items-center gap-3">
               <span className="text-sm font-black text-primary">{format(new Date(update.date), 'HH:mm')}</span>
               {update.type === 'urgent' && (
                 <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">Urgent</span>
               )}
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="markdown-body prose prose-slate max-w-none">
                <ReactMarkdown>{update.content}</ReactMarkdown>
              </div>
              {update.imageUrl && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={update.imageUrl} className="w-full h-auto" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <User size={12} /> Par {update.author}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const PollCard = ({ poll, onVote, hasVoted }: { poll: Poll, onVote: (optionId: string) => void, hasVoted: boolean }) => {
  if (!poll) return null;
  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <div className="bg-white border-2 border-primary/10 rounded-[35px] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-[20px] text-primary font-black text-[10px] tracking-widest uppercase">Sondage</div>
      <div className="flex gap-4">
        <div className="p-3 bg-primary rounded-2xl text-white h-fit shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
          <TrendingUp size={24} />
        </div>
        <h3 className="font-display font-black text-xl leading-tight">{poll.question}</h3>
      </div>
      
      <div className="space-y-3">
        {poll.options.map(option => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <button 
              key={option.id}
              disabled={hasVoted}
              onClick={() => onVote(option.id)}
              className="w-full text-left relative group/opt overflow-hidden rounded-2xl border border-slate-100 hover:border-primary/30 transition-all p-4"
            >
              <div 
                className={cn(
                  "absolute inset-0 transition-all duration-1000",
                  hasVoted ? "bg-primary/5" : "bg-transparent group-hover/opt:bg-slate-50"
                )}
                style={{ width: hasVoted ? `${percentage}%` : '0%' }}
              />
              <div className="relative flex justify-between items-center text-sm">
                <span className={cn("font-bold", hasVoted && "text-primary")}>{option.text}</span>
                {hasVoted && <span className="font-black text-slate-400">{percentage}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {hasVoted && (
        <p className="text-[10px] text-slate-400 font-bold text-center italic">
          Merci pour votre participation ! ({totalVotes} votes au total)
        </p>
      )}
    </div>
  );
};

const WebTVView = ({ articles, onArticleClick }: { articles: Article[], onArticleClick: (a: Article) => void }) => {
  const videoArticles = articles.filter(a => a.video);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-5xl font-display font-black tracking-tighter italic">WEB <span className="text-secondary">TV</span></h2>
          <p className="text-slate-500 font-medium">L'actualité décryptée en images et en vidéos.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button className="px-6 py-2 bg-white text-primary rounded-xl font-black text-xs shadow-sm uppercase tracking-widest">Récent</button>
          <button className="px-6 py-2 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">Populaire</button>
        </div>
      </div>

      {videoArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoArticles.map(article => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-slate-100 group cursor-pointer"
              onClick={() => onArticleClick(article)}
            >
              <div className="relative aspect-video">
                <img 
                  src={optimizeImage(article.image || '', 800)} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                    <TrendingUp size={32} />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge category={article.category}>{article.category}</Badge>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <h3 className="font-display font-black text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Clock size={14} />
                  <span>{format(new Date(article.date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dotted border-slate-200">
          <div className="flex flex-col items-center gap-4 opacity-50">
            <MonitorOff size={64} className="text-slate-300" />
            <p className="font-black text-slate-400 uppercase tracking-widest">Aucune vidéo disponible pour le moment</p>
          </div>
        </div>
      )}
    </div>
  );
};
const ReadAlso = ({ currentArticle, articles, onArticleClick }: { currentArticle: Article, articles: Article[], onArticleClick: (a: Article) => void }) => {
  const related = articles
    .filter(a => a.id !== currentArticle.id && a.category === currentArticle.category)
    .slice(0, 2);
  
  if (related.length === 0) return null;

  return (
    <div className="my-10 p-6 bg-slate-50 border-l-4 border-secondary rounded-r-2xl">
      <h4 className="font-display font-black text-secondary uppercase tracking-widest text-xs mb-4">Lire aussi</h4>
      <div className="space-y-4">
        {related.map(article => (
          <button 
            key={article.id}
            id={`read-also-${article.id}`}
            onClick={() => onArticleClick(article)}
            className="flex gap-4 group text-left w-full"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
              <img 
                src={optimizeImage(article.image, 200)} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                referrerPolicy="no-referrer" 
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1 py-1">
              <h5 className="font-display font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {article.title}
              </h5>
              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">{article.readingTime} de lecture</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const FlashInfo = ({ articles }: { articles: string[] }) => {
  return (
    <div className="bg-slate-900 text-white overflow-hidden h-10 flex items-center relative z-[60]">
      <div className="bg-primary px-4 h-full flex items-center font-black text-[10px] uppercase tracking-widest shrink-0 relative z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
        Flash Info
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap gap-12 items-center"
        >
          {articles.map((text, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold tracking-tight">{text}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {articles.map((text, i) => (
            <div key={`dup-${i}`} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-bold tracking-tight">{text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

const NotificationCenter = ({ 
  notifications, 
  onClose, 
  onMarkRead,
  onNavigate 
}: { 
  notifications: AppNotification[], 
  onClose: () => void,
  onMarkRead: (id: string) => void,
  onNavigate: (link: string) => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-20 right-6 z-[200] w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[70vh]"
    >
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Bell className="text-primary" size={20} /> Centre d'Alertes
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">
        {notifications.length > 0 ? notifications.map((notif) => (
          <div 
            key={notif.id}
            onClick={() => {
              if (notif.link) onNavigate(notif.link);
              onMarkRead(notif.id);
            }}
            className={cn(
              "p-5 cursor-pointer hover:bg-slate-50 transition-colors group relative",
              !notif.read && "bg-primary/[0.03]"
            )}
          >
            {!notif.read && (
              <div className="absolute top-6 left-2 w-2 h-2 bg-primary rounded-full" />
            )}
            <div className="space-y-1 ml-4">
              <div className="flex justify-between items-start gap-4">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  notif.type === 'urgent' ? "bg-red-50 text-red-500 border-red-100" : "bg-slate-100 text-slate-400 border-slate-200"
                )}>
                  {notif.topic || notif.type}
                </span>
                <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                  {format(new Date(notif.date), 'HH:mm', { locale: fr })}
                </span>
              </div>
              <h4 className={cn("text-sm font-bold leading-tight group-hover:text-primary transition-colors", !notif.read ? "text-slate-900" : "text-slate-500")}>
                {notif.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {notif.message}
              </p>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Bell size={32} />
            </div>
            <p className="text-sm font-bold text-slate-400">Aucune notification pour le moment.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
        <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70">
          Effacer tout l'historique
        </button>
      </div>
    </motion.div>
  );
};

// --- Main App ---

const SplashScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className={cn(
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6",
        isDarkMode ? "bg-slate-950" : "bg-[#F5F1EB]"
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <img 
          src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
          alt="Akwaba Info Logo" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain rounded-[40px] shadow-2xl border border-white/20"
          referrerPolicy="no-referrer"
        />
        
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-6xl font-black tracking-tighter"
          >
            AKWABA <span className="text-primary">INFO</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm"
          >
            L’info du monde en un clic
          </motion.p>
        </div>

        <div className="relative mt-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-slate-400 text-[10px] font-black uppercase tracking-widest"
        >
          Chargement de l'actualité...
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const LoginModal = ({ isOpen, onClose, onLogin, isDarkMode }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onLogin: (user: FirebaseUser) => void;
  isDarkMode: boolean;
}) => {
  const [authMode, setAuthMode] = useState<'options' | 'email-login' | 'email-register' | 'phone'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetStates = () => {
    setAuthMode('options');
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNumber('');
    setOtp('');
    setConfirmationResult(null);
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) onLogin(user);
    } catch (err: any) {
      setError("Échec de la connexion Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await loginWithEmail(email, password);
      if (user) onLogin(user);
    } catch (err: any) {
      setError("Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await registerWithEmail(email, password, name);
      if (user) onLogin(user);
    } catch (err: any) {
      setError("L'inscription a échoué (vérifiez l'email et le mot de passe)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await sendPhoneOtp(phoneNumber, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError("Échec de l'envoi du code SMS");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      if (result.user) onLogin(result.user);
    } catch (err: any) {
      setError("Code OTP invalide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { resetStates(); onClose(); }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={cn(
              "relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border-4",
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-100"
            )}
          >
            <button 
              onClick={() => { resetStates(); onClose(); }} 
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-black">
                {authMode === 'options' ? 'Bienvenue sur Akwaba' : 
                 authMode === 'email-login' ? 'Connexion' : 
                 authMode === 'email-register' ? 'Créer un compte' : 'Code de vérification'}
              </h2>
              <p className="text-slate-500 text-sm mt-2">Accédez à vos alertes et favoris</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <div id="recaptcha-container"></div>

            {authMode === 'options' && (
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-white border-2 border-slate-100 hover:border-primary/30 rounded-2xl transition-all shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
                  <span className="font-bold text-slate-700">Continuer avec Google</span>
                </button>

                <button 
                  onClick={() => setAuthMode('email-login')}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                  <Mail size={20} />
                  <span>Utiliser votre Email</span>
                </button>

                <button 
                  onClick={() => setAuthMode('phone')}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Smartphone size={20} />
                  <span>Se connecter par Téléphone</span>
                </button>
              </div>
            )}

            {(authMode === 'email-login' || authMode === 'email-register') && (
              <form onSubmit={authMode === 'email-login' ? handleEmailLogin : handleEmailRegister} className="space-y-4">
                {authMode === 'email-register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nom complet</label>
                    <input 
                      type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/30 rounded-2xl px-4 font-bold outline-none transition-all" placeholder="John Doe"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/30 rounded-2xl px-4 font-bold outline-none transition-all" placeholder="email@exemple.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Mot de passe</label>
                  <input 
                    type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/30 rounded-2xl px-4 font-bold outline-none transition-all" placeholder="••••••••"
                  />
                </div>
                
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (authMode === 'email-login' ? 'Se connecter' : "S'inscrire")}
                </button>

                <button 
                  type="button" onClick={() => setAuthMode(authMode === 'email-login' ? 'email-register' : 'email-login')}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  {authMode === 'email-login' ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Connexion"}
                </button>
              </form>
            )}

            {authMode === 'phone' && (
              <div className="space-y-4">
                {!confirmationResult ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Numéro de téléphone</label>
                      <input 
                        type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full h-12 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/30 rounded-2xl px-4 font-bold outline-none transition-all" placeholder="+225 00000000"
                      />
                    </div>
                    <button 
                      type="submit" disabled={isLoading}
                      className="w-full h-14 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30"
                    >
                      {isLoading ? "Envoi..." : "Envoyer le code SMS"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Code de vérification</label>
                      <input 
                        type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                        className="w-full h-12 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/30 rounded-2xl px-4 font-bold outline-none transition-all text-center tracking-[0.5em] text-xl" placeholder="000000"
                      />
                    </div>
                    <button 
                      type="submit" disabled={isLoading}
                      className="w-full h-14 bg-green-600 text-white rounded-2xl font-black shadow-lg"
                    >
                      {isLoading ? "Vérification..." : "Vérifier le code"}
                    </button>
                  </form>
                )}
              </div>
            )}
            
            <button 
              onClick={() => setAuthMode('options')}
              className="mt-6 w-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
            >
              <ArrowLeft size={12} /> Retour aux options
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'search' | 'donate' | 'about' | 'privacy' | 'terms' | 'contact' | 'cookies' | 'event' | 'all-events' | 'admin' | 'admin-login' | 'webtv' | 'profile' | 'classifieds' | 'live-blog'>(() => {
    const saved = localStorage.getItem('akwaba_current_view');
    // If it was an admin related view, we keep it to avoid redirecting away on refresh
    if (saved === 'admin' || saved === 'admin-login' || saved === 'profile' || saved === 'classifieds' || saved === 'live-blog') return saved as any;
    return 'home';
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('akwaba_is_admin') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [adminArticles, setAdminArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('akwaba_admin_articles');
      return saved ? JSON.parse(saved) : MOCK_ARTICLES;
    } catch {
      return MOCK_ARTICLES;
    }
  });
  const [adminEvents, setAdminEvents] = useState<Event[]>(() => {
    try {
      const saved = localStorage.getItem('akwaba_admin_events');
      return saved ? JSON.parse(saved) : MOCK_EVENTS;
    } catch {
      return MOCK_EVENTS;
    }
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeCategory, setActiveCategory] = useState('À la une');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    return !sessionStorage.getItem('akwaba_splash_shown');
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string>('5000');
  const [selectedPayment, setSelectedPayment] = useState<'mobile' | 'card'>('mobile');
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  
  // New features state
  const [showFilters, setShowFilters] = useState(false);
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [userBookmarkedArticles, setUserBookmarkedArticles] = useState<Set<string>>(new Set());
  const [userFollowedAuthors, setUserFollowedAuthors] = useState<Set<string>>(new Set());
  const [userFollowedCategories, setUserFollowedCategories] = useState<Set<string>>(new Set());
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    aboutText: "Akwaba Info est votre source de référence pour l'actualité en Afrique et dans le monde.",
    email: "contact@akwabainfo.com",
    phone: "+225 00 00 00 00",
    address: "Abidjan, Côte d'Ivoire",
    facebookUrl: "https://facebook.com",
    twitterUrl: "https://twitter.com",
    categories: ['À la une', 'Urgent', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Histoire', 'Sport', 'Afrique', 'Monde', 'Tech'],
    maintenanceMode: false,
    urgentBannerActive: false,
    urgentBannerText: ""
  });
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([]);
  const [classifieds, setClassifieds] = useState<Classified[]>([]);
  const [liveBlogs, setLiveBlogs] = useState<LiveBlog[]>([]);
  const [activeLiveBlog, setActiveLiveBlog] = useState<LiveBlog | null>(null);
  const [exchangeRates, setExchangeRates] = useState<any>({
    "EUR/XOF": 655.95,
    "USD/XOF": 612.45,
    "GBP/XOF": 774.20,
    "NGN/XOF": 0.42
  });
  const [activePoll, setActivePoll] = useState<Poll | null>({
    id: 'poll-1',
    question: "Pensez-vous que la technologie peut transformer l'éducation en Afrique ?",
    options: [
      { id: '1', text: "Oui, absolument", votes: 450 },
      { id: '2', text: "Peut-être, avec des moyens", votes: 230 },
      { id: '3', text: "Non, pas encore", votes: 120 }
    ],
    startDate: new Date().toISOString(),
    active: true
  });
  const [hasVoted, setHasVoted] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = FirestoreService.subscribeToNotifications(currentUser.uid, (notifs) => {
        setNotifications(notifs);
        // Show the latest unread notification as a toast if it's new
        const latest = notifs.find(n => !n.read);
        if (latest && latest.date > new Date(Date.now() - 1000 * 60).toISOString()) {
            setActiveNotification(latest.title);
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleMarkNotificationAsRead = async (id: string) => {
    await FirestoreService.markNotificationAsRead(id);
  };

  const handleVote = async (optionId: string) => {
    if (!activePoll || hasVoted || !currentUser) {
      if (!currentUser) handleUserLogin();
      return;
    }
    
    try {
      await FirestoreService.submitVote(activePoll.id, optionId, currentUser.uid);
      
      const updatedOptions = activePoll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );
      setActivePoll({ ...activePoll, options: updatedOptions });
      setHasVoted(true);
      setActiveNotification("Vote enregistré ! Merci.");
    } catch (error) {
      console.error("Poll vote error:", error);
    }
  };
  
  // Persistence Logic
  const [articleComments, setArticleComments] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('akwaba_comments');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [articleLikes, setArticleLikes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('akwaba_likes');
    return saved ? JSON.parse(saved) : {};
  });

  const [userLikedArticles, setUserLikedArticles] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('akwaba_user_likes');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string, username: string } | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthorName, setCommentAuthorName] = useState('');

  useEffect(() => {
    localStorage.setItem('akwaba_comments', JSON.stringify(articleComments));
  }, [articleComments]);

  useEffect(() => {
    localStorage.setItem('akwaba_likes', JSON.stringify(articleLikes));
  }, [articleLikes]);

  useEffect(() => {
    localStorage.setItem('akwaba_user_likes', JSON.stringify(Array.from(userLikedArticles)));
  }, [userLikedArticles]);

  useEffect(() => {
    localStorage.setItem('akwaba_admin_articles', JSON.stringify(adminArticles));
  }, [adminArticles]);

  useEffect(() => {
    localStorage.setItem('akwaba_admin_events', JSON.stringify(adminEvents));
  }, [adminEvents]);

  // Firebase Real-time Auth & Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await FirestoreService.getUserProfile(user.uid);
        if (profile) {
          if (profile.likedArticles) setUserLikedArticles(new Set(profile.likedArticles));
          if (profile.bookmarkedArticles) setUserBookmarkedArticles(new Set(profile.bookmarkedArticles));
          if (profile.followedAuthors) setUserFollowedAuthors(new Set(profile.followedAuthors));
          if (profile.followedCategories) setUserFollowedCategories(new Set(profile.followedCategories));
          if (profile.points) setUserPoints(profile.points);
          if (profile.badges) setUserBadges(profile.badges);
        }
        
        if (user.email === 'akwabanewsinfo@gmail.com') {
          setIsAdminAuthenticated(true);
          localStorage.setItem('akwaba_is_admin', 'true');
        } else {
          setIsAdminAuthenticated(false);
          localStorage.setItem('akwaba_is_admin', 'false');
        }
      } else {
        setCurrentUser(null);
        setIsAdminAuthenticated(false);
        localStorage.setItem('akwaba_is_admin', 'false');
      }
      setIsAuthChecked(true);
    });

    // Initial Data Fetch
    const fetchData = async () => {
      try {
        const [cloudArticles, cloudEvents, cloudSettings, cloudComments, cloudSubs, cloudMedia, cloudClassifieds, cloudLiveBlogs] = await Promise.all([
          FirestoreService.getArticles(),
          FirestoreService.getEvents(),
          FirestoreService.getSettings(),
          FirestoreService.getAllComments(),
          FirestoreService.getSubscribers(),
          FirestoreService.getMediaLibrary(),
          FirestoreService.getClassifieds(),
          FirestoreService.getLiveBlogs()
        ]);
        
        if (cloudArticles.length > 0) setAdminArticles(cloudArticles);
        if (cloudEvents.length > 0) setAdminEvents(cloudEvents);
        if (cloudSettings) setSiteSettings(cloudSettings);
        setAllComments(cloudComments);
        setSubscribers(cloudSubs);
        setMediaLibrary(cloudMedia);
        if (cloudClassifieds.length > 0) setClassifieds(cloudClassifieds);
        if (cloudLiveBlogs.length > 0) setLiveBlogs(cloudLiveBlogs);
        setIsCloudLoaded(true);
      } catch (error: any) {
        let isPermissionError = false;
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error && parsed.operationType) isPermissionError = true;
        } catch (e) {
          isPermissionError = error.code === 'permission-denied' || error.message?.includes('insufficient permissions');
        }

        if (isPermissionError || error.message?.includes('offline')) {
          console.log("Cloud Data: En attente de configuration Firebase ou de contenu initial.");
        } else {
          console.error("Error fetching cloud data:", error);
        }
      }
    };
    fetchData();

    return () => unsubscribe();
  }, []);

  const handleAdminLogin = async () => {
    try {
      const user = await signInWithGoogle();
      
      if (!user) {
        console.log("Login user object is null");
        return;
      }

      // Fallback: Si user.email est null, on cherche dans les données du fournisseur
      const userEmail = user.email || (user.providerData && user.providerData[0]?.email);

      if (!userEmail) {
        alert("Google n'a pas transmis votre adresse email. Veuillez réessayer ou vérifier que votre compte Google autorise le partage de l'email.");
        await auth.signOut();
        return;
      }

      console.log("Tentative de connexion avec :", userEmail);

      if (userEmail === 'akwabanewsinfo@gmail.com') {
        setIsAdminAuthenticated(true);
        setCurrentView('admin');
        setActiveNotification("Connexion réussie !");
      } else {
        alert(`Accès refusé : L'email ${user.email} n'est pas autorisé. \n\nVeuillez utiliser akwabanewsinfo@gmail.com.`);
        await auth.signOut();
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/popup-closed-by-user') return;
      
      if (error.code === 'auth/unauthorized-domain') {
        alert("Erreur Firebase : Ce domaine n'est pas autorisé. \n\nAjoutez ce domaine dans la console Firebase > Authentication > Paramètres.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Le navigateur a bloqué la fenêtre de connexion.");
      } else {
        alert("Erreur lors de la connexion : " + (error.message || "Erreur inconnue"));
      }
    }
  };

  const handleSaveArticle = async (article: Partial<Article>) => {
    try {
      const art = article as Article;
      await FirestoreService.saveArticle(art);
      if (art.image) FirestoreService.trackMedia(art.image, 'image');
      if (art.video) FirestoreService.trackMedia(art.video, 'video');
      
      const isNew = !adminArticles.find(a => a.id === art.id);
      if (isNew) {
        setAdminArticles([art, ...adminArticles]);
      } else {
        setAdminArticles(adminArticles.map(a => a.id === art.id ? art : a));
      }
      setEditingArticle(null);
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Erreur lors de la sauvegarde sur le Cloud. Vérifiez vos permissions.");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article du Cloud ?')) {
      try {
        await FirestoreService.deleteArticle(id);
        setAdminArticles(adminArticles.filter(a => a.id !== id));
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  };

  const handleSaveEvent = async (event: Partial<Event>) => {
    try {
      const ev = event as Event;
      await FirestoreService.saveEvent(ev);
      if (ev.image) FirestoreService.trackMedia(ev.image, 'image');
      if (ev.video) FirestoreService.trackMedia(ev.video, 'video');
      
      const isNew = !adminEvents.find(e => e.id === ev.id);
      if (isNew) {
        setAdminEvents([ev, ...adminEvents]);
      } else {
        setAdminEvents(adminEvents.map(e => e.id === ev.id ? ev : e));
      }
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleSaveSettings = async (settings: SiteSettings) => {
    try {
      await FirestoreService.saveSettings(settings);
      setSiteSettings(settings);
      setActiveNotification("Paramètres mis à jour !");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Erreur lors de la sauvegarde des paramètres.");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm('Supprimer ce commentaire de façon permanente ?')) {
      try {
        await FirestoreService.deleteComment(id);
        setAllComments(allComments.filter(c => c.id !== id));
        setActiveNotification("Commentaire supprimé.");
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement du Cloud ?')) {
      try {
        await FirestoreService.deleteEvent(id);
        setAdminEvents(adminEvents.filter(e => e.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleAdminLogout = async () => {
    try {
      await auth.signOut();
      setIsAdminAuthenticated(false);
      setCurrentView('home');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleBookmarkArticle = async (articleId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const isBookmarked = !userBookmarkedArticles.has(articleId);
    
    try {
      await FirestoreService.bookmarkArticle(articleId, currentUser.uid, isBookmarked);
      
      setUserBookmarkedArticles(prev => {
        const next = new Set(prev);
        if (isBookmarked) next.add(articleId);
        else next.delete(articleId);
        return next;
      });

      if (isBookmarked) {
        setActiveNotification("Article enregistré dans vos favoris !");
      }
    } catch (error) {
      console.error("Bookmark article error:", error);
    }
  };

  const handleShareArticle = (article: Article, platform?: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = window.location.href; // In real app, this would be the specific article URL
    const text = `Découvrez cet article sur Akwaba Info : ${article.title}`;
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else {
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.excerpt,
          url: url,
        }).catch(err => console.error("Error sharing:", err));
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url);
        setActiveNotification("Lien copié dans le presse-papier !");
      }
    }
  };

  const handleAddComment = async (articleId: string, parentCommentId?: string) => {
    if (!newCommentText.trim() || (!commentAuthorName.trim() && !currentUser)) {
      if (!currentUser) handleUserLogin();
      return;
    }
    
    const author = currentUser?.displayName || commentAuthorName;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser?.uid,
      userPhoto: currentUser?.photoURL,
      username: author,
      date: new Date().toISOString(),
      content: newCommentText,
      likes: 0,
      likedBy: [],
      replies: [],
      articleId: articleId
    };

    try {
      await FirestoreService.saveComment(newComment);
      
      setArticleComments(prev => {
        const currentComments = [...(prev[articleId] || [])];
        
        if (parentCommentId && parentCommentId !== 'mock') {
          const addReply = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === parentCommentId) {
                return { ...c, replies: [...c.replies, newComment] };
              }
              if (c.replies.length > 0) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          return { ...prev, [articleId]: addReply(currentComments) };
        }

        return { ...prev, [articleId]: [newComment, ...currentComments] };
      });

      setNewCommentText('');
      setReplyingTo(null);
      setActiveNotification("Votre message a été publié !");
    } catch (error) {
      console.error("Error adding comment:", error);
      setActiveNotification("Erreur lors de la publication.");
    }
  };

  const handleLikeArticle = async (articleId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const isLiked = !userLikedArticles.has(articleId);
    
    try {
      await FirestoreService.likeArticle(articleId, currentUser.uid, isLiked);
      
      setUserLikedArticles(prev => {
        const next = new Set(prev);
        if (isLiked) next.add(articleId);
        else next.delete(articleId);
        return next;
      });

      // Update local article likes count
      setAdminArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, likes: (a.likes || 0) + (isLiked ? 1 : -1) } : a
      ));

      if (isLiked) {
        setActiveNotification("Vous avez aimé cet article !");
      }
    } catch (error) {
      console.error("Like article error:", error);
    }
  };

  const handleLikeComment = async (articleId: string, commentId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }

    const commentPath = articleComments[articleId] || [];
    const findComment = (list: Comment[]): Comment | undefined => {
      for (const c of list) {
        if (c.id === commentId) return c;
        const sub = findComment(c.replies);
        if (sub) return sub;
      }
    };
    
    const target = findComment(commentPath);
    if (!target) return;

    const isLiked = !target.likedBy?.includes(currentUser.uid);
    
    try {
      await FirestoreService.likeComment(commentId, currentUser.uid, isLiked);
      
      setArticleComments(prev => {
        const updateLikes = (comments: Comment[]): Comment[] => {
          return comments.map(c => {
            if (c.id === commentId) {
              const likedBy = isLiked 
                ? [...(c.likedBy || []), currentUser.uid] 
                : (c.likedBy || []).filter(id => id !== currentUser.uid);
              return { ...c, likes: (c.likes || 0) + (isLiked ? 1 : -1), likedBy };
            }
            if (c.replies.length > 0) {
              return { ...c, replies: updateLikes(c.replies) };
            }
            return c;
          });
        };
        return { ...prev, [articleId]: updateLikes(prev[articleId] || []) };
      });
    } catch (error) {
      console.error("Like comment error:", error);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }
    try {
      await FirestoreService.reportComment(commentId, currentUser.uid);
      setActiveNotification("Le commentaire a été signalé à l'administration.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowAuthor = async (authorName: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }
    const isFollowing = !userFollowedAuthors.has(authorName);
    try {
      await FirestoreService.followAuthor(authorName, currentUser.uid, isFollowing);
      setUserFollowedAuthors(prev => {
        const next = new Set(prev);
        if (isFollowing) next.add(authorName);
        else next.delete(authorName);
        return next;
      });
      setActiveNotification(isFollowing ? `Vous suivez maintenant ${authorName}` : `Vous ne suivez plus ${authorName}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowCategory = async (category: string) => {
    if (!currentUser) {
      handleUserLogin();
      return;
    }
    const isFollowing = !userFollowedCategories.has(category);
    try {
      await FirestoreService.followCategory(category, currentUser.uid, isFollowing);
      setUserFollowedCategories(prev => {
        const next = new Set(prev);
        if (isFollowing) next.add(category);
        else next.delete(category);
        return next;
      });
      setActiveNotification(isFollowing ? `Vous suivez maintenant la catégorie ${category}` : `Vous ne suivez plus ${category}`);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('akwaba_dark_mode', String(next));
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    const saved = localStorage.getItem('akwaba_dark_mode') === 'true';
    setIsDarkMode(saved);
    if (saved) document.documentElement.classList.add('dark');
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    try {
      await FirestoreService.subscribe(newsletterEmail);
      setActiveNotification("Merci ! Vous êtes maintenant inscrit à la newsletter.");
      setNewsletterEmail('');
    } catch (error) {
      console.error("Newsletter error:", error);
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShowCookieBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const notifConsent = localStorage.getItem('notification-consent');
    if (!notifConsent) {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 5000);
      return () => clearTimeout(timer);
    } else if (notifConsent === 'accepted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Simulate an urgent notification after 10 seconds
  useEffect(() => {
    if (notificationsEnabled) {
      const timer = setTimeout(() => {
        setActiveNotification("URGENT : Coupure d'électricité majeure annoncée à Abidjan pour demain.");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notificationsEnabled]);

  const handleNotificationConsent = (accepted: boolean) => {
    localStorage.setItem('notification-consent', accepted ? 'accepted' : 'declined');
    setNotificationsEnabled(accepted);
    setShowNotificationPrompt(false);
  };

  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'declined');
    setShowCookieBanner(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Keep splash a bit longer for the "welcome" effect
      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('akwaba_splash_shown', 'true');
      }, 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

   const categories = siteSettings.categories || ['À la une', 'Politique', 'Économie', 'Science', 'Santé', 'Culture', 'Histoire', 'Sport'];
 
  const visibleArticles = isAdminAuthenticated 
    ? adminArticles 
    : adminArticles.filter(a => {
        const isPublished = a.status === 'published';
        const isNotScheduled = !a.scheduledAt || new Date(a.scheduledAt) <= new Date();
        return isPublished && isNotScheduled;
      });

  const visibleEvents = isAdminAuthenticated 
    ? adminEvents 
    : adminEvents.filter(e => {
        const isPublished = e.status === 'published';
        const isNotScheduled = !e.scheduledAt || new Date(e.scheduledAt) <= new Date();
        return isPublished && isNotScheduled;
      });

  const filteredArticles = activeCategory === 'À la une' 
    ? visibleArticles 
    : visibleArticles.filter(a => a.category === activeCategory);

  const handleUserLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
      setIsAdminAuthenticated(false);
      localStorage.setItem('akwaba_is_admin', 'false');
      setActiveNotification("Déconnexion réussie");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleUserLogin = () => {
    setShowLoginModal(true);
  };

  const handleAuthSuccess = (user: FirebaseUser) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setActiveNotification(`Bienvenue, ${user.displayName || 'Utilisateur'}`);
    
    // Auto redirect to profile if starting from some specific views
    if (currentView === 'admin-login') {
      navigateTo('admin');
    }
  };

  const [visibleArticlesCount, setVisibleArticlesCount] = useState(4);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleArticlesCount(4);
  }, [activeCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleArticlesCount < filteredArticles.length) {
          setVisibleArticlesCount(prev => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [visibleArticlesCount, filteredArticles.length]);

  const displayedArticles = filteredArticles.slice(0, visibleArticlesCount);

  const [visibleSearchCount, setVisibleSearchCount] = useState(4);
  const searchLoadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleSearchCount(4);
  }, [searchQuery, filterAuthor, filterDate, filterCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleSearchCount(prev => prev + 4);
        }
      },
      { threshold: 0.1 }
    );

    if (searchLoadingRef.current) {
      observer.observe(searchLoadingRef.current);
    }

    return () => observer.disconnect();
  }, [visibleSearchCount]);

  const searchResults = visibleArticles.filter(a => {
    const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAuthor = !filterAuthor || a.author.toLowerCase().includes(filterAuthor.toLowerCase());
    const matchesCategory = !filterCategory || a.category === filterCategory;
    const matchesDate = !filterDate || a.date.startsWith(filterDate);
    return matchesQuery && matchesAuthor && matchesCategory && matchesDate;
  });

  const displayedSearchResults = searchResults.slice(0, visibleSearchCount);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setCurrentView('event');
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setCurrentView('home');
    setSelectedArticle(null);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const navigateTo = (view: typeof currentView) => {
    setCurrentView(view);
    localStorage.setItem('akwaba_current_view', view);
    setSelectedArticle(null);
    setSelectedEvent(null);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedArticle(null);
    setSelectedEvent(null);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const FLASH_NEWS = [
    "Côte d'Ivoire : Lancement d'un nouveau programme de soutien aux startups technologiques à Abidjan.",
    "Économie : La ZLECAf annonce une progression record des échanges intra-africains pour le premier trimestre.",
    "Sport : Les préparatifs de la prochaine CAN avancent à grands pas, inspection des stades terminée.",
    "Culture : Le festival des musiques urbaines d'Anoumabo (FEMUA) dévoile sa programmation internationale.",
    "Monde : Sommet extraordinaire de l'Union Africaine sur la sécurité alimentaire prévu le mois prochain."
  ];

  const trendingArticles = [...adminArticles]
    .filter(article => {
      const articleDate = new Date(article.date);
      const now = new Date();
      const diffInHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 48; // Last 48 hours
    })
    .sort((a, b) => {
      const likesA = (a.likes || 0) + (articleLikes[a.id] || 0);
      const likesB = (b.likes || 0) + (articleLikes[b.id] || 0);
      const commentsA = (a.commentsCount || 0) + (articleComments[a.id]?.length || 0);
      const commentsB = (b.commentsCount || 0) + (articleComments[b.id]?.length || 0);
      
      const scoreA = (a.views || 0) + likesA * 2 + commentsA * 5;
      const scoreB = (b.views || 0) + likesB * 2 + commentsB * 5;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  if (siteSettings.maintenanceMode && !isAdminAuthenticated && currentView !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
        <MonitorOff size={64} className="text-slate-300 animate-pulse" />
        <h1 className="text-4xl font-black italic">Site en Maintenance</h1>
        <p className="max-w-md text-slate-500 font-medium leading-relaxed">Nous effectuons actuellement des mises à jour techniques pour améliorer votre expérience. Akwaba Info sera bientôt de retour.</p>
        <button onClick={() => setCurrentView('admin')} className="text-xs font-bold text-slate-300 hover:text-slate-900 transition-colors uppercase tracking-widest">Administration</button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen isDarkMode={isDarkMode} />}
      </AnimatePresence>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleAuthSuccess}
        isDarkMode={isDarkMode}
      />

      {/* Urgent Banner */}
      {siteSettings.urgentBannerActive && siteSettings.urgentBannerText && (
        <div className="bg-red-600 text-white overflow-hidden py-3 text-xs font-black uppercase tracking-widest sticky top-0 z-[100] shadow-xl">
           <motion.div 
             animate={{ x: [0, -1000] }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="whitespace-nowrap flex gap-20 items-center justify-center"
           >
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentBannerText}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentBannerText}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentBannerText}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentBannerText}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentBannerText}</div>
             <div className="flex items-center gap-4"><AlertTriangle size={16}/> URGENT : {siteSettings.urgentBannerText}</div>
           </motion.div>
        </div>
      )}

      <div className={cn(
        "min-h-screen transition-colors duration-300 african-pattern pb-16 lg:pb-0",
        isDarkMode ? "bg-slate-950 text-white" : "bg-[#F5F1EB] text-slate-900"
      )}>
      <FlashInfo articles={FLASH_NEWS} />
      {/* Notification Prompt */}
      <AnimatePresence>
        {showNotificationPrompt && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className={cn(
              "max-w-md w-full p-8 rounded-[40px] shadow-2xl border text-center space-y-6",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
            )}>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <BellRing size={40} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Activer les notifications</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Recevez les alertes urgentes directement sur votre appareil.</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleNotificationConsent(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  Plus tard
                </button>
                <button 
                  onClick={() => handleNotificationConsent(true)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                >
                  Activer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Notification Toast */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-24 right-6 z-[150] max-w-sm w-full"
          >
            <div className="bg-red-600 text-white p-6 rounded-3xl shadow-2xl flex gap-4 items-start border-4 border-white/20">
              <div className="p-2 bg-white/20 rounded-xl shrink-0">
                <Bell size={24} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-80">ALERTE URGENTE</div>
                <p className="text-sm font-bold leading-tight">{activeNotification}</p>
              </div>
              <button onClick={() => setActiveNotification(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-[400px] z-[120]"
          >
            <div className={cn(
              "p-6 rounded-3xl shadow-2xl border flex flex-col gap-4",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Eye size={20} />
                </div>
                <h3 className="font-display font-bold text-lg">Respect de votre vie privée</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et vous proposer des contenus adaptés.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCookieConsent(true)}
                  className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Accepter tout
                </button>
                <button
                  onClick={() => handleCookieConsent(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                >
                  Refuser
                </button>
              </div>
              <button 
                onClick={() => navigateTo('cookies')}
                className="text-[10px] text-slate-400 hover:text-primary transition-colors text-center uppercase font-bold tracking-widest"
              >
                En savoir plus sur notre politique
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress Bar */}
      {currentView === 'article' && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[110]"
          style={{ scaleX }}
        />
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={cn(
              "fixed inset-0 z-[100] p-6 lg:hidden flex flex-col overflow-y-auto scroll-smooth",
              isDarkMode ? "bg-slate-950" : "bg-white"
            )}
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col items-center gap-4 w-full">
                <img 
                  src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
                  alt="Akwaba Info Logo" 
                  className="w-32 h-32 object-contain rounded-3xl shadow-lg border border-slate-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-2xl font-black">MENU</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-900">
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-6">
              {currentUser ? (
                <div 
                  onClick={() => { navigateTo('profile'); setIsMenuOpen(false); }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-3xl mb-2 cursor-pointer",
                    isDarkMode ? "bg-slate-900" : "bg-slate-50",
                    currentView === 'profile' && "ring-2 ring-primary"
                  )}
                >
                  <img 
                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}`} 
                    className="w-12 h-12 rounded-full border-2 border-primary"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                      {currentUser.displayName || 'Utilisateur'}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-primary">Voir mon profil</div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleUserLogin} 
                  className="flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-3xl font-bold shadow-lg shadow-primary/20"
                >
                  <User size={24} /> Se connecter / S'ouvrir
                </button>
              )}

              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    "text-2xl font-black text-left transition-colors",
                    activeCategory === cat && currentView === 'home' ? "text-primary" : "text-slate-400"
                  )}
                >
                  {cat}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-4" />
              <button onClick={() => navigateTo('live-blog')} className="text-lg font-bold text-left text-red-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Direct (Live)
              </button>
              <button onClick={() => navigateTo('classifieds')} className="text-lg font-bold text-left text-slate-800 flex items-center gap-2">
                <Copy size={24} /> Petites Annonces
              </button>
              <button onClick={() => navigateTo('webtv')} className="text-lg font-bold text-left text-primary flex items-center gap-2">
                <Youtube size={24} /> Web TV
              </button>
              <button onClick={() => navigateTo('all-events')} className="text-lg font-bold text-left text-slate-800 flex items-center gap-2">
                <Calendar size={24} /> Agenda Culturel
              </button>
              <div className="h-px bg-slate-100 my-4" />
              <button onClick={() => navigateTo('about')} className="text-lg font-bold text-left text-slate-500">À propos</button>
              <button onClick={() => navigateTo('contact')} className="text-lg font-bold text-left text-slate-500">Contact</button>
              <button onClick={() => navigateTo('donate')} className="text-lg font-bold text-left text-primary">Soutenir le journal</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Navbar */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-xl border-b transition-colors",
        isDarkMode ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-24 md:h-28 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Menu size={24} />
            </button>
            <div onClick={goHome} className="cursor-pointer flex items-center gap-4">
              <img 
                src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
                alt="Akwaba Info Logo" 
                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-2xl shadow-md border border-slate-50"
                referrerPolicy="no-referrer"
                decoding="async"
              />
              <div>
                <h1 className="text-xl md:text-3xl font-black tracking-tighter">
                  AKWABA <span className="text-primary">INFO</span>
                </h1>
                <p className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest -mt-1">
                  L’info du monde en un clic
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 overflow-x-auto flex-nowrap no-scrollbar max-w-[50%]">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-primary whitespace-nowrap",
                  activeCategory === cat && currentView === 'home' ? "text-primary" : "text-slate-500"
                )}
              >
                {cat}
              </button>
            ))}
            <button 
              onClick={() => navigateTo('live-blog')}
              className={cn(
                "text-sm font-bold transition-colors hover:text-red-600 flex items-center gap-1",
                currentView === 'live-blog' ? "text-red-600 underline underline-offset-4" : "text-slate-500"
              )}
            >
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" /> Direct
            </button>
            <button 
              onClick={() => navigateTo('classifieds')}
              className={cn(
                "text-sm font-bold transition-colors hover:text-slate-900 whitespace-nowrap",
                currentView === 'classifieds' ? "text-slate-900 underline underline-offset-4" : "text-slate-500"
              )}
            >
              Annonces
            </button>
            <button 
              onClick={() => navigateTo('webtv')}
              className={cn(
                "text-sm font-bold transition-colors hover:text-secondary whitespace-nowrap",
                currentView === 'webtv' ? "text-secondary underline underline-offset-4" : "text-slate-500"
              )}
            >
              Web TV
            </button>
            <button 
              onClick={() => navigateTo('all-events')}
              className={cn(
                "text-sm font-bold transition-colors hover:text-primary whitespace-nowrap",
                currentView === 'all-events' ? "text-primary underline underline-offset-4" : "text-slate-500"
              )}
            >
              Agenda
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateTo('search')}
              className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}
            >
              <Search size={22} />
            </button>
            <button 
              onClick={toggleDarkMode}
              className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}
            >
              {isDarkMode ? <Sun size={22} className="text-yellow-400" /> : <Moon size={22} className="text-slate-600" />}
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
            
            {currentUser && (
               <div className="relative">
                  <button 
                    onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                    className={cn(
                      "p-3 rounded-full transition-all relative group",
                      showNotificationCenter ? "bg-primary text-white" : "hover:bg-slate-100 text-slate-500"
                    )}
                  >
                    <Bell size={22} />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showNotificationCenter && (
                      <NotificationCenter 
                        notifications={notifications}
                        onClose={() => setShowNotificationCenter(false)}
                        onMarkRead={handleMarkNotificationAsRead}
                        onNavigate={(link) => {
                          const article = adminArticles.find(a => a.id === link || a.slug === link);
                          if (article) handleArticleClick(article);
                          setShowNotificationCenter(false);
                        }}
                      />
                    )}
                  </AnimatePresence>
               </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div onClick={() => navigateTo('profile')} className="relative group cursor-pointer" title="Mon Profil">
                  <img 
                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || 'User'}`} 
                    alt="User Profile" 
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-colors",
                      currentView === 'profile' ? "border-primary" : "border-primary/20 hover:border-primary"
                    )}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                </div>
                <button 
                  onClick={handleUserLogout}
                  className="hidden md:flex p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleUserLogin}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 font-bold text-sm"
              >
                <User size={20} />
                <span className="hidden md:inline">Connexion</span>
              </button>
            )}

            <button 
              id="header-donate-btn"
              onClick={() => navigateTo('donate')}
              className="hidden md:flex bg-primary text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Soutenir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : currentView === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Category Tabs Mobile */}
              <div className="lg:hidden flex flex-nowrap gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 touch-pan-x scroll-smooth">
                {categories.map(cat => (
                  <button
                    key={cat}
                    id={`cat-tab-${cat}`}
                    onClick={() => {
                      handleCategoryClick(cat);
                      document.getElementById(`cat-tab-${cat}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 shadow-sm",
                      activeCategory === cat 
                        ? "bg-primary text-white shadow-primary/20" 
                        : "bg-white text-slate-500 border border-slate-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Hero Section */}
              {activeCategory === 'À la une' && visibleArticles.length > 0 && (
                <section className="space-y-10">
                  <HeroSlideshow 
                    articles={visibleArticles.slice(0, 3)} 
                    onArticleClick={handleArticleClick} 
                    onBookmark={handleBookmarkArticle}
                    bookmarkedIds={userBookmarkedArticles}
                  />
                  
                  <TrendingSection 
                    articles={trendingArticles}
                    onArticleClick={handleArticleClick}
                    onBookmark={handleBookmarkArticle}
                    bookmarkedIds={userBookmarkedArticles}
                  />
                  <GoogleAd className="my-10" label="Annonce à la une" />
                </section>
              )}

              {/* Grid Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-2xl md:text-3xl">
                    {activeCategory === 'À la une' ? 'Dernières Nouvelles' : activeCategory}
                  </h2>
                  {activeCategory !== 'À la une' && (
                    <button 
                      onClick={() => handleFollowCategory(activeCategory)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all",
                        userFollowedCategories.has(activeCategory)
                          ? "bg-slate-200 text-slate-500"
                          : "bg-primary text-white shadow-lg shadow-primary/20"
                      )}
                    >
                      {userFollowedCategories.has(activeCategory) ? <Check size={14} /> : <Plus size={14} />}
                      {userFollowedCategories.has(activeCategory) ? 'Suivi' : 'Suivre'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedArticles.length > 0 ? displayedArticles.map((article) => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      variant="vertical"
                      onClick={() => handleArticleClick(article)} 
                      onBookmark={handleBookmarkArticle}
                      isBookmarked={userBookmarkedArticles.has(article.id)}
                    />
                  )) : (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">
                      Aucun article disponible dans cette catégorie pour le moment.
                    </div>
                  )}
                </div>
                
                {/* Infinite Scroll Sentinel */}
                {displayedArticles.length < filteredArticles.length && (
                  <div ref={loadingRef} className="flex justify-center py-10">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement plus d'articles...</span>
                    </div>
                  </div>
                )}
                
                {activePoll && (
                  <div className="max-w-2xl mx-auto pt-10">
                    <PollCard poll={activePoll} onVote={handleVote} hasVoted={hasVoted} />
                  </div>
                )}
                
                {displayedArticles.length >= filteredArticles.length && filteredArticles.length > 0 && (
                  <div className="flex justify-center pt-8">
                    <button 
                      id="home-search-more-btn"
                      onClick={() => navigateTo('search')}
                      className="group flex items-center gap-3 bg-white border-2 border-slate-100 px-8 py-4 rounded-2xl font-black text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
                    >
                      RECHERCHER D'AUTRES SUJETS
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </section>

              {/* Newsletter & Ad */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-primary/10 rounded-3xl p-8 space-y-4 border border-primary/20">
                  <h3 className="font-black text-2xl text-primary">La Newsletter Akwaba</h3>
                  <p className="text-slate-600">Rejoignez plus de 50,000 lecteurs et recevez l'essentiel de l'actualité africaine.</p>
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="votre@email.com" 
                      className="flex-1 bg-white rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button 
                      type="submit" 
                      id="newsletter-submit-btn"
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                      S'abonner
                    </button>
                  </form>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-slate-200 px-2 py-1 text-[8px] font-bold text-slate-500 uppercase">Ad</div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mb-2">Publicité</span>
                  <div className="w-full h-px bg-slate-200 mb-4" />
                  <div className="text-slate-400 font-bold text-lg mb-2">Annonce Google</div>
                  <p className="text-xs text-slate-400 mb-4">Découvrez nos offres exclusives</p>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-full text-[10px] font-bold">En savoir plus</button>
                </div>
              </section>

              <EventSection 
                events={visibleEvents} 
                onEventClick={handleEventClick} 
                onSeeAll={() => navigateTo('all-events')}
              />
            </motion.div>
          ) : currentView === 'event' && selectedEvent ? (
            <EventDetailView 
              event={selectedEvent} 
              onBack={goHome} 
            />
          ) : currentView === 'live-blog' ? (
            <LiveBlogView 
              blog={activeLiveBlog || (liveBlogs.length > 0 ? liveBlogs[0] : {
                id: 'mock-live',
                title: "Suivi en direct : Sommet économique d'Abidjan",
                updates: [
                  { id: '1', date: new Date().toISOString(), content: "Le sommet vient de s'ouvrir au Palais de la Culture.", type: 'info', author: 'Rédaction' },
                  { id: '2', date: new Date(Date.now() - 1000*60*30).toISOString(), content: "Les délégations arrivent progressivement.", type: 'info', author: 'Rédaction' }
                ],
                status: 'live',
                createdAt: new Date().toISOString()
              } as LiveBlog)}
              onBack={goHome} 
            />
          ) : currentView === 'classifieds' ? (
            <ClassifiedsView 
              classifieds={classifieds.length > 0 ? classifieds : [
                { id: '1', title: "Ordinateur Portable Gamer", description: "Vends ordinateur portable puissant pour jeux et montage.", category: 'divers', price: "450 000 XOF", location: "Angré, Abidjan", contact: "0102030405", username: "Konan", date: new Date().toISOString(), status: 'active' },
                { id: '2', title: "Appartement 3 pièces Cocody", description: "Bel appartement lumineux situé au coeur de Cocody.", category: 'immobilier', price: "350 000 XOF/mois", location: "Cocody, Abidjan", contact: "0504030201", username: "Marie", date: new Date().toISOString(), status: 'active' }
              ] as Classified[]}
              onBack={goHome} 
            />
          ) : currentView === 'article' && selectedArticle ? (
            <motion.div 
              key="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="space-y-4 text-center">
                <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 justify-center mb-4">
                  <ArrowLeft size={14} /> Retour à l'accueil
                </button>
                <Badge category={selectedArticle.category}>{selectedArticle.category}</Badge>
                <h1 className="text-2xl md:text-4xl font-display font-black leading-[1.1] tracking-tight text-slate-900">
                  {selectedArticle.title}
                </h1>
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {selectedArticle.tags.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          navigateTo('search');
                        }}
                        className="text-[10px] font-bold bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary px-3 py-1 rounded-full uppercase tracking-widest transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                      {selectedArticle.author[0]}
                    </div>
                    <span className="font-bold text-slate-900">{selectedArticle.author}</span>
                    {selectedArticle.authorRole && (
                      <span className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded font-bold uppercase ml-1">
                        {selectedArticle.authorRole}
                      </span>
                    )}
                  </div>
                  <span>•</span>
                  <span>{format(new Date(selectedArticle.date), 'dd MMMM yyyy', { locale: fr })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {selectedArticle.readingTime}</span>
                </div>
              </div>

              {selectedArticle.audioUrl && (
                <div className="bg-slate-900 rounded-[30px] p-6 text-white shadow-2xl border border-white/10 mt-8 mb-4">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-primary/20 rounded-2xl text-primary animate-pulse">
                      <TrendingUp size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Audio / Podcast</p>
                      <h4 className="font-bold text-sm italic">Écouter la version audio</h4>
                      <audio controls className="w-full h-8 mt-2 accent-primary">
                        <source src={selectedArticle.audioUrl} type="audio/mpeg" />
                        Navigateur non supporté
                      </audio>
                    </div>
                  </div>
                </div>
              )}

              {(selectedArticle.image || selectedArticle.video) && (
                <div className="space-y-6">
                  {selectedArticle.video && getYoutubeId(selectedArticle.video) && (
                    <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900/5 aspect-video">
                      <iframe 
                        src={`https://www.youtube.com/embed/${getYoutubeId(selectedArticle.video)}`}
                        title={selectedArticle.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      />
                    </div>
                  )}
                  {selectedArticle.image && (
                    <div className="w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900/5">
                      <img 
                        id={`article-detail-img-${selectedArticle.id}`}
                        src={optimizeImage(selectedArticle.image, 1200)} 
                        alt={selectedArticle.title}
                        className="w-full h-auto max-h-[80vh] object-contain mx-auto block"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                      />
                      {selectedArticle.imageCredit && (
                        <div className="px-6 py-3 bg-slate-900/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Camera size={12} /> Source : {selectedArticle.imageCredit}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
                <div className="space-y-8">
                  <div className="flex flex-col gap-6">
                    <AudioPlayer article={selectedArticle} />
                    {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {selectedArticle.gallery.map((img, i) => (
                           <div key={i} className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in" onClick={() => {/* Open gallery */}}>
                             <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                  <GoogleAd className="mb-8" />
                  
                  <div className="markdown-body text-lg leading-relaxed">
                    {(() => {
                      const content = selectedArticle.content;
                      const paragraphs = content.split('\n\n');
                      if (paragraphs.length > 3) {
                        return (
                          <>
                            <ReactMarkdown>{paragraphs.slice(0, 2).join('\n\n')}</ReactMarkdown>
                            <GoogleAd className="my-10" label="Publicité contextuelle" />
                            <ReactMarkdown>{paragraphs.slice(2, 4).join('\n\n')}</ReactMarkdown>
                            <ReadAlso 
                              currentArticle={selectedArticle} 
                              articles={adminArticles} 
                              onArticleClick={handleArticleClick} 
                            />
                            <ReactMarkdown>{paragraphs.slice(4).join('\n\n')}</ReactMarkdown>
                          </>
                        );
                      }
                      return (
                        <>
                          <ReactMarkdown>{content}</ReactMarkdown>
                          <ReadAlso 
                            currentArticle={selectedArticle} 
                            articles={adminArticles} 
                            onArticleClick={handleArticleClick} 
                          />
                        </>
                      );
                    })()}
                  </div>

                  <GoogleAd className="my-8" label="Publicité ciblée" />

                  {selectedArticle.source && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dotted border-slate-200">
                      <Globe size={14} /> Source : {selectedArticle.source}
                    </div>
                  )}

                  {/* Engagement / Réactions */}
                  <div className="mt-12 pt-8 border-t border-slate-100 space-y-8">
                    <div className="flex flex-col items-center gap-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Quelle est votre réaction ?</h4>
                      <div className="flex flex-wrap justify-center gap-4">
                        {[
                          { icon: '🔥', label: 'Feu', key: 'fire' },
                          { icon: '👏', label: 'Bravo', key: 'bravo' },
                          { icon: '😮', label: 'Surpris', key: 'wow' },
                          { icon: '😢', label: 'Triste', key: 'sad' },
                          { icon: '🤨', label: 'Doute', key: 'think' }
                        ].map((react) => (
                          <button 
                            key={react.key}
                            onClick={() => {
                              const currentReactions = selectedArticle.reactions || {};
                              const newValue = (currentReactions[react.key] || 0) + 1;
                              handleSaveArticle({
                                ...selectedArticle,
                                reactions: { ...currentReactions, [react.key]: newValue }
                              });
                              setActiveNotification(`Vous avez réagi avec ${react.icon} !`);
                            }}
                            className="bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all flex flex-col items-center gap-1 group"
                          >
                            <span className="text-2xl group-hover:scale-125 transition-transform">{react.icon}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase">{selectedArticle.reactions?.[react.key] || 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-8">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleLikeArticle(selectedArticle.id)}
                          className={cn(
                            "flex items-center gap-2 transition-colors group",
                            userLikedArticles.has(selectedArticle.id) ? "text-red-500" : "text-slate-500 hover:text-primary"
                          )}
                        >
                          <div className={cn(
                            "p-3 rounded-full transition-colors",
                            userLikedArticles.has(selectedArticle.id) ? "bg-red-50" : "bg-slate-100 group-hover:bg-primary/10"
                          )}>
                            <Heart size={24} fill={userLikedArticles.has(selectedArticle.id) ? "currentColor" : "none"} />
                          </div>
                          <span className="font-bold">{(selectedArticle.likes || 0) + (articleLikes[selectedArticle.id] || 0)}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group">
                          <div className="p-3 rounded-full bg-slate-100 group-hover:bg-primary/10 transition-colors">
                            <MessageSquare size={24} />
                          </div>
                          <span className="font-bold">{(selectedArticle.commentsCount || 0) + (articleComments[selectedArticle.id]?.length || 0)}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400 uppercase">Partager</span>
                        <button 
                          onClick={() => handleShareArticle(selectedArticle, 'twitter')}
                          className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-all"
                          title="Partager sur Twitter"
                        >
                          <Twitter size={20} />
                        </button>
                        <button 
                          onClick={() => handleShareArticle(selectedArticle, 'facebook')}
                          className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-[#4267B2] hover:text-white transition-all"
                          title="Partager sur Facebook"
                        >
                          <Facebook size={20} />
                        </button>
                        <button 
                          onClick={() => handleShareArticle(selectedArticle, 'whatsapp')}
                          className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-[#25D366] hover:text-white transition-all md:hidden"
                          title="Partager sur WhatsApp"
                        >
                          <Smartphone size={20} />
                        </button>
                        <button 
                          onClick={() => handleShareArticle(selectedArticle)}
                          className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-primary hover:text-white transition-all"
                          title="Plus d'options"
                        >
                          <Share2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleBookmarkArticle(selectedArticle.id)}
                          className={cn(
                            "p-3 rounded-full transition-all",
                            userBookmarkedArticles.has(selectedArticle.id) 
                              ? "bg-primary text-white" 
                              : "bg-slate-100 text-slate-600 hover:bg-primary hover:text-white"
                          )}
                          title={userBookmarkedArticles.has(selectedArticle.id) ? "Retirer des favoris" : "Enregistrer"}
                        >
                          <Bookmark size={20} fill={userBookmarkedArticles.has(selectedArticle.id) ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <GoogleAd className="mt-12" label="Annonce sponsorisée" />

                  {/* Comments */}
                  <div className="mt-12 space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black">Commentaires</h3>
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold uppercase">
                        Modération active
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 italic">
                      Les commentaires sont modérés avant publication.
                    </p>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                      {/* Recursive Comment Component */}
                      {(() => {
                        const renderComments = (comments: Comment[], isReply = false) => {
                          if (comments.length === 0 && !isReply) {
                            return (
                              <div className="flex gap-4 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold">Jean-Marc Koffi</span>
                                    <span className="text-xs text-slate-400">Exemple</span>
                                  </div>
                                  <p className="text-slate-600">Analyse très pertinente. Le potentiel est là, il manque juste l'accompagnement politique.</p>
                                  <button 
                                    onClick={() => {
                                      setReplyingTo({ commentId: 'mock', username: 'Jean-Marc Koffi' });
                                      document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-xs font-bold text-primary hover:underline"
                                  >
                                    Répondre
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          return comments.map((comment) => (
                            <div key={comment.id} className={cn("space-y-4", isReply && "ml-10 mt-4")}>
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                              >
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0",
                                  isReply ? "bg-slate-100 text-slate-400 w-8 h-8 text-xs" : "bg-primary/10 text-primary"
                                )}>
                                  {comment.username[0].toUpperCase()}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{comment.username}</span>
                                    <span className="text-[10px] text-slate-400">
                                      {format(new Date(comment.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
                                  <div className="flex items-center gap-4">
                                    <button 
                                      onClick={() => {
                                        setReplyingTo({ commentId: comment.id, username: comment.username });
                                        document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                                      }}
                                      className="text-xs font-bold text-primary hover:underline"
                                    >
                                      Répondre
                                    </button>
                                    <button 
                                      onClick={() => handleLikeComment(selectedArticle.id, comment.id)}
                                      className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-red-500 transition-colors"
                                    >
                                      <Heart size={12} /> {comment.likes}
                                    </button>
                                    <button 
                                      onClick={() => handleReportComment(comment.id)}
                                      className="text-[10px] font-bold text-slate-300 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                                    >
                                      <Flag size={10} /> Signaler
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="border-l-2 border-slate-50">
                                  {renderComments(comment.replies, true)}
                                </div>
                              )}
                            </div>
                          ));
                        };
                        return renderComments(articleComments[selectedArticle.id] || []);
                      })()}

                      {/* Comment Form */}
                      <div id="comment-form" className="pt-6 border-t border-slate-100 space-y-4">
                        {replyingTo && (
                          <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <span className="text-xs text-slate-500">
                              En réponse à <span className="font-bold text-primary">@{replyingTo.username}</span>
                            </span>
                            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Votre nom..." 
                              value={commentAuthorName}
                              onChange={(e) => setCommentAuthorName(e.target.value)}
                              className="w-full bg-slate-50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 items-end">
                          <textarea 
                            placeholder={replyingTo ? `Répondre à ${replyingTo.username}...` : "Ajouter un commentaire..."}
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            rows={2}
                            className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                          />
                          <button 
                            onClick={() => handleAddComment(selectedArticle.id, replyingTo?.commentId)}
                            disabled={!newCommentText.trim() || !commentAuthorName.trim()}
                            className="bg-primary text-white p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <aside className="hidden lg:block space-y-8">
                  <div className="sticky top-24 space-y-8">
                    <ExchangeRatesWidget rates={exchangeRates} />
                    
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                         <Award size={20} />
                         <span className="font-black text-xs uppercase tracking-widest">Suivre l'auteur</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-black text-primary">
                           {selectedArticle.author[0]}
                         </div>
                         <div className="flex-1">
                            <div className="font-bold text-sm">{selectedArticle.author}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedArticle.authorRole || 'Journaliste'}</div>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleFollowAuthor(selectedArticle.author)}
                        className={cn(
                          "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                          userFollowedAuthors.has(selectedArticle.author)
                            ? "bg-slate-200 text-slate-500"
                            : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105"
                        )}
                      >
                        {userFollowedAuthors.has(selectedArticle.author) ? 'Suivi' : 'S\'abonner'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Articles Similaires</h4>
                      {adminArticles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category).slice(0, 3).map(article => (
                        <div key={article.id} onClick={() => handleArticleClick(article)} className="cursor-pointer group flex gap-3">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                            <img src={optimizeImage(article.image || '', 300)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">{article.title}</h5>
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">{article.date.split('T')[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {activePoll && <PollCard poll={activePoll} onVote={handleVote} hasVoted={hasVoted} />}
                    <GoogleAd className="h-[250px]" label="Annonce" />
                  </div>
                </aside>
              </div>

              <ArticleCarousel 
                articles={visibleArticles.filter(a => a.id !== selectedArticle.id)}
                onArticleClick={handleArticleClick}
                onBookmark={handleBookmarkArticle}
                bookmarkedIds={userBookmarkedArticles}
              />
            </motion.div>
          ) : currentView === 'search' ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <button 
                onClick={goHome} 
                className="text-primary text-xs font-bold flex items-center gap-1 mb-4"
              >
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-4">
                  <Search size={28} className="text-primary" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Rechercher un article, un sujet..." 
                    className="flex-1 text-xl font-medium outline-none text-slate-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      showFilters ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Filter size={20} />
                  </button>
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="p-2 bg-slate-100 rounded-full text-slate-900"><X size={20} /></button>}
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Auteur</label>
                          <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Nom de l'auteur..."
                              className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                              value={filterAuthor}
                              onChange={(e) => setFilterAuthor(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Date</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="date" 
                              className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                              value={filterDate}
                              onChange={(e) => setFilterDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Catégorie</label>
                          <select 
                            className="w-full bg-slate-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 appearance-none"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                          >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {searchQuery || filterAuthor || filterDate || filterCategory ? (
                <div className="space-y-6">
                  <h3 className="font-black text-xl text-slate-900">
                    {searchResults.length} {searchResults.length > 1 ? 'résultats' : 'résultat'} pour "{searchQuery || '...'}"
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedSearchResults.map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        variant="vertical" 
                        onClick={() => handleArticleClick(article)}
                        onBookmark={handleBookmarkArticle}
                        isBookmarked={userBookmarkedArticles.has(article.id)}
                      />
                    ))}
                  </div>

                  {/* Infinite Scroll Sentinel for Search */}
                  {displayedSearchResults.length < searchResults.length && (
                    <div ref={searchLoadingRef} className="flex justify-center py-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recherche de plus de résultats...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Tendances</h3>
                    <div className="flex flex-wrap gap-3">
                      {['ZLECAf', 'Innovation Abidjan', 'Afrobeat 2026', 'Climat Afrique', 'Économie Numérique'].map(tag => (
                        <button 
                          key={tag} 
                          onClick={() => setSearchQuery(tag)}
                          className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold hover:border-primary hover:text-primary transition-all shadow-sm text-slate-900"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : currentView === 'profile' && currentUser ? (
            <UserProfileView 
              user={currentUser}
              savedArticles={adminArticles.filter(a => userBookmarkedArticles.has(a.id))}
              likedArticles={adminArticles.filter(a => userLikedArticles.has(a.id))}
              followedAuthors={Array.from(userFollowedAuthors)}
              followedCategories={Array.from(userFollowedCategories)}
              badges={userBadges}
              points={userPoints}
              comments={Object.values(articleComments).flat().filter(c => c.userId === currentUser.uid)}
              onArticleClick={handleArticleClick}
              onLogout={handleUserLogout}
              onFollowAuthor={handleFollowAuthor}
              onFollowCategory={handleFollowCategory}
            />
          ) : currentView === 'donate' ? (
            <motion.div 
              key="donate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-10"
            >
              <div className="lg:col-span-2">
                <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                  <ArrowLeft size={14} /> Retour à l'accueil
                </button>
              </div>

              {donationSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 bg-white rounded-[40px] p-12 text-center shadow-2xl border border-slate-100 space-y-6"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart size={40} fill="currentColor" />
                  </div>
                  <h2 className="text-3xl font-black">Merci pour votre générosité !</h2>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Votre don de <span className="font-bold text-slate-900">{selectedAmount} F</span> a été reçu avec succès. Vous recevrez un reçu par email sous peu.
                  </p>
                  <button 
                    onClick={() => { setDonationSuccess(false); goHome(); }}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold"
                  >
                    Retour à l'accueil
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black leading-tight">
                      Soutenez le journalisme <span className="text-primary">indépendant</span>.
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Akwaba Info s'engage à fournir une information de qualité, vérifiée et sans compromis sur l'actualité du continent africain. Votre don nous aide à rester libres.
                    </p>
                  </div>

                  <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100 space-y-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm">Choisissez un montant</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['2000', '5000', '10000'].map(amount => (
                          <button 
                            key={amount} 
                            onClick={() => setSelectedAmount(amount)}
                            className={cn(
                              "py-4 border-2 rounded-2xl text-sm font-black transition-all",
                              selectedAmount === amount 
                                ? "border-primary bg-primary/5 text-primary shadow-inner" 
                                : "border-slate-100 hover:border-primary/30"
                            )}
                          >
                            {amount} F
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm">Mode de paiement sécurisé</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setSelectedPayment('mobile')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all",
                            selectedPayment === 'mobile'
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-100 hover:bg-orange-50/50"
                          )}
                        >
                          <Smartphone className={selectedPayment === 'mobile' ? "text-orange-600" : "text-orange-500"} />
                          <span className="text-xs font-bold">Mobile Money</span>
                        </button>
                        <button 
                          onClick={() => setSelectedPayment('card')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all",
                            selectedPayment === 'card'
                              ? "border-blue-500 bg-blue-50 text-blue-600"
                              : "border-slate-100 hover:bg-blue-50/50"
                          )}
                        >
                          <CreditCard className={selectedPayment === 'card' ? "text-blue-600" : "text-blue-500"} />
                          <span className="text-xs font-bold">Carte / PayPal</span>
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => setDonationSuccess(true)}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Confirmer mon don de {selectedAmount} F
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : currentView === 'webtv' ? (
            <motion.div 
              key="webtv"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <WebTVView articles={visibleArticles} onArticleClick={handleArticleClick} />
            </motion.div>
          ) : currentView === 'about' ? (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">À propos d'Akwaba Info</h2>
              <div className="markdown-body space-y-6">
                <ReactMarkdown>
                  {siteSettings.aboutText}
                </ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'privacy' ? (
            <motion.div 
              key="privacy" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">Politique de Confidentialité</h2>
              <div className="markdown-body">
                <ReactMarkdown>{`
## 1. Introduction  
Chez Akwaba Info, la protection de vos données personnelles est une priorité. Cette politique de confidentialité vise à vous informer de manière claire et transparente sur la manière dont nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site.

## 2. Données collectées  
Nous collectons uniquement les informations nécessaires au bon fonctionnement de nos services, notamment :  
- Les données de navigation (adresse IP, type d’appareil, navigateur, pages consultées)  
- Les informations que vous fournissez volontairement (formulaire de contact, inscription à une newsletter, etc.)  

## 3. Utilisation des données  
Les données collectées sont utilisées pour :  
- Assurer le bon fonctionnement du site  
- Améliorer l’expérience utilisateur  
- Répondre à vos demandes et messages  
- Envoyer des informations ou actualités (si vous y avez consenti)

## 4. Cookies  
Notre site peut utiliser des cookies pour :  
- Faciliter votre navigation  
- Analyser l’audience et les performances du site  

Vous pouvez configurer votre navigateur pour refuser les cookies si vous le souhaitez.

## 5. Partage des données  
Vos données personnelles ne sont ni vendues ni louées. Elles peuvent être partagées uniquement avec des prestataires techniques nécessaires au fonctionnement du site, dans le respect de la confidentialité.

## 6. Sécurité  
Nous mettons en place des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.

## 7. Vos droits  
Conformément aux réglementations en vigueur, vous disposez des droits suivants :  
- Droit d’accès à vos données  
- Droit de rectification  
- Droit de suppression  
- Droit d’opposition au traitement de vos données  

Pour exercer ces droits, vous pouvez nous contacter.

## 8. Modifications  
Cette politique de confidentialité peut être mise à jour à tout moment. Nous vous recommandons de la consulter régulièrement.

## 9. Contact  
Pour toute question concernant cette politique ou vos données personnelles, vous pouvez nous contacter via les moyens disponibles sur notre site.

---

Dernière mise à jour : Avril 2026
`}</ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'terms' ? (
            <motion.div 
              key="terms" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">Conditions Générales d’Utilisation (CGU)</h2>
              <div className="markdown-body">
                <ReactMarkdown>{`
## 1. Objet  
Les présentes Conditions Générales d’Utilisation régissent l’accès et l’utilisation du site Akwaba Info.

## 2. Accès au site  
Le site est accessible gratuitement à tout utilisateur disposant d’un accès à Internet. Tous les frais liés à l’accès (connexion, matériel, etc.) sont à la charge de l’utilisateur.

## 3. Contenu  
Les contenus publiés (articles, images, informations) sont fournis à titre informatif. Akwaba Info s’efforce de fournir des informations fiables, mais ne garantit pas leur exactitude ou leur mise à jour en temps réel.

## 4. Propriété intellectuelle  
Tous les contenus du site (textes, images, logo, etc.) sont protégés par les lois relatives à la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est interdite.

## 5. Responsabilité  
L’utilisateur est seul responsable de l’utilisation qu’il fait des informations disponibles sur le site.  
Akwaba Info ne pourra être tenu responsable en cas de dommages directs ou indirects liés à l’utilisation du site.

## 6. Comportement de l’utilisateur  
L’utilisateur s’engage à :  
- Ne pas utiliser le site à des fins illégales  
- Ne pas perturber le bon fonctionnement du site  
- Respecter les autres utilisateurs  

## 7. Liens externes  
Le site peut contenir des liens vers des sites externes. Akwaba Info n’est pas responsable du contenu de ces sites.

## 8. Modification des conditions  
Les présentes conditions peuvent être modifiées à tout moment. Les utilisateurs sont invités à les consulter régulièrement.

## 9. Droit applicable  
Les présentes conditions sont régies par les lois en vigueur dans le pays d’exploitation du site.

## 10. Contact  
Pour toute question concernant les conditions d’utilisation, vous pouvez nous contacter via les moyens disponibles sur le site.

---

Dernière mise à jour : Avril 2026
`}</ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'contact' ? (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto py-10 space-y-12"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h2 className="text-4xl font-black">Contactez-nous</h2>
                  <p className="text-slate-600 leading-relaxed">
                    Une question ? Une suggestion ? Ou vous souhaitez simplement nous dire Akwaba ? Notre équipe est à votre écoute.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Map size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse</p>
                        <p className="font-bold">10 rue ange Rubaud, 94230 Cachan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Téléphone</p>
                        <p className="font-bold">06 23 94 00 97</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Send size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</p>
                        <p className="font-bold">akwabainfo229@gmail.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Nom complet</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                    <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Message</label>
                    <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Votre message..."></textarea>
                  </div>
                  <button className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/20">ENVOYER</button>
                </div>
              </div>
            </motion.div>
          ) : currentView === 'all-events' ? (
            <motion.div 
              key="all-events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto py-10 space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                    <ArrowLeft size={14} /> Retour à l'accueil
                  </button>
                  <h2 className="text-4xl font-black tracking-tighter">Agenda Complet</h2>
                  <p className="text-slate-500 mt-2">Tous les événements culturels et artistiques</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {MOCK_EVENTS.map((event) => (
                  <motion.div 
                    key={event.id}
                    id={`event-card-all-${event.id}`}
                    whileHover={{ y: -10 }}
                    onClick={() => handleEventClick(event)}
                    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                      {event.image && (
                        <img 
                          id={`event-card-img-all-${event.id}`}
                          src={optimizeImage(event.image, 500)} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-lg">
                          {event.category}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Calendar size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                      <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Map size={14} />
                        <span className="text-xs font-bold">{event.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : currentView === 'cookies' ? (
            <motion.div 
              key="cookies" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto py-10 space-y-8"
            >
              <button onClick={goHome} className="text-primary text-xs font-bold flex items-center gap-1 mb-4">
                <ArrowLeft size={14} /> Retour à l'accueil
              </button>
              <h2 className="text-4xl font-black">Politique relative aux Cookies</h2>
              <div className="markdown-body">
                <ReactMarkdown>{`
## 1. Introduction  
Le site Akwaba Info utilise des cookies afin d’améliorer votre expérience de navigation et d’analyser l’utilisation du site.

## 2. Qu’est-ce qu’un cookie ?  
Un cookie est un petit fichier texte enregistré sur votre appareil (ordinateur, smartphone, tablette) lors de votre visite sur un site web. Il permet de reconnaître votre appareil et de mémoriser certaines informations.

## 3. Types de cookies utilisés  
Nous utilisons différents types de cookies :  
- Cookies essentiels : nécessaires au bon fonctionnement du site  
- Cookies analytiques : permettent de mesurer l’audience et comprendre l’utilisation du site  
- Cookies de préférence : mémorisent vos choix (langue, paramètres)

## 4. Gestion des cookies  
Vous pouvez à tout moment configurer votre navigateur pour :  
- Accepter tous les cookies  
- Refuser tous les cookies  
- Être informé lorsqu’un cookie est déposé  

Notez que le refus de certains cookies peut affecter le fonctionnement du site.

## 5. Durée de conservation  
Les cookies sont conservés pour une durée limitée, en fonction de leur type, et conformément aux réglementations en vigueur.

## 6. Modification de la politique  
Cette politique peut être modifiée à tout moment afin de rester conforme aux lois et aux évolutions du site.

---

Dernière mise à jour : Avril 2026
`}</ReactMarkdown>
              </div>
            </motion.div>
          ) : currentView === 'admin-login' ? (
            <AdminLogin onLogin={handleAdminLogin} />
          ) : currentView === 'admin' ? (
            !isAuthChecked ? (
              <SplashScreen isDarkMode={isDarkMode} />
            ) : isAdminAuthenticated ? (
              editingArticle ? (
                <AdminEditor 
                  type="article"
                  categories={siteSettings.categories}
                  data={editingArticle} 
                  onSave={handleSaveArticle} 
                  onCancel={() => setEditingArticle(null)} 
                />
              ) : editingEvent ? (
                <AdminEditor 
                  type="event"
                  categories={siteSettings.categories}
                  data={editingEvent} 
                  onSave={handleSaveEvent} 
                  onCancel={() => setEditingEvent(null)} 
                />
              ) : (
                <AdminDashboard 
                  articles={adminArticles}
                  events={adminEvents}
                  comments={allComments}
                  subscribers={subscribers}
                  mediaLibrary={mediaLibrary}
                  settings={siteSettings}
                  onEditArticle={(a) => setEditingArticle(a)}
                  onEditEvent={(e) => setEditingEvent(e)}
                  onCreateArticle={() => setEditingArticle({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0] } as any)}
                  onCreateEvent={() => setEditingEvent({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0] } as any)}
                  onDeleteArticle={handleDeleteArticle}
                  onDeleteEvent={handleDeleteEvent}
                  onDeleteComment={handleDeleteComment}
                  onSaveSettings={handleSaveSettings}
                  onLogout={handleAdminLogout}
                  onGenerateCode={() => setShowExportModal(true)}
                />
              )
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showExportModal && (
            <ExportModal 
              articles={adminArticles} 
              events={adminEvents}
              onClose={() => setShowExportModal(false)} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className={cn(
        "border-t py-12 md:py-20 transition-colors",
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div onClick={goHome} className="flex flex-col gap-6 cursor-pointer">
              <img 
                src="https://raw.githubusercontent.com/Akwabanews/Sources/main/images/2DB685A1-EE6B-478E-B70B-58F490D2948A.jpeg" 
                alt="Akwaba Info Logo" 
                className="w-40 h-40 md:w-56 md:h-56 object-contain rounded-[40px] shadow-2xl border border-slate-100"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <h2 className="text-3xl font-black tracking-tighter">
                AKWABA <span className="text-primary">INFO</span>
              </h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {siteSettings.aboutText.length > 200 
                ? `${siteSettings.aboutText.substring(0, 197)}...` 
                : siteSettings.aboutText}
            </p>
            <div className="flex gap-4">
              {siteSettings.twitterUrl && (
                <a href={siteSettings.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-primary hover:text-white transition-all">
                  <Twitter size={20} />
                </a>
              )}
              {siteSettings.facebookUrl && (
                <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-primary hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest">Catégories</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              {categories.slice(1).map(cat => (
                <li key={cat} onClick={() => handleCategoryClick(cat)} className="hover:text-primary cursor-pointer transition-colors">{cat}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
              <h4 className="font-black text-sm uppercase tracking-widest">À propos</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li onClick={() => navigateTo('about')} className="hover:text-primary cursor-pointer transition-colors">À propos</li>
                <li onClick={() => navigateTo('privacy')} className="hover:text-primary cursor-pointer transition-colors">Confidentialité</li>
                <li onClick={() => navigateTo('cookies')} className="hover:text-primary cursor-pointer transition-colors">Cookies</li>
                <li onClick={() => navigateTo('terms')} className="hover:text-primary cursor-pointer transition-colors">Conditions</li>
              </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-primary">Newsletter</h4>
            <p className="text-sm text-slate-500">Restez informé de l'actualité africaine chaque matin.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="w-full bg-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent group-hover:border-slate-200"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button 
                onClick={async () => {
                  if (newsletterEmail && newsletterEmail.includes('@')) {
                    try {
                      await FirestoreService.subscribe(newsletterEmail);
                      setNewsletterEmail('');
                      setActiveNotification("Inscription réussie ! Merci d'avoir rejoint Akwaba Info.");
                      setTimeout(() => setActiveNotification(null), 3000);
                    } catch (e) {
                      alert("Erreur lors de l'inscription.");
                    }
                  } else {
                    alert("Veuillez entrer un email valide.");
                  }
                }}
                className="absolute right-2 top-2 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <p onClick={() => navigateTo('contact')} className="text-sm font-bold text-primary cursor-pointer hover:underline">Support & Contacts</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          <div 
            onClick={() => {
              const newCount = adminClickCount + 1;
              if (newCount >= 5) {
                if (isAdminAuthenticated) {
                  setCurrentView('admin');
                  setActiveNotification("Mode Admin : Bonjour !");
                } else {
                  setCurrentView('admin-login');
                  setActiveNotification("Mode Admin : Authentification requise.");
                }
                setAdminClickCount(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => setActiveNotification(null), 3000);
              } else {
                setAdminClickCount(newCount);
              }
            }}
            className="cursor-pointer py-4 select-none"
            title="Accès réservé"
          >
            © 2026 Akwaba Info. Tous droits réservés. Développé avec passion en Afrique.
            {adminClickCount > 0 && adminClickCount < 5 && (
              <span className="ml-2 opacity-50">({adminClickCount}/5)</span>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl border-t flex items-center justify-around px-4 z-50",
        isDarkMode ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200"
      )}>
        <button onClick={goHome} className={cn("flex flex-col items-center gap-1", currentView === 'home' ? "text-primary" : "text-slate-400")}>
          <Home size={20} />
          <span className="text-[10px] font-bold">Accueil</span>
        </button>
        <button onClick={() => navigateTo('search')} className={cn("flex flex-col items-center gap-1", currentView === 'search' ? "text-primary" : "text-slate-400")}>
          <Search size={20} />
          <span className="text-[10px] font-bold">Explorer</span>
        </button>
        <button onClick={() => navigateTo('donate')} className={cn("flex flex-col items-center gap-1", currentView === 'donate' ? "text-primary" : "text-slate-400")}>
          <Heart size={20} />
          <span className="text-[10px] font-bold">Soutenir</span>
        </button>
        <button onClick={() => navigateTo('about')} className={cn("flex flex-col items-center gap-1", currentView === 'about' ? "text-primary" : "text-slate-400")}>
          <User size={20} />
          <span className="text-[10px] font-bold">À propos</span>
        </button>
      </nav>
    </div>
    </>
  );
}
