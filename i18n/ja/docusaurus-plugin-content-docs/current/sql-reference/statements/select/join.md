---
slug: /sql-reference/statements/select/join
sidebar_label: テーブルの結合
---

# JOIN 句

JOIN は、各テーブルに共通する値を使用して、1 つまたは複数のテーブルから列を組み合わせることによって新しいテーブルを生成します。これは、SQL をサポートするデータベースで一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)の結合に対応します。1つのテーブルの結合の特別な場合は「自己結合」と呼ばれることがよくあります。

**構文**

``` sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 句の式と `USING` 句のカラムは「結合キー」と呼ばれます。特に明記されていない限り、結合は一致する「結合キー」を持つ行から[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成し、ソース テーブルよりもはるかに多くの行の結果を生成する場合があります。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse: フル SQL ジョイン サポートを備えた驚異的に高速な DBMS - パート 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- ブログ: [ClickHouse: フル SQL ジョイン サポートを備えた驚異的に高速な DBMS - 裏側 - パート 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- ブログ: [ClickHouse: フル SQL ジョイン サポートを備えた驚異的に高速な DBMS - 裏側 - パート 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- ブログ: [ClickHouse: フル SQL ジョイン サポートを備えた驚異的に高速な DBMS - 裏側 - パート 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)

## サポートされている JOIN の種類 {#supported-types-of-join}

すべての標準 [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) タイプがサポートされています。

- `INNER JOIN`、一致する行のみが返されます。
- `LEFT OUTER JOIN`、左テーブルの一致しない行が一致する行に加えて返されます。
- `RIGHT OUTER JOIN`、右テーブルの一致しない行が一致する行に加えて返されます。
- `FULL OUTER JOIN`、両方のテーブルの一致しない行が一致する行に加えて返されます。
- `CROSS JOIN`、全テーブルのデカルト積を生成します。「結合キー」は **指定**されません。

指定されたタイプなしの `JOIN` は、`INNER` を意味します。キーワード `OUTER` は安全に省略できます。`CROSS JOIN` の代替構文は、[FROM 句](../../../sql-reference/statements/select/from.md) でカンマで区切られた複数のテーブルを指定することです。

ClickHouse で利用可能な追加の結合タイプ：

- `LEFT SEMI JOIN` および `RIGHT SEMI JOIN`、デカルト積を生成せずに「結合キー」にホワイトリストを適用します。
- `LEFT ANTI JOIN` および `RIGHT ANTI JOIN`、デカルト積を生成せずに「結合キー」にブラックリストを適用します。
- `LEFT ANY JOIN`、`RIGHT ANY JOIN` および `INNER ANY JOIN`、標準の `JOIN` タイプに対して、部分的に（`LEFT` と `RIGHT` の逆側のために）または完全に（`INNER` と `FULL` のために）デカルト積を無効にします。
- `ASOF JOIN` および `LEFT ASOF JOIN`、正確な一致がないシーケンスを結合します。`ASOF JOIN` の使用法は以下で説明します。
- `PASTE JOIN`、2 つのテーブルの水平結合を行います。

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm) が `partial_merge` に設定されている場合、`RIGHT JOIN` および `FULL JOIN` は `ALL` 厳密さでのみサポートされます（`SEMI`、`ANTI`、`ANY`、および `ASOF` はサポートされません）。
:::

## 設定 {#settings}

デフォルトの結合タイプは、[join_default_strictness](../../../operations/settings/settings.md#join_default_strictness) 設定を使用して上書きできます。

`ANY JOIN` 操作に対する ClickHouse サーバーの動作は、[any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 設定に依存します。

**関連項目**

- [join_algorithm](../../../operations/settings/settings.md#join_algorithm)
- [join_any_take_last_row](../../../operations/settings/settings.md#join_any_take_last_row)
- [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)
- [partial_merge_join_optimizations](../../../operations/settings/settings.md#partial_merge_join_optimizations)
- [partial_merge_join_rows_in_right_blocks](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [join_on_disk_max_files_to_merge](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [any_join_distinct_right_table_keys](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite` 設定を使用して、ClickHouse が `CROSS JOIN` を `INNER JOIN` に書き換えることに失敗した場合の動作を定義します。デフォルト値は `1` で、結合は継続されますが、遅くなります。`cross_to_inner_join_rewrite` を `0` に設定するとエラーがスローされ、`2` に設定するとクロス結合を実行せずにすべてのカンマ/クロス結合の強制的な書き換えが実行されます。値が `2` の場合に書き換えが失敗すると、「`WHERE` セクションを簡素化してください」と表示されるエラーメッセージが表示されます。

## ON セクションの条件 {#on-section-conditions}

`ON` セクションには、`AND` および `OR` 演算子を使用して結合された複数の条件を含めることができます。結合キーを指定する条件は、左テーブルと右テーブルの両方を参照し、等号演算子を使用する必要があります。他の条件は、他の論理演算子を使用することができますが、クエリの左または右テーブルのいずれかを参照する必要があります。

全体の複雑な条件が満たされると、行が結合されます。条件が満たされない場合でも、`JOIN` タイプによっては結果に行が含まれる場合があります。`WHERE` セクションに同じ条件が置かれていて、それが満たされない場合、行は常に結果からフィルタされることに注意してください。

