---
sidebar_label: 'API database/sql'
sidebar_position: 4
keywords: ['clickhouse', 'go', 'golang', 'база данных', 'sql', 'стандартный']
description: 'Использование стандартного интерфейса database/sql с clickhouse-go.'
slug: /integrations/language-clients/go/database-sql-api
title: 'API database/sql'
doc_type: 'справочник'
---

# API `database/sql` \{#database-sql-api\}

Полные примеры кода для стандартного API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).

Сведения о настройке подключения см. в разделе [Configuration](/integrations/language-clients/go/configuration).
Сведения о поддерживаемых типах данных и сопоставлении с типами Go см. в разделе [Data Types](/integrations/language-clients/go/data-types).

API `database/sql`, или «стандартный» API, позволяет использовать клиент в сценариях, где код приложения должен оставаться независимым от конкретной базы данных за счёт соответствия стандартному интерфейсу. Это связано с определёнными издержками: дополнительными уровнями абстракции и непрямого доступа, а также примитивами, которые не обязательно согласуются с ClickHouse. Однако такие издержки обычно приемлемы в сценариях, где инструментам необходимо подключаться к нескольким базам данных.

Кроме того, этот клиент поддерживает использование HTTP в качестве транспортного уровня — данные при этом по-прежнему кодируются в собственном формате для оптимальной производительности.

## Подключение \{#connecting\}

Подключиться можно либо с помощью строки DSN в формате `clickhouse://<host>:<port>?<query_option>=<value>` и метода `Open`, либо через метод `clickhouse.OpenDB`. Последний не входит в спецификацию `database/sql`, но возвращает экземпляр `sql.DB`. Этот метод предоставляет, например, такую функциональность, как профилирование, для которой спецификация `database/sql` не предлагает очевидных способов реализации.

