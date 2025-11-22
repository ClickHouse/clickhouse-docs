---
description: 'JOIN 句に関するドキュメント'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'JOIN 句'
keywords: ['INNER JOIN', 'LEFT JOIN', 'LEFT OUTER JOIN', 'RIGHT JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT SEMI JOIN', 'RIGHT SEMI JOIN', 'LEFT ANTI JOIN', 'RIGHT ANTI JOIN', 'LEFT ANY JOIN', 'RIGHT ANY JOIN', 'INNER ANY JOIN', 'ASOF JOIN', 'LEFT ASOF JOIN', 'PASTE JOIN']
doc_type: 'reference'
---



# JOIN 句

`JOIN` 句は、1 つまたは複数のテーブルから、各テーブルに共通する値を用いて列を結合し、新しいテーブルを生成します。これは、SQL をサポートするデータベースで一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators) における結合に対応します。1 つのテーブル同士の結合という特殊なケースは、しばしば「自己結合」と呼ばれます。

**構文**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 句の式および `USING` 句の列は「結合キー」と呼ばれます。特に断りがない限り、`JOIN` は一致する「結合キー」を持つ行同士の [デカルト積](https://en.wikipedia.org/wiki/Cartesian_product) を形成し、その結果、元のテーブルよりもはるかに多くの行を含む結果セットが得られる場合があります。


## サポートされているJOINの種類 {#supported-types-of-join}

すべての標準的な[SQL JOIN](<https://en.wikipedia.org/wiki/Join_(SQL)>)タイプがサポートされています:

| タイプ               | 説明                                                                    |
| ------------------ | ------------------------------------------------------------------------------ |
| `INNER JOIN`       | 一致する行のみが返されます。                                               |
| `LEFT OUTER JOIN`  | 一致する行に加えて、左テーブルの一致しない行が返されます。   |
| `RIGHT OUTER JOIN` | 一致する行に加えて、右テーブルの一致しない行が返されます。  |
| `FULL OUTER JOIN`  | 一致する行に加えて、両方のテーブルの一致しない行が返されます。  |
| `CROSS JOIN`       | テーブル全体の直積を生成します。「結合キー」は**指定されません**。 |

- タイプが指定されていない`JOIN`は`INNER`を意味します。
- キーワード`OUTER`は省略可能です。
- `CROSS JOIN`の代替構文として、[`FROM`句](../../../sql-reference/statements/select/from.md)でカンマ区切りで複数のテーブルを指定することができます。

ClickHouseで利用可能な追加の結合タイプは以下の通りです:

| タイプ                                                | 説明                                                                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`                 | 直積を生成せずに「結合キー」に対する許可リストを適用します。                                                                                  |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`                 | 直積を生成せずに「結合キー」に対する拒否リストを適用します。                                                                                    |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 標準的な`JOIN`タイプの直積を部分的に(`LEFT`と`RIGHT`の反対側に対して)、または完全に(`INNER`と`FULL`に対して)無効化します。 |
| `ASOF JOIN`, `LEFT ASOF JOIN`                       | 完全一致しないシーケンスを結合します。`ASOF JOIN`の使用方法については後述します。                                                                      |
| `PASTE JOIN`                                        | 2つのテーブルの水平連結を実行します。                                                                                                   |

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)が`partial_merge`に設定されている場合、`RIGHT JOIN`と`FULL JOIN`は`ALL`厳密性でのみサポートされます(`SEMI`、`ANTI`、`ANY`、`ASOF`はサポートされません)。
:::


## 設定 {#settings}

デフォルトの結合タイプは、[`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 設定を使用して上書きできます。

`ANY JOIN` 操作に対する ClickHouse サーバーの動作は、[`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 設定に依存します。

**関連項目**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

ClickHouse が `CROSS JOIN` を `INNER JOIN` として書き換えることに失敗した場合の動作を定義するには、`cross_to_inner_join_rewrite` 設定を使用します。デフォルト値は `1` で、結合の続行を許可しますが、処理速度は低下します。エラーをスローさせたい場合は `cross_to_inner_join_rewrite` を `0` に設定し、クロス結合を実行せずにすべてのカンマ結合/クロス結合の書き換えを強制する場合は `2` に設定します。値が `2` の場合に書き換えが失敗すると、「Please, try to simplify `WHERE` section」というエラーメッセージが表示されます。


## ON セクションの条件 {#on-section-conditions}

`ON` セクションには、`AND` および `OR` 演算子を使用して組み合わせた複数の条件を含めることができます。結合キーを指定する条件は次の要件を満たす必要があります:

- 左側と右側の両方のテーブルを参照すること
- 等価演算子を使用すること

その他の条件では他の論理演算子を使用できますが、クエリの左側または右側のいずれか一方のテーブルのみを参照する必要があります。

複合条件全体が満たされた場合に行が結合されます。条件が満たされない場合でも、`JOIN` の種類によっては結果に行が含まれることがあります。なお、同じ条件が `WHERE` セクションに配置され、それらが満たされない場合、行は常に結果から除外されます。

`ON` 句内の `OR` 演算子はハッシュ結合アルゴリズムを使用して動作します。`JOIN` の結合キーを持つ各 `OR` 引数に対して個別のハッシュテーブルが作成されるため、`ON` 句の `OR` 式の数が増加すると、メモリ消費量とクエリ実行時間が線形に増加します。

:::note
条件が異なるテーブルの列を参照する場合、現時点では等価演算子 (`=`) のみがサポートされています。
:::

**例**

`table_1` と `table_2` を考えます:

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

1つの結合キー条件と `table_2` に対する追加条件を持つクエリ:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には名前 `C` と空のテキスト列を持つ行が含まれていることに注意してください。これは `OUTER` タイプの結合が使用されているため、結果に含まれています。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

`INNER` タイプの結合と複数の条件を持つクエリ:

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

結果:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```

`INNER` タイプの結合と `OR` を含む条件を持つクエリ:

```sql
CREATE TABLE t1 (`a` Int64, `b` Int64) ENGINE = MergeTree() ORDER BY a;

CREATE TABLE t2 (`key` Int32, `val` Int64) ENGINE = MergeTree() ORDER BY key;

INSERT INTO t1 SELECT number as a, -a as b from numbers(5);

INSERT INTO t2 SELECT if(number % 2 == 0, toInt64(number), -number) as key, number as val from numbers(5);

SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key;
```

結果:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 1 │ -1 │   1 │
│ 2 │ -2 │   2 │
│ 3 │ -3 │   3 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

`INNER` タイプの結合と `OR` および `AND` を含む条件を持つクエリ:

:::note


デフォルトでは、同じテーブルの列を使用している限り、非等価条件がサポートされています。
たとえば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c` のように、`t1.b > 0` は `t1` の列のみを使用し、`t2.b > t2.c` は `t2` の列のみを使用しています。
ただし、`t1.a = t2.key AND t1.b > t2.key` のような条件に対する実験的サポートを試すこともできます。詳細については、以下のセクションを参照してください。

:::

```sql
SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key AND t2.val > 3;
```

結果：

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 2 │ -2 │   2 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```


## 異なるテーブルの列に対する不等条件を使用したJOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouseは現在、等価条件に加えて不等条件を使用した`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`をサポートしています。不等条件は`hash`および`grace_hash`結合アルゴリズムでのみサポートされています。不等条件は`join_use_nulls`と併用できません。

**例**

テーブル`t1`:

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ a    │ 1 │ 1 │ 2 │
│ key1 │ b    │ 2 │ 3 │ 2 │
│ key1 │ c    │ 3 │ 2 │ 1 │
│ key1 │ d    │ 4 │ 7 │ 2 │
│ key1 │ e    │ 5 │ 5 │ 5 │
│ key2 │ a2   │ 1 │ 1 │ 1 │
│ key4 │ f    │ 2 │ 3 │ 4 │
└──────┴──────┴───┴───┴───┘
```

テーブル`t2`

```response
┌─key──┬─attr─┬─a─┬─b─┬─c─┐
│ key1 │ A    │ 1 │ 2 │ 1 │
│ key1 │ B    │ 2 │ 1 │ 2 │
│ key1 │ C    │ 3 │ 4 │ 5 │
│ key1 │ D    │ 4 │ 1 │ 6 │
│ key3 │ a3   │ 1 │ 1 │ 1 │
│ key4 │ F    │ 1 │ 1 │ 1 │
└──────┴──────┴───┴───┴───┘
```

```sql
SELECT t1.*, t2.* FROM t1 LEFT JOIN t2 ON t1.key = t2.key AND (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
```

```response
key1    a    1    1    2    key1    B    2    1    2
key1    a    1    1    2    key1    C    3    4    5
key1    a    1    1    2    key1    D    4    1    6
key1    b    2    3    2    key1    C    3    4    5
key1    b    2    3    2    key1    D    4    1    6
key1    c    3    2    1    key1    D    4    1    6
key1    d    4    7    2            0    0    \N
key1    e    5    5    5            0    0    \N
key2    a2    1    1    1            0    0    \N
key4    f    2    3    4            0    0    \N
```


## JOINキーのNULL値 {#null-values-in-join-keys}

`NULL`は自身を含め、いかなる値とも等しくありません。つまり、一方のテーブルの`JOIN`キーが`NULL`値の場合、もう一方のテーブルの`NULL`値とは一致しません。

**例**

テーブル`A`:

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

テーブル`B`:

```response
┌───id─┬─score─┐
│    1 │    90 │
│    3 │    85 │
│ ᴺᵁᴸᴸ │    88 │
└──────┴───────┘
```

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON A.id = B.id
```

```response
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │     0 │
└─────────┴───────┘
```

テーブル`A`の`Charlie`の行とテーブル`B`のスコア88の行が結果に含まれていないことに注意してください。これは`JOIN`キーの`NULL`値が原因です。

`NULL`値を一致させたい場合は、`isNotDistinctFrom`関数を使用して`JOIN`キーを比較します。

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice │ 90 │
│ Bob │ 0 │
│ Charlie │ 88 │
└─────────┴───────┘
```


## ASOF JOINの使用法 {#asof-join-usage}

`ASOF JOIN`は、完全一致しないレコードを結合する必要がある場合に便利です。

このJOINアルゴリズムでは、テーブルに特別なカラムが必要です。このカラムは:

- 順序付けられたシーケンスを含む必要があります。
- 次のいずれかの型である必要があります: [Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash`結合アルゴリズムの場合、`JOIN`句内の唯一のカラムにすることはできません。

`ASOF JOIN ... ON`の構文:

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

任意の数の等価条件と、厳密に1つの最近接一致条件を使用できます。例: `SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最近接一致でサポートされる条件: `>`、`>=`、`<`、`<=`。

`ASOF JOIN ... USING`の構文:

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`は、等価結合に`equi_columnX`を使用し、`table_1.asof_column >= table_2.asof_column`条件による最近接一致結合に`asof_column`を使用します。`asof_column`カラムは常に`USING`句の最後に配置されます。

例として、次のテーブルを考えます:

```text
         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|----------   ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...
```

`ASOF JOIN`は、`table_1`からユーザーイベントのタイムスタンプを取得し、最近接一致条件に対応する`table_1`のイベントのタイムスタンプに最も近いタイムスタンプを持つ`table_2`内のイベントを見つけることができます。利用可能な場合、等しいタイムスタンプ値が最も近い値となります。ここでは、`user_id`カラムを等価結合に使用し、`ev_time`カラムを最近接一致結合に使用できます。この例では、`event_1_1`は`event_2_1`と結合でき、`event_1_2`は`event_2_3`と結合できますが、`event_2_2`は結合できません。

:::note
`ASOF JOIN`は、`hash`および`full_sorting_merge`結合アルゴリズムでのみサポートされています。
[Join](../../../engines/table-engines/special/join.md)テーブルエンジンでは**サポートされていません**。
:::


## PASTE JOINの使用法 {#paste-join-usage}

`PASTE JOIN`の結果は、左側のサブクエリのすべての列の後に右側のサブクエリのすべての列が続くテーブルです。
行は元のテーブルでの位置に基づいて対応付けられます(行の順序を定義する必要があります)。
サブクエリが異なる行数を返す場合、余分な行は切り捨てられます。

例:

```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers(2)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(2)
    ORDER BY a DESC
) AS t2

┌─a─┬─t2.a─┐
│ 0 │    1 │
│ 1 │    0 │
└───┴──────┘
```

注意: この場合、読み取りが並列で行われると結果が非決定的になる可能性があります。例:

```sql
SELECT *
FROM
(
    SELECT number AS a
    FROM numbers_mt(5)
) AS t1
PASTE JOIN
(
    SELECT number AS a
    FROM numbers(10)
    ORDER BY a DESC
) AS t2
SETTINGS max_block_size = 2;

┌─a─┬─t2.a─┐
│ 2 │    9 │
│ 3 │    8 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 0 │    7 │
│ 1 │    6 │
└───┴──────┘
┌─a─┬─t2.a─┐
│ 4 │    5 │
└───┴──────┘
```


## 分散JOIN {#distributed-join}

分散テーブルを含むJOINを実行する方法は2つあります:

- 通常の`JOIN`を使用する場合、クエリはリモートサーバーに送信されます。右側のテーブルを作成するために各サーバーでサブクエリが実行され、このテーブルを使用して結合が行われます。つまり、右側のテーブルは各サーバーで個別に形成されます。
- `GLOBAL ... JOIN`を使用する場合、まずリクエスト元サーバーがサブクエリを実行して右側のテーブルを計算します。この一時テーブルは各リモートサーバーに渡され、送信された一時データを使用してクエリが実行されます。

`GLOBAL`を使用する際は注意してください。詳細については、[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries)のセクションを参照してください。


## 暗黙的な型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および`FULL JOIN`クエリは、「結合キー」の暗黙的な型変換をサポートしています。ただし、左テーブルと右テーブルの結合キーが単一の型に変換できない場合、クエリは実行できません(例えば、`UInt64`と`Int64`の両方のすべての値を保持できるデータ型が存在しない場合や、`String`と`Int32`の場合など)。

**例**

テーブル`t_1`を考えます:

```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```

およびテーブル`t_2`:

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│ -1 │    1 │ Int16         │ Nullable(Int64) │
│  1 │   -1 │ Int16         │ Nullable(Int64) │
│  1 │    1 │ Int16         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

次のクエリ

```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```

は次の結果セットを返します:

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```


## 使用上の推奨事項 {#usage-recommendations}

### 空またはNULLセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合する際、空のセルが出現する場合があります。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)設定は、ClickHouseがこれらのセルをどのように埋めるかを定義します。

`JOIN`キーが[Nullable](../../../sql-reference/data-types/nullable.md)フィールドの場合、少なくとも1つのキーが[NULL](/sql-reference/syntax#null)値を持つ行は結合されません。

### 構文 {#syntax}

`USING`で指定される列は、両方のサブクエリで同じ名前を持つ必要があり、その他の列は異なる名前を付ける必要があります。サブクエリ内の列名を変更するには、エイリアスを使用できます。

`USING`句は結合する1つ以上の列を指定し、これらの列の等価性を確立します。列のリストは括弧なしで設定されます。より複雑な結合条件はサポートされていません。

### 構文の制限 {#syntax-limitations}

単一の`SELECT`クエリ内の複数の`JOIN`句の場合:

- `*`を使用したすべての列の取得は、サブクエリではなくテーブルが結合される場合にのみ利用可能です。
- `PREWHERE`句は利用できません。
- `USING`句は利用できません。

`ON`、`WHERE`、`GROUP BY`句の場合:

- `ON`、`WHERE`、`GROUP BY`句では任意の式を使用できませんが、`SELECT`句で式を定義し、エイリアスを介してこれらの句で使用することができます。

### パフォーマンス {#performance}

`JOIN`を実行する際、クエリの他の段階との関係において実行順序の最適化は行われません。結合(右テーブルでの検索)は、`WHERE`でのフィルタリングおよび集約の前に実行されます。

同じ`JOIN`を使用してクエリを実行するたびに、結果がキャッシュされないため、サブクエリが再度実行されます。これを回避するには、特別な[Join](../../../engines/table-engines/special/join.md)テーブルエンジンを使用してください。これは常にRAM内にある結合用の準備済み配列です。

場合によっては、`JOIN`の代わりに[IN](../../../sql-reference/operators/in.md)を使用する方が効率的です。

ディメンションテーブル(広告キャンペーン名などのディメンション属性を含む比較的小さなテーブル)との結合に`JOIN`が必要な場合、クエリごとに右テーブルが再アクセスされるため、`JOIN`はあまり便利ではない可能性があります。このような場合には、`JOIN`の代わりに使用すべき「ディクショナリ」機能があります。詳細については、[ディクショナリ](../../../sql-reference/dictionaries/index.md)セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouseは[ハッシュ結合](https://en.wikipedia.org/wiki/Hash_join)アルゴリズムを使用します。ClickHouseはright_tableを取得し、RAM内にハッシュテーブルを作成します。`join_algorithm = 'auto'`が有効な場合、メモリ消費量がある閾値を超えると、ClickHouseは[マージ](https://en.wikipedia.org/wiki/Sort-merge_join)結合アルゴリズムにフォールバックします。`JOIN`アルゴリズムの説明については、[join_algorithm](../../../operations/settings/settings.md#join_algorithm)設定を参照してください。

`JOIN`操作のメモリ消費量を制限する必要がある場合は、以下の設定を使用してください:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ハッシュテーブル内の行数を制限します。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ハッシュテーブルのサイズを制限します。

これらの制限のいずれかに達すると、ClickHouseは[join_overflow_mode](/operations/settings/settings#join_overflow_mode)設定の指示に従って動作します。


## 例 {#examples}

例:

```sql
SELECT
    CounterID,
    hits,
    visits
FROM
(
    SELECT
        CounterID,
        count() AS hits
    FROM test.hits
    GROUP BY CounterID
) ANY LEFT JOIN
(
    SELECT
        CounterID,
        sum(Sign) AS visits
    FROM test.visits
    GROUP BY CounterID
) USING CounterID
ORDER BY hits DESC
LIMIT 10
```

```text
┌─CounterID─┬───hits─┬─visits─┐
│   1143050 │ 523264 │  13665 │
│    731962 │ 475698 │ 102716 │
│    722545 │ 337212 │ 108187 │
│    722889 │ 252197 │  10547 │
│   2237260 │ 196036 │   9522 │
│  23057320 │ 147211 │   7689 │
│    722818 │  90109 │  17847 │
│     48221 │  85379 │   4652 │
│  19762435 │  77807 │   7026 │
│    722884 │  77492 │  11056 │
└───────────┴────────┴────────┘
```


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse: 完全なSQL JOIN機能を備えた超高速DBMS - Part 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- ブログ: [ClickHouse: 完全なSQL JOIN機能を備えた超高速DBMS - 内部実装 - Part 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- ブログ: [ClickHouse: 完全なSQL JOIN機能を備えた超高速DBMS - 内部実装 - Part 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- ブログ: [ClickHouse: 完全なSQL JOIN機能を備えた超高速DBMS - 内部実装 - Part 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
