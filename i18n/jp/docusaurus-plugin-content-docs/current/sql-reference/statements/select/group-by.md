---
description: 'GROUP BY句のドキュメント'
sidebar_label: 'GROUP BY'
slug: /sql-reference/statements/select/group-by
title: 'GROUP BY句'
---


# GROUP BY句

`GROUP BY`句は、`SELECT`クエリを集約モードに切り替えます。その動作は次の通りです。

- `GROUP BY`句は、式のリスト（または単一の式をリストの長さ1と見なしたもの）を含みます。このリストは「グルーピングキー」として機能し、各個別の式は「キー式」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、および[ORDER BY](/sql-reference/statements/select/order-by.md)句内のすべての式は **必ず** キー式または非キー式（プレーンカラムを含む）の上での[集計関数](../../../sql-reference/aggregate-functions/index.md)に基づいて計算されなければなりません。言い換えれば、テーブルから選択される各カラムは、キー式のいずれか、または集計関数内で使用される必要がありますが、両方にはなりません。
- 集約された`SELECT`クエリの結果には、ソーステーブルにおける「グルーピングキー」のユニークな値の数と同じ数の行が含まれます。通常、これにより行数が大幅に削減されますが、必ずしもそうではありません：すべての「グルーピングキー」の値が異なる場合、行数は同じままです。

列名ではなく列番号によってデータをグループ化したい場合は、設定[enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)を有効にします。

:::note
テーブル上で集約を行うもう1つの方法があります。クエリに集計関数の中にのみテーブルカラムが含まれている場合、`GROUP BY`句は省略でき、キーの空のセットに基づく集約が推定されます。このようなクエリは常に正確に1行を返します。
:::

## NULL処理 {#null-processing}

グループ化の際、ClickHouseは[NULL](/sql-reference/syntax#null)を値として解釈し、`NULL==NULL`とします。これは、ほとんどの他の文脈における`NULL`処理とは異なります。

これが何を意味するかを示す例は以下の通りです。

次のテーブルを考えます：

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

`GROUP BY`が`y = NULL`の場合、`x`が合計されていることが分かります。まるで`NULL`がその値であるかのようです。

複数のキーを`GROUP BY`に渡すと、結果は選択のすべての組み合わせを提供します。まるで`NULL`が特定の値であるかのように動作します。

## ROLLUP修飾子 {#rollup-modifier}

`ROLLUP`修飾子は、`GROUP BY`リスト内のキー式の順序に基づいて小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計は逆の順序で計算されます。まず、リスト内の最後のキー式に対して小計が計算され、その後、前のものが計算されていきます。最初のキー式まで続きます。

小計行では、すでに「グループ化された」キー式の値は`0`または空の行に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md)句が小計の結果に影響を与える可能性があることを留意してください。
:::

**例**

テーブル`t`を考えます。

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

`GROUP BY`節には3つのキー式があるため、結果には右から左にロールアップされた小計を持つ4つのテーブルが含まれます。

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（`day`カラムはゼロで埋められる）;
- `GROUP BY year`（今や`month`と`day`カラムは両方ともゼロで埋められる）;
- そして合計（すべての3つのキー式のカラムはゼロである）。

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
同じクエリは`WITH`キーワードを使っても書けます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**参照**

- SQL標準との互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## CUBE修飾子 {#cube-modifier}

`CUBE`修飾子は、`GROUP BY`リスト内のキー式のすべての組み合わせに対する小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計行では、すべての「グループ化された」キー式の値は`0`または空の行に設定されます。

:::note
[HAVING](/sql-reference/statements/select/having.md)句が小計の結果に影響を与える可能性があることを留意してください。
:::

**例**

テーブル`t`を考えます。

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

`GROUP BY`節には3つのキー式があるため、結果にはすべてのキー式の組み合わせに対する小計を持つ8つのテーブルが含まれます：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- そして合計。

`GROUP BY`から除外されたカラムはゼロで埋められます。

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
同じクエリは`WITH`キーワードを使っても書けます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**参照**

- SQL標準との互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## WITH TOTALS修飾子 {#with-totals-modifier}

