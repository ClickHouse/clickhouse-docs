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

## Установка {#installation}

Установите пакет из NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Или с помощью менеджера пакетов NuGet:

```bash
Install-Package ClickHouse.Driver
```


## Быстрый старт {#quick-start}

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```


## Конфигурация {#configuration}

Существует два способа настройки подключения к ClickHouse:

* **Строка подключения:** Пары ключ/значение, разделённые точкой с запятой, которые задают хост, учётные данные для аутентификации и другие параметры подключения.
* Объект **`ClickHouseClientSettings`**: Строго типизированный объект конфигурации, который может быть загружен из файлов конфигурации или задан в коде.

Ниже приведён полный список всех параметров, их значений по умолчанию и того, как они влияют на подключение.

### Параметры подключения {#connection-settings}

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

### Формат данных и сериализация {#data-format-serialization}

| Свойство | Тип | По умолчанию | Ключ строки подключения | Описание |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | Включить сжатие gzip при передаче данных |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | Использовать `ClickHouseDecimal` для произвольной точности; если `false`, используется .NET `decimal` (ограничение 128 бит) |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | Отправлять параметры в виде form data вместо URL-строки запроса |

### Управление сессиями {#session-management}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| UseSession | `bool` | `false` | `UseSession` | Включить состояние сессий; выполняет запросы последовательно |
| SessionId | `string` | `null` | `SessionId` | Идентификатор сессии; автоматически генерирует GUID, если `null` и UseSession имеет значение true |

:::note
Флаг `UseSession` включает сохранение серверной сессии, что позволяет использовать операторы `SET` и временные таблицы. Сессии будут сброшены после 60 секунд бездействия (тайм-аут по умолчанию). Время жизни сессии можно увеличить, задав параметры сессии с помощью операторов ClickHouse или конфигурации сервера.

Класс `ClickHouseConnection` обычно поддерживает параллельную работу (несколько потоков могут выполнять запросы одновременно). Однако включение флага `UseSession` ограничит выполнение одним активным запросом на соединение в любой момент времени (это ограничение на стороне сервера).
:::

### Безопасность {#security}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|--------------------------|----------|
| SkipServerCertificateValidation | `bool` | `false` | — | Отключить проверку HTTPS-сертификата; **не использовать в продуктивной среде** |

### Конфигурация HTTP‑клиента {#http-client-configuration}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| HttpClient | `HttpClient` | `null` | — | Пользовательский предварительно настроенный экземпляр HttpClient |
| HttpClientFactory | `IHttpClientFactory` | `null` | — | Пользовательская фабрика для создания экземпляров HttpClient |
| HttpClientName | `string` | `null` | — | Имя, используемое HttpClientFactory для создания конкретного клиента |

### Логирование и отладка {#logging-debugging}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| LoggerFactory | `ILoggerFactory` | `null` | — | Фабрика логгеров для диагностического логирования |
| EnableDebugMode | `bool` | `false` | — | Включить .NET network tracing (требуется LoggerFactory с уровнем, установленным на Trace); **значительное влияние на производительность** |

### Пользовательские настройки и роли {#custom-settings-roles}

| Свойство | Тип | Значение по умолчанию | Ключ строки подключения | Описание |
|----------|------|-----------------------|-------------------------|----------|
| CustomSettings | `IDictionary<string, object>` | Пусто | префикс `set_*` | Настройки сервера ClickHouse, см. примечание ниже. |
| Roles | `IReadOnlyList<string>` | Пусто | `Roles` | Роли ClickHouse, перечисленные через запятую (например, `Roles=admin,reader`) |

:::note
При использовании строки подключения для задания пользовательских настроек добавляйте префикс `set_`, например «set_max_threads=4». При использовании объекта ClickHouseClientSettings префикс `set_` добавлять не нужно.

Полный список доступных настроек см. [здесь](https://clickhouse.com/docs/operations/settings/settings).
:::

---

### Примеры строк подключения {#connection-string-examples}

#### Простое подключение {#basic-connection}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```


#### С пользовательскими настройками ClickHouse {#with-custom-clickhouse-settings}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```


## Использование {#usage}

### Подключение {#connecting}