`ON` 句内の `OR` 演算子は、ハッシュ結合アルゴリズムを使用して機能します。各 `JOIN` のための `OR` 引数ごとに、別のハッシュ テーブルが作成されるため、`ON` 句の `OR` の式の数が増えるにつれて、メモリ消費量とクエリ実行時間が線形に増加します。

:::note
条件が異なるテーブルのカラムを参照している場合、今のところ支持されているのは等号演算子 (`=`) のみです。
:::

**例**

`table_1` と `table_2` を考えてみます。

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

1 つの結合キー条件と `table_2` に追加条件を含むクエリ：

``` sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には、名前が `C` でテキストカラムが空である行が含まれていることに注意してください。これは `OUTER` タイプの結合が使用されているためです。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

`INNER` タイプの結合と複数の条件を含むクエリ：

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
`INNER` タイプの結合と `OR` 条件を含むクエリ：

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

`OR` と `AND` の条件を含む `INNER` タイプの結合を含むクエリ：

:::note

デフォルトでは、異等条件は、同じテーブルのカラムを使用する限りサポートされています。
たとえば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c` は、`t1.b > 0` が `t1` のカラムのみを使用し、`t2.b > t2.c` が `t2` のカラムのみを使用するためです。
ただし、`t1.a = t2.key AND t1.b > t2.key` のような条件の実験的なサポートを試みることができます。詳細については、以下のセクションを参照してください。

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

## 異なるテーブルのカラムに対する不等条件のある結合 {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse は現在、等号条件に加えて `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` を不等条件と共にサポートしています。不等条件は `hash` および `grace_hash` 結合アルゴリズムにのみサポートされます。不等条件は `join_use_nulls` ではサポートされていません。

**例**

テーブル `t1`：

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

テーブル `t2`：

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

## JOIN キーにおける NULL 値 {#null-values-in-join-keys}

NULL は、任意の値には等しくなく、自身も含まれます。つまり、あるテーブルに結合キーが NULL の場合、他のテーブルの NULL 値と一致しなくなります。

**例**

テーブル `A`：

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

テーブル `B`：

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

テーブル `A` の `Charlie` の行とテーブル `B` のスコア 88 の行が結果に含まれていないことに注意してください。これは、結合キーに NULL 値があるためです。

NULL 値を一致させたい場合は、`isNotDistinctFrom` 関数を使用して結合キーを比較します。

```sql
SELECT A.name, B.score FROM A LEFT JOIN B ON isNotDistinctFrom(A.id, B.id)
```

```response
┌─name────┬─score─┐
│ Alice   │    90 │
│ Bob     │     0 │
│ Charlie │    88 │
└─────────┴───────┘
```

## ASOF JOIN の使用 {#asof-join-usage}

`ASOF JOIN` は、正確な一致がないレコードを結合する必要があるときに便利です。

アルゴリズムは、テーブル内の特別なカラムを必要とします。このカラム：

