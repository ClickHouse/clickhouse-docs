---
'title': 'chDB for Go'
'sidebar_label': 'Go'
'slug': '/chdb/install/go'
'description': 'Go로 chDB를 설치하고 사용하는 방법'
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

chDB-go는 chDB에 대한 Go 바인딩을 제공하여 Go 애플리케이션에서 ClickHouse 쿼리를 외부 종속성 없이 직접 실행할 수 있게 해줍니다.

## Installation {#installation}

### Step 1: Install libchdb {#install-libchdb}

먼저, chDB 라이브러리를 설치하십시오:

```bash
curl -sL https://lib.chdb.io | bash
```

### Step 2: Install chdb-go {#install-chdb-go}

Go 패키지를 설치하십시오:

```bash
go install github.com/chdb-io/chdb-go@latest
```

또는 `go.mod`에 추가하십시오:

```bash
go get github.com/chdb-io/chdb-go
```

## Usage {#usage}

### Command line interface {#cli}

chDB-go는 빠른 쿼리를 위한 CLI를 포함하고 있습니다:

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

간단한 일회성 쿼리를 위한:

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

상태를 지속하는 복잡한 쿼리를 위한:

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

chDB-go는 Go의 `database/sql` 인터페이스를 구현합니다:

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

메모리에 맞지 않는 대형 데이터셋을 처리하기 위한 스트리밍 쿼리를 사용하십시오:

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

**쿼리 스트리밍의 이점:**
- **메모리 효율적** - 모든 데이터를 메모리에 로드하지 않고 대형 데이터셋을 처리할 수 있습니다.
- **실시간 처리** - 첫 번째 청크가 도착하는 즉시 데이터 처리를 시작할 수 있습니다.
- **취소 지원** - `Cancel()`로 장기 실행 쿼리를 취소할 수 있습니다.
- **오류 처리** - 스트리밍 중 오류를 `Error()`로 확인할 수 있습니다.

## API documentation {#api-documentation}

chDB-go는 고수준 및 저수준 API를 모두 제공합니다:

- **[High-Level API Documentation](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - 대부분의 사용 사례에 권장됩니다.
- **[Low-Level API Documentation](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - 세밀한 제어가 필요한 고급 사용 사례를 위한 것입니다.

## System requirements {#requirements}

- Go 1.21 이상
- Linux, macOS와 호환됩니다.
