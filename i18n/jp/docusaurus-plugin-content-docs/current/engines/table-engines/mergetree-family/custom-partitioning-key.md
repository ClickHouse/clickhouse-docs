---
description: 'MergeTree テーブルにカスタムパーティションキーを追加する方法について説明します。'
sidebar_label: 'カスタムパーティションキー'
sidebar_position: 30
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
title: 'カスタムパーティションキー'
doc_type: 'guide'
---



# カスタムパーティションキー

:::note
ほとんどの場合、パーティションキーは不要であり、多くのケースでも月単位より細かいパーティションキーは必要ありません。例外は、日単位でのパーティション分割が一般的なオブザーバビリティ用途をターゲットとする場合です。

パーティションを細かくし過ぎてはいけません。クライアント識別子や名前でデータをパーティション分割しないでください。その代わりに、`ORDER BY` 式の最初の列としてクライアント識別子または名前を指定します。
:::

パーティション分割は、[MergeTree ファミリのテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)で利用でき、[レプリケーテッドテーブル](../../../engines/table-engines/mergetree-family/replication.md)や[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)も含まれます。

パーティションとは、指定された条件に基づいてテーブル内のレコードを論理的にまとめたものです。パーティションは、月単位、日単位、イベントタイプ別など、任意の条件で設定できます。各パーティションは個別に保存され、このデータの操作を簡略化します。データにアクセスするとき、ClickHouse は可能な限り少ないパーティションだけにアクセスします。パーティションキーを含むクエリの場合、ClickHouse はパーティション内のパーツおよびグラニュールを選択する前に、まず対象のパーティションでフィルタリングを行うため、パーティションはクエリ性能を向上させます。

パーティションは、[テーブルの作成](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)時の `PARTITION BY expr` 句で指定します。パーティションキーには、テーブル列を用いた任意の式を指定できます。例えば、月単位でパーティション分割するには、`toYYYYMM(date_column)` という式を使用します。

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

パーティションキーは、（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries) と同様に）式のタプルにすることもできます。例えば次のようにします。

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプごとにパーティション分割を行います。

デフォルトでは、浮動小数点型のパーティションキーはサポートされていません。使用するには、設定 [allow&#95;floating&#95;point&#95;partition&#95;key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key) を有効にします。

新しいデータをテーブルに挿入すると、このデータはプライマリキーでソートされた個別のパーツ（チャンク）として保存されます。挿入後 10〜15 分ほど経過すると、同じパーティションに属するパーツがマージされて 1 つのパーツになります。

:::info
マージは、パーティション式の値が同じデータパーツに対してのみ行われます。これは、**過度に細かいパーティションを作成すべきではない**（おおよそ 1,000 個を超えるパーティションにはしない）ことを意味します。そうしないと、ファイルシステム上のファイル数とオープンファイルディスクリプタ数が不当に多くなり、`SELECT` クエリのパフォーマンスが低下します。
:::

テーブルのパーツとパーティションを確認するには、[system.parts](../../../operations/system-tables/parts.md) テーブルを使用します。たとえば、月ごとにパーティション分割された `visits` テーブルがあるとします。`system.parts` テーブルに対して `SELECT` クエリを実行してみましょう:

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

`partition` 列にはパーティション名が含まれています。この例ではパーティションは 2 つあり、`201901` と `201902` です。この列の値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) クエリでパーティション名を指定できます。


`name` 列には、パーティションのデータパーツの名前が含まれます。この列を使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) クエリ内でパーツ名を指定できます。

パーツ名 `201901_1_9_2_11` を分解してみましょう：

* `201901` はパーティション名です。
* `1` はデータブロックの最小番号です。
* `9` はデータブロックの最大番号です。
* `2` はチャンクレベル（形成元となった MergeTree の深さ）です。
* `11` はミューテーションバージョンです（パーツにミューテーションが適用された場合）。

:::info
旧タイプのテーブルのパーツ名は `20190117_20190123_2_2_0` のようになります（最小日付 - 最大日付 - 最小ブロック番号 - 最大ブロック番号 - レベル）。
:::

