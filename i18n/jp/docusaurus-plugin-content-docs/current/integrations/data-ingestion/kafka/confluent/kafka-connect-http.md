---
sidebar_label: 'Confluent Platform 用 HTTP Sink Connector'
sidebar_position: 4
slug: /integrations/kafka/cloud/confluent/http
description: 'HTTP Sink Connector を Kafka Connect と ClickHouse と共に使用する'
title: 'Confluent HTTP Sink Connector'
doc_type: 'guide'
keywords: ['Confluent HTTP Sink Connector', 'HTTP Sink ClickHouse', 'Kafka HTTP connector', 'ClickHouse HTTP 連携', 'Confluent Cloud HTTP Sink']
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP シンクコネクタ {#confluent-http-sink-connector}

HTTP シンクコネクタはデータ型に依存しないため Kafka のスキーマを必要とせず、さらに Maps や Arrays のような ClickHouse 固有のデータ型もサポートします。この追加の柔軟性により、設定はわずかに複雑になります。

以下では、単一の Kafka トピックからメッセージを取得し、ClickHouse テーブルに行を挿入するシンプルなセットアップ方法について説明します。

:::note
HTTP コネクタは [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) の下で配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

#### 2. Kafka Connect と HTTP シンクコネクタを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

選択肢は 2 つあります。

* **セルフマネージド:** Confluent パッケージをダウンロードしてローカルにインストールします。[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html) に記載されているコネクタのインストール手順に従ってください。
  confluent-hub のインストール方法を使用する場合、ローカルの設定ファイルが更新されます。

* **Confluent Cloud:** Kafka のホスティングに Confluent Cloud を使用しているユーザー向けに、完全マネージド版の HTTP Sink コネクタが利用可能です。これには、Confluent Cloud から ClickHouse 環境へアクセス可能である必要があります。

:::note
以下の例では Confluent Cloud を使用しています。
:::

#### 3. ClickHouse に宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、まず ClickHouse Cloud にテストテーブルを作成します。このテーブルは Kafka からのデータを受信します。

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


#### 4. HTTP Sink の設定 {#4-configure-http-sink}

Kafka トピックと HTTP Sink Connector のインスタンスを作成します:

<Image img={createHttpSink} size="sm" alt="HTTP Sink コネクタを作成する方法を示す Confluent Cloud インターフェース" border />

<br />

HTTP Sink Connector を次のように設定します:

* 作成したトピック名を指定
* Authentication
  * `HTTP Url` - `INSERT` クエリを指定した ClickHouse Cloud の URL `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。**Note**: クエリはエンコードされている必要があります。
  * `Endpoint Authentication type` - BASIC
  * `Auth username` - ClickHouse のユーザー名
  * `Auth password` - ClickHouse のパスワード

:::note
この HTTP Url はエラーになりやすい値です。問題を避けるため、エスケープが正確であることを確認してください。
:::

<Image img={httpAuth} size="lg" alt="HTTP Sink コネクタの認証設定を示す Confluent Cloud インターフェース" border />

<br />

* Configuration
  * `Input Kafka record value format` はソースデータに依存しますが、ほとんどの場合 JSON か Avro です。以降の設定では `JSON` を前提とします。
  * `advanced configurations` セクション:
    * `HTTP Request Method` - POST に設定
    * `Request Body Format` - json
    * `Batch batch size` - ClickHouse の推奨に従い、**少なくとも 1000** に設定します。
    * `Batch json as array` - true
    * `Retry on HTTP codes` - 400-500 を指定しますが、必要に応じて調整してください。例: ClickHouse の前段に HTTP プロキシがある場合は変更が必要な場合があります。
    * `Maximum Reties` - デフォルト値 (10) で問題ありませんが、より堅牢なリトライが必要であれば調整してください。

<Image img={httpAdvanced} size="sm" alt="HTTP Sink コネクタの詳細設定オプションを示す Confluent Cloud インターフェース" border />

#### 5. 接続テスト {#5-testing-the-connectivity}

HTTP Sink で設定したトピックにメッセージを 1 件作成します。

<Image img={createMessageInTopic} size="md" alt="Kafka トピックにテストメッセージを作成する方法を示す Confluent Cloud インターフェース" border/>

<br/>

そのメッセージが ClickHouse インスタンスに書き込まれていることを確認します。

### トラブルシューティング {#troubleshooting}

#### HTTP Sink がメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[Sink documentation](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp) から:

> HTTP Sink コネクタは、Kafka ヘッダー値が異なるメッセージに対してはリクエストをバッチ処理しません。

1. すべての Kafka レコードが同じキーを持っていることを確認します。
2. HTTP API の URL にパラメータを追加すると、各レコードごとに一意の URL になる可能性があります。このため、追加の URL パラメータを使用している場合はバッチ処理が無効になります。

#### 400 bad request {#400-bad-request}

##### CANNOT&#95;PARSE&#95;QUOTED&#95;STRING {#cannot_parse_quoted_string}

`String` 列に JSON オブジェクトを挿入する際に、HTTP Sink が次のメッセージとともに失敗した場合:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URL に設定として `input_format_json_read_objects_as_strings=1` を、URL エンコードした文字列 `SETTINGS%20input_format_json_read_objects_as_strings%3D1` として指定します。


### GitHub データセットをロードする（オプション） {#load-the-github-dataset-optional}

このサンプルでは、GitHub データセットの Array フィールドが保持される点に注意してください。examples 内に空の GitHub トピックが存在し、Kafka へのメッセージ投入には [kcat](https://github.com/edenhill/kcat) を使用することを前提とします。

##### 1. 設定の準備 {#1-prepare-configuration}

インストール形態に応じた Connect のセットアップについては、スタンドアロン構成と分散クラスタ構成の違いに留意しつつ、[この手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。Confluent Cloud を利用している場合は、分散構成が該当します。

最も重要なパラメータは `http.api.url` です。ClickHouse の [HTTP インターフェイス](/interfaces/http) では、INSERT 文を URL のパラメータとしてエンコードする必要があります。ここにはフォーマット（この例では `JSONEachRow`）と対象データベースを含めなければなりません。フォーマットは Kafka データと整合している必要があり、Kafka データは HTTP ペイロード内で文字列に変換されます。これらのパラメータは URL エスケープする必要があります。GitHub データセット向けのこのフォーマットの例（ClickHouse をローカルで実行していると仮定）は、以下のとおりです。

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

ClickHouse で HTTP Sink を使用する場合、次の追加パラメーターが重要です。パラメーターの完全な一覧は[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)を参照してください。

* `request.method` - **POST** に設定します。
* `retry.on.status.codes` - 任意のエラーコードでリトライするために 400-500 に設定します。データで想定されるエラーに基づいて適宜調整してください。
* `request.body.format` - ほとんどの場合は JSON になります。
* `auth.type` - ClickHouse 側で認証を有効にしている場合は BASIC に設定します。他の ClickHouse 互換の認証メカニズムは現在サポートされていません。
* `ssl.enabled` - SSL を使用する場合は true に設定します。
* `connection.user` - ClickHouse のユーザー名。
* `connection.password` - ClickHouse のパスワード。
* `batch.max.size` - 1 回のバッチで送信する行数です。十分に大きな値に設定されていることを確認してください。ClickHouse の[推奨事項](/sql-reference/statements/insert-into#performance-considerations)によると、1000 を最低値として検討すべきです。
* `tasks.max` - HTTP Sink コネクターは 1 つ以上のタスクで実行できます。これによりパフォーマンスを向上させることができます。バッチサイズと合わせて、これがパフォーマンスを改善する主な手段となります。
* `key.converter` - キーの型に応じて設定します。
* `value.converter` - トピック上のデータ型に基づいて設定します。このデータにスキーマは不要です。ここでのフォーマットは、パラメーター `http.api.url` で指定した FORMAT と一致している必要があります。最も単純なのは JSON と org.apache.kafka.connect.json.JsonConverter コンバーターを使用することです。値を文字列として扱う org.apache.kafka.connect.storage.StringConverter コンバーターを使用することも可能ですが、その場合はユーザーが関数を用いた insert 文で値を抽出する必要があります。[Avro フォーマット](/interfaces/formats/Avro)も、io.confluent.connect.avro.AvroConverter コンバーターを使用する場合には ClickHouse でサポートされています。

プロキシの設定方法、リトライ、および高度な SSL 設定を含む設定の完全な一覧は[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で確認できます。

GitHub サンプルデータ用の設定ファイル例は、Connect がスタンドアロンモードで実行され、Kafka が Confluent Cloud 上でホストされていることを前提に、[こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)で確認できます。


##### 2. ClickHouse テーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認してください。標準的な MergeTree を使用した最小構成の GitHub データセットの例を次に示します。

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

Kafka にメッセージを送信します。以下では、[kcat](https://github.com/edenhill/kcat) を使用して 1 万件のメッセージを送信します。

```bash
head -n 10000 github_all_columns.ndjson | kcat -b <host>:<port> -X security.protocol=sasl_ssl -X sasl.mechanisms=PLAIN -X sasl.username=<username>  -X sasl.password=<password> -t github
```

ターゲットテーブル `github` に対して簡単な読み取りクエリを実行することで、データが挿入されたことを確認できます。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
