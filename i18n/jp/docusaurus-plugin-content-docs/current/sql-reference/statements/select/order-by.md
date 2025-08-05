---
description: 'Documentation for ORDER BY Clause'
sidebar_label: 'ORDER BY'
slug: '/sql-reference/statements/select/order-by'
title: 'ORDER BY Clause'
---


# ORDER BY 句

`ORDER BY` 句は以下を含みます。

- 表現のリスト、例: `ORDER BY visits, search_phrase`、
- `SELECT` 句のカラムを指す数値のリスト、例: `ORDER BY 2, 1`、または
- `ALL` は `SELECT` 句のすべてのカラムを意味します、例: `ORDER BY ALL`。

カラム番号によるソートを無効にするには、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を 0 に設定します。
`ALL` によるソートを無効にするには、設定 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) を 0 に設定します。

`ORDER BY` 句には、ソート方向を決定する `DESC` (降順) または `ASC` (昇順) 修飾子を付与できます。
明示的なソート順が指定されない限り、デフォルトで `ASC` が使用されます。
ソート方向は単一の表現に適用され、全体のリストには適用されません。例: `ORDER BY Visits DESC, SearchPhrase`。
また、ソートはケースセンシティブに行われます。

同一の値を持つソート表現の行は、恣意的かつ非決定的な順序で返されます。
`SELECT` 文で `ORDER BY` 句が省略されると、行の順序も恣意的かつ非決定的です。

## 特殊値のソート {#sorting-of-special-values}

`NaN` と `NULL` のソート順には二つのアプローチがあります。

- デフォルトまたは `NULLS LAST` 修飾子使用時: 最初に値、その後に `NaN`、最後に `NULL`。
- `NULLS FIRST` 修飾子使用時: 最初に `NULL`、その後に `NaN`、最後に他の値。

### 例 {#example}

テーブルの例:

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

クエリ `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` を実行すると、次のような結果が得られます。

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

浮動小数点数のソート時に、NaNは他の値から区別されます。ソート順に関わらず、NaNは最後に配置されます。言い換えれば、昇順ソートでは他のすべての数字よりも大きいかのように配置され、降順ソートでは他のすべての数字よりも小さいかのように配置されます。

## 照合サポート {#collation-support}

[文字列](../../../sql-reference/data-types/string.md) 値によるソートには、照合 (比較) を指定できます。例: `ORDER BY SearchPhrase COLLATE 'tr'` - トルコ語アルファベットを用いた昇順でのキーワードによるソート。`COLLATE` は、ORDER BY の各表現に独立して指定可能です。`ASC` や `DESC` が指定された場合、`COLLATE` はそれに続いて指定されます。`COLLATE` を使用する場合、ソートは常に大文字小文字を区別しません。

