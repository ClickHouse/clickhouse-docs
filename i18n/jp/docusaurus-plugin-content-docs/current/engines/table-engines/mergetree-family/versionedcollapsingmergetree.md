---
'description': 'オブジェクトの状態が継続的に変化する場合の迅速な書き込みを許可し、古いオブジェクトの状態をバックグラウンドで削除します。'
'sidebar_label': 'VersionedCollapsingMergeTree'
'sidebar_position': 80
'slug': '/engines/table-engines/mergetree-family/versionedcollapsingmergetree'
'title': 'VersionedCollapsingMergeTree'
'doc_type': 'reference'
---


# VersionedCollapsingMergeTree

このエンジンは以下を可能にします：

- 継続的に変化するオブジェクトの状態を迅速に書き込むこと。
- 古いオブジェクトの状態をバックグラウンドで削除します。これにより、ストレージのボリュームが大幅に減少します。

詳細はセクション [Collapsing](#table_engines_versionedcollapsingmergetree) をご覧ください。

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承し、データパーツのマージアルゴリズムに行の縮小に関するロジックを追加します。 `VersionedCollapsingMergeTree` は [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) と同じ目的を果たしますが、複数のスレッドでデータを任意の順序で挿入することを可能にする異なる縮小アルゴリズムを使用します。特に、`Version` カラムは、行が間違った順序で挿入されていても、行を適切に縮小するのに役立ちます。一方、`CollapsingMergeTree` は厳密に連続した挿入のみを許可します。

## テーブルの作成 {#creating-a-table}

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

クエリパラメータの説明については、[クエリの説明](../../../sql-reference/statements/create/table.md) を参照してください。

### エンジンパラメータ {#engine-parameters}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| パラメータ   | 説明                                                                             | 種類                                                                                                                                                                                                                                                                                    |
|-----------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 行のタイプを持つカラムの名前：`1` は「状態」行、`-1` は「キャンセル」行です。                    | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                    |
| `version` | オブジェクトの状態のバージョンを持つカラムの名前です。                                     | [`Int*`](/sql-reference/data-types/int-uint)、[`UInt*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`Date32`](/sql-reference/data-types/date32)、[`DateTime`](/sql-reference/data-types/datetime) または [`DateTime64`](/sql-reference/data-types/datetime64) |

### クエリ句 {#query-clauses}

`VersionedCollapsingMergeTree` テーブルを作成する場合、`MergeTree` テーブルを作成するのと同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトでこの方法を使用しないでください。可能であれば、古いプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

`sign` と `version` を除くすべてのパラメータは `MergeTree` での意味と同じです。

- `sign` — 行のタイプを持つカラムの名前：`1` は「状態」行、`-1` は「キャンセル」行です。

    カラムデータ型 — `Int8`。

- `version` — オブジェクトの状態のバージョンを持つカラムの名前です。

    カラムデータ型は `UInt*` である必要があります。

</details>

## 縮小 {#table_engines_versionedcollapsingmergetree}

### データ {#data}

あるオブジェクトの継続的に変化するデータを保存する必要がある状況を考えてみましょう。オブジェクトごとに1行を持ち、変更があるたびにその行を更新するのが合理的です。しかし、更新操作はデータベース管理システム (DBMS) にとって高コストで遅く、ストレージ内のデータを再書き込みしなければならないため、迅速にデータを書き込む必要がある場合には更新は受け入れられません。そのため、変更を次のように順次オブジェクトに書き込むことができます。

行を書くときに `Sign` カラムを使用します。 `Sign = 1` の場合、その行はオブジェクトの状態を示します（これを「状態」行と呼びましょう）。 `Sign = -1` の場合、同じ属性を持つオブジェクトの状態がキャンセルされたことを示します（これを「キャンセル」行と呼びます）。また、オブジェクトの各状態を特定するために、それぞれ異なる番号を持つ `Version` カラムも使用します。

たとえば、ユーザーがあるサイトで訪れたページ数とその滞在時間を計算したいとします。ある時点で、ユーザーアクティビティの状態を持つ次の行を書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

その後、ユーザーアクティビティの変更を登録し、次の2行で書き込みます。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

最初の行はオブジェクト（ユーザー）の以前の状態をキャンセルします。キャンセルされた状態のすべてのフィールドを `Sign` を除いてコピーする必要があります。

2行目は現在の状態を含みます。

ユーザーアクティビティの最後の状態のみが必要なため、行

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

は削除され、オブジェクトの無効な（古い）状態が縮小されます。`VersionedCollapsingMergeTree` はデータパーツをマージする際にこれを行います。

各変更について2行が必要な理由については、[アルゴリズム](#table_engines-versionedcollapsingmergetree-algorithm)を参照してください。

**使用上の注意**

1. データを書き込むプログラムは、オブジェクトの状態を記憶し、それをキャンセルできるようにする必要があります。「キャンセル」文字列には、主キーのフィールドと「状態」文字列のバージョン、および逆の `Sign` のコピーを含める必要があります。これにより、ストレージの初期サイズが増加しますが、データを迅速に書き込むことが可能になります。
2. カラム内の長い配列は、書き込み時の負荷によりエンジンの効率を低下させます。データが単純であるほど、効率が良くなります。
3. `SELECT` の結果は、オブジェクトの変更履歴の一貫性に大きく依存します。挿入のためのデータ準備には注意してください。一貫性のないデータでは、セッション深度のような非負メトリックに対して負の値など、予測不可能な結果が得られます。

### アルゴリズム {#table_engines-versionedcollapsingmergetree-algorithm}

ClickHouseがデータパーツをマージする場合、同じ主キーとバージョンを持ち、異なる `Sign` を持つ各行のペアを削除します。行の順序は重要ではありません。

ClickHouseがデータを挿入する場合、行は主キーによって順序付けられます。 `Version` カラムが主キーに含まれていない場合、ClickHouseはそれを暗黙的に主キーの最後のフィールドとして追加し、順序付けに使用します。

## データの選択 {#selecting-data}

ClickHouseは、同じ主キーを持つすべての行が同じ結果データパーツに存在することや、同じ物理サーバー上にあることを保証しません。これはデータの書き込み時およびその後のデータパーツのマージ時の両方に当てはまります。さらに、ClickHouseは複数のスレッドで `SELECT` クエリを処理し、結果の行の順序を予測することはできません。これは、`VersionedCollapsingMergeTree` テーブルから完全に「縮小」されたデータを取得する必要がある場合、集約が必要であることを意味します。

縮小を完了するには、`GROUP BY` 句と記号を考慮した集約関数を持つクエリを書きます。たとえば、量を計算するには `count()` の代わりに `sum(Sign)` を使用します。何かの合計を計算するには `sum(Sign * x)` を使用し、`HAVING sum(Sign) > 0` を追加します。

集約 `count`、`sum` および `avg` はこのように計算できます。オブジェクトに少なくとも1つの非縮小状態がある場合、集約 `uniq` を計算できます。集約 `min` と `max` は計算できません。なぜなら、`VersionedCollapsingMergeTree` は縮小された状態の値の履歴を保存しないからです。

「縮小」されたデータを集約なしで抽出する必要がある場合（たとえば、行の最新の値が特定の条件と一致するかどうかを確認するため）、`FROM` 句に `FINAL` 修飾子を使用できます。このアプローチは非効率的であり、大きなテーブルでは使用すべきではありません。

## 使用例 {#example-of-use}

例データ：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
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

データの挿入：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

私たちは二つの異なるデータパーツを作成するために二つの `INSERT` クエリを使用します。データを単一のクエリで挿入すると、ClickHouseは1つのデータパートを作成し、決してマージを行わないでしょう。

データの取得：

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

ここで何が見えるのか、縮小された部分はどこにありますか？私たちは2つの `INSERT` クエリを使用して2つのデータパーツを作成しました。`SELECT` クエリは2つのスレッドで実行され、その結果は行のランダムな順序です。データパーツはまだマージされていないため、縮小は行われません。ClickHouseは、私たちが予測できない未知のタイミングでデータパーツをマージします。

だから集約が必要です：

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

私たちが集約を必要としない場合、そして強制的に縮小を行いたい場合、`FROM` 句に `FINAL` 修飾子を使用できます。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

これはデータを選択する非常に非効率的な方法です。大きなテーブルには使用しないでください。
