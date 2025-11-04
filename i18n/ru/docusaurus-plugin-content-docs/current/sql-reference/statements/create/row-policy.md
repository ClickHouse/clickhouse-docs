---
slug: '/sql-reference/statements/create/row-policy'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
description: 'Документация для Row Policy'
title: 'CREATE ROW POLICY'
doc_type: reference
---
Создает [ROW POLICY](../../../guides/sre/user-management/index.md#row-policy-management), т.е. фильтр, используемый для определения, какие строки может читать пользователь из таблицы.

:::tip
ROW POLICY имеет смысл только для пользователей с доступом только для чтения. Если пользователь может изменять таблицу или копировать партиции между таблицами, это подрывает ограничения ROW POLICY.
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

В секции `TO` можно указать список пользователей и ролей, для которых эта политика должна работать. Например, `CREATE ROW POLICY ... TO accountant, john@localhost`.

Ключевое слово `ALL` означает всех пользователей ClickHouse, включая текущего пользователя. Ключевое слово `ALL EXCEPT` позволяет исключить некоторых пользователей из списка всех пользователей, например, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`.

:::note
Если для таблицы не определены ROW POLICY, тогда любой пользователь может `SELECT` все строки из таблицы. Определение одной или нескольких ROW POLICY для таблицы делает доступ к таблице зависимым от ROW POLICY, независимо от того, определены ли эти ROW POLICY для текущего пользователя или нет. Например, следующая политика:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

запрещает пользователям `mira` и `peter` видеть строки с `b != 1`, а любой неупомянутый пользователь (например, пользователь `paul`) не увидит никаких строк из `mydb.table1`.

Если это не желательно, это можно исправить, добавив еще одну ROW POLICY, как в следующем примере:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS Clause {#as-clause}

Разрешено иметь более одной политики, включенной на одной таблице для одного пользователя в одно время. Поэтому нам нужен способ комбинировать условия из нескольких политик.

По умолчанию, политики комбинируются с использованием логического оператора `OR`. Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

дают пользователю `peter` возможность видеть строки с `b=1` или `c=2`.

Клаузула `AS` определяет, как политики должны комбинироваться с другими политиками. Политики могут быть либо разрешительными, либо ограничительными. По умолчанию, политики являются разрешительными, что означает, что они комбинируются с использованием логического оператора `OR`.

Политику можно определить как ограничительную в качестве альтернативы. Ограничительные политики комбинируются с использованием логического оператора `AND`.

Вот общая формула:

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

дают пользователю `peter` возможность видеть строки только если одновременно выполняются условия `b=1` И `c=2`.

Политики базы данных комбинируются с политиками таблиц.

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

дают пользователю `peter` возможность видеть строки из table1 только если одновременно выполняются условия `b=1` И `c=2`, хотя
в любой другой таблице в mydb будет применена только политика `b=1` для пользователя.

## ON CLUSTER Clause {#on-cluster-clause}

Позволяет создавать ROW POLICY на кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).

## Примеры {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`