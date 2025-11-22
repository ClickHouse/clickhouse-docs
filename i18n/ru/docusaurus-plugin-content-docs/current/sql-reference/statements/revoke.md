---
description: 'Описание оператора REVOKE'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'Оператор REVOKE'
doc_type: 'reference'
---



# Оператор REVOKE

Отзывает привилегии у пользователей или ролей.



## Синтаксис {#syntax}

**Отзыв привилегий у пользователей**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**Отзыв ролей у пользователей**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```


## Описание {#description}

Для отзыва привилегии можно использовать привилегию с более широкой областью действия, чем та, которую планируется отозвать. Например, если у пользователя есть привилегия `SELECT (x,y)`, администратор может выполнить запрос `REVOKE SELECT(x,y) ...`, `REVOKE SELECT * ...` или даже `REVOKE ALL PRIVILEGES ...` для отзыва этой привилегии.

### Частичный отзыв привилегий {#partial-revokes}

Можно отозвать часть привилегии. Например, если у пользователя есть привилегия `SELECT *.*`, можно отозвать у него привилегию на чтение данных из конкретной таблицы или базы данных.


## Примеры {#examples}

Предоставить пользователю `john` привилегию на выборку из всех баз данных, за исключением `accounts`:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

Предоставить пользователю `mira` привилегию на выборку из всех столбцов таблицы `accounts.staff`, за исключением столбца `wage`.

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[Оригинальная статья](/operations/settings/settings/)
