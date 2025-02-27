---
slug: /sql-reference/statements/select/group-by
sidebar_label: GROUP BY
---

# GROUP BY 句

`GROUP BY` 句は `SELECT` クエリを集約モードに切り替え、以下のように機能します。

- `GROUP BY` 句には、式のリスト（または長さ1のリストと見なされる単一の式）が含まれます。このリストは「グルーピングキー」として機能し、各個別の式は「キー式」と呼ばれます。
- [SELECT](../../../sql-reference/statements/select/index.md)、[HAVING](../../../sql-reference/statements/select/having.md) および [ORDER BY](../../../sql-reference/statements/select/order-by.md) 句のすべての式は、キー式に基づいて計算される必要があります **または** 非キー式（プレーンカラムを含む）に対する [集約関数](../../../sql-reference/aggregate-functions/index.md) に基づいて計算されなければなりません。言い換えれば、テーブルから選択された各カラムは、キー式のいずれかまたは集約関数内で使用されなければならず、両方で使用されることはありません。
- 集約された `SELECT` クエリの結果は、ソーステーブル内の「グルーピングキー」のユニークな値の数と同じ行を含みます。通常、これにより行数が大幅に減少しますが、必ずしもそうとは限りません：すべての「グルーピングキー」値が異なる場合、行数は同じままです。

