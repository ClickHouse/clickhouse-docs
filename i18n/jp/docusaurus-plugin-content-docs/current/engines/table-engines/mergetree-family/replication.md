---
'description': 'ClickHouseにおけるデータレプリケーションの概要'
'sidebar_label': 'データレプリケーション'
'sidebar_position': 20
'slug': '/engines/table-engines/mergetree-family/replication'
'title': 'データレプリケーション'
'doc_type': 'reference'
---



# データレプリケーション

:::note
ClickHouse Cloudでは、レプリケーションが管理されています。引数を追加せずにテーブルを作成してください。たとえば、以下のテキスト内の

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

を次のように置き換えます：

```sql
ENGINE = ReplicatedMergeTree
```
:::

レプリケーションは、MergeTreeファミリーのテーブルに対してのみサポートされています：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

レプリケーションは、個々のテーブルのレベルで機能し、サーバ全体には適用されません。サーバは、レプリケーションされたテーブルとレプリケーションされていないテーブルの両方を同時に保存できます。

レプリケーションはシャーディングに依存しません。各シャードは独自のレプリケーションを持ちます。

`INSERT`および`ALTER`クエリのために圧縮データはレプリケートされます（詳細については、[ALTER](/sql-reference/statements/alter)のドキュメントを参照してください）。

`CREATE`、`DROP`、`ATTACH`、`DETACH`および`RENAME`クエリは、単一のサーバ上で実行され、レプリケートされることはありません：

- `CREATE TABLE`クエリは、クエリが実行されたサーバ上に新しいレプリケート可能なテーブルを作成します。このテーブルが他のサーバに既に存在する場合、新しいレプリカが追加されます。
- `DROP TABLE`クエリは、クエリが実行されたサーバにあるレプリカを削除します。
- `RENAME`クエリは、レプリカの1つ上のテーブルの名前を変更します。言い換えれば、レプリケートされたテーブルは、異なるレプリカで異なる名前を持つことができます。

ClickHouseは、レプリカのメタ情報を格納するために[ClickHouse Keeper](/guides/sre/keeper/index.md)を使用します。ZooKeeperバージョン3.4.5以上を使用することは可能ですが、ClickHouse Keeperが推奨されます。

