---
description: 'FROM 句に関するドキュメント'
sidebar_label: 'FROM'
slug: /sql-reference/statements/select/from
title: 'FROM 句'
doc_type: 'reference'
---

# FROM 句 {#from-clause}

`FROM` 句は、データを読み取る元となるソースを指定します。

* [テーブル](../../../engines/table-engines/index.md)
* [副問い合わせ](../../../sql-reference/statements/select/index.md)
* [テーブル関数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) および [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 句を使用して、`FROM` 句の機能を拡張することもできます。

副問い合わせは、`FROM` 句の中で丸括弧で指定できる、別の `SELECT` クエリです。

`FROM` には、カンマ区切りで複数のデータソースを含めることができ、これはそれらに対して [CROSS JOIN](../../../sql-reference/statements/select/join.md) を実行することと同等です。

`FROM` 句を `SELECT` 句の前に置くこともできます。これは標準 SQL を拡張した ClickHouse 固有の機能で、`SELECT` 文を読みやすくします。例:

```sql
FROM table
SELECT *
```

## FINAL 修飾子 {#final-modifier}

`FINAL` が指定されている場合、ClickHouse は結果を返す前にデータを完全にマージします。これにより、指定されたテーブルエンジンでマージ時に行われるすべてのデータ変換も実行されます。

これは、次のテーブルエンジンを使用するテーブルからデータを選択する場合に適用されます:

* `ReplacingMergeTree`
* `SummingMergeTree`
* `AggregatingMergeTree`
* `CollapsingMergeTree`
* `VersionedCollapsingMergeTree`

`FINAL` を含む `SELECT` クエリは並列に実行されます。[max&#95;final&#95;threads](/operations/settings/settings#max_final_threads) 設定によって、使用されるスレッド数が制限されます。

### 欠点 {#drawbacks}

`FINAL` を使用するクエリは、`FINAL` を使用しない同様のクエリよりもわずかに遅くなります。その理由は次のとおりです:

* クエリ実行中にデータがマージされます。
* `FINAL` を伴うクエリでは、クエリで指定された列に加えて、プライマリキー列を読み取る場合があります。

`FINAL` は、通常はマージ時に行われる処理をクエリ実行時にメモリ上で行う必要があるため、追加の計算リソースとメモリリソースを必要とします。ただし、（データがまだ完全にマージされていない可能性があるため）正確な結果を得るために `FINAL` が必要になる場合もあります。マージを強制するために `OPTIMIZE` を実行するよりも負荷は軽くなります。

`FINAL` の代替として、`MergeTree` エンジンのバックグラウンド処理がまだ行われていないことを前提にして、それを集計の適用（たとえば重複を破棄する）によって扱う、別のクエリを使用できる場合があります。必要な結果を得るためにクエリで `FINAL` を使用する必要がある場合は、使用して問題ありませんが、追加の処理が必要になることに注意してください。

`FINAL` は、セッションまたはユーザープロファイルでの [FINAL](../../../operations/settings/settings.md#final) 設定を用いて、クエリで参照されるすべてのテーブルに対して自動的に適用できます。

### 使用例 {#example-usage}

`FINAL` キーワードの使用

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

クエリレベルの設定として `FINAL` を使用する

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

`FINAL` をセッションレベル設定として使用する

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 実装の詳細 {#implementation-details}

`FROM` 句が省略された場合、データは `system.one` テーブルから読み取られます。
`system.one` テーブルには 1 行だけが含まれています（このテーブルは、他の DBMS に存在する DUAL テーブルと同じ目的を果たします）。

クエリを実行する際、クエリで指定されているすべての列が、対応するテーブルから抽出されます。外側のクエリで不要な列は、サブクエリでは除外されます。
クエリで列が 1 つも指定されていない場合（例: `SELECT count() FROM t`）、行数を計算するために、テーブルから任意の列（サイズが最も小さい列が優先されます）が抽出されます。
