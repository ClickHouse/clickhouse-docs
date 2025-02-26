---
slug: /engines/table-engines/mergetree-family/replication
sidebar_position: 20
sidebar_label: データレプリケーション
title: "データレプリケーション"
description: "ClickHouse におけるデータレプリケーションの概要"
---

# データレプリケーション

:::note
ClickHouse Cloud では、レプリケーションは自動的に管理されます。引数を追加せずにテーブルを作成してください。例えば、以下のテキストでは次のように置き換えます:

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}',
    ver
)
```

を:

```sql
ENGINE = ReplicatedMergeTree
```
に変更します。
:::

レプリケーションは、MergeTree ファミリーのテーブルのみに対応しています:

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

レプリケーションは個々のテーブルのレベルで機能し、サーバ全体での機能ではありません。サーバは、レプリケートされたテーブルと非レプリケートのテーブルの両方を同時に保持できます。

レプリケーションはシャーディングに依存しません。各シャードは独自のレプリケーションを持っています。

`INSERT` および `ALTER` クエリのために圧縮されたデータはレプリケートされます（詳細は [ALTER](/sql-reference/statements/alter/index.md#query_language_queries_alter) のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH`、および `RENAME` クエリは単一のサーバで実行され、レプリケートされることはありません:

- `CREATE TABLE` クエリは、クエリが実行されたサーバ上に新しいレプリケート可能なテーブルを作成します。このテーブルが他のサーバ上ですでに存在する場合は、新しいレプリカが追加されます。
- `DROP TABLE` クエリは、クエリが実行されたサーバ上のレプリカを削除します。
- `RENAME` クエリは、レプリカの一つでテーブルをリネームします。つまり、レプリケートされたテーブルは異なるレプリカで異なる名前を持つことができます。

ClickHouse は、レプリカのメタ情報を保存するために [ClickHouse Keeper](/guides/sre/keeper/index.md) を使用します。ZooKeeper のバージョン 3.4.5 以降を使用することも可能ですが、ClickHouse Keeper の使用が推奨されます。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings.md/#server-settings_zookeeper) サーバ設定セクションにパラメータを設定します。

:::note
セキュリティ設定を怠らないでください。ClickHouse は、ZooKeeper セキュリティサブシステムの `digest` [ACL スキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) をサポートしています。
:::

ClickHouse Keeper クラスターのアドレスを設定する例:

``` xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <node>
        <host>example3</host>
        <port>2181</port>
    </node>
</zookeeper>
```

ClickHouse は、補助 ZooKeeper クラスターにレプリカのメタ情報を保存することもサポートしています。これは、エンジンの引数として ZooKeeper クラスター名とパスを提供することで実現されます。
言い換えれば、異なるテーブルのメタデータを異なる ZooKeeper クラスターに保存することができます。

補助 ZooKeeper クラスターのアドレスを設定する例:

``` xml
<auxiliary_zookeepers>
    <zookeeper2>
        <node>
            <host>example_2_1</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_2</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_3</host>
            <port>2181</port>
        </node>
    </zookeeper2>
    <zookeeper3>
        <node>
            <host>example_3_1</host>
            <port>2181</port>
        </node>
    </zookeeper3>
</auxiliary_zookeepers>
```

補助 ZooKeeper クラスターにテーブルメタデータを保存するには、SQL を使用して以下のように ReplicatedMergeTree エンジンを使用してテーブルを作成できます:

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
任意の既存の ZooKeeper クラスターを指定でき、システムはその上で自身のデータ用のディレクトリを使用します（ディレクトリはレプリケート可能なテーブルを作成する際に指定されます）。

ZooKeeper が設定ファイルに設定されていない場合、レプリケートされたテーブルを作成することはできず、既存のレプリケートされたテーブルは読み取り専用になります。

ZooKeeper は `SELECT` クエリでは使用されません。なぜなら、レプリケーションは `SELECT` のパフォーマンスに影響を及ぼさず、クエリは非レプリケートのテーブルと同じくらい高速で実行されるからです。分散レプリケートテーブルをクエリする際、ClickHouse の動作は設定 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) および [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) によって制御されます。

各 `INSERT` クエリにつき、おおよそ 10 個のエントリが ZooKeeper に複数のトランザクションを介して追加されます。（正確には、挿入されたデータの各ブロックに対してです; `INSERT` クエリは 1 つのブロックまたは `max_insert_block_size = 1048576` 行につき 1 ブロックを含みます。）これにより、非レプリケートのテーブルと比較して `INSERT` の遅延がわずかに長くなります。しかし、データを秒間 1 回の `INSERT` 以下のバッチで挿入するという推奨に従えば、問題は発生しません。1 つの ZooKeeper クラスターを調整するために使用される全ての ClickHouse クラスターは、合計数百の `INSERTs` を毎秒実行します。データ挿入時のスループット（秒あたりの行数）は、非レプリケートのデータと同じくらい高いです。

