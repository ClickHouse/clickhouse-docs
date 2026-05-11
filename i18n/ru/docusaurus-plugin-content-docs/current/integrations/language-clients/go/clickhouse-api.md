---
sidebar_label: 'ClickHouse API'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'api', 'запрос', 'insert', 'batch']
description: 'Работа с собственным API ClickHouse через clickhouse-go: выполнение запросов, пакетная и асинхронная вставка данных и многое другое.'
slug: /integrations/language-clients/go/clickhouse-api
title: 'ClickHouse API'
doc_type: 'справочник'
---

# ClickHouse API \{#clickhouse-api\}

Все примеры кода для ClickHouse API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/clickhouse_api).

Сведения о настройке подключения см. в разделе [Настройка](/integrations/language-clients/go/configuration).
Сведения о поддерживаемых типах данных и сопоставлениях типов Go см. в разделе [Типы данных](/integrations/language-clients/go/data-types).

## Подключение \{#connecting\}

В следующем примере, который возвращает версию сервера, показано подключение к ClickHouse при условии, что ClickHouse не защищён и доступен через пользователя по умолчанию.

Обратите внимание: для подключения используется собственный порт по умолчанию.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
fmt.Println(v)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**Во всех последующих примерах, если не указано иное, предполагается, что переменная ClickHouse `conn` уже создана и доступна.**

## Выполнение \{#execution\}

С помощью метода `Exec` можно выполнять произвольные команды. Это полезно для DDL и простых команд. Его не следует использовать для крупных вставок или итераций по результатам запросов.

```go
conn.Exec(context.Background(), `DROP TABLE IF EXISTS example`)
err = conn.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
conn.Exec(context.Background(), "INSERT INTO example VALUES (1, 'test-1')")
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

Обратите внимание, что в запрос можно передать Context. Это можно использовать для передачи настроек на уровне конкретного запроса — см. [Использование контекста](#using-context).

## Пакетная вставка \{#batch-insert\}

Чтобы вставить большое количество строк, клиент поддерживает пакетную вставку. Для этого нужно подготовить пакет, в который могут быть добавлены строки. Затем пакет отправляется с помощью метода `Send()`. Пакеты хранятся в памяти до вызова `Send`.

Рекомендуется вызывать `Close` для пакета, чтобы избежать утечки подключений. Это можно сделать с помощью ключевого слова `defer` сразу после подготовки пакета. Это очистит подключение, если `Send` так и не будет вызван. Обратите внимание, что в этом случае в логе запросов будет отображаться вставка 0 строк, если не была добавлена ни одна строка.

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE IF NOT EXISTS example (
            Col1 UInt8
        , Col2 String
        , Col3 FixedString(3)
        , Col4 UUID
        , Col5 Map(String, UInt8)
        , Col6 Array(String)
        , Col7 Tuple(String, UInt8, Array(Map(String, String)))
        , Col8 DateTime
    ) Engine = Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        uint8(42),
        "ClickHouse",
        "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                {"key": "value"},
                {"key": "value"},
                {"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}

return batch.Send()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

Здесь также применимы рекомендации для ClickHouse [здесь](/guides/inserting-data#best-practices-for-inserts). Не используйте один и тот же пакет в нескольких goroutine — создавайте отдельный пакет для каждой goroutine.

Из приведенного выше примера обратите внимание: при добавлении строк типы переменных должны соответствовать типу столбца. Хотя соответствие обычно очевидно, этот интерфейс спроектирован достаточно гибко, и типы будут преобразованы, если это не приведет к потере точности. Например, ниже показана вставка строки в datetime64.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        "2006-01-02 15:04:05.999",
    )
    if err != nil {
        return err
    }
}

return batch.Send()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

Полный обзор поддерживаемых типов Go для каждого типа столбца см. в разделе [Преобразования типов](/integrations/language-clients/go/data-types#type-conversions).

## Эфемерные столбцы \{#ephemeral-columns\}

[Эфемерные столбцы](https://clickhouse.com/docs/sql-reference/statements/create/table#ephemeral) — это столбцы, доступные только для записи и существующие лишь во время вставки: они не хранятся и их нельзя выбрать. Они полезны для вычисления значений производных столбцов при вставке.

```go
ctx := context.Background()
ddl := `
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id`

