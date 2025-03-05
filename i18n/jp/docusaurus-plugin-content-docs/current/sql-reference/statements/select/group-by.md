---
slug: /sql-reference/statements/select/group-by
sidebar_label: GROUP BY
---


# GROUP BY句

`GROUP BY`句は`SELECT`クエリを集約モードに切り替え、次のように機能します。

- `GROUP BY`句には、式のリスト（または長さ1のリストと見なされる単一の式）が含まれます。このリストは「グルーピングキー」として機能し、各個々の式は「キー式」と呼ばれます。
- [SELECT](/sql-reference/statements/select/index.md)、[HAVING](/sql-reference/statements/select/having.md)、および[ORDER BY](/sql-reference/statements/select/order-by.md)句内のすべての式は、**キー式に基づいて計算されるか**、非キー式（プレーンカラムを含む）の集約関数の上で計算される必要があります。言い換えれば、テーブルから選択された各カラムは、キー式のいずれかで使用されるか、集約関数の内部で使用される必要がありますが、両方ではありません。
- 集約された`SELECT`クエリの結果は、ソーステーブル内の「グルーピングキー」の固有値の数だけの行を含みます。通常、これにより行数が大幅に削減されますが、必ずしもそうではありません：すべての「グルーピングキー」値が異なる場合、行数は同じままです。

