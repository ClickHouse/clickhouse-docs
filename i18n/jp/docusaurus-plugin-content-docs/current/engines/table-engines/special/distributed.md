---
'description': 'Distributed エンジンを持つテーブルは独自のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中、リモートサーバーにあるテーブルインデックスが使用されます。'
'sidebar_label': '分散'
'sidebar_position': 10
'slug': '/engines/table-engines/special/distributed'
'title': '分散テーブルエンジン'
'doc_type': 'reference'
---


# 分散テーブルエンジン

:::warning クラウドにおける分散エンジン
ClickHouse Cloudで分散テーブルエンジンを作成するには、[`remote` と `remoteSecure`](../../../sql-reference/table-functions/remote) テーブル関数を使用できます。
`Distributed(...)` 構文は ClickHouse Cloud では使用できません。
:::

分散エンジンを持つテーブルは独自のデータを保存せず、複数のサーバーで分散クエリ処理を可能にします。
読み取りは自動的に並列化され、読み取り中にリモートサーバーのテーブルインデックスが存在する場合に使用されます。

## テーブルの作成 {#distributed-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### テーブルから {#distributed-from-a-table}

`Distributed` テーブルが現在のサーバー上のテーブルを指している場合、そのテーブルのスキーマを採用できます:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分散パラメータ {#distributed-parameters}

| パラメータ                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster`                 | サーバーの設定ファイルにおけるクラスタ名                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `database`                | リモートデータベースの名前                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `table`                   | リモートテーブルの名前                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `sharding_key` (オプション) | シャーディングキー。<br/> `sharding_key` を指定する必要があります。以下の場合: <ul><li>分散テーブルに対する `INSERT` のため (テーブルエンジンがデータを分割する方法を決定するために `sharding_key` が必要です)。ただし、`insert_distributed_one_random_shard` 設定が有効な場合、`INSERT` にシャーディングキーは必要ありません。</li><li>`optimize_skip_unused_shards` と併用するため、`sharding_key` はクエリされるシャードを決定するために必要です。</li></ul> |
| `policy_name` (オプション)  | ポリシー名、一時ファイルをバックグラウンド送信のために保存するのに使用されます                                                                                                                                                                                                                                                                                                                                                                                                         |

**関連情報**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) の例
### 分散設定 {#distributed-settings}

| 設定                                      | 説明                                                                                                                                                                                                                           | デフォルト値 |
|------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `fsync_after_insert`                     | バックグラウンドで分散テーブルに挿入した後、ファイルデータに対して `fsync` を実行します。OSが挿入されたデータ全体をファイル **イニシエータノード** のディスクにフラッシュすることを保証します。                                                             | `false`       |
| `fsync_directories`                      | ディレクトリに対して `fsync` を実行します。バックグラウンド挿入に関連する操作の後にOSがディレクトリメタデータを刷新したことを保証します（挿入後、シャードへのデータ送信後など）。                                        | `false`       |
| `skip_unavailable_shards`                | true の場合、ClickHouse は利用できないシャードを静かにスキップします。シャードは次の理由で利用できないとマークされます: 1) 接続失敗のためにシャードに到達できない。2) DNSを通じてシャードが解決できない。3) テーブルがシャードに存在しない。   | `false`       |
| `bytes_to_throw_insert`                  | バックグラウンド `INSERT` のために待機中の圧縮バイトがこの数を超えると、例外がスローされます。`0` - スローしない。                                                                                                          | `0`           |
| `bytes_to_delay_insert`                  | バックグラウンド `INSERT` のために待機中の圧縮バイトがこの数を超えると、クエリが遅延します。`0` - 遅延しない。                                                                                                            | `0`           |
| `max_delay_to_insert`                    | バックグラウンド送信のために保留中のバイトが多い場合に、分散テーブルへのデータ挿入の最大遅延（秒数）。                                                                                                                    | `60`          |
| `background_insert_batch`                 | [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch) と同じです。                                                                                                     | `0`           |
| `background_insert_split_batch_on_failure` | [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同じです。                                                                   | `0`           |
| `background_insert_sleep_time_ms`         | [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同じです。                                                                                     | `0`           |
| `background_insert_max_sleep_time_ms`     | [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同じです。                                                                             | `0`           |
| `flush_on_detach`                        | `DETACH`/`DROP`/サーバーシャットダウン時にリモートノードにデータをフラッシュします。                                                                                                                                                                        | `true`        |

:::note
**耐久性設定** (`fsync_...`):

- データが最初にイニシエータノードのディスクに保存され、後でバックグラウンドでシャードに送信されるときに、バックグラウンド `INSERT` のみに影響します（すなわち、`distributed_foreground_insert=false`）。
- `INSERT` のパフォーマンスを大幅に低下させる可能性があります。
- 分散テーブルフォルダー内に保存されたデータの書き込みに影響します。もし基礎となる MergeTree テーブルにデータを書き込む保証が必要な場合は、`system.merge_tree_settings` 内の耐久性設定（`...fsync...`）を参照してください。

**挿入制限設定** (`..._insert`) についても参照してください:

- [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 設定
- `bytes_to_throw_insert` は `bytes_to_delay_insert` の前に処理されるため、`bytes_to_delay_insert` より小さい値に設定しないでください。
:::

**例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

データは、`logs` クラスタ内のすべてのサーバーから、クラスタ内の各サーバーに位置する `default.hits` テーブルから読み取られます。データは読み取られるだけでなく、リモートサーバーで部分的に処理されます（可能な範囲内で）。例えば、`GROUP BY` クエリの場合、データはリモートサーバーで集約され、集約関数の中間状態がリクエスト元のサーバーに送信されます。その後、データはさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用できます。例えば: `currentDatabase()`。

## クラスタ {#distributed-clusters}

クラスタは[サーバー設定ファイル](../../../operations/configuration-files.md)で構成されます:

```xml
<remote_servers>
    <logs>
        <!-- Inter-server per-cluster secret for Distributed queries
             default: no secret (no authentication will be performed)

             If set, then Distributed queries will be validated on shards, so at least:
             - such cluster should exist on the shard,
             - such cluster should have the same secret.

             And also (and which is more important), the initial_user will
             be used as current user for the query.
        -->
        <!-- <secret></secret> -->

        <!-- Optional. Whether distributed DDL queries (ON CLUSTER clause) are allowed for this cluster. Default: true (allowed). -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->

        <shard>
            <!-- Optional. Shard weight when writing data. Default: 1. -->
            <weight>1</weight>
            <!-- Optional. The shard name.  Must be non-empty and unique among shards in the cluster. If not specified, will be empty. -->
            <name>shard_01</name>
            <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- Optional. Priority of the replica for load balancing (see also load_balancing setting). Default: 1 (less value has more priority). -->
                <priority>1</priority>
                <host>example01-01-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-01-2</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <weight>2</weight>
            <name>shard_02</name>
            <internal_replication>false</internal_replication>
            <replica>
                <host>example01-02-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-02-2</host>
                <secure>1</secure>
                <port>9440</port>
            </replica>
        </shard>
    </logs>
</remote_servers>
```

ここでは、名前が `logs` のクラスタが定義されており、2つのシャードから成り、各シャードには2つのレプリカが含まれています。シャードは、データの異なる部分を含むサーバーを指します（すべてのデータを読み取るにはすべてのシャードにアクセスする必要があります）。レプリカは複製サーバーです（すべてのデータを読み取るには、いずれかのレプリカのデータにアクセスできます）。

クラスタ名にはドットを含めてはいけません。

各サーバーには、`host`、`port`、およびオプションで `user`、`password`、`secure`、`compression`、`bind_host` のパラメータが指定されます:

| パラメータ     | 説明                                                                                                                                                                                                                                                                                                                              | デフォルト値 |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `host`        | リモートサーバーのアドレス。ドメイン名またはIPv4またはIPv6アドレスを使用できます。ドメインを指定した場合、サーバーは起動時にDNSリクエストを行い、結果はサーバーが稼働している限り保存されます。DNSリクエストが失敗すると、サーバーは起動しません。DNSレコードを変更した場合は、サーバーを再起動する必要があります。     | -            |
| `port`        | メッセンジャーアクティビティのためのTCPポート（設定中の `tcp_port`、通常は9000に設定されています）。`http_port` と混同しないでください。                                                                                                                                                     | -            |
| `user`        | リモートサーバーに接続するためのユーザー名。このユーザーは指定されたサーバーに接続するためのアクセス権を持っている必要があります。アクセスは `users.xml` ファイルで構成されます。詳細については、セクション [アクセス権](../../../guides/sre/user-management/index.md) を参照してください。                                                                    | `default`    |
| `password`    | リモートサーバーに接続するためのパスワード（マスクされていません）。                                                                                                                                                                                                                                                                             | ''           |
| `secure`      | セキュアなSSL/TLS接続を使用するかどうか。通常はポートを指定する必要もあります（デフォルトのセキュアポートは `9440`）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` でリッスンし、正しい証明書で設定される必要があります。                                                                                          | `false`      |
| `compression` | データ圧縮を使用します。                                                                                                                                                                                                                                                                                                                    | `true`       |
| `bind_host`   | このノードからリモートサーバーに接続するために使用するソースアドレス。IPv4アドレスのみがサポートされています。ClickHouseの分散クエリで使用されるソースIPアドレスを規定する必要がある高度な展開ユースケース向けです。                                                                                             | -            |

レプリカを指定すると、データ読み取り時に各シャードの利用可能なレプリカのいずれかが選択されます。ロードバランシングのアルゴリズムを構成できます（どのレプリカにアクセスするかの優先度） – [load_balancing](../../../operations/settings/settings.md#load_balancing) 設定を参照してください。サーバーとの接続が確立できない場合、短いタイムアウトで接続の試行が行われます。接続が失敗した場合、次のレプリカが選択されるので、すべてのレプリカに対してこのプロセスが繰り返されます。このようにしてレジリエンシーが向上しますが、完全なフォールトトレランスは提供されません：リモートサーバーは接続を受け入れるかもしれませんが、機能しない、または動作が悪い場合があります。

シャードのいずれかを指定することもできます（この場合、クエリ処理は分散ではなくリモートと呼ばれるべきです）または任意の数のシャードを指定できます。各シャードには、1つから任意の数のレプリカを指定できます。各シャードに異なる数のレプリカを指定できます。

設定に必要なだけのクラスタを指定できます。

クラスタを表示するには、`system.clusters` テーブルを使用します。

`Distributed` エンジンは、ローカルサーバーのようにクラスタと連携することを可能にします。ただし、クラスタの設定は動的には指定できず、サーバー設定ファイルで構成する必要があります。通常、クラスタ内のすべてのサーバーは同じクラスタ設定を持ちますが（これは必須ではありません）、設定ファイルからのクラスタはサーバーを再起動せずに、リアルタイムで更新されます。

毎回不明なセットのシャードとレプリカにクエリを送信する必要がある場合、`Distributed` テーブルを作成する必要はありません - 代わりに `remote` テーブル関数を使用してください。テーブル関数に関するセクションを参照してください [Table functions](../../../sql-reference/table-functions/index.md).

## データの書き込み {#distributed-writing-data}

クラスタへのデータの書き込みには2つの方法があります。

まず、どのサーバーにどのデータを書き込み、各シャードで直接書き込みを実行するかを定義できます。言い換えれば、`Distributed` テーブルが指しているクラスタ内のリモートテーブルに対して直接 `INSERT` ステートメントを実行します。これは最も柔軟なソリューションであり、トリビアルでないシャーディングスキームを使用することもできます。これは、データを異なるシャードに完全に独立して書き込むことができるため、最適なソリューションでもあります。

次に、`Distributed` テーブルに対して `INSERT` ステートメントを実行できます。この場合、テーブルは挿入されたデータをサーバーに自動的に分配します。`Distributed` テーブルに書き込むには、`sharding_key` パラメータが設定されている必要があります（シャードが一つだけの場合を除く）。

各シャードには、設定ファイルで`<weight>` を定義できます。デフォルトでは、重みは `1` です。データはシャードの重みに比例して分配されます。すべてのシャードの重みを合計し、その後各シャードの重みを合計で割って各シャードの割合を決定します。例えば、2つのシャードがあり、最初のシャードの重みが1で、2番目の重みが2の場合、最初のシャードには1/3（1 / 3）の挿入行が送信され、2番目のシャードには2/3（2 / 3）の行が送信されます。

各シャードには、設定ファイルで `internal_replication` パラメータを定義できます。このパラメータが `true` に設定されている場合、書き込み操作は最初の健康なレプリカを選択してデータをそこに書き込みます。これは、`Distributed` テーブルの基盤となるテーブルがレプリケートテーブルである場合（例えば、`Replicated*MergeTree` テーブルエンジン）に使用します。テーブルのレプリカの1つが書き込みを受け取り、他のレプリカに自動的にレプリケートされます。

`internal_replication` が `false`（デフォルト）に設定されている場合、データはすべてのレプリカに書き込まれます。この場合、分散テーブル自身がデータをレプリケートします。これはレプリケートテーブルを使用するよりも悪化します。なぜなら、レプリカの一貫性はチェックされず、時間の経過とともにわずかに異なるデータが含まれるからです。

データの行が送信されるシャードを選択するために、シャーディング式が解析され、その余りがシャードの合計重みで割られた値として取得されます。行は、`prev_weights` から `prev_weights + weight` までの余りの半区間に対応するシャードに送 信されます。ここで、`prev_weights` は最も小さい数のシャードの合計重み、`weight` はこのシャードの重みです。例えば、2つのシャードがあり、最初のシャードの重みが9で、2番目の重みが10の場合、余りが \[0, 9) の範囲では最初のシャードに送信され、\[[9, 19) の範囲では2番目のシャードに送信されます。

シャーディング式は、整数を返す定数およびテーブルカラムからの任意の式であることができます。例えば、データのランダム分配には `rand()` 式を使用したり、ユーザーIDでユーザーのIDによる剰余によって分配するために `UserID` を使用したりできます（この場合、単一ユーザーのデータが単一シャードに保持され、ユーザーによる `IN` と `JOIN` の実行が簡素化されます）。もしカラムの一つが均一に分配されていない場合は、`intHash64(UserID)` 等のハッシュ関数でラップできます。

単純な除算の余りは、シャーディングには限られた解決策であり、常に適切ではない場合があります。中規模および大規模なデータ量（数十のサーバー）には機能しますが、非常に大きなデータ量（数百のサーバー以上）には適していません。後者の場合、`Distributed` テーブルのエントリを使用するのではなく、適切なシャーディングスキームを使用する必要があります。

次のケースではシャーディングスキームに注意を払うべきです:

- 特定のキーでデータを結合する必要のあるクエリが使用される場合（`IN` または `JOIN`）。データがこのキーでシャーディングされていれば、はるかに効率的なローカル `IN` または `JOIN` を使用できます。
- 大量のサーバーが使用され大規模な小クエリが行われる場合（例: 特定のクライアントのデータに関するクエリ）。小さなクエリがクラスタ全体に影響を与えないようにするためには、単一のクライアントのデータを単一のシャードに配置することが理にかなっています。あるいは、二層シャーディングを設定し、クラスタ全体を「層」に分け、層は複数のシャードから構成されます。単一のクライアントのデータは単一の層に配置されますが、必要に応じて層にシャードが追加され、内部でランダムに分配されます。各層に対して `Distributed` テーブルを作成し、グローバルクエリ用に単一の共有分散テーブルを作成します。

データはバックグラウンドで書き込まれます。テーブルに挿入されたときには、データブロックがローカルファイルシステムにただ書き込まれます。データは可能な限り速やかにリモートサーバーにバックグラウンドで送信されます。データ送信の周期は、[distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 設定によって管理されます。`Distributed` エンジンは、挿入されたデータを個別のファイルで送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 設定を使用してファイルのバッチ送信を有効にできます。この設定により、ローカルサーバーやネットワークリソースのより良い利用によってクラスタのパフォーマンスが向上します。送信に成功したかどうかを確認するには、テーブルディレクトリのファイルリスト（送信待機中のデータ）をチェックしてください: `/var/lib/clickhouse/data/database/table/`。バックグラウンドタスクを実行するスレッドの数は、[background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定で設定できます。

`INSERT` が `Distributed` テーブルに行われた後、サーバーが存在しなくなったり、粗い再起動（例えばハードウェア障害のため）した場合、挿入されたデータが失われる可能性があります。テーブルディレクトリ内のデータパーツが破損していることが検出された場合、そのパーツは `broken` サブディレクトリに移動され、もはや使用されません。

## データの読み取り {#distributed-reading-data}

`Distributed` テーブルにクエリを実行すると、`SELECT` クエリがすべてのシャードに送信され、データがシャード全体にどのように分配されていても機能します（完全にランダムに分配される可能性があります）。新しいシャードを追加しても古いデータをその中に移す必要はありません。代わりに、より重い重みを使用して新しいデータを書き込むことができます。データが若干不均一に分配されることになりますが、クエリは正しく効率的に動作します。

`max_parallel_replicas` オプションが有効になっている場合、クエリ処理は単一のシャード内のすべてのレプリカで並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) セクションを参照してください。

分散 `in` および `global in` クエリの処理方法について詳しくは、[こちら]( /sql-reference/operators/in#distributed-subqueries)のドキュメントを参照してください。

## 仮想カラム {#virtual-columns}

#### _Shard_num {#_shard_num}

`_shard_num` — `system.clusters` テーブルからの `shard_num` の値を含みます。型: [UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[`remote`](../../../sql-reference/table-functions/remote.md) と [`cluster`](../../../sql-reference/table-functions/cluster.md) テーブル関数は内部で一時的な Distributed テーブルを作成するため、`_shard_num` はそこでも利用可能です。
:::

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns) の説明
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardnum) および [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardcount) 関数
