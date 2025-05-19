---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'Клиенты Go для ClickHouse позволяют пользователям подключаться к ClickHouse, используя как стандартный интерфейс базы данных/sql, так и оптимизированный нативный интерфейс.'
title: 'ClickHouse Go'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';

# ClickHouse Go
## Простой пример {#a-simple-example}

Давайте начнем с простого примера. Этот код подключится к ClickHouse и выполнит выборку из системной базы данных. Чтобы начать, вам понадобятся ваши данные для подключения.
### Данные для подключения {#connection-details}

<ConnectionDetails />
### Инициализация модуля {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### Скопируйте пример кода {#copy-in-some-sample-code}

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
                        fmt.Printf("Исключение [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
                }
                return nil, err
        }
        return conn, nil
}
```
### Запустите go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```
### Установите свои данные для подключения {#set-your-connection-details}
Ранее вы узнали свои данные для подключения. Установите их в `main.go` в функции `connect()`:

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
### Запустите пример {#run-the-example}
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
### Узнать больше {#learn-more}
Остальная часть документации в этой категории охватывает детали клиента ClickHouse для Go.
## Клиент ClickHouse Go {#clickhouse-go-client}

ClickHouse поддерживает два официальных клиента Go. Эти клиенты дополняют друг друга и намеренно поддерживают разные сценарии использования.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - клиент на высоком уровне, который поддерживает как стандартный интерфейс базы данных/sql, так и нативный интерфейс.
* [ch-go](https://github.com/ClickHouse/ch-go) - клиент низкого уровня. Только нативный интерфейс.

clickhouse-go предоставляет интерфейс высокого уровня, позволяя пользователям выполнять запросы и вставлять данные, используя ориентированную на строки семантику и пакетирование, которые допускают гибкость в отношении типов данных - значения будут преобразованы при условии, что возможные потери точности не произойдут. ch-go, в свою очередь, предлагает оптимизированный ориентированный на столбцы интерфейс, который обеспечивает быструю потоковую передачу блоков данных с низкими накладными расходами на ЦП и память за счет строгости типов и более сложного использования.

Начиная с версии 2.3, clickhouse-go использует ch-go для низкоуровневых функций, таких как кодирование, декодирование и сжатие. Обратите внимание, что clickhouse-go также поддерживает стандартный интерфейс Go `database/sql`. Оба клиента используют нативный формат для своего кодирования, чтобы обеспечить оптимальную производительность и могут общаться по нативному протоколу ClickHouse. clickhouse-go также поддерживает HTTP в качестве своего транспортного механизма для случаев, когда пользователи требуют проксирования или балансировки нагрузки.

При выборе библиотеки клиента пользователи должны быть осведомлены о их соответствующих преимуществах и недостатках - см. Выбор библиотеки клиента.

|               | Нативный формат | Нативный протокол | HTTP протокол | Ориентированный на строки API | Ориентированный на столбцы API | Гибкость типов | Сжатие | Заполнитель запросов |
|:-------------:|:---------------:|:------------------:|:-------------:|:-----------------------------:|:-------------------------------:|:--------------:|:-------:|:--------------------:|
| clickhouse-go |       ✅        |         ✅          |       ✅      |             ✅                |             ✅                  |       ✅       |    ✅   |         ✅           |
|     ch-go     |       ✅        |         ✅          |               |                             |            ✅                   |                |    ✅   |                      |
## Выбор клиента {#choosing-a-client}

Выбор библиотеки клиента зависит от ваших паттернов использования и необходимости в оптимальной производительности. Для случаев с высокой нагрузкой на вставку, когда требуется миллионы вставок в секунду, мы рекомендуем использовать клиент низкого уровня [ch-go](https://github.com/ClickHouse/ch-go). Этот клиент избегает связанных накладных расходов на преобразование данных из формата, ориентированного на строки, в столбцы, как это требуется нативным форматом ClickHouse. Более того, он избегает любых отражений или использования типа `interface{}` (`any`), чтобы упростить использование.

Для рабочих нагрузок запросов, сосредоточенных на агрегациях или на вставках с низким пропуском, [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) предоставляет знакомый интерфейс `database/sql` и более прямолинейную семантику строк. Пользователи также могут использовать HTTP в качестве транспортного протокола и воспользоваться вспомогательными функциями для преобразования строк в структуры и обратно.
## Клиент clickhouse-go {#the-clickhouse-go-client}

Клиент clickhouse-go предоставляет два API интерфейса для общения с ClickHouse:

* Специфический API клиента ClickHouse
* Стандартный `database/sql` - универсальный интерфейс для SQL баз данных, предоставляемый Golang.

В то время как `database/sql` предоставляет независимый от базы данных интерфейс, позволяющий разработчикам абстрагировать свое хранилище данных, он накладывает некоторые типовые ограничения и семантику запросов, которые влияют на производительность. По этой причине следует использовать специфический API клиента, когда [производительность важна](https://github.com/clickHouse/clickHouse-go#benchmark). Однако пользователи, которые хотят интегрировать ClickHouse в инструменты, которые поддерживают несколько баз данных, могут предпочесть использовать стандартный интерфейс.

Оба интерфейса кодируют данные с использованием [нативного формата](/native-protocol/basics.md) и нативного протокола для связи. Кроме того, стандартный интерфейс поддерживает общение по HTTP.

|                    | Нативный формат | Нативный протокол | HTTP протокол | Поддержка массовой записи | Преобразование структур | Сжатие | Заполнитель запросов |
|:------------------:|:---------------:|:------------------:|:-------------:|:--------------------------:|:----------------------:|:-------:|:--------------------:|
|   API ClickHouse    |       ✅       |         ✅          |               |            ✅              |          ✅            |    ✅   |         ✅           |
| `database/sql` API  |       ✅       |         ✅          |       ✅      |            ✅              |                        |    ✅   |         ✅           |
## Установка {#installation}

v1 драйвера устарел и не будет получать обновления функций или поддержку новых типов ClickHouse. Пользователям рекомендуется перейти на v2, который предлагает более высокую производительность.

Чтобы установить версию 2.x клиента, добавьте пакет в ваш файл go.mod:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Или клонируйте репозиторий:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

Чтобы установить другую версию, соответственно измените путь или имя ветки.

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

Клиент выпускается независимо от ClickHouse. Версия 2.x представляет собой текущую основную версию, находящуюся в разработке. Все версии 2.x должны быть совместимы друг с другом.
#### Совместимость с ClickHouse {#clickhouse-compatibility}

Клиент поддерживает:

- Все текущие поддерживаемые версии ClickHouse, зарегистрированные [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). Поскольку версии ClickHouse больше не поддерживаются, они также больше не проходят активное тестирование с клиентскими релизами.
- Все версии ClickHouse в течение 2 лет с даты выпуска клиента. Обратите внимание, что только LTS версии проходят активное тестирование.
#### Совместимость с Golang {#golang-compatibility}

| Версия клиента | Версии Golang |
|:--------------:|:-------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## API клиента ClickHouse {#clickhouse-client-api}

Все примеры кода для API клиента ClickHouse можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).
### Подключение {#connecting}

Следующий пример, который возвращает версию сервера, демонстрирует подключение к ClickHouse - предполагая, что ClickHouse не защищен и доступен с использованием учетной записи по умолчанию.

Обратите внимание, что мы используем стандартный нативный порт для подключения.

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

**Во всех последующих примерах, если не указано иное, мы предполагаем, что используется переменная ClickHouse `conn`, которая была создана и доступна.**
#### Настройки подключения {#connection-settings}

При открытии соединения можно использовать структуру Options для управления поведением клиента. Доступны следующие настройки:

* `Protocol` - либо Нативный, либо HTTP. HTTP в настоящее время поддерживается только для [API database/sql](#databasesql-api).
* `TLS` - параметры TLS. Ненулевое значение включает TLS. См. [Использование TLS](#using-tls).
* `Addr` - срез адресов, включая порт.
* `Auth` - данные для аутентификации. См. [Аутентификация](#authentication).
* `DialContext` - пользовательская функция набора для определения, как устанавливаются соединения.
* `Debug` - true/false для включения отладки.
* `Debugf` - предоставляет функцию для потребления отладочных данных. Требует включить `debug`.
* `Settings` - карта настроек ClickHouse. Эти настройки будут применены ко всем запросам ClickHouse. [Использование контекста](#using-context) позволяет устанавливать настройки для каждого запроса.
* `Compression` - включить сжатие для блоков. См. [Сжатие](#compression).
* `DialTimeout` - максимальное время для установления соединения. По умолчанию `1s`.
* `MaxOpenConns` - максимальное количество соединений для использования в любой момент времени. Большее или меньшее количество соединений может находиться в резерве, но только это число может использоваться в любой момент времени. По умолчанию `MaxIdleConns+5`.
* `MaxIdleConns` - количество соединений, которое следует поддерживать в пуле. Соединения будут повторно использоваться, если это возможно. По умолчанию `5`.
* `ConnMaxLifetime` - максимальный срок для поддержания соединения. По умолчанию 1 час. Соединения уничтожаются после этого времени, новые соединения добавляются в пул по мере необходимости.
* `ConnOpenStrategy` - определяет, как список адресов узлов должен использоваться при установлении соединений. См. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `BlockBufferSize` - максимальное количество блоков, которые можно декодировать в буфер за раз. Более крупные значения увеличат параллелизацию за счет использования памяти. Размеры блоков зависят от запроса, поэтому, хотя вы можете установить это для соединения, мы рекомендуем переопределять для каждого запроса в зависимости от возвращаемых данных. По умолчанию `2`.

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
#### Пул соединений {#connection-pooling}

Клиент поддерживает пул соединений, повторно используя их для запросов по мере необходимости. В любом случае будут использоваться только `MaxOpenConns`, максимальный размер пула контролируется `MaxIdleConns`. Клиент будет получать соединение из пула для выполнения каждого запроса, возвращая его в пул для повторного использования. Соединение используется на протяжении всего жизненного цикла партии и освобождается при `Send()`.

Нет гарантии, что одно и то же соединение в пуле будет использоваться для последующих запросов, если пользователь не установит `MaxOpenConns=1`. Это редко необходимо, но может потребоваться в случаях, когда пользователи используют временные таблицы.

Обратите внимание, что `ConnMaxLifetime` по умолчанию составляет 1 час. Это может привести к случаям, когда нагрузка на ClickHouse может стать несбалансированной, если узлы выйдут из кластера. Это может произойти, когда узел становится недоступным, соединения будут балансироваться к другим узлам. Эти соединения будут сохраняться и не обновляться в течение 1 часа по умолчанию, даже если проблемный узел возвращается в кластер. Рассмотрите возможность снижения этого значения в случаях с высокой нагрузкой.
### Использование TLS {#using-tls}

На низком уровне все методы подключения клиента (`DSN/OpenDB/Open`) будут использовать [пакет tls Go](https://pkg.go.dev/crypto/tls) для установления безопасного соединения. Клиент знает, что необходимо использовать TLS, если структура Options содержит ненулевой указатель на `tls.Config`.

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

Этот минимальный `TLS.Config` обычно достаточен для подключения к защищенному нативному порту (обычно 9440) на сервере ClickHouse. Если на сервере ClickHouse нет действительного сертификата (истек срок действия, неправильное имя хоста, не подписан признанным корневым удостоверяющим центром), `InsecureSkipVerify` может быть true, но это настоятельно не рекомендуется.

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

Если необходимы дополнительные параметры TLS, код приложения должен установить необходимые поля в структуре `tls.Config`. Это может включать конкретные наборы шифров, принудительное использование определенной версии TLS (например, 1.2 или 1.3), добавление внутренней цепочки сертификатов CA, добавление клиентского сертификата (и закрытого ключа), если это требуется сервером ClickHouse, и большинство других опций, которые применяются к более специализированной конфигурации безопасности.
### Аутентификация {#authentication}

Укажите структуру Auth в данных подключения, чтобы задать имя пользователя и пароль.

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

Несколько адресов можно указать через структуру `Addr`.

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


Две стратегии подключения доступны:

* `ConnOpenInOrder` (по умолчанию) - адреса используются по порядку. Поздние адреса используются только в случае неудачи при попытке подключения по ранним адресам из списка. Это фактически стратегия резервирования.
* `ConnOpenRoundRobin` - Нагрузка балансируется по адресам с использованием стратегии кругового распределения.

Это можно управлять с помощью опции `ConnOpenStrategy`

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

Произвольные операторы могут быть выполнены с помощью метода `Exec`. Это полезно для DDL и простых операторов. Его не следует использовать для крупных вставок или итераций запросов.

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


Обратите внимание на возможность передать контекст в запрос. Это может быть использовано для передачи определенных настроек на уровне запроса - см. [Использование контекста](#using-context).
### Пакетная вставка {#batch-insert}

Для вставки большого количества строк клиент предоставляет семантику пакетной вставки. Это требует подготовки пакета, к которому могут быть добавлены строки. Этот пакет в конечном итоге отправляется через метод `Send()`. Пакеты будут находиться в памяти до момента выполнения Send.

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

Рекомендации для ClickHouse применимы [здесь](/guides/inserting-data#best-practices-for-inserts). Пакеты не должны использоваться между горутинами - создавайте отдельный пакет для каждой рутины.

Из приведенного выше примера обратите внимание на необходимость, чтобы типы переменных соответствовали типу столбца при добавлении строк. Хотя отображение обычно очевидно, этот интерфейс старается быть гибким, и типы будут преобразованы при условии, что потерь точности не будет. Например, следующее демонстрирует вставку строки в datetime64.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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


Для полного свода поддерживаемых типов go для каждого типа столбца смотрите [Преобразования типов](#type-conversions).
### Запрос строк {#querying-rows}


Пользователи могут либо запрашивать одну строку с помощью метода `QueryRow`, либо получать курсор для итерации по набору результатов через `Query`. В то время как первый принимает назначение для данных, чтобы их сериализовать, последний требует вызова `Scan` для каждой строки.

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

Обратите внимание, что в обоих случаях нам необходимо передать указатель на переменные, в которые мы хотим сериализовать соответствующие значения столбцов. Эти переменные должны передаваться в указанном порядке в операторе `SELECT` - по умолчанию будет использоваться порядок объявления столбцов в случае `SELECT *`, как показано выше.

Аналогично вставке, метод Scan требует, чтобы целевые переменные имели соответствующий тип. Это снова пытается быть гибким, с преобразованием типов, где это возможно, при условии, что потерь точности не может произойти, например, в приведенном выше примере столбец UUID считывается в строковую переменную. Для полного списка поддерживаемых типов go для каждого типа столбца смотрите [Преобразования типов](#type-conversions).

Наконец, обратите внимание на возможность передать `Context` в методы `Query` и `QueryRow`. Это можно использовать для настройки уровня запроса - см. [Использование контекста](#using-context) для получения дополнительной информации.
### Асинхронная вставка {#async-insert}

Асинхронные вставки поддерживаются с помощью метода Async. Это позволяет пользователю указать, должен ли клиент ожидать завершения вставки сервером или ответить, как только данные будут получены. Это фактически контролирует параметр [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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
### Вставка в столбцовом формате {#columnar-insert}

Вставки могут производиться в столбцовом формате. Это может обеспечить преимущества по производительности, если данные уже ориентированы в такой структуре, избегая необходимости преобразовывать в строки.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
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

Для пользователей структуры Golang предоставляют логическое представление строки данных в ClickHouse. Для этого нативный интерфейс предоставляет несколько удобных функций.
#### Выбор с сериализацией {#select-with-serialize}

Метод Select позволяет набору строк ответа быть сериализованным в срез структур с единой инвокацией.

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
#### Scan Struct {#scan-struct}

`ScanStruct` позволяет сериализовать одну строку из запроса в структуру.

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
#### Append Struct {#append-struct}

`AppendStruct` позволяет добавить структуру к существующему [батчу](#batch-insert) и интерпретировать ее как полную строку. Это требует, чтобы колонки структуры соответствовали по имени и типу таблице. Хотя все колонки должны иметь эквивалентное поле структуры, некоторые поля структуры могут не иметь эквивалентного представления в колонке. Эти поля просто будут проигнорированы.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Драйвер SQL базы данных на Golang",
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
### Преобразования типов {#type-conversions}

Клиент стремится быть как можно более гибким в отношении принятия переменных типов как для вставки, так и для сериализации ответов. В большинстве случаев для типа колонки ClickHouse существует эквивалентный тип Golang, например, [UInt64](/sql-reference/data-types/int-uint/) к [uint64](https://pkg.go.dev/builtin#uint64). Эти логические отображения всегда должны поддерживаться. Пользователи могут захотеть использовать переменные типы, которые могут быть вставлены в колонки или использоваться для получения ответа, если преобразование либо переменной, либо полученных данных произойдет сначала. Клиент стремится поддерживать эти преобразования прозрачно, так что пользователям не нужно преобразовывать свои данные для точного соответствия перед вставкой и предоставлять гибкую сериализацию во время запроса. Это прозрачное преобразование не позволяет терять точность. Например, uint32 не может использоваться для получения данных из колонки UInt64. Напротив, строка может быть вставлена в поле datetime64, при условии что она соответствует требованиям формата.

Текущие поддерживаемые преобразования типов для примитивных типов зафиксированы [здесь](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

Эта работа продолжается и может быть разделена на вставку (`Append`/`AppendRow`) и время чтения (через `Scan`). Если вам нужна поддержка конкретного преобразования, пожалуйста, создайте задачу.
### Сложные типы {#complex-types}
#### Типы Date/DateTime {#datedatetime-types}

Клиент ClickHouse для Go поддерживает типы даты/времени `Date`, `Date32`, `DateTime` и `DateTime64`. Даты могут быть вставлены как строка в формате `2006-01-02` или с использованием родного go `time.Time{}` или `sql.NullTime`. Дата и время также поддерживают последние типы, но требуют передачи строк в формате `2006-01-02 15:04:05` с необязательным смещением по времени, например, `2006-01-02 15:04:05 +08:00`. `time.Time{}` и `sql.NullTime` поддерживаются как при чтении, так и при любой реализации интерфейса `sql.Scanner`.

Обработка информации о часовом поясе зависит от типа ClickHouse и от того, вставляется ли значение или считывается:

* **DateTime/DateTime64**
    * Во **время вставки** значение отправляется в ClickHouse в формате временной метки UNIX. Если часовой пояс не указан, клиент будет предполагать локальный часовой пояс клиента. `time.Time{}` или `sql.NullTime` будут преобразованы в эпоху соответственно.
    * Во **время выборки** будет использоваться часовой пояс колонки, если он установлен, при возврате значения `time.Time`. Если нет, будет использоваться часовой пояс сервера.
* **Date/Date32**
    * Во **время вставки** часовой пояс любой даты учитывается при преобразовании даты в временную метку unix, т.е. он будет смещен по часовому поясу перед хранением как дата, поскольку типы Date не имеют локали в ClickHouse. Если это не указано в строковом значении, будет использоваться локальный часовой пояс.
    * Во **время выборки**, даты будут считаны в `time.Time{}` или возвращены экземпляры `sql.NullTime{}` без информации о часовом поясе.
#### Массив {#array}

Массивы должны быть вставлены как срезы. Правила типизации для элементов согласуются с таковыми для [примитивных типов](#type-conversions), т.е. при возможности элементы будут преобразованы.

Указатель на срез должен быть предоставлен во время сериализации.

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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

Maps должны быть вставлены как карты Golang с ключами и значениями, соответствующими правилам типов, определенным [ранее](#type-conversions).

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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

Кортежи представляют собой группу колонок произвольной длины. Колонки могут быть явно названы или только указывать тип, например:

```sql
// без названия
Col1 Tuple(String, Int64)

// с названием
Col2 Tuple(name String, id Int64, age uint8)
```

Из этих подходов именованные кортежи предлагают большую гибкость. В то время как безымянные кортежи должны быть вставлены и считаны с использованием срезов, именованные кортежи также совместимы с картами.

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
// как именованные, так и безымянные могут быть добавлены с помощью срезов. Обратите внимание, что мы можем использовать сильно типизированные списки и карты, если все элементы одного типа
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
// именованные кортежи могут быть извлечены в карту или срезы, безымянные только в срезы
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

Примечание: поддерживаются типизированные срезы и карты, при условии, что подколонки в именованном кортеже имеют все одинаковые типы.
#### Вложенные {#nested}

Вложенное поле эквивалентно массиву именованных кортежей. Использование зависит от того, установил ли пользователь [flatten_nested](/operations/settings/settings#flatten_nested) в 1 или 0.

Установив flatten_nested в 0, вложенные колонки остаются единым массивом кортежей. Это позволяет пользователям использовать срезы карт для вставки и извлечения и произвольные уровни вложенности. Ключ карты должен совпадать с названием колонки, как показано в примере ниже.

Примечание: поскольку карты представляют собой кортеж, они должны быть типа `map[string]interface{}`. Значения в настоящее время не имеют строгой типизации.

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

[Полный пример - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

Если используется значение по умолчанию 1 для `flatten_nested`, вложенные колонки упрощаются в отдельные массивы. Это требует использования вложенных срезов для вставки и извлечения. Хотя произвольные уровни вложенности могут работать, это официально не поддерживается.

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

[Полный пример - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)


Примечание: Вложенные колонки должны иметь одинаковые размеры. Например, в приведенном выше примере `Col_2_2` и `Col_2_1` должны иметь одинаковое количество элементов.

Из-за более простого интерфейса и официальной поддержки вложенности мы рекомендуем использовать `flatten_nested=0`.
#### Гео типы {#geo-types}

Клиент поддерживает гео типы Point, Ring, Polygon и Multi Polygon. Эти поля представлены в Golang с использованием пакета [github.com/paulmach/orb](https://github.com/paulmach/orb).

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

Тип UUID поддерживается пакетом [github.com/google/uuid](https://github.com/google/uuid). Пользователи также могут отправлять и сериализовывать UUID как строку или любой тип, который реализует `sql.Scanner` или `Stringify`.

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

Значение Nil в Go представляет ClickHouse NULL. Это может быть использовано, если поле объявлено Nullable. Во время вставки Nil может быть передан как для обычной, так и для Nullable версии колонки. Для первой будет сохранено значение по умолчанию для типа, например, пустая строка для строки. Для версии nullable будет сохранено значение NULL в ClickHouse.

Во время сериализации пользователь должен передать указатель на тип, который поддерживает nil, например, *string, чтобы представить значение nil для поля Nullable. В следующем примере col1, который является Nullable(String), получает **string. Это позволяет представить nil.

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

Клиент дополнительно поддерживает типы `sql.Null*`, например, `sql.NullInt64`. Эти типы совместимы с их эквивалентными типами ClickHouse.
#### Большие целые числа - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

Числовые типы больше 64 бит представляются с использованием родного пакета Go [big](https://pkg.go.dev/math/big).

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

Поддержка методов сжатия зависит от используемого протокола. Для родного протокола клиент поддерживает сжатие `LZ4` и `ZSTD`. Это происходит на уровне блоков. Сжатие может быть включено путем добавления конфигурации `Compression` с соединением.

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


Дополнительные методы сжатия доступны при использовании стандартного интерфейса через HTTP. См. [API database/sql - Сжатие](#compression) для получения дополнительной информации.
### Привязка параметров {#parameter-binding}

Клиент поддерживает привязку параметров для методов `Exec`, `Query` и `QueryRow`. Как показано в примере ниже, это поддерживается с помощью именованных, пронумерованных и позиционных параметров. Мы приводим примеры этих ниже.

```go
var count uint64
// позиционная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Позиционная привязка: count: %d\n", count)
// числовая привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Числовая привязка: count: %d\n", count)
// именованная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Именованная привязка: count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)
#### Специальные случаи {#special-cases}

По умолчанию срезы будут развернуты в список значений, разделенных запятыми, если переданы как параметр запроса. Если пользователи требуют набора значений, обернутых в `[ ]`, следует использовать `ArraySet`.

Если требуются группы/кортежи с оберткой `( )`, например, для использования с операторами IN, пользователи могут воспользоваться `GroupSet`. Это особенно полезно для случаев, когда требуется несколько групп, как показано в следующем примере.

Наконец, для полей DateTime64 требуется точность, чтобы гарантировать, что параметры отображаются должным образом. Уровень точности для поля неизвестен клиенту, однако пользователь должен его предоставить. Для облегчения этого мы предоставляем параметр `DateNamed`.

```go
var count uint64
// массивы будут развернуты
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество развернутого массива: %d\n", count)
// массивы будут сохранены с []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество массива: %d\n", count)
// Групповые наборы позволяют формировать списки ( )
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество групп: %d\n", count);
// Более полезно, когда нам нужно вложение
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество групп: %d\n", count);
// Используйте DateNamed, когда вам нужна точность во времени
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество NamedDate: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)
```yaml
title: 'Использование контекста'
sidebar_label: 'Использование контекста'
keywords: ['контекст', 'запросы', 'ClickHouse', 'аутентификация']
description: 'Информация об использовании контекстов в ClickHouse для управления настройками и сроками выполнения запросов.'
```

### Использование контекста {#using-context}

Контексты Go предоставляют возможность передачи дедлайнов, сигналов отмены и других значений, относящихся к запросу, через границы API. Все методы соединения принимают контекст в качестве своей первой переменной. Хотя в предыдущих примерах использовался `context.Background()`, пользователи могут использовать эту возможность для передачи настроек и дедлайнов, а также для отмены запросов.

Передача контекста, созданного с помощью `withDeadline`, позволяет установить ограничения по времени выполнения для запросов. Обратите внимание, что это абсолютное время, и истечение срока только освободит соединение и отправит сигнал отмены в ClickHouse. В качестве альтернативы можно использовать `WithCancel` для явной отмены запроса.

Помощники `clickhouse.WithQueryID` и `clickhouse.WithQuotaKey` позволяют указать id запроса и ключ квоты. Идентификаторы запросов могут быть полезны для отслеживания запросов в журналах и для целей отмены. Ключ квоты может использоваться для наложения ограничений на использование ClickHouse на основе уникального значения ключа - см. [Управление квотами](/operations/access-rights#quotas-management) для получения дополнительной информации.

Пользователи также могут использовать контекст, чтобы убедиться, что настройка применяется только для конкретного запроса, а не для всего соединения, как показано в [Настройки соединения](#connection-settings).

Наконец, пользователи могут контролировать размер буфера блока с помощью `clickhouse.WithBlockSize`. Это переопределяет настройку уровня соединения `BlockBufferSize` и контролирует максимальное количество блоков, которые декодируются и удерживаются в памяти в любое время. Более крупные значения могут означать большую параллелизацию за счет использования памяти.

Примеры выше показаны ниже.

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
// мы можем использовать контекст для передачи настроек конкретному API вызову
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// для создания колонки JSON нам нужно allow_experimental_object_type=1
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// запросы могут быть отменены с использованием контекста
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// установить дедлайн для запроса - это отменит запрос после достижения абсолютного времени.
// запросы продолжат выполнение в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeded")
}

// установить id запроса для помощи в отслеживании запросов в журналах, например, см. system.query_log
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
// установить ключ квоты - сначала создайте квоту
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

### Информация о прогрессе/профиле/журнале {#progressprofilelog-information}

Информация о прогрессе, профиле и журнале может запрашиваться по запросам. Информация о прогрессе будет сообщать статистику о количестве строк и байтов, которые были прочитаны и обработаны в ClickHouse. Напротив, информация о профиле предоставляет краткое резюме данных, возвращаемых клиенту, включая общие данные о байтах (не сжатых), строках и блоках. Наконец, информация журнала предоставляет статистику по потокам, например, использование памяти и скорость передачи данных.

Получение этой информации требует от пользователя использования [Контекста](#using-context), в который пользователь может передать функции обратного вызова.

```go
totalRows := uint64(0)
// используйте контекст для передачи функции обратного вызова для информации о прогрессе и профиле
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("прогресс: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("информация профиля: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("информация журнала: ", log)
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

Пользователям может потребоваться читать таблицы, для которых они не знают схему или тип полей, которые будут возвращены. Это распространено в случаях, когда выполняется спонтанный анализ данных или пишутся универсальные инструменты. Для достижения этого информация о типе колонки доступна в ответах запросов. Это можно использовать с помощью рефлексии Go для создания экземпляров переменных правильного типа во время выполнения, которые могут быть переданы в Scan.

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

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse с помощью запроса SELECT. Эти данные помещаются во временную таблицу и могут использоваться в самом запросе для оценки.

Чтобы отправить внешние данные клиенту с помощью запроса, пользователю необходимо построить внешнюю таблицу через `ext.NewTable`, прежде чем передать её через контекст.

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

### Open Telemetry {#open-telemetry}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть родного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Контекст для достижения этой цели.

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

Полные детали о том, как использовать трассировку, можно найти в разделе [Поддержка OpenTelemetry](/operations/opentelemetry/).

## Database/SQL API {#databasesql-api}

`database/sql` или "стандартный" API позволяет пользователям использовать клиент в сценариях, где код приложения должен быть независим от баз данных, использующихся, соблюдая стандартный интерфейс. Это связано с определенными затратами - дополнительными уровнями абстракций и примитивами, которые не обязательно совместимы с ClickHouse. Тем не менее, эти затраты обычно приемлемы в сценариях, когда инструменты должны подключаться к нескольким базам данных.

Кроме того, этот клиент поддерживает использование HTTP в качестве транспортного слоя - данные по-прежнему будут кодироваться в родном формате для оптимальной производительности.

Следующее стремится отразить структуру документации для API ClickHouse.

Полные примеры кода для стандартного API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).

### Подключение {#connecting-1}

Подключение можно осуществить либо через строку DSN формата `clickhouse://<host>:<port>?<query_option>=<value>` и метод `Open`, либо через метод `clickhouse.OpenDB`. Последний не является частью спецификации `database/sql`, но возвращает экземпляр `sql.DB`. Этот метод предоставляет функциональность, такую как профилирование, которую невозможно явно раскрыть через спецификацию `database/sql`.

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

**Для всех последующих примеров, если не указано иное, мы предполагаем использование переменной ClickHouse `conn`, которая была создана и доступна.**

#### Настройки соединения {#connection-settings-1}

Следующие параметры могут быть переданы в строке DSN:

* `hosts` - список адресов узлов, разделенных запятыми, для балансировки нагрузки и резервирования - см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `username/password` - учетные данные для аутентификации - см. [Аутентификация](#authentication)
* `database` - выбрать текущую базу данных по умолчанию
* `dial_timeout` - строка времени, представляющая собой возможно подписанную последовательность десятичных чисел, каждое с необязательной дробной частью и суффиксом единицы, таким как `300ms`, `1s`. Допустимые единицы времени: `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (по умолчанию `random`) - см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes)
    - `round_robin` - выбрать сервер по кругу из набора
    - `in_order` - в указанном порядке выбирается первый живой сервер
* `debug` - включить вывод отладки (логическое значение)
* `compress` - указать алгоритм сжатия - `none` (по умолчанию), `zstd`, `lz4`, `gzip`, `deflate`, `br`. Если установлено значение `true`, будет использовано `lz4`. Поддерживаются только `lz4` и `zstd` для нативной связи.
* `compress_level` - уровень сжатия (по умолчанию `0`). См. Сжатие. Это специфично для алгоритма:
    - `gzip` - `-2` (лучшая скорость) до `9` (лучшее сжатие)
    - `deflate` - `-2` (лучшая скорость) до `9` (лучшее сжатие)
    - `br` - `0` (лучшая скорость) до `11` (лучшее сжатие)
    - `zstd`, `lz4` - игнорируются
* `secure` - установить безопасное SSL-соединение (по умолчанию `false`)
* `skip_verify` - пропустить проверку сертификата (по умолчанию `false`)
* `block_buffer_size` - позволяет пользователям контролировать размер буфера блока. См. [`BlockBufferSize`](#connection-settings). (по умолчанию `2`)

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

Пользователи могут влиять на использование предоставленного списка адресов узлов, как описано в [Подключение к нескольким узлам](#connecting-to-multiple-nodes). Управление соединениями и пулами, однако, делегировано `sql.DB` по замыслу.

#### Подключение через HTTP {#connecting-over-http}

По умолчанию соединения устанавливаются через родной протокол. Для пользователей, нуждающихся в HTTP, это можно включить, либо изменив DSN для включения протокола HTTP, либо указав Протокол в параметрах подключения.

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

При использовании `OpenDB` подключитесь к нескольким узлам, используя тот же подход с параметрами, который используется для API ClickHouse - при желании укажите `ConnOpenStrategy`.

Для соединений по DSN строка принимает несколько узлов и параметр `connection_open_strategy`, для которого значение `round_robin` или `in_order` может быть установлено.

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

Если используется строка подключения DSN, SSL можно включить с помощью параметра "secure=true". Метод `OpenDB` использует тот же подход, что и [родной API для TLS](#using-tls), полагаясь на указание ненулевой структуры TLS. В то время как строка подключения DSN поддерживает параметр skip_verify для пропуска верификации SSL, метод `OpenDB` требуется для более сложных конфигураций TLS - поскольку он позволяет передавать конфигурацию.

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

Если используется `OpenDB`, информацию для аутентификации можно передать через обычные параметры. Для соединений, основанных на DSN, имя пользователя и пароль могут быть переданы в строке подключения - как параметры, так и учетные данные, закодированные в адресе.

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

После того как соединение было установлено, пользователи могут выдавать SQL операторы для выполнения через метод Exec.

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

Этот метод не поддерживает получение контекста - по умолчанию он выполняется с фоновым контекстом. Пользователи могут использовать `ExecContext`, если это необходимо - см. [Использование контекста](#using-context).

### Пакетная вставка {#batch-insert-1}

Пакетная семантика может быть достигнута путем создания `sql.Tx` через метод `Begin`. Из этого пакета можно получить с помощью метода `Prepare` с оператором `INSERT`. Это возвращает `sql.Stmt`, к которому строки можно добавлять с помощью метода `Exec`. Пакет будет накапливаться в памяти до тех пор, пока не будет выполнен `Commit` на исходном `sql.Tx`.

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

Запрос одной строки можно выполнить с помощью метода `QueryRow`. Этот метод возвращает `*sql.Row`, по которому можно вызвать Scan с указателями на переменные, в которые должны быть сериализованы колонки. Вариант `QueryRowContext` позволяет передавать контекст, отличный от фонового - см. [Использование контекста](#using-context).

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

Итерация нескольких строк требует метода `Query`. Этот метод возвращает `*sql.Rows`, по которому можно вызывать Next для итерации через строки. Эквивалент `QueryContext` позволяет передавать контекст.

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
    fmt.Printf("строка: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### Асинхронная вставка {#async-insert-1}

Асинхронные вставки могут быть выполнены путем выполнения вставки через метод `ExecContext`. Это должно быть передано с контекстом, в котором включен асинхронный режим, как показано ниже. Это позволяет пользователю указать, следует ли ожидать завершения операции вставки со стороны сервера или ответить сразу после получения данных. Это фактически контролирует параметр [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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

### Столбцовая вставка {#columnar-insert-1}

Не поддерживается с использованием стандартного интерфейса.

### Использование структур {#using-structs-1}

Не поддерживается с использованием стандартного интерфейса.

### Преобразования типов {#type-conversions-1}

Стандартный интерфейс `database/sql` должен поддерживать те же типы, что и [API ClickHouse](#type-conversions). Есть несколько исключений, в основном для сложных типов, которые мы документируем ниже. Подобно API ClickHouse, клиент стремится быть максимально гибким в отношении принятия переменных типов как для вставки, так и для сериализации ответов. См. [Преобразования типов](#type-conversions) для получения дополнительной информации.

### Сложные типы {#complex-types-1}

Если не указано обратное, обработка сложных типов должна быть аналогичной [API ClickHouse](#complex-types). Отличия являются следствием внутренней структуры `database/sql`.

#### Карты {#maps}

В отличие от API ClickHouse, стандартный API требует, чтобы карты были строго типизированы по типу сканирования. Например, пользователи не могут передавать `map[string]interface{}` для поля `Map(String,String)` и должны вместо этого использовать `map[string]string`. Переменная `interface{}` всегда будет совместима и может использоваться для более сложных структур. Структуры не поддерживаются во время чтения.

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

В поведении вставки аналогично API ClickHouse.

```yaml
title: 'Сжатие'
sidebar_label: 'Сжатие'
keywords: ['сжатие', 'компрессия', 'ClickHouse']
description: 'Поддержка алгоритмов сжатия в ClickHouse.'
```

### Сжатие {#compression-1}

Стандартный API поддерживает те же алгоритмы сжатия, что и родной [ClickHouse API](#compression), то есть сжатие `lz4` и `zstd` на уровне блока. Кроме того, поддерживаются сжатия gzip, deflate и br для HTTP-соединений. Если любой из этих методов включен, сжатие выполняется на блоках во время вставки и для ответов на запросы. Другие запросы, например, пинги или запросы, останутся несжатыми. Это согласуется с параметрами `lz4` и `zstd`.

Если используется метод `OpenDB` для установления соединения, можно передать конфигурацию сжатия. Это включает возможность указать уровень сжатия (см. ниже). Если подключение осуществляется через `sql.Open` с DSN, используйте параметр `compress`. Это может быть либо конкретный алгоритм сжатия, то есть `gzip`, `deflate`, `br`, `zstd` или `lz4`, либо логический флаг. Если установлен в true, будет использован `lz4`. Значение по умолчанию — `none`, то есть сжатие отключено.

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

Уровень применяемого сжатия можно контролировать с помощью параметра DSN `compress_level` или поля `Level` опции `Compression`. Значение по умолчанию — 0, но оно зависит от алгоритма:

* `gzip` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
* `deflate` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
* `br` - `0` (Лучшая скорость) до `11` (Лучшее сжатие)
* `zstd`, `lz4` - игнорируются

### Привязка параметров {#parameter-binding-1}

Стандартный API поддерживает те же возможности привязки параметров, что и [ClickHouse API](#parameter-binding), позволяя передавать параметры в методы `Exec`, `Query` и `QueryRow` (а также их эквиваленты [Context](#using-context)). Поддерживаются позиционные, именованные и нумерованные параметры.

```go
var count uint64
// позиционная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Позиционная привязка count: %d\n", count)
// числовая привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Числовая привязка count: %d\n", count)
// именованная привязка
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Именованная привязка count: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

Обратите внимание, что [особые случаи](#special-cases) все еще применимы.

### Использование контекста {#using-context-1}

Стандартный API поддерживает возможность передачи сроков, сигналов отмены и других значений, связанных с запросами, через контекст так же, как и [ClickHouse API](#using-context). В отличие от ClickHouse API, это достигается с помощью вариантов методов `Context`, то есть методов, таких как `Exec`, которые по умолчанию используют фоновый контекст, имеют вариант `ExecContext`, в который можно передать контекст в качестве первого параметра. Это позволяет передавать контекст на любом этапе потока приложения. Например, пользователи могут передавать контекст при установлении соединения через `ConnContext` или при запросе строки через `QueryRowContext`. Примеры всех доступных методов показаны ниже.

Для получения более подробной информации о том, как использовать контекст для передачи сроков, сигналов отмены, идентификаторов запросов, ключей квот и настроек соединения, смотрите раздел Использование контекста в [ClickHouse API](#using-context).

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// чтобы создать JSON колонку, нам нужен allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// запросы могут быть отменены с использованием контекста
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("ожидалось отмена")
}

// установить срок для запроса - это аннулирует запрос после достижения абсолютного времени. Снова завершает соединение только,
// запросы будут продолжаться до завершения в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("ожидалось превышение срока")
}

// установить идентификатор запроса для помощи в трассировке запросов в журналах, например, см. system.query_log
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
// установить ключ квоты - сначала создать квоту
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// запросы могут быть отменены с использованием контекста
ctx, cancel = context.WithCancel(context.Background())
// мы получим некоторые результаты перед отменой
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
    fmt.Printf("row: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### Сессии {#sessions}

Хотя родные соединения по своей сути имеют сессию, соединения по HTTP требуют от пользователя создания идентификатора сессии для передачи в контексте в качестве настройки. Это позволяет использовать возможности, например, временные таблицы, которые связаны с сессией.

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

Аналогично [ClickHouse API](#dynamic-scanning), информация о типах столбцов доступна для того, чтобы пользователи могли создавать экземпляры переменных правильного типа во время выполнения, которые могут быть переданы в `Scan`. Это позволяет считывать столбцы, где тип не известен.

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

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse с помощью запроса `SELECT`. Эти данные помещаются во временную таблицу и могут использоваться в самом запросе для оценки.

Чтобы отправить внешние данные клиенту с помощью запроса, пользователь должен создать внешнюю таблицу через `ext.NewTable` перед передачей ее через контекст.

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

### Open Telemetry {#open-telemetry-1}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) в качестве части родного протокола. Клиент позволяет создать `Span` с помощью функции `clickhouse.withSpan` и передать его через контекст для достижения этого. Это не поддерживается, когда в качестве транспорта используется HTTP.

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

* Используйте ClickHouse API, где это возможно, особенно для примитивных типов. Это избегает значительного отражения и косвенности.
* Если вы читаете большие наборы данных, рассмотрите возможность изменения [`BlockBufferSize`](#connection-settings). Это увеличит объем используемой памяти, но позволит декодировать больше блоков параллельно во время итерации по строкам. Значение по умолчанию — 2, что консервативно и минимизирует накладные расходы по памяти. Более высокие значения приведут к большему количеству блоков в памяти. Это требует тестирования, так как разные запросы могут генерировать разные размеры блоков. Поэтому это можно установить на [уровне запроса](#using-context) через контекст.
* Будьте конкретными с вашими типами при вставке данных. Хотя клиент стремится быть гибким, например, позволяя строкам разбиваться на UUID или IP, это требует валидации данных и влечет за собой затраты во время вставки.
* Используйте вставки ориентированные на столбцы, где это возможно. Опять же, они должны быть строго типизированными, чтобы избежать необходимости клиенту конвертировать ваши значения.
* Следуйте [рекомендациям ClickHouse](/sql-reference/statements/insert-into/#performance-considerations) для оптимальной производительности вставки.
