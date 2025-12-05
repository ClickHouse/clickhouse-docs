---
description: 'ClickHouse における Replicated* ファミリーのテーブルエンジンを用いたデータレプリケーションの概要'
sidebar_label: 'Replicated*'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'Replicated* テーブルエンジン'
doc_type: 'reference'
---

# Replicated* table engines {#replicated-table-engines}

:::note
ClickHouse Cloud ではレプリケーションは ClickHouse Cloud が管理します。テーブルを作成する際は、引数を追加せずに作成してください。たとえば、以下のテキストでは次のように書き換えてください。

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

以下のとおり:

```sql
ENGINE = ReplicatedMergeTree
```

:::

レプリケーションは、MergeTree ファミリーのテーブルに対してのみサポートされています:

* ReplicatedMergeTree
* ReplicatedSummingMergeTree
* ReplicatedReplacingMergeTree
* ReplicatedAggregatingMergeTree
* ReplicatedCollapsingMergeTree
* ReplicatedVersionedCollapsingMergeTree
* ReplicatedGraphiteMergeTree

レプリケーションはサーバー全体ではなく、個々のテーブル単位で動作します。1 台のサーバー上で、レプリケーション対象のテーブルと非レプリケーションテーブルを同時に保存できます。

レプリケーションは分片に依存しません。各分片はそれぞれ独立してレプリケーションされます。

`INSERT` および `ALTER` クエリの圧縮データがレプリケーションされます（詳細は [ALTER](/sql-reference/statements/alter) のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH`、`RENAME` クエリは単一のサーバー上で実行され、レプリケーションされません:

* `CREATE TABLE` クエリは、クエリが実行されたサーバー上に新しいレプリケーション対応テーブルを作成します。このテーブルが他のサーバー上に既に存在する場合は、新しいレプリカを追加します。
* `DROP TABLE` クエリは、クエリが実行されたサーバー上にあるレプリカを削除します。
* `RENAME` クエリは、レプリカの 1 つでテーブル名を変更します。言い換えると、レプリケーションされたテーブルは、レプリカごとに異なる名前を持つことができます。

ClickHouse は、レプリカのメタ情報を保存するために [ClickHouse Keeper](/guides/sre/keeper/index.md) を使用します。ZooKeeper バージョン 3.4.5 以降を使用することもできますが、ClickHouse Keeper を推奨します。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper) サーバー設定セクションでパラメーターを設定します。

:::note
セキュリティ設定を軽視しないでください。ClickHouse は ZooKeeper のセキュリティサブシステムの `digest` [ACL スキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) をサポートしています。
:::

ClickHouse Keeper クラスターのアドレスを設定する例:

```xml
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

ClickHouse は、補助 ZooKeeper クラスターにレプリカのメタデータを保存することもサポートしています。これを行うには、エンジンの引数として ZooKeeper クラスター名とパスを指定します。
言い換えると、異なるテーブルのメタデータを異なる ZooKeeper クラスターに保存することをサポートしています。

補助 ZooKeeper クラスターのアドレスを設定する例:

