---
description: 'ClickHouse C++ 客户端库及与 u-server 框架集成的文档'
sidebar_label: 'C++'
sidebar_position: 24
slug: /interfaces/cpp
title: 'C++ 客户端库'
doc_type: 'reference'
---

# C++ 客户端库 \{#c-client-library\}

`clickhouse-cpp` 是 ClickHouse 的官方 C++ 客户端库，基于其原生二进制协议为 ClickHouse 提供快速且类型安全的接口。

构建说明、使用示例以及更多文档可在项目的 GitHub 仓库中获取：[https://github.com/ClickHouse/clickhouse-cpp](https://github.com/ClickHouse/clickhouse-cpp)。 

:::note
该库仍在积极开发中。虽然它已经支持 ClickHouse 的核心功能，但某些特性和数据类型可能尚未完全实现或支持。

您的反馈非常宝贵，有助于确定新特性和改进的优先级。如果您遇到限制、缺失的功能或意外行为，请通过问题跟踪器提交您的观察或功能请求：
[https://github.com/ClickHouse/clickhouse-cpp/issues](https://github.com/ClickHouse/clickhouse-cpp/issues)
:::

## 在项目中引入该库 \{#including-library-into-project\}

将该库集成到项目中最简单的方法是使用 CMake 的 `FetchContent` 模块。通过这种方式，可以固定库的精确版本，并将其作为常规 CMake 工作流程的一部分进行构建。

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

`WITH_OPENSSL` 选项会在该库中启用 TLS 支持，并且在连接到 ClickHouse Cloud 或其他启用 SSL 的 ClickHouse 部署时是必需的。对于非 TLS 连接，可以省略该选项，但通常仍建议启用它。

构建带有 SSL 支持的版本需要先安装 OpenSSL 开发包。在 Debian、Ubuntu 或其衍生发行版上安装 `libssl-dev`；在 Fedora、Red Hat 上安装 `openssl-devel`；在 macOS 上通过 homebrew 安装 `openssl`。

在安装好所需依赖后，将你的目标与导出的库目标进行链接：`

```cmake
target_link_libraries(your-target PRIVATE clickhouse-cpp-lib)
```


## 示例 \{#examples\}

### 设置客户端对象 \{#example-setup-client\}

创建一个 `Client` 实例以与 ClickHouse 建立连接。下面的示例展示如何连接到本地 ClickHouse 实例，该实例无需密码且未启用 SSL。

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{clickhouse::ClientOptions().SetHost("localhost")};
```

在更高级的部署场景下，需要进行额外配置。下面的示例演示了如何使用若干额外参数连接到 ClickHouse Cloud 实例：

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


### 在无返回数据的情况下创建表并执行查询 \{#example-create-table\}

要执行不返回任何数据的查询（例如创建表），请使用 `Execute` 方法。
同样的方法也适用于其他语句，例如 `ALTER TABLE`、`DROP` 等。

```cpp
client.Execute(R"(
    CREATE TABLE IF NOT EXISTS greetings (
        id UInt64,
        message String,
        language String) 
    ENGINE = MergeTree ORDER BY id)");
```


### 插入数据 \{#example-insert-data\}

要向表中插入数据，先构造一个 `Block`，并使用与表结构匹配的列对象来填充它。数据会按列追加，然后通过一次操作，使用经过优化的 `Insert` 方法插入，以实现高效的批量写入。

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


### 选择数据 \{#example-select\}

要执行返回数据的查询，请使用 `Select` 方法，并提供一个回调函数来处理结果。查询结果会以 `Block` 对象的形式返回，反映 ClickHouse 原生的列式数据表示方式。

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


## 支持的数据类型 \{#supported-data-types\}

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
- `LowCardinality(String)` 和 `LowCardinality(FixedString(N))`
- `Nullable(T)`
- `Array(T)`
- `Tuple`
- `Map`
- `IPv4`, `IPv6`
- `Point`, `Ring`, `Polygon`, `MultiPolygon`