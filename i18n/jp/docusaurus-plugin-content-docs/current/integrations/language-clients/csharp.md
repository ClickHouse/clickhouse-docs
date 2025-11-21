---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'ClickHouse への接続用公式 C# クライアント。'
title: 'ClickHouse C# ドライバ'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---



# ClickHouse C# クライアント

ClickHouse に接続するための公式 C# クライアントです。
クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-cs)で公開されています。
当初は [Oleg V. Kozlyuk](https://github.com/DarkWanderer) によって開発されました。



## 移行ガイド {#migration-guide}

1. `.csproj`ファイルを新しいパッケージ名`ClickHouse.Driver`と[NuGetの最新バージョン](https://www.nuget.org/packages/ClickHouse.Driver)に更新します。
2. コードベース内のすべての`ClickHouse.Client`参照を`ClickHouse.Driver`に更新します。

---


## サポートされている .NET バージョン {#supported-net-versions}

`ClickHouse.Driver` は以下の .NET バージョンをサポートしています:

- .NET Framework 4.6.2
- .NET Framework 4.8
- .NET Standard 2.1
- .NET 6.0
- .NET 8.0
- .NET 9.0

---


## インストール {#installation}

NuGetからパッケージをインストールします:

```bash
dotnet add package ClickHouse.Driver
```

または、NuGet Package Managerを使用する場合:

```bash
Install-Package ClickHouse.Driver
```

---


## クイックスタート {#quick-start}

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

**Dapper**を使用する場合:

```csharp
using Dapper;
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse"))
{
    var result = await connection.QueryAsync<string>("SELECT name FROM system.databases");
    Console.WriteLine(string.Join('\n', result));
}
```

---


## 使用方法 {#usage}

### 接続文字列パラメータ {#connection-string}

| パラメータ           | 説明                              | デフォルト値                                    |
| ------------------- | ---------------------------------------- | ------------------------------------------ |
| `Host`              | ClickHouseサーバーアドレス                | `localhost`                                |
| `Port`              | ClickHouseサーバーポート                   | `8123`または`8443`(`Protocol`に依存) |
| `Database`          | 初期データベース                         | `default`                                  |
| `Username`          | 認証ユーザー名                  | `default`                                  |
| `Password`          | 認証パスワード                  | _(空)_                                  |
| `Protocol`          | 接続プロトコル(`http`または`https`)  | `http`                                     |
| `Compression`       | Gzip圧縮を有効化                 | `true`                                     |
| `UseSession`        | 永続的なサーバーセッションを有効化        | `false`                                    |
| `SessionId`         | カスタムセッションID                        | ランダムGUID                                |
| `Timeout`           | HTTPタイムアウト(秒)                   | `120`                                      |
| `UseServerTimezone` | datetime列でサーバータイムゾーンを使用 | `true`                                     |
| `UseCustomDecimals` | decimal型で`ClickHouseDecimal`を使用     | `false`                                    |

**例:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note セッション

`UseSession`フラグを有効にすると、サーバーセッションが永続化され、`SET`文と一時テーブルの使用が可能になります。セッションは非アクティブ状態が60秒続くとリセットされます(デフォルトタイムアウト)。セッションの有効期間は、ClickHouse文を介してセッション設定を行うことで延長できます。

`ClickHouseConnection`クラスは通常、並列操作を許可します(複数のスレッドが同時にクエリを実行可能)。ただし、`UseSession`フラグを有効にすると、任意の時点で接続ごとに1つのアクティブなクエリに制限されます(サーバー側の制限)。

:::

---

### 接続のライフタイムとプーリング {#connection-lifetime}

`ClickHouse.Driver`は内部で`System.Net.Http.HttpClient`を使用します。`HttpClient`はエンドポイントごとの接続プールを持ちます。その結果:

- `ClickHouseConnection`オブジェクトはTCP接続と1対1でマッピングされません - 複数のデータベースセッションは、サーバーごとに複数(デフォルトでは2つ)のTCP接続を通じて多重化されます。
- `ClickHouseConnection`オブジェクトが破棄された後も接続は存続する可能性があります。
- この動作は、カスタム`HttpClientHandler`を持つ専用の`HttpClient`を渡すことで調整できます。

DI環境向けには、HTTPクライアント設定を汎用化できる専用コンストラクタ`ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`が用意されています。

**推奨事項:**

- `ClickHouseConnection`はサーバーとの「セッション」を表します。サーバーバージョンを問い合わせることで機能検出を実行するため(オープン時に若干のオーバーヘッドがあります)、一般的にこのようなオブジェクトを複数回作成・破棄しても安全です。
- 接続の推奨ライフタイムは、複数のクエリにまたがる大規模な「トランザクション」ごとに1つの接続オブジェクトです。接続起動時に若干のオーバーヘッドがあるため、クエリごとに接続オブジェクトを作成することは推奨されません。
- アプリケーションが大量のトランザクションを処理し、`ClickHouseConnection`オブジェクトを頻繁に作成・破棄する必要がある場合は、`IHttpClientFactory`または`HttpClient`の静的インスタンスを使用して接続を管理することを推奨します。

---

### テーブルの作成 {#creating-a-table}

標準SQL構文を使用してテーブルを作成します:

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory";
        command.ExecuteNonQuery();
    }
}
```

---

### データの挿入 {#inserting-data}

パラメータ化クエリを使用してデータを挿入します:

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using (var command = connection.CreateCommand())
    {
        command.AddParameter("id", "Int64", 1);
        command.AddParameter("name", "String", "test");
        command.CommandText = "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})";
        command.ExecuteNonQuery();
    }
}
```

