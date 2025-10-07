---
'sidebar_label': 'Конфигурация плагина'
'sidebar_position': 3
'slug': '/integrations/grafana/config'
'description': 'Опции конфигурации для плагина источника данных ClickHouse в Grafana'
'title': 'Настройка источника данных ClickHouse в Grafana'
'doc_type': 'guide'
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


# Настройка источника данных ClickHouse в Grafana

<ClickHouseSupportedBadge/>

Самый простой способ изменить конфигурацию — это использовать интерфейс Grafana на странице настройки плагина, но источники данных также могут быть [проведены с помощью YAML файла](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

Эта страница показывает список доступных параметров для настройки в плагине ClickHouse, а также фрагменты конфигурации для тех, кто проводит источник данных с помощью YAML.

Для быстрого обзора всех параметров полный список конфигурационных опций можно найти [здесь](#all-yaml-options).

## Общие настройки {#common-settings}

Пример экрана конфигурации:
<Image size="sm" img={config_common} alt="Пример безопасной конфигурации" border />

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

Обратите внимание, что свойство `version` добавляется, когда конфигурация сохраняется из интерфейса. Это показывает версию плагина, с которой была сохранена конфигурация.

### Протокол HTTP {#http-protocol}

Будут отображены дополнительные настройки, если вы выберете подключение через протокол HTTP.

<Image size="md" img={config_http} alt="Дополнительные опции конфигурации HTTP" border />

#### HTTP путь {#http-path}

Если ваш HTTP сервер доступен по другому URL пути, вы можете добавить его здесь.

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### Пользовательские HTTP заголовки {#custom-http-headers}

Вы можете добавить пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть как обычными текстовыми, так и защищенными. 
Все ключи заголовков хранятся в обычном виде, тогда как защищенные значения заголовков сохраняются в защищенной конфигурации (аналогично полю `password`).

:::warning Защищенные значения по HTTP
Хотя защищенные значения заголовков хранятся безопасно в конфигурации, значение все равно будет отправлено по HTTP, если защищенное соединение отключено.
:::

Пример YAML для обычных/защищенных заголовков:
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

## Дополнительные настройки {#additional-settings}

Эти дополнительные настройки являются необязательными.

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

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) глубоко интегрирован в плагин. 
Данные OpenTelemetry могут быть экспортированы в ClickHouse с помощью нашего [экспортера](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). 
Для лучшего использования рекомендуется настроить OTel как для [логов](#logs), так и для [трассировок](#traces).

Также необходимо настроить эти значения по умолчанию для включения [ссылок на данные](./query-builder.md#data-links), функции, которая позволяет перейти к мощным рабочим процессам мониторинга.

### Логи {#logs}

Чтобы ускорить [построение запросов для логов](./query-builder.md#logs), вы можете задать базу данных/таблицу по умолчанию, а также колонки для запроса логов. Это предварительно загрузит конструктор запросов с выполнимым запросом логов, что сделает просмотр на странице исследования быстрее для мониторинга.

Если вы используете OpenTelemetry, вам следует включить переключатель "**Использовать OTel**" и установить **таблицу логов по умолчанию** на `otel_logs`.
Это автоматически переопределит стандартные колонки для использования выбранной версии схемы OTel.

Хотя OpenTelemetry не является обязательным для логов, использование единого набора данных логов/трассировок помогает обеспечить более плавный рабочий процесс мониторинга с [ссылками на данные](./query-builder.md#data-links).

Пример экрана конфигурации логов:
<Image size="sm" img={config_logs} alt="Конфигурация логов" border />

Пример конфигурации логов YAML:
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

### Трассировки {#traces}

Чтобы ускорить [построение запросов для трассировок](./query-builder.md#traces), вы можете задать базу данных/таблицу по умолчанию, а также колонки для запроса трассировок. Это предварительно загрузит конструктор запросов с выполнимым запросом поиска трассировок, что сделает просмотр на странице исследования быстрее для мониторинга.

Если вы используете OpenTelemetry, вам следует включить переключатель "**Использовать OTel**" и установить **таблицу трассировок по умолчанию** на `otel_traces`.
Это автоматически переопределит стандартные колонки для использования выбранной версии схемы OTel.
Хотя OpenTelemetry не является обязательным, эта функция лучше всего работает при использовании его схемы для трассировок.

Пример экрана конфигурации трассировок:
<Image size="sm" img={config_traces} alt="Конфигурация трассировок" border />

Пример конфигурации трассировок YAML:
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

### Псевдонимы колонок {#column-aliases}

Псевдоним колонок — это удобный способ запросить ваши данные под разными именами и типами. 
С помощью псевдонимирования вы можете взять вложенную схему и упростить ее, чтобы ее можно было легко выбирать в Grafana.

Псевдонимирование может быть актуально для вас, если:
- Вы знаете свою схему и большинство ее вложенных свойств/типов
- Вы храните свои данные в типах Map
- Вы храните JSON в виде строк
- Вы часто применяете функции для преобразования выбранных колонок

#### Колонки ALIAS, определенные таблицей {#table-defined-alias-columns}

ClickHouse имеет встроенное псевдонимирование колонок и работает с Grafana "из коробки". 
Псевдонимные колонки могут быть определены непосредственно в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

В приведенном выше примере мы создаем псевдоним с названием `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`. 
Эти данные не хранятся на диске, как первая колонка, они вычисляются во время запроса. 
Псевдонимы, определенные таблицей, не будут возвращены с `SELECT *`, но это можно настроить в настройках сервера.

Для получения дополнительной информации читайте документацию по типу колонки [ALIAS](/sql-reference/statements/create/table#alias).

#### Таблицы псевдонимов колонок {#column-alias-tables}

По умолчанию Grafana будет предлагать колонки на основе ответа от `DESC table`. 
В некоторых случаях вы можете полностью переопределить колонки, которые видит Grafana. 
Это помогает скрыть вашу схему в Grafana при выборе колонок, что может улучшить пользовательский опыт в зависимости от сложности вашей таблицы.

Преимущество этого подхода перед псевдонимами, определенными таблицей, заключается в том, что вы можете легко обновить их, не изменяя вашу таблицу. 
В некоторых схемах это может быть тысячи записей, что может загромождать определение базовой таблицы. 
Это также позволяет скрывать колонки, которые вы хотите, чтобы пользователь игнорировал.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру колонок:
```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

Вот как мы можем воспроизвести поведение колонки `ALIAS`, используя таблицу псевдонимов:
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

Затем мы можем настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым или даже определенным в отдельной базе данных:
<Image size="md" img={alias_table_config_example} alt="Пример конфигурации таблицы псевдонимов" border />

Теперь Grafana будет видеть результаты таблицы псевдонимов вместо результатов от `DESC example_table`:
<Image size="md" img={alias_table_select_example} alt="Пример выбора из таблицы псевдонимов" border />

Оба типа псевдонимирования можно использовать для выполнения сложных преобразований типов или извлечения полей JSON.

## Все опции YAML {#all-yaml-options}

Это все параметры конфигурации YAML, доступные через плагин. 
Некоторые поля имеют примерные значения, в то время как другие просто показывают тип поля.

Смотрите [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации о проведении источников данных с помощью YAML.

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
