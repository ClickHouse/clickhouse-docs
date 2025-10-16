---
'title': 'chDB for Go'
'sidebar_label': 'Go'
'slug': '/chdb/install/go'
'description': '如何安装和使用 chDB 与 Go'
'keywords':
- 'chdb'
- 'go'
- 'golang'
- 'embedded'
- 'clickhouse'
- 'sql'
- 'olap'
'doc_type': 'guide'
---


# chDB for Go

chDB-go 提供了 chDB 的 Go 绑定，使您能够在 Go 应用程序中直接运行 ClickHouse 查询，且无需任何外部依赖。

## Installation {#installation}

### Step 1: Install libchdb {#install-libchdb}

首先，安装 chDB 库：

```bash
curl -sL https://lib.chdb.io | bash
```

### Step 2: Install chdb-go {#install-chdb-go}

安装 Go 包：

```bash
go install github.com/chdb-io/chdb-go@latest
```

或者将其添加到您的 `go.mod` 中：

```bash
go get github.com/chdb-io/chdb-go
```

## Usage {#usage}

### Command line interface {#cli}

chDB-go 包含一个 CLI，用于快速查询：

```bash

# Simple query
./chdb-go "SELECT 123"


# Interactive mode
./chdb-go


# Interactive mode with persistent storage
./chdb-go --path /tmp/chdb
```

### Go Library - quick start {#quick-start}

#### Stateless queries {#stateless-queries}

用于简单的一次性查询：

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // Execute a simple query
    result, err := chdb.Query("SELECT version()", "CSV")
    if err != nil {
        panic(err)
    }
    fmt.Println(result)
}
```

#### Stateful queries with session {#stateful-queries}

用于具有持久状态的复杂查询：

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // Create a session with persistent storage
    session, err := chdb.NewSession("/tmp/chdb-data")
    if err != nil {
        panic(err)
    }
    defer session.Cleanup()

    // Create database and table
    _, err = session.Query(`
        CREATE DATABASE IF NOT EXISTS testdb;
        CREATE TABLE IF NOT EXISTS testdb.test_table (
            id UInt32,
            name String
        ) ENGINE = MergeTree() ORDER BY id
    `, "")

    if err != nil {
        panic(err)
    }

    // Insert data
    _, err = session.Query(`
        INSERT INTO testdb.test_table VALUES 
        (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')
    `, "")

    if err != nil {
        panic(err)
    }

    // Query data
    result, err := session.Query("SELECT * FROM testdb.test_table ORDER BY id", "Pretty")
    if err != nil {
        panic(err)
    }

    fmt.Println(result)
}
```

#### SQL driver interface {#sql-driver}

chDB-go 实现了 Go 的 `database/sql` 接口：

```go
package main

import (
    "database/sql"
    "fmt"
    _ "github.com/chdb-io/chdb-go/driver"
)

func main() {
    // Open database connection
    db, err := sql.Open("chdb", "")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // Query with standard database/sql interface
    rows, err := db.Query("SELECT COUNT(*) FROM url('https://datasets.clickhouse.com/hits/hits.parquet')")
    if err != nil {
        panic(err)
    }
    defer rows.Close()

    for rows.Next() {
        var count int
        err := rows.Scan(&count)
        if err != nil {
            panic(err)
        }
        fmt.Printf("Count: %d\n", count)
    }
}
```

#### Query streaming for large datasets {#query-streaming}

用于处理不适合放入内存的大型数据集，请使用流式查询：

```go
package main

import (
    "fmt"
    "log"
    "github.com/chdb-io/chdb-go/chdb"
)

func main() {
    // Create a session for streaming queries
    session, err := chdb.NewSession("/tmp/chdb-stream")
    if err != nil {
        log.Fatal(err)
    }
    defer session.Cleanup()

    // Execute a streaming query for large dataset
    streamResult, err := session.QueryStreaming(
        "SELECT number, number * 2 as double FROM system.numbers LIMIT 1000000", 
        "CSV",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer streamResult.Free()

    rowCount := 0

    // Process data in chunks
    for {
        chunk := streamResult.GetNext()
        if chunk == nil {
            // No more data
            break
        }

        // Check for streaming errors
        if err := streamResult.Error(); err != nil {
            log.Printf("Streaming error: %v", err)
            break
        }

        rowsRead := chunk.RowsRead()
        // You can process the chunk data here
        // For example, write to file, send over network, etc.
        fmt.Printf("Processed chunk with %d rows\n", rowsRead)
        rowCount += int(rowsRead)
        if rowCount%100000 == 0 {
            fmt.Printf("Processed %d rows so far...\n", rowCount)
        }
    }

    fmt.Printf("Total rows processed: %d\n", rowCount)
}
```

**流式查询的好处：**
- **内存高效** - 在不将所有数据加载到内存中的情况下处理大型数据集
- **实时处理** - 在第一个数据块到达后立即开始处理数据
- **取消支持** - 可以使用 `Cancel()` 取消长时间运行的查询
- **错误处理** - 使用 `Error()` 检查流式处理期间的错误

## API documentation {#api-documentation}

chDB-go 提供了高层次和低层次的 API：

- **[高层次 API 文档](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - 推荐用于大多数用例
- **[低层次 API 文档](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - 用于需要精细控制的高级用例

## System requirements {#requirements}

- Go 1.21 或更高版本
- 兼容 Linux, macOS
