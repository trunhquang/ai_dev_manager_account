import { create } from 'zustand';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { OperationType, handleFirestoreError } from '../lib/firestore-utils';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'developer';
  displayName: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setLoading: (loading) => set({ loading }),
  initialize: () => {
    if (get().initialized) return;
    
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch profile
        try {
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (profileDoc.exists()) {
            set({ user, profile: profileDoc.data() as UserProfile, loading: false, initialized: true });
          } else {
            // First time login - create default profile
            // Bootstrap admin email
            const isAdmin = user.email === 'trunhquang@gmail.com';
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              role: isAdmin ? 'admin' : 'developer',
              displayName: user.displayName || 'Dev',
            };
            try {
              await setDoc(doc(db, 'users', user.uid), newProfile);
              set({ user, profile: newProfile, loading: false, initialized: true });
            } catch (createError) {
              handleFirestoreError(createError, OperationType.WRITE, `users/${user.uid}`);
              // Set profile even if creation failed in DB to allow app to function as fallback
              set({ user, profile: newProfile, loading: false, initialized: true });
            }
          }
        } catch (error) {
          console.error("Error fetching/creating profile:", error);
          try {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          } catch (e) {
            // Error was already logged by handleFirestoreError
          }
          // If we can't fetch profile, we might still be logged in as user, but without a profile
          // This happens if the user document is restricted but we are authenticated
          set({ user, profile: null, loading: false, initialized: true });
        }
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, profile: null });
  },
}));
