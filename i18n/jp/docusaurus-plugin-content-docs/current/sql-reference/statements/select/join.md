---
slug: /sql-reference/statements/select/join
sidebar_label: テーブルの結合
---


# JOIN句

JOINは、1つまたは複数のテーブルからのカラムを、各テーブルで共通の値を用いて結合することによって新しいテーブルを生成します。これはSQLをサポートするデータベースにおける一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)の結合に対応します。1つのテーブルの結合の特別なケースは、「自己結合」と呼ばれることがよくあります。

**構文**

``` sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON`句からの式および`USING`句からのカラムは「結合キー」と呼ばれます。特に記載がない限り、結合は「結合キー」が一致する行からの[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成し、これにより元のテーブルよりも多くの行を持つ結果が生成されることがあります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Part 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)

## サポートされているJOINの種類 {#supported-types-of-join}

すべての標準[SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL))タイプがサポートされています:

- `INNER JOIN`: 一致する行のみが返されます。
- `LEFT OUTER JOIN`: 一致する行に加え、左テーブルからの非一致る行も返されます。
- `RIGHT OUTER JOIN`: 一致する行に加え、右テーブルからの非一致る行も返されます。
- `FULL OUTER JOIN`: 両方のテーブルからの非一致る行に加え、一致する行も返されます。
- `CROSS JOIN`: 全テーブルのデカルト積を生成し、「結合キー」は**指定されません**。

指定されたタイプなしの`JOIN`は、`INNER`を意味します。キーワード`OUTER`は安全に省略できます。`CROSS JOIN`の代替構文は、[FROM句](../../../sql-reference/statements/select/from.md)でカンマで区切られた複数のテーブルを指定することです。

ClickHouseで使用可能な追加の結合タイプ:

- `LEFT SEMI JOIN`および`RIGHT SEMI JOIN`: 「結合キー」のホワイトリストで、デカルト積を生成しません。
- `LEFT ANTI JOIN`および`RIGHT ANTI JOIN`: 「結合キー」のブラックリストで、デカルト積を生成しません。
- `LEFT ANY JOIN`、`RIGHT ANY JOIN`および`INNER ANY JOIN`: 標準の`JOIN`タイプのデカルト積を部分的に（`LEFT`および`RIGHT`の両側のため）または完全に無効にします（`INNER`および`FULL`のため）。
- `ASOF JOIN`および`LEFT ASOF JOIN`: 非正確な一致を持つシーケンスを結合します。`ASOF JOIN`の使用は下記に記載されています。
- `PASTE JOIN`: 2つのテーブルの水平方向の連結を実行します。

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)が`partial_merge`に設定されているとき、`RIGHT JOIN`および`FULL JOIN`は`ALL`厳密性に対してのみサポートされます（`SEMI`、`ANTI`、`ANY`、および`ASOF`はサポートされません）。
:::

## 設定 {#settings}

