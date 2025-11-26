---
sidebar_label: 'Конфигурация плагина'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Параметры настройки плагина источника данных ClickHouse в Grafana'
title: 'Настройка источника данных ClickHouse в Grafana'
doc_type: 'guide'
keywords: ['конфигурация плагина Grafana', 'настройки источника данных', 'параметры подключения', 'настройка аутентификации', 'настройки плагина']
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

Проще всего изменить конфигурацию в интерфейсе Grafana на странице настройки плагина, но источники данных также могут [создаваться с помощью YAML‑файла](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

На этой странице приведён список параметров, доступных для настройки в плагине ClickHouse, а также фрагменты конфигурации для тех, кто создаёт источник данных с помощью YAML.

Для краткого обзора всех параметров полный список параметров конфигурации можно найти [здесь](#all-yaml-options).



## Общие настройки

Пример экрана конфигурации:

<Image size="sm" img={config_common} alt="Example secure native config" border />

Пример YAML-конфигурации для общих настроек:

```yaml
jsonData:
  host: 127.0.0.1 # (обязательно) адрес сервера.
  port: 9000      # (обязательно) порт сервера. Для native по умолчанию используется 9440 для защищённого соединения и 9000 для незащищённого. Для HTTP по умолчанию используется 8443 для защищённого соединения и 8123 для незащищённого.

  protocol: native # (обязательно) протокол соединения. Может принимать значения "native" или "http".
  secure: false    # установите значение true, если соединение защищено.

  username: default # имя пользователя, используемое для аутентификации.

  tlsSkipVerify:     <boolean> # пропускает проверку TLS при значении true.
  tlsAuth:           <boolean> # установите значение true для включения клиентской аутентификации TLS.
  tlsAuthWithCACert: <boolean> # установите значение true, если предоставлен сертификат CA. Требуется для проверки самоподписанных сертификатов TLS.

secureJsonData:
  password: secureExamplePassword # пароль, используемый для аутентификации.

  tlsCACert:     <string> # сертификат CA для TLS
  tlsClientCert: <string> # клиентский сертификат TLS
  tlsClientKey:  <string> # клиентский ключ TLS
```

Обратите внимание, что свойство `version` добавляется, когда конфигурация сохраняется из пользовательского интерфейса. Оно показывает версию плагина, с которой была сохранена конфигурация.

### Протокол HTTP

Если вы выберете подключение по протоколу HTTP, будут отображены дополнительные параметры.

<Image size="md" img={config_http} alt="Дополнительные параметры конфигурации HTTP" border />

#### Путь HTTP

Если ваш HTTP-сервер доступен по другому URL-пути, вы можете указать его здесь.

```yaml
jsonData:
  # исключает первую косую черту
  path: additional/path/example
```

#### Пользовательские HTTP-заголовки

Вы можете добавлять пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть как обычными, так и защищёнными.
Все ключи заголовков хранятся в открытом виде, в то время как значения защищённых заголовков сохраняются в защищённой конфигурации (аналогично полю `password`).

:::warning Защищённые значения при использовании HTTP
Хотя значения защищённых заголовков безопасно хранятся в конфигурации, они всё равно будут передаваться по HTTP, если защищённое соединение отключено.
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


## Дополнительные настройки

Эти дополнительные настройки необязательны.

<Image size="sm" img={config_additional} alt="Пример дополнительных настроек" border />

Пример YAML:

```yaml
jsonData:
  defaultDatabase: default # база данных по умолчанию, загружаемая конструктором запросов. По умолчанию — "default".
  defaultTable: <string>   # таблица по умолчанию, загружаемая конструктором запросов.

  dialTimeout: 10    # таймаут подключения к серверу в секундах. По умолчанию — "10".
  queryTimeout: 60   # таймаут выполнения запроса в секундах. По умолчанию — 60. Требует соответствующих прав пользователя; при ошибке доступа установите значение "0" для отключения.
  validateSql: false # при значении true выполняется валидация SQL в редакторе SQL.
```

### OpenTelemetry

OpenTelemetry (OTel) глубоко интегрирован в плагин.
Данные OpenTelemetry могут экспортироваться в ClickHouse с помощью нашего [exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
Для максимально эффективного использования рекомендуется настроить OTel как для [логов](#logs), так и для [трейсов](#traces).

Необходимо также задать эти значения по умолчанию, чтобы включить [data links](./query-builder.md#data-links) — функцию, позволяющую реализовывать мощные сценарии наблюдаемости.

### Логи

Чтобы ускорить [построение запросов для логов](./query-builder.md#logs), вы можете задать базу данных/таблицу по умолчанию, а также столбцы для запроса логов. Это предзаполнит конструктор запросов готовым к выполнению запросом по логам, что ускорит работу на странице Explore при анализе наблюдаемости.

Если вы используете OpenTelemetry, следует включить переключатель «**Use OTel**» и задать **default log table** равной `otel_logs`.
Это автоматически переопределит столбцы по умолчанию, чтобы использовать выбранную версию схемы OTel.

Хотя OpenTelemetry не является обязательным для логов, использование единого набора данных логов/трейсов помогает обеспечить более плавный сценарий наблюдаемости благодаря [data linking](./query-builder.md#data-links).

Пример экрана конфигурации логов:

<Image size="sm" img={config_logs} alt="Конфигурация логов" border />

Пример конфигурации логов в YAML:

```yaml
jsonData:
  logs:
    defaultDatabase: default # база данных для логов по умолчанию.
    defaultTable: otel_logs  # таблица для логов по умолчанию. Если вы используете OTel, установите значение "otel_logs".

    otelEnabled: false  # установите true, если OTel включен.
    otelVersion: latest # версия схемы OTel collector для использования. Версии отображаются в интерфейсе, но "latest" использует последнюю доступную версию в плагине.

    # Столбцы, выбираемые по умолчанию при открытии нового запроса логов. Игнорируется, если OTel включен.
    timeColumn:       <string> # основной столбец времени для лога.
    levelColumn:   <string> # уровень важности лога. Типичные значения: "INFO", "error" или "Debug".
    messageColumn: <string> # сообщение/содержимое лога.
```

### Трейсы

Чтобы ускорить [создание запросов для трейсов](./query-builder.md#traces), вы можете задать базу данных и таблицу по умолчанию, а также столбцы для запроса по трейсам. Это предварительно заполнит конструктор запросов готовым к выполнению запросом поиска по трейсам, что делает работу на странице Explore быстрее для задач наблюдаемости.

Если вы используете OpenTelemetry, следует включить переключатель &quot;**Use OTel**&quot; и задать **default trace table** как `otel_traces`.
Это автоматически переопределит используемые по умолчанию столбцы в соответствии с выбранной версией схемы OTel.
Хотя использование OpenTelemetry не является обязательным, эта функция работает лучше всего при использовании схемы OpenTelemetry для трейсов.

Пример экрана конфигурации трейсов:

<Image size="sm" img={config_traces} alt="Traces config" border />

Пример YAML‑конфигурации трейсов:

```yaml
jsonData:
  traces:
    defaultDatabase: default  # база данных трейсов по умолчанию.
    defaultTable: otel_traces # таблица трейсов по умолчанию. Если вы используете OTel, здесь следует указать "otel_traces".

    otelEnabled: false  # установите значение true, если OTel включён.
    otelVersion: latest # версия схемы OTel collector, которая будет использоваться. Доступные версии отображаются в интерфейсе, а значение "latest" выберет последнюю доступную версию в плагине.
```


    # Столбцы по умолчанию, выбираемые при открытии нового запроса трассировки. Будут игнорироваться, если OTel включён.
    traceIdColumn:       <string>    # столбец идентификатора трассировки (trace ID).
    spanIdColumn:        <string>    # столбец идентификатора спана (span ID).
    operationNameColumn: <string>    # столбец имени операции.
    parentSpanIdColumn:  <string>    # столбец идентификатора родительского спана.
    serviceNameColumn:   <string>    # столбец имени сервиса.
    durationTimeColumn:  <string>    # столбец длительности.
    durationUnitColumn:  <time unit> # единица измерения длительности. Можно установить значения "seconds", "milliseconds", "microseconds" или "nanoseconds". Для OTel по умолчанию используется "nanoseconds".
    startTimeColumn:     <string>    # столбец времени начала. Это основной временной столбец для спана трассировки.
    tagsColumn:          <string>    # столбец тегов. Ожидается тип Map.
    serviceTagsColumn:   <string>    # столбец тегов сервиса. Ожидается тип Map.

````

### Псевдонимы столбцов {#column-aliases}

Использование псевдонимов столбцов — удобный способ выполнять запросы к данным под другими именами и с другими типами.
С помощью псевдонимов вы можете взять вложенную схему и «сплющить» её, чтобы упростить выбор столбцов в Grafana.

Псевдонимы могут быть полезны, если:
- вы хорошо знаете свою схему и большинство её вложенных свойств/типов;
- вы храните данные в типах Map;
- вы храните JSON в виде строк;
- вы часто применяете функции для преобразования выбранных столбцов.

#### Столбцы ALIAS, определённые на уровне таблицы {#table-defined-alias-columns}

В ClickHouse встроена поддержка псевдонимов столбцов, и она работает с Grafana «из коробки».
Столбцы-псевдонимы можно определить непосредственно в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
````

В приведённом выше примере мы создаём псевдоним `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`.
Эти данные не хранятся на диске, как первый столбец, а вычисляются во время выполнения запроса.
Псевдонимы, определённые на уровне таблицы, не возвращаются при `SELECT *`, но это можно изменить в настройках сервера.

Дополнительную информацию см. в документации по типу столбца [ALIAS](/sql-reference/statements/create/table#alias).

#### Таблицы с псевдонимами столбцов {#column-alias-tables}

По умолчанию Grafana предлагает столбцы на основе результата команды `DESC table`.
В некоторых случаях вы можете захотеть полностью переопределить набор столбцов, которые видит Grafana.
Это помогает скрыть детали вашей схемы в Grafana при выборе столбцов, что может улучшить взаимодействие с пользователем в зависимости от сложности таблицы.

Преимущество такого подхода по сравнению с псевдонимами, определёнными в таблице, состоит в том, что вы можете легко обновлять их, не изменяя саму таблицу. В некоторых схемах число таких записей может достигать тысяч, что загромождает определение таблицы. Кроме того, это позволяет скрывать столбцы, которые пользователь должен игнорировать.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру столбцов:

```sql
CREATE TABLE aliases (
  `alias` String,  -- Имя псевдонима, отображаемое в селекторе столбцов Grafana
  `select` String, -- Синтаксис SELECT, используемый в генераторе SQL
  `type` String    -- Тип результирующего столбца, чтобы плагин мог скорректировать параметры UI в соответствии с типом данных.
)
```

Ниже показано, как можно воспроизвести поведение столбца `ALIAS`, используя таблицу псевдонимов:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

Затем мы можем настроить использование этой таблицы в Grafana. Учтите, что имя таблицы может быть любым, а сама таблица может быть определена и в отдельной базе данных:

<Image
  size='md'
  img={alias_table_config_example}
  alt='Пример конфигурации таблицы псевдонимов'
  border
/>

Теперь Grafana будет использовать результаты из таблицы псевдонимов вместо результатов `DESC example_table`:

<Image
  size='md'
  img={alias_table_select_example}
  alt='Пример выбора из таблицы псевдонимов'
  border
/>

Оба типа псевдонимов можно использовать для выполнения сложных преобразований типов или извлечения полей из JSON.


## Все параметры YAML

Ниже перечислены все параметры конфигурации YAML, доступные в этом плагине.
Для некоторых полей приведены примерные значения, для других — только тип поля.

См. [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации об автоматическом создании и настройке источников данных с помощью YAML.

```yaml
datasources:
  - name: Пример ClickHouse
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
        value: простое текстовое значение
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
      secureHttpHeaders.X-Example-Secure-Header: значение защищенного заголовка
```
