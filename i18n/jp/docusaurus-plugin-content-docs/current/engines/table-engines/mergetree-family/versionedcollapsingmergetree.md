---
description: '継続的に変化するオブジェクトの状態を高速に書き込み、古い状態をバックグラウンドで削除できるテーブルエンジンです。'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
title: 'VersionedCollapsingMergeTree テーブルエンジン'
doc_type: 'reference'
---



# VersionedCollapsingMergeTree テーブルエンジン

このエンジンは次のことができます：

- 継続的に変化するオブジェクトの状態を高速に書き込む。
- 古いオブジェクトの状態をバックグラウンドで削除する。これにより必要なストレージ容量を大幅に削減できます。

詳細は [Collapsing](#table_engines_versionedcollapsingmergetree) のセクションを参照してください。

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承し、データパーツのマージアルゴリズムに行の折りたたみロジックを追加します。`VersionedCollapsingMergeTree` は [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) と同じ目的で使用されますが、異なる折りたたみアルゴリズムを採用しており、複数スレッドで任意の順序でデータを挿入できます。特に、`Version` 列は、行が誤った順序で挿入された場合でも、適切に行を折りたたむのに役立ちます。これに対して、`CollapsingMergeTree` は厳密に連続した順序での挿入のみをサポートします。



## テーブルの作成

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = VersionedCollapsingMergeTree(sign, version)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

クエリパラメータの説明は、[クエリの説明](../../../sql-reference/statements/create/table.md)を参照してください。

### エンジンのパラメータ

```sql
VersionedCollapsingMergeTree(サイン, バージョン)
```

| パラメータ     | 説明                                              | 型                                                                                                                                                                                                                                                                                              |
| --------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign`    | 行の種類を示す列の名前。`1` は「state」行、`-1` は「cancel」行を表します。 | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                                   |
| `version` | オブジェクト状態のバージョンを表す列の名前。                          | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64) |

### クエリ句

`VersionedCollapsingMergeTree` テーブルを作成する際は、`MergeTree` テーブルを作成する場合と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">
  <summary>テーブル作成の非推奨メソッド</summary>

  :::note
  新しいプロジェクトではこの方法を使用しないでください。可能であれば、既存プロジェクトも上で説明した方法に切り替えてください。
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
  ```

  `sign` と `version` 以外のすべてのパラメータは、`MergeTree` における意味と同じです。

  * `sign` — 行の種類を示す列の名前。`1` は「state」行、`-1` は「cancel」行を表します。

    列のデータ型 — `Int8`。

  * `version` — オブジェクト状態のバージョンを表す列の名前。

    列のデータ型は `UInt*` である必要があります。
</details>


## 折りたたみ（Collapsing）

### データ

あるオブジェクトについて、継続的に変化するデータを保存する必要がある状況を考えます。オブジェクトごとに 1 行を持ち、変更があるたびにその行を更新するのは合理的に思えます。しかし、更新操作はストレージ上のデータを書き換える必要があるため、DBMS にとっては高コストかつ低速です。データを高速に書き込む必要がある場合、更新は適していませんが、その代わりにオブジェクトに対する変更を次のように逐次書き込むことができます。

行を書き込むときに `Sign` 列を使用します。`Sign = 1` の場合、その行はオブジェクトの状態を表す（これを「state 行」と呼びます）ことを意味します。`Sign = -1` の場合、同じ属性を持つオブジェクトの状態を取り消す（これを「cancel 行」と呼びます）ことを意味します。また、`Version` 列も使用し、オブジェクトの各状態を一意の番号で識別します。

たとえば、あるサイトでユーザーが閲覧したページ数と、そのページに滞在した時間を集計したいとします。ある時点で、ユーザーのアクティビティ状態を表す次の行を書き込みます。

```text
┌──────────────ユーザーID─┬─ページビュー数─┬─滞在時間─┬─署名─┬─バージョン─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

後でユーザーアクティビティの変更を記録し、それを次の 2 行で書き込みます。

```text
┌──────────────UserID─┬─ページビュー数─┬─継続時間─┬─符号─┬─バージョン─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行は、オブジェクト（ユーザー）の以前の状態を取り消します。この行には、`Sign` 以外の、取り消される状態のすべてのフィールドをコピーして含める必要があります。

2 行目には現在の状態が含まれます。

ユーザーアクティビティの最後の状態だけが必要なため、これらの行は

```text
┌──────────────ユーザーID─┬─ページビュー─┬─継続時間─┬─サイン─┬─バージョン─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

は削除され、オブジェクトの無効（古い）状態が折りたたまれます。`VersionedCollapsingMergeTree` は、データパートをマージする際にこれを行います。

各変更ごとに 2 行が必要な理由については、[Algorithm](#table_engines-versionedcollapsingmergetree-algorithm) を参照してください。

**使用上の注意**

1. データを書き込むプログラムは、取り消しができるようにオブジェクトの状態を保持しておく必要があります。&quot;Cancel&quot; 文字列には、主キーのフィールドのコピー、&quot;state&quot; 文字列のバージョン、および反対の `Sign` を含める必要があります。これにより初期のストレージ使用量は増加しますが、高速にデータを書き込むことができます。
2. 列内で長く伸び続ける配列は、書き込み時の負荷によりエンジンの効率を低下させます。データが単純であればあるほど効率は高くなります。
3. `SELECT` の結果は、オブジェクト変更履歴の一貫性に大きく依存します。挿入するデータを準備する際は注意してください。セッション深度のような本来非負であるメトリクスに対して負の値が得られるなど、不整合なデータでは予測不能な結果になる可能性があります。

### Algorithm

ClickHouse がデータパートをマージする際、同じ主キーとバージョンを持ち、`Sign` が異なる行のペアを削除します。行の順序は関係ありません。

ClickHouse がデータを挿入する際には、行は主キーでソートされます。`Version` 列が主キーに含まれていない場合、ClickHouse はそれを暗黙的に主キーの最後のフィールドとして追加し、その並び替えに使用します。


## データの選択 {#selecting-data}

ClickHouse は、同じプライマリキーを持つすべての行が、同じ結果のデータパート内、あるいは同じ物理サーバー上に存在することを保証しません。これは、データを書き込むときと、その後にデータパートをマージするときの両方について当てはまります。さらに、ClickHouse は `SELECT` クエリを複数スレッドで処理するため、結果の行の順序を予測できません。つまり、`VersionedCollapsingMergeTree` テーブルから完全に「折りたたまれた」データを取得する必要がある場合は、集約処理が必要になります。

折りたたみを最終的に確定させるには、`GROUP BY` 句と、符号を考慮した集約関数を使ってクエリを書きます。たとえば数量を計算するには、`count()` の代わりに `sum(Sign)` を使用します。何らかの合計を計算するには、`sum(x)` の代わりに `sum(Sign * x)` を使用し、さらに `HAVING sum(Sign) > 0` を追加します。

`count`、`sum`、`avg` といった集約は、この方法で計算できます。`uniq` 集約は、オブジェクトに少なくとも 1 つの未折りたたみ状態がある場合に計算できます。`min` および `max` 集約は、`VersionedCollapsingMergeTree` が折りたたまれた状態の値の履歴を保存しないため、計算できません。

集約なしで「折りたたみ」を行ったデータを抽出する必要がある場合（たとえば、最新の値が特定の条件に一致する行が存在するかを確認する場合）は、`FROM` 句に対して `FINAL` 修飾子を使用できます。このアプローチは非効率的であり、大きなテーブルには使用すべきではありません。



## 使用例

サンプルデータ：

```text
┌──────────────ユーザーID─┬─ページビュー─┬─滞在時間─┬─符号─┬─バージョン─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

テーブルの作成：

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8,
    Version UInt8
)
ENGINE = VersionedCollapsingMergeTree(Sign, Version)
ORDER BY UserID
```

データを挿入する:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

2つの `INSERT` クエリを使用して、2つの異なるデータパーツを作成します。1つのクエリでデータを挿入した場合、ClickHouse は1つのデータパーツしか作成せず、マージ処理は行いません。

データの取得:

```sql
SELECT * FROM UAct
```

```text
┌──────────────ユーザーID─┬─ページビュー─┬─滞在時間─┬─符号─┬─バージョン─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────ユーザーID─┬─ページビュー─┬─滞在時間─┬─符号─┬─バージョン─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

ここで何が起きていて、折りたたまれるはずの部分はどこにあるのでしょうか？
2 つの `INSERT` クエリを使って 2 つのデータパーツを作成しました。`SELECT` クエリは 2 つのスレッドで実行され、その結果、行の並び順はランダムになっています。
データパーツはまだマージされていないため、折りたたみは発生していません。ClickHouse は、いつ行われるか予測できないタイミングでデータパーツをマージします。

だからこそ、集約が必要になります。

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration,
    Version
FROM UAct
GROUP BY UserID, Version
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │       2 │
└─────────────────────┴───────────┴──────────┴─────────┘
```

集約が不要で、強制的に折りたたみを行いたい場合は、`FROM` 句に `FINAL` 修飾子を指定できます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────ユーザーID─┬─ページビュー─┬─滞在時間─┬─サイン─┬─バージョン─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これはデータを抽出する非常に非効率な方法です。大規模なテーブルには使用しないでください。
