---
description: 'Документация по клиентской библиотеке C++ для ClickHouse и интеграции
  с фреймворком u-server'
sidebar_label: 'C++'
sidebar_position: 24
slug: /interfaces/cpp
title: 'Клиентская библиотека C++'
doc_type: 'reference'
---

# Клиентская библиотека C++ {#c-client-library}

`clickhouse-cpp` — это официальная клиентская библиотека C++ для ClickHouse, обеспечивающая
быстрый и типобезопасный интерфейс к ClickHouse с использованием его нативного бинарного протокола.

Инструкции по сборке, примеры использования и дополнительная документация доступны в репозитории
проекта на GitHub: [https://github.com/ClickHouse/clickhouse-cpp](https://github.com/ClickHouse/clickhouse-cpp). 

:::note
Библиотека активно развивается. Хотя она уже поддерживает основную функциональность
ClickHouse, некоторые возможности и типы данных могут пока ещё быть не полностью реализованы или поддерживаться не в полном объёме.

Ваши отзывы чрезвычайно важны и помогают расставлять приоритеты для разработки новых возможностей и
улучшений. Если вы столкнётесь с ограничениями, отсутствующей функциональностью или неожиданным
поведением, пожалуйста, поделитесь своими наблюдениями или запросами новых функций через трекер
задач по адресу [https://github.com/ClickHouse/clickhouse-cpp/issues](https://github.com/ClickHouse/clickhouse-cpp/issues)
:::

## Подключение библиотеки к вашему проекту {#including-library-into-project}

Самый простой способ добавить библиотеку в проект — использовать модуль CMake `FetchContent`.
Этот подход позволяет зафиксировать точную версию библиотеки и собирать её как часть обычного
процесса сборки в CMake.

```cmake
include(FetchContent)

set(WITH_OPENSSL YES CACHE BOOL "Enable OpenSSL in clickhouse-cpp" FORCE)
FetchContent_Declare(
    clickhouse-cpp
    GIT_REPOSITORY https://github.com/ClickHouse/clickhouse-cpp.git
    GIT_TAG v2.6.0   # can also be `master` or other banch
)
FetchContent_MakeAvailable(clickhouse-cpp)
```

Опция `WITH_OPENSSL` включает поддержку TLS в библиотеке и необходима при подключении к
ClickHouse Cloud или к другим инсталляциям ClickHouse с поддержкой SSL. Хотя её можно не использовать для подключений без TLS,
в целом рекомендуется оставлять её включённой.

Сборка с поддержкой SSL требует наличия установленных пакетов разработки OpenSSL. Установите
`libssl-dev` в Debian, Ubuntu или их производных; `openssl-devel` для Fedora, Red Hat; или
`openssl` на macOS с помощью Homebrew.

После того как зависимость станет доступна, скомпонуйте вашу цель с экспортируемой библиотечной целью:

```cmake
target_link_libraries(your-target PRIVATE clickhouse-cpp-lib)
```


## Примеры {#examples}

### Настройка клиентского объекта {#example-setup-client}

Создайте экземпляр `Client`, чтобы установить соединение с ClickHouse. В следующем примере
показано подключение к локальному экземпляру ClickHouse, где пароль не требуется и SSL
не используется.

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{clickhouse::ClientOptions().SetHost("localhost")};
```

В более сложных конфигурациях требуется дополнительная настройка. В следующем примере показано подключение к экземпляру ClickHouse Cloud с использованием нескольких дополнительных параметров:

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{
    clickhouse::ClientOptions{}
      .SetHost("your.instance.clickhouse.cloud")
      .SetUser("default")
      .SetPassword("your-password")
      .SetSSLOptions({})   // Enable SSL
      .SetPort(9440)       // for connections over SSL ClickHouse Cloud uses port 9440
    };
```


### Создание таблиц и выполнение запросов без данных {#example-create-table}

Чтобы выполнить запрос, который не возвращает данные, например для создания таблиц, используйте метод `Execute`.
Аналогичный подход применяется к другим командам, таким как `ALTER TABLE`, `DROP` и т. д.

```cpp
client.Execute(R"(
    CREATE TABLE IF NOT EXISTS greetings (
        id UInt64,
        message String,
        language String) 
    ENGINE = MergeTree ORDER BY id)");
```


### Вставка данных {#example-insert-data}

Чтобы вставить данные в таблицу, создайте объект `Block` и заполните его объектами столбцов, которые соответствуют
схеме таблицы. Данные добавляются по столбцам, а затем вставляются одной операцией с помощью метода
`Insert`, который оптимизирован для эффективной пакетной записи.

```cpp
auto id = std::make_shared<clickhouse::ColumnUInt64>();
auto message = std::make_shared<clickhouse::ColumnString>();
auto language = std::make_shared<clickhouse::ColumnString>();

id->Append(1);
message->Append("Hello, World!");
language->Append("English");

id->Append(2);
message->Append("¡Hola, Mundo!");
language->Append("Spanish");

id->Append(3);
message->Append("Hallo wereld!");
language->Append("Dutch");

clickhouse::Block block{};
block.AppendColumn("id", id);
block.AppendColumn("message", message);
block.AppendColumn("language", language);

client.Insert("greetings", block);
```


### Выбор данных {#example-select}

Чтобы выполнить запрос, который возвращает данные, используйте метод `Select` и передайте функцию обратного вызова для обработки результата. Результаты запроса возвращаются в виде объектов `Block`, отражающих нативное столбцовое представление данных в ClickHouse.

```cpp
client.Select(
    "SELECT id, message, language FROM greetings",
    [](const clickhouse::Block & block){
        for (size_t i = 0; i < block.GetRowCount(); ++i) {
            auto id = block[0]->AsStrict<clickhouse::ColumnUInt64>()->At(i);
            auto message = block[1]->AsStrict<clickhouse::ColumnString>()->At(i);
            auto language = block[2]->AsStrict<clickhouse::ColumnString>()->At(i);
            std::cout << id << "\t" << message << "\t" << language << "\n";
        }
    });
```


## Поддерживаемые типы данных {#supported-data-types}

- `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64`
- `UInt128`, `Int128`
- `Decimal32`, `Decimal64`, `Decimal128`
- `Float32`, `Float64`
- `Date`
- `DateTime`, `DateTime64`
- `DateTime([timezone])`, `DateTime64(N, [timezone])`
- `UUID`
- `Enum8`, `Enum16`
- `String`
- `FixedString(N)`
- `LowCardinality(String)` и `LowCardinality(FixedString(N))`
- `Nullable(T)`
- `Array(T)`
- `Tuple`
- `Map`
- `IPv4`, `IPv6`
- `Point`, `Ring`, `Polygon`, `MultiPolygon`