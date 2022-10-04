---
sidebar_label: Database/SQL API
sidebar_position: 4
keywords: [clickhouse, go, client, high-level, api, database, sql]
slug: /en/integrations/go/clickhouse-go/database-sql-api
description: Database/SQL API
---

# Database/SQL API

The `database/sql` or “standard” API allows users to use the client in scenarios where application code should be agnostic of the underlying databases by conforming to a standard interface. This comes at some expense - additional layers of abstraction and indirection and primitives which are not necessarily aligned with ClickHouse. These costs are, however, typically acceptable in scenarios where tooling needs to connect to multiple databases.

Additionally, this client supports using HTTP as the transport layer - data will still be encoded in the native format for optimal performance.

The following aims to mirror the structure of the documentation for the ClickHouse API.

Full code examples for the standard API can be found [here](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).

## Connecting

Connection can be achieved either via a DSN string with the format `clickhouse://<host>:<port>?<query_option>=<value>` and `Open` method or via the `clickhouse.OpenDB` method. The latter is not part of the `database/sql` specification but returns a `sql.DB` instance. This method provides functionality such as profiling, for which there are no obvious means of exposing through the `database/sql` specification.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**For all subsequent examples, unless explicitly shown, we assume the use of the ClickHouse `conn` variable has been created and is available.**

### Connection Settings

The following parameters can be passed in the DSN string:

