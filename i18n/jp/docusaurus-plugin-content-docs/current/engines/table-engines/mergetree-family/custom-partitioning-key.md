---
description: 'MergeTree テーブルにカスタムパーティショニングキーを追加する方法を学びます。'
sidebar_label: 'カスタムパーティショニングキー'
sidebar_position: 30
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
title: 'カスタムパーティショニングキー'
---


# カスタムパーティショニングキー

:::note
ほとんどの場合、パーティションキーは必要ありません。また、他のほとんどのケースでも、月ごと以上に詳細なパーティションキーは必要ありません。

過度に詳細なパーティショニングは避けるべきです。クライアント識別子や名前でデータをパーティションすることは避け、代わりにクライアント識別子または名前を ORDER BY 式の最初のカラムにします。
:::

パーティショニングは、[MergeTreeファミリーのテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)、 [レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)、および [マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)で利用可能です。

パーティションは、指定された基準によるテーブル内のレコードの論理的な組み合わせです。月ごと、日ごと、またはイベントタイプによる任意の基準でパーティションを設定できます。各パーティションは、データの操作を簡素化するために別々に保存されます。データにアクセスする際、ClickHouseは可能な限り最小のパーティションのサブセットを使用します。パーティションは、パーティショニングキーを含むクエリのパフォーマンスを向上させます。なぜなら、ClickHouseはパーツやグラニュールを選択する前にそのパーティションをフィルタリングするためです。

パーティションは、[テーブルを作成する際](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)の `PARTITION BY expr` 句で指定されます。パーティションキーには、テーブルカラムからの任意の式を使用できます。例えば、月単位のパーティショニングを指定するには、次の式を使用します：`toYYYYMM(date_column)`。

```sql
CREATE TABLE visits
(
    VisitDate Date,
    Hour UInt8,
    ClientID UUID
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(VisitDate)
ORDER BY Hour;
```

パーティションキーは、式のタプル（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)と似ています）にもできます。例えば：

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプによってパーティショニングを設定しています。

デフォルトでは、浮動小数点のパーティションキーはサポートされていません。使用するには、設定[allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)を有効にしてください。

テーブルに新しいデータを挿入すると、このデータは主キーによってソートされた別のパート（チャンク）として保存されます。挿入の10〜15分後、同じパーティションのパーツが全体のパートにマージされます。

:::info
マージは、パーティショニング式の同じ値を持つデータパーツにのみ機能します。これにより、**過剰に詳細なパーティションを作成すべきではありません**（約千のパーティション以上も）。そうしないと、ファイルシステム内のファイル数とオープンファイルディスクリプタの不合理な数により、`SELECT` クエリのパフォーマンスが悪化します。
:::

[system.parts](../../../operations/system-tables/parts.md)テーブルを使用してテーブルのパーツとパーティションを表示できます。例えば、`visits`テーブルが月単位でパーティショニングされていると仮定します。`system.parts`テーブルに対して `SELECT` クエリを実行してみましょう：

```sql
SELECT
    partition,
    name,
    active
FROM system.parts
WHERE table = 'visits'
```

```text
┌─partition─┬─name──────────────┬─active─┐
│ 201901    │ 201901_1_3_1      │      0 │
│ 201901    │ 201901_1_9_2_11   │      1 │
│ 201901    │ 201901_8_8_0      │      0 │
│ 201901    │ 201901_9_9_0      │      0 │
│ 201902    │ 201902_4_6_1_11   │      1 │
│ 201902    │ 201902_10_10_0_11 │      1 │
│ 201902    │ 201902_11_11_0_11 │      1 │
└───────────┴───────────────────┴────────┘
```

`partition`カラムにはパーティション名が含まれています。この例では、`201901` と `201902` の2つのパーティションがあります。このカラム値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) クエリでパーティション名を指定できます。

`name`カラムには、パーティションデータパーツの名前が含まれています。このカラムを使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) クエリでパートの名前を指定できます。

パートの名前を分解してみましょう：`201901_1_9_2_11`：

- `201901` はパーティション名です。
- `1` はデータブロックの最小番号です。
- `9` はデータブロックの最大番号です。
- `2` はチャンクレベル（形成されたマージツリーの深さ）です。
- `11` はミューテーションバージョン（パートが変異した場合）。

:::info
古いタイプのテーブルのパーツは次のような名前を持っています：`20190117_20190123_2_2_0`（最小日 - 最大日 - 最小ブロック番号 - 最大ブロック番号 - レベル）。
:::

`active`カラムは、パートの状態を示します。`1` はアクティブを示し、`0` は非アクティブを示します。非アクティブのパーツは、例えば、大きなパーツへのマージ後に残るソースパーツです。破損したデータパーツも非アクティブとして示されます。

