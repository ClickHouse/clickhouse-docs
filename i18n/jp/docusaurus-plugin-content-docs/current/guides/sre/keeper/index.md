---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: ClickHouse Keeperの設定
sidebar_position: 10
keywords:
  - Keeper
  - ZooKeeper
  - clickhouse-keeper
  - レプリケーション
description: ClickHouse Keeper、またはclickhouse-keeperは、ZooKeeperを置き換え、レプリケーションとコーディネーションを提供します。
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeperは、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)と[分散DDL](/sql-reference/distributed-ddl.md)クエリの実行のためのコーディネーションシステムを提供します。ClickHouse KeeperはZooKeeperと互換性があります。
### 実装の詳細 {#implementation-details}

ZooKeeperは、最初の有名なオープンソースのコーディネーションシステムの一つです。Javaで実装されており、かなりシンプルで強力なデータモデルを持っています。ZooKeeperのコーディネーションアルゴリズム、ZooKeeper Atomic Broadcast (ZAB)は、各ZooKeeperノードがローカルでリードを処理するため、リードの線形性保証を提供しません。ZooKeeperとは異なり、ClickHouse KeeperはC++で書かれており、[RAFTアルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは、リードとライトの線形性を可能にし、さまざまな言語でのオープンソースの実装を持っています。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：線形性のあるライトと非線形性のあるリードです。互換性のあるクライアントサーバープロトコルを持っているので、標準的なZooKeeperクライアントを使用してClickHouse Keeperとやり取りできます。スナップショットとログはZooKeeperとは互換性のない形式ですが、`clickhouse-keeper-converter`ツールを使用することでZooKeeperデータをClickHouse Keeperスナップショットに変換することができます。ClickHouse Keeperのサーバー間プロトコルもZooKeeperと互換性がないため、混合ZooKeeper / ClickHouse Keeperクラスターは不可能です。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同様にアクセス制御リスト (ACL) をサポートしています。ClickHouse Keeperは同じ権限のセットをサポートし、同一の組み込みスキームを持っています：`world`、`auth`、および`digest`。ダイジェスト認証スキームは`username:password`の組み合わせを使用し、パスワードはBase64でエンコードされます。

:::note
外部統合はサポートされていません。
:::
### 設定 {#configuration}

ClickHouse Keeperは、ZooKeeperのスタンドアロンの代替として使用することも、ClickHouseサーバーの内部部分として使用することもできます。どちらの場合でも、設定はほぼ同じ`.xml`ファイルです。
#### Keeper設定項目 {#keeper-configuration-settings}

主なClickHouse Keeperの設定タグは`<keeper_server>`で、次のパラメータを持っています：

| パラメータ                           | 説明                                                                                                                                                                                                                        | デフォルト                                                                                                   |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                       | `2181`                                                                                                      |
| `tcp_port_secure`                   | クライアントとkeeper-server間のSSL接続のためのセキュアポート。                                                                                                                                                              | -                                                                                                            |
| `server_id`                          | 一意のサーバーID。ClickHouse Keeperクラスターの各参加者は一意の番号（1、2、3、など）を持つ必要があります。                                                                                                          | -                                                                                                            |
| `log_storage_path`                   | コーディネーションログのパス。ZooKeeperと同様に、ログは混雑のないノードに保存するのが最適です。                                                                                                                            | -                                                                                                            |
| `snapshot_storage_path`              | コーディネーションスナップショットのパス。                                                                                                                                                                                 | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration)を介した動的クラスタ再構成を有効にします。                                                                                                                                                      | `False`                                                                                                     |
| `max_memory_usage_soft_limit`         | Keeperの最大メモリ使用に対するソフトリミット（バイト）。                                                                                                                                                                  | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                              |
| `max_memory_usage_soft_limit_ratio`   | `max_memory_usage_soft_limit`が設定されていないか、ゼロに設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                          | `0.9`                                                                                                       |
| `cgroups_memory_observer_wait_time`   | `max_memory_usage_soft_limit`が設定されていないか`0`に設定されている場合、この間隔を使用して物理メモリの量を観察します。メモリ量が変更されると、Keeperのメモリソフトリミットを`max_memory_usage_soft_limit_ratio`で再計算します。 | `15`                                                                                                        |
| `http_control`                       | [HTTPコントロール](#http-control)インターフェースの設定。                                                                                                                                                                    | -                                                                                                            |
| `digest_enabled`                     | リアルタイムデータ整合性チェックを有効にします。                                                                                                                                                                          | `True`                                                                                                      |
| `create_snapshot_on_exit`            | シャットダウン中にスナップショットを作成します。                                                                                                                                                                            | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定のためのサニティホスト名チェックを有効にします（例：ローカルホストがリモートエンドポイントと一緒に使用される場合）。                                                                                                      | `True`                                                                                                      |
| `four_letter_word_white_list`        | 4文字の命令のホワイトリスト。                                                                                                                                                                                                  | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |

他の一般的なパラメータは、ClickHouseサーバーの設定（`listen_host`、`logger`など）から継承されます。
#### 内部コーディネーション設定 {#internal-coordination-settings}

内部コーディネーション設定は、`<keeper_server>.<coordination_settings>`セクションにあり、次のパラメータを持っています：

| パラメータ                          | 説明                                                                                                                                                                                                                                                                       | デフォルト                                                                                                   |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一のクライアント操作のタイムアウト（ms）。                                                                                                                                                                                                                                                                     | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト（ms）。                                                                                                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト（ms）。                                                                                                                                                                                                                                                                     | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeperがデッドセッションをチェックし、それを削除する頻度（ms）。                                                                                                                                                                                                                                                    | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeperリーダーがフォロワーにハートビートを送信する頻度（ms）。                                                                                                                                                                                                                                                         | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーがこの間隔でリーダーからハートビートを受け取らなかった場合、リーダー選挙を開始できます。この値は`election_timeout_upper_bound_ms`以下でなければなりません。理想的には同じであってはいけません。                                                                                  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーがこの間隔でリーダーからハートビートを受け取らなかった場合、リーダー選挙を開始しなければなりません。                                                                                                                                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 単一のファイルに保存するログレコードの数。                                                                                                                                                                                                                                                                              | `100000`                                                                                                     |
| `reserved_log_items`               | コンパクション前に保存するコーディネーションログレコードの数。                                                                                                                                                                                                                                                                  | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeperが新しいスナップショットを作成する頻度（ログ内のレコード数）。                                                                                                                                                                                                                                                     | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショットの数。                                                                                                                                                                                                                                                                                             | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーをスタレと見なす閾値。この場合、ログの代わりにスナップショットを送信します。                                                                                                                                                                                                                                      | `10000`                                                                                                     |
| `fresh_log_gap`                    | ノードが新鮮になったとき。                                                                                                                                                                                                                                                                                                   | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFTに送信される前のリクエストカウントのバッチの最大サイズ。                                                                                                                                                                                                                                                        | `100`                                                                                                        |
| `force_sync`                       | コーディネーションログへの各書き込みで`fsync`を呼び出します。                                                                                                                                                                                                                                                                  | `true`                                                                                                       |
| `quorum_reads`                     | 読み取りリクエストを、同様の速度で全体のRAFT合意として実行します。                                                                                                                                                                                                                                                                   | `false`                                                                                                      |
| `raft_logs_level`                  | コーディネーションに関するテキストログレベル（トレース、デバッグなど）。                                                                                                                                                                                                                                                                          | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストの転送を許可します。                                                                                                                                                                                                                                                                     | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続を終了し、シャットダウンを待機します（ms）。                                                                                                                                                                                                                                                                               | `5000`                                                                                                       |
| `startup_timeout`                  | サーバーが指定されたタイムアウト内に他のクォーラム参加者に接続できない場合、終了します（ms）。                                                                                                                                                                                                                                    | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。全ての書き込みおよび読み取りの保証が保持される一方で、より良いパフォーマンスが達成されます。設定はデフォルトで無効になっており、後方互換性を破らないようにしています。                                                                                       | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新のログエントリのインメモリキャッシュの最大サイズ。                                                                                                                                                                                                                                                                 | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットに必要なログエントリのインメモリキャッシュの最大サイズ。                                                                                                                                                                                                                                                                        | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`       | ファイルがディスク間で移動されている最中に発生した失敗後の再試行の間隔。                                                                                                                                                                                                                                                                | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にファイルがディスク間で移動されている最中に発生した失敗の再試行の回数。                                                                                                                                                                                                                                                          | `100`                                                                                                        |
| `experimental_use_rocksdb`         | rocksdbをバックエンドストレージとして使用します。                                                                                         | `0`                                                                                                          |

クォーラム設定は`<keeper_server>.<raft_configuration>`セクションにあり、サーバーの説明を含んでいます。

全クォーラムに対して唯一のパラメータは`secure`で、クォーラム参加者間の通信に暗号化された接続を有効にします。このパラメータはSSL接続が必要な場合は`true`に設定し、それ以外の場合は指定しないでおきます。

各`<server>`の主なパラメータは次のとおりです：

- `id` — クォーラム内のサーバー識別子。
- `hostname` — このサーバーが存在するホスト名。
- `port` — このサーバーが接続をリッスンするポート。
- `can_become_leader` — サーバーを`learner`として設定するには`false`に設定します。省略した場合、値は`true`になります。

:::note
ClickHouse Keeperクラスターのトポロジーに変更があった場合（例：サーバーの置換）、`server_id`と`hostname`のマッピングを一貫して保ち、既存の`server_id`を異なるサーバーに対してシャッフルまたは再利用しないようにしてください（自動化スクリプトに依存してClickHouse Keeperをデプロイする場合に起こることがあります）。

Keeperインスタンスのホストが変更される可能性がある場合は、生のIPアドレスの代わりにホスト名を定義して使用することをお勧めします。ホスト名を変更することは、サーバーを削除して再追加するのと同じであり、場合によっては不可能なことがあります（例：クォーラムのために十分なKeeperインスタンスがない場合）。
:::

:::note
`async_replication`は後方互換性を破らないようにデフォルトで無効になっています。クラスター内の全てのKeeperインスタンスが`async_replication`をサポートするバージョン（v23.9+）で実行されている場合、パフォーマンスが向上し、欠点がないため、これを有効にすることをお勧めします。
:::

三つのノードを持つクォーラムの設定の例は、`test_keeper_`プレフィックスを持つ[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)で見つけることができます。サーバー#1の設定例：

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

ClickHouse KeeperはClickHouseサーバーパッケージにバンドルされており、`<keeper_server>`の設定を`/etc/your_path_to_config/clickhouse-server/config.xml`に追加し、従来通りにClickHouseサーバーを起動します。スタンドアロンのClickHouse Keeperを実行したい場合は、次のように開始できます：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は、それを作成するか、`clickhouse`に対して`keeper`を引数として指定できます：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### Four Letter Word Commands {#four-letter-word-commands}

ClickHouse Keeper は Zookeeper とほぼ同じ 4lw コマンドを提供します。各コマンドは `mntr` や `stat` などの4文字から構成されています。いくつかの興味深いコマンドがあります。`stat` はサーバーと接続されたクライアントに関する一般的な情報を提供し、`srvr` と `cons` はそれぞれサーバーと接続に関する詳細を表示します。

4lw コマンドには、ホワイトリストの設定 `four_letter_word_white_list` があり、デフォルト値は `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld` です。

コマンドは telnet または nc を介して ClickHouse Keeper に発行できます。クライアントポートで実行します。

```bash
echo mntr | nc localhost 9181
```

以下は、詳細な 4lw コマンドです。

- `ruok`: サーバーがエラーステートで動作しているかをテストします。サーバーが正常に動作している場合は `imok` と応答します。そうでなければ、全く応答しません。`imok` の応答は、サーバーがクォーラムに参加していることを示すものではなく、サーバープロセスがアクティブで指定されたクライアントポートにバインドされていることを示します。クォーラムやクライアント接続情報に関しての詳細を知るには「stat」を使用してください。

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

- `stat`: サーバーと接続されたクライアントの簡潔な詳細をリストします。

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

- `srst`: サーバーの統計をリセットします。このコマンドは `srvr`, `mntr`, `stat` の結果に影響します。

```response
Server stats reset.
```

- `conf`: サーバーの設定に関する詳細を表示します。

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

- `cons`: このサーバーに接続されているすべてのクライアントの完全な接続/セッション詳細をリストします。受信/送信パケットの数、セッション ID、操作の遅延、最後に実行された操作などの情報を含みます…

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: すべての接続の接続/セッション統計をリセットします。

```response
Connection stats reset.
```

- `envi`: サーバーの環境に関する詳細を表示します。

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

- `isro`: サーバーが読み取り専用モードで実行されているかどうかをテストします。サーバーが読み取り専用モードの場合は `ro` と応答し、そうでない場合は `rw` と応答します。

```response
rw
```

- `wchs`: サーバーに対するウェッチの簡単な情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: セッションごとのウェッチに関する詳細情報をリストします。これは、関連するウェッチ（パス）を持つセッション（接続）のリストを出力します。この操作は、ウェッチの数に応じて高コストになる可能性があるため（サーバー性能に影響を与える）、注意して使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: パスごとのウェッチに関する詳細情報をリストします。これは、関連するセッションを持つパス（ノード）のリストを出力します。この操作は、ウェッチの数に応じて高コストになる可能性があるため（サーバー性能に影響を与える）、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: 未解決のセッションとエフェメラルノードをリストします。これはリーダーのみで機能します。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: スナップショット作成タスクをスケジュールします。成功した場合はスケジュールされたスナップショットの最終コミットされたログインデックスを返し、失敗した場合は `Failed to schedule snapshot creation task.` と返します。「lgif」コマンドを使用すると、スナップショットの完了状況を確認できます。

```response
100
```

- `lgif`: Keeper ログ情報。`first_log_idx`: ログストア内の私の最初のログインデックス; `first_log_term`: 私の最初のログターム; `last_log_idx`: ログストア内の私の最後のログインデックス; `last_log_term`: 私の最後のログターム; `last_committed_log_idx`: 状態マシン内の私の最後のコミットされたログインデックス; `leader_committed_log_idx`: 私の観点からのリーダーのコミットされたログインデックス; `target_committed_log_idx`: コミットされるべきターゲットログインデックス; `last_snapshot_idx`: 最後のスナップショットでコミットされた最大のログインデックス。

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

- `rqld`: 新しいリーダーになるリクエストを送信します。リクエストを送信した場合は `Sent leadership request to leader.` と返され、送信されなかった場合は `Failed to send leadership request to leader.` と返されます。ノードがすでにリーダーである場合、結果は同じです。

```response
Sent leadership request to leader.
```

- `ftfl`: すべてのフィーチャーフラグと、それらが Keeper インスタンスで有効になっているかどうかをリストします。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: リーダーシップを放棄してフォロワーになるリクエストを送信します。このリクエストを受け取ったサーバーがリーダーである場合、最初に書き込み操作を一時停止し、その後、後任（現在のリーダーは後任になれない）が最新のログのキャッチアップを終了するまで待機し、次に辞任します。後任は自動的に選択されます。リクエストを送信した場合は `Sent yield leadership request to leader.` と返され、送信されなかった場合は `Failed to send yield leadership request to leader.` と返されます。ノードがすでにフォロワーである場合、結果は同じです。

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

ClickHouse Keeper は、レプリカがトラフィックを受け取る準備ができているかどうかを確認するための HTTP インターフェースを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) のようなクラウド環境で使用できます。

`/ready` エンドポイントを有効にする設定の例:

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

Keeper は ZooKeeper とそのクライアントと完全に互換性がありますが、ClickHouse クライアントが使用できる独自の機能とリクエストタイプも導入しています。
これらの機能は後方互換性のない変更を引き起こす可能性があるため、デフォルトではほとんどが無効になっており、`keeper_server.feature_flags` 設定を使用して有効にすることができます。
すべての機能は明示的に無効にすることができます。
Keeper クラスター用の新しい機能を有効にする場合は、最初にクラスター内のすべての Keeper インスタンスをその機能をサポートするバージョンに更新し、その後で機能自体を有効にすることをお勧めします。

`multi_read` を無効にし、`check_not_exists` を有効にする機能フラグ設定の例:

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

`multi_read` - 複数リクエストの読み取りをサポートします。デフォルト: `1`  
`filtered_list` - ノードの種類（エフェメラルまたは永続的）によって結果をフィルタリングするリストリクエストをサポートします。デフォルト: `1`  
`check_not_exists` - ノードが存在しないことを確認する `CheckNotExists` リクエストをサポートします。デフォルト: `0`  
`create_if_not_exists` - ノードが存在しない場合にノードを作成しようとする `CreateIfNotExists` リクエストをサポートします。存在する場合、変更は適用されず、`ZOK` が返されます。デフォルト: `0`
### Migration from ZooKeeper {#migration-from-zookeeper}

ZooKeeper から ClickHouse Keeper へのシームレスな移行は不可能です。 ZooKeeper クラスターを停止し、データを変換し、ClickHouse Keeper を起動する必要があります。`clickhouse-keeper-converter` ツールは、ZooKeeper のログとスナップショットを ClickHouse Keeper のスナップショットに変換できます。これは ZooKeeper > 3.4 のみで動作します。移行手順：

1. すべての ZooKeeper ノードを停止します。

2. オプションですが推奨されます: ZooKeeper のリーダーノードを見つけて、そのノードを再起動して停止します。これにより、ZooKeeper は一貫したスナップショットを作成します。

3. リーダー上で `clickhouse-keeper-converter` を実行します。たとえば：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを ClickHouse サーバーノードにコピーします。`keeper` が設定されている場合、または ZooKeeper の代わりに ClickHouse Keeper を起動します。スナップショットはすべてのノードに存在する必要があります。そうでないと、空のノードが速くなる可能性があり、そのうちの1つがリーダーになる可能性があります。

:::note
`keeper-converter` ツールは、Keeper のスタンドアロンバイナリからは利用できません。
ClickHouse をインストールしている場合は、バイナリを直接使用できます：

```bash
clickhouse keeper-converter ...
```

そうでない場合は、[バイナリをダウンロード](/getting-started/quick-start#download-the-binary)し、前述のように ClickHouse をインストールせずにツールを実行できます。
:::
### Recovering after losing quorum {#recovering-after-losing-quorum}

ClickHouse Keeper は Raft を使用しているため、クラスターサイズに応じて一定数のノードクラッシュに耐えることができます。
たとえば、3ノードクラスターの場合、1ノードがクラッシュしても正しく動作し続けます。

クラスター構成は動的に構成できますが、いくつかの制限があります。再構成も Raft に依存しているため、クラスターからノードを追加または削除するにはクォーラムが必要です。同時に多くのノードがクラスター内で失われ、再起動の可能性がない場合、Raft は機能を停止し、通常の方法でクラスターを再構成できなくなります。

それにもかかわらず、ClickHouse Keeper には、ノードが1つだけで強制的にクラスターを再構成できる回復モードがあります。
この操作は、ノードを再起動できない場合、または同じエンドポイントで新しいインスタンスを起動する場合、最後の手段としてのみ行うべきです。

続行する前に注意すべき重要なポイント：
- 故障したノードが再度クラスターに接続できないことを確認してください。
- ステップで指定されるまで、新しいノードを一つも起動しないでください。

上記のことが真であると確認した後、次のことを行う必要があります：
1. 新しいリーダーとなる単一の Keeper ノードを選択します。そのノードのデータがクラスター全体に使用されるため、最新の状態のノードを使用することをお勧めします。
2. 何かをする前に、選択したノードの `log_storage_path` と `snapshot_storage_path` フォルダのバックアップを取ります。
3. 使用するすべてのノードでクラスターを再構成します。
4. 選択したノードに対して、ノードを回復モードに移行するための4文字コマンド `rcvr` を送信するか、選択したノードで Keeper インスタンスを停止し、`--force-recovery` 引数を付けて再起動します。
5. 選択したノードに対する `mntr` が `zk_server_state` に対して `follower` を返すまで、新しいノードの Keeper インスタンスを一つずつ起動します。
6. 回復モード中は、リーダーノードは、新しいノードとクォーラムを達成するまで `mntr` コマンドにエラーメッセージを返し、クライアントおよびフォロワーからのリクエストを拒否します。
7. クォーラムが達成された後、リーダーノードは通常の動作モードに戻り、すべてのリクエストを受け入れ、`mntr` を使用して Raft 検証を行い、`zk_server_state` に対して `leader` を返します。
## Using disks with Keeper {#using-disks-with-keeper}

Keeper はスナップショット、ログファイル、状態ファイルの保存に使用する [外部ディスク](/operations/storing-data.md) のサブセットをサポートします。

サポートされているディスクのタイプは以下の通りです：
- s3_plain
- s3
- local

以下は、設定ファイル内のディスク定義の例です。

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
さらに、最新のログまたはスナップショット用に異なるディスクを使用する場合は、それぞれ `keeper_server.latest_log_storage_disk` と `keeper_server.latest_snapshot_storage_disk` を使用できます。  
その場合、Keeper は新しいログまたはスナップショットが作成されると、ファイルを適切なディスクに自動的に移動します。
状態ファイル用にディスクを使用するには、`keeper_server.state_storage_disk` 設定をディスクの名前に設定する必要があります。

ディスク間でのファイル移動は安全であり、Keeper が転送中に停止した場合でもデータが失われるリスクはありません。
ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されません。

`keeper_server.coordination_settings.force_sync` を `true` (`true` がデフォルト) に設定した Keeper は、すべてのタイプのディスクに対していくつかの保証を満たすことができません。  
現在、`local`タイプのディスクのみが永続的な同期をサポートします。  
`force_sync` が使用される場合、`latest_log_storage_disk` が使用されていない場合は、`log_storage_disk` は `local` ディスクである必要があります。  
`latest_log_storage_disk` が使用されている場合、それは常に `local` ディスクであるべきです。  
`force_sync` が無効になっている場合、すべてのタイプのディスクを任意の構成で使用できます。

Keeper インスタンスのための可能なストレージ設定は以下の通りです。

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

このインスタンスは、最新でないすべてのログをディスク `log_s3_plain` に保存しますが、最新のログは `log_local` ディスクに保存されます。  
同じ論理がスナップショットにも適用され、最新のスナップショット以外のすべてのスナップショットは `snapshot_s3_plain` に保存されますが、最新のスナップショットは `snapshot_local` ディスクに保存されます。
### Changing disk setup {#changing-disk-setup}

:::important
新しいディスク設定を適用する前に、すべての Keeper ログとスナップショットを手動でバックアップしてください。
:::

階層的なディスク設定が定義されている場合（最新のファイルに異なるディスクを使用する場合）、Keeper は起動時に自動的にファイルを正しいディスクに移動しようとします。  
以前と同じ保証が適用されます。ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されないため、複数の再起動を安全に実行できます。

完全に新しいディスクにファイルを移動する必要がある場合（または 2 つのディスク構成から単一のディスク構成に移動する場合）、`keeper_server.old_snapshot_storage_disk` と `keeper_server.old_log_storage_disk` の複数の定義を使用することができます。

以下の設定は、以前の2ディスク構成から完全に新しい単一ディスク構成に移動する方法を示しています：

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

起動時に、すべてのログファイルは `log_local` と `log_s3_plain` から `log_local2` ディスクに移動されます。  
また、すべてのスナップショットファイルは `snapshot_local` と `snapshot_s3_plain` から `snapshot_local2` ディスクに移動されます。
## Configuring logs cache {#configuring-logs-cache}

ディスクから読み取るデータ量を最小限に抑えるために、Keeper はメモリ内にログエントリをキャッシュします。  
リクエストが大きい場合、ログエントリがメモリを占有しすぎるため、キャッシュされるログの量は制限されています。  
この制限は、以下の2つの設定によって管理されます：
- `latest_logs_cache_size_threshold` - キャッシュに保存される最新のログの総サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要がある後続のログの総サイズ

デフォルト値が大きすぎる場合は、これらの2つの設定を減らすことでメモリ使用量を削減できます。

:::note
`pfev` コマンドを使用して、各キャッシュからおよびファイルから読み取られたログの量を確認できます。  
Prometheus エンドポイントからのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。  
:::
## Prometheus {#prometheus}

Keeper は、[Prometheus](https://prometheus.io) からのスクレイピングのためにメトリクスデータを公開できます。

設定：

- `endpoint` - Prometheus サーバーによってメトリクスをスクレイピングするための HTTP エンドポイント。 `/` から始まります。
- `port` - `endpoint` 用のポート。
- `metrics` - [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開するフラグ。
- `events` - [system.events](/operations/system-tables/events) テーブルからメトリクスを公開するフラグ。
- `asynchronous_metrics` - [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開するフラグ。

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

確認する（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloud の [Prometheus 統合](/integrations/prometheus) についてもご覧ください。
## ClickHouse Keeper User Guide {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeper の設定を簡単かつ最小限にした例を提供し、分散操作をテストする方法を説明します。この例は、Linux の3ノードを使用して実施されます。
### 1. Keeper 設定でノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト（`chnode1`, `chnode2`, `chnode3`）に3つの ClickHouse インスタンスをインストールします。（ClickHouse のインストールの詳細は [Quick Start](/getting-started/install.md) をご覧ください。）

2. 各ノードで、ネットワークインターフェースを介して外部通信を許可するために、次のエントリーを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. すべてのサーバーに次の ClickHouse Keeper 設定を追加し、各サーバーの `<server_id>` 設定を更新します。`chnode1` の場合は `1`、`chnode2` の場合は `2` などです。
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

    これらは上記の基本設定です：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |keeper のクライアントが使用するポート|9181（デフォルトの2181と等価）|
    |server_id| Raft 構成で使用される各 ClickHouse Keeper サーバーの識別子| 1|
    |coordination_settings| タイムアウトなどのパラメータが含まれたセクション| タイムアウト: 10000, ログレベル: trace|
    |server    |参加するサーバーの定義|各サーバーのリスト定義|
    |raft_configuration| Keeper クラスター内の各サーバーの設定| 各サーバーの設定|
    |id      |keeper サービスのサーバーの数値 ID|1|
    |hostname   |Keeper クラスター内の各サーバーのホスト名、IP、または FQDN|`chnode1.domain.com`|
    |port|サーバー間 Keeper 接続を待ち受けるポート|9234|

4. Zookeeper コンポーネントを有効にします。ClickHouse Keeper エンジンを使用します：
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

    これらは上記の基本設定です：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   | ClickHouse Keeper 接続用のノードリスト|各サーバーの設定エントリ|
    |host|各 ClickHouse keeper ノードのホスト名、IP、または FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper クライアントポート| 9181|

5. ClickHouse を再起動し、各 Keeper インスタンスが実行中であることを確認します。各サーバーで次のコマンドを実行します。`ruok` コマンドは、Keeper が正常に動作している場合は `imok` を返します：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` データベースには、ClickHouse Keeper インスタンスの詳細を含む `zookeeper` という名前のテーブルがあります。このテーブルを表示してみましょう：
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

1. 2つのシャードと2つのノード上に1つのレプリカを持つシンプルなクラスターを構成しましょう。3番目のノードはClickHouse Keeperにおける過半数を達成するために使用されます。`chnode1`と`chnode2`の構成を更新してください。以下のクラスター定義は、各ノードに1つのシャードを持ち、合計2つのシャードでレプリケーションは行われません。この例では、一部のデータはあるノードに、残りは別のノードに存在します：
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

    |パラメータ |説明                   |例              |
    |----------|------------------------------|---------------------|
    |shard   |クラスター定義のレプリカのリスト|各シャードのレプリカのリスト|
    |replica|各レプリカの設定のリスト|各レプリカの設定エントリ|
    |host|レプリカシャードをホストするサーバーのホスト名、IPまたはFQDN|`chnode1.domain.com`|
    |port|ネイティブなtcpプロトコルを使って通信するためのポート|9000|
    |user|クラスターインスタンスに認証するために使用されるユーザー名|default|
    |password|クラスターインスタンスへの接続を可能にするために定義されたユーザーのパスワード|`ClickHouse123!`|

2. ClickHouseを再起動し、クラスターが作成されたことを確認します：
    ```bash
    SHOW clusters;
    ```

    あなたのクラスターが表示されるはずです：
    ```response
    ┌─cluster───────┐
    │ cluster_2S_1R │
    └───────────────┘
    ```
### 3. 分散テーブルの作成とテスト {#3-create-and-test-distributed-table}

1. `chnode1`でClickHouseクライアントを使用して新しいクラスター上に新しいデータベースを作成します。`ON CLUSTER`句は、自動的に両方のノードにデータベースを作成します。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1`データベースに新しいテーブルを作成します。再度、`ON CLUSTER`は両方のノードにテーブルを作成します。
    ```sql
    CREATE TABLE db1.table1 ON CLUSTER 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1`ノードで、いくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2`ノードでもいくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで`SELECT`ステートメントを実行すると、そのノードのデータのみが表示されることに注意してください。たとえば、`chnode1`で：
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

    `chnode2`では：
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

6. 2つのシャードのデータを表す`Distributed`テーブルを作成できます。`Distributed`テーブルエンジンを持つテーブルは自身のデータを保存せず、複数のサーバーで分散クエリ処理を可能にします。読み取りはすべてのシャードに対して行われ、書き込みはシャード間で分散できます。次のクエリを`chnode1`で実行します：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R, db1, table1)
    ```

7. `dist_table`をクエリすると、2つのシャードから全4行のデータが返されることに注意してください：
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
### 概要 {#summary}

このガイドでは、ClickHouse Keeperを使用してクラスターを設定する方法を示しました。ClickHouse Keeperを使用すると、クラスターを構成し、シャードを跨いで複製される分散テーブルを定義できます。
## ユニークなパスを使用したClickHouse Keeperの構成 {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### 説明 {#description}

この記事では、組み込みの`{uuid}`マクロ設定を使用して、ClickHouse KeeperまたはZooKeeperでユニークなエントリを作成する方法を説明します。ユニークなパスは、テーブルを頻繁に作成および削除する際に役立ちます。これは、パスが作成されるたびに新しい`uuid`がそのパスで使用され、パスが再利用されないため、Keeperのガーベジコレクションがパスエントリを削除するのを数分待つ必要がなくなります。
### 例の環境 {#example-environment}

ClickHouse Keeperを全3ノードに構成し、2つのノードにClickHouseを配置する3ノードのクラスター。この構成により、ClickHouse Keeperに対して3ノード（タイブレイカーノードを含む）が提供され、2つのレプリカから構成された単一のClickHouseシャードが作成されます。

|ノード|説明|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスター`cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスター`cluster_1S_2R`|
|`chnode3.marsnet.local`|ClickHouse Keeperタイブレイカーノード|