非常に大きなクラスターの場合、異なるシャードに対して異なる ZooKeeper クラスターを使用することができます。しかし、私たちの経験から、この方法は約 300 サーバーを持つ生産クラスタに基づいて不要であると証明されています。

レプリケーションは非同期でマルチマスターです。`INSERT` クエリ（および `ALTER`）は、利用可能な任意のサーバに送信できます。データはクエリが実行されたサーバに挿入され、その後他のサーバにコピーされます。非同期であるため、最近挿入されたデータは他のレプリカではやや遅れて表示されます。もし一部のレプリカが使用できない場合、データはそれらが利用可能になると書き込まれます。レプリカが利用可能であれば、遅延は圧縮データのブロックをネットワーク経由で転送するのにかかる時間です。レプリケートされたテーブルのバックグラウンドタスクを実行するスレッドの数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 設定によって設定できます。

`ReplicatedMergeTree` エンジンは、レプリケートフェッチのために別のスレッドプールを使用します。プールのサイズは、[background_fetches_pool_size](/operations/settings/settings.md/#background_fetches_pool_size) 設定によって制限され、サーバの再起動で調整できます。

デフォルトでは、`INSERT` クエリは、データを書き込むための確認を1つのレプリカからのみ待ちます。データがレプリカ1つにのみ正常に書き込まれ、このレプリカのサーバが存在しなくなった場合、保存されたデータは失われます。複数のレプリカからデータ書き込みの確認を取得するには、`insert_quorum` オプションを使用します。

各データブロックは原子的に書き込まれます。INSERT クエリは、`max_insert_block_size = 1048576` 行までのブロックに分割されます。つまり、`INSERT` クエリが 1048576 行未満であれば、原子的に実行されます。

データブロックは重複排除されます。複数回書き込まれた同じデータブロック（同じサイズのデータブロックに同じ行が同じ順序で含まれる場合）は、1 回のみ書き込まれます。この理由は、ネットワークの障害時にクライアントアプリがデータが DB に書き込まれたかどうかわからないためで、したがって `INSERT` クエリは単に再実行される可能性があります。どのレプリカに対して同一のデータが挿入されたとしても問題ありません。`INSERT` は冪等です。重複排除パラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) サーバ設定によって制御されます。

レプリケーション中は、挿入する元データのみがネットワーク経由で転送されます。さらにデータ変換（マージ）は、全てのレプリカで同じように調整され、実行されます。これによりネットワーク使用量が最小化され、異なるデータセンターにレプリカが存在する場合でもレプリケーションはうまく機能します。（異なるデータセンターにデータを複製するのがレプリケーションの主な目的です。）

同じデータのレプリカを任意の数持つことができます。私たちの経験に基づけば、生産環境で各サーバが RAID-5 または RAID-6（場合によっては RAID-10）を使用する二重レプリケーションが比較的信頼性が高く便利な解決策です。

システムはレプリカ上のデータ同期を監視し、障害後に復旧することができます。フェイルオーバーは自動（データの小さな差異の場合）または半自動（データがあまりにも異なる場合、設定エラーを示す可能性があります）で行われます。

## レプリケートされたテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloud では、レプリケーションは自動的に管理されます。引数を追加せずにテーブルを作成してください。例えば、以下のテキストでは次のように置き換えます:
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
を次のように:
```sql
ENGINE = ReplicatedMergeTree
```
に変更します。
:::

テーブルエンジン名に `Replicated` プレフィックスが追加されます。例えば: `ReplicatedMergeTree`。

:::tip
ClickHouse Cloud では、全てのテーブルがレプリケートされるため、`Replicated` を追加することはオプションです。
:::

### Replicated\*MergeTree パラメータ {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeper におけるテーブルへのパス。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeper におけるレプリカ名。

#### other_parameters {#other_parameters}

`other_parameters` — レプリケート版を作成するために使用されるエンジンのパラメータ、例えば、`ReplacingMergeTree` のバージョン。

例:

``` sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">

<summary>古い構文の例</summary>

``` sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

