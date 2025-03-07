---
slug: '/sql-reference/statements/select/order-by'
sidebar_label: 'ORDER BY'
keywords: ['ORDER BY', 'SQL', 'ClickHouse']
description: 'ClickHouse documentation for ORDER BY clause in SQL.'
---


# ORDER BY 句

`ORDER BY` 句には以下が含まれます:

- 式のリスト、例: `ORDER BY visits, search_phrase`
- `SELECT` 句のカラムを参照する数値のリスト、例: `ORDER BY 2, 1`、または
- `ALL` これは `SELECT` 句のすべてのカラムを意味し、例: `ORDER BY ALL`

カラム番号によるソートを無効にするには、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を 0 に設定します。 `ALL` によるソートを無効にするには、設定 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) を 0 に設定します。

`ORDER BY` 句にはソートの方向を決定する `DESC`（降順）または `ASC`（昇順）の修飾子を付けることができます。明示的なソート順が指定されない限り、デフォルトでは `ASC` が使用されます。ソートの順序は単一の式に適用され、リスト全体には適用されません。例: `ORDER BY Visits DESC, SearchPhrase`。また、ソートは大文字と小文字を区別します。

ソートされた式の同一の値を持つ行は、任意かつ非決定的な順序で返されます。`SELECT` 文で `ORDER BY` 句が省略されると、行の順序も任意かつ非決定的です。

## 特殊値のソート {#sorting-of-special-values}

`NaN` と `NULL` のソート順には二つのアプローチがあります:

- デフォルトまたは `NULLS LAST` 修飾子を使用する場合: 最初に値、次に `NaN`、最後に `NULL`。
- `NULLS FIRST` 修飾子を使用する場合: 最初に `NULL`、次に `NaN`、その後に他の値。

### 例 {#example}

テーブル用のデータ:

``` text
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

クエリ `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` を実行すると:

``` text
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

浮動小数点数がソートされるとき、NaN は他の値から分離されます。ソートの順序に関わらず、NaN は最後に来ます。言い換えれば、昇順のソートにおいては他の数字よりも大きいように位置付けられ、一方で降順のソートでは他の数値よりも小さいように位置付けられます。

## 照合サポート {#collation-support}

[文字列](../../../sql-reference/data-types/string.md) 値によるソートのために、照合（比較）を指定できます。例: `ORDER BY SearchPhrase COLLATE 'tr'` - トルコ語アルファベットを使用して、ケースを無視して昇順にキーワードでソートする。`COLLATE` は、ORDER BY の各式に独立して指定することができます。`ASC` または `DESC` が指定されている場合、その後に `COLLATE` を指定します。`COLLATE` を使用する場合、ソートは常に大文字と小文字を区別しません。

照合は、[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md)、および [Tuple](../../../sql-reference/data-types/tuple.md) においてサポートされています。

`COLLATE` を使用するのは、少ない行数の最終ソートでの使用を推奨します。照合を使用したソートは、バイトによる通常のソートよりも効率が低いためです。

## 照合の例 {#collation-examples}

[文字列](../../../sql-reference/data-types/string.md) のみを含む例:

入力テーブル:

``` text
┌─x─┬─s────┐
│ 1 │ bca  │
│ 2 │ ABC  │
│ 3 │ 123a │
│ 4 │ abc  │
│ 5 │ BCA  │
└───┴──────┘
```

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

``` text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

[Nullable](../../../sql-reference/data-types/nullable.md) を含む例:

入力テーブル:

``` text
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

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

``` text
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

[Array](../../../sql-reference/data-types/array.md) を含む例:

入力テーブル:

``` text
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

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