クラスターの例の構成：
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
### `{uuid}`を使用したテーブルのセットアップ手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを構成します。サーバー1の例：
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
`shard`と`replica`のマクロを定義することに注意してください。ただし、`{uuid}`はここで定義されていません。それは組み込みであり、定義する必要はありません。
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

3. マクロと`{uuid}`を使用してクラスター上にテーブルを作成します。

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

4. 分散テーブルを作成します。

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
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

1. 最初のノード（例：`chnode1`）にデータを挿入します。
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

2. 2番目のノード（例：`chnode2`）にデータを挿入します。
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

3. 分散テーブルを使用してレコードを表示します。
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

デフォルトのレプリケーションパスは、マクロを使用して事前に定義でき、`{uuid}`も使用できます。

1. 各ノードのテーブルのデフォルトを設定します。
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
ノードが特定のデータベースに使用される場合は、各ノードでマクロ`{database}`を定義することもできます。
:::

2. 明示的なパラメータなしでテーブルを作成します：
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

3. デフォルト構成で使用されている設定を確認します。
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

テーブル情報とUUIDを取得する例のコマンド：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDに関するZooKeeper情報を取得する例のコマンド：
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは`Atomic`である必要があります。以前のバージョンからのアップグレード時には、`default`データベースは`Ordinary`タイプである可能性があります。
:::

