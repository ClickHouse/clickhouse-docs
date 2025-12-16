---
description: 'Документация по оператору DETACH'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'Оператор DETACH'
doc_type: 'reference'
---

Заставляет сервер «забыть» о существовании таблицы, материализованного представления, словаря или базы данных.

**Синтаксис**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

Отсоединение не удаляет данные или метаданные таблицы, материализованного представления, словаря или базы данных. Если объект не был отсоединён с параметром `PERMANENTLY`, при следующем запуске сервера он прочитает метаданные и снова восстановит таблицу/представление/словарь/базу данных. Если объект был отсоединён с параметром `PERMANENTLY`, автоматического восстановления не будет.

Независимо от того, была ли таблица, словарь или база данных отсоединена навсегда или нет, в обоих случаях вы можете повторно присоединить их с помощью запроса [ATTACH](../../sql-reference/statements/attach.md).
Системные таблицы логов также могут быть присоединены обратно (например, `query_log`, `text_log` и т.д.). Другие системные таблицы не могут быть повторно присоединены. При следующем запуске сервера он снова восстановит эти таблицы.

`ATTACH MATERIALIZED VIEW` не работает с коротким синтаксисом (без `SELECT`), но вы можете присоединить его с помощью запроса `ATTACH TABLE`.

Обратите внимание, что вы не можете навсегда отсоединить таблицу, которая уже отсоединена (временно). Но вы можете присоединить её обратно, а затем снова отсоединить навсегда.

Также вы не можете выполнить [DROP](../../sql-reference/statements/drop.md#drop-table) для отсоединённой таблицы, или [CREATE TABLE](../../sql-reference/statements/create/table.md) с тем же именем, что и у таблицы, отсоединённой навсегда, или заменить её другой таблицей с помощью запроса [RENAME TABLE](../../sql-reference/statements/rename.md).

Модификатор `SYNC` выполняет действие без задержки.

**Пример**

Создание таблицы:

Запрос:

```sql
CREATE TABLE test ENGINE = Log AS SELECT * FROM numbers(10);
SELECT * FROM test;
```

Результат:

```text
┌─number─┐
│      0 │
│      1 │
│      2 │
│      3 │
│      4 │
│      5 │
│      6 │
│      7 │
│      8 │
│      9 │
└────────┘
```

Отсоединение таблицы:

Запрос:

```sql
DETACH TABLE test;
SELECT * FROM test;
```

Результат:

```text
Received exception from server (version 21.4.1):
Code: 60. DB::Exception: Received from localhost:9000. DB::Exception: Table default.test does not exist.
```

:::note
В ClickHouse Cloud пользователям следует использовать ключевое слово `PERMANENTLY`, например: `DETACH TABLE <table> PERMANENTLY`. Если его не использовать, таблицы будут снова подключены при перезапуске кластера, например во время обновления.
:::

**См. также**

* [Материализованное представление](/sql-reference/statements/create/view#materialized-view)
* [Словари](../../sql-reference/dictionaries/index.md)
