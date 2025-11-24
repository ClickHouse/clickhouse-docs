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
'description': 'ClickHouse에 연결하기 위한 공식 C# 클라이언트입니다.'
'title': 'ClickHouse C# 드라이버'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'language_client'
- 'website': 'https://github.com/ClickHouse/clickhouse-cs'
---


# ClickHouse C# 클라이언트

ClickHouse에 연결하기 위한 공식 C# 클라이언트입니다.
클라이언트 소스 코드는 [GitHub 저장소](https://github.com/ClickHouse/clickhouse-cs)에서 확인할 수 있습니다.
원래는 [Oleg V. Kozlyuk](https://github.com/DarkWanderer)에 의해 개발되었습니다.

## 마이그레이션 안내 {#migration-guide}

1. 새 패키지 이름 `ClickHouse.Driver`와 [NuGet의 최신 버전](https://www.nuget.org/packages/ClickHouse.Driver)으로 `.csproj` 파일을 업데이트하십시오.
2. 코드베이스에서 모든 `ClickHouse.Client` 참조를 `ClickHouse.Driver`로 업데이트하십시오.

---

## 지원되는 .NET 버전 {#supported-net-versions}

`ClickHouse.Driver`는 다음 .NET 버전을 지원합니다:

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0

---

## 설치 {#installation}

NuGet에서 패키지를 설치합니다:

```bash
dotnet add package ClickHouse.Driver
```

또는 NuGet 패키지 관리자를 사용하여:

```bash
Install-Package ClickHouse.Driver
```

---

## 빠른 시작 {#quick-start}

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

**Dapper** 사용:

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

## 사용법 {#usage}

### 연결 문자열 매개변수 {#connection-string}

| 매개변수           | 설명                                         | 기본값                |
| ------------------- | ------------------------------------------- | --------------------- |
| `Host`              | ClickHouse 서버 주소                        | `localhost`           |
| `Port`              | ClickHouse 서버 포트                         | `8123` 또는 `8443` ( `Protocol`에 따라 다름) |
| `Database`          | 초기 데이터베이스                           | `default`             |
| `Username`          | 인증 사용자 이름                           | `default`             |
| `Password`          | 인증 비밀번호                               | *(비어 있음)*         |
| `Protocol`          | 연결 프로토콜 (`http` 또는 `https`)       | `http`                |
| `Compression`       | Gzip 압축 사용                             | `true`                |
| `UseSession`        | 지속적인 서버 세션 사용                    | `false`               |
| `SessionId`         | 사용자 정의 세션 ID                        | 무작위 GUID           |
| `Timeout`           | HTTP 타임아웃 (초)                         | `120`                 |
| `UseServerTimezone` | 날짜/시간 컬럼에 서버 표준시 사용        | `true`                |
| `UseCustomDecimals` | 소수에 `ClickHouseDecimal` 사용            | `false`               |

**예:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note 세션

`UseSession` 플래그는 서버 세션을 지속 가능하게 하여 `SET` 문과 임시 테이블을 사용할 수 있도록 합니다. 세션은 60초의 비활동 후에 초기화됩니다 (기본 타임아웃). 세션 수명은 ClickHouse 문을 통해 세션 설정을 설정하여 연장할 수 있습니다.

`ClickHouseConnection` 클래스는 일반적으로 병렬 작업을 허용합니다 (여러 스레드가 쿼리를 동시에 실행할 수 있음). 그러나 `UseSession` 플래그가 활성화되면 연결당 한 개의 활성 쿼리로 제한됩니다 (서버 측 제한).

:::

---

### 연결 수명 및 풀링 {#connection-lifetime}

`ClickHouse.Driver`는 내부에서 `System.Net.Http.HttpClient`를 사용합니다. `HttpClient`는 엔드포인트별 연결 풀을 가지고 있습니다. 이러한 결과:

* `ClickHouseConnection` 객체는 TCP 연결과 1:1로 매핑되지 않습니다. 여러 데이터베이스 세션이 서버당 여러 개의 (기본적으로 2개) TCP 연결을 통해 멀티플렉스됩니다.
* `ClickHouseConnection` 객체가 폐기된 후에도 연결이 살아있을 수 있습니다.
* 이 동작은 맞춤형 `HttpClient`와 사용자 지정 `HttpClientHandler`를 전달하여 조정할 수 있습니다.

DI 환경에서는 `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`라는 맞춤형 생성자가 있어 HTTP 클라이언트 설정을 일반화할 수 있습니다.

**권장 사항:**

* `ClickHouseConnection`은 서버와의 "세션"을 나타냅니다. 서버 버전을 쿼리함으로써 기능을 검색하므로 개체를 열 때 약간의 오버헤드가 있지만, 일반적으로 이러한 객체를 여러 번 생성하고 파괴하는 것이 안전합니다.
* 연결의 권장 수명은 여러 쿼리로 걸친 대규모 "트랜잭션" 당 하나의 연결 객체입니다. 연결 시작 시 약간의 오버헤드가 있으므로 각 쿼리에 대해 연결 객체를 생성하는 것은 권장되지 않습니다.
* 애플리케이션이 대량의 트랜잭션을 처리하고 `ClickHouseConnection` 객체를 자주 생성/파괴해야 하는 경우, `IHttpClientFactory` 또는 static 인스턴스의 `HttpClient`를 사용하여 연결을 관리하는 것이 좋습니다.

---

### 테이블 생성 {#creating-a-table}

표준 SQL 구문을 사용하여 테이블을 생성합니다:

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

### 데이터 삽입 {#inserting-data}

매개변수화된 쿼리를 사용하여 데이터를 삽입합니다:

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

### 대량 삽입 {#bulk-insert}

`ClickHouseBulkCopy`를 사용하려면 다음이 필요합니다:

* 대상 연결 (`ClickHouseConnection` 인스턴스)
* 대상 테이블 이름 (`DestinationTableName` 속성)
* 데이터 소스 (`IDataReader` 또는 `IEnumerable<object[]>`)
  
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
* 최적의 성능을 위해 ClickHouseBulkCopy는 TPL (Task Parallel Library)을 사용하여 데이터 배치를 처리하며, 최대 4개의 병렬 삽입 작업을 수행합니다 (이것은 조정 가능).
* 소스 데이터의 컬럼 수가 대상 테이블보다 적은 경우 `ColumnNames` 속성을 통해 컬럼 이름을 선택적으로 제공할 수 있습니다.
* 구성 가능한 매개변수: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`.
* 복사하기 전에 `SELECT * FROM <table> LIMIT 0` 쿼리를 수행하여 대상 테이블 구조에 대한 정보를 가져옵니다. 제공된 객체의 유형은 대상 테이블과 합리적으로 일치해야 합니다.
* 세션은 병렬 삽입과 호환되지 않습니다. `ClickHouseBulkCopy`에 전달된 연결은 세션이 비활성화되어 있어야 하거나 `MaxDegreeOfParallelism`이 `1`로 설정되어야 합니다.
:::

---

### SELECT 쿼리 실행 {#performing-select-queries}

SELECT 쿼리를 실행하고 결과를 처리합니다:

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

---

### 원시 스트리밍 {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

### 중첩 컬럼 지원 {#nested-columns}

ClickHouse 중첩 유형 (`Nested(...)`)은 배열 의미론을 사용하여 읽고 쓸 수 있습니다.

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

### AggregateFunction 컬럼 {#aggregatefunction-columns}

`AggregateFunction(...)` 유형의 컬럼은 직접 쿼리하거나 삽입할 수 없습니다.

삽입하려면:

```sql
INSERT INTO t VALUES (uniqState(1));
```

선택하려면:

```sql
SELECT uniqMerge(c) FROM t;
```

---

### SQL 매개변수 {#sql-parameters}

쿼리에서 매개변수를 전달하려면 ClickHouse 매개변수 형식을 사용해야 하며, 다음 형식으로 전달됩니다:

```sql
{<name>:<data type>}
```

**예시:**

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
* SQL 'bind' 매개변수는 HTTP URI 쿼리 매개변수로 전달되므로, 너무 많은 매개변수를 사용하면 "URL too long" 예외가 발생할 수 있습니다.
* 대량의 레코드를 삽입하려면 대량 삽입 기능을 사용하는 것이 좋습니다.
:::

---

## 지원되는 데이터 유형 {#supported-data-types}

`ClickHouse.Driver`는 다음 ClickHouse 데이터 유형과 해당 .NET 유형 매핑을 지원합니다:

### 불리언 유형 {#boolean-types}

* `Bool` → `bool`

### 숫자 유형 {#numeric-types}

**부호 있는 정수:**
* `Int8` → `sbyte`
* `Int16` → `short`
* `Int32` → `int`
* `Int64` → `long`
* `Int128` → `BigInteger`
* `Int256` → `BigInteger`

**부호 없는 정수:**
* `UInt8` → `byte`
* `UInt16` → `ushort`
* `UInt32` → `uint`
* `UInt64` → `ulong`
* `UInt128` → `BigInteger`
* `UInt256` → `BigInteger`

**부동 소수점:**
* `Float32` → `float`
* `Float64` → `double`

**소수:**
* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### 문자열 유형 {#string-types}

* `String` → `string`
* `FixedString` → `string`

### 날짜 및 시간 유형 {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### 네트워크 유형 {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### 지리적 유형 {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Array of Points`
* `Polygon` → `Array of Rings`

### 복잡한 유형 {#complex-types}

* `Array(T)` → `Array of any type`
* `Tuple(T1, T2, ...)` → `Tuple of any types`
* `Nullable(T)` → `Nullable version of any type`
* `Map(K, V)` → `Dictionary<K, V>`

---

### DateTime 처리 {#datetime-handling}

`ClickHouse.Driver`는 시간대 및 `DateTime.Kind` 속성을 올바르게 처리하려고 합니다. 특별히:

* `DateTime` 값은 UTC로 반환됩니다. 사용자는 이를 스스로 변환할 수 있거나 `DateTime` 인스턴스의 `ToLocalTime()` 메서드를 사용할 수 있습니다.
* 삽입 시 `DateTime` 값은 다음과 같이 처리됩니다:
  * `UTC` `DateTime`은 '그대로' 삽입됩니다. ClickHouse는 이를 내부적으로 UTC로 저장합니다.
  * `Local` `DateTime`은 사용자의 지역 시간대 설정에 따라 UTC로 변환됩니다.
  * `Unspecified` `DateTime`은 대상 컬럼의 시간대에 있는 것으로 간주되므로 해당 시간대에 따라 UTC로 변환됩니다.
* 시간대가 지정되지 않은 컬럼에 대해서는 클라이언트 시간대가 기본적으로 사용됩니다 (레거시 동작). 연결 문자열의 `UseServerTimezone` 플래그를 사용하여 서버 시간대를 사용할 수 있습니다.

---

### 환경 변수 {#environment-variables}

환경 변수를 사용하여 기본값을 설정할 수 있습니다:

| 변수                 | 목적               |
| --------------------- | ------------------ |
| `CLICKHOUSE_DB`       | 기본 데이터베이스  |
| `CLICKHOUSE_USER`     | 기본 사용자 이름   |
| `CLICKHOUSE_PASSWORD` | 기본 비밀번호       |

:::note
`ClickHouseConnection` 생성자에 명시적으로 제공된 값이 환경 변수보다 우선합니다.
:::

---

### ORM 및 Dapper 지원 {#orm-support}

`ClickHouse.Driver`는 Dapper를 지원합니다 (제한 사항 있음).

**작동 예시:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
```

**지원되지 않는 항목:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```
