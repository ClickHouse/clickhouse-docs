---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'ClickHouse への接続のための公式 C# クライアント。'
title: 'ClickHouse C# ドライバ'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_csharp from '@site/static/images/_snippets/connection-details-csharp.png';


# ClickHouse C# クライアント \{#clickhouse-c-client\}

ClickHouse に接続するための公式の C# クライアントです。
クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-cs) で公開されています。
当初は [Oleg V. Kozlyuk](https://github.com/DarkWanderer) によって開発されました。

このライブラリは 2 つの主要な API を提供します:

- **`ClickHouseClient`**（推奨）: シングルトンとしての利用を想定した、高レベルかつスレッドセーフなクライアントです。クエリおよびバルク挿入のためのシンプルな非同期 API を提供します。ほとんどのアプリケーションに最適です。

- **ADO.NET** (`ClickHouseDataSource`, `ClickHouseConnection`, `ClickHouseCommand`): 標準的な .NET のデータベース抽象化です。ORM（Dapper、Linq2db）との統合が必要な場合や、ADO.NET 互換性が必要な場合に使用します。`ClickHouseBulkCopy` は、ADO.NET 接続を使用してデータを効率的に挿入するためのヘルパークラスです。`ClickHouseBulkCopy` は非推奨であり、将来のリリースで削除される予定です。代わりに `ClickHouseClient.InsertBinaryAsync` を使用してください。

両方の API は同じ基盤となる HTTP 接続プールを共有しており、同一アプリケーション内で併用できます。

## 移行ガイド \{#migration-guide\}

1. `.csproj` ファイルでパッケージ名を `ClickHouse.Driver` に変更し、[NuGet 上の最新バージョン](https://www.nuget.org/packages/ClickHouse.Driver) を指定します。
2. コードベース内のすべての `ClickHouse.Client` 参照を `ClickHouse.Driver` に更新します。

---

## 対応している .NET バージョン \{#supported-net-versions\}

`ClickHouse.Driver` は、次の .NET バージョンに対応しています。

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

## インストール \{#installation\}

NuGet からパッケージをインストールします：

```bash
dotnet add package ClickHouse.Driver
```

または、NuGet パッケージ マネージャーを使用します:

```bash
Install-Package ClickHouse.Driver
```


## クイックスタート \{#quick-start\}

```csharp
using ClickHouse.Driver;

// Create a client (typically as a singleton)
using var client = new ClickHouseClient("Host=my.clickhouse;Protocol=https;Port=8443;Username=user");

// Execute a query
var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine(version);
```


## 設定 \{#configuration\}

ClickHouse への接続を構成する方法は 2 つあります。

* **接続文字列:** ホスト、認証情報、その他の接続オプションを指定する、セミコロン区切りのキー/値ペアです。
* **`ClickHouseClientSettings` オブジェクト:** 設定ファイルから読み込むこともコード内で設定することもできる、厳密に型付けされた構成オブジェクトです。

以下に、すべての設定項目、そのデフォルト値、およびそれらが与える影響の一覧を示します。

### 接続設定 \{#connection-settings\}

| プロパティ | 型 | デフォルト値 | 接続文字列キー | 説明 |
|----------|------|---------|----------------------|-------------|
| Host | `string` | `"localhost"` | `Host` | ClickHouse サーバーのホスト名または IP アドレス |
| Port | `ushort` | 8123 (HTTP) / 8443 (HTTPS) | `Port` | ポート番号。プロトコルに応じたデフォルト値を使用します |
| Username | `string` | `"default"` | `Username` | 認証ユーザー名 |
| Password | `string` | `""` | `Password` | 認証パスワード |
| Database | `string` | `""` | `Database` | デフォルトデータベース。空の場合はサーバー／ユーザーのデフォルトを使用します |
| Protocol | `string` | `"http"` | `Protocol` | 接続プロトコル: `"http"` または `"https"` |
| Path | `string` | `null` | `Path` | リバースプロキシ構成時に使用する URL パス（例: `/clickhouse`） |
| Timeout | `TimeSpan` | 2 minutes | `Timeout` | 操作のタイムアウト値（接続文字列内では秒として保存） |

### データ形式とシリアライゼーション \{#data-format-serialization\}

| プロパティ | 型 | デフォルト | 接続文字列キー | 説明 |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | データ転送時に gzip 圧縮を有効にする |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | 任意精度の数値に `ClickHouseDecimal` を使用。false の場合は .NET の `decimal`（128 ビット上限）を使用 |
| ReadStringsAsByteArrays | `bool` | `false` | `ReadStringsAsByteArrays` | `String` および `FixedString` カラムを `string` ではなく `byte[]` として読み取る（バイナリデータを扱う場合に便利） |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | パラメータを URL のクエリ文字列ではなくフォームデータとして送信 |
| JsonReadMode | `JsonReadMode` | `Binary` | `JsonReadMode` | JSON データの返され方: `Binary`（`JsonObject` を返す）または `String`（生の JSON 文字列を返す） |
| JsonWriteMode | `JsonWriteMode` | `String` | `JsonWriteMode` | JSON データの送信方法: `String`（`JsonSerializer` 経由でシリアライズし、あらゆる入力を受け付ける）または `Binary`（型ヒント付きの登録済み POCO のみ） |

### セッション管理 \{#session-management\}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| UseSession | `bool` | `false` | `UseSession` | ステートフルセッションを有効化し、リクエストを直列実行します |
| SessionId | `string` | `null` | `SessionId` | セッション ID。null かつ UseSession が true の場合、自動的に GUID を生成します |

:::note
`UseSession` フラグを有効にすると、サーバーセッションが永続化され、`SET` 文や一時テーブルを使用できるようになります。セッションは 60 秒間アクティビティがない場合（デフォルトのタイムアウト）にリセットされます。セッションの有効期間は、ClickHouse ステートメントまたはサーバー設定でセッション設定を行うことで延長できます。

`ClickHouseConnection` クラスは通常、並列実行（複数スレッドによる同時クエリ実行）を許可します。しかし、`UseSession` フラグを有効にすると、任意の時点で 1 接続あたり 1 つのアクティブなクエリに制限されます（これはサーバー側の制約です）。
:::

### セキュリティ \{#security\}

| プロパティ | 型 | 既定値 | 接続文字列キー | 説明 |
|----------|------|---------|----------------------|-------------|
| SkipServerCertificateValidation | `bool` | `false` | — | HTTPS サーバー証明書の検証をスキップします。**本番環境では使用しないでください** |

### HTTP クライアントの構成 \{#http-client-configuration\}

| プロパティ | 型 | 既定値 | 接続文字列キー | 説明 |
|----------|------|---------|----------------------|-------------|
| HttpClient | `HttpClient` | `null` | — | カスタム設定済みの HttpClient インスタンス |
| HttpClientFactory | `IHttpClientFactory` | `null` | — | HttpClient インスタンスを作成するためのカスタムファクトリ |
| HttpClientName | `string` | `null` | — | 特定のクライアントを作成するために HttpClientFactory で使用する名前 |

### ロギングとデバッグ \{#logging-debugging\}

| プロパティ | 型 | 既定値 | 接続文字列キー | 説明 |
|----------|------|---------|----------------------|-------------|
| LoggerFactory | `ILoggerFactory` | `null` | — | 診断ログ用の LoggerFactory |
| EnableDebugMode | `bool` | `false` | — | .NET ネットワークトレースを有効にする（ログレベルが Trace に設定された LoggerFactory が必要）；**パフォーマンスに大きく影響します** |

### カスタム設定とロール \{#custom-settings-roles\}

| プロパティ | 型 | デフォルト | 接続文字列キー | 説明 |
|----------|------|---------|----------------------|-------------|
| CustomSettings | `IDictionary<string, object>` | 空 | `set_*` プレフィックス | ClickHouse サーバーの設定。下記の注記を参照 |
| Roles | `IReadOnlyList<string>` | 空 | `Roles` | カンマ区切りの ClickHouse ロール（例: `Roles=admin,reader`） |

:::note
接続文字列を使用してカスタム設定を指定する場合は、`set_` プレフィックスを使用します（例: `set_max_threads=4`）。ClickHouseClientSettings オブジェクトを使用する場合は、`set_` プレフィックスは使用しないでください。

利用可能な設定の一覧は[こちら](https://clickhouse.com/docs/operations/settings/settings)を参照してください。
:::

---

### 接続文字列の例 \{#connection-string-examples\}

#### 基本的な接続 \{#basic-connection\}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```


#### カスタム ClickHouse 設定を利用する \{#with-custom-clickhouse-settings\}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```

***


### QueryOptions \{#query-options\}

`QueryOptions` を使用すると、クライアントレベルの設定をクエリごとに上書きできます。すべてのプロパティは任意指定であり、指定された場合にのみクライアントのデフォルト設定を上書きします。

| Property         | Type                          | Description                                                                   |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| QueryId          | `string`                      | `system.query_log` 内でのトラッキングやキャンセルのためのカスタムクエリ識別子                              |
| Database         | `string`                      | このクエリに対してデフォルトデータベースを上書きする                                                    |
| Roles            | `IReadOnlyList<string>`       | このクエリに対してクライアントロールを上書きする                                                      |
| CustomSettings   | `IDictionary<string, object>` | このクエリ用の ClickHouse サーバー設定（例: `max_threads`）                                   |
| CustomHeaders    | `IDictionary<string, string>` | このクエリに対して追加で送信する HTTP ヘッダー                                                    |
| UseSession       | `bool?`                       | このクエリに対するセッション動作を上書きする                                                        |
| SessionId        | `string`                      | このクエリのセッション ID（`UseSession = true` が必要）                                       |
| BearerToken      | `string`                      | このクエリに対する認証トークンを上書きする                                                         |
| MaxExecutionTime | `TimeSpan?`                   | サーバー側のクエリタイムアウト（`max_execution_time` SETTING として渡される）。超過した場合、サーバーはクエリをキャンセルする |

**例:**

```csharp
var options = new QueryOptions
{
    QueryId = "report-2024-001",
    Database = "analytics",
    CustomSettings = new Dictionary<string, object>
    {
        { "max_threads", 4 },
        { "max_memory_usage", 10_000_000_000 }
    },
    MaxExecutionTime = TimeSpan.FromMinutes(5)
};

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM large_table",
    parameters: null,
    options: options
);
```

***


### InsertOptions \{#insert-options\}

`InsertOptions` は、`InsertBinaryAsync` による一括挿入処理に特化した設定を追加した `QueryOptions` の拡張です。

| Property               | Type              | Default     | Description                                         |
| ---------------------- | ----------------- | ----------- | --------------------------------------------------- |
| BatchSize              | `int`             | 100,000     | バッチあたりの行数                                           |
| MaxDegreeOfParallelism | `int`             | 1           | 並列で実行されるバッチアップロード数                                  |
| Format                 | `RowBinaryFormat` | `RowBinary` | バイナリフォーマット: `RowBinary` または `RowBinaryWithDefaults` |

すべての `QueryOptions` プロパティは `InsertOptions` でも利用可能です。

**例:**

```csharp
var insertOptions = new InsertOptions
{
    BatchSize = 50_000,
    MaxDegreeOfParallelism = 4,
    QueryId = "bulk-import-001"
};

long rowsInserted = await client.InsertBinaryAsync(
    "my_table",
    columns,
    rows,
    insertOptions
);
```


## ClickHouseClient \{#clickhouse-client\}

`ClickHouseClient` は、ClickHouse とやり取りするために推奨される API です。スレッドセーフで、シングルトンとしての利用を想定して設計されており、内部で HTTP 接続のプーリングを管理します。

### クライアントの作成 \{#creating-a-client\}

接続文字列または `ClickHouseClientSettings` オブジェクトを使用して `ClickHouseClient` を作成します。利用可能なオプションについては、「[Configuration](#configuration)」セクションを参照してください。

ClickHouse Cloud サービスの接続情報は、ClickHouse Cloud コンソールで確認できます。

サービスを選択し、**Connect** をクリックします。

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud サービス接続ボタン" border />

**C#** を選択します。接続情報が下に表示されます。

<Image img={connection_details_csharp} size="md" alt="ClickHouse Cloud の C# 接続情報" border />

セルフマネージドの ClickHouse を使用している場合、接続情報は ClickHouse 管理者によって設定されます。

接続文字列を使用する場合:

```csharp
using ClickHouse.Driver;

using var client = new ClickHouseClient("Host=localhost;Username=default;Password=secret");
```

または `ClickHouseClientSettings` を使用します:

```csharp
using ClickHouse.Driver;

var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    Username = "default",
    Password = "secret"
};
using var client = new ClickHouseClient(settings);
```

依存性の注入が必要なシナリオでは、`IHttpClientFactory` を使用します。

```csharp
// In your DI configuration
services.AddHttpClient("ClickHouse", client =>
{
    client.Timeout = TimeSpan.FromMinutes(5);
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
});

// Create client with factory
var factory = serviceProvider.GetRequiredService<IHttpClientFactory>();
var client = new ClickHouseClient("Host=localhost", factory, "ClickHouse");
```

:::note
`ClickHouseClient` は長期間存続させ、アプリケーション全体で共有して利用することを想定して設計されています。通常はシングルトンとして一度だけ作成し、すべてのデータベース操作で再利用してください。クライアントは内部で HTTP 接続のプーリングを管理します。
:::

***


### クエリの実行 \{#executing-queries\}

結果を返さない文には `ExecuteNonQueryAsync` を使用します。

```csharp
// Create a table
await client.ExecuteNonQueryAsync(
    "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory"
);

// Drop a table
await client.ExecuteNonQueryAsync("DROP TABLE IF EXISTS default.my_table");
```

単一の値を取得するには、`ExecuteScalarAsync` を使用します：

```csharp
var count = await client.ExecuteScalarAsync("SELECT count() FROM default.my_table");
Console.WriteLine($"Row count: {count}");

var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine($"Server version: {version}");
```

***


### データの挿入 \{#inserting-data\}

#### パラメーター化された INSERT \{#parameterized-inserts\}

`ExecuteNonQueryAsync` を使用して、パラメーター化されたクエリでデータを挿入します。パラメーターの型は、SQL 内で `{name:Type}` 構文を使って指定します。

```csharp
using ClickHouse.Driver;
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.AddParameter("id", 1L);
parameters.AddParameter("name", "Alice");

await client.ExecuteNonQueryAsync(
    "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})",
    parameters
);
```

***


#### バルク挿入 \{#bulk-insert\}

大量の行を効率的に挿入するには、`InsertBinaryAsync` を使用します。これは ClickHouse のネイティブな行バイナリ形式でデータをストリーミングし、並列バッチアップロードをサポートすることで、パラメータ化されたクエリで発生しうる「URL too long」エラーを回避します。

```csharp
// Prepare data as IEnumerable<object[]>
var rows = Enumerable.Range(0, 1_000_000)
    .Select(i => new object[] { (long)i, $"value{i}" });

var columns = new[] { "id", "name" };

// Basic insert
long rowsInserted = await client.InsertBinaryAsync("default.my_table", columns, rows);
Console.WriteLine($"Rows inserted: {rowsInserted}");
```

大規模なデータセットを扱う場合は、`InsertOptions` を使用してバッチ処理と並列処理を設定します。

```csharp
var options = new InsertOptions
{
    BatchSize = 100_000,           // Rows per batch (default: 100,000)
    MaxDegreeOfParallelism = 4     // Parallel batch uploads (default: 1)
};
```

:::note

* クライアントは挿入前に `SELECT * FROM <table> WHERE 1=0` を実行してテーブル構造を自動的に取得します。指定する値は対象カラムの型と一致している必要があります。
* `MaxDegreeOfParallelism > 1` の場合、バッチは並列にアップロードされます。セッションは並列挿入と互換性がないため、セッションを無効化するか、`MaxDegreeOfParallelism = 1` を設定してください。
* 指定していないカラムに対してサーバー側で DEFAULT 値を適用させたい場合は、`InsertOptions.Format` で `RowBinaryFormat.RowBinaryWithDefaults` を使用してください。
  :::

***


### データの読み取り \{#reading-data\}

`ExecuteReaderAsync` を使用して SELECT クエリを実行します。返される `ClickHouseDataReader` により、`GetInt64()`、`GetString()`、`GetFieldValue<T>()` などのメソッドを通じて、結果カラムへ型付きでアクセスできます。

`Read()` を呼び出して次の行に進みます。行がこれ以上ない場合は `false` を返します。カラムには、インデックス（0 から始まる）またはカラム名でアクセスできます。

```csharp
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.AddParameter("max_id", 100L);

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM default.my_table WHERE id < {max_id:Int64}",
    parameters
);

while (reader.Read())
{
    Console.WriteLine($"Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
}
```

***


### SQL パラメータ \{#sql-parameters\}

ClickHouse では、SQL クエリ内で使用するパラメータの標準的な形式は `{parameter_name:DataType}` です。

**例：**

```sql
SELECT {value:Array(UInt16)} as a
```

```sql
SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}
```

```sql
INSERT INTO table VALUES ({val1:Int32}, {val2:Array(UInt8)})
```

:::note
SQL「bind」パラメータは HTTP URI のクエリパラメータとして渡されるため、数が多すぎると「URL too long」例外が発生する可能性があります。この制限を回避するために、一括データ挿入には `InsertBinaryAsync` を使用してください。
:::

***


### クエリ ID \{#query-id\}

すべてのクエリには一意の `query_id` が割り当てられ、`system.query_log` テーブルからデータを取得したり、長時間実行中のクエリをキャンセルしたりする際に使用できます。`QueryOptions` でカスタムのクエリ ID を指定できます。

```csharp
var options = new QueryOptions
{
    QueryId = $"report-{Guid.NewGuid()}"
};

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM large_table",
    parameters: null,
    options: options
);
```

:::tip
カスタムの `QueryId` を指定する場合は、呼び出しごとに必ず一意になるようにしてください。ランダムな GUID を使用するのが有効です。
:::

***


### 生データストリーミング \{#raw-streaming\}

`ExecuteRawResultAsync` を使用すると、データリーダーを介さずに、クエリ結果を特定のフォーマットで直接ストリーミングできます。これは、データをファイルにエクスポートしたり、他のシステムへそのまま渡したりする場合に有用です。

```csharp
using var result = await client.ExecuteRawResultAsync(
    "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow"
);

await using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = await reader.ReadToEndAsync();
```

一般的なフォーマット: `JSONEachRow`、`CSV`、`TSV`、`Parquet`、`Native`。利用可能なすべてのオプションについては[フォーマットのドキュメント](/docs/interfaces/formats)を参照してください。

***


### Raw ストリームでの挿入 \{#raw-stream-insert\}

`InsertRawStreamAsync` を使用すると、CSV や JSON、Parquet などの形式、または [ClickHouse がサポートする任意のフォーマット](/docs/interfaces/formats) で、ファイルストリームまたはメモリストリームから直接データを挿入できます。

**CSV ファイルからの挿入:**

```csharp
await using var fileStream = File.OpenRead("data.csv");

using var response = await client.InsertRawStreamAsync(
    table: "my_table",
    stream: fileStream,
    format: "CSV",
    columns: ["id", "product", "price"] // Optional: specify columns
);
```

:::note
データ インジェストの挙動を制御するためのオプションについては、[format 設定のドキュメント](/docs/operations/settings/formats)を参照してください。
:::

***


### その他のサンプル \{#more-examples\}

さらに実践的な利用例については、GitHub リポジトリの [examples ディレクトリ](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples) を参照してください。

## ADO.NET \{#ado-net\}

このライブラリは、`ClickHouseConnection`、`ClickHouseCommand`、`ClickHouseDataReader` を通じて、完全な ADO.NET サポートを提供します。この API は、ORM（Dapper、Linq2db）との統合や、標準的な .NET のデータベース抽象化が必要な場合に利用します。

### ClickHouseDataSource によるライフタイム管理 \{#ado-net-datasource\}

適切なライフタイム管理と接続プーリングを行うために、**必ず `ClickHouseDataSource` から接続を作成してください**。`DataSource` は内部的に単一の `ClickHouseClient` を管理しており、すべての接続はその HTTP 接続プールを共有します。

```csharp
using ClickHouse.Driver.ADO;

// Create DataSource once (register as singleton in DI)
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default;Password=secret");

// Create lightweight connections as needed
await using var connection = await dataSource.OpenConnectionAsync();

// Use the connection
await using var command = connection.CreateCommand("SELECT version()");
var version = await command.ExecuteScalarAsync();
```

依存性注入の場合:

```csharp
// In Startup.cs or Program.cs
services.AddSingleton(sp =>
{
    var factory = sp.GetRequiredService<IHttpClientFactory>();
    return new ClickHouseDataSource("Host=localhost", factory, "ClickHouse");
});

// In your service
public class MyService
{
    private readonly ClickHouseDataSource _dataSource;

    public MyService(ClickHouseDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task DoWorkAsync()
    {
        await using var connection = await _dataSource.OpenConnectionAsync();
        // Use connection...
    }
}
```

:::warning
本番コードでは、**`ClickHouseConnection` を直接生成しないでください**。直接インスタンスを生成するたびに新しい HTTP クライアントとコネクションプールが作成され、負荷が高い状況ではソケット枯渇を引き起こす可能性があります。

```csharp
// DON'T DO THIS - creates new connection pool each time
using var conn = new ClickHouseConnection("Host=localhost");
await conn.OpenAsync();
```

その代わり、常に `ClickHouseDataSource` を使用するか、単一の `ClickHouseClient` インスタンスを共有してください。
:::

***


### ClickHouseCommand の使用 \{#ado-net-command\}

接続オブジェクトから SQL を実行するコマンドを作成します。

```csharp
await using var connection = await dataSource.OpenConnectionAsync();

// Create command with SQL
await using var command = connection.CreateCommand("SELECT * FROM my_table WHERE id = {id:Int64}");
command.AddParameter("id", 42L);

// Execute and read results
await using var reader = await command.ExecuteReaderAsync();
while (reader.Read())
{
    Console.WriteLine($"Name: {reader.GetString("name")}");
}
```

Command メソッド:

* `ExecuteNonQueryAsync()` - INSERT、UPDATE、DELETE や DDL 文の実行に使用
* `ExecuteScalarAsync()` - 最初の行の最初のカラムを返す
* `ExecuteReaderAsync()` - 結果を反復処理するための `ClickHouseDataReader` を返す

***


### ClickHouseDataReader の使用 \{#ado-net-reader\}

`ClickHouseDataReader` は、クエリ結果への型安全なアクセスを提供します。

```csharp
await using var reader = await command.ExecuteReaderAsync();

while (reader.Read())
{
    // Access by column index
    var id = reader.GetInt64(0);
    var name = reader.GetString(1);

    // Access by column name
    var email = reader.GetString("email");

    // Generic access
    var timestamp = reader.GetFieldValue<DateTime>("created_at");

    // Check for null
    if (!reader.IsDBNull("optional_field"))
    {
        var value = reader.GetString("optional_field");
    }
}
```


## ベストプラクティス \{#best-practices\}

### 接続の有効期間とプーリング \{#best-practices-connection-lifetime\}

`ClickHouse.Driver` は内部的に `System.Net.Http.HttpClient` を使用しています。`HttpClient` はエンドポイントごとに接続プールを持ちます。その結果:

* データベースセッションは、接続プールによって管理される HTTP 接続を通じて多重化されます。
* HTTP 接続はプールによって自動的にリサイクルされます。
* `ClickHouseClient` または `ClickHouseConnection` オブジェクトが破棄された後も、接続が維持される場合があります。

**推奨パターン:**

| シナリオ | 推奨アプローチ |
|----------|---------------------|
| 一般的な用途 | シングルトンの `ClickHouseClient` を使用する |
| ADO.NET / ORM | `ClickHouseDataSource` を使用する（同じプールを共有する接続を作成） |
| DI 環境 | `IHttpClientFactory` とともに `ClickHouseClient` または `ClickHouseDataSource` をシングルトンとして登録する |

:::important
カスタムの `HttpClient` または `HttpClientFactory` を使用する場合は、ハーフクローズド接続に起因するエラーを回避するために、`PooledConnectionIdleTimeout` をサーバー側の `keep_alive_timeout` より小さい値に設定してください。Cloud デプロイメントにおけるデフォルトの `keep_alive_timeout` は 10 秒です。
:::

:::warning
共有されていない `HttpClient` で複数の `ClickHouseClient` または単独の `ClickHouseConnection` インスタンスを作成することは避けてください。各インスタンスはそれぞれ独自の接続プールを作成します。
:::

---

### DateTime の扱い \{#best-practice-datetime\}

1. **可能な限り UTC を使用する。** タイムスタンプは `DateTime('UTC')` カラムとして保存し、コード内では `DateTimeKind.Utc` を使用します。これによりタイムゾーンに関する曖昧さを排除できます。

2. **明示的なタイムゾーン処理には `DateTimeOffset` を使用する。** 常に特定の瞬間を表し、オフセット情報を含みます。

3. **SQL の型ヒントでタイムゾーンを指定する。** `Unspecified` の DateTime 値を、UTC ではない DateTime カラムに対するパラメータとして使用する場合は、SQL 内にタイムゾーンを含めます:
   ```csharp
   var parameters = new ClickHouseParameterCollection();
   parameters.AddParameter("dt", myDateTime);

   await client.ExecuteNonQueryAsync(
       "INSERT INTO table (dt) VALUES ({dt:DateTime('Europe/Amsterdam')})",
       parameters
   );
   ```

---

### 非同期インサート \{#async-inserts\}

[Async inserts](/docs/optimize/asynchronous-inserts) は、バッチングの責務をクライアントからサーバーに移します。クライアント側でのバッチングを必要とする代わりに、サーバーが受信データをバッファし、設定可能なしきい値に基づいてストレージへフラッシュします。これは、多数のエージェントが小さなペイロードを送信するオブザーバビリティ・ワークロードのような、高い同時実行性が求められるシナリオで有用です。

`CustomSettings` または接続文字列を使用して非同期インサートを有効にします：

```csharp
// Using CustomSettings
var settings = new ClickHouseClientSettings("Host=localhost");
settings.CustomSettings["async_insert"] = 1;
settings.CustomSettings["wait_for_async_insert"] = 1; // Recommended: wait for flush acknowledgment

// Or via connection string
// "Host=localhost;set_async_insert=1;set_wait_for_async_insert=1"
```

**2 つのモード**（`wait_for_async_insert` で制御）:

| Mode                      | Behavior                                                  | Use case              |
| ------------------------- | --------------------------------------------------------- | --------------------- |
| `wait_for_async_insert=1` | データがディスクにフラッシュされてから INSERT の応答が返されます。エラーはクライアントに返されます。    | ほとんどのワークロードでの**推奨**設定 |
| `wait_for_async_insert=0` | データがバッファリングされた時点で直ちに INSERT の応答が返されます。データが永続化される保証はありません。 | データ損失が許容される場合のみ       |

:::warning
`wait_for_async_insert=0` の場合、エラーはフラッシュ時にのみ顕在化し、元の INSERT までさかのぼって追跡することはできません。クライアント側でもバックプレッシャーが一切かからないため、サーバー過負荷のリスクがあります。
:::

**主要な設定:**

| Setting                         | Description                    |
| ------------------------------- | ------------------------------ |
| `async_insert_max_data_size`    | バッファがこのサイズ（バイト数）に達したらフラッシュされます |
| `async_insert_busy_timeout_ms`  | このタイムアウト（ミリ秒）経過後にフラッシュされます     |
| `async_insert_max_query_number` | この数のクエリが蓄積したらフラッシュされます         |

***


### セッション \{#best-practices-sessions\}

サーバー側でステートフルな機能が必要な場合にのみ、セッションを有効にしてください。たとえば次のような場合です:

* 一時テーブル（`CREATE TEMPORARY TABLE`）
* 複数の文にまたがるクエリコンテキストの保持
* セッションレベルの設定（`SET max_threads = 4`）

セッションが有効な場合、同じセッションが同時に使用されないよう、リクエストは直列に処理されます。これは、セッション状態を必要としないワークロードに対してはオーバーヘッドとなります。

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    UseSession = true,
    SessionId = "my-session", // Optional -- will be auto-generated if not provided
};

using var client = new ClickHouseClient(settings);

await client.ExecuteNonQueryAsync("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await client.ExecuteNonQueryAsync("INSERT INTO temp_ids VALUES (1), (2), (3)");

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)"
);
```

**ADO.NET の使用（ORM との互換性のため）:**

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    UseSession = true,
    SessionId = "my-session",
};

var dataSource = new ClickHouseDataSource(settings);
await using var connection = await dataSource.OpenConnectionAsync();

await using var cmd1 = connection.CreateCommand("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await cmd1.ExecuteNonQueryAsync();

await using var cmd2 = connection.CreateCommand("INSERT INTO temp_ids VALUES (1), (2), (3)");
await cmd2.ExecuteNonQueryAsync();

await using var cmd3 = connection.CreateCommand("SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)");
await using var reader = await cmd3.ExecuteReaderAsync();
```


## サポートされているデータ型 \{#supported-data-types\}

`ClickHouse.Driver` は、すべての ClickHouse のデータ型をサポートします。以下の表では、データベースからデータを読み取る際の ClickHouse の型と .NET のネイティブ型とのマッピングを示します。

### 型マッピング: ClickHouse からの読み出し \{#clickhouse-native-type-map-reading\}

#### 整数型 \{#type-map-reading-integer\}

| ClickHouse 型 | .NET 型 |
|-----------------|-----------|
| Int8 | `sbyte` |
| UInt8 | `byte` |
| Int16 | `short` |
| UInt16 | `ushort` |
| Int32 | `int` |
| UInt32 | `uint` |
| Int64 | `long` |
| UInt64 | `ulong` |
| Int128 | `BigInteger` |
| UInt128 | `BigInteger` |
| Int256 | `BigInteger` |
| UInt256 | `BigInteger` |

---

#### 浮動小数点数型 \{#type-map-reading-floating-points\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

---

#### Decimal 型 \{#type-map-reading-decimal\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Decimal(P, S) | `decimal` / `ClickHouseDecimal` |
| Decimal32(S) | `decimal` / `ClickHouseDecimal` |
| Decimal64(S) | `decimal` / `ClickHouseDecimal` |
| Decimal128(S) | `decimal` / `ClickHouseDecimal` |
| Decimal256(S) | `decimal` / `ClickHouseDecimal` |

:::note
Decimal 型の変換は、UseCustomDecimals 設定で制御されます。
:::

---

#### ブール型 \{#type-map-reading-boolean\}

| ClickHouse 型 | .NET 型 |
|-----------------|-----------|
| Bool | `bool` |

---

#### 文字列型 \{#type-map-reading-strings\}

| ClickHouse 型 | .NET 型 |
|-----------------|-----------|
| String | `string` |
| FixedString(N) | `string` |

:::note
デフォルトでは、`String` と `FixedString(N)` の両方のカラムは `string` として返されます。代わりに `byte[]` として読み取るには、接続文字列で `ReadStringsAsByteArrays=true` を設定します。これは、UTF-8 として有効とは限らないバイナリデータを保存する場合に有用です。
:::

---

#### 日付および時刻型 \{#type-map-reading-datetime\}

| ClickHouse Type | .NET Type  |
| --------------- | ---------- |
| Date            | `DateTime` |
| Date32          | `DateTime` |
| DateTime        | `DateTime` |
| DateTime32      | `DateTime` |
| DateTime64      | `DateTime` |
| Time            | `TimeSpan` |
| Time64          | `TimeSpan` |

ClickHouse は `DateTime` および `DateTime64` の値を内部的には Unix タイムスタンプ（エポックからの経過秒数またはサブ秒単位）として保存します。保存は常に UTC ですが、カラムにはタイムゾーンを関連付けることができ、そのタイムゾーンに基づいて値の表示および解釈が行われます。

`DateTime` 値を読み取る際、`DateTime.Kind` プロパティはカラムのタイムゾーンに基づいて設定されます。

| Column Definition              | Returned DateTime.Kind | Notes            |
| ------------------------------ | ---------------------- | ---------------- |
| `DateTime('UTC')`              | `Utc`                  | 明示的な UTC タイムゾーン  |
| `DateTime('Europe/Amsterdam')` | `Unspecified`          | オフセットが適用される      |
| `DateTime`                     | `Unspecified`          | 壁時計の時刻がそのまま保持される |

UTC 以外のカラムの場合、返される `DateTime` はそのタイムゾーンにおける壁時計の時刻を表します。そのタイムゾーンに対する正しいオフセットを持つ `DateTimeOffset` を取得するには、`ClickHouseDataReader.GetDateTimeOffset()` を使用してください。

```csharp
var reader = (ClickHouseDataReader)await connection.ExecuteReaderAsync(
    "SELECT toDateTime('2024-06-15 14:30:00', 'Europe/Amsterdam')");
reader.Read();

var dt = reader.GetDateTime(0);    // 2024-06-15 14:30:00, Kind=Unspecified
var dto = reader.GetDateTimeOffset(0); // 2024-06-15 14:30:00 +02:00 (CEST)
```

明示的なタイムゾーンを持たないカラム（例: `DateTime('Europe/Amsterdam')` ではなく `DateTime`）の場合、ドライバーは `Kind=Unspecified` の `DateTime` を返します。これにより、タイムゾーンを仮定することなく、保存されている時刻（壁時計ベースの時刻）がそのまま正確に保持されます。

明示的なタイムゾーンを持たないカラムに対してタイムゾーンを考慮した動作が必要な場合は、次のいずれかを行ってください。

1. カラム定義で明示的なタイムゾーンを使用する: `DateTime('UTC')` または `DateTime('Europe/Amsterdam')`
2. 読み出し後に自分でタイムゾーンを適用する。

***


#### JSON 型 \{#type-map-reading-json\}

| ClickHouse Type | .NET Type    | Notes                        |
| --------------- | ------------ | ---------------------------- |
| Json            | `JsonObject` | デフォルト（`JsonReadMode=Binary`） |
| Json            | `string`     | `JsonReadMode=String` の場合    |

JSON カラムの戻り値の型は、`JsonReadMode` 設定によって制御されます。

* **`Binary`（デフォルト）**: `System.Text.Json.Nodes.JsonObject` を返します。JSON データへ構造化アクセスを提供しますが、IP アドレス、UUID、大きな小数などの特殊な ClickHouse 型は、JSON 構造内では文字列表現に変換されます。

* **`String`**: 生の JSON を `string` として返します。ClickHouse からの JSON 表現をそのまま保持するため、JSON をパースせずにそのまま渡したい場合や、自分でデシリアライズ処理を行いたい場合に有用です。

```csharp
// Configure string mode via settings
var settings = new ClickHouseClientSettings("Host=localhost")
{
    JsonReadMode = JsonReadMode.String
};

// Or via connection string
// "Host=localhost;JsonReadMode=String"
```

***


#### その他の型 \{#type-map-reading-other\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | 注記を参照 |
| Array(T) | `T[]` |
| Tuple(T1, T2, ...) | `Tuple<T1, T2, ...>` / `LargeTuple` |
| Map(K, V) | `Dictionary<K, V>` |
| Nullable(T) | `T?` |
| Enum8 | `string` |
| Enum16 | `string` |
| LowCardinality(T) | T と同じ |
| SimpleAggregateFunction | 基本型と同じ |
| Nested(...) | `Tuple[]` |
| Variant(T1, T2, ...) | 注記を参照 |
| QBit(T, dimension) | `T[]` |

:::note
Dynamic 型および Variant 型は、各行における実際の基本型に対応する型に変換されます。
:::

---

#### ジオメトリ型 \{#type-map-reading-geometry\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Point | `Tuple<double, double>` |
| Ring | `Tuple<double, double>[]` |
| LineString | `Tuple<double, double>[]` |
| Polygon | `Ring[]` |
| MultiLineString | `LineString[]` |
| MultiPolygon | `Polygon[]` |
| Geometry | 注を参照 |

:::note
Geometry 型は、任意のジオメトリ型を保持できる Variant 型であり、対応する型に変換されます。
:::

---

### 型マッピング: ClickHouse への書き込み \{#clickhouse-native-type-map-writing\}

データを挿入する際、ドライバーは .NET 型を対応する ClickHouse 型に変換します。以下の表は、各 ClickHouse カラム型に対して、どの .NET 型が利用できるかを示します。

#### 整数型 \{#type-map-writing-integer\}

| ClickHouse Type | 受け入れ可能な .NET 型 | 備考 |
|-----------------|------------------------|------|
| Int8 | `sbyte`, 任意の `Convert.ToSByte()` 互換の型 |  |
| UInt8 | `byte`, 任意の `Convert.ToByte()` 互換の型 |  |
| Int16 | `short`, 任意の `Convert.ToInt16()` 互換の型 |  |
| UInt16 | `ushort`, 任意の `Convert.ToUInt16()` 互換の型 |  |
| Int32 | `int`, 任意の `Convert.ToInt32()` 互換の型 |  |
| UInt32 | `uint`, 任意の `Convert.ToUInt32()` 互換の型 |  |
| Int64 | `long`, 任意の `Convert.ToInt64()` 互換の型 |  |
| UInt64 | `ulong`, 任意の `Convert.ToUInt64()` 互換の型 |  |
| Int128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, 任意の `Convert.ToInt64()` 互換の型 | |
| UInt128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, 任意の `Convert.ToInt64()` 互換の型 | |
| Int256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, 任意の `Convert.ToInt64()` 互換の型 | |
| UInt256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, 任意の `Convert.ToInt64()` 互換の型 | |

---

#### 浮動小数点型 \{#type-map-writing-floating-point\}

| ClickHouse Type | 対応する .NET 型 | 備考 |
|-----------------|------------------|------|
| Float32 | `float`、`Convert.ToSingle()` と互換性のある任意の型 |  |
| Float64 | `double`、`Convert.ToDouble()` と互換性のある任意の型 | |
| BFloat16 | `float`、`Convert.ToSingle()` と互換性のある任意の型 | 16 ビットの brain float 形式に切り捨てて変換 |
---

#### Boolean 型 \{#type-map-writing-boolean\}

| ClickHouse Type | 対応する .NET 型 | 備考 |
|-----------------|------------------|------|
| Bool | `bool` |  |

---

#### 文字列型 \{#type-map-writing-strings\}

| ClickHouse Type | 受け入れ可能な .NET 型 | 備考 |
|-----------------|------------------------|------|
| String | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | バイナリ型はそのまま書き込まれる。ストリームはシーク可能でも非シーク可能でもよい |
| FixedString(N) | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | 文字列は UTF-8 でエンコードされ、パディングされる。バイナリ型は長さがちょうど N バイトでなければならない |

---

#### 日付および時刻型 \{#type-map-writing-datetime\}

| ClickHouse Type | Accepted .NET Types                                               | Notes                                                               |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Date            | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | Unix 日数に変換され、UInt16 として扱われます                                        |
| Date32          | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | Unix 日数に変換され、Int32 として扱われます                                         |
| DateTime        | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | 詳細は以下を参照してください                                                      |
| DateTime32      | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | DateTime と同様の動作です                                                   |
| DateTime64      | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | 精度は Scale パラメータに基づきます                                               |
| Time            | `TimeSpan`, `int`                                                 | ±999:59:59 に制限されます。int は秒として扱われます                                   |
| Time64          | `TimeSpan`, `decimal`, `double`, `float`, `int`, `long`, `string` | 文字列は `[-]HHH:MM:SS[.fraction]` として解釈され、±999:59:59.999999999 に制限されます |

ドライバーは値を書き込む際に `DateTime.Kind` を考慮します:

| DateTime.Kind | HTTP パラメーター                                      | バルク                              |
| ------------- | ------------------------------------------------ | -------------------------------- |
| Utc           | 時刻（Instant）は正確に保持されます                            | 時刻（Instant）は正確に保持されます            |
| Local         | 時刻（Instant）は正確に保持されます                            | 時刻（Instant）は正確に保持されます            |
| Unspecified   | パラメーター型のタイムゾーンにおけるウォールクロック時刻として扱われます（デフォルトは UTC） | カラムのタイムゾーンにおけるウォールクロック時刻として扱われます |

`DateTimeOffset` の値は常にその時刻（Instant）を正確に保持します。

**例: UTC DateTime（Instant が保持される場合）**

```csharp
var utcTime = new DateTime(2024, 1, 15, 12, 0, 0, DateTimeKind.Utc);
// Stored as 12:00 UTC
// Read from DateTime('Europe/Amsterdam') column: 13:00 (UTC+1)
// Read from DateTime('UTC') column: 12:00 UTC
```

**例：未指定の DateTime（壁時計時刻）**

```csharp
var wallClock = new DateTime(2024, 1, 15, 14, 30, 0, DateTimeKind.Unspecified);
// Written to DateTime('Europe/Amsterdam') column: stored as 14:30 Amsterdam time
// Read back from DateTime('Europe/Amsterdam') column: 14:30
```

**推奨:** 最も単純で予測しやすい動作を得るために、すべての DateTime の操作で `DateTimeKind.Utc` または `DateTimeOffset` を使用してください。これにより、サーバーのタイムゾーン、クライアントのタイムゾーン、あるいはカラムのタイムゾーンに関わらず、コードが一貫して動作します。


#### HTTP パラメータ vs 一括コピー \{#datetime-http-param-vs-bulkcopy\}

`Unspecified` な DateTime 値を書き込む場合、HTTP パラメータバインディングと一括コピーには重要な違いがあります。

**Bulk Copy** は、対象カラムのタイムゾーンを把握しており、そのタイムゾーンとして `Unspecified` な値を正しく解釈します。

**HTTP Parameters** は、カラムのタイムゾーンを自動的には把握しません。SQL の型ヒントでタイムゾーンを明示的に指定する必要があります。

```csharp
// CORRECT: Timezone in SQL type hint - type is extracted automatically
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime('Europe/Amsterdam')})";
command.AddParameter("dt", myDateTime);

// INCORRECT: Without timezone hint, interpreted as UTC
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime})";
command.AddParameter("dt", myDateTime);
// String value "2024-01-15 14:30:00" interpreted as UTC, not Amsterdam time!
```

| `DateTime.Kind` | 対象カラム            | HTTP パラメータ (タイムゾーン ヒントあり) | HTTP パラメータ (タイムゾーン ヒントなし) | 一括コピー                  |
| --------------- | ---------------- | ------------------------- | ------------------------- | ---------------------- |
| `Utc`           | UTC              | 時刻インスタントが保持される            | 時刻インスタントが保持される            | 時刻インスタントが保持される         |
| `Utc`           | Europe/Amsterdam | 時刻インスタントが保持される            | 時刻インスタントが保持される            | 時刻インスタントが保持される         |
| `Local`         | 任意               | 時刻インスタントが保持される            | 時刻インスタントが保持される            | 時刻インスタントが保持される         |
| `Unspecified`   | UTC              | UTC として解釈される              | UTC として解釈される              | UTC として解釈される           |
| `Unspecified`   | Europe/Amsterdam | アムステルダムのローカル時間として解釈される    | **UTC として解釈される**          | アムステルダムのローカル時間として解釈される |

***


#### Decimal 型 \{#type-map-writing-decimal\}

| ClickHouse Type | 対応する .NET 型 | 備考 |
|-----------------|------------------|------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, 任意の `Convert.ToDecimal()` 互換型 | 指定された精度を超えた場合は `OverflowException` をスロー |
| Decimal32 | `decimal`, `ClickHouseDecimal`, 任意の `Convert.ToDecimal()` 互換型 | 最大精度 9 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, 任意の `Convert.ToDecimal()` 互換型 | 最大精度 18 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, 任意の `Convert.ToDecimal()` 互換型 | 最大精度 38 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, 任意の `Convert.ToDecimal()` 互換型 | 最大精度 76 |

---

#### JSON 型 \{#type-map-writing-json\}

| ClickHouse Type | 受け入れ可能な .NET 型                                | 備考                            |
| --------------- | --------------------------------------------- | ----------------------------- |
| Json            | `string`, `JsonObject`, `JsonNode`, 任意のオブジェクト | 動作は `JsonWriteMode` の設定に依存します |

JSON を書き込む際の挙動は `JsonWriteMode` 設定で制御されます:

| Input Type           | `JsonWriteMode.String` (デフォルト)            | `JsonWriteMode.Binary`                         |
| -------------------- | ----------------------------------------- | ---------------------------------------------- |
| `string`             | そのまま直接書き込まれる                              | `ArgumentException` をスローします                    |
| `JsonObject`         | `ToJsonString()` によりシリアライズされる             | `ArgumentException` をスローします                    |
| `JsonNode`           | `ToJsonString()` によりシリアライズされる             | `ArgumentException` をスローします                    |
| 登録済み POCO            | `JsonSerializer.Serialize()` によりシリアライズされる | 型ヒント付きでバイナリにエンコードされ、カスタムパス属性をサポートします           |
| 未登録の POCO / 匿名オブジェクト | `JsonSerializer.Serialize()` によりシリアライズされる | `ClickHouseJsonSerializationException` をスローします |

* **`String` (デフォルト)**: `string`、`JsonObject`、`JsonNode`、または任意のオブジェクトを受け入れます。すべての入力は `System.Text.Json.JsonSerializer` によりシリアライズされ、サーバー側でのパース用に JSON 文字列として送信されます。最も柔軟なモードであり、型の登録なしで動作します。

* **`Binary`**: 登録済みの POCO 型のみを受け入れます。データはクライアント側で ClickHouse のバイナリ JSON 形式に変換され、完全な型ヒントをサポートします。使用前に `connection.RegisterJsonSerializationType<T>()` を呼び出す必要があります。このモードで `string` や `JsonNode` の値を書き込もうとすると `ArgumentException` がスローされます。

```csharp
// Default String mode works with any input
await client.InsertBinaryAsync(
    "my_table",
    new[] { "id", "data" },
    new[] { new object[] { 1u, new { name = "test", value = 42 } } }
);

// Binary mode requires explicit opt-in and type registration
var settings = new ClickHouseClientSettings("Host=localhost")
{
    JsonWriteMode = JsonWriteMode.Binary
};
using var client = new ClickHouseClient(settings);
client.RegisterJsonSerializationType<MyPocoType>();
```


##### 型付き JSON カラム \{#json-typed-columns\}

JSON カラムに型ヒントが指定されている場合（例: `JSON(id UInt64, price Decimal128(2))`）、ドライバーはこれらのヒントを利用して、値を型情報を完全に保持した状態でシリアライズします。これにより、汎用的な JSON 形式としてシリアライズした場合に精度が失われてしまう `UInt64`、`Decimal`、`UUID`、`DateTime64` などの型の精度が保持されます。

##### POCO のシリアル化 \{#json-poco-serialization\}

POCO は、`JsonWriteMode` に応じて 2 通りの方法で JSON カラムに書き込むことができます。

**String モード (デフォルト)**: POCO は `System.Text.Json.JsonSerializer` を通じてシリアル化されます。型の登録は不要です。これは最も簡単な方法で、匿名オブジェクトにも対応します。

**Binary モード**: POCO はドライバーのバイナリ JSON フォーマットで、型ヒントを完全にサポートした形式でシリアル化されます。使用前に `connection.RegisterJsonSerializationType<T>()` で型を登録する必要があります。このモードでは、属性を用いたカスタム JSON パスへのマッピングをサポートします。

* **`[ClickHouseJsonPath("path")]`**: プロパティをカスタム JSON パスにマッピングします。ネストした構造や、プロパティ名と目的の JSON キー名が異なる場合に有用です。**Binary モードでのみ動作します。**

* **`[ClickHouseJsonIgnore]`**: シリアル化からプロパティを除外します。**Binary モードでのみ動作します。**

```sql
CREATE TABLE events (
    id UInt32,
    data JSON(`user.id` Int64, `user.name` String, Timestamp DateTime64(3))
) ENGINE = MergeTree() ORDER BY id
```

```csharp
using ClickHouse.Driver.Json;

public class UserEvent
{
    [ClickHouseJsonPath("user.id")]
    public long UserId { get; set; }

    [ClickHouseJsonPath("user.name")]
    public string UserName { get; set; }

    public DateTime Timestamp { get; set; }

    [ClickHouseJsonIgnore]
    public string InternalData { get; set; }  // Not serialized
}

// For Binary mode: Register the type and enable Binary mode
var settings = new ClickHouseClientSettings("Host=localhost") { JsonWriteMode = JsonWriteMode.Binary };
using var client = new ClickHouseClient(settings);
client.RegisterJsonSerializationType<UserEvent>();

// Insert POCO - serialized to JSON with nested structure via custom path attributes
await client.InsertBinaryAsync(
    "events",
    new[] { "id", "data" },
    new[] { new object[] { 1u, new UserEvent { UserId = 123, UserName = "Alice", Timestamp = DateTime.UtcNow } } }
);
// Resulting JSON: {"user": {"id": 123, "name": "Alice"}, "Timestamp": "2024-01-15T..."}
```

カラム型ヒントとのプロパティ名の照合は大文字・小文字を区別します。プロパティ `UserId` は `UserId` として定義されたヒントにのみ一致し、`userid` には一致しません。これは、`userName` と `UserName` のようなパスを別々のフィールドとして共存させることを許容する ClickHouse の挙動と一致します。

**制限事項（Binary モードのみ）：**

* シリアル化の前に、POCO 型は接続で `connection.RegisterJsonSerializationType<T>()` を使用して登録されている必要があります。未登録の型をシリアル化しようとすると `ClickHouseJsonSerializationException` がスローされます。
* Dictionary および配列/リストのプロパティは、正しくシリアル化するためにカラム定義内で型ヒントが必要です。ヒントがない場合は、代わりに String モードを使用してください。
* POCO プロパティの null 値は、パスがカラム定義で `Nullable(T)` 型ヒントを持つ場合にのみ書き込まれます。ClickHouse は動的 JSON パス内の `Nullable` 型を許可しないため、ヒントのない null プロパティはスキップされます。
* `ClickHouseJsonPath` および `ClickHouseJsonIgnore` 属性は String モードでは無視されます（Binary モードでのみ機能します）。

***


#### その他の型 \{#type-map-writing-other\}

| ClickHouse Type | 受け入れ可能な .NET 型 | 備考 |
|-----------------|------------------------|------|
| UUID | `Guid`, `string` | 文字列は Guid としてパースされる |
| IPv4 | `IPAddress`, `string` | IPv4 である必要がある。文字列は `IPAddress.Parse()` でパースされる |
| IPv6 | `IPAddress`, `string` | IPv6 である必要がある。文字列は `IPAddress.Parse()` でパースされる |
| Nothing | 任意 | 何も書き込まない（no-op） |
| Dynamic | — | **非対応**（`NotImplementedException` をスロー） |
| Array(T) | `IList`, `null` | null は空の配列として書き込まれる |
| Tuple(T1, T2, ...) | `ITuple`, `IList` | 要素数はタプルの要素数と一致している必要がある |
| Map(K, V) | `IDictionary` | |
| Nullable(T) | `null`, `DBNull`, または T が受け入れる型 | 値の前に null フラグのバイトを書き込む |
| Enum8 | `string`, `sbyte`, 数値型 | 文字列は Enum の Dictionary から検索される |
| Enum16 | `string`, `short`, 数値型 | 文字列は Enum の Dictionary から検索される |
| LowCardinality(T) | T が受け入れる型 | 基になる型に委譲される |
| SimpleAggregateFunction | 基になる型が受け入れる型 | 基になる型に委譲される |
| Nested(...) | タプルの `IList` | 要素数はフィールド数と一致している必要がある |
| Variant(T1, T2, ...) | T1, T2, ... のいずれかに一致する値 | 型が一致しない場合は `ArgumentException` をスロー |
| QBit(T, dim) | `IList` | Array に委譲される。dim はメタデータとしてのみ扱われる |

---

#### Geometry 型 \{#type-map-writing-geometry\}

| ClickHouse Type | 受け入れ可能な .NET 型 | 備考 |
|-----------------|------------------------|------|
| Point | `System.Drawing.Point`, `ITuple`, `IList` (要素数 2) |  |
| Ring | Point の `IList` | |
| LineString | Point の `IList` | |
| Polygon | Ring の `IList` | |
| MultiLineString | LineString の `IList` | |
| MultiPolygon | Polygon の `IList` | |
| Geometry | 上記の任意の Geometry 型 | すべての Geometry 型を含むバリアント型 |

---

#### 書き込みはサポートされません  \{#type-map-writing-not-supported\}

| ClickHouse Type | 備考 |
|-----------------|-------|
| Dynamic | `NotImplementedException` をスローします |
| AggregateFunction | `AggregateFunctionException` をスローします |

---

### ネスト型の扱い \{#nested-type-handling\}

ClickHouse のネスト型（`Nested(...)`）は、配列と同様のセマンティクスで読み書きできます。

```sql
CREATE TABLE test.nested (
    id UInt32,
    params Nested (param_id UInt8, param_val String)
) ENGINE = Memory
```

```csharp
var row1 = new object[] { 1, new[] { 1, 2, 3 }, new[] { "v1", "v2", "v3" } };
var row2 = new object[] { 2, new[] { 4, 5, 6 }, new[] { "v4", "v5", "v6" } };

await client.InsertBinaryAsync(
    "test.nested",
    new[] { "id", "params.param_id", "params.param_val" },
    new[] { row1, row2 }
);
```


## ロギングと診断 \{#logging-and-diagnostics\}

ClickHouse の .NET クライアントは `Microsoft.Extensions.Logging` の抽象 API と統合されており、軽量なオプトイン方式のロギングを提供します。ロギングを有効にすると、ドライバーは接続ライフサイクルイベント、コマンド実行、トランスポート処理、およびバルクインサート処理に対して構造化されたメッセージを出力します。ロギングは完全に任意であり、ロガーを構成していないアプリケーションでも追加のオーバーヘッドなしに動作し続けます。

### クイックスタート \{#logging-quick-start\}

```csharp
using ClickHouse.Driver;
using Microsoft.Extensions.Logging;

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Information);
});

var settings = new ClickHouseClientSettings("Host=localhost;Port=8123")
{
    LoggerFactory = loggerFactory
};

using var client = new ClickHouseClient(settings);
```


#### appsettings.json の使用 \{#logging-appsettings-config\}

標準的な .NET の構成機能を使用してログレベルを設定できます。

```csharp
using ClickHouse.Driver;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json")
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConfiguration(configuration.GetSection("Logging"))
        .AddConsole();
});

var settings = new ClickHouseClientSettings("Host=localhost;Port=8123")
{
    LoggerFactory = loggerFactory
};

using var client = new ClickHouseClient(settings);
```


#### インメモリ設定を使用する \{#logging-inmemory-config\}

コード内でカテゴリごとにログ出力の詳細度を設定することもできます。

```csharp
using ClickHouse.Driver;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

var categoriesConfiguration = new Dictionary<string, string>
{
    { "LogLevel:Default", "Warning" },
    { "LogLevel:ClickHouse.Driver.Connection", "Information" },
    { "LogLevel:ClickHouse.Driver.Command", "Debug" }
};

var config = new ConfigurationBuilder()
    .AddInMemoryCollection(categoriesConfiguration)
    .Build();

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConfiguration(config)
        .AddSimpleConsole();
});

var settings = new ClickHouseClientSettings("Host=localhost;Port=8123")
{
    LoggerFactory = loggerFactory
};

using var client = new ClickHouseClient(settings);
```


### カテゴリと出力元 \{#logging-categories\}

このドライバーは専用のカテゴリを使用しており、コンポーネントごとにログレベルをきめ細かく調整できます。

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 接続のライフサイクル、HTTP クライアントファクトリの選択、接続の開始/終了、セッション管理。 |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | クエリ実行の開始/完了、処理時間、クエリ ID、サーバー統計情報、エラーの詳細。 |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | 低レベルの HTTP ストリーミングリクエスト、圧縮フラグ、レスポンスステータスコード、転送エラー。 |
| `ClickHouse.Driver.Client` | `ClickHouseClient` | バイナリ挿入、クエリ、およびその他の操作。 |
| `ClickHouse.Driver.NetTrace` | `TraceHelper` | デバッグモードが有効な場合にのみ行われるネットワークトレース。 |

#### 例：接続に関する問題の診断 \{#logging-config-example\}

```json
{
    "Logging": {
        "LogLevel": {
            "ClickHouse.Driver.Connection": "Trace",
            "ClickHouse.Driver.Transport": "Trace"
        }
    }
}
```

これにより、次の内容がログに記録されます:

* HTTP クライアントファクトリの選択（デフォルトプールか単一接続か）
* HTTP ハンドラの設定（SocketsHttpHandler または HttpClientHandler）
* 接続プールの設定（MaxConnectionsPerServer、PooledConnectionLifetime など）
* タイムアウトの設定（ConnectTimeout、Expect100ContinueTimeout など）
* SSL/TLS 設定
* 接続のオープン／クローズ イベント
* セッション ID の追跡

### デバッグモード: ネットワークトレースと診断 \{#logging-debugmode\}

ネットワークに関する問題の診断を支援するために、ドライバーライブラリには .NET のネットワーク内部処理を低レベルでトレースできるヘルパー機能が含まれています。これを有効にするには、ログレベルを Trace に設定した LoggerFactory を渡し、EnableDebugMode を true に設定する必要があります（または `ClickHouse.Driver.Diagnostic.TraceHelper` クラスを使用して手動で有効化します）。イベントは `ClickHouse.Driver.NetTrace` カテゴリにログ出力されます。警告: これは非常に冗長なログを大量に生成し、パフォーマンスに影響します。本番環境でデバッグモードを有効にすることは推奨されません。

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // Must be Trace level to see network events
});

