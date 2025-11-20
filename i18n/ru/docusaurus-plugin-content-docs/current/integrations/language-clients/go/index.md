---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'Клиенты Go для ClickHouse позволяют подключаться к ClickHouse с использованием либо стандартного интерфейса Go database/sql, либо оптимизированного собственным интерфейсом.'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';


# ClickHouse Go



## Простой пример {#a-simple-example}

Начнём с простого примера. Он подключится к ClickHouse и выполнит запрос к системной базе данных. Для начала вам понадобятся параметры подключения.

### Параметры подключения {#connection-details}

<ConnectionDetails />

### Инициализация модуля {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### Копирование примера кода {#copy-in-some-sample-code}

Скопируйте этот код в директорию `clickhouse-golang-example` как `main.go`.

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

        for rows.Next() {
                var name, uuid string
                if err := rows.Scan(&name, &uuid); err != nil {
                        log.Fatal(err)
                }
                log.Printf("name: %s, uuid: %s", name, uuid)
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

### Выполнение go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```

### Установка параметров подключения {#set-your-connection-details}

Ранее вы получили параметры подключения. Укажите их в `main.go` в функции `connect()`:

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

### Запуск примера {#run-the-example}

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

### Дополнительная информация {#learn-more}

Остальная документация в этом разделе подробно описывает работу с клиентом ClickHouse для Go.


## Go-клиент ClickHouse {#clickhouse-go-client}

ClickHouse поддерживает два официальных Go-клиента. Эти клиенты дополняют друг друга и предназначены для разных сценариев использования.

- [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) — высокоуровневый клиент, поддерживающий как стандартный интерфейс Go database/sql, так и нативный интерфейс.
- [ch-go](https://github.com/ClickHouse/ch-go) — низкоуровневый клиент. Только нативный интерфейс.

clickhouse-go предоставляет высокоуровневый интерфейс, позволяющий пользователям выполнять запросы и вставлять данные с использованием строко-ориентированной семантики и пакетной обработки с гибким подходом к типам данных — значения будут преобразованы при условии отсутствия потенциальной потери точности. ch-go, в свою очередь, предоставляет оптимизированный колоночно-ориентированный интерфейс, обеспечивающий быструю потоковую передачу блоков данных с низкими затратами процессора и памяти за счёт строгой типизации и более сложного использования.

Начиная с версии 2.3, clickhouse-go использует ch-go для низкоуровневых функций, таких как кодирование, декодирование и сжатие. Обратите внимание, что clickhouse-go также поддерживает стандартный интерфейс Go `database/sql`. Оба клиента используют нативный формат для кодирования, чтобы обеспечить оптимальную производительность, и могут взаимодействовать через нативный протокол ClickHouse. clickhouse-go также поддерживает HTTP в качестве транспортного механизма для случаев, когда пользователям необходимо проксировать трафик или балансировать нагрузку.

При выборе клиентской библиотеки пользователи должны учитывать их соответствующие преимущества и недостатки — см. раздел «Выбор клиентской библиотеки».

|               | Нативный формат | Нативный протокол | HTTP-протокол | Строко-ориентированный API | Колоночно-ориентированный API | Гибкость типов | Сжатие | Заполнители запросов |
| :-----------: | :-------------: | :---------------: | :-----------: | :------------------------: | :---------------------------: | :------------: | :----: | :------------------: |
| clickhouse-go |       ✅        |        ✅         |      ✅       |             ✅             |              ✅               |       ✅       |   ✅   |          ✅          |
|     ch-go     |       ✅        |        ✅         |               |                            |              ✅               |                |   ✅   |                      |


## Выбор клиента {#choosing-a-client}

Выбор клиентской библиотеки зависит от ваших сценариев использования и требований к оптимальной производительности. Для сценариев с интенсивной вставкой данных, когда требуются миллионы вставок в секунду, мы рекомендуем использовать низкоуровневый клиент [ch-go](https://github.com/ClickHouse/ch-go). Этот клиент позволяет избежать накладных расходов, связанных с преобразованием данных из строчно-ориентированного формата в колоночный, которого требует нативный формат ClickHouse. Кроме того, он не использует рефлексию и тип `interface{}` (`any`), что упрощает работу.

Для рабочих нагрузок с запросами, ориентированными на агрегацию, или для вставок с меньшей пропускной способностью клиент [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) предоставляет привычный интерфейс `database/sql` и более простую семантику работы со строками. Пользователи также могут использовать HTTP в качестве транспортного протокола и воспользоваться вспомогательными функциями для маршалинга строк в структуры и обратно.


## Клиент clickhouse-go {#the-clickhouse-go-client}

Клиент clickhouse-go предоставляет два API-интерфейса для взаимодействия с ClickHouse:

- специализированный API клиента ClickHouse
- стандарт `database/sql` — универсальный интерфейс для работы с SQL-базами данных, предоставляемый Golang.

Хотя `database/sql` предоставляет универсальный интерфейс, позволяющий разработчикам абстрагироваться от конкретного хранилища данных, он накладывает определённые ограничения на типизацию и семантику запросов, что влияет на производительность. По этой причине специализированный API клиента следует использовать там, где [производительность критична](https://github.com/clickHouse/clickHouse-go#benchmark). Однако пользователи, желающие интегрировать ClickHouse в инструменты с поддержкой нескольких баз данных, могут предпочесть стандартный интерфейс.

Оба интерфейса кодируют данные с использованием [нативного формата](/native-protocol/basics.md) и нативного протокола для обмена данными. Кроме того, стандартный интерфейс поддерживает взаимодействие по протоколу HTTP.

|                    | Нативный формат | Нативный протокол | HTTP-протокол | Поддержка массовой записи | Маршалинг структур | Сжатие | Заполнители запросов |
| :----------------: | :-------------: | :---------------: | :-----------: | :-----------------------: | :----------------: | :----: | :------------------: |
|   API ClickHouse   |       ✅        |        ✅         |               |            ✅             |         ✅         |   ✅   |          ✅          |
| API `database/sql` |       ✅        |        ✅         |      ✅       |            ✅             |                    |   ✅   |          ✅          |


## Установка {#installation}

Версия v1 драйвера устарела и больше не будет получать обновления функциональности или поддержку новых типов ClickHouse. Пользователям рекомендуется перейти на v2, которая обеспечивает более высокую производительность.

Чтобы установить версию 2.x клиента, добавьте пакет в файл go.mod:

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

  go 1.18

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

### Версионирование и совместимость {#versioning--compatibility}

Клиент выпускается независимо от ClickHouse. Версия 2.x представляет текущую мажорную версию в разработке. Все версии 2.x совместимы между собой.

#### Совместимость с ClickHouse {#clickhouse-compatibility}

Клиент поддерживает:

- Все актуальные поддерживаемые версии ClickHouse, перечисленные [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). Версии ClickHouse, которые больше не поддерживаются, также больше не тестируются активно с релизами клиента.
- Все версии ClickHouse за последние 2 года от даты выпуска клиента. Обратите внимание, что активно тестируются только LTS-версии.

#### Совместимость с Golang {#golang-compatibility}

|  Версия клиента  | Версии Golang |
| :--------------: | :-------------: |
| => 2.0 &lt;= 2.2 |   1.17, 1.18    |
|      >= 2.3      |      1.18       |


## API клиента ClickHouse {#clickhouse-client-api}

Все примеры кода для API клиента ClickHouse можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).

### Подключение {#connecting}

Следующий пример, возвращающий версию сервера, демонстрирует подключение к ClickHouse — при условии, что ClickHouse не защищен и доступен с пользователем по умолчанию.

Обратите внимание, что для подключения используется нативный порт по умолчанию.

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

**Во всех последующих примерах, если явно не указано иное, предполагается, что переменная `conn` ClickHouse создана и доступна.**

#### Настройки подключения {#connection-settings}

При открытии подключения можно использовать структуру Options для управления поведением клиента. Доступны следующие настройки:

- `Protocol` — Native или HTTP. В настоящее время HTTP поддерживается только для [API database/sql](#databasesql-api).
- `TLS` — параметры TLS. Ненулевое значение включает TLS. См. [Использование TLS](#using-tls).
- `Addr` — массив адресов, включая порт.
- `Auth` — данные аутентификации. См. [Аутентификация](#authentication).
- `DialContext` — пользовательская функция установки соединения для определения способа установки подключений.
- `Debug` — true/false для включения отладки.
- `Debugf` — предоставляет функцию для обработки отладочного вывода. Требует установки `debug` в true.
- `Settings` — карта настроек ClickHouse. Они будут применены ко всем запросам ClickHouse. [Использование Context](#using-context) позволяет устанавливать настройки для каждого запроса отдельно.
- `Compression` — включение сжатия для блоков. См. [Сжатие](#compression).
- `DialTimeout` — максимальное время для установки соединения. По умолчанию `1s`.
- `MaxOpenConns` — максимальное количество одновременно используемых соединений. В пуле простоя может быть больше или меньше соединений, но одновременно можно использовать только это количество. По умолчанию `MaxIdleConns+5`.
- `MaxIdleConns` — количество соединений, поддерживаемых в пуле. Соединения будут повторно использоваться, если это возможно. По умолчанию `5`.
- `ConnMaxLifetime` — максимальное время жизни соединения. По умолчанию 1 час. Соединения уничтожаются по истечении этого времени, при необходимости в пул добавляются новые соединения.
- `ConnOpenStrategy` — определяет, как список адресов узлов должен использоваться для открытия соединений. См. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
- `BlockBufferSize` — максимальное количество блоков для одновременной декодировки в буфер. Большие значения увеличат параллелизацию за счет памяти. Размеры блоков зависят от запроса, поэтому, хотя вы можете установить это значение для соединения, мы рекомендуем переопределять его для каждого запроса на основе возвращаемых данных. По умолчанию `2`.

```go
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
    Debug: true,
    Debugf: func(format string, v ...interface{}) {
        fmt.Printf(format, v)
    },
    Settings: clickhouse.Settings{
        "max_execution_time": 60,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionLZ4,
    },
    DialTimeout:      time.Duration(10) * time.Second,
    MaxOpenConns:     5,
    MaxIdleConns:     5,
    ConnMaxLifetime:  time.Duration(10) * time.Minute,
    ConnOpenStrategy: clickhouse.ConnOpenInOrder,
    BlockBufferSize: 10,
})
if err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)

#### Пулинг соединений {#connection-pooling}


Клиент поддерживает пул подключений и при необходимости повторно использует их между запросами. В любой момент времени будет активно не более `MaxOpenConns` подключений, при этом максимальный размер пула контролируется параметром `MaxIdleConns`. Для каждого выполнения запроса клиент получает подключение из пула и затем возвращает его обратно для повторного использования. Подключение используется на протяжении всего времени жизни батча и освобождается при вызове `Send()`.

Нет гарантии, что для последующих запросов будет использоваться одно и то же подключение из пула, если только пользователь не установит `MaxOpenConns=1`. В большинстве случаев это не требуется, но может понадобиться при работе с временными таблицами.

Также обратите внимание, что по умолчанию значение `ConnMaxLifetime` составляет 1 час. Это может приводить к несбалансированной нагрузке на ClickHouse, если узлы покидают кластер. Когда узел становится недоступным, подключения перераспределяются на другие узлы. Эти подключения будут сохраняться и не будут обновляться в течение 1 часа по умолчанию, даже если проблемный узел вернётся в кластер. Рассмотрите возможность уменьшения этого значения при высокой нагрузке.

### Использование TLS {#using-tls}

На низком уровне все методы подключения клиента (`DSN/OpenDB/Open`) используют [пакет tls в Go](https://pkg.go.dev/crypto/tls) для установления защищённого соединения. Клиент понимает, что нужно использовать TLS, если структура Options содержит ненулевой указатель `tls.Config`.

```go
env, err := GetNativeTestEnvironment()
if err != nil {
    return err
}
cwd, err := os.Getwd()
if err != nil {
    return err
}
t := &tls.Config{}
caCert, err := ioutil.ReadFile(path.Join(cwd, "../../tests/resources/CAroot.crt"))
if err != nil {
    return err
}
caCertPool := x509.NewCertPool()
successful := caCertPool.AppendCertsFromPEM(caCert)
if !successful {
    return err
}
t.RootCAs = caCertPool
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: t,
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

Такого минимального `TLS.Config` обычно достаточно для подключения к защищённому нативному порту (как правило, 9440) сервера ClickHouse. Если у сервера ClickHouse нет действительного сертификата (он истёк, указано неверное имя хоста или сертификат не подписан общепризнанным корневым центром сертификации), можно установить `InsecureSkipVerify` в значение true, но это настоятельно не рекомендуется.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: &tls.Config{
        InsecureSkipVerify: true,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

Если требуются дополнительные параметры TLS, код приложения должен установить нужные поля в структуре `tls.Config`. Это может включать выбор конкретных наборов шифров, принудительное использование определённой версии TLS (например, 1.2 или 1.3), добавление внутренней цепочки сертификатов CA, добавление клиентского сертификата (и закрытого ключа), если этого требует сервер ClickHouse, а также большинство других опций, характерных для более специализированной настройки безопасности.

### Аутентификация {#authentication}

Укажите структуру Auth в параметрах подключения, чтобы задать имя пользователя и пароль.

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
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

### Подключение к нескольким узлам {#connecting-to-multiple-nodes}

Через структуру `Addr` можно указать несколько адресов.


```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
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
if err != nil {
    return err
}
fmt.Println(v.String())
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

Доступны две стратегии подключения:

- `ConnOpenInOrder` (по умолчанию) — адреса используются по порядку. Последующие адреса используются только в случае неудачного подключения к адресам, указанным ранее в списке. Это фактически стратегия отказоустойчивости (failover).
- `ConnOpenRoundRobin` — нагрузка распределяется между адресами по алгоритму round-robin.

Управление стратегией осуществляется через параметр `ConnOpenStrategy`

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:             []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
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
if err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)

### Выполнение запросов {#execution}

Произвольные операторы можно выполнять с помощью метода `Exec`. Это удобно для DDL и простых операторов. Не следует использовать этот метод для больших вставок или итераций по результатам запросов.

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

Обратите внимание на возможность передачи Context в запрос. Это можно использовать для передачи настроек на уровне запроса — см. [Использование Context](#using-context).

### Пакетная вставка {#batch-insert}

Для вставки большого количества строк клиент предоставляет семантику пакетной обработки. Это требует подготовки пакета, к которому можно добавлять строки. В конечном итоге пакет отправляется с помощью метода `Send()`. Пакеты хранятся в памяти до выполнения `Send`.

Рекомендуется вызывать `Close` для пакета, чтобы предотвратить утечку соединений. Это можно сделать с помощью ключевого слова `defer` после подготовки пакета. Это очистит соединение, если `Send` так и не будет вызван. Обратите внимание, что если строки не были добавлены, в журнале запросов появится запись о вставке 0 строк.

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

```


for i := 0; i < 1000; i++ {
err := batch.Append(
uint8(42),
"ClickHouse",
"Inc",
uuid.New(),
map[string]uint8{"key": 1}, // Map(String, UInt8)
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

````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

Рекомендации для ClickHouse применимы [здесь](/guides/inserting-data#best-practices-for-inserts). Пакеты не следует использовать совместно между go-рутинами — создавайте отдельный пакет для каждой рутины.

Из приведенного выше примера обратите внимание на необходимость соответствия типов переменных типам столбцов при добавлении строк. Хотя сопоставление обычно очевидно, этот интерфейс обеспечивает гибкость, и типы будут преобразованы при условии отсутствия потери точности. Например, следующий код демонстрирует вставку строки в тип datetime64.

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
````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

Полный список поддерживаемых типов Go для каждого типа столбца см. в разделе [Преобразование типов](#type-conversions).

### Запрос строк {#querying-rows}

Пользователи могут либо запросить одну строку с помощью метода `QueryRow`, либо получить курсор для итерации по набору результатов через `Query`. Первый метод принимает место назначения для сериализации данных, второй требует вызова `Scan` для каждой строки.

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

Обратите внимание, что в обоих случаях необходимо передавать указатель на переменные, в которые требуется сериализовать соответствующие значения столбцов. Они должны передаваться в порядке, указанном в операторе `SELECT` — по умолчанию при использовании `SELECT *` используется порядок объявления столбцов, как показано выше.


Аналогично вставке, метод Scan требует, чтобы целевые переменные имели подходящий тип. При этом также сохраняется гибкость: типы будут преобразованы там, где это возможно, при условии отсутствия потерь точности. Например, в приведённом выше примере столбец с типом UUID считывается в строковую переменную. Полный список поддерживаемых типов Go для каждого типа Column см. в разделе [Преобразование типов](#type-conversions).

Наконец, обратите внимание на возможность передавать `Context` в методы `Query` и `QueryRow`. Его можно использовать для настроек на уровне запроса — подробнее см. в разделе [Использование Context](#using-context).

### Асинхронная вставка {#async-insert}

Асинхронные вставки поддерживаются с помощью метода Async. Он позволяет указать, должен ли клиент ожидать завершения вставки на сервере или может вернуть ответ сразу после получения данных. Фактически это управляет параметром [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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

### Вставка в колонном формате {#columnar-insert}

Данные можно вставлять в колонном формате. Это может дать преимущество по производительности, если данные уже имеют такую структуру, так как отпадает необходимость преобразовывать их в формат строк.

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

### Использование структур {#using-structs}

Для пользователей структуры Go представляют логическое описание строки данных в ClickHouse. Для работы с ними нативный интерфейс предлагает несколько удобных функций.

#### Select с сериализацией {#select-with-serialize}

Метод Select позволяет одним вызовом преобразовать набор строк результата в срез структур.

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

#### Сканирование в структуру {#scan-struct}


`ScanStruct` позволяет преобразовать одну строку из результата запроса в структуру.

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

#### Добавление структуры {#append-struct}

`AppendStruct` позволяет добавить структуру к существующему [пакету](#batch-insert) и интерпретировать её как полную строку. Для этого требуется, чтобы столбцы структуры совпадали по имени и типу со столбцами таблицы. Хотя все столбцы должны иметь соответствующее поле в структуре, некоторые поля структуры могут не иметь соответствующего столбца. Такие поля будут просто проигнорированы.

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

### Преобразование типов {#type-conversions}

Клиент стремится быть максимально гибким в отношении принятия различных типов переменных как для вставки данных, так и для преобразования ответов. В большинстве случаев для типа столбца ClickHouse существует эквивалентный тип Go, например, [UInt64](/sql-reference/data-types/int-uint/) соответствует [uint64](https://pkg.go.dev/builtin#uint64). Эти логические соответствия всегда должны поддерживаться. Пользователи могут использовать типы переменных, которые можно вставить в столбцы или использовать для получения ответа, если сначала происходит преобразование переменной или полученных данных. Клиент стремится поддерживать эти преобразования прозрачно, чтобы пользователям не требовалось преобразовывать свои данные для точного соответствия перед вставкой, а также обеспечивать гибкое преобразование во время выполнения запроса. Это прозрачное преобразование не допускает потери точности. Например, uint32 нельзя использовать для получения данных из столбца UInt64. И наоборот, строку можно вставить в поле datetime64, если она соответствует требованиям формата.

Преобразования типов, поддерживаемые в настоящее время для примитивных типов, описаны [здесь](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

Эта работа продолжается и может быть разделена на вставку (`Append`/`AppendRow`) и чтение (через `Scan`). Если вам требуется поддержка конкретного преобразования, пожалуйста, создайте issue.

### Сложные типы {#complex-types}

#### Типы Date/DateTime {#datedatetime-types}

Go-клиент ClickHouse поддерживает типы даты и времени `Date`, `Date32`, `DateTime` и `DateTime64`. Даты можно вставлять в виде строки в формате `2006-01-02` или используя встроенный тип Go `time.Time{}` или `sql.NullTime`. Типы DateTime также поддерживают эти типы, но требуют передачи строк в формате `2006-01-02 15:04:05` с необязательным смещением часового пояса, например `2006-01-02 15:04:05 +08:00`. При чтении поддерживаются `time.Time{}` и `sql.NullTime`, а также любая реализация интерфейса `sql.Scanner`.

Обработка информации о часовом поясе зависит от типа ClickHouse и от того, вставляется или читается значение:


- **DateTime/DateTime64**
  - При **вставке** значение отправляется в ClickHouse в формате UNIX timestamp. Если часовой пояс не указан, клиент использует локальный часовой пояс. `time.Time{}` или `sql.NullTime` будут соответствующим образом преобразованы в epoch.
  - При **выборке** используется часовой пояс колонки, если он установлен, при возврате значения `time.Time`. В противном случае используется часовой пояс сервера.
- **Date/Date32**
  - При **вставке** часовой пояс даты учитывается при преобразовании даты в unix timestamp, то есть дата смещается на часовой пояс перед сохранением, поскольку типы Date не имеют локали в ClickHouse. Если часовой пояс не указан в строковом значении, используется локальный часовой пояс.
  - При **выборке** даты сканируются в экземпляры `time.Time{}` или `sql.NullTime{}` и возвращаются без информации о часовом поясе.

#### Массивы {#array}

Массивы должны вставляться как срезы (slices). Правила типизации для элементов соответствуют правилам для [примитивных типов](#type-conversions), то есть элементы будут преобразованы там, где это возможно.

При сканировании необходимо передать указатель на срез.

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
rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### Map {#map}

Map должны вставляться как карты (maps) Golang с ключами и значениями, соответствующими правилам типизации, определённым [ранее](#type-conversions).

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
rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### Кортежи {#tuples}

Кортежи представляют собой группу колонок произвольной длины. Колонки могут быть либо явно именованы, либо указывать только тип, например:

```sql
//неименованные
Col1 Tuple(String, Int64)

//именованные
Col2 Tuple(name String, id Int64, age uint8)
```

Из этих подходов именованные кортежи обеспечивают большую гибкость. В то время как неименованные кортежи должны вставляться и читаться с использованием срезов, именованные кортежи также совместимы с картами (maps).


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

// и именованные, и неименованные кортежи можно добавлять с помощью срезов. Обратите внимание, что можно использовать строго типизированные списки и отображения, если все элементы одного типа
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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

Примечание: типизированные срезы и отображения поддерживаются при условии, что все подстолбцы в именованном кортеже имеют одинаковые типы.

#### Nested {#nested}

Поле типа Nested эквивалентно массиву именованных кортежей. Особенности использования зависят от того, установил ли пользователь [flatten_nested](/operations/settings/settings#flatten_nested) в 1 или 0.

Если установить flatten_nested в 0, столбцы типа Nested остаются единым массивом кортежей. Это позволяет использовать срезы отображений для вставки и выборки, а также произвольные уровни вложенности. Ключ отображения должен совпадать с именем столбца, как показано в примере ниже.

Примечание: поскольку отображения представляют кортеж, они должны иметь тип `map[string]interface{}`. Значения на данный момент не являются строго типизированными.

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

```


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
rows, err := conn.Query(ctx, "SELECT \* FROM example")
if err != nil {
return err
}
for rows.Next() {
if err := rows.Scan(&col1, &col2); err != nil {
return err
}
fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()

````

[Полный пример - `flatten_nested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

Если используется значение по умолчанию 1 для `flatten_nested`, вложенные столбцы разворачиваются в отдельные массивы. Это требует использования вложенных срезов для вставки и извлечения данных. Хотя произвольные уровни вложенности могут работать, официально это не поддерживается.

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
````

[Полный пример - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

Примечание: вложенные столбцы должны иметь одинаковые размерности. Например, в приведенном выше примере `Col_2_2` и `Col_2_1` должны содержать одинаковое количество элементов.

Благодаря более простому интерфейсу и официальной поддержке вложенности мы рекомендуем использовать `flatten_nested=0`.

#### Геотипы {#geo-types}


Клиент поддерживает географические типы Point, Ring, Polygon и MultiPolygon. Эти поля в Go представлены с использованием пакета [github.com/paulmach/orb](https://github.com/paulmach/orb).

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            point Point,
            ring Ring,
            polygon Polygon,
            mPolygon MultiPolygon
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
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    point    orb.Point
    ring     orb.Ring
    polygon  orb.Polygon
    mPolygon orb.MultiPolygon
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&point, &ring, &polygon, &mPolygon); err != nil {
    return err
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID {#uuid}

Тип UUID поддерживается пакетом [github.com/google/uuid](https://github.com/google/uuid). Пользователи также могут передавать и сериализовать UUID как строку или любой тип, который реализует интерфейс `sql.Scanner` или `Stringify`.

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

#### Decimal {#decimal}

Тип Decimal поддерживается пакетом [github.com/shopspring/decimal](https://github.com/shopspring/decimal).

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

```


if err = conn.QueryRow(ctx, "SELECT \* FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)

````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

#### Nullable {#nullable}

Значение Nil в Go представляет NULL в ClickHouse. Его можно использовать, если поле объявлено как Nullable. При вставке Nil можно передавать как для обычной, так и для Nullable-версии столбца. В первом случае будет сохранено значение по умолчанию для типа, например пустая строка для string. Для Nullable-версии в ClickHouse будет сохранено значение NULL.

При сканировании необходимо передать указатель на тип, поддерживающий nil, например *string, чтобы представить значение nil для поля Nullable. В примере ниже col1, который имеет тип Nullable(String), получает **string. Это позволяет представить nil.

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
````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

Клиент также поддерживает типы `sql.Null*`, например `sql.NullInt64`. Они совместимы с соответствующими типами ClickHouse.

#### Большие целые числа - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

Числовые типы размером более 64 бит представлены с использованием встроенного пакета Go [big](https://pkg.go.dev/math/big).

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

```


if err = conn.QueryRow(ctx, "SELECT \* FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)

````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### Сжатие {#compression}

Поддержка методов сжатия зависит от используемого базового протокола. Для нативного протокола клиент поддерживает сжатие `LZ4` и `ZSTD`. Сжатие выполняется только на уровне блоков. Чтобы включить сжатие, необходимо добавить конфигурацию `Compression` при установке соединения.

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionZSTD,
    },
    MaxOpenConns: 1,
})
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Array(String)
    ) Engine Memory
    `); err != nil {
    return err
}
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    if err := batch.Append([]string{strconv.Itoa(i), strconv.Itoa(i + 1), strconv.Itoa(i + 2), strconv.Itoa(i + 3)}); err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

Дополнительные методы сжатия доступны при использовании стандартного интерфейса через HTTP. Подробнее см. [database/sql API - Сжатие](#compression).

### Привязка параметров {#parameter-binding}

Клиент поддерживает привязку параметров для методов `Exec`, `Query` и `QueryRow`. Как показано в примере ниже, поддерживаются именованные, нумерованные и позиционные параметры. Ниже приведены примеры их использования.

```go
var count uint64
// позиционная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Позиционная привязка, количество: %d\n", count)
// нумерованная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Нумерованная привязка, количество: %d\n", count)
// именованная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Именованная привязка, количество: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### Особые случаи {#special-cases}

По умолчанию срезы разворачиваются в список значений, разделенных запятыми, при передаче в качестве параметра запроса. Если требуется вставить набор значений с обрамлением `[ ]`, следует использовать `ArraySet`.

Если требуются группы/кортежи с обрамлением `( )`, например для использования с операторами IN, можно использовать `GroupSet`. Это особенно полезно в случаях, когда требуется несколько групп, как показано в примере ниже.

Наконец, поля DateTime64 требуют указания точности для корректного отображения параметров. Однако уровень точности поля неизвестен клиенту, поэтому пользователь должен указать его самостоятельно. Для этого предоставляется параметр `DateNamed`.


```go
var count uint64
// массивы будут развернуты
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array unfolded count: %d\n", count)
// массивы будут сохранены в виде []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array count: %d\n", count)
// GroupSet позволяет формировать списки в виде ( )
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// Полезнее при необходимости вложенности
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// Используйте DateNamed, если требуется точность времени
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### Использование контекста {#using-context}

Контексты Go позволяют передавать дедлайны, сигналы отмены и другие значения, ограниченные областью запроса, через границы API. Все методы соединения принимают контекст в качестве первого параметра. Хотя в предыдущих примерах использовался context.Background(), пользователи могут применять эту возможность для передачи настроек и дедлайнов, а также для отмены запросов.

Передача контекста, созданного с помощью `WithDeadline`, позволяет устанавливать ограничения по времени выполнения запросов. Обратите внимание, что это абсолютное время, и по истечении срока соединение будет освобождено, а ClickHouse получит сигнал отмены. В качестве альтернативы для явной отмены запроса можно использовать `WithCancel`.

Вспомогательные функции `clickhouse.WithQueryID` и `clickhouse.WithQuotaKey` позволяют указать идентификатор запроса и ключ квоты. Идентификаторы запросов полезны для отслеживания запросов в логах и для их отмены. Ключ квоты можно использовать для установки ограничений на использование ClickHouse на основе уникального значения ключа — подробнее см. в разделе [Управление квотами](/operations/access-rights#quotas-management).

Пользователи также могут использовать контекст, чтобы настройка применялась только к конкретному запросу — а не ко всему соединению в целом, как показано в разделе [Настройки соединения](#connection-settings).

Наконец, размер буфера блоков можно контролировать с помощью `clickhouse.WithBlockSize`. Это переопределяет настройку на уровне соединения `BlockBufferSize` и определяет максимальное количество блоков, которые декодируются и удерживаются в памяти в любой момент времени. Большие значения позволяют добиться большей параллелизации, но увеличивают потребление памяти.

Примеры вышеуказанных возможностей приведены ниже.

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
// контекст можно использовать для передачи настроек в конкретный вызов API
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// для создания столбца JSON требуется allow_experimental_object_type=1
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

```


// запросы можно отменить с помощью контекста
ctx, cancel := context.WithCancel(context.Background())
go func() {
cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
return fmt.Errorf("expected cancel")
}

// установка крайнего срока для запроса - запрос будет отменен после достижения указанного времени.
// запросы продолжат выполняться до завершения в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
return fmt.Errorf("expected deadline exceeeded")
}

// установка идентификатора запроса для трассировки запросов в логах, например, см. system.query*log
var one uint8
queryId, * := uuid.NewUUID()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(queryId.String()))
if err = conn.QueryRow(ctx, "SELECT 1").Scan(&one); err != nil {
return err
}

conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// установка ключа квоты - сначала необходимо создать квоту
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

````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

### Информация о прогрессе/профиле/логах {#progressprofilelog-information}

Для запросов можно запросить информацию о прогрессе, профиле и логах. Информация о прогрессе предоставляет статистику о количестве строк и байтов, которые были прочитаны и обработаны в ClickHouse. Информация о профиле предоставляет сводку данных, возвращенных клиенту, включая общее количество байтов (несжатых), строк и блоков. Информация о логах предоставляет статистику по потокам, например, использование памяти и скорость обработки данных.

Для получения этой информации необходимо использовать [Context](#using-context), в который можно передать функции обратного вызова.

```go
totalRows := uint64(0)
// используйте контекст для передачи функций обратного вызова для информации о прогрессе и профиле
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

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

### Динамическое сканирование {#dynamic-scanning}

Пользователям может потребоваться читать таблицы, для которых они не знают схему или тип возвращаемых полей. Это часто встречается при выполнении специального анализа данных или разработке универсальных инструментов. Для этого в ответах на запросы доступна информация о типах столбцов. Её можно использовать с рефлексией Go для создания экземпляров переменных с правильными типами во время выполнения, которые затем можно передать в Scan.

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
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

### Внешние таблицы {#external-tables}


[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse вместе с SELECT-запросом. Эти данные помещаются во временную таблицу и могут использоваться непосредственно в запросе для вычислений.

Чтобы отправить внешние данные на сервер вместе с запросом, пользователь должен создать внешнюю таблицу с помощью `ext.NewTable`, а затем передать её через контекст.

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

### Open telemetry {#open-telemetry}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть нативного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context.

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
fmt.Printf("count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

Подробную информацию об использовании трассировки можно найти в разделе [Поддержка OpenTelemetry](/operations/opentelemetry/).


## API Database/SQL {#databasesql-api}

API `database/sql` или «стандартный» API позволяет использовать клиент в сценариях, где код приложения должен быть независим от конкретной базы данных, соответствуя стандартному интерфейсу. Это достигается определённой ценой — дополнительными уровнями абстракции и косвенности, а также примитивами, которые не всегда согласуются с ClickHouse. Однако эти издержки обычно приемлемы в сценариях, где инструментарию необходимо подключаться к нескольким базам данных.

Кроме того, этот клиент поддерживает использование HTTP в качестве транспортного уровня — данные по-прежнему будут кодироваться в нативном формате для оптимальной производительности.

Далее структура документации повторяет структуру документации для ClickHouse API.

Полные примеры кода для стандартного API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).

### Подключение {#connecting-1}

Подключение можно выполнить либо через строку DSN в формате `clickhouse://<host>:<port>?<query_option>=<value>` и метод `Open`, либо через метод `clickhouse.OpenDB`. Последний не является частью спецификации `database/sql`, но возвращает экземпляр `sql.DB`. Этот метод предоставляет функциональность, такую как профилирование, для которой нет очевидных способов предоставления через спецификацию `database/sql`.

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

**Для всех последующих примеров, если явно не указано иное, предполагается, что переменная ClickHouse `conn` создана и доступна.**

#### Настройки подключения {#connection-settings-1}

В строке DSN можно передать следующие параметры:

- `hosts` — список хостов с одним адресом, разделённых запятыми, для балансировки нагрузки и отказоустойчивости — см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
- `username/password` — учётные данные для аутентификации — см. [Аутентификация](#authentication)
- `database` — выбор текущей базы данных по умолчанию
- `dial_timeout` — строка длительности представляет собой возможно знаковую последовательность десятичных чисел, каждое с необязательной дробной частью и суффиксом единицы измерения, например `300ms`, `1s`. Допустимые единицы времени: `ms`, `s`, `m`.
- `connection_open_strategy` — `random/in_order` (по умолчанию `random`) — см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes)
  - `round_robin` — выбор сервера по кругу из набора
  - `in_order` — выбирается первый доступный сервер в указанном порядке
- `debug` — включение отладочного вывода (логическое значение)
- `compress` — указание алгоритма сжатия — `none` (по умолчанию), `zstd`, `lz4`, `gzip`, `deflate`, `br`. Если установлено значение `true`, будет использоваться `lz4`. Для нативного взаимодействия поддерживаются только `lz4` и `zstd`.
- `compress_level` — уровень сжатия (по умолчанию `0`). См. раздел о сжатии. Зависит от алгоритма:
  - `gzip` — от `-2` (максимальная скорость) до `9` (максимальное сжатие)
  - `deflate` — от `-2` (максимальная скорость) до `9` (максимальное сжатие)
  - `br` — от `0` (максимальная скорость) до `11` (максимальное сжатие)
  - `zstd`, `lz4` — игнорируется
- `secure` — установка защищённого SSL-соединения (по умолчанию `false`)
- `skip_verify` — пропуск проверки сертификата (по умолчанию `false`)
- `block_buffer_size` — позволяет управлять размером буфера блоков. См. [`BlockBufferSize`](#connection-settings). (по умолчанию `2`)


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

#### Пулинг соединений {#connection-pooling-1}

Пользователи могут управлять использованием предоставленного списка адресов узлов, как описано в разделе [Подключение к нескольким узлам](#connecting-to-multiple-nodes). Однако управление соединениями и пулинг по умолчанию делегируются `sql.DB`.

#### Подключение через HTTP {#connecting-over-http}

По умолчанию соединения устанавливаются через нативный протокол. Для использования HTTP необходимо либо изменить DSN, добавив протокол HTTP, либо указать Protocol в параметрах соединения.

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

#### Подключение к нескольким узлам {#connecting-to-multiple-nodes-1}

При использовании `OpenDB` подключение к нескольким хостам выполняется с использованием того же подхода с параметрами, что и для ClickHouse API, с возможностью указания `ConnOpenStrategy`.

Для соединений на основе DSN строка принимает несколько хостов и параметр `connection_open_strategy`, для которого можно установить значение `round_robin` или `in_order`.

```go
func MultiStdHost() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := clickhouse.Open(&clickhouse.Options{
                Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
        })
        if err != nil {
                return err
        }
        v, err := conn.ServerVersion()
        if err != nil {
                return err
        }
        fmt.Println(v.String())
        return nil
}

func MultiStdHostDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d?username=%s&password=%s&connection_open_strategy=round_robin", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)

### Использование TLS {#using-tls-1}

При использовании строки подключения DSN SSL можно включить с помощью параметра "secure=true". Метод `OpenDB` использует тот же подход, что и [нативный API для TLS](#using-tls), требуя указания ненулевой структуры TLS. Хотя строка подключения DSN поддерживает параметр skip_verify для пропуска проверки SSL, метод `OpenDB` необходим для более сложных конфигураций TLS, поскольку он позволяет передавать конфигурацию.


```go
func ConnectSSL() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        cwd, err := os.Getwd()
        if err != nil {
                return err
        }
        t := &tls.Config{}
        caCert, err := ioutil.ReadFile(path.Join(cwd, "../../tests/resources/CAroot.crt"))
        if err != nil {
                return err
        }
        caCertPool := x509.NewCertPool()
        successful := caCertPool.AppendCertsFromPEM(caCert)
        if !successful {
                return err
        }
        t.RootCAs = caCertPool

        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                TLS: t,
        })
        return conn.Ping()
}

func ConnectDSNSSL() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("https://%s:%d?secure=true&skip_verify=true&username=%s&password=%s", env.Host, env.HttpsPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)

### Аутентификация {#authentication-1}

При использовании `OpenDB` данные для аутентификации передаются через стандартные параметры. Для подключений на основе DSN имя пользователя и пароль можно передать в строке подключения — либо как параметры, либо как учетные данные, встроенные в адрес.

```go
func ConnectAuth() error {
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

func ConnectDSNAuth() error {
        env, err := GetStdTestEnvironment()
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        if err = conn.Ping(); err != nil {
                return err
        }
        conn, err = sql.Open("clickhouse", fmt.Sprintf("http://%s:%s@%s:%d", env.Username, env.Password, env.Host, env.HttpPort))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)

### Выполнение запросов {#execution-1}

После установки соединения можно выполнять `sql`-запросы с помощью метода Exec.

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

Этот метод не поддерживает передачу контекста — по умолчанию он выполняется с фоновым контекстом. При необходимости можно использовать `ExecContext` — см. раздел [Использование контекста](#using-context).

### Пакетная вставка {#batch-insert-1}

Пакетная вставка реализуется путем создания `sql.Tx` с помощью метода `Begin`. Затем можно получить пакет, используя метод `Prepare` с оператором `INSERT`. Этот метод возвращает `sql.Stmt`, к которому можно добавлять строки с помощью метода `Exec`. Пакет накапливается в памяти до выполнения `Commit` на исходном `sql.Tx`.


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

### Запрос строк {#querying-rows-1}

Запрос одной строки выполняется с помощью метода `QueryRow`. Он возвращает \*sql.Row, для которого можно вызвать Scan с указателями на переменные, в которые будут преобразованы столбцы. Вариант `QueryRowContext` позволяет передать контекст, отличный от фонового — см. [Использование контекста](#using-context).

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

Для итерации по нескольким строкам используется метод `Query`. Он возвращает структуру `*sql.Rows`, для которой можно вызвать Next для перебора строк. Эквивалент `QueryContext` позволяет передать контекст.

```go
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
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
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### Асинхронная вставка {#async-insert-1}

Асинхронные вставки выполняются с помощью метода `ExecContext`. Ему необходимо передать контекст с включенным асинхронным режимом, как показано ниже. Это позволяет указать, должен ли клиент ожидать завершения вставки на сервере или получить ответ сразу после получения данных. Фактически это управляет параметром [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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


### Колоночная вставка {#columnar-insert-1}

Не поддерживается при использовании стандартного интерфейса.

### Использование структур {#using-structs-1}

Не поддерживается при использовании стандартного интерфейса.

### Преобразование типов {#type-conversions-1}

Стандартный интерфейс `database/sql` должен поддерживать те же типы, что и [ClickHouse API](#type-conversions). Существует несколько исключений, в основном для сложных типов, которые описаны ниже. Как и ClickHouse API, клиент стремится быть максимально гибким в отношении принятия различных типов как для вставки, так и для маршалинга ответов. Дополнительные сведения см. в разделе [Преобразование типов](#type-conversions).

### Сложные типы {#complex-types-1}

Если не указано иное, обработка сложных типов должна быть такой же, как в [ClickHouse API](#complex-types). Различия обусловлены внутренней реализацией `database/sql`.

#### Словари (Maps) {#maps}

В отличие от ClickHouse API, стандартный API требует строгой типизации словарей при сканировании. Например, пользователи не могут передать `map[string]interface{}` для поля `Map(String,String)` и должны использовать `map[string]string`. Переменная `interface{}` всегда будет совместима и может использоваться для более сложных структур. Структуры не поддерживаются при чтении.

```go
var (
    col1Data = map[string]uint64{
        "key_col_1_1": 1,
        "key_col_1_2": 2,
    }
    col2Data = map[string]uint64{
        "key_col_2_1": 10,
        "key_col_2_2": 20,
    }
    col3Data = map[string]uint64{}
    col4Data = []map[string]string{
        {"A": "B"},
        {"C": "D"},
    }
    col5Data = map[string]uint64{
        "key_col_5_1": 100,
        "key_col_5_2": 200,
    }
)
if _, err := batch.Exec(col1Data, col2Data, col3Data, col4Data, col5Data); err != nil {
    return err
}
if err = scope.Commit(); err != nil {
    return err
}
var (
    col1 interface{}
    col2 map[string]uint64
    col3 map[string]uint64
    col4 []map[string]string
    col5 map[string]uint64
)
if err := conn.QueryRow("SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v", col1, col2, col3, col4, col5)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

Поведение при вставке такое же, как в ClickHouse API.

### Сжатие {#compression-1}

Стандартный API поддерживает те же алгоритмы сжатия, что и нативный [ClickHouse API](#compression), то есть сжатие `lz4` и `zstd` на уровне блоков. Кроме того, для HTTP-соединений поддерживается сжатие gzip, deflate и br. Если какой-либо из них включен, сжатие выполняется для блоков при вставке и для ответов на запросы. Другие запросы, например ping или запросы на выполнение, останутся несжатыми. Это согласуется с параметрами `lz4` и `zstd`.

При использовании метода `OpenDB` для установления соединения можно передать конфигурацию сжатия. Это включает возможность указать уровень сжатия (см. ниже). При подключении через `sql.Open` с DSN используйте параметр `compress`. Это может быть либо конкретный алгоритм сжатия, то есть `gzip`, `deflate`, `br`, `zstd` или `lz4`, либо логический флаг. Если установлено значение true, будет использоваться `lz4`. По умолчанию используется `none`, то есть сжатие отключено.

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

Уровень применяемого сжатия можно контролировать с помощью параметра DSN `compress_level` или поля `Level` опции `Compression`. По умолчанию используется значение 0, но это зависит от алгоритма:

- `gzip` - от `-2` (максимальная скорость) до `9` (максимальное сжатие)
- `deflate` - от `-2` (максимальная скорость) до `9` (максимальное сжатие)
- `br` - от `0` (максимальная скорость) до `11` (максимальное сжатие)
- `zstd`, `lz4` - игнорируется

### Привязка параметров {#parameter-binding-1}

Стандартный API поддерживает те же возможности привязки параметров, что и [ClickHouse API](#parameter-binding), позволяя передавать параметры в методы `Exec`, `Query` и `QueryRow` (и их эквивалентные варианты с [Context](#using-context)). Поддерживаются позиционные, именованные и нумерованные параметры.

```go
var count uint64
// позиционная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// числовая привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// именованная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

Обратите внимание, что [особые случаи](#special-cases) по-прежнему применяются.

### Использование контекста {#using-context-1}

Стандартный API поддерживает ту же возможность передачи дедлайнов, сигналов отмены и других значений в области запроса через контекст, что и [ClickHouse API](#using-context). В отличие от ClickHouse API, это достигается использованием вариантов методов с `Context`, то есть методы, такие как `Exec`, которые по умолчанию используют фоновый контекст, имеют вариант `ExecContext`, которому контекст может быть передан в качестве первого параметра. Это позволяет передавать контекст на любом этапе выполнения приложения. Например, пользователи могут передать контекст при установлении соединения через `ConnContext` или при запросе строки результата через `QueryRowContext`. Примеры всех доступных методов показаны ниже.

Для получения более подробной информации об использовании контекста для передачи дедлайнов, сигналов отмены, идентификаторов запросов, ключей квот и настроек соединения см. раздел «Использование контекста» для [ClickHouse API](#using-context).

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// для создания столбца JSON необходимо allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// запросы могут быть отменены с помощью контекста
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// установка дедлайна для запроса - это отменит запрос после достижения абсолютного времени. Опять же, завершается только соединение,
// запросы продолжат выполнение до завершения в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

```


// установить идентификатор запроса для трассировки запросов в логах, например, см. system.query_log
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
// установить ключ квоты - сначала необходимо создать квоту
if \_, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
return err
}

// запросы можно отменить с помощью контекста
ctx, cancel = context.WithCancel(context.Background())
// мы получим некоторые результаты до отмены
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
"max_block_size": "1",
}))
rows, err := conn.QueryContext(ctx, "SELECT sleepEachRow(1), number FROM numbers(100);")
if err != nil {
return err
}
var (
col1 uint8
col2 uint8
)

for rows.Next() {
if err := rows.Scan(&col1, &col2); err != nil {
if col2 > 3 {
fmt.Println("ожидаемая отмена")
return nil
}
return err
}
fmt.Printf("row: col2=%d\n", col2)
if col2 == 3 {
cancel()
}
}

````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### Сессии {#sessions}

В то время как нативные соединения по умолчанию имеют сессию, соединения через HTTP требуют от пользователя создания идентификатора сессии для передачи в контексте в качестве настройки. Это позволяет использовать функции, например временные таблицы, которые привязаны к сессии.

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
var (
    col1 uint8
)
for rows.Next() {
    if err := rows.Scan(&col1); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d\n", col1)
}
````

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### Динамическое сканирование {#dynamic-scanning-1}

Аналогично [ClickHouse API](#dynamic-scanning), доступна информация о типах столбцов, что позволяет пользователям создавать экземпляры правильно типизированных переменных во время выполнения, которые можно передать в Scan. Это позволяет читать столбцы с неизвестным типом.

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
```


[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### Внешние таблицы {#external-tables-1}

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse вместе с запросом `SELECT`. Эти данные помещаются во временную таблицу и могут использоваться непосредственно в запросе для обработки.

Чтобы отправить внешние данные на сервер вместе с запросом, необходимо создать внешнюю таблицу с помощью `ext.NewTable`, а затем передать её через контекст.

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
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
rows.Close()

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

### OpenTelemetry {#open-telemetry-1}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть нативного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context. Эта возможность не поддерживается при использовании HTTP в качестве транспорта.

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
fmt.Printf("count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)


## Советы по производительности {#performance-tips}

- По возможности используйте API ClickHouse, особенно для примитивных типов. Это позволяет избежать значительных затрат на рефлексию и косвенное обращение к данным.
- При чтении больших наборов данных рассмотрите возможность изменения параметра [`BlockBufferSize`](#connection-settings). Это увеличит потребление памяти, но позволит декодировать больше блоков параллельно во время итерации по строкам. Значение по умолчанию 2 является консервативным и минимизирует накладные расходы по памяти. Более высокие значения означают большее количество блоков в памяти. Это требует тестирования, поскольку разные запросы могут создавать блоки разного размера. Поэтому параметр можно установить на [уровне запроса](#using-context) через Context.
- Будьте точны в указании типов при вставке данных. Хотя клиент стремится быть гибким, например, позволяя парсить строки для UUID или IP-адресов, это требует валидации данных и влечет дополнительные затраты во время вставки.
- По возможности используйте колоночно-ориентированные вставки. Они также должны быть строго типизированы, чтобы избежать необходимости преобразования значений на стороне клиента.
- Следуйте [рекомендациям](/sql-reference/statements/insert-into/#performance-considerations) ClickHouse для достижения оптимальной производительности вставки.
