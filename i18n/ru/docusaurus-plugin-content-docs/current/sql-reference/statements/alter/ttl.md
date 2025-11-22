---
description: 'Документация по управлению TTL таблиц'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: 'Управление TTL таблиц'
doc_type: 'reference'
---



# Операции с TTL таблицы

:::note
Если вы ищете подробную информацию об использовании TTL для управления старыми данными, ознакомьтесь с руководством пользователя [Управление данными с помощью TTL](/guides/developer/ttl.md). В документации ниже показано, как изменить или удалить существующее правило TTL.
:::



## MODIFY TTL {#modify-ttl}

Вы можете изменить [TTL таблицы](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) с помощью запроса следующего вида:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```


## REMOVE TTL {#remove-ttl}

Свойство TTL можно удалить из таблицы следующим запросом:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**Пример**

Рассмотрим таблицу с `TTL`:

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

INSERT INTO table_with_ttl VALUES (now(), 1, 'username1');

INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
```

Выполните `OPTIMIZE` для принудительной очистки по `TTL`:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

Вторая строка удалена из таблицы.

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

Теперь удалите `TTL` таблицы следующим запросом:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

Повторно вставьте удаленную строку и снова принудительно выполните очистку по `TTL` с помощью `OPTIMIZE`:

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

- Подробнее о [TTL-выражениях](../../../sql-reference/statements/create/table.md#ttl-expression).
- Изменение столбца [с TTL](/sql-reference/statements/alter/ttl).
