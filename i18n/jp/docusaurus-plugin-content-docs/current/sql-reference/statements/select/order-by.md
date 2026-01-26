---
description: 'ORDER BY 句に関するドキュメント'
sidebar_label: 'ORDER BY'
slug: /sql-reference/statements/select/order-by
title: 'ORDER BY 句'
doc_type: 'reference'
---

# ORDER BY 句 \{#order-by-clause\}

`ORDER BY` 句には次のいずれかを指定できます。

- 式のリスト（例: `ORDER BY visits, search_phrase`）
- `SELECT` 句内の列を参照する番号のリスト（例: `ORDER BY 2, 1`）
- `ALL`（`SELECT` 句のすべての列を意味する、例: `ORDER BY ALL`）

列番号によるソートを無効にするには、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を 0 に設定します。
`ALL` によるソートを無効にするには、設定 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) を 0 に設定します。

`ORDER BY` 句には、ソート方向を決定する `DESC`（降順）または `ASC`（昇順）の修飾子を付けることができます。
明示的にソート順を指定しない場合、デフォルトで `ASC` が使用されます。
ソート方向は、リスト全体ではなく単一の式に適用されます（例: `ORDER BY Visits DESC, SearchPhrase`）。
また、ソートは大文字と小文字を区別して行われます。

ソート対象の式の値が同一の行は、任意（非決定的）な順序で返されます。
`SELECT` 文で `ORDER BY` 句を省略した場合も、行の並び順は任意（非決定的）です。

## 特殊値のソート順 \{#sorting-of-special-values\}

`NaN` および `NULL` のソート順には、2 つの方法があります。

* デフォルトの場合、または `NULLS LAST` 修飾子を使用する場合: まず通常の値、その後に `NaN`、最後に `NULL`。
* `NULLS FIRST` 修飾子を使用する場合: まず `NULL`、次に `NaN`、最後に他の値。

### 例 \{#example\}

次のテーブルに対して

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

`SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` クエリを実行すると、次の結果が得られます。

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

浮動小数点数をソートする場合、NaN は他の値とは別扱いになります。ソート順に関係なく、NaN は常に末尾に並びます。言い換えると、昇順ソートでは NaN は他のすべての数値よりも大きいかのように扱われ、降順ソートでは残りの値よりも小さいかのように扱われます。

## 照合順序サポート \{#collation-support\}

[String](../../../sql-reference/data-types/string.md) 値でソートする場合、照合順序（比較方法）を指定できます。例: `ORDER BY SearchPhrase COLLATE 'tr'` — 文字列が UTF-8 でエンコードされていることを前提として、トルコ語アルファベットを用い、大文字小文字を区別せずにキーワードを昇順でソートします。`COLLATE` は、ORDER BY 句内の各式ごとに個別に指定してもしなくてもかまいません。`ASC` または `DESC` を指定する場合は、その後ろに `COLLATE` を指定します。`COLLATE` を使用する場合、ソートは常に大文字小文字を区別しません。

`COLLATE` は [LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md)、[Tuple](../../../sql-reference/data-types/tuple.md) でもサポートされています。

`COLLATE` によるソートは通常のバイト列によるソートより効率が低いため、少数行の最終的なソートにのみ `COLLATE` を使用することを推奨します。

## 照合順序の例 \{#collation-examples\}

[String](../../../sql-reference/data-types/string.md) 値のみの例:

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

[Nullable](../../../sql-reference/data-types/nullable.md) の例：

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

[Array](../../../sql-reference/data-types/array.md) を使った例:

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

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 型の文字列を使用した例:

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

[Tuple](../../../sql-reference/data-types/tuple.md) を使った例:

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

## 実装の詳細 \{#implementation-details\}

`ORDER BY` に加えて十分に小さい [LIMIT](../../../sql-reference/statements/select/limit.md) を指定すると、使用される RAM を抑えられます。そうでない場合、消費されるメモリ量はソート対象データ量に比例します。分散クエリ処理では、[GROUP BY](/sql-reference/statements/select/group-by) を省略すると、ソートはリモートサーバー側で部分的に実行され、その結果がリクエスト元サーバーでマージされます。これは、分散ソートの場合、ソート対象データ量が単一サーバーのメモリ量を上回る可能性があることを意味します。

RAM が不足している場合は、外部メモリ（ディスク）を使用してソートを実行することができます（ディスク上に一時ファイルを作成します）。この目的には設定項目 `max_bytes_before_external_sort` を使用します。これが 0（デフォルト値）の場合、外部ソートは無効化されています。有効になっている場合は、ソート対象データ量が指定したバイト数に達すると、それまでに収集したデータがソートされ、一時ファイルにダンプされます。すべてのデータを読み終えると、ソート済みファイルがすべてマージされ、その結果が出力されます。ファイルは設定上 `/var/lib/clickhouse/tmp/` ディレクトリに書き込まれます（デフォルトですが、この設定は `tmp_path` パラメータで変更できます）。また、クエリがメモリ制限を超えた場合にのみディスクへのスピルを使用することもできます。つまり、`max_bytes_ratio_before_external_sort=0.6` と設定すると、クエリがメモリ制限（ユーザー／サーバーごと）の 60% に達した時点でのみディスクへのスピルが有効になります。

クエリの実行では、`max_bytes_before_external_sort` より多くのメモリが使用される場合があります。このため、この設定値は `max_memory_usage` より十分小さくする必要があります。例えば、サーバーに 128 GB の RAM があり、単一のクエリを実行する必要がある場合は、`max_memory_usage` を 100 GB に、`max_bytes_before_external_sort` を 80 GB に設定します。

外部ソートは、RAM 内でのソートと比較して効率が大きく低下します。

