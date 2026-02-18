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

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_csharp from '@site/static/images/_snippets/connection-details-csharp.png';


# Клиент ClickHouse для C# \{#clickhouse-c-client\}

Официальный клиент C# для подключения к ClickHouse.
Исходный код клиента доступен в [репозитории GitHub](https://github.com/ClickHouse/clickhouse-cs).
Изначально разработан [Oleg V. Kozlyuk](https://github.com/DarkWanderer).

Библиотека предоставляет два основных API:

- **`ClickHouseClient`** (рекомендуется): высокоуровневый, потокобезопасный клиент, предназначенный для использования в виде singleton. Предоставляет простой асинхронный API для выполнения запросов и пакетных вставок. Наиболее подходящий вариант для большинства приложений.

- **ADO.NET** (`ClickHouseDataSource`, `ClickHouseConnection`, `ClickHouseCommand`): стандартные абстракции базы данных в .NET. Необходимы для интеграции с ORM (Dapper, Linq2db) и в случаях, когда требуется совместимость с ADO.NET. `ClickHouseBulkCopy` — вспомогательный класс для эффективной вставки данных с использованием подключения ADO.NET. `ClickHouseBulkCopy` объявлен устаревшим и будет удалён в одном из будущих релизов; вместо него используйте `ClickHouseClient.InsertBinaryAsync`.

Оба API используют общий пул HTTP‑подключений и могут использоваться вместе в одном приложении.

## Руководство по миграции \{#migration-guide\}

1. Обновите файл `.csproj`, указав новое имя пакета `ClickHouse.Driver` и [последнюю версию на NuGet](https://www.nuget.org/packages/ClickHouse.Driver).
2. Замените все вхождения `ClickHouse.Client` на `ClickHouse.Driver` в вашей кодовой базе.

---

## Поддерживаемые версии .NET \{#supported-net-versions\}

`ClickHouse.Driver` поддерживает следующие версии .NET:

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

## Установка \{#installation\}

Установите пакет из NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Или с помощью менеджера пакетов NuGet:

```bash
Install-Package ClickHouse.Driver
```


## Быстрый старт \{#quick-start\}

```csharp
using ClickHouse.Driver;

// Create a client (typically as a singleton)
using var client = new ClickHouseClient("Host=my.clickhouse;Protocol=https;Port=8443;Username=user");

// Execute a query
var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine(version);
```


## Конфигурация \{#configuration\}

Существует два способа настройки подключения к ClickHouse:

* **Строка подключения:** Пары ключ/значение, разделённые точкой с запятой, которые задают хост, учётные данные для аутентификации и другие параметры подключения.
* Объект **`ClickHouseClientSettings`**: Строго типизированный объект конфигурации, который может быть загружен из файлов конфигурации или задан в коде.

Ниже приведён полный список всех параметров, их значений по умолчанию и того, как они влияют на подключение.

### Параметры подключения \{#connection-settings\}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|-----|-----------------------|-------------------------|----------|
| Host | `string` | `"localhost"` | `Host` | Имя хоста или IP-адрес сервера ClickHouse |
| Port | `ushort` | 8123 (HTTP) / 8443 (HTTPS) | `Port` | Номер порта; по умолчанию выбирается в зависимости от протокола |
| Username | `string` | `"default"` | `Username` | Имя пользователя для аутентификации |
| Password | `string` | `""` | `Password` | Пароль для аутентификации |
| Database | `string` | `""` | `Database` | База данных по умолчанию; если не задано, используется значение по умолчанию сервера/пользователя |
| Protocol | `string` | `"http"` | `Protocol` | Протокол подключения: `"http"` или `"https"` |
| Path | `string` | `null` | `Path` | Путь в URL для сценариев с обратным прокси (например, `/clickhouse`) |
| Timeout | `TimeSpan` | 2 минуты | `Timeout` | Таймаут операции (в строке подключения хранится в секундах) |

### Формат данных и сериализация \{#data-format-serialization\}

| Свойство | Тип | По умолчанию | Ключ строки подключения | Описание |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | Включить сжатие gzip при передаче данных |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | Использовать `ClickHouseDecimal` для произвольной точности; если `false`, используется .NET `decimal` (ограничение 128 бит) |
| ReadStringsAsByteArrays | `bool` | `false` | `ReadStringsAsByteArrays` | Читать столбцы `String` и `FixedString` как массивы байтов `byte[]` вместо строк `string`; полезно для двоичных данных |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | Отправлять параметры в виде form data вместо URL-строки запроса |
| JsonReadMode | `JsonReadMode` | `Binary` | `JsonReadMode` | Как возвращаются JSON-данные: `Binary` (возвращает `JsonObject`) или `String` (возвращает исходную строку JSON) |
| JsonWriteMode | `JsonWriteMode` | `String` | `JsonWriteMode` | Как отправляются JSON-данные: `String` (сериализует через `JsonSerializer`, принимает любые входные данные) или `Binary` (только зарегистрированные объекты POCO с подсказками типов) |

### Управление сессиями \{#session-management\}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| UseSession | `bool` | `false` | `UseSession` | Включить состояние сессий; выполняет запросы последовательно |
| SessionId | `string` | `null` | `SessionId` | Идентификатор сессии; автоматически генерирует GUID, если `null` и UseSession имеет значение true |

:::note
Флаг `UseSession` включает сохранение серверной сессии, что позволяет использовать операторы `SET` и временные таблицы. Сессии будут сброшены после 60 секунд бездействия (тайм-аут по умолчанию). Время жизни сессии можно увеличить, задав параметры сессии с помощью операторов ClickHouse или конфигурации сервера.

Класс `ClickHouseConnection` обычно поддерживает параллельную работу (несколько потоков могут выполнять запросы одновременно). Однако включение флага `UseSession` ограничит выполнение одним активным запросом на соединение в любой момент времени (это ограничение на стороне сервера).
:::

### Безопасность \{#security\}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|--------------------------|----------|
| SkipServerCertificateValidation | `bool` | `false` | — | Отключить проверку HTTPS-сертификата; **не использовать в продуктивной среде** |

### Конфигурация HTTP‑клиента \{#http-client-configuration\}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| HttpClient | `HttpClient` | `null` | — | Пользовательский предварительно настроенный экземпляр HttpClient |
| HttpClientFactory | `IHttpClientFactory` | `null` | — | Пользовательская фабрика для создания экземпляров HttpClient |
| HttpClientName | `string` | `null` | — | Имя, используемое HttpClientFactory для создания конкретного клиента |

### Логирование и отладка \{#logging-debugging\}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| LoggerFactory | `ILoggerFactory` | `null` | — | Фабрика логгеров для диагностического логирования |
| EnableDebugMode | `bool` | `false` | — | Включить .NET network tracing (требуется LoggerFactory с уровнем, установленным на Trace); **значительное влияние на производительность** |

### Пользовательские настройки и роли \{#custom-settings-roles\}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| CustomSettings | `IDictionary<string, object>` | Пусто | префикс `set_*` | Настройки сервера ClickHouse, см. примечание ниже. |
| Roles | `IReadOnlyList<string>` | Пусто | `Roles` | Роли ClickHouse, перечисленные через запятую (например, `Roles=admin,reader`) |

:::note
При использовании строки подключения для задания пользовательских настроек добавляйте префикс `set_`, например «set_max_threads=4». При использовании объекта ClickHouseClientSettings префикс `set_` добавлять не нужно.

Полный список доступных настроек см. [здесь](https://clickhouse.com/docs/operations/settings/settings).
:::

---

### Примеры строк подключения \{#connection-string-examples\}

#### Простое подключение \{#basic-connection\}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```


#### С пользовательскими настройками ClickHouse \{#with-custom-clickhouse-settings\}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```

***


### QueryOptions \{#query-options\}

`QueryOptions` позволяет переопределять клиентские настройки для отдельных запросов. Все свойства являются необязательными и переопределяют значения по умолчанию клиента только если они заданы.

| Property         | Type                          | Description                                                                                                                          |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| QueryId          | `string`                      | Пользовательский идентификатор запроса для отслеживания в `system.query_log` или отмены                                              |
| Database         | `string`                      | Переопределяет базу данных по умолчанию для этого запроса                                                                            |
| Roles            | `IReadOnlyList<string>`       | Переопределяет роли клиента для этого запроса                                                                                        |
| CustomSettings   | `IDictionary<string, object>` | Настройки сервера ClickHouse для этого запроса (например, `max_threads`)                                                             |
| CustomHeaders    | `IDictionary<string, string>` | Дополнительные HTTP‑заголовки для этого запроса                                                                                      |
| UseSession       | `bool?`                       | Переопределяет поведение сессии для этого запроса                                                                                    |
| SessionId        | `string`                      | Идентификатор сессии для этого запроса (требуется `UseSession = true`)                                                               |
| BearerToken      | `string`                      | Переопределяет токен аутентификации для этого запроса                                                                                |
| MaxExecutionTime | `TimeSpan?`                   | Тайм‑аут выполнения запроса на стороне сервера (передаётся как настройка `max_execution_time`); сервер отменит запрос при превышении |

**Пример:**

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

`InsertOptions` расширяет `QueryOptions` настройками, предназначенными для пакетных операций вставки через `InsertBinaryAsync`.

| Свойство               | Тип               | По умолчанию | Описание                                                 |
| ---------------------- | ----------------- | ------------ | -------------------------------------------------------- |
| BatchSize              | `int`             | 100,000      | Количество строк в пакете                                |
| MaxDegreeOfParallelism | `int`             | 1            | Количество параллельных загрузок пакетов                 |
| Format                 | `RowBinaryFormat` | `RowBinary`  | Бинарный формат: `RowBinary` или `RowBinaryWithDefaults` |

Все свойства `QueryOptions` также доступны в `InsertOptions`.

**Пример:**

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

`ClickHouseClient` — это рекомендуемый API для взаимодействия с ClickHouse. Он потокобезопасен, предназначен для использования как синглтон и самостоятельно управляет пулом HTTP‑соединений.

### Создание клиента \{#creating-a-client\}

Создайте `ClickHouseClient`, указав строку подключения, или используйте объект `ClickHouseClientSettings`. См. раздел [Configuration](#configuration) с описанием доступных параметров.

Информация о вашем сервисе ClickHouse Cloud доступна в консоли ClickHouse Cloud.

Выберите сервис и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения к сервису ClickHouse Cloud" border />

Выберите **C#**. Ниже будут отображены параметры подключения.

<Image img={connection_details_csharp} size="md" alt="Параметры подключения ClickHouse Cloud для C#" border />

Если вы используете самоуправляемый ClickHouse, параметры подключения задаются вашим администратором ClickHouse.

Подключение с помощью строки подключения:

```csharp
using ClickHouse.Driver;

using var client = new ClickHouseClient("Host=localhost;Username=default;Password=secret");
```

Или, используя `ClickHouseClientSettings`:

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

В сценариях внедрения зависимостей используйте `IHttpClientFactory`:

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
`ClickHouseClient` спроектирован как долгоживущий объект, который используется совместно во всём приложении. Создайте его один раз (обычно как singleton) и переиспользуйте для всех операций с базой данных. Клиент самостоятельно управляет пулом HTTP‑подключений.
:::

***


### Выполнение запросов \{#executing-queries\}

Используйте `ExecuteNonQueryAsync` для команд, не возвращающих результат:

```csharp
// Create a table
await client.ExecuteNonQueryAsync(
    "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory"
);

// Drop a table
await client.ExecuteNonQueryAsync("DROP TABLE IF EXISTS default.my_table");
```

Используйте `ExecuteScalarAsync`, чтобы получить одно значение:

```csharp
var count = await client.ExecuteScalarAsync("SELECT count() FROM default.my_table");
Console.WriteLine($"Row count: {count}");

var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine($"Server version: {version}");
```

***


### Вставка данных \{#inserting-data\}

#### Параметризованные вставки \{#parameterized-inserts\}

Вставляйте данные, используя параметризованные запросы и метод `ExecuteNonQueryAsync`. Типы параметров должны быть указаны в SQL с использованием синтаксиса `{name:Type}`:

```csharp
using ClickHouse.Driver;
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.Add("id", 1L);
parameters.Add("name", "Alice");

await client.ExecuteNonQueryAsync(
    "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})",
    parameters
);
```

***


#### Массовые вставки \{#bulk-insert\}

Используйте `InsertBinaryAsync` для эффективной вставки большого количества строк. Он выполняет потоковую передачу данных в нативном двоичном формате строк ClickHouse, поддерживает параллельную пакетную загрузку и предотвращает ошибки «URL слишком длинный», которые могут возникать при использовании параметризованных запросов.

```csharp
// Prepare data as IEnumerable<object[]>
var rows = Enumerable.Range(0, 1_000_000)
    .Select(i => new object[] { (long)i, $"value{i}" });

var columns = new[] { "id", "name" };

// Basic insert
long rowsInserted = await client.InsertBinaryAsync("default.my_table", columns, rows);
Console.WriteLine($"Rows inserted: {rowsInserted}");
```

Для больших наборов данных настройте пакетную вставку и параллелизм с помощью `InsertOptions`:

```csharp
var options = new InsertOptions
{
    BatchSize = 100_000,           // Rows per batch (default: 100,000)
    MaxDegreeOfParallelism = 4     // Parallel batch uploads (default: 1)
};
```

:::note

* Клиент автоматически получает структуру таблицы с помощью `SELECT * FROM <table> WHERE 1=0` перед вставкой. Передаваемые значения должны соответствовать типам целевых столбцов.
* При `MaxDegreeOfParallelism > 1` пакеты данных загружаются параллельно. Сеансы несовместимы с параллельной вставкой; либо отключите сеансы, либо установите `MaxDegreeOfParallelism = 1`.
* Используйте `RowBinaryFormat.RowBinaryWithDefaults` в `InsertOptions.Format`, если вы хотите, чтобы сервер применял значения DEFAULT для столбцов, которые не были переданы.
  :::

***


### Чтение данных \{#reading-data\}

Используйте `ExecuteReaderAsync` для выполнения запросов SELECT. Возвращаемый `ClickHouseDataReader` предоставляет типизированный доступ к столбцам результата через методы, такие как `GetInt64()`, `GetString()` и `GetFieldValue<T>()`.

Вызывайте `Read()`, чтобы перейти к следующей строке. Метод возвращает `false`, когда строк больше нет. Обращайтесь к столбцам по индексу (с нуля) или по имени столбца.

```csharp
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.Add("max_id", 100L);

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


### Параметры SQL \{#sql-parameters\}

В ClickHouse стандартный формат параметров в SQL-запросах — `{parameter_name:DataType}`.

**Примеры:**

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
Параметры привязки SQL (bind) передаются как параметры HTTP URI-запроса, поэтому при их чрезмерном количестве может возникнуть исключение «URL too long». Используйте `InsertBinaryAsync` для пакетной вставки данных, чтобы избежать этого ограничения.
:::

***


### Идентификатор запроса (Query ID) \{#query-id\}

Каждому запросу назначается уникальный `query_id`, который можно использовать для получения данных из таблицы `system.query_log` или прерывания длительно выполняющихся запросов. Вы можете указать собственный идентификатор запроса с помощью `QueryOptions`:

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
Если вы указываете собственный `QueryId`, убедитесь, что он уникален для каждого запроса. Случайный GUID — хороший выбор.
:::

***


### Необработанный стриминг \{#raw-streaming\}

Используйте `ExecuteRawResultAsync`, чтобы передавать результаты запроса в определённом формате непосредственно, обходя `data reader`. Это полезно для экспорта данных в файлы или их передачи в другие системы:

```csharp
using var result = await client.ExecuteRawResultAsync(
    "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow"
);

await using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = await reader.ReadToEndAsync();
```

Распространённые форматы: `JSONEachRow`, `CSV`, `TSV`, `Parquet`, `Native`. Полный список вариантов см. в [документации по форматам](/docs/interfaces/formats).

***


### Вставка из необработанного потока \{#raw-stream-insert\}

Используйте `InsertRawStreamAsync`, чтобы вставлять данные непосредственно из файловых потоков или потоков памяти в форматах, таких как CSV, JSON, Parquet или любой [поддерживаемый формат ClickHouse](/docs/interfaces/formats).

**Вставка из CSV‑файла:**

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
См. [документацию по настройкам форматов](/docs/operations/settings/formats) для получения сведений о параметрах, управляющих процессом ингестии данных.
:::

***


### Дополнительные примеры \{#more-examples\}

См. дополнительные практические примеры использования в [директории examples](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples) репозитория GitHub.

## ADO.NET \{#ado-net\}

Библиотека предоставляет полную поддержку ADO.NET через `ClickHouseConnection`, `ClickHouseCommand` и `ClickHouseDataReader`. Этот API необходим для интеграции с ORM (Dapper, Linq2db), а также когда вам нужны стандартные абстракции работы с базами данных в .NET.

### Управление временем жизни с ClickHouseDataSource \{#ado-net-datasource\}

**Всегда создавайте подключения из `ClickHouseDataSource`**, чтобы обеспечить корректное управление временем жизни и работу пула соединений. Этот источник данных внутренне управляет одним экземпляром `ClickHouseClient`, и все подключения используют его пул HTTP-соединений.

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

Для внедрения зависимостей:

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
**Не создавайте `ClickHouseConnection` напрямую** в продакшн-коде. Каждое такое создание инициализирует новый HTTP‑клиент и пул соединений, что под нагрузкой может привести к исчерпанию сокетов:

```csharp
// DON'T DO THIS - creates new connection pool each time
using var conn = new ClickHouseConnection("Host=localhost");
await conn.OpenAsync();
```

Вместо этого всегда используйте `ClickHouseDataSource` или один общий экземпляр `ClickHouseClient`.
:::

***


### Использование ClickHouseCommand \{#ado-net-command\}

Создавайте команды из подключения для выполнения SQL-запросов:

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

Методы выполнения команд:

* `ExecuteNonQueryAsync()` - для INSERT, UPDATE, DELETE и DDL-команд
* `ExecuteScalarAsync()` - возвращает первый столбец первой строки
* `ExecuteReaderAsync()` - возвращает `ClickHouseDataReader` для перебора результатов

***


### Использование ClickHouseDataReader \{#ado-net-reader\}

`ClickHouseDataReader` предоставляет доступ к результатам запроса с сохранением типов:

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


## Рекомендации \{#best-practices\}

### Время жизни соединения и пул подключений \{#best-practices-connection-lifetime\}

`ClickHouse.Driver` внутренне использует `System.Net.Http.HttpClient`. `HttpClient` имеет пул подключений для каждой конечной точки (endpoint). В результате:

* Сеансы работы с базой данных мультиплексируются через HTTP‑соединения, которыми управляет пул подключений.
* HTTP‑соединения автоматически переиспользуются пулом.
* Соединения могут оставаться активными после удаления объектов `ClickHouseClient` или `ClickHouseConnection`.

**Рекомендуемые шаблоны использования:**

| Сценарий | Рекомендуемый подход |
|----------|---------------------|
| Общий случай | Использовать синглтон `ClickHouseClient` |
| ADO.NET / ORM | Использовать `ClickHouseDataSource` (создаёт соединения, которые разделяют один и тот же пул) |
| DI‑окружения | Регистрировать `ClickHouseClient` или `ClickHouseDataSource` как синглтон с `IHttpClientFactory` |

:::important
При использовании пользовательского `HttpClient` или `HttpClientFactory` убедитесь, что `PooledConnectionIdleTimeout` имеет значение меньше, чем `keep_alive_timeout` сервера, чтобы избежать ошибок из‑за наполовину закрытых соединений. Значение `keep_alive_timeout` по умолчанию для развертываний в Cloud — 10 секунд. 
:::

:::warning
Избегайте создания множества экземпляров `ClickHouseClient` или отдельных `ClickHouseConnection` без общего `HttpClient`. Каждый экземпляр создаёт собственный пул подключений.
:::

---

### Обработка DateTime \{#best-practice-datetime\}

1. **По возможности используйте UTC.** Храните метки времени в столбцах `DateTime('UTC')` и используйте `DateTimeKind.Utc` в коде. Это устраняет неоднозначность, связанную с часовыми поясами.

2. **Используйте `DateTimeOffset` для явной обработки часовых поясов.** Он всегда представляет конкретный момент времени и включает информацию о смещении.

3. **Указывайте часовой пояс в подсказках типов SQL.** При использовании параметров с `Unspecified` значениями DateTime, записываемыми в столбцы с часовым поясом, отличным от UTC, включайте часовой пояс в SQL:
   ```csharp
   var parameters = new ClickHouseParameterCollection();
   parameters.Add("dt", myDateTime);

   await client.ExecuteNonQueryAsync(
       "INSERT INTO table (dt) VALUES ({dt:DateTime('Europe/Amsterdam')})",
       parameters
   );
   ```

---

### Асинхронные вставки \{#async-inserts\}

[Асинхронные вставки](/docs/optimize/asynchronous-inserts) переносят ответственность за формирование батчей с клиента на сервер. Вместо необходимости группировать вставки на стороне клиента сервер буферизует входящие данные и сбрасывает их в хранилище при достижении настраиваемых пороговых значений. Это полезно в сценариях с высокой степенью параллелизма, например в нагрузках обсервабилити, когда множество агентов отправляют небольшие объемы данных.

Включите асинхронные вставки через `CustomSettings` или строку подключения:

```csharp
// Using CustomSettings
var settings = new ClickHouseClientSettings("Host=localhost");
settings.CustomSettings["async_insert"] = 1;
settings.CustomSettings["wait_for_async_insert"] = 1; // Recommended: wait for flush acknowledgment

// Or via connection string
// "Host=localhost;set_async_insert=1;set_wait_for_async_insert=1"
```

**Два режима** (управляются параметром `wait_for_async_insert`):

| Mode                      | Behavior                                                                                       | Use case                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `wait_for_async_insert=1` | Вставка (`INSERT`) завершается после сброса данных на диск. Ошибки возвращаются клиенту.       | **Рекомендуется** для большинства нагрузок |
| `wait_for_async_insert=0` | Вставка (`INSERT`) завершается сразу после буферизации данных. Нет гарантии сохранения данных. | Только когда допустима потеря данных       |

:::warning
При `wait_for_async_insert=0` ошибки возникают только во время flush и не могут быть однозначно сопоставлены с исходной вставкой. Клиент также не создает обратного давления, что повышает риск перегрузки сервера.
:::

**Ключевые настройки:**

| Setting                         | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `async_insert_max_data_size`    | Выполнить flush, когда буфер достигает указанного размера (в байтах) |
| `async_insert_busy_timeout_ms`  | Выполнить flush по истечении указанного тайм-аута (в миллисекундах)  |
| `async_insert_max_query_number` | Выполнить flush после накопления указанного числа запросов           |

***


### Сессии \{#best-practices-sessions\}

Включайте сессии только тогда, когда вам нужны серверные возможности с сохранением состояния, например:

* Временные таблицы (`CREATE TEMPORARY TABLE`)
* Сохранение контекста запроса между несколькими командами
* Настройки на уровне сессии (`SET max_threads = 4`)

Когда сессии включены, запросы сериализуются, чтобы предотвратить одновременное использование одной и той же сессии. Это добавляет накладные расходы для нагрузок, которым не требуется состояние сессии.

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

**Использование ADO.NET (для совместимости с ORM):**

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


## Поддерживаемые типы данных \{#supported-data-types\}

`ClickHouse.Driver` поддерживает все типы данных ClickHouse. В приведённых ниже таблицах показаны сопоставления между типами ClickHouse и нативными типами .NET при чтении данных из базы данных.

### Сопоставление типов: чтение из ClickHouse \{#clickhouse-native-type-map-reading\}

#### Целочисленные типы \{#type-map-reading-integer\}

| Тип в ClickHouse | Тип в .NET |
|------------------|------------|
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

#### Типы с плавающей запятой \{#type-map-reading-floating-points\}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

---

#### Типы Decimal \{#type-map-reading-decimal\}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| Decimal(P, S) | `decimal` / `ClickHouseDecimal` |
| Decimal32(S) | `decimal` / `ClickHouseDecimal` |
| Decimal64(S) | `decimal` / `ClickHouseDecimal` |
| Decimal128(S) | `decimal` / `ClickHouseDecimal` |
| Decimal256(S) | `decimal` / `ClickHouseDecimal` |

:::note
Преобразование типов Decimal управляется настройкой UseCustomDecimals.
:::

---

#### Булев тип \{#type-map-reading-boolean\}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| Bool | `bool` |

---

#### Строковые типы \{#type-map-reading-strings\}

| Тип ClickHouse | Тип .NET |
|----------------|----------|
| String | `string` |
| FixedString(N) | `string` |

:::note
По умолчанию столбцы `String` и `FixedString(N)` возвращаются как `string`. Установите параметр `ReadStringsAsByteArrays=true` в строке подключения, чтобы считывать их как `byte[]`. Это полезно при хранении двоичных данных, которые могут не быть корректной последовательностью в кодировке UTF-8.
:::

---

#### Типы даты и времени \{#type-map-reading-datetime\}

| ClickHouse Type | .NET Type  |
| --------------- | ---------- |
| Date            | `DateTime` |
| Date32          | `DateTime` |
| DateTime        | `DateTime` |
| DateTime32      | `DateTime` |
| DateTime64      | `DateTime` |
| Time            | `TimeSpan` |
| Time64          | `TimeSpan` |

ClickHouse хранит значения `DateTime` и `DateTime64` во внутреннем представлении как Unix-временные метки (Unix timestamps — секунды или доли секунды, прошедшие с начала эпохи Unix). Хотя хранение всегда ведётся в UTC, у столбцов может быть привязан часовой пояс, который влияет на то, как значения отображаются и интерпретируются.

При чтении значений `DateTime` свойство `DateTime.Kind` устанавливается на основе часового пояса столбца:

| Column Definition              | Returned DateTime.Kind | Notes                                             |
| ------------------------------ | ---------------------- | ------------------------------------------------- |
| `DateTime('UTC')`              | `Utc`                  | Явный часовой пояс UTC                            |
| `DateTime('Europe/Amsterdam')` | `Unspecified`          | Применяется часовой пояс со смещением             |
| `DateTime`                     | `Unspecified`          | Локальное (wall-clock) время сохраняется как есть |

Для столбцов с часовым поясом, отличным от UTC, возвращаемое значение `DateTime` представляет локальное (wall-clock) время в соответствующем часовом поясе. Используйте `ClickHouseDataReader.GetDateTimeOffset()` для получения `DateTimeOffset` с корректным смещением для этого часового пояса:

```csharp
var reader = (ClickHouseDataReader)await connection.ExecuteReaderAsync(
    "SELECT toDateTime('2024-06-15 14:30:00', 'Europe/Amsterdam')");
reader.Read();

var dt = reader.GetDateTime(0);    // 2024-06-15 14:30:00, Kind=Unspecified
var dto = reader.GetDateTimeOffset(0); // 2024-06-15 14:30:00 +02:00 (CEST)
```

Для столбцов **без** явного часового пояса (т.е. `DateTime` вместо `DateTime('Europe/Amsterdam')`) драйвер возвращает `DateTime` с `Kind=Unspecified`. Это позволяет сохранить «настенное» время в точности в том виде, как оно хранится, не делая предположений о часовом поясе.

Если вам требуется поведение с учетом часового пояса для столбцов без явного часового пояса, то:

1. Используйте явные часовые пояса в определениях столбцов: `DateTime('UTC')` или `DateTime('Europe/Amsterdam')`
2. Устанавливайте нужный часовой пояс самостоятельно после чтения данных.

***


#### Тип JSON \{#type-map-reading-json\}

| ClickHouse Type | .NET Type    | Notes                                |
| --------------- | ------------ | ------------------------------------ |
| Json            | `JsonObject` | По умолчанию (`JsonReadMode=Binary`) |
| Json            | `string`     | При `JsonReadMode=String`            |

Тип возвращаемого значения JSON-столбцов определяется параметром `JsonReadMode`:

* **`Binary` (по умолчанию)**: Возвращает `System.Text.Json.Nodes.JsonObject`. Обеспечивает структурированный доступ к данным JSON, но специализированные типы ClickHouse (такие как IP-адреса, UUID, большие десятичные числа) преобразуются в их строковые представления внутри JSON-структуры.

* **`String`**: Возвращает «сырое» значение JSON как `string`. Сохраняет точное представление JSON из ClickHouse, что полезно, когда нужно передать JSON дальше без парсинга или когда вы хотите выполнять десериализацию самостоятельно.

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


#### Другие типы \{#type-map-reading-other\}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | См. примечание |
| Array(T) | `T[]` |
| Tuple(T1, T2, ...) | `Tuple<T1, T2, ...>` / `LargeTuple` |
| Map(K, V) | `Dictionary<K, V>` |
| Nullable(T) | `T?` |
| Enum8 | `string` |
| Enum16 | `string` |
| LowCardinality(T) | Такой же, как T |
| SimpleAggregateFunction | Такой же, как базовый тип |
| Nested(...) | `Tuple[]` |
| Variant(T1, T2, ...) | См. примечание |
| QBit(T, dimension) | `T[]` |

:::note
Типы Dynamic и Variant будут преобразованы в тип, соответствующий фактическому базовому типу в каждой строке.
:::

---

#### Типы геометрии \{#type-map-reading-geometry\}

| Тип ClickHouse | Тип .NET |
|----------------|----------|
| Point | `Tuple<double, double>` |
| Ring | `Tuple<double, double>[]` |
| LineString | `Tuple<double, double>[]` |
| Polygon | `Ring[]` |
| MultiLineString | `LineString[]` |
| MultiPolygon | `Polygon[]` |
| Geometry | См. примечание |

:::note
Тип Geometry — это тип Variant, который может содержать любой из геометрических типов. Он будет преобразован в соответствующий тип.
:::

---

### Сопоставление типов: запись в ClickHouse \{#clickhouse-native-type-map-writing\}

При вставке данных драйвер преобразует типы .NET в соответствующие типы ClickHouse. В таблицах ниже показано, какие типы .NET поддерживаются для каждого типа столбца ClickHouse.

#### Целочисленные типы \{#type-map-writing-integer\}

| Тип ClickHouse | Принимаемые типы .NET | Примечания |
|-----------------|---------------------|-------|
| Int8 | `sbyte`, любой, совместимый с `Convert.ToSByte()` |  |
| UInt8 | `byte`, любой, совместимый с `Convert.ToByte()` |  |
| Int16 | `short`, любой, совместимый с `Convert.ToInt16()` |  |
| UInt16 | `ushort`, любой, совместимый с `Convert.ToUInt16()` |  |
| Int32 | `int`, любой, совместимый с `Convert.ToInt32()` |  |
| UInt32 | `uint`, любой, совместимый с `Convert.ToUInt32()` |  |
| Int64 | `long`, любой, совместимый с `Convert.ToInt64()` |  |
| UInt64 | `ulong`, любой, совместимый с `Convert.ToUInt64()` |  |
| Int128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, любой, совместимый с `Convert.ToInt64()` | |
| UInt128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, любой, совместимый с `Convert.ToInt64()` | |
| Int256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, любой, совместимый с `Convert.ToInt64()` | |
| UInt256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, любой, совместимый с `Convert.ToInt64()` | |

---

#### Типы с плавающей запятой \{#type-map-writing-floating-point\}

| Тип ClickHouse | Поддерживаемые типы .NET | Примечания |
|-----------------|---------------------|-------|
| Float32 | `float`, любой тип, совместимый с `Convert.ToSingle()` |  |
| Float64 | `double`, любой тип, совместимый с `Convert.ToDouble()` | |
| BFloat16 | `float`, любой тип, совместимый с `Convert.ToSingle()` | Усекает значение до 16-битного формата brain float |

---

#### Логический тип \{#type-map-writing-boolean\}

| Тип ClickHouse | Допустимые типы .NET | Примечания |
|----------------|----------------------|-----------|
| Bool | `bool` |  |

---

#### Строковые типы \{#type-map-writing-strings\}

| Тип ClickHouse | Допустимые типы .NET | Примечания |
|----------------|-----------------------|------------|
| String | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | Двоичные типы записываются напрямую; потоки могут как поддерживать произвольное позиционирование (seek), так и не поддерживать его |
| FixedString(N) | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | String кодируется в UTF-8 и дополняется; двоичные типы должны содержать ровно N байт |

---

#### Типы даты и времени \{#type-map-writing-datetime\}

| Тип ClickHouse | Допустимые типы .NET                                              | Примечания                                                                               |
| -------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Date           | `DateTime`, `DateTimeOffset`, `DateOnly`, типы NodaTime           | Преобразуется в количество Unix-дней как UInt16                                          |
| Date32         | `DateTime`, `DateTimeOffset`, `DateOnly`, типы NodaTime           | Преобразуется в количество Unix-дней как Int32                                           |
| DateTime       | `DateTime`, `DateTimeOffset`, `DateOnly`, типы NodaTime           | См. подробности ниже                                                                     |
| DateTime32     | `DateTime`, `DateTimeOffset`, `DateOnly`, типы NodaTime           | То же, что и DateTime                                                                    |
| DateTime64     | `DateTime`, `DateTimeOffset`, `DateOnly`, типы NodaTime           | Точность зависит от параметра Scale                                                      |
| Time           | `TimeSpan`, `int`                                                 | Ограничивается диапазоном ±999:59:59; значения `int` интерпретируются как секунды        |
| Time64         | `TimeSpan`, `decimal`, `double`, `float`, `int`, `long`, `string` | Строка разбирается как `[-]HHH:MM:SS[.fraction]`; ограничивается до ±999:59:59.999999999 |

Драйвер учитывает `DateTime.Kind` при записи значений:

| DateTime.Kind | HTTP-параметры                                                                                    | Пакетная загрузка                                                       |
| ------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Utc           | Момент времени сохраняется                                                                        | Момент времени сохраняется                                              |
| Local         | Момент времени сохраняется                                                                        | Момент времени сохраняется                                              |
| Unspecified   | Рассматривается как локальное «настенное» время в часовом поясе типа параметра (по умолчанию UTC) | Рассматривается как локальное «настенное» время в часовом поясе столбца |

Значения `DateTimeOffset` всегда сохраняют точный момент времени.

**Пример: DateTime в UTC (момент сохраняется)**

```csharp
var utcTime = new DateTime(2024, 1, 15, 12, 0, 0, DateTimeKind.Utc);
// Stored as 12:00 UTC
// Read from DateTime('Europe/Amsterdam') column: 13:00 (UTC+1)
// Read from DateTime('UTC') column: 12:00 UTC
```

**Пример: неопределённый DateTime (локальное «настенное» время)**

```csharp
var wallClock = new DateTime(2024, 1, 15, 14, 30, 0, DateTimeKind.Unspecified);
// Written to DateTime('Europe/Amsterdam') column: stored as 14:30 Amsterdam time
// Read back from DateTime('Europe/Amsterdam') column: 14:30
```

**Рекомендация:** для наиболее простого и предсказуемого поведения используйте `DateTimeKind.Utc` или `DateTimeOffset` для всех операций с типом DateTime. Это позволит вашему коду работать одинаково независимо от часового пояса сервера, клиента или часового пояса столбца.


#### HTTP-параметры vs bulk copy \{#datetime-http-param-vs-bulkcopy\}

Существует существенное отличие между привязкой HTTP-параметров и bulk copy при записи значений DateTime с Kind `Unspecified`:

**Bulk Copy** знает часовой пояс целевого столбца и корректно интерпретирует значения `Unspecified` в этом часовом поясе.

**HTTP-параметры** автоматически не знают часовой пояс столбца. Необходимо явно указать его в подсказке SQL-типа:

```csharp
// CORRECT: Timezone in SQL type hint - type is extracted automatically
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime('Europe/Amsterdam')})";
command.AddParameter("dt", myDateTime);

// INCORRECT: Without timezone hint, interpreted as UTC
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime})";
command.AddParameter("dt", myDateTime);
// String value "2024-01-15 14:30:00" interpreted as UTC, not Amsterdam time!
```

| `DateTime.Kind` | Целевой столбец  | HTTP-параметр (с указанием часового пояса) | HTTP-параметр (без указания часового пояса) | Массовое копирование                     |
| --------------- | ---------------- | ------------------------------------------ | ------------------------------------------- | ---------------------------------------- |
| `Utc`           | UTC              | Момент сохраняется                         | Момент сохраняется                          | Момент сохраняется                       |
| `Utc`           | Europe/Amsterdam | Момент сохраняется                         | Момент сохраняется                          | Момент сохраняется                       |
| `Local`         | Любой            | Момент сохраняется                         | Момент сохраняется                          | Момент сохраняется                       |
| `Unspecified`   | UTC              | Интерпретируется как UTC                   | Интерпретируется как UTC                    | Интерпретируется как UTC                 |
| `Unspecified`   | Europe/Amsterdam | Интерпретируется как время Амстердама      | **Интерпретируется как UTC**                | Интерпретируется как временем Амстердама |

***


#### Типы Decimal \{#type-map-writing-decimal\}

| Тип ClickHouse | Поддерживаемые типы .NET | Примечания |
|-----------------|--------------------------|------------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Выбрасывает исключение `OverflowException`, если превышена точность |
| Decimal32 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 9 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 18 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 38 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 76 |

---

#### Тип JSON \{#type-map-writing-json\}

| Тип ClickHouse | Допустимые типы .NET                             | Примечания                                     |
| -------------- | ------------------------------------------------ | ---------------------------------------------- |
| Json           | `string`, `JsonObject`, `JsonNode`, любой объект | Поведение зависит от настройки `JsonWriteMode` |

Поведение при записи JSON управляется настройкой `JsonWriteMode`:

| Тип входных данных                           | `JsonWriteMode.String` (по умолчанию)            | `JsonWriteMode.Binary`                                                                  |
| -------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `string`                                     | Передаётся напрямую                              | Выбрасывает `ArgumentException`                                                         |
| `JsonObject`                                 | Сериализуется через `ToJsonString()`             | Выбрасывает `ArgumentException`                                                         |
| `JsonNode`                                   | Сериализуется через `ToJsonString()`             | Выбрасывает `ArgumentException`                                                         |
| Зарегистрированный POCO                      | Сериализуется через `JsonSerializer.Serialize()` | Бинарное кодирование с подсказками типов, поддерживаются пользовательские атрибуты пути |
| Незарегистрированный POCO / анонимный объект | Сериализуется через `JsonSerializer.Serialize()` | Выбрасывает `ClickHouseJsonSerializationException`                                      |

* **`String` (по умолчанию)**: Принимает `string`, `JsonObject`, `JsonNode` или любой объект. Все входные данные сериализуются с помощью `System.Text.Json.JsonSerializer` и отправляются как JSON-строки для разбора на стороне сервера. Это наиболее гибкий режим, который работает без регистрации типов.

* **`Binary`**: Принимает только зарегистрированные типы POCO. Данные конвертируются в бинарный JSON-формат ClickHouse на стороне клиента с полной поддержкой подсказок типов. Перед использованием требуется вызвать `connection.RegisterJsonSerializationType<T>()`. Запись значений `string` или `JsonNode` в этом режиме приводит к выбросу `ArgumentException`.

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


##### Типизированные JSON-столбцы \{#json-typed-columns\}

Когда у JSON-столбца есть подсказки по типам (например, `JSON(id UInt64, price Decimal128(2))`), драйвер использует их, чтобы сериализовывать значения с полным сохранением информации о типах. Это сохраняет точность для таких типов, как `UInt64`, `Decimal`, `UUID` и `DateTime64`, которые в противном случае теряли бы её при сериализации в виде обычного JSON.

##### Сериализация POCO \{#json-poco-serialization\}

Объекты POCO можно записывать в JSON-столбцы двумя способами в зависимости от значения `JsonWriteMode`:

**Строковый режим (по умолчанию)**: объекты POCO сериализуются через `System.Text.Json.JsonSerializer`. Регистрация типов не требуется. Это самый простой подход, который работает и с анонимными объектами.

**Бинарный режим**: объекты POCO сериализуются с использованием бинарного JSON-формата драйвера с полной поддержкой подсказок типов (type hints). Типы должны быть зарегистрированы с помощью `connection.RegisterJsonSerializationType<T>()` перед использованием. В этом режиме поддерживаются пользовательские отображения путей через атрибуты:

* **`[ClickHouseJsonPath("path")]`**: Отображает свойство на пользовательский JSON-путь. Полезно для вложенных структур или когда имя свойства отличается от требуемого JSON-ключа. **Работает только в бинарном режиме.**

* **`[ClickHouseJsonIgnore]`**: Исключает свойство из сериализации. **Работает только в бинарном режиме.**

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

Сопоставление имени свойства с подсказками типа столбца выполняется с учётом регистра. Свойство `UserId` будет сопоставлено только с подсказкой, определённой как `UserId`, а не `userid`. Это соответствует поведению ClickHouse, который позволяет путям вроде `userName` и `UserName` существовать как отдельные поля.

**Ограничения (только бинарный режим):**

* Типы POCO должны быть зарегистрированы на подключении с помощью `connection.RegisterJsonSerializationType<T>()` до сериализации. Попытка сериализовать незарегистрированный тип приводит к возникновению `ClickHouseJsonSerializationException`.
* Свойства-словари и массивы/списки требуют подсказок типов в определении столбца для корректной сериализации. Без подсказок используйте вместо этого строковый режим (String mode).
* Значения `null` в свойствах POCO записываются только тогда, когда путь имеет подсказку типа `Nullable(T)` в определении столбца. ClickHouse не допускает типы `Nullable` внутри динамических JSON-путей, поэтому свойства с `null` без подсказок пропускаются.
* Атрибуты `ClickHouseJsonPath` и `ClickHouseJsonIgnore` игнорируются в строковом режиме (они работают только в бинарном режиме).

***


#### Другие типы \{#type-map-writing-other\}

| Тип ClickHouse | Принимаемые типы .NET | Примечания |
|-----------------|---------------------|-------|
| UUID | `Guid`, `string` | Строка парсится как Guid |
| IPv4 | `IPAddress`, `string` | Должен быть IPv4; строка парсится через `IPAddress.Parse()` |
| IPv6 | `IPAddress`, `string` | Должен быть IPv6; строка парсится через `IPAddress.Parse()` |
| Nothing | Любой тип | Ничего не записывает (операция no-op) |
| Dynamic | — | **Не поддерживается** (выбрасывает `NotImplementedException`) |
| Array(T) | `IList`, `null` | При значении null записывается пустой массив |
| Tuple(T1, T2, ...) | `ITuple`, `IList` | Количество элементов должно соответствовать арности кортежа |
| Map(K, V) | `IDictionary` | |
| Nullable(T) | `null`, `DBNull` или типы, принимаемые T | Перед значением записывается байт флага null |
| Enum8 | `string`, `sbyte`, числовые типы | Строковое значение ищется в словаре enum |
| Enum16 | `string`, `short`, числовые типы | Строковое значение ищется в словаре enum |
| LowCardinality(T) | Типы, принимаемые T | Делегирует базовому типу |
| SimpleAggregateFunction | Типы, принимаемые базовым типом | Делегирует базовому типу |
| Nested(...) | `IList` кортежей | Количество элементов должно соответствовать количеству полей |
| Variant(T1, T2, ...) | Значение, соответствующее одному из T1, T2, ... | Выбрасывает `ArgumentException`, если нет совпадения типа |
| QBit(T, dim) | `IList` | Делегирует типу Array; размерность — только метаданные |

---

#### Геометрические типы \{#type-map-writing-geometry\}

| Тип ClickHouse | Допустимые типы .NET | Примечания |
|-----------------|---------------------|-------|
| Point | `System.Drawing.Point`, `ITuple`, `IList` (2 элемента) |  |
| Ring | `IList` из `Point` | |
| LineString | `IList` из `Point` | |
| Polygon | `IList` из `Ring` | |
| MultiLineString | `IList` из `LineString` | |
| MultiPolygon | `IList` из `Polygon` | |
| Geometry | Любой из указанных выше геометрических типов | Обобщающий вариант всех геометрических типов |

---

#### Запись не поддерживается \{#type-map-writing-not-supported\}

| Тип ClickHouse | Примечания |
|-----------------|-------|
| Dynamic | Вызывает исключение `NotImplementedException` |
| AggregateFunction | Вызывает исключение `AggregateFunctionException` |

---

### Обработка вложенных типов \{#nested-type-handling\}

Вложенные типы ClickHouse (`Nested(...)`) можно читать и записывать с использованием семантики массивов.

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


## Журналирование и диагностика \{#logging-and-diagnostics\}

Клиент ClickHouse для .NET интегрируется с абстракциями логирования `Microsoft.Extensions.Logging`, предоставляя легковесное журналирование, подключаемое по желанию. При его включении драйвер генерирует структурированные сообщения о событиях жизненного цикла подключения, выполнении команд, транспортных операциях и массовых операциях вставки. Журналирование полностью необязательно — приложения, которые не настраивают логгер, продолжают работать без дополнительных накладных расходов.

### Быстрый старт \{#logging-quick-start\}

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


#### Использование appsettings.json \{#logging-appsettings-config\}

Вы можете настроить уровни логирования с помощью стандартной системы конфигурации .NET:

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


#### Использование конфигурации в оперативной памяти \{#logging-inmemory-config\}

Вы также можете настроить детализацию логирования по категориям прямо в коде:

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


### Категории и источники \{#logging-categories\}

Драйвер использует отдельные категории, чтобы вы могли точно настраивать уровни логирования для каждого компонента:

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | Жизненный цикл соединения, выбор фабрики HTTP‑клиента, открытие/закрытие соединения, управление сессиями. |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | Начало и завершение выполнения запроса, замер времени, идентификаторы запросов, статистика сервера и сведения об ошибках. |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | Низкоуровневые потоковые HTTP‑запросы, флаги сжатия, коды статуса ответа и сбои транспортного уровня. |
| `ClickHouse.Driver.Client` | `ClickHouseClient` | Бинарная вставка, запросы и другие операции. |
| `ClickHouse.Driver.NetTrace` | `TraceHelper` | Отслеживание сетевых операций, только при включённом режиме отладки. |

#### Пример: диагностика неполадок подключения \{#logging-config-example\}

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

### Режим отладки: трассировка сети и диагностика \{#logging-debugmode\}

Чтобы упростить диагностику сетевых проблем, библиотека драйвера предоставляет вспомогательный инструмент, позволяющий включить низкоуровневую трассировку внутренних сетевых механизмов .NET. Чтобы включить её, необходимо передать `LoggerFactory` с уровнем `Trace` и установить `EnableDebugMode` в значение `true` (или включить её вручную через класс `ClickHouse.Driver.Diagnostic.TraceHelper`). События будут логироваться в категорию `ClickHouse.Driver.NetTrace`. Предупреждение: это приведёт к генерации чрезвычайно подробных логов и повлияет на производительность. Не рекомендуется включать режим отладки в продуктивной среде.

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

Драйвер предоставляет встроенную поддержку распределённого трейсинга OpenTelemetry через API .NET [`System.Diagnostics.Activity`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing). При его включении драйвер генерирует спаны для операций с базой данных, которые могут быть экспортированы в обсервабилити-бэкенды, такие как Jaeger или сам ClickHouse (через [OpenTelemetry Collector](https://clickhouse.com/docs/observability/integrating-opentelemetry)).

### Включение трассировки \{#opentelemetry-enabling\}

В приложениях ASP.NET Core добавьте `ActivitySource` драйвера ClickHouse в конфигурацию OpenTelemetry:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)  // Subscribe to ClickHouse driver spans
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());             // Or AddJaegerExporter(), etc.
```

Для консольных приложений, тестирования или ручной настройки:

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)
    .AddConsoleExporter()
    .Build();
