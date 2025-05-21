---
description: 'ClickHouseにおけるデータレプリケーションの概要'
sidebar_label: 'データレプリケーション'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'データレプリケーション'
---


# データレプリケーション

:::note
ClickHouse Cloudでは、レプリケーションが自動的に管理されています。引数を追加せずにテーブルを作成してください。 たとえば、以下のテキストでは次のように置き換えます：

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}',
    ver
)
```

を：

```sql
ENGINE = ReplicatedMergeTree
```
にします。
:::

レプリケーションは、MergeTreeファミリーのテーブルにのみサポートされています：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

レプリケーションは、個々のテーブルのレベルで機能し、サーバ全体では機能しません。サーバは、レプリケーションされたテーブルとレプリケーションされていないテーブルの両方を同時に保存できます。

レプリケーションはシャーディングに依存しません。各シャードは独立したレプリケーションを持っています。

`INSERT`および`ALTER`クエリの圧縮データはレプリケートされます（詳細については、[ALTER](/sql-reference/statements/alter)の文書を参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH`および`RENAME`クエリは、単一のサーバ上で実行され、レプリケートされません：

- `CREATE TABLE`クエリは、実行されるサーバ上に新しいレプリケート可能なテーブルを作成します。このテーブルが他のサーバに既に存在する場合は、新しいレプリカを追加します。
- `DROP TABLE`クエリは、実行されるサーバ上のレプリカを削除します。
- `RENAME`クエリは、レプリカの1つのテーブルの名前を変更します。言い換えれば、レプリケートテーブルは異なるレプリカで異なる名前を持つことができます。

ClickHouseは、レプリカのメタ情報を保存するために [ClickHouse Keeper](/guides/sre/keeper/index.md) を使用します。ZooKeeperのバージョン3.4.5以降を使用することも可能ですが、ClickHouse Keeperの使用が推奨されます。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper)サーバ構成セクションでパラメータを設定してください。

:::note
セキュリティ設定を無視しないでください。ClickHouseは、ZooKeeperセキュリティサブシステムの`digest` [ACLスキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) をサポートしています。
:::

ClickHouse Keeperクラスターのアドレス設定の例：

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

ClickHouseは、補助ZooKeeperクラスターにレプリカのメタ情報を保存することもサポートしています。これは、エンジンの引数としてZooKeeperクラスター名とパスを指定することで行います。
言い換えれば、異なるZooKeeperクラスタに異なるテーブルのメタデータを保存することをサポートしています。

補助ZooKeeperクラスターのアドレス設定の例：

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

補助ZooKeeperクラスターではなくデフォルトのZooKeeperクラスターにテーブルのメタデータを保存するために、SQLを使用してReplicatedMergeTreeエンジンでテーブルを次のように作成できます：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
既存のZooKeeperクラスターを指定でき、システムはそのディレクトリを自分のデータ用に使用します（ディレクトリはレプリケート可能なテーブルを作成するときに指定されます）。

もし設定ファイルにZooKeeperが設定されていない場合、レプリケートテーブルを作成することはできず、既存のレプリケートテーブルは読み取り専用になります。

`SELECT`クエリではZooKeeperは使用されません。レプリケーションは`SELECT`のパフォーマンスに影響を与えず、クエリは非レプリケートテーブルと同じ速度で実行されます。分散レプリケートテーブルをクエリする際、ClickHouseの動作は設定 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) および [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) によって制御されます。

各`INSERT`クエリのために、約十件のエントリがZooKeeperに複数のトランザクションを通じて追加されます。（より正確には、これは挿入された各データブロックごとです。`INSERT`クエリには1ブロックまたは`max_insert_block_size = 1048576`行ごとに1ブロックが含まれます。）これにより、非レプリケートテーブルに比べて`INSERT`にわずかに長い待機時間が発生します。しかし、推奨に従って、1秒あたり1つの`INSERT`を超えないバッチでデータを挿入すれば、問題は発生しません。1つのZooKeeperクラスターを調整するために使用されるClickHouseクラスター全体では、毎秒数百の`INSERT`が行われています。データ挿入のスループット（毎秒の行数）は、非レプリケートデータと同じくらい高いです。

非常に大きなクラスターの場合、異なるシャードに異なるZooKeeperクラスターを使用することができます。ただし、我々の経験からは、約300台のサーバーがあるプロダクションクラスターには必要ないことが証明されています。

