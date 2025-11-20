---
sidebar_label: 'Confluent Platform 向け HTTP Sink Connector'
sidebar_position: 4
slug: /integrations/kafka/cloud/confluent/http
description: 'Kafka Connect と ClickHouse で HTTP Sink Connector を使用する'
title: 'Confluent HTTP Sink Connector'
doc_type: 'guide'
keywords: ['Confluent HTTP Sink Connector', 'HTTP Sink ClickHouse', 'Kafka HTTP connector
', 'ClickHouse HTTP integration', 'Confluent Cloud HTTP Sink']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import createHttpSink from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_http_sink.png';
import httpAuth from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_auth.png';
import httpAdvanced from '@site/static/images/integrations/data-ingestion/kafka/confluent/http_advanced.png';
import createMessageInTopic from '@site/static/images/integrations/data-ingestion/kafka/confluent/create_message_in_topic.png';


# Confluent HTTP シンクコネクタ

HTTP シンクコネクタはデータ型に依存しないため、Kafka スキーマを必要とせず、Maps や Arrays などの ClickHouse 固有のデータ型もサポートしています。この柔軟性の向上に伴い、設定の複雑さがわずかに増加します。

以下では、単一の Kafka トピックからメッセージを取得し、ClickHouse テーブルに行を挿入する簡単なインストール方法について説明します。

:::note
HTTP コネクタは [Confluent Enterprise License](https://docs.confluent.io/kafka-connect-http/current/overview.html#license) の下で配布されています。
:::

### クイックスタート手順 {#quick-start-steps}

#### 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

#### 2. Kafka Connect と HTTP シンクコネクタを実行する {#2-run-kafka-connect-and-the-http-sink-connector}

2つのオプションがあります：

- **セルフマネージド：** Confluent パッケージをダウンロードしてローカルにインストールします。[こちら](https://docs.confluent.io/kafka-connect-http/current/overview.html)に記載されているコネクタのインストール手順に従ってください。
  confluent-hub インストール方法を使用する場合、ローカルの設定ファイルが更新されます。

- **Confluent Cloud：** Kafka ホスティングに Confluent Cloud を使用している場合、HTTP シンクのフルマネージド版が利用可能です。この場合、ClickHouse 環境が Confluent Cloud からアクセス可能である必要があります。

:::note
以下の例では Confluent Cloud を使用しています。
:::

#### 3. ClickHouse に宛先テーブルを作成する {#3-create-destination-table-in-clickhouse}

接続テストの前に、まず ClickHouse Cloud にテストテーブルを作成します。このテーブルは Kafka からのデータを受信します：

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

#### 4. HTTP シンクを設定する {#4-configure-http-sink}

Kafka トピックと HTTP シンクコネクタのインスタンスを作成します：

<Image
  img={createHttpSink}
  size='sm'
  alt='HTTP シンクコネクタの作成方法を示す Confluent Cloud インターフェース'
  border
/>

<br />

HTTP シンクコネクタを設定します：

- 作成したトピック名を指定します
- 認証
  - `HTTP Url` - `INSERT` クエリを指定した ClickHouse Cloud URL `<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow`。**注意**：クエリはエンコードする必要があります。
  - `Endpoint Authentication type` - BASIC
  - `Auth username` - ClickHouse ユーザー名
  - `Auth password` - ClickHouse パスワード

:::note
この HTTP URL はエラーが発生しやすいため、問題を回避するためにエスケープが正確であることを確認してください。
:::

<Image
  img={httpAuth}
  size='lg'
  alt='HTTP シンクコネクタの認証設定を示す Confluent Cloud インターフェース'
  border
/>
<br />

- 設定
  - `Input Kafka record value format` - ソースデータに依存しますが、ほとんどの場合 JSON または Avro です。以下の設定では `JSON` を想定しています。
  - `advanced configurations` セクション内：
    - `HTTP Request Method` - POST に設定
    - `Request Body Format` - json
    - `Batch batch size` - ClickHouse の推奨に従い、**最低 1000** に設定してください。
    - `Batch json as array` - true
    - `Retry on HTTP codes` - 400-500 ですが、必要に応じて調整してください。例えば、ClickHouse の前に HTTP プロキシがある場合は変更が必要になることがあります。
    - `Maximum Reties` - デフォルト（10）が適切ですが、より堅牢なリトライのために調整することもできます。

<Image
  img={httpAdvanced}
  size='sm'
  alt='HTTP シンクコネクタの詳細設定オプションを示す Confluent Cloud インターフェース'
  border
/>

#### 5. 接続をテストする {#5-testing-the-connectivity}

HTTP シンクで設定したトピックにメッセージを作成します

<Image
  img={createMessageInTopic}
  size='md'
  alt='Kafka トピックでテストメッセージを作成する方法を示す Confluent Cloud インターフェース'
  border
/>

<br />

作成したメッセージが ClickHouse インスタンスに書き込まれたことを確認します。

### トラブルシューティング {#troubleshooting}

#### HTTP シンクがメッセージをバッチ処理しない {#http-sink-doesnt-batch-messages}

[シンクドキュメント](https://docs.confluent.io/kafka-connectors/http/current/overview.html#http-sink-connector-for-cp)より：

> HTTP シンクコネクタは、異なる Kafka ヘッダー値を含むメッセージのリクエストをバッチ処理しません。


1. Kafkaレコードが同じキーを持っていることを確認してください。
2. HTTP API URLにパラメータを追加すると、各レコードが一意のURLになる可能性があります。このため、追加のURLパラメータを使用する場合、バッチ処理は無効になります。

#### 400 bad request {#400-bad-request}

##### CANNOT_PARSE_QUOTED_STRING {#cannot_parse_quoted_string}

JSONオブジェクトを`String`カラムに挿入する際に、HTTP Sinkが以下のメッセージで失敗する場合:

```response
Code: 26. DB::ParsingException: Cannot parse JSON string: expected opening quote: (while reading the value of key key_name): While executing JSONEachRowRowInputFormat: (at row 1). (CANNOT_PARSE_QUOTED_STRING)
```

URLに`input_format_json_read_objects_as_strings=1`設定をエンコードされた文字列`SETTINGS%20input_format_json_read_objects_as_strings%3D1`として設定してください

### GitHubデータセットの読み込み（オプション） {#load-the-github-dataset-optional}

この例では、GithubデータセットのArray型フィールドが保持されることに注意してください。例では空のgithubトピックがあることを前提とし、Kafkaへのメッセージ挿入には[kcat](https://github.com/edenhill/kcat)を使用します。

##### 1. 設定の準備 {#1-prepare-configuration}

インストールタイプに応じたConnectのセットアップについては、[こちらの手順](https://docs.confluent.io/cloud/current/cp-component/connect-cloud-config.html#set-up-a-local-connect-worker-with-cp-install)に従ってください。スタンドアロンクラスタと分散クラスタの違いに注意してください。Confluent Cloudを使用する場合は、分散セットアップが該当します。

最も重要なパラメータは`http.api.url`です。ClickHouseの[HTTPインターフェース](../../../../interfaces/http.md)では、INSERT文をURLのパラメータとしてエンコードする必要があります。これには、フォーマット（この場合は`JSONEachRow`）とターゲットデータベースを含める必要があります。フォーマットは、HTTPペイロード内で文字列に変換されるKafkaデータと一致している必要があります。これらのパラメータはURLエスケープする必要があります。Githubデータセットに対するこのフォーマットの例（ClickHouseをローカルで実行していると仮定）を以下に示します:

```response
<protocol>://<clickhouse_host>:<clickhouse_port>?query=INSERT%20INTO%20<database>.<table>%20FORMAT%20JSONEachRow

http://localhost:8123?query=INSERT%20INTO%20default.github%20FORMAT%20JSONEachRow
```

以下の追加パラメータは、ClickHouseでHTTP Sinkを使用する際に関連します。完全なパラメータリストは[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で確認できます:

- `request.method` - **POST**に設定
- `retry.on.status.codes` - すべてのエラーコードで再試行するには400-500に設定します。データ内で予想されるエラーに基づいて調整してください。
- `request.body.format` - ほとんどの場合、これはJSONになります。
- `auth.type` - ClickHouseでセキュリティを使用する場合はBASICに設定します。その他のClickHouse互換認証メカニズムは現在サポートされていません。
- `ssl.enabled` - SSLを使用する場合はtrueに設定します。
- `connection.user` - ClickHouseのユーザー名。
- `connection.password` - ClickHouseのパスワード。
- `batch.max.size` - 単一バッチで送信する行数。これを適切に大きな数値に設定してください。ClickHouseの[推奨事項](/sql-reference/statements/insert-into#performance-considerations)によると、1000を最小値として考慮する必要があります。
- `tasks.max` - HTTP Sinkコネクタは1つ以上のタスクの実行をサポートしています。これはパフォーマンスを向上させるために使用できます。バッチサイズと合わせて、これがパフォーマンスを向上させる主な手段となります。
- `key.converter` - キーのタイプに応じて設定します。
- `value.converter` - トピック上のデータのタイプに基づいて設定します。このデータにはスキーマは必要ありません。ここでのフォーマットは、パラメータ`http.api.url`で指定されたFORMATと一致している必要があります。最も簡単な方法は、JSONとorg.apache.kafka.connect.json.JsonConverterコンバータを使用することです。org.apache.kafka.connect.storage.StringConverterコンバータを使用して値を文字列として扱うことも可能ですが、この場合、ユーザーは関数を使用してINSERT文内で値を抽出する必要があります。io.confluent.connect.avro.AvroConverterコンバータを使用する場合、ClickHouseでは[Avroフォーマット](/interfaces/formats/Avro)もサポートされています。

プロキシ、再試行、高度なSSLの設定方法を含む設定の完全なリストは、[こちら](https://docs.confluent.io/kafka-connect-http/current/connector_config.html)で確認できます。


GitHubサンプルデータの設定ファイル例は[こちら](https://github.com/ClickHouse/clickhouse-docs/tree/main/docs/integrations/data-ingestion/kafka/code/connectors/http_sink)で確認できます。ConnectがスタンドアロンモードでKafkaがConfluent Cloudでホストされていることを前提としています。

##### 2. ClickHouseテーブルを作成する {#2-create-the-clickhouse-table}

テーブルが作成されていることを確認してください。標準的なMergeTreeを使用した最小限のGitHubデータセットの例を以下に示します。

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

ターゲットテーブル「Github」に対する単純な読み取りクエリで、データの挿入を確認できます。

```sql
SELECT count() FROM default.github;

| count\(\) |
| :--- |
| 10000 |

```
