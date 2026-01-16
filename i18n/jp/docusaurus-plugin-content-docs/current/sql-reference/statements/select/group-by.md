---
description: 'GROUP BY 句に関するドキュメント'
sidebar_label: 'GROUP BY'
slug: /sql-reference/statements/select/group-by
title: 'GROUP BY 句'
doc_type: 'reference'
---

# GROUP BY 句 \\{#group-by-clause\\}

`GROUP BY` 句は `SELECT` クエリを集約モードに切り替え、その動作は次のようになります。

- `GROUP BY` 句には式のリスト（または 1 つだけの式。この場合は長さ 1 のリストとみなされる）が含まれます。このリストが「グルーピングキー」として機能し、各個別の式は「キー式」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、[ORDER BY](/sql-reference/statements/select/order-by.md) 各句内のすべての式は、キー式 **または** 非キー式（プレーンなカラムを含む）に対する[集約関数](../../../sql-reference/aggregate-functions/index.md)に基づいて計算されなければなりません。言い換えると、テーブルから選択される各カラムは、キー式として使用されるか、集約関数の内部で使用されるかのどちらか一方であり、両方で使うことはできません。
- 集約を行う `SELECT` クエリの結果の行数は、元のテーブルに存在した「グルーピングキー」のユニークな値の数と同じになります。通常、これは行数を桁違いに削減しますが、必ずしもそうとは限りません。「グルーピングキー」の値がすべて異なる場合、行数は変わりません。

カラム名ではなくカラム番号でテーブル内のデータをグループ化したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にします。

:::note
テーブルに対して集約を実行する別の方法もあります。クエリ内でテーブルのカラムが集約関数の内部にしか現れない場合、`GROUP BY` 句は省略でき、その場合は空のキー集合（キーをまったく指定しない）での集約が行われるとみなされます。このようなクエリは常にちょうど 1 行だけを返します。
:::

## NULL の処理 \\{#null-processing\\}

