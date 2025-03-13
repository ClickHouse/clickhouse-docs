---
sidebar_label: Конфигурация Плагина
sidebar_position: 3
slug: /integrations/grafana/config
description: Опции конфигурации для плагина источника данных ClickHouse в Grafana
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';


# Настройка источника данных ClickHouse в Grafana

Самый простой способ изменить конфигурацию - это использовать интерфейс Grafana на странице конфигурации плагина, но источники данных также могут быть [предоставлены с помощью файла YAML](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

Эта страница показывает список опций, доступных для конфигурации в плагине ClickHouse, а также фрагменты конфигурации для тех, кто предоставляет источник данных с помощью YAML.

Для быстрого обзора всех опций полный список конфигурационных опций можно найти [здесь](#all-yaml-options).

## Общие настройки {#common-settings}

Пример экрана конфигурации:
<img src={config_common} class="image" alt="Пример защищенной конфигурации" />

Пример конфигурации YAML для общих настроек:
```yaml
jsonData:
  host: 127.0.0.1 # (обязательный) адрес сервера.
  port: 9000      # (обязательный) порт сервера. Для native по умолчанию 9440 защищенный и 9000 незащищенный. Для HTTP по умолчанию 8443 защищенный и 8123 незащищенный.

  protocol: native # (обязательный) протокол, используемый для подключения. Может быть установлен на "native" или "http".
  secure: false    # установите в true, если соединение защищенное.

  username: default # имя пользователя, используемое для аутентификации.

  tlsSkipVerify:     <boolean> # пропускает проверку TLS, если установлено в true.
  tlsAuth:           <boolean> # установите в true, чтобы включить аутентификацию клиента TLS.
  tlsAuthWithCACert: <boolean> # установите в true, если предоставлен сертификат CA. Необходим для проверки самоподписанных сертификатов TLS.

secureJsonData:
  password: secureExamplePassword # пароль, используемый для аутентификации.

  tlsCACert:     <string> # TLS CA сертификат
  tlsClientCert: <string> # TLS клиентский сертификат
  tlsClientKey:  <string> # TLS клиентский ключ
```

Обратите внимание, что свойство `version` добавляется, когда конфигурация сохраняется из интерфейса. Это показывает версию плагина, с которой была сохранена конфигурация.

### HTTP Протокол {#http-protocol}

Дополнительные настройки будут отображены, если вы выберете подключение через HTTP протокол.

<img src={config_http} class="image" alt="Дополнительные опции конфигурации HTTP" />

#### HTTP Путь {#http-path}

Если ваш HTTP-сервер доступен по другому URL-адресу, вы можете добавить это здесь.

```yaml
jsonData:
  # исключает первый слэш
  path: additional/path/example
```

#### Пользовательские HTTP Заголовки {#custom-http-headers}

Вы можете добавить пользовательские заголовки к запросам, отправляемым на ваш сервер.

Заголовки могут быть обычным текстом или защищенными.
Все ключи заголовков хранятся в открытом виде, в то время как защищенные значения заголовков сохраняются в защищенной конфигурации (аналогично полю `password`).

:::warning Защищенные значения через HTTP
Хотя защищенные значения заголовков хранятся в защищенной конфигурации, значение все равно будет отправлено через HTTP, если защищенное соединение отключено.
:::

Пример YAML для обычных/защищенных заголовков:
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
  secureHttpHeaders.X-Example-Secure-Header: защищенное значение заголовка
```

## Дополнительные настройки {#additional-settings}

Эти дополнительные настройки являются необязательными.

<img src={config_additional} class="image" alt="Пример дополнительных настроек" />

Пример YAML:
```yaml
jsonData:
  defaultDatabase: default # база данных по умолчанию, загружаемая генератором запросов. По умолчанию "default".
  defaultTable: <string>   # таблица по умолчанию, загружаемая генератором запросов.

  dialTimeout: 10    # тайм-аут соединения с сервером, в секундах. По умолчанию "10".
  queryTimeout: 60   # тайм-аут запроса при выполнении запроса, в секундах. По умолчанию 60. Это требует разрешений у пользователя, если вы получили ошибку разрешения, попробуйте установить его в "0", чтобы отключить.
  validateSql: false # если установить в true, будет проверяться SQL в редакторе SQL.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) глубоко интегрирован в плагин.
Данные OpenTelemetry могут быть экспортированы в ClickHouse с помощью нашего [экспортера плагина](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
Для наилучшего использования рекомендуется настроить OTel как для [логов](#logs), так и для [трассировок](#traces).

Также необходимо настроить эти значения по умолчанию для включения [ссылок на данные](./query-builder.md#data-links), функции, которая позволяет создавать мощные рабочие процессы наблюдаемости.

### Логи {#logs}

Чтобы ускорить [создание запросов для логов](./query-builder.md#logs), вы можете установить базу данных/таблицу по умолчанию, а также столбцы для запроса логов. Это предзагрузит генератор запросов с исполняемым запросом логов, что ускорит просмотр на странице исследования для наблюдаемости.

Если вы используете OpenTelemetry, вы должны включить переключатель "**Использовать OTel**" и установить **таблицу логов по умолчанию** на `otel_logs`.
Это автоматически переопределит столбцы по умолчанию, чтобы использовать выбранную версию схемы OTel.

Хотя OpenTelemetry не требуется для логов, использование единого набора данных логов/трассировок помогает обеспечить более гладкий рабочий процесс наблюдаемости с [ссылками на данные](./query-builder.md#data-links).

Пример экрана конфигурации логов:
<img src={config_logs} class="image" alt="Конфигурация логов" />

Пример конфигурации логов YAML:
```yaml
jsonData:
  logs:
    defaultDatabase: default # база данных логов по умолчанию.
    defaultTable: otel_logs  # таблица логов по умолчанию. Если вы используете OTel, это должно быть установлено на "otel_logs".

    otelEnabled: false  # установите в true, если OTel включен.
    otelVersion: latest # версия схемы сборщика otel, которая будет использоваться. Версии отображаются в интерфейсе, но "latest" будет использовать последнюю доступную версию в плагине.

    # Столбцы по умолчанию, которые будут выбраны при открытии нового запроса логов. Будет проигнорировано, если OTel включен.
    timeColumn:       <string> # основной временной столбец для лога.
    levelColumn:   <string> # уровень/серьезность лога. Значения обычно выглядят как "INFO", "error" или "Debug".
    messageColumn: <string> # сообщение/содержимое лога.
```

### Трассировки {#traces}

Чтобы ускорить [создание запросов для трассировок](./query-builder.md#traces), вы можете установить базу данных/таблицу по умолчанию, а также столбцы для запроса трассировок. Это предзагрузит генератор запросов с исполняемым поисковым запросом трассировок, что ускорит просмотр на странице исследования для наблюдаемости.

Если вы используете OpenTelemetry, вы должны включить переключатель "**Использовать OTel**" и установить **таблицу трассировок по умолчанию** на `otel_traces`.
Это автоматически переопределит столбцы по умолчанию, чтобы использовать выбранную версию схемы OTel.
Хотя OpenTelemetry не требуется, эта функция работает лучше всего, когда используется его схема для трассировок.

Пример экрана конфигурации трассировок:
<img src={config_traces} class="image" alt="Конфигурация трассировок" />

Пример конфигурации трассировок YAML:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # база данных трассировок по умолчанию.
    defaultTable: otel_traces # таблица трассировок по умолчанию. Если вы используете OTel, это должно быть установлено на "otel_traces".

    otelEnabled: false  # установите в true, если OTel включен.
    otelVersion: latest # версия схемы сборщика otel, которая будет использоваться. Версии отображаются в интерфейсе, но "latest" будет использовать последнюю доступную версию в плагине.

    # Столбцы по умолчанию, которые будут выбраны при открытии нового запроса трассировок. Будет проигнорировано, если OTel включен.
    traceIdColumn:       <string>    # столбец ID трассировки.
    spanIdColumn:        <string>    # столбец ID спана.
    operationNameColumn: <string>    # столбец имени операции.
    parentSpanIdColumn:  <string>    # столбец ID родительского спана.
    serviceNameColumn:   <string>    # столбец имени сервиса.
    durationTimeColumn:  <string>    # столбец времени длительности.
    durationUnitColumn:  <time unit> # единица времени длительности. Может быть установлена на "seconds", "milliseconds", "microseconds" или "nanoseconds". Для OTel по умолчанию "nanoseconds".
    startTimeColumn:     <string>    # столбец времени начала. Это основной временной столбец для спана трассировки.
    tagsColumn:          <string>    # столбец тегов. توقعется, что это будет карта.
    serviceTagsColumn:   <string>    # столбец тегов сервиса. توقعется, что это будет карта.
```

### Псевдонимы столбцов {#column-aliases}

Псевдонимы столбцов - это удобный способ запрашивать ваши данные под другими именами и типами.
С помощью псевдонимизации вы можете взять вложенную схему и развернуть ее, чтобы ее можно было легко выбрать в Grafana.

Псевдонимизация может быть вам актуальна, если:
- Вы знаете свою схему и большинство ее вложенных свойств/типов.
- Вы храните свои данные в типах Map.
- Вы храните JSON в виде строк.
- Вы часто применяете функции для преобразования выбранных вами столбцов.

#### Псевдонимизированные столбцы, определенные в таблице {#table-defined-alias-columns}

ClickHouse имеет встроенную псевдонимизацию столбцов и работает с Grafana из коробки.
Псевдонимированные столбцы могут быть определены непосредственно в таблице.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

В приведенном выше примере мы создаем псевдоним под названием `TimestampDate`, который преобразует временную метку в наносекундах в тип `Date`.
Эти данные не хранятся на диске, как первый столбец, они рассчитываются во время выполнения запроса.
Псевдонимы, определенные в таблице, не будут возвращены с `SELECT *`, но это можно настроить в настройках сервера.

Для получения дополнительной информации читайте документацию по [ALIAS](/sql-reference/statements/create/table#alias) типу столбца.

#### Таблицы псевдонимов столбцов {#column-alias-tables}

По умолчанию Grafana будет предоставлять предложения по столбцам на основе ответа от `DESC table`.
В некоторых случаях вы можете захотеть полностью переопределить столбцы, которые видит Grafana.
Это помогает скрыть вашу схему в Grafana при выборе столбцов, что может улучшить пользовательский опыт в зависимости от сложности вашей таблицы.

Преимущество этого подхода перед псевдонимами, определенными в таблице, заключается в том, что вы можете легко обновлять их, не изменяя свою таблицу. В некоторых схемах это может быть тысячи записей, что может загромождать определение основной таблицы. Это также позволяет скрыть столбцы, которые вы хотите, чтобы пользователь игнорировал.

Grafana требует, чтобы таблица псевдонимов имела следующую структуру столбцов:
```sql
CREATE TABLE aliases (
  `alias` String,  -- Имя псевдонима, как видимо в селекторе столбцов Grafana
  `select` String, -- Синтаксис SELECT, используемый в генераторе SQL
  `type` String    -- Тип результирующего столбца, чтобы плагин мог изменить параметры UI в соответствии с типом данных.
)
```

Вот как мы могли бы воспроизвести поведение столбца `ALIAS`, используя таблицу псевдонимов:
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Сохранить оригинальный столбец из таблицы (необязательно)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Добавить новый столбец, который преобразует TimestampNanos в Date
```

Теперь мы можем настроить эту таблицу для использования в Grafana. Обратите внимание, что имя может быть любым, или даже определено в отдельной базе данных:
<img src={alias_table_config_example} class="image" alt="Пример конфигурации таблицы псевдонимов" />

Теперь Grafana будет видеть результаты таблицы псевдонимов вместо результатов от `DESC example_table`:
<img src={alias_table_select_example} class="image" alt="Пример выбора таблицы псевдонимов" />

Оба типа псевдонимизации могут использоваться для выполнения сложных преобразований типов или извлечения полей JSON.

## Все опции YAML {#all-yaml-options}

Это все параметры конфигурации YAML, доступные через плагин.
Некоторые поля имеют пример значений, в то время как другие просто показывают тип поля.

Смотрите [документацию Grafana](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) для получения дополнительной информации о предоставлении источников данных с использованием YAML.

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
      secureHttpHeaders.X-Example-Secure-Header: защищенное значение заголовка
```
