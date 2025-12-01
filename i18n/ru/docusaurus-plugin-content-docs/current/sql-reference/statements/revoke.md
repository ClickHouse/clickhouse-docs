---
description: 'Документация по оператору REVOKE'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'Оператор REVOKE'
doc_type: 'reference'
---



# Оператор REVOKE {#revoke-statement}

Отзывает привилегии у пользователей или ролей.



## Синтаксис {#syntax}

**Отмена привилегий для пользователей**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**Отзыв ролей у пользователей**

```sql
OTMENITЬ [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```


## Описание {#description}

Чтобы отозвать какую‑либо привилегию, вы можете использовать привилегию более широкого уровня, чем та, которую планируете отозвать. Например, если у пользователя есть привилегия `SELECT (x,y)`, администратор может выполнить запрос `REVOKE SELECT(x,y) ...`, или `REVOKE SELECT * ...`, или даже `REVOKE ALL PRIVILEGES ...`, чтобы отозвать эту привилегию.

### Частичный отзыв привилегий {#partial-revokes}

Вы можете отозвать часть привилегии. Например, если у пользователя есть привилегия `SELECT *.*`, вы можете отозвать у него привилегию на чтение данных из некоторой таблицы или базы данных.



## Примеры {#examples}

Предоставьте учётной записи пользователя `john` привилегию SELECT для всех баз данных, кроме базы данных `accounts`:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

Предоставьте пользователю `mira` привилегию на выборку данных из всех столбцов таблицы `accounts.staff`, кроме столбца `wage`.

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[Оригинал статьи](/operations/settings/settings/)
