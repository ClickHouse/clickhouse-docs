---
slug: /sql-reference/statements/select/from
sidebar_label: FROM
---


# FROM句

`FROM`句はデータを読み取るソースを指定します：

- [テーブル](../../../engines/table-engines/index.md)
- [サブクエリ](../../../sql-reference/statements/select/index.md) 
- [テーブル関数](../../../sql-reference/table-functions/index.md#table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) と [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 句は、`FROM`句の機能を拡張するためにも使用できます。

サブクエリは、`FROM`句内で括弧で指定される別の `SELECT` クエリです。

`FROM` には、カンマで区切られた複数のデータソースを含めることができ、これはそれらに対して [CROSS JOIN](../../../sql-reference/statements/select/join.md) を実行することと同等です。

`FROM` はオプションで `SELECT` 句の前に置くことができます。これは、`SELECT` 文を読みやすくするための ClickHouse 固有の SQL 拡張です。例：

```sql
FROM table
SELECT *
```

## FINAL修飾子 {#final-modifier}

`FINAL` が指定されると、ClickHouseは結果を返す前にデータを完全にマージします。これにより、指定されたテーブルエンジンのマージ中に発生するすべてのデータ変換も行われます。

これは、以下のテーブルエンジンを使用してテーブルからデータを選択する際に適用されます：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL` を使用した `SELECT` クエリは並行して実行されます。[max_final_threads](../../../operations/settings/settings.md#max-final-threads) 設定は、使用されるスレッドの数を制限します。

### 欠点 {#drawbacks}

`FINAL` を使用するクエリは、`FINAL` を使用しない類似のクエリよりもわずかに遅く実行されます。その理由は以下の通りです：

- クエリの実行中にデータがマージされる。
- `FINAL` を持つクエリは、クエリ内で指定されたカラムに加えて主キーのカラムを読み取る可能性があります。

`FINAL` には追加の計算およびメモリリソースが必要です。なぜなら、通常マージ時に発生する処理がクエリ時にメモリ内で発生する必要があるからです。しかし、正確な結果を生成するために `FINAL` を使用することが時々必要です（データがまだ完全にマージされていない可能性があるため）。`FINAL` を使用する方が、強制的にマージを行うために `OPTIMIZE` を実行するよりもコストがかからないです。

`FINAL` の代わりに、`MergeTree` エンジンのバックグラウンドプロセスがまだ発生していないことを前提にした異なるクエリを使用し、重複を処理するために集計を適用することが可能な場合もあります。必要な結果を得るために `FINAL` をクエリに使用する必要がある場合は、その使用を許可しますが、追加の処理が必要であることに留意してください。

`FINAL` は、セッションまたはユーザープロファイルを使用してクエリ内のすべてのテーブルに自動的に適用することができる [FINAL](../../../operations/settings/settings.md#final) 設定を使用できます。

### 使用例 {#example-usage}

`FINAL` キーワードを使用する場合

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

クエリレベルの設定として `FINAL` を使用する場合

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

セッションレベルの設定として `FINAL` を使用する場合

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 実装の詳細 {#implementation-details}

`FROM` 句が省略された場合、データは `system.one` テーブルから読み取られます。
`system.one` テーブルには正確に一行しか含まれておらず（このテーブルは他のDBMSで見られるDUALテーブルと同じ目的を果たします）、クエリを実行するために、クエリ内でリストされたすべてのカラムは適切なテーブルから抽出されます。外部クエリに必要ないカラムはサブクエリから除外されます。
クエリがカラムをリストしていない場合（例：`SELECT count() FROM t`）、行数を計算するためにテーブルからいくつかのカラムが抽出されます（最小のものが優先されます）。
