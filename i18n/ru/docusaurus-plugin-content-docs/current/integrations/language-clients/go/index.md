---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'Клиенты Go для ClickHouse позволяют пользователям подключаться к ClickHouse, используя как стандартный интерфейс базы данных sql / database, так и оптимизированный нативный интерфейс.'
title: 'ClickHouse Go'
---
```

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';

# ClickHouse Go
## Простой пример {#a-simple-example}

Давайте разберем простой пример.  Он подключится к ClickHouse и выберет данные из системной базы данных. Для начала вам понадобятся данные для подключения.
### Данные для подключения {#connection-details}

<ConnectionDetails />
### Инициализация модуля {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### Скопируйте код примера {#copy-in-some-sample-code}

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
                panic((err))
        }

        ctx := context.Background()
        rows, err := conn.Query(ctx, "SELECT name,toString(uuid) as uuid_str FROM system.tables LIMIT 5")
        if err != nil {
                log.Fatal(err)
        }

        for rows.Next() {
                var (
                        name, uuid string
                )
                if err := rows.Scan(
                        &name,
                        &uuid,
                ); err != nil {
                        log.Fatal(err)
                }
                log.Printf("name: %s, uuid: %s",
                        name, uuid)
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
### Установите данные для подключения {#set-your-connection-details}
Ранее вы искали свои данные для подключения. Установите их в `main.go` в функции `connect()`:

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
### Узнайте больше {#learn-more}
Остальная часть документации в этой категории охватывает детали клиента ClickHouse Go.
## Клиент ClickHouse Go {#clickhouse-go-client}

ClickHouse поддерживает два официальных клиента Go. Эти клиенты дополняют друг друга и намеренно поддерживают разные сценарии использования.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Клиент высокого уровня, который поддерживает как стандартный интерфейс базы данных sql для Go, так и нативный интерфейс.
* [ch-go](https://github.com/ClickHouse/ch-go) - Клиент низкого уровня. Только нативный интерфейс.

clickhouse-go предоставляет интерфейс высокого уровня, позволяя пользователям выполнять запросы и вставлять данные, используя ориентированную на строки семантику и пакетную обработку, которые допускают дочерние типы данных - значения будут преобразованы, при условии, что не будет потенциальных потерь точности. ch-go, в свою очередь, предоставляет оптимизированный ориентированный на столбцы интерфейс, который обеспечивает быструю потоковую передачу блоков данных с низкими затратами по CPU и памяти за счет строгости типов и более сложного использования.

Начиная с версии 2.3, Clickhouse-go использует ch-go для низкоуровневых функций, таких как кодирование, декодирование и сжатие. Обратите внимание, что clickhouse-go также поддерживает стандартный интерфейс Go `database/sql`. Оба клиента используют нативный формат для своего кодирования, чтобы обеспечить оптимальную производительность и могут связываться через нативный протокол ClickHouse. Также clickhouse-go поддерживает HTTP как механизм передачи для случаев, когда пользователи имеют необходимость в проксировании или балансировке нагрузки.

При выборе библиотеки клиента пользователи должны быть осведомлены о их соответствующих преимуществах и недостатках - смотрите Выбор библиотеки клиента.

|               | Нативный формат | Нативный протокол | HTTP протокол | API для ориентированных на строки | API для ориентированных на столбцы | Гибкость типов | Сжатие | Заполнители запросов |
|:-------------:|:---------------:|:-----------------:|:-------------:|:------------------:|:---------------------:|:--------------:|:-------:|:--------------------:|
| clickhouse-go |       ✅       |        ✅         |       ✅      |          ✅         |           ✅           |         ✅      |    ✅   |          ✅          |
|     ch-go     |       ✅       |        ✅         |               |                    |           ✅           |                  |    ✅   |                     |
## Выбор клиента {#choosing-a-client}

Выбор библиотеки клиента зависит от ваших паттернов использования и необходимости в оптимальной производительности. Для сценариев с частыми вставками, где требуется миллионы вставок в секунду, мы рекомендуем использовать низкоуровневый клиент [ch-go](https://github.com/ClickHouse/ch-go). Этот клиент избегает связанных накладных расходов по преобразованию данных из формата, ориентированного на строки, в столбцы, как требует нативный формат ClickHouse. Более того, он избегает всякого отражения или использования типа `interface{}` (`any`), чтобы упростить использование.

Для нагрузок запросов, сосредоточенных на агрегациях или более низких нагрузках вставки, [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) предоставляет знакомый интерфейс `database/sql` и более простую семантику строк. Пользователи также могут по желанию использовать HTTP для протокола передачи и воспользоваться вспомогательными функциями для преобразования строк в структуры и наоборот.
## Клиент clickhouse-go {#the-clickhouse-go-client}

Клиент clickhouse-go предоставляет два API-интерфейса для взаимодействия с ClickHouse:

* Специфический API клиента ClickHouse
* Стандартный `database/sql` - общий интерфейс для SQL баз данных, предоставляемых Golang.

Хотя `database/sql` предоставляет базу независимо от клиента, позволяя разработчикам абстрагировать свое хранилище данных, он накладывает некоторые ограничения на типизацию и семантику запросов, которые влияют на производительность. По этой причине необходимо использовать API, специфичный для клиента, в тех случаях, когда [производительность важна](https://github.com/clickHouse/clickHouse-go#benchmark). Тем не менее пользователи, которые желают интегрировать ClickHouse в инструменты, поддерживающие несколько баз данных, могут предпочесть использовать стандартный интерфейс.

Оба интерфейса кодируют данные, используя [нативный формат](/native-protocol/basics.md) и нативный протокол для связи. Дополнительно стандартный интерфейс поддерживает связь по HTTP.

|                    | Нативный формат | Нативный протокол | HTTP протокол | Поддержка массовой записи | Сериализация структур | Сжатие | Заполнители запросов |
|:------------------:|:---------------:|:-----------------:|:-------------:|:------------------:|:-----------------:|:-------:|:--------------------:|
|   API ClickHouse    |       ✅       |        ✅         |               |          ✅         |         ✅         |    ✅   |          ✅          |
| `database/sql` API |       ✅       |        ✅         |       ✅      |          ✅         |                   |    ✅   |          ✅          |
## Установка {#installation}

v1 драйвера устарел и не будет получать обновления по функциям или поддержку новых типов ClickHouse. Пользователи должны перейти на v2, который предлагает более высокую производительность.

Чтобы установить версию 2.x клиента, добавьте пакет в ваш файл go.mod:

`require github.com/ClickHouse/clickhouse-go/v2 main`

Или, склонируйте репозиторий:

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
### Версии и совместимость {#versioning--compatibility}

Клиент выпускается независимо от ClickHouse. 2.x представляет текущую основную версию в разработке. Все версии 2.x должны быть совместимы между собой.
#### Совместимость с ClickHouse {#clickhouse-compatibility}

Клиент поддерживает:

- Все текущие поддерживаемые версии ClickHouse, указанные [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). Поскольку версии ClickHouse больше не поддерживаются, они также больше не тестируются с выпусками клиента.
- Все версии ClickHouse в течение 2 лет с момента выпуска клиента. Обратите внимание, что только LTS версии активно тестируются.
#### Совместимость с Golang {#golang-compatibility}

| Версия клиента | Версии Golang |
|:--------------:|:-------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## API клиента ClickHouse {#clickhouse-client-api}

Все примеры кода для API клиента ClickHouse можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples).
### Подключение {#connecting}

Следующий пример, который возвращает версию сервера, демонстрирует подключение к ClickHouse в предположении, что ClickHouse не защищен и доступен с использованием учетной записи по умолчанию.

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

**Во всех последующих примерах, если это не указано явно, мы предполагаем, что используется переменная ClickHouse `conn`, которая была создана и доступна.**
#### Настройки подключения {#connection-settings}

При открытии соединения можно использовать структуру Options для управления поведением клиента. Доступны следующие настройки:

* `Protocol` - либо Нативный, либо HTTP. HTTP в настоящее время поддерживается только для [API database/sql](#databasesql-api).
* `TLS` - параметры TLS. Значение, отличное от nil, включает TLS. Смотрите [Использование TLS](#using-tls).
* `Addr` - срез адресов, включая порт.
* `Auth` - Подробности аутентификации. Смотрите [Аутентификация](#authentication).
* `DialContext` - пользовательская функция набора, чтобы определить, как устанавливаются соединения.
* `Debug` - true/false для активации отладки.
* `Debugf` - предоставляет функцию для получения отладочного вывода. Требует, чтобы `debug` был установлен в true.
* `Settings` - карта настроек ClickHouse. Эти настройки будут применены ко всем запросам ClickHouse. [Использование контекста](#using-context) позволяет установить настройки для каждого запроса.
* `Compression` - включить сжатие для блоков. См. [Сжатие](#compression).
* `DialTimeout` - максимальное время для установления соединения. По умолчанию `1s`.
* `MaxOpenConns` - максимальное количество соединений для использования в любое время. Меньшее или большее количество соединений может находиться в неактивном пуле, но только это число может быть использовано в любое время. По умолчанию `MaxIdleConns+5`.
* `MaxIdleConns` - количество соединений, которые должны поддерживаться в пуле. Соединения будут повторно использоваться, если это возможно. По умолчанию `5`.
* `ConnMaxLifetime` - максимальный срок службы, чтобы удерживать соединение доступным. По умолчанию 1 час. Соединения уничтожаются после этого времени, новые соединения добавляются в пул по мере необходимости.
* `ConnOpenStrategy` - определяет, как должны использоваться и открываться адреса узлов. См. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `BlockBufferSize` - максимальное количество блоков, которые могут быть декодированы в буфер за раз. Более крупные значения увеличат параллелизацию за счет использования памяти. Размеры блока зависят от запроса, поэтому, хотя вы можете установить это в соединении, мы рекомендуем переопределить его для каждого запроса в зависимости от возвращаемых данных. По умолчанию `2`.

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

Клиент поддерживает пул соединений, повторно используя их по запросам, как требуется. В любое время будет использоваться не более `MaxOpenConns`, максимальный размер пула контролируется `MaxIdleConns`. Клиент будет получать соединение из пула для каждого выполнения запроса, возвращая его в пул для повторного использования. Соединение используется на протяжении всего времени выполнения пакета и освобождается при `Send()`.

Нет никаких гарантий, что то же самое соединение в пуле будет использоваться для последующих запросов, если пользователь не установит `MaxOpenConns=1`. Это редко необходимо, но может потребоваться для случаев, когда пользователи используют временные таблицы.

Кроме того, обратите внимание, что по умолчанию `ConnMaxLifetime` составляет 1 час. Это может привести к ситуациям, когда нагрузка на ClickHouse становится несбалансированной, если узлы покинут кластер. Это может произойти, когда узел становится недоступным, соединения будут балансироваться на другие узлы. Эти соединения будут существовать и не будут обновляться в течение 1 часа по умолчанию, даже если проблемный узел вернется в кластер. Рассмотрите возможность понижения этого значения в случаях высокой нагрузки.
### Использование TLS {#using-tls}

На низком уровне все методы подключения клиента (`DSN/OpenDB/Open`) будут использовать [пакет Go tls](https://pkg.go.dev/crypto/tls) для установления защищенного соединения. Клиент знает использовать TLS, если структура Options содержит ненулевой указатель на `tls.Config`.

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

Этот минимальный `TLS.Config` обычно достаточно, чтобы подключиться к защищенному нативному порту (обычно 9440) на сервере ClickHouse. Если у сервера ClickHouse нет действительного сертификата (истек, неправильное имя хоста, не подписан публично признанным корневым удостоверяющим центром), `InsecureSkipVerify` может быть истинным, но это настоятельно не рекомендуется.

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

Если дополнительные параметры TLS необходимы, код приложения должен установить желаемые поля в структуре `tls.Config`. Это могут быть специфические шифры, принудительное использование определенной версии TLS (например, 1.2 или 1.3), добавление внутренней цепочки сертификатов CA, добавление клиентского сертификата (и закрытого ключа), если это требуется сервером ClickHouse, и большинство других параметров, которые предусмотрены более специализированной настройкой безопасности.
### Аутентификация {#authentication}

Укажите структуру Auth в деталях подключения, чтобы указать имя пользователя и пароль.

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

* `ConnOpenInOrder` (по умолчанию) - адреса обрабатываются по порядку. Поздние адреса используются только в случае неуспеха при подключении, используя адреса ранее в списке. Это фактически стратегия резервирования.
* `ConnOpenRoundRobin` - Нагрузка распределяется по адресам с помощью стратегии кругового обхода.

Это можно контролировать с помощью параметра `ConnOpenStrategy`.

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
### Исполнение {#execution}

Произвольные операторы могут выполняться через метод `Exec`. Это полезно для DDL и простых операторов. Не следует использовать для крупных вставок или итераций запроса.

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

Обратите внимание на возможность передачи контекста в запрос. Это может быть использовано для передачи настроек конкретного уровня запроса - см. [Использование контекста](#using-context).
### Пакетная вставка {#batch-insert}

Чтобы вставить большое количество строк, клиент предоставляет пакетные семантики. Это требует подготовки пакета, к которому могут быть добавлены строки. Он наконец отправляется через метод `Send()`. Пакеты будут храниться в памяти до тех пор, пока не выполнится Send.

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

Рекомендации для ClickHouse применяются [здесь](/guides/inserting-data#best-practices-for-inserts). Пакеты не должны делиться между go-рутинами - создайте отдельный пакет для каждой рутины.

Из приведенного выше примера обратите внимание на необходимость согласования типов переменных с типами столбцов при добавлении строк. Хотя сопоставление обычно очевидно, этот интерфейс пытается быть гибким, и типы будут преобразованы, при условии, что не будет потерь точности. Например, приведенный ниже пример демонстрирует вставку строки в datetime64.

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

Для полного резюме поддерживаемых типов go для каждого типа столбца смотрите [Преобразования типов](#type-conversions).
### Запрос строк/ов {#querying-rows}

Пользователи могут либо запрашивать одну строку, используя метод `QueryRow`, либо получать курсор для итерации по наборам результатов через `Query`. В то время как первый принимает назначение для данных, которые нужно сериализовать, последний требует вызова `Scan` для каждой строки.

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

Обратите внимание, что в обоих случаях требуется передать указатель переменным, в которые мы хотим сериализовать соответствующие значения столбцов. Эти переменные должны быть переданы в том порядке, который указан в операторе `SELECT` - по умолчанию будет использоваться порядок определения столбца в случае `SELECT *`, как показано выше.

Аналогично вставке, метод Scan требует, чтобы целевые переменные соответствовали корректному типу. Это снова нацеливается на гибкость, с возможностью преобразования типов, при условии, что не будет потеряно точность, например, приведенный выше пример показывает, как столбец UUID считывается в переменную строки. Полный список поддерживаемых типов go для каждого типа столбца смотрите [Преобразования типов](#type-conversions).

Наконец, обратите внимание на возможность передачи `Context` в методы `Query` и `QueryRow`. Это может быть использовано для настроек, специфичных для запросов - смотрите [Использование контекста](#using-context) для получения дальнейших деталей.
### Асинхронная вставка {#async-insert}

Асинхронные вставки поддерживаются через метод Async. Это позволяет пользователю указать, должен ли клиент ждать, пока сервер завершит вставку, или ответить, как только данные будут приняты. Это эффективно контролирует параметр [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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
### Вставка в столбец {#columnar-insert}

Записи можно вставить в столбцовом формате. Это может обеспечить преимущества производительности, если данные уже ориентированы в этой структуре, избегая необходимости поворачивать их в строки.

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

Для пользователей структуры Golang предоставляют логическое представление строки данных в ClickHouse. Чтобы помочь с этим, нативный интерфейс предоставляет несколько удобных функций.
```
```yaml
title: 'Выбор с сериализацией'
sidebar_label: 'Выбор с сериализацией'
keywords: ['выбор', 'сериализация', 'ClickHouse']
description: 'Методы и приемы сериализации данных при выполнении запросов в ClickHouse.'
```