var settings = new ClickHouseClientSettings()
{
    LoggerFactory = loggerFactory,
    EnableDebugMode = true,  // Enable low-level network tracing
};
```


## OpenTelemetry \{#opentelemetry\}

このドライバーは、.NET の [`System.Diagnostics.Activity`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing) API を介して、OpenTelemetry による分散トレーシングを組み込みでサポートしています。これを有効にすると、ドライバーはデータベース操作ごとに span を生成し、Jaeger や [OpenTelemetry Collector](https://clickhouse.com/docs/observability/integrating-opentelemetry) 経由の ClickHouse 自身といったオブザーバビリティバックエンドへエクスポートできます。

### トレーシングの有効化 \{#opentelemetry-enabling\}

ASP.NET Core アプリケーションでは、OpenTelemetry の設定に ClickHouse ドライバーの `ActivitySource` を追加します。

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)  // Subscribe to ClickHouse driver spans
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());             // Or AddJaegerExporter(), etc.
```

コンソールアプリケーションやテスト、手動によるセットアップの場合：

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)
    .AddConsoleExporter()
    .Build();
```


### Span attributes \{#opentelemetry-attributes\}

各スパンには、標準的な OpenTelemetry のデータベース属性に加えて、デバッグに利用可能な ClickHouse 固有のクエリ統計情報が含まれます。

| Attribute | Description |
|-----------|-------------|
| `db.system` | 常に `"clickhouse"` |
| `db.name` | データベース名 |
| `db.user` | ユーザー名 |
| `db.statement` | SQLクエリ（有効化されている場合） |
| `db.clickhouse.read_rows` | クエリによって読み取られた行数 |
| `db.clickhouse.read_bytes` | クエリによって読み取られたバイト数 |
| `db.clickhouse.written_rows` | クエリによって書き込まれた行数 |
| `db.clickhouse.written_bytes` | クエリによって書き込まれたバイト数 |
| `db.clickhouse.elapsed_ns` | サーバー側の実行時間（ナノ秒単位） |

### 設定オプション \{#opentelemetry-configuration\}

`ClickHouseDiagnosticsOptions` を使用してトレースの挙動を制御できます。

```csharp
using ClickHouse.Driver.Diagnostic;

