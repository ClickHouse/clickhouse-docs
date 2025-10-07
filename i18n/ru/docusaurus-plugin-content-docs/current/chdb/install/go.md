---
slug: '/chdb/install/go'
sidebar_label: Go
description: 'Как установить и использовать chDB с Go'
title: 'Установка chDB для Go'
keywords: ['chdb', 'встраиваемый', 'clickhouse-lite', 'go', 'установка']
doc_type: guide
---
# chDB для Go

chDB-go предоставляет привязки Go для chDB, позволяя вам выполнять запросы ClickHouse непосредственно в ваших приложениях на Go без внешних зависимостей.

## Установка {#installation}

### Шаг 1: Установите libchdb {#install-libchdb}

Сначала установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```

### Шаг 2: Установите chdb-go {#install-chdb-go}

Установите пакет Go:

```bash
go install github.com/chdb-io/chdb-go@latest
```

Или добавьте его в ваш `go.mod`:

```bash
go get github.com/chdb-io/chdb-go
```

## Использование {#usage}

### Интерфейс командной строки {#cli}

chDB-go включает CLI для быстрых запросов:

```bash

# Simple query
./chdb-go "SELECT 123"


# Interactive mode
./chdb-go


# Interactive mode with persistent storage
./chdb-go --path /tmp/chdb
```

### Библиотека Go - быстрое начало {#quick-start}

#### Безстатусные запросы {#stateless-queries}

Для простых, одноразовых запросов:

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

#### Статусные запросы сессии {#stateful-queries}

Для сложных запросов с постоянным состоянием:

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

#### Интерфейс SQL-драйвера {#sql-driver}

chDB-go реализует интерфейс `database/sql` Go:

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

#### Потоковая обработка запросов для больших наборов данных {#query-streaming}

Для обработки больших наборов данных, которые не помещаются в память, используйте потоковые запросы:

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

**Преимущества потоковой обработки запросов:**
- **Эффективное использование памяти** - Обрабатывайте большие наборы данных, не загружая их полностью в память
- **Обработка в реальном времени** - Начинайте обрабатывать данные, как только поступит первый фрагмент
- **Поддержка отмены** - Можно отменить долго выполняющиеся запросы с помощью `Cancel()`
- **Обработка ошибок** - Проверяйте наличие ошибок во время потоковой обработки с помощью `Error()`

## Документация API {#api-documentation}

chDB-go предоставляет как высокоуровневые, так и низкоуровневые API:

- **[Документация высокоуровневого API](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - Рекомендуется для большинства случаев
- **[Документация низкоуровневого API](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - Для сложных случаев, требующих детального контроля

## Системные требования {#requirements}

- Go 1.21 или новее
- Совместим с Linux, macOS