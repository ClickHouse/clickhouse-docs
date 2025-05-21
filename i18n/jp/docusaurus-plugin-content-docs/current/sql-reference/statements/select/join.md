---
description: 'JOIN句のドキュメンテーション'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'JOIN句'
---


# JOIN句

`JOIN`句は、1つまたは複数のテーブルのカラムを組み合わせて新しいテーブルを生成します。この処理は、各テーブルで共通の値を使用します。これはSQLサポートを持つデータベースにおける一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)の結合に対応します。1つのテーブルを結合する特別なケースは「自己結合」と呼ばれることがあります。

**構文**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON`句からの式および`USING`句からのカラムは「結合キー」と呼ばれます。特に記載がない限り、`JOIN`は「結合キー」が一致する行から[直積](https://en.wikipedia.org/wiki/Cartesian_product)を生成し、これにより元のテーブルよりも多くの行を生成することがあります。

## サポートされているJOINのタイプ {#supported-types-of-join}

すべての標準[SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL))のタイプがサポートされています：

| タイプ              | 説明                                                                          |
|-------------------|-------------------------------------------------------------------------------|
| `INNER JOIN`      | 一致する行のみが返されます。                                                   |
| `LEFT OUTER JOIN` | 左側のテーブルから一致しない行が返され、一致する行に追加されます。              |
| `RIGHT OUTER JOIN`| 右側のテーブルから一致しない行が返され、一致する行に追加されます。             |
| `FULL OUTER JOIN` | 両方のテーブルから一致しない行が返され、一致する行に追加されます。             |
| `CROSS JOIN`      | テーブル全体の直積を生成し、「結合キー」は**指定されません**。                     |

- タイプを指定しない`JOIN`は`INNER`を意味します。
- キーワード`OUTER`は安全に省略できます。
- `CROSS JOIN`の代替構文は、カンマで区切られた複数のテーブルを[`FROM`句](../../../sql-reference/statements/select/from.md)に指定することです。

ClickHouseで利用可能な追加の結合タイプは：

| タイプ                                        | 説明                                                                                                                                       |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | 「結合キー」に対する許可リストであり、直積を生成しません。                                                                                  |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | 「結合キー」に対する拒否リストであり、直積を生成しません。                                                                                  |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 標準の`JOIN`タイプに対して直積を部分的または完全に無効にします（`LEFT`と`RIGHT`の逆側のため、または`INNER`と`FULL`のため）。                 |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 正確でない一致でシーケンスを結合します。 `ASOF JOIN`の使用については以下で説明します。                                                      |
| `PASTE JOIN`                                | 2つのテーブルの水平連結を実行します。                                                                                                         |

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)が`partial_merge`に設定されている場合、`RIGHT JOIN`および`FULL JOIN`は`ALL`の厳密さでのみサポートされます（`SEMI`、`ANTI`、`ANY`、`ASOF`はサポートされていません）。
:::

## 設定 {#settings}

デフォルトの結合タイプは、[`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness)設定を使用して上書きできます。

