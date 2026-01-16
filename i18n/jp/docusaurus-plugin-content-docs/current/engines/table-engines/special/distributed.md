---
description: 'Distributed エンジンを持つテーブルは自身では一切データを保存せず、複数サーバー上での分散クエリ処理を可能にします。読み取り処理は自動的に並列化されます。読み取り時には、存在する場合はリモートサーバー上のテーブルインデックスが利用されます。'
sidebar_label: 'Distributed'
sidebar_position: 10
slug: /engines/table-engines/special/distributed
title: 'Distributed テーブルエンジン'
doc_type: 'reference'
---

# Distributed テーブルエンジン \{#distributed-table-engine\}

:::warning ClickHouse Cloud における Distributed エンジン
ClickHouse Cloud で Distributed テーブルエンジンを作成するには、[`remote` および `remoteSecure`](../../../sql-reference/table-functions/remote) テーブル関数を使用します。 
`Distributed(...)` 構文は ClickHouse Cloud では使用できません。
:::

Distributed エンジンを持つテーブル自体はデータを一切保存しませんが、複数のサーバーでの分散クエリ処理を可能にします。 
読み取り処理は自動的に並列化されます。読み取り時には、リモートサーバー上にテーブルインデックスが存在する場合、それらが利用されます。

## テーブルの作成 \{#distributed-creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### テーブルから \{#distributed-from-a-table\}

`Distributed` テーブルが現在のサーバー上のテーブルを参照している場合、そのテーブルのスキーマを利用できます。

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### Distributed パラメータ \{#distributed-parameters\}

