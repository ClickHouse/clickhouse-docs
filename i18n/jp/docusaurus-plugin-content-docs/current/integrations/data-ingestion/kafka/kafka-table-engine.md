---
sidebar_label: Kafkaテーブルエンジン
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: Kafkaテーブルエンジンの使用
---
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Kafkaテーブルエンジンの使用

<CloudNotSupportedBadge/>

:::note
Kafkaテーブルエンジンは[ClickHouse Cloud](https://clickhouse.com/cloud)ではサポートされていません。代替として[ClickPipes](../clickpipes/kafka.md)や[Kafka Connect](./kafka-clickhouse-connect-sink.md)をご検討ください。
:::

### KafkaからClickHouse {#kafka-to-clickhouse}

Kafkaテーブルエンジンを使用するには、[ClickHouseのマテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)に広く精通している必要があります。

#### 概要 {#overview}

最初に、最も一般的なユースケース、つまりKafkaのデータをClickHouseに挿入するためにKafkaテーブルエンジンを使用することに焦点を当てます。

Kafkaテーブルエンジンは、ClickHouseがKafkaトピックから直接読み取ることを可能にします。トピック上のメッセージを表示するには便利ですが、このエンジンは設計上、一度きりの取得しか許可されておらず、つまり、テーブルにクエリが発行されると、キューからデータを消費し、消費者のオフセットを増加させてから、結果を呼び出し元に返します。実際には、これらのオフセットをリセットせずにデータを再読することはできません。

テーブルエンジンの読み取りからこのデータを永続化するには、データをキャプチャして別のテーブルに挿入する手段が必要です。トリガーベースのマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューは、テーブルエンジンでの読み取りを開始し、文書のバッチを受信します。TO句はデータの宛先を決定します - 通常は[Merge Treeファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下のように視覚化されています：

<img src={kafka_01} class="image" alt="Kafkaテーブルエンジン" style={{width: '80%'}} />

#### ステップ {#steps}


##### 1. 準備 {#1-prepare}

ターゲットトピックにデータが格納されている場合、以下の内容をデータセットで使用するように調整できます。あるいは、サンプルのGithubデータセットが[こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)に提供されています。このデータセットは、以下の例で使用され、スキーマが縮小され、行のサブセットが使用されています（特に、[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse)に関するGithubイベントに制限）。完全なデータセットは[こちら](https://ghe.clickhouse.tech/)で入手可能ですが、便宜上このデータセットを使用しています。このデータセットは、[データセット](https://ghe.clickhouse.tech/)に公開されているほとんどのクエリが動作するのに十分です。

##### 2. ClickHouseの設定 {#2-configure-clickhouse}

このステップは、セキュアなKafkaに接続する場合に必要です。これらの設定はSQL DDLコマンドを通じて渡すことはできず、ClickHouseのconfig.xmlに構成する必要があります。SASLで保護されたインスタンスに接続していると仮定します。これはConfluent Cloudと対話する際の最も簡単な方法です。

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

上記のスニペットをconf.d/ディレクトリの新しいファイル内に配置するか、既存の構成ファイルに統合してください。設定可能な設定については[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)を参照してください。

このチュートリアルで使用するために`KafkaEngine`というデータベースを作成します：

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、次にそのデータベースを使用する必要があります：

```sql
USE KafkaEngine;
```

##### 3. 宛先テーブルの作成 {#3-create-the-destination-table}

宛先テーブルを準備します。以下の例では、簡略化のために縮小したGitHubスキーマを使用しています。MergeTreeテーブルエンジンを使用していますが、この例は[MergeTreeファミリー](../../../engines/table-engines/mergetree-family/index.md)のいずれかのメンバーに簡単に適応できます。

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

##### 4. トピックの作成とデータのポピュレーション {#4-create-and-populate-the-topic}

次に、トピックを作成します。これを実行するためのツールはいくつかあります。ローカルでKafkaを実行している場合や、Dockerコンテナ内で実行している場合は、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/)が便利です。以下のコマンドを実行して、5つのパーティションを持つ`github`というトピックを作成できます。

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent CloudでKafkaを実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)を使用する方が好ましいかもしれません：

```bash
confluent kafka topic create --if-not-exists github
```

次に、このトピックにデータをポピュレートする必要があります。これには[kcat](https://github.com/edenhill/kcat)を使用します。ローカルで認証なしでKafkaを実行している場合は、以下のようなコマンドを実行できます：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

また、KafkaクラスターがSASLを使用して認証している場合は、以下のように実行できます：

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

データセットには200,000行のデータが含まれているため、わずか数秒で取り込まれるはずです。大規模なデータセットを扱いたい場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHubリポジトリの[大規模データセットセクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)を確認してください。

##### 5. Kafkaテーブルエンジンの作成 {#5-create-the-kafka-table-engine}

以下の例では、マージツリーテーブルと同じスキーマのテーブルエンジンを作成します。必ずしも必要ではありませんが、ターゲットテーブルにエイリアスまたは一時的なカラムを持つことができます。ただし、設定は重要です。KafkaトピックからJSONを消費するためのデータ型として`JSONEachRow`を使用している点に注意してください。`github`と`clickhouse`はトピック名と消費者グループ名を表します。トピックは実際には複数の値のリストにすることができます。

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

エンジンの設定やパフォーマンス調整については後で説明します。この時点で、テーブル`github_queue`に対するシンプルなSELECT文は行をいくつか読み取るべきです。これにより、消費者オフセットが進み、これらの行がリセットなしに再読されることを防ぎます。制限と必須パラメータ`stream_like_engine_allow_direct_select.`に注意してください。

##### 6. マテリアライズドビューの作成 {#6-create-the-materialized-view}

マテリアライズドビューは、前に作成した2つのテーブルを接続し、Kafkaテーブルエンジンからデータを読み込み、ターゲットのマージツリーテーブルに挿入します。いくつかのデータ変換を行うことができます。シンプルな読み取りと挿入を行います。全てのカラム名が同じであること（大文字と小文字が区別される）を想定しています。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

作成時点で、マテリアライズドビューはKafkaエンジンに接続し、読み取りを開始します：ターゲットテーブルに行を挿入します。このプロセスは無限に続き、Kafkaへのメッセージの追加が消費されます。进一步的に向けて、さらにメッセージをKafkaに挿入するために挿入スクリプトを再実行してください。

##### 7. 行が挿入されたことを確認する {#7-confirm-rows-have-been-inserted}

ターゲットテーブルにデータが存在することを確認します：

```sql
SELECT count() FROM github;
```

200,000行が表示されるはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 一般的な操作 {#common-operations}

##### メッセージ消費の停止と再開 {#stopping--restarting-message-consumption}

メッセージ消費を停止するには、Kafkaエンジンテーブルを切り離します：

```sql
DETACH TABLE github_queue;
```

これは消費者グループのオフセットには影響しません。消費を再開し、以前のオフセットから続行するには、テーブルを再アタッチします。

```sql
ATTACH TABLE github_queue;
```

##### Kafkaメタデータの追加 {#adding-kafka-metadata}

ClickHouseに取り込まれた後、元のKafkaメッセージからメタデータを追跡することは役立つ場合があります。たとえば、特定のトピックやパーティションのどれくらいを消費したかを知りたい場合があります。この目的のために、Kafkaテーブルエンジンは、いくつかの[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を公開します。これらは、スキーマやマテリアライズドビューのSELECT文を変更することで、ターゲットテーブル内のカラムとして持続することができます。

まず、カラムをターゲットテーブルに追加する前に、上記で説明した停止操作を実行します。

```sql
DETACH TABLE github_queue;
```

以下に、行の出所トピックを識別する情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想カラムが必要に応じてマッピングされていることを確認する必要があります。
仮想カラムは`_`で始まります。
仮想カラムの完全なリストは[こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)で見つけることができます。

仮想カラムでテーブルを更新するには、マテリアライズドビューを削除し、Kafkaエンジンテーブルを再接続し、マテリアライズドビューを再作成する必要があります。

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

新たに消費した行はメタデータを持っているはずです。

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

##### Kafkaエンジン設定の変更 {#modify-kafka-engine-settings}

Kafkaエンジンテーブルを削除し、新しい設定で再作成することをお勧めします。このプロセス中にマテリアライズドビューを変更する必要はありません - Kafkaエンジンテーブルが再作成されると、メッセージ消費は再開します。

##### 問題のデバッグ {#debugging-issues}

認証問題などのエラーは、KafkaエンジンDDLへの応答に報告されません。問題を診断するには、主要なClickHouseログファイルclickhouse-server.err.logを使用することをお勧めします。基盤のKafkaクライアントライブラリ[librdkafka](https://github.com/edenhill/librdkafka)の追加トレースログは、構成を通じて有効にできます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの処理 {#handling-malformed-messages}

Kafkaは「廃棄場」としてよく使用されます。これにより、トピックには混在したメッセージ形式や不一致のフィールド名が含まれる可能性があります。これを避けるために、Kafka StreamsやksqlDBなどのKafka機能を利用して、メッセージが適切に形成され、一貫していることを確認してからKafkaに挿入してください。これらのオプションが不可能な場合、ClickHouseには役立つ機能があります。

* メッセージフィールドを文字列として扱います。必要に応じて、マテリアライズドビュー文でクレンジングやキャスティングを行うために関数を使用できます。これは本番環境の解決策ではありませんが、一時的な取り込みには役立つかもしれません。
* トピックからJSONを消費している場合は、`JSONEachRow`形式を使用し、[`input_format_skip_unknown_fields`](../../../operations/settings/settings-formats.md#settings-input-format-skip-unknown-fields)設定を使用します。データを書き込む際に、デフォルトではClickHouseはターゲットテーブルに存在しないカラムが入力データに含まれている場合、例外をスローします。ただし、このオプションが有効になっている場合、これらの余分なカラムは無視されます。これも本番レベルのソリューションではなく、他の人を混乱させるかもしれません。
* `kafka_skip_broken_messages`設定を考慮してください。これは、誤って形成されたメッセージごとのブロックの許容レベルを指定することをユーザーに要求します - kafka_max_block_sizeの文脈で検討されます。この許容レベルを超えると（絶対的なメッセージ数で測定）、通常の例外動作が戻り、他のメッセージがスキップされます。

##### 配信のセマンティクスと重複の課題 {#delivery-semantics-and-challenges-with-duplicates}

Kafkaテーブルエンジンは、少なくとも一度のセマンティクスを持っています。重複は、いくつかの既知のまれな状況で可能です。たとえば、メッセージがKafkaから読み取られ、ClickHouseに正常に挿入されることがあります。新しいオフセットをコミットする前にKafkaへの接続が失われる場合があります。この状況では、ブロックの再試行が必要です。このブロックは、共有テーブルまたはReplicatedMergeTreeをターゲットテーブルとして使用することで[重複排除](../../../engines/table-engines/mergetree-family/replication.md#table_engines-replication)することができます。このアプローチにより、重複行の可能性が減少しますが、同一のブロックに依存します。Kafkaのリバランスなどのイベントは、この仮定を無効にし、まれな状況で重複を引き起こす可能性があります。

##### クオラムベースの挿入 {#quorum-based-inserts}

ClickHouseでより高い配信保証が必要な場合、[クオラムベースの挿入](../../../operations/settings/settings.md#settings-insert_quorum)が必要になる場合があります。これはマテリアライズドビューやターゲットテーブルには設定できませんが、ユーザープロファイルに対して設定できます。

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouseからKafka {#clickhouse-to-kafka}

稀なユースケースではありますが、ClickHouseデータもKafkaに保持できます。たとえば、手動でKafkaテーブルエンジンに行を挿入します。このデータは、同じKafkaエンジンによって読み取られ、そのマテリアライズドビューがデータをマージツリー テーブルに配置します。最後に、マテリアライズドビューの適用を示し、既存のソーステーブルからの読み取り用にKafkaに挿入します。

#### ステップ {#steps-1}

私たちの最初の目的は、以下のように最もよく示されます：

<img src={kafka_02} class="image" alt="インサート付きKafkaテーブルエンジン" style={{width: '80%'}} />

KafkaからClickHouseへのステップで作成されたテーブルとビューがあると仮定し、トピックが完全に消費されているとします。

##### 1. 行を直接挿入 {#1-inserting-rows-directly}

まず、ターゲットテーブルのカウントを確認します。

```sql
SELECT count() FROM github;
```

200,000行があるはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHubターゲットテーブルからKafkaテーブルエンジン`github_queue`に行を挿入します。JSONEachRow形式を利用し、SELECT文を100に制限しています。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHubで行数を再確認して、100が増えていることを確認します。上記の図のように、行がKafkaを介してKafkaテーブルエンジンによって挿入された後、再度読み取られてGitHubターゲットテーブルにマテリアライズドビューによって挿入されます！

```sql
SELECT count() FROM github;
```

100行がさらに追加されているはずです：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューの使用 {#2-using-materialized-views}

マテリアライズドビューを利用して、ドキュメントがテーブルに挿入されるときにメッセージをKafkaエンジン（およびトピック）にプッシュできます。行がGitHubテーブルに挿入されると、マテリアライズドビューがトリガーされ、行が再びKafkaエンジンに挿入され、新しいトピックに配置されます。これも以下のように示されるのが最も分かりやすいです：

<img src={kafka_03} class="image" alt="インサート付きKafkaテーブルエンジン" style={{width: '80%'}} />

新しいKafkaトピック`github_out`または同等のものを作成します。このトピックを指すKafkaテーブルエンジン`github_out_queue`を作成してください。

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

次に、GitHubテーブルを指す新しいマテリアライズドビュー`github_out_mv`を作成し、それが触発されたときに上記のエンジンに行を挿入します。その結果、GitHubテーブルへの追加は、新しいKafkaトピックにプッシュされます。

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

元のGitHubトピックに挿入すると、[Kafka to ClickHouse](#kafka-to-clickhouse)の一部として作成されたドキュメントが「github_clickhouse」トピックに魔法のように現れます。これをネイティブKafkaツールを使って確認してください。例えば、以下では、[kcat](https://github.com/edenhill/kcat)を使用して、Confluent Cloudでホストされているトピックに100行を挿入します：

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

`github_out`トピックの読み取りは、メッセージの配信を確認するはずです。

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

これは詳細な例ですが、Kafkaエンジンと共に使用された際のマテリアライズドビューの力を示しています。

### クラスターとパフォーマンス {#clusters-and-performance}

#### ClickHouseクラスタとの作業 {#working-with-clickhouse-clusters}

Kafkaの消費者グループを通じて、複数のClickHouseインスタンスが同じトピックから読み取ることができます。各消費者はトピックパーティションに1:1で割り当てられます。Kafkaテーブルエンジンを使用してClickHouse消費をスケールアップする際、クラスタ内の消費者の総数はトピックのパーティション数を超えることはできません。したがって、トピックのパーティショニングが適切に設定されていることを事前に確認してください。

複数のClickHouseインスタンスはすべて、Kafkaテーブルエンジンの作成中に指定された同じ消費者グループIDを使用してトピックから読み取るように構成できます。したがって、各インスタンスは1つ以上のパーティションから読み取り、ローカルターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複を処理するためにReplicatedMergeTreeを使用するように構成できます。このアプローチにより、Kafkaの読み取りをClickHouseクラスタとスケールさせることができ、十分なKafkaパーティションが提供されています。

<img src={kafka_04} class="image" alt="インサート付きKafkaテーブルエンジン" style={{width: '80%'}} />

#### パフォーマンスの調整 {#tuning-performance}

Kafkaエンジンのテーブルスループット性能を向上させるために以下を考慮してください：

* パフォーマンスは、メッセージサイズ、フォーマット、ターゲットテーブルタイプによって異なります。単一のテーブルエンジンで100k行/秒は達成可能と考えられます。デフォルトでは、メッセージはブロック単位で読み取られ、kafka_max_block_sizeパラメータによって制御されます。デフォルトでは、これは[ max_insert_block_size](../../../operations/settings/settings.md#setting-max_insert_block_size)に設定され、デフォルト値は1,048,576です。メッセージが非常に大きくない限り、通常はこれを増やすべきです。500k〜1Mの値は珍しくありません。スループット性能への影響をテストして評価してください。
* テーブルエンジンの消費者の数は、kafka_num_consumersを使用して増やすことができます。ただし、デフォルトでは、挿入は単一スレッドで線形化されるため、kafka_thread_per_consumerがデフォルトの1から変更されない限り、これは行いません。これを1に設定すると、フラッシュが並行して実行されます。N消費者でKafkaエンジンテーブルを作成することは、マテリアライズドビューとkafka_thread_per_consumer=0を持つNのKafkaエンジンを作成することと論理的に同等です。
* 消費者を増やすことは無償の操作ではありません。各消費者は独自のバッファーとスレッドを維持し、サーバーのオーバーヘッドを増加させます。消費者のオーバーヘッドに留意し、まずクラスタ全体で線形にスケールします。
* Kafkaメッセージのスループットが変動し、遅延が受け入れられる場合、stream_flush_interval_msを増やして大きなブロックがフラッシュされるように考慮してください。
* [background_message_broker_schedule_pool_size](../../../operations/settings/settings.md#background_message_broker_schedule_pool_size)は、バックグラウンドタスクを実行するスレッドの数を設定します。これらのスレッドはKafkaストリーミングに使用されます。この設定はClickHouseサーバーの起動時に適用され、ユーザーセッション中に変更できず、デフォルトは16です。ログにタイムアウトが表示される場合は、これを増やすことが適切かもしれません。
* Kafkaとの通信には、librdkafkaライブラリが使用されており、これ自体がスレッドを作成します。大量のKafkaテーブルまたは消費者があると、大量のコンテキストスイッチが発生する可能性があります。この負荷をクラスタ全体に分散させ、ターゲットテーブルを可能な限り複製せずに作成するか、または複数のトピックから読むためのテーブルエンジンを使用することを検討してください - 値のリストがサポートされています。1つのテーブルから複数のマテリアライズドビューを読み取り、それぞれ特定のトピックからのデータをフィルタリングすることができます。

設定の変更はテストされるべきです。Kafkaの消費者の遅延を監視し、適切にスケールしていることを確認することをお勧めします。

#### 追加設定 {#additional-settings}

上記で議論されている設定に加えて、以下の設定が関心を引くかもしれません：

* [Kafka_max_wait_ms](../../../operations/settings/settings.md#kafka-max-wait-ms) - 再試行前にKafkaからメッセージを読み取るための待機時間（ミリ秒）。ユーザープロファイルレベルで設定され、デフォルトは5000です。

基盤のlibrdkafkaからの[すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)は、ClickHouseの設定ファイル内の_kafka_要素に配置することもできます - 設定名はXML要素で、ピリオドがアンダースコアに置き換えられます。

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらはエキスパート設定であり、詳細な説明についてはKafkaのドキュメントを参照することをお勧めします。
