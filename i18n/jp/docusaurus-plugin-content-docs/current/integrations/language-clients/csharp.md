---
'sidebar_label': 'C#'
'sidebar_position': 6
'keywords':
- 'clickhouse'
- 'cs'
- 'c#'
- '.net'
- 'dotnet'
- 'csharp'
- 'client'
- 'driver'
- 'connect'
- 'integrate'
'slug': '/integrations/csharp'
'description': 'ClickHouse に接続するための公式 C# クライアント。'
'title': 'ClickHouse C# ドライバー'
'doc_type': 'guide'
---


# ClickHouse C# クライアント

ClickHouse に接続するための公式 C# クライアントです。 
クライアントのソースコードは [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-cs) で入手可能です。
元々は [Oleg V. Kozlyuk](https://github.com/DarkWanderer) によって開発されました。

## マイグレーションガイド {#migration-guide}
1. `.csproj` を `ClickHouse.Driver` 名および [パッケージの最新バージョン](https://www.nuget.org/packages/ClickHouse.Driver) で更新してください。
2. 新しい `ClickHouse.Driver` の名前空間とクラスを使用するようにコードを更新してください。

## サポートされている .NET バージョン {#supported-net-versions}

`ClickHouse.Driver` は以下の .NET バージョンをサポートしています：
* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0

## インストール {#installation}

NuGet からパッケージをインストールします：

```bash
dotnet add package ClickHouse.Driver
```

または NuGet パッケージマネージャーを使用して：

```bash
Install-Package ClickHouse.Driver
```

## 使い方 {#usage}

### 接続の作成 {#creating-a-connection}

接続文字列を使用して接続を作成します：

```csharp
using ClickHouse.Driver.ADO;

var connectionString = "Host=localhost;Protocol=http;Database=default;Username=default;Password=";

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
}
```

### テーブルの作成 {#creating-a-table}

標準 SQL 構文を使用してテーブルを作成します：

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

### データの挿入 {#inserting-data}

パラメータ化されたクエリを使用してデータを挿入します：

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

### バルク挿入 {#bulk-insert}

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using var bulkInsert = new ClickHouseBulkCopy(connection)
    {
        DestinationTableName = "default.my_table",
        MaxDegreeOfParallelism = 2,
        BatchSize = 100
    };

    var values = Enumerable.Range(0, 100).Select(i => new object[] { (long)i, "value" + i.ToString() });
    await bulkInsert.WriteToServerAsync(values);
    Console.WriteLine($"Rows written: {bulkInsert.RowsWritten}");
}
```

### SELECT クエリの実行 {#performing-select-queries}

SELECT クエリを実行し、結果を処理します：

```csharp
using ClickHouse.Client.ADO;
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
### 生ストリーミング {#raw-streaming}
```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

## サポートされているデータ型 {#supported-data-types}

`ClickHouse.Driver` は以下の ClickHouse データ型をサポートしています：
**ブール型**
* `Bool` (bool)

**数値型**：
* `Int8` (sbyte)
* `Int16` (short)
* `Int32` (int)
* `Int64` (long)
* `Int128` (BigInteger)
* `Int256` (BigInteger)
* `UInt8` (byte)
* `UInt16` (ushort)
* `UInt32` (uint)
* `UInt64` (ulong)
* `UInt128` (BigInteger)
* `UInt256` (BigInteger)
* `Float32` (float)
* `Float64` (double)
* `Decimal` (decimal)
* `Decimal32` (decimal)
* `Decimal64` (decimal)
* `Decimal256` (BigDecimal)

**文字列型**
* `String` (string)
* `FixedString` (string)

**日付および時間型**
* `Date` (DateTime)
* `Date32` (DateTime)
* `DateTime` (DateTime)
* `DateTime32` (DateTime)
* `DateTime64` (DateTime)

**ネットワーク型**
* `IPv4` (IPAddress)
* `IPv6` (IPAddress)

**地理型**
* `Point` (Tuple)
* `Ring` (Array of Points)
* `Polygon` (Array of Rings)

**複合型**
* `Array` (任意型の配列)
* `Tuple` (任意型のタプル)
* `Nullable` (任意型の Nullable バージョン)

### DateTime の取り扱い {#datetime-handling}
`ClickHouse.Driver` は、タイムゾーンと `DateTime.Kind` プロパティを正しく扱おうとします。具体的には：

`DateTime` 値は UTC として返されます。ユーザーは、自分で変換するか、`DateTime` インスタンスの `ToLocalTime()` メソッドを使用できます。
挿入時には、`DateTime` 値は次のように処理されます：
- UTC の `DateTime` はそのまま挿入されます。ClickHouse は内部的に UTC で保存します。
- ローカル `DateTime` は、ユーザーのローカルタイムゾーン設定に従って UTC に変換されます。
- 未指定の `DateTime` はターゲットカラムのタイムゾーンにあると見なされ、そのタイムゾーンに従って UTC に変換されます。
