---
description: 'ClickHouse の Apache Arrow Flight インターフェイスに関するドキュメントで、Flight SQL クライアントから ClickHouse への接続を可能にします'
sidebar_label: 'Arrow Flight インターフェイス'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight インターフェイス'
doc_type: 'reference'
---

# Apache Arrow Flight インターフェイス \{#apache-arrow-flight-interface\}

## 概要 \{#overview\}

ClickHouse は、[gRPC](https://grpc.io/) 上で [Arrow IPC](https://arrow.apache.org/docs/format/Columnar.html#serialization-and-interprocess-communication-ipc) フォーマットを使用し、効率的な列指向データ転送を実現する高性能 RPC フレームワークである [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) プロトコルをサポートしています。

この実装には [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html) のサポートも含まれており、Flight SQL プロトコルに対応した BI ツールやアプリケーションから ClickHouse に直接クエリを実行できます。

主な機能:

* SQL クエリを実行し、結果を Apache Arrow フォーマットで取得できます。
* Arrow フォーマットを使用してテーブルにデータを挿入できます。
* Flight SQL コマンドを使用してメタデータ (カタログ、schema、テーブル、主キー) をクエリできます。
* Flight SQL アクションを使用してセッションと設定を管理できます。
* TLS 暗号化とユーザー名/パスワード認証に対応しています。
* `PollFlightInfo` による結果の段階的な取得。
* `CancelFlightInfo` によるクエリのキャンセル。

## Arrow Flight サーバーを有効にする \{#enabling-server\}

Arrow Flight サーバーを有効にするには、ClickHouse サーバーの設定に `arrowflight_port` を追加します。

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
</clickhouse>
```

起動時に、インターフェイスが有効になったことを示すログメッセージが出力されます:

```text
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9090
```

## TLS 設定 \{#tls-configuration\}

Arrow Flight インターフェイスで TLS を有効にするには、次の設定を行います:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
    <arrowflight>
        <enable_ssl>true</enable_ssl>
        <ssl_cert_file>/path/to/server-cert.pem</ssl_cert_file>
        <ssl_key_file>/path/to/server-key.pem</ssl_key_file>
    </arrowflight>
</clickhouse>
```

TLS を有効にしている場合、クライアントは `grpc://` ではなく `grpc+tls://` スキームで接続する必要があります。

## 認証 \{#authentication\}

Arrow Flight インターフェイスでは、2 つの認証方式がサポートされています。

### 基本認証 \{#basic-auth\}

クライアントは、標準の HTTP `Authorization: Basic` ヘッダーを使用して、ユーザー名とパスワードで認証を行います。認証に成功すると、サーバーはレスポンスヘッダーに Bearer トークンを返します。

### Bearer Token認証 \{#bearer-auth\}

後続のリクエストでは、Basic認証で返されたBearerトークンを、`Authorization: Bearer <token>` ヘッダーを使用して利用できます。トークンは使用のたびに自動的に更新され、`default_session_timeout` サーバー設定に従って失効します (デフォルト: 60秒) 。

### Pythonの例 \{#auth-python-example\}

```python
import pyarrow.flight as flight

client = flight.FlightClient("grpc://localhost:9090")

# Basic auth returns a bearer token for subsequent calls
token_pair = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token_pair])
```

TLS を使用する場合：

```python
import pyarrow.flight as flight

with open("ca-cert.pem", "rb") as f:
    tls_root_certs = f.read()

client = flight.FlightClient(
    "grpc+tls://localhost:9090",
    tls_root_certs=tls_root_certs,
)

token_pair = client.authenticate_basic_token("default", "password")
options = flight.FlightCallOptions(headers=[token_pair])
```

## セッション管理 \{#session-management\}

Arrow Flight インターフェイスは、カスタム gRPC メタデータヘッダーを通じて ClickHouse セッションをサポートします。

| Header                         | Description                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `x-clickhouse-session-id`      | セッション識別子。指定した場合、複数のリクエストで同じセッション状態 (一時テーブル、設定) が共有されます。                                             |
| `x-clickhouse-session-timeout` | 秒単位のセッションタイムアウト。`max_session_timeout` を超えることはできません。                                                 |
| `x-clickhouse-session-check`   | セッションを作成せずに存在確認を行うには、`1` に設定します。                                                                    |
| `x-clickhouse-session-close`   | リクエスト完了後にセッションを閉じるには、`1` に設定します。これを使用するには、サーバー設定で `enable_arrow_close_session` を `true` にする必要があります。 |

:::note
Arrow Flight は HTTP/2 上で gRPC を使用するため、メタデータヘッダー名は大文字と小文字を区別し、ここに示したとおり、正確に小文字で指定する必要があります (例: `x-clickhouse-session-id`。`X-ClickHouse-Session-Id` ではありません) 。これは、HTTP/2 のフィールド名を小文字のみに限定している [RFC 9113, Section 8.2](https://www.rfc-editor.org/rfc/rfc9113#section-8.2) による要件です。ヘッダー名が大文字小文字を区別しない HTTP/1.1 とは異なります。
:::

セッションを使用すると、`SetSessionOptions` アクションを介して ClickHouse の設定を永続的に設定できます ([DoAction](#doaction) を参照) 。

## サーバー設定リファレンス \{#configuration-reference\}

| 設定                                                            | デフォルト   | 説明                                                                     |
| ------------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `arrowflight_port`                                            | —       | Arrow Flight サーバーのポート。この設定を指定した場合にのみ、サーバーが起動します。                       |
| `arrowflight.enable_ssl`                                      | `false` | TLS 暗号化を有効にします。                                                        |
| `arrowflight.ssl_cert_file`                                   | —       | TLS 証明書ファイルのパス。TLS を有効にする場合に必須です。                                      |
| `arrowflight.ssl_key_file`                                    | —       | TLS 秘密鍵ファイルのパス。TLS を有効にする場合に必須です。                                      |
| `arrowflight.tickets_lifetime_seconds`                        | `600`   | Flight チケットの有効期限が切れてクリーンアップされるまでの時間 (秒) 。チケットの自動失効を無効にするには `0` に設定します。 |
| `arrowflight.cancel_ticket_after_do_get`                      | `false` | `true` の場合、`DoGet` で消費された直後にチケットをキャンセルし、メモリを解放します。                     |
| `arrowflight.poll_descriptors_lifetime_seconds`               | `600`   | poll descriptor の有効期限が切れるまでの時間 (秒) 。自動失効を無効にするには `0` に設定します。           |
| `arrowflight.cancel_flight_descriptor_after_poll_flight_info` | `false` | `true` の場合、`PollFlightInfo` で消費された後に poll descriptor をキャンセルします。        |
| `enable_arrow_close_session`                                  | `true`  | `x-clickhouse-session-close` ヘッダーを介してクライアントがセッションを閉じられるようにします。         |
| `default_session_timeout`                                     | `60`    | デフォルトのセッションタイムアウト (秒) 。Bearer トークンの有効期限も制御します。                         |
| `max_session_timeout`                                         | `3600`  | 許可されるセッションタイムアウトの最大値 (秒) 。                                             |

## 対応している RPC メソッド \{#rpc-methods\}

### GetFlightInfo \{#getflightinfo\}

クエリを実行し、結果のschema、データ取得用チケットを含むエンドポイント、行数、およびバイト数を含む`FlightInfo`を返します。

受け付ける`FlightDescriptor`は、次のいずれかです。

* **PATH ディスクリプタ**: テーブル名として解釈される、1つの部分からなるパスです。`SELECT * FROM <table>`を生成します。
* **CMD ディスクリプタ**: 生のSQLクエリ文字列、またはシリアライズされた Flight SQL protobuf command のいずれかです ([Flight SQL Commands](#flight-sql-commands)を参照) 。

クエリは最後まで実行され、結果はサーバー側のチケットに保存されます。各データブロックごとに個別のエンドポイント/チケットが生成されるため、クライアントはデータを並列に取得できます。

```python
# Query by table name
descriptor = flight.FlightDescriptor.for_path("my_table")
info = client.get_flight_info(descriptor, options)

# Query by SQL
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM my_table WHERE id > 100"
)
info = client.get_flight_info(descriptor, options)

# Retrieve results
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

### PollFlightInfo \{#pollflightinfo\}

長時間実行されるクエリについて、結果を段階的に取得できるようにします。`GetFlightInfo` のようにクエリ全体の完了を待つのではなく、`PollFlightInfo` は結果をブロック単位で返します。

最初の呼び出しでクエリの実行が開始され、レスポンスには次が含まれます。

* その時点で利用可能なデータブロックの エンドポイント を含む `FlightInfo`
* 次回のポーリング用の `FlightDescriptor` (さらに結果が見込まれる場合)

返されたディスクリプタを使って後続の呼び出しを行うと、追加のブロックを取得できます。これ以上利用可能なデータがない場合、レスポンスには次のディスクリプタは含まれません。

:::note
現在の実装では、データブロックが利用可能になるまで待機し、データがない場合に即座に返すことはありません。
:::

### GetSchema \{#getschema\}

完全なクエリを実行せずに、クエリ結果の Arrow schema を返します。`GetFlightInfo` と同じディスクリプタ型を受け付けます。

```python
descriptor = flight.FlightDescriptor.for_command(
    "SELECT 1 AS x, 'hello' AS y"
)
schema_result = client.get_schema(descriptor, options)
schema = schema_result.schema
print(schema)  # x: int32, y: string
```

### DoGet \{#doget\}

指定されたチケットのデータを取得します。指定できるのは、次のいずれかです。

* `GetFlightInfo` または `PollFlightInfo` が返すチケット。
* チケット値として指定する、生の SQL クエリ文字列。

```python
# Using a ticket from GetFlightInfo
reader = client.do_get(endpoint.ticket, options)
table = reader.read_all()

# Using a raw SQL query as ticket
ticket = flight.Ticket("SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket, options)
table = reader.read_all()
```

### DoPut \{#doput\}

ClickHouse にデータを送信します。`FlightDescriptor` と Arrow のレコードバッチのストリームを受け取ります。

**テーブル名を指定して挿入** (PATH ディスクリプタ) :

```python
schema = pa.schema([("id", pa.int64()), ("name", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3]), pa.array(["Alice", "Bob", "Charlie"])],
    schema=schema,
)

descriptor = flight.FlightDescriptor.for_path("my_table")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**SQL による挿入** (CMD ディスクリプタ) :

```python
descriptor = flight.FlightDescriptor.for_command(
    "INSERT INTO my_table FORMAT Arrow"
)
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**Flight SQL `CommandStatementUpdate` による DDL/DML の実行:**

Flight SQL クライアントでは、DDL/DML 文 (CREATE、INSERT、ALTER など) の実行に `CommandStatementUpdate` を使用します。レスポンスには、影響を受けた行数が含まれます。

**Flight SQL `CommandStatementIngest` による一括取り込み:**

サポートされるのは、既存テーブルへの追記のみです (`TABLE_NOT_EXIST_OPTION_FAIL` + `TABLE_EXISTS_OPTION_APPEND`) 。このコマンドでは、カタログと一時テーブルはサポートされません。

:::note
データ転送で受け付けるのは `Arrow` フォーマットのみです。SQL でほかのフォーマット (例: `FORMAT JSON`) を指定すると、エラーになります。
:::

### DoAction \{#doaction\}

名前付きアクションを実行します。サポートされているアクションは次のとおりです。

#### CancelFlightInfo \{#cancelflightinfo\}

`FlightInfo` に関連付けられた実行中のクエリをキャンセルします。クエリ ID は `FlightInfo` の `app_metadata` フィールドから抽出されます。また、そのクエリに関連付けられたポーリングディスクリプタもキャンセルします。

```python
# Start a long-running query via PollFlightInfo, then cancel it
cancel_request = flight.CancelFlightInfoRequest(info)
result = client.cancel_flight_info(cancel_request, options)
# result.status is CancelStatus.CANCELLED if successful
```

#### SetSessionOptions \{#setsessionoptions\}

現在のセッションに対する ClickHouse サーバー設定を行います。`x-clickhouse-session-id` ヘッダーでセッション ID を設定しておく必要があります。

サポートされる値の型: string、boolean、integer、double、string リスト。

設定名が不明な場合は、エラー `INVALID_NAME` が返されます。値を解析できない場合は、エラー `INVALID_VALUE` が返されます。

#### GetSessionOptions \{#getsessionoptions\}

現在のセッションにおけるすべての ClickHouse 設定とその値を返します。設定名から文字列値へのマップを返します (内部的には `system.settings` をクエリします) 。

## Flight SQL コマンド \{#flight-sql-commands\}

`CMD` ディスクリプタにシリアライズされた [Flight SQL protobuf](https://arrow.apache.org/docs/format/FlightSql.html) メッセージが含まれている場合、ClickHouse は以下のコマンドを処理します。

### GetFlightInfo / GetSchema でサポートされるコマンド \{#flightsql-getflightinfo\}

| Command                 | Description                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- |
| `CommandStatementQuery` | 任意の SQL クエリを実行します。                                                            |
| `CommandGetSqlInfo`     | サーバーのメタデータ (名前、バージョン、Arrow のバージョン、機能) を取得します。                                 |
| `CommandGetCatalogs`    | カタログを一覧表示します。空の結果を返します (ClickHouse はカタログを使用しません) 。                            |
| `CommandGetDbSchemas`   | データベースを一覧表示します。省略可能な `db_schema_filter_pattern` (SQL の `LIKE` パターン) をサポートします。 |
| `CommandGetTables`      | テーブルを一覧表示します。schema、テーブル名、テーブルタイプのフィルターと、schema を含める省略可能な設定をサポートします。          |
| `CommandGetTableTypes`  | テーブルエンジンの種類 (`system.table_engines` から) を一覧表示します。                             |
| `CommandGetPrimaryKeys` | 指定したテーブルの主キーカラムを取得します。                                                        |

### DoPut でサポート \{#flightsql-doput\}

| Command                  | 説明                                                       |
| ------------------------ | -------------------------------------------------------- |
| `CommandStatementUpdate` | DDL/DML 文 (CREATE、INSERT、ALTER など) を実行します。影響を受けた行数を返します。 |
| `CommandStatementIngest` | Arrow データを既存のテーブルに一括挿入します。サポートされるのは追記モードのみです。            |

### 未実装 \{#flightsql-not-implemented\}

| コマンド                             | ステータス                           |
| -------------------------------- | ------------------------------- |
| `CommandGetCrossReference`       | 未実装                             |
| `CommandGetExportedKeys`         | 未実装                             |
| `CommandGetImportedKeys`         | 未実装                             |
| `CommandStatementSubstraitPlan`  | 未サポート (Substrait はサポートされていません)  |
| `CommandPreparedStatementQuery`  | 未実装                             |
| `CommandPreparedStatementUpdate` | 未実装                             |

## 完全なサンプル \{#complete-example\}

```python
import pyarrow as pa
import pyarrow.flight as flight

# Connect and authenticate
client = flight.FlightClient("grpc://localhost:9090")
token = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token])

# Insert data using DoPut with a PATH descriptor
schema = pa.schema([("id", pa.uint32()), ("value", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3], type=pa.uint32()), pa.array(["a", "b", "c"])],
    schema=schema,
)
descriptor = flight.FlightDescriptor.for_path("test")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()

# Query data using GetFlightInfo + DoGet
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM test ORDER BY id"
)
info = client.get_flight_info(descriptor, options)
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

出力:

```text
   id value
0   1     a
1   2     b
2   3     c
```

## データフォーマット \{#data-format\}

すべてのデータは Apache Arrow IPC フォーマットで転送されます。サポートされるのは `Arrow` フォーマットのみで、その他の ClickHouse フォーマット (例: `FORMAT JSON`、`FORMAT CSV`) を指定するとエラーが発生します。

ClickHouse のデータ型は、シリアライゼーション時に Arrow の型へマッピングされます。設定 `output_format_arrow_unsupported_types_as_binary` は、サポート対象外の ClickHouse 型をバイナリブロブとしてシリアライズするかどうかを制御します。

## 互換性 \{#compatibility\}

Arrow Flight インターフェイスは、Arrow Flight または Arrow Flight SQL プロトコルをサポートするあらゆるクライアントやツールと互換性があり、以下が含まれます。

* Python (`pyarrow`)
* Java (`org.apache.arrow.flight`)
* C++ (`arrow::flight`)
* Go (`apache/arrow/go`)
* ADBC (Arrow Database Connectivity) ドライバー
* DBeaver、および Flight SQL をサポートするその他のツール

お使いのツールでネイティブの ClickHouse コネクタ (例: JDBC、ODBC、ネイティブプロトコル) を利用できる場合は、パフォーマンスまたはフォーマットの互換性のために Arrow Flight が特に必要でない限り、そちらの使用を優先してください。

## クライアント側の ArrowFlight 機能 \{#client-side\}

ClickHouse は、外部の Arrow Flight サーバーからデータを読み取るための Flight クライアントとして動作することもできます。次を参照してください。

* [ArrowFlight テーブルエンジン](/engines/table-engines/integrations/arrowflight)
* [arrowFlight テーブル関数](/sql-reference/table-functions/arrowflight)

## 関連項目 \{#see-also\}

* [Apache Arrow Flight specification](https://arrow.apache.org/docs/format/Flight.html)
* [Apache Arrow Flight SQL specification](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouseのArrowフォーマット](/interfaces/formats/Arrow)