---
description: 'Документация для политики строк'
sidebar_label: 'ПОЛИТИКА СТРОК'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'СОЗДАТЬ ПОЛИТИКУ СТРОК'
---

Создает [политику строк](../../../guides/sre/user-management/index.md#row-policy-management), т.е. фильтр, который используется для определения, какие строки пользователь может читать из таблицы.

:::tip
Политики строк имеют смысл только для пользователей с доступом только для чтения. Если пользователь может модифицировать таблицу или копировать разделы между таблицами, это нарушает ограничения политик строк.
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

Позволяет указать условие для фильтрации строк. Пользователь увидит строку, если условие вычисляется как ненулевое для этой строки.

## TO Clause {#to-clause}

В разделе `TO` вы можете предоставить список пользователей и ролей, для которых эта политика должна работать. Например, `CREATE ROW POLICY ... TO accountant, john@localhost`.

Ключевое слово `ALL` означает всех пользователей ClickHouse, включая текущего пользователя. Ключевое слово `ALL EXCEPT` позволяет исключить некоторых пользователей из списка всех пользователей, например, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
Если для таблицы не определены политики строк, тогда любой пользователь может `SELECT` все строки из таблицы. Определение одной или нескольких политик строк для таблицы делает доступ к таблице зависимым от политик строк, независимо от того, определены ли эти политики строк для текущего пользователя или нет. Например, следующая политика:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

запрещает пользователям `mira` и `peter` видеть строки с `b != 1`, а все неупомянутые пользователи (например, пользователь `paul`) не увидят никаких строк из `mydb.table1`.

Если это нежелательно, это можно исправить, добавив еще одну политику строк, например, следующую:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS Clause {#as-clause}

Разрешено иметь более одной политики, включенной для одной и той же таблицы для одного пользователя одновременно. Поэтому нам нужен способ комбинировать условия из нескольких политик.

По умолчанию политики комбинируются с использованием логического оператора `OR`. Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

дают возможность пользователю `peter` видеть строки с `b=1` или `c=2`.

Клаузула `AS` указывает, как политики должны комбинироваться с другими политиками. Политики могут быть либо разрешающими, либо ограничительными. По умолчанию политики разрешающие, что означает, что они комбинируются с использованием логического оператора `OR`.

Политика может быть определена как ограничительная как альтернатива. Ограничительные политики комбинируются с использованием логического оператора `AND`.

Вот общая формула:

```text
row_is_visible = (одно или более условий разрешающих политик ненулевые) AND
                 (все условия ограничительных политик ненулевые)
```

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

дают возможность пользователю `peter` видеть строки только если выполняются оба условия: `b=1` И `c=2`.

Политики базы данных комбинируются с политиками таблиц.

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

дают возможность пользователю `peter` видеть строки из table1 только если выполняются оба условия: `b=1` И `c=2`, хотя для любой другой таблицы в mydb будет применяться только политика `b=1` для этого пользователя.

## ON CLUSTER Clause {#on-cluster-clause}

Позволяет создавать политики строк в кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

## Примеры {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
