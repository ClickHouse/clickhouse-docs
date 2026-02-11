---
slug: /use-cases/observability/clickstack/ingesting-data/vector
pagination_prev: null
pagination_next: null
description: 'Ингестия данных с помощью Vector для ClickStack — стека обсервабилити ClickHouse'
title: 'Ингестия данных с помощью Vector'
toc_max_heading_level: 2
doc_type: 'guide'
keywords: ['clickstack', 'vector', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import InstallingVector from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_installing_vector.md';
import VectorSampleData from '@site/i18n/ru/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_vector_sample_data.md';
import ingestion_key from '@site/static/images/clickstack/clickstack-ingestion-key.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import create_vector_datasource_oss from '@site/static/images/clickstack/create-vector-datasource-oss.png';
import nginx_logs_vector_search from '@site/static/images/clickstack/nginx-logs-vector-search.png';
import launch_clickstack_vector from '@site/static/images/clickstack/launch-clickstack-vector.png';
import play_ui from '@site/static/images/clickstack/play-ui-clickstack.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Vector](https://vector.dev) — это высокопроизводительный, независимый от поставщика конвейер данных обсервабилити. Его обычно используют для сбора, трансформации и маршрутизации логов и метрик из широкого спектра источников; он особенно популярен для ингестии логов благодаря своей гибкости и низкому потреблению ресурсов.

При использовании Vector с ClickStack пользователи сами отвечают за определение собственных схем. Эти схемы могут следовать конвенциям OpenTelemetry, но также могут быть полностью произвольными, представляя пользовательские структуры событий. На практике ингестия с помощью Vector чаще всего используется для **логов**, когда пользователи хотят иметь полный контроль над разбором и обогащением данных до записи в ClickHouse.

Это руководство посвящено подключению данных к ClickStack с использованием Vector как для ClickStack Open Source, так и для Managed ClickStack. Для простоты здесь не рассматриваются источники Vector или конфигурация конвейера в деталях. Вместо этого акцент сделан на конфигурации **sink**, который записывает данные в ClickHouse, и на обеспечении совместимости результирующей схемы с ClickStack.

Единственное жёсткое требование ClickStack, независимо от того, используется ли open-source-версия или управляемое развертывание, состоит в том, что данные должны содержать **столбец с временной меткой** (или эквивалентное поле времени), который можно задать при конфигурировании источника данных в интерфейсе ClickStack.


## Отправка данных с помощью Vector \{#sending-data-with-vector\}

<br/>

<Tabs groupId="vector-options">
  <TabItem value="managed-clickstack" label="Управляемый сервис ClickStack" default>
    Данное руководство предполагает, что вы уже создали управляемый сервис ClickStack и сохранили учетные данные вашего сервиса. Если вы этого еще не сделали, следуйте руководству [Начало работы](/use-cases/observability/clickstack/getting-started/managed) для управляемого ClickStack до этапа настройки Vector.

    <VerticalStepper headerLevel="h3">
      ### Создайте базу данных и таблицу

      Для Vector необходимо определить таблицу и схему до начала ингестии данных.

      Сначала создайте базу данных. Это можно сделать с помощью [консоли ClickHouse Cloud](/cloud/get-started/sql-console).

      В примере ниже мы используем `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      Создайте таблицу для ваших данных. Она должна соответствовать выходной схеме данных. Приведенный ниже пример предполагает классическую структуру Nginx. Адаптируйте её в соответствии с вашими данными, придерживаясь [лучших практик для схем](/best-practices/select-data-types). Мы **настоятельно рекомендуем** ознакомиться с [концепцией первичных ключей](/primary-indexes) и выбрать первичный ключ на основе рекомендаций, изложенных [здесь](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key).

      ```sql
      CREATE TABLE logs.nginx_logs
      (
          `time_local` DateTime,
          `remote_addr` IPv4,
          `remote_user` LowCardinality(String),
          `request` String,
          `status` UInt16,
          `body_bytes_sent` UInt64,
          `http_referer` String,
          `http_user_agent` String,
          `http_x_forwarded_for` LowCardinality(String),
          `request_time` Float32,
          `upstream_response_time` Float32,
          `http_host` String
      )
      ENGINE = MergeTree
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Первичный ключ Nginx
      Указанный выше первичный ключ рассчитан на типичные шаблоны доступа к логам Nginx в интерфейсе ClickStack, но может потребовать корректировки в зависимости от вашей рабочей нагрузки в production-окружении.
      :::

      ### Добавьте приёмник ClickHouse в конфигурацию Vector

      Измените конфигурацию Vector, добавив приёмник ClickHouse и обновив поле `inputs` для приёма событий из существующих конвейеров.

      Данная конфигурация предполагает, что ваш upstream-конвейер Vector уже **подготовил данные в соответствии с целевой схемой ClickHouse**, то есть поля разобраны, корректно именованы и имеют подходящие типы для вставки. См. [**пример с Nginx ниже**](#example-dataset-with-vector) для полной иллюстрации разбора и нормализации необработанных строк логов в схему, подходящую для ClickStack.

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      По умолчанию рекомендуется использовать формат **`json_each_row`**, который кодирует каждое событие как отдельный JSON-объект на строку. Это формат по умолчанию и рекомендуемый формат для ClickStack при приёме JSON-данных; его следует предпочесть альтернативным форматам, таким как JSON-объекты, закодированные в виде строк.

      Приёмник ClickHouse также поддерживает **кодирование потока Arrow** (в настоящее время в бета-версии). Это может обеспечить более высокую пропускную способность, но имеет важные ограничения: база данных и таблица должны быть статическими, поскольку схема извлекается один раз при запуске, а динамическая маршрутизация не поддерживается. По этой причине кодирование Arrow лучше всего подходит для фиксированных, чётко определённых конвейеров ингестии.

      Рекомендуем ознакомиться с доступными параметрами конфигурации приёмника (sink) в [документации Vector](https://vector.dev/docs/reference/configuration/sinks/clickhouse):

      :::note
      Приведенный выше пример использует пользователя по умолчанию для Managed ClickStack. Для продакшн-развертываний рекомендуется [создать выделенного пользователя для ингестии](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) с соответствующими правами и ограничениями.
      :::

      ### Перейдите к интерфейсу ClickStack

      Перейдите к управляемому сервису ClickStack и выберите &quot;ClickStack&quot; в меню слева. Если вы уже завершили первоначальную настройку, интерфейс ClickStack откроется в новой вкладке, и вы будете автоматически аутентифицированы. Если нет, пройдите процесс первоначальной настройки и выберите &quot;Launch ClickStack&quot; после выбора Vector в качестве источника данных.

      <Image img={launch_clickstack_vector} alt="Запустите ClickStack для работы с Vector" size="lg" />

      ### Создайте источник данных

      Создайте источник данных для логов. Если источники данных отсутствуют, при первом входе в систему вам будет предложено создать его. В противном случае перейдите в Team Settings и добавьте новый источник данных.

      <Image img={create_vector_datasource} alt="Создать источник данных - Vector" size="lg" />

      Приведенная выше конфигурация предполагает схему в стиле Nginx со столбцом `time_local`, используемым в качестве временной метки. По возможности это должен быть столбец временной метки, объявленный в первичном ключе. Данный столбец является обязательным.

      Также рекомендуется обновить `Default SELECT`, чтобы явно определить, какие столбцы возвращаются в представлении логов. Если доступны дополнительные поля, такие как имя сервиса, уровень логирования или столбец body, их также можно настроить. Столбец отображения временной метки также может быть переопределён, если он отличается от столбца, используемого в первичном ключе таблицы и настроенного выше.

      В приведённом выше примере столбец `Body` отсутствует в данных. Вместо этого он определяется с помощью SQL-выражения, которое восстанавливает строку журнала Nginx из доступных полей.

      Другие доступные параметры см. в [справочнике по конфигурации](/use-cases/observability/clickstack/config).

      ### Исследование данных

      Перейдите к представлению логов, чтобы изучить данные и начать работу с ClickStack.

      <Image img={nginx_logs_vector_search} alt="Логи Nginx в ClickStack" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="Open Source-версия ClickStack">
    <VerticalStepper headerLevel="h3">
      ### Создайте базу данных и таблицу

      Для Vector необходимо определить таблицу и схему перед ингестией данных.

      Сначала создайте базу данных. Это можно сделать через [веб-интерфейс пользователя ClickHouse](/interfaces/http#web-ui) по адресу [http://localhost:8123/play](http://localhost:8123/play). Используйте имя пользователя и пароль по умолчанию `api:api`.

      <Image img={play_ui} alt="Интерфейс ClickStack Play UI" size="lg" />

      В примере ниже мы используем `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      Создайте таблицу для ваших данных. Она должна соответствовать выходной схеме данных. Приведенный ниже пример предполагает классическую структуру Nginx. Адаптируйте её в соответствии с вашими данными, придерживаясь [лучших практик для схем](/best-practices/select-data-types). Мы **настоятельно рекомендуем** ознакомиться с [концепцией первичных ключей](/primary-indexes) и выбрать первичный ключ на основе рекомендаций, изложенных [здесь](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key).

      ```sql
      CREATE TABLE logs.nginx_logs
      (
          `time_local` DateTime,
          `remote_addr` IPv4,
          `remote_user` LowCardinality(String),
          `request` String,
          `status` UInt16,
          `body_bytes_sent` UInt64,
          `http_referer` String,
          `http_user_agent` String,
          `http_x_forwarded_for` LowCardinality(String),
          `request_time` Float32,
          `upstream_response_time` Float32,
          `http_host` String
      )
      ENGINE = MergeTree
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Первичный ключ Nginx
      Приведённый выше первичный ключ рассчитан на типичные шаблоны доступа к логам Nginx в интерфейсе ClickStack, но может потребовать корректировки в зависимости от вашей рабочей нагрузки в production-окружении.
      :::

      ### Добавьте приёмник ClickHouse в конфигурацию Vector

      Ингестия в ClickStack для Vector должна осуществляться напрямую в ClickHouse, минуя OTLP-эндпоинт, предоставляемый коллектором.

      Измените конфигурацию Vector, добавив приёмник ClickHouse и обновив поле `inputs` для приёма событий из существующих конвейеров.

      Данная конфигурация предполагает, что ваш upstream-конвейер Vector уже **подготовил данные в соответствии с целевой схемой ClickHouse**, то есть поля разобраны, корректно именованы и имеют подходящие типы для вставки. См. [**пример с Nginx ниже**](#example-dataset-with-vector) для полной иллюстрации разбора и нормализации необработанных строк логов в схему, подходящую для ClickStack.

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      По умолчанию рекомендуется использовать формат **`json_each_row`**, который кодирует каждое событие как отдельный JSON-объект на строку. Это формат по умолчанию и рекомендуемый формат для ClickStack при приёме JSON-данных; его следует предпочесть альтернативным форматам, таким как JSON-объекты, закодированные в виде строк.

      Приёмник ClickHouse также поддерживает **кодирование потоков Arrow** (в настоящее время в бета-версии). Это может обеспечить более высокую пропускную способность, но имеет важные ограничения: база данных и таблица должны быть статическими, поскольку схема извлекается один раз при запуске, а динамическая маршрутизация не поддерживается. По этой причине кодирование Arrow лучше всего подходит для фиксированных, чётко определённых конвейеров ингестии.

      Рекомендуем ознакомиться с доступными параметрами конфигурации приёмника (sink) в [документации Vector](https://vector.dev/docs/reference/configuration/sinks/clickhouse):

      :::note
      В приведенном выше примере используется пользователь `api` для ClickStack Open Source. Для production-развертываний мы рекомендуем [создать выделенного пользователя для ингестии](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) с соответствующими правами и ограничениями. Приведенная выше конфигурация также предполагает, что Vector работает на том же хосте, что и ClickStack. В production-развертываниях это, скорее всего, будет не так. Мы рекомендуем отправлять данные через защищенный HTTPS-порт 8443.
      :::

      ### Перейдите к интерфейсу ClickStack

      Перейдите в пользовательский интерфейс ClickStack по адресу [http://localhost:8080](http://localhost:8080). Создайте пользователя, если вы еще не прошли процесс первоначальной настройки.

      <Image img={hyperdx_login} alt="Вход в ClickStack" size="lg" />

      ### Создайте источник данных

      Перейдите в Team Settings и добавьте новый источник данных.

      <Image img={create_vector_datasource_oss} alt="Создать источник данных — Vector" size="lg" />

      Приведенная выше конфигурация предполагает схему в стиле Nginx со столбцом `time_local`, используемым в качестве временной метки. По возможности это должен быть столбец временной метки, объявленный в первичном ключе. Данный столбец является обязательным.

      Также рекомендуется обновить `Default SELECT`, чтобы явно определить, какие столбцы возвращаются в представлении логов. Если доступны дополнительные поля, такие как имя сервиса, уровень логирования или столбец body, их также можно настроить. Столбец отображения временной метки также может быть переопределён, если он отличается от столбца, используемого в первичном ключе таблицы и настроенного выше.

      В приведённом выше примере столбец `Body` отсутствует в данных. Вместо этого он определяется с помощью SQL-выражения, которое восстанавливает строку журнала Nginx из доступных полей.

      Другие доступные параметры см. в [справочнике по конфигурации](/use-cases/observability/clickstack/config).

      ### Исследование данных

      Перейдите в представление логов, чтобы изучить данные и начать работу с ClickStack.

      <Image img={nginx_logs_vector_search} alt="Логи Nginx в ClickStack" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>

## Пример набора данных с Vector {#example-dataset-with-vector}

В качестве более полного примера ниже мы используем **файл журнала Nginx**.

<Tabs groupId="example-dataset-options">
  <TabItem value="managed-clickstack" label="Управляемый ClickStack" default>
    В данном руководстве предполагается, что вы уже создали управляемый сервис ClickStack и сохранили учетные данные сервиса. Если нет, следуйте руководству [Начало работы](/use-cases/observability/clickstack/getting-started/managed) для управляемого ClickStack до момента настройки Vector.

    <VerticalStepper headerLevel="h3">
      ### Установка Vector

      <InstallingVector />

      ### Загрузите примеры данных

      <VectorSampleData />

      ### Создайте базу данных и таблицу

      Для Vector необходимо определить таблицу и схему до начала ингестии данных.

      Сначала создайте базу данных. Это можно сделать с помощью [консоли ClickHouse Cloud](/cloud/get-started/sql-console).

      Создайте базу данных `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      Создайте таблицу для данных.

      ```sql
      CREATE TABLE logs.nginx_logs
      (
          `time_local` DateTime,
          `remote_addr` IPv4,
          `remote_user` LowCardinality(String),
          `request` String,
          `status` UInt16,
          `body_bytes_sent` UInt64,
          `http_referer` String,
          `http_user_agent` String,
          `http_x_forwarded_for` LowCardinality(String),
          `request_time` Float32,
          `upstream_response_time` Float32,
          `http_host` String
      )
      ENGINE = MergeTree
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Первичный ключ Nginx
      Приведенный выше первичный ключ рассчитан на типичные шаблоны доступа к логам Nginx в интерфейсе ClickStack, но может потребовать корректировки в зависимости от вашей рабочей нагрузки в production-окружении.
      :::

      ### Скопируйте конфигурацию Vector

      Скопируйте конфигурацию Vector и создайте файл `nginx.yaml`, задав значения `CLICKHOUSE_ENDPOINT` и `CLICKHOUSE_PASSWORD`.

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      :::note
      Приведенный выше пример использует пользователя по умолчанию для Managed ClickStack. Для production-развертываний рекомендуется [создать выделенного пользователя для ингестии](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) с соответствующими правами доступа и ограничениями.
      :::

      ### Запуск Vector

      Запустите Vector следующей командой, предварительно создав каталог данных для записи смещений файлов.

      ```bash
      mkdir ./.vector-data
      vector --config nginx.yaml
      ```

      ### Перейдите в пользовательский интерфейс ClickStack

      Перейдите к управляемому сервису ClickStack и выберите &quot;ClickStack&quot; в меню слева. Если вы уже завершили первоначальную настройку, интерфейс ClickStack откроется в новой вкладке, и вы будете автоматически аутентифицированы. Если нет, пройдите процесс первоначальной настройки и выберите &quot;Launch ClickStack&quot; после выбора Vector в качестве источника данных.

      <Image img={launch_clickstack_vector} alt="Запустите ClickStack с Vector" size="lg" />

      ### Создайте источник данных

      Создайте источник данных для логов. Если источники данных отсутствуют, при первом входе в систему вам будет предложено создать его. В противном случае перейдите в Team Settings и добавьте новый источник данных.

      <Image img={create_vector_datasource} alt="Создать источник данных Vector" size="lg" />

      Конфигурация предполагает схему Nginx со столбцом `time_local`, используемым в качестве временной метки. Это столбец временной метки, объявленный в первичном ключе. Данный столбец обязателен.

      Мы также указали значение по умолчанию для select: `time_local, remote_addr, status, request`, что определяет, какие столбцы возвращаются в представлении логов.

      В приведённом выше примере столбец `Body` отсутствует в данных. Вместо этого он определяется как SQL-выражение:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      Это восстанавливает строку журнала из структурированных полей.

      Другие доступные параметры см. в [справочнике по конфигурации](/use-cases/observability/clickstack/config).

      ### Исследование данных

      Перейдите в представление поиска за `October 20th, 2025`, чтобы изучить данные и начать работу с ClickStack.

      <Image img={nginx_logs_vector_search} alt="интерфейс HyperDX" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack с открытым исходным кодом">
    В данном руководстве предполагается, что вы уже настроили ClickStack Open Source, следуя [руководству по началу работы](use-cases/observability/clickstack/getting-started/managed).

    <VerticalStepper headerLevel="h3">
      ### Установка Vector

      <InstallingVector />

      ### Загрузите примеры данных

      <VectorSampleData />

      ### Создайте базу данных и таблицу

      Для Vector необходимо определить таблицу и схему до начала ингестии данных.

      Сначала создайте базу данных. Это можно сделать через [веб-интерфейс пользователя ClickHouse](/interfaces/http#web-ui) по адресу [http://localhost:8123/play](http://localhost:8123/play). Используйте имя пользователя и пароль по умолчанию `api:api`.

      <Image img={play_ui} alt="Работа с интерфейсом ClickStack" size="lg" />

      Создайте базу данных `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      Создайте таблицу для данных.

      ```sql
      CREATE TABLE logs.nginx_logs
      (
          `time_local` DateTime,
          `remote_addr` IPv4,
          `remote_user` LowCardinality(String),
          `request` String,
          `status` UInt16,
          `body_bytes_sent` UInt64,
          `http_referer` String,
          `http_user_agent` String,
          `http_x_forwarded_for` LowCardinality(String),
          `request_time` Float32,
          `upstream_response_time` Float32,
          `http_host` String
      )
      ENGINE = MergeTree
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Первичный ключ Nginx
      Указанный выше первичный ключ рассчитан на типичные шаблоны доступа к логам Nginx в интерфейсе ClickStack, но может потребовать корректировки в зависимости от вашей рабочей нагрузки в производственной среде.
      :::

      ### Скопируйте конфигурацию Vector

      Ингестия в ClickStack для Vector должна осуществляться напрямую в ClickHouse, минуя OTLP-эндпоинт, предоставляемый коллектором.

      Скопируйте конфигурацию Vector и создайте файл `nginx.yaml`.

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      :::note
      В приведенном выше примере используется пользователь `api` для ClickStack Open Source. Для промышленных развертываний рекомендуется [создать выделенного пользователя для ингестии](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) с соответствующими правами и ограничениями. Приведенная выше конфигурация также предполагает, что Vector запущен на том же хосте, что и ClickStack. В промышленных развертываниях это, скорее всего, будет не так. Рекомендуется отправлять данные через защищенный HTTPS-порт 8443.
      :::

      ### Запуск Vector

      Запустите Vector с помощью следующей команды.

      ```bash
      mkdir ./.vector-data
      vector --config nginx-local.yaml
      ```

      ### Создайте источник данных

      Создайте источник данных для логов через `Team -> Sources`

      <Image img={create_vector_datasource_oss} alt="Создать источник данных — Vector" size="lg" />

      Конфигурация предполагает схему Nginx со столбцом `time_local`, используемым в качестве временной метки. Это столбец временной метки, объявленный в первичном ключе. Данный столбец является обязательным.

      Мы также указали значение по умолчанию для select: `time_local, remote_addr, status, request`, что определяет, какие столбцы возвращаются в представлении логов.

      В приведённом выше примере столбец `Body` отсутствует в данных. Вместо этого он определяется как SQL-выражение:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      Это восстанавливает строку журнала из структурированных полей.

      Другие доступные параметры см. в [справочнике по конфигурации](/use-cases/observability/clickstack/config).

      ### Перейдите в пользовательский интерфейс ClickStack

      Перейдите в интерфейс ClickStack по адресу [http://localhost:8080](http://localhost:8080). Создайте пользователя, если вы еще не прошли процесс первоначальной настройки.

      <Image img={hyperdx_login} alt="Вход в систему ClickStack" size="lg" />

      ### Исследование данных

      Перейдите в представление поиска за `October 20th, 2025`, чтобы изучить данные и начать работу с ClickStack.

      <Image img={nginx_logs_vector_search} alt="Интерфейс HyperDX" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>