* `hosts` - comma-separated list of single address hosts for load-balancing and failover - see [Connecting to Multiple Nodes](database-sql-api#connecting-to-multiple-nodes).
* `username/password` - auth credentials - see [Authentication](database-sql-api#authentication)
* `database` - select the current default database
* `dial_timeout` - a duration string is a possibly signed sequence of decimal numbers, each with optional fraction and a unit suffix such as `300ms`, `1s`. Valid time units are `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (default `random`) - see [Connecting to Multiple Nodes](database-sql-api#connecting-to-multiple-nodes)
    - `round_robin` - choose a round-robin server from the set
    - `in_order` - first live server is chosen in specified order
* `debug` - enable debug output (boolean value)
* `compress` - specify the compression algorithm - `none` (default), `zstd`, `lz4`, `gzip`, `deflate`, `br`. If set to `true`, `lz4` will be used. Only `lz4` and `zstd` are supported for native communication.
* `compress_level` - Level of compression (default is `0`). See Compression. This is algorithm specific:
    - `gzip` - `-2` (Best Speed) to `9` (Best Compression)
    - `deflate` - `-2` (Best Speed) to `9` (Best Compression)
    - `br` - `0` (Best Speed) to `11` (Best Compression)
    - `zstd`, `lz4` - ignored
* `secure` - establish secure SSL connection (default is `false`)
* `skip_verify` - skip certificate verification (default is `false`)
* `block_buffer_size` - allows users to control the block buffer size. See [BlockBufferSize](clickhouse-api#connection-settings). (default is `2`)

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
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

### Connection Pooling

Users can influence the use of the provided list of node addresses as described in [Connecting to Multiple Nodes](database-sql-api#connecting-to-multiple-nodes). Connection management and pooling is, however, delegated to `sql.DB` by design.

### Connecting over HTTP

By default, connections are established over the native protocol. For users needing HTTP, this can be enabled by either modifying the DSN to include the HTTP protocol or by specifying the Protocol in the connection options.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

### Connecting to Multiple Nodes

If using `OpenDB`, connect to multiple hosts using the same options approach as that used for the ClickHouse API - optionally specifying the ConnOpenStrategy.

For DSN-based connections, the string accepts multiple hosts and a `connection_open_strategy` parameter for which the value `round_robin` or `in_order` can be set.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)

## Using TLS

If using a DSN connection string, SSL can be enabled via the parameter “secure=true”. The OpenDB method utilizes the same approach as the [native API for TLS](clickhouse-api#using-tls), relying on the specification of a non-nil TLS struct. While the DSN connection string supports the parameter skip_verify to skip SSL verification, the OpenDB method is required for more advanced TLS configurations - since it permits the passing of a configuration. 

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)

## Authentication

If using OpenDB, authentication information can be passed via the usual options. For DSN-based connections, a username and password can be passed in the connection string - either as parameters or as credentials encoded in the address.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)

## Execution

Once a connection has been obtained, users can issue `sql` statements for execution via the Exec method.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)


This method does not support receiving a context - by default, it executes with the background context. Users can use ExecContext if this is needed - see [Using Context](database-sql-api#using-context).

## Batch Insert

Batch semantics can be achieved by creating a `sql.Tx` via the `Being` method. From this, a batch can be obtained using the `Prepare` method with the `INSERT` statement. This returns a `sql.Stmt` to which rows can be appended using the `Exec` method. The batch will be accumulated in memory until `Commit` is executed on the original `sql.Tx`.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

## Querying Row/s

Querying a single row can be achieved using the QueryRow method. This returns a  *sql.Row, on which Scan can be invoked with pointers to variables into which the columns should be marshaled. A QueryRowContext variant allows a context to be passed other than background - see [Using Context](database-sql-api#using-context).

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

Iterating multiple rows requires the `Query` method. This returns a `*sql.Rows` struct on which Next can be invoked to iterate through the rows. QueryContext equivalent allows passing of a context.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

## Async Insert

Asynchronous inserts can be achieved by executing an insert via the ExecContext method. This should be passed a context with asynchronous mode enabled, as shown below. This allows the user to specify whether the client should wait for the server to complete the insert or respond once the data has been received. This effectively controls the parameter [wait_for_async_insert](https://clickhouse.com/docs/en/operations/settings/settings/#wait-for-async-insert).

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

## Columnar Insert

Not supported using the standard interface.

## Using Structs

Not supported using the standard interface.

## Type Conversions

The standard `database/sql` interface should support the same types as the [ClickHouse API](clickhouse-api#type-conversions). There are a few exceptions, primarily for complex types, that we document below. Similar to the ClickHouse API, the client aims to be as flexible as possible concerning accepting variable types for both insertion and marshaling of responses. See [Type Conversions](clickhouse-api#type-conversions) for further details.

## Complex Types

Unless stated, complex type handling should be the same as the [ClickHouse API](clickhouse-api#complex-types). Differences are a result of `database/sql` internals.

### Maps

Unlike the ClickHouse API, the standard API requires maps to be strongly typed at scan type. For example, users cannot pass a `map[string]interface{}` for a `Map(String,String)` field and must use a `map[string]string` instead. An `interface{}` variable will always be compatible and can be used for more complex structures. Structs are not supported at read time.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

Insert behavior is the same as the ClickHouse API.

### JSON

The standard API does not support structs or maps at read time. Users must pass an `interface{}` variable to the `Scan` method. 

```go
rows = conn.QueryRow("SELECT event.assignee.Achievement FROM example")
var achievement interface{}
if err = rows.Scan(&achievement); err != nil {
    return err
}
fmt.Println(clickhouse_tests.ToJson(event))
rows = conn.QueryRow("SELECT event.assignee.Repositories FROM example")
var repositories interface{}
if err = rows.Scan(&repositories); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/json.go)

Insert behavior is the same as the ClickHouse API.

## Compression

The standard API supports the same compression algorithms as native [ClickHouse API](clickhouse-api#compression) i.e. `lz4` and `zstd` compression at a block level. In addition, gzip, deflate and br compression are supported for HTTP connections. If any of these are enabled, compression is performed on blocks during insertion and for query responses. Other requests e.g. pings or query requests, will remain uncompressed. This is consistent with `lz4` and `zstd` options.

If using the `OpenDB` method to establish a connection, a Compression configuration can be passed. This includes the ability to specify the compression level (see below). If connecting via `sql.Open` with DSN, utilize the parameter `compress`. This can either be a specific compression algorithm i.e. `gzip`, `deflate`, `br`, `zstd` or `lz4` or a boolean flag. If set to true, `lz4` will be used. The default is `none` i.e. compression disabled.


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
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)


```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

The level of applied compression can be controlled by the DSN parameter compress_level or the Level field of the Compression option. This defaults to 0 but is algorithm specific:

* `gzip` - `-2` (Best Speed) to `9` (Best Compression)
* `deflate` - `-2` (Best Speed) to `9` (Best Compression)
* `br` - `0` (Best Speed) to `11` (Best Compression)
* `zstd`, `lz4` - ignored

## Parameter Binding

The standard API supports the same parameter binding capabilities as the [ClickHouse API](clickhouse-api#parameter-binding), allowing parameters to be passed to the Exec, Query and QueryRow methods (and their equivalent [Context](database-sql-api#using-context) variants). Positional, named and numbered parameters are supported.

```go
var count uint64
// positional bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// numeric bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// named bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

Note [special cases](clickhouse-api#special-cases) still apply.

## Using Context

The standard API supports the same ability to pass deadlines, cancellation signals, and other request-scoped values via the context as the [ClickHouse API](clickhouse-api#using-context). Unlike the ClickHouse API, this is achieved by using `Context` variants of the methods i.e. methods such as `Exec`, which use the background context by default, have a variant `ExecContext` to which a context can be passed as the first parameter. This allows a context to be passed at any stage of an application flow. For example, users can pass a context when establishing a connection via `ConnContext` or when requesting a query row via `QueryRowContext`. Examples of all available methods are shown below.

For more detail on using the context to pass deadlines, cancellation signals, query ids, quota keys and connection settings see Using Context for the [ClickHouse API](clickhouse-api#using-context).

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
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)


## Sessions

While native connections inherently have a session, connections over HTTP require the user to create a session id for passing in a context as a setting. This allows the use of features, e.g., Temporary tables, which are bound to a session. 

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
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

## Dynamic Scanning

Similar to the [ClickHouse API](clickhouse-api#dynamic-scanning), column type information is available to allow users to create runtime instances of correctly typed variables which can be passed to Scan. This allows columns to be read where the type is not known.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

## External Tables

[External tables](https://clickhouse.com/docs/en/engines/table-engines/special/external-data/) allow the client to send data to ClickHouse, with a `SELECT` query. This data is put in a temporary table and can be used in the query itself for evaluation.

To send external data to the client with a query, the user must build an external table via `ext.NewTable` before passing this via the context. 

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)


## Open Telemetry

ClickHouse allows a [trace context](https://clickhouse.com/docs/en/operations/opentelemetry/) to be passed as part of the native protocol. The client allows a Span to be created via the function `clickhouse.withSpan` and passed via the Context to achieve this. This is not supported when HTTP is used as transport.

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)
