---
'description': '分散エンジンを使用したテーブルは独自のデータを保存しませんが、複数のサーバー上での分散クエリ処理を可能にします。 読み取りは自動的に並列化されます。
  読み取り中、リモートサーバー上のテーブルインデックスがある場合は使用されます。'
'sidebar_label': '分散'
'sidebar_position': 10
'slug': '/engines/table-engines/special/distributed'
'title': '分散テーブルエンジン'
---




# 分散テーブルエンジン

:::warning
クラウドで分散テーブルエンジンを作成するには、[remote and remoteSecure](../../../sql-reference/table-functions/remote) テーブル関数を使用できます。`Distributed(...)` 構文は ClickHouse Cloud では使用できません。
:::

分散エンジンを持つテーブルは独自のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中、リモートサーバー上のテーブルインデックスが使用されます。

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

#### cluster {#cluster}

`cluster` - サーバーの設定ファイル内のクラスター名

#### database {#database}

`database` - リモートデータベースの名前

#### table {#table}

`table` - リモートテーブルの名前

#### sharding_key {#sharding_key}

`sharding_key` - （オプション）シャーディングキー

`sharding_key` を指定する必要があるのは以下の場合です:

- 分散テーブルへの `INSERT` の場合（テーブルエンジンはデータをどのように分割するかを判断するために `sharding_key` が必要です）。ただし、`insert_distributed_one_random_shard` 設定が有効な場合は、`INSERT` にシャーディングキーは必要ありません。
- `optimize_skip_unused_shards` を使用する場合、`sharding_key` はどのシャードを照会すべきかを判断するために必要です。

#### policy_name {#policy_name}

`policy_name` - （オプション）ポリシー名。バックグラウンド送信用の一時ファイルを保存するために使用されます。

**参照**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) の例

### 分散設定 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 分散へのバックグラウンド挿入後にファイルデータの `fsync` を行います。OSが全挿入データを**イニシエータノード**のディスクにフラッシュしたことを保証します。

#### fsync_directories {#fsync_directories}

`fsync_directories` - ディレクトリの `fsync` を行います。分散テーブルへのバックグラウンド挿入に関連する操作の後（挿入後、データをシャードに送信した後など）に、OSがディレクトリメタデータを更新したことを保証します。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - true の場合、ClickHouse は利用できないシャードを静かにスキップします。シャードは以下の理由で利用できないとマークされます: 1) 接続失敗によりシャードに到達できない。2) DNSを通じてシャードを解決できない。3) シャードにテーブルが存在しない。デフォルトは false。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - この数以上の圧縮バイトがバックグラウンドINSERTのために保留されている場合、例外がスローされます。0 - スローしない。デフォルトは 0。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - この数以上の圧縮バイトがバックグラウンドINSERTのために保留されている場合、クエリが遅延されます。0 - 遅延しない。デフォルトは 0。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - バックグラウンド送信のために保留されているバイトが多い場合、分散テーブルへのデータ挿入の最大遅延（秒）です。デフォルトは 60。

#### background_insert_batch {#background_insert_batch}

`background_insert_batch` - [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) と同じです。

#### background_insert_split_batch_on_failure {#background_insert_split_batch_on_failure}

