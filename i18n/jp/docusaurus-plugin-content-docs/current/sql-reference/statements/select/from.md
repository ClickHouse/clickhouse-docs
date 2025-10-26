---
'description': 'FROM 句に関するドキュメント'
'sidebar_label': 'FROM'
'slug': '/sql-reference/statements/select/from'
'title': 'FROM 句'
'doc_type': 'reference'
---


# FROM句

`FROM`句は、データを読み込むソースを指定します：

- [テーブル](../../../engines/table-engines/index.md)
- [サブクエリ](../../../sql-reference/statements/select/index.md) 
- [テーブル関数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) および [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 句も、`FROM`句の機能を拡張するために使用できます。

サブクエリは、`FROM`句内の括弧内に指定できる別の `SELECT` クエリです。

`FROM` には、カンマで区切られた複数のデータソースを含めることができ、これはそれらに対して [CROSS JOIN](../../../sql-reference/statements/select/join.md) を実行するのと同等です。

`FROM` はオプションで `SELECT` 句の前に表示されることがあります。これは、`SELECT` 文を読みやすくするための ClickHouse 独自の標準 SQL 拡張です。例：

```sql
FROM table
SELECT *
```

## FINAL修飾子 {#final-modifier}

`FINAL` が指定されると、ClickHouse は結果を返す前にデータを完全にマージします。これにより、指定されたテーブルエンジンのマージ中に発生するすべてのデータ変換も実行されます。

これは、次のテーブルエンジンを使用してテーブルからデータを選択する際に適用されます：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL` を使用した `SELECT` クエリは並行して実行されます。[max_final_threads](/operations/settings/settings#max_final_threads) 設定は、使用されるスレッドの数を制限します。

### 欠点 {#drawbacks}

`FINAL` を使用するクエリは、同様のクエリよりもわずかに遅く実行されます。理由は次の通りです：

- クエリ実行中にデータがマージされます。
- `FINAL` を使用するクエリは、クエリで指定されたカラムに加えて主キーのカラムも読み取る可能性があります。

`FINAL` は追加の計算およびメモリリソースを必要とします。通常マージ時に発生する処理が、クエリ実行時にメモリ内で発生しなければならないためです。ただし、正確な結果を得るために `FINAL` を使用することが必要な場合があります（データが完全にマージされていない可能性があるため）。`OPTIMIZE` を実行して強制的にマージを行うよりもコストは低くなります。

`FINAL` の使用の代わりに、`MergeTree` エンジンのバックグラウンドプロセスがまだ発生していないと仮定し、重複を除外するために集約を適用するなどの異なるクエリを使用することが時々可能です。必要な結果を得るためにクエリで `FINAL` を使用する必要がある場合は、その処理が追加で必要になることを理解しておくべきです。

`FINAL` は、クエリ内のすべてのテーブルに自動的に適用される [FINAL](../../../operations/settings/settings.md#final) 設定を使用して、セッションまたはユーザープロファイルで適用できます。

### 使用例 {#example-usage}

`FINAL` キーワードを使用する

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

クエリレベル設定として `FINAL` を使用する

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

セッションレベル設定として `FINAL` を使用する

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 実装の詳細 {#implementation-details}

`FROM` 句が省略されると、データは `system.one` テーブルから読み込まれます。
`system.one` テーブルは、正確に1行が含まれています（このテーブルは、他のDBMSにあるDUALテーブルと同じ目的を果たします）。

クエリを実行するために、クエリでリストされているすべてのカラムは適切なテーブルから抽出されます。外部クエリに必要のないカラムはサブクエリから除外されます。
クエリがカラムをリストに示さない場合（例えば `SELECT count() FROM t`）でも、行数を計算するためにいくつかのカラムがテーブルから抽出されます（最小のものが優先されます）。
