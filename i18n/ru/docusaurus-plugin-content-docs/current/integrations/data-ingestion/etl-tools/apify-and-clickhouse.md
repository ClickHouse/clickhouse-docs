---
sidebar_label: 'Apify'
keywords: ['apify', 'веб-скрейпинг', 'ингестия данных', 'акторы', 'наборы данных', 'автоматизация', 'вебхуки']
slug: /integrations/apify
description: 'Загрузка данных веб-скрейпинга и автоматизации из Apify в ClickHouse'
title: 'Подключение Apify к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://apify.com/'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Подключите Apify к ClickHouse \{#connect-apify-to-clickhouse\}

<CommunityMaintainedBadge />

[Apify](https://apify.com/) — платформа для веб-скрапинга и автоматизации. В ней можно создавать, запускать и масштабировать бессерверные облачные программы — [**Actors**](https://docs.apify.com/platform/actors). Actors собирают данные с сайтов, сканируют веб, обрабатывают данные и автоматизируют рабочие процессы. Каждый запуск Actor создает структурированный результат, который сохраняется в [**Datasets**](https://docs.apify.com/platform/storage/dataset) (коллекциях JSON-объектов).

Загружайте собранные или обработанные данные в ClickHouse для анализа, мониторинга или обогащения данных.

## Ключевые понятия \{#key-concepts\}

| Понятие в Apify                                                      | Что это                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Actor](https://docs.apify.com/platform/actors)**                  | Бессерверная облачная программа, которая запускается на платформе Apify. В [Apify Store](https://apify.com/store) доступны тысячи готовых Actor.                                                              |
| **[Dataset](https://docs.apify.com/platform/storage/dataset)**       | Результат запуска Actor. Табличная коллекция JSON-объектов, доступная в форматах JSON, CSV, XML и других через [Apify API](https://docs.apify.com/api/v2).                                                    |
| **[Webhook](https://docs.apify.com/platform/integrations/webhooks)** | HTTP-вызов, запускаемый по событию, например при успешном завершении Actor, ошибке или наступлении других событий жизненного цикла. Используйте вебхуки, чтобы автоматизировать конвейер Apify-to-ClickHouse. |

## Руководство по настройке \{#setup-guide\}

<VerticalStepper headerLevel="h3">
  ### Подготовьте данные для подключения к ClickHouse \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ### Предварительные требования для Apify \{#2-apify-prerequisites\}

  Также вам понадобятся:

  * [Аккаунт Apify](https://console.apify.com/sign-up) (доступен бесплатный тариф).
  * [Токен API Apify](https://docs.apify.com/platform/integrations/api#api-token), который можно найти в **Settings &gt; Integrations** в [консоли Apify](https://console.apify.com/).
  * Установленный локально Node.js 18+ (для примеров на JavaScript).

  ### Установите зависимости \{#3-install-dependencies\}

  Установите JavaScript-клиент Apify и JavaScript-клиент ClickHouse:

  ```bash
  npm install apify-client @clickhouse/client
  ```

  :::note
  Apify также предоставляет [клиент Python](https://docs.apify.com/api/client/python). Если вы предпочитаете Python, установите `apify-client` через pip и используйте [clickhouse-connect](/integrations/python) для ClickHouse.
  :::

  ### Создайте целевую таблицу в ClickHouse \{#4-create-a-target-table\}

  Создайте таблицу для хранения собранных данных. schema зависит от используемого Actor. В этом примере для Actor, собирающего данные о товарах, используется [MergeTree](/engines/table-engines/mergetree-family/mergetree.md):

  ```sql
  CREATE TABLE apify_products
  (
      url        String,
      title      String,
      price      Float64,
      currency   String,
      scraped_at DateTime DEFAULT now()
  )
  ENGINE = MergeTree()
  ORDER BY (scraped_at, url);
  ```

  ### Получите dataset Apify и загрузите его в ClickHouse \{#5-fetch-and-load\}

  Следующий скрипт получает результаты выполнения Actor в Apify и вставляет их в ClickHouse:

  ```javascript
  import { ApifyClient } from 'apify-client';
  import { createClient } from '@clickhouse/client';

  // Инициализация клиентов
  const apify = new ApifyClient({ token: 'YOUR_APIFY_API_TOKEN' });
  const clickhouse = createClient({
      url: 'https://YOUR_CLICKHOUSE_HOST:8443',
      username: 'default',
      password: 'YOUR_CLICKHOUSE_PASSWORD',
      database: 'default',
  });

  // Получение элементов dataset из последнего запуска Actor
  const run = await apify.actor('YOUR_ACTOR_ID').call();
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  console.log(`Fetched ${items.length} items from Apify dataset.`);

  // Вставка в ClickHouse
  await clickhouse.insert({
      table: 'apify_products',
      values: items,
      format: 'JSONEachRow',
  });

  console.log(`Inserted ${items.length} rows into ClickHouse.`);
  await clickhouse.close();
  ```

  :::tip
  Для больших наборов данных используйте постраничную загрузку результатов с помощью параметров `limit` и `offset` конечной точки [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items). Также можно передать `clean=true`, чтобы получать только непустые элементы без дубликатов.
  :::

  ### Автоматизируйте процесс с помощью вебхуков \{#6-automate-with-webhooks\}

  Вместо ручного запуска скрипта автоматизируйте пайплайн, чтобы данные загружались в ClickHouse каждый раз после завершения Actor:

  1. В [консоли Apify](https://console.apify.com/) перейдите к нужному Actor и откройте вкладку **Integrations**.
  2. Добавьте новый вебхук со следующими параметрами:
     * **Тип события:** `ACTOR.RUN.SUCCEEDED`
     * **Действие:** HTTP POST в вашу конечную точку загрузчика или запуск другого Actor, который выполняет вставку в ClickHouse.
  3. Полезная нагрузка вебхука включает `defaultDatasetId`, который можно использовать для получения результатов запуска.

  Подробнее о полезной нагрузке и доступных настройках см. в [документации по вебхукам Apify](https://docs.apify.com/platform/integrations/webhooks).

  В качестве альтернативы можно использовать [Apify Schedules](https://docs.apify.com/platform/schedules) для запуска Actor по cron-подобному расписанию в сочетании с вебхуками на этапе загрузки.
</VerticalStepper>

## Лучшие практики \{#best-practices\}

### Получение данных из Apify \{#fetching-data-from-apify\}

Используйте клиентскую библиотеку Apify (`apify-client` для [JavaScript](https://docs.apify.com/api/client/js) или [Python](https://docs.apify.com/api/client/python)) вместо прямых HTTP-запросов. Она сама обрабатывает пагинацию, повторные попытки и аутентификацию. Для больших наборов данных постранично извлекайте результаты с помощью параметров `limit` и `offset` конечной точки [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items).

### Загрузка в ClickHouse \{#loading-into-clickhouse\}

Используйте формат [`JSONEachRow`](/interfaces/formats/JSONEachRow) при вставке в ClickHouse. Он напрямую соответствует JSON-выводу Apify и не требует преобразования.

Schema таблицы ClickHouse должна соответствовать полям вывода Actor. Проверьте выходную schema Actor на странице [Apify Store](https://apify.com/store) или на вкладке **Dataset** после выполнения.

### Производительность \{#performance\}

Для высоконагруженных вставок из JavaScript-клиента следуйте рекомендациям из раздела [Советы по оптимизации производительности](/integrations/javascript#tips-for-performance-optimizations). Группируйте строки в более крупные вставки, а не вставляйте их по одной, и рассмотрите [асинхронные вставки](/optimize/asynchronous-inserts), если пакетная обработка на стороне клиента непрактична.

### Безопасность \{#security\}

В примерах на этой странице для простоты используются пользователь `default` и база данных `default`. В продакшене создайте отдельного пользователя с минимальными привилегиями, необходимыми для вставки данных в целевую таблицу, и храните учетные данные в защищенном месте (например, в переменных окружения или менеджере секретов, а не в исходном коде). См. [управление доступом в Cloud](/cloud/security/cloud_access_management) для получения рекомендаций.

## См. также \{#related-resources\}

* [Документация по платформе Apify](https://docs.apify.com)
* [Справочник по API Apify](https://docs.apify.com/api/v2)
* [JavaScript-клиент для Apify](https://docs.apify.com/api/client/js)
* [клиент Python для Apify](https://docs.apify.com/api/client/python)
* [Apify Store (готовые Actors)](https://apify.com/store)
* [Обзор интеграций Apify](https://docs.apify.com/platform/integrations)
* [JavaScript-клиент для ClickHouse](/integrations/language-clients/js.md)