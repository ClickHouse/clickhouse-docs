---
title: 'Go向けchDB'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'GoでchDBをインストールして使用する方法'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Go向けchDB {#chdb-for-go}

chDB-goは、chDBのGoバインディングを提供し、外部依存関係なしでGoアプリケーション内で直接ClickHouseクエリを実行できるようにします。

## インストール {#installation}

### ステップ1：libchdbのインストール {#install-libchdb}

まず、chDBライブラリをインストールします：

```bash
curl -sL https://lib.chdb.io | bash
```

### ステップ2：chdb-goのインストール {#install-chdb-go}

Goパッケージをインストールします：

```bash
go install github.com/chdb-io/chdb-go@latest
```

または、`go.mod`に追加します：

```bash
go get github.com/chdb-io/chdb-go
```

## 使用方法 {#usage}

### コマンドラインインターフェース {#cli}

chDB-goには、クイッククエリ用のCLIが含まれています：

```bash
# シンプルなクエリ
./chdb-go "SELECT 123"

# インタラクティブモード
./chdb-go

# 永続ストレージ付きインタラクティブモード
./chdb-go --path /tmp/chdb
```

### Goライブラリ - クイックスタート {#quick-start}

#### ステートレスクエリ {#stateless-queries}

シンプルな単発クエリの場合：

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // シンプルなクエリの実行
    result, err := chdb.Query("SELECT version()", "CSV")
    if err != nil {
        panic(err)
    }
    fmt.Println(result)
}
```

#### セッションを使用したステートフルクエリ {#stateful-queries}

永続的な状態を持つ複雑なクエリの場合：

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // 永続ストレージ付きセッションの作成
    session, err := chdb.NewSession("/tmp/chdb-data")
    if err != nil {
        panic(err)
    }
    defer session.Cleanup()

    // データベースとテーブルの作成
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

    // データの挿入
    _, err = session.Query(`
        INSERT INTO testdb.test_table VALUES 
        (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')
    `, "")
    
    if err != nil {
        panic(err)
    }

    // データのクエリ
    result, err := session.Query("SELECT * FROM testdb.test_table ORDER BY id", "Pretty")
    if err != nil {
        panic(err)
    }
    
    fmt.Println(result)
}
```

#### SQLドライバーインターフェース {#sql-driver}

chDB-goはGoの`database/sql`インターフェースを実装しています：

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

    // 標準のdatabase/sqlインターフェースでクエリ
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
        fmt.Printf("カウント: %d\n", count)
    }
}
```

#### 大規模データセット向けクエリストリーミング {#query-streaming}

メモリに収まらない大規模データセットを処理する場合は、ストリーミングクエリを使用します：

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

    // 大規模データセット向けストリーミングクエリの実行
    streamResult, err := session.QueryStreaming(
        "SELECT number, number * 2 as double FROM system.numbers LIMIT 1000000", 
        "CSV",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer streamResult.Free()

    rowCount := 0
    
    // チャンク単位でデータを処理
    for {
        chunk := streamResult.GetNext()
        if chunk == nil {
            // データなし
            break
        }
        
        // ストリーミングエラーの確認
        if err := streamResult.Error(); err != nil {
            log.Printf("ストリーミングエラー: %v", err)
            break
        }
        
        rowsRead := chunk.RowsRead()
        // ここでチャンクデータを処理できます
        // 例：ファイルへの書き込み、ネットワーク経由での送信など
        fmt.Printf("%d行のチャンクを処理しました\n", rowsRead)
        rowCount += int(rowsRead)
        if rowCount%100000 == 0 {
            fmt.Printf("これまでに%d行を処理しました...\n", rowCount)
        }
    }
    
    fmt.Printf("処理した合計行数: %d\n", rowCount)
}
```

**クエリストリーミングの利点：**
- **メモリ効率** - すべてをメモリに読み込むことなく大規模データセットを処理
- **リアルタイム処理** - 最初のチャンクが到着したらすぐにデータ処理を開始
- **キャンセルサポート** - `Cancel()`で長時間実行中のクエリをキャンセル可能
- **エラー処理** - `Error()`でストリーミング中のエラーを確認

## APIドキュメント {#api-documentation}

chDB-goは高レベルAPIと低レベルAPIの両方を提供しています：

- **[高レベルAPIドキュメント](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - ほとんどのユースケースに推奨
- **[低レベルAPIドキュメント](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - きめ細かい制御が必要な高度なユースケース向け

## システム要件 {#requirements}

- Go 1.21以降
- Linux、macOSに対応