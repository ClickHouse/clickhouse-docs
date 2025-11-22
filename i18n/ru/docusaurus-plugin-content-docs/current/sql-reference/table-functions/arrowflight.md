---
description: 'Позволяет выполнять запросы к данным, доступным через сервер Apache Arrow Flight.'
sidebar_label: 'arrowFlight'
sidebar_position: 186
slug: /sql-reference/table-functions/arrowflight
title: 'arrowFlight'
doc_type: 'reference'
---

# Табличная функция arrowFlight

Позволяет выполнять запросы к данным, доступным через сервер [Apache Arrow Flight](../../interfaces/arrowflight.md).

**Синтаксис**

```sql
arrowFlight('host:port', 'dataset_name' [, 'username', 'password'])
```

**Аргументы**

* `host:port` — адрес сервера Arrow Flight. [String](../../sql-reference/data-types/string.md).
* `dataset_name` — имя набора данных или дескриптора, доступного на сервере Arrow Flight. [String](../../sql-reference/data-types/string.md).
* `username` — имя пользователя для базовой HTTP-аутентификации.
* `password` — пароль для базовой HTTP-аутентификации.
  Если `username` и `password` не указаны, это означает, что аутентификация не используется
  (это будет работать только в том случае, если сервер Arrow Flight это допускает).

**Возвращаемое значение**

* Объект таблицы, представляющий удалённый набор данных. Схема определяется на основе ответа Arrow Flight.

**Пример**

Запрос:

```sql
SELECT * FROM arrowFlight('127.0.0.1:9005', 'sample_dataset') ORDER BY id;
```

Результат:

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

**См. также**

* Движок таблицы [Arrow Flight](../../engines/table-engines/integrations/arrowflight.md)
* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
