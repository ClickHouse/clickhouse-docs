---
'description': 'Documentation for JOIN Clause'
'sidebar_label': 'JOIN'
'slug': '/sql-reference/statements/select/join'
'title': 'JOIN Clause'
---





# JOIN句

`JOIN`句は、1つまたは複数のテーブルからのカラムを、各テーブルに共通する値を使用して結合することで新しいテーブルを生成します。これは、SQLをサポートするデータベースにおける一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)の結合に対応します。1つのテーブルの結合の特別なケースは「自己結合」と呼ばれます。

**構文**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON`句の式と`USING`句のカラムは「結合キー」と呼ばれます。特に明記されない限り、`JOIN`は「結合キー」が一致する行からの[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成し、結果はソーステーブルよりも行数が多くなる可能性があります。

## サポートされているJOINタイプ {#supported-types-of-join}

すべての標準[SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL))タイプがサポートされています：

| タイプ              | 説明                                                                    |
|-------------------|-------------------------------------------------------------------------|
| `INNER JOIN`      | 一致する行のみが返されます。                                          |
| `LEFT OUTER JOIN` | 一致する行に加えて、左テーブルからの非一致行も返されます。              |
| `RIGHT OUTER JOIN`| 一致する行に加えて、右テーブルからの非一致行も返されます。            |
| `FULL OUTER JOIN` | 一致する行に加えて、両方のテーブルからの非一致行も返されます。        |
| `CROSS JOIN`      | テーブル全体のデカルト積を生成し、「結合キー」は**指定されません**。 |

- タイプが指定されていない`JOIN`は`INNER`を意味します。
- キーワード`OUTER`は省略することができます。
- `CROSS JOIN`の代替構文は、[`FROM`句](../../../sql-reference/statements/select/from.md)にカンマで区切られた複数のテーブルを指定することです。

ClickHouseで利用可能な追加の結合タイプは次のとおりです：

| タイプ                                        | 説明                                                                                      |
|---------------------------------------------|------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | 「結合キー」に対する許可リストで、デカルト積を生成しません。                                            |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | 「結合キー」に対する拒否リストで、デカルト積を生成しません。                                            |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | 標準`JOIN`タイプに対して部分的（`LEFT`と`RIGHT`の逆）または完全（`INNER`と`FULL`）にデカルト積を無効化します。 |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 正確な一致がないシーケンスを結合します。`ASOF JOIN`の使用法については以下に説明します。                      |
| `PASTE JOIN`                                | 2つのテーブルの水平連結を行います。                                                        |

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)が`partial_merge`に設定されている場合、`RIGHT JOIN`および`FULL JOIN`は`ALL`の厳密さでのみサポートされています（`SEMI`、`ANTI`、`ANY`、および`ASOF`はサポートされていません）。
:::

## 設定 {#settings}

デフォルトの結合タイプは、[`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness)設定を使用してオーバーライドできます。

