---
sidebar_label: 'Kafka テーブルエンジン'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Kafka テーブルエンジンの使用'
title: 'Kafka テーブルエンジンの使用'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';


# Kafka テーブルエンジンの使用

<CloudNotSupportedBadge/>

:::note
Kafka テーブルエンジンは [ClickHouse Cloud](https://clickhouse.com/cloud) ではサポートされていません。代わりに [ClickPipes](../clickpipes/kafka.md) または [Kafka Connect](./kafka-clickhouse-connect-sink.md) を検討してください。
:::

### Kafka から ClickHouse へ {#kafka-to-clickhouse}

Kafka テーブルエンジンを使用するには、[ClickHouse のマテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)にある程度精通している必要があります。

#### 概要 {#overview}

最初に、最も一般的な使用例に焦点を当てます：Kafka テーブルエンジンを使用して Kafka から ClickHouse にデータを挿入します。

Kafka テーブルエンジンは ClickHouse が Kafka トピックから直接読み取ることを可能にします。トピック上のメッセージを表示するのに便利ですが、このエンジンは設計上、一度限りの取得のみを許可します。すなわち、テーブルに対してクエリが発行されると、キューからデータを消費し、結果を呼び出し元に返す前にコンシューマオフセットを増加させます。実際には、これらのオフセットをリセットしない限り、データを再読することはできません。

テーブルエンジンの読み取りからこのデータを永続化するには、データをキャプチャして別のテーブルに挿入する手段が必要です。トリガーベースのマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューはテーブルエンジンの読み取りを開始し、一括ドキュメントを受信します。TO 句はデータの宛先を決定します - 通常は[Merge Tree ファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルです。このプロセスは以下のように可視化されます：

<Image img={kafka_01} size="lg" alt="Kafka テーブルエンジンのアーキテクチャ図" style={{width: '80%'}} />

#### ステップ {#steps}


##### 1. 準備 {#1-prepare}

ターゲットトピックにデータが投入されている場合、以下の手順をあなたのデータセットに合わせて適応できます。もしくは、サンプルの GitHub データセットが [こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson) に提供されています。このデータセットは以下の例で使用され、完全なデータセット [こちら](https://ghe.clickhouse.tech/) に対して、スキーマと行のサブセットが限られています（特に、[ClickHouse レポジトリ](https://github.com/ClickHouse/ClickHouse) に関する GitHub イベントに限られています）が、簡潔さのために十分です。これは、データセットとともに公開されているほとんどのクエリが動作するのに十分です。


##### 2. ClickHouse を設定する {#2-configure-clickhouse}

これは、セキュアな Kafka に接続する場合に必要です。これらの設定は SQL DDL コマンドを通じて渡すことができず、ClickHouseの config.xml で設定する必要があります。ここでは、SASL で保護されたインスタンスに接続することを前提としています。これは Confluent Cloud とやり取りする際の最も簡単な方法です。

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

上記のスニペットを conf.d/ ディレクトリ内の新しいファイルに配置するか、既存の設定ファイルにマージしてください。設定可能な設定については、[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)を参照してください。

また、このチュートリアルで使用するために `KafkaEngine` というデータベースを作成します：

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、そのデータベースに切り替える必要があります：

```sql
USE KafkaEngine;
```

##### 3. 目的のテーブルを作成する {#3-create-the-destination-table}

目的のテーブルを準備します。以下の例では、簡潔さのために減少した GitHub スキーマを使用しています。MergeTree テーブルエンジンを使用しますが、この例は[MergeTree ファミリー](../../../engines/table-engines/mergetree-family/index.md)のいかなるメンバーにも容易に適応できます。

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

##### 4. トピックを作成してデータを追加する {#4-create-and-populate-the-topic}

次に、トピックを作成します。これを行うために使用できるツールはいくつかあります。ローカルのマシンや Docker コンテナ内で Kafka を実行している場合は、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) がうまく機能します。次のコマンドを実行して、5つのパーティションを持つ `github` というトピックを作成します：

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent Cloud で Kafka を実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records) を使用することを好むかもしれません：

```bash
confluent kafka topic create --if-not-exists github
```

このトピックにデータを追加する必要があります。これを行うには、[kcat](https://github.com/edenhill/kcat)を使用します。認証が無効なローカル Kafka を実行している場合、次のようなコマンドを実行できます：

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

SASL を使用して認証する Kafka クラスターの場合は、次のコマンドを実行します：

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

データセットには200,000 行が含まれており、数秒で取り込まれるはずです。より大きなデータセットを扱いたい場合は、[ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) GitHub リポジトリの [大規模データセットセクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) をご覧ください。

##### 5. Kafka テーブルエンジンを作成する {#5-create-the-kafka-table-engine}

以下の例では、マージツリーテーブルと同じスキーマを持つテーブルエンジンを作成します。これは厳密には必要ありませんが、ターゲットテーブルにエイリアスや一時的なカラムを持つことができます。ただし、設定は重要です。Kafka トピックから JSON を消費するためのデータ型として `JSONEachRow` の使用に注意してください。値 `github` と `clickhouse` は、それぞれトピック名とコンシューマグループ名を表します。トピックは実際には値のリストであることができます。

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


エンジンの設定やパフォーマンスチューニングについては以下で説明します。この時点で、テーブル `github_queue` に対する単純な選択を行うことでいくつかの行を読み取るべきです。これにより消費者オフセットが前進し、これらの行が再読されないようになります。`stream_like_engine_allow_direct_select.` の制限と必要なパラメータに注意してください。

##### 6. マテリアライズドビューを作成する {#6-create-the-materialized-view}

マテリアライズドビューは、以前に作成した2つのテーブルを接続し、Kafka テーブルエンジンからデータを読み取り、ターゲットのマージツリーテーブルに挿入します。さまざまなデータ変換を行うことができます。単純な読み取りと挿入を行います。* の使用により、カラム名が同じであることを前提としています（大文字と小文字を区別します）。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

作成時に、マテリアライズドビューは Kafka エンジンに接続し、読み取りを開始し、ターゲットテーブルに行を挿入します。このプロセスは無限に続き、Kafka に新しいメッセージが挿入されると消費されます。お好きなタイミングで挿入スクリプトを再実行し、Kafka にさらにメッセージを挿入してください。

##### 7. 行が挿入されたことを確認する {#7-confirm-rows-have-been-inserted}

ターゲットテーブルにデータが存在することを確認します：

```sql
SELECT count() FROM github;
```

200,000 行が表示されるはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 一般的な操作 {#common-operations}

##### メッセージ消費の停止と再開 {#stopping--restarting-message-consumption}

メッセージ消費を停止するには、Kafka エンジンテーブルをデタッチします：

```sql
DETACH TABLE github_queue;
```

これにより、コンシューマグループのオフセットには影響を与えません。消費を再開し、前のオフセットから続行するには、テーブルを再アタッチします。

```sql
ATTACH TABLE github_queue;
```

##### Kafka メタデータの追加 {#adding-kafka-metadata}

ClickHouse に取り込まれた後、元の Kafka メッセージからのメタデータを追跡することは有用です。例えば、特定のトピックやパーティションからどれだけ消費したかを知りたいかもしれません。この目的のために、Kafka テーブルエンジンは複数の[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を公開しています。これらは、スキーマやマテリアライズドビューの選択ステートメントを変更することで、ターゲットテーブルのカラムとして永続化できます。

まず、対象のテーブルにカラムを追加する前に、上記で説明した停止操作を実行します。

```sql
DETACH TABLE github_queue;
```

以下に、ソーストピックと行が由来するパーティションを識別する情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、仮想カラムが必要なようにマッピングされていることを確認する必要があります。
仮想カラムは `_` でプレフィックスされます。
仮想カラムの完全なリストは [こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)にあります。

仮想カラムでテーブルを更新するには、マテリアライズドビューを削除し、Kafka エンジンテーブルを再アタッチし、マテリアライズドビューを再作成する必要があります。

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

新たに消費された行にはメタデータが含まれるはずです。

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

Kafka エンジンテーブルを削除し、新しい設定で再作成することをお勧めします。このプロセス中、マテリアライズドビューを変更する必要はありません - Kafka エンジンテーブルを再作成すると、メッセージ消費が再開されます。

##### 問題のデバッグ {#debugging-issues}

認証の問題などのエラーは、Kafka エンジンの DDL のレスポンスには報告されません。問題の診断には、ClickHouse のメインのログファイル clickhouse-server.err.log を使用することを推奨します。基盤となる Kafka クライアントライブラリ [librdkafka](https://github.com/edenhill/librdkafka) に関するさらなるトレースログは、設定を通じて有効化できます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの処理 {#handling-malformed-messages}

Kafka はデータの「ダンプ場」としてよく使用されます。これにより、トピックに混在したメッセージ形式や不一致なフィールド名が含まれることがあります。これを避けるために、Kafka Streams や ksqlDB などの機能を利用して、メッセージが整形され、一貫性を持つことを保証してから Kafka に挿入してください。これらのオプションが不可能な場合、ClickHouse には役立つ機能があります。

* メッセージフィールドを文字列として扱います。必要に応じて、マテリアライズドビューのステートメントでクリーニングやキャスティングを行う関数を使用できます。これは本番のソリューションを表すべきではありませんが、一時的な取り込みに役立つかもしれません。
* トピックから JSON を消費している場合、JSONEachRow 形式を使用しているときは、設定 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields) を使用します。データを書き込むとき、デフォルトでは、ClickHouse は入力データにターゲットテーブルに存在しないカラムが含まれている場合、例外をスローします。しかし、このオプションが有効になっている場合、これらの過剰なカラムは無視されます。これも本番レベルのソリューションではなく、他の人を混乱させる可能性があります。
* 設定 `kafka_skip_broken_messages` の検討をお勧めします。これは、ユーザーが不正なメッセージのブロックあたりの耐性レベルを指定することを求めます。これは kafka_max_block_size に関連して考慮されます。この耐性を超えると（絶対的なメッセージ数で測定）、通常の例外動作に戻り、他のメッセージはスキップされます。

##### 配信のセマンティクスと重複に関する課題 {#delivery-semantics-and-challenges-with-duplicates}

Kafka テーブルエンジンには、少なくとも一度のセマンティクスがあります。重複は、いくつかの知られた稀な状況で発生する可能性があります。例えば、Kafka からメッセージを読み取って ClickHouse に正常に挿入された場合、新しいオフセットをコミットできる前に Kafka との接続が失われました。この状況では、ブロックの再試行が必要です。このブロックは、[分散テーブル](https://clickhouse.tech/docs/en/engines/table-engines/mergetree-family/replication)または ReplicatedMergeTree をターゲットテーブルとして使用して非重複化できます。この方法は、重複行の可能性を減らしますが、同じブロックに依存します。Kafka のリバランシングなどのイベントは、この仮定を無効にし、稀な状況で重複を引き起こす可能性があります。

##### クォーラムベースの挿入 {#quorum-based-inserts}

ClickHouse で高い配信保証が必要な場合は、[クォーラムベースの挿入](/operations/settings/settings#insert_quorum)が必要になることがあります。これは、マテリアライズドビューやターゲットテーブルでは設定できません。ただし、ユーザープロファイルに対して設定できます：

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse から Kafka へ {#clickhouse-to-kafka}

使用例は少ないですが、ClickHouse データを Kafka に永続化することも可能です。例えば、Kafka テーブルエンジンに手動で行を挿入します。このデータは、同じ Kafka エンジンによって読み取られ、そのマテリアライズドビューがデータを Merge Tree テーブルに配置します。最後に、既存のソーステーブルからテーブルを読み取るために、マテリアライズドビューを Kafka に挿入する際のアプリケーションを示します。

#### ステップ {#steps-1}

私たちの最初の目的は、次のように示されています：

<Image img={kafka_02} size="lg" alt="挿入を伴う Kafka テーブルエンジンの図" />

Kafka から ClickHouse へのステップで作成されたテーブルとビューがあることを前提とし、トピックが完全に消費されていることを確認します。


##### 1. 行を直接挿入する {#1-inserting-rows-directly}

まず、ターゲットテーブルのカウントを確認します。

```sql
SELECT count() FROM github;
```

200,000 行を持っているはずです：
```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHub ターゲットテーブルから Kafka テーブルエンジンの `github_queue` に行を挿入します。JSONEachRow 形式を利用し、選択を 100 に制限することに注意してください。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHub で行の再カウントを行って、100 増えたことを確認します。上の図に示されているように、行が Kafka テーブルエンジンを経由して Kafka に挿入された後、同じエンジンによって再読され、GitHub ターゲットテーブルに挿入されます！

```sql
SELECT count() FROM github;
```

追加で 100 行を確認できるはずです：
```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューを使用する {#2-using-materialized-views}

マテリアライズドビューを使用して、何らかの文書がテーブルに挿入されたときに Kafka エンジン（およびトピック）にメッセージをプッシュできます。GitHub テーブルに行が挿入されると、マテリアライズドビューがトリガーされるため、行は Kafka エンジンに再び挿入され、新しいトピックに配信されます。これも最もよく示されています：

<Image img={kafka_03} size="lg" alt="マテリアライズドビューを使用した Kafka テーブルエンジンの図"/>

新しい Kafka トピック `github_out` を作成します。Kafka テーブルエンジン `github_out_queue` がこのトピックを指すことを確認します。

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

次に、`github_out_mv` という新しいマテリアライズドビューを GitHub テーブルに向けて作成します。これにより、行が挿入されると、上記のエンジンに挿入されます。GitHub テーブルへの追加は、結果として新しい Kafka トピックにプッシュされます。

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

もし元の github トピックに挿入が行われると、[Kafka から ClickHouse への](#kafka-to-clickhouse)の一部として作成されたドキュメントが「github_clickhouse」トピックに自動的に表示されます。これを確認するには、ネイティブな Kafka ツールを使用します。例えば、次のようにして [kcat](https://github.com/edenhill/kcat) を使用して、Confluent Cloud ホストされているトピックに 100 行を挿入します：

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

`github_out` トピックを読み取ると、メッセージの配信を確認できます。

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

この詳細な例は、Kafka エンジンと連携したマテリアライズドビューの力を示しています。

### クラスターとパフォーマンス {#clusters-and-performance}

#### ClickHouse クラスターとの作業 {#working-with-clickhouse-clusters}

Kafka コンシューマグループを介して、複数の ClickHouse インスタンスが同じトピックから読み取ることができます。各コンシューマにはトピックのパーティションが1:1で割り当てられます。Kafka テーブルエンジンを使用して ClickHouse 消費をスケールする場合、クラスター内のコンシューマの合計数はトピックのパーティション数を超えることはできません。したがって、トピックのパーティショニングが事前に適切に構成されていることを確認してください。

複数の ClickHouse インスタンスは、同じコンシューマグループ ID を使用してトピックから読み取るように構成できます - Kafka テーブルエンジンの作成中に指定されます。したがって、各インスタンスは1つ以上のパーティションから読み取って、ローカルのターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複を処理するために ReplicatedMergeTree を使用するように構成することができます。このアプローチにより、十分な Kafka パーティションがある限り、ClickHouse クラスターと Kafka 読み取りのスケールを同時に行うことができます。

<Image img={kafka_04} size="lg" alt="ClickHouse クラスターと Kafka テーブルエンジンの図" />

#### パフォーマンスのチューニング {#tuning-performance}

Kafka エンジンテーブルのスループットパフォーマンスを向上させるには、次のような点を考慮してください：

* パフォーマンスは、メッセージサイズ、フォーマット、ターゲットテーブルタイプによって異なります。単一のテーブルエンジンでの 100k 行/秒は、達成可能な数値と見なすべきです。デフォルトでは、メッセージはブロックで読み取られ、パラメータ kafka_max_block_size によって制御されます。デフォルト値は [max_insert_block_size](/operations/settings/settings#max_insert_block_size) に設定されており、1,048,576 にデフォルト設定されています。メッセージが非常に大きくない限り、ほぼ常に増加されるべきです。500k から 1M の値は珍しくありません。テストしてスループットパフォーマンスへの影響を評価してください。
* テーブルエンジンに対するコンシューマの数は、kafka_num_consumers を使用して増加させることができます。ただし、デフォルトでは、挿入は単一スレッドで線形化され、kafka_thread_per_consumer のデフォルト値は 1 です。これを 1 に設定すると、フラッシュが並行して行われることを保証します。N コンシューマを持つ Kafka エンジンテーブルを作成することは（そして kafka_thread_per_consumer=1）、機能的には N の Kafka エンジンを作成することに等しいことに注意してください。各々がマテリアライズドビューを持ち、kafka_thread_per_consumer=0 です。
* コンシューマの数の増加は無償の操作ではありません。各コンシューマは独自のバッファとスレッドを維持し、サーバー上のオーバーヘッドを増加させます。コンシューマのオーバーヘッドに注意し、最初にクラスターで線形にスケールするようにしてください、可能であれば。
* Kafka メッセージのスループットが変動する場合かつ遅延が許容できる場合、ストリームフラッシュ間隔を増加させ、大きなブロックがフラッシュされることを確認することを検討してください。
* [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) は、バックグラウンドタスクを実行するスレッドの数を設定します。これらのスレッドは Kafka ストリーミングに使用されます。この設定は ClickHouse サーバーの起動時に適用され、ユーザーセッションで変更することはできません。デフォルトは 16 に設定されています。ログにタイムアウトが表示される場合は、これを増加させることが適切な場合があります。
* Kafka との通信には librdkafka ライブラリが使用され、これはスレッドを作成します。大量の Kafka テーブル、またはコンシューマを使用すると、文脈スイッチが大きくなります。この負荷をクラスター全体に分散させるか、ターゲットテーブルを繰り返す場合を除き、テーブルエンジンを使用して複数のトピックから読み取ることを検討してください - 値のリストがサポートされています。単一のテーブルから複数のマテリアライズドビューを読み取ることができ、それぞれ特定のトピックからのデータに対してフィルタリングします。

設定変更はテストされるべきです。適切にスケールされていることを確認するために、Kafka コンシューマの遅延を監視することをお勧めします。

#### 追加設定 {#additional-settings}

上記で説明した設定に加えて、以下に関心を持つ可能性のある項目があります：

* [Kafka_max_wait_ms](/operations/settings/settings#kafka_max_wait_ms) - リトライ前に Kafka からメッセージを読み取るための待機時間（ミリ秒単位）。ユーザープロファイルレベルで設定し、デフォルトは 5000 です。

基盤となる librdkafka からの[すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)は、ClickHouse 設定ファイル内の _kafka_ 要素に配置されることもできます - 設定名は XML 要素で、ピリオドをアンダースコアに置き換えなければなりません：

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらは専門的な設定であり、詳しい説明については Kafka ドキュメントを参照することをお勧めします。