レプリケーションは非同期でマルチマスターです。`INSERT`クエリ（および`ALTER`）は、利用可能な任意のサーバに送信できます。データは、クエリが実行されるサーバに挿入され、その後他のサーバにコピーされます。非同期であるため、最近挿入されたデータは他のレプリカには若干のレイテンシを伴って現れます。一部のレプリカが利用できない場合、データはそれらが利用可能になると書き込まれます。レプリカが利用可能な場合、レイテンシは圧縮データのブロックをネットワーク経由で転送するのにかかる時間になります。レプリケートテーブルのバックグラウンドタスクを実行するスレッド数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 設定によって設定できます。

`ReplicatedMergeTree`エンジンは、レプリケートフェッチのために別のスレッドプールを使用します。プールのサイズは、[background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 設定によって制限され、サーバの再起動で調整できます。

デフォルトでは、`INSERT`クエリは1つのレプリカからデータの書き込み確認を待ちます。データが1つのレプリカにのみ正常に書き込まれ、そのレプリカを持つサーバが存在しなくなると、保存されたデータは失われます。複数のレプリカからのデータ書き込みの確認を得るためには、`insert_quorum`オプションを使用してください。

各データブロックは原子的に書き込まれます。`INSERT`クエリは`max_insert_block_size = 1048576`行までのブロックに分割されます。言い換えれば、`INSERT`クエリが1048576行未満の場合、原子的に行われます。

データブロックは重複を排除されています。同じデータブロックの複数の書き込み（同じサイズのデータブロックが同じ行を同じ順序で含む場合）では、ブロックは一度しか書き込まれません。これは、ネットワーク障害時にクライアントアプリケーションがデータがDBに書き込まれたかどうかわからないため、`INSERT`クエリを単純に繰り返すことができるという理由からです。どのレプリカに対しても同一のデータを持つ`INSERT`が送信された場合は関係ありません。`INSERT`は冪等です。重複排除のパラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree)サーバ設定によって制御されます。

レプリケーション中、挿入するためのソースデータのみがネットワークを介して転送されます。さらなるデータ変換（マージ）は、すべてのレプリカの間で同じ方法で調整され、実行されます。これによりネットワークの使用量が最小限に抑えられ、レプリケーションは異なるデータセンターにレプリカが存在する場合でも問題なく機能します。（異なるデータセンターにデータを重複させることがレプリケーションの主な目的であることに注意してください。）

同一のデータのレプリカを任意の数だけ持つことができます。我々の経験に基づけば、実稼働環境で信頼性が高く便利なソリューションは、各サーバがRAID-5またはRAID-6（場合によってはRAID-10）を使用する二重レプリケーションを利用することです。

システムはレプリカ間のデータの整合性を監視し、障害後に復旧が可能です。障害切り替えは、（データの小さな違いの場合は）自動で、（データの違いが大きすぎる場合は、構成エラーを示唆する可能性があるため）半自動で行われます。

## レプリケートテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloudではレプリケーションが自動的に管理されます。引数を追加せずにテーブルを作成してください。 たとえば、以下のテキストでは次のように置き換えます：
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
を：
```sql
ENGINE = ReplicatedMergeTree
```
にします。
:::

`Replicated`のプレフィックスは、テーブルエンジン名に追加されます。たとえば、`ReplicatedMergeTree`。

:::tip
ClickHouse Cloudでは、すべてのテーブルがレプリケートされているため、`Replicated`を追加するのは任意です。
:::

### Replicated\*MergeTreeパラメータ {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeperにおけるテーブルのパス。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeperにおけるレプリカの名前。

#### other_parameters {#other_parameters}

`other_parameters` — レプリケートバージョンを作成するために使用されるエンジンのパラメータ。たとえば、`ReplacingMergeTree`のバージョンなどです。

例：

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

