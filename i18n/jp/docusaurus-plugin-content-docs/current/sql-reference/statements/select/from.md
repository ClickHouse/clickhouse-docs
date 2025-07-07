---
'description': 'Documentation for FROM Clause'
'sidebar_label': 'FROM'
'slug': '/sql-reference/statements/select/from'
'title': 'FROM Clause'
---




# FROM句

`FROM`句は、データを読み取るソースを指定します：

- [テーブル](../../../engines/table-engines/index.md)
- [サブクエリ](../../../sql-reference/statements/select/index.md) 
- [テーブル関数](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md)および[ARRAY JOIN](../../../sql-reference/statements/select/array-join.md)句も`FROM`句の機能を拡張するために使用できます。

サブクエリは、`FROM`句内の括弧で指定できる別の`SELECT`クエリです。

`FROM`は、カンマで区切られた複数のデータソースを含むことができ、これはそれらに対して[CROSS JOIN](../../../sql-reference/statements/select/join.md)を実行することと同等です。

`FROM`は、オプションで`SELECT`句の前に出現することができます。これは、`SELECT`文を読みやすくするためのClickHouse特有のSQL標準の拡張です。例：

```sql
FROM table
SELECT *
```

## FINAL修飾子 {#final-modifier}

`FINAL`が指定されると、ClickHouseは結果を返す前にデータを完全にマージします。これは、指定されたテーブルエンジンに対してマージ中に発生するすべてのデータ変換も行います。

これは、次のテーブルエンジンを使用してテーブルからデータを選択する際に適用されます：
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL`を使用した`SELECT`クエリは並行して実行されます。[max_final_threads](/operations/settings/settings#max_final_threads)設定は、使用されるスレッドの数を制限します。

### 欠点 {#drawbacks}

`FINAL`を使用するクエリは、`FINAL`を使用しない類似のクエリよりもわずかに遅く実行されます。その理由は次の通りです：

- データはクエリ実行中にマージされます。
- `FINAL`を使用したクエリは、クエリで指定されたカラムに加えて主キーのカラムを読み取る場合があります。

`FINAL`は、通常はマージ時に発生する処理がクエリ時にメモリ内で発生するため、追加の計算およびメモリリソースを必要とします。ただし、データがまだ完全にマージされていないため、正確な結果を得るために`FINAL`を使用する必要がある場合があります。`FINAL`を使用することは、強制的にマージを実行するために`OPTIMIZE`を実行するよりもコストが低くなります。

`FINAL`を使用する代わりに、`MergeTree`エンジンのバックグラウンドプロセスがまだ発生していないと仮定した異なるクエリを使用し、重複を排除するために集約を適用することが時々可能です。必要な結果を得るためにクエリで`FINAL`を使用する必要がある場合は、それを行うことができますが、追加の処理が必要であることを認識しておいてください。

`FINAL`は、セッションまたはユーザープロファイルを使用してクエリ内のすべてのテーブルに自動的に適用できます。[FINAL](../../../operations/settings/settings.md#final)設定を使用します。

### 使用例 {#example-usage}

`FINAL`キーワードを使用する

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

クエリレベルの設定として`FINAL`を使用する

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

セッションレベルの設定として`FINAL`を使用する

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 実装の詳細 {#implementation-details}

`FROM`句が省略された場合、データは`system.one`テーブルから読み取られます。
`system.one`テーブルには、正確に1行が含まれています（このテーブルは他のDBMSに存在するDUALテーブルと同じ目的を果たします）。

クエリを実行するには、クエリでリストされたすべてのカラムが適切なテーブルから抽出されます。外部クエリに必要ないカラムはサブクエリから破棄されます。
クエリがカラムをリストしない場合（例えば、`SELECT count() FROM t`）、行数を計算するためにいくつかのカラムがテーブルから抽出されます（最小のものが優先されます）。
