---
slug: '/engines/table-engines/mergetree-family/custom-partitioning-key'
sidebar_position: 30
sidebar_label: 'カスタムパーティショニングキー'
title: 'カスタムパーティショニングキー'
description: 'MergeTreeテーブルにカスタムパーティショニングキーを追加する方法を学びます。'
---


# カスタムパーティショニングキー

:::note
ほとんどの場合、パーティションキーは必要ありません。その他のほとんどの場合も、月単位よりも細かいパーティションキーは必要ありません。

過度に細かいパーティショニングは行わないでください。クライアントの識別子や名前でデータをパーティショニングしないでください。代わりに、クライアントの識別子や名前をORDER BY式の最初のカラムにしてください。
:::

パーティショニングは、[MergeTreeファミリーのテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)や[レプリケーティッドテーブル](../../../engines/table-engines/mergetree-family/replication.md)、[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)に利用できます。

パーティションは、指定された基準によるテーブル内のレコードの論理的な組み合わせです。パーティションは、月、日、イベントタイプなどの任意の基準で設定できます。各パーティションは、データの操作を簡略化するために別々に保存されます。データにアクセスする際、ClickHouseは可能な限り最小のパーティションのサブセットを使用します。パーティションは、パーティショニングキーを含むクエリのパフォーマンスを向上させます。なぜなら、ClickHouseはパーティション内の部分とグラニュールを選択する前に、そのパーティションのフィルタリングを行うからです。

パーティションは、[テーブルを作成する際](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)の`PARTITION BY expr`句で指定されます。パーティションキーはテーブルのカラムからの任意の式であることができます。例えば、月ごとのパーティショニングを指定するには、次の式を使用します：`toYYYYMM(date_column)`：

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

パーティションキーは、式のタプルでも構いません（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)に似ています）。例えば：

``` sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプによるパーティショニングを設定しています。

デフォルトでは、浮動小数点のパーティションキーはサポートされていません。使用するには、設定[allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)を有効にします。

テーブルに新しいデータを挿入すると、このデータは主キーによってソートされた別のパート（チャンク）として保存されます。挿入後10～15分で、同じパーティションの部分がすべてのパートにマージされます。

:::info
マージは、パーティショニング式の同じ値を持つデータ部分に対してのみ機能します。これはつまり、**過度に細かいパーティション**（約1000を超えるパーティション）は作成すべきではありません。そうでないと、ファイルシステム内のファイル数やオープンファイルディスクリプタの数が不合理に増えるため、`SELECT`クエリのパフォーマンスが悪化します。
:::

テーブルのパーツやパーティションを表示するには、[system.parts](../../../operations/system-tables/parts.md)テーブルを使用します。例えば、月単位のパーティショニングを持つ`visits`テーブルがあるとしましょう。`system.parts`テーブルに対して`SELECT`クエリを実行します：

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

`partition`カラムにはパーティションの名前が含まれています。この例では2つのパーティション：`201901`と`201902`があります。このカラムの値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md)クエリでパーティション名を指定できます。

`name`カラムにはパーティションデータの名前が含まれています。このカラムを使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart)クエリでパートの名前を指定できます。

パートの名前『201901_1_9_2_11』を分解すると：

- `201901`はパーティション名です。
- `1`はデータブロックの最小番号です。
- `9`はデータブロックの最大番号です。
- `2`はチャンクレベル（マージツリーが形成された深さ）です。
- `11`は変異のバージョン（パートが変異した場合）

:::info
古いタイプのテーブルのパーツは、名前が`20190117_20190123_2_2_0`の形式です（最小日-最大日-最小ブロック番号-最大ブロック番号-レベル）。
:::

`active`カラムはパートのステータスを表示します。`1`はアクティブ、`0`は非アクティブです。非アクティブなパーツは、例えば、より大きなパートにマージされた後のソースパーツです。破損したデータパーツも非アクティブとして示されます。

この例のように、同じパーティションに複数の分離されたパーツが存在します（例えば、`201901_1_3_1`と`201901_1_9_2`）。これは、これらのパーツがまだマージされていないことを意味します。ClickHouseは、データの挿入後約15分で挿入されたパーツを定期的にマージします。加えて、[OPTIMIZE](../../../sql-reference/statements/optimize.md)クエリを使用して、非スケジュールのマージを実行することも可能です。例：

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

パーツとパーティションのセットを表示するもう一つの方法は、テーブルのディレクトリに入ることです：`/var/lib/clickhouse/data/<database>/<table>/`。例えば：

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

`201901_1_1_0`、`201901_1_7_1`などのフォルダは、パーツのディレクトリです。各パートは対応するパーティションに関連付けられており、特定の月のデータのみを含みます（この例のテーブルは月単位のパーティショニングです）。

`detached`ディレクトリには、[DETACH](/sql-reference/statements/detach)クエリを使用してテーブルから切り離されたパーツが含まれています。破損したパーツも削除されるのではなく、このディレクトリに移動されます。サーバーは`detached`ディレクトリ内のパーツを使用しません。このディレクトリ内でデータを追加、削除、または変更することはいつでも可能です – サーバーは、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart)クエリを実行するまではこれを把握しません。

運用中のサーバーでは、ファイルシステム上のパーツまたはそのデータのセットを手動で変更することはできません。サーバーはそのことを把握しなくなるためです。非レプリケートテーブルの場合、サーバーが停止しているときにこれを行うことができますが、推奨されません。レプリケートテーブルの場合、パーツのセットはどのような場合でも変更できません。

ClickHouseでは、パーティションに対して操作を行うことができます。削除、別のテーブルへのコピー、またはバックアップの作成などです。[パーティションとパーツの操作に関する]( /sql-reference/statements/alter/partition)セクションに、すべての操作のリストがあります。

## パーティションキーを使用したグループ化の最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのグループバイキーの組み合わせによっては、各パーティションを独立して集約することが可能な場合があります。
その場合、最後にすべての実行スレッドの部分的に集約されたデータをマージする必要がなくなります。
なぜなら、各グループバイキーの値は、異なる2つのスレッドの作業セットに現れないという保証があるからです。

典型的な例：

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
このようなクエリのパフォーマンスは、テーブルのレイアウトに大きく依存します。そのため、最適化はデフォルトでは無効になっています。
:::

良好なパフォーマンスのための重要な要因：

- クエリに関与するパーティションの数は十分大きく（`max_threads / 2`よりも多く）、そうでなければクエリはマシンを十分に活用しません
- パーティションはあまり小さくないべきで、バッチ処理が1行ずつの処理に低下しないようにします
- パーティションはサイズが比較可能であるべきで、したがってすべてのスレッドはほぼ同じ量の作業を行います

:::info
データをパーティションに均等に分配するために、`partition by`句のカラムに対して何らかのハッシュ関数を適用することをお勧めします。
:::

関連する設定は：

- `allow_aggregate_partitions_independently` - 最適化の使用が有効かどうかを制御します
- `force_aggregate_partitions_independently` - 正確さの観点から適用可能である場合にそれを強制使用しますが、内部ロジックがその妥当性を推定して無効にすることがあります
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持ち得るパーティションの最大数に対する厳密な制限です
