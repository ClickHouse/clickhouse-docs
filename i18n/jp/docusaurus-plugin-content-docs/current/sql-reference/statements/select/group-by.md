---
description: 'GROUP BY 句に関するドキュメント'
sidebar_label: 'GROUP BY'
slug: /sql-reference/statements/select/group-by
title: 'GROUP BY 句'
doc_type: 'reference'
---



# GROUP BY 句

`GROUP BY` 句は、`SELECT` クエリを集約モードに切り替えます。動作は次のとおりです。

- `GROUP BY` 句には式のリスト（または長さ 1 のリストとみなされる単一の式）が含まれます。このリストは「グループ化キー」として機能し、各個別の式は「キー式」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、[ORDER BY](/sql-reference/statements/select/order-by.md) 句内のすべての式は、キー式 **または** 非キー式（単純なカラムを含む）に対する[集約関数](../../../sql-reference/aggregate-functions/index.md)に基づいて計算されていなければなりません。言い換えると、テーブルから選択される各カラムは、キー式として使用するか、集約関数の内部で使用するかのいずれかであり、両方で使用してはなりません。
- 集約された `SELECT` クエリの結果には、元のテーブル内の「グループ化キー」の一意な値の数と同じだけの行が含まれます。通常、これにより行数は桁違いに小さくなりますが、必ずしもそうとは限りません。「グループ化キー」の値がすべて異なる場合、行数は変化しません。

テーブル内のデータをカラム名ではなくカラム番号でグループ化したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にします。

:::note
テーブルに対して集約を実行する別の方法もあります。クエリ内でテーブルのカラムが集約関数の内部にのみ出現する場合、`GROUP BY 句` を省略でき、その場合はキーの空集合による集約が行われるとみなされます。そのようなクエリは常にちょうど 1 行のみを返します。
:::



## NULL処理 {#null-processing}

