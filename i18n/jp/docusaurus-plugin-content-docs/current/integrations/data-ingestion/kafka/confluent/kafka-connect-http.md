---
sidebar_label: 'Confluent Platform の HTTP Sink コネクタ'
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/http
description: 'Kafka Connect と ClickHouse を使用した HTTP コネクタシンク'
title: 'Confluent HTTP Sink コネクタ'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';



# Confluent HTTP Sink コネクタ
HTTP Sink コネクタはデータタイプに依存せず、Kafka スキーマを必要とせず、Maps や Arrays など ClickHouse 固有のデータタイプもサポートしています。この追加の柔軟性は、構成の複雑さを少し増加させることになります。

以下では、単一の Kafka トピックからメッセージを取得し、ClickHouse テーブルに行を挿入するシンプルなインストール手順を説明します。

:::note
  HTTP コネクタは [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) の下で配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続情報を集める {#1-gather-your-connection-details}
<ConnectionDetails />

#### 2. Kafka Connect と HTTP Sink コネクタを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

2つのオプションがあります：

* **セルフマネージド:** Confluent パッケージをダウンロードし、ローカルにインストールします。コネクタのインストール手順については [こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html) を参照してください。
confluent-hub インストールメソッドを使用する場合、ローカル設定ファイルが更新されます。

* **Confluent Cloud:** Confluent Cloud を使用して Kafka をホストするユーザー向けに、完全に管理されたバージョンの HTTP Sink が用意されています。これには、ClickHouse 環境が Confluent Cloud からアクセス可能である必要があります。

:::note
  以下の例では Confluent Cloud を使用しています。
:::

#### 3. ClickHouse に宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、ClickHouse Cloud にテストテーブルを作成しましょう。このテーブルが Kafka からのデータを受け取ります：

```sql
CREATE TABLE default.my_table
(
    `side` String,
    `quantity` Int32,
    `symbol` String,
    `price` Int32,
    `account` String,
    `userid` String
)
ORDER BY tuple()
```

#### 4. HTTP Sink を構成する {#4-configure-http-sink}
Kafka トピックと HTTP Sink コネクタのインスタンスを作成します：
<Image img={createHttpSink} size="sm" alt="HTTP Sink コネクタを作成する方法を示す Confluent Cloud インターフェース" border/>

<br />

HTTP Sink コネクタを構成します：
* 作成したトピック名を提供します
* 認証
    * `HTTP Url` - ClickHouse Cloud の URL に `INSERT` クエリを指定 `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow` とします。**注意**: クエリはエンコードする必要があります。
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouse のユーザー名
    * `Auth password` - ClickHouse のパスワード

:::note
  この HTTP Url はエラーが発生しやすいです。問題を避けるために、エスケープが正確であることを確認してください。
:::

<Image img={httpAuth} size="lg" alt="HTTP Sink コネクタの認証設定を示す Confluent Cloud インターフェース" border/>
<br/>

* 構成
    * `Input Kafka record value format` - ソースデータに依存しますが、ほとんどの場合は JSON か Avro です。以下の設定では `JSON` を仮定します。
    * `advanced configurations` セクションでは：
        * `HTTP Request Method` - POST に設定
        * `Request Body Format` - json
        * `Batch batch size` - ClickHouse の推奨に従い、**少なくとも 1000** に設定します。
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500 に設定しますが、HTTP プロキシが ClickHouse の前にある場合など、必要に応じて調整してください。
        * `Maximum Reties` - デフォルト（10）が適切ですが、より堅牢なリトライが必要な場合は調整してください。

<Image img={httpAdvanced} size="sm" alt="HTTP Sink コネクタの高度な設定オプションを示す Confluent Cloud インターフェース" border/>

#### 5. 接続性をテストする {#5-testing-the-connectivity}
HTTP Sink に構成されたトピックでメッセージを作成します
<Image img={createMessageInTopic} size="md" alt="Kafka トピックにテストメッセージを作成する方法を示す Confluent Cloud インターフェース" border/>

<br/>

作成したメッセージが ClickHouse インスタンスに書き込まれていることを確認してください。

### トラブルシューティング {#troubleshooting}
#### HTTP Sink がメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[Sink documentation](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp) から：
> HTTP Sink コネクタは、異なる Kafka ヘッダー値を含むメッセージのリクエストをバッチ処理しません。

1. Kafka レコードのキーが同じであることを確認します。
2. HTTP API URL にパラメータを追加すると、各レコードが一意の URL になる可能性があります。このため、追加の URL パラメータを使用するとバッチ処理が無効になります。

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTP Sink が `String` カラムに JSON オブジェクトを挿入するときに以下のメッセージで失敗した場合：

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URL のエンコードされた文字列に `input_format_json_read_objects_as_strings=1` 設定を追加します `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### GitHub データセットをロードする (オプション) {#load-the-github-dataset-optional}

この例では、GitHub データセットの Array フィールドを保持することに注意してください。例では空の github トピックがあると仮定し、[kcat](https://github.com/edenhill/kcat) を使用して Kafka にメッセージを挿入します。

##### 1. 設定を準備する {#1-prepare-configuration}

[これらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) に従って、インストールタイプに関連する Connect を設定します。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloud を使用する場合は、分散セットアップが関連します。

最も重要なパラメータは `http.api.url` です。ClickHouse の [HTTP インターフェース](../../../../interfaces/http.md) では、INSERT ステートメントを URL のパラメータとしてエンコードする必要があります。これは形式（この場合は `JSONEachRow`）とターゲットデータベースを含める必要があります。形式は、HTTP ペイロード内で文字列に変換される Kafka データと一貫している必要があります。これらのパラメータは URL エスケープされる必要があります。以下は、GitHub データセット用の形式の例（ClickHouse をローカルで実行していると仮定）です：

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTP Sink を ClickHouse と一緒に使用するための追加の関連パラメータは次の通りです。完全なパラメータリストは [こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html) で確認できます：

* `request.method` - **POST** に設定
* `retry.on.status.codes` - 400-500 に設定し、エラーコードに再試行します。データの予想されるエラーに基づいて洗練します。
* `request.body.format` - ほとんどの場合、JSON になります。
* `auth.type` - ClickHouse のセキュリティのために BASIC に設定します。他の ClickHouse 互換の認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSL を使用している場合は true に設定します。
* `connection.user` - ClickHouse のユーザー名。
* `connection.password` - ClickHouse のパスワード。
* `batch.max.size` - 単一バッチで送信する行の数。適切に大きな数に設定されていることを確認します。ClickHouse の [推奨事項](/sql-reference/statements/insert-into#performance-considerations) に従い、1000 以上が最小値と見なされるべきです。
* `tasks.max` - HTTP Sink コネクタは 1 つ以上のタスクを実行できます。これによりパフォーマンスを向上させることができます。バッチサイズと共に、パフォーマンスを向上させるための主要な手段となります。
* `key.converter` - キーのタイプに応じて設定します。
* `value.converter` - トピック内のデータの種類に基づいて設定します。このデータはスキーマを必要としません。ここでの形式は、`http.api.url` パラメータで指定されたフォーマットと一貫している必要があります。最も簡単な方法は JSON を使用し、org.apache.kafka.connect.json.JsonConverter コンバータを用いることです。値を文字列として扱うことも可能ですが、これにはユーザーが関数を使用して挿入ステートメント内で値を抽出する必要があります。ClickHouse では [Avro フォーマット](../../../../interfaces/formats.md#data-format-avro) もサポートされています。

設定の完全なリスト、プロキシの設定方法、リトライ、および高度な SSL については [こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html) を参照してください。

GitHub サンプルデータの設定ファイルの例は [こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink) にあります。Connect がスタンドアロンモードで実行され、Kafka が Confluent Cloud にホストされていると仮定します。

##### 2. ClickHouse テーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認します。標準の MergeTree を使用した最小限の GitHub データセットの例は以下の通りです。

```sql
CREATE TABLE github
(
    file_time DateTime,
    event_type Enum('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4,'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
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

##### 3. Kafka にデータを追加する {#3-add-data-to-kafka}

メッセージを Kafka に挿入します。以下に [kcat](https://github.com/edenhill/kcat) を使用して 10,000 メッセージを挿入する方法を示します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

ターゲットテーブル "Github" でのシンプルな読み取りは、データの挿入を確認すべきです。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |
