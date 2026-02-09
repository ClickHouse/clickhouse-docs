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

## 一个简单示例 \{#a-simple-example\}

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

## ClickHouse Go 客户端 \{#clickhouse-go-client\}

ClickHouse 提供两个官方的 Go 客户端。这两个客户端互为补充，并有意针对不同的使用场景。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - 高级客户端，支持 Go 标准的 `database/sql` 接口或原生接口。
* [ch-go](https://github.com/ClickHouse/ch-go) - 底层客户端，仅支持原生接口。

clickhouse-go 提供了一个高级接口，允许用户使用面向行的语义和批处理来查询和插入数据，并在数据类型上具有一定宽容度——只要不会造成精度损失，值就会被转换。与此同时，ch-go 提供了经过优化的面向列接口，可以在类型更严格、使用更复杂的前提下，以较低的 CPU 和内存开销实现数据块的高速流式传输。

从 2.3 版本开始，clickhouse-go 在编码、解码和压缩等底层功能上使用 ch-go。请注意，clickhouse-go 还支持 Go 标准的 `database/sql` 接口。两个客户端在编码时都使用原生格式，以提供最佳性能，并可以通过原生 ClickHouse 协议进行通信。对于需要对流量进行代理或负载均衡的场景，clickhouse-go 也支持使用 HTTP 作为传输机制。

在选择客户端库时，应当了解每个客户端库各自的优缺点。有关指导，请参阅[《Choosing a Library》](/integrations/go#choosing-a-client)。

|               | 原生格式 | 原生协议 | HTTP 协议 | 行导向 API | 列导向 API | 类型灵活性 | 压缩 | 查询占位符 |
|:-------------:|:--------:|:--------:|:---------:|:----------:|:----------:|:----------:|:----:|:----------:|
| clickhouse-go |    ✅     |    ✅     |     ✅     |     ✅      |     ✅      |     ✅      |  ✅  |     ✅      |
|     ch-go     |    ✅     |    ✅     |           |            |     ✅      |            |  ✅  |            |

## 选择客户端 \{#choosing-a-client\}

选择客户端库取决于你的使用模式以及对性能的要求。对于写入量极大的场景（例如每秒需要进行数百万次插入），我们推荐使用低层级客户端 [ch-go](https://github.com/ClickHouse/ch-go)。该客户端避免了按 ClickHouse 原生格式要求，将数据从行式格式转换为列式格式所带来的额外开销。此外，它也避免了任何反射机制或使用 `interface{}`（`any`）类型，从而简化了使用。

对于以聚合查询为主，或插入吞吐量要求较低的工作负载，[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) 提供了熟悉的 `database/sql` 接口以及更直观的行语义。你也可以选择使用 HTTP 作为传输协议，并利用辅助函数在行与 struct 之间进行编组和解编组（marshal/unmarshal）。

## clickhouse-go 客户端 \{#the-clickhouse-go-client\}

clickhouse-go 客户端提供了两种与 ClickHouse 通信的 API 接口：

* ClickHouse 客户端专用 API
* `database/sql` 标准——由 Go 语言提供的、面向 SQL 数据库的通用接口。

尽管 `database/sql` 提供了与具体数据库无关的接口，使开发者可以抽象其数据存储，但它强加了一些类型和查询语义上的约束，可能会影响性能。因此，在[对性能有较高要求](https://github.com/clickHouse/clickHouse-go#benchmark)的场景下，应优先使用客户端专用 API。不过，希望将 ClickHouse 集成到支持多种数据库的工具中的用户，则可能更倾向于使用该标准接口。

这两种接口都使用 [native format](/native-protocol/basics.md) 和原生协议进行通信。此外，标准接口还支持通过 HTTP 进行通信。

|                    | 原生格式（Native format） | 原生协议（Native protocol） | HTTP 协议（HTTP protocol） | 批量写入支持（Bulk write support） | 结构体编解码（Struct marshaling） | 压缩（Compression） | 查询占位符（Query Placeholders） |
|:------------------:|:------------------------:|:---------------------------:|:---------------------------:|:----------------------------------:|:---------------------------------:|:-------------------:|:--------------------------------:|
|   ClickHouse API   |            ✅             |              ✅              |                             |                 ✅                  |                 ✅                 |          ✅          |                ✅                 |
| `database/sql` API |            ✅             |              ✅              |              ✅              |                 ✅                  |                                     |          ✅          |                ✅                 |

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

  go 1.18

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


### 版本管理与兼容性 \{#versioning--compatibility\}

该客户端的发布独立于 ClickHouse。2.x 是当前开发中的主版本分支。所有 2.x 版本之间都应保持相互兼容。

#### ClickHouse 兼容性 \{#clickhouse-compatibility\}

客户端支持：

- [此处](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)记录的所有当前仍受支持的 ClickHouse 版本。一旦某些 ClickHouse 版本不再受支持，也将不再针对客户端新版本进行主动测试。
- 自客户端发布日期起 2 年内的所有 ClickHouse 版本。注意：仅对 LTS 版本进行主动测试。

#### Golang 兼容性 \{#golang-compatibility\}

| 客户端版本 | Golang 版本 |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |

## ClickHouse 客户端 API \{#clickhouse-client-api\}

所有 ClickHouse 客户端 API 的代码示例都可以在[此处](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)找到。

### 连接 \{#connecting\}

下面的示例（返回服务器版本）演示了如何连接到 ClickHouse，假设 ClickHouse 未启用安全配置，并且可以使用默认用户进行访问。

注意，这里使用的是默认的原生端口进行连接。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
fmt.Println(v)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**在后续所有示例中，除非特别说明，否则都假定 ClickHouse 的 `conn` 变量已创建并可用。**

#### 连接设置 \{#connection-settings\}

在建立连接时，可以使用一个 Options 结构体来控制客户端行为。可用的设置如下：

* `Protocol` - 协议，可以是 Native 或 HTTP。当前仅在 [database/sql API](#databasesql-api) 中支持 HTTP。
* `TLS` - TLS 选项。非 nil 值会启用 TLS。参见 [Using TLS](#using-tls)。
* `Addr` - 地址切片（slice），每个地址都包含端口。
* `Auth` - 认证详细信息。参见 [Authentication](#authentication)。
* `DialContext` - 自定义拨号函数，用于决定如何建立连接。
* `Debug` - true/false，用于启用调试。
* `Debugf` - 提供一个函数来处理调试输出。需要将 `debug` 设置为 true。
* `Settings` - ClickHouse 设置的映射。这些设置会应用到所有 ClickHouse 查询上。[Using Context](#using-context) 允许按查询设置配置。
* `Compression` - 启用数据块压缩。参见 [Compression](#compression)。
* `DialTimeout` - 建立连接的最长时间。默认为 `1s`。
* `MaxOpenConns` - 任意时刻可用的最大连接数。空闲连接池中可能有更多或更少的连接，但在任意时刻只能使用该数量的连接。默认值为 `MaxIdleConns+5`。
* `MaxIdleConns` - 连接池中要保持的连接数量。如果可能，这些连接会被重用。默认值为 `5`。
* `ConnMaxLifetime` - 连接可用的最长生命周期。默认为 1 小时。连接在该时间之后会被销毁，并根据需要将新连接加入连接池。
* `ConnOpenStrategy` - 决定如何使用节点地址列表并据此打开连接。参见 [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)。
* `BlockBufferSize` - 一次解码到缓冲区中的最大数据块数量。更大的值会在消耗更多内存的代价下提升并行度。数据块大小依赖于查询，因此虽然可以在连接级别设置该值，但建议根据查询返回的数据在每个查询上单独覆盖它。默认值为 `2`。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
        dialCount++
        var d net.Dialer
        return d.DialContext(ctx, "tcp", addr)
    },
    Debug: true,
    Debugf: func(format string, v ...interface{}) {
        fmt.Printf(format, v)
    },
    Settings: clickhouse.Settings{
        "max_execution_time": 60,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionLZ4,
    },
    DialTimeout:      time.Duration(10) * time.Second,
    MaxOpenConns:     5,
    MaxIdleConns:     5,
    ConnMaxLifetime:  time.Duration(10) * time.Minute,
    ConnOpenStrategy: clickhouse.ConnOpenInOrder,
    BlockBufferSize: 10,
})
if err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)

#### 连接池 \{#connection-pooling\}

客户端维护一个连接池，并根据需要在查询之间复用这些连接。任意时刻最多会使用 `MaxOpenConns` 个连接，连接池的最大容量由 `MaxIdleConns` 控制。客户端在每次执行查询时都会从池中获取一个连接，在查询完成后将其归还到池中以便复用。单个连接会在整个批处理的生命周期内被占用，并在调用 `Send()` 后释放。

无法保证池中的同一连接会被用于后续查询，除非用户设置 `MaxOpenConns=1`。这种需求较为少见，但在使用临时表的场景下可能是必需的。

另外请注意，`ConnMaxLifetime` 的默认值为 1 小时。如果节点离开集群，这可能会导致发送到 ClickHouse 的负载出现不均衡。当某个节点不可用时，连接会被分配到其他节点。这些连接会持续存在，且在默认情况下 1 小时内不会被刷新，即使出现问题的节点已经重新加入集群也是如此。在高负载场景下，建议考虑适当降低该值。

在 Native（TCP）和 HTTP 协议下均启用连接池。

### 使用 TLS \{#using-tls\}

在底层，所有客户端连接方法（`DSN/OpenDB/Open`）都会使用 [Go 的 tls 包](https://pkg.go.dev/crypto/tls) 来建立安全连接。如果 Options 结构体中包含一个非 nil 的 `tls.Config` 指针，客户端就会知道需要使用 TLS。

```go
env, err := GetNativeTestEnvironment()
if err != nil {
    return err
}
cwd, err := os.Getwd()
if err != nil {
    return err
}
t := &tls.Config{}
caCert, err := ioutil.ReadFile(path.Join(cwd, "../../tests/resources/CAroot.crt"))
if err != nil {
    return err
}
caCertPool := x509.NewCertPool()
successful := caCertPool.AppendCertsFromPEM(caCert)
if !successful {
    return err
}
t.RootCAs = caCertPool
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: t,
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

这个最精简的 `TLS.Config` 通常足以连接到 ClickHouse 服务器上的安全原生端口（通常为 9440）。如果 ClickHouse 服务器没有有效证书（证书过期、主机名不匹配、未由公众认可的根证书颁发机构签署），可以将 `InsecureSkipVerify` 设为 true，但强烈不建议这样做。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: &tls.Config{
        InsecureSkipVerify: true,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

如果需要额外的 TLS 参数，应用代码应在 `tls.Config` 结构体中设置相应字段。这可以包括指定密码套件、强制使用特定 TLS 版本（如 1.2 或 1.3）、添加内部 CA 证书链、在 ClickHouse 服务器要求时添加客户端证书（及其私钥），以及大多数用于更高级安全配置的其他选项。

### 认证 \{#authentication\}

在连接配置中通过指定 Auth 结构体来设置用户名和密码。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}

v, err := conn.ServerVersion()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

### 连接到多个节点 \{#connecting-to-multiple-nodes\}

可以通过 `Addr` 结构指定多个地址。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

提供两种连接策略：

* `ConnOpenInOrder`（默认） - 按顺序依次尝试这些地址。只有在无法使用列表中较前的地址建立连接时，才会使用后面的地址。这实际上是一种故障切换（failover）策略。
* `ConnOpenRoundRobin` - 使用轮询策略在多个地址之间均衡负载。

可以通过选项 `ConnOpenStrategy` 来控制这一行为。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:             []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)

### 执行 \{#execution\}

可以通过 `Exec` 方法执行任意语句。这对于 DDL 和简单语句非常有用，但不应将其用于大批量插入或循环执行查询。

```go
conn.Exec(context.Background(), `DROP TABLE IF EXISTS example`)
err = conn.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
conn.Exec(context.Background(), "INSERT INTO example VALUES (1, 'test-1')")
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

注意可以将 Context 传递给查询。这可以用于传入特定的查询级别设置——参见[使用 Context](#using-context)。

### 批量插入 \{#batch-insert\}

为了插入大量行，客户端提供了批处理语义。需要先准备一个批处理对象，然后可以向其中追加多行数据。最后通过 `Send()` 方法发送该批处理。在执行 `Send` 之前，批处理会保存在内存中。

建议对批处理调用 `Close` 以防止连接泄漏。可以在创建批处理后配合 `defer` 关键字来实现这一点。如果从未调用 `Send`，这将清理连接。请注意，如果没有追加任何行，此时查询日志中只会显示插入 0 行的记录。

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE IF NOT EXISTS example (
            Col1 UInt8
        , Col2 String
        , Col3 FixedString(3)
        , Col4 UUID
        , Col5 Map(String, UInt8)
        , Col6 Array(String)
        , Col7 Tuple(String, UInt8, Array(Map(String, String)))
        , Col8 DateTime
    ) Engine = Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        uint8(42),
        "ClickHouse",
        "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                {"key": "value"},
                {"key": "value"},
                {"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}

return batch.Send()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

针对 ClickHouse 的推荐做法同样适用于[此处](/guides/inserting-data#best-practices-for-inserts)。批次（batch）不应在多个 goroutine 之间共享——每个 goroutine 都应构造各自独立的 batch。

从上面的示例可以看出，在追加行数据时，变量类型需要与列类型保持一致。虽然类型映射通常是显而易见的，但该接口尽量保持灵活，只要不会产生精度损失，就会进行类型转换。例如，下面的示例演示了将字符串插入到 DateTime64 列中。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        "2006-01-02 15:04:05.999",
    )
    if err != nil {
        return err
    }
}

return batch.Send()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

若要查看每种列类型所支持的 Go 类型的完整说明，请参阅 [类型转换](#type-conversions)。

### 查询行 \{#querying-rows\}

用户可以使用 `QueryRow` 方法查询单行，或通过 `Query` 获取用于遍历结果集的游标。前者接收一个用于存放结果数据的目标变量，而后者则需要对每一行调用 `Scan`。

```go
row := conn.QueryRow(context.Background(), "SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             []interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

```go
rows, err := conn.Query(ctx, "SELECT Col1, Col2, Col3 FROM example WHERE Col1 >= 2")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", col1, col2, col3)
}
rows.Close()
return rows.Err()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

注意在这两种情况下，我们都需要传入变量的指针，以便将对应列的值反序列化到这些变量中。它们必须按照 `SELECT` 语句中指定的顺序传入——默认情况下，如果像上面示例那样使用 `SELECT *`，则会使用列声明的顺序。

与插入操作类似，`Scan` 方法要求目标变量使用合适的类型。该方法同样尽量保持灵活，只要不会产生精度损失，就会在可能的情况下进行类型转换，例如，上述示例展示了将一个 UUID 列读取到字符串变量中。有关每种列类型所支持的 Go 类型的完整列表，请参阅 [类型转换](#type-conversions)。

最后，请注意可以向 `Query` 和 `QueryRow` 方法传入 `Context`。这可用于配置查询级别的设置——更多详情请参阅 [使用 Context](#using-context)。


### 异步插入 \{#async-insert\}

支持通过 Async 方法进行异步插入。它允许用户指定客户端是应等待服务器完成插入操作，还是在服务器接收数据后立即返回响应。这实际上控制了参数 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert)。

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 21, 12, 0); err != nil {
    return nil
}
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, `DROP TABLE IF EXISTS example`)
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
`
if err := conn.Exec(ctx, ddl); err != nil {
    return err
}
for i := 0; i < 100; i++ {
    if err := conn.AsyncInsert(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
        %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
    )`, i, "Golang SQL 数据库驱动程序"), false); err != nil {
        return err
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

### 列式插入 \{#columnar-insert\}

可以按列格式执行插入操作。如果数据本身已经按这种列式结构组织，则无需再转换为行格式，从而带来性能优势。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var (
    col1 []uint64
    col2 []string
    col3 [][]uint8
    col4 []time.Time
)
for i := 0; i < 1_000; i++ {
    col1 = append(col1, uint64(i))
    col2 = append(col2, "Golang SQL 数据库驱动程序")
    col3 = append(col3, []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9})
    col4 = append(col4, time.Now())
}
if err := batch.Column(0).Append(col1); err != nil {
    return err
}
if err := batch.Column(1).Append(col2); err != nil {
    return err
}
if err := batch.Column(2).Append(col3); err != nil {
    return err
}
if err := batch.Column(3).Append(col4); err != nil {
    return err
}

return batch.Send()
```

[完整示例代码](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

### 使用结构体 \{#using-structs\}

对用户而言，Golang 的结构体为 ClickHouse 中的一行数据提供了逻辑表示。为此，原生接口提供了多种便捷函数来实现这一点。

#### 使用 serialize 的 Select \{#select-with-serialize\}

`Select` 方法允许在一次调用中将一组响应行序列化为结构体切片。

```go
var result []struct {
    Col1           uint8
    Col2           string
    ColumnWithName time.Time `ch:"Col3"`
}

if err = conn.Select(ctx, &result, "SELECT Col1, Col2, Col3 FROM example"); err != nil {
    return err
}

for _, v := range result {
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", v.Col1, v.Col2, v.ColumnWithName)
}
```

[完整示例代码](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

#### 扫描结构体 \{#scan-struct\}

`ScanStruct` 允许将查询结果中的单行 `Row` 映射到一个结构体中。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

#### 追加 struct \{#append-struct\}

`AppendStruct` 允许将一个 struct 追加到已有的[批次](#batch-insert)中，并将其视为一整行。要求该 struct 的字段在名称和类型上都与表的列一一对应。虽然所有列都必须有对应的 struct 字段，但某些 struct 字段可能没有对应的列表达形式。这些字段将会被直接忽略。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL 数据库驱动程序",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "此字段将被忽略",
    })
    if err != nil {
        return err
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 类型转换 \{#type-conversions\}

该客户端在接受用于插入和响应编组（marshaling）的变量类型方面，力求尽可能灵活。大多数情况下，ClickHouse 列类型都存在等价的 Golang 类型，例如，[UInt64](/sql-reference/data-types/int-uint/) 对应 [uint64](https://pkg.go.dev/builtin#uint64)。这些逻辑映射应始终得到支持。您可能希望使用某些变量类型，只要先对变量或接收的数据进行转换，就可以用于插入列或接收响应。客户端旨在透明地支持这些转换，从而使用户无需在插入前为精确对齐而显式转换数据，并在查询时提供灵活的编组能力。此类透明转换不允许出现精度损失。例如，`uint32` 不能用于从 `UInt64` 列接收数据。反之，只要满足格式要求，字符串就可以插入到 `DateTime64` 列中。

当前针对基础类型（primitive types）所支持的类型转换记录在[此处](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)。

相关工作仍在进行中，并且可分为插入阶段（`Append`/`AppendRow`）和读取阶段（通过 `Scan`）。如果您需要对某种特定转换的支持，请提交 issue 进行反馈。

### 复杂类型 \{#complex-types\}

#### Date/DateTime types \{#datedatetime-types\}

ClickHouse Go 客户端支持 `Date`、`Date32`、`DateTime` 和 `DateTime64` 日期 / 日期时间类型。日期既可以作为字符串按 `2006-01-02` 的格式插入，也可以使用原生 Go 的 `time.Time{}` 或 `sql.NullTime`。DateTime 同样支持后两种类型，但如果使用字符串，则需要按 `2006-01-02 15:04:05` 的格式传入，并可带有可选的时区偏移，例如 `2006-01-02 15:04:05 +08:00`。在读取时，`time.Time{}` 和 `sql.NullTime` 都受支持，同时也支持任何 `sql.Scanner` 接口的实现。

对时区信息的处理取决于 ClickHouse 类型以及该值是被插入还是被读取：

* **DateTime/DateTime64**
  * 在 **插入** 时，值会以 UNIX 时间戳格式发送到 ClickHouse。如果未提供时区，客户端将假定使用客户端的本地时区。`time.Time{}` 或 `sql.NullTime` 会相应地被转换为 epoch。
  * 在 **查询** 时，如果列设置了时区，则在返回 `time.Time` 值时会使用列的时区；如果没有设置，则使用服务器的时区。
* **Date/Date32**
  * 在 **插入** 时，在将日期转换为 UNIX 时间戳时会考虑其时区，即在以日期类型存储前会按时区进行偏移，因为在 ClickHouse 中 Date 类型不包含时区信息。如果在字符串值中未指定时区，则会使用本地时区。
  * 在 **查询** 时，扫描到 `time.Time{}` 或 `sql.NullTime{}` 实例的日期在返回时将不包含时区信息。

#### 数组 \{#array\}

数组应作为切片插入。元素的类型规则与[基础类型](#type-conversions)一致，即在可能的情况下会对元素进行类型转换。

在 Scan 时应提供指向切片的指针。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))},
        [][]int64{{i, i + 1}, {i + 2, i + 3}, {i + 4, i + 5}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []string
    col2 [][]int64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)


#### Map \{#map\}

`Map` 应作为 Go 语言的 `map` 插入，其键和值必须符合[前面](#type-conversions)定义的类型规则。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        map[string]uint64{strconv.Itoa(int(i)): uint64(i)},
        map[string][]string{strconv.Itoa(int(i)): {strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))}},
        map[string]map[string]uint64{strconv.Itoa(int(i)): {strconv.Itoa(int(i)): uint64(i)}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]uint64
    col2 map[string][]string
    col3 map[string]map[string]uint64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)


#### Tuples \{#tuples\}

Tuple 表示由任意数量的列组成的一组数据。列可以显式命名，也可以只指定类型，例如：

```sql
//未命名
Col1 Tuple(String, Int64)

//已命名
Col2 Tuple(name String, id Int64, age uint8)
```

在这些方式中，命名元组提供了更高的灵活性。未命名元组必须通过切片来插入和读取，而命名元组还可以与映射类型兼容。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Tuple(name String, age UInt8),
            Col2 Tuple(String, UInt8),
            Col3 Tuple(name String, id String)
        )
        Engine Memory
    `); err != nil {
    return err
}

defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

// 命名元组和未命名元组都可以通过切片添加。注意:如果所有元素类型相同,可以使用强类型列表和映射
if err = batch.Append([]interface{}{"Clicky McClickHouse", uint8(42)}, []interface{}{"Clicky McClickHouse Snr", uint8(78)}, []string{"Dale", "521211"}); err != nil {
    return err
}
if err = batch.Append(map[string]interface{}{"name": "Clicky McClickHouse Jnr", "age": uint8(20)}, []interface{}{"Baby Clicky McClickHouse", uint8(1)}, map[string]string{"name": "Geoff", "id": "12123"}); err != nil {
    return err
}
if err = batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]interface{}
    col2 []interface{}
    col3 map[string]string
)
// 命名元组可以检索为映射或切片,未命名元组只能检索为切片
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注意：支持带类型的切片和映射，前提是命名元组中提供的子列类型都相同。

#### 嵌套（Nested） \{#nested\}

嵌套字段等价于一个具名 Tuple 的数组。其用法取决于用户是否将 [flatten&#95;nested](/operations/settings/settings#flatten_nested) 设置为 1 或 0。

当将 flatten&#95;nested 设置为 0 时，Nested 列会保持为单个元组数组。这样用户可以使用 map 的切片进行插入和读取，并支持任意级别的嵌套。map 的键必须与列名相同，如下例所示。

注意：由于这些 map 表示的是一个 tuple，它们必须是 `map[string]interface{}` 类型。目前这些值没有强类型约束。

```go
conn, err := GetNativeConnection(clickhouse.Settings{
    "flatten_nested": 0,
}, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []map[string]interface{}{
            {
                "Col1_1": strconv.Itoa(int(i)),
                "Col1_2": uint8(i),
            },
            {
                "Col1_1": strconv.Itoa(int(i + 1)),
                "Col1_2": uint8(i + 1),
            },
            {
                "Col1_1": strconv.Itoa(int(i + 2)),
                "Col1_2": uint8(i + 2),
            },
        },
        []map[string]interface{}{
            {
                "Col2_2": []map[string]interface{}{
                    {
                        "Col2_2_1": uint8(i),
                        "Col2_2_2": uint8(i + 1),
                    },
                },
                "Col2_1": uint8(i),
            },
            {
                "Col2_2": []map[string]interface{}{
                    {
                        "Col2_2_1": uint8(i + 2),
                        "Col2_2_2": uint8(i + 3),
                    },
                },
                "Col2_1": uint8(i + 1),
            },
        },
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []map[string]interface{}
    col2 []map[string]interface{}
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[完整示例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

如果 `flatten_nested` 使用默认值 1，嵌套列会被扁平化为多个独立数组。这要求在插入和查询时使用嵌套切片。尽管任意层级的嵌套在实践中可能可行，但这并未得到官方支持。


```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i uint8
for i = 0; i < 10; i++ {
    col1_1_data := []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2))}
    col1_2_data := []uint8{i, i + 1, i + 2}
    col2_1_data := []uint8{i, i + 1, i + 2}
    col2_2_data := [][][]interface{}{
        {
            {i, i + 1},
        },
        {
            {i + 2, i + 3},
        },
        {
            {i + 4, i + 5},
        },
    }
    err := batch.Append(
        col1_1_data,
        col1_2_data,
        col2_1_data,
        col2_2_data,
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[完整示例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意：嵌套列必须具有相同的维度。例如，在上述示例中，`Col_2_2` 和 `Col_2_1` 必须具有相同数量的元素。

由于接口更为简洁且对嵌套提供了官方支持，我们推荐使用 `flatten_nested=0`。

#### Geo 类型 \{#geo-types\}

该客户端支持 Geo 类型 Point、Ring、Polygon 和 MultiPolygon。这些字段在 Go 语言中使用包 [github.com/paulmach/orb](https://github.com/paulmach/orb) 来表示。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            point Point,
            ring Ring,
            polygon Polygon,
            mPolygon MultiPolygon
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    orb.Point{11, 22},
    orb.Ring{
        orb.Point{1, 2},
        orb.Point{1, 2},
    },
    orb.Polygon{
        orb.Ring{
            orb.Point{1, 2},
            orb.Point{12, 2},
        },
        orb.Ring{
            orb.Point{11, 2},
            orb.Point{1, 12},
        },
    },
    orb.MultiPolygon{
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
    },
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    point    orb.Point
    ring     orb.Ring
    polygon  orb.Polygon
    mPolygon orb.MultiPolygon
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&point, &ring, &polygon, &mPolygon); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID \{#uuid\}

UUID 类型由 [github.com/google/uuid](https://github.com/google/uuid) 包提供支持。你也可以将 UUID 作为字符串发送并进行编组（marshal），或使用任意实现了 `sql.Scanner` 或 `Stringify` 接口的类型。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 UUID,
            col2 UUID
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := uuid.NewUUID()
if err = batch.Append(
    col1Data,
    "603966d6-ed93-11ec-8ea0-0242ac120002",
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 uuid.UUID
    col2 uuid.UUID
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)


#### Decimal \{#decimal\}

由于 Go 缺少内置的 `Decimal` 类型，我们建议使用第三方包 [github.com/shopspring/decimal](https://github.com/shopspring/decimal)，以便在不修改原始查询的情况下原生支持 `Decimal` 类型。

:::note
你可能会想改用 `Float` 来避免第三方依赖。不过需要注意，[在需要精确数值的场景下，不推荐在 ClickHouse 中使用 Float 类型](https://clickhouse.com/docs/sql-reference/data-types/float)。

如果你仍然选择在客户端使用 Go 的内置 `Float` 类型，那么必须在 ClickHouse 查询中显式地使用 [toFloat64() 函数](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) 或[其变体](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero) 将 `Decimal` 转换为 `Float`。请注意，这种转换可能会导致精度丢失。
:::

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Decimal32(3),
        Col2 Decimal(18,6),
        Col3 Decimal(15,7),
        Col4 Decimal128(8),
        Col5 Decimal256(9)
    ) Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    decimal.New(25, 4),
    decimal.New(30, 5),
    decimal.New(35, 6),
    decimal.New(135, 7),
    decimal.New(256, 8),
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 decimal.Decimal
    col2 decimal.Decimal
    col3 decimal.Decimal
    col4 decimal.Decimal
    col5 decimal.Decimal
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)


#### Nullable \{#nullable\}

Go 中的 Nil 值表示 ClickHouse 的 NULL。只有当字段被声明为 Nullable 时才能使用该值。在插入时，对于同一列的普通版本和 Nullable 版本都可以传入 Nil。对于前者（非 Nullable 列），将持久化该类型的默认值，例如 string 类型会存储为空字符串；对于后者（Nullable 版本），将在 ClickHouse 中存储 NULL 值。

在 Scan 阶段，用户必须传入一个支持 nil 的类型指针（例如 *string），以便在 Nullable 字段上表示 nil 值。在下面的示例中，col1 是一个 Nullable(String)，因此会接收一个 **string，从而可以表示 nil。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 Nullable(String),
            col2 String,
            col3 Nullable(Int8),
            col4 Nullable(Int64)
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    nil,
    nil,
    nil,
    sql.NullInt64{Int64: 0, Valid: false},
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 *string
    col2 string
    col3 *int8
    col4 sql.NullInt64
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

客户端还支持 `sql.Null*` 类型，例如 `sql.NullInt64`。这些类型与其对应的 ClickHouse 类型兼容。

#### 大整数 - Int128、Int256、UInt128、UInt256 \{#big-ints---int128-int256-uint128-uint256\}

大于 64 位的数值类型使用 Go 语言原生的 [big](https://pkg.go.dev/math/big) 包来表示。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Int128,
        Col2 UInt128,
        Col3 Array(Int128),
        Col4 Int256,
        Col5 Array(Int256),
        Col6 UInt256,
        Col7 Array(UInt256)
    ) Engine Memory`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := new(big.Int).SetString("170141183460469231731687303715884105727", 10)
col2Data := big.NewInt(128)
col3Data := []*big.Int{
    big.NewInt(-128),
    big.NewInt(128128),
    big.NewInt(128128128),
}
col4Data := big.NewInt(256)
col5Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}
col6Data := big.NewInt(256)
col7Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}

if err = batch.Append(col1Data, col2Data, col3Data, col4Data, col5Data, col6Data, col7Data); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 big.Int
    col2 big.Int
    col3 []*big.Int
    col4 big.Int
    col5 []*big.Int
    col6 big.Int
    col7 []*big.Int
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### 压缩 \{#compression\}

对压缩算法的支持取决于所使用的底层协议。对于原生协议，客户端支持 `LZ4` 和 `ZSTD` 压缩。压缩仅在块级别执行。可以通过在连接中包含 `Compression` 配置来启用压缩。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionZSTD,
    },
    MaxOpenConns: 1,
})
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Array(String)
    ) Engine Memory
    `); err != nil {
    return err
}
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    if err := batch.Append([]string{strconv.Itoa(i), strconv.Itoa(i + 1), strconv.Itoa(i + 2), strconv.Itoa(i + 3)}); err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

如果通过 HTTP 使用标准接口，还可以使用其他压缩方式。更多信息请参见 [database/sql API - Compression](#compression)。

### 参数绑定 \{#parameter-binding\}

该客户端在 `Exec`、`Query` 和 `QueryRow` 方法中支持参数绑定。如下面的示例所示，支持使用命名参数、编号参数以及位置参数。以下是这些用法的示例。

```go
var count uint64
// 位置绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置绑定计数: %d\n", count)
// 数值绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数值绑定计数: %d\n", count)
// 命名绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("命名绑定计数: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### 特殊情况 \{#special-cases\}

默认情况下，当切片作为查询参数传入时，会被展开为以逗号分隔的值列表。如果用户需要将一组值以方括号 `[ ]` 包裹的形式注入，则应使用 `ArraySet`。

如果需要用圆括号 `( )` 包裹的分组/元组，例如用于 IN 运算符，用户可以使用 `GroupSet`。这对于需要多个分组的场景尤其有用，如下例所示。

最后，`DateTime64` 字段需要指定精度，以确保参数被正确生成。然而客户端并不知道该字段的精度级别，因此必须由用户提供。为此，我们提供了 `DateNamed` 参数。

```go
var count uint64
// arrays will be unfolded
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array unfolded count: %d\n", count)
// arrays will be preserved with []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array count: %d\n", count)
// Group sets allow us to form ( ) lists
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// More useful when we need nesting
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// Use DateNamed when you need a precision in your time#
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate count: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)


### 使用 context \{#using-context\}

Go 的 context 提供了一种在 API 边界之间传递截止时间、取消信号及其他请求作用域值的机制。连接上的所有方法都将 context 作为其第一个参数。虽然前面的示例使用的是 `context.Background()`，但你可以利用这一能力来传递设置和截止时间，并取消查询。

传入一个通过 `withDeadline` 创建的 context，可以对查询施加执行时间限制。注意这是一个绝对时间，到期时只会释放连接并向 ClickHouse 发送取消信号。也可以使用 `WithCancel` 来显式取消查询。

辅助方法 `clickhouse.WithQueryID` 和 `clickhouse.WithQuotaKey` 允许指定查询 ID 和配额键。查询 ID 对于在日志中跟踪查询以及用于取消查询非常有用。配额键可用于基于唯一键值对 ClickHouse 的使用施加限制——更多详情参见 [Quotas Management ](/operations/access-rights#quotas-management)。

你还可以利用 context 确保某个设置仅应用于特定查询，而不是整个连接，如 [Connection Settings](#connection-settings) 中所示。

最后，你可以通过 `clickhouse.WithBlockSize` 控制块缓冲区的大小。它会覆盖连接级别的 `BlockBufferSize` 设置，并控制在任意时刻解码并保留在内存中的最大块数。更大的值通常意味着更多的并行化，但会增加内存消耗。

上述内容的示例如下所示。

```go
dialCount := 0
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
        dialCount++
        var d net.Dialer
        return d.DialContext(ctx, "tcp", addr)
    },
})
if err != nil {
    return err
}
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 22, 6, 1); err != nil {
    return nil
}
// we can use context to pass settings to a specific API call
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// to create a JSON column we need allow_experimental_object_type=1
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached.
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
var one uint8
queryId, _ := uuid.NewUUID()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(queryId.String()))
if err = conn.QueryRow(ctx, "SELECT 1").Scan(&one); err != nil {
    return err
}

conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
    conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// set a quota key - first create the quota
if err = conn.Exec(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

type Number struct {
    Number uint64 `ch:"number"`
}
for i := 1; i <= 6; i++ {
    var result []Number
    if err = conn.Select(ctx, &result, "SELECT number FROM numbers(10)"); err != nil {
        return err
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)


### 进度 / Profile / 日志信息 \{#progressprofilelog-information\}

在查询中可以请求 Progress、Profile 和 Log 信息。Progress 信息会报告在 ClickHouse 中已读取和处理的行数和字节数等统计数据。相比之下，Profile 信息会提供返回给客户端的数据摘要，包括未压缩字节数、行数和数据块数量等总计信息。最后，Log 信息会提供线程相关统计信息，例如内存使用情况和数据处理速度。

要获取这些信息，需要使用 [Context](#using-context)，并向其传递回调函数。

```go
totalRows := uint64(0)
// use context to pass a call back for progress and profile info
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("progress: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("profile info: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("log info: ", log)
}))

rows, err := conn.Query(ctx, "SELECT number from numbers(1000000) LIMIT 1000000")
if err != nil {
    return err
}
for rows.Next() {
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)


### 动态扫描 \{#dynamic-scanning\}

在某些情况下，用户需要读取一些表，但事先并不知道这些表的模式（schema）或返回字段的类型。这在执行临时数据分析或编写通用工具时非常常见。为此，可以在查询结果中获取列类型信息。可以将这些信息与 Go 的反射机制结合使用，在运行时创建类型正确的变量实例，并将其传递给 Scan。

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.Query(context.Background(), query)
if err != nil {
    return err
}
defer rows.Close()
var (
    columnTypes = rows.ColumnTypes()
    vars        = make([]interface{}, len(columnTypes))
)
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[完整示例代码](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)


### 外部表 \{#external-tables\}

[External tables](/engines/table-engines/special/external-data/) 允许客户端在执行 SELECT 查询时向 ClickHouse 发送数据。该数据会被放入一个临时表中，并可在查询本身中用于计算。

要随查询一同发送外部数据，用户必须先通过 `ext.NewTable` 构建一个外部表，然后再通过 context 传递。

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.Query(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
rows.Close()

var count uint64
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)


### OpenTelemetry \{#open-telemetry\}

ClickHouse 允许在原生协议中传递[跟踪上下文](/operations/opentelemetry/)。客户端支持通过函数 `clickhouse.withSpan` 创建一个 Span，并通过 Context 传递，从而实现这一点。

```go
var count uint64
rows := conn.QueryRow(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

关于如何使用链路追踪的完整说明，请参见 [OpenTelemetry 支持](/operations/opentelemetry/)。


## Database/SQL API \{#databasesql-api\}

`database/sql` 或“标准”API 允许你在应用代码应与底层数据库解耦、只依赖统一标准接口的场景下使用该客户端。这样做的代价是增加了额外的抽象层和间接层，并引入了一些不一定与 ClickHouse 完全契合的基础原语。但在需要通过工具连接多个数据库的场景中，这些成本通常是可以接受的。

此外，该客户端支持使用 HTTP 作为传输层——数据仍将以原生格式进行编码，以获得最佳性能。

下面的内容旨在与 ClickHouse API 的文档结构保持一致。

关于标准 API 的完整代码示例可以在[这里](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)找到。

### 连接 \{#connecting-1\}

可以通过格式为 `clickhouse://<host>:<port>?<query_option>=<value>` 的 DSN 字符串配合 `Open` 方法来建立连接，也可以使用 `clickhouse.OpenDB` 方法。后者不属于 `database/sql` 规范的一部分，但会返回一个 `sql.DB` 实例。该方法提供了诸如性能剖析（profiling）之类的功能，而这些功能在 `database/sql` 规范中没有直接的对外暴露方式。

```go
func Connect() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
        })
        return conn.Ping()
}

func ConnectDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://%s:%d?username=%s&password=%s", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**在后续所有示例中，除非特别说明，我们都假定已创建并可以使用名为 `conn` 的 ClickHouse 连接变量。**

#### 连接设置 \{#connection-settings-1\}

可以在 DSN 字符串中传递以下参数：

* `hosts` - 逗号分隔的单个地址主机列表，用于负载均衡和故障转移 - 参见 [连接到多个节点](#connecting-to-multiple-nodes)。
* `username/password` - 认证凭据 - 参见 [认证](#authentication)
* `database` - 选择当前默认数据库
* `dial_timeout` - 时长字符串，是一个可能带符号的十进制数字序列，每个数字可以带小数部分和单位后缀，例如 `300ms`、`1s`。有效时间单位为 `ms`、`s`、`m`。
* `connection_open_strategy` - `random/in_order`（默认 `random`）- 参见 [连接到多个节点](#connecting-to-multiple-nodes)
  * `round_robin` - 从集合中轮询选择服务器
  * `in_order` - 按指定顺序选择第一个可用服务器
* `debug` - 启用调试输出（布尔值）
* `compress` - 指定压缩算法 - `none`（默认）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。如果设置为 `true`，将使用 `lz4`。原生协议通信仅支持 `lz4` 和 `zstd`。
* `compress_level` - 压缩级别（默认 `0`）。参见 Compression。该设置依赖具体算法：
  * `gzip` - `-2`（最高速度）到 `9`（最高压缩比）
  * `deflate` - `-2`（最高速度）到 `9`（最高压缩比）
  * `br` - `0`（最高速度）到 `11`（最高压缩比）
  * `zstd`、`lz4` - 将被忽略
* `secure` - 建立安全的 SSL 连接（默认 `false`）
* `skip_verify` - 跳过证书校验（默认 `false`）
* `block_buffer_size` - 允许你控制块缓冲区大小。参见 [`BlockBufferSize`](#connection-settings)。（默认 `2`）

```go
func ConnectSettings() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d/%s?username=%s&password=%s&dial_timeout=10s&connection_open_strategy=round_robin&debug=true&compress=lz4", env.Host, env.Port, env.Database, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)


#### 连接池 \{#connection-pooling-1\}

你可以按照[连接到多个节点](#connecting-to-multiple-nodes)中的说明，控制所提供节点地址列表的使用方式。不过，按照设计，连接管理和连接池功能由 `sql.DB` 负责处理。 
对于 Native（TCP）和 HTTP 协议，均启用了连接池。

#### 通过 HTTP 连接 \{#connecting-over-http\}

默认情况下，连接是通过原生协议建立的。对于需要使用 HTTP 的用户，可以通过修改 DSN 以包含 HTTP 协议，或在连接选项中指定 Protocol 来启用 HTTP。

```go
func ConnectHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                Protocol: clickhouse.HTTP,
        })
        return conn.Ping()
}

func ConnectDSNHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

#### 连接到多个节点 \{#connecting-to-multiple-nodes-1\}

如果使用 `OpenDB`，请使用与 ClickHouse API 相同的选项配置方式连接到多个主机，并可选地指定 `ConnOpenStrategy`。

对于基于 DSN 的连接，连接字符串可以包含多个主机，以及一个 `connection_open_strategy` 参数，其值可以设置为 `round_robin` 或 `in_order`。

```go
func MultiStdHost() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := clickhouse.Open(&clickhouse.Options{
                Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
        })
        if err != nil {
                return err
        }
        v, err := conn.ServerVersion()
        if err != nil {
                return err
        }
        fmt.Println(v.String())
        return nil
}

func MultiStdHostDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d?username=%s&password=%s&connection_open_strategy=round_robin", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完整示例代码](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)

### 使用 TLS \{#using-tls-1\}

如果使用 DSN 连接字符串，可以通过参数 `secure=true` 启用 SSL。`OpenDB` 方法采用与 [TLS 原生 API](#using-tls) 相同的方式，依赖于提供一个非 nil 的 TLS 结构体。虽然 DSN 连接字符串支持参数 `skip_verify` 以跳过 SSL 校验，但对于更高级的 TLS 配置，必须使用 `OpenDB` 方法——因为它允许传入相应的配置。

```go
func ConnectSSL() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        cwd, err := os.Getwd()
        if err != nil {
                return err
        }
        t := &tls.Config{}
        caCert, err := ioutil.ReadFile(path.Join(cwd, "../../tests/resources/CAroot.crt"))
        if err != nil {
                return err
        }
        caCertPool := x509.NewCertPool()
        successful := caCertPool.AppendCertsFromPEM(caCert)
        if !successful {
                return err
        }
        t.RootCAs = caCertPool

        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                TLS: t,
        })
        return conn.Ping()
}

func ConnectDSNSSL() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("https://%s:%d?secure=true&skip_verify=true&username=%s&password=%s", env.Host, env.HttpsPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)

### 身份验证 \{#authentication-1\}

如果使用 `OpenDB`，可以通过常规选项传入身份验证信息。对于基于 DSN 的连接，可以在连接字符串中提供用户名和密码——既可以作为参数附加在其后，也可以作为编码在地址中的凭证。

```go
func ConnectAuth() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
        })
        return conn.Ping()
}

func ConnectDSNAuth() error {
        env, err := GetStdTestEnvironment()
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        if err = conn.Ping(); err != nil {
                return err
        }
        conn, err = sql.Open("clickhouse", fmt.Sprintf("http://%s:%s@%s:%d", env.Username, env.Password, env.Host, env.HttpPort))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)

### 执行 \{#execution-1\}

获取连接后，你可以使用 Exec 方法执行 `sql` 语句。

```go
conn.Exec(`DROP TABLE IF EXISTS example`)
_, err = conn.Exec(`
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
_, err = conn.Exec("INSERT INTO example VALUES (1, 'test-1')")
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

此方法不支持接收 context 参数——默认情况下，它使用后台 context 执行。如果有此需求，用户可以使用 `ExecContext`——参见[使用 Context](#using-context)。


### 批量插入 \{#batch-insert-1\}

可以通过使用 `Being` 方法创建一个 `sql.Tx` 来实现批量语义。随后，使用携带 `INSERT` 语句的 `Prepare` 方法获取一个批处理对象。该方法返回一个 `sql.Stmt`，可以通过 `Exec` 方法向其中追加多行数据。批处理会在内存中累积，直到对原始的 `sql.Tx` 调用 `Commit` 为止。

```go
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1000; i++ {
    _, err := batch.Exec(
        uint8(42),
        "ClickHouse", "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}
return scope.Commit()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

### 查询行 \{#querying-rows-1\}

可以使用 `QueryRow` 方法来查询单行记录。它会返回一个 *sql.Row，你可以在其上调用 Scan，并传入变量的指针，用于接收并填充对应的列值。`QueryRowContext` 变体允许传入非 background 的 context —— 参见 [使用 Context](#using-context)。

```go
row := conn.QueryRow("SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

遍历多行结果时需要使用 `Query` 方法。它返回一个 `*sql.Rows` 结构体，可以在其上调用 Next 来迭代各行。与之对应的 `QueryContext` 方法允许传入一个 context。

```go
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)


### 异步插入 \{#async-insert-1\}

可以通过调用 `ExecContext` 方法执行插入操作来实现异步插入。应按如下所示传入启用异步模式的 context。这样，用户可以指定客户端是应当等待服务器完成插入操作，还是在数据接收后立即返回响应。这实际上由参数 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) 控制。

```go
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
    `
if _, err := conn.Exec(ddl); err != nil {
    return err
}
ctx := clickhouse.Context(context.Background(), clickhouse.WithStdAsync(false))
{
    for i := 0; i < 100; i++ {
        _, err := conn.ExecContext(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
            %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
        )`, i, "Golang SQL 数据库驱动程序"))
        if err != nil {
            return err
        }
    }
}
```

[完整示例代码](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

### 列式插入 \{#columnar-insert-1\}

不支持通过标准接口进行。

### 使用结构体 \{#using-structs-1\}

标准接口暂不支持此功能。

### 类型转换 \{#type-conversions-1\}

标准的 `database/sql` 接口应支持与 [ClickHouse API](#type-conversions) 相同的类型。主要在复杂类型上存在少数例外，下面会进行说明。与 ClickHouse API 类似，客户端在插入数据和对响应进行编码时，目标是在可接受的类型上尽可能保持灵活性。有关更多详情，请参阅[类型转换](#type-conversions)。

### 复杂类型 \{#complex-types-1\}

除非另有说明，复杂类型的处理方式应与 [ClickHouse API](#complex-types) 相同。这些差异源自 `database/sql` 的内部实现。

#### 映射（Maps） \{#maps\}

与 ClickHouse API 不同，标准 API 要求映射在扫描阶段必须是强类型的。举例来说，你不能为 `Map(String,String)` 字段传入 `map[string]interface{}`，而必须使用 `map[string]string`。`interface{}` 变量始终是兼容的，可用于更复杂的结构。在读取时不支持 struct（结构体）。

```go
var (
    col1Data = map[string]uint64{
        "key_col_1_1": 1,
        "key_col_1_2": 2,
    }
    col2Data = map[string]uint64{
        "key_col_2_1": 10,
        "key_col_2_2": 20,
    }
    col3Data = map[string]uint64{}
    col4Data = []map[string]string{
        {"A": "B"},
        {"C": "D"},
    }
    col5Data = map[string]uint64{
        "key_col_5_1": 100,
        "key_col_5_2": 200,
    }
)
if _, err := batch.Exec(col1Data, col2Data, col3Data, col4Data, col5Data); err != nil {
    return err
}
if err = scope.Commit(); err != nil {
    return err
}
var (
    col1 interface{}
    col2 map[string]uint64
    col3 map[string]uint64
    col4 []map[string]string
    col5 map[string]uint64
)
if err := conn.QueryRow("SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v", col1, col2, col3, col4, col5)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

