---
description: 'Документация по поддержке протокола Prometheus в ClickHouse'
sidebar_label: 'Протоколы Prometheus'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Протоколы Prometheus'
doc_type: 'reference'
---

# Протоколы Prometheus {#prometheus-protocols}

## Предоставление метрик {#expose}

:::note
Если вы используете ClickHouse Cloud, вы можете передавать метрики в Prometheus с помощью [Prometheus Integration](/integrations/prometheus).
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

Секция `<prometheus.handlers>` может использоваться для создания расширенных обработчиков.
Эта секция аналогична [<http_handlers>](/interfaces/http), но работает с протоколами prometheus:

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

| Name                         | Default    | Description                                                                                                                                                                                                |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none       | Порт для публикации метрик.                                                                                                                                                                                |
| `endpoint`                   | `/metrics` | HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с `/`. Не должен использоваться совместно с разделом `<handlers>`.                                                                   |
| `url` / `headers` / `method` | none       | Фильтры, используемые для поиска обработчика, соответствующего запросу. Аналогичны полям с теми же именами в разделе [`<http_handlers>`](/interfaces/http).                                                |
| `metrics`                    | true       | Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).                                                                                                                     |
| `asynchronous_metrics`       | true       | Экспортировать текущие значения метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).                                                                       |
| `events`                     | true       | Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).                                                                                                                       |
| `errors`                     | true       | Экспортировать количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эту информацию также можно получить из таблицы [system.errors](/operations/system-tables/errors). |
| `histograms`                 | true       | Экспортировать гистограммные метрики из [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics).                                                                                       |
| `dimensional_metrics`        | true       | Экспортировать размерные метрики из [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics).                                                                                       |

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```

## Протокол remote-write {#remote-write}

ClickHouse поддерживает протокол [remote-write](https://prometheus.io/docs/specs/remote_write_spec/).
Данные принимаются с использованием этого протокола и записываются в таблицу [TimeSeries](/engines/table-engines/special/time_series)
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

Settings:

| Name                         | Default | Description                                                                                                                                                                                                  |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | Порт для обработки протокола `remote-write`.                                                                                                                                                                 |
| `url` / `headers` / `method` | none    | Фильтры, используемые для поиска подходящего обработчика запроса. Аналогичны полям с теми же именами в разделе [`<http_handlers>`](/interfaces/http).                                                        |
| `table`                      | none    | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series), в которую записываются данные, полученные по протоколу `remote-write`. Это имя при необходимости также может включать имя базы данных. |
| `database`                   | none    | Имя базы данных, в которой находится таблица, указанная в настройке `table`, если оно не указано в самой настройке `table`.                                                                                  |

## Протокол remote-read {#remote-read}

ClickHouse поддерживает протокол [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/).
Данные читаются из таблицы [TimeSeries](/engines/table-engines/special/time_series) и передаются по этому протоколу.

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

Параметры:

| Name                         | Default | Description                                                                                                                                                                                         |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | Порт для обработки протокола `remote-read`.                                                                                                                                                         |
| `url` / `headers` / `method` | none    | Фильтры, используемые для поиска обработчика, соответствующего запросу. Аналогичны полям с теми же именами в разделе [`<http_handlers>`](/interfaces/http).                                         |
| `table`                      | none    | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series), из которой читаются данные для отправки по протоколу `remote-read`. При необходимости это имя может включать имя базы данных. |
| `database`                   | none    | Имя базы данных, в которой находится таблица, указанная в параметре `table`, если оно не указано в значении параметра `table`.                                                                      |

## Конфигурация нескольких протоколов {#multiple-protocols}

Несколько протоколов можно задать вместе в одном конфигурационном блоке:

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