グループ化において、ClickHouseは[NULL](/sql-reference/syntax#null)を値として解釈し、`NULL==NULL`として扱います。これは他のほとんどのコンテキストにおける`NULL`の処理とは異なります。

以下に、これが何を意味するかを示す例を示します。

次のようなテーブルがあるとします:

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ`SELECT sum(x), y FROM t_null_big GROUP BY y`を実行すると、次のような結果になります:

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL`に対する`GROUP BY`が`x`を合計していることがわかります。これは`NULL`が一つの値として扱われているためです。

`GROUP BY`に複数のキーを渡すと、結果として選択のすべての組み合わせが返されます。これは`NULL`が特定の値であるかのように扱われるためです。


## ROLLUP修飾子 {#rollup-modifier}

`ROLLUP`修飾子は、`GROUP BY`リスト内のキー式の順序に基づいて小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計は逆順で計算されます。まずリスト内の最後のキー式の小計が計算され、次にその前のキー式、というように最初のキー式まで順に計算されます。

小計行では、すでに「グループ化」されたキー式の値は`0`または空文字列に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md)句が小計結果に影響を与える可能性があることに注意してください。
:::

**例**

テーブルtを考えます:

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

`GROUP BY`セクションには3つのキー式があるため、結果には右から左へ「ロールアップ」された小計を含む4つのテーブルが含まれます:

- `GROUP BY year, month, day`;
- `GROUP BY year, month`(`day`列はゼロで埋められます);
- `GROUP BY year`(この時点で`month, day`列は両方ともゼロで埋められます);
- および合計(3つのキー式列すべてがゼロになります)。

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

同じクエリは`WITH`キーワードを使用して記述することもできます。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**関連項目**

- SQL標準互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。


## CUBE修飾子 {#cube-modifier}

`CUBE`修飾子は、`GROUP BY`リスト内のキー式のすべての組み合わせに対して小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計行では、すべての「グループ化された」キー式の値が`0`または空文字列に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md)句が小計結果に影響を与える可能性があることに注意してください。
:::

**例**

テーブルtを考えます:

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

`GROUP BY`セクションには3つのキー式があるため、結果にはすべてのキー式の組み合わせに対する小計を含む8つのテーブルが含まれます:

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- および合計

`GROUP BY`から除外された列はゼロで埋められます。


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

同じクエリは `WITH` キーワードを使用して記述することもできます。

```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**関連項目**

* SQL 標準との互換性に関する [group&#95;by&#95;use&#95;nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。


## WITH TOTALS修飾子 {#with-totals-modifier}

`WITH TOTALS`修飾子が指定されている場合、追加の行が計算されます。この行には、デフォルト値(ゼロまたは空行)を含むキー列と、すべての行にわたって計算された値(「合計」値)を持つ集約関数の列が含まれます。

この追加行は、`JSON*`、`TabSeparated*`、`Pretty*`形式でのみ生成され、他の行とは別に出力されます:

- `XML`および`JSON*`形式では、この行は独立した'totals'フィールドとして出力されます。
- `TabSeparated*`、`CSV*`、`Vertical`形式では、この行はメイン結果の後に空行を挟んで(他のデータの後に)出力されます。
- `Pretty*`形式では、この行はメイン結果の後に独立したテーブルとして出力されます。
- `Template`形式では、この行は指定されたテンプレートに従って出力されます。
- その他の形式では利用できません。

:::note
totalsは`SELECT`クエリの結果に出力されますが、`INSERT INTO ... SELECT`では出力されません。
:::

`WITH TOTALS`は、[HAVING](/sql-reference/statements/select/having.md)が存在する場合、異なる方法で実行できます。動作は`totals_mode`設定に依存します。

### 合計処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'`です。この場合、'totals'はHAVINGおよび`max_rows_to_group_by`を通過しない行を含む、すべての行にわたって計算されます。

その他の選択肢では、'totals'にHAVINGを通過した行のみが含まれ、`max_rows_to_group_by`および`group_by_overflow_mode = 'any'`設定で異なる動作をします。

`after_having_exclusive` – `max_rows_to_group_by`を通過しなかった行を含めません。言い換えると、'totals'は`max_rows_to_group_by`が省略された場合と比べて、同じかそれ以下の行数になります。

`after_having_inclusive` – 'max_rows_to_group_by'を通過しなかったすべての行を'totals'に含めます。言い換えると、'totals'は`max_rows_to_group_by`が省略された場合と比べて、同じかそれ以上の行数になります。

`after_having_auto` – HAVINGを通過した行数をカウントします。特定の量(デフォルトでは50%)を超える場合、'max_rows_to_group_by'を通過しなかったすべての行を'totals'に含めます。それ以外の場合は含めません。

`totals_auto_threshold` – デフォルトでは0.5です。`after_having_auto`の係数です。

`max_rows_to_group_by`および`group_by_overflow_mode = 'any'`が使用されていない場合、`after_having`のすべてのバリエーションは同じであり、いずれかを使用できます(例えば、`after_having_auto`)。

`WITH TOTALS`はサブクエリで使用でき、[JOIN](/sql-reference/statements/select/join.md)句内のサブクエリも含まれます(この場合、それぞれの合計値が結合されます)。


## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` は、集計関数以外のすべてのSELECT式を列挙することと同等です。

例:

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

は次と同じです:

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

特殊なケースとして、集計関数と他のフィールドの両方を引数として持つ関数がある場合、`GROUP BY` キーには、その関数から抽出できる最大限の非集計フィールドが含まれます。

例:

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

は次と同じです:

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```


## 例 {#examples}

例:

```sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQLとは異なり(標準SQLに準拠)、キーまたは集約関数に含まれていない列の値を取得することはできません(定数式を除く)。この制約を回避するには、'any'集約関数(最初に検出された値を取得)または'min/max'を使用できます。

例:

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 各ドメインで最初に出現したページヘッダーを取得
FROM hits
GROUP BY domain
```

`GROUP BY`は、検出された異なるキー値ごとに集約関数値のセットを計算します。


## GROUPING SETS修飾子 {#grouping-sets-modifier}

これは最も汎用的な修飾子です。
この修飾子を使用すると、複数の集約キーセット(グルーピングセット)を手動で指定できます。
集約は各グルーピングセットに対して個別に実行され、その後すべての結果が結合されます。
グルーピングセットにカラムが含まれていない場合、デフォルト値で埋められます。

言い換えれば、上記で説明した修飾子は`GROUPING SETS`を使用して表現できます。
`ROLLUP`、`CUBE`、`GROUPING SETS`修飾子を使用したクエリは構文的には同等ですが、パフォーマンスが異なる場合があります。
`GROUPING SETS`がすべてを並列実行しようとするのに対し、`ROLLUP`と`CUBE`は集約の最終マージを単一スレッドで実行します。

ソースカラムにデフォルト値が含まれている場合、行がそれらのカラムをキーとして使用する集約の一部であるかどうかを区別することが困難な場合があります。
この問題を解決するには、`GROUPING`関数を使用する必要があります。

**例**

以下の2つのクエリは同等です。

```sql
-- クエリ1
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;

-- クエリ2
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

- SQL標準互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。


## 実装の詳細 {#implementation-details}

集約は列指向DBMSの最も重要な機能の一つであり、そのためClickHouseにおいて最も高度に最適化された部分の一つとなっています。デフォルトでは、集約はハッシュテーブルを使用してメモリ内で実行されます。「グループ化キー」のデータ型に応じて自動的に選択される40以上の特殊化が用意されています。

### テーブルのソートキーに依存したGROUP BYの最適化 {#group-by-optimization-depending-on-table-sorting-key}

テーブルが何らかのキーでソートされており、`GROUP BY`式がソートキーの接頭辞または単射関数を少なくとも含んでいる場合、集約はより効果的に実行できます。この場合、テーブルから新しいキーが読み取られると、集約の中間結果を確定してクライアントに送信できます。この動作は[optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order)設定によって有効化されます。このような最適化は集約中のメモリ使用量を削減しますが、場合によってはクエリの実行速度を低下させる可能性があります。

### 外部メモリでのGROUP BY {#group-by-in-external-memory}

`GROUP BY`実行中のメモリ使用量を制限するために、一時データをディスクにダンプすることを有効化できます。
[max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by)設定は、`GROUP BY`の一時データをファイルシステムにダンプするためのRAM消費量の閾値を決定します。0に設定されている場合（デフォルト）、この機能は無効化されます。
あるいは、[max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by)を設定することで、クエリが使用メモリの特定の閾値に達した場合にのみ外部メモリで`GROUP BY`を使用できるようにすることができます。

`max_bytes_before_external_group_by`を使用する場合、`max_memory_usage`を約2倍の値に設定すること（または`max_bytes_ratio_before_external_group_by=0.5`）を推奨します。これは、集約には2つの段階があるためです：データの読み取りと中間データの形成（1）、および中間データのマージ（2）です。ファイルシステムへのデータのダンプは段階1でのみ発生します。一時データがダンプされなかった場合、段階2では段階1と同程度のメモリが必要になる可能性があります。

例えば、[max_memory_usage](/operations/settings/settings#max_memory_usage)が10000000000に設定されており、外部集約を使用したい場合、`max_bytes_before_external_group_by`を10000000000に、`max_memory_usage`を20000000000に設定することが妥当です。外部集約がトリガーされた場合（一時データのダンプが少なくとも1回発生した場合）、RAMの最大消費量は`max_bytes_before_external_group_by`をわずかに上回る程度です。

分散クエリ処理では、外部集約はリモートサーバー上で実行されます。リクエスタサーバーが少量のRAMのみを使用するようにするには、`distributed_aggregation_memory_efficient`を1に設定します。

ディスクにフラッシュされたデータをマージする際、および`distributed_aggregation_memory_efficient`設定が有効な場合にリモートサーバーからの結果をマージする際には、総RAM量の`1/256 * スレッド数`まで消費します。

外部集約が有効な場合、データが`max_bytes_before_external_group_by`未満であれば（つまりデータがフラッシュされなかった場合）、クエリは外部集約なしの場合と同じ速度で実行されます。一時データがフラッシュされた場合、実行時間は数倍長くなります（約3倍）。

`GROUP BY`の後に[LIMIT](/sql-reference/statements/select/limit.md)を伴う[ORDER BY](/sql-reference/statements/select/order-by.md)がある場合、使用されるRAM量はテーブル全体ではなく`LIMIT`内のデータ量に依存します。ただし、`ORDER BY`に`LIMIT`がない場合は、外部ソート（`max_bytes_before_external_sort`）を有効化することを忘れないでください。
