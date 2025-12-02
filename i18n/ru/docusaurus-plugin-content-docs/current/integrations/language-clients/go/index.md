---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'Go-клиенты для ClickHouse позволяют пользователям подключаться к ClickHouse посредством стандартного интерфейса Go database/sql или оптимизированного нативного интерфейса.'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go {#clickhouse-go}

## Простой пример {#a-simple-example}

Рассмотрим простой пример на Go. Он подключится к ClickHouse и выполнит запрос `SELECT` к системной базе данных. Для начала вам понадобятся данные подключения.

### Параметры подключения {#connection-details}

<ConnectionDetails />

### Инициализация модуля {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```


### Скопируйте пример кода {#copy-in-some-sample-code}

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


### Выполните go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```


### Укажите параметры подключения {#set-your-connection-details}

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


### Подробнее {#learn-more}

Остальная документация в этой категории описывает подробности работы клиента Go для ClickHouse.

## Go-клиент ClickHouse {#clickhouse-go-client}

ClickHouse поддерживает два официальных Go-клиента. Эти клиенты взаимодополняют друг друга и намеренно ориентированы на разные сценарии использования.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) — высокоуровневая клиентская библиотека для Go, которая поддерживает либо стандартный интерфейс Go `database/sql`, либо нативный интерфейс.
* [ch-go](https://github.com/ClickHouse/ch-go) — низкоуровневый клиент. Только нативный интерфейс.

clickhouse-go предоставляет высокоуровневый интерфейс, позволяющий пользователям выполнять запросы и вставку данных, используя ориентированную на строки семантику и пакетную обработку, которая менее строга к типам данных — значения будут преобразованы при условии, что потенциальной потери точности не произойдет. ch-go, в свою очередь, предоставляет оптимизированный интерфейс, ориентированный на колонки, обеспечивающий быструю потоковую передачу блоков данных с низкой нагрузкой на CPU и память, но ценой строгих требований к типам и более сложного использования.

Начиная с версии 2.3, clickhouse-go использует ch-go для низкоуровневых функций, таких как кодирование, декодирование и сжатие. Обратите внимание, что clickhouse-go также поддерживает стандартный интерфейс Go `database/sql`. Оба клиента используют нативный формат для кодирования данных, чтобы обеспечить оптимальную производительность, и могут обмениваться данными по нативному протоколу ClickHouse. clickhouse-go также поддерживает HTTP в качестве транспортного протокола для случаев, когда пользователям необходимо проксировать трафик или выполнять балансировку нагрузки.

При выборе клиентской библиотеки пользователям следует учитывать их соответствующие достоинства и недостатки — см. раздел Choosing a Client Library.

|               | Нативный формат | Нативный протокол | Протокол HTTP | Ориентированный на строки API | Ориентированный на колонки API | Гибкость работы с типами | Сжатие | Плейсхолдеры в запросах |
|:-------------:|:---------------:|:-----------------:|:-------------:|:-----------------------------:|:------------------------------:|:------------------------:|:------:|:------------------------:|
| clickhouse-go |        ✅        |         ✅         |       ✅       |               ✅               |                ✅               |           ✅             |   ✅    |            ✅             |
|     ch-go     |        ✅        |         ✅         |               |                               |                ✅               |                          |   ✅    |                          |

## Выбор клиента {#choosing-a-client}

Выбор клиентской библиотеки зависит от характера использования и требований к производительности. Для сценариев с интенсивной вставкой, когда требуется выполнять миллионы вставок в секунду, мы рекомендуем использовать низкоуровневый клиент [ch-go](https://github.com/ClickHouse/ch-go). Этот клиент позволяет избежать накладных расходов, связанных с преобразованием данных из построчного формата в колоночный, как того требует нативный формат ClickHouse. Кроме того, он не использует механизмы рефлексии и тип `interface{}` (`any`), что упрощает использование.

Для нагрузок, ориентированных на агрегирующие запросы, или для сценариев с меньшей интенсивностью вставок [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) предоставляет привычный интерфейс `database/sql` и более простую построчную семантику. Пользователи при желании могут использовать HTTP в качестве транспортного протокола и воспользоваться вспомогательными функциями для маршаллинга строк в структуры и обратно.

## Клиент clickhouse-go {#the-clickhouse-go-client}

Клиент clickhouse-go предоставляет два интерфейса API для взаимодействия с ClickHouse:

* Клиентский API, специфичный для ClickHouse
* Стандарт `database/sql` — обобщённый интерфейс для SQL-баз данных, предоставляемый Golang.

Хотя `database/sql` предоставляет независимый от конкретной СУБД интерфейс, позволяя разработчикам абстрагировать хранилище данных, он накладывает ограничения на типизацию и семантику запросов, что влияет на производительность. По этой причине клиентский API, специфичный для ClickHouse, следует использовать там, где [важна производительность](https://github.com/clickHouse/clickHouse-go#benchmark). Однако пользователи, которые хотят интегрировать ClickHouse в инструменты, поддерживающие несколько СУБД, могут предпочесть стандартный интерфейс.

Оба интерфейса кодируют данные в [нативном формате](/native-protocol/basics.md) и используют нативный протокол для взаимодействия. Дополнительно стандартный интерфейс поддерживает взаимодействие по HTTP.

|                    | Нативный формат | Нативный протокол | Протокол HTTP | Поддержка пакетной записи | Маршалинг структур | Сжатие | Плейсхолдеры в запросах |
|:------------------:|:---------------:|:-----------------:|:-------------:|:--------------------------:|:-------------------:|:------:|:-----------------------:|
|   ClickHouse API   |        ✅        |         ✅         |               |             ✅             |         ✅           |   ✅    |           ✅             |
| `database/sql` API |        ✅        |         ✅         |       ✅       |             ✅             |                     |   ✅    |           ✅             |

## Установка {#installation}

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


### Управление версиями и совместимость {#versioning--compatibility}

Клиент выпускается независимо от ClickHouse. Линейка 2.x представляет текущую основную мажорную версию в разработке. Все версии 2.x должны быть совместимы друг с другом.

#### Совместимость с ClickHouse {#clickhouse-compatibility}

Клиент поддерживает:

- Все версии ClickHouse, которые в настоящее время поддерживаются, как указано [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). По мере того как версии ClickHouse снимаются с поддержки, они также перестают участвовать в активном тестировании новых версий клиента.
- Все версии ClickHouse в течение 2 лет с даты выхода релиза клиента. Обратите внимание, что активное тестирование проводится только для LTS-версий.

#### Совместимость с Golang {#golang-compatibility}

| Версия клиента | Версии Golang |
|:--------------:|:-------------:|
|  => 2.0 &lt;= 2.2 |   1.17, 1.18  |
|     >= 2.3     |      1.18     |

## Клиентский API ClickHouse {#clickhouse-client-api}

Все примеры кода для клиентского API ClickHouse можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).

### Подключение {#connecting}

В следующем примере, который возвращает версию сервера, демонстрируется подключение к ClickHouse — предполагается, что защита не настроена и доступ осуществляется под пользователем по умолчанию.

Обратите внимание, что для подключения используется стандартный нативный порт.

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

**Во всех последующих примерах, если не указано явно, предполагается, что переменная `conn` для подключения к ClickHouse уже создана и доступна.**


#### Параметры подключения {#connection-settings}

При открытии подключения можно использовать структуру `Options` для управления поведением клиента. Доступны следующие параметры:

* `Protocol` — либо Native, либо HTTP. В настоящее время HTTP поддерживается только для [database/sql API](#databasesql-api).
* `TLS` — параметры TLS. Ненулевое значение включает TLS. См. раздел [Использование TLS](#using-tls).
* `Addr` — срез (slice) адресов, включая порт.
* `Auth` — данные аутентификации. См. раздел [Аутентификация](#authentication).
* `DialContext` — пользовательская dial‑функция, определяющая, как устанавливаются подключения.
* `Debug` — true/false для включения отладки.
* `Debugf` — функция для обработки отладочного вывода. Требует, чтобы `debug` был установлен в значение `true`.
* `Settings` — map с настройками ClickHouse. Они будут применены ко всем запросам ClickHouse. Использование [контекста](#using-context) позволяет задавать настройки для каждого запроса.
* `Compression` — включает сжатие блоков. См. раздел [Сжатие](#compression).
* `DialTimeout` — максимальное время на установление подключения. По умолчанию `1s`.
* `MaxOpenConns` — максимальное количество подключений, которые могут использоваться в любой момент времени. В пуле простаивающих подключений может быть больше или меньше подключений, но одновременно может использоваться только это количество. По умолчанию `MaxIdleConns+5`.
* `MaxIdleConns` — количество подключений, поддерживаемых в пуле. Подключения будут переиспользоваться, если это возможно. По умолчанию `5`.
* `ConnMaxLifetime` — максимальное время жизни подключения в доступном состоянии. По умолчанию 1 час. Подключения уничтожаются по истечении этого времени, при необходимости в пул добавляются новые подключения.
* `ConnOpenStrategy` — определяет, как список адресов узлов должен использоваться для открытия подключений. См. раздел [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `BlockBufferSize` — максимальное количество блоков, декодируемых в буфер за один раз. Большие значения увеличивают степень параллелизма ценой потребления памяти. Размеры блоков зависят от запроса, поэтому, хотя вы можете задать это значение на уровне подключения, мы рекомендуем переопределять его на уровне запроса в зависимости от возвращаемых данных. По умолчанию `2`.

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


#### Пул подключений {#connection-pooling}

Клиент поддерживает пул подключений и при необходимости повторно использует их для выполнения запросов. В каждый момент времени будет использовано не более `MaxOpenConns`, а максимальный размер пула контролируется параметром `MaxIdleConns`. Для каждого выполнения запроса клиент получает подключение из пула и по завершении возвращает его обратно для повторного использования. Подключение используется на протяжении всего жизненного цикла батча и освобождается при вызове `Send()`.

Нет гарантии, что одно и то же подключение из пула будет использоваться для последующих запросов, если только пользователь не установит `MaxOpenConns=1`. Это требуется редко, но может быть необходимо в случаях, когда используются временные таблицы.

Также обратите внимание, что значение `ConnMaxLifetime` по умолчанию равно одному часу. Это может приводить к ситуациям, когда нагрузка на ClickHouse становится несбалансированной, если узлы покидают кластер. Это происходит, когда один из узлов становится недоступен и подключения перераспределяются на другие узлы. Эти подключения сохранятся и не будут обновляться в течение одного часа по умолчанию, даже если проблемный узел вернётся в кластер. Рассмотрите возможность уменьшения этого значения при интенсивных нагрузках.

### Использование TLS {#using-tls}

На низком уровне все методы подключения клиента (`DSN/OpenDB/Open`) используют [пакет tls для Go](https://pkg.go.dev/crypto/tls) для установления защищённого соединения. Клиент понимает, что нужно использовать TLS, если в структуре `Options` содержится указатель на `tls.Config`, отличный от nil.

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

Такой минимальной конфигурации `TLS.Config` обычно достаточно для подключения к защищённому нативному порту (как правило, 9440) сервера ClickHouse. Если у сервера ClickHouse нет корректного сертификата (истёк срок действия, неверное имя хоста, не подписан общепризнанным корневым удостоверяющим центром), можно установить `InsecureSkipVerify` в значение true, но это настоятельно не рекомендуется.

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

Если необходимы дополнительные параметры TLS, в коде приложения следует задать нужные поля в структуре `tls.Config`. Это может включать указание конкретных наборов шифров, принудительное использование определённой версии TLS (например, 1.2 или 1.3), добавление внутренней цепочки сертификатов CA, добавление клиентского сертификата (и закрытого ключа), если этого требует сервер ClickHouse, а также большинство других опций, применяемых в более сложных конфигурациях безопасности.


### Аутентификация {#authentication}

Укажите структуру Auth в настройках подключения, чтобы задать имя пользователя и пароль.

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

Несколько адресов можно указать с помощью структуры `Addr`.

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

Доступны две стратегии установления соединения:

* `ConnOpenInOrder` (по умолчанию) — адреса используются по порядку. Следующие адреса задействуются только в случае неудачной попытки подключения по более ранним адресам в списке. По сути, это стратегия отказоустойчивого переключения (failover).
* `ConnOpenRoundRobin` — нагрузка распределяется между адресами по круговой (round-robin) схеме.

Это настраивается с помощью опции `ConnOpenStrategy`

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


### Выполнение {#execution}

Произвольные операторы можно выполнять с помощью метода `Exec`. Это полезно для DDL и простых операторов. Не следует использовать его для больших вставок или итераций запросов.

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

Обратите внимание на возможность передавать `Context` при выполнении запроса. Это позволяет задавать отдельные настройки на уровне запроса — см. [Использование Context](#using-context).


### Пакетная вставка {#batch-insert}

Чтобы вставить большое количество строк, клиент поддерживает пакетную вставку (batch). Для этого необходимо подготовить батч, к которому можно добавлять строки. В конце он отправляется методом `Send()`. Батчи хранятся в памяти до вызова `Send`.

Рекомендуется вызывать `Close` для батча, чтобы предотвратить утечки соединений. Это можно сделать с помощью ключевого слова `defer` сразу после подготовки батча. Это освободит соединение, если `Send` так и не будет вызван. Обратите внимание, что в этом случае в журнале запросов будет отображаться вставка 0 строк, если ни одной строки не было добавлено.

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

Рекомендации для ClickHouse применимы и [здесь](/guides/inserting-data#best-practices-for-inserts). Батчи не должны разделяться между горутинами — создавайте отдельный батч для каждой горутины.

Из приведённого выше примера обратите внимание на необходимость соответствия типов переменных типам столбцов при добавлении строк. Хотя отображение обычно очевидно, этот интерфейс старается быть гибким, и типы будут конвертированы при условии отсутствия потери точности. Например, следующий пример демонстрирует вставку строки в тип datetime64.

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

Для полного перечня поддерживаемых типов Go для каждого типа столбца см. раздел [Преобразование типов](#type-conversions).


### Запрос строк {#querying-rows}

Пользователи могут либо выполнить запрос одной строки с помощью метода `QueryRow`, либо получить курсор для итерации по набору результатов с помощью `Query`. В то время как первый метод принимает переменную, в которую будут десериализованы данные, второй требует вызова `Scan` для каждой строки.

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

Обратите внимание, что в обоих случаях необходимо передать указатель на переменные, в которые должны быть сериализованы соответствующие значения столбцов. Их нужно передавать в порядке, указанном в выражении `SELECT` — по умолчанию при `SELECT *`, как показано выше, будет использоваться порядок объявления столбцов.

Аналогично вставке, метод Scan требует, чтобы целевые переменные имели подходящий тип. Подход также рассчитан на гибкость: типы приводятся там, где это возможно, при условии отсутствия потери точности. Например, в приведённом выше примере столбец UUID читается в строковую переменную. Полный список поддерживаемых типов Go для каждого типа Column см. в разделе [Type Conversions](#type-conversions).

Наконец, обратите внимание на возможность передавать `Context` методам `Query` и `QueryRow`. Это может использоваться для настроек на уровне запроса — подробности см. в разделе [Using Context](#using-context).


### Асинхронная вставка {#async-insert}

Асинхронные вставки поддерживаются методом Async. Это позволяет пользователю указать, должен ли клиент ждать завершения операции вставки на сервере или может ответить сразу после получения данных. Таким образом фактически управляется параметр [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert).

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
    )`, i, "Драйвер базы данных SQL для Golang"), false); err != nil {
        return err
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)


### Колоночная вставка {#columnar-insert}

Данные можно вставлять в колоночном формате. Это может дать выигрыш в производительности, если данные уже имеют такую структуру, поскольку нет необходимости преобразовывать их в строки.

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
    col2 = append(col2, "Драйвер базы данных SQL для Golang")
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

Для пользователей структуры Go представляют логическую модель строки данных в ClickHouse. Для этого нативный интерфейс предоставляет ряд удобных функций.

#### Select с сериализацией {#select-with-serialize}

Метод Select позволяет за один вызов метода преобразовать набор строк ответа в срез структур.

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
    fmt.Printf("строка: col1=%d, col2=%s, col3=%s\n", v.Col1, v.Col2, v.ColumnWithName)
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)


#### Scan struct {#scan-struct}

`ScanStruct` позволяет считывать одну строку результата запроса в структуру.

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

`AppendStruct` позволяет добавить структуру к существующему [batch](#batch-insert) и интерпретировать её как полноценную строку таблицы. Для этого требуется, чтобы столбцы структуры совпадали по именам и типам со столбцами таблицы. Хотя для всех столбцов таблицы должно существовать эквивалентное поле структуры, некоторые поля структуры могут не иметь эквивалентного представления в виде столбца. Такие поля будут просто игнорироваться.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Драйвер SQL-базы данных Golang",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "это будет проигнорировано",
    })
    if err != nil {
        return err
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)


### Преобразование типов {#type-conversions}

Клиент стремится быть максимально гибким в отношении принимаемых типов данных как для вставки, так и для маршалинга ответов. В большинстве случаев для типа столбца ClickHouse существует эквивалентный тип Golang, например, [UInt64](/sql-reference/data-types/int-uint/) — [uint64](https://pkg.go.dev/builtin#uint64). Эти логические соответствия должны поддерживаться всегда. Пользователи могут захотеть использовать типы данных, которые могут быть вставлены в столбцы или использованы для получения ответа, при условии, что предварительно будет выполнено преобразование либо переменной, либо полученных данных. Клиент нацелен на прозрачную поддержку таких преобразований, чтобы пользователям не нужно было заранее точно приводить данные к нужным типам перед вставкой, а также чтобы обеспечить гибкий маршалинг во время выполнения запроса. Такое прозрачное преобразование не допускает потери точности. Например, `uint32` не может использоваться для получения данных из столбца `UInt64`. В свою очередь, строку можно вставить в поле `datetime64`, если она соответствует требованиям формата.

В настоящее время поддерживаемые преобразования для примитивных типов представлены [здесь](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

Работа в этом направлении продолжается и может рассматриваться отдельно для вставки (`Append`/`AppendRow`) и чтения (через `Scan`). Если вам требуется поддержка конкретного преобразования, создайте issue.

### Сложные типы данных {#complex-types}

#### Типы Date/DateTime {#datedatetime-types}

Go‑клиент ClickHouse поддерживает типы дат/даты-времени `Date`, `Date32`, `DateTime` и `DateTime64`. Даты можно вставлять как строку в формате `2006-01-02` или используя нативные типы Go `time.Time{}` или `sql.NullTime`. Для типов DateTime эти типы также поддерживаются, но строки должны передаваться в формате `2006-01-02 15:04:05` с необязательным смещением часового пояса, например `2006-01-02 15:04:05 +08:00`. `time.Time{}` и `sql.NullTime` поддерживаются и при чтении, как и любая реализация интерфейса `sql.Scanner`.

Обработка информации о часовом поясе зависит от типа ClickHouse и того, вставляется ли значение или считывается:

* **DateTime/DateTime64**
  * Во время **insert** значение отправляется в ClickHouse в формате Unix timestamp. Если часовой пояс не указан, клиент использует локальный часовой пояс. `time.Time{}` или `sql.NullTime` будут соответствующим образом конвертированы в epoch.
  * Во время **select** при возврате значения `time.Time` будет использован часовой пояс столбца, если он задан. В противном случае будет использован часовой пояс сервера.
* **Date/Date32**
  * Во время **insert** часовой пояс даты учитывается при преобразовании даты в Unix timestamp, то есть значение будет сдвинуто на величину часового пояса перед сохранением как дата, так как типы Date не имеют локали в ClickHouse. Если часовой пояс не указан в строковом значении, будет использован локальный часовой пояс.
  * Во время **select** даты, считываемые в экземпляры `time.Time{}` или `sql.NullTime{}`, будут возвращаться без информации о часовом поясе.

#### Array {#array}

Массивы должны вставляться как срезы. Правила для типов элементов совпадают с правилами для [примитивного типа](#type-conversions), то есть, по возможности элементы будут конвертированы.

Указатель на срез должен быть передан при вызове Scan.

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

Отображения (map) следует задавать как карты Go (map), в которых ключи и значения соответствуют правилам преобразования типов, определённым [выше](#type-conversions).

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

Кортежи представляют собой набор столбцов произвольной длины. Столбцы могут быть либо явно именованы, либо задаваться только типом (без имени), например:

```sql
//без имён
Col1 Tuple(String, Int64)

//именованный
Col2 Tuple(name String, id Int64, age uint8)
```

Из этих подходов именованные кортежи обеспечивают большую гибкость. Неименованные кортежи должны вставляться и считываться по срезам, тогда как именованные кортежи также совместимы с типом Map.

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

// именованные и неименованные кортежи можно добавлять с помощью срезов. Обратите внимание: можно использовать строго типизированные списки и словари, если все элементы имеют одинаковый тип
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
// именованные кортежи можно извлечь в словарь или срезы, неименованные — только в срезы
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

Примечание: типизированные срезы и отображения поддерживаются при условии, что все подколонки в именованном `Tuple` имеют один и тот же тип.


#### Nested {#nested}

Поле типа Nested эквивалентно массиву именованных кортежей (Array of named Tuples). Использование зависит от того, установил ли пользователь параметр [flatten&#95;nested](/operations/settings/settings#flatten_nested) в значение 1 или 0.

Если установить flatten&#95;nested в 0, столбцы Nested остаются в виде одного массива кортежей. Это позволяет использовать срезы отображений (map) для вставки и выборки, а также произвольные уровни вложенности. Ключ отображения должен совпадать с именем столбца, как показано в примере ниже.

Примечание: поскольку отображение представляет кортеж, оно должно иметь тип `map[string]interface{}`. Типы значений в настоящее время не строго типизированы.

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
rows.Close()
```

[Полный пример — `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

Если для `flatten_nested` используется значение по умолчанию — 1, вложенные столбцы разворачиваются в отдельные массивы. Для вставки и выборки при этом требуются вложенные срезы. Хотя произвольная глубина вложенности может работать, это официально не поддерживается.


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

Примечание: вложенные столбцы должны иметь одинаковую размерность. Например, в приведённом выше примере `Col_2_2` и `Col_2_1` должны иметь одинаковое количество элементов.

Благодаря более простому интерфейсу и официальной поддержке вложенности мы рекомендуем использовать `flatten_nested=0`.


#### Гео-типы {#geo-types}

Клиент поддерживает гео-типы Point, Ring, Polygon и Multi Polygon. Эти поля в Go представлены типами из пакета [github.com/paulmach/orb](https://github.com/paulmach/orb).

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

Тип UUID поддерживается пакетом [github.com/google/uuid](https://github.com/google/uuid). UUID также можно передавать и сериализовать как строку или как любой тип, реализующий `sql.Scanner` или `Stringify`.

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

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)


#### Nullable {#nullable}

Значение `Nil` в Go соответствует `NULL` в ClickHouse. Его можно использовать, если поле объявлено как `Nullable`. При вставке `Nil` может передаваться как в обычный, так и в `Nullable`-столбец. В первом случае будет сохранено значение типа по умолчанию, например пустая строка для `string`. Для `Nullable`-версии в ClickHouse будет сохранено значение `NULL`.

Во время выполнения `Scan` пользователь должен передать указатель на тип, поддерживающий `nil`, например `*string`, чтобы можно было отразить значение `nil` для поля `Nullable`. В примере ниже `col1`, имеющее тип `Nullable(String)`, соответственно получает тип `**string`. Это позволяет представить значение `nil`.

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

Клиент также поддерживает типы `sql.Null*`, например `sql.NullInt64`. Они совместимы с соответствующими типами ClickHouse.


#### Большие целые числа — Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

Числовые типы размером более 64 бит представлены с использованием встроенного в Go пакета [big](https://pkg.go.dev/math/big).

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


### Сжатие {#compression}

Поддержка методов сжатия зависит от используемого базового протокола. Для нативного протокола клиент поддерживает сжатие `LZ4` и `ZSTD`. Оно выполняется только на уровне блоков. Сжатие можно включить, добавив параметр конфигурации `Compression` к подключению.

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
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

Дополнительные способы сжатия доступны при использовании стандартного интерфейса по HTTP. Подробности см. в разделе [database/sql API - Compression](#compression).


### Привязка параметров {#parameter-binding}

Клиент поддерживает привязку параметров для методов `Exec`, `Query` и `QueryRow`. Как показано в примере ниже, это работает с использованием именованных, нумерованных и позиционных параметров. Ниже приведены примеры каждого из этих вариантов.

```go
var count uint64
// позиционное связывание
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Количество при позиционном связывании: %d\n", count)
// числовое связывание
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Количество при числовом связывании: %d\n", count)
// именованное связывание
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Количество при именованном связывании: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)


#### Особые случаи {#special-cases}

По умолчанию срезы будут разворачиваться в список значений, разделённых запятыми, если они передаются как параметр запроса. Если нужно, чтобы набор значений был подставлен в квадратных скобках `[ ]`, следует использовать `ArraySet`.

Если требуются группы/кортежи в круглых скобках `( )`, например для использования с операторами IN, можно использовать `GroupSet`. Это особенно полезно, когда нужно несколько групп, как показано в примере ниже.

Наконец, для полей DateTime64 требуется указать точность, чтобы параметры формировались корректно. Однако клиенту уровень точности поля неизвестен, поэтому пользователь должен задать его. Чтобы упростить это, мы предоставляем параметр `DateNamed`.

```go
var count uint64
// массивы будут развёрнуты
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество с развёрнутым массивом: %d\n", count)
// массивы будут сохранены с []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество с массивом: %d\n", count)
// Групповые наборы позволяют формировать списки ( )
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество с группой: %d\n", count)
// Более полезно при необходимости вложенности
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество с группой: %d\n", count)
// Используйте DateNamed, когда требуется точность времени
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество с NamedDate: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)


### Использование контекста {#using-context}

Контексты в Go предоставляют механизм передачи дедлайнов, сигналов отмены и других значений, связанных с запросом, через границы API. Все методы соединения принимают `context` в качестве первого аргумента. В то время как в предыдущих примерах использовался `context.Background()`, пользователи могут использовать эту возможность для передачи настроек, дедлайнов и для отмены запросов.

Передача контекста, созданного с помощью `WithDeadline`, позволяет задать ограничение по времени выполнения запросов. Обратите внимание, что это абсолютное время, и по истечении срока будет только освобождено соединение и отправлен сигнал отмены в ClickHouse. Вместо этого можно использовать `WithCancel` для явной отмены запроса.

Вспомогательные функции `clickhouse.WithQueryID` и `clickhouse.WithQuotaKey` позволяют задать идентификатор запроса и ключ квоты. Идентификаторы запросов могут быть полезны для отслеживания запросов в логах и для их отмены. Ключ квоты может использоваться для наложения ограничений на использование ClickHouse на основе уникального значения ключа — см. [Quotas Management](/operations/access-rights#quotas-management) для дополнительной информации.

Пользователи также могут использовать контекст, чтобы гарантировать, что настройка применяется только к конкретному запросу, а не ко всему соединению, как показано в разделе [Connection Settings](#connection-settings).

Наконец, пользователи могут управлять размером буфера блоков с помощью `clickhouse.WithBlockSize`. Это переопределяет параметр соединения `BlockBufferSize` и определяет максимальное количество блоков, которые декодируются и удерживаются в памяти в любой момент времени. Более высокие значения потенциально означают больше распараллеливания за счет увеличения потребления памяти.

Примеры использования описанных выше возможностей приведены ниже.

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

// запросы можно отменить через контекст
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("ожидалась отмена")
}

// установка крайнего срока для запроса — запрос будет отменён по достижении указанного времени.
// запросы продолжат выполняться до завершения в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("ожидалось превышение крайнего срока")
}

// установка идентификатора запроса для трассировки запросов в логах, например, см. system.query_log
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
// установка ключа квоты — сначала создайте квоту
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


### Информация о ходе выполнения, профиле и логах {#progressprofilelog-information}

Информацию о ходе выполнения (Progress), профиле (Profile) и логах (Log) можно запрашивать при выполнении запросов. Информация о ходе выполнения содержит статистику по количеству строк и байт, которые были прочитаны и обработаны в ClickHouse. Напротив, информация профиля предоставляет сводку данных, возвращённых клиенту, включая суммарный объём байт (в несжатом виде), строк и блоков. Наконец, информация из логов предоставляет статистику по потокам, например, использование памяти и скорость обработки данных.

Для получения этой информации пользователю необходимо использовать [Context](#using-context), которому можно передавать функции обратного вызова.

```go
totalRows := uint64(0)
// используйте контекст для передачи callback-функций для информации о прогрессе и профилировании
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("прогресс: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("информация профилирования: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("информация лога: ", log)
}))

rows, err := conn.Query(ctx, "SELECT number from numbers(1000000) LIMIT 1000000")
if err != nil {
    return err
}
for rows.Next() {
}

fmt.Printf("Всего строк: %d\n", totalRows)
rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)


### Динамическое сканирование {#dynamic-scanning}

Пользователям может потребоваться читать таблицы, для которых им заранее неизвестна схема или тип полей, возвращаемых запросом. Это типично в случаях, когда выполняется разовая (ad‑hoc) аналитика данных или разрабатываются универсальные инструменты. Для этого информация о типах столбцов доступна в ответах на запросы. Её можно использовать совместно с механизмом рефлексии (reflection) в Go для создания во время выполнения экземпляров переменных корректных типов, которые затем можно передавать в Scan.

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

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse в рамках запроса SELECT. Эти данные помещаются во временную таблицу и могут использоваться в самом запросе для вычислений.

Чтобы отправить внешние данные вместе с запросом, пользователь должен создать внешнюю таблицу с помощью `ext.NewTable` до передачи её через контекст.

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

[Полный пример кода](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)


### OpenTelemetry {#open-telemetry}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) в составе нативного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context для этого.

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

Подробное описание использования трассировки см. в разделе [поддержка OpenTelemetry](/operations/opentelemetry/).


## Database/SQL API {#databasesql-api}

Интерфейс `database/sql` или «стандартный» API позволяет использовать клиент в сценариях, когда прикладной код должен быть агностичным к используемым базам данных, опираясь на стандартный интерфейс. Это имеет свою цену — дополнительные уровни абстракции и перенаправления вызовов, а также примитивы, которые не обязательно хорошо соответствуют ClickHouse. Однако эти издержки, как правило, приемлемы в сценариях, когда инструментам необходимо подключаться к нескольким базам данных.

Кроме того, этот клиент поддерживает использование HTTP в качестве транспортного уровня — данные по‑прежнему будут кодироваться в нативном формате для оптимальной производительности.

Далее повторяется структура документации по ClickHouse API.

Полные примеры кода для стандартного API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).

### Подключение {#connecting-1}

Подключение может быть выполнено либо с помощью DSN-строки формата `clickhouse://<host>:<port>?<query_option>=<value>` и метода `Open`, либо с помощью метода `clickhouse.OpenDB`. Последний не является частью спецификации `database/sql`, но возвращает экземпляр `sql.DB`. Этот метод предоставляет такие возможности, как профилирование, для которых в спецификации `database/sql` нет очевидного способа реализации.

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

**Во всех последующих примерах, если явно не указано иное, предполагается, что соединение с ClickHouse в переменной `conn` уже установлено и доступно.**


#### Настройки подключения {#connection-settings-1}

В строку DSN можно передать следующие параметры:

* `hosts` - список хостов (одиночных адресов), разделённых запятыми, для балансировки нагрузки и отказоустойчивости — см. [Connecting to Multiple Nodes](#connecting-to-multiple-nodes).
* `username/password` - учётные данные для аутентификации — см. [Authentication](#authentication)
* `database` - выбор текущей базы данных по умолчанию
* `dial_timeout` - строка длительности — это, возможно, со знаком последовательность десятичных чисел, каждое с необязательной дробной частью и суффиксом единицы измерения, таким как `300ms`, `1s`. Допустимые единицы времени: `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (по умолчанию `random`) — см. [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)
  * `round_robin` - выбор сервера по круговому алгоритму из набора
  * `in_order` - выбирается первый «живой» сервер в указанном порядке
* `debug` - включает вывод отладочной информации (логическое значение)
* `compress` - указывает алгоритм сжатия — `none` (по умолчанию), `zstd`, `lz4`, `gzip`, `deflate`, `br`. Если задано значение `true`, будет использоваться `lz4`. Для нативного протокола поддерживаются только `lz4` и `zstd`.
* `compress_level` - уровень сжатия (по умолчанию `0`). См. Compression. Значение зависит от алгоритма:
  * `gzip` - от `-2` (лучшая скорость) до `9` (лучшее сжатие)
  * `deflate` - от `-2` (лучшая скорость) до `9` (лучшее сжатие)
  * `br` - от `0` (лучшая скорость) до `11` (лучшее сжатие)
  * `zstd`, `lz4` - игнорируется
* `secure` - устанавливает защищённое SSL‑подключение (по умолчанию `false`)
* `skip_verify` - пропускает проверку сертификата (по умолчанию `false`)
* `block_buffer_size` - позволяет управлять размером буфера блока. См. [`BlockBufferSize`](#connection-settings). (по умолчанию `2`)

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


#### Пул подключений {#connection-pooling-1}

Пользователи могут влиять на использование предоставленного списка адресов узлов, как описано в разделе [Подключение к нескольким узлам](#connecting-to-multiple-nodes). Однако управление подключениями и пулом подключений по задумке делегируются `sql.DB`.

#### Подключение по HTTP {#connecting-over-http}

По умолчанию подключения устанавливаются по нативному протоколу. Если требуется использовать HTTP, его можно включить, либо указав протокол HTTP в DSN, либо задав параметр Protocol в настройках подключения.

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

Если вы используете `OpenDB`, можно подключаться к нескольким хостам, используя тот же подход к настройке опций, что и для ClickHouse API, при необходимости указывая `ConnOpenStrategy`.

Для подключений, использующих DSN, строка подключения поддерживает указание нескольких хостов и параметра `connection_open_strategy`, которому можно задать значение `round_robin` или `in_order`.

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

Если используется строка подключения DSN, SSL можно включить с помощью параметра `secure=true`. Метод `OpenDB` использует тот же подход, что и [нативный API TLS](#using-tls), полагаясь на указание структуры TLS, отличной от nil. Хотя строка подключения DSN поддерживает параметр `skip_verify` для пропуска проверки SSL, для более сложных конфигураций TLS необходим метод `OpenDB`, так как он позволяет передавать собственную конфигурацию.

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

При использовании `OpenDB` информацию для аутентификации можно передать через стандартные опции. Для подключений на основе DSN имя пользователя и пароль могут быть переданы в строке подключения — либо как параметры, либо как учетные данные, закодированные в адресе.

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


### Выполнение {#execution-1}

После установления соединения пользователи могут выполнять SQL-операторы с помощью метода `Exec`.

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

Этот метод не поддерживает передачу контекста — по умолчанию он выполняется с фоновым контекстом. При необходимости используйте `ExecContext` — см. раздел [Использование контекста](#using-context).


### Пакетная вставка {#batch-insert-1}

Семантику пакетной вставки можно реализовать, создав `sql.Tx` с помощью метода `Begin`. После этого можно подготовить пакет, вызвав метод `Prepare` с оператором `INSERT`. Он вернёт объект `sql.Stmt`, в который можно добавлять строки методом `Exec`. Пакет будет накапливаться в памяти до тех пор, пока для исходного `sql.Tx` не будет выполнен `Commit`.

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


### Запрос строк/строки {#querying-rows-1}

Запрос одной строки можно выполнить с помощью метода `QueryRow`. Он возвращает `*sql.Row`, для которого можно вызвать `Scan` с указателями на переменные, в которые должны быть считаны значения столбцов. Вариант `QueryRowContext` позволяет передать контекст, отличный от фонового контекста — см. [Использование контекста](#using-context).

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

Для итерации по нескольким строкам используется метод `Query`. Он возвращает структуру `*sql.Rows`, у которой можно вызывать `Next` для обхода строк. Эквивалент `QueryContext` позволяет передавать контекст.

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

Асинхронные вставки можно выполнять через метод `ExecContext`. Ему следует передать контекст с включённым асинхронным режимом, как показано ниже. Это позволяет пользователю указать, должен ли клиент ждать завершения вставки на сервере или вернуть ответ сразу после получения данных. Тем самым фактически управляется параметр [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert).

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
        )`, i, "Драйвер базы данных SQL для Golang"))
        if err != nil {
            return err
        }
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### Колонночная вставка {#columnar-insert-1}

Не поддерживается при использовании стандартного интерфейса.

### Использование структур {#using-structs-1}

Не поддерживается через стандартный интерфейс.

### Преобразования типов {#type-conversions-1}

Стандартный интерфейс `database/sql` должен поддерживать те же типы, что и [ClickHouse API](#type-conversions). Существует несколько исключений, в основном для сложных типов, которые описаны ниже. Как и ClickHouse API, клиент стремится быть максимально гибким при приёме различных типов как для вставки, так и для маршалинга ответов. Дополнительные сведения см. в разделе [Преобразования типов](#type-conversions).

### Сложные типы {#complex-types-1}

Если не указано иное, обработка сложных типов должна выполняться так же, как в [ClickHouse API](#complex-types). Отличия вызваны особенностями внутренней реализации `database/sql`.

#### Карты {#maps}

В отличие от ClickHouse API, стандартный API требует, чтобы карты имели строго заданный тип при сканировании (scan type). Например, нельзя передать `map[string]interface{}` для поля типа `Map(String,String)` — вместо этого необходимо использовать `map[string]string`. Переменная типа `interface{}` всегда будет совместима и может использоваться для более сложных структур. Структуры (struct) не поддерживаются при чтении.

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

Поведение операции вставки такое же, как у API ClickHouse.


### Сжатие {#compression-1}

Стандартный API поддерживает те же алгоритмы сжатия, что и нативный [ClickHouse API](#compression), т.е. сжатие `lz4` и `zstd` на уровне блоков. Дополнительно для HTTP‑соединений поддерживаются gzip, deflate и br. Если любой из них включён, сжатие выполняется для блоков при вставке и в ответах на запросы. Остальные запросы, например ping или запросы на выполнение, останутся несжатыми. Это соответствует опциям `lz4` и `zstd`.

Если для установления соединения используется метод `OpenDB`, можно передать конфигурацию `Compression`. В неё входит возможность указать уровень сжатия (см. ниже). При подключении через `sql.Open` с использованием DSN используйте параметр `compress`. Он может задаваться либо конкретным алгоритмом сжатия, т.е. `gzip`, `deflate`, `br`, `zstd` или `lz4`, либо логическим флагом. Если установлено значение true, будет использован `lz4`. Значение по умолчанию — `none`, т.е. сжатие отключено.

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

Уровень сжатия можно задать параметром DSN compress&#95;level или полем Level в опции Compression. По умолчанию используется значение 0, но конкретные диапазоны зависят от алгоритма:

* `gzip` — от `-2` (лучшая скорость) до `9` (лучшее сжатие)
* `deflate` — от `-2` (лучшая скорость) до `9` (лучшее сжатие)
* `br` — от `0` (лучшая скорость) до `11` (лучшее сжатие)
* `zstd`, `lz4` — игнорируется


### Привязка параметров {#parameter-binding-1}

Стандартный API поддерживает те же возможности привязки параметров, что и [ClickHouse API](#parameter-binding), позволяя передавать параметры в методы `Exec`, `Query` и `QueryRow` (и их эквивалентные варианты с [Context](#using-context)). Поддерживаются позиционные, именованные и нумерованные параметры.

```go
var count uint64
// позиционное связывание
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Количество при позиционном связывании: %d\n", count)
// числовое связывание
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Количество при числовом связывании: %d\n", count)
// именованное связывание
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Количество при именованном связывании: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

Имейте в виду, что [особые случаи](#special-cases) по-прежнему актуальны.


### Использование контекста {#using-context-1}

Стандартный API поддерживает такую же возможность передавать дедлайны, сигналы отмены и другие значения, относящиеся к запросу, через контекст, как и [ClickHouse API](#using-context). В отличие от ClickHouse API, это реализовано за счет использования вариантов методов с `Context`, то есть методы, такие как `Exec`, которые по умолчанию используют фоновый контекст, имеют вариант `ExecContext`, которому контекст может быть передан в качестве первого параметра. Это позволяет передавать контекст на любом этапе выполнения приложения. Например, пользователи могут передавать контекст при установлении соединения через `ConnContext` или при запросе строки результата запроса через `QueryRowContext`. Примеры всех доступных методов приведены ниже.

Для получения более подробной информации об использовании контекста для передачи дедлайнов, сигналов отмены, идентификаторов запросов, ключей квот и настроек соединения см. раздел «Using context» для [ClickHouse API](#using-context).

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

// запросы можно отменить через контекст
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("ожидалась отмена")
}

// установка крайнего срока для запроса — запрос будет отменён после достижения указанного времени. Завершается только соединение,
// запросы продолжат выполняться в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("ожидалось превышение крайнего срока")
}

// установка идентификатора запроса для трассировки запросов в логах, например, см. system.query_log
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
// установка ключа квоты — сначала создайте квоту
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// запросы можно отменить через контекст
ctx, cancel = context.WithCancel(context.Background())
// получим несколько результатов до отмены
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
            fmt.Println("ожидалась отмена")
            return nil
        }
        return err
    }
    fmt.Printf("строка: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
```

[Полный пример кода](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)


### Сессии {#sessions}

Если в нативных соединениях сессия присутствует изначально, то при соединениях по HTTP пользователю нужно явно задать идентификатор сессии, передавая его в настройках контекста. Это позволяет использовать такие функции, как временные таблицы, которые привязаны к сессии.

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
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)


### Динамическое сканирование {#dynamic-scanning-1}

Аналогично [ClickHouse API](#dynamic-scanning), доступна информация о типах столбцов, что позволяет пользователям создавать в рантайме экземпляры переменных с корректными типами, которые можно передавать в `Scan`. Это позволяет читать столбцы, тип которых заранее неизвестен.

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

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse с помощью запроса `SELECT`. Эти данные помещаются во временную таблицу и могут использоваться в самом запросе для обработки.

Чтобы отправить внешние данные клиенту в составе запроса, пользователь должен сформировать внешнюю таблицу через `ext.NewTable` перед тем, как передать её в контексте.

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

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть нативного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context для этого. При использовании HTTP в качестве транспорта это не поддерживается.

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


## Рекомендации по производительности {#performance-tips}

* По возможности используйте ClickHouse API, особенно для примитивных типов. Это позволяет избежать значительных накладных расходов на рефлексию и дополнительные уровни косвенных обращений.
* При чтении больших наборов данных рассмотрите возможность изменения [`BlockBufferSize`](#connection-settings). Это увеличит потребление памяти, но позволит декодировать больше блоков параллельно при итерации по строкам. Значение по умолчанию 2 является консервативным и минимизирует накладные расходы по памяти. Более высокие значения приведут к большему количеству блоков в памяти. Это требует тестирования, поскольку разные запросы могут создавать блоки разного размера. Поэтому параметр может быть установлен на [уровне запроса](#using-context) через Context.
* Будьте точны с типами при вставке данных. Хотя клиент стремится быть гибким, например, позволяя разбирать строки как UUID или IP, это требует проверки данных и увеличивает затраты на вставку.
* По возможности используйте вставки в столбцовом формате. При этом типы должны быть строго заданы, чтобы избежать необходимости конвертации значений на стороне клиента.
* Следуйте [рекомендациям](/sql-reference/statements/insert-into/#performance-considerations) ClickHouse для оптимальной производительности вставки.