if err := conn.Exec(ctx, ddl); err != nil {
    return err
}

// Insert by providing the ephemeral column value
if err := conn.Exec(ctx, "INSERT INTO test (id, unhexed) VALUES (1, '5a90b714')"); err != nil {
    return err
}

// Only non-ephemeral columns can be queried
rows, err := conn.Query(ctx, "SELECT id, hexed, hex(hexed) FROM test")
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ephemeral_native.go)

## Запрос строк \{#querying-rows\}

Вы можете либо выполнить запрос для одной строки с помощью метода `QueryRow`, либо получить курсор для итерации по результирующему набору через `Query`. В первом случае метод принимает destination, в который сериализуются данные, а во втором для каждой строки нужно вызывать `Scan`.

```go
row := conn.QueryRow(context.Background(), "SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             []interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

```go
rows, err := conn.Query(ctx, "SELECT Col1, Col2, Col3 FROM example WHERE Col1 >= 2")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", col1, col2, col3)
}
rows.Close()
return rows.Err()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

Обратите внимание: в обоих случаях нужно передавать указатель на переменные, в которые будут сериализованы значения соответствующих столбцов. Их следует передавать в порядке, указанном в команде `SELECT` — в случае `SELECT *` по умолчанию используется порядок объявления столбцов, как показано выше.

Аналогично вставке, метод Scan требует, чтобы целевые переменные были подходящего типа. Здесь также сохраняется гибкость: типы преобразуются там, где это возможно, если при этом не теряется точность; например, в приведённом выше примере столбец UUID считывается в строковую переменную. Полный список поддерживаемых типов Go для каждого типа столбца см. в разделе [Преобразования типов](/integrations/language-clients/go/data-types#type-conversions).

Наконец, обратите внимание, что в методы `Query` и `QueryRow` можно передавать `Context`. Это можно использовать для настроек на уровне запроса — подробности см. в разделе [Использование контекста](#using-context).

## Асинхронная вставка \{#async-insert\}

Асинхронные вставки поддерживаются с помощью метода Async. Это позволяет указать, должен ли клиент ждать, пока сервер завершит вставку, или отвечать сразу после получения данных. Тем самым управляется параметр [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert).

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 21, 12, 0); err != nil {
    return nil
}
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, `DROP TABLE IF EXISTS example`)
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
`
if err := conn.Exec(ctx, ddl); err != nil {
    return err
}
for i := 0; i < 100; i++ {
    if err := conn.AsyncInsert(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
        %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
    )`, i, "Golang SQL database driver"), false); err != nil {
        return err
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

## Столбцовая вставка \{#columnar-insert\}

Данные можно вставлять в столбцовом формате. Это может повысить производительность, если данные уже организованы таким образом, поскольку не требуется преобразовывать их в строки.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var (
    col1 []uint64
    col2 []string
    col3 [][]uint8
    col4 []time.Time
)
for i := 0; i < 1_000; i++ {
    col1 = append(col1, uint64(i))
    col2 = append(col2, "Golang SQL database driver")
    col3 = append(col3, []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9})
    col4 = append(col4, time.Now())
}
if err := batch.Column(0).Append(col1); err != nil {
    return err
}
if err := batch.Column(1).Append(col2); err != nil {
    return err
}
if err := batch.Column(2).Append(col3); err != nil {
    return err
}
if err := batch.Column(3).Append(col4); err != nil {
    return err
}

return batch.Send()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

## Использование структур \{#using-structs\}

Для пользователей структуры Golang служат логическим представлением строки данных в ClickHouse. Для этого в собственном интерфейсе предусмотрено несколько удобных функций.

