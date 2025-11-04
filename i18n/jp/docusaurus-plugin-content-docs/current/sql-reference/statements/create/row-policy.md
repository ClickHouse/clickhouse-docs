---
'description': 'Row Policyに関するDocumentation'
'sidebar_label': 'ROW POLICY'
'sidebar_position': 41
'slug': '/sql-reference/statements/create/row-policy'
'title': 'CREATE ROW POLICY'
'doc_type': 'reference'
---

Creates a [row policy](../../../guides/sre/user-management/index.md#row-policy-management)、すなわち、ユーザーがテーブルから読み取ることができる行を決定するために使用されるフィルターです。

:::tip
行ポリシーは、読み取り専用アクセスを持つユーザーにのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーすることができる場合、行ポリシーの制限は無意味になります。
:::

構文：

```sql
CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE] policy_name1 [ON CLUSTER cluster_name1] ON [db1.]table1|db1.*
        [, policy_name2 [ON CLUSTER cluster_name2] ON [db2.]table2|db2.* ...]
    [IN access_storage_type]
    [FOR SELECT] USING condition
    [AS {PERMISSIVE | RESTRICTIVE}]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
```

## USING句 {#using-clause}

行をフィルタリングする条件を指定することができます。条件が行に対して非ゼロに計算される場合、ユーザーはその行を見ることができます。

## TO句 {#to-clause}

`TO`セクションでは、このポリシーが適用されるユーザーとロールのリストを提供できます。例えば、`CREATE ROW POLICY ... TO accountant, john@localhost`。

キーワード `ALL` は、現在のユーザーを含むすべてのClickHouseユーザーを意味します。キーワード `ALL EXCEPT` は、すべてのユーザーリストから特定のユーザーを除外することを許可します。例えば、`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`。

:::note
テーブルに行ポリシーが定義されていない場合、任意のユーザーはテーブルからすべての行を `SELECT` できます。テーブルに対して1つ以上の行ポリシーを定義することで、テーブルへのアクセスが行ポリシーに依存することになります。これには、現在のユーザーに対して行ポリシーが定義されているかどうかは関係ありません。例えば、次のポリシー：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

は、ユーザー `mira` と `peter` が `b != 1` の行を見ることを禁じ、指定されていないユーザー（例: ユーザー `paul`）は `mydb.table1` の行を一切見ることができなくなります。

それが望ましくない場合は、次のように追加の行ポリシーを追加することで修正できます：

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS句 {#as-clause}

同じテーブルの同じユーザーに複数のポリシーが同時に有効であることが許可されています。そのため、複数のポリシーからの条件を組み合わせる方法が必要です。

デフォルトでは、ポリシーはブール `OR` 演算子を使用して組み合わされます。例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

は、ユーザー `peter` が `b=1` か `c=2` のいずれかの行を見ることを可能にします。

`AS` 句は、ポリシーが他のポリシーとどのように組み合わされるかを指定します。ポリシーは許可的でも制限的でもありえます。デフォルトでは、ポリシーは許可的で、ブール `OR` 演算子を使用して組み合わされます。

ポリシーは、制限的なものとして定義することもできます。制限的なポリシーは、ブール `AND` 演算子を使用して組み合わされます。

一般的な公式は次のとおりです：

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

は、ユーザー `peter` が `b=1` かつ `c=2` の両方が満たされたときのみ行を見ることを可能にします。

データベースポリシーはテーブルポリシーと組み合わされます。

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

は、ユーザー `peter` がテーブル1の行を見ることを可能にしますが、`b=1` かつ `c=2` の両方が満たされたときのみです。ただし、mydbの他のテーブルには、ユーザーに対して `b=1` ポリシーのみが適用されます。

## ON CLUSTER句 {#on-cluster-clause}

クラスタ上で行ポリシーを作成することを許可します。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

## 例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
