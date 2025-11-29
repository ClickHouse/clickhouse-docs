---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'Официальный клиент C# для подключения к ClickHouse.'
title: 'C#-драйвер ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---

# Клиент ClickHouse для C# {#clickhouse-c-client}

Официальный клиент C# для подключения к ClickHouse.
Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-cs).
Изначально разработан [Oleg V. Kozlyuk](https://github.com/DarkWanderer).

## Руководство по миграции {#migration-guide}

1. Обновите файл `.csproj`, указав новое имя пакета `ClickHouse.Driver` и [последнюю версию на NuGet](https://www.nuget.org/packages/ClickHouse.Driver).
2. Замените все вхождения `ClickHouse.Client` на `ClickHouse.Driver` в вашей кодовой базе.

---

## Поддерживаемые версии .NET {#supported-net-versions}

`ClickHouse.Driver` поддерживает следующие версии .NET:

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

---

## Установка {#installation}

Установите пакет из NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Или с помощью менеджера пакетов NuGet:

```bash
Install-Package ClickHouse.Driver
```

***


## Быстрый старт {#quick-start}

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

Использование **Dapper**:

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


## Использование {#usage}

### Параметры строки подключения {#connection-string}

| Параметр           | Описание                                         | Значение по умолчанию |
| ------------------ | ----------------------------------------------- | ---------------------- |
| `Host`             | Адрес сервера ClickHouse                        | `localhost`            |
| `Port`             | Порт сервера ClickHouse                         | `8123` или `8443` (в зависимости от `Protocol`) |
| `Database`         | Начальная база данных                           | `default`              |
| `Username`         | Имя пользователя для аутентификации             | `default`              |
| `Password`         | Пароль для аутентификации                       | *(пусто)*              |
| `Protocol`         | Протокол подключения (`http` или `https`)       | `http`                 |
| `Compression`      | Включает сжатие Gzip                            | `true`                 |
| `UseSession`       | Включает постоянную серверную сессию            | `false`                |
| `SessionId`        | Пользовательский идентификатор сессии           | Случайный GUID         |
| `Timeout`          | HTTP‑тайм-аут (в секундах)                      | `120`                  |
| `UseServerTimezone` | Использовать часовой пояс сервера для столбцов datetime | `true`         |
| `UseCustomDecimals` | Использовать `ClickHouseDecimal` для десятичных чисел | `false`        |

**Пример:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Sessions

Флаг `UseSession` включает сохранение серверной сессии, что позволяет использовать операторы `SET` и временные таблицы. Сессия будет сброшена после 60 секунд бездействия (тайм-аут по умолчанию). Время жизни сессии можно увеличить, задав параметры сессии с помощью операторов ClickHouse.

Класс `ClickHouseConnection` обычно поддерживает параллельную работу (несколько потоков могут выполнять запросы одновременно). Однако включение флага `UseSession` ограничит выполнение одним активным запросом на соединение в любой момент времени (ограничение на стороне сервера).

:::

---

### Время жизни соединения и пул подключений {#connection-lifetime}

`ClickHouse.Driver` внутренне использует `System.Net.Http.HttpClient`. `HttpClient` имеет пул подключений для каждой конечной точки (endpoint). В результате:

* Объект `ClickHouseConnection` не имеет отображения 1:1 на TCP‑соединения — несколько сеансов работы с базой данных будут мультиплексироваться поверх нескольких (2 по умолчанию) TCP‑соединений на один сервер.
* Соединения могут оставаться активными после удаления объекта `ClickHouseConnection`.
* Это поведение можно настроить, передав собственный `HttpClient` с пользовательским `HttpClientHandler`.

Для DI‑окружений предусмотрен специальный конструктор `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`, который позволяет централизованно настраивать HTTP‑клиент.

**Рекомендации:**

* `ClickHouseConnection` представляет собой «сеанс» с сервером. Он выполняет обнаружение возможностей, запрашивая версию сервера (что вносит небольшие накладные расходы при открытии), но в целом безопасно многократно создавать и уничтожать такие объекты.
* Рекомендуемый срок жизни соединения — один объект соединения на одну крупную «транзакцию», охватывающую несколько запросов. Поскольку при установке соединения есть небольшие накладные расходы, не рекомендуется создавать объект соединения для каждого запроса.
* Если приложение обрабатывает большие объёмы транзакций и ему необходимо часто создавать и уничтожать объекты `ClickHouseConnection`, рекомендуется использовать `IHttpClientFactory` или статический экземпляр `HttpClient` для управления соединениями.

---

### Создание таблицы {#creating-a-table}

Создайте таблицу с использованием стандартного синтаксиса SQL:

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


### Вставка данных {#inserting-data}

Вставляйте данные с использованием параметризованных запросов:

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


### Массовая вставка {#bulk-insert}

Для использования `ClickHouseBulkCopy` необходимы:

* Целевое подключение (экземпляр `ClickHouseConnection`)
* Имя целевой таблицы (свойство `DestinationTableName`)
* Источник данных (`IDataReader` или `IEnumerable<object[]>`)

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

await bulkCopy.InitAsync(); // Подготавливает экземпляр ClickHouseBulkCopy, загружая типы целевых столбцов

var values = Enumerable.Range(0, 1000000)
    .Select(i => new object[] { (long)i, "значение" + i });

await bulkCopy.WriteToServerAsync(values);
Console.WriteLine($"Записано строк: {bulkCopy.RowsWritten}");
```

:::note

* Для оптимальной производительности ClickHouseBulkCopy использует Task Parallel Library (TPL) для обработки пакетов данных с использованием до 4 параллельных задач вставки (это можно настроить).
* Имена столбцов при необходимости могут быть переданы через свойство `ColumnNames`, если в исходных данных столбцов меньше, чем в целевой таблице.
* Настраиваемые параметры: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`.
* Перед копированием выполняется запрос `SELECT * FROM <table> LIMIT 0` для получения информации о структуре целевой таблицы. Типы передаваемых объектов должны разумно соответствовать типам столбцов целевой таблицы.
* Сессии несовместимы с параллельной вставкой. Подключение, передаваемое в `ClickHouseBulkCopy`, должно быть без сессий, либо параметр `MaxDegreeOfParallelism` должен быть установлен в значение `1`.
  :::

***


### Выполнение запросов SELECT {#performing-select-queries}

Выполните запросы SELECT и обработайте результаты:

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
            Console.WriteLine($"выборка: Id: {reader.GetInt64(0)}, Имя: {reader.GetString(1)}");
        }
    }
}
```

***


### Необработанный стриминг {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

***


### Поддержка вложенных столбцов {#nested-columns}

Вложенные типы ClickHouse (`Nested(...)`) можно читать и записывать с использованием семантики массивов.

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


### Столбцы типа AggregateFunction {#aggregatefunction-columns}

Столбцы типа `AggregateFunction(...)` нельзя напрямую использовать в запросах или при вставке данных.

Для вставки:

```sql
INSERT INTO t VALUES (uniqState(1));
```

Чтобы выбрать:

```sql
SELECT uniqMerge(c) FROM t;
```

***


### Параметры SQL {#sql-parameters}

При передаче параметров в запрос следует использовать форматирование параметров ClickHouse в следующем формате:

```sql
{<name>:<data type>}
```

**Примеры:**

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

* Параметры привязки SQL (bind) передаются как параметры HTTP URI-запроса, поэтому при их чрезмерном количестве может возникнуть исключение «URL too long».
* Для вставки большого объёма записей рассмотрите использование механизма пакетной вставки (Bulk Insert).
  :::

***


## Поддерживаемые типы данных {#supported-data-types}

`ClickHouse.Driver` поддерживает следующие типы данных ClickHouse с их соответствующими сопоставлениями с типами .NET:

### Логические типы {#boolean-types}

* `Bool` → `bool`

### Числовые типы {#numeric-types}

**Знаковые целые типы:**

* `Int8` → `sbyte`
* `Int16` → `short`
* `Int32` → `int`
* `Int64` → `long`
* `Int128` → `BigInteger`
* `Int256` → `BigInteger`

**Беззнаковые целые типы:**

* `UInt8` → `byte`
* `UInt16` → `ushort`
* `UInt32` → `uint`
* `UInt64` → `ulong`
* `UInt128` → `BigInteger`
* `UInt256` → `BigInteger`

**Типы с плавающей запятой:**

* `Float32` → `float`
* `Float64` → `double`

**Десятичные типы:**

* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### Строковые типы {#string-types}

* `String` → `string`
* `FixedString` → `string`

### Типы данных даты и времени {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### Типы сетей {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### Географические типы {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Array of Points`
* `Polygon` → `Array of Rings`

