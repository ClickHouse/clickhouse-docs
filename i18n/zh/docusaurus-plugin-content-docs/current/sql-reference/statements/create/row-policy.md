---
description: 'ROW POLICY 文档'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

创建一个 [row policy](../../../guides/sre/user-management/index.md#row-policy-management)，即用于确定用户可以从表中读取哪些行的过滤器。

:::tip
Row policy 仅对只读访问的用户有意义。如果某个用户可以修改表或在表之间复制分区，那么 row policy 的限制将会失效。
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

## USING 子句 \{#using-clause\}

允许指定条件来过滤行。只有当对某行计算该条件的结果为非零值时，用户才能看到该行。

## TO 子句 \{#to-clause\}

在 `TO` 部分中，可以提供该策略适用的用户和角色列表。例如：`CREATE ROW POLICY ... TO accountant, john@localhost`。

关键字 `ALL` 表示所有 ClickHouse 用户，包括当前用户。关键字 `ALL EXCEPT` 允许从全部用户列表中排除某些用户，例如：`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
如果没有为某个表定义任何行策略，那么任意用户都可以对该表执行 `SELECT` 以读取所有行。为该表定义一个或多个行策略后，对该表的访问将依赖这些行策略，而不管这些行策略是否是为当前用户定义的。例如，下面的策略：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

禁止用户 `mira` 和 `peter` 查看满足 `b != 1` 的行，且任何未被提及的用户（例如用户 `paul`）将完全看不到 `mydb.table1` 中的任何行。

如果这不是期望的行为，可以通过再添加一个行策略来修正，例如：

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS 子句 \{#as-clause\}

允许在同一张表上针对同一用户同时启用多个策略。因此，我们需要一种方法将多个策略中的条件组合起来。

默认情况下，策略会使用布尔运算符 `OR` 进行组合。例如，以下策略：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

使用户 `peter` 能够看到满足 `b=1` 或 `c=2` 的行。

`AS` 子句指定策略应如何与其他策略组合。策略可以是宽松型（permissive）或严格型（restrictive）。默认情况下，策略是宽松型的，这意味着它们使用布尔运算符 `OR` 进行组合。

也可以将策略定义为严格型。严格型策略使用布尔运算符 `AND` 进行组合。

通用公式如下：

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

例如，下面的策略：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

使用户 `peter` 仅当同时满足 `b=1` 且 `c=2` 时才能查看行。

数据库策略会与表策略组合应用。

例如，以下策略：

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

使用户 `peter` 只能在 `b=1` 且 `c=2` 时查看 table1 的行，尽管
mydb 中的其他任何表对该用户只会应用 `b=1` 的策略。

## ON CLUSTER 子句 \{#on-cluster-clause\}

允许在集群中创建行策略，参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

## 示例 \{#examples\}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
