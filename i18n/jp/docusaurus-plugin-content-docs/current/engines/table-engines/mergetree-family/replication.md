---
slug: /engines/table-engines/mergetree-family/replication
sidebar_position: 20
sidebar_label: データレプリケーション
title: "データレプリケーション"
description: "ClickHouseにおけるデータレプリケーションの概要"
---


# データレプリケーション

:::note
ClickHouse Cloudではレプリケーションが自動で管理されます。引数を追加せずにテーブルを作成してください。例えば、以下のテキストで次のように置き換えます:

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}',
    ver
)
```

を次のようにします:

```sql
ENGINE = ReplicatedMergeTree
```
:::

レプリケーションは、MergeTreeファミリーのテーブルにのみ対応しています：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

レプリケーションは、個々のテーブルのレベルで機能し、サーバ全体ではありません。サーバは、レプリケートされたテーブルと非レプリケートのテーブルを同時に保持できます。

レプリケーションはシャーディングには依存せず、各シャードには独立したレプリケーションがあります。

`INSERT`および`ALTER`クエリによって圧縮されたデータはレプリケートされます（詳細は、[ALTER](/sql-reference/statements/alter)のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH`および`RENAME`のクエリは、単一のサーバ上で実行され、レプリケートされません：

- `CREATE TABLE`クエリは、クエリが実行されるサーバ上に新しいレプリケート可能なテーブルを作成します。このテーブルが他のサーバに既に存在する場合、新しいレプリカを追加します。
- `DROP TABLE`クエリは、クエリが実行されるサーバ上に存在するレプリカを削除します。
- `RENAME`クエリは、あるレプリカ上のテーブルの名前を変更します。言い換えれば、レプリケートされたテーブルは異なるレプリカで異なる名前を持つことができます。

ClickHouseは、レプリカのメタ情報を保存するために[ClickHouse Keeper](/guides/sre/keeper/index.md)を使用します。ZooKeeperのバージョン3.4.5以降を使用することも可能ですが、ClickHouse Keeperが推奨されます。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper)サーバ設定セクションでパラメータを設定します。

:::note
セキュリティ設定を無視しないでください。ClickHouseは、ZooKeeperセキュリティサブシステムの`digest` [ACLスキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)をサポートしています。
:::

ClickHouse Keeperクラスタのアドレスを設定する例：

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

ClickHouseはまた、補助的なZooKeeperクラスタにレプリカのメタ情報を保存することをサポートしています。これは、ZooKeeperクラスタ名とパスをエンジンの引数として提供することで実現します。言い換えれば、異なるテーブルのメタデータを異なるZooKeeperクラスタに保存できます。

補助ZooKeeperクラスタのアドレスを設定する例：

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

補助ZooKeeperクラスタにテーブルのメタデータを保存するには、次のようにReplicatedMergeTreeエンジンを使用してテーブルを作成します：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

既存のZooKeeperクラスタを指定すると、システムはそのディレクトリを自分のデータ用に使用します（ディレクトリはレプリケート可能なテーブルを作成する際に指定されます）。

設定ファイルにZooKeeperが設定されていない場合、レプリケートテーブルを作成できず、既存のレプリケートテーブルは読み取り専用になります。

ZooKeeperは`SELECT`クエリでは使用されません。なぜなら、レプリケーションは`SELECT`のパフォーマンスに影響を与えず、非レプリケートテーブルと同じ速度でクエリが実行されるからです。分散レプリケートテーブルをクエリする際のClickHouseの動作は、設定[ max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries)および[ fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) によって制御されます。

各`INSERT`クエリでは、約10エントリが複数のトランザクションを通じてZooKeeperに追加されます（より正確には、これは挿入されたデータのブロックごとです；INSERTクエリには1つのブロックまたは`max_insert_block_size = 1048576`行ごとに1ブロックが含まれます）。これにより、非レプリケートテーブルと比較して`INSERT`のレイテンシがわずかに長くなります。しかし、推奨に従って、1秒あたり最大1回の`INSERT`でデータをバッチで挿入すれば、問題は生じません。ZooKeeperクラスタを調整するために使用される全ClickHouseクラスタは、毎秒数百の`INSERT`を使用しています。データ挿入のスループット（毎秒の行数）は、非レプリケートデータと同じくらい高いです。

非常に大きなクラスタの場合、異なるシャードのために異なるZooKeeperクラスタを使用できます。しかし、私たちの経験では、約300サーバの生産クラスタでは必要がないと証明されています。

