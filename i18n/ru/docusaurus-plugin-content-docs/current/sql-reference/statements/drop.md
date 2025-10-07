---
slug: '/sql-reference/statements/drop'
sidebar_label: DROP
sidebar_position: 44
description: 'Документация для DROP Statements'
title: 'Операторы DROP'
doc_type: reference
---
# DROP Операторы

Удаляет существующий объект. Если указано условие `IF EXISTS`, эти запросы не возвращают ошибку, если объект не существует. Если задан модификатор `SYNC`, объект удаляется без задержки.

## DROP DATABASE {#drop-database}

Удаляет все таблицы внутри базы данных `db`, затем удаляет саму базу данных `db`.

Синтаксис:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

Удаляет одну или несколько таблиц.

:::tip
Чтобы отменить удаление таблицы, пожалуйста, смотрите [UNDROP TABLE](/sql-reference/statements/undrop.md)
:::

Синтаксис:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
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

Удаляет роль. Удаленная роль отзывается у всех объектов, где она была назначена.

Синтаксис:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

Удаляет политику строк. Удаленная политика строк отзывается у всех объектов, где она была назначена.

Синтаксис:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

Удаляет квоту. Удаленная квота отзывается у всех объектов, где она была назначена.

Синтаксис:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

Удаляет профиль настроек. Удаленный профиль настроек отзывается у всех объектов, где он был назначен.

Синтаксис:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

Удаляет представление. Представления также могут быть удалены командой `DROP TABLE`, но `DROP VIEW` проверяет, что `[db.]name` является представлением.

Синтаксис:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

Удаляет пользовательскую функцию, созданную с помощью [CREATE FUNCTION](./create/function.md).
Системные функции не могут быть удалены.

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