```xml
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

テーブルメタデータをデフォルトの ZooKeeper クラスターではなく別の ZooKeeper クラスターに保存するには、次のように
ReplicatedMergeTree エンジンを使用して SQL でテーブルを作成します。

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

既存の任意の ZooKeeper クラスターを指定でき、システムはそのクラスター上のディレクトリを自身のデータ用に使用します（どのディレクトリを使うかはレプリケーテッドテーブルを作成するときに指定します）。

設定ファイルで ZooKeeper が設定されていない場合、レプリケーテッドテーブルを作成することはできず、既存のレプリケーテッドテーブルは読み取り専用になります。

ZooKeeper は `SELECT` クエリでは使用されません。これは、レプリケーションが `SELECT` のパフォーマンスに影響せず、非レプリケートなテーブルと同じ速度でクエリが実行されるためです。分散レプリケートテーブルに対してクエリを実行する場合、ClickHouse の動作は [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) と [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) の設定で制御されます。

各 `INSERT` クエリごとに、複数のトランザクションを通じておおよそ 10 個のエントリが ZooKeeper に追加されます。（より正確には、これは挿入される各データブロックごとであり、1 つの INSERT クエリには 1 ブロック、または `max_insert_block_size = 1048576` 行ごとに 1 ブロックが含まれます。）これにより、非レプリケートなテーブルと比べて `INSERT` のレイテンシがわずかに長くなります。ただし、1 秒あたり 1 回以下の `INSERT` でバッチ挿入するという推奨事項に従えば、問題は発生しません。1 つの ZooKeeper クラスターで調停される ClickHouse クラスター全体で、1 秒あたり数百件の `INSERTs` が行われます。データ挿入のスループット（1 秒あたりの行数）は、非レプリケートなデータの場合と同じく高いままです。

非常に大きなクラスターでは、分片ごとに異なる ZooKeeper クラスターを使用できます。しかし、実運用クラスター（約 300 台のサーバー）に基づく当社の経験では、その必要性は確認されていません。

レプリケーションは非同期かつマルチマスターです。`INSERT` クエリ（および `ALTER`）は、利用可能な任意のサーバーに送信できます。データはクエリが実行されたサーバーに挿入され、その後ほかのサーバーにコピーされます。非同期であるため、直近に挿入されたデータがほかのレプリカに反映されるまでにはある程度のレイテンシがあります。レプリカの一部が利用できない場合、そのレプリカが再び利用可能になった時点でデータが書き込まれます。レプリカが利用可能である場合、レイテンシは圧縮データブロックをネットワーク越しに転送するのにかかる時間となります。レプリケートテーブルのバックグラウンドタスクを実行するスレッド数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 設定で指定できます。

`ReplicatedMergeTree` エンジンは、レプリケートのフェッチ処理用に別のスレッドプールを使用します。プールのサイズは [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 設定で制限されており、この設定はサーバーの再起動によって調整できます。

デフォルトでは、INSERT クエリは 1 つのレプリカからのみデータ書き込み完了の確認を待ちます。1 つのレプリカにしかデータが正常に書き込まれず、そのレプリカを保持しているサーバーが消失した場合、保存されたデータは失われます。複数のレプリカからデータ書き込みの確認を取得できるようにするには、`insert_quorum` オプションを使用します。

各データブロックはアトミックに書き込まれます。INSERT クエリは `max_insert_block_size = 1048576` 行までのブロックに分割されます。言い換えると、`INSERT` クエリの行数が 1048576 行未満であれば、そのクエリはアトミックに処理されます。

データブロックは重複排除されます。同一のデータブロック（同じサイズで、同じ行が同じ順序で含まれるデータブロック）を複数回書き込もうとした場合、そのブロックは 1 回だけ書き込まれます。これは、ネットワーク障害が発生した場合にクライアントアプリケーションがデータが DB に書き込まれたかどうかを判断できないため、`INSERT` クエリを単純にリトライできるようにするためです。同一データの INSERT がどのレプリカに送信されたかは問題になりません。`INSERTs` は冪等です。重複排除のパラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) サーバー設定で制御されます。

レプリケーション中は、挿入対象の元データのみがネットワーク経由で転送されます。その後のデータ変換（マージ処理）は、すべてのレプリカ上で同じ方法で調整・実行されます。これによりネットワーク使用量が最小化されるため、レプリカが異なるデータセンターに存在する場合でもレプリケーションは良好に動作します。（異なるデータセンター間でデータを複製することが、レプリケーションの主な目的であることに注意してください。）

同じデータのレプリカ数は任意の数にできます。当社の経験に基づくと、本番環境では各サーバーで RAID-5 または RAID-6（場合によっては RAID-10）を使用した二重レプリケーション構成が、比較的信頼性が高く扱いやすい解決策となりえます。

システムはレプリカ間のデータ同期状態を監視し、障害発生後に復旧することができます。フェイルオーバーは自動（データの差分が小さい場合）または半自動（データ差分が大きく、設定ミスを示している可能性がある場合）で行われます。

## レプリケートテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloud では、レプリケーションは自動的に処理されます。

レプリケーション引数を指定せずに [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) を使用してテーブルを作成します。システムは内部的に、レプリケーションとデータ分散のために [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) を [`SharedMergeTree`](/cloud/reference/shared-merge-tree) に書き換えます。

レプリケーションはプラットフォーム側で管理されるため、`ReplicatedMergeTree` の使用やレプリケーションパラメータの指定は避けてください。

:::

### Replicated*MergeTree のパラメータ {#replicatedmergetree-parameters}

| Parameter          | Description                                                                   |
| ------------------ | ----------------------------------------------------------------------------- |
| `zoo_path`         | ClickHouse Keeper におけるテーブルへのパス。                                               |
| `replica_name`     | ClickHouse Keeper におけるレプリカ名。                                                  |
| `other_parameters` | レプリケートされたテーブルを作成する際に使用されるエンジンのパラメータ。例えば、`ReplacingMergeTree` における version など。 |

例:

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">
  <summary>非推奨の構文の例</summary>

  ```sql
  CREATE TABLE table_name
  (
      EventDate DateTime,
      CounterID UInt32,
      UserID UInt32
  ) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
  ```
</details>

この例が示すように、これらのパラメータには波括弧で囲まれた置換用プレースホルダーを含めることができます。置換される値は、設定ファイルの [macros](/operations/server-configuration-parameters/settings.md/#macros) セクションから取得されます。

例:

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 内のテーブルへのパスは、各レプリケーテッドテーブルごとに一意である必要があります。異なる分片上のテーブルは、異なるパスを持たなければなりません。
この場合、パスは次の要素で構成されます。

`/clickhouse/tables/` は共通のプレフィックスです。このプレフィックスをそのまま使用することを推奨します。

`{shard}` は分片の識別子に展開されます。

`table_name` は ClickHouse Keeper 内でのテーブル用ノード名です。テーブル名と同一にしておくとよいでしょう。これは明示的に定義されます。テーブル名と異なり、RENAME クエリの後でも変更されないためです。
*ヒント*: `table_name` の前にデータベース名を追加することもできます。例: `db_name.table_name`

2 つの組み込み置換 `{database}` と `{table}` を使用できます。これらはそれぞれテーブル名とデータベース名に展開されます（これらのマクロが `macros` セクションで定義されていない限り）。したがって、ZooKeeper のパスは `'/clickhouse/tables/{shard}/{database}/{table}'` のように指定できます。
これらの組み込み置換を使用する場合、テーブル名の変更には注意してください。ClickHouse Keeper 内のパスは変更できず、テーブル名が変更されるとマクロは別のパスに展開されます。その結果、テーブルは ClickHouse Keeper 内に存在しないパスを参照することになり、読み取り専用モードに移行します。

レプリカ名は同一テーブルの異なるレプリカを識別します。例にあるように、サーバー名を利用できます。この名前は各分片内で一意であれば十分です。

置換を使用せずにパラメータを明示的に定義することもできます。これはテストや小規模クラスタの構成には便利かもしれません。ただし、この場合は分散 DDL クエリ (`ON CLUSTER`) を使用することはできません。

大規模クラスタで作業する際には、エラー発生の可能性を低減できるため、置換を使用することを推奨します。

`Replicated` テーブルエンジンのデフォルト引数は、サーバー設定ファイルで指定できます。たとえば次のようにします:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合はテーブル作成時に引数を省略できます。

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

次のとおりです：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカで `CREATE TABLE` クエリを実行します。このクエリは、新しいレプリケートされたテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

他のレプリカ上のテーブルにすでにデータが存在している状態で新しいレプリカを追加した場合、クエリ実行後にデータは他のレプリカから新しいレプリカへコピーされます。言い換えると、新しいレプリカは他のレプリカと同期されます。

レプリカを削除するには、`DROP TABLE` を実行します。ただし、削除されるレプリカは 1 つだけであり、クエリを実行したサーバー上に存在するレプリカのみが削除されます。

## 障害発生後のリカバリ {#recovery-after-failures}

サーバー起動時に ClickHouse Keeper が使用できない場合、レプリケーテッドテーブルは読み取り専用モードに切り替わります。システムは定期的に ClickHouse Keeper への接続を試行します。

`INSERT` の実行中に ClickHouse Keeper が使用できない場合、または ClickHouse Keeper とのやり取り中にエラーが発生した場合、例外がスローされます。

ClickHouse Keeper への接続確立後、システムはローカルファイルシステム上のデータセットが、想定されるデータセット（この情報は ClickHouse Keeper が保持）と一致しているかを確認します。軽微な不整合であれば、システムはレプリカとのデータ同期によってそれらを解消します。

システムが破損したデータパーツ（ファイルサイズが不正なもの）や、認識されないパーツ（ファイルシステムには書き込まれているが ClickHouse Keeper に記録されていないもの）を検出した場合、それらを `detached` サブディレクトリに移動します（削除はされません）。不足しているパーツはレプリカからコピーされます。

ClickHouse は、大量のデータを自動的に削除するといった破壊的な操作は一切行わないことに注意してください。

サーバー起動時（または ClickHouse Keeper との新しいセッション確立時）には、すべてのファイルの個数とサイズのみがチェックされます。ファイルサイズは一致しているが途中のバイトが変更されているような場合、これは即座には検出されず、`SELECT` クエリでデータの読み取りを試みたときにのみ検出されます。このクエリは、チェックサムの不一致や圧縮ブロックのサイズ不一致に関する例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルのデータセットが想定されるものと大きく異なる場合、安全機構が作動します。サーバーはこの事象をログに記録し、起動を拒否します。これは、分片上のレプリカが誤って別の分片上のレプリカと同様に設定されている、といった構成ミスを示している可能性があるためです。ただし、この仕組みの閾値は比較的低く設定されており、この状況は通常の障害復旧中にも発生しうるものです。この場合、データは「ボタンを押す」ことで半自動的に復旧されます。

リカバリを開始するには、任意の内容で ClickHouse Keeper にノード `/path_to_table/replica_name/flags/force_restore_data` を作成するか、すべてのレプリケーテッドテーブルを復旧するためのコマンドを実行します。

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

その後、サーバーを再起動します。起動時にサーバーはこれらのフラグを削除して、リカバリを開始します。

## 完全なデータ損失からの復旧 {#recovery-after-complete-data-loss}

あるサーバーからデータとメタデータがすべて消失した場合は、次の手順で復旧します。

1.  サーバーに ClickHouse をインストールします。`shard` 識別子およびレプリカ（使用している場合）を含む設定ファイル内の置換変数を正しく定義します。
2.  サーバー上で手動で複製する必要がある、レプリケーションされていないテーブルがある場合は、レプリカ上のデータをコピーします（ディレクトリ `/var/lib/clickhouse/data/db_name/table_name/` 内）。
3.  `/var/lib/clickhouse/metadata/` にあるテーブル定義をレプリカからコピーします。`shard` またはレプリカ識別子がテーブル定義内で明示的に定義されている場合は、このレプリカに対応するように修正します。（別案としては、サーバーを起動し、`/var/lib/clickhouse/metadata/` 内の .sql ファイルに含まれているはずのすべての `ATTACH TABLE` クエリを実行します。）
4.  復旧を開始するには、任意の内容で ClickHouse Keeper ノード `/path_to_table/replica_name/flags/force_restore_data` を作成するか、すべてのレプリケートテーブルを復旧するために次のコマンドを実行します: `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後サーバーを起動します（すでに動作している場合は再起動します）。データはレプリカからダウンロードされます。

