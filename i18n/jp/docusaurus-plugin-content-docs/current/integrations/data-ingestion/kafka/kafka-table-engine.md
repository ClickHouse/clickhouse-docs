---
sidebar_label: 'Kafka テーブルエンジン'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Kafka テーブルエンジンの使用方法'
title: 'Kafka テーブルエンジンの使用方法'
doc_type: 'guide'
keywords: ['kafka', 'table engine', 'streaming', 'real-time', 'message queue']
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Kafkaテーブルエンジンの使用

Kafkaテーブルエンジンは、Apache KafkaおよびKafka API互換のブローカー(例: Redpanda、Amazon MSK)からの[データの**読み取り**](#kafka-to-clickhouse)と[データの**書き込み**](#clickhouse-to-kafka)に使用できます。

### KafkaからClickHouseへ {#kafka-to-clickhouse}

:::note
ClickHouse Cloudをご利用の場合は、代わりに[ClickPipes](/integrations/clickpipes)の使用を推奨します。ClickPipesは、プライベートネットワーク接続、取り込みとクラスタリソースの独立したスケーリング、およびKafkaデータをClickHouseにストリーミングするための包括的な監視をネイティブにサポートしています。
:::

Kafkaテーブルエンジンを使用するには、[ClickHouseマテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)について十分に理解している必要があります。

#### 概要 {#overview}

まず、最も一般的なユースケースに焦点を当てます。それは、Kafkaテーブルエンジンを使用してKafkaからClickHouseにデータを挿入することです。

Kafkaテーブルエンジンは、ClickHouseがKafkaトピックから直接読み取ることを可能にします。トピック上のメッセージを表示するのに便利ですが、このエンジンは設計上、一度だけの取得のみを許可します。つまり、テーブルに対してクエリが発行されると、キューからデータを消費し、呼び出し元に結果を返す前にコンシューマオフセットを増加させます。実質的に、これらのオフセットをリセットしない限り、データを再読み取りすることはできません。

テーブルエンジンからの読み取りでこのデータを永続化するには、データをキャプチャして別のテーブルに挿入する手段が必要です。トリガーベースのマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューはテーブルエンジンに対して読み取りを開始し、ドキュメントのバッチを受信します。TO句はデータの宛先を決定します。通常は[MergeTreeファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下に視覚化されています:

<Image
  img={kafka_01}
  size='lg'
  alt='Kafkaテーブルエンジンアーキテクチャ図'
  style={{ width: "80%" }}
/>

#### 手順 {#steps}

##### 1. 準備 {#1-prepare}

対象トピックにデータが投入されている場合は、以下をデータセットで使用できるように適応させることができます。または、サンプルのGithubデータセットが[こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)で提供されています。このデータセットは以下の例で使用され、簡潔にするために[こちら](https://ghe.clickhouse.tech/)で利用可能な完全なデータセットと比較して、縮小されたスキーマと行のサブセット(具体的には、[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse)に関するGithubイベントに限定)を使用しています。それでも、[データセットと共に公開されている](https://ghe.clickhouse.tech/)ほとんどのクエリを動作させるには十分です。

##### 2. ClickHouseの設定 {#2-configure-clickhouse}

この手順は、セキュアなKafkaに接続する場合に必要です。これらの設定はSQL DDLコマンドを通じて渡すことができず、ClickHouseのconfig.xmlで設定する必要があります。SASL保護されたインスタンスに接続することを前提としています。これはConfluent Cloudと対話する際の最も簡単な方法です。

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

上記のスニペットをconf.d/ディレクトリ配下の新しいファイルに配置するか、既存の設定ファイルにマージしてください。設定可能な設定については、[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)を参照してください。

また、このチュートリアルで使用する`KafkaEngine`というデータベースを作成します:

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、それに切り替える必要があります:

```sql
USE KafkaEngine;
```

##### 3. 宛先テーブルの作成 {#3-create-the-destination-table}

宛先テーブルを準備します。以下の例では、簡潔にするために縮小されたGitHubスキーマを使用しています。MergeTreeテーブルエンジンを使用していますが、この例は[MergeTreeファミリー](../../../engines/table-engines/mergetree-family/index.md)の任意のメンバーに簡単に適応できることに注意してください。


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

##### 4. トピックの作成とデータ投入 {#4-create-and-populate-the-topic}

次に、トピックを作成します。これにはいくつかのツールを使用できます。ローカルマシンまたはDockerコンテナ内でKafkaを実行している場合は、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/)が適しています。以下のコマンドを実行することで、5つのパーティションを持つ`github`という名前のトピックを作成できます:

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent Cloud上でKafkaを実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)の使用が適しています:

```bash
confluent kafka topic create --if-not-exists github
```

次に、このトピックにデータを投入する必要があります。これには[kcat](https://github.com/edenhill/kcat)を使用します。認証が無効になっているローカル環境でKafkaを実行している場合は、以下のようなコマンドを実行できます:

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

KafkaクラスタがSASLを使用して認証を行う場合は、以下のコマンドを実行します:

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


このデータセットには200,000行が含まれており、数秒で取り込まれるはずです。より大規模なデータセットを扱いたい場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHubリポジトリの[大規模データセットセクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)を参照してください。

##### 5. Kafkaテーブルエンジンを作成する {#5-create-the-kafka-table-engine}

以下の例では、マージツリーテーブルと同じスキーマを持つテーブルエンジンを作成します。これは厳密には必須ではありません。ターゲットテーブルにエイリアスやエフェメラルカラムを持たせることができるためです。ただし、設定は重要です。KafkaトピックからJSONを消費するためのデータ型として`JSONEachRow`が使用されていることに注意してください。値`github`と`clickhouse`は、それぞれトピック名とコンシューマグループ名を表します。トピックは実際には値のリストを指定することもできます。

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
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

エンジン設定とパフォーマンスチューニングについては後述します。この時点で、テーブル`github_queue`に対する単純なselectでいくつかの行を読み取ることができるはずです。これによりコンシューマオフセットが前進し、[リセット](#common-operations)なしではこれらの行を再読み込みできなくなることに注意してください。制限と必須パラメータ`stream_like_engine_allow_direct_select`に注意してください。

##### 6. マテリアライズドビューを作成する {#6-create-the-materialized-view}

マテリアライズドビューは、以前に作成した2つのテーブルを接続し、Kafkaテーブルエンジンからデータを読み取り、ターゲットのマージツリーテーブルに挿入します。さまざまなデータ変換を行うことができます。ここでは単純な読み取りと挿入を行います。\*の使用は、カラム名が同一である(大文字小文字を区別)ことを前提としています。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```


マテリアライズドビューは作成時点でKafkaエンジンに接続し、読み取りを開始します。ターゲットテーブルへの行の挿入が行われます。このプロセスは無期限に継続され、その後Kafkaに挿入されたメッセージも消費されます。挿入スクリプトを再実行して、Kafkaにさらにメッセージを挿入できます。

##### 7. 行が挿入されたことを確認する {#7-confirm-rows-have-been-inserted}

ターゲットテーブルにデータが存在することを確認します:

```sql
SELECT count() FROM github;
```

200,000行が表示されるはずです:

```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 一般的な操作 {#common-operations}

##### メッセージ消費の停止と再開 {#stopping--restarting-message-consumption}

メッセージ消費を停止するには、Kafkaエンジンテーブルをデタッチします:

```sql
DETACH TABLE github_queue;
```

これはコンシューマーグループのオフセットに影響しません。消費を再開し、前回のオフセットから継続するには、テーブルを再アタッチします。

```sql
ATTACH TABLE github_queue;
```

##### Kafkaメタデータの追加 {#adding-kafka-metadata}

ClickHouseに取り込まれた後、元のKafkaメッセージのメタデータを追跡することが有用な場合があります。例えば、特定のトピックやパーティションをどれだけ消費したかを把握したい場合があります。この目的のために、Kafkaテーブルエンジンはいくつかの[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を公開しています。これらは、スキーマとマテリアライズドビューのselect文を変更することで、ターゲットテーブルのカラムとして永続化できます。

まず、ターゲットテーブルにカラムを追加する前に、上記で説明した停止操作を実行します。

```sql
DETACH TABLE github_queue;
```

以下では、行の元となったソーストピックとパーティションを識別するための情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想カラムが必要に応じてマッピングされていることを確認する必要があります。
仮想カラムには`_`のプレフィックスが付きます。
仮想カラムの完全なリストは[こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)で確認できます。

仮想カラムでテーブルを更新するには、マテリアライズドビューを削除し、Kafkaエンジンテーブルを再アタッチし、マテリアライズドビューを再作成する必要があります。

```sql
DROP VIEW github_mv;
```

```sql
ATTACH TABLE github_queue;
```

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *, _topic AS topic, _partition as partition
FROM github_queue;
```

新しく消費された行にはメタデータが含まれているはずです。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

結果は次のようになります:

| actor_login   | event_type         | created_at          | topic  | partition |
| :------------ | :----------------- | :------------------ | :----- | :-------- |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0         |
| queeup        | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0         |
| IgorMinar     | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0         |
| dapi          | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0         |
| sourcerebels  | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0         |
| jamierumbelow | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0         |
| jpn           | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0         |
| Oxonium       | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0         |

##### Kafkaエンジン設定の変更 {#modify-kafka-engine-settings}

Kafkaエンジンテーブルを削除し、新しい設定で再作成することを推奨します。このプロセス中にマテリアライズドビューを変更する必要はありません。Kafkaエンジンテーブルが再作成されると、メッセージ消費が再開されます。

##### 問題のデバッグ {#debugging-issues}


認証の問題などのエラーは、KafkaエンジンのDDLに対するレスポンスでは報告されません。問題の診断には、メインのClickHouseログファイル clickhouse-server.err.log を使用することを推奨します。基盤となるKafkaクライアントライブラリ [librdkafka](https://github.com/edenhill/librdkafka) の詳細なトレースログは、設定を通じて有効化できます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正な形式のメッセージの処理 {#handling-malformed-messages}

Kafkaはしばしばデータの「投棄場所」として使用されます。これにより、トピックには混在したメッセージ形式や一貫性のないフィールド名が含まれることになります。これを避け、Kafka StreamsやksqlDBなどのKafka機能を活用して、Kafkaへの挿入前にメッセージが適切な形式で一貫性があることを確保してください。これらのオプションが利用できない場合、ClickHouseには役立ついくつかの機能があります。

- メッセージフィールドを文字列として扱います。必要に応じて、マテリアライズドビューのステートメントで関数を使用してクレンジングやキャストを実行できます。これは本番環境のソリューションとして推奨されませんが、一度限りの取り込みには役立つ可能性があります。
- トピックからJSONEachRow形式を使用してJSONを消費している場合は、設定 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields) を使用してください。データを書き込む際、デフォルトではClickHouseは入力データにターゲットテーブルに存在しないカラムが含まれている場合に例外をスローします。ただし、このオプションを有効にすると、これらの余分なカラムは無視されます。これも本番環境レベルのソリューションではなく、他の人を混乱させる可能性があります。
- 設定 `kafka_skip_broken_messages` を検討してください。これは、ユーザーが不正な形式のメッセージに対するブロックごとの許容レベルを指定する必要があります（kafka_max_block_sizeのコンテキストで考慮されます）。この許容値を超えた場合（絶対メッセージ数で測定）、通常の例外動作に戻り、他のメッセージはスキップされます。

##### 配信セマンティクスと重複の課題 {#delivery-semantics-and-challenges-with-duplicates}

Kafkaテーブルエンジンは少なくとも1回のセマンティクスを持ちます。いくつかの既知のまれな状況で重複が発生する可能性があります。例えば、メッセージがKafkaから読み取られ、ClickHouseに正常に挿入される場合があります。新しいオフセットがコミットされる前に、Kafkaへの接続が失われます。この状況ではブロックの再試行が必要です。ブロックは、分散テーブルまたはReplicatedMergeTreeをターゲットテーブルとして使用して[重複排除](/engines/table-engines/mergetree-family/replication)できます。これにより重複行の可能性は減少しますが、同一のブロックに依存します。Kafkaのリバランシングなどのイベントがこの前提を無効にし、まれな状況で重複を引き起こす可能性があります。

##### クォーラムベースの挿入 {#quorum-based-inserts}

ClickHouseでより高い配信保証が必要な場合には、[クォーラムベースの挿入](/operations/settings/settings#insert_quorum)が必要になる場合があります。これはマテリアライズドビューやターゲットテーブルには設定できません。ただし、ユーザープロファイルに対して設定できます。例えば：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouseからKafkaへ {#clickhouse-to-kafka}

より稀なユースケースですが、ClickHouseのデータをKafkaに永続化することもできます。例えば、Kafkaテーブルエンジンに手動で行を挿入します。このデータは同じKafkaエンジンによって読み取られ、そのマテリアライズドビューがデータをMerge Treeテーブルに配置します。最後に、既存のソーステーブルからテーブルを読み取るために、Kafkaへの挿入におけるマテリアライズドビューの適用を実演します。

#### 手順 {#steps-1}

最初の目的は次のように図示されます：

<Image img={kafka_02} size='lg' alt='Kafka table engine with inserts diagram' />

[KafkaからClickHouseへ](#kafka-to-clickhouse)の手順でテーブルとビューが作成されており、トピックが完全に消費されていることを前提とします。

##### 1. 行を直接挿入する {#1-inserting-rows-directly}

まず、ターゲットテーブルの行数を確認します。

```sql
SELECT count() FROM github;
```

200,000行あるはずです：

```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHubターゲットテーブルから行をKafkaテーブルエンジン github_queue に戻して挿入します。JSONEachRow形式を利用し、selectを100に制限していることに注意してください。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHubの行数を再カウントして、100増加していることを確認します。上記の図に示されているように、行はKafkaテーブルエンジンを介してKafkaに挿入され、その後同じエンジンによって再読み取りされ、マテリアライズドビューによってGitHubターゲットテーブルに挿入されました！

```sql
SELECT count() FROM github;
```


追加で100行が表示されます:

```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューの使用 {#2-using-materialized-views}

マテリアライズドビューを利用することで、テーブルにドキュメントが挿入された際にKafkaエンジン(およびトピック)にメッセージをプッシュできます。GitHubテーブルに行が挿入されると、マテリアライズドビューがトリガーされ、その行がKafkaエンジンを経由して新しいトピックに挿入されます。これは次の図で説明されています:

<Image
  img={kafka_03}
  size='lg'
  alt='マテリアライズドビューを使用したKafkaテーブルエンジンの図'
/>

新しいKafkaトピック`github_out`または同等のものを作成します。Kafkaテーブルエンジン`github_out_queue`がこのトピックを指していることを確認してください。

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
            'JSONEachRow') SETTINGS kafka_thread_per_consumer = 0, kafka_num_consumers = 1;
```

次に、新しいマテリアライズドビュー`github_out_mv`を作成してGitHubテーブルを参照し、トリガー時に上記のエンジンに行を挿入するようにします。これにより、GitHubテーブルへの追加が新しいKafkaトピックにプッシュされます。

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


[Kafka to ClickHouse](#kafka-to-clickhouse)の一部として作成された元のgithubトピックに挿入すると、ドキュメントは"github_clickhouse"トピックに自動的に表示されます。これをネイティブのKafkaツールで確認してください。例えば、以下では[kcat](https://github.com/edenhill/kcat)を使用してConfluent Cloudでホストされているトピックのgithubトピックに100行を挿入しています:

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

`github_out`トピックを読み取ることで、メッセージの配信を確認できます。

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

複雑な例ではありますが、これはKafkaエンジンと組み合わせて使用した場合のマテリアライズドビューの強力さを示しています。

### クラスタとパフォーマンス {#clusters-and-performance}

#### ClickHouseクラスタの操作 {#working-with-clickhouse-clusters}

Kafkaコンシューマグループを通じて、複数のClickHouseインスタンスが同じトピックから読み取ることができます。各コンシューマは1対1のマッピングでトピックパーティションに割り当てられます。Kafkaテーブルエンジンを使用してClickHouseの消費をスケーリングする際は、クラスタ内のコンシューマの総数がトピックのパーティション数を超えることができない点に注意してください。そのため、事前にトピックのパーティショニングが適切に設定されていることを確認してください。

複数のClickHouseインスタンスは、すべて同じコンシューマグループID(Kafkaテーブルエンジン作成時に指定)を使用してトピックから読み取るように設定できます。各インスタンスは1つ以上のパーティションから読み取り、セグメントをローカルのターゲットテーブルに挿入します。ターゲットテーブルは、データの複製を処理するためにReplicatedMergeTreeを使用するように設定することもできます。このアプローチにより、十分なKafkaパーティションがある場合、Kafkaの読み取りをClickHouseクラスタとともにスケーリングできます。

<Image
  img={kafka_04}
  size='lg'
  alt='ClickHouseクラスタを使用したKafkaテーブルエンジンの図'
/>

#### パフォーマンスのチューニング {#tuning-performance}

Kafkaエンジンテーブルのスループットパフォーマンスを向上させる際は、以下の点を考慮してください:

- パフォーマンスは、メッセージサイズ、フォーマット、ターゲットテーブルタイプによって異なります。単一のテーブルエンジンで100k行/秒は達成可能と考えられます。デフォルトでは、メッセージはブロック単位で読み取られ、kafka_max_block_sizeパラメータで制御されます。デフォルトでは、これは[max_insert_block_size](/operations/settings/settings#max_insert_block_size)に設定されており、デフォルト値は1,048,576です。メッセージが極端に大きい場合を除き、ほぼ常にこの値を増やすべきです。500kから1Mの値は珍しくありません。スループットパフォーマンスへの影響をテストして評価してください。
- テーブルエンジンのコンシューマ数は、kafka_num_consumersを使用して増やすことができます。ただし、デフォルトでは、kafka_thread_per_consumerがデフォルト値の0から変更されない限り、挿入は単一スレッドで直列化されます。フラッシュが並列に実行されるようにするには、これを1に設定してください。Nコンシューマ(およびkafka_thread_per_consumer=1)でKafkaエンジンテーブルを作成することは、論理的には、それぞれがマテリアライズドビューとkafka_thread_per_consumer=0を持つN個のKafkaエンジンを作成することと同等であることに注意してください。
- コンシューマを増やすことは無コストの操作ではありません。各コンシューマは独自のバッファとスレッドを維持し、サーバーのオーバーヘッドを増加させます。コンシューマのオーバーヘッドを意識し、可能であればまずクラスタ全体で線形にスケーリングしてください。
- Kafkaメッセージのスループットが変動し、遅延が許容される場合は、stream_flush_interval_msを増やして、より大きなブロックがフラッシュされるようにすることを検討してください。
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)は、バックグラウンドタスクを実行するスレッド数を設定します。これらのスレッドはKafkaストリーミングに使用されます。この設定はClickHouseサーバーの起動時に適用され、ユーザーセッションでは変更できず、デフォルトは16です。ログにタイムアウトが表示される場合は、この値を増やすことが適切な場合があります。
- Kafkaとの通信には、librdkafkaライブラリが使用され、このライブラリ自体がスレッドを作成します。大量のKafkaテーブルまたはコンシューマは、大量のコンテキストスイッチを引き起こす可能性があります。この負荷をクラスタ全体に分散させ、可能であればターゲットテーブルのみを複製するか、複数のトピックから読み取るテーブルエンジンの使用を検討してください(値のリストがサポートされています)。単一のテーブルから複数のマテリアライズドビューを読み取ることができ、それぞれが特定のトピックからのデータにフィルタリングします。


設定変更は必ずテストしてください。適切にスケーリングされていることを確認するため、Kafkaコンシューマーラグの監視を推奨します。

#### 追加設定 {#additional-settings}

上記で説明した設定以外に、以下の設定も有用です:

- [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 再試行前にKafkaからメッセージを読み取る際の待機時間(ミリ秒)。ユーザープロファイルレベルで設定され、デフォルト値は5000です。

基盤となるlibrdkafkaの[すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)は、ClickHouse設定ファイル内の _kafka_ 要素に配置することもできます。設定名はXML要素として記述し、ピリオドをアンダースコアに置き換える必要があります。例:

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらは上級者向けの設定です。詳細な説明についてはKafkaのドキュメントを参照してください。
