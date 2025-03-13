---
slug: '/sql-reference/statements/select/group-by'
sidebar_label: 'GROUP BY'
keywords: ['GROUP BY', 'ClickHouse', 'SQL', 'Aggregation']
description: 'GROUP BY clause in ClickHouse SQL for data aggregation.'
---


# GROUP BY 句

`GROUP BY` 句は、`SELECT` クエリを集約モードに切り替え、次のように機能します。

- `GROUP BY` 句には、一連の式 (または長さ1のリストと見なされる単一の式) が含まれます。このリストは「グルーピングキー」として機能し、各個別の式は「キー式」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、および [ORDER BY](/sql-reference/statements/select/order-by.md) 句内のすべての式は、**必ず** キー式に基づいて計算されるか、**または** 非キー式 (普通のカラムを含む) に対する [集約関数](../../../sql-reference/aggregate-functions/index.md) に基づいて計算されなければなりません。言い換えれば、テーブルから選択された各カラムは、キー式のいずれかで使用されるか、集約関数内で使用される必要がありますが、その両方ではありません。
- 集約 `SELECT` クエリの結果は、ソーステーブル内の「グルーピングキー」のユニークな値と同じ数の行を含みます。通常、これにより行数が著しく減少しますが、必ずしもそうではありません: すべての「グルーピングキー」値が異なる場合、行数は同じままです。

テーブルのカラム名ではなくカラム番号でデータをグループ化したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にします。

:::note
テーブル上で集約を実行するための追加の方法があります。クエリに集約関数の内部にのみテーブルのカラムが含まれている場合、`GROUP BY` 句は省略可能で、空のキーセットによる集約が想定されます。そのようなクエリは常に正確に1行を返します。
:::

## NULL 処理 {#null-processing}

グルーピングのために、ClickHouseは [NULL](/sql-reference/syntax#null) を値として解釈し、`NULL==NULL` とします。他の多くのコンテキストでの `NULL` 処理とは異なります。

これが何を意味するのかを示す例を見てみましょう。

次のようなテーブルがあると仮定します:

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ `SELECT sum(x), y FROM t_null_big GROUP BY y` の結果は次のようになります:

``` text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL` に対する `GROUP BY` により `x` が合計されたことがわかります。まるで `NULL` がこの値であるかのように。

複数のキーを `GROUP BY` に渡すと、結果は `NULL` が特定の値であるかのように、選択のすべての組み合わせを返します。

## ROLLUP 修飾子 {#rollup-modifier}

`ROLLUP` 修飾子は、`GROUP BY` リスト内のキー式に基づいて小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計は逆順で計算されます: 最初にリストの最後のキー式の小計が計算され、次にその前のキー式、そして最初のキー式まで続きます。

小計行では、すでに「グループ化」されたキー式の値は `0` または空行として設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md) 句は小計結果に影響を与える場合があることに注意してください。
:::

**例**

テーブル t を考えてみましょう:

```text
┌─year─┬─month─┬─day─┐
│ 2019 │     1 │   5 │
│ 2019 │     1 │  15 │
│ 2020 │     1 │   5 │
│ 2020 │     1 │  15 │
│ 2020 │    10 │   5 │
│ 2020 │    10 │  15 │
└──────┴───────┴─────┘
```

クエリ:

```sql
SELECT year, month, day, count(*) FROM t GROUP BY ROLLUP(year, month, day);
```
`GROUP BY` セクションには3つのキー式があるため、結果には右から左に「巻き上げられた」小計のある4つのテーブルが含まれます:

- `GROUP BY year, month, day`;
- `GROUP BY year, month` (そして `day` カラムはゼロで埋められます);
- `GROUP BY year` (今や `month, day` カラムは両方ともゼロで埋められます);
- そして合計 (すべての3つのキー式のカラムがゼロです)。

