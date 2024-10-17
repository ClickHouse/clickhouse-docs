const logLevels = ['info', 'log', 'warn', 'debug', 'error'];

export let logFns = {
  info: console.info,
  log: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug
};

/**
 * Enqueues message in Galaxy service.
 * Warning:
 *  The method can't be async in order to stay safe to be called in different environments.
 *  Example:
 *   1. console.log() is triggered and logToGalaxy() is called.
 *   2. Promise.then() inside this method triggers a microtask (https://javascript.plainenglish.io/angular-zone-js-3b5e2347b7).
 *   3 A microtask triggers change detection in Angular (via zone-js).
 *   4. Change detection is our code and can trigger errors or logging.
 *   5. Some console.log() method will be called.
 *   6. goto 1.
 *
 */

export function enableGalaxyLogging(client) {
  logFns = {
    info: console.info,
    log: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug
  };

  const wrap = (level) => {
    console[level] = function (...args) {
      const originalFn = logFns[level];
      originalFn.apply(console, args);

      try {
        client.log(level.toUpperCase(), ...args);
      } catch (error) {
        logFns.error('Could not log to galaxy', args);
      }
    };
  };

  logLevels.forEach(wrap);
}