``` text
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

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 文字列を含む例:

入力テーブル:

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

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

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

[Tuple](../../../sql-reference/data-types/tuple.md) を含む例:

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

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

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

`ORDER BY` に加えて、小さな [LIMIT](../../../sql-reference/statements/select/limit.md) を指定すると、使用される RAM は減ります。それ以外の場合、消費されるメモリ量はソート対象データの量に比例します。分散クエリ処理の場合、[GROUP BY](/sql-reference/statements/select/group-by) が省略されている場合は、ソートがリモートサーバーで部分的に行われ、結果がリクエスターサーバーでマージされます。これは、分散ソートのために、ソートするデータの量が単一サーバーのメモリ量を超える可能性があることを意味します。

RAM が不足している場合、外部メモリでソートを行うことが可能です（ディスクに一時ファイルを作成します）。この目的のために設定 `max_bytes_before_external_sort` を使用します。これが 0（デフォルト）に設定されている場合、外部ソートは無効です。有効になっている場合、ソートするデータの量が指定されたバイト数に達した時点で、収集されたデータがソートされ、一時ファイルに書き出されます。すべてのデータが読み込まれた後、すべてのソートされたファイルがマージされ、結果が出力されます。ファイルは設定で `/var/lib/clickhouse/tmp/` ディレクトリに書き込まれます（デフォルトですが、`tmp_path` パラメーターを使用してこの設定を変更できます）。

クエリを実行すると、`max_bytes_before_external_sort` よりも多くのメモリを使用することがあります。このため、この設定の値は `max_memory_usage` よりもかなり小さくする必要があります。例として、サーバーに 128 GB の RAM があり、単一のクエリを実行する必要がある場合、`max_memory_usage` を 100 GB に、`max_bytes_before_external_sort` を 80 GB に設定します。

外部ソートは RAM 内のソートよりも効率が大幅に低下します。

## データ読み取りの最適化 {#optimization-of-data-reading}

`ORDER BY` 式がテーブルのソートキーと一致する接頭辞を持っている場合、[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 設定を使用することでクエリを最適化できます。

`optimize_read_in_order` 設定が有効になっている場合、ClickHouse サーバーはテーブルインデックスを使用し、`ORDER BY` キーの順序でデータを読み取ります。特定された [LIMIT](../../../sql-reference/statements/select/limit.md) の場合、すべてのデータを読み取ることを回避できます。そのため、大きなデータに対して小さなリミットのクエリは迅速に処理されます。

最適化は `ASC` と `DESC` の両方で機能し、[GROUP BY](/sql-reference/statements/select/group-by) 句および [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子と同時に機能しません。

`optimize_read_in_order` 設定が無効である場合、ClickHouse サーバーは `SELECT` クエリの処理中にテーブルインデックスを使用しません。

`ORDER BY` 句、リミットが大きい `LIMIT`、そして大量のレコードを読み取る必要がある [WHERE](../../../sql-reference/statements/select/where.md) 条件を持つクエリを実行する際は、手動で `optimize_read_in_order` を無効にすることを検討してください。

最適化は次のテーブルエンジンでサポートされています:

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）
- [Merge](../../../engines/table-engines/special/merge.md)
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView` エンジンのテーブルでは、最適化は `SELECT ... FROM merge_tree_table ORDER BY pk` のようなクエリに対して機能します。しかし、`SELECT ... FROM view ORDER BY pk` のように、ビューのクエリに `ORDER BY` 句がない場合、サポートされません。

## ORDER BY Expr WITH FILL 修飾子 {#order-by-expr-with-fill-modifier}