`background_insert_split_batch_on_failure` - [distributed_background_insert_split_batch_on_failure](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同じです。

#### background_insert_sleep_time_ms {#background_insert_sleep_time_ms}

`background_insert_sleep_time_ms` - [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同じです。

#### background_insert_max_sleep_time_ms {#background_insert_max_sleep_time_ms}

`background_insert_max_sleep_time_ms` - [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同じです。

#### flush_on_detach {#flush_on_detach}

`flush_on_detach` - DETACH/DROP/サーバーシャットダウン時にリモートノードにデータをフラッシュします。デフォルトは true。

:::note
**耐久性設定**（`fsync_...`）:

- データが最初にイニシエータノードのディスクに保存され、その後バックグラウンドでシャードに送信されるバックグラウンドINSERTのみに影響します（`distributed_foreground_insert=false`）。
- 挿入のパフォーマンスが大幅に低下する可能性があります。
- 分散テーブルフォルダー内のデータを書き込む際に、**挿入を受け付けたノードに**影響します。基盤となるMergeTreeテーブルへのデータ書き込みの保証が必要な場合は、`system.merge_tree_settings` 内の耐久性設定（`...fsync...`）を参照してください。

**挿入制限設定**（`..._insert`）についても参照してください:

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 設定
- `bytes_to_throw_insert` は `bytes_to_delay_insert` よりも先に処理されるため、`bytes_to_delay_insert` よりも小さい値に設定するべきではありません。
:::

**例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

データは `logs` クラスター内のすべてのサーバーから、クラスター内の各サーバーにある `default.hits` テーブルから読み取られます。データは単に読み取られるだけでなく、リモートサーバーで部分的に処理されます（可能な限りの範囲で）。たとえば、`GROUP BY` のクエリの場合、データはリモートサーバーで集約され、中間状態の集約関数がリクエスタのサーバーに送信されます。次に、データはさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用することもできます。たとえば: `currentDatabase()`。

## クラスター {#distributed-clusters}

クラスターは [サーバー設定ファイル](../../../operations/configuration-files.md) で構成されています:

```xml
<remote_servers>
    <logs>
        <!-- 分散クエリのためのクラスターごとのインターネットスタント
             デフォルト: シークレットなし（認証は行われません）

             設定されている場合、分散クエリはシャードで検証されるため、少なくとも:
             - シャードにそのようなクラスターが存在する必要があります。
             - そのようなクラスターは同じシークレットを持っている必要があります。

             また（そしてより重要なのは）、initial_user が
             クエリの現在のユーザーとして使用されます。
        -->
        <!-- <secret></secret> -->
        
        <!-- オプション。分散DDLクエリ（ON CLUSTER句）がこのクラスターに許可されているかどうか。デフォルト: true（許可されている）。 -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->
        
        <shard>
            <!-- オプション。データを書き込む際のシャードの重み。デフォルト: 1. -->
            <weight>1</weight>
            <!-- オプション。シャード名。シャードについて非空かつユニークでなければなりません。指定しない場合は空になります。 -->
            <name>shard_01</name>
            <!-- オプション。データを単一のレプリカにのみ書き込むかどうか。デフォルト: false（すべてのレプリカにデータを書き込む）。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- オプション。負荷分散のためのレプリカの優先度（load_balancing 設定も参照）。デフォルト: 1（値が小さいほど優先度が高い）。 -->
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

ここでは、`logs` という名前のクラスターが定義されており、2つのシャードが含まれていて、それぞれが2つのレプリカを含んでいます。シャードは異なるデータの部分を含むサーバーを指します（全データを読み取るには、すべてのシャードにアクセスする必要があります）。レプリカはデータを複製するサーバーです（全データを読み取るには、任意のレプリカのデータにアクセスできます）。

クラスター名にはドットを含めることはできません。

各サーバーについて、`host`、`port`、およびオプションで `user`、`password`、`secure`、`compression`、`bind_host` パラメータが指定されます:

- `host` - リモートサーバーのアドレス。ドメイン名または IPv4 または IPv6 アドレスを使用できます。ドメイン名を指定する場合、サーバーは起動時に DNS リクエストを行い、結果はサーバーが稼働している間保持されます。DNS リクエストが失敗すると、サーバーは起動しません。DNS レコードを変更した場合は、サーバーを再起動する必要があります。
- `port` - メッセージ活動のための TCP ポート（設定内の `tcp_port`、通常は 9000 に設定）。`http_port` とは混同しないでください。
- `user` - リモートサーバーへの接続用のユーザー名。デフォルト値は `default` ユーザーです。このユーザーは指定されたサーバーに接続するためのアクセス権を持っている必要があります。アクセスは `users.xml` ファイルで構成されます。詳細については、[アクセス権](../../../guides/sre/user-management/index.md) のセクションを参照してください。
- `password` - リモートサーバーへの接続用のパスワード（マスクされません）。デフォルト値: 空文字列。
- `secure` - セキュアな SSL/TLS 接続を使用するかどうか。通常、ポートを指定することも必要です（デフォルトのセキュアポートは `9440` です）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` でリッスンし、正しい証明書が設定される必要があります。
- `compression` - データ圧縮を使用します。デフォルト値: `true`。
- `bind_host` - このノードからリモートサーバーに接続する際に使用する送信元アドレス。IPv4アドレスのみがサポートされます。ClickHouse の分散クエリによって使用されるソースIPアドレスを設定する必要がある高度なデプロイメント使用ケース向けに設計されています。

レプリカを指定すると、各シャードを読み取る際に利用可能なレプリカのうちの1つが選択されます。負荷分散のためのアルゴリズムを設定することができます（どのレプリカにアクセスするかの優先順位） – [load_balancing](../../../operations/settings/settings.md#load_balancing) 設定を参照してください。サーバーとの接続が確立されない場合は、短いタイムアウトで接続を試みます。接続が失敗した場合は次のレプリカが選択され、すべてのレプリカに対して同様に繰り返されます。これにより耐障害性が向上しますが、完全なフォールトトレランスを提供するものではありません: リモートサーバーは接続を受け入れることがありますが、動作しないか、動作が悪い場合があります。

シャードの1つだけを指定することもできます（この場合、クエリ処理は分散ではなくリモートと呼ばれる必要があります）または任意の数のシャードを指定できます。各シャードに対して1つ以上のレプリカを指定できます。各シャードに対して異なる数のレプリカを指定できます。

設定ファイル内で任意の数のクラスターを指定できます。

クラスターを表示するには、`system.clusters` テーブルを使用します。

`Distributed` エンジンは、クラスタをローカルサーバーのように扱うことを可能にします。ただし、クラスターの構成は動的に指定することはできず、サーバー設定ファイルで構成する必要があります。通常、クラスター内のすべてのサーバーは同じクラスター設定を持ちます（これは必須ではありません）。設定ファイルからのクラスターはサーバーを再起動することなく即時に更新されます。

毎回未知のシャードとレプリカのセットにクエリを送信する必要がある場合、`Distributed` テーブルを作成する必要はありません – 代わりに `remote` テーブル関数を使用してください。 [テーブル関数](../../../sql-reference/table-functions/index.md) のセクションを参照してください。

## データの書き込み {#distributed-writing-data}

クラスタにデータを書くための方法は二つあります。

最初に、どのサーバーにどのデータを書き込むかを定義し、各シャードで直接書き込みを行うことができます。言い換えれば、`Distributed` テーブルが指しているリモートテーブルに対して直接 `INSERT` ステートメントを実行します。これは、データをトリビアルではない要求を持つ主題領域に基づいて任意のシャーディングスキームを使用できるため、最も柔軟なソリューションです。また、異なるシャードに異なるデータを完全に独立して書き込むことができるため、最も最適なソリューションでもあります。

第二に、`Distributed` テーブルに対して `INSERT` ステートメントを実行できます。この場合、テーブルは挿入されたデータをサーバーに自動的に分配します。`Distributed` テーブルに書き込むためには、`sharding_key` パラメータが構成されている必要があります（シャードが1つしかない場合を除く）。

各シャードは設定ファイル内で `<weight>` を定義できます。デフォルトでは、重みは `1` です。データはシャードの重みに比例して分配されます。すべてのシャードの重みが合計され、各シャードの重みが総和で割られて各シャードの比率が決定されます。たとえば、2つのシャードがあり、最初のシャードの重みが 1 で、2 番目のシャードの重みが 2 の場合、最初のシャードには 3 分の 1 （1 / 3）の挿入された行が送られ、2 番目のシャードには 3 分の 2 （2 / 3）が送られます。

各シャードには設定ファイル内で `internal_replication` パラメータが定義できます。このパラメータが `true` に設定されている場合、書き込み操作は最初の正常なレプリカを選択し、そこにデータを書き込みます。`Distributed` テーブルの基盤となるテーブルがレプリケートテーブル（例えば、`Replicated*MergeTree` テーブルエンジンのいずれか）である場合は、これを使用します。一つのテーブルレプリカが書き込みを受け取り、それが他のレプリカに自動的にレプリケートされます。

`internal_replication` が `false` に設定されている場合（デフォルト）、データはすべてのレプリカに書き込まれます。この場合、`Distributed` テーブルはデータを自分でレプリケートします。これは、レプリカの整合性がチェックされず、時間が経つにつれてわずかに異なるデータを含むようになるため、レプリケートされたテーブルを使用するよりも劣ります。

行データが送信されるシャードを選択するために、シャーディング式が分析され、その余りがシャードの合計ウエイトで割られた値から取得されます。行は、`prev_weights` から `prev_weights + weight` への余りの半区間に対応するシャードに送信されます。ここで、`prev_weights` は最小の数のシャードの合計ウエイトであり、`weight` はこのシャードの重みです。たとえば、2つのシャードがあり、最初が重み 9 で、2 番目が重み 10 の場合、行は余りの範囲 \[0, 9) について最初のシャードに送信され、余りの範囲 \[9, 19) については2 番目のシャードに送信されます。

シャーディング式は、整数を返す定数およびテーブルカラムからなる任意の式です。たとえば、データのランダム分配のために `rand()` 式を使用したり、ユーザー ID で割った余りによる分配のために `UserID` を使用したりできます（この場合、単一のユーザーのデータは単一のシャードに存在するため、ユーザーによる `IN` および `JOIN` の実行が簡素化されます）。もし、いずれかのカラムの分配が十分に均一でない場合は、それをハッシュ関数でラップすることができます（たとえば、`intHash64(UserID)`）。

単純な割り算の余りはシャーディングに制限された解決策であり、常に適切ではありません。中規模および大規模のデータボリューム（数十のサーバー）には有効ですが、ごく大きなデータボリューム（数百のサーバーまたはそれ以上）には適していません。その場合、`Distributed` テーブルのエントリを使用するのではなく、対象領域によって要求されるシャーディングスキームを使用してください。

以下のような場合にはシャーディングスキームを考慮すべきです:

- 特定のキーでデータの結合（`IN` または `JOIN`）を必要とするクエリが使用される場合。このキーでデータがシャーディングされていると、`GLOBAL IN` または `GLOBAL JOIN` の代わりにローカル `IN` または `JOIN` を使用できます。これにより、大幅に効率が向上します。
- 大量のサーバー（数百以上）を使用し、個々のクライアントのデータに対する小さいクエリが大量にある場合（例えば、ウェブサイト、広告主、またはパートナーのデータ）。それら的小クエリが全体のクラスターに影響を与えないように、単一のクライアントのデータを単一のシャードに位置付けることが意味があります。別の方法として、二段階のシャーディングを設定できます: 全体のクラスターを「層」に分けることができ、その層は複数のシャードで構成されることがあります。単一クライアントのデータは単一層に位置付けられますが、必要に応じて層内のシャードが追加され、データがその中でランダムに分配されます。各層には `Distributed` テーブルが作成され、グローバルクエリ用に一つの共有された分散テーブルが作成されます。

データはバックグラウンドで書き込まれます。テーブルに挿入されたとき、データブロックは単にローカルファイルシステムに書き込まれます。データは、可能な限り早く、リモートサーバーにバックグラウンドで送信されます。データ送信の周期性は、[distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 設定によって管理されています。`Distributed` エンジンは、挿入されたデータを含む各ファイルを個別に送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 設定を使用してファイルのバッチ送信を有効にできます。この設定により、ローカルサーバーおよびネットワークリソースをより適切に活用することで、クラスター性能が向上します。データが正常に送信されたかどうかは、テーブルディレクトリ内の待機リストにあるファイルを確認することで確認できます: `/var/lib/clickhouse/data/database/table/`。バックグラウンドタスクを実行するスレッドの数は [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定によって設定できます。

`INSERT` が `Distributed` テーブルに行われた後、サーバーが存在しなくなったり、強制的に再起動した場合（たとえば、ハードウェア障害による）に、挿入されたデータが失われる可能性があります。テーブルディレクトリ内に破損したデータ部分が検出された場合、それは `broken` サブディレクトリに移動され、もはや使用されません。

## データの読み取り {#distributed-reading-data}

`Distributed` テーブルにクエリを行うと、`SELECT` クエリがすべてのシャードに送信され、データがシャード全体にどう分配されているかに関係なく機能します（完全にランダムに分配されている可能性もあります）。新しいシャードを追加すると、古いデータをその中に転送する必要はありません。代わりに、重みを大きくして新しいデータを書き込むことで、データが少し不均等に分配されますが、クエリは正しく効率的に機能します。

`max_parallel_replicas` オプションが有効になっている場合、クエリ処理は単一のシャード内のすべてのレプリカに並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) のセクションを参照してください。

分散 `in` および `global in` クエリがどのように処理されるかについては、[こちら](/sql-reference/operators/in#distributed-subqueries) のドキュメントを参照してください。

## 仮想カラム {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — テーブル `system.clusters` の `shard_num` 値を含みます。型: [UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[remote](../../../sql-reference/table-functions/remote.md) および [cluster](../../../sql-reference/table-functions/cluster.md) テーブル関数は内部的に一時的な Distributed テーブルを作成するため、`_shard_num` もそこに存在します。
:::

**参照**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns) の説明
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) および [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 関数
