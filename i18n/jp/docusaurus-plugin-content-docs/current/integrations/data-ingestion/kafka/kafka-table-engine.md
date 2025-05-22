---
'sidebar_label': 'Kafka Table Engine'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': 'Using the Kafka Table Engine'
'title': 'Using the Kafka table engine'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Kafkaテーブルエンジンの使用

<CloudNotSupportedBadge/>

:::note
Kafkaテーブルエンジンは [ClickHouse Cloud](https://clickhouse.com/cloud) ではサポートされていません。 [ClickPipes](../clickpipes/kafka.md) または [Kafka Connect](./kafka-clickhouse-connect-sink.md) を検討してください。
:::

### KafkaからClickHouseへ {#kafka-to-clickhouse}

Kafkaテーブルエンジンを使用するには、[ClickHouseマテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)に大まかに精通している必要があります。

#### 概要 {#overview}

まずは最も一般的なユースケースに焦点を当てます：Kafkaテーブルエンジンを使用して、KafkaからClickHouseにデータを挿入します。

Kafkaテーブルエンジンは、ClickHouseがKafkaトピックから直接読み取ることを可能にします。トピック上のメッセージを表示するには便利ですが、エンジンは設計上、一度限りの取得しか許可しません。つまり、テーブルにクエリが発行されると、キューからデータを消費し、消費者オフセットを増加させてから、呼び出し元に結果を返します。実際には、これらのオフセットをリセットしない限り、データを再読することはできません。

テーブルエンジンから読み取ったデータを永続化するには、データをキャプチャして他のテーブルに挿入する手段が必要です。トリガーを使用したマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューはテーブルエンジンの読み取りを開始し、一連のドキュメントを受信します。TO句はデータの行き先を決定します - 通常は[Merge Treeファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下のように視覚化されます：

<Image img={kafka_01} size="lg" alt="Kafkaテーブルエンジンのアーキテクチャダイアグラム" style={{width: '80%'}} />

#### ステップ {#steps}

##### 1. 準備 {#1-prepare}

ターゲットトピックにデータが格納されている場合、以下の内容をデータセット用に適応できます。あるいは、サンプルのGithubデータセットが[こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)に用意されています。このデータセットは以下の例で使用し、簡潔さのためにフルデータセットに対して[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse)に関するGithubイベントに制限しています。これは、データセットに付随して発表されたほとんどのクエリで機能するのに十分です。

##### 2. ClickHouseの設定 {#2-configure-clickhouse}

これは、セキュアなKafkaに接続する場合に必要なステップです。これらの設定は、SQL DDLコマンドを介して渡すことはできず、ClickHouseのconfig.xmlで設定する必要があります。SASLによって保護されたインスタンスに接続することを前提としています。これは、Confluent Cloudと対話する際に最もシンプルな方法です。

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

上記のスニペットをconf.d/ディレクトリ内の新しいファイルに配置するか、既存の設定ファイルに統合してください。設定を構成できる方法については、[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)を参照してください。

このチュートリアルで使用する`KafkaEngine`というデータベースを作成します：

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、データベースに切り替えてください：

```sql
USE KafkaEngine;
```

##### 3. 目的のテーブルを作成 {#3-create-the-destination-table}

目的のテーブルを準備します。以下の例では、簡潔さのために削減されたGitHubスキーマを使用しています。MergeTreeテーブルエンジンを使用しますが、この例は[MergeTreeファミリー](../../../engines/table-engines/mergetree-family/index.md)の任意のメンバーに簡単に適応可能です。

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

##### 4. トピックを作成してデータを入れる {#4-create-and-populate-the-topic}

次に、トピックを作成します。これにはいくつかのツールを使用できます。ローカルでKafkaを実行している場合、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/)を使用すると便利です。以下のコマンドを実行して、5パーティションを持つ`github`というトピックを作成します：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent CloudでKafkaを実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)を使用することを好むかもしれません：

```bash
confluent kafka topic create --if-not-exists github
```

