---
'description': 'ORDER BY 句に関するドキュメント'
'sidebar_label': 'ORDER BY'
'slug': '/sql-reference/statements/select/order-by'
'title': 'ORDER BY 句'
'doc_type': 'reference'
---



# ORDER BY 句

`ORDER BY` 句には次のものが含まれます。

- 表現のリスト、例: `ORDER BY visits, search_phrase`、
- `SELECT` 句でのカラムを参照する数値のリスト、例: `ORDER BY 2, 1`、または
- `ALL` は、`SELECT` 句のすべてのカラムを意味します。例: `ORDER BY ALL`。

カラム番号によるソートを無効にするには、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を 0 に設定します。
`ALL` によるソートを無効にするには、設定 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) を 0 に設定します。

`ORDER BY` 句は、ソートの方向を決定する `DESC`（降順）または `ASC`（昇順）修飾子を付けることができます。
明示的なソート順が指定されていない限り、デフォルトで `ASC` が使用されます。
ソートの方向は単一の表現に適用され、リスト全体には適用されません。例: `ORDER BY Visits DESC, SearchPhrase`。
また、ソートは大文字と小文字を区別して行われます。

同じ値を持つソート表現の行は、任意かつ非決定的な順序で返されます。
`SELECT` ステートメントに `ORDER BY` 句が省略されている場合、行の順序も任意で非決定的です。

## 特殊値のソート {#sorting-of-special-values}

`NaN` および `NULL` のソート順には二つのアプローチがあります：

- デフォルトまたは `NULLS LAST` 修飾子付き：まず値、次に `NaN`、次に `NULL`。
- `NULLS FIRST` 修飾子付き：まず `NULL`、次に `NaN`、次に他の値。

### 例 {#example}

テーブルに対して

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

浮動小数点数がソートされると、NaN は他の値とは別に扱われます。ソートの順序に関わらず、NaN は最後に来ます。言い換えれば、昇順ソートの場合、NaN は他のすべての数値よりも大きいかのように配置され、降順ソートの場合は小さいかのように配置されます。

## 照合サポート {#collation-support}

[文字列](../../../sql-reference/data-types/string.md) 値でのソートに対して、照合（比較）を指定できます。例：`ORDER BY SearchPhrase COLLATE 'tr'` - トルコ語のアルファベットを使って、ケースを区別せずに昇順でキーワードでソートします。`COLLATE` は、ORDER BY の各表現で独立して指定可能です。指定された場合、`ASC` または `DESC` の後に `COLLATE` を指定します。`COLLATE` を使用する場合、ソートは常に大文字小文字を区別しません。

照合は、[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md)、および [Tuple](../../../sql-reference/data-types/tuple.md) でサポートされています。

私たちは、少数の行の最終的なソートのために `COLLATE` を使用することを推奨します。なぜなら、`COLLATE` によるソートは、バイトによる通常のソートよりも効率が低いためです。

## 照合の例 {#collation-examples}

[文字列](../../../sql-reference/data-types/string.md) 値のみの例：

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

[Array](../../../sql-reference/data-types/array.md) の例：

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

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md) 文字列の例：

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

[Tuple](../../../sql-reference/data-types/tuple.md) の例：

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

`ORDER BY` に加えて、小さめの [LIMIT](../../../sql-reference/statements/select/limit.md) が指定されている場合、RAM の使用量が少なくなります。さもなければ、ソートのために費やされるメモリの量はデータ量に比例します。分散クエリ処理の場合、[GROUP BY](/sql-reference/statements/select/group-by) が省略されると、ソートはリモートサーバーで部分的に行われ、結果がリクエスターサーバーで統合されます。これは、分散ソートの場合、ソートするデータ量が単一サーバーのメモリ量を超える可能性があることを意味します。

RAM が不足している場合、外部メモリでソートを実行することができます（ディスク上に一時ファイルを作成）。この目的のために設定 `max_bytes_before_external_sort` を使用します。これが 0 に設定されている場合（デフォルト）、外部ソートは無効になります。有効にされている場合、ソートするデータ量が指定されたバイト数に達すると、収集されたデータがソートされ、一時ファイルにダンプされます。すべてのデータが読み取られた後、すべてのソートされたファイルがマージされ、結果が出力されます。ファイルは設定の `/var/lib/clickhouse/tmp/` ディレクトリに書き込まれ、デフォルトでは自動的に設定されますが、`tmp_path` パラメータを使用してこの設定を変更することもできます。クエリがメモリ制限を超えた場合にのみディスクへのスピルを使用することもできます。つまり、`max_bytes_ratio_before_external_sort=0.6` は、クエリが `60%` のメモリ制限に達したときにのみディスクへのスピルを有効にします（ユーザー/サーバー）。

クエリを実行する際は、`max_bytes_before_external_sort` よりも多くのメモリを使用するかもしれません。このため、この設定は `max_memory_usage` よりもかなり小さい値にする必要があります。例として、サーバーに 128 GB の RAM があり、単一のクエリを実行する必要がある場合、`max_memory_usage` を 100 GB、`max_bytes_before_external_sort` を 80 GB に設定します。

外部ソートは、RAM でのソートに比べてはるかに効果が低く働きます。

## データ読み取りの最適化 {#optimization-of-data-reading}

