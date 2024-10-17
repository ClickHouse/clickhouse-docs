import { v4 as uuid } from 'uuid';
import { GalaxyClient } from '../client';
import { enableGalaxyLogging } from '../logging';



let client;
const MILLIS_PER_SECOND = 1000;
const BATCH_TIME_SECONDS = 5;


function init(options) {
  const { replaceConsoleLog, getUserId, getSessionId, ...clientOptions } = options;

  client = new GalaxyClient({
    ...clientOptions,
    getUserId: () => getUserId() ?? getAnonymousId(),
    getSessionId: () => (getSessionId ? getSessionId() : getGalaxySessionId()),
    getContext() {
      return {
        page: window.location.href,
        userAgent: navigator.userAgent,
        ...(options.getContext ? options.getContext() : {})
      };
    }
  });

  if (replaceConsoleLog) {
    enableGalaxyLogging(client);
  }

  const interval = setInterval(() => {
    client.flushEvents();
  }, BATCH_TIME_SECONDS * MILLIS_PER_SECOND);

  const stopGalaxy = () => {
    clearInterval(interval);
    client.cleanup();
  };

  window.addEventListener('beforeunload', stopGalaxy);
  window.addEventListener('window:unload', stopGalaxy);
  return [client, stopGalaxy];
}

function galaxy() {
  if (!client) {
    throw new Error('Please make sure you call "init" first');
  }

  return client;
}

const getGalaxySessionId = () => {
  try {
    if (!window.sessionStorage.getItem('glx_id')) {
      window.sessionStorage.setItem('glx_id', uuid());
    }

    return window.sessionStorage.getItem('glx_id') ?? 'unknown';
  } catch (error) {
    return 'unknown';
  }
};

const getAnonymousId = () => {
  try {
    if (!window.sessionStorage.getItem('glx_anonymous_id')) {
      window.sessionStorage.setItem('glx_anonymous_id', uuid());
    }

    return window.sessionStorage.getItem('glx_anonymous_id') ?? 'unknown';
  } catch (error) {
    return 'unknown';
  }
};

export const Galaxy = {
  init,
  galaxy,
  getAnonymousId,
  getGalaxySessionId
};
