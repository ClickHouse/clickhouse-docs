---
slug: /sql-reference/statements/select/order-by
sidebar_label: ORDER BY
---

# ORDER BY 句

`ORDER BY` 句には次の内容が含まれます。

- 表現のリスト、例えば `ORDER BY visits, search_phrase`、
- `SELECT` 句内のカラムを指す番号のリスト、例えば `ORDER BY 2, 1`、または
- `ALL`、これは `SELECT` 句のすべてのカラムを意味します、例えば `ORDER BY ALL`。

カラム番号によるソートを無効にするには、設定 [enable_positional_arguments](../../../operations/settings/settings.md#enable-positional-arguments) を 0 に設定します。 `ALL` によるソートを無効にするには、設定 [enable_order_by_all](../../../operations/settings/settings.md#enable-order-by-all) を 0 に設定します。

`ORDER BY` 句には、ソートの方向を決定する `DESC`（降順）または `ASC`（昇順）修飾子を付けることができます。
明示的なソート順が指定されない限り、デフォルトで `ASC` が使用されます。
ソートの方向は単一の表現に適用され、リスト全体には適用されません、例えば `ORDER BY Visits DESC, SearchPhrase`。
また、ソートは大文字と小文字を区別します。

ソート表現で同一の値を持つ行は、任意で非決定的な順序で返されます。
`SELECT` 文で `ORDER BY` 句が省略された場合、行の順序もまた任意で非決定的です。

## 特殊値のソート {#sorting-of-special-values}

`NaN` と `NULL` のソート順には二つのアプローチがあります：

- デフォルトまたは `NULLS LAST` 修飾子を使用する場合：最初に値、その後に `NaN`、次に `NULL`。
- `NULLS FIRST` 修飾子を使用する場合：最初に `NULL`、その後に `NaN`、次に他の値。

### 例 {#example}

次のテーブルに対して

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

クエリ `SELECT * FROM t_null_nan ORDER BY y NULLS FIRST` を実行すると、次の結果が得られます：

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

浮動小数点数がソートされる場合、NaN は他の値とは別に扱われます。ソート順に関係なく、NaN は最後に配置されます。言い換えれば、昇順のソートでは他のすべての数よりも大きいかのように配置され、降順のソートでは他の数よりも小さいかのように配置されます。

## 照合サポート {#collation-support}

[文字列](../../../sql-reference/data-types/string.md) 値でソートする場合、照合（比較）を指定できます。例： `ORDER BY SearchPhrase COLLATE 'tr'` - トルコ語アルファベットを使用して、ケースを区別せずにキーワードで昇順ソートします。 `COLLATE` は `ORDER BY` の各表現に独立して指定したり指定しなかったりできます。 `ASC` または `DESC` が指定されると、`COLLATE` はその後に指定されます。 `COLLATE` を使用すると、ソートは常に大文字と小文字を区別しません。

照合は [LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md)、および [Tuple](../../../sql-reference/data-types/tuple.md) でサポートされています。

`COLLATE` は、行数が少ない最終ソートにのみ使用することをお勧めします。なぜなら、`COLLATE` を使用したソートは、バイトによる通常のソートより効率が悪いからです。

## 照合の例 {#collation-examples}

[文字列](../../../sql-reference/data-types/string.md) 値の例：

入力テーブル：

``` text
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

``` text
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

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

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

[Array](../../../sql-reference/data-types/array.md) の例：

入力テーブル：

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

クエリ：

```sql
SELECT * FROM collate_test ORDER BY s ASC COLLATE 'en';
```

結果：

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

`ORDER BY` に加えて小さな [LIMIT](../../../sql-reference/statements/select/limit.md) が指定されている場合、使用するRAMは少なくなります。それ以外の場合、消費するメモリの量はソートするデータのボリュームに比例します。分散クエリ処理の場合、もし [GROUP BY](../../../sql-reference/statements/select/group-by.md) が省略された場合、ソートは部分的にリモートサーバーで行われ、結果はリクエストサーバーでマージされます。つまり、分散ソートの場合、ソートするデータのボリュームは単一のサーバーのメモリ量を超えることができます。

もしメモリが不足している場合は、外部メモリでソートを行うことができます（ディスクに一時ファイルを作成）。この目的には設定 `max_bytes_before_external_sort` を使用します。これが 0 に設定されている場合（デフォルト）、外部ソートが無効になります。もし有効にされている場合、ソートするデータのボリュームが指定されたバイト数に達すると、収集したデータがソートされ、一時ファイルに出力されます。すべてのデータが読み取られた後、すべてのソートされたファイルがマージされ、結果が出力されます。ファイルは設定で指定された `/var/lib/clickhouse/tmp/` ディレクトリに書き込まれます（デフォルトですが、`tmp_path` パラメータを使用してこの設定を変更できます）。

クエリを実行すると、`max_bytes_before_external_sort` よりも多くのメモリを使用する場合があります。このため、この設定は `max_memory_usage` よりもかなり小さな値に設定する必要があります。例として、サーバーが 128 GB のRAMを持っていて、単一のクエリを実行する必要がある場合、 `max_memory_usage` を 100 GB に、 `max_bytes_before_external_sort` を 80 GB に設定します。

外部ソートは、RAM内でのソートよりもはるかに効果的ではありません。

## データ読み取りの最適化 {#optimization-of-data-reading}

 `ORDER BY` 表現がテーブルのソートキーと一致するプレフィックスを持つ場合、[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order) 設定を使用してクエリを最適化できます。

 `optimize_read_in_order` 設定が有効になっている場合、ClickHouse サーバーはテーブルインデックスを使用し、`ORDER BY` キーの順にデータを読み取ります。これにより、指定された [LIMIT](../../../sql-reference/statements/select/limit.md) の場合にすべてのデータを読み取る必要がなくなります。したがって、大きなデータに対して小さな制限があるクエリは、より迅速に処理されます。

最適化は `ASC` と `DESC` の両方で機能し、[GROUP BY](../../../sql-reference/statements/select/group-by.md) 句や [FINAL](../../../sql-reference/statements/select/from.md#select-from-final) 修飾子と一緒には機能しません。

`optimize_read_in_order` 設定が無効になっている場合、ClickHouse サーバーは `SELECT` クエリを処理するときにテーブルインデックスを使用しません。

`ORDER BY` 句を持つクエリを実行する際には、 `optimize_read_in_order` を手動で無効にすることを検討してください。大きな `LIMIT` と、クエリされたデータが見つかるまでに膨大な量のレコードを読み取る必要がある `WHERE` 条件がある場合です。

最適化は次のテーブルエンジンでサポートされています：

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)（[マテリアライズドビュー](../../../sql-reference/statements/create/view.md#materialized-view) を含む）、
- [Merge](../../../engines/table-engines/special/merge.md)、
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView` エンジンのテーブルでは、最適化は `SELECT ... FROM merge_tree_table ORDER BY pk` のようなビューで機能します。しかし、ビューのクエリで `ORDER BY` 句を持たない場合、 `SELECT ... FROM view ORDER BY pk` のようなクエリではサポートされていません。

## ORDER BY 表現 WITH FILL 修飾子 {#order-by-expr-with-fill-modifier}

この修飾子は、[LIMIT ... WITH TIES 修飾子](../../../sql-reference/statements/select/limit.md#limit-with-ties) と組み合わせることもできます。

`WITH FILL` 修飾子は `ORDER BY expr` の後に設定でき、オプションの `FROM expr`、`TO expr`、および `STEP expr` パラメータを持つことができます。
すべての欠落している `expr` カラムの値は順次埋められ、他のカラムはデフォルトの値で埋められます。

複数のカラムを埋めるには、`ORDER BY` セクションの各フィールド名の後にオプションのパラメータとともに `WITH FILL` 修飾子を追加します。

``` sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` は、数値（すべてのタイプの浮動小数点、10進、小整数）または日付/日付時刻タイプのフィールドに適用できます。`String` フィールドに適用された場合、欠落している値は空の文字列で埋められます。
`FROM const_expr` が定義されていない場合は、埋める順序は `ORDER BY` の最小 `expr` フィールド値を使用します。
`TO const_expr` が定義されていない場合は、埋める順序は `ORDER BY` の最大 `expr` フィールド値を使用します。
`STEP const_numeric_expr` が定義されている場合、`const_numeric_expr` は数値タイプ用のそのまま解釈され、日付タイプ用には `days`、日付時刻タイプ用には `seconds` として解釈されます。また、時間や日付の間隔を表す [INTERVAL](/sql-reference/data-types/special-data-types/interval/) データタイプもサポートしています。
`STEP const_numeric_expr` が省略されると、埋める順序は数値タイプには `1.0`、日付タイプには `1 day`、日付時刻タイプには `1 second` になります。
`STALENESS const_numeric_expr` が定義されている場合、前の行との差が元のデータで `const_numeric_expr` を超えるまで、クエリは行を生成します。
`INTERPOLATE` は `ORDER BY WITH FILL` に参加していないカラムに適用できます。そのようなカラムは、以前のフィールドの値に基づいて `expr` を適用して埋められます。`expr` が存在しない場合は、前の値を繰り返します。省略されたリストは、すべての許可されたカラムを含める結果になります。

`WITH FILL` を使用しないクエリの例：

``` sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n;
```

結果：

``` text
┌─n─┬─source───┐
│ 1 │ original │
│ 4 │ original │
│ 7 │ original │
└───┴──────────┘
```

`WITH FILL` 修飾子を適用した後の同じクエリ：

``` sql
SELECT n, source FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果：

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

複数のフィールドで `ORDER BY field2 WITH FILL, field1 WITH FILL` のケースでは、埋める順序は `ORDER BY` 句のフィールドの順序に従います。

例：

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

結果：

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

フィールド `d1` は埋められず、デフォルト値を使用します。なぜなら、`d2` の値に対する繰り返しの値がなく、`d1` の順序を適切に計算できないからです。

`ORDER BY` でフィールドを変更した次のクエリ：

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

結果：

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

次のクエリでは、列 `d1` に対して各データを埋めるために 1 日の `INTERVAL` データタイプを使用します：

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

`STALENESS` を持たないクエリの例：

``` sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL;
```

結果：

``` text
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

``` sql
SELECT number as key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

結果：

``` text
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

`INTERPOLATE` を持たないクエリの例：

``` sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5;
```

結果：

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

`INTERPOLATE` を適用した後の同じクエリ：

``` sql
SELECT n, source, inter FROM (
   SELECT toFloat32(number % 10) AS n, 'original' AS source, number as inter
   FROM numbers(10) WHERE number % 3 = 1
) ORDER BY n WITH FILL FROM 0 TO 5.51 STEP 0.5 INTERPOLATE (inter AS inter + 1);
```

結果：

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

## ソートプレフィックスによるグループ化充填 {#filling-grouped-by-sorting-prefix}

特定のカラムに同じ値を持つ行を独立して埋めることは便利です。例えば、時間系列の欠落値を埋める良い例です。
以下の時間系列テーブルがあると仮定しましょう：
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
各センサーについて独立して 1 秒の間隔で欠落した値を埋めたいと考えています。
これを実現する方法は、`sensor_id` カラムをソートプレフィックスとして使用して `timestamp` カラムを充填します：
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
ここでは、充填された行をより目立たせるために `value` カラムが `9999` で補間されました。
この動作は、`use_with_fill_by_sorting_prefix` を設定することで制御されます（デフォルトで有効）。

## 関連コンテンツ {#related-content}

- ブログ：[ClickHouse における時間系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
