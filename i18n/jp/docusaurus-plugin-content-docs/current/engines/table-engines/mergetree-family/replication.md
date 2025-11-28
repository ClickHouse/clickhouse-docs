---
description: 'ClickHouse における Replicated* ファミリーのテーブルエンジンによるデータレプリケーションの概要'
sidebar_label: 'Replicated*'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'Replicated* テーブルエンジン'
doc_type: 'reference'
---



# Replicated* テーブルエンジン

:::note
ClickHouse Cloud ではレプリケーションは自動的に管理されます。引数を追加せずにテーブルを作成してください。たとえば、以下のテキスト中の次の部分を置き換えてください：

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

次の内容で:

```sql
ENGINE = ReplicatedMergeTree
```

:::

レプリケーションは MergeTree ファミリーのテーブルに対してのみサポートされます:

* ReplicatedMergeTree
* ReplicatedSummingMergeTree
* ReplicatedReplacingMergeTree
* ReplicatedAggregatingMergeTree
* ReplicatedCollapsingMergeTree
* ReplicatedVersionedCollapsingMergeTree
* ReplicatedGraphiteMergeTree

レプリケーションはサーバー全体ではなく、個々のテーブル単位で行われます。1 つのサーバー上に、レプリケートされたテーブルとレプリケートされていないテーブルを同時に保持できます。

レプリケーションはシャーディングに依存しません。各シャードがそれぞれ独立してレプリケーションを行います。

