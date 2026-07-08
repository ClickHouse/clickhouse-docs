# Установите ClickHouse с помощью ClickHouse CLI \{#install-clickhouse-using-the-clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) помогает устанавливать локальные версии ClickHouse и управлять ими, запускать серверы и выполнять запросы.

<VerticalStepper>
  ## Установите ClickHouse CLI \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  Для удобства также автоматически создается алиас `chctl`.

  ## Установите ClickHouse \{#cli-install-clickhouse\}

  Установите последнюю стабильную версию ClickHouse и сделайте ее версией по умолчанию:

  ```bash
  clickhousectl local use stable
  ```

  `local use` устанавливает версию, если она еще не установлена, делает ее версией
  по умолчанию и создает символьную ссылку `clickhouse` в `~/.local/bin` (в вашем `PATH`),
  чтобы вы могли запускать бинарный файл `clickhouse` напрямую. Поэтому любые последующие шаги
  в этой документации, где используется команда `clickhouse`, будут работать без изменений.

  Вы также можете выбрать определенную версию:

  ```bash
  clickhousectl local use lts             # Последний выпуск LTS
  clickhousectl local use 25.6            # Последняя версия 25.6.x.x
  clickhousectl local use 25.6.1.1        # Точная версия
  ```

  :::note[Использование и установка]
  `clickhousectl local use <version>` устанавливает версию *и* делает ее версией
  по умолчанию, обновляя символьную ссылку `clickhouse` в вашем `PATH`. Чтобы скачать версию
  без изменения версии по умолчанию или обновления символьной ссылки, используйте
  `clickhousectl local install <version>`.
  :::

  ## Запустите clickhouse-server \{#cli-start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  Сервер работает в фоновом режиме. Чтобы убедиться, что он запущен, выполните:

  ```bash
  clickhousectl local server list
  ```

  ## Запустите clickhouse-client \{#cli-start-clickhouse-client\}

  ```bash
  clickhousectl local client
  ```

  Вы увидите примерно следующее:

  ```response
  ClickHouse client version 24.5.1.117 (official build).
  Connecting to localhost:9000 as user default.
  Connected to ClickHouse server version 24.5.1.

  local-host :)
  ```

  Теперь все готово для отправки SQL-команд в ClickHouse!

  :::tip
  Руководство [Quick Start](/get-started/quick-start) содержит пошаговые инструкции по созданию таблиц и вставке данных.
  :::
</VerticalStepper>