```text
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │    10 │  15 │       1 │
│ 2020 │     1 │   5 │       1 │
│ 2019 │     1 │   5 │       1 │
│ 2020 │     1 │  15 │       1 │
│ 2019 │     1 │  15 │       1 │
│ 2020 │    10 │   5 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     1 │   0 │       2 │
│ 2020 │     1 │   0 │       2 │
│ 2020 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     0 │   0 │       2 │
│ 2020 │     0 │   0 │       4 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   0 │       6 │
└──────┴───────┴─────┴─────────┘
```
同じクエリは `WITH` キーワードを使用して次のように書くこともできます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**参照**

- SQL 標準の互換性のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## CUBE 修飾子 {#cube-modifier}

`CUBE` 修飾子は、`GROUP BY` リスト内のすべてのキー式の組み合わせに対して小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計行では、すべての「グループ化」されたキー式の値は `0` または空行として設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md) 句は小計結果に影響を与える場合があることに注意してください。
:::

**例**

テーブル t を考えてみましょう:

```text
┌─year─┬─month─┬─day─┐
│ 2019 │     1 │   5 │
│ 2019 │     1 │  15 │
│ 2020 │     1 │   5 │
│ 2020 │     1 │  15 │
│ 2020 │    10 │   5 │
│ 2020 │    10 │  15 │
└──────┴───────┴─────┘
```

クエリ:

```sql
SELECT year, month, day, count(*) FROM t GROUP BY CUBE(year, month, day);
```

`GROUP BY` セクションには3つのキー式があるため、結果にはすべてのキー式の組み合わせに対する小計のある8つのテーブルが含まれます:

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- そして合計。

`GROUP BY` に含まれていないカラムはゼロで埋められます。

```text
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │    10 │  15 │       1 │
│ 2020 │     1 │   5 │       1 │
│ 2019 │     1 │   5 │       1 │
│ 2020 │     1 │  15 │       1 │
│ 2019 │     1 │  15 │       1 │
│ 2020 │    10 │   5 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     1 │   0 │       2 │
│ 2020 │     1 │   0 │       2 │
│ 2020 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2020 │     0 │   5 │       2 │
│ 2019 │     0 │   5 │       1 │
│ 2020 │     0 │  15 │       2 │
│ 2019 │     0 │  15 │       1 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│ 2019 │     0 │   0 │       2 │
│ 2020 │     0 │   0 │       4 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     1 │   5 │       2 │
│    0 │    10 │  15 │       1 │
│    0 │    10 │   5 │       1 │
│    0 │     1 │  15 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     1 │   0 │       4 │
│    0 │    10 │   0 │       2 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   5 │       3 │
│    0 │     0 │  15 │       3 │
└──────┴───────┴─────┴─────────┘
┌─year─┬─month─┬─day─┬─count()─┐
│    0 │     0 │   0 │       6 │
└──────┴───────┴─────┴─────────┘
```
同じクエリは `WITH` キーワードを使用して次のように書くこともできます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**参照**

- SQL 標準の互換性のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## WITH TOTALS 修飾子 {#with-totals-modifier}

`WITH TOTALS` 修飾子が指定されている場合、別の行が計算されます。この行は、デフォルト値 (ゼロまたは空行) を含むキー列と、すべての行にわたって計算された集約関数の値を持ちます (「合計」値)。

この追加の行は、他の行とは別に、`JSON*`、`TabSeparated*`、および `Pretty*` フォーマットでのみ生成されます:

- `XML` および `JSON*` フォーマットでは、この行は別の 'totals' フィールドとして出力されます。
- `TabSeparated*`、`CSV*` および `Vertical` フォーマットでは、その行はメイン結果の後に空行に続いて配置されます (他のデータの後)。
- `Pretty*` フォーマットでは、この行はメイン結果の後に別のテーブルとして出力されます。
- `Template` フォーマットでは、行は指定されたテンプレートに従って出力されます。
- 他のフォーマットでは利用できません。

:::note
合計は `SELECT` クエリの結果に出力され、`INSERT INTO ... SELECT` では出力されません。
:::

