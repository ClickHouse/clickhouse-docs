---
description: '行策略文档'
sidebar_label: '行策略'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY（创建行策略）'
doc_type: 'reference'
---

创建一个[行策略](../../../guides/sre/user-management/index.md#row-policy-management)，即用于确定用户可以从表中读取哪些行的过滤器。

:::tip
行策略通常仅适用于具有只读权限的用户。如果用户可以修改表或在表之间复制分区，就可能绕过行策略施加的限制。
:::

语法：

```sql
CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE] policy_name1 [ON CLUSTER cluster_name1] ON [db1.]table1|db1.*
        [, policy_name2 [ON CLUSTER cluster_name2] ON [db2.]table2|db2.* ...]
    [IN access_storage_type]
    [FOR SELECT] USING condition
    [AS {PERMISSIVE | RESTRICTIVE}]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
```


## USING 子句 {#using-clause}

用于指定过滤行的条件。当条件对某一行的计算结果为非零值时,用户可以看到该行。


## TO 子句 {#to-clause}

在 `TO` 部分,您可以指定此策略应用于哪些用户和角色。例如,`CREATE ROW POLICY ... TO accountant, john@localhost`。

关键字 `ALL` 表示所有 ClickHouse 用户,包括当前用户。关键字 `ALL EXCEPT` 允许从所有用户列表中排除某些用户,例如,`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
如果表未定义任何行策略,则任何用户都可以从该表中 `SELECT` 所有行。为表定义一个或多个行策略后,对该表的访问将取决于这些行策略,无论这些行策略是否针对当前用户定义。例如,以下策略:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

禁止用户 `mira` 和 `peter` 查看 `b != 1` 的行,而任何未提及的用户(例如用户 `paul`)将完全无法看到 `mydb.table1` 中的任何行。

如果这不是期望的行为,可以通过添加另一个行策略来解决,如下所示:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::


## AS 子句 {#as-clause}

允许同一用户在同一张表上同时启用多个策略。因此需要一种方法来组合多个策略的条件。

默认情况下,策略使用布尔 `OR` 运算符进行组合。例如,以下策略:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

使用户 `peter` 能够看到满足 `b=1` 或 `c=2` 的行。

`AS` 子句指定策略应如何与其他策略组合。策略可以是宽松型或限制型。默认情况下,策略是宽松型的,这意味着它们使用布尔 `OR` 运算符进行组合。

策略也可以定义为限制型。限制型策略使用布尔 `AND` 运算符进行组合。

通用公式如下:

```text
row_is_visible = (一个或多个宽松型策略的条件非零) AND
                 (所有限制型策略的条件非零)
```

例如,以下策略:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

使用户 `peter` 仅在同时满足 `b=1` 和 `c=2` 时才能看到行。

数据库策略与表策略会进行组合。

例如,以下策略:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

使用户 `peter` 仅在同时满足 `b=1` 和 `c=2` 时才能看到 table1 的行,而
mydb 中的其他任何表对该用户仅应用 `b=1` 策略。


## ON CLUSTER 子句 {#on-cluster-clause}

允许在集群上创建行级策略,详见[分布式 DDL](../../../sql-reference/distributed-ddl.md)。


## 示例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