// Include SQL statements in spans (default: false for security)
ClickHouseDiagnosticsOptions.IncludeSqlInActivityTags = true;

// Truncate long SQL statements (default: 1000 characters)
ClickHouseDiagnosticsOptions.StatementMaxLength = 500;
```

:::warning
`IncludeSqlInActivityTags` を有効にすると、トレースに機密データが含まれてしまう可能性があります。本番環境では慎重に使用してください。
:::


## TLS 構成 \{#tls-configuration\}

HTTPS 経由で ClickHouse に接続する場合、TLS/SSL の動作をいくつかの方法で設定できます。

### カスタム証明書検証 \{#custom-certificate-validation\}

カスタム証明書検証ロジックが必要な本番環境では、`ServerCertificateCustomValidationCallback` ハンドラーを構成した独自の `HttpClient` を用意してください：

```csharp
using System.Net;
using System.Net.Security;
using ClickHouse.Driver;

var handler = new HttpClientHandler
{
    // Required when compression is enabled (default)
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,

    ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) =>
    {
        // Example: Accept a specific certificate thumbprint
        if (cert?.Thumbprint == "YOUR_EXPECTED_THUMBPRINT")
            return true;

        // Example: Accept certificates from a specific issuer
        if (cert?.Issuer.Contains("YourOrganization") == true)
            return true;

        // Default: Use standard validation
        return sslPolicyErrors == SslPolicyErrors.None;
    },
};