---

### 一括挿入 {#bulk-insert}

`ClickHouseBulkCopy`を使用するには以下が必要です:

- ターゲット接続(`ClickHouseConnection`インスタンス)
- ターゲットテーブル名(`DestinationTableName`プロパティ)
- データソース(`IDataReader`または`IEnumerable<object[]>`)

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using var connection = new ClickHouseConnection(connectionString);
connection.Open();

```


using var bulkCopy = new ClickHouseBulkCopy(connection)
{
DestinationTableName = "default.my_table",
BatchSize = 100000,
MaxDegreeOfParallelism = 2
};

await bulkCopy.InitAsync(); // ターゲット列の型を読み込んでClickHouseBulkCopyインスタンスを準備します

var values = Enumerable.Range(0, 1000000)
.Select(i => new object[] { (long)i, "value" + i });

await bulkCopy.WriteToServerAsync(values);
Console.WriteLine($"Rows written: {bulkCopy.RowsWritten}");

````

:::note
* 最適なパフォーマンスを実現するため、ClickHouseBulkCopyはタスク並列ライブラリ(TPL)を使用してデータのバッチを処理し、最大4つの並列挿入タスクを実行します(この値は調整可能です)。
* ソースデータの列数がターゲットテーブルより少ない場合、`ColumnNames`プロパティを使用して列名をオプションで指定できます。
* 設定可能なパラメータ: `Columns`、`BatchSize`、`MaxDegreeOfParallelism`
* コピーを実行する前に、ターゲットテーブルの構造情報を取得するために`SELECT * FROM <table> LIMIT 0`クエリが実行されます。提供されるオブジェクトの型は、ターゲットテーブルの型と適切に一致する必要があります。
* セッションは並列挿入と互換性がありません。`ClickHouseBulkCopy`に渡される接続はセッションを無効にする必要があるか、または`MaxDegreeOfParallelism`を`1`に設定する必要があります。
:::

---

### SELECTクエリの実行 {#performing-select-queries}

SELECTクエリを実行して結果を処理します:

```csharp
using ClickHouse.Driver.ADO;
using System.Data;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using (var command = connection.CreateCommand())
    {
        command.AddParameter("id", "Int64", 10);
        command.CommandText = "SELECT * FROM default.my_table WHERE id < {id:Int64}";
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            Console.WriteLine($"select: Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
        }
    }
}
````

---

### 生ストリーミング {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

### ネストされた列のサポート {#nested-columns}

ClickHouseのネストされた型(`Nested(...)`)は、配列のセマンティクスを使用して読み書きできます。

