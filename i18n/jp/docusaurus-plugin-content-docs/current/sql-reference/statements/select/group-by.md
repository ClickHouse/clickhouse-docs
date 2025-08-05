---
description: 'GROUP BY句のドキュメント'
sidebar_label: 'GROUP BY'
slug: '/sql-reference/statements/select/group-by'
title: 'GROUP BY Clause'
---


# GROUP BY句

`GROUP BY`句は、`SELECT`クエリを集計モードに切り替え、以下のように動作します：

- `GROUP BY`句には、式のリスト（または長さ1のリストと見なされる単一の式）が含まれます。このリストは「グルーピングキー」として機能し、各個別の式は「キー式」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、および[ORDER BY](/sql-reference/statements/select/order-by.md)句内のすべての式は、**キー式**に基づいて計算されるか、非キー式に対して[集計関数](../../../sql-reference/aggregate-functions/index.md)に基づいて計算される必要があります（平凡なカラムを含む）。言い換えれば、テーブルから選択された各カラムは、キー式のいずれか、あるいは集計関数の中で使用されなければなりませんが、その両方ではありません。
- `SELECT`クエリの集計結果は、ソーステーブル内の「グルーピングキー」のユニークな値の数と同じだけの行を含みます。通常、これは行の数を大幅に減少させますが、必ずしもそうではありません：すべての「グルーピングキー」値が異なる場合、行の数は同じままです。

テーブル内のデータをカラム名の代わりにカラム番号でグループ化したい場合は、設定[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)を有効にします。

:::note
テーブルに対して集計を実行する追加の方法があります。クエリが集計関数内のテーブルカラムのみを含む場合、`GROUP BY句`は省略でき、キーの空集合に基づく集計が仮定されます。このようなクエリは常に正確に1行を返します。
:::

## NULL処理 {#null-processing}

