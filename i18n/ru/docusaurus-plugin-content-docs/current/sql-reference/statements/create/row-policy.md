---
description: 'Документация по политике строк'
sidebar_label: 'ПОЛИТИКА СТРОК'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'СОЗДАТЬ ПОЛИТИКУ СТРОК'
---

Создает [политику строк](../../../guides/sre/user-management/index.md#row-policy-management), т.е. фильтр, который используется для определения, какие строки пользователь может читать из таблицы.

:::tip
Политики строк имеют смысл только для пользователей с доступом только для чтения. Если пользователь может изменять таблицу или копировать партиции между таблицами, это делает ограничения политик строк неэффективными.
:::

Синтаксис:

```sql
CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE] policy_name1 [ON CLUSTER cluster_name1] ON [db1.]table1|db1.*
        [, policy_name2 [ON CLUSTER cluster_name2] ON [db2.]table2|db2.* ...]
    [IN access_storage_type]
    [FOR SELECT] USING condition
    [AS {PERMISSIVE | RESTRICTIVE}]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
```

## USING Clause {#using-clause}

Позволяет указать условие для фильтрации строк. Пользователь увидит строку, если для неё вычислено ненулевое значение условия.

## TO Clause {#to-clause}

В разделе `TO` можно указать список пользователей и ролей, для которых эта политика будет работать. Например, `CREATE ROW POLICY ... TO accountant, john@localhost`.

Ключевое слово `ALL` означает всех пользователей ClickHouse, включая текущего пользователя. Ключевое слово `ALL EXCEPT` позволяет исключить некоторых пользователей из общего списка пользователей, например, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
Если для таблицы не определены политики строк, то любой пользователь может `SELECT` все строки из таблицы. Определение одной или более политик строк для таблицы делает доступ к таблице зависимым от политик строк, независимо от того, определены ли эти политики строк для текущего пользователя или нет. Например, следующая политика:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

запрещает пользователям `mira` и `peter` видеть строки с `b != 1`, и любой неупомянутый пользователь (например, пользователь `paul`) не увидит никаких строк из `mydb.table1`.

Если это нежелательно, это можно исправить, добавив еще одну политику строк, как следующую:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS Clause {#as-clause}

Разрешено иметь более одной политики, активированной на одной таблице для одного пользователя одновременно. Поэтому нам нужен способ комбинировать условия из нескольких политик.

По умолчанию политики комбинируются с использованием булевого оператора `OR`. Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

разрешают пользователю `peter` видеть строки с `b=1` или `c=2`.

Клауза `AS` указывает, как политики должны комбинироваться с другими политиками. Политики могут быть либо разрешительными, либо ограничительными. По умолчанию политики являются разрешительными, что означает, что они комбинируются с использованием булевого оператора `OR`.

Политика может быть определена как ограничительная как альтернатива. Ограничительные политики комбинируются с использованием булевого оператора `AND`.

Вот общая формула:

```text
row_is_visible = (одно или более условий разрешительных политик не нулевые) AND
                 (все условия ограничительных политик не нулевые)
```

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

разрешают пользователю `peter` видеть строки только в том случае, если выполняются оба условия: `b=1` И `c=2`.

Политики базы данных комбинируются с политиками таблиц.

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

разрешают пользователю `peter` видеть строки из table1 только в том случае, если выполняются оба условия: `b=1` И `c=2`, хотя
любая другая таблица в mydb будет иметь применяемую только политику `b=1` для пользователя.

## ON CLUSTER Clause {#on-cluster-clause}

Позволяет создавать политики строк в кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

## Примеры {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
