---
description: 'Документация для DETACH'
sidebar_label: 'DETACH'
sidebar_position: 43
slug: /sql-reference/statements/detach
title: 'Команда DETACH'
---

Заставляет сервер "забыть" о существовании таблицы, материализованного представления, словаря или базы данных.

**Синтаксис**

```sql
DETACH TABLE|VIEW|DICTIONARY|DATABASE [IF EXISTS] [db.]name [ON CLUSTER cluster] [PERMANENTLY] [SYNC]
```

Отключение не удаляет данные или метаданные таблицы, материализованного представления, словаря или базы данных. Если сущность не была отключена `PERMANENTLY`, при следующем запуске сервера он прочитает метаданные и вновь вспомнит таблицу/представление/словарь/базу данных. Если сущность была отключена `PERMANENTLY`, автоматического вспоминания не будет.

Независимо от того, была ли таблица, словарь или база данных отключены навсегда или нет, в обоих случаях вы можете повторно подключить их с помощью запроса [ATTACH](../../sql-reference/statements/attach.md). Системные таблицы журналов также могут быть повторно подключены (например, `query_log`, `text_log` и т.д.). Другие системные таблицы нельзя повторно подключить. При следующем запуске сервера он снова вспомнит эти таблицы.

`ATTACH MATERIALIZED VIEW` не работает с коротким синтаксисом (без `SELECT`), но вы можете прикрепить его с помощью запроса `ATTACH TABLE`.

Обратите внимание, что вы не можете отключить навсегда таблицу, которая уже была отключена (временно). Но вы можете повторно подключить ее, а затем снова отключить навсегда.

Также вы не можете [DROP](../../sql-reference/statements/drop.md#drop-table) отключенную таблицу, или [CREATE TABLE](../../sql-reference/statements/create/table.md) с тем же именем, что и отключенная навсегда, или заменить ее другой таблицей с помощью запроса [RENAME TABLE](../../sql-reference/statements/rename.md).

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

Отключение таблицы:

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
В ClickHouse Cloud пользователи должны использовать оператор `PERMANENTLY`, например `DETACH TABLE <table> PERMANENTLY`. Если этот оператор не используется, таблицы будут повторно подключены при перезапуске кластера, например, во время обновлений.
:::

**См. Также**

- [Материализованное представление](/sql-reference/statements/create/view#materialized-view)
- [Словари](../../sql-reference/dictionaries/index.md)
