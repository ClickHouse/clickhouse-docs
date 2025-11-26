---
description: '行策略相关文档'
sidebar_label: '行策略'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

创建一个[行策略](../../../guides/sre/user-management/index.md#row-policy-management)，即用于确定用户可以从表中读取哪些行的筛选条件。

:::tip
行策略仅对仅具备只读权限的用户有意义。如果用户可以修改表或在表之间复制分区，行策略施加的限制就会失去作用。
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

用于指定条件以筛选行。对于某一行，当该条件对该行的计算结果为非零值时，用户可以看到该行。



## TO 子句 {#to-clause}

在 `TO` 部分，可以指定此策略适用的用户和角色列表。例如：`CREATE ROW POLICY ... TO accountant, john@localhost`。

关键字 `ALL` 表示所有 ClickHouse 用户，包括当前用户。关键字 `ALL EXCEPT` 允许从所有用户列表中排除某些用户，例如：`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
如果没有为某个表定义任何行策略（row policy），则任意用户都可以对该表执行 `SELECT` 并读取所有行。一旦为该表定义了一条或多条行策略，对该表的访问就会依赖这些行策略，而与这些行策略是否是为当前用户定义的无关。例如，下面的策略：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

会禁止用户 `mira` 和 `peter` 查看满足 `b != 1` 的行，而任何未被提及的用户（例如用户 `paul`）将完全看不到 `mydb.table1` 中的任何行。

如果这不是期望的行为，可以通过再添加一条类似下面的行策略来修正：

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::



## AS 子句

允许在同一张表上针对同一用户同时启用多个策略。所以我们需要一种方式来组合多个策略中的条件。

默认情况下，策略会使用布尔运算符 `OR` 进行组合。例如，以下策略：

```sql
在 mydb.table1 上创建行策略 pol1 使用 b=1 适用于 mira, peter
在 mydb.table1 上创建行策略 pol2 使用 c=2 适用于 peter, antonio
```

使用户 `peter` 能够看到满足 `b=1` 或 `c=2` 的行。

`AS` 子句指定策略应如何与其他策略组合。策略可以是宽松型（permissive）或限制型（restrictive）。默认情况下，策略是宽松型的，这意味着它们使用布尔运算符 `OR` 进行组合。

策略也可以被定义为限制型。限制型策略使用布尔运算符 `AND` 进行组合。

通用公式如下：

```text
row_is_visible = (至少有一个宽松策略的条件非零) AND
                 (所有严格策略的条件均为非零)
```

例如，以下这些策略：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

使用户 `peter` 只能在同时满足 `b=1` 且 `c=2` 时看到行。

数据库级策略会与表级策略叠加生效。

例如，以下策略：

```sql
创建行策略 pol1 在 mydb.* 上 使用 b=1 适用于 mira, peter
创建行策略 pol2 在 mydb.table1 上 使用 c=2 作为限制性 适用于 peter, antonio
```

使用户 `peter` 只能在同时满足 `b=1` 且 `c=2` 时查看 table1 表中的行，
而在 mydb 中的其他任何表上，对该用户则只应用 `b=1` 策略。


## ON CLUSTER 子句 {#on-cluster-clause}

允许在集群范围内创建行策略，参见 [分布式 DDL](../../../sql-reference/distributed-ddl.md)。



## 示例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
