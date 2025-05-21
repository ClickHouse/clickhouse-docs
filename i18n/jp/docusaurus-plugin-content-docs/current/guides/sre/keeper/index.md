---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'ClickHouse Keeperの設定'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（clickhouse-keeper）はZooKeeperに代わり、レプリケーションと調整機能を提供します。'
title: 'ClickHouse Keeper'
---

# ClickHouse Keeper (clickhouse-keeper)

import SelfManaged from '@site/docs/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeperは、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)と[分散DDL](/sql-reference/distributed-ddl.md)クエリ実行のための調整システムを提供します。ClickHouse KeeperはZooKeeperと互換性があります。
### 実装の詳細 {#implementation-details}

ZooKeeperは、最初に知られたオープンソースの調整システムの1つです。Javaで実装されており、非常にシンプルで強力なデータモデルを持っています。ZooKeeperの調整アルゴリズムであるZooKeeper Atomic Broadcast (ZAB)は、各ZooKeeperノードがローカルで読み取りを行うため、読み取りに対して線形性の保証を提供しません。ZooKeeperとは異なり、ClickHouse KeeperはC++で書かれており、[RAFTアルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは、読み取りと書き込みの線形性を可能にし、さまざまな言語でのオープンソースの実装があります。

デフォルトでは、ClickHouse KeeperはZooKeeperと同じ保証を提供します：線形整合性のある書き込みと非線形整合性のある読み取りです。互換性のあるクライアントサーバープロトコルを持っているため、標準のZooKeeperクライアントを使用してClickHouse Keeperと対話できます。スナップショットとログはZooKeeperと互換性のないフォーマットですが、`clickhouse-keeper-converter`ツールにより、ZooKeeperデータをClickHouse Keeperのスナップショットに変換できます。ClickHouse KeeperのインターネットプロトコルもZooKeeperと互換性がないため、混合ZooKeeper / ClickHouse Keeperクラスタは不可能です。

ClickHouse Keeperは、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)と同じ方法でアクセス制御リスト (ACL) をサポートしています。ClickHouse Keeperは、同じ権限セットをサポートし、同一の組み込みスキームを持っています：`world`、`auth`、および`digest`。digest認証スキームは`username:password`のペアを使用し、パスワードはBase64でエンコードされます。

:::note
外部統合はサポートされていません。
:::
### 設定 {#configuration}

ClickHouse Keeperは、ZooKeeperのスタンドアロンの置き換えとして使用することも、ClickHouseサーバーの内部部分として使用することもできます。どちらの場合も、設定はほぼ同じ`.xml`ファイルです。
#### Keeper設定パラメータ {#keeper-configuration-settings}

主なClickHouse Keeper設定タグは`<keeper_server>`で、以下のパラメータがあります：

