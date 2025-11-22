---
description: 'Документация по CHECK GRANT'
sidebar_label: 'CHECK GRANT'
sidebar_position: 56
slug: /sql-reference/statements/check-grant
title: 'Оператор CHECK GRANT'
doc_type: 'reference'
---

Запрос `CHECK GRANT` используется для проверки, было ли текущему пользователю/роли предоставлено определённое привилегие.



## Синтаксис {#syntax}

Базовый синтаксис запроса выглядит следующим образом:

```sql
CHECK GRANT privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*}
```

- `privilege` — тип привилегии.


## Примеры {#examples}

Если пользователю предоставлена привилегия, результат `check_grant` будет равен `1`. В противном случае результат `check_grant` будет равен `0`.

Если `table_1.col1` существует и текущему пользователю предоставлена привилегия `SELECT`/`SELECT(col1)` или роль (с привилегией), результат будет равен `1`.

```sql
CHECK GRANT SELECT(col1) ON table_1;
```

```text
┌─result─┐
│      1 │
└────────┘
```

Если `table_2.col2` не существует или текущему пользователю не предоставлена привилегия `SELECT`/`SELECT(col2)` или роль (с привилегией), результат будет равен `0`.

```sql
CHECK GRANT SELECT(col2) ON table_2;
```

```text
┌─result─┐
│      0 │
└────────┘
```


## Подстановочные символы {#wildcard}

При указании привилегий вместо имени таблицы или базы данных можно использовать звёздочку (`*`). Правила использования подстановочных символов описаны в разделе [WILDCARD GRANTS](../../sql-reference/statements/grant.md#wildcard-grants).