照合は、[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[配列](../../../sql-reference/data-types/array.md)、および [タプル](../../../sql-reference/data-types/tuple.md) に対応しています。

`COLLATE` は、少数の行の最終ソートにのみ使用することを推奨します。`COLLATE` によるソートはバイトによる通常のソートよりも効率が悪いためです。

## 照合の例 {#collation-examples}

[文字列](../../../sql-reference/data-types/string.md) 値のみの例:

入力テーブル:

```text
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

```text
┌─x─┬─s────┐
│ 3 │ 123a │
│ 4 │ abc  │
│ 2 │ ABC  │
│ 1 │ bca  │
│ 5 │ BCA  │
└───┴──────┘
```

[Nullable](../../../sql-reference/data-types/nullable.md) を使用した例:

入力テーブル:

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

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

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

[配列](../../../sql-reference/data-types/array.md) を使用した例:

入力テーブル:

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

クエリ:

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果:

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

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 文字列の例:

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

[タプル](../../../sql-reference/data-types/tuple.md) の例:

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

`ORDER BY` に加えて十分に小さい [LIMIT](../../../sql-reference/statements/select/limit.md) を指定すると、使用されるRAMが少なくなります。そうでない場合、ソートに必要なメモリ量はデータ量に比例します。分散クエリ処理の場合、[GROUP BY](/sql-reference/statements/select/group-by) が省略された場合、リモートサーバで部分的にソートが行われ、結果がリクエストサーバでマージされます。これは、分散ソートの場合、ソートするデータ量が単一サーバのメモリ量よりも大きくなる可能性があることを意味します。

RAMが不十分な場合、外部メモリでのソート（ディスク上に一時ファイルを作成）を行うことが可能です。この目的には、設定 `max_bytes_before_external_sort` を使用します。これが 0（デフォルト）に設定されている場合、外部ソートは無効になります。これが有効になっている場合、ソート対象のデータのボリュームが指定されたバイト数に達すると、収集されたデータがソートされ、一時ファイルにダンプされます。すべてのデータが読み込まれた後、すべてのソートファイルがマージされ、結果が出力されます。ファイルは、構成内の `/var/lib/clickhouse/tmp/` ディレクトリに書き込まれます（デフォルトですが、`tmp_path` パラメータを使用してこの設定を変更できます）。

クエリを実行する際、`max_bytes_before_external_sort` よりも多くのメモリを使用する場合があります。このため、この設定は `max_memory_usage` よりも significantly 小さい値を持っている必要があります。例として、サーバに128 GBのRAMがある場合、一つのクエリを実行する必要があるときは、`max_memory_usage` を100 GBに、`max_bytes_before_external_sort` を80 GBに設定します。

外部ソートはRAM内のソートよりもかなり劣劣です。

## データ読み取りの最適化 {#optimization-of-data-reading}

`ORDER BY` 表現がテーブルのソートキーと一致する接頭辞を持つ場合、クエリを最適化することができます。[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 設定を使用します。

`optimize_read_in_order` 設定が有効になっている場合、ClickHouse サーバはテーブルインデックスを使用し、`ORDER BY` キーの順序でデータを読み取ります。これは、指定された [LIMIT](../../../sql-reference/statements/select/limit.md) に対してすべてのデータを読み取る必要がないことを意味します。したがって、大きなデータに対する小さなリミットのクエリは、より早く処理されます。

最適化は `ASC` および `DESC` の両方で機能し、[GROUP BY](/sql-reference/statements/select/group-by) 句と [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子と一緒には機能しません。

`optimize_read_in_order` 設定が無効になっている場合、ClickHouse サーバは `SELECT` クエリを処理する際にテーブルインデックスを使用しません。

`ORDER BY` 句を持つクエリを実行し、大きな `LIMIT` と膨大なレコードを読み取る必要がある [WHERE](../../../sql-reference/statements/select/where.md) 条件がある場合は、手動で `optimize_read_in_order` を無効にすることを検討してください。

最適化は次のテーブルエンジンでサポートされています。

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) を含む）、
- [Merge](../../../engines/table-engines/special/merge.md)、
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView` エンジンテーブルでは、`SELECT ... FROM merge_tree_table ORDER BY pk` のようなビューに対して最適化が機能します。ただし、ビュークエリに `ORDER BY` 句がない場合の `SELECT ... FROM view ORDER BY pk` のようなクエリではサポートされません。

## ORDER BY 表現 WITH FILL 修飾子 {#order-by-expr-with-fill-modifier}

この修飾子は、[LIMIT ... WITH TIES 修飾子](/sql-reference/statements/select/limit#limit--with-ties-modifier) と組み合わせて使用することもできます。

`WITH FILL` 修飾子は `ORDER BY expr` の後に設定でき、オプションの `FROM expr`、`TO expr` および `STEP expr` パラメータを使用できます。
`expr` カラムの欠落しているすべての値は連続的に埋められ、他のカラムはデフォルト値で埋められます。

複数のカラムを埋めるためには、各フィールド名の後にオプションのパラメータ付き `WITH FILL` 修飾子を追加します。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` は、Numeric（すべての種類の浮動小数点、デシマル、整数）または Date/DateTime タイプのフィールドに適用できます。`String` フィールドに適用される場合、欠落している値は空の文字列で埋められます。
`FROM const_expr` が定義されていない場合、埋めの順序は `ORDER BY` の最小 `expr` フィールド値を使用します。
`TO const_expr` が定義されていない場合、埋めの順序は `ORDER BY` の最大 `expr` フィールド値を使用します。
`STEP const_numeric_expr` が定義されている場合、`const_numeric_expr` は数値タイプにはそのまま解釈され、Date タイプには `days` として、DateTime タイプには `seconds` として解釈されます。これは、時間と日付のインターバルを表す [INTERVAL](/sql-reference/data-types/special-data-types/interval/) データ型もサポートします。
`STEP const_numeric_expr` が省略されると、埋めの順序は数値タイプには `1.0`、Date タイプには `1 day`、DateTime タイプには `1 second` が使用されます。
`STALENESS const_numeric_expr` が定義されている場合、クエリは前の行からの差が `const_numeric_expr` を超えるまで行を生成します。
`INTERPOLATE` は、`ORDER BY WITH FILL` に参加していないカラムに適用できます。このようなカラムは、前のフィールド値を適用することによって埋められます。`expr` が存在しない場合、前の値が繰り返されます。省略されたリストは、許可されているすべてのカラムを含む結果となります。

`WITH FILL` を使用しないクエリの例:

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

結果:

```text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

`WITH FILL` 修飾子を適用した後の同じクエリ:

```sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果:

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

複数のフィールド `ORDER BY field2 WITH FILL, field1 WITH FILL` のケースでは、埋める順序は `ORDER BY` 句のフィールドの順序に従います。

例:

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

結果:

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

フィールド `d1` は埋め込まれず、デフォルト値を使用します。なぜなら、私たちは `d2` の値に対して繰り返し値を持っていないため、`d1` の順序を正しく計算できないからです。

`ORDER BY` のフィールドを変更した次のクエリ:

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

結果:

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

次のクエリは、`d1` カラムに対して1日の `INTERVAL` データ型を使用して、各データを埋めます。

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
│ 1970-02-11 │ 1970-01-01 │          │
│ 1970-02-12 │ 1970-01-01 │          │
│ 1970-02-13 │ 1970-01-01 │          │
│ 1970-02-14 │ 1970-01-01 │          │
│ 1970-02-15 │ 1970-01-01 │          │
│ 1970-02-16 │ 1970-01-01 │          │
│ 1970-02-17 │ 1970-01-01 │          │
│ 1970-02-18 │ 1970-01-01 │          │
│ 1970-02-19 │ 1970-01-01 │          │
│ 1970-02-20 │ 1970-01-01 │          │
│ 1970-02-21 │ 1970-01-01 │          │
│ 1970-02-22 │ 1970-01-01 │          │
│ 1970-02-23 │ 1970-01-01 │          │
│ 1970-02-24 │ 1970-01-01 │          │
│ 1970-02-25 │ 1970-01-01 │          │
│ 1970-02-26 │ 1970-01-01 │          │
│ 1970-02-27 │ 1970-01-01 │          │
│ 1970-02-28 │ 1970-01-01 │          │
│ 1970-03-01 │ 1970-01-01 │          │
│ 1970-03-02 │ 1970-01-01 │          │
│ 1970-03-03 │ 1970-01-01 │          │
│ 1970-03-04 │ 1970-01-01 │          │
│ 1970-03-05 │ 1970-01-01 │          │
│ 1970-03-06 │ 1970-01-01 │          │
│ 1970-03-07 │ 1970-01-01 │          │
│ 1970-03-08 │ 1970-01-01 │          │
│ 1970-03-09 │ 1970-01-01 │          │
│ 1970-03-10 │ 1970-01-01 │          │
│ 1970-03-11 │ 1970-01-01 │          │
│ 1970-03-12 │ 1970-01-08 │ original │
└────────────┴────────────┴──────────┘
```

`STALENESS` を使用しないクエリの例:

```sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

結果:

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

`STALENESS 3` を適用した後の同じクエリ:

```sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

結果:

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

`INTERPOLATE` を使用しないクエリの例:

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果:

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

`INTERPOLATE` を適用した後の同じクエリ:

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

結果:

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

## ソート接頭辞によるグループ化がされた埋め込み {#filling-grouped-by-sorting-prefix}

特定のカラムで同じ値を持つ行を独立して埋めることが便利な場合があります。良い例は、時系列の欠落値を埋めることです。以下のような時系列テーブルを考えます。
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
各センサーごとに独立して1秒間隔で欠落値を埋めたいと考えています。
これを達成する方法は、`sensor_id` カラムをソートの接頭辞として `timestamp` カラムを埋めることです:
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
ここでは、`value` カラムは `9999` で補間されており、埋められた行が目立つようにしています。
この動作は、デフォルトで有効な `use_with_fill_by_sorting_prefix` 設定によって制御されます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
