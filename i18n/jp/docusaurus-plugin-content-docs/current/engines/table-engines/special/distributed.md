---
description: 'Distributed エンジンを使用するテーブル自体はデータを一切保存せず、複数サーバーにまたがる分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り時には、リモートサーバー上にテーブルインデックスが存在する場合はそれが利用されます。'
sidebar_label: 'Distributed'
sidebar_position: 10
slug: /engines/table-engines/special/distributed
title: 'Distributed テーブルエンジン'
doc_type: 'reference'
---



# Distributed table engine

:::warning Distributed engine in Cloud
ClickHouse Cloud で Distributed テーブルエンジンを作成するには、[`remote` および `remoteSecure`](../../../sql-reference/table-functions/remote) テーブル関数を使用できます。 
`Distributed(...)` 構文は ClickHouse Cloud では使用できません。
:::

Distributed エンジンを使用するテーブルは、自身ではデータを一切保存しませんが、複数サーバー上での分散クエリ処理を可能にします。 
読み取りは自動的に並列化されます。読み取り時には、存在する場合にはリモートサーバー上のテーブルインデックスが利用されます。



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

### テーブルからの作成 {#distributed-from-a-table}

`Distributed`テーブルが現在のサーバー上のテーブルを指している場合、そのテーブルのスキーマを採用できます:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### Distributedパラメータ {#distributed-parameters}

| パラメータ                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster`                 | サーバーの設定ファイル内のクラスタ名                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `database`                | リモートデータベースの名前                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `table`                   | リモートテーブルの名前                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `sharding_key` (オプション) | シャーディングキー。<br/> `sharding_key`の指定は以下の場合に必要です: <ul><li>分散テーブルへの`INSERT`を行う場合(テーブルエンジンがデータの分割方法を決定するために`sharding_key`が必要です)。ただし、`insert_distributed_one_random_shard`設定が有効な場合、`INSERT`にはシャーディングキーは不要です。</li><li>`optimize_skip_unused_shards`と併用する場合、クエリ対象のシャードを決定するために`sharding_key`が必要です</li></ul> |
| `policy_name` (オプション)  | ポリシー名。バックグラウンド送信用の一時ファイルの保存に使用されます                                                                                                                                                                                                                                                                                                                                                                                                         |

**関連項目**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert)設定
- 例については[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes)を参照

### Distributed設定 {#distributed-settings}


| Setting                                    | Description                                                                                                                                                    | Default value |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `fsync_after_insert`                       | Distributed テーブルへのバックグラウンド挿入後にファイルデータに対して `fsync` を実行します。OS が **イニシエータノード** のディスク上のファイルへ、挿入されたデータ全体をフラッシュしたことを保証します。                                           | `false`       |
| `fsync_directories`                        | ディレクトリに対して `fsync` を実行します。Distributed テーブルへのバックグラウンド挿入に関連する操作（挿入後、シャードへのデータ送信後など）の後で、OS がディレクトリメタデータを更新したことを保証します。                                             | `false`       |
| `skip_unavailable_shards`                  | true の場合、ClickHouse は利用不可なシャードをエラーを出さずにスキップします。シャードは次のいずれかの場合に利用不可とみなされます: 1) 接続障害によりシャードに到達できない。2) DNS を通じてシャードを解決できない。3) シャード上にテーブルが存在しない。                   | `false`       |
| `bytes_to_throw_insert`                    | バックグラウンド `INSERT` のために待機中の圧縮バイト数がこの値を超えると、例外がスローされます。`0` の場合はスローしません。                                                                                          | `0`           |
| `bytes_to_delay_insert`                    | バックグラウンド `INSERT` のために待機中の圧縮バイト数がこの値を超えると、クエリは遅延されます。`0` の場合は遅延しません。                                                                                           | `0`           |
| `max_delay_to_insert`                      | バックグラウンド送信のために待機中のバイト数が多い場合に、Distributed テーブルへのデータ挿入が遅延される最大秒数。                                                                                                | `60`          |
| `background_insert_batch`                  | [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch) と同じです。                                   | `0`           |
| `background_insert_split_batch_on_failure` | [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同じです。 | `0`           |
| `background_insert_sleep_time_ms`          | [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同じです。                   | `0`           |
| `background_insert_max_sleep_time_ms`      | [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同じです。           | `0`           |
| `flush_on_detach`                          | `DETACH` / `DROP` / サーバーシャットダウン時にリモートノードへデータをフラッシュします。                                                                                                         | `true`        |

:::note
**耐久性設定** (`fsync_...`):

* データが最初にイニシエータノードのディスクに保存され、その後バックグラウンドでシャードに送信されるバックグラウンド `INSERT`（つまり `distributed_foreground_insert=false`）のみに影響します。
* `INSERT` のパフォーマンスを大きく低下させる可能性があります。
* 分散テーブルフォルダ内に保存されるデータを、**あなたの `INSERT` を受け付けたノード** に書き込む際の動作に影響します。基盤となる MergeTree テーブルへのデータ書き込みについて保証が必要な場合は、`system.merge_tree_settings` 内の耐久性設定（`...fsync...`）を参照してください。

**挿入制限設定**（`..._insert`）については、次も参照してください:

* [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
* [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 設定
* `bytes_to_throw_insert` は `bytes_to_delay_insert` よりも前に評価されるため、`bytes_to_delay_insert` より小さい値に設定すべきではありません。
  :::

**例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

`logs` クラスター内のすべてのサーバーに存在する `default.hits` テーブルからデータが読み取られます。データは読み取られるだけでなく、可能な範囲でリモートサーバー側で部分的に処理されます。たとえば、`GROUP BY` を含むクエリの場合、データはリモートサーバー上で集約され、集約関数の中間状態が要求元サーバーに送信されます。その後、データはさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用できます。たとえば、`currentDatabase()` を使用できます。


## クラスター {#distributed-clusters}

クラスターは[サーバー設定ファイル](../../../operations/configuration-files.md)で設定します:

```xml
<remote_servers>
    <logs>
        <!-- 分散クエリ用のクラスター間サーバーシークレット
             デフォルト: シークレットなし(認証は実行されません)

             設定された場合、分散クエリはシャード上で検証されます。そのため、少なくとも以下が必要です:
             - 該当するクラスターがシャード上に存在すること
             - 該当するクラスターが同じシークレットを持つこと

             また(より重要なことに)、initial_userが
             クエリの現在のユーザーとして使用されます。
        -->
        <!-- <secret></secret> -->

        <!-- オプション。このクラスターで分散DDLクエリ(ON CLUSTER句)を許可するかどうか。デフォルト: true(許可)。 -->
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->

        <shard>
            <!-- オプション。データ書き込み時のシャードの重み。デフォルト: 1。 -->
            <weight>1</weight>
            <!-- オプション。シャード名。クラスター内のシャード間で空でなく一意である必要があります。指定されない場合は空になります。 -->
            <name>shard_01</name>
            <!-- オプション。レプリカの1つだけにデータを書き込むかどうか。デフォルト: false(すべてのレプリカにデータを書き込む)。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- オプション。負荷分散のためのレプリカの優先度(load_balancing設定も参照)。デフォルト: 1(値が小さいほど優先度が高い)。 -->
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

