---
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
sidebar_position: 30
sidebar_label: カスタムパーティショニングキー
title: "カスタムパーティショニングキー"
description: "MergeTreeテーブルにカスタムパーティショニングキーを追加する方法を学びます。"
---


# カスタムパーティショニングキー

:::note
ほとんどの場合、パーティションキーは必要なく、他のほとんどの場合、月単位以上に詳細なパーティションキーは必要ありません。

あまりにも詳細すぎるパーティショニングを行うべきではありません。クライアントの識別子や名前でデータをパーティションしないでください。代わりに、クライアントの識別子や名前をORDER BY式の最初のカラムにしてください。
:::

パーティショニングは、[MergeTreeファミリーテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)で利用可能です。[レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)や[マテリアライズドビュー](../../../sql-reference/statements/create/view.md#materialized-view)も含まれます。

パーティションは、指定された基準によってテーブル内のレコードの論理的な組み合わせです。月ごと、日ごと、イベントタイプごとなど、任意の基準でパーティションを設定できます。各パーティションは、データの操作を簡素化するために別々に保存されます。データにアクセスするとき、ClickHouseは可能な限り最小のパーティションのサブセットを使用します。パーティションは、ClickHouseがパーティション内のパーツとグラニュールを選択する前に、そのパーティションをフィルタリングするため、パーティショニングキーを含むクエリのパフォーマンスを向上させます。

パーティションは、[テーブルを作成する際](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)に`PARTITION BY expr`句で指定します。パーティションキーは、テーブルのカラムからの任意の式で構成できます。たとえば、月別でのパーティショニングを指定するには、`toYYYYMM(date_column)`式を使用します。

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

パーティションキーは、式のタプルでもかまいません（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)に類似）。たとえば：

``` sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプによるパーティショニングを設定しています。

デフォルトでは、浮動小数点のパーティションキーはサポートされていません。これを使用するには、設定[allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key)を有効にします。

テーブルに新しいデータを挿入すると、このデータは主キーでソートされた別のパーツ（チャンク）として保存されます。挿入から10〜15分後に、同じパーティションのパーツが全体のパーツにマージされます。

:::info
マージは、パーティショニング式の値が同じデータ部分に対してのみ機能します。したがって、**過度に詳細なパーティションを作成すべきではありません**（約1000パーティション以上）。そうしないと、ファイルシステム内のファイルの数が不合理に大きくなり、`SELECT`クエリのパフォーマンスが低下します。
:::

テーブルのパーツとパーティションを表示するには、[system.parts](../../../operations/system-tables/parts.md)テーブルを使用します。たとえば、`visits`テーブルが月ごとにパーティショニングされていると仮定しましょう。`system.parts`テーブルに対して`SELECT`クエリを実行します。

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

`partition`カラムにはパーティションの名前が含まれています。この例では、`201901`と`201902`の2つのパーティションがあります。このカラム値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md)クエリでパーティション名を指定できます。

`name`カラムにはパーティションデータのパーツ名が含まれています。このカラムを使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart)クエリでパーツ名を指定できます。

パーツ名を分解してみましょう：`201901_1_9_2_11`:

- `201901`はパーティション名です。
- `1`はデータブロックの最小番号です。
- `9`はデータブロックの最大番号です。
- `2`はチャンクレベル（マージツリーが形成されている深さ）。
- `11`はミューテーションバージョン（パーツが変異した場合）

:::info
古いタイプのテーブルのパーツは、次のような名前を持っています：`20190117_20190123_2_2_0`（最小日付 - 最大日付 - 最小ブロック番号 - 最大ブロック番号 - レベル）。
:::

`active`カラムはパーツの状態を示します。`1`はアクティブ、`0`は非アクティブです。非アクティブなパーツは、例えば大きなパーツにマージされた後のソースパーツです。また、破損したデータパーツも非アクティブとして示されます。

例に示したように、同じパーティションのいくつかの分離されたパーツがあります（例えば、`201901_1_3_1`と`201901_1_9_2`）。これは、これらのパーツがまだマージされていないことを意味します。ClickHouseは、データの挿入後約15分ごとに挿入されたパーツを定期的にマージします。また、[OPTIMIZE](../../../sql-reference/statements/optimize.md)クエリを使用して、予定外のマージを実行することもできます。例：

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

フォルダ '201901_1_1_0', '201901_1_7_1' などはパーツのディレクトリです。各パーツは対応するパーティションに関連付けられており、特定の月のデータのみを含みます（この例のテーブルは月ごとにパーティショニングされています）。

`detached`ディレクトリには、[DETACH](/sql-reference/statements/detach)クエリを使用してテーブルから切り離されたパーツが含まれています。破損したパーツも削除されるのではなく、このディレクトリに移動されます。サーバーは`detached`ディレクトリからのパーツを使用しません。このディレクトリ内のデータをいつでも追加、削除、または変更できますが、サーバーはこのことを認識しません。これは、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart)クエリを実行するまで続きます。

稼働中のサーバーで、ファイルシステム上のパーツのセットやそのデータを手動で変更することはできません。サーバーはそれを認識しないためです。非レプリケートテーブルの場合、サーバーが停止しているときにこれを行うことができますが、推奨されません。レプリケートテーブルの場合、パーツのセットはどんな場合でも変更できません。

ClickHouseでは、パーティションに対して操作を実行することができます：それらを削除したり、別のテーブルにコピーしたり、バックアップを作成したりできます。すべての操作のリストは、[パーティションとパーツの操作]( /sql-reference/statements/alter/partition)セクションにあります。

## パーティションキーを使用したグループ化の最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのGROUP BYキーの特定の組み合わせで、各パーティションごとに独立して集約を実行できる場合があります。
この場合、実行スレッドのすべての部分的に集約されたデータをマージする必要がなくなります。
なぜなら、各GROUP BYキー値は2つの異なるスレッドの作業セットには出現できないという保証があるからです。

典型的な例は次のとおりです：

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
このようなクエリのパフォーマンスは、テーブルのレイアウトに大きく依存します。そのため、最適化はデフォルトで有効になっていません。
:::

良好なパフォーマンスのための重要な要素：

- クエリに関与するパーティションの数は十分に大きい必要があります（`max_threads / 2`以上）。そうでないと、クエリはマシンを十分に活用できません。
- パーティションはあまり小さくない必要があります。そうしないと、バッチ処理が行単位の処理に劣化します。
- パーティションはサイズが比較可能であるべきであり、そうすればすべてのスレッドがほぼ同じ量の作業を行うことができます。

:::info
データを均等にパーティションに分配するために、`partition by`句内のカラムにハッシュ関数を適用することが推奨されます。
:::

関連する設定は次のとおりです：

- `allow_aggregate_partitions_independently` - 最適化の使用が有効かどうかを制御します。
- `force_aggregate_partitions_independently` - 妥当性の観点から適用可能な場合にその使用を強制しますが、内部ロジックがその必要性を評価して無効化することがあります。
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことのできるパーティションの最大数に対するハードリミットです。
