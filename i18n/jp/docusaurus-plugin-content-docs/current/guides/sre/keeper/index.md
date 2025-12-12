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

ClickHouse Keeper は、データの[レプリケーション](/engines/table-engines/mergetree-family/replication.md)と[分散 DDL](/sql-reference/distributed-ddl.md) クエリ実行のためのコーディネーションシステムを提供します。ClickHouse Keeper は ZooKeeper と互換性があります。

### 実装の詳細 {#implementation-details}

ZooKeeper は、最初期によく知られるようになったオープンソースのコーディネーションシステムの 1 つです。Java で実装されており、シンプルかつ強力なデータモデルを備えています。ZooKeeper のコーディネーションアルゴリズムである ZooKeeper Atomic Broadcast (ZAB) は、各 ZooKeeper ノードがローカルで読み取りを処理するため、読み取りに対して線形化可能性を保証しません。ZooKeeper と異なり、ClickHouse Keeper は C++ で実装されており、[RAFT アルゴリズム](https://raft.github.io/)の[実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは読み取りおよび書き込みの線形化可能性を実現し、複数の言語でオープンソース実装が提供されています。

デフォルトでは、ClickHouse Keeper は ZooKeeper と同じ保証、すなわち線形化可能な書き込みと線形化が保証されない読み取りを提供します。互換性のあるクライアント・サーバープロトコルを持つため、標準的な ZooKeeper クライアントで ClickHouse Keeper とやり取りできます。スナップショットとログは ZooKeeper と互換性のないフォーマットですが、`clickhouse-keeper-converter` ツールにより ZooKeeper のデータを ClickHouse Keeper のスナップショットに変換できます。ClickHouse Keeper のサーバー間プロトコルも ZooKeeper と互換性がないため、ZooKeeper / ClickHouse Keeper 混在クラスタは構成できません。

ClickHouse Keeper は、[ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) と同じ方法で Access Control Lists (ACL) をサポートします。ClickHouse Keeper は同じ権限セットをサポートし、`world`、`auth`、`digest` という同一の組み込みスキームを持ちます。digest 認証スキームは `username:password` のペアを使用し、パスワードは Base64 でエンコードされます。

:::note
外部との連携はサポートされていません。
:::

### 設定 {#configuration}

ClickHouse Keeper は、ZooKeeper のスタンドアロン代替として、または ClickHouse サーバーの内部コンポーネントとして利用できます。どちらの場合も、設定はほぼ同じ `.xml` ファイルです。

#### Keeper の設定項目 {#keeper-configuration-settings}

ClickHouse Keeper の主な設定タグは `<keeper_server>` で、次のパラメータがあります。

| Parameter                            | Description                                                                                                                                                                                                                                         | Default                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                               | `2181`                                                                                                       |
| `tcp_port_secure`                    | クライアントと keeper-server 間の SSL 接続用のセキュアポート。                                                                                                                                                                                     | -                                                                                                            |
| `server_id`                          | 一意のサーバー ID。ClickHouse Keeper クラスターの各参加ノードは、(1, 2, 3, … のような) 一意の番号を持つ必要があります。                                                                                                                             | -                                                                                                            |
| `log_storage_path`                   | 調停ログ (coordination logs) の保存パス。ZooKeeper と同様、ログは負荷の低いノード上に保存するのが望ましいです。                                                                                                                                    | -                                                                                                            |
| `snapshot_storage_path`              | 調停スナップショットの保存パス。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration) による動的なクラスター再構成を有効にします。                                                                                                                                                                        | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeper の最大メモリ使用量に対するソフトリミット (バイト単位)。                                                                                                                                                                                      | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit` が未設定、または 0 に設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit` が未設定、または `0` に設定されている場合、この間隔で物理メモリ量を監視します。メモリ量が変化した場合、`max_memory_usage_soft_limit_ratio` に基づいて Keeper のメモリのソフトリミットを再計算します。               | `15`                                                                                                         |
| `http_control`                       | [HTTP control](#http-control) インターフェイスの設定。                                                                                                                                                                                              | -                                                                                                            |
| `digest_enabled`                     | リアルタイムのデータ整合性チェックを有効にします。                                                                                                                                                                                                  | `True`                                                                                                       |
| `create_snapshot_on_exit`            | シャットダウン時にスナップショットを作成します。                                                                                                                                                                                                    | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定に対するホスト名の妥当性チェックを有効にします (例：localhost がリモートエンドポイントと共に使用されている場合など)。                                                                                                               | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw コマンドのホワイトリスト。                                                                                                                                                                                                                      | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| IPv6 を有効にします。 | `True`|

その他の一般的なパラメータは、ClickHouse サーバーの設定 (`listen_host`、`logger` など) から継承されます。

#### 内部調停設定 {#internal-coordination-settings}

内部調停設定は `<keeper_server>.<coordination_settings>` セクションに定義されており、次のパラメータを持ちます。

| Parameter                          | Description                                                                                                                                                                                                              | Default                                                                                                      |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`             | 単一クライアント操作のタイムアウト (ms)                                                                                                                                                                                   | `10000`                                                                                                      |
| `min_session_timeout_ms`           | クライアントセッションの最小タイムアウト (ms)                                                                                                                                                                            | `10000`                                                                                                      |
| `session_timeout_ms`               | クライアントセッションの最大タイムアウト (ms)                                                                                                                                                                            | `100000`                                                                                                     |
| `dead_session_check_period_ms`     | ClickHouse Keeper がデッドセッションを検出して削除する頻度 (ms)                                                                                                                                                           | `500`                                                                                                        |
| `heart_beat_interval_ms`           | ClickHouse Keeper のリーダーがフォロワーにハートビートを送信する頻度 (ms)                                                                                                                                                 | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`  | フォロワーがこの間隔内にリーダーからのハートビートを受信しなかった場合、リーダー選出を開始できます。`election_timeout_upper_bound_ms` 以下である必要があります。理想的には両者は同一値にすべきではありません。 | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`  | フォロワーがこの間隔内にリーダーからのハートビートを受信しなかった場合、リーダー選出を開始しなければなりません。                                                                                                         | `2000`                                                                                                       |
| `rotate_log_storage_interval`      | 1 つのファイルに保存するログレコード数。                                                                                                                                                                                   | `100000`                                                                                                     |
| `reserved_log_items`               | コンパクション前に保持するコーディネーションログレコード数。                                                                                                                                                              | `100000`                                                                                                     |
| `snapshot_distance`                | ClickHouse Keeper が新しいスナップショットを作成する頻度 (ログ内のレコード数単位)。                                                                                                                                      | `100000`                                                                                                     |
| `snapshots_to_keep`                | 保持するスナップショット数。                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                    | リーダーがフォロワーをステイルと見なし、ログではなくスナップショットを送信する際のしきい値。                                                                                                                              | `10000`                                                                                                      |
| `fresh_log_gap`                    | ノードが最新と見なされるタイミング。                                                                                                                                                                                      | `200`                                                                                                        |
| `max_requests_batch_size`          | RAFT に送信される前のリクエストバッチの最大サイズ (リクエスト数)。                                                                                                                                                        | `100`                                                                                                        |
| `force_sync`                       | 各コーディネーションログ書き込みごとに `fsync` を呼び出します。                                                                                                                                                           | `true`                                                                                                       |
| `quorum_reads`                     | 読み取りリクエストを、書き込みと同様に RAFT コンセンサス全体を通して実行します (速度もほぼ同等です)。                                                                                                                      | `false`                                                                                                      |
| `raft_logs_level`                  | コーディネーションに関するテキストログレベル (trace、debug など)。                                                                                                                                                        | `system default`                                                                                             |
| `auto_forwarding`                  | フォロワーからリーダーへの書き込みリクエストのフォワードを許可します。                                                                                                                                                    | `true`                                                                                                       |
| `shutdown_timeout`                 | 内部接続の完了およびシャットダウンまで待機する時間 (ms)。                                                                                                                                                                 | `5000`                                                                                                       |
| `startup_timeout`                  | サーバーが指定されたタイムアウト内に他のクォーラム参加者に接続できない場合、終了します (ms)。                                                                                                                            | `30000`                                                                                                      |
| `async_replication`                | 非同期レプリケーションを有効にします。すべての書き込みおよび読み取りの保証を維持しつつ、パフォーマンスを向上させます。後方互換性を損なわないよう、デフォルトでは無効になっています。                                       | `false`                                                                                                      |
| `latest_logs_cache_size_threshold` | 最新ログエントリのインメモリキャッシュの合計最大サイズ                                                                                                                                                                   | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold` | コミットに次に必要となるログエントリのインメモリキャッシュの合計最大サイズ                                                                                                                                                | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`        | ディスク間でファイルを移動中に発生した失敗後、再試行の間に待機する時間                                                                                                                                                    | `1000`                                                                                                       |
| `disk_move_retries_during_init`    | 初期化中にディスク間でファイルを移動している際に発生した失敗に対して行う再試行回数                                                                                                                                        | `100`                                                                                                        |
| `experimental_use_rocksdb`         | バックエンドストレージとして RocksDB を使用するかどうか                                                                                                                             | `0`                                                                                                          |

クォーラム構成は `<keeper_server>.<raft_configuration>` セクションにあり、サーバーの定義が含まれます。

クォーラム全体に対する唯一のパラメータは `secure` であり、クォーラム参加者間の通信に対する暗号化接続を有効にします。ノード間の内部通信で SSL 接続が必要な場合はこのパラメータを `true` に設定し、それ以外の場合は未指定のままにできます。

各 `<server>` に対する主なパラメータは次のとおりです。

* `id` — クォーラム内のサーバー識別子。
* `hostname` — このサーバーが配置されているホスト名。
* `port` — このサーバーが接続を待ち受けるポート。
* `can_become_leader` — サーバーを `learner` として設定するには `false` を指定します。省略した場合の値は `true` です。

:::note
ClickHouse Keeper クラスターのトポロジーが変更される場合（例: サーバーの置き換え）、`server_id` と `hostname` の対応関係を必ず一貫して維持し、既存の `server_id` を別のサーバーで使い回したり順番を入れ替えたりしないようにしてください（特に、ClickHouse Keeper をデプロイするために自動化スクリプトに依存している場合に発生する可能性があります）。

Keeper インスタンスのホストが変更されうる場合は、生の IP アドレスではなくホスト名を定義して使用することを推奨します。ホスト名の変更はサーバーの削除と再追加に相当し、場合によっては実施できないことがあります（例: クォーラムを満たす Keeper インスタンス数が不足している場合）。
:::

:::note
後方互換性を損なわないように、`async_replication` はデフォルトでは無効になっています。クラスター内のすべての Keeper インスタンスが `async_replication` をサポートするバージョン（v23.9 以降）で動作している場合は、パフォーマンスをデメリットなしに向上させられるため、有効化することを推奨します。
:::

3 ノードでクォーラムを構成する場合の設定例は、`test_keeper_` プレフィックスが付いた [integration tests](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) にあります。サーバー #1 の構成例は次のとおりです。

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

ClickHouse Keeper は ClickHouse サーバーパッケージに同梱されています。`<keeper_server>` の設定を `/etc/your_path_to_config/clickhouse-server/config.xml` に追加し、通常どおり ClickHouse サーバーを起動してください。ClickHouse Keeper をスタンドアロンで実行したい場合は、同様の方法で次のように起動できます。

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

`clickhouse-keeper` というシンボリックリンクがない場合は、それを作成するか、`clickhouse` の引数として `keeper` を指定できます。

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```

### 4 文字コマンド {#four-letter-word-commands}

ClickHouse Keeper は、ZooKeeper のものとほぼ同じ 4 文字コマンド (4lw) も提供します。各コマンドは `mntr` や `stat` などの 4 文字で構成されています。代表的なコマンドとして、`stat` はサーバーおよび接続クライアントに関する一般的な情報を返し、`srvr` と `cons` はそれぞれサーバーおよび接続に関する詳細情報を返します。

4lw コマンドには、`four_letter_word_white_list` というホワイトリスト設定があり、デフォルト値は `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld` です。

クライアントポートに対して、telnet または nc 経由で ClickHouse Keeper にこれらのコマンドを送信できます。

```bash
echo mntr | nc localhost 9181
```

以下に 4lw コマンドの詳細を示します:

* `ruok`: サーバーがエラーのない状態で動作しているかをテストします。サーバーが動作している場合は `imok` と応答します。そうでない場合は一切応答しません。`imok` という応答は、サーバーがクォーラムに参加していることを必ずしも意味せず、サーバープロセスが稼働しており、指定されたクライアントポートにバインドされていることだけを示します。クォーラムに関する状態やクライアント接続情報の詳細については「stat」を使用してください。

```response
imok
```

* `mntr`: クラスターの健全性を監視するために使用できる変数のリストを出力します。

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

* `srvr`: サーバーに関するすべての詳細を表示します。

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

* `conf`: サービング設定の詳細を表示します。

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

* `cons`: このサーバーに接続しているすべてのクライアントの接続およびセッションに関する詳細情報を一覧表示します。受信／送信パケット数、セッション ID、操作レイテンシー、最後に実行された操作などの情報が含まれます。

```response
 192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
 192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

* `crst`: すべての接続について、接続／セッションの統計情報をリセットします。

```response
Connection stats reset.
```

* `envi`: 実行環境の詳細を表示

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

* `dirs`: スナップショットファイルおよびログファイルの総サイズをバイト単位で表示します

```response
snapshot_dir_size: 0
log_dir_size: 3875
```

* `isro`: サーバーが読み取り専用モードで動作しているかを確認します。サーバーは、読み取り専用モードの場合は `ro`、そうでない場合は `rw` を返します。

```response
rw
```

* `wchs`: サーバー上のウォッチの概要情報を一覧表示します。

```response
1 connections watching 1 paths
Total watches:1
```

* `wchc`: サーバー上のウォッチ情報をセッションごとに詳細表示します。これにより、各セッション（接続）と、それに紐づくウォッチ対象（パス）の一覧が出力されます。ウォッチの数によっては、この操作は高コストになり（サーバーのパフォーマンスに影響を与える可能性がある）ため、慎重に使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

* `wchp`: サーバー上のウォッチについて、パスごとの詳細情報を一覧表示します。セッション情報と関連付けられたパス（znode）のリストを出力します。ウォッチの数によっては、この操作は負荷の高い処理となりうる（サーバーのパフォーマンスに影響を与える可能性がある）ため、注意して使用してください。

```response
/clickhouse/task_queue/ddl
    0x0000000000000001
```

* `dump`: 未処理のセッションおよびエフェメラルノードを一覧表示します。これはリーダーノードでのみ有効です。

```response
Sessions dump (2):
0x0000000000000001
0x0000000000000002
Sessions with Ephemerals (1):
0x0000000000000001
 /clickhouse/task_queue/ddl
```

* `csnp`: スナップショット作成タスクをスケジュールします。成功した場合は、スケジュールされたスナップショットの最新のコミット済みログインデックスを返し、失敗した場合は `Failed to schedule snapshot creation task.` を返します。`lgif` コマンドを使用すると、スナップショットが完了したかどうかを確認できます。

```response
100
```

* `lgif`: Keeper ログ情報。`first_log_idx` : ログストア内における自ノードの最初のログインデックス; `first_log_term` : 自ノードの最初のログターム; `last_log_idx` : ログストア内における自ノードの最後のログインデックス; `last_log_term` : 自ノードの最後のログターム; `last_committed_log_idx` : ステートマシンにおける自ノードの最後にコミットされたログインデックス; `leader_committed_log_idx` : 自ノードから見たリーダーのコミット済みログインデックス; `target_committed_log_idx` : コミットされるべき対象のログインデックス; `last_snapshot_idx` : 直近のスナップショットに含まれる最大のコミット済みログインデックス。

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

* `rqld`: 自ノードを新しいリーダーにするよう要求します。要求が送信された場合は `Sent leadership request to leader.` を返し、要求が送信されなかった場合は `Failed to send leadership request to leader.` を返します。ノードがすでにリーダーである場合でも、結果は要求が送信された場合と同じになります。

```response
Sent leadership request to leader.
```

* `ftfl`: すべてのフィーチャーフラグと、それぞれが Keeper インスタンスで有効かどうかを一覧表示します。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

* `ydld`: リーダー権限を放棄してフォロワーになるよう要求します。リクエストを受け取ったサーバーがリーダーの場合、まず書き込み操作を一時停止し、後継ノード（現在のリーダーが後継になることはありません）が最新ログのキャッチアップを完了するまで待機してから辞任します。後継ノードは自動的に選出されます。リクエストの送信に成功した場合は `Sent yield leadership request to leader.` を返し、送信に失敗した場合は `Failed to send yield leadership request to leader.` を返します。ノードがすでにフォロワーである場合も、リクエストが送信された場合と同じ結果になります。

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

ClickHouse Keeper は、レプリカがトラフィックを受信できる状態かどうかを確認するための HTTP インターフェイスを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) のようなクラウド環境で使用できます。

`/ready` エンドポイントを有効化するための設定例:

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

Keeper は ZooKeeper およびそのクライアントと完全互換ですが、ClickHouse クライアントから利用できる独自の機能やリクエスト種別も追加しています。
これらの機能は後方互換性のない変更を引き起こす可能性があるため、その多くはデフォルトで無効化されており、`keeper_server.feature_flags` 設定を使用して有効化できます。
すべての機能は個別に無効化することもできます。
Keeper クラスターで新しい機能を有効にしたい場合は、まずクラスター内のすべての Keeper インスタンスをその機能をサポートするバージョンに更新してから、その機能自体を有効にすることを推奨します。

`multi_read` を無効化し、`check_not_exists` を有効化するフィーチャーフラグ設定の例:

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

次の機能を利用できます:

| Feature                | Description                                                                      | Default |
| ---------------------- | -------------------------------------------------------------------------------- | ------- |
| `multi_read`           | 複数読み取りリクエストのサポート                                                                 | `1`     |
| `filtered_list`        | ノードの種類（一時的か永続的か）で結果をフィルタリングする list リクエストのサポート                                    | `1`     |
| `check_not_exists`     | ノードが存在しないことを検証する `CheckNotExists` リクエストのサポート                                     | `1`     |
| `create_if_not_exists` | ノードが存在しない場合に作成を試みる `CreateIfNotExists` リクエストのサポート。すでに存在する場合は変更は行われず、`ZOK` が返されます | `1`     |
| `remove_recursive`     | 対象ノードとそのサブツリーを削除する `RemoveRecursive` リクエストのサポート                                  | `1`     |

:::note
一部の機能フラグはバージョン 25.7 からデフォルトで有効になっています。\
Keeper を 25.7 以降にアップグレードする場合は、まずバージョン 24.9 以降にアップグレードしてから 25.7 以降に上げることを推奨します。
:::

### ZooKeeper からの移行 {#migration-from-zookeeper}

ZooKeeper から ClickHouse Keeper へのシームレスな移行はできません。ZooKeeper クラスターを停止し、データを変換してから ClickHouse Keeper を起動する必要があります。`clickhouse-keeper-converter` ツールを使用すると、ZooKeeper のログおよびスナップショットを ClickHouse Keeper のスナップショットに変換できます。このツールは ZooKeeper 3.4 より新しいバージョンでのみ動作します。移行の手順は次のとおりです。

1. すべての ZooKeeper ノードを停止します。

2. オプションですが推奨です。ZooKeeper のリーダーノードを特定し、それを起動してから再度停止します。これにより、ZooKeeper に整合性の取れたスナップショットを作成させることができます。

3. リーダー上で `clickhouse-keeper-converter` を実行します。例:

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. `keeper` が設定されている ClickHouse サーバーノードにスナップショットをコピーするか、ZooKeeper の代わりに ClickHouse Keeper を起動します。スナップショットはすべてのノードに永続化されている必要があります。そうでないと、空のノードのほうが起動が速く、そのうちの 1 つがリーダーになってしまう可能性があります。

:::note
`keeper-converter` ツールは Keeper のスタンドアロンバイナリでは利用できません。
ClickHouse がインストールされている場合は、ClickHouse のバイナリを直接使用できます。

```bash
clickhouse keeper-converter ...
```

Otherwise, you can [download the binary](/getting-started/quick-start/oss#download-the-binary) and run the tool as described above without installing ClickHouse.
:::

### クォーラム喪失後の復旧 {#recovering-after-losing-quorum}

ClickHouse Keeper は Raft を使用しているため、クラスタサイズに応じて一定数のノード障害を許容できます。\
例えば、3 ノードクラスタの場合、1 ノードだけがクラッシュした状態であれば、正しく動作し続けます。

クラスタ構成は動的に変更できますが、いくつか制約があります。再構成も Raft に依存しているため、
クラスタにノードを追加 / 削除するにはクォーラムが必要です。クラスタ内で多数のノードを同時に失い、
再起動する見込みがまったくない場合、Raft は動作を停止し、通常の方法ではクラスタを再構成できなくなります。

ただし、ClickHouse Keeper にはリカバリーモードがあり、1 ノードだけでクラスタを強制的に再構成できます。
これは、ノードを再起動できない場合、あるいは同じエンドポイントで新しいインスタンスを起動できない場合の
最後の手段としてのみ実施してください。

続行する前に注意すべき重要な点:

* 障害が発生したノードが、再びクラスタに接続できないことを確認してください。
* 手順で明示されるまで、新しいノードはいずれも起動しないでください。

上記を確認したら、次の作業を行います:

1. 新しいリーダーとする Keeper ノードを 1 つ選択します。そのノードのデータがクラスタ全体に使用されるため、状態が最も最新であるノードを選ぶことを推奨します。
2. まず最初に、選択したノードの `log_storage_path` と `snapshot_storage_path` ディレクトリをバックアップします。
3. 使用するすべてのノード上でクラスタ構成を再設定します。
4. 選択したノードに 4 文字コマンド `rcvr` を送信して、そのノードをリカバリーモードに移行させるか、あるいはそのノード上の Keeper インスタンスを停止し、`--force-recovery` 引数を付けて再起動します。
5. 新しいノード上の Keeper インスタンスを 1 台ずつ起動し、次のノードを起動する前に、`mntr` が `zk_server_state` に対して `follower` を返すことを確認します。
6. リカバリーモード中、リーダーノードは新しいノードとクォーラムを達成するまで `mntr` コマンドに対してエラーメッセージを返し、クライアントおよびフォロワーからのすべてのリクエストを拒否します。
7. クォーラム達成後、リーダーノードは通常の動作モードに戻り、すべてのリクエストを受け付けるようになります。`mntr` を使用して Raft を検証すると、`zk_server_state` に対して `leader` が返されるはずです。

## Keeper でのディスクの使用 {#using-disks-with-keeper}

Keeper は、スナップショット、ログファイル、および状態ファイルを保存するために、[外部ディスク](/operations/storing-data.md) の一部をサポートしています。

サポートされているディスクの種類は次のとおりです。

* s3&#95;plain
* s3
* local

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

ログ用にディスクを使用するには、`keeper_server.log_storage_disk` 設定にディスク名を指定します。
スナップショット用にディスクを使用するには、`keeper_server.snapshot_storage_disk` 設定にディスク名を指定します。
さらに、`keeper_server.latest_log_storage_disk` および `keeper_server.latest_snapshot_storage_disk` をそれぞれ使用することで、最新のログやスナップショットには別のディスクを使用できます。
その場合、新しいログやスナップショットが作成されると、Keeper はファイルを正しいディスクに自動的に移動します。
状態ファイル用にディスクを使用するには、`keeper_server.state_storage_disk` 設定にディスク名を指定します。

ディスク間でのファイル移動は安全であり、転送の途中で Keeper が停止してもデータを失うリスクはありません。
ファイルが新しいディスクに完全に移動されるまでは、古いディスクから削除されることはありません。

`keeper_server.coordination_settings.force_sync` を `true`（デフォルト値は `true`）に設定した Keeper は、すべての種類のディスクに対して一律の保証を満たすことはできません。
現時点では、`local` タイプのディスクのみが永続的な同期をサポートします。
`force_sync` を使用する場合、`latest_log_storage_disk` を使用していないなら、`log_storage_disk` は `local` ディスクでなければなりません。
`latest_log_storage_disk` を使用する場合、それは常に `local` ディスクである必要があります。
`force_sync` が無効な場合は、あらゆるタイプのディスクを任意の構成で使用できます。

Keeper インスタンスのストレージ構成の一例は、次のようになります。

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

このインスタンスは、最新のログ以外のすべてのログをディスク `log_s3_plain` に保存し、最新のログのみをディスク `log_local` に保存します。
同じロジックがスナップショットにも適用され、最新のスナップショット以外はすべて `snapshot_s3_plain` に保存され、最新のスナップショットのみがディスク `snapshot_local` に保存されます。

### ディスク構成の変更 {#changing-disk-setup}

:::important
新しいディスク構成を適用する前に、すべての Keeper のログとスナップショットを手動でバックアップしてください。
:::

階層化ディスク構成（最新ファイル用に個別のディスクを使用する構成）が定義されている場合、Keeper は起動時にファイルを正しいディスクへ自動的に移動しようとします。
以前と同じ保証が適用され、ファイルが新しいディスクへ完全に移動されるまでは古いディスクから削除されないため、複数回の再起動を安全に行うことができます。

ファイルをまったく新しいディスクへ移動する必要がある場合（または 2 ディスク構成から単一ディスク構成へ移行する場合）、`keeper_server.old_snapshot_storage_disk` と `keeper_server.old_log_storage_disk` を複数定義して使用することができます。

次の設定は、以前の 2 ディスク構成から、まったく新しい単一ディスク構成へ移行する方法を示しています。

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

起動時には、`log_local` および `log_s3_plain` 上のすべてのログファイルが `log_local2` ディスクに移動されます。
また、`snapshot_local` および `snapshot_s3_plain` 上のすべてのスナップショットファイルが `snapshot_local2` ディスクに移動されます。

## ログキャッシュの設定 {#configuring-logs-cache}

ディスクから読み取るデータ量を最小限に抑えるために、Keeper はログエントリをメモリにキャッシュします。
リクエストが大きい場合、ログエントリが多くのメモリを消費するため、キャッシュされるログの量には上限があります。
この上限は次の 2 つの設定で制御されます:
- `latest_logs_cache_size_threshold` - キャッシュに保存される最新ログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要がある後続ログの合計サイズ

デフォルト値が大きすぎる場合は、これら 2 つの設定値を小さくすることでメモリ使用量を削減できます。

:::note
`pfev` コマンドを使用して、それぞれのキャッシュおよびファイルから読み取られたログの量を確認できます。
Prometheus エンドポイントのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡することもできます。
:::

## Prometheus {#prometheus}

Keeper は [Prometheus](https://prometheus.io) によるスクレイプ用のメトリクスデータを公開できます。

設定:

* `endpoint` – Prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。先頭は &#39;/&#39; とします。
* `port` – `endpoint` 用のポート。
* `metrics` – [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開するかを制御するフラグ。
* `events` – [system.events](/operations/system-tables/events) テーブルからメトリクスを公開するかを制御するフラグ。
* `asynchronous_metrics` – [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開するかを制御するフラグ。

**例**

```

Check (replace `127.0.0.1` with the IP addr or hostname of your ClickHouse server):
```

確認します（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```

Please also see the ClickHouse Cloud [Prometheus integration](/integrations/prometheus).

## ClickHouse Keeper user guide {#clickhouse-keeper-user-guide}

This guide provides simple and minimal settings to configure ClickHouse Keeper with an example on how to test distributed operations. This example is performed using 3 nodes on Linux.

### 1. Configure nodes with Keeper settings {#1-configure-nodes-with-keeper-settings}

1. Install 3 ClickHouse instances on 3 hosts (`chnode1`, `chnode2`, `chnode3`). (View the [Quick Start](/getting-started/install/install.mdx) for details on installing ClickHouse.)

2. On each node, add the following entry to allow external communication through the network interface.
    ```

ClickHouse Cloud における [Prometheus 連携](/integrations/prometheus) も参照してください。

## ClickHouse Keeper ユーザーガイド {#clickhouse-keeper-user-guide}

このガイドでは、ClickHouse Keeper を構成するためのシンプルで最小限の設定と、分散処理（分散操作）をテストする方法の例を示します。この例では、Linux 上の 3 ノードを使用します。

### 1. Keeper 設定でノードを構成する {#1-configure-nodes-with-keeper-settings}

1. 3 つのホスト（`chnode1`、`chnode2`、`chnode3`）に 3 つの ClickHouse インスタンスをインストールします。（ClickHouse のインストール方法の詳細は、[クイックスタート](/getting-started/install/install.mdx) を参照してください。）

2. 各ノードで、ネットワークインターフェイス経由の外部通信を許可するために、次のエントリを追加します。
    ```

3. Add the following ClickHouse Keeper configuration to all three servers updating the `<server_id>` setting for each server; for `chnode1` would be `1`, `chnode2` would be `2`, etc.
    ```

3. 次の ClickHouse Keeper 設定を 3 台すべてのサーバーに追加し、各サーバーに対して `<server_id>` 設定を更新します。`chnode1` は `1`、`chnode2` は `2`、というように設定します。
    ```

    These are the basic settings used above:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |port to be used by clients of keeper|9181 default equivalent of 2181 as in zookeeper|
    |server_id| identifier for each ClickHouse Keeper server used in raft configuration| 1|
    |coordination_settings| section to parameters such as timeouts| timeouts: 10000, log level: trace|
    |server    |definition of server participating|list of each server definition|
    |raft_configuration| settings for each server in the keeper cluster| server and settings for each|
    |id      |numeric id of the server for keeper services|1|
    |hostname   |hostname, IP or FQDN of each server in the keeper cluster|`chnode1.domain.com`|
    |port|port to listen on for interserver keeper connections|9234|

4.  Enable the Zookeeper component. It will use the ClickHouse Keeper engine:
    ```

    上で使用した基本的な設定は次のとおりです。

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |Keeper のクライアントが使用するポート|9181（ZooKeeper の 2181 と同等のデフォルト）|
    |server_id| Raft 構成で使用される各 ClickHouse Keeper サーバーの識別子| 1|
    |coordination_settings| タイムアウトなどのパラメータ用のセクション| タイムアウト: 10000、ログレベル: trace|
    |server    |参加するサーバーの定義|各サーバー定義の一覧|
    |raft_configuration| Keeper クラスター内の各サーバーの設定| 各サーバーとその設定|
    |id      |Keeper サービス用のサーバーの数値 ID|1|
    |hostname   |Keeper クラスター内の各サーバーのホスト名、IP または FQDN|`chnode1.domain.com`|
    |port|サーバー間 Keeper 接続用のリッスンポート|9234|

4. Zookeeper コンポーネントを有効化します。これは ClickHouse Keeper エンジンを使用します。
    ```

    These are the basic settings used above:

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |list of nodes for ClickHouse Keeper connections|settings entry for each server|
    |host|hostname, IP or FQDN of each ClickHouse keeper node| `chnode1.domain.com`|
    |port|ClickHouse Keeper client port| 9181|

5. Restart ClickHouse and verify that each Keeper instance is running. Execute the following command on each server. The `ruok` command returns `imok` if Keeper is running and healthy:
    ```

    上で使用した基本的な設定は次のとおりです。

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper への接続用ノードの一覧|各サーバーごとの設定エントリ|
    |host|各 ClickHouse Keeper ノードのホスト名、IP または FQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeper のクライアント用ポート| 9181|

5. ClickHouse を再起動し、各 Keeper インスタンスが稼働していることを確認します。各サーバー上で次のコマンドを実行します。`ruok` コマンドは、Keeper が稼働して健全な状態であれば `imok` を返します。
    ```

6. The `system` database has a table named `zookeeper` that contains the details of your ClickHouse Keeper instances. Let's view the table:
    ```

6. `system` データベースには、ClickHouse Keeper インスタンスの詳細が含まれる `zookeeper` という名前のテーブルがあります。次のようにテーブルを参照します。
    ```

    The table looks like:
    ```

テーブルは次のとおりです。

```

### 2.  Configure a cluster in ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. Let's configure a simple cluster with 2 shards and only one replica on 2 of the nodes. The third node will be used to achieve a quorum for the requirement in ClickHouse Keeper. Update the configuration on `chnode1` and `chnode2`. The following cluster defines 1 shard on each node for a total of 2 shards with no replication. In this example, some of the data will be on node and some will be on the other node:
    ```

### 2.  ClickHouse でクラスタを構成する {#2--configure-a-cluster-in-clickhouse}

1. 2 つのノード上に、2 シャード・各 1 レプリカというシンプルなクラスタを構成します。3 台目のノードは、ClickHouse Keeper の要件であるクォーラムを満たすために使用します。`chnode1` と `chnode2` の設定を更新します。次のクラスタ定義では、各ノードに 1 つずつシャードを配置し、合計 2 シャードとし、レプリケーションは行いません。この例では、データの一部は一方のノードに、残りはもう一方のノードに配置されます。

   ```

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |shard   |list of replicas on the cluster definition|list of replicas for each shard|
    |replica|list of settings for each replica|settings entries for each replica|
    |host|hostname, IP or FQDN of server that will host a replica shard|`chnode1.domain.com`|
    |port|port used to communicate using the native tcp protocol|9000|
    |user|username that will be used to authenticate to the cluster instances|default|
    |password|password for the user define to allow connections to cluster instances|`ClickHouse123!`|

2. Restart ClickHouse and verify the cluster was created:
    ```

   | Parameter | Description                           | Example              |
   | --------- | ------------------------------------- | -------------------- |
   | shard     | クラスタ定義内のシャード（レプリカの集合）                 | 各シャードごとのレプリカのリスト     |
   | replica   | 各レプリカの設定                              | 各レプリカの設定エントリ         |
   | host      | レプリカシャードを配置するサーバのホスト名、IP、または FQDN     | `chnode1.domain.com` |
   | port      | ネイティブ TCP プロトコルで通信するために使用されるポート       | 9000                 |
   | user      | クラスタインスタンスへの認証に使用されるユーザー名             | default              |
   | password  | クラスタインスタンスへの接続を許可するために定義されたユーザーのパスワード | `ClickHouse123!`     |

2. ClickHouse を再起動し、クラスタが作成されたことを確認します。

   ```

    You should see your cluster:
    ```

   次のようにクラスタが表示されます。

   ```

### 3. Create and test distributed table {#3-create-and-test-distributed-table}

1.  Create a new database on the new cluster using ClickHouse client on `chnode1`. The `ON CLUSTER` clause automatically creates the database on both nodes.
    ```

### 3. 分散テーブルを作成してテストする {#3-create-and-test-distributed-table}

1. `chnode1` 上の ClickHouse クライアントを使用して、新しいクラスタ上に新しいデータベースを作成します。`ON CLUSTER` 句により、データベースは自動的に両方のノード上に作成されます。
   ```

2. Create a new table on the `db1` database. Once again, `ON CLUSTER` creates the table on both nodes.
    ```

2. `db1` データベース上に新しいテーブルを作成します。ここでも、`ON CLUSTER` 句によって両方のノード上にテーブルが作成されます。
    ```

3. On the `chnode1` node, add a couple of rows:
    ```

3. `chnode1` ノードで、いくつかの行を追加します:
    ```

4. Add a couple of rows on the `chnode2` node:
    ```

4. `chnode2` ノードでも、いくつかの行を追加します:
    ```

5. Notice that running a `SELECT` statement on each node only shows the data on that node. For example, on `chnode1`:
    ```

5. 各ノードで `SELECT` 文を実行しても、そのノード上のデータしか表示されないことが分かります。たとえば、`chnode1` では:
    ```

    ```

    ```

    On `chnode2`:
6.
    ```

    `chnode2` では:
6.
    ```

    ```

    ```

6. You can create a `Distributed` table to represent the data on the two shards. Tables with the `Distributed` table engine do not store any data of their own, but allow distributed query processing on multiple servers. Reads hit all the shards, and writes can be distributed across the shards. Run the following query on `chnode1`:
    ```

6. 2 つのシャード上のデータを表現するために `Distributed` テーブルを作成できます。`Distributed` テーブルエンジンを使用するテーブル自体はデータを保持しませんが、複数サーバーにまたがる分散クエリ処理を可能にします。読み取りはすべてのシャードに対して行われ、書き込みはシャード間に分散できます。`chnode1` で次のクエリを実行します:
    ```

7. Notice querying `dist_table` returns all four rows of data from the two shards:
    ```

7. `dist_table` に対してクエリを実行すると、2 つのシャードから 4 行すべてのデータが返されることが分かります:
    ```

    ```

    ```

### Summary {#summary}

This guide demonstrated how to set up a cluster using ClickHouse Keeper. With ClickHouse Keeper, you can configure clusters and define distributed tables that can be replicated across shards.

## Configuring ClickHouse Keeper with unique paths {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### Description {#description}

This article describes how to use the built-in `{uuid}` macro setting
to create unique entries in ClickHouse Keeper or ZooKeeper. Unique
paths help when creating and dropping tables frequently because
this avoids having to wait several minutes for Keeper garbage collection
to remove path entries as each time a path is created a new `uuid` is used
in that path; paths are never reused.

### Example environment {#example-environment}
A three node cluster that will be configured to have ClickHouse Keeper
on all three nodes, and ClickHouse on two of the nodes. This provides
ClickHouse Keeper with three nodes (including a tiebreaker node), and
a single ClickHouse shard made up of two replicas.

|node|description|
|-----|-----|
|`chnode1.marsnet.local`|data node - cluster `cluster_1S_2R`|
|`chnode2.marsnet.local`|data node - cluster `cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeper tie breaker node|

Example config for cluster:
```

### まとめ {#summary}

このガイドでは、ClickHouse Keeper を使用してクラスタをセットアップする方法を説明しました。ClickHouse Keeper を使用すると、クラスタを構成し、シャード間でレプリケート可能な分散テーブルを定義できます。

## 一意のパスを使った ClickHouse Keeper の構成 {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />

### 説明 {#description}

この記事では、組み込みの `{uuid}` マクロ設定を使用して、
ClickHouse Keeper または ZooKeeper に一意のエントリを作成する方法を説明します。
テーブルを頻繁に作成・削除する場合、一意のパスを使用すると便利です。各パスを作成するたびに
そのパス内で新しい `uuid` が使用され、パスは再利用されないため、
Keeper のガベージコレクションがパスエントリを削除するまで数分待つ必要がなくなります。

### サンプル環境 {#example-environment}

3 ノードのクラスタを使用し、3 つすべてのノードに ClickHouse Keeper を構成し、
そのうち 2 つのノードに ClickHouse を構成します。これにより、
ClickHouse Keeper 用に 3 ノード (タイブレーカーノードを含む) が用意され、
2 つのレプリカで構成された 1 つの ClickHouse シャードが構成されます。

| node                    | description                   |
| ----------------------- | ----------------------------- |
| `chnode1.marsnet.local` | データノード - クラスタ `cluster_1S_2R` |
| `chnode2.marsnet.local` | データノード - クラスタ `cluster_1S_2R` |
| `chnode3.marsnet.local` | ClickHouse Keeper タイブレーカーノード  |

クラスタの設定例:

```

### Procedures to set up tables to use `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. Configure Macros on each server
example for server 1:
```

### `{uuid}` を使用するためのテーブル設定手順 {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを設定します
   サーバー 1 の例:

```
:::note
Notice that we define macros for `shard` and `replica`, but that `{uuid}` is not defined here, it is built-in and there is no need to define.
:::

2. Create a Database

```

:::note
`shard` と `replica` についてはマクロを定義していますが、`{uuid}` はここでは定義されていない点に注意してください。これは組み込みのものなので、あらためて定義する必要はありません。
:::

2. データベースを作成する

```

```

```

3. Create a table on the cluster using the macros and `{uuid}`

```

3. マクロと`{uuid}`を使用してクラスター上にテーブルを作成する

```

```

```

4.  Create a distributed table

```

┌─host──────────────────┬─port─┬─status─┬─error─┬─num&#95;hosts&#95;remaining─┬─num&#95;hosts&#95;active─┐
│ chnode1.marsnet.local │ 9440 │      0 │       │                   1 │                0 │
│ chnode2.marsnet.local │ 9440 │      0 │       │                   0 │                0 │
└───────────────────────┴──────┴────────┴───────┴─────────────────────┴──────────────────┘

````

```sql
CREATE TABLE db_uuid.dist_uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = Distributed('cluster_1S_2R', 'db_uuid', 'uuid_table1' );
````

### Testing {#testing}
1.  Insert data into first node (e.g `chnode1`)
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

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 1, 'abc');
```

2. Insert data into second node (e.g., `chnode2`)
```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: 0f178db7-50a6-48e2-9a1b-52ed14e6e0f9