カラム名ではなくカラム番号でテーブルのデータをグループ化したい場合は、設定 [enable_positional_arguments](../../../operations/settings/settings.md#enable-positional-arguments) を有効にしてください。

:::note
テーブルに対して集約を実行する追加の方法があります。クエリに集約関数内のテーブルのカラムのみが含まれている場合、`GROUP BY 句` を省略することができ、空のキーセットによる集約が想定されます。このようなクエリは常に正確に1行を返します。
:::

## NULL の処理 {#null-processing}

グルーピングのために、ClickHouse は [NULL](../../../sql-reference/syntax.md#null-literal) を値として解釈し、`NULL==NULL` とします。これは、他のほとんどのコンテキストでの `NULL` 処理とは異なります。

これが何を意味するかを示す例を示します。

次のテーブルがあると仮定します：

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ `SELECT sum(x), y FROM t_null_big GROUP BY y` の結果は次の通りです：

``` text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL` の `GROUP BY` が `x` を合計したことがわかります。まるで `NULL` がこの値であるかのようです。

複数のキーを `GROUP BY` に渡すと、結果は選択のすべての組み合わせを提供し、`NULL` は特定の値であるかのようになります。

## ROLLUP 修飾子 {#rollup-modifier}

`ROLLUP` 修飾子は、`GROUP BY` リスト内のキー式に基づいて小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計は逆の順序で計算されます：まずリストの最後のキー式に対する小計が計算され、次に前のもの、そして最初のキー式まで進みます。

小計行では、すでに「グループ化された」キー式の値は `0` または空の行に設定されます。

:::note
[HAVING](../../../sql-reference/statements/select/having.md) 句が小計結果に影響を与える可能性があることを理解してください。
:::

**例**

テーブル t を考慮してください：

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

`GROUP BY` セクションに3つのキー式があるため、結果は右から左に「巻き上げられた」小計を持つ4つのテーブルを含みます：

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（`day` カラムにはゼロが填充される）;
- `GROUP BY year`（`month, day` カラムには両方ともゼロが填充される）;
- そして合計（すべての3つのキー式カラムがゼロ）。

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

同じクエリも `WITH` キーワードを使用して書くことができます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**参照**

- SQL 標準の互換性のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## CUBE 修飾子 {#cube-modifier}

`CUBE` 修飾子は、`GROUP BY` リスト内のキー式のすべての組み合わせに対する小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計行では、すべての「グループ化された」キー式の値は `0` または空の行に設定されます。

:::note
[HAVING](../../../sql-reference/statements/select/having.md) 句が小計結果に影響を与える可能性があることを理解してください。
:::

**例**

テーブル t を考慮してください：

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

`GROUP BY` セクションに3つのキー式があるため、結果はすべてのキー式の組み合わせに対する小計を持つ8つのテーブルを含みます：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- そして合計。

`GROUP BY` から除外されたカラムはゼロで填充されます。

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

同じクエリも `WITH` キーワードを使用して書くことができます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**参照**

- SQL 標準の互換性のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## WITH TOTALS 修飾子 {#with-totals-modifier}

`WITH TOTALS` 修飾子が指定されている場合、別の行が計算されます。この行は、キー列がデフォルト値（ゼロまたは空の行）を含み、集約関数の列はすべての行にわたって計算された値（「合計」値）を持ちます。

この追加の行は、`JSON*`、`TabSeparated*`、および `Pretty*` フォーマットでのみ生成され、他の行とは別に出力されます：

- `XML` および `JSON*` フォーマットでは、この行は別の「合計」フィールドとして出力されます。
- `TabSeparated*`、`CSV*`、および `Vertical` フォーマットでは、行は主な結果の後に、空の行に先行して来ます（他のデータの後）。
- `Pretty*` フォーマットでは、行は主な結果の後に別のテーブルとして出力されます。
- `Template` フォーマットでは、行は指定されたテンプレートに従って出力されます。
- 他のフォーマットでは利用できません。

:::note
合計は `SELECT` クエリの結果に出力され、`INSERT INTO ... SELECT` では出力されません。
:::

`WITH TOTALS` は、[HAVING](../../../sql-reference/statements/select/having.md) が存在する場合、異なる方法で実行できます。その動作は `totals_mode` 設定に依存します。

### 合計処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'` です。この場合、「合計」はすべての行に対して計算され、HAVING や `max_rows_to_group_by` を通過しない行も含まれます。

他の代替案は、'totals' に含まれる行が HAVING を通過する行のみを含むことを含むもので、`max_rows_to_group_by` および `group_by_overflow_mode = 'any'` の設定に対して異なる動作をします。

`after_having_exclusive` - `max_rows_to_group_by` を通過しなかった行を含めません。言い換えれば、「合計」は `max_rows_to_group_by` が省略された場合と同じかそれ以下の行数になります。

`after_having_inclusive` - `max_rows_to_group_by` を通過しなかったすべての行を「合計」に含めます。言い換えれば、「合計」は `max_rows_to_group_by` が省略された場合と同じかそれ以上の行数になります。

`after_having_auto` - HAVING を通過した行の数をカウントします。一定の量（デフォルトで50％）を超える場合、`max_rows_to_group_by` を通過しなかったすべての行を「合計」に含めます。そうでない場合は、含めません。

`totals_auto_threshold` - デフォルトは 0.5 です。`after_having_auto` の係数です。

`max_rows_to_group_by` と `group_by_overflow_mode = 'any'` が使用されていない場合、`after_having` のすべてのバリエーションは同じであり、任意のもの（たとえば、`after_having_auto`）を使用できます。

`WITH TOTALS` はサブクエリ内でも、[JOIN](../../../sql-reference/statements/select/join.md) 句内のサブクエリを含む形で利用できます（この場合、関連する合計値が組み合わされます）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` は、集約関数でないすべての SELECT-ed 式をリストすることに相当します。

例えば：

``` sql
SELECT
    a * 2,
    b,
    count(c)
FROM t
GROUP BY ALL
```

は次のように同じです：

``` sql
SELECT
    a * 2,
    b,
    count(c)
FROM t
GROUP BY a * 2, b
```

集約関数と他のフィールドの両方を引数とする関数がある特別な場合、`GROUP BY` キーはそこから抽出できる最大の非集約フィールドを含みます。

例えば：

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

は次のように同じです：

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY substring(a, 4, 2), substring(a, 1, 2)
```

## 例 {#examples}

例：

``` sql
SELECT
    count(),
    median(FetchTiming > 60 ? 60 : FetchTiming),
    count() - sum(Refresh)
FROM hits
```

MySQL とは異なり（標準 SQL に準拠）、キーまたは集約関数に含まれていないあるカラムの値を取得することはできません（定数式を除く）。これを回避するために、最初に出会った値を取得する「any」集約関数または「min/max」を使用できます。

例：

``` sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 各ドメインの最初に出会ったページヘッダーを取得します。
FROM hits
GROUP BY domain
```

異なるキー値が見つかるたびに、`GROUP BY` は集約関数の値を計算します。

## GROUPING SETS 修飾子 {#grouping-sets-modifier}

これは最も一般的な修飾子です。この修飾子は、いくつかの集約キーセット（グルーピングセット）を手動で指定できます。集約は各グルーピングセットごとに別々に行われ、その後、すべての結果が結合されます。

言い換えれば、上記に説明した修飾子はすべて `GROUPING SETS` を介して表現できます。`ROLLUP`、`CUBE` および `GROUPING SETS` 修飾子を含むクエリは文法的に等しいですが、異なる動作をすることがあります。`GROUPING SETS` はすべてを並列で実行しようとする一方で、`ROLLUP` と `CUBE` は集約の最終的なマージを単一スレッドで実行します。

ソースカラムにデフォルト値が含まれている場合、行がキーとしてこれらのカラムを使用する集約の一部かどうかを区別するのが難しいことがあります。この問題を解決するためには、`GROUPING` 関数を使用する必要があります。

**例**

次の2つのクエリは等価です。

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

集約は列指向 DBMS の最も重要な機能の一つであり、そのためその実装は ClickHouse の中で最も最適化された部分の一つです。デフォルトでは、集約はハッシュテーブルを用いてメモリ内で行われます。40種類以上の特化があり、"グルーピングキー" データ型に基づいて自動的に選択されます。

### テーブルソートキーに依存した GROUP BY の最適化 {#group-by-optimization-depending-on-table-sorting-key}

テーブルが特定のキーでソートされている場合、集約はより効果的に行うことができ、`GROUP BY` 式に少なくともソーティングキーの接頭辞または単射関数が含まれている必要があります。この場合、新しいキーがテーブルから読み取られると、集約の中間結果を確定させてクライアントに送信できます。この動作は [optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 設定によって有効化されます。このような最適化は集約中のメモリ使用量を削減しますが、場合によってはクエリの実行が遅くなることがあります。

### 外部メモリでの GROUP BY {#group-by-in-external-memory}

`GROUP BY` 中のメモリ使用量を制限するために、一時データをディスクにダンプすることを有効にできます。[max_bytes_before_external_group_by](../../../operations/settings/query-complexity.md#settings-max_bytes_before_external_group_by) 設定は、`GROUP BY` 一時データをファイルシステムにダンプするための閾値RAM消費量を決定します。0（デフォルト）に設定した場合、無効になります。
あるいは、[max_bytes_ratio_before_external_group_by](../../../operations/settings/query-complexity.md#settings-max_bytes_ratio_before_external_group_by) を設定することにより、クエリが使用されたメモリの特定の閾値に達したときにのみ、外部メモリで `GROUP BY` を使用できるようになります。

`max_bytes_before_external_group_by` を使用する場合、`max_memory_usage` を約2倍（または `max_bytes_ratio_before_external_group_by=0.5`）に設定することをお勧めします。これは、集約には2つのステージがあるためです：データを読み込むことと中間データを形成すること（1）および中間データをマージすること（2）。データをファイルシステムにダンプするのはステージ1の間のみですが、もし一時データがダンプされていなければ、ステージ2ではステージ1と同じ量のメモリが必要になる可能性があります。

例えば、[max_memory_usage](../../../operations/settings/query-complexity.md#settings_max_memory_usage) が 10000000000 に設定されている場合で、外部集約を使用したい場合、`max_bytes_before_external_group_by` を 10000000000 に、`max_memory_usage` を 20000000000 に設定することが理にかなっています。外部集約がトリガーされた場合（一時データが少なくとも1回ダンプされた場合）、RAMの最大消費量は `max_bytes_before_external_group_by` よりもわずかに大きくなります。

分散クエリ処理を使用する場合、外部集約はリモートサーバーで実行されます。リクエスタサーバーが少量のRAMしか使用しないようにするために、`distributed_aggregation_memory_efficient` を 1 に設定します。

ディスクにフラッシュされたデータをマージする際や、`distributed_aggregation_memory_efficient` 設定が有効な場合にリモートサーバーからの結果をマージする際には、RAMの総量の `1/256 * スレッド数` が消費されます。

外部集約が有効になっている場合、`max_bytes_before_external_group_by` から未満のデータがあった場合（つまり、データがフラッシュされなかった場合）、クエリは外部集約なしと同じ速さで実行されます。一時データがフラッシュされた場合、実行時間は数倍長くなります（約三倍）。

`GROUP BY` の後に [ORDER BY](../../../sql-reference/statements/select/order-by.md) があり [LIMIT](../../../sql-reference/statements/select/limit.md) がある場合、使用されるRAMの量は `LIMIT` のデータ量に応じ、テーブル全体の量には依存しません。しかし、`ORDER BY` に `LIMIT` がない場合、外部ソート（`max_bytes_before_external_sort`）を有効にすることを忘れないでください。