Чтобы подключиться к ClickHouse, создайте `ClickHouseConnection` со строкой подключения или объект `ClickHouseClientSettings`. См. раздел [Configuration](#configuration) с описанием доступных параметров.

Информация о вашем сервисе ClickHouse Cloud доступна в консоли ClickHouse Cloud.

Выберите сервис и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения к сервису ClickHouse Cloud" border />

Выберите **C#**. Ниже будут отображены параметры подключения.

<Image img={connection_details_csharp} size="md" alt="Параметры подключения ClickHouse Cloud для C#" border />

Если вы используете самоуправляемый ClickHouse, параметры подключения задаются вашим администратором ClickHouse.

Подключение с помощью строки подключения:

```csharp
using ClickHouse.Driver.ADO;

using var connection = new ClickHouseConnection("Host=localhost;Username=default;Password=secret");
await connection.OpenAsync();
```

Или, используя `ClickHouseClientSettings`:

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    Username = "default",
    Password = "secret"
};
using var connection2 = new ClickHouseConnection(settings);
await connection2.OpenAsync();
```

:::note

* `ClickHouseConnection` представляет собой &quot;сессию&quot; с сервером. При создании соединения выполняется определение доступных возможностей, запрашивается версия сервера (поэтому при открытии есть небольшие накладные расходы), но в целом многократное создание и уничтожение таких объектов является безопасным.
* Рекомендуемое время жизни подключения — один объект подключения на одну большую &quot;транзакцию&quot;, охватывающую несколько запросов. Объект `ClickHouseConnection` может быть долгоживущим. Есть небольшие накладные расходы при запуске подключения, поэтому не рекомендуется создавать объект подключения для каждого запроса.
* Если приложение работает с большими объемами транзакций и ему часто требуется создавать/уничтожать объекты `ClickHouseConnection`, рекомендуется использовать `IHttpClientFactory` или статический экземпляр `HttpClient` для управления подключениями.
  :::

***


### Создание таблицы {#creating-a-table}

Создайте таблицу с использованием стандартного синтаксиса SQL:

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    await connection.OpenAsync();

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory";
        await command.ExecuteNonQueryAsync();
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
    await connection.OpenAsync();

    using (var command = connection.CreateCommand())
    {
        command.AddParameter("id", "Int64", 1);
        command.AddParameter("name", "String", "test");
        command.CommandText = "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})";
        await command.ExecuteNonQueryAsync();
    }
}
```

***


### Массовая вставка {#bulk-insert}

Используйте `ClickHouseBulkCopy` для вставки большого количества строк. Он эффективно потоково передаёт данные, используя собственный бинарный построчный формат ClickHouse, работает в параллельном режиме и может разбивать данные на пакеты. Это также позволяет избежать ограничений, связанных с большими наборами параметров, которые вызывают ошибки «URL too long».

Для использования `ClickHouseBulkCopy` необходимы:

* Целевое подключение (экземпляр `ClickHouseConnection`)
* Имя целевой таблицы (свойство `DestinationTableName`)
* Источник данных (`IDataReader` или `IEnumerable<object[]>`)

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using var connection = new ClickHouseConnection(connectionString);
await connection.OpenAsync();

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

* Для оптимальной производительности ClickHouseBulkCopy использует Task Parallel Library (TPL) для обработки пакетов данных с использованием до 4 параллельных задач вставки (это можно настроить).
* Имена столбцов при необходимости могут быть переданы через свойство `ColumnNames`, если в исходных данных столбцов меньше, чем в целевой таблице.
* Настраиваемые параметры: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`.
* Перед копированием выполняется запрос `SELECT * FROM <table> LIMIT 0` для получения информации о структуре целевой таблицы. Типы передаваемых объектов должны разумно соответствовать типам столбцов целевой таблицы.
* Сессии несовместимы с параллельной вставкой. Подключение, передаваемое в `ClickHouseBulkCopy`, должно быть без сессий, либо параметр `MaxDegreeOfParallelism` должен быть установлен в значение `1`.
  :::

***


### Выполнение запросов SELECT {#performing-select-queries}

Выполняйте запросы SELECT с помощью методов `ExecuteReader()` или `ExecuteReaderAsync()`. Возвращаемый `DbDataReader` предоставляет типизированный доступ к столбцам результата через методы, такие как `GetInt64()`, `GetString()` и `GetFieldValue<T>()`.

Вызывайте `Read()`, чтобы перейти к следующей строке. Метод возвращает `false`, когда строк больше нет. Обращайтесь к столбцам по индексу (с нуля) или по имени столбца.

```csharp
using ClickHouse.Driver.ADO;
using System.Data;

