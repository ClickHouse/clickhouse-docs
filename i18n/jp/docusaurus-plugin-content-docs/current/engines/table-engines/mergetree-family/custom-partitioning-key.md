---
description: 'MergeTree テーブルにカスタムパーティショニングキーを追加する方法について説明します。'
sidebar_label: 'カスタムパーティショニングキー'
sidebar_position: 30
slug: /engines/table-engines/mergetree-family/custom-partitioning-key
title: 'カスタムパーティショニングキー'
doc_type: 'guide'
---



# カスタムパーティションキー

:::note
ほとんどの場合、パーティションキーは不要であり、それ以外の多くの場合でも、月単位より細かいパーティションキーは不要です。例外はオブザーバビリティ向けのユースケースで、この場合は日単位のパーティションが一般的です。

パーティションを過度に細かくしてはいけません。クライアント識別子や名前でデータをパーティションしないでください。その代わりに、クライアント識別子や名前を ORDER BY 式の最初の列にします。
:::

パーティショニングは、[MergeTree ファミリーのテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)、[レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)、および[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)で利用できます。

パーティションとは、指定した条件に基づいてテーブル内のレコードを論理的にまとめたものです。パーティションは、月単位、日単位、イベント種別など、任意の条件で設定できます。各パーティションは個別に保存され、このデータの操作が容易になります。データへアクセスする際、ClickHouse は可能な限り最小限のパーティション集合だけを使用します。パーティションキーを含むクエリでは、ClickHouse がまず対象となるパーティションを絞り込んでから、そのパーティション内のパーツやグラニュールを選択するため、パーティションはクエリのパフォーマンスを向上させます。

パーティションは、[テーブルを作成](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)するときの `PARTITION BY expr` 句で指定します。パーティションキーにはテーブル列からの任意の式を指定できます。たとえば、月単位でパーティションを指定するには、`toYYYYMM(date_column)` という式を使用します。

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

パーティションキーは（[primary key](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries) と同様に）、式のタプルにすることもできます。例えば、次のように指定します。

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、その週に発生したイベントタイプごとにパーティション分割を行います。

デフォルトでは、浮動小数点数のパーティションキーはサポートされていません。使用するには、設定 [allow&#95;floating&#95;point&#95;partition&#95;key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key) を有効にします。

新しいデータをテーブルに挿入すると、このデータはプライマリキーでソートされた別個のパーツ（チャンク）として保存されます。挿入後 10〜15 分ほどで、同一パーティション内のパーツが 1 つのパーツにマージされます。

:::info
マージは、パーティション式の値が同じデータパーツに対してのみ機能します。これは **パーティションを過度に細かくしないでください**（目安としてパーティション数はおおよそ 1000 個以下にする）ということを意味します。そうしないと、ファイルシステム上のファイル数やオープンファイルディスクリプタ数が不当に多くなり、`SELECT` クエリの性能が低下します。
:::

テーブルのパーツおよびパーティションを確認するには、[system.parts](../../../operations/system-tables/parts.md) テーブルを使用します。たとえば、月ごとにパーティション分割された `visits` テーブルがあると仮定します。`system.parts` テーブルに対して次のように `SELECT` クエリを実行します。

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

`partition` 列にはパーティション名が含まれています。この例では、`201901` と `201902` の 2 つのパーティションがあります。この列の値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) クエリでパーティション名を指定できます。


`name` 列には、パーティションのデータパーツ名が含まれます。この列を使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) クエリでパーツ名を指定できます。

パーツ名 `201901_1_9_2_11` を分解して説明します。

* `201901` はパーティション名です。
* `1` はデータブロックの最小番号です。
* `9` はデータブロックの最大番号です。
* `2` はチャンクレベル（作成元の MergeTree における深さ）です。
* `11` はミューテーションバージョンです（パーツがミューテートされた場合）。

:::info
旧タイプのテーブルのパーツ名は `20190117_20190123_2_2_0` という形式です（最小日付 - 最大日付 - 最小ブロック番号 - 最大ブロック番号 - レベル）。
:::

