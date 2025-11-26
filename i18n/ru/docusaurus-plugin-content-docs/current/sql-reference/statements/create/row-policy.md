---
description: 'Документация по политике строк'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

Создает [политику строк](../../../guides/sre/user-management/index.md#row-policy-management), т. е. фильтр, используемый для определения, какие строки пользователь может читать из таблицы.

:::tip
Политики строк имеют смысл только для пользователей с доступом только на чтение. Если пользователь может изменять таблицу или копировать разделы между таблицами, это сводит на нет ограничения политик строк.
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


## Предложение USING {#using-clause}

Позволяет задать условие для фильтрации строк. Пользователь увидит строку, если при вычислении условия для этой строки получается ненулевое значение.



## Клауза TO {#to-clause}

В секции `TO` вы можете указать список пользователей и ролей, для которых должна действовать эта политика. Например, `CREATE ROW POLICY ... TO accountant, john@localhost`.

Ключевое слово `ALL` обозначает всех пользователей ClickHouse, включая текущего пользователя. Ключевое слово `ALL EXCEPT` позволяет исключить некоторых пользователей из списка всех пользователей, например, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
Если для таблицы не определена ни одна строковая политика, любой пользователь может выполнить `SELECT` всех строк из таблицы. Определение одной или нескольких строковых политик для таблицы делает доступ к таблице зависящим от строковых политик, независимо от того, определены ли эти строковые политики для текущего пользователя или нет. Например, следующая политика:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

запрещает пользователям `mira` и `peter` видеть строки с `b != 1`, а любой неупомянутый пользователь (например, пользователь `paul`) вообще не будет видеть никаких строк из `mydb.table1`.

Если это нежелательно, ситуацию можно исправить, добавив ещё одну строковую политику, например:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::



## Оператор AS

Допускается одновременное включение нескольких политик для одной и той же таблицы и одного и того же пользователя. Поэтому нужен способ комбинировать условия из нескольких политик.

По умолчанию политики комбинируются с использованием логического оператора `OR`. Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

разрешить пользователю `peter` просматривать строки, в которых выполняется условие `b=1` или `c=2`.

Оператор `AS` задаёт, как следует объединять политики с другими политиками. Политики могут быть либо разрешающими, либо ограничивающими. По умолчанию политики являются разрешающими, то есть они объединяются с использованием логического оператора `OR`.

Политику также можно определить как ограничивающую. Ограничивающие политики объединяются с использованием логического оператора `AND`.

Общая формула выглядит так:

```text
row_is_visible = (одно или несколько условий разрешающих политик не равно нулю) AND
                 (все условия ограничивающих политик не равны нулю)
```

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

разрешить пользователю `peter` просматривать строки только в том случае, если одновременно выполняются условия `b=1` И `c=2`.

Политики на уровне базы данных объединяются с политиками на уровне таблиц.

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

разрешить пользователю `peter` видеть строки таблицы table1 только при одновременном выполнении условий `b=1` И `c=2`, тогда как
для всех остальных таблиц в mydb для этого пользователя будет применяться только политика `b=1`.


## Предложение ON CLUSTER {#on-cluster-clause}

Позволяет создавать политики доступа к строкам на кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).



## Примеры {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
