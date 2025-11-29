---
description: 'Документация по работе с TTL таблицы'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: 'Работа с TTL таблицы'
doc_type: 'reference'
---

# Операции с TTL таблицы {#manipulations-with-table-ttl}

:::note
Если вам нужны подробные сведения об использовании TTL для управления старыми данными, ознакомьтесь с руководством [Управление данными с помощью TTL](/guides/developer/ttl.md). В приведённом ниже материале показано, как изменить или удалить существующее правило TTL.
:::

## ИЗМЕНЕНИЕ TTL {#modify-ttl}

Вы можете изменить [TTL для таблицы](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) с помощью запроса следующего вида:

```sql
ALTER TABLE [db.]имя_таблицы [ON CLUSTER кластер] MODIFY TTL ttl_выражение;
```

## УДАЛЕНИЕ TTL {#remove-ttl}

Свойство TTL можно удалить из таблицы с помощью следующего запроса:

```sql
ALTER TABLE [db.]имя_таблицы [ON CLUSTER кластер] REMOVE TTL
```

**Пример**

Рассмотрим таблицу с параметром `TTL`:

```sql
CREATE TABLE table_with_ttl
(
    event_time DateTime,
    UserID UInt64,
    Comment String
)
ENGINE MergeTree()
ORDER BY tuple()
TTL event_time + INTERVAL 3 MONTH
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO table_with_ttl VALUES (now(), 1, 'имя_пользователя1');

INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'имя_пользователя2');
```

Выполните `OPTIMIZE`, чтобы принудительно выполнить очистку по `TTL`:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

Вторая строка была удалена из таблицы.

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

Теперь удалите таблицу `TTL` с помощью следующего запроса:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

Повторно вставьте удалённую строку и принудительно выполните очистку `TTL` с помощью `OPTIMIZE`:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` больше не задан, поэтому вторая строка не удаляется:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**См. также**

* Подробнее о [TTL-выражении](../../../sql-reference/statements/create/table.md#ttl-expression).
* Изменение столбца [с TTL](/sql-reference/statements/alter/ttl).
