---
description: 'JOIN句に関するリファレンス'
sidebar_label: 'JOIN'
slug: /sql-reference/statements/select/join
title: 'JOIN句'
keywords: ['INNER JOIN', 'LEFT JOIN', 'LEFT OUTER JOIN', 'RIGHT JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT SEMI JOIN', 'RIGHT SEMI JOIN', 'LEFT ANTI JOIN', 'RIGHT ANTI JOIN', 'LEFT ANY JOIN', 'RIGHT ANY JOIN', 'INNER ANY JOIN', 'ASOF JOIN', 'LEFT ASOF JOIN', 'PASTE JOIN']
doc_type: 'reference'
---



# JOIN 句 {#join-clause}

`JOIN` 句は、各テーブルに共通する値を用いて 1 つ以上のテーブルの列を結合し、新しいテーブルを生成します。これは SQL をサポートするデータベースで一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)における join に相当します。単一のテーブル内での結合という特殊なケースは、しばしば「自己結合 (self-join)」と呼ばれます。

**構文**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON` 句の式および `USING` 句の列は「結合キー」と呼ばれます。特に断りがない限り、`JOIN` は一致する「結合キー」を持つ行から [デカルト積](https://en.wikipedia.org/wiki/Cartesian_product) を生成し、その結果、元のテーブルよりもはるかに多くの行を含むことがあります。


## サポートされている JOIN の種類 {#supported-types-of-join}

すべての標準的な [SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL)) タイプがサポートされています:

| Type              | Description                                                                   |
|-------------------|-------------------------------------------------------------------------------|
| `INNER JOIN`      | 一致する行のみが返されます。                                                |
| `LEFT OUTER JOIN` | 一致する行に加えて、左側のテーブルの一致しない行も返されます。             |
| `RIGHT OUTER JOIN`| 一致する行に加えて、右側のテーブルの一致しない行も返されます。            |
| `FULL OUTER JOIN` | 一致する行に加えて、両方のテーブルの一致しない行も返されます。            |
| `CROSS JOIN`      | テーブル全体のデカルト積を生成します。「join keys」は指定**しません**。   |

- 種類を指定しない `JOIN` は `INNER` を意味します。
- キーワード `OUTER` は省略しても問題ありません。
- `CROSS JOIN` の代替構文として、複数のテーブルをカンマ区切りで [`FROM` 句](../../../sql-reference/statements/select/from.md) に指定する方法があります。

ClickHouse では、追加で次の JOIN タイプも利用できます:

| Type                                        | Description                                                                                                                               |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | デカルト積を生成せずに、「join keys」に対する許可リストとして機能します。                                                                |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | デカルト積を生成せずに、「join keys」に対する拒否リストとして機能します。                                                                |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 標準的な `JOIN` タイプにおいて、`LEFT` と `RIGHT` の反対側に対しては部分的に、`INNER` と `FULL` に対しては完全に、デカルト積を無効化します。 |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 完全一致ではない条件でシーケンス同士を結合します。`ASOF JOIN` の使用方法は後述します。                                                   |
| `PASTE JOIN`                                | 2 つのテーブルを水平方向に連結します。                                                                                                   |

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm) が `partial_merge` に設定されている場合、`RIGHT JOIN` および `FULL JOIN` は `ALL` ストリクト性の場合にのみサポートされます（`SEMI`、`ANTI`、`ANY`、`ASOF` はサポートされません）。
:::



## 設定 {#settings}

デフォルトの結合種別は、[`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness) 設定で上書きできます。

