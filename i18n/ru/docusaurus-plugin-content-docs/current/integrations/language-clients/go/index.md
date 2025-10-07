---
'sidebar_label': 'Go'
'sidebar_position': 1
'keywords':
- 'clickhouse'
- 'go'
- 'client'
- 'golang'
'slug': '/integrations/go'
'description': 'Клиенты Go для ClickHouse позволяют пользователям подключаться к ClickHouse,
  используя либо стандартный интерфейс базы данных Go/sql, либо оптимизированный родной
  интерфейс.'
'title': 'ClickHouse Go'
'doc_type': 'reference'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go
## Простой пример {#a-simple-example}

Давайте рассмотрим простой пример. Это соединится с ClickHouse и выполнит выборку из системной базы данных. Для начала вам понадобятся данные для подключения.
### Данные для подключения {#connection-details}

<ConnectionDetails />
### Инициализация модуля {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### Вставьте пример кода {#copy-in-some-sample-code}

Скопируйте этот код в каталог `clickhouse-golang-example` как `main.go`.

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
### Запустите go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```
### Установите данные для подключения {#set-your-connection-details}
Ранее вы посмотрели свои данные для подключения. Установите их в `main.go` в функции `connect()`:

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
Остальная часть документации в этой категории покрывает детали клиента ClickHouse Go.
## Клиент ClickHouse Go {#clickhouse-go-client}