Ok.

1 row in set. Elapsed: 0.033 sec.
```

```sql
INSERT INTO db_uuid.uuid_table1
   ( id, column1)
   VALUES
   ( 2, 'def');
```

3. View records using distributed table
```response
INSERT INTO db_uuid.uuid_table1 (id, column1) FORMAT Values

Query id: edc6f999-3e7d-40a0-8a29-3137e97e3607

Ok.

1 row in set. Elapsed: 0.529 sec.
```

```sql
SELECT * FROM db_uuid.dist_uuid_table1;
```

### Alternatives {#alternatives}
The default replication path can be defined beforehand by macros and using also `{uuid}`

1. Set default for tables on each node
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

2行が設定されました。経過時間: 0.007秒。
```
:::tip
You can also define a macro `{database}` on each node if nodes are used for certain databases.
:::

2. Create table without explicit parameters:
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

```sql
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER 'cluster_1S_2R'
   (
     id UInt64,
     column1 String
   )
   ENGINE = ReplicatedMergeTree
   ORDER BY (id);
```

3. Verify it used the settings used in default config
```response
CREATE TABLE db_uuid.uuid_table1 ON CLUSTER cluster_1S_2R
(
    `id` UInt64,
    `column1` String
)
ENGINE = ReplicatedMergeTree
ORDER BY id
```