### Составные типы данных {#complex-types}

* `Array(T)` → `Массив любого типа`
* `Tuple(T1, T2, ...)` → `Кортеж любых типов`
* `Nullable(T)` → `Nullable-тип на основе любого типа`
* `Map(K, V)` → `Словарь<K, V>`

---

### Обработка DateTime {#datetime-handling}

`ClickHouse.Driver` корректно обрабатывает часовые пояса и свойство `DateTime.Kind`. В частности:

* Значения `DateTime` возвращаются в UTC. Пользователь затем может преобразовать их самостоятельно или использовать метод `ToLocalTime()` для экземпляра `DateTime`.
* При вставке данные типа `DateTime` обрабатываются следующим образом:
  * `UTC` `DateTime` вставляются «как есть», поскольку ClickHouse хранит их в UTC.
  * `Local` `DateTime` преобразуются в UTC в соответствии с локальными настройками часового пояса пользователя.
  * `Unspecified` `DateTime` считаются находящимися в часовом поясе целевого столбца и, следовательно, преобразуются в UTC в соответствии с этим часовым поясом.
* Для столбцов без указанного часового пояса по умолчанию используется часовой пояс клиента (устаревшее поведение). Вместо этого можно использовать флаг `UseServerTimezone` в строке подключения, чтобы применять часовой пояс сервера.

