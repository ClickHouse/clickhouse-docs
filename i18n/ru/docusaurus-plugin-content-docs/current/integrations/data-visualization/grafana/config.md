---
sidebar_label: 'Настройка плагина'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Параметры настройки плагина источника данных ClickHouse в Grafana'
title: 'Настройка источника данных ClickHouse в Grafana'
doc_type: 'guide'
keywords: ['настройка плагина Grafana', 'параметры источника данных', 'параметры подключения', 'настройка аутентификации', 'параметры плагина']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
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

Проще всего изменить конфигурацию в интерфейсе Grafana на странице настройки плагина, но источники данных также можно [подготавливать с помощью YAML‑файла](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

На этой странице приведён список параметров, доступных для настройки в плагине ClickHouse, а также фрагменты конфигурации для тех, кто подготавливает источник данных с помощью YAML.

Для быстрого обзора всех параметров полный список опций конфигурации можно найти [здесь](#all-yaml-options).



## Общие настройки {#common-settings}

Пример экрана конфигурации:

<Image
  size='sm'
  img={config_common}
  alt='Пример безопасной нативной конфигурации'
  border
/>

Пример конфигурации YAML для общих настроек:

```yaml
jsonData:
  host: 127.0.0.1 # (обязательно) адрес сервера.
  port: 9000 # (обязательно) порт сервера. Для нативного протокола по умолчанию используется 9440 для защищённого соединения и 9000 для незащищённого. Для HTTP по умолчанию используется 8443 для защищённого соединения и 8123 для незащищённого.

  protocol: native # (обязательно) протокол, используемый для соединения. Может принимать значения "native" или "http".
  secure: false # установите значение true, если соединение защищённое.

  username: default # имя пользователя для аутентификации.

  tlsSkipVerify: <boolean> # пропускает проверку TLS при значении true.
  tlsAuth: <boolean> # установите значение true для включения клиентской аутентификации TLS.
  tlsAuthWithCACert: <boolean> # установите значение true, если предоставлен сертификат CA. Требуется для проверки самоподписанных сертификатов TLS.

secureJsonData:
  password: secureExamplePassword # пароль для аутентификации.

  tlsCACert: <string> # сертификат CA для TLS
  tlsClientCert: <string> # клиентский сертификат TLS
  tlsClientKey: <string> # клиентский ключ TLS
```

Обратите внимание, что свойство `version` добавляется при сохранении конфигурации из пользовательского интерфейса. Оно указывает версию плагина, с которой была сохранена конфигурация.

### Протокол HTTP {#http-protocol}

При выборе подключения через протокол HTTP отображаются дополнительные настройки.

<Image size='md' img={config_http} alt='Дополнительные параметры конфигурации HTTP' border />

#### Путь HTTP {#http-path}

Если ваш HTTP-сервер доступен по другому пути URL, вы можете указать его здесь.

```yaml
jsonData:
  # исключает первый слеш
  path: additional/path/example
```

#### Пользовательские заголовки HTTP {#custom-http-headers}

Вы можете добавить пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть как обычными, так и защищёнными.
Все ключи заголовков хранятся в виде обычного текста, в то время как значения защищённых заголовков сохраняются в защищённой конфигурации (аналогично полю `password`).

:::warning Защищённые значения через HTTP
Хотя значения защищённых заголовков хранятся безопасно в конфигурации, они всё равно будут отправлены через HTTP, если защищённое соединение отключено.
:::

Пример YAML для обычных/защищённых заголовков:

```yaml
jsonData:
  httpHeaders:
    - name: X-Example-Plain-Header
      value: plain text value
      secure: false
    - name: X-Example-Secure-Header
      # "value" исключено
      secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```


## Дополнительные настройки {#additional-settings}

Эти дополнительные настройки необязательны.

<Image
  size='sm'
  img={config_additional}
  alt='Пример дополнительных настроек'
  border
/>

Пример YAML:

```yaml
jsonData:
  defaultDatabase: default # база данных по умолчанию, загружаемая конструктором запросов. По умолчанию "default".
  defaultTable: <string> # таблица по умолчанию, загружаемая конструктором запросов.

  dialTimeout: 10 # таймаут подключения к серверу в секундах. По умолчанию "10".
  queryTimeout: 60 # таймаут выполнения запроса в секундах. По умолчанию 60. Требует соответствующих прав пользователя; при ошибке доступа попробуйте установить "0" для отключения.
  validateSql: false # если установлено в true, будет выполняться валидация SQL в редакторе SQL.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) глубоко интегрирован в плагин.
Данные OpenTelemetry можно экспортировать в ClickHouse с помощью нашего [плагина-экспортера](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
Для оптимального использования рекомендуется настроить OTel как для [логов](#logs), так и для [трассировок](#traces).

Также необходимо настроить эти параметры по умолчанию для включения [ссылок на данные](./query-builder.md#data-links) — функции, обеспечивающей мощные рабочие процессы наблюдаемости.

### Логи {#logs}

Чтобы ускорить [построение запросов для логов](./query-builder.md#logs), можно задать базу данных/таблицу по умолчанию, а также столбцы для запроса логов. Это предварительно загрузит конструктор запросов с готовым к выполнению запросом логов, что ускорит просмотр на странице исследования для задач наблюдаемости.

Если вы используете OpenTelemetry, следует включить переключатель "**Use OTel**" и установить **таблицу логов по умолчанию** в `otel_logs`.
Это автоматически переопределит столбцы по умолчанию для использования выбранной версии схемы OTel.

Хотя OpenTelemetry не является обязательным для логов, использование единого набора данных логов/трассировок помогает обеспечить более плавный рабочий процесс наблюдаемости с [связыванием данных](./query-builder.md#data-links).

Пример экрана конфигурации логов:

<Image size='sm' img={config_logs} alt='Конфигурация логов' border />

Пример конфигурации логов в YAML:

```yaml
jsonData:
  logs:
    defaultDatabase: default # база данных логов по умолчанию.
    defaultTable: otel_logs # таблица логов по умолчанию. Если вы используете OTel, должна быть установлена в "otel_logs".

    otelEnabled: false # установите в true, если OTel включен.
    otelVersion: latest # версия схемы otel collector для использования. Версии отображаются в UI, но "latest" будет использовать последнюю доступную версию в плагине.

    # Столбцы по умолчанию, выбираемые при открытии нового запроса логов. Игнорируется, если OTel включен.
    timeColumn: <string> # основной столбец времени для лога.
    levelColumn: <string> # уровень/серьезность лога. Значения обычно выглядят как "INFO", "error" или "Debug".
    messageColumn: <string> # сообщение/содержимое лога.
```

### Трассировки {#traces}

Чтобы ускорить [построение запросов для трассировок](./query-builder.md#traces), можно задать базу данных/таблицу по умолчанию, а также столбцы для запроса трассировок. Это предварительно загрузит конструктор запросов с готовым к выполнению поисковым запросом трассировок, что ускорит просмотр на странице исследования для задач наблюдаемости.

Если вы используете OpenTelemetry, следует включить переключатель "**Use OTel**" и установить **таблицу трассировок по умолчанию** в `otel_traces`.
Это автоматически переопределит столбцы по умолчанию для использования выбранной версии схемы OTel.
Хотя OpenTelemetry не является обязательным, эта функция работает лучше всего при использовании его схемы для трассировок.

Пример экрана конфигурации трассировок:

<Image size='sm' img={config_traces} alt='Конфигурация трассировок' border />

Пример конфигурации трассировок в YAML:

```yaml
jsonData:
  traces:
    defaultDatabase: default # база данных трассировок по умолчанию.
    defaultTable: otel_traces # таблица трассировок по умолчанию. Если вы используете OTel, должна быть установлена в "otel_traces".

    otelEnabled: false # установите в true, если OTel включен.
    otelVersion: latest # версия схемы otel collector для использования. Версии отображаются в UI, но "latest" будет использовать последнюю доступную версию в плагине.
```


    # Столбцы по умолчанию, которые будут выбраны при открытии нового запроса трассировки. Игнорируется, если включен OTel.
    traceIdColumn:       <string>    # столбец идентификатора трассировки.
    spanIdColumn:        <string>    # столбец идентификатора спана.
    operationNameColumn: <string>    # столбец имени операции.
    parentSpanIdColumn:  <string>    # столбец идентификатора родительского спана.
    serviceNameColumn:   <string>    # столбец имени сервиса.
    durationTimeColumn:  <string>    # столбец длительности.
    durationUnitColumn:  <time unit> # единица измерения длительности. Может принимать значения "seconds", "milliseconds", "microseconds" или "nanoseconds". Для OTel по умолчанию используется "nanoseconds".
    startTimeColumn:     <string>    # столбец времени начала. Это основной временной столбец для спана трассировки.
    tagsColumn:          <string>    # столбец тегов. Ожидается тип map.
    serviceTagsColumn:   <string>    # столбец тегов сервиса. Ожидается тип map.

````

### Псевдонимы столбцов {#column-aliases}

Псевдонимы столбцов — это удобный способ запрашивать данные под разными именами и типами.
С помощью псевдонимов можно преобразовать вложенную схему в плоскую структуру, которую легко выбирать в Grafana.

Псевдонимы могут быть полезны, если:
- Вы знаете свою схему и большинство её вложенных свойств/типов
- Вы храните данные в типах Map
- Вы храните JSON в виде строк
- Вы часто применяете функции для преобразования выбираемых столбцов

#### Столбцы ALIAS, определённые в таблице {#table-defined-alias-columns}

В ClickHouse встроена поддержка псевдонимов столбцов, которая работает с Grafana без дополнительной настройки.
Столбцы-псевдонимы можно определить непосредственно в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
````

В приведённом выше примере создаётся псевдоним `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`.
Эти данные не хранятся на диске, как первый столбец, а вычисляются во время выполнения запроса.
Псевдонимы, определённые в таблице, не возвращаются при использовании `SELECT *`, но это можно изменить в настройках сервера.

Подробнее см. в документации по типу столбца [ALIAS](/sql-reference/statements/create/table#alias).

#### Таблицы псевдонимов столбцов {#column-alias-tables}

По умолчанию Grafana предоставляет подсказки столбцов на основе результата `DESC table`.
В некоторых случаях может потребоваться полностью переопределить столбцы, которые видит Grafana.
Это позволяет скрыть вашу схему в Grafana при выборе столбцов, что может улучшить пользовательский опыт в зависимости от сложности таблицы.

Преимущество этого подхода перед псевдонимами, определёнными в таблице, заключается в том, что их можно легко обновлять без изменения таблицы. В некоторых схемах это могут быть тысячи записей, которые загромождают определение базовой таблицы. Также это позволяет скрывать столбцы, которые пользователь должен игнорировать.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру столбцов:

```sql
CREATE TABLE aliases (
  `alias` String,  -- Имя псевдонима, как оно отображается в селекторе столбцов Grafana
  `select` String, -- Синтаксис SELECT для использования в генераторе SQL
  `type` String    -- Тип результирующего столбца, чтобы плагин мог настроить параметры интерфейса в соответствии с типом данных.
)
```

Вот как можно воспроизвести поведение столбца `ALIAS` с использованием таблицы псевдонимов:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Сохранить исходный столбец из таблицы (необязательно)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Добавить новый столбец, который преобразует TimestampNanos в Date
```

Затем можно настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым или даже определено в отдельной базе данных:

<Image
  size='md'
  img={alias_table_config_example}
  alt='Пример конфигурации таблицы псевдонимов'
  border
/>

Теперь Grafana будет видеть результаты таблицы псевдонимов вместо результатов `DESC example_table`:

<Image
  size='md'
  img={alias_table_select_example}
  alt='Пример выбора из таблицы псевдонимов'
  border
/>

Оба типа псевдонимов можно использовать для выполнения сложных преобразований типов или извлечения полей JSON.


## Все параметры YAML {#all-yaml-options}

Ниже приведены все параметры конфигурации YAML, доступные в плагине.
Для некоторых полей указаны примеры значений, для других — только тип поля.

Дополнительную информацию о провизионировании источников данных с помощью YAML см. в [документации Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

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
      tlsCACert: <string>
      tlsClientCert: <string>
      tlsClientKey: <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
