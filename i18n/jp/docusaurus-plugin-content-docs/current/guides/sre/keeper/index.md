---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'ClickHouse Keeperの設定'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（clickhouse-keeper）はZooKeeperを置き換え、レプリケーションと調整を提供します。'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---

# ClickHouse Keeper (clickhouse-keeper) {#clickhouse-keeper-clickhouse-keeper}

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeperは、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)と[分散DDL](/sql-reference/distributed-ddl.md)クエリ実行のための調整システムを提供します。ClickHouse KeeperはZooKeeperと互換性があります。

### 実装の詳細 {#implementation-details}

ZooKeeperは、最初によく知られたオープンソース調整システムの1つです。Javaで実装されており、非常にシンプルで強力なデータモデルを持っています。ZooKeeperの調整アルゴリズムであるZooKeeper Atomic Broadcast（ZAB）は、各ZooKeeperノードがローカルで読み取りを処理するため、読み取りの線形化可能性の保証を提供しません。ZooKeeperとは異なり、ClickHouse KeeperはC++で記述されており、[RAFTアルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用します。このアルゴリズムは、読み取りと書き込みの線形化可能性を可能にし、さまざまな言語でいくつかのオープンソース実装があります。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：線形化可能な書き込みと非線形化可能な読み取り。互換性のあるクライアント・サーバープロトコルを持っているため、標準のZooKeeperクライアントを使用してClickHouse Keeperと対話できます。スナップショットとログはZooKeeperと互換性のない形式ですが、`clickhouse-keeper-converter`ツールを使用すると、ZooKeeperデータをClickHouse Keeperスナップショットに変換できます。ClickHouse Keeperのサーバー間プロトコルもZooKeeperと互換性がないため、ZooKeeper / ClickHouse Keeper混合クラスターは不可能です。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同じ方法でアクセス制御リスト（ACL）をサポートします。ClickHouse Keeperは同じ権限セットをサポートし、同一の組み込みスキームを持っています：`world`、`auth`、`digest`。ダイジェスト認証スキームは、`username:password`のペアを使用し、パスワードはBase64でエンコードされます。

:::note
外部統合はサポートされていません。
:::

### 設定 {#configuration}

ClickHouse KeeperはZooKeeperのスタンドアロン代替として、またはClickHouseサーバーの内部部分として使用できます。どちらの場合も、設定はほぼ同じ`.xml`ファイルです。

#### Keeper設定項目 {#keeper-configuration-settings}

主なClickHouse Keeper設定タグは`<keeper_server>`で、次のパラメータがあります：

| パラメータ                            | 説明                                                                                                                                                                                                                                         | デフォルト                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | クライアントとkeeper-server間のSSL接続用のセキュアポート。                                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | 一意のサーバーID、ClickHouse Keeperクラスターの各参加者は一意の番号（1、2、3など）を持つ必要があります。                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                   | 調整ログへのパス、ZooKeeperと同様に、ビジーでないノードにログを保存することが最善です。                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | 調整スナップショットへのパス。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration)を介した動的クラスター再構成を有効にします。                                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | keeperの最大メモリ使用量のソフト制限（バイト単位）。                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit`が設定されていないか0に設定されている場合、この値を使用してデフォルトのソフト制限を定義します。                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit`が設定されていないか`0`に設定されている場合、この間隔を使用して物理メモリの量を監視します。メモリ量が変更されると、`max_memory_usage_soft_limit_ratio`によってKeeperのメモリソフト制限を再計算します。 | `15`                                                                                                         |
| `http_control`                       | [HTTP制御](#http-control)インターフェースの設定。                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | リアルタイムデータ整合性チェックを有効にします                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | シャットダウン時にスナップショットを作成します                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定の健全性ホスト名チェックを有効にします（例：localhostがリモートエンドポイントと一緒に使用されている場合）                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lwコマンドのホワイトリスト。                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| IPv6を有効にします | `True`|

その他の一般的なパラメータはClickHouseサーバー設定（`listen_host`、`logger`など）から継承されます。

#### 内部調整設定 {#internal-coordination-settings}

内部調整設定は`<keeper_server>.<coordination_settings>`セクションにあり、次のパラメータがあります：

| パラメータ                          | 説明                                                                                                                                                                                                              | デフォルト                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一のクライアント操作のタイムアウト（ms）                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト（ms）                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト（ms）                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeperが死んでいるセッションをチェックし、それらを削除する頻度（ms）                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeperリーダーがフォロワーにハートビートを送信する頻度（ms）                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーがこの間隔でリーダーからハートビートを受信しない場合、リーダー選出を開始できます。`election_timeout_upper_bound_ms`以下である必要があります。理想的にはそれらは等しくないべきです。  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーがこの間隔でリーダーからハートビートを受信しない場合、リーダー選出を開始する必要があります。                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 単一のファイルに保存するログレコードの数。                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`               | 圧縮前に保存する調整ログレコードの数。                                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeperが新しいスナップショットを作成する頻度（ログ内のレコード数）。                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショットの数。                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーを古いと見なし、ログの代わりにスナップショットを送信するしきい値。                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                    | ノードがフレッシュになったとき。                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFTに送信される前のリクエスト数でのバッチの最大サイズ。                                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                       | 調整ログへの各書き込みで`fsync`を呼び出します。                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                     | 読み取りリクエストを、同様の速度でRAFTコンセンサス全体を通じた書き込みとして実行します。                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                  | 調整に関するテキストログレベル（trace、debugなど）。                                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストの転送を許可します。                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続の完了とシャットダウンを待ちます（ms）。                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                  | サーバーが指定されたタイムアウト内に他のクォーラム参加者に接続しない場合、終了します（ms）。                                                                                                              | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。すべての書き込みと読み取りの保証は保持されながら、より良いパフォーマンスが達成されます。後方互換性を壊さないために、設定はデフォルトで無効になっています                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新のログエントリのメモリ内キャッシュの最大合計サイズ                                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットに必要な次のログエントリのメモリ内キャッシュの最大合計サイズ                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | ディスク間でファイルが移動されている間に発生した失敗後のリトライ間の待機時間                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にディスク間でファイルが移動されている間に発生した失敗後のリトライ回数                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`         | rocksdbをバックエンドストレージとして使用します                                                                                                    | `0`                                                                                                        |

クォーラム設定は`<keeper_server>.<raft_configuration>`セクションにあり、サーバーの説明が含まれています。

クォーラム全体の唯一のパラメータは`secure`で、クォーラム参加者間の通信の暗号化接続を有効にします。内部ノード間通信にSSL接続が必要な場合はパラメータを`true`に設定でき、それ以外の場合は指定しません。

各`<server>`の主なパラメータは次のとおりです：

- `id` — クォーラム内のサーバー識別子。
- `hostname` — このサーバーが配置されているホスト名。
- `port` — このサーバーが接続をリッスンするポート。
- `can_become_leader` — サーバーを`learner`として設定するには`false`に設定します。省略された場合、値は`true`です。

:::note
ClickHouse Keeperクラスターのトポロジーが変更される場合（例：サーバーの置き換え）、`server_id`から`hostname`へのマッピングを一貫して保持し、既存の`server_id`を異なるサーバーにシャッフルまたは再利用しないようにしてください（例：ClickHouse Keeperをデプロイするための自動化スクリプトに依存している場合に発生する可能性があります）

Keeperインスタンスのホストが変更される可能性がある場合は、生のIPアドレスではなくホスト名を定義して使用することをお勧めします。ホスト名の変更は、サーバーを削除して再度追加することと同等であり、場合によっては不可能です（例：クォーラムに十分なKeeperインスタンスがない）。
:::

:::note
`async_replication`は、後方互換性を壊さないようにデフォルトで無効になっています。クラスター内のすべてのKeeperインスタンスが`async_replication`をサポートするバージョン（v23.9+）を実行している場合は、ダウンサイドなしでパフォーマンスを向上させることができるため、有効にすることをお勧めします。
:::

3ノードでのクォーラムの設定例は、`test_keeper_`プレフィックスを持つ[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)で見つけることができます。サーバー#1の設定例：

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

ClickHouse KeeperはClickHouseサーバーパッケージにバンドルされています。`/etc/your_path_to_config/clickhouse-server/config.xml`に`<keeper_server>`の設定を追加して、いつものようにClickHouseサーバーを起動するだけです。スタンドアロンのClickHouse Keeperを実行したい場合は、次のような方法で起動できます：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は、それを作成するか、`clickhouse`への引数として`keeper`を指定できます：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 4文字ワードコマンド {#four-letter-word-commands}

ClickHouse Keeperは、Zookeeperとほぼ同じ4lwコマンドも提供します。各コマンドは`mntr`、`stat`などの4文字で構成されています。いくつかのより興味深いコマンドがあります：`stat`はサーバーと接続されたクライアントに関する一般的な情報を提供し、`srvr`と`cons`はそれぞれサーバーと接続に関する拡張詳細を提供します。

4lwコマンドには、デフォルト値が`conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`であるホワイトリスト設定`four_letter_word_white_list`があります。

クライアントポートでtelnetまたはncを介してClickHouse Keeperにコマンドを発行できます。

```bash
echo mntr | nc localhost 9181
```

以下は詳細な4lwコマンドです：

- `ruok`：サーバーがエラーのない状態で実行されているかどうかをテストします。実行中の場合、サーバーは`imok`で応答します。それ以外の場合は、まったく応答しません。`imok`の応答は必ずしもサーバーがクォーラムに参加したことを示すわけではなく、サーバープロセスがアクティブで指定されたクライアントポートにバインドされているだけです。クォーラムとクライアント接続情報に関する状態の詳細については「stat」を使用してください。

```response
imok
```

- `mntr`：クラスターの健全性を監視するために使用できる変数のリストを出力します。

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

- `srvr`：サーバーの完全な詳細をリストします。

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

- `stat`：サーバーと接続されたクライアントの簡単な詳細をリストします。

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

- `srst`：サーバー統計をリセットします。コマンドは`srvr`、`mntr`、`stat`の結果に影響します。

```response
Server stats reset.
```

- `conf`：サービング設定に関する詳細を出力します。

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

- `cons`：このサーバーに接続されているすべてのクライアントの完全な接続/セッション詳細をリストします。受信/送信パケット数、セッションID、操作レイテンシ、実行された最後の操作などに関する情報が含まれます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`：すべての接続の接続/セッション統計をリセットします。

```response
Connection stats reset.
```

- `envi`：サービング環境に関する詳細を出力します

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

- `dirs`：スナップショットとログファイルの合計サイズをバイト単位で表示します

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

- `isro`：サーバーが読み取り専用モードで実行されているかどうかをテストします。読み取り専用モードの場合は`ro`、読み取り専用モードでない場合は`rw`で応答します。

```response
rw
```

- `wchs`：サーバーのウォッチに関する簡単な情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`：サーバーのウォッチに関する詳細情報をセッションごとにリストします。これは、関連するウォッチ（パス）を持つセッション（接続）のリストを出力します。ウォッチの数によっては、この操作は高価（サーバーパフォーマンスに影響）になる可能性がありますので、注意して使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`：サーバーのウォッチに関する詳細情報をパスごとにリストします。これは、関連するセッションを持つパス（znode）のリストを出力します。ウォッチの数によっては、この操作は高価（つまり、サーバーパフォーマンスに影響）になる可能性がありますので、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`：未処理のセッションとエフェメラルノードをリストします。これはリーダーでのみ機能します。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`：スナップショット作成タスクをスケジュールします。成功した場合はスケジュールされたスナップショットの最後にコミットされたログインデックスを返し、失敗した場合は`Failed to schedule snapshot creation task.`を返します。`lgif`コマンドがスナップショットが完了したかどうかを判断するのに役立つことに注意してください。

```response
100
```

- `lgif`：Keeperログ情報。`first_log_idx`：ログストア内の最初のログインデックス；`first_log_term`：最初のログターム；`last_log_idx`：ログストア内の最後のログインデックス；`last_log_term`：最後のログターム；`last_committed_log_idx`：ステートマシン内の最後にコミットされたログインデックス；`leader_committed_log_idx`：私の視点からのリーダーのコミットされたログインデックス；`target_committed_log_idx`：コミットすべきターゲットログインデックス；`last_snapshot_idx`：最後のスナップショット内で最大のコミットされたログインデックス。

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

- `rqld`：新しいリーダーになるリクエスト。リクエストが送信された場合は`Sent leadership request to leader.`を返し、リクエストが送信されなかった場合は`Failed to send leadership request to leader.`を返します。ノードがすでにリーダーの場合、結果はリクエストが送信されたのと同じです。

```response
Sent leadership request to leader.
```

- `ftfl`：すべての機能フラグと、Keeperインスタンスで有効になっているかどうかをリストします。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`：リーダーシップを譲渡してフォロワーになるリクエスト。リクエストを受信したサーバーがリーダーの場合、最初に書き込み操作を一時停止し、後継者（現在のリーダーは後継者になれない）が最新のログのキャッチアップを完了するまで待ってから辞任します。後継者は自動的に選択されます。リクエストが送信された場合は`Sent yield leadership request to leader.`を返し、リクエストが送信されなかった場合は`Failed to send yield leadership request to leader.`を返します。ノードがすでにフォロワーの場合、結果はリクエストが送信されたのと同じです。

```response
Sent yield leadership request to leader.
```

- `pfev`：収集されたすべてのイベントの値を返します。各イベントについて、イベント名、イベント値、イベントの説明を返します。

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

### HTTP制御 {#http-control}

ClickHouse Keeperは、レプリカがトラフィックを受信する準備ができているかどうかをチェックするためのHTTPインターフェースを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)などのクラウド環境で使用できます。

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

### 機能フラグ {#feature-flags}

KeeperはZooKeeperとそのクライアントと完全に互換性がありますが、ClickHouseクライアントで使用できるいくつかのユニークな機能とリクエストタイプも導入しています。
これらの機能は後方互換性のない変更を導入する可能性があるため、ほとんどがデフォルトで無効になっており、`keeper_server.feature_flags`設定を使用して有効にできます。
すべての機能は明示的に無効にできます。
Keeperクラスターの新しい機能を有効にする場合は、まずクラスター内のすべてのKeeperインスタンスを機能をサポートするバージョンに更新してから、機能自体を有効にすることをお勧めします。

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

次の機能が利用可能です：

| 機能                | 説明                                                                                                                                              | デフォルト |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `multi_read`           | 読み取りマルチリクエストのサポート                                                                                                                                           | `1`     |
| `filtered_list`        | ノードのタイプ（エフェメラルまたはパーシステント）で結果をフィルタリングするリストリクエストのサポート                                                             | `1`     |
| `check_not_exists`     | ノードが存在しないことをアサートする`CheckNotExists`リクエストのサポート                                                                              | `1`     |
| `create_if_not_exists` | ノードが存在しない場合にノードを作成しようとする`CreateIfNotExists`リクエストのサポート。存在する場合、変更は適用されず、`ZOK`が返されます | `1`     |
| `remove_recursive`     | ノードをそのサブツリーとともに削除する`RemoveRecursive`リクエストのサポート                                                                     | `1`     |

:::note
一部の機能フラグは、バージョン25.7以降デフォルトで有効になっています。
Keeperを25.7+にアップグレードする推奨方法は、まずバージョン24.9+にアップグレードすることです。
:::

### ZooKeeperからの移行 {#migration-from-zookeeper}

ZooKeeperからClickHouse Keeperへのシームレスな移行は不可能です。ZooKeeperクラスターを停止し、データを変換してから、ClickHouse Keeperを起動する必要があります。`clickhouse-keeper-converter`ツールを使用すると、ZooKeeperのログとスナップショットをClickHouse Keeperスナップショットに変換できます。ZooKeeper > 3.4でのみ機能します。移行の手順：

1. すべてのZooKeeperノードを停止します。

2. オプションですが推奨：ZooKeeperリーダーノードを見つけて、再度起動してから停止します。これにより、ZooKeeperが一貫したスナップショットを作成するように強制されます。

3. リーダーで`clickhouse-keeper-converter`を実行します。例：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. 設定された`keeper`を持つClickHouseサーバーノードにスナップショットをコピーするか、ZooKeeperの代わりにClickHouse Keeperを起動します。スナップショットはすべてのノードで永続化する必要があります。そうでない場合、空のノードがより速くなり、そのうちの1つがリーダーになる可能性があります。

:::note
`keeper-converter`ツールは、Keeperスタンドアロンバイナリからは利用できません。
ClickHouseがインストールされている場合は、バイナリを直接使用できます：

```bash
clickhouse keeper-converter ...
```

それ以外の場合は、[バイナリをダウンロード](/getting-started/quick-start/oss#download-the-binary)して、ClickHouseをインストールせずに上記のようにツールを実行できます。
:::

### クォーラムを失った後の回復 {#recovering-after-losing-quorum}

ClickHouse KeeperはRaftを使用するため、クラスターサイズに応じて一定量のノードクラッシュに耐えることができます。\
例えば、3ノードクラスターの場合、1つのノードがクラッシュしても正しく動作し続けます。

クラスター設定は動的に設定できますが、いくつかの制限があります。再構成もRaftに依存しているため、クラスターからノードを追加/削除するにはクォーラムが必要です。同時にあまりにも多くのノードを失い、再起動する可能性がない場合、Raftは動作を停止し、従来の方法でクラスターを再構成することはできません。

それにもかかわらず、ClickHouse Keeperには、1つのノードのみでクラスターを強制的に再構成できる回復モードがあります。
これは、ノードを再起動できない場合、または同じエンドポイントで新しいインスタンスを起動できない場合の最後の手段としてのみ実行する必要があります。

続行する前に注意すべき重要なこと：
- 失敗したノードが再びクラスターに接続できないことを確認してください。
- 手順で指定されるまで、新しいノードを起動しないでください。

上記のことが真であることを確認した後、次のことを行う必要があります：
1. 新しいリーダーになる単一のKeeperノードを選択します。そのノードのデータがクラスター全体に使用されることに注意してください。したがって、最新の状態を持つノードを使用することをお勧めします。
2. 他のことをする前に、選択したノードの`log_storage_path`と`snapshot_storage_path`フォルダのバックアップを作成してください。
3. 使用したいすべてのノードでクラスターを再構成します。
4. 選択したノードに4文字コマンド`rcvr`を送信して、ノードを回復モードに移行するか、選択したノードのKeeperインスタンスを停止して`--force-recovery`引数で再起動します。
5. 1つずつ新しいノードでKeeperインスタンスを起動し、次のインスタンスを起動する前に`mntr`が`zk_server_state`に対して`follower`を返すことを確認します。
6. 回復モード中、リーダーノードは新しいノードとクォーラムを達成するまで`mntr`コマンドに対してエラーメッセージを返し、クライアントとフォロワーからのすべてのリクエストを拒否します。
7. クォーラムが達成された後、リーダーノードは通常の操作モードに戻り、Raftを使用してすべてのリクエストを受け入れます。`mntr`で確認します。これは`zk_server_state`に対して`leader`を返すはずです。

## Keeperでディスクを使用する {#using-disks-with-keeper}

Keeperは、スナップショット、ログファイル、状態ファイルを保存するための[外部ディスク](/operations/storing-data.md)のサブセットをサポートしています。

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

ログ用のディスクを使用するには、`keeper_server.log_storage_disk`設定をディスクの名前に設定する必要があります。
スナップショット用のディスクを使用するには、`keeper_server.snapshot_storage_disk`設定をディスクの名前に設定する必要があります。
さらに、最新のログまたはスナップショット用に異なるディスクを使用するには、それぞれ`keeper_server.latest_log_storage_disk`と`keeper_server.latest_snapshot_storage_disk`を使用します。
その場合、新しいログまたはスナップショットが作成されると、Keeperは自動的にファイルを正しいディスクに移動します。
状態ファイル用のディスクを使用するには、`keeper_server.state_storage_disk`設定をディスクの名前に設定する必要があります。

ディスク間でのファイルの移動は安全で、Keeperが転送の途中で停止してもデータを失うリスクはありません。
ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されません。

`keeper_server.coordination_settings.force_sync`が`true`（デフォルトで`true`）に設定されたKeeperは、すべての種類のディスクに対していくつかの保証を満たすことができません。
現在、`local`タイプのディスクのみが永続的な同期をサポートしています。
`force_sync`が使用されている場合、`latest_log_storage_disk`が使用されていない場合は、`log_storage_disk`は`local`ディスクである必要があります。
`latest_log_storage_disk`が使用されている場合は、常に`local`ディスクである必要があります。
`force_sync`が無効の場合、すべてのタイプのディスクを任意の設定で使用できます。

Keeperインスタンスの可能なストレージ設定は次のようになります：

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

このインスタンスは、最新のログを除くすべてのログを`log_s3_plain`ディスクに保存し、最新のログは`log_local`ディスクにあります。
スナップショットにも同じロジックが適用され、最新のスナップショットを除くすべてのスナップショットは`snapshot_s3_plain`に保存され、最新のスナップショットは`snapshot_local`ディスクにあります。

### ディスク設定の変更 {#changing-disk-setup}

:::important
新しいディスク設定を適用する前に、すべてのKeeperログとスナップショットを手動でバックアップしてください。
:::

階層化されたディスク設定が定義されている場合（最新のファイル用に別々のディスクを使用）、Keeperは起動時にファイルを正しいディスクに自動的に移動しようとします。
以前と同じ保証が適用されます。ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されないため、複数回の再起動を安全に行うことができます。

ファイルを完全に新しいディスクに移動する必要がある場合（または2ディスク設定から単一ディスク設定に移動する場合）、`keeper_server.old_snapshot_storage_disk`と`keeper_server.old_log_storage_disk`の複数の定義を使用できます。

次の設定は、以前の2ディスク設定から完全に新しい単一ディスク設定に移動する方法を示しています：

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

## ログキャッシュの設定 {#configuring-logs-cache}

ディスクから読み取るデータ量を最小化するために、Keeperはログエントリをメモリにキャッシュします。
リクエストが大きい場合、ログエントリはあまりにも多くのメモリを消費するため、キャッシュされるログの量は上限が設定されています。
制限は次の2つの設定で制御されます：
- `latest_logs_cache_size_threshold` - キャッシュに保存される最新ログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要がある連続したログの合計サイズ

デフォルト値が大きすぎる場合は、これら2つの設定を減らすことでメモリ使用量を削減できます。

:::note
`pfev`コマンドを使用して、各キャッシュとファイルから読み取られたログの量を確認できます。
Prometheusエンドポイントからのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。
:::

## Prometheus {#prometheus}

Keeperは、[Prometheus](https://prometheus.io)サーバーによるスクレイピングのためにメトリクスデータを公開できます。

設定：

- `endpoint` – PrometheusサーバーがメトリクスをスクレイピングするためのHTTPエンドポイント。'/'から始まります。
- `port` – `endpoint`のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開するように設定するフラグ。
- `events` – [system.events](/operations/system-tables/events)テーブルからメトリクスを公開するように設定するフラグ。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開するように設定するフラグ。

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

確認してください（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください）：
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloudの[Prometheus統合](/integrations/prometheus)も参照してください。

## ClickHouse Keeperユーザーガイド {#clickhouse-keeper-user-guide}

このガイドは、ClickHouse Keeperを設定するためのシンプルで最小限の設定を提供し、分散操作をテストする方法の例を示します。この例は、Linux上の3つのノードを使用して実行されます。

### 1. Keeper設定でノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト（`chnode1`、`chnode2`、`chnode3`）に3つのClickHouseインスタンスをインストールします。（ClickHouseのインストールの詳細については、[クイックスタート](/getting-started/install/install.mdx)を参照してください。）

2. 各ノードで、ネットワークインターフェースを介した外部通信を許可するために次のエントリを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 各サーバーの`<server_id>`設定を更新して、次のClickHouse Keeper設定を3つのサーバーすべてに追加します。`chnode1`の場合は`1`、`chnode2`の場合は`2`などです。
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

    これらは上記で使用されている基本設定です：

    |パラメータ |説明                   |例              |
    |----------|------------------------------|---------------------|
    |tcp_port   |keeperのクライアントが使用するポート|9181 デフォルト、zookeeperの2181と同等|
    |server_id| raft設定で使用される各ClickHouse Keeperサーバーの識別子| 1|
    |coordination_settings| タイムアウトなどのパラメータのセクション| タイムアウト: 10000、ログレベル: trace|
    |server    |参加するサーバーの定義|各サーバー定義のリスト|
    |raft_configuration| keeperクラスター内の各サーバーの設定| 各サーバーとその設定|
    |id      |keeperサービスのサーバーの数値ID|1|
    |hostname   |keeperクラスター内の各サーバーのホスト名、IP、またはFQDN|`chnode1.domain.com`|
    |port|サーバー間keeper接続をリッスンするポート|9234|

4.  Zookeeperコンポーネントを有効にします。ClickHouse Keeperエンジンを使用します：
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

    これらは上記で使用されている基本設定です：

    |パラメータ |説明                   |例              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper接続用のノードのリスト|各サーバーの設定エントリ|
    |host|各ClickHouse keeperノードのホスト名、IP、またはFQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeperクライアントポート| 9181|

5. ClickHouseを再起動し、各Keeperインスタンスが実行されていることを確認します。各サーバーで次のコマンドを実行します。`ruok`コマンドは、Keeperが実行されており、健全な場合は`imok`を返します：
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system`データベースには、ClickHouse Keeperインスタンスの詳細を含む`zookeeper`という名前のテーブルがあります。テーブルを表示してみましょう：
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

### 2.  ClickHouseでクラスターを設定する {#2--configure-a-cluster-in-clickhouse}

1. 2つのノードに2つのシャードと1つのレプリカのみを持つシンプルなクラスターを設定しましょう。3番目のノードは、ClickHouse Keeperの要件のためのクォーラムを達成するために使用されます。`chnode1`と`chnode2`の設定を更新します。次のクラスターは、各ノードに1つのシャードを定義し、レプリケーションなしで合計2つのシャードを定義します。この例では、データの一部がノードに、一部が他のノードにあります：
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
    |host|レプリカシャードをホストするサーバーのホスト名、IP、またはFQDN|`chnode1.domain.com`|
    |port|ネイティブtcpプロトコルを使用して通信するために使用されるポート|9000|
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

### 3. 分散テーブルの作成とテスト {#3-create-and-test-distributed-table}

1.  `chnode1`でClickHouseクライアントを使用して、新しいクラスターに新しいデータベースを作成します。`ON CLUSTER`句は両方のノードでデータベースを自動的に作成します。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1`データベースに新しいテーブルを作成します。もう一度、`ON CLUSTER`は両方のノードでテーブルを作成します。
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
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

4. `chnode2`ノードでいくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで`SELECT`文を実行すると、そのノードのデータのみが表示されることに注意してください。たとえば、`chnode1`で：
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

6. 2つのシャードのデータを表す`Distributed`テーブルを作成できます。`Distributed`テーブルエンジンを持つテーブルは独自のデータを保存しませんが、複数のサーバーで分散クエリ処理を可能にします。読み取りはすべてのシャードにヒットし、書き込みはシャード全体に分散できます。`chnode1`で次のクエリを実行します：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table`をクエリすると、2つのシャードからの4行のデータすべてが返されることに注意してください：
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

このガイドは、ClickHouse Keeperを使用してクラスターをセットアップする方法を示しました。ClickHouse Keeperを使用すると、クラスターを設定し、シャード全体でレプリケートできる分散テーブルを定義できます。

## ユニークパスでClickHouse Keeperを設定する {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 説明 {#description}

この記事では、組み込みの`{uuid}`マクロ設定を使用して、ClickHouse KeeperまたはZooKeeperでユニークなエントリを作成する方法について説明します。ユニークパスは、頻繁にテーブルを作成および削除する場合に役立ちます。これは、Keeperガベージコレクションがパスエントリを削除するために数分待つ必要がないためです。パスが作成されるたびに新しい`uuid`が使用されるため、パスは再利用されません。

### 環境例 {#example-environment}
3つすべてのノードでClickHouse Keeperを設定し、ノードの2つでClickHouseを設定する3ノードクラスター。これにより、ClickHouse Keeperに3つのノード（タイブレーカーノードを含む）と、2つのレプリカで構成される単一のClickHouseシャードが提供されます。

|node|description|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスター`cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeperタイブレーカーノード|

クラスターの設定例：
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

### `{uuid}`を使用するようにテーブルをセットアップする手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定する
サーバー1の例：
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
`shard`と`replica`のマクロを定義しますが、`{uuid}`はここで定義する必要はありません。組み込みであり、定義する必要はありません。
:::

2. データベースを作成する

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

3. マクロと`{uuid}`を使用してクラスターにテーブルを作成する

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

4.  分散テーブルを作成する

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
1.  最初のノードにデータを挿入する（例：`chnode1`）
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

2. 2番目のノードにデータを挿入する（例：`chnode2`）
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

3. 分散テーブルを使用してレコードを表示する
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
デフォルトのレプリケーションパスは、マクロと`{uuid}`を使用して事前に定義できます

1. 各ノードでテーブルのデフォルトを設定する
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
ノードが特定のデータベースに使用される場合は、マクロ`{database}`を各ノードで定義することもできます。
:::

2. 明示的なパラメータなしでテーブルを作成する：
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

3. デフォルト設定で使用された設定を使用したことを確認する
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

1 row in set. Elapsed: 0.003 sec.
```

### トラブルシューティング {#troubleshooting}

テーブル情報とUUIDを取得するコマンドの例：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDを使用してzookeeper内のテーブルに関する情報を取得するコマンドの例
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは`Atomic`である必要があります。以前のバージョンからアップグレードした場合、
`default`データベースはおそらく`Ordinary`タイプです。
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

## ClickHouse Keeper動的再構成 {#reconfiguration}

<SelfManaged />

### 説明 {#description-1}

ClickHouse Keeperは、`keeper_server.enable_reconfiguration`がオンになっている場合、動的クラスター再構成用のZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)コマンドを部分的にサポートします。

:::note
この設定がオフになっている場合は、レプリカの`raft_configuration`セクションを手動で変更することでクラスターを再構成できます。すべてのレプリカでファイルを編集してください。リーダーのみが変更を適用します。
あるいは、ZooKeeper互換クライアントを介して`reconfig`クエリを送信することもできます。
:::

仮想ノード`/keeper/config`には、次の形式で最後にコミットされたクラスター設定が含まれています：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリは改行で区切られます。
- `server_type`は`participant`または`learner`（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)はリーダー選出に参加しません）のいずれかです。
- `server_priority`は[リーダー選出でどのノードを優先すべきかを示す](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)非負の整数です。
  優先度0はサーバーが決してリーダーにならないことを意味します。

例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

`reconfig`コマンドを使用して新しいサーバーを追加したり、既存のサーバーを削除したり、既存のサーバーの優先度を変更したりできます。以下は例です（`clickhouse-keeper-client`を使用）：

```bash
# 2つの新しいサーバーを追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# 2つの他のサーバーを削除
reconfig remove "3,4"
# 既存のサーバーの優先度を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

そして、`kazoo`の例は次のとおりです：

```python
# 2つの新しいサーバーを追加し、2つの他のサーバーを削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")

# 既存のサーバーの優先度を8に変更
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`内のサーバーは、上記で説明したサーバー形式である必要があります。サーバーエントリはカンマで区切る必要があります。
新しいサーバーを追加する際、`server_priority`（デフォルト値は1）と`server_type`（デフォルト値は`participant`）を省略できます。

既存のサーバーの優先度を変更したい場合は、ターゲット優先度で`joining`に追加します。
サーバーのホスト、ポート、タイプは既存のサーバー設定と等しくなければなりません。

サーバーは`joining`と`leaving`の出現順に追加および削除されます。
`joining`からのすべての更新は、`leaving`からの更新の前に処理されます。

Keeper再構成実装にはいくつかの注意事項があります：

- 増分再構成のみがサポートされています。空でない`new_members`を持つリクエストは拒否されます。

  ClickHouse Keeper実装は、メンバーシップを動的に変更するためにNuRaft APIに依存しています。NuRaftには、単一のサーバーを追加または削除する方法があり、一度に1つずつです。これは、設定への各変更（`joining`の各部分、`leaving`の各部分）が個別に決定されなければならないことを意味します。したがって、エンドユーザーにとって誤解を招く可能性があるため、バルク再構成は利用できません。

  サーバータイプ（participant/learner）の変更もNuRaftでサポートされていないため不可能であり、唯一の方法はサーバーを削除して追加することであり、これも誤解を招く可能性があります。

- 返された`znodestat`値は使用できません。
- `from_version`フィールドは使用されません。`from_version`が設定されたすべてのリクエストは拒否されます。
  これは、`/keeper/config`が仮想ノードであり、永続ストレージに保存されるのではなく、すべてのリクエストに対して指定されたノード設定でその場で生成されるという事実によるものです。
  この決定は、NuRaftがすでにこの設定を保存しているため、データを重複させないために行われました。
- ZooKeeperとは異なり、`sync`コマンドを送信することでクラスター再構成を待機する方法はありません。
  新しい設定は_最終的に_適用されますが、時間保証はありません。
- `reconfig`コマンドはさまざまな理由で失敗する可能性があります。クラスターの状態を確認して、更新が適用されたかどうかを確認できます。

## 単一ノードのkeeperをクラスターに変換する {#converting-a-single-node-keeper-into-a-cluster}

場合によっては、実験的なkeeperノードをクラスターに拡張する必要があります。ここに、3ノードクラスターでこれを段階的に行う方法のスキームがあります：

- **重要**：新しいノードは現在のクォーラムよりも少ないバッチで追加する必要があります。そうでないと、それら自身の間でリーダーを選出します。この例では1つずつです。
- 既存のkeeperノードは、`keeper_server.enable_reconfiguration`設定パラメータをオンにする必要があります。
- 新しいkeeperクラスターの完全な新しい設定で2番目のノードを起動します。
- 起動したら、[`reconfig`](#reconfiguration)を使用してノード1に追加します。
- 次に、3番目のノードを起動し、[`reconfig`](#reconfiguration)を使用して追加します。
- そこに新しいkeeperノードを追加して`clickhouse-server`設定を更新し、再起動して変更を適用します。
- ノード1のraft設定を更新し、オプションで再起動します。

プロセスに自信を持つために、[サンドボックスリポジトリ](https://github.com/ClickHouse/keeper-extend-cluster)があります。

## サポートされていない機能 {#unsupported-features}

ClickHouse KeeperはZooKeeperと完全に互換性があることを目指していますが、現在実装されていない機能がいくつかあります（ただし、開発は継続中です）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は`Stat`オブジェクトの返却をサポートしていません
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は[TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)をサポートしていません
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode))は[`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT)ウォッチでは動作しません
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean))と[`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean))はサポートされていません
- `setWatches`はサポートされていません
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html)タイプのznodesの作成はサポートされていません
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)はサポートされていません
