---
'description': 'MergeTree テーブルにカスタムパーティショニングキーを追加する方法について学びます。'
'sidebar_label': 'カスタムパーティショニングキー'
'sidebar_position': 30
'slug': '/engines/table-engines/mergetree-family/custom-partitioning-key'
'title': 'カスタムパーティショニングキー'
---




# カスタムパーティショニングキー

:::note
ほとんどの場合、パーティションキーは不要であり、他のほとんどのケースでも、月単位以上の粒度のパーティションキーは必要ありません。

あまりにも粒度が細かいパーティショニングを使用しないでください。クライアントの識別子や名前でデータをパーティションしないでください。その代わりに、ORDER BY式の最初のカラムとしてクライアント識別子または名前を指定してください。
:::

パーティショニングは、[MergeTreeファミリーのテーブル](../../../engines/table-engines/mergetree-family/mergetree.md)で利用可能であり、[レプリケートテーブル](../../../engines/table-engines/mergetree-family/replication.md)や[マテリアライズドビュー](/sql-reference/statements/create/view#materialized-view)も含まれます。

パーティションは、指定された基準によってテーブル内のレコードの論理的な組み合わせです。パーティションは、月、日、またはイベントタイプなどの任意の基準で設定できます。各パーティションはデータの操作を簡素化するために別々に保存されます。データにアクセスする際、ClickHouseは可能な限り最小のサブセットのパーティションを使用します。パーティションは、パーティショニングキーを含むクエリのパフォーマンスを向上させます。なぜなら、ClickHouseはパーツやグラニュールを選択する前に、そのパーティションのフィルタリングを行うからです。

パーティションは、[テーブルを作成する際](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)に `PARTITION BY expr` 節で指定されます。パーティションキーはテーブルのカラムからの任意の式にすることができます。例えば、月ごとにパーティショニングを指定するには、`toYYYYMM(date_column)` という式を使用します：

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

パーティションキーは、式のタプルでもできます（[主キー](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)に類似）。例えば：

```sql
ENGINE = ReplicatedCollapsingMergeTree('/clickhouse/tables/name', 'replica1', Sign)
PARTITION BY (toMonday(StartDate), EventType)
ORDER BY (CounterID, StartDate, intHash32(UserID));
```

この例では、現在の週に発生したイベントタイプによってパーティショニングを設定しています。

デフォルトでは、浮動小数点数のパーティションキーはサポートされていません。使用するには、設定 [allow_floating_point_partition_key](../../../operations/settings/merge-tree-settings.md#allow_floating_point_partition_key) を有効にします。

テーブルに新しいデータを挿入する際、このデータは主キーによってソートされた別のパート（チャンク）として保存されます。挿入から10～15分後に、同じパーティションのパーツが全体のパートにマージされます。

:::info
マージは、パーティショニング式の同じ値を持つデータパーツに対してのみ機能します。これは、**あまりにも粒度の細かいパーティションを作成しないべき**であることを意味します（大体1000パーティション以上の粒度）。そうでなければ、`SELECT` クエリのパフォーマンスが悪化します。ファイルシステム内のファイル数やオープンファイルディスクリプタの異常に大きい数が原因です。
:::

[system.parts](../../../operations/system-tables/parts.md) テーブルを使用して、テーブルのパーツとパーティションを表示します。例えば、`visits` テーブルが月ごとにパーティショニングされていると仮定しましょう。`system.parts` テーブルの `SELECT` クエリを実行します：

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

`partition` カラムにはパーティションの名前が含まれています。この例では、`201901` と `201902` の2つのパーティションがあります。この列の値を使用して、[ALTER ... PARTITION](../../../sql-reference/statements/alter/partition.md) クエリでパーティション名を指定できます。

`name` カラムにはパーティションデータパーツの名前が含まれています。この列を使用して、[ALTER ATTACH PART](/sql-reference/statements/alter/partition#attach-partitionpart) クエリでパートの名前を指定できます。

パートの名前 `201901_1_9_2_11` を分解してみましょう：

- `201901` はパーティション名です。
- `1` はデータブロックの最小番号です。
- `9` はデータブロックの最大番号です。
- `2` はチャンクレベル（形成されたマージツリーの深さ）です。
- `11` は変異バージョン（パートが変異した場合）

:::info
古いタイプのテーブルのパーツは、名前が `20190117_20190123_2_2_0` です（最小日付 - 最大日付 - 最小ブロック番号 - 最大ブロック番号 - レベル）。
:::

`active` カラムはパートの状態を示します。`1` はアクティブ、`0` は非アクティブです。非アクティブなパーツは、例えば、大きなパートにマージされた後に残るソースパーツです。破損したデータパーツも非アクティブとして表示されます。

例のように、同一のパーティションのいくつかの分離されたパーツ（例えば、`201901_1_3_1` と `201901_1_9_2`）があります。これは、これらのパーツがまだマージされていないことを意味します。ClickHouseは、データの挿入から約15分後に挿入されたパーツを定期的にマージします。その上、[OPTIMIZE](../../../sql-reference/statements/optimize.md) クエリを使用することで、スケジュール外のマージを実行できます。例：

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

パーツとパーティションのセットを表示するもう1つの方法は、テーブルのディレクトリにアクセスすることです：`/var/lib/clickhouse/data/<database>/<table>/`。例えば：

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

`201901_1_1_0` や `201901_1_7_1` などのフォルダは、パーツのディレクトリです。各パートは対応するパーティションに関連しており、特定の月のデータだけを含んでいます（この例のテーブルは月ごとにパーティショニングされています）。

`detached` ディレクトリには、[DETACH](/sql-reference/statements/detach) クエリを使用してテーブルから切り離されたパーツが含まれています。破損したパーツも削除されるのではなく、このディレクトリに移動されます。サーバーは `detached` ディレクトリのパーツを使用しません。このディレクトリ内のデータをいつでも追加、削除、または変更できます。サーバーは、[ATTACH](/sql-reference/statements/alter/partition#attach-partitionpart) クエリを実行するまで、これについて知ることはありません。

稼働中のサーバーでは、ファイルシステム上のパーツのセットやそのデータを手動で変更することはできません。サーバーはそれについて知ることがないためです。レプリケートされていないテーブルでは、サーバーが停止している時にこれを行うことができますが、お勧めはしません。レプリケートされたテーブルでは、パーツのセットはどのような場合でも変更できません。

ClickHouseでは、パーティションに対して操作を行うことができます：削除、別のテーブルからのコピー、またはバックアップを作成することです。操作のリストは、[パーティションとパーツの操作](/sql-reference/statements/alter/partition) セクションで確認してください。

## パーティションキーを使用したグループ化最適化 {#group-by-optimisation-using-partition-key}

テーブルのパーティションキーとクエリのグループ化キーの組み合わせによっては、各パーティションを独立して集約することが可能な場合があります。
その場合、全ての実行スレッドの集約データを最後にマージする必要はありません。
なぜなら、各グループ化キーの値が2つの異なるスレッドの作業セットに出現しないことが保証されているからです。

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
そのようなクエリのパフォーマンスは、テーブルのレイアウトに大きく依存します。そのため、最適化はデフォルトでは有効になっていません。
:::

良好なパフォーマンスのための重要な要素：

- クエリに関与するパーティションの数が十分に大きいこと（`max_threads / 2` より多い）。そうでないと、クエリは機械を十分に活用できません。
- パーティションがあまり小さくならず、バッチ処理が行単位の処理に陥らないこと。
- パーティションのサイズが比較可能であること。そうすれば、全てのスレッドが大体同じ量の作業を行います。

:::info
データをパーティション間で均等に分配するために、`partition by` 節のカラムに対して何らかのハッシュ関数を適用することをお勧めします。
:::

関連する設定：

- `allow_aggregate_partitions_independently` - 最適化の使用を制御します。
- `force_aggregate_partitions_independently` - 正しさの観点から適用できるときにその使用を強制しますが、内部ロジックによってその適用が無効にされる場合があります。
- `max_number_of_partitions_for_independent_aggregation` - テーブルが持つことができる最大のパーティション数についての厳しい制限。
