---
sidebar_label: "分散"
sidebar_position: 10
title: "分散テーブルエンジン"
description: "分散エンジンを持つテーブルは自分自身のデータを保存することはなく、複数のサーバー上での分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中、リモートサーバー上のテーブルインデックスが使用されます。"
slug: /engines/table-engines/special/distributed
---


# 分散テーブルエンジン

:::warning
クラウドで分散テーブルエンジンを作成するには、[remote と remoteSecure](../../../sql-reference/table-functions/remote) テーブル関数を使用できます。 `Distributed(...)` 構文は ClickHouse Cloud では使用できません。
:::

分散エンジンを持つテーブルは自分自身のデータを保存することはなく、複数のサーバー上での分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中、リモートサーバー上のテーブルインデックスが使用されます。

## テーブルの作成 {#distributed-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### テーブルから {#distributed-from-a-table}

`Distributed` テーブルが現在のサーバー上のテーブルを指しているとき、そのテーブルのスキーマを取り込むことができます：

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分散パラメータ {#distributed-parameters}

#### cluster {#cluster}

`cluster` - サーバーの設定ファイル内のクラスタ名

#### database {#database}

`database` - リモートデータベースの名前

#### table {#table}

`table` - リモートテーブルの名前

#### sharding_key {#sharding_key}

`sharding_key` - （オプション）シャーディングキー

以下の場合には `sharding_key` を指定する必要があります：

- 分散テーブルへの `INSERT` を行う場合（テーブルエンジンがデータをどのように分割するかを決定するために `sharding_key` が必要です）。ただし、`insert_distributed_one_random_shard` 設定が有効になっている場合は、`INSERT` に sharding key は必要ありません。
- `optimize_skip_unused_shards` を使用する場合、どのシャードをクエリするかを決定するために `sharding_key` が必要です。

#### policy_name {#policy_name}

`policy_name` - （オプション）ポリシー名。バックグラウンド送信のための一時ファイルを保存するのに使用されます。

**関連情報**

 - [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
 - 例については [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) を参照してください。

### 分散設定 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 背景挿入後にファイルデータの `fsync` を実行します。これにより、OSが **イニシエーター ノード** のディスクに全ての挿入データをフラッシュしたことが保証されます。

#### fsync_directories {#fsync_directories}

`fsync_directories` - ディレクトリの `fsync` を行います。これにより、分散テーブルの背景挿入に関連する操作後に、OSがディレクトリのメタデータを更新したことが保証されます（挿入後、データをシャードに送信した後など）。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - true の場合、ClickHouse は利用できないシャードを静かにスキップします。シャードは以下の理由で利用できないとマークされます：1) 接続失敗によりシャードに到達できない。2) DNS を通じてシャードが解決できない。3) シャードにテーブルが存在しない。デフォルトは false です。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - この数を超える圧縮バイトが背景挿入のために保留されると、例外がスローされます。0 - スローしない。デフォルトは 0 です。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - この数を超える圧縮バイトが背景挿入のために保留されると、クエリが遅延します。0 - 遅延しない。デフォルトは 0 です。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - 背景送信のために多くの保留バイトがある場合に、分散テーブルへのデータ挿入の最大遅延（秒単位）です。デフォルトは 60 です。

#### background_insert_batch {#background_insert_batch}

`background_insert_batch` - [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) と同じです。

#### background_insert_split_batch_on_failure {#background_insert_split_batch_on_failure}

