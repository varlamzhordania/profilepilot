import { initializeApp, getApps, getApp, applicationDefault } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

const initAdmin = () => {
    if (!process.env.FIRESTORE_DATABASE_ID) {
        throw new Error(
            '[Firebase Admin] Missing FIRESTORE_DATABASE_ID in environment variables.'
        );
    }

    if (!process.env.GOOGLE_CLOUD_PROJECT && !firebaseConfig.projectId) {
        throw new Error(
            '[Firebase Admin] Missing Firebase project ID.'
        );
    }

    if (!getApps().length) {
        initializeApp({
            credential: applicationDefault(),
            projectId: process.env.GOOGLE_CLOUD_PROJECT || firebaseConfig.projectId,
        });
    }

    const app = getApp();

    console.log('[Firebase Admin] Project:', app.options.projectId);
    console.log('[Firebase Admin] Firestore Database:', process.env.FIRESTORE_DATABASE_ID);

    adminDb = getFirestore(process.env.FIRESTORE_DATABASE_ID);

    adminDb.settings({
        ignoreUndefinedProperties: true,
    });

    adminAuth = getAuth();

    return {
        db: adminDb,
        auth: adminAuth,
    };
};

export const getAdminDb = (): Firestore => {
    if (!adminDb) {
        initAdmin();
    }

    return adminDb!;
};

export const getAdminAuth = (): Auth => {
    if (!adminAuth) {
        initAdmin();
    }

    return adminAuth!;
};