插入行为与 ClickHouse API 保持一致。


### 压缩 \{#compression-1\}

标准 API 支持与原生 [ClickHouse API](#compression) 相同的压缩算法，即在块级别支持 `lz4` 和 `zstd` 压缩。除此之外，对于 HTTP 连接，还支持 gzip、deflate 和 br 压缩。如果启用了上述任意一种，插入时的块以及查询响应都会进行压缩。其他请求（例如 ping 或查询请求）将保持未压缩状态。这与 `lz4` 和 `zstd` 选项的行为一致。

如果使用 `OpenDB` 方法建立连接，可以传入一个 Compression 配置项。其中包括指定压缩级别的能力（见下文）。如果通过携带 DSN 的 `sql.Open` 进行连接，请使用参数 `compress`。该参数可以是一个具体的压缩算法（即 `gzip`、`deflate`、`br`、`zstd` 或 `lz4`），也可以是一个布尔值。如果设置为 true，将使用 `lz4`。默认值为 `none`，即不启用压缩。

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionBrotli,
        Level:  5,
    },
    Protocol: clickhouse.HTTP,
})
```

[完整示例代码](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

所使用的压缩级别可以通过 DSN 参数 `compress_level` 或 Compression 选项中的 `Level` 字段进行控制。默认值为 0，但具体含义依压缩算法而定：

* `gzip` - `-2`（最佳速度）到 `9`（最佳压缩率）
* `deflate` - `-2`（最佳速度）到 `9`（最佳压缩率）
* `br` - `0`（最佳速度）到 `11`（最佳压缩率）
* `zstd`、`lz4` - 被忽略

### 参数绑定 \{#parameter-binding-1\}

标准 API 支持与 [ClickHouse API](#parameter-binding) 相同的参数绑定功能，允许将参数传递给 `Exec`、`Query` 和 `QueryRow` 方法（以及它们对应的 [Context](#using-context) 版本）。支持位置参数、命名参数和编号参数。

```go
var count uint64
// 位置绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置绑定计数: %d\n", count)
// 数值绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数值绑定计数: %d\n", count)
// 命名绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("命名绑定计数: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

