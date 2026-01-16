---
sidebar_label: 'Конфигурация плагина'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Параметры конфигурации плагина источника данных ClickHouse для Grafana'
title: 'Настройка источника данных ClickHouse в Grafana'
doc_type: 'guide'
keywords: ['настройка плагина Grafana', 'параметры источника данных', 'параметры подключения', 'настройка аутентификации', 'параметры плагина']
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

# Настройка источника данных ClickHouse в Grafana \\{#configuring-clickhouse-data-source-in-grafana\\}

<ClickHouseSupportedBadge/>

Проще всего изменять конфигурацию в интерфейсе Grafana на странице настройки плагина, но источники данных также могут [создаваться и настраиваться с помощью YAML‑файла](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

На этой странице приведён список параметров, доступных для настройки в плагине ClickHouse, а также примеры конфигурации для тех, кто настраивает источник данных с помощью YAML.

Для быстрого ознакомления со всеми параметрами полный список параметров конфигурации можно найти [здесь](#all-yaml-options).

## Общие настройки \\{#common-settings\\}

Пример экрана конфигурации:

<Image size="sm" img={config_common} alt="Пример защищённой нативной конфигурации" border />

Пример конфигурации YAML для общих настроек:

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

Обратите внимание, что свойство `version` добавляется, когда конфигурация сохраняется через пользовательский интерфейс. Оно показывает версию плагина, в которой была сохранена конфигурация.

### Протокол HTTP \\{#http-protocol\\}

Если вы выберете подключение по протоколу HTTP, появятся дополнительные настройки.

<Image size="md" img={config_http} alt="Дополнительные параметры настройки HTTP" border />

#### HTTP path \\{#http-path\\}

Если ваш HTTP-сервер доступен по другому URL-пути, вы можете указать его здесь.

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### Пользовательские HTTP-заголовки \\{#custom-http-headers\\}

Вы можете добавлять пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть как открытыми, так и защищёнными.
Все имена заголовков хранятся в открытом виде, а значения защищённых заголовков сохраняются в защищённой конфигурации (аналогично полю `password`).

:::warning Передача защищённых значений по HTTP
Хотя значения защищённых заголовков хранятся в конфигурации безопасно, при отключённом защищённом соединении они всё равно будут передаваться по HTTP.
:::

Пример YAML с открытыми и защищёнными заголовками:

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

## Дополнительные настройки \\{#additional-settings\\}

Эти дополнительные настройки не являются обязательными.

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

### OpenTelemetry \\{#opentelemetry\\}

OpenTelemetry (OTel) глубоко интегрирован в плагин.
Данные OpenTelemetry могут экспортироваться в ClickHouse с помощью нашего [плагина-экспортера](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
Для оптимального использования рекомендуется настроить OTel как для [журналов](#logs), так и для [трассировок](#traces).

Также необходимо настроить эти параметры по умолчанию, чтобы включить [data links](./query-builder.md#data-links) — функцию, которая обеспечивает мощные сценарии наблюдаемости.

### Логи \\{#logs\\}

Чтобы ускорить [построение запросов для логов](./query-builder.md#logs), вы можете задать базу данных/таблицу и столбцы по умолчанию для запроса по логам. Это предварительно заполнит конструктор запросов готовым к выполнению запросом по логам, что ускорит работу на странице Explore при решении задач наблюдаемости.

Если вы используете OpenTelemetry, включите переключатель «**Use OTel**» и задайте **default log table** со значением `otel_logs`.
Это автоматически изменит столбцы по умолчанию в соответствии с выбранной версией схемы OTel.

Хотя использование OpenTelemetry для логов не является обязательным, единый набор данных для логов и трассировок помогает обеспечить более плавный рабочий процесс наблюдаемости со [связыванием данных](./query-builder.md#data-links).

Пример экрана конфигурации логов:

<Image size="sm" img={config_logs} alt="Конфигурация логов" border />

Пример конфигурации логов в YAML:

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

### Трейсы \\{#traces\\}

Чтобы ускорить [создание запросов для трейсов](./query-builder.md#traces), вы можете задать базу данных/таблицу по умолчанию, а также столбцы для запроса по трейсам. Это предварительно заполнит конструктор запросов исполняемым запросом поиска по трейсам, что делает работу на странице Explore быстрее для задач наблюдаемости.

Если вы используете OpenTelemetry, следует включить переключатель &quot;**Use OTel**&quot; и задать **default trace table** равным `otel_traces`.
Это автоматически изменит столбцы по умолчанию так, чтобы использовать выбранную версию схемы OTel.
Хотя OpenTelemetry не является обязательным, эта функция работает лучше всего при использовании его схемы для трейсов.

Пример экрана настройки трейсов:

<Image size="sm" img={config_traces} alt="Traces config" border />

Пример конфигурации трейсов в YAML:

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

### Псевдонимы столбцов \\{#column-aliases\\}

Использование псевдонимов столбцов — удобный способ выполнять запросы к данным под другими именами и с другими типами.
С их помощью вы можете преобразовать вложенную схему данных в плоскую структуру, чтобы упростить выборку в Grafana.

Псевдонимы столбцов могут быть полезны, если:

- Вы хорошо знаете свою схему данных и большинство её вложенных свойств/типов
- Вы храните данные в типе Map
- Вы храните JSON в виде строк
- Вы часто применяете функции для преобразования выбираемых столбцов

#### Столбцы-алиасы, определённые в таблице \\{#table-defined-alias-columns\\}

В ClickHouse встроена поддержка алиасов столбцов, и он «из коробки» работает с Grafana.
Алиасы столбцов можно определять прямо в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

В приведённом выше примере мы создаём псевдоним `TimestampDate`, который преобразует метку времени в наносекундах в значение типа `Date`.
Эти данные не хранятся на диске, как данные в первом столбце, а вычисляются во время выполнения запроса.
Псевдонимы, определённые на уровне таблицы, не возвращаются при `SELECT *`, но это поведение можно настроить в параметрах сервера.

Для получения дополнительной информации см. документацию по типу столбца [ALIAS](/sql-reference/statements/create/table#alias).

#### Таблицы с псевдонимами столбцов \\{#column-alias-tables\\}

По умолчанию Grafana подсказывает столбцы на основе ответа `DESC table`.
В некоторых случаях может потребоваться полностью переопределить столбцы, которые видит Grafana.
Это помогает скрыть схему в Grafana при выборе столбцов, что может улучшить удобство работы в зависимости от сложности вашей таблицы.

Преимущество этого подхода по сравнению с псевдонимами, определёнными в таблице, состоит в том, что вы можете легко обновлять их без изменения самой таблицы. В некоторых схемах такой список может содержать тысячи элементов, что захламляет определение базовой таблицы. Этот подход также позволяет скрывать столбцы, которые вы не хотите показывать пользователю.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру столбцов:

```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

Вот как можно воспроизвести поведение столбца `ALIAS` с помощью таблицы псевдонимов:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

Затем мы можем настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым, его можно даже задать в отдельной базе данных:

<Image size="md" img={alias_table_config_example} alt="Пример конфигурации таблицы-псевдонима" border />

Теперь Grafana будет видеть результаты таблицы-псевдонима вместо результатов `DESC example_table`:

<Image size="md" img={alias_table_select_example} alt="Пример запроса к таблице-псевдониму" border />

Оба варианта псевдонимов можно использовать для выполнения сложных преобразований типов или извлечения полей из JSON.

## Все параметры YAML \\{#all-yaml-options\\}

Ниже перечислены все параметры конфигурации YAML, доступные в этом плагине.
Для некоторых полей приведены примеры значений, для других указаны только их типы.

См. [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации об автоматическом создании (provisioning) источников данных с помощью YAML.

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
