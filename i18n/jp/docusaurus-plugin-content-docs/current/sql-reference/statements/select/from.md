---
description: 'FROM 句に関する文書'
sidebar_label: 'FROM'
slug: /sql-reference/statements/select/from
title: 'FROM 句'
---


# FROM 句

`FROM` 句は、データを読み取るソースを指定します。

- [テーブル](../../../engines/table-engines/index.md)
- [サブクエリ](../../../sql-reference/statements/select/index.md) 
- [テーブル関数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) および [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 句も `FROM` 句の機能を拡張するために使用できます。

サブクエリは、`FROM` 句の中に括弧で指定される別の `SELECT` クエリです。

`FROM` には、カンマで区切られた複数のデータソースを含めることができ、これはそれらに対して [CROSS JOIN](../../../sql-reference/statements/select/join.md) を実行することと同等です。

`FROM` は、オプションで `SELECT` 句の前に挿入することができます。これは、標準 SQL の ClickHouse 特有の拡張で、`SELECT` 文を読みやすくします。例：

```sql
FROM table
SELECT *
```

## FINAL 修飾子 {#final-modifier}

`FINAL` が指定されると、ClickHouse は結果を返す前にデータを完全にマージします。これは、指定されたテーブルエンジンのマージ中に行われるすべてのデータ変換を実行します。

次のテーブルエンジンを使用してテーブルからデータを選択する場合に適用されます：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL` を使用した `SELECT` クエリは並行して実行されます。[max_final_threads](/operations/settings/settings#max_final_threads) 設定は、使用されるスレッドの数を制限します。

### 欠点 {#drawbacks}

`FINAL` を使用するクエリは、`FINAL` を使用しない類似のクエリよりもわずかに遅く実行されます。その理由は以下の通りです：

- クエリ実行中にデータがマージされます。
- `FINAL` を使用したクエリは、クエリに指定されたカラムに加えて主キーのカラムを読み込むことがあります。

`FINAL` は追加の計算およびメモリリソースを必要とするため、通常はマージ時に発生する処理をクエリの実行時にメモリ内で行わなければなりません。しかし、正確な結果を得るためには、時には `FINAL` の使用が必要になることがあります（データがまだ完全にマージされていない可能性があるため）。`FINAL` を使用することは、マージを強制するために `OPTIMIZE` を実行するよりもコストが少ないです。

`FINAL` を使用する代わりに、`MergeTree` エンジンのバックグラウンドプロセスがまだ発生していないと仮定し、重複を排除するために集約を適用するような異なるクエリを使用することが可能な場合もあります。必要な結果を得るためにクエリで `FINAL` を使用する必要がある場合は、そのための追加の処理が必要であることを認識しつつ、使用することができます。

`FINAL` は、セッションまたはユーザープロファイルを使用して、クエリ内のすべてのテーブルに自動的に適用するために [FINAL](../../../operations/settings/settings.md#final) 設定を使用できます。

### 使用例 {#example-usage}

`FINAL` キーワードの使用

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

クエリレベルの設定としての `FINAL` の使用

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

セッションレベルの設定としての `FINAL` の使用

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 実装の詳細 {#implementation-details}

`FROM` 句が省略された場合、データは `system.one` テーブルから読み込まれます。
`system.one` テーブルには、正確に1行が含まれています（このテーブルは、他のDBMSで見られるDUALテーブルと同じ目的を果たします）。

クエリを実行するには、クエリにリストされているすべてのカラムが適切なテーブルから抽出されます。外部クエリに必要でないカラムはサブクエリから排除されます。
クエリがカラムをリストしない場合（例えば、`SELECT count() FROM t`）、行数を計算するために、いくつかのカラムがテーブルから抽出されます（最小のカラムが選択されます）。
