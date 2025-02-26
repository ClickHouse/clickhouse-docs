---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: ClickHouse Keeperの設定
sidebar_position: 10
keywords:
  - Keeper
  - ZooKeeper
  - clickhouse-keeper
  - レプリケーション
description: ClickHouse Keeperまたはclickhouse-keeperは、ZooKeeperに代わってレプリケーションとコーディネーションを提供します。
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeperは、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)や[分散DDL](/sql-reference/distributed-ddl.md)クエリの実行のためのコーディネーションシステムを提供します。ClickHouse KeeperはZooKeeperと互換性があります。

### 実装の詳細 {#implementation-details}

ZooKeeperは、最初の有名なオープンソースコーディネーションシステムの1つです。Javaで実装されており、非常にシンプルで強力なデータモデルを持っています。ZooKeeperのコーディネーションアルゴリズムであるZooKeeper Atomic Broadcast (ZAB)は、各ZooKeeperノードがローカルにリードを提供するため、リードに対して線形性の保証を提供しません。一方、ClickHouse KeeperはC++で書かれており、[RAFTアルゴリズム](https://raft.github.io/) [の実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは、リードとライトに対して線形性を提供し、さまざまな言語でいくつかのオープンソース実装があります。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：線形性のあるライトと非線形性のあるリード。互換性のあるクライアントサーバープロトコルがあるため、任意の標準ZooKeeperクライアントを使用してClickHouse Keeperと対話できます。スナップショットとログはZooKeeperと互換性のないフォーマットですが、`clickhouse-keeper-converter`ツールを使用すると、ZooKeeperのデータをClickHouse Keeperのスナップショットに変換できます。ClickHouse KeeperのインタサーバープロトコルもZooKeeperと互換性がないため、混合ZooKeeper / ClickHouse Keeperクラスターは不可能です。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同様にアクセス制御リスト（ACL）をサポートしています。ClickHouse Keeperは、同じ権限セットをサポートしており、同一の組み込みスキームを持っています：`world`、`auth`、および`digest`。ダイジェスト認証スキームは、`username:password`のペアを使用し、パスワードはBase64でエンコードされます。

:::note
外部統合はサポートされていません。
:::

### 設定 {#configuration}

ClickHouse Keeperは、ZooKeeperのスタンドアロンの代替として、またはClickHouseサーバーの内部部分として使用できます。どちらの場合も、設定はほぼ同じ`.xml`ファイルです。 

#### Keeper設定項目 {#keeper-configuration-settings}

主要なClickHouse Keeper設定タグは`<keeper_server>`で、次のパラメータを持ちます：

| パラメータ                            | 説明                                                                                                                                                                                                                                         | デフォルト                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | クライアントとkeeper-serverの間でSSL接続のためのセキュアポート。                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | ユニークなサーバーID。ClickHouse Keeperクラスターの各参加者はユニークな番号（1, 2, 3, etc.）を持たなければなりません。                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                   | コーディネーションログのパス。ZooKeeperと同様、ログは非活発なノードに保存するのがベストです。                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | コーディネーションスナップショットのパス。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration)による動的クラスター再構成を有効にする。                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeperの最大メモリ使用のソフトリミット（バイト単位）。                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit`が設定されていないか、ゼロに設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit`が設定されていないか、`0`に設定されている場合、物理メモリの量を監視するための間隔です。メモリ量が変化すると、`max_memory_usage_soft_limit_ratio`によってKeeperのメモリのソフトリミットを再計算します。 | `15`                                                                                                         |
| `http_control`                       | [HTTP制御](#http-control)インターフェースの設定。                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | リアルタイムのデータ整合性チェックを有効にする。                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | シャットダウン時にスナップショットを作成する。                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定用のホスト名の健全性チェックを有効にする（例：ローカルホストがリモートエンドポイントと共に使用される場合）。                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lwコマンドのホワイトリスト。                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |


その他の共通パラメータは、ClickHouseサーバー設定から継承されています（`listen_host`、`logger`など）。

#### 内部コーディネーション設定 {#internal-coordination-settings}

内部コーディネーション設定は`<keeper_server>.<coordination_settings>`セクションにあり、次のパラメータを持ちます：

| パラメータ                          | 説明                                                                                                                                                                                                              | デフォルト                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一クライアント操作のタイムアウト（ms）                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト（ms）                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト（ms）                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeperが死んだセッションをチェックして削除する頻度（ms）                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeperリーダーがフォロワーにハートビートを送信する頻度（ms）                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーがリーダーからこの間隔でハートビートを受信しない場合、リーダー選挙を開始できます。この値は`election_timeout_upper_bound_ms`より小さいか等しい必要があります。理想的には同じであってはいけません。| `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーがリーダーからこの間隔でハートビートを受信しない場合、リーダー選挙を開始しなければなりません。                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 1つのファイルに保存するログ記録の数。                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | コンパクション前に保存するコーディネーションログの記録数。                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeperが新しいスナップショットを作成する頻度（ログ内の記録数で）。                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショットの数。                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーを古いと見なす閾値。不完全なログの代わりにスナップショットを送ります。                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | ノードが新しいと見なされるリミット。                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFTに送信される前にバッチ内のリクエストの最大サイズ。                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                       | コーディネーションログへの各書き込みで`fsync`を呼び出す。                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | 同様の速度で全体のRAFT合意を通じて読み取りリクエストをライトとして実行します。                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                  | コーディネーションに関するテキストログレベル（trace、debugなど）。                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストの転送を許可します。                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続を終了させ、シャットダウンを待つ（ms）。                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | サーバーが指定されたタイムアウト内で他のクオーラム参加者に接続できない場合、サーバーは終了します（ms）。                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。すべての書き込みおよび読み取りの保証は保持されながら、パフォーマンスが向上します。設定は、後方互換性を壊さないためにデフォルトで無効化されています。                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新のログエントリのメモリ内キャッシュの最大合計サイズ。                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットに必要なログエントリのメモリ内キャッシュの最大合計サイズ。                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | ファイルがディスク間で移動している際に失敗した場合、再試行の間に待つ時間。                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にファイルがディスク間で移動している際に失敗した場合の再試行の回数。                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`         | rocksdbをバックエンドストレージとして使用。                                                                                                    | `0`                                                                                                        |

クオーラムの設定は`<keeper_server>.<raft_configuration>`セクションにあり、サーバーの説明を含んでいます。

クオーラム全体の唯一のパラメータは`secure`で、クオラム参加者間の通信のための暗号化接続を有効にします。このパラメータは、内部通信にSSL接続が必要な場合は`true`に、そうでない場合は指定しないでおきます。

各`<server>`の主要なパラメータは：

- `id` — クオーラム内のサーバー識別子。
- `hostname` — このサーバーが配置されているホスト名。
- `port` — このサーバーが接続を待機するポート。
- `can_become_leader` — サーバーを`learner`として設定するために`false`に設定します。省略された場合、値は`true`です。

:::note
ClickHouse Keeperクラスターのトポロジーの変更（例：サーバーの置換）の場合は、`server_id`と`hostname`のマッピングを一貫して保ち、異なるサーバーに対して既存の`server_id`をシャッフルしたり再利用したりしないようにしてください（自動化スクリプトに依存してClickHouse Keeperをデプロイする場合などに発生する可能性があります）。

Keeperインスタンスのホストが変更できる場合は、生のIPアドレスの代わりにホスト名を定義して使用することをお勧めします。ホスト名の変更は、サーバーを削除して再追加するのに等しく、一部のケースでは不可能なことがあります（例：クオラムのためのKeeperインスタンスが不足している場合）。
:::

:::note
`async_replication`は後方互換性を壊さないためにデフォルトで無効化されています。すべてのKeeperインスタンスが`async_replication`をサポートするバージョン（v23.9+）で実行されているクラスターがある場合は、有効にすることをお勧めします。パフォーマンスが向上し、悪影響はありません。
:::


3ノードのクオーラムの設定例は、[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)の`test_keeper_`プレフィックスの下にあります。サーバー#1の設定例：

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

ClickHouse KeeperはClickHouseサーバーパッケージにバンドルされており、`<keeper_server>`の設定を`/etc/your_path_to_config/clickhouse-server/config.xml`に追加し、ClickHouseサーバーを通常通り起動します。スタンドアロンのClickHouse Keeperを実行する場合は、次のように起動できます：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は、作成するか、`clickhouse`に対して`keeper`を引数として指定できます：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 4文字コマンド {#four-letter-word-commands}

ClickHouse Keeperは、ほぼZooKeeperと同じ4lwコマンドも提供しています。各コマンドは`mntr`、`stat`などの4文字で構成されています。いくつかの興味深いコマンドがあります：`stat`はサーバーと接続されたクライアントに関する一般情報を提供し、`srvr`と`cons`はそれぞれサーバーと接続に関する詳細情報を提供します。

4lwコマンドにはホワイトリスト設定`four_letter_word_white_list`があり、デフォルト値は`conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`です。

コマンドはtelnetやncを介してClickHouse Keeperに発行できます。クライアントポートで実行します。

```bash
echo mntr | nc localhost 9181
```

以下は詳細な4lwコマンドです：

- `ruok`: サーバーがエラーステートで実行されているかどうかをテストします。サーバーが実行中であれば`imok`と応答します。そうでなければ全く応答しません。`imok`の応答は、サーバーがクオラムに参加していることを示すものではなく、サーバープロセスがアクティブであり、指定されたクライアントポートにバインドされていることを示します。クオラムとクライアント接続情報に関する状態の詳細については`stat`を使用してください。

```response
imok
```

- `mntr`: クラスターのヘルス監視に使用できる変数のリストを出力します。

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

- `stat`: サーバーと接続されたクライアントに関する簡単な詳細をリストします。

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

- `srst`: サーバーの統計をリセットします。このコマンドは`srvr`、`mntr`、および`stat`の結果に影響します。

```response
Server stats reset.
```

- `conf`: サーバー設定の詳細を表示します。

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

- `cons`: このサーバーに接続されているすべてのクライアントの接続/セッションの詳細をリストします。受信/送信されたパケットの数、セッションID、操作の待ち時間、最近行われた操作などの情報が含まれます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: すべての接続の接続/セッション統計をリセットします。

```response
Connection stats reset.
```

- `envi`: サーバー環境の詳細を表示します。

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

- `dirs`: スナップショットとログファイルの総サイズをバイト単位で表示します。

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`: サーバーが読み取り専用モードで実行されているかどうかをテストします。サーバーが読み取り専用モードの場合は`ro`、そうでない場合は`rw`と応答します。

```response
rw
```

- `wchs`: サーバーの監視に関する簡単な情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: セッションごとにサーバーの監視の詳細な情報をリストします。これにより、関連する監視（パス）を持つセッション（接続）のリストが出力されます。なお、監視の数によっては、この操作が高コストになる可能性があるため（サーバーのパフォーマンスに影響を与える）、慎重に使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: パスごとにサーバーの監視の詳細な情報をリストします。これにより、関連するセッションを持つパス（zノード）のリストが出力されます。なお、監視の数によっては、この操作が高コストになる可能性があるため（サーバーのパフォーマンスに影響を与える）、慎重に使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: 未解決のセッションとエフェメラルノードのリストを表示します。これはリーダーでのみ機能します。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: スナップショット作成タスクをスケジュールします。成功した場合はスケジュールされたスナップショットの最後のコミットされたログインデックスを返し、失敗した場合は`Failed to schedule snapshot creation task.`と表示されます。スナップショットが完了したかどうかを確認するには、`lgif`コマンドを使用することができます。

```response
100
```

- `lgif`: Keeperログ情報。`first_log_idx`: ログストアにおける私の最初のログインデックス。`first_log_term`: 私の最初のログターム。`last_log_idx`: ログストアにおける私の最後のログインデックス。`last_log_term`: 私の最後のログターム。`last_committed_log_idx`: ステートマシンにおける私の最後のコミットされたログインデックス。`leader_committed_log_idx`: 私の視点から見たリーダーのコミットされたログインデックス。`target_committed_log_idx`: コミットするべきターゲットログインデックス。`last_snapshot_idx`: 最後のスナップショットにおける最大コミットされたログインデックス。

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

- `rqld`: 新しいリーダーになるリクエストを送信します。リクエストが送信された場合は `Sent leadership request to leader.` を返し、送信されなかった場合は `Failed to send leadership request to leader.` を返します。ノードが既にリーダーの場合は、リクエストが送信されたと見なされ、結果は同じです。

```response
Sent leadership request to leader.
```

- `ftfl`: すべての機能フラグと、Keeperインスタンスでそれらが有効かどうかのリストを表示します。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: リーダーシップを譲り、フォロワーになるリクエストを送信します。リクエストを受信したサーバーがリーダーである場合は、まず書き込み操作を一時停止し、後続者（現在のリーダーは後続者になれません）が最新のログのキャッチアップを終えるのを待ってから辞任します。後続者は自動的に選ばれます。リクエストが送信された場合は `Sent yield leadership request to leader.` を返し、送信されなかった場合は `Failed to send yield leadership request to leader.` を返します。ノードがすでにフォロワーの場合は、リクエストが送信されたと見なされ、結果は同じです。

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

ClickHouse Keeperは、レプリカがトラフィックを受け取る準備ができているかどうかを確認するためのHTTPインターフェースを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)のようなクラウド環境で使用できます。

`/ready` エンドポイントを有効にする構成の例:

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

KeeperはZooKeeperおよびそのクライアントと完全に互換性がありますが、ClickHouseクライアントによって使用できるいくつかの独自の機能とリクエストタイプも導入しています。  
これらの機能は後方互換性のない変更を導入する可能性があるため、デフォルトではほとんどが無効になっており、`keeper_server.feature_flags`構成を使用して有効にできます。  
すべての機能は明示的に無効にすることができます。  
Keeperクラスターの新しい機能を有効にする場合は、最初にクラスター内のすべてのKeeperインスタンスをその機能をサポートしているバージョンに更新し、その後に機能を有効にすることをお勧めします。

`multi_read` を無効にし、`check_not_exists` を有効にする機能フラグ構成の例:

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

以下の機能が利用可能です：

`multi_read` - マルチリクエストの読み取りをサポートします。デフォルト: `1`  
`filtered_list` - ノードのタイプ（エフェメラルまたはパーシステント）で結果をフィルタリングするリストリクエストをサポートします。デフォルト: `1`  
`check_not_exists` - ノードが存在しないことを確認する `CheckNotExists` リクエストをサポートします。デフォルト: `0`  
`create_if_not_exists` - ノードが存在しない場合にノードを作成しようとする `CreateIfNotExists` リクエストをサポートします。存在する場合、変更は適用されず、`ZOK` が返されます。デフォルト: `0`

### ZooKeeperからの移行 {#migration-from-zookeeper}

ZooKeeperからClickHouse Keeperへのシームレスな移行は不可能です。ZooKeeperクラスターを停止し、データを変換し、ClickHouse Keeperを起動する必要があります。`clickhouse-keeper-converter`ツールは、ZooKeeperのログとスナップショットをClickHouse Keeperのスナップショットに変換することができます。これはZooKeeper > 3.4でのみ機能します。移行手順:

1. すべてのZooKeeperノードを停止します。

2. オプションですが推奨: ZooKeeperのリーダーノードを見つけて起動し、再度停止します。これにより、ZooKeeperは一貫したスナップショットを作成します。

3. リーダーで `clickhouse-keeper-converter` を実行します。例：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを、`keeper`が構成されたClickHouseサーバーノードにコピーするか、ZooKeeperの代わりにClickHouse Keeperを起動します。スナップショットはすべてのノードで持続する必要があります。そうしないと、空のノードがより早くなり、その1つがリーダーになる可能性があります。

:::note
`keeper-converter`ツールは、Keeperスタンドアロンバイナリからは利用できません。  
ClickHouseがインストールされている場合は、バイナリを直接使用できます：

```bash
clickhouse keeper-converter ...
```

そうでない場合は、[バイナリをダウンロード](/getting-started/quick-start#1-download-the-binary)して、ClickHouseをインストールせずに上記のようにツールを実行できます。
:::

### 過半数喪失後の回復 {#recovering-after-losing-quorum}

ClickHouse KeeperはRaftを使用しているため、クラスターのサイズに応じて特定の数のノード障害に耐えることができます。\
例えば、3ノードクラスターの場合は、1ノードが障害を起こすだけでうまく動作し続けることができます。

クラスターの構成は動的に設定できますが、一部の制限があります。再構成はRaftに依存しているため、クラスターからノードを追加/削除するには過半数が必要です。クラスター内のノードを同時に多く失うと、もう一度起動する可能性がないとRaftは動作を停止し、従来の方法でクラスターを再構成することを許可しません。

しかしながら、ClickHouse Keeperは、1ノードだけでクラスターを強制的に再構成することを許可する回復モードを持っています。これは、ノードを再起動できない場合や、新しいインスタンスを同じエンドポイントで開始する必要がある場合にのみ最終手段として行うべきです。

続行する前に重要となる点:
- 障害の発生したノードが再びクラスターに接続できないことを確認してください。
- 指定されたステップまで新しいノードを起動しないでください。

上記のことが真であることを確認した後、次のことを行う必要があります：
1. あなたの新しいリーダーとなるKeeperノードを1つ選択します。そのノードのデータが全体のクラスターに使用されるため、最新の状態のノードを使用することをお勧めします。
2. それ以外の操作を行う前に、選ばれたノードの `log_storage_path` と `snapshot_storage_path` フォルダーをバックアップします。
3. 使用したいすべてのノードでクラスターを再構成します。
4. 選んだノードに `rcvr` の4文字コマンドを送信して、そのノードを回復モードに移行させるか、選んだノードでKeeperインスタンスを停止し、`--force-recovery` 引数で再起動します。
5. 新しいノードでKeeperインスタンスを1つずつ起動し、次のノードを起動する前に `mntr` が `follower` を `zk_server_state` に返すことを確認します。
6. 回復モード中は、リーダーノードは新しいノードと過半数を達成するまで `mntr` コマンドにエラーメッセージを返し、クライアントとフォロワーからのリクエストを拒否します。
7. 過半数が達成された後、リーダーノードは通常の操作モードに戻り、`mntr` を使ったRaft検証で、`zk_server_state` に対して `leader` を返すすべてのリクエストを受け入れます。

## Keeperとのディスクの使用 {#using-disks-with-keeper}

Keeperはスナップショット、ログファイル、状態ファイルの保存のために[外部ディスク](/operations/storing-data.md)のサブセットをサポートしています。

サポートされているディスクのタイプは：
- s3_plain
- s3
- local

次は構成内に存在するディスク定義の例です。

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

ログ用のディスクを使用するには、`keeper_server.log_storage_disk`構成をディスクの名前に設定する必要があります。  
スナップショット用のディスクを使用するには、`keeper_server.snapshot_storage_disk`構成をディスクの名前に設定する必要があります。  
さらに、最新のログやスナップショットに異なるディスクを使用することも、`keeper_server.latest_log_storage_disk`および `keeper_server.latest_snapshot_storage_disk`を使用して可能です。  
その場合、Keeperは新しいログやスナップショットが作成されると自動的に正しいディスクにファイルを移動します。
状態ファイル用のディスクを使用するには、`keeper_server.state_storage_disk`構成をディスクの名前に設定する必要があります。  

ディスク間でのファイル移動は安全であり、Keeperが転送の途中で停止してもデータが失われるリスクはありません。  
ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されません。

`keeper_server.coordination_settings.force_sync` が `true` に設定されたKeeper（デフォルトで `true`）はいくつかの保証をすべてのタイプのディスクで満たすことができません。  
現在、`local` タイプのディスクのみが持続的な同期をサポートしています。  
`force_sync` が使用される場合、`log_storage_disk` は `latest_log_storage_disk` が使用されていない限り `local` ディスクである必要があります。  
`latest_log_storage_disk` が使用される場合は、常に `local` ディスクであるべきです。  
`force_sync` が無効の場合、すべてのタイプのディスクを任意の設定で使用できます。

Keeperインスタンスの考えられるストレージ設定は次のようになります：

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

このインスタンスは、最新のログを `log_local`ディスクに置きつつ、`log_s3_plain`ディスクに最新ではないすべてのログを保存します。  
スナップショットの場合も同様のロジックが適用され、最新ではないすべてのスナップショットが `snapshot_s3_plain` に保存され、最新のスナップショットは `snapshot_local`ディスクに保存されます。

### ディスク設定の変更 {#changing-disk-setup}

:::important
新しいディスク設定を適用する前に、手動でKeeperのログとスナップショットをバックアップしてください。
:::

階層的なディスク設定が定義されている場合（最新のファイルに別々のディスクを使用）、Keeperは起動時に自動的にファイルを正しいディスクに移動しようとします。  
以前と同じ保証が適用されます。ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されませんので、複数回の再起動は安全に行えます。

完全に新しいディスクにファイルを移動する必要がある場合（または2種類のディスクから単一ディスクへの移動）、`keeper_server.old_snapshot_storage_disk`および`keeper_server.old_log_storage_disk`の複数の定義を使用できます。

次の構成は、以前の2ディスク設定から完全に新しい単一ディスク設定への移行を示します:

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

ディスクから読み込むデータの量を最小限に抑えるために、Keeperはメモリ内にログエントリをキャッシュします。  
リクエストが大きい場合、ログエントリがメモリを占有しすぎるため、キャッシュされるログの量には上限があります。  
制限は次の2つの構成で制御されます：
- `latest_logs_cache_size_threshold` - キャッシュ内に保存される最新のログの総サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要がある後続のログの総サイズ

デフォルト値が大きすぎる場合は、これら2つの構成を減らすことでメモリ使用量を削減できます。

:::note
各キャッシュおよびファイルから読み込まれるログの量を確認するには、`pfev` コマンドを使用できます。  
Prometheusエンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。  
:::


## Prometheus {#prometheus}

Keeperは、[Prometheus](https://prometheus.io)からのメトリクスデータをスクリーピングするためにエクスポーズできます。

設定:

- `endpoint` – Prometheusサーバーによるメトリクスのスクリーピング用HTTPエンドポイント。‘/’で始まります。
- `port` – `endpoint`のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからのメトリクスを公開するフラグ。
- `events` – [system.events](/operations/system-tables/events) テーブルからのメトリクスを公開するフラグ。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルからの現在のメトリクス値を公開するフラグ。

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

確認 ( `127.0.0.1` を ClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください):
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloudの[Prometheus統合](/integrations/prometheus)もご覧ください。

## ClickHouse Keeper ユーザーガイド {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeperを構成するためのシンプルで最小限の設定を提供し、分散操作をテストする方法の例を示します。この例は、Linux上で3ノードを使用して実行されます。

### 1. Keeper設定でノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト(`chnode1`, `chnode2`, `chnode3`)にそれぞれ3つのClickHouseインスタンスをインストールします。（ClickHouseのインストールに関する詳細は[クイックスタート](/getting-started/install.md)を参照してください。）

2. 各ノードで、ネットワークインターフェースを通じて外部通信を許可するために、次のエントリを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 次のClickHouse Keeper構成を3台のサーバーすべてに追加し、各サーバーの `<server_id>` 設定を更新します。`chnode1` の場合は `1`、`chnode2` の場合は `2` などです。
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

    上記で使用されている基本設定は次の通りです：

    | パラメータ | 説明 | 例 |
    |----------|----------------|---------------------|
    | tcp_port | Keeperのクライアントが使用するポート | 9181（ZooKeeperでのデフォルト2181に相当） |
    | server_id | Raft構成で使用される各ClickHouse Keeperサーバーの識別子 | 1 |
    | coordination_settings | タイムアウトなどのパラメータセクション | タイムアウト: 10000、ログレベル: trace |
    | server | 参加するサーバーの定義 | 各サーバーのリスト定義 |
    | raft_configuration | Keeperクラスター内の各サーバーの設定 | 各サーバーの設定 |
    | id | Keeperサービス用のサーバーの数値ID | 1 |
    | hostname | Keeperクラスター内の各サーバーのホスト名、IPまたは完全修飾ドメイン名 | `chnode1.domain.com` |
    | port | サーバー間のKeeper接続をリッスンするポート | 9234 |

4. ZooKeeperコンポーネントを有効にします。これはClickHouse Keeperエンジンを使用します：
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

    上記で使用されている基本設定は次の通りです：

    | パラメータ | 説明 | 例 |
    |----------|----------------|---------------------|
    | node | ClickHouse Keeper接続用のノードのリスト | 各サーバーの設定エントリ |
    | host | 各ClickHouse Keeperノードのホスト名、IPまたは完全修飾ドメイン名 | `chnode1.domain.com` |
    | port | ClickHouse Keeperクライアントポート | 9181 |

5. ClickHouseを再起動し、各Keeperインスタンスが実行中であることを確認します。各サーバーで次のコマンドを実行します。`ruok`コマンドは、Keeperが実行中で正常である場合に `imok` を返します：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` データベースには、ClickHouse Keeperインスタンスの詳細を含む `zookeeper` という名前のテーブルがあります。テーブルを表示してみましょう：
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

### 2. ClickHouseでクラスターを構成する {#2--configure-a-cluster-in-clickhouse}

1. 2つのシャードと2ノードに1つのレプリカを持つシンプルなクラスターを構成します。3番目のノードは、ClickHouse Keeperでの必要な過半数を達成するために使用されます。`chnode1` と `chnode2` の構成を更新します。次のクラスターは、各ノードに1つのシャードを定義し、合計2つのシャードでレプリケーションなしとなります。この例では、データの一部があるノードにあり、他のノードにもあります：
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

    | パラメータ | 説明 | 例 |
    |----------|----------------|---------------------|
    | shard |クラスター定義内のレプリカのリスト | 各シャードに対するレプリカのリスト |
    | replica | 各レプリカのための設定のリスト | 各レプリカのための設定エントリ |
    | host | レプリカシャードをホストするサーバーのホスト名、IP、または完全修飾ドメイン名 | `chnode1.domain.com` |
    | port | ネイティブTCPプロトコルを使用して通信するために使用されるポート | 9000 |
    | user | クラスターインスタンスへの認証に使用されるユーザー名 | default |
    | password | クラスターインスタンスへの接続を許可するために定義されたユーザーのパスワード | `ClickHouse123!` |

2. ClickHouseを再起動し、クラスターが作成されたことを確認します：
    ```bash
    SHOW clusters;
    ```

    クラスターを確認できるはずです：
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```

### 3. 分散テーブルを作成してテストする {#3-create-and-test-distributed-table}

1. `chnode1`のClickHouseクライアントを使用して、新しいクラスター上に新しいデータベースを作成します。`ON CLUSTER`句を使用すると、このデータベースが両方のノードに自動的に作成されます。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1`データベースに新しいテーブルを作成します。再び、`ON CLUSTER` が両方のノードにテーブルを作成します。
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1`ノードで2つの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2`ノードで2つの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで `SELECT` ステートメントを実行すると、そのノード上のデータのみが表示されます。例えば、 `chnode1` で：
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

    `chnode2` では：
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

6. ディストリビューテッドテーブルを作成して、2つのシャードのデータを表現します。`Distributed` テーブルエンジンを持つテーブルは独自のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りはすべてのシャードにヒットし、書き込みはシャード間で分配されます。`chnode1`で次のクエリを実行します：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table` をクエリすると、2つのシャードからのデータが全4行返されます：
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

このガイドでは、ClickHouse Keeperを使用してクラスターを設定する方法を示しました。ClickHouse Keeperを使用すれば、クラスターを構成し、シャード間でレプリケートされる分散テーブルを定義することができます。


## ユニークなパスでClickHouse Keeperをコンフィギュレーションする {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 説明 {#description}

この記事では、組み込みの `{uuid}` マクロ設定を使用してClickHouse KeeperまたはZooKeeperにユニークなエントリを作成する方法について説明します。ユニークなパスは、テーブルを頻繁に作成および削除する際に役立つため、Keeperのガーベジコレクションがパスエントリを削除するのを待つ必要がなくなります。パスが作成されるたびに新しい `uuid` がそのパスに使用されるため、パスは再利用されません。

### 環境の例 {#example-environment}
ClickHouse Keeperをすべての3ノードに、ClickHouseを2つのノードに構成する3ノードクラスター。これにより、ClickHouse Keeperに3ノード（タイブレーカーノードを含む）が提供され、2つのレプリカから成る単一のClickHouseシャードが形成されます。

|ノード|説明|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeperタイブレーカーノード|

クラスターの例構成：
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

### テーブルを `{uuid}` を使用して設定する手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定します。サーバー1の例：
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
`shard` および `replica` のマクロを定義していることに注目してくださいが、`{uuid}` はここでは定義されておらず、組み込みであり、定義する必要はありません。
:::

2. データベースを作成します。

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

3. マクロと `{uuid}` を使用してクラスター上にテーブルを作成します。

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
```
4. 分散テーブルの作成

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
1. 最初のノード (例: `chnode1`) にデータを挿入
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

2. 二番目のノード (例: `chnode2`) にデータを挿入
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

### 代替手段 {#alternatives}
デフォルトのレプリケーションパスは、マクロを使用し、事前に定義することができ、`{uuid}` を使うこともできます。

1. 各ノードのテーブルのデフォルトを設定
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
ノードが特定のデータベースに使用される場合、各ノードにマクロ `{database}` を定義することもできます。
:::

2. 明示的なパラメータなしでテーブルを作成:
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

3. デフォルト設定で使用された設定を確認
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

テーブル情報とUUIDを取得する例のコマンド:
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDを持つZooKeeper内のテーブル情報を取得する例のコマンド
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは `Atomic` である必要があります。以前のバージョンからアップグレードする場合、`default` データベースは `Ordinary` 型である可能性があります。
:::

確認するには:

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

## ClickHouse Keeperの動的再構成 {#reconfiguration}

<SelfManaged />

### 説明 {#description-1}

ClickHouse Keeperは、`keeper_server.enable_reconfiguration` がオンの場合、動的クラスター再構成のためにZooKeeperの [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) コマンドを部分的にサポートします。

:::note
この設定がオフになっている場合、レプリカの `raft_configuration` セクションを手動で変更することによってクラスターを再構成できます。ファイルをすべてのレプリカで編集することを確認してください。リーダーのみが変更を適用します。別の方法として、任意のZooKeeper互換クライアントを通じて `reconfig` クエリを送信することができます。
:::

仮想ノード `/keeper/config` には、次の形式で最新のコミットされたクラスター構成が含まれています:

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリーは改行で区切られています。
- `server_type` は `participant` または `learner` です（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) はリーダー選挙に参加しません）。
- `server_priority` は、[リーダー選挙で優先されるべきノード](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)を示す非負の整数です。優先度が0の場合、そのサーバーは決してリーダーにはなりません。

例:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

新しいサーバーを追加したり、既存のサーバーを削除したり、既存のサーバーの優先度を変更するために `reconfig` コマンドを使用できます。以下はその例です（`clickhouse-keeper-client`を使用）:

```bash
# 2つの新しいサーバーを追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# 他の2つのサーバーを削除
reconfig remove "3,4"
# 既存サーバーの優先度を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

以下は `kazoo` の例です:

```python
# 2つの新しいサーバーを追加し、他のサーバーを削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")

# 既存のサーバーの優先度を8に変更
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining` のサーバーは、上記で説明したサーバー形式である必要があります。サーバーエントリーはカンマで区切られなければなりません。新しいサーバーを追加する際、`server_priority`（デフォルト値は1）と `server_type`（デフォルト値は `participant`）を省略することができます。

既存のサーバーの優先度を変更したい場合は、ターゲット優先度を持つ `joining` に追加します。サーバーホスト、ポート、およびタイプは既存のサーバー構成と同じでなければなりません。

サーバーは `joining` および `leaving` の出現順に追加および削除されます。
`joining` からのすべての更新は、`leaving` からの更新の前に処理されます。

Keeperの再構成実装にはいくつかの注意点があります:

- インクリメンタルな再構成のみがサポートされています。空でない `new_members` を持つリクエストは拒否されます。

  ClickHouse Keeperの実装は、メンバーシップを動的に変更するためにNuRaft APIに依存しています。NuRaftは1つのサーバーを追加したり削除したりする方法を提供します。これは、構成への各変更（`joining` の各部分、`leaving` の各部分）を個別に決定する必要があることを意味します。したがって、エンドユーザーにとって誤解を招く可能性のあるバルク再構成はありません。

  サーバータイプ（participant/learner）を変更することもできません。これはNuRaftによってサポートされていないため、削除して再追加する以外の方法はなく、これもまた誤解を招く可能性があります。

- 返された `znodestat` 値を使用することはできません。
- `from_version` フィールドは使用されません。`from_version` を設定したすべてのリクエストは拒否されます。これは、`/keeper/config` が仮想ノードであるため、永続ストレージに保存されるのではなく、各リクエストのために指定されたノード構成でその場で生成されるという事実によります。この決定は、NuRaftがすでにこの構成を保存しているため、データを重複させないようにするために行われました。
- ZooKeeperとは異なり、`sync` コマンドを提出することでクラスターの再構成を待機する方法はありません。新しい構成は _最終的に_ 適用されますが、時間の保証はありません。
- `reconfig` コマンドはさまざまな理由で失敗することがあります。クラスターの状態をチェックして、更新が適用されたかどうかを確認できます。

## 単一ノードのKeeperをクラスターに変換する {#converting-a-single-node-keeper-into-a-cluster}

時には、実験的なKeeperノードをクラスターに拡張する必要があります。3ノードのクラスターを段階的に行う方法を示すスキームは以下の通りです。

- **重要**: 新しいノードは現在の定足数よりも少ないバッチで追加しなければなりません。さもなければ、その中でリーダーを選出します。この例では一つずつ追加します。
- 既存のKeeperノードには `keeper_server.enable_reconfiguration` 設定パラメーターをオンにしておく必要があります。
- Keeperクラスターの完全な新構成で第二のノードを起動します。
- 起動後、ノード1にそれを [`reconfig`](#reconfiguration) を使用して追加します。
- 次に、第三のノードを起動し、[`reconfig`](#reconfiguration) を使用して追加します。
- 新しいKeeperノードを追加して、`clickhouse-server` の設定を更新し、変更を適用するために再起動します。
- ノード1のRaft設定を更新し、必要に応じて再起動します。

このプロセスに自信を持つために、こちらの [サンドボックスリポジトリ](https://github.com/ClickHouse/keeper-extend-cluster) を参照してください。

## サポートされていない機能 {#unsupported-features}

ClickHouse KeeperはZooKeeperと完全に互換性があることを目指していますが、現在実装されていない機能がいくつかあります（開発は進行中です）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は `Stat` オブジェクトの返却をサポートしていません
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL) をサポートしていません
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) は [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) ウォッチに対しては機能しません
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) および [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) はサポートされていません
- `setWatches` はサポートされていません
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) タイプのznodesの作成はサポートされていません
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) はサポートされていません