请注意，[特殊情况](#special-cases)仍然适用。

### 使用 context \{#using-context-1\}

标准 API 与 [ClickHouse API](#using-context) 一样，支持通过 context 传递截止时间、取消信号以及其他与请求范围关联的值。不同于 ClickHouse API，这里是通过使用带有 `Context` 后缀的方法变体来实现的。也就是说，像 `Exec` 这类默认使用后台 context 的方法，会提供一个变体 `ExecContext`，它将 context 作为第一个参数传入。这样就可以在应用流程的任意阶段传递 context。例如，你可以在通过 `ConnContext` 建立连接时传入 context，或者在通过 `QueryRowContext` 请求查询行时传入 context。下文给出了所有可用方法的示例。

关于使用 context 传递截止时间、取消信号、查询 ID、配额键以及连接设置的更多细节，请参阅 [ClickHouse API](#using-context) 中的 Using Context 一节。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// to create a JSON column we need allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached. Again terminates the connection only,
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
var one uint8
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(uuid.NewString()))
if err = conn.QueryRowContext(ctx, "SELECT 1").Scan(&one); err != nil {
    return err
}

conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
    conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// set a quota key - first create the quota
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel = context.WithCancel(context.Background())
// we will get some results before cancel
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
    "max_block_size": "1",
}))
rows, err := conn.QueryContext(ctx, "SELECT sleepEachRow(1), number FROM numbers(100);")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1 uint8
    col2 uint8
)

