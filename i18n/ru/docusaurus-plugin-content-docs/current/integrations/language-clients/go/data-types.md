---
sidebar_label: 'Типы данных'
sidebar_position: 5
keywords: ['clickhouse', 'go', 'golang', 'типы', 'типы данных', 'сложные типы']
description: 'Соответствие типов Go и поддержка сложных типов в clickhouse-go.'
slug: /integrations/language-clients/go/data-types
title: 'Типы данных'
doc_type: 'справочник'
---

# Типы данных \{#data-types\}

## Преобразования типов \{#type-conversions\}

Клиент стремится быть максимально гибким в том, какие типы переменных он принимает как для вставки, так и для маршалинга ответов. В большинстве случаев для типа столбца ClickHouse существует эквивалентный тип Golang, например [UInt64](/sql-reference/data-types/int-uint/) и [uint64](https://pkg.go.dev/builtin#uint64). Такие логические соответствия должны поддерживаться всегда. В некоторых случаях может потребоваться использовать типы переменных, которые можно вставлять в столбцы или использовать для получения ответа, если предварительно выполняется преобразование самой переменной или полученных данных. Клиент стремится прозрачно поддерживать такие преобразования, чтобы пользователям не приходилось заранее точно приводить данные к нужному типу перед вставкой, а также чтобы обеспечить гибкий маршалинг при выполнении запроса. Такое прозрачное преобразование не допускает потери точности. Например, `uint32` нельзя использовать для получения данных из столбца `UInt64`. И наоборот, строку можно вставить в поле `DateTime64`, если она соответствует требованиям к формату.

Преобразования типов, которые в настоящее время поддерживаются для примитивных типов, приведены [здесь](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

Эта работа продолжается и может быть разделена на вставку (`Append`/`AppendRow`) и чтение (через `Scan`). Если вам нужна поддержка специфичного преобразования, создайте issue.

Стандартный интерфейс `database/sql` должен поддерживать те же типы, что и API ClickHouse. Есть несколько исключений, в основном для сложных типов; они задокументированы в разделах ниже. Как и API ClickHouse, клиент стремится быть максимально гибким в том, какие типы переменных он принимает как для вставки, так и для маршалинга ответов.

## Сложные типы \{#complex-types\}

### Date/DateTime \{#datedatetime\}

Go client для ClickHouse поддерживает типы даты и даты/времени `Date`, `Date32`, `DateTime` и `DateTime64`. Даты можно вставлять как строки в формате `2006-01-02` или с помощью собственных типов Go `time.Time{}` и `sql.NullTime`. `DateTime` также поддерживает эти типы, но строки должны передаваться в формате `2006-01-02 15:04:05` с необязательным смещением часового пояса, например `2006-01-02 15:04:05 +08:00`. При чтении также поддерживаются `time.Time{}` и `sql.NullTime`, а также любая реализация интерфейса `sql.Scanner`.

Обработка информации о часовом поясе зависит от типа ClickHouse и от того, вставляется значение или читается:

* **DateTime/DateTime64**
  * Во время **insert** значение отправляется в ClickHouse в формате временной метки UNIX. Если часовой пояс не указан, клиент предполагает локальный часовой пояс клиента. `time.Time{}` или `sql.NullTime` будут соответственно преобразованы в Unix timestamp.
  * Во время **select** при возврате значения `time.Time` будет использоваться часовой пояс столбца, если он задан. В противном случае будет использоваться часовой пояс сервера.
* **Date/Date32**
  * Во время **insert** при преобразовании даты в временную метку UNIX учитывается её часовой пояс, то есть перед сохранением как даты к ней будет применено смещение по часовому поясу, поскольку типы Date в ClickHouse не содержат информации о часовом поясе. Если в строковом значении он не указан, будет использоваться локальный часовой пояс.
  * Во время **select** даты, считываемые в экземпляры `time.Time{}` или `sql.NullTime{}`, будут возвращаться без информации о часовом поясе.

### Типы Time/Time64 \{#timetime64-types\}

Типы столбцов `Time` и `Time64` хранят значения времени суток без компонента даты. Оба типа сопоставляются с `time.Duration` в Go.

* `Time` хранит время с точностью до секунды.
* `Time64(precision)` поддерживает дробную точность (как `DateTime64`), где `precision` может принимать значения от 0 до 9.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        col1 Time,
        col2 Time64(3)
    ) Engine Memory
`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    14*time.Hour+30*time.Minute+15*time.Second,
    14*time.Hour+30*time.Minute+15*time.Second+500*time.Millisecond,
); err != nil {
    return err
}
if err = batch.Send(); err != nil {
    return err
}

var col1, col2 time.Duration
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v\n", col1, col2)
```

### Array \{#array\}

Массивы следует вставлять в виде среза. Правила типизации элементов соответствуют правилам для [примитивного типа](#type-conversions), то есть, где это возможно, элементы будут преобразованы.

При вызове Scan следует передавать указатель на срез.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))},
        [][]int64{{i, i + 1}, {i + 2, i + 3}, {i + 4, i + 5}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []string
    col2 [][]int64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

### Map \{#map\}

Map следует вставлять как map в Golang; при этом ключи и значения должны соответствовать правилам для типа, определённым [ранее](#type-conversions).

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        map[string]uint64{strconv.Itoa(int(i)): uint64(i)},
        map[string][]string{strconv.Itoa(int(i)): {strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))}},
        map[string]map[string]uint64{strconv.Itoa(int(i)): {strconv.Itoa(int(i)): uint64(i)}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]uint64
    col2 map[string][]string
    col3 map[string]map[string]uint64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

