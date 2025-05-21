---
description: '分散エンジンを使用するテーブルは自身のデータを保存せず、
  複数のサーバーでの分散クエリ処理を可能にします。読み取りは自動的に
  並列化されます。読み取り中、リモートサーバーにあるテーブルインデックスが
  使用されます。'
sidebar_label: '分散'
sidebar_position: 10
slug: /engines/table-engines/special/distributed
title: '分散テーブルエンジン'
---


# 分散テーブルエンジン

:::warning
クラウドで分散テーブルエンジンを作成するには、[remoteおよびremoteSecure](../../../sql-reference/table-functions/remote) テーブル関数を使用できます。`Distributed(...)`構文は ClickHouse Cloud では使用できません。
:::

分散エンジンを使用するテーブルは自身のデータを保存せず、複数のサーバーでの分散クエリ処理を可能にします。読み取りは自動的に並列化されます。読み取り中、リモートサーバーにあるテーブルインデックスが使用されます。

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

`Distributed` テーブルが現在のサーバー上のテーブルを指している場合、そのテーブルのスキーマを採用することができます：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分散パラメータ {#distributed-parameters}

#### cluster {#cluster}

`cluster` - サーバーの設定ファイルにおけるクラスタ名

#### database {#database}

`database` - リモートデータベースの名前

#### table {#table}

`table` - リモートテーブルの名前

#### sharding_key {#sharding_key}

`sharding_key` - （オプション）シャーディングキー

`sharding_key` の指定は以下の場合に必要です：

- 分散テーブルへの `INSERT` の場合（テーブルエンジンはデータを分割する方法を決定するために `sharding_key` を必要とします）。ただし、`insert_distributed_one_random_shard` 設定が有効になっている場合、`INSERT` にはシャーディングキーが必要ありません。
- `optimize_skip_unused_shards` で使用するため、`sharding_key` はどのシャードがクエリされるべきかを決定するために必要です。

#### policy_name {#policy_name}

`policy_name` - （オプション）ポリシー名、一時ファイルをバックグラウンド送信のために保存するために使用されます。

**参照**

 - [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
 - 例については [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) を参照してください

### 分散設定 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 分散テーブルへのバックグラウンド挿入後にファイルデータの `fsync` を実行します。OSが挿入されたデータ全体を**発信元ノード**のディスクにフラッシュしたことを保証します。

#### fsync_directories {#fsync_directories}

`fsync_directories` - ディレクトリの `fsync` を実行します。分散テーブルへのバックグラウンド挿入に関連する操作後にOSがディレクトリメタデータを更新したことを保証します（挿入後、シャードへのデータ送信後など）。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - trueの場合、ClickHouseは利用できないシャードを静かにスキップします。シャードは以下の理由で利用できないとマークされます。1）接続障害のためにシャードにアクセスできない場合。2）DNSを通じて解決できない場合。3）シャードにテーブルが存在しない場合。デフォルトは false です。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - この数値以上の圧縮バイトがバックグラウンド INSERT のために保留されている場合、例外がスローされます。0 - スローしない。デフォルトは 0 です。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - この数値以上の圧縮バイトがバックグラウンド INSERT のために保留されている場合、クエリが遅延します。0 - 遅延しない。デフォルトは 0 です。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - バックグラウンド送信のために保留されているバイトが多い場合、分散テーブルへのデータ挿入の最大遅延（秒）。デフォルトは 60 秒です。

#### background_insert_batch {#background_insert_batch}

`background_insert_batch` - [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) と同様です。

#### background_insert_split_batch_on_failure {#background_insert_split_batch_on_failure}

`background_insert_split_batch_on_failure` - [distributed_background_insert_split_batch_on_failure](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) と同様です。

#### background_insert_sleep_time_ms {#background_insert_sleep_time_ms}

`background_insert_sleep_time_ms` - [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と同様です。

#### background_insert_max_sleep_time_ms {#background_insert_max_sleep_time_ms}

`background_insert_max_sleep_time_ms` - [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) と同様です。

#### flush_on_detach {#flush_on_detach}

`flush_on_detach` - DETACH/DROP/server shutdown時にリモートノードへのデータをフラッシュします。デフォルトは true です。

:::note
**耐久性設定** (`fsync_...`):

- バックグラウンド INSERT のみ影響します（すなわち、`distributed_foreground_insert=false`）データが最初に発信元ノードのディスクに保存され、その後、バックステージでシャードに送信されます。
- 挿入性能を著しく低下させる可能性があります。
- 分散テーブルフォルダ内に保存されたデータの書き込みに影響します。基本的な MergeTree テーブルへのデータの書き込みの保証が必要な場合は、 `system.merge_tree_settings` の耐久性設定（`...fsync...`）を参照してください。

**挿入制限設定**（`..._insert`）についても参照してください：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 設定
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 設定
- `bytes_to_throw_insert` は `bytes_to_delay_insert` の前に処理されるため、`bytes_to_delay_insert` より小さい値には設定しないでください。
:::

**例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

データは `logs` クラスタ内の全サーバーから、各サーバーにある `default.hits` テーブルから読み取られます。データは単に読み取られるだけでなく、リモートサーバーで部分的に処理されます（可能な範囲で）。たとえば、`GROUP BY` を使ったクエリでは、データはリモートサーバーで集約され、集約関数の中間状態がリクエスターサーバーに送信されます。その後、データはさらに集約されます。

データベース名の代わりに、文字列を返す定数式を使用できます。例えば：`currentDatabase()`。

## クラスタ {#distributed-clusters}

クラスタは[サーバーの設定ファイル](../../../operations/configuration-files.md)で構成されます：

```xml
<remote_servers>
    <logs>
        <!-- 分散クエリのためのサーバー間クラスタごとのシークレット
             デフォルト：シークレットなし（認証は行われません）
             
             設定されている場合、分散クエリはシャードで検証されますので、少なくとも：
             - そのクラスタはシャードに存在する必要があります。
             - 同じシークレットを持っている必要があります。
             
             また（そして、より重要なことは）、initial_userが
             クエリの現在のユーザーとして使用されます。
        -->
        <!-- <secret></secret> -->
        
        <!-- オプション。分散DDLクエリ（ON CLUSTER句）がこのクラスタに対して許可されているか。 デフォルト：true（許可されている）。 -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->
        
        <shard>
            <!-- データを書き込むときのシャードの重み。デフォルト：1。 -->
            <weight>1</weight>
            <!-- オプション。シャード名。 空でなく、クラスタ内のシャード間で一意である必要があります。指定しない場合は空になります。 -->
            <name>shard_01</name>
            <!-- オプション。レプリカのうちの一つにのみデータを書き込むか。デフォルト：false（全レプリカにデータを書き込む）。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- オプション。負荷分散（load_balancing 設定を参照。）のためのレプリカの優先度。デフォルト：1（小さい値がより優先される）。 -->
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

ここでは、名前 `logs` のクラスタが定義されており、2つのシャードで構成され、それぞれのシャードには2つのレプリカが含まれています。シャードはデータの異なるパーツを含むサーバーを参照します（すべてのデータを読み取るには、すべてのシャードにアクセスする必要があります）。レプリカはサーバーを複製しています（すべてのデータを読み込むためには、任意のレプリカのデータにアクセスできます）。

クラスタ名にはドットを含めることはできません。

各サーバーには `host`、`port`、およびオプションで `user`、`password`、`secure`、`compression`、`bind_host` が指定されています：

- `host` - リモートサーバーのアドレス。ドメイン名またはIPv4/IPv6アドレスのいずれかを使用できます。ドメインを指定すると、サーバーは起動時にDNSリクエストを行い、その結果はサーバーが稼働している限り保存されます。DNSリクエストが失敗した場合、サーバーは起動しません。DNSレコードを変更した場合は、サーバーを再起動してください。
- `port` - メッセージング活動のためのTCPポート（設定内の `tcp_port`、通常は9000に設定）。`http_port` と混同しないでください。
- `user` - リモートサーバーに接続するためのユーザー名。デフォルト値は `default` ユーザーです。このユーザーは、指定されたサーバーに接続するためのアクセス権を持っている必要があります。アクセスは `users.xml` ファイルで構成されています。詳細については、[アクセス権](../../../guides/sre/user-management/index.md)のセクションを参照してください。
- `password` - リモートサーバーに接続するためのパスワード（マスクされていません）。デフォルト値：空文字列。
- `secure` - セキュアSSL/TLS接続を使用するかどうか。通常、ポートを指定する必要があります（セキュアポートのデフォルトは `9440`）。サーバーは `<tcp_port_secure>9440</tcp_port_secure>` でリッスンし、正しい証明書で構成されている必要があります。
- `compression` - データ圧縮を使用します。デフォルト値：`true`。
- `bind_host` - このノードからリモートサーバーに接続する際に使用するソースアドレス。IPv4アドレスのみがサポートされています。ClickHouseの分散クエリで使用されるソースIPアドレスを設定する必要がある高度なデプロイメントユースケース向けです。

レプリカを指定すると、読み込み時に各シャードの利用可能なレプリカのいずれかが選択されます。負荷分散のアルゴリズム（どのレプリカにアクセスするかの優先度）を設定することができます – [load_balancing](../../../operations/settings/settings.md#load_balancing) 設定を参照してください。サーバーとの接続が確立しなかった場合、短いタイムアウトで接続が試行されます。接続が失敗した場合、次のレプリカが選択され、すべてのレプリカが同様に繰り返されます。これは耐障害性を高めますが、完全な障害耐性を提供するものではありません：リモートサーバーが接続を受け入れることがあっても、機能しない場合や機能が悪い場合があります。

シャードのうちの1つだけを指定することもでき（この場合、クエリ処理は分散ではなくリモートと呼ばれるべきです）、任意の数のシャードを指定できます。各シャードには1つ以上のレプリカを指定できます。各シャードのレプリカ数を異なるものに設定できます。

構成ファイルで任意の数のクラスタを指定することができます。

クラスタを表示するには、`system.clusters` テーブルを使用してください。

`Distributed` エンジンはローカルサーバーのようにクラスタと連携できます。ただし、クラスタの構成は動的に指定できず、サーバー設定ファイルで構成する必要があります。通常、クラスタ内のすべてのサーバーは同じクラスタ設定を持ちます（ただし、これは必須ではありません）。設定ファイルからのクラスタはリアルタイムで更新され、サーバーを再起動する必要はありません。

未知のシャードとレプリカのセットに毎回クエリを送信する必要がある場合は、`Distributed` テーブルを作成する必要はありません – 代わりに `remote` テーブル関数を使用してください。詳細は [テーブル関数](../../../sql-reference/table-functions/index.md) のセクションを参照してください。

## データの書き込み {#distributed-writing-data}

クラスタにデータを書く方法は2つあります：

まず、どのサーバーにどのデータを書くかを定義し、各シャードに直接書き込みを実行できます。言い換えれば、`Distributed` テーブルが指しているクラスター内のリモートテーブルに直接 `INSERT` 文を実行します。これは最も柔軟なソリューションであり、要件に従って非自明なシャーディングスキームを使用できます。また、異なるシャードにデータが完全に独立して書き込まれるため、最適なソリューションでもあります。

第二に、`Distributed` テーブルに対して `INSERT` 文を実行できます。この場合、テーブル自体が挿入データをサーバーに分配します。`Distributed` テーブルに書き込むには、`sharding_key` パラメータが構成されている必要があります（ただし、シャードが1つだけの場合を除く）。

各シャードには設定ファイルで `<weight>` を指定できます。デフォルトでは、重みは `1` です。データはシャードの重みに比例してシャーディングされます。すべてのシャードの重みが合計され、それぞれのシャードの重みが合計で割られて各シャードの比率が決まります。たとえば、2つのシャードがあり、最初のシャードの重みが1で、2番目のシャードの重みが2の場合、最初は挿入された行の3分の1（1 / 3）を受け取り、2番目は3分の2（2 / 3）を受け取ります。

各シャードは、設定ファイル内で `internal_replication` パラメータを定義できます。このパラメータが `true` に設定されている場合、書き込み操作は最初の健康なレプリカを選択し、そこにデータを書き込みます。これは、`Distributed` テーブルの基となるテーブルがレプリケートテーブルである場合（例えば、`Replicated*MergeTree` テーブルエンジンのいずれかの場合）に使用します。テーブルのレプリカのいずれかが書き込みを受け取り、自動的に他のレプリカにレプリケーションされます。

`internal_replication` が `false`（デフォルト）の場合、データはすべてのレプリカに書き込まれます。この場合、`Distributed` テーブルは自分でデータをレプリケートします。これはレプリケートテーブルを使用するより悪いです。なぜなら、レプリカの一貫性が確認されず、時間の経過とともにわずかに異なるデータが含まれるためです。

データの行が送信されるシャードを選択するために、シャーディング式が分析され、その剰余をシャードの合計重みで割ったものが取得されます。行は、`prev_weights` から `prev_weights + weight` の半区間に対応するシャードに送信されます。このとき、`prev_weights` は、最小番号のシャードの合計重みで、`weight` は現在のシャードの重みです。たとえば、2つのシャードがあり、最初のシャードの重みが9で、2番目のシャードの重みが10の場合、行は剰余が範囲 \[0, 9) の場合に最初のシャードに送信され、範囲 \[9, 19) の場合に2番目のシャードに送信されます。

シャーディング式は、定数とテーブルカラムからなる整数を返す任意の式を使用できます。たとえば、データをランダムに分配するために `rand()` を使用したり、ユーザーのIDで割った余りに基づいて分配するために `UserID` を使用することができます（この場合、単一のユーザーのデータは単一のシャードに存在し、`IN` や `JOIN` の実行が簡単になります）。いずれかのカラムが均等に分散されていない場合は、それをハッシュ関数でラップできます（例： `intHash64(UserID)`）。

単純な割り算による剰余はシャーディングに対する制限された解決策であり、常に適切とは限りません。中程度から大規模のデータボリューム（数十のサーバー）には適切ですが、非常に大規模なデータボリューム（数百のサーバー以上）には適切ではありません。後者の場合、`Distributed` テーブル内のエントリを使用するのではなく、トピックに応じて必要なシャーディングスキームを使用する必要があります。

シャーディングスキームについて懸念を持つべきケースは以下の通りです：

- 特定のキーでデータを結合する必要があるクエリが使用されている場合（`IN` または `JOIN`）。データがこのキーでシャーディングされている場合、ローカル `IN` または `JOIN` を使用でき、`GLOBAL IN` または `GLOBAL JOIN` よりもはるかに効率的です。
- 大量のサーバーが使用されている場合（数百以上）やクライアントの個別データに対して小規模なクエリが多数発生する場合（例：ウェブサイト、広告主、またはパートナー）。小規模なクエリがクラスタ全体に影響しないように単一のクライアントのデータを単一のシャードに配置することが必要になります。あるいは、二層シャーディングを設定することもできます：クラスタ全体を「レイヤー」に分割し、レイヤーは複数のシャードで構成されます。単一クライアントのデータは単一のレイヤーに配置されますが、必要に応じてレイヤーにシャードを追加し、内部でデータをランダムに分散させることができます。各レイヤーに対して `Distributed` テーブルが作成され、全体クエリ用に単一の共有分散テーブルが作成されます。

データはバックグラウンドで書き込まれます。テーブルに挿入されると、データブロックは単にローカルファイルシステムに書き込まれます。データはできるだけ早くバックグラウンドでリモートサーバーに送信されます。データ送信の周期性は、[distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) と [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 設定によって管理されます。`Distributed` エンジンは、挿入されたデータ付きのファイルをそれぞれ別々に送信しますが、[distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 設定により、ファイルのバッチ送信を有効にできます。この設定は、ローカルサーバーとネットワークリソースをより良く活用し、クラスタ性能を向上させます。データが正常に送信されているかどうかは、テーブルディレクトリ `/var/lib/clickhouse/data/database/table/` の送信待ちファイルのリストを確認することで確認できます。バックグラウンドタスクを実行するスレッド数は、[background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定で設定できます。

サーバーが存在しなくなったり、ハードウェア障害による粗い再起動を行った場合（たとえば、`INSERT` 後に）、挿入されたデータが失われる可能性があります。テーブルディレクトリ内で損傷したデータ部分が検出された場合、それは `broken` サブディレクトリに移動され、もはや使用されなくなります。

## データの読み取り {#distributed-reading-data}

`Distributed` テーブルに対してクエリを実行すると、`SELECT` クエリはすべてのシャードに送信され、データがシャード間にどのように分散されていても（完全にランダムに分散している場合でも）機能します。新しいシャードを追加するときは、古いデータをそこに転送する必要はありません。代わりに、重みを大きくすることで新しいデータを書き込むことができます – データはわずかに不均等に分散されますが、クエリは正しく効率的に機能します。

`max_parallel_replicas` オプションが有効になっている場合、クエリ処理は単一のシャード内のすべてのレプリカに並列化されます。詳細については、[max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) のセクションを参照してください。

分散 `in` および `global in` クエリがどのように処理されるかについては、[こちら](/sql-reference/operators/in#distributed-subqueries)のドキュメントを参照してください。

## 仮想カラム {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — `system.clusters` テーブルからの `shard_num` の値を含みます。タイプ：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
[remote](../../../sql-reference/table-functions/remote.md) および [cluster](../../../sql-reference/table-functions/cluster.md) テーブル関数は内部で一時的な Distributed テーブルを作成するため、`_shard_num` はそこでも利用可能です。
:::

**参照**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)の説明
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 設定
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) および [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 関数

