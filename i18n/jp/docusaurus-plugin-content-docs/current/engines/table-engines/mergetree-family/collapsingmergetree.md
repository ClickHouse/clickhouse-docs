---
description: 'MergeTree をベースとしており、マージ処理中に行を折りたたむためのロジックを追加したものです。'
keywords: ['更新', '折りたたみ']
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: /engines/table-engines/mergetree-family/collapsingmergetree
title: 'CollapsingMergeTree テーブルエンジン'
doc_type: 'guide'
---

# CollapsingMergeTree テーブルエンジン \{#collapsingmergetree-table-engine\}

## 説明 \{#description\}

`CollapsingMergeTree` エンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)
を継承し、マージ処理中に行を折りたたむ（コラプスする）ためのロジックを追加します。
`CollapsingMergeTree` テーブルエンジンは、特別なフィールド `Sign` を除くソートキー（`ORDER BY`）内のすべてのフィールドが等しく、
かつ `Sign` フィールドの値が `1` または `-1` である行のペアを非同期に削除（折りたたみ）します。
`Sign` が反対の値を持つ対応する行のペアが存在しない行は保持されます。

詳細については、このドキュメントの [Collapsing](#table_engine-collapsingmergetree-collapsing) セクションを参照してください。

:::note
このエンジンはストレージ容量を大幅に削減でき、
その結果として `SELECT` クエリの効率を高めることができます。
:::

## パラメータ \{#parameters\}

このテーブルエンジンのすべてのパラメータは、`Sign` パラメータを除き、
[`MergeTree`](/engines/table-engines/mergetree-family/mergetree) における同名パラメータと同じ意味を持ちます。

- `Sign` — 行の種別を示す列に付ける名前で、`1` は「状態」行、`-1` は「取消」行を表します。型: [Int8](/sql-reference/data-types/int-uint)。

## テーブルの作成 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE = CollapsingMergeTree(Sign)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

<details markdown="1">
  <summary>テーブル作成の非推奨メソッド</summary>

  :::note
  以下のメソッドは新しいプロジェクトでの使用は推奨されません。
  可能であれば、既存のプロジェクトを更新し、新しいメソッドを使用することを推奨します。
  :::

  ```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
```

  `Sign` — `1` が「state」行、`-1` が「cancel」行を表す行種別を持つカラムに付ける名前です。[Int8](/sql-reference/data-types/int-uint)。
</details>

* クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。
* `CollapsingMergeTree` テーブルを作成する場合は、`MergeTree` テーブルを作成する場合と同じ [クエリ句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) が必要です。

## Collapsing \{#table_engine-collapsingmergetree-collapsing\}

### Data \{#data\}

あるオブジェクトに対して、継続的に変化するデータを保存する必要がある状況を考えます。
各オブジェクトにつき 1 行だけを持ち、何か変更があるたびにその行を更新する、というのは論理的に思えますが、
更新処理はストレージ上のデータを書き直す必要があるため、DBMS にとって高コストかつ低速です。
データを高速に書き込む必要がある場合、大量の更新を行う方法は現実的ではありませんが、
あるオブジェクトに対する変更を逐次的に書き込むことはいつでもできます。
そのために、専用のカラム `Sign` を利用します。

* `Sign` = `1` の場合、その行は「状態」行を意味します：*現在の有効な状態を表すフィールドを含む行*。
* `Sign` = `-1` の場合、その行は「キャンセル」行を意味します：*同じ属性を持つオブジェクトの状態をキャンセルするために使用される行*。

例えば、あるウェブサイトでユーザーが閲覧したページ数および滞在時間を計算したいとします。
ある時点で、ユーザーアクティビティの状態を表す次の行を書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

後のタイミングでユーザーアクティビティの変化を検出し、次の 2 行として書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

最初の行は、（この場合はユーザーを表す）オブジェクトの以前の状態を打ち消します。
この「canceled」行では、`Sign` を除くすべてのソートキーのフィールドをコピーする必要があります。
その上の 2 行目が現在の状態を表しています。

ユーザーアクティビティの最後の状態だけが必要なため、元の「state」行と、挿入した「cancel」行は、次のように削除して、オブジェクトの無効（古い）状態を畳み込むことができます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` は、データパーツのマージが行われる際に、まさにこの *collapsing（折りたたみ）* 動作を実行します。

:::note
各変更に対して行が 2 行必要となる理由については、
[Algorithm](#table_engine-collapsingmergetree-collapsing-algorithm) の節でさらに詳しく説明します。
:::

**このアプローチ特有の注意点**

1. データを書き込むプログラムは、取り消しを行えるように、オブジェクトの状態を保持しておく必要があります。「cancel」行には、「state」行のソートキー項目のコピーと、反対の `Sign` を含める必要があります。これにより初期のストレージサイズは増加しますが、データを高速に書き込めるようになります。
2. カラム内で長く伸び続ける配列は、書き込み負荷の増大によりエンジンの効率を低下させます。データが単純であればあるほど効率は高くなります。
3. `SELECT` の結果は、オブジェクト変更履歴の一貫性に大きく依存します。挿入用データを準備する際には注意してください。一貫性のないデータでは予測不能な結果が生じる可能性があります。たとえば、セッション深度のような非負のメトリクスに対して負の値が出力されることがあります。

### Algorithm \{#table_engine-collapsingmergetree-collapsing-algorithm\}

ClickHouse がデータ[パーツ](/concepts/glossary#parts)をマージする際、
同じソートキー（`ORDER BY`）を持つ連続した行の各グループは、高々 2 行にまでまとめられます。
すなわち、`Sign` = `1` の「state」行と、`Sign` = `-1` の「cancel」行です。
言い換えると、ClickHouse ではエントリが collapsing（折りたたみ）されます。

各結果データパーツごとに、ClickHouse は次のように保存します。

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 「state」行と「cancel」行の数が一致し、かつ最後の行が「state」行である場合、最初の「cancel」行と最後の「state」行。              |
|2.| 「state」行の方が「cancel」行より多い場合、最後の「state」行。                                                                      |
|3.| 「cancel」行の方が「state」行より多い場合、最初の「cancel」行。                                                                      |
|4.| 上記以外のすべての場合、いずれの行も保存しない。                                                                                    |

さらに、「state」行が「cancel」行より少なくとも 2 行多い場合、または「cancel」行が「state」行より少なくとも 2 行多い場合は、マージ処理は継続されます。
ただし、ClickHouse はこの状況を論理エラーと見なし、サーバーログに記録します。
同じデータが複数回挿入された場合に、このエラーが発生することがあります。
したがって、collapsing によって統計値の計算結果が変わることはありません。
変更は徐々に collapse されていき、最終的にはほぼすべてのオブジェクトについて最後の状態だけが残されます。

`Sign` 列が必要なのは、マージアルゴリズムが、同じソートキーを持つすべての行が同じ結果データパーツ、さらには同じ物理サーバー上に入ることを保証しないためです。
ClickHouse は複数スレッドで `SELECT` クエリを処理するため、結果における行の順序を予測できません。

`CollapsingMergeTree` テーブルから完全に「collapse された」データを取得する必要がある場合は、集約処理が必要です。
collapsing を最終確定させるには、`GROUP BY` 句と、`Sign` を考慮した集約関数を使ってクエリを書きます。
例えば、件数を計算するには `count()` の代わりに `sum(Sign)` を使用します。
ある値の合計を計算するには、`sum(x)` の代わりに `sum(Sign * x)` と `HAVING sum(Sign) > 0` を併用します。
下記の[例](#example-of-use)のようにします。

集約関数 `count`、`sum`、`avg` はこの方法で計算できます。
オブジェクトに少なくとも 1 つの collapse されていない状態が存在する場合、集約関数 `uniq` も計算できます。
一方で、`min` と `max` は計算できません。  
これは、`CollapsingMergeTree` が collapse された状態の履歴を保存しないためです。

:::note
集約を行わずにデータを取り出す必要がある場合
（例えば、最新の値が特定の条件に一致する行が存在するかどうかを確認する場合など）は、
`FROM` 句に対して [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修飾子を使用できます。これは、結果を返す前にデータをマージします。
`CollapsingMergeTree` では、各キーごとに最新の「state」行のみが返されます。
:::

## 例 \{#examples\}

### 使用例 \{#example-of-use\}

次のサンプルデータを前提とします。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

次に、`CollapsingMergeTree` を使用してテーブル `UAct` を作成します。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

次に、データを挿入します。

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

2つの異なるデータパーツを作成するために、2つの `INSERT` クエリを使用します。

:::note
1つのクエリでデータを挿入すると、ClickHouse は1つのデータパーツしか作成せず、その後マージを一切実行しません。
:::

次のようにしてデータを取得できます：

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

上で返されたデータを見て、collapsing が発生したかどうか確認してみましょう。
2 つの `INSERT` クエリで、2 つのデータパーツを作成しました。
`SELECT` クエリは 2 つのスレッドで実行され、行の順序はランダムになりました。
しかし、データパーツのマージはまだ行われておらず、
ClickHouse はデータパーツを予測できないタイミングでバックグラウンドでマージするため、
**collapsing は発生しませんでした**。

そのため、集約処理を行う必要があります。
ここでは、[`sum`](/sql-reference/aggregate-functions/reference/sum)
集約関数と [`HAVING`](/sql-reference/statements/select/having) 句を使って集約を実行します。

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

集約が不要で、行の折りたたみを強制したい場合は、`FROM` 句に `FINAL` 修飾子を指定することもできます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

:::note
このようなデータの選択方法は効率が悪く、スキャン対象データが多い場合（数百万行規模）には使用しないことを推奨します。
:::

### 別のアプローチの例 \{#example-of-another-approach\}

このアプローチの考え方は、マージ処理がキー列のみを考慮するという点にあります。
そのため「cancel」行では、`Sign` 列を使用せずに集計したときにその行の以前のバージョンと相殺されるような
負の値を指定できます。

この例では、以下のサンプルデータを使用します。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

この方法では、負の値を保存できるようにするために、`PageViews` と `Duration` のデータ型を変更する必要があります。
そのため、テーブル `UAct` を `collapsingMergeTree` を使って作成する際に、これらの列の型を `UInt8` から `Int16` に変更します。

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews Int16,
    Duration Int16,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

テーブルにデータを挿入して、このアプローチをテストしてみましょう。

しかし、例や小さなテーブルの場合であれば問題ありません。

```sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

```sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

```sql
SELECT COUNT() FROM UAct
```

```text
┌─count()─┐
│       3 │
└─────────┘
```

```sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
