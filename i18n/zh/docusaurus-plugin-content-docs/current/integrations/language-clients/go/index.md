---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'ClickHouse 的 Go 客户端支持通过 Go 标准的 database/sql 接口或经过优化的原生接口连接到 ClickHouse。'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';


# ClickHouse Go 客户端



## 一个简单示例 {#a-simple-example}

让我们从一个简单示例开始。本示例将连接到 ClickHouse 并从系统数据库中查询数据。开始之前,您需要准备好连接信息。

### 连接信息 {#connection-details}

<ConnectionDetails />

### 初始化模块 {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### 复制示例代码 {#copy-in-some-sample-code}

将以下代码复制到 `clickhouse-golang-example` 目录中,保存为 `main.go`。

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

### 运行 go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```

### 设置连接信息 {#set-your-connection-details}

之前您已经获取了连接信息。在 `main.go` 的 `connect()` 函数中设置这些信息:

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

### 运行示例 {#run-the-example}

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

### 了解更多 {#learn-more}

本类别的其余文档详细介绍了 ClickHouse Go 客户端的使用细节。


## ClickHouse Go 客户端 {#clickhouse-go-client}

ClickHouse 支持两个官方 Go 客户端。这两个客户端互为补充,分别针对不同的使用场景而设计。

- [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - 高级客户端,支持 Go 标准 database/sql 接口或原生接口。
- [ch-go](https://github.com/ClickHouse/ch-go) - 低级客户端。仅支持原生接口。

clickhouse-go 提供高级接口,允许用户使用面向行的语义和批处理来查询和插入数据,对数据类型的处理较为宽松——只要不会造成精度损失,值就会自动转换。而 ch-go 则提供经过优化的面向列接口,能够以较低的 CPU 和内存开销实现快速的数据块流式传输,但代价是对类型要求更严格且使用更复杂。

从 2.3 版本开始,clickhouse-go 使用 ch-go 来处理编码、解码和压缩等底层功能。需要注意的是,clickhouse-go 还支持 Go `database/sql` 接口标准。两个客户端都使用原生格式进行编码以提供最佳性能,并可通过原生 ClickHouse 协议进行通信。clickhouse-go 还支持使用 HTTP 作为传输机制,适用于需要代理或负载均衡流量的场景。

在选择客户端库时,用户应了解它们各自的优缺点——请参阅"选择客户端库"。

|               | 原生格式 | 原生协议 | HTTP 协议 | 面向行 API | 面向列 API | 类型灵活性 | 压缩 | 查询占位符 |
| :-----------: | :-----------: | :-------------: | :-----------: | :----------------: | :-------------------: | :--------------: | :---------: | :----------------: |
| clickhouse-go |      ✅       |       ✅        |      ✅       |         ✅         |          ✅           |        ✅        |     ✅      |         ✅         |
|     ch-go     |      ✅       |       ✅        |               |                    |          ✅           |                  |     ✅      |                    |


## 选择客户端 {#choosing-a-client}

客户端库的选择取决于您的使用场景和性能需求。对于插入密集型场景(每秒需要执行数百万次插入),我们推荐使用低级客户端 [ch-go](https://github.com/ClickHouse/ch-go)。该客户端避免了将数据从行格式转换为列格式的开销,而 ClickHouse 原生格式正需要这种转换。此外,它避免使用反射或 `interface{}` (`any`) 类型,从而简化了使用方式。

对于以聚合为主的查询工作负载或低吞吐量的插入工作负载,[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) 提供了熟悉的 `database/sql` 接口和更直观的行操作语义。用户还可以选择使用 HTTP 作为传输协议,并利用辅助函数在行数据和结构体之间进行序列化转换。


## clickhouse-go 客户端 {#the-clickhouse-go-client}

clickhouse-go 客户端提供两种 API 接口用于与 ClickHouse 通信:

- ClickHouse 客户端专用 API
- `database/sql` 标准接口 - Golang 提供的 SQL 数据库通用接口。

虽然 `database/sql` 提供了与数据库无关的接口,允许开发者对数据存储进行抽象,但它强制执行某些类型和查询语义,会影响性能。因此,在[性能至关重要](https://github.com/clickHouse/clickHouse-go#benchmark)的场景下应使用客户端专用 API。但是,如果用户希望将 ClickHouse 集成到支持多种数据库的工具中,可能更倾向于使用标准接口。

两种接口都使用[原生格式](/native-protocol/basics.md)和原生协议进行数据编码和通信。此外,标准接口还支持通过 HTTP 进行通信。

|                    | 原生格式 | 原生协议 | HTTP 协议 | 批量写入支持 | 结构体序列化 | 压缩 | 查询占位符 |
| :----------------: | :-----------: | :-------------: | :-----------: | :----------------: | :---------------: | :---------: | :----------------: |
|   ClickHouse API   |      ✅       |       ✅        |               |         ✅         |        ✅         |     ✅      |         ✅         |
| `database/sql` API |      ✅       |       ✅        |      ✅       |         ✅         |                   |     ✅      |         ✅         |


## 安装 {#installation}

驱动程序的 v1 版本已弃用,将不再提供功能更新或新 ClickHouse 类型的支持。用户应迁移到 v2 版本,其性能更优。

要安装 2.x 版本的客户端,请将该包添加到您的 go.mod 文件中:

`require github.com/ClickHouse/clickhouse-go/v2 main`

或者,克隆代码仓库:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

要安装其他版本,请相应修改路径或分支名称。

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

### 版本控制与兼容性 {#versioning--compatibility}

客户端独立于 ClickHouse 发布。2.x 代表当前正在开发的主版本。所有 2.x 版本之间应相互兼容。

#### ClickHouse 兼容性 {#clickhouse-compatibility}

客户端支持:

- [此处](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)记录的所有当前支持的 ClickHouse 版本。当 ClickHouse 版本不再受支持时,也将不再针对客户端版本进行主动测试。
- 客户端发布日期起 2 年内的所有 ClickHouse 版本。注意,仅对 LTS 版本进行主动测试。

#### Golang 兼容性 {#golang-compatibility}

|  客户端版本  | Golang 版本 |
| :--------------: | :-------------: |
| => 2.0 &lt;= 2.2 |   1.17, 1.18    |
|      >= 2.3      |      1.18       |


## ClickHouse 客户端 API {#clickhouse-client-api}

ClickHouse 客户端 API 的所有代码示例可以在[这里](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)找到。

### 连接 {#connecting}

以下示例演示了如何连接到 ClickHouse 并返回服务器版本——假设 ClickHouse 未启用安全设置且可以使用默认用户访问。

注意,我们使用默认的原生端口进行连接。

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

**对于所有后续示例,除非明确显示,否则我们假设 ClickHouse `conn` 变量已创建并可用。**

#### 连接设置 {#connection-settings}

打开连接时,可以使用 Options 结构体来控制客户端行为。以下设置可用:

- `Protocol` - Native 或 HTTP。HTTP 目前仅支持 [database/sql API](#databasesql-api)。
- `TLS` - TLS 选项。非 nil 值启用 TLS。参见[使用 TLS](#using-tls)。
- `Addr` - 包含端口的地址切片。
- `Auth` - 身份验证详细信息。参见[身份验证](#authentication)。
- `DialContext` - 自定义拨号函数,用于确定如何建立连接。
- `Debug` - true/false 以启用调试。
- `Debugf` - 提供一个函数来处理调试输出。需要将 `debug` 设置为 true。
- `Settings` - ClickHouse 设置的映射。这些设置将应用于所有 ClickHouse 查询。[使用 Context](#using-context) 允许为每个查询单独设置配置。
- `Compression` - 为数据块启用压缩。参见[压缩](#compression)。
- `DialTimeout` - 建立连接的最大时间。默认为 `1s`。
- `MaxOpenConns` - 任何时候可使用的最大连接数。空闲池中可能有更多或更少的连接,但任何时候只能使用此数量的连接。默认为 `MaxIdleConns+5`。
- `MaxIdleConns` - 池中维护的连接数。如果可能,连接将被重用。默认为 `5`。
- `ConnMaxLifetime` - 保持连接可用的最大生命周期。默认为 1 小时。连接在此时间后将被销毁,并根据需要向池中添加新连接。
- `ConnOpenStrategy` - 确定如何使用节点地址列表来打开连接。参见[连接到多个节点](#connecting-to-multiple-nodes)。
- `BlockBufferSize` - 一次解码到缓冲区的最大数据块数。较大的值会增加并行化程度,但会消耗更多内存。数据块大小取决于查询,因此虽然您可以在连接上设置此参数,但我们建议根据查询返回的数据为每个查询单独覆盖此设置。默认为 `2`。

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

#### 连接池 {#connection-pooling}


客户端维护一个连接池,根据需要在多个查询之间复用这些连接。任何时候最多使用 `MaxOpenConns` 个连接,最大池大小由 `MaxIdleConns` 控制。客户端在每次执行查询时从连接池获取一个连接,使用后将其返回连接池以供复用。连接在批处理的整个生命周期中被占用,并在调用 `Send()` 时释放。

除非用户设置 `MaxOpenConns=1`,否则无法保证后续查询会使用连接池中的同一个连接。这种设置很少需要,但在使用临时表的场景下可能是必需的。

另外请注意,`ConnMaxLifetime` 默认为 1 小时。如果节点离开集群,这可能导致 ClickHouse 的负载不均衡。当某个节点不可用时,连接会重新分配到其他节点。即使有问题的节点重新加入集群,这些连接默认也会持续存在且不会刷新,持续时间为 1 小时。在高负载场景下,建议降低此值。

### 使用 TLS {#using-tls}

在底层,所有客户端连接方法(`DSN/OpenDB/Open`)都会使用 [Go tls 包](https://pkg.go.dev/crypto/tls)来建立安全连接。如果 Options 结构体包含非 nil 的 `tls.Config` 指针,客户端就会使用 TLS。

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

这个最小化的 `TLS.Config` 通常足以连接到 ClickHouse 服务器的安全原生端口(通常为 9440)。如果 ClickHouse 服务器没有有效的证书(已过期、主机名错误或未由公认的根证书颁发机构签名),可以将 `InsecureSkipVerify` 设置为 true,但强烈不建议这样做。

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

如果需要额外的 TLS 参数,应用程序代码应在 `tls.Config` 结构体中设置所需的字段。这可以包括指定密码套件、强制使用特定的 TLS 版本(如 1.2 或 1.3)、添加内部 CA 证书链、添加客户端证书(和私钥,如果 ClickHouse 服务器要求),以及其他更专业的安全设置选项。

### 身份验证 {#authentication}

在连接详细信息中指定 Auth 结构体来设置用户名和密码。

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

### 连接到多个节点 {#connecting-to-multiple-nodes}

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

提供两种连接策略:

- `ConnOpenInOrder`(默认)- 按顺序使用地址。仅在使用列表中靠前的地址连接失败时,才会使用后续地址。这实际上是一种故障转移策略。
- `ConnOpenRoundRobin` - 使用轮询策略在各地址之间进行负载均衡。

可以通过 `ConnOpenStrategy` 选项控制连接策略:

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

### 执行 {#execution}

可以通过 `Exec` 方法执行任意语句。这对于 DDL 和简单语句很有用。不应将其用于大批量插入或查询迭代。

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

注意可以向查询传递 Context。这可用于传递特定的查询级别设置 - 请参阅[使用 Context](#using-context)。

### 批量插入 {#batch-insert}

要插入大量行,客户端提供了批处理语义。这需要准备一个批次,可以向其追加行。最后通过 `Send()` 方法发送。批次在内存中保存,直到执行 `Send`。

建议在批次上调用 `Close` 以防止连接泄漏。这可以在准备批次后通过 `defer` 关键字完成。如果从未调用 `Send`,这将清理连接。请注意,如果未追加任何行,查询日志中将显示 0 行插入。

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

ClickHouse 的相关建议请参考[此处](/guides/inserting-data#best-practices-for-inserts)。批次不应在多个 go-routine 之间共享 - 请为每个 routine 单独构造批次。

从上面的示例可以看出,在追加行时需要确保变量类型与列类型一致。虽然类型映射通常比较直观,但此接口设计得较为灵活,只要不会造成精度损失,类型就会自动转换。例如,以下代码演示了将字符串插入 datetime64 类型列。

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

有关每种列类型所支持的 Go 类型的完整说明,请参阅[类型转换](#type-conversions)。

### 查询行 {#querying-rows}

用户可以使用 `QueryRow` 方法查询单行,或通过 `Query` 方法获取游标以迭代结果集。前者接受一个目标位置用于数据反序列化,而后者需要在每一行上调用 `Scan` 方法。

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

请注意,在这两种情况下,我们都需要传递变量的指针,以便将相应的列值反序列化到这些变量中。这些指针必须按照 `SELECT` 语句中指定的顺序传递 - 默认情况下,在使用 `SELECT *` 时将按照列声明的顺序处理,如上所示。


与插入操作类似,Scan 方法要求目标变量具有适当的类型。该方法同样力求灵活,在不会造成精度损失的前提下尽可能进行类型转换,例如上述示例展示了将 UUID 列读取到字符串变量中。有关每种列类型支持的完整 Go 类型列表,请参阅[类型转换](#type-conversions)。

最后,请注意可以向 `Query` 和 `QueryRow` 方法传递 `Context`。这可用于查询级别的设置 - 详情请参阅[使用 Context](#using-context)。

### 异步插入 {#async-insert}

通过 Async 方法支持异步插入。这允许用户指定客户端是等待服务器完成插入,还是在接收到数据后立即响应。这实际上控制了参数 [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)。

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
    )`, i, "Golang SQL database driver"), false); err != nil {
        return err
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

### 列式插入 {#columnar-insert}

可以按列格式进行插入。如果数据已经按此结构组织,这可以避免转换为行格式的需要,从而提供性能优势。

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
    col2 = append(col2, "Golang SQL database driver")
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

### 使用结构体 {#using-structs}

对于用户而言,Golang 结构体提供了 ClickHouse 中数据行的逻辑表示。为了支持这一点,原生接口提供了几个便捷函数。

#### 使用序列化的 Select {#select-with-serialize}

Select 方法允许通过单次调用将一组响应行序列化为结构体切片。

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

#### 扫描结构体 {#scan-struct}


`ScanStruct` 允许将查询结果中的单行数据映射到结构体。

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

#### 追加结构体 {#append-struct}

`AppendStruct` 允许将结构体追加到现有的[批处理](#batch-insert)中,并将其解释为完整的一行。这要求结构体的列在名称和类型上都与表对齐。虽然所有列都必须有对应的结构体字段,但某些结构体字段可能没有对应的列。这些字段将被忽略。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL database driver",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "this will be ignored",
    })
    if err != nil {
        return err
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 类型转换 {#type-conversions}

客户端旨在尽可能灵活地接受用于插入和响应映射的变量类型。在大多数情况下,ClickHouse 列类型都存在对应的 Golang 类型,例如 [UInt64](/sql-reference/data-types/int-uint/) 对应 [uint64](https://pkg.go.dev/builtin#uint64)。这些逻辑映射应始终受支持。用户可能希望使用可以插入到列中或用于接收响应的变量类型,前提是先对变量或接收的数据进行转换。客户端旨在透明地支持这些转换,因此用户无需在插入前精确转换数据,并在查询时提供灵活的映射。这种透明转换不允许精度损失。例如,uint32 不能用于接收来自 UInt64 列的数据。相反,字符串可以插入到 datetime64 字段中,前提是满足格式要求。

当前支持的基本类型转换记录在[此处](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)。

这项工作正在进行中,可以分为插入时(`Append`/`AppendRow`)和读取时(通过 `Scan`)。如果您需要支持特定的转换,请提交 issue。

### 复杂类型 {#complex-types}

#### Date/DateTime 类型 {#datedatetime-types}

ClickHouse Go 客户端支持 `Date`、`Date32`、`DateTime` 和 `DateTime64` 日期/日期时间类型。日期可以作为格式为 `2006-01-02` 的字符串插入,或使用原生 Go 的 `time.Time{}` 或 `sql.NullTime`。日期时间也支持后两种类型,但要求字符串以 `2006-01-02 15:04:05` 格式传递,可选时区偏移量,例如 `2006-01-02 15:04:05 +08:00`。在读取时,`time.Time{}` 和 `sql.NullTime` 均受支持,以及任何实现 `sql.Scanner` 接口的类型。

时区信息的处理取决于 ClickHouse 类型以及值是插入还是读取:


- **DateTime/DateTime64**
  - 在**插入**时,值以 UNIX 时间戳格式发送到 ClickHouse。如果未提供时区,客户端将使用客户端的本地时区。`time.Time{}` 或 `sql.NullTime` 将相应地转换为 epoch 时间。
  - 在**查询**时,如果设置了列的时区,则在返回 `time.Time` 值时将使用该时区。否则,将使用服务器的时区。
- **Date/Date32**
  - 在**插入**时,将日期转换为 unix 时间戳时会考虑日期的时区,即在存储为日期之前将按时区进行偏移,因为 ClickHouse 中的 Date 类型不包含时区信息。如果字符串值中未指定时区,将使用本地时区。
  - 在**查询**时,日期被扫描到 `time.Time{}` 或 `sql.NullTime{}` 实例中,返回时不包含时区信息。

#### 数组 {#array}

数组应作为切片插入。元素的类型规则与[基本类型](#type-conversions)的规则一致,即在可能的情况下元素将被转换。

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
rows.Close()
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### 映射 {#map}

映射应作为 Golang map 插入,其键和值需符合[前面](#type-conversions)定义的类型规则。

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

#### 元组 {#tuples}

元组表示任意长度的一组列。这些列可以显式命名,也可以仅指定类型,例如:

```sql
//未命名
Col1 Tuple(String, Int64)

//已命名
Col2 Tuple(name String, id Int64, age uint8)
```

在这些方法中,命名元组提供了更大的灵活性。未命名元组必须使用切片进行插入和读取,而命名元组还兼容 map。


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

// both named and unnamed can be added with slices. Note we can use strongly typed lists and maps if all elements are the same type
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
// named tuples can be retrieved into a map or slices, unnamed just slices
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注意:支持类型化的切片和映射,前提是命名元组中的子列类型必须相同。

#### Nested {#nested}

Nested 字段等同于命名元组的数组。其使用方式取决于用户是否将 [flatten_nested](/operations/settings/settings#flatten_nested) 设置为 1 或 0。

将 flatten_nested 设置为 0 时,Nested 列将保持为单个元组数组。这允许用户使用映射切片进行插入和检索,并支持任意级别的嵌套。映射的键必须与列名相同,如下例所示。

注意:由于映射表示元组,因此必须使用 `map[string]interface{}` 类型。值目前不是强类型。

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

[完整示例 - `flatten_nested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

如果使用 `flatten_nested` 的默认值 1,嵌套列会被展平为独立的数组。这需要使用嵌套切片进行插入和检索。虽然任意级别的嵌套可能有效,但这并未得到官方支持。

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

注意:嵌套列必须具有相同的维度。例如,在上面的示例中,`Col_2_2` 和 `Col_2_1` 必须具有相同数量的元素。

由于接口更加简洁且官方支持嵌套,我们推荐使用 `flatten_nested=0`。

#### 地理类型 {#geo-types}


该客户端支持地理类型 Point、Ring、Polygon 和 MultiPolygon。在 Golang 中,这些字段使用 [github.com/paulmach/orb](https://github.com/paulmach/orb) 包。

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

#### UUID {#uuid}

UUID 类型由 [github.com/google/uuid](https://github.com/google/uuid) 包支持。用户也可以将 UUID 作为字符串发送和序列化,或使用任何实现了 `sql.Scanner` 或 `Stringify` 的类型。

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

#### Decimal {#decimal}

Decimal 类型由 [github.com/shopspring/decimal](https://github.com/shopspring/decimal) 包支持。

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

Go 中的 Nil 值对应 ClickHouse 的 NULL。当字段声明为 Nullable 时可以使用此值。在插入数据时,Nil 可以传递给普通列和 Nullable 列。对于普通列,将持久化该类型的默认值,例如字符串类型的空字符串。对于 Nullable 列,将在 ClickHouse 中存储 NULL 值。

在扫描数据时,用户必须传递支持 nil 的类型指针(例如 *string)来表示 Nullable 字段的 nil 值。在下面的示例中,col1 是 Nullable(String) 类型,因此接收 **string 指针,这样就可以表示 nil 值。

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

客户端还支持 `sql.Null*` 类型,例如 `sql.NullInt64`。这些类型与对应的 ClickHouse 类型兼容。

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

对压缩方法的支持取决于所使用的底层协议。对于原生协议,客户端支持 `LZ4` 和 `ZSTD` 压缩。压缩仅在块级别执行。可以通过在连接配置中包含 `Compression` 参数来启用压缩。

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

最后,DateTime64 字段需要指定精度以确保参数正确渲染。但是,客户端无法获知该字段的精度级别,因此用户必须提供。为了方便这一点,我们提供了 `DateNamed` 参数。


```go
var count uint64
// 数组将被展开
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("数组展开计数: %d\n", count)
// 使用 [] 时数组将被保留
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("数组计数: %d\n", count)
// 分组集合允许我们构造 ( ) 列表
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("分组计数: %d\n", count)
// 在需要嵌套时更有用
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("分组计数: %d\n", count)
// 当需要时间精度时使用 DateNamed
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("命名日期计数: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### 使用上下文 {#using-context}

Go 上下文提供了一种跨 API 边界传递截止时间、取消信号和其他请求范围值的机制。连接上的所有方法都接受上下文作为其第一个参数。虽然之前的示例使用了 context.Background(),但用户可以利用此功能来传递设置和截止时间以及取消查询。

传递使用 `withDeadline` 创建的上下文可以对查询设置执行时间限制。请注意,这是一个绝对时间,过期只会释放连接并向 ClickHouse 发送取消信号。也可以使用 `WithCancel` 显式取消查询。

辅助函数 `clickhouse.WithQueryID` 和 `clickhouse.WithQuotaKey` 允许指定查询 ID 和配额键。查询 ID 可用于在日志中跟踪查询以及用于取消操作。配额键可用于基于唯一键值对 ClickHouse 使用施加限制 - 有关更多详细信息,请参阅[配额管理](/operations/access-rights#quotas-management)。

用户还可以使用上下文来确保设置仅应用于特定查询,而不是整个连接,如[连接设置](#connection-settings)中所示。

最后,用户可以通过 `clickhouse.WithBlockSize` 控制块缓冲区的大小。这会覆盖连接级别的设置 `BlockBufferSize`,并控制在任何时候解码并保存在内存中的最大块数。较大的值可能意味着更高的并行度,但会消耗更多内存。

以下是上述功能的示例。

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
// 我们可以使用上下文将设置传递给特定的 API 调用
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// 要创建 JSON 列,我们需要设置 allow_experimental_object_type=1
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
// 查询在 ClickHouse 中会继续执行直到完成
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

可以在查询时请求进度、性能分析和日志信息。进度信息会报告在 ClickHouse 中已读取和处理的行数和字节数统计。性能分析信息则提供返回给客户端的数据摘要,包括字节总数(未压缩)、行数和块数。日志信息提供线程相关的统计信息,例如内存使用量和数据处理速度。

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

用户可能需要读取不知道其模式或返回字段类型的表。这在执行临时数据分析或编写通用工具时很常见。为实现此目的,查询响应中提供了列类型信息。可以结合 Go 反射使用这些信息,在运行时创建正确类型的变量实例并传递给 Scan。

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


[外部表](/engines/table-engines/special/external-data/)允许客户端在执行 SELECT 查询时向 ClickHouse 发送数据。这些数据会被放入临时表中,可在查询中用于计算。

要通过查询向 ClickHouse 发送外部数据,用户必须先通过 `ext.NewTable` 构建外部表,然后通过上下文传递。

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

### Open telemetry {#open-telemetry}

ClickHouse 允许将[跟踪上下文](/operations/opentelemetry/)作为原生协议的一部分传递。客户端支持通过 `clickhouse.withSpan` 函数创建 Span,并通过 Context 传递来实现此功能。

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

有关使用跟踪功能的完整详细信息,请参阅 [OpenTelemetry 支持](/operations/opentelemetry/)。


## Database/SQL API {#databasesql-api}

`database/sql` 或"标准"API 允许用户在应用程序代码需要与底层数据库无关的场景中使用客户端,通过遵循标准接口来实现。这会带来一些代价——额外的抽象层、间接层以及与 ClickHouse 不完全对齐的原语。然而,在工具需要连接到多个数据库的场景中,这些代价通常是可以接受的。

此外,该客户端支持使用 HTTP 作为传输层——数据仍将以原生格式编码以获得最佳性能。

以下内容旨在与 ClickHouse API 的文档结构保持一致。

标准 API 的完整代码示例可以在[这里](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)找到。

### 连接 {#connecting-1}

可以通过格式为 `clickhouse://<host>:<port>?<query_option>=<value>` 的 DSN 字符串和 `Open` 方法建立连接,也可以通过 `clickhouse.OpenDB` 方法建立连接。后者不是 `database/sql` 规范的一部分,但会返回一个 `sql.DB` 实例。该方法提供了诸如性能分析等功能,而这些功能在 `database/sql` 规范中没有明显的暴露方式。

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

**对于所有后续示例,除非明确显示,否则我们假设已创建 ClickHouse `conn` 变量并且可用。**

#### 连接设置 {#connection-settings-1}

可以在 DSN 字符串中传递以下参数:

- `hosts` - 用于负载均衡和故障转移的单地址主机的逗号分隔列表——参见[连接到多个节点](#connecting-to-multiple-nodes)。
- `username/password` - 身份验证凭据——参见[身份验证](#authentication)
- `database` - 选择当前默认数据库
- `dial_timeout` - 持续时间字符串是一个可能带符号的十进制数字序列,每个数字可带有可选的小数部分和单位后缀,例如 `300ms`、`1s`。有效的时间单位为 `ms`、`s`、`m`。
- `connection_open_strategy` - `random/in_order`(默认为 `random`)——参见[连接到多个节点](#connecting-to-multiple-nodes)
  - `round_robin` - 从集合中以轮询方式选择服务器
  - `in_order` - 按指定顺序选择第一个可用服务器
- `debug` - 启用调试输出(布尔值)
- `compress` - 指定压缩算法——`none`(默认)、`zstd`、`lz4`、`gzip`、`deflate`、`br`。如果设置为 `true`,将使用 `lz4`。原生通信仅支持 `lz4` 和 `zstd`。
- `compress_level` - 压缩级别(默认为 `0`)。参见压缩。这是特定于算法的:
  - `gzip` - `-2`(最快速度)到 `9`(最佳压缩)
  - `deflate` - `-2`(最快速度)到 `9`(最佳压缩)
  - `br` - `0`(最快速度)到 `11`(最佳压缩)
  - `zstd`、`lz4` - 忽略
- `secure` - 建立安全的 SSL 连接(默认为 `false`)
- `skip_verify` - 跳过证书验证(默认为 `false`)
- `block_buffer_size` - 允许用户控制块缓冲区大小。参见 [`BlockBufferSize`](#connection-settings)。(默认为 `2`)


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

#### 连接池 {#connection-pooling-1}

用户可以按照[连接到多个节点](#connecting-to-multiple-nodes)中描述的方式来控制所提供的节点地址列表的使用。但是,连接管理和连接池在设计上由 `sql.DB` 负责处理。

#### 通过 HTTP 连接 {#connecting-over-http}

默认情况下,连接通过原生协议建立。对于需要使用 HTTP 的用户,可以通过修改 DSN 以包含 HTTP 协议,或在连接选项中指定 Protocol 来启用。

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

#### 连接到多个节点 {#connecting-to-multiple-nodes-1}

如果使用 `OpenDB`,可以采用与 ClickHouse API 相同的选项方式连接到多个主机,并可选择性地指定 `ConnOpenStrategy`。

对于基于 DSN 的连接,连接字符串接受多个主机和一个 `connection_open_strategy` 参数,该参数的值可以设置为 `round_robin` 或 `in_order`。

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

### 使用 TLS {#using-tls-1}

如果使用 DSN 连接字符串,可以通过参数 "secure=true" 启用 SSL。`OpenDB` 方法采用与 [TLS 原生 API](#using-tls) 相同的方式,依赖于指定非空的 TLS 结构体。虽然 DSN 连接字符串支持 skip_verify 参数来跳过 SSL 验证,但更高级的 TLS 配置需要使用 `OpenDB` 方法,因为它允许传递配置对象。


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

### 身份验证 {#authentication-1}

使用 `OpenDB` 时,可以通过常规选项传递身份验证信息。对于基于 DSN 的连接,可以在连接字符串中传递用户名和密码——既可以作为参数传递,也可以作为编码在地址中的凭据传递。

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

### 执行语句 {#execution-1}

获得连接后,用户可以通过 Exec 方法执行 `sql` 语句。

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

此方法不支持接收上下文——默认情况下使用后台上下文执行。如需使用上下文,可以使用 `ExecContext` 方法——请参阅[使用上下文](#using-context)。

### 批量插入 {#batch-insert-1}

可以通过 `Begin` 方法创建 `sql.Tx` 来实现批量操作。然后使用 `Prepare` 方法配合 `INSERT` 语句获取批量操作对象,该方法返回一个 `sql.Stmt`,可以使用 `Exec` 方法向其追加行。批量数据将在内存中累积,直到在原始 `sql.Tx` 上执行 `Commit` 提交。


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

### 查询行 {#querying-rows-1}

使用 `QueryRow` 方法可以查询单行数据。该方法返回一个 \*sql.Row 对象,可以在其上调用 Scan 方法,传入变量指针以将列数据反序列化到这些变量中。`QueryRowContext` 变体允许传递自定义上下文而非默认的后台上下文 - 请参阅[使用 Context](#using-context)。

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

迭代多行数据需要使用 `Query` 方法。该方法返回一个 `*sql.Rows` 结构体,可以在其上调用 Next 方法来遍历各行。对应的 `QueryContext` 方法允许传递上下文。

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

### 异步插入 {#async-insert-1}

通过 `ExecContext` 方法执行插入操作可以实现异步插入。需要向该方法传递一个启用了异步模式的上下文,如下所示。这允许用户指定客户端是等待服务器完成插入操作,还是在服务器接收到数据后立即响应。这实际上控制了 [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert) 参数。

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
        )`, i, "Golang SQL database driver"))
        if err != nil {
            return err
        }
    }
}
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### 列式插入 {#columnar-insert-1}

标准接口不支持此功能。

### 使用结构体 {#using-structs-1}

标准接口不支持此功能。

### 类型转换 {#type-conversions-1}

标准 `database/sql` 接口应支持与 [ClickHouse API](#type-conversions) 相同的类型。存在一些例外情况,主要涉及复杂类型,我们在下文中进行说明。与 ClickHouse API 类似,客户端在接受用于插入和响应序列化的变量类型方面力求尽可能灵活。更多详情请参阅[类型转换](#type-conversions)。

### 复杂类型 {#complex-types-1}

除非另有说明,复杂类型的处理方式应与 [ClickHouse API](#complex-types) 相同。差异源于 `database/sql` 的内部实现。

#### 映射 {#maps}

与 ClickHouse API 不同,标准 API 要求映射在扫描时必须是强类型的。例如,用户不能为 `Map(String,String)` 字段传递 `map[string]interface{}`,而必须使用 `map[string]string`。`interface{}` 变量始终兼容,可用于更复杂的结构。读取时不支持结构体。

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

插入行为与 ClickHouse API 相同。

### 压缩 {#compression-1}

标准 API 支持与原生 [ClickHouse API](#compression) 相同的压缩算法,即块级别的 `lz4` 和 `zstd` 压缩。此外,HTTP 连接还支持 gzip、deflate 和 br 压缩。如果启用了其中任何一种压缩方式,则会在插入期间和查询响应时对块进行压缩。其他请求(例如 ping 或查询请求)将保持未压缩状态。这与 `lz4` 和 `zstd` 选项的行为一致。

如果使用 `OpenDB` 方法建立连接,可以传递压缩配置。这包括指定压缩级别的能力(见下文)。如果通过 `sql.Open` 使用 DSN 连接,请使用 `compress` 参数。该参数可以是特定的压缩算法,即 `gzip`、`deflate`、`br`、`zstd` 或 `lz4`,也可以是布尔标志。如果设置为 true,将使用 `lz4`。默认值为 `none`,即禁用压缩。

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

应用的压缩级别可以通过 DSN 参数 compress_level 或 Compression 选项的 Level 字段来控制。默认值为 0,但具体取决于算法:

- `gzip` - `-2`(最快速度)到 `9`(最佳压缩)
- `deflate` - `-2`(最快速度)到 `9`(最佳压缩)
- `br` - `0`(最快速度)到 `11`(最佳压缩)
- `zstd`、`lz4` - 忽略

### 参数绑定 {#parameter-binding-1}

标准 API 支持与 [ClickHouse API](#parameter-binding) 相同的参数绑定功能,允许将参数传递给 `Exec`、`Query` 和 `QueryRow` 方法(以及它们对应的 [Context](#using-context) 变体)。支持位置参数、命名参数和编号参数。

```go
var count uint64
// 位置绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置绑定计数: %d\n", count)
// 数字绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数字绑定计数: %d\n", count)
// 命名绑定
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("命名绑定计数: %d\n", count)
```

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

注意[特殊情况](#special-cases)仍然适用。

### 使用上下文 {#using-context-1}

标准 API 支持与 [ClickHouse API](#using-context) 相同的通过上下文传递截止时间、取消信号和其他请求范围值的能力。与 ClickHouse API 不同,这是通过使用方法的 `Context` 变体来实现的,即默认使用后台上下文的方法(如 `Exec`)具有一个变体 `ExecContext`,可以将上下文作为第一个参数传递。这允许在应用程序流程的任何阶段传递上下文。例如,用户可以在通过 `ConnContext` 建立连接时或通过 `QueryRowContext` 请求查询行时传递上下文。下面显示了所有可用方法的示例。

有关使用上下文传递截止时间、取消信号、查询 ID、配额键和连接设置的更多详细信息,请参阅 [ClickHouse API](#using-context) 的使用上下文部分。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// 要创建 JSON 列,我们需要 allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// 可以使用上下文取消查询
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// 为查询设置截止时间 - 这将在达到绝对时间后取消查询。同样仅终止连接,
// 查询将在 ClickHouse 中继续完成
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

```


// 设置查询 ID 以便在日志中追踪查询,例如查看 system.query_log
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

// 可以使用 context 取消查询
ctx, cancel = context.WithCancel(context.Background())
// 在取消之前我们会获取一些结果
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
fmt.Println("预期取消")
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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### 会话 {#sessions}

虽然原生连接本身具有会话,但通过 HTTP 的连接需要用户创建一个会话 ID,并将其作为设置传入 context 中。这允许使用绑定到会话的功能,例如临时表。

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

[完整示例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 动态扫描 {#dynamic-scanning-1}

与 [ClickHouse API](#dynamic-scanning) 类似,列类型信息可用于允许用户创建正确类型变量的运行时实例,这些实例可以传递给 Scan。这允许在类型未知的情况下读取列。

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

### 外部表 {#external-tables-1}

[外部表](/engines/table-engines/special/external-data/)允许客户端在执行 `SELECT` 查询时向 ClickHouse 发送数据。这些数据会被存放在临时表中,可在查询中用于计算。

要在查询中向服务端发送外部数据,用户必须先通过 `ext.NewTable` 构建外部表,然后通过上下文传递。

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

### OpenTelemetry {#open-telemetry-1}

ClickHouse 允许将[跟踪上下文](/operations/opentelemetry/)作为原生协议的一部分传递。客户端支持通过 `clickhouse.withSpan` 函数创建 Span 并通过 Context 传递来实现此功能。使用 HTTP 作为传输协议时不支持此功能。

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

- 尽可能使用 ClickHouse API,特别是对于基本类型。这可以避免大量的反射和间接调用开销。
- 如果读取大型数据集,请考虑调整 [`BlockBufferSize`](#connection-settings)。这会增加内存占用,但可以在行迭代期间并行解码更多数据块。默认值 2 较为保守,可最小化内存开销。更高的值意味着内存中会有更多数据块。由于不同的查询可能产生不同大小的数据块,因此需要进行测试。可以通过 Context 在[查询级别](#using-context)进行设置。
- 插入数据时请明确指定类型。虽然客户端力求灵活(例如允许将字符串解析为 UUID 或 IP),但这需要数据验证并会在插入时产生额外开销。
- 尽可能使用列式插入方式。同样,这些插入应该使用强类型,避免客户端需要转换您的数据值。
- 遵循 ClickHouse 的[建议](/sql-reference/statements/insert-into/#performance-considerations)以获得最佳插入性能。
