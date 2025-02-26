---
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
sidebar_position: 30
sidebar_label: カスタムパーティショニングキー
title: "カスタムパーティショニングキー"
description: "MergeTreeテーブルにカスタムパーティショニングキーを追加する方法を学びます。"
---

# カスタムパーティショニングキー

:::note
ほとんどの場合、パーティションキーは必要ありません。また、ほとんどの他の場合では、月ごとのより詳細なパーティションキーは必要ありません。

あまり細かいパーティショニングを使用してはいけません。クライアント識別子や名前でデータをパーティション分けしてはいけません。その代わりに、クライアント識別子または名前をORDER BY式の最初のカラムにしてください。
:::

パーティショニングは、[MergeTreeファミリテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)、[レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)、および[マテリアライズドビュー](../../../sql-reference/statements/create/view.md#materialized-view)で利用可能です。

パーティションは、指定された基準に基づいてテーブル内のレコードの論理的な組み合わせです。月ごと、日ごと、イベントタイプなどの任意の基準でパーティションを設定できます。各パーティションは、データの操作を簡素化するために別々に保存されます。データにアクセスする際、ClickHouseは可能な限り最小のパーティションのサブセットを使用します。パーティションは、ClickHouseがそのパーティション内のパーツとグラニュールを選択する前に、パーティショニングキーを含むクエリのパフォーマンスを向上させます。

パーティションは、[テーブルを作成する際に](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)、`PARTITION BY expr`句で指定されます。パーティションキーは、テーブルのカラムからの任意の式であることができます。たとえば、月ごとにパーティションを指定するには、式`toYYYYMM(date_column)`を使用します：

``` sql
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

パーティションキーは、式のタプルでも構いません（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)と同様）。たとえば：

``` sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプによるパーティショニングを設定しています。

デフォルトでは、浮動小数点のパーティションキーはサポートされていません。使用するには、設定[allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)を有効にする必要があります。

テーブルに新しいデータを挿入すると、そのデータは主キーでソートされた別のパーツ（チャンク）として保存されます。挿入後10〜15分で同じパーティションのパーツが全体のパートにマージされます。

:::info
マージは、パーティショニング式に対して同じ値を持つデータパーツにしか機能しません。これは、**あまりに細かいパーティションを作成してはいけない**（約千個以上のパーティション）。そうしないと、ファイルシステム内の不合理に大きなファイル数とオープンファイルディスクリプタのために、`SELECT`クエリのパフォーマンスが低下します。
:::

テーブルのパーツとパーティションを表示するには、[system.parts](../../../operations/system-tables/parts.md)テーブルを使用します。たとえば、月ごとにパーティショニングされた`visits`テーブルがあると仮定します。次に、`system.parts`テーブルに対して`SELECT`クエリを実行します：

``` sql
SELECT
    partition,
    name,
    active
FROM system.parts
WHERE table = 'visits'
```

``` text
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

`partition`カラムにはパーティションの名前が含まれています。この例では、`201901`と`201902`という2つのパーティションがあります。`ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md)クエリでパーティション名を指定するために、このカラム値を使用できます。