次に、このトピックにデータを入れる必要があります。これを行うために[kcat](https://github.com/edenhill/kcat)を使用します。認証が無効なローカルKafkaで動作している場合、以下のコマンドを実行できます：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

または、あなたのKafkaクラスターがSASLを使用して認証している場合は、以下のようにします：

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

データセットには200,000行が含まれているため、数秒で取り込まれるはずです。より大きなデータセットを操作したい場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHubリポジトリの [大規模データセットのセクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)を確認してください。

##### 5. Kafkaテーブルエンジンを作成 {#5-create-the-kafka-table-engine}

以下の例は、マージツリーテーブルと同じスキーマを持つテーブルエンジンを作成します。これは厳密には必要ありませんが、目的のテーブルにはエイリアスや一時的なカラムがあっても構いません。ただし、設定は重要です。KafkaトピックからJSONを消費するためにデータ型として `JSONEachRow` を使用することに注意してください。`github` と `clickhouse` の値はそれぞれトピック名と消費者グループ名を表します。トピックは実際には複数の値のリストを持つことができます。

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

エンジン設定やパフォーマンス調整については以下で説明します。この時点で、テーブル`github_queue`でシンプルなSELECTを実行するといくつかの行が読まれるはずです。これは、消費者のオフセットを前に進めることになり、これらの行が再読み込みされないようにします。制限および必要なパラメータ`stream_like_engine_allow_direct_select`にも注意してください。

##### 6. マテリアライズドビューを作成 {#6-create-the-materialized-view}

マテリアライズドビューは、先に作成した二つのテーブルを接続し、Kafkaテーブルエンジンからデータを読み取り、ターゲットのマージツリーテーブルに挿入します。いくつかのデータ変換を実行できます。ここでは単純な読み取りと挿入を行います。`*`の使用は、カラム名が同一であることを前提としています（大文字と小文字は区別）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

作成時のマテリアライズドビューはKafkaエンジンに接続し、読み取りを開始します：ターゲットテーブルに行を挿入します。このプロセスは無限に続き、Kafkaへの後続のメッセージ挿入が消費されます。さらにメッセージをKafkaに挿入するためにスクリプトを再実行しても構いません。

##### 7. 行が挿入されたことを確認 {#7-confirm-rows-have-been-inserted}

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

##### メッセージ消費の停止と再起動 {#stopping--restarting-message-consumption}

メッセージ消費を停止するには、Kafkaエンジンテーブルを切り離すことができます：

```sql
DETACH TABLE github_queue;
```

これにより、消費者グループのオフセットには影響しません。消費を再開し、前のオフセットから続けるには、テーブルを再接続します。

```sql
ATTACH TABLE github_queue;
```

##### Kafkaメタデータの追加 {#adding-kafka-metadata}

データがClickHouseに取り込まれた後、元のKafkaメッセージのメタデータを追跡することは有益です。例えば、特定のトピックやパーティションのどの程度を消費したのかを知りたい場合があります。この目的のために、Kafkaテーブルエンジンは複数の[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を公開しています。これらは私たちのターゲットテーブルにカラムとして保持するためにスキーマを修正し、マテリアライズドビューのSELECT文を変更することによって持続させることができます。

まず、上で説明した停止操作を実行して、ターゲットテーブルにカラムを追加する前にテーブルを切り離します。

```sql
DETACH TABLE github_queue;
```

以下に、行の発生源トピックとパーティションを識別する情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想カラムが必要に応じてマッピングされていることを確認する必要があります。
仮想カラムは`_`で接頭辞が付けられます。
仮想カラムの完全なリストは[こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)で確認できます。

仮想カラムでテーブルを更新するためには、マテリアライズドビューをドロップし、Kafkaエンジンテーブルを再接続し、マテリアライズドビューを再作成する必要があります。

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

新しく取り込まれた行にはメタデータが含まれるはずです。

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

Kafkaエンジンテーブルを削除し、新しい設定で再作成することをお勧めします。このプロセス中にマテリアライズドビューを変更する必要はありません - Kafkaエンジンテーブルが再作成されるとメッセージ消費は再開されます。

##### 問題のデバッグ {#debugging-issues}

認証問題などのエラーは、KafkaエンジンDDLへの応答には報告されません。問題の診断には、メインのClickHouseログファイルclickhouse-server.err.logを使用することをお勧めします。底層のKafkaクライアントライブラリ[librdkafka](https://github.com/edenhill/librdkafka)のさらなるトレースロギングは、設定を通じて有効にできます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの処理 {#handling-malformed-messages}

Kafkaはしばしばデータの「ダンピンググラウンド」として使用されます。これにより、トピックが混在したメッセージフォーマットや不整合なフィールド名を含むことになります。これを避けるために、Kafka StreamsやksqlDBのようなKafkaの機能を活用して、メッセージが挿入される前に適切に整形され、一貫性を持たせることをお勧めします。これらのオプションが利用できない場合、ClickHouseには役立ついくつかの機能があります。

* メッセージフィールドを文字列として扱う。必要に応じて、マテリアライズドビュー文でクレンジングやキャストを行うための関数を使用できます。これは本番環境のソリューションとは見なされませんが、一時的な取り込みには役立つかもしれません。
* トピックからJSONを消費する場合、JSONEachRowフォーマットを使用し、[`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)の設定を使用します。データを書き込む際、デフォルトでは、ClickHouseは入力データにターゲットテーブルに存在しないカラムが含まれている場合、例外をスローします。しかし、このオプションが有効にされている場合、これらの過剰なカラムは無視されます。再度言いますが、これは本番レベルの解決策でなく、他の人を混乱させる可能性があります。
* `kafka_skip_broken_messages`の設定を考慮します。これにより、ユーザーは不正なメッセージのブロックごとの許容度を指定する必要があります - kafka_max_block_sizeの文脈で考慮されます。この許容度が超過されると（絶対メッセージで測定）、通常の例外動作が戻り、他のメッセージはスキップされます。

##### 配信セマンティクスと重複の問題 {#delivery-semantics-and-challenges-with-duplicates}

Kafkaテーブルエンジンには少なくとも一度のセマンティクスがあります。いくつかの既知の稀な状況下で重複が可能です。例えば、メッセージがKafkaから読み取られ、ClickHouseに成功裏に挿入される場合があります。新しいオフセットがコミットされる前に、Kafkaへの接続が失われた場合、この状況でブロックの再試行が必要です。このブロックは、ターゲットテーブルとして分散テーブルまたはReplicatedMergeTreeを使用すると[デデュプリケート](https://engines/table-engines/mergetree-family/replication)される可能性があります。これにより重複行の可能性は減少しますが、同一ブロックに依存します。Kafkaのリバランスのようなイベントは、稀な状況で重複を引き起こすことがあり、この仮定を無効にする可能性があります。

##### クオラムベースの挿入 {#quorum-based-inserts}

ClickHouseでより高い配信保証が必要な場合、[クオラムベースの挿入](/operations/settings/settings#insert_quorum)が必要になることがあります。これは、マテリアライズドビューやターゲットテーブルで設定できません。しかし、ユーザープロファイルに設定することができます：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouseからKafkaへ {#clickhouse-to-kafka}

あまり一般的ではないユースケースですが、ClickHouseのデータをKafkaに永続化することもできます。例えば、Kafkaテーブルエンジンに行を手動で挿入します。このデータは、同じKafkaエンジンによって読み取られ、そのマテリアライズドビューがデータをMerge Treeテーブルに配置します。最後に、既存のソーステーブルからテーブルを読み取るためにKafkaへの挿入におけるマテリアライズドビューの適用を示します。

#### ステップ {#steps-1}

私たちの最初の目標は次のように示されます：

<Image img={kafka_02} size="lg" alt="挿入のあるKafkaテーブルエンジンのダイアグラム" />

KafkaからClickHouseへのステップでテーブルとビューが作成されていると仮定し、トピックは完全に消費されているとしましょう。

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

次に、GitHubターゲットテーブルからKafkaテーブルエンジンであるgithub_queueに行を挿入します。JSONEachRowフォーマットを使用し、SELECTを100に制限していることに注意してください。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHubの行の再カウントを行い、それが100増加したことを確認してください。上記のダイアグラムで示すように、行はKafkaテーブルエンジンを介してKafkaに挿入された後、同じエンジンによって再度読み込まれ、マテリアライズドビューによってGitHubターゲットテーブルに挿入されます。

```sql
SELECT count() FROM github;
```

100行の追加が表示されるはずです：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューの使用 {#2-using-materialized-views}

テーブルにドキュメントが挿入されると、マテリアライズドビューがトリガーされ、行がKafkaエンジンに挿入され、新しいトピックに送信されます。このプロセスを明示するには、以下の手順を実行します：

新しいKafkaトピック`github_out`または同等のものを作成します。Kafkaテーブルエンジン`github_out_queue`がこのトピックを指すように設定します。

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

次に、GitHubテーブルを指す新しいマテリアライズドビュー`github_out_mv`を作成し、行がトリガーされたときに上記のエンジンに行を挿入します。GitHubテーブルへの追加は、その結果、新しいKafkaトピックにプッシュされます。

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

元のgithubトピックに挿入すると、[KafkaからClickHouse](#kafka-to-clickhouse)の一部として作成されたものが、ドキュメントが「github_clickhouse」トピックに現れます。これを確認するには、ネイティブKafkaツールを使用してください。以下のように100行をgithubトピックに挿入します：

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

`github_out`トピックの読み取りでメッセージの配信を確認できるはずです。

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

これはエレガントな例ですが、Kafkaエンジンと組み合わせて使用する際のマテリアライズドビューの力を示しています。

### クラスターとパフォーマンス {#clusters-and-performance}

#### ClickHouseクラスターとの作業 {#working-with-clickhouse-clusters}

Kafka消費者グループを通じて、複数のClickHouseインスタンスが同じトピックから読み取ることが可能です。各消費者はトピックのパーティションに1:1のマッピングで割り当てられます。Kafkaテーブルエンジンを使用してClickHouseの消費をスケールさせる場合、クラスター内の消費者の総数はトピック上のパーティション数を超えることができません。したがって、事前にトピックのパーティショニングが適切に設定されていることを確認してください。

複数のClickHouseインスタンスは、同じ消費者グループIDを使用してトピックから読み取るように設定できます - これはKafkaテーブルエンジンの作成中に指定されます。したがって、各インスタンスは1つ以上のパーティションから読み取り、ローカルターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複を処理するためにReplicatedMergeTreeを使用するように設定される可能性があります。このアプローチでは、十分なKafkaパーティションが提供されれば、Kafkaの読み取りをClickHouseクラスターとスケールすることができます。

<Image img={kafka_04} size="lg" alt="ClickHouseクラスターとのKafkaテーブルエンジンのダイアグラム"/>

#### パフォーマンス調整 {#tuning-performance}

Kafkaエンジンテーブルのスループットパフォーマンスを向上させるために、次の点を考慮してください：

* パフォーマンスは、メッセージのサイズ、フォーマット、ターゲットテーブルの種類によって異なります。単一のテーブルエンジンで100k行/秒は達成可能と見なされるべきです。デフォルトで、メッセージはブロックで読み取られ、kafka_max_block_sizeパラメータによって制御されます。デフォルトでは、これは[max_insert_block_size](/operations/settings/settings#max_insert_block_size)に設定されており、デフォルト値は1,048,576です。メッセージが非常に大きくない限り、これはほぼ常に増加するべきです。500kから1Mの間の値は珍しくありません。スループットパフォーマンスへの影響をテストして評価してください。
* テーブルエンジンの消費者数は、kafka_num_consumersを使用して増加させることができます。ただし、デフォルトでは挿入は単一スレッドで線形化され、kafka_thread_per_consumerのデフォルト値を変更しない限り。これを1に設定するとフラッシュが並行して実行されることが保証されます。N個の消費者を持つKafkaエンジンテーブルの作成（およびkafka_thread_per_consumer=1）は、各々がマテリアライズドビューおよびkafka_thread_per_consumer=0を持つN個のKafkaエンジンを作成することと論理的には同じです。
* 消費者を増やすことは無料の操作ではありません。各消費者は自身のバッファとスレッドを維持し、サーバーへのオーバーヘッドが増加します。消費者のオーバーヘッドを意識し、まずクラスター全体にわたって線形にスケールアップすることが望ましいです。
* Kafkaメッセージのスループットが変動する場合は、ストリームフラッシュインターバルをms単位で増加させて、より大きなブロックがフラッシュされるようにすることを検討してください。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)は、バックグラウンドタスクを実行するスレッドの数を設定します。これらのスレッドはKafkaストリーミングに使用されます。この設定はClickHouseサーバーの起動時に適用され、ユーザーセッション内で変更できず、デフォルトは16です。ログにタイムアウトが表示された場合は、これを増加させると適切かもしれません。
* Kafkaとの通信には、スレッドを作成するlibrdkafkaライブラリが使用されます。大量のKafkaテーブルや消費者がある場合、大量のコンテキストスイッチが発生する可能性があります。この負荷をクラスター全体に分散させ、可能な限りターゲットテーブルだけを複製するか、複数トピックから読み取るためにテーブルエンジンを使用することを検討してください - 値のリストがサポートされています。特定のトピックからのデータをフィルタリングする各マテリアライズドビューが、単一のテーブルから読み取ることができます。

設定変更は、必ずテストしてください。Kafka消費者の遅延を監視し、適切なスケールを確保することをお勧めします。

#### 追加設定 {#additional-settings}

上記の設定に加えて、次の内容も関心があるかもしれません：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 再試行前にKafkaからメッセージを読み取るための待機時間（ミリ秒単位）。ユーザープロファイルレベルで設定され、デフォルトは5000です。

底層のlibrdkafkaからの[すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)も、ClickHouse設定ファイル内の_kafka_要素内に配置できます - 設定名はXML要素で、ドットをアンダースコアに置き換える必要があります：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これは専門的な設定であり、詳細な説明についてはKafkaのドキュメントを参照することをお勧めします。