`ORDER BY` 表現がテーブルのソートキーと一致する接頭辞を持つ場合、[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 設定を使用してクエリを最適化できます。

`optimize_read_in_order` 設定が有効になっていると、ClickHouse サーバーはテーブルインデックスを使用し、`ORDER BY` キーの順序でデータを読み取ります。これにより、指定された [LIMIT](../../../sql-reference/statements/select/limit.md) の場合にすべてのデータを読み取る必要がなくなります。したがって、大きなデータに対して小さいリミットのクエリがより迅速に処理されます。

最適化は `ASC` と `DESC` の両方で機能し、[GROUP BY](/sql-reference/statements/select/group-by) 句および [FINAL](/sql-reference/statements/select/from#final-modifier) 修飾子と同時には機能しません。

`optimize_read_in_order` 設定が無効になっている場合、ClickHouse サーバーは `SELECT` クエリを処理する際にテーブルインデックスを使用しません。

`ORDER BY` 句があり、大きな `LIMIT` と巨大なレコードを読み取る必要がある [WHERE](../../../sql-reference/statements/select/where.md) 条件があるクエリを実行する際には、`optimize_read_in_order` を手動で無効にすることを検討してください。

最適化は次のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view) を含む）
- [Merge](../../../engines/table-engines/special/merge.md)
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView` エンジンのテーブルでは、最適化は `SELECT ... FROM merge_tree_table ORDER BY pk` のようなビューで機能します。しかし、`SELECT ... FROM view ORDER BY pk` のように、ビューのクエリに `ORDER BY` 句がない場合はサポートされていません。

## ORDER BY Expr WITH FILL 修飾子 {#order-by-expr-with-fill-modifier}

この修飾子は、[LIMIT ... WITH TIES 修飾子](/sql-reference/statements/select/limit#limit--with-ties-modifier) と組み合わせることもできます。

`WITH FILL` 修飾子は、`ORDER BY expr` の後に、オプションの `FROM expr`、`TO expr`、および `STEP expr` パラメータを設定できます。
`expr` カラムのすべての欠落値は順次補填され、他のカラムはデフォルトとして補填されます。

複数のカラムを補填するには、`ORDER BY` セクション内の各フィールド名の後にオプションのパラメータを伴う `WITH FILL` 修飾子を追加します。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` は、数値（すべてのタイプの浮動小数点、10進数、整数）または日付/日付時刻の型のフィールドに適用できます。`String` フィールドに適用される場合、欠落値は空文字列で補填されます。
`FROM const_expr` が定義されていない場合、補填の順序は `ORDER BY` からの最小 `expr` フィールド値を使用します。
`TO const_expr` が定義されていない場合、補填の順序は `ORDER BY` からの最大 `expr` フィールド値を使用します。
`STEP const_numeric_expr` が定義されると、`const_numeric_expr` は数値型に対してそのまま解釈され、日付型に対しては `days`、日付時刻型に対しては `seconds` として解釈されます。時間と日付の間隔を表す [INTERVAL](/sql-reference/data-types/special-data-types/interval/) データ型もサポートしています。
`STEP const_numeric_expr` が省略されると、補填の順序には数値型に対しては `1.0`、日付型に対しては `1 day`、日付時刻型に対しては `1 second` が使用されます。
`STALENESS const_numeric_expr` が定義されていると、前の行との違いが `const_numeric_expr` を超えるまでクエリは行を生成します。
`INTERPOLATE` は `ORDER BY WITH FILL` に参加しないカラムに適用できます。そのようなカラムは、前のフィールド値に基づいて `expr` を適用して補填されます。`expr` が存在しない場合は前の値を繰り返します。省略されたリストにはすべての許可されているカラムが含まれます。

`WITH FILL` を使用しないクエリの例：

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

複数のフィールドがある場合 `ORDER BY field2 WITH FILL, field1 WITH FILL` の補填の順序は `ORDER BY` 句内のフィールドの順序に従います。

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

フィールド `d1` は補填されず、デフォルト値を使用します。これは、`d2` 値に対して繰り返された値がないため、`d1` の順序を正しく計算できないためです。

`ORDER BY` で変更されたフィールドを持つ以下のクエリ：

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

以下のクエリは、カラム `d1` に対して1日間隔の `INTERVAL` データ型を使用して補填されます：

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

`STALENESS` を使用しないクエリの例：

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

`STALENESS 3` を適用した後の同じクエリ：

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

`INTERPOLATE` を使用しないクエリの例：

```sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number AS inter
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

`INTERPOLATE` を適用した後の同じクエリ：

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

## ソート接頭辞による補填 {#filling-grouped-by-sorting-prefix}

特定のカラムで同じ値を持つ行を独立して補填することが有用な場合があります - 時系列の欠落値を補填する良い例です。
次のような時系列テーブルを考えてみましょう：
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
各センサーの欠落値を1秒の間隔で独立して補填したいとします。
これを実現する方法は、`sensor_id` カラムを補填カラム `timestamp` のソート接頭辞として使用することです：
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
ここでは、補填された行をより目立たせるために、`value` カラムを `9999` で補間しました。
この動作は、`use_with_fill_by_sorting_prefix` を設定することで制御されます（デフォルトで有効になっています）。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