テーブル内のカラム番号でデータをグループ化したい場合は、設定を有効にしてください[enable_positional_arguments](/operations/settings/settings.md#enable-positional-arguments)。

:::note
テーブルに対して集約を実行する別の方法があります。もしクエリが集約関数内のテーブルカラムのみを含む場合、`GROUP BY句`は省略可能で、キーの空のセットによる集約が仮定されます。そのようなクエリは常に正確に1行を返します。
:::

## NULLの処理 {#null-processing}

グループ化のために、ClickHouseは[NULL](/sql-reference/syntax#null)を値として解釈し、`NULL==NULL`とします。これは他のほとんどのコンテキストでの`NULL`処理とは異なります。

これが何を意味するかを示す例を挙げてみましょう。

次のテーブルを考えます：

``` text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

クエリ `SELECT sum(x), y FROM t_null_big GROUP BY y` の結果は次のようになります：

``` text
┌─sum(x)─┬────y─┐
│      4 │    2 │
│      3 │    3 │
│      5 │ ᴺᵁᴸᴸ │
└────────┴──────┘
```

`y = NULL`の`GROUP BY`は、あたかも`NULL`がこの値であるかのように`x`を合計しました。

`GROUP BY`に複数のキーを渡すと、結果は選択のすべての組み合わせを返します。あたかも`NULL`が特定の値であるかのように。

## ROLLUP修飾子 {#rollup-modifier}

`ROLLUP`修飾子は、`GROUP BY`リスト内のキー式に基づいて合計を計算するために使用されます。合計行は結果テーブルの後に追加されます。

合計は逆の順序で計算されます：まずリストの最後のキー式の合計が計算され、次に前のもの、そして最初のキー式まで続きます。

合計行では、すでに「グループ化された」キー式の値が`0`または空の行に設定されます。

:::note
注意してください：[HAVING](/sql-reference/statements/select/having.md)句は合計結果に影響を与えることがあります。
:::

**例**

テーブルtを考慮します：

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
`GROUP BY`セクションには3つのキー式があるため、結果は右から左に合計が「巻き上げられた」4つのテーブルを含みます。

- `GROUP BY year, month, day`;
- `GROUP BY year, month`（このとき`day`カラムはゼロで埋まります）;
- `GROUP BY year`（このとき`month, day`両カラムはゼロで埋まります）;
- 合計（このときすべての3つのキー式カラムはゼロです）。

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
同じクエリは`WITH`キーワードを使用しても書くことができます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH ROLLUP;
```

**参照してください**

- SQL標準の互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## CUBE修飾子 {#cube-modifier}

`CUBE`修飾子は、`GROUP BY`リストの各キー式の組み合わせごとに合計を計算するために使用されます。合計行は結果テーブルの後に追加されます。

合計行では、すべての「グループ化された」キー式の値が`0`または空の行に設定されます。

:::note
注意してください：[HAVING](/sql-reference/statements/select/having.md)句は合計結果に影響を与えることがあります。
:::

**例**

テーブルtを考慮します：

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

`GROUP BY`セクションには3つのキー式があるため、結果はすべてのキー式の組み合わせに対する8つのテーブルを含みます：

- `GROUP BY year, month, day`
- `GROUP BY year, month`
- `GROUP BY year, day`
- `GROUP BY year`
- `GROUP BY month, day`
- `GROUP BY month`
- `GROUP BY day`
- 合計。

`GROUP BY`から除外された列はゼロで埋まります。

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
同じクエリは`WITH`キーワードを使用しても書くことができます。
```sql
SELECT year, month, day, count(*) FROM t GROUP BY year, month, day WITH CUBE;
```

**参照してください**

- SQL標準の互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## WITH TOTALS修飾子 {#with-totals-modifier}

`WITH TOTALS`修飾子が指定されると、別の行が計算されます。この行は、デフォルト値（ゼロまたは空の行）を含むキー列を持ち、全行にわたる集約関数の列には計算された値（「合計」値）が含まれます。

この追加の行は、`JSON*`、`TabSeparated*`、および`Pretty*`フォーマットでのみ、他の行とは別に生成されます。

- `XML`および`JSON*`フォーマットでは、この行は別の「合計」フィールドとして出力されます。
- `TabSeparated*`、`CSV*`、および`Vertical`フォーマットでは、行は主な結果の後に不完全行（他のデータの後）に続いて来ます。
- `Pretty*`フォーマットでは、行は主な結果の後に別のテーブルとして出力されます。
- `Template`フォーマットでは、行は指定されたテンプレートに応じて出力されます。
- 他のフォーマットでは利用できません。

:::note
合計は`SELECT`クエリの結果に出力され、`INSERT INTO ... SELECT`では出力されません。
:::

`WITH TOTALS`は、[HAVING](/sql-reference/statements/select/having.md)が存在する場合に異なる方法で実行できます。動作は`totals_mode`設定に依存します。

### 合計の処理の設定 {#configuring-totals-processing}

デフォルトでは、`totals_mode = 'before_having'`です。この場合、「合計」は`HAVING`や`max_rows_to_group_by`を通過しない行も含めて、すべての行にわたって計算されます。

他の代替案には、`HAVING`を通過した行のみを「合計」に含め、`max_rows_to_group_by`および`group_by_overflow_mode = 'any'`設定に対して異なる動作をします。

`after_having_exclusive` – `max_rows_to_group_by`を通過しなかった行を含めません。言い換えれば、「合計」は、`max_rows_to_group_by`を省略した場合の行数よりも少ないか、同じ数になります。

`after_having_inclusive` – 「合計」には、「max_rows_to_group_by」を通過しなかったすべての行を含めます。言い換えれば、「合計」は、`max_rows_to_group_by`を省略した場合の行数よりも多いか、同じ数になります。

`after_having_auto` – `HAVING`を通過した行の数を数えます。もし、それが特定の量（デフォルトでは50％）を超えた場合、`max_rows_to_group_by`を通過しなかったすべての行を「合計」に含めます。そうでなければ、含めません。

`totals_auto_threshold` – デフォルトでは0.5。`after_having_auto`の係数です。

`max_rows_to_group_by`および`group_by_overflow_mode = 'any'`が使用されない場合、`after_having`のすべてのバリエーションは同じであり、任意のものを使用することができます（例えば、`after_having_auto`）。

`WITH TOTALS`は、サブクエリ内でも使用可能で、[JOIN](/sql-reference/statements/select/join.md)句内のサブクエリを含みます（この場合、関連する合計値が結合されます）。

## GROUP BY ALL {#group-by-all}

`GROUP BY ALL`は、集約関数ではないすべてのSELECTされた式を列挙するのと同じです。

例えば：

``` sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY ALL
```

は次のように同じです。

``` sql
SELECT
    a * 2,
    b,
    count(c),
FROM t
GROUP BY a * 2, b
```

特殊なケースとして、集約関数と他のフィールドの両方を引数に持つ関数がある場合、`GROUP BY`のキーには、そこから抽出できる最大の非集約フィールドが含まれます。

例えば：

``` sql
SELECT
    substring(a, 4, 2),
    substring(substring(a, 1, 2), 1, count(b))
FROM t
GROUP BY ALL
```

は次のように同じです。

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

MySQLとは異なり（および標準SQLに準拠して）、キーまたは集約関数に含まれていないカラムの値を取得することはできません（定数式を除く）。この制約を回避するために、'any'集約関数（最初に遭遇した値を取得）または'min/max'を使用できます。

例：

``` sql
SELECT
    domainWithoutWWW(URL) AS domain,
    count(),
    any(Title) AS title -- 各ドメインの最初に発生したページヘッダーを取得。
FROM hits
GROUP BY domain
```

異なるキー値に遭遇するたびに、`GROUP BY`は集約関数の値のセットを計算します。

## GROUPING SETS修飾子 {#grouping-sets-modifier}

これは最も一般的な修飾子です。この修飾子を使用すると、複数の集約キーセット（グルーピングセット）を手動で指定できます。集約は各グルーピングセットごとに個別に実行され、その後、すべての結果が結合されます。グルーピングセットにカラムが表示されていない場合、それにはデフォルト値が入力されます。

言い換えれば、上記で説明した修飾子は`GROUPING SETS`を通じて表すことができます。
`ROLLUP`、`CUBE`、および`GROUPING SETS`修飾子を持つクエリは文法的には等しいですが、異なる動作をする場合があります。
`GROUPING SETS`がすべてを並行して実行しようとする場合、`ROLLUP`と`CUBE`は集約の最終的なマージを単一スレッドで実行します。

ソースカラムにデフォルト値が含まれている場合、行がそれらのカラムをキーとして使用する集計の一部であるかどうかを区別することが難しい場合があります。
この問題を解決するには、`GROUPING`関数を使用する必要があります。

**例**

次の2つのクエリは等しいです。

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

**参照してください**

- SQL標準の互換性のための[group_by_use_nulls](/operations/settings/settings.md#group_by_use_nulls)設定。

## 実装の詳細 {#implementation-details}

集約は列指向DBMSの最も重要な機能の一つであり、その実装はClickHouseの最も最適化された部分の一つです。デフォルトでは、集約はメモリ内でハッシュテーブルを使用して行われます。これは「グルーピングキー」のデータ型に応じて自動的に選ばれる40以上の特化が含まれています。

### テーブルのソートキーに依存したGROUP BYの最適化 {#group-by-optimization-depending-on-table-sorting-key}

テーブルがあるキーでソートされている場合、`GROUP BY`式が少なくともソートキーのプレフィックスまたは単射関数を含むと、集約をより効果的に実行できます。この場合、新しいキーがテーブルから読み込まれると、集約の中間結果を確定し、クライアントに送信できます。この動作は、[optimize_aggregation_in_order](../../../operations/settings/settings.md#optimize_aggregation_in_order)設定で切り替えることができます。このような最適化は、集約中のメモリの使用量を減らしますが、場合によってはクエリの実行を遅くする可能性があります。

### 外部メモリでのGROUP BY {#group-by-in-external-memory}

`GROUP BY`中のメモリ使用量を制限するために、一時データをディスクにダンプすることを有効にできます。
[削除前の外部GROUP BYの最大バイト数](/operations/settings/query-complexity.md#settings-max_bytes_before_external_group_by)設定は、`GROUP BY`の一時データをファイルシステムにダンプする際のRAM消費の閾値を決定します。0に設定されていると（デフォルト）、無効になります。
または、[外部GROUP BYの最大バイト比](/operations/settings/query-complexity.md#settings-max_bytes_ratio_before_external_group_by)を設定することで、クエリが使用するメモリの特定の閾値に達するまでは、外部メモリで`GROUP BY`を使用することができます。

`max_bytes_before_external_group_by`を使用する場合は、`max_memory_usage`を約2倍高く設定することをお勧めします（または`max_bytes_ratio_before_external_group_by=0.5`）。これは、集約にはデータを読み取る段階（1）と中間データを形成する段階（2）があるため必要です。一時データをファイルシステムにダンプできるのは段階1の間だけです。一時データがダンプされなかった場合、段階2では段階1と同程度のメモリが必要な場合があります。

例えば、[max_memory_usage](/operations/settings/query-complexity.md#settings_max_memory_usage)が10000000000に設定され、外部集約を使用したい場合、`max_bytes_before_external_group_by`を10000000000に、`max_memory_usage`を20000000000に設定するのが理にかなっています。外部集約がトリガーされた場合（少なくとも1回の一時データのダンプがあった場合）、最大RAM消費量は`max_bytes_before_external_group_by`を少し超えるだけです。

分散クエリ処理の場合、外部集約はリモートサーバーで実行されます。リクエスターサーバーが少量のRAMのみを使用するためには、`distributed_aggregation_memory_efficient`を1に設定します。

ディスクにフラッシュされたデータをマージする際にも、リモートサーバーからの結果をマージする際にも、`distributed_aggregation_memory_efficient`設定が有効になっている場合、使用されるRAMは最大で`1/256 * スレッド数`です。

外部集約が有効になっている場合、`max_bytes_before_external_group_by`未満のデータ（つまりデータがフラッシュされていない）であった場合、クエリは外部集約なしで実行するのと同じくらい速く実行されます。もし一時データがフラッシュされた場合、実行時間は数倍長くなります（約3倍）。

`GROUP BY`の後に[ORDER BY](/sql-reference/statements/select/order-by.md)があり、[LIMIT](/sql-reference/statements/select/limit.md)がある場合、使用されるRAMの量は`LIMIT`内のデータの量に依存し、テーブル全体には依存しません。しかし、`ORDER BY`に`LIMIT`がない場合は、外部ソートを有効にすることを忘れないでください（`max_bytes_before_external_sort`）。