for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        if col2 > 3 {
            fmt.Println("expected cancel")
            return nil
        }
        return err
    }
    fmt.Printf("row: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)


### 会话 \{#sessions\}

原生连接本身就包含一个会话，而通过 HTTP 的连接则要求用户创建一个会话 ID，用于在设置中传递上下文。这样可以使用诸如临时表等依赖会话的特性。

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Protocol: clickhouse.HTTP,
    Settings: clickhouse.Settings{
        "session_id": uuid.NewString(),
    },
})
if _, err := conn.Exec(`DROP TABLE IF EXISTS example`); err != nil {
    return err
}
_, err = conn.Exec(`
    CREATE TEMPORARY TABLE IF NOT EXISTS example (
            Col1 UInt8
    )
`)
if err != nil {
    return err
}
scope, err := conn.Begin()
if err != nil {
    return err
}
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 10; i++ {
    _, err := batch.Exec(
        uint8(i),
    )
    if err != nil {
        return err
    }
}
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1 uint8
)
for rows.Next() {
    if err := rows.Scan(&col1); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d\n", col1)
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)


### 动态扫描 \{#dynamic-scanning-1\}

与 [ClickHouse API](#dynamic-scanning) 类似，这里也可以获取列的类型信息，便于你在运行时创建类型正确的变量实例并将其传递给 Scan。这样即使事先不知道列的类型，也可以读取这些列。

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.QueryContext(context.Background(), query)
if err != nil {
    return err
}
defer rows.Close()

columnTypes, err := rows.ColumnTypes()
if err != nil {
    return err
}
vars := make([]interface{}, len(columnTypes))
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)


