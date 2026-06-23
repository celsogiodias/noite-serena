import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

// Substitua pelas variáveis de ambiente do Expo (app.config.js ou .env)
const firebaseConfig = {
  apiKey: "AIzaSyBRqcHtP5pSdI8aSFvQScs9I48stqd4Ksk",
  authDomain: "noite-serena.firebaseapp.com",
  projectId: "noite-serena",
  storageBucket: "noite-serena.firebasestorage.app",
  messagingSenderId: "904962423360",
  appId: "1:904962423360:web:83f1c1a498914f20a8bda5"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function signInAnonymousUser() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Erro ao autenticar anonimamente:', error);
    throw new Error('Não foi possível iniciar sua sessão. Tente novamente mais tarde.');
  }
}

export async function saveCheckin(userId, data) {
  try {
    const checkinData = {
      userId,
      ...data,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'checkins'), checkinData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar checkin:', error);
    throw new Error('Não foi possível salvar seu check-in.');
  }
}

export async function saveSleepLog(userId, data) {
  try {
    const logData = {
      userId,
      ...data,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'sleepLogs'), logData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao salvar diário do sono:', error);
    throw new Error('Não foi possível salvar seu registro de sono.');
  }
}

export async function getSleepLogs(userId, days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const q = query(
      collection(db, 'sleepLogs'),
      where('userId', '==', userId),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      orderBy('date', 'desc'),
      limit(days)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar sleepLogs:', error);
    return [];
  }
}

export async function getCheckins(userId, days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const q = query(
      collection(db, 'checkins'),
      where('userId', '==', userId),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      orderBy('date', 'desc'),
      limit(days)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar checkins:', error);
    return [];
  }
}