確認するには：

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

ClickHouse Keeperは、`keeper_server.enable_reconfiguration`がオンになっている場合、ZooKeeperの[`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)コマンドを部分的にサポートしています。これにより、動的なクラスター再構成が可能になります。

:::note
この設定がオフになっている場合、レプリカの`raft_configuration`セクションを手動で変更してクラスターを再構成できます。変更を適用するのはリーダーだけであるため、すべてのレプリカのファイルを編集する必要があります。あるいは、ZooKeeper互換のクライアントを通じて`reconfig`クエリを送信できます。
:::

仮想ノード`/keeper/config`は、次の形式で最後にコミットされたクラスター構成を含みます：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリーは改行で区切られています。
- `server_type`は`participant`または`learner`である必要があります（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)はリーダー選挙に参加しません）。
- `server_priority`は非負整数で、[リーダー選挙で優先すべきノードを指示します](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)。0の優先順位は、サーバーがリーダーになることはないことを意味します。

例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

`reconfig`コマンドを使用して新しいサーバーを追加したり、既存のサーバーを削除したり、既存のサーバーの優先順位を変更したりできます。以下は例です（`clickhouse-keeper-client`を使用）：

```bash

# 新しいサーバーを2つ追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# 他のサーバーを2つ削除
reconfig remove "3,4"

# 既存のサーバーの優先順位を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

そして、`kazoo`に関する例は以下の通りです：

```python

# 新しいサーバーを2つ追加し、他のサーバーを2つ削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# 既存のサーバーの優先順位を8に変更
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`のサーバーは上記で説明されたサーバー形式である必要があります。サーバーエントリーはカンマで区切る必要があります。新しいサーバーを追加する際には、`server_priority`（デフォルト値は1）および`server_type`（デフォルト値は`participant`）を省略することができます。

既存のサーバーの優先順位を変更したい場合は、ターゲット優先順位を加えて`joining`に追加します。ただし、サーバーのホスト、ポート、およびタイプは既存のサーバー構成と一致しなければなりません。

サーバーは、`joining`および`leaving`での出現順序で追加および削除されます。`joining`からのすべての更新は、`leaving`からの更新の前に処理されます。

Keeperの再構成実装にはいくつかの留意点があります：

- インクリメンタルな再構成のみがサポートされています。`new_members`が空でないリクエストは拒否されます。

  ClickHouse Keeperの実装は、構成を動的に変更するためにNuRaft APIに依存しています。NuRaftには、サーバーを1つずつ追加または削除する方法があります。このため、構成に対する各変更（`joining`の各部分、`leaving`の各部分）は個別に決定する必要があります。したがって、バルク再構成は利用できません。なぜなら、これはエンドユーザーにとって誤解を招くことだからです。

  サーバータイプ（participant/learner）を変更することもできません。これはNuRaftによってサポートされておらず、サーバーを削除して追加する必要があります。これもまた、誤解を招くことになります。

- 戻り値の`znodestat`値は使用できません。
- `from_version`フィールドは使用されません。`from_version`が設定されたすべてのリクエストは拒否されます。これは、`/keeper/config`が仮想ノードであるためで、これは永続ストレージに保存されるのではなく、リクエストごとに指定されたノード構成で生成されるためです。この決定は、データの重複を防ぐために行われました。なぜなら、NuRaftはこの構成をすでに保存しているからです。
- ZooKeeperとは異なり、`sync`コマンドを送信することでクラスターの再構成を待機する方法はありません。新しい構成は_最終的に_適用されますが、時間保証はありません。
- `reconfig`コマンドは、さまざまな理由で失敗することがあります。クラスターの状態をチェックして、更新が適用されたかどうかを確認できます。
## 単一ノードのKeeperをクラスターに変換する {#converting-a-single-node-keeper-into-a-cluster}

実験的なKeeperノードをクラスターに拡張する必要がある場合があります。以下は、3ノードクラスターにおけるその手順を示したスキームです：

- **重要**：新しいノードは、現在の過半数未満のバッチで追加する必要があります。そうしないと、彼らは自分たちの中でリーダーを選出します。この例では1つずつ追加します。
- 既存のKeeperノードでは、`keeper_server.enable_reconfiguration`構成パラメータをオンにしておく必要があります。
- 完全な新しいKeeperクラスターの構成で2番目のノードを起動します。
- 起動後、ノード1にそれを追加します（[`reconfig`](#reconfiguration)を使用）。
- 次に、3番目のノードを起動し、[`reconfig`](#reconfiguration)を使用してそれを追加します。
- 新しいKeeperノードを追加し、変更を適用するために`clickhouse-server`の構成を更新して再起動します。
- ノード1のRaft構成を更新し、オプションで再起動します。

このプロセスに自信を持つために、こちらの[サンドボックスリポジトリ](https://github.com/ClickHouse/keeper-extend-cluster)をご覧ください。
## サポートされていない機能 {#unsupported-features}

ClickHouse KeeperはZooKeeperとの完全互換を目指していますが、現在実装されていない機能もいくつかあります（開発は進行中です）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は、`Stat`オブジェクトの返却をサポートしていません。
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は[TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)をサポートしていません。
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode))は[`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT)監視と連携しません。
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean))および[`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.WatcherType,boolean))はサポートされていません。
- `setWatches`はサポートされていません。
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html)タイプのznodesを作成することはサポートされていません。
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)はサポートされていません。
