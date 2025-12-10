---
description: 'Движок позволяет выполнять запросы к удалённым наборам данных через Apache Arrow Flight.'
sidebar_label: 'ArrowFlight'
sidebar_position: 186
slug: /engines/table-engines/integrations/arrowflight
title: 'Табличный движок ArrowFlight'
doc_type: 'reference'
---

# Движок таблицы ArrowFlight {#arrowflight-table-engine}

Движок таблицы ArrowFlight позволяет ClickHouse выполнять запросы к удалённым наборам данных по протоколу [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html).
Эта интеграция даёт возможность ClickHouse получать данные с внешних серверов с поддержкой Flight в колонном формате Arrow с высокой производительностью.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**Параметры движка**

* `host:port` — адрес удалённого сервера Arrow Flight.
* `dataset_name` — идентификатор набора данных на сервере Flight.
* `username` — имя пользователя для базовой HTTP-аутентификации.
* `password` — пароль для базовой HTTP-аутентификации.
  Если `username` и `password` не указаны, это означает, что аутентификация не используется
  (это будет работать только в том случае, если сервер Arrow Flight это допускает).

## Пример использования {#usage-example}

В этом примере показано, как создать таблицу для чтения данных с удалённого сервера Arrow Flight:

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

Запросите удалённые данные так же, как локальную таблицу:

```sql
SELECT * FROM remote_flight_data ORDER BY id;
```

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

## Примечания {#notes}

* Схема, определённая в ClickHouse, должна соответствовать схеме, возвращаемой сервером Flight.
* Этот движок подходит для федеративных запросов, виртуализации данных и разделения хранения и вычислений.

## См. также {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [Интеграция формата Arrow в ClickHouse](/interfaces/formats/Arrow)
