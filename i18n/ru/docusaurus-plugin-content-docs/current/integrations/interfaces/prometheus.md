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
Если вы используете ClickHouse Cloud, вы можете предоставить метрики Prometheus через [интеграцию Prometheus](/integrations/prometheus).
:::

ClickHouse может предоставлять собственные метрики для опроса Prometheus:

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

Section `<prometheus.handlers>` can be used to make more extended handlers.
This section is similar to [<http_handlers>](/interfaces/http) but works for prometheus protocols:

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

| Имя                          | По умолчанию | Описание                                                                                                                                                                                           |
| ---------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none         | Порт для экспонирования метрик.                                                                                                                                                                    |
| `endpoint`                   | `/metrics`   | HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с `/`. Не должен использоваться вместе с секцией `<handlers>`.                                                               |
| `url` / `headers` / `method` | none         | Фильтры, используемые для поиска соответствующего обработчика для запроса. Аналогичны полям с теми же именами в секции [`<http_handlers>`](/interfaces/http).                                      |
| `metrics`                    | true         | Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).                                                                                                             |
| `asynchronous_metrics`       | true         | Экспортировать текущие значения метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).                                                               |
| `events`                     | true         | Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).                                                                                                               |
| `errors`                     | true         | Экспортировать количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эту информацию также можно получить из [system.errors](/operations/system-tables/errors). |
| `histograms`                 | true         | Экспортировать гистограммные метрики из [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics).                                                                               |
| `dimensional_metrics`        | true         | Экспортировать дименсиональные метрики из [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics).                                                                         |

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```

## Протокол remote-write

ClickHouse поддерживает протокол [remote-write](https://prometheus.io/docs/specs/remote_write_spec/).
Данные принимаются с использованием этого протокола и записываются в таблицу [TimeSeries](/engines/table-engines/special/time_series),
которую необходимо создать заранее.

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

Параметры:

| Name                         | Default | Description                                                                                                                                                                                      |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | Порт для обслуживания протокола `remote-write`.                                                                                                                                                  |
| `url` / `headers` / `method` | none    | Фильтры, используемые для поиска подходящего обработчика запроса. Аналогичны полям с теми же именами в разделе [`<http_handlers>`](/interfaces/http).                                            |
| `table`                      | none    | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series) для записи данных, полученных по протоколу `remote-write`. При необходимости это имя может также содержать имя базы данных. |
| `database`                   | none    | Имя базы данных, в которой расположена таблица, указанная в параметре `table`, если база данных не указана в самом параметре `table`.                                                            |

## Протокол remote-read

ClickHouse поддерживает протокол [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/).
Данные читаются из таблицы [TimeSeries](/engines/table-engines/special/time_series) и отправляются по этому протоколу.

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

| Name                         | Default | Description                                                                                                                                                                                                       |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | Порт для обслуживания протокола `remote-read`.                                                                                                                                                                    |
| `url` / `headers` / `method` | none    | Фильтры, используемые для поиска соответствующего обработчика запроса. Аналогичны полям с теми же именами в разделе [`<http_handlers>`](/interfaces/http).                                                        |
| `table`                      | none    | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series), из которой считываются данные для отправки по протоколу `remote-read`. В этом имени при необходимости может быть указано и имя базы данных. |
| `database`                   | none    | Имя базы данных, в которой расположена таблица, указанная в настройке `table`, если оно не указано в самой настройке `table`.                                                                                     |

## Конфигурация нескольких протоколов

Несколько протоколов можно задать совместно в одном месте:

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