| Parameter                 | Description                                                                                                                                                                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster`                 | サーバーの設定ファイル内のクラスター名                                                                                                                                                                                                                                                                                                                |
| `database`                | リモートデータベース名                                                                                                                                                                                                                                                                                                                        |
| `table`                   | リモートテーブル名                                                                                                                                                                                                                                                                                                                          |
| `sharding_key` (Optional) | シャーディングキー。<br /> `sharding_key` の指定が必要となるケースは次のとおりです。<ul><li>Distributed テーブルへの `INSERT` の場合（テーブルエンジンがデータの分割方法を決定するために `sharding_key` を必要とするため）。ただし、`insert_distributed_one_random_shard` 設定が有効な場合は、`INSERT` にシャーディングキーは不要です。</li><li>`optimize_skip_unused_shards` を利用する場合（どのシャードをクエリするかを決定するために `sharding_key` が必要です）。</li></ul> |
| `policy_name` (Optional)  | ポリシー名。バックグラウンド送信処理で使用する一時ファイルを保存するために使用されます                                                                                                                                                                                                                                                                                        |

**関連項目**

* [distributed&#95;foreground&#95;insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
* 例については [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) を参照

### Distributed 設定 \{#distributed-settings\}

| Setting                                    | Description                                                                                                                                                    | Default value |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `fsync_after_insert`                       | Distributed へのバックグラウンド挿入後にファイルデータに対して `fsync` を実行します。OS が **イニシエーターノード** のディスク上の挿入済みデータ全体をファイルにフラッシュしたことを保証します。                                                | `false`       |
| `fsync_directories`                        | ディレクトリに対して `fsync` を実行します。Distributed テーブルでのバックグラウンド挿入に関連する操作（挿入後、シャードへのデータ送信後など）の後で、OS がディレクトリメタデータを更新したことを保証します。                                             | `false`       |
| `skip_unavailable_shards`                  | true の場合、ClickHouse は利用不能なシャードを黙って自動的にスキップします。シャードは次の場合に利用不能とマークされます: 1) 接続障害によりシャードに到達できない場合。2) シャードが DNS で解決できない場合。3) テーブルがそのシャード上に存在しない場合。                  | `false`       |
| `bytes_to_throw_insert`                    | バックグラウンド `INSERT` のために保留中の圧縮データ量（バイト数）がこの値を超えた場合、例外がスローされます。`0` の場合はスローしません。                                                                                   | `0`           |
| `bytes_to_delay_insert`                    | バックグラウンド `INSERT` のために保留中の圧縮データ量（バイト数）がこの値を超えた場合、クエリは遅延されます。`0` の場合は遅延しません。                                                                                    | `0`           |
| `max_delay_to_insert`                      | バックグラウンド送信のために保留中のバイト数が多い場合に、Distributed テーブルへのデータ挿入を遅延させる最大秒数。                                                                                                | `60`          |
| `background_insert_batch`                  | [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch) と同じです。                                   | `0`           |
| `background_insert_split_batch_on_failure` | [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同じです。 | `0`           |
| `background_insert_sleep_time_ms`          | [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同じです。                   | `0`           |
| `background_insert_max_sleep_time_ms`      | [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同じです。           | `0`           |
| `flush_on_detach`                          | `DETACH`/`DROP`/サーバーシャットダウン時に、リモートノードへデータをフラッシュします。                                                                                                            | `true`        |

:::note
**耐久性設定** (`fsync_...`):

* データがまずイニシエーターノードのディスクに保存され、その後バックグラウンドでシャードへ送信される、バックグラウンド `INSERT`（つまり `distributed_foreground_insert=false`）にのみ影響します。
* `INSERT` のパフォーマンスを大きく低下させる可能性があります。
* 分散テーブルフォルダ内に保存されているデータを、**挿入を受け付けたノード** に書き込む処理に影響します。基盤となる MergeTree テーブルへの書き込み保証が必要な場合は、`system.merge_tree_settings` 内の耐久性設定（`...fsync...`）を参照してください。

**挿入制限設定**（`..._insert`）については、次も参照してください:

* [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
* [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 設定
* `bytes_to_throw_insert` は `bytes_to_delay_insert` より前に処理されるため、`bytes_to_delay_insert` より小さい値に設定すべきではありません。
  :::

**例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

`logs` クラスター内のすべてのサーバーに存在する `default.hits` テーブルからデータが読み出されます。データは読み出されるだけでなく、可能な範囲でリモートサーバー側で部分的に処理されます。例えば、`GROUP BY` を含むクエリの場合、データはリモートサーバー上で集約され、集約関数の中間状態がリクエスト元のサーバーに送信されます。その後、そのサーバーでデータがさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用できます。例えば、`currentDatabase()` です。

## クラスター \{#distributed-clusters\}

クラスターは[サーバー設定ファイル](../../../operations/configuration-files.md)で構成されます。

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

ここでは、`logs` という名前のクラスタが定義されており、2 つのシャード（各シャードには 2 つのレプリカを含む）で構成されています。シャードとは、データの異なる部分を保持しているサーバーのことであり（すべてのデータを読み取るには、すべてのシャードにアクセスする必要があります）、レプリカはサーバーの複製です（すべてのデータを読み取るには、いずれか 1 つのレプリカ上のデータにアクセスすれば十分です）。

クラスタ名にはドットを含めてはいけません。

各サーバーには、`host`、`port`、および必要に応じて `user`、`password`、`secure`、`compression`、`bind_host` のパラメータを指定します。

| Parameter     | Description                                                                                                                                                                                                                                                                                                                              | Default Value |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `host`        | リモートサーバーのアドレス。ドメイン名、IPv4 アドレス、または IPv6 アドレスを使用できます。ドメイン名を指定した場合、サーバー起動時に DNS リクエストが実行され、その結果はサーバーが稼働している間保持されます。DNS リクエストが失敗すると、サーバーは起動しません。DNS レコードを変更した場合は、サーバーを再起動してください。 | -            |
| `port`        | メッセージ送受信用に使用される TCP ポート（設定ファイル内の `tcp_port`、通常は 9000 に設定）。`http_port` と混同しないでください。                                                                                                                                                                                                            | -            |
| `user`        | リモートサーバーへ接続するためのユーザー名。このユーザーは指定したサーバーへの接続権限を持っている必要があります。アクセス権限は `users.xml` ファイルで設定します。詳細は [Access rights](../../../guides/sre/user-management/index.md) セクションを参照してください。                                                                    | `default`    |
| `password`    | リモートサーバーへ接続するためのパスワード（マスクされません）。                                                                                                                                                                                                                                                                           | ''           |
| `secure`      | セキュアな SSL/TLS 接続を使用するかどうか。通常、ポートの指定も必要です（デフォルトのセキュアポートは `9440`）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` でリッスンし、正しい証明書が設定されている必要があります。                                                                                                      | `false`      |
| `compression` | データ圧縮を使用するかどうか。                                                                                                                                                                                                                                                                                                            | `true`       |
| `bind_host`   | このノードからリモートサーバーへ接続する際に使用する送信元アドレス。IPv4 アドレスのみサポートされます。ClickHouse の分散クエリで使用される送信元 IP アドレスを指定する必要がある、高度なデプロイメントのユースケース向けです。                                                                                                               | -            |