`ANY JOIN` 演算に対する ClickHouse サーバーの動作は、[`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys) 設定に依存します。

**関連項目**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

ClickHouse が `CROSS JOIN` を `INNER JOIN` に書き換えられなかった場合の動作を指定するには、`cross_to_inner_join_rewrite` 設定を使用します。デフォルト値は `1` であり、この場合は結合を継続しますが、処理は遅くなります。エラーをスローしたい場合は `cross_to_inner_join_rewrite` を `0` に設定し、カンマ結合/クロス結合を実行せず、すべてのカンマ/クロス結合の書き換えを強制したい場合は `2` に設定します。値が `2` のときに書き換えが失敗すると、"Please, try to simplify `WHERE` section" というエラーメッセージが返されます。



## ON 句の条件 {#on-section-conditions}

`ON` 句には、`AND` や `OR` 演算子を使って組み合わせた複数の条件を含めることができます。結合キーを指定する条件は、次を満たす必要があります。

* 結合の左側および右側、両方のテーブルを参照すること
* 等値演算子を使用すること

その他の条件では他の論理演算子を使用できますが、クエリの左側または右側のいずれか一方のテーブルを参照していなければなりません。

複合条件全体が満たされた場合に行が結合されます。条件が満たされない場合でも、`JOIN` の種類によっては行が結果に含まれることがあります。同じ条件を `WHERE` 句に記述していて、それらが満たされない場合には、行は常に結果から除外される点に注意してください。

`ON` 句内の `OR` 演算子はハッシュ結合アルゴリズムで動作します。すなわち、`JOIN` の結合キーを含む各 `OR` 引数ごとに別々のハッシュテーブルが作成されるため、`ON` 句内の `OR` 式の数が増加すると、それに比例してメモリ消費量とクエリの実行時間が線形に増加します。

:::note
条件が異なるテーブルの列を参照している場合、現時点では等値演算子（`=`）のみがサポートされています。
:::

**例**

`table_1` と `table_2` を考えます。

```response
┌─Id─┬─name─┐     ┌─Id─┬─text───────────┬─scores─┐
│  1 │ A    │     │  1 │ Text A         │     10 │
│  2 │ B    │     │  1 │ Another text A │     12 │
│  3 │ C    │     │  2 │ Text B         │     15 │
└────┴──────┘     └────┴────────────────┴────────┘
```

結合キー 1 つと `table_2` に対する追加条件を指定したクエリ:

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には、名前が `C` の行と、空の text 列が含まれていることに注意してください。これは、結合に `OUTER` 型が使用されているために含まれています。

```response
┌─name─┬─text───┐
│ A    │ テキスト A │
│ B    │ テキスト B │
│ C    │        │
└──────┴────────┘
```

`INNER` 結合と複数条件を使用したクエリ:

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

`INNER` 型の結合と `OR` 条件を用いたクエリ:

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

`INNER` 結合と `OR` および `AND` 条件を含むクエリ:

:::note


デフォルトでは、同じテーブルの列を使用している限り、非等価条件もサポートされます。
たとえば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c` のような条件は有効です。これは、`t1.b > 0` が `t1` の列のみを使用し、`t2.b > t2.c` が `t2` の列のみを使用しているためです。
ただし、`t1.a = t2.key AND t1.b > t2.key` のような条件に対する実験的サポートを有効化して試すこともできます。詳細については、以下のセクションを参照してください。

:::

```sql
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


## 異なるテーブルの列に対する不等号条件を用いた JOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

ClickHouse は現在、等価条件に加えて、不等号条件を指定した `ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN` をサポートしています。不等号条件は、`hash` および `grace_hash` の JOIN アルゴリズムでのみ利用できます。不等号条件は `join_use_nulls` ではサポートされません。

**例**

テーブル `t1`:

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

テーブル `t2`

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


## JOINキーにおけるNULL値 {#null-values-in-join-keys}

`NULL` は、自分自身を含めてどの値とも等しくありません。これは、あるテーブルの `JOIN` キーに `NULL` 値がある場合、他のテーブルの `NULL` 値とは一致しないことを意味します。

**例**

テーブル `A`:

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

テーブル `A` の `Charlie` の行と、テーブル `B` のスコア 88 の行は、`JOIN` キーに `NULL` 値が含まれているため、結果に含まれていないことに注意してください。

`NULL` 値もマッチさせたい場合は、`JOIN` キーを比較するために `isNotDistinctFrom` 関数を使用してください。

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


## ASOF JOIN の使用方法 {#asof-join-usage}

`ASOF JOIN` は、完全一致するレコードが存在しないデータ同士を結合する必要がある場合に有用です。

この JOIN アルゴリズムでは、テーブル内に専用の列が必要です。この列は次の条件を満たす必要があります。

* 値が順序付けられたシーケンスになっていなければなりません。
* 次のいずれかの型である必要があります: [Int, UInt](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md), [Date](../../../sql-reference/data-types/date.md), [DateTime](../../../sql-reference/data-types/datetime.md), [Decimal](../../../sql-reference/data-types/decimal.md)。
* `hash` JOIN アルゴリズムの場合、この列を `JOIN` 句の唯一の列として指定することはできません。

構文 `ASOF JOIN ... ON`:

```sql
SELECT 式リスト
FROM table_1
ASOF LEFT JOIN table_2
ON 等価条件 AND 最近接マッチ条件
```

任意の数の等価条件と、最も近い一致条件を1つだけ使用できます。たとえば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t` のようになります。

最も近い一致条件でサポートされる演算子: `>`, `>=`, `<`, `<=`。

構文 `ASOF JOIN ... USING`:

```sql
SELECT 式リスト
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN` は、等値結合に `equi_columnX` を使用し、`table_1.asof_column >= table_2.asof_column` という条件で「最も近い値」に基づく結合に `asof_column` を使用します。`asof_column` 列は常に `USING` 句の最後に記述されます。

例えば、次のテーブルを考えてみます。

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

`ASOF JOIN` は、`table_1` のユーザーイベントのタイムスタンプを基準に、対応する最も近い一致条件に従って、そのタイムスタンプに最も近いタイムスタンプを持つ `table_2` 内のイベントを検索できます。等しいタイムスタンプ値が存在する場合は、それが最も近いものとみなされます。ここでは、`user_id` 列を等価結合に、`ev_time` 列を最も近い一致で結合するために使用できます。この例では、`event_1_1` は `event_2_1` と結合でき、`event_1_2` は `event_2_3` と結合できますが、`event_2_2` は結合できません。

:::note
`ASOF JOIN` は `hash` および `full_sorting_merge` の結合アルゴリズムでのみサポートされています。
[Join](../../../engines/table-engines/special/join.md) テーブルエンジンでは**サポートされていません**。
:::


## PASTE JOIN の使用方法 {#paste-join-usage}

`PASTE JOIN` の結果は、左側のサブクエリのすべてのカラムに続いて、右側のサブクエリのすべてのカラムを含むテーブルになります。
行は、元のテーブルにおける位置に基づいて対応付けられます（行の順序が定義されている必要があります）。
サブクエリが返す行数が異なる場合、余分な行は切り捨てられます。

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

注意：この場合、読み取りが並列に行われると結果が非決定的になる可能性があります。たとえば、

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

分散テーブルが関わる JOIN を実行する方法は 2 つあります。

- 通常の `JOIN` を使用する場合、クエリはリモートサーバーに送信されます。右側のテーブルを作成するために、各サーバーでサブクエリが実行され、そのテーブルを用いて JOIN が実行されます。言い換えると、右側のテーブルは各サーバー上で個別に構築されます。
- `GLOBAL ... JOIN` を使用する場合、まずリクエスト元のサーバーがサブクエリを実行して右側のテーブルを計算します。この一時テーブルは各リモートサーバーに渡され、転送された一時データを使用してクエリが実行されます。

`GLOBAL` を使用する際は注意してください。詳細については、[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries) セクションを参照してください。



## 暗黙の型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、`FULL JOIN` の各クエリでは、「結合キー」に対する暗黙の型変換がサポートされています。ただし、左側と右側のテーブルの結合キーを単一の型に変換できない場合は、クエリを実行できません（たとえば、`UInt64` と `Int64`、あるいは `String` と `Int32` の両方の値をすべて保持できるデータ型が存在しない場合など）。

**例**

次のテーブル `t_1` があるとします:

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

次の集合を返します：

```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```


## 使用上の推奨事項 {#usage-recommendations}

### 空セルまたは NULL セルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合していると、空のセルが現れることがあります。設定 [join_use_nulls](../../../operations/settings/settings.md#join_use_nulls) は、ClickHouse がこれらのセルをどのように埋めるかを指定します。

`JOIN` キーが [Nullable](../../../sql-reference/data-types/nullable.md) フィールドの場合、少なくとも 1 つのキーが [NULL](/sql-reference/syntax#null) 値を持つ行は結合されません。

### 構文 {#syntax}

`USING` で指定するカラムは、両方のサブクエリで同じ名前でなければなりません。それ以外のカラムは異なる名前である必要があります。サブクエリ内のカラム名を変更するには、エイリアスを使用できます。

`USING` 句では、結合に使用する 1 つ以上のカラムを指定し、これらのカラムが等しいことを定義します。カラムのリストはかっこなしで指定します。より複雑な結合条件はサポートされていません。

### 構文上の制限 {#syntax-limitations}

1 つの `SELECT` クエリ内に複数の `JOIN` 句がある場合:

- `*` による全カラムの取得は、サブクエリではなくテーブルを結合している場合にのみ利用できます。
- `PREWHERE` 句は使用できません。
- `USING` 句は使用できません。

`ON`、`WHERE`、`GROUP BY` 句について:

- `ON`、`WHERE`、`GROUP BY` 句では任意の式は使用できませんが、`SELECT` 句で式を定義し、そのエイリアスを介してこれらの句で使用できます。

### パフォーマンス {#performance}

`JOIN` を実行する際、クエリの他のステージに対する実行順序の最適化は行われません。結合 (右側テーブルの検索) は、`WHERE` によるフィルタリングおよび集約の前に実行されます。

同じ `JOIN` を含むクエリを実行するたびに、結果がキャッシュされないためサブクエリは毎回再実行されます。これを避けるには、結合のために準備され、常に RAM 上に常駐している配列である特別な [Join](../../../engines/table-engines/special/join.md) テーブルエンジンを使用します。

場合によっては、`JOIN` の代わりに [IN](../../../sql-reference/operators/in.md) を使用した方が効率的です。

ディメンションテーブルとの結合 (広告キャンペーン名などのディメンション属性を含む、比較的小さなテーブル) に `JOIN` が必要な場合、右側テーブルがクエリごとに再アクセスされるため、`JOIN` はあまり便利ではない可能性があります。そのようなケースでは、`JOIN` の代わりに使用すべき「dictionaries」機能があります。詳細については、[Dictionaries](../../../sql-reference/dictionaries/index.md) セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouse は [hash join](https://en.wikipedia.org/wiki/Hash_join) アルゴリズムを使用します。ClickHouse は `right_table` を取り出し、RAM 上にそのハッシュテーブルを作成します。`join_algorithm = 'auto'` が有効な場合、メモリ消費があるしきい値を超えると、ClickHouse は [merge](https://en.wikipedia.org/wiki/Sort-merge_join) 結合アルゴリズムにフォールバックします。`JOIN` アルゴリズムの説明については、[join_algorithm](../../../operations/settings/settings.md#join_algorithm) 設定を参照してください。

`JOIN` 操作のメモリ消費を制限する必要がある場合は、次の設定を使用します:

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ハッシュテーブル内の行数を制限します。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ハッシュテーブルのサイズを制限します。

これらのいずれかの制限に達した場合、ClickHouse は [join_overflow_mode](/operations/settings/settings#join_overflow_mode) 設定の指示どおりに動作します。



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

- Blog: [ClickHouse: 非常に高速な DBMS による完全な SQL JOIN サポート - パート 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- Blog: [ClickHouse: 非常に高速な DBMS による完全な SQL JOIN サポート - 内部の仕組み - パート 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- Blog: [ClickHouse: 非常に高速な DBMS による完全な SQL JOIN サポート - 内部の仕組み - パート 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- Blog: [ClickHouse: 非常に高速な DBMS による完全な SQL JOIN サポート - 内部の仕組み - パート 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)
