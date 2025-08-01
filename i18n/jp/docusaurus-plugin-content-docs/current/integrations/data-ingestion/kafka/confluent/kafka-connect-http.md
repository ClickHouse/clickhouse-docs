---
sidebar_label: 'Confluent Platform向けHTTPシンクコネクタ'
sidebar_position: 3
slug: '/integrations/kafka/cloud/confluent/http'
description: 'Kafka ConnectおよびClickHouseを使用したHTTPコネクタシンク'
title: 'Confluent HTTP Sink Connector'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP Sink Connector
HTTP Sink Connectorはデータ型に依存せず、Kafkaスキーマを必要とせず、MapsやArraysといったClickHouse特有のデータ型をサポートしています。この追加の柔軟性は、設定の複雑さをわずかに増加させます。

以下では、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入するシンプルなインストール手順を説明します。

:::note
  HTTP Connectorは[Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license)の下で配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続情報を収集する {#1-gather-your-connection-details}
<ConnectionDetails />

#### 2. Kafka ConnectとHTTP Sink Connectorを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

2つのオプションがあります：

* **セルフマネージド:** Confluentパッケージをダウンロードし、ローカルにインストールします。コネクタのインストールに関する手順は[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html)に記載されています。
confluent-hubインストール方式を使用する場合、ローカルの設定ファイルが更新されます。

* **Confluent Cloud:** Confluent Cloudを使用してKafkaをホスティングしているユーザー向けに完全に管理されたHTTP Sinkのバージョンが利用可能です。これには、ClickHouse環境へのConfluent Cloudからのアクセスが必要です。

:::note
  次の例はConfluent Cloudを使用しています。
:::

#### 3. ClickHouseに宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、ClickHouse Cloudにテストテーブルを作成します。このテーブルはKafkaからデータを受信します：

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

#### 4. HTTP Sinkを構成する {#4-configure-http-sink}
KafkaトピックとHTTP Sink Connectorのインスタンスを作成します：
<Image img={createHttpSink} size="sm" alt="Confluent Cloud interface showing how to create an HTTP Sink connector" border/>

<br />

HTTP Sink Connectorを構成します：
* 作成したトピック名を指定する
* 認証
    * `HTTP Url` - `INSERT`クエリが指定されたClickHouse CloudのURL `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。 **注意**: クエリはエンコードする必要があります。
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouseのユーザー名
    * `Auth password` - ClickHouseのパスワード

:::note
  このHTTP Urlはエラーが発生しやすいです。問題を避けるためにエスケープが正確であることを確認してください。
:::

<Image img={httpAuth} size="lg" alt="Confluent Cloud interface showing authentication settings for the HTTP Sink connector" border/>
<br/>

* 設定
    * `Input Kafka record value format` - ソースデータに応じて異なりますが、ほとんどの場合はJSONまたはAvroです。以下の設定では`JSON`を想定しています。
    * `advanced configurations`セクションで：
        * `HTTP Request Method` - POSTに設定
        * `Request Body Format` - json
        * `Batch batch size` - ClickHouseの推奨に従って、**少なくとも1000**に設定します。
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500ですが、必要に応じて調整してください。たとえば、ClickHouseの前にHTTPプロキシがある場合は変わる可能性があります。
        * `Maximum Reties` - デフォルト（10）は適切ですが、より堅牢な再試行のために調整してください。

<Image img={httpAdvanced} size="sm" alt="Confluent Cloud interface showing advanced configuration options for the HTTP Sink connector" border/>

#### 5. 接続をテストする {#5-testing-the-connectivity}
HTTP Sinkによって構成されたトピックにメッセージを作成します
<Image img={createMessageInTopic} size="md" alt="Confluent Cloud interface showing how to create a test message in a Kafka topic" border/>

<br />

作成したメッセージがClickHouseインスタンスに書き込まれていることを確認します。

### トラブルシューティング {#troubleshooting}
#### HTTP Sinkがメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[Sink documentation](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)によると：
> HTTP Sinkコネクタは、Kafkaヘッダー値が異なるメッセージのリクエストをバッチ処理しません。

1. Kafkaレコードが同じキーを持っているか確認します。
2. HTTP API URLにパラメータを追加すると、各レコードがユニークなURLを生成する可能性があります。このため、追加のURLパラメータを使用する場合はバッチ処理が無効になります。

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTP Sinkが`String`カラムにJSONオブジェクトを挿入する際に次のメッセージで失敗した場合：

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URLに`input_format_json_read_objects_as_strings=1`設定をエンコードされた文字列`SETTINGS%20input_format_json_read_objects_as_strings%3D1`として追加します。

### GitHubデータセットをロードする（オプション） {#load-the-github-dataset-optional}

この例ではGitHubデータセットのArrayフィールドが保持されることに注意してください。例では空のgithubトピックがあると仮定し、[kcat](https://github.com/edenhill/kcat)を使用してKafkaへのメッセージ挿入を行います。

##### 1. 設定を準備する {#1-prepare-configuration}

自分のインストールタイプに関連するConnectの設定については[こちらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。スタンドアロンと分散クラスターの違いに注意します。Confluent Cloudを使用する場合、分散設定が関連します。

最も重要なパラメータは`http.api.url`です。ClickHouseの[HTTPインターフェース](../../../../interfaces/http.md)は、INSERT文をURLのパラメータとしてエンコードする必要があります。これはフォーマット（この場合は`JSONEachRow`）とターゲットデータベースを含む必要があります。形式はKafkaデータと一致し、HTTPペイロード内で文字列に変換されます。これらのパラメータはURLエスケープする必要があります。GitHubデータセットのこの形式の例（ClickHouseをローカルで実行していると仮定）は以下です：

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTP SinkをClickHouseと使用する際に関連する追加パラメータは次のとおりです。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で見つけることができます：

* `request.method` - **POST**に設定
* `retry.on.status.codes` - 任意のエラーコードで再試行するために400-500に設定。データに期待されるエラーに基づいて調整してください。
* `request.body.format` - ほとんどの場合、これはJSONになります。
* `auth.type` - ClickHouseでセキュリティを使用する場合はBASICに設定。その他のClickHouse互換の認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSLを使用している場合はtrueに設定。
* `connection.user` - ClickHouseのユーザー名。
* `connection.password` - ClickHouseのパスワード。
* `batch.max.size` - 単一のバッチで送信する行の数。適切に大きな数に設定されていることを確認してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)では、1000の値を最小限として検討する必要があります。
* `tasks.max` - HTTP Sinkコネクタは1つ以上のタスクを実行することをサポートしています。これを使用してパフォーマンスを向上させることができます。バッチサイズとともに、これが主なパフォーマンス向上手段を表します。
* `key.converter` - キーの型に応じて設定。
* `value.converter` - トピックのデータ型に基づいて設定。このデータはスキーマを必要としません。ここでの形式は、`http.api.url`パラメータに指定されたFORMATと一致している必要があります。最もシンプルな方法はJSONとorg.apache.kafka.connect.json.JsonConverterコンバータを使用することです。値を文字列として扱うことも可能で、org.apache.kafka.connect.storage.StringConverterを介して行うことができますが、これには関数を使用して挿入文で値を抽出する必要があります。[Avroフォーマット](../../../../interfaces/formats.md#data-format-avro)もClickHouseでサポートされており、io.confluent.connect.avro.AvroConverterコンバータを使用する場合に利用可能です。

完全な設定リストは、プロキシの構成、再試行、高度なSSLの設定方法を含む完全なリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で見ることができます。

GitHubサンプルデータ用の設定ファイルの例は[こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)にあります。Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudでホストされていると仮定しています。

##### 2. ClickHouseテーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認します。標準的なMergeTreeを使用した最小限のgithubデータセットの例を以下に示します。

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

##### 3. Kafkaにデータを追加する {#3-add-data-to-kafka}

メッセージをKafkaに挿入します。以下では、[kcat](https://github.com/edenhill/kcat)を使用して10kメッセージを挿入します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

ターゲットテーブル「Github」を単純に読み込むことで、データの挿入を確認できます。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |
```
