---
sidebar_label: 'Конфигурация плагина'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Параметры конфигурации плагина источника данных ClickHouse для Grafana'
title: 'Настройка источника данных ClickHouse в Grafana'
doc_type: 'guide'
keywords: ['конфигурация плагина источника данных ClickHouse для Grafana', 'параметры источника данных', 'параметры подключения', 'настройка аутентификации', 'параметры плагина']
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Настройка источника данных ClickHouse в Grafana \{#configuring-clickhouse-data-source-in-grafana\}

<ClickHouseSupportedBadge/>

Самый простой способ изменить конфигурацию — через интерфейс Grafana на странице конфигурации плагина, но источники данных также можно [создавать и настраивать с помощью YAML-файла](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

На этой странице приведён список параметров, доступных для настройки в плагине ClickHouse, а также фрагменты конфигурации для тех, кто подготавливает источник данных с помощью YAML.

Для быстрого обзора всех параметров полный список параметров конфигурации можно найти [здесь](#all-yaml-options).

## Общие настройки \{#common-settings\}

Пример экрана настроек:

<Image size="sm" img={config_common} alt="Example secure native config" border />

Пример YAML‑конфигурации для общих настроек:

```yaml
jsonData:
  host: 127.0.0.1 # (required) server address.
  port: 9000      # (required) server port. For native, defaults to 9440 secure and 9000 insecure. For HTTP, defaults to 8443 secure and 8123 insecure.

  protocol: native # (required) the protocol used for the connection. Can be set to "native" or "http".
  secure: false    # set to true if the connection is secure.

  username: default # the username used for authentication.

  tlsSkipVerify:     <boolean> # skips TLS verification when set to true.
  tlsAuth:           <boolean> # set to true to enable TLS client authentication.
  tlsAuthWithCACert: <boolean> # set to true if CA certificate is provided. Required for verifying self-signed TLS certificates.

secureJsonData:
  password: secureExamplePassword # the password used for authentication.

  tlsCACert:     <string> # TLS CA certificate
  tlsClientCert: <string> # TLS client certificate
  tlsClientKey:  <string> # TLS client key
```

Обратите внимание, что при сохранении конфигурации из пользовательского интерфейса добавляется свойство `version`. Оно показывает версию плагина, с использованием которой была сохранена конфигурация.


### Протокол HTTP \{#http-protocol\}

Если вы выберете подключение по протоколу HTTP, станут доступны дополнительные настройки.

<Image size="md" img={config_http} alt="Дополнительные параметры конфигурации HTTP" border />

#### Путь HTTP \{#http-path\}

Если ваш HTTP‑сервер доступен по другому URL‑пути, вы можете указать его здесь.

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```


#### Пользовательские HTTP-заголовки \{#custom-http-headers\}

Вы можете добавить пользовательские заголовки к запросам, которые отправляются на ваш сервер.

Заголовки могут быть как обычным текстом (plain text), так и защищёнными.
Все ключи заголовков хранятся в открытом виде, тогда как значения защищённых заголовков сохраняются в защищённой конфигурации (аналогично полю `password`).

:::warning Защищённые значения по HTTP
Хотя значения защищённых заголовков надёжно хранятся в конфигурации, при отключённом защищённом соединении они всё равно будут передаваться по HTTP.
:::

Пример YAML для открытых и защищённых заголовков:

```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" is excluded
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```


## Дополнительные настройки \{#additional-settings\}

Эти дополнительные настройки необязательны.

<Image size="sm" img={config_additional} alt="Пример дополнительных настроек" border />

Пример YAML:

```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```


### OpenTelemetry \{#opentelemetry\}

OpenTelemetry (OTel) глубоко интегрирован в плагин.
Данные OpenTelemetry могут экспортироваться в ClickHouse с помощью нашего [exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
Для наилучшего результата рекомендуется настроить OTel как для [логов](#logs), так и для [трейсов](#traces).

Также необходимо настроить эти значения по умолчанию для включения [data links](./query-builder.md#data-links) — функции, которая обеспечивает мощные сценарии обсервабилити.

### Логи \{#logs\}

Чтобы ускорить [сборку запросов для логов](./query-builder.md#logs), можно задать базу данных/таблицу по умолчанию, а также столбцы для запроса логов. Это предварительно заполнит конструктор запросов исполняемым запросом к логам, что ускорит работу на странице Explore для обсервабилити.

Если вы используете OpenTelemetry, включите переключатель «**Use OTel**» и установите **default log table** в `otel_logs`.
Это автоматически переопределит столбцы по умолчанию для использования выбранной версии схемы OTel.

Хотя OpenTelemetry не является обязательным для логов, использование единого набора данных для логов и трейсов помогает сделать процесс обсервабилити более плавным благодаря [data linking](./query-builder.md#data-links).

Пример экрана конфигурации логов:

<Image size="sm" img={config_logs} alt="Logs config" border />

Пример YAML-конфигурации логов:

```yaml
jsonData:
  logs:
    defaultDatabase: default # default log database.
    defaultTable: otel_logs  # default log table. If you're using OTel, this should be set to "otel_logs".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new log query. Will be ignored if OTel is enabled.
    timeColumn:       <string> # the primary time column for the log.
    levelColumn:   <string> # the log level/severity of the log. Values typically look like "INFO", "error", or "Debug".
    messageColumn: <string> # the log's message/content.
```


### Трейсы \{#traces\}

Чтобы ускорить [построение запросов для трейсов](./query-builder.md#traces), вы можете задать базу данных/таблицу по умолчанию, а также столбцы для запроса по трейсам. Это предварительно заполняет конструктор запросов исполняемым запросом поиска по трейсам, что ускоряет работу на странице Explore в задачах обсервабилити.

Если вы используете OpenTelemetry, включите переключатель &quot;**Use OTel**&quot; и задайте **default trace table** как `otel_traces`.
Столбцы по умолчанию будут автоматически настроены в соответствии с выбранной версией схемы OTel.
Хотя использование OpenTelemetry не является обязательным, эта возможность работает лучше всего при использовании его схемы для трейсов.

Пример экрана конфигурации трейсов:

<Image size="sm" img={config_traces} alt="Traces config" border />

Пример конфигурации трейсов в формате YAML:

```yaml
jsonData:
  traces:
    defaultDatabase: default  # default trace database.
    defaultTable: otel_traces # default trace table. If you're using OTel, this should be set to "otel_traces".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new trace query. Will be ignored if OTel is enabled.
    traceIdColumn:       <string>    # trace ID column.
    spanIdColumn:        <string>    # span ID column.
    operationNameColumn: <string>    # operation name column.
    parentSpanIdColumn:  <string>    # parent span ID column.
    serviceNameColumn:   <string>    # service name column.
    durationTimeColumn:  <string>    # duration time column.
    durationUnitColumn:  <time unit> # duration time unit. Can be set to "seconds", "milliseconds", "microseconds", or "nanoseconds". For OTel the default is "nanoseconds".
    startTimeColumn:     <string>    # start time column. This is the primary time column for the trace span.
    tagsColumn:          <string>    # tags column. This is expected to be a map type.
    serviceTagsColumn:   <string>    # service tags column. This is expected to be a map type.
```


### Псевдонимы столбцов \{#column-aliases\}

Использование псевдонимов столбцов — удобный способ выполнять запросы к данным, используя другие имена и типы.
С помощью псевдонимов вы можете разворачивать вложенную схему в плоский вид, чтобы её было проще выбирать в Grafana.

Псевдонимы могут быть полезны, если:

- Вы хорошо знаете свою схему и большинство её вложенных свойств и типов
- Вы храните данные в типах Map
- Вы храните JSON в виде строк
- Вы часто применяете функции для преобразования выбираемых столбцов

#### Столбцы ALIAS, определённые на уровне таблицы \{#table-defined-alias-columns\}

ClickHouse имеет встроенную поддержку псевдонимов столбцов и изначально совместим с Grafana.
Столбцы-псевдонимы могут быть заданы непосредственно в определении таблицы.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

В приведённом выше примере мы создаём псевдоним `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`.
Эти данные не хранятся на диске, как первый столбец: они вычисляются во время выполнения запроса.
Псевдонимы, определённые на уровне таблицы, не будут возвращаться при `SELECT *`, но это поведение можно изменить в настройках сервера.

Дополнительную информацию см. в документации по типу столбца [ALIAS](/sql-reference/statements/create/table#alias).


#### Таблицы псевдонимов столбцов \{#column-alias-tables\}

По умолчанию Grafana будет предлагать варианты столбцов на основе ответа на `DESC table`.
В некоторых случаях вы можете полностью переопределить столбцы, которые Grafana видит.
Это помогает скрыть схему таблицы в Grafana при выборе столбцов, что может улучшить взаимодействие с пользователем в зависимости от сложности таблицы.

Преимущество этого подхода по сравнению с псевдонимами, определёнными в таблице, заключается в том, что вы можете легко обновлять их, не изменяя саму таблицу. В некоторых схемах таких записей может быть тысячи, что засоряет определение базовой таблицы. Это также позволяет скрывать столбцы, которые вы хотите, чтобы пользователь игнорировал.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру столбцов:

```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

Вот как можно воспроизвести поведение столбца `ALIAS` с помощью alias-таблицы:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

Теперь мы можем настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым или даже задано в отдельной базе данных:

<Image size="md" img={alias_table_config_example} alt="Пример конфигурации таблицы-алиаса" border />

Теперь Grafana будет использовать результаты таблицы-алиаса вместо результатов `DESC example_table`:

<Image size="md" img={alias_table_select_example} alt="Пример выборки из таблицы-алиаса" border />

Оба варианта алиасинга можно использовать для выполнения сложных преобразований типов или извлечения полей из JSON.


## Все параметры YAML \{#all-yaml-options\}

Ниже перечислены все параметры конфигурации YAML, поддерживаемые этим плагином.
Некоторые поля содержат примеры значений, для других указаны только типы полей.

См. [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации о подготовке источников данных с помощью YAML.

```yaml
datasources:
  - name: Example ClickHouse
    uid: clickhouse-example
    type: grafana-clickhouse-datasource
    jsonData:
      host: 127.0.0.1
      port: 9000
      protocol: native
      secure: false
      username: default
      tlsSkipVerify: <boolean>
      tlsAuth: <boolean>
      tlsAuthWithCACert: <boolean>
      defaultDatabase: default
      defaultTable: <string>
      dialTimeout: 10
      queryTimeout: 60
      validateSql: false
      httpHeaders:
      - name: X-Example-Plain-Header
        value: plain text value
        secure: false
      - name: X-Example-Secure-Header
        secure: true
      logs:
        defaultDatabase: default
        defaultTable: otel_logs
        otelEnabled: false
        otelVersion: latest
        timeColumn: <string>
        levelColumn: <string>
        messageColumn: <string>
      traces:
        defaultDatabase: default
        defaultTable: otel_traces
        otelEnabled: false
        otelVersion: latest
        traceIdColumn: <string>
        spanIdColumn: <string>
        operationNameColumn: <string>
        parentSpanIdColumn: <string>
        serviceNameColumn: <string>
        durationTimeColumn: <string>
        durationUnitColumn: <time unit>
        startTimeColumn: <string>
        tagsColumn: <string>
        serviceTagsColumn: <string>
    secureJsonData:
      tlsCACert:     <string>
      tlsClientCert: <string>
      tlsClientKey:  <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
