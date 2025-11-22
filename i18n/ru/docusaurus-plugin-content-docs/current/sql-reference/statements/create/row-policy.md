---
description: 'Документация по политике на уровне строк'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

Создаёт [политику на уровне строк](../../../guides/sre/user-management/index.md#row-policy-management), то есть фильтр, используемый для определения, какие строки пользователь может читать из таблицы.

:::tip
Политики на уровне строк целесообразно использовать только для пользователей с доступом только на чтение. Если пользователь может изменять таблицу или копировать партиции между таблицами, это сводит на нет ограничения политик на уровне строк.
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


## Секция USING {#using-clause}

Позволяет задать условие для фильтрации строк. Пользователь увидит строку, если условие для неё вычисляется в ненулевое значение.


## Секция TO {#to-clause}

В секции `TO` можно указать список пользователей и ролей, для которых должна действовать данная политика. Например, `CREATE ROW POLICY ... TO accountant, john@localhost`.

Ключевое слово `ALL` означает всех пользователей ClickHouse, включая текущего пользователя. Ключевое слово `ALL EXCEPT` позволяет исключить некоторых пользователей из списка всех пользователей, например, `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
Если для таблицы не определены политики строк, то любой пользователь может выполнить `SELECT` всех строк из таблицы. Определение одной или нескольких политик строк для таблицы делает доступ к таблице зависимым от этих политик, независимо от того, определены ли они для текущего пользователя или нет. Например, следующая политика:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

запрещает пользователям `mira` и `peter` видеть строки с `b != 1`, а любой неупомянутый пользователь (например, пользователь `paul`) вообще не увидит ни одной строки из `mydb.table1`.

Если это нежелательно, можно исправить ситуацию, добавив ещё одну политику строк, например:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::


## Секция AS {#as-clause}

Допускается одновременное применение нескольких политик к одной таблице для одного пользователя. Поэтому необходим способ объединения условий из нескольких политик.

По умолчанию политики объединяются с помощью логического оператора `OR`. Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

позволяют пользователю `peter` видеть строки, где либо `b=1`, либо `c=2`.

Секция `AS` определяет, как политики должны объединяться с другими политиками. Политики могут быть разрешающими или ограничивающими. По умолчанию политики являются разрешающими, что означает их объединение с помощью логического оператора `OR`.

В качестве альтернативы политика может быть определена как ограничивающая. Ограничивающие политики объединяются с помощью логического оператора `AND`.

Общая формула выглядит следующим образом:

```text
row_is_visible = (одно или несколько условий разрешающих политик не равны нулю) AND
                 (все условия ограничивающих политик не равны нулю)
```

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

позволяют пользователю `peter` видеть строки только при выполнении обоих условий: `b=1` AND `c=2`.

Политики базы данных объединяются с политиками таблиц.

Например, следующие политики:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

позволяют пользователю `peter` видеть строки table1 только при выполнении обоих условий: `b=1` AND `c=2`, в то время как
к любой другой таблице в mydb для этого пользователя будет применяться только политика `b=1`.


## Секция ON CLUSTER {#on-cluster-clause}

Позволяет создавать политики строк на кластере, см. [Распределённый DDL](../../../sql-reference/distributed-ddl.md).


## Примеры {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
