---
slug: /guides/sre/keeper/clickhouse-keeper

sidebar_label: 'ClickHouse Keeper の設定'
sidebar_position: 10
keywords: ['Keeper', 'ZooKeeper', 'clickhouse-keeper']
description: 'ClickHouse Keeper（または clickhouse-keeper）は ZooKeeper を置き換え、レプリケーションおよびコーディネーション機能を提供します。'
title: 'ClickHouse Keeper'
doc_type: 'guide'
---



# ClickHouse Keeper (clickhouse-keeper) {#clickhouse-keeper-clickhouse-keeper}

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';

<SelfManaged />

ClickHouse Keeper は、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)および[分散 DDL](/sql-reference/distributed-ddl.md) クエリ実行のためのコーディネーションシステムを提供します。ClickHouse Keeper は ZooKeeper と互換性があります。

### Implementation details {#implementation-details}

ZooKeeper は、よく知られたオープンソースのコーディネーションシステムの草分けの 1 つです。Java で実装されており、シンプルかつ強力なデータモデルを備えています。ZooKeeper のコーディネーションアルゴリズムである ZooKeeper Atomic Broadcast (ZAB) は、各 ZooKeeper ノードがローカルで読み取りを処理するため、読み取りに対する線形化可能性の保証を提供しません。ZooKeeper と異なり、ClickHouse Keeper は C++ で実装され、[RAFT アルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用します。このアルゴリズムは読み取りと書き込みの両方に対して線形化可能性を提供し、さまざまな言語で複数のオープンソース実装が存在します。

デフォルトでは、ClickHouse Keeper は ZooKeeper と同じ保証、すなわち線形化可能な書き込みと非線形化可能な読み取りを提供します。互換性のあるクライアント・サーバープロトコルを持つため、標準的な ZooKeeper クライアントで ClickHouse Keeper と対話できます。スナップショットとログのフォーマットは ZooKeeper とは互換性がありませんが、`clickhouse-keeper-converter` ツールを使用すると ZooKeeper のデータを ClickHouse Keeper のスナップショットへ変換できます。ClickHouse Keeper のサーバー間プロトコルも ZooKeeper とは互換性がないため、ZooKeeper と ClickHouse Keeper が混在したクラスター構成は不可能です。

ClickHouse Keeper は、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) と同様の方法で Access Control Lists (ACLs) をサポートします。ClickHouse Keeper は同じ権限セットをサポートし、`world`、`auth`、`digest` という同一の組み込みスキームを持ちます。digest 認証スキームは `username:password` のペアを使用し、パスワードは Base64 でエンコードされます。

:::note
外部との統合はサポートされていません。
:::

### Configuration {#configuration}

ClickHouse Keeper は、ZooKeeper のスタンドアロン代替として、または ClickHouse サーバー内部のコンポーネントとして使用できます。いずれの場合も、設定はほぼ同一の `.xml` ファイルで行います。

#### Keeper configuration settings {#keeper-configuration-settings}

ClickHouse Keeper の主な設定タグは `<keeper_server>` であり、次のパラメータを持ちます。


| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                               | `2181`                                                                                                       |
| `tcp_port_secure`                    | クライアントと Keeper サーバー間の SSL 接続用のセキュアポート。                                                                                                                                                                                   | -                                                                                                            |
| `server_id`                          | 一意のサーバー ID。ClickHouse Keeper クラスターの各参加ノードは、一意の番号 (1, 2, 3, …) を持つ必要があります。                                                                                                                                    | -                                                                                                            |
| `log_storage_path`                   | コーディネーションログのパス。ZooKeeper と同様に、ログは負荷の低いノード上に保存するのが最適です。                                                                                                                                                 | -                                                                                                            |
| `snapshot_storage_path`              | コーディネーションスナップショットのパス。                                                                                                                                                                                                          | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration) を介したクラスターの動的再構成を有効化します。                                                                                                                                                                      | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeper の最大メモリ使用量に対するソフトリミット (バイト単位)。                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit` が未設定、または 0 に設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                    | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit` が未設定、または `0` に設定されている場合、この間隔で物理メモリ量を監視します。メモリ量が変化した場合、`max_memory_usage_soft_limit_ratio` に基づいて Keeper のメモリソフトリミットを再計算します。                | `15`                                                                                                         |
| `http_control`                       | [HTTP control](#http-control) インターフェースの設定。                                                                                                                                                                                             | -                                                                                                            |
| `digest_enabled`                     | リアルタイムのデータ整合性チェックを有効化します。                                                                                                                                                                                                 | `True`                                                                                                       |
| `create_snapshot_on_exit`            | シャットダウン時にスナップショットを作成します。                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定に対するホスト名の健全性チェックを有効化します (例: `localhost` がリモートエンドポイントと一緒に使用されている場合など)。                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw コマンドのホワイトリスト。                                                                                                                                                                                                                      | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| IPv6 を有効化します。 | `True`|

その他の一般的なパラメータは、ClickHouse サーバーの設定 (`listen_host`、`logger` など) から継承されます。

#### 内部コーディネーション設定 {#internal-coordination-settings}

内部コーディネーション設定は `<keeper_server>.<coordination_settings>` セクションにあり、次のパラメータを持ちます。



| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一のクライアント操作のタイムアウト (ミリ秒)                                                                                                                                                                            | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト (ミリ秒)                                                                                                                                                                        | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト (ミリ秒)                                                                                                                                                                        | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper がデッドセッションを検出して削除する頻度 (ミリ秒)                                                                                                                                                     | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper のリーダーがフォロワーにハートビートを送信する頻度 (ミリ秒)                                                                                                                                            | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーがこの間隔内にリーダーからハートビートを受信しない場合、リーダー選出を開始できます。`election_timeout_upper_bound_ms` 以下でなければなりません。理想的には両者が同じ値にならないようにします。             | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーがこの間隔内にリーダーからハートビートを受信しない場合、リーダー選出を開始しなければなりません。                                                                                                              | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 1 つのファイルに保存するログレコード数。                                                                                                                                                                                | `100000`                                                                                                     |
| `reserved_log_items`               | コンパクションを実行するまでに保持するコーディネーションログレコード数。                                                                                                                                                | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper が新しいスナップショットを作成する頻度 (ログ内のレコード数で指定)。                                                                                                                                    | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショットの数。                                                                                                                                                                                          | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーを古いと見なして、ログではなくスナップショットを送信するしきい値。                                                                                                                                  | `10000`                                                                                                      |
| `fresh_log_gap`                    | ノードが最新と見なされる条件。                                                                                                                                                                                          | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFT に送信する前の、バッチ内のリクエスト数の最大値。                                                                                                                                                                   | `100`                                                                                                        |
| `force_sync`                       | コーディネーションログへの各書き込み時に `fsync` を呼び出します。                                                                                                                                                       | `true`                                                                                                       |
| `quorum_reads`                     | 読み取りリクエストを、同様の速度で RAFT コンセンサス全体を通した書き込みとして実行します。                                                                                                                               | `false`                                                                                                      |
| `raft_logs_level`                  | コーディネーションに関するテキストログのレベル (trace、debug など)。                                                                                                                                                    | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストのフォワーディングを許可します。                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続の完了とシャットダウンを待機する時間 (ミリ秒)。                                                                                                                                                                 | `5000`                                                                                                       |
| `startup_timeout`                  | 指定されたタイムアウト内にサーバーが他のクォーラム参加者に接続できない場合、サーバーは終了します (ミリ秒)。                                                                                                             | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。すべての書き込みおよび読み取りの保証を維持しつつ、より高いパフォーマンスを実現します。後方互換性を損なわないよう、この設定はデフォルトで無効になっています。                     | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 直近のログエントリのインメモリキャッシュの合計サイズの上限                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットに次に必要となるログエントリのインメモリキャッシュの合計サイズの上限                                                                                                                                           | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | ディスク間でファイルを移動中に障害が発生した後、再試行の間で待機する時間                                                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にディスク間でファイルを移動している際に障害が発生した場合の再試行回数                                                                                                                                        | `100`                                                                                                        |
| `experimental_use_rocksdb`         | バックエンドストレージとして RocksDB を使用するかどうか                                                                                                    | `0`                                                                                                        |

クォーラムの設定は `<keeper_server>.<raft_configuration>` セクションにあり、サーバーの記述が含まれています。

クォーラム全体に対する唯一のパラメータは `secure` であり、クォーラム参加者間の通信に対して暗号化された接続を有効にします。ノード間の内部通信に SSL 接続が必要な場合はこのパラメータを `true` に設定し、それ以外の場合は未指定のままにできます。

各 `<server>` に対する主なパラメータは次のとおりです。



* `id` — クォーラム内のサーバー識別子。
* `hostname` — このサーバーが配置されているホストのホスト名。
* `port` — このサーバーが接続を待ち受けるポート。
* `can_become_leader` — サーバーを `learner` として設定するには `false` を設定します。省略した場合、値は `true` です。

:::note
ClickHouse Keeper クラスターのトポロジーが変更される場合（例: サーバーの交換）、`server_id` と `hostname` の対応関係を常に一貫性を保って維持し、既存の `server_id` を別のサーバーに対して入れ替えたり再利用したりしないようにしてください（たとえば、ClickHouse Keeper をデプロイするために自動化スクリプトに依存している場合に起こりえます）。

Keeper インスタンスのホストが変更される可能性がある場合は、生の IP アドレスではなくホスト名を定義して使用することを推奨します。ホスト名の変更は、そのサーバーを削除して再追加することと同じであり、場合によってはそれが不可能な場合があります（例: クォーラムを満たす Keeper インスタンスが不足している場合）。
:::

:::note
後方互換性を損なわないように、`async_replication` はデフォルトで無効になっています。クラスター内のすべての Keeper インスタンスが `async_replication` をサポートするバージョン（v23.9 以降）で動作している場合、パフォーマンスをデメリットなしに向上できるため、有効化することを推奨します。
:::

3 ノード構成のクォーラム用設定例は、`test_keeper_` プレフィックスが付いた [integration tests](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) にあります。サーバー #1 の設定例:

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

ClickHouse Keeper は ClickHouse サーバーのパッケージに同梱されています。`/etc/your_path_to_config/clickhouse-server/config.xml` に `<keeper_server>` の設定を追加し、通常どおり ClickHouse サーバーを起動してください。ClickHouse Keeper をスタンドアロンとして実行したい場合は、同様に次のように起動できます。

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク `clickhouse-keeper` がない場合は、それを作成するか、`clickhouse` コマンドの引数として `keeper` を指定してください。

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 4 文字コマンド {#four-letter-word-commands}

ClickHouse Keeper は、Zookeeper とほぼ同じ 4lw コマンドも提供します。各コマンドは `mntr` や `stat` などの 4 文字で構成されています。たとえば、`stat` はサーバーと接続クライアントに関する一般的な情報を返し、`srvr` と `cons` はそれぞれサーバーおよび接続に関する詳細情報を返します。

4lw コマンドには `four_letter_word_white_list` というホワイトリスト設定があり、デフォルト値は `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld` です。

ClickHouse Keeper のクライアントポートに対して、telnet または nc を使用してこれらのコマンドを送信できます。

```bash
echo mntr | nc localhost 9181
```

以下は、4lw コマンドの詳細です:

* `ruok`: サーバーがエラーが発生していない状態で動作しているかをテストします。サーバーが動作している場合は `imok` と応答します。そうでない場合はまったく応答しません。`imok` という応答は、必ずしもサーバーがクォーラムに参加していることを示すものではなく、サーバープロセスがアクティブであり、指定されたクライアントポートにバインドされていることだけを示します。クォーラムおよびクライアント接続情報に関する状態の詳細を確認するには、`stat` を使用してください。

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

* `srvr`: サーバーのすべての詳細情報を表示します。

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

* `stat`: サーバーおよび接続中のクライアントに関する概要情報を一覧表示します。

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

* `srst`: サーバーの統計情報をリセットします。このコマンドは `srvr`、`mntr`、`stat` の結果に影響を与えます。

```response
Server stats reset.
```

* `conf`: サービス構成の詳細を表示します。

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

* `cons`: このサーバーに接続されているすべてのクライアントの接続およびセッションの詳細を一覧表示します。受信/送信パケット数、セッション ID、操作レイテンシー、最後に実行された操作などの情報を含みます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: すべての接続／セッションの統計情報をリセットします。

```response
Connection stats reset.
```

* `envi`: 稼働環境の詳細を表示します


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

* `dirs`: スナップショットおよびログファイルの合計サイズをバイト単位で表示します

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: サーバーが読み取り専用モードで動作しているかを確認します。サーバーは読み取り専用モードの場合は `ro` を、そうでない場合は `rw` を返します。

```response
rw
```

* `wchs`: サーバー上のウォッチの概要情報を一覧表示します。

```response
1 connections watching 1 paths
Total watches:1
```

* `wchc`: サーバーに対するウォッチに関する詳細情報をセッション単位で一覧表示します。関連付けられたウォッチ（パス）を含むセッション（接続）のリストを出力します。ウォッチの数によっては、この操作は高コストとなりサーバーのパフォーマンスに影響する可能性があるため、慎重に使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: サーバー上のウォッチについて、パスごとの詳細情報を一覧表示します。ウォッチ対象のパス（znode）と、それに関連付けられたセッションのリストを出力します。ウォッチの数によっては、この操作は高コスト（サーバーのパフォーマンスに影響）になる可能性があるため、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: アクティブなセッションとエフェメラルノードを一覧表示します。このコマンドはリーダーでのみ使用できます。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: スナップショット作成タスクをスケジュールします。成功した場合は、スケジュールされたスナップショットの最新のコミット済みログ索引を返し、失敗した場合は `Failed to schedule snapshot creation task.` を返します。スナップショットが完了しているかどうかを判断するには、`lgif` コマンドが役立ちます。

```response
100
```

* `lgif`: Keeper のログ情報。`first_log_idx` : ログストア内における自身の最初のログの索引；`first_log_term` : 自身の最初のログ term；`last_log_idx` : ログストア内における自身の最後のログの索引；`last_log_term` : 自身の最後のログ term；`last_committed_log_idx` : ステートマシンにおける自身の最新のコミット済みログの索引；`leader_committed_log_idx` : 自身の視点から見たリーダーのコミット済みログの索引；`target_committed_log_idx` : コミットされるべき対象ログの索引；`last_snapshot_idx` : 直近のスナップショット内での最大のコミット済みログの索引。

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

* `rqld`: 新しいリーダーになるようリクエストします。リクエストが送信された場合は `Sent leadership request to leader.`、送信されなかった場合は `Failed to send leadership request to leader.` を返します。ノードがすでにリーダーである場合でも、リクエストが送信された場合と同じ結果になる点に注意してください。

```response
Sent leadership request to leader.
```

* `ftfl`: Keeper インスタンスでの有効／無効状態とともに、すべての feature flag を一覧表示します。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: リーダー権限の返上を要求し、フォロワーへ移行させるリクエスト。リクエストを受け取ったサーバーがリーダーである場合、まず書き込み処理を一時停止し、後継リーダー（現在のリーダーが後継になることはない）が最新のログに追いつくまで待機してから、リーダーを辞任する。後継リーダーは自動的に選出される。リクエストが送信された場合は `Sent yield leadership request to leader.` を返し、リクエストが送信されなかった場合は `Failed to send yield leadership request to leader.` を返す。ノードがすでにフォロワーである場合、結果はリクエストが送信された場合と同じになる点に注意。

```response
Sent yield leadership request to leader.
```

* `pfev`: 収集されたすべてのイベントの値を返します。各イベントごとに、イベント名、イベント値、およびイベントの説明を返します。


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

### HTTP 制御 {#http-control}

ClickHouse Keeper は、レプリカがトラフィックを受け付ける準備ができているかどうかを確認するための HTTP インターフェイスを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) などのクラウド環境で利用できます。

`/ready` エンドポイントを有効にするための設定例:

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

### フィーチャーフラグ {#feature-flags}

Keeper は ZooKeeper およびそのクライアントと完全な互換性がありますが、ClickHouse クライアントから利用できる独自の機能やリクエストタイプも導入しています。
これらの機能は後方互換性のない変更をもたらす可能性があるため、多くはデフォルトで無効になっており、`keeper_server.feature_flags` 設定で有効化できます。
各機能は明示的に無効にすることもできます。
Keeper クラスターで新しい機能を有効にしたい場合は、まずクラスター内のすべての Keeper インスタンスを、その機能をサポートするバージョンに更新してから、その機能自体を有効化することを推奨します。

`multi_read` を無効にし、`check_not_exists` を有効にするフィーチャーフラグ設定の例:

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

| Feature                | Description                                                                      | Default |
| ---------------------- | -------------------------------------------------------------------------------- | ------- |
| `multi_read`           | 複数読み取りリクエストをサポート                                                                 | `1`     |
| `filtered_list`        | ノードタイプ（ephemeral または persistent）で結果をフィルタリングする list リクエストをサポート                    | `1`     |
| `check_not_exists`     | ノードが存在しないことを検証する `CheckNotExists` リクエストをサポート                                     | `1`     |
| `create_if_not_exists` | ノードが存在しない場合に作成を試みる `CreateIfNotExists` リクエストをサポート。すでに存在する場合は何も変更されず、`ZOK` が返されます | `1`     |
| `remove_recursive`     | ノードとそのサブツリーをまとめて削除する `RemoveRecursive` リクエストをサポート                                | `1`     |

:::note
バージョン 25.7 以降では、一部の機能フラグがデフォルトで有効になっています。
Keeper を 25.7 以降にアップグレードする際の推奨手順は、まずバージョン 24.9 以降にアップグレードしてから行うことです。
:::


### ZooKeeper からの移行 {#migration-from-zookeeper}

ZooKeeper から ClickHouse Keeper へのシームレスな移行はできません。ZooKeeper クラスターを停止し、データを変換し、ClickHouse Keeper を起動する必要があります。`clickhouse-keeper-converter` ツールを使用すると、ZooKeeper のログとスナップショットを ClickHouse Keeper のスナップショットに変換できます。このツールは ZooKeeper 3.4 より新しいバージョンでのみ動作します。移行の手順は以下のとおりです。

1. すべての ZooKeeper ノードを停止します。

2. 任意ですが、推奨されます: ZooKeeper のリーダーノードを特定し、そのノードを起動してから再度停止します。これにより、ZooKeeper に一貫したスナップショットを作成させることができます。

3. リーダー上で `clickhouse-keeper-converter` を実行します。例:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを、`keeper` が設定された ClickHouse サーバーノードにコピーするか、ZooKeeper の代わりに ClickHouse Keeper を起動します。スナップショットはすべてのノード上に存在している必要があります。そうでない場合、空のノードのほうが起動が速く、そのうちの 1 つがリーダーになってしまう可能性があります。

:::note
`keeper-converter` ツールは Keeper のスタンドアロンバイナリには含まれていません。
ClickHouse がインストールされている場合は、そのバイナリを直接使用できます。

```bash
clickhouse keeper-converter ...
```

そうでない場合は、[バイナリをダウンロード](/getting-started/quick-start/oss#download-the-binary)して、ClickHouse をインストールせずに上記の手順どおりにツールを実行できます。
:::

### クォーラム喪失後の復旧 {#recovering-after-losing-quorum}

ClickHouse Keeper は Raft を使用しているため、クラスタサイズに応じて一定数のノード障害を許容できます。
例えば 3 ノードクラスタの場合、1 ノードだけがクラッシュした状態であれば、正しく動作し続けます。

クラスタ設定は動的に再設定できますが、いくつか制限があります。再設定も Raft に依存するため、
クラスタからノードを追加・削除するにはクォーラムが必要です。もしクラスタ内のノードを同時に多数失い、
それらを再起動する見込みがない場合、Raft は動作を停止し、通常の方法でクラスタを再設定することはできません。

しかしながら、ClickHouse Keeper にはリカバリモードがあり、1 ノードだけでクラスタを強制的に再設定することができます。
これは、ノードを再起動できない、あるいは同じエンドポイントで新しいインスタンスを起動できない場合の最後の手段としてのみ実施してください。

続行前に注意すべき重要な点:

* 障害が発生したノードがクラスタに再接続できないことを確認してください。
* 手順で指示されるまでは、新しいノードを一切起動しないでください。

上記を確認したら、次の作業を行います:

1. 新しいリーダーとする Keeper ノードを 1 つ選択します。そのノードのデータがクラスタ全体で使用されることに注意してください。そのため、可能な限り最新の状態を持つノードを使用することを推奨します。
2. 他の作業を行う前に、選択したノードの `log_storage_path` および `snapshot_storage_path` ディレクトリのバックアップを作成します。
3. 使用したいすべてのノードでクラスタ設定を再構成します。
4. 選択したノードに 4 文字コマンド `rcvr` を送信して、そのノードをリカバリモードにするか、あるいは選択したノード上の Keeper インスタンスを停止し、`--force-recovery` 引数を付けて再起動します。
5. 新しいノード上の Keeper インスタンスを 1 台ずつ起動し、次のノードを起動する前に `mntr` が `zk_server_state` として `follower` を返すことを確認します。
6. リカバリモード中、リーダーノードは新しいノードとのクォーラムを達成するまで `mntr` コマンドに対してエラーメッセージを返し、クライアントおよびフォロワーからのあらゆるリクエストを拒否します。
7. クォーラムが達成されると、リーダーノードは通常の動作モードに戻り、Raft によってすべてのリクエストを受け付けるようになります。`mntr` を使用して検証すると、`zk_server_state` に対して `leader` が返されるはずです。


## Keeper でディスクを使用する {#using-disks-with-keeper}

Keeper は、スナップショット、ログファイル、および状態ファイルを保存するために、[external disks](/operations/storing-data.md) の一部をサポートします。

サポートされているディスクの種類は次のとおりです：

* s3&#95;plain
* s3
* local

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

ログ用にディスクを使用するには、`keeper_server.log_storage_disk` 設定をディスク名に設定します。
スナップショット用にディスクを使用するには、`keeper_server.snapshot_storage_disk` 設定をディスク名に設定します。
さらに、`keeper_server.latest_log_storage_disk` と `keeper_server.latest_snapshot_storage_disk` をそれぞれ使用することで、最新のログやスナップショットに別々のディスクを使用できます。
その場合、新しいログやスナップショットが作成されると、Keeper はファイルを正しいディスクへ自動的に移動します。
状態ファイル用にディスクを使用するには、`keeper_server.state_storage_disk` 設定をディスク名に設定します。

ディスク間でファイルを移動しても安全であり、Keeper が転送の途中で停止してもデータを失うリスクはありません。
ファイルが完全に新しいディスクへ移動し終わるまでは、古いディスクから削除されることはありません。

`keeper_server.coordination_settings.force_sync` が `true`（デフォルトで `true`）に設定された Keeper は、すべての種類のディスクに対して同じ保証を提供することはできません。
現時点では、`local` タイプのディスクのみが永続的な同期をサポートします。
`force_sync` が有効な場合、`latest_log_storage_disk` を使用していないなら、`log_storage_disk` は `local` ディスクである必要があります。
`latest_log_storage_disk` を使用する場合は、常に `local` ディスクでなければなりません。
`force_sync` が無効な場合は、あらゆる種類のディスクを、どのような構成でも使用できます。

Keeper インスタンスのストレージ構成例は、次のようになります。

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

このインスタンスでは、最新のログ以外はすべてディスク `log_s3_plain` に保存し、最新のログのみをディスク `log_local` に保存します。
スナップショットについても同様で、最新のスナップショット以外はすべて `snapshot_s3_plain` に保存され、最新のスナップショットのみがディスク `snapshot_local` に保存されます。

### ディスク構成の変更 {#changing-disk-setup}

:::important
新しいディスク構成を適用する前に、すべての Keeper のログおよびスナップショットを手動でバックアップしてください。
:::

階層化ディスク構成（最新ファイル用に専用ディスクを使用する構成）が定義されている場合、Keeper は起動時にファイルを自動的に正しいディスクへ移動しようとします。
以前と同じ保証が適用されます。ファイルが新しいディスクへ完全に移動されるまでは古いディスクから削除されないため、複数回の再起動を安全に行うことができます。

ファイルを完全に新しいディスクへ移動する必要がある場合（あるいは 2 ディスク構成から単一ディスク構成へ移行する場合）、`keeper_server.old_snapshot_storage_disk` および `keeper_server.old_log_storage_disk` を複数定義することが可能です。

次の設定は、前述の 2 ディスク構成から、まったく新しい単一ディスク構成へ移行する方法を示しています。


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

起動時には、すべてのログファイルが `log_local` および `log_s3_plain` から `log_local2` ディスクに移動されます。
また、すべてのスナップショットファイルが `snapshot_local` および `snapshot_s3_plain` から `snapshot_local2` ディスクに移動されます。


## ログキャッシュの設定 {#configuring-logs-cache}

ディスクから読み取るデータ量を最小限に抑えるために、Keeper はログエントリーをメモリ上にキャッシュします。
リクエストが大きい場合、ログエントリーが大量のメモリを消費するため、キャッシュされるログの量には上限があります。
この上限は次の 2 つの設定で制御されます:
- `latest_logs_cache_size_threshold` - キャッシュに保存される最新ログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要がある後続ログの合計サイズ

デフォルト値が大きすぎる場合は、これら 2 つの設定値を小さくすることでメモリ使用量を削減できます。

:::note
各キャッシュおよびファイルから読み取られたログの量を確認するには、`pfev` コマンドを使用できます。
また、Prometheus エンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。
:::



## Prometheus {#prometheus}

Keeper は、[Prometheus](https://prometheus.io) によるスクレイピング用のメトリクスデータを公開できます。

Settings:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。&#39;/&#39; で始めます。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開するかどうかを指定するフラグ。
* `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開するかどうかを指定するフラグ。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開するかどうかを指定するフラグ。

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

確認します（`127.0.0.1` を利用中の ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```

ClickHouse Cloud 向けの [Prometheus 連携](/integrations/prometheus) も参照してください。


## ClickHouse Keeper ユーザーガイド {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeper を構成するためのシンプルかつ最小限の設定と、分散操作をテストする方法の例を示します。この例では、Linux 上の 3 ノードを使用します。

### 1. Keeper 設定を使用してノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3 台のホスト（`chnode1`、`chnode2`、`chnode3`）に 3 つの ClickHouse インスタンスをインストールします。（ClickHouse のインストールの詳細は [Quick Start](/getting-started/install/install.mdx) を参照してください。）

2. 各ノードで、ネットワークインターフェイスを介した外部通信を許可するために、次のエントリを追加します。
    ```xml
    <listen_host>0.0.0.0</listen_host>
    ```

3. すべてのサーバーに次の ClickHouse Keeper 構成を追加し、各サーバーに対して `<server_id>` 設定を更新します。`chnode1` には `1`、`chnode2` には `2`、というように設定します。
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

    上記で使用している基本的な設定は次のとおりです。

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |Keeper のクライアントが使用するポート|9181（ZooKeeper の 2181 に相当するデフォルト）|
    |server_id| Raft 構成で使用される各 ClickHouse Keeper サーバーの識別子| 1|
    |coordination_settings| タイムアウトなどのパラメータを指定するセクション| タイムアウト: 10000、ログレベル: trace|
    |server    |クラスタに参加するサーバーの定義|各サーバー定義の一覧|
    |raft_configuration| Keeper クラスター内の各サーバーの設定| 各サーバーとその設定|
    |id      |Keeper サービス用のサーバーの数値 ID|1|
    |hostname   |Keeper クラスター内の各サーバーのホスト名、IP、または FQDN|`chnode1.domain.com`|
    |port|サーバー間の Keeper 接続を待ち受けるポート|9234|

4.  ZooKeeper コンポーネントを有効化します。これは ClickHouse Keeper エンジンをバックエンドとして使用します。
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

    上記で使用している基本的な設定は次のとおりです。

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper への接続のためのノード一覧|各サーバーごとの設定エントリ|
    |host|各 ClickHouse Keeper ノードのホスト名、IP、または FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper のクライアントポート| 9181|

5. ClickHouse を再起動し、各 Keeper インスタンスが稼働していることを確認します。各サーバーで次のコマンドを実行します。Keeper が稼働していて正常な場合、`ruok` コマンドは `imok` を返します。
    ```bash
    # echo ruok | nc localhost 9181; echo
    imok
    ```

6. `system` データベースには、ClickHouse Keeper インスタンスの詳細を含む `zookeeper` という名前のテーブルがあります。このテーブルを参照してみます。
    ```sql
    SELECT *
    FROM system.zookeeper
    WHERE path IN ('/', '/clickhouse')
    ```



テーブルは次のとおりです：

```response
┌─name───────┬─value─┬─czxid─┬─mzxid─┬───────────────ctime─┬───────────────mtime─┬─version─┬─cversion─┬─aversion─┬─ephemeralOwner─┬─dataLength─┬─numChildren─┬─pzxid─┬─path────────┐
│ clickhouse │       │   124 │   124 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        2 │        0 │              0 │          0 │           2 │  5693 │ /           │
│ task_queue │       │   125 │   125 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        1 │        0 │              0 │          0 │           1 │   126 │ /clickhouse │
│ tables     │       │  5693 │  5693 │ 2022-03-07 00:49:34 │ 2022-03-07 00:49:34 │       0 │        3 │        0 │              0 │          0 │           3 │  6461 │ /clickhouse │
└────────────┴───────┴───────┴───────┴─────────────────────┴─────────────────────┴─────────┴──────────┴──────────┴────────────────┴────────────┴─────────────┴───────┴─────────────┘
```

### 2.  ClickHouse でクラスタを構成する {#2--configure-a-cluster-in-clickhouse}

1. 2 つのノード上に 2 つの分片と、それぞれ 1 つずつのレプリカを持つシンプルなクラスタを構成します。3 台目のノードは、ClickHouse Keeper の要件であるクォーラムを満たすために使用します。`chnode1` と `chnode2` の設定を更新します。次のクラスタ定義では、各ノードに 1 つずつ分片を持ち、合計 2 分片でレプリケーションはありません。この例では、一部のデータは片方のノードに、残りはもう一方のノードに配置されます。

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

   | Parameter | Description                           | Example              |
   | --------- | ------------------------------------- | -------------------- |
   | shard     | クラスタ定義内での各分片に属するレプリカの一覧               | 各分片ごとのレプリカの一覧        |
   | replica   | 各レプリカに対する設定の一覧                        | 各レプリカ用の設定エントリ        |
   | host      | レプリカの分片を配置するサーバーのホスト名、IP、または FQDN     | `chnode1.domain.com` |
   | port      | ネイティブ TCP プロトコルによる通信に使用されるポート         | 9000                 |
   | user      | クラスタのインスタンスへの認証に使用されるユーザー名            | default              |
   | password  | クラスタのインスタンスへの接続を許可するために定義したユーザーのパスワード | `ClickHouse123!`     |

2. ClickHouse を再起動し、クラスタが作成されたことを確認します。

   ```bash
   SHOW clusters;
   ```

   クラスタが次のように表示されます。

   ```response
   ┌─cluster───────┐
   │ cluster_2S_1R │
   └───────────────┘
   ```

### 3. 分散テーブルを作成してテストする {#3-create-and-test-distributed-table}

1. `chnode1` 上で ClickHouse クライアントを使用し、このクラスタ上に新しいデータベースを作成します。`ON CLUSTER` 句により、データベースは両方のノードに自動的に作成されます。
   ```sql
   CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
   ```


2. `db1` データベースに新しいテーブルを作成します。ここでも、`ON CLUSTER` により両方のノードにテーブルが作成されます。
    ```sql
    CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
    (
        `id` UInt64,
        `column1` String
    )
    ENGINE = MergeTree
    ORDER BY column1
    ```

3. `chnode1` ノードで、いくつかの行を追加します:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (1, 'abc'),
        (2, 'def')
    ```

4. `chnode2` ノードでも、いくつかの行を追加します:
    ```sql
    INSERT INTO db1.table1
        (id, column1)
    VALUES
        (3, 'ghi'),
        (4, 'jkl')
    ```

5. 各ノードで `SELECT` 文を実行すると、そのノード上のデータのみが表示されることに注意してください。たとえば、`chnode1` では:
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

6. 2 つの分片上のデータを扱うために、`Distributed` テーブルを作成できます。`Distributed` テーブルエンジンを持つテーブルは自身にはデータを保持しませんが、複数サーバーにまたがる分散クエリ処理を可能にします。読み取り時にはすべての分片にアクセスし、書き込みは分片間に分散できます。以下のクエリを `chnode1` で実行します:
    ```sql
    CREATE TABLE db1.dist_table (
        id UInt64,
        column1 String
    )
    ENGINE = Distributed(cluster_2S_1R,db1,table1)
    ```

7. `dist_table` に対してクエリを実行すると、2 つの分片から 4 行すべてのデータが返されることが分かります:
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

このガイドでは、ClickHouse Keeper を使用してクラスタをセットアップする方法を説明しました。ClickHouse Keeper を使用すると、クラスタを構成し、分片間でレプリケートされる分散テーブルを定義できます。



## 一意なパスを使用した ClickHouse Keeper の設定 {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 説明 {#description}

この記事では、組み込みの `{uuid}` マクロ設定を使用して
ClickHouse Keeper または ZooKeeper に一意なエントリを
作成する方法を説明します。一意なパスは、テーブルの作成と削除を頻繁に行う場合に有用です。パスが作成されるたびにそのパス内で新しい `uuid` が使用され、パスが再利用されないため、Keeper のガベージコレクションがパスエントリを削除するのを数分間待つ必要がなくなります。

### 例となる環境 {#example-environment}

3 ノードのクラスタで、3 つすべてのノードに ClickHouse Keeper を構成し、そのうち 2 つのノードに ClickHouse を構成します。これにより、ClickHouse Keeper 用に 3 ノード（タイブレーカーノードを含む）が用意され、2 つのレプリカで構成される単一の ClickHouse 分片が提供されます。

| node                    | description                         |
| ----------------------- | ----------------------------------- |
| `chnode1.marsnet.local` | data node - cluster `cluster_1S_2R` |
| `chnode2.marsnet.local` | data node - cluster `cluster_1S_2R` |
| `chnode3.marsnet.local` | ClickHouse Keeper tie breaker node  |

クラスタの設定例：

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

### テーブルで `{uuid}` を使用するための設定手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定します
   サーバー1の例:

```xml
    <macros>
        <shard>1</shard>
        <replica>replica_1</replica>
    </macros>
```

:::note
ここでは `shard` と `replica` のマクロを定義していますが、`{uuid}` は定義されていません。これは組み込みのものであり、別途定義する必要はありません。
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

3. マクロと `{uuid}` を用いてクラスタにテーブルを作成します

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


┌─host──────────────────┬─port─┬─status─┬─error─┬─num&#95;hosts&#95;remaining─┬─num&#95;hosts&#95;active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

````

4.  Create a distributed table

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

2. 2番目のノード（例: `chnode2`）にデータを挿入する

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

3. 分散テーブルでレコードを表示する

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

### 他の方法 {#alternatives}

デフォルトのレプリケーションパスは、マクロおよび `{uuid}` を使用して事前に定義できます。

1. 各ノードでテーブルのデフォルトを設定する

```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

:::tip
ノードが特定のデータベース専用として使用されている場合は、各ノードごとにマクロ `{database}` を定義することもできます。
:::

2. 明示的なパラメーターを指定せずにテーブルを作成します:

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


Query id: ab68cda9-ae41-4d6d-8d3b-20d8255774ee

┌─host──────────────────┬─port─┬─status─┬─error─┬─num&#95;hosts&#95;remaining─┬─num&#95;hosts&#95;active─┐
│ chnode2.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode1.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

2 行が返されました。経過時間: 1.175 秒。

````

3. Verify it used the settings used in default config
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

1 row in set. Elapsed: 0.003 sec.
```

### トラブルシューティング {#troubleshooting}

テーブル情報および UUID を取得するためのコマンド例：

```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDを使って、ZooKeeper上のテーブル情報を取得するためのコマンド例

```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースのエンジンは `Atomic` である必要があります。以前のバージョンからアップグレードする場合、
`default` データベースは `Ordinary` タイプである可能性が高いです。
:::

確認するには:

たとえば、

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

ClickHouse Keeper は、`keeper_server.enable_reconfiguration` が有効になっている場合に、動的なクラスタ再構成のために ZooKeeper の [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
コマンドの一部機能をサポートします。

:::note
この設定が無効になっている場合は、レプリカの `raft_configuration`
セクションを手動で変更することでクラスタを再構成できます。変更を適用するのはリーダーのみであるため、必ずすべてのレプリカ上のファイルを編集してください。
あるいは、ZooKeeper 互換クライアントを通じて `reconfig` クエリを送信することもできます。
:::

仮想ノード `/keeper/config` には、以下の形式で最新のコミット済みクラスタ構成が格納されます。

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

* 各サーバーのエントリは改行で区切られます。
* `server_type` は `participant` か `learner` のいずれかです（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) はリーダー選出に参加しません）。
* `server_priority` は、[リーダー選出時にどのノードを優先すべきか](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md) を示す 0 以上の整数です。
  優先度が 0 の場合、そのサーバーがリーダーになることはありません。

例:

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

`reconfig` コマンドを使用すると、新しいサーバーの追加、既存サーバーの削除、既存サーバーの優先度の変更などの操作を行うことができます。以下に例を示します（`clickhouse-keeper-client` を使用）:


```bash
# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# Remove two other servers
reconfig remove "3,4"
# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

`kazoo` の例は次のとおりです。


```python
# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```


# 既存のサーバーの優先度を8に変更

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

Servers in `joining` should be in server format described above. Server entries should be delimited by commas.
While adding new servers, you can omit `server_priority` (default value is 1) and `server_type` (default value
is `participant`).

If you want to change existing server priority, add it to `joining` with target priority.
Server host, port, and type must be equal to existing server configuration.

Servers are added and removed in order of appearance in `joining` and `leaving`.
All updates from `joining` are processed before updates from `leaving`.

There are some caveats in Keeper reconfiguration implementation:

- Only incremental reconfiguration is supported. Requests with non-empty `new_members` are declined.

  ClickHouse Keeper implementation relies on NuRaft API to change membership dynamically. NuRaft has a way to
  add a single server or remove a single server, one at a time. This means each change to configuration
  (each part of `joining`, each part of `leaving`) must be decided on separately. Thus there is no bulk
  reconfiguration available as it would be misleading for end users.

  Changing server type (participant/learner) isn't possible either as it's not supported by NuRaft, and
  the only way would be to remove and add server, which again would be misleading.

- You cannot use the returned `znodestat` value.
- The `from_version` field is not used. All requests with set `from_version` are declined.
  This is due to the fact `/keeper/config` is a virtual node, which means it is not stored in
  persistent storage, but rather generated on-the-fly with the specified node config for every request.
  This decision was made as to not duplicate data as NuRaft already stores this config.
- Unlike ZooKeeper, there is no way to wait on cluster reconfiguration by submitting a `sync` command.
  New config will be _eventually_ applied but with no time guarantees.
- `reconfig` command may fail for various reasons. You can check cluster's state and see whether the update
  was applied.
```


## シングルノード keeper をクラスタに変換する {#converting-a-single-node-keeper-into-a-cluster}

実験用の keeper ノードをクラスタ構成に拡張する必要が生じる場合があります。ここでは、3 ノード構成のクラスタに段階的に変換する手順を示します。

- **重要**: 新しいノードは、現在のクォーラム未満の台数ずつ追加する必要があります。そうしないと、新しいノード同士でリーダー選出が行われてしまいます。この例では 1 台ずつ追加します。
- 既存の keeper ノードでは、`keeper_server.enable_reconfiguration` 構成パラメータを有効にしておく必要があります。
- 新しい keeper クラスタ用の完全な設定を使用して、2 台目のノードを起動します。
- 起動後、[`reconfig`](#reconfiguration) を使用してノード 1 に追加します。
- 次に、3 台目のノードを起動し、[`reconfig`](#reconfiguration) を使用して追加します。
- `clickhouse-server` の構成に新しい keeper ノードを追加し、変更を反映するために再起動します。
- ノード 1 の Raft 構成を更新し、必要に応じて再起動します。

手順に慣れるために、[sandbox リポジトリ](https://github.com/ClickHouse/keeper-extend-cluster)も利用できます。



## 非対応の機能 {#unsupported-features}

ClickHouse Keeper は ZooKeeper との完全な互換性を目指していますが、現時点では一部の機能が未実装です（現在開発中）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は `Stat` オブジェクトの返却をサポートしていません
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は [有効期限 (TTL)](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL) をサポートしていません
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) は [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) ウォッチでは動作しません
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) および [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) はサポートされていません
- `setWatches` はサポートされていません
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 型の znode を作成することはサポートされていません
- [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) はサポートされていません
