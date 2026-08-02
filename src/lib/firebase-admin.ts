import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const getAdminAuth = () => {
  if (!getApps().length) {
    initializeApp({
      projectId: firebaseConfig.projectId || 'demo-project',
    });
  }
  return getAuth();
};

export const getAdminDb = () => {
  if (!getApps().length) {
    initializeApp({
      projectId: firebaseConfig.projectId || 'demo-project',
    });
  }
  return getFirestore();
};
