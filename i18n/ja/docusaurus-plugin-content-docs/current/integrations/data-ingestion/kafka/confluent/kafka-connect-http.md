---
sidebar_label: Confluent Platform用HTTPシンクコネクタ
sidebar_position: 3
slug: /integrations/kafka/cloud/confluent/http
description: Kafka ConnectとClickHouseでHTTPコネクタシンクを使用する
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Confluent HTTPシンクコネクタ
HTTPシンクコネクタはデータ型に依存しないため、Kafkaのスキーマは必要なく、MapsやArraysなどのClickHouse特有のデータ型もサポートしています。この追加の柔軟性は、少し設定の複雑さを増します。

以下に、単一のKafkaトピックからメッセージを取得し、ClickHouseテーブルに行を挿入する簡単なインストール方法を説明します。

:::note
  HTTPコネクタは[Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license)の下で配布されています。
:::

### クイックスタートステップ {#quick-start-steps}

#### 1. 接続の詳細を収集する {#1-gather-your-connection-details}
<ConnectionDetails />


#### 2. Kafka ConnectとHTTPシンクコネクタを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

オプションが2つあります：

* **セルフマネージド:** Confluentパッケージをダウンロードしてローカルにインストールします。コネクタのインストールに関する手順は[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html)に記載されています。
confluent-hubインストール方法を使用する場合、ローカルの設定ファイルが更新されます。

* **Confluent Cloud:** Confluent CloudをKafkaホスティングのために使用している場合、HTTPシンクの完全管理版が利用可能です。これにはClickHouse環境がConfluent Cloudからアクセス可能である必要があります。

:::note
  以下の例はConfluent Cloudを使用しています。
:::

#### 3. ClickHouseに宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、ClickHouse Cloudにデータを受信するテストテーブルを作成しましょう：

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

#### 4. HTTPシンクを設定する {#4-configure-http-sink}
KafkaトピックとHTTPシンクコネクタのインスタンスを作成します：
<img src={require('./images/create_http_sink.png').default} class="image" alt="Create HTTP Sink" style={{width: '50%'}}/>

<br />

