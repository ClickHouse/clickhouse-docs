---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: ClickHouse Keeperの設定
sidebar_position: 10
keywords:
  - Keeper
  - ZooKeeper
  - clickhouse-keeper
  - レプリケーション
description: ClickHouse Keeper、またはclickhouse-keeperは、ZooKeeperの代わりにレプリケーションと調整を提供します。
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeperは、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)および[分散DDL](/sql-reference/distributed-ddl.md)クエリの実行のための調整システムを提供します。ClickHouse KeeperはZooKeeperと互換性があります。
### 実装の詳細 {#implementation-details}

ZooKeeperは、最初に知られているオープンソースの調整システムの一つです。Javaで実装されており、非常にシンプルで強力なデータモデルを持っています。ZooKeeperの調整アルゴリズムであるZooKeeper Atomic Broadcast (ZAB)は、各ZooKeeperノードがローカルで読み取りを行うため、読み取りに対するリニアライズ可能性の保証を提供しません。ZooKeeperとは異なり、ClickHouse KeeperはC++で書かれており、[RAFTアルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは、読み取りと書き込みに対するリニアライズ可能性を提供し、異なる言語でのいくつかのオープンソース実装があります。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：リニアライズ可能な書き込みと非リニアライズ可能な読み取り。互換性のあるクライアントサーバープロトコルがあるため、標準のZooKeeperクライアントを使用してClickHouse Keeperと対話することができます。スナップショットとログの形式はZooKeeperと互換性がありませんが、`clickhouse-keeper-converter`ツールを使用してZooKeeperデータをClickHouse Keeperのスナップショットに変換することができます。ClickHouse Keeper内のインタサーバープロトコルもZooKeeperとは互換性がないため、混在したZooKeeper / ClickHouse Keeperクラスターは不可能です。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同様の方法でアクセス制御リスト（ACL）をサポートしています。ClickHouse Keeperは同じ権限のセットをサポートし、同一の組み込みスキームを持っています：`world`、`auth`、および`digest`。ダイジェスト認証スキームは、`username:password`のペアを使用し、パスワードはBase64でエンコードされます。

:::note
外部統合はサポートされていません。
:::
### 設定 {#configuration}

ClickHouse Keeperは、ZooKeeperの代替として単独で使用することも、ClickHouseサーバーの内部部分として使用することもできます。両方の場合で、設定はほぼ同じ`.xml`ファイルになります。
#### Keeperの設定項目 {#keeper-configuration-settings}

主なClickHouse Keeper設定タグは`<keeper_server>`で、以下のパラメーターがあります。

| パラメーター                        | 説明                                                                                                                                                                                                                                         | デフォルト                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                   | クライアントとkeeper-server間のSSL接続のためのセキュアポート。                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | 一意のサーバーID、ClickHouse Keeperクラスターの各参加者には一意の番号（1, 2, 3, など）を持たせる必要があります。                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                   | 調整ログのパス、ZooKeeperと同様に、非アクティブなノードにログを保存するのが最適です。                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | 調整スナップショットのパス。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration)による動的クラスタ再構成の有効化。                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeperの最大メモリ使用量のソフトリミット（バイト）。                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit` が設定されていない場合やゼロに設定されている場合、デフォルトのソフトリミットを定義するためにこの値を使用します。                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit` が設定されていない場合や`0`に設定されている場合、物理メモリの量を観察するための間隔です。メモリ量が変更されると、`max_memory_usage_soft_limit_ratio` によってKeeperのメモリソフトリミットを再計算します。 | `15`                                                                                                         |
| `http_control`                       | [HTTP制御](#http-control)インターフェースの設定。                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | リアルタイムデータ整合性チェックの有効化。                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | シャットダウン時にスナップショットを作成する。                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定のためのホスト名の健全性チェックの有効化（例：ローカルホストがリモートエンドポイントに使用されている場合）。                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lwコマンドのホワイトリスト。                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |


他の共通のパラメータは、ClickHouseサーバー設定から継承されます（`listen_host`、`logger`など）。
#### 内部調整設定 {#internal-coordination-settings}

内部調整設定は`<keeper_server>.<coordination_settings>`セクションにあり、以下のパラメータがあります。

| パラメーター                          | 説明                                                                                                                                                                                                              | デフォルト                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一のクライアント操作のタイムアウト（ms）。                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト（ms）。                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト（ms）。                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeperがデッドセッションをチェックし、そのセッションを削除する頻度（ms）。                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeperのリーダーがフォロワーにハートビートを送信する頻度（ms）。                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーがこの間隔内にリーダーからハートビートを受信しない場合、リーダー選出を開始することができます。`election_timeout_upper_bound_ms`以下でなければなりません。理想的には等しくないほうが良いです。 | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーがこの間隔内にリーダーからハートビートを受信しない場合、リーダー選出を開始する必要があります。                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 単一ファイルに格納するログ記録数。                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | 圧縮前に保持する調整ログ記録数。                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeperが新しいスナップショットを作成する頻度（ログ内の記録数）。                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショットの数。                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーを古いものと見なし、ログではなくスナップショットを送信するしきい値。                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | ノードが新鮮になるとき。                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFTに送信する前のリクエスト数のバッチの最大サイズ。                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                       | 調整ログへの各書き込み時に`fsync`を呼び出します。                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | 読み取りリクエストを、全体のRAFT合意として書き込みのように実行します。                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                  | 調整に関するテキストログレベル（trace、debugなど）。                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストの転送を許可します。                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続を完了し、シャットダウンするまで待機します（ms）。                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | サーバーが指定されたタイムアウト内に他のクオーラム参加者に接続できない場合、終了します（ms）。                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。全ての書き込みおよび読み取りの保証が保持されつつ、より良いパフォーマンスが得られます。この設定はデフォルトでは無効になっており、後方互換性を損なわないように配慮されています。                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新のログエントリのメモリキャッシュの最大合計サイズ。                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットのために次に必要なログエントリのメモリキャッシュの最大合計サイズ。                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | ディスク間でファイルの移動中に失敗が発生した後、再試行の間に待機する時間。                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にディスク間でファイルが移動中に失敗が発生した後の再試行回数。                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`         | rocksdbをバックエンドストレージとして使用します。                                                                                                    | `0`                                                                                                        |

クオーラム設定は `<keeper_server>.<raft_configuration>` セクションにあり、サーバーの説明を含んでいます。

全体のクオーラムに対する唯一のパラメータは`secure`で、クオーラム参加者間の通信に暗号化された接続を有効にします。このパラメータは、ノード間の内部通信にSSL接続が必要な場合は`true`に設定することができ、それ以外の場合は未設定のままにします。

各`<server>`の主なパラメータは以下の通りです。

- `id` — クオーラム内のサーバー識別子。
- `hostname` — このサーバーが配置されているホスト名。
- `port` — このサーバーが接続をリッスンするポート。
- `can_become_leader` — サーバーを`learner`として設定するには`false`にします。省略された場合、値は`true`になります。

:::note
ClickHouse Keeperクラスタのトポロジーに変更がある場合（例：サーバーの置き換え）、`server_id`と`hostname`のマッピングを一貫して保持し、既存の`server_id`を異なるサーバーに対してシャッフルまたは再利用しないようにしてください（自動化スクリプトを使用してClickHouse Keeperをデプロイする場合に発生することがあります）。

Keeperインスタンスのホストが変更される可能性がある場合は、生のIPアドレスの代わりにホスト名を定義して使用することをお勧めします。ホスト名を変更することは、サーバーを削除して再追加することに等しく、場合によっては不可能なことがあります（例：クオーラムに十分なKeeperインスタンスがない場合）。
:::

:::note
`async_replication`はデフォルトで無効になっており、後方互換性を損なわないように配慮されています。クラスター内のすべてのKeeperインスタンスが`async_replication`をサポートするバージョン（v23.9+）で実行されている場合は、パフォーマンスを向上させるために有効化することをお勧めします。
:::


3ノードのクオーラムの設定の例は、`test_keeper_`プレフィックスを持つ[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)に見つけることができます。サーバー＃1の設定例：

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

ClickHouse KeeperはClickHouseサーバーパッケージにバンドルされているため、`<keeper_server>`の設定を`/etc/your_path_to_config/clickhouse-server/config.xml`に追加し、常にClickHouseサーバーを起動します。単独のClickHouse Keeperを実行したい場合は、次のように起動できます。

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は作成するか、`clickhouse`に`keeper`を引数として指定します。

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### Four Letter Word Commands {#four-letter-word-commands}

ClickHouse Keeper は、Zookeeper とほぼ同じ 4lw コマンドを提供しています。各コマンドは `mntr`、`stat` などの4文字から構成されています。興味深いコマンドとしては、`stat` はサーバーや接続されたクライアントに関する一般的な情報を提供し、`srvr` と `cons` はそれぞれサーバーと接続に関する詳細情報を提供します。

4lw コマンドには、`four_letter_word_white_list` というホワイトリスト設定があり、デフォルト値は `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld` です。

telnet または nc を介して ClickHouse Keeper にコマンドを発行することができます。

```bash
echo mntr | nc localhost 9181
```

以下は、詳細な 4lw コマンドです：

- `ruok`: サーバーがエラー状態でない状態で実行されているかをテストします。サーバーが実行中の場合、`imok` という応答が返されます。それ以外の場合は何も応答しません。`imok` の応答は、サーバーがクオーラムに参加していることを必ずしも示すわけではなく、サーバープロセスがアクティブで指定されたクライアントポートにバインドされていることを示しています。クオーラムおよびクライアント接続情報に関する詳細は "stat" を使用してください。

```response
imok
```

- `mntr`: クラスターの健康状態を監視するために使用できる変数のリストを出力します。

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

- `srvr`: サーバーの全詳細をリストします。

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Latency min/avg/max: 0/0/0
Received: 2
Sent : 2
Connections: 1
Outstanding: 0
Zxid: 34
Mode: leader
Node count: 4
```

- `stat`: サーバーと接続されたクライアントに関する簡潔な詳細をリストします。

```response
ClickHouse Keeper version: v21.11.1.1-prestable-7a4a0b0edef0ad6e0aa662cd3b90c3f4acf796e7
Clients:
 192.168.1.1:52852(recved=0,sent=0)
 192.168.1.1:52042(recved=24,sent=48)
Latency min/avg/max: 0/0/0
Received: 4
Sent : 4
Connections: 1
Outstanding: 0
Zxid: 36
Mode: leader
Node count: 4
```

- `srst`: サーバー統計をリセットします。このコマンドは `srvr`、`mntr`、`stat` の結果に影響を与えます。

```response
Server stats reset.
```

- `conf`: サーバーの設定に関する詳細を出力します。

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

- `cons`: このサーバーに接続されている全クライアントの接続/セッションの詳細をリストします。受信/送信のパケット数、セッション ID、操作のレイテンシ、最近実行された操作などの情報が含まれています。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: すべての接続の接続/セッション統計をリセットします。

```response
Connection stats reset.
```

- `envi`: サーバーの環境に関する詳細を出力します。

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

- `dirs`: スナップショットとログファイルの合計サイズをバイト単位で表示します。

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: サーバーが読み取り専用モードで実行されているかをテストします。サーバーが読み取り専用モードの場合、`ro` という応答が返され、読み取り専用モードでない場合は `rw` が返されます。

```response
rw
```

- `wchs`: サーバーのウォッチについての簡単な情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: セッションごとにサーバーのウォッチの詳細情報をリストします。これは、関連するウォッチ（パス）を持つセッション（接続）のリストを出力します。この操作はウォッチの数によって高コストとなる可能性があるため、注意して使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: パスごとにサーバーのウォッチの詳細情報をリストします。これは、関連するセッションを持つパス（znode）のリストを出力します。この操作はウォッチの数によって高コストとなる可能性があるため、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: 未処理のセッションとエフェメラルノードのリストを出力します。このコマンドはリーダーでのみ機能します。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: スナップショット作成タスクをスケジュールします。成功すればスケジュールされたスナップショットの最終承認ログインデックスを返し、失敗すれば `Failed to schedule snapshot creation task.` を返します。スナップショットが完了したかどうかを判断するために `lgif` コマンドを利用できます。

```response
100
```

- `lgif`: Keeper ログ情報。`first_log_idx` : ログストア内の最初のログインデックス; `first_log_term` : 最初のログ用語; `last_log_idx` : ログストア内の最後のログインデックス; `last_log_term` : 最後のログ用語; `last_committed_log_idx` : 状態マシン内の最後の承認ログインデックス; `leader_committed_log_idx` : リーダーが承認したログインデックス; `target_committed_log_idx` : 承認すべきターゲットログインデックス; `last_snapshot_idx` : 最後のスナップショット内の最大承認ログインデックス。

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

- `rqld`: 新しいリーダーになるリクエストを送信します。リクエストが送信された場合は `Sent leadership request to leader.` を、送信されなかった場合は `Failed to send leadership request to leader.` を返します。ノードがすでにリーダーである場合、結果は同じです。

```response
Sent leadership request to leader.
```

- `ftfl`: すべてのフィーチャーフラグと、それが Keeper インスタンスに対して有効かどうかをリストします。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: リーダーシップを放棄し、フォロワーになるリクエストを送信します。リクエストを受け取ったサーバーがリーダーである場合、書き込み操作を一時停止し、後継者が最新のログの追いつきを完了するのを待ち、その後引き下がります。後継者は自動的に選ばれます。リクエストが送信された場合は `Sent yield leadership request to leader.` を、送信されなかった場合は `Failed to send yield leadership request to leader.` を返します。ノードがすでにフォロワーである場合、結果はリクエストが送信されたのと同じになります。

```response
Sent yield leadership request to leader.
```

- `pfev`: 収集されたすべてのイベントの値を返します。各イベントについて、イベント名、イベント値、およびイベントの説明を返します。

```response
FileOpen	62	Number of files opened.
Seek	4	Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead	126	Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed	0	Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes	178846	Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite	7	Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed	0	Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes	153	Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync	2	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync	0	Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds	12756	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds	0	Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes	0	Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks	0	Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes	0	Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite	0	Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes	0	Number of bytes written with Linux or FreeBSD AIO interface
...
```
### HTTP Control {#http-control}

ClickHouse Keeper は、レプリカがトラフィックを受信できる準備ができているかを確認するための HTTP インターフェースを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) のようなクラウド環境で使用できます。

