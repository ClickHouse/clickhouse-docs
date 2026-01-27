---
title: 'chDB для Go'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'Как установить и использовать chDB на Go'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# chDB для Go \{#chdb-for-go\}

chDB-go предоставляет привязки Go для chDB, позволяя запускать запросы ClickHouse напрямую в ваших Go-приложениях без внешних зависимостей.

## Установка \{#installation\}

### Шаг 1: Установка libchdb \{#install-libchdb\}

Сначала установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```


### Шаг 2: Установка chdb-go \{#install-chdb-go\}

Установите пакет Go:

```bash
go install github.com/chdb-io/chdb-go@latest
```

Или добавьте его в ваш `go.mod`:

```bash
go get github.com/chdb-io/chdb-go
```


## Использование \{#usage\}

### Интерфейс командной строки \{#cli\}

chDB-go включает CLI для быстрых запросов:

```bash
# Simple query
./chdb-go "SELECT 123"

# Interactive mode
./chdb-go

# Interactive mode with persistent storage
./chdb-go --path /tmp/chdb
```


### Библиотека Go - быстрый старт \{#quick-start\}

#### Запросы без состояния \{#stateless-queries\}

Для простых одноразовых запросов:

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


#### Запросы с состоянием через сессию \{#stateful-queries\}

Для сложных запросов с постоянным состоянием:

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


#### Интерфейс SQL-драйвера \{#sql-driver\}

chDB-go реализует интерфейс Go `database/sql`:

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


#### Потоковые запросы для больших наборов данных \{#query-streaming\}

Для обработки больших наборов данных, которые не помещаются в памяти, используйте потоковые запросы:

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

**Преимущества потоковых запросов:**

* **Эффективное использование памяти** - Обрабатывайте большие наборы данных без загрузки всего в память
* **Обработка в реальном времени** - Начинайте обрабатывать данные, как только поступит первый фрагмент
* **Поддержка отмены** - Можно отменять долго выполняющиеся запросы с помощью `Cancel()`
* **Обработка ошибок** - Проверяйте ошибки во время потоковой обработки с помощью `Error()`


## Документация API \{#api-documentation\}

chDB-go предоставляет API как высокого, так и низкого уровня:

- **[Документация API высокого уровня](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** - Рекомендуется для большинства случаев использования
- **[Документация API низкого уровня](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** - Для продвинутых случаев использования, требующих детального контроля

## Системные требования \{#requirements\}

- Go 1.21 или новее
- Совместим с Linux, macOS