---
sidebar_label: Kafka テーブルエンジン
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: Kafka テーブルエンジンの使用
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka テーブルエンジンの使用

<CloudNotSupportedBadge/>

:::note
Kafka テーブルエンジンは [ClickHouse Cloud](https://clickhouse.com/cloud) ではサポートされていません。 [ClickPipes](../clickpipes/kafka.md) または [Kafka Connect](./kafka-clickhouse-connect-sink.md) を検討してください。
:::

### Kafka から ClickHouse へ {#kafka-to-clickhouse}

Kafka テーブルエンジンを使用するには、[ClickHouse マテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)に対する一般的な理解が必要です。

#### 概要 {#overview}

最初に、最も一般的なユースケースに焦点を当てます：Kafka から ClickHouse にデータを挿入するために Kafka テーブルエンジンを使用します。

Kafka テーブルエンジンにより、ClickHouse は Kafka トピックから直接データを読み取ることができます。これはトピック上のメッセージを表示するのに便利ですが、エンジンの設計上、単回取得のみを許可します。つまり、テーブルに対してクエリが発行されると、キューからデータを消費し、結果を呼び出し元に返す前にコンシューマオフセットを増加させます。データはこれらのオフセットをリセットしない限り、再読み取りすることはできません。

このテーブルエンジンから読み取ったデータを永続化するには、データをキャプチャして別のテーブルに挿入する手段が必要です。トリガーベースのマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューはテーブルエンジンの読み取りを開始し、文書のバッチを受け取ります。TO 句はデータの宛先を決定します - 通常は [Merge Tree ファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下のように視覚化されます：

<img src={require('./images/kafka_01.png').default} class="image" alt="Kafka テーブルエンジン" style={{width: '80%'}}/>

#### ステップ {#steps}


##### 1. 準備 {#1-prepare}

ターゲットトピックにデータがある場合は、以下をあなたのデータセットで使用できるように適応できます。あるいは、サンプルの GitHub データセットが [こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) に提供されています。このデータセットは以下の例で使用されており、簡潔さのためにリデュースされたスキーマと行のサブセットを使用しています（特に、[ClickHouse リポジトリ](https://github.com/ClickHouse/ClickHouse) に関する GitHub イベントに制限しています）、完全なデータセットは [こちら](https://ghe.clickhouse.tech/) で入手できます。これは、データセットで公開されたほとんどのクエリが機能するのに十分です。


##### 2. ClickHouse の構成 {#2-configure-clickhouse}

このステップは、安全な Kafka に接続する場合に必要です。これらの設定は SQL DDL コマンドを介して渡すことはできず、ClickHouse の config.xml に構成する必要があります。SASL で保護されたインスタンスに接続していると仮定します。これは Confluent Cloud との対話における最も簡単な方法です。

```xml
<clickhouse>
   <kafka>
       <sasl_username>username</sasl_username>
       <sasl_password>password</sasl_password>
       <security_protocol>sasl_ssl</security_protocol>
       <sasl_mechanisms>PLAIN</sasl_mechanisms>
   </kafka>
</clickhouse>
```

上記のスニペットを conf.d/ ディレクトリ内の新しいファイルに配置するか、既存の設定ファイルに統合してください。設定可能な設定については、[こちら](../../../engines/table-engines/integrations/kafka.md#configuration) を参照してください。

また、このチュートリアルで使用するために `KafkaEngine` というデータベースを作成します：

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、それに切り替える必要があります：

```sql
USE KafkaEngine;
```

##### 3. 宛先テーブルの作成 {#3-create-the-destination-table}

宛先テーブルを準備します。以下の例では簡潔さのためにリデュースされた GitHub スキーマを使用します。MergeTree テーブルエンジンを使用していますが、この例は [MergeTree ファミリー](../../../engines/table-engines/mergetree-family/index.md)の任意のメンバーに適応することができます。

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
) ENGINE = MergeTree ORDER BY (event_type, repo_name, created_at)
```

##### 4. トピックの作成とデータの投入 {#4-create-and-populate-the-topic}

次に、トピックを作成します。これをするためにいくつかのツールを使用できます。ローカルマシンまたは Docker コンテナ内で Kafka を実行している場合は、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/)がうまく機能します。次のコマンドを実行して、5 つのパーティションを持つ `github` というトピックを作成します：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent Cloud で Kafka を実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)を使用することをお勧めします：

```bash
confluent kafka topic create --if-not-exists github
```

次に、いくつかのデータでこのトピックをポピュレートする必要があります。これを [kcat](https://github.com/edenhill/kcat) を使用して行います。認証を無効にしてローカルで Kafka を実行している場合は、次のようなコマンドを実行します：

```bash
cat github_all_columns.ndjson | 
kcat -P \
  -b <host>:<port> \
  -t github
```

認証のために SASL を使用する Kafka クラスターの場合、以下のコマンドを使用します：

```bash
cat github_all_columns.ndjson | 
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username>  \
  -X sasl.password=<password> \
```

データセットには 200,000 行が含まれているため、数秒で取り込まれるはずです。より大きなデータセットで作業をする場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub リポジトリの [large datasets section](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) をご覧ください。

##### 5. Kafka テーブルエンジンの作成 {#5-create-the-kafka-table-engine}

以下の例は、Merge Tree テーブルと同じスキーマを持つテーブルエンジンを作成します。これは厳密には必要ではありませんが、ターゲットテーブルにエイリアスや一時的なカラムを持つことができます。ただし、設定は重要です。Kafka トピックから JSON を消費するためのデータ型として `JSONEachRow` を使用していることに注意してください。値 `github` と `clickhouse` は、それぞれトピック名とコンシューマグループ名を表します。トピックは実際には値のリストにすることができます。

```sql
CREATE TABLE github_queue
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('kafka_host:9092', 'github', 'clickhouse',
            'JSONEachRow') settings kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

エンジン設定とパフォーマンス調整については、以下で説明します。この時点で、テーブル `github_queue` に対して簡単なセレクトを実行すると、いくつかの行が読み取れるはずです。この操作によりコンシューマオフセットが前方に移動し、リセットしない限りこれらの行を再読み取りすることはできません。`stream_like_engine_allow_direct_select` という制限と必要なパラメータに注意してください。

##### 6. マテリアライズドビューの作成 {#6-create-the-materialized-view}

マテリアライズドビューは、これまでに作成した二つのテーブルを接続し、Kafka テーブルエンジンからデータを読み取り、ターゲットのマージツリーテーブルに挿入します。データ変換を行うことができます。単純な読み取りと挿入を行います。* を使用すると、列名が同じであることを前提とします（大文字と小文字を区別します）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

作成時に、マテリアライズドビューは Kafka エンジンに接続し、行をターゲットテーブルに挿入し始めます。このプロセスは無限に続行され、Kafka に挿入されるメッセージが消費されます。さらにメッセージを Kafka に挿入するには、挿入スクリプトを再実行してください。

##### 7. 行が挿入されたことを確認する {#7-confirm-rows-have-been-inserted}

ターゲットテーブルにデータが存在することを確認します：

```sql
SELECT count() FROM github;
```

200,000 行を見ることができるはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 一般的な操作 {#common-operations}

##### メッセージ消費の停止と再開 {#stopping--restarting-message-consumption}

メッセージ消費を停止するには、Kafka エンジンテーブルをデタッチできます：

```sql
DETACH TABLE github_queue;
```

これにより、コンシューマグループのオフセットには影響しません。消費を再開し、前のオフセットから続行するには、テーブルを再アタッチしてください。

```sql
ATTACH TABLE github_queue;
```

##### Kafka メタデータの追加 {#adding-kafka-metadata}

ClickHouse に読み込まれた後、元の Kafka メッセージからメタデータを追跡するのは便利です。たとえば、特定のトピックやパーティションからどれだけ消費したかを知りたい場合があります。この目的のために、Kafka テーブルエンジンは複数の [仮想列](../../../engines/table-engines/index.md#table_engines-virtual_columns) を公開します。これらはシステムを変更することでターゲットテーブルのカラムとして永続化できます。

まず、ターゲットテーブルにカラムを追加する前に、上記の停止操作を実行します。

```sql
DETACH TABLE github_queue;
```

以下に、行が元に戻った元のトピックとパーティション情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想列が必要に応じてマッピングされていることを確認する必要があります。仮想列は `_` でプレフィックスされます。仮想列の完全なリストは [こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns) で見つけることができます。

仮想列でテーブルを更新するには、マテリアライズドビューを削除し、Kafka エンジンテーブルを再アタッチし、マテリアライズドビューを再作成する必要があります。

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic as topic, _partition as partition
FROM github_queue;
```

新たに消費された行にはメタデータが含まれているはずです。

```sql
SELECT actor_login, event_type, created_at, topic, partition 
FROM github 
LIMIT 10;
```

結果は次のようになります：

| actor_login | event_type | created_at | topic | partition |
| :--- | :--- | :--- | :--- | :--- |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0 |
| queeup | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0 |
| IgorMinar | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0 |
| dapi | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0 |
| sourcerebels | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0 |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0 |
| jpn | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0 |
| Oxonium | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0 |


##### Kafka エンジン設定の変更 {#modify-kafka-engine-settings}

Kafka エンジンテーブルを削除し、新しい設定で再作成することをお勧めします。このプロセスの間、マテリアライズドビューは変更する必要ありません - Kafka エンジンテーブルが再作成された後、メッセージ消費は再開されます。

##### 問題のデバッグ {#debugging-issues}

認証の問題などのエラーは、Kafka エンジンの DDL に対する応答で報告されません。問題を診断するために、主な ClickHouse ログファイル clickhouse-server.err.log を使用することをお勧めします。基盤となる Kafka クライアントライブラリ [librdkafka](https://github.com/edenhill/librdkafka) のさらなるトレースロギングを構成することで有効化できます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの処理 {#handling-malformed-messages}

Kafka はデータの「捨て場」としてよく使用されます。これにより、さまざまなメッセージ形式や不一致のフィールド名を含むトピックが生じます。これを避け、Kafka Streams や ksqlDB といった Kafka の機能を利用し、メッセージが正しく形式化され、一貫性があることを確認してください。これらのオプションが不可能な場合、ClickHouse には問題を解決できる機能があります。

* メッセージフィールドを文字列として扱います。必要に応じて、マテリアライズドビューのステートメントでクレンジングやキャスティングを実行するための関数を使用できます。これは本番ソリューションを表すものではありませんが、一時的な取り込みには役立つかもしれません。
* トピックから JSON を消費する場合は、JSONEachRow 形式を使用し、設定 [`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md#settings-input-format-skip-unknown-fields) を利用します。デフォルトでは、ClickHouse は、入力データに存在しないカラムが含まれている場合、例外をスローします。しかし、このオプションが有効になっている場合、これらの過剰なカラムは無視されます。これも本番レベルのソリューションではなく、他の人を混乱させるかもしれません。
* 設定 `kafka_skip_broken_messages` を考慮してください。これは、ユーザーが不正なメッセージに対する許容レベルをブロックごとに指定することを要求します - kafka_max_block_size の文脈で考慮されます。この許容範囲が超えられると（絶対的なメッセージで測定）、通常の例外動作に戻り、他のメッセージがスキップされます。

##### 配信のセマンティクスと重複の課題 {#delivery-semantics-and-challenges-with-duplicates}

Kafka テーブルエンジンは少なくとも1回のセマンティックを持ちます。重複は、いくつかのまれな状況で発生します。たとえば、メッセージが Kafka から読み取られ、ClickHouse に正常に挿入された場合、新しいオフセットをコミットする前に Kafka との接続が失われることがあります。この場合、ブロックの再試行が必要です。このブロックは、ターゲットテーブルとして分散テーブルまたは ReplicatedMergeTree を使用して [重複を削除](../../../engines/table-engines/mergetree-family/replication.md#table_engines-replication)できます。この方法で重複行の可能性を減らすことができますが、同一のブロックに依存します。Kafka のリバランスなどのイベントがこの仮定を無効にし、まれな状況で重複を引き起こす可能性があります。

##### クオーラムベースの挿入 {#quorum-based-inserts}

ClickHouse でより高い配信保証が必要なケースでは、[クオーラムベースの挿入](../../../operations/settings/settings.md#settings-insert_quorum)が必要になる場合があります。これはマテリアライズドビューまたはターゲットテーブルで設定できませんが、ユーザープロファイルの設定が可能です。

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse から Kafka へ {#clickhouse-to-kafka}

あまり一般的ではないユースケースですが、ClickHouse データも Kafka に永続化することができます。たとえば、手動で Kafka テーブルエンジンに行を挿入します。このデータは同じ Kafka エンジンによって読み取られ、そのマテリアライズドビューがデータを Merge Tree テーブルに置きます。最後に、既存のソーステーブルからデータを読み取るために Kafka に挿入する際のマテリアライズドビューを適用する方法を示します。

#### ステップ {#steps-1}

最初の目的は次のように最もよく示されます：

<img src={require('./images/kafka_02.png').default} class="image" alt="Kafka テーブルエンジンを使用して挿入する" style={{width: '80%'}}/>

Kafka から ClickHouse のステップで作成されたテーブルとビューが存在し、トピックが完全に消費されていると仮定します。

##### 1. 行の直接挿入 {#1-inserting-rows-directly}

まず、ターゲットテーブルのカウントを確認します。

```sql
SELECT count() FROM github;
```

200,000 行があるはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHub ターゲットテーブルから Kafka テーブルエンジン github_queue に行を挿入します。JSONEachRow 形式を利用し、SELECT を 100 に制限しています。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHub での行を再度カウントすると、100 行が増えていることを確認できます。上記の図で示されているように、行は Kafka テーブルエンジンを介して Kafka に挿入された後、同じエンジンによって読み取られ、マテリアライズドビューによって GitHub ターゲットテーブルに挿入されます！

```sql
SELECT count() FROM github;
```

100 行追加されているはずです：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューの使用 {#2-using-materialized-views}

マテリアライズドビューを使用して、ドキュメントがテーブルに挿入されるときにメッセージを Kafka エンジン（およびトピック）にプッシュすることができます。GitHub テーブルに行が挿入されると、マテリアライズドビューがトリガーされ、その結果、行が Kafka エンジンに戻され、新しいトピックに挿入されます。再度、これは最もよく示されます：

<img src={require('./images/kafka_03.png').default} class="image" alt="マテリアライズドビュー付きの Kafka テーブルエンジンへの挿入" style={{width: '80%'}}/>


新しい Kafka トピック `github_out` を作成します。このトピックを指す Kafka テーブルエンジン `github_out_queue` を確認してください。

```sql
CREATE TABLE github_out_queue
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    actor_login LowCardinality(String),
    repo_name LowCardinality(String),
    created_at DateTime,
    updated_at DateTime,
    action Enum('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    comment_id UInt64,
    path String,
    ref LowCardinality(String),
    ref_type Enum('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    creator_user_login LowCardinality(String),
    number UInt32,
    title String,
    labels Array(LowCardinality(String)),
    state Enum('none' = 0, 'open' = 1, 'closed' = 2),
    assignee LowCardinality(String),
    assignees Array(LowCardinality(String)),
    closed_at DateTime,
    merged_at DateTime,
    merge_commit_sha String,
    requested_reviewers Array(LowCardinality(String)),
    merged_by LowCardinality(String),
    review_comments UInt32,
    member_login LowCardinality(String)
)
   ENGINE = Kafka('host:port', 'github_out', 'clickhouse_out',
            'JSONEachRow') settings kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

次に、GitHub テーブルを指してマテリアライズドビュー `github_out_mv` を作成し、トリガーが発生したときに上記のエンジンに行を挿入します。これにより、GitHub テーブルへの追加は新しい Kafka トピックにプッシュされます。

```sql
CREATE MATERIALIZED VIEW github_out_mv TO github_out_queue AS
SELECT file_time, event_type, actor_login, repo_name, 
       created_at, updated_at, action, comment_id, path, 
       ref, ref_type, creator_user_login, number, title, 
       labels, state, assignee, assignees, closed_at, merged_at,
       merge_commit_sha, requested_reviewers, merged_by, 
       review_comments, member_login 
FROM github 
FORMAT JsonEachRow;
```

元の github トピックに挿入すれば、[Kafka から ClickHouse](#kafka-to-clickhouse) の一部として作成されたドキュメントが「github_clickhouse」トピックに現れるでしょう。これをネイティブの Kafka ツールで確認してください。たとえば、以下では、Confluent Cloud ホストのトピックに [kcat](https://github.com/edenhill/kcat) を使用して100行を github トピックに挿入しています：

```sql
head -n 10 github_all_columns.ndjson | 
kcat -P \
  -b <host>:<port> \
  -t github
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password> 
```

`github_out` トピックの読み取りは、メッセージの配信を確認すべきです。

```sql
kcat -C \
  -b <host>:<port> \
  -t github_out \
  -X security.protocol=sasl_ssl \
  -X sasl.mechanisms=PLAIN \
  -X sasl.username=<username> \
  -X sasl.password=<password> \
  -e -q | 
wc -l
```

非常に詳しい例ですが、これは Kafka エンジンと連携して使用されるマテリアライズドビューの力を示しています。

### クラスターとパフォーマンス {#clusters-and-performance}

#### ClickHouse クラスターとの連携 {#working-with-clickhouse-clusters}

Kafka コンシューマグループを通じて、複数の ClickHouse インスタンスが同じトピックから読み取ることが可能です。各コンシューマはトピックパーティションに 1:1 のマッピングで割り当てられます。Kafka テーブルエンジンを使用して ClickHouse 消費をスケールする場合、クラスター内のコンシューマの総数はトピックのパーティション数を超えてはいけないことを考慮してください。したがって、トピックに対して適切にパーティショニングが構成されていることを確認してください。

複数の ClickHouse インスタンスは、Kafka テーブルエンジン作成時に指定された同じコンシューマグループ ID を使用してトピックを読むように構成できます。これにより、各インスタンスは 1 つ以上のパーティションから読み取り、ローカルターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複を処理するために ReplicatedMergeTree を使用するように構成することができます。このアプローチにより、Kafka の読み取りを ClickHouse クラスターでスケールすることができますが、十分な Kafka パーティションが必要です。

<img src={require('./images/kafka_04.png').default} class="image" alt="レプリケートされた Kafka テーブルエンジン" style={{width: '80%'}}/>

#### パフォーマンスの調整 {#tuning-performance}

Kafka エンジンのテーブルスループット性能を向上させるために、以下の点を考慮してください：

* パフォーマンスは、メッセージのサイズ、形式、ターゲットテーブルの種類によって異なります。単一のテーブルエンジンで 100k 行/秒は実現可能です。デフォルトでは、メッセージはブロックで読み取られ、kafka_max_block_size パラメータによって制御されます。デフォルトでは、これは [max_insert_block_size](../../../operations/settings/settings.md#setting-max_insert_block_size) に設定され、1,048,576 にデフォルト設定されています。メッセージが極端に大きくない限り、これを増加させるべきです。500k から 1M の間の値は一般的です。スループット性能に対する効果をテストして評価してください。
* テーブルエンジンのコンシューマ数は kafka_num_consumers を使用して増加させることができます。しかし、デフォルトでは、挿入は単一スレッドで直線化され、kafka_thread_per_consumer のデフォルト値は 1 に設定されています。これを 1 に設定することで、フラッシュが並行に実行されます。N 個のコンシューマを持つ Kafka エンジンテーブルを作成することは、各マテリアライズドビューと kafka_thread_per_consumer=0 を持つ N 個の Kafka エンジンを作成することと論理的に同等であることに注意してください。
* コンシューマの増加は無償の操作ではありません。各コンシューマは独自のバッファーとスレッドを維持し、サーバーへのオーバーヘッドを増加させます。コンシューマのオーバーヘッドに注意し、最初にクラスター全体で線形スケールし、可能であればそれを行ってください。
* Kafka メッセージのスループットが変動し、遅延が許容される場合、stream_flush_interval_ms を増加させてより大きなブロックをフラッシュすることを考慮してください。
* [background_message_broker_schedule_pool_size](../../../operations/settings/settings.md#background_message_broker_schedule_pool_size)は、バックグラウンドタスクを実行するスレッドの数を設定します。これらのスレッドは Kafka ストリーミングに使用されます。この設定は ClickHouse サーバーの起動時に適用され、ユーザーセッション内で変更できず、デフォルトは 16 に設定されています。ログにタイムアウトが表示される場合は、これを増加させることが適切かもしれません。
* Kafka との通信には librdkafka ライブラリが使用されており、これ自体がスレッドを作成します。そのため、大量の Kafka テーブルやコンシューマが存在すると、大量のコンテキストスイッチが発生する可能性があります。この負荷をクラスター全体に分散させ、ターゲットテーブルをレプリケートするか、または複数のトピックから読み取るためのテーブルエンジンを使用することを検討してください - 値のリストをサポートします。単一のテーブルから複数のマテリアライズドビューを読み取ることで、それぞれ特定のトピックからデータをフィルタリングできます。

設定変更はテストする必要があります。Kafka コンシューマのラグを監視することをお勧めします。

#### 追加設定 {#additional-settings}

上記の設定に加えて、以下も参考になるかもしれません：

* [Kafka_max_wait_ms](../../../operations/settings/settings.md#kafka-max-wait-ms) - 再試行前に Kafka からメッセージを読むための待機時間（ミリ秒）。ユーザープロファイルレベルで設定され、デフォルトは 5000 に設定されています。

基盤となる librdkafka からの [すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)も、ClickHouse 構成ファイルの _kafka_ 要素に配置できます - 設定名は XML 要素で、ピリオドをアンダースコアに置き換えたものにする必要があります。例：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらは専門的な設定であり、詳細を知るためには Kafka ドキュメントを参照することをお勧めします。