```go
func Connect() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
        })
        return conn.Ping()
}

func ConnectDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://%s:%d?username=%s&password=%s", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**Во всех приведённых далее примерах, если не указано иное, предполагается, что переменная ClickHouse `conn` уже создана и доступна.**

### Настройки подключения \{#connection-settings\}

Большинство параметров настройки являются общими с API ClickHouse. Общие параметры см. в разделе [Configuration](/integrations/language-clients/go/configuration). Доступны следующие DSN-параметры, специфичные для SQL:

* `hosts` - разделённый запятыми список адресов узлов для балансировки нагрузки и failover — см. [Connecting to Multiple Nodes](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes).
* `username/password` - учётные данные для аутентификации — см. [Authentication](/integrations/language-clients/go/configuration#authentication)
* `database` - выбрать текущую базу данных по умолчанию
* `dial_timeout` - строка длительности представляет собой последовательность десятичных чисел, возможно со знаком; каждое число может иметь дробную часть и суффикс единицы измерения, например `300ms`, `1s`. Допустимые единицы времени: `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (по умолчанию `random`) — см. [Connecting to Multiple Nodes](/integrations/language-clients/go/configuration#connecting-to-multiple-nodes)
  * `round_robin` - выбирать сервер из набора по круговому алгоритму
  * `in_order` - выбирается первый доступный сервер в указанном порядке
* `debug` - включить вывод отладочной информации (логическое значение)
* `compress` - указать алгоритм сжатия — `none` (по умолчанию), `zstd`, `lz4`, `gzip`, `deflate`, `br`. Если указать `true`, будет использоваться `lz4`. Для собственного протокола поддерживаются только `lz4` и `zstd`.
* `compress_level` - уровень сжатия (по умолчанию `0`). См. Compression. Это зависит от алгоритма:
  * `gzip` - от `-2` (максимальная скорость) до `9` (максимальное сжатие)
  * `deflate` - от `-2` (максимальная скорость) до `9` (максимальное сжатие)
  * `br` - от `0` (максимальная скорость) до `11` (максимальное сжатие)
  * `zstd`, `lz4` - игнорируется
* `secure` - установить защищённое SSL-соединение (по умолчанию `false`)
* `skip_verify` - пропустить проверку сертификата (по умолчанию `false`)
* `block_buffer_size` - позволяет управлять размером буфера блоков. См. [`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings). (по умолчанию `2`)

```go
func ConnectSettings() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d/%s?username=%s&password=%s&dial_timeout=10s&connection_open_strategy=round_robin&debug=true&compress=lz4", env.Host, env.Port, env.Database, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

### Подключение по HTTP \{#connecting-over-http\}

По умолчанию подключения устанавливаются по собственному протоколу. Если требуется HTTP, включить его можно одним из двух способов: изменить DSN, добавив протокол HTTP, или указать Protocol в параметрах подключения.

```go
func ConnectHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                Protocol: clickhouse.HTTP,
        })
        return conn.Ping()
}

func ConnectDSNHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

### Сессии \{#sessions\}

:::note Только HTTP
Сессии нужны только при использовании HTTP-транспорта. В собственных TCP-подключениях сессия создаётся автоматически.
:::

При использовании HTTP передайте `session_id` как параметр настройки, чтобы включить возможности, привязанные к сессии, например временные таблицы.

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Protocol: clickhouse.HTTP,
    Settings: clickhouse.Settings{
        "session_id": uuid.NewString(),
    },
})
if _, err := conn.Exec(`DROP TABLE IF EXISTS example`); err != nil {
    return err
}
_, err = conn.Exec(`
    CREATE TEMPORARY TABLE IF NOT EXISTS example (
            Col1 UInt8
    )
`)
if err != nil {
    return err
}
scope, err := conn.Begin()
if err != nil {
    return err
}
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 10; i++ {
    _, err := batch.Exec(
        uint8(i),
    )
    if err != nil {
        return err
    }
}
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1 uint8
)
for rows.Next() {
    if err := rows.Scan(&col1); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d\n", col1)
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

## Выполнение \{#execution\}

После установления подключения вы можете передавать команды `sql` на выполнение с помощью метода Exec.

```go
conn.Exec(`DROP TABLE IF EXISTS example`)
_, err = conn.Exec(`
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
_, err = conn.Exec("INSERT INTO example VALUES (1, 'test-1')")
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

Этот метод не поддерживает передачу контекста — по умолчанию он выполняется с фоновым контекстом. При необходимости используйте `ExecContext` — см. [Использование контекста](#using-context).

## Пакетная вставка \{#batch-insert\}

Семантику пакетной вставки можно реализовать, создав `sql.Tx` с помощью метода `Being`. После этого пакет можно получить с помощью метода `Prepare` с командой `INSERT`. В результате возвращается `sql.Stmt`, к которому строки могут быть добавлены с помощью метода `Exec`. Пакет будет накапливаться в памяти, пока для исходного `sql.Tx` не будет выполнен `Commit`.

```go
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1000; i++ {
    _, err := batch.Exec(
        uint8(42),
        "ClickHouse", "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}
return scope.Commit()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

## Запрос строк \{#querying-rows\}

Чтобы запросить одну строку, используйте метод `QueryRow`. Он возвращает  *sql.Row, для которого можно вызвать Scan, передав указатели на переменные, в которые будут записаны значения столбцов. Вариант `QueryRowContext` позволяет передать контекст, отличный от фонового контекста, — см. [Использование контекста](#using-context).

```go
row := conn.QueryRow("SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

Для перебора нескольких строк используйте метод `Query`. Он возвращает структуру `*sql.Rows`, у которой можно вызывать Next для итерации по строкам. Эквивалент `QueryContext` позволяет передавать контекст.

```go
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

## Асинхронная вставка \{#async-insert\}

Асинхронные вставки можно выполнять, вызывая insert через метод `ExecContext`. В него следует передать контекст с включённым асинхронным режимом, как показано ниже. Это позволяет пользователю указать, должен ли клиент ждать, пока сервер завершит insert, или вернуть ответ сразу после получения данных. Это фактически управляет параметром [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert).

```go
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
    `
if _, err := conn.Exec(ddl); err != nil {
    return err
}
ctx := clickhouse.Context(context.Background(), clickhouse.WithStdAsync(false))
{
    for i := 0; i < 100; i++ {
        _, err := conn.ExecContext(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
            %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
        )`, i, "Golang SQL database driver"))
        if err != nil {
            return err
        }
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

## Привязка параметров \{#parameter-binding\}

Стандартный API поддерживает те же возможности привязки параметров, что и [API ClickHouse](/integrations/language-clients/go/clickhouse-api#parameter-binding): параметры можно передавать в методы `Exec`, `Query` и `QueryRow` (а также в их эквивалентные варианты с [Context](#using-context)). Поддерживаются позиционные, именованные и нумерованные параметры.

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

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

Примечание: [особые случаи](/integrations/language-clients/go/clickhouse-api#special-cases) по-прежнему действуют.

## Использование контекста \{#using-context\}

Стандартный API поддерживает ту же возможность передавать через контекст дедлайны, сигналы отмены и другие значения, ограниченные областью действия запроса, что и [ClickHouse API](/integrations/language-clients/go/clickhouse-api#using-context). В отличие от ClickHouse API, здесь это реализовано с помощью вариантов методов с `Context`: например, у таких методов, как `Exec`, которые по умолчанию используют фоновый контекст, есть вариант `ExecContext`, в который контекст передаётся первым параметром. Это позволяет передавать контекст на любом этапе выполнения приложения. Например, контекст можно передать при установлении подключения через `ConnContext` или при запросе строки через `QueryRowContext`. Ниже приведены примеры всех доступных методов.

Подробнее об использовании контекста для передачи дедлайнов, сигналов отмены, идентификаторов запросов, ключей квот и настроек подключения см. в разделе [Using Context](/integrations/language-clients/go/clickhouse-api#using-context) для ClickHouse API.

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "async_insert": "1",
}))

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached. Again terminates the connection only,
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
var one uint8
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(uuid.NewString()))
if err = conn.QueryRowContext(ctx, "SELECT 1").Scan(&one); err != nil {
    return err
}

conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
    conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// set a quota key - first create the quota
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel = context.WithCancel(context.Background())
// we will get some results before cancel
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
    "max_block_size": "1",
}))
rows, err := conn.QueryContext(ctx, "SELECT sleepEachRow(1), number FROM numbers(100);")
if err != nil {
    return err
}
defer rows.Close()

var (
    col1 uint8
    col2 uint8
)

for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        if col2 > 3 {
            fmt.Println("expected cancel")
            return nil
        }
        return err
    }
    fmt.Printf("row: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

## Динамическое сканирование \{#dynamic-scanning\}

Аналогично [ClickHouse API](/integrations/language-clients/go/clickhouse-api#dynamic-scanning), доступна информация о типах столбцов, которая позволяет во время выполнения создавать экземпляры переменных с корректными типами для передачи в `Scan`. Это позволяет считывать столбцы, даже если их тип заранее неизвестен.

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.QueryContext(context.Background(), query)
if err != nil {
    return err
}
defer rows.Close()

columnTypes, err := rows.ColumnTypes()
if err != nil {
    return err
}
vars := make([]interface{}, len(columnTypes))
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

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

## Внешние таблицы \{#external-tables\}

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse вместе с запросом `SELECT`. Эти данные помещаются во временную таблицу и могут использоваться в самом запросе для вычислений.

Чтобы отправить внешние данные вместе с запросом, пользователь должен создать внешнюю таблицу через `ext.NewTable`, а затем передать её через контекст.

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
rows, err := conn.QueryContext(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
defer rows.Close()

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

var count uint64
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

## OpenTelemetry \{#open-telemetry\}

ClickHouse поддерживает [передачу контекста трейсинга](/operations/opentelemetry/) как по TCP, так и по HTTP. Используйте `clickhouse.WithSpan`, чтобы привязать спан к запросу через контекст.

:::note Ограничение HTTP-транспорта
Хотя сервер ClickHouse принимает стандартные HTTP-заголовки `traceparent` / `tracestate`, HTTP-транспорт clickhouse-go сейчас их не отправляет, поэтому `WithSpan` не работает через HTTP. В качестве обходного решения можно задать заголовки вручную через `HttpHeaders` в параметрах подключения.
:::

```go
var count uint64
rows := conn.QueryRowContext(clickhouse.Context(context.Background(), clickhouse.WithSpan(
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

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## Сжатие \{#compression\}

Стандартный API поддерживает те же алгоритмы сжатия, что и собственный [API ClickHouse](/integrations/language-clients/go/configuration#compression), то есть сжатие `lz4` и `zstd` на уровне блоков. Кроме того, для HTTP-соединений поддерживаются алгоритмы сжатия gzip, deflate и br. Если любой из них включён, сжатие применяется к блокам при вставке и к ответам на запросы. Другие запросы, например ping или запросы запроса, остаются несжатыми. Это соответствует параметрам `lz4` и `zstd`.

При использовании метода `OpenDB` для установки подключения можно передать настройку Compression. Она также позволяет указать уровень сжатия (см. ниже). При подключении через `sql.Open` с DSN используйте параметр `compress`. Это может быть либо конкретный алгоритм сжатия, например `gzip`, `deflate`, `br`, `zstd` или `lz4`, либо булев флаг. Если установить значение true, будет использоваться `lz4`. По умолчанию используется `none`, то есть сжатие отключено.

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionBrotli,
        Level:  5,
    },
    Protocol: clickhouse.HTTP,
})
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

Уровень применяемого сжатия можно задать параметром DSN `compress&#95;level` или полем Level в опции Compression. Значение по умолчанию — `0`, но оно зависит от алгоритма:

* `gzip` - от `-2` (максимальная скорость) до `9` (максимальное сжатие)
* `deflate` - от `-2` (максимальная скорость) до `9` (максимальное сжатие)
* `br` - от `0` (максимальная скорость) до `11` (максимальное сжатие)
* `zstd`, `lz4` - игнорируется
