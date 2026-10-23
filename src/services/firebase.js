import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
/* CRITICAL: The app will break without firebaseConfig.firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const BOOTSTRAP_ADMIN_EMAIL = 'michelenico4@gmail.com';

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user) {
      const isInitialAdmin = user.email === BOOTSTRAP_ADMIN_EMAIL && user.emailVerified;
      const userRef = doc(db, 'users', user.uid);
      try {
        await setDoc(userRef, {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Utente',
          role: isInitialAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        }, { merge: true });

        if (isInitialAdmin) {
          const adminRef = doc(db, 'admins', user.uid);
          await setDoc(adminRef, {
            id: user.uid,
            email: user.email || '',
            addedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Could not auto-sync user document', err);
      }
    }
    return user;
  } catch (error) {
    console.error('Google Sign-in failed', error);
    throw error;
  }
}

export async function logoutUser() {
  return signOut(auth);
}

export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, false);
      return;
    }

    let isAdmin = user.email === BOOTSTRAP_ADMIN_EMAIL && user.emailVerified;
    if (!isAdmin) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          isAdmin = true;
        }
      } catch (err) {
        // Ignored if non-admin
      }
    }

    callback(user, isAdmin);
  });
}

// Fetch user role directly from Firestore database
export async function getUserRoleFromDb(uid) {
  if (!uid) return 'guest';
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      return 'admin';
    }
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists() && userDoc.data()?.role === 'admin') {
      return 'admin';
    }
    if (auth.currentUser?.email === BOOTSTRAP_ADMIN_EMAIL && auth.currentUser?.emailVerified) {
      return 'admin';
    }
    return 'user';
  } catch (err) {
    console.warn('Error reading role from Firestore:', err);
    if (auth.currentUser?.email === BOOTSTRAP_ADMIN_EMAIL && auth.currentUser?.emailVerified) {
      return 'admin';
    }
    return 'user';
  }
}

// AppConfig Management
export async function fetchAppConfig(key, fallback) {
  const path = `appConfig/${key}`;
  try {
    const snap = await getDoc(doc(db, 'appConfig', key));
    if (snap.exists() && snap.data()?.payload) {
      try {
        return JSON.parse(snap.data().payload);
      } catch {
        return fallback;
      }
    }
    return fallback;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return fallback;
  }
}

export async function saveAppConfig(key, data) {
  const path = `appConfig/${key}`;
  try {
    const payload = JSON.stringify(data);
    await setDoc(doc(db, 'appConfig', key), {
      id: key,
      payload,
      updatedBy: auth.currentUser?.uid || 'system',
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export function subscribeAppConfig(key, fallback, onUpdate) {
  const path = `appConfig/${key}`;
  return onSnapshot(doc(db, 'appConfig', key), (snap) => {
    if (snap.exists() && snap.data()?.payload) {
      try {
        onUpdate(JSON.parse(snap.data().payload));
      } catch {
        onUpdate(fallback);
      }
    } else {
      onUpdate(fallback);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

// Reservations
export async function createReservationInDb(reservation) {
  const path = `reservations/${reservation.id}`;
  try {
    await setDoc(doc(db, 'reservations', reservation.id), {
      id: reservation.id,
      userId: auth.currentUser?.uid || 'guest',
      name: reservation.name,
      phone: reservation.phone,
      email: reservation.email || '',
      date: reservation.date,
      slot: reservation.slot,
      guests: String(reservation.guests),
      notes: reservation.notes || '',
      status: reservation.status || 'confirmed',
      createdAt: reservation.createdAt || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

export async function updateReservationStatusInDb(reservationId, status) {
  const path = `reservations/${reservationId}`;
  try {
    await setDoc(doc(db, 'reservations', reservationId), { status }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

export async function deleteReservationFromDb(reservationId) {
  const path = `reservations/${reservationId}`;
  try {
    await deleteDoc(doc(db, 'reservations', reservationId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

export function subscribeReservations(callback, user, isAdmin) {
  const path = 'reservations';
  if (!user && !isAdmin) {
    callback([]);
    return () => {};
  }

  let q;
  if (isAdmin) {
    q = collection(db, 'reservations');
  } else {
    q = query(collection(db, 'reservations'), where('userId', '==', user.uid));
  }

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((docSnap) => docSnap.data());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Coupons
export async function saveCouponToDb(coupon) {
  const path = `coupons/${coupon.id}`;
  try {
    await setDoc(doc(db, 'coupons', coupon.id), {
      id: coupon.id,
      userId: auth.currentUser?.uid || 'guest',
      code: coupon.code,
      score: Number(coupon.score) || 0,
      reward: coupon.reward,
      status: coupon.status || 'active',
      createdAt: coupon.createdAt || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

export async function redeemCouponInDb(couponId) {
  const path = `coupons/${couponId}`;
  try {
    await setDoc(doc(db, 'coupons', couponId), { status: 'redeemed' }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

export function subscribeCoupons(callback, user, isAdmin) {
  const path = 'coupons';
  if (!user && !isAdmin) {
    callback([]);
    return () => {};
  }

  let q;
  if (isAdmin) {
    q = collection(db, 'coupons');
  } else {
    q = query(collection(db, 'coupons'), where('userId', '==', user.uid));
  }

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((docSnap) => docSnap.data());
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Notifications
export async function createNotificationInDb(notification) {
  const path = `notifications/${notification.id}`;
  try {
    await setDoc(doc(db, 'notifications', notification.id), {
      id: notification.id,
      type: notification.type || 'new_booking',
      title: notification.title,
      message: notification.message,
      reservationId: notification.reservationId || '',
      read: false,
      createdAt: notification.createdAt || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return false;
  }
}

export function subscribeNotifications(callback, isAdmin) {
  const path = 'notifications';
  if (!isAdmin) {
    callback([]);
    return () => {};
  }

  const q = collection(db, 'notifications');
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => d.data());
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export async function markNotificationReadInDb(notificationId) {
  const path = `notifications/${notificationId}`;
  try {
    await setDoc(doc(db, 'notifications', notificationId), { read: true }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

export async function deleteNotificationInDb(notificationId) {
  const path = `notifications/${notificationId}`;
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
}