````

3. デフォルト設定が使用されていることを確認します
```

### Troubleshooting {#troubleshooting}

Example command to get table information and UUID:
````

```

Example command to get information about the table in zookeeper with UUID for the table above
```

### トラブルシューティング {#troubleshooting}

テーブル情報とUUIDを取得するためのコマンド例:

```

:::note
Database must be `Atomic`, if upgrading from a previous version, the
`default` database is likely of `Ordinary` type.
:::

To check:

For example,

```

上記のテーブルに対応する UUID テーブルの情報を ZooKeeper から取得するためのコマンド例

```

```

:::note
データベースは `Atomic` である必要があります。以前のバージョンからアップグレードした場合、
`default` データベースはおそらく `Ordinary` タイプになっています。
:::

確認するには:

例えば、

```

## ClickHouse Keeper dynamic reconfiguration {#reconfiguration}

<SelfManaged />

### Description {#description-1}

ClickHouse Keeper partially supports ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
command for dynamic cluster reconfiguration if `keeper_server.enable_reconfiguration` is turned on.

:::note
If this setting is turned off, you may reconfigure the cluster by altering the replica's `raft_configuration`
section manually. Make sure you the edit files on all replicas as only the leader will apply changes.
Alternatively, you can send a `reconfig` query through any ZooKeeper-compatible client.
:::