`ANY JOIN`操作に対するClickHouseサーバーの動作は、[`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)設定に依存します。

**参照先**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite`設定を使用して、ClickHouseが`CROSS JOIN`を`INNER JOIN`として書き換えられない場合の動作を定義します。デフォルト値は`1`であり、結合を続行しますが、パフォーマンスは低下します。エラーを発生させたい場合は`cross_to_inner_join_rewrite`を`0`に設定し、すべてのカンマ/直積を強制的に書き換えるために`2`に設定します。値が`2`のときに書き換えが失敗した場合は、「`WHERE`セクションを単純化してください」とのエラーメッセージが表示されます。

## ONセクションの条件 {#on-section-conditions}

`ON`セクションは、`AND`および`OR`演算子を使用して結合された複数の条件を含むことができます。結合キーを指定する条件は以下を満たさなければなりません：
- 左側と右側のテーブルの両方を参照すること
- 等号演算子を使用すること

他の条件は、他の論理演算子を使うことができますが、クエリの左側または右側のテーブルのいずれかを参照する必要があります。

行は、全体の複雑な条件が満たされる場合に結合されます。条件が満たされない場合、`JOIN`タイプに応じて結果に行が含まれることがあります。同じ条件が`WHERE`セクションに配置され、条件が満たされない場合、行は結果から常にフィルタリングされます。

`ON`句内の`OR`演算子はハッシュ結合アルゴリズムを使用して機能します — 各`OR`引数に対して、結合キー用の別々のハッシュテーブルが作成されるため、メモリ消費量とクエリの実行時間は、`ON`句の`OR`式の数が増えるにつれて線形に増加します。

:::note
条件が異なるテーブルのカラムを参照する場合、等号演算子（`=`）のみがサポートされています。
:::

**例**

`table_1` と `table_2` を考えてみましょう：

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

1つの結合キー条件と`table_2`の追加条件を持つクエリ：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には、名前が`C`である行と空のテキスト列が含まれています。これは`OUTER`タイプの結合を使用しているためです。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

`INNER`タイプの結合と複数の条件を持つクエリ：

```sql
SELECT name, text, scores FROM table_1 INNER JOIN table_2
    ON table_1.Id = table_2.Id AND table_2.scores > 10 AND startsWith(table_2.text, 'Text');
```

結果：

```sql
┌─name─┬─text───┬─scores─┐
│ B    │ Text B │     15 │
└──────┴────────┴────────┘
```
`INNER`タイプの結合と`OR`を持つ条件のクエリ：

```sql
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

`INNER`タイプの結合と条件に`OR`と`AND`を持つクエリ：

:::note

デフォルトでは、非等式条件は同じテーブルのカラムを使う限りサポートされます。例えば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`など、`t1.b > 0`は`t1`からのカラムのみを使用し、`t2.b > t2.c`は`t2`からのカラムのみを使用します。しかし、`t1.a = t2.key AND t1.b > t2.key`のような条件のためのexperimental supportを試みることもできます。詳細は以下のセクションを確認してください。

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

## 異なるテーブルのカラムに対する不等条件のJOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouseは現在、`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`を不等条件に対してサポートしています。不等条件は、`hash`と`grace_hash`結合アルゴリズムでのみサポートされています。不等条件は、`join_use_nulls`の使用時にはサポートされていません。

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
SELECT t1.*, t2.* from t1 LEFT JOIN t2 ON t1.key = t2.key and (t1.a < t2.a) ORDER BY (t1.key, t1.attr, t2.key, t2.attr);
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

`NULL`はどの値とも等しくないため、NULL値を持つ`JOIN`キーが1つのテーブルにある場合、他のテーブルのNULL値と一致しません。

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

`A`テーブルの`Charlie`と`B`テーブルのスコア88の行が結果に含まれていないのは、`JOIN`キーのNULL値のためです。

NULL値を一致させたい場合は、`isNotDistinctFrom`関数を使用して`JOIN`キーを比較します。

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

`ASOF JOIN`は、正確に一致しないレコードを結合する必要がある場合に便利です。

このJOINアルゴリズムは、テーブルに特別なカラムを必要とします。このカラムは：

- 整列されたシーケンスを含む必要があります。
- 次のいずれかの型でなければなりません：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash`結合アルゴリズムの場合、`JOIN`句の唯一のカラムにすることはできません。

`ASOF JOIN ... ON`の構文：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

任意の数の等号条件と正確に1つの最も近い一致条件を使用できます。例えば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最も近い一致に対してサポートされている条件：`>`、`>=`、`<`、`<=`。

`ASOF JOIN ... USING`の構文：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`は、等しい条件での結合に`equi_columnX`を使用し、`table_1.asof_column >= table_2.asof_column`条件で最も近い一致で結合に`asof_column`を使用します。`asof_column`は常に`USING`句の最後のカラムです。

例えば、次のテーブルを考えてみましょう：

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN`は、`table_1`のユーザーイベントのタイムスタンプを取り、最も近い一致条件に基づいて`table_2`のイベントのタイムスタンプに最も近いイベントを見つけることができます。等しいタイムスタンプ値は、利用可能な場合には最も近いものと見なされます。ここで、`user_id`カラムは等号での結合に使用され、`ev_time`カラムは最も近い一致での結合に使用されます。本例では、`event_1_1`は`event_2_1`と結合され、`event_1_2`は`event_2_3`と結合されますが、`event_2_2`は結合されません。

:::note
`ASOF JOIN`は`hash`および`full_sorting_merge`結合アルゴリズムでのみサポートされています。
[Join](../../../engines/table-engines/special/join.md)テーブルエンジンでは**サポートされていません**。
:::

## PASTE JOINの使用法 {#paste-join-usage}

`PASTE JOIN`の結果は、左側のサブクエリからのすべてのカラムの後に右側のサブクエリからのすべてのカラムが続くテーブルです。
行は元のテーブル内での位置に基づいてマッチングされます（行の順序は定義されている必要があります）。
サブクエリが異なる行数を返す場合、追加の行は切り捨てられます。

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

注意：この場合、結果は並行して読み込むと非決定的になる可能性があります。例えば：

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

分散テーブルを含むJOINを実行する方法は2つあります：

- 通常の`JOIN`を使用すると、クエリがリモートサーバーに送信されます。サブクエリは、正しいテーブルを形成するためにそれぞれのサーバーで実行され、結合はこのテーブルで行われます。言い換えれば、正しいテーブルは各サーバーごとに別々に形成されます。
- `GLOBAL ... JOIN`を使用すると、最初にリクエスターサーバーがサブクエリを実行して正しいテーブルを計算します。この一時テーブルは各リモートサーバーに渡され、送信された一時データを使用してクエリが実行されます。

`GLOBAL`を使用する際は注意が必要です。詳細は[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries)のセクションを参照してください。

## 暗黙的型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および`FULL JOIN`クエリでは、「結合キー」に対する暗黙の型変換がサポートされています。ただし、左側と右側のテーブルからの結合キーを単一の型に変換できない場合（例えば、`UInt64`と`Int64`、または`String`と`Int32`のすべての値を保持できるデータ型が存在しない場合）、クエリは実行できません。

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

## 使用推奨事項 {#usage-recommendations}

### 空またはNULLセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合する際に、空のセルが現れることがあります。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)設定は、ClickHouseがどのようにこれらのセルを埋めるかを定義します。

`JOIN`キーが[Nullable](../../../sql-reference/data-types/nullable.md)フィールドである場合、少なくとも1つのキーが[NULL](/sql-reference/syntax#null)値を持つ行は結合されません。

### 構文 {#syntax}

`USING`に指定されたカラムは両方のサブクエリで同じ名前を持っている必要があり、他のカラムは異なる名前でなければなりません。サブクエリ内でカラム名を変更するにはエイリアスを使用できます。

`USING`句は、結合する1つ以上のカラムを指定し、これらのカラムの等価性を確立します。カラムのリストは括弧なしで設定されます。より複雑な結合条件はサポートされていません。

### 構文の制限 {#syntax-limitations}

単一の`SELECT`クエリ内の複数の`JOIN`句： 

- `*`経由で全カラムを取得することは、テーブルが結合されている場合にのみ利用可能であり、サブクエリには利用できません。
- `PREWHERE`句は利用できません。
- `USING`句は利用できません。

`ON`、`WHERE`、および`GROUP BY`句について：

- `ON`、`WHERE`、および`GROUP BY`句では任意の式を使用できませんが、`SELECT`句で式を定義し、その後エイリアスを介してこれらの句で使用できます。

### パフォーマンス {#performance}

`JOIN`を実行する際、他のクエリステージに対する実行順序の最適化はありません。結合（右側のテーブルの検索）は`WHERE`でのフィルタリングおよび集約の前に実行されます。

同じ`JOIN`でクエリを実行するたびに、サブクエリが再実行されます。結果はキャッシュされません。これを回避するために、常にRAM内に準備された結合用の配列である特別な[Join](../../../engines/table-engines/special/join.md)テーブルエンジンを使用してください。

場合によっては、`JOIN`の代わりに[IN](../../../sql-reference/operators/in.md)を使用する方が効率的です。

次元テーブルとの結合に`JOIN`を必要とする場合（これらは比較的小さなテーブルで、広告キャンペーンの名前などの次元プロパティを含むテーブル）、右側のテーブルがすべてのクエリに対して再アクセスされるため、`JOIN`は非常に便利でない可能性があります。そのため、このような場合には、`JOIN`の代わりに「辞書」機能を使用する必要があります。詳細は[辞書](../../../sql-reference/dictionaries/index.md)セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouseは[ハッシュ結合](https://en.wikipedia.org/wiki/Hash_join)アルゴリズムを使用します。ClickHouseは右側のテーブルを取り、そのためのハッシュテーブルをRAM内に作成します。`join_algorithm = 'auto'`が有効な場合、メモリ消費がしきい値に達すると、ClickHouseは[マージ](https://en.wikipedia.org/wiki/Sort-merge_join)結合アルゴリズムにフォールバックします。`JOIN`アルゴリズムの説明は[join_algorithm](../../../operations/settings/settings.md#join_algorithm)設定を参照してください。

`JOIN`操作のメモリ消費を制限するには、以下の設定を使用します：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ハッシュテーブル内の行数の制限。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ハッシュテーブルのサイズの制限。

これらの制限のいずれかが達成されると、ClickHouseは[join_overflow_mode](/operations/settings/settings.md#join_overflow_mode)設定に従って動作します。

## 例 {#examples}

例：

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

- ブログ：[ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Part 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- ブログ：[ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- ブログ：[ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- ブログ：[ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
