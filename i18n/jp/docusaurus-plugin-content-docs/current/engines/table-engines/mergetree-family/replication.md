---
description: 'ClickHouse における Replicated* テーブルエンジンファミリーを用いたデータレプリケーションの概要'
sidebar_label: 'Replicated*'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'Replicated* テーブルエンジンファミリー'
doc_type: 'reference'
---



# Replicated* テーブルエンジン

:::note
ClickHouse Cloud ではレプリケーションは自動的に管理されます。テーブルを作成する際は、引数を追加せずに作成してください。たとえば、以下のテキストでは次のように書き換えます：

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

次のとおりです:

```sql
ENGINE = ReplicatedMergeTree
```

:::

レプリケーションは、MergeTree ファミリーのテーブルでのみサポートされています：

* ReplicatedMergeTree
* ReplicatedSummingMergeTree
* ReplicatedReplacingMergeTree
* ReplicatedAggregatingMergeTree
* ReplicatedCollapsingMergeTree
* ReplicatedVersionedCollapsingMergeTree
* ReplicatedGraphiteMergeTree

レプリケーションはサーバー全体ではなく、個々のテーブル単位で動作します。1 つのサーバーに、レプリケートされたテーブルとレプリケートされていないテーブルを同時に保持できます。

レプリケーションはシャーディングに依存しません。各シャードはそれぞれ独立してレプリケーションされます。

`INSERT` および `ALTER` クエリで圧縮されたデータはレプリケートされます（詳細については、[ALTER](/sql-reference/statements/alter) のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` および `RENAME` クエリは単一のサーバー上で実行され、レプリケートされません：

* `CREATE TABLE` クエリは、そのクエリが実行されたサーバー上に新しいレプリケート可能なテーブルを作成します。このテーブルが他のサーバー上にすでに存在する場合は、新しいレプリカを追加します。
* `DROP TABLE` クエリは、そのクエリが実行されたサーバー上に存在するレプリカを削除します。
* `RENAME` クエリは、レプリカの 1 つに対してテーブル名を変更します。言い換えると、レプリケートされたテーブルは、レプリカごとに異なる名前を持つことができます。

ClickHouse は、レプリカのメタ情報を保存するために [ClickHouse Keeper](/guides/sre/keeper/index.md) を使用します。ZooKeeper バージョン 3.4.5 以降を使用することも可能ですが、ClickHouse Keeper を推奨します。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper) サーバー設定セクションでパラメータを設定します。

:::note
セキュリティ設定をおろそかにしないでください。ClickHouse は ZooKeeper セキュリティサブシステムの `digest` [ACL スキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) をサポートしています。
:::

ClickHouse Keeper クラスターのアドレスを設定する例：

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

ClickHouse では、補助的な ZooKeeper クラスターにレプリカのメタ情報を保存することも可能です。これを行うには、エンジン引数として ZooKeeper クラスター名とパスを指定します。
言い換えると、異なるテーブルのメタデータを異なる ZooKeeper クラスターに保存することをサポートしています。

補助的な ZooKeeper クラスターのアドレスを設定する例:

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

テーブルメタデータをデフォルトの ZooKeeper クラスターではなく別の ZooKeeper クラスターに保存するには、次のように `ReplicatedMergeTree` エンジンを使用してテーブルを作成する SQL を実行します。

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('auxiliary_zookeepersで設定されているzookeeper_name:path', 'replica_name') ...
```

既存の任意の ZooKeeper クラスターを指定でき、システムはそのクラスター上のディレクトリを自身のデータ用に使用します（ディレクトリは `Replicated*` テーブルを作成するときに指定します）。

設定ファイルで ZooKeeper が設定されていない場合、`Replicated*` テーブルを作成できず、既存の `Replicated*` テーブルは読み取り専用になります。


`SELECT` クエリでは ZooKeeper は使用されません。これは、レプリケーションが `SELECT` のパフォーマンスに影響せず、非レプリケートテーブルと同じ速度でクエリが実行されるためです。分散レプリケートテーブルに対してクエリを実行する場合、ClickHouse の挙動は設定 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) および [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) によって制御されます。

各 `INSERT` クエリごとに、複数のトランザクションを通じて約 10 個のエントリが ZooKeeper に追加されます。（より正確には、これは挿入されるデータブロックごとです。1 つの `INSERT` クエリには 1 ブロック、または `max_insert_block_size = 1048576` 行ごとに 1 ブロックが含まれます。）このため、`INSERT` は非レプリケートテーブルと比べてわずかにレイテンシが長くなります。しかし、1 秒あたり 1 回以下の `INSERT` でバッチ挿入を行うという推奨事項に従う限り、問題は発生しません。1 つの ZooKeeper クラスターで協調される ClickHouse クラスター全体で、1 秒あたり数百回程度の `INSERT` が行われます。データ挿入のスループット（1 秒あたりの行数）は、非レプリケートデータの場合と同じくらい高く保たれます。