A virtual node `/keeper/config` contains last committed cluster configuration in the following format:

```

```

- Each server entry is delimited by a newline.
- `server_type` is either `participant` or `learner` ([learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) does not participate in leader elections).
- `server_priority` is a non-negative integer telling [which nodes should be prioritised on leader elections](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md).
  Priority of 0 means server will never be a leader.

Example:

```

## ClickHouse Keeper の動的再構成 {#reconfiguration}

<SelfManaged />

### 説明 {#description-1}

ClickHouse Keeper は、`keeper_server.enable_reconfiguration` が有効になっている場合に、ZooKeeper の [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)
コマンドによるクラスタの動的な再構成を部分的にサポートします。

:::note
この設定が無効になっている場合は、レプリカの `raft_configuration`
セクションを手動で変更することでクラスタを再構成できます。変更はリーダーのみが適用するため、必ずすべてのレプリカ上のファイルを編集してください。
あるいは、任意の ZooKeeper 互換クライアントを介して `reconfig` クエリを送信することもできます。
:::

仮想ノード `/keeper/config` には、次の形式で直近にコミットされたクラスタ構成が格納されています。

```

You can use `reconfig` command to add new servers, remove existing ones, and change existing servers'
priorities, here are examples (using `clickhouse-keeper-client`):

