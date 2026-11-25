import { Capacitor } from '@capacitor/core';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  signOut,
} from 'firebase/auth';

export const isCapacitorNative = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const isTauriDesktop = () => {
  return typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);
};

export const isNativePlatform = () => isCapacitorNative() || isTauriDesktop();

const getNativeGoogleCredential = async () => {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result?.credential?.idToken;
  const accessToken = result?.credential?.accessToken;
  if (!idToken && !accessToken) {
    throw new Error('Native Google Sign-In did not return a valid token.');
  }
  return GoogleAuthProvider.credential(idToken || null, accessToken || null);
};

export const signInWithGoogleCrossPlatform = async (auth, googleProvider) => {
  if (isCapacitorNative()) {
    const credential = await getNativeGoogleCredential();
    return signInWithCredential(auth, credential);
  }
  if (isTauriDesktop()) {
    const err = new Error('Google popup sign-in is blocked inside desktop WebViews. Please sign in with Email & Password.');
    err.code = 'auth/desktop-google-unsupported';
    throw err;
  }
  return signInWithPopup(auth, googleProvider);
};

export const reauthenticateGoogleCrossPlatform = async (currentUser, googleProvider) => {
  if (isCapacitorNative()) {
    const credential = await getNativeGoogleCredential();
    return reauthenticateWithCredential(currentUser, credential);
  }
  if (isTauriDesktop()) {
    const err = new Error('Please sign out and sign back in to confirm account deletion on Desktop.');
    err.code = 'auth/requires-recent-login';
    throw err;
  }
  return reauthenticateWithPopup(currentUser, googleProvider);
};

export const signOutCrossPlatform = async (auth) => {
  if (isCapacitorNative()) {
    try {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      await FirebaseAuthentication.signOut();
    } catch (err) {
      console.warn('Capacitor native signOut skipped:', err);
    }
  }
  if (auth?.currentUser) {
    await signOut(auth);
  }
};