`WITH TOTALS`修飾子が指定されている場合、別の行が計算されます。この行は、キーのカラムにデフォルト値（ゼロまたは空の行）を含み、集計関数のカラムにはすべての行を通じて計算された値（「合計」値）が含まれます。

この追加行は`JSON*`、`TabSeparated*`、および`Pretty*`フォーマットでのみ生成され、他の行とは別に出力されます：

- `XML`及び`JSON*`フォーマットでは、この行は別の'totals'フィールドとして出力されます。
- `TabSeparated*`、`CSV*`、および`Vertical`フォーマットでは、行は主な結果の後、空の行に続いて出力されます（他のデータの後）。
- `Pretty*`フォーマットでは、行は主な結果の後に別のテーブルとして出力されます。
- `Template`フォーマットでは、行は指定されたテンプレートに従って出力されます。
- 他のフォーマットでは利用できません。

:::note
totalは`SELECT`クエリの結果に出力され、`INSERT INTO ... SELECT`には出力されません。
:::

`WITH TOTALS`は、[HAVING](/sql-reference/statements/select/having.md)が存在する場合に異なる方法で実行できます。挙動は`totals_mode`設定によって決まります。

### トータル処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'`です。この場合、'totals'は`HAVING`や`max_rows_to_group_by`を通過しない行を含むすべての行で計算されます。

他の選択肢には、`HAVING`を通過した行のみが'totals'に含まれ、`max_rows_to_group_by`と`group_by_overflow_mode = 'any'`の設定で異なる動作をします。

`after_having_exclusive` - `max_rows_to_group_by`を通過しなかった行は含まれません。言い換えれば、'totals'は`max_rows_to_group_by`を省略した場合と同様か、それ以下の行数になります。

`after_having_inclusive` - 'totals'に`max_rows_to_group_by`を通過しなかったすべての行を含めます。言い換えれば、'totals'は`max_rows_to_group_by`を省略した場合よりも行数が多くなります。

`after_having_auto` - HAVINGを通過した行数をカウントします。これが一定数（デフォルトでは50%）を超える場合、'totals'に`max_rows_to_group_by`を通過しなかったすべての行を含めます。そうでなければ、含めません。

`totals_auto_threshold` - デフォルトでは0.5です。`after_having_auto`用の係数です。

`max_rows_to_group_by`と`group_by_overflow_mode = 'any'`が使用されていない場合、`after_having`のすべてのバリエーションは同じであり、任意のものを使用できます（たとえば、`after_having_auto`）。

`WITH TOTALS`はサブクエリ内でも使用でき、[JOIN](/sql-reference/statements/select/join.md)句内のサブクエリにも適用されます（この場合、関連する合計値が統合されます）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL`は、集計関数でないすべてのSELECTされた式をリストするのと同等です。

例えば：

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

は次のように同じです。

```sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

集計関数と他のフィールドを引数として持つ関数がある特別なケースでは、`GROUP BY`キーにはそこから抽出できる最大の非集計フィールドが含まれます。

例えば：

```sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

は次のように同じです。

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

MySQLとは異なり（およびSQL標準に準拠して）、キーまたは集計関数に含まれていないカラムの値を取得することはできません（定数式を除いて）。これを回避するために、'any'集計関数（出現した最初の値を取得）や'min/max'を使用できます。

例：

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 各ドメインへの最初に遭遇したページヘッダーを取得します。
FROM hits
GROUP BY domain
```

異なるキー値が見つかるたびに、`GROUP BY`は集計関数値のセットを計算します。

## GROUPING SETS修飾子 {#grouping-sets-modifier}

これは最も一般的な修飾子です。
この修飾子では、いくつかの集約キーセット（グルーピングセット）を手動で指定できます。
集約は各グルーピングセットごとに別々に行われ、その後すべての結果が結合されます。
列がグルーピングセットにない場合、それはデフォルト値で埋められます。

言い換えれば、上記の修飾子は`GROUPING SETS`を通じて表現できます。
`ROLLUP`、`CUBE`、および`GROUPING SETS`修飾子を使用したクエリは構文的には等しいですが、異なる動作をする可能性があります。
`GROUPING SETS`はすべてを並行して実行しようとしますが、`ROLLUP`や`CUBE`は集計の最終的なマージを単一スレッドで実行します。