### Select с сериализацией \{#select-with-serialize\}

Метод Select позволяет за один вызов сериализовать набор строк ответа в срез структур.

```go
var result []struct {
    Col1           uint8
    Col2           string
    ColumnWithName time.Time `ch:"Col3"`
}

if err = conn.Select(ctx, &result, "SELECT Col1, Col2, Col3 FROM example"); err != nil {
    return err
}

for _, v := range result {
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", v.Col1, v.Col2, v.ColumnWithName)
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

### Сканирование в структуру \{#scan-struct\}

`ScanStruct` позволяет выполнить маппинг одной строки результата запроса в структуру.

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

### Добавление структуры \{#append-struct\}

`AppendStruct` позволяет добавить структуру в существующий [пакет](#batch-insert) и интерпретировать его как полную строку. Для этого имена и типы столбцов в структуре должны совпадать с таблицей. Хотя каждому столбцу должно соответствовать эквивалентное поле структуры, некоторые поля структуры могут не иметь соответствующего столбца в таблице. Такие поля будут просто проигнорированы.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL database driver",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "this will be ignored",
    })
    if err != nil {
        return err
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

## Привязка параметров \{#parameter-binding\}

Клиент поддерживает привязку параметров в методах `Exec`, `Query` и `QueryRow`. Как показано в примере ниже, поддерживаются именованные, нумерованные и позиционные параметры. Ниже приведены примеры для каждого из этих вариантов.

```go
var count uint64
// positional bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// numeric bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// named bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

### Особые случаи \{#special-cases\}

По умолчанию срезы, переданные в запрос как параметр, разворачиваются в список значений, разделённых запятыми. Если набор значений должен быть подставлен в квадратных скобках `[ ]`, используйте `ArraySet`.

Если нужны группы/кортежи в круглых скобках `( )`, например для использования с операторами IN, можно использовать `GroupSet`. Это особенно полезно, когда требуется несколько групп, как показано в примере ниже.

Наконец, для полей DateTime64 необходимо указывать точность, чтобы параметры отображались корректно. Однако клиенту уровень точности поля неизвестен, поэтому пользователь должен указать его сам. Для этого предусмотрен параметр `DateNamed`.

```go
var count uint64
// arrays will be unfolded
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array unfolded count: %d\n", count)
// arrays will be preserved with []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array count: %d\n", count)
// Group sets allow us to form ( ) lists
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// More useful when we need nesting
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// Use DateNamed when you need a precision in your time#
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

## Использование контекста \{#using-context\}

Контексты Go позволяют передавать сроки, сигналы отмены и другие значения, относящиеся к запросу, через границы API. Все методы соединения принимают контекст в качестве первого аргумента. Хотя в предыдущих примерах использовался `context.Background()`, этот механизм также можно использовать для передачи настроек и сроков, а также для отмены запросов.

Передача контекста, созданного с помощью `withDeadline`, позволяет задавать лимиты времени выполнения запросов. Обратите внимание: это абсолютное время, и по его истечении будет лишь освобождено соединение и отправлен сигнал отмены в ClickHouse. Для явной отмены запроса также можно использовать `WithCancel`.

Вспомогательные функции `clickhouse.WithQueryID` и `clickhouse.WithQuotaKey` позволяют указать идентификатор запроса и ключ квоты. Идентификаторы запросов могут быть полезны для отслеживания запросов в логах и их отмены. Ключ квоты можно использовать, чтобы накладывать лимиты на использование ClickHouse на основе уникального значения ключа — подробнее см. в разделе [Управление квотами](/operations/access-rights#quotas-management).

Контекст также можно использовать, чтобы настройка применялась только к конкретному запросу, а не ко всему соединению, как показано в разделе [Настройки соединения](/integrations/language-clients/go/configuration#connection-settings).

Наконец, размер буфера блоков можно задать с помощью `clickhouse.WithBlockSize`. Это переопределяет настройку уровня соединения `BlockBufferSize` и управляет максимальным количеством блоков, которые могут быть декодированы и одновременно находиться в памяти. Более высокие значения могут дать большую степень распараллеливания ценой повышенного расхода памяти.

Примеры всего перечисленного приведены ниже.

```go
dialCount := 0
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
        dialCount++
        var d net.Dialer
        return d.DialContext(ctx, "tcp", addr)
    },
})
if err != nil {
    return err
}
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 22, 6, 1); err != nil {
    return nil
}
// we can use context to pass settings to a specific API call
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "async_insert": "1",
}))

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached.
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
var one uint8
queryId, _ := uuid.NewUUID()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(queryId.String()))
if err = conn.QueryRow(ctx, "SELECT 1").Scan(&one); err != nil {
    return err
}

conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
    conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// set a quota key - first create the quota
if err = conn.Exec(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

type Number struct {
    Number uint64 `ch:"number"`
}
for i := 1; i <= 6; i++ {
    var result []Number
    if err = conn.Select(ctx, &result, "SELECT number FROM numbers(10)"); err != nil {
        return err
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

## Информация о ходе выполнения, профиле и логах \{#progress-profile-log\}

Для запросов можно получать информацию о ходе выполнения, профиле и логах. Информация о ходе выполнения содержит статистику о количестве строк и байтов, прочитанных и обработанных в ClickHouse. В свою очередь, информация профиля даёт сводку по данным, возвращённым клиенту, включая общее количество байтов (в несжатом виде), строк и блоков. Наконец, информация логов содержит статистику по потокам, например об использовании памяти и скорости обработки данных.

Чтобы получить эту информацию, пользователю необходимо использовать [Context](#using-context), в который можно передавать callback-функции.

```go
totalRows := uint64(0)
// use context to pass a call back for progress and profile info
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("progress: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("profile info: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("log info: ", log)
}))

rows, err := conn.Query(ctx, "SELECT number from numbers(1000000) LIMIT 1000000")
if err != nil {
    return err
}
for rows.Next() {
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

## Динамическое сканирование \{#dynamic-scanning\}

Может потребоваться читать таблицы, для которых неизвестны схема или тип возвращаемых полей. Это часто встречается при специальном анализе данных или при разработке универсальных инструментов. Для этого в ответах на запросы доступна информация о типах столбцов. Ее можно использовать вместе с reflection в Go, чтобы во время выполнения создавать экземпляры переменных с корректными типами, которые затем можно передать в Scan.

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.Query(context.Background(), query)
if err != nil {
    return err
}
defer rows.Close()
var (
    columnTypes = rows.ColumnTypes()
    vars        = make([]interface{}, len(columnTypes))
)
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

## Внешние таблицы \{#external-tables\}

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse вместе с запросом SELECT. Эти данные помещаются во временную таблицу и могут использоваться в самом запросе при вычислении.

Чтобы передать внешние данные вместе с запросом, пользователь должен создать внешнюю таблицу через `ext.NewTable`, а затем передать её через context.

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.Query(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
rows.Close()

var count uint64
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

## OpenTelemetry \{#open-telemetry\}

ClickHouse поддерживает [распространение контекста трассировки](/operations/opentelemetry/) как по TCP, так и по HTTP. При использовании TCP клиент сериализует спан в собственный бинарный протокол. Используйте `clickhouse.WithSpan`, чтобы привязать спан к запросу через контекст.

:::note Ограничение HTTP-транспорта
Хотя сервер ClickHouse принимает стандартные HTTP-заголовки `traceparent` / `tracestate`, HTTP-транспорт clickhouse-go пока их не отправляет — `WithSpan` не работает поверх HTTP. В качестве обходного решения можно вручную задать заголовок через `HttpHeaders` в параметрах подключения.
:::

```go
var count uint64
rows := conn.QueryRow(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

Подробное описание использования трейсинга см. в разделе [поддержка OpenTelemetry](/operations/opentelemetry/).