レプリカを指定すると、読み取り時に各シャードに対して利用可能なレプリカのうち 1 つが選択されます。ロードバランシングアルゴリズム（どのレプリカへアクセスするかの優先度）は、[load_balancing](../../../operations/settings/settings.md#load_balancing) 設定で構成できます。サーバーとの接続が確立できない場合、短いタイムアウトで接続を試行します。接続に失敗した場合は次のレプリカが選択され、すべてのレプリカについて同様に繰り返されます。すべてのレプリカへの接続試行が失敗した場合、同じ方法で複数回リトライされます。これはレジリエンス向上には有効ですが、完全なフォールトトレランスを提供するものではありません。リモートサーバーが接続を受け付けても、正常に動作しない、または性能が不十分な場合があるためです。

シャードを 1 つだけ指定することもできます（この場合、クエリ処理は「分散」ではなく「リモート」と呼ぶべきです）し、任意の数のシャードを指定することもできます。各シャード内では、1 つから任意の数のレプリカを指定できます。シャードごとに異なる数のレプリカを指定することも可能です。

設定内には、必要な数だけクラスターを指定できます。

クラスターを確認するには、`system.clusters` テーブルを使用します。

`Distributed` エンジンを使用すると、クラスターをローカルサーバーのように扱うことができます。ただし、クラスターの設定は動的に指定することはできず、サーバーの設定ファイルで構成しておく必要があります。通常、クラスター内のすべてのサーバーは同一のクラスター設定を持ちます（必須ではありません）。設定ファイル内のクラスターは、サーバーを再起動することなくオンザフライで更新されます。

毎回未知のシャードやレプリカの集合に対してクエリを送信する必要がある場合、`Distributed` テーブルを作成する必要はありません。その代わりに `remote` テーブル関数を使用してください。詳細は [Table functions](../../../sql-reference/table-functions/index.md) セクションを参照してください。

## データの書き込み \{#distributed-writing-data\}

クラスターにデータを書き込む方法は 2 つあります。

1 つ目は、どのサーバーにどのデータを書き込むかを自分で定義し、各シャードに直接書き込む方法です。言い換えると、`Distributed` テーブルが参照しているクラスター内のリモートテーブルに対して、直接 `INSERT` 文を実行します。これは、任意のシャーディング方式を使用できるため、対象分野の要件により複雑な方式であっても対応できる、最も柔軟な方法です。また、この方式では異なるシャードに完全に独立してデータを書き込めるため、最も効率的でもあります。

2 つ目は、`Distributed` テーブルに対して `INSERT` 文を実行する方法です。この場合、テーブル自体が挿入されたデータをサーバー間に分散します。`Distributed` テーブルに書き込むには、`sharding_key` パラメータが設定されている必要があります（シャードが 1 つしかない場合を除く）。

各シャードには、設定ファイル内で `<weight>` を定義できます。デフォルトでは weight は `1` です。データは、シャードの weight に比例した量でシャード間に分散されます。すべてのシャードの weight が合計され、その後、各シャードの weight を合計値で割ることで、各シャードの比率が決まります。例えば、2 つのシャードがあり、1 つ目の weight が 1、2 つ目の weight が 2 の場合、1 つ目のシャードには挿入された行の 3 分の 1 (1 / 3)、2 つ目のシャードには 3 分の 2 (2 / 3) が送られます。

各シャードには、設定ファイル内で `internal_replication` パラメータを定義できます。このパラメータが `true` に設定されている場合、書き込み処理は最初の正常なレプリカを選択し、そのレプリカにデータを書き込みます。これは、`Distributed` テーブルの背後にあるテーブルがレプリケートされたテーブル（例: 任意の `Replicated*MergeTree` テーブルエンジン）である場合に使用します。テーブルレプリカのうち 1 つが書き込みを受け取り、その後自動的に他のレプリカへレプリケートされます。

`internal_replication` が `false`（デフォルト）に設定されている場合、データはすべてのレプリカに書き込まれます。この場合、`Distributed` テーブル自体がデータを複製します。これは、レプリケートされたテーブルを使用する場合よりも劣ります。というのも、レプリカ間の一貫性が検査されず、時間の経過とともに、レプリカごとにわずかに異なるデータを保持するようになるためです。

どのシャードに行データを送るかを選択するために、シャーディング式が評価され、その結果をシャードの総 weight で割った余りが取られます。行は、余りが `prev_weights` から `prev_weights + weight` までの半開区間に対応するシャードに送られます。ここで、`prev_weights` は番号がより小さいシャードの総 weight、`weight` はそのシャード自身の weight です。例えば、2 つのシャードがあり、1 つ目の weight が 9、2 つ目の weight が 10 の場合、余りが範囲 \[0, 9) に入る行は 1 つ目のシャードに、範囲 \[9, 19) に入る行は 2 つ目のシャードに送られます。

シャーディング式は、定数やテーブル列からなる任意の式であり、整数を返す必要があります。例えば、データをランダムに分散するには `rand()` を使用できますし、ユーザー ID を割った余りで分散するには `UserID` を使用できます（この場合、1 人のユーザーのデータは 1 つのシャードにのみ配置されるため、ユーザー単位の `IN` や `JOIN` を実行しやすくなります）。ある列が十分に均等に分散されない場合は、`intHash64(UserID)` のようにハッシュ関数でラップできます。

単純な除算の余りによる方法は、シャーディングの解決策としては限定的であり、常に適切というわけではありません。これは、中〜大規模（サーバーが数十台）のデータ量では機能しますが、非常に大規模（サーバーが数百台以上）のデータ量には向きません。後者の場合、`Distributed` テーブルを使用するのではなく、対象分野で求められるシャーディング方式を使用してください。

次のような場合には、シャーディング方式について検討する必要があります。

- 特定のキーでデータを結合する（`IN` または `JOIN`）クエリを使用している場合、そのキーでデータがシャーディングされていれば、`GLOBAL IN` や `GLOBAL JOIN` よりもはるかに効率的なローカルな `IN` または `JOIN` を使用できます。
- 多数のサーバー（数百台以上）を使用し、多数の小さなクエリ、たとえば個々のクライアント（ウェブサイト、広告主、パートナーなど）のデータに対するクエリを実行する場合。小さなクエリがクラスター全体に影響しないようにするには、1 クライアントのデータを 1 シャード上に配置するのが理にかなっています。あるいは、二段階のシャーディングを構成することもできます。クラスター全体を複数の「レイヤー」に分割し、レイヤーは複数のシャードから構成されるようにします。1 クライアントのデータは 1 つのレイヤー内に配置されますが、必要に応じてそのレイヤーにシャードを追加でき、データはそれらのシャード内でランダムに分散されます。各レイヤーに対して `Distributed` テーブルを作成し、グローバルなクエリ用に 1 つの共有の `Distributed` テーブルを作成します。

データはバックグラウンドで書き込まれます。テーブルに `INSERT` されたとき、データブロックはローカルファイルシステムに書き込まれるだけです。データは可能な限り早くバックグラウンドでリモートサーバーへ送信されます。データ送信の周期は、[distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) および [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) の設定で制御されます。`Distributed` エンジンは挿入されたデータを含むファイルを個別に送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 設定を有効にすることで、ファイルのバッチ送信を有効化できます。この設定により、ローカルサーバーおよびネットワークリソースをより有効に活用することで、クラスターのパフォーマンスが向上します。テーブルディレクトリ `/var/lib/clickhouse/data/database/table/` にあるファイル（送信待ちデータ）の一覧を確認することで、データが正常に送信されているか確認する必要があります。バックグラウンドタスクを実行するスレッド数は、[background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定で指定できます。

`Distributed` テーブルへの `INSERT` 実行後に、サーバーが消失した場合や（ハードウェア障害などにより）クラッシュして強制再起動された場合、挿入されたデータが失われる可能性があります。テーブルディレクトリ内で破損したデータパーツが検出されると、それは `broken` サブディレクトリに移動され、以後は使用されません。

## データの読み取り \{#distributed-reading-data\}

`Distributed` テーブルをクエリする場合、`SELECT` クエリはすべてのシャードに送信され、データがシャード間でどのように分散されているかに関係なく動作します（完全にランダムに分散されていても問題ありません）。新しいシャードを追加する場合、既存のデータをそのシャードへ移行する必要はありません。その代わり、新しいシャードに対してより大きな重み付けを指定して新しいデータを書き込むことができます。この場合、データの分散はやや不均一になりますが、クエリは正しくかつ効率的に動作します。

`max_parallel_replicas` オプションが有効な場合、クエリ処理は 1 つのシャード内のすべてのレプリカに対して並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) セクションを参照してください。

分散環境における `in` および `global in` クエリがどのように処理されるかの詳細については、[こちら](/sql-reference/operators/in#distributed-subqueries) のドキュメントを参照してください。

## 仮想カラム \{#virtual-columns\}

#### _Shard_num \{#_shard_num\}

`_shard_num` — テーブル `system.clusters` の `shard_num` の値を保持します。型: [UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[`remote`](../../../sql-reference/table-functions/remote.md) および [`cluster](../../../sql-reference/table-functions/cluster.md) テーブル関数は内部的に一時的な Distributed テーブルを作成するため、`_shard_num` はそれらでも利用可能です。
:::

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns) の説明
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardNum) および [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardCount) 関数