`WITH TOTALS` は、[HAVING](/sql-reference/statements/select/having.md) が存在する場合に異なる方法で実行できます。動作は `totals_mode` 設定に依存します。

### 合計処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'` です。この場合、「合計」は、HAVING や `max_rows_to_group_by` を通過できない行も含めて、すべての行にわたって計算されます。

他の選択肢は、「合計」には HAVING を通過した行のみが含まれ、`max_rows_to_group_by` および `group_by_overflow_mode = 'any'` 設定によって異なる動作をします。

`after_having_exclusive` – `max_rows_to_group_by` を通過しなかった行は含めません。言い換えれば、「合計」は `max_rows_to_group_by` を省略した場合の行数と同じかそれ以下になります。

`after_having_inclusive` – `max_rows_to_group_by` を通過しなかったすべての行が「合計」に含まれます。言い換えれば、「合計」は `max_rows_to_group_by` を省略した場合の行数と同じかそれ以上になります。

`after_having_auto` – HAVING を通過した行の数をカウントします。もしそれが指定された数 (デフォルトは50%) より多い場合、`max_rows_to_group_by` を通過しなかったすべての行を「合計」に含めます。それ以外の場合は含めません。

`totals_auto_threshold` – デフォルトは 0.5。`after_having_auto` 用の係数です。

`max_rows_to_group_by` と `group_by_overflow_mode = 'any'` が使用されていない場合、`after_having` のすべてのバリエーションは同じであり、いずれかを使用できます (たとえば、`after_having_auto` を使用できます)。

`WITH TOTALS` は内部クエリでも使用でき、[JOIN](/sql-reference/statements/select/join.md) 句内の内部クエリも含まれます（この場合、対応する合計値が結合されます）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` は、集約関数でないすべての SELECT された式をリストアップすることに相当します。

例えば:

``` sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

は次のように同じです:

``` sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

関数が集約関数と他のフィールドの両方を引数として持つ特別な場合に、`GROUP BY` キーにはそこから抽出できる最大非集約フィールドが含まれます。

例えば:

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

は次のように同じです:

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

## 例 {#examples}

例:

``` sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQL と異なり (および標準 SQL に準拠して)、キーまたは集約関数に含まれていないカラムの値を取得することはできません (定数式を除いて)。これを解決するために、最初に遭遇した値を取得する 'any' 集約関数や 'min/max' を使用できます。

例:

``` sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 各ドメインに対して最初に出現したページのヘッダーを取得します。
FROM hits
GROUP BY domain
```

異なるキー値が見つかるたびに、`GROUP BY` は集約関数の値のセットを計算します。

## GROUPING SETS 修飾子 {#grouping-sets-modifier}

これは最も一般的な修飾子です。
この修飾子は、いくつかの集約キーセット (グルーピングセット) を手動で指定することを可能にします。
集約は各グルーピングセットに対して別々に実行され、その後、すべての結果が結合されます。
列がグルーピングセットに表示されていない場合、デフォルト値で埋められます。

言い換えれば、上記で説明した修飾子は `GROUPING SETS` を介して表現できます。
`ROLLUP`、`CUBE` および `GROUPING SETS` 修飾子を持つクエリは文法的には等しいですが、動作が異なる場合があります。
`GROUPING SETS` がすべてを並行して実行しようとすると、`ROLLUP` と `CUBE` は集約の最終マージを単一スレッドで実行します。

ソースのカラムがデフォルト値を含む場合、行がこれらのカラムをキーとして使用する集約の一部であるかどうかを区別することが難しい場合があります。
この問題を解決するために `GROUPING` 関数を使用しなければなりません。

**例**

次の2つのクエリは等しいです。

```sql
-- クエリ 1
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;

-- クエリ 2
SELECT year, month, day, count(*) FROM t GROUP BY
GROUPING SETS
(
    (year, month, day),
    (year, month),
    (year),
    ()
);
```

