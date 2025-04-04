---
sidebar_label: 'Настройки плагина'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Опции конфигурации для плагина источника данных ClickHouse в Grafana'
title: 'Настройка источника данных ClickHouse в Grafana'
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

Самый простой способ изменить настройки конфигурации — это сделать это в пользовательском интерфейсе Grafana на странице конфигурации плагина, но источники данных также могут быть [предоставлены с помощью файла YAML](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

Эта страница показывает список параметров, доступных для настройки в плагине ClickHouse, а также фрагменты конфигурации для тех, кто предоставляет источник данных с помощью YAML.

Для быстрого обзора всех опций полный список параметров конфигурации можно найти [здесь](#all-yaml-options).

## Общие настройки {#common-settings}

Пример экрана конфигурации:
<Image size="sm" img={config_common} alt="Пример защищенной нативной конфигурации" border />

Пример конфигурации YAML для общих настроек:
```yaml
jsonData:
  host: 127.0.0.1 # (обязательный) адрес сервера.
  port: 9000      # (обязательный) порт сервера. Для нативного — по умолчанию 9440 защищенный и 9000 незащищенный. Для HTTP — по умолчанию 8443 защищенный и 8123 незащищенный.

  protocol: native # (обязательный) протокол, используемый для подключения. Может быть установлен на "native" или "http".
  secure: false    # установите в true, если соединение защищенное.

  username: default # имя пользователя, используемое для аутентификации.

  tlsSkipVerify:     <boolean> # пропускает проверку TLS, если установлено в true.
  tlsAuth:           <boolean> # установите в true для включения аутентификации клиента TLS.
  tlsAuthWithCACert: <boolean> # установите в true, если предоставлен сертификат CA. Требуется для проверки самоподписанных сертификатов TLS.

secureJsonData:
  password: secureExamplePassword # пароль, используемый для аутентификации.

  tlsCACert:     <string> # сертификат CA TLS
  tlsClientCert: <string> # сертификат клиента TLS
  tlsClientKey:  <string> # ключ клиента TLS
```

Обратите внимание, что свойство `version` добавляется, когда конфигурация сохраняется из пользовательского интерфейса. Это показывает версию плагина, с которой была сохранена конфигурация.

### Протокол HTTP {#http-protocol}

Больше настроек будет отображено, если вы выберете подключение через протокол HTTP.

<Image size="md" img={config_http} alt="Дополнительные параметры конфигурации HTTP" border />

#### HTTP Путь {#http-path}

Если ваш HTTP сервер открыт по другому URL пути, вы можете добавить его здесь.

```yaml
jsonData:
  # исключает первый слэш
  path: additional/path/example
```

#### Пользовательские HTTP Заголовки {#custom-http-headers}

Вы можете добавить пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть как обычными текстовыми, так и защищенными. Все ключи заголовков хранятся в обычном текстовом формате, в то время как защищенные значения заголовков сохраняются в защищенной конфигурации (аналогично полю `password`).

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
    # "value" исключен
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
  defaultDatabase: default # база данных по умолчанию, загружаемая конструктором запросов. По умолчанию "default".
  defaultTable: <string>   # таблица по умолчанию, загружаемая конструктором запросов.

  dialTimeout: 10    # тайм-аут подключения к серверу, в секундах. По умолчанию "10".
  queryTimeout: 60   # тайм-аут выполнения запроса, в секундах. По умолчанию 60. Это требует разрешений для пользователя, если вы получите ошибку разрешения, попробуйте установить его в "0", чтобы отключить.
  validateSql: false # при установленном значении true будет проверять SQL в редакторе SQL.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) глубоко интегрирован в плагин. Данные OpenTelemetry можно экспортировать в ClickHouse с помощью нашего [плагина экстрактора](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter). Для наилучшего использования рекомендуется настроить OTel как для [логов](#logs), так и для [трейсов](#traces).

Также необходимо настроить эти параметры для включения [ссылок на данные](./query-builder.md#data-links), функции, которая позволяет создавать мощные рабочие процессы мониторинга.

### Логи {#logs}

Чтобы ускорить [создание запросов для логов](./query-builder.md#logs), вы можете установить базу данных/таблицу по умолчанию, а также колонки для запроса логов. Это предзагрузит конструктор запросов с выполнимым запросом логов, что сделает просмотр на странице поиска быстрее для мониторинга.

Если вы используете OpenTelemetry, вы должны включить переключатель "**Использовать OTel**" и установить **таблицу логов по умолчанию** на `otel_logs`. Это автоматически переопределит стандартные колонки, чтобы использовать выбранную версию схемы OTel.

Хотя OpenTelemetry не является обязательным для логов, использование единого набора данных логов/трейсов способствует более плавному рабочему процессу мониторинга с использованием [ссылок на данные](./query-builder.md#data-links).

Пример экрана конфигурации логов:
<Image size="sm" img={config_logs} alt="Конфигурация логов" border />

Пример YAML для конфигурации логов:
```yaml
jsonData:
  logs:
    defaultDatabase: default # база данных логов по умолчанию.
    defaultTable: otel_logs  # таблица логов по умолчанию. Если вы используете OTel, это должно быть установлено на "otel_logs".

    otelEnabled: false  # установите в true, если OTel включен.
    otelVersion: latest # версию схемы коллектора otel, которая будет использоваться. Версии отображаются в пользовательском интерфейсе, но "latest" будет использовать последнюю доступную версию в плагине.

    # Стандартные колонки, которые будут выбраны при открытии нового запроса логов. Будет проигнорировано, если OTel активен.
    timeColumn:       <string> # основная колонка времени для лога.
    levelColumn:   <string> # уровень/серьезность лога. Значения обычно выглядят как "INFO", "error" или "Debug".
    messageColumn: <string> # сообщение/содержимое лога.
```

### Трейсы {#traces}

Чтобы ускорить [создание запросов для трейсов](./query-builder.md#traces), вы можете установить базу данных/таблицу по умолчанию, а также колонки для запроса трейсов. Это предзагрузит конструктор запросов с выполнимым запросом для поиска трейсов, что сделает просмотр на странице поиска быстрее для мониторинга.

Если вы используете OpenTelemetry, вы должны включить переключатель "**Использовать OTel**" и установить **таблицу трейсов по умолчанию** на `otel_traces`. Это автоматически переопределит стандартные колонки для использования выбранной версии схемы OTel. Хотя OpenTelemetry не является обязательным, эта функция работает лучше всего при использовании его схемы для трейсов.

Пример экрана конфигурации трейсов:
<Image size="sm" img={config_traces} alt="Конфигурация трейсов" border />

Пример YAML для конфигурации трейсов:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # база данных трейсов по умолчанию.
    defaultTable: otel_traces # таблица трейсов по умолчанию. Если вы используете OTel, это должно быть установлено на "otel_traces".

    otelEnabled: false  # установите в true, если OTel включен.
    otelVersion: latest # версия схемы коллектора otel, которая будет использоваться. Версии отображаются в пользовательском интерфейсе, но "latest" будет использовать последнюю доступную версию в плагине.

    # Стандартные колонки, которые будут выбраны при открытии нового запроса трейсов. Будет проигнорировано, если OTel активен.
    traceIdColumn:       <string>    # колонка ID трейса.
    spanIdColumn:        <string>    # колонка ID спана.
    operationNameColumn: <string>    # колонка имени операции.
    parentSpanIdColumn:  <string>    # колонка ID родительского спана.
    serviceNameColumn:   <string>    # колонка имени сервиса.
    durationTimeColumn:  <string>    # колонка времени продолжительности.
    durationUnitColumn:  <time unit> # единица времени продолжительности. Может быть установлена на "seconds", "milliseconds", "microseconds" или "nanoseconds". Для OTel по умолчанию установлено "nanoseconds".
    startTimeColumn:     <string>    # колонка времени начала. Это основная колонка времени для спана трейса.
    tagsColumn:          <string>    # колонка тегов. Ожидается, что это тип map.
    serviceTagsColumn:   <string>    # колонка тегов сервиса. Ожидается, что это тип map.
```

### Псевдонимы колонок {#column-aliases}

Псевдонимы колонок — это удобный способ запрашивать ваши данные под разными именами и типами. С помощью псевдонимов вы можете взять вложенную схему и разровнять ее, чтобы ее легко можно было выбрать в Grafana.

Псевдонимы могут быть актуальны для вас, если:
- Вы знаете свою схему и большинство ее вложенных свойств/типов
- Вы храните свои данные в типах Map
- Вы храните JSON в виде строк
- Вы часто применяете функции для преобразования выбираемых вами колонок

#### Псевдонимы колонок, определенные таблицей {#table-defined-alias-columns}

ClickHouse имеет встроенные псевдонимы колонок и работает с Grafana из коробки. Псевдонимы колонок можно определить непосредственно в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

В приведенном выше примере мы создаем псевдоним под названием `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`. Эти данные не сохраняются на диске, как первая колонка, они вычисляются во время запроса. Псевдонимы, определенные в таблице, не будут возвращены с `SELECT *`, но это можно настроить в настройках сервера.

Для получения дополнительной информации ознакомьтесь с документацией для типа колонки [ALIAS](/sql-reference/statements/create/table#alias).

#### Таблицы псевдонимов колонок {#column-alias-tables}

По умолчанию Grafana будет предлагать колонки на основе ответа от `DESC table`. В некоторых случаях вы можете захотеть полностью переопределить колонки, которые видит Grafana. Это помогает скрыть вашу схему в Grafana при выборе колонок, что может улучшить восприятие пользователя в зависимости от сложности вашей таблицы.

Преимущество этого по сравнению с псевдонимами, определенными в таблице, заключается в том, что вы можете легко обновлять их, не придется изменять вашу таблицу. В некоторых схемах это может быть создано на тысячи записей, что может засорить определение исходной таблицы. Это также позволяет скрыть колонки, которые вы хотите, чтобы пользователь игнорировал.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру колонок:
```sql
CREATE TABLE aliases (
  `alias` String,  -- Имя псевдонима, как видно в селекторе колонок Grafana
  `select` String, -- Синтаксис SELECT, который нужно использовать в генераторе SQL
  `type` String    -- Тип результирующей колонки, чтобы плагин мог модифицировать параметры интерфейса в соответствии с типом данных.
)
```

Вот как мы можем воспроизвести поведение колонки `ALIAS`, используя таблицу псевдонимов:
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Сохраняем оригинальную колонку из таблицы (необязательно)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Добавляем новую колонку, которая преобразует TimestampNanos в Date
```

Мы можем затем настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым, или даже определено в отдельной базе данных:
<Image size="md" img={alias_table_config_example} alt="Пример конфигурации таблицы псевдонимов" border />

Теперь Grafana будет видеть результаты таблицы псевдонимов вместо результатов от `DESC example_table`:
<Image size="md" img={alias_table_select_example} alt="Пример выбора таблицы псевдонимов" border />

Оба типа псевдонимов могут использоваться для выполнения сложных преобразований типов или извлечения полей JSON.

## Все YAML Опции {#all-yaml-options}

Это все параметры конфигурации YAML, предоставленные плагином. Некоторые поля имеют примерные значения, в то время как другие просто показывают тип поля.

Смотрите [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации о предоставлении источников данных с помощью YAML.

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
