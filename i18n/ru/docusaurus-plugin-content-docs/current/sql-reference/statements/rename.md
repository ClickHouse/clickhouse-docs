---
slug: '/sql-reference/statements/rename'
sidebar_label: RENAME
sidebar_position: 48
description: 'Документация для RENAME Statement'
title: 'Оператор RENAME'
doc_type: reference
---
# Заявление RENAME

Переименовывает базы данных, таблицы или словари. Несколько объектов могут быть переименованы в одном запросе. Обратите внимание, что запрос `RENAME` с несколькими объектами является неатомарной операцией. Чтобы атомарно поменять местами имена объектов, используйте оператор [EXCHANGE](./exchange.md).

**Синтаксис**

```sql
RENAME [DATABASE|TABLE|DICTIONARY] name TO new_name [,...] [ON CLUSTER cluster]
```

## RENAME DATABASE {#rename-database}

Переименовывает базы данных.

**Синтаксис**

```sql
RENAME DATABASE atomic_database1 TO atomic_database2 [,...] [ON CLUSTER cluster]
```

## RENAME TABLE {#rename-table}

Переименовывает одну или несколько таблиц.

Переименование таблиц — это легкая операция. Если вы укажете другую базу данных после `TO`, таблица будет перемещена в эту базу данных. Однако директории с базами данных должны находиться в одной файловой системе. В противном случае будет возвращена ошибка. 
Если вы переименовываете несколько таблиц в одном запросе, операция не является атомарной. Она может быть частично выполнена, и запросы в других сессиях могут получить ошибку `Таблица ... не существует ...`.

**Синтаксис**

```sql
RENAME TABLE [db1.]name1 TO [db2.]name2 [,...] [ON CLUSTER cluster]
```

**Пример**

```sql
RENAME TABLE table_A TO table_A_bak, table_B TO table_B_bak;
```

Вы также можете использовать более простой SQL:  
```sql
RENAME table_A TO table_A_bak, table_B TO table_B_bak;
```

## RENAME DICTIONARY {#rename-dictionary}

Переименовывает один или несколько словарей. Этот запрос может быть использован для перемещения словарей между базами данных.

**Синтаксис**

```sql
RENAME DICTIONARY [db0.]dict_A TO [db1.]dict_B [,...] [ON CLUSTER cluster]
```

**Смотрите также**

- [Словари](../../sql-reference/dictionaries/index.md)