`INSERT` および `ALTER` クエリで圧縮されたデータはレプリケートされます（詳細については、[ALTER](/sql-reference/statements/alter) のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH`、`RENAME` クエリは単一のサーバー上で実行され、レプリケートされません:

* `CREATE TABLE` クエリは、そのクエリが実行されたサーバー上に新しいレプリケート可能なテーブルを作成します。このテーブルがすでに他のサーバー上に存在する場合は、新しいレプリカを追加します。
* `DROP TABLE` クエリは、そのクエリが実行されたサーバー上にあるレプリカを削除します。
* `RENAME` クエリは、レプリカの 1 つにあるテーブルの名前を変更します。言い換えると、レプリケートされたテーブルは、レプリカごとに異なる名前を持つことができます。

ClickHouse はレプリカのメタ情報を保存するために [ClickHouse Keeper](/guides/sre/keeper/index.md) を使用します。ZooKeeper のバージョン 3.4.5 以降を使用することも可能ですが、ClickHouse Keeper を推奨します。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper) サーバー設定セクションでパラメータを設定します。

:::note
セキュリティ設定をおろそかにしないでください。ClickHouse は ZooKeeper のセキュリティサブシステムの `digest` [ACL スキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) をサポートしています。
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

ClickHouse は、補助的な ZooKeeper クラスターにレプリカのメタ情報を保存することもサポートしています。これを行うには、エンジンの引数として ZooKeeper クラスター名とパスを指定します。
言い換えると、テーブルごとに異なる ZooKeeper クラスターにメタデータを保存することをサポートしています。

補助的な ZooKeeper クラスターのアドレス設定例:

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

テーブルメタデータをデフォルトの ZooKeeper クラスターではなく補助的な ZooKeeper クラスターに保存するには、次のように
ReplicatedMergeTree エンジンを指定してテーブルを作成する SQL を使用します。

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

任意の既存の ZooKeeper クラスターを指定でき、システムはそのクラスター上のディレクトリを自身のデータ用として使用します（このディレクトリはレプリケーテッドテーブルを作成するときに指定します）。

config ファイルで ZooKeeper が設定されていない場合、レプリケーテッドテーブルを作成できず、既存のレプリケーテッドテーブルは読み取り専用になります。


ZooKeeper は `SELECT` クエリでは使用されません。これは、レプリケーションが `SELECT` のパフォーマンスに影響せず、レプリケートされていないテーブルと同じ速度でクエリが実行されるためです。分散レプリケートテーブルに対してクエリを実行する場合、ClickHouse の動作は設定項目 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) と [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) によって制御されます。

各 `INSERT` クエリごとに、おおよそ 10 個のエントリが複数のトランザクションを通して ZooKeeper に追加されます。（より正確には、これは挿入される各データブロックごとです。1 つの `INSERT` クエリには 1 つのブロック、もしくは `max_insert_block_size = 1048576` 行ごとに 1 ブロックが含まれます。）このため、レプリケートされていないテーブルと比較して `INSERT` のレイテンシーがわずかに長くなります。ただし、1 秒あたり 1 回以下の `INSERT` でデータをバッチ挿入するという推奨事項に従えば、問題は発生しません。1 つの ZooKeeper クラスターをコーディネーションに使用している ClickHouse クラスター全体で、1 秒あたり数百件程度の `INSERT` が発生します。データ挿入時のスループット（1 秒あたりの行数）は、レプリケートされていないデータと同程度に高いままです。

非常に大規模なクラスターでは、シャードごとに別々の ZooKeeper クラスターを使用できます。しかし、運用クラスター（およそ 300 台のサーバー）での実運用経験からは、その必要性は確認されていません。

レプリケーションは非同期かつマルチマスターです。`INSERT` クエリ（および `ALTER`）は、利用可能な任意のサーバーに送信できます。データはクエリが実行されたサーバーに挿入され、その後他のサーバーへコピーされます。非同期であるため、最近挿入されたデータは、他のレプリカには一定のレイテンシーを伴って反映されます。一部のレプリカが利用できない場合、利用可能になった時点でデータが書き込まれます。レプリカが利用可能な場合、レイテンシーは圧縮データブロックをネットワーク経由で転送する時間に相当します。レプリケートテーブルに対してバックグラウンドタスクを実行するスレッド数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 設定で指定できます。

`ReplicatedMergeTree` エンジンは、レプリケーションのフェッチ用に専用のスレッドプールを使用します。プールのサイズは [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 設定によって制限されており、サーバーの再起動によって調整できます。

デフォルトでは、`INSERT` クエリは 1 つのレプリカからのデータ書き込みの確認だけを待ちます。もしデータが 1 つのレプリカにしか正常に書き込まれず、そのレプリカを持つサーバーが消失した場合、そのデータは失われます。複数のレプリカからの書き込み確認を有効にするには、`insert_quorum` オプションを使用します。

各データブロックはアトミックに書き込まれます。`INSERT` クエリは、最大 `max_insert_block_size = 1048576` 行までのブロックに分割されます。言い換えると、`INSERT` クエリの行数が 1048576 行未満であれば、そのクエリ全体がアトミックに処理されます。

データブロックは重複排除されます。同じデータブロック（同じサイズで、同じ行が同じ順序で含まれているデータブロック）を複数回書き込もうとした場合、そのブロックは 1 度だけ書き込まれます。これは、ネットワーク障害が発生した際に、クライアントアプリケーション側でデータが DB に書き込まれたかどうかを判断できない場合でも、`INSERT` クエリを単純に再送できるようにするためです。同一データを持つ `INSERT` がどのレプリカに送信されたかは関係ありません。`INSERTs` は冪等です。重複排除のパラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) サーバー設定で制御されます。

レプリケーション時には、挿入対象の元データのみがネットワーク経由で転送されます。その後のデータ変換（マージ）は、すべてのレプリカで同じようにコーディネートされ、実行されます。これによりネットワーク使用量が最小化されるため、レプリカが異なるデータセンターに配置されている場合でもレプリケーションは良好に動作します（異なるデータセンター間でデータを複製することがレプリケーションの主な目的である点に注意してください）。

同じデータに対して任意の数のレプリカを持つことができます。これまでの経験では、本番運用では二重レプリケーション（ダブルレプリケーション）を用い、各サーバーで RAID-5 または RAID-6（場合によっては RAID-10）を使用する構成が、比較的信頼性が高く扱いやすいソリューションとなり得ます。

システムはレプリカ上のデータの同期状態を監視し、障害発生後に復旧することができます。フェイルオーバーは自動（データ差分が小さい場合）あるいは半自動（データの差異が大きい場合。この場合は設定ミスを示している可能性があります）で行われます。



## レプリケーテッドテーブルの作成

:::note
ClickHouse Cloud では、レプリケーションは自動的に行われます。

レプリケーション引数を指定せずに [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) を使用してテーブルを作成します。システムは内部的に、レプリケーションとデータ分散のために [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) を [`SharedMergeTree`](/cloud/reference/shared-merge-tree) に書き換えます。

レプリケーションはプラットフォームによって管理されるため、`ReplicatedMergeTree` を使用したり、レプリケーションパラメータを指定したりすることは避けてください。

:::

### Replicated*MergeTree のパラメータ

| Parameter          | Description                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| `zoo_path`         | ClickHouse Keeper 内のテーブルへのパス。                                                   |
| `replica_name`     | ClickHouse Keeper 内のレプリカ名。                                                      |
| `other_parameters` | レプリケートされたバージョンを作成するために使用されるエンジンのパラメータ。たとえば、`ReplacingMergeTree` の `version` など。 |

例:

```sql
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
  <summary>非推奨構文の例</summary>

  ```sql
  CREATE TABLE table_name
  (
      EventDate DateTime,
      CounterID UInt32,
      UserID UInt32
  ) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
  ```