```sql
CREATE TABLE test.nested (
    id UInt32,
    params Nested (param_id UInt8, param_val String)
) ENGINE = Memory
```

```csharp
using var bulkCopy = new ClickHouseBulkCopy(connection)
{
    DestinationTableName = "test.nested"
};

var row1 = new object[] { 1, new[] { 1, 2, 3 }, new[] { "v1", "v2", "v3" } };
var row2 = new object[] { 2, new[] { 4, 5, 6 }, new[] { "v4", "v5", "v6" } };

await bulkCopy.WriteToServerAsync(new[] { row1, row2 });
```

---

### AggregateFunction列 {#aggregatefunction-columns}

`AggregateFunction(...)`型の列は、直接クエリまたは挿入することはできません。

挿入する場合:

```sql
INSERT INTO t VALUES (uniqState(1));
```

選択する場合:

```sql
SELECT uniqMerge(c) FROM t;
```

---

### SQLパラメータ {#sql-parameters}

クエリでパラメータを渡すには、次の形式でClickHouseパラメータフォーマットを使用する必要があります:

```sql
{<name>:<data type>}
```

**例:**

```sql
SELECT {value:Array(UInt16)} as value
```

```sql
SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}
```

```sql
INSERT INTO table VALUES ({val1:Int32}, {val2:Array(UInt8)})
```

:::note

- SQLの'バインド'パラメータはHTTP URIクエリパラメータとして渡されるため、多数のパラメータを使用すると「URLが長すぎる」例外が発生する可能性があります。
- 大量のレコードを挿入する場合は、一括挿入機能の使用を検討してください。
  :::

---


## サポートされているデータ型 {#supported-data-types}

`ClickHouse.Driver`は、以下のClickHouseデータ型と対応する.NET型のマッピングをサポートしています:

### ブール型 {#boolean-types}

- `Bool` → `bool`

### 数値型 {#numeric-types}

**符号付き整数:**

- `Int8` → `sbyte`
- `Int16` → `short`
- `Int32` → `int`
- `Int64` → `long`
- `Int128` → `BigInteger`
- `Int256` → `BigInteger`

**符号なし整数:**

- `UInt8` → `byte`
- `UInt16` → `ushort`
- `UInt32` → `uint`
- `UInt64` → `ulong`
- `UInt128` → `BigInteger`
- `UInt256` → `BigInteger`

**浮動小数点数:**

- `Float32` → `float`
- `Float64` → `double`

**10進数:**

- `Decimal` → `decimal`
- `Decimal32` → `decimal`
- `Decimal64` → `decimal`
- `Decimal128` → `decimal`
- `Decimal256` → `BigDecimal`

### 文字列型 {#string-types}

- `String` → `string`
- `FixedString` → `string`

### 日付時刻型 {#date-time-types}

- `Date` → `DateTime`
- `Date32` → `DateTime`
- `DateTime` → `DateTime`
- `DateTime32` → `DateTime`
- `DateTime64` → `DateTime`

### ネットワーク型 {#network-types}

- `IPv4` → `IPAddress`
- `IPv6` → `IPAddress`

### 地理型 {#geographic-types}

- `Point` → `Tuple`
- `Ring` → `Pointの配列`
- `Polygon` → `Ringの配列`

### 複合型 {#complex-types}

- `Array(T)` → `任意の型の配列`
- `Tuple(T1, T2, ...)` → `任意の型のタプル`
- `Nullable(T)` → `任意の型のNull許容版`
- `Map(K, V)` → `Dictionary<K, V>`

---

### DateTimeの処理 {#datetime-handling}

`ClickHouse.Driver`は、タイムゾーンと`DateTime.Kind`プロパティを正しく処理します。具体的には:

- `DateTime`値はUTCとして返されます。ユーザーは自分で変換するか、`DateTime`インスタンスの`ToLocalTime()`メソッドを使用できます。
- 挿入時、`DateTime`値は以下のように処理されます:
  - `UTC` `DateTime`は、ClickHouseが内部的にUTCで保存するため、そのまま挿入されます。
  - `Local` `DateTime`は、ユーザーのローカルタイムゾーン設定に従ってUTCに変換されます。
  - `Unspecified` `DateTime`は、対象カラムのタイムゾーンにあるものとみなされ、そのタイムゾーンに従ってUTCに変換されます。
