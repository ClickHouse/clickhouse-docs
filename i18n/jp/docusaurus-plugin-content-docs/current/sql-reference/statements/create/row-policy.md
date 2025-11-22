---
description: '行ポリシーに関するドキュメント'
sidebar_label: 'ROW POLICY'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: 'CREATE ROW POLICY'
doc_type: 'reference'
---

[行ポリシー](../../../guides/sre/user-management/index.md#row-policy-management)を作成します。行ポリシーとは、ユーザーがテーブルから読み取ることができる行を決定するために使用されるフィルターです。

:::tip
行ポリシーは、読み取り専用アクセス権を持つユーザーに対してのみ有効です。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーによる制限は意味をなさなくなります。
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


## USING句 {#using-clause}

行をフィルタリングする条件を指定します。条件が行に対してゼロ以外の値と評価された場合、ユーザーはその行を参照できます。


## TO句 {#to-clause}

`TO`セクションでは、このポリシーを適用するユーザーとロールのリストを指定できます。例: `CREATE ROW POLICY ... TO accountant, john@localhost`

キーワード`ALL`は、現在のユーザーを含むすべてのClickHouseユーザーを意味します。キーワード`ALL EXCEPT`を使用すると、すべてのユーザーリストから一部のユーザーを除外できます。例: `CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`

:::note
テーブルに行ポリシーが定義されていない場合、すべてのユーザーがテーブルのすべての行を`SELECT`できます。テーブルに1つ以上の行ポリシーを定義すると、それらの行ポリシーが現在のユーザーに対して定義されているかどうかに関わらず、テーブルへのアクセスは行ポリシーに依存するようになります。例えば、次のポリシーは:

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

ユーザー`mira`と`peter`が`b != 1`の行を参照することを禁止し、言及されていないユーザー(例: ユーザー`paul`)は`mydb.table1`からまったく行を参照できなくなります。

これが望ましくない場合は、次のようにもう1つの行ポリシーを追加することで修正できます:

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::


## AS句 {#as-clause}

同じテーブルに対して、同じユーザーに複数のポリシーを同時に有効化することができます。そのため、複数のポリシーの条件を結合する方法が必要になります。

デフォルトでは、ポリシーはブール演算子`OR`を使用して結合されます。例えば、以下のポリシーの場合:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

ユーザー`peter`は`b=1`または`c=2`のいずれかを満たす行を参照できます。

`AS`句は、ポリシーが他のポリシーとどのように結合されるかを指定します。ポリシーは許可的(permissive)または制限的(restrictive)のいずれかになります。デフォルトでは、ポリシーは許可的であり、ブール演算子`OR`を使用して結合されます。

代替として、ポリシーを制限的として定義することもできます。制限的ポリシーはブール演算子`AND`を使用して結合されます。

一般的な式は以下の通りです:

```text
row_is_visible = (許可的ポリシーの条件の1つ以上が非ゼロ) AND
                 (制限的ポリシーの条件のすべてが非ゼロ)
```

例えば、以下のポリシーの場合:

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

ユーザー`peter`は`b=1`と`c=2`の両方を満たす場合にのみ行を参照できます。

データベースポリシーはテーブルポリシーと結合されます。

例えば、以下のポリシーの場合:

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

ユーザー`peter`は`b=1`と`c=2`の両方を満たす場合にのみtable1の行を参照できますが、
mydb内の他のテーブルについては、ユーザーに対して`b=1`ポリシーのみが適用されます。


## ON CLUSTER句 {#on-cluster-clause}

クラスタ上で行ポリシーを作成することができます。[分散DDL](../../../sql-reference/distributed-ddl.md)を参照してください。


## 例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