## データ読み取りの最適化 \{#optimization-of-data-reading\}

`ORDER BY` 式の先頭部分がテーブルのソートキーと一致している場合、[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 設定を使用することでクエリを最適化できます。

`optimize_read_in_order` 設定が有効な場合、ClickHouse サーバーはテーブルインデックスを使用し、`ORDER BY` キーの順序でデータを読み取ります。これにより、指定された [LIMIT](../../../sql-reference/statements/select/limit.md) がある場合に全件を読み取らずに済みます。そのため、大量データに対して小さな `LIMIT` を指定したクエリは、より高速に処理されます。

最適化は `ASC` と `DESC` の両方で機能しますが、[GROUP BY](/sql-reference/statements/select/group-by) 句および [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子と同時には機能しません。

`optimize_read_in_order` 設定が無効な場合、ClickHouse サーバーは `SELECT` クエリを処理する際にテーブルインデックスを使用しません。

`ORDER BY` 句と大きな `LIMIT`、および対象データが見つかるまでに非常に多くのレコードを読み取る必要がある [WHERE](../../../sql-reference/statements/select/where.md) 条件を持つクエリを実行する場合は、`optimize_read_in_order` を手動で無効にすることを検討してください。

最適化は次のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) を含む）
- [Merge](../../../engines/table-engines/special/merge.md)
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView` エンジンのテーブルでは、`SELECT ... FROM merge_tree_table ORDER BY pk` のようなビューに対して最適化が機能します。ただし、ビュー定義のクエリに `ORDER BY` 句がない場合の `SELECT ... FROM view ORDER BY pk` のようなクエリではサポートされません。

## ORDER BY Expr WITH FILL 修飾子 \{#order-by-expr-with-fill-modifier\}

この修飾子は、[LIMIT ... WITH TIES 修飾子](/sql-reference/statements/select/limit#limit--with-ties-modifier)と組み合わせて使用することもできます。

`WITH FILL` 修飾子は、`ORDER BY expr` の後に、オプションの `FROM expr`、`TO expr`、`STEP expr` パラメータと共に指定できます。
`expr` 列の欠損しているすべての値が順番に補完され、その他の列はデフォルト値で補完されます。

複数の列を補完するには、`ORDER BY` セクション内のそれぞれのカラム名の後に、オプションのパラメータ付きで `WITH FILL` 修飾子を追加します。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` は、Numeric 型（float、decimal、int などあらゆる数値型）または Date/DateTime 型のフィールドに適用できます。`String` フィールドに適用した場合、欠損値は空文字列で埋められます。
`FROM const_expr` が定義されていない場合、補完に使用されるシーケンスは、`ORDER BY` 内の `expr` フィールドの最小値を使用します。
`TO const_expr` が定義されていない場合、補完に使用されるシーケンスは、`ORDER BY` 内の `expr` フィールドの最大値を使用します。
`STEP const_numeric_expr` が定義されている場合、数値型では `const_numeric_expr` はそのままの値として、Date 型では日数（`days`）として、DateTime 型では秒数（`seconds`）として解釈されます。また、時間および日付の間隔を表す [INTERVAL](/sql-reference/data-types/special-data-types/interval/) データ型もサポートします。
`STEP const_numeric_expr` を省略した場合、補完に使用されるシーケンスは、数値型では `1.0`、Date 型では `1 day`、DateTime 型では `1 second` を使用します。
`STALENESS const_numeric_expr` が定義されている場合、元データにおける直前の行との差分が `const_numeric_expr` を超えるまで、クエリは行を生成します。
`INTERPOLATE` は `ORDER BY WITH FILL` に含まれていない列に適用できます。これらの列は、`expr` を適用して直前の行の値に基づいて埋められます。`expr` が存在しない場合は、直前の値がそのまま繰り返されます。列リストを省略すると、許可されているすべての列が含まれます。

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

`WITH FILL` 修飾子を適用したあとの同じクエリ：

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

フィールドが複数ある場合に `ORDER BY field2 WITH FILL, field1 WITH FILL` のように指定すると、WITH FILL による値の補完は `ORDER BY` 句内でのフィールドの指定順に従って行われます。

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

フィールド `d1` は値が補完されず、デフォルト値も使用されません。これは、`d2` の値に重複がないために、`d1` のシーケンスを正しく計算できないためです。

次のクエリは、`ORDER BY` 句のフィールドを変更したものです。

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

次のクエリでは、列 `d1` に格納される各データに対して、1 日の `INTERVAL` 型を使用します。

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

`STALENESS` を指定しないクエリの例:

```sql
SELECT number AS key, 5 * number value, 'original' AS source
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

`STALENESS 3` を指定した場合の同じクエリ：

```sql
SELECT number AS key, 5 * number value, 'original' AS source
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

`INTERPOLATE` を使用しないクエリ例:

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
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

`INTERPOLATE` を適用後の同じクエリ：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
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

## ソートプレフィックス単位での補間 \{#filling-grouped-by-sorting-prefix\}

特定のカラムで同じ値を持つ行ごとに、独立して補間を行うと便利な場合があります。代表的な例は、時系列データの欠損値を補間するケースです。
次のような時系列テーブルがあるとします。

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

そして、各センサーごとに独立して、1 秒間隔で欠損値を補完したいとします。
これを実現するには、`timestamp` 列を補完する際に、`sensor_id` 列をソートキーの接頭辞として使用します。

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

ここでは、`value` 列に `9999` を補間して、埋められた行がより目立つようにしています。
この挙動は、`use_with_fill_by_sorting_prefix` の設定によって制御されます（デフォルトで有効です）。

## 関連コンテンツ \{#related-content\}

- ブログ記事: [ClickHouse でタイムシリーズデータを扱う方法](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
