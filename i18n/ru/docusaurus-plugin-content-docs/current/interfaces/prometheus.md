---
slug: '/interfaces/prometheus'
sidebar_label: 'Протоколы Prometheus'
sidebar_position: 19
description: 'Документация по поддержке протокола Prometheus в ClickHouse'
title: 'Протоколы Prometheus'
doc_type: reference
---
# Протоколы Prometheus

## Экспорт метрик {#expose}

:::note
Если вы используете ClickHouse Cloud, вы можете экспортировать метрики в Prometheus, используя [Prometheus Integration](/integrations/prometheus).
:::

ClickHouse может экспортировать свои собственные метрики для извлечения из Prometheus:

```xml
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
```

Настройки:

| Имя                          | Значение по умолчанию | Описание                                                                                                                                                                                   |
|------------------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none                  | Порт для обслуживания протокола экспорта метрик.                                                                                                                                         |
| `endpoint`                   | `/metrics`            | HTTP конечная точка для извлечения метрик сервером prometheus. Начинается с `/`. Не должен использоваться вместе с разделом `<handlers>`.                                               |
| `url` / `headers` / `method` | none                  | Фильтры, используемые для поиска соответствующего обработчика для запроса. Аналогично полям с такими же именами в разделе [`<http_handlers>`](/interfaces/http).                         |
| `metrics`                    | true                  | Экспортировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).                                                                                                   |
| `asynchronous_metrics`       | true                  | Экспортировать текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).                                                          |
| `events`                     | true                  | Экспортировать метрики из таблицы [system.events](/operations/system-tables/events).                                                                                                     |
| `errors`                     | true                  | Экспортировать количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors). |
| `histograms`                 | true                  | Экспортировать метрики гистограммы из [system.histogram_metrics](/operations/system-tables/histogram_metrics)                                                                                                          |
| `dimensional_metrics`        | true                  | Экспортировать размерные метрики из [system.dimensional_metrics](/operations/system-tables/dimensional_metrics)                                                                         |

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):
```bash
curl 127.0.0.1:9363/metrics
```

## Протокол удаленной записи {#remote-write}

ClickHouse поддерживает протокол [remote-write](https://prometheus.io/docs/specs/remote_write_spec/).
Данные принимаются по этому протоколу и записываются в таблицу [TimeSeries](/engines/table-engines/special/time_series) (которая должна быть создана заранее).

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

| Имя                          | Значение по умолчанию | Описание                                                                                                                                                                                      |
|------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none                  | Порт для обслуживания протокола `remote-write`.                                                                                                                                             |
| `url` / `headers` / `method` | none                  | Фильтры, используемые для поиска соответствующего обработчика для запроса. Аналогично полям с такими же именами в разделе [`<http_handlers>`](/interfaces/http).                         |
| `table`                      | none                  | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series) для записи данных, полученных по протоколу `remote-write`. Это имя может опционально содержать имя базы данных также. |
| `database`                   | none                  | Имя базы данных, в которой находится таблица, указанная в настройке `table`, если это не указано в настройке `table`.                                                                      |

## Протокол удаленного чтения {#remote-read}

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

| Имя                          | Значение по умолчанию | Описание                                                                                                                                                                                     |
|------------------------------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none                  | Порт для обслуживания протокола `remote-read`.                                                                                                                                             |
| `url` / `headers` / `method` | none                  | Фильтры, используемые для поиска соответствующего обработчика для запроса. Аналогично полям с такими же именами в разделе [`<http_handlers>`](/interfaces/http).                       |
| `table`                      | none                  | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series) для чтения данных, которые будут отправлены по протоколу `remote-read`. Это имя может опционально содержать имя базы данных также. |
| `database`                   | none                  | Имя базы данных, в которой находится таблица, указанная в настройке `table`, если это не указано в настройке `table`.                                                                       |

## Конфигурация для нескольких протоколов {#multiple-protocols}

Несколько протоколов могут быть указаны вместе в одном месте:

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