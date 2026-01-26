---
title: 'Go向けchDB'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'GoでchDBをインストールして使用する方法'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Go向けchDB \{#chdb-for-go\}

chDB-goは、chDBのGoバインディングを提供し、外部依存関係なしでGoアプリケーション内で直接ClickHouseクエリを実行できるようにします。

## インストール \{#installation\}

### ステップ1：libchdbのインストール \{#install-libchdb\}

まず、chDBライブラリをインストールします：

```bash
curl -sL https://lib.chdb.io | bash
```


### ステップ2：chdb-goのインストール \{#install-chdb-go\}

Goパッケージをインストールします：

```bash
go install github.com/chdb-io/chdb-go@latest
```

または、`go.mod`に追加します：

```bash
go get github.com/chdb-io/chdb-go
```


## 使用方法 \{#usage\}

### コマンドラインインターフェース \{#cli\}

chDB-goには、クイッククエリ用のCLIが含まれています：

```bash
# Simple query
./chdb-go "SELECT 123"

# Interactive mode
./chdb-go

# Interactive mode with persistent storage
./chdb-go --path /tmp/chdb
```


### Goライブラリ - クイックスタート \{#quick-start\}

#### ステートレスクエリ \{#stateless-queries\}

シンプルな単発クエリの場合：

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


#### セッションを使用したステートフルクエリ \{#stateful-queries\}

永続的な状態を持つ複雑なクエリの場合：

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


#### SQLドライバーインターフェース \{#sql-driver\}

chDB-goはGoの`database/sql`インターフェースを実装しています：

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


#### 大規模データセット向けクエリストリーミング \{#query-streaming\}

メモリに収まらない大規模データセットを処理する場合は、ストリーミングクエリを使用します：

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

**クエリストリーミングの利点:**

* **メモリ効率が高い** - すべてをメモリに読み込まずに大規模データセットを処理できる
* **リアルタイム処理** - 最初のチャンクが到着した時点ですぐに処理を開始できる
* **キャンセル対応** - `Cancel()` を使って長時間実行中のクエリをキャンセルできる
* **エラー処理** - ストリーミング中のエラーを `Error()` で確認できる


## APIドキュメント \{#api-documentation\}

chDB-goは高レベルAPIと低レベルAPIの両方を提供しています：

- **[高レベルAPIドキュメント](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - ほとんどのユースケースに推奨
- **[低レベルAPIドキュメント](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - きめ細かい制御が必要な高度なユースケース向け

## システム要件 \{#requirements\}

- Go 1.21以降
- Linux、macOSに対応