---
slug: '/sql-reference/statements/alter/ttl'
sidebar_label: TTL
sidebar_position: 44
description: 'Документация по манипуляциям с Таблицей TTL'
title: 'Манипуляции с TTL таблицы'
doc_type: reference
---
# Манипуляции с TTL таблицы

:::note
Если вас интересуют подробности использования TTL для управления старыми данными, ознакомьтесь с руководством пользователя [Управление данными с помощью TTL](/guides/developer/ttl.md). Документы ниже демонстрируют, как изменить или удалить существующее правило TTL.
:::

## ИЗМЕНИТЬ TTL {#modify-ttl}

Вы можете изменить [TTL таблицы](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl) с помощью запроса следующего вида:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## УДАЛИТЬ TTL {#remove-ttl}

Свойство TTL можно удалить из таблицы с помощью следующего запроса:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**Пример**

Рассмотрим таблицу с таблицей `TTL`:

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

Запустите `OPTIMIZE`, чтобы принудительно очистить `TTL`:

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

Повторно вставьте удалённую строку и снова принудительно очистите `TTL` с помощью `OPTIMIZE`:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` больше нет, поэтому вторая строка не удалена:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**Смотрите также**

- Подробнее о [TTL-выражении](../../../sql-reference/statements/create/table.md#ttl-expression).
- Изменение колонки [с TTL](/sql-reference/statements/alter/ttl).