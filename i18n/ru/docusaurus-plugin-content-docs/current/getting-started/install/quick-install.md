---
description: 'Быстрая установка ClickHouse с помощью ClickHouse CLI'
keywords: ['ClickHouse', 'install', 'quick', 'clickhousectl', 'CLI']
sidebar_label: 'Быстрая установка'
slug: /install/quick-install
title: 'Быстрая установка'
hide_title: true
doc_type: 'guide'
---

Если вам не нужно устанавливать ClickHouse для продакшена, быстрее всего начать работу с помощью ClickHouse CLI (`clickhousectl`), который помогает устанавливать локальные версии ClickHouse и управлять ими, запускать серверы, выполнять запросы и управлять ClickHouse Cloud.

:::note Пользователям Windows
ClickHouse работает нативно на Linux и macOS. В Windows выполняйте эти шаги внутри [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about).
:::

<VerticalStepper>
  ## Установите ClickHouse CLI \{#install-the-cli\}

  ```bash
  curl https://clickhouse.com/cli | sh
  ```

  Для удобства также автоматически создается псевдоним `chctl`.

  ## Установите ClickHouse \{#install-clickhouse\}

  Установите последнюю стабильную версию ClickHouse и сделайте ее версией по умолчанию:

  ```bash
  clickhousectl local use stable
  ```

  `local use` устанавливает версию, если она еще не установлена, делает ее вашей версией по умолчанию и создает символическую ссылку `clickhouse` в `~/.local/bin` (в вашем `PATH`), чтобы вы могли напрямую запускать бинарный файл `clickhouse`. После этого любой последующий шаг в этой документации, где запускается команда `clickhouse`, будет работать как есть.

  :::note[Use vs install]
  `clickhousectl local use <version>` устанавливает версию *и* делает ее вашей версией по умолчанию, обновляя символическую ссылку `clickhouse` в вашем `PATH`. Чтобы скачать версию без изменения версии по умолчанию и без обновления символической ссылки, используйте вместо этого
  `clickhousectl local install <version>`.
  :::

  ## Запустите clickhouse-server \{#start-clickhouse-server\}

  ```bash
  clickhousectl local server start
  ```

  Сервер работает в фоновом режиме. Чтобы убедиться, что он запущен, выполните:

  ```bash
  clickhousectl local server list
  ```

  ## Запустите clickhouse-client \{#start-clickhouse-client\}

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

  Теперь можно начинать отправлять SQL-команды в ClickHouse!

  :::tip
  Руководство [Быстрый старт](/get-started/quick-start) пошагово покажет, как создавать таблицы и вставлять данные.
  :::
</VerticalStepper>