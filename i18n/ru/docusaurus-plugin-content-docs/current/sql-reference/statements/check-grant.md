---
description: 'Документация для CHECK GRANT'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'Оператор CHECK GRANT'
---

Запрос `CHECK GRANT` используется для проверки, был ли текущему пользователю/ролью предоставлен конкретный привилегия.

## Синтаксис {#syntax}

Основной синтаксис запроса выглядит следующим образом:

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — Тип привилегии.

## Примеры {#examples}

Если пользователю когда-либо была предоставлена привилегия, ответ `check_grant` будет `1`. В противном случае ответ `check_grant` будет `0`.

Если `table_1.col1` существует и текущему пользователю предоставлена привилегия `SELECT`/`SELECT(con)` или роль (с привилегией), ответ будет `1`.
```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```
Если `table_2.col2` не существует, или текущему пользователю не предоставлена привилегия `SELECT`/`SELECT(con)` или роль (с привилегией), ответ будет `0`.
```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## Подстановочный знак {#wildcard}
Указывая привилегии, вы можете использовать звездочку (`*`) вместо имени таблицы или базы данных. Пожалуйста, ознакомьтесь с [ПОДСТАНОВОЧНЫЕ ПРИВИЛЕГИИ](../../sql-reference/statements/grant.md#wildcard-grants) для правил использования подстановочных знаков.
