---
sidebar_label: 'Настройка'
sidebar_position: 2
keywords: ['clickhouse', 'go', 'golang', 'настройка', 'подключение', 'tls', 'аутентификация']
description: 'Настройка клиента clickhouse-go: настройки подключения, TLS, аутентификация, пул подключений, логирование и сжатие.'
slug: /integrations/language-clients/go/configuration
title: 'Настройка'
doc_type: 'reference'
---

# Настройка \{#configuration\}

## Настройки подключения \{#connection-settings\}

При открытии подключения для управления поведением клиента можно использовать структуру Options. Доступны следующие настройки:

| Параметр               | Тип                                                | По умолчанию       | Описание                                                                                                                                                                                      |
| ---------------------- | -------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Protocol`             | `Protocol`                                         | `Native`           | Транспортный протокол: `Native` (TCP) или `HTTP`. См. [TCP и HTTP](#tcp-vs-http).                                                                                                            |
| `Addr`                 | `[]string`                                         | —                  | Срез адресов `host:port`. Для нескольких узлов см. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).                                                                           |
| `Auth`                 | `Auth`                                             | —                  | Учетные данные для аутентификации (`Database`, `Username`, `Password`). См. [Аутентификация](#authentication).                                                                                |
| `TLS`                  | `*tls.Config`                                      | `nil`              | Конфигурация TLS. Ненулевое значение включает TLS. См. [TLS](#using-tls).                                                                                                                     |
| `DialContext`          | `func(ctx, addr) (net.Conn, error)`                | —                  | Пользовательская функция установки соединения, определяющая, как создаются TCP-подключения.                                                                                                   |
| `DialTimeout`          | `time.Duration`                                    | `30s`              | Максимальное время ожидания при открытии нового подключения.                                                                                                                                  |
| `MaxOpenConns`         | `int`                                              | `MaxIdleConns + 5` | Максимальное количество одновременно открытых подключений.                                                                                                                                    |
| `MaxIdleConns`         | `int`                                              | `5`                | Количество бездействующих подключений, которые сохраняются в пуле.                                                                                                                            |
| `ConnMaxLifetime`      | `time.Duration`                                    | `1h`               | Максимальное время жизни подключения в пуле. См. [Пул подключений](#connection-pooling).                                                                                                      |
| `ConnOpenStrategy`     | `ConnOpenStrategy`                                 | `ConnOpenInOrder`  | Стратегия выбора узла из `Addr`. См. [Подключение к нескольким узлам](#connecting-to-multiple-nodes).                                                                                         |
| `BlockBufferSize`      | `uint8`                                            | `2`                | Количество блоков, декодируемых параллельно. Более высокие значения повышают пропускную способность, но увеличивают расход памяти. Можно переопределить для отдельного запроса через context. |
| `Settings`             | `Settings`                                         | —                  | map настроек ClickHouse, применяемых к каждому запросу. Для отдельных запросов можно переопределить через [context](/integrations/language-clients/go/clickhouse-api#using-context).          |
| `Compression`          | `*Compression`                                     | `nil`              | Сжатие на уровне блоков. См. [Сжатие](#compression).                                                                                                                                          |
| `ReadTimeout`          | `time.Duration`                                    | —                  | Максимальное время ожидания чтения с сервера в рамках одного вызова.                                                                                                                          |
| `FreeBufOnConnRelease` | `bool`                                             | `false`            | Если установлено значение true, буфер памяти подключения возвращается в пул при каждом запросе. Это снижает потребление памяти ценой небольшой дополнительной нагрузки на CPU.                |
| `Logger`               | `*slog.Logger`                                     | `nil`              | Структурированный логгер (Go `log/slog`). См. [Логирование](#logging).                                                                                                                        |
| `Debug`                | `bool`                                             | `false`            | **Устарело.** Используйте `Logger`. Включает устаревший отладочный вывод в stdout.                                                                                                            |
| `Debugf`               | `func(string, ...any)`                             | —                  | **Устарело.** Используйте `Logger`. Пользовательская функция для отладочного логирования. Требует `Debug: true`.                                                                              |
| `GetJWT`               | `GetJWTFunc`                                       | —                  | Обратный вызов, возвращающий JWT-токен для аутентификации в ClickHouse Cloud (только HTTPS).                                                                                                  |
| `HttpHeaders`          | `map[string]string`                                | —                  | Дополнительные HTTP-заголовки, отправляемые с каждым запросом (только для HTTP-транспорта).                                                                                                   |
| `HttpUrlPath`          | `string`                                           | —                  | Дополнительный путь URL, добавляемый к HTTP-запросам (только для HTTP-транспорта).                                                                                                            |
| `HttpMaxConnsPerHost`  | `int`                                              | —                  | Переопределяет `MaxConnsPerHost` в базовом `http.Transport` (только для HTTP-транспорта).                                                                                                     |
| `TransportFunc`        | `func(*http.Transport) (http.RoundTripper, error)` | —                  | Пользовательская фабрика HTTP-транспорта. Транспорт по умолчанию передается для точечного переопределения (только для HTTP-транспорта).                                                       |
| `HTTPProxyURL`         | `*url.URL`                                         | —                  | URL HTTP-прокси для всех запросов (только для HTTP-транспорта).                                                                                                                               |

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

## TLS \{#using-tls\}

На базовом уровне все методы подключения клиента (`DSN/OpenDB/Open`) используют [пакет Go tls](https://pkg.go.dev/crypto/tls) для установки защищенного соединения. Клиент использует TLS, если структура Options содержит ненулевой указатель `tls.Config`.

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

Этой минимальной конфигурации `TLS.Config` обычно достаточно для подключения к защищённому собственному порту (обычно 9440) сервера ClickHouse. Если у сервера ClickHouse нет действительного сертификата (срок действия истёк, неверное имя хоста, сертификат не подписан общедоступным корневым центром сертификации), `InsecureSkipVerify` можно установить в `true`, но делать это настоятельно не рекомендуется.

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

Если требуются дополнительные параметры TLS, код приложения должен задать нужные поля в структуре `tls.Config`. Это может включать указание конкретных наборов шифров, принудительное использование определённой версии TLS (например, 1.2 или 1.3), добавление внутренней цепочки сертификатов CA, добавление клиентского сертификата (и закрытого ключа), если этого требует сервер ClickHouse, а также большинства других параметров, связанных с более специализированной настройкой безопасности.

## Аутентификация \{#authentication\}

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

## Подключение к нескольким узлам \{#connecting-to-multiple-nodes\}

Можно указать несколько адресов с помощью структуры `Addr`.

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

Доступны три стратегии подключения:

* `ConnOpenInOrder` (по умолчанию)  - адреса используются по порядку. Последующие адреса задействуются только при невозможности установить соединение с адресами, расположенными выше в списке. По сути, это стратегия переключения при отказе.
* `ConnOpenRoundRobin` - Нагрузка распределяется между адресами по стратегии round-robin.
* `ConnOpenRandom` - Узел выбирается случайным образом из списка адресов.

Это поведение можно настроить с помощью опции `ConnOpenStrategy`

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

## Пул подключений \{#connection-pooling\}

Клиент поддерживает пул подключений и повторно использует их для запросов по мере необходимости. Одновременно используется не более `MaxOpenConns` подключений, а максимальный размер пула задается параметром `MaxIdleConns`. Для выполнения каждого запроса клиент получает подключение из пула и затем возвращает его обратно для повторного использования. Подключение используется в течение всего времени жизни batch и освобождается при вызове `Send()`.

Нет гарантии, что для последующих запросов будет использовано то же самое подключение из пула, если только пользователь не задаст `MaxOpenConns=1`. Это требуется редко, но может быть необходимо при использовании временных таблиц.

Также обратите внимание, что значение `ConnMaxLifetime` по умолчанию составляет 1 час. Это может приводить к ситуациям, когда нагрузка на ClickHouse распределяется неравномерно, если узлы покидают кластер. Например, если узел становится недоступен, подключения перераспределяются на другие узлы. По умолчанию эти подключения сохраняются и не обновляются в течение 1 часа, даже если проблемный узел возвращается в кластер. При высокой нагрузке рассмотрите возможность уменьшить это значение.

Пул подключений включен как для собственного протокола Native (TCP), так и для протокола HTTP.

## Логирование \{#logging\}

Клиент поддерживает структурированное логирование через стандартный пакет Go `log/slog` с использованием поля `Logger` в `Options`. Поля `Debug` и `Debugf` считаются устаревшими, но по-прежнему работают для обратной совместимости (приоритет: `Debugf` &gt; `Logger` &gt; no-op).

```go
import (
    "log/slog"
    "os"
)