`/ready` エンドポイントを有効にする設定の例：

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
### Feature flags {#feature-flags}

Keeper は ZooKeeper とそのクライアントと完全に互換性がありますが、ClickHouse クライアントが使用できるいくつかのユニークな機能とリクエストタイプも導入します。これらの機能は後方互換性のない変更をもたらす可能性があるため、デフォルトではほとんどが無効になっており、`keeper_server.feature_flags` 設定を使用して有効にできます。すべての機能は明示的に無効にすることができます。Keeper クラスターの新しい機能を有効にしたい場合は、最初にクラスター内のすべての Keeper インスタンスを機能をサポートするバージョンに更新し、その後で機能自体を有効にすることをお勧めします。

`multi_read` を無効にし、`check_not_exists` を有効にするフィーチャーフラグ設定の例：

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

利用可能な機能は次のとおりです：

`multi_read` - 読み取りマルチリクエストのサポート。デフォルト: `1`
`filtered_list` - ノードのタイプ（エフェメラルまたは永続）によって結果をフィルタリングするリストリクエストのサポート。デフォルト: `1`
`check_not_exists` - ノードが存在しないことを主張する `CheckNotExists` リクエストのサポート。デフォルト: `0`
`create_if_not_exists` - 存在しない場合はノードを作成しようとする `CreateIfNotExists` リクエストのサポート。存在する場合は変更は適用されず、`ZOK` が返されます。デフォルト: `0`
### Migration from ZooKeeper {#migration-from-zookeeper}

