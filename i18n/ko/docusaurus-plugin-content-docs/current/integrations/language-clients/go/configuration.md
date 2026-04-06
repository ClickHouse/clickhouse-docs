---
sidebar_label: '구성'
sidebar_position: 2
keywords: ['ClickHouse', 'go', 'golang', '구성', '연결', 'TLS', '인증']
description: 'clickhouse-go 클라이언트 구성: 연결 설정, TLS, 인증, 풀링, 로깅, 압축.'
slug: /integrations/language-clients/go/configuration
title: '구성'
doc_type: 'reference'
---

# 구성 \{#configuration\}

## 연결 설정 \{#connection-settings\}

연결을 열 때 `Options` 구조체를 사용해 클라이언트 동작을 제어할 수 있습니다. 사용할 수 있는 설정은 다음과 같습니다.

| 매개변수                   | 타입                                                 | 기본값                | 설명                                                                                                                                 |
| ---------------------- | -------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Protocol`             | `Protocol`                                         | `Native`           | 전송 프로토콜입니다: `Native`(TCP) 또는 `HTTP`입니다. [TCP vs HTTP](#tcp-vs-http)를 참조하십시오.                                                       |
| `Addr`                 | `[]string`                                         | —                  | `host:port` 주소의 슬라이스입니다. 여러 노드에 연결하는 방법은 [여러 노드에 연결하기](#connecting-to-multiple-nodes)를 참조하십시오.                                     |
| `Auth`                 | `Auth`                                             | —                  | 인증 자격 증명(`Database`, `Username`, `Password`)입니다. [인증](#authentication)을 참조하십시오.                                                    |
| `TLS`                  | `*tls.Config`                                      | `nil`              | TLS 구성입니다. `nil`이 아닌 값을 지정하면 TLS가 활성화됩니다. [TLS](#using-tls)를 참조하십시오.                                                               |
| `DialContext`          | `func(ctx, addr) (net.Conn, error)`                | —                  | TCP 연결을 설정하는 방식을 제어하는 사용자 지정 dial 함수입니다.                                                                                           |
| `DialTimeout`          | `time.Duration`                                    | `30s`              | 새 연결을 열 때까지 대기하는 최대 시간입니다.                                                                                                         |
| `MaxOpenConns`         | `int`                                              | `MaxIdleConns + 5` | 동시에 열 수 있는 최대 연결 수입니다.                                                                                                             |
| `MaxIdleConns`         | `int`                                              | `5`                | 커넥션 풀에 유지할 유휴 연결 수입니다.                                                                                                             |
| `ConnMaxLifetime`      | `time.Duration`                                    | `1h`               | 풀에 있는 연결의 최대 수명입니다. [커넥션 풀링](#connection-pooling)을 참조하십시오.                                                                         |
| `ConnOpenStrategy`     | `ConnOpenStrategy`                                 | `ConnOpenInOrder`  | `Addr`에서 노드를 선택하는 전략입니다. [여러 노드에 연결하기](#connecting-to-multiple-nodes)를 참조하십시오.                                                     |
| `BlockBufferSize`      | `uint8`                                            | `2`                | 병렬로 디코딩할 블록 수입니다. 값이 클수록 처리량은 증가하지만 메모리 사용량도 늘어납니다. context를 통해 쿼리별로 재정의할 수 있습니다.                                               |
| `Settings`             | `Settings`                                         | —                  | 모든 쿼리에 적용되는 ClickHouse 설정의 맵입니다. 개별 쿼리는 [context](/integrations/language-clients/go/clickhouse-api#using-context)를 통해 재정의할 수 있습니다. |
| `Compression`          | `*Compression`                                     | `nil`              | 블록 수준 압축입니다. [압축](#compression)을 참조하십시오.                                                                                        |
| `ReadTimeout`          | `time.Duration`                                    | —                  | 단일 호출에서 서버의 읽기 응답을 기다리는 최대 시간입니다.                                                                                                  |
| `FreeBufOnConnRelease` | `bool`                                             | `false`            | true이면 쿼리마다 연결의 메모리 버퍼를 풀에 반환합니다. CPU 비용이 약간 증가하는 대신 메모리 사용량을 줄일 수 있습니다.                                                           |
| `Logger`               | `*slog.Logger`                                     | `nil`              | 구조화된 로거(Go `log/slog`)입니다. [로깅](#logging)을 참조하십시오.                                                                                 |
| `Debug`                | `bool`                                             | `false`            | **사용 중단되었습니다.** 대신 `Logger`를 사용하십시오. stdout에 레거시 디버그 출력을 활성화합니다.                                                                   |
| `Debugf`               | `func(string, ...any)`                             | —                  | **사용 중단되었습니다.** 대신 `Logger`를 사용하십시오. 사용자 지정 디버그 로그 함수입니다. `Debug: true`가 필요합니다.                                                    |
| `GetJWT`               | `GetJWTFunc`                                       | —                  | ClickHouse Cloud 인증용 JWT token을 반환하는 callback입니다(HTTPS 전용).                                                                        |
| `HttpHeaders`          | `map[string]string`                                | —                  | 모든 요청에 포함되는 추가 HTTP 헤더입니다(HTTP 전송 전용).                                                                                         |
| `HttpUrlPath`          | `string`                                           | —                  | HTTP 요청에 추가되는 URL 경로입니다(HTTP 전송 전용).                                                                                               |
| `HttpMaxConnsPerHost`  | `int`                                              | —                  | 내부 `http.Transport`의 `MaxConnsPerHost`를 재정의합니다(HTTP 전송 전용).                                                                        |
| `TransportFunc`        | `func(*http.Transport) (http.RoundTripper, error)` | —                  | 사용자 지정 HTTP 전송 팩터리입니다. 필요한 항목만 선택적으로 재정의할 수 있도록 기본 전송가 함께 전달됩니다(HTTP 전송 전용).                                         |
| `HTTPProxyURL`         | `*url.URL`                                         | —                  | 모든 요청에 사용할 HTTP 프록시 URL입니다(HTTP 전송 전용).                                                                                            |

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)

## TLS \{#using-tls\}

하위 수준에서는 모든 클라이언트 연결 메서드(`DSN/OpenDB/Open`)가 [Go tls 패키지](https://pkg.go.dev/crypto/tls)를 사용하여 보안 연결을 설정합니다. 클라이언트는 Options 구조체에 nil이 아닌 `tls.Config` 포인터가 포함되어 있으면 TLS를 사용합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

이처럼 최소한으로 설정한 `TLS.Config`만으로도 일반적으로 ClickHouse 서버의 보안 네이티브 포트(보통 9440)에 연결하기에 충분합니다. ClickHouse 서버에 유효한 인증서가 없는 경우(만료됨, 호스트 이름이 일치하지 않음, 공개적으로 신뢰되는 루트 인증 기관의 서명이 없음) `InsecureSkipVerify`를 true로 설정할 수 있지만, 이는 권장되지 않습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

추가 TLS 매개변수가 필요한 경우, 애플리케이션 코드에서 `tls.Config` 구조체의 원하는 필드를 설정해야 합니다. 여기에는 특정 cipher suite 지정, 특정 TLS 버전(예: 1.2 또는 1.3) 강제, 내부 CA 인증서 체인 추가, ClickHouse 서버에서 요구하는 경우 클라이언트 인증서(및 개인 키) 추가, 그리고 보다 특수한 보안 구성에 포함되는 대부분의 다른 옵션이 포함될 수 있습니다.

## 인증 \{#authentication\}

사용자 이름과 비밀번호를 지정하려면 connection details에 Auth 구조체를 지정합니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

## 여러 노드에 연결하기 \{#connecting-to-multiple-nodes\}

여러 주소는 `Addr` 구조체를 통해 지정할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

세 가지 연결 전략을 사용할 수 있습니다:

* `ConnOpenInOrder` (기본값)  - 주소를 순서대로 사용합니다. 목록에서 앞에 있는 주소로 연결하지 못한 경우에만 그다음 주소를 사용합니다. 이는 사실상 장애 조치(failover) 전략입니다.
* `ConnOpenRoundRobin` - 라운드 로빈 전략을 사용하여 주소 간에 부하를 분산합니다.
* `ConnOpenRandom` - 주소 목록에서 노드를 무작위로 선택합니다.

이는 `ConnOpenStrategy` 옵션으로 제어할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)

## 연결 풀링 \{#connection-pooling\}

클라이언트는 연결 풀을 유지하며, 필요에 따라 쿼리 간에 연결을 재사용합니다. 어느 시점에서든 최대 `MaxOpenConns`까지 사용되며, 풀의 최대 크기는 `MaxIdleConns`로 제어됩니다. 클라이언트는 각 쿼리를 실행할 때마다 풀에서 연결을 하나 가져오고, 재사용할 수 있도록 다시 풀로 반환합니다. 연결은 배치의 수명 주기 동안 사용되며 `Send()` 시 해제됩니다.

사용자가 `MaxOpenConns=1`로 설정하지 않는 한, 풀에 있는 동일한 연결이 후속 쿼리에도 사용된다고 보장할 수는 없습니다. 이는 드문 경우이지만, 임시 테이블(temporary table)을 사용하는 경우에는 필요할 수 있습니다.

또한 `ConnMaxLifetime`의 기본값은 1시간입니다. 이로 인해 노드가 클러스터를 이탈하면 ClickHouse에 대한 부하가 불균형해질 수 있습니다. 예를 들어 특정 노드를 사용할 수 없게 되면 연결이 다른 노드로 분산됩니다. 이후 문제가 있던 노드가 클러스터에 다시 합류하더라도, 이러한 연결은 기본적으로 1시간 동안 유지되며 갱신되지 않습니다. 작업 부하가 큰 경우에는 이 값을 낮추는 것을 고려하십시오.

연결 풀링은 네이티브(TCP) 및 HTTP 프로토콜 모두에서 활성화됩니다.

## 로깅 \{#logging\}

클라이언트는 `Options`의 `Logger` 필드를 사용해 Go 표준 `log/slog` 패키지로 구조화된 로깅을 지원합니다. 기존의 `Debug` 및 `Debugf` 필드는 사용 중단되었지만, 이전 버전과의 호환성을 위해 여전히 사용할 수 있습니다(우선순위: `Debugf` &gt; `Logger` &gt; no-op).

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

애플리케이션 수준의 Context를 로거에 추가할 수도 있습니다:

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/logger_test.go)

## 압축 \{#compression\}

압축 방식 지원 여부는 사용 중인 기반 프로토콜에 따라 달라집니다. 네이티브 프로토콜에서는 클라이언트가 `LZ4` 및 `ZSTD` 압축을 지원합니다. 이는 블록 수준에서만 수행됩니다. 연결에 `Compression` 구성을 포함하면 압축을 활성화할 수 있습니다.

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

[전체 예시](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

HTTP 전송을 사용하는 경우 `gzip`, `deflate`, `br`와 같은 추가 압축 기법을 사용할 수 있습니다. 자세한 내용은 [데이터베이스/SQL API - 압축](/integrations/language-clients/go/database-sql-api#compression)을 참조하십시오.

## TCP와 HTTP \{#tcp-vs-http\}

전송 방식은 구성에서 한 가지만 바꾸면 되며, 이 가이드의 나머지 내용은 두 방식 모두에 동일하게 적용됩니다. 달라지는 사항은 다음과 같습니다.

|                                | TCP (네이티브 프로토콜)       | HTTP                                                |
| :----------------------------- | :-------------------- | :-------------------------------------------------- |
| **기본 포트**                      | 9000 (평문), 9440 (TLS) | 8123 (평문), 8443 (TLS)                               |
| **사용 설정**                      | 기본값 — `Protocol` 생략   | `Protocol: clickhouse.HTTP` 또는 `http://` DSN 사용     |
| **압축**                         | `lz4`, `zstd`         | `lz4`, `zstd`, `gzip`, `deflate`, `br`              |
| **세션**                         | 기본 제공(항상 활성)          | 명시적 — 설정으로 `session_id` 전달                          |
| **HTTP 헤더**                    | —                     | `HttpHeaders`, `HttpUrlPath`, `HttpMaxConnsPerHost` |
| **사용자 지정 전송**                  | —                     | `TransportFunc`                                     |
| **JWT 인증**                     | —                     | `GetJWT` (ClickHouse Cloud HTTPS)                   |
| **OpenTelemetry (`WithSpan`)** | ✅                     | 서버는 이를 지원하지만, 클라이언트는 아직 `traceparent` 헤더를 전송하지 않습니다 |

두 API 중 하나를 HTTP로 전환하려면:

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