レプリケーションは非同期でマルチマスターです。`INSERT`クエリ（`ALTER`も同様）は、利用可能な任意のサーバに送信できます。データは、クエリが実行されるサーバに挿入され、その後他のサーバにコピーされます。非同期であるため、最近挿入されたデータは他のレプリカに遅延して表示されます。レプリカの一部が利用できない場合、データはそれらが利用可能になったときに書き込まれます。レプリカが利用できる場合、レイテンシは圧縮データブロックをネットワーク越しに転送するのにかかる時間です。レプリケートテーブルのバックグラウンドタスクを実行するスレッドの数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)設定によって設定できます。

`ReplicatedMergeTree`エンジンは、レプリケートデータの取得用に別のスレッドプールを使用します。プールのサイズは、サーバの再起動によって調整可能な[background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size)設定によって制限されます。

デフォルトでは、INSERTクエリは1つのレプリカからのみデータ書き込みの確認を待ちます。データが1つのレプリカにのみ正常に書き込まれ、そのレプリカのサーバが存在しなくなった場合、保存されたデータは失われます。複数のレプリカからのデータ書き込みの確認を取得するには、`insert_quorum`オプションを使用してください。

各データブロックは原子的に書き込まれます。INSERTクエリは最大`max_insert_block_size = 1048576`行までのブロックに分割されます。言い換えれば、`INSERT`クエリが1048576行未満であれば、原子的に実行されます。

データブロックはデデュプリケートされます。同じデータブロック（同じサイズのデータブロックで、同じ順序の行を含む）の複数回の書き込みの場合、ブロックは1回のみ書き込まれます。これは、クライアントアプリケーションがデータがDBに書き込まれたかどうかわからないネットワーク障害が発生した場合、`INSERT`クエリを単に繰り返すことができるためです。どのレプリカに同じデータでINSERTが送信されたかは関係ありません。`INSERT`は冪等です。デデュプリケーションパラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree)サーバ設定によって制御されます。

レプリケーション中、ネットワークを介して挿入するためのソースデータのみが転送されます。さらなるデータ変換（マージ）は、すべてのレプリカで同じように調整され、実行されます。これにより、ネットワーク使用量が最小限に抑えられるため、異なるデータセンターにレプリカがある場合でもレプリケーションはうまく機能します。（異なるデータセンターにデータを複製することがレプリケーションの主な目的です。）

同じデータのレプリカを何台でも持つことができます。私たちの経験に基づけば、生産環境では、各サーバにRAID-5またはRAID-6（場合によってはRAID-10）を使用した二重レプリケーションが比較的信頼性が高く便利なソリューションになります。

システムはレプリカ間のデータの同期を監視し、障害からの回復ができます。フェイルオーバーは自動（データの小さな差異の場合）または半自動（データがあまりにも異なる場合、これは設定エラーを示している可能性があります）です。

## レプリケートテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloudではレプリケーションが自動で管理されます。引数を追加せずにテーブルを作成してください。例えば、以下のテキストで次のように置き換えます：
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
を次のようにします：
```sql
ENGINE = ReplicatedMergeTree
```
:::

`Replicated`プレフィックスがテーブルエンジン名に追加されます。例えば：`ReplicatedMergeTree`。

:::tip
ClickHouse Cloudでは全てのテーブルがレプリケートされるため、`Replicated`を追加することは任意です。
:::

### Replicated*MergeTreeパラメータ {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeperにおけるテーブルのパス。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeperにおけるレプリカ名。

#### other_parameters {#other_parameters}

`other_parameters` — レプリケートされたバージョンを作成するために使用されるエンジンのパラメータ。例：`ReplacingMergeTree`のバージョン。

例：

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