- 順序付きのシーケンスを含む必要がある。
- 次のいずれかの型である必要があります: [Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash` 結合アルゴリズムでは、`JOIN` 句の唯一のカラムにはできません。

`ASOF JOIN ... ON` の構文：

``` sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

任意の数の等号条件と、正確に 1 つの最も近い一致条件を使用できます。たとえば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t` のように記述できます。

最も近い一致に対してサポートされている条件: `>`、`>=`、`<`、`<=`。

`ASOF JOIN ... USING` の構文：

``` sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` は `equi_columnX` を等号での結合に使用し、`asof_column` を最も近い一致に対する結合に使用します。この場合、`table_1.asof_column >= table_2.asof_column` の条件が適用されます。`asof_column` は `USING` 句の最も後ろのカラムです。

例えば、次のようなテーブルを考えます：

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN` は `table_1` のユーザーイベントのタイムスタンプを取得し、`table_1` からのイベントのタイムスタンプと最も近いイベントを `table_2` から見つけます。等しいタイムスタンプの値が利用可能な場合は、最も近いものと見なされます。ここで、`user_id` 列は等号での結合に使用され、`ev_time` 列は最も近い一致での結合に使用できます。この例では、`event_1_1` は `event_2_1` と結合され、`event_1_2` は `event_2_3` と結合できますが、`event_2_2` は結合できません。

:::note
`ASOF JOIN` は `hash` および `full_sorting_merge` 結合アルゴリズムでのみサポートされています。
[Join](../../../engines/table-engines/special/join.md) テーブルエンジンでは **サポートされていません**。
:::

## PASTE JOIN の使用 {#paste-join-usage}

`PASTE JOIN` の結果は、左側のサブクエリからのすべての列の後に、右側のサブクエリからのすべての列を含むテーブルです。
行は元のテーブルでの位置に基づいてマッチします（行の順序が定義されている必要があります）。
サブクエリが異なる数の行を返す場合、余分な行はカットされます。

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
注意: この場合、読み取りが並列で行われると結果は不確定になる可能性があります。例：
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

## 分散 JOIN {#distributed-join}

分散テーブルに関連する結合を実行する方法は 2 つあります。

- 通常の `JOIN` を使用する場合、クエリはリモート サーバーに送信されます。サブクエリは右テーブルを作成するためにその各サーバーで実行され、結合はこのテーブルと行われます。言い換えれば、右テーブルは各サーバーで個別に形成されます。
- `GLOBAL ... JOIN` を使用する場合、最初に請求サーバーがサブクエリを実行して右テーブルを計算します。この一時テーブルは各リモート サーバーに渡され、一時的なデータを使用してそれらでクエリが実行されます。

`GLOBAL` を使用する際には注意してください。詳細については、[分散サブクエリ](../../../sql-reference/operators/in.md#select-distributed-subqueries) セクションを参照してください。

## 暗黙型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および `FULL JOIN` クエリは、「結合キー」に対する暗黙の型変換をサポートしています。ただし、左と右のテーブルの結合キーが単一の型に変換できない場合（たとえば、`UInt64` と `Int64`、または `String` と `Int32` の両方の値を保持できるデータ型がないなど）、クエリは実行できません。

**例**

テーブル `t_1` を考えます：
```response
┌─a─┬─b─┬─toTypeName(a)─┬─toTypeName(b)─┐
│ 1 │ 1 │ UInt16        │ UInt8         │
│ 2 │ 2 │ UInt16        │ UInt8         │
└───┴───┴───────────────┴───────────────┘
```
およびテーブル `t_2`：
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

## 使用に関する推奨事項 {#usage-recommendations}

### 空または NULL のセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合する際に、空のセルが出現することがあります。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) 設定は、ClickHouse がこれらのセルをどう埋めるかを定義します。

`JOIN` キーが [Nullable](../../../sql-reference/data-types/nullable.md) フィールドの場合、キーのいずれかが [NULL](../../../sql-reference/syntax.md#null-literal) の値を持つ行は結合されません。

### 構文 {#syntax}

`USING` で指定されたカラムは、両方のサブクエリで同じ名前である必要があり、他のカラムは異なる名前である必要があります。別名を使用してサブクエリ内のカラム名を変更できます。

`USING` 句は、結合する 1 つ以上の列を指定し、これらの列の等号を確立します。列のリストは括弧なしで記載されます。より複雑な結合条件はサポートされていません。

### 構文の制限 {#syntax-limitations}

単一の `SELECT` クエリ内で複数の `JOIN` 句の場合：

- すべての列を `*` で取得することは、テーブルが結合されている場合にのみ利用可能であり、サブクエリには利用できません。
- `PREWHERE` 句は利用できません。
- `USING` 句は利用できません。

`ON`、`WHERE`、および `GROUP BY` 句の場合：

- 任意の式は `ON`、`WHERE`、および `GROUP BY` 句で使用できませんが、`SELECT` 句で式を定義し、これらの句で別名を介して使用できます。

### パフォーマンス {#performance}

`JOIN` を実行する際、他のクエリ段階に対する実行順序の最適化は行われません。結合（右テーブル内の検索）は、`WHERE` でのフィルタリングより前に、集約の前に実行されます。

同じ `JOIN` でクエリを実行するたびに、結果がキャッシュされないため、サブクエリは再実行されます。これを避けるには、常に RAM にある結合用の準備された配列である特別な [Join](../../../engines/table-engines/special/join.md) テーブルエンジンを使用してください。

場合によっては、`JOIN` の代わりに [IN](../../../sql-reference/operators/in.md) を使用する方が効率的です。

次元テーブル（広告キャンペーンの名前など、次元プロパティを含む比較的小さなテーブル）と結合するために `JOIN` が必要な場合、右テーブルが各クエリのたびに再アクセスされるため、`JOIN` はそれほど便利ではないかもしれません。このような場合、`JOIN` の代わりに「辞書」機能を使用する必要があります。詳細については、[辞書](../../../sql-reference/dictionaries/index.md) セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトで、ClickHouse は [ハッシュ結合](https://en.wikipedia.org/wiki/Hash_join) アルゴリズムを使用します。ClickHouse は右テーブルを取り、それに対するハッシュ テーブルを RAM に作成します。`join_algorithm = 'auto'` が有効な場合、メモリ消費のしきい値を超えた後、ClickHouse は [マージ](https://en.wikipedia.org/wiki/Sort-merge_join) 結合アルゴリズムにフォールバックします。`JOIN` アルゴリズムの説明については、[join_algorithm](../../../operations/settings/settings.md#join_algorithm) 設定を参照してください。

`JOIN` 操作のメモリ消費を制限する必要がある場合、以下の設定を使用してください。

- [max_rows_in_join](../../../operations/settings/query-complexity.md#settings-max_rows_in_join) — ハッシュ テーブル内の行数を制限します。
- [max_bytes_in_join](../../../operations/settings/query-complexity.md#settings-max_bytes_in_join) — ハッシュ テーブルのサイズを制限します。

これらのいずれかの制限に達すると、ClickHouse は [join_overflow_mode](../../../operations/settings/query-complexity.md#settings-join_overflow_mode) 設定が指示するように動作します。

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