ご覧のとおり、同じパーティションのいくつかの分離されたパーツ（例えば、`201901_1_3_1` と `201901_1_9_2`）があります。これは、これらのパーツがまだマージされていないことを意味します。ClickHouseは、挿入されたデータのパーツを定期的にマージし、約15分後に行います。さらに、[OPTIMIZE](../../../sql-reference/statements/optimize.md) クエリを使用して、スケジュールされていないマージを実行することもできます。例：

```sql
OPTIMIZE TABLE visits PARTITION 201902;
```

```text
┌─partition─┬─name─────────────┬─active─┐
│ 201901    │ 201901_1_3_1     │      0 │
│ 201901    │ 201901_1_9_2_11  │      1 │
│ 201901    │ 201901_8_8_0     │      0 │
│ 201901    │ 201901_9_9_0     │      0 │
│ 201902    │ 201902_4_6_1     │      0 │
│ 201902    │ 201902_4_11_2_11 │      1 │
│ 201902    │ 201902_10_10_0   │      0 │
│ 201902    │ 201902_11_11_0   │      0 │
└───────────┴──────────────────┴────────┘
```

非アクティブなパーツは、マージの約10分後に削除されます。

パーツとパーティションのセットを表示する別の方法は、テーブルのディレクトリに入ることです：`/var/lib/clickhouse/data/<database>/<table>/`。例えば：

```bash
/var/lib/clickhouse/data/default/visits$ ls -l
total 40
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  1 16:48 201901_1_3_1
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201901_1_9_2_11
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 15:52 201901_8_8_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 15:52 201901_9_9_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201902_10_10_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:17 201902_11_11_0
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 16:19 201902_4_11_2_11
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  5 12:09 201902_4_6_1
drwxr-xr-x 2 clickhouse clickhouse 4096 Feb  1 16:48 detached
```

フォルダ `'201901_1_1_0'`, `'201901_1_7_1'` などは、パーツのディレクトリです。各パートは対応するパーティションに関連し、特定の月のデータのみを含みます（この例のテーブルは月ごとにパーティショニングされています）。

`detached` ディレクトリには、[DETACH](/sql-reference/statements/detach) クエリを使用してテーブルから切り離されたパーツが含まれています。破損したパーツも、このディレクトリに移動され、削除されることはありません。サーバーは、`detached` ディレクトリからのパーツを使用しません。このディレクトリ内のデータを随時追加、削除、または変更できますが、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) クエリを実行するまで、サーバーはこのことを知りません。

稼働中のサーバーでは、ファイルシステム上のパーツやそのデータのセットを手動で変更することはできません。サーバーが停止している場合は、非レプリケートのテーブルでこれを行うことができますが、お勧めはしません。レプリケートテーブルの場合、パーツのセットはどのような場合でも変更できません。

ClickHouseは、パーティションに対する操作を実行することができます：削除、別のテーブルへのコピー、またはバックアップの作成などです。すべての操作のリストは、[パーティションとパーツの操作](/sql-reference/statements/alter/partition) のセクションにあります。

## パーティションキーを使用した Group By 最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのグループバイキーの組み合わせによっては、各パーティションで独立して集計を実行できる場合があります。
そうすれば、最後にすべての実行スレッドから部分的に集計されたデータをマージする必要がなくなります。
なぜなら、各グループバイキーの値が異なる2つのスレッドの作業セットに現れないことが保証されているからです。

典型的な例は次のとおりです：

```sql
CREATE TABLE session_log
(
    UserID UInt64,
    SessionID UUID
)
ENGINE = MergeTree
PARTITION BY sipHash64(UserID) % 16
ORDER BY tuple();

SELECT
    UserID,
    COUNT()
FROM session_log
GROUP BY UserID;
```

:::note
このようなクエリのパフォーマンスは、テーブルレイアウトに大きく依存します。そのため、最適化はデフォルトでは有効にされていません。
:::

良好なパフォーマンスのための重要な要素：

- クエリで関与するパーティションの数は十分に大きい（`max_threads / 2` より多い）必要があります。そうでないと、クエリはマシンを十分に活用できません。
- パーティションはあまり小さくないべきで、バッチ処理が行ごとの処理に悪化しないようにする必要があります。
- パーティションはサイズが比較できるべきで、すべてのスレッドがほぼ同じ量の作業を行うことができます。

:::info
`partition by` 句のカラムにハッシュ関数を適用して、データをパーティション間で均等に分散させることが推奨されます。
:::

関連する設定は次の通りです：

- `allow_aggregate_partitions_independently` - 最適化の使用が有効かどうかを制御します。
- `force_aggregate_partitions_independently` - 正しさの観点から適用可能な場合に強制しますが、その実用性を評価する内部ロジックによって無効にされることがあります。
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことができるパーティションの最大数に対するハードリミットです。
