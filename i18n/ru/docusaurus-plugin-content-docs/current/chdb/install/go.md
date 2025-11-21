---
title: 'chDB для Go'
sidebar_label: 'Go'
slug: /chdb/install/go
description: 'Как установить и использовать chDB в Go'
keywords: ['chdb', 'go', 'golang', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# chDB для Go

chDB-go предоставляет биндинги для Go к chDB, позволяя выполнять запросы ClickHouse непосредственно из ваших Go‑приложений без внешних зависимостей.



## Установка {#installation}

### Шаг 1: Установка libchdb {#install-libchdb}

Сначала установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```

### Шаг 2: Установка chdb-go {#install-chdb-go}

Установите пакет Go:

```bash
go install github.com/chdb-io/chdb-go@latest
```

Или добавьте его в файл `go.mod`:

```bash
go get github.com/chdb-io/chdb-go
```


## Использование {#usage}

### Интерфейс командной строки {#cli}

chDB-go включает в себя CLI для быстрого выполнения запросов:


```bash
# Простой запрос
./chdb-go "SELECT 123"
```


# Интерактивный режим
./chdb-go



# Интерактивный режим с постоянным хранилищем

./chdb-go --path /tmp/chdb

````

### Библиотека Go — быстрый старт {#quick-start}

#### Запросы без состояния {#stateless-queries}

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

#### Запросы с состоянием через сессию {#stateful-queries}

Для сложных запросов с сохранением состояния:

```go
package main

import (
    "fmt"
    "github.com/chdb-io/chdb-go"
)

func main() {
    // Создать сессию с постоянным хранилищем
    session, err := chdb.NewSession("/tmp/chdb-data")
    if err != nil {
        panic(err)
    }
    defer session.Cleanup()

    // Создать базу данных и таблицу
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

    // Вставить данные
    _, err = session.Query(`
        INSERT INTO testdb.test_table VALUES
        (1, 'Alice'), (2, 'Bob'), (3, 'Charlie')
    `, "")

    if err != nil {
        panic(err)
    }

    // Запросить данные
    result, err := session.Query("SELECT * FROM testdb.test_table ORDER BY id", "Pretty")
    if err != nil {
        panic(err)
    }

    fmt.Println(result)
}
```

#### Интерфейс SQL-драйвера {#sql-driver}

chDB-go реализует интерфейс `database/sql` языка Go:

```go
package main

import (
    "database/sql"
    "fmt"
    _ "github.com/chdb-io/chdb-go/driver"
)

func main() {
    // Открыть соединение с базой данных
    db, err := sql.Open("chdb", "")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // Выполнить запрос через стандартный интерфейс database/sql
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

Для обработки больших наборов данных, не помещающихся в память, используйте потоковые запросы:

```go
package main

import (
    "fmt"
    "log"
    "github.com/chdb-io/chdb-go/chdb"
)

func main() {
    // Создать сессию для потоковых запросов
    session, err := chdb.NewSession("/tmp/chdb-stream")
    if err != nil {
        log.Fatal(err)
    }
    defer session.Cleanup()

    // Выполнить потоковый запрос для большого набора данных
    streamResult, err := session.QueryStreaming(
        "SELECT number, number * 2 as double FROM system.numbers LIMIT 1000000",
        "CSV",
    )
    if err != nil {
        log.Fatal(err)
    }
    defer streamResult.Free()

    rowCount := 0

    // Обработать данные порциями
    for {
        chunk := streamResult.GetNext()
        if chunk == nil {
            // Данных больше нет
            break
        }

        // Проверить наличие ошибок потоковой обработки
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


**Преимущества потоковой обработки запросов:**
- **Эффективное использование памяти** - Обрабатывайте большие наборы данных, не загружая их целиком в память
- **Обработка в реальном времени** - Начинайте обработку данных, как только поступит первый фрагмент данных
- **Поддержка отмены** - Можно отменять длительно выполняющиеся запросы с помощью `Cancel()`
- **Обработка ошибок** - Проверяйте наличие ошибок во время потоковой обработки с помощью `Error()`



## Документация API {#api-documentation}

chDB-go предоставляет API как высокого, так и низкого уровня:

- **[Документация API высокого уровня](https://github.com/chdb-io/chdb-go/blob/main/chdb.md)** — рекомендуется для большинства сценариев использования
- **[Документация API низкого уровня](https://github.com/chdb-io/chdb-go/blob/main/lowApi.md)** — для сложных сценариев использования, требующих детального контроля


## Системные требования {#requirements}

- Go 1.21 или более поздняя версия
- Совместим с Linux, macOS
