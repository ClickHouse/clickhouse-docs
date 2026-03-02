---
title: 'Go용 chDB'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'Go에서 chDB를 설치하고 사용하는 방법'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Go용 chDB \{#chdb-for-go\}

chDB-go는 chDB를 위한 Go 바인딩을 제공하여 외부 의존성 없이 Go 애플리케이션에서 ClickHouse 쿼리를 직접 실행할 수 있게 해줍니다.

## 설치 \{#installation\}

### 1단계: libchdb 설치 \{#install-libchdb\}

먼저 chDB 라이브러리를 설치합니다.

```bash
curl -sL https://lib.chdb.io | bash
```


### 2단계: chdb-go 설치 \{#install-chdb-go\}

Go 패키지를 설치하십시오.

```bash
go install github.com/chdb-io/chdb-go@latest
```

또는 `go.mod`에 추가하십시오:

```bash
go get github.com/chdb-io/chdb-go
```


## 사용 방법 \{#usage\}

### 명령줄 인터페이스 \{#cli\}

chDB-go에는 빠르게 쿼리를 실행할 수 있는 CLI가 포함되어 있습니다.

```bash
# Simple query
./chdb-go "SELECT 123"

# Interactive mode
./chdb-go

# Interactive mode with persistent storage
./chdb-go --path /tmp/chdb
```


### Go 라이브러리 - 빠른 시작 \{#quick-start\}

#### Stateless queries \{#stateless-queries\}

단순한 일회성 쿼리의 경우:

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go/chdb"
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


#### 세션을 사용하는 상태 저장 쿼리 \{#stateful-queries\}

지속적인 상태가 필요한 복잡한 쿼리에는 세션을 사용할 수 있습니다:

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go/chdb"
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


#### SQL 드라이버 인터페이스 \{#sql-driver\}

chDB-go는 Go의 `database/sql` 인터페이스를 구현합니다.

```go
package main

import (
    "database/sql"
    "fmt"
    _ "github.com/chdb-io/chdb-go/chdb/driver"
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


#### 대규모 데이터셋을 위한 쿼리 스트리밍 \{#query-streaming\}

메모리에 담을 수 없는 대규모 데이터셋을 처리하려면 스트리밍 쿼리를 사용하십시오.

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

* **메모리 효율성** - 전체 데이터를 메모리에 로드하지 않고도 대용량 데이터셋을 처리할 수 있습니다
* **실시간 처리** - 첫 번째 청크가 도착하는 즉시 데이터 처리를 시작할 수 있습니다
* **취소 지원** - `Cancel()`로 장시간 실행되는 쿼리를 취소할 수 있습니다
* **오류 처리** - 스트리밍 중에 `Error()`로 오류를 확인할 수 있습니다


## API 문서 \{#api-documentation\}

chDB-go는 상위 수준 API와 하위 수준 API를 모두 제공합니다:

- **[상위 수준 API 문서](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - 대부분의 사용 사례에서 사용을 권장합니다
- **[하위 수준 API 문서](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - 세밀한 제어가 필요한 고급 사용 사례에 적합합니다

## 시스템 요구 사항 \{#requirements\}

- Go 1.21 이상
- Linux, macOS에서 동작합니다