デフォルトの結合タイプは[join_default_strictness](../../../operations/settings/settings.md#join_default_strictness)設定を使用して上書きできます。

`ANY JOIN`操作に対するClickHouseサーバーの動作は、[any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)設定によって決まります。

**参照**

- [join_algorithm](../../../operations/settings/settings.md#join_algorithm)
- [join_any_take_last_row](../../../operations/settings/settings.md#join_any_take_last_row)
- [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)
- [partial_merge_join_optimizations](../../../operations/settings/settings.md#partial_merge_join_optimizations)
- [partial_merge_join_rows_in_right_blocks](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [join_on_disk_max_files_to_merge](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite`設定を使用して、ClickHouseが`CROSS JOIN`を`INNER JOIN`に書き換えられない場合の動作を定義します。デフォルト値は`1`であり、結合を続行することを許可しますが、遅くなります。`cross_to_inner_join_rewrite`を`0`に設定するとエラーがスローされ、`2`に設定するとカンマ/クロス結合をすべて書き換えることを強制します。値が`2`のときに書き換えが失敗すると、「`WHERE`セクションを簡素化してください」というエラーメッセージが表示されます。

## ONセクションの条件 {#on-section-conditions}

`ON`セクションには、`AND`および`OR`演算子を使用して結合された複数の条件を含めることができます。結合キーを指定する条件は両方の左および右テーブルを参照する必要があり、等式演算子を使用しなければなりません。他の条件は他の論理演算子を使用できますが、クエリの左または右テーブルのいずれかを参照しなければなりません。

複雑な条件全体が満たされる場合に行が結合されます。条件が満たされない場合でも、`JOIN`タイプによっては結果に行が含まれたままとなります。同じ条件が`WHERE`セクションに置かれ、満たされない場合は、行が結果から常にフィルタリングされることに注意してください。

`ON`句内の`OR`演算子はハッシュ結合アルゴリズムを使用して動作します。結合に対する各`OR`引数に対して結合キーを持つために、別々のハッシュテーブルが作成されるため、`ON`句の`OR`式の数の増加に伴い、メモリ消費とクエリ実行時間が線形に増加します。

:::note
異なるテーブルからカラムを参照する条件がある場合、現在は等式演算子（`=`）のみがサポートされています。
:::

**例**

`table_1`と`table_2`を考えます:

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

1つの結合キー条件および`table_2`に対する追加の条件を用いたクエリ:

``` sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には名前が`C`でテキストが空の行が含まれている点に注意してください。これは`OUTER`タイプの結合が使用されているため、結果に含まれたのです。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

`INNER`タイプの結合および複数の条件を用いたクエリ:

``` sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

結果:

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```

`INNER`タイプの結合および`OR`を用いた条件でのクエリ:

``` sql
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

`INNER`タイプの結合および`OR`および`AND`条件を用いたクエリ:

:::note

デフォルトでは、同じテーブルのカラムを使用している限り、不等式条件もサポートされています。
例えば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`、なぜなら`t1.b > 0`は`t1`のみのカラムを使用し、`t2.b > t2.c`は`t2`のみのカラムを使用しているからです。
ただし、`t1.a = t2.key AND t1.b > t2.key`のような条件の実験的サポートを試すことができます。詳細は以下のセクションを確認してください。

:::

``` sql
SELECT a, b, val FROM t1 INNER JOIN t2 ON t1.a = t2.key OR t1.b = t2.key AND t2.val > 3;
```

結果:

```response
┌─a─┬──b─┬─val─┐
│ 0 │  0 │   0 │
│ 2 │ -2 │   2 │
│ 4 │ -4 │   4 │
└───┴────┴─────┘
```

## 異なるテーブルのカラムに対する不等式条件での結合 {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouseは、現在、`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`を、等式条件に加え、不等式条件でもサポートしています。 不等式条件は`hash`および`grace_hash`結合アルゴリズムのみに対してサポートされています。 不等式条件は`join_use_nulls`ではサポートされていません。

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

NULLは、どの値とも等しくありません。つまり、JOINキーが一方のテーブルでNULL値を持つ場合、もう一方のテーブルでNULL値と一致しません。

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

テーブル`A`の`Charlie`とテーブル`B`のスコア88の行が結果に含まれていないことに注意してください。これは、JOINキーのNULL値によるものです。

NULL値を一致させたい場合は、`isNotDistinctFrom`関数を使用してJOINキーを比較します。

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

このアルゴリズムは、テーブル内に特別なカラムを必要とします。このカラムは:

- 整列されたシーケンスを含む必要があります。
- 次のいずれかの型にすることができます: [Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash`結合アルゴリズムのためには、`JOIN`句内の唯一のカラムではあってはいけません。

`ASOF JOIN ... ON`の構文:

``` sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

任意の数の等式条件と、正確に1つの最接近一致条件を使用できます。例えば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最接近一致に対してサポートされる条件: `>`、`>=`、`<`、`<=`。

`ASOF JOIN ... USING`の構文:

``` sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`は、`equi_columnX`を等式に使用し、`asof_column`を最接近一致に使用します。この場合の条件は、`table_1.asof_column >= table_2.asof_column`です。`USING`句内の`asof_column`カラムは常に最後のカラムです。

次のテーブルを考えてみてください:

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN`は、`table_1`のユーザーイベントのタイムスタンプを取得し、最接近一致条件に基づいて`table_2`のイベントを見つけることができます。タイムスタンプが等しい値は、利用可能な場合に最接近一致です。ここで、`user_id`カラムは、等式に対する結合に使用でき、`ev_time`カラムは最接近一致に使用できます。私たちの例では、`event_1_1`は`event_2_1`と結合され、`event_1_2`は`event_2_3`と結合されますが、`event_2_2`は結合できません。

:::note
`ASOF JOIN`は`hash`および`full_sorting_merge`結合アルゴリズムのみによってサポートされます。
これは、[Join](../../../engines/table-engines/special/join.md)テーブルエンジンでは**サポートされていません**。
:::

## PASTE JOINの使用法 {#paste-join-usage}

`PASTE JOIN`の結果は、左サブクエリのすべてのカラムの後に右サブクエリのすべてのカラムを含むテーブルです。行は元のテーブル内での位置に基づいてマッチングされます（行の順序は定義されている必要があります）。サブクエリが異なる数の行を返す場合は、余分な行がカットされます。

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
注意: この場合、結果は並行読み取りの場合非決定的になる可能性があります。例:
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

分散テーブルを用いた結合を実行するには、2つの方法があります:

- 通常の`JOIN`を使用すると、クエリはリモートサーバーに送信されます。サブクエリは各サーバーで実行され、右テーブルが生成され、そのテーブルと結合が行われます。言い換えれば、右テーブルは各サーバーで別々に形成されます。
- `GLOBAL ... JOIN`を使用すると、最初にリクエスタサーバーがサブクエリを実行して右テーブルを計算します。この一時テーブルが各リモートサーバーに渡され、一時データを使用してクエリが実行されます。

`GLOBAL`を使用する際は注意が必要です。詳細については、[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries)セクションを参照してください。

## 暗黙の型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および`FULL JOIN`クエリは、「結合キー」に対する暗黙の型変換をサポートします。ただし、左および右テーブルからの結合キーが単一の型に変換できない場合、クエリは実行できません（例えば、`UInt64`と`Int64`、または`String`と`Int32`の両方からのすべての値を保持できるデータ型が存在しないため）。

**例**

テーブル`t_1`を考えます:
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
そしてテーブル`t_2`:
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
が戻すセットは:
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 使用上の推奨 {#usage-recommendations}

### 空またはNULLセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合する際、空のセルが発生することがあります。設定[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)は、ClickHouseがこれらのセルをどのように埋めるかを定義します。

結合キーが[Nullable](../../../sql-reference/data-types/nullable.md)フィールドである場合、少なくとも1つのキーが[NULL](/sql-reference/syntax#null)値を持つ行は結合されません。

### 構文 {#syntax}

`USING`で指定されたカラムは、両方のサブクエリで同じ名前である必要があり、他のカラムは異なる名前でなければなりません。エイリアスを使用してサブクエリ内のカラムの名前を変更できます。

`USING`句は、結合する1つ以上のカラムを指定し、これらのカラムの等式を確立します。カラムのリストは括弧なしで設定されます。より複雑な結合条件はサポートされていません。

### 構文制限 {#syntax-limitations}

単一の`SELECT`クエリ内の複数の`JOIN`句に対して:

- `*`を使用してすべてのカラムを取得することは、テーブルが結合された場合のみ利用可能です、サブクエリには適用されません。
- `PREWHERE`句は利用できません。
- `USING`句は利用できません。

`ON`、`WHERE`、および`GROUP BY`句については:

- 任意の式は`ON`、`WHERE`、および`GROUP BY`句で使用できませんが、`SELECT`句で式を定義し、それをエイリアスを介してこれらの句で使用することはできます。

### パフォーマンス {#performance}

`JOIN`を実行する際、クエリの他の段階に対する実行順序の最適化は行われません。結合（右テーブルの検索）は、`WHERE`におけるフィルタリングや集約の前に実行されます。

同じ`JOIN`を用いたクエリが実行されるたびに、サブクエリは再度実行されます。なぜなら、その結果はキャッシュされないからです。これを回避するため、常にRAMに存在する結合用の準備された配列である[Join](../../../engines/table-engines/special/join.md)テーブルエンジンを使用してください。

場合によっては、`JOIN`の代わりに[IN](../../../sql-reference/operators/in.md)を使用する方が効率的です。

次元テーブル（これらは比較的小さなテーブルであり、広告キャンペーンの名前などの次元特性を含む）との結合に`JOIN`が必要な場合、右テーブルが各クエリで再アクセスされるため、`JOIN`はあまり便利ではないかもしれません。そのような場合、`JOIN`の代わりに「辞書」機能を使用すべきです。詳細については、[辞書](../../../sql-reference/dictionaries/index.md)セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouseは[ハッシュ結合](https://en.wikipedia.org/wiki/Hash_join)アルゴリズムを使用します。ClickHouseは`right_table`を取得し、そのためのハッシュテーブルをRAMに作成します。`join_algorithm = 'auto'`が有効な場合、メモリ消費のしきい値を超えると、ClickHouseは[マージ結合](https://en.wikipedia.org/wiki/Sort-merge_join)アルゴリズムにフォールバックします。`JOIN`アルゴリズムの説明については、[join_algorithm](../../../operations/settings/settings.md#join_algorithm)設定を参照してください。

`JOIN`操作のメモリ消費量を制限する必要がある場合、次の設定を使用します:

- [max_rows_in_join](../../../operations/settings/query-complexity.md#settings-max_rows_in_join) — ハッシュテーブルの行数の制限。
- [max_bytes_in_join](../../../operations/settings/query-complexity.md#settings-max_bytes_in_join) — ハッシュテーブルのサイズの制限。

これらの制限のいずれかに達すると、ClickHouseは[join_overflow_mode](../../../operations/settings/query-complexity.md#settings-join_overflow_mode)設定に従います。

## 例 {#examples}

例:

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
