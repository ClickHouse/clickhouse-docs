---
description: 'FROM句に関するドキュメント'
sidebar_label: 'FROM'
slug: /sql-reference/statements/select/from
title: 'FROM句'
doc_type: 'reference'
---



# FROM 句

`FROM` 句は、データを読み取るソースを指定します。

* [テーブル](../../../engines/table-engines/index.md)
* [サブクエリ](../../../sql-reference/statements/select/index.md)
* [テーブル関数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 句および [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 句を使用して、`FROM` 句の機能を拡張することもできます。

サブクエリは、`FROM` 句内で括弧に入れて指定できる別の `SELECT` クエリです。

`FROM` には複数のデータソースをカンマ区切りで含めることができ、これはそれらに対して [CROSS JOIN](../../../sql-reference/statements/select/join.md) を実行するのと同等です。

`FROM` は任意で `SELECT` 句の前に記述できます。これは、`SELECT` 文を読みやすくするための、標準 SQL に対する ClickHouse 固有の拡張です。例:

```sql
FROM table
SELECT *
```


## FINAL修飾子 {#final-modifier}

`FINAL`を指定すると、ClickHouseは結果を返す前にデータを完全にマージします。これにより、指定されたテーブルエンジンのマージ時に発生するすべてのデータ変換も実行されます。

以下のテーブルエンジンを使用するテーブルからデータを選択する際に適用できます:

- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL`を使用した`SELECT`クエリは並列実行されます。[max_final_threads](/operations/settings/settings#max_final_threads)設定により、使用されるスレッド数が制限されます。

### 欠点 {#drawbacks}

`FINAL`を使用するクエリは、`FINAL`を使用しない同様のクエリよりもわずかに実行速度が遅くなります。その理由は以下の通りです:

- クエリ実行中にデータがマージされる。
- `FINAL`を使用するクエリは、クエリで指定された列に加えて主キー列を読み取る場合がある。

`FINAL`は追加の計算リソースとメモリリソースを必要とします。これは、通常マージ時に発生する処理が、クエリ実行時にメモリ内で行われる必要があるためです。ただし、正確な結果を得るためにはFINALの使用が必要な場合があります(データがまだ完全にマージされていない可能性があるため)。マージを強制するために`OPTIMIZE`を実行するよりもコストは低くなります。

`FINAL`を使用する代わりに、`MergeTree`エンジンのバックグラウンドプロセスがまだ発生していないことを前提とした異なるクエリを使用し、集計を適用することで対処できる場合があります(例えば、重複を破棄するなど)。必要な結果を得るためにクエリで`FINAL`を使用する必要がある場合は、使用しても問題ありませんが、追加の処理が必要であることに注意してください。

`FINAL`は、セッションまたはユーザープロファイルを使用して、[FINAL](../../../operations/settings/settings.md#final)設定によりクエリ内のすべてのテーブルに自動的に適用できます。

### 使用例 {#example-usage}

`FINAL`キーワードの使用

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

クエリレベル設定としての`FINAL`の使用

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

セッションレベル設定としての`FINAL`の使用

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```


## 実装の詳細 {#implementation-details}

`FROM`句が省略された場合、データは`system.one`テーブルから読み取られます。
`system.one`テーブルには正確に1行が含まれています(このテーブルは他のDBMSに存在するDUALテーブルと同じ目的を果たします)。

クエリを実行する際、クエリに記載されているすべてのカラムが適切なテーブルから抽出されます。外部クエリで不要なカラムはサブクエリから除外されます。
クエリがカラムを指定していない場合(例:`SELECT count() FROM t`)、行数を計算するために、いずれかのカラムがテーブルから抽出されます(最小のものが優先されます)。
