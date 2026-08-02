/**
 * Web Push Notification Utility for ProfilePilot AI
 * Alerts users when AI Photo Studio results are ready or when Dating Coach sends a reply.
 */

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

/**
 * Register Service Worker if supported
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('[ProfilePilot Notifications] Service Worker registered:', reg.scope);
    return reg;
  } catch (err) {
    console.warn('[ProfilePilot Notifications] SW registration failed:', err);
    return null;
  }
};

/**
 * Request Browser Notification Permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[ProfilePilot Notifications] Web Notifications not supported in this browser environment.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.error('[ProfilePilot Notifications] Permission request error:', err);
    return 'denied';
  }
};

/**
 * Check current notification status
 */
export const getNotificationPermissionState = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Dispatch Web Push Notification locally and log to server
 */
export const dispatchWebNotification = async (payload: PushNotificationPayload) => {
  const { title, body, icon = '/pwa-192x192.svg', url = '/photos', tag = 'profilepilot-alert' } = payload;

  console.log(`[ProfilePilot Notification Triggered] "${title}": ${body}`);

  // 1. Send push trigger to backend for logging & push dispatch
  try {
    fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url, tag }),
    }).catch((e) => console.warn('Server push dispatch notice:', e));
  } catch (e) {
    console.warn(e);
  }

  // 2. Trigger native Web Notification if permission granted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            icon,
            badge: '/pwa-192x192.svg',
            tag,
            data: { url },
            vibrate: [150, 50, 150, 50, 200],
          } as any);
          return;
        }
      }

      // Fallback to standard Window Notification constructor
      new Notification(title, {
        body,
        icon,
        tag,
        data: { url },
      });
    } catch (err) {
      console.warn('[ProfilePilot Notifications] Display notification error:', err);
    }
  }
};

/**
 * Trigger Photo Studio Result Ready Notification
 */
export const notifyPhotoStudioReady = async (photoPromptTitle?: string) => {
  const title = '📸 AI Photo Studio Result Ready!';
  const body = photoPromptTitle
    ? `Your high-converting "${photoPromptTitle}" dating portrait has been synthesized! Tap to view and download.`
    : 'Your high-converting AI dating portrait has been generated! Tap to view and download.';

  await dispatchWebNotification({
    title,
    body,
    url: '/photos',
    tag: 'photo-studio-result',
  });
};

/**
 * Trigger AI Dating Coach Message Notification
 */
export const notifyCoachMessage = async (messageText: string) => {
  const snippet = messageText.length > 85 ? `${messageText.substring(0, 85)}...` : messageText;
  const title = '💬 New Reply from AI Dating Coach';
  const body = `Wingman Coach: "${snippet}"`;

  await dispatchWebNotification({
    title,
    body,
    url: '/chat',
    tag: 'coach-message',
  });
};
