---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'ClickHouse に接続するための公式 C# クライアントです。'
title: 'ClickHouse C# ドライバー'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---



# ClickHouse C# クライアント

ClickHouse に接続するための公式 C# クライアントです。
クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-cs) で公開されています。
当初は [Oleg V. Kozlyuk](https://github.com/DarkWanderer) によって開発されたものです。



## 移行ガイド {#migration-guide}

1. `.csproj` ファイルを、新しいパッケージ名 `ClickHouse.Driver` と [NuGet の最新バージョン](https://www.nuget.org/packages/ClickHouse.Driver) を使用するように更新します。
2. コードベース内のすべての `ClickHouse.Client` 参照を `ClickHouse.Driver` に更新します。

---



## サポートされている .NET バージョン {#supported-net-versions}

`ClickHouse.Driver` は以下の .NET バージョンをサポートしています：

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

---



## インストール

NuGet からパッケージをインストールします。

```bash
dotnet add package ClickHouse.Driver
```

または、NuGet パッケージ マネージャーを使用します：

```bash
Install-Package ClickHouse.Driver
```

***


## クイックスタート

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

**Dapper** の使用：

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


## 使用方法

### 接続文字列パラメータ

| Parameter           | Description                    | Default                            |
| ------------------- | ------------------------------ | ---------------------------------- |
| `Host`              | ClickHouse サーバーアドレス            | `localhost`                        |
| `Port`              | ClickHouse サーバーポート             | `8123` または `8443` (`Protocol` に依存) |
| `Database`          | 初期データベース                       | `default`                          |
| `Username`          | 認証ユーザー名                        | `default`                          |
| `Password`          | 認証パスワード                        | *(空)*                              |
| `Protocol`          | 接続プロトコル（`http` または `https`）    | `http`                             |
| `Compression`       | Gzip 圧縮を有効化                    | `true`                             |
| `UseSession`        | 永続的なサーバーセッションを有効化              | `false`                            |
| `SessionId`         | カスタムセッション ID                   | ランダムな GUID                         |
| `Timeout`           | HTTP タイムアウト（秒）                 | `120`                              |
| `UseServerTimezone` | datetime カラムにサーバータイムゾーンを使用     | `true`                             |
| `UseCustomDecimals` | 10 進数に `ClickHouseDecimal` を使用 | `false`                            |

**例:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Sessions

`UseSession` フラグはサーバーセッションの永続化を有効にし、`SET` ステートメントや一時テーブルの利用を可能にします。セッションは 60 秒間操作がないとリセットされます（デフォルトのタイムアウト）。セッションの有効期間は、ClickHouse ステートメントでセッション設定を行うことで延長できます。

`ClickHouseConnection` クラスは通常、並列実行（複数スレッドでクエリを同時実行）を許可します。ただし、`UseSession` フラグを有効にすると、任意の時点で 1 接続あたり 1 件のアクティブなクエリに制限されます（サーバー側の制約）。

:::

***

### 接続の有効期間とプーリング

`ClickHouse.Driver` は内部的に `System.Net.Http.HttpClient` を使用します。`HttpClient` にはエンドポイントごとの接続プールがあります。その結果:

* `ClickHouseConnection` オブジェクトは TCP 接続と 1:1 には対応せず、複数のデータベースセッションがサーバーごとに複数（デフォルトでは 2 本）の TCP 接続上で多重化されます。
* `ClickHouseConnection` オブジェクトを破棄した後も、接続が存続する場合があります。
* この動作は、カスタム `HttpClientHandler` を持つ独自の `HttpClient` を渡すことで調整できます。

DI 環境向けに、HTTP クライアント設定を共通化できるコンストラクタ `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")` が用意されています。

**推奨事項:**

* `ClickHouseConnection` はサーバーとの「セッション」を表します。サーバーバージョンを問い合わせることで機能検出を行うため（オープン時にわずかなオーバーヘッドがあります）、一般的にはこのオブジェクトを何度も作成・破棄しても問題ありません。
* 推奨される接続の有効期間は、複数クエリにまたがる大きな「トランザクション」ごとに 1 つの接続オブジェクトとすることです。接続開始時にはわずかなオーバーヘッドがあるため、クエリごとに接続オブジェクトを作成することは推奨されません。
* アプリケーションが大量のトランザクションを処理し、`ClickHouseConnection` オブジェクトの頻繁な作成と破棄が必要な場合は、接続管理のために `IHttpClientFactory` または静的な `HttpClient` インスタンスを使用することを推奨します。

***

### テーブルの作成

標準的な SQL 構文を使用してテーブルを作成します:

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

### データの挿入

パラメータ付きクエリを使ってデータを挿入します。

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

### バルクインサート

`ClickHouseBulkCopy` を使用するには、次のものが必要です:

* 対象接続（`ClickHouseConnection` インスタンス）
* 対象テーブル名（`DestinationTableName` プロパティ）
* データソース（`IDataReader` または `IEnumerable<object[]>`）

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
* 設定可能なパラメータ: `Columns`、`BatchSize`、`MaxDegreeOfParallelism`。
* コピーの前に、`SELECT * FROM <table> LIMIT 0`クエリが実行され、ターゲットテーブルの構造に関する情報が取得されます。提供されるオブジェクトの型は、ターゲットテーブルと適切に一致する必要があります。
* セッションは並列挿入と互換性がありません。`ClickHouseBulkCopy`に渡される接続はセッションを無効にする必要があるか、`MaxDegreeOfParallelism`を`1`に設定する必要があります。
:::

---

### SELECTクエリの実行 {#performing-select-queries}

SELECTクエリを実行し、結果を処理します:

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

`ClickHouse.Driver` は、次の ClickHouse データ型を対応する .NET 型にマッピングしてサポートします:

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

**浮動小数点:**
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

### 地理型 {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Point の配列`
* `Polygon` → `Ring の配列`

### 複合型 {#complex-types}

* `Array(T)` → `任意の型の配列`
* `Tuple(T1, T2, ...)` → `任意の型のタプル`
* `Nullable(T)` → `任意の型の Nullable 版`
* `Map(K, V)` → `Dictionary<K, V>`

---

### DateTime の扱い {#datetime-handling}

`ClickHouse.Driver` は、タイムゾーンと `DateTime.Kind` プロパティを正しく扱うように動作します。具体的には次のとおりです:

* `DateTime` の値は UTC として返されます。ユーザーは自分で変換するか、`DateTime` インスタンスに対して `ToLocalTime()` メソッドを使用できます。
* 挿入時には、`DateTime` の値は次のように処理されます:
  * `UTC` の `DateTime` はそのまま挿入されます。ClickHouse は内部的に UTC で保持するためです。
  * `Local` の `DateTime` は、ユーザーのローカルタイムゾーン設定に基づいて UTC に変換されます。
  * `Unspecified` の `DateTime` は対象列のタイムゾーンに属するとみなされ、そのタイムゾーンに基づいて UTC に変換されます。
* タイムゾーンが指定されていない列では、デフォルトでクライアントのタイムゾーンが使用されます (レガシーな動作)。代わりにサーバーのタイムゾーンを使用するには、接続文字列の `UseServerTimezone` フラグを指定できます。

---



## ロギングと診断

ClickHouse .NET クライアントは、軽量でオプトイン型のロギング機能を提供するために、`Microsoft.Extensions.Logging` の抽象化レイヤーと統合されています。有効化すると、ドライバーは接続ライフサイクルイベント、コマンド実行、トランスポート処理、および一括コピーアップロードに関する構造化メッセージを出力します。ロギングは完全に任意であり、ロガーを構成していないアプリケーションも追加のオーバーヘッドなしでそのまま動作します。

### クイックスタート

#### ClickHouseConnection の使用

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

#### appsettings.json の使用

標準の .NET 構成機能を使用してログ レベルを設定できます。

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

#### インメモリ設定を使用する

コード内でカテゴリごとにログの出力レベルを設定することもできます。

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

### カテゴリと発行元

このドライバーは、コンポーネントごとにログレベルを細かく調整できるよう、専用のカテゴリを使用します。

| Category                       | Source                 | Highlights                                         |
| ------------------------------ | ---------------------- | -------------------------------------------------- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 接続ライフサイクル、HTTP クライアント ファクトリの選択、接続の確立/切断、セッション管理。   |
| `ClickHouse.Driver.Command`    | `ClickHouseCommand`    | クエリ実行の開始/完了、タイミング、クエリ ID、サーバー統計情報、エラー詳細。           |
| `ClickHouse.Driver.Transport`  | `ClickHouseConnection` | 低レベルの HTTP ストリーミングリクエスト、圧縮フラグ、レスポンスステータスコード、転送エラー。 |
| `ClickHouse.Driver.BulkCopy`   | `ClickHouseBulkCopy`   | メタデータの読み込み、バッチ処理、行数、アップロード完了。                      |

#### 例: 接続の問題の診断

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

これにより次の内容がログに記録されます：

* HTTP クライアントファクトリの選択（既定のプールか単一接続か）
* HTTP ハンドラーの構成（SocketsHttpHandler または HttpClientHandler）
* 接続プールの設定（MaxConnectionsPerServer、PooledConnectionLifetime など）
* タイムアウト設定（ConnectTimeout、Expect100ContinueTimeout など）
* SSL/TLS の構成
* 接続のオープン／クローズ イベント
* セッション ID の追跡

### デバッグモード：ネットワークトレースと診断

ネットワーク関連の問題の診断を支援するため、ドライバーライブラリには .NET のネットワーク内部処理を低レベルでトレースできるヘルパーが含まれています。これを有効にするには、ログレベルを Trace に設定した LoggerFactory を渡し、EnableDebugMode を true に設定する必要があります（または `ClickHouse.Driver.Diagnostic.TraceHelper` クラスを通じて手動で有効化します）。注意：これは非常に詳細なログを生成し、パフォーマンスに影響します。本番環境でデバッグモードを有効にすることは推奨されません。

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // ネットワークイベントを確認するには Trace レベルにする必要があります
});
```


var settings = new ClickHouseClientSettings()
{
LoggerFactory = loggerFactory,
EnableDebugMode = true, // 低レベルのネットワークトレースを有効にする
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
