import Pusher from 'pusher-js';

let pusherInstance = null;

export const initPusher = () => {
  if (pusherInstance) {
    return pusherInstance;
  }

  const pusherKey = import.meta.env.VITE_PUSHER_KEY;
  const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

  if (!pusherKey) {
    console.warn('Pusher key not configured');
    return null;
  }

  pusherInstance = new Pusher(pusherKey, {
    cluster: pusherCluster,
    encrypted: true,
  });

  return pusherInstance;
};

export const subscribeToUserChannel = (userId, callback) => {
  const pusher = initPusher();
  if (!pusher) return null;

  const channel = pusher.subscribe(`user.${userId}`);
  channel.bind('notification', callback);
  
  return channel;
};

export const unsubscribeFromUserChannel = (userId) => {
  const pusher = initPusher();
  if (!pusher) return;

  pusher.unsubscribe(`user.${userId}`);
};

export default pusherInstance;