```

* 各サーバーエントリは改行で区切られます。
* `server_type` は `participant` か `learner` のいずれかです（[`learner`](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md) はリーダー選出に参加しません）。
* `server_priority` は、[リーダー選出時にどのノードを優先すべきか](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md) を指定する 0 以上の整数です。
  プライオリティが 0 の場合、そのサーバーがリーダーになることはありません。

例：

```

And here are examples for `kazoo`:

```

`reconfig` コマンドを使用すると、新しいサーバーの追加、既存サーバーの削除、および既存サーバーの優先順位の変更が行えます。次に、`clickhouse-keeper-client` を使用した例を示します:

```bash
# 新しいサーバーを2台追加 {#add-two-new-servers}
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"
# 他のサーバーを2台削除 {#remove-two-other-servers}
reconfig remove "3,4"
# 既存サーバーの優先度を8に変更 {#change-existing-server-priority-to-8}
reconfig add "server.5=localhost:5123;participant;8"
```

また、`kazoo` の例は次のとおりです。

```python
# 2つの新しいサーバーを追加し、2つの他のサーバーを削除 {#add-two-new-servers-remove-two-other-servers}
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")
```

# 既存サーバーの優先度を 8 に変更 {#change-existing-server-priority-to-8}

reconfig(joining=&quot;server.5=localhost:5123;participant;8&quot;, leaving=None)

```