HTTPシンクコネクタを設定します：
* 作成したトピック名を指定
* 認証
    * `HTTP Url` - `INSERT`クエリが指定されたClickHouse CloudのURL `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。 **注意:** クエリはエンコードされている必要があります。
    * `Endpoint Authentication type` - BASIC
    * `Auth username` - ClickHouseユーザー名
    * `Auth password` - ClickHouseパスワード

:::note
  このHTTP Urlはエラーが発生しやすいです。問題を避けるために、エスケープが正確であることを確認してください。
:::

<img src={require('./images/http_auth.png').default} class="image" alt="Auth options for Confluent HTTP Sink" style={{width: '70%'}}/>
<br/>

* 設定
    * `Input Kafka record value format` - ソースデータに依存しますが、ほとんどの場合はJSONまたはAvroです。以下の設定では`JSON`を仮定します。
    * `advanced configurations`セクションで：
        * `HTTP Request Method` - POSTに設定
        * `Request Body Format` - json
        * `Batch batch size` - ClickHouseの推奨に従い、**少なくとも1000**に設定してください。
        * `Batch json as array` - true
        * `Retry on HTTP codes` - 400-500ですが、必要に応じて調整してください。例えば、ClickHouseの前にHTTPプロキシを配置している場合はこれが変更される可能性があります。
        * `Maximum Reties` - デフォルト（10）でも適切ですが、より堅牢な再試行のために調整してください。

<img src={require('./images/http_advanced.png').default} class="image" alt="Advanced options for Confluent HTTP Sink" style={{width: '50%'}}/>

#### 5. 接続性テストを行う {#5-testing-the-connectivity}
HTTPシンクによって設定されたトピックにメッセージを作成します。
<img src={require('./images/create_message_in_topic.png').default} class="image" alt="Create a message in the topic" style={{width: '50%'}}/>

<br/>

そして、作成したメッセージがClickHouseインスタンスに書き込まれていることを確認してください。

### トラブルシューティング {#troubleshooting}
#### HTTPシンクがメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[シンクのドキュメント](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)より：
> HTTPシンクコネクタは、異なるKafkaヘッダー値を含むメッセージのリクエストをバッチ処理しません。

1. Kafkaレコードが同じキーを持っていることを確認してください。
2. HTTP API URLにパラメータを追加すると、各レコードがユニークなURLを生成する場合があります。このため、追加のURLパラメータを使用する場合はバッチ処理が無効になります。

#### 400 Bad Request {#400-bad-request}
##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}
HTTPシンクが次のメッセージで失敗した場合、`String`カラムにJSONオブジェクトを挿入する際に：

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URLのエンコードされた文字列に`input_format_json_read_objects_as_strings=1`設定を追加します `SETTINGS%20input_format_json_read_objects_as_strings%3D1`

### GitHubデータセットをロードする（オプション） {#load-the-github-dataset-optional}

この例ではGitHubデータセットのArrayフィールドを保持します。例において空のgithubトピックがあると仮定し、[kcat](https://github.com/edenhill/kcat)を使用してKafkaにメッセージを挿入します。

##### 1. 設定を準備する {#1-prepare-configuration}

[これらの指示](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従って、インストールタイプに関連したConnectの設定を行い、スタンドアロンと分散クラスタの違いに注意してください。Confluent Cloudを使用している場合、分散セットアップが関連します。

最も重要なパラメータは`http.api.url`です。ClickHouseの[HTTPインターフェース](../../../../interfaces/http.md)では、INSERTステートメントをURLのパラメータとしてエンコードする必要があります。これには形式（この場合は`JSONEachRow`）と対象のデータベースが含まれます。形式はKafkaデータと一貫している必要があり、HTTPペイロードで文字列に変換されます。これらのパラメータはURLエスケープされなければなりません。GitHubデータセット用のこの形式の例（ローカルでClickHouseを実行していると仮定）を以下に示します：

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

HTTPシンクをClickHouseで使用するために関連する追加のパラメータは以下の通りです。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)にあります：

* `request.method` - **POST**に設定
* `retry.on.status.codes` - エラーコード400-500で再試行するために設定します。データの予想エラーに基づいて洗練させます。
* `request.body.format` - ほとんどの場合、JSONになります。
* `auth.type` - ClickHouseにセキュリティがある場合、BASICに設定します。他のClickHouse対応の認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSLを使用する場合はtrueに設定します。
* `connection.user` - ClickHouseのユーザー名。
* `connection.password` - ClickHouseのパスワード。
* `batch.max.size` - 単一バッチで送信する行数です。適切に大きな数字に設定されていることを確認してください。ClickHouseの[推奨](../../../../concepts/why-clickhouse-is-so-fast.md#performance-when-inserting-data)では、1000が最小値と考えられます。
* `tasks.max` - HTTPシンクコネクタは1つ以上のタスクを実行することをサポートしています。これはパフォーマンスを向上させるために使用できます。バッチサイズと共に、パフォーマンス向上の主な手段を表します。
* `key.converter` - キーのタイプに応じて設定します。
* `value.converter` - トピックのデータのタイプに基づいて設定します。このデータにはスキーマは必要ありません。ここでの形式は、`http.api.url`パラメータで指定されたFORMATと一貫している必要があります。最もシンプルな方法はJSONを使用し、org.apache.kafka.connect.json.JsonConverterコンバータを使用することです。値を文字列として扱うために、org.apache.kafka.connect.storage.StringConverterを介することも可能ですが、これはユーザーが関数を使用して挿入ステートメント内の値を抽出する必要があります。[Avro形式](../../../../interfaces/formats.md#data-format-avro)もClickHouseでサポートされています。

設定の完全なリストには、プロキシの設定、再試行、SSLの高度な設定が含まれています。[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で確認できます。

GitHubサンプルデータ用の完全な設定ファイルは、[こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)にあり、Connectがスタンドアロンモードで実行され、KafkaがConfluent Cloudにホスティングされていると仮定しています。

##### 2. ClickHouseテーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認します。標準のMergeTreeを使用した最小限のGitHubデータセットの例を以下に示します。

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

メッセージをKafkaに挿入します。以下では[kcat](https://github.com/edenhill/kcat)を使用して10,000メッセージを挿入します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

ターゲットテーブル「Github」での単純な読み取りを行うことで、データの挿入を確認できるはずです。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |
```
