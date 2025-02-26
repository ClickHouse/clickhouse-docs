---
slug: /sql-reference/statements/create/row-policy
sidebar_position: 41
sidebar_label: 行ポリシー
title: "行ポリシーの作成"
---

[行ポリシー](../../../guides/sre/user-management/index.md#row-policy-management)を作成します。つまり、ユーザーがテーブルからどの行を読み取ることができるかを決定するためのフィルタです。

:::tip
行ポリシーは、リードオンリーアクセスのユーザーのみに意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制限が無効になります。
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

行をフィルタするための条件を指定できます。条件が行に対して非ゼロと計算される場合、ユーザーはその行を表示できます。

## TO句 {#to-clause}

`TO`セクションでは、このポリシーが適用されるユーザーやロールのリストを提供できます。例えば、`CREATE ROW POLICY ... TO accountant, john@localhost`のように。

キーワード`ALL`は、現在のユーザーを含むすべてのClickHouseユーザーを意味します。キーワード`ALL EXCEPT`を使用すると、特定のユーザーをすべてのユーザーリストから除外することができます。例えば、`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`のように。

:::note
テーブルに行ポリシーが定義されていない場合、任意のユーザーがテーブルからすべての行を`SELECT`できます。テーブルのために1つ以上の行ポリシーを定義すると、テーブルへのアクセスは行ポリシーに依存します。たとえそれらの行ポリシーが現在のユーザーのために定義されていなくてもです。例えば、次のポリシー：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

は、ユーザー`mira`と`peter`が`b != 1`の行を表示することを禁じ、言及されていないユーザー（例えばユーザー`paul`）は`mydb.table1`の行をまったく表示できなくなります。

望ましくない場合は、次のような別の行ポリシーを追加することで修正できます：

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS句 {#as-clause}

同じユーザーに対して、同じテーブルで複数のポリシーを同時に有効にすることができます。そのため、複数のポリシーから条件を組み合わせる方法が必要です。

デフォルトでは、ポリシーはブール`OR`演算子を使用して組み合わされます。例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

は、ユーザー`peter`が`b=1`または`c=2`の行を表示できることを許可します。

`AS`句は、ポリシーが他のポリシーとどのように組み合わされるべきかを指定します。ポリシーは許可するものまたは制限するものであり、デフォルトではポリシーは許可されているため、ブール`OR`演算子を使用して組み合わされます。

ポリシーは制限的に定義できます。制限的なポリシーはブール`AND`演算子を使用して組み合わされます。

一般的な公式は次のとおりです：

```text
row_is_visible = (一つ以上の許可ポリシーの条件が非ゼロである) AND
                 (すべての制限ポリシーの条件が非ゼロである)
```

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

は、ユーザー`peter`が両方の条件`b=1`と`c=2`が満たされている行のみを表示できることを許可します。

データベースポリシーはテーブルポリシーと組み合わせて適用されます。

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

は、ユーザー`peter`がテーブル`table1`の行を表示できるのは、両方の条件`b=1`と`c=2`が満たされている場合のみであり、mydbの他のテーブルには、ユーザーに対しては`b=1`ポリシーのみが適用されます。

## ON CLUSTER句 {#on-cluster-clause}

クラスタ上に行ポリシーを作成することを許可します。詳細は[分散DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

## 例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
