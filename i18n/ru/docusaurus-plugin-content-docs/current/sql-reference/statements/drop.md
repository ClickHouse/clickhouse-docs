---
description: 'Документация по операторам DROP'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'Операторы DROP'
doc_type: 'reference'
---

# Операторы DROP \\{#drop-statements\\}

Удаляют существующую сущность. Если указано предложение `IF EXISTS`, запрос не приводит к ошибке, даже если сущность не существует. Если указан модификатор `SYNC`, сущность удаляется без задержки.

## DROP DATABASE \{#drop-database\}

Удаляет все таблицы в базе данных `db`, а затем удаляет саму базу данных `db`.

Синтаксис:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```


## DROP TABLE \{#drop-table\}

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


## DROP DICTIONARY \{#drop-dictionary\}

Удаляет словарь.

Синтаксис:

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```


## DROP USER \{#drop-user\}

Удаляет пользователя.

Синтаксис:

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP ROLE \{#drop-role\}

Удаляет роль. Удалённая роль автоматически отзывается у всех объектов, которым она была назначена.

Синтаксис:

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP ROW POLICY \{#drop-row-policy\}

Удаляет политику строк. Удалённая политика перестаёт действовать для всех сущностей, которым она была назначена.

Синтаксис:

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP MASKING POLICY \{#drop-masking-policy\}

Удаляет политику маскирования.

Синтаксис:

```sql
DROP MASKING POLICY [IF EXISTS] name ON [database.]table [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP QUOTA \{#drop-quota\}

Удаляет квоту. Удалённая квота отзывается у всех объектов, которым она была назначена.

Синтаксис:

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP SETTINGS PROFILE \{#drop-settings-profile\}

Удаляет профиль настроек. Удалённый профиль настроек будет снят со всех объектов, которым он был назначен.

Синтаксис:

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP VIEW \{#drop-view\}

Удаляет представление. Представления можно удалить и с помощью команды `DROP TABLE`, но `DROP VIEW` проверяет, что `[db.]name` действительно является представлением.

Синтаксис:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```


## DROP FUNCTION \{#drop-function\}

Удаляет функцию, определяемую пользователем, созданную с помощью [CREATE FUNCTION](./create/function.md).
Системные функции удалить невозможно.

**Синтаксис**

```sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**Пример**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```


## DROP NAMED COLLECTION \{#drop-named-collection\}

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