ここでは、2つのシャードで構成される`logs`という名前のクラスターが定義されており、各シャードには2つのレプリカが含まれています。シャードはデータの異なる部分を保持するサーバーを指します(すべてのデータを読み取るには、すべてのシャードにアクセスする必要があります)。レプリカは複製サーバーです(すべてのデータを読み取るには、いずれか1つのレプリカのデータにアクセスすれば十分です)。

クラスター名にドットを含めることはできません。

各サーバーには、パラメータ`host`、`port`、およびオプションで`user`、`password`、`secure`、`compression`、`bind_host`を指定します:


| Parameter     | Description                                                                                                                                                                                                                                                                                                                              | Default Value |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `host`        | リモートサーバーのアドレス。ドメイン名または IPv4 / IPv6 アドレスのいずれかを使用できます。ドメイン名を指定した場合、サーバー起動時に DNS リクエストが行われ、その結果はサーバーが動作している間保持されます。DNS リクエストが失敗した場合、サーバーは起動しません。DNS レコードを変更した場合は、サーバーを再起動してください。 | -            |
| `port`        | メッセージ送受信に使用する TCP ポート（設定の `tcp_port`。通常は 9000 に設定）。`http_port` と混同しないでください。                                                                                                                                                                                                                    | -            |
| `user`        | リモートサーバーへの接続に使用するユーザー名。このユーザーは、指定したサーバーへ接続する権限を持っている必要があります。アクセス権は `users.xml` ファイルで設定します。詳細は [Access rights](../../../guides/sre/user-management/index.md) セクションを参照してください。                                                                      | `default`    |
| `password`    | リモートサーバーへの接続に使用するパスワード（マスクされません）。                                                                                                                                                                                                                                                                       | ''           |
| `secure`      | セキュアな SSL/TLS 接続を使用するかどうか。通常はポートの指定も必要になります（デフォルトのセキュアポートは `9440`）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` で待ち受ける必要があり、正しい証明書で構成されていなければなりません。                                                                                               | `false`      |
| `compression` | データ圧縮を使用するかどうか。                                                                                                                                                                                                                                                                                                            | `true`       |
| `bind_host`   | このノードからリモートサーバーへ接続する際に使用する送信元アドレス。IPv4 アドレスのみサポートされます。ClickHouse の分散クエリで使用される送信元 IP アドレスを指定する必要がある高度なデプロイケース向けに意図されています。                                                                                                               | -            |

レプリカを指定した場合、読み取り時には各シャードごとに、利用可能なレプリカのうち 1 つが選択されます。負荷分散のアルゴリズム（どのレプリカへのアクセスを優先するか）は [load_balancing](../../../operations/settings/settings.md#load_balancing) 設定で構成できます。サーバーとの接続が確立できない場合、短いタイムアウトでの接続が試行されます。接続に失敗した場合は、次のレプリカが選択され、残りのすべてのレプリカに対して同様に試行されます。すべてのレプリカへの接続試行が失敗した場合、同じ方法で複数回試行が繰り返されます。これはレジリエンスの向上には役立ちますが、完全なフォールトトレランスを提供するものではありません。リモートサーバーが接続を受け付けても、動作していなかったり、正常に動作していなかったりする可能性があります。

シャードは 1 つだけ指定することも（この場合、クエリ処理は分散ではなく remote と呼ぶべきです）、任意の数のシャードを指定することもできます。各シャード内では、1 つから任意の数のレプリカを指定できます。シャードごとに異なるレプリカ数を指定することも可能です。

設定ファイル内で、任意の数のクラスタを指定できます。

クラスタを表示するには、`system.clusters` テーブルを使用します。

`Distributed` エンジンを使用すると、クラスタをローカルサーバーのように扱うことができます。ただし、クラスタの設定は動的に指定することはできず、サーバーの設定ファイルで構成する必要があります。通常はクラスタ内のすべてのサーバーが同じクラスタ設定を持ちます（必須ではありません）。設定ファイルに定義されたクラスタは、サーバーを再起動することなく、その場で更新されます。

毎回、未知のシャードおよびレプリカの集合に対してクエリを送信する必要がある場合、`Distributed` テーブルを作成する必要はありません。代わりに `remote` テーブル関数を使用してください。詳細は [Table functions](../../../sql-reference/table-functions/index.md) セクションを参照してください。



## データの書き込み {#distributed-writing-data}

クラスタにデータを書き込む方法は2つあります。

1つ目は、どのサーバにどのデータを書き込むかを定義し、各シャードに直接書き込みを実行する方法です。つまり、`Distributed`テーブルが参照しているクラスタ内のリモートテーブルに対して直接`INSERT`文を実行します。この方法は、対象領域の要件により複雑なシャーディングスキームであっても、任意のシャーディングスキームを使用できるため、最も柔軟なソリューションです。また、データを異なるシャードに完全に独立して書き込むことができるため、最も最適なソリューションでもあります。

2つ目は、`Distributed`テーブルに対して`INSERT`文を実行する方法です。この場合、テーブル自体が挿入されたデータをサーバ間に分散します。`Distributed`テーブルに書き込むには、`sharding_key`パラメータが設定されている必要があります(シャードが1つしかない場合を除く)。

各シャードには、設定ファイルで`<weight>`を定義できます。デフォルトでは、重みは`1`です。データはシャードの重みに比例した量でシャード間に分散されます。すべてのシャードの重みが合計され、各シャードの重みを合計で除算して、各シャードの割合が決定されます。例えば、2つのシャードがあり、1つ目の重みが1で2つ目の重みが2の場合、1つ目には挿入される行の3分の1(1 / 3)が送信され、2つ目には3分の2(2 / 3)が送信されます。

各シャードには、設定ファイルで`internal_replication`パラメータを定義できます。このパラメータが`true`に設定されている場合、書き込み操作は最初の正常なレプリカを選択し、そこにデータを書き込みます。`Distributed`テーブルの基盤となるテーブルがレプリケートされたテーブル(例えば、`Replicated*MergeTree`テーブルエンジンのいずれか)である場合に使用します。テーブルレプリカの1つが書き込みを受け取り、他のレプリカに自動的にレプリケートされます。

`internal_replication`が`false`(デフォルト)に設定されている場合、データはすべてのレプリカに書き込まれます。この場合、`Distributed`テーブル自体がデータをレプリケートします。これは、レプリカの整合性がチェックされず、時間の経過とともにわずかに異なるデータが含まれるようになるため、レプリケートされたテーブルを使用するよりも劣ります。

データ行が送信されるシャードを選択するために、シャーディング式が解析され、シャードの総重みで除算した剰余が取得されます。行は、`prev_weights`から`prev_weights + weight`までの剰余の半開区間に対応するシャードに送信されます。ここで、`prev_weights`は最小番号のシャードの総重みであり、`weight`はこのシャードの重みです。例えば、2つのシャードがあり、1つ目の重みが9で2つ目の重みが10の場合、剰余が範囲\[0, 9)の行は1つ目のシャードに送信され、範囲\[9, 19)の剰余は2つ目のシャードに送信されます。

シャーディング式は、整数を返す定数とテーブル列からの任意の式にすることができます。例えば、データのランダム分散には`rand()`式を使用したり、ユーザIDを除算した剰余による分散には`UserID`を使用したりできます(この場合、単一ユーザのデータは単一のシャードに存在するため、ユーザによる`IN`や`JOIN`の実行が簡素化されます)。列の1つが十分に均等に分散されていない場合は、ハッシュ関数でラップすることができます。例えば、`intHash64(UserID)`のようにします。

除算による単純な剰余は、シャーディングにおいて限定的なソリューションであり、常に適切とは限りません。中規模および大規模なデータ量(数十台のサーバ)では機能しますが、非常に大規模なデータ量(数百台以上のサーバ)では機能しません。後者の場合は、`Distributed`テーブルのエントリを使用するのではなく、対象領域で必要とされるシャーディングスキームを使用してください。

次のような場合には、シャーディングスキームについて検討する必要があります。


- 特定のキーによるデータ結合（`IN` や `JOIN`）を必要とするクエリが使用される場合、そのキーでデータをシャードしておけば、より効率の悪い `GLOBAL IN` や `GLOBAL JOIN` の代わりにローカルな `IN` または `JOIN` を使用でき、はるかに効率的です。
- 非常に多数のサーバー（数百台以上）で多数の小さなクエリを処理する場合、たとえば個々のクライアント（ウェブサイト、広告主、パートナーなど）のデータに対するクエリを処理するようなケースでは、小さなクエリがクラスター全体に影響を及ぼさないようにするために、1 クライアントのデータを 1 つのシャード上に配置することが合理的です。代替案として、2 段階のシャーディングを設定することもできます。クラスター全体を複数の「レイヤー」に分割し、1 つのレイヤーは複数のシャードから構成されるようにします。1 クライアントのデータは 1 つのレイヤー上に配置しますが、必要に応じてレイヤーにシャードを追加でき、その中ではデータがランダムに分散されます。各レイヤーごとに `Distributed` テーブルを作成し、グローバルクエリ用には共有の分散テーブルを 1 つ作成します。

データはバックグラウンドで書き込まれます。テーブルに `INSERT` されると、データブロックはローカルファイルシステムに書き込まれるだけです。データは可能な限り速やかにバックグラウンドでリモートサーバーへ送信されます。データ送信の周期は [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) および [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 設定で管理されます。`Distributed` エンジンは挿入されたデータを含むファイルを 1 ファイルずつ送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 設定を有効にすることで、複数ファイルをまとめて送信できます。この設定により、ローカルサーバーおよびネットワークリソースをより有効に利用することで、クラスターのパフォーマンスが向上します。テーブルディレクトリ `/var/lib/clickhouse/data/database/table/` 内のファイル一覧（送信待ちのデータ）を確認して、データが正常に送信されているかをチェックする必要があります。バックグラウンドタスクを実行するスレッド数は [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定で指定できます。

`Distributed` テーブルに対する `INSERT` の後で、サーバーがクラッシュした場合や（たとえばハードウェア障害による）強制的な再起動が発生した場合、挿入されたデータは失われる可能性があります。テーブルディレクトリ内で破損したデータパートが検出されると、それは `broken` サブディレクトリに移動され、以降は使用されません。



## データの読み取り {#distributed-reading-data}

`Distributed`テーブルに対してクエリを実行する場合、`SELECT`クエリはすべてのシャードに送信され、データがシャード間でどのように分散されているか（完全にランダムに分散されている場合でも）に関係なく動作します。新しいシャードを追加する際、古いデータをそのシャードに転送する必要はありません。代わりに、より大きな重みを使用して新しいデータを書き込むことができます。データの分散はわずかに不均等になりますが、クエリは正確かつ効率的に動作します。

`max_parallel_replicas`オプションが有効な場合、単一のシャード内のすべてのレプリカにわたってクエリ処理が並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas)のセクションを参照してください。

分散`in`および`global in`クエリの処理方法の詳細については、[こちら](/sql-reference/operators/in#distributed-subqueries)のドキュメントを参照してください。


## 仮想カラム {#virtual-columns}

#### \_Shard_num {#\_shard_num}

`_shard_num` — `system.clusters`テーブルの`shard_num`値を含みます。型: [UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[`remote`](../../../sql-reference/table-functions/remote.md)および[`cluster`](../../../sql-reference/table-functions/cluster.md)テーブル関数は内部的に一時的なDistributedテーブルを作成するため、`_shard_num`もそこで利用可能です。
:::

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)の説明
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size)設定
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardNum)および[`shardCount()`](../../../sql-reference/functions/other-functions.md#shardCount)関数
