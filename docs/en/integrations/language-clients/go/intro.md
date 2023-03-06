---
sidebar_label: Introduction
sidebar_position: 1
keywords: [clickhouse, go, client, golang]
slug: /en/integrations/go/intro
description: The Go clients for ClickHouse allows users to connect to ClickHouse using either the Go standard database/sql interface or an optimized native interface. 
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_native.md';

# ClickHouse Go

## A simple example
Let's Go with a simple example.  This will connect to ClickHouse and select from the system database.  To get started you will need your connection details.

### Connection Details
<ConnectionDetails />

### Initialize a module

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### Copy in some sample code

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
		panic((err))
	}

	ctx := context.Background()
	rows, err := conn.Query(ctx, "SELECT name,toString(uuid) as uuid_str FROM system.tables LIMIT 5")
	if err != nil {
		log.Fatal(err)
	}

	for rows.Next() {
		var (
			name, uuid string
		)
		if err := rows.Scan(
			&name,
			&uuid,
		); err != nil {
			log.Fatal(err)
		}
		log.Printf("name: %s, uuid: %s",
			name, uuid)
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

### Run go mod tidy

```bash
go mod tidy
```
### Set your connection details
Earlier you looked up your connection details.  Set them in `main.go` in the `connect() function:

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

### Run the example
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

### Learn more
The rest of the documentation in this category covers the details of the ClickHouse Go client.

## ClickHouse Go Client

ClickHouse supports two official Go clients. These clients are complementary and intentionally support different use cases.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - High level language client which supports either the Go standard database/sql interface or the native interface.
* [ch-go](https://github.com/ClickHouse/ch-go) - Low level client. Native interface only.

clickhouse-go provides a high-level interface, allowing users to query and insert data using row-orientated semantics and batching that are lenient with respect to data types - values will be converted provided no precision loss is potentially incurred. ch-go, meanwhile, provides an optimized column-orientated interface that provides fast data block streaming with low CPU and memory overhead at the expense of type strictness and more complex usage. 

From version 2.3, Clickhouse-go utilizes ch-go for low-level functions such as encoding, decoding, and compression. Note that clickhouse-go also supports the Go `database/sql` interface standard. Both clients use the native format for their encoding to provide optimal performance and can communicate over the native ClickHouse protocol. clickhouse-go also supports HTTP as its transport mechanism for cases where users have a requirement to proxy or load balance traffic.

When choosing a client library, users should be aware of their respective pros and cons - see Choosing a Client Library.

<div class="adopters-table">

|               | Native format | Native protocol | HTTP protocol | Row Orientated API | Column Orientated API | Type flexibility | Compression | Query Placeholders |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |

</div>
