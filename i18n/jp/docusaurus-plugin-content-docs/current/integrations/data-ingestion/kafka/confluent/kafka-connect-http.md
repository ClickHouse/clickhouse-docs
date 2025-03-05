---
sidebar_label: Confluent PlatformのHTTP Sink Connector
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/http
description: Kafka ConnectとClickHouseを使用したHTTP Connector Sink
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';



# Confluent HTTP Sink Connector
HTTP Sink Connectorはデータ型に依存せず、Kafkaスキーマを必要としないため、MapsやArraysなどのClickHouse特有のデータ型をサポートしています。この追加の柔軟性は、構成の複雑さがわずかに増すという点でのトレードオフがあります。

以下に、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入するシンプルなインストール手順を説明します。

:::note
  HTTP Connectorは[Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license)の下で配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />


#### 2. Kafka ConnectとHTTP Sink Connectorを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

以下の2つのオプションがあります:

* **セルフマネージド:** Confluentパッケージをダウンロードし、ローカルにインストールします。コネクタのインストールに関する手順は、[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html)に記載されています。
confluent-hubインストールメソッドを使用する場合、ローカルの設定ファイルが更新されます。

* **Confluent Cloud:** Confluent CloudでKafkaホスティングを使用している場合、HTTP Sinkの完全に管理されたバージョンが利用可能です。この場合、あなたのClickHouse環境がConfluent Cloudからアクセスできる必要があります。

:::note
  以下の例はConfluent Cloudを使用しています。
:::

#### 3. ClickHouseに宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、ClickHouse Cloudにテスト用テーブルを作成しましょう。このテーブルはKafkaからデータを受け取ります:

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
KafkaトピックとHTTP Sink Connectorのインスタンスを作成します:
<img src={createHttpSink} class="image" alt="Create HTTP Sink" style={{width: '50%'}}/>

<br />