グループ化では、ClickHouse は [NULL](/sql-reference/syntax#null) を値として解釈し、`NULL==NULL` とみなします。これは、ほとんどの他のコンテキストにおける `NULL` の処理とは異なります。

これが何を意味するのかは、次の例で確認できます。

次のようなテーブルがあるとします。

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ `SELECT sum(x), y FROM t_null_big GROUP BY y` の結果は以下のとおりです。

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL` に対する `GROUP BY` が、あたかも `NULL` 自体がその値であるかのように、`x` を合計していることが分かります。

`GROUP BY` に複数のキーを渡すと、結果は選択された値のあらゆる組み合わせを返し、あたかも `NULL` が特定の値であるかのように扱われます。

## ROLLUP 修飾子 \\{#rollup-modifier\\}

`ROLLUP` 修飾子は、`GROUP BY` 句のリスト内での順序に基づいて、キー式ごとの小計を計算するために使用されます。小計の行は結果テーブルの末尾に追加されます。

小計は逆順に計算されます。まずリスト内の最後のキー式に対して小計が計算され、その後その一つ前のキー式に対して計算される、というように最初のキー式まで続きます。

小計の行では、すでに「グループ化」されているキー式の値は `0` または空文字列に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md) 句が小計の結果に影響を与える可能性があることに注意してください。
:::

**例**

テーブル t を例にします:

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

`GROUP BY` セクションには 3 つのキー式があるため、結果には右から左へと「ロールアップ」された小計を含む 4 つのテーブルが得られます:

* `GROUP BY year, month, day`;
* `GROUP BY year, month`（`day` 列はゼロで埋められる）;
* `GROUP BY year`（この場合は `month, day` の両方の列がゼロで埋められる）;
* そして合計（3 つのキー式すべての列がゼロになっている）。

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

同じクエリは、`WITH` キーワードを使って書くこともできます。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**関連項目**

* SQL 標準との互換性を確保するための [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## CUBE 修飾子 \\{#cube-modifier\\}

`CUBE` 修飾子は、`GROUP BY` 句内のキー式のあらゆる組み合わせに対する小計を計算するために使用されます。小計行は結果テーブルの末尾に追加されます。

小計行では、すべての「グループ化された」キー式の値は `0` または空文字列に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md) 句は小計の結果に影響を与える可能性がある点に注意してください。
:::

**例**

次のテーブル t を考えます。

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

`GROUP BY` セクションには 3 つのキー式があるため、結果にはすべてのキー式の組み合わせに対する小計を持つ 8 個のテーブルが生成されます:

* `GROUP BY year, month, day`
* `GROUP BY year, month`
* `GROUP BY year, day`
* `GROUP BY year`
* `GROUP BY month, day`
* `GROUP BY month`
* `GROUP BY day`
* および合計。

`GROUP BY` から除外された列はゼロで埋められます。

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

同じクエリは `WITH` キーワードを使って記述することもできます。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**関連項目**

* SQL 標準との互換性を確保するための設定については、[group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) を参照してください。

## WITH TOTALS 句修飾子 \\{#with-totals-modifier\\}

`WITH TOTALS` 句修飾子が指定されている場合、追加の行が計算されます。この行では、キー列にはデフォルト値（ゼロまたは空文字列）が入り、集約関数の列にはすべての行に対して計算された値（`totals` 値）が入ります。

この追加行は、他の行とは別に、`JSON*`、`TabSeparated*`、`Pretty*` の各フォーマットでのみ生成されます。

- `XML` および `JSON*` フォーマットでは、この行は独立した `totals` フィールドとして出力されます。
- `TabSeparated*`、`CSV*`、`Vertical` フォーマットでは、この行はメイン結果の後（他のデータの後）に、空行に続いて出力されます。
- `Pretty*` フォーマットでは、この行はメイン結果の後に独立したテーブルとして出力されます。
- `Template` フォーマットでは、この行は指定されたテンプレートに従って出力されます。
- その他のフォーマットでは利用できません。

:::note
`totals` は `SELECT` クエリの結果で出力され、`INSERT INTO ... SELECT` では出力されません。
:::

[HAVING](/sql-reference/statements/select/having.md) が存在する場合、`WITH TOTALS` はさまざまな方法で実行できます。挙動は `totals_mode` 設定に依存します。

### 合計処理の設定 \\{#configuring-totals-processing\\}

デフォルトでは、`totals_mode = 'before_having'` です。この場合、HAVING および `max_rows_to_group_by` を通過しない行も含めて、すべての行に対して `totals` が計算されます。

その他の選択肢では、HAVING を通過した行のみが `totals` に含まれ、さらに `max_rows_to_group_by` および `group_by_overflow_mode = 'any'` の設定に応じて挙動が異なります。

`after_having_exclusive` – `max_rows_to_group_by` を通過しなかった行を含めません。言い換えると、`max_rows_to_group_by` を指定しなかった場合と比べて、`totals` の行数はそれ以下、または同じになります。

`after_having_inclusive` – `totals` には、`max_rows_to_group_by` を通過しなかったすべての行を含めます。言い換えると、`max_rows_to_group_by` を指定しなかった場合と比べて、`totals` の行数はそれ以上、または同じになります。

`after_having_auto` – HAVING を通過した行数をカウントします。その数がある閾値（デフォルトでは 50%）を超える場合は、`totals` に `max_rows_to_group_by` を通過しなかったすべての行を含めます。そうでない場合は含めません。

`totals_auto_threshold` – デフォルトは 0.5。`after_having_auto` 用の係数です。

`max_rows_to_group_by` および `group_by_overflow_mode = 'any'` が使用されていない場合、`after_having` の各バリエーションはすべて同じ挙動となるため、どれを使用しても構いません（たとえば `after_having_auto`）。

`WITH TOTALS` はサブクエリ内で使用でき、[JOIN](/sql-reference/statements/select/join.md) 句内のサブクエリでも使用できます（この場合、対応する合計値は結合されます）。

## GROUP BY ALL \\{#group-by-all\\}

`GROUP BY ALL` は、集約関数ではないすべての SELECT 句の式を列挙することと同等です。

例えば：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

と同じです

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

引数に集約関数とそれ以外のフィールドの両方を取る関数があるという特別なケースでは、その関数から抽出可能な非集約フィールドが最大限 `GROUP BY` キーに含まれます。

例えば、次のようになります。

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

と同じです

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

## 使用例 \\{#examples\\}

例：

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQL とは異なり（標準 SQL に準拠して）、GROUP BY 句のキーや集約関数（定数式を除く）の引数に含まれていない列の値を取得することはできません。これを回避するには、集約関数 `any`（最初に出現した値を返す）や `min/max` を使用できます。

例:

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

出現した異なるキー値ごとに、`GROUP BY` は集約関数の結果セットを計算します。

## GROUPING SETS 修飾子 \\{#grouping-sets-modifier\\}

これは最も汎用的な修飾子です。
この修飾子を使用すると、複数の集約キーの集合（グルーピングセット）を手動で指定できます。
集約は各グルーピングセットごとに個別に実行され、その後すべての結果が結合されます。
ある列がグルーピングセットに含まれていない場合、その列はデフォルト値で埋められます。

言い換えると、前述の修飾子は `GROUPING SETS` を使って表現できます。
`ROLLUP`、`CUBE`、`GROUPING SETS` 修飾子を使ったクエリは構文的には同じですが、動作が異なる場合があります。
`GROUPING SETS` がすべてを並列に実行しようとするのに対し、`ROLLUP` と `CUBE` は集約結果の最終マージ処理を単一スレッドで実行します。

元のデータの列にデフォルト値が含まれている場合、その行がそれらの列をキーとして使う集約の一部なのかどうかを区別するのが難しくなることがあります。
この問題を解決するために `GROUPING` 関数を使用する必要があります。

**例**

次の 2 つのクエリは等価です。

```sql
-- Query 1
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;

-- Query 2
SELECT year, month, day, count(*) FROM t GROUP BY
GROUPING SETS
(
    (year, month, day),
    (year, month),
    (year),
    ()
);
```

**関連項目**

* SQL 標準との互換性に関する [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## 実装の詳細 \\{#implementation-details\\}

集約はカラム指向 DBMS において最も重要な機能の一つであり、このためその実装部分は ClickHouse の中でも特に高度に最適化されています。デフォルトでは、集約はハッシュテーブルを用いてメモリ内で実行されます。ハッシュテーブルには 40 以上の特殊化があり、「グルーピングキー」のデータ型に応じて自動的に選択されます。

### テーブルのソートキーに依存した GROUP BY の最適化 \\{#group-by-optimization-depending-on-table-sorting-key\\}

テーブルがあるキーでソートされており、`GROUP BY` 式がそのソートキーの少なくとも先頭部分（プレフィックス）、もしくはそれに対する単射関数を含んでいる場合、集約はより効率的に実行できます。この場合、テーブルから新しいキーが読み込まれるたびに、それまでの中間集約結果を確定させてクライアントに送信できます。この動作は [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 設定によって有効になります。このような最適化により集約中のメモリ使用量が削減されますが、場合によってはクエリ実行が遅くなることがあります。

### 外部メモリでの GROUP BY \\{#group-by-in-external-memory\\}

`GROUP BY` 実行中のメモリ使用量を制限するため、一時データをディスクにダンプすることを有効にできます。
[max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 設定は、`GROUP BY` の一時データをファイルシステムにダンプする際の RAM 消費の閾値を決定します。0（デフォルト）に設定されている場合は無効です。
代替として [max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by) を設定することもでき、これはクエリが使用メモリ量の一定の閾値に達したときにのみ外部メモリでの `GROUP BY` を使用できるようにします。

`max_bytes_before_external_group_by` を使用する場合、`max_memory_usage` をその約 2 倍に設定することを推奨します（もしくは `max_bytes_ratio_before_external_group_by=0.5`）。これは集約には 2 つの段階があるためです。すなわち、データを読み込み中間データを生成する段階 (1) と、中間データをマージする段階 (2) です。ファイルシステムへのデータのダンプは段階 1 でのみ発生します。もし一時データがダンプされなかった場合、段階 2 では段階 1 と同程度のメモリが必要になる可能性があります。

例えば、[max_memory_usage](/operations/settings/settings#max_memory_usage) が 10000000000 に設定されていて外部集約を使用したい場合、`max_bytes_before_external_group_by` を 10000000000 に、`max_memory_usage` を 20000000000 に設定するのが妥当です。外部集約がトリガーされた場合（少なくとも 1 回一時データがダンプされた場合）、RAM の最大消費量は `max_bytes_before_external_group_by` をわずかに上回る程度になります。

分散クエリ処理では、外部集約はリモートサーバーで実行されます。要求元サーバーでの RAM 使用量を少量に抑えるために、`distributed_aggregation_memory_efficient` を 1 に設定します。

ディスクにフラッシュされたデータをマージする際や、`distributed_aggregation_memory_efficient` 設定が有効なときにリモートサーバーからの結果をマージする際には、合計 RAM のうち最大で `1/256 * the_number_of_threads` までを使用します。

外部集約が有効であっても、データ量が `max_bytes_before_external_group_by` 未満であった場合（すなわちデータがフラッシュされなかった場合）、クエリは外部集約なしの場合と同じ速度で実行されます。一時データがフラッシュされた場合、実行時間は数倍（おおよそ 3 倍）長くなります。

`GROUP BY` の後に [LIMIT](/sql-reference/statements/select/limit.md) を伴う [ORDER BY](/sql-reference/statements/select/order-by.md) がある場合、使用される RAM の量はテーブル全体のデータ量ではなく `LIMIT` のデータ量に依存します。ただし、`ORDER BY` に `LIMIT` がない場合は、外部ソート（`max_bytes_before_external_sort`）を有効にすることを忘れないでください。
