---
description: 'Документация по поддержке протокола Prometheus в ClickHouse'
sidebar_label: 'Протоколы Prometheus'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Протоколы Prometheus'
---


# Протоколы Prometheus

## Экспонирование метрик {#expose}

:::note
Если вы используете ClickHouse Cloud, вы можете экспонировать метрики для Prometheus, используя [Интеграцию Prometheus](/integrations/prometheus).
:::

ClickHouse может экспонировать свои собственные метрики для опроса из Prometheus:

```xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
</prometheus>

Секция `<prometheus.handlers>` может быть использована для создания более расширенных обработчиков.
Эта секция аналогична [<http_handlers>](/interfaces/http), но работает с протоколами Prometheus:

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
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

Настройки:

| Название                    | По умолчанию | Описание                                                                                                                                                                                  |
|-----------------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                      | none         | Порт для обслуживания протокола экспонирования метрик.                                                                                                                                  |
| `endpoint`                  | `/metrics`   | HTTP-эндпоинт для опроса метрик сервером Prometheus. Начинается с `/`. Не должен использоваться с секцией `<handlers>`.                                                                  |
| `url` / `headers` / `method` | none         | Фильтры, используемые для поиска подходящего обработчика для запроса. Аналогично полям с теми же именами в секции [`<http_handlers>`](/interfaces/http).                                |
| `metrics`                   | true         | Экспонировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).                                                                                                  |
| `asynchronous_metrics`      | true         | Экспонировать текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).                                                         |
| `events`                    | true         | Экспонировать метрики из таблицы [system.events](/operations/system-tables/events).                                                                                                    |
| `errors`                    | true         | Экспонировать количество ошибок по кодам ошибок, возникших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors). |

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):
```bash
curl 127.0.0.1:9363/metrics
```

## Протокол удаленной записи {#remote-write}

ClickHouse поддерживает протокол [remote-write](https://prometheus.io/docs/specs/remote_write_spec/).
Данные принимаются по этому протоколу и записываются в таблицу [TimeSeries](/engines/table-engines/special/time_series)
(которая должна быть создана заранее).

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

| Название                    | По умолчанию | Описание                                                                                                                                                                                         |
|-----------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                      | none         | Порт для обслуживания протокола `remote-write`.                                                                                                                                                 |
| `url` / `headers` / `method` | none         | Фильтры, используемые для поиска подходящего обработчика для запроса. Аналогично полям с теми же именами в секции [`<http_handlers>`](/interfaces/http).                                      |
| `table`                     | none         | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series), в которую будут записываться данные, полученные по протоколу `remote-write`. Это имя может дополнительно содержать имя базы данных. |
| `database`                  | none         | Имя базы данных, где находится таблица, указанная в параметре `table`, если она не указана в параметре `table`.                                                                               |

## Протокол удаленного чтения {#remote-read}

ClickHouse поддерживает протокол [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/).
Данные читаются из таблицы [TimeSeries](/engines/table-engines/special/time_series) и отправляются через этот протокол.

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

| Название                    | По умолчанию | Описание                                                                                                                                                                                      |
|-----------------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                      | none         | Порт для обслуживания протокола `remote-read`.                                                                                                                                                 |
| `url` / `headers` / `method` | none         | Фильтры, используемые для поиска подходящего обработчика для запроса. Аналогично полям с теми же именами в секции [`<http_handlers>`](/interfaces/http).                                   |
| `table`                     | none         | Имя таблицы [TimeSeries](/engines/table-engines/special/time_series), из которой будут читаться данные для отправки по протоколу `remote-read`. Это имя может дополнительно содержать имя базы данных. |
| `database`                  | none         | Имя базы данных, где находится таблица, указанная в параметре `table`, если она не указана в параметре `table`.                                                                             |

## Конфигурация для нескольких протоколов {#multiple-protocols}

Несколькими протоколами можно управлять одновременно в одном месте:

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
