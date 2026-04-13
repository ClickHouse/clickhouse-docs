# Установите ClickHouse с помощью ClickHouse CLI \{#install-clickhouse-using-the-clickhouse-cli\}

ClickHouse CLI (`clickhousectl`) помогает устанавливать локальные версии ClickHouse и управлять ими, запускать серверы и выполнять запросы.

<VerticalStepper>
  ## Установите ClickHouse CLI \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  Для удобства также автоматически создается алиас `chctl`.

  ## Установите ClickHouse \{#cli-install-clickhouse\}

  Установите последнюю стабильную версию ClickHouse:

  ```bash
  clickhousectl local install stable
  ```

  Вы также можете установить определенную версию:

  ```bash
  clickhousectl local install lts             # Последний выпуск LTS
  clickhousectl local install 25.6            # Последняя версия 25.6.x.x
  clickhousectl local install 25.6.1.1        # Точная версия
  ```

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