ClickHouse поддерживает два официальных клиента для Go. Эти клиенты дополняют друг друга и намеренно поддерживают разные сценарии использования.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Высокоуровневый клиент, который поддерживает либо стандартный интерфейс Go database/sql, либо нативный интерфейс.
* [ch-go](https://github.com/ClickHouse/ch-go) - Низкоуровневый клиент. Только нативный интерфейс.

clickhouse-go предоставляет высокоуровневый интерфейс, позволяющий пользователям запрашивать и вставлять данные, используя ориентированные на строки семантику и пакетирование, которые допускают различия в типах данных - значения будут конвертированы, если не возникает потери точности. ch-go, тем временем, предоставляет оптимизированный столбцово-ориентированный интерфейс, который обеспечивает быструю потоковую передачу блоков данных с низкими затратами на CPU и память за счет жесткости по типам и более сложного использования.

С версии 2.3, Clickhouse-go использует ch-go для низкоуровневых функций, таких как кодирование, декодирование и сжатие. Обратите внимание, что clickhouse-go также поддерживает стандартный интерфейс Go `database/sql`. Оба клиента используют нативный формат для своего кодирования, чтобы обеспечить оптимальную производительность и могут общаться по нативному протоколу ClickHouse. clickhouse-go также поддерживает HTTP в качестве механизма транспортировки для случаев, когда пользователи требуют маршрутизации или балансировки нагрузки.

При выборе библиотеки клиента пользователи должны иметь в виду их соответствующие плюсы и минусы - см. Выбор библиотеки клиента.

|               | Нативный формат | Нативный протокол | HTTP протокол | Ориентированный на строки API | Ориентированный на столбцы API | Гибкость типов | Сжатие | Плейсхолдеры запросов |
|:-------------:|:---------------:|:------------------:|:-------------:|:-----------------------------:|:-------------------------------:|:--------------:|:------:|:---------------------:|
| clickhouse-go |       ✅        |        ✅          |       ✅      |              ✅               |               ✅                |        ✅      |   ✅   |          ✅           |
|     ch-go     |       ✅        |        ✅          |               |                             |               ✅                |                |   ✅   |                     |
## Выбор клиента {#choosing-a-client}

Выбор библиотеки клиента зависит от ваших сценариев использования и потребности в оптимальной производительности. Для случаев с большим количеством вставок, где требуются миллионы вставок в секунду, мы рекомендуем использовать низкоуровневый клиент [ch-go](https://github.com/ClickHouse/ch-go). Этот клиент избегает связанных накладных расходов на преобразование данных из формата, ориентированного на строки, в столбцы, как этого требует нативный формат ClickHouse. Кроме того, он избегает любого отражения или использования типа `interface{}` (`any`), чтобы упростить использование.

Для рабочих нагрузок запросов, ориентированных на агрегации или меньшие нагрузки вставок, библиотека [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) предоставляет знакомый интерфейс `database/sql` и более простую семантику строк. Пользователи также могут по желанию использовать HTTP в качестве транспортного протокола и воспользоваться вспомогательными функциями для преобразования строк в структуры и наоборот.
## Клиент clickhouse-go {#the-clickhouse-go-client}

Клиент clickhouse-go предоставляет два интерфейса API для общения с ClickHouse:

* Специфический API клиента ClickHouse
* Стандарт `database/sql` - универсальный интерфейс для SQL баз данных, предоставляемый Golang.

В то время как `database/sql` предлагает универсальный интерфейс, позволяя разработчикам абстрагировать свое хранилище данных, он накладывает некоторые ограничения по типам и семантике запросов, которые влияют на производительность. По этой причине следует использовать специфический для клиента API, когда [производительность имеет значение](https://github.com/clickHouse/clickHouse-go#benchmark). Тем не менее пользователи, которые хотят интегрировать ClickHouse в инструменты, поддерживающие несколько баз данных, могут предпочесть использовать стандартный интерфейс.

Оба интерфейса кодируют данные с использованием [нативного формата](/native-protocol/basics.md) и нативного протокола для связи. Кроме того, стандартный интерфейс поддерживает связь по HTTP.

|                    | Нативный формат | Нативный протокол | HTTP протокол | Поддержка массовых записей | Сериализация структур | Сжатие | Плейсхолдеры запросов |
|:------------------:|:---------------:|:------------------:|:-------------:|:--------------------------:|:---------------------:|:------:|:---------------------:|
|   ClickHouse API   |       ✅        |        ✅          |               |             ✅             |          ✅           |   ✅   |          ✅           |
| `database/sql` API |       ✅        |        ✅          |       ✅      |             ✅             |                       |   ✅   |          ✅           |
## Установка {#installation}

v1 драйвера устарела и не будет получать обновления функций или поддержку новых типов ClickHouse. Пользователи должны перейти на v2, который предлагает лучшую производительность.

Чтобы установить версию клиента 2.x, добавьте пакет в ваш файл go.mod:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Или клонируйте репозиторий:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

Чтобы установить другую версию, измените путь или имя ветки соответственно.

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

Клиент выпускается независимо от ClickHouse. 2.x представляет собой текущую основную версию, находящуюся в разработке. Все версии 2.x должны быть совместимы друг с другом.
#### Совместимость с ClickHouse {#clickhouse-compatibility}

Клиент поддерживает:

- Все поддерживаемые версии ClickHouse, которые зафиксированы [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). Поскольку версии ClickHouse больше не поддерживаются, они также больше не проходят активное тестирование на релизах клиента.
- Все версии ClickHouse в течение 2 лет с даты выпуска клиента. Обратите внимание, только версии LTS проходят активное тестирование.
#### Совместимость с Golang {#golang-compatibility}

| Версия клиента | Версии Golang |
|:--------------:|:-------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## API клиента ClickHouse {#clickhouse-client-api}

Все примеры кода для API клиента ClickHouse можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).
### Подключение {#connecting}

Следующий пример, который возвращает версию сервера, демонстрирует подключение к ClickHouse - предполагая, что ClickHouse не защищен и доступен с помощью пользователя по умолчанию.

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

**Во всех последующих примерах, если не указано иное, мы предполагаем, что переменная ClickHouse `conn` была создана и доступна.**
#### Настройки подключения {#connection-settings}

При открытии соединения можно использовать структуру Options для управления поведением клиента. Доступны следующие настройки:

* `Protocol` - либо Нативный, либо HTTP. HTTP в настоящее время поддерживается только для [database/sql API](#databasesql-api).
* `TLS` - параметры TLS. Ненулевое значение включает TLS. См. [Использование TLS](#using-tls).
* `Addr` - срез адресов, включая порт.
* `Auth` - Данные для аутентификации. См. [Аутентификация](#authentication).
* `DialContext` - пользовательская функция набора, чтобы определить, как устанавливаются соединения.
* `Debug` - true/false для включения отладки.
* `Debugf` - предоставляет функцию для обработки отладочного вывода. Требует, чтобы `debug` было установлено в true.
* `Settings` - карта настроек ClickHouse. Они будут применены ко всем запросам ClickHouse. [Использование контекста](#using-context) позволяет устанавливать настройки для каждого запроса.
* `Compression` - включить сжатие для блоков. См. [Сжатие](#compression).
* `DialTimeout` - максимальное время для установления соединения. По умолчанию `1s`.
* `MaxOpenConns` - максимальное количество подключений для использования в любой момент. Более или менее подключений может находиться в пустом пуле, но только это количество может использоваться в любой момент. По умолчанию `MaxIdleConns+5`.
* `MaxIdleConns` - количество подключений, которые необходимо поддерживать в пуле. Подключения будут повторно использоваться, если это возможно. По умолчанию `5`.
* `ConnMaxLifetime` - максимальное время жизни, в течение которого подключение будет доступно. По умолчанию 1 час. Подключения уничтожаются после этого времени, новые подключения добавляются в пул по мере необходимости.
* `ConnOpenStrategy` - определяет, как список адресов узлов должен быть использован для открытия соединений. См. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `BlockBufferSize` - максимальное количество блоков, которые могут быть декодированы в буфер за раз. Большие значения увеличивают параллелизацию за счет памяти. Размеры блоков зависят от запроса, поэтому, хотя вы можете установить это для соединения, мы рекомендуем переопределять для каждого запроса в зависимости от данных, которые он возвращает. По умолчанию `2`.

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

Клиент поддерживает пул подключений, повторно используя их между запросами по мере необходимости. В любое время будет использоваться максимум `MaxOpenConns`, максимальный размер пула контролируется `MaxIdleConns`. Клиент будет получать соединение из пула для каждого выполнения запроса, возвращая его в пул для повторного использования. Подключение используется в течение времени выполнения пакета и освобождается при вызове `Send()`.

Нет гарантии, что одно и то же подключение из пула будет использоваться для последующих запросов, если пользователь не установит `MaxOpenConns=1`. Это редко требуется, но может быть необходимо в случаях, когда пользователи используют временные таблицы.

Кроме того, обратите внимание, что `ConnMaxLifetime` по умолчанию составляет 1 час. Это может привести к неравномерной нагрузке на ClickHouse, если узлы покидают кластер. Это может произойти, когда узел становится недоступным; подключения будут сбалансированы на другие узлы. Эти подключения будут существовать и не будут обновляться в течение 1 часа по умолчанию, даже если проблемный узел возвращается в кластер. Рассмотрите возможность снижения этого значения в случаях с высокой нагрузкой.
### Использование TLS {#using-tls}

На низком уровне все методы подключения клиента (`DSN/OpenDB/Open`) будут использовать [пакет Go tls](https://pkg.go.dev/crypto/tls) для установления безопасного соединения. Клиент знает, что нужно использовать TLS, если структура Options содержит ненулевой указатель `tls.Config`.

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

Этот минимальный `TLS.Config` обычно достаточно для подключения к безопасному нативному порту (обычно 9440) на сервере ClickHouse. Если у сервера ClickHouse нет действительного удостоверения (истек, неправильное имя хоста, не подписано общепризнанным корневым центром сертификации), `InsecureSkipVerify` может быть истинным, но это строго не рекомендуется.

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

Если нужны дополнительные параметры TLS, код приложения должен установить желаемые поля в структуре `tls.Config`. Это может включать конкретные наборы шифров, принуждение к определенной версии TLS (например, 1.2 или 1.3), добавление цепочки сертификатов внутреннего ЦС, добавление клиентского сертификата (и закрытого ключа), если это требуется сервером ClickHouse, и большинство других вариантов, которые приходят с более специализированной конфигурацией безопасности.
### Аутентификация {#authentication}

Укажите структуру Auth в данных подключения, чтобы указать имя пользователя и пароль.

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

Несколько адресов могут быть указаны через структуру `Addr`.

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

* `ConnOpenInOrder` (по умолчанию) - адреса используются в порядке. Более поздние адреса используются только в случае неудачи подключения к адресам, ранее находящимся в списке. Это фактически является стратегией переключения на резервный вариант.
* `ConnOpenRoundRobin` - Нагрузка распределяется между адресами с использованием стратегии кругового распределения.

Это можно контролировать с помощью опции `ConnOpenStrategy`

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

Произвольные операторы могут быть выполнены через метод `Exec`. Это полезно для DDL и простых операторов. Этот метод не следует использовать для больших вставок или итераций запросов.

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

Обратите внимание на возможность передать контекст в запрос. Это можно использовать для передачи конкретных настроек на уровне запроса - см. [Использование контекста](#using-context).
### Пакетная вставка {#batch-insert}

Чтобы вставить большое количество строк, клиент предоставляет семантику пакетов. Это требует подготовки пакета, в который строки могут быть добавлены. Он в конечном итоге отправляется через метод `Send()`. Пакеты хранятся в памяти до выполнения `Send`.

Рекомендуется вызывать `Close` на пакете, чтобы предотвратить утечку подключений. Это можно сделать через ключевое слово `defer` после подготовки пакета. Это очистит соединение, если `Send` никогда не будет вызван. Обратите внимание, что это приведет к тому, что в журналы запросов не будет записано вставляемых строк, если строки не были добавлены.

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

Рекомендации для ClickHouse применимы [здесь](/guides/inserting-data#best-practices-for-inserts). Пакеты не следует использовать между goroutines - создайте отдельный пакет для каждой рутины.

Из приведенного выше примера обратите внимание на необходимость соответствия типов переменных типу столбца при добавлении строк. Хотя соответствие обычно очевидно, этот интерфейс пытается быть гибким, и типы будут конвертированы, если не возникает потери точности. Например, следующее демонстрирует вставку строки в поле datetime64.

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

Для полного обзора поддерживаемых типов go для каждого типа столбца см. [Преобразования типов](#type-conversions).
### Запрос строк {#querying-rows}

Пользователи могут либо запрашивать одну строку с помощью метода `QueryRow`, либо получать курсор для итерации по набору результатов через `Query`. Хотя первый метод принимает место назначения для данных, в которое они должны быть сериализованы, второй метод требует вызова `Scan` для каждой строки.

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

Обратите внимание, что в обоих случаях необходимо передать указатель на переменные, в которые мы хотим сериализовать соответствующие значения столбцов. Эти переменные должны передаваться в том порядке, который указан в операторе `SELECT` - по умолчанию будет использоваться порядок объявления столбцов в случае `SELECT *`, как показано выше.

Аналогично вставке, метод Scan требует, чтобы целевые переменные имели соответствующий тип. Это снова нацелено на гибкость, при этом типы конвертируются, где это возможно, предоставляя, что не допускается потеря точности, например, в примере выше столбец UUID читается в переменную типа string. Для полного списка поддерживаемых типов go для каждого типа столбца см. [Преобразования типов](#type-conversions).

Наконец, обратите внимание на возможность передать `Context` в методы `Query` и `QueryRow`. Это можно использовать для настроек на уровне запроса - см. [Использование контекста](#using-context) для получения дополнительной информации.
### Асинхронная вставка {#async-insert}

Поддерживаются асинхронные вставки через метод Async. Это позволяет пользователю указать, должен ли клиент ожидать завершения сервера для вставки или отвечать, как только данные были получены. Это эффективно контролирует параметр [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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
### Столбцовая вставка {#columnar-insert}

Вставки могут выполняться в формате столбцов. Это может обеспечить преимущества производительности, если данные уже ориентированы в этой структуре, избегая необходимости преобразования в строки.

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

Для пользователей структуры Golang предоставляют логическое представление строки данных в ClickHouse. Для этого нативный интерфейс предоставляет несколько удобных функций.
#### Выбор с сериализацией {#select-with-serialize}

Метод Select позволяет сериализовать набор строк ответа в срез структур с одним вызовом.

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
#### Сканирование структуры {#scan-struct}

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
#### Добавление структуры {#append-struct}

`AppendStruct` позволяет добавить структуру в существующий [пакет](#batch-insert) и интерпретировать ее как полную строку. Это требует, чтобы названия и типы столбцов структуры соответствовали таблице. Хотя все столбцы должны иметь эквивалентное поле структуры, некоторые поля структуры могут не иметь эквивалентного представления столбца. Эти поля будут просто игнорироваться.

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
### Преобразования типов {#type-conversions}

Клиент ориентирован на максимальную гибкость в отношении принятия переменных типов как для вставки, так и для сериализации ответов. В большинстве случаев для типа столбца ClickHouse существует эквивалентный тип Golang, например, [UInt64](/sql-reference/data-types/int-uint/) соответствует [uint64](https://pkg.go.dev/builtin#uint64). Эти логические соответствия всегда должны поддерживаться. Пользователи могут захотеть использовать переменные типы, которые могут быть вставлены в столбцы или использованы для получения ответа, если преобразование переменной или полученных данных происходит в первую очередь. Клиент стремится поддерживать эти преобразования прозрачно, чтобы пользователи не нужно было точно конвертировать свои данные перед вставкой и предоставить гибкую сериализацию во время запроса. Эта прозрачная конвертация не допускает потери точности. Например, uint32 не может быть использован для получения данных из столбца UInt64. Напротив, строка может быть вставлена в поле datetime64 при условии, что она соответствует требованиям формата.

В настоящее время поддерживаемые преобразования типов для примитивных типов зафиксированы [здесь](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

Этот процесс продолжается, и его можно разделить на вставку (`Append`/`AppendRow`) и время чтения (через `Scan`). Если вам нужна поддержка конкретного преобразования, пожалуйста, создайте запрос.
### Комплексные типы {#complex-types}
#### Типы Date/DateTime {#datedatetime-types}

Клиент ClickHouse Go поддерживает типы дат `Date`, `Date32`, `DateTime` и `DateTime64`. Даты могут вставляться как строки в формате `2006-01-02` или с использованием нативного типа Go `time.Time{}` или `sql.NullTime`. Дата-время также поддерживает последние типы, но требует передачи строк в формате `2006-01-02 15:04:05` с опциональным смещением по времени, например, `2006-01-02 15:04:05 +08:00`. Оба `time.Time{}` и `sql.NullTime` поддерживаются на этапе чтения, как и любое реализация интерфейса `sql.Scanner`.

Обработка информации о временной зоне зависит от типа ClickHouse и передаваемого или считываемого значения:

* **DateTime/DateTime64**
  * В **время вставки** значение отправляется в ClickHouse в формате метки времени UNIX. Если временная зона не указана, клиент будет считать локальную временную зону клиента. `time.Time{}` или `sql.NullTime` будут преобразованы в эпоху соответственно.
  * В **время выборки** временная зона столбца будет использоваться, если она установлена при возврате `time.Time` значения. Если нет, будет использоваться временная зона сервера.
* **Date/Date32**
  * В **время вставки** временная зона любой даты учитывается при преобразовании даты в метку времени UNIX, т.е. она будет смещена на величину временной зоны перед хранением как дата, так как типы Дата не имеют локализации в ClickHouse. Если это не указано в строковом значении, будет использоваться локальная временная зона.
  * В **время выборки**, даты сканируются в `time.Time{}` или экземпляры `sql.NullTime{}` будут возвращены без информации о временной зоне.
#### Массив {#array}

Массивы должны вставляться как срезы. Правила типизации для элементов согласуются с правилами для [примитивного типа](#type-conversions), т.е. при возможности элементы будут конвертироваться.

Указатель на срез должен быть предоставлен на этапе сканирования.

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

Maps должны вставляться как карты Golang с ключами и значениями, соответствующими правилам типов, определенным [ранее](#type-conversions).

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

Кортежи представляют собой группу столбцов произвольной длины. Столбцы могут быть либо явно названы, либо только указывать тип, например:

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

Из этих подходов именованные кортежи предлагают большую гибкость. В то время как неназванные кортежи должны вставляться и считываться с использованием срезов, именованные кортежи также совместимы с картами.

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

Примечание: поддерживаются типизированные срезы и карты, при этом подстолбцы в именованном кортеже должны быть одного и того же типа.
#### Вложенные {#nested}

Вложенное поле эквивалентно массиву именованных кортежей. Использование зависит от того, установил ли пользователь [flatten_nested](/operations/settings/settings#flatten_nested) в 1 или 0.

Установив flatten_nested в 0, вложенные столбцы остаются как отдельный массив кортежей. Это позволяет пользователям использовать срезы карт для вставки и извлечения и произвольные уровни вложенности. Ключ карты должен равняться имени столбца, как показано в следующем примере.

Примечание: поскольку карты представляют собой кортеж, они должны быть типа `map[string]interface{}`. Значения в настоящий момент не имеют строгой типизации.

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

[Полный пример - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

Если используется значение по умолчанию 1 для `flatten_nested`, вложенные столбцы упрощаются до отдельных массивов. Это требует использования вложенных срезов для вставки и извлечения. Хотя произвольные уровни вложенности могут работать, это официально не поддерживается.

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

[Полный пример - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

Примечание: Вложенные столбцы должны иметь одинаковые размеры. Например, в вышеупомянутом примере `Col_2_2` и `Col_2_1` должны иметь одинаковое количество элементов.

Из-за более простого интерфейса и официальной поддержки вложенности мы рекомендуем `flatten_nested=0`.
#### Гео типы {#geo-types}

Клиент поддерживает гео типы Point, Ring, Polygon и Multi Polygon. Эти поля реализуются в Golang с использованием пакета [github.com/paulmach/orb](https://github.com/paulmach/orb).

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

Тип UUID поддерживается пакетом [github.com/google/uuid](https://github.com/google/uuid). Пользователи могут также отправлять и сериализовать UUID как строку или любой тип, который реализует `sql.Scanner` или `Stringify`.

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
#### Десятичный {#decimal}

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

Значение Nil в Go представляет собой NULL ClickHouse. Это может использоваться, если поле объявлено как Nullable. Время вставки, Nil может быть передан как для обычной, так и для Nullable версии столбца. Для первой вариант по умолчанию будет сохранено значение типа, например, пустая строка для строк. Для nullable версии будет храниться значение NULL в ClickHouse.

Время сканирования пользователю необходимо передать указатель на тип, который поддерживает nil, например, *string, чтобы представить значение nil для поля Nullable. В нижеследующем примере col1, который является Nullable(String), таким образом получает **string. Это позволяет представлять nil.

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

Клиент дополнительно поддерживает типы `sql.Null*`, например, `sql.NullInt64`. Эти типы совместимы с их эквивалентными типами ClickHouse.
#### Большие целые числа - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

Числовые типы, превышающие 64 бита, представлены с использованием нативного пакета Go [big](https://pkg.go.dev/math/big).

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

Поддержка методов сжатия зависит от используемого протокола. Для нативного протокола клиент поддерживает сжатие `LZ4` и `ZSTD`. Это выполняется только на уровне блоков. Сжатие можно включить, добавив конфигурацию `Compression` в соединение.

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

Дополнительные методы сжатия доступны, если используется стандартный интерфейс по HTTP. См. [database/sql API - Сжатие](#compression) для получения дополнительной информации.
### Привязка параметров {#parameter-binding}

Клиент поддерживает привязку параметров для методов `Exec`, `Query` и `QueryRow`. Как показано в следующем примере, это поддерживается с использованием именованных, нумерованных и позиционных параметров. Мы приводим примеры этих ниже.

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
#### Специальные случаи {#special-cases}

По умолчанию срезы будут развернуты в список значений, разделенных запятыми, если они передаются как параметр запроса. Если пользователи требуют, чтобы набор значений был инъектирован с использованием обрамления `[ ]`, следует использовать `ArraySet`.

Если требуются группы/кортежи с обрамлением `( )`, например, для использования с операторами IN, пользователи могут использовать `GroupSet`. Это особенно полезно для случаев, когда требуется несколько групп, как показано в примере ниже.

Наконец, поля DateTime64 требуют указания точности, чтобы гарантировать, что параметры отображаются должным образом. Уровень точности для поля неизвестен клиенту, поэтому пользователю необходимо предоставить его. Чтобы облегчить это, мы предоставляем параметр `DateNamed`.

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
### Использование контекста {#using-context}

Контексты Go предоставляют способ передачи сроков, сигналов отмены и других значений, охватывающих запросы, через границы API. Все методы на соединении принимают контекст в качестве своей первой переменной. Хотя в предыдущих примерах использовался context.Background(), пользователи могут использовать эту возможность для передачи настроек и сроков, а также для отмены запросов.

Передача контекста, созданного с помощью `withDeadline`, позволяет установить ограничения времени выполнения для запросов. Обратите внимание, что это абсолютное время, и истечение срока действия только освободит соединение и отправит сигнал отмены в ClickHouse. В качестве альтернативы можно использовать `WithCancel`, чтобы явным образом отменить запрос.

Вспомогательные функции `clickhouse.WithQueryID` и `clickhouse.WithQuotaKey` позволяют указать идентификатор запроса и ключ квоты. Идентификаторы запросов могут быть полезны для отслеживания запросов в журналах и для целей отмены. Ключ квоты можно использовать для наложения ограничений на использование ClickHouse на основе уникального значения ключа - см. [Управление квотами](/operations/access-rights#quotas-management) для получения дополнительной информации.

Пользователи также могут использовать контекст, чтобы гарантировать, что настройка применяется только для конкретного запроса, а не для всего соединения, как показано в [Настройки подключения](#connection-settings).

Наконец, пользователи могут контролировать размер буфера блоков через `clickhouse.WithBlockSize`. Это переопределяет настройку уровня соединения `BlockBufferSize` и контролирует максимальное количество блоков, которые декодируются и хранятся в памяти в любой момент времени. Более крупные значения потенциально означают больше параллелизации за счет использования памяти.

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
// we can use context to pass settings to a specific API call
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// to create a JSON column we need allow_experimental_object_type=1
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

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
### Информация о прогрессе/профиле/логах {#progressprofilelog-information}

Информацию о прогрессе, профиле и логах можно запрашивать для запросов. Информация о прогрессе будет сообщать статистику о количестве строк и байт, которые были прочитаны и обработаны в ClickHouse. В свою очередь, информация о профиле предоставляет сводку данных, возвращенных клиенту, включая итоги по байтам (разжато), строкам и блокам. Наконец, информация о логах предоставляет статистику по потокам, например, использование памяти и скорость обработки данных.

Получение этой информации требует от пользователя использования [Context](#using-context), в который пользователь может передавать функции обратного вызова.

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

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)
### Динамическое сканирование {#dynamic-scanning}

Пользователям может потребоваться читать таблицы, для которых они не знают схему или тип возвращаемых полей. Это часто встречается в случаях, когда выполняется ad-hoc анализ данных или пишутся универсальные инструменты. Для достижения этого информация о типах колонок доступна в ответах на запросы. Это можно использовать с рефлексией Go для создания экземпляров переменных правильного типа, которые могут быть переданы в Scan.

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

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse с помощью запроса SELECT. Эти данные помещаются во временную таблицу и могут быть использованы в самом запросе для оценки.

Чтобы отправить внешние данные клиенту с запросом, пользователю необходимо создать внешнюю таблицу через `ext.NewTable` перед передачей этого через контекст.

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
### Открытая телеметрия {#open-telemetry}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть родного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context для достижения этой цели.

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

Полные детали о возможности использования трассировки можно найти в разделе [Поддержка OpenTelemetry](/operations/opentelemetry/).
## API базы данных/SQL {#databasesql-api}

`database/sql` или "стандартный" API позволяет пользователям использовать клиент в сценариях, где код приложения должен быть независимым от подлежащих баз данных, соблюдая стандартный интерфейс. Это имеет некоторые издержки - дополнительные уровни абстракции и индирекции и примитивы, которые не обязательно совпадают с ClickHouse. Однако эти затраты обычно приемлемы в сценариях, когда инструменты должны подключаться к нескольким базам данных.

Кроме того, этот клиент поддерживает использование HTTP в качестве транспортного слоя - данные все равно будут закодированы в родном формате для оптимальной производительности.

Следующее стремится отразить структуру документации для API ClickHouse.

Полные примеры кода для стандартного API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).
### Подключение {#connecting-1}

Подключение можно осуществить либо через строку DSN формата `clickhouse://<host>:<port>?<query_option>=<value>` с использованием метода `Open`, либо через метод `clickhouse.OpenDB`. Последний не является частью спецификации `database/sql`, но возвращает экземпляр `sql.DB`. Этот метод предоставляет функциональность, такую как профилирование, для которой нет очевидных средств для экспонирования через спецификацию `database/sql`.

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

**Для всех последующих примеров, если не указано иное, мы предполагаем, что используется переменная `conn` ClickHouse, которая была создана и доступна.**
#### Настройки подключения {#connection-settings-1}

Следующие параметры могут быть переданы в строке DSN:

* `hosts` - список единичных адресов хостов, разделенных запятыми, для балансировки нагрузки и отказоустойчивости - см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `username/password` - учетные данные аутентификации - см. [Аутентификация](#authentication)
* `database` - выберите текущую базу данных по умолчанию
* `dial_timeout` - строка продолжительности это возможно подписанная последовательность десятичных чисел, каждое с необязательной дробной частью и суффиксом единицы, таким как `300ms`, `1s`. Допустимые единицы времени: `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (по умолчанию `random`) - см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes)
  - `round_robin` - выберите сервер из набора по кругу
  - `in_order` - первый живой сервер выбирается в указанном порядке
* `debug` - включить вывод отладки (логическое значение)
* `compress` - укажите алгоритм сжатия - `none` (по умолчанию), `zstd`, `lz4`, `gzip`, `deflate`, `br`. Если установлено значение `true`, будет использоваться `lz4`. Только `lz4` и `zstd` поддерживаются для родной связи.
* `compress_level` - уровень сжатия (по умолчанию `0`). См. Сжатие. Это специфично для алгоритма:
  - `gzip` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
  - `deflate` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
  - `br` - `0` (Лучшая скорость) до `11` (Лучшее сжатие)
  - `zstd`, `lz4` - игнорируется
* `secure` - установить защищенное SSL-соединение (по умолчанию `false`)
* `skip_verify` - пропустить проверку сертификата (по умолчанию `false`)
* `block_buffer_size` - позволяет пользователям контролировать размер буфера блоков. См. [`BlockBufferSize`](#connection-settings). (по умолчанию `2`)

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

Пользователи могут влиять на использование предоставленного списка адресов узлов, как описано в [Подключение к нескольким узлам](#connecting-to-multiple-nodes). Управление подключениями и пуллинг, однако, делегированы `sql.DB` по замыслу.
#### Подключение через HTTP {#connecting-over-http}

По умолчанию подключения устанавливаются через родной протокол. Для пользователей, которым нужен HTTP, это можно активировать, либо изменив DSN, чтобы включить протокол HTTP, либо указав Протокол в параметрах подключения.

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

Если использовать `OpenDB`, подключитесь к нескольким хостам, используя тот же подход с параметрами, который использовался для API ClickHouse - опционально указывая `ConnOpenStrategy`.

Для подключений, основанных на DSN, строка принимает несколько хостов и параметр `connection_open_strategy`, для которого может быть установлен вариант `round_robin` или `in_order`.

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

Если используется строка подключения DSN, SSL можно активировать с помощью параметра "secure=true". Метод `OpenDB` использует тот же подход, что и [родной API для TLS](#using-tls), полагаясь на спецификацию ненулевой структуры TLS. Хотя строка подключения DSN поддерживает параметр skip_verify для пропуска проверки SSL, метод `OpenDB` необходим для более сложных конфигураций TLS - поскольку он позволяет передавать конфигурацию.

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

Если используется `OpenDB`, информацию об аутентификации можно передать с помощью обычных параметров. Для подключений на основе DSN имя пользователя и пароль можно передать в строке соединения - либо в качестве параметров, либо как учетные данные, закодированные в адресе.

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

После получения соединения пользователи могут выдавать SQL-запросы для выполнения через метод Exec.

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

Семантика пакета может быть достигнута путем создания `sql.Tx` через метод `Being`. Из этого пакета можно получить с помощью метода `Prepare` с оператором `INSERT`. Это возвращает `sql.Stmt`, к которому строки могут быть добавлены с помощью метода `Exec`. Пакет будет накапливаться в памяти до тех пор, пока не будет выполнен `Commit` на исходном `sql.Tx`.

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
### Запрос строки/строк {#querying-rows-1}

Запрос одной строки можно осуществить с помощью метода `QueryRow`. Это возвращает `*sql.Row`, на котором можно вызвать Scan с указателями на переменные, в которые должны быть помещены колонки. Вариант `QueryRowContext` позволяет передать контекст, отличный от фонового - см. [Использование контекста](#using-context).

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

Итерация по нескольким строкам требует метода `Query`. Это возвращает структуру `*sql.Rows`, на которой можно вызвать Next для перебора строк. Эквивалент `QueryContext` позволяет передавать контекст.

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

Асинхронные вставки могут быть достигнуты путем выполнения вставки через метод `ExecContext`. Это должно быть передано с контекстом, в котором включен асинхронный режим, как показано ниже. Это позволяет пользователю указать, должен ли клиент ждать завершения вставки на сервере или отвечать, как только данные были получены. Это эффективно управляет параметром [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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
### Вставка по колонкам {#columnar-insert-1}

Не поддерживается с использованием стандартного интерфейса.
### Использование структур {#using-structs-1}

Не поддерживается с использованием стандартного интерфейса.
### Преобразования типов {#type-conversions-1}

Стандартный интерфейс `database/sql` должен поддерживать те же типы, что и [API ClickHouse](#type-conversions). Есть несколько исключений, в основном для сложных типов, которые мы документируем ниже. Подобно API ClickHouse, клиент стремится быть максимально гибким в отношении принятия переменных типов как для вставки, так и для марshalling ответов. См. [Преобразования типов](#type-conversions) для получения дополнительных деталей.
### Сложные типы {#complex-types-1}

Если не указано иное, обработка сложных типов должна быть такой же, как в [API ClickHouse](#complex-types). Отличия являются результатом внутренних механизмов `database/sql`.
#### Карты {#maps}

В отличие от API ClickHouse, стандартный API требует, чтобы карты были строго типизированы по типу сканирования. Например, пользователи не могут передать `map[string]interface{}` для поля `Map(String,String)` и должны использовать `map[string]string` вместо этого. Переменная `interface{}` всегда будет совместима и может использоваться для более сложных структур. Структуры не поддерживаются во время чтения.

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

Поведение вставки такое же, как в API ClickHouse.
### Сжатие {#compression-1}

Стандартный API поддерживает те же алгоритмы сжатия, что и родной [API ClickHouse](#compression), т.е. сжатие `lz4` и `zstd` на уровне блока. В дополнение к этому, сжатие gzip, deflate и br поддерживаются для HTTP соединений. Если любое из этих сжатий включено, сжатие выполняется над блоками во время вставки и для ответов на запросы. Другие запросы, например, пинги или запросы, будут оставаться несжатыми. Это соответствует параметрам `lz4` и `zstd`.

Если используется метод `OpenDB` для установления соединения, можно передать конфигурацию сжатия. Это включает возможность указать уровень сжатия (смотрите ниже). Если подключаетесь через `sql.Open` с использованием DSN, используйте параметр `compress`. Это может быть либо конкретный алгоритм сжатия, т.е. `gzip`, `deflate`, `br`, `zstd` или `lz4`, либо логический флаг. Если установлено значение true, будет использоваться `lz4`. По умолчанию используется `none`, т.е. сжатие отключено.

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

Уровень применимого сжатия можно контролировать с помощью параметра DSN compress_level или поля Level в параметре Compression. По умолчанию это 0, но оно специфично для алгоритма:

* `gzip` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
* `deflate` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
* `br` - `0` (Лучшая скорость) до `11` (Лучшее сжатие)
* `zstd`, `lz4` - игнорируется
### Привязка параметров {#parameter-binding-1}

Стандартный API поддерживает те же возможности привязки параметров, что и [API ClickHouse](#parameter-binding), позволяя передавать параметры в методы `Exec`, `Query` и `QueryRow` (и их эквивалентные варианты [Context](#using-context)). Поддерживаются позиционные, именованные и нумерованные параметры.

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

Обратите внимание, что [особые случаи](#special-cases) все еще применимы.
### Использование контекста {#using-context-1}

Стандартный API поддерживает ту же возможность передавать сроки исполнения, сигналы отмены и другие значения, связанные с запросами, через контекст, как и [API ClickHouse](#using-context). В отличие от API ClickHouse, это достигается с использованием вариантов методов Context, т.е. методы, такие как `Exec`, которые по умолчанию используют фоновой контекст, имеют вариант `ExecContext`, в который можно передать контекст в качестве первого параметра. Это позволяет передавать контекст на любом этапе потока приложения. Например, пользователи могут передать контекст при установлении соединения через `ConnContext` или при запросе строки запроса через `QueryRowContext`. Примеры всех доступных методов показаны ниже.

Для получения дополнительной информации о том, как использовать контекст для передачи сроков исполнения, сигналов отмены, идентификаторов запросов, ключей квот и настроек подключения, смотрите Использование контекста для [API ClickHouse](#using-context).

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// to create a JSON column we need allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

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
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)
### Сессии {#sessions}

Хотя родные соединения по своей сути имеют сессию, соединения через HTTP требуют от пользователя создать идентификатор сессии для передачи в контексте в качестве параметра. Это позволяет использовать функции, например, Временные таблицы, которые связаны с сессией.

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

Аналогично [API ClickHouse](#dynamic-scanning), информация о типах колонок доступна, чтобы позволить пользователям создавать экземпляры переменных правильного типа, которые могут быть переданы в Scan. Это позволяет читать колонки, тип которых неизвестен.

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

[Внешние таблицы](/engines/table-engines/special/external-data/) позволяют клиенту отправлять данные в ClickHouse с помощью запроса `SELECT`. Эти данные помещаются во временную таблицу и могут быть использованы в самом запросе для оценки.

Чтобы отправить внешние данные клиенту с запросом, пользователю необходимо создать внешнюю таблицу через `ext.NewTable` перед передачей этого через контекст.

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
### Открытая телеметрия {#open-telemetry-1}

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть родного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context для достижения этой цели. Это не поддерживается при использовании HTTP в качестве транспортного средства.

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

* Используйте API ClickHouse, когда это возможно, особенно для примитивных типов. Это избегает значительного отражения и индирекции.
* Если вы читаете большие наборы данных, рассмотрите возможность изменения [`BlockBufferSize`](#connection-settings). Это увеличит объем занимаемой памяти, но позволит декодировать больше блоков параллельно во время итерации по строкам. Значение по умолчанию 2 является консервативным и минимизирует нагрузку на память. Более высокие значения будут означать больше блоков в памяти. Это требует тестирования, так как разные запросы могут создавать разные размеры блоков. Поэтому его можно установить на [уровне запроса](#using-context) через Context.
* Будьте конкретными со своими типами при вставке данных. Хотя клиент стремится быть гибким, например, позволяя анализировать строки для UUID или IP, это требует валидации данных и влечет за собой дополнительные затраты во время вставки.
* Используйте вставки по колонкам, когда это возможно. Эти вставки также должны быть строго типизированными, избегая необходимости клиенту конвертировать ваши значения.
* Следуйте [рекомендациям](/sql-reference/statements/insert-into/#performance-considerations) ClickHouse для оптимальной производительности вставки.