`background_insert_split_batch_on_failure` - [distributed_background_insert_split_batch_on_failure](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同じです。

#### background_insert_sleep_time_ms {#background_insert_sleep_time_ms}

`background_insert_sleep_time_ms` - [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同じです。

#### background_insert_max_sleep_time_ms {#background_insert_max_sleep_time_ms}

`background_insert_max_sleep_time_ms` - [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同じです。

#### flush_on_detach {#flush_on_detach}

`flush_on_detach` - DETACH/DROP/server shutdown の際にリモートノードにデータをフラッシュします。デフォルトは true です。

:::note
**耐久性設定**（`fsync_...`）：

- 背景挿入（すなわち、`distributed_foreground_insert=false`）にのみ影響し、データが最初にイニシエーター ノードのディスクに保存され、後で背景でシャードに送信されます。
- 挿入のパフォーマンスを大幅に低下させる可能性があります。
- データを分散テーブルフォルダー内に書き込むことに影響を与えます。基になる MergeTree テーブルへのデータの書き込み保証が必要な場合は、`system.merge_tree_settings` の耐久性設定（`...fsync...`）を参照してください。

**挿入制限設定**（`..._insert`）についても次を参照してください：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 設定
- `bytes_to_throw_insert` は `bytes_to_delay_insert` の前に処理されるため、`bytes_to_delay_insert` よりも小さい値に設定しないでください。
:::

**例**

``` sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

データは `logs` クラスタ内の全サーバーから、クラスタ内の各サーバーに位置する `default.hits` テーブルから読み取ります。データは読み取るだけでなく、リモートサーバー上で部分的に処理されます（可能な範囲内で）。たとえば、`GROUP BY` 構文を使用したクエリの場合、データはリモートサーバー上で集約され、中間的な集約関数の状態が要求サーバーに送信されます。その後、データがさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用できます。たとえば：`currentDatabase()`。

## クラスタ {#distributed-clusters}

クラスタは [サーバー設定ファイル](../../../operations/configuration-files.md) 内で構成されます：

``` xml
<remote_servers>
    <logs>
        <!-- 分散クエリ用のサーバー間のクラスタ秘密
             デフォルト：秘密なし（認証は行われません）

             設定すると、分散クエリはシャードで検証されるため、少なくとも：
             - そのようなクラスタがシャード上に存在する必要があります、
             - そのようなクラスタは同じ秘密を持っている必要があります。

             また（より重要なのは）、initial_user が
             クエリの現在のユーザーとして使用されます。
        -->
        <!-- <secret></secret> -->
        
        <!-- オプション。このクラスタに対して分散DDLクエリ（ON CLUSTER句）が許可されるかどうか。デフォルト：true（許可されている）。 -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->
        
        <shard>
            <!-- オプション。データを記録する際のシャードの重み。デフォルト：1。 -->
            <weight>1</weight>
            <!-- オプション。シャード名。空ではなく、クラスタ内の他のシャードとユニークである必要があります。指定しない場合は空になります。 -->
            <name>shard_01</name>
            <!-- オプション。レプリカの一つにデータを書き込むかどうか。デフォルト：false（全てのレプリカにデータを書き込む）。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- オプション。負荷分散のためのレプリカの優先順位（load_balancing設定も参照）。デフォルト：1（値が小さいほど優先される）。 -->
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

ここでは、`logs` という名前のクラスタが定義されており、2つのシャードから構成され、それぞれに2つのレプリカが含まれています。シャードは異なるデータの部分を含むサーバーを指します（全てのデータを読み取るには、全てのシャードにアクセスする必要があります）。レプリカはデータを複製するサーバーです（全データを読み取るには、任意の1つのレプリカのデータにアクセスできます）。

クラスタ名にはドットを含めることはできません。

各サーバーに対して、`host`、`port`、およびオプションで `user`、`password`、`secure`、`compression` が指定されます：

- `host` – リモートサーバーのアドレス。ドメイン、IPv4、およびIPv6アドレスを使用できます。ドメインを指定すると、サーバーは起動時にDNSリクエストを行い、その結果はサーバーが動作している間保持されます。DNSリクエストが失敗すると、サーバーは起動しません。DNSレコードを変更した場合は、サーバーを再起動してください。
- `port` – メッセージングアクティビティ用のTCPポート（設定内の `tcp_port`、通常は9000に設定される）。`http_port` と混同しないでください。
- `user` – リモートサーバーに接続するためのユーザー名。デフォルト値は `default` ユーザーです。このユーザーは指定されたサーバーに接続するためのアクセス権が必要です。アクセスは `users.xml` ファイルで設定されます。詳細については、[アクセス権](../../../guides/sre/user-management/index.md)セクションを参照してください。
- `password` – リモートサーバーに接続するためのパスワード（マスクされていません）。デフォルト値は空文字列です。
- `secure` - セキュアなSSL/TLS接続を使用するかどうか。通常はポートの指定も必要です（デフォルトのセキュアポートは `9440` です）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` でリッスンし、正しい証明書で設定される必要があります。
- `compression` - データの圧縮を使用します。デフォルト値：`true`。

レプリカを指定すると、読み取り時に各シャードに対して利用可能なレプリカのうちの1つが選択されます。負荷分散アルゴリズムを設定することができます（どのレプリカにアクセスするかの優先順位） – [load_balancing](../../../operations/settings/settings.md#load_balancing) 設定を参照してください。サーバーとの接続が確立できない場合、短いタイムアウトで接続を試みます。接続に失敗した場合、次のレプリカが選択され、すべてのレプリカについて同様に行います。この構造はレジリエンスに寄与しますが、完全な障害耐性を提供するものではありません：リモートサーバーが接続を受け付けることがあっても、動作しない可能性があります。

シャードの1つだけを指定することもできます（この場合、クエリ処理は分散ではなくリモートと呼ばれるべきです）し、任意の数のシャードを指定することもできます。各シャードには任意の数のレプリカを指定できます。シャードごとに異なる数のレプリカを指定することができます。

設定ファイル内に、必要な限り多くのクラスタを指定できます。

クラスタを表示するには、`system.clusters` テーブルを使用します。

`Distributed` エンジンは、クラスタをローカルサーバーのように扱うことを許可します。ただし、クラスタの設定を動的に指定することはできず、サーバー設定ファイル内で設定する必要があります。通常、クラスタ内のすべてのサーバーは同じクラスタ設定を持つことになります（ただし、これは必須ではありません）。設定ファイルからのクラスタは、サーバーを再起動することなく動的に更新されます。

毎回未知のシャードとレプリカのセットにクエリを送信する必要がある場合、`Distributed` テーブルを作成する必要はありません - その代わりに `remote` テーブル関数を使用してください。テーブル関数に関するセクションを参照してください [Table functions](../../../sql-reference/table-functions/index.md)。

## データの書き込み {#distributed-writing-data}

クラスタにデータを書き込む方法は2つあります：

最初に、どのサーバーにどのデータを書き込むかを定義し、各シャードで直接書き込みを行うことができます。言い換えれば、`Distributed` テーブルが指しているクラスタ内のリモートテーブルに対して直接 `INSERT` 文を実行します。これは最も柔軟な解決策であり、サブジェクトエリアの要件に基づいて従来の方法以上に非自明なシャーディングスキームを使用できます。また、データが異なるシャードに完全に独立して書き込まれることから、最も最適な解決策でもあります。

次に、`Distributed` テーブルに対して `INSERT` 文を実行することができます。この場合、テーブルは挿入されたデータを自動的にサーバー間に分配します。`Distributed` テーブルに書き込むには、`sharding_key` パラメータが設定されている必要があります（シャードが1つだけの場合は不要です）。

各シャードには、設定ファイルで `<weight>` を定義できます。デフォルトでは、重みは `1` です。データは、シャードの重みに比例した量でシャード間に分配されます。すべてのシャードの重みが合計され、各シャードの重みは合計で割られてその比率が決定されます。たとえば、2つのシャードがあり、1つ目が重み1、2つ目が重み2である場合、最初のシャードには挿入された行の3分の1（1 / 3）が送信され、2番目のシャードには3分の2（2 / 3）が送信されます。

各シャードには、設定ファイルに `internal_replication` パラメータを定義できます。このパラメータが `true` に設定されている場合、書き込み操作は最初の正常なレプリカを選択してそこにデータを書き込みます。これは、`Distributed` テーブルの基になっているテーブルがレプリケートされたテーブル（例：`Replicated*MergeTree` テーブルエンジンのいずれか）である場合に使用します。テーブルのレプリカの1つが書き込みを受け取り、他のレプリカに自動的にレプリケートされます。

`internal_replication` が `false`（デフォルト）に設定されている場合、データはすべてのレプリカに書き込まれます。この場合、`Distributed` テーブルは自分自身でデータをレプリケートします。これは、レプリカの一貫性が確認されず、時間が経つにつれてわずかに異なるデータを保持するため、レプリケートされたテーブルを使用するよりも悪化します。

データの行が送信されるシャードを選択するために、シャーディング式が分析され、その剰余がシャードの総重量で割った余りとして取得されます。行は、`prev_weights` から `prev_weights + weight` の剰余の半区間に対応するシャードに送信されます。ここで `prev_weights` は最小の数を持つシャードの総重量であり、`weight` はこのシャードの重みです。たとえば、2つのシャードがあり、1つ目が重み9、2つ目が重み10である場合、行は範囲 \[0, 9) の剰余で1つ目のシャードに送信され、範囲 \[9, 19) の剰余で2つ目のシャードに送信されます。

シャーディング式は、整数を返す定数やテーブルカラムから成る任意の式を使用できます。たとえば、データのランダムな分配には式 `rand()` を、ユーザーのIDで割った余りによる分配には `UserID` を使用できます（その場合、単一のユーザーのデータは単一のシャードに保持され、`IN` や `JOIN` が簡素化されます）。もし1つのカラムが十分に均等に分配されていない場合、ハッシュ関数でラップできます（例：`intHash64(UserID)`）。

単純な剰余による分割は、シャーディングに対して限定的な解決策であり、常に適切とは限りません。中規模および大規模なデータ（数十のサーバー）には機能しますが、非常に大きなデータ（数百のサーバーまたはそれ以上）には適しません。後者の場合は、`Distributed` テーブルのエントリを使用するのではなく、対象領域の要件に応じたシャーディングスキームを使用してください。

以下のような場合には、シャーディングスキームに注意する必要があります：

- 特定のキーによるデータの結合（`IN` または `JOIN`）が必要なクエリが使用されるとき。このキーでデータがシャードされていれば、`GLOBAL IN` や `GLOBAL JOIN` の代わりにローカル `IN` や `JOIN` を使用することができ、多くの効率が得られます。
- 大量のサーバー（数百以上）が使用され、小さなクエリの数が多い場合。例として、個々のクライアントのデータに対するクエリ（例：ウェブサイト、広告主、パートナー向けのクエリ）が挙げられます。小さなクエリが全体のクラスタに影響を与えないようにするためには、単一のクライアント向けのデータを単一のシャードに配置することが合理的です。あるいは、二層のシャーディングを設定できます：全体のクラスタを「層」に分けることができ、1つの層は複数のシャードから構成されます。単一のクライアントのデータは単一の層に位置しますが、必要に応じて層にシャードが追加され、データはその中でランダムに分配されます。各層用に `Distributed` テーブルを作成し、グローバルクエリ用に単一の共有分散テーブルを作成します。

データはバックグラウンドで書き込まれます。テーブルに挿入されると、データブロックはローカルファイルシステムに書き込まれます。データはできるだけ早くリモートサーバーに送信されます。データ送信の周期性は、[distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 設定によって管理されます。`Distributed` エンジンは、挿入されたデータごとに各ファイルを別々に送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 設定を使用するとファイルのバッチ送信を有効にできます。この設定により、クラスタのパフォーマンスが向上し、ローカルサーバーとネットワークリソースがより良く活用されます。データが正常に送信されたかどうかを確認するには、テーブルディレクトリのファイルリスト（送信待ちデータ）を確認してください：`/var/lib/clickhouse/data/database/table/`。バックグラウンドタスクを実行するスレッドの数は、[background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定によって設定できます。

サーバーが存在しなくなったり、厳密に再起動された場合（たとえば、ハードウェアの故障による）、`Distributed` テーブルへの `INSERT` により挿入されたデータが失われる可能性があります。テーブルディレクトリに損傷したデータ部分が検出された場合は、それは `broken` サブディレクトリに移動され、それ以上使用されません。

## データの読み取り {#distributed-reading-data}

`Distributed` テーブルをクエリする際、`SELECT` クエリはすべてのシャードに送信され、データがシャード間にどのように分配されているかに関わらず機能します（完全にランダムに分散している可能性があります）。新しいシャードを追加しても古いデータを転送する必要はありません。それ代わりに、新しいデータに対して重い重みを指定して書き込むことができます – データはわずかに不均一に分配されますが、クエリは正しく効率的に動作します。

`max_parallel_replicas` オプションが有効になっている場合、クエリ処理は単一のシャード内のすべてのレプリカに対して並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) セクションを参照してください。

分散`in`および`global in`クエリの処理方法について詳しく知るには、[こちら](/sql-reference/operators/in#distributed-subqueries)のドキュメントを参照してください。

## 仮想カラム {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — テーブル `system.clusters` からの `shard_num` 値を含みます。型: [UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[remote](../../../sql-reference/table-functions/remote.md) および [cluster](../../../sql-reference/table-functions/cluster.md) テーブル関数は内部で一時的な Distributed テーブルを作成するため、 `_shard_num` もそれらで利用可能です。
:::

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns) の説明
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) および [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 関数
