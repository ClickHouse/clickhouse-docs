---
sidebar_label: "分散"
sidebar_position: 10
title: "分散テーブルエンジン"
description: "分散エンジンを持つテーブルは自身のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み込みは自動的に並列化されます。読み込み中は、リモートサーバー上のテーブルインデックスが使用されます。"
slug: /engines/table-engines/special/distributed
---

# 分散テーブルエンジン

:::warning
クラウドで分散テーブルエンジンを作成するには、[remote および remoteSecure](../../../sql-reference/table-functions/remote) テーブル関数を使用できます。`Distributed(...)` 構文は ClickHouse Cloud では使用できません。
:::

分散エンジンを持つテーブルは自身のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み込みは自動的に並列化されます。読み込み中は、リモートサーバー上のテーブルインデックスが使用されます。

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

### テーブルからの作成 {#distributed-from-a-table}

`Distributed` テーブルが現在のサーバー上のテーブルを指している場合、そのテーブルのスキーマを採用できます。

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分散パラメータ {#distributed-parameters}

#### cluster {#cluster}

`cluster` - サーバーの構成ファイル内のクラスタ名

#### database {#database}

`database` - リモートデータベースの名前

#### table {#table}

`table` - リモートテーブルの名前

#### sharding_key {#sharding_key}

`sharding_key` - (オプション) シャーディングキー

`sharding_key` を指定する必要があるのは次の場合です：

- 分散テーブルへの`INSERT`を行う場合（テーブルエンジンはデータを分割する方法を決定するために`sharding_key`が必要です）。ただし、`insert_distributed_one_random_shard`設定が有効になっている場合、`INSERT`にシャーディングキーは必要ありません。
- `optimize_skip_unused_shards`とともに使用する場合、`sharding_key`はどのシャードをクエリするべきかを決定するために必要です。

#### policy_name {#policy_name}

`policy_name` - (オプション) ポリシー名、バックグラウンド送信用の一時ファイルを格納するために使用されます。

**参照先**

 - [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
 - [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) の例を参照してください。

### 分散設定 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 分散テーブルへのバックグラウンド挿入後にファイルデータの`fsync`を行います。これにより、OSが挿入されたデータ全体を**イニシエータノード**のディスクにフラッシュすることが保証されます。

#### fsync_directories {#fsync_directories}

`fsync_directories` - ディレクトリの`fsync`を実行します。これにより、分散テーブルでのバックグラウンド挿入に関連する操作後にOSがディレクトリメタデータを更新することが保証されます（挿入後、シャードへのデータ送信後など）。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - trueの場合、ClickHouseは利用できないシャードを静かにスキップします。シャードが利用できないと見なされるのは次の条件のいずれかが成立する場合です：1) 接続失敗のためシャードにアクセスできない。2) DNSを介してシャードが解決できない。3) シャード上にテーブルが存在しない。デフォルトはfalseです。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - この圧縮バイト数を超える値がバックグラウンドINSERTで保留されると、例外がスローされます。0 - スローしません。デフォルトは0です。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - この圧縮バイト数を超える値がバックグラウンドINSERTで保留されると、クエリが遅延します。0 - 遅延しません。デフォルトは0です。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - バックグラウンド送信の保留バイトが多い場合に分散テーブルへのデータ挿入の最大遅延（秒）です。デフォルトは60秒です。

#### background_insert_batch {#background_insert_batch}

`background_insert_batch` - [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) と同様です。

#### background_insert_split_batch_on_failure {#background_insert_split_batch_on_failure}

