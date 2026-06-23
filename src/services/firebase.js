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
  apiKey: process.env.FIREBASE_API_KEY || 'FIREBASE_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'FIREBASE_AUTH_DOMAIN',
  projectId: process.env.FIREBASE_PROJECT_ID || 'FIREBASE_PROJECT_ID',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'FIREBASE_MESSAGING_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || 'FIREBASE_APP_ID',
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
