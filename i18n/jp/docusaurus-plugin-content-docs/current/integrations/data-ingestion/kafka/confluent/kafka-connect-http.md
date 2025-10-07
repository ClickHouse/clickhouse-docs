---
'sidebar_label': 'Confluent Platform 用 HTTP Sink コネクタ'
'sidebar_position': 4
'slug': '/integrations/kafka/cloud/confluent/http'
'description': 'Kafka Connect と ClickHouse を使用した HTTP コネクタ Sink'
'title': 'Confluent HTTP Sink コネクタ'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP Sink Connector
HTTP Sink Connectorはデータ型に依存しないため、Kafkaスキーマを必要とせず、MapsやArraysなどのClickHouse特有のデータ型をサポートします。この追加の柔軟性は、設定の複雑さが少し増すことを意味します。

以下では、単一のKafkaトピックからメッセージを取得し、行をClickHouseテーブルに挿入するシンプルなインストール手順を説明します。

:::note
  HTTP Connectorは[Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license)のもとで配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続情報を取得する {#1-gather-your-connection-details}
<ConnectionDetails />

#### 2. Kafka ConnectとHTTP Sink Connectorを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

2つのオプションがあります：

* **セルフマネージド:** Confluentパッケージをダウンロードし、ローカルにインストールします。コネクタのインストールに関する手順は[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html)に記載されています。
confluent-hubインストール方法を使用すると、ローカル設定ファイルが更新されます。

* **Confluent Cloud:** KafkaホスティングにConfluent Cloudを利用している場合、HTTP Sinkの完全管理型バージョンが利用可能です。これにはClickHouse環境がConfluent Cloudからアクセス可能である必要があります。

:::note
  以下の例はConfluent Cloudを使用しています。
:::

#### 3. ClickHouseに宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、ClickHouse Cloudでテストテーブルを作成しましょう。このテーブルはKafkaからのデータを受信します：

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

#### 4. HTTP Sinkを設定する {#4-configure-http-sink}
KafkaトピックとHTTP Sink Connectorのインスタンスを作成します：
<Image img={createHttpSink} size="sm" alt="Confluent Cloud interface showing how to create an HTTP Sink connector" border/>

<br />

HTTP Sink Connectorを設定します：
* 作成したトピック名を指定します
* 認証
  * `HTTP Url` - ClickHouse CloudのURLで、指定された`INSERT`クエリ `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`を含みます。**注意**: クエリはエンコードされる必要があります。
  * `Endpoint Authentication type` - BASIC
  * `Auth username` - ClickHouseのユーザー名
  * `Auth password` - ClickHouseのパスワード

:::note
  このHTTP Urlはエラーが発生しやすいです。問題を避けるためにエスケープが正確であることを確認してください。
:::

<Image img={httpAuth} size="lg" alt="Confluent Cloud interface showing authentication settings for the HTTP Sink connector" border/>
<br/>

* 設定
  * `Input Kafka record value format` - ソースデータに依存しますが、ほとんどの場合はJSONまたはAvroです。以下の設定では`JSON`を想定しています。
  * `advanced configurations`セクションで：
    * `HTTP Request Method` - POSTに設定します
    * `Request Body Format` - json
    * `Batch batch size` - ClickHouseの推奨に従い、**少なくとも1000**に設定します。
    * `Batch json as array` - true
    * `Retry on HTTP codes` - 400-500ですが、必要に応じて適応してください（例: ClickHouseの前にHTTPプロキシがある場合があるため）。
    * `Maximum Reties` - デフォルト（10）は適切ですが、より堅牢なリトライのために調整してください。

<Image img={httpAdvanced} size="sm" alt="Confluent Cloud interface showing advanced configuration options for the HTTP Sink connector" border/>

#### 5. 接続性をテストする {#5-testing-the-connectivity}
HTTP Sinkで構成されたトピックにメッセージを作成します
<Image img={createMessageInTopic} size="md" alt="Confluent Cloud interface showing how to create a test message in a Kafka topic" border/>

<br/>

作成したメッセージがClickHouseインスタンスに書き込まれたことを確認してください。

### トラブルシューティング {#troubleshooting}
#### HTTP Sinkがメッセージをバッチしない {#http-sink-doesnt-batch-messages}

[Sink documentation](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)から：
> HTTP Sinkコネクタは、異なるKafkaヘッダ値を含むメッセージのリクエストをバッチ処理しません。

1. Kafkaレコードが同じキーを持っていることを確認してください。
2. HTTP API URLにパラメータを追加すると、各レコードがユニークなURLを生成します。このため、追加のURLパラメータを使用している場合、バッチ処理が無効になります。

#### 400 bad request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTP Sinkが`String`カラムにJSONオブジェクトを挿入中に次のメッセージで失敗した場合：

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URLに設定する`input_format_json_read_objects_as_strings=1`パラメータをエンコードされた文字列`SETTINGS%20input_format_json_read_objects_as_strings%3D1`として設定します。

### GitHubデータセットをロードする (オプション) {#load-the-github-dataset-optional}

この例では、GithubデータセットのArrayフィールドを保持しています。例では空のgithubトピックがあると仮定し、メッセージ挿入には[kcat](https://github.com/edenhill/kcat)を使用します。

##### 1. 設定を準備する {#1-prepare-configuration}

お使いのインストールタイプに関連するConnectのセットアップについては[これらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloudを使用している場合、分散セットアップが関連します。

最も重要なパラメータは`http.api.url`です。ClickHouseの[HTTPインターフェース](../../../../interfaces/http.md)は、INSERT文をURLのパラメータとしてエンコードする必要があります。これには形式（この場合は`JSONEachRow`）と対象データベースが含まれます。形式はKafkaデータと一致していなければならず、HTTPペイロード内で文字列に変換されます。これらのパラメータはURLエスケープされなければなりません。Githubデータセット用のこの形式の例（ClickHouseをローカルで実行していると仮定）は以下に示されています：

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTP SinkをClickHouseで使用するために関連する他の追加パラメータは次のとおりです。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で確認できます：

* `request.method` - **POST**に設定
* `retry.on.status.codes` - エラーコード400-500でリトライするように設定。データの予想されるエラーに基づいて詳細設定してください。
* `request.body.format` - ほとんどの場合、これはJSONになります。
* `auth.type` - ClickHouseにセキュリティがある場合、BASICに設定します。他のClickHouse対応の認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSLを使用する場合はtrueに設定。
* `connection.user` - ClickHouseのユーザー名。
* `connection.password` - ClickHouseのパスワード。
* `batch.max.size` - 単一バッチで送信する行数。適切に大きな数値に設定してください。ClickHouseの[推奨](https://docs.clickhouse.com/ru/sql-reference/statements/insert-into#performance-considerations)に従い、1000は最小値と見なされるべきです。
* `tasks.max` - HTTP Sinkコネクタは1つ以上のタスクを実行できます。これを利用してパフォーマンスを向上させることができます。バッチサイズと共に、パフォーマンスを向上させる主な手段となります。
* `key.converter` - キーのタイプに応じて設定。
* `value.converter` - トピックのデータのタイプに基づいて設定。このデータはスキーマを必要としません。ここでの形式は、`http.api.url`パラメータで指定されたFORMATと一致している必要があります。ここで最も簡単なのはJSONを使用し、org.apache.kafka.connect.json.JsonConverterコンバータを利用することです。値を文字列として扱うことも可能で、その場合はorg.apache.kafka.connect.storage.StringConverterコンバータを使用しますが、その場合は挿入文で関数を使用して値を抽出する必要があります。[Avro形式](../../../../interfaces/formats.md#data-format-avro)もClickHouseでサポートされています、io.confluent.connect.avro.AvroConverterコンバータを使用する場合。

プロキシ、リトライ、および高度なSSLの設定方法を含む完全な設定リストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で確認できます。

Githubサンプルデータ用の設定ファイルの例は[こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)にあります。Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudにホストされていると仮定しています。

##### 2. ClickHouseテーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認します。標準のMergeTreeを使用した最小のgithubデータセットの例は以下に示されています。

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

Kafkaにメッセージを挿入します。以下では[kcat](https://github.com/edenhill/kcat)を使用して10,000メッセージを挿入します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

ターゲットテーブル"Github"を単純に読み取ることで、データの挿入が確認できます。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