var httpClient = new HttpClient(handler) { Timeout = TimeSpan.FromMinutes(5) };

var settings = new ClickHouseClientSettings
{
    Host = "my.clickhouse.server",
    Protocol = "https",
    HttpClient = httpClient,
};

using var client = new ClickHouseClient(settings);
```

:::note
カスタム HttpClient を提供する際の重要な注意事項

* **自動圧縮解除**: 圧縮を無効にしていない場合（デフォルトでは圧縮は有効です）、`AutomaticDecompression` を有効にする必要があります。
* **アイドルタイムアウト**: ハーフオープン接続による接続エラーを回避するために、`PooledConnectionIdleTimeout` をサーバーの `keep_alive_timeout`（ClickHouse Cloud の場合は 10 秒）よりも短く設定してください。
  :::


## ORM サポート \{#orm-support\}

ORM を利用する場合は ADO.NET API（`ClickHouseConnection`）が必要です。接続のライフタイムを適切に管理するには、`ClickHouseDataSource` から接続を作成してください。

```csharp
// Register DataSource as singleton
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default");

// Create connections for ORM use
await using var connection = await dataSource.OpenConnectionAsync();
// Pass connection to your ORM...
```


### Dapper \{#orm-support-dapper\}

`ClickHouse.Driver` は Dapper と併用できますが、anonymous objects（匿名オブジェクト）はサポート対象外です。

**動作サンプル:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
```

