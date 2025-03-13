---
slug: '/sql-reference/statements/select/join'
sidebar_label: 'テーブルの結合'
---


# JOIN句

JOINは、1つまたは複数のテーブルから共通の値を使用してカラムを結合することで新しいテーブルを生成します。これは、SQLをサポートするデータベースにおける一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)のJOINに相当します。1つのテーブルのJOINの特別なケースは、一般的に「自己結合」と呼ばれます。

**構文**

``` sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON`句の式および`USING`句のカラムは「結合キー」と呼ばれます。特に指定がない限り、JOINは「結合キー」が一致する行からの[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成し、これによりソーステーブルよりもはるかに多くの行を持つ結果が生成される可能性があります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse: 完全SQL JOINサポートの驚異的に高速なDBMS - パート1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- ブログ: [ClickHouse: 完全SQL JOINサポートの驚異的に高速なDBMS - 内部の仕組み - パート2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- ブログ: [ClickHouse: 完全SQL JOINサポートの驚異的に高速なDBMS - 内部の仕組み - パート3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- ブログ: [ClickHouse: 完全SQL JOINサポートの驚異的に高速なDBMS - 内部の仕組み - パート4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)

## サポートされているJOINの種類 {#supported-types-of-join}

すべての標準[SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL))タイプがサポートされています：

- `INNER JOIN`、一致する行のみが返されます。
- `LEFT OUTER JOIN`、左テーブルから一致する行に加えて、非一致の行も返されます。
- `RIGHT OUTER JOIN`、右テーブルから一致する行に加えて、非一致の行も返されます。
- `FULL OUTER JOIN`、両方のテーブルから一致する行に加えて、非一致の行も返されます。
- `CROSS JOIN`、全テーブルのデカルト積を生成し、「結合キー」は**指定されません**。

指定されたタイプなしの`JOIN`は`INNER`を意味します。キーワード`OUTER`は安全に省略できます。`CROSS JOIN`の代替構文は、[FROM句](../../../sql-reference/statements/select/from.md)でカンマで区切った複数のテーブルを指定することです。

ClickHouseで使用可能な追加のJOINタイプ：

- `LEFT SEMI JOIN`および`RIGHT SEMI JOIN`、デカルト積を生成せずに「結合キー」のホワイトリスト。
- `LEFT ANTI JOIN`および`RIGHT ANTI JOIN`、デカルト積を生成せずに「結合キー」のブラックリスト。
- `LEFT ANY JOIN`、`RIGHT ANY JOIN`および`INNER ANY JOIN`、デカルト積を部分的（`LEFT`と`RIGHT`の反対側の場合）または完全に（`INNER`と`FULL`の場合）無効にします。
- `ASOF JOIN`および`LEFT ASOF JOIN`、厳密には一致しないシーケンスを結合します。`ASOF JOIN`の使用は以下に示されています。
- `PASTE JOIN`、二つのテーブルの水平方向の連結を行います。

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)が`partial_merge`に設定されている場合、`RIGHT JOIN`および`FULL JOIN`は`ALL`の厳密度でのみサポートされています（`SEMI`、`ANTI`、`ANY`および`ASOF`はサポートされていません）。
:::

## 設定 {#settings}

デフォルトのJOINタイプは、[join_default_strictness](../../../operations/settings/settings.md#join_default_strictness)設定を使用してオーバーライドできます。

`ANY JOIN`操作におけるClickHouseサーバーの動作は、[any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)設定に依存します。

**参考**

- [join_algorithm](../../../operations/settings/settings.md#join_algorithm)
- [join_any_take_last_row](../../../operations/settings/settings.md#join_any_take_last_row)
- [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)
- [partial_merge_join_rows_in_right_blocks](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [join_on_disk_max_files_to_merge](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite`設定を使用して、ClickHouseが`CROSS JOIN`を`INNER JOIN`として書き換えられなかった場合の動作を定義します。デフォルト値は`1`で、これによりJOINが続行されますが、遅くなります。エラーをスローさせたい場合は`cross_to_inner_join_rewrite`を`0`に設定し、全てのカンマ/CROSS JOINの書き換えを強制するには`2`に設定します。値が`2`のときに書き換えが失敗すると、「`WHERE`セクションを簡素化してください」というエラーメッセージが表示されます。

## ONセクション条件 {#on-section-conditions}

`ON`セクションには、`AND`および`OR`演算子を使用して結合された複数の条件を含めることができます。結合キーを指定する条件は、左側と右側の両方のテーブルを参照しなければならず、等号演算子を使用する必要があります。他の条件は別の論理演算子を使用できますが、クエリの左側または右側のテーブルのいずれかを参照する必要があります。

複合条件全体が満たされている場合に行が結合されます。条件が満たされない場合でも、`JOIN`タイプに応じて結果に行が含まれる場合があります。同じ条件が`WHERE`セクションに配置されていて、満たされない場合は、行は常に結果からフィルタリングされます。

`ON`句内の`OR`演算子は、ハッシュ結合アルゴリズムを使用して機能します。`JOIN`の結合キーに対する各`OR`引数に対して別々のハッシュテーブルが作成されるため、メモリ消費量とクエリ実行時間は、`ON`句の`OR`表現の数の増加に伴って線形に増加します。

:::note
異なるテーブルからカラムを参照する条件がある場合、現時点では等号演算子（`=`）のみがサポートされています。
:::

**例**

`table_1`と`table_2`を考えます：

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

1つの結合キー条件と`table_2`に対する追加条件を持つクエリ：

``` sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には、名前が`C`でテキストカラムが空の行が含まれます。これは、`OUTER`タイプのJOINが使用されているため、結果に含まれます。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

`INNER`タイプのJOINと複数の条件を持つクエリ：

``` sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

結果：

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```
`INNER`タイプのJOINおよび`OR`を含む条件のクエリ：

``` sql
CREATE TABLE t1 (`a` Int64, `b` Int64) ENGINE = MergeTree() ORDER BY a;

CREATE TABLE t2 (`key` Int32, `val` Int64) ENGINE = MergeTree() ORDER BY key;

INSERT INTO t1 SELECT number as a, -a as b from numbers(5);

INSERT INTO t2 SELECT if(number % 2 == 0, toInt64(number), -number) as key, number as val from numbers(5);

SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key;
```

結果：

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 1 │ -1 │   1 │
│ 2 │ -2 │   2 │
│ 3 │ -3 │   3 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

`INNER`タイプのJOINおよび`OR`および`AND`を含む条件のクエリ：

:::note

デフォルトでは、非等条件は同じテーブルのカラムを使用する限りサポートされています。
たとえば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`、`t1.b > 0`は`t1`だけのカラムを使用し、`t2.b > t2.c`は`t2`だけのカラムを使用します。
ただし、`t1.a = t2.key AND t1.b > t2.key`のような条件の実験的なサポートを試すことができます。詳細は以下のセクションを確認してください。

:::

``` sql
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

## 異なるテーブルからのカラムに対する不等条件を持つJOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouseでは、現時点で`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`を不等条件でサポートしています。これに加えて等号条件がサポートされます。不等条件は、`hash`および`grace_hash`結合アルゴリズムでのみサポートされています。`join_use_nulls`では不等条件はサポートされていません。

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

テーブル`t2`:

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
SELECT t1.*, t2.* from t1 LEFT JOIN t2 ON t1.key = t2.key and (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
```

```response
key1	a	1	1	2	key1	B	2	1	2
key1	a	1	1	2	key1	C	3	4	5
key1	a	1	1	2	key1	D	4	1	6
key1	b	2	3	2	key1	C	3	4	5
key1	b	2	3	2	key1	D	4	1	6
key1	c	3	2	1	key1	D	4	1	6
key1	d	4	7	2			0	0	\N
key1	e	5	5	5			0	0	\N
key2	a2	1	1	1			0	0	\N
key4	f	2	3	4			0	0	\N
```


## JOINキーのNULL値 {#null-values-in-join-keys}

NULLは任意の値、自己すら等しくありません。これは、JOINキーが一方のテーブルにNULLの値を持っている場合、他方のテーブルのNULL値と一致しないことを意味します。

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

JOINキーにNULL値があるため、テーブル`A`の`Charlie`の行とテーブル`B`のスコア88の行は結果に含まれていないことに注意してください。

NULL値を一致させたい場合は、`isNotDistinctFrom`関数を使用してJOINキーを比較してください。

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```markdown
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │    88 │
└─────────┴───────┘
```

## ASOF JOINの使用法 {#asof-join-usage}

`ASOF JOIN`は、正確な一致がないレコードを結合する必要がある場合に便利です。

このアルゴリズムには、テーブル内の特別なカラムが必要です。このカラムは：

- 順序されたシーケンスを含む必要があります。
- 以下のいずれかのタイプであることができます： [Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash`結合アルゴリズムの場合、`JOIN`句における唯一のカラムであってはなりません。

構文 `ASOF JOIN ... ON`：

``` sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

等号条件を任意の数使用できますが、最も近い一致条件は1つだけ使用できます。たとえば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`のようにします。

最も近い一致のためにサポートされている条件：`>`、`>=`、`<`、`<=`。

構文 `ASOF JOIN ... USING`：

``` sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`は、等号のために`equi_columnX`を使用し、最も近い一致のために`asof_column`を使用します。この場合、`table_1.asof_column >= table_2.asof_column`条件が必要です。`asof_column`カラムは常に`USING`句の最後にあります。

以下のテーブルを考えてみましょう：

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN`は、`table_1`のユーザーイベントのタイムスタンプを取り、最も近い一致条件に該当する`table_1`のタイムスタンプに最も近い`table_2`のイベントを見つけます。等しいタイムスタンプの値は、利用可能であれば最も近いものです。ここで、`user_id`カラムは等号のための結合に使用でき、`ev_time`カラムは最も近い一致のために使用できます。この例では、`event_1_1`は`event_2_1`と結合され、`event_1_2`は`event_2_3`と結合できますが、`event_2_2`は結合できません。

:::note
`ASOF JOIN`は、`hash`および`full_sorting_merge`結合アルゴリズムでのみサポートされています。
[Join](../../../engines/table-engines/special/join.md)テーブルエンジンではサポートされていません。
:::

## PASTE JOINの使用法 {#paste-join-usage}

`PASTE JOIN`の結果は、左側のサブクエリからのすべてのカラムの後に、右側のサブクエリからのすべてのカラムを含むテーブルです。
行は、元のテーブルにおける位置に基づいて一致します（行の順序は定義する必要があります）。
サブクエリが異なる行数を返す場合、余分な行は切り取られます。

例：
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
注意: この場合、結果は並行読み取りされると非決定的な場合があります。例：
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

分散テーブルに関連するJOINを実行する方法は2つあります：

- 通常の`JOIN`を使用すると、クエリはリモートサーバーに送信されます。サブクエリは、右側のテーブルを作成するために各サーバーで実行され、そのテーブルとJOINが実行されます。言い換えれば、右側のテーブルは各サーバーでそれぞれ形成されます。
- `GLOBAL ... JOIN`を使用すると、最初にリクエスタサーバーがサブクエリを実行して右側のテーブルを計算します。この一時テーブルは各リモートサーバーに渡され、送信された一時データを使用してクエリが実行されます。

`GLOBAL`を使用する際には注意が必要です。詳細については、[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries)セクションを参照してください。

## 暗黙的型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および`FULL JOIN`クエリは、「結合キー」に対して暗黙的な型変換をサポートしています。ただし、左側と右側のテーブルの結合キーを単一のタイプに変換できない場合、クエリは実行できません（たとえば、`UInt64`と`Int64`、または`String`と`Int32`の両方のすべての値を保持できるデータ型は存在しません）。

**例**

テーブル`t_1`を考えます：
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
およびテーブル`t_2`：
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│ -1 │    1 │ Int16         │ Nullable(Int64) │
│  1 │   -1 │ Int16         │ Nullable(Int64) │
│  1 │    1 │ Int16         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

クエリ
```sql
SELECT a, b, toTypeName(a), toTypeName(b) FROM t_1 FULL JOIN t_2 USING (a, b);
```
は次のセットを返します：
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 使用の推奨 {#usage-recommendations}

### 空またはNULLセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合すると、空のセルが発生する場合があります。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)設定は、ClickHouseがこれらのセルをどのように埋めるかを定義します。

`JOIN`キーが[Nullable](../../../sql-reference/data-types/nullable.md)フィールドである場合、キーのうち少なくとも1つが[NULL](/sql-reference/syntax#null)値を持つ行は結合されません。

### 構文 {#syntax}

`USING`で指定されたカラムは、両方のサブクエリで同じ名前を持っている必要があり、他のカラムは異なる名前でなければなりません。エイリアスを使用してサブクエリ内のカラムの名前を変更できます。

`USING`句は、結合に複数のカラムを指定し、これによりこれらのカラムの等式を確立します。カラムのリストは括弧なしで設定されます。より複雑な結合条件はサポートされていません。

### 構文の制限 {#syntax-limitations}

単一の`SELECT`クエリ内で複数の`JOIN`句がある場合：

- `*`を介してすべてのカラムを取得することは、テーブルが結合されている場合のみ利用できます。サブクエリは含まれません。
- `PREWHERE`句は利用できません。
- `USING`句は利用できません。

`ON` 、 `WHERE` 、および `GROUP BY` 句の場合：

- `ON`、`WHERE`、および`GROUP BY`句で任意の表現を使用できませんが、`SELECT`句で表現を定義し、エイリアスを介してそれをこれらの句で使用できます。

### パフォーマンス {#performance}

`JOIN`を実行するとき、他のクエリステージに対する実行順序の最適化は行われません。JOIN（右側のテーブルの検索）は、`WHERE`でのフィルタリングおよび集約の前に実行されます。

同じ`JOIN`でクエリが実行されるたびに、サブクエリは再度実行されます。結果はキャッシュされません。これを避けるには、常にRAM内にあるJOIN用の準備された配列である特別な[Join](../../../engines/table-engines/special/join.md)テーブルエンジンを使用してください。

場合によっては、`JOIN`ではなく、[IN](../../../sql-reference/operators/in.md)を使用する方が効率的です。

次元テーブル（これらは、広告キャンペーンの名前などの次元特性を含む比較的小さなテーブル）との結合に`JOIN`が必要な場合、右側のテーブルがすべてのクエリに対して再アクセスされるため、`JOIN`はそれほど便利ではないかもしれません。そのような場合には、`JOIN`の代わりに「辞書」機能を使用することをお勧めします。詳細については、[辞書](../../../sql-reference/dictionaries/index.md)セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouseは[ハッシュJOIN](https://en.wikipedia.org/wiki/Hash_join)アルゴリズムを使用します。ClickHouseは右側のテーブルを取り、それに対してRAM内にハッシュテーブルを作成します。`join_algorithm = 'auto'`が有効になっている場合、一部のメモリ消費の閾値を超えると、ClickHouseは[マージ](https://en.wikipedia.org/wiki/Sort-merge_join)結合アルゴリズムに戻ります。`JOIN`アルゴリズムの説明については、[join_algorithm](../../../operations/settings/settings.md#join_algorithm)設定を参照してください。

`JOIN`操作のメモリ消費を制限する必要がある場合は、次の設定を使用してください：

- [max_rows_in_join](../../../operations/settings/query-complexity.md#settings-max_rows_in_join) — ハッシュテーブル内の行数の制限。
- [max_bytes_in_join](../../../operations/settings/query-complexity.md#settings-max_bytes_in_join) — ハッシュテーブルのサイズの制限。

これらのいずれかの制限に達すると、ClickHouseは[join_overflow_mode](../../../operations/settings/settings.md#settings-join_overflow_mode)設定に従って動作します。

## 例 {#examples}

例：

``` sql
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

``` text
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
