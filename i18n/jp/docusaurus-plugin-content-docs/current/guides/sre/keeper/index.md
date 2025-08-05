---
slug: '/guides/sre/keeper/clickhouse-keeper'
sidebar_label: 'ClickHouse Keeper'
sidebar_position: 10
keywords:
- 'Keeper'
- 'ZooKeeper'
- 'clickhouse-keeper'
description: 'ClickHouse Keeper, or clickhouse-keeper, replaces ZooKeeper and provides
  replication and coordination.'
title: 'ClickHouse Keeper'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse Keeper (clickhouse-keeper)

<SelfManaged />

ClickHouse Keeperは、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)および[分散DDL](/sql-reference/distributed-ddl.md)クエリの実行のための調整システムを提供します。ClickHouse Keeperは、ZooKeeperと互換性があります。

### 実装の詳細 {#implementation-details}

ZooKeeperは、初期の著名なオープンソースの調整システムの1つです。Javaで実装されており、かなりシンプルで強力なデータモデルを持っています。ZooKeeperの調整アルゴリズムであるZooKeeper Atomic Broadcast (ZAB)は、各ZooKeeperノードがローカルでリードに応じるため、リードに対する線形性の保証を提供しません。ZooKeeperとは異なり、ClickHouse KeeperはC++で書かれており、[RAFTアルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは、リードとライティングの両方に対して線形性を許可し、さまざまな言語でのいくつかのオープンソース実装があります。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：線形性のある書き込みと非線形性のあるリードです。互換性のあるクライアント-サーバプロトコルを持っているため、標準的なZooKeeperクライアントを使用してClickHouse Keeperと対話できます。スナップショットとログはZooKeeperとは互換性のない形式を持っていますが、`clickhouse-keeper-converter`ツールにより、ZooKeeperデータをClickHouse Keeperスナップショットに変換できます。ClickHouse KeeperのインターサーバプロトコルもZooKeeperとは互換性がないため、混合ZooKeeper / ClickHouse Keeperクラスターは不可能です。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同様にアクセス制御リスト（ACL）をサポートしています。ClickHouse Keeperは、同じ権限セットをサポートしており、`world`、`auth`、および`digest`という同一の組み込みスキームを持っています。ダイジェスト認証スキームは`username:password`のペアを使用し、パスワードはBase64でエンコードされています。

:::note
外部統合はサポートされていません。
:::

### 設定 {#configuration}

ClickHouse Keeperは、ZooKeeperのスタンドアロンの代替として使用するか、ClickHouseサーバーの内部部分として使用できます。どちらの場合も、設定はほぼ同じ`.xml`ファイルです。

#### Keeperの設定項目 {#keeper-configuration-settings}

主要なClickHouse Keeperの設定タグは`<keeper_server>`で、次のパラメータがあります。

| パラメータ                             | 説明                                                                                                                                                                                                                                           | デフォルト                                                                                                            |
|----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `tcp_port`                             | クライアントが接続するためのポート。                                                                                                                                                                                                           | `2181`                                                                                                             |
| `tcp_port_secure`                      | クライアントとkeeper-server間のSSL接続のためのセキュアポート。                                                                                                                                                                               | -                                                                                                                    |
| `server_id`                            | ユニークなサーバIDで、ClickHouse Keeperクラスタの各参加者はユニークな番号（1, 2, 3など）を持たなければなりません。                                                                                                                                     | -                                                                                                                    |
| `log_storage_path`                     | 調整ログのパスで、ZooKeeperと同様に、非忙しいノードにログを保存するのが最適です。                                                                                                                                                                    | -                                                                                                                    |
| `snapshot_storage_path`                | 調整スナップショットのパス。                                                                                                                                                                                                                 | -                                                                                                                    |
| `enable_reconfiguration`               | [`reconfig`](#reconfiguration)を介して動的なクラスター再構成を有効にします。                                                                                                                                                                 | `False`                                                                                                            |
| `max_memory_usage_soft_limit`          | Keeperの最大メモリ使用量のソフトリミット（バイト数）。                                                                                                                                                                                       | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                                   |
| `max_memory_usage_soft_limit_ratio`    | `max_memory_usage_soft_limit`が設定されていない場合やゼロに設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                                          | `0.9`                                                                                                              |
| `cgroups_memory_observer_wait_time`    | `max_memory_usage_soft_limit`が設定されていない場合や`0`に設定されている場合、この間隔を使用して物理メモリの量を観察します。メモリ量が変わると、`max_memory_usage_soft_limit_ratio`によってKeeperのメモリソフトリミットを再計算します。   | `15`                                                                                                              |
| `http_control`                         | [HTTP制御](#http-control)インターフェイスの設定。                                                                                                                                                                                             | -                                                                                                                    |
| `digest_enabled`                       | リアルタイムデータ整合性チェックを有効にします。                                                                                                                                                                                            | `True`                                                                                                             |
| `create_snapshot_on_exit`              | シャットダウン中にスナップショットを作成します。                                                                                                                                                                                             | -                                                                                                                    |
| `hostname_checks_enabled`              | クラスター設定のためのサニティホスト名チェックを有効にします（例：リモートエンドポイントと共にlocalhostが使われている場合）。                                                                                                                    | `True`                                                                                                             |
| `four_letter_word_white_list`          | 4lwコマンドのホワイトリスト。                                                                                                                                                                                                                 | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |

他の一般的なパラメータは、ClickHouseサーバーの設定から受け継がれます（`listen_host`、`logger`など）。

#### 内部調整設定 {#internal-coordination-settings}

内部調整設定は、`<keeper_server>.<coordination_settings>`セクションにあり、次のパラメータがあります。

| パラメータ                           | 説明                                                                                                                                                                                                            | デフォルト                                                                                                      |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`                | 単一のクライアント操作のタイムアウト（ms）                                                                                                                                                                      | `10000`                                                                                                      |
| `min_session_timeout_ms`              | クライアントセッションの最小タイムアウト（ms）                                                                                                                                                                 | `10000`                                                                                                      |
| `session_timeout_ms`                  | クライアントセッションの最大タイムアウト（ms）                                                                                                                                                                 | `100000`                                                                                                     |
| `dead_session_check_period_ms`        | ClickHouse Keeperがデッドセッションをチェックして削除する頻度（ms）                                                                                                                                             | `500`                                                                                                        |
| `heart_beat_interval_ms`              | ClickHouse Keeperリーダーがフォロワーにハートビートを送信する頻度（ms）                                                                                                                                       | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`     | フォロワーがリーダーからハートビートを受信しない場合、この間隔内でリーダー選挙を開始できます。`election_timeout_upper_bound_ms`以下でなければなりません。理想的には等しくない方が良いです。                                    | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`     | フォロワーがリーダーからハートビートを受信しない場合、リーダー選挙を開始しなければなりません。                                                                                                                | `2000`                                                                                                       |
| `rotate_log_storage_interval`         | 単一ファイルに格納するログレコードの数。                                                                                                                                                                         | `100000`                                                                                                     |
| `reserved_log_items`                  | コンパクション前に格納する調整ログレコードの数。                                                                                                                                                                 | `100000`                                                                                                     |
| `snapshot_distance`                   | ClickHouse Keeperが新しいスナップショットを作成する頻度（ログ内のレコード数）。                                                                                                                                 | `100000`                                                                                                     |
| `snapshots_to_keep`                   | 保持するスナップショットの数。                                                                                                                                                                                  | `3`                                                                                                          |
| `stale_log_gap`                       | リーダーがフォロワーをスティールと見なし、ログの代わりにスナップショットを送信するしきい値。                                                                                                                                 | `10000`                                                                                                     |
| `fresh_log_gap`                       | ノードがフレッシュになったとき。                                                                                                                                                                                 | `200`                                                                                                        |
| `max_requests_batch_size`             | RAFTに送信される前のリクエスト数の最大バッチサイズ。                                                                                                                                                           | `100`                                                                                                        |
| `force_sync`                          | 調整ログへの各書き込み時に`fsync`を呼び出します。                                                                                                                                                               | `true`                                                                                                       |
| `quorum_reads`                        | 読み取りリクエストを全てRAFTコンセンサスを通じて書き込みとして実行します。                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                     | 調整に関するテキストロギングレベル（トレース、デバッグなど）。                                                                                                                                                   | `system default`                                                                                            |
| `auto_forwarding`                     | フォロワーからリーダーへの書き込みリクエストの転送を許可します。                                                                                                                                                   | `true`                                                                                                       |
| `shutdown_timeout`                    | 内部接続を終了し、シャットダウンするまで待機します（ms）。                                                                                                                                                       | `5000`                                                                                                       |
| `startup_timeout`                     | サーバーが指定されたタイムアウト内に他のクォーラム参加者と接続しない場合、終了します（ms）。                                                                                                         | `30000`                                                                                                     |
| `async_replication`                   | 非同期レプリケーションを有効にします。すべての書き込みおよび読み取り保証が保持され、パフォーマンスが向上します。設定はデフォルトで無効になっており、後方互換性を壊さないようになっています。                                  | `false`                                                                                                      |
| `latest_logs_cache_size_threshold`    | 最新のログエントリのメモリ内キャッシュの最大合計サイズ。                                                                                                                                                          | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold`    | コミットのために次に必要なログエントリのメモリ内キャッシュの最大合計サイズ。                                                                                                                                         | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`           | ファイルがディスク間で移動中に失敗が発生した場合、再試行の間隔。                                                                                                                                                          | `1000`                                                                                                       |
| `disk_move_retries_during_init`       | 初期化中にファイルがディスク間で移動されている間、失敗が発生した場合の再試行回数。                                                                                                                                  | `100`                                                                                                        |
| `experimental_use_rocksdb`            | rocksdbをバックエンドストレージとして使用します。                                                                                                                                                                     | `0`                                                                                                          |

クウォータム設定は`<keeper_server>.<raft_configuration>`セクションにあり、サーバーの説明が含まれています。

クォーラム全体の唯一のパラメータは`secure`で、クォーラム参加者間の通信に対する暗号化接続を有効にします。このパラメータは、ノード間の内部通信のためにSSL接続が必要な場合は`true`に設定し、そうでない場合は未指定にしておくことができます。

各`<server>`の主なパラメータは次のとおりです。

- `id` — クォーラム内のサーバ識別子。
- `hostname` — このサーバが配置されているホスト名。
- `port` — このサーバが接続を待ち受けるポート。
- `can_become_leader` — `learner`としてサーバを設定するために`false`に設定します。省略された場合、値は`true`です。

:::note
ClickHouse Keeperクラスタのトポロジーに変化があった場合（例：サーバの交換）、`server_id`と`hostname`のマッピングを一貫して維持し、異なるサーバに対して既存の`server_id`のシャッフルや再利用を避けるようにしてください（自動化スクリプトに依存してClickHouse Keeperを展開する場合に発生する可能性があります）。

Keeperインスタンスのホストが変更可能な場合は、生のIPアドレスの代わりにホスト名を定義して使用することをお勧めします。ホスト名の変更は、サーバを削除して再追加することと同じであり、場合によっては実行できないことがあります（例えば、クォーラムに必要なKeeperインスタンスが不足している場合）。
:::

:::note
`async_replication`はデフォルトで無効になっており、後方互換性を壊さないようになっています。すべてのKeeperインスタンスが`async_replication`をサポートするバージョン（v23.9+）を実行している場合は、パフォーマンスの向上が望めるため、有効にすることをお勧めします。
:::

3つのノードを持つクォーラムの設定の例は、`test_keeper_`プレフィックスの付いた[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)に見つけることができます。サーバー#1の例設定は次のとおりです。

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

ClickHouse Keeperは、ClickHouseサーバーパッケージにバンドルされており、`<keeper_server>`の設定を`/etc/your_path_to_config/clickhouse-server/config.xml`に追加し、いつも通りClickHouseサーバーを起動します。スタンドアロンのClickHouse Keeperを実行したい場合は、次のように始めることができます。

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は、作成するか、`clickhouse`に対して`keeper`を引数として指定します。

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### Four Letter Word Commands {#four-letter-word-commands}

ClickHouse Keeperは、Zookeeperとほぼ同じ4lwコマンドを提供します。各コマンドは`mntr`、`stat`などの4文字で構成されています。いくつかの興味深いコマンドがあり、`stat`はサーバーや接続されたクライアントに関する一般的な情報を提供し、`srvr`と`cons`はそれぞれサーバーと接続の詳細情報を提供します。

4lwコマンドには、デフォルト値が`conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`のホワイトリスト設定`four_letter_word_white_list`があります。

テレネットまたはncを使用してクライアントポートからClickHouse Keeperにコマンドを発行できます。

```bash
echo mntr | nc localhost 9181
```

以下は詳細な4lwコマンドのリストです：

- `ruok`: サーバーがエラーログなしで実行されているかどうかをテストします。サーバーが実行中であれば`imok`で応答します。そうでない場合は、全く応答しません。`imok`の応答はサーバーがクォーラムに参加していることを示すものではなく、単にサーバープロセスがアクティブで指定されたクライアントポートにバインドされていることを示します。クォーラムおよびクライアント接続情報に関する詳細は「stat」を使用してください。

```response
imok
```

- `mntr`: クラスターのヘルスを監視するために使用できる変数のリストを出力します。

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

- `srvr`: サーバーの完全な詳細をリストします。

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

- `stat`: サーバーおよび接続されたクライアントに関する簡潔な情報をリストします。

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

- `srst`: サーバーの統計をリセットします。このコマンドは`srvr`、`mntr`、および`stat`の結果に影響を与えます。

```response
Server stats reset.
```

- `conf`: サーバーの設定に関する詳細を印刷します。

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

- `cons`: このサーバーに接続されているすべてのクライアントに関する接続/セッションの詳細をリストします。受信/送信パケット数、セッションID、操作の待機時間、最後の実行された操作などの情報が含まれます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: すべての接続の接続/セッションの統計をリセットします。

```response
Connection stats reset.
```

- `envi`: サーバーの環境に関する詳細を印刷します。

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

- `dirs`: スナップショットおよびログファイルの合計サイズをバイト単位で表示します。

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: サーバーが読み取り専用モードで実行されているかをテストします。サーバーが読み取り専用モードの場合は`ro`で応答し、そうでない場合は`rw`で応答します。

```response
rw
```

- `wchs`: サーバーのウォッチに関する簡略情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: セッションごとのサーバーのウォッチに関する詳細情報をリストします。これにより、関連付けられたウォッチ（パス）を持つセッション（接続）のリストが出力されます。ウォッチの数によっては、この操作が高コスト（サーバーのパフォーマンスに影響を与える）となる場合があるため、注意して使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: パスごとのサーバーのウォッチに関する詳細情報をリストします。これにより、関連付けられたセッションを持つパス（znodes）のリストが出力されます。ウォッチの数によっては、この操作が高コスト（すなわち、サーバーのパフォーマンスに影響を与える）になる可能性があるため、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: 未処理のセッションとエフェメラルノードをリストします。これはリーダーでのみ機能します。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: スナップショット作成タスクをスケジュールします。成功した場合はスケジュールされたスナップショットの最後にコミットされたログインデックスを返し、失敗した場合は`Failed to schedule snapshot creation task.`と返します。スナップショットが完了したかどうかを判断するためには、`lgif`コマンドが役立ちます。

```response
100
```

- `lgif`: Keeperログ情報。`first_log_idx`: ログストア内の最初のログインデックス; `first_log_term`: 私の最初のログターム; `last_log_idx`: ログストア内の最後のログインデックス; `last_log_term`: 私の最後のログターム; `last_committed_log_idx`: 状態マシンにおける私の最後にコミットされたログインデックス; `leader_committed_log_idx`: リーダーの視点からみたコミットされたログインデックス; `target_committed_log_idx`: コミットされるべきターゲットログインデックス; `last_snapshot_idx`: 最後のスナップショット内の最大コミットされたログインデックス。

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

- `rqld`: 新しいリーダーになるリクエストを送信します。リクエストが送信された場合は`Sent leadership request to leader.`と返し、リクエストが送信されなかった場合は`Failed to send leadership request to leader.`と返します。ノードがすでにリーダーの場合、結果はリクエストが送信されたかのようになります。

```response
Sent leadership request to leader.
```

- `ftfl`: すべての機能フラグをリストし、Keeperインスタンスで有効になっているかどうかを確認します。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: リーダーシップを放棄してフォロワーになるリクエストを送信します。このリクエストを受信したサーバーがリーダーであれば、最初に書き込み操作を一時停止し、後継者（現在のリーダーは決して後継者にはならない）が最新のログのキャッチアップを終了するまで待機し、その後辞任します。後継者は自動的に選択されます。リクエストが送信された場合は`Sent yield leadership request to leader.`と返し、リクエストが送信されなかった場合は`Failed to send yield leadership request to leader.`と返します。ノードがすでにフォロワーの場合、結果はリクエストが送信されたかのようになります。

```response
Sent yield leadership request to leader.
```

- `pfev`: すべての収集されたイベントの値を返します。各イベントについて、イベント名、イベント値、およびイベントの説明を返します。

```response
FileOpen        62      Number of files opened.
Seek    4       Number of times the 'lseek' function was called.
ReadBufferFromFileDescriptorRead        126     Number of reads (read/pread) from a file descriptor. Does not include sockets.
ReadBufferFromFileDescriptorReadFailed  0       Number of times the read (read/pread) from a file descriptor have failed.
ReadBufferFromFileDescriptorReadBytes   178846  Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.
WriteBufferFromFileDescriptorWrite      7       Number of writes (write/pwrite) to a file descriptor. Does not include sockets.
WriteBufferFromFileDescriptorWriteFailed        0       Number of times the write (write/pwrite) to a file descriptor have failed.
WriteBufferFromFileDescriptorWriteBytes 153     Number of bytes written to file descriptors. If the file is compressed, this will show compressed data size.
FileSync        2       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for files.
DirectorySync   0       Number of times the F_FULLFSYNC/fsync/fdatasync function was called for directories.
FileSyncElapsedMicroseconds     12756   Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for files.
DirectorySyncElapsedMicroseconds        0       Total time spent waiting for F_FULLFSYNC/fsync/fdatasync syscall for directories.
ReadCompressedBytes     0       Number of bytes (the number of bytes before decompression) read from compressed sources (files, network).
CompressedReadBufferBlocks      0       Number of compressed blocks (the blocks of data that are compressed independent of each other) read from compressed sources (files, network).
CompressedReadBufferBytes       0       Number of uncompressed bytes (the number of bytes after decompression) read from compressed sources (files, network).
AIOWrite        0       Number of writes with Linux or FreeBSD AIO interface
AIOWriteBytes   0       Number of bytes written with Linux or FreeBSD AIO interface
...
```
### HTTP Control {#http-control}

ClickHouse Keeperは、レプリカがトラフィックを受信する準備が整ったかどうかを確認するためのHTTPインターフェイスを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)のようなクラウド環境で使用されることがあります。

`/ready`エンドポイントを有効にする設定の例：

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

KeeperはZooKeeperおよびそのクライアントと完全に互換性がありますが、ClickHouseクライアントが使用できる独自の機能やリクエストタイプもいくつか導入されています。これらの機能は後方互換性のない変更をもたらす可能性があるため、デフォルトではほとんどが無効になっており、`keeper_server.feature_flags`設定を使用して有効化できます。すべての機能は明示的に無効にすることができます。Keeperクラスターの新しい機能を有効にする場合は、最初にその機能をサポートしているバージョンにクラスター内のすべてのKeeperインスタンスを更新し、その後に機能自体を有効にすることをお勧めします。

`multi_read`を無効にし、`check_not_exists`を有効にする機能フラグ設定の例：

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

利用可能な機能は以下の通りです：

- `multi_read` - 複数のリクエストを読むためのサポート。デフォルト: `1`
- `filtered_list` - ノードの種類（エフェメラルまたは永続）によって結果をフィルタリングするリストリクエストのサポート。デフォルト: `1`
- `check_not_exists` - ノードが存在しないことを主張する`CheckNotExists`リクエストのサポート。デフォルト: `0`
- `create_if_not_exists` - ノードが存在しない場合にノードを作成しようとする`CreateIfNotExists`リクエストのサポート。存在する場合、変更は適用されず`ZOK`が返されます。デフォルト: `0`
- `remove_recursive` - ノードとそのサブツリーを削除する`RemoveRecursive`リクエストのサポート。デフォルト: `0`
### Migration from ZooKeeper {#migration-from-zookeeper}

ZooKeeperからClickHouse Keeperへのシームレスな移行は不可能です。ZooKeeperクラスターを停止し、データを変換し、ClickHouse Keeperを起動する必要があります。`clickhouse-keeper-converter`ツールを使用すると、ZooKeeperのログやスナップショットをClickHouse Keeperのスナップショットに変換できます。このツールはZooKeeper > 3.4でのみ動作します。移行の手順は以下の通りです：

1. すべてのZooKeeperノードを停止します。

2. オプションですが推奨: ZooKeeperのリーダーノードを見つけ、それを再起動してまた停止します。これにより、ZooKeeperは一貫したスナップショットを作成します。

3. リーダーで`clickhouse-keeper-converter`を実行します。例えば：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを構成された`keeper`のあるClickHouseサーバーノードにコピーするか、ZooKeeperの代わりにClickHouse Keeperを起動します。スナップショットはすべてのノードに保存される必要があります。そうでない場合、空のノードが早く、いずれかのノードがリーダーになる可能性があります。

:::note
`keeper-converter`ツールは、Keeperのスタンドアロンバイナリからは使用できません。
ClickHouseがインストールされている場合は、バイナリを直接使用できます：

```bash
clickhouse keeper-converter ...
```

そうでない場合は、[バイナリをダウンロード](/getting-started/quick-start#download-the-binary)し、上記のようにClickHouseをインストールせずにツールを実行できます。
:::
### Recovering after losing quorum {#recovering-after-losing-quorum}

ClickHouse KeeperはRaftを使用しているため、クラスターのサイズに応じて一定数のノードクラッシュに耐えることができます。 \
例えば、3ノードのクラスターでは、1ノードがクラッシュしても正常に動作し続けます。

クラスター構成は動的に設定可能ですが、一部の制限があります。再構成もRaftに依存しているため、ノードをクラスターに追加/削除するにはクォーラムが必要です。同時にクラスタ内のノードが多くクラッシュし、再起動の見込みがない場合、Raftは動作を停止し、従来の方法でクラスターを再構成することを許可しなくなります。

とはいえ、ClickHouse Keeperにはリカバリーモードがあり、ノード1つのみでクラスターを強制的に再構成することが可能です。これは、ノードを再起動できない場合や、同じエンドポイントで新しいインスタンスを立ち上げる場合にのみ、最終手段として行うべきです。

継続する前に確認すべき重要な点：
- 失敗したノードが再びクラスターに接続できないことを確認してください。
- 段階で指定されるまで、新しいノードを起動しないでください。

上記のことが確認されたら、以下の手順を行う必要があります：
1. 新しいリーダーとして単一のKeeperノードを選択します。そのノードのデータがクラスター全体で使用されるため、最も最新の状態であるノードを使用することをお勧めします。
2. 何かを行う前に、選択したノードの`log_storage_path`と`snapshot_storage_path`フォルダのバックアップを作成します。
3. 使用するすべてのノードでクラスターを再設定します。
4. 選択したノードに`rcvr`という4文字コマンドを送信し、そのノードをリカバリーモードに移行するか、選択したノードでKeeperインスタンスを停止し、`--force-recovery`引数をつけて再起動します。
5. 1つずつ新しいノードでKeeperインスタンスを起動し、次のノードを起動する前に`mntr`が`zk_server_state`に対して`follower`を返すことを確認します。
6. リカバリーモードの間、リーダーノードは`mntr`コマンドに対してエラーメッセージを返し、新しいノードとクォーラムを達成するまでクライアントやフォロワーからのリクエストを拒否します。
7. クォーラムが達成されると、リーダーノードは通常の動作モードに戻り、すべてのリクエストをRaft-verifyを使用して受け入れ、`mntr`は`zk_server_state`に対して`leader`を返す必要があります。
## Using disks with Keeper {#using-disks-with-keeper}

Keeperはスナップショット、ログファイル、および状態ファイルを保存するための[外部ディスク](/operations/storing-data.md)のサブセットをサポートします。

サポートされているディスクの種類は次の通りです：
- s3_plain
- s3
- local

以下は設定に含まれるディスク定義の例です。

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

ログ用のディスクを使用するには、`keeper_server.log_storage_disk`設定をディスクの名前に設定する必要があります。
スナップショット用のディスクを使用するには、`keeper_server.snapshot_storage_disk`設定をディスクの名前に設定する必要があります。
また、最新のログやスナップショットのために異なるディスクを使用することができ、`keeper_server.latest_log_storage_disk`と`keeper_server.latest_snapshot_storage_disk`をそれぞれ使用できます。
その場合、Keeperは新しいログやスナップショットが作成されると自動的にファイルを正しいディスクに移動します。
状態ファイル用のディスクを使用するには、`keeper_server.state_storage_disk`設定をディスクの名前に設定する必要があります。

ディスク間でファイルを移動することは安全であり、Keeperが転送の途中で停止した場合にデータを失うリスクはありません。
ファイルが新しいディスクに完全に移動されるまで、古いディスクから削除されることはありません。

`keeper_server.coordination_settings.force_sync`が`true`に設定されているKeeperは（デフォルト値は`true`）、すべてのタイプのディスクに対していくつかの保証を満たすことができません。
現在、`local`タイプのディスクだけが永続的な同期をサポートしています。
`force_sync`が使用される場合は、`latest_log_storage_disk`が使用されていない場合、`log_storage_disk`は`local`ディスクである必要があります。
`latest_log_storage_disk`が使用される場合、それは常に`local`ディスクであるべきです。
`force_sync`が無効になっている場合は、すべてのタイプのディスクを任意の設定で使用できます。

Keeperインスタンスの可能なストレージセットアップは次のようになります：

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

このインスタンスは、最新のログ以外は`log_s3_plain`ディスクに保存し、最新のログは`log_local`ディスクに保存します。
スナップショットにも同様のロジックが適用され、最新のスナップショット以外は`snapshot_s3_plain`に保存され、最新のスナップショットは`snapshot_local`ディスクに保存されます。
### Changing disk setup {#changing-disk-setup}

:::important
新しいディスクセットアップを適用する前に、すべてのKeeperログとスナップショットを手動でバックアップしてください。
:::

ティアードディスクセットアップが定義されている場合（最新のファイルに別々のディスクを使用）、Keeperは起動時にファイルを正しいディスクに自動的に移動しようとします。
以前と同じ保証が適用され、ファイルが新しいディスクに完全に移動されるまで、古いディスクから削除されることはありません。これにより、安全に複数回の再起動が可能です。

ファイルを完全に新しいディスクに移動する必要がある場合（または2ディスク設定から単一のディスク設定に移動する場合）、`keeper_server.old_snapshot_storage_disk`および`keeper_server.old_log_storage_disk`の複数の定義を使用することができます。

以下の構成は、前の2ディスクセットアップから完全に新しい単一ディスクセットアップへの移行を示しています。

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

起動時に、すべてのログファイルは`log_local`と`log_s3_plain`から`log_local2`ディスクに移動されます。
また、すべてのスナップショットファイルは`snapshot_local`と`snapshot_s3_plain`から`snapshot_local2`ディスクに移動されます。
## Configuring logs cache {#configuring-logs-cache}

ディスクから読み取るデータの量を最小限に抑えるために、Keeperはメモリにログエントリをキャッシュします。
リクエストが大きい場合、ログエントリは過度のメモリを消費するため、キャッシュされたログの量には上限が設定されます。
制限は以下の2つの設定で制御されます：
- `latest_logs_cache_size_threshold` - キャッシュに保存された最新のログの総サイズ
- `commit_logs_cache_size_threshold` - 次にコミットが必要な後続ログの総サイズ

デフォルト値が大きすぎる場合は、これら2つの設定を減少させることでメモリ使用量を削減できます。

:::note
`pfev`コマンドを使用して、各キャッシュからおよびファイルから読み取られたログの量を確認できます。
また、Prometheusエンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することができます。
:::
## Prometheus {#prometheus}

Keeperは、[Prometheus](https://prometheus.io)からのスクレイピング用のメトリクスデータを公開できます。

設定：

- `endpoint` - Prometheusサーバーによるメトリクスのスクレイピング用のHTTPエンドポイント。'/'から始まります。
- `port` - `endpoint`用のポート。
- `metrics` - [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開するフラグ。
- `events` - [system.events](/operations/system-tables/events)テーブルからメトリクスを公開するフラグ。
- `asynchronous_metrics` - [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開するフラグ。

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

チェック（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換える）：
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloudの[Prometheus統合](/integrations/prometheus)も参照してください。
## ClickHouse Keeper User Guide {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeperを構成するためのシンプルで最小限の設定を提供し、分散操作をテストする方法の例を示します。この例では、Linux上の3つのノードを使用します。
### 1. Configure Nodes with Keeper settings {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト（`chnode1`、`chnode2`、`chnode3`）に3つのClickHouseインスタンスをインストールします。（ClickHouseをインストールする詳細については、[クイックスタート](/getting-started/install/install.mdx)を参照してください。）

2. 各ノードで、ネットワークインターフェイスを介した外部通信を許可するために、以下のエントリを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. すべてのサーバーに以下のClickHouse Keeper構成を追加し、各サーバーの`<server_id>`設定を更新します。`chnode1`では`1`、`chnode2`では`2`などです。
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

    上記で使用された基本設定は以下の通りです：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |Keeperのクライアントが使用するポート|9181（デフォルトは2181、Zookeeperと同じ）|
    |server_id| Raft構成で使用される各ClickHouse Keeperサーバーの識別子| 1|
    |coordination_settings| タイムアウトなどのパラメータのセクション| タイムアウト: 10000、ログレベル: trace|
    |server    |参加するサーバーの定義|各サーバーの定義リスト|
    |raft_configuration| Keeperクラスター内の各サーバーの設定| 各サーバーの設定|
    |id      |keeperサービス用のサーバーの数値ID|1|
    |hostname   |Keeperクラスター内の各サーバーのホスト名、IPまたはFQDN|`chnode1.domain.com`|
    |port|インターバルKeeper接続のためにリッスンするポート|9234|

4.  Zookeeperコンポーネントを有効にします。これはClickHouse Keeperエンジンを使用します：
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

    上記で使用された基本設定は以下の通りです：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper接続用のノードのリスト|各サーバーの設定項目|
    |host|各ClickHouse Keeperノードのホスト名、IPまたはFQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeperクライアントポート| 9181|

5. ClickHouseを再起動し、各Keeperインスタンスが実行されていることを確認します。各サーバーで以下のコマンドを実行します。`ruok`コマンドは、Keeperが実行中で正常であれば`imok`を返します：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system`データベースには、ClickHouse Keeperインスタンスの詳細を含む`zookeeper`というテーブルがあります。テーブルを表示してみましょう：
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```

    テーブルは以下のようになります：
    ```response
    ┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
    │ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
    │ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
    │ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
    └────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
    ```
### 2. ClickHouseでクラスターを構成する {#2--configure-a-cluster-in-clickhouse}

1. 2つのシャードと2つのノードに1つのレプリカのみを持つシンプルなクラスターを構成します。第三のノードは、ClickHouse Keeperの要件を満たすためにクォーラムを達成するために使用されます。 `chnode1`と`chnode2`で設定を更新します。以下のクラスターは、各ノードに1つのシャードを定義しており、合計で2つのシャードがあり、レプリケーションはありません。この例では、データの一部は1つのノードに、残りは別のノードに配置されます：
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

    |パラメータ |説明                         |例                     |
    |----------|------------------------------|---------------------|
    |shard   |クラスター定義におけるレプリカのリスト|各シャードのレプリカのリスト|
    |replica|各レプリカの設定のリスト        |各レプリカの設定項目|
    |host|レプリカシャードをホストするサーバーのホスト名、IPまたはFQDN|`chnode1.domain.com`|
    |port|ネイティブTCPプロトコルを使用して通信するために使用されるポート|9000|
    |user|クラスターインスタンスへの認証に使用されるユーザー名|default|
    |password|クラスターインスタンスへの接続を許可するために定義されたユーザーのパスワード|`ClickHouse123!`|

2. ClickHouseを再起動し、クラスターが作成されたことを確認します：
    ```bash
    SHOW clusters;
    ```

    クラスターが表示されるはずです：
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```
### 3. 分散テーブルを作成しテストする {#3-create-and-test-distributed-table}

1. `chnode1`でClickHouseクライアントを使用して、新しいクラスターに新しいデータベースを作成します。 `ON CLUSTER`句は自動的に両方のノードにデータベースを作成します。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1`データベースに新しいテーブルを作成します。再度、 `ON CLUSTER`は両方のノードにテーブルを作成します。
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1`ノードでいくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2`ノードでいくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで`SELECT`文を実行すると、そのノードにのみデータが表示されることに注意してください。例えば、`chnode1`で：
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

    2 行のセットです。経過時間: 0.006 秒。
    ```

    `chnode2`で：
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

6. `Distributed`テーブルを作成して、2つのシャード上のデータを表現できます。 `Distributed`テーブルエンジンを使用したテーブルは独自のデータを格納することはありませんが、複数のサーバーでの分散クエリ処理を許可します。読み取りはすべてのシャードにヒットし、書き込みはシャード間で分散されることができます。 `chnode1`で以下のクエリを実行します：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table`をクエリすると、2つのシャードからの4つの行のすべてのデータが返されることに気付くでしょう：
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

    4 行のセットです。経過時間: 0.018 秒。
    ```
### まとめ {#summary}

このガイドでは、ClickHouse Keeperを使用してクラスターをセットアップする方法を説明しました。ClickHouse Keeperを使用すると、クラスターを構成し、シャード全体でレプリケート可能な分散テーブルを定義できます。
## 一意のパスでClickHouse Keeperを構成する {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### 説明 {#description}

この記事では、組み込みの `{uuid}` マクロ設定を使用して、ClickHouse KeeperまたはZooKeeperで一意なエントリを作成する方法について説明します。一意のパスは、テーブルを頻繁に作成および削除する場合に役立ちます。これは、パスが作成されるたびに新しい `uuid` がそのパスに使用されるため、クリーンアップのためにKeeperのガーベジコレクションを待たなければならない時間を回避します; パスが再利用されることはありません。
### 環境の例 {#example-environment}
この構成では、すべてのノードにClickHouse Keeperが構成された3ノードクラスターを作成し、2つのノードにClickHouseがあります。これにより、ClickHouse Keeperは3つのノード（タイブレーカーノードを含む）を持ち、2つのレプリカからなる単一のClickHouseシャードを提供します。

|ノード|説明|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeperタイブレーカーノード|

クラスターのための例の設定：
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
### `{uuid}`を使用するためのテーブル設定手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを構成
   サーバー1の例：
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
`shard` と `replica` のマクロを定義しましたが、 `{uuid}` はここでは定義されていません。それは組み込みのもので、特に定義する必要はありません。
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

3. マクロと `{uuid}` を使用してクラスタ上にテーブルを作成

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

4.  分散テーブルを作成

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
1. 最初のノード（例：`chnode1`）にデータを挿入
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

1 行のセットです。経過時間: 0.033 秒。
```

2. 二番目のノード（例：`chnode2`）にデータを挿入
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

1 行のセットです。経過時間: 0.529 秒。
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

2 行のセットです。経過時間: 0.007 秒。
```
### 代替 {#alternatives}
デフォルトのレプリケーションパスは、事前にマクロを定義し、 `{uuid}` を使用することによって定義できます。

1. 各ノードでテーブルのデフォルトを設定
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
各ノードに対して `{database}` マクロを定義することもできます。ノードが特定のデータベースに使用される場合。
:::

2. 明示的なパラメータを指定せずにテーブルを作成する：
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

2 行のセットです。経過時間: 1.175 秒。
```

3. デフォルト構成で使用されている設定を確認する
```sql
SHOW CREATE TABLE db_uuid.uuid_table1;
```

```response
SHOW CREATE TABLE db_uuid.uuid_table1

CREATE TABLE db_uuid.uuid_table1
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/db_uuid/{uuid}', '{replica}')
ORDER BY id

1 行のセットです。経過時間: 0.003 秒。
```
### トラブルシューティング {#troubleshooting}

テーブル情報とUUIDを取得する例のコマンド：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDを持つZooKeeper内のテーブルに関する情報を取得する例のコマンド
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは `Atomic`でなければなりません。以前のバージョンからのアップグレードの場合、 `default`データベースはおそらく `Ordinary`タイプです。
:::

確認するには次のようにします：

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

1 行のセットです。経過時間: 0.004 秒。
```
## ClickHouse Keeperの動的再構成 {#reconfiguration}

<SelfManaged />
### 説明 {#description-1}

ClickHouse Keeperは、 `keeper_server.enable_reconfiguration`がオンになっている場合、動的クラスター再構成のためにZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)コマンドを部分的にサポートします。

:::note
この設定がオフになっている場合、レプリカの `raft_configuration` セクションを手動で変更することにより、クラスターを再構成できます。変更を適用するのはリーダーのみであるため、すべてのレプリカでファイルを編集する必要があります。代わりに、ZooKeeper互換のクライアントを通じて`reconfig`クエリを送信できます。
:::

仮想ノード`/keeper/config`は、次の形式で最後にコミットされたクラスターの構成を含みます：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリは、改行で区切られています。
- `server_type`は `participant`または `learner`です（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)はリーダー選挙に参加しません）。
- `server_priority`は、[どのノードがリーダー選挙で優先されるべきか](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)を示す非負の整数です。
  優先度0は、サーバーがリーダーになることはないことを意味します。

例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

新しいサーバーを追加したり、既存のサーバーを削除したり、既存のサーバーの優先度を変更するために`reconfig`コマンドを使用できます。以下は例です（`clickhouse-keeper-client` を使用）：

```bash

# 2つの新しいサーバーを追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# 他の2つのサーバーを削除
reconfig remove "3,4"

# 既存のサーバー優先度を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

以下は`kazoo`の例です：

```python

# 2つの新しいサーバーを追加し、他の2つのサーバーを削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# 既存のサーバー優先度を8に変更
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`内のサーバーは、上記で説明されたサーバーフォーマットである必要があります。サーバーエントリはカンマで区切る必要があります。
新しいサーバーを追加する場合、`server_priority`（デフォルト値は1）および`server_type`（デフォルト値は`participant`）を省略することができます。

既存のサーバーの優先順位を変更する場合、ターゲット優先順位を用意する `joining`に追加します。
サーバーのホスト、ポート、タイプは、既存のサーバー設定と同じである必要があります。

サーバーは `joining`および`leaving`に表示される順序で追加および削除されます。
`joining`からのすべての更新は、`leaving`からの更新の前に処理されます。

Keeperの再構成実装にはいくつかの注意点があります：

- インクリメンタル再構成のみがサポートされています。 `new_members`が空でないリクエストは拒否されます。

  ClickHouse Keeperの実装は、NuRaft APIに依存して、動的にメンバーシップを変更します。 NuRaftには、1回に1つのサーバーを追加したり、削除したりする方法があります。したがって、構成の各変更（`joining`の各部分、`leaving`の各部分）は別々に決定する必要があります。したがって、大量の再構成は、エンドユーザーには誤解を招く可能性があるため、利用できません。

  サーバーのタイプ（参加者/学習者）を変更することもできません。これはNuRaftによってサポートされていないため、サーバーを削除して追加する必要があるため、これも誤解を招くことになります。

- 戻り値の `znodestat`を使用することはできません。
- `from_version` フィールドは使用されていません。 `from_version`を設定したすべてのリクエストは拒否されます。
  これは、`/keeper/config`が仮想ノードであるため、永続ストレージには保存されず、各リクエストに対して指定されたノード設定をオンザフライで生成されるためです。
  この判断はNuRaftがすでにこの構成を保存しているため、データの重複を避けるために行われました。
- ZooKeeperとは異なり、`sync`コマンドを送信することによってクラスターの再構成を待つ方法はありません。
  新しい構成は _最終的に_ 適用されますが、時間的保証はありません。
- `reconfig`コマンドはさまざまな理由で失敗する可能性があります。クラスターの状態を確認し、更新が適用されたかどうかを確認できます。
## シングルノードKeeperをクラスターに変換する {#converting-a-single-node-keeper-into-a-cluster}

時には、実験的なKeeperノードをクラスターに拡張する必要があります。以下は、3ノードクラスターのための手順の図です：

- **重要**: 新しいノードは、現在のクォーラムより少ないバッチで追加する必要があります。そうしないと、それらの間でリーダーが選出されます。この例では1つずつ追加します。
- 既存のKeeperノードは、`keeper_server.enable_reconfiguration`構成パラメータがオンになっている必要があります。
- Keeperクラスターの完全な新しい構成を使用して2番目のノードを起動します。
- 起動後、最初のノードに新しいノードを追加します（ [`reconfig`](#reconfiguration)を使用）。
- 次に、3番目のノードを起動し、[`reconfig`](#reconfiguration)を使用して追加します。
- 新しいKeeperノードを追加して、`clickhouse-server`の設定を更新し、変更を適用するために再起動します。
- 最初のノードのraft設定を更新し、オプションで再起動します。

このプロセスに慣れるために、こちらの[サンドボックスリポジトリ](https://github.com/ClickHouse/keeper-extend-cluster)を参照してください。
## サポートされていない機能 {#unsupported-features}

ClickHouse KeeperはZooKeeperと完全に互換性を持つことを目指していますが、現在実装されていない機能がいくつかあります（開発は進行中です）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は `Stat`オブジェクトを返すことをサポートしていません。
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)をサポートしていません。
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) は [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) ウォッチで機能しません。
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) と [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) はサポートされていません。
- `setWatches`はサポートされていません。
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) タイプのznodesを作成することはサポートされていません。
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) はサポートされていません。
