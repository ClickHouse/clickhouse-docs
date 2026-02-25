---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'ClickHouse에 연결하기 위한 공식 C# 클라이언트입니다.'
title: 'ClickHouse C# 드라이버'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_csharp from '@site/static/images/_snippets/connection-details-csharp.png';


# ClickHouse C# client \{#clickhouse-c-client\}

ClickHouse에 연결하기 위한 공식 C# 클라이언트입니다.
클라이언트 소스 코드는 [GitHub 저장소](https://github.com/ClickHouse/clickhouse-cs)에서 확인할 수 있습니다.
원래는 [Oleg V. Kozlyuk](https://github.com/DarkWanderer)이 개발했습니다.

이 라이브러리는 두 가지 주요 API를 제공합니다:

- **`ClickHouseClient`** (권장): 싱글톤 사용을 위해 설계된 고수준 스레드 안전 클라이언트입니다. 쿼리 및 대량 삽입을 위한 간단한 비동기 API를 제공합니다. 대부분의 애플리케이션에 가장 적합합니다.

- **ADO.NET** (`ClickHouseDataSource`, `ClickHouseConnection`, `ClickHouseCommand`): 표준 .NET 데이터베이스 추상화입니다. ORM 통합(Dapper, Linq2db)과 ADO.NET 호환성이 필요할 때 사용합니다. `ClickHouseBulkCopy`는 ADO.NET 연결을 사용하여 데이터를 효율적으로 삽입하기 위한 도우미 클래스입니다. `ClickHouseBulkCopy`는 더 이상 사용되지 않으며, 향후 릴리스에서 제거될 예정입니다. 대신 `ClickHouseClient.InsertBinaryAsync`를 사용하십시오.

두 API는 동일한 기반 HTTP 연결 풀을 공유하며, 하나의 애플리케이션 내에서 함께 사용할 수 있습니다.

## 마이그레이션 가이드 \{#migration-guide\}

1. `.csproj` 파일에서 패키지 이름을 `ClickHouse.Driver`로 변경한 후 [NuGet의 최신 버전](https://www.nuget.org/packages/ClickHouse.Driver)으로 업데이트합니다.
2. 코드베이스 전반에서 모든 `ClickHouse.Client` 참조를 `ClickHouse.Driver`로 변경합니다.

---

## 지원되는 .NET 버전 \{#supported-net-versions\}

`ClickHouse.Driver`는 다음과 같은 .NET 버전을 지원합니다.

* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

## 설치 \{#installation\}

NuGet에서 패키지를 설치하십시오:

```bash
dotnet add package ClickHouse.Driver
```

또는 NuGet Package Manager를 사용합니다:

```bash
Install-Package ClickHouse.Driver
```


## 빠르게 시작하기 \{#quick-start\}

```csharp
using ClickHouse.Driver;

// Create a client (typically as a singleton)
using var client = new ClickHouseClient("Host=my.clickhouse;Protocol=https;Port=8443;Username=user");

// Execute a query
var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine(version);
```


## Configuration \{#configuration\}

ClickHouse 연결을 구성하는 방법은 두 가지가 있습니다:

* **Connection string:** 세미콜론으로 구분된 키-값 쌍으로, 호스트, 인증 정보 및 기타 연결 옵션을 지정합니다.
* **`ClickHouseClientSettings` object:** 설정 파일에서 로드하거나 코드에서 설정할 수 있는 강하게 타입이 지정된 구성 객체입니다.

아래는 모든 설정과 해당 기본값, 그리고 각 설정이 미치는 영향에 대한 전체 목록입니다.

### 연결 설정 \{#connection-settings\}

| Property(속성) | Type(유형) | Default(기본값) | Connection String Key | Description(설명) |
|----------|------|---------|----------------------|-------------|
| Host | `string` | `"localhost"` | `Host` | ClickHouse 서버의 호스트 이름 또는 IP 주소 |
| Port | `ushort` | 8123 (HTTP) / 8443 (HTTPS) | `Port` | 포트 번호; 프로토콜에 따라 기본값이 결정됩니다 |
| Username | `string` | `"default"` | `Username` | 인증에 사용할 사용자 이름 |
| Password | `string` | `""` | `Password` | 인증에 사용할 비밀번호 |
| Database | `string` | `""` | `Database` | 기본 데이터베이스; 비어 있으면 서버/사용자 기본값이 사용됩니다 |
| Protocol | `string` | `"http"` | `Protocol` | 연결 프로토콜: `"http"` 또는 `"https"` |
| Path | `string` | `null` | `Path` | 리버스 프록시 시나리오용 URL 경로 (예: `/clickhouse`) |
| Timeout | `TimeSpan` | 2 minutes | `Timeout` | 작업 타임아웃(연결 문자열에는 초 단위로 저장됩니다) |

### 데이터 형식 및 직렬화 \{#data-format-serialization\}

| 속성 | 타입 | 기본값 | 연결 문자열 키 | 설명 |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | 데이터 전송 시 gzip 압축을 사용하도록 설정합니다 |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | 임의 정밀도를 위해 `ClickHouseDecimal`을 사용합니다. `false`인 경우 .NET `decimal`(128비트 한계)을 사용합니다 |
| ReadStringsAsByteArrays | `bool` | `false` | `ReadStringsAsByteArrays` | `String` 및 `FixedString` 컬럼을 `string` 대신 `byte[]`로 읽습니다. 바이너리 데이터에 유용합니다 |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | 매개변수를 URL 쿼리 문자열 대신 폼 데이터로 전송합니다 |
| JsonReadMode | `JsonReadMode` | `Binary` | `JsonReadMode` | JSON 데이터 반환 방식: `Binary`( `JsonObject`를 반환) 또는 `String`(원시 JSON 문자열을 반환) |
| JsonWriteMode | `JsonWriteMode` | `String` | `JsonWriteMode` | JSON 데이터 전송 방식: `String`( `JsonSerializer`를 통해 직렬화하며 모든 입력을 허용) 또는 `Binary`(타입 힌트가 있는 등록된 POCO에만 사용 가능) |

### 세션 관리 \{#session-management\}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| UseSession | `bool` | `false` | `UseSession` | 상태 유지 세션을 활성화하여 요청을 직렬화합니다. |
| SessionId | `string` | `null` | `SessionId` | 세션 ID입니다. 값이 null이고 UseSession이 true이면 GUID가 자동으로 생성됩니다. |

:::note
`UseSession` 플래그는 서버 세션을 유지하도록 설정하여 `SET` 문과 임시 테이블을 사용할 수 있게 합니다. 세션은 60초 동안 활동이 없으면(기본 타임아웃) 초기화됩니다. 세션 수명은 ClickHouse 문 또는 서버 설정에서 세션 관련 설정을 지정하여 연장할 수 있습니다.

`ClickHouseConnection` 클래스는 일반적으로 병렬 실행을 허용하여 여러 스레드가 동시에 쿼리를 실행할 수 있습니다. 그러나 `UseSession` 플래그를 활성화하면 어느 시점에서든 하나의 연결당 하나의 활성 쿼리만 허용됩니다(이는 서버 측 제한 사항입니다).
:::

### 보안 \{#security\}

| 속성 | 타입 | 기본값 | 연결 문자열 키 | 설명 |
|----------|------|---------|----------------------|-------------|
| SkipServerCertificateValidation | `bool` | `false` | — | HTTPS 인증서 유효성 검사를 건너뜁니다. **운영(프로덕션) 환경에서는 사용하지 마십시오** |

### HTTP 클라이언트 구성 \{#http-client-configuration\}

| 속성 | 형식 | 기본값 | 연결 문자열 키 | 설명 |
|----------|------|---------|----------------------|-------------|
| HttpClient | `HttpClient` | `null` | — | 미리 구성된 사용자 지정 HttpClient 인스턴스 |
| HttpClientFactory | `IHttpClientFactory` | `null` | — | HttpClient 인스턴스를 생성하기 위한 사용자 지정 팩터리 |
| HttpClientName | `string` | `null` | — | 특정 클라이언트를 생성할 때 사용할 HttpClientFactory 이름 |

### 로깅 및 디버깅 \{#logging-debugging\}

| 속성 | 유형 | 기본값 | 연결 문자열 키 | 설명 |
|----------|------|---------|----------------------|-------------|
| LoggerFactory | `ILoggerFactory` | `null` | — | 진단 로깅을 위한 로거 팩터리 |
| EnableDebugMode | `bool` | `false` | — | .NET 네트워크 추적을 활성화합니다(Trace 수준으로 설정된 LoggerFactory 필요); **성능에 상당한 영향을 미칩니다** |

### 사용자 지정 설정 및 역할 \{#custom-settings-roles\}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| CustomSettings | `IDictionary<string, object>` | Empty | `set_*` prefix | ClickHouse 서버 설정, 아래 노트 참고 |
| Roles | `IReadOnlyList<string>` | Empty | `Roles` | 쉼표로 구분된 ClickHouse 역할 (예: `Roles=admin,reader`) |

:::note
연결 문자열(connection string)을 사용하여 사용자 지정 설정을 지정할 때는 `set_` 접두사를 사용합니다. 예: 「set_max_threads=4」. `ClickHouseClientSettings` 객체를 사용할 때는 `set_` 접두사를 사용하지 않습니다.

사용 가능한 설정 전체 목록은 [여기](https://clickhouse.com/docs/operations/settings/settings)를 참고하십시오.
:::

---

### 연결 문자열 예제 \{#connection-string-examples\}

#### 기본 연결 \{#basic-connection\}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```


#### 사용자 지정 ClickHouse 설정 사용 시 \{#with-custom-clickhouse-settings\}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```

***


### QueryOptions \{#query-options\}

`QueryOptions`를 사용하면 쿼리 단위로 클라이언트 수준 설정을 재정의할 수 있습니다. 모든 속성은 선택 사항이며, 지정한 경우에만 클라이언트 기본값을 재정의합니다.

| Property         | Type                          | Description                                                       |
| ---------------- | ----------------------------- | ----------------------------------------------------------------- |
| QueryId          | `string`                      | `system.query_log`에서 추적 또는 취소를 위한 사용자 정의 쿼리 식별자                   |
| Database         | `string`                      | 이 쿼리에 대해 기본 데이터베이스 재정의                                            |
| Roles            | `IReadOnlyList<string>`       | 이 쿼리에 대해 클라이언트 역할 재정의                                             |
| CustomSettings   | `IDictionary<string, object>` | 이 쿼리에 대한 ClickHouse 서버 설정(예: `max_threads`)                       |
| CustomHeaders    | `IDictionary<string, string>` | 이 쿼리에 대한 추가 HTTP 헤더                                               |
| UseSession       | `bool?`                       | 이 쿼리에 대한 세션 동작 재정의                                                |
| SessionId        | `string`                      | 이 쿼리에 대한 세션 ID (`UseSession = true` 필요)                           |
| BearerToken      | `string`                      | 이 쿼리에 대한 인증 토큰 재정의                                                |
| MaxExecutionTime | `TimeSpan?`                   | 서버 측 쿼리 타임아웃(SETTING `max_execution_time`으로 전달됨); 초과 시 서버에서 쿼리 취소 |

**예시:**

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

`InsertOptions`는 `InsertBinaryAsync`를 사용한 대량 삽입 작업에 특화된 설정을 추가하여 `QueryOptions`를 확장합니다.

| Property               | Type              | Default     | Description                                   |
| ---------------------- | ----------------- | ----------- | --------------------------------------------- |
| BatchSize              | `int`             | 100,000     | 배치당 행 개수                                      |
| MaxDegreeOfParallelism | `int`             | 1           | 병렬로 업로드되는 배치 수                                |
| Format                 | `RowBinaryFormat` | `RowBinary` | 이진 포맷: `RowBinary` 또는 `RowBinaryWithDefaults` |

모든 `QueryOptions` 속성은 `InsertOptions`에서도 동일하게 사용할 수 있습니다.

**예시:**

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

`ClickHouseClient`는 ClickHouse와 상호 작용하는 데 권장되는 API입니다. 스레드 안전하며 싱글톤으로 사용하도록 설계되었고, 내부적으로 HTTP 연결 풀링을 관리합니다.

### 클라이언트 생성 \{#creating-a-client\}

연결 문자열 또는 `ClickHouseClientSettings` 객체를 사용하여 `ClickHouseClient`를 생성합니다. 사용 가능한 옵션은 [Configuration](#configuration) 섹션을 참조하십시오.

ClickHouse Cloud 서비스에 대한 세부 정보는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다.

서비스를 선택한 후 **Connect**를 클릭합니다.

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 서비스 연결 버튼" border />

**C#**을 선택합니다. 아래에 연결 정보가 표시됩니다.

<Image img={connection_details_csharp} size="md" alt="ClickHouse Cloud C# 연결 정보" border />

자가 관리형 ClickHouse를 사용하는 경우 연결 정보는 ClickHouse 관리자가 설정합니다.

연결 문자열 사용:

```csharp
using ClickHouse.Driver;

using var client = new ClickHouseClient("Host=localhost;Username=default;Password=secret");
```

또는 `ClickHouseClientSettings`를 사용합니다:

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

의존성 주입 시나리오에서는 `IHttpClientFactory`를 사용해야 합니다:

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
`ClickHouseClient`는 수명이 길게 유지되고 애플리케이션 전체에서 공유되도록 설계되었습니다. 한 번만 생성(일반적으로 싱글톤으로)한 후 모든 데이터베이스 작업에 재사용하십시오. 클라이언트는 내부적으로 HTTP 연결 풀링을 관리합니다.
:::

***


### 쿼리 실행 \{#executing-queries\}

결과를 반환하지 않는 SQL 문에는 `ExecuteNonQueryAsync`를 사용하십시오.

```csharp
// Create a table
await client.ExecuteNonQueryAsync(
    "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory"
);

// Drop a table
await client.ExecuteNonQueryAsync("DROP TABLE IF EXISTS default.my_table");
```

단일 값을 가져오려면 `ExecuteScalarAsync`를 사용하십시오:

```csharp
var count = await client.ExecuteScalarAsync("SELECT count() FROM default.my_table");
Console.WriteLine($"Row count: {count}");

var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine($"Server version: {version}");
```

***


### 데이터 삽입 \{#inserting-data\}

#### 매개변수화된 INSERT \{#parameterized-inserts\}

`ExecuteNonQueryAsync`를 사용하여 매개변수화된 쿼리로 데이터를 INSERT합니다. 매개변수 유형은 SQL 문에서 `{name:Type}` 문법을 사용하여 지정해야 합니다.

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


#### 대량 삽입 \{#bulk-insert\}

`InsertBinaryAsync`를 사용하면 대량의 행을 효율적으로 삽입할 수 있습니다. 이 메서드는 ClickHouse의 네이티브 row binary 형식을 사용해 데이터를 스트리밍하고, 병렬 배치 업로드를 지원하며, 파라미터화된 쿼리에서 발생할 수 있는 「URL too long」 오류를 방지합니다.

```csharp
// Prepare data as IEnumerable<object[]>
var rows = Enumerable.Range(0, 1_000_000)
    .Select(i => new object[] { (long)i, $"value{i}" });

var columns = new[] { "id", "name" };

// Basic insert
long rowsInserted = await client.InsertBinaryAsync("default.my_table", columns, rows);
Console.WriteLine($"Rows inserted: {rowsInserted}");
```

대용량 데이터 세트에서는 `InsertOptions`를 사용하여 배치 및 병렬 처리를 구성합니다:

```csharp
var options = new InsertOptions
{
    BatchSize = 100_000,           // Rows per batch (default: 100,000)
    MaxDegreeOfParallelism = 4     // Parallel batch uploads (default: 1)
};
```

:::note

* 클라이언트는 INSERT 전에 `SELECT * FROM <table> WHERE 1=0`을 통해 테이블 구조를 자동으로 가져옵니다. 제공하는 값은 대상 컬럼 타입과 일치해야 합니다.
* `MaxDegreeOfParallelism > 1`인 경우 배치가 병렬로 업로드됩니다. 세션은 병렬 삽입과 호환되지 않으므로, 세션을 비활성화하거나 `MaxDegreeOfParallelism = 1`로 설정해야 합니다.
* 값이 제공되지 않은 컬럼에 대해 서버가 DEFAULT 값을 적용하도록 하려면, `InsertOptions.Format`에서 `RowBinaryFormat.RowBinaryWithDefaults`를 사용하십시오.
  :::

***


### 데이터 읽기 \{#reading-data\}

`ExecuteReaderAsync`를 사용하여 SELECT 쿼리를 실행합니다. 반환된 `ClickHouseDataReader`는 `GetInt64()`, `GetString()`, `GetFieldValue<T>()`와 같은 메서드를 통해 결과 컬럼에 타입이 지정된 방식으로 접근할 수 있도록 합니다.

다음 행으로 이동하려면 `Read()`를 호출합니다. 더 이상 행이 없으면 `false`를 반환합니다. 컬럼은 인덱스(0부터 시작) 또는 컬럼 이름으로 접근합니다.

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


### SQL 매개변수 \{#sql-parameters\}

ClickHouse에서 SQL 쿼리의 쿼리 매개변수에 사용하는 표준 형식은 `{parameter_name:DataType}`입니다.

**예시:**

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
SQL &#39;bind&#39; 매개변수는 HTTP URI 쿼리 매개변수로 전달되므로 너무 많이 사용하면 「URL too long」 예외가 발생할 수 있습니다. 이 제한을 피하려면 대량의 데이터를 삽입할 때 `InsertBinaryAsync`를 사용하십시오.
:::

***


### Query ID \{#query-id\}

각 쿼리에는 고유한 `query_id`가 할당되며, 이는 `system.query_log` 테이블에서 데이터를 가져오거나 장시간 실행되는 쿼리를 취소하는 데 사용할 수 있습니다. `QueryOptions`를 통해 사용자 정의 Query ID를 지정할 수 있습니다:

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
사용자 지정 `QueryId`를 사용하는 경우, 호출마다 고유하도록 설정해야 합니다. 임의의 GUID를 사용하는 것이 좋습니다.
:::

***


### Raw 스트리밍 \{#raw-streaming\}

`ExecuteRawResultAsync`를 사용하여 특정 형식의 쿼리 결과를 데이터 리더(data reader)를 거치지 않고 직접 스트리밍합니다. 이는 데이터를 파일로 내보내거나 다른 시스템으로 직접 전달할 때 유용합니다:

```csharp
using var result = await client.ExecuteRawResultAsync(
    "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow"
);

await using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = await reader.ReadToEndAsync();
```

일반적인 형식: `JSONEachRow`, `CSV`, `TSV`, `Parquet`, `Native`. 모든 옵션은 [형식(formats) 문서](/docs/interfaces/formats)를 참조하십시오.

***


### Raw 스트림 삽입 \{#raw-stream-insert\}

`InsertRawStreamAsync`를 사용하여 CSV, JSON, Parquet 또는 [지원되는 ClickHouse 형식](/docs/interfaces/formats)과 같은 형식의 파일 스트림이나 메모리 스트림에서 데이터를 직접 삽입합니다.

**CSV 파일에서 삽입:**

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
데이터 수집 동작을 제어할 수 있는 옵션은 [포맷 설정 문서](/docs/operations/settings/formats)를 참고하십시오.
:::

***


### 추가 예시 \{#more-examples\}

더 많은 실사용 예시는 GitHub 저장소의 [examples 디렉터리](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples)를 참조하십시오.

## ADO.NET \{#ado-net\}

이 라이브러리는 `ClickHouseConnection`, `ClickHouseCommand`, `ClickHouseDataReader`를 통해 ADO.NET 기능을 모두 지원합니다. 이 API는 ORM(Dapper, Linq2db)과의 통합이나 표준 .NET 데이터베이스 추상화가 필요한 경우에 필수입니다.

### ClickHouseDataSource를 통한 수명 주기 관리 \{#ado-net-datasource\}

올바른 수명 주기 관리와 커넥션 풀링을 위해서는 **항상 `ClickHouseDataSource`에서 커넥션을 생성해야 합니다.** DataSource는 내부적으로 하나의 `ClickHouseClient`만을 관리하며, 모든 커넥션은 해당 클라이언트의 HTTP 커넥션 풀을 공유합니다.

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

종속성 주입 사용 시:

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
프로덕션 코드에서는 **`ClickHouseConnection` 인스턴스를 직접 생성하지 마십시오**. 직접 인스턴스를 생성할 때마다 새로운 HTTP 클라이언트와 커넥션 풀이 만들어지며, 부하가 걸린 상황에서는 소켓 고갈을 초래할 수 있습니다:

```csharp
// DON'T DO THIS - creates new connection pool each time
using var conn = new ClickHouseConnection("Host=localhost");
await conn.OpenAsync();
```

대신 항상 `ClickHouseDataSource`를 사용하거나 하나의 `ClickHouseClient` 인스턴스를 공유하십시오.
:::

***


### ClickHouseCommand 사용 \{#ado-net-command\}

연결을 기반으로 명령을 생성하여 SQL을 실행합니다:

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

명령 메서드:

* `ExecuteNonQueryAsync()` - INSERT, UPDATE, DELETE, DDL SQL 문에 사용합니다.
* `ExecuteScalarAsync()` - 첫 번째 행의 첫 번째 컬럼을 반환합니다.
* `ExecuteReaderAsync()` - 결과를 순회하며 처리하기 위한 `ClickHouseDataReader`를 반환합니다.

***


### ClickHouseDataReader 사용하기 \{#ado-net-reader\}

`ClickHouseDataReader`는 쿼리 결과에 형식이 지정된 방식으로 접근할 수 있도록 합니다.

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


## 모범 사례 \{#best-practices\}

### 연결 수명과 풀링 \{#best-practices-connection-lifetime\}

`ClickHouse.Driver`는 내부적으로 `System.Net.Http.HttpClient`를 사용합니다. `HttpClient`는 엔드포인트별 연결 풀을 가집니다. 그 결과:

* 데이터베이스 세션은 연결 풀에서 관리하는 HTTP 연결을 통해 멀티플렉싱됩니다.
* HTTP 연결은 풀에 의해 자동으로 재사용됩니다.
* `ClickHouseClient` 또는 `ClickHouseConnection` 객체가 dispose된 이후에도 연결은 계속 유지될 수 있습니다.

**권장 패턴:**

| 시나리오 | 권장 접근 방식 |
|----------|---------------------|
| 일반적인 사용 | 싱글톤 `ClickHouseClient`를 사용합니다 |
| ADO.NET / ORM | `ClickHouseDataSource`를 사용합니다 (동일한 풀을 공유하는 연결을 생성) |
| DI 환경 | `ClickHouseClient` 또는 `ClickHouseDataSource`를 `IHttpClientFactory`와 함께 싱글톤으로 등록합니다 |

:::important
커스텀 `HttpClient` 또는 `HttpClientFactory`를 사용하는 경우, half-closed 연결로 인한 오류를 피하기 위해 `PooledConnectionIdleTimeout`을 서버의 `keep_alive_timeout`보다 작은 값으로 설정해야 합니다. Cloud 배포에서 기본 `keep_alive_timeout`은 10초입니다.
:::

:::warning
공유되지 않은 `HttpClient`로 여러 개의 `ClickHouseClient` 또는 독립적인 `ClickHouseConnection` 인스턴스를 생성하지 않도록 하십시오. 각 인스턴스는 자체 연결 풀을 생성합니다.
:::

---

### DateTime 처리 \{#best-practice-datetime\}

1. **가능한 한 UTC를 사용합니다.** 타임스탬프는 `DateTime('UTC')` 컬럼에 저장하고, 코드에서는 `DateTimeKind.Utc`를 사용합니다. 이렇게 하면 시간대와 관련된 모호성이 제거됩니다.

2. **명시적인 시간대 처리를 위해 `DateTimeOffset`을 사용합니다.** 항상 특정 시점을 표현하며, 오프셋 정보를 포함합니다.

3. **SQL 타입 힌트에 시간대를 지정합니다.** `Unspecified` DateTime 값을 사용하는 파라미터로 UTC가 아닌 컬럼을 대상으로 할 때에는 SQL에 시간대를 포함합니다:
   ```csharp
   var parameters = new ClickHouseParameterCollection();
   parameters.AddParameter("dt", myDateTime);

   await client.ExecuteNonQueryAsync(
       "INSERT INTO table (dt) VALUES ({dt:DateTime('Europe/Amsterdam')})",
       parameters
   );
   ```

---

### 비동기 insert \{#async-inserts\}

[비동기 insert](/docs/optimize/asynchronous-inserts)는 배치 작업의 책임을 클라이언트에서 서버로 이전합니다. 클라이언트 측 배치를 요구하는 대신, 서버가 수신 데이터를 버퍼링한 뒤 구성 가능한 임계값에 도달하면 스토리지로 플러시합니다. 이는 다수의 에이전트가 작은 페이로드를 전송하는 관측성 워크로드와 같은 동시성이 높은 시나리오에서 특히 유용합니다.

`CustomSettings` 또는 연결 문자열을 통해 비동기 insert를 활성화합니다:

```csharp
// Using CustomSettings
var settings = new ClickHouseClientSettings("Host=localhost");
settings.CustomSettings["async_insert"] = 1;
settings.CustomSettings["wait_for_async_insert"] = 1; // Recommended: wait for flush acknowledgment

// Or via connection string
// "Host=localhost;set_async_insert=1;set_wait_for_async_insert=1"
```

**두 가지 모드** (`wait_for_async_insert`로 제어):

| Mode                      | Behavior                                                    | Use case             |
| ------------------------- | ----------------------------------------------------------- | -------------------- |
| `wait_for_async_insert=1` | 데이터가 디스크에 플러시된 후에 INSERT 문이 완료됩니다. 이때 발생한 오류는 클라이언트로 반환됩니다. | 대부분의 워크로드에 **권장**    |
| `wait_for_async_insert=0` | 데이터가 버퍼링되자마자 INSERT 문이 즉시 완료됩니다. 데이터가 영구 저장된다는 보장은 없습니다.    | 데이터 손실이 허용되는 경우에만 사용 |

:::warning
`wait_for_async_insert=0`인 경우, 오류는 플러시 시점에만 발생하며 원래 INSERT 요청으로 추적할 수 없습니다. 또한 클라이언트에서 backpressure를 제공하지 않으므로 서버 과부하 위험이 있습니다.
:::

**주요 설정:**

| Setting                         | Description                |
| ------------------------------- | -------------------------- |
| `async_insert_max_data_size`    | 버퍼가 이 크기(바이트)에 도달하면 플러시합니다 |
| `async_insert_busy_timeout_ms`  | 이 타임아웃(밀리초)이 지나면 플러시합니다    |
| `async_insert_max_query_number` | 이 개수만큼 쿼리가 누적되면 플러시합니다     |

***


### 세션 \{#best-practices-sessions\}

상태 유지가 필요한 서버 측 기능이 있을 때에만 세션을 활성화하십시오. 예를 들면 다음과 같습니다.

* 임시 테이블 (`CREATE TEMPORARY TABLE`)
* 여러 SQL 문에 걸쳐 쿼리 컨텍스트 유지
* 세션 수준 설정 (`SET max_threads = 4`)

세션을 활성화하면 동일한 세션을 동시에 사용하는 것을 방지하기 위해 요청이 직렬화됩니다. 이로 인해 세션 상태가 필요하지 않은 워크로드에는 오버헤드가 발생합니다.

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

**ADO.NET 사용(ORM 호환성을 위해):**

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


## 지원되는 데이터 형식 \{#supported-data-types\}

`ClickHouse.Driver`는 모든 ClickHouse 데이터 형식을 지원합니다. 아래 표에서는 데이터베이스에서 데이터를 읽을 때 ClickHouse 형식과 .NET 네이티브 형식 간의 매핑을 보여줍니다.

### 타입 매핑: ClickHouse에서 읽을 때 \{#clickhouse-native-type-map-reading\}

#### 정수 형식 \{#type-map-reading-integer\}

| ClickHouse 형식 | .NET 형식 |
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

#### 부동 소수점 형식 \{#type-map-reading-floating-points\}

| ClickHouse 형식 | .NET 형식 |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

---

#### Decimal 타입 \{#type-map-reading-decimal\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Decimal(P, S) | `decimal` / `ClickHouseDecimal` |
| Decimal32(S) | `decimal` / `ClickHouseDecimal` |
| Decimal64(S) | `decimal` / `ClickHouseDecimal` |
| Decimal128(S) | `decimal` / `ClickHouseDecimal` |
| Decimal256(S) | `decimal` / `ClickHouseDecimal` |

:::note
Decimal 타입 변환은 UseCustomDecimals 설정으로 제어됩니다.
:::

---

#### Boolean 타입 \{#type-map-reading-boolean\}

| ClickHouse 타입 | .NET 타입 |
|-----------------|-----------|
| Bool | `bool` |

---

#### 문자열 타입 \{#type-map-reading-strings\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| String | `string` |
| FixedString(N) | `string` |

:::note
기본적으로 `String` 및 `FixedString(N)` 컬럼은 `string`으로 반환됩니다. 연결 문자열에 `ReadStringsAsByteArrays=true`를 설정하면 대신 `byte[]`로 읽을 수 있습니다. 이는 유효한 UTF-8이 아닐 수 있는 바이너리 데이터를 저장할 때 유용합니다.
:::

---

#### 날짜 및 시간 타입 \{#type-map-reading-datetime\}

| ClickHouse Type | .NET Type  |
| --------------- | ---------- |
| Date            | `DateTime` |
| Date32          | `DateTime` |
| DateTime        | `DateTime` |
| DateTime32      | `DateTime` |
| DateTime64      | `DateTime` |
| Time            | `TimeSpan` |
| Time64          | `TimeSpan` |

ClickHouse는 내부적으로 `DateTime` 및 `DateTime64` 값을 Unix 타임스탬프(에포크 이후의 초 또는 초 단위 미만)로 저장합니다. 저장은 항상 UTC로 이루어지지만, 컬럼에는 값이 표시되고 해석되는 방식에 영향을 주는 타임존이 연결될 수 있습니다.

`DateTime` 값을 읽을 때는 컬럼의 타임존에 따라 `DateTime.Kind` 속성이 설정됩니다.

| Column Definition              | Returned DateTime.Kind | Notes                  |
| ------------------------------ | ---------------------- | ---------------------- |
| `DateTime('UTC')`              | `Utc`                  | 명시적인 UTC 타임존           |
| `DateTime('Europe/Amsterdam')` | `Unspecified`          | 오프셋이 적용됨               |
| `DateTime`                     | `Unspecified`          | 벽시계 시간(현지 시각)이 그대로 유지됨 |

UTC가 아닌 컬럼의 경우, 반환된 `DateTime`은 해당 타임존의 벽시계 시간(현지 시각)을 나타냅니다. 해당 타임존에 대한 올바른 오프셋을 포함하는 `DateTimeOffset`을 얻으려면 `ClickHouseDataReader.GetDateTimeOffset()`을 사용하십시오.

```csharp
var reader = (ClickHouseDataReader)await connection.ExecuteReaderAsync(
    "SELECT toDateTime('2024-06-15 14:30:00', 'Europe/Amsterdam')");
reader.Read();

var dt = reader.GetDateTime(0);    // 2024-06-15 14:30:00, Kind=Unspecified
var dto = reader.GetDateTimeOffset(0); // 2024-06-15 14:30:00 +02:00 (CEST)
```

명시적인 타임존이 **없는** 컬럼(예: `DateTime('Europe/Amsterdam')` 대신 `DateTime`)의 경우, 드라이버는 `Kind=Unspecified`인 `DateTime`을 반환합니다. 이는 타임존에 대한 가정을 하지 않고, 저장된 그대로의 벽시계 시간(wall-clock time)을 정확하게 보존합니다.

명시적인 타임존이 없는 컬럼에서 타임존을 인식하는 동작이 필요하면 다음 중 하나를 사용하십시오.

1. 컬럼 정의에서 명시적인 타임존을 사용합니다: `DateTime('UTC')` 또는 `DateTime('Europe/Amsterdam')`
2. 데이터를 읽은 후 직접 타임존을 적용합니다.

***


#### JSON 타입 \{#type-map-reading-json\}

| ClickHouse Type | .NET Type    | Notes                       |
| --------------- | ------------ | --------------------------- |
| Json            | `JsonObject` | 기본값 (`JsonReadMode=Binary`) |
| Json            | `string`     | `JsonReadMode=String`인 경우   |

JSON 컬럼의 반환 타입은 `JsonReadMode` 설정으로 제어됩니다:

* **`Binary`(기본값)**: `System.Text.Json.Nodes.JsonObject`를 반환합니다. JSON 데이터에 구조화된 방식으로 접근할 수 있지만, IP 주소, UUID, 큰 소수 등과 같은 ClickHouse의 특수 타입은 JSON 구조 내에서 문자열 표현으로 변환됩니다.

* **`String`**: 원본 JSON을 `string` 형태로 그대로 반환합니다. ClickHouse로부터의 JSON 표현을 정확히 보존하므로, JSON을 파싱하지 않고 그대로 전달해야 하거나, 역직렬화를 직접 처리하려는 경우에 유용합니다.

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


#### 기타 타입 \{#type-map-reading-other\}

| ClickHouse 타입 | .NET 타입 |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | 아래 참고 |
| Array(T) | `T[]` |
| Tuple(T1, T2, ...) | `Tuple<T1, T2, ...>` / `LargeTuple` |
| Map(K, V) | `Dictionary<K, V>` |
| Nullable(T) | `T?` |
| Enum8 | `string` |
| Enum16 | `string` |
| LowCardinality(T) | T와 동일 |
| SimpleAggregateFunction | 기저 타입과 동일 |
| Nested(...) | `Tuple[]` |
| Variant(T1, T2, ...) | 아래 참고 |
| QBit(T, dimension) | `T[]` |

:::note
Dynamic 및 Variant 타입은 각 행의 실제 기저 타입에 해당하는 타입으로 변환됩니다.
:::

---

#### Geometry 타입 \{#type-map-reading-geometry\}

| ClickHouse 타입 | .NET 타입 |
|-----------------|-----------|
| Point | `Tuple<double, double>` |
| Ring | `Tuple<double, double>[]` |
| LineString | `Tuple<double, double>[]` |
| Polygon | `Ring[]` |
| MultiLineString | `LineString[]` |
| MultiPolygon | `Polygon[]` |
| Geometry | 아래 노트 참조 |

:::note
Geometry 타입은 모든 geometry 타입을 담을 수 있는 Variant 타입입니다. 적절한 도형 타입으로 변환됩니다.
:::

---

### 타입 매핑: ClickHouse로 쓰기 \{#clickhouse-native-type-map-writing\}

데이터를 삽입할 때 드라이버는 .NET 타입을 해당하는 ClickHouse 타입으로 변환합니다. 아래 표는 각 ClickHouse 컬럼 타입에 대해 어떤 .NET 타입이 허용되는지 보여줍니다.

#### 정수 타입 \{#type-map-writing-integer\}

| ClickHouse 타입 | 허용되는 .NET 타입 | 비고 |
|-----------------|---------------------|-------|
| Int8 | `sbyte`, `Convert.ToSByte()`와 호환되는 모든 타입 |  |
| UInt8 | `byte`, `Convert.ToByte()`와 호환되는 모든 타입 |  |
| Int16 | `short`, `Convert.ToInt16()`와 호환되는 모든 타입 |  |
| UInt16 | `ushort`, `Convert.ToUInt16()`와 호환되는 모든 타입 |  |
| Int32 | `int`, `Convert.ToInt32()`와 호환되는 모든 타입 |  |
| UInt32 | `uint`, `Convert.ToUInt32()`와 호환되는 모든 타입 |  |
| Int64 | `long`, `Convert.ToInt64()`와 호환되는 모든 타입 |  |
| UInt64 | `ulong`, `Convert.ToUInt64()`와 호환되는 모든 타입 |  |
| Int128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, `Convert.ToInt64()`와 호환되는 모든 타입 | |
| UInt128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, `Convert.ToInt64()`와 호환되는 모든 타입 | |
| Int256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, `Convert.ToInt64()`와 호환되는 모든 타입 | |
| UInt256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, `Convert.ToInt64()`와 호환되는 모든 타입 | |

---

#### 부동 소수점 타입 \{#type-map-writing-floating-point\}

| ClickHouse Type | 허용 .NET 타입 | 비고 |
|-----------------|---------------------|-------|
| Float32 | `float`, `Convert.ToSingle()`과 호환되는 모든 타입 |  |
| Float64 | `double`, `Convert.ToDouble()`과 호환되는 모든 타입 | |
| BFloat16 | `float`, `Convert.ToSingle()`과 호환되는 모든 타입 | 16비트 brain float 형식으로 잘라 저장합니다 |
---

#### Boolean 타입 \{#type-map-writing-boolean\}

| ClickHouse 타입 | 허용되는 .NET 타입 | 비고 |
|-----------------|--------------------|------|
| Bool | `bool` |  |

---

#### 문자열 타입 \{#type-map-writing-strings\}

| ClickHouse Type | 허용되는 .NET 타입 | 비고 |
|-----------------|---------------------|-------|
| String | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | 이진 타입은 그대로 기록되며, 스트림은 seekable 및 non-seekable 모두 허용됩니다 |
| FixedString(N) | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | 문자열은 UTF-8로 인코딩된 후 패딩되며, 이진 타입은 반드시 정확히 N 바이트여야 합니다 |

---

#### 날짜 및 시간 타입 \{#type-map-writing-datetime\}

| ClickHouse Type | 허용되는 .NET 타입                                                      | 설명                                                                              |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Date            | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | 유닉스 에포크 기준 일수로 UInt16 타입으로 변환됩니다                                                |
| Date32          | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | 유닉스 에포크 기준 일수로 Int32 타입으로 변환됩니다                                                 |
| DateTime        | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | 자세한 내용은 아래를 참조하십시오                                                              |
| DateTime32      | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | `DateTime`과 동일합니다                                                               |
| DateTime64      | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types          | Scale 매개변수에 따라 정밀도가 결정됩니다                                                       |
| Time            | `TimeSpan`, `int`                                                 | ±999:59:59 범위로 제한(clamp)되며, `int`는 초 단위로 처리됩니다                                  |
| Time64          | `TimeSpan`, `decimal`, `double`, `float`, `int`, `long`, `string` | 문자열은 `[-]HHH:MM:SS[.fraction]` 형식으로 파싱되며, ±999:59:59.999999999 범위로 제한(clamp)됩니다 |

드라이버는 값을 기록할 때 `DateTime.Kind`를 준수합니다:

| DateTime.Kind | HTTP 매개변수                                           | Bulk                      |
| ------------- | --------------------------------------------------- | ------------------------- |
| Utc           | 시점(instant)이 그대로 보존됩니다                              | 시점(instant)이 그대로 보존됩니다    |
| Local         | 시점(instant)이 그대로 보존됩니다                              | 시점(instant)이 그대로 보존됩니다    |
| Unspecified   | 매개변수 타입의 타임존(time zone, 기본값은 UTC)에서의 벽시계 시간으로 간주됩니다 | 컬럼의 타임존에서의 벽시계 시간으로 간주됩니다 |

`DateTimeOffset` 값은 항상 정확한 시점(instant)을 보존합니다.

**예시: UTC DateTime (시점 보존)**

```csharp
var utcTime = new DateTime(2024, 1, 15, 12, 0, 0, DateTimeKind.Utc);
// Stored as 12:00 UTC
// Read from DateTime('Europe/Amsterdam') column: 13:00 (UTC+1)
// Read from DateTime('UTC') column: 12:00 UTC
```

**예시: 지정되지 않은 DateTime(벽시계 시간)**

```csharp
var wallClock = new DateTime(2024, 1, 15, 14, 30, 0, DateTimeKind.Unspecified);
// Written to DateTime('Europe/Amsterdam') column: stored as 14:30 Amsterdam time
// Read back from DateTime('Europe/Amsterdam') column: 14:30
```

**권장 사항:** 가장 단순하고 예측 가능한 동작을 위해 모든 DateTime 관련 연산에는 `DateTimeKind.Utc` 또는 `DateTimeOffset`을 사용하십시오. 이렇게 하면 서버 시간대, 클라이언트 시간대, 컬럼 시간대와 관계없이 코드가 항상 일관되게 동작합니다.


#### HTTP 파라미터 vs 대량 복사 \{#datetime-http-param-vs-bulkcopy\}

`Unspecified` DateTime 값을 쓸 때 HTTP 파라미터 바인딩과 대량 복사 사이에는 중요한 차이가 있습니다.

**Bulk Copy**는 대상 컬럼의 타임존을 알고 있으며, 해당 타임존 기준으로 `Unspecified` 값을 올바르게 해석합니다.

**HTTP Parameters**는 컬럼의 타임존을 자동으로 알지 못합니다. SQL 타입 힌트에 타임존을 명시해야 합니다:

```csharp
// CORRECT: Timezone in SQL type hint - type is extracted automatically
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime('Europe/Amsterdam')})";
command.AddParameter("dt", myDateTime);

// INCORRECT: Without timezone hint, interpreted as UTC
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime})";
command.AddParameter("dt", myDateTime);
// String value "2024-01-15 14:30:00" interpreted as UTC, not Amsterdam time!
```

| `DateTime.Kind` | 대상 컬럼            | HTTP 매개변수 (tz 힌트 포함) | HTTP 매개변수 (tz 힌트 없음) | 대량 복사             |
| --------------- | ---------------- | -------------------- | -------------------- | ----------------- |
| `Utc`           | UTC              | 시점 유지                | 시점 유지                | 시점 유지             |
| `Utc`           | Europe/Amsterdam | 시점 유지                | 시점 유지                | 시점 유지             |
| `Local`         | Any              | 시점 유지                | 시점 유지                | 시점 유지             |
| `Unspecified`   | UTC              | UTC로 처리              | UTC로 처리              | UTC로 처리           |
| `Unspecified`   | Europe/Amsterdam | Amsterdam 시간으로 처리    | **UTC로 처리**          | Amsterdam 시간으로 처리 |

***


#### Decimal 타입 \{#type-map-writing-decimal\}

| ClickHouse Type | 허용되는 .NET 타입 | 비고 |
|-----------------|-------------------|------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, `Convert.ToDecimal()`과 호환되는 모든 타입 | 정밀도를 초과하면 `OverflowException`이 발생합니다 |
| Decimal32 | `decimal`, `ClickHouseDecimal`, `Convert.ToDecimal()`과 호환되는 모든 타입 | 최대 정밀도는 9입니다 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, `Convert.ToDecimal()`과 호환되는 모든 타입 | 최대 정밀도는 18입니다 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, `Convert.ToDecimal()`과 호환되는 모든 타입 | 최대 정밀도는 38입니다 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, `Convert.ToDecimal()`과 호환되는 모든 타입 | 최대 정밀도는 76입니다 |

---

#### JSON type \{#type-map-writing-json\}

| ClickHouse Type | Accepted .NET Types                            | Notes                            |
| --------------- | ---------------------------------------------- | -------------------------------- |
| Json            | `string`, `JsonObject`, `JsonNode`, any object | 동작은 `JsonWriteMode` 설정에 따라 달라집니다 |

JSON을 쓸 때의 동작은 `JsonWriteMode` 설정에 의해 제어됩니다:

| Input Type                           | `JsonWriteMode.String` (default)        | `JsonWriteMode.Binary`                            |
| ------------------------------------ | --------------------------------------- | ------------------------------------------------- |
| `string`                             | 그대로 전달됩니다                               | `ArgumentException`을(를) 발생시킵니다                    |
| `JsonObject`                         | `ToJsonString()`을 통해 직렬화됩니다             | `ArgumentException`을(를) 발생시킵니다                    |
| `JsonNode`                           | `ToJsonString()`을 통해 직렬화됩니다             | `ArgumentException`을(를) 발생시킵니다                    |
| Registered POCO                      | `JsonSerializer.Serialize()`을 통해 직렬화됩니다 | 타입 힌트가 포함된 바이너리 인코딩, 사용자 정의 경로 속성을 지원합니다          |
| Unregistered POCO / Anonymous object | `JsonSerializer.Serialize()`을 통해 직렬화됩니다 | `ClickHouseJsonSerializationException`을(를) 발생시킵니다 |

* **`String` (default)**: `string`, `JsonObject`, `JsonNode` 또는 임의의 객체를 허용합니다. 모든 입력은 `System.Text.Json.JsonSerializer`를 통해 직렬화되어 서버 측 파싱을 위한 JSON 문자열로 전송됩니다. 가장 유연한 모드이며 타입 등록 없이 동작합니다.

* **`Binary`**: 등록된 POCO 타입만 허용합니다. 데이터는 클라이언트 측에서 타입 힌트를 완전히 지원하는 ClickHouse의 바이너리 JSON 형식으로 변환됩니다. 사용 전에 `connection.RegisterJsonSerializationType<T>()`를 호출해야 합니다. 이 모드에서 `string` 또는 `JsonNode` 값을 쓰려고 하면 `ArgumentException`이 발생합니다.

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


##### 타입이 지정된 JSON 컬럼 \{#json-typed-columns\}

JSON 컬럼에 타입 힌트가 있는 경우(예: `JSON(id UInt64, price Decimal128(2))`), 드라이버는 이러한 힌트를 사용하여 값의 타입 정보를 완전히 보존할 수 있도록 직렬화합니다. 이렇게 하면 일반 JSON으로 직렬화할 때 정밀도가 손실될 수 있는 `UInt64`, `Decimal`, `UUID`, `DateTime64` 같은 타입의 정밀도를 유지할 수 있습니다.

##### POCO 직렬화 \{#json-poco-serialization\}

POCO는 `JsonWriteMode`에 따라 두 가지 방식으로 JSON 컬럼에 기록할 수 있습니다:

**문자열 모드(기본값)**: POCO는 `System.Text.Json.JsonSerializer`를 통해 직렬화됩니다. 타입 등록은 필요하지 않습니다. 가장 단순한 방식이며 익명 객체에도 사용할 수 있습니다.

**바이너리 모드**: POCO는 드라이버의 바이너리 JSON 포맷으로, 전체 타입 힌트 지원과 함께 직렬화됩니다. 사용 전에 타입을 `connection.RegisterJsonSerializationType<T>()`으로 등록해야 합니다. 이 모드는 특성(attribute)을 통한 사용자 지정 경로 매핑을 지원합니다:

* **`[ClickHouseJsonPath("path")]`**: 속성을 사용자 지정 JSON 경로에 매핑합니다. 중첩 구조이거나 속성 이름이 원하는 JSON 키와 다를 때 유용합니다. **바이너리 모드에서만 동작합니다.**

* **`[ClickHouseJsonIgnore]`**: 직렬화에서 속성을 제외합니다. **바이너리 모드에서만 동작합니다.**

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

프로퍼티 이름과 컬럼 타입 힌트의 일치는 대소문자를 구분합니다. 프로퍼티 `UserId`는 `UserId`로 정의된 힌트에만 일치하며 `userid`에는 일치하지 않습니다. 이는 `userName`과 `UserName` 같은 경로를 별도의 필드로 동시에 존재하도록 허용하는 ClickHouse의 동작 방식과 같습니다.

**제한 사항(Binary 모드 전용):**

* 직렬화 전에 POCO 타입을 연결에서 `connection.RegisterJsonSerializationType<T>()`으로 반드시 등록해야 합니다. 등록되지 않은 타입을 직렬화하려고 하면 `ClickHouseJsonSerializationException`이 발생합니다.
* 딕셔너리와 배열/리스트 프로퍼티는 올바르게 직렬화되려면 컬럼 정의에 타입 힌트가 필요합니다. 힌트가 없는 경우에는 대신 String 모드를 사용하십시오.
* POCO 프로퍼티의 null 값은 컬럼 정의에서 해당 경로에 `Nullable(T)` 타입 힌트가 있을 때만 기록됩니다. ClickHouse는 동적 JSON 경로 내부에 `Nullable` 타입을 허용하지 않으므로, 힌트가 없는 null 프로퍼티는 건너뜁니다.
* `ClickHouseJsonPath`와 `ClickHouseJsonIgnore` 특성은 String 모드에서는 무시됩니다(Binary 모드에서만 동작합니다).

***


#### 기타 타입 \{#type-map-writing-other\}

| ClickHouse Type | 허용되는 .NET 타입 | 비고 |
|-----------------|---------------------|-------|
| UUID | `Guid`, `string` | 문자열을 Guid로 파싱합니다 |
| IPv4 | `IPAddress`, `string` | IPv4여야 하며, 문자열은 `IPAddress.Parse()`로 파싱합니다 |
| IPv6 | `IPAddress`, `string` | IPv6여야 하며, 문자열은 `IPAddress.Parse()`로 파싱합니다 |
| Nothing | Any | 아무것도 기록하지 않습니다(no-op) |
| Dynamic | — | **지원되지 않습니다** (`NotImplementedException`을 발생시킵니다) |
| Array(T) | `IList`, `null` | null은 빈 배열로 기록됩니다 |
| Tuple(T1, T2, ...) | `ITuple`, `IList` | 요소 개수는 튜플 차수와 일치해야 합니다 |
| Map(K, V) | `IDictionary` | |
| Nullable(T) | `null`, `DBNull`, 또는 T가 허용하는 타입 | 값 앞에 null 플래그 바이트를 기록합니다 |
| Enum8 | `string`, `sbyte`, 숫자 타입 | 문자열을 enum 딕셔너리에서 조회합니다 |
| Enum16 | `string`, `short`, 숫자 타입 | 문자열을 enum 딕셔너리에서 조회합니다 |
| LowCardinality(T) | T가 허용하는 타입 | 하위 타입에 위임합니다 |
| SimpleAggregateFunction | 하위 타입이 허용하는 타입 | 하위 타입에 위임합니다 |
| Nested(...) | 튜플의 `IList` | 요소 개수는 필드 개수와 일치해야 합니다 |
| Variant(T1, T2, ...) | T1, T2, ... 중 하나에 해당하는 값 | 타입이 일치하지 않으면 `ArgumentException`을 발생시킵니다 |
| QBit(T, dim) | `IList` | Array에 위임하며, dimension은 메타데이터로만 사용됩니다 |

---

#### Geometry 타입 \{#type-map-writing-geometry\}

| ClickHouse Type | 허용되는 .NET 타입 | 비고 |
|-----------------|---------------------|-------|
| Point | `System.Drawing.Point`, `ITuple`, `IList` (요소 2개) |  |
| Ring | Point의 `IList` | |
| LineString | Point의 `IList` | |
| Polygon | Ring의 `IList` | |
| MultiLineString | LineString의 `IList` | |
| MultiPolygon | Polygon의 `IList` | |
| Geometry | 위에서 나열한 Geometry 타입 중 하나 | 모든 Geometry 타입을 포괄하는 변형 타입 |

---

#### 쓰기는 지원되지 않음 \{#type-map-writing-not-supported\}

| ClickHouse Type | 비고 |
|-----------------|------|
| Dynamic | `NotImplementedException` 예외를 발생시킵니다 |
| AggregateFunction | `AggregateFunctionException` 예외를 발생시킵니다 |

---

### 중첩 타입 처리 \{#nested-type-handling\}

ClickHouse 중첩 타입(`Nested(...)`)은 배열과 같은 방식으로 읽고 쓸 수 있습니다.

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


## 로깅 및 진단 \{#logging-and-diagnostics\}

ClickHouse .NET 클라이언트는 `Microsoft.Extensions.Logging` 추상화와 통합되어 가벼운 선택적 로깅 기능을 제공합니다. 로깅을 활성화하면 드라이버는 연결 수명주기 이벤트, 명령 실행, 전송 작업, 대량 삽입 작업에 대해 구조화된 메시지를 기록합니다. 로깅은 전적으로 선택 사항이므로 로거를 구성하지 않은 애플리케이션도 추가 오버헤드 없이 그대로 동작합니다.

### 빠르게 시작하기 \{#logging-quick-start\}

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


#### appsettings.json 사용하기 \{#logging-appsettings-config\}

.NET의 표준 구성을 사용하여 로깅 수준을 설정할 수 있습니다.

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


#### 인메모리 구성을 사용하기 \{#logging-inmemory-config\}

코드에서 카테고리별로 로깅 상세 수준을 설정할 수도 있습니다:

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


### 카테고리와 emitter \{#logging-categories\}

드라이버는 전용 카테고리를 사용하여 구성 요소별 로그 레벨을 세밀하게 조정할 수 있습니다.

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 연결 수명 주기, HTTP 클라이언트 팩토리 선택, 연결 열기/닫기, 세션 관리. |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | 쿼리 실행 시작/완료, 소요 시간, 쿼리 ID, 서버 통계, 오류 상세 정보. |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | 하위 수준 HTTP 스트리밍 요청, 압축 플래그, 응답 상태 코드, 전송 실패. |
| `ClickHouse.Driver.Client` | `ClickHouseClient` | 바이너리 insert, 쿼리 및 기타 작업. |
| `ClickHouse.Driver.NetTrace` | `TraceHelper` | 네트워크 추적(디버그 모드가 활성화된 경우에만). |

#### 예시: 연결 문제 진단 예시 \{#logging-config-example\}

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

다음 내용이 로그에 기록됩니다:

* HTTP 클라이언트 팩터리 선택(기본 풀 vs 단일 연결)
* HTTP 핸들러 구성(SocketsHttpHandler 또는 HttpClientHandler)
* 연결 풀 설정(MaxConnectionsPerServer, PooledConnectionLifetime 등)
* 타임아웃 설정(ConnectTimeout, Expect100ContinueTimeout 등)
* SSL/TLS 구성
* 연결 생성/종료 이벤트
* 세션 ID 추적


### 디버그 모드: 네트워크 추적 및 진단 \{#logging-debugmode\}

네트워크 문제를 진단하는 데 도움이 되도록 드라이버 라이브러리에는 .NET 네트워크 내부 동작에 대한 저레벨 추적을 활성화하는 도우미가 포함되어 있습니다. 이를 활성화하려면 로그 레벨이 Trace로 설정된 LoggerFactory를 전달하고 EnableDebugMode를 true로 설정해야 합니다 (`ClickHouse.Driver.Diagnostic.TraceHelper` 클래스를 통해 수동으로 활성화할 수도 있습니다). 이벤트는 `ClickHouse.Driver.NetTrace` 카테고리에 기록됩니다. 경고: 이 모드는 매우 방대한 로그를 생성하고 성능에 영향을 미칩니다. 운영 환경에서는 디버그 모드 활성화를 권장하지 않습니다.

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

드라이버는 .NET [`System.Diagnostics.Activity`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing) API를 통해 OpenTelemetry 분산 트레이싱에 대한 내장 지원을 제공합니다. 이 기능을 활성화하면 드라이버는 데이터베이스 작업에 대한 스팬을 생성하며, 이는 Jaeger나 [OpenTelemetry Collector](https://clickhouse.com/docs/observability/integrating-opentelemetry)를 통해 ClickHouse 자체를 포함한 관측성 백엔드로 내보낼 수 있습니다.

### 트레이싱 활성화 \{#opentelemetry-enabling\}

ASP.NET Core 애플리케이션에서는 OpenTelemetry 구성에 ClickHouse 드라이버의 `ActivitySource`를 추가합니다:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)  // Subscribe to ClickHouse driver spans
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());             // Or AddJaegerExporter(), etc.
```

콘솔 애플리케이션, 테스트 또는 수동 설정용:

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)
    .AddConsoleExporter()
    .Build();
```


### Span attributes \{#opentelemetry-attributes\}

각 스팬에는 디버깅에 활용할 수 있는 표준 OpenTelemetry 데이터베이스 속성과 ClickHouse 특화 쿼리 통계가 포함됩니다.

| Attribute | Description |
|-----------|-------------|
| `db.system` | 항상 `"clickhouse"` |
| `db.name` | 데이터베이스 이름 |
| `db.user` | 사용자 이름 |
| `db.statement` | SQL 쿼리(활성화된 경우) |
| `db.clickhouse.read_rows` | 쿼리가 읽은 행 수 |
| `db.clickhouse.read_bytes` | 쿼리가 읽은 바이트 수 |
| `db.clickhouse.written_rows` | 쿼리가 쓴 행 수 |
| `db.clickhouse.written_bytes` | 쿼리가 쓴 바이트 수 |
| `db.clickhouse.elapsed_ns` | 서버 측 실행 시간(나노초 단위) |

### 구성 옵션 \{#opentelemetry-configuration\}

`ClickHouseDiagnosticsOptions`로 추적 동작을 제어합니다.

```csharp
using ClickHouse.Driver.Diagnostic;

// Include SQL statements in spans (default: false for security)
ClickHouseDiagnosticsOptions.IncludeSqlInActivityTags = true;

// Truncate long SQL statements (default: 1000 characters)
ClickHouseDiagnosticsOptions.StatementMaxLength = 500;
```

:::warning
`IncludeSqlInActivityTags`를 활성화하면 트레이스에 민감한 데이터가 노출될 수 있습니다. 운영 환경에서는 주의하여 사용하십시오.
:::


## TLS 구성 \{#tls-configuration\}

HTTPS를 통해 ClickHouse에 연결할 때, 여러 가지 방법으로 TLS/SSL 동작을 구성할 수 있습니다.

### 사용자 정의 인증서 검증 \{#custom-certificate-validation\}

사용자 정의 인증서 검증 로직이 필요한 프로덕션 환경에서는 `ServerCertificateCustomValidationCallback` 핸들러가 구성된 `HttpClient`를 직접 제공하십시오:

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
사용자 정의 HttpClient를 제공할 때의 중요 고려 사항

* **자동 압축 해제(Automatic decompression)**: 압축이 비활성화되어 있지 않은 경우(기본적으로 압축은 활성화됨) `AutomaticDecompression`을 활성화해야 합니다.
* **유휴 타임아웃(Idle timeout)**: half-open 연결에서 발생하는 연결 오류를 방지하려면 `PooledConnectionIdleTimeout`을 서버의 `keep_alive_timeout`보다 작게 설정해야 합니다(ClickHouse Cloud에서는 기본값이 10초입니다).
  :::


## ORM 지원 \{#orm-support\}

ORM에서는 ADO.NET API (`ClickHouseConnection`)가 필요합니다. 연결 수명을 적절하게 관리하려면 `ClickHouseDataSource`에서 연결을 생성해야 합니다:

```csharp
// Register DataSource as singleton
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default");

// Create connections for ORM use
await using var connection = await dataSource.OpenConnectionAsync();
// Pass connection to your ORM...
```


### Dapper \{#orm-support-dapper\}

`ClickHouse.Driver`는 Dapper와 함께 사용할 수 있지만, 익명 객체는 지원되지 않습니다.

**실행 예제:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
```

**지원하지 않습니다:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```


### Linq2db \{#orm-support-linq2db\}

이 드라이버는 .NET용 경량 ORM 및 LINQ 프로바이더인 [linq2db](https://github.com/linq2db/linq2db)와 호환됩니다. 자세한 내용은 프로젝트 웹사이트를 참고하십시오.

**사용 예시:**

ClickHouse 프로바이더를 사용하여 `DataConnection`을 생성하십시오:

```csharp
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.ClickHouse;

var connectionString = "Host=localhost;Port=8123;Database=default";
var options = new DataOptions()
    .UseClickHouse(connectionString, ClickHouseProvider.ClickHouseDriver);

await using var db = new DataConnection(options);
```

테이블 매핑은 특성(attribute)이나 fluent 구성을 사용해 정의할 수 있습니다. 클래스와 속성 이름이 테이블 및 컬럼 이름과 정확히 일치하면 별도의 구성은 필요하지 않습니다.

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

**쿼리:**

```csharp
await using var db = new DataConnection(options);

var products = await db.GetTable<Product>()
    .Where(p => p.Price > 100)
    .OrderByDescending(p => p.Name)
    .ToListAsync();
```

**대량 복사(Bulk Copy):**

효율적인 대량 삽입을 위해 `BulkCopyAsync`를 사용하십시오.

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


### Entity framework core \{#orm-support-ef-core\}

현재 Entity Framework Core는 지원되지 않습니다.

## 제한 사항 \{#limitations\}

### AggregateFunction 컬럼 \{#aggregatefunction-columns\}

`AggregateFunction(...)` 타입의 컬럼은 직접 조회하거나 데이터로 삽입할 수 없습니다.

데이터를 삽입하려면:

```sql
INSERT INTO t VALUES (uniqState(1));
```

선택 시:

```sql
SELECT uniqMerge(c) FROM t;
```

***
