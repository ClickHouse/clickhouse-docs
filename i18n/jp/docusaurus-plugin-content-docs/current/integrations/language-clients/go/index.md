---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'The Go clients for ClickHouse allows users to connect to ClickHouse using either the Go standard database/sql interface or an optimized native interface.'
title: 'ClickHouse Go'
---
```

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';

# ClickHouse Go
## A simple example {#a-simple-example}

Let's Go with a simple example.  This will connect to ClickHouse and select from the system database.  To get started you will need your connection details.
### Connection Details {#connection-details}

<ConnectionDetails />
### Initialize a module {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### Copy in some sample code {#copy-in-some-sample-code}

Copy this code into the `clickhouse-golang-example` directory as `main.go`.

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
### Run go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```
### Set your connection details {#set-your-connection-details}
Earlier you looked up your connection details.  Set them in `main.go` in the `connect()` function:

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
### Run the example {#run-the-example}
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
### Learn more {#learn-more}
The rest of the documentation in this category covers the details of the ClickHouse Go client.
## ClickHouse Go Client {#clickhouse-go-client}

ClickHouse supports two official Go clients. These clients are complementary and intentionally support different use cases.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - 高レベル言語クライアントで、Goの標準database/sqlインタフェースまたはネイティブインタフェースのどちらかをサポートします。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェースのみ。

clickhouse-goは高レベルのインターフェースを提供し、ユーザーが行指向の意味論とデータタイプに関して寛容なバッチ機能を使用してデータをクエリして挿入できるようにします。ch-goは最適化された列指向のインターフェースを提供し、タイプの厳密性とより複雑な使用と引き換えに、低CPUおよびメモリオーバーヘッドでの高速データブロックストリーミングを提供します。

バージョン2.3以降、Clickhouse-goはエンコード、デコード、圧縮などの低レベルの機能にch-goを利用しています。clickhouse-goはGoの`database/sql`インターフェース標準もサポートしています。両方のクライアントは、最適なパフォーマンスを提供するためにエンコーディングにはネイティブ形式を使用し、ネイティブClickHouseプロトコルを介して通信できます。また、clickhouse-goはユーザーがトラフィックをプロキシまたは負荷分散する必要がある場合に備えてHTTPをその輸送メカニズムとしてサポートします。

クライアントライブラリを選択する際に、ユーザーはそれぞれの利点と欠点を認識する必要があります - クライアントライブラリの選択を参照してください。

|               | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | 行指向API | 列指向API | タイプの柔軟性 | 圧縮 | クエリプレースホルダー |
|:-------------:|:-------------:|:-------------------:|:-------------:|:---------:|:---------:|:--------------:|:-----:|:----------------------:|
| clickhouse-go |       ✅       |       ✅             |       ✅       |    ✅      |    ✅      |       ✅        |  ✅    |          ✅            |
|     ch-go     |       ✅       |       ✅             |               |           |    ✅      |                  |  ✅    |                        |
## Choosing a Client {#choosing-a-client}