HTTP Sink Connectorを構成します:
* あなたが作成したトピック名を提供します
* 認証
    * `HTTP Url` - `INSERT`クエリを指定したClickHouse Cloud URL `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。 **注意**: クエリはエンコードされている必要があります。
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouseユーザー名
    * `Auth password` - ClickHouseパスワード

:::note
  このHTTP Urlはエラーが発生しやすいです。問題を避けるためにエスケープが正確であることを確認してください。
:::

<img src={httpAuth} class="image" alt="Auth options for Confluent HTTP Sink" style={{width: '70%'}}/>
<br/>

* 構成
    * `Input Kafka record value format` - ソースデータに応じますが、ほとんどの場合JSONまたはAvroです。以下の設定では`JSON`を想定しています。
    * `advanced configurations`セクションで:
        * `HTTP Request Method` - POSTに設定
        * `Request Body Format` - json
        * `Batch batch size` - ClickHouseの推奨に従い、**少なくとも1000**に設定します。
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500に設定しますが、必要に応じて調整してください。例えば、ClickHouseの前にHTTPプロキシがある場合は変わるかもしれません。
        * `Maximum Reties` - デフォルト（10）は適切ですが、より堅牢なリトライのために調整してください。

<img src={httpAdvanced} class="image" alt="Advanced options for Confluent HTTP Sink" style={{width: '50%'}}/>

#### 5. 接続のテスト {#5-testing-the-connectivity}
HTTP Sinkで構成されたトピックでメッセージを作成します
<img src={createMessageInTopic} class="image" alt="Create a message in the topic" style={{width: '50%'}}/>

<br/>

作成したメッセージがあなたのClickHouseインスタンスに書き込まれたことを確認します。

### トラブルシューティング {#troubleshooting}
#### HTTP Sinkがメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[Sinkドキュメント](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)からの引用:
> HTTP Sinkコネクタは、異なるKafkaヘッダー値を含むメッセージのリクエストをバッチ処理しません。

1. Kafkaレコードに同じキーがあることを確認します。
2. HTTP API URLにパラメータを追加すると、各レコードがユニークなURLを生成する可能性があります。このため、追加のURLパラメータを使用する際にはバッチ処理が無効になります。

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTP Sinkが`String`カラムにJSONオブジェクトを挿入する際に次のメッセージで失敗した場合:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URLにエンコードされた文字列`SETTINGS%20input_format_json_read_objects_as_strings%3D1`として`input_format_json_read_objects_as_strings=1`設定を追加します。

### GitHubデータセットをロードする (オプション) {#load-the-github-dataset-optional}

この例はGithubデータセットのArrayフィールドを保持しています。例では空のgithubトピックがあると仮定し、Kafkaへのメッセージ挿入には[kcat](https://github.com/edenhill/kcat)を使用します。

##### 1. 構成を準備する {#1-prepare-configuration}

[これらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って、設置タイプに関連するConnectを設定します。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloudを使用する場合、分散設定が関連します。

最も重要なパラメータは`http.api.url`です。ClickHouseの[HTTPインターフェース](../../../../interfaces/http.md)では、URLのパラメータとしてINSERT文をエンコードする必要があります。これにはフォーマット（この場合は`JSONEachRow`）とターゲットデータベースを含める必要があります。フォーマットはKafkaデータと一貫している必要があり、HTTPペイロードで文字列に変換されます。これらのパラメータはURLエスケープする必要があります。Githubデータセットのためのこのフォーマットの例（ClickHouseをローカルで実行していると仮定）を以下に示します:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTP SinkをClickHouseで使用する際に関連する以下の追加パラメータがあります。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)にあります:


* `request.method` - **POST**に設定
* `retry.on.status.codes` - エラーコードに対して再試行するために400-500に設定します。データの期待されるエラーに基づいて洗練されます。
* `request.body.format` - ほとんどの場合これはJSONになります。
* `auth.type` - ClickHouseのセキュリティを考慮してBASICに設定します。他のClickHouse対応の認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSLを使用している場合はtrueに設定。
* `connection.user` - ClickHouseのユーザー名。
* `connection.password` - ClickHouseのパスワード。
* `batch.max.size` - 単一バッチで送信する行数。適切に大きな数に設定することを確認してください。ClickHouseの[推奨](https://sql-reference/statements/insert-into#performance-considerations)に従い、1000を最低値として考慮すべきです。
* `tasks.max` - HTTP Sinkコネクタは一つ以上のタスクを実行することをサポートしています。これはパフォーマンスを向上させるために使用できます。バッチサイズとともに、パフォーマンスを向上させる主な手段を表します。
* `key.converter` - キーのタイプに応じて設定。
* `value.converter` - トピックのデータタイプに基づいて設定。このデータはスキーマを必要としません。ここでのフォーマットは`http.api.url`パラメータに指定されたFORMATと整合性がなければなりません。最も簡単なのはJSONを使用し、org.apache.kafka.connect.json.JsonConverterコンバータを使用することです。値を文字列として扱うために、org.apache.kafka.connect.storage.StringConverterを介しても可能ですが、これにはユーザーが関数を使用して挿入文で値を抽出する必要があります。[Avroフォーマット](../../../../interfaces/formats.md#data-format-avro)もClickHouseでサポートされています。

プロキシの設定、リトライ、SSLの高度な設定を含む設定リストの完全なリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)にあります。

Githubサンプルデータに対する設定ファイルの例は、[こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)で見つけることができます。Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudにホストされていると仮定します。

##### 2. ClickHouseテーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認します。標準のMergeTreeを使用した最小限のgithubデータセットの例を以下に示します。

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

Kafkaにメッセージを挿入します。以下では[kcat](https://github.com/edenhill/kcat)を使用して10,000件のメッセージを挿入します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

ターゲットテーブル「Github」にデータが挿入されたことを確認するために簡単な読み取りを行います。


```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