</details>

この例が示すように、これらのパラメータには波括弧内に置換文字列を含めることができます。置換される値は、設定ファイルの[macros](/operations/server-configuration-parameters/settings.md/#macros)セクションから取得されます。

例:

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 内のテーブルへのパスは、レプリケートされた各テーブルごとに一意である必要があります。異なるシャード上のテーブルは、それぞれ異なるパスを持つ必要があります。
この場合、パスは次の要素から構成されます。

`/clickhouse/tables/` は共通のプレフィックスです。この文字列をそのまま使用することを推奨します。

`{shard}` はシャード識別子に展開されます。

`table_name` は ClickHouse Keeper 内でのテーブル用ノードの名前です。テーブル名と同じにしておくと良いでしょう。テーブル名とは異なり、`RENAME` クエリを実行しても変わらないため、明示的に定義します。
*HINT*: `table_name` の前にデータベース名を付けることもできます。例: `db_name.table_name`

2 つの組み込み置換 `{database}` と `{table}` を使用できます。これらはそれぞれテーブル名とデータベース名に展開されます（`macros` セクションでこれらのマクロが定義されていない場合）。したがって、ZooKeeper パスは `'/clickhouse/tables/{shard}/{database}/{table}'` のように指定できます。
これらの組み込み置換を使用する場合、テーブル名の変更には注意してください。ClickHouse Keeper 内のパスは変更できず、テーブル名を変更するとマクロは別のパスに展開されます。その結果、テーブルは ClickHouse Keeper 内に存在しないパスを参照することになり、読み取り専用モードに移行します。

レプリカ名は同一テーブルの異なるレプリカを識別します。例にあるようにサーバー名を使用できます。名前は各シャード内で一意であれば十分です。

置換を使用せずにパラメータを明示的に定義することもできます。これはテスト時や小規模クラスタの設定には便利な場合があります。しかし、この場合は分散 DDL クエリ（`ON CLUSTER`）は使用できません。

大規模クラスタを扱う場合は、誤りの可能性を減らすために置換を使用することを推奨します。

サーバー設定ファイル内で `Replicated` テーブルエンジンのデフォルト引数を指定できます。例えば次のようにします:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブル作成時の引数は省略できます。

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

これは次と同等です：


```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカで `CREATE TABLE` クエリを実行します。このクエリは新しいレプリケーテッドテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

テーブルにすでに他のレプリカ上のデータが存在する状態で新しいレプリカを追加した場合、そのクエリを実行した後に、他のレプリカから新しいレプリカへデータがコピーされます。言い換えると、新しいレプリカは自動的に他のレプリカと同期されます。

レプリカを削除するには、`DROP TABLE` を実行します。ただし、削除されるのは 1 つのレプリカのみであり、それはクエリを実行したサーバー上に存在するレプリカです。


## 障害発生後のリカバリ

サーバー起動時に ClickHouse Keeper が使用できない場合、レプリケートテーブルは読み取り専用モードに切り替わります。システムは定期的に ClickHouse Keeper への接続を試行します。

`INSERT` の実行中に ClickHouse Keeper が使用できない場合、または ClickHouse Keeper とのやり取り時にエラーが発生した場合は、例外がスローされます。

ClickHouse Keeper への接続後、システムはローカルファイルシステム上のデータセットが想定されているデータセット（この情報は ClickHouse Keeper が保持）と一致しているかをチェックします。軽微な不整合であれば、システムはレプリカとのデータ同期によってこれを解消します。

システムが破損したデータパーツ（ファイルサイズが不正なもの）や、認識されないパーツ（ファイルシステムに書き込まれているが ClickHouse Keeper に記録されていないパーツ）を検出した場合、それらを `detached` サブディレクトリに移動します（削除はされません）。不足しているパーツはレプリカからコピーされます。

ClickHouse は、大量のデータを自動削除するといった破壊的な操作は実行しないことに注意してください。

サーバー起動時（または ClickHouse Keeper との新しいセッション確立時）には、すべてのファイルの個数とサイズのみをチェックします。ファイルサイズが一致していても、途中のバイトがどこかで変更されているような場合は、すぐには検出されず、`SELECT` クエリでデータを読み取ろうとしたときに初めて検出されます。このクエリは、チェックサムの不一致または圧縮ブロックのサイズ不一致に関する例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルのデータセットが想定されているものと大きく異なる場合、安全機構がトリガーされます。サーバーはその旨をログに記録し、起動を拒否します。これは、あるシャード上のレプリカが誤って別のシャード上のレプリカと同じ構成にされてしまった、といった構成ミスを示している可能性があるためです。ただし、この機構のしきい値はかなり低く設定されており、通常の障害復旧中にもこの状況が発生することがあります。この場合、データは「ボタンを押す」ことで半自動的に復元されます。

リカバリを開始するには、任意の内容で ClickHouse Keeper 内に `/path_to_table/replica_name/flags/force_restore_data` ノードを作成するか、すべてのレプリケートテーブルを復元するためのコマンドを実行します。

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

その後、サーバーを再起動します。起動時にサーバーはこれらのフラグを削除し、リカバリを開始します。


## 完全なデータ損失後の復旧 {#recovery-after-complete-data-loss}

あるサーバーからすべてのデータとメタデータが消失した場合は、次の手順に従って復旧します。

1.  そのサーバーに ClickHouse をインストールします。シャード識別子およびレプリカを使用している場合は、それらを含む設定ファイル内の置換設定を正しく定義します。
2.  各サーバーに手動で複製する必要がある非レプリケートテーブルがある場合は、レプリカ上のデータをコピーします（ディレクトリ `/var/lib/clickhouse/data/db_name/table_name/` 内）。
3.  レプリカから `/var/lib/clickhouse/metadata/` にあるテーブル定義をコピーします。テーブル定義内でシャードまたはレプリカ識別子が明示的に定義されている場合は、このレプリカに対応するように修正します。（別の方法としては、サーバーを起動し、`/var/lib/clickhouse/metadata/` 内の .sql ファイルに含まれているはずのすべての `ATTACH TABLE` クエリを実行します。）
4.  復旧を開始するには、任意の内容で ClickHouse Keeper ノード `/path_to_table/replica_name/flags/force_restore_data` を作成するか、すべてのレプリケートテーブルを復旧するために次のコマンドを実行します: `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバーを起動します（すでに起動している場合は再起動します）。データはレプリカからダウンロードされます。

別の復旧方法としては、ClickHouse Keeper から失われたレプリカに関する情報（`/path_to_table/replica_name`）を削除し、「[レプリケートテーブルの作成](#creating-replicated-tables)」で説明されている手順に従ってレプリカを再作成する方法があります。

復旧時のネットワーク帯域幅には制限がありません。同時に多数のレプリカを復旧する場合は、この点に注意してください。



## MergeTree から ReplicatedMergeTree への変換

`MergeTree` という用語は、`MergeTree family` に属するすべてのテーブルエンジンを指すために使用しており、`ReplicatedMergeTree` についても同様です。

手動でレプリケーションしていた `MergeTree` テーブルがある場合、それをレプリケーション対応のテーブルに変換できます。`MergeTree` テーブルにすでに大量のデータを蓄積していて、これからレプリケーションを有効化したい場合に、この操作が必要になることがあります。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) ステートメントを使用すると、デタッチされた `MergeTree` テーブルを `ReplicatedMergeTree` としてアタッチできます。

`convert_to_replicated` フラグがテーブルのデータディレクトリ（`Atomic` データベースの場合は `/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`）に設定されている場合、サーバー再起動時に `MergeTree` テーブルは自動的に変換されます。
空の `convert_to_replicated` ファイルを作成すると、次回のサーバー再起動時に、そのテーブルはレプリケーション対応テーブルとしてロードされます。

次のクエリを使用して、テーブルのデータパスを取得できます。テーブルに複数のデータパスがある場合は、先頭のパスを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

`ReplicatedMergeTree` テーブルは、`default_replica_path` および `default_replica_name` 設定の値を用いて作成される点に注意してください。
他のレプリカ上で変換後のテーブルを作成するには、`ReplicatedMergeTree` エンジンの第 1 引数でそのパスを明示的に指定する必要があります。次のクエリでそのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

これを行う別の方法として、手動で行うこともできます。

複数のレプリカ間でデータが異なっている場合は、まず同期をとるか、1つを除くすべてのレプリカからそのデータを削除します。

既存の MergeTree テーブルの名前を変更し、同じ古い名前で `ReplicatedMergeTree` テーブルを作成します。
古いテーブルから、新しいテーブルデータのディレクトリ（`/var/lib/clickhouse/data/db_name/table_name/`）内にある `detached` サブディレクトリへデータを移動します。
その後、いずれかのレプリカ上で `ALTER TABLE ATTACH PARTITION` を実行し、これらのデータパーツを稼働中のデータセットに追加します。


## ReplicatedMergeTree から MergeTree への変換 {#converting-from-replicatedmergetree-to-mergetree}

単一サーバー上で切り離されている `ReplicatedMergeTree` テーブルを `MergeTree` として再アタッチするには、[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) ステートメントを使用します。

これを行う別の方法として、サーバーの再起動を伴う手順があります。別の名前の MergeTree テーブルを作成し、`ReplicatedMergeTree` テーブルのデータがあるディレクトリから、すべてのデータを新しいテーブルのデータディレクトリに移動します。その後、`ReplicatedMergeTree` テーブルを削除してサーバーを再起動します。

サーバーを起動せずに `ReplicatedMergeTree` テーブルを削除したい場合は、次の手順を実行します。

- メタデータディレクトリ（`/var/lib/clickhouse/metadata/`）内の対応する `.sql` ファイルを削除します。
- ClickHouse Keeper 内の対応するパス（`/path_to_table/replica_name`）を削除します。

これが完了したら、サーバーを起動し、`MergeTree` テーブルを作成して、そのデータディレクトリにデータを移動し、サーバーを再起動できます。



## ClickHouse Keeper クラスター内のメタデータが失われたり破損した場合の復旧 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeper 内のデータが失われたり破損した場合は、上記で説明したように、データを非レプリケートテーブルへ移動することで保持できます。

**関連項目**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
