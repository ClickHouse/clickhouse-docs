---
'description': 'Двигатель позволяет выполнять запросы к удаленным наборам данных через
  Apache Arrow Flight.'
'sidebar_label': 'ArrowFlight'
'sidebar_position': 186
'slug': '/engines/table-engines/integrations/arrowflight'
'title': 'ArrowFlight'
'doc_type': 'reference'
---
# ArrowFlight

Движок таблиц ArrowFlight позволяет ClickHouse запрашивать удаленные наборы данных по протоколу [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html). Это интеграция позволяет ClickHouse извлекать данные с внешних серверов, поддерживающих Flight, в колонном формате Arrow с высокой производительностью.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**Параметры движка**

* `host:port` — Адрес удалённого сервера Arrow Flight.
* `dataset_name` — Идентификатор набора данных на сервере Flight.
* `username` - Имя пользователя для аутентификации в стиле базовой HTTP.
* `password` - Пароль для аутентификации в стиле базовой HTTP. Если `username` и `password` не указаны, это значит, что аутентификация не используется (это будет работать только если сервер Arrow Flight это допускает).

## Пример использования {#usage-example}

Этот пример показывает, как создать таблицу, которая считывает данные с удаленного сервера Arrow Flight:

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

Запросите удаленные данные так, как если бы это была локальная таблица:

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
* Этот движок подходит для федеративных запросов, виртуализации данных и отделения хранения от вычислений.

## См. также {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [Интеграция формата Arrow в ClickHouse](/interfaces/formats/Arrow)