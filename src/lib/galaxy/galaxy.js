import { useEffect } from "react";
import { Galaxy } from "./web/browser";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { getBrowserCookie, setBrowserCookie } from "../../utils/cookies";
import { v4 as uuid } from "uuid";

// Find or create a UUID from cookies, local and session storage for backwards compatability
function findOrCreateGalaxyId(key) {
  const read = () => {
    try {
      return (
        getBrowserCookie(key) ??
        window.localStorage.getItem(key) ??
        window.sessionStorage.getItem(key)
      )
    } catch (error) {
      console.error(error)
    }
  }

  const persist = (value) => {
    try {
      setBrowserCookie(key, value, {
        maxAge: 2147483647 // (68 years) the largest value supported
      })
      window.localStorage.setItem(key, value)
      window.sessionStorage.setItem(key, value)
    } catch (error) {
      console.log(error)
    }
  }

  const id = read() ?? uuid()
  persist(id)
  return id
}

export function getUserId() {
  // Use the cookie/storage name `glx_anonymous_id` for backwards compatibility
  return findOrCreateGalaxyId('glx_anonymous_id')
}

export const useInitGalaxy = () => {
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    const galaxyOptions = {
      getUserId,
      httpClient: {
        post: async (
          url,
          requestBody
        ) => {
          // Conservative safety margin
          // Beacon and keepalive are limited to payload size
          const LIMIT_BYTES = 60 * 1024

          const json = JSON.stringify(requestBody)
          const blob = new Blob([json], {
            type: 'application/json;charset=UTF-8'
          })

          // If payload too large for beacon/keepalive, use normal fetch (no keepalive)
          const tooLarge = blob.size > LIMIT_BYTES

          // Try beacon first (only if small enough)
          if (
            !tooLarge &&
            typeof navigator !== 'undefined' &&
            'sendBeacon' in navigator
          ) {
            try {
              const sent = navigator.sendBeacon(url, blob)
              if (sent) {
                const synthetic = new Response(null, {
                  status: 202,
                  statusText: 'Queued via beacon'
                })
                synthetic._transport = 'beacon'
                synthetic._queued = true // queued, not guaranteed delivered
                return synthetic
              }
              // Fall through to fetch if the UA refused to queue it
              // console.debug('[analytics] beacon refused; falling back')
            } catch {
              // Swallow and fall back to fetch
            }
          }

          // Fallback to fetch
          // - keepalive for small payloads (may complete during navigation)
          // - normal fetch for large payloads (avoid keepalive body limit)
          const useKeepalive = !tooLarge
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: json,
            keepalive: useKeepalive
          })

          res._transport = 'fetch'
          return res
        }
      },
      errorHandler: {
        captureException(exception) {
          console.error(exception);
        },
      },
      replaceConsoleLog: false,
      application: "DOCS_WEBSITE",
      apiHost: siteConfig.customFields.galaxyApiEndpoint,
    };

    const [galaxy, stopGalaxy] = Galaxy.init(galaxyOptions);
    window.galaxy = galaxy;

    return () => {
      void stopGalaxy();
    };
  }, []);
};

/**
 * Instrument galaxy onLoad event for this page. Should be used on page components.
 *
 * @param event name of the load event sent to galaxy
 */
export const galaxyOnLoad = (event) => {
    window.galaxy.track(event, { interaction: 'trigger' })
}

/**
 * Instrument galaxy onFocus event for this page. Should be used on page components.
 *
 * @param event name of the focus event sent to galaxy
 * @param depsArray used to trigger a rerender of the component that will re-run the useEffect
 */
export const galaxyOnFocus = (event, depsArray) => {
  const listener = () => {
    window.galaxy.track(event, { interaction: "trigger" });
  };

  useEffect(() => {
    window.addEventListener("focus", listener);
    return () => {
      window.removeEventListener("focus", listener);
    };
  }, depsArray);
};

/**
 * Instrument galaxy onBlur event for this page. Should be used on page components.
 *
 * @param event name of the blur events sent to galaxy
 * @param depsArray used to trigger a rerender of the component that will re-run the useEffect
 */
export const galaxyOnBlur = (event, depsArray) => {
  const listener = () => {
    window.galaxy.track(event, { interaction: "trigger" });
  };

  useEffect(() => {
    window.addEventListener("blur", listener);
    return () => {
      window.removeEventListener("blur", listener);
    };
  }, depsArray);
};

/**
 * Instrument galaxy for this page for load, blur and focus events.
 *
 * @param prefix used to name the events sent to galaxy (`${prefix}.window.load`, `${prefix}.window.blur` and `${prefix}.window.focus`)
 * @param depsArray used to trigger a rerender of the component that will re-run the useEffect
 *
 */
export const galaxyOnPage = (prefix, depsArray = []) => {
  galaxyOnLoad(`${prefix}.window.load`);
  galaxyOnBlur(`${prefix}.window.blur`, depsArray);
  galaxyOnFocus(`${prefix}.window.focus`, depsArray);
};

// Pass String with convention 'namespace.component.eventName'
export const galaxyOnClick = (event) => {
  return () => {
    window.galaxy.track(event, { interaction: "click" });
  };
};