Selecting a client library depends on your usage patterns and need for optimal performance. For insert heavy use cases, where millions of inserts are required per second, we recommend using the low level client [ch-go](https://github.com/ClickHouse/ch-go). This client avoids the associated overhead of pivoting the data from a row-orientated format to columns, as the ClickHouseネイティブ形式 requires. Furthermore, it avoids any reflection or use of the `interface{}` (`any`) type to simplify usage.

For query workloads focused on aggregations or lower throughput insert workloads, the [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) provides a familiar `database/sql` interface and more straightforward row semantics. Users can also optionally use HTTP for the transport protocol and take advantage of helper functions to marshal rows to and from structs.
## The clickhouse-go Client {#the-clickhouse-go-client}

The clickhouse-go client provides two API interfaces for communicating with ClickHouse:

* ClickHouse client-specific API
* `database/sql` standard - generic interface around SQL databases provided by Golang.

While the `database/sql` provides a database-agnostic interface, allowing developers to abstract their data store, it enforces some typing and query semantics that impact performance. For this reason, the client-specific API should be used where [performance is important](https://github.com/clickHouse/clickHouse-go#benchmark). However, users who wish to integrate ClickHouse into tooling, which supports multiple databases, may prefer to use the standard interface.

Both interfaces encode data using the [native format](/native-protocol/basics.md) and native protocol for communication. Additionally, the standard interface supports communication over HTTP.

|                    | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | バルク書き込みサポート | 構造体マーシャリング | 圧縮 | クエリプレースホルダー |
|:------------------:|:-------------:|:-------------------:|:-------------:|:---------------------:|:-------------------:|:-----:|:----------------------:|
|   ClickHouse API   |       ✅       |       ✅             |               |          ✅           |         ✅           |  ✅    |          ✅            |
| `database/sql` API |       ✅       |       ✅             |       ✅       |          ✅           |                     |  ✅    |          ✅            |
## Installation {#installation}

v1 of the driver is deprecated and will not reach feature updates or support for new ClickHouse types. Users should migrate to v2, which offers superior performance.

To install the 2.x version of the client, add the package to your go.mod file:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Or, clone the repository:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

To install another version, modify the path or the branch name accordingly.

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
### Versioning & compatibility {#versioning--compatibility}

The client is released independently of ClickHouse. 2.x represents the current major under development. All versions of 2.x should be compatible with each other.
#### ClickHouse compatibility {#clickhouse-compatibility}

The client supports:

- All currently supported versions of ClickHouse as recorded [here](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). As ClickHouse versions are no longer supported they are also no longer actively tested against client releases.
- All versions of ClickHouse 2 years from the release date of the client. Note only LTS versions are actively tested.
#### Golang compatibility {#golang-compatibility}

| Client Version | Golang Versions |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## ClickHouse Client API {#clickhouse-client-api}

All code examples for the ClickHouse Client API can be found [here](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).
### Connecting {#connecting}

The following example, which returns the server version, demonstrates connecting to ClickHouse - assuming ClickHouse is not secured and accessible with the default user.

Note we use the default native port to connect.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**For all subsequent examples, unless explicitly shown, we assume the use of the ClickHouse `conn` variable has been created and is available.**
#### Connection Settings {#connection-settings}

When opening a connection, an Options struct can be used to control client behavior. The following settings are available:

* `Protocol` - ネイティブまたはHTTPのいずれか。現在、HTTPは[database/sql API](#databasesql-api)に対してのみサポートされています。
* `TLS` - TLSオプション。非nil値はTLSを有効にします。 [Using TLS](#using-tls)を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証の詳細。 [Authentication](#authentication)を参照してください。
* `DialContext` - 接続確立方法を決定するためのカスタムダイヤル関数。
* `Debug` - デバッグを有効にするtrue/false。
* `Debugf` - デバッグ出力を消費するための関数を提供します。`debug`がtrueに設定されている必要があります。
* `Settings` - ClickHouse設定のマップ。これらはすべてのClickHouseクエリに適用されます。[Using Context](#using-context)を使用すると、クエリごとに設定を設定できます。
* `Compression` - ブロックに圧縮を有効にします。 [Compression](#compression)を参照してください。
* `DialTimeout` - 接続を確立する最大時間。デフォルトは`1s`です。
* `MaxOpenConns` - 同時に使用する最大接続数。アイドルプールにはもっと多くの接続または少ない接続がある場合がありますが、この数のみを同時に使用できます。デフォルトは`MaxIdleConns+5`です。
* `MaxIdleConns` - プール内で維持する接続数。可能な場合、接続は再利用されます。デフォルトは`5`です。
* `ConnMaxLifetime` - 接続を利用可能にしておくための最大寿命。デフォルトは1時間です。この時間が経過した接続は破棄され、新しい接続が必要に応じてプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストをどのように消費し、使用して接続を確立する方法を決定します。[Connecting to Multiple Nodes](#connecting-to-multiple-nodes)を参照してください。
* `BlockBufferSize` - 一度にバッファにデコードする最大ブロック数。大きな値はメモリの代償で並列化を増加させます。ブロックサイズはクエリに依存するため、接続時にこれを設定できますが、戻るデータに基づいてクエリごとにオーバーライドすることをお勧めします。デフォルトは`2`です。

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
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)
#### Connection Pooling {#connection-pooling}

The client maintains a pool of connections, reusing these across queries as required. At most, `MaxOpenConns` will be used at any time, with the maximum pool size controlled by the `MaxIdleConns`. The client will acquire a connection from the pool for each query execution, returning it to the pool for reuse. A connection is used for the lifetime of a batch and released on `Send()`.

There is no guarantee the same connection in a pool will be used for subsequent queries unless the user sets `MaxOpenConns=1`. This is rarely needed but may be required for cases where users are using temporary tables.

Also, note that the `ConnMaxLifetime` is by default 1hr. This can lead to cases where the load to ClickHouse becomes unbalanced if nodes leave the cluster. This can occur when a node becomes unavailable, connections will balance to the other nodes. These connections will persist and not be refreshed for 1hr by default, even if the problematic node returns to the cluster. Consider lowering this value in heavy workload cases.
### Using TLS {#using-tls}

At a low level, all client connect methods (`DSN/OpenDB/Open`) will use the[ Go tls package](https://pkg.go.dev/crypto/tls) to establish a secure connection. The client knows to use TLS if the Options struct contains a non-nil `tls.Config` pointer.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

This minimal `TLS.Config` is normally sufficient to connect to the secure native port (normally 9440) on a ClickHouse server. If the ClickHouse server does not have a valid certificate (expired, wrong hostname, not signed by a publicly recognized root Certificate Authority), `InsecureSkipVerify` can be true, but this is strongly discouraged.

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
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

If additional TLS parameters are necessary, the application code should set the desired fields in the `tls.Config` struct. That can include specific cipher suites, forcing a particular TLS version (like 1.2 or 1.3), adding an internal CA certificate chain, adding a client certificate (and private key) if required by the ClickHouse server, and most of the other options that come with a more specialized security setup.
### Authentication {#authentication}

Specify an Auth struct in the connection details to specify a username and password.

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
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)
### Connecting to Multiple Nodes {#connecting-to-multiple-nodes}

Multiple addresses can be specified via the `Addr` struct.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)


Two connection strategies are available:

* `ConnOpenInOrder` (default)  - addresses are consumed in order. Later addresses are only utilized in case of failure to connect using addresses earlier in the list. This is effectively a failure-over strategy.
* `ConnOpenRoundRobin` - Load is balanced across the addresses using a round-robin strategy.

This can be controlled through the option `ConnOpenStrategy`

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)
### Execution {#execution}

Arbitrary statements can be executed via the `Exec` method. This is useful for DDL and simple statements. It should not be used for larger inserts or query iterations.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)


Note the ability to pass a Context to the query. This can be used to pass specific query level settings - see [Using Context](#using-context).
### Batch Insert {#batch-insert}

To insert a large number of rows, the client provides batch semantics. This requires the preparation of a batch to which rows can be appended. This is finally sent via the `Send()` method. Batches will be held in memory until Send is executed.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

Recommendations for ClickHouse apply [here](/guides/inserting-data#best-practices-for-inserts). Batches should not be shared across go-routines - construct a separate batch per routine.

From the above example, note the need for variable types to align with the column type when appending rows. While the mapping is usually obvious, this interface tries to be flexible, and types will be converted provided no precision loss is incurred. For example, the following demonstrates inserting a string into a datetime64.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)


For a full summary of supported go types for each column type, see [Type Conversions](#type-conversions).
### Querying Row/s {#querying-rows}


Users can either query for a single row using the `QueryRow` method or obtain a cursor for iteration over a result set via `Query`. While the former accepts a destination for the data to be serialized into, the latter requires the to call `Scan` on each row.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

Note in both cases, we are required to pass a pointer to the variables we wish to serialize the respective column values into. These must be passed in the order specified in the `SELECT` statement - by default, the order of column declaration will be used in the event of a `SELECT *` as shown above.

Similar to insertion, the Scan method requires the target variables to be of an appropriate type. This again aims to be flexible, with types converted where possible, provided no precision loss is possible, e.g., the above example shows a UUID column being read into a string variable. For a full list of supported go types for each Column type, see [Type Conversions](#type-conversions).

Finally, note the ability to pass a `Context` to the `Query` and `QueryRow` methods. This can be used for query level settings - see [Using Context](#using-context) for further details.
### Async Insert {#async-insert}

Asynchronous inserts are supported through the Async method. This allows the user to specify whether the client should wait for the server to complete the insert or respond once the data has been received. This effectively controls the parameter [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)
### Columnar Insert {#columnar-insert}

Inserts can be inserted in column format. This can provide performance benefits if the data is already orientated in this structure by avoiding the need to pivot to rows.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)
### Using Structs {#using-structs}

For users, Golang structs provide a logical representation of a row of data in ClickHouse. To assist with this, the native interface provides several convenient functions.
#### Select with Serialize {#select-with-serialize}

The Select method allows a set of response rows to be marshaled into a slice of structs with a single invocation.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)
```
```yaml
title: 'スキャン構造体'
sidebar_label: 'スキャン構造体'
keywords: ['ClickHouse', 'Go', 'ScanStruct']
description: 'ScanStructは、クエリからの単一の行を構造体にマッピングすることを可能にします。'
```

#### スキャン構造体 {#scan-struct}

`ScanStruct` は、クエリからの単一の行を構造体にマッピングすることを可能にします。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

#### 追加構造体 {#append-struct}

`AppendStruct` は、既存の [バッチ](#batch-insert) に構造体を追加し、完全な行として解釈することを可能にします。これには、構造体のカラムがテーブルと名前と型の両方で一致する必要があります。すべてのカラムには相当する構造体フィールドが必要ですが、一部の構造体フィールドには相当するカラム表現がないかもしれません。これらは単に無視されます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 型変換 {#type-conversions}

クライアントは、挿入とレスポンスのマシュアルに対して変数型を受け入れる柔軟性を重視しています。ほとんどの場合、ClickHouse のカラム型に相当する Golang 型が存在します。たとえば、 [UInt64](/sql-reference/data-types/int-uint/) は [uint64](https://pkg.go.dev/builtin#uint64) に対応します。これらの論理マッピングは常にサポートされるべきです。ユーザーは、カラムに挿入できる変数型や、変数または受信したデータの変換が先に行われる場合にレスポンスを受け取るために使用できる変数型を利用したいかもしれません。クライアントは、挿入の前にデータを正確に揃えることなく、柔軟なマシュアルを提供できるように、これらの変換を透過的にサポートすることを目指しています。この透過的な変換は、精度の損失を許可しません。たとえば、uint32 は UInt64 カラムからデータを受け取るためには使用できません。逆に、文字列はフォーマット要件を満たす限り datetime64 フィールドに挿入できます。

現在サポートされているプリミティブ型の型変換は、[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md) に記載されています。

この取り組みは進行中で、挿入（`Append`/`AppendRow`）と読み取り時（`Scan` を介して）に分けることができます。特定の変換のサポートが必要な場合は、問題を提起してください。

### 複雑な型 {#complex-types}

#### 日付/日時型 {#datedatetime-types}

ClickHouse Go クライアントは `Date`, `Date32`, `DateTime`, および `DateTime64` の日付/日時型をサポートしています。日付は `2006-01-02` のフォーマットで文字列として挿入するか、ネイティブの Go `time.Time{}` または `sql.NullTime` を使用できます。日時も後者の型をサポートしますが、文字列は `2006-01-02 15:04:05` のフォーマットで渡す必要があり、オプションのタイムゾーンオフセット（例: `2006-01-02 15:04:05 +08:00`）があります。`time.Time{}` と `sql.NullTime` は両方とも読み取り時にサポートされており、 `sql.Scanner` インターフェースの任意の実装もサポートされています。

タイムゾーン情報の扱いは、ClickHouse の型と値が挿入されるか読み取られるかによって異なります：

* **DateTime/DateTime64**
    * **挿入**時に、値は UNIX タイムスタンプ形式で ClickHouse に送信されます。タイムゾーンが指定されていない場合、クライアントはクライアントのローカルタイムゾーンを想定します。`time.Time{}` または `sql.NullTime` はそれに応じてエポックに変換されます。
    * **選択**時に、カラムのタイムゾーンが設定されている場合はそれが使用され、`time.Time` 値が返されます。設定されていない場合は、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
    * **挿入**時には、日付が UNIX タイムスタンプに変換される際にタイムゾーンが考慮されます。つまり、日付として保存する前にタイムゾーンによってオフセットされます。Date 型は ClickHouse ではロケールを持たないためです。文字列値に指定されていない場合、ローカルタイムゾーンが使用されます。
    * **選択**時に、日付は`time.Time{}` または `sql.NullTime{}` インスタンスにスキャンされ、タイムゾーン情報なしで返されます。

#### 配列 {#array}

配列はスライスとして挿入されます。要素の型ルールは、[プリミティブ型](#type-conversions) のそれと一致します。すなわち、可能な限り、要素は変換されます。

スキャン時にはスライスへのポインタを提供する必要があります。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### マップ {#map}

マップは、以前に定義された型ルールに準拠したキーおよび値を持つ Go マップとして挿入されるべきです。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### タプル {#tuples}

タプルは可変長のカラムのグループを表します。カラムは明示的に名前が付けられるか、単に型を指定することができます。例えば：

```sql
//無名
Col1 Tuple(String, Int64)

//名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチの中で、名前付きタプルはより大きな柔軟性を提供します。無名タプルはスライスを使用して挿入および読み取りする必要がありますが、名前付きタプルはマップにも対応しています。

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
// 名前付きと無名の両方はスライスで追加できます。すべての要素が同じ型である場合、強く型付けされたリストとマップを使用できます。
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
// 名前付きタプルはマップまたはスライスに取り出すことができ、無名はスライスのみです。
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注意: 型付けされたスライスとマップはサポートされていますが、名前付きタプルのすべてのサブカラムは同じ型である必要があります。

#### ネストされた {#nested}

ネストされたフィールドは、名前付きタプルの配列に相当します。使用は、ユーザーが [flatten_nested](/operations/settings/settings#flatten_nested) を 1 または 0 に設定したかによります。

flatten_nested を 0 に設定すると、ネストされたカラムはタプルの単一配列のままになります。これにより、ユーザーは挿入と取得のためにマップのスライスを使用でき、任意のネストレベルを持つことができます。マップのキーはカラム名と等しくなければなりません。

注意: マップはタプルを表すため、`map[string]interface{}` 型でなければなりません。値は現在は強く型付けされていません。

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
rows.Close()
```

[完全な例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

デフォルト値の1が `flatten_nested` に使用されると、ネストされたカラムは別の配列にフラット化されます。これには、挿入と取得のためにネストされたスライスを使用する必要があります。任意のネストレベルが機能する可能性がありますが、これは公式にはサポートされていません。

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

[完全な例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意: ネストされたカラムは同じ次元を持っている必要があります。たとえば、上記の例では、`Col_2_2` と `Col_2_1` は同じ数の要素を持っている必要があります。

より簡潔なインターフェースとネスティングの公式サポートのため、`flatten_nested=0` の使用を推奨します。

#### Geo タイプ {#geo-types}

このクライアントは、Geo 型 Point, Ring, Polygon, および MultiPolygon をサポートしています。これらのフィールドは、[github.com/paulmach/orb](https://github.com/paulmach/orb) パッケージを使用して Go で使用されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID {#uuid}

UUID 型は [github.com/google/uuid](https://github.com/google/uuid) パッケージによってサポートされています。ユーザーは、UUID を文字列または `sql.Scanner` または `Stringify` を実装する任意の型として送信およびマシュアルすることもできます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

#### 小数 {#decimal}

Decimal 型は [github.com/shopspring/decimal](https://github.com/shopspring/decimal) パッケージによってサポートされています。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

#### Nullable {#nullable}

Go の Nil 値は ClickHouse の NULL を表します。これは、フィールドが Nullable と宣言されている場合に使用できます。挿入時には、通常版と Nullable 版のカラムの両方に Nil を渡すことができます。前者の場合、型のデフォルト値（例: 文字列の場合は空文字列）が保持されます。Nullable 版の場合は、ClickHouse に NULL 値が保存されます。

スキャン時には、ユーザーは nil 値を表すために、nil をサポートする型へのポインタ（例: *string）を渡す必要があります。以下の例では、col1 は Nullable(String) であるため、**string が受け取られ、nil が表現されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

クライアントはさらに `sql.Null*` 型（例: `sql.NullInt64`）をサポートしています。これらは、その同等の ClickHouse 型と互換性があります。

#### 大きな整数 - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

64 ビットを超える数値型は、ネイティブの Go [big](https://pkg.go.dev/math/big) パッケージを使用して表現されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### 圧縮 {#compression}

圧縮方法のサポートは、使用している基盤となるプロトコルに依存します。ネイティブプロトコルの場合、クライアントはブロックレベルのみで `LZ4` および `ZSTD` 圧縮をサポートします。圧縮は、接続設定に `Compression` 構成を含めることで有効にできます。

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
for i := 0; i < 1000; i++ {
    if err := batch.Append([]string{strconv.Itoa(i), strconv.Itoa(i + 1), strconv.Itoa(i + 2), strconv.Itoa(i + 3)}); err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

追加の圧縮技術は、HTTP 経由の標準インターフェースを使用する場合に利用可能です。詳細については、[database/sql API - 厳密](#compression) を参照してください。

### パラメータバインディング {#parameter-binding}

クライアントは、`Exec`, `Query`, および `QueryRow` メソッドに対するパラメータバインディングをサポートしています。以下の例のように、名前付き、番号付き、および位置付きパラメータを使用してサポートされます。以下にこれらの例を示します。

```go
var count uint64
// 位置付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置付きバインド カウント: %d\n", count)
// 数値バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数値バインド カウント: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインド カウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### 特殊ケース {#special-cases}

デフォルトでは、スライスはクエリへの引数として渡されると、カンマ区切りの値のリストに展開されます。ユーザーが `[ ]` でラッピングされた値のセットを注入する必要がある場合は、`ArraySet` を使用する必要があります。

グループ/タプルが必要な場合、`( )` でラッピングされ、たとえば IN 演算子で使用するために、ユーザーは `GroupSet` を利用できます。これは、以下の例で示すように、複数のグループが必要な場合に特に便利です。

最後に、DateTime64 フィールドはパラメータが適切にレンダリングされるように精度が必要です。フィールドの精度レベルはクライアントによっては不明ですが、ユーザーはそれを提供する必要があります。これを容易にするために、`DateNamed` パラメータを提供します。

```go
var count uint64
// 配列は展開されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開 カウント: %d\n", count)
// 配列は [ ] で保持されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列 カウント: %d\n", count)
// グループセットを使用すると ( ) リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループ カウント: %d\n", count)
// ネストが必要な場合により便利です
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループ カウント: %d\n", count)
// 時間の精度が必要な場合は DateNamed を使用します
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate カウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)
```
```yaml
title: 'コンテキストの使用方法'
sidebar_label: 'コンテキストの使用方法'
keywords: ['ClickHouse', 'コンテキスト', 'クエリ', '設定']
description: 'Goのコンテキストを使用して、ClickHouseのクエリや設定を管理する方法を説明します。'
```

### コンテキストの使用方法 {#using-context}

Goのコンテキストは、デッドライン、キャンセル信号、および他のリクエストスコープの値をAPI境界を越えて渡す手段を提供します。接続のすべてのメソッドは、最初の変数としてコンテキストを受け付けます。前の例では `context.Background()` を使用しましたが、ユーザーはこの機能を使用して設定やデッドラインを渡し、クエリをキャンセルできます。

`withDeadline` で作成されたコンテキストを渡すことで、クエリに実行時間の制限を設定できます。これは絶対時間であり、有効期限が切れると接続が解放され、ClickHouseにキャンセル信号が送信されるだけです。代わりに `WithCancel` を使用してクエリを明示的にキャンセルすることもできます。

ヘルパーである `clickhouse.WithQueryID` および `clickhouse.WithQuotaKey` を使用すると、クエリIDとクォータキーを指定できます。クエリIDは、ログ内でクエリを追跡したり、キャンセル目的で便利です。クォータキーは、一意のキー値に基づいてClickHouseの使用を制限するために使用できます - 詳細は [Quotas Management](/operations/access-rights#quotas-management) を参照してください。

ユーザーはまた、特定のクエリのためだけに設定が適用されることを保証するためにコンテキストを使用できます - 接続全体ではなく、これは [Connection Settings](#connection-settings) に示されています。

最後に、ユーザーは `clickhouse.WithBlockSize` を通じてブロックバッファのサイズを制御できます。これは接続レベルの設定 `BlockBufferSize` をオーバーライドし、同時にデコードされてメモリ内に保持されるブロックの最大数を制御します。より大きな値は、メモリのコストをかけてより多くの並列化を意味する可能性があります。

上記の例は以下に示します。

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
// 特定のAPI呼び出しに設定を渡すためにコンテキストを使用できます
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// JSONカラムを作成するには allow_experimental_object_type=1 が必要です
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// コンテキストを使用してクエリをキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// クエリにデッドラインを設定します - これは絶対時間が達成されるとクエリをキャンセルします。
// クエリはClickHouse内で完了します
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// ログ内でクエリを追跡を支援するためにクエリIDを設定します e.g. system.query_logを参照
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
// クォータキーを設定します - 最初にクォータを作成します
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)
### 進捗/プロファイル/ログ情報 {#progressprofilelog-information}

進捗、プロファイル、およびログ情報はクエリに対して要求することができます。進捗情報は、ClickHouseで読み取られ処理された行数およびバイト数に関する統計を報告します。対照的に、プロファイル情報は、クライアントに返されたデータの概要を提供し、バイト（非圧縮）、行、ブロックの合計を含みます。最後に、ログ情報はスレッドに関する統計を提供します。例えば、メモリ使用量やデータ速度などです。

これらの情報を取得するには、ユーザーは [Context](#using-context) を使用する必要があり、その中でユーザーはコールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// 進捗とプロファイル情報のためのコールバックを渡すためにコンテキストを使用します
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

fmt.Printf("合計行数: %d\n", totalRows)
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)
### 動的スキャン {#dynamic-scanning}

ユーザーは、スキーマやフィールドの型がわからないテーブルを読み取る必要があるかもしれません。このような状況は、アドホックなデータ分析が行われる場合や、汎用ツールが作成される場合に一般的です。これを実現するために、クエリの応答にはカラム型情報が利用可能です。これはGoのリフレクションと使用して、正しい型の変数のランタイムインスタンスを作成し、Scanに渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)
### 外部テーブル {#external-tables}

[外部テーブル](/engines/table-engines/special/external-data/)を使用すると、クライアントがClickHouseにSELECTクエリでデータを送信できます。このデータは一時テーブルに配置され、クエリ自体で評価に使用されます。

ユーザーがクエリと共に外部データをクライアントに送信するには、先に `ext.NewTable` を使用して外部テーブルを構築し、これをコンテキスト経由で渡す必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)
### オープンTelemetry {#open-telemetry}

ClickHouseは、ネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことを許可します。クライアントは、関数 `clickhouse.withSpan`を介してSpanを作成し、これをコンテキスト経由で渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレース利用に関する詳細は、[OpenTelemetryサポート](/operations/opentelemetry/)を参照してください。
## データベース/SQL API {#databasesql-api}

`database/sql` または "標準" APIは、アプリケーションコードが背後にあるデータベースに依存しないシナリオでクライアントを使用することを可能にします。これは、追加の抽象化と間接のレイヤーを伴い、ClickHouseとは必ずしも一致しない原始的な型を含んでいます。しかし、これらのコストは、ツールが複数のデータベースに接続する必要があるシナリオでは通常受け入れられます。

さらに、このクライアントはHTTPをトランスポートレイヤーとして使用することをサポートしています - データは最適なパフォーマンスのためにネイティブ形式でエンコードされます。

以下は、ClickHouse APIのドキュメントの構造に合致することを目的としています。

標準APIの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で見つけることができます。
### 接続 {#connecting-1}

接続は、形式 `clickhouse://<host>:<port>?<query_option>=<value>` のDSN文字列を使用するか、 `clickhouse.OpenDB` メソッドを介して実現できます。後者は `database/sql` 仕様の一部ではありませんが、 `sql.DB` インスタンスを返します。このメソッドは、プロファイリングのような機能を提供しますが、`database/sql` 仕様を通じて公開する明示的な手段はありません。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**その後のすべての例において、明示的に示されない限り、ClickHouse `conn` 変数が作成され利用可能であると仮定します。**
#### 接続設定 {#connection-settings-1}

次のパラメータをDSN文字列に渡すことができます：

* `hosts` - ロードバランシングとフェイルオーバーのための単一アドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `username/password` - 認証資格情報 - [認証](#authentication)を参照してください。
* `database` - 現在のデフォルトのデータベースを選択します。
* `dial_timeout` - 期間文字列は符号付きの小数番号のシーケンス、各数字にはオプションの分数および `300ms`, `1s` のような単位サフィックスがあります。 有効な時間単位は`ms`、`s`、`m`です。
* `connection_open_strategy` - `random/in_order`（デフォルトは `random`） - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照。
    - `round_robin` - サーバーのセットからラウンドロビンサーバーを選択します。
    - `in_order` - 指定された順序で最初のライブサーバーが選択されます。
* `debug` - デバッグ出力を有効にします（ブール値）。
* `compress` - 圧縮アルゴリズムを指定します - `none`（デフォルト）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。 `true` に設定すると、`lz4`が使用されます。ネイティブ通信のサポートは `lz4` と `zstd` のみです。
* `compress_level` - 圧縮のレベル（デフォルトは `0`）。圧縮の詳細については、Compressionを参照してください。この値はアルゴリズム固有です：
    - `gzip` - `-2`（最速）から `9`（最高圧縮）
    - `deflate` - `-2`（最速）から `9`（最高圧縮）
    - `br` - `0`（最速）から `11`（最高圧縮）
    - `zstd`, `lz4` - 無視されます。
* `secure` - SSL接続を確立します（デフォルトは `false`）。
* `skip_verify` - 証明書の検証をスキップします（デフォルトは `false`）。
* `block_buffer_size` - ユーザーがブロックバッファのサイズを制御できるようにします。 [BlockBufferSize](#connection-settings)を参照してください。（デフォルトは `2`）

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
[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)
#### 接続プーリング {#connection-pooling-1}

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明されているように、提供されたノードアドレスのリストの使用に影響を与えることができます。しかし、接続管理とプーリングは設計上 `sql.DB` に委任されています。
#### HTTP経由での接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコルで確立されます。HTTPが必要なユーザーは、DSNをHTTPプロトコルで修正するか、接続オプションでプロトコルを指定することによってこれを有効にできます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)
#### 複数ノードへの接続 {#connecting-to-multiple-nodes-1}

`OpenDB`を使用して、ClickHouse APIで使用しているのと同様のオプションアプローチを使用して、同じオプションを使って複数のホストに接続します - `ConnOpenStrategy`を指定するオプションがあります。

DSNベースの接続では、文字列は複数のホストと `connection_open_strategy` パラメータを受け入れます。このパラメータの値は `round_robin` または `in_order` に設定できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)
### TLSの使用 {#using-tls-1}

DSN接続文字列を使用している場合、SSLはパラメータ "secure=true"を介して有効にできます。 `OpenDB` メソッドは、[TLS用のネイティブAPI](#using-tls)と同様のアプローチを採用し、非nilのTLS構造体を指定することに依存します。DSN接続文字列は、SSL検証をスキップするためのパラメータskip_verifyをサポートしていますが、`OpenDB` メソッドは、構成を渡すことを許可しているため、より高度なTLS構成が必要です。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)
### 認証 {#authentication-1}

`OpenDB`を使用している場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続では、接続文字列にユーザー名とパスワードをパラメータとして、またはアドレスにエンコードされた資格情報として渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)
### 実行 {#execution-1}

接続が確立されたら、ユーザーはExecメソッドを介して `sql` ステートメントを実行できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)


このメソッドはコンテキストを受け取ることをサポートしていません - デフォルトでは、バックグラウンドコンテキストで実行されます。ユーザーは、これが必要な場合は `ExecContext` を使用できます - [Using Context](#using-context) を参照してください。
### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、 `Being` メソッドを介して `sql.Tx` を作成することで得られます。そこから、 `INSERT` ステートメントを用いた `Prepare` メソッドによってバッチが取得されます。これにより、行を `Exec` メソッドを使用して追加できる `sql.Stmt` が返されます。バッチは、元の `sql.Tx` が `Commit` されるまでメモリ内に蓄積されます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)
### 行をクエリする {#querying-rows-1}

単一行のクエリは `QueryRow`メソッドを使用して取得できます。これにより、スキャンするための変数へのポインタで呼び出しを行える *sql.Row が返されます。 `QueryRowContext` バリアントは、バックグラウンド以外のコンテキストを渡すことができます - [Using Context](#using-context) を参照してください。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

複数行を反復処理するには、 `Query` メソッドが必要です。これにより、行を反復するために `Next` を呼び出すことができる `*sql.Rows` 構造が返されます。 `QueryContext` と同等のものは、コンテキストを渡すことを可能にします。

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
    fmt.Printf("行: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)
### 非同期挿入 {#async-insert-1}

非同期挿入は、 `ExecContext` メソッドを介して挿入を実行することで得られます。これは、以下に示すように非同期モードを有効にするコンテキストを渡す必要があります。これにより、クライアントが挿入の完了をサーバーに待つべきか、データが受信された時点で応答すべきかを指定します。これは、パラメータ [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)を実質的に制御します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)
### 列指向の挿入 {#columnar-insert-1}

標準インターフェースを使用してはサポートされていません。
### 構造体の使用 {#using-structs-1}

標準インターフェースを使用してはサポートされていません。
### 型変換 {#type-conversions-1}

標準の `database/sql` インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートするはずです。いくつかの例外、特に複雑な型に関しては、下記に文書化しています。ClickHouse APIに似て、このクライアントは、挿入と応答のマシュアリングの両方に関して、可能な限り柔軟であることを目指しています。詳細については [型変換](#type-conversions) を参照してください。
### 複雑な型 {#complex-types-1}

明示されない限り、複雑な型の処理は [ClickHouse API](#complex-types)と同様であるべきです。違いは、`database/sql` の内部の結果です。
#### マップ {#maps}

ClickHouse APIとは異なり、標準APIはマップをスキャンタイプで強く型付けすることを要求します。例えば、ユーザーは `Map(String,String)` フィールドに対して `map[string]interface{}` を渡すことはできず、 `map[string]string` を使用する必要があります。 `interface{}` 変数は常に互換性がありますし、より複雑な構造に使用することができます。構造体は、読み取り時にはサポートされていません。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

挿入の動作はClickHouse APIと同じです。

```yaml
title: '圧縮'
sidebar_label: '圧縮'
keywords: ['圧縮', 'ClickHouse']
description: 'ClickHouseでのデータ圧縮の管理方法について。'
```

### 圧縮 {#compression-1}

標準APIは、ネイティブな [ClickHouse API](#compression) と同様の圧縮アルゴリズム、つまりブロックレベルでの `lz4` と `zstd` 圧縮をサポートしています。さらに、HTTP接続に対してgzip、deflate、およびbr圧縮もサポートされています。これらのいずれかが有効な場合、圧縮は挿入時とクエリ応答時のブロックに対して行われます。他のリクエスト、例えばpingやクエリリクエストは圧縮されずに残ります。これは `lz4` と `zstd` オプションと一貫しています。

`OpenDB` メソッドを使用して接続を確立する場合、圧縮設定を渡すことができます。これには、圧縮レベルを指定する機能が含まれます（以下を参照）。DSNを介して `sql.Open` で接続する場合、`compress` パラメータを使用します。これは、特定の圧縮アルゴリズム `gzip`、`deflate`、`br`、`zstd` または `lz4` を指定するか、ブールフラグとして設定できます。trueに設定すると、`lz4` が使用されます。デフォルトは `none` で、圧縮が無効です。

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
[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

適用される圧縮のレベルは、DSNパラメータcompress_levelまたはCompressionオプションのLevelフィールドによって制御できます。これは0がデフォルトですが、アルゴリズムに特有です：

* `gzip` - `-2`（最速）から `9`（最良の圧縮）
* `deflate` - `-2`（最速）から `9`（最良の圧縮）
* `br` - `0`（最速）から `11`（最良の圧縮）
* `zstd`、`lz4` - 無視

### パラメータバインディング {#parameter-binding-1}

標準APIは、 [ClickHouse API](#parameter-binding) と同様のパラメータバインディング機能をサポートしており、`Exec`、`Query`、および `QueryRow` メソッド（およびそれらの同等の [Context](#using-context) 変種）にパラメータを渡すことができます。位置指定、名前付き、および番号付きパラメータがサポートされています。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインドカウント: %d\n", count)
// 数値バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数値バインドカウント: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインドカウント: %d\n", count)
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

注意 [特例](#special-cases) は依然として適用されます。

### コンテキストの使用 {#using-context-1}

標準APIは、デッドライン、キャンセレーションシグナル、および他のリクエストスコープの値をコンテキストを介して渡す機能を、 [ClickHouse API](#using-context) と同様にサポートしています。ClickHouse APIとは異なり、これはメソッドの `Context` バリアントを使用することで実現されます。すなわち、デフォルトでバックグラウンドコンテキストを使用するメソッド（例えば `Exec`）には、最初のパラメータとしてコンテキストを渡すことができるバリアント `ExecContext` があります。これにより、アプリケーションのフローの任意の段階でコンテキストを渡すことができます。たとえば、`ConnContext`を介して接続を確立する際や、`QueryRowContext`を介してクエリ行を要求する際にコンテキストを渡すことができます。利用可能なすべてのメソッドの例は以下に示されています。

期限、キャンセレーションシグナル、クエリID、クォータキー、および接続設定を渡すためにコンテキストを使用する詳細については、 [ClickHouse API](#using-context) のためのコンテキストの使用を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSONカラムを作成するには allow_experimental_object_type=1 が必要です
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// クエリはコンテキストを使用してキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("キャンセルが予想されました")
}

// クエリのデッドラインを設定 - これは絶対的な時間が達した後にクエリをキャンセルします。接続のみが終了します。
// クエリはClickHouseで引き続き完了します
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("期限オーバーが予想されました")
}

// クエリIDを設定して、ログでのクエリのトレースを支援します。例：system.query_logを参照
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
// クォータキーを設定 - まずクォータを作成します
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// クエリはコンテキストを使用してキャンセルできます
ctx, cancel = context.WithCancel(context.Background())
// キャンセル前にいくつかの結果を取得します
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
            fmt.Println("キャンセルが予想されました")
            return nil
        }
        return err
    }
    fmt.Printf("行: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### セッション {#sessions}

ネイティブ接続には自動的にセッションがありますが、HTTP経由の接続では、コンテキストに設定を渡すためのセッションIDをユーザーが作成する必要があります。これにより、一時テーブルなど、セッションにバインドされた機能を使用できます。

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
    fmt.Printf("行: col1=%d\n", col1)
}
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 動的スキャン {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning) に類似して、カラム型情報はユーザーが正しい型の変数をランタイムに作成できるように利用可能で、これをScanに渡すことができます。これにより、型が不明なカラムを読み取ることができます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### 外部テーブル {#external-tables-1}

[外部テーブル](/engines/table-engines/special/external-data/) は、クライアントが `SELECT` クエリを通じてデータをClickHouseに送信できるようにします。このデータは、一時テーブルに格納され、クエリ自体で評価に使用できます。

クエリで外部データをクライアントに送信するには、ユーザーはコンテキストを介してこれを渡す前に `ext.NewTable` を使用して外部テーブルを構築する必要があります。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

### オープン テレメトリ {#open-telemetry-1}

ClickHouseは、ネイティブプロトコルの一部として [トレースコンテキスト](/operations/opentelemetry/) を渡すことを許可します。クライアントは、`clickhouse.withSpan` 関数を介してSpanを作成し、コンテキストを介してこれを渡すことで実現します。HTTPが輸送手段として使用されている場合はサポートされていません。

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
fmt.Printf("カウント: %d\n", count)
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## パフォーマンステips {#performance-tips}

* 可能な限りClickHouse APIを利用してください。特にプリミティブ型の場合。これにより、重要なリフレクションと間接参照を避けることができます。
* 大規模データセットを読み込む場合、 [`BlockBufferSize`](#connection-settings) を変更することを検討してください。これによりメモリ使用量が増加しますが、行の反復中により多くのブロックを並行してデコードできるようになります。デフォルト値の2は保守的で、メモリオーバーヘッドを最小限に抑えます。より高い値はメモリ内のブロックをより多く意味します。異なるクエリが異なるブロックサイズを生成する可能性があるため、これにはテストが必要です。したがって、これは [クエリレベル](#using-context) でコンテキストを介して設定できます。
* データを挿入する際には、型を明確にしてください。クライアントは柔軟性を目指していますが、文字列をUUIDまたはIPとして解析することを許可するなど、これにはデータ検証が必要で、挿入時にコストがかかります。
* 可能な場合は列指向の挿入を使用してください。これらも強く型付けされている必要があり、クライアントがあなたの値を変換する必要がないようにします。
* 最適な挿入パフォーマンスのためにClickHouseの [推奨事項](/sql-reference/statements/insert-into/#performance-considerations) に従ってください。
