const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function registerPushNotifications() {
    console.log('Push: Starting registration process...');
    
    if (!window.isSecureContext) {
        console.error('Push: Not in a secure context (HTTPS required)');
        alert('Push notifications require a secure (HTTPS) connection to work on mobile.');
        return;
    }
    
    if (!('serviceWorker' in navigator)) {
        console.error('Push: Service Worker not supported in this browser');
        return;
    }
    if (!('PushManager' in window)) {
        console.error('Push: Push Manager not supported in this browser (iOS users must "Add to Home Screen")');
        alert('Push notifications require "Add to Home Screen" on iOS devices.');
        return;
    }

    try {
        console.log('Push: Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Push: Service worker registered successfully');

        // Check current permission
        let permission = Notification.permission;
        console.log('Push: Current permission state:', permission);

        if (permission === 'default') {
            console.log('Push: Requesting permission...');
            permission = await Notification.requestPermission();
            console.log('Push: Permission result:', permission);
        }

        if (permission !== 'granted') {
            console.warn('Push: Permission was not granted');
            return;
        }

        console.log('Push: Getting subscription...');
        let subscription = await registration.pushManager.getSubscription();
        console.log('Push: Existing subscription found:', !!subscription);

        if (!subscription) {
            console.log('Push: Creating new subscription with VAPID key...');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            console.log('Push: New subscription created');
        }

        console.log('Push: Syncing with backend...');
        const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: subscription.toJSON() })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Sync failed: ${errorData.error || response.statusText}`);
        }

        console.log('Push: Successfully synced with backend');
        return subscription;
    } catch (error) {
        console.error('Push: Registration failed error:', error);
        alert(`Notification setup failed: ${error.message}`);
    }
}