```


### Атрибуты спана \{#opentelemetry-attributes\}

Каждый спан включает стандартные атрибуты базы данных OpenTelemetry, а также специфичные для ClickHouse статистические данные по запросу, которые можно использовать для отладки.

| Атрибут | Описание |
|-----------|-------------|
| `db.system` | Всегда `"clickhouse"` |
| `db.name` | Имя базы данных |
| `db.user` | Имя пользователя |
| `db.statement` | SQL-запрос (если включено) |
| `db.clickhouse.read_rows` | Количество строк, прочитанных запросом |
| `db.clickhouse.read_bytes` | Количество байт, прочитанных запросом |
| `db.clickhouse.written_rows` | Количество строк, записанных запросом |
| `db.clickhouse.written_bytes` | Количество байт, записанных запросом |
| `db.clickhouse.elapsed_ns` | Время выполнения на стороне сервера в наносекундах |

### Параметры конфигурации \{#opentelemetry-configuration\}

Настройте поведение трассировки с помощью `ClickHouseDiagnosticsOptions`:

```csharp
using ClickHouse.Driver.Diagnostic;

// Include SQL statements in spans (default: false for security)
ClickHouseDiagnosticsOptions.IncludeSqlInActivityTags = true;

// Truncate long SQL statements (default: 1000 characters)
ClickHouseDiagnosticsOptions.StatementMaxLength = 500;
```

:::warning
Включение `IncludeSqlInActivityTags` может привести к раскрытию конфиденциальных данных в ваших трассировках. Используйте с осторожностью в производственных средах.
:::


## Конфигурация TLS \{#tls-configuration\}

При подключении к ClickHouse по HTTPS вы можете по‑разному настроить работу TLS/SSL.

### Пользовательская проверка сертификатов \{#custom-certificate-validation\}

Для продакшн-сред, где требуется собственная логика проверки сертификатов, используйте свой `HttpClient` с настроенным обработчиком `ServerCertificateCustomValidationCallback`:

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
Важные замечания при передаче собственного HttpClient

* **Автоматическая декомпрессия**: необходимо включить `AutomaticDecompression`, если сжатие не отключено (по умолчанию сжатие включено).
* **Тайм-аут простоя**: установите `PooledConnectionIdleTimeout` меньше, чем `keep_alive_timeout` сервера (10 секунд для ClickHouse Cloud), чтобы избежать ошибок подключения из‑за полуоткрытых соединений.
  :::


## Поддержка ORM \{#orm-support\}

ORM-фреймворки используют API ADO.NET (`ClickHouseConnection`). Для корректного управления жизненным циклом подключений создавайте их из `ClickHouseDataSource`:

```csharp
// Register DataSource as singleton
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default");