// JSON structured logging
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelDebug,
}))

conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Logger: logger,
})
```

Вы также можете дополнить логгер контекстом приложения:

```go
baseLogger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))
enrichedLogger := baseLogger.With(
    slog.String("service", "my-service"),
    slog.String("environment", "production"),
)

conn, err := clickhouse.Open(&clickhouse.Options{
    // ...
    Logger: enrichedLogger,
})
```

[Полный пример](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/logger_test.go)

## Сжатие \{#compression\}

Поддержка методов сжатия зависит от используемого протокола. Для собственного протокола клиент поддерживает сжатие `LZ4` и `ZSTD`. Оно выполняется только на уровне блоков. Чтобы включить сжатие, добавьте параметр `Compression` в настройки подключения.

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

При использовании транспорта HTTP доступны дополнительные методы сжатия: `gzip`, `deflate` и `br`. Подробности см. в разделе [Database/SQL API - Compression](/integrations/language-clients/go/database-sql-api#compression).

## TCP и HTTP \{#tcp-vs-http\}

Транспорт переключается одним параметром конфигурации — всё остальное в этом руководстве одинаково применимо к обоим вариантам. Вот что меняется:

|                                | TCP (собственный протокол)              | HTTP                                                                       |
| :----------------------------- | :-------------------------------------- | :------------------------------------------------------------------------- |
| **Порт по умолчанию**          | 9000 (без шифрования), 9440 (TLS)       | 8123 (без шифрования), 8443 (TLS)                                          |
| **Включение**                  | По умолчанию — не указывайте `Protocol` | `Protocol: clickhouse.HTTP` или используйте DSN с `http://`                |
| **Сжатие**                     | `lz4`, `zstd`                           | `lz4`, `zstd`, `gzip`, `deflate`, `br`                                     |
| **Сессии**                     | Встроены (всегда активны)               | Явно — передайте `session_id` как параметр                                 |
| **HTTP-заголовки**             | —                                       | `HttpHeaders`, `HttpUrlPath`, `HttpMaxConnsPerHost`                        |
| **Пользовательский транспорт** | —                                       | `TransportFunc`                                                            |
| **JWT-аутентификация**         | —                                       | `GetJWT` (HTTPS в ClickHouse Cloud)                                        |
| **OpenTelemetry (`WithSpan`)** | ✅                                       | Сервер поддерживает это; клиент пока не отправляет заголовок `traceparent` |

Чтобы переключить любой API на HTTP:

```go
// ClickHouse API over HTTP
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:     []string{"host:8123"},
    Protocol: clickhouse.HTTP,
    // ... auth, etc.
})

// database/sql over HTTP — via Options
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr:     []string{"host:8123"},
    Protocol: clickhouse.HTTP,
    // ... auth, etc.
})

// database/sql over HTTP — via DSN
conn, err := sql.Open("clickhouse", "http://host:8123?username=user&password=pass")
```
