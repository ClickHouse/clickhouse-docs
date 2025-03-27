---
description: 'Документация по CHECK GRANT'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'Оператор CHECK GRANT'
---

Запрос `CHECK GRANT` используется для проверки, был ли текущему пользователю/роле предоставлен конкретный привилегия.

## Синтаксис {#syntax}

Основной синтаксис запроса выглядит следующим образом:

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — Тип привилегии.

## Примеры {#examples}

Если пользователю раньше была предоставлена привилегия, ответ `check_grant` будет `1`. В противном случае ответ `check_grant` будет `0`.

Если `table_1.col1` существует и текущий пользователь имеет привилегию `SELECT`/`SELECT(con)` или роль (с привилегией), ответ будет `1`.
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
Если `table_2.col2` не существует или текущий пользователь не имеет привилегии `SELECT`/`SELECT(con)` или роль (с привилегией), ответ будет `0`.
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## Шаблоны {#wildcard}
При указании привилегий вы можете использовать звездочку (`*`) вместо имени таблицы или базы данных. Пожалуйста, ознакомьтесь с разделом [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants) для правил использования шаблонов.
