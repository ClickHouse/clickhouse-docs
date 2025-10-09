---
slug: '/sql-reference/statements/revoke'
sidebar_label: REVOKE
sidebar_position: 39
description: 'Документация для REVOKE Statement'
title: 'Оператор REVOKE'
doc_type: reference
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

Чтобы отозвать какую-либо привилегию, вы можете использовать привилегию более широкого объема, чем та, которую вы планируете отозвать. Например, если у пользователя есть привилегия `SELECT (x,y)`, администратор может выполнить запрос `REVOKE SELECT(x,y) ...`, или `REVOKE SELECT * ...`, или даже `REVOKE ALL PRIVILEGES ...`, чтобы отозвать эту привилегию.

### Частичные отказы {#partial-revokes}

Вы можете отозвать часть привилегии. Например, если у пользователя есть привилегия `SELECT *.*`, вы можете отозвать у него привилегию на чтение данных из какой-либо таблицы или базы данных.

## Примеры {#examples}

Предоставьте пользователю `john` привилегию на выбор данных из всех баз данных, кроме базы данных `accounts`:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

Предоставьте пользователю `mira` привилегию на выбор из всех колонок таблицы `accounts.staff`, кроме колонки `wage`.

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[Оригинальная статья](/operations/settings/settings/)