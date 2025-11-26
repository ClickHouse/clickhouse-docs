---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'Официальный клиентский драйвер C# для подключения к ClickHouse.'
title: 'Клиентский драйвер C# для ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---



# Клиент ClickHouse для C#

Официальный клиент на C# для подключения к ClickHouse.
Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-cs).
Изначально разработан [Олегом В. Козлюком](https://github.com/DarkWanderer).



## Руководство по миграции {#migration-guide}

1. Обновите файл `.csproj`, указав новое имя пакета `ClickHouse.Driver` и [последнюю версию из NuGet](https://www.nuget.org/packages/ClickHouse.Driver).
2. Обновите все ссылки на `ClickHouse.Client` во всём проекте, заменив их на `ClickHouse.Driver`.

---



## Поддерживаемые версии .NET {#supported-net-versions}

`ClickHouse.Driver` поддерживает следующие версии платформы .NET:

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

---



## Установка

Установите пакет из NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Или с помощью менеджера пакетов NuGet:

```bash
Install-Package ClickHouse.Driver
```

***


## Быстрый старт

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


## Использование

### Параметры строки подключения

| Parameter           | Description                                             | Default                                         |
| ------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `Host`              | Адрес сервера ClickHouse                                | `localhost`                                     |
| `Port`              | Порт сервера ClickHouse                                 | `8123` или `8443` (в зависимости от `Protocol`) |
| `Database`          | Начальная база данных                                   | `default`                                       |
| `Username`          | Имя пользователя для аутентификации                     | `default`                                       |
| `Password`          | Пароль для аутентификации                               | *(пусто)*                                       |
| `Protocol`          | Протокол подключения (`http` или `https`)               | `http`                                          |
| `Compression`       | Включает сжатие Gzip                                    | `true`                                          |
| `UseSession`        | Включает постоянную серверную сессию                    | `false`                                         |
| `SessionId`         | Пользовательский идентификатор сессии                   | Случайный GUID                                  |
| `Timeout`           | HTTP‑тайм‑аут (в секундах)                              | `120`                                           |
| `UseServerTimezone` | Использовать часовой пояс сервера для столбцов datetime | `true`                                          |
| `UseCustomDecimals` | Использовать `ClickHouseDecimal` для десятичных чисел   | `false`                                         |

**Пример:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Sessions

Флаг `UseSession` включает сохранение серверной сессии, что позволяет использовать операторы `SET` и временные таблицы. Сессия будет сброшена после 60 секунд неактивности (тайм‑аут по умолчанию). Время жизни сессии можно увеличить, задав настройки сессии через операторы ClickHouse.

Класс `ClickHouseConnection` обычно поддерживает параллельную работу (несколько потоков могут выполнять запросы одновременно). Однако включение флага `UseSession` ограничит это одним активным запросом на подключение в каждый момент времени (ограничение на стороне сервера).

:::

***

### Время жизни подключения и пул подключений

`ClickHouse.Driver` использует под капотом `System.Net.Http.HttpClient`. `HttpClient` имеет пул подключений на каждую конечную точку. В результате:

* Объект `ClickHouseConnection` не имеет соответствия 1:1 с TCP‑подключениями — несколько сессий базы данных будут мультиплексироваться через несколько (2 по умолчанию) TCP‑подключений к серверу.
* Подключения могут оставаться активными после того, как объект `ClickHouseConnection` был уничтожен (`disposed`).
* Такое поведение можно настроить, передав специализированный `HttpClient` с пользовательским `HttpClientHandler`.

Для DI‑окружений существует отдельный конструктор `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`, который позволяет унифицировать настройки HTTP‑клиента.

**Рекомендации:**

* `ClickHouseConnection` представляет собой «сессию» с сервером. Он выполняет обнаружение поддерживаемых возможностей, запрашивая версию сервера (поэтому при открытии есть небольшие накладные расходы), но в целом безопасно многократно создавать и уничтожать такие объекты.
* Рекомендуемый срок жизни подключения — один объект подключения на одну большую «транзакцию», охватывающую несколько запросов. Поскольку при запуске подключения есть небольшой оверхед, не рекомендуется создавать объект подключения для каждого запроса.
* Если приложение обрабатывает большие объёмы транзакций и ему часто нужно создавать/уничтожать объекты `ClickHouseConnection`, рекомендуется использовать `IHttpClientFactory` или статический экземпляр `HttpClient` для управления подключениями.

***

### Создание таблицы

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

***

### Вставка данных

Вставляйте данные с помощью параметризованных запросов:

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

### Пакетная вставка

Для использования `ClickHouseBulkCopy` необходимо:

* Целевое подключение (экземпляр `ClickHouseConnection`)
* Имя целевой таблицы (свойство `DestinationTableName`)
* Источник данных (`IDataReader` или `IEnumerable<object[]>`)

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

`ClickHouse.Driver` поддерживает следующие типы данных ClickHouse с их соответствиями типам .NET:

### Логические типы {#boolean-types}

* `Bool` → `bool`

### Числовые типы {#numeric-types}

**Знаковые целые:**
* `Int8` → `sbyte`
* `Int16` → `short`
* `Int32` → `int`
* `Int64` → `long`
* `Int128` → `BigInteger`
* `Int256` → `BigInteger`

**Беззнаковые целые:**
* `UInt8` → `byte`
* `UInt16` → `ushort`
* `UInt32` → `uint`
* `UInt64` → `ulong`
* `UInt128` → `BigInteger`
* `UInt256` → `BigInteger`

**Числа с плавающей запятой:**
* `Float32` → `float`
* `Float64` → `double`

**Десятичные числа:**
* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### Строковые типы {#string-types}

* `String` → `string`
* `FixedString` → `string`

### Типы даты и времени {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### Сетевые типы {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### Географические типы {#geographic-types}

* `Point` → `Tuple`
* `Ring` → массив точек
* `Polygon` → массив колец

### Сложные типы {#complex-types}

* `Array(T)` → массив произвольного типа
* `Tuple(T1, T2, ...)` → кортеж произвольных типов
* `Nullable(T)` → вариант любого типа, допускающий значение `NULL`
* `Map(K, V)` → `Dictionary&lt;K, V&gt;`

---

### Обработка DateTime {#datetime-handling}

`ClickHouse.Driver` пытается корректно обрабатывать часовые пояса и свойство `DateTime.Kind`. В частности:

* Значения `DateTime` возвращаются в UTC. Пользователь затем может преобразовать их самостоятельно или использовать метод `ToLocalTime()` у экземпляра `DateTime`.
* При вставке значения `DateTime` обрабатываются следующим образом:
  * `UTC`-значения `DateTime` вставляются «как есть», потому что ClickHouse хранит их во внутреннем представлении в UTC.
  * `Local`-значения `DateTime` преобразуются в UTC в соответствии с локальными настройками часового пояса пользователя.
  * `Unspecified`-значения `DateTime` считаются находящимися в часовом поясе целевого столбца и, следовательно, преобразуются в UTC в соответствии с этим часовым поясом.
* Для столбцов без явно указанного часового пояса по умолчанию используется часовой пояс клиента (устаревшее поведение). Чтобы использовать часовой пояс сервера, вместо этого можно задать флаг `UseServerTimezone` в строке подключения.

---



## Журналирование и диагностика

Клиент ClickHouse для .NET интегрируется с абстракциями `Microsoft.Extensions.Logging`, предоставляя легковесное, включаемое по необходимости журналирование. При его включении драйвер генерирует структурированные сообщения для событий жизненного цикла соединений, выполнения команд, транспортных операций и массовых загрузок (bulk copy). Ведение журналов полностью опционально — приложения, которые не настраивают логгер, продолжают работать без дополнительных накладных расходов.

### Быстрый старт

#### Использование ClickHouseConnection

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

#### Использование appsettings.json

Можно настроить уровни логирования с помощью стандартной конфигурации .NET:

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

#### Использование конфигурации в оперативной памяти

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

### Категории и эмиттеры

Драйвер использует отдельные категории, чтобы вы могли тонко настраивать уровни логирования для каждого компонента:

| Категория                      | Источник               | Описание                                                                                                              |
| ------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | Жизненный цикл соединения, выбор фабрики HTTP‑клиента, открытие/закрытие соединений, управление сессиями.             |
| `ClickHouse.Driver.Command`    | `ClickHouseCommand`    | Начало и завершение выполнения запросов, замеры времени, идентификаторы запросов, статистика сервера и детали ошибок. |
| `ClickHouse.Driver.Transport`  | `ClickHouseConnection` | Низкоуровневые HTTP‑запросы с потоковой передачей, флаги сжатия, коды статуса ответов и сбои транспортного уровня.    |
| `ClickHouse.Driver.BulkCopy`   | `ClickHouseBulkCopy`   | Загрузка метаданных, пакетные операции, количество строк и завершение операций загрузки.                              |

#### Пример: диагностика проблем с подключением

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

Это приведёт к логированию:

* выбора фабрики HTTP-клиентов (пул по умолчанию или одиночное соединение)
* конфигурации HTTP-обработчика (SocketsHttpHandler или HttpClientHandler)
* параметров пула соединений (MaxConnectionsPerServer, PooledConnectionLifetime и т. д.)
* настроек таймаутов (ConnectTimeout, Expect100ContinueTimeout и т. д.)
* конфигурации SSL/TLS
* событий открытия/закрытия соединений
* отслеживания идентификаторов сеансов

### Режим отладки: трассировка сети и диагностика

Чтобы упростить диагностику сетевых проблем, библиотека драйвера включает вспомогательный компонент, который позволяет включить низкоуровневую трассировку внутренних сетевых механизмов .NET. Чтобы включить его, необходимо передать LoggerFactory с уровнем Trace и установить EnableDebugMode в true (или включить вручную через класс `ClickHouse.Driver.Diagnostic.TraceHelper`). Предупреждение: это приведёт к генерации чрезвычайно подробных логов и повлияет на производительность. Не рекомендуется включать режим отладки в продакшене.

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // Уровень логирования должен быть Trace, чтобы видеть сетевые события
});
```


var settings = new ClickHouseClientSettings()
{
LoggerFactory = loggerFactory,
EnableDebugMode = true, // Включить низкоуровневую трассировку сети
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
