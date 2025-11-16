import enConfig from "./docusaurus.config.en.js";
import jpConfig from "./docusaurus.config.jp.js";
import zhConfig from "./docusaurus.config.zh.js";
import ruConfig from "./docusaurus.config.ru.js";
import koConfig from "./docusaurus.config.ko.js";

const env = process.env.DOCUSUARUS_LOCALE || "en"; // Default to "en"

const configMap = {
  en: enConfig,
  jp: jpConfig,
  zh: zhConfig,
  ru: ruConfig,
  ko: koConfig
};

// Export the selected config, defaulting to English if the environment variable is invalid
export default configMap[env] || enConfig;
