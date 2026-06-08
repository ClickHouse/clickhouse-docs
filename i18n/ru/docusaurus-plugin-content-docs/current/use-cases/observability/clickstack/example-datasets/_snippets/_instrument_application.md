import Image from '@theme/IdealImage';
import hackernews_main from '@site/static/images/clickstack/getting-started/hackernews_main.png';
import instrument_app_clickstack_logs from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_logs.png';
import instrument_app_clickstack_traces from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_traces.png';
import instrument_app_clickstack_sessions from '@site/static/images/clickstack/getting-started/instrument_app_clickstack_sessions.png';

<VerticalStepper headerLevel="h2">
  ## Клонирование и запуск приложения \{#clone-and-run-the-application\}

  Клонируйте репозиторий, установите зависимости и создайте файл `.env`:

  ```bash
  git clone https://github.com/ClickHouse/hn-news-analyzer.git
  cd hn-news-analyzer
  npm install
  cp .env.example .env
  ```

  По умолчанию источник данных ClickHouse указывает на публичный демонстрационный кластер только для чтения, поэтому приложение запускается без какой-либо дополнительной настройки. Запустите его:

  ```bash
  ./run.sh
  ```

  Откройте [http://localhost:5001](http://localhost:5001). Вы увидите селектор года, сводную статистику, график активности, таблицы топ-пользователей и доменов, а также строку поиска. Изучите интерфейс: переключайте годы, углубляйтесь в материалы.

  <Image img={hackernews_main} alt="Локально запущенное приложение HackerNews Analyzer" />

  На данном этапе приложение запущено, но не инструментировано. ClickStack не отображает данных: он ожидает поступления телеметрии. Это состояние &quot;до&quot;.

  ## Получение сведений о подключении \{#get-connection-details\}

  Приложению требуются два значения для подключения к коллектору:

  * `OTEL_EXPORTER_OTLP_ENDPOINT`: конечная точка OTLP, которую открывает ваш коллектор (обычно порт `4318` для OTLP по HTTP).
  * `OTEL_EXPORTER_OTLP_HEADERS`: заголовок авторизации, содержащий ваш токен для ингестии, в формате `authorization=<token>`.

  Откройте `.env` и укажите их:

  ```bash
  OTEL_SERVICE_NAME=hn-analyzer-api
  OTEL_EXPORTER_OTLP_ENDPOINT=https://<your-collector-endpoint>:4318
  OTEL_EXPORTER_OTLP_HEADERS=authorization=<your-ingestion-token>
  ```

  SDK использует `OTEL_EXPORTER_OTLP_HEADERS` для задания заголовка авторизации для всех трёх типов сигналов: трассировок, метрик и журналов. Если collector работает локально и не требует аутентификации, значение можно оставить пустым (`OTEL_EXPORTER_OTLP_HEADERS=authorization=`), однако переменная должна присутствовать — SDK полностью пропускает инициализацию, если она не задана или полностью пуста.

  ## Инструментирование приложения \{#instrument-the-application\}

  Инструментирование включает три шага: установка SDKs, изменение команды запуска и подключение браузерного SDK. Ни один из них не затрагивает бизнес-логику приложения.

  ### Установка SDK \{#install-sdks\}

  Установите OpenTelemetry SDKs для серверной части и браузера:

  ```bash
  npm install @hyperdx/node-opentelemetry @hyperdx/browser
  ```

  ### Использование CLI opentelemetry-instrument \{#use-open-telemetry-cli\}

  Приложение запускается через `run.sh`, в конце которого есть две строки `exec`: одна активная, другая закомментированная. Поменяйте их местами, чтобы Node запускался через `opentelemetry-instrument`:

  ```diff
   # BEFORE: plain node, no instrumentation, collector stays silent:
  -exec node scripts/entrypoint.js
  +# exec node scripts/entrypoint.js

   # AFTER: same source, wrapped by opentelemetry-instrument CLI.
  -# exec npx opentelemetry-instrument scripts/entrypoint.js
  +exec npx opentelemetry-instrument scripts/entrypoint.js
  ```

  На этом все изменения на стороне сервера завершены. Автоматическая инструментация загружается с помощью `opentelemetry-instrument` при запуске процесса.

  ### Включение браузерного SDK \{#enable-browser-sdk\}

  Чтобы собирать распределённые трассировки (от браузера до бэкенда) и воспроизведения сеансов, включите браузерный SDK в файле `src/web/telemetry.ts`. Раскомментируйте импорт и блок `HyperDX.init({...})`:

  ```javascript
  import HyperDX from '@hyperdx/browser';

  export function initTelemetry(): void {
    HyperDX.init({
      url: __OTLP_ENDPOINT__,
      apiKey: __OTLP_AUTH_TOKEN__,
      service: 'hn-analyzer-web',
      tracePropagationTargets: [/localhost:5001/i, /\/api\//i],
      consoleCapture: true,
      advancedNetworkCapture: true,
    });
  }
  ```

  Дополнительные правки в `.env` не требуются. `__OTLP_ENDPOINT__` и `__OTLP_AUTH_TOKEN__` — это константы времени компиляции, внедряемые через `vite.config.ts`: конечная точка берётся из `OTEL_EXPORTER_OTLP_ENDPOINT`, а токен извлекается из `OTEL_EXPORTER_OTLP_HEADERS` — те же значения, что использует backend-соединение.

  :::warning
  Токен ингестии встроен в публичный браузерный бандл и доступен для чтения любому, кто просматривает вкладку Network.
  :::

  ## Генерация трафика и просмотр телеметрии \{#generate-traffic-and-view-telemetry\}

  Перезапустите приложение, чтобы новая команда запуска и только что собранный браузерный пакет вступили в силу:

  ```bash
  # Ctrl-C the previous run, then:
  ./run.sh
  ```

  Перезагрузите вкладку браузера, чтобы Vite отдал обновлённый бандл, затем несколько раз обновите приложение, переключите годы и откройте несколько историй, чтобы сгенерировать трафик.

  Откройте интерфейс ClickStack:

  1. Перейдите в раздел **Поиск** и установите фильтр на последние 5 минут. Журналы для `hn-analyzer-api` начнут поступать.

  <Image img={instrument_app_clickstack_logs} alt="Журналы ClickStack" />

  2. Откройте запрос и поднимитесь вверх по трейсу. Вы увидите спан обработчика Express, дочерний HTTP-спан, указывающий на кластер ClickHouse с фактической длительностью сетевого запроса, и скоррелированные записи `console.log` в том же трейсе.

  <Image img={instrument_app_clickstack_traces} alt="Трейсы ClickStack" />

  3. Откройте **Воспроизведение сеанса**, чтобы просмотреть видео браузерного сеанса с перемоткой, синхронизированное с таймлайном трейса.

  <Image img={instrument_app_clickstack_sessions} alt="Сеансы в ClickStack" />

  Журналы, метрики, трассировки и воспроизведение сеансов — всё это собрано в едином интерфейсе, использует единый язык запросов и коррелируется автоматически.
</VerticalStepper>