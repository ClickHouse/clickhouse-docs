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

# ClickHouse C# クライアント {#clickhouse-c-client}

ClickHouse に接続するための公式の C# クライアントです。
クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-cs) で公開されています。
当初は [Oleg V. Kozlyuk](https://github.com/DarkWanderer) によって開発されました。

## 移行ガイド {#migration-guide}

1. `.csproj` ファイルでパッケージ名を `ClickHouse.Driver` に変更し、[NuGet 上の最新バージョン](https://www.nuget.org/packages/ClickHouse.Driver) を指定します。
2. コードベース内のすべての `ClickHouse.Client` 参照を `ClickHouse.Driver` に更新します。

---

## 対応している .NET バージョン {#supported-net-versions}

`ClickHouse.Driver` は、次の .NET バージョンに対応しています。

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

---

## インストール {#installation}

NuGet からパッケージをインストールします：

```bash
dotnet add package ClickHouse.Driver
```

または、NuGet パッケージ マネージャーを使用します:

```bash
Install-Package ClickHouse.Driver
```

***

## クイックスタート {#quick-start}

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

**Dapper** を利用する:

```csharp
using Dapper;
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse"))
{
    var result = await connection.QueryAsync<string>("SELECT name FROM system.databases");
    Console.WriteLine(string.Join('\n', result));
}
```

***

## 使用方法 {#usage}

### 接続文字列パラメータ {#connection-string}

| Parameter           | Description                                     | Default             |
| ------------------- | ----------------------------------------------- | ------------------- |
| `Host`              | ClickHouse サーバーアドレス                     | `localhost`         |
| `Port`              | ClickHouse サーバーポート                       | `8123` または `8443`（`Protocol` に依存） |
| `Database`          | 初期データベース                               | `default`           |
| `Username`          | 認証ユーザー名                                 | `default`           |
| `Password`          | 認証パスワード                                 | *(空)*              |
| `Protocol`          | 接続プロトコル（`http` または `https`）        | `http`              |
| `Compression`       | Gzip 圧縮を有効化                              | `true`              |
| `UseSession`        | 永続的なサーバーセッションを有効化             | `false`             |
| `SessionId`         | カスタムセッション ID                          | ランダムな GUID     |
| `Timeout`           | HTTP タイムアウト（秒）                         | `120`               |
| `UseServerTimezone` | datetime 列にサーバータイムゾーンを使用        | `true`              |
| `UseCustomDecimals` | 小数に `ClickHouseDecimal` を使用              | `false`             |

**例:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note セッション

`UseSession` フラグを有効にすると、サーバーセッションが永続化され、`SET` 文や一時テーブルを使用できるようになります。セッションは 60 秒間アクティビティがない場合（デフォルトのタイムアウト）にリセットされます。セッションの有効期間は、ClickHouse ステートメントでセッション設定を行うことで延長できます。

`ClickHouseConnection` クラスは通常、並列実行（複数スレッドによる同時クエリ実行）を許可します。しかし、`UseSession` フラグを有効にすると、任意の時点で 1 接続あたり 1 つのアクティブなクエリに制限されます（サーバー側の制約です）。

:::

---

### 接続の有効期間とプーリング {#connection-lifetime}

`ClickHouse.Driver` は内部的に `System.Net.Http.HttpClient` を使用しています。`HttpClient` はエンドポイントごとに接続プールを持ちます。その結果:

* `ClickHouseConnection` オブジェクトは TCP 接続と 1:1 で対応していません。複数のデータベースセッションは、サーバーごとに複数の（デフォルトでは 2 本の）TCP 接続上で多重化されます。
* `ClickHouseConnection` オブジェクトが破棄された後も、接続が維持される場合があります。
* この挙動は、カスタムの `HttpClientHandler` を指定した独自の `HttpClient` を渡すことで調整できます。

DI 環境向けには、HTTP クライアントの設定を共通化できる専用コンストラクター `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")` が用意されています。

**推奨事項:**

* `ClickHouseConnection` はサーバーとの「セッション」を表します。サーバーのバージョンを問い合わせることで機能検出を行うため（接続オープン時にわずかなオーバーヘッドがあります）が、一般的にはこのオブジェクトを何度も生成・破棄しても問題ありません。
* コネクションの推奨ライフタイムは、複数のクエリにまたがる大きな「トランザクション」あたり 1 つの接続オブジェクトとすることです。接続の開始時にはわずかなオーバーヘッドがあるため、クエリごとに接続オブジェクトを生成することは推奨されません。
* アプリケーションが大量のトランザクションを扱い、`ClickHouseConnection` オブジェクトの頻繁な生成・破棄が必要な場合は、接続管理に `IHttpClientFactory` または静的な `HttpClient` インスタンスを使用することを推奨します。

---

### テーブルの作成 {#creating-a-table}

標準的な SQL 構文を使用してテーブルを作成します。

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

***

### データの挿入 {#inserting-data}

パラメータ化されたクエリを使用してデータを挿入します。

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

***

### 一括挿入 {#bulk-insert}

`ClickHouseBulkCopy` を使用するには、次のものが必要です：

* 対象接続（`ClickHouseConnection` インスタンス）
* 対象テーブル名（`DestinationTableName` プロパティ）
* データソース（`IDataReader` または `IEnumerable<object[]>`）

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using var connection = new ClickHouseConnection(connectionString);
connection.Open();

using var bulkCopy = new ClickHouseBulkCopy(connection)
{
    DestinationTableName = "default.my_table",
    BatchSize = 100000,
    MaxDegreeOfParallelism = 2
};

await bulkCopy.InitAsync(); // Prepares ClickHouseBulkCopy instance by loading target column types

var values = Enumerable.Range(0, 1000000)
    .Select(i => new object[] { (long)i, "value" + i });

await bulkCopy.WriteToServerAsync(values);
Console.WriteLine($"Rows written: {bulkCopy.RowsWritten}");
```

:::note

* パフォーマンスを最適化するために、ClickHouseBulkCopy は Task Parallel Library (TPL) を使用してデータのバッチを処理し、最大 4 個までの並列挿入タスクを実行します（この値は調整可能です）。
* ソースデータの列数が対象テーブルより少ない場合、`ColumnNames` プロパティで列名を任意に指定できます。
* 設定可能なパラメータ: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`。
* コピーを行う前に、対象テーブルの構造情報を取得するために `SELECT * FROM <table> LIMIT 0` クエリが実行されます。指定するオブジェクトの型は、対象テーブルの型と概ね一致している必要があります。
* セッションは並列挿入と互換性がありません。`ClickHouseBulkCopy` に渡す接続ではセッションを無効にするか、`MaxDegreeOfParallelism` を `1` に設定する必要があります。
  :::

***

### SELECT クエリの実行 {#performing-select-queries}

SELECT クエリを実行して結果を処理します。

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
```

***

### 生データストリーミング {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

***

### ネストされたカラムのサポート {#nested-columns}

ClickHouse のネスト型（`Nested(...)`）は、配列と同様のセマンティクスで読み書きできます。

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

***

### AggregateFunction 列 {#aggregatefunction-columns}

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

### SQL パラメータ {#sql-parameters}

クエリにパラメータを渡すには、次の形式で ClickHouse のパラメータ書式を使用する必要があります。

```sql
{<name>:<data type>}
```

**例：**

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

* SQL「bind」パラメータは HTTP URI のクエリパラメータとして渡されるため、数が多すぎると「URL too long」例外が発生する可能性があります。
* レコードを大量に挿入する場合は、Bulk Insert 機能の利用を検討してください。
  :::

***

## サポートされているデータ型 {#supported-data-types}

`ClickHouse.Driver` は、次の ClickHouse のデータ型を、それぞれ対応する .NET 型にマッピングしてサポートします。

### ブール型 {#boolean-types}

* `Bool` → `bool`

### 数値型 {#numeric-types}

**符号付き整数:**

* `Int8` → `sbyte`
* `Int16` → `short`
* `Int32` → `int`
* `Int64` → `long`
* `Int128` → `BigInteger`
* `Int256` → `BigInteger`

**符号なし整数:**

* `UInt8` → `byte`
* `UInt16` → `ushort`
* `UInt32` → `uint`
* `UInt64` → `ulong`
* `UInt128` → `BigInteger`
* `UInt256` → `BigInteger`

**浮動小数点数:**

* `Float32` → `float`
* `Float64` → `double`

**Decimal:**

* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### 文字列型 {#string-types}

* `String` → `string`
* `FixedString` → `string`

### 日付・時刻型 {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### ネットワーク型 {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### 地理データ型 {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Array of Points`
* `Polygon` → `Array of Rings`

### 複合型 {#complex-types}

* `Array(T)` → 任意の型を要素とする `Array`
* `Tuple(T1, T2, ...)` → 任意の型を要素とする `Tuple`
* `Nullable(T)` → 任意の型の `Nullable` 版
* `Map(K, V)` → `Dictionary<K, V>` 型

---

### DateTime の扱い {#datetime-handling}

`ClickHouse.Driver` は、タイムゾーンと `DateTime.Kind` プロパティを正しく扱うようにしています。具体的には次のとおりです。

* `DateTime` の値は UTC として返されます。ユーザーは必要に応じて自分で変換するか、`DateTime` インスタンスに対して `ToLocalTime()` メソッドを使用できます。
* 挿入時には、`DateTime` の値は次のように扱われます。
  * `UTC` の `DateTime` はそのまま挿入されます。これは、ClickHouse が内部的に UTC で値を保存しているためです。
  * `Local` の `DateTime` は、ユーザーのローカルタイムゾーン設定に従って UTC に変換されます。
  * `Unspecified` の `DateTime` は対象カラムのタイムゾーンに属しているとみなされ、そのタイムゾーンに従って UTC に変換されます。
* タイムゾーンが指定されていないカラムの場合、既定ではクライアントのタイムゾーンが使用されます（従来の動作）。代わりにサーバーのタイムゾーンを使用するには、接続文字列の `UseServerTimezone` フラグを使用できます。

---

## ロギングと診断 {#logging-and-diagnostics}

ClickHouse の .NET クライアントは `Microsoft.Extensions.Logging` の抽象 API と統合されており、軽量なオプトイン方式のロギングを提供します。ロギングを有効にすると、ドライバーは接続ライフサイクルイベント、コマンド実行、トランスポート処理、およびバルクコピーアップロードに対して構造化されたメッセージを出力します。ロギングは完全に任意であり、ロガーを構成していないアプリケーションでも追加のオーバーヘッドなしに動作し続けます。

### クイックスタート {#logging-quick-start}

#### ClickHouseConnection の使用 {#logging-clickhouseconnection}

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

#### appsettings.json の使用 {#logging-appsettings-config}

標準的な .NET の構成機能を使用してログレベルを設定できます。

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

#### インメモリ設定を使用する {#logging-inmemory-config}

コード内でカテゴリごとにログ出力の詳細度を設定することもできます。

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

このドライバーは専用のカテゴリを使用しており、コンポーネントごとにログレベルをきめ細かく調整できます。

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 接続のライフサイクル、HTTP クライアントファクトリの選択、接続の開始/終了、セッション管理。 |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | クエリ実行の開始/完了、処理時間、クエリ ID、サーバー統計情報、エラーの詳細。 |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | 低レベルの HTTP ストリーミングリクエスト、圧縮フラグ、レスポンスステータスコード、転送エラー。 |
| `ClickHouse.Driver.BulkCopy` | `ClickHouseBulkCopy` | メタデータの読み込み、バッチ処理、行数、アップロード完了。 |

#### 例：接続に関する問題の診断 {#logging-config-example}

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

### デバッグモード: ネットワークトレースと診断 {#logging-debugmode}

ネットワークに関する問題の診断を支援するために、ドライバーライブラリには .NET のネットワーク内部処理を低レベルでトレースできるヘルパー機能が含まれています。これを有効にするには、ログレベルを Trace に設定した LoggerFactory を渡し、EnableDebugMode を true に設定する必要があります（または `ClickHouse.Driver.Diagnostic.TraceHelper` クラスを使用して手動で有効化します）。警告: これは非常に冗長なログを大量に生成し、パフォーマンスに影響します。本番環境でデバッグモードを有効にすることは推奨されません。

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // ネットワークイベントを確認するにはTraceレベルが必要
});

var settings = new ClickHouseClientSettings()
{
    LoggerFactory = loggerFactory,
    EnableDebugMode = true,  // 低レベルのネットワークトレースを有効化
};
```

***

### ORM &amp; Dapper サポート {#orm-support}

`ClickHouse.Driver` は Dapper（いくつかの制限付きで）をサポートします。

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
