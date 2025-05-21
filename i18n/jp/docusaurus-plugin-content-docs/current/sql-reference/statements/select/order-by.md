description: 'ORDER BY句のドキュメント'
sidebar_label: 'ORDER BY'
slug: /sql-reference/statements/select/order-by
title: 'ORDER BY句'
```


# ORDER BY Clause

`ORDER BY`句には以下が含まれます。

- 表現のリスト、例えば `ORDER BY visits, search_phrase`、
- `SELECT`句のカラムを指す数値のリスト、例えば `ORDER BY 2, 1`、または
- `ALL`は`SELECT`句のすべてのカラムを意味します、例えば `ORDER BY ALL`。

カラム番号によるソートを無効にするには、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を 0 に設定します。
`ALL`によるソートを無効にするには、設定 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) を 0 に設定します。

`ORDER BY`句にはソート順を定義する `DESC`（降順）または `ASC`（昇順）の修飾子を指定できます。
明示的なソート順が指定されない限り、デフォルトで `ASC` が使用されます。
ソート順は単一の表現に適用され、全体のリストには適用されません。例えば `ORDER BY Visits DESC, SearchPhrase` のように。
また、ソートは大文字小文字を区別して行われます。

ソート表現の同じ値を持つ行は、任意かつ非決定的な順序で返されます。
`SELECT`文で `ORDER BY`句が省略された場合、行の順序も任意かつ非決定的です。

## 特殊値のソート {#sorting-of-special-values}

`NaN`および `NULL` のソート順に関する2つのアプローチがあります。

- デフォルトまたは `NULLS LAST` 修飾子を使う場合：最初に値、その後に `NaN`、さらに `NULL`。
- `NULLS FIRST` 修飾子を使う場合：最初に `NULL`、その後に `NaN`、最後に他の値。

### 例 {#example}

テーブルのために

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 2 │    2 │
│ 1 │  nan │
│ 2 │    2 │
│ 3 │    4 │
│ 5 │    6 │
│ 6 │  nan │
│ 7 │ ᴺᵁᴸᴸ │
│ 6 │    7 │
│ 8 │    9 │
└───┴──────┘
```

クエリ `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` を実行すると、以下のようになります。

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
│ 7 │ ᴺᵁᴸᴸ │
│ 1 │  nan │
│ 6 │  nan │
│ 2 │    2 │
│ 2 │    2 │
│ 3 │    4 │
│ 5 │    6 │
│ 6 │    7 │
│ 8 │    9 │
└───┴──────┘
```

浮動小数点数がソートされると、NaNはその他の値とは別に扱われます。ソート順に関係なく、NaNは最後に配置されます。つまり、昇順ソートではすべての他の数値よりも大きいかのように配置され、降順ソートでは他の数値よりも小さいかのように配置されます。

## 照合サポート {#collation-support}

[String](../../../sql-reference/data-types/string.md)値でソートする場合、照合（比較）を指定できます。例：`ORDER BY SearchPhrase COLLATE 'tr'` - トルコのアルファベットを使用してキーワードを昇順でソートするために、ケースを区別しないUTF-8エンコードされた文字列を前提とします。`COLLATE`は、`ORDER BY`内の各表現に対して独立して指定できます。`ASC`または`DESC`が指定された場合、`COLLATE`はその後に指定されます。`COLLATE`を使用する場合、ソートは常にケースを区別しません。

照合は、[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md)、[Tuple](../../../sql-reference/data-types/tuple.md)でサポートされています。

`COLLATE`の使用は、少数の行の最終的なソートに対してのみ推奨します。なぜなら、`COLLATE`を使用したソートは、バイトによる通常のソートに比べて効率が悪いためです。

## 照合の例 {#collation-examples}

[String](../../../sql-reference/data-types/string.md)値のみの例：

入力テーブル：

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ABC  │
│ 3 │ 123a │
│ 4 │ abc  │
│ 5 │ BCA  │
└───┴──────┘
```

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