// Create connections for ORM use
await using var connection = await dataSource.OpenConnectionAsync();
// Pass connection to your ORM...
```


### Dapper \{#orm-support-dapper\}

`ClickHouse.Driver` можно использовать с Dapper, но анонимные объекты при этом не поддерживаются.

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


### Linq2db \{#orm-support-linq2db\}

Этот драйвер совместим с [linq2db](https://github.com/linq2db/linq2db) — легковесным ORM и провайдером LINQ для .NET. Подробную документацию см. на сайте проекта.

**Пример использования:**

Создайте объект `DataConnection` с использованием провайдера ClickHouse:

```csharp
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.ClickHouse;

var connectionString = "Host=localhost;Port=8123;Database=default";
var options = new DataOptions()
    .UseClickHouse(connectionString, ClickHouseProvider.ClickHouseDriver);

await using var db = new DataConnection(options);
```

Сопоставления таблиц могут задаваться с помощью атрибутов или fluent‑конфигурации. Если имена ваших классов и свойств в точности совпадают с именами таблиц и столбцов, никакая конфигурация не требуется:

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

**Выполнение запросов:**

```csharp
await using var db = new DataConnection(options);

var products = await db.GetTable<Product>()
    .Where(p => p.Price > 100)
    .OrderByDescending(p => p.Name)
    .ToListAsync();
```

**Массовое копирование (Bulk Copy):**

Используйте `BulkCopyAsync` для эффективной массовой вставки данных.

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

Entity Framework Core на данный момент не поддерживается.

## Ограничения \{#limitations\}

### Столбцы типа AggregateFunction \{#aggregatefunction-columns\}

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