例のように、これらのパラメータは中括弧内の置換を含むことができます。置換された値は、設定ファイルの[macros](/operations/server-configuration-parameters/settings.md/#macros)セクションから取得されます。

例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeperのテーブルのパスは、各レプリケートテーブルに対して一意である必要があります。異なるシャードのテーブルは異なるパスを持つ必要があります。
この場合、パスは以下の部分から構成されます：

`/clickhouse/tables/` は共通の接頭辞です。正確にこれを使用することをお勧めします。

`{shard}` は、シャード識別子に展開されます。

`table_name`は、ClickHouse Keeperにおけるテーブルのノードの名前です。テーブル名と同じにするのが良い考えです。それは明示的に定義されます。テーブル名とは対照的に、`RENAME`クエリの後に変更されることはありません。
*ヒント*: `table_name`の前にデータベース名を追加することもできます。たとえば、`db_name.table_name`

組み込みの置換 `{database}` および `{table}` の2つを使用できます。それはそれぞれテーブル名とデータベース名に展開されます（これらのマクロが`macros`セクションで定義されていない限り）。したがって、zookeeperのパスは `'/clickhouse/tables/{shard}/{database}/{table}'` として指定できます。
これらの組み込み置換を使用する際は、テーブル名の変更に注意してください。ClickHouse Keeperのパスは変更できず、テーブル名を変更すると、マクロは異なるパスに展開され、テーブルはClickHouse Keeperに存在しないパスを指すことになり、読み取り専用モードになります。

レプリカ名は、同一テーブルの異なるレプリカを識別します。これには、例のようにサーバ名を使用できます。名前は、各シャード内で一意であれば十分です。

置換を使用するのではなく、パラメータを明示的に定義することもできます。これは、テストや小規模なクラスターの設定に便利です。ただし、その場合、分散DDLクエリ（`ON CLUSTER`）は使用できません。

大規模なクラスターで作業する場合は、エラーの可能性を減らすために置換を使用することをお勧めします。

`Replicated` テーブルエンジンのデフォルトの引数をサーバの設定ファイルで指定できます。たとえば：

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブル作成時に引数を省略できます：

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

各レプリカで`CREATE TABLE`クエリを実行します。このクエリは、新しいレプリケートテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

テーブルに他のレプリカのデータが既に存在する場合に新しいレプリカを追加すると、クエリを実行した後、データが他のレプリカから新しいレプリカにコピーされます。つまり、新しいレプリカは他のレプリカと同期します。

レプリカを削除するには、`DROP TABLE`を実行します。しかし、削除されるのは1つのレプリカのみで、クエリを実行したサーバ上のレプリカです。

## 障害後の回復 {#recovery-after-failures}

サーバの起動時にClickHouse Keeperが利用できない場合、レプリケートテーブルは読み取り専用モードに切り替わります。システムは定期的にClickHouse Keeperへの接続を試みます。

`INSERT`中にClickHouse Keeperが利用できない場合、またはClickHouse Keeperとのやり取り中にエラーが発生した場合、例外がスローされます。

システムがClickHouse Keeperに接続した後、ローカルファイルシステム内のデータセットが期待されるデータセットと一致するかどうかを確認します（この情報はClickHouse Keeperが保存します）。小さな不整合がある場合、システムはレプリカとデータを同期させることによって解決します。

システムが破損したデータパーツ（ファイルのサイズが異なる）または認識されていないパーツ（ファイルシステムに書き込まれたがClickHouse Keeperに記録されていないパーツ）を検出した場合、それらを`detached`サブディレクトリに移動します（削除はされません）。不足しているパーツはレプリカからコピーされます。

ClickHouseは、大量のデータを自動的に削除するような破壊的な行動を行わないことに注意してください。

サーバが起動すると（またはClickHouse Keeperとの新しいセッションを確立すると）、すべてのファイルの数量とサイズのみを確認します。ファイルサイズが一致していても、どこかの中間でバイトが変更されている場合は、すぐには検出されませんが、`SELECT`クエリのデータを読み取ろうとするときにのみ検出されます。このクエリは、非一致のチェックサムまたは圧縮ブロックのサイズについて例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルデータセットが期待されるものと大きく異なる場合、安全メカニズムがトリガーされます。サーバはこれをログに記録し、起動を拒否します。このケースは、シャード上のレプリカが他のシャードのレプリカのように誤って設定されていることを示唆する構成エラーを示す可能性があるため、こうなります。しかし、このメカニズムの閾値はかなり低く設定されており、この状況は正常な障害回復中にも発生する可能性があります。この場合、データは半自動的に復元されます - 「ボタンを押す」ことによって。

復旧を開始するには、ClickHouse Keeperで任意の内容のノード`/path_to_table/replica_name/flags/force_restore_data`を作成するか、すべてのレプリケートテーブルを復元するコマンドを実行します：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

その後、サーバを再起動します。起動時、サーバはこれらのフラグを削除し、回復を開始します。

## データ完全損失時の回復 {#recovery-after-complete-data-loss}

サーバのすべてのデータとメタデータが消失した場合、復元のためには次の手順を行います：

1.  サーバにClickHouseをインストールします。シャード識別子とレプリカを含む構成ファイル内で置換を正しく定義してください（使用する場合）。
2.  手動で複製する必要がある非レプリケートテーブルがあった場合、それらのデータをレプリカからコピーします（`/var/lib/clickhouse/data/db_name/table_name/`にあります）。
3.  レプリカから`/var/lib/clickhouse/metadata/`にあるテーブル定義をコピーします。テーブル定義でシャードまたはレプリカの識別子が明示的に定義されている場合は、それをこのレプリカに対応するように修正してください。（または、サーバを起動し、`/var/lib/clickhouse/metadata/`にある.sqlファイルに必要であるすべての`ATTACH TABLE`クエリを実行してください。）
4.  復旧を開始するには、ClickHouse Keeperでノード`/path_to_table/replica_name/flags/force_restore_data`を作成するか、すべてのレプリケートテーブルを復元するコマンドを実行します：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバを起動します（すでに起動している場合は再起動します）。データはレプリカからダウンロードされます。

復元のもう一つのオプションは、失われたレプリカに関する情報をClickHouse Keeperから削除し（`/path_to_table/replica_name`）、その後、同様に「レプリカを作成」することです。

復旧中のネットワーク帯域幅に制限はありません。複数のレプリカを同時に復元する場合は、これを考慮してください。

## MergeTreeからReplicatedMergeTreeへの変換 {#converting-from-mergetree-to-replicatedmergetree}

`MergeTree`という用語は、すべてのテーブルエンジンを指します `MergeTreeファミリー` のテーブルと同様に、 `ReplicatedMergeTree`にも言及されます。

手動でレプリケートされていた`MergeTree`テーブルを持っている場合、それをレプリケートテーブルに変換できます。すでに`MergeTree`テーブルに大量のデータを集めた後、レプリケーションを有効にしたい場合には、これを行う必要があるかもしれません。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)文では、デタッチされた`MergeTree`テーブルを`ReplicatedMergeTree`としてアタッチすることができます。

