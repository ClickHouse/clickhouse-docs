---
description: 'Документация по поддержке протокола Prometheus в ClickHouse'
sidebar_label: 'Протоколы Prometheus'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Протоколы Prometheus'
doc_type: 'reference'
---



# Протоколы Prometheus



## Экспорт метрик {#expose}

:::note
Если вы используете ClickHouse Cloud, вы можете экспортировать метрики в Prometheus с помощью [интеграции Prometheus](/integrations/prometheus).
:::

ClickHouse может предоставлять собственные метрики для сбора Prometheus:

````xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
    <histograms>true</histograms>
    <dimensional_metrics>true</dimensional_metrics>
</prometheus>

Секция `<prometheus.handlers>` может использоваться для создания более расширенных обработчиков.
Эта секция аналогична [<http_handlers>](/interfaces/http), но работает для протоколов prometheus:

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
````

Настройки:

| Название                     | По умолчанию | Описание                                                                                                                                                                               |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | нет       | Порт для предоставления метрик по протоколу.                                                                                                                                           |
| `endpoint`                   | `/metrics` | HTTP-эндпоинт для сбора метрик сервером prometheus. Начинается с `/`. Не должен использоваться вместе с секцией `<handlers>`.                                                               |
| `url` / `headers` / `method` | нет       | Фильтры, используемые для поиска подходящего обработчика для запроса. Аналогичны полям с теми же названиями в секции [`<http_handlers>`](/interfaces/http).                                    |
| `metrics`                    | true       | Предоставлять метрики из таблицы [system.metrics](/operations/system-tables/metrics).                                                                                                        |
| `asynchronous_metrics`       | true       | Предоставлять текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).                                                               |
| `events`                     | true       | Предоставлять метрики из таблицы [system.events](/operations/system-tables/events).                                                                                                          |
| `errors`                     | true       | Предоставлять количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из таблицы [system.errors](/operations/system-tables/errors). |
| `histograms`                 | true       | Предоставлять метрики гистограмм из таблицы [system.histogram_metrics](/operations/system-tables/histogram_metrics)                                                                                     |
| `dimensional_metrics`        | true       | Предоставлять размерные метрики из таблицы [system.dimensional_metrics](/operations/system-tables/dimensional_metrics)                                                                               |

Проверка (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```


## Протокол Remote-write {#remote-write}

ClickHouse поддерживает протокол [remote-write](https://prometheus.io/docs/specs/remote_write_spec/).
Данные, полученные по этому протоколу, записываются в таблицу [TimeSeries](/engines/table-engines/special/time_series)
(которую необходимо создать заранее).

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

Настройки:

| Название                     | По умолчанию | Описание                                                                                                                                                                                      |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | Порт для обслуживания протокола `remote-write`.                                                                                                                                                    |
| `url` / `headers` / `method` | none    | Фильтры для поиска соответствующего обработчика запроса. Аналогичны полям с теми же названиями в разделе [`<http_handlers>`](/interfaces/http).                                           |
| `table`                      | none    | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series) для записи данных, полученных по протоколу `remote-write`. Это имя может также содержать имя базы данных. |
| `database`                   | none    | Имя базы данных, в которой находится таблица, указанная в параметре `table`, если оно не указано в самом параметре `table`.                                                                 |


## Протокол remote-read {#remote-read}

ClickHouse поддерживает протокол [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/).
Данные считываются из таблицы [TimeSeries](/engines/table-engines/special/time_series) и передаются по этому протоколу.

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

Настройки:

| Название                     | По умолчанию | Описание                                                                                                                                                                                   |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | Порт для обслуживания протокола `remote-read`.                                                                                                                                                  |
| `url` / `headers` / `method` | none    | Фильтры для поиска соответствующего обработчика запроса. Аналогичны полям с теми же именами в разделе [`<http_handlers>`](/interfaces/http).                                        |
| `table`                      | none    | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series) для чтения данных, передаваемых по протоколу `remote-read`. Это имя может также содержать имя базы данных. |
| `database`                   | none    | Имя базы данных, в которой находится таблица, указанная в параметре `table`, если оно не указано в самом параметре `table`.                                                              |


## Конфигурация для нескольких протоколов {#multiple-protocols}

Несколько протоколов можно указать вместе в одном месте:

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
        <my_rule_2>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_2>
        <my_rule_3>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_3>
    </handlers>
</prometheus>
```
