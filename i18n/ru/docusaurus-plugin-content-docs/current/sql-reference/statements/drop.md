---
description: 'Документация для операторов DROP'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'Операторы DROP'
---


# Операторы DROP

Удаляет существующую сущность. Если указано условие `IF EXISTS`, эти запросы не возвращают ошибку, если сущность не существует. Если указан модификатор `SYNC`, сущность удаляется без задержки.

## DROP DATABASE {#drop-database}

Удаляет все таблицы в базе данных `db`, затем удаляет саму базу данных `db`.

Синтаксис:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

Удаляет одну или несколько таблиц.

:::tip
Чтобы отменить удаление таблицы, смотрите [UNDROP TABLE](/sql-reference/statements/undrop.md)
:::

Синтаксис:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY] [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

Ограничения:
- Если указано условие `IF EMPTY`, сервер проверяет пустоту таблицы только на реплике, которая получила запрос.  
- Удаление нескольких таблиц одновременно не является атомарной операцией, т.е. если удаление одной таблицы не удается, последующие таблицы не будут удалены.

## DROP DICTIONARY {#drop-dictionary}

Удаляет словарь.

Синтаксис:

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER {#drop-user}

Удаляет пользователя.

Синтаксис:

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE {#drop-role}

Удаляет роль. Удаленная роль аннулируется для всех сущностей, где она была назначена.

Синтаксис:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

Удаляет политику строк. Удаленная политика строк аннулируется для всех сущностей, где она была назначена.

Синтаксис:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

Удаляет квоту. Удаленная квота аннулируется для всех сущностей, где она была назначена.

Синтаксис:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

Удаляет профиль настроек. Удаленный профиль настроек аннулируется для всех сущностей, где он был назначен.

Синтаксис:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

Удаляет представление. Представления также могут быть удалены с помощью команды `DROP TABLE`, но `DROP VIEW` проверяет, что `[db.]name` является представлением.

Синтаксис:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

Удаляет пользовательскую функцию, созданную с помощью [CREATE FUNCTION](./create/function.md). Системные функции не могут быть удалены.

**Синтаксис**

```sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**Пример**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```

## DROP NAMED COLLECTION {#drop-named-collection}

Удаляет именованную коллекцию.

**Синтаксис**

```sql
DROP NAMED COLLECTION [IF EXISTS] name [on CLUSTER cluster]
```

**Пример**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
