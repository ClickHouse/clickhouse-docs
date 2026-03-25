---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'ClickHouse 的 Go 客户端允许你通过 Go 标准库的 database/sql 接口或经过优化的原生接口连接到 ClickHouse。'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go \{#clickhouse-go\}

## 快速开始 \{#quick-start\}

让我们从一个简单示例开始。这将连接到 ClickHouse，并从 `system` 数据库中执行查询。要开始操作，您需要准备好连接信息。

### 连接详细信息 \{#connection-details\}

<ConnectionDetails />

### 初始化模块 \{#initialize-a-module\}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### 复制一些示例代码 \{#copy-in-some-sample-code\}

将此代码复制到 `clickhouse-golang-example` 目录中，保存为 `main.go`。

```go title=main.go
package main

import (
    "context"
    "crypto/tls"
    "fmt"
    "log"

    "github.com/ClickHouse/clickhouse-go/v2"
    "github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func main() {
    conn, err := connect()
    if err != nil {
        panic(err)
    }

    ctx := context.Background()
    rows, err := conn.Query(ctx, "SELECT name, toString(uuid) as uuid_str FROM system.tables LIMIT 5")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    for rows.Next() {
        var name, uuid string
        if err := rows.Scan(&name, &uuid); err != nil {
            log.Fatal(err)
        }
        log.Printf("name: %s, uuid: %s", name, uuid)
    }

    // NOTE: Do not skip rows.Err() check
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }

}

func connect() (driver.Conn, error) {
    var (
        ctx       = context.Background()
        conn, err = clickhouse.Open(&clickhouse.Options{
            Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
            Auth: clickhouse.Auth{
                Database: "default",
                Username: "default",
                Password: "<DEFAULT_USER_PASSWORD>",
            },
            ClientInfo: clickhouse.ClientInfo{
                Products: []struct {
                    Name    string
                    Version string
                }{
                    {Name: "an-example-go-client", Version: "0.1"},
                },
            },
            Debugf: func(format string, v ...interface{}) {
                fmt.Printf(format, v)
            },
            TLS: &tls.Config{
                InsecureSkipVerify: true,
            },
        })
    )

    if err != nil {
        return nil, err
    }

    if err := conn.Ping(ctx); err != nil {
        if exception, ok := err.(*clickhouse.Exception); ok {
            fmt.Printf("Exception [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
        }
        return nil, err
    }
    return conn, nil
}
```


### 运行 go mod tidy \{#run-go-mod-tidy\}

```bash
go mod tidy
```

### 设置连接信息 \{#set-your-connection-details\}

此前您已经获取了连接信息。现在在 `main.go` 的 `connect()` 函数中进行设置：

```go
func connect() (driver.Conn, error) {
  var (
    ctx       = context.Background()
    conn, err = clickhouse.Open(&clickhouse.Options{
    #highlight-next-line
      Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
      Auth: clickhouse.Auth{
    #highlight-start
        Database: "default",
        Username: "default",
        Password: "<DEFAULT_USER_PASSWORD>",
    #highlight-end
      },
```

### 运行示例 \{#run-the-example\}

```bash
go run .
```

```response
2023/03/06 14:18:33 name: COLUMNS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: SCHEMATA, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: TABLES, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: VIEWS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: hourly_data, uuid: a4e36bd4-1e82-45b3-be77-74a0fe65c52b
```

### 进一步了解 \{#learn-more\}

本类别其余文档将详细介绍 ClickHouse Go 客户端。

## 概述 \{#overview\}

ClickHouse 提供两个官方的 Go 客户端。这两个客户端互为补充，并有意针对不同的使用场景。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - 高级语言客户端，支持 Go 标准的 `database/sql` 接口或原生 ClickHouse API。
* [ch-go](https://github.com/ClickHouse/ch-go) - 底层客户端，仅支持原生接口。

clickhouse-go 提供了一个高级接口，允许用户使用面向行的语义和批处理来查询和插入数据，并在数据类型上具有一定宽容度——只要不会造成精度损失，值就会被转换。与此同时，ch-go 提供了经过优化的面向列接口，可以在类型更严格、使用更复杂的前提下，以较低的 CPU 和内存开销实现数据块的高速流式传输。

从 2.3 版本开始，clickhouse-go 在编码、解码和压缩等底层功能上使用 ch-go。两个客户端在编码时都使用原生格式，以提供最佳性能，并可以通过原生 ClickHouse 协议进行通信。对于需要对流量进行代理或负载均衡的场景，clickhouse-go 也支持使用 HTTP 作为传输机制。

### 四种连接方式 \{#four-ways-to-connect\}

clickhouse-go 提供两个彼此独立的选择：**使用哪种 API**以及**使用哪种传输方式**。两者组合后共有四种连接模式：

|                                                | **TCP** (原生协议，端口 9000/9440)  |    **HTTP** (端口 8123/8443)     |
| :--------------------------------------------- | :--------------------------: | :----------------------------: |
| **ClickHouse API** (`clickhouse.Open`)         |          默认值 — 性能最佳          | 设置 `Protocol: clickhouse.HTTP` |
| **`database/sql` API** (`OpenDB` / `sql.Open`) |   `clickhouse://host:9000`   |       `http://host:8123`       |

**选择 API：**如果需要最高性能和完整功能集 (进度回调、列式插入、丰富的类型支持) ，请选择 ClickHouse API。如果需要与 ORM 或依赖标准 Go 数据库接口的工具集成，请选择 `database/sql`。

**选择传输方式：**TCP 更快，也是默认选项。当基础设施要求使用 HTTP 时，请切换到 HTTP——例如，需要通过 HTTP 负载均衡器或代理连接时，或者需要 HTTP 特有功能时，例如带临时表的会话，或额外的压缩算法 (`gzip`、`deflate`、`br`) 。

无论使用哪种传输方式，这两种 API 都使用原生二进制编码，因此 HTTP 不会带来额外的序列化开销。

|                    | 原生格式 | TCP 传输 | HTTP 传输 | 批量写入 | 结构体封送 |  压缩 | 进度回调 |
| :----------------: | :--: | :----: | :-----: | :--: | :---: | :-: | :--: |
|   ClickHouse API   |   ✅  |    ✅   |    ✅    |   ✅  |   ✅   |  ✅  |   ✅  |
| `database/sql` API |   ✅  |    ✅   |    ✅    |   ✅  |       |  ✅  |      |

### 选择客户端 \{#choosing-a-client\}

选择客户端库取决于你的使用模式以及对性能的要求。对于写入量极大的场景 (例如每秒需要进行数百万次插入) ，我们推荐使用底层客户端 [ch-go](https://github.com/ClickHouse/ch-go)。该客户端避免了按 ClickHouse 原生格式要求，将数据从行式格式转换为列式格式所带来的额外开销。此外，它也避免了任何反射机制或使用 `interface{}` (`any`) 类型，从而简化了使用。

对于以聚合查询为主，或插入吞吐量要求较低的工作负载，[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) 提供了熟悉的 `database/sql` 接口以及更直观的行语义。你也可以选择使用 HTTP 作为传输协议，并利用辅助函数在行与 struct 之间进行编组和解编组 (marshal/unmarshal) 。

|               | 原生格式 | 原生协议 | HTTP 协议 | 行式 API | 列式 API | 类型灵活性 |  压缩 | 查询占位符 |
| :-----------: | :--: | :--: | :-----: | :----: | :----: | :---: | :-: | :---: |
| clickhouse-go |   ✅  |   ✅  |    ✅    |    ✅   |    ✅   |   ✅   |  ✅  |   ✅   |
|     ch-go     |   ✅  |   ✅  |         |        |    ✅   |       |  ✅  |       |

## 安装 \{#installation\}

驱动程序的 v1 版本已被弃用，将不再收到新功能更新或对新增 ClickHouse 类型的支持。建议迁移到 v2，其性能更优。

要安装 2.x 版本的客户端，请在 go.mod 文件中添加该包：

`require github.com/ClickHouse/clickhouse-go/v2 main`

或者克隆该仓库：

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

要安装其他版本，请相应修改路径或分支名称。

```bash
mkdir my-clickhouse-app && cd my-clickhouse-app

cat > go.mod <<-END
  module my-clickhouse-app

  go 1.21

  require github.com/ClickHouse/clickhouse-go/v2 main
END

cat > main.go <<-END
  package main

  import (
    "fmt"
    "github.com/ClickHouse/clickhouse-go/v2"
  )

  func main() {
   conn, _ := clickhouse.Open(&clickhouse.Options{Addr: []string{"127.0.0.1:9000"}})
    v, _ := conn.ServerVersion()
    fmt.Println(v.String())
  }
END

go mod tidy
go run main.go

```


### 版本管理 \{#versioning\}

该客户端的发布独立于 ClickHouse。2.x 是当前开发中的主版本分支。所有 2.x 版本之间都应保持相互兼容。

#### ClickHouse 兼容性 \{#clickhouse-compatibility\}

客户端支持：

- [此处](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)记录的所有当前仍受支持的 ClickHouse 版本。一旦某些 ClickHouse 版本不再受支持，也将不再针对客户端新版本进行主动测试。
- 自客户端发布日期起 2 年内的所有 ClickHouse 版本。注意：仅对 LTS 版本进行主动测试。

#### Golang 兼容性 \{#golang-compatibility\}

|         客户端版本        |  Golang 版本 |
| :------------------: | :--------: |
|  =&gt; 2.0 &lt;= 2.2 | 1.17, 1.18 |
| &gt;= 2.3, &lt; 2.41 |    1.18+   |
|      &gt;= 2.41      |    1.21+   |
|      &gt;= 2.43      |    1.24+   |

## 最佳实践 \{#best-practices\}

* 在可能的情况下使用 ClickHouse API，尤其是针对基本类型 (primitive types) 。这可以避免大量的反射和间接调用。
* 如果要读取大型数据集，考虑调整 [`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings)。这会增加内存占用，但在行迭代期间可以让更多数据块并行解码。默认值 2 较为保守，可将内存开销降至最低。更高的数值意味着会有更多数据块驻留在内存中。由于不同查询可能产生不同的数据块大小，因此需要进行测试。你也可以通过 Context 在[查询级别](/integrations/language-clients/go/clickhouse-api#using-context)进行设置。
* 在插入数据时尽可能明确指定类型。尽管客户端旨在保持灵活性，例如允许将字符串解析为 UUID 或 IP，但这需要进行数据校验，并在插入时带来额外开销。
* 在可能的情况下使用按列 (列式) 的插入方式。同样地，这些列应为强类型，从而避免客户端对你的值进行类型转换。
* 遵循 ClickHouse 关于插入性能优化的[建议](/sql-reference/statements/insert-into/#performance-considerations)，以获得最佳插入性能。

## 后续步骤 \{#next-steps\}

* [配置](/integrations/language-clients/go/configuration) — 连接设置、TLS、身份验证、日志配置、压缩
* [ClickHouse API](/integrations/language-clients/go/clickhouse-api) — 用于查询和插入的原生 Go API
* [Database/SQL API](/integrations/language-clients/go/database-sql-api) — 标准 `database/sql` 接口
* [数据类型](/integrations/language-clients/go/data-types) — Go 类型映射和复杂类型支持