`MergeTree`テーブルは、テーブルのデータディレクトリに`convert_to_replicated`フラグが設定されている場合、サーバの再起動時に自動的に変換されます（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`は`Atomic`データベース用）。

空の`convert_to_replicated`ファイルを作成すると、次のサーバ再起動時にテーブルがレプリケートとしてロードされます。

このクエリを使用して、テーブルのデータパスを取得できます。テーブルに多くのデータパスがある場合、最初のものを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

`ReplicatedMergeTree`テーブルは、`default_replica_path`および`default_replica_name`設定の値で作成されることに注意してください。
他のレプリカで変換テーブルを作成するには、`ReplicatedMergeTree`エンジンの最初の引数にそのパスを明示的に指定する必要があります。次のクエリを使用して、そのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

これを実行する手動な方法もあります。

異なるレプリカ間でデータに違いがある場合は、まずデータを同期させるか、1つを除くすべてのレプリカでこのデータを削除します。

既存のMergeTreeテーブルの名前を変更し、旧名前で`ReplicatedMergeTree`テーブルを作成します。

古いテーブルから新しいテーブルのデータの`detached`サブディレクトリ内に移動します（`/var/lib/clickhouse/data/db_name/table_name/`）。

その後、1つのレプリカで`ALTER TABLE ATTACH PARTITION`を実行して、これらのデータパーツを作業セットに追加します。

## ReplicatedMergeTreeからMergeTreeへの変換 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)文を使用して、デタッチされた`ReplicatedMergeTree`テーブルを単一のサーバーとして`MergeTree`としてアタッチします。

この手順の別の方法は、サーバの再起動を伴います。異なる名前のMergeTreeテーブルを作成します。`ReplicatedMergeTree`テーブルのデータディレクトリからすべてのデータを新しいテーブルのデータディレクトリに移動します。その後、`ReplicatedMergeTree`テーブルを削除し、サーバを再起動します。

サーバを起動せずに`ReplicatedMergeTree`テーブルを削除したい場合：

- メタデータディレクトリ（`/var/lib/clickhouse/metadata/`）内の対応する`.sql`ファイルを削除します。
- ClickHouse Keeper内の対応するパス（`/path_to_table/replica_name`）を削除します。

この後、サーバを起動し`MergeTree`テーブルを作成し、データをそのディレクトリに移動し、サーバを再起動します。

## ClickHouse Keeperクラスター内のメタデータが失われたまたは損傷した時の回復 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeperのデータが失われたまたは損傷した場合、上記の手順に従って、データを非レプリケートテーブルに移動することで保存できます。

**参照**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
