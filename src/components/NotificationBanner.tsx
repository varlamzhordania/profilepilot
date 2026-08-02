import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, Sparkles, Check, X } from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionState, dispatchWebNotification } from '../lib/notifications';

interface NotificationBannerProps {
  isLightMode?: boolean;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ isLightMode = false }) => {
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  useEffect(() => {
    const state = getNotificationPermissionState();
    setPermissionState(state);
    if (state === 'default') {
      setShowPrompt(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsActivating(true);
    const result = await requestNotificationPermission();
    setPermissionState(result);
    setIsActivating(false);

    if (result === 'granted') {
      // Send a welcome test notification
      dispatchWebNotification({
        title: '🔔 Notifications Active on ProfilePilot AI!',
        body: 'You will now receive instant push alerts when AI Photo Studio results are ready or when your AI Coach replies.',
        url: '/photos',
        tag: 'welcome-push',
      });
      setTimeout(() => setShowPrompt(false), 2000);
    }
  };

  const handleTestAlert = () => {
    dispatchWebNotification({
      title: '📸 AI Photo Studio Test Alert',
      body: 'Your AI Photo Studio generation is ready to view and download!',
      url: '/photos',
      tag: 'test-photo-studio',
    });
  };

  if (permissionState === 'unsupported' || permissionState === 'denied') {
    return null;
  }

  return (
    <div className="w-full">
      {/* 1. Floating Banner Prompt when permission is 'default' */}
      {showPrompt && permissionState === 'default' && (
        <div className={`p-3.5 mb-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg transition-all animate-fadeIn ${
          isLightMode 
            ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-rose-200 text-slate-800' 
            : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-purple-950/80 border-rose-800/60 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-500 shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs sm:text-sm">Enable Web Push Notifications</h4>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300">
                  Real-time Alerts
                </span>
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                Get alerted instantly when your <strong>AI Photo Studio</strong> portraits finish synthesizing or when your <strong>Dating Coach</strong> sends a reply!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEnableNotifications}
              disabled={isActivating}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold text-xs shadow-md hover:shadow-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isActivating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Enable Push Alerts</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              title="Dismiss for now"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Notification Active Status Chip */}
      {permissionState === 'granted' && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 text-emerald-500" />
            <span>Web Push Alerts Active: You will receive instant notifications for AI Photo Studio & Coach Chat</span>
          </div>
          <button
            onClick={handleTestAlert}
            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 hover:underline cursor-pointer"
          >
            Send Test Alert 🚀
          </button>
        </div>
      )}
    </div>
  );
};
