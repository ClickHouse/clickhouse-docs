---
'description': 'GROUP BY 句に関するドキュメント'
'sidebar_label': 'GROUP BY'
'slug': '/sql-reference/statements/select/group-by'
'title': 'GROUP BY 句'
'doc_type': 'reference'
---


# GROUP BY 句

`GROUP BY` 句は `SELECT` クエリを集約モードに切り替え、次のように動作します。

- `GROUP BY` 句には、表現のリスト（または長さ 1 のリストと見なされる単一の表現）が含まれます。このリストは「グルーピングキー」として機能し、各個別の表現は「キー表現」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、および [ORDER BY](/sql-reference/statements/select/order-by.md) 句のすべての表現は、**キー表現に基づいて計算されるか**、**非キー表現（単純なカラムを含む）に対する [集約関数](../../../sql-reference/aggregate-functions/index.md) に基づいて計算されるべきです**。言い換えれば、テーブルから選択された各カラムは、キー表現または集約関数のいずれかで使用されなければならず、両方では使用できません。
- `SELECT` クエリの集約結果には、ソーステーブルの「グルーピングキー」のユニークな値の数と同じ数の行が含まれます。通常、これは行数を大幅に減少させますが、必ずしもそうではありません：すべての「グルーピングキー」の値が異なる場合、行数は同じままです。

テーブルのデータをカラム番号でグループ化したい場合は、設定 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments) を有効にします。

:::note
テーブル上で集約を実行する追加の方法があります。クエリに集約関数内にのみテーブルカラムが含まれている場合、`GROUP BY` 句は省略でき、キーの空のセットによる集約が想定されます。このようなクエリは常に正確に 1 行を返します。
:::

## NULL 処理 {#null-processing}

