---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'Go-клиенты для ClickHouse позволяют вам подключаться к ClickHouse посредством стандартного интерфейса Go database/sql или оптимизированного нативного интерфейса.'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go \{#clickhouse-go\}

## Быстрый старт \{#quick-start\}

Рассмотрим простой пример на Go. Он подключится к ClickHouse и выполнит запрос `SELECT` к системной базе данных. Для начала вам понадобятся параметры подключения.

### Параметры подключения \{#connection-details\}

<ConnectionDetails />

### Инициализация модуля \{#initialize-a-module\}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### Скопируйте пример кода \{#copy-in-some-sample-code\}

Скопируйте этот код в каталог `clickhouse-golang-example` под именем `main.go`.

```go title=main.go
package main

import (
    "context"
    "crypto/tls"
    "fmt"
    "log"

    "github.com/ClickHouse/clickhouse-go/v2"
    "github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func main() {
    conn, err := connect()
    if err != nil {
        panic(err)
    }

    ctx := context.Background()
    rows, err := conn.Query(ctx, "SELECT name, toString(uuid) as uuid_str FROM system.tables LIMIT 5")
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    for rows.Next() {
        var name, uuid string
        if err := rows.Scan(&name, &uuid); err != nil {
            log.Fatal(err)
        }
        log.Printf("name: %s, uuid: %s", name, uuid)
    }

    // NOTE: Do not skip rows.Err() check
    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }

}

func connect() (driver.Conn, error) {
    var (
        ctx       = context.Background()
        conn, err = clickhouse.Open(&clickhouse.Options{
            Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
            Auth: clickhouse.Auth{
                Database: "default",
                Username: "default",
                Password: "<DEFAULT_USER_PASSWORD>",
            },
            ClientInfo: clickhouse.ClientInfo{
                Products: []struct {
                    Name    string
                    Version string
                }{
                    {Name: "an-example-go-client", Version: "0.1"},
                },
            },
            Debugf: func(format string, v ...interface{}) {
                fmt.Printf(format, v)
            },
            TLS: &tls.Config{
                InsecureSkipVerify: true,
            },
        })
    )

    if err != nil {
        return nil, err
    }

    if err := conn.Ping(ctx); err != nil {
        if exception, ok := err.(*clickhouse.Exception); ok {
            fmt.Printf("Exception [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
        }
        return nil, err
    }
    return conn, nil
}
```


### Выполните go mod tidy \{#run-go-mod-tidy\}

```bash
go mod tidy
```

### Укажите параметры подключения \{#set-your-connection-details\}

Ранее вы уже получили свои параметры подключения. Укажите их в `main.go` в функции `connect()`:

```go
func connect() (driver.Conn, error) {
  var (
    ctx       = context.Background()
    conn, err = clickhouse.Open(&clickhouse.Options{
    #highlight-next-line
      Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
      Auth: clickhouse.Auth{
    #highlight-start
        Database: "default",
        Username: "default",
        Password: "<DEFAULT_USER_PASSWORD>",
    #highlight-end
      },
```

### Запуск примера \{#run-the-example\}

```bash
go run .
```

```response
2023/03/06 14:18:33 name: COLUMNS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: SCHEMATA, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: TABLES, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: VIEWS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: hourly_data, uuid: a4e36bd4-1e82-45b3-be77-74a0fe65c52b
```

### Подробнее \{#learn-more\}

Остальная документация в этой категории описывает подробности работы клиента Go для ClickHouse.

## Обзор \{#overview\}

ClickHouse поддерживает два официальных Go-клиента. Эти клиенты взаимодополняют друг друга и намеренно ориентированы на разные сценарии использования.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) — высокоуровневая клиентская библиотека для Go, которая поддерживает либо стандартный интерфейс Go `database/sql`, либо собственный API ClickHouse.
* [ch-go](https://github.com/ClickHouse/ch-go) — низкоуровневый клиент. Только собственный интерфейс.

clickhouse-go предоставляет высокоуровневый интерфейс, позволяющий пользователям выполнять запросы и вставку данных, используя строко-ориентированную семантику и пакетную обработку, которая менее строга к типам данных — значения будут преобразованы при условии, что потенциальной потери точности не произойдет. ch-go, в свою очередь, предоставляет оптимизированный столбцово-ориентированный интерфейс, обеспечивающий быструю потоковую передачу блоков данных с низкой нагрузкой на CPU и память, но ценой строгих требований к типам и более сложного использования.

Начиная с версии 2.3, clickhouse-go использует ch-go для низкоуровневых функций, таких как кодирование, декодирование и сжатие. Оба клиента используют собственный формат для кодирования данных, чтобы обеспечить оптимальную производительность, и могут обмениваться данными по собственному протоколу ClickHouse. clickhouse-go также поддерживает HTTP в качестве транспортного протокола для случаев, когда пользователям необходимо проксировать трафик или выполнять балансировку нагрузки.

### Четыре способа подключения \{#four-ways-to-connect\}

clickhouse-go предлагает два независимых варианта: **какой API** использовать и **какой транспорт** использовать. В сочетании они дают четыре режима подключения:

|                                                | **TCP** (собственный протокол, порт 9000/9440) |        **HTTP** (порт 8123/8443)       |
| :--------------------------------------------- | :--------------------------------------------: | :------------------------------------: |
| **ClickHouse API** (`clickhouse.Open`)         | По умолчанию — максимальная производительность | Установите `Protocol: clickhouse.HTTP` |
| **`database/sql` API** (`OpenDB` / `sql.Open`) |            `clickhouse://host:9000`            |           `http://host:8123`           |

**Выбор API:** Используйте ClickHouse API для максимальной производительности и полного набора возможностей (обратные вызовы прогресса, столбцовые вставки, расширенная поддержка типов). Выбирайте `database/sql`, если нужна интеграция с ORM или инструментами, которым требуется стандартный интерфейс базы данных Go.

**Выбор транспорта:** TCP работает быстрее и используется по умолчанию. Переключайтесь на HTTP, если этого требует ваша инфраструктура — например, при подключении через HTTP-балансировщик нагрузки или прокси, а также если вам нужны специфичные для HTTP возможности, такие как сессии с временными таблицами или дополнительные алгоритмы сжатия (`gzip`, `deflate`, `br`).

Оба API используют собственное двоичное кодирование независимо от транспорта, поэтому HTTP не добавляет накладных расходов на сериализацию.

|                    | Собственный формат | TCP-транспорт | HTTP-транспорт | Пакетная запись | Маршалинг структур | Сжатие | Обратные вызовы прогресса |
| :----------------: | :----------------: | :-----------: | :------------: | :-------------: | :----------------: | :----: | :-----------------------: |
|   ClickHouse API   |          ✅         |       ✅       |        ✅       |        ✅        |          ✅         |    ✅   |             ✅             |
| `database/sql` API |          ✅         |       ✅       |        ✅       |        ✅        |                    |    ✅   |                           |

### Выбор клиента \{#choosing-a-client\}

Выбор клиентской библиотеки зависит от характера использования и требований к производительности. Для сценариев с интенсивной вставкой, когда требуется выполнять миллионы вставок в секунду, мы рекомендуем использовать низкоуровневый клиент [ch-go](https://github.com/ClickHouse/ch-go). Этот клиент позволяет избежать накладных расходов, связанных с преобразованием данных из строко-ориентированного формата в колоночный, как того требует собственный формат ClickHouse. Кроме того, он не использует механизмы рефлексии и тип `interface{}` (`any`), что упрощает использование.

Для нагрузок, ориентированных на агрегирующие запросы, или для сценариев с меньшей интенсивностью вставок [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) предоставляет привычный интерфейс `database/sql` и более простую построчную семантику. Вы также можете при желании использовать HTTP в качестве транспортного протокола и воспользоваться вспомогательными функциями для маршаллинга строк в структуры и обратно.

|               | Собственный формат | Собственный протокол | HTTP-протокол | API со строко-ориентированностью | API со столбцово-ориентированностью | Гибкость типов | Сжатие | Плейсхолдеры запросов |
| :-----------: | :-------------: | :---------------: | :-----------: | :--------------------------: | :--------------------------: | :------------: | :----: | :-------------------: |
| clickhouse-go |        ✅        |         ✅         |       ✅       |               ✅              |               ✅              |        ✅       |    ✅   |           ✅           |
|     ch-go     |        ✅        |         ✅         |               |                              |               ✅              |                |    ✅   |                       |

## Установка \{#installation\}

Версия драйвера v1 объявлена устаревшей и больше не будет получать обновления функциональности или поддержку новых типов ClickHouse. Пользователям следует перейти на v2, который обеспечивает более высокую производительность.

Чтобы установить клиент версии 2.x, добавьте пакет в файл go.mod:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Или клонируйте репозиторий:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

Чтобы установить другую версию, измените путь или имя ветки соответствующим образом.

```bash
mkdir my-clickhouse-app && cd my-clickhouse-app

cat > go.mod <<-END
  module my-clickhouse-app

  go 1.21

  require github.com/ClickHouse/clickhouse-go/v2 main
END

cat > main.go <<-END
  package main

  import (
    "fmt"
    "github.com/ClickHouse/clickhouse-go/v2"
  )

  func main() {
   conn, _ := clickhouse.Open(&clickhouse.Options{Addr: []string{"127.0.0.1:9000"}})
    v, _ := conn.ServerVersion()
    fmt.Println(v.String())
  }
END

go mod tidy
go run main.go

```


### Управление версиями \{#versioning\}

Клиент выпускается независимо от ClickHouse. Линейка 2.x представляет текущую основную мажорную версию в разработке. Все версии 2.x должны быть совместимы друг с другом.

#### Совместимость с ClickHouse \{#clickhouse-compatibility\}

Клиент поддерживает:

- Все версии ClickHouse, которые в настоящее время поддерживаются, как указано [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). По мере того как версии ClickHouse снимаются с поддержки, они также перестают участвовать в активном тестировании новых версий клиента.
- Все версии ClickHouse в течение 2 лет с даты выхода релиза клиента. Обратите внимание, что активное тестирование проводится только для LTS-версий.

#### Совместимость с Golang \{#golang-compatibility\}

|    Версия клиента    | Версии Golang |
| :------------------: | :-----------: |
|  =&gt; 2.0 &lt;= 2.2 |   1.17, 1.18  |
| &gt;= 2.3, &lt; 2.41 |     1.18+     |
|      &gt;= 2.41      |     1.21+     |
|      &gt;= 2.43      |     1.24+     |

## Лучшие практики \{#best-practices\}

* По возможности используйте ClickHouse API, особенно для примитивных типов. Это позволяет избежать значительных накладных расходов на рефлексию и дополнительные уровни косвенных обращений.
* При чтении больших наборов данных рассмотрите возможность изменения [`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings). Это увеличит потребление памяти, но позволит декодировать больше блоков параллельно при итерации по строкам. Значение по умолчанию 2 является консервативным и минимизирует накладные расходы по памяти. Более высокие значения приведут к большему количеству блоков в памяти. Это требует тестирования, поскольку разные запросы могут создавать блоки разного размера. Поэтому параметр может быть установлен на [уровне запроса](/integrations/language-clients/go/clickhouse-api#using-context) через Context.
* Будьте точны с типами при вставке данных. Хотя клиент стремится быть гибким, например, позволяя разбирать строки как UUID или IP, это требует проверки данных и увеличивает затраты на вставку.
* По возможности используйте вставки в столбцовом формате. При этом типы должны быть строго заданы, чтобы избежать необходимости конвертации значений на стороне клиента.
* Следуйте [рекомендациям](/sql-reference/statements/insert-into/#performance-considerations) ClickHouse для оптимальной производительности вставки.

## Следующие шаги \{#next-steps\}

* [Настройка](/integrations/language-clients/go/configuration) — параметры подключения, TLS, аутентификация, логирование, сжатие
* [ClickHouse API](/integrations/language-clients/go/clickhouse-api) — собственный API Go для запросов и вставки данных
* [Database/SQL API](/integrations/language-clients/go/database-sql-api) — стандартный интерфейс `database/sql`
* [Типы данных](/integrations/language-clients/go/data-types) — соответствие типов Go и поддержка сложных типов