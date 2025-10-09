---
'sidebar_label': 'Kafka Table Engine'
'sidebar_position': 5
'slug': '/integrations/kafka/kafka-table-engine'
'description': 'Kafka テーブルエンジンの使用'
'title': 'Kafka テーブルエンジンの使用'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';



# Kafkaテーブルエンジンの使用

Kafkaテーブルエンジンは、Apache Kafkaおよび他のKafka API互換ブローカー（例：Redpanda、Amazon MSK）から[**データを読み取る**](#kafka-to-clickhouse)および[**データを書き込む**](#clickhouse-to-kafka)ために使用できます。

### KafkaからClickHouse {#kafka-to-clickhouse}

:::note
ClickHouse Cloudをご利用の場合は、代わりに[ClickPipes](/integrations/clickpipes)の使用をお勧めします。ClickPipesは、プライベートネットワーク接続をネイティブにサポートし、データの取り込みやクラスタリソースを独立してスケーリングし、ClickHouseにストリーミングするKafkaデータの包括的な監視を提供します。
:::

Kafkaテーブルエンジンを使用するには、[ClickHouseのマテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)について広く理解している必要があります。

#### 概要 {#overview}

最初に最も一般的なユースケースに焦点を当てます：KafkaからClickHouseにデータを挿入するためにKafkaテーブルエンジンを使用します。

Kafkaテーブルエンジンは、ClickHouseがKafkaトピックから直接読み取ることを可能にします。これはトピック上のメッセージを表示するのに便利ですが、エンジンは設計上、一度きりの取得のみを許可します。つまり、テーブルにクエリを発行すると、キューからデータを消費し、結果を呼び出し元に返す前に消費者オフセットを増加させます。実際には、これらのオフセットをリセットせずに再読されることはありません。

テーブルエンジンからのデータを永続化するためには、データをキャプチャして別のテーブルに挿入する手段が必要です。トリガーに基づくマテリアライズドビューがこの機能をネイティブに提供します。マテリアライズドビューは、テーブルエンジン上で読み取りを開始し、バッチのドキュメントを受信します。TO句はデータの宛先を決定します - 通常は[Merge Treeファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下のように視覚化されます：

<Image img={kafka_01} size="lg" alt="Kafkaテーブルエンジンアーキテクチャダイアグラム" style={{width: '80%'}} />

#### 手順 {#steps}

##### 1. 準備する {#1-prepare}

ターゲットトピックにデータが存在する場合は、次の内容をあなたのデータセットで使用するように適応できます。あるいは、サンプルのGitHubデータセットが[ここ](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)で提供されています。このデータセットは以下の例で使用され、簡略化されたスキーマと行のサブセットを使用します（具体的には、[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse)に関するGitHubイベントに制限しています）。これは、[こちら](https://ghe.clickhouse.tech/)で利用可能な完全なデータセットとの対比において、ほとんどのクエリが機能するためには十分です。

##### 2. ClickHouseを構成する {#2-configure-clickhouse}

これは、セキュアなKafkaに接続する場合に必要です。これらの設定はSQL DDLコマンドを通じて渡すことはできず、ClickHouseのconfig.xmlで構成する必要があります。SASLで保護されたインスタンスに接続すると仮定します。これはConfluent Cloudを操作する際に最も簡単な方法です。

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

上記のスニペットを新しいファイルにconf.d/ディレクトリ内に配置するか、既存の設定ファイルに統合します。設定できる項目については[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)を参照してください。

このチュートリアルで使用するために、`KafkaEngine`というデータベースも作成します：

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、そこに切り替える必要があります：

```sql
USE KafkaEngine;
```

##### 3. 宛先テーブルを作成する {#3-create-the-destination-table}

宛先テーブルを準備します。以下の例では、簡潔さのために縮小されたGitHubスキーマを使用しています。MergeTreeテーブルエンジンを使用していますが、この例は[MergeTreeファミリー](../../../engines/table-engines/mergetree-family/index.md)のいずれかのメンバーに容易に適応できます。

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

##### 4. トピックを作成し、データを投入する {#4-create-and-populate-the-topic}

次に、トピックを作成します。これを行うために使用できるツールはいくつかあります。ローカルで機械上またはDockerコンテナ内でKafkaを実行している場合は、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/)がうまく機能します。次のコマンドを実行して、5つのパーティションを持つ`github`というトピックを作成できます：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent CloudでKafkaを実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records)を使用することを好むかもしれません：

```bash
confluent kafka topic create --if-not-exists github
```

次に、このトピックにいくつかのデータを投入する必要があります。[kcat](https://github.com/edenhill/kcat)を使用してこれを行います。認証が無効にされているローカルのKafkaを実行している場合は、次のようなコマンドを実行できます：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

または、KafkaクラスタがSASLを使用して認証する場合は、次のようにします：

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

データセットには200,000行含まれているため、数秒で取り込まれるはずです。より大きなデータセットで作業したい場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples)の[大規模データセットセクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets)を参照してください。

##### 5. Kafkaテーブルエンジンを作成する {#5-create-the-kafka-table-engine}

以下の例では、Merge Treeテーブルと同じスキーマを持つテーブルエンジンを作成します。これは厳密には必要ありませんが、ターゲットテーブルにエイリアスまたは一時的なカラムを持つこともできます。ただし、設定は重要です。KafkaトピックからJSONを消費するためのデータ型として`JSONEachRow`の使用に注意してください。値`github`と`clickhouse`は、それぞれトピック名と消費者グループ名を表します。トピックは実際には値のリストであることができます。

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

エンジン設定とパフォーマンス調整については以下で説明します。この時点で、テーブル`github_queue`に対して単純な選択を行うことで、いくつかの行が読み込まれるはずです。この操作は消費者オフセットを前進させるため、これらの行をリセットなしに再読はできません。[reset](#common-operations)に注意してください。制限および必要なパラメーター`stream_like_engine_allow_direct_select`にも注意してください。

##### 6. マテリアライズドビューを作成する {#6-create-the-materialized-view}

マテリアライズドビューは、以前に作成した2つのテーブルを接続し、Kafkaテーブルエンジンからデータを読み取り、ターゲットのマージツリー表に挿入します。データ変換をいくつか実行できます。単純な読み取りと挿入を行います。* の使用は、カラム名が同じであることを仮定しています（大文字と小文字を区別）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

作成時に、マテリアライズドビューはKafkaエンジンに接続し、読み取りを開始します：ターゲットテーブルに行を挿入します。このプロセスは無限に続き、その後のメッセージの挿入がKafkaから消費され続けます。さらなるメッセージをKafkaに挿入するために挿入スクリプトを再実行しても問題ありません。

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

メッセージの消費を停止するには、Kafkaエンジンテーブルをデタッチできます：

```sql
DETACH TABLE github_queue;
```

これにより、消費者グループのオフセットには影響しません。消費を再開し、前のオフセットから続けるには、テーブルを再接続します。

```sql
ATTACH TABLE github_queue;
```

##### Kafkaメタデータの追加 {#adding-kafka-metadata}

ClickHouseに取り込まれた後も、元のKafkaメッセージのメタデータを追跡することは有用です。たとえば、特定のトピックやパーティションをどれだけ消費したかを知りたい場合があります。この目的のために、Kafkaテーブルエンジンは複数の[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を公開します。これらは、スキーマおよびマテリアライズドビューの選択文を修正することによって、ターゲットテーブルのカラムとして永続化できます。

まず、ターゲットテーブルにカラムを追加する前に、上記の停止操作を実行します。

```sql
DETACH TABLE github_queue;
```

以下に、行の起源となるソーストピックとパーティションを識別するための情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想カラムが必要に応じてマッピングされていることを確認する必要があります。仮想カラムは`_`で始まります。仮想カラムの完全なリストは[こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)で見つけることができます。

仮想カラムを持つテーブルを更新するには、マテリアライズドビューを削除し、Kafkaエンジンテーブルを再接続し、マテリアライズドビューを再作成する必要があります。

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

新しく消費された行にはメタデータが追加されるはずです。

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

##### Kafkaエンジン設定の修正 {#modify-kafka-engine-settings}

Kafkaエンジンテーブルを削除し、新しい設定で再作成することをお勧めします。このプロセス中にマテリアライズドビューを修正する必要はありません - Kafkaエンジンテーブルが再作成されると、メッセージの消費が再開されます。

##### 問題のデバッグ {#debugging-issues}

認証問題などのエラーは、KafkaエンジンDDLへの応答に報告されません。問題を診断するためには、メインのClickHouseログファイルclickhouse-server.err.logを使用することをお勧めします。基礎となるKafkaクライアントライブラリ[librdkafka](https://github.com/edenhill/librdkafka)用のさらなるトレースログは、設定を通じて有効にできます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの処理 {#handling-malformed-messages}

Kafkaはしばしばデータの「ダンプ場」として使用されます。これにより、トピックに混合メッセージ形式や不一致なフィールド名が含まれることがあります。これを避け、Kafka StreamsやksqlDBなどのKafka機能を利用して、Kafkaへの挿入前にメッセージが適切に形成され、一貫していることを確認してください。これらのオプションが不可能な場合、ClickHouseには役立つ機能がいくつかあります。

* メッセージフィールドを文字列として扱います。必要に応じて、マテリアライズドビューのステートメントでクレンジングおよびキャスティングを行うための関数を使用できます。これは本番レベルのソリューションを表すべきではありませんが、単発の取り込みには助けになるかもしれません。
* トピックからJSONを消費する場合、JSONEachRowフォーマットを使用し、設定[`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields)を使用します。データを書き込む際、デフォルトでは、ClickHouseは入力データにターゲットテーブルに存在しないカラムが含まれていると例外をスローします。ただし、このオプションが有効になっている場合、これらの余分なカラムは無視されます。これもまた、本番レベルのソリューションではなく、他の人を混乱させるかもしれません。
* 設定`kafka_skip_broken_messages`を検討してください。これは、不正なメッセージに対してブロックごとに許容されるレベルを指定する必要があり、kafka_max_block_sizeの文脈で考慮されます。この許容レベルを超えた場合（絶対メッセージ数で測定されます）、通常の例外動作が元に戻り、他のメッセージがスキップされます。

##### 配信セマンティクスと重複の課題 {#delivery-semantics-and-challenges-with-duplicates}

Kafkaテーブルエンジンは少なくとも一度のセマンティクスを持ちます。重複は既知の稀な状況で発生する可能性があります。たとえば、メッセージがKafkaから読み取られ、ClickHouseに正常に挿入される可能性があります。新しいオフセットをコミットする前に、Kafkaへの接続が失われます。この状況ではブロックを再試行する必要があります。このブロックは[レプリケーション](https://engines/table-engines/mergetree-family/replication)を使用して、分散テーブルまたはReplicatedMergeTreeをターゲットテーブルとして重複を除去することができます。この方法は重複した行の可能性を減少させますが、同一のブロックに依存します。Kafkaのリバランスなどの事象はこの仮定を無効にし、稀な状況で重複を引き起こす可能性があります。

##### クォーラムベースの挿入 {#quorum-based-inserts}

ClickHouseでより高い配信保証が必要な場合は、[クォーラムベースの挿入](/operations/settings/settings#insert_quorum)が必要です。これはマテリアライズドビューやターゲットテーブルで設定することはできません。ただし、ユーザープロファイルに対して設定することは可能です。

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouseからKafka {#clickhouse-to-kafka}

稀なユースケースですが、ClickHouseデータもKafkaに永続化できます。たとえば、Kafkaテーブルエンジンに手動で行を挿入します。このデータは、同じKafkaエンジンによって読み取られ、マテリアライズドビューがMerge Treeテーブルにデータを配置します。最後に、既存のソーステーブルからテーブルを読み取るための挿入に関連するマテリアライズドビューの適用を示します。

#### 手順 {#steps-1}

私たちの初期目的は次のように最もよく示されています：

<Image img={kafka_02} size="lg" alt="挿入付きKafkaテーブルエンジンダイアグラム" />

KafkaからClickHouseへの手順の下で、テーブルやビューを作成しており、トピックが完全に消費されたと仮定します。

##### 1. 行を直接挿入する {#1-inserting-rows-directly}

まず、ターゲットテーブルのカウントを確認します。

```sql
SELECT count() FROM github;
```

200,000行あるはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHubターゲットテーブルからKafkaテーブルエンジン`github_queue`に行を挿入します。JSONEachRowフォーマットを使用し、選択を100に制限していることに注意してください。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHubでの行を再カウントし、100増加したことを確認してください。上記のダイアグラムで示されているように、行はKafkaテーブルエンジンを介してKafkaに挿入され、その後同じエンジンによって再読され、GitHubターゲットテーブルにマテリアライズドビューによって挿入されます！

```sql
SELECT count() FROM github;
```

100行の追加を確認する必要があります：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューを使用する {#2-using-materialized-views}

マテリアライズドビューを利用して、文書がテーブルに挿入されたときにメッセージをKafkaエンジン（およびトピック）にプッシュできます。GitHubテーブルに行が挿入されると、マテリアライズドビューがトリガーされ、その結果、行が新しいトピックへのKafkaエンジンに再び挿入されます。これもまた最もよく示されています。

<Image img={kafka_03} size="lg" alt="マテリアライズドビューを持つKafkaテーブルエンジンダイアグラム"/>

新しいKafkaトピック`github_out`またはそれに相当するものを作成します。このトピックを指すKafkaテーブルエンジン`github_out_queue`を確保します。

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

次に、`github_out_mv`という新しいマテリアライズドビューを作成し、GitHubテーブルを指し、そのトリガー時に上記のエンジンに行を挿入します。GitHubテーブルへの追加は、その結果、新しいKafkaトピックにプッシュされます。

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

元のgithubトピック（[KafkaからClickHouse](#kafka-to-clickhouse)の一部として作成）に挿入すると、ドキュメントが「github_clickhouse」トピックに魔法のように現れます。これはネイティブのKafkaツールで確認してください。たとえば、以下のように、Confluent Cloudがホストするトピックに100行をgithubトピックに挿入します：

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

`github_out`トピックでの読み込みがメッセージの配信を確認するはずです。

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

これは複雑な例ですが、Kafkaエンジンと共に使用する場合のマテリアライズドビューの力を示しています。

### クラスタとパフォーマンス {#clusters-and-performance}

#### ClickHouseクラスタで作業する {#working-with-clickhouse-clusters}

Kafkaの消費者グループを通じて、複数のClickHouseインスタンスが同じトピックから消費する可能性があります。それぞれの消費者は、1:1のマッピングでトピックパーティションに割り当てられます。Kafkaテーブルエンジンを使用してClickHouseの消費をスケーリングする際には、クラスタ内の消費者の合計数がトピックのパーティション数を超えないことを考慮してください。そのため、トピックのためにパーティションが適切に設定されていることを事前に確認してください。

複数のClickHouseインスタンスは、同じ消費者グループIDを使用してトピックから読み取るように構成できます - これはKafkaテーブルエンジン作成時に指定されます。したがって、各インスタンスは1つ以上のパーティションから読み取り、自分のローカルターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複を扱うためにReplicatedMergeTreeを使用するように構成することもできます。このアプローチにより、十分なKafkaパーティションがあればKafkaの読み取りをClickHouseクラスタとともにスケーリングすることができます。

<Image img={kafka_04} size="lg" alt="ClickHouseクラスタとのKafkaテーブルエンジンダイアグラム"/>

#### パフォーマンスの調整 {#tuning-performance}

Kafka Engineテーブルのスループットパフォーマンスを向上させる際に考慮すべき事項を以下に示します：

* パフォーマンスはメッセージのサイズ、フォーマット、ターゲットテーブルタイプによって異なります。単一のテーブルエンジンで100k行/秒を達成することは obtainable（達成可能）と見なすべきです。デフォルトでは、メッセージはkafka_max_block_sizeパラメータによって制御されるブロックで読み取られます。デフォルトでは、これは[default_insert_block_size](/operations/settings/settings#max_insert_block_size)に設定され、デフォルトは1,048,576です。メッセージが非常に大きくない限り、通常これは増やすべきです。500kから1Mの間の値は珍しくありません。テストしてスループットパフォーマンスへの影響を評価してください。
* テーブルエンジンの消費者数はkafka_num_consumersを使用して増加させることができます。ただし、デフォルトでは、挿入は単一スレッドで直線化されるため、kafka_thread_per_consumerをデフォルト値の1から変更する必要があります。これを1に設定することで、フラッシュが並行して実行されることを保証します。N消費者でKafkaエンジンテーブルを作成すること（およびkafka_thread_per_consumer=1）は、N個のKafkaエンジンを作成するのと論理的に同等であり、それぞれにマテリアライズドビューとkafka_thread_per_consumer=0があります。
* 消費者を増やすことは自由な操作ではありません。各消費者は独自のバッファとスレッドを維持し、サーバーのオーバーヘッドを増加させます。消費者のオーバーヘッドに注意し、最初にクラスタ全体で線形にスケーリングし、可能であれば。
* Kafkaメッセージのスループットが変動し、遅延が許容できる場合、より大きなブロックがフラッシュされるようにstream_flush_interval_msを増加させることを検討してください。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)は、バックグラウンドタスクを実行するスレッドの数を設定します。これらのスレッドはKafkaストリーミングに使用されます。この設定はClickHouseサーバーの起動時に適用され、ユーザーセッション内では変更できず、デフォルトは16です。ログにタイムアウトが見られる場合、これを増加させることが適切かもしれません。
* Kafkaとの通信には、librdkafkaライブラリが使用され、それ自体がスレッドを作成します。大量のKafkaテーブルや消費者が存在する場合、大量のコンテキストスイッチが発生する可能性があります。この負荷をクラスタに分散させるか、可能であればターゲットテーブルを複製することを検討するか、複数のトピックから読み取るテーブルエンジンの使用を検討します - 値のリストがサポートされています。単一のテーブルから複数のマテリアライズドビューを読み取り、それぞれが特定のトピックのデータをフィルタリングできます。

設定の変更はテストする必要があります。適切にスケーラブルであることを確認するために、Kafka消費者のラグを監視することをお勧めします。

#### 追加設定 {#additional-settings}

上記で議論された設定に加えて、以下が関心を持たれる可能性があります：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - 再試行前にKafkaからメッセージを読み取るための待機時間（ミリ秒単位）。ユーザープロファイルレベルで設定され、デフォルトは5000です。

基礎となるlibrdkafkaからの[すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)も、ClickHouseの設定ファイル内の_kafka_要素に配置できます - 設定名はXML要素であり、ドットをアンダースコアに置き換えます。 

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらは専門的な設定であり、詳細な説明についてはKafkaのドキュメントを参照することをお勧めします。