グループ化のために、ClickHouseは[NULL](/sql-reference/syntax#null)を値として解釈し、`NULL==NULL`と見なします。これは、他のほとんどの文脈での`NULL`処理とは異なります。

これが何を意味するのかを示す例があります。

次のようなテーブルがあると仮定します：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ`SELECT sum(x), y FROM t_null_big GROUP BY y`の結果は次のようになります：

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL`の場合の`GROUP BY`が、あたかも`NULL`がこの値であるかのように`x`を合計したことがわかります。

複数のキーを`GROUP BY`に渡すと、結果は選択のすべての組み合わせを返します。あたかも`NULL`が特定の値であるかのように。

## ROLLUP修飾子 {#rollup-modifier}

`ROLLUP`修飾子は、`GROUP BY`リスト内のキー式の順序に基づいて小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計は逆の順序で計算されます：最初にリストの最後のキー式の小計が計算され、その後、前のキー式、そして最初のキー式まで遡ります。

小計行では、すでに「グループ化された」キー式の値が`0`または空行に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md)句は小計結果に影響を与える可能性があることに注意してください。
:::

**例**

テーブルtを考えます：

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

クエリ：

```sql
SELECT year, month, day, count(*) FROM t GROUP BY ROLLUP(year, month, day);
```
`GROUP BY`セクションに3つのキー式があるため、結果は右から左に「ロールアップ」された小計を含む4つのテーブルを含みます：

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（`day`カラムは0で埋められます）；
- `GROUP BY year`（この時点で`month`と`day`のカラムは両方とも0で埋められます）；
- そしてトータル（すべての三つのキー式カラムが0です）。

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
同じクエリは、`WITH`キーワードを使用して書くこともできます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**参照も**

- SQL標準互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## CUBE修飾子 {#cube-modifier}

`CUBE`修飾子は、`GROUP BY`リスト内のすべてのキー式の組み合わせに対して小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計行では、すべての「グループ化された」キー式の値が`0`または空行に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md)句は小計結果に影響を与える可能性があることに注意してください。
:::

**例**

テーブルtを考えます：

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

クエリ：

```sql
SELECT year, month, day, count(*) FROM t GROUP BY CUBE(year, month, day);
```

`GROUP BY`セクションに3つのキー式があるため、結果はすべてのキー式の組み合わせに対する小計を含む8つのテーブルを含みます：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- そしてトータル。

`GROUP BY`から除外されたカラムは0で埋められます。

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
同じクエリは、`WITH`キーワードを使って書くこともできます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**参照も**

- SQL標準互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## WITH TOTALS修飾子 {#with-totals-modifier}

`WITH TOTALS`修飾子が指定されると、別の行が計算されます。この行は、デフォルト値（ゼロまたは空行）を含むキー列と、すべての行に対して計算された集計関数の列（「合計」値）を持ちます。

この追加の行は、`JSON*`、`TabSeparated*`、および`Pretty*`フォーマットで、他の行とは別に生成されます：

- `XML`および`JSON*`フォーマットでは、この行は別の「合計」フィールドとして出力されます。
- `TabSeparated*`、`CSV*`および`Vertical`フォーマットでは、行は主要結果の後に、空行の前に来る。
- `Pretty*`フォーマットでは、この行は主要結果の後に別のテーブルとして出力されます。
- `Template`フォーマットでは、指定されたテンプレートに従って出力されます。
- 他のフォーマットでは利用できません。

:::note
合計は`SELECT`クエリの結果に出力され、`INSERT INTO ... SELECT`では出力されません。
:::

`WITH TOTALS`は、[HAVING](/sql-reference/statements/select/having.md)が存在する場合、異なる方法で実行できます。動作は`totals_mode`設定に依存します。

### 合計処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'`です。この場合、「合計」は、HAVINGを通過しない行を含め、すべての行に対して計算されます。

他の代替手段には、`max_rows_to_group_by`の設定によって異なる動作をするため、`HAVING`を通過する行のみを「合計」に含めるものが含まれます。

`after_having_exclusive` - `max_rows_to_group_by`を通過しなかった行を含めません。言い換えれば、「合計」は、`max_rows_to_group_by`が省略された場合と同じか、それより少ない行数になります。

`after_having_inclusive` - `max_rows_to_group_by`を通過しなかったすべての行を「合計」に含めます。言い換えれば、「合計」は、`max_rows_to_group_by`が省略された場合と同じか、それより多い行数になります。

`after_having_auto` - HAVINGを通過した行の数をカウントします。それが一定の量（デフォルトでは50％以上）である場合、「合計」には、`max_rows_to_group_by`を通過しなかったすべての行が含まれます。そうでなければ、含まれません。

`totals_auto_threshold` - デフォルトは0.5です。`after_having_auto`の係数です。

`max_rows_to_group_by`と`group_by_overflow_mode = 'any'`が使用されていない場合、`after_having`のすべてのバリエーションは同じであり、任意のものを使用できます（例えば、`after_having_auto`）。

`WITH TOTALS`は、サブクエリでも使用できます。これは、[JOIN](/sql-reference/statements/select/join.md)句のサブクエリを含みます（この場合、該当する合計値が結合されます）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL`は、集計関数でないすべてのSELECTされた式をリストアップすることと等価です。

例えば：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

これは次のように同じです：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

集計関数と他のフィールドの両方を引数に持つ関数がある特別なケースの場合、`GROUP BY`のキーには、そこから抽出できる最大の非集計フィールドが含まれます。

例えば：

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

これは次のように同じです：

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

## 例 {#examples}

例：

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQLとは異なり（SQL標準に準拠）、キーや集計関数に含まれていないカラムの値を取得することはできません（定数式を除く）。これを回避するために、最初に遭遇した値を取得するために、'any'集計関数または'min/max'を使用できます。

例：

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 各ドメインの最初に現れたページヘッダーを取得します。
FROM hits
GROUP BY domain
```

異なるキー値が見つかるたびに、`GROUP BY`は一連の集計関数値を計算します。

## GROUPING SETS修飾子 {#grouping-sets-modifier}

これは最も一般的な修飾子です。この修飾子は、いくつかの集計キーセット（グルーピングセット）を手動で指定できるようにします。
集計は各グルーピングセットごとに個別に行われ、その後、すべての結果が結合されます。
カラムがグルーピングセットに存在しない場合、デフォルト値で埋められます。

言い換えれば、上記で説明した修飾子は`GROUPING SETS`を介して表現できます。
`ROLLUP`、`CUBE`および`GROUPING SETS`修飾子を持つクエリは、文法的には同じですが、異なる動作をする場合があります。
`GROUPING SETS`がすべてを並行して実行しようとするのに対し、`ROLLUP`および`CUBE`は集計の最終的なマージをシングルスレッドで実行します。

ソースカラムにデフォルト値が含まれている場合、その行がそれらのカラムをキーとして使用する集計の一部であるかどうかを区別するのが難しい場合があります。
この問題を解決するために`GROUPING`関数を使用しなければなりません。

**例**

次の2つのクエリは同等です。

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

**参照も**

- SQL標準互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## 実装の詳細 {#implementation-details}

集計は列指向DBMSの最も重要な機能の1つであり、そのため、ClickHouseの最も最適化された部分の1つです。デフォルトでは、集計はハッシュテーブルを使用してメモリ内で行われます。40以上の専門化があり、これらは「グルーピングキー」のデータ型に基づいて自動的に選択されます。

### テーブルソートキーに依存したGROUP BY最適化 {#group-by-optimization-depending-on-table-sorting-key}

集計は、テーブルが何らかのキーでソートされている場合、`GROUP BY`式がソートキーのプレフィックスまたは単射関数を含むと、より効果的に実行できます。この場合、新しいキーがテーブルから読み取られる際、集計の中間結果を確定させてクライアントに送信することができます。この動作は、設定[optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order)によってオンにされます。このような最適化は、集計中のメモリ使用を減少させますが、場合によってはクエリの実行速度を遅くする可能性があります。

### 外部メモリにおけるGROUP BY {#group-by-in-external-memory}

`GROUP BY`中のメモリ使用を制限するために、一時データをディスクにダンプするように設定できます。設定[max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by)は、ファイルシステムに`GROUP BY`一時データをダンプするための閾値RAM消費を決定します。0（デフォルト）に設定された場合、これは無効です。
あるいは、設定[max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)を設定することもでき、これにより、クエリが一定のメモリ使用閾値に達するまで`GROUP BY`を外部メモリで使用できません。

`max_bytes_before_external_group_by`を使用する場合は、`max_memory_usage`を約2倍（または`max_bytes_ratio_before_external_group_by=0.5`）に設定することをお勧めします。これは、集計にはデータの読み取りと中間データの形成（1）および中間データのマージ（2）の2つのステージがあるためです。データをファイルシステムにダンプするのはステージ1の間のみ可能です。一時データがダンプされていない場合、ステージ2はステージ1と同じ量のメモリを必要とする可能性があります。

例えば、[max_memory_usage](/operations/settings/settings.md#max_memory_usage)が10000000000に設定され、外部集計を使用したい場合、`max_bytes_before_external_group_by`を10000000000に、`max_memory_usage`を20000000000に設定するのが理にかなっています。外部集計がトリガーされる (一時データが少なくとも1回ダンプされた場合) と、最大RAM消費は`max_bytes_before_external_group_by`よりわずかに多くなります。

分散クエリ処理を使用している場合、外部集計はリモートサーバーで実行されます。リクエスターサーバーが少ないRAMしか使用しないようにするには、`distributed_aggregation_memory_efficient`を1に設定します。

ディスクにフラッシュされたデータをマージするとき、および`distributed_aggregation_memory_efficient`設定が有効になっているときにリモートサーバーから結果をマージするとき、総RAMの最大`1/256 * スレッド数`が消費されます。

外部集計が有効な場合、もし `max_bytes_before_external_group_by` より少ないデータ（つまり、データがフラッシュされなかった）の場合、クエリは外部集計なしで実行したときと同じように速く実行されます。もし一時データがダンプされた場合、実行時間は数倍長く（約3倍）なります。

`GROUP BY`の後に[ORDER BY](/sql-reference/statements/select/order-by.md)と[LIMIT](/sql-reference/statements/select/limit.md)がある場合、使用されるRAMの量は`LIMIT`内のデータ量に依存し、全テーブルのものではなくなります。しかし、`ORDER BY`が`LIMIT`を持たない場合は、外部ソートを有効にすることを忘れないでください（`max_bytes_before_external_sort`）。
