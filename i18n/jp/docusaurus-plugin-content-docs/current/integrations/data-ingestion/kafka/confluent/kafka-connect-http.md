---
sidebar_label: Confluent Platform 用 HTTP Sink Connector
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/http
description: Kafka Connect と ClickHouse を使用した HTTP Connector Sink
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';



# Confluent HTTP Sink Connector
HTTP Sink Connector はデータ型に依存せず、Kafka スキーマを必要とせず、Maps や Arrays など ClickHouse 特有のデータ型もサポートします。この追加の柔軟性には、わずかな設定の複雑さの増加が伴います。

以下では、単一の Kafka トピックからメッセージを取得し、ClickHouse テーブルに行を挿入するシンプルなインストール手順を説明します。

:::note
  HTTP Connector は [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) の下で配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続詳細を集める {#1-gather-your-connection-details}
<ConnectionDetails />


#### 2. Kafka Connect と HTTP Sink Connector を実行する {#2-run-kafka-connect-and-the-http-sink-connector}

2 つのオプションがあります。

* **セルフマネージド:** Confluent パッケージをダウンロードしてローカルにインストールします。接続のインストール方法については、[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html) に文書化された手順に従ってください。
confluent-hub インストール方法を使用する場合、ローカル設定ファイルが更新されます。

* **Confluent Cloud:** Confluent Cloud を使用して Kafka ホスティングを行うユーザー向けに、完全に管理された HTTP Sink のバージョンが利用可能です。これには、ClickHouse 環境が Confluent Cloud からアクセス可能である必要があります。

:::note
  以下の例は、Confluent Cloud を使用しています。
:::

#### 3. ClickHouse に宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、ClickHouse Cloud にデータを受信するテストテーブルを作成しましょう:

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

#### 4. HTTP Sink を設定する {#4-configure-http-sink}
Kafka トピックと HTTP Sink Connector のインスタンスを作成します:
<img src={createHttpSink} class="image" alt="Create HTTP Sink" style={{width: '50%'}}/>

<br />

HTTP Sink Connector を設定します:
* 作成したトピック名を指定します
* 認証
    * `HTTP Url` - `INSERT` クエリが指定された ClickHouse Cloud URL `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。 **注意**: クエリはエンコードされている必要があります。
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouse ユーザー名
    * `Auth password` - ClickHouse パスワード

:::note
  この HTTP Url はエラーが発生しやすいです。問題を避けるためにエスケープを正確に行ってください。
:::

<img src={httpAuth} class="image" alt="Auth options for Confluent HTTP Sink" style={{width: '70%'}}/>
<br/>

* 設定
    * `Input Kafka record value format` - ソースデータに依存しますが、ほとんどの場合 JSON または Avro です。以下の設定では `JSON` を仮定します。
    * `advanced configurations` セクションで:
        * `HTTP Request Method` - POST に設定
        * `Request Body Format` - json
        * `Batch batch size` - ClickHouse の推奨に従い、**少なくとも 1000** に設定します。
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500 ですが、必要に応じて適応してください。例: ClickHouse の前に HTTP プロキシがある場合は変更が必要です。
        * `Maximum Reties` - デフォルト (10) が適切ですが、より堅牢な再試行のために調整してください。

<img src={httpAdvanced} class="image" alt="Advanced options for Confluent HTTP Sink" style={{width: '50%'}}/>

#### 5. 接続テストをする {#5-testing-the-connectivity}
HTTP Sink に構成されたトピックでメッセージを作成します
<img src={createMessageInTopic} class="image" alt="Create a message in the topic" style={{width: '50%'}}/>

<br/>

作成したメッセージが ClickHouse インスタンスに書き込まれたことを確認します。

### トラブルシューティング {#troubleshooting}
#### HTTP Sink がメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[Sink ドキュメント](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)から:
> HTTP Sink connector は、異なる Kafka ヘッダー値を含むメッセージのリクエストをバッチ処理しません。

1. Kafka レコードが同じキーを持っていることを確認します。
2. HTTP API URL にパラメータを追加すると、各レコードがユニークな URL になる可能性があります。このため、追加の URL パラメータを使用するとバッチ処理が無効になります。

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTP Sink が `String` カラムに JSON オブジェクトを挿入する際に次のメッセージで失敗した場合:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URL にエンコードされた文字列 `SETTINGS%20input_format_json_read_objects_as_strings%3D1` で `input_format_json_read_objects_as_strings=1` 設定を追加します。

### GitHub データセットをロードする (オプション) {#load-the-github-dataset-optional}

この例では、Github データセットの Array フィールドを保持します。例では空の github トピックを持っていると仮定し、メッセージ挿入には [kcat](https://github.com/edenhill/kcat) を使用します。

##### 1. 設定を準備する {#1-prepare-configuration}

接続の設定に関して、インストールタイプに応じた [これらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install) に従ってください。スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloud を使用する場合は、分散セットアップが該当します。

最も重要なパラメータは `http.api.url` です。ClickHouse の [HTTP インターフェース](../../../../interfaces/http.md) は、挿入ステートメントを URL のパラメータとしてエンコードする必要があります。これには、フォーマット（この場合は `JSONEachRow`）とターゲットデータベースが含まれている必要があります。フォーマットは Kafka データと一貫している必要があり、HTTP ペイロードで文字列に変換されます。これらのパラメータは URL エスケープされなければなりません。Github データセットに対するこのフォーマットの例は、以下の通りです（ClickHouse をローカルで実行していると仮定）:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTP Sink を ClickHouse と共に使用するために関連する追加パラメータは以下の通りです。すべてのパラメータの完全なリストは [こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html) にあります。



* `request.method` - **POST** に設定
* `retry.on.status.codes` - エラーコードのあらゆるリトライのために 400-500 に設定。データの期待されるエラーに基づいて洗練させてください。
* `request.body.format` - ほとんどの場合、これは JSON になります。
* `auth.type` - ClickHouse でのセキュリティに応じて BASIC に設定。その他の ClickHouse 互換認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSL を使用する場合は true に設定。
* `connection.user` - ClickHouse のユーザー名。
* `connection.password` - ClickHouse のパスワード。
* `batch.max.size` - 単一バッチで送信する行の数。適切に大きな数値に設定してください。ClickHouse の [推奨](../../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data) では、1000 を最小値とすることを推奨します。
* `tasks.max` - HTTP Sink connector は 1 つ以上のタスクを実行することをサポートします。これはパフォーマンスを向上させるために使用できます。バッチサイズと共に、パフォーマンスを改善する主な手段を表します。
* `key.converter` - キーの型に応じて設定。
* `value.converter` - トピック上のデータの型に基づいて設定。このデータはスキーマを必要としません。ここでのフォーマットは、`http.api.url` パラメータで指定された FORMAT と一貫している必要があります。最も簡単な方法は JSON および org.apache.kafka.connect.json.JsonConverter コンバーターを使用することです。コンバーター org.apache.kafka.connect.storage.StringConverter を介して値を文字列として扱うことも可能ですが、これにはユーザーが関数を使用して挿入ステートメント内で値を抽出する必要があります。ClickHouse では、io.confluent.connect.avro.AvroConverter コンバーターを使用した場合に Avro フォーマット（../../../../interfaces/formats.md#data-format-avro）もサポートされています。

プロキシ、再試行、および高度な SSL の設定を含む完全な設定リストは [こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html) で確認できます。

Github サンプルデータ用の設定ファイルの例は [こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink) にあります。Connect がスタンドアロンモードで実行され、Kafka が Confluent Cloud にホスティングされていると仮定しています。

##### 2. ClickHouse テーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認します。標準的な MergeTree を使用した最小限の github データセットの例は以下の通りです。


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

Kafka にメッセージを挿入します。以下では [kcat](https://github.com/edenhill/kcat) を使用して 1 万件のメッセージを挿入します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username> -X sasl.password=<password> -t github
```

ターゲットテーブル「Github」に対する簡単な読み取りはデータの挿入を確認するべきです。


```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