`active` 列はパーツのステータスを示します。`1` はアクティブ、`0` は非アクティブです。非アクティブなパーツには、例えば、より大きなパーツへマージされた後に残るソースパーツが含まれます。破損したデータパーツも非アクティブとして扱われます。

例でわかるように、同じパーティションに複数の別々のパーツがあります（例えば、`201901_1_3_1` と `201901_1_9_2`）。これは、これらのパーツがまだマージされていないことを意味します。ClickHouse は挿入されたデータパーツを定期的にマージし、挿入後おおよそ 15 分でこれを行います。さらに、[OPTIMIZE](../../../sql-reference/statements/optimize.md) クエリを使用して、スケジュールされていないマージを実行することもできます。例:

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

非アクティブなパーツは、マージ後およそ 10 分で削除されます。

パーツやパーティションの集合を確認する別の方法として、テーブルのディレクトリ `/var/lib/clickhouse/data/<database>/<table>/` に移動する方法があります。例えば次のとおりです。

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

フォルダー &#39;201901&#95;1&#95;1&#95;0&#39;、&#39;201901&#95;1&#95;7&#95;1&#39; などはパーツのディレクトリです。各パーツは対応するパーティションに属しており、特定の月のデータのみを含みます（この例のテーブルでは、月単位でパーティション分割されています）。


`detached` ディレクトリには、[DETACH](/sql-reference/statements/detach) クエリを使用してテーブルから切り離されたパーツが格納されます。破損したパーツも、削除されるのではなくこのディレクトリへ移動されます。サーバーは `detached` ディレクトリ内のパーツを使用しません。このディレクトリ内のデータは、任意のタイミングで追加、削除、または変更できます。ただし、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) クエリを実行するまで、サーバーはその変更を認識しません。

稼働中のサーバーでは、ファイルシステム上のパーツの集合やそのデータを手動で変更することはできません。サーバーがその変更を認識しないためです。非レプリケートテーブルの場合、サーバーを停止しているときであればこれを行うことは可能ですが、推奨はされません。レプリケートテーブルの場合は、いかなる場合でもパーツの集合を変更することはできません。

ClickHouse ではパーティションに対して、削除、あるテーブルから別のテーブルへのコピー、バックアップの作成など、さまざまな操作を実行できます。すべての操作の一覧については、[パーティションおよびパーツの操作](/sql-reference/statements/alter/partition) のセクションを参照してください。



## パーティションキーを使用したGROUP BY最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのGROUP BYキーの組み合わせによっては、各パーティションに対して独立して集計を実行できる場合があります。
この場合、各GROUP BYキー値が異なる2つのスレッドの作業セットに現れないことが保証されるため、
最終的にすべての実行スレッドから部分集計されたデータをマージする必要がなくなります。

典型的な例は次のとおりです:

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
このようなクエリのパフォーマンスは、テーブルのレイアウトに大きく依存します。そのため、この最適化はデフォルトでは有効になっていません。
:::

良好なパフォーマンスを得るための主な要因:

- クエリに関与するパーティション数は十分に大きい必要があります(`max_threads / 2`より大きい)。そうでない場合、クエリはマシンリソースを十分に活用できません
- パーティションは小さすぎてはいけません。バッチ処理が行単位の処理に退化しないようにするためです
- パーティションはサイズが同程度である必要があります。すべてのスレッドがほぼ同じ量の作業を行うようにするためです

:::info
パーティション間でデータを均等に分散させるために、`PARTITION BY`句の列に何らかのハッシュ関数を適用することを推奨します。
:::

関連する設定:

- `allow_aggregate_partitions_independently` - 最適化の使用を有効にするかどうかを制御します
- `force_aggregate_partitions_independently` - 正確性の観点から適用可能な場合に使用を強制しますが、その有効性を推定する内部ロジックによって無効化される場合があります
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことができるパーティションの最大数に対するハードリミットです