例のように、これらのパラメータは中括弧内の置き換えを含むことができます。置き換えられた値は設定ファイルの [macros](/operations/server-configuration-parameters/settings.md/#macros) セクションから取得されます。

例:

``` xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper におけるテーブルへのパスは、各レプリケートテーブルごとに一意である必要があります。異なるシャードにあるテーブルは異なるパスを持つ必要があります。
この場合、パスは次の部分で構成されています:

`/clickhouse/tables/` は共通のプレフィックスです。正確にこのプレフィックスを使用することをお勧めします。

`{shard}` はシャード識別子に展開されます。

`table_name` は ClickHouse Keeper におけるテーブルノードの名前です。テーブル名と同じにすることをお勧めします。これは明示的に定義されているため、テーブル名とは異なり、`RENAME` クエリの後は変更されません。
*ヒント*: `table_name` の前にデータベース名を追加することもできます。例: `db_name.table_name`

2つの組み込み置換 `{database}` および `{table}` が使用でき、テーブル名およびデータベース名にそれぞれ展開されます（これらのマクロが `macros` セクションで定義されていない限り）。したがって、ZooKeeper のパスは `'/clickhouse/tables/{shard}/{database}/{table}'` と指定できます。
これらの組み込み置換を使用する際は、テーブルのリネームに注意してください。ClickHouse Keeper 内のパスは変更できず、テーブルがリネームされるとマクロは異なるパスに展開され、テーブルは ClickHouse Keeper に存在しないパスを参照し、読み取り専用モードに入ることになります。

レプリカ名は同じテーブルの異なるレプリカを識別します。例のようにサーバ名を使用できます。名前は各シャード内で一意である必要があります。

置換を使用する代わりにパラメータを明示的に定義することもできます。これはテストや小規模クラスタの設定に便利かもしれません。ただし、この場合は分散 DDL クエリ（`ON CLUSTER`）を使用できません。

大規模クラスターで作業する場合は、置換を使用することをお勧めします。これはエラーの確率を低減します。

デフォルトの `Replicated` テーブルエンジンの引数をサーバ設定ファイルで指定できます。例えば:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブルを作成するときに引数を省略することができます:

``` sql
CREATE TABLE table_name (
	x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

これは次のように等価です:

``` sql
CREATE TABLE table_name (
	x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカで `CREATE TABLE` クエリを実行します。このクエリは、新しいレプリケートテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

テーブルに既に他のレプリカにデータがある状態で新しいレプリカを追加すると、クエリを実行した後、データは他のレプリカから新しいレプリカにコピーされます。言い換えれば、新しいレプリカは他のレプリカと同期します。

レプリカを削除するには、`DROP TABLE` を実行します。ただし、1つのレプリカのみが削除されます - クエリを実行したサーバにあるレプリカです。

## 障害からの復旧 {#recovery-after-failures}

サーバが起動する際に ClickHouse Keeper が利用できない場合、レプリケートされたテーブルは読み取り専用モードに切り替わります。システムは定期的に ClickHouse Keeper への接続を試みます。

`INSERT` 中に ClickHouse Keeper が利用できない場合や、ClickHouse Keeperとのやり取り中にエラーが発生した場合は、例外がスローされます。

ClickHouse Keeper に接続後、システムはローカルファイルシステム内のデータのセットが期待されるデータのセットと一致しているかどうかを確認します（ClickHouse Keeper がこの情報を保存しています）。小さな不整合がある場合、システムはレプリカとデータを同期させることで解決します。

システムが壊れたデータパーツ（ファイルのサイズが不正である）や認識されていないパーツ（ファイルシステムに書き込まれたが ClickHouse Keeper に記録されていないパーツ）を検出した場合、これらを `detached` サブディレクトリに移動します（削除はされません）。欠落しているパーツはレプリカからコピーされます。

ClickHouse は、大量のデータを自動的に削除するような破壊的な操作を実行しない点に注意してください。

サーバが起動（または ClickHouse Keeper と新しいセッションを確立）すると、全てのファイルの数とサイズのみがチェックされます。ファイルのサイズが一致していても、中間でバイトが変更されている場合、これは直ちには検出されませんが、`SELECT` クエリのデータを読み取ろうとする時にのみ検出されます。その場合、クエリは不一致のチェックサムまたは圧縮ブロックのサイズについての例外をスローします。この場合、データパーツは確認キューに追加され、必要に応じてレプリカからコピーされます。

ローカルデータセットが期待されるものとあまりにも異なる場合、安全メカニズムがトリガーされます。サーバはこれをログに記録し、起動を拒否します。これは、シャード上のレプリカが誤って異なるシャードのレプリカのように設定されているなど、設定エラーを示す可能性があるためです。ただし、このメカニズムのしきい値はかなり低く設定されており、通常の障害復旧中にこの状況が発生する可能性があります。この場合、データは半自動的に復元されます - 「ボタンを押す」ことによって。

復旧を開始するには、ClickHouse Keeper 内に `/path_to_table/replica_name/flags/force_restore_data` ノードを任意のコンテンツで作成するか、全てのレプリケートテーブルを復元するコマンドを実行します:

``` bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

次にサーバを再起動します。起動時に、サーバはこれらのフラグを削除し、復旧を開始します。

## 完全なデータ損失後の復旧 {#recovery-after-complete-data-loss}

サーバの全てのデータおよびメタデータが消失した場合、復旧のために次の手順を実行します:

1. サーバに ClickHouse をインストールします。使用している場合、シャード識別子およびレプリカを含む設定ファイルで置換を正しく定義します。
2. 複製されていないテーブルがあり、それらを手動でサーバに複製する必要がある場合、レプリカからデータをコピーします（ディレクトリ `/var/lib/clickhouse/data/db_name/table_name/`内）。
3. レプリカの `/var/lib/clickhouse/metadata/` にあるテーブル定義をコピーします。テーブル定義内にシャードまたはレプリカ識別子が明示的に定義されている場合、それを修正してこのレプリカに対応させます。（代わりに、サーバを起動し、`/var/lib/clickhouse/metadata/` 内にある .sql ファイルに記載されている全ての `ATTACH TABLE` クエリを実行します。）
4. 復旧を開始するには、ClickHouse Keeper 内に `/path_to_table/replica_name/flags/force_restore_data` ノードを任意のコンテンツで作成するか、全てのレプリケートテーブルを復元するコマンドを実行します: `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバを起動します（すでに実行中であれば再起動します）。データはレプリカからダウンロードされます。

データ損失したレプリカに関する情報をクリックハウスキーパーから削除することによって、再度レプリカを作成する手段もあります（`/path_to_table/replica_name`）。その後は、"[レプリケートされたテーブルの作成](#creating-replicated-tables)"に記載されている手順でレプリカを再度作成します。

復旧中はネットワーク帯域幅に制限はありません。この点に留意してください。もし多数のレプリカを同時に復元している場合、特に重要です。

## MergeTree から ReplicatedMergeTree への変換 {#converting-from-mergetree-to-replicatedmergetree}

`MergeTree` という用語は、`ReplicatedMergeTree` に対しても使用されているように、`MergeTree` ファミリーの全てのテーブルエンジンを指します。

手動でレプリケートされた `MergeTree` テーブルがある場合、それをレプリケートされたテーブルに変換することができます。この操作が必要な場合は、`MergeTree` テーブルに大量のデータをすでに収集しており、今レプリケーションを有効にしたい場合です。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) ステートメントは、デタッチされた `MergeTree` テーブルを `ReplicatedMergeTree` としてアタッチ可能にします。

`MergeTree` テーブルは、テーブルのデータディレクトリに `convert_to_replicated` フラグが設定されている場合にサーバの再起動時に自動的に変換されます（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/` は `Atomic` データベースのためのものです）。
空の `convert_to_replicated` ファイルを作成すると、次回サーバが再起動するとレプリケートされた状態でテーブルがロードされます。

このクエリを使用して、テーブルのデータパスを取得できます。テーブルが複数のデータパスを持つ場合は、最初のものを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

レプリケートされた MergeTree テーブルは、`default_replica_path` および `default_replica_name` 設定の値で作成されます。
他のレプリカに変換されたテーブルを作成するには、`ReplicatedMergeTree` エンジンの最初の引数にそのパスを明示的に指定する必要があります。以下のクエリを使用して、そのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

この操作には手動で行う方法もあります。

異なるレプリカ間でデータが異なる場合、まずそれを同期させるか、1つを除いた全てのレプリカでそのデータを削除します。

既存の MergeTree テーブルの名前を変更し、古い名前で `ReplicatedMergeTree` テーブルを作成します。
古いテーブルから新しいテーブルのデータディレクトリ（`/var/lib/clickhouse/data/db_name/table_name/`）内の `detached` サブディレクトリにデータを移動します。
次に、レプリカの一つで `ALTER TABLE ATTACH PARTITION` を実行して、これらのデータパーツを作業セットに追加します。

## ReplicatedMergeTree から MergeTree への変換 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) ステートメントを使用して、デタッチされた `ReplicatedMergeTree` テーブルを単一のサーバで `MergeTree` としてアタッチできます。

別の方法として、サーバの再起動があります。別の名前の MergeTree テーブルを作成します。`ReplicatedMergeTree` テーブルデータのディレクトリから全てのデータを新しいテーブルのデータディレクトリに移動します。その後、`ReplicatedMergeTree` テーブルを削除し、サーバを再起動します。

サーバを起動することなく `ReplicatedMergeTree` テーブルを削除したい場合:

- メタデータディレクトリ（`/var/lib/clickhouse/metadata/`）内の対応する .sql ファイルを削除します。
- ClickHouse Keeper 内の対応するパス（`/path_to_table/replica_name`）を削除します。

これを実行した後、サーバを起動し、`MergeTree` テーブルを作成し、データをそのディレクトリに移動してからサーバを再起動できます。

## ClickHouse Keeper クラスター内のメタデータが失われた場合または損傷した場合の復旧 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

クリックハウスキーパーのデータが失われたり損傷した場合、前述のようにデータを非レプリケートテーブルに移動することでデータを保存できます。

**関連情報**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/settings.md/#execute-merges-on-single-replica-time-threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)

