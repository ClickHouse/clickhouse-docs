---
title: 'Go 向け chDB'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'Go で chDB をインストールして使用する方法'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Go 向けの chDB {#chdb-for-go}

chDB-go は chDB 向けの Go バインディングを提供し、外部への依存関係なしに Go アプリケーション内から直接 ClickHouse クエリを実行できるようにします。

## インストール {#installation}

### ステップ 1: libchdb のインストール {#install-libchdb}

まず、chDB ライブラリをインストールします。

```bash
curl -sL https://lib.chdb.io | bash
```

### ステップ 2：chdb-go をインストールする {#install-chdb-go}

Go パッケージをインストールします：

```bash
go install github.com/chdb-io/chdb-go@latest
```

または `go.mod` に追加してください：

```bash
go get github.com/chdb-io/chdb-go
```

## 使用方法 {#usage}

### コマンドラインインターフェース {#cli}

chDB-go には、簡単なクエリをすばやく実行するための CLI が含まれています。

```bash
# Simple query
./chdb-go "SELECT 123"

# Interactive mode
./chdb-go

# Interactive mode with persistent storage
./chdb-go --path /tmp/chdb
```

# インタラクティブモード {#interactive-mode}
./chdb-go

# 永続ストレージを使用したインタラクティブモード {#interactive-mode-with-persistent-storage}

./chdb-go --path /tmp/chdb

````go
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
```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // シンプルなクエリを実行
    result, err := chdb.Query("SELECT version()", "CSV")
    if err != nil {
        panic(err)
    }
    fmt.Println(result)
}
````go
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
```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // 永続ストレージを使用してセッションを作成
    session, err := chdb.NewSession("/tmp/chdb-data")
    if err != nil {
        panic(err)
    }
    defer session.Cleanup()

    // データベースとテーブルを作成
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

    // データを挿入
    _, err = session.Query(`
        INSERT INTO testdb.test_table VALUES 
        (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')
    `, "")
    
    if err != nil {
        panic(err)
    }

    // データをクエリ実行
    result, err := session.Query("SELECT * FROM testdb.test_table ORDER BY id", "Pretty")
    if err != nil {
        panic(err)
    }
    
    fmt.Println(result)
}
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
```go
package main

import (
    "database/sql"
    "fmt"
    _ "github.com/chdb-io/chdb-go/driver"
)

func main() {
    // データベース接続を開く
    db, err := sql.Open("chdb", "")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // 標準database/sqlインターフェースでクエリを実行
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
```go
package main

import (
    "fmt"
    "log"
    "github.com/chdb-io/chdb-go/chdb"
)

func main() {
    // ストリーミングクエリ用のセッションを作成
    session, err := chdb.NewSession("/tmp/chdb-stream")
    if err != nil {
        log.Fatal(err)
    }
    defer session.Cleanup()

    // 大規模データセットに対してストリーミングクエリを実行
    streamResult, err := session.QueryStreaming(
        "SELECT number, number * 2 as double FROM system.numbers LIMIT 1000000", 
        "CSV",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer streamResult.Free()

    rowCount := 0
    
    // データをチャンク単位で処理
    for {
        chunk := streamResult.GetNext()
        if chunk == nil {
            // データの終端に到達
            break
        }
        
        // ストリーミングエラーを確認
        if err := streamResult.Error(); err != nil {
            log.Printf("Streaming error: %v", err)
            break
        }
        
        rowsRead := chunk.RowsRead()
        // ここでチャンクデータを処理可能
        // 例: ファイルへの書き込み、ネットワーク経由での送信など
        fmt.Printf("%d行のチャンクを処理しました\n", rowsRead)
        rowCount += int(rowsRead)
        if rowCount%100000 == 0 {
            fmt.Printf("現在までに%d行を処理しました...\n", rowCount)
        }
    }
    
    fmt.Printf("処理した総行数: %d\n", rowCount)
}
```

**クエリストリーミングの利点:**
- **メモリ効率が高い** - すべてをメモリに読み込まずに大規模データセットを処理できる
- **リアルタイム処理** - 最初のチャンクが到着し次第、すぐに処理を開始できる
- **キャンセルのサポート** - `Cancel()` を使って長時間実行中のクエリをキャンセルできる
- **エラー処理** - ストリーミング中に `Error()` でエラーを確認できる

## API ドキュメント {#api-documentation}

chDB-go は高レベル API と低レベル API の両方を提供します：

- **[高レベル API ドキュメント](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - ほとんどのユースケースでの利用を推奨
- **[低レベル API ドキュメント](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - きめ細かな制御が必要な高度なユースケース向け

## システム要件 {#requirements}

- Go 1.21 以降
- Linux、macOS に対応