```text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

[Nullable](../../../sql-reference/data-types/nullable.md)を使用した例：

入力テーブル：

```text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │ ABC  │
│ 4 │ 123a │
│ 5 │ abc  │
│ 6 │ ᴺᵁᴸᴸ │
│ 7 │ BCA  │
└───┴──────┘
```

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

```text
┌─x─┬─s────┐
│ 4 │ 123a │
│ 5 │ abc  │
│ 3 │ ABC  │
│ 1 │ bca  │
│ 7 │ BCA  │
│ 6 │ ᴺᵁᴸᴸ │
│ 2 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

[Array](../../../sql-reference/data-types/array.md)を使用した例：

入力テーブル：

```text
┌─x─┬─s─────────────┐
│ 1 │ ['Z']         │
│ 2 │ ['z']         │
│ 3 │ ['a']         │
│ 4 │ ['A']         │
│ 5 │ ['z','a']     │
│ 6 │ ['z','a','a'] │
│ 7 │ ['']          │
└───┴───────────────┘
```

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

```text
┌─x─┬─s─────────────┐
│ 7 │ ['']          │
│ 3 │ ['a']         │
│ 4 │ ['A']         │
│ 2 │ ['z']         │
│ 5 │ ['z','a']     │
│ 6 │ ['z','a','a'] │
│ 1 │ ['Z']         │
└───┴───────────────┘
```

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)文字列を使用した例：

入力テーブル：

```response
┌─x─┬─s───┐
│ 1 │ Z   │
│ 2 │ z   │
│ 3 │ a   │
│ 4 │ A   │
│ 5 │ za  │
│ 6 │ zaa │
│ 7 │     │
└───┴─────┘
```

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

```response
┌─x─┬─s───┐
│ 7 │     │
│ 3 │ a   │
│ 4 │ A   │
│ 2 │ z   │
│ 1 │ Z   │
│ 5 │ za  │
│ 6 │ zaa │
└───┴─────┘
```

[Tuple](../../../sql-reference/data-types/tuple.md)を使用した例：

```response
┌─x─┬─s───────┐
│ 1 │ (1,'Z') │
│ 2 │ (1,'z') │
│ 3 │ (1,'a') │
│ 4 │ (2,'z') │
│ 5 │ (1,'A') │
│ 6 │ (2,'Z') │
│ 7 │ (2,'A') │
└───┴─────────┘
```

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

```response
┌─x─┬─s───────┐
│ 3 │ (1,'a') │
│ 5 │ (1,'A') │
│ 2 │ (1,'z') │
│ 1 │ (1,'Z') │
│ 7 │ (2,'A') │
│ 4 │ (2,'z') │
│ 6 │ (2,'Z') │
└───┴─────────┘
```

## 実装の詳細 {#implementation-details}

`ORDER BY`とともに小さな [LIMIT](../../../sql-reference/statements/select/limit.md) を指定すると、使用するRAMが少なくなります。そうでない場合、使用されるメモリはソートするデータ量に比例します。分散クエリプロセッシングでは、[GROUP BY](/sql-reference/statements/select/group-by) が省略された場合、ソートは部分的にリモートサーバーで行われ、その結果がリクエスタサーバー上でマージされます。これにより、分散ソートの場合、ソートするデータ量が単一サーバーのメモリ量を超えることがあります。

メモリが不足している場合は、外部メモリでソートを実行できます（ディスク上に一時ファイルを作成）。この目的には `max_bytes_before_external_sort` 設定を使用します。この設定を0にすると（デフォルト）、外部ソートが無効になります。これが有効な場合、ソートするデータ量が指定されたバイト数に達すると、収集されたデータがソートされ、一時ファイルにダンプされます。すべてのデータが読み込まれた後、すべてのソートされたファイルがマージされ、結果が出力されます。ファイルは設定の `/var/lib/clickhouse/tmp/` ディレクトリに書き込まれます（デフォルトですが、`tmp_path` パラメーターを使用してこの設定を変更できます）。

クエリを実行すると、`max_bytes_before_external_sort` よりも多くのメモリを使用する場合があります。このため、この設定は `max_memory_usage` よりもかなり小さい値を持つ必要があります。例えば、サーバーが128 GBのRAMを持ち、単一のクエリを実行する必要がある場合、`max_memory_usage` を100 GBに、`max_bytes_before_external_sort` を80 GBに設定します。