`joining`内のサーバーは、上記で説明したサーバー形式に従う必要があります。サーバーエントリはカンマで区切ります。
新しいサーバーを追加する際、`server_priority`(デフォルト値は1)と`server_type`(デフォルト値は`participant`)は省略できます。

既存のサーバーの優先度を変更する場合は、目標の優先度を指定して`joining`に追加します。
サーバーのホスト、ポート、およびタイプは既存のサーバー構成と一致する必要があります。

サーバーは`joining`と`leaving`に記述された順序で追加および削除されます。
`joining`からのすべての更新は、`leaving`からの更新よりも先に処理されます。

Keeperの再構成実装には以下の注意事項があります:

- 増分再構成のみがサポートされています。空でない`new_members`を含むリクエストは拒否されます。

  ClickHouse Keeperの実装は、メンバーシップを動的に変更するためにNuRaft APIに依存しています。NuRaftは一度に1つのサーバーを追加または削除する方式を採用しています。これは、構成への各変更(`joining`の各部分、`leaving`の各部分)が個別に決定される必要があることを意味します。したがって、エンドユーザーに誤解を与える可能性があるため、一括再構成は利用できません。

  サーバータイプ(participant/learner)の変更もNuRaftでサポートされていないため不可能です。唯一の方法はサーバーを削除して追加することですが、これも誤解を招く可能性があります。

