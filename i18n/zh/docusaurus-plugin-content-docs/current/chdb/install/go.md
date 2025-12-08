---
title: '适用于 Go 的 chDB'
sidebar_label: 'Go'
slug: /chdb/install/go
description: '如何在 Go 中安装和使用 chDB'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# chDB for Go {#chdb-for-go}

chDB-go 为 chDB 提供 Go 语言绑定，使你能够在 Go 应用程序中直接运行 ClickHouse 查询，且完全不依赖任何外部组件。

## 安装 {#installation}

### 第 1 步：安装 libchdb {#install-libchdb}

首先安装 chDB 库：

```bash
curl -sL https://lib.chdb.io | bash
```

### 第 2 步：安装 chdb-go {#install-chdb-go}

安装 Go 软件包：

```bash
go install github.com/chdb-io/chdb-go@latest
```

或者将它添加到你的 `go.mod` 中：

```bash
go get github.com/chdb-io/chdb-go
```

## 用法 {#usage}

### 命令行界面（CLI） {#cli}

chDB-go 包含一个用于快速查询的命令行界面（CLI）：

```bash
# 简单查询 {#simple-query}
./chdb-go "SELECT 123"
```

# 交互式模式 {#interactive-mode}
./chdb-go

# 启用持久化存储的交互式模式 {#interactive-mode-with-persistent-storage}

./chdb-go --path /tmp/chdb

````

### Go 库 - 快速开始                {#quick-start}

#### 无状态查询                      {#stateless-queries}

对于简单的一次性查询：

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // 执行简单查询
    result, err := chdb.Query("SELECT version()", "CSV")
    if err != nil {
        panic(err)
    }
    fmt.Println(result)
}
````

#### 基于会话的有状态查询 {#stateful-queries}

适用于需要持久状态的复杂查询：

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // 创建带持久化存储的会话
    session, err := chdb.NewSession("/tmp/chdb-data")
    if err != nil {
        panic(err)
    }
    defer session.Cleanup()

    // 创建数据库和表
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

    // 插入数据
    _, err = session.Query(`
        INSERT INTO testdb.test_table VALUES 
        (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')
    `, "")
    
    if err != nil {
        panic(err)
    }

    // 查询数据
    result, err := session.Query("SELECT * FROM testdb.test_table ORDER BY id", "Pretty")
    if err != nil {
        panic(err)
    }
    
    fmt.Println(result)
}
```

#### SQL 驱动接口 {#sql-driver}

chDB-go 实现了 Go 的 `database/sql` 接口：

```go
package main

import (
    "database/sql"
    "fmt"
    _ "github.com/chdb-io/chdb-go/driver"
)

func main() {
    // 打开数据库连接
    db, err := sql.Open("chdb", "")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // 使用标准 database/sql 接口进行查询
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
        fmt.Printf("数量: %d\n", count)
    }
}
```

#### 针对大型数据集的流式查询 {#query-streaming}

对于无法全部放入内存的大型数据集，请使用流式查询：

```go
package main

import (
    "fmt"
    "log"
    "github.com/chdb-io/chdb-go/chdb"
)

func main() {
    // 创建流式查询会话
    session, err := chdb.NewSession("/tmp/chdb-stream")
    if err != nil {
        log.Fatal(err)
    }
    defer session.Cleanup()

    // 对大数据集执行流式查询
    streamResult, err := session.QueryStreaming(
        "SELECT number, number * 2 as double FROM system.numbers LIMIT 1000000", 
        "CSV",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer streamResult.Free()

    rowCount := 0
    
    // 分块处理数据
    for {
        chunk := streamResult.GetNext()
        if chunk == nil {
            // 无更多数据
            break
        }
        
        // 检查流式错误
        if err := streamResult.Error(); err != nil {
            log.Printf("流式错误: %v", err)
            break
        }
        
        rowsRead := chunk.RowsRead()
        // 可在此处理分块数据
        // 例如写入文件、通过网络发送等
        fmt.Printf("已处理 %d 行数据块\n", rowsRead)
        rowCount += int(rowsRead)
        if rowCount%100000 == 0 {
            fmt.Printf("已处理 %d 行...\n", rowCount)
        }
    }
    
    fmt.Printf("总计处理行数: %d\n", rowCount)
}
```

**流式查询的优势：**
- **内存高效** - 处理大型数据集而无需将所有数据一次性加载到内存中
- **实时处理** - 从第一批数据到达时就可以开始处理
- **支持取消** - 可以使用 `Cancel()` 取消长时间运行的查询
- **错误处理** - 使用 `Error()` 在流式处理中检查错误

## API 文档 {#api-documentation}

chDB-go 提供高级和低级 API：

- **[高级 API 文档](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - 推荐用于大多数使用场景
- **[低级 API 文档](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - 适用于需要细粒度控制的高级使用场景

## 系统要求 {#requirements}

- Go 1.21 或更新版本
- 兼容 Linux 和 macOS 系统
