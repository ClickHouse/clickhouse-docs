---
sidebar_label: 'Настройка плагина'
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

Самый простой способ изменить конфигурацию — это использовать интерфейс Grafana на странице конфигурации плагина, но источники данных также могут быть [предоставлены с помощью YAML файла](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

На этой странице представлен обзор доступных опций для настройки в плагине ClickHouse, а также фрагменты конфигурации для тех, кто предоставляет источник данных с помощью YAML.

Для быстрого обзора всех опций полный список параметров конфигурации можно найти [здесь](#all-yaml-options).

## Общие настройки {#common-settings}

Пример экрана конфигурации:
<Image size="sm" img={config_common} alt="Пример безопасной native конфигурации" border />

Пример конфигурации YAML для общих настроек:
```yaml
jsonData:
  host: 127.0.0.1 # (обязательно) адрес сервера.
  port: 9000      # (обязательно) порт сервера. Для native по умолчанию 9440 безопасный и 9000 небезопасный. Для HTTP по умолчанию 8443 безопасный и 8123 небезопасный.

  protocol: native # (обязательно) протокол, используемый для подключения. Может быть установлен на "native" или "http".
  secure: false    # установить в true, если соединение безопасное.

  username: default # имя пользователя, используемое для аутентификации.

  tlsSkipVerify:     <boolean> # пропускает проверку TLS, когда установлено в true.
  tlsAuth:           <boolean> # установить в true, чтобы включить аутентификацию клиента TLS.
  tlsAuthWithCACert: <boolean> # установить в true, если CA сертификат предоставлен. Необходим для проверки самоподписанных TLS сертификатов.

secureJsonData:
  password: secureExamplePassword # пароль, используемый для аутентификации.

  tlsCACert:     <string> # TLS CA сертификат
  tlsClientCert: <string> # TLS клиентский сертификат
  tlsClientKey:  <string> # TLS клиентский ключ
```

Обратите внимание, что свойство `version` добавляется, когда конфигурация сохраняется из интерфейса. Это показывает версию плагина, с которой была сохранена конфигурация.

### HTTP Протокол {#http-protocol}

Больше настроек будет показано, если вы выберете подключение через HTTP протокол.

<Image size="md" img={config_http} alt="Дополнительные параметры конфигурации HTTP" border />

#### HTTP Путь {#http-path}

Если ваш HTTP сервер доступен по другому URL пути, вы можете добавить его здесь.

```yaml
jsonData:
  # исключает первый слэш
  path: additional/path/example
```

#### Пользовательские HTTP Заголовки {#custom-http-headers}

Вы можете добавить пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть как простым текстом, так и защищенными.
Все ключи заголовков хранятся в виде простого текста, в то время как защищенные значения заголовков сохраняются в безопасной конфигурации (по аналогии с полем `password`).

:::warning Защищенные значения по HTTP
Хотя защищенные значения заголовков хранятся безопасно в конфигурации, значение все равно будет отправлено по HTTP, если безопасное соединение отключено.
:::

Пример YAML для простых/защищенных заголовков:
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

  dialTimeout: 10    # тайм-аут соединения с сервером в секундах. По умолчанию "10".
  queryTimeout: 60   # тайм-аут запроса при выполнении запроса в секундах. По умолчанию 60. Это требует разрешений у пользователя, если вы получите ошибку разрешения, попробуйте установить его на "0", чтобы отключить.
  validateSql: false # если установить в true, будет проверяться SQL в редакторе SQL.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) глубоко интегрирован в плагин.
Данные OpenTelemetry могут быть экспортированы в ClickHouse с помощью нашего [экспортера](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
Для лучшего использования рекомендуется настроить OTel как для [логов](#logs), так и для [трассировок](#traces).

Также необходимо настроить эти параметры по умолчанию для включения [ссылок данных](./query-builder.md#data-links), функции, которая позволяет использовать мощные рабочие процессы наблюдаемости.

### Логи {#logs}

Чтобы ускорить [создание запросов для логов](./query-builder.md#logs), вы можете установить базу данных/таблицу по умолчанию, а также столбцы для запроса логов. Это предварительно загрузит конструктор запросов с выполнимым запросом логов, что ускоряет просмотр на странице исследования для наблюдаемости.

Если вы используете OpenTelemetry, вы должны включить переключатель "**Использовать OTel**" и установить **таблицу логов по умолчанию** на `otel_logs`.
Это автоматически переопределит столбцы по умолчанию, чтобы использовать выбранную версию схемы OTel.

Хотя OpenTelemetry не требуется для логов, использование единого набора данных по логам/трассировкам помогает обеспечить более плавный рабочий процесс наблюдаемости с [ссылками данных](./query-builder.md#data-links).

Пример экрана конфигурации логов:
<Image size="sm" img={config_logs} alt="Конфигурация логов" border />

Пример конфигурации логов YAML:
```yaml
jsonData:
  logs:
    defaultDatabase: default # база данных логов по умолчанию.
    defaultTable: otel_logs  # таблица логов по умолчанию. Если вы используете OTel, это должно быть установлено на "otel_logs".

    otelEnabled: false  # установить в true, если OTel включен.
    otelVersion: latest # версия схемы коллектора otel, которая будет использоваться. Версии отображаются в интерфейсе, но "latest" будет использовать последнюю доступную версию в плагине.

    # Столбцы по умолчанию, которые будут выбраны при открытии нового запроса логов. Будут проигнорированы, если OTel включен.
    timeColumn:       <string> # основной столбец времени для лога.
    levelColumn:   <string> # уровень/серьезность лога. Значения обычно выглядят как "INFO", "error" или "Debug".
    messageColumn: <string> # сообщение/содержимое лога.
```

### Трассировки {#traces}

Чтобы ускорить [создание запросов для трассировок](./query-builder.md#traces), вы можете установить базу данных/таблицу по умолчанию, а также столбцы для запроса трассировок. Это предварительно загрузит конструктор запросов с выполнимым запросом поиска трассировок, что ускоряет просмотр на странице исследования для наблюдаемости.

Если вы используете OpenTelemetry, вы должны включить переключатель "**Использовать OTel**" и установить **таблицу трассировок по умолчанию** на `otel_traces`.
Это автоматически переопределит столбцы по умолчанию, чтобы использовать выбранную версию схемы OTel.
Хотя OpenTelemetry не требуется, эта функция работает лучше всего, когда используется его схема для трассировок.

Пример экрана конфигурации трассировок:
<Image size="sm" img={config_traces} alt="Конфигурация трассировок" border />

Пример конфигурации трассировок YAML:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # база данных трассировок по умолчанию.
    defaultTable: otel_traces # таблица трассировок по умолчанию. Если вы используете OTel, это должно быть установлено на "otel_traces".

    otelEnabled: false  # установить в true, если OTel включен.
    otelVersion: latest # версия схемы коллектора otel, которая будет использоваться. Версии отображаются в интерфейсе, но "latest" будет использовать последнюю доступную версию в плагине.

    # Столбцы по умолчанию, которые будут выбраны при открытии нового запроса трассировок. Будут проигнорированы, если OTel включен.
    traceIdColumn:       <string>    # столбец ID трассы.
    spanIdColumn:        <string>    # столбец ID спана.
    operationNameColumn: <string>    # столбец имени операции.
    parentSpanIdColumn:  <string>    # столбец ID родительского спана.
    serviceNameColumn:   <string>    # столбец имени службы.
    durationTimeColumn:  <string>    # столбец времени продолжительности.
    durationUnitColumn:  <time unit> # единица времени продолжительности. Может быть установлена на "seconds", "milliseconds", "microseconds" или "nanoseconds". Для OTel по умолчанию "nanoseconds".
    startTimeColumn:     <string>    # столбец времени начала. Это основной столбец времени для спана трассировки.
    tagsColumn:          <string>    # столбец меток. Ожидается, что это будет тип карты.
    serviceTagsColumn:   <string>    # столбец меток службы. Ожидается, что это будет тип карты.
```

### Псевдонимы столбцов {#column-aliases}

Псевдонимы столбцов — это удобный способ запрашивать ваши данные под разными именами и типами.
С помощью псевдонимов вы можете взять вложенную схему и упростить ее, чтобы ее можно было легко выбирать в Grafana.

Псевдонимы могут быть актуальны для вас, если:
- Вы знаете свою схему и большинство ее вложенных свойств/типов
- Вы храните свои данные в типах Map
- Вы храните JSON в виде строк
- Вы часто применяете функции для преобразования выбранных вами столбцов

#### ПСЕВДОНИМЫ ОПРЕДЕЛЕННЫЕ В ТАБЛИЦЕ {#table-defined-alias-columns}

ClickHouse имеет встроенные псевдонимы столбцов и работает с Grafana из коробки.
Псевдонимы столбцов могут быть определены непосредственно в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

В приведенном выше примере мы создаем псевдоним под названием `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`.
Эти данные не хранятся на диске, как первый столбец, они вычисляются во время выполнения запроса.
Псевдонимы, определенные в таблице, не будут возвращены с помощью `SELECT *`, но это можно настроить в настройках сервера.

Для получения дополнительной информации ознакомьтесь с документацией по типу столбца [ALIAS](/sql-reference/statements/create/table#alias).

#### Таблицы псевдонимов столбцов {#column-alias-tables}

По умолчанию Grafana будет предоставлять предложения по столбцам на основе ответа от `DESC table`.
В некоторых случаях вы можете захотеть полностью переопределить столбцы, которые видит Grafana.
Это помогает скрыть вашу схему в Grafana при выборе столбцов, что может улучшить пользовательский опыт в зависимости от сложности вашей таблицы.

Преимущество этого подхода перед псевдонимами, определенными в таблице, заключается в том, что вы можете легко обновлять их, не внося изменения в свою таблицу. В некоторых схемах это может быть тысяча записей, что может загромождать определение базовой таблицы. Это также позволяет скрывать столбцы, которые вы хотите, чтобы пользователь игнорировал.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру столбцов:
```sql
CREATE TABLE aliases (
  `alias` String,  -- Имя псевдонима, как видно в селекторе столбцов Grafana
  `select` String, -- Синтаксис SELECT, который будет использоваться в генераторе SQL
  `type` String    -- Тип результирующего столбца, чтобы плагин мог изменить параметры пользовательского интерфейса в соответствии с типом данных.
)
```

Вот как мы могли бы воспроизвести поведение столбца `ALIAS`, используя таблицу псевдонимов:
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Сохраняем оригинальный столбец из таблицы (по желанию)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Добавляем новый столбец, который преобразует TimestampNanos в Date
```

Мы можем затем настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым или даже определено в отдельной базе данных:
<Image size="md" img={alias_table_config_example} alt="Пример конфигурации таблицы псевдонимов" border />

Теперь Grafana будет видеть результаты таблицы псевдонимов вместо результатов от `DESC example_table`:
<Image size="md" img={alias_table_select_example} alt="Пример выбора таблицы псевдонимов" border />

Оба типа псевдонимов могут быть использованы для выполнения сложных преобразований типов или извлечения полей JSON.

## Все опции YAML {#all-yaml-options}

Это все параметры конфигурации YAML, предоставляемые плагином.
Некоторые поля имеют примерные значения, в то время как другие просто показывают тип поля.

Смотрите [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации о предоставлении источников данных с помощью YAML.

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