- 返される`znodestat`値は使用できません。
- `from_version`フィールドは使用されません。`from_version`が設定されたすべてのリクエストは拒否されます。
  これは、`/keeper/config`が仮想ノードであり、永続ストレージに保存されるのではなく、リクエストごとに指定されたノード構成で動的に生成されるためです。
  この設計は、NuRaftがすでにこの構成を保存しているため、データの重複を避けるために採用されました。
- ZooKeeperとは異なり、`sync`コマンドを送信してクラスターの再構成を待機する方法はありません。
  新しい構成は_最終的に_適用されますが、時間の保証はありません。
- `reconfig`コマンドはさまざまな理由で失敗する可能性があります。クラスターの状態を確認して、更新が適用されたかどうかを確認できます。
```

## 単一ノードの keeper をクラスタに変換する {#converting-a-single-node-keeper-into-a-cluster}

実験用の単一ノード keeper をクラスタに拡張したい場合があります。3 ノードのクラスタの場合の手順を次に示します。

- **重要**: 新しいノードは、現在のクォーラムより少ない台数のグループで追加する必要があります。そうしないと、新ノード同士でリーダーが選出されてしまいます。この例では 1 台ずつ追加します。
- 既存の keeper ノードでは、設定パラメータ `keeper_server.enable_reconfiguration` を有効にしておく必要があります。
- keeper クラスタの新しい完全な設定を用いて 2 台目のノードを起動します。
- 起動後、[`reconfig`](#reconfiguration) を使ってノード 1 にこのノードを追加します。
- 続いて 3 台目のノードを起動し、[`reconfig`](#reconfiguration) を使って追加します。
- `clickhouse-server` の設定を更新し、新しい keeper ノードを追加してから、変更を反映するために再起動します。
- ノード 1 の Raft の設定を更新し、必要に応じて再起動します。

この手順に慣れるための [sandbox リポジトリ](https://github.com/ClickHouse/keeper-extend-cluster) を用意しています。

## 未サポートの機能 {#unsupported-features}

ClickHouse Keeper は ZooKeeper との完全な互換性を目指していますが、現時点では一部の機能が未実装となっています（開発は進行中です）:

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は `Stat` オブジェクトを返すことをサポートしていません
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat)) は [TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL) をサポートしていません
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode)) は [`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT) ウォッチでは動作しません
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean)) および [`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean)) はサポートされていません
- `setWatches` はサポートされていません
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html) 型の znode の作成はサポートされていません
- [`SASL authentication`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL) はサポートされていません