:::note
При использовании API `database/sql` значения Map требуют строгой типизации — `interface{}` нельзя использовать как тип значения. Например, для поля `Map(String,String)` нельзя передать `map[string]interface{}`; вместо него нужно использовать `map[string]string`. При этом переменная типа `interface{}` всегда совместима и может использоваться для более сложных структур.

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)
:::

### Кортежи \{#tuples\}

Кортежи состоят из группы столбцов произвольной длины. Столбцы могут либо иметь явно заданные имена, либо указывать только тип, например:

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

Из этих вариантов именованные кортежи обеспечивают большую гибкость. Если неименованные кортежи можно вставлять и читать только с помощью срезов, то именованные кортежи также совместимы с map.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Tuple(name String, age UInt8),
            Col2 Tuple(String, UInt8),
            Col3 Tuple(name String, id String)
        )
        Engine Memory
    `); err != nil {
    return err
}

defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

// both named and unnamed can be added with slices. Note we can use strongly typed lists and maps if all elements are the same type
if err = batch.Append([]interface{}{"Clicky McClickHouse", uint8(42)}, []interface{}{"Clicky McClickHouse Snr", uint8(78)}, []string{"Dale", "521211"}); err != nil {
    return err
}
if err = batch.Append(map[string]interface{}{"name": "Clicky McClickHouse Jnr", "age": uint8(20)}, []interface{}{"Baby Clicky McClickHouse", uint8(1)}, map[string]string{"name": "Geoff", "id": "12123"}); err != nil {
    return err
}
if err = batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]interface{}
    col2 []interface{}
    col3 map[string]string
)
// named tuples can be retrieved into a map or slices, unnamed just slices
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

Примечание: типизированные `срезы` и map поддерживаются, если все подстолбцы в именованном кортеже имеют один и тот же тип.

### Nested \{#nested\}

Поле Nested эквивалентно типу Array из именованных кортежей. Использование зависит от того, установлено ли для [flatten&#95;nested](/operations/settings/settings#flatten_nested) значение 1 или 0.

Если задать для flatten&#95;nested значение 0, столбцы Nested остаются единым массивом кортежей. Это позволяет использовать срезы map для вставки и чтения, а также произвольные уровни вложенности. Ключ в map должен совпадать с именем столбца, как показано в примере ниже.

Примечание: поскольку map представляют кортежи, они должны иметь тип `map[string]interface{}`. В настоящее время значения не имеют строгой типизации.

```go
conn, err := GetNativeConnection(clickhouse.Settings{
    "flatten_nested": 0,
}, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []map[string]interface{}{
            {
                "Col1_1": strconv.Itoa(int(i)),
                "Col1_2": uint8(i),
            },
            {
                "Col1_1": strconv.Itoa(int(i + 1)),
                "Col1_2": uint8(i + 1),
            },
            {
                "Col1_1": strconv.Itoa(int(i + 2)),
                "Col1_2": uint8(i + 2),
            },
        },
        []map[string]interface{}{
            {
                "Col2_2": []map[string]interface{}{
                    {
                        "Col2_2_1": uint8(i),
                        "Col2_2_2": uint8(i + 1),
                    },
                },
                "Col2_1": uint8(i),
            },
            {
                "Col2_2": []map[string]interface{}{
                    {
                        "Col2_2_1": uint8(i + 2),
                        "Col2_2_2": uint8(i + 3),
                    },
                },
                "Col2_1": uint8(i + 1),
            },
        },
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []map[string]interface{}
    col2 []map[string]interface{}
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

rows.Close()
```

[Полный пример — `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

Если для `flatten_nested` используется значение по умолчанию 1, вложенные столбцы разворачиваются в отдельные массивы. В этом случае при вставке и чтении необходимо использовать вложенные срезы. Хотя произвольные уровни вложенности могут работать, официально это не поддерживается.

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i uint8
for i = 0; i < 10; i++ {
    col1_1_data := []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2))}
    col1_2_data := []uint8{i, i + 1, i + 2}
    col2_1_data := []uint8{i, i + 1, i + 2}
    col2_2_data := [][][]interface{}{
        {
            {i, i + 1},
        },
        {
            {i + 2, i + 3},
        },
        {
            {i + 4, i + 5},
        },
    }
    err := batch.Append(
        col1_1_data,
        col1_2_data,
        col2_1_data,
        col2_2_data,
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[Полный пример — `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

Примечание: вложенные столбцы должны иметь одинаковую размерность. Например, в примере выше `Col_2_2` и `Col_2_1` должны содержать одинаковое количество элементов.

Благодаря более простому интерфейсу и официальной поддержке вложенности рекомендуем использовать `flatten_nested=0`.

### Географические типы \{#geo-types\}

Клиент поддерживает географические типы Point, Ring, LineString, Polygon, MultiPolygon и MultiLineString. В Go эти типы представлены с помощью пакета [github.com/paulmach/orb](https://github.com/paulmach/orb).

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            point Point,
            ring Ring,
            lineString LineString,
            polygon Polygon,
            mPolygon MultiPolygon,
            mLineString MultiLineString
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    orb.Point{11, 22},
    orb.Ring{
        orb.Point{1, 2},
        orb.Point{1, 2},
    },
    orb.LineString{
        orb.Point{1, 2},
        orb.Point{3, 4},
        orb.Point{5, 6},
    },
    orb.Polygon{
        orb.Ring{
            orb.Point{1, 2},
            orb.Point{12, 2},
        },
        orb.Ring{
            orb.Point{11, 2},
            orb.Point{1, 12},
        },
    },
    orb.MultiPolygon{
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
    },
    orb.MultiLineString{
        orb.LineString{
            orb.Point{1, 2},
            orb.Point{3, 4},
        },
        orb.LineString{
            orb.Point{5, 6},
            orb.Point{7, 8},
        },
    },
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    point       orb.Point
    ring        orb.Ring
    lineString  orb.LineString
    polygon     orb.Polygon
    mPolygon    orb.MultiPolygon
    mLineString orb.MultiLineString
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&point, &ring, &lineString, &polygon, &mPolygon, &mLineString); err != nil {
    return err
}
fmt.Printf("point=%v, ring=%v, lineString=%v, polygon=%v, mPolygon=%v, mLineString=%v\n", point, ring, lineString, polygon, mPolygon, mLineString)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

### UUID \{#uuid\}

Тип UUID поддерживается пакетом [github.com/google/uuid](https://github.com/google/uuid). UUID также можно передавать и сериализовать как строку или любой тип, реализующий `sql.Scanner` или `Stringify`.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 UUID,
            col2 UUID
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := uuid.NewUUID()
if err = batch.Append(
    col1Data,
    "603966d6-ed93-11ec-8ea0-0242ac120002",
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 uuid.UUID
    col2 uuid.UUID
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

### Decimal \{#decimal\}

Поскольку в Go нет встроенного типа Decimal, мы рекомендуем использовать сторонний пакет [github.com/shopspring/decimal](https://github.com/shopspring/decimal), чтобы работать с типами Decimal как с собственными, не изменяя исходные запросы.

:::note
У вас может возникнуть соблазн использовать вместо этого Float, чтобы избежать зависимостей от сторонних пакетов. Однако имейте в виду, что [типы Float в ClickHouse не рекомендуется использовать, когда требуются точные значения](https://clickhouse.com/docs/sql-reference/data-types/float).

Если вы всё же решите использовать на стороне клиента встроенный тип Float из Go, необходимо явно преобразовать Decimal в Float с помощью [функции toFloat64()](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) или [её вариантов](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero) в запросах ClickHouse. Имейте в виду, что такое преобразование может привести к потере точности.
:::

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Decimal32(3),
        Col2 Decimal(18,6),
        Col3 Decimal(15,7),
        Col4 Decimal128(8),
        Col5 Decimal256(9)
    ) Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    decimal.New(25, 4),
    decimal.New(30, 5),
    decimal.New(35, 6),
    decimal.New(135, 7),
    decimal.New(256, 8),
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 decimal.Decimal
    col2 decimal.Decimal
    col3 decimal.Decimal
    col4 decimal.Decimal
    col5 decimal.Decimal
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

### Nullable \{#nullable\}

Значение Nil в Go соответствует NULL в ClickHouse. Его можно использовать, если поле объявлено как Nullable. При вставке Nil можно передавать как для обычной версии столбца, так и для версии Nullable. В первом случае будет сохранено значение типа по умолчанию, например пустая строка для string. Для версии Nullable в ClickHouse будет сохранено значение NULL.

При сканировании пользователь должен передать указатель на тип, который поддерживает nil, например *string, чтобы представить значение nil для поля Nullable. В примере ниже col1, имеющий тип Nullable(String), получает значение типа **string. Это позволяет представить nil.

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 Nullable(String),
            col2 String,
            col3 Nullable(Int8),
            col4 Nullable(Int64)
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    nil,
    nil,
    nil,
    sql.NullInt64{Int64: 0, Valid: false},
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 *string
    col2 string
    col3 *int8
    col4 sql.NullInt64
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

Клиент также поддерживает типы `sql.Null*`, например `sql.NullInt64`. Они совместимы с соответствующими им типами ClickHouse.

### Большие целые числа \{#big-ints\}

Числовые типы размером более 64 бит представляются с помощью собственного пакета Go [big](https://pkg.go.dev/math/big).

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Int128,
        Col2 UInt128,
        Col3 Array(Int128),
        Col4 Int256,
        Col5 Array(Int256),
        Col6 UInt256,
        Col7 Array(UInt256)
    ) Engine Memory`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := new(big.Int).SetString("170141183460469231731687303715884105727", 10)
col2Data := big.NewInt(128)
col3Data := []*big.Int{
    big.NewInt(-128),
    big.NewInt(128128),
    big.NewInt(128128128),
}
col4Data := big.NewInt(256)
col5Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}
col6Data := big.NewInt(256)
col7Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}

