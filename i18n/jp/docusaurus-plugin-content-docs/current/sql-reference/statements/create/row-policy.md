---
'description': 'Documentation for Row Policy'
'sidebar_label': 'ROW POLICY'
'sidebar_position': 41
'slug': '/sql-reference/statements/create/row-policy'
'title': 'CREATE ROW POLICY'
---



Creates a [row policy](../../../guides/sre/user-management/index.md#row-policy-management), すなわち、ユーザーがテーブルから読み取ることのできる行を決定するために使用されるフィルター。

:::tip
行ポリシーは、読み取り専用アクセスを持つユーザーにのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制約は無効になります。
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

## USING Clause {#using-clause}

行をフィルタリングする条件を指定できます。条件が行に対して非ゼロと計算される場合、ユーザーはその行を見ることができます。

## TO Clause {#to-clause}

`TO`セクションでは、このポリシーが適用されるユーザーやロールのリストを提供できます。例えば、`CREATE ROW POLICY ... TO accountant, john@localhost`。

キーワード`ALL`は、現在のユーザーを含む全てのClickHouseユーザーを意味します。キーワード`ALL EXCEPT`は、全ユーザーリストから一部のユーザーを除外することを可能にします。例えば、`CREATE ROW POLICY ... TO ALL EXCEPT accountant, john@localhost`。

:::note
テーブルに行ポリシーが定義されていない場合、任意のユーザーはテーブルからすべての行を`SELECT`できます。テーブルに1つ以上の行ポリシーを定義すると、テーブルへのアクセスは行ポリシーに依存し、現在のユーザーに対してこれらの行ポリシーが定義されているかどうかにかかわらず、その影響を受けます。例えば、次のポリシー：

`CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter`

はユーザー`mira`および`peter`が`b != 1`の行を見ることを禁止し、非指定のユーザー（例：ユーザー`paul`）は`mydb.table1`の行を全く見ることができません。

それが望ましくない場合、次のようにもう1つの行ポリシーを追加することで修正できます：

`CREATE ROW POLICY pol2 ON mydb.table1 USING 1 TO ALL EXCEPT mira, peter`
:::

## AS Clause {#as-clause}

同じテーブルに対して同じユーザーに複数のポリシーを同時に有効にすることができます。したがって、複数のポリシーから条件を結合する方法が必要です。

デフォルトでは、ポリシーはブール`OR`演算子を使用して結合されます。例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 TO peter, antonio
```

はユーザー`peter`が`b=1`または`c=2`のいずれかの行を見ることを可能にします。

`AS`句は、ポリシーを他のポリシーとどのように結合するかを指定します。ポリシーは許可型または制限型のいずれかとして定義できます。デフォルトでは、ポリシーは許可型であり、これはブール`OR`演算子を使用して結合されることを意味します。

ポリシーは代わりに制限型として定義できます。制限型ポリシーはブール`AND`演算子を使用して結合されます。

一般的な式は次のとおりです：

```text
row_is_visible = (one or more of the permissive policies' conditions are non-zero) AND
                 (all of the restrictive policies's conditions are non-zero)
```

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.table1 USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

はユーザー`peter`が両方`b=1`および`c=2`の場合にのみ行を見ることを可能にします。

データベースポリシーはテーブルポリシーと組み合わされます。

例えば、次のポリシー：

```sql
CREATE ROW POLICY pol1 ON mydb.* USING b=1 TO mira, peter
CREATE ROW POLICY pol2 ON mydb.table1 USING c=2 AS RESTRICTIVE TO peter, antonio
```

はユーザー`peter`がテーブル1の行を見ることを可能にするのは両方`b=1`および`c=2`である場合に限られますが、mydb内の他の任意のテーブルには、ユーザーに対して`b=1`ポリシーのみが適用されます。

## ON CLUSTER Clause {#on-cluster-clause}

クラスター上で行ポリシーを作成することを可能にします。[Distributed DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

## Examples {#examples}

`CREATE ROW POLICY filter1 ON mydb.mytable USING a<1000 TO accountant, john@localhost`

`CREATE ROW POLICY filter2 ON mydb.mytable USING a<1000 AND b=5 TO ALL EXCEPT mira`

`CREATE ROW POLICY filter3 ON mydb.mytable USING 1 TO admin`

`CREATE ROW POLICY filter4 ON mydb.* USING 1 TO admin`