この修飾子は、[LIMIT ... WITH TIES 修飾子](/sql-reference/statements/select/limit#limit--with-ties-modifier) と組み合わせることもできます。

`WITH FILL` 修飾子は `ORDER BY expr` の後に設定でき、オプションの `FROM expr`、`TO expr`、および `STEP expr` パラメータを指定できます。
欠失した `expr` カラムのすべての値は順次埋められ、他のカラムはデフォルトの値で埋められます。

複数のカラムを埋めるには、`ORDER BY` セクションの各フィールド名の後に、オプションのパラメータを持つ `WITH FILL` 修飾子を追加します。

``` sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` は、Numeric（すべての種類の float、decimal、int）または Date/DateTime タイプのフィールドに適用できます。`String` フィールドに適用される場合、欠失した値は空の文字列で埋められます。
`FROM const_expr` が定義されていない場合、埋める順序は `ORDER BY` の最小の `expr` フィールド値を使用します。
`TO const_expr` が定義されていない場合、埋める順序は `ORDER BY` の最大の `expr` フィールド値を使用します。
`STEP const_numeric_expr` が定義されている場合、`const_numeric_expr` は numeric タイプに対してそのまま解釈され、Date タイプに対しては `days`、DateTime タイプに対しては `seconds` として解釈されます。また、時間と日付の間隔を表す [INTERVAL](/sql-reference/data-types/special-data-types/interval/) データ型もサポートしています。
`STEP const_numeric_expr` が省略されると、埋める順序は numeric タイプに対しては `1.0`、Date タイプに対しては `1 day`、DateTime タイプに対しては `1 second` となります。
`STALENESS const_numeric_expr` が定義されている場合、クエリは元のデータの前の行との違いが `const_numeric_expr` を超えるまで行を生成します。
`INTERPOLATE` は `ORDER BY WITH FILL` に参加していないカラムに適用できます。このようなカラムは、前のフィールドの値に基づいて `expr` を適用することによって埋められます。`expr` が存在しない場合は、前の値を繰り返します。省略されたリストは許可されたすべてのカラムを含めることになります。

`WITH FILL` を使用しないクエリの例:

``` sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

結果:

``` text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

`WITH FILL` 修飾子を適用した後の同じクエリ:

``` sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果:

``` text
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

複数フィールドを持つケースで `ORDER BY field2 WITH FILL, field1 WITH FILL` の順序は、`ORDER BY` 句のフィールドの順序に従って埋められます。

例:

``` sql
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

結果:

``` text
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

フィールド `d1` は埋めずデフォルト値を使用します。これは `d2` の値の繰り返しがないため、`d1` の順序を正しく計算できないからです。

次の `ORDER BY` 句のフィールドを変更したクエリ:

``` sql
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

結果:

``` text
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

次のクエリでは、columnd1 に対して各データを埋めるために 1 デイの `INTERVAL` データ型を使用します:

``` sql
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

結果:

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

`STALENESS` がないクエリの例:

``` sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

結果:

``` text
┌─key─┬─value─┬─source───┐
│   0 │     0 │ original │
│   1 │     0 │          │
│   2 │     0 │          │
│   3 │     0 │          │
│   4 │     0 │          │
│   5 │    25 │ original │
│   6 │     0 │          │
│   7 │     0 │          │
│   8 │     0 │          │
│   9 │     0 │          │
│  10 │    50 │ original │
│  11 │     0 │          │
│  12 │     0 │          │
│  13 │     0 │          │
│  14 │     0 │          │
│  15 │    75 │ original │
└─────┴───────┴──────────┘
```

`STALENESS 3` を適用した同じクエリ:

``` sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

結果:

``` text
┌─key─┬─value─┬─source───┐
│   0 │     0 │ original │
│   1 │     0 │          │
│   2 │     0 │          │
│   5 │    25 │ original │
│   6 │     0 │          │
│   7 │     0 │          │
│  10 │    50 │ original │
│  11 │     0 │          │
│  12 │     0 │          │
│  15 │    75 │ original │
│  16 │     0 │          │
│  17 │     0 │          │
└─────┴───────┴──────────┘
```

`INTERPOLATE` を使用しないクエリの例:

``` sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果:

``` text
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

`INTERPOLATE` を適用した同じクエリ:

``` sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

結果:

``` text
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

## ソートプレフィックスによる埋め込み {#filling-grouped-by-sorting-prefix}

特定のカラムに同じ値を持つ行を独立して埋めるのが有用なことがあります - 時系列データの欠失値を埋める良い例です。
以下のような時系列テーブルがあると仮定します:

``` sql
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

各センサーの欠失値を 1 秒間隔で埋めたいとします。
これを実現する方法は、`sensor_id` カラムを使用して `timestamp` カラムのソートプレフィックスを指定することです:

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

ここでは、`value` カラムが埋められた行を目立たせるために `9999` で補間されました。この動作はデフォルトで有効な設定 `use_with_fill_by_sorting_prefix` によって制御されます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse の時系列データを操作する](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
