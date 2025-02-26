---
slug: /sql-reference/statements/select/from
sidebar_label: FROM
---

# FROM句

`FROM`句はデータを読み取るソースを指定します:

- [テーブル](../../../engines/table-engines/index.md)
- [サブクエリ](../../../sql-reference/statements/select/index.md) 
- [テーブル関数](../../../sql-reference/table-functions/index.md#table-functions)

[JOIN](../../../sql-reference/statements/select/join.md)および[ARRAY JOIN](../../../sql-reference/statements/select/array-join.md)句は、`FROM`句の機能を拡張するためにも使用できます。

サブクエリは、`FROM`句内で括弧で囲んで指定できる別の`SELECT`クエリです。

`FROM`句は、カンマで区切られた複数のデータソースを含むことができ、これはそれらに対して[CROSS JOIN](../../../sql-reference/statements/select/join.md)を実行するのと同じことになります。

`FROM`句は、オプションとして`SELECT`句の前に表示できます。これは、標準SQLのClickHouse固有の拡張で、`SELECT`文の可読性を向上させます。例:

```sql
FROM table
SELECT *
```

## FINAL修飾子 {#final-modifier}

`FINAL`が指定されると、ClickHouseは結果を返す前にデータを完全にマージします。これにより、指定されたテーブルエンジンに対してマージの際に行われるすべてのデータ変換も実行されます。

以下のテーブルエンジンを使用してデータを選択する際に適用されます:
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL`を含む`SELECT`クエリは並行して実行されます。[max_final_threads](../../../operations/settings/settings.md#max-final-threads)の設定によって、使用されるスレッド数が制限されます。

### 欠点 {#drawbacks}

`FINAL`を使用するクエリは、`FINAL`を使用しない類似のクエリよりもわずかに遅く実行されます。これは次の理由によります:

- クエリ実行中にデータがマージされます。
- `FINAL`を含むクエリは、クエリで指定されたカラムに加えて主キーのカラムも読み取る場合があります。

`FINAL`は追加の計算およびメモリリソースを必要とします。なぜなら、通常はマージ時に発生する処理がクエリ時にメモリ内で発生する必要があるからです。ただし、正確な結果を得るために`FINAL`を使用することが必要な場合もあります（データがまだ完全にマージされていない可能性があるため）。`OPTIMIZE`を実行してマージを強制するよりはコストが低いです。

`FINAL`を使用する代替手段として、`MergeTree`エンジンのバックグラウンドプロセスがまだ発生していないと仮定した異なるクエリを使用し、集約を適用することで（例えば、重複を排除するために）対処することが可能な場合もあります。必要な結果を得るためにクエリで`FINAL`を使用する必要がある場合は、それを行っても問題ありませんが、追加の処理が必要であることを認識しておいてください。

`FINAL`は、セッションまたはユーザープロファイルを使用してクエリ内のすべてのテーブルに自動的に適用することができます。[FINAL](../../../operations/settings/settings.md#final)設定を使用します。

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
`system.one`テーブルは正確に1行を含んでいます（このテーブルは他のDBMSで見られるDUALテーブルと同じ目的を果たします）。

クエリを実行するために、クエリにリストされたすべてのカラムは適切なテーブルから抽出されます。外部クエリに必要ないカラムはサブクエリから除外されます。
クエリにカラムがリストされていない場合（例えば、`SELECT count() FROM t`）、行数を計算するためにテーブルから何らかのカラムが抽出されます（最小のカラムが優先されます）。