#### Выбор с сериализацией {#select-with-serialize}

Метод Select позволяет выполнить маршалинг набора строк ответа в срез структур за одно обращение.

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

`ScanStruct` позволяет выполнить маршалинг одной строки из запроса в структуру.

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

`AppendStruct` позволяет добавить структуру к существующему [пакету](#batch-insert) и интерпретировать ее как полную строку. Это требует, чтобы столбцы структуры совпадали как по имени, так и по типу с таблицей. Хотя все столбцы должны иметь эквивалентное поле структуры, некоторые поля структуры могут не иметь эквивалентного представления в столбце. Эти поля просто будут проигнорированы.

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL database driver",
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

Клиент стремится быть максимально гибким в отношении принятия переменных типов как для вставки, так и для маршалинга ответов. В большинстве случаев существует эквивалентный тип Golang для типа столбца ClickHouse, например, [UInt64](/sql-reference/data-types/int-uint/) к [uint64](https://pkg.go.dev/builtin#uint64). Эти логические соответствия всегда должны поддерживаться. Пользователи могут захотеть использовать переменные типы, которые могут быть вставлены в столбцы или использованы для получения ответа, если преобразование либо переменной, либо полученных данных происходит в первую очередь. Клиент стремится поддерживать эти преобразования прозрачно, чтобы пользователям не нужно было точно преобразовывать свои данные перед вставкой и обеспечивать гибкий маршалинг во время запроса. Это прозрачное преобразование не допускает потери точности. Например, uint32 не может быть использован для получения данных из столбца UInt64. Напротив, строка может быть вставлена в поле datetime64, при условии что она соответствует требованиям формата.

Преобразования типов, в настоящее время поддерживаемые для примитивных типов, зафиксированы [здесь](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md).

Эта работа продолжается и может быть разделена на вставку (`Append`/`AppendRow`) и время чтения (через `Scan`). Если вам нужна поддержка конкретного преобразования, пожалуйста, создайте проблему.
### Сложные типы {#complex-types}
#### Типы Date/DateTime {#datedatetime-types}

Клиент Go ClickHouse поддерживает типы `Date`, `Date32`, `DateTime` и `DateTime64`. Даты могут быть вставлены как строка в формате `2006-01-02` или с использованием родного go `time.Time{}` или `sql.NullTime`. Дата и Время также поддерживают последние типы, но требуют, чтобы строки передавались в формате `2006-01-02 15:04:05` с необязательным смещением часового пояса, например, `2006-01-02 15:04:05 +08:00`. `time.Time{}` и `sql.NullTime` поддерживаются как во время чтения, так и любая реализация интерфейса `sql.Scanner`.

Обработка информации о часовом поясе зависит от типа ClickHouse и от того, вставляется ли значение или читается:

* **DateTime/DateTime64**
    * В **время вставки** значение отправляется в ClickHouse в формате метки времени UNIX. Если часовой пояс не указан, клиент будет предполагать местный часовой пояс клиента. `time.Time{}` или `sql.NullTime` будет преобразован в эпоху соответственно.
    * В **время выбора** будет использоваться часовой пояс стобца, если установлен, при возврате значения `time.Time`. Если нет, будет использоваться часовой пояс сервера.
* **Date/Date32**
    * В **время вставки** часовой пояс любой даты учитывается при преобразовании даты в метку времени UNIX, т.е. он будет сдвинут по часовому поясу перед хранением в качестве даты, поскольку типы Date имеют локаль в ClickHouse. Если это не указано в строковом значении, будет использован местный часовой пояс.
    * В **время выбора** даты считываются в `time.Time{}` или `sql.NullTime{}` экземпляры и возвращаются без информации о часовом поясе.
#### Массив {#array}

Массивы должны быть вставлены как срезы. Правила типизации для элементов согласуются с правилами для [примитивного типа](#type-conversions), т.е. где это возможно, элементы будут преобразованы.

Указатель на срез должен быть предоставлен во время Scanning.

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
#### Словарь {#map}

Словари должны быть вставлены как карты Golang с ключами и значениями, соответствующими правилам типов, определенным [ранее](#type-conversions).

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

Кортежи представляют собой группу колонок произвольной длины. Столбцы могут быть либо явно названы, либо просто указывать тип, например:

```sql
//безымянный
Col1 Tuple(String, Int64)

//именованный
Col2 Tuple(name String, id Int64, age uint8)
```

Из этих подходов именованные кортежи предлагают большую гибкость. В то время как безымянные кортежи должны быть вставлены и прочитаны с использованием срезов, именованные кортежи также совместимы с картами.

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
// и именованные и безымянные могут быть добавлены с помощью срезов. Обратите внимание, что мы можем использовать сильно типизированные списки и карты, если все элементы одного типа
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
// именованные кортежи можно получить в карту или срезы, безымянные только срезы
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

Примечание: поддерживаются типизированные срезы и карты, при условии что подстолбцы в именованном кортеже имеют один и тот же тип.
#### Вложенные {#nested}

Вложенное поле эквивалентно массиву именованных кортежей. Использование зависит от того, установил ли пользователь [flatten_nested](/operations/settings/settings#flatten_nested) в 1 или 0.

Установив flatten_nested в 0, вложенные столбцы остаются в качестве одного массива кортежей. Это позволяет пользователям использовать срезы карт для вставки и извлечения, а также произвольные уровни вложенности. Ключ карты должен равняться имени столбца, как показано в примере ниже.

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

Если используется значение по умолчанию 1 для `flatten_nested`, вложенные столбцы упрощаются до отдельных массивов. Это требует использования вложенных срезов для вставки и извлечения. Хотя произвольные уровни вложенности могут работать, это не является официально поддерживаемым.

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


Примечание: Вложенные столбцы должны иметь одинаковые размеры. Например, в приведенном выше примере `Col2_2` и `Col2_1` должны иметь одинаковое количество элементов.

Из-за более простого интерфейса и официальной поддержки вложенности, мы рекомендуем `flatten_nested=0`.
#### Гео типы {#geo-types}

Клиент поддерживает гео типы Point, Ring, Polygon и Multi Polygon. Эти поля находятся в Golang с использованием пакета [github.com/paulmach/orb](https://github.com/paulmach/orb).

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

Тип UUID поддерживается пакетом [github.com/google/uuid](https://github.com/google/uuid). Пользователи также могут отправлять и маршалить UUID как строку или любой тип, который реализует `sql.Scanner` или `Stringify`.

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
#### Десятичные числа {#decimal}

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

go значение Nil представляет ClickHouse NULL. Это может быть использовано, если поле объявлено как Nullable. Во время вставки Nil может быть передан как для обычной, так и для Nullable версии столбца. Для первой будет сохранено значение по умолчанию для типа, т.е. пустая строка для строки. Для nullable версии в ClickHouse будет сохранено значение NULL.

Во время сканирования пользователь должен передать указатель на тип, который поддерживает nil, т.е. *string, чтобы представить значение nil для поля Nullable. В примере ниже col1, который является Nullable(String), таким образом получает **string**. Это позволяет представить nil.

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

Клиент также поддерживает типы `sql.Null*`, например, `sql.NullInt64`. Они совместимы с их эквивалентными типами ClickHouse.
#### Большие числа - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

Числовые типы больше 64 бит представлены с использованием родного go [big](https://pkg.go.dev/math/big) пакета.

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

Поддержка методов сжатия зависит от используемого подлежащего протокола. Для родного протокола клиент поддерживает `LZ4` и `ZSTD` сжатие. Это выполняется только на уровне блока. Сжатие может быть включено путем включения конфигурации `Compression` с подключением.

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


Дополнительные методы сжатия доступны, если использовать стандартный интерфейс через HTTP. См. [API database/sql - Сжатие](#compression) для более подробной информации.
### Привязка параметров {#parameter-binding}

Клиент поддерживает привязку параметров для методов `Exec`, `Query` и `QueryRow`. Как показано в примере ниже, это поддерживается с использованием именованных, нумерованных и позиционных параметров. Мы предоставляем примеры этих ниже.

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

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)
#### Специальные случаи {#special-cases}

По умолчанию, срезы будут развернуты в список значений, разделенных запятой, если переданы в качестве параметра к запросу. Если пользователям требуется набор значений, которые должны быть внедрены с оберткой `[ ]`, следует использовать `ArraySet`.

Если требуются группы/кортежи с оберткой `( )`, например, для использования с операторами IN, пользователи могут использовать `GroupSet`. Это особенно полезно для случаев, когда требуются несколько групп, как показано в примере ниже.

Наконец, поля DateTime64 требуют точности для того, чтобы гарантировать, что параметры отображаются правильно. Уровень точности для поля неизвестен клиенту, поэтому пользователь должен предоставить его. Для этого мы предлагаем параметр `DateNamed`.

```go
var count uint64
// массивы будут развернуты
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Число развернутых массивов: %d\n", count)
// массивы будут сохранены с []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Число массивов: %d\n", count)
// Групповые наборы позволяют формировать списки ( )
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Число групп: %d\n", count);
// Более полезно, когда нам нужна вложенность
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Число групп: %d\n", count);
// Используйте DateNamed, когда вам нужна точность во времени
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("Количество с наименованием даты: %d\n", count)
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)
```
```yaml
title: 'Использование контекста'
sidebar_label: 'Использование контекста'
keywords: ['контекст', 'запросы', 'ClickHouse']
description: 'Документация по использованию контекста для запросов в ClickHouse.'
```

### Использование Контекста {#using-context}

Контексты Go предоставляют способ передачи сроков, сигналов отмены и других значений, зависящих от запроса, через границы API. Все методы подключения принимают контекст в качестве первой переменной. В то время как предыдущие примеры использовали context.Background(), пользователи могут использовать эту возможность для передачи настроек и сроков, а также для отмены запросов.

Передача контекста, созданного с помощью `withDeadline`, позволяет устанавливать временные ограничения на выполнение запросов. Обратите внимание, что это абсолютное время, и истечение срока только освободит соединение и отправит сигнал отмены в ClickHouse. В качестве альтернативы можно использовать `WithCancel` для явной отмены запроса.

Помощники `clickhouse.WithQueryID` и `clickhouse.WithQuotaKey` позволяют задать идентификатор запроса и ключ квоты. Идентификаторы запросов могут быть полезны для отслеживания запросов в журналах и в целях отмены. Ключ квоты можно использовать для наложения ограничений на использование ClickHouse на основе уникального значения ключа - см. [Управление квотами](/operations/access-rights#quotas-management) для получения дополнительной информации.

Пользователи также могут использовать контекст, чтобы гарантировать, что настройка применяется только для конкретного запроса, а не для всего соединения, как показано в [Настройки соединения](#connection-settings).

Наконец, пользователи могут контролировать размер буфера блоков с помощью `clickhouse.WithBlockSize`. Это переопределяет настройку уровня соединения `BlockBufferSize` и контролирует максимальное количество блоков, которые декодируются и хранятся в памяти в любой момент времени. Более крупные значения могут означать большее параллелизм за счет использования памяти.

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
// мы можем использовать контекст для передачи настроек к конкретному API-запросу
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// для создания столбца JSON нам необходимо allow_experimental_object_type=1
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
    return fmt.Errorf("ожидалась отмена")
}

// установить срок для запроса - это отменит запрос после достижения абсолютного времени.
// запросы будут завершены в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("ожидалось превышение срока")
}

// установить идентификатор запроса для помощи в отслеживании запросов в журналах, например, см. system.query_log
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
// установить ключ квоты - сначала создать квоту
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
### Прогресс/Профиль/Информация о журнале {#progressprofilelog-information}

Прогресс, профиль и информация о журнале могут запрашиваться по запросам. Информация о прогрессе будет сообщать статистику по количеству строк и байтов, которые были прочитаны и обработаны в ClickHouse. Напротив, информация о профиле предоставляет сводку данных, возвращенных клиенту, включая итоги байтов (не сжатых), строк и блоков. Наконец, информация о журнале предоставляет статистику по потокам, например, использование памяти и скорость передачи данных.

Об получение этой информации требуется, чтобы пользователь использовал [Контекст](#using-context), в который пользователь может передать функции обратного вызова.

```go
totalRows := uint64(0)
// используйте контекст для передачи обратного вызова для информации о прогрессе и профиле
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("прогресс: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("информация о профиле: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("информация о журнале: ", log)
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

Пользователям может потребоваться читать таблицы, схема или тип полей которых им неизвестны. Это часто встречается в случаях, когда выполняется спонтанный анализ данных или пишутся универсальные инструменты. Для достижения этого информация о типе столбца доступна в ответах на запросы. Это можно использовать с помощью рефлексии Go для создания экземпляров корректных по типу переменных, которые могут быть переданы в Scan.

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

Чтобы отправить внешние данные клиенту с помощью запроса, пользователю необходимо создать внешнюю таблицу через `ext.NewTable` перед передачей этого через контекст.

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

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) как часть нативного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через контекст для достижения этого.

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

Полную информацию о трассировке можно найти в разделе [Поддержка OpenTelemetry](/operations/opentelemetry/).
## Database/SQL API {#databasesql-api}

`database/sql` или "стандартный" API позволяет пользователям использовать клиент в сценариях, где код приложения должен быть независимым от баз данных, предоставляя стандартный интерфейс. Это имеет свои затраты - дополнительные уровни абстракции и индирекции, а также примитивы, которые не обязательно совпадают с ClickHouse. Тем не менее, эти затраты обычно приемлемы в сценариях, когда инструменты должны подключаться к нескольким базам данных.

Кроме того, этот клиент поддерживает использование HTTP в качестве транспортного уровня - данные по-прежнему будут закодированы в нативном формате для оптимальной производительности.

Следующее стремится отразить структуру документации для API ClickHouse.

Полные примеры кода для стандартного API можно найти [здесь](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std).
### Подключение {#connecting-1}

Соединение можно осуществить либо через строку DSN формата `clickhouse://<host>:<port>?<query_option>=<value>` и метод `Open`, либо через метод `clickhouse.OpenDB`. Последний не является частью спецификации `database/sql`, но возвращает экземпляр `sql.DB`. Этот метод предоставляет функциональность, такую как профилирование, для которой нет очевидных способов раскрытия через спецификацию `database/sql`.

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

**Для всех последующих примеров, если не указано иное, мы предполагаем, что используется переменная ClickHouse `conn`, которая была создана и доступна.**
#### Настройки соединения {#connection-settings-1}

Следующие параметры могут быть переданы в строку DSN:

* `hosts` - список хостов с одним адресом, разделенных запятыми, для балансировки нагрузки и отказоустойчивости - см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).
* `username/password` - учетные данные аутентификации - см. [Аутентификация](#authentication)
* `database` - выбрать текущую базу данных по умолчанию
* `dial_timeout` - строка длительности, представляющая собой возможно подписанную последовательность десятичных чисел, каждое с необязательной дробной частью и суффиксом единицы, таким как `300ms`, `1s`. Допустимые единицы времени: `ms`, `s`, `m`.
* `connection_open_strategy` - `random/in_order` (по умолчанию `random`) - см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes)
    - `round_robin` - выбрать сервер по кругу из набора
    - `in_order` - первый доступный сервер выбирается в указанном порядке
* `debug` - включить отладочный вывод (булевое значение)
* `compress` - указать алгоритм сжатия - `none` (по умолчанию), `zstd`, `lz4`, `gzip`, `deflate`, `br`. Если установлено в `true`, будет использоваться `lz4`. Только `lz4` и `zstd` поддерживаются для нативной коммуникации.
* `compress_level` - уровень сжатия (по умолчанию `0`). См. Сжатие. Это специфично для алгоритма:
    - `gzip` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
    - `deflate` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
    - `br` - `0` (Лучшая скорость) до `11` (Лучшее сжатие)
    - `zstd`, `lz4` - игнорируется
* `secure` - установить безопасное SSL-соединение (по умолчанию `false`)
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
#### Пул соединений {#connection-pooling-1}

Пользователи могут влиять на использование предоставленного списка адресов узлов, как описано в [Подключение к нескольким узлам](#connecting-to-multiple-nodes). Однако управление и пуллирование соединений делегируется `sql.DB` по замыслу.
#### Подключение по HTTP {#connecting-over-http}

По умолчанию соединения устанавливаются через нативный протокол. Для пользователей, нуждающихся в HTTP, это можно включить, либо изменив строку DSN, чтобы включить HTTP-протокол, либо указав Протокол в параметрах подключения.

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

Если использовать `OpenDB`, подключитесь к нескольким хостам, используя тот же подход с параметрами, как это делается для API ClickHouse - дополнительно указав `ConnOpenStrategy`.

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

Если использовать строку подключения DSN, SSL можно включить с помощью параметра "secure=true". Метод `OpenDB` использует тот же подход, что и [глобальный API для TLS](#using-tls), полагаясь на указание ненулевой структуры TLS. Хотя строка подключения DSN поддерживает параметр skip_verify для пропуска проверки SSL, метод `OpenDB` требуется для более сложных конфигураций TLS - так как он позволяет передавать конфигурацию.

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

Если использовать `OpenDB`, информацию об аутентификации можно передать через обычные параметры. Для соединений на основе DSN имя пользователя и пароль могут быть переданы в строке подключения - либо в качестве параметров, либо как учетные данные, закодированные в адресе.

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

Пакетная семантика может быть достигнута путем создания `sql.Tx` с помощью метода `Begin`. Отсюда пакет можно получить с помощью метода `Prepare` с оператором `INSERT`. Это возвращает `sql.Stmt`, к которому строки могут быть добавлены с использованием метода `Exec`. Пакет будет накапливаться в памяти до тех пор, пока не будет выполнен `Commit` в исходном `sql.Tx`.

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

Запрос одной строки можно осуществить с помощью метода `QueryRow`. Это возвращает `*sql.Row`, на котором можно вызвать Scan с указателями на переменные, в которые должны быть преобразованы столбцы. Вариант `QueryRowContext` позволяет передавать контекст, отличный от фонового - см. [Использование контекста](#using-context).

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

Итерация по нескольким строкам требует метода `Query`. Это возвращает структуру `*sql.Rows`, на которой можно вызвать Next, чтобы пройти через строки. Эквивалент `QueryContext` позволяет передавать контекст.

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

Асинхронные вставки можно осуществить, выполняя вставку с помощью метода `ExecContext`. Этот метод должен получать контекст с включенным асинхронным режимом, как показано ниже. Это позволяет пользователю указать, должен ли клиент ожидать завершения сервера после вставки или отвечать, как только данные будут получены. Это эффективно контролирует параметр [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert).

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

Не поддерживается при использовании стандартного интерфейса.
### Использование структур {#using-structs-1}

Не поддерживается при использовании стандартного интерфейса.
### Преобразования типов {#type-conversions-1}

Стандартный интерфейс `database/sql` должен поддерживать те же типы, что и [API ClickHouse](#type-conversions). Есть несколько исключений, в основном для сложных типов, которые мы документируем ниже. Подобно API ClickHouse, клиент направлен на максимальную гибкость в отношении принятия переменных типов как для вставки, так и для преобразования ответов. См. [Преобразования типов](#type-conversions) для получения дополнительной информации.
### Сложные типы {#complex-types-1}

Если не указано иное, работа со сложными типами должна быть такой же, как и в [API ClickHouse](#complex-types). Различия являются результатом внутренних процессов `database/sql`.
#### Карты {#maps}

В отличие от API ClickHouse, стандартному API требуется, чтобы карты были сильно типизированы при типе сканирования. Например, пользователи не могут передавать `map[string]interface{}` для поля `Map(String,String)` и должны использовать `map[string]string` вместо этого. Переменная `interface{}` всегда будет совместима и может использоваться для более сложных структур. Структуры не поддерживаются во время чтения.

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

Стандартный API поддерживает те же алгоритмы сжатия, что и родной [ClickHouse API](#compression), т.е. сжатие `lz4` и `zstd` на уровне блока. В дополнение поддерживается сжатие gzip, deflate и br для HTTP-соединений. Если любой из этих параметров включен, сжатие выполняется на блоках во время вставки и для ответов на запросы. Другие запросы, например, пинги или запросы, останутся несжатыми. Это соответствует параметрам `lz4` и `zstd`.

Если используется метод `OpenDB` для установления соединения, можно передать конфигурацию Compression. Это включает возможность указать уровень сжатия (см. ниже). Если подключение осуществляется через `sql.Open` с DSN, используйте параметр `compress`. Это может быть либо конкретный алгоритм сжатия, т.е. `gzip`, `deflate`, `br`, `zstd` или `lz4`, либо логический флаг. Если установлен в true, будет использоваться `lz4`. По умолчанию `none`, т.е. сжатие отключено.

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

Уровень применяемого сжатия можно контролировать с помощью параметра DSN `compress_level` или поля `Level` опции `Compression`. По умолчанию 0, но он специфичен для алгоритма:

* `gzip` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
* `deflate` - `-2` (Лучшая скорость) до `9` (Лучшее сжатие)
* `br` - `0` (Лучшая скорость) до `11` (Лучшее сжатие)
* `zstd`, `lz4` - игнорируются

### Привязка параметров {#parameter-binding-1}

Стандартный API поддерживает те же возможности привязки параметров, что и [ClickHouse API](#parameter-binding), позволяя передавать параметры в методы `Exec`, `Query` и `QueryRow` (и их эквиваленты [Context](#using-context)). Поддерживаются позиционные, именованные и нумерованные параметры.

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

Обратите внимание, что [особые случаи](#special-cases) по-прежнему применяются.

### Использование контекста {#using-context-1}

Стандартный API поддерживает такую же возможность передачи крайних сроков, сигналов отмены и других значений, связанных с запросом, через контекст, как и [ClickHouse API](#using-context). В отличие от ClickHouse API, это достигается путем использования вариантов методов `Context`, т.е. методов, таких как `Exec`, которые по умолчанию используют фоновый контекст, имеют вариант `ExecContext`, в который можно передать контекст в качестве первого параметра. Это позволяет передавать контекст на любом этапе потока приложения. Например, пользователи могут передать контекст при установлении соединения через `ConnContext` или при запросе строки через `QueryRowContext`. Примеры всех доступных методов показаны ниже.

Для получения более подробной информации о том, как использовать контекст для передачи крайних сроков, сигналов отмены, идентификаторов запросов, ключей квоты и параметров соединения, смотрите раздел "Использование контекста" для [ClickHouse API](#using-context).

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// для создания столбца JSON нам нужно allow_experimental_object_type=1
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
    return fmt.Errorf("ожидалось завершение")
}

// установите крайний срок для запроса - это отменит запрос после достижения абсолютного времени. Снова завершает соединение только,
// запросы будут продолжаться до завершения в ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("ожидалось превышение крайнего срока")
}

// установите идентификатор запроса для помощи в трассировке запросов в логах, например, смотрите system.query_log
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
// установите ключ квоты - сначала создайте квоту
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// запросы могут быть отменены с помощью контекста
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
            fmt.Println("ожидалось завершение")
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

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### Сессии {#sessions}

В то время как родные соединения по своей природе имеют сессию, соединения через HTTP требуют от пользователя создания идентификатора сессии для передачи в контексте как параметра. Это позволяет использовать функции, например, временные таблицы, которые связаны с сессией.

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
    fmt.Printf("строка: col1=%d\n", col1)
}
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### Динамическое сканирование {#dynamic-scanning-1}

Аналогично [ClickHouse API](#dynamic-scanning), информация о типах столбцов доступна, что позволяет пользователям создавать экземпляры правильно типизированных переменных во время выполнения, которые можно передавать в функцию Scan. Это позволяет считывать столбцы, для которых тип не известен.

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

Чтобы отправить внешние данные клиенту с помощью запроса, пользователь должен создать внешнюю таблицу через `ext.NewTable`, прежде чем передать это через контекст.

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

ClickHouse позволяет передавать [контекст трассировки](/operations/opentelemetry/) в качестве части родного протокола. Клиент позволяет создать Span с помощью функции `clickhouse.withSpan` и передать его через Context для достижения этого. Это не поддерживается при использовании HTTP в качестве транспортного средства.

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

* Используйте ClickHouse API, где это возможно, особенно для примитивных типов. Это избегает значительного отражения и косвенных ссылок.
* Если вы читаете большие наборы данных, подумайте о модификации [`BlockBufferSize`](#connection-settings). Это увеличит использование памяти, но позволит декодировать больше блоков параллельно во время итерации строк. Значение по умолчанию 2 является консервативным и минимизирует накладные расходы по памяти. Более высокие значения будут означать больше блоков в памяти. Это требует тестирования, поскольку разные запросы могут производить разные размеры блоков. Это также можно установить на [уровне запроса](#using-context) через контекст.
* Будьте специфичными с вашими типами при вставке данных. Хотя клиент стремится быть гибким, например, позволяет распознавать строки для UUID или IP, это требует проверки данных и влечет за собой затраты на время вставки.
* Используйте вставки с ориентацией на столбцы, где это возможно. Снова эти вставки должны быть строго типизированы, избегая необходимости конвертировать ваши значения.
* Следуйте [рекомендациям](/sql-reference/statements/insert-into/#performance-considerations) ClickHouse для оптимальной производительности вставки.
