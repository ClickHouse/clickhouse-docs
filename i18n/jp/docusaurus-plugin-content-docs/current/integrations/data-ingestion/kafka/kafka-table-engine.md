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
Kafkaテーブルエンジンは[ClickHouse Cloud](https://clickhouse.com/cloud)ではサポートされていません。[ClickPipes](../clickpipes/kafka.md)または[Kafka Connect](./kafka-clickhouse-connect-sink.md)をご検討ください。
:::

### KafkaからClickHouse {#kafka-to-clickhouse}

Kafkaテーブルエンジンを使用するには、[ClickHouseのマテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)に広く精通している必要があります。

#### 概要 {#overview}

最初に、最も一般的なユースケース、すなわちKafkaテーブルエンジンを使用してKafkaからClickHouseにデータを挿入することに焦点を当てます。

Kafkaテーブルエンジンは、ClickHouseがKafkaトピックから直接読み取ることを可能にします。このエンジンは、トピックのメッセージを表示するのに役立ちますが、設計上、一度限りの取得しか許可していません。つまり、テーブルに対してクエリが発行されると、キューからデータを消費し、結果を呼び出し元に返す前にコンシューマオフセットを増加させます。実際には、これらのオフセットをリセットしない限り、データを再読み込みすることはできません。

このテーブルエンジンから読み取ったデータを保持するためには、データをキャプチャして別のテーブルに挿入する手段が必要です。トリガーベースのマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューは、テーブルエンジンでの読み取りを開始し、一連のドキュメントを受け取ります。TO句はデータの宛先を決定します - 通常は[Merge Treeファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下に視覚化されています。

<img src={kafka_01} class="image" alt="Kafkaテーブルエンジン" style={{width: '80%'}} />

#### 手順 {#steps}


##### 1. 準備 {#1-prepare}

ターゲットトピックにデータが格納されている場合は、次の内容をデータセットで使用するように適応できます。あるいは、サンプルのGithubデータセットが[こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)で提供されています。このデータセットは、以下の例で使用され、簡略化のためにカラムのスキーマや行のサブセット（特に、[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse)に関連するGithubイベントに制限されています）を使用しています。このデータセットは、[ここ](https://ghe.clickhouse.tech/)で入手可能なフルデータセットと比較しても、ほとんどのクエリが正常に機能するためには十分です。

##### 2. ClickHouseを構成する {#2-configure-clickhouse}

このステップは、セキュアなKafkaに接続する場合に必要です。これらの設定は、SQLのDDLコマンドを介して渡すことはできず、ClickHouseのconfig.xmlに設定する必要があります。SASLで保護されたインスタンスに接続することを前提としています。これは、Confluent Cloudとやり取りする際の最も簡単な方法です。

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

上記のスニペットを新しいファイルオにconf.d/ディレクトリに配置するか、既存の設定ファイルにマージしてください。設定可能な項目については、[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)をご覧ください。

このチュートリアルに使用するために、`KafkaEngine`というデータベースを作成します：

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、切り替える必要があります：

```sql
USE KafkaEngine;
```

##### 3. 宛先テーブルを作成する {#3-create-the-destination-table}

宛先テーブルを準備します。以下の例では、簡略化のためにGitHubの縮小されたスキーマを使用しています。MergeTreeテーブルエンジンを使用していますが、この例は[Merge Treeファミリー](../../../engines/table-engines/mergetree-family/index.md)のいかなるメンバーにも容易に適応できます。

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

##### 4. トピックを作成し、データを格納する {#4-create-and-populate-the-topic}

次に、トピックを作成します。これを行うために使用できるいくつかのツールがあります。ローカルマシンまたはDockerコンテナ内でKafkaを実行している場合、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/)が便利です。次のコマンドを実行して、5つのパーティションを持つ`github`というトピックを作成できます。

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent CloudでKafkaを実行している場合、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)を使用する方が好ましいかもしれません：

```bash
confluent kafka topic create --if-not-exists github
```

次に、このトピックにデータを格納する必要があります。これを行うために[kcat](https://github.com/edenhill/kcat)を使用します。認証が無効のローカルKafkaを実行している場合、次のようなコマンドを実行できます：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

または、KafkaクラスターがSASLを使用して認証する場合は、次のようにします：

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

データセットには200,000行が含まれているため、数秒内に取り込まれるはずです。より大きなデータセットを扱いたい場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHubリポジトリの[大きなデータセットセクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)を参照してください。

##### 5. Kafkaテーブルエンジンを作成する {#5-create-the-kafka-table-engine}

以下の例では、マージツリーテーブルと同じスキーマを持つテーブルエンジンを作成します。これは厳密には必要ではなく、ターゲットテーブルにエイリアスや一時カラムを持たせることができます。ただし、設定は重要です。トピックからJSONを消費するデータ型として`JSONEachRow`を使用することに注意してください。値`github`および`clickhouse`は、それぞれトピックとコンシューマグループの名前を表します。トピックは実際には値のリストで構成できます。

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

エンジン設定とパフォーマンスの調整については、以下で説明します。この時点で、テーブル`github_queue`に対して単純な選択を行うことで、いくつかの行が読み取られるはずです。この操作によりコンシューマオフセットが進むことに注意してください。これにより、これらの行は[リセット](#common-operations)なしで再読み込みされません。制限および必要なパラメーター`stream_like_engine_allow_direct_select`にも注意してください。

##### 6. マテリアライズドビューを作成する {#6-create-the-materialized-view}

マテリアライズドビューは、先に作成した2つのテーブルを接続し、Kafkaテーブルエンジンからデータを読み取り、ターゲットマージツリーテーブルに挿入します。いくつかのデータ変換を行うことができます。ここでは簡単な読み取りと挿入を行います。*を使用することで、カラム名が同じであること（大文字と小文字を区別すること）を前提とします。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

作成時点で、このマテリアライズドビューはKafkaエンジンに接続し、読み取りを開始し、ターゲットテーブルに行を挿入します。このプロセスは無限に続き、Kafkaに新しいメッセージが挿入されると、それらを消費します。さらにメッセージをKafkaに挿入するために挿入スクリプトを再実行してください。

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

#### 共通操作 {#common-operations}

##### メッセージ消費の停止と再開 {#stopping--restarting-message-consumption}

メッセージの消費を停止するには、Kafkaエンジンタブルを切り離すことができます：

```sql
DETACH TABLE github_queue;
```

これにより、コンシューマグループのオフセットには影響しません。消費を再開し、前のオフセットから続けるには、テーブルを再接続します。

```sql
ATTACH TABLE github_queue;
```

##### Kafkaメタデータの追加 {#adding-kafka-metadata}

ClickHouseに取り込まれた後、元のKafkaメッセージからのメタデータを追跡することは有用です。たとえば、特定のトピックやパーティションをどの程度消費したかを知りたい場合があります。この目的のために、Kafkaテーブルエンジンはいくつかの[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を公開しています。これらは、スキーマおよびマテリアライズドビューのSELECTステートメントを変更することで、ターゲットテーブルのカラムとして永続化できます。

最初に、ターゲットテーブルへのカラム追加の前に上記で説明した停止操作を行います。

```sql
DETACH TABLE github_queue;
```

以下に、行の元となるトピックとパーティションを識別する情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想カラムが必要に応じてマッピングされていることを確認する必要があります。仮想カラムは`_`で始まります。仮想カラムの詳細なリストは[こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)にあります。

仮想カラムを持つテーブルを更新するには、マテリアライズドビューを削除し、Kafkaエンジンタブルを再接続し、再度マテリアライズドビューを作成する必要があります。

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

新たに取り込まれた行にはメタデータが含まれるはずです。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

結果は以下のようになります。

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

Kafkaエンジンタブルを削除して新しい設定で再作成することをお勧めします。このプロセスでは、マテリアライズドビューを変更する必要はありません。Kafkaエンジンタブルが再作成されると、メッセージ消費が再開されます。

##### 問題のデバッグ {#debugging-issues}

認証の問題のようなエラーは、KafkaエンジンDDLへの応答では報告されません。問題を診断するために、主要なClickHouseログファイルclickhouse-server.err.logを使用することをお勧めします。基礎となるKafkaクライアントライブラリ[librdkafka](https://github.com/edenhill/librdkafka)に対するさらなるトレースログを構成を通じて有効にできます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの処理 {#handling-malformed-messages}

Kafkaはしばしばデータの「ダンピンググラウンド」として使用されます。これにより、トピックには混合メッセージフォーマットや不整合なフィールド名が含まれることになります。これを避け、Kafka StreamsやksqlDBなどのKafka機能を利用して、メッセージが適切で一貫性のある形式でKafkaに挿入される前に確保してください。これらのオプションが不可能な場合、ClickHouseにはいくつかの機能があります。

* メッセージフィールドを文字列として扱います。必要であれば、マテリアライズドビューステートメントでクレンジングやキャスティングを実行するために関数を使用できます。これは本番環境でのソリューションではありませんが、一時的な取り込みには役立つかもしれません。
* トピックからJSONを消費する場合、JSONEachRowフォーマットを使用し、設定[`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)を利用します。データを書き込む際、デフォルトでClickHouseはターゲットテーブルに存在しないカラムが入力データに含まれていると、例外をスローします。ただし、このオプションが有効な場合、これらの余分なカラムは無視されます。これも本番レベルのソリューションではなく、他の人を混乱させる可能性があることに注意してください。
* `kafka_skip_broken_messages`設定を検討してください。これは、不正なメッセージに対するブロックごとの許容レベルを指定する必要があります。これはkafka_max_block_sizeの文脈で考慮されます。この許容度を超えた場合（絶対的なメッセージで測定される）、通常の例外の振る舞いが元に戻り、他のメッセージがスキップされます。

##### 配信のセマンティクスと重複の課題 {#delivery-semantics-and-challenges-with-duplicates}

Kafkaテーブルエンジンは、少なくとも1回のセマンティクスを持っています。重複する可能性は、いくつかの既知の稀な状況で発生します。たとえば、メッセージがKafkaから読み取られ、ClickHouseに正常に挿入された場合、新しいオフセットをコミットする前にKafkaとの接続が失われる可能性があります。この場合、ブロックを再試行する必要があります。ブロックは、ターゲットテーブルとして分散テーブルまたはReplicatedMergeTreeを使用して[重複排除](https://engines/table-engines/mergetree-family/replication)できます。このアプローチは、重複行の可能性を減少させますが、同一のブロックを前提としています。Kafkaのリバランスのようなイベントは、この仮定を無効にし、稀な状況で重複を引き起こす可能性があります。

##### クオーラムベースの挿入 {#quorum-based-inserts}

ClickHouseでより高い配信保証が必要な場合、[クオーラムベースの挿入](/operations/settings/settings#insert_quorum)が必要な場合があります。これはマテリアライズドビューやターゲットテーブルに設定できませんが、ユーザープロファイルに対して設定できます。：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouseからKafka {#clickhouse-to-kafka}

稀なユースケースですが、ClickHouseのデータもKafkaに保持できます。たとえば、選択的に行をKafkaテーブルエンジンに手動で挿入します。このデータは同じKafkaエンジンによって読み取られ、そのマテリアライズドビューはデータをマージツリーテーブルに配置します。最終的に、既存のソーステーブルからテーブルを読み取るためにKafkaに挿入する際にマテリアライズドビューを適用する方法を示します。

#### 手順 {#steps-1}

最初の目標は次のように最も良く示されます：

<img src={kafka_02} class="image" alt="Kafkaテーブルエンジンによる挿入" style={{width: '80%'}} />

[KafkaからClickHouse](#kafka-to-clickhouse)の手順の下でテーブルとビューを作成済みであり、トピックが完全に消費されていると仮定します。

##### 1. 行を直接挿入する {#1-inserting-rows-directly}

まず、ターゲットテーブルのカウントを確認します。

```sql
SELECT count() FROM github;
```

200,000行が存在するはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHubターゲットテーブルからKafkaテーブルエンジンのgithub_queueに行を挿入します。JSONEachRow形式を利用し、SELECTを100に制限することに注意してください。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

再度、GitHubでの行数を確認し、その数が100増えていることを確認してください。上記の図に示すように、行はKafkaテーブルエンジンを介してKafkaに挿入された後、同じエンジンによって再読み取りされ、GitHubターゲットテーブルにマテリアライズドビューによって挿入されます！

```sql
SELECT count() FROM github;
```

100行の追加を表示するはずです：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューを使用する {#2-using-materialized-views}

テーブルにドキュメントが挿入されると、マテリアライズドビューを利用してKafkaエンジン（およびトピック）にメッセージをプッシュすることができます。GitHubテーブルに行が挿入されると、マテリアライズドビューがトリガーされ、行がKafkaエンジンに再び挿入され、新しいトピックに流れることになります。これも以下のように示されます：

<img src={kafka_03} class="image" alt="Kafkaテーブルエンジンによる挿入" style={{width: '80%'}} />

新しいKafkaトピック`github_out`を作成します。これに対してKafkaテーブルエンジン`github_out_queue`が指すことを確認します。

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

次に、新しいマテリアライズドビュー`github_out_mv`をGitHubテーブルにポイントさせ、このエンジンに行を挿入するようにトリガーします。したがって、GitHubテーブルへの追加は、新しいKafkaトピックへプッシュされることになります。

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

もし[KafkaからClickHouse](#kafka-to-clickhouse)の一部として作成された元のgithubトピックに挿入すれば、ドキュメントは「github_clickhouse」トピックに自動的に表示されます。これを確認するために、ネイティブKafkaツールを利用します。たとえば、下記に示すように、[kcat](https://github.com/edenhill/kcat)を利用してKafkaトピックに100行を挿入します：

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

`github_out`トピックを読み取ると、メッセージの配信が確認できます。

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

これは複雑な例ですが、Kafkaエンジンと一緒に使用されるマテリアライズドビューの力を示しています。

### クラスターとパフォーマンス {#clusters-and-performance}

#### ClickHouseクラスターの使用 {#working-with-clickhouse-clusters}

Kafkaのコンシューマグループを通じて、複数のClickHouseインスタンスが同じトピックから読み取ることができます。各コンシューマは、トピックパーティションに1:1のマッピングで割り当てられます。Kafkaテーブルエンジンを使用してClickHouseの消費をスケールする際は、クラスター内のコンシューマの総数がトピックのパーティション数を超えることはできないことを考慮してください。従って、トピックのパーティショニングが事前に適切に構成されていることを確認する必要があります。

複数のClickHouseインスタンスは、同じコンシューマグループIDを使用するように構成され、Kafkaテーブルエンジンの作成時に指定されます。そのため、各インスタンスは1つ以上のパーティションから読み取り、ローカルターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複を処理するためにReplicatedMergeTreeを使用するように構成することもできます。このアプローチは、Kafka読み取りをClickHouseクラスターでスケールさせることが可能ですが、十分なKafkaパーティションが必要です。

<img src={kafka_04} class="image" alt="Kafkaテーブルエンジンによる挿入" style={{width: '80%'}} />

#### パフォーマンスの調整 {#tuning-performance}

Kafkaエンジンタブルのスループットパフォーマンスを向上させたい場合は、以下の点を考慮してください。

* パフォーマンスはメッセージのサイズ、形式、ターゲットテーブルの種類によって異なります。単一のテーブルエンジンで秒間100k行の取得が可能であると考えられます。デフォルトでは、メッセージはブロックで読み取られ、パラメータkafka_max_block_sizeによって制御されます。デフォルトでは、これは[max_insert_block_size](/operations/settings/settings#max_insert_block_size)に設定されており、初期値は1,048,576です。メッセージが非常に大きくない限り、これを常に増加させるべきです。500kから1Mの間の値が一般的です。テストしてスループットパフォーマンスへの影響を評価してください。
* テーブルエンジンのコンシューマ数は、kafka_num_consumersを使用して増やすことができます。ただし、デフォルトでは、挿入は単一スレッドで直線化されます。これを防ぐために、kafka_thread_per_consumerのデフォルト値を1から変更してください。1に設定することで、フラッシュを並行して実行できます。複数のコンシューマを持つKafkaエンジンタブルの作成は、マテリアライズドビューとkafka_thread_per_consumer=0を持つN個のKafkaエンジンを作成することと論理的に等しいです。
* コンシューマを増やすことは、無償の操作ではありません。各コンシューマは自身のバッファとスレッドを維持し、サーバーへのオーバーヘッドが増加します。消費者のオーバーヘッドを意識し、各クラスター全体で線形にスケールアップします。
* Kafkaメッセージのスループットが変動する場合、および遅延が許容される場合、stream_flush_interval_msを増加させて、大きなブロックがフラッシュされることを検討してください。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)は、バックグラウンドタスクを実行するスレッド数を設定します。これらのスレッドはKafkaストリーミングに使用されます。この設定はClickHouseサーバーの起動時に適用され、ユーザーセッション内で変更することはできず、デフォルトでは16に設定されています。ログにタイムアウトが表示された場合、これを増やすことが適切かもしれません。
* Kafkaとの通信にはlibrdkafkaライブラリが使用され、それ自体がスレッドを作成します。多数のKafkaテーブルやコンシューマが存在すると、文脈の切り替えの数が増大する可能性があります。可能であれば、クラスター全体にこの負荷を分散させ、ターゲットテーブルの複製を行い、または複数のトピックから読み込むためにテーブルエンジンを使用することを検討してください。値のリストがサポートされています。単一のテーブルから複数のマテリアライズドビューを読み取ることができ、それぞれ特定のトピックからのデータをフィルタリングします。

設定の変更はテストするべきです。Kafkaコンシューマの遅れを監視して、適切にスケールされていることを確認してください。

#### 追加設定 {#additional-settings}

上記で検討した設定の他にも、興味を引く可能性がある設定は以下の通りです。

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - メッセージをKafkaから読み取る際の待機時間（ミリ秒）。ユーザープロファイルレベルで設定され、デフォルトは5000です。

基礎となるlibrdkafkaからの[すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)は、ClickHouseの設定ファイル内の_kafka_要素に配置できます - 設定名はXML要素になり、ピリオドがアンダースコアに置き換えられます。たとえば：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらは専門的な設定であり、Kafkaのドキュメントを参照して詳細な説明を読むことをお勧めします。