`background_insert_split_batch_on_failure` - [distributed_background_insert_split_batch_on_failure](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同様です。

#### background_insert_sleep_time_ms {#background_insert_sleep_time_ms}

`background_insert_sleep_time_ms` - [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同様です。

#### background_insert_max_sleep_time_ms {#background_insert_max_sleep_time_ms}

`background_insert_max_sleep_time_ms` - [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同様です。

#### flush_on_detach {#flush_on_detach}

`flush_on_detach` - DETACH/DROP/server shutdown時にリモートノードにデータをフラッシュします。デフォルトはtrueです。

:::note
**耐久性設定** (`fsync_...`)：

- バックグラウンドINSERTのみ影響します（つまり、`distributed_foreground_insert=false`）で、データは最初にイニシエータノードのディスクに保存され、その後バックグラウンドでシャードに送信されます。
- 挿入の性能を大幅に低下させる可能性があります。
- ディストリビューションテーブルフォルダ内のデータの書き込みに影響します。基盤のMergeTreeテーブルにデータの書き込みを保証する必要がある場合は、`system.merge_tree_settings` での耐久性設定 (`...fsync...`) を参照してください。

**挿入制限設定** (`..._insert`) に関しては、次も参照してください：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [prefer_localhost_replica](../../../operations/settings/settings.md#prefer-localhost-replica) 設定
- `bytes_to_throw_insert`は`bytes_to_delay_insert`の前に処理されるため、`bytes_to_delay_insert`よりも少ない値に設定しないでください。
:::

**例**

``` sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

データは`logs`クラスタ内のすべてのサーバーから、クラスタ内のそれぞれのサーバーにある`default.hits`テーブルから読み取られます。データは読み取られるだけでなく、リモートサーバーで部分的に処理されます（可能な限りの範囲で）。例えば、`GROUP BY`を含むクエリでは、リモートサーバーでデータが集約され、集約関数の中間状態がリクエスターサーバーに送信されます。その後、データはさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用することができます。例えば、`currentDatabase()` 。

## クラスタ {#distributed-clusters}

クラスタは[サーバー構成ファイル](../../../operations/configuration-files.md)で構成されています。

``` xml
<remote_servers>
    <logs>
        <!-- 分散クエリ用の各クラスタの秘密
             デフォルト: 秘密なし（認証は行われません）

             設定されている場合、分散クエリはシャードで検証されるため、少なくとも：
             - このクラスタはシャード上に存在する必要があります。
             - このクラスタは同じ秘密を持っている必要があります。

             さらに（これがより重要です）、initial_userが
             クエリの現在のユーザーとして使用されます。
        -->
        <!-- <secret></secret> -->
        
        <!-- オプション。 このクラスタに対する分散DDLクエリ（ON CLUSTER節）が許可されているかどうか。 デフォルト: true（許可されています）。 -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->
        
        <shard>
            <!-- オプション。 データ書き込み時のシャードの重み。 デフォルト: 1. -->
            <weight>1</weight>
            <!-- オプション。 シャード名。 空でなく、一意である必要があります。 指定されていない場合、空になります。 -->
            <shard_name>shard_01</shard_name>
            <!-- オプション。 単一のレプリカにのみデータを書き込むかどうか。 デフォルト: false（すべてのレプリカにデータを書き込みます）。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- オプション。 負荷分散のためのレプリカの優先度（load_balancing設定も参照）。 デフォルト: 1（小さい値ほど優先度が高くなります）。 -->
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
            <shard_name>shard_02</shard_name>
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

ここで、「logs」という名前のクラスタが定義されており、2つのシャードから構成され、各シャードは2つのレプリカを含んでいます。シャードは、異なるデータ部分を含むサーバーを指します（すべてのデータを読み取るには、すべてのシャードにアクセスする必要があります）。レプリカは、データを複製するサーバーです（すべてのデータを読み取るには、いずれかのレプリカにアクセスできます）。

クラスタ名にドットを含めてはいけません。

各サーバーには、`host`、`port`、オプションで`user`、`password`、`secure`、`compression`のパラメータが指定されます：

- `host` – リモートサーバーのアドレス。ドメイン名またはIPv4またはIPv6アドレスを使用できます。ドメインを指定した場合、サーバーは起動時にDNSリクエストを行い、その結果をサーバーが稼働している限り保存します。DNSリクエストが失敗した場合、サーバーは起動しません。DNSレコードを変更した場合、サーバーを再起動してください。
- `port` – メッセンジャーアクティビティ用のTCPポート（構成ファイル内の`tcp_port`、通常は9000に設定されます）。`http_port`と混同しないでください。
- `user` – リモートサーバーへの接続に使用するユーザー名。デフォルト値は`default`ユーザーです。このユーザーは、指定されたサーバーへの接続を許可されている必要があります。アクセスは`users.xml`ファイルで構成されています。詳細については、[アクセス権](../../../guides/sre/user-management/index.md)のセクションを参照してください。
- `password` – リモートサーバーへの接続用のパスワード（マスクされていません）。デフォルト値は空の文字列です。
- `secure` - 安全なSSL/TLS接続を使用するかどうか。通常、ポートを指定する必要もあります（デフォルトの安全ポートは`9440`です）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` でリッスンし、正しい証明書で構成されている必要があります。
- `compression` - データ圧縮を使用します。デフォルト値: `true`。

レプリカを指定すると、読み取り時に各シャードに対して使用可能なレプリカの1つが選択されます。負荷分散のためのアルゴリズムを構成できます（どのレプリカにアクセスするかの優先度）– [load_balancing](../../../operations/settings/settings.md#load_balancing)設定を参照してください。サーバーとの接続が確立されない場合、短いタイムアウトで接続を試みます。接続が失敗した場合、次のレプリカが選択され、すべてのレプリカに対してそのプロセスが繰り返されます。すべてのレプリカで接続試行が失敗した場合、同じ方法で何回も再試行されます。これは回復力の向上に寄与しますが、完全な障害耐性を提供するわけではありません：リモートサーバーが接続を受け入れる可能性はありますが、機能しないか、機能が不適切な場合があるためです。

シャードの1つを指定するだけでよい（この場合、クエリ処理は分散ではなくリモートと呼ばれるべきです）、または任意の数のシャードを指定できます。各シャードには1つから任意の数のレプリカを指定できます。各シャードに異なる数のレプリカを指定できます。

構成内で任意の数のクラスタを指定できます。

クラスタを表示するには、`system.clusters`テーブルを使用します。

`Distributed`エンジンは、クラスタをローカルサーバーのように使用することを可能にします。ただし、クラスタの構成は動的に指定できず、サーバー構成ファイルで構成する必要があります。通常、クラスタ内のすべてのサーバーは同じクラスタ構成を持ちます（これは必須ではありません）。構成ファイルからのクラスタは、サーバーを再起動することなく、動的に更新されます。

各回で不明なシャードとレプリカのセットにクエリを送信する必要がある場合、`Distributed`テーブルを作成する必要はありません – その代わりに`remote`テーブル関数を使用します。詳細は[テーブル関数](../../../sql-reference/table-functions/index.md)のセクションを参照してください。

## データの書き込み {#distributed-writing-data}

クラスタへのデータ書き込みには2つの方法があります。

まず、どのサーバーにどのデータを書き込むかを定義し、各シャードで直接書き込みを行うことができます。言い換えれば、`Distributed`テーブルが指すリモートテーブル上で直接`INSERT`文を実行します。これは最も柔軟なソリューションであり、主題領域の要件によっては非自明なシャーディングスキームさえ使用できます。また、データは異なるシャードに完全に独立して書き込むことができるため、最も最適な解決策です。

第二に、`Distributed`テーブルに対して`INSERT`文を実行することができます。この場合、挿入されたデータは自動的にサーバー間で分配されます。`Distributed`テーブルに書き込むには、`sharding_key`パラメータが構成されている必要があります（シャードが1つだけの場合を除く）。

各シャードには構成ファイル内に`<weight>`を定義できます。デフォルトでは重みは`1`です。データはシャードの重みに比例して分配されます。すべてのシャードの重みが合計され、各シャードの重みが合計で割られて各シャードの割合が求められます。例えば、2つのシャードがあり、最初のシャードの重みが1で、2番目のシャードの重みが2の場合、最初のシャードには挿入された行の1/3（1/3）が送られ、2番目のシャードには2/3（2/3）が送られます。

各シャードには構成ファイルで`internal_replication`パラメータを定義できます。このパラメータが`true`に設定されている場合、書き込み操作は最初の正常なレプリカを選択し、そこにデータを書き込みます。`Distributed`テーブルの基盤となるテーブルがレプリケートテーブル（例えば、`Replicated*MergeTree`テーブルエンジンのいずれか）である場合にこれを使用します。テーブルのレプリカの1つが書き込みを受け、他のレプリカに自動的にレプリケートされます。

`internal_replication`が`false`（デフォルト）の場合、データはすべてのレプリカに書き込まれます。この場合、`Distributed`テーブルはデータを自動的にレプリケートします。これはレプリケートテーブルを使用するよりも悪化します。なぜなら、レプリカの整合性が確認されず、時間が経つとわずかに異なるデータを含む可能性があるためです。

データの行が送信されるシャードを選択するために、シャーディング式が分析され、その余りがシャードの総重量で割った値で取得されます。行は、`prev_weights`から`prev_weights + weight`の中間区間に対応するシャードに送信されます。ここで、`prev_weights`は最も小さな数のシャードの合計重量で、`weight`はこのシャードの重量です。例えば、2つのシャードがあり、最初のシャードが重み9で、2番目のシャードが重み10の場合、行は余りが\[0, 9)の範囲のときに最初のシャードに送信され、余りが\[9, 19)の範囲のときには2番目のシャードに送信されます。

シャーディング式は、整数を返す任意の式にできます。例えば、データのランダムな分配のために`rand()`式を使用することや、ユーザーのIDで割った余りによる分配のために`UserID`を使用することができます（このようにすると、単一のユーザーのデータが単一のシャードに存在し、`IN`および`JOIN`の実行が簡素化されます）。もしどれかのカラムが十分に均等に分配されていない場合、それをハッシュ関数例えば`intHash64(UserID)`でラップすることができます。

単純な割り算からの余りはシャーディングの限られた解決策であり、常に適切というわけではありません。これは中規模から大規模のデータ量（数十のサーバー）には適していますが、非常に大きなデータ量（数百のサーバー以上）には適していません。その場合、`Distributed`テーブルのエントリを使用するのではなく、主題領域に必要なシャーディングスキームを使用すべきです。

シャーディングスキームについて考慮すべきケースは次のとおりです：

- 特定のキーでデータを結合する必要があるクエリ（`IN`または`JOIN`）が使用されます。このキーによってデータがシャーディングされている場合、`GLOBAL IN`や`GLOBAL JOIN`の代わりにローカル`IN`や`JOIN`を使用することができ、はるかに効率的です。
- 大量のサーバー（数百以上）が使用され、小規模なクエリが多数存在する場合、例えば、個々のクライアントのデータに関するクエリ（ウェブサイト、広告主、パートナーなど）です。小規模なクエリがクラスタ全体に影響を与えないようにするためには、単一のクライアントのデータを単一のシャードに配置することが理にかなっています。あるいは、2層のシャーディングを設定することもできます：全クラスタを「層」に分割し、層は複数のシャードで構成されます。単一のクライアントのデータは単一の層に配置されますが、必要に応じて層にシャードを追加し、その中でデータがランダムに配分されます。各層のために`Distributed`テーブルが作成され、グローバルクエリ用に単一の共有分散テーブルが作成されます。

データはバックグラウンドで書き込まれます。テーブルに挿入されると、そのデータブロックはローカルのファイルシステムに書き込まれるだけです。データはできるだけ早くリモートサーバーに送信されます。データ送信の周期性は、[distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms)および[distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms)設定によって管理されます。`Distributed`エンジンは、挿入されたデータを含む各ファイルを別々に送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch)設定を使用してファイルのバッチ送信を有効にできます。この設定は、ローカルサーバーとネットワークリソースをより良く活用することでクラスタのパフォーマンスを改善します。データが正しく送信されたかどうかは、テーブルディレクトリ`/var/lib/clickhouse/data/database/table/`内のファイルリスト（送信待ちのデータ）をチェックすることで確認できます。バックグラウンドタスクを実行するスレッドの数は、[background_distributed_schedule_pool_size](../../../operations/settings/settings.md#background_distributed_schedule_pool_size)設定で設定できます。

サーバーが存在しなくなったり、強制再起動（例えば、ハードウェアの故障のため）した後に`Distributed`テーブルへの`INSERT`が発生した場合、挿入データが失われる可能性があります。テーブルディレクトリ内に破損したデータパートが検出された場合、それは`broken`サブディレクトリに移動され、もはや使用されません。

## データの読み取り {#distributed-reading-data}

`Distributed`テーブルをクエリする際、`SELECT`クエリはすべてのシャードに送信され、データがシャード間でどのように分散されているかに関わらず機能します（データは完全にランダムに分配される可能性があります）。新しいシャードを追加したとき、古いデータをその中に移動させる必要はありません。その代わり、少し重い重みを使用して新しいデータを書き込むことができます – データは少し不均等に分配されますが、クエリは正しく効率的に機能します。

`max_parallel_replicas`オプションが有効になっていると、クエリ処理は単一のシャード内のすべてのレプリカに並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas)のセクションを参照してください。

分散`in`および`global in`クエリがどのように処理されるかについては、[こちら](../../../sql-reference/operators/in.md#select-distributed-subqueries)のドキュメントを参照してください。

## 仮想カラム {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — `system.clusters` テーブルの `shard_num` 値を含みます。タイプ: [UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[remote](../../../sql-reference/table-functions/remote.md)および[cluster](../../../sql-reference/table-functions/cluster.md)テーブル関数は内部的に一時的な分散テーブルを生成するため、`_shard_num`はそこでも利用可能です。
:::

**参照先**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)の説明
- [background_distributed_schedule_pool_size](../../../operations/settings/settings.md#background_distributed_schedule_pool_size)設定
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum)および[shardCount()](../../../sql-reference/functions/other-functions.md#shardcount)関数