---

## Журналирование и диагностика {#logging-and-diagnostics}

Клиент ClickHouse для .NET интегрируется с абстракциями логирования `Microsoft.Extensions.Logging`, предоставляя легковесное журналирование, подключаемое по желанию. При его включении драйвер генерирует структурированные сообщения о событиях жизненного цикла подключения, выполнении команд, транспортных операциях и массовой загрузке данных. Журналирование полностью необязательно — приложения, которые не настраивают логгер, продолжают работать без дополнительных накладных расходов.

### Быстрый старт {#logging-quick-start}

#### Использование ClickHouseConnection {#logging-clickhouseconnection}

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


#### Использование appsettings.json {#logging-appsettings-config}

Вы можете настроить уровни логирования с помощью стандартной системы конфигурации .NET:

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


#### Использование конфигурации в оперативной памяти {#logging-inmemory-config}

Вы также можете настроить детализацию логирования по категориям прямо в коде:

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


### Категории и источники {#logging-categories}

Драйвер использует отдельные категории, чтобы вы могли точно настраивать уровни логирования для каждого компонента:

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | Жизненный цикл соединения, выбор фабрики HTTP‑клиента, открытие/закрытие соединения, управление сессиями. |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | Начало и завершение выполнения запроса, замер времени, идентификаторы запросов, статистика сервера и сведения об ошибках. |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | Низкоуровневые потоковые HTTP‑запросы, флаги сжатия, коды статуса ответа и сбои транспортного уровня. |
| `ClickHouse.Driver.BulkCopy` | `ClickHouseBulkCopy` | Загрузка метаданных, пакетные операции, количество строк и завершение отправки. |

#### Пример: диагностика неполадок подключения {#logging-config-example}

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

В журнал будет записано:

* выбор фабрики HTTP-клиента (пул по умолчанию по сравнению с одиночным подключением)
* конфигурация HTTP-обработчика (SocketsHttpHandler или HttpClientHandler)
* настройки пула подключений (MaxConnectionsPerServer, PooledConnectionLifetime и т. д.)
* параметры тайм-аутов (ConnectTimeout, Expect100ContinueTimeout и т. д.)
* конфигурация SSL/TLS
* события открытия и закрытия подключений
* отслеживание идентификаторов сессий


### Режим отладки: трассировка сети и диагностика {#logging-debugmode}

Чтобы упростить диагностику сетевых проблем, библиотека драйвера предоставляет вспомогательный инструмент, позволяющий включить низкоуровневую трассировку внутренних сетевых механизмов .NET. Чтобы включить её, необходимо передать `LoggerFactory` с уровнем `Trace` и установить `EnableDebugMode` в значение `true` (или включить её вручную через класс `ClickHouse.Driver.Diagnostic.TraceHelper`). Предупреждение: это приведёт к генерации чрезвычайно подробных логов и повлияет на производительность. Не рекомендуется включать режим отладки в боевой (production) среде.

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // Необходим уровень Trace для просмотра сетевых событий
});

var settings = new ClickHouseClientSettings()
{
    LoggerFactory = loggerFactory,
    EnableDebugMode = true,  // Включить низкоуровневую трассировку сетевых событий
};
```

***


### Поддержка ORM и Dapper {#orm-support}

`ClickHouse.Driver` поддерживает Dapper (с некоторыми ограничениями).

**Рабочий пример:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
```

**Не поддерживается:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```
