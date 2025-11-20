---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'ClickHouse Keeper の設定'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（clickhouse-keeper）は ZooKeeper の代替となり、レプリケーションとコーディネーション機能を提供します。'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---



# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from "@site/docs/_snippets/_self_managed_only_automated.md"

<SelfManaged />

ClickHouse Keeperは、データ[レプリケーション](/engines/table-engines/mergetree-family/replication.md)と[分散DDL](/sql-reference/distributed-ddl.md)クエリ実行のための調整システムを提供します。ClickHouse KeeperはZooKeeperと互換性があります。

### 実装の詳細 {#implementation-details}

ZooKeeperは、最も初期に登場した著名なオープンソース調整システムの一つです。Javaで実装されており、シンプルかつ強力なデータモデルを持っています。ZooKeeperの調整アルゴリズムであるZooKeeper Atomic Broadcast (ZAB)は、各ZooKeeperノードが読み取りをローカルで処理するため、読み取りに対する線形化可能性の保証を提供しません。ZooKeeperとは異なり、ClickHouse KeeperはC++で記述されており、[RAFTアルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは読み取りと書き込みの両方に対して線形化可能性を実現し、さまざまな言語で複数のオープンソース実装が存在します。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：線形化可能な書き込みと非線形化可能な読み取りです。互換性のあるクライアント・サーバープロトコルを持つため、標準的なZooKeeperクライアントを使用してClickHouse Keeperと対話できます。スナップショットとログはZooKeeperと互換性のない形式ですが、`clickhouse-keeper-converter`ツールを使用することで、ZooKeeperデータをClickHouse Keeperスナップショットに変換できます。ClickHouse Keeperのサーバー間プロトコルもZooKeeperと互換性がないため、ZooKeeperとClickHouse Keeperの混在クラスターは構築できません。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同様にアクセス制御リスト（ACL）をサポートしています。ClickHouse Keeperは同じ権限セットをサポートし、同一の組み込みスキーム（`world`、`auth`、`digest`）を持っています。digest認証スキームは`username:password`のペアを使用し、パスワードはBase64でエンコードされます。

:::note
外部統合はサポートされていません。
:::

### 設定 {#configuration}

ClickHouse Keeperは、ZooKeeperのスタンドアロン代替として、またはClickHouseサーバーの内部コンポーネントとして使用できます。いずれの場合も、設定はほぼ同じ`.xml`ファイルです。

#### Keeper設定項目 {#keeper-configuration-settings}

ClickHouse Keeperのメイン設定タグは`<keeper_server>`であり、以下のパラメータを持ちます：


| パラメータ                           | 説明                                                                                                                                                                                                                                         | デフォルト                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tcp_port`                          | クライアントが接続するためのポート。                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                   | クライアントとkeeper-server間のSSL接続用のセキュアポート。                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                         | 一意のサーバーID。ClickHouse Keeperクラスタの各参加者は一意の番号(1、2、3など)を持つ必要があります。                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                  | コーディネーションログへのパス。ZooKeeperと同様に、負荷の低いノードにログを保存することが推奨されます。                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`             | コーディネーションスナップショットへのパス。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`            | [`reconfig`](#reconfiguration)による動的クラスタ再構成を有効化します。                                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`       | keeperの最大メモリ使用量のソフトリミット(バイト単位)。                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` \* `physical_memory_amount`                                              |
| `max_memory_usage_soft_limit_ratio` | `max_memory_usage_soft_limit`が設定されていないか、ゼロに設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time` | `max_memory_usage_soft_limit`が設定されていないか、`0`に設定されている場合、この間隔で物理メモリ量を監視します。メモリ量が変化すると、`max_memory_usage_soft_limit_ratio`によってKeeperのメモリソフトリミットを再計算します。 | `15`                                                                                                         |
| `http_control`                      | [HTTP制御](#http-control)インターフェースの設定。                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                    | リアルタイムデータ整合性チェックを有効化                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`           | シャットダウン時にスナップショットを作成                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`           | クラスタ設定のホスト名妥当性チェックを有効化(例: localhostがリモートエンドポイントと共に使用されている場合)                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`       | 4lwコマンドのホワイトリスト。                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
| `enable_ipv6`                       | IPv6を有効化                                                                                                                                                                                                                         | `True`                                                                                                       |

その他の共通パラメータはClickHouseサーバー設定(`listen_host`、`logger`など)から継承されます。

#### 内部コーディネーション設定 {#internal-coordination-settings}

内部コーディネーション設定は`<keeper_server>.<coordination_settings>`セクションに配置され、以下のパラメータがあります:


| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一のクライアント操作のタイムアウト (ミリ秒)                                                                                                                                                                            | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト (ミリ秒)                                                                                                                                                                        | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト (ミリ秒)                                                                                                                                                                        | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper がデッドセッションをチェックして削除する頻度 (ミリ秒)                                                                                                                                                  | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper のリーダーがフォロワーにハートビートを送信する頻度 (ミリ秒)                                                                                                                                            | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーが、この間隔内にリーダーからハートビートを受信しなかった場合、リーダー選出を開始できます。`election_timeout_upper_bound_ms` 以下でなければなりません。理想的には両者は同じ値にしないでください。                | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーが、この間隔内にリーダーからハートビートを受信しなかった場合、リーダー選出を開始しなければなりません。                                                                                                        | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 1 つのファイルに保存するログレコード数。                                                                                                                                                                                  | `100000`                                                                                                     |
| `reserved_log_items`               | コンパクションを行う前に保存しておくコーディネーションログレコード数。                                                                                                                                                  | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper が新しいスナップショットを作成する頻度 (ログ内のレコード数)。                                                                                                                                          | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショットの数。                                                                                                                                                                                            | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーを古い状態と見なし、ログではなくスナップショットを送信する際のしきい値。                                                                                                                            | `10000`                                                                                                      |
| `fresh_log_gap`                    | ノードが最新と見なされるタイミング。                                                                                                                                                                                      | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFT に送信される前の、リクエスト数としてのバッチの最大サイズ。                                                                                                                                                          | `100`                                                                                                        |
| `force_sync`                       | 各書き込み時にコーディネーションログに対して `fsync` を呼び出します。                                                                                                                                                    | `true`                                                                                                       |
| `quorum_reads`                     | 読み取りリクエストを、速度が同程度になるよう、RAFT 全体のコンセンサスを通す書き込みとして実行します。                                                                                                                    | `false`                                                                                                      |
| `raft_logs_level`                  | コーディネーションに関するテキストログレベル (trace、debug など)。                                                                                                                                                       | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストのフォワードを許可します。                                                                                                                                                    | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続の終了を待ってシャットダウンするまでの時間 (ミリ秒)。                                                                                                                                                            | `5000`                                                                                                       |
| `startup_timeout`                  | 指定したタイムアウト内にサーバーが他のクォーラム参加者に接続できない場合、サーバーは終了します (ミリ秒)。                                                                                                                | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。すべての書き込みおよび読み取りの保証を維持しつつ、より高いパフォーマンスを実現します。後方互換性を損なわないよう、この設定はデフォルトでは無効になっています。                        | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新のログエントリ用インメモリキャッシュの合計最大サイズ。                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットに次に必要となるログエントリ用インメモリキャッシュの合計最大サイズ。                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | ディスク間でファイルを移動中に障害が発生した後、再試行の間に待機する時間。                                                                                                                                                | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にディスク間でファイルを移動している際に障害が発生した場合の、再試行回数。                                                                                                                                        | `100`                                                                                                        |
| `experimental_use_rocksdb`         | backend ストレージとして RocksDB を使用するかどうか。                                                                                                                                                                    | `0`                                                                                                          |

クォーラム構成は `<keeper_server>.<raft_configuration>` セクションにあり、サーバーの定義を含みます。

クォーラム全体に対する唯一のパラメータは `secure` であり、クォーラム参加者間の通信に対して暗号化された接続を有効にします。ノード間の内部通信に SSL 接続が必要な場合はこのパラメータを `true` に設定し、それ以外の場合は指定しないままにしておくことができます。

各 `<server>` に対する主なパラメータは次のとおりです。



- `id` — クォーラム内のサーバー識別子。
- `hostname` — このサーバーが配置されているホスト名。
- `port` — このサーバーが接続をリッスンするポート。
- `can_become_leader` — サーバーを`learner`として設定する場合は`false`に設定します。省略した場合、値は`true`になります。

:::note
ClickHouse Keeperクラスターのトポロジーが変更される場合(例: サーバーの置き換え)、`server_id`から`hostname`へのマッピングを一貫して保ち、既存の`server_id`を異なるサーバーに対してシャッフルしたり再利用したりしないようにしてください(例: ClickHouse Keeperのデプロイに自動化スクリプトを使用している場合に発生する可能性があります)

Keeperインスタンスのホストが変更される可能性がある場合は、IPアドレスを直接指定するのではなく、ホスト名を定義して使用することを推奨します。ホスト名の変更はサーバーを削除して再度追加することと同等であり、場合によっては実行不可能なことがあります(例: クォーラムに必要なKeeperインスタンスが不足している場合)。
:::

:::note
`async_replication`は後方互換性を損なわないようにデフォルトで無効になっています。クラスター内のすべてのKeeperインスタンスが`async_replication`をサポートするバージョン(v23.9以降)で実行されている場合は、デメリットなくパフォーマンスを向上させることができるため、有効にすることを推奨します。
:::

3ノードのクォーラム構成の例は、`test_keeper_`プレフィックスを持つ[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)で確認できます。サーバー#1の構成例:

```xml
<keeper_server>
    <tcp_port>2181</tcp_port>
    <server_id>1</server_id>
    <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
    <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

    <coordination_settings>
        <operation_timeout_ms>10000</operation_timeout_ms>
        <session_timeout_ms>30000</session_timeout_ms>
        <raft_logs_level>trace</raft_logs_level>
    </coordination_settings>

    <raft_configuration>
        <server>
            <id>1</id>
            <hostname>zoo1</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>2</id>
            <hostname>zoo2</hostname>
            <port>9234</port>
        </server>
        <server>
            <id>3</id>
            <hostname>zoo3</hostname>
            <port>9234</port>
        </server>
    </raft_configuration>
</keeper_server>
```

### 実行方法 {#how-to-run}

ClickHouse KeeperはClickHouseサーバーパッケージにバンドルされています。`/etc/your_path_to_config/clickhouse-server/config.xml`に`<keeper_server>`の設定を追加し、通常通りClickHouseサーバーを起動するだけです。スタンドアロンのClickHouse Keeperを実行したい場合は、次のように同様の方法で起動できます:

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク(`clickhouse-keeper`)がない場合は、作成するか、`clickhouse`の引数として`keeper`を指定できます:

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 4文字コマンド {#four-letter-word-commands}

ClickHouse KeeperはZookeeperとほぼ同じ4lwコマンドも提供しています。各コマンドは`mntr`、`stat`などの4文字で構成されています。いくつかの興味深いコマンドがあります: `stat`はサーバーと接続されたクライアントに関する一般的な情報を提供し、`srvr`と`cons`はそれぞれサーバーと接続に関する詳細情報を提供します。

4lwコマンドにはホワイトリスト設定`four_letter_word_white_list`があり、デフォルト値は`conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`です。

telnetまたはncを使用して、クライアントポートでClickHouse Keeperにコマンドを発行できます。

```bash
echo mntr | nc localhost 9181
```

以下は詳細な4lwコマンドです:

- `ruok`: サーバーがエラーのない状態で実行されているかをテストします。サーバーが実行されている場合は`imok`で応答します。それ以外の場合は、まったく応答しません。`imok`の応答は、サーバーがクォーラムに参加していることを必ずしも示すものではなく、サーバープロセスがアクティブで指定されたクライアントポートにバインドされていることを示すだけです。クォーラムとクライアント接続情報に関する状態の詳細については、"stat"を使用してください。

```response
imok
```


* `mntr`: クラスターの健全性を監視するために使用できる変数の一覧を出力します。

```response
zk_version      v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
zk_avg_latency  0
zk_max_latency  0
zk_min_latency  0
zk_packets_received     68
zk_packets_sent 68
zk_num_alive_connections        1
zk_outstanding_requests 0
zk_server_state leader
zk_znode_count  4
zk_watch_count  1
zk_ephemerals_count     0
zk_approximate_data_size        723
zk_open_file_descriptor_count   310
zk_max_file_descriptor_count    10240
zk_followers    0
zk_synced_followers     0
```

* `srvr`: サーバーに関するすべての詳細情報を一覧表示します。

```response
ClickHouse Keeper バージョン: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
レイテンシ 最小/平均/最大: 0/0/0
受信: 2
送信: 2
接続数: 1
未処理: 0
Zxid: 34
モード: leader
ノード数: 4
```

* `stat`: サーバーおよび接続中のクライアントに関する簡易な情報を一覧表示します。

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
クライアント:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
レイテンシ 最小値/平均値/最大値: 0/0/0
受信数: 4
送信数: 4
接続数: 1
未処理数: 0
Zxid: 36
モード: リーダー
ノード数: 4
```

* `srst`: サーバー統計情報をリセットします。このコマンドは `srvr`、`mntr`、`stat` の結果に影響します。

```response
サーバー統計情報がリセットされました。
```

* `conf`: サerving構成の詳細を出力します。

```response
server_id=1
tcp_port=2181
four_letter_word_white_list=*
log_storage_path=./coordination/logs
snapshot_storage_path=./coordination/snapshots
max_requests_batch_size=100
session_timeout_ms=30000
operation_timeout_ms=10000
dead_session_check_period_ms=500
heart_beat_interval_ms=500
election_timeout_lower_bound_ms=1000
election_timeout_upper_bound_ms=2000
reserved_log_items=1000000000000000
snapshot_distance=10000
auto_forwarding=true
shutdown_timeout=5000
startup_timeout=240000
raft_logs_level=information
snapshots_to_keep=3
rotate_log_storage_interval=100000
stale_log_gap=10000
fresh_log_gap=200
max_requests_batch_size=100
quorum_reads=false
force_sync=false
compress_logs=true
compress_snapshots_with_zstd_format=true
configuration_change_tries_count=20
```

* `cons`: このサーバーに接続しているすべてのクライアントの詳細な接続/セッション情報を一覧表示します。受信/送信パケット数、セッション ID、操作レイテンシ、最後に実行された操作などの情報を含みます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: すべての接続の接続／セッション統計情報をリセットします。

```response
接続統計がリセットされました。
```

* `envi`: 提供環境の詳細を出力します


```response
Environment:
clickhouse.keeper.version=v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
host.name=ZBMAC-C02D4054M.local
os.name=Darwin
os.arch=x86_64
os.version=19.6.0
cpu.count=12
user.name=root
user.home=/Users/JackyWoo/
user.dir=/Users/JackyWoo/project/jd/clickhouse/cmake-build-debug/programs/
user.tmp=/var/folders/b4/smbq5mfj7578f2jzwn602tt40000gn/T/
```

* `dirs`: スナップショットファイルおよびログファイルの合計サイズをバイト単位で表示します

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: サーバーが読み取り専用モードで動作しているかをテストします。サーバーは、読み取り専用モードの場合は `ro` を、そうでない場合は `rw` を返します。

```response
rw
```

* `wchs`: サーバーのウォッチに関する簡潔な情報を一覧表示します。

```response
1個の接続が1個のパスを監視中
総監視数: 1
```

* `wchc`: サーバー上のウォッチに関する詳細情報をセッション単位で一覧表示します。関連付けられたウォッチ（パス）を持つセッション（接続）のリストを出力します。なお、ウォッチの数によってはこの操作は高コストになり（サーバーのパフォーマンスに影響する可能性があります）、慎重に使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: サーバー上のウォッチについて、パスごとの詳細情報を一覧表示します。関連付けられたセッションとともに、パス（znode）の一覧を出力します。ウォッチの数によっては、この操作は高コストとなる可能性がある点に注意してください（サーバーのパフォーマンスに影響を与える場合があります）。慎重に使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: 保留中のセッションとエフェメラルノードを一覧表示します。これはリーダーでのみ機能します。

```response
セッションダンプ (2):
0x0000000000000001
0x0000000000000002
エフェメラルセッション (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: スナップショット作成タスクをスケジュールします。成功した場合は、スケジュールされたスナップショットの最終コミット済みログインデックスを返し、失敗した場合は `Failed to schedule snapshot creation task.` を返します。`lgif` コマンドを使用すると、スナップショットが完了したかどうかを確認できます。

```response
100
```

* `lgif`: Keeper ログ情報。`first_log_idx` : ログストアにおける自身の最初のログインデックス。`first_log_term` : 自身の最初のログターム。`last_log_idx` : ログストアにおける自身の最後のログインデックス。`last_log_term` : 自身の最後のログターム。`last_committed_log_idx` : ステートマシンにおける自身の最後にコミットされたログインデックス。`leader_committed_log_idx` : 自身の視点から見たリーダーのコミット済みログインデックス。`target_committed_log_idx` : コミットされるべき対象ログインデックス。`last_snapshot_idx` : 直近のスナップショット内で最大のコミット済みログインデックス。

```response
first_log_idx   1
first_log_term  1
last_log_idx    101
last_log_term   1
last_committed_log_idx  100
leader_committed_log_idx    101
target_committed_log_idx    101
last_snapshot_idx   50
```

* `rqld`: 新しいリーダーになることを要求します。要求が送信された場合は `Sent leadership request to leader.` を返し、送信されなかった場合は `Failed to send leadership request to leader.` を返します。ノードがすでにリーダーである場合でも、結果は要求が送信された場合と同じになります。

```response
リーダーにリーダーシップ要求を送信しました。
```

* `ftfl`: すべてのフィーチャーフラグと、それらが Keeper インスタンスで有効かどうかを一覧表示します。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: リーダー権の返上を要求し、自身をフォロワーにするためのリクエストです。リクエストを受信したサーバーがリーダーである場合、まず書き込み操作を一時停止し、後継ノード（現在のリーダーが後継になることはありません）が最新ログの追いつきを完了するまで待機してからリーダーを辞任します。後継ノードは自動的に選出されます。リクエストが送信された場合は `Sent yield leadership request to leader.` を返し、リクエストが送信されなかった場合は `Failed to send yield leadership request to leader.` を返します。ノードがすでにフォロワーである場合、その結果はリクエストが送信された場合と同じになることに注意してください。

```response
リーダーへリーダーシップ譲渡要求を送信しました。
```

* `pfev`: 収集されたすべてのイベントの値を返します。各イベントについて、イベント名、イベント値、およびイベントの説明を返します。


```response
FileOpen        62      開かれたファイルの数。
Seek    4       'lseek'関数が呼び出された回数。
ReadBufferFromFileDescriptorRead        126     ファイルディスクリプタからの読み取り(read/pread)回数。ソケットは含まれません。
ReadBufferFromFileDescriptorReadFailed  0       ファイルディスクリプタからの読み取り(read/pread)が失敗した回数。
ReadBufferFromFileDescriptorReadBytes   178846  ファイルディスクリプタから読み取られたバイト数。ファイルが圧縮されている場合、圧縮データサイズが表示されます。
WriteBufferFromFileDescriptorWrite      7       ファイルディスクリプタへの書き込み(write/pwrite)回数。ソケットは含まれません。
WriteBufferFromFileDescriptorWriteFailed        0       ファイルディスクリプタへの書き込み(write/pwrite)が失敗した回数。
WriteBufferFromFileDescriptorWriteBytes 153     ファイルディスクリプタに書き込まれたバイト数。ファイルが圧縮されている場合、圧縮データサイズが表示されます。
FileSync        2       ファイルに対してF_FULLFSYNC/fsync/fdatasync関数が呼び出された回数。
DirectorySync   0       ディレクトリに対してF_FULLFSYNC/fsync/fdatasync関数が呼び出された回数。
FileSyncElapsedMicroseconds     12756   ファイルに対するF_FULLFSYNC/fsync/fdatasyncシステムコールの待機に費やされた合計時間。
DirectorySyncElapsedMicroseconds        0       ディレクトリに対するF_FULLFSYNC/fsync/fdatasyncシステムコールの待機に費やされた合計時間。
ReadCompressedBytes     0       圧縮ソース(ファイル、ネットワーク)から読み取られたバイト数(解凍前のバイト数)。
CompressedReadBufferBlocks      0       圧縮ソース(ファイル、ネットワーク)から読み取られた圧縮ブロック数(互いに独立して圧縮されたデータブロック)。
CompressedReadBufferBytes       0       圧縮ソース(ファイル、ネットワーク)から読み取られた非圧縮バイト数(解凍後のバイト数)。
AIOWrite        0       LinuxまたはFreeBSD AIOインターフェースによる書き込み回数
AIOWriteBytes   0       LinuxまたはFreeBSD AIOインターフェースで書き込まれたバイト数
...
```

### HTTP制御 {#http-control}

ClickHouse Keeperは、レプリカがトラフィックを受信する準備ができているかを確認するためのHTTPインターフェースを提供します。[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)などのクラウド環境で使用できます。

`/ready`エンドポイントを有効にする設定例:

```xml
<clickhouse>
    <keeper_server>
        <http_control>
            <port>9182</port>
            <readiness>
                <endpoint>/ready</endpoint>
            </readiness>
        </http_control>
    </keeper_server>
</clickhouse>
```

### 機能フラグ {#feature-flags}

KeeperはZooKeeperとそのクライアントと完全に互換性がありますが、ClickHouseクライアントで使用できる独自の機能とリクエストタイプも導入しています。
これらの機能は後方互換性のない変更を導入する可能性があるため、ほとんどの機能はデフォルトで無効になっており、`keeper_server.feature_flags`設定を使用して有効にできます。
すべての機能は明示的に無効にすることができます。
Keeperクラスタで新しい機能を有効にする場合は、まずクラスタ内のすべてのKeeperインスタンスをその機能をサポートするバージョンに更新してから、機能自体を有効にすることを推奨します。

`multi_read`を無効にし、`check_not_exists`を有効にする機能フラグ設定の例:

```xml
<clickhouse>
    <keeper_server>
        <feature_flags>
            <multi_read>0</multi_read>
            <check_not_exists>1</check_not_exists>
        </feature_flags>
    </keeper_server>
</clickhouse>
```

以下の機能が利用可能です:

| 機能                | 説明                                                                                                                                              | デフォルト |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `multi_read`           | マルチ読み取りリクエストのサポート                                                                                                                           | `1`     |
| `filtered_list`        | ノードのタイプ(一時的または永続的)で結果をフィルタリングするリストリクエストのサポート                                                             | `1`     |
| `check_not_exists`     | ノードが存在しないことを確認する`CheckNotExists`リクエストのサポート                                                                              | `1`     |
| `create_if_not_exists` | ノードが存在しない場合に作成を試みる`CreateIfNotExists`リクエストのサポート。存在する場合は変更が適用されず、`ZOK`が返されます | `1`     |
| `remove_recursive`     | ノードとそのサブツリーを削除する`RemoveRecursive`リクエストのサポート                                                                     | `1`     |

:::note
一部の機能フラグは、バージョン25.7からデフォルトで有効になっています。  
Keeperを25.7以降にアップグレードする推奨方法は、まずバージョン24.9以降にアップグレードすることです。
:::


### ZooKeeperからの移行 {#migration-from-zookeeper}

ZooKeeperからClickHouse Keeperへのシームレスな移行はできません。ZooKeeperクラスタを停止し、データを変換してから、ClickHouse Keeperを起動する必要があります。`clickhouse-keeper-converter`ツールを使用すると、ZooKeeperのログとスナップショットをClickHouse Keeperのスナップショットに変換できます。このツールはZooKeeper > 3.4でのみ動作します。移行手順:

1. すべてのZooKeeperノードを停止します。

2. 任意ですが推奨:ZooKeeperのリーダーノードを見つけ、再度起動して停止します。これによりZooKeeperが一貫性のあるスナップショットを作成します。

3. リーダー上で`clickhouse-keeper-converter`を実行します。例:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを`keeper`が設定されたClickHouseサーバーノードにコピーするか、ZooKeeperの代わりにClickHouse Keeperを起動します。スナップショットはすべてのノードに保持される必要があります。そうでない場合、空のノードの方が高速になり、そのうちの1つがリーダーになる可能性があります。

:::note
`keeper-converter`ツールはKeeperスタンドアロンバイナリからは利用できません。
ClickHouseがインストールされている場合は、バイナリを直接使用できます:

```bash
clickhouse keeper-converter ...
```

それ以外の場合は、[バイナリをダウンロード](/getting-started/quick-start/oss#download-the-binary)して、ClickHouseをインストールせずに上記の手順でツールを実行できます。
:::

### クォーラム喪失後の復旧 {#recovering-after-losing-quorum}

ClickHouse KeeperはRaftを使用しているため、クラスタサイズに応じて一定数のノード障害を許容できます。\
例えば、3ノードクラスタの場合、1ノードのみが障害を起こしても正常に動作し続けます。

クラスタ構成は動的に設定できますが、いくつかの制限があります。再構成もRaftに依存しているため、クラスタからノードを追加/削除するにはクォーラムが必要です。再起動の見込みがない状態で同時にあまりにも多くのノードを失うと、Raftは動作を停止し、従来の方法でクラスタを再構成することができなくなります。

それでも、ClickHouse Keeperには、1ノードのみでクラスタを強制的に再構成できる復旧モードがあります。
これは、ノードを再起動できない場合、または同じエンドポイントで新しいインスタンスを起動できない場合の最後の手段としてのみ実行してください。

続行する前に注意すべき重要な点:

- 障害が発生したノードがクラスタに再接続できないことを確認してください。
- 手順で指定されるまで、新しいノードを起動しないでください。

上記の点が確実であることを確認した後、以下を実行する必要があります:

1. 新しいリーダーとなる単一のKeeperノードを選択します。そのノードのデータがクラスタ全体で使用されることに注意してください。そのため、最新の状態を持つノードを使用することを推奨します。
2. 他の操作を行う前に、選択したノードの`log_storage_path`と`snapshot_storage_path`フォルダのバックアップを作成します。
3. 使用するすべてのノードでクラスタを再構成します。
4. 選択したノードに4文字コマンド`rcvr`を送信してノードを復旧モードに移行させるか、選択したノードのKeeperインスタンスを停止して`--force-recovery`引数を付けて再起動します。
5. 新しいノードで1つずつKeeperインスタンスを起動し、次のノードを起動する前に`mntr`が`zk_server_state`に対して`follower`を返すことを確認します。
6. 復旧モード中、リーダーノードは新しいノードとのクォーラムを達成するまで`mntr`コマンドに対してエラーメッセージを返し、クライアントとフォロワーからのすべてのリクエストを拒否します。
7. クォーラムが達成されると、リーダーノードは通常の動作モードに戻り、Raftを使用してすべてのリクエストを受け入れます。`mntr`で確認すると、`zk_server_state`に対して`leader`が返されるはずです。


## Keeperでのディスクの使用 {#using-disks-with-keeper}

Keeperは、スナップショット、ログファイル、およびステートファイルの保存に[外部ディスク](/operations/storing-data.md)のサブセットをサポートしています。

サポートされているディスクタイプは以下の通りです:

- s3_plain
- s3
- local

以下は、設定ファイル内に含まれるディスク定義の例です。

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <log_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/logs/</path>
            </log_local>
            <log_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/logs/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </log_s3_plain>
            <snapshot_local>
                <type>local</type>
                <path>/var/lib/clickhouse/coordination/snapshots/</path>
            </snapshot_local>
            <snapshot_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/snapshots/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </snapshot_s3_plain>
            <state_s3_plain>
                <type>s3_plain</type>
                <endpoint>https://some_s3_endpoint/state/</endpoint>
                <access_key_id>ACCESS_KEY</access_key_id>
                <secret_access_key>SECRET_KEY</secret_access_key>
            </state_s3_plain>
        </disks>
    </storage_configuration>
</clickhouse>
```

ログ用のディスクを使用するには、`keeper_server.log_storage_disk`設定をディスク名に設定します。
スナップショット用のディスクを使用するには、`keeper_server.snapshot_storage_disk`設定をディスク名に設定します。
さらに、`keeper_server.latest_log_storage_disk`と`keeper_server.latest_snapshot_storage_disk`をそれぞれ使用することで、最新のログやスナップショットに異なるディスクを使用できます。
この場合、新しいログやスナップショットが作成されると、Keeperは自動的にファイルを適切なディスクに移動します。
ステートファイル用のディスクを使用するには、`keeper_server.state_storage_disk`設定をディスク名に設定します。

ディスク間でのファイル移動は安全であり、転送の途中でKeeperが停止してもデータを失うリスクはありません。
ファイルが新しいディスクに完全に移動されるまで、古いディスクから削除されることはありません。

`keeper_server.coordination_settings.force_sync`が`true`に設定されている(デフォルトは`true`)Keeperは、すべてのタイプのディスクに対して一部の保証を満たすことができません。
現在、`local`タイプのディスクのみが永続的な同期をサポートしています。
`force_sync`を使用する場合、`latest_log_storage_disk`が使用されていなければ、`log_storage_disk`は`local`ディスクである必要があります。
`latest_log_storage_disk`を使用する場合は、常に`local`ディスクである必要があります。
`force_sync`が無効になっている場合は、すべてのタイプのディスクをあらゆる構成で使用できます。

Keeperインスタンスのストレージ構成例は以下のようになります:

```xml
<clickhouse>
    <keeper_server>
        <log_storage_disk>log_s3_plain</log_storage_disk>
        <latest_log_storage_disk>log_local</latest_log_storage_disk>

        <snapshot_storage_disk>snapshot_s3_plain</snapshot_storage_disk>
        <latest_snapshot_storage_disk>snapshot_local</latest_snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

このインスタンスは、最新のログを除くすべてのログを`log_s3_plain`ディスクに保存し、最新のログは`log_local`ディスクに保存されます。
スナップショットにも同じロジックが適用され、最新のスナップショットを除くすべてのスナップショットは`snapshot_s3_plain`に保存され、最新のスナップショットは`snapshot_local`ディスクに保存されます。

### ディスク構成の変更 {#changing-disk-setup}

:::important
新しいディスク構成を適用する前に、すべてのKeeperログとスナップショットを手動でバックアップしてください。
:::

階層化されたディスク構成が定義されている場合(最新のファイルに別のディスクを使用)、Keeperは起動時に自動的にファイルを適切なディスクに移動しようとします。
以前と同じ保証が適用されます。ファイルが新しいディスクに完全に移動されるまで、古いディスクから削除されないため、複数回の再起動を安全に実行できます。

ファイルを完全に新しいディスクに移動する必要がある場合(または2ディスク構成から単一ディスク構成に移行する場合)、`keeper_server.old_snapshot_storage_disk`と`keeper_server.old_log_storage_disk`の複数の定義を使用することができます。

以下の設定は、以前の2ディスク構成から完全に新しい単一ディスク構成に移行する方法を示しています:


```xml
<clickhouse>
    <keeper_server>
        <old_log_storage_disk>log_local</old_log_storage_disk>
        <old_log_storage_disk>log_s3_plain</old_log_storage_disk>
        <log_storage_disk>log_local2</log_storage_disk>

        <old_snapshot_storage_disk>snapshot_s3_plain</old_snapshot_storage_disk>
        <old_snapshot_storage_disk>snapshot_local</old_snapshot_storage_disk>
        <snapshot_storage_disk>snapshot_local2</snapshot_storage_disk>
    </keeper_server>
</clickhouse>
```

起動時に、すべてのログファイルは `log_local` および `log_s3_plain` から `log_local2` ディスクに移動されます。
また、すべてのスナップショットファイルは `snapshot_local` および `snapshot_s3_plain` から `snapshot_local2` ディスクに移動されます。


## ログキャッシュの設定 {#configuring-logs-cache}

ディスクから読み取るデータ量を最小限に抑えるため、Keeperはログエントリをメモリにキャッシュします。
リクエストが大きい場合、ログエントリが過度にメモリを消費するため、キャッシュされるログの量には上限が設けられています。
この上限は以下の2つの設定で制御されます:

- `latest_logs_cache_size_threshold` - キャッシュに保存される最新ログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットが必要な後続ログの合計サイズ

デフォルト値が大きすぎる場合は、これら2つの設定値を減らすことでメモリ使用量を削減できます。

:::note
`pfev`コマンドを使用して、各キャッシュおよびファイルから読み取られたログの量を確認できます。
また、Prometheusエンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。
:::


## Prometheus {#prometheus}

Keeperは[Prometheus](https://prometheus.io)によるスクレイピングのためにメトリクスデータを公開できます。

設定:

- `endpoint` – PrometheusサーバーがメトリクスをスクレイピングするためのHTTPエンドポイント。'/'で始まる必要があります。
- `port` – `endpoint`のポート番号。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開するかどうかを設定するフラグ。
- `events` – [system.events](/operations/system-tables/events)テーブルからメトリクスを公開するかどうかを設定するフラグ。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開するかどうかを設定するフラグ。

**例**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

確認方法(`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください):

```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloudの[Prometheus統合](/integrations/prometheus)も併せてご参照ください。


## ClickHouse Keeperユーザーガイド {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeperを設定するためのシンプルで最小限の設定と、分散操作をテストする方法の例を提供します。この例では、Linux上の3つのノードを使用します。

### 1. Keeper設定でノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト（`chnode1`、`chnode2`、`chnode3`）に3つのClickHouseインスタンスをインストールします。（ClickHouseのインストールの詳細については、[クイックスタート](/getting-started/install/install.mdx)を参照してください。）

2. 各ノードで、ネットワークインターフェースを通じた外部通信を許可するために、以下のエントリを追加します。

   ```xml
   <listen_host>0.0.0.0</listen_host>
   ```

3. 以下のClickHouse Keeper設定を3つのサーバーすべてに追加し、各サーバーの`<server_id>`設定を更新します。`chnode1`の場合は`1`、`chnode2`の場合は`2`などとなります。

   ```xml
   <keeper_server>
       <tcp_port>9181</tcp_port>
       <server_id>1</server_id>
       <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
       <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>

       <coordination_settings>
           <operation_timeout_ms>10000</operation_timeout_ms>
           <session_timeout_ms>30000</session_timeout_ms>
           <raft_logs_level>warning</raft_logs_level>
       </coordination_settings>

       <raft_configuration>
           <server>
               <id>1</id>
               <hostname>chnode1.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>2</id>
               <hostname>chnode2.domain.com</hostname>
               <port>9234</port>
           </server>
           <server>
               <id>3</id>
               <hostname>chnode3.domain.com</hostname>
               <port>9234</port>
           </server>
       </raft_configuration>
   </keeper_server>
   ```

   上記で使用されている基本設定は以下の通りです：

   | パラメータ             | 説明                                                             | 例                                         |
   | --------------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
   | tcp_port              | Keeperのクライアントが使用するポート                                    | 9181（ZooKeeperの2181に相当するデフォルト値） |
   | server_id             | Raft設定で使用される各ClickHouse Keeperサーバーの識別子 | 1                                               |
   | coordination_settings | タイムアウトなどのパラメータのセクション                                  | タイムアウト: 10000、ログレベル: trace               |
   | server                | 参加するサーバーの定義                                      | 各サーバー定義のリスト                  |
   | raft_configuration    | Keeperクラスタ内の各サーバーの設定                          | 各サーバーとその設定                    |
   | id                    | Keeperサービス用のサーバーの数値ID                            | 1                                               |
   | hostname              | Keeperクラスタ内の各サーバーのホスト名、IPまたはFQDN               | `chnode1.domain.com`                            |
   | port                  | サーバー間Keeper接続をリッスンするポート                    | 9234                                            |

4. Zookeeperコンポーネントを有効にします。これはClickHouse Keeperエンジンを使用します：

   ```xml
       <zookeeper>
           <node>
               <host>chnode1.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode2.domain.com</host>
               <port>9181</port>
           </node>
           <node>
               <host>chnode3.domain.com</host>
               <port>9181</port>
           </node>
       </zookeeper>
   ```

   上記で使用されている基本設定は以下の通りです：

   | パラメータ | 説明                                         | 例                        |
   | --------- | --------------------------------------------------- | ------------------------------ |
   | node      | ClickHouse Keeper接続用のノードのリスト     | 各サーバーの設定エントリ |
   | host      | 各ClickHouse Keeperノードのホスト名、IPまたはFQDN | `chnode1.domain.com`           |
   | port      | ClickHouse Keeperクライアントポート                       | 9181                           |

5. ClickHouseを再起動し、各Keeperインスタンスが実行されていることを確認します。各サーバーで以下のコマンドを実行します。`ruok`コマンドは、Keeperが実行中で正常な場合に`imok`を返します：

   ```bash
   # echo ruok | nc localhost 9181; echo
   imok
   ```

6. `system`データベースには、ClickHouse Keeperインスタンスの詳細を含む`zookeeper`という名前のテーブルがあります。このテーブルを表示してみましょう：
   ```sql
   SELECT *
   FROM system.zookeeper
   WHERE path IN ('/', '/clickhouse')
   ```


    テーブルは次のようになります：
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```

### 2. ClickHouseでクラスタを設定する {#2--configure-a-cluster-in-clickhouse}

1. 2つのノードに2つのシャードと1つのレプリカのみを持つシンプルなクラスタを設定します。3番目のノードはClickHouse Keeperの要件でクォーラムを達成するために使用されます。`chnode1`と`chnode2`の設定を更新します。以下のクラスタ設定では、各ノードに1つのシャードを定義し、合計2つのシャードでレプリケーションなしとなります。この例では、一部のデータは一方のノードに、残りのデータはもう一方のノードに配置されます：

   ```xml
       <remote_servers>
           <cluster_2S_1R>
               <shard>
                   <replica>
                       <host>chnode1.domain.com</host>
                       <port>9000</port>
                       <user>default</user>
                       <password>ClickHouse123!</password>
                   </replica>
               </shard>
               <shard>
                   <replica>
                       <host>chnode2.domain.com</host>
                       <port>9000</port>
                       <user>default</user>
                       <password>ClickHouse123!</password>
                   </replica>
               </shard>
           </cluster_2S_1R>
       </remote_servers>
   ```

   | パラメータ | 説明                                                            | 例                           |
   | --------- | ---------------------------------------------------------------------- | --------------------------------- |
   | shard     | クラスタ定義におけるレプリカのリスト                             | 各シャードのレプリカのリスト   |
   | replica   | 各レプリカの設定のリスト                                      | 各レプリカの設定エントリ |
   | host      | レプリカシャードをホストするサーバーのホスト名、IPまたはFQDN          | `chnode1.domain.com`              |
   | port      | ネイティブTCPプロトコルを使用した通信に使用されるポート                 | 9000                              |
   | user      | クラスタインスタンスへの認証に使用されるユーザー名    | default                           |
   | password  | クラスタインスタンスへの接続を許可するために定義されたユーザーのパスワード | `ClickHouse123!`                  |

2. ClickHouseを再起動し、クラスタが作成されたことを確認します：

   ```bash
   SHOW clusters;
   ```

   クラスタが表示されます：

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. 分散テーブルを作成してテストする {#3-create-and-test-distributed-table}

1.  `chnode1`のClickHouseクライアントを使用して、新しいクラスタに新しいデータベースを作成します。`ON CLUSTER`句により、両方のノードに自動的にデータベースが作成されます。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```


2. `db1` データベースに新しいテーブルを作成します。ここでも `ON CLUSTER` により両方のノードにテーブルが作成されます。

   ```sql
   CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
   (
       `id` UInt64,
       `column1` String
   )
   ENGINE = MergeTree
   ORDER BY column1
   ```

3. `chnode1` ノードで数行を追加します:

   ```sql
   INSERT INTO db1.table1
       (id, column1)
   VALUES
       (1, 'abc'),
       (2, 'def')
   ```

4. `chnode2` ノードで数行を追加します:

   ```sql
   INSERT INTO db1.table1
       (id, column1)
   VALUES
       (3, 'ghi'),
       (4, 'jkl')
   ```

5. 各ノードで `SELECT` ステートメントを実行すると、そのノード上のデータのみが表示されることに注意してください。例えば、`chnode1` では:

   ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: 7ef1edbc-df25-462b-a9d4-3fe6f9cb0b6d

   ┌─id─┬─column1─┐
   │  1 │ abc     │
   │  2 │ def     │
   └────┴─────────┘

   2 rows in set. Elapsed: 0.006 sec.
   ```

   `chnode2` では:

6. ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: c43763cc-c69c-4bcc-afbe-50e764adfcbf

   ┌─id─┬─column1─┐
   │  3 │ ghi     │
   │  4 │ jkl     │
   └────┴─────────┘
   ```

7. 2つのシャード上のデータを表現するために `Distributed` テーブルを作成できます。`Distributed` テーブルエンジンを使用したテーブルは独自のデータを保存しませんが、複数のサーバー上での分散クエリ処理を可能にします。読み取りはすべてのシャードにアクセスし、書き込みはシャード全体に分散できます。`chnode1` で次のクエリを実行します:

   ```sql
   CREATE TABLE db1.dist_table (
       id UInt64,
       column1 String
   )
   ENGINE = Distributed(cluster_2S_1R,db1,table1)
   ```

8. `dist_table` をクエリすると、2つのシャードからすべての4行のデータが返されることに注意してください:

   ```sql
   SELECT *
   FROM db1.dist_table
   ```

   ```response
   Query id: 495bffa0-f849-4a0c-aeea-d7115a54747a

   ┌─id─┬─column1─┐
   │  1 │ abc     │
   │  2 │ def     │
   └────┴─────────┘
   ┌─id─┬─column1─┐
   │  3 │ ghi     │
   │  4 │ jkl     │
   └────┴─────────┘

   4 rows in set. Elapsed: 0.018 sec.
   ```

### まとめ {#summary}

このガイドでは、ClickHouse Keeper を使用してクラスタをセットアップする方法を説明しました。ClickHouse Keeper を使用すると、クラスタを構成し、シャード間でレプリケーション可能な分散テーブルを定義できます。


## 一意のパスを使用したClickHouse Keeperの設定 {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 説明 {#description}

この記事では、組み込みの`{uuid}`マクロ設定を使用して、ClickHouse KeeperまたはZooKeeperに一意のエントリを作成する方法について説明します。一意のパスは、テーブルを頻繁に作成および削除する際に役立ちます。パスが作成されるたびに新しい`uuid`がそのパスに使用されるため、Keeperのガベージコレクションがパスエントリを削除するまで数分待つ必要がなくなります。パスが再利用されることはありません。

### 環境例 {#example-environment}

3つのノードすべてにClickHouse Keeperを設定し、そのうち2つのノードにClickHouseを設定する3ノードクラスタです。これにより、ClickHouse Keeperには3つのノード(タイブレーカーノードを含む)が提供され、2つのレプリカで構成される単一のClickHouseシャードが構成されます。

| ノード                    | 説明                         |
| ----------------------- | ----------------------------------- |
| `chnode1.marsnet.local` | データノード - クラスタ `cluster_1S_2R` |
| `chnode2.marsnet.local` | データノード - クラスタ `cluster_1S_2R` |
| `chnode3.marsnet.local` | ClickHouse Keeperタイブレーカーノード  |

クラスタの設定例:

```xml
    <remote_servers>
        <cluster_1S_2R>
            <shard>
                <replica>
                    <host>chnode1.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
                <replica>
                    <host>chnode2.marsnet.local</host>
                    <port>9440</port>
                    <user>default</user>
                    <password>ClickHouse123!</password>
                    <secure>1</secure>
                </replica>
            </shard>
        </cluster_1S_2R>
    </remote_servers>
```

### `{uuid}`を使用するテーブルの設定手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定
   サーバー1の例:

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
`shard`と`replica`のマクロを定義していますが、`{uuid}`はここでは定義されていないことに注意してください。これは組み込みであり、定義する必要はありません。
:::

2. データベースを作成

```sql
CREATE DATABASE db_uuid
      ON CLUSTER 'cluster_1S_2R'
      ENGINE Atomic;
```

```response
CREATE DATABASE db_uuid ON CLUSTER cluster_1S_2R
ENGINE = Atomic

Query id: 07fb7e65-beb4-4c30-b3ef-bd303e5c42b5

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

3. マクロと`{uuid}`を使用してクラスタ上にテーブルを作成

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}' )
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

Query id: 8f542664-4548-4a02-bd2a-6f2c973d0dc4

```


┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │ 0 │ │ 1 │ 0 │
│ chnode2.marsnet.local │ 9440 │ 0 │ │ 0 │ 0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

````

4.  分散テーブルを作成

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
````

```response
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1')

Query id: 3bc7f339-ab74-4c7d-a752-1ffe54219c0e

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

### テスト {#testing}

1.  最初のノードにデータを挿入（例：`chnode1`）

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

2. 2番目のノードにデータを挿入（例：`chnode2`）

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

3. 分散テーブルを使用してレコードを表示

```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

```response
SELECT *
FROM db_uuid.dist_uuid_table1

Query id: 6cbab449-9e7f-40fe-b8c2-62d46ba9f5c8

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘

2 rows in set. Elapsed: 0.007 sec.
```

### 代替方法 {#alternatives}

デフォルトのレプリケーションパスは、マクロと`{uuid}`を使用して事前に定義できます

1. 各ノードでテーブルのデフォルトを設定

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
ノードが特定のデータベース専用に使用される場合は、各ノードでマクロ`{database}`を定義することもできます。
:::

2. 明示的なパラメータなしでテーブルを作成：

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id

```


クエリID: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │ 0 │ │ 1 │ 0 │
│ chnode1.marsnet.local │ 9440 │ 0 │ │ 0 │ 0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2行のセット。経過時間: 1.175秒

````

3. デフォルト設定が使用されていることを確認します
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
````

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

1行のセット。経過時間: 0.003秒
```

### トラブルシューティング {#troubleshooting}

テーブル情報とUUIDを取得するコマンド例:

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記テーブルのUUIDを使用してZooKeeper内のテーブル情報を取得するコマンド例

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは`Atomic`型である必要があります。以前のバージョンからアップグレードした場合、`default`データベースは`Ordinary`型である可能性があります。
:::

確認方法:

例:

```sql
SELECT name, engine FROM system.databases WHERE name = 'db_uuid';
```

```response
SELECT
    name,
    engine
FROM system.databases
WHERE name = 'db_uuid'

Query id: b047d459-a1d2-4016-bcf9-3e97e30e49c2

┌─name────┬─engine─┐
│ db_uuid │ Atomic │
└─────────┴────────┘

1 row in set. Elapsed: 0.004 sec.
```


## ClickHouse Keeper の動的再構成 {#reconfiguration}

<SelfManaged />

### 説明 {#description-1}

ClickHouse Keeper は、`keeper_server.enable_reconfiguration` が有効になっている場合、動的なクラスタ再構成のための ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) コマンドを部分的にサポートしています。

:::note
この設定が無効になっている場合は、レプリカの `raft_configuration` セクションを手動で変更することでクラスタを再構成できます。変更を適用するのはリーダーのみであるため、すべてのレプリカでファイルを編集する必要があります。または、ZooKeeper 互換クライアントを通じて `reconfig` クエリを送信することもできます。
:::

仮想ノード `/keeper/config` には、最後にコミットされたクラスタ構成が以下の形式で格納されています:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリは改行で区切られます。
- `server_type` は `participant` または `learner` のいずれかです([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) はリーダー選出に参加しません)。
- `server_priority` は、[リーダー選出時にどのノードを優先すべきか](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)を示す非負整数です。
  優先度が 0 の場合、そのサーバーは決してリーダーになりません。

例:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

`reconfig` コマンドを使用して、新しいサーバーの追加、既存サーバーの削除、既存サーバーの優先度変更を行うことができます。以下は例です(`clickhouse-keeper-client` を使用):


```bash
# 新しいサーバーを2台追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# 他の2台のサーバーを削除
reconfig remove "3,4"
# 既存のサーバーの優先度を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

`kazoo` の例をいくつか挙げます。


```python
# 2つの新しいサーバーを追加し、他の2つのサーバーを削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```


# 既存サーバーの優先度を 8 に変更する

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

`joining`内のサーバーは、上記で説明したサーバー形式で指定する必要があります。サーバーエントリはカンマで区切ります。
新しいサーバーを追加する際、`server_priority`(デフォルト値は1)と`server_type`(デフォルト値は`participant`)は省略可能です。

既存のサーバーの優先度を変更する場合は、目標の優先度を指定して`joining`に追加します。
サーバーのホスト、ポート、タイプは既存のサーバー設定と一致させる必要があります。

サーバーは`joining`と`leaving`に記述された順序で追加および削除されます。
`joining`からのすべての更新は、`leaving`からの更新よりも先に処理されます。

Keeperの再設定実装には以下の注意点があります:

- 増分再設定のみがサポートされています。空でない`new_members`を含むリクエストは拒否されます。

  ClickHouse Keeperの実装は、メンバーシップを動的に変更するためにNuRaft APIに依存しています。NuRaftは一度に1つのサーバーを追加または削除する方式を採用しています。これは、設定への各変更(`joining`の各部分、`leaving`の各部分)が個別に決定される必要があることを意味します。したがって、エンドユーザーに誤解を与える可能性があるため、一括再設定は利用できません。

  サーバータイプ(participant/learner)の変更もNuRaftでサポートされていないため不可能です。唯一の方法はサーバーを削除して追加することですが、これも誤解を招く可能性があります。

- 返される`znodestat`値は使用できません。
- `from_version`フィールドは使用されません。`from_version`が設定されたすべてのリクエストは拒否されます。
  これは、`/keeper/config`が仮想ノードであり、永続ストレージに保存されるのではなく、リクエストごとに指定されたノード設定で動的に生成されるためです。
  この決定は、NuRaftがすでにこの設定を保存しているため、データの重複を避けるために行われました。
- ZooKeeperとは異なり、`sync`コマンドを送信してクラスターの再設定を待機する方法はありません。
  新しい設定は_最終的に_適用されますが、適用時間の保証はありません。
- `reconfig`コマンドはさまざまな理由で失敗する可能性があります。クラスターの状態を確認して、更新が適用されたかどうかを確認できます。
```


## 単一ノードのKeeperをクラスタに変換する {#converting-a-single-node-keeper-into-a-cluster}

実験的なKeeperノードをクラスタに拡張する必要がある場合があります。以下は、3ノードクラスタへの変換手順です:

- **重要**: 新しいノードは現在のクォーラム数未満のバッチで追加する必要があります。そうしないと、新しいノード間でリーダーが選出されてしまいます。この例では1つずつ追加します。
- 既存のKeeperノードで`keeper_server.enable_reconfiguration`設定パラメータを有効にしておく必要があります。
- Keeperクラスタの完全な新しい設定で2番目のノードを起動します。
- 起動後、[`reconfig`](#reconfiguration)を使用してノード1に追加します。
- 次に、3番目のノードを起動し、[`reconfig`](#reconfiguration)を使用して追加します。
- 新しいKeeperノードを追加して`clickhouse-server`の設定を更新し、変更を適用するために再起動します。
- ノード1のRaft設定を更新し、必要に応じて再起動します。

このプロセスに慣れるために、[サンドボックスリポジトリ](https://github.com/ClickHouse/keeper-extend-cluster)を用意しています。


## サポートされていない機能 {#unsupported-features}

ClickHouse KeeperはZooKeeperとの完全な互換性を目指していますが、現在実装されていない機能がいくつかあります(開発は継続中です):

- [`create`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)>)は`Stat`オブジェクトの返却に対応していません
- [`create`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)>)は[TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)に対応していません
- [`addWatch`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)>)は[`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT)ウォッチでは動作しません
- [`removeWatch`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)>)および[`removeAllWatches`](<https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)>)には対応していません
- `setWatches`には対応していません
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html)タイプのznodeの作成には対応していません
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)には対応していません
