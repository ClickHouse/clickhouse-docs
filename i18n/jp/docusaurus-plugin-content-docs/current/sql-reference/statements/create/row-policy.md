---
description: '行ポリシーのドキュメント'
sidebar_label: '行ポリシー'
sidebar_position: 41
slug: /sql-reference/statements/create/row-policy
title: '行ポリシーの作成'
---

特定のユーザーがテーブルから読み取ることができる行を決定するために使用されるフィルタ、すなわち [行ポリシー](../../../guides/sre/user-management/index.md#row-policy-management) を作成します。

:::tip
行ポリシーは、読み取り専用アクセスを持つユーザーにのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーしたりできる場合、行ポリシーの制限が無意味になります。
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

行をフィルタリングする条件を指定することを可能にします。条件がその行に対して非ゼロであれば、ユーザーはその行を見ることができます。

## TO句 {#to-clause}

`TO`セクションでは、このポリシーが機能するユーザーやロールのリストを提供できます。例えば、`CREATE ROW POLICY ... TO accountant, john@localhost`のようになります。

キーワード`ALL`は、現在のユーザーを含むすべてのClickHouseユーザーを意味します。キーワード`ALL EXCEPT`を使用すると、すべてのユーザーリストから一部のユーザーを除外できます。例えば、`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`のようになります。

:::note
テーブルに定義された行ポリシーがない場合、任意のユーザーはテーブルからすべての行を`SELECT`できます。テーブルに対して1つ以上の行ポリシーを定義すると、現在のユーザーに対して行ポリシーが定義されているかどうかにかかわらず、テーブルへのアクセスが行ポリシーに依存するようになります。例えば、次のポリシー：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

は、ユーザー`mira`と`peter`に`b != 1`の行を表示させないことになります。また、言及されていないユーザー（例えば、ユーザー`paul`）は、`mydb.table1`から行を一切見られません。

これが望ましくない場合は、次のようにさらに1つの行ポリシーを追加することで修正できます。

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS句 {#as-clause}

同じユーザーに対して同じテーブルで複数のポリシーを有効にすることが許可されています。そのため、複数のポリシーからの条件を結合する方法が必要です。

デフォルトでは、ポリシーはブーリアンの`OR`演算子を使用して結合されます。例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

は、ユーザー`peter`が`b=1`または`c=2`のいずれかの行を見ることを可能にします。

`AS`句は、ポリシーが他のポリシーとどのように結合されるべきかを指定します。ポリシーは、許可的または制限的であることができます。デフォルトでは、ポリシーは許可的であり、これはブーリアンの`OR`演算子を使用して結合されることを意味します。

制限的に定義されたポリシーも代替手段として使用できます。制限的ポリシーは、ブーリアンの`AND`演算子を使用して結合されます。

一般的な式は次の通りです：

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies' conditions are non-zero)
```

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

は、ユーザー`peter`が`b=1`かつ`c=2`の場合のみ行を見ることを可能にします。

データベースポリシーはテーブルポリシーと結合されます。

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

は、ユーザー`peter`がテーブル1の行を見ることを`b=1`かつ`c=2`の場合に制限しますが、mydbの他のテーブルでは、ユーザーに対して`b=1`ポリシーのみが適用されるでしょう。

## ON CLUSTER句 {#on-cluster-clause}

クラスタ上で行ポリシーを作成することを可能にします。詳細は [分散DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

## 例 {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
