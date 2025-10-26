---
'description': 'MergeTree テーブルにカスタムパーティションキーを追加する方法を学びます。'
'sidebar_label': 'カスタムパーティションキー'
'sidebar_position': 30
'slug': '/engines/table-engines/mergetree-family/custom-partitioning-key'
'title': 'カスタムパーティションキー'
'doc_type': 'guide'
---


# カスタムパーティショニングキー

:::note
ほとんどのケースではパーティションキーは必要ありません。また、他のほとんどのケースでは月単位以上の詳細なパーティションキーは必要ありません。

あまり詳細なパーティショニングを使用すべきではありません。クライアントの識別子や名前でデータをパーティショニングしないでください。代わりに、クライアントの識別子または名前を ORDER BY 式の最初のカラムにしてください。
:::

パーティショニングは、[MergeTreeファミリーのテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)（[レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)や[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)を含む）で利用可能です。

パーティションは、指定された基準によるテーブル内のレコードの論理的組み合わせです。月、日、イベントタイプなど、任意の基準でパーティションを設定できます。各パーティションは、データの操作を簡素化するために別々に保存されます。データにアクセスする際、ClickHouseは可能な限り最小のサブセットのパーティションを使用します。パーティションは、ClickHouseがそのパーティション内のパーツやグラニュールを選択する前に、そのパーティションをフィルタリングするため、パーティショニングキーを含むクエリのパフォーマンスを向上させます。

パーティションは、[テーブルを作成する](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)際の `PARTITION BY expr` 句で指定されます。パーティションキーは、テーブルのカラムからの任意の式にすることができます。例えば、月単位でパーティショニングを指定するには、式 `toYYYYMM(date_column)` を使用します：

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

パーティションキーは、式のタプル（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)に類似）でも構いません。例えば：

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプごとにパーティショニングを設定しています。

デフォルトでは、浮動小数点のパーティションキーはサポートされていません。使用するには、設定 [allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key) を有効にしてください。

テーブルに新しいデータを挿入すると、このデータは主キーでソートされた別パーツ（チャンク）として保存されます。挿入後10〜15分で、同じパーティションのパーツが全体のパーツにマージされます。

:::info
マージは、パーティショニング式の値が同じデータパーツに対してのみ機能します。つまり、**過度に詳細なパーティション**（約1000パーティション以上）を作成すべきではありません。そうでないと、ファイルシステム上のファイル数やオープンファイルディスクリプタの過度な数のために、`SELECT` クエリのパフォーマンスが悪化します。
:::

[system.parts](../../../operations/system-tables/parts.md) テーブルを使用して、テーブルのパーツとパーティションを表示します。例えば、月単位でパーティショニングされた `visits` テーブルを持っていると仮定しましょう。`system.parts` テーブルに対して `SELECT` クエリを実行してみます：

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

`partition` 列には、パーティションの名前が含まれています。この例では2つのパーティションがあります： `201901` と `201902`。この列の値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) クエリでパーティション名を指定できます。

`name` 列には、パーティションデータパーツの名前が含まれています。この列を使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) クエリでパーツの名前を指定できます。

パーツの名前を分解してみましょう： `201901_1_9_2_11`：

- `201901` はパーティション名です。
- `1` はデータブロックの最小番号です。
- `9` はデータブロックの最大番号です。
- `2` はチャンクレベル（それが形成されているマージツリーの深さ）です。
- `11` はミューテーションバージョン（パーツが変更されていた場合）

:::info
古いタイプのテーブルのパーツは、名前が `20190117_20190123_2_2_0`（最小日付 - 最大日付 - 最小ブロック番号 - 最大ブロック番号 - レベル）となっています。
:::

`active` 列はパーツの状態を示します。`1` はアクティブ、`0` は非アクティブです。非アクティブなパーツは、例えば、大きなパーツへのマージ後に残されたソースパーツです。破損したデータパーツも非アクティブとして示されます。

この例に見られるように、同じパーティションのいくつかの分離されたパーツ（例えば、 `201901_1_3_1` と `201901_1_9_2`）があります。これは、これらのパーツがまだマージされていないことを意味します。ClickHouseは、データの挿入後、約15分ごとに挿入されたパーツを定期的にマージします。また、[OPTIMIZE](../../../sql-reference/statements/optimize.md) クエリを使用して、スケジュール外のマージを実行できます。例：

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

非アクティブなパーツは、マージ後約10分で削除されます。

パーツとパーティションのセットを表示する別の方法は、テーブルのディレクトリに進むことです： `/var/lib/clickhouse/data/<database>/<table>/`。例えば：

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

フォルダー '201901_1_1_0'、'201901_1_7_1' などはパーツのディレクトリです。各パートは対応するパーティションに関連付けられ、特定の月のデータのみを含みます（この例のテーブルは月単位でパーティショニングされています）。

`detached` ディレクトリには、[DETACH](/sql-reference/statements/detach) クエリを使用してテーブルからデタッチされたパーツが含まれています。破損したパーツも削除されずにこのディレクトリに移動されます。サーバーは `detached` ディレクトリのパーツを使用しません。このディレクトリ内のデータをいつでも追加、削除、または変更できますが、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) クエリを実行するまでサーバーはそれを知りません。

稼働中のサーバーでは、ファイルシステム上でパーツやそれらのデータを手動で変更することはできません。サーバーが停止している時に非レプリケートされたテーブルでこれを行うことはできますが、推奨されません。レプリケートされたテーブルの場合、パーツのセットはどのような場合でも変更できません。

ClickHouseを使用すると、パーティションに関して操作を実行できます：削除、別のテーブルへのコピー、またはバックアップの作成です。全ての操作のリストは、[パーティションおよびパーツの操作](/sql-reference/statements/alter/partition) セクションを参照してください。

## パーティションキーを使用したGROUP BY最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのGROUP BYキーの特定の組み合わせに対して、各パーティションを独立して集計することが可能な場合があります。
その場合、すべての実行スレッドの最後に部分的に集計されたデータをマージする必要はありません。
なぜなら、各GROUP BYキーの値が二つの異なるスレッドの作業セットに現れることはないという保証を提供したからです。

典型的な例は：

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
このようなクエリのパフォーマンスはテーブルのレイアウトに大きく依存します。これにより、最適化はデフォルトでは有効になっていません。
:::

良好なパフォーマンスのための主要な要因：

- クエリに関与するパーティションの数は十分に大きい必要があります（`max_threads / 2` より多く）、さもなければクエリはマシンを十分に活用しません。
- パーティションはあまり小さくならないようにし、バッチ処理が行単位の処理に陥らないようにします。
- パーティションはサイズが同等であるべきで、すべてのスレッドが大体同じ量の作業を行うようにします。

:::info
データをパーティション間で均等に分配するために、`partition by` 句のカラムに対してハッシュ関数を適用することをお勧めします。
:::

関連する設定は：

- `allow_aggregate_partitions_independently` - 最適化の使用が有効かどうかを制御します。
- `force_aggregate_partitions_independently` - 正しさの観点から適用可能な場合にその使用を強制しますが、その妥当性を推定する内部ロジックによって無効にされます。
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことができるパーティションの最大数に対する厳格な制限です。