この例のように、これらのパラメータには波括弧内の置換が含まれることがあります。置換された値は、設定ファイルの[macros](/operations/server-configuration-parameters/settings.md/#macros)セクションから取得されます。

例：

``` xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeperのテーブルへのパスは、各レプリケートテーブルに対してユニークである必要があります。異なるシャードのテーブルは異なるパスを持つべきです。
この場合、パスは次の部分で構成されます：

`/clickhouse/tables/`は共通のプレフィックスです。正確にこれを使用することをお勧めします。

`{shard}`はシャード識別子に展開されます。

`table_name`はClickHouse Keeper内のテーブルのノード名です。同じにすることが良いアイデアです。これは明示的に定義されており、テーブル名とは異なり、RENAMEクエリの後に変更されることはありません。
*ヒント*: `table_name`の前にデータベース名を追加することもできます。例えば、`db_name.table_name`

2つの組み込み置換`{database}`および`{table}`を使用することができ、それぞれテーブル名とデータベース名に展開されます（これらのマクロが`macros`セクションに定義されていない限り）。したがって、ZooKeeperのパスは`'/clickhouse/tables/{shard}/{database}/{table}'`として指定できます。
これらの組み込み置換を使用する場合、テーブル名の変更には注意が必要です。ClickHouse Keeperのパスは変更できず、テーブルがリネームされると、マクロは異なるパスに展開され、テーブルはClickHouse Keeperに存在しないパスを参照し、読み取り専用モードになります。

レプリカ名は同じテーブルの異なるレプリカを識別します。ここにサーバ名を使用できます。名前は各シャードごとにユニークである必要があります。

置換を使用する代わりに、明示的にパラメータを定義することができます。これは、テストや小規模クラスタの構成には便利ですが、この場合、分散DDLクエリ（`ON CLUSTER`）を使用できません。

大規模クラスタで作業する場合、私たちは置換を使用することをお勧めします。なぜなら、これによってエラーの可能性が減るからです。

`Replicated`テーブルエンジンに対するデフォルト引数をサーバの設定ファイルで指定できます。例えば：

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブルを作成する際、引数を省略することができます：

``` sql
CREATE TABLE table_name (
	x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

これは次のように等価です：

``` sql
CREATE TABLE table_name (
	x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカで`CREATE TABLE`クエリを実行します。このクエリは新しいレプリケートされたテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

テーブルが他のレプリカにデータを含む場合、テーブルに新しいレプリカを追加すると、クエリを実行した後に、他のレプリカから新しいレプリカにデータがコピーされます。言い換えれば、新しいレプリカは他のレプリカと同期を取ります。

レプリカを削除するには、`DROP TABLE`を実行します。ただし、クエリを実行するサーバ上の1つのレプリカのみが削除されます。

## 障害からの回復 {#recovery-after-failures}

サーバが起動する際にClickHouse Keeperが利用できない場合、レプリケートテーブルは読み取り専用モードになります。システムは定期的にClickHouse Keeperに接続を試みます。

`INSERT`中にClickHouse Keeperが利用できない場合や、ClickHouse Keeperとの相互作用中にエラーが発生した場合、例外がスローされます。

ClickHouse Keeperに接続した後、システムはローカルファイルシステム内のデータセットが期待されるデータセットと一致するかを確認します（ClickHouse Keeperがこの情報を保存しています）。小さな不整合がある場合、システムはデータをレプリカと同期させることでそれを解決します。

システムが壊れたデータパーツ（ファイルのサイズが間違っている）や認識されないパーツ（ファイルシステムに書き込まれたがClickHouse Keeperに記録されていないパーツ）を検出した場合、それらを`detached`サブディレクトリに移動します（削除されません）。不足しているパーツはレプリカからコピーされます。

ClickHouseは大量のデータを自動的に削除するなどの破壊的アクションを実行しないことに注意してください。

サーバが起動する際（またはClickHouse Keeperと新しいセッションを確立する際）、システムはすべてのファイルの数量とサイズのみを確認します。ファイルサイズが一致していても、バイトが途中で変更されている場合は、これはすぐには検出されず、`SELECT`クエリのデータを読み込もうとするときにのみ検出されます。このクエリは、チェックサムや圧縮ブロックのサイズが一致しないことについての例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルでのデータセットが期待されるものとあまりにも異なる場合、安全機構がトリガーされます。サーバはこれをログに記録し、起動を拒否します。この理由は、このケースが設定エラーを示す可能性があるためです。たとえば、シャードのレプリカが異なるシャードのレプリカとして構成されてしまった場合です。しかし、この機構のしきい値はかなり低く設定されており、この状況は通常の障害回復中に発生します。この場合、データは半自動的に復元されます - "ボタンを押す"ことで。

回復を開始するには、ClickHouse Keeper内に`/path_to_table/replica_name/flags/force_restore_data`ノードを任意の内容で作成するか、すべてのレプリケートテーブルを復元するためのコマンドを実行します：

``` bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

次に、サーバを再起動します。起動時にサーバはこれらのフラグを削除し、回復を開始します。

## データの完全な消失後の回復 {#recovery-after-complete-data-loss}

サーバのすべてのデータおよびメタデータが消えた場合、回復の手順は次の通りです：

1.  サーバにClickHouseをインストールします。シャード識別子とレプリカを含む設定ファイルで置換を正しく定義します。
2.  手動で複製する必要がある非レプリケートテーブルがあった場合、それらのデータを他のレプリカからコピーします（`/var/lib/clickhouse/data/db_name/table_name/`に）。
3.  レプリカから`/var/lib/clickhouse/metadata/`にあるテーブル定義をコピーします。テーブル定義にシャードまたはレプリカ識別子が明示的に定義されている場合、それを修正し、このレプリカに一致させます。（あるいは、サーバを起動し、`/var/lib/clickhouse/metadata/`内に存在すべきすべての`ATTACH TABLE`クエリを実行します。）
4.  回復を開始するには、ClickHouse Keeper内に`/path_to_table/replica_name/flags/force_restore_data`ノードを任意の内容で作成するか、すべてのレプリケートテーブルを復元するためのコマンドを実行します：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバを起動します（すでに起動している場合は再起動します）。データはレプリカからダウンロードされます。

別の回復オプションは、ClickHouse Keeperから失われたレプリカに関する情報を削除し（`/path_to_table/replica_name`）、その後、"[レプリケートテーブルの作成](#creating-replicated-tables)"で再度レプリカを作成することです。

回復中にネットワーク帯域幅に制限はありません。多くのレプリカを一度に復元する場合は、これを考慮してください。

## MergeTreeからReplicatedMergeTreeへの変換 {#converting-from-mergetree-to-replicatedmergetree}

私たちは、すべてのテーブルエンジンを`MergeTree`ファミリーのものとして指しており、`ReplicatedMergeTree`と同様です。

手動でレプリケートされた`MergeTree`テーブルがある場合、それをレプリケートテーブルに変換できます。これは、`MergeTree`テーブルに既に大容量のデータが収集され、今レプリケーションを有効にしたい場合に必要になるかもしれません。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)ステートメントにより、デタッチされた`MergeTree`テーブルを`ReplicatedMergeTree`として添付できます。

データディレクトリ内に`convert_to_replicated`フラグが設定されている場合、サーバの再起動時に`MergeTree`テーブルは自動的に変換されます（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`、Atomicデータベースの場合）。空の`convert_to_replicated`ファイルを作成すると、次回のサーバ起動時にテーブルはレプリケートとしてロードされます。

このクエリはテーブルのデータパスを取得するために使用できます。テーブルに多くのデータパスがある場合、最初のものを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

`ReplicatedMergeTree`テーブルは、`default_replica_path`および`default_replica_name`設定の値で作成されることに注意してください。他のレプリカに変換されたテーブルを作成するには、最初の引数としてそのパスを明示的に指定する必要があります。次のクエリを使用して、そのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

これを手動で行う方法もあります。

さまざまなレプリカでデータが異なる場合、まずそれを同期させるか、1つのレプリカを除くすべてのレプリカでこのデータを削除します。

既存のMergeTreeテーブルの名前を変更し、古い名前で`ReplicatedMergeTree`テーブルを作成します。
古いテーブルのデータを新しいテーブルのデータディレクトリ内の`detached`サブディレクトリに移動します（`/var/lib/clickhouse/data/db_name/table_name/`）。
その後、レプリカの1つで`ALTER TABLE ATTACH PARTITION`を実行して、これらのデータパーツを作業セットに追加します。

## ReplicatedMergeTreeからMergeTreeへの変換 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)ステートメントを使用して、デタッチされた`ReplicatedMergeTree`テーブルを単一のサーバに`MergeTree`として添付します。

これを行うもう一つの方法は、サーバの再起動です。異なる名前のMergeTreeテーブルを作成します。`ReplicatedMergeTree`テーブルのデータを新しいテーブルのデータディレクトリに移動します。その後、`ReplicatedMergeTree`テーブルを削除し、サーバを再起動します。

サーバを起動せずに`ReplicatedMergeTree`テーブルを削除したい場合：

- メタデータディレクトリ（`/var/lib/clickhouse/metadata/`）内の該当する`.sql`ファイルを削除します。
- ClickHouse Keeper内の該当するパス（`/path_to_table/replica_name`）を削除します。

これを実行した後、サーバを起動し、`MergeTree`テーブルを作成して、データをそのディレクトリに移動し、その後サーバを再起動することができます。

## ClickHouse Keeperクラスタ内のメタデータが失われた場合や損傷した場合の回復 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeperのデータが失われたり損傷したりした場合、上記のように非レプリケートテーブルにデータを移動することでデータを保存できます。

**参照してください**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