using (var connection = new ClickHouseConnection(connectionString))
{
    await connection.OpenAsync();

    using (var command = connection.CreateCommand())
    {
        command.AddParameter("id", "Int64", 10);
        command.CommandText = "SELECT * FROM default.my_table WHERE id < {id:Int64}";
        using var reader = await command.ExecuteReaderAsync();
        while (reader.Read())
        {
            Console.WriteLine($"select: Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
        }
    }
}
```

***


### Параметры SQL {#sql-parameters}

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
Параметры привязки SQL (bind) передаются как параметры HTTP URI-запроса, поэтому при их чрезмерном количестве может возникнуть исключение «URL too long». Использование ClickHouseBulkInsert позволяет обойти это ограничение.
:::

***


### Идентификатор запроса {#query-id}

Каждый метод, который выполняет запрос, также возвращает `query_id` в результате. Этот уникальный идентификатор назначается клиентом для каждого запроса и может использоваться для получения данных из таблицы `system.query_log` (если она включена) или для отмены длительно выполняющихся запросов. При необходимости пользователь может задать идентификатор запроса явно в объекте ClickHouseCommand.

```csharp
var customQueryId = $"qid-{Guid.NewGuid()}";

using var command = connection.CreateCommand();
command.CommandText = "SELECT version()";
command.QueryId = customQueryId;

var version = await command.ExecuteScalarAsync();
Console.WriteLine($"QueryId: {command.QueryId}");
```

:::tip
Если вы переопределяете параметр `QueryId`, необходимо обеспечить его уникальность для каждого вызова. Случайный GUID — хороший вариант.
:::

***


### Необработанный стриминг {#raw-streaming}

Можно передавать данные в определённом формате непосредственно, обходя `data reader`. Это может быть полезно, если вы хотите сохранить данные в файл в нужном формате. Например:

```csharp
using var command = connection.CreateCommand();
command.CommandText = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = await reader.ReadToEndAsync();
```

***


### Вставка из необработанного потока {#raw-stream-insert}

Используйте `InsertRawStreamAsync`, чтобы вставлять данные непосредственно из файловых потоков или потоков памяти в форматах, таких как CSV, JSON или любой [поддерживаемый формат ClickHouse](/docs/interfaces/formats).

**Вставка из CSV‑файла:**

```csharp
await using var fileStream = File.OpenRead("data.csv");

using var response = await connection.InsertRawStreamAsync(
    table: "my_table",
    stream: fileStream,
    format: "CSV",
    columns: ["id", "product", "price"]); // Optional: specify columns
```

:::note
См. [документацию по настройкам форматов](/docs/operations/settings/formats) для получения сведений о параметрах, управляющих процессом ингестии данных.
:::

***


### Дополнительные примеры {#more-examples}

См. дополнительные практические примеры использования в [директории examples](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples) репозитория GitHub.

## Рекомендации {#best-practices}

### Время жизни соединения и пул подключений {#best-practices-connection-lifetime}

`ClickHouse.Driver` внутренне использует `System.Net.Http.HttpClient`. `HttpClient` имеет пул подключений для каждой конечной точки (endpoint). В результате:

* Объект `ClickHouseConnection` не имеет отображения 1:1 на TCP‑соединения — несколько сеансов работы с базой данных будут мультиплексироваться поверх нескольких TCP‑соединений на один сервер.
* Объекты `ClickHouseConnection` могут быть «долго живущими»; реальные TCP‑соединения под ними будут переиспользоваться пулом подключений.
* Позвольте `HttpClient` управлять пулом подключений внутренне. Не организуйте пул объектов `ClickHouseConnection` самостоятельно.
* Соединения могут оставаться активными после удаления объекта `ClickHouseConnection`.
* Это поведение можно настроить, передав пользовательский `HttpClientFactory` или `HttpClient` с пользовательским `HttpClientHandler`.

Для DI‑окружений предусмотрен специальный конструктор `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`, который заставляет `ClickHouseConnection` запрашивать именованный HTTP‑клиент.

:::important
При использовании пользовательского `HttpClient` или `HttpClientFactory` убедитесь, что `PooledConnectionIdleTimeout` имеет значение меньше, чем `keep_alive_timeout` сервера, чтобы избежать ошибок из‑за наполовину закрытых соединений. Значение `keep_alive_timeout` по умолчанию для развертываний в Cloud — 10 секунд. 
:::

---

### Обработка DateTime {#best-practice-datetime}

1. **По возможности используйте UTC.** Храните метки времени в столбцах `DateTime('UTC')` и используйте `DateTimeKind.Utc` в коде. Это устраняет неоднозначность, связанную с часовыми поясами.

2. **Используйте `DateTimeOffset` для явной обработки часовых поясов.** Он всегда представляет конкретный момент времени и включает информацию о смещении.

3. **Указывайте часовой пояс в подсказках типа параметров HTTP.** При использовании параметров с `Unspecified` значениями DateTime, записываемыми в столбцы с часовым поясом, отличным от UTC:
   ```csharp
   command.AddParameter("dt", value, "DateTime('Europe/Amsterdam')");
   ```

### Асинхронные вставки {#async-inserts}

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


### Сессии {#best-practices-sessions}

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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();

await using var cmd1 = connection.CreateCommand("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await cmd1.ExecuteNonQueryAsync();

await using var cmd2 = connection.CreateCommand("INSERT INTO temp_ids VALUES (1), (2), (3)");
await cmd2.ExecuteNonQueryAsync();

await using var cmd3 = connection.CreateCommand("SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)");
await using var reader = await cmd3.ExecuteReaderAsync();
```


## Поддерживаемые типы данных {#supported-data-types}

`ClickHouse.Driver` поддерживает все типы данных ClickHouse. В приведённых ниже таблицах показаны сопоставления между типами ClickHouse и нативными типами .NET при чтении данных из базы данных.

### Сопоставление типов: чтение из ClickHouse {#clickhouse-native-type-map-reading}

#### Целочисленные типы {#type-map-reading-integer}

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

#### Типы с плавающей запятой {#type-map-reading-floating-points}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

---

#### Типы Decimal {#type-map-reading-decimal}

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

#### Булев тип {#type-map-reading-boolean}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| Bool | `bool` |

---

#### Строковые типы {#type-map-reading-strings}

| Тип ClickHouse | Тип .NET |
|----------------|----------|
| String | `string` |
| FixedString(N) | `byte[]` |

---

#### Типы даты и времени {#type-map-reading-datetime}

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


#### Другие типы {#type-map-reading-other}

| Тип ClickHouse | Тип .NET |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | См. примечание |
| Json | `JsonObject` |
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

#### Типы геометрии {#type-map-reading-geometry}

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

### Сопоставление типов: запись в ClickHouse {#clickhouse-native-type-map-writing}

При вставке данных драйвер преобразует типы .NET в соответствующие типы ClickHouse. В таблицах ниже показано, какие типы .NET поддерживаются для каждого типа столбца ClickHouse.

#### Целочисленные типы {#type-map-writing-integer}

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

#### Типы с плавающей запятой {#type-map-writing-floating-point}

| Тип ClickHouse | Поддерживаемые типы .NET | Примечания |
|-----------------|---------------------|-------|
| Float32 | `float`, любой тип, совместимый с `Convert.ToSingle()` |  |
| Float64 | `double`, любой тип, совместимый с `Convert.ToDouble()` | |
| BFloat16 | `float`, любой тип, совместимый с `Convert.ToSingle()` | Усекает значение до 16-битного формата brain float |

---

#### Логический тип {#type-map-writing-boolean}

| Тип ClickHouse | Допустимые типы .NET | Примечания |
|----------------|----------------------|-----------|
| Bool | `bool` |  |

---

#### Строковые типы {#type-map-writing-strings}

| Тип ClickHouse | Допустимые типы .NET | Примечания |
|----------------|-----------------------|------------|
| String | `string`, любой тип, совместимый с `Convert.ToString()` |  |
| FixedString(N) | `string`, `byte[]` | String кодируется в UTF-8 и дополняется/усекается; массив byte[] должен содержать ровно N байт |

---

#### Типы даты и времени {#type-map-writing-datetime}

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

| `DateTime.Kind` | Поведение                                                                       |
| --------------- | ------------------------------------------------------------------------------- |
| `Utc`           | Момент времени сохраняется без изменений                                        |
| `Local`         | Преобразуется в UTC с использованием часового пояса системы; момент сохраняется |
| `Unspecified`   | Рассматривается как локальное время в часовом поясе целевого столбца            |

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


#### HTTP-параметры vs bulk copy {#datetime-http-param-vs-bulkcopy}

Существует существенное отличие между привязкой HTTP-параметров и bulk copy при записи значений DateTime с Kind `Unspecified`:

**Bulk Copy** знает часовой пояс целевого столбца и корректно интерпретирует значения `Unspecified` в этом часовом поясе.

**HTTP-параметры** автоматически не знают часовой пояс столбца. Необходимо явно указать его в подсказке типа параметра:

```csharp
// CORRECT: Timezone in type hint
command.AddParameter("dt", myDateTime, "DateTime('Europe/Amsterdam')");
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime('Europe/Amsterdam')})";

// INCORRECT: Without timezone hint, interpreted as UTC
command.AddParameter("dt", myDateTime);
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime})";
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


#### Типы Decimal {#type-map-writing-decimal}

| Тип ClickHouse | Поддерживаемые типы .NET | Примечания |
|-----------------|--------------------------|------------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Выбрасывает исключение `OverflowException`, если превышена точность |
| Decimal32 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 9 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 18 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 38 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, любой тип, совместимый с `Convert.ToDecimal()` | Максимальная точность 76 |

---

#### Другие типы {#type-map-writing-other}

| Тип ClickHouse | Принимаемые типы .NET | Примечания |
|-----------------|---------------------|-------|
| UUID | `Guid`, `string` | Строка парсится как Guid |
| IPv4 | `IPAddress`, `string` | Должен быть IPv4; строка парсится через `IPAddress.Parse()` |
| IPv6 | `IPAddress`, `string` | Должен быть IPv6; строка парсится через `IPAddress.Parse()` |
| Nothing | Любой тип | Ничего не записывает (операция no-op) |
| Dynamic | — | **Не поддерживается** (выбрасывает `NotImplementedException`) |
| Json | `string`, `JsonObject`, любой объект | Строка парсится как JSON; объекты сериализуются через `JsonSerializer` |
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

#### Геометрические типы {#type-map-writing-geometry}

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

#### Запись не поддерживается  {#type-map-writing-not-supported}

| Тип ClickHouse | Примечания |
|-----------------|-------|
| Dynamic | Вызывает исключение `NotImplementedException` |
| AggregateFunction | Вызывает исключение `AggregateFunctionException` |

---

### Обработка вложенных типов {#nested-type-handling}

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
| `ClickHouse.Driver.NetTrace` | `TraceHelper` | Отслеживание сетевых операций, только при включённом режиме отладки. |

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


## OpenTelemetry {#opentelemetry}

Драйвер предоставляет встроенную поддержку распределённого трейсинга OpenTelemetry через API .NET [`System.Diagnostics.Activity`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing). При его включении драйвер генерирует спаны для операций с базой данных, которые могут быть экспортированы в обсервабилити-бэкенды, такие как Jaeger или сам ClickHouse (через [OpenTelemetry Collector](https://clickhouse.com/docs/observability/integrating-opentelemetry)).

### Включение трассировки {#opentelemetry-enabling}

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


### Атрибуты спана {#opentelemetry-attributes}

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

### Параметры конфигурации {#opentelemetry-configuration}

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


## Конфигурация TLS {#tls-configuration}

При подключении к ClickHouse по HTTPS вы можете по‑разному настроить работу TLS/SSL.

### Пользовательская проверка сертификатов {#custom-certificate-validation}

Для продакшн-сред, где требуется собственная логика проверки сертификатов, используйте свой `HttpClient` с настроенным обработчиком `ServerCertificateCustomValidationCallback`:

```csharp
using System.Net;
using System.Net.Security;
using ClickHouse.Driver.ADO;

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

using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

:::note
Важные замечания при передаче собственного HttpClient

* **Автоматическая декомпрессия**: необходимо включить `AutomaticDecompression`, если сжатие не отключено (по умолчанию сжатие включено).
* **Тайм-аут простоя**: установите `PooledConnectionIdleTimeout` меньше, чем `keep_alive_timeout` сервера (10 секунд для ClickHouse Cloud), чтобы избежать ошибок подключения из‑за полуоткрытых соединений.
  :::


## Поддержка ORM {#orm-support}

### Dapper {#orm-support-dapper}

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


### Linq2db {#orm-support-linq2db}

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


### Entity framework core {#orm-support-ef-core}

Entity Framework Core на данный момент не поддерживается.

## Ограничения {#limitations}

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