- タイムゾーンが指定されていないカラムの場合、デフォルトでクライアントのタイムゾーンが使用されます(レガシー動作)。代わりにサーバーのタイムゾーンを使用するには、接続文字列の`UseServerTimezone`フラグを使用できます。

---


## ロギングと診断 {#logging-and-diagnostics}

ClickHouse .NETクライアントは`Microsoft.Extensions.Logging`抽象化と統合されており、軽量でオプトイン方式のロギングを提供します。有効化すると、ドライバーは接続ライフサイクルイベント、コマンド実行、トランスポート操作、バルクコピーアップロードに関する構造化メッセージを出力します。ロギングは完全にオプションであり、ロガーを設定しないアプリケーションでも追加のオーバーヘッドなしに動作します。

### クイックスタート {#logging-quick-start}

#### ClickHouseConnectionの使用 {#logging-clickhouseconnection}

```csharp
using ClickHouse.Driver.ADO;
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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

#### appsettings.jsonの使用 {#logging-appsettings-config}

標準的な.NET構成を使用してロギングレベルを設定できます:

```csharp
using ClickHouse.Driver.ADO;
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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

#### インメモリ構成の使用 {#logging-inmemory-config}

コード内でカテゴリ別にロギングの詳細度を設定することもできます:

```csharp
using ClickHouse.Driver.ADO;
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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

### カテゴリと出力元 {#logging-categories}

ドライバーは専用のカテゴリを使用しているため、コンポーネントごとにログレベルを細かく調整できます:

| カテゴリ                       | 出力元                 | ハイライト                                                                                           |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 接続ライフサイクル、HTTPクライアントファクトリの選択、接続の開閉、セッション管理。 |
| `ClickHouse.Driver.Command`    | `ClickHouseCommand`    | クエリ実行の開始/完了、タイミング、クエリID、サーバー統計、エラー詳細。           |
| `ClickHouse.Driver.Transport`  | `ClickHouseConnection` | 低レベルHTTPストリーミングリクエスト、圧縮フラグ、レスポンスステータスコード、トランスポート障害。 |
| `ClickHouse.Driver.BulkCopy`   | `ClickHouseBulkCopy`   | メタデータの読み込み、バッチ操作、行数、アップロード完了。                              |

#### 例: 接続問題の診断 {#logging-config-example}

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

これにより以下がログ出力されます:

- HTTPクライアントファクトリの選択(デフォルトプール vs 単一接続)
- HTTPハンドラー構成(SocketsHttpHandlerまたはHttpClientHandler)
- 接続プール設定(MaxConnectionsPerServer、PooledConnectionLifetimeなど)
- タイムアウト設定(ConnectTimeout、Expect100ContinueTimeoutなど)
- SSL/TLS構成
- 接続の開閉イベント
- セッションIDの追跡

### デバッグモード: ネットワークトレースと診断 {#logging-debugmode}

ネットワーク問題の診断を支援するため、ドライバーライブラリには.NETネットワーク内部の低レベルトレースを有効化するヘルパーが含まれています。これを有効化するには、レベルをTraceに設定したLoggerFactoryを渡し、EnableDebugModeをtrueに設定する必要があります(または`ClickHouse.Driver.Diagnostic.TraceHelper`クラスを介して手動で有効化します)。警告: これは極めて詳細なログを生成し、パフォーマンスに影響を与えます。本番環境でデバッグモードを有効化することは推奨されません。

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // ネットワークイベントを確認するにはTraceレベルが必要
});

```


var settings = new ClickHouseClientSettings()
{
LoggerFactory = loggerFactory,
EnableDebugMode = true, // 低レベルネットワークトレースを有効化
};

````

---

### ORM & Dapper サポート {#orm-support}

`ClickHouse.Driver` は Dapper をサポートしています(一部制限あり)。

**動作例:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
````

**サポート対象外:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```
