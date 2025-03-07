---
slug: '/sql-reference/statements/select/from'
sidebar_label: 'FROM'
keywords: ['FROM', 'SQL', 'ClickHouse']
description: 'FROM句はデータソースを指定します。'
---


# FROM句

`FROM`句は、データを読み取るソースを指定します：

- [テーブル](../../../engines/table-engines/index.md)
- [サブクエリ](../../../sql-reference/statements/select/index.md)
- [テーブル関数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) および [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 句も `FROM` 句の機能を拡張するために使用できます。

サブクエリは、`FROM` 句内の括弧の中に指定できる別の `SELECT` クエリです。

`FROM` にはカンマで区切られた複数のデータソースを含めることができ、これはそれらに対して [CROSS JOIN](../../../sql-reference/statements/select/join.md) を実行することに相当します。

`FROM` はオプションで `SELECT` 句の前に表示されることがあります。これは、`SELECT` ステートメントを読みやすくするための ClickHouse 特有の拡張です。例：

```sql
FROM table
SELECT *
```

## FINAL修飾子 {#final-modifier}

`FINAL` が指定された場合、ClickHouse は結果を返す前にデータを完全にマージします。これにより、指定されたテーブルエンジンに対するマージ中に発生するすべてのデータ変換が実行されます。

これは、以下のテーブルエンジンを使用してテーブルからデータを選択する場合に適用されます：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL`を使用した `SELECT` クエリは並行して実行されます。[max_final_threads](/operations/settings/settings#max_final_threads) 設定は、使用されるスレッドの数を制限します。

### 欠点 {#drawbacks}

`FINAL` を使用するクエリは、`FINAL` を使用しない類似のクエリよりもわずかに遅く実行されます。理由は次の通りです：

- クエリ実行中にデータがマージされるため。
- `FINAL`を持つクエリは、クエリに指定されたカラムに加えて主キーのカラムを読む可能性があります。

`FINAL` は追加の計算とメモリリソースを必要とします。なぜなら、通常はマージ時に発生する処理がクエリの実行時にメモリ内で行われなければならないからです。しかし、`FINAL` を使用すると正確な結果を得るために必要な場合もあります（データがまだ完全にマージされていない可能性があるため）。`FINAL` を使用することは、マージを強制するために `OPTIMIZE` を実行するよりもコストがかからない場合があります。

`FINAL`を使用する代わりに、`MergeTree`エンジンのバックグラウンドプロセスがまだ実行されていないと仮定し、集計を適用する（例えば、重複を破棄する）別のクエリを使用することができる場合もあります。必要に応じて、正しい結果を得るためにクエリで `FINAL` を使用することは問題ありませんが、追加の処理が必要であることに留意してください。

`FINAL` は、クエリのセッションまたはユーザープロファイルに対する [FINAL](../../../operations/settings/settings.md#final) 設定を使用して、クエリ内のすべてのテーブルに自動的に適用することができます。

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

`FROM` 句が省略された場合、データは `system.one` テーブルから読み取られます。
`system.one` テーブルは正確に1行を含みます（このテーブルは他のDBMSで見られる DUAL テーブルと同じ目的を果たします）。

クエリを実行するために、クエリでリストされたすべてのカラムは適切なテーブルから抽出されます。外部クエリに必要のないカラムは、サブクエリから取り除かれます。
クエリがカラムをリストに含めていない場合（例えば、`SELECT count() FROM t`）、行数を計算するためにいくつかのカラムはテーブルから抽出されます（最小のものが好まれます）。
