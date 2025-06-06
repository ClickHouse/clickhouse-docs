import { useEffect } from "react";
import { Galaxy } from "./web/browser";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export const useInitGalaxy = () => {
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    const galaxyOptions = {
      httpClient: {
        post: async (url, requestBody) => {
          return fetch(url, {
            method: "POST",
            body: JSON.stringify(requestBody),
          });
        },
      },
      errorHandler: {
        captureException(exception) {
          console.error(exception);
        },
      },
      replaceConsoleLog: false,
      application: "DOCS_WEBSITE",
      apiHost: siteConfig.customFields.galaxyApiEndpoint,
      getUserId: () => null,
    };

    const [galaxy, stopGalaxy] = Galaxy.init(galaxyOptions);
    window.galaxy = galaxy;

    return () => {
      void stopGalaxy();
    };
  }, []);
};

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