`name`カラムにはパーティションデータパーツの名前が含まれています。このカラムを使用して、[ALTER ATTACH PART](../../../sql-reference/statements/alter/partition.md#alter_attach-partition)クエリでパーツの名前を指定できます。

パーツ名を分解します：`201901_1_9_2_11`：

- `201901`はパーティション名です。
- `1`はデータブロックの最小番号です。
- `9`はデータブロックの最大番号です。
- `2`はチャンクレベル（マージツリーが形成される深さ）です。
- `11`はミューテーションバージョン（パートが変異した場合）

:::info
古いタイプのテーブルのパーツ名は: `20190117_20190123_2_2_0`（最小日 - 最大日 - 最小ブロック番号 - 最大ブロック番号 - レベル）です。
:::

`active`カラムは、パーツの状態を示します。`1`はアクティブ、`0`は非アクティブです。非アクティブなパーツは、より大きなパートにマージされた後のソースパーツなどです。破損したデータパーツも非アクティブとして示されます。

例に示すように、同じパーティションのいくつかの分離されたパーツ（たとえば、`201901_1_3_1`と`201901_1_9_2`）があります。これは、これらのパーツがまだマージされていないことを意味します。ClickHouseは、データの挿入後約15分ごとに挿入されたパーツを定期的にマージします。また、[OPTIMIZE](../../../sql-reference/statements/optimize.md)クエリを使用して、スケジュール外のマージを実行することもできます。例：

``` sql
OPTIMIZE TABLE visits PARTITION 201902;
```

``` text
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

非アクティブなパーツは、マージ後約10分で削除されます。

パーツとパーティションのセットを表示する別の方法は、テーブルのディレクトリに入ることです：`/var/lib/clickhouse/data/<database>/<table>/`。たとえば：

``` bash
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

`201901_1_1_0`、`201901_1_7_1`などのフォルダーは、パーツのディレクトリです。各パートは、対応するパーティションに関連付けられており、特定の月のデータのみを含んでいます（この例のテーブルは月ごとにパーティショニングされています）。

`detached`ディレクトリには、[DETACH](../../../sql-reference/statements/alter/partition.md#alter_detach-partition)クエリを使用してテーブルからデタッチされたパーツが含まれています。破損したパーツもこのディレクトリに移動され、削除される代わりになります。サーバーは`detached`ディレクトリ内のパーツを使用しません。このディレクトリ内のデータは、いつでも追加、削除、変更できます。サーバーは、[ATTACH](../../../sql-reference/statements/alter/partition.md#alter_attach-partition)クエリを実行するまでこれを知らないでしょう。

運用サーバーでは、ファイルシステム上でパーツのセットやそれらのデータを手動で変更できません。サーバーはそれについて知らないからです。非レプリケートテーブルの場合、サーバーが停止しているときにこれを行うことができますが、推奨されていません。レプリケートテーブルの場合、パーツのセットはどのような場合でも変更できません。

ClickHouseでは、パーティションに対して操作を実行できます。削除、別のテーブルからのコピー、またはバックアップを作成することができます。すべての操作のリストについては、[パーティションおよびパーツの操作](../../../sql-reference/statements/alter/partition.md#alter_manipulations-with-partitions)セクションを参照してください。

## パーティションキーを使用したグループ化最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのグループバイキーの特定の組み合わせでは、各パーティションを独立して集約することが可能です。
そうすれば、最後にすべての実行スレッドから部分的に集約されたデータをマージする必要がなくなります。
これは、各グループバイキーの値が二つの異なるスレッドの作業セットに現れないという保証を与えたからです。

一般的な例は以下の通りです：

``` sql
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
このクエリのパフォーマンスは、テーブルのレイアウトに大きく依存します。そのため、最適化はデフォルトで有効ではありません。
:::

良好なパフォーマンスのための重要な要因：

- クエリに関与するパーティションの数は、十分に大きい必要があります（`max_threads / 2`より多い）、さもなくばクエリはマシンを十分に活用できません。
- パーティションは小さすぎてはいけません. そうしないと、バッチ処理が行単位の処理に陥ります。
- パーティションはサイズが比較可能で、すべてのスレッドがほぼ同量の作業を行うようにするべきです。

:::info
`partition by`句のカラムに対していくつかのハッシュ関数を適用し、パーティション間でデータを均等に分配することをお勧めします。
:::

関連する設定は以下の通りです：

- `allow_aggregate_partitions_independently` - 最適化の使用が有効かどうかをコントロールします。
- `force_aggregate_partitions_independently` - 正当性の観点から適用可能な場合に使用を強制しますが、その妥当性を内部ロジックが評価して無効にすることがあります。
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことができる最大パーティション数のハードリミットです。