別の復旧オプションとして、ClickHouse Keeper から失われたレプリカに関する情報（`/path_to_table/replica_name`）を削除し、「[レプリケートテーブルの作成](#creating-replicated-tables)」で説明されているようにレプリカを再作成する方法もあります。

復旧中のネットワーク帯域幅には制限がありません。同時に多くのレプリカを復旧する場合は、この点に注意してください。

## MergeTree から ReplicatedMergeTree への変換 {#converting-from-mergetree-to-replicatedmergetree}

`MergeTree` という用語は、`MergeTree family` に属するすべてのテーブルエンジンを指すために使用しており、`ReplicatedMergeTree` についても同様に用います。

手動でレプリケーションしていた `MergeTree` テーブルがある場合、それをレプリケーション対応テーブルに変換できます。すでに `MergeTree` テーブルに大量のデータを蓄積していて、ここからレプリケーションを有効化したい場合に必要になることがあります。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 文を使用すると、デタッチされた `MergeTree` テーブルを `ReplicatedMergeTree` としてアタッチできます。

`MergeTree` テーブルは、テーブルのデータディレクトリ（`Atomic` データベースの場合は `/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`）に `convert_to_replicated` フラグが設定されている場合、サーバー再起動時に自動的に変換できます。
空の `convert_to_replicated` ファイルを作成すると、次回のサーバー再起動時にテーブルはレプリケーション対応としてロードされます。

次のクエリを使用してテーブルのデータパスを取得できます。テーブルに複数のデータパスがある場合は、先頭のものを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

`default_replica_path` と `default_replica_name` の設定値を使って ReplicatedMergeTree テーブルが作成されることに注意してください。
他のレプリカ上で変換済みテーブルを作成するには、`ReplicatedMergeTree` エンジンの最初の引数でそのパスを明示的に指定する必要があります。次のクエリを使用してそのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

これを手動で行う方法もあります。

複数のレプリカ間でデータが異なる場合は、まず同期するか、1 つを除くすべてのレプリカからそのデータを削除します。

既存の MergeTree テーブルの名前を変更し、元の名前で `ReplicatedMergeTree` テーブルを作成します。
古いテーブルから、新しいテーブルデータのディレクトリ（`/var/lib/clickhouse/data/db_name/table_name/`）内にある `detached` サブディレクトリへデータを移動します。
その後、いずれか 1 つのレプリカで `ALTER TABLE ATTACH PARTITION` を実行して、これらのデータのパーツをワーキングセットに追加します。

## ReplicatedMergeTree から MergeTree への変換 {#converting-from-replicatedmergetree-to-mergetree}

単一サーバー上のデタッチされた `ReplicatedMergeTree` テーブルを `MergeTree` としてアタッチするには、[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 文を使用します。

別の方法として、サーバーの再起動を伴う手順もあります。別名の MergeTree テーブルを CREATE します。`ReplicatedMergeTree` テーブルのデータがあるディレクトリから、すべてのデータを新しいテーブルのデータディレクトリに移動します。その後、`ReplicatedMergeTree` テーブルを削除し、サーバーを再起動します。

サーバーを起動することなく `ReplicatedMergeTree` テーブルを削除したい場合は、次の手順を実行します。

- メタデータディレクトリ (`/var/lib/clickhouse/metadata/`) 内の対応する `.sql` ファイルを削除します。
- ClickHouse Keeper 内の対応するパス (`/path_to_table/replica_name`) を削除します。

これらの操作の後、サーバーを起動し、`MergeTree` テーブルを CREATE してデータをそのディレクトリに移動し、サーバーを再起動できます。

## ClickHouse Keeper クラスター内のメタデータが失われたり破損した場合の復旧 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeper 内のデータが失われたり破損した場合は、上記で説明したように、データを非レプリケートテーブルに移動することで保全できます。

**関連項目**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)