---
description: 'Документация по ROW POLICY'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
---

Создает [row policy](../../../guides/sre/user-management/index.md#row-policy-management), т.е. фильтр, используемый для определения, какие строки может читать пользователь из таблицы.

:::tip
Row policies имеют смысл только для пользователей с доступом только для чтения. Если пользователь может изменять таблицу или копировать партиции между таблицами, это нарушает ограничения row policies.
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

В секции `TO` вы можете указать список пользователей и ролей, для которых будет работать эта политика. Например, `CREATE ROW POLICY ... TO accountant, john@localhost`.

Ключевое слово `ALL` означает всех пользователей ClickHouse, включая текущего пользователя. Ключевое слово `ALL EXCEPT` позволяет исключить некоторых пользователей из списка всех пользователей, например, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`.

:::note
Если для таблицы не определены row policies, тогда любой пользователь может `SELECT` все строки из таблицы. Определение одной или нескольких row policies для таблицы делает доступ к таблице зависимым от row policies, независимо от того, определены ли эти row policies для текущего пользователя или нет. Например, следующая политика:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

запрещает пользователям `mira` и `peter` видеть строки с `b != 1`, и любой неупомянутый пользователь (например, пользователь `paul`) вообще не увидит строки из `mydb.table1`.

Если это нежелательно, это можно исправить, добавив еще одну row policy, как следующая:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS Clause {#as-clause}

Разрешено иметь несколько политик, включенных в одну и ту же таблицу для одного и того же пользователя в одно время. Поэтому нам нужен способ комбинировать условия из нескольких политик.

По умолчанию политики комбинируются с использованием логического оператора `OR`. Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

разрешают пользователю `peter` видеть строки с `b=1` или `c=2`.

Клауза `AS` указывает, как политики должны комбинироваться с другими политиками. Политики могут быть либо разрешающими, либо ограничивающими. По умолчанию политики являются разрешающими, что означает, что они комбинируются с использованием логического оператора `OR`.

Политику можно определить как ограничивающую в качестве альтернативы. Ограничивающие политики комбинируются с использованием логического оператора `AND`.

Вот общая формула:

```text
row_is_visible = (одно или несколько условий разрешающих политик ненулевые) AND
                 (все условия ограничивающих политик ненулевые)
```

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

разрешают пользователю `peter` видеть строки только если и `b=1`, и `c=2`.

Политики базы данных комбинируются с политиками таблицы.

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

разрешают пользователю `peter` видеть строки таблицы `table1` только если и `b=1`, и `c=2`, хотя
в любой другой таблице в `mydb` будет применяться только политика `b=1` для пользователя.

## ON CLUSTER Clause {#on-cluster-clause}

Позволяет создавать row policies в кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).

## Examples {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
