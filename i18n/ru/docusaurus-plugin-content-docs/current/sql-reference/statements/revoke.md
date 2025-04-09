---
description: 'Документация для оператора REVOKE'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'Оператор REVOKE'
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

Чтобы отозвать какую-то привилегию, вы можете использовать привилегию более широкого объёма, чем та, которую вы собираетесь отозвать. Например, если у пользователя есть привилегия `SELECT (x,y)`, администратор может выполнить запросы `REVOKE SELECT(x,y) ...`, `REVOKE SELECT * ...`, или даже `REVOKE ALL PRIVILEGES ...`, чтобы отозвать эту привилегию.

### Частичный отзыв {#partial-revokes}

Вы можете отозвать часть привилегии. Например, если у пользователя есть привилегия `SELECT *.*`, вы можете отозвать у него привилегию на чтение данных из какой-то таблицы или базы данных.

## Примеры {#examples}

Предоставьте учетной записи пользователя `john` привилегию на выборку из всех баз данных, за исключением базы `accounts`:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

Предоставьте учетной записи пользователя `mira` привилегию на выборку из всех колонок таблицы `accounts.staff`, за исключением колонки `wage`.

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[Оригинальная статья](/operations/settings/settings/)