非常に大規模なクラスターでは、シャードごとに異なる ZooKeeper クラスターを使用できます。しかし、実運用で約 300 台のサーバーを持つクラスターの経験では、その必要性は確認されていません。

レプリケーションは非同期かつマルチマスターです。`INSERT` クエリ（および `ALTER`）は、利用可能な任意のサーバーに送信できます。データはクエリが実行されたサーバーに挿入され、その後他のサーバーへコピーされます。非同期であるため、最近挿入されたデータが他のレプリカに現れるまでにはある程度のレイテンシが発生します。レプリカの一部が利用不能な場合、そのレプリカが利用可能になった時点でデータが書き込まれます。レプリカが利用可能な場合、レイテンシは圧縮データブロックをネットワーク越しに転送するのに要する時間になります。レプリケートテーブルに対してバックグラウンドタスクを実行するスレッド数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 設定で指定できます。

`ReplicatedMergeTree` エンジンは、レプリケーション用のフェッチ処理に対して別個のスレッドプールを使用します。プールのサイズは [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 設定によって制限されており、サーバーの再起動によって調整できます。

デフォルトでは、`INSERT` クエリは 1 つのレプリカからだけデータ書き込み完了の確認を待ちます。データが 1 つのレプリカにしか書き込まれておらず、そのレプリカを持つサーバーが消失した場合、そのデータは失われます。複数レプリカからのデータ書き込みの確認を有効にするには、`insert_quorum` オプションを使用します。

各データブロックはアトミックに書き込まれます。`INSERT` クエリは最大 `max_insert_block_size = 1048576` 行までのブロックに分割されます。言い換えると、`INSERT` クエリの行数が 1048576 未満であれば、そのクエリは 1 つの原子的な操作として実行されます。

データブロックは重複排除されます。同じデータブロック（同じサイズで、同じ行が同じ順序で含まれるデータブロック）が複数回書き込まれた場合、そのブロックは 1 回だけ書き込まれます。これは、ネットワーク障害などでクライアントアプリケーションがデータが DB に書き込まれたかどうかを判断できない場合に、`INSERT` クエリを単純にリトライできるようにするためです。同一データの `INSERT` がどのレプリカに送られたかは関係ありません。`INSERT` は冪等です。重複排除のパラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) サーバー設定によって制御されます。

レプリケーション中、ネットワークを介して転送されるのは挿入元のデータのみです。その後のデータ変換（マージ）は、すべてのレプリカで同じように協調して実行されます。これによりネットワーク使用量が最小化されるため、レプリカが別々のデータセンターに存在する場合でもレプリケーションは有効に機能します。（別々のデータセンター間でデータを複製することが、レプリケーションの主な目的である点に注意してください。）

同じデータに対して任意の数のレプリカを用意できます。経験上、本番環境では各サーバーに RAID-5 または RAID-6（場合によっては RAID-10）を使用し、二重レプリケーションを行う構成が、比較的信頼性が高く扱いやすい解決策となり得ます。

システムはレプリカ上のデータ同期状態を監視し、障害発生後に復旧することができます。フェイルオーバーは（データ差分が小さい場合は）自動で、（データ差分が大きく、設定ミスが疑われる場合は）半自動で行われます。



## レプリケートされたテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloudでは、レプリケーションは自動的に処理されます。

レプリケーション引数なしで[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)を使用してテーブルを作成してください。システムは内部的に[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)を[`SharedMergeTree`](/cloud/reference/shared-merge-tree)に書き換え、レプリケーションとデータ分散を行います。

レプリケーションはプラットフォームによって管理されるため、`ReplicatedMergeTree`の使用やレプリケーションパラメータの指定は避けてください。

:::

### Replicated\*MergeTreeパラメータ {#replicatedmergetree-parameters}

| パラメータ          | 説明                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `zoo_path`         | ClickHouse Keeper内のテーブルへのパス。                                                                     |
| `replica_name`     | ClickHouse Keeper内のレプリカ名。                                                                          |
| `other_parameters` | レプリケート版の作成に使用されるエンジンのパラメータ。例えば、`ReplacingMergeTree`の`version`など。 |

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

<summary>非推奨構文での例</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

