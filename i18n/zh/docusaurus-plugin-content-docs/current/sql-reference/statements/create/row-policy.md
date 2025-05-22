创建一个 [行策略](../../../guides/sre/user-management/index.md#row-policy-management)，即一个用于确定用户可以从表中读取哪些行的过滤器。

:::tip
行策略仅对只读访问的用户有意义。如果用户可以修改表或在表之间复制分区，则会违背行策略的限制。
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

允许指定条件来过滤行。如果条件对该行的计算结果为非零，用户将看到该行。

## TO 子句 {#to-clause}

在 `TO` 部分，您可以提供一个用户和角色的列表，以便此策略适用。例如，`CREATE ROW POLICY ... TO accountant, john@localhost`。

关键字 `ALL` 表示所有 ClickHouse 用户，包括当前用户。关键字 `ALL EXCEPT` 允许从所有用户列表中排除某些用户，例如，`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`。

:::note
如果表中没有定义行策略，则任何用户都可以从表中 `SELECT` 所有行。为表定义一个或多个行策略使得对表的访问依赖于行策略，无论这些行策略是否为当前用户定义。例如，以下策略：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

禁止用户 `mira` 和 `peter` 看到 `b != 1` 的行，任何未提及的用户（例如用户 `paul`）将完全看不到 `mydb.table1` 中的行。

如果这不是所期望的，可以通过添加一个更多行策略来解决，例如：

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS 子句 {#as-clause}

允许在同一时间为同一用户在同一表上启用多个策略。因此，我们需要一种方法来组合来自多个策略的条件。

默认情况下，策略使用布尔 `OR` 操作符组合。例如，以下策略：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

允许用户 `peter` 查看 `b=1` 或 `c=2` 的行。

`AS` 子句指定了策略应如何与其他策略组合。策略可以是允许的或限制性的。默认情况下，策略是允许的，这意味着它们使用布尔 `OR` 操作符组合。

作为替代方案，策略可以定义为限制性的。限制性策略使用布尔 `AND` 操作符组合。

以下是一般公式：

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

例如，以下策略：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

仅在 `b=1` 和 `c=2` 都为真时允许用户 `peter` 查看行。

数据库策略与表策略组合。

例如，以下策略：

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

仅在 `b=1` 和 `c=2` 都为真时允许用户 `peter` 查看 table1 的行，尽管在 mydb 中的任何其他表只会对该用户应用 `b=1` 策略。

## ON CLUSTER 子句 {#on-cluster-clause}

允许在集群上创建行策略，参见 [分布式 DDL](../../../sql-reference/distributed-ddl.md)。

## 示例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