レプリケーションを使用するには、[zookeeper](/operations/server-configuration-parameters/settings#zookeeper)サーバ構成セクションにパラメータを設定してください。

:::note
セキュリティ設定を怠らないでください。ClickHouseは、ZooKeeperセキュリティサブシステムの`digest` [ACLスキーム](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)をサポートしています。
:::

ClickHouse Keeperクラスターのアドレスを設定する例：

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

ClickHouseはまた、補助ZooKeeperクラスターにレプリカのメタ情報を保存することもサポートしています。これは、ZooKeeperクラスター名とパスをエンジン引数として提供することで実現します。
言い換えれば、異なるテーブルのメタデータを異なるZooKeeperクラスターに保存することができます。

補助ZooKeeperクラスターのアドレスを設定する例：

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

補助ZooKeeperクラスターにテーブルメタデータを保存するために、ReplicatedMergeTreeエンジンを使用して以下のようにテーブルをSQLで作成できます：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
既存のZooKeeperクラスターを指定できます。システムは、そのデータのためにディレクトリを使用します（ディレクトリは、レプリケータブルテーブルを作成するときに指定されます）。

構成ファイルにZooKeeperが設定されていない場合、レプリケーションテーブルを作成することはできず、既存のレプリケーションテーブルは読み取り専用になります。

ZooKeeperは`SELECT`クエリには使用されません。なぜなら、レプリケーションは`SELECT`のパフォーマンスに影響を与えず、クエリはレプリケーションされていないテーブルと同じ速度で実行されるからです。分散レプリケーションテーブルをクエリするとき、ClickHouseの動作は、[max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries)および[fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries)の設定によって制御されます。

各`INSERT`クエリのために、約10エントリが複数のトランザクションを通じてZooKeeperに追加されます。（正確には、各挿入データブロックのためです；INSERTクエリには1つのブロックまたは`max_insert_block_size = 1048576`行あたり1つのブロックが含まれます。）これにより、レプリケートされないテーブルと比較して`INSERT`の遅延が若干長くなります。しかし、推奨に従って、データを1秒あたりの`INSERT`が1回を超えないバッチで挿入すれば、何の問題も生じません。あるZooKeeperクラスターを調整するために使用されるClickHouseクラスタ全体では、毎秒数百回の`INSERT`が行われています。データ挿入のスループット（毎秒の行数）は、レプリケートされていないデータと同じくらい高いものです。

非常に大きなクラスタでは、異なるシャードごとに異なるZooKeeperクラスターを使用できます。しかし、我々の経験上、約300のサーバを持つプロダクションクラスタに基づいて、これは必要ないことが証明されています。

レプリケーションは非同期でマルチマスターです。`INSERT`クエリ（および`ALTER`）は、使用可能な任意のサーバに送信できます。データはクエリが実行されるサーバに挿入され、その後他のサーバにコピーされます。非同期であるため、最近挿入されたデータは他のレプリカでいくらかの遅延の後に表示されます。レプリカの一部が使用できない場合、データはそれらが利用可能になったときに書き込まれます。レプリカが利用可能な場合、遅延は圧縮データのブロックをネットワーク越しに転送するのにかかる時間です。レプリケートされたテーブルのバックグラウンドタスクを実行するスレッドの数は、[background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)設定で設定できます。

`ReplicatedMergeTree`エンジンは、レプリケートされた取得に対して別のスレッドプールを使用します。プールのサイズは、[background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)設定によって制限されており、サーバの再起動で調整できます。

デフォルトでは、INSERTクエリは、1つのレプリカからデータの書き込みの確認を待ちます。データが1つのレプリカにのみ正常に書き込まれ、このレプリカのサーバが存在しなくなった場合、格納されたデータは失われます。複数のレプリカからのデータ書き込み確認を受け取るようにするには、`insert_quorum`オプションを使用してください。

各データブロックは原子的に書き込まれます。INSERTクエリは、最大`max_insert_block_size = 1048576`行までのブロックに分割されます。言い換えれば、`INSERT`クエリの行数が1048576未満の場合、それは原子的に操作されます。

データブロックは重複排除されます。同じデータブロック（同じサイズで同じ順序で同じ行を含むデータブロック）の複数回の書き込みに対して、ブロックは1度だけ書き込まれます。これは、クライアントアプリケーションがデータがDBに書き込まれたかどうかを知らないネットワーク障害が発生した場合に備えています。従って、`INSERT`クエリは単に繰り返すことができます。どのレプリカに同じデータが含まれる`INSERT`が送信されたかは重要ではありません。`INSERT`は冪等性を持っています。重複排除パラメータは、[merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree)サーバの設定によって制御されます。

レプリケーション中は、挿入するソースデータのみがネットワークを介して転送されます。それ以降のデータ変換（マージ）は、同様に全てのレプリカで調整され、実行されます。これにより、ネットワークの使用が最小限に抑えられ、異なるデータセンターにレプリカが存在する場合でもレプリケーションがうまく機能するのです。（異なるデータセンターにデータを複製することがレプリケーションの主な目標です。）

同じデータのレプリカは任意の数存在できます。我々の経験に基づくと、生産環境では各サーバがRAID-5またはRAID-6（場合によってはRAID-10）を使用してダブルレプリケーションを行うという比較的信頼性が高く便利な解決策を使用することができます。

システムはレプリカのデータの同期を監視し、障害後の復帰が可能です。フェイルオーバーは自動（データ間の小さな差異に対して）または半自動（データがあまりにも異なる場合、設定エラーの可能性があります）です。

## レプリケートされたテーブルの作成 {#creating-replicated-tables}

:::note
ClickHouse Cloudでは、レプリケーションが自動的に処理されます。

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)をレプリケーション引数なしで使用してテーブルを作成します。システムは内部的に[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)を[`SharedMergeTree`](/cloud/reference/shared-merge-tree)に書き換えてレプリケーションとデータ分配を行います。

`ReplicatedMergeTree`を使用したり、レプリケーションパラメータを指定したりすることは避けてください。レプリケーションはプラットフォームによって管理されています。

:::

### Replicated*MergeTreeパラメータ {#replicatedmergetree-parameters}

| パラメータ       | 説明                                                                  |
|-----------------|----------------------------------------------------------------------|
| `zoo_path`      | ClickHouse Keeperにおけるテーブルのパス。                            |
| `replica_name`  | ClickHouse Keeperにおけるレプリカの名前。                            |
| `other_parameters` | レプリケート版を作成するために使用されるエンジンのパラメータ、例えば、`ReplacingMergeTree`のバージョン。 |

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

