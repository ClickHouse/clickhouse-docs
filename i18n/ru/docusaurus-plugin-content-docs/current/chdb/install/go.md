---
title: 'chDB для Go'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'Как установить и использовать chDB на Go'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# chDB для Go

chDB-go предоставляет биндинги Go к chDB, позволяя выполнять запросы к ClickHouse напрямую в ваших Go‑приложениях без каких-либо внешних зависимостей.



## Установка

### Шаг 1: Установите libchdb

Сначала установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```

### Шаг 2: Установите chdb-go

Установите пакет Go:

```bash
go install github.com/chdb-io/chdb-go@latest
```

Или добавьте это в файл `go.mod`:

```bash
go get github.com/chdb-io/chdb-go
```


## Использование {#usage}

### Интерфейс командной строки {#cli}

chDB-go предоставляет утилиту командной строки для быстрых запросов:



```bash
# Простой запрос
./chdb-go "SELECT 123"
```


# Интерактивный режим
./chdb-go



# Интерактивный режим с постоянным хранилищем данных

./chdb-go --path /tmp/chdb

````

### Библиотека Go — быстрый старт               

#### Запросы без состояния                     

Для простых разовых запросов:

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // Выполнить простой запрос
    result, err := chdb.Query("SELECT version()", "CSV")
    if err != nil {
        panic(err)
    }
    fmt.Println(result)
}
````

#### Сессионные запросы с сохранением состояния

Для сложных запросов с сохраняемым состоянием:

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // Создание сессии с постоянным хранилищем
    session, err := chdb.NewSession("/tmp/chdb-data")
    if err != nil {
        panic(err)
    }
    defer session.Cleanup()

    // Создание базы данных и таблицы
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

    // Вставка данных
    _, err = session.Query(`
        INSERT INTO testdb.test_table VALUES 
        (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')
    `, "")
    
    if err != nil {
        panic(err)
    }

    // Запрос данных
    result, err := session.Query("SELECT * FROM testdb.test_table ORDER BY id", "Pretty")
    if err != nil {
        panic(err)
    }
    
    fmt.Println(result)
}
```

#### Интерфейс SQL-драйвера

chDB-go реализует интерфейс `database/sql` из стандартной библиотеки Go:

```go
package main

import (
    "database/sql"
    "fmt"
    _ "github.com/chdb-io/chdb-go/driver"
)

func main() {
    // Открытие соединения с базой данных
    db, err := sql.Open("chdb", "")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // Запрос через стандартный интерфейс database/sql
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
        fmt.Printf("Количество: %d\n", count)
    }
}
```

#### Потоковая выборка для больших наборов данных

Для обработки больших наборов данных, которые не помещаются в оперативную память, используйте потоковые запросы:

```go
package main

import (
    "fmt"
    "log"
    "github.com/chdb-io/chdb-go/chdb"
)

func main() {
    // Создание сессии для потоковых запросов
    session, err := chdb.NewSession("/tmp/chdb-stream")
    if err != nil {
        log.Fatal(err)
    }
    defer session.Cleanup()

    // Выполнение потокового запроса для большого набора данных
    streamResult, err := session.QueryStreaming(
        "SELECT number, number * 2 as double FROM system.numbers LIMIT 1000000", 
        "CSV",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer streamResult.Free()

    rowCount := 0
    
    // Обработка данных порциями
    for {
        chunk := streamResult.GetNext()
        if chunk == nil {
            // Больше нет данных
            break
        }
        
        // Проверка ошибок потоковой передачи
        if err := streamResult.Error(); err != nil {
            log.Printf("Streaming error: %v", err)
            break
        }
        
        rowsRead := chunk.RowsRead()
        // Здесь можно обработать данные порции
        // Например, записать в файл, отправить по сети и т. д.
        fmt.Printf("Обработана порция из %d строк\n", rowsRead)
        rowCount += int(rowsRead)
        if rowCount%100000 == 0 {
            fmt.Printf("Обработано %d строк...\n", rowCount)
        }
    }
    
    fmt.Printf("Всего обработано строк: %d\n", rowCount)
}
```


**Преимущества потокового выполнения запросов:**
- **Эффективное использование памяти** - Обрабатывайте большие наборы данных, не загружая их полностью в память
- **Обработка в реальном времени** - Начинайте обработку данных, как только поступит первый фрагмент
- **Поддержка отмены** - Можно отменять длительные запросы с помощью `Cancel()`
- **Обработка ошибок** - Проверяйте наличие ошибок во время потоковой обработки с помощью `Error()`



## Документация по API {#api-documentation}

chDB-go предоставляет как высокоуровневый, так и низкоуровневый API:

- **[Документация по высокоуровневому API](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** — рекомендуется для большинства сценариев использования
- **[Документация по низкоуровневому API](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** — для более сложных сценариев, требующих детального управления



## Системные требования {#requirements}

- Go 1.21 или новее
- Совместимо с Linux и macOS
