---
'description': 'JOIN 句に関するドキュメント'
'sidebar_label': 'JOIN'
'slug': '/sql-reference/statements/select/join'
'title': 'JOIN 句'
'keywords':
- 'INNER JOIN'
- 'LEFT JOIN'
- 'LEFT OUTER JOIN'
- 'RIGHT JOIN'
- 'RIGHT OUTER JOIN'
- 'FULL OUTER JOIN'
- 'CROSS JOIN'
- 'LEFT SEMI JOIN'
- 'RIGHT SEMI JOIN'
- 'LEFT ANTI JOIN'
- 'RIGHT ANTI JOIN'
- 'LEFT ANY JOIN'
- 'RIGHT ANY JOIN'
- 'INNER ANY JOIN'
- 'ASOF JOIN'
- 'LEFT ASOF JOIN'
- 'PASTE JOIN'
'doc_type': 'reference'
---



# JOIN句

`JOIN`句は、共通の値を使用して、1つまたは複数のテーブルからのカラムを結合することによって新しいテーブルを生成します。これは、SQLサポートを持つデータベースで一般的な操作であり、[関係代数](https://en.wikipedia.org/wiki/Relational_algebra#Joins_and_join-like_operators)の結合に相当します。1つのテーブルの結合の特別なケースは、しばしば「自己結合」と呼ばれます。

**構文**

```sql
SELECT <expr_list>
FROM <left_table>
[GLOBAL] [INNER|LEFT|RIGHT|FULL|CROSS] [OUTER|SEMI|ANTI|ANY|ALL|ASOF] JOIN <right_table>
(ON <expr_list>)|(USING <column_list>) ...
```

`ON`句からの式と`USING`句からのカラムは「結合キー」と呼ばれます。特に記載されていない限り、`JOIN`は一致する「結合キー」を持つ行からの[デカルト積](https://en.wikipedia.org/wiki/Cartesian_product)を生成し、これによりソーステーブルよりも多くの行を持つ結果が生成される可能性があります。

## サポートされているJOINタイプ {#supported-types-of-join}

すべての標準[SQL JOIN](https://en.wikipedia.org/wiki/Join_(SQL))タイプがサポートされています。

| タイプ                  | 説明                                                                       |
|-----------------------|----------------------------------------------------------------------------|
| `INNER JOIN`          | 一致する行のみが返されます。                                               |
| `LEFT OUTER JOIN`     | 一致する行に加えて、左のテーブルからの一致しない行も返されます。            |
| `RIGHT OUTER JOIN`    | 一致する行に加えて、右のテーブルからの一致しない行も返されます。            |
| `FULL OUTER JOIN`     | 一致する行に加えて、両方のテーブルからの一致しない行も返されます。          |
| `CROSS JOIN`          | テーブル全体のデカルト積を生成し、「結合キー」は**指定されません**。        |

- タイプが指定されていない`JOIN`は`INNER`を意味します。
- キーワード`OUTER`は安全に省略できます。
- `CROSS JOIN`の代替構文は、カンマで区切られた複数のテーブルを[`FROM`句](../../../sql-reference/statements/select/from.md)に指定することです。

ClickHouseで利用可能な追加の結合タイプは次の通りです：

| タイプ                                        | 説明                                                                                                                                     |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `LEFT SEMI JOIN`, `RIGHT SEMI JOIN`         | 「結合キー」における許可リスト、デカルト積を生成しません。                                                                                |
| `LEFT ANTI JOIN`, `RIGHT ANTI JOIN`         | 「結合キー」における拒否リスト、デカルト積を生成しません。                                                                                |
| `LEFT ANY JOIN`, `RIGHT ANY JOIN`, `INNER ANY JOIN` | パーシャル（`LEFT`と`RIGHT`の対向側用）または完全（`INNER`と`FULL`用）にデカルト積を無効にします。                                             |
| `ASOF JOIN`, `LEFT ASOF JOIN`               | 非正確な一致でシーケンスを結合します。`ASOF JOIN`の使用法は以下で説明します。                                                         |
| `PASTE JOIN`                                | 2つのテーブルの水平連結を行います。                                                                                                       |

:::note
[join_algorithm](../../../operations/settings/settings.md#join_algorithm)が`partial_merge`に設定されている場合、`RIGHT JOIN`及び`FULL JOIN`は`ALL`の厳密性でのみサポートされます（`SEMI`, `ANTI`, `ANY`, `ASOF`はサポートされていません）。
:::

## 設定 {#settings}

デフォルトの結合タイプは、[`join_default_strictness`](../../../operations/settings/settings.md#join_default_strictness)設定を使用してオーバーライドできます。

`ANY JOIN`操作に対するClickHouseサーバーの動作は、[`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)設定に依存します。

**参照：**

- [`join_algorithm`](../../../operations/settings/settings.md#join_algorithm)
- [`join_any_take_last_row`](../../../operations/settings/settings.md#join_any_take_last_row)
- [`join_use_nulls`](../../../operations/settings/settings.md#join_use_nulls)
- [`partial_merge_join_rows_in_right_blocks`](../../../operations/settings/settings.md#partial_merge_join_rows_in_right_blocks)
- [`join_on_disk_max_files_to_merge`](../../../operations/settings/settings.md#join_on_disk_max_files_to_merge)
- [`any_join_distinct_right_table_keys`](../../../operations/settings/settings.md#any_join_distinct_right_table_keys)

`cross_to_inner_join_rewrite`設定を使用して、ClickHouseが`CROSS JOIN`を`INNER JOIN`として書き換えられなかった場合の動作を定義します。デフォルト値は`1`で、結合を続行できますが、遅くなります。`cross_to_inner_join_rewrite`を`0`に設定するとエラーがスローされ、`2`に設定するとクロス結合を実行せず、すべてのカンマ/クロス結合の書き換えを強制します。値が`2`のときに書き換えが失敗した場合、「`WHERE`セクションを簡素化してみてください」とのエラーメッセージが表示されます。

## ONセクションの条件 {#on-section-conditions}

`ON`セクションには、`AND`や`OR`演算子を使用して結合された複数の条件を含めることができます。結合キーを指定する条件は次のようにする必要があります：
- 左テーブルと右テーブルの両方を参照する
- 等号演算子を使用する

他の条件は他の論理演算子を使用できますが、クエリの左または右テーブルのいずれかを参照する必要があります。

行は、複雑な条件全体が満たされた場合に結合されます。条件が満たされない場合、`JOIN`タイプに応じて結果に行が含まれることがあります。同じ条件が`WHERE`セクションに置かれ、それが満たされない場合、行は結果から必ずフィルタリングされます。

`ON`句内の`OR`演算子はハッシュ結合アルゴリズムを使用して機能します。`JOIN`の結合キーを持つ各`OR`引数ごとに別々のハッシュテーブルが作成されるため、メモリ消費量とクエリ実行時間は`ON`句の`OR`式の数の増加に対して線形に増加します。

:::note
異なるテーブルのカラムを参照する条件については、現在のところ等号演算子（`=`）のみがサポートされています。
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

1つの結合キー条件と`table_2`の追加条件を持つクエリ：

```sql
SELECT name, text FROM table_1 LEFT OUTER JOIN table_2
    ON table_1.Id = table_2.Id AND startsWith(table_2.text, 'Text');
```

結果には、名前が`C`でテキストのカラムが空の行が含まれていることに注意してください。これは`OUTER`タイプの結合が使用されているため、結果に含まれます。

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

`INNER`タイプの結合と`OR`および`AND`を含む条件のクエリ：

:::note

デフォルトでは、同じテーブルからのカラムを使用する限り、不等号条件がサポートされます。
たとえば、`t1.a = t2.key AND t1.b > 0 AND t2.b > t2.c`のような条件で、`t1.b > 0`は`t1`からのカラムのみを使用し、`t2.b > t2.c`は`t2`からのカラムのみを使用します。しかし、`t1.a = t2.key AND t1.b > t2.key`のような条件の実験的サポートを試してみることができます。詳細は以下のセクションを参照してください。

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

## 異なるテーブルのカラムに対する不等号条件を持つJOIN {#join-with-inequality-conditions-for-columns-from-different-tables}

Clickhouseは現在、`ALL/ANY/SEMI/ANTI INNER/LEFT/RIGHT/FULL JOIN`を不等号条件と共にサポートしています。これらの不等号条件は、`hash`および`grace_hash`結合アルゴリズムでのみサポートされています。不等号条件は`join_use_nulls`ではサポートされていません。

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

`NULL`はどの値とも等しくなく、自己を含みます。これは、1つのテーブルの`JOIN`キーに`NULL`値がある場合、他のテーブルの`NULL`値と一致しないことを意味します。

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

`JOIN`キーの`NULL`値のために、`A`テーブルの`Charlie`行と`B`テーブルのスコア88の行が結果に含まれていないことに注意してください。

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

## ASOF JOIN使用法 {#asof-join-usage}

`ASOF JOIN`は、正確な一致がないレコードを結合する必要がある場合に便利です。

このJOINアルゴリズムは、テーブルに特別なカラムを必要とします。このカラム：

- 順序付きのシーケンスを含む必要があります。
- 次のいずれかの型である必要があります：[Int, UInt](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)、[Date](../../../sql-reference/data-types/date.md)、[DateTime](../../../sql-reference/data-types/datetime.md)、[Decimal](../../../sql-reference/data-types/decimal.md)。
- `hash`結合アルゴリズムのためには、`JOIN`句の唯一のカラムであってはいけません。

構文 `ASOF JOIN ... ON`：

```sql
SELECT expressions_list
FROM table_1
ASOF LEFT JOIN table_2
ON equi_cond AND closest_match_cond
```

任意の数の等号条件と正確に1つの最も近い一致条件を使用できます。たとえば、`SELECT count() FROM table_1 ASOF LEFT JOIN table_2 ON table_1.a == table_2.b AND table_2.t <= table_1.t`。

最も近い一致に対してサポートされている条件：`>`、`>=`、`<`、`<=`。

構文 `ASOF JOIN ... USING`：

```sql
SELECT expressions_list
FROM table_1
ASOF JOIN table_2
USING (equi_column1, ... equi_columnN, asof_column)
```

`ASOF JOIN`は`equi_columnX`を等号での結合に使用し、`asof_column`を最も近い一致での結合に使用します。この条件は`table_1.asof_column >= table_2.asof_column`です。`asof_column`カラムは常に`USING`句の最後のカラムです。

次のテーブルを考えます：

```text
     table_1                           table_2
  event   | ev_time | user_id       event   | ev_time | user_id
----------|---------|---------- ----------|---------|----------
              ...                               ...
event_1_1 |  12:00  |  42         event_2_1 |  11:59  |   42
              ...                 event_2_2 |  12:30  |   42
event_1_2 |  13:00  |  42         event_2_3 |  13:00  |   42
              ...                               ...
```

`ASOF JOIN`は`table_1`のユーザーイベントのタイムスタンプを取得し、`table_2`で`table_1`のイベントのタイムスタンプに最も近いイベントを見つけることができます。等しいタイムスタンプ値は、利用可能な場合は最も近いものです。ここで、`user_id`カラムは等号による結合に使用され、`ev_time`カラムは最も近い一致による結合に使用されます。上記の例では、`event_1_1`は`event_2_1`と結合でき、`event_1_2`は`event_2_3`と結合できますが、`event_2_2`は結合できません。

:::note
`ASOF JOIN`は`hash`および`full_sorting_merge`結合アルゴリズムによってのみサポートされます。
[Join](../../../engines/table-engines/special/join.md)テーブルエンジンでは**サポートされていません**。
:::

## PASTE JOIN使用法 {#paste-join-usage}

`PASTE JOIN`の結果は、左のサブクエリからのすべてのカラムの後に右のサブクエリからのすべてのカラムが続くテーブルです。
行は、元のテーブルにおける位置に基づいて一致します（行の順序は定義されるべきです）。
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

注意：この場合、読み込みが並行していると結果が非決定論的である可能性があります。たとえば：

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

- 通常の`JOIN`を使用する場合、クエリはリモートサーバーに送信されます。サブクエリはそれぞれのサーバー上で実行され、正しいテーブルを作成し、そのテーブルで結合が実行されます。言い換えれば、正しいテーブルはそれぞれのサーバーで別々に形成されます。
- `GLOBAL ... JOIN`を使用すると、まずリクエスタサーバーがサブクエリを実行して正しいテーブルを計算します。この一時テーブルは各リモートサーバーに渡され、転送された一時データを使用してその上でクエリが実行されます。

`GLOBAL`を使用する際は注意してください。詳細については[分散サブクエリ](/sql-reference/operators/in#distributed-subqueries)セクションを参照してください。

## 暗黙の型変換 {#implicit-type-conversion}

`INNER JOIN`、`LEFT JOIN`、`RIGHT JOIN`、および`FULL JOIN`クエリは「結合キー」の暗黙の型変換をサポートします。ただし、左テーブルと右テーブルの結合キーが単一の型に変換できない場合（たとえば、`UInt64`と`Int64`、または`String`と`Int32`の両方の値を保持できるデータ型が存在しない場合）、クエリは実行できません。

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
はセットを返します：
```response
┌──a─┬────b─┬─toTypeName(a)─┬─toTypeName(b)───┐
│  1 │    1 │ Int32         │ Nullable(Int64) │
│  2 │    2 │ Int32         │ Nullable(Int64) │
│ -1 │    1 │ Int32         │ Nullable(Int64) │
│  1 │   -1 │ Int32         │ Nullable(Int64) │
└────┴──────┴───────────────┴─────────────────┘
```

## 使用推奨 {#usage-recommendations}

### 空またはNULLセルの処理 {#processing-of-empty-or-null-cells}

テーブルを結合する際、空のセルが現れることがあります。[join_use_nulls](../../../operations/settings/settings.md#join_use_nulls)設定は、ClickHouseがこれらのセルをどのように埋めるかを定義します。

`JOIN`キーが[Nullable](../../../sql-reference/data-types/nullable.md)フィールドである場合、少なくとも1つのキーに値[NULL](/sql-reference/syntax#null)がある行は結合されません。

### 構文 {#syntax}

`USING`に指定されたカラムは、両方のサブクエリで同じ名前を持っている必要があり、他のカラムは異なる名前である必要があります。サブクエリ内のカラムの名前を変更するためにエイリアスを使用できます。

`USING`句は、これらのカラムの等号を確立するために結合する1つ以上のカラムを指定します。カラムのリストは括弧なしで設定されます。より複雑な結合条件はサポートされません。

### 構文制限 {#syntax-limitations}

単一の`SELECT`クエリ内の複数の`JOIN`句に対して：

- テーブルが結合されている場合にのみ、`*`を使用してすべてのカラムを取得できますが、サブクエリには適用できません。
- `PREWHERE`句は使用できません。
- `USING`句は使用できません。

`ON`、`WHERE`、および`GROUP BY`句に関して：

- `ON`、`WHERE`、および`GROUP BY`句に任意の式を使用することはできませんが、`SELECT`句で式を定義し、その後これらの句でエイリアスを介して使用することが可能です。

### パフォーマンス {#performance}

`JOIN`を実行する際、クエリの他のステージに関連する実行順序の最適化は行われません。結合（右テーブル内の検索）は、`WHERE`でのフィルタリングの前および集約の前に実行されます。

同じ`JOIN`でクエリが実行されるたびに、結果がキャッシュされないためサブクエリが再度実行されます。これを避けるために、常にRAM内に存在する結合用の準備された配列である特別な[Join](../../../engines/table-engines/special/join.md)テーブルエンジンを使用してください。

場合によっては、`JOIN`の代わりに[IN](../../../sql-reference/operators/in.md)を使用する方が効率的です。

次元テーブル（広告キャンペーンの名前などの次元プロパティを含む比較的小さなテーブル）との結合用に`JOIN`が必要な場合、`JOIN`は便利ではないかもしれません。右テーブルが各クエリに対して再アクセスされるためです。そのような場合には、`JOIN`の代わりに使用すべき「辞書」機能があります。詳細については[Dictionaries](../../../sql-reference/dictionaries/index.md)セクションを参照してください。

### メモリ制限 {#memory-limitations}

デフォルトでは、ClickHouseは[ハッシュ結合](https://en.wikipedia.org/wiki/Hash_join)アルゴリズムを使用します。ClickHouseは`right_table`を取り、それに対するハッシュテーブルをRAM内に作成します。`join_algorithm = 'auto'`が有効になっている場合、メモリ消費のしきい値を超えると、ClickHouseは[マージ](https://en.wikipedia.org/wiki/Sort-merge_join)結合アルゴリズムにフォールバックします。`JOIN`アルゴリズムの説明については[join_algorithm](../../../operations/settings/settings.md#join_algorithm)設定を参照してください。

`JOIN`操作のメモリ消費を制限する必要がある場合、以下の設定を使用します：

- [max_rows_in_join](/operations/settings/settings#max_rows_in_join) — ハッシュテーブル内の行数を制限します。
- [max_bytes_in_join](/operations/settings/settings#max_bytes_in_join) — ハッシュテーブルのサイズを制限します。

これらの制限のいずれかに達した場合、ClickHouseは[join_overflow_mode](/operations/settings/settings.md#join_overflow_mode)設定で指示されたように動作します。

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