外部ソートはRAM内でのソートに比べて非常に効率が悪いです。

## データ読み取りの最適化 {#optimization-of-data-reading}

 `ORDER BY`表現がテーブルのソートキーと一致するプレフィックスを持っている場合、[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 設定を使用してクエリを最適化できます。

 `optimize_read_in_order` 設定が有効な場合、ClickHouseサーバーはテーブルインデックスを使用し、`ORDER BY`キーの順序でデータを読み取ります。これにより、指定された [LIMIT](../../../sql-reference/statements/select/limit.md) の場合にすべてのデータを読み取ることを避けることができます。したがって、大きなデータに対する小さなリミットのクエリはより高速に処理されます。

最適化は `ASC` と `DESC` の両方で機能し、[GROUP BY](/sql-reference/statements/select/group-by) 句および [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子とは一緒に機能しません。

`optimize_read_in_order` 設定が無効な場合、ClickHouseサーバーは `SELECT` クエリを処理する際にテーブルインデックスを使用しません。

`ORDER BY`句、長い `LIMIT` および読み込む記録の巨大な量を必要とする [WHERE](../../../sql-reference/statements/select/where.md) 条件を持つクエリを実行するときは、手動で `optimize_read_in_order` を無効にすることを検討してください。

最適化は以下のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）
- [Merge](../../../engines/table-engines/special/merge.md)
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView`エンジンテーブルでは、`SELECT ... FROM merge_tree_table ORDER BY pk` のようなビューで最適化が機能します。しかし、`SELECT ... FROM view ORDER BY pk` の場合で、ビュークエリに `ORDER BY`句がない場合にはサポートされていません。

## ORDER BY Expr WITH FILL 修飾子 {#order-by-expr-with-fill-modifier}

この修飾子は、[LIMIT ... WITH TIES 修飾子](/sql-reference/statements/select/limit#limit--with-ties-modifier)とも組み合わせることができます。

`WITH FILL` 修飾子は、オプションの `FROM expr`、`TO expr` および `STEP expr` パラメータとともに、`ORDER BY expr` の後に設定できます。
すべての欠落した `expr`カラムの値は逐次的に埋められ、他のカラムはデフォルト値で埋められます。

複数のカラムを埋めるには、`ORDER BY`セクションの各フィールド名の後にオプションのパラメータとともに `WITH FILL` 修飾子を追加します。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL`は、Numeric（すべての種類のfloat、decimal、int）またはDate/DateTimeタイプのフィールドに適用できます。`String`フィールドに適用される場合、欠落した値は空文字列で埋められます。
`FROM const_expr`が定義されていない場合、埋める順序は `ORDER BY` からの最小の `expr`フィールド値を使用します。
`TO const_expr`が定義されていない場合、埋める順序は `ORDER BY` からの最大の `expr`フィールド値を使用します。
`STEP const_numeric_expr`が定義されている場合、 `const_numeric_expr` は数値型に対してはそのまま解釈され、Date型に対しては `days`、DateTime型に対しては `seconds` として解釈されます。また、時間と日付の間隔を表す [INTERVAL](/sql-reference/data-types/special-data-types/interval/)データ型もサポートしています。
`STEP const_numeric_expr`が省略されると、埋める順序は数値型に対しては `1.0`、Date型に対しては `1 day`、DateTime型に対しては `1 second` となります。
`STALENESS const_numeric_expr` が定義されている場合、クエリは元のデータの前の行との差が`const_numeric_expr`を超えるまで行を生成します。
`INTERPOLATE` は `ORDER BY WITH FILL` に参加していない列に適用できます。このようなカラムは、前のフィールド値に基づいて `expr` を適用して埋められます。`expr` がない場合は、前の値を繰り返します。省略されたリストは、許可されたすべてのカラムを含む結果になります。

`WITH FILL`なしのクエリの例：

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

結果：

```text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

`WITH FILL` 修飾子を適用した後の同じクエリ：

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果：

```text
┌───n─┬─source───┐
│   0 │          │
│ 0.5 │          │
│   1 │ original │
│ 1.5 │          │
│   2 │          │
│ 2.5 │          │
│   3 │          │
│ 3.5 │          │
│   4 │ original │
│ 4.5 │          │
│   5 │          │
│ 5.5 │          │
│   7 │ original │
└─────┴──────────┘
```

複数フィールドの場合 `ORDER BY field2 WITH FILL, field1 WITH FILL` の場合、埋める順序は `ORDER BY` 句のフィールドの順序に従います。

例：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d2 WITH FILL,
    d1 WITH FILL STEP 5;
```

結果：

```text
┌───d1───────┬───d2───────┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-01 │ 1970-01-03 │          │
│ 1970-01-01 │ 1970-01-04 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-01-01 │ 1970-01-06 │          │
│ 1970-01-01 │ 1970-01-07 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

フィールド `d1` は埋まらずデフォルト値を使用します。なぜなら、`d2` の値に対して繰り返し値がないため、その順序が適切に計算できないからです。

`ORDER BY` でフィールドを変更した次のクエリ：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP 5,
    d2 WITH FILL;
```

結果：

```text
┌───d1───────┬───d2───────┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-16 │ 1970-01-01 │          │
│ 1970-01-21 │ 1970-01-01 │          │
│ 1970-01-26 │ 1970-01-01 │          │
│ 1970-01-31 │ 1970-01-01 │          │
│ 1970-02-05 │ 1970-01-01 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
│ 1970-02-15 │ 1970-01-01 │          │
│ 1970-02-20 │ 1970-01-01 │          │
│ 1970-02-25 │ 1970-01-01 │          │
│ 1970-03-02 │ 1970-01-01 │          │
│ 1970-03-07 │ 1970-01-01 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

このクエリでは、`d1`カラムに対して1日の日付の `INTERVAL` データ型を使用しています：

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    'original' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP INTERVAL 1 DAY,
    d2 WITH FILL;
```

結果：
```response
┌─────────d1─┬─────────d2─┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ original │
│ 1970-01-12 │ 1970-01-01 │          │
│ 1970-01-13 │ 1970-01-01 │          │
│ 1970-01-14 │ 1970-01-01 │          │
│ 1970-01-15 │ 1970-01-01 │          │
│ 1970-01-16 │ 1970-01-01 │          │
│ 1970-01-17 │ 1970-01-01 │          │
│ 1970-01-18 │ 1970-01-01 │          │
│ 1970-01-19 │ 1970-01-01 │          │
│ 1970-01-20 │ 1970-01-01 │          │
│ 1970-01-21 │ 1970-01-01 │          │
│ 1970-01-22 │ 1970-01-01 │          │
│ 1970-01-23 │ 1970-01-01 │          │
│ 1970-01-24 │ 1970-01-01 │          │
│ 1970-01-25 │ 1970-01-01 │          │
│ 1970-01-26 │ 1970-01-01 │          │
│ 1970-01-27 │ 1970-01-01 │          │
│ 1970-01-28 │ 1970-01-01 │          │
│ 1970-01-29 │ 1970-01-01 │          │
│ 1970-01-30 │ 1970-01-01 │          │
│ 1970-01-31 │ 1970-01-01 │          │
│ 1970-02-01 │ 1970-01-01 │          │
│ 1970-02-02 │ 1970-01-01 │          │
│ 1970-02-03 │ 1970-01-01 │          │
│ 1970-02-04 │ 1970-01-01 │          │
│ 1970-02-05 │ 1970-01-01 │          │
│ 1970-02-06 │ 1970-01-01 │          │
│ 1970-02-07 │ 1970-01-01 │          │
│ 1970-02-08 │ 1970-01-01 │          │
│ 1970-02-09 │ 1970-01-01 │          │
│ 1970-02-10 │ 1970-01-05 │ original │
└────────────┴────────────┴──────────┘
```

`STALENESS`なしのクエリ例：

```sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

結果：

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ original │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   3 │     0 │          │
 5. │   4 │     0 │          │
 6. │   5 │    25 │ original │
 7. │   6 │     0 │          │
 8. │   7 │     0 │          │
 9. │   8 │     0 │          │
10. │   9 │     0 │          │
11. │  10 │    50 │ original │
12. │  11 │     0 │          │
13. │  12 │     0 │          │
14. │  13 │     0 │          │
15. │  14 │     0 │          │
16. │  15 │    75 │ original │
    └─────┴───────┴──────────┘
```

`STALENESS 3`を適用した後の同じクエリ：

```sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

結果：

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ original │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   5 │    25 │ original │
 5. │   6 │     0 │          │
 6. │   7 │     0 │          │
 7. │  10 │    50 │ original │
 8. │  11 │     0 │          │
 9. │  12 │     0 │          │
10. │  15 │    75 │ original │
11. │  16 │     0 │          │
12. │  17 │     0 │          │
    └─────┴───────┴──────────┘
```

`INTERPOLATE`なしのクエリの例：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果：

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ original │     1 │
│ 1.5 │          │     0 │
│   2 │          │     0 │
│ 2.5 │          │     0 │
│   3 │          │     0 │
│ 3.5 │          │     0 │
│   4 │ original │     4 │
│ 4.5 │          │     0 │
│   5 │          │     0 │
│ 5.5 │          │     0 │
│   7 │ original │     7 │
└─────┴──────────┴───────┘
```

`INTERPOLATE`を適用した後の同じクエリ：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

結果：

```text
┌───n─┬─source───┬─inter─┐
│   0 │          │     0 │
│ 0.5 │          │     0 │
│   1 │ original │     1 │
│ 1.5 │          │     2 │
│   2 │          │     3 │
│ 2.5 │          │     4 │
│   3 │          │     5 │
│ 3.5 │          │     6 │
│   4 │ original │     4 │
│ 4.5 │          │     5 │
│   5 │          │     6 │
│ 5.5 │          │     7 │
│   7 │ original │     7 │
└─────┴──────────┴───────┘
```

## ソートプレフィックスによるグループ化された埋め込み {#filling-grouped-by-sorting-prefix}

特定のカラムに同じ値を持つ行を独立に埋めることが有用な場合があります。良い例は、時系列の欠落した値を埋めることです。
以下のような時系列テーブルがあると仮定します：
```sql
CREATE TABLE timeseries
(
    `sensor_id` UInt64,
    `timestamp` DateTime64(3, 'UTC'),
    `value` Float64
)
ENGINE = Memory;

SELECT * FROM timeseries;

┌─sensor_id─┬───────────────timestamp─┬─value─┐
│       234 │ 2021-12-01 00:00:03.000 │     3 │
│       432 │ 2021-12-01 00:00:01.000 │     1 │
│       234 │ 2021-12-01 00:00:07.000 │     7 │
│       432 │ 2021-12-01 00:00:05.000 │     5 │
└───────────┴─────────────────────────┴───────┘
```
各センサーに対して独立して1秒ごとに欠落した値を埋めたい場合、`sensor_id`カラムをソートプレフィックスとして使用して`timestamp`カラムを埋めることができます：
```sql
SELECT *
FROM timeseries
ORDER BY
    sensor_id,
    timestamp WITH FILL
INTERPOLATE ( value AS 9999 )

┌─sensor_id─┬───────────────timestamp─┬─value─┐
│       234 │ 2021-12-01 00:00:03.000 │     3 │
│       234 │ 2021-12-01 00:00:04.000 │  9999 │
│       234 │ 2021-12-01 00:00:05.000 │  9999 │
│       234 │ 2021-12-01 00:00:06.000 │  9999 │
│       234 │ 2021-12-01 00:00:07.000 │     7 │
│       432 │ 2021-12-01 00:00:01.000 │     1 │
│       432 │ 2021-12-01 00:00:02.000 │  9999 │
│       432 │ 2021-12-01 00:00:03.000 │  9999 │
│       432 │ 2021-12-01 00:00:04.000 │  9999 │
│       432 │ 2021-12-01 00:00:05.000 │     5 │
└───────────┴─────────────────────────┴───────┘
```
ここでは、`value`カラムは埋められた行をより目立たせるために `9999` で補間されました。
この動作は `use_with_fill_by_sorting_prefix` 設定によって制御され（デフォルトで有効）、各センサーごとに欠落した値を埋めるのに役立ちます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