ZooKeeper から ClickHouse Keeper へのシームレスな移行は不可能です。ZooKeeper クラスターを停止し、データを変換し、ClickHouse Keeper を開始する必要があります。`clickhouse-keeper-converter` ツールは、ZooKeeper のログとスナップショットを ClickHouse Keeper スナップショットに変換します。これは ZooKeeper > 3.4 でのみ動作します。移行手順は以下の通りです：

1. すべての ZooKeeper ノードを停止します。

2. オプションですが推奨します：ZooKeeper リーダーノードを見つけて再起動します。これにより ZooKeeper は一貫したスナップショットを作成します。

3. リーダーで `clickhouse-keeper-converter` を実行します。例：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを設定された `keeper` を持つ ClickHouse サーバーノードにコピーするか、ZooKeeper の代わりに ClickHouse Keeper を開始します。すべてのノードでスナップショットが持続する必要があります。さもなくば、空のノードがより迅速になり、その1つがリーダーになる可能性があります。

:::note
`keeper-converter` ツールは、Keeper スタンドアロンバイナリからは利用できません。
ClickHouse がインストールされている場合は、バイナリを直接使用できます：

```bash
clickhouse keeper-converter ...
```

それ以外の場合は、[バイナリをダウンロードする](/getting-started/quick-start#1-download-the-binary) と、ClickHouse をインストールせずに上記のようにツールを実行できます。
:::
### Recovering after losing quorum {#recovering-after-losing-quorum}

ClickHouse Keeper は Raft を使用しているため、クラスターサイズに応じてノードの障害を一定量許容できます。\
例えば、3ノードクラスターの場合、1ノードのみが障害を起こしても正しく動作し続けます。

クラスターの構成は動的に設定できますが、いくつかの制限があります。再構成は Raft にも依存しているため、クラスターからノードを追加/削除するにはクオーラムが必要です。ノードが同時に多数が失われ、その再起動の見込みがない場合、Raft は機能を停止し、従来の方法でクラスターを再構成することを許可しなくなります。

それにもかかわらず、ClickHouse Keeper には、1ノードのみでクラスターを強制的に再構成できる回復モードがあります。ノードを再起動できない場合、または同じエンドポイントで新しいインスタンスを開始する以外に手がない場合のみ実行すべきです。

続行する前に注意すべき重要な点：
- 障害が発生したノードが再びクラスターに接続できないことを確認してください。
- ステップで指定されるまで、新しいノードを起動しないでください。

上記の点がすべて真であることを確認したら、次の手順を実行する必要があります：
1. 新しいリーダーとなる単一の Keeper ノードを選択してください。そのノードのデータはクラスター全体で使用されるため、最新の状態のノードを使用することをお勧めします。
2. 他の操作を行う前に、選択したノードの `log_storage_path` と `snapshot_storage_path` フォルダのバックアップを作成してください。
3. 使用したいすべてのノードでクラスターを再構成してください。
4. 選択したノードに `rcvr` という四文字コマンドを送信し、そのノードを回復モードに移行するか、`--force-recovery` 引数を使用して選択したノードの Keeper インスタンスを停止して再起動してください。
5. 一つずつ新しいノードの Keeper インスタンスを起動し、次のノードを起動する前に `mntr` が `follower` を返すことを確認してください。
6. 回復モード中、リーダーノードは新しいノードとのクオーラムを達成するまで `mntr` コマンドにエラーメッセージを返し、クライアントおよびフォロワーからのリクエストを拒否します。
7. クオーラムが達成されると、リーダーノードは通常の動作モードに戻り、リクエストを受け入れ、`mntr` を使用して Raft-verify を実行し、`zk_server_state` が `leader` であることを確認します。

## Using disks with Keeper {#using-disks-with-keeper}

Keeper は、スナップショット、ログファイル、および状態ファイルを保存するための [外部ディスク](/operations/storing-data.md) のサブセットをサポートしています。

サポートされているディスクの種類：
- s3_plain
- s3
- local

以下は、設定内に含まれるディスク定義の例です。

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

ログ用にディスクを使用するには、`keeper_server.log_storage_disk` 設定をディスクの名前に設定する必要があります。
スナップショット用にディスクを使用するには、`keeper_server.snapshot_storage_disk` 設定をディスクの名前に設定する必要があります。
さらに、最新のログやスナップショットに異なるディスクを使用するには、それぞれ `keeper_server.latest_log_storage_disk` および `keeper_server.latest_snapshot_storage_disk` を使用する必要があります。
その場合、Keeper は新しいログやスナップショットが作成されたときにファイルを正しいディスクに自動的に移動します。
状態ファイル用にディスクを使用するには、`keeper_server.state_storage_disk` 設定をディスクの名前に設定する必要があります。

ディスク間のファイル移動は安全であり、Keeper が転送中に停止してもデータが失われるリスクはありません。
ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されません。

`keeper_server.coordination_settings.force_sync` が `true` に設定されている場合 (`true` がデフォルト) は、すべての種類のディスクに対していくつかの保証を満たすことができません。
現在、`local` タイプのディスクのみが永続的な同期をサポートしています。
`force_sync` が使用されている場合、`latest_log_storage_disk` が使用されない限り、`log_storage_disk` は `local` ディスクである必要があります。
`latest_log_storage_disk` が使用されている場合は、必ず `local` ディスクである必要があります。
`force_sync` が無効になっている場合、すべてのセットアップで任意のタイプのディスクを使用できます。

Keeper インスタンスの保存セットアップは次のようになる可能性があります：

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

このインスタンスは、最新のログ以外のすべてのログを `log_s3_plain` ディスクに保存し、最新のログは `log_local` ディスクに保存します。
同じロジックがスナップショットにも適用され、最新のスナップショット以外のすべてのスナップショットが `snapshot_s3_plain` に保存され、最新のスナップショットは `snapshot_local` ディスクに保存されます。
### Changing disk setup {#changing-disk-setup}

:::important
新しいディスクセットアップを適用する前に、手動ですべての Keeper ログとスナップショットのバックアップを作成してください。
:::

階層型ディスクセットアップが定義されている場合（最新のファイル用に別々のディスクを使用）、Keeper は起動時にファイルを正しいディスクに自動的に移動しようとします。
前述したのと同じ保証が適用されます; ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されませんので、複数回の再起動が安全に行えます。

完全に新しいディスクにファイルを移動する必要がある場合（または 2つのディスクセットアップから単一ディスクセットアップに移動する場合）、複数の `keeper_server.old_snapshot_storage_disk` および `keeper_server.old_log_storage_disk` の定義を使用することができます。

以下の設定は、以前の 2つのディスクセットアップから完全に新しい単一ディスクセットアップに移行する方法を示します：

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
## Configuring logs cache {#configuring-logs-cache}

ディスクから読み取るデータ量を最小限に抑えるために、Keeper はメモリ内にログエントリをキャッシュします。
リクエストが大きい場合、ログエントリがメモリを過剰に消費するため、キャッシュされるログの量には上限があります。
この制限は次の2つの設定で制御されます：
- `latest_logs_cache_size_threshold` - キャッシュ内に保存される最新ログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットされる必要がある後続のログの合計サイズ

デフォルト値が大きすぎる場合は、これらの2つの設定を減らすことでメモリ使用量を削減できます。

:::note
各キャッシュから読み取られたログの量を確認するには `pfev` コマンドを使用できます。
また、Prometheus エンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡できます。
:::
## Prometheus {#prometheus}

Keeper は [Prometheus](https://prometheus.io) からのスクレイピング用のメトリックデータを公開できます。

設定：

- `endpoint` – Prometheus サーバーによるメトリックのスクレイピング用 HTTP エンドポイント。'/' から始まります。
- `port` – `endpoint` 用のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリックを公開するためのフラグ。
- `events` – [system.events](/operations/system-tables/events) テーブルからメトリックを公開するためのフラグ。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルの現在のメトリック値を公開するためのフラグ。

**例**

``` xml
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

**確認**（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloudの [Prometheus統合](/integrations/prometheus) についてもご覧ください。
## ClickHouse Keeper User Guide {#clickhouse-keeper-user-guide}

このガイドは、ClickHouse Keeper を構成するためのシンプルで最小限の設定を提供し、分散操作をテストする方法の例を示します。この例は、Linux 上で 3 ノードを使用して実行されます。
### 1. Configure Nodes with Keeper settings {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト（`chnode1`、`chnode2`、`chnode3`）に3つの ClickHouse インスタンスをインストールします。（ClickHouse のインストールについての詳細は、[クイックスタート](/getting-started/install.md) を参照してください。）

2. 各ノードで、ネットワークインターフェイスを通じて外部通信を許可するために、以下のエントリを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. すべての3つのサーバーに次の ClickHouse Keeper 構成を追加し、各サーバーの `<server_id>` 設定を更新します。`chnode1` の場合は `1`、`chnode2` の場合は `2` などです。
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

    上記で使用される基本設定は以下の通りです：

    |パラメータ |説明                   |例                  |
    |----------|----------------------|---------------------|
    |tcp_port   |keeper のクライアントが使用するポート|9181、zookeeper の2181のデフォルト相当|
    |server_id| raft構成で使用される各ClickHouse Keeper サーバーの識別子| 1|
    |coordination_settings| タイムアウトなどのパラメータを含むセクション| タイムアウト: 10000、ログレベル: trace|
    |server    |参加するサーバーの定義|各サーバーの定義リスト|
    |raft_configuration|keeper クラスター内の各サーバーの設定|各サーバーの設定|
    |id      |keeper サービス用のサーバーの数値 ID|1|
    |hostname   |keeper クラスター内の各サーバーのホスト名、IP、または FQDN|`chnode1.domain.com`|
    |port|サーバー間の keeper 接続待ち受けポート|9234|

4.  Zookeeper コンポーネントを有効にします。これは ClickHouse Keeper エンジンを使用します：
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

    上記で使用される基本設定は以下の通りです：

    |パラメータ |説明                   |例                  |
    |----------|----------------------|---------------------|
    |node   |ClickHouse Keeper 接続用のノードリスト|各サーバーの設定エントリ|
    |host|各 ClickHouse Keeper ノードのホスト名、IP、または FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper クライアントポート| 9181|

5. ClickHouse を再起動して、各 Keeper インスタンスが動作していることを確認します。次のコマンドを各サーバーで実行します。`ruok` コマンドは、Keeper が実行中で正常であれば `imok` を返します：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` データベースには、ClickHouse Keeper インスタンスの詳細を含む `zookeeper` というテーブルがあります。このテーブルを表示してみましょう：
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
### 2. ClickHouse におけるクラスタの設定 {#2--configure-a-cluster-in-clickhouse}

1. 2つのシャードと2つのノードに1つのレプリカのみを持つシンプルなクラスタを設定します。3つ目のノードは ClickHouse Keeper の要件を満たすためにクォーラムを達成するために使用されます。`chnode1` と `chnode2` で設定を更新します。以下のクラスタでは、各ノードに1つのシャードが定義されており、合計で2つのシャードがあり、レプリケーションはありません。この例では、一部のデータはノード1にあり、他のデータはノード2にあります。
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

    |パラメータ   |説明                          |例                   |
    |----------|------------------------------|---------------------|
    |shard   |クラスタ定義におけるレプリカのリスト|各シャードのレプリカのリスト|
    |replica|各レプリカの設定のリスト|各レプリカの設定エントリ|
    |host|レプリカシャードをホストするサーバーのホスト名、IP、またはFQDN|`chnode1.domain.com`|
    |port|ネイティブ TCP プロトコルを使用して通信するために使用されるポート|9000|
    |user|クラスタインスタンスに認証するために使用されるユーザー名|default|
    |password|クラスタインスタンスへの接続を許可するために定義されたユーザーのパスワード|`ClickHouse123!`|

2. ClickHouse を再起動してクラスタが作成されたことを確認します:
    ```bash
    SHOW clusters;
    ```

    クラスタが表示されるはずです:
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```
### 3. 分散テーブルを作成しテストする {#3-create-and-test-distributed-table}

1. `chnode1` 上の ClickHouse クライアントを使用して新しいクラスタに新しいデータベースを作成します。`ON CLUSTER` 句を使用すると、両方のノードに自動的にデータベースが作成されます。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1` データベースに新しいテーブルを作成します。再度、`ON CLUSTER` によりテーブルが両方のノードに作成されます。
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1` ノードで行をいくつか追加します:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2` ノードでいくつかの行を追加します:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで `SELECT` ステートメントを実行すると、そのノードにあるデータのみが表示されることに注意してください。例えば、`chnode1` では:
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

    `chnode2` 上では:
6.
    ```sql
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

6. `Distributed` テーブルを作成して、2つのシャード上のデータを表現します。`Distributed` テーブルエンジンを持つテーブルは独自のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りはすべてのシャードに対して行われ、書き込みはシャード間で分散できます。次のクエリを `chnode1` で実行します:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table` にクエリを実行すると、2つのシャードからの4行のデータが返されます:
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

このガイドでは、ClickHouse Keeper を使用してクラスタを設定する方法を示しました。ClickHouse Keeper を使用すると、クラスタを構成し、シャード間でレプリケート可能な分散テーブルを定義することができます。
## 異なるパスを使用した ClickHouse Keeper の設定 {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### 説明 {#description}

この記事では、組み込みの `{uuid}` マクロ設定を使用して、ClickHouse Keeper または ZooKeeper にユニークなエントリを作成する方法について説明します。ユニークなパスは、テーブルを頻繁に作成および削除する際に役立ち、Keeper のガーベジコレクションがパスエントリを削除するのを数分待つ必要がないため、パスを作成するたびに新しい `uuid` が使用され、そのパスは決して再利用されません。
### 例環境 {#example-environment}
ClickHouse Keeper がすべてのノードに設定され、2つのノードに ClickHouse がある3ノードクラスタ。この構成は、ClickHouse Keeper に3ノード（タイブレーカーノードを含む）を提供し、2つのレプリカで構成された単一の ClickHouse シャードを提供します。

|ノード|説明|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスタ `cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスタ `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeper タイブレーカーノード|

クラスタの例設定:
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
### `{uuid}` を使用するためのテーブル設定手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定
サーバー1の例:
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
`shard` および `replica` のマクロを定義しますが、{uuid} はここで定義されていないことに注意してください。これは組み込みマクロであり、定義の必要はありません。
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

3. マクロと `{uuid}` を使用してクラスタ上にテーブルを作成します

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

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘
```

4. 分散テーブルを作成します

```sql
create table db_uuid.dist_uuid_table1 on cluster 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
```

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
1. 最初のノード（例: `chnode1`）にデータを挿入します
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

2. 2つ目のノード（例: `chnode2`）にデータを挿入します
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

3. 分散テーブルを使用してレコードを表示します
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
### 代替案 {#alternatives}
デフォルトのレプリケーションパスは、マクロを使って事前に定義し、`{uuid}` を使用することができます。

1. 各ノードでテーブルのデフォルトを設定します
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
特定のデータベースにノードが使用されている場合、各ノードでマクロ `{database}` を定義することもできます。
:::

2. 明示的なパラメータなしでテーブルを作成します:
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

Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 rows in set. Elapsed: 1.175 sec.
```

3. デフォルト構成で使用される設定を確認します
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

Query id: 5925ecce-a54f-47d8-9c3a-ad3257840c9e

┌─statement────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id
SETTINGS index_granularity = 8192 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```
### トラブルシューティング {#troubleshooting}

テーブル情報とUUIDを取得するための例コマンド:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルがZooKeeper内で持つUUIDに関する情報を取得するための例コマンド
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは `Atomic` でなければなりません。以前のバージョンからアップグレードしている場合、`default` データベースは `Ordinary` タイプである可能性があります。
:::

確認するために:

例えば、

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

ClickHouse Keeper は、`keeper_server.enable_reconfiguration` がオンになっている場合、ZooKeeper の [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) コマンドを部分的にサポートしています。

:::note
この設定がオフの場合、レプリカの `raft_configuration` セクションを手動で変更することでクラスタを再構成できます。変更を適用するのはリーダーのみであるため、すべてのレプリカでファイルを編集するようにしてください。代わりに、ZooKeeper 互換のクライアントを通じて `reconfig` クエリを送信することもできます。
:::

仮想ノード `/keeper/config` は、以下の形式で最後にコミットされたクラスタ構成を含みます:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリは改行で区切られています。
- `server_type` は `participant` または `learner` です（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) はリーダー選挙には参加しません）。
- `server_priority` は、[どのノードがリーダー選挙で優先されるべきか](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)を知らせる非負整数です。0 の優先度は、サーバーがリーダーになることはありません。

例:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

新しいサーバーを追加し、既存のサーバーを削除し、既存のサーバーの優先順位を変更するために `reconfig` コマンドを使用できます。例を以下に示します（`clickhouse-keeper-client` を使用）:

```bash

# 2つの新しいサーバーを追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# 他の2つのサーバーを削除
reconfig remove "3,4"

# 既存サーバーの優先度を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

そして、`kazoo` の例も示します:

```python

# 2つの新しいサーバーを追加し、他の2つのサーバーを削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# 既存のサーバーの優先度を8に変更
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining` のサーバーは、上で説明したサーバーフォーマットである必要があります。サーバーエントリはカンマで区切る必要があります。新しいサーバーを追加する際、`server_priority`（デフォルト値は1）や `server_type`（デフォルトは `participant`）を省略できます。

既存のサーバーの優先順位を変更する場合は、目標優先順位を持った `joining` に追加します。サーバーのホスト、ポート、タイプは、既存のサーバー構成と一致している必要があります。

サーバーは `joining` および `leaving` に表示された順序で追加および削除されます。
`joining` からのすべての更新は、`leaving` からの更新の前に処理されます。

Keeper 再構成実装にはいくつかの注意点があります:

- インクリメンタル再構成のみがサポートされています。`new_members` が空でないリクエストは拒否されます。

  ClickHouse Keeper の実装は、NuRaft API に依存して動的にメンバーシップを変更します。NuRaft は、サーバーを1台ずつ追加または削除する方法を提供しています。これにより、構成に対する変更（`joining` の各部分、`leaving` の各部分）を個別に決定する必要があり、ユーザーにとって誤解を招くバルク再構成は提供されません。

  サーバータイプ（参加者/学習者）を変更することもできません。これは NuRaft によってサポートされておらず、サーバーを削除して再追加するしかありませんが、これは再度誤解を招く可能性があります。

- 返される `znodestat` 値を使用することはできません。
- `from_version` フィールドは使用されません。`from_version` が設定されたリクエストは拒否されます。
  これは `/keeper/config` が仮想ノードであるためで、永続ストレージには保存されず、各リクエストごとに指定されたノード構成で動的に生成されます。この決定は、NuRaft がすでにこの構成を保存しているため、データを重複させないために行われました。
- ZooKeeper と異なり、`sync` コマンドを提出することでクラスタの再構成を待機する手段はありません。
  新しい構成は _eventually_ 適用されますが、時間の保証はありません。
- `reconfig` コマンドはさまざまな理由で失敗する場合があります。クラスタの状態を確認し、アップデートが適用されたかどうかを確認できます。
## 単一ノードの Keeper をクラスタに変換する {#converting-a-single-node-keeper-into-a-cluster}

実験的な keeper ノードをクラスタに拡張する必要がある場合があります。以下は、3ノードのクラスタにするための手順です。

- **重要**: 新しいノードは、現在のクォーラムよりも少ないバッチで追加する必要があります。さもなければ、彼らの間でリーダーが選出されます。この例では、一つずつ追加します。
- 既存の keeper ノードは `keeper_server.enable_reconfiguration` 設定パラメータをオンにする必要があります。
- 完全な新しい設定で2番目のノードを開始します。
- 開始したら、ノード1に [`reconfig`](#reconfiguration) を使用して追加します。
- 次に、3番目のノードを起動し、[`reconfig`](#reconfiguration) を使って追加します。
- 新しい keeper ノードを追加して `clickhouse-server` 設定を更新し、変更を適用するために再起動します。
- ノード1の raft 構成を更新し、必要に応じて再起動します。

このプロセスに自信を持つために、以下の [sandbox repository](https://github.com/ClickHouse/keeper-extend-cluster) を参照してください。
## サポートされていない機能 {#unsupported-features}

ClickHouse Keeper は ZooKeeper と完全に互換性を持つことを目指していますが、現在実装されていない機能もあります（開発は進行中です）:

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は `Stat` オブジェクトの返却をサポートしていません
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL) をサポートしていません
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) は [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) ウォッチを機能しません
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) と [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.WatcherType,boolean)) はサポートされていません
- `setWatches` はサポートされていません
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) タイプのznode を作成することはサポートされていません
- [`SASL 認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) はサポートされていません