**参照**

- SQL 標準の互換性のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## 実装の詳細 {#implementation-details}

集約は列指向DBMSの最も重要な機能の一つであり、その実装は ClickHouse の最も最適化された部分の一つです。デフォルトでは、集約はハッシュテーブルを使用してメモリ内で行われます。それは「グルーピングキー」データ型に応じて自動的に選択される40以上の専門化を持っています。

### テーブルソートキーに依存した GROUP BY 最適化 {#group-by-optimization-depending-on-table-sorting-key}

集約は、テーブルが何らかのキーによってソートされているとき、かつ `GROUP BY` 式がソートキーの少なくとも接頭辞または単射関数を含む場合、より効果的に実行されます。この場合、テーブルから新しいキーを読み込むと、集約の中間結果を確定してクライアントに送信できます。この動作は、[optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 設定によって切り替えられます。このような最適化は、集約中のメモリ使用量を減少させますが、場合によってはクエリの実行を遅くすることがあります。

### 外部メモリでの GROUP BY {#group-by-in-external-memory}

`GROUP BY` 中のメモリ使用量を制限するために、一時データをディスクにダンプすることを有効にできます。
`max_bytes_before_external_group_by` (/operations/settings/query-complexity.md#settings-max_bytes_before_external_group_by) 設定は、`GROUP BY` 一時データをファイルシステムにダンプするための閾値 RAM 消費を決定します。0 に設定すると（デフォルト）、ダンプは無効になります。
もしくは、`max_bytes_ratio_before_external_group_by` (/operations/settings/query-complexity.md#settings-max_bytes_ratio_before_external_group_by) を設定でき、これにより、クエリが特定のメモリ使用量の閾値に達するまで、外部メモリで `GROUP BY` を使用できます。

`max_bytes_before_external_group_by` を使用する場合、`max_memory_usage` を約2倍に設定することをお勧めします（または `max_bytes_ratio_before_external_group_by=0.5`）。これは、集約に2つの段階があるためです: データを読み込んで中間データを形成する (1) と中間データをマージする (2)。データをファイルシステムにダンプできるのはステージ1中だけです。一時データがダンプされなかった場合、ステージ2はステージ1と同じ量のメモリが必要になる可能性があります。

たとえば、[max_memory_usage](/operations/settings/query-complexity.md#settings_max_memory_usage) が10000000000に設定されていて、外部集約を使用したい場合、`max_bytes_before_external_group_by` を10000000000に、`max_memory_usage` を20000000000に設定することが妥当です。外部集約がトリガーされた場合（少なくとも一度の一時データのダンプがあった場合）、最大のRAM消費量は `max_bytes_before_external_group_by` よりわずかに多くなります。

分散クエリ処理を使用する場合、外部集約はリモートサーバーで実行されます。リクエスタサーバーが少量のRAMのみを使用するためには、`distributed_aggregation_memory_efficient` を1に設定します。

ディスクにフラッシュされたデータをマージする場合や、`distributed_aggregation_memory_efficient` 設定が有効な場合にリモートサーバーからの結果をマージする際には、総RAM量の `1/256 * the_number_of_threads` が消費されます。

外部集約が有効な場合、`max_bytes_before_external_group_by` 未満のデータがある場合（すなわちデータがフラッシュされていない場合）、クエリは外部集約なしで実行されるのと同じくらい速くなります。もし一時データがフラッシュされた場合、実行時間は数倍遅くなります（約三倍）。

`GROUP BY` の後に [ORDER BY](/sql-reference/statements/select/order-by.md) と [LIMIT](/sql-reference/statements/select/limit.md) がある場合、使用されるRAMの量は `LIMIT` におけるデータの量によって決定され、全体のテーブルではありません。しかし、`ORDER BY` に `LIMIT` がない場合は、外部ソートを有効にすることを忘れないでください (`max_bytes_before_external_sort`)。
