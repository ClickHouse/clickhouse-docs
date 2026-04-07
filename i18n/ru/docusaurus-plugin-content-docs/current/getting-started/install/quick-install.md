---
description: 'Быстро установите ClickHouse через CLI или curl'
keywords: ['ClickHouse', 'установка', 'быстро', 'curl', 'clickhousectl', 'CLI']
sidebar_label: 'Быстрая установка'
slug: /install/quick-install
title: 'Быстрая установка'
hide_title: true
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import QuickInstall from './_snippets/_quick_install.md'

# Быстрая установка \{#quick-install\}

Если вам не нужно устанавливать ClickHouse для продакшена, быстрее всего начать работу с помощью ClickHouse CLI или установочного скрипта, запускаемого через curl.

<Tabs>
  <TabItem value="cli" label="ClickHouse CLI" default>
    ClickHouse CLI (`clickhousectl`) помогает устанавливать локальные версии ClickHouse и управлять ими, запускать серверы и выполнять запросы.

    <VerticalStepper>
      ## Установите ClickHouse CLI \{#install-the-cli\}

      ```bash
      curl https://clickhouse.com/cli | sh
      ```

      Для удобства также автоматически создается псевдоним `chctl`.

      ## Установите ClickHouse \{#install-clickhouse\}

      ```bash
      clickhousectl local install stable
      ```

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
  </TabItem>

  <TabItem value="curl" label="Скрипт Curl">
    <QuickInstall />
  </TabItem>
</Tabs>