`active` 列はパーツの状態を示します。`1` はアクティブ、`0` は非アクティブです。非アクティブなパーツの例としては、より大きなパーツにマージされた後に残る元のパーツがあります。破損したデータパーツも非アクティブとして示されます。

例から分かるように、同じパーティションに複数の分割されたパーツが存在します（例: `201901_1_3_1` と `201901_1_9_2`）。これは、これらのパーツがまだマージされていないことを意味します。ClickHouse は挿入されたデータパーツを定期的にマージしており、おおよそ挿入から 15 分後に実行されます。さらに、[OPTIMIZE](../../../sql-reference/statements/optimize.md) クエリを使用して、スケジュール外のマージを実行することもできます。例:

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

パーツとパーティションの集合を確認する別の方法として、テーブルのディレクトリ `/var/lib/clickhouse/data/<database>/<table>/` に移動します。例えば次のとおりです。

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

フォルダ &#39;201901&#95;1&#95;1&#95;0&#39;、&#39;201901&#95;1&#95;7&#95;1&#39; などは、各パートのディレクトリです。各パートは対応するパーティションに紐づいており、特定の月のデータだけを含みます（この例のテーブルは月単位でパーティション分割されています）。


`detached` ディレクトリには、[DETACH](/sql-reference/statements/detach) クエリを使用してテーブルから切り離されたパーツが含まれます。破損したパーツも削除されるのではなく、このディレクトリへ移動されます。サーバーは `detached` ディレクトリ内のパーツを使用しません。このディレクトリ内のデータは、いつでも追加、削除、または変更できます。サーバーは、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) クエリを実行するまでこれらを認識しません。

稼働中のサーバーでは、サーバーが認識できないため、ファイルシステム上のパーツの集合やそのデータを手動で変更することはできません。非レプリケートテーブルの場合、サーバー停止中であればこれを行うことはできますが、推奨されません。レプリケートテーブルの場合は、いかなる場合でもパーツの集合を変更することはできません。

ClickHouse ではパーティションに対して操作を実行できます。削除したり、あるテーブルから別のテーブルへコピーしたり、バックアップを作成したりできます。すべての操作の一覧は、[パーティションおよびパーツの操作](/sql-reference/statements/alter/partition) セクションを参照してください。



## パーティションキーを利用した Group By 最適化

テーブルのパーティションキーとクエリの Group By キーの組み合わせによっては、
各パーティションごとに独立して集約処理を実行できる場合があります。
この場合、すべての実行スレッドからの部分集約済みデータを最後にマージする必要がなくなります。
これは、各 Group By キーの値が、異なる 2 つのスレッドのワーキングセット内に同時に現れないことが保証されているためです。

典型的な例としては、次のようなものがあります。

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
この種のクエリのパフォーマンスはテーブルのレイアウトに強く依存します。そのため、この最適化はデフォルトでは有効になっていません。
:::

良好なパフォーマンスを得るための主な要因:

* クエリの対象となるパーティション数は十分に多い必要があります（`max_threads / 2` より大きい）。そうでない場合、クエリはマシン資源を十分に活用できません
* パーティションが小さすぎてはいけません。小さすぎるとバッチ処理が行単位の処理に退化してしまいます
* パーティションのサイズは互いに同程度であるべきです。そうすることで、すべてのスレッドがおおよそ同じ量の作業を行うようになります

:::info
`partition by` 句のカラムに対して何らかのハッシュ関数を適用し、データがパーティション間で均等に分散されるようにすることが推奨されます。
:::

関連する設定は次のとおりです:

* `allow_aggregate_partitions_independently` - この最適化の利用を有効にするかどうかを制御します
* `force_aggregate_partitions_independently` - 正しさの観点から適用可能である場合に、内部ロジックによる有効性の推定で無効化されていても、この最適化の使用を強制します
* `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことのできるパーティション数の最大値に対するハードリミットです
