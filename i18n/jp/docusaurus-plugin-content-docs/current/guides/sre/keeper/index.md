---
'slug': '/guides/sre/keeper/clickhouse-keeper'
'sidebar_label': 'ClickHouse Keeperの設定'
'sidebar_position': 10
'keywords':
- 'Keeper'
- 'ZooKeeper'
- 'clickhouse-keeper'
'description': 'ClickHouse Keeper、またはclickhouse-keeperは、ZooKeeperに代わり、レプリケーションとコーディネーションを提供します。'
'title': 'ClickHouse Keeper'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';


# ClickHouse Keeper (clickhouse-keeper)

<SelfManaged />

ClickHouse Keeper はデータの [レプリケーション](/engines/table-engines/mergetree-family/replication.md) および [分散 DDL](/sql-reference/distributed-ddl.md) クエリの実行のための調整システムを提供します。ClickHouse Keeper は ZooKeeper と互換性があります。
### 実装の詳細 {#implementation-details}

ZooKeeper は最初の有名なオープンソース調整システムの一つです。Java で実装されており、非常にシンプルで強力なデータモデルを持っています。ZooKeeper の調整アルゴリズムである ZooKeeper Atomic Broadcast (ZAB) は、各 ZooKeeper ノードがローカルで読み取りを行うため、読み取りについての線形性の保証を提供しません。ZooKeeper とは異なり、ClickHouse Keeper は C++ で書かれており、[RAFT アルゴリズム](https://raft.github.io/) の [実装](https://github.com/eBay/NuRaft)を使用しています。このアルゴリズムは、読み取りと書き込みの線形性を可能にし、さまざまな言語でのいくつかのオープンソース実装があります。

デフォルトでは、ClickHouse Keeper は ZooKeeper と同じ保証を提供します：線形性のある書き込みと線形性のない読み取りです。互換性のあるクライアントサーバープロトコルがあるため、標準の ZooKeeper クライアントを使用して ClickHouse Keeper と対話できます。スナップショットとログは ZooKeeper とは互換性のないフォーマットですが、`clickhouse-keeper-converter` ツールを使用することで、ZooKeeper データを ClickHouse Keeper のスナップショットに変換できます。ClickHouse Keeper のインターサーバープロトコルも ZooKeeper とは互換性がないため、混合 ZooKeeper / ClickHouse Keeper クラスターは不可能です。

ClickHouse Keeper は [ZooKeeper](https://zookeeper.apache.org/doc/r3.1.2/zookeeperProgrammers.html#sc_ZooKeeperAccessControl) と同様にアクセス制御リスト (ACL) をサポートしています。ClickHouse Keeper は同じセットの権限をサポートしており、同一のビルトインスキーム `world`, `auth`, `digest` を持っています。ダイジェスト認証スキームは `username:password` のペアを使用し、パスワードは Base64 でエンコードされます。

:::note
外部統合はサポートされていません。
:::
### 設定 {#configuration}

ClickHouse Keeper は ZooKeeper のスタンドアロン置き換えとして使用することも、ClickHouse サーバーの内部部分として使用することもできます。いずれの場合も、設定はほぼ同じ `.xml` ファイルです。
#### Keeper 設定の設定 {#keeper-configuration-settings}

主な ClickHouse Keeper の設定タグは `<keeper_server>` で、以下のパラメータを持っています：

| パラメータ                          | 説明                                                                                                                                                                                                                                         | デフォルト                                                                                                      |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `tcp_port`                           | クライアントが接続するためのポート。                                                                                                                                                                                                                       | `2181`                                                                                                       |
| `tcp_port_secure`                    | クライアントと keeper-server の間の SSL 接続のためのセキュアポート。                                                                                                                                                                                 | -                                                                                                            |
| `server_id`                          | 一意のサーバー ID、ClickHouse Keeper クラスターの各参加者は一意の番号 (1, 2, 3, ...) を持たなければなりません。                                                                                                                                 | -                                                                                                            |
| `log_storage_path`                   | 調整ログのパス。ZooKeeper と同様に、ログは忙しくないノードに保存するのが最善です。                                                                                                                                                          | -                                                                                                            |
| `snapshot_storage_path`              | 調整スナップショットのパス。                                                                                                                                                                                                                     | -                                                                                                            |
| `enable_reconfiguration`             | [`reconfig`](#reconfiguration) を介した動的クラスター再構成を有効にします。                                                                                                                                                                          | `False`                                                                                                      |
| `max_memory_usage_soft_limit`        | Keeper の最大メモリ使用量のソフトリミット (バイト単位)。                                                                                                                                                                                                     | `max_memory_usage_soft_limit_ratio` * `physical_memory_amount`                                               |
| `max_memory_usage_soft_limit_ratio`  | `max_memory_usage_soft_limit` が設定されていない場合または 0 に設定されている場合、この値を使用してデフォルトのソフトリミットを定義します。                                                                                                                                     | `0.9`                                                                                                        |
| `cgroups_memory_observer_wait_time`  | `max_memory_usage_soft_limit` が設定されていない場合または `0` に設定されている場合、この間隔を使用して物理メモリの量を観察します。メモリ量が変化した場合、`max_memory_usage_soft_limit_ratio` により Keeper のメモリソフトリミットを再計算します。 | `15`                                                                                                         |
| `http_control`                       | [HTTP制御](#http-control) インターフェースの設定。                                                                                                                                                                                           | -                                                                                                            |
| `digest_enabled`                     | リアルタイムデータ整合性チェックを有効にします。                                                                                                                                                                                                             | `True`                                                                                                       |
| `create_snapshot_on_exit`            | シャットダウン時にスナップショットを作成します。                                                                                                                                                                                                                   | -                                                                                                            |
| `hostname_checks_enabled`            | クラスター設定のためのサニティホスト名チェックを有効にします（例：ローカルホストがリモートエンドポイントと一緒に使用される場合）。                                                                                                                                           | `True`                                                                                                       |
| `four_letter_word_white_list`        | 4lw コマンドのホワイトリスト。                                                                                                                                                                                                                         | `conf, cons, crst, envi, ruok, srst, srvr, stat, wchs, dirs, mntr, isro, rcvr, apiv, csnp, lgif, rqld, ydld` |
|`enable_ipv6`| IPv6 を有効にします。 | `True`|

他の共通のパラメータは ClickHouse サーバー設定から引き継がれます（`listen_host`, `logger` など）。
#### 内部調整設定 {#internal-coordination-settings}

内部調整設定は `<keeper_server>.<coordination_settings>` セクションに位置し、以下のパラメータを持っています：

| パラメータ                            | 説明                                                                                                                                                                                                              | デフォルト                                                                                                      |
|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `operation_timeout_ms`                 | 単一のクライアント操作のタイムアウト (ms)                                                                                                                                                                               | `10000`                                                                                                      |
| `min_session_timeout_ms`               | クライアントセッションの最小タイムアウト (ms)                                                                                                                                                                                      | `10000`                                                                                                      |
| `session_timeout_ms`                   | クライアントセッションの最大タイムアウト (ms)                                                                                                                                                                                      | `100000`                                                                                                     |
| `dead_session_check_period_ms`         | ClickHouse Keeper がデッドセッションをチェックして削除する頻度 (ms)                                                                                                                                               | `500`                                                                                                        |
| `heart_beat_interval_ms`               | ClickHouse Keeper リーダーがフォロワーにハートビートを送信する頻度 (ms)                                                                                                                                              | `500`                                                                                                        |
| `election_timeout_lower_bound_ms`      | フォロワーがこの間隔内にリーダーからハートビートを受信しない場合、リーダー選挙を開始できます。`election_timeout_upper_bound_ms` 以下でなければなりません。理想的には等しくないべきです。  | `1000`                                                                                                       |
| `election_timeout_upper_bound_ms`      | フォロワーがこの間隔内にリーダーからハートビートを受信しない場合、リーダー選挙を開始しなければなりません。                                                                                                    | `2000`                                                                                                       |
| `rotate_log_storage_interval`          | 単一ファイルに保存するログレコードの数。                                                                                                                                                                          | `100000`                                                                                                     |
| `reserved_log_items`                   | コンパクション前に保存する調整ログレコードの数。                                                                                                                                                            | `100000`                                                                                                     |
| `snapshot_distance`                    | ClickHouse Keeper が新しいスナップショットを作成する頻度（ログ内のレコード数）。                                                                                                                                | `100000`                                                                                                     |
| `snapshots_to_keep`                    | 保存するスナップショットの数。                                                                                                                                                                                              | `3`                                                                                                          |
| `stale_log_gap`                        | リーダーがフォロワーを古いと見なし、ログではなくスナップショットを送信するためのしきい値。                                                                                                                          | `10000`                                                                                                      |
| `fresh_log_gap`                        | ノードが新鮮になった時。                                                                                                                                                                                                  | `200`                                                                                                        |
| `max_requests_batch_size`              | RAFT に送信される前のリクエスト数の最大バッチサイズ。                                                                                                                                                      | `100`                                                                                                        |
| `force_sync`                           | 調整ログに書き込みのたびに `fsync` を呼び出します。                                                                                                                                                                          | `true`                                                                                                       |
| `quorum_reads`                         | 読み取りリクエストをほぼ同様のスピードで全 RAFT コンセンサスとして実行します。                                                                                                                                         | `false`                                                                                                      |
| `raft_logs_level`                      | 調整についてのテキストログレベル（トレース、デバッグなど）。                                                                                                                                                         | `system default`                                                                                             |
| `auto_forwarding`                      | フォロワーからリーダーへの書き込みリクエストを転送できるようにします。                                                                                                                                                            | `true`                                                                                                       |
| `shutdown_timeout`                     | 内部接続を完了させてシャットダウンするまでの待機時間 (ms)。                                                                                                                                                                   | `5000`                                                                                                       |
| `startup_timeout`                      | サーバーが指定されたタイムアウト内に他の過半数参加者に接続できない場合、終了します (ms)。                                                                                                              | `30000`                                                                                                      |
| `async_replication`                    | 非同期レプリケーションを有効にします。すべての書き込みおよび読み取りの保証は維持しつつ、パフォーマンスを向上させます。この設定はデフォルトでは無効になっており、後方互換性を壊さないようにされます。                                         | `false`                                                                                                      |
| `latest_logs_cache_size_threshold`     | 最新のログエントリのメモリ内キャッシュの最大総サイズ。                                                                                                                                                              | `1GiB`                                                                                                       |
| `commit_logs_cache_size_threshold`     | コミットに必要なログエントリのメモリ内キャッシュの最大総サイズ。                                                                                                                                              | `500MiB`                                                                                                     |
| `disk_move_retries_wait_ms`            | ファイルがディスク間で移動している間に失敗した後のリトライ間の待機時間。                                                                                                               | `1000`                                                                                                       |
| `disk_move_retries_during_init`        | 初期化中にディスク間でファイルを移動している際に、失敗した後のリトライ数。                                                                                                    | `100`                                                                                                        |
| `experimental_use_rocksdb`             | rocksdb をバックエンドストレージとして使用します。                                                                                                    | `0`                                                                                                        |

クォーラムの設定は `<keeper_server>.<raft_configuration>` セクションにあり、サーバーの説明が含まれています。

全体のクォーラムに対する唯一のパラメータは `secure` で、クォーラム参加者間の通信に対する暗号化接続を有効にします。このパラメータは、ノード間の内部通信に対して SSL 接続が必要な場合は `true` に設定できますが、それ以外の場合は指定しないでおきます。

各 `<server>` に対する主なパラメータは次の通りです：

- `id` — クォーラム内のサーバー識別子。
- `hostname` — このサーバーが配置されているホスト名。
- `port` — このサーバーが接続を待機するポート。
- `can_become_leader` — サーバーを `learner` として設定するには `false` に設定します。省略した場合、値は `true` になります。

:::note
ClickHouse Keeper クラスターのトポロジーが変更された場合（例：サーバーの置き換え）、`server_id` と `hostname` のマッピングを一貫して保持し、異なるサーバーに対して既存の `server_id` をシャッフルまたは再利用しないようにしてください（自動化スクリプトに依存して ClickHouse Keeper をデプロイする場合はこれが発生する可能性があります）。

Keeper インスタンスのホストが変更できる場合は、生の IP アドレスの代わりにホスト名を定義して使用することをお勧めします。ホスト名を変更することは、サーバーを削除して再追加することと同じです。これは状況によっては不可能な場合があります（例えば、過半数の Keeper インスタンスが不足している場合など）。
:::

:::note
`async_replication` は、後方互換性を維持するためにデフォルトで無効になっています。クラスター内のすべての Keeper インスタンスが `async_replication` をサポートするバージョン（v23.9+）で実行されている場合は、それを有効にすることをお勧めします。これにより、デメリットなしでパフォーマンスを向上させることができます。
:::

3ノードのクォーラムの設定例は、`test_keeper_` プレフィックスを持つ [統合テスト](https://github.com/ClickHouse/ClickHouse/tree/master/tests/integration) に見つけることができます。サーバー #1 の設定例：

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

ClickHouse Keeper は ClickHouse サーバーパッケージにバンドルされており、`<keeper_server>` の設定を `/etc/your_path_to_config/clickhouse-server/config.xml` に追加し、通常どおり ClickHouse サーバーを起動するだけです。スタンドアロンの ClickHouse Keeper を実行する場合は、同様の方法で次のように起動できます：

```bash
clickhouse-keeper --config /etc/your_path_to_config/config.xml
```

シンボリックリンク（`clickhouse-keeper`）がない場合は、作成するか、`clickhouse` に `keeper` を引数として指定できます：

```bash
clickhouse keeper --config /etc/your_path_to_config/config.xml
```
### 4文字コマンド {#four-letter-word-commands}

ClickHouse Keeper は、ZooKeeper とほぼ同じ 4lw コマンドも提供します。各コマンドは `mntr`, `stat` などの4文字で構成されています。いくつかの興味深いコマンドもあります：`stat` はサーバーや接続されているクライアントに関する一般的な情報を提供し、`srvr` と `cons` はそれぞれサーバーと接続の詳細を提供します。

4lw コマンドはホワイトリスト設定 `four_letter_word_white_list` を持っており、デフォルト値は `conf,cons,crst,envi,ruok,srst,srvr,stat,wchs,dirs,mntr,isro,rcvr,apiv,csnp,lgif,rqld,ydld` です。

telnet または nc で、クライアントポートを介して ClickHouse Keeper にコマンドを発行できます。

```bash
echo mntr | nc localhost 9181
```

以下は詳細な 4lw コマンドです：

- `ruok`: サーバーがエラーステートでない状態で実行中かどうかをテストします。サーバーが実行中の場合は `imok` で応答します。それ以外の場合、全く応答しません。`imok` の応答は、サーバーがクォーラムに参加していることを必ずしも示すものではなく、サーバープロセスがアクティブで指定されたクライアントポートにバインドされていることを示します。クォーラムおよびクライアント接続情報に関する状態の詳細については「stat」を使用してください。

```response
imok
```

- `mntr`: クラスターの状態を監視するために使用できる変数のリストを出力します。

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

- `srvr`: サーバーの詳細な情報をリストします。

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

- `stat`: サーバーと接続されているクライアントの簡潔な詳細をリストします。

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

- `srst`: サーバーの統計をリセットします。このコマンドは `srvr`, `mntr`, `stat` の結果に影響を与えます。

```response
Server stats reset.
```

- `conf`: サービス設定に関する詳細を印刷します。

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

- `cons`: このサーバーに接続されているすべてのクライアントの接続/セッションの詳細をフルリストします。受信/送信されたパケットの数、セッション ID、操作のレイテンシ、最後に実行された操作などの情報が含まれます。

```response
192.168.1.1:52163(recved=0,sent=0,sid=0xffffffffffffffff,lop=NA,est=1636454787393,to=30000,lzxid=0xffffffffffffffff,lresp=0,llat=0,minlat=0,avglat=0,maxlat=0)
192.168.1.1:52042(recved=9,sent=18,sid=0x0000000000000001,lop=List,est=1636454739887,to=30000,lcxid=0x0000000000000005,lzxid=0x0000000000000005,lresp=1636454739892,llat=0,minlat=0,avglat=0,maxlat=0)
```

- `crst`: すべての接続に対して接続/セッションの統計をリセットします。

```response
Connection stats reset.
```

- `envi`: サービス環境に関する詳細を印刷します。

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

- `isro`: サーバーが読み取り専用モードで実行中かどうかをテストします。サーバーが読み取り専用モードの場合は `ro` で応答し、そうでない場合は `rw` で応答します。

```response
rw
```

- `wchs`: サーバーに対するウォッチの簡素な情報をリストします。

```response
1 connections watching 1 paths
Total watches:1
```

- `wchc`: セッションごとにサーバーに対するウォッチの詳細な情報をリストします。これは、関連するウォッチ（パス）を持つセッション（接続）のリストを出力します。ウォッチの数に応じて、この操作はコストがかかる可能性があるため（サーバーのパフォーマンスに影響を与える可能性があります）、注意して使用してください。

```response
0x0000000000000001
    /clickhouse/task_queue/ddl
```

- `wchp`: パスごとにサーバーに対するウォッチの詳細情報をリストします。これは、関連するセッションを持つパス（znodes）のリストを出力します。ウォッチの数に応じて、この操作もコストがかかる可能性があるため（サーバーのパフォーマンスに影響を与える可能性があります）、注意して使用してください。

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

- `csnp`: スナップショット作成タスクをスケジュールします。成功するとスケジュールされたスナップショットの最後にコミットされたログインデックスを返します。失敗すると「スナップショット作成タスクのスケジュールに失敗しました。」と表示されます。スナップショットが完了したかどうかを判断するには、`lgif` コマンドが役立ちます。

```response
100
```

- `lgif`: Keeper ログ情報。`first_log_idx` : ログストア内の最初のログインデックス； `first_log_term` : 自分の最初のログの用語； `last_log_idx` : ログストア内の最後のログインデックス； `last_log_term` : 自分の最後のログの用語； `last_committed_log_idx` : 状態管理機械内の最後にコミットされたログインデックス； `leader_committed_log_idx` : 自分の視点からリーダーのコミットされたログインデックス； `target_committed_log_idx` : コミットすべきターゲットログインデックス； `last_snapshot_idx` : 最後のスナップショットの最大コミットログインデックス。

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

- `rqld`: 新しいリーダーになるリクエストを送信します。リクエストが送信された場合は「リーダーへのリーダーシップリクエストを送信しました。」を返します。リクエストが送信されなかった場合は「リーダーへのリーダーシップリクエストの送信に失敗しました。」を返します。ノードがすでにリーダーである場合、リクエストが送信されていても結果は同じです。

```response
Sent leadership request to leader.
```

- `ftfl`: すべての機能フラグとそれらが Keeper インスタンスで有効になっているかどうかをリストします。

```response
filtered_list   1
multi_read  1
check_not_exists    0
```

- `ydld`: リーダーシップを譲りフォロワーになるリクエストを送信します。リクエストを受け取ったサーバーがリーダーの場合、最初に書き込み操作を一時停止し、後続者（現リーダーは後続者になることはできません）が最新のログのキャッチアップを終えるまで待機し、その後辞任します。後続者は自動的に選ばれます。リクエストが送信された場合は「リーダーへのリーダーシップ譲渡リクエストを送信しました。」を返します。リクエストが送信されなかった場合は「リーダーへのリーダーシップ譲渡リクエストの送信に失敗しました。」を返します。ノードがすでにフォロワーである場合、リクエストが送信されていても結果は同じです。

```response
Sent yield leadership request to leader.
```

- `pfev`: 収集されたすべてのイベントの値を返します。各イベントについて、イベント名、イベント値、およびイベントの説明を返します。

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

ClickHouse Keeper は、レプリカがトラフィックを受け取る準備ができているかどうかを確認するための HTTP インターフェースを提供します。これは、[Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-readiness-probes) のようなクラウド環境で使用できます。

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
### 機能フラグ {#feature-flags}

Keeper は ZooKeeper およびそのクライアントと完全に互換性がありますが、ClickHouse クライアントが使用できるいくつかのユニークな機能とリクエストタイプも導入しています。これらの機能は後方互換性のない変更をもたらす可能性があるため、デフォルトではほとんどが無効になっており、`keeper_server.feature_flags` 設定を使用して有効にできます。すべての機能を明示的に無効にすることもできます。

Keeper クラスターの新しい機能を有効にしたい場合は、最初にクラスター内のすべての Keeper インスタンスをその機能をサポートするバージョンに更新し、その後機能を有効にすることをお勧めします。

`multi_read` を無効にし、`check_not_exists` を有効にする機能フラグ設定の例：

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

| 機能                    | 説明                                                                                                                                              | デフォルト |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `multi_read`           | 複数のリクエストの読み取りのサポート                                                                                                                           | `1`     |
| `filtered_list`        | ノードの種類（エフェメラルまたは永続的）で結果をフィルタするリストリクエストのサポート                                                             | `1`     |
| `check_not_exists`     | ノードが存在しないことを主張する `CheckNotExists` リクエストのサポート                                                                              | `1`     |
| `create_if_not_exists` | ノードが存在しない場合にノードを作成しようとする `CreateIfNotExists` リクエストのサポート。存在する場合は変更が適用されず、`ZOK` が返されます | `1`     |
| `remove_recursive`     | サブツリーを含むノードを削除する `RemoveRecursive` リクエストのサポート                                                                     | `1`     |

:::note
一部の機能フラグはバージョン 25.7 からデフォルトで有効です。   
Keeper を 25.7+ にアップグレードする推奨方法は、最初に 24.9+ にアップグレードすることです。
:::
### Migration from ZooKeeper {#migration-from-zookeeper}

ZooKeeperからClickHouse Keeperへのシームレスな移行は不可能です。ZooKeeperクラスタを停止し、データを変換し、ClickHouse Keeperを開始する必要があります。 `clickhouse-keeper-converter`ツールは、ZooKeeperのログやスナップショットをClickHouse Keeperのスナップショットに変換することができます。これは、ZooKeeper > 3.4でのみ動作します。移行手順は次のとおりです。

1. すべてのZooKeeperノードを停止します。

2. オプションですが推奨されます：ZooKeeperリーダーノードを見つけ、再起動します。これにより、ZooKeeperは一貫性のあるスナップショットを作成します。

3. リーダー上で`clickhouse-keeper-converter`を実行します。例えば：

```bash
clickhouse-keeper-converter --zookeeper-logs-dir /var/lib/zookeeper/version-2 --zookeeper-snapshots-dir /var/lib/zookeeper/version-2 --output-dir /path/to/clickhouse/keeper/snapshots
```

4. スナップショットを、設定済みの`keeper`を持つClickHouseサーバーノードにコピーするか、ZooKeeperの代わりにClickHouse Keeperを開始します。スナップショットはすべてのノードに保持されなければなりません。そうしないと、空のノードが高速になり、その1つがリーダーになる可能性があります。

:::note
`keeper-converter`ツールは、Keeperのスタンドアロンバイナリからは利用できません。
ClickHouseがインストールされている場合は、バイナリを直接使用できます：

```bash
clickhouse keeper-converter ...
```

さもなければ、[バイナリをダウンロード](../../getting-started/quick-start/oss#download-the-binary)し、ClickHouseをインストールせずに上記のようにツールを実行できます。
:::
### Recovering after losing quorum {#recovering-after-losing-quorum}

ClickHouse KeeperはRaftを使用しているため、クラスターのサイズに応じて一定数のノードのクラッシュを耐えることができます。\
例えば、3ノードのクラスターでは、1ノードのみがクラッシュした場合でも正しく動作し続けます。

クラスター構成は動的に設定できますが、一部制限があります。再構成はRaftに依存しているため、クラスターからノードを追加または削除するには過半数が必要です。同時にクラスター内のノードをたくさん失った場合、再起動のチャンスがなければ、Raftは動作を停止し、従来の方法でクラスターを再構成することを許可しません。

それでも、ClickHouse Keeperには回復モードがあり、ノードが1つだけでクラスターを強制的に再構成することができます。
これは、ノードを再起動できないか、同じエンドポイントで新しいインスタンスを開始できない場合の最後の手段としてのみ行うべきです。

続行する前に注意すべき重要な点：
- フェイルしたノードが再びクラスターに接続できないことを確認してください。
- ステップで指定されるまで、新しいノードを起動しないでください。

上記のことが真であることを確認したら、次のことを行う必要があります：
1. 新しいリーダーとなる1つのKeeperノードを選択します。そのノードのデータはクラスター全体に使用されるため、最新の状態のノードを使用することをお勧めします。
2. 何かをする前に、選択したノードの`log_storage_path`と`snapshot_storage_path`フォルダーのバックアップを作成します。
3. 使用するすべてのノードでクラスターを再構成します。
4. 選択したノードに`rcvr`という4文字のコマンドを送信し、それによってノードを回復モードに移動させるか、選択したノードでKeeperインスタンスを停止し、`--force-recovery`引数を付けて再起動します。
5. 一つずつ、新しいノードでKeeperインスタンスを起動し、次のノードを起動する前に`mntr`が`zk_server_state`に対して`follower`を返すことを確認します。
6. 回復モード中は、リーダーノードが`mntr`コマンドに対してエラーメッセージを返します。新しいノードとの過半数に達するまで、このノードはクライアントおよびフォロワーからのリクエストを拒否します。
7. 過半数に達すると、リーダーノードは通常のモードに戻り、`mntr`を使用してRaft-verifyを実行し、`zk_server_state`が`leader`を返すリクエストをすべて受け入れます。
## Using disks with Keeper {#using-disks-with-keeper}

Keeperはスナップショット、ログファイル、および状態ファイルを保存するために、[外部ディスク](/operations/storing-data.md)のサブセットをサポートしています。

サポートされているディスクタイプは次のとおりです：
- s3_plain
- s3
- local

以下は、構成内のディスク定義の例です。

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

ログのためにディスクを使用するには、`keeper_server.log_storage_disk`構成をディスクの名前に設定する必要があります。
スナップショットのためにディスクを使用するには、`keeper_server.snapshot_storage_disk`構成をディスクの名前に設定する必要があります。
さらに、最新のログまたはスナップショットに別々のディスクを使用するには、それぞれ`keeper_server.latest_log_storage_disk`および`keeper_server.latest_snapshot_storage_disk`を使用できます。
その場合、Keeperは新しいログまたはスナップショットが作成されると、ファイルを正しいディスクに自動的に移動します。
状態ファイルのためにディスクを使用するには、`keeper_server.state_storage_disk`構成をディスクの名前に設定する必要があります。

ディスク間でのファイルの移動は安全であり、Keeperが転送の途中で停止してもデータを失うリスクはありません。
ファイルが完全に新しいディスクに移動されるまで、古いディスクからは削除されません。

`keeper_server.coordination_settings.force_sync`が`true`（デフォルトで`true`）に設定されているKeeperは、すべてのディスクタイプに対していくつかの保証を満たすことができません。
現在のところ、`local`タイプのディスクのみが持続的な同期をサポートしています。
`force_sync`が使用されている場合、`log_storage_disk`は`latest_log_storage_disk`が使用されていない場合、`local`ディスクである必要があります。
`latest_log_storage_disk`が使用されている場合は、常に`local`ディスクでなければなりません。
`force_sync`が無効になっている場合は、すべてのタイプのディスクが任意のセットアップで使用できます。

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

このインスタンスは、最新のログ以外のすべてのログを`log_s3_plain`ディスクに保存し、最新のログを`log_local`ディスクに保存します。
スナップショットにも同じロジックが適用され、最新のスナップショット以外のすべては`snapshot_s3_plain`に保存され、最新のスナップショットは`snapshot_local`ディスクに保存されます。
### Changing disk setup {#changing-disk-setup}

:::important
新しいディスクセットアップを適用する前に、手動ですべてのKeeperのログとスナップショットのバックアップを取ってください。
:::

ティア別のディスクセットアップが定義されている場合（最新ファイル用に別々のディスクを使用）、Keeperは起動時に正しいディスクにファイルを自動的に移動しようとします。
以前と同じ保証が適用されます。ファイルが完全に新しいディスクに移動されるまで、古いディスクからは削除されないため、複数回の再起動が安全に行えます。

ファイルを全く新しいディスクに移動する必要がある場合（または2ディスクセットアップから単一ディスクセットアップに移動する）、`keeper_server.old_snapshot_storage_disk`および`keeper_server.old_log_storage_disk`の複数の定義を使用することができます。

以下の構成は、以前の2ディスクセットアップから全く新しい単一ディスクセットアップに移動する方法を示しています：

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

起動時に、すべてのログファイルが`log_local`および`log_s3_plain`から`log_local2`ディスクに移動されます。
また、すべてのスナップショットファイルは`snapshot_local`および`snapshot_s3_plain`から`snapshot_local2`ディスクに移動されます。
## Configuring logs cache {#configuring-logs-cache}

ディスクから読み取るデータ量を最小限に抑えるために、Keeperはメモリ内にログエントリをキャッシュします。
リクエストが大きい場合、ログエントリがメモリを過剰に消費するため、キャッシュされたログの量には上限があります。
その制限は次の二つの構成で制御されます：
- `latest_logs_cache_size_threshold` - キャッシュに保存される最新のログの合計サイズ
- `commit_logs_cache_size_threshold` - 次にコミットする必要がある後続のログの合計サイズ

デフォルト値が大きすぎる場合は、これら二つの構成を減らすことによってメモリ使用量を減少させることができます。

:::note
`pfev`コマンドを使用して、各キャッシュから読み取られたログの量を確認できます。また、Prometheusエンドポイントからのメトリクスを使用して、両方のキャッシュの現在のサイズを追跡できます。
:::
## Prometheus {#prometheus}

Keeperは[Prometheus](https://prometheus.io)からのスクリーピング用のメトリクスデータを公開できます。

設定：

- `endpoint` – Prometheusサーバーによるメトリクスのスクリーピング用のHTTPエンドポイント。'/'から始まります。
- `port` – `endpoint`のポート。
- `metrics` – [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開するためのフラグを設定します。
- `events` – [system.events](/operations/system-tables/events)テーブルからメトリクスを公開するためのフラグを設定します。
- `asynchronous_metrics` – [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルからの現在のメトリクス値を公開するためのフラグを設定します。

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

確認します（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください）：
```bash
curl 127.0.0.1:9363/metrics
```

また、ClickHouse Cloudの[Prometheus統合](/integrations/prometheus)をご覧ください。
## ClickHouse Keeper user guide {#clickhouse-keeper-user-guide}

このガイドは、ClickHouse Keeperを構成するためのシンプルで最小限の設定を提供し、分散操作をテストする方法の例を示しています。この例は、Linux上の3ノードを使用して実行されます。
### 1. Configure nodes with Keeper settings {#1-configure-nodes-with-keeper-settings}

1. 3つのホスト（`chnode1`、`chnode2`、`chnode3`）に3つのClickHouseインスタンスをインストールします。（ClickHouseのインストールに関する詳細は[クイックスタート](/getting-started/install/install.mdx)を参照してください。）

2. 各ノードで、ネットワークインターフェイスを介して外部通信を許可するために以下のエントリーを追加します。
```xml
<listen_host>0.0.0.0</listen_host>
```

3. 次のClickHouse Keeper構成を3つのサーバーすべてに追加し、各サーバーの`<server_id>`設定を更新します。`chnode1`では`1`、`chnode2`では`2`、など。
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

    これらは上記で使用された基本設定です：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |tcp_port   |keeperのクライアントが使用するポート|9181（デフォルトでZooKeeperの2181に相当）|
    |server_id| raft構成で使用される各ClickHouse Keeperサーバーの識別子| 1|
    |coordination_settings|タイムアウトなどのパラメーターのセクション| タイムアウト：10000、ログレベル：トレース|
    |server    |参加するサーバーの定義|各サーバー定義のリスト|
    |raft_configuration| Keeperクラスタ内の各サーバーの設定| 各サーバーのサーバーと設定|
    |id      |keeperサービス用のサーバーの数値ID|1|
    |hostname   |keeperクラスタ内の各サーバーのホスト名、IPまたはFQDN|`chnode1.domain.com`|
    |port|サーバー間のkeeper接続をリッスンするポート|9234|

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

    これらは上記で使用された基本設定です：

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |node   |ClickHouse Keeper接続のためのノードのリスト|各サーバーの設定エントリー|
    |host|各ClickHouse Keeperノードのホスト名、IPまたはFQDN| `chnode1.domain.com`|
    |port|ClickHouse Keeperクライアントポート| 9181|

5. ClickHouseを再起動し、各Keeperインスタンスが実行中であることを確認します。各サーバーで次のコマンドを実行します。`ruok`コマンドは、Keeperが稼働中で健全である場合に`imok`を返します：
```bash

# echo ruok | nc localhost 9181; echo
imok
```

6. `system`データベースには、ClickHouse Keeperインスタンスの詳細を含む`zookeeper`テーブルがあります。テーブルを表示しましょう：
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
### 2.  Configure a cluster in ClickHouse {#2--configure-a-cluster-in-clickhouse}

1. はじめに、2つのシャードと、2つのノードに1つのレプリカを持つシンプルなクラスターを構成します。3つ目のノードは、ClickHouse Keeperでの必要な過半数を達成するために使用されます。`chnode1`と`chnode2`の設定を更新します。以下のクラスターは、各ノードに1つのシャードを定義し、合計で2つのシャード（レプリケーションなし）を持ちます。この例では、データの一部があるノードにあり、他のノードにまた別の部分があります：
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

    |Parameter |Description                   |Example              |
    |----------|------------------------------|---------------------|
    |shard   |クラスター定義のレプリカのリスト|各シャードのレプリカのリスト|
    |replica|各レプリカの設定リスト|各レプリカの設定エントリー|
    |host|レプリカシャードをホストするサーバーのホスト名、IPまたはFQDN|`chnode1.domain.com`|
    |port|ネイティブTCPプロトコルを使用して通信するために使用されるポート|9000|
    |user|クラスターインスタンスに認証するために使用されるユーザー名|default|
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
### 3. Create and test distributed table {#3-create-and-test-distributed-table}

1. `chnode1`でClickHouseクライアントを使用して新しいデータベースを作成します。`ON CLUSTER`句は、自動的に両方のノードにデータベースを作成します。
```sql
CREATE DATABASE db1 ON CLUSTER 'cluster_2S_1R';
```

2. `db1`データベースに新しいテーブルを作成します。再度、`ON CLUSTER`が両方のノードにテーブルを作成します。
```sql
CREATE TABLE db1.table1 on cluster 'cluster_2S_1R'
(
    `id` UInt64,
    `column1` String
)
ENGINE = MergeTree
ORDER BY column1
```

3. `chnode1`ノードで数行を追加します：
```sql
INSERT INTO db1.table1
    (id, column1)
VALUES
    (1, 'abc'),
    (2, 'def')
```

4. `chnode2`ノードに数行を追加します：
```sql
INSERT INTO db1.table1
    (id, column1)
VALUES
    (3, 'ghi'),
    (4, 'jkl')
```

5. 各ノードで`SELECT`文を実行すると、そのノードにのみデータが表示されることに注意してください。例えば、`chnode1`では：
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

6. 2つのシャードのデータを表す`Distributed`テーブルを作成できます。`Distributed`テーブルエンジンを使用したテーブルは、自身のデータを保持せず、複数のサーバーで分散クエリ処理を可能にします。読み取りはすべてのシャードにヒットし、書き込みはシャード全体に分散できます。`chnode1`で以下のクエリを実行します：
```sql
CREATE TABLE db1.dist_table (
    id UInt64,
    column1 String
)
ENGINE = Distributed(cluster_2S_1R,db1,table1)
```

7. `dist_table`をクエリすると、2つのシャードからのすべての4行のデータが返されることに注意してください：
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
### Summary {#summary}

このガイドでは、ClickHouse Keeperを使用してクラスターを設定する方法を示しました。ClickHouse Keeperを使用して、クラスターを構成し、シャード全体で複製される可能性のある分散テーブルを定義できます。
## Configuring ClickHouse Keeper with unique paths {#configuring-clickhouse-keeper-with-unique-paths}

<SelfManaged />
### Description {#description}

この記事では、組み込みの`{uuid}`マクロ設定を使用して、ClickHouse KeeperまたはZooKeeperに一意のエントリーを作成する方法を説明します。一意のパスは、テーブルを頻繁に作成および削除する際に役立ちます。なぜなら、パスが作成されるたびに新しい`uuid`がそのパスに使われるため、Keeperガベージコレクションがパスエントリーを削除するのを数分待つ必要がないからです。パスは決して再利用されません。
### Example environment {#example-environment}
ClickHouse Keeperがすべての3ノードに構成され、2ノードにClickHouseがある3ノードクラスタです。これにより、ClickHouse Keeperに3つのノード（タイブレーカーノードを含む）と、2つのレプリカから成る単一のClickHouseシャードが提供されます。

|node|description|
|-----|-----|
|`chnode1.marsnet.local`|データノード - クラスター`cluster_1S_2R`|
|`chnode2.marsnet.local`|データノード - クラスター`cluster_1S_2R`|
|`chnode3.marsnet.local`| ClickHouse Keeperタイブレーカーノード|

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
### Procedures to set up tables to use `{uuid}` {#procedures-to-set-up-tables-to-use-uuid}

1. 各サーバーでマクロを構成します
サーバー1の例：
```xml
<macros>
    <shard>1</shard>
    <replica>replica_1</replica>
</macros>
```
:::note
`shard`と`replica`のマクロを定義していますが、`{uuid}`はここで定義されていないことに注意してください。これはビルトインであり、定義する必要はありません。
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

3. マクロと`{uuid}`を使用してクラスタ内にテーブルを作成します

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

4.  分散テーブルを作成します

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
### Testing {#testing}
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

1 row in set. Elapsed: 0.033 sec.
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
### Alternatives {#alternatives}
デフォルトのレプリケーションパスは、マクロを使用して事前に定義でき、`{uuid}`を使用することもできます。

1. 各ノードのテーブルのデフォルトを設定します
```xml
<default_replica_path>/clickhouse/tables/{shard}/db_uuid/{uuid}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```
:::tip
特定のデータベースにノードが使用される場合は、各ノードでマクロ`{database}`も定義できます。
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

1 row in set. Elapsed: 0.003 sec.
```
### Troubleshooting {#troubleshooting}

テーブル情報とUUIDを取得するためのコマンド例：
```sql
SELECT * FROM system.tables
WHERE database = 'db_uuid' AND name = 'uuid_table1';
```

上記のテーブルのUUIDを持つZooKeeper内のテーブルに関する情報を取得するためのコマンド例：
```sql
SELECT * FROM system.zookeeper
WHERE path = '/clickhouse/tables/1/db_uuid/9e8a3cc2-0dec-4438-81a7-c3e63ce2a1cf/replicas';
```

:::note
データベースは`Atomic`でなければなりません。以前のバージョンからアップグレードする場合、`default`データベースは`Ordinary`型である可能性が高いです。
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

1 row in set. Elapsed: 0.004 sec.
```
## ClickHouse Keeper dynamic reconfiguration {#reconfiguration}

<SelfManaged />
### Description {#description-1}

ClickHouse Keeperは、`keeper_server.enable_reconfiguration`がオンになっている場合に、ZooKeeper [`reconfig`](https://zookeeper.apache.org/doc/r3.5.3-beta/zookeeperReconfig.html#sc_reconfig_modifying)コマンドを部分的にサポートします。

:::note
この設定がオフになっていると、レプリカの`raft_configuration`セクションを手動で変更することによってクラスターを再構成できます。変更を適用するのはリーダーだけであるため、すべてのレプリカでファイルを編集してください。
または、ZooKeeper互換のクライアントを介して`reconfig`クエリを送信できます。
:::

仮想ノード`/keeper/config`には、次の形式で最終的にコミットされたクラスタ構成が含まれています：

```text
server.id = server_host:server_port[;server_type][;server_priority]
server.id2 = ...
...
```

- 各サーバーエントリーは改行で区切られます。
- `server_type`は`participant`または`learner`のいずれかです（[learner](https://github.com/eBay/NuRaft/blob/master/docs/readonly_member.md)はリーダー選挙には参加しません）。
- `server_priority`は、[リーダー選挙で優先されるべきノード](https://github.com/eBay/NuRaft/blob/master/docs/leader_election_priority.md)を示す非負整数です。
  プライオリティ0は、サーバーが決してリーダーにならないことを意味します。

例：

```sql
:) get /keeper/config
server.1=zoo1:9234;participant;1
server.2=zoo2:9234;participant;1
server.3=zoo3:9234;participant;1
```

新しいサーバーを追加したり、既存のサーバーを削除したり、既存のサーバーの優先度を変更したりするために、`reconfig`コマンドを使用できます。例を以下に示します（`clickhouse-keeper-client`を使用）：

```bash

# Add two new servers
reconfig add "server.5=localhost:123,server.6=localhost:234;learner"

# Remove two other servers
reconfig remove "3,4"

# Change existing server priority to 8
reconfig add "server.5=localhost:5123;participant;8"
```

以下は`kazoo`の例です：

```python

# Add two new servers, remove two other servers
reconfig(joining="server.5=localhost:123,server.6=localhost:234;learner", leaving="3,4")


# Change existing server priority to 8
reconfig(joining="server.5=localhost:5123;participant;8", leaving=None)
```

`joining`にあるサーバーは、上記で説明したサーバー形式でなければなりません。サーバーエントリーはコンマで区切る必要があります。
新しいサーバーを追加する際は、`server_priority`（デフォルト値は1）と`server_type`（デフォルト値は`participant`）を省略できます。

既存のサーバーの優先度を変更する場合は、ターゲット優先度と一緒に`joining`に追加します。
サーバーホスト、ポート、およびタイプは、既存のサーバー構成と等しくなければなりません。

サーバーは、`joining`および`leaving`に現れる順に追加および削除されます。
`joining`のすべての更新は、`leaving`からの更新の前に処理されます。

Keeperの再構成実装にはいくつかの注意点があります：

- 増分再構成のみがサポートされています。非空の`new_members`を含むリクエストは拒否されます。

  ClickHouse Keeperの実装は、NuRaft APIに依存して動的にメンバーシップを変更します。NuRaftには、サーバーを1台追加したり、1台削除したりする方法があります。これは、設定への変更（`joining`の各部分、`leaving`の各部分）を別々に決定する必要があることを意味します。したがって、一括の再構成は利用できず、エンドユーザーに誤解を招く可能性があります。

  サーバータイプ（participant/learner）を変更することはできません。これはNuRaftではサポートされておらず、サーバーを削除して追加する以外の方法はありません。これもまた誤解を招く可能性があります。

- 戻された`znodestat`値は使用できません。
- `from_version`フィールドは使用されません。`from_version`が設定されたすべてのリクエストは拒否されます。
  これは、`/keeper/config`が仮想ノードであるためであり、永続ストレージに保存されるのではなく、リクエストごとに指定されたノード構成で動的に生成されます。
  この決定はデータの重複を防ぐために行われ、NuRaftはすでにこの構成を保存しています。
- ZooKeeperとは異なり、`sync`コマンドを送信してクラスターの再構成を待つ方法はありません。
  新しい構成は_最終的に_適用されますが、時間に関しては保証はありません。
- `reconfig`コマンドは様々な理由で失敗する可能性があります。クラスターの状態をチェックして、更新が適用されたかどうかを確認できます。
## Converting a single-node keeper into a cluster {#converting-a-single-node-keeper-into-a-cluster}

時々、実験的なKeeperノードをクラスターに拡張する必要があります。3ノードクラスターのためのステップバイステップの手順は以下のとおりです：

- **重要**：新しいノードは、現在の過半数未満でのバッチで追加しなければなりません。そうでないと、それらの間でリーダーを選出します。この例では一つずつ追加します。
- 既存のKeeperノードには、`keeper_server.enable_reconfiguration`構成パラメーターがオンになっている必要があります。
- Keeperクラスタの完全な新しい構成で2番目のノードを起動します。
- 起動したら、[`reconfig`](#reconfiguration)を使用してノード1に追加します。
- さて、3番目のノードを起動して、[`reconfig`](#reconfiguration)を使用して追加します。
- `clickhouse-server`構成を更新してそこで新しいKeeperノードを追加し、それを再起動して変更を適用します。
- ノード1のraft構成を更新し、オプションで再起動します。

プロセスを確実にするために、こちらの[sandbox repository](https://github.com/ClickHouse/keeper-extend-cluster)があります。
## Unsupported features {#unsupported-features}

ClickHouse KeeperはZooKeeperと完全に互換性を持つことを目指していますが、現在実装されていない機能もいくつかあります（開発は進行中です）：

- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は`Stat`オブジェクトを返すことをサポートしていません。
- [`create`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#create(java.lang.String,byte%5B%5D,java.util.List,org.apache.zookeeper.CreateMode,org.apache.zookeeper.data.Stat))は[TTL](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/CreateMode.html#PERSISTENT_WITH_TTL)をサポートしていません。
- [`addWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#addWatch(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.AddWatchMode))は[`PERSISTENT`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/AddWatchMode.html#PERSISTENT)ウォッチで機能しません。
- [`removeWatch`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeWatches(java.lang.String,org.apache.zookeeper.Watcher,org.apache.zookeeper.Watcher.WatcherType,boolean))および[`removeAllWatches`](https://zookeeper.apache.org/doc/r3.9.1/apidocs/zookeeper-server/org/apache/zookeeper/ZooKeeper.html#removeAllWatches(java.lang.String,org.apache.zookeeper.Watcher.WatcherType,boolean))はサポートされていません。
- `setWatches`はサポートされていません。
- [`CONTAINER`](https://zookeeper.apache.org/doc/r3.5.1-alpha/api/org/apache/zookeeper/CreateMode.html)タイプのznodesを作成することはサポートされていません。
- [`SASL認証`](https://cwiki.apache.org/confluence/display/ZOOKEEPER/Zookeeper+and+SASL)はサポートされていません。