`ANY JOIN`操作に対するClickHouseサーバーの動作は、[`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)設定に依存します。

**参照**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite`設定を使用して、ClickHouseが`CROSS JOIN`を`INNER JOIN`として書き換えられなかった場合の動作を定義します。デフォルト値は`1`で、結合は続行されますが遅くなります。`cross_to_inner_join_rewrite`を`0`に設定するとエラーが発生し、`2`に設定するとすべてのカンマ/クロス結合の書き換えを強制します。値が`2`のときに書き換えが失敗した場合、「`WHERE`セクションを簡素化してください」とのエラーメッセージが表示されます。

## ONセクションの条件 {#on-section-conditions}

`ON`セクションには、`AND`および`OR`演算子を使用して結合された複数の条件を含めることができます。結合キーを指定する条件は以下を満たす必要があります：
- 左テーブルと右テーブルの両方を参照すること
- 等号演算子を使用すること

その他の条件は他の論理演算子を使用できますが、クエリの左テーブルまたは右テーブルのいずれかを参照する必要があります。

行は、全体の複雑な条件が満たされた場合に結合されます。条件が満たされない場合、行は`JOIN`タイプに応じて結果に含まれる可能性があります。`WHERE`セクションに同じ条件が配置され、それが満たされない場合、行は結果から常にフィルタリングされます。

`ON`句内の`OR`演算子はハッシュ結合アルゴリズムを使用して機能します。`JOIN`のために結合キーを持つ各`OR`引数のために、別のハッシュテーブルが作成されるため、メモリ消費量とクエリ実行時間は`ON`句の`OR`式の数が増えると線形に増加します。

:::note
異なるテーブルのカラムを参照する条件の場合、現在は等号演算子（`=`）のみがサポートされています。
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

1つの結合キー条件と`table_2`に対する追加条件を使用したクエリ：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果に`C`という名前の行と空のテキストカラムが含まれていることに注意してください。これは`OUTER`型の結合が使用されているため、結果に含まれています。

```response
┌─name─┬─text───┐
│ A    │ Text A │
│ B    │ Text B │
│ C    │        │
└──────┴────────┘
```

`INNER`型の結合と複数の条件を使用したクエリ：

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
`INNER`型の結合と`OR`条件を使用したクエリ：

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

`INNER`型の結合と`OR`および`AND`条件を持つクエリ：

:::note

デフォルトでは、非等価条件は同じテーブルからのカラムを使用する限りサポートされています。
例えば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`のように、`t1.b > 0`は`t1`のみのカラムを使用し、`t2.b > t2.c`は`t2`のみのカラムを使用しています。
しかし、`t1.a = t2.key AND t1.b > t2.key`のような条件の実験的なサポートを試すことができます。詳細については以下のセクションを確認してください。

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

## 異なるテーブルのカラムに対する不等式条件でのJOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

Clickhouseは、等価条件に加えて不等式条件を持つ`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`を現在サポートしています。不等式条件は`hash`および`grace_hash`結合アルゴリズムのみにサポートされます。不等式条件は`join_use_nulls`ではサポートされていません。

**例**

テーブル`t1`：

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


## JOINキーにおけるNULL値 {#null-values-in-join-keys}

`NULL`は、自己を含む任意の値と等しくありません。これは、あるテーブルの`JOIN`キーに`NULL`値が存在する場合、それは他のテーブルの`NULL`値と一致しないことを意味します。

**例**

テーブル`A`：

```response
┌───id─┬─name────┐
│    1 │ Alice   │
│    2 │ Bob     │
│ ᴺᵁᴸᴸ │ Charlie │
└──────┴─────────┘
```

テーブル`B`：

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

`A`テーブルの`Charlie`行と`B`テーブルのスコア88行が結果に含まれていないことに注意してください。これは`JOIN`キーに`NULL`値があるためです。

`NULL`値を一致させたい場合は、`isNotDistinctFrom`関数を使用して`JOIN`キーを比較します。

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

`ASOF JOIN`は、正確な一致がないレコードを結合する必要がある場合に役立ちます。

このJOINアルゴリズムでは、テーブルに特別なカラムが必要です。このカラムは：

- 順序付きのシーケンスを含む必要があります。
- 次のいずれかのタイプのいずれかである必要があります：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash`結合アルゴリズムの場合、`JOIN`句の唯一のカラムではないこと。

構文`ASOF JOIN ... ON`：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

等号条件を任意の数使用し、最も近い一致条件を1つだけ使用できます。例えば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`のように。

最も近い一致に対してサポートされている条件：`>`, `>=`, `<`, `<=`。

構文`ASOF JOIN ... USING`：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`は、`equi_columnX`を使用して等号に基づいて結合し、`asof_column`を使用して最も近い一致に基づいて`table_1.asof_column >= table_2.asof_column`条件で結合します。`USING`句の最後のカラムは常に`asof_column`です。

例えば、以下のテーブルを考えます：

         table_1                           table_2
      event   | ev_time | user_id       event   | ev_time | user_id
    ----------|---------|---------- ----------|---------|----------
                  ...                               ...
    event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
                  ...                 event_2_2 |  12:30  |   42
    event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
                  ...                               ...

`ASOF JOIN`は、`table_1`のユーザーイベントのタイムスタンプを取得し、最も近い一致条件に対応する`table_1`のイベントのタイムスタンプに最も近いイベントを`table_2`で見つけることができます。等しいタイムスタンプ値は、可能であれば最も近いとも見なされます。ここで、`user_id`カラムは等号に基づいて結合するために使用でき、`ev_time`カラムは最も近い一致で結合するために使用できます。この例では、`event_1_1`は`event_2_1`と結合され、`event_1_2`は`event_2_3`と結合されますが、`event_2_2`は結合できません。

:::note
`ASOF JOIN`は、`hash`および`full_sorting_merge`結合アルゴリズムによってのみサポートされています。
[Join](../../../engines/table-engines/special/join.md)テーブルエンジンではサポートされていません。
:::

## PASTE JOINの使用法 {#paste-join-usage}

`PASTE JOIN`の結果は、左のサブクエリからのすべてのカラムの後に右のサブクエリからのすべてのカラムを含むテーブルです。
行は元のテーブルでの位置に基づいて一致付けされます（行の順序は定義されるべきです）。
サブクエリが異なる行数を返す場合、余分な行は切り捨てられます。

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

注意：この場合、結果は読み取りが並列の場合、非決定的である可能性があります。例えば：

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

分散テーブルを含むJOINを実行するには、2つの方法があります：

- 通常の`JOIN`を使用する場合、クエリはリモートサーバーに送信されます。サブクエリは各サーバーで実行され、右テーブルが作成され、そのテーブルで結合が実行されます。言い換えれば、右テーブルは各サーバーで個別に形成されます。
- `GLOBAL ... JOIN`を使用する場合、リクエスタサーバーがサブクエリを実行して右テーブルを計算します。この一時テーブルは各リモートサーバーに渡され、一時データを使用してクエリが実行されます。

`GLOBAL`を使用する際は注意が必要です。詳細については、[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries)セクションを参照してください。

## 暗黙的型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および`FULL JOIN`クエリは「結合キー」用の暗黙的な型変換をサポートしています。ただし、左テーブルと右テーブルの結合キーが単一の型に変換できない場合、クエリは実行できません（例えば、`UInt64`と`Int64`、または`String`と`Int32`の両方の値を保持できるデータ型は存在しません）。

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

## 使用上の推奨事項 {#usage-recommendations}

### 空またはNULLセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合する際には、空のセルが出現することがあります。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)設定は、ClickHouseがこれらのセルをどのように埋めるかを定義します。

`JOIN`キーが[Nullable](../../../sql-reference/data-types/nullable.md)フィールドである場合、少なくとも1つのキーが[NULL](/sql-reference/syntax#null)値を持つ行は結合されません。

### 構文 {#syntax}

`USING`で指定されたカラムは、両方のサブクエリで同じ名前でなければならず、他のカラムは異なる名前でなければなりません。サブクエリ内でカラムの名前を変更するためにエイリアスを使用できます。

`USING`句は、等式を確立するカラムを1つ以上指定します。カラムのリストは括弧なしで設定されます。より複雑な結合条件はサポートされていません。

### 構文の制限 {#syntax-limitations}

単一の`SELECT`クエリ内で複数の`JOIN`句がある場合：

- すべてのカラムを`*`で取得するのは、テーブルが結合されている場合のみ可能で、サブクエリの場合は不可能です。
- `PREWHERE`句は使用できません。
- `USING`句は使用できません。

`ON`、`WHERE`、および`GROUP BY`句について：

- `ON`、`WHERE`、および`GROUP BY`句内で任意の式を使用することはできませんが、`SELECT`句内で式を定義し、その後、エイリアスを介してこれらの句で使用することができます。

### パフォーマンス {#performance}

`JOIN`を実行する際、クエリの他のステージに関する実行順序の最適化は行われません。結合（右テーブルの検索）は、`WHERE`でのフィルタリング前と集約前に実行されます。

同じ`JOIN`でクエリを実行するたびに、サブクエリが再実行されます。これは結果がキャッシュされないためです。これを避けるためには、常にRAM内に準備された結合用の配列である特別な[Join](../../../engines/table-engines/special/join.md)テーブルエンジンを使用することができます。

場合によっては、`JOIN`の代わりに[IN](../../../sql-reference/operators/in.md)を使用する方が効率的です。

次元テーブルとの結合にJOINが必要な場合（これは、広告キャンペーンの名前などの次元プロパティを含む比較的小さなテーブルです）、右テーブルが各クエリのために再アクセスされるため、JOINは非常に便利ではありません。そのような場合には、JOINの代わりに「辞書」機能を使用する必要があります。詳細については、[辞書](../../../sql-reference/dictionaries/index.md)セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouseは[ハッシュ結合](https://en.wikipedia.org/wiki/Hash_join)アルゴリズムを使用します。ClickHouseは右テーブルを取得し、RAM内にそのためのハッシュテーブルを作成します。`join_algorithm = 'auto'`が有効な場合、メモリ消費の閾値を超えると、ClickHouseは[マージ](https://en.wikipedia.org/wiki/Sort-merge_join)結合アルゴリズムにフォールバックします。`JOIN`アルゴリズムの説明については、[join_algorithm](../../../operations/settings/settings.md#join_algorithm)設定を参照してください。

`JOIN`操作のメモリ消費を制限する必要がある場合、次の設定を使用します：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ハッシュテーブルにおける行数の制限。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ハッシュテーブルのサイズの制限。

これらの制限のいずれかに達すると、ClickHouseは[join_overflow_mode](/operations/settings/settings.md#join_overflow_mode)設定に従って挙動します。

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

## 関連情報 {#related-content}

- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Part 1](https://clickhouse.com/blog/clickhouse-fully-supports-joins)
- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 2](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)
- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 3](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3)
- ブログ: [ClickHouse: A Blazingly Fast DBMS with Full SQL Join Support - Under the Hood - Part 4](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4)