**サポート対象外:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```


### Linq2db \{#orm-support-linq2db\}

このドライバは、.NET 向けの軽量な ORM / LINQ プロバイダーである [linq2db](https://github.com/linq2db/linq2db) に対応しています。詳細については、プロジェクトの Web サイトを参照してください。

**使用例:**

ClickHouse プロバイダーを使用して `DataConnection` を作成します:

```csharp
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.ClickHouse;

var connectionString = "Host=localhost;Port=8123;Database=default";
var options = new DataOptions()
    .UseClickHouse(connectionString, ClickHouseProvider.ClickHouseDriver);

await using var db = new DataConnection(options);
```

テーブルのマッピングは属性または Fluent API 構成を使用して定義できます。クラス名およびプロパティ名がテーブル名およびカラム名と完全に一致している場合は、追加の構成は不要です。

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

**クエリの実行:**

```csharp
await using var db = new DataConnection(options);

var products = await db.GetTable<Product>()
    .Where(p => p.Price > 100)
    .OrderByDescending(p => p.Name)
    .ToListAsync();
```

**バルクコピー:**

効率的に一括挿入を行うには `BulkCopyAsync` を使用します。

```csharp
await using var db = new DataConnection(options);
var table = db.GetTable<Product>();

var options = new BulkCopyOptions
{
    MaxBatchSize = 100000,
    MaxDegreeOfParallelism = 1,
    WithoutSession = true
};

await table.BulkCopyAsync(options, products);
```


### Entity Framework Core \{#orm-support-ef-core\}

Entity Framework Core は現在サポートされていません。

## 制限事項 \{#limitations\}

### AggregateFunction 列 \{#aggregatefunction-columns\}

`AggregateFunction(...)` 型の列は、直接クエリしたりデータを挿入したりすることはできません。

挿入するには:

```sql
INSERT INTO t VALUES (uniqState(1));
```

選択：

```sql
SELECT uniqMerge(c) FROM t;
```

***
