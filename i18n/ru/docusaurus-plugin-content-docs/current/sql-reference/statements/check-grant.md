---
description: 'Документация по CHECK GRANT'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'Оператор CHECK GRANT'
doc_type: 'reference'
---

Запрос `CHECK GRANT` используется для проверки, была ли текущему пользователю или роли предоставлена определённая привилегия.

## Синтаксис {#syntax}

Основной синтаксис запроса следующий:

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

* `privilege` — тип права доступа.

## Примеры {#examples}

Если пользователю ранее была предоставлена привилегия, значение поля `check_grant` в ответе будет равно `1`. В противном случае значение `check_grant` будет равно `0`.

Если `table_1.col1` существует и у текущего пользователя есть привилегия `SELECT`/`SELECT(con)` или роль с такой привилегией, значение в ответе будет равно `1`.

```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```

Если `table_2.col2` не существует или у текущего пользователя нет привилегии `SELECT`/`SELECT(con)` либо роли с такой привилегией, ответ будет `0`.

```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```

## Подстановочные символы {#wildcard}
При указании привилегий можно использовать звездочку (`*`) вместо имени таблицы или базы данных. Правила использования подстановочных символов описаны в разделе [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants).