### 外部表 \{#external-tables-1\}

[外部表](/engines/table-engines/special/external-data/) 允许客户端在执行 `SELECT` 查询时向 ClickHouse 发送数据。这些数据会被放入一个临时表中，并可在查询本身中用于计算。

要在查询中从客户端发送外部数据，用户必须先通过 `ext.NewTable` 构建一个外部表，然后再通过 context 进行传递。

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.QueryContext(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
defer rows.Close()

for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

var count uint64
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)


### OpenTelemetry \{#open-telemetry-1\}

ClickHouse 允许在原生协议中传递 [trace context](/operations/opentelemetry/)。客户端可以通过函数 `clickhouse.withSpan` 创建一个 Span，并通过 Context 进行传递来实现这一点。当使用 HTTP 作为传输协议时，不支持该功能。

```go
var count uint64
rows := conn.QueryRowContext(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)


## 性能建议 \{#performance-tips\}

* 在可能的情况下使用 ClickHouse API，尤其是针对基本类型（primitive types）。这可以避免大量的反射和间接调用。
* 如果要读取大型数据集，考虑调整 [`BlockBufferSize`](#connection-settings)。这会增加内存占用，但在行迭代期间可以让更多数据块并行解码。默认值 2 较为保守，可将内存开销降至最低。更高的数值意味着会有更多数据块驻留在内存中。由于不同查询可能产生不同的数据块大小，因此需要进行测试。你也可以通过 Context 在[查询级别](#using-context)进行设置。
* 在插入数据时尽可能明确指定类型。尽管客户端旨在保持灵活性，例如允许将字符串解析为 UUID 或 IP，但这需要进行数据校验，并在插入时带来额外开销。
* 在可能的情况下使用按列（列式）的插入方式。同样地，这些列应为强类型，从而避免客户端对你的值进行类型转换。
* 遵循 ClickHouse 关于插入性能优化的[建议](/sql-reference/statements/insert-into/#performance-considerations)，以获得最佳插入性能。