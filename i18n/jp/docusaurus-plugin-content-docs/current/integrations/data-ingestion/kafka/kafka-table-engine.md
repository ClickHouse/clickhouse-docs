---
sidebar_label: 'Kafka テーブルエンジン'
sidebar_position: 5
slug: /integrations/kafka/kafka-table-engine
description: 'Kafka テーブルエンジンの使用'
title: 'Kafka テーブルエンジンの使用'
doc_type: 'ガイド'
keywords: ['kafka', 'table engine', 'streaming', 'real-time', 'message queue']
---

import Image from '@theme/IdealImage';
import kafka_01 from '@site/static/images/integrations/data-ingestion/kafka/kafka_01.png';
import kafka_02 from '@site/static/images/integrations/data-ingestion/kafka/kafka_02.png';
import kafka_03 from '@site/static/images/integrations/data-ingestion/kafka/kafka_03.png';
import kafka_04 from '@site/static/images/integrations/data-ingestion/kafka/kafka_04.png';

# Kafka テーブルエンジンの使用 \\{#using-the-kafka-table-engine\\}

Kafka テーブルエンジンは、Apache Kafka およびその他の Kafka API 互換ブローカー（例: Redpanda、Amazon MSK）から[**データを読み取る**](#kafka-to-clickhouse)、および[**データを書き込む**](#clickhouse-to-kafka)ために使用できます。

### Kafka から ClickHouse へ \\{#kafka-to-clickhouse\\}

:::note
ClickHouse Cloud をご利用の場合は、代わりに [ClickPipes](/integrations/clickpipes) の使用を推奨します。ClickPipes は、プライベートネットワーク接続をネイティブにサポートし、インジェスト処理とクラスターリソースをそれぞれ独立してスケールでき、Kafka ストリーミングデータを ClickHouse に取り込むための包括的なモニタリングも提供します。
:::

Kafka テーブルエンジンを使用するには、[ClickHouse マテリアライズドビュー](../../../guides/developer/cascading-materialized-views.md)の基本的な仕組みに精通している必要があります。

#### 概要 \\{#overview\\}

まずは最も一般的なユースケース、つまり Kafka テーブルエンジンを使用して Kafka から ClickHouse にデータを挿入するケースに焦点を当てます。

Kafka テーブルエンジンにより、ClickHouse は Kafka トピックから直接読み取ることができます。トピック上のメッセージを表示する用途には有用ですが、このエンジンの設計上、取得は一度きりしか許可されません。すなわち、テーブルに対してクエリが発行されると、キューからデータを消費し、結果を呼び出し元に返す前にコンシューマオフセットを進めます。これらのオフセットをリセットしない限り、データを再度読み込むことは実質的にできません。

テーブルエンジンから読み取ったデータを永続化するには、データを取り込み、別のテーブルに挿入する手段が必要です。トリガーベースのマテリアライズドビューは、この機能をネイティブに提供します。マテリアライズドビューはテーブルエンジンに対して読み取りを開始し、ドキュメントのバッチを受信します。`TO` 句はデータの宛先を決定し、通常は [Merge Tree ファミリー](../../../engines/table-engines/mergetree-family/index.md)のテーブルになります。このプロセスは次の図のように示されています。

<Image img={kafka_01} size="lg" alt="Kafka テーブルエンジンのアーキテクチャ図" style={{width: '80%'}} />

#### 手順 \\{#steps\\}

##### 1. 準備 \\{#1-prepare\\}

対象のトピックにデータが入っている場合は、以下を自分のデータセット用に調整して利用できます。あるいは、サンプルの GitHub データセットが[こちら](https://datasets-documentation.s3.eu-west-3.amazonaws.com/kafka/github_all_columns.ndjson)に用意されています。このデータセットは以下の例で使用しており、スキーマを簡略化し、行もサブセットのみを使用しています（具体的には、[ClickHouse リポジトリ](https://github.com/ClickHouse/ClickHouse) に関する GitHub イベントに限定しています）。完全なデータセットは[こちら](https://ghe.clickhouse.tech/)から入手できますが、簡潔さのために縮小版を使用しています。それでも、このデータセットと共に[公開されているクエリ](https://ghe.clickhouse.tech/)のほとんどを実行するには十分です。

##### 2. ClickHouse の設定 \\{#2-configure-clickhouse\\}

セキュアな Kafka に接続する場合、この手順が必要です。これらの設定は SQL の DDL コマンドで渡すことはできず、ClickHouse の config.xml で設定する必要があります。ここでは、SASL で保護されたインスタンスに接続していることを前提とします。これは Confluent Cloud と連携する際に最も簡単な方法です。

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

上記のスニペットを conf.d/ ディレクトリ配下の新しいファイルに配置するか、既存の設定ファイルにマージしてください。設定可能なパラメータについては[こちら](../../../engines/table-engines/integrations/kafka.md#configuration)を参照してください。

このチュートリアルで使用するために、`KafkaEngine` という名前のデータベースも作成します。

```sql
CREATE DATABASE KafkaEngine;
```

データベースを作成したら、作成したデータベースに切り替えます。

```sql
USE KafkaEngine;
```

##### 3. 宛先テーブルを作成する \\{#3-create-the-destination-table\\}

宛先テーブルを準備します。以下の例では、説明を簡潔にするために簡略化した GitHub スキーマを使用しています。MergeTree テーブルエンジンを使用していますが、この例は [MergeTree family](../../../engines/table-engines/mergetree-family/index.md) に属する任意のメンバーに容易に適用できます。

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

##### 4. トピックを作成してデータを投入する \\{#4-create-and-populate-the-topic\\}

次に、トピックを作成します。これを行うために使えるツールはいくつかあります。自分のマシン上でローカルに、または Docker コンテナ内で Kafka を実行している場合は、[RPK](https://docs.redpanda.com/current/get-started/rpk-install/) が便利です。次のコマンドを実行すると、`github` という名前でパーティション数 5 のトピックを作成できます。

```bash
rpk topic create -p 5 github --brokers <host>:<port>
```

Confluent Cloud 上で Kafka を実行している場合は、[Confluent CLI](https://docs.confluent.io/platform/current/tutorials/examples/clients/docs/kcat.html#produce-records) を使うのがよいかもしれません：

```bash
confluent kafka topic create --if-not-exists github
```

次に、このトピックにデータを投入する必要があります。これには [kcat](https://github.com/edenhill/kcat) を使用します。認証を無効にした状態でローカルで Kafka を実行している場合は、次のようなコマンドを実行できます。

```bash
cat github_all_columns.ndjson |
kcat -P \
  -b <host>:<port> \
  -t github
```

または、Kafka クラスターで認証に SASL を使用している場合は、次の設定を使用します：

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

このデータセットは 200,000 行を含んでいるため、取り込みには数秒しかかからないはずです。より大きなデータセットを扱いたい場合は、GitHub リポジトリ [ClickHouse/kafka-samples](https://github.com/ClickHouse/kafka-samples) の [large datasets セクション](https://github.com/ClickHouse/kafka-samples/tree/main/producer#large-datasets) を参照してください。

##### 5. Kafka テーブルエンジンを作成する \\{#5-create-the-kafka-table-engine\\}

次の例では、MergeTree テーブルと同じスキーマを持つテーブルエンジンを作成します。これは必須ではなく、ターゲットテーブル側でエイリアス列や一時的な列を持つことも可能です。ただし設定は重要です。Kafka トピックから JSON を消費するためのデータ形式として `JSONEachRow` を使用している点に注意してください。`github` と `clickhouse` の値は、それぞれトピック名とコンシューマグループ名を表します。トピックは実際には値のリストを指定することもできます。

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

以下でエンジン設定とパフォーマンスチューニングについて説明します。この時点で、テーブル `github_queue` に対する単純な select により、いくつかの行が読み取れるはずです。なお、これによりコンシューマーのオフセットが進むため、[リセット](#common-operations) を行わない限り、これらの行を再度読み取ることはできなくなります。limit 句と、必須パラメータである `stream_like_engine_allow_direct_select` に注意してください。

##### 6. マテリアライズドビューを作成する \\{#6-create-the-materialized-view\\}

マテリアライズドビューは、先ほど作成した 2 つのテーブルを接続し、Kafka テーブルエンジンからデータを読み取り、ターゲットの MergeTree テーブルに挿入します。さまざまなデータ変換が可能ですが、この例では単純な読み取りと挿入のみを行います。`*` を使用する場合、列名が同一であること（大文字・小文字を区別）が前提となります。

```sql
CREATE MATERIALIZED VIEW github_mv TO github AS
SELECT *
FROM github_queue;
```

マテリアライズドビューは作成時点で Kafka エンジンに接続し、ターゲットテーブルへの行の挿入を開始します。この処理は無期限に継続され、以降に Kafka に挿入されたメッセージも順次消費されます。Kafka にさらにメッセージを挿入するには、挿入スクリプトを再実行してかまいません。

##### 7. 行が挿入されたことを確認する \\{#7-confirm-rows-have-been-inserted\\}

ターゲットテーブルにデータが存在することを確認します。

```sql
SELECT count() FROM github;
```

20万行が表示されているはずです。

```response
┌─count()─┐
│  200000 │
└─────────┘
```

#### 一般的な操作 \\{#common-operations\\}

##### メッセージ消費の停止と再開 \\{#stopping--restarting-message-consumption\\}

メッセージの消費を停止するには、Kafka エンジンテーブルをデタッチします。

```sql
DETACH TABLE github_queue;
```

これはコンシューマーグループのオフセットには影響しません。読み取りを再開し、前回のオフセットから処理を続けるには、テーブルを再アタッチしてください。

```sql
ATTACH TABLE github_queue;
```

##### Kafka メタデータの追加 \\{#adding-kafka-metadata\\}

元の Kafka メッセージが ClickHouse に取り込まれた後も、そのメタデータを保持しておけると便利な場合があります。例えば、特定のトピックやパーティションをどれだけ消費したかを把握したい場合です。この目的のために、Kafka テーブルエンジンはいくつかの[仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)を提供しています。スキーマとマテリアライズドビューの SELECT 文を変更することで、これらをターゲットテーブルのカラムとして永続化できます。

まず、ターゲットテーブルにカラムを追加する前に、上で説明した停止手順を実行します。

```sql
DETACH TABLE github_queue;
```

以下では、行がどのソーストピックおよびどのパーティションから生成されたかを識別するための情報カラムを追加します。

```sql
ALTER TABLE github
   ADD COLUMN topic String,
   ADD COLUMN partition UInt64;
```

次に、バーチャルカラムが要件どおりにマッピングされていることを確認する必要があります。
バーチャルカラムには `_` というプレフィックスが付きます。
バーチャルカラムの完全な一覧は[こちら](../../../engines/table-engines/integrations/kafka.md#virtual-columns)で確認できます。

テーブルをバーチャルカラムに対応させるには、マテリアライズドビューをいったんドロップし、Kafka エンジンテーブルを再アタッチしてから、マテリアライズドビューを再作成する必要があります。

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

新しく取り込まれた行にはメタデータが付与されているはずです。

```sql
SELECT actor_login, event_type, created_at, topic, partition
FROM github
LIMIT 10;
```

結果は次のようになります:

| actor&#95;login | event&#95;type     | created&#95;at      | topic  | partition |
| :-------------- | :----------------- | :------------------ | :----- | :-------- |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:22:00 | github | 0         |
| queeup          | CommitCommentEvent | 2011-02-12 02:23:23 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:23:24 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:24:50 | github | 0         |
| IgorMinar       | CommitCommentEvent | 2011-02-12 02:25:20 | github | 0         |
| dapi            | CommitCommentEvent | 2011-02-12 06:18:36 | github | 0         |
| sourcerebels    | CommitCommentEvent | 2011-02-12 06:34:10 | github | 0         |
| jamierumbelow   | CommitCommentEvent | 2011-02-12 12:21:40 | github | 0         |
| jpn             | CommitCommentEvent | 2011-02-12 12:24:31 | github | 0         |
| Oxonium         | CommitCommentEvent | 2011-02-12 12:31:28 | github | 0         |

##### Kafka エンジン設定の変更 \\{#modify-kafka-engine-settings\\}

Kafka エンジンテーブルを削除し、新しい設定で再作成することを推奨します。この手順の実行中も、マテリアライズドビューを変更する必要はありません。Kafka エンジンテーブルが再作成されると、メッセージの消費は自動的に再開されます。

##### 問題のデバッグ \\{#debugging-issues\\}

認証の問題などのエラーは、Kafka エンジンの DDL に対する応答には報告されません。問題を診断するには、メインの ClickHouse ログファイルである clickhouse-server.err.log を使用することを推奨します。背後で使用されている Kafka クライアントライブラリ [librdkafka](https://github.com/edenhill/librdkafka) の詳細なトレースログは、設定で有効にできます。

```xml
<kafka>
   <debug>all</debug>
</kafka>
```

##### 不正なメッセージの扱い \\{#handling-malformed-messages\\}

Kafka はしばしばデータの「投げ込み先」として利用されます。これにより、1 つのトピック内に異なるメッセージ形式や一貫性のないフィールド名が混在する状況が発生します。これを避けるため、Kafka Streams や ksqlDB などの Kafka の機能を活用し、メッセージが Kafka へ挿入される前に正しい形式かつ一貫した内容になるようにしてください。これらのオプションが利用できない場合でも、ClickHouse には役立つ機能がいくつかあります。

* メッセージフィールドを文字列として扱います。必要に応じて、マテリアライズドビューのステートメント内で関数を使用してクレンジングや型変換を行うことができます。これは本番環境向けの解決策ではありませんが、単発のインジェストに役立つ可能性があります。
* トピックから JSON を `JSONEachRow` 形式で消費している場合は、設定 [`input_format_skip_unknown_fields`](/operations/settings/formats#input_format_skip_unknown_fields) を使用します。データを書き込む際、デフォルトでは ClickHouse は、入力データに対象テーブルに存在しないカラムが含まれていると例外をスローします。しかし、このオプションを有効にすると、これらの余分なカラムは無視されます。ただし、これも本番レベルの解決策ではなく、他の利用者を混乱させる可能性があります。
* 設定 `kafka_skip_broken_messages` の利用を検討してください。これは、不正なメッセージに対するブロックごとの許容レベルを、`kafka_max_block_size` のコンテキストで指定する必要があります。この許容値を超えた場合（メッセージ数で測定）、通常の例外動作に戻り、残りのメッセージはスキップされます。

##### 配信セマンティクスと重複に関する課題 \\{#delivery-semantics-and-challenges-with-duplicates\\}

Kafka テーブルエンジンは at-least-once セマンティクスを持ちます。いくつかの、既知ではあるものの稀な状況では重複が発生する可能性があります。例えば、Kafka からメッセージを読み取り、ClickHouse への挿入に成功したとします。新しいオフセットをコミットする前に Kafka への接続が失われる可能性があります。この状況ではブロックの再試行が必要になります。このブロックは、分散テーブルまたは ReplicatedMergeTree をターゲットテーブルとして利用することで[重複排除](/engines/table-engines/mergetree-family/replication)される場合があります。これは重複行の可能性を減らしますが、同一ブロックであることに依存しています。Kafka のリバランスなどのイベントによりこの前提が成り立たなくなると、稀な状況では重複が発生し得ます。

##### クォーラムベースの挿入 \\{#quorum-based-inserts\\}

ClickHouse でより高い配信保証が必要なケースでは、[クォーラムベースの挿入](/operations/settings/settings#insert_quorum)が必要になることがあります。これはマテリアライズドビューやターゲットテーブルでは設定できませんが、ユーザープロファイルには設定できます。例:

```xml
<profiles>
  <default>
    <insert_quorum>2</insert_quorum>
  </default>
</profiles>
```

### ClickHouse から Kafka へ \\{#clickhouse-to-kafka\\}

あまり一般的ではないユースケースですが、ClickHouse のデータを Kafka に永続化することもできます。例として、Kafka テーブルエンジンに対して行を手動で挿入します。このデータは同じ Kafka エンジンによって読み取られ、そのマテリアライズドビューによって MergeTree テーブルに格納されます。最後に、既存のソーステーブルからテーブルを読み取れるようにするため、Kafka への挿入にマテリアライズドビューを適用する方法を示します。

#### 手順 \\{#steps-1\\}

最初の目的とする構成は、次の図のとおりです。

<Image img={kafka_02} size="lg" alt="Kafka テーブルエンジンへの挿入を示す図" />

[Kafka から ClickHouse](#kafka-to-clickhouse) の手順でテーブルとビューが作成済みであり、トピックが完全に消費されていることを前提とします。

##### 1. 行を直接挿入する \\{#1-inserting-rows-directly\\}

まず、対象テーブルの件数を確認します。

```sql
SELECT count() FROM github;
```

20万行になっているはずです。

```response
┌─count()─┐
│  200000 │
└─────────┘
```

次に、GitHub のターゲットテーブルから行を取得し、Kafka テーブルエンジン `github_queue` に再度挿入します。`JSONEachRow` フォーマットを利用し、`SELECT` に `LIMIT 100` を指定している点に注目してください。

```sql
INSERT INTO github_queue SELECT * FROM github LIMIT 100 FORMAT JSONEachRow
```

GitHub の行数を再度数えて、100 行増えていることを確認します。上の図に示されているように、行はまず Kafka テーブルエンジンを通じて Kafka に挿入され、その後同じエンジンによって再読み取りされ、マテリアライズドビューによって GitHub のターゲットテーブルに挿入されています！

```sql
SELECT count() FROM github;
```

100 行が追加で表示されるはずです：

```response
┌─count()─┐
│  200100 │
└─────────┘
```

##### 2. マテリアライズドビューの使用 \\{#2-using-materialized-views\\}

テーブルにドキュメントが挿入されたときに、メッセージを Kafka エンジン（およびトピック）へ送信するために、マテリアライズドビューを利用できます。GitHub テーブルに行が挿入されると、マテリアライズドビューがトリガーされ、その行が Kafka エンジンおよび新しいトピックに再度挿入されます。これも次の図を見るのが最も分かりやすいでしょう。

<Image img={kafka_03} size="lg" alt="マテリアライズドビューを用いた Kafka テーブルエンジンの図" />

新しい Kafka トピック `github_out`（または同等のもの）を作成します。Kafka テーブルエンジン `github_out_queue` がこのトピックを参照するように設定してください。

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

次に、新しいマテリアライズドビュー `github_out_mv` を作成し、GitHub テーブルをソースとして、トリガー時に上記のエンジンへ行を挿入するようにします。その結果、GitHub テーブルに追加されたデータは、新しい Kafka トピックへ送信されるようになります。

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

[Kafka to ClickHouse](#kafka-to-clickhouse) の一部として作成した元の github トピックにデータを挿入すると、ドキュメントが自動的に「github&#95;clickhouse」トピックに現れます。これは標準の Kafka ツールを使って確認してください。例えば、以下では Confluent Cloud 上でホストされているトピックに対して、[kcat](https://github.com/edenhill/kcat) を使用して github トピックに 100 行を挿入しています。

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

`github_out` トピックを読み出せば、メッセージが配信されたことを確認できるはずです。

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

やや込み入った例ではありますが、Kafka エンジンと組み合わせて使用した場合のマテリアライズドビューの強力さを示しています。

### クラスターとパフォーマンス \\{#clusters-and-performance\\}

#### ClickHouse クラスターの利用 \\{#working-with-clickhouse-clusters\\}

Kafka のコンシューマグループを通じて、複数の ClickHouse インスタンスが同じトピックから読み取ることが可能です。各コンシューマには、トピックパーティションが 1:1 で割り当てられます。Kafka テーブルエンジンを使って ClickHouse によるコンシュームをスケールさせる場合、クラスター内のコンシューマ総数はトピック上のパーティション数を超えられないことに注意してください。そのため、事前にトピックに対して適切なパーティショニング設定を行っておく必要があります。

複数の ClickHouse インスタンスは、同一のコンシューマグループ ID（Kafka テーブルエンジン作成時に指定）を使用して、同じトピックから読み取るようにすべて設定できます。その結果、各インスタンスは 1 つ以上のパーティションから読み取り、自身のローカルのターゲットテーブルにセグメントを挿入します。ターゲットテーブルは、データの重複処理を行うために ReplicatedMergeTree を使用するように設定できます。この方法により、十分な Kafka パーティションが存在する限り、Kafka からの読み取りを ClickHouse クラスターに合わせてスケールさせることができます。

<Image img={kafka_04} size="lg" alt="ClickHouse クラスターを用いた Kafka テーブルエンジンの図" />

#### パフォーマンスチューニング \\{#tuning-performance\\}

Kafka エンジンテーブルのスループットを向上させたい場合、次の点を検討してください。

* 性能はメッセージサイズ、フォーマット、ターゲットテーブルの種類によって変動します。単一のテーブルエンジンで 100k rows/sec（10 万行/秒）程度は達成可能と考えられます。デフォルトでは、メッセージはブロック単位で読み取られ、これはパラメータ kafka&#95;max&#95;block&#95;size によって制御されます。既定では、これは [max&#95;insert&#95;block&#95;size](/operations/settings/settings#max_insert_block_size) に設定されており、デフォルト値は 1,048,576 です。メッセージが極端に大きくない限り、この値はほぼ常に増やすべきです。500k〜1M の範囲の値は珍しくありません。スループットへの影響をテストして評価してください。
* テーブルエンジンのコンシューマ数は kafka&#95;num&#95;consumers で増やすことができます。ただし、デフォルトでは、kafka&#95;thread&#95;per&#95;consumer がデフォルト値の 1 のままの場合、挿入は単一スレッドで直列化されます。フラッシュが並列に行われるようにするには、これを 1 に設定してください。N 個のコンシューマ（かつ kafka&#95;thread&#95;per&#95;consumer=1）を持つ Kafka エンジンテーブルを作成することは、論理的には、N 個の Kafka エンジンを作成し、それぞれにマテリアライズドビューを持たせ、kafka&#95;thread&#95;per&#95;consumer=0 とすることと等価です。
* コンシューマを増やすことは「無料」の操作ではありません。各コンシューマは独自のバッファとスレッドを保持し、サーバー上のオーバーヘッドを増加させます。コンシューマのオーバーヘッドを意識し、まずは可能であればクラスター全体で線形にスケールさせてください。
* Kafka メッセージのスループットが変動し、遅延が許容される場合は、より大きなブロックがフラッシュされるように stream&#95;flush&#95;interval&#95;ms を増やすことを検討してください。
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size) はバックグラウンドタスクを実行するスレッド数を設定します。これらのスレッドは Kafka ストリーミングに使用されます。この設定は ClickHouse サーバーの起動時に適用され、ユーザーセッション内では変更できません。デフォルトは 16 です。ログにタイムアウトが見られる場合は、この値を増やすことが適切な場合があります。
* Kafka との通信には librdkafka ライブラリが使用されており、このライブラリ自体もスレッドを生成します。大量の Kafka テーブルやコンシューマが存在すると、多数のコンテキストスイッチが発生する可能性があります。この負荷をクラスター全体に分散し、可能であればターゲットテーブルのみをレプリケートするか、または複数トピックから読み取るテーブルエンジンの使用を検討してください（値のリストを指定できます）。複数のマテリアライズドビューを単一のテーブルから読み取り、それぞれ特定のトピックのデータのみにフィルタリングできます。

すべての設定変更はテストする必要があります。適切にスケールできていることを確認するために、Kafka コンシューマのラグを監視することを推奨します。

#### 追加設定 \\{#additional-settings\\}

上記で説明した設定以外にも、次の項目が参考になる場合があります。

* [Kafka&#95;max&#95;wait&#95;ms](/operations/settings/settings#kafka_max_wait_ms) - 再試行前に Kafka からメッセージを読み込む際の待機時間（ミリ秒単位）。ユーザープロファイル単位で設定され、デフォルトは 5000 です。

基盤となる librdkafka の [すべての設定](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)は、ClickHouse の設定ファイル内の *kafka* 要素の中にも記述できます。設定名は、ピリオドをアンダースコアに置き換えた XML 要素として指定する必要があります（例）。

```xml
<clickhouse>
   <kafka>
       <enable_ssl_certificate_verification>false</enable_ssl_certificate_verification>
   </kafka>
</clickhouse>
```

これらは上級者向けの設定であるため、より詳しい説明については Kafka のドキュメントを参照してください。
