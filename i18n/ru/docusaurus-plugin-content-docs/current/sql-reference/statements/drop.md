---
description: 'Документация по операторам DROP'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'Операторы DROP'
doc_type: 'reference'
---



# Операторы DROP

Удаляют существующую сущность. Если указано предложение `IF EXISTS`, запрос не приводит к ошибке, даже если сущность не существует. Если указан модификатор `SYNC`, сущность удаляется без задержки.



## DROP DATABASE

Удаляет все таблицы в базе данных `db`, а затем удаляет саму базу данных `db`.

Синтаксис:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```


## DROP TABLE

Удаляет одну или несколько таблиц.

:::tip
Чтобы отменить удаление таблицы, используйте оператор [UNDROP TABLE](/sql-reference/statements/undrop.md)
:::

Синтаксис:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

Ограничения:

* Если указано условие `IF EMPTY`, сервер проверяет, пуста ли таблица, только на реплике, которая получила запрос.
* Удаление нескольких таблиц одновременно не является атомарной операцией, т.е. если удаление одной таблицы завершается с ошибкой, последующие таблицы не будут удалены.


## DROP DICTIONARY

Удаляет словарь.

Синтаксис:

```sql
DROP DICTIONARY [IF EXISTS] [db.]имя [SYNC]
```


## DROP USER

Удаляет пользователя.

Синтаксис:

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP ROLE

Удаляет роль. Удалённая роль автоматически отзывается у всех объектов, которым она была назначена.

Синтаксис:

```sql
DROP ROLE [IF EXISTS] имя [,...] [ON CLUSTER имя_кластера] [FROM тип_хранилища_доступа]
```


## DROP ROW POLICY

Удаляет политику строк. Удалённая политика перестаёт действовать для всех сущностей, которым она была назначена.

Синтаксис:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP QUOTA

Удаляет квоту. Удалённая квота отзывается у всех объектов, которым она была назначена.

Синтаксис:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP SETTINGS PROFILE

Удаляет профиль настроек. Удалённый профиль настроек будет снят со всех объектов, которым он был назначен.

Синтаксис:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP VIEW

Удаляет представление. Представления можно удалить и с помощью команды `DROP TABLE`, но `DROP VIEW` проверяет, что `[db.]name` действительно является представлением.

Синтаксис:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```


## DROP FUNCTION

Удаляет функцию, определяемую пользователем, созданную с помощью [CREATE FUNCTION](./create/function.md).
Системные функции удалить невозможно.

**Синтаксис**

```sql
DROP FUNCTION [IF EXISTS] имя_функции [ON CLUSTER кластер]
```

**Пример**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```


## DROP NAMED COLLECTION

Удаляет именованную коллекцию.

**Синтаксис**

```sql
DROP ИМЕНУЕМАЯ КОЛЛЕКЦИЯ [ЕСЛИ СУЩЕСТВУЕТ] name [на КЛАСТЕРЕ cluster]
```

**Пример**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