グルーピングにおいて、ClickHouse は [NULL](/sql-reference/syntax#null) を値として解釈し、`NULL==NULL` とします。この処理は他の多くのコンテキストでの `NULL` 処理とは異なります。

以下にその意味を示す例があります。

次のテーブルがあると仮定します。

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ `SELECT sum(x), y FROM t_null_big GROUP BY y` の結果は次のようになります。

```text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL` のグルーピングに対して、`x` の合計が計算されたことがわかります。まるで `NULL` がこの値であるかのように。

`GROUP BY` に複数のキーを渡すと、結果は選択のすべての組み合わせを提供します。まるで `NULL` が特定の値であるかのように。

## ROLLUP 修飾子 {#rollup-modifier}

`ROLLUP` 修飾子は、`GROUP BY` リスト内のキー表現の順序に基づいて小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計は逆の順序で計算されます：最初にリスト内の最後のキー表現の小計が計算され、その後前のものが続き、最初のキー表現まで行われます。

小計行では、すでに「グループ化された」キー表現の値は `0` または空行になります。

:::note
[HAVING](/sql-reference/statements/select/having.md) 句は小計結果に影響を与える可能性があります。
:::

**例**

テーブル `t` を考えます。

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

`GROUP BY` セクションには 3 つのキー表現があるため、結果には右から左にロールアップされた小計を持つ 4 つのテーブルが含まれます：

- `GROUP BY year, month, day`；
- `GROUP BY year, month` （`day` カラムは 0 で埋められます）；
- `GROUP BY year` （`month, day` カラムは両方とも 0 で埋められます）；
- そして合計（すべてのキー表現カラムは 0 です）。

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

- SQL 標準互換のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## CUBE 修飾子 {#cube-modifier}

`CUBE` 修飾子は、`GROUP BY` リストのキー表現のすべての組み合わせの小計を計算するために使用されます。小計行は結果テーブルの後に追加されます。

小計行では、すべての「グループ化された」キー表現の値は `0` または空行になります。

:::note
[HAVING](/sql-reference/statements/select/having.md) 句は小計結果に影響を与える可能性があることに注意してください。
:::

**例**

テーブル `t` を考えます。

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

`GROUP BY` セクションには 3 つのキー表現があるため、結果にはすべてのキー表現の組み合わせに対する小計を持つ 8 つのテーブルが含まれます：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- そして合計。

`GROUP BY` から除外されたカラムは 0 で埋められます。

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

- SQL 標準互換のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## WITH TOTALS 修飾子 {#with-totals-modifier}

`WITH TOTALS` 修飾子が指定されている場合、別の行が計算されます。この行にはデフォルト値（ゼロまたは空行）を含むキー列があり、集約関数のカラムにはすべての行にわたって計算された値（「合計」値）が入ります。

この追加行は、他の行とは別に、`JSON*`、`TabSeparated*`、および `Pretty*` 形式でのみ生成されます：

- `XML` および `JSON*` 形式では、この行は別の「合計」フィールドとして出力されます。
- `TabSeparated*`、`CSV*` および `Vertical` 形式では、行は主な結果の後に出力され、空の行の前に配置されます（他のデータの後）。
- `Pretty*` 形式では、行は主な結果の後に別のテーブルとして出力されます。
- `Template` 形式では、行は指定されたテンプレートに従って出力されます。
- 他の形式では利用できません。

:::note
合計は `SELECT` クエリの結果に出力され、`INSERT INTO ... SELECT` では出力されません。
:::

`WITH TOTALS` は、[HAVING](/sql-reference/statements/select/having.md) が存在する場合に異なる方法で実行できます。動作は `totals_mode` 設定に依存します。

### 合計処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'` です。この場合、'totals' は HAVING を通過しない行を含むすべての行にわたって計算されます。

他の選択肢には、`HAVING` を通過する行のみを 'totals' に含めるものがあり、`max_rows_to_group_by` および `group_by_overflow_mode = 'any'` 設定と異なる動作をします。

`after_having_exclusive` – `max_rows_to_group_by` を通過しなかった行を含めません。言い換えれば、'totals' は `max_rows_to_group_by` が省略された場合と同じかそれ以下の行数になります。

`after_having_inclusive` – `max_rows_to_group_by` を通過しなかったすべての行を 'totals' に含めます。言い換えれば、'totals' は `max_rows_to_group_by` が省略された場合と同じかそれ以上の行数になります。

`after_having_auto` – HAVING を通過した行数をカウントします。指定した量（デフォルトでは 50%）を超える場合は、`max_rows_to_group_by` を通過しなかったすべての行を 'totals' に含めます。そうでない場合、含めません。

`totals_auto_threshold` – デフォルトは 0.5 です。`after_having_auto` 用の係数です。

`max_rows_to_group_by` および `group_by_overflow_mode = 'any'` が使用されていない場合、`after_having` のすべてのバリエーションは同じであり、いずれかを使用できます（例えば、`after_having_auto`）。

サブクエリ内で `WITH TOTALS` を使用することができ、[JOIN](/sql-reference/statements/select/join.md) 句のサブクエリを含めることもできます（この場合、該当する合計値が組み合わされます）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL` は、集約関数でないすべての SELECT-ed 表現をリストアップすることに相当します。

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

特別な場合として、集約関数と他のフィールドの両方を引数に持つ関数がある場合、`GROUP BY` キーにはそれから抽出できる最大の非集約フィールドが含まれます。

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

MySQL と異なり（および標準 SQL に準拠して）、キーまたは集約関数に含まれないカラムのいくつかの値を取得することはできません（定数表現を除く）。これを回避するために、'any' 集約関数（最初に見つかった値を取得）または 'min/max' を使用できます。

例：

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- getting the first occurred page header for each domain.
FROM hits
GROUP BY domain
```

異なるキー値ごとに、`GROUP BY` は集約関数の値のセットを計算します。

## GROUPING SETS 修飾子 {#grouping-sets-modifier}

これは最も一般的な修飾子です。この修飾子を使用すると、複数の集約キーセット（グルーピングセット）を手動で指定できます。
集約は各グルーピングセットごとに個別に実行され、その後、すべての結果が結合されます。
カラムがグルーピングセットに存在しない場合、デフォルト値で埋められます。

言い換えれば、前述の修飾子は `GROUPING SETS` を介して表現できます。
`ROLLUP`、`CUBE`、および `GROUPING SETS` 修飾子を持つクエリは、構文的には等しいですが、異なる動作をする場合があります。
`GROUPING SETS` はすべてを並行して実行しようとしますが、`ROLLUP` と `CUBE` は集約の最終的なマージを単一のスレッドで実行します。

ソースカラムがデフォルト値を含む場合、行がこれらのカラムをキーとして使用する集約の一部であるかどうかを区別することが難しい場合があります。
この問題を解決するには、`GROUPING` 関数を使用する必要があります。

**例**

次の 2 つのクエリは同等です。

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

**参照**

- SQL 標準互換のための [group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls) 設定。

## 実装の詳細 {#implementation-details}

集約は列指向 DBMS の最も重要な機能の 1 つであるため、その実装は ClickHouse の最も最適化された部分の 1 つです。デフォルトでは、集約はメモリ内でハッシュテーブルを使用して行われます。40 以上の特殊化があり、「グルーピングキー」のデータ型に応じて自動的に選択されます。

### テーブルソートキーに依存する GROUP BY 最適化 {#group-by-optimization-depending-on-table-sorting-key}

テーブルがあるキーでソートされている場合、集約はより効果的に実行できます。`GROUP BY` 表現には、少なくともソートキーのプレフィックスや単射関数が含まれます。この場合、新しいキーがテーブルから読み取られると、集約の中間結果を確定し、クライアントに送信することができます。この動作は、[optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order) 設定によってオンにされます。このような最適化は、集約中のメモリ使用量を減少させますが、場合によってはクエリ実行を遅くすることがあります。

### 外部メモリにおける GROUP BY {#group-by-in-external-memory}

`GROUP BY` 中のメモリ使用量を制限するために、テンポラリデータをディスクにダンプすることを有効にすることができます。
[ max_bytes_before_external_group_by](/operations/settings/settings#max_bytes_before_external_group_by) 設定は、`GROUP BY` テンポラリデータをファイルシステムにダンプするための閾値 RAM 消費量を決定します。0（デフォルト）に設定されている場合、これは無効になります。
あるいは、[max_bytes_ratio_before_external_group_by](/operations/settings/settings#max_bytes_ratio_before_external_group_by) を設定して、特定のメモリ使用量の閾値に達したときにのみ外部メモリで `GROUP BY` を使用できるようにすることができます。

`max_bytes_before_external_group_by` を使用する場合は、`max_memory_usage` を約 2 倍に設定することをお勧めします（または `max_bytes_ratio_before_external_group_by=0.5`）。これは、集約にはデータを読み込むステージ（1）と中間データを形成するステージ（2）の 2 つのステージがあるためです。データをファイルシステムにダンプできるのは、ステージ 1 の間だけです。テンポラリデータがダンプされていない場合、ステージ 2 のメモリ使用量がステージ 1 と同じ量になる可能性があります。

例えば、[max_memory_usage](/operations/settings/settings#max_memory_usage) が 10000000000 に設定され、外部集約を使用したい場合、`max_bytes_before_external_group_by` を 10000000000 に設定し、`max_memory_usage` を 20000000000 に設定することが理にかなっています。外部集約がトリガーされた場合（少なくとも 1 回のテンポラリデータのダンプがあった場合）、RAM の最大消費量は `max_bytes_before_external_group_by` よりわずかに多くなります。

分散クエリ処理を使用すると、外部集約はリモートサーバーで行われます。リクエスターサーバーが少量の RAM のみを使用するようにするには、`distributed_aggregation_memory_efficient` を 1 に設定します。

ディスクにフラッシュされたデータや、`distributed_aggregation_memory_efficient` 設定が有効なリモートサーバーからの結果をマージする際に最大で `1/256 * スレッドの数`の RAM を消費します。

外部集約が有効になると、`max_bytes_before_external_group_by` 未満のデータ（つまり、データがフラッシュされなかった場合）がある場合、クエリは外部集約なしで実行するのと同様に速く実行されます。テンポラリデータがフラッシュされた場合、実行時間は約 3 倍長くなります。

`GROUP BY` の後に [ORDER BY](/sql-reference/statements/select/order-by.md) を持ち [LIMIT](/sql-reference/statements/select/limit.md) がある場合、使用される RAM の量は `LIMIT` のデータ量に依存し、テーブル全体のデータには依存しません。しかし、`ORDER BY` に `LIMIT` がない場合、外部ソートを有効にすることを忘れないでください（`max_bytes_before_external_sort`）。