ソース列にデフォルト値が含まれている場合、その行がそれらの列をキーとして使用する集約の一部であるかどうかを区別するのは難しいことがあります。
この問題を解決するために、`GROUPING`関数を使用する必要があります。

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

**参照**

- SQL標準との互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## 実装の詳細 {#implementation-details}

集約は列指向DBMSの最も重要な機能の1つであり、そのため、実装はClickHouseの中でも最も最適化された部分の1つです。デフォルトでは、集約はハッシュテーブルを使用してメモリ内で行われます。「グルーピングキー」のデータ型に応じて自動的に選択される40以上の特別化があります。

### テーブルソートキーに依存したGROUP BYの最適化 {#group-by-optimization-depending-on-table-sorting-key}

テーブルがあるキーでソートされている場合、集約はより効果的に行われる可能性があります。この場合、`GROUP BY`式がソートキーの接頭辞または単射関数を少なくとも含む場合です。このような場合、新しいキーがテーブルから読み取られると、集約の中間結果が確定し、クライアントに送信できます。この動作は、[optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order)設定によってオンになります。このような最適化は、集約中のメモリ使用量を減らしますが、場合によってはクエリ実行が遅くなることがあります。

### 外部メモリでのGROUP BY {#group-by-in-external-memory}

`GROUP BY`中のメモリ使用量を制限するために、一時データをディスクにダンプすることを有効にできます。
[`max_bytes_before_external_group_by`](/operations/settings/settings.md#max_bytes_before_external_group_by)設定は、`GROUP BY`一時データをファイルシステムにダンプするためのRAM消費のしきい値を決定します。0（デフォルト）に設定すると無効になります。
また、[`max_bytes_ratio_before_external_group_by`](/operations/settings/settings.md#max_bytes_ratio_before_external_group_by)を設定することで、クエリが特定のメモリ使用しきい値に達したときのみ外部メモリで`GROUP BY`を使用できます。

`max_bytes_before_external_group_by`を使用する場合、`max_memory_usage`を約2倍に設定することをお勧めします（または`max_bytes_ratio_before_external_group_by=0.5`）。これは、集約には2つの段階があるためです：データの読み取りと中間データの形成（1）、および中間データのマージ（2）。データをファイルシステムにダンプするのは段階1の間だけです。中間データがダンプされていない場合、段階2では段階1と同じ量のメモリが必要になる場合があります。

例えば、[`max_memory_usage`](/operations/settings/settings.md#max_memory_usage)が10,000,000,000に設定され、外部集約を使用したい場合は、`max_bytes_before_external_group_by`を10,000,000,000に設定し、`max_memory_usage`を20,000,000,000に設定するのが理にかなっています。外部集約がトリガーされた場合（少なくとも1回の一時データのダンプがあった場合）、最大RAM消費は`max_bytes_before_external_group_by`を少し超えた程度です。

分散クエリ処理を使用する場合、外部集約はリモートサーバー上で実行されます。リクエスタサーバーがRAMを僅かにしか使わないようにするには、`distributed_aggregation_memory_efficient`を1に設定します。

ディスクにフラッシュされたデータをマージする際、または`distributed_aggregation_memory_efficient`設定が有効な場合にリモートサーバーからの結果をマージするとき、全RAMの`1/256 * スレッド数`が消費されます。

外部集約が有効な場合、データが`max_bytes_before_external_group_by`未満だった場合（すなわちデータがフラッシュされていなかった場合）、クエリは外部集約なしで実行されるのと同じ速さで実行されます。もし一時データがフラッシュされた場合、実行時間は数倍長くなります（約3倍）。

`GROUP BY`の後に`ORDER BY`があり、その後`LIMIT`がある場合、使用されるRAMの量は`LIMIT`内のデータの量に依存し、テーブル全体には依存しません。しかし、`ORDER BY`に`LIMIT`がない場合、外部ソートを有効にすることを忘れないでください（`max_bytes_before_external_sort`を設定）。
