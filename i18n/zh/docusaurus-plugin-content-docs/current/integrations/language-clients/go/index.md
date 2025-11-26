---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: '适用于 ClickHouse 的 Go 客户端允许用户通过 Go 标准库的 database/sql 接口或经过优化的原生接口连接到 ClickHouse。'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';


# ClickHouse Go



## 一个简单示例

让我们从一个简单示例开始。这将连接到 ClickHouse，并在 `system` 数据库中执行查询。开始之前，你需要准备好连接详情。

### 连接详情

<ConnectionDetails />

### 初始化模块

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### 复制示例代码

将此代码复制到 `clickhouse-golang-example` 目录中，并命名为 `main.go`。

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

        for rows.Next() {
                var name, uuid string
                if err := rows.Scan(&name, &uuid); err != nil {
                        log.Fatal(err)
                }
                log.Printf("name: %s, uuid: %s", name, uuid)
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

### 运行 `go mod tidy`

```bash
go mod tidy
```

### 设置连接参数

在前面的步骤中你已经查过连接信息。现在在 `main.go` 的 `connect()` 函数中设置它们：

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

### 运行示例

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

### 了解更多

本类别的其余文档将详细介绍 ClickHouse Go 客户端的相关细节。


## ClickHouse Go 客户端 {#clickhouse-go-client}

ClickHouse 支持两个官方的 Go 客户端。这两个客户端相辅相成，且有意支持不同的使用场景。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - 高层客户端，支持 Go 标准的 `database/sql` 接口或原生接口。
* [ch-go](https://github.com/ClickHouse/ch-go) - 底层客户端，仅支持原生接口。

clickhouse-go 提供高层接口，允许用户使用面向行的语义和批处理来查询和插入数据，并且在数据类型方面更为宽松——只要不会产生潜在精度损失，就会进行类型转换。与此同时，ch-go 提供了经过优化的面向列接口，在类型更严格、使用更复杂的前提下，以较低的 CPU 和内存开销实现快速的数据块流式传输。

自 2.3 版本起，clickhouse-go 在编码、解码和压缩等底层功能上使用 ch-go。请注意，clickhouse-go 还支持 Go 的 `database/sql` 接口标准。两个客户端在编码时都使用原生格式以提供最佳性能，并且可以通过 ClickHouse 原生协议通信。对于需要代理或对流量进行负载均衡的场景，clickhouse-go 还支持使用 HTTP 作为传输机制。

在选择客户端库时，用户应了解各自的优缺点——参见“选择客户端库”。

|               | 原生格式 | 原生协议 | HTTP 协议 | 面向行的 API | 面向列的 API | 类型灵活性 | 压缩 | 查询占位符 |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |



## 选择客户端 {#choosing-a-client}

选择客户端库取决于您的使用模式以及对性能的要求。对于大量写入的用例（每秒需要执行数百万次写入），我们推荐使用底层客户端 [ch-go](https://github.com/ClickHouse/ch-go)。该客户端避免了为了满足 ClickHouse 原生格式而将数据从行式格式转换为列式格式所带来的相关开销。此外，它也避免了任何反射操作或使用 `interface{}`（`any`）类型，从而简化了使用方式。

对于以聚合为主的查询工作负载，或写入吞吐量较低的插入型工作负载，[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) 提供了熟悉的 `database/sql` 接口以及更直接的行语义。用户还可以选择使用 HTTP 作为传输协议，并利用辅助函数在行与结构体之间进行序列化和反序列化。



## clickhouse-go 客户端 {#the-clickhouse-go-client}

clickhouse-go 客户端提供两种用于与 ClickHouse 通信的 API 接口：

* ClickHouse 客户端特定 API
* `database/sql` 标准接口——由 Go 语言提供的面向 SQL 数据库的通用接口。

虽然 `database/sql` 提供了与数据库无关的接口，使开发者能够抽象其数据存储层，但它强制采用的一些类型和查询语义会影响性能。出于这个原因，在[对性能要求较高](https://github.com/clickHouse/clickHouse-go#benchmark)的场景中，应优先使用客户端特定 API。不过，希望将 ClickHouse 集成到支持多种数据库的工具中的用户，可能更倾向于使用标准接口。

这两种接口都使用[原生格式](/native-protocol/basics.md)和原生协议进行通信。此外，标准接口还支持通过 HTTP 进行通信。

|                    | 原生格式 | 原生协议 | HTTP 协议 | 批量写入支持 | Struct 序列化 | 压缩 | 查询占位符 |
|:------------------:|:--------:|:--------:|:---------:|:------------:|:-------------:|:----:|:----------:|
|   ClickHouse API   |    ✅     |    ✅     |           |      ✅       |       ✅       |  ✅   |      ✅      |
| `database/sql` API |    ✅     |    ✅     |     ✅     |      ✅       |               |  ✅   |      ✅      |



## 安装

v1 版驱动程序已弃用，将不再提供功能更新或对新 ClickHouse 类型的支持。建议用户迁移到性能更优的 v2。

要安装 2.x 版本的客户端，请在你的 go.mod 文件中添加如下依赖：

`require github.com/ClickHouse/clickhouse-go/v2 main`

或者，克隆该仓库：

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

### 版本控制与兼容性

该客户端独立于 ClickHouse 发布。2.x 代表当前正在开发的主版本分支。所有 2.x 版本之间应当彼此兼容。

#### ClickHouse 兼容性

该客户端支持：

* 所有当前受支持的 ClickHouse 版本，具体记录在[此处](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)。当某些 ClickHouse 版本不再受支持时，也不再针对这些版本对新客户端版本进行主动测试。
* 自客户端发布之日起 2 年内发布的所有 ClickHouse 版本。请注意，仅对 LTS 版本进行主动测试。

#### Golang 兼容性

|   客户端版本   |  Golang 版本 |
| :-------: | :--------: |
| 2.0 — 2.2 | 1.17, 1.18 |
| &gt;= 2.3 |    1.18    |


## ClickHouse 客户端 API

所有 ClickHouse 客户端 API 的代码示例都可以在[此处](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)找到。

### 连接

下面的示例（返回服务器版本）演示了如何连接到 ClickHouse —— 假设 ClickHouse 未启用安全保护，并且可以使用默认用户访问。

注意，我们使用默认的原生协议端口进行连接。

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

**在后续所有示例中，除非特别说明，我们都假定已经创建并可以使用 ClickHouse 的 `conn` 变量。**

#### 连接设置

在打开连接时，可以使用 Options 结构体来控制客户端行为。可用的设置包括：

* `Protocol` - 可选 Native 或 HTTP。当前 HTTP 仅支持 [database/sql API](#databasesql-api)。
* `TLS` - TLS 选项。非 nil 值将启用 TLS。参见 [Using TLS](#using-tls)。
* `Addr` - 包含端口的地址切片。
* `Auth` - 认证信息。参见 [Authentication](#authentication)。
* `DialContext` - 自定义拨号函数，用于决定如何建立连接。
* `Debug` - true/false，用于启用调试。
* `Debugf` - 提供一个函数用于处理调试输出。需要将 `debug` 设置为 true。
* `Settings` - ClickHouse 设置的映射。这些设置将应用于所有 ClickHouse 查询。[Using Context](#using-context) 允许按查询设置配置。
* `Compression` - 启用数据块压缩。参见 [Compression](#compression)。
* `DialTimeout` - 建立连接的最长时间。默认值为 `1s`。
* `MaxOpenConns` - 任意时间点可用的最大连接数。空闲连接池中可能有更多或更少的连接，但在任意时刻只能使用该数量的连接。默认值为 `MaxIdleConns+5`。
* `MaxIdleConns` - 连接池中要维护的连接数量。如果可能，这些连接会被复用。默认值为 `5`。
* `ConnMaxLifetime` - 保持连接可用的最长生命周期。默认值为 1 小时。连接在此时间后会被销毁，并按需向连接池中添加新连接。
* `ConnOpenStrategy` - 决定如何遍历节点地址列表并据此建立连接。参见 [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)。
* `BlockBufferSize` - 一次解码到缓冲区中的最大数据块数。更大的值会在增加并行度的同时消耗更多内存。数据块大小依赖于查询，因此虽然你可以在连接级别进行设置，但我们建议根据查询返回的数据在查询级别进行覆盖。默认值为 `2`。

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

#### 连接池


客户端维护一个连接池，并在需要时在查询之间重用这些连接。任意时刻最多会使用 `MaxOpenConns` 个连接，连接池的最大大小由 `MaxIdleConns` 控制。客户端在每次执行查询时都会从池中获取一个连接，并在完成后将其归还到池中以便重用。一个连接会在一个批次（batch）的整个生命周期内被使用，并在调用 `Send()` 时释放。

无法保证后续查询会复用池中的同一个连接，除非用户将 `MaxOpenConns=1`。这种情况很少需要，但在用户使用临时表时可能是必需的。

另请注意，`ConnMaxLifetime` 默认是 1 小时。如果节点离开集群，这可能会导致对 ClickHouse 的负载变得不均衡。当某个节点不可用时，连接会重新分布到其他节点。这些连接默认会持续存在，并在 1 小时内不会被刷新，即使出现故障的节点已经重新加入集群也是如此。在高负载场景下，请考虑降低该值。

### 使用 TLS

在底层，所有客户端连接方法（`DSN/OpenDB/Open`）都会使用 [Go 的 tls 包](https://pkg.go.dev/crypto/tls) 来建立安全连接。如果 Options 结构体中包含一个非 nil 的 `tls.Config` 指针，客户端就会使用 TLS。

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

这个精简配置的 `TLS.Config` 通常足以连接到 ClickHouse 服务器上的安全原生端口（通常为 9440）。如果 ClickHouse 服务器没有有效证书（证书过期、主机名不匹配、或未由公众信任的根证书颁发机构签署），可以将 `InsecureSkipVerify` 设为 true，但强烈不建议这样做。

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

如果需要额外的 TLS 参数，应用代码应在 `tls.Config` 结构体中设置相应字段。这可以包括指定密码套件、强制使用特定的 TLS 版本（如 1.2 或 1.3）、添加内部 CA 证书链、在 ClickHouse 服务器要求时添加客户端证书（及其私钥），以及在更高级安全配置中使用的大多数其他选项。

### 认证

在连接配置中指定一个 Auth 结构体来设置用户名和密码。

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

### 连接多个节点

可以通过 `Addr` 结构体指定多个地址。


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

有两种可用的连接策略：

* `ConnOpenInOrder`（默认） - 按顺序依次使用地址。只有当前面列表中的地址连接失败时，才会使用后面的地址。本质上是一种故障转移策略。
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

### 执行

可以通过 `Exec` 方法执行任意语句。这对于 DDL 和简单语句非常有用。但不应将其用于大批量插入或循环执行查询。

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

请注意，可以向查询传递一个 Context。它可以用于传递特定的查询级别设置——参见 [Using Context](#using-context)。

### 批量插入

要插入大量行，客户端提供了批量插入语义。需要先准备一个批处理对象，然后向其中追加行，最后通过 `Send()` 方法发送。在执行 `Send` 之前，批处理会保存在内存中。

建议在批处理对象上调用 `Close` 以防止连接泄漏。可以在准备批处理后通过 `defer` 关键字来实现。如果 `Send` 从未被调用，它会清理连接。请注意，如果没有追加任何行，这将在查询日志中显示为插入 0 行。

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
```


for i := 0; i < 1000; i++ {
err := batch.Append(
uint8(42),
"ClickHouse",
"Inc",
uuid.New(),
map[string]uint8{"key": 1}, // Map(String, UInt8)
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

````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouse 的相关建议适用于[此处](/guides/inserting-data#best-practices-for-inserts)。批次不应在多个 go-routine 之间共享——请为每个 routine 单独构造批次。

从上述示例可以看出,在追加行时,变量类型需要与列类型保持一致。虽然类型映射通常比较明显,但此接口设计较为灵活,只要不会造成精度损失,类型就会自动转换。例如,以下代码演示了将字符串插入 datetime64 类型列。

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
````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

有关每种列类型支持的 Go 类型的完整说明,请参阅[类型转换](#type-conversions)。

### 查询行 {#querying-rows}

用户可以使用 `QueryRow` 方法查询单行,或通过 `Query` 方法获取游标以迭代结果集。前者接受数据序列化的目标变量,而后者需要对每一行调用 `Scan` 方法。

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

请注意,在这两种情况下,我们都需要传递变量的指针,以便将相应的列值序列化到这些变量中。这些指针必须按照 `SELECT` 语句中指定的顺序传递——默认情况下,在使用 `SELECT *` 时将按照列声明的顺序处理,如上所示。


与插入类似，Scan 方法要求目标变量具有合适的类型。出于灵活性的考虑，该方法会在可能的情况下进行类型转换，只要不会发生精度损失。例如，上面的示例展示了将 UUID 列读取到字符串变量中。有关每种 Column 类型支持的 Go 类型的完整列表，请参阅 [Type Conversions](#type-conversions)。

最后，请注意可以向 `Query` 和 `QueryRow` 方法传递一个 `Context`。这可以用于指定查询级别的设置——更多细节参见 [Using Context](#using-context)。

### Async Insert

通过 Async 方法支持异步插入。这允许用户指定客户端是应等待服务器完成插入，还是在服务器接收数据后立即返回响应。这实际上控制了参数 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert)。

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

### 列式插入

可以按列式格式进行插入。如果数据本身已经以这种结构组织，则通过避免将其转换为行格式，可以获得性能优势。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

### 使用结构体

对用户而言，Go 语言的结构体为 ClickHouse 中的一行数据提供了逻辑表示。为此，原生接口提供了若干便捷函数。

#### 使用序列化进行查询

`Select` 方法允许通过一次调用，将一组返回行映射（marshal）到一个结构体切片中。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

#### 扫描到结构体


`ScanStruct` 允许将查询得到的单个 `Row` 映射到一个结构体。

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

#### 追加 struct

`AppendStruct` 允许将一个 struct 追加到已有的[批](#batch-insert)中，并将其视为一整行。这要求该 struct 中的字段在名称和类型上都与表中的列一一对应。虽然所有列都必须在 struct 中有对应字段，但某些 struct 字段可能在表中没有对应的列。这些字段将被直接忽略。

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
        ColIgnored: "该字段将被忽略",
    })
    if err != nil {
        return err
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 类型转换

该客户端在接受用于插入和响应编组的变量类型方面，目标是尽可能灵活。在大多数情况下，ClickHouse 列类型都有一个等价的 Go 语言类型，例如 [UInt64](/sql-reference/data-types/int-uint/) 对应 [uint64](https://pkg.go.dev/builtin#uint64)。这些逻辑映射应始终得到支持。用户可能希望使用不同的变量类型，只要先对变量或接收的数据进行转换，就可以将其插入列中或用于接收响应。客户端旨在透明地支持这些转换，这样用户无需在插入前先精确对齐并转换数据，并且在查询时提供灵活的编组能力。此类透明转换不允许精度丢失。例如，`uint32` 不能用于从 `UInt64` 列中接收数据。反之，只要满足格式要求，字符串可以插入到 `datetime64` 字段中。

当前对原始类型所支持的类型转换记录在[此处](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)。

这一工作仍在进行中，可分为插入阶段（`Append`/`AppendRow`）和读取阶段（通过 `Scan`）。如果您需要支持某种特定的转换，请提交一个 issue。

### 复杂类型

#### Date/DateTime 类型

ClickHouse Go 客户端支持 `Date`、`Date32`、`DateTime` 和 `DateTime64` 这几种日期/日期时间类型。日期可以以字符串形式插入（格式为 `2006-01-02`），或者使用原生 Go 的 `time.Time{}` 或 `sql.NullTime`。DateTime 类型同样支持后两种类型，但如果使用字符串，则需要以 `2006-01-02 15:04:05` 的格式传入，并可选附带时区偏移，例如 `2006-01-02 15:04:05 +08:00`。在读取时，`time.Time{}` 和 `sql.NullTime` 均受支持，以及任何 `sql.Scanner` 接口的实现。

时区信息的处理方式取决于 ClickHouse 类型以及该值是被插入还是被读取：


* **DateTime/DateTime64**
  * 在 **insert** 时，值会以 UNIX 时间戳格式发送到 ClickHouse。若未提供时区，客户端将假定使用客户端的本地时区。`time.Time{}` 或 `sql.NullTime` 会相应地转换为 epoch 时间。
  * 在 **select** 时，如果列定义了时区，则在返回 `time.Time` 值时会使用该列的时区；否则将使用服务器的时区。
* **Date/Date32**
  * 在 **insert** 时，转换日期为 UNIX 时间戳时会考虑日期值的时区，也就是说，在以 Date 类型存储前会根据时区进行偏移，因为在 ClickHouse 中 Date 类型不包含时区/区域信息。如果在字符串值中未指定时区，则会使用本地时区。
  * 在 **select** 时，扫描到的日期会被填充到 `time.Time{}` 或 `sql.NullTime{}` 实例中，返回时不包含时区信息。

#### Array

数组应作为 slice 插入。元素的类型规则与 [primitive type](#type-conversions) 一致，即在可能的情况下会自动进行类型转换。

在 Scan 时应传入指向 slice 的指针。

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
rows.Close()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### Map（映射）

Map 应作为 Go 语言的 map 插入，其键和值需要遵循[前文](#type-conversions)中定义的类型规则。

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
rows.Close()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### 元组（Tuples）

元组表示一组列，其长度可以是任意的。列可以显式命名，也可以只指定类型，例如：

```sql
//未命名
Col1 Tuple(String, Int64)

//已命名
Col2 Tuple(name String, id Int64, age uint8)
```

在这些方法中，命名元组的灵活性更高。未命名元组必须通过切片进行插入和读取，而命名元组还可以与映射类型配合使用。


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

注意：支持带类型的 slice 和 map，但前提是命名 Tuple 中提供的子列都具有相同的类型。

#### Nested

`Nested` 字段等价于由命名 Tuple 组成的 `Array`。其用法取决于用户是否将 [flatten&#95;nested](/operations/settings/settings#flatten_nested) 设置为 1 或 0。

当将 flatten&#95;nested 设置为 0 时，`Nested` 列会保持为单个 Tuple 数组。这样用户就可以使用 map 的 slice 进行写入和读取，并支持任意层级的嵌套。map 的键必须等于列名，如下面示例所示。

注意：由于 map 表示的是一个 Tuple，它们的类型必须是 `map[string]interface{}`。目前对这些值不做强类型约束。

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
```


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
rows, err := conn.Query(ctx, "SELECT \* FROM example")
if err != nil {
return err
}
for rows.Next() {
if err := rows.Scan(&col1, &col2); err != nil {
return err
}
fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()

````

[完整示例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

如果 `flatten_nested` 使用默认值 1,嵌套列将被展平为独立的数组。这需要使用嵌套切片进行插入和检索。虽然任意级别的嵌套可能有效,但这并未得到官方支持。

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
````

[完整示例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意:嵌套列必须具有相同的维度。例如,在上述示例中,`Col_2_2` 和 `Col_2_1` 必须具有相同数量的元素。

由于接口更加简洁且官方支持嵌套,我们推荐使用 `flatten_nested=0`。

#### 地理类型 {#geo-types}


该客户端支持地理空间类型 Point、Ring、Polygon 和 MultiPolygon。这些字段在 Go 语言中使用包 [github.com/paulmach/orb](https://github.com/paulmach/orb)。

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

#### UUID

UUID 类型由 [github.com/google/uuid](https://github.com/google/uuid) 包提供支持。用户也可以以字符串形式发送和序列化 UUID，或者使用任何实现了 `sql.Scanner` 或 `Stringify` 的类型。

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

#### Decimal 类型

Decimal 类型由 [github.com/shopspring/decimal](https://github.com/shopspring/decimal) 包提供支持。

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
```


if err = conn.QueryRow(ctx, "SELECT \* FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)

````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

#### 可空类型 {#nullable}

Go 中的 Nil 值对应 ClickHouse 的 NULL。当字段声明为 Nullable 时可以使用此值。插入数据时,Nil 可以传递给普通列或 Nullable 列。对于普通列,将持久化该类型的默认值,例如字符串类型的空字符串。对于 Nullable 列,将在 ClickHouse 中存储 NULL 值。

扫描数据时,用户必须传递支持 nil 的类型指针(例如 *string)来表示 Nullable 字段的 nil 值。在下面的示例中,col1 是 Nullable(String) 类型,因此接收 **string 指针,从而能够表示 nil 值。

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
````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

客户端还支持 `sql.Null*` 类型(例如 `sql.NullInt64`),这些类型与对应的 ClickHouse 类型兼容。

#### 大整数 - Int128、Int256、UInt128、UInt256 {#big-ints---int128-int256-uint128-uint256}

大于 64 位的数字类型使用 Go 原生的 [big](https://pkg.go.dev/math/big) 包来表示。

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

```


if err = conn.QueryRow(ctx, "SELECT \* FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)

````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### 压缩 {#compression}

对压缩方法的支持取决于所使用的底层协议。对于原生协议,客户端支持 `LZ4` 和 `ZSTD` 压缩。压缩仅在块级别执行。可以通过在连接中包含 `Compression` 配置来启用压缩。

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
````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

如果通过 HTTP 使用标准接口,还可以使用其他压缩技术。有关更多详细信息,请参阅 [database/sql API - 压缩](#compression)。

### 参数绑定 {#parameter-binding}

客户端支持对 `Exec`、`Query` 和 `QueryRow` 方法进行参数绑定。如下面的示例所示,支持使用命名参数、编号参数和位置参数。我们在下面提供了这些示例。

```go
var count uint64
// 位置绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置绑定计数: %d\n", count)
// 编号绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("编号绑定计数: %d\n", count)
// 命名绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("命名绑定计数: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### 特殊情况 {#special-cases}

默认情况下,如果将切片作为参数传递给查询,它们将被展开为逗号分隔的值列表。如果用户需要注入一组带有 `[ ]` 包装的值,应使用 `ArraySet`。

如果需要带有 `( )` 包装的组/元组(例如用于 IN 运算符),用户可以使用 `GroupSet`。这对于需要多个组的情况特别有用,如下面的示例所示。

最后,DateTime64 字段需要精度以确保参数正确呈现。但是,客户端不知道该字段的精度级别,因此用户必须提供它。为了便于此操作,我们提供了 `DateNamed` 参数。


```go
var count uint64
// 数组将被展开
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("数组展开后的计数: %d\n", count)
// 使用 [] 可保留数组结构
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("数组计数: %d\n", count)
// 使用分组集合可以构造 ( ) 列表
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("分组计数: %d\n", count)
// 需要嵌套时更为实用
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("分组计数: %d\n", count)
// 需要指定时间精度时使用 DateNamed
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("命名日期计数: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### 使用 context

Go 的 context 提供了一种在 API 边界之间传递截止时间、取消信号以及其他请求范围值的机制。连接上的所有方法都将 context 作为第一个参数。前面的示例使用了 `context.Background()`，用户也可以利用这一能力传递设置和截止时间，并用于取消查询。

传入通过 `withDeadline` 创建的 context 可以为查询设置执行时间限制。注意，这是一个绝对时间，过期后只会释放连接并向 ClickHouse 发送取消信号。也可以使用 `WithCancel` 来显式取消查询。

辅助函数 `clickhouse.WithQueryID` 和 `clickhouse.WithQuotaKey` 允许指定查询 ID 和 quota key。查询 ID 在日志中跟踪查询以及用于取消查询时非常有用。quota key 可用于基于唯一键值对 ClickHouse 的使用施加限制——更多详情参见 [Quotas Management](/operations/access-rights#quotas-management)。

用户还可以使用 context 确保某个设置只对特定查询生效，而不是对整个连接生效，如 [Connection Settings](#connection-settings) 中所示。

最后，用户可以通过 `clickhouse.WithBlockSize` 控制块缓冲区的大小。这会覆盖连接级别的 `BlockBufferSize` 设置，并控制在任意时刻可被解码并保存在内存中的最大块数量。较大的值可能带来更多并行化能力，但会以更高内存占用为代价。

上述用法的示例如下。

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
// 可以使用 context 将设置传递给特定的 API 调用
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// 创建 JSON 列需要设置 allow_experimental_object_type=1
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}
```


// 可以使用 context 取消查询
ctx, cancel := context.WithCancel(context.Background())
go func() {
cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
return fmt.Errorf("expected cancel")
}

// 为查询设置截止时间 - 达到绝对时间后将取消查询。
// 查询将在 ClickHouse 中继续执行直至完成
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
return fmt.Errorf("expected deadline exceeeded")
}

// 设置查询 ID 以便在日志中跟踪查询,例如查看 system.query*log
var one uint8
queryId, * := uuid.NewUUID()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(queryId.String()))
if err = conn.QueryRow(ctx, "SELECT 1").Scan(&one); err != nil {
return err
}

conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// 设置配额键 - 首先创建配额
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

````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

### 进度/性能分析/日志信息 {#progressprofilelog-information}

可以在查询时请求进度、性能分析和日志信息。进度信息将报告在 ClickHouse 中已读取和处理的行数和字节数统计。性能分析信息则提供返回给客户端的数据摘要,包括字节总数(未压缩)、行数和块数。日志信息提供线程相关的统计信息,例如内存使用情况和数据处理速度。

获取这些信息需要使用 [Context](#using-context),用户可以向其传递回调函数。

```go
totalRows := uint64(0)
// 使用 context 传递进度和性能分析信息的回调函数
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

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
````

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

### 动态扫描 {#dynamic-scanning}

用户可能需要读取架构或返回字段类型未知的表。这在执行临时数据分析或编写通用工具时很常见。为实现此目的,查询响应中提供了列类型信息。可以结合 Go 反射使用这些信息,在运行时创建正确类型的变量实例,然后将其传递给 Scan。

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
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

### 外部表 {#external-tables}


[External tables](/engines/table-engines/special/external-data/) 允许客户端在执行 SELECT 查询时向 ClickHouse 发送数据。该数据会被放入一个临时表中，并可在查询本身中用于计算。

要在查询中从客户端发送外部数据，用户必须先通过 `ext.NewTable` 构建一个外部表，然后再通过 context 传递。

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

### OpenTelemetry

ClickHouse 允许在原生协议中携带 [trace context](/operations/opentelemetry/)。客户端可以通过函数 `clickhouse.withSpan` 创建一个 Span，并通过 Context 传递该 Span 来实现这一点。

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
fmt.Printf("count: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

关于如何利用追踪功能的完整说明，请参阅 [OpenTelemetry 支持](/operations/opentelemetry/)。


## Database/SQL API

`database/sql` 或“标准”API 允许用户在应用代码需要对底层数据库保持无感、只需遵循统一接口的场景中使用该客户端。代价是引入了额外的抽象层、间接层，以及一些与 ClickHouse 不完全对齐的基础原语。不过，在需要通过工具连接多个数据库的场景中，这些成本通常是可以接受的。

此外，该客户端支持使用 HTTP 作为传输层——数据仍然会以原生格式编码，以获得最佳性能。

下文在结构上力求与 ClickHouse API 文档保持一致。

标准 API 的完整代码示例可以在[此处](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)找到。

### Connecting

可以通过格式为 `clickhouse://<host>:<port>?<query_option>=<value>` 的 DSN 字符串配合 `Open` 方法，或者通过 `clickhouse.OpenDB` 方法建立连接。后者不属于 `database/sql` 规范的一部分，但会返回一个 `sql.DB` 实例。该方法提供了诸如性能分析（profiling）之类的功能，而这些功能在 `database/sql` 规范中没有显而易见的方式可以对外暴露。

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

**在后续所有示例中，除非特别说明，我们都假定已创建并可用的 ClickHouse 连接变量 `conn`。**

#### 连接设置

可以在 DSN 字符串中传递以下参数：

* `hosts` - 以逗号分隔的单个地址主机列表，用于负载均衡和故障转移 - 参见 [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)。
* `username/password` - 认证凭据 - 参见 [Authentication](#authentication)
* `database` - 选择当前默认数据库
* `dial_timeout` - 时长字符串，是可能带符号的一串十进制数字，每个数字可以有可选的小数部分和单位后缀，例如 `300ms`、`1s`。有效时间单位为 `ms`、`s`、`m`。
* `connection_open_strategy` - `random/in_order`（默认 `random`） - 参见 [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)
  * `round_robin` - 以轮询方式从集合中选择服务器
  * `in_order` - 按指定顺序选择第一个存活的服务器
* `debug` - 启用调试输出（布尔值）
* `compress` - 指定压缩算法 - `none`（默认）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。如果设置为 `true`，将使用 `lz4`。原生通信仅支持 `lz4` 和 `zstd`。
* `compress_level` - 压缩级别（默认 `0`）。参见 Compression。该配置依赖于算法：
  * `gzip` - `-2`（最快）到 `9`（最高压缩率）
  * `deflate` - `-2`（最快）到 `9`（最高压缩率）
  * `br` - `0`（最快）到 `11`（最高压缩率）
  * `zstd`, `lz4` - 忽略
* `secure` - 建立安全的 SSL 连接（默认 `false`）
* `skip_verify` - 跳过证书验证（默认 `false`）
* `block_buffer_size` - 允许用户控制块缓冲区大小。参见 [`BlockBufferSize`](#connection-settings)。（默认 `2`）


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

#### 连接池

用户可以按照[连接到多个节点](#connecting-to-multiple-nodes)中的说明，控制提供的节点地址列表的使用方式。但按设计，连接管理和连接池都委托给 `sql.DB` 处理。

#### 通过 HTTP 连接

默认情况下，连接是通过原生协议建立的。对于需要通过 HTTP 连接的用户，可以通过以下任一方式启用：修改 DSN，将协议改为 HTTP，或在连接选项中指定 Protocol。

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

#### 连接到多个节点

如果使用 `OpenDB`，可以采用与 ClickHouse API 相同的选项配置方式连接到多个主机，并可选地指定 `ConnOpenStrategy`。

对于基于 DSN 的连接，连接字符串可以包含多个主机，并带有一个 `connection_open_strategy` 参数，其值可以设置为 `round_robin` 或 `in_order`。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)

### 使用 TLS

如果使用 DSN 连接字符串，可以通过参数 `secure=true` 启用 SSL。`OpenDB` 方法采用与 [TLS 原生 API](#using-tls) 相同的方式，即依赖于提供一个非 nil 的 TLS 结构体。虽然 DSN 连接字符串支持通过参数 `skip_verify` 来跳过 SSL 校验，但对于更高级的 TLS 配置，需要使用 `OpenDB` 方法——因为它允许传入完整的配置。


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

### 身份验证

如果使用 `OpenDB`，可以通过常规选项传递身份验证信息。对于基于 DSN 的连接，可以在连接字符串中指定用户名和密码——既可以作为参数传递，也可以作为编码在地址中的凭据。

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

### 执行

建立连接后，用户即可通过 `Exec` 方法执行 `SQL` 语句。

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

此方法不支持接收 context 参数——默认情况下，它会在 background context 下执行。若有需要，用户可以使用 `ExecContext`——参见 [Using Context](#using-context)。

### 批量插入

可以通过使用 `Begin` 方法创建 `sql.Tx` 来实现批量处理语义。随后，可以对一条 `INSERT` 语句调用 `Prepare` 方法以获取一个批次。这将返回一个 `sql.Stmt`，可以通过 `Exec` 方法向其追加多行数据。该批次会在内存中累积，直到对原始的 `sql.Tx` 调用 `Commit` 为止。


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

### 查询行

可以使用 `QueryRow` 方法查询单行记录。该方法返回一个 *sql.Row，可以在其上调用 Scan，并传入指向变量的指针，用于接收需要填充的列值。`QueryRowContext` 变体允许传入非 background 的 context——参见 [Using Context](#using-context)。

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

遍历多行结果需要使用 `Query` 方法。该方法返回一个 `*sql.Rows` 结构体，可以在其上调用 `Next` 方法来迭代结果行。等价的 `QueryContext` 方法允许传入一个 context 上下文。

```go
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
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
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### 异步插入

可以通过调用 `ExecContext` 方法执行插入操作来实现异步插入。应像下面所示，为该方法传入启用了异步模式的 context 对象。这样用户就可以指定客户端是等待服务器完成插入操作后再返回，还是在服务器接收数据后立即返回响应。这实际上是通过参数 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) 来控制的。

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
        )`, i, "Golang SQL 数据库驱动"))
        if err != nil {
            return err
        }
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### 列式插入

标准接口不支持。

### 使用 struct

标准接口不支持。

### 类型转换

标准的 `database/sql` 接口应支持与 [ClickHouse API](#type-conversions) 相同的类型。下文列出了若干例外，主要针对复杂类型。与 ClickHouse API 类似，客户端在可接受的插入类型及响应的序列化/反序列化类型上力求尽可能灵活。更多详情请参阅 [类型转换](#type-conversions)。

### 复杂类型

除非特别说明，复杂类型的处理方式应与 [ClickHouse API](#complex-types) 相同。差异源自 `database/sql` 的内部实现。

#### Map

与 ClickHouse API 不同，标准 API 要求在扫描目标类型时对 map 进行强类型约束。例如，用户不能为 `Map(String,String)` 字段传入 `map[string]interface{}`，而必须使用 `map[string]string`。`interface{}` 变量始终是兼容的，可用于更复杂的结构。读取时不支持 struct 结构体。

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

### 压缩

标准 API 支持与原生 [ClickHouse API](#compression) 相同的压缩算法，即在块级别进行 `lz4` 和 `zstd` 压缩。此外，HTTP 连接还支持 gzip、deflate 和 br 压缩。如果启用了上述任一算法，插入和查询响应时都会对数据块进行压缩。其他请求（例如 ping 或查询请求）将保持未压缩状态。这与 `lz4` 和 `zstd` 选项的行为一致。

如果使用 `OpenDB` 方法建立连接，可以传入 Compression 配置项。这其中包括指定压缩级别的能力（见下文）。如果通过带 DSN 的 `sql.Open` 进行连接，请使用参数 `compress`。它可以是一个具体的压缩算法（例如 `gzip`、`deflate`、`br`、`zstd` 或 `lz4`），也可以是一个布尔标志位。如果设置为 true，将使用 `lz4`。默认值为 `none`，即禁用压缩。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)


```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

使用的压缩级别可以通过 DSN 参数 `compress_level` 或 Compression 选项的 `Level` 字段进行控制。默认值为 0，但具体取值范围取决于所用算法：

* `gzip` - `-2`（最佳速度）到 `9`（最佳压缩）
* `deflate` - `-2`（最佳速度）到 `9`（最佳压缩）
* `br` - `0`（最佳速度）到 `11`（最佳压缩）
* `zstd`、`lz4` - 忽略该设置

### 参数绑定

标准 API 支持与 [ClickHouse API](#parameter-binding) 相同的参数绑定机制，允许将参数传递给 `Exec`、`Query` 和 `QueryRow` 方法（以及它们对应的 [Context](#using-context) 变体）。支持位置参数、命名参数和编号参数。

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

请注意，[特殊情况](#special-cases) 仍然适用。

### 使用 context

标准 API 与 [ClickHouse API](#using-context) 一样，支持通过 context 传递截止时间、取消信号以及其他请求作用域的值。与 ClickHouse API 不同的是，这里是通过使用带有 `Context` 后缀的方法变体来实现的。也就是说，诸如 `Exec` 这类默认使用后台 context 的方法，都有一个变体 `ExecContext`，可以在其中将 context 作为第一个参数传入。这样就可以在应用流程的任意阶段传递 context。例如，用户可以在通过 `ConnContext` 建立连接时传入 context，或者在通过 `QueryRowContext` 执行单行查询时传入 context。下面展示了所有可用方法的示例。

有关使用 context 传递截止时间、取消信号、query id、quota key 和连接设置的更多详细信息，请参阅 [ClickHouse API](#using-context) 中的 “Using Context” 一节。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// 创建 JSON 列需要设置 allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// 可以通过 context 取消查询
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// 为查询设置截止时间 - 到达指定时间后将取消查询。同样仅终止连接,
// 查询将在 ClickHouse 中继续执行直至完成
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}
```


// 设置查询 ID 以便在日志中追踪查询,例如参见 system.query_log
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
// 设置配额键 - 首先创建配额
if \_, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
return err
}

// 可以使用上下文取消查询
ctx, cancel = context.WithCancel(context.Background())
// 取消前将获得部分结果
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
"max_block_size": "1",
}))
rows, err := conn.QueryContext(ctx, "SELECT sleepEachRow(1), number FROM numbers(100);")
if err != nil {
return err
}
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

````

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### 会话 {#sessions}

原生连接本身具有会话,而 HTTP 连接则需要用户创建会话 ID 并在上下文中作为设置传递。这样可以使用绑定到会话的功能,例如临时表。

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
var (
    col1 uint8
)
for rows.Next() {
    if err := rows.Scan(&col1); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d\n", col1)
}
````

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 动态扫描 {#dynamic-scanning-1}

与 [ClickHouse API](#dynamic-scanning) 类似,列类型信息可用于创建正确类型变量的运行时实例并传递给 Scan。这样可以在类型未知的情况下读取列。

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
```


[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### 外部表

[外部表](/engines/table-engines/special/external-data/) 允许客户端在执行 `SELECT` 查询时向 ClickHouse 发送数据。该数据会被放入一个临时表中，并可在查询本身中用于计算。

要从客户端随查询一起发送外部数据，用户必须先通过 `ext.NewTable` 构建一个外部表，然后再通过 context 进行传递。

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
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
rows.Close()

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

### OpenTelemetry

ClickHouse 允许在原生协议中携带一个 [trace context](/operations/opentelemetry/)。客户端可以通过函数 `clickhouse.withSpan` 创建一个 Span，并通过 Context 传递，以实现这一点。在使用 HTTP 作为传输协议时，不支持此功能。

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
fmt.Printf("count: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)


## 性能优化建议 {#performance-tips}

* 在可能的情况下使用 ClickHouse API，尤其是针对基础类型（primitive types）。这可以避免大量的反射和间接调用开销。
* 如果需要读取大型数据集，可以考虑调整 [`BlockBufferSize`](#connection-settings)。这会增加内存占用，但可以在行迭代期间并行解码更多数据块。默认值 2 较为保守，可将内存开销降到最低。更高的值会导致内存中驻留更多数据块。由于不同查询可能产生不同的数据块大小，因此需要进行测试。因此，也可以通过 Context 在[查询级别](#using-context)进行设置。
* 插入数据时尽量明确指定类型。尽管客户端尽量保持灵活性，例如允许将字符串解析为 UUID 或 IP，但这需要执行数据校验，并在插入时带来额外开销。
* 尽可能使用按列插入（column-oriented inserts）。同样，这些插入应类型明确，避免由客户端对你的值进行类型转换。
* 遵循 ClickHouse 关于最佳插入性能的[建议](/sql-reference/statements/insert-into/#performance-considerations)。
