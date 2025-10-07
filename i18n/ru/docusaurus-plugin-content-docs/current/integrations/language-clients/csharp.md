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
'description': 'Официальный C# клиент для подключения к ClickHouse.'
'title': 'ClickHouse C# Драйвер'
'doc_type': 'guide'
---


# Клиент ClickHouse для C#

Официальный C# клиент для подключения к ClickHouse. 
Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-cs).
Изначально разработан [Олегом В. Козлюком](https://github.com/DarkWanderer).

## Руководство по миграции {#migration-guide}
1. Обновите `.csproj` с именем `ClickHouse.Driver` и [последней версией пакета](https://www.nuget.org/packages/ClickHouse.Driver).
2. Обновите ваш код, чтобы использовать новое пространство имен и классы `ClickHouse.Driver`.

## Поддерживаемые версии .NET {#supported-net-versions}

`ClickHouse.Driver` поддерживает следующие версии .NET:
* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0

## Установка {#installation}

Установите пакет из NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Или с помощью Диспетчера пакетов NuGet:

```bash
Install-Package ClickHouse.Driver
```

## Использование {#usage}

### Создание подключения {#creating-a-connection}

Создайте соединение, используя строку подключения:

```csharp
using ClickHouse.Driver.ADO;

var connectionString = "Host=localhost;Protocol=http;Database=default;Username=default;Password=";

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
}
```

### Создание таблицы {#creating-a-table}

Создайте таблицу, используя стандартный SQL синтаксис:

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

### Вставка данных {#inserting-data}

Вставляйте данные, используя параметризованные запросы:

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

### Пакетная вставка {#bulk-insert}

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

### Выполнение SELECT запросов {#performing-select-queries}

Выполняйте SELECT запросы и обрабатывайте результаты:

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
### Сырой поток {#raw-streaming}
```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

## Поддерживаемые типы данных {#supported-data-types}

`ClickHouse.Driver` поддерживает следующие типы данных ClickHouse:
**Булевый тип**
* `Bool` (bool)

**Числовые типы**:
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

**Строковые типы**
* `String` (string)
* `FixedString` (string)

**Типы даты и времени**
* `Date` (DateTime)
* `Date32` (DateTime)
* `DateTime` (DateTime)
* `DateTime32` (DateTime)
* `DateTime64` (DateTime)

**Сетевые типы**
* `IPv4` (IPAddress)
* `IPv6` (IPAddress)

**Гео типы**
* `Point` (Tuple)
* `Ring` (Array of Points)
* `Polygon` (Array of Rings)

**Сложные типы**
* `Array` (Array of any type)
* `Tuple` (Tuple of any types)
* `Nullable` (Nullable version of any type)

### Работа с DateTime {#datetime-handling}
`ClickHouse.Driver` пытается правильно обрабатывать часовые пояса и свойство `DateTime.Kind`. В частности:

Значения `DateTime` возвращаются в формате UTC. Пользователь может затем конвертировать их самостоятельно или использовать метод `ToLocalTime()` на экземпляре `DateTime`.
При вставке значения `DateTime` обрабатываются следующим образом:
- UTC `DateTime` вставляются как есть, потому что ClickHouse хранит их в UTC внутренне
- Локальные `DateTime` конвертируются в UTC в соответствии с настройками часового пояса пользователя
- Неуказанные `DateTime` считаются находящимися в часовом поясе целевой колонки, и следовательно, конвертируются в UTC в соответствии с этим часовым поясом
