import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  increment,
  arrayUnion,
  arrayRemove,
  where,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Article, Event, SiteSettings, Comment, Subscriber, MediaAsset, Poll, AppNotification } from '../types';

// Load config from environment variables (for external deployments like Vercel)
// or fallback to the local json file.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAY02YygUFWV4bVBQuTS-Y8qrxHLlYrfEM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0005221481.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0005221481",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0005221481.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "749252475281",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:749252475281:web:10f0674b2d28565598c230",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-a1c9a4e3-8a8d-440c-9fe7-a4eaf180d27c"
};

const isPlaceholder = !config.projectId || config.projectId.includes('remixed-');

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection Test
async function testConnection() {
  if (isPlaceholder) {
    console.log("Firebase: Utilisation du mode local (Configuration non initialisée)");
    return;
  }
  try {
    const testDoc = doc(db, 'test_connection', 'ping');
    await getDocFromServer(testDoc); 
    console.log(`Firebase: Connected to project ${config.projectId} (DB: ${config.firestoreDatabaseId || 'default'})`);
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    } else if (error.code === 'permission-denied') {
      console.log("Firebase: Readiness test - Waiting for first content or admin login.");
    } else {
      console.error("Firebase Connection Note:", error.message);
    }
  }
}
testConnection();

// --- Firestore Services ---

