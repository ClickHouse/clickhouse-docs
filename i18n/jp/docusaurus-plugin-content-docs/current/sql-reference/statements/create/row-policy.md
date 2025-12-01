---
description: '行ポリシーに関するドキュメント'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

[行ポリシー](../../../guides/sre/user-management/index.md#row-policy-management)を作成します。行ポリシーとは、ユーザーがテーブルから参照できる行を決定するために使用されるフィルターです。

:::tip
行ポリシーは、読み取り専用アクセスを持つユーザーに対してのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーによる制限は意味をなさなくなります。
:::

構文:

```sql
CREATE [ROW] POLICY [IF NOT EXISTS | OR REPLACE] policy_name1 [ON CLUSTER cluster_name1] ON [db1.]table1|db1.*
        [, policy_name2 [ON CLUSTER cluster_name2] ON [db2.]table2|db2.* ...]
    [IN access_storage_type]
    [FOR SELECT] USING condition
    [AS {PERMISSIVE | RESTRICTIVE}]
    [TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}]
```


## USING 句 {#using-clause}

行をフィルタリングする条件を指定できます。条件がその行に対して 0 以外の値になると、その行はユーザーに表示されます。



## TO 句 {#to-clause}

`TO` 句では、このポリシーを適用するユーザーおよびロールのリストを指定できます。例えば、`CREATE ROW POLICY ... TO accountant, john@localhost` のようになります。

キーワード `ALL` は、現在のユーザーを含むすべての ClickHouse ユーザーを意味します。キーワード `ALL EXCEPT` は、すべてのユーザーのリストから特定のユーザーを除外することができます。例えば、`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost` のようになります。

:::note
テーブルに行ポリシーが 1 つも定義されていない場合、どのユーザーもそのテーブルからすべての行を `SELECT` できます。テーブルに 1 つ以上の行ポリシーを定義すると、それらの行ポリシーが現在のユーザー向けに定義されているかどうかに関係なく、テーブルへのアクセスは行ポリシーに依存するようになります。例えば、次のポリシーは:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

ユーザー `mira` と `peter` が `b != 1` の行を参照することを禁止し、その他の記載されていないユーザー（例えばユーザー `paul`）は `mydb.table1` からは一切行を参照できません。

これが望ましくない場合は、次のような行ポリシーをもう 1 つ追加することで解決できます。

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::



## AS 句 {#as-clause}

同じテーブルおよび同じユーザーに対して、同時に複数のポリシーを有効にすることができます。そのため、複数のポリシーに含まれる条件を組み合わせる方法が必要になります。

デフォルトでは、ポリシーは論理演算子 `OR` を使って結合されます。たとえば、次のようなポリシーがある場合を考えます。

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

ユーザー `peter` が、`b=1` または `c=2` の行を閲覧できるようにします。

`AS` 句は、ポリシーを他のポリシーとどのように組み合わせるかを指定します。ポリシーは、許可ポリシー (permissive) または制限ポリシー (restrictive) のいずれかです。デフォルトではポリシーは許可ポリシーであり、ブール演算子 `OR` で組み合わされることを意味します。

代わりにポリシーを制限ポリシーとして定義することもできます。制限ポリシーはブール演算子 `AND` で組み合わされます。

一般的な式は次のとおりです。

```text
row_is_visible = (1つ以上の許可ポリシーの条件が非ゼロである) AND
                 (すべての制限ポリシーの条件が非ゼロである)
```

例として、次のようなポリシーが挙げられます。

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

ユーザー `peter` が `b=1` かつ `c=2` の行だけを閲覧できるようにします。

データベースポリシーはテーブルポリシーと組み合わされます。

たとえば、次のポリシーがあります。

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

ユーザー `peter` に対しては、`b=1` かつ `c=2` の両方を満たす場合にのみ table1 の行を参照できるように設定しつつ、
mydb 内の他のテーブルには、そのユーザーに対して `b=1` のポリシーのみが適用されるようにします。


## ON CLUSTER 句 {#on-cluster-clause}

クラスター上で行ポリシーを作成できるようにします。[Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。



## 例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