例のように、これらのパラメータには中かっこ内で置き換えを含めることができます。置き換えられた値は、設定ファイルの[macros](/operations/server-configuration-parameters/settings.md/#macros)セクションから取得されます。

例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeperにおけるテーブルのパスは、各レプリケートされたテーブルに対して一意であるべきです。異なるシャードのテーブルには異なるパスを持たせる必要があります。
この場合、パスは以下の部分から構成されます：

`/clickhouse/tables/`は共通の接頭辞です。これを使用することを推奨します。

`{shard}`はシャード識別子に展開されます。

`table_name`はClickHouse Keeper内のテーブル用のノード名です。それをテーブル名と同じにすることをお勧めします。これは明示的に定義されるため、テーブル名とは異なり、`RENAME`クエリの後は変更されません。
*ヒント*：`table_name`の前にデータベース名を追加することもできます。例えば、`db_name.table_name`

2つの組み込みの置き換え`{database}`と`{table}`が使用でき、それぞれテーブル名とデータベース名に展開されます（これらのマクロが`macros`セクションで定義されていない限り）。したがって、ZooKeeperのパスは`'/clickhouse/tables/{shard}/{database}/{table}'`として指定できます。
これらの組み込み置き換えを使用する際のテーブル名の変更には注意してください。ClickHouse Keeper内のパスは変更できず、テーブル名が変更されると、マクロが異なるパスに展開され、テーブルは存在しないClickHouse Keeperのパスを指し、読み取り専用モードになります。

レプリカ名は、同じテーブルの異なるレプリカを識別します。例のように、サーバ名を使用できます。この名前は、各シャード内で一意であればなりません。

置き換えを使用せずにパラメータを明示的に定義することもできます。これは、テストや小規模クラスターの構成に便利かもしれません。ただし、その場合は、分散DDLクエリ（`ON CLUSTER`）を使用できません。

大規模クラスターで作業する際には、置き換えを使用することを推奨します。なぜなら、エラーの可能性を低減するからです。

`Replicated`テーブルエンジンのデフォルト引数をサーバの設定ファイルに指定できます。例えば：

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

この場合、テーブルを作成する際に引数を省略することができます：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

これは以下と同等です：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

各レプリカで`CREATE TABLE`クエリを実行します。このクエリは新しいレプリケートテーブルを作成するか、既存のテーブルに新しいレプリカを追加します。

他のレプリカに既にデータが含まれている場合に新しいレプリカを追加すると、クエリ実行後に他のレプリカから新しいレプリカにデータがコピーされます。言い換えれば、新しいレプリカは他のレプリカと同期されます。

レプリカを削除するには`DROP TABLE`を実行します。ただし、クエリを実行するサーバ上の1つのレプリカのみが削除されます。

## 障害からの回復 {#recovery-after-failures}

サーバが起動する際にClickHouse Keeperが利用できない場合、レプリケートされたテーブルは読み取り専用モードに切り替わります。システムは定期的にClickHouse Keeperへの接続を試みます。

`INSERT`の際にClickHouse Keeperが利用できない場合や、ClickHouse Keeperとのインタラクションでエラーが発生した場合、例外がスローされます。

ClickHouse Keeperに接続した後、システムはローカルファイルシステムのデータセットが期待されるデータセットに合致しているかを確認します（ClickHouse Keeperはこの情報を保存します）。軽微な不整合がある場合、システムはレプリカとのデータ同期によってそれを解決します。

システムが壊れたデータパーツ（間違ったファイルサイズ）や未認識のパーツ（ファイルシステムに書き込まれたがClickHouse Keeperに記録されていないパーツ）を検出した場合、それらを`detached`サブディレクトリに移動します（削除されることはありません）。欠落しているパーツはレプリカからコピーされます。

ClickHouseは、大量のデータを自動的に削除するといった破壊的な操作を行いません。

サーバが起動するとき（またはClickHouse Keeperとの新しいセッションを確立すると）、それはすべてのファイルの数量とサイズのみを確認します。ファイルサイズが一致していても、中間でバイトが変更されている場合、これは直ちに検出されるわけではなく、データを`SELECT`クエリのために読み取ろうとする際にのみ発見されます。この場合、クエリは一致しないチェックサムまたは圧縮ブロックのサイズに関する例外をスローします。この場合、データパーツは検証キューに追加され、必要に応じてレプリカからコピーされます。

ローカルデータセットが期待されるものとあまりにも異なる場合、安全メカニズムがトリガーされます。サーバはこれをログに記録し、起動を拒否します。これは、このケースが設定エラーを示していることを意味する可能性があるからです。たとえば、あるシャード上のレプリカが、別のシャードのレプリカのように誤って設定されていた場合です。しかし、このメカニズムの閾値はかなり低く設定されており、通常の障害回復中にこの状況が発生する可能性があります。この場合、データは半自動的に「ボタンを押す」ことによって復元されます。

回復を開始するには、ClickHouse Keeperにノード`/path_to_table/replica_name/flags/force_restore_data`を作成し、任意の内容を追加するか、すべてのレプリケートテーブルを復元するためのコマンドを実行します：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

次にサーバを再起動します。起動時に、サーバはこれらのフラグを削除し、回復を開始します。

## 完全なデータ損失からの回復 {#recovery-after-complete-data-loss}

1.  サーバにClickHouseをインストールします。置き換えを設定ファイル内で適切に定義し、シャード識別子とレプリカを含める場合はそれを行います。
2.  手動でサーバ上に複製する必要のあるレプリケートされていないテーブルがある場合は、レプリカからデータをコピーします（ディレクトリ`/var/lib/clickhouse/data/db_name/table_name/`）。
3.  レプリカから`/var/lib/clickhouse/metadata/`にあるテーブル定義をコピーします。テーブル定義内でシャードまたはレプリカの識別子が明示的に定義されている場合は、それを修正してこのレプリカに対応させます。（あるいは、サーバを起動し、`/var/lib/clickhouse/metadata/`内の.sqlファイルにすべきだったすべての`ATTACH TABLE`クエリを実行します。）
4.  回復を開始するには、ClickHouse Keeperノード`/path_to_table/replica_name/flags/force_restore_data`を作成し、任意の内容を追加するか、すべてのレプリケートテーブルを復元するコマンドを実行します：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

その後、サーバを起動します（すでに実行中の場合は再起動します）。データがレプリカからダウンロードされます。

別の回復オプションは、 ClickHouse Keeperから失われたレプリカに関する情報を削除し（`/path_to_table/replica_name`）、その後、"[レプリケートされたテーブルの作成](#creating-replicated-tables)"で説明したようにレプリカを再作成することです。

回復中は、ネットワーク帯域幅に制限はありません。複数のレプリカを同時に復元している場合はこれを考慮されるべきです。

## MergeTreeからReplicatedMergeTreeへの変換 {#converting-from-mergetree-to-replicatedmergetree}

`MergeTree`という用語は、`ReplicatedMergeTree`と同様に、`MergeTreeファミリー`内のすべてのテーブルエンジンを指します。

手動でレプリケーションされた`MergeTree`テーブルがある場合、それをレプリケートテーブルに変換することができます。これは、`MergeTree`テーブルに大量のデータを既に収集しており、今、レプリケーションを有効にしたい場合に必要になるかもしれません。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)ステートメントは、デタッチされた`MergeTree`テーブルを`ReplicatedMergeTree`として添付することを許可します。

