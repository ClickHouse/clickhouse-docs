---
description: 'ORDER BY 句に関するドキュメント'
sidebar_label: 'ORDER BY'
slug: /sql-reference/statements/select/order-by
title: 'ORDER BY 句'
doc_type: 'reference'
---



# ORDER BY 句

`ORDER BY` 句には次のいずれかを含めることができます。

- 式のリスト。例: `ORDER BY visits, search_phrase`
- `SELECT` 句内の列を参照する番号のリスト。例: `ORDER BY 2, 1`
- `SELECT` 句内のすべての列を意味する `ALL`。例: `ORDER BY ALL`

列番号によるソートを無効にするには、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) = 0 にします。
`ALL` によるソートを無効にするには、設定 [enable_order_by_all](/operations/settings/settings#enable_order_by_all) = 0 にします。

`ORDER BY` 句には、ソート方向を決定する `DESC`（降順）または `ASC`（昇順）の修飾子を付けることができます。
明示的なソート順が指定されていない場合は、デフォルトで `ASC` が使用されます。
ソート方向はリスト全体ではなく単一の式に適用されます。例: `ORDER BY Visits DESC, SearchPhrase`。
また、ソートは大文字と小文字を区別して実行されます。

ソート式の値が同一の行は、任意かつ非決定的な順序で返されます。
`SELECT` 文で `ORDER BY` 句を省略した場合も、行の順序は任意かつ非決定的になります。



## 特殊値のソート {#sorting-of-special-values}

`NaN`と`NULL`のソート順には2つのアプローチがあります:

- デフォルトまたは`NULLS LAST`修飾子を使用する場合: 最初に通常の値、次に`NaN`、最後に`NULL`の順になります。
- `NULLS FIRST`修飾子を使用する場合: 最初に`NULL`、次に`NaN`、最後にその他の値の順になります。

### 例 {#example}

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

クエリ`SELECT * FROM t_null_nan ORDER BY y NULLS FIRST`を実行すると、次の結果が得られます:

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

浮動小数点数をソートする場合、NaNは他の値とは別に扱われます。ソート順に関係なく、NaNは最後に配置されます。言い換えると、昇順ソートでは他のすべての数値よりも大きいかのように配置され、降順ソートでは他のすべての数値よりも小さいかのように配置されます。


## 照合順序のサポート {#collation-support}

[String](../../../sql-reference/data-types/string.md)値でソートする際に、照合順序(比較方法)を指定できます。例:`ORDER BY SearchPhrase COLLATE 'tr'` - 文字列がUTF-8でエンコードされていることを前提として、トルコ語アルファベットを使用し、大文字小文字を区別せずにキーワードを昇順でソートします。`COLLATE`はORDER BY内の各式に対して独立して指定するかどうかを選択できます。`ASC`または`DESC`が指定されている場合、`COLLATE`はその後に指定します。`COLLATE`を使用する場合、ソートは常に大文字小文字を区別しません。

照合順序は[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)、[Nullable](../../../sql-reference/data-types/nullable.md)、[Array](../../../sql-reference/data-types/array.md)、[Tuple](../../../sql-reference/data-types/tuple.md)でサポートされています。

`COLLATE`を使用したソートは通常のバイト単位のソートよりも効率が劣るため、少数の行の最終的なソートにのみ使用することを推奨します。


## 照合順序の例 {#collation-examples}

[String](../../../sql-reference/data-types/string.md)値のみの例:

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

[Nullable](../../../sql-reference/data-types/nullable.md)の例:

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

[Array](../../../sql-reference/data-types/array.md)の例:

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

[LowCardinality](../../../sql-reference/data-types/lowcardinality.md)文字列の例:

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

[Tuple](../../../sql-reference/data-types/tuple.md)の例:


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

`ORDER BY`に加えて十分に小さい[LIMIT](../../../sql-reference/statements/select/limit.md)を指定すると、使用されるRAMが少なくなります。それ以外の場合、消費されるメモリ量はソート対象のデータ量に比例します。分散クエリ処理において、[GROUP BY](/sql-reference/statements/select/group-by)が省略されている場合、ソートはリモートサーバー上で部分的に実行され、結果はリクエスト元サーバーでマージされます。これは、分散ソートの場合、ソート対象のデータ量が単一サーバーのメモリ量を超える可能性があることを意味します。

RAMが不足している場合、外部メモリでソートを実行すること(ディスク上に一時ファイルを作成すること)が可能です。この目的には`max_bytes_before_external_sort`設定を使用します。この値が0に設定されている場合(デフォルト)、外部ソートは無効になります。有効にした場合、ソート対象のデータ量が指定されたバイト数に達すると、収集されたデータがソートされ、一時ファイルにダンプされます。すべてのデータが読み込まれた後、すべてのソート済みファイルがマージされ、結果が出力されます。ファイルは設定内の`/var/lib/clickhouse/tmp/`ディレクトリに書き込まれます(デフォルトですが、`tmp_path`パラメータを使用してこの設定を変更できます)。また、クエリがメモリ制限を超えた場合にのみディスクへのスピルを使用することもできます。例えば、`max_bytes_ratio_before_external_sort=0.6`は、クエリがメモリ制限(ユーザー/サーバー)の`60%`に達した時点でのみディスクへのスピルを有効にします。

クエリの実行は`max_bytes_before_external_sort`よりも多くのメモリを使用する可能性があります。このため、この設定値は`max_memory_usage`よりも大幅に小さくする必要があります。例えば、サーバーに128 GBのRAMがあり、単一のクエリを実行する必要がある場合、`max_memory_usage`を100 GBに、`max_bytes_before_external_sort`を80 GBに設定します。

外部ソートはRAM内でのソートよりもはるかに効率が劣ります。


## データ読み取りの最適化 {#optimization-of-data-reading}

`ORDER BY`式がテーブルのソートキーと一致する接頭辞を持つ場合、[optimize_read_in_order](../../../operations/settings/settings.md#optimize_read_in_order)設定を使用してクエリを最適化できます。

`optimize_read_in_order`設定が有効な場合、ClickHouseサーバーはテーブルインデックスを使用し、`ORDER BY`キーの順序でデータを読み取ります。これにより、[LIMIT](../../../sql-reference/statements/select/limit.md)が指定されている場合に全データの読み取りを回避できます。そのため、小さなLIMIT値を持つ大規模データに対するクエリはより高速に処理されます。

最適化は`ASC`と`DESC`の両方で機能しますが、[GROUP BY](/sql-reference/statements/select/group-by)句および[FINAL](/sql-reference/statements/select/from#final-modifier)修飾子とは併用できません。

`optimize_read_in_order`設定が無効な場合、ClickHouseサーバーは`SELECT`クエリの処理中にテーブルインデックスを使用しません。

`ORDER BY`句、大きな`LIMIT`値、およびクエリ対象データが見つかる前に膨大な量のレコードを読み取る必要がある[WHERE](../../../sql-reference/statements/select/where.md)条件を持つクエリを実行する場合は、`optimize_read_in_order`を手動で無効にすることを検討してください。

最適化は以下のテーブルエンジンでサポートされています:

- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)([マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む)
- [Merge](../../../engines/table-engines/special/merge.md)
- [Buffer](../../../engines/table-engines/special/buffer.md)

`MaterializedView`エンジンテーブルでは、`SELECT ... FROM merge_tree_table ORDER BY pk`のようなビューで最適化が機能します。ただし、ビュークエリに`ORDER BY`句がない場合、`SELECT ... FROM view ORDER BY pk`のようなクエリではサポートされません。


## ORDER BY Expr WITH FILL 修飾子 {#order-by-expr-with-fill-modifier}

この修飾子は[LIMIT ... WITH TIES 修飾子](/sql-reference/statements/select/limit#limit--with-ties-modifier)と組み合わせることもできます。

`WITH FILL` 修飾子は、オプションの `FROM expr`、`TO expr`、`STEP expr` パラメータとともに `ORDER BY expr` の後に設定できます。
`expr` 列の欠落した値はすべて順次補完され、他の列はデフォルト値で埋められます。

複数の列を補完するには、`ORDER BY` セクションの各フィールド名の後にオプションのパラメータを持つ `WITH FILL` 修飾子を追加します。

```sql
ORDER BY expr [WITH FILL] [FROM const_expr] [TO const_expr] [STEP const_numeric_expr] [STALENESS const_numeric_expr], ... exprN [WITH FILL] [FROM expr] [TO expr] [STEP numeric_expr] [STALENESS numeric_expr]
[INTERPOLATE [(col [AS expr], ... colN [AS exprN])]]
```

`WITH FILL` は、数値型(すべての種類の浮動小数点数、decimal、int)またはDate/DateTime型のフィールドに適用できます。`String` フィールドに適用した場合、欠落した値は空文字列で埋められます。
`FROM const_expr` が定義されていない場合、補完シーケンスは `ORDER BY` の `expr` フィールドの最小値を使用します。
`TO const_expr` が定義されていない場合、補完シーケンスは `ORDER BY` の `expr` フィールドの最大値を使用します。
`STEP const_numeric_expr` が定義されている場合、`const_numeric_expr` は数値型では `そのまま`、Date型では `日数`、DateTime型では `秒数` として解釈されます。また、時間と日付の間隔を表す[INTERVAL](/sql-reference/data-types/special-data-types/interval/)データ型もサポートしています。
`STEP const_numeric_expr` が省略された場合、補完シーケンスは数値型では `1.0`、Date型では `1 day`、DateTime型では `1 second` を使用します。
`STALENESS const_numeric_expr` が定義されている場合、クエリは元のデータの前の行との差が `const_numeric_expr` を超えるまで行を生成します。
`INTERPOLATE` は `ORDER BY WITH FILL` に参加していない列に適用できます。このような列は、`expr` を適用することで前のフィールド値に基づいて補完されます。`expr` が存在しない場合は、前の値が繰り返されます。リストを省略すると、許可されたすべての列が含まれます。

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

`WITH FILL` 修飾子を適用した同じクエリ:

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

複数のフィールドがある場合、`ORDER BY field2 WITH FILL, field1 WITH FILL` の補完順序は `ORDER BY` 句のフィールドの順序に従います。

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

フィールド `d1` は補完されず、デフォルト値も適用されません。これは、`d2` の値に対して繰り返しが存在せず、`d1` のシーケンスを正しく計算できないためです。

`ORDER BY` でフィールドを変更した次のクエリ:

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

次のクエリでは、列 `d1` に入力される各データに対して、1 日の `INTERVAL` 型を使用します。

```sql
SELECT
    toDate((number * 10) * 86400) AS d1,
    toDate(number * 86400) AS d2,
    '元データ' AS source
FROM numbers(10)
WHERE (number % 3) = 1
ORDER BY
    d1 WITH FILL STEP INTERVAL 1 DAY,
    d2 WITH FILL;
```


結果:

```response
┌─────────d1─┬─────────d2─┬─source───┐
│ 1970-01-11 │ 1970-01-02 │ 元データ │
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
│ 1970-02-10 │ 1970-01-05 │ 元データ │
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
│ 1970-03-12 │ 1970-01-08 │ 元データ │
└────────────┴────────────┴──────────┘
```

`STALENESS` を指定していないクエリの例:

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

`STALENESS 3` を適用したあとの同じクエリ：

```sql
SELECT number AS key, 5 * number value, 'original' AS source
FROM numbers(16) WHERE key % 5 == 0
ORDER BY key WITH FILL STALENESS 3;
```

結果:

```text
    ┌─key─┬─value─┬─source───┐
 1. │   0 │     0 │ 元データ │
 2. │   1 │     0 │          │
 3. │   2 │     0 │          │
 4. │   5 │    25 │ 元データ │
 5. │   6 │     0 │          │
 6. │   7 │     0 │          │
 7. │  10 │    50 │ 元データ │
 8. │  11 │     0 │          │
 9. │  12 │     0 │          │
10. │  15 │    75 │ 元データ │
11. │  16 │     0 │          │
12. │  17 │     0 │          │
    └─────┴───────┴──────────┘
```

`INTERPOLATE` を使わないクエリ例:

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
│   1 │ 元の値 │     1 │
│ 1.5 │          │     0 │
│   2 │          │     0 │
│ 2.5 │          │     0 │
│   3 │          │     0 │
│ 3.5 │          │     0 │
│   4 │ 元の値 │     4 │
│ 4.5 │          │     0 │
│   5 │          │     0 │
│ 5.5 │          │     0 │
│   7 │ 元の値 │     7 │
└─────┴──────────┴───────┘
```

`INTERPOLATE` を適用したあとの同じクエリ：

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
│   1 │ 元の値 │     1 │
│ 1.5 │          │     2 │
│   2 │          │     3 │
│ 2.5 │          │     4 │
│   3 │          │     5 │
│ 3.5 │          │     6 │
│   4 │ 元の値 │     4 │
│ 4.5 │          │     5 │
│   5 │          │     6 │
│ 5.5 │          │     7 │
│   7 │ 元の値 │     7 │
└─────┴──────────┴───────┘
```


## ソート接頭辞によるグループ化された補完 {#filling-grouped-by-sorting-prefix}

特定のカラムで同じ値を持つ行を独立して補完することが有用な場合があります。時系列データにおける欠損値の補完が良い例です。
以下のような時系列テーブルがあると仮定します:

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

各センサーの欠損値を1秒間隔で独立して補完したいとします。
これを実現する方法は、`sensor_id`カラムを補完対象カラム`timestamp`のソート接頭辞として使用することです:

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

ここでは、補完された行をより目立たせるために、`value`カラムを`9999`で補間しています。
この動作は設定`use_with_fill_by_sorting_prefix`によって制御されます(デフォルトで有効)


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