export const FirestoreService = {
  // Articles
  async getArticles(): Promise<Article[]> {
    if (isPlaceholder) return [];
    try {
      const q = query(collection(db, 'articles'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() } as Article));
    } catch (e) {
      return handleFirestoreError(e, 'list', 'articles');
    }
  },

  async saveArticle(article: Article): Promise<void> {
    if (isPlaceholder) return;
    try {
      await setDoc(doc(db, 'articles', article.id), article);
    } catch (e) {
      handleFirestoreError(e, 'create', `articles/${article.id}`);
    }
  },

  async deleteArticle(id: string): Promise<void> {
    if (isPlaceholder) return;
    await deleteDoc(doc(db, 'articles', id));
  },

  // Events
  async getEvents(): Promise<Event[]> {
    if (isPlaceholder) return [];
    const q = query(collection(db, 'events'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Event));
  },

  async saveEvent(event: Event): Promise<void> {
    if (isPlaceholder) return;
    await setDoc(doc(db, 'events', event.id), event);
  },

  async deleteEvent(id: string): Promise<void> {
    if (isPlaceholder) return;
    await deleteDoc(doc(db, 'events', id));
  },

  // Settings
  async getSettings(): Promise<SiteSettings | null> {
    if (isPlaceholder) return null;
    const d = await getDoc(doc(db, 'settings', 'global'));
    return d.exists() ? d.data() as SiteSettings : null;
  },

  async saveSettings(settings: SiteSettings): Promise<void> {
    if (isPlaceholder) return;
    await setDoc(doc(db, 'settings', 'global'), settings);
  },

  // Comments management
  async getAllComments(): Promise<Comment[]> {
    if (isPlaceholder) return [];
    const q = query(collection(db, 'comments'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Comment));
  },

  async saveComment(comment: Comment): Promise<void> {
    if (isPlaceholder) return;
    await setDoc(doc(db, 'comments', comment.id), comment);
  },

  async deleteComment(id: string): Promise<void> {
    if (isPlaceholder) return;
    await deleteDoc(doc(db, 'comments', id));
  },

  async reportComment(commentId: string, userId: string): Promise<void> {
    if (isPlaceholder) return;
    const ref = doc(db, 'comments', commentId);
    await updateDoc(ref, {
      isReported: true,
      reportedBy: arrayUnion(userId)
    });
  },

  async likeComment(commentId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isPlaceholder) return;
    const ref = doc(db, 'comments', commentId);
    await updateDoc(ref, {
      likes: increment(isLiked ? 1 : -1),
      likedBy: isLiked ? arrayUnion(userId) : arrayRemove(userId)
    });
  },

  // Article Likes
  async likeArticle(articleId: string, userId: string, isLiked: boolean): Promise<void> {
    if (isPlaceholder) return;
    const ref = doc(db, 'articles', articleId);
    await updateDoc(ref, {
      likes: increment(isLiked ? 1 : -1)
    });
    // Also track in user profile
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      likedArticles: isLiked ? arrayUnion(articleId) : arrayRemove(articleId)
    }, { merge: true });
  },

  async bookmarkArticle(articleId: string, userId: string, isBookmarked: boolean): Promise<void> {
    if (isPlaceholder) return;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      bookmarkedArticles: isBookmarked ? arrayUnion(articleId) : arrayRemove(articleId)
    }, { merge: true });
  },

  async followAuthor(authorName: string, userId: string, isFollowing: boolean): Promise<void> {
    if (isPlaceholder) return;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      followedAuthors: isFollowing ? arrayUnion(authorName) : arrayRemove(authorName)
    }, { merge: true });
  },

  async followCategory(category: string, userId: string, isFollowing: boolean): Promise<void> {
    if (isPlaceholder) return;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      followedCategories: isFollowing ? arrayUnion(category) : arrayRemove(category)
    }, { merge: true });
  },

  // User Profile
  async getUserProfile(userId: string): Promise<any> {
    if (isPlaceholder) return null;
    try {
      const d = await getDoc(doc(db, 'users', userId));
      return d.exists() ? d.data() : null;
    } catch (e) {
      return handleFirestoreError(e, 'get', `users/${userId}`);
    }
  },

  async updateUserProfile(userId: string, data: any): Promise<void> {
    if (isPlaceholder) return;
    try {
      await setDoc(doc(db, 'users', userId), data, { merge: true });
    } catch (e) {
      handleFirestoreError(e, 'update', `users/${userId}`);
    }
  },

  // Classifieds (Petites Annonces)
  async getClassifieds(): Promise<any[]> {
    if (isPlaceholder) return [];
    const q = query(collection(db, 'classifieds'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async saveClassified(classified: any): Promise<void> {
    if (isPlaceholder) return;
    await setDoc(doc(db, 'classifieds', classified.id), classified);
  },

  async deleteClassified(id: string): Promise<void> {
    if (isPlaceholder) return;
    await deleteDoc(doc(db, 'classifieds', id));
  },

  // Live Blogs
  async getLiveBlogs(): Promise<any[]> {
    if (isPlaceholder) return [];
    const q = query(collection(db, 'live_blogs'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  },

  async saveLiveUpdate(blogId: string, update: any): Promise<void> {
    if (isPlaceholder) return;
    const ref = doc(db, 'live_blogs', blogId);
    await updateDoc(ref, {
      updates: arrayUnion(update)
    });
  },

  // Polls
  async getActivePoll(): Promise<Poll | null> {
    if (isPlaceholder) return null;
    const q = query(collection(db, 'polls'), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].data() as Poll;
  },

  async submitVote(pollId: string, optionId: string, userId: string): Promise<void> {
    if (isPlaceholder) return;
    const pollRef = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollRef);
    if (!pollSnap.exists()) return;

    const poll = pollSnap.data() as Poll;
    const newOptions = poll.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );

    await updateDoc(pollRef, { options: newOptions });
    
    // Mark user as voted
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      votedPolls: arrayUnion(pollId)
    }, { merge: true });
  },

  // Newsletter
  async subscribe(email: string): Promise<void> {
    if (isPlaceholder) {
      console.log("Newsletter: Simulation d'inscription locale pour", email);
      return;
    }
    const id = Date.now().toString();
    const sub: Subscriber = { id, email, date: new Date().toISOString() };
    await setDoc(doc(db, 'subscribers', id), sub);
  },

  async getSubscribers(): Promise<Subscriber[]> {
    if (isPlaceholder) return [];
    const q = query(collection(db, 'subscribers'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Subscriber);
  },

  // Media Library (Automatic tracking)
  async trackMedia(url: string, type: 'image' | 'video'): Promise<void> {
    if (isPlaceholder) return;
    const id = btoa(url).substring(0, 20); // Simple ID from URL
    const asset: MediaAsset = { id, url, type, date: new Date().toISOString() };
    await setDoc(doc(db, 'media', id), asset);
  },

  async getMediaLibrary(): Promise<MediaAsset[]> {
    if (isPlaceholder) return [];
    const q = query(collection(db, 'media'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MediaAsset);
  },

  // View Counter
  async incrementView(collectionName: 'articles' | 'events', id: string): Promise<void> {
    if (isPlaceholder) return;
    const ref = doc(db, collectionName, id);
    const d = await getDoc(ref);
    if (d.exists()) {
      await updateDoc(ref, { views: (d.data().views || 0) + 1 });
    }
  },

  // Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    if (isPlaceholder) return [];
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', 'in', [userId, 'global']),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppNotification));
    } catch (e) {
      return handleFirestoreError(e, 'list', 'notifications');
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isPlaceholder) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      handleFirestoreError(e, 'update', `notifications/${id}`);
    }
  },

  async sendNotification(notif: AppNotification): Promise<void> {
    if (isPlaceholder) return;
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (e) {
      handleFirestoreError(e, 'create', `notifications/${notif.id}`);
    }
  },

  subscribeToNotifications(userId: string, callback: (notifs: AppNotification[]) => void) {
    if (isPlaceholder) return () => {};
    const q = query(
      collection(db, 'notifications'), 
      where('userId', 'in', [userId, 'global']),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppNotification));
      callback(notifs);
    });
  }
};

// --- Auth Utilities ---
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Email:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    return result.user;
  } catch (error) {
    console.error("Error registering with Email:", error);
    throw error;
  }
};

export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': () => {}
  });
};

export const sendPhoneOtp = async (phoneNumber: string, appVerifier: any) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export const handleUserLogout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
// --- Error Handlers ---

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  if (error.code === 'permission-denied' || (error.message && error.message.includes('insufficient permissions'))) {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message || 'Missing or insufficient permissions',
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'N/A',
        emailVerified: user?.emailVerified || false,
        isAnonymous: !user,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || 'N/A',
          email: p.email || 'N/A'
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