サーバを再起動すると、`convert_to_replicated`フラグがテーブルのデータディレクトリに設定されている場合、`MergeTree`テーブルは自動的に変換されます（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`内の`Atomic`データベース用）。
空の`convert_to_replicated`ファイルを作成すると、次回サーバを再起動する際にテーブルがレプリケートされた状態でロードされます。

このクエリを使用してテーブルのデータパスを取得できます。テーブルが多くのデータパスを持つ場合、最初のものを使用する必要があります。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

注意してください。ReplicatedMergeTreeテーブルは、`default_replica_path`および`default_replica_name`設定の値で作成されます。
他のレプリカ上に変換されたテーブルを作成するには、`ReplicatedMergeTree`エンジンの最初の引数にそのパスを明示的に指定する必要があります。次のクエリを使用して、そのパスを取得できます。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

これを行う手動の方法もあります。

異なるレプリカ間でデータが異なる場合、まずそれを同期するか、1つを除くすべてのレプリカでこのデータを削除します。

既存のMergeTreeテーブルの名前を変更し、次に古い名前を持つ`ReplicatedMergeTree`テーブルを作成します。
古いテーブルから新しいテーブルデータのディレクトリ内の`detached`サブディレクトリにデータを移動します（`/var/lib/clickhouse/data/db_name/table_name/`）。
その後、レプリカの1つで`ALTER TABLE ATTACH PARTITION`を実行して、これらのデータパーツを作業セットに追加します。

## ReplicatedMergeTreeからMergeTreeへの変換 {#converting-from-replicatedmergetree-to-mergetree}

[ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree)ステートメントを使用して、デタッチされた`ReplicatedMergeTree`テーブルを単一のサーバ上で`MergeTree`として添付します。

もう1つの方法は、サーバを再起動することです。他の名前でMergeTreeテーブルを作成し、`ReplicatedMergeTree`テーブルのデータを持つディレクトリから新しいテーブルのデータディレクトリにすべてのデータを移動します。次に、`ReplicatedMergeTree`テーブルを削除し、サーバを再起動します。

サーバを起動せずに`ReplicatedMergeTree`テーブルを削除したい場合：

- メタデータディレクトリ（`/var/lib/clickhouse/metadata/`）内の対応する.sqlファイルを削除します。
- ClickHouse Keeper内の対応するパス（`/path_to_table/replica_name`）を削除します。

これらを行った後、サーバを起動し、`MergeTree`テーブルを作成し、データをそのディレクトリに移動し、その後、サーバを再起動することができます。

## ClickHouse Keeperクラスター内のメタデータが失われたまたは損傷した場合の回復 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

ClickHouse Keeper内のデータが失われたまたは損傷した場合、上記のようにデータをレプリケートされていないテーブルに移動することでデータを保存できます。

**関連情報**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
