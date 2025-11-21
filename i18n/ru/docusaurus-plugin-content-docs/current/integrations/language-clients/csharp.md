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



# Клиент ClickHouse для C\#

Официальный клиент C\# для подключения к ClickHouse.
Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-cs).
Изначально разработан [Oleg V. Kozlyuk](https://github.com/DarkWanderer).



## Руководство по миграции {#migration-guide}

1. Обновите файл `.csproj`, указав новое имя пакета `ClickHouse.Driver` и [последнюю версию на NuGet](https://www.nuget.org/packages/ClickHouse.Driver).
2. Обновите все ссылки с `ClickHouse.Client` на `ClickHouse.Driver` в вашей кодовой базе.

---


## Поддерживаемые версии .NET {#supported-net-versions}

`ClickHouse.Driver` поддерживает следующие версии .NET:

- .NET Framework 4.6.2
- .NET Framework 4.8
- .NET Standard 2.1
- .NET 6.0
- .NET 8.0
- .NET 9.0
- .NET 10.0

---


## Установка {#installation}

Установите пакет из NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Или с помощью диспетчера пакетов NuGet:

```bash
Install-Package ClickHouse.Driver
```

---


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

---


## Использование {#usage}

### Параметры строки подключения {#connection-string}

| Параметр            | Описание                                 | По умолчанию                               |
| ------------------- | ---------------------------------------- | ------------------------------------------ |
| `Host`              | Адрес сервера ClickHouse                 | `localhost`                                |
| `Port`              | Порт сервера ClickHouse                  | `8123` или `8443` (в зависимости от `Protocol`) |
| `Database`          | Начальная база данных                    | `default`                                  |
| `Username`          | Имя пользователя для аутентификации      | `default`                                  |
| `Password`          | Пароль для аутентификации                | _(пусто)_                                  |
| `Protocol`          | Протокол подключения (`http` или `https`)| `http`                                     |
| `Compression`       | Включает сжатие Gzip                     | `true`                                     |
| `UseSession`        | Включает постоянную серверную сессию     | `false`                                    |
| `SessionId`         | Пользовательский идентификатор сессии    | Случайный GUID                             |
| `Timeout`           | Таймаут HTTP (в секундах)                | `120`                                      |
| `UseServerTimezone` | Использовать часовой пояс сервера для столбцов datetime | `true`                      |
| `UseCustomDecimals` | Использовать `ClickHouseDecimal` для десятичных чисел     | `false`                    |

**Пример:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Сессии

Флаг `UseSession` включает сохранение серверной сессии, позволяя использовать операторы `SET` и временные таблицы. Сессия будет сброшена после 60 секунд неактивности (таймаут по умолчанию). Время жизни сессии можно продлить, установив параметры сессии через операторы ClickHouse.

Класс `ClickHouseConnection` обычно позволяет параллельную работу (несколько потоков могут выполнять запросы одновременно). Однако включение флага `UseSession` ограничит это одним активным запросом на соединение в любой момент времени (ограничение на стороне сервера).

:::

---

### Время жизни соединения и пулинг {#connection-lifetime}

`ClickHouse.Driver` использует `System.Net.Http.HttpClient` внутри. `HttpClient` имеет пул соединений для каждой конечной точки. Как следствие:

- Объект `ClickHouseConnection` не имеет соответствия 1:1 с TCP-соединениями — несколько сессий базы данных будут мультиплексироваться через несколько (2 по умолчанию) TCP-соединений на сервер.
- Соединения могут оставаться активными после удаления объекта `ClickHouseConnection`.
- Это поведение можно настроить, передав специальный `HttpClient` с пользовательским `HttpClientHandler`.

Для сред с внедрением зависимостей существует специальный конструктор `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`, который позволяет обобщить настройки HTTP-клиента.

**Рекомендации:**

- `ClickHouseConnection` представляет «сессию» с сервером. Он выполняет обнаружение возможностей путем запроса версии сервера (поэтому при открытии возникают небольшие накладные расходы), но в целом безопасно создавать и уничтожать такие объекты несколько раз.
- Рекомендуемое время жизни соединения — один объект соединения на крупную «транзакцию», охватывающую несколько запросов. При запуске соединения возникают небольшие накладные расходы, поэтому не рекомендуется создавать объект соединения для каждого запроса.
- Если приложение работает с большими объемами транзакций и требует частого создания/уничтожения объектов `ClickHouseConnection`, рекомендуется использовать `IHttpClientFactory` или статический экземпляр `HttpClient` для управления соединениями.

---

### Создание таблицы {#creating-a-table}

Создайте таблицу, используя стандартный синтаксис SQL:

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

### Вставка данных {#inserting-data}

Вставьте данные, используя параметризованные запросы:

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

### Массовая вставка {#bulk-insert}

Использование `ClickHouseBulkCopy` требует:

- Целевое соединение (экземпляр `ClickHouseConnection`)
- Имя целевой таблицы (свойство `DestinationTableName`)
- Источник данных (`IDataReader` или `IEnumerable<object[]>`)

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

await bulkCopy.InitAsync(); // Подготавливает экземпляр ClickHouseBulkCopy путем загрузки типов целевых столбцов

var values = Enumerable.Range(0, 1000000)
.Select(i => new object[] { (long)i, "value" + i });

await bulkCopy.WriteToServerAsync(values);
Console.WriteLine($"Rows written: {bulkCopy.RowsWritten}");

````

:::note
* Для оптимальной производительности ClickHouseBulkCopy использует библиотеку параллельных задач (TPL) для обработки пакетов данных с возможностью выполнения до 4 параллельных задач вставки (это значение настраивается).
* Имена столбцов можно опционально указать через свойство `ColumnNames`, если исходные данные содержат меньше столбцов, чем целевая таблица.
* Настраиваемые параметры: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`.
* Перед копированием выполняется запрос `SELECT * FROM <table> LIMIT 0` для получения информации о структуре целевой таблицы. Типы передаваемых объектов должны соответствовать целевой таблице.
* Сессии несовместимы с параллельной вставкой. Соединение, передаваемое в `ClickHouseBulkCopy`, должно иметь отключенные сессии, либо `MaxDegreeOfParallelism` должен быть установлен в `1`.
:::

---

### Выполнение SELECT-запросов {#performing-select-queries}

Выполнение SELECT-запросов и обработка результатов:

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

### Потоковая передача в исходном формате {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

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

---

### Столбцы AggregateFunction {#aggregatefunction-columns}

Столбцы типа `AggregateFunction(...)` нельзя запрашивать или вставлять напрямую.

Для вставки:

```sql
INSERT INTO t VALUES (uniqState(1));
```

Для выборки:

```sql
SELECT uniqMerge(c) FROM t;
```

---

### SQL-параметры {#sql-parameters}

Для передачи параметров в запросе необходимо использовать форматирование параметров ClickHouse в следующем виде:

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

- SQL-параметры привязки передаются как параметры HTTP URI-запроса, поэтому использование слишком большого их количества может привести к исключению «URL too long».
- Для вставки большого объема записей рекомендуется использовать функциональность массовой вставки.
  :::

---


## Поддерживаемые типы данных {#supported-data-types}

`ClickHouse.Driver` поддерживает следующие типы данных ClickHouse с соответствующими сопоставлениями типов .NET:

### Логические типы {#boolean-types}

- `Bool` → `bool`

### Числовые типы {#numeric-types}

**Знаковые целые числа:**

- `Int8` → `sbyte`
- `Int16` → `short`
- `Int32` → `int`
- `Int64` → `long`
- `Int128` → `BigInteger`
- `Int256` → `BigInteger`

**Беззнаковые целые числа:**

- `UInt8` → `byte`
- `UInt16` → `ushort`
- `UInt32` → `uint`
- `UInt64` → `ulong`
- `UInt128` → `BigInteger`
- `UInt256` → `BigInteger`

**Числа с плавающей точкой:**

- `Float32` → `float`
- `Float64` → `double`

**Десятичные числа:**

- `Decimal` → `decimal`
- `Decimal32` → `decimal`
- `Decimal64` → `decimal`
- `Decimal128` → `decimal`
- `Decimal256` → `BigDecimal`

### Строковые типы {#string-types}

- `String` → `string`
- `FixedString` → `string`

### Типы даты и времени {#date-time-types}

- `Date` → `DateTime`
- `Date32` → `DateTime`
- `DateTime` → `DateTime`
- `DateTime32` → `DateTime`
- `DateTime64` → `DateTime`

### Сетевые типы {#network-types}

- `IPv4` → `IPAddress`
- `IPv6` → `IPAddress`

### Географические типы {#geographic-types}

- `Point` → `Tuple`
- `Ring` → `Массив точек`
- `Polygon` → `Массив колец`

### Сложные типы {#complex-types}

- `Array(T)` → `Массив любого типа`
- `Tuple(T1, T2, ...)` → `Кортеж любых типов`
- `Nullable(T)` → `Nullable-версия любого типа`
- `Map(K, V)` → `Dictionary<K, V>`

---

### Обработка DateTime {#datetime-handling}

`ClickHouse.Driver` корректно обрабатывает часовые пояса и свойство `DateTime.Kind`. В частности:

- Значения `DateTime` возвращаются в формате UTC. Пользователь может затем преобразовать их самостоятельно или использовать метод `ToLocalTime()` для экземпляра `DateTime`.
- При вставке значения `DateTime` обрабатываются следующим образом:
  - `UTC` `DateTime` вставляются «как есть», поскольку ClickHouse хранит их внутренне в формате UTC.
  - `Local` `DateTime` преобразуются в UTC в соответствии с настройками локального часового пояса пользователя.
  - `Unspecified` `DateTime` считаются находящимися в часовом поясе целевого столбца и, следовательно, преобразуются в UTC в соответствии с этим часовым поясом.
- Для столбцов без указанного часового пояса по умолчанию используется часовой пояс клиента (устаревшее поведение). Флаг `UseServerTimezone` в строке подключения может использоваться для применения часового пояса сервера.

---


## Логирование и диагностика {#logging-and-diagnostics}

Клиент ClickHouse .NET интегрируется с абстракциями `Microsoft.Extensions.Logging` для обеспечения легковесного логирования по запросу. При включении драйвер выдаёт структурированные сообщения о событиях жизненного цикла соединения, выполнении команд, транспортных операциях и массовой загрузке данных. Логирование полностью опционально — приложения, не настроившие логгер, продолжают работать без дополнительных накладных расходов.

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

Вы можете настроить уровни логирования с помощью стандартной конфигурации .NET:

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

#### Использование конфигурации в памяти {#logging-inmemory-config}

Вы также можете настроить детализацию логирования по категориям в коде:

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

Драйвер использует выделенные категории, чтобы вы могли точно настроить уровни логирования для каждого компонента:

| Категория                      | Источник               | Основные события                                                                                                      |
| ------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | Жизненный цикл соединения, выбор фабрики HTTP-клиента, открытие/закрытие соединения, управление сессиями.            |
| `ClickHouse.Driver.Command`    | `ClickHouseCommand`    | Начало/завершение выполнения запроса, время выполнения, идентификаторы запросов, статистика сервера, детали ошибок.  |
| `ClickHouse.Driver.Transport`  | `ClickHouseConnection` | Низкоуровневые HTTP-запросы потоковой передачи, флаги сжатия, коды статуса ответа, сбои транспорта.                  |
| `ClickHouse.Driver.BulkCopy`   | `ClickHouseBulkCopy`   | Загрузка метаданных, пакетные операции, количество строк, завершение загрузки.                                        |

#### Пример: диагностика проблем с соединением {#logging-config-example}

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

Это будет логировать:

- Выбор фабрики HTTP-клиента (пул по умолчанию или одиночное соединение)
- Конфигурацию HTTP-обработчика (SocketsHttpHandler или HttpClientHandler)
- Настройки пула соединений (MaxConnectionsPerServer, PooledConnectionLifetime и т. д.)
- Настройки таймаутов (ConnectTimeout, Expect100ContinueTimeout и т. д.)
- Конфигурацию SSL/TLS
- События открытия/закрытия соединения
- Отслеживание идентификатора сессии

### Режим отладки: трассировка сети и диагностика {#logging-debugmode}

Для помощи в диагностике сетевых проблем библиотека драйвера включает вспомогательный инструмент, который активирует низкоуровневую трассировку внутренних механизмов сети .NET. Чтобы включить его, необходимо передать LoggerFactory с уровнем, установленным в Trace, и установить EnableDebugMode в true (или включить вручную через класс `ClickHouse.Driver.Diagnostic.TraceHelper`). Предупреждение: это создаст чрезвычайно подробные логи и повлияет на производительность. Не рекомендуется включать режим отладки в production-среде.

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // Must be Trace level to see network events
});

```


var settings = new ClickHouseClientSettings()
{
LoggerFactory = loggerFactory,
EnableDebugMode = true, // Включить трассировку сетевого взаимодействия низкого уровня
};

````

---

### Поддержка ORM и Dapper {#orm-support}

`ClickHouse.Driver` поддерживает Dapper (с ограничениями).

**Рабочий пример:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
````

**Не поддерживается:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```