| パラメータ                           | 説明                                                                                                                                                                                                                                         | デフォルト                                                                                                   |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                          | `2181`                                                                                                      |
| `tcp_port_secure`                    | クライアントとkeeper-server間のSSL接続のためのセキュアポート。                                                                                                                                                                              | -                                                                                                           |
| `server_id`                          | ユニークなサーバーID。ClickHouse Keeperクラスターの各参加者はユニークな番号（1, 2, 3 など）を持つ必要があります。                                                                                                              | -                                                                                                           |
| `log_storage_path`                   | 調整ログのパス。ZooKeeperのように、ログは非忙ノードに保存するのが最適です。                                                                                                                                                                | -                                                                                                           |
| `snapshot_storage_path`              | 調整スナップショットのパス。                                                                                                                                                                                                                 | -                                                                                                           |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration)を介して動的クラスター再構成を有効にする。                                                                                                                                                                             | `False`                                                                                                     |
| `max_memory_usage_soft_limit`        | Keeperの最大メモリ使用量のソフトリミット（バイト）。                                                                                                                                                                                        | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                              |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit`が未設定またはゼロに設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                | `0.9`                                                                                                       |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit`が未設定または`0`に設定されている場合、この間隔で物理メモリの量を観察します。メモリ量が変更されると、`max_memory_usage_soft_limit_ratio`によってKeeperのメモリソフトリミットを再計算します。 | `15`                                                                                                        |
| `http_control`                       | [HTTP制御](#http-control)インターフェースの構成。                                                                                                                                                                                         | -                                                                                                           |
| `digest_enabled`                     | リアルタイムデータ整合性チェックを有効にする。                                                                                                                                                                                            | `True`                                                                                                      |
| `create_snapshot_on_exit`            | シャットダウン中にスナップショットを作成する。                                                                                                                                                                                              | -                                                                                                           |
| `hostname_checks_enabled`            | クラスター設定のためのホスト名の健全性チェックを有効にする（例：ローカルホストがリモートエンドポイントとともに使用されている場合）。                                                                                                           | `True`                                                                                                      |
| `four_letter_word_white_list`        | 4lwコマンドのホワイトリスト。                                                                                                                                                                                                                | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |

他の一般的なパラメータはClickHouseサーバーの設定から継承されます（`listen_host`、`logger`など）。
#### 内部調整設定 {#internal-coordination-settings}

内部調整設定は`<keeper_server>.<coordination_settings>`セクションにあり、以下のパラメータを持っています：

| パラメータ                          | 説明                                                                                                                                                                                                              | デフォルト                                                                                                   |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一クライアント操作のタイムアウト（ms）。                                                                                                                                                                         | `10000`                                                                                                     |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト（ms）。                                                                                                                                                                     | `10000`                                                                                                     |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト（ms）。                                                                                                                                                                     | `100000`                                                                                                    |
| `dead_session_check_period_ms`     | ClickHouse Keeperが死んだセッションをチェックして削除する頻度（ms）。                                                                                                                                                 | `500`                                                                                                       |
| `heart_beat_interval_ms`           | ClickHouse Keeperのリーダーがフォロワーにハートビートを送信する頻度（ms）。                                                                                                                                          | `500`                                                                                                       |
| `election_timeout_lower_bound_ms`  | フォロワーがこの間隔内にリーダーからハートビートを受け取らない場合、リーダー選出を開始できます。`election_timeout_upper_bound_ms`以下である必要があります。理想的には同じであってはいけません。                                | `1000`                                                                                                      |
| `election_timeout_upper_bound_ms`  | フォロワーがこの間隔内にリーダーからハートビートを受け取らない場合、リーダー選出を強制的に行わなければなりません。                                                                                                    | `2000`                                                                                                      |
| `rotate_log_storage_interval`      | 単一ファイルに保持するログ記録の数。                                                                                                                                                                               | `100000`                                                                                                    |
| `reserved_log_items`               | コンパクション前に保存する調整ログ記録の数。                                                                                                                                                                         | `100000`                                                                                                    |
| `snapshot_distance`                | ClickHouse Keeperが新しいスナップショットを作成する間隔（ログ内の記録数）。                                                                                                                                                 | `100000`                                                                                                    |
| `snapshots_to_keep`                | 保存するスナップショットの数。                                                                                                                                                                                        | `3`                                                                                                         |
| `stale_log_gap`                    | リーダーがフォロワーを古くなったとみなし、ログの代わりにスナップショットを送信するしきい値。                                                                                                                                 | `10000`                                                                                                     |
| `fresh_log_gap`                    | ノードが新しい状態になったとき。                                                                                                                                                                                      | `200`                                                                                                       |
| `max_requests_batch_size`          | RAFTに送信される前のリクエストの最大数。                                                                                                                                                                               | `100`                                                                                                       |
| `force_sync`                       | 調整ログに書き込むたびに`fsync`を呼び出す。                                                                                                                                                                          | `true`                                                                                                      |
| `quorum_reads`                     | 読み取り要求を全体のRAFTコンセンサスとして書き込みとして実行し、同様の速度で行います。                                                                                                                                 | `false`                                                                                                     |
| `raft_logs_level`                  | 調整に関するテキストログレベル（トレース、デバッグなど）。                                                                                                                                                                | `system default`                                                                                            |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込み要求の転送を許可します。                                                                                                                                                             | `true`                                                                                                      |
| `shutdown_timeout`                 | 内部接続が終了し、シャットダウンするまで待機します（ms）。                                                                                                                                                             | `5000`                                                                                                      |
| `startup_timeout`                  | サーバーが指定されたタイムアウト内に他のクォーラム参加者に接続できない場合、終了します（ms）。                                                                                                                               | `30000`                                                                                                     |
| `async_replication`                | 非同期レプリケーションを有効にする。すべての書き込みおよび読み取りの保証が保持されながら、パフォーマンスが改善されます。設定はデフォルトで無効になっており、互換性を壊さないようにします。                                                     | `false`                                                                                                     |
| `latest_logs_cache_size_threshold` | 最新のログエントリのインメモリキャッシュの最大サイズ。                                                                                                                                                                  | `1GiB`                                                                                                      |
| `commit_logs_cache_size_threshold` | コミットに必要なログエントリのインメモリキャッシュの最大サイズ。                                                                                                                                                          | `500MiB`                                                                                                    |
| `disk_move_retries_wait_ms`        | ファイルをディスク間で移動中にエラーが発生した場合の再試行間の待機時間。                                                                                                                                                     | `1000`                                                                                                      |
| `disk_move_retries_during_init`    | 初期化中にファイルをディスク間で移動中にエラーが発生した場合の再試行回数。                                                                                                                                                  | `100`                                                                                                       |
| `experimental_use_rocksdb`         | バックエンドストレージとしてrocksdbを使用。                                                                                                                                                                            | `0`                                                                                                         |

クォーラム設定は`<keeper_server>.<raft_configuration>`セクションにあり、サーバーの説明が含まれています。

クォーラム全体の唯一のパラメータは`secure`で、これはクォーラム参加者間の通信のための暗号化された接続を有効にします。このパラメータは、ノード間の内部通信にSSL接続が必要な場合に`true`に設定し、そうでない場合は指定しないことができます。

各`<server>`の主なパラメータは次のとおりです：

- `id` — クォーラム内のサーバー識別子。
- `hostname` — このサーバーが配置されているホスト名。
- `port` — このサーバーが接続を待ち受けるポート。
- `can_become_leader` — サーバーを`learner`として設定するには`false`に設定します。省略した場合、値は`true`です。

:::note
ClickHouse Keeperクラスターのトポロジーに変更があった場合（例：サーバーの交換）、`server_id`と`hostname`のマッピングが一貫していることを確認し、既存の`server_id`を異なるサーバーに再利用したり、シャッフルしたりしないようにしてください（自動化スクリプトに依存してClickHouse Keeperを展開する場合など、これが発生する可能性があります）。

Keeperインスタンスのホストが変更可能な場合は、生のIPアドレスの代わりにホスト名を定義して使用することをお勧めします。ホスト名を変更することは、サーバーを削除して再追加することに等しく、場合によっては不可能なことがあります（例：クォーラムのために十分なKeeperインスタンスがない場合）。
:::

:::note
`async_replication`は、互換性を壊さないようにデフォルトで無効になっています。クラスター内のすべてのKeeperインスタンスが`async_replication`（v23.9+）をサポートするバージョンで実行されている場合は、それを有効にすることをお勧めします。そうすることで、デメリットなしにパフォーマンスが向上します。
:::

三ノードのクォーラムの設定例は、`test_keeper_`プレフィックスが付いた[統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration)で見つけることができます。サーバー#1の設定例：

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

ClickHouse KeeperはClickHouseサーバーパッケージにバンドルされており、`<keeper_server>`の設定を`/etc/your_path_to_config/clickhouse-server/config.xml`に追加し、いつも通りにClickHouseサーバーを起動するだけです。スタンドアロンのClickHouse Keeperを実行する場合は、次のように類似の方法で起動できます：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は、作成するか、`clickhouse`に対して`keeper`を引数として指定できます：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
```
```yaml
title: '4文字のコマンド'
sidebar_label: '4文字のコマンド'
keywords: ['ClickHouse', 'Keeper', '4lw', 'コマンド']
description: 'ClickHouse Keeper における 4文字のコマンドに関する詳細な説明。'
```

### 四文字のコマンド {#four-letter-word-commands}

ClickHouse Keeperは、Zookeeperとほぼ同じ4文字のコマンドを提供します。各コマンドは、`mntr`、`stat`などの4文字で構成されています。興味深いコマンドもいくつかあり、`stat`はサーバーと接続されたクライアントに関する一般的な情報を提供し、`srvr`と`cons`はそれぞれサーバーと接続に関する詳細情報を提供します。

4lwコマンドにはホワイトリスト設定 `four_letter_word_white_list` があり、デフォルト値は`conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld`です。

クライアントポートを介して、telnetまたはncを使用してClickHouse Keeperにコマンドを発行することができます。

```bash
echo mntr | nc localhost 9181
```

以下は詳細な4lwコマンドです：

- `ruok`: サーバーがエラーステートでなく動作しているかどうかをテストします。サーバーが動作している場合、`imok`と応答します。それ以外の場合、全く応答しません。`imok` の応答は、サーバーが過半数に参加していることを必ずしも示すわけではなく、サーバープロセスがアクティブで、指定されたクライアントポートにバインドされていることを示します。過半数およびクライアント接続情報に関する詳細は、"stat" を使用してください。

```response
imok
```

- `mntr`: クラスターの健康を監視するために使用できる変数のリストを出力します。

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

- `srvr`: サーバーの詳細をフルにリストします。

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

- `stat`: サーバーと接続されたクライアントの簡単な詳細をリストします。

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

- `srst`: サーバーの統計をリセットします。このコマンドは、`srvr`、`mntr`、および `stat` の結果に影響を及ぼします。

```response
Server stats reset.
```

- `conf`: サービング設定の詳細を印刷します。

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

- `cons`: このサーバーに接続されているすべてのクライアントの接続/セッションの詳細をリストします。受信/送信されたパケットの数、セッションID、操作遅延、最後に実行された操作などの情報を含みます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: すべての接続に対する接続/セッションの統計をリセットします。

```response
Connection stats reset.
```

- `envi`: サービング環境の詳細を印刷します。

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

- `isro`: サーバーが読み取り専用モードで動作しているかどうかをテストします。サーバーが読み取り専用モードの場合、`ro` と応答し、そうでない場合は `rw` と応答します。

```response
rw
```

- `wchs`: サーバーのウォッチに関する簡単な情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: セッションごとのサーバーのウォッチに関する詳細な情報をリストします。これは、関連するウォッチ（パス）を持つセッション（接続）のリストを出力します。この操作は、ウォッチの数に応じて高コストになる可能性があるため、注意して使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: パスごとのサーバーのウォッチに関する詳細な情報をリストします。これは、関連するセッションを持つパス（znodes）のリストを出力します。この操作も、ウォッチの数に応じて高コストになる可能性があるため、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

- `dump`: 未解決のセッションおよびエフェメラルノードをリストします。これはリーダーでのみ機能します。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

- `csnp`: スナップショット作成タスクをスケジュールします。成功した場合は、スケジュールされたスナップショットの最後にコミットされたログインデックスを返し、失敗した場合は `Failed to schedule snapshot creation task.` と返します。`lgif` コマンドを使用してスナップショットが完了しているかどうかを確認できます。

```response
100
```

- `lgif`: Keeperログ情報。`first_log_idx`: ログストアにおける最初のログインデックス; `first_log_term`: 最初のログターム; `last_log_idx`: ログストアにおける最後のログインデックス; `last_log_term`: 最後のログターム; `last_committed_log_idx`: ステートマシンにおける最後のコミットされたログインデックス; `leader_committed_log_idx`: マイ・パースペクティブから見たリーダーのコミットされたログインデックス; `target_committed_log_idx`: コミットすべきターゲットログインデックス; `last_snapshot_idx`: 最後のスナップショットにおける最大コミットされたログインデックス。

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

- `rqld`: 新しいリーダーになるリクエストを送信します。リクエストが送信された場合は `Sent leadership request to leader.` と返し、リクエストが送信されなかった場合は `Failed to send leadership request to leader.` と返します。既にノードがリーダーであった場合、結果はリクエストが送信された場合と同じです。

```response
Sent leadership request to leader.
```

- `ftfl`: すべての機能フラグとKeeperインスタンスでそれらが有効になっているかどうかをリストします。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: リーダーシップを放棄し、フォロワーになるリクエストを送信します。このリクエストを受信したサーバーがリーダーである場合、まず書き込み操作を一時停止し、後続（現在のリーダーは後続にはなれません）が最新のログのキャッチアップを終了するのを待ってから辞任します。後続は自動的に選ばれます。リクエストが送信された場合は `Sent yield leadership request to leader.` と返し、リクエストが送信されなかった場合は `Failed to send yield leadership request to leader.` と返します。既にノードがフォロワーである場合、結果はリクエストが送信された場合と同じです。

```response
Sent yield leadership request to leader.
```

- `pfev`: すべての収集されたイベントの値を返します。各イベントについて、イベント名、イベント値、およびイベントの説明を返します。

```response
FileOpen        62      開かれたファイルの数。
Seek    4       'lseek' 関数が呼び出された回数。
ReadBufferFromFileDescriptorRead        126     ファイル記述子からの読み取り（read/pread）の回数。ソケットを含みません。
ReadBufferFromFileDescriptorReadFailed  0       ファイル記述子からの読み取り（read/pread）が失敗した回数。
ReadBufferFromFileDescriptorReadBytes   178846  ファイル記述子から読み取られたバイト数。ファイルが圧縮されている場合、これは圧縮データサイズを示します。
WriteBufferFromFileDescriptorWrite      7       ファイル記述子への書き込み（write/pwrite）の回数。ソケットを含みません。
WriteBufferFromFileDescriptorWriteFailed        0       ファイル記述子への書き込み（write/pwrite）が失敗した回数。
WriteBufferFromFileDescriptorWriteBytes 153     ファイル記述子に書き込まれたバイト数。ファイルが圧縮されている場合、これは圧縮データサイズを示します。
FileSync        2       ファイルに対して F_FULLFSYNC/fsync/fdatasync 関数が呼び出された回数。
DirectorySync   0       ディレクトリに対して F_FULLFSYNC/fsync/fdatasync 関数が呼び出された回数。
FileSyncElapsedMicroseconds     12756   ファイルに対して F_FULLFSYNC/fsync/fdatasync システムコールを待って過ごした合計時間。
DirectorySyncElapsedMicroseconds        0       ディレクトリに対して F_FULLFSYNC/fsync/fdatasync システムコールを待って過ごした合計時間。
ReadCompressedBytes     0       圧縮ソース（ファイル、ネットワーク）から読み取られたバイト数（圧縮前のバイト数）。
CompressedReadBufferBlocks      0       圧縮ソース（ファイル、ネットワーク）から読み取られた圧縮されたブロック（相互に圧縮されたデータのブロック）の数。
CompressedReadBufferBytes       0       圧縮ソース（ファイル、ネットワーク）から読み取られた非圧縮バイト数（圧縮後のバイト数）。
AIOWrite        0       Linux または FreeBSD AIO インターフェースでの書き込みの数。
AIOWriteBytes   0       Linux または FreeBSD AIO インターフェースでの書き込みバイト数。
...
```

### HTTP制御 {#http-control}

ClickHouse Keeperは、レプリカがトラフィックを受信する準備ができているかどうかを確認するためのHTTPインターフェースを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes)のようなクラウド環境で使用できます。

`/ready` エンドポイントを有効にする配置の例：

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

KeeperはZooKeeperおよびそのクライアントと完全に互換性がありますが、ClickHouseクライアントが利用できるいくつかのユニークな機能とリクエストタイプも導入しています。
これらの機能は後方互換性のない変更を引き起こす可能性があり、そのため大部分はデフォルトで無効になっており、`keeper_server.feature_flags` 設定を使用して有効にできます。
すべての機能は明示的に無効にすることができます。
Keeperクラスターに新しい機能を有効にしたい場合は、まずその機能をサポートするバージョンにすべてのKeeperインスタンスを更新し、その後その機能を有効にすることをお勧めします。

`multi_read` を無効にして `check_not_exists` を有効にする機能フラグ設定の例：

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

- `multi_read` - 複数のリクエストを読み取るサポート。デフォルト: `1`
- `filtered_list` - ノードのタイプ（エフェメラルまたは永続）によって結果をフィルタリングするリストリクエストのサポート。デフォルト: `1`
- `check_not_exists` - ノードが存在しないことを保証する`CheckNotExists`リクエストのサポート。デフォルト: `0`
- `create_if_not_exists` - ノードが存在しない場合にノードを作成しようとする `CreateIfNotExists` リクエストのサポート。存在する場合は、変更は適用されず、`ZOK`が返されます。デフォルト: `0`
- `remove_recursive` - ノードとそのサブツリーを削除する `RemoveRecursive` リクエストのサポート。デフォルト: `0`

### ZooKeeperからの移行 {#migration-from-zookeeper}

ZooKeeperからClickHouse Keeperへのシームレスな移行は不可能です。ZooKeeperクラスターを停止し、データを変換し、ClickHouse Keeperを起動する必要があります。`clickhouse-keeper-converter` ツールを使用することで、ZooKeeperのログとスナップショットをClickHouse Keeperのスナップショットに変換できます。ただし、それはZooKeeper > 3.4でのみ機能します。移行の手順は以下の通りです：

1. すべてのZooKeeperノードを停止します。

2. 任意ですが推奨されます: ZooKeeperリーダーノードを見つけ、再起動して停止します。これにより、ZooKeeperは一貫したスナップショットを作成します。

3. リーダーで`clickhouse-keeper-converter`を実行します。例えば：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを、`keeper`が設定されたClickHouseサーバーノードにコピーするか、ZooKeeperの代わりにClickHouse Keeperを起動します。スナップショットはすべてのノードに持続する必要があります。さもなければ、空のノードはより早くなる可能性があり、そのうちの1つがリーダーになることができます。

:::note
`keeper-converter` ツールは、Keeperのスタンドアロンバイナリから利用できません。
ClickHouseをインストールしている場合、直接バイナリを使用できます：

```bash
clickhouse keeper-converter ...
```

それ以外の場合は、[バイナリをダウンロード](/getting-started/quick-start#download-the-binary)して、ClickHouseをインストールせずに上記のようにツールを実行できます。
:::

### 過半数を失った後の回復 {#recovering-after-losing-quorum}

ClickHouse KeeperはRaftを使用しているため、クラスターサイズに応じて一定数のノードクラッシュを許容できます。\
例えば、3ノードのクラスターであれば、1ノードだけがクラッシュしても正しく動作し続けます。

クラスター設定は動的に設定できますが、いくつかの制限があります。再構成はRaftに依存しているため、クラスターからノードを追加または削除するには過半数が必要です。複数のノードを同時に失い、再起動のチャンスがない場合、Raftは機能を停止し、従来の方法でクラスターの再構成を許可しません。

それでも、ClickHouse Keeperには、1ノードだけでクラスターを強制的に再構成するための回復モードがあります。これは、ノードを再起動できない場合、または同じエンドポイントで新しいインスタンスを開始する場合にのみ、最後の手段として行うべきです。

続行する前に注意すべき重要な点：
- 失敗したノードが再度クラスターに接続できないことを確認してください。
- 指示された手順のいずれかで新しいノードを開始しないでください。

上記のことが真実であることを確認した後、以下の手順を実行する必要があります：
1. 新しいリーダーとなるKeeperノードを1つ選択します。そのノードのデータがクラスター全体に使用されるため、最新の状態のノードを使用することをお勧めします。
2. 何かをする前に、選択したノードの`log_storage_path`および`snapshot_storage_path`フォルダーのバックアップを作成します。
3. 使用したいすべてのノードでクラスターを再構成します。
4. 選択したノードに `rcvr` という4文字のコマンドを送信し、そのノードを回復モードに移動させるか、選択したノードでKeeperインスタンスを停止し、`--force-recovery`引数を付けて再起動します。
5. 新しいノードのKeeperインスタンスを1つずつ起動し、`mntr`が`zk_server_state`に対して`follower`を返すことを確認してから次のノードを起動します。
6. 回復モード中、リーダーノードはクライアントとフォロワーからのリクエストを拒否し、`mntr`コマンドに対してエラーメッセージを返します。
7. 過半数が達成されると、リーダーノードは通常の操作モードに戻り、Raft-verifyを使用してすべてのリクエストを受け入れ、`mntr`は`zk_server_state`に対して`leader`を返す必要があります。

## Keeperでのディスクの使用 {#using-disks-with-keeper}

Keeperは、スナップショット、ログファイル、および状態ファイルを保存するために、[外部ディスク](/operations/storing-data.md)のサブセットをサポートしています。

サポートされているディスクの種類は以下の通りです：
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
スナップショット用にディスクを使用するには、`keeper_server.snapshot_storage_disk` 設定をディスクの名前に設定します。
さらに、最新のログまたはスナップショットにはそれぞれ `keeper_server.latest_log_storage_disk` と `keeper_server.latest_snapshot_storage_disk` を使用できます。
その場合、Keeperは新しいログまたはスナップショットが作成されると、自動的にファイルを正しいディスクに移動します。
状態ファイルのためにディスクを使用するには、`keeper_server.state_storage_disk` 設定をディスクの名前に設定します。

ディスク間でのファイル移動は安全であり、Keeperが移動中に停止してもデータを失うリスクはありません。
ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されません。

`keeper_server.coordination_settings.force_sync` が `true` (デフォルトで `true`) に設定されたKeeperは、すべてのディスクの種類の保証を満たすことができません。
現在のところ、`local`タイプのディスクのみが永続的な同期をサポートしています。
`force_sync` が使用される場合、`latest_log_storage_disk`が使用されていない場合は、`log_storage_disk`は`local`ディスクであるべきです。
`latest_log_storage_disk`が使用される場合、常に`local`ディスクである必要があります。
`force_sync`が無効にされている場合、すべてのディスクタイプは任意のセットアップで使用できます。

Keeperインスタンスの可能なストレージセットアップは次のようになります。

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

このインスタンスは、最新のログを除くすべてを `log_s3_plain` ディスクに保存し、最新のログは `log_local` ディスクに保存します。
スナップショットにも同様のロジックが適用され、最新のスナップショットを除くすべてが `snapshot_s3_plain` に保存され、最新のスナップショットは `snapshot_local` ディスクに保存されます。

### ディスク設定の変更 {#changing-disk-setup}

:::important
新しいディスク設定を適用する前に、すべてのKeeperログとスナップショットを手動でバックアップしてください。
:::

階層式のディスク設定が定義されている場合（最新のファイル用に別々のディスクを使用する場合）、Keeperは起動時に自動的にファイルを正しいディスクに移動しようとします。
以前と同様の保証が適用され、ファイルが新しいディスクに完全に移動されるまで、古いディスクからは削除されないため、複数回の再起動を安全に行うことができます。

完全に新しいディスクにファイルを移動する必要がある場合（または2つのディスクのセットアップから単一のディスクのセットアップに移動する場合）、`keeper_server.old_snapshot_storage_disk`と`keeper_server.old_log_storage_disk`の複数の定義を使用することができます。

次の設定は、以前の2ディスクセットアップから完全に新しい単一ディスクセットアップへの移行を示しています。

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

起動時に、すべてのログファイルが `log_local` と `log_s3_plain` から `log_local2` ディスクに移動されます。
また、すべてのスナップショットファイルが `snapshot_local` と `snapshot_s3_plain` から `snapshot_local2` ディスクに移動されます。

## ログキャッシュの設定 {#configuring-logs-cache}

ディスクから読み取るデータの量を最小限に抑えるために、Keeperはメモリにログエントリをキャッシュします。
リクエストが大きい場合、ログエントリはメモリを取りすぎるため、キャッシュされるログの量には上限が設けられています。
制限は、次の2つの設定で制御されます：
- `latest_logs_cache_size_threshold` - キャッシュに保存された最新のログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要のある後続ログの合計サイズ

デフォルト値が大きすぎる場合は、これらの2つの設定を減らすことでメモリ使用量を減らすことができます。

:::note
`pfev` コマンドを使用して、各キャッシュとファイルから読み取られたログの量を確認できます。
Prometheusエンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。
:::

## Prometheus {#prometheus}

Keeperは、[Prometheus](https://prometheus.io)からスクリーピングするためのメトリクスデータを公開できます。

設定：

- `endpoint` – PrometheusサーバーによるメトリクスのスクリーピングのためのHTTPエンドポイント。'/'で始まる。
- `port` – `endpoint`用のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開するフラグ。
- `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開するフラグ。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開するフラグ。

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

確認（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください）：
```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloudの[Prometheus統合](/integrations/prometheus)もご覧ください。
## ClickHouse Keeperユーザーガイド {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeperを構成するためのシンプルで最小限の設定と、分散操作をテストする方法の例を提供します。この例は、Linux上の3ノードを使用して実行されます。
### 1. Keeper設定でノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3つのホストに3つのClickHouseインスタンスをインストールします（`chnode1`、`chnode2`、`chnode3`）。 (ClickHouseのインストールに関する詳細は、[クイックスタート](/getting-started/install/install.mdx)を参照してください。)

2. 各ノードで、ネットワークインターフェースを介った外部通信を許可するために、次のエントリを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. 各サーバーに次のClickHouse Keeper設定を追加し、各サーバーの`<server_id>`設定を更新します; `chnode1` は `1`、`chnode2` は `2` になります。

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

    上記で使用された基本設定は次の通りです：

    | パラメーター | 説明 | 例 |
    |----------|------------------------------|---------------------|
    | tcp_port | keeperのクライアントが使用するポート | 2181のデフォルトに相当する9181 |
    | server_id | raft構成で使用する各ClickHouse Keeperサーバーの識別子 | 1 |
    | coordination_settings | タイムアウトなどのパラメーターのセクション | タイムアウト: 10000, ログレベル: trace |
    | server | 参加サーバーの定義 | 各サーバーの定義のリスト |
    | raft_configuration | Keeperクラスター内の各サーバーの設定 | 各サーバーに対する設定 |
    | id | keeperサービス用のサーバーの数値ID | 1 |
    | hostname | Keeperクラスター内の各サーバーのホスト名、IPまたはFQDN | `chnode1.domain.com` |
    | port | サーバー間のkeeper接続のために待機するポート | 9234 |

4. Zookeeperコンポーネントを有効にします。これにより、ClickHouse Keeperエンジンが使用されます：

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

    上記で使用された基本設定は次の通りです：

    | パラメーター | 説明 | 例 |
    |----------|------------------------------|---------------------|
    | node | ClickHouse Keeper接続用のノードのリスト | 各サーバーの設定エントリ |
    | host | 各ClickHouse keeperノードのホスト名、IPまたはFQDN | `chnode1.domain.com` |
    | port | ClickHouse Keeperのクライアントポート | 9181 |

5. ClickHouseを再起動し、各Keeperインスタンスが実行されていることを確認します。各サーバーで次のコマンドを実行します。`ruok` コマンドは、Keeperが動作していて健康である場合、`imok` を返します：

    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` データベースには `zookeeper` というテーブルがあり、ClickHouse Keeperインスタンスの詳細が含まれています。テーブルを見てみましょう：

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

1. 2つのシャードと2つのノード上の1つのレプリカを持つシンプルなクラスターを構成します。3つ目のノードは、ClickHouse Keeperの要件に対して過半数を達成するために使用されます。`chnode1`と`chnode2`の設定を更新します。次のクラスターは、レプリケーションなしで合計2つのシャードを持つ各ノードに1つのシャードを定義します。この例では、いくつかのデータがあるノードにあり、別のノードにあるデータもあります：
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
    |shard   |クラスター定義のレプリカリスト|各シャードのレプリカのリスト|
    |replica|各レプリカの設定リスト|各レプリカの設定エントリ|
    |host|レプリカシャードをホストするサーバーのホスト名、IP、またはFQDN|`chnode1.domain.com`|
    |port|ネイティブTCPプロトコルを使用して通信するために使用されるポート|9000|
    |user|クラスターインスタンスに対して認証に使用されるユーザー名|default|
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
### 3. 分散テーブルを作成してテストする {#3-create-and-test-distributed-table}

1. `chnode1`上のClickHouseクライアントを使用して、新しいクラスターに新しいデータベースを作成します。`ON CLUSTER`句は自動的に両方のノードにデータベースを作成します。
    ```sql
    CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
    ```

2. `db1`データベースに新しいテーブルを作成します。再び、`ON CLUSTER`は両方のノードにテーブルを作成します。
    ```sql
    CREATE TABLE db1.table1 ON CLUSTER 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1`ノードにいくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2`ノードにいくつかの行を追加します：
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで`SELECT`文を実行することで、そのノード上のデータのみが表示されることに注意してください。例えば、`chnode1`では：
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

    2行のセットに含まれています。経過時間: 0.006秒。
    ```

    `chnode2`では：
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

6. 2つのシャードのデータを表す`Distributed`テーブルを作成できます。`Distributed`テーブルエンジンを持つテーブルは独自のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りはすべてのシャードにヒットし、書き込みはシャード間で分散できます。次のクエリを`chnode1`で実行します：
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table`をクエリすると、2つのシャードからの4つの行すべてのデータが返されることに注意してください：
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

    4行のセットに含まれています。経過時間: 0.018秒。
    ```
### まとめ {#summary}

このガイドでは、ClickHouse Keeperを使用してクラスターを設定する方法を示しました。ClickHouse Keeperを使用すると、クラスターを構成し、シャード間でレプリケーションできる分散テーブルを定義できます。
## 一意のパスでClickHouse Keeperを構成する {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### 説明 {#description}

この記事では、内蔵の`{uuid}`マクロ設定を使用して、ClickHouse KeeperまたはZooKeeperで一意のエントリを作成する方法を説明します。一意のパスは、頻繁にテーブルを作成および削除する場合に役立ちます。これにより、パスを作成するたびに新しい`uuid`がそのパスに使用され、パスは再利用されないため、Keeperのガーベジコレクションがパスエントリを削除するために何分も待つ必要がなくなります。
### 環境の例 {#example-environment}
3ノードのクラスターが構成され、すべてのノードにClickHouse Keeper、2つのノードにClickHouseが配置されます。これにより、ClickHouse Keeperは3つのノード（過半数決定者ノードを含む）を持ち、2つのレプリカで構成された1つのClickHouseシャードが提供されます。

|ノード|説明|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスター `cluster_1S_2R`|
|`chnode3.marsnet.local`|ClickHouse Keeperのタイブレーカーノード|

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
### `{uuid}`を使用するためのテーブルの設定手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定します
サーバー1の例：
```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```
:::note
`shard`と`replica`のマクロを定義しますが、`{uuid}`はここで定義されていません。これは組み込みのものであり、定義する必要はありません。
:::

2. データベースを作成します

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

3. マクロと`{uuid}`を使用してクラスター上にテーブルを作成します

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
1. 最初のノード（例：`chnode1`）にデータを挿入します
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

1行のセットに含まれています。経過時間: 0.033秒。
```

2. 2番目のノード（例：`chnode2`）にデータを挿入します
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

1行のセットに含まれています。経過時間: 0.529秒。
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

2行のセットに含まれています。経過時間: 0.007秒。
```
### 代替案 {#alternatives}
デフォルトのレプリケーションパスは、マクロを事前に定義することで、`{uuid}`を使用して定義できます。

1. 各ノードでテーブルのデフォルトを設定します
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
ノードが特定のデータベースに使用される場合、各ノードでマクロ`{database}`も定義できます。
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

2行のセットに含まれています。経過時間: 1.175秒。
```

3. デフォルト構成で使用される設定を確認します
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

1行のセットに含まれています。経過時間: 0.003秒。
```
### トラブルシューティング {#troubleshooting}

テーブル情報とUUIDを取得するための例のコマンド：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDを持つzookeeperに関する情報を取得するための例のコマンド
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは`Atomic`である必要があります。以前のバージョンからアップグレードしている場合、`default`データベースはおそらく`Ordinary`タイプです。
:::

確認するために：

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

1行のセットに含まれています。経過時間: 0.004秒。
```
## ClickHouse Keeperの動的再設定 {#reconfiguration}

<SelfManaged />
### 説明 {#description-1}

ClickHouse Keeperは、`keeper_server.enable_reconfiguration`がオンになっている場合、ZooKeeperの [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying) コマンドを使用して動的クラスター再構成を部分的にサポートします。

:::note
この設定がオフになっている場合、レプリカの`raft_configuration`セクションを手動で変更することによってクラスターを再構成できます。すべてのレプリカのファイルを編集することを確認してください。リーダーのみが変更を適用します。
または、ZooKeeper互換のクライアントを介して`reconfig`クエリを送信できます。
:::

仮想ノード `/keeper/config` は、次の形式で最後にコミットされたクラスターの設定を含んでいます：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーのエントリは改行で区切られています。
- `server_type`は`participant`または`learner`のいずれかです（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)はリーダー選挙に参加しません）。
- `server_priority`は、[リーダー選挙でどのノードが優先されるかを示す非負整数](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)です。
  優先度0は、サーバーがリーダーにならないことを意味します。

例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

新しいサーバーを追加したり、既存のサーバーを削除したり、既存のサーバーの優先度を変更したりするために`reconfig`コマンドを使用できます。以下は例です（`clickhouse-keeper-client`を使用）：

```bash

# 2つの新しいサーバーを追加
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# その他の2つのサーバーを削除
reconfig remove "3,4"

# 既存のサーバーの優先度を8に変更
reconfig add "server.5=localhost:5123;participant;8"
```

以下は`kazoo`の例です：

```python

# 2つの新しいサーバーを追加し、他の2つのサーバーを削除
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# 既存のサーバーの優先度を8に変更
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`のサーバーは、上記で説明されているサーバー形式にする必要があります。サーバーエントリはコンマで区切る必要があります。
新しいサーバーを追加するときは、`server_priority`（デフォルト値は1）と`server_type`（デフォルト値は`participant`）を省略できます。

既存サーバーの優先度を変更したい場合は、ターゲット優先度を持つ`joining`に追加します。
サーバーのホスト、ポート、およびタイプは既存のサーバー設定と等しくする必要があります。

サーバーは、`joining`および`leaving`の出現順に追加および削除されます。
`joining`からのすべての更新が`leaving`からの更新の前に処理されます。

Keeper再構成実装にはいくつかの留意点があります：

- 増分再構成のみがサポートされています。`new_members`が空でないリクエストは拒否されます。

  ClickHouse Keeperの実装は、NuRaft APIに依存してメンバーシップを動的に変更します。NuRaftには、1回に1つのサーバーを追加または削除する方法があります。これは、各構成変更（`joining`の各部分、`leaving`の各部分）を別々に決定する必要があることを意味します。したがって、バルク再構成は利用できません。これは最終ユーザーに誤解を招くものです。

  サーバータイプ（participant/learner）を変更することもできません。これはNuRaftではサポートされていないため、サーバーを削除して追加する必要があり、これもまた誤解を招くことになります。

- 返された`znodestat`値を使用できません。
- `from_version`フィールドは使用されません。`from_version`を設定したリクエストはすべて拒否されます。
  これは、`/keeper/config`が仮想ノードであり、永続ストレージに保存されているのではなく、リクエストごとに指定されたノードの設定でオンザフライで生成されるからです。
  NuRaftがこの構成をすでに保存しているため、データを重複させないためにこの決定が行われました。
- ZooKeeperとは異なり、`sync`コマンドを送信してクラスターの再構成を待つ方法はありません。
  新しい設定は_最終的に_適用されますが、時間の保証はありません。
- `reconfig`コマンドは、さまざまな理由で失敗する場合があります。クラスターの状態を確認し、更新が適用されたかどうかを確認できます。
## シングルノードのKeeperをクラスターに変換する {#converting-a-single-node-keeper-into-a-cluster}

実験的なKeeperノードをクラスターに拡張する必要がある場合があります。これを3ノードクラスターとして段階的に行う方法のスキームは以下の通りです：

- **重要**：新しいノードは、現在の過半数よりも少ないバッチで追加する必要があります。そうしないと、それらの間でリーダーが選出されます。この例では1つずつ追加します。
- 既存のKeeperノードは`keeper_server.enable_reconfiguration`構成パラメータがオンになっている必要があります。
- 新しいKeeperクラスターの完全な設定で2番目のノードを開始します。
- 起動後、ノード1に追加します [`reconfig`](#reconfiguration)を使用して。
- 次に、3番目のノードを起動し、[`reconfig`](#reconfiguration)を使用して追加します。
- 新しいKeeperノードを追加して`clickhouse-server`の設定を更新し、変更を適用するために再起動します。
- ノード1のRaft設定を更新し、オプションで再起動します。

プロセスを確実に理解するために、これが[サンドボックスリポジトリ](https://github.com/ClickHouse/keeper-extend-cluster)です。
## サポートされていない機能 {#unsupported-features}

ClickHouse KeeperはZooKeeperとの完全な互換性を目指していますが、現在実装されていないいくつかの機能があります（開発は進行中です）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は`Stat`オブジェクトの返却をサポートしていません。
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は[TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)をサポートしていません。
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode))は[`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT)ウォッチとともに動作しません。
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean))および[`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.WatcherType,boolean))はサポートされていません。
- `setWatches`はサポートされていません。
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html)タイプのznodesを作成することはサポートされていません。
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)はサポートされていません。