例に示すように、これらのパラメータには波括弧内に置換を含めることができます。置換される値は、設定ファイルの[macros](/operations/server-configuration-parameters/settings.md/#macros)セクションから取得されます。

例:

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper内のテーブルへのパスは、レプリケートされたテーブルごとに一意である必要があります。異なるシャード上のテーブルは異なるパスを持つ必要があります。
この場合、パスは以下の部分で構成されます:

`/clickhouse/tables/`は共通のプレフィックスです。正確にこれを使用することを推奨します。

`{shard}`はシャード識別子に展開されます。

`table_name`はClickHouse Keeper内のテーブルのノード名です。テーブル名と同じにすることを推奨します。テーブル名とは対照的に、RENAMEクエリの後も変更されないため、明示的に定義されます。
_ヒント_: `table_name`の前にデータベース名を追加することもできます。例: `db_name.table_name`

2つの組み込み置換`{database}`と`{table}`を使用できます。これらはそれぞれデータベース名とテーブル名に展開されます(`macros`セクションでこれらのマクロが定義されていない場合)。したがって、zookeeperパスは`'/clickhouse/tables/{shard}/{database}/{table}'`として指定できます。
これらの組み込み置換を使用する場合、テーブルの名前変更には注意してください。ClickHouse Keeper内のパスは変更できず、テーブルの名前が変更されると、マクロは異なるパスに展開され、テーブルはClickHouse Keeper内に存在しないパスを参照し、読み取り専用モードになります。

レプリカ名は同じテーブルの異なるレプリカを識別します。例のように、サーバー名を使用できます。名前は各シャード内で一意である必要があるだけです。

置換を使用する代わりに、パラメータを明示的に定義できます。これはテストや小規模クラスタの設定に便利な場合があります。ただし、この場合、分散DDLクエリ(`ON CLUSTER`)は使用できません。

大規模クラスタで作業する場合、エラーの可能性を減らすため、置換の使用を推奨します。

サーバー設定ファイルで`Replicated`テーブルエンジンのデフォルト引数を指定できます。例えば:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブル作成時に引数を省略できます:

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

これは以下と同等です:


```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカごとに `CREATE TABLE` クエリを実行します。このクエリは、新しいレプリケーテッドテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

テーブルがすでに他のレプリカ上にデータを保持している状態で新しいレプリカを追加した場合、クエリ実行後に他のレプリカから新しいレプリカにデータがコピーされます。言い換えると、新しいレプリカは他のレプリカと同期されます。

レプリカを削除するには、`DROP TABLE` を実行します。ただし、削除されるのは 1 つのレプリカだけであり、それはクエリを実行したサーバー上に存在するレプリカです。


## 障害後の復旧 {#recovery-after-failures}

サーバー起動時にClickHouse Keeperが利用できない場合、レプリケートされたテーブルは読み取り専用モードに切り替わります。システムは定期的にClickHouse Keeperへの接続を試みます。

`INSERT`の実行中にClickHouse Keeperが利用できない場合、またはClickHouse Keeperとのやり取り中にエラーが発生した場合、例外がスローされます。

ClickHouse Keeperに接続した後、システムはローカルファイルシステム内のデータセットが期待されるデータセットと一致するかどうかを確認します(ClickHouse Keeperはこの情報を保存しています)。軽微な不整合がある場合、システムはレプリカとデータを同期することで解決します。

システムが破損したデータパーツ(ファイルサイズが誤っているもの)または認識されないパーツ(ファイルシステムに書き込まれているがClickHouse Keeperに記録されていないパーツ)を検出した場合、それらを`detached`サブディレクトリに移動します(削除はされません)。不足しているパーツはレプリカからコピーされます。

なお、ClickHouseは大量のデータを自動的に削除するような破壊的な操作は一切実行しません。

サーバーの起動時(またはClickHouse Keeperとの新しいセッションを確立する時)、すべてのファイルの数とサイズのみを確認します。ファイルサイズが一致していても、途中でバイトが変更されている場合、これは即座には検出されず、`SELECT`クエリでデータを読み取ろうとした時にのみ検出されます。クエリはチェックサムの不一致または圧縮ブロックのサイズに関する例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルのデータセットが期待されるものと大きく異なる場合、安全機構が作動します。サーバーはこれをログに記録し、起動を拒否します。これは、シャード上のレプリカが誤って別のシャード上のレプリカのように設定されているなど、設定エラーを示している可能性があるためです。ただし、この機構の閾値はかなり低く設定されており、通常の障害復旧中にこの状況が発生する可能性があります。この場合、データは半自動的に復元されます - 「ボタンを押す」ことによって。

復旧を開始するには、ClickHouse Keeper内に任意の内容で`/path_to_table/replica_name/flags/force_restore_data`ノードを作成するか、すべてのレプリケートされたテーブルを復元するコマンドを実行します:

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

その後、サーバーを再起動します。起動時に、サーバーはこれらのフラグを削除し、復旧を開始します。


## 完全なデータ損失後の復旧 {#recovery-after-complete-data-loss}

いずれかのサーバーからすべてのデータとメタデータが消失した場合は、以下の手順で復旧を行います:

1.  サーバーにClickHouseをインストールします。シャード識別子とレプリカを使用している場合は、それらを含む設定ファイルで置換を正しく定義してください。
2.  サーバー上で手動で複製する必要がある非レプリケートテーブルがある場合は、レプリカからそれらのデータをコピーしてください(ディレクトリ `/var/lib/clickhouse/data/db_name/table_name/` 内)。
3.  レプリカから `/var/lib/clickhouse/metadata/` にあるテーブル定義をコピーします。テーブル定義内でシャードまたはレプリカ識別子が明示的に定義されている場合は、このレプリカに対応するように修正してください。(または、サーバーを起動し、`/var/lib/clickhouse/metadata/` 内の.sqlファイルに含まれているはずのすべての `ATTACH TABLE` クエリを実行してください。)
4.  復旧を開始するには、任意の内容でClickHouse Keeperノード `/path_to_table/replica_name/flags/force_restore_data` を作成するか、すべてのレプリケートテーブルを復元するコマンドを実行してください: `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバーを起動してください(既に実行中の場合は再起動してください)。データはレプリカからダウンロードされます。

代替の復旧方法として、ClickHouse Keeperから消失したレプリカに関する情報(`/path_to_table/replica_name`)を削除し、「[レプリケートテーブルの作成](#creating-replicated-tables)」で説明されている手順でレプリカを再作成することもできます。

復旧中のネットワーク帯域幅に制限はありません。多数のレプリカを一度に復元する場合は、この点に留意してください。


## MergeTreeからReplicatedMergeTreeへの変換 {#converting-from-mergetree-to-replicatedmergetree}

`MergeTree`という用語は、`ReplicatedMergeTree`と同様に、`MergeTreeファミリー`に属するすべてのテーブルエンジンを指します。

手動でレプリケーションを行っていた`MergeTree`テーブルがある場合、それをレプリケーション対応のテーブルに変換できます。`MergeTree`テーブルに既に大量のデータを蓄積しており、レプリケーションを有効にしたい場合に、この変換が必要になることがあります。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)ステートメントを使用すると、デタッチされた`MergeTree`テーブルを`ReplicatedMergeTree`としてアタッチできます。

`MergeTree`テーブルは、テーブルのデータディレクトリ（`Atomic`データベースの場合は`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`）に`convert_to_replicated`フラグが設定されている場合、サーバー再起動時に自動的に変換できます。
空の`convert_to_replicated`ファイルを作成すると、次回のサーバー再起動時にテーブルがレプリケーション対応として読み込まれます。

次のクエリを使用して、テーブルのデータパスを取得できます。テーブルに複数のデータパスがある場合は、最初のパスを使用してください。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

ReplicatedMergeTreeテーブルは、`default_replica_path`および`default_replica_name`設定の値を使用して作成されることに注意してください。
他のレプリカで変換後のテーブルを作成するには、`ReplicatedMergeTree`エンジンの第1引数でそのパスを明示的に指定する必要があります。次のクエリを使用してそのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

手動で変換を行う方法もあります。

各レプリカでデータが異なる場合は、まずデータを同期するか、1つのレプリカを除くすべてのレプリカでデータを削除してください。

既存のMergeTreeテーブルの名前を変更し、元の名前で`ReplicatedMergeTree`テーブルを作成します。
古いテーブルのデータを、新しいテーブルデータのディレクトリ内の`detached`サブディレクトリ（`/var/lib/clickhouse/data/db_name/table_name/`）に移動します。
次に、いずれかのレプリカで`ALTER TABLE ATTACH PARTITION`を実行して、これらのデータパーツを作業セットに追加します。


## ReplicatedMergeTreeからMergeTreeへの変換 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)ステートメントを使用して、デタッチされた`ReplicatedMergeTree`テーブルを単一サーバー上で`MergeTree`としてアタッチします。

別の方法として、サーバーの再起動を伴う手順があります。異なる名前でMergeTreeテーブルを作成します。`ReplicatedMergeTree`テーブルのデータがあるディレクトリから、新しいテーブルのデータディレクトリにすべてのデータを移動します。その後、`ReplicatedMergeTree`テーブルを削除し、サーバーを再起動します。

サーバーを起動せずに`ReplicatedMergeTree`テーブルを削除する場合:

- メタデータディレクトリ(`/var/lib/clickhouse/metadata/`)内の対応する`.sql`ファイルを削除します。
- ClickHouse Keeper内の対応するパス(`/path_to_table/replica_name`)を削除します。

この後、サーバーを起動し、`MergeTree`テーブルを作成し、データをそのディレクトリに移動してから、サーバーを再起動します。


## ClickHouse Keeperクラスタのメタデータが失われた、または破損した場合の復旧 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeperのデータが失われた、または破損した場合、上記で説明した方法で非レプリケーションテーブルに移動することでデータを保存できます。

**関連項目**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
