---
description: 'Документация по оператору RENAME'
sidebar_label: 'RENAME'
sidebar_position: 48
slug: /sql-reference/statements/rename
title: 'Оператор RENAME'
doc_type: 'reference'
---

# Оператор RENAME {#rename-statement}

Переименовывает базы данных, таблицы или словари. В одном запросе можно переименовать несколько сущностей.
Обратите внимание, что запрос `RENAME` с несколькими сущностями является не атомарной операцией. Чтобы атомарно поменять местами имена сущностей, используйте оператор [EXCHANGE](./exchange.md).

**Синтаксис**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] имя TO новое_имя [,...] [ON CLUSTER кластер]
```

## RENAME DATABASE {#rename-database}

Переименовывает базу данных.

**Синтаксис**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```

## RENAME TABLE {#rename-table}

Переименовывает одну или несколько таблиц.

Переименование таблиц — легковесная операция. Если вы укажете другую базу данных после `TO`, таблица будет перемещена в эту базу данных. Однако каталоги баз данных должны находиться в одной файловой системе. В противном случае будет возвращена ошибка.
Если вы переименовываете несколько таблиц в одном запросе, операция не является атомарной. Она может быть выполнена частично, и запросы из других сессий могут получить ошибку `Table ... does not exist ...`.

**Синтаксис**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**Пример**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

Также можно использовать более простой SQL‑запрос:

```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

Переименовывает один или несколько словарей. Этот запрос можно использовать для перемещения словарей между базами данных.

**Синтаксис**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**См. также**

* [Справочники](../../sql-reference/dictionaries/index.md)