if err = batch.Append(col1Data, col2Data, col3Data, col4Data, col5Data, col6Data, col7Data); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 big.Int
    col2 big.Int
    col3 []*big.Int
    col4 big.Int
    col5 []*big.Int
    col6 big.Int
    col7 []*big.Int
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### BFloat16 \{#bfloat16\}

`BFloat16` — это 16-битный формат чисел с плавающей запятой, используемый в рабочих нагрузках машинного обучения. В Go значения `BFloat16` вставляются и считываются как `float32`. Для вариантов Nullable используется `sql.NullFloat64`.

```go
if err := conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 BFloat16,
        Col2 Nullable(BFloat16)
    ) Engine MergeTree() ORDER BY tuple()
`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
batch.Append(float32(33.125), sql.NullFloat64{Float64: 34.25, Valid: true})
if err := batch.Send(); err != nil {
    return err
}

var col1 float32
var col2 sql.NullFloat64
if err := conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
fmt.Printf("Col1: %v, Col2: %v\n", col1, col2)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bfloat16.go)

### QBit \{#qbit\}

`QBit` — экспериментальный тип столбца для хранения векторных эмбеддингов в битово-срезанном формате, оптимизированный для поиска по сходству векторов. Для его использования необходимо включить параметр `allow_experimental_qbit_type`.

В Go столбец `QBit(Float32, N)` вставляется и считывается как `[]float32`, где N — размерность вектора.

```go
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_qbit_type": 1,
}))

if err := conn.Exec(ctx, `
    CREATE TABLE example (
        id   UInt32,
        embedding QBit(Float32, 128)
    ) Engine MergeTree() ORDER BY id
`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}

vector := make([]float32, 128)
// populate vector values...
if err := batch.Append(uint32(1), vector); err != nil {
    return err
}
if err := batch.Send(); err != nil {
    return err
}

rows, err := conn.Query(ctx, "SELECT id, embedding FROM example")
if err != nil {
    return err
}
defer rows.Close()
for rows.Next() {
    var id uint32
    var embedding []float32
    rows.Scan(&id, &embedding)
    fmt.Printf("ID: %d, Vector dim: %d\n", id, len(embedding))
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/qbit.go)
