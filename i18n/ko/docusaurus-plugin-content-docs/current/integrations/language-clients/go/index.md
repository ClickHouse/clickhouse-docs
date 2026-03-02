---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'ClickHouse용 Go 클라이언트는 Go 표준 database/sql 인터페이스 또는 최적화된 네이티브 인터페이스를 사용해 ClickHouse에 연결할 수 있도록 합니다.'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go \{#clickhouse-go\}

## 간단한 예제 \{#a-simple-example\}

Go로 작성한 간단한 예제부터 살펴보겠습니다. 이 예제는 ClickHouse에 연결해 `system` 데이터베이스에서 조회합니다. 시작하려면 연결 정보가 필요합니다.

### 연결 정보 \{#connection-details\}

<ConnectionDetails />

### 모듈 초기화 \{#initialize-a-module\}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```


### 샘플 코드 복사하기 \{#copy-in-some-sample-code\}

이 코드를 `clickhouse-golang-example` 디렉터리의 `main.go` 파일로 저장합니다.

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


### go mod tidy를 실행하기 \{#run-go-mod-tidy\}

```bash
go mod tidy
```


### 연결 정보 설정 \{#set-your-connection-details\}

이전에 연결 정보를 확인했습니다. 이제 `main.go` 파일의 `connect()` 함수에 이 값을 설정합니다:

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


### 예제 실행 \{#run-the-example\}

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


### 더 알아보기 \{#learn-more\}

이 범주의 나머지 문서에서는 ClickHouse Go 클라이언트에 대해 보다 자세히 설명합니다.

## ClickHouse Go 클라이언트 \{#clickhouse-go-client\}

ClickHouse는 두 개의 공식 Go 클라이언트를 지원합니다. 이들 클라이언트는 상호 보완적이며, 의도적으로 서로 다른 사용 사례를 지원합니다.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go 표준 `database/sql` 인터페이스 또는 네이티브 인터페이스를 지원하는 고수준 언어 클라이언트입니다.
* [ch-go](https://github.com/ClickHouse/ch-go) - 저수준 클라이언트입니다. 네이티브 인터페이스만 지원합니다.

clickhouse-go는 고수준 인터페이스를 제공하여, 행(row) 지향 시맨틱과 배치 처리(batching)를 사용해 데이터를 쿼리하고 삽입할 수 있도록 합니다. 이때 데이터 타입에는 비교적 유연하게 동작하며, 잠재적인 정밀도 손실이 발생하지 않는 한 값을 변환합니다. 반면 ch-go는 최적화된 컬럼(column) 지향 인터페이스를 제공하여, 타입 엄격성과 더 복잡한 사용성을 감수하는 대신 낮은 CPU 및 메모리 오버헤드로 빠른 데이터 블록 스트리밍을 제공합니다.

버전 2.3부터 clickhouse-go는 인코딩, 디코딩, 압축과 같은 저수준 기능에 ch-go를 활용합니다. 또한 clickhouse-go는 Go `database/sql` 인터페이스 표준도 지원합니다. 두 클라이언트 모두 인코딩에 네이티브 포맷을 사용하여 최적의 성능을 제공하며, 네이티브 ClickHouse 프로토콜을 통해 통신할 수 있습니다. clickhouse-go는 또한 프록시 사용이나 트래픽 로드 밸런싱 요구 사항이 있는 경우를 위해 HTTP를 전송 메커니즘으로도 지원합니다.

클라이언트 라이브러리를 선택할 때는 각 클라이언트 라이브러리의 장단점을 파악해야 합니다. 자세한 내용은 ["라이브러리 선택(Choosing a Library)"](/integrations/go#choosing-a-client)을 참조하십시오.

|               | Native format | Native protocol | HTTP protocol | Row Orientated API | Column Orientated API | Type flexibility | Compression | Query Placeholders |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |

## 클라이언트 선택하기 \{#choosing-a-client\}

클라이언트 라이브러리 선택은 사용 패턴과 최적의 성능 요구 사항에 따라 달라집니다. 초당 수백만 건 수준의 대량 INSERT가 필요한 경우에는 저수준 클라이언트인 [ch-go](https://github.com/ClickHouse/ch-go) 사용을 권장합니다. 이 클라이언트는 ClickHouse 네이티브 포맷이 요구하는 것처럼 행 기반(row-oriented) 포맷에서 컬럼 기반 포맷으로 변환(pivot)할 때 발생하는 오버헤드를 피합니다. 또한 사용 편의를 위해 리플렉션(reflection)이나 `interface{}` (`any`) 타입 사용도 피합니다.

집계에 중점을 둔 쿼리 워크로드나 처리량이 낮은 INSERT 워크로드의 경우, [clickhouse-go](https://github.com/ClickHouse/clickhouse-go)는 익숙한 `database/sql` 인터페이스와 더 직관적인 행 중심 동작 방식을 제공합니다. 또한 선택적으로 전송 프로토콜로 HTTP를 사용할 수 있으며, 헬퍼 함수를 활용하여 행을 struct로 또는 그 반대로 마샬링할 수 있습니다.

## clickhouse-go 클라이언트 \{#the-clickhouse-go-client\}

clickhouse-go 클라이언트는 ClickHouse와 통신하기 위한 두 가지 API 인터페이스를 제공합니다:

* ClickHouse 클라이언트 전용 API
* `database/sql` 표준 - Go 언어에서 제공하는 SQL 데이터베이스용 범용 인터페이스

`database/sql`은 데이터베이스에 구애받지 않는 인터페이스를 제공하여 개발자가 데이터 저장소를 추상화할 수 있게 하지만, 타입 및 쿼리 의미 체계를 강제함으로써 성능에 영향을 줄 수 있습니다. 이러한 이유로 [성능이 중요한 경우](https://github.com/clickHouse/clickHouse-go#benchmark)에는 클라이언트 전용 API를 사용하는 것이 좋습니다. 그러나 여러 데이터베이스를 지원하는 도구에 ClickHouse를 통합해야 하는 경우에는 표준 인터페이스를 선호할 수 있습니다.

두 인터페이스 모두 통신을 위해 [네이티브 포맷](/native-protocol/basics.md)과 네이티브 프로토콜을 사용하여 데이터를 인코딩합니다. 또한 표준 인터페이스는 HTTP를 통한 통신도 지원합니다.

|                    | 네이티브 포맷 | 네이티브 프로토콜 | HTTP 프로토콜 | 대량 쓰기 지원 | struct 마샬링 | 압축 | 쿼리 플레이스홀더 |
|:------------------:|:-------------:|:-----------------:|:-------------:|:--------------:|:-------------:|:---:|:-----------------:|
|   ClickHouse API   |       ✅       |        ✅          |               |        ✅       |       ✅       |  ✅  |         ✅         |
| `database/sql` API |       ✅       |        ✅          |       ✅       |        ✅       |               |  ✅  |         ✅         |

## 설치 \{#installation\}

v1 드라이버는 사용 중단(deprecated)되었으며, 더 이상 기능 업데이트나 새로운 ClickHouse 타입에 대한 지원이 제공되지 않습니다. 성능이 더 뛰어난 v2로 마이그레이션해야 합니다.

2.x 버전 클라이언트를 설치하려면 `go.mod` 파일에 다음 패키지를 추가합니다:

`require github.com/ClickHouse/clickhouse-go/v2 main`

또는 리포지토리를 클론합니다:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

다른 버전을 설치하려면 경로 또는 브랜치 이름을 해당 버전에 맞게 수정하십시오.

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


### 버전 관리 및 호환성 \{#versioning--compatibility\}

클라이언트는 ClickHouse와는 별도로 릴리스됩니다. 2.x는 현재 개발 중인 메이저 버전을 나타냅니다. 2.x의 모든 버전은 서로 호환됩니다.

#### ClickHouse 호환성 \{#clickhouse-compatibility\}

클라이언트는 다음을 지원합니다.

- [여기](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)에 기록된, 현재 지원되는 모든 ClickHouse 버전. ClickHouse 버전에 대한 지원이 종료되면 해당 버전은 클라이언트 릴리스에서 더 이상 적극적으로 테스트되지 않습니다.
- 클라이언트가 릴리스된 날짜로부터 2년 이내의 모든 ClickHouse 버전. 단, LTS 버전만 적극적으로 테스트합니다.

#### Golang 호환성 \{#golang-compatibility\}

| 클라이언트 버전 | Golang 버전 |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |

## ClickHouse 클라이언트 API \{#clickhouse-client-api\}

ClickHouse 클라이언트 API용 모든 코드 예제는 [여기](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)에서 확인할 수 있습니다.

### 연결 \{#connecting\}

다음 예제는 서버 버전을 반환하는 코드로, ClickHouse에 연결하는 방법을 보여줍니다. 여기서는 ClickHouse가 보안이 적용되지 않았고 기본 사용자 계정으로 접근할 수 있다고 가정합니다.

연결 시 기본 네이티브 포트를 사용합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**이후에 나오는 모든 예제에서는, 별도로 명시되지 않는 한 ClickHouse `conn` 변수가 생성되어 있어 사용 가능한 것으로 가정합니다.**


#### 연결 설정 \{#connection-settings\}

연결을 열 때 Options 구조체를 사용하여 클라이언트 동작 방식을 제어할 수 있습니다. 다음과 같은 설정을 사용할 수 있습니다:

* `Protocol` - Native 또는 HTTP입니다. HTTP는 현재 [database/sql API](#databasesql-api)에 대해서만 지원됩니다.
* `TLS` - TLS 옵션입니다. nil이 아닌 값이면 TLS가 활성화됩니다. [Using TLS](#using-tls)를 참조하십시오.
* `Addr` - 포트를 포함한 주소 슬라이스입니다.
* `Auth` - 인증 세부 정보입니다. [Authentication](#authentication)을 참조하십시오.
* `DialContext` - 연결을 어떻게 설정할지 결정하는 사용자 정의 dial 함수입니다.
* `Debug` - 디버깅 활성화 여부를 나타내는 true/false 값입니다.
* `Debugf` - 디버그 출력을 처리하기 위한 함수입니다. `debug`가 true로 설정되어 있어야 합니다.
* `Settings` - ClickHouse 설정의 맵입니다. 모든 ClickHouse 쿼리에 적용됩니다. [Using Context](#using-context)를 사용하면 쿼리별로 설정을 지정할 수 있습니다.
* `Compression` - 블록 압축을 활성화합니다. [Compression](#compression)을 참조하십시오.
* `DialTimeout` - 연결을 설정하기 위한 최대 시간입니다. 기본값은 `1s`입니다.
* `MaxOpenConns` - 동시에 사용할 수 있는 최대 연결 수입니다. 유휴 풀에 있는 연결 수는 이보다 많을 수도, 적을 수도 있지만, 동시에 사용할 수 있는 연결 수는 이 값으로 제한됩니다. 기본값은 `MaxIdleConns+5`입니다.
* `MaxIdleConns` - 풀에 유지할 연결 수입니다. 가능하면 연결을 재사용합니다. 기본값은 `5`입니다.
* `ConnMaxLifetime` - 연결을 사용 가능한 상태로 유지하는 최대 수명입니다. 기본값은 1시간입니다. 이 시간이 지나면 연결이 파기되고, 필요에 따라 새 연결이 풀에 추가됩니다.
* `ConnOpenStrategy` - 노드 주소 목록을 어떻게 순회하고 이를 사용해 연결을 열지 결정합니다. [Connecting to Multiple Nodes](#connecting-to-multiple-nodes)를 참조하십시오.
* `BlockBufferSize` - 한 번에 버퍼로 디코딩할 최대 블록 수입니다. 값을 크게 하면 메모리 사용량이 증가하는 대신 병렬 처리가 향상됩니다. 블록 크기는 쿼리에 따라 달라지므로, 연결 수준에서 이 값을 설정할 수는 있지만, 반환되는 데이터에 따라 쿼리별로 재정의할 것을 권장합니다. 기본값은 `2`입니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)


#### Connection pooling \{#connection-pooling\}

클라이언트는 연결 풀(connection pool)을 유지하며, 필요에 따라 쿼리 간에 이 연결들을 재사용합니다. 어느 시점에서든 최대 `MaxOpenConns`개의 연결이 사용되며, 풀의 최대 크기는 `MaxIdleConns`로 제어됩니다. 클라이언트는 각 쿼리를 실행할 때마다 풀에서 연결을 하나 가져와 사용한 뒤, 재사용을 위해 다시 풀에 반환합니다. 하나의 연결은 배치(batch)의 전체 수명 동안 사용되며, `Send()` 시점에 해제됩니다.

사용자가 `MaxOpenConns=1`로 설정하지 않는 이상, 이후 쿼리에서 풀 내의 동일한 연결이 사용된다는 보장은 없습니다. 이는 드물게 필요하지만, 사용자가 임시 테이블을 사용하는 경우 필요할 수 있습니다.

또한 `ConnMaxLifetime`의 기본값은 1시간이라는 점에 유의하십시오. 이는 노드가 클러스터에서 이탈하는 경우 ClickHouse에 대한 부하가 불균형해지는 상황을 초래할 수 있습니다. 노드가 사용 불가능해지면 연결은 다른 노드들로 분배되며, 이러한 연결은 문제가 된 노드가 클러스터로 복귀하더라도 기본적으로 1시간 동안 유지되고 갱신되지 않습니다. 부하가 많은 워크로드에서는 이 값을 낮추는 것을 고려하십시오.

Connection pooling은 Native(TCP)와 HTTP 프로토콜 모두에서 활성화되어 있습니다.

### TLS 사용 \{#using-tls\}

내부적으로는 모든 클라이언트 연결 메서드(`DSN/OpenDB/Open`)가 보안 연결을 설정하기 위해 [Go tls 패키지](https://pkg.go.dev/crypto/tls)를 사용합니다. `Options` 구조체에 nil이 아닌 `tls.Config` 포인터가 포함되어 있으면, 클라이언트는 TLS를 사용해야 한다는 것을 인식합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

이 최소한의 `TLS.Config` 설정이면 일반적으로 ClickHouse 서버의 보안 기본(native) 포트(보통 9440)에 연결하기에 충분합니다. ClickHouse 서버에 유효한 인증서(만료되었거나, 호스트 이름이 잘못되었거나, 공인 루트 인증 기관이 서명하지 않은 경우 등)가 없는 경우 `InsecureSkipVerify`를 true로 설정할 수 있지만, 이는 강력히 권장하지 않습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

추가적인 TLS 매개변수가 필요하면 애플리케이션 코드에서 `tls.Config` 구조체의 해당 필드를 설정해야 합니다. 여기에는 특정 암호 스위트 지정, 특정 TLS 버전(예: 1.2 또는 1.3) 강제 사용, 내부 CA 인증서 체인 추가, ClickHouse 서버에서 요구하는 경우 클라이언트 인증서(및 개인 키) 추가, 그리고 보다 정교한 보안 구성을 위해 제공되는 대부분의 다른 옵션들이 포함될 수 있습니다.


### 인증 \{#authentication\}

연결 설정에서 `Auth` 구조체를 지정해 사용자 이름과 비밀번호를 명시합니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)


### 여러 노드에 연결하기 \{#connecting-to-multiple-nodes\}

여러 개의 주소를 `Addr` 구조체를 통해 지정할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

두 가지 연결 전략을 사용할 수 있습니다.

* `ConnOpenInOrder`(기본값) - 주소가 순서대로 사용됩니다. 목록 앞부분의 주소로 연결에 실패한 경우에만 뒷부분의 주소가 사용됩니다. 사실상 장애 조치(failover) 전략입니다.
* `ConnOpenRoundRobin` - 라운드 로빈(round-robin) 전략을 사용하여 여러 주소 간에 부하를 분산합니다.

이는 `ConnOpenStrategy` 옵션을 통해 제어할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)


### 실행 \{#execution\}

임의의 SQL 문은 `Exec` 메서드를 통해 실행할 수 있습니다. 이는 DDL 및 간단한 SQL 문에 유용합니다. 대량 insert 작업이나 쿼리 반복 실행에는 사용하지 않는 것이 좋습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

`Context`를 쿼리에 전달할 수 있다는 점에 유의하십시오. 이는 특정 쿼리 단위 설정을 전달하는 데 사용할 수 있습니다. 자세한 내용은 [Context 사용](#using-context)을 참조하십시오.


### 배치 삽입 \{#batch-insert\}

대량의 행을 삽입하기 위해 클라이언트는 배치 단위를 지원합니다. 이를 위해 먼저 행을 추가할 수 있는 배치를 준비해야 합니다. 준비된 배치는 최종적으로 `Send()` 메서드를 통해 전송됩니다. 배치는 `Send`가 실행될 때까지 메모리에 유지됩니다.

연결 누수를 방지하려면 배치에서 `Close`를 호출하는 것이 좋습니다. 이는 배치를 준비한 직후 `defer` 키워드를 사용하여 수행할 수 있습니다. 이렇게 하면 `Send`가 한 번도 호출되지 않은 경우에도 연결이 정리됩니다. 행이 하나도 추가되지 않았다면, 쿼리 로그에는 0개의 행이 삽입된 것으로만 표시된다는 점에 유의하십시오.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouse 관련 권장 사항은 [여기](/guides/inserting-data#best-practices-for-inserts)에 설명되어 있습니다. 배치는 고루틴(go-routine) 간에 공유하지 말고, 각 루틴마다 별도의 배치를 생성해야 합니다.

위 예제에서 행을 추가할 때 변수 타입이 컬럼 타입과 일치해야 한다는 점에 유의하십시오. 매핑은 보통 명확하지만, 이 인터페이스는 유연하게 동작하도록 설계되어 정밀도 손실이 발생하지 않는 한 타입을 변환합니다. 예를 들어, 다음 예제는 문자열을 datetime64에 삽입하는 방법을 보여 줍니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

컬럼 타입별로 지원되는 Go 타입의 전체 요약은 [Type Conversions](#type-conversions)를 참고하십시오.


### 행 조회 \{#querying-rows\}

단일 행을 조회하려면 `QueryRow` 메서드를 사용하거나, `Query`를 통해 결과 집합을 순회하기 위한 커서를 얻을 수 있습니다. 전자는 직렬화할 데이터를 담을 대상을 인수로 받는 반면, 후자는 각 행마다 `Scan`을 호출해야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

두 경우 모두, 각각의 컬럼 값이 직렬화될 변수의 포인터를 전달해야 합니다. 이러한 포인터는 `SELECT` 문에 지정된 순서대로 전달해야 합니다. 위의 예시처럼 `SELECT *`가 사용되는 경우에는 기본적으로 컬럼이 선언된 순서가 사용됩니다.

삽입과 마찬가지로 `Scan` 메서드에 전달되는 대상 변수는 적절한 타입이어야 합니다. 이는 마찬가지로 가능한 한 유연하도록 설계되었으며, 정밀도 손실이 발생하지 않는 한 타입 변환이 수행됩니다. 예를 들어, 위의 예시는 UUID 컬럼을 문자열 변수로 읽는 방법을 보여 줍니다. 각 Column 타입별로 지원되는 Go 타입의 전체 목록은 [Type Conversions](#type-conversions)를 참조하십시오.

마지막으로 `Query` 및 `QueryRow` 메서드에 `Context`를 전달할 수 있다는 점에 유의하십시오. 이는 쿼리 수준 설정에 사용할 수 있습니다. 자세한 내용은 [Using Context](#using-context)를 참조하십시오.


### Async Insert \{#async-insert\}

비동기 insert는 `Async` 메서드를 통해 사용할 수 있습니다. 이 메서드를 사용하면 클라이언트가 서버가 insert 작업을 완료할 때까지 대기할지, 아니면 데이터가 수신된 직후 응답할지를 지정할 수 있습니다. 이를 통해 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) 파라미터를 제어할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)


### 열 지향 삽입 \{#columnar-insert\}

데이터를 컬럼 형식으로 삽입할 수 있습니다. 데이터가 이미 이러한 구조로 구성되어 있는 경우, 행 기반으로 변환할 필요가 없으므로 성능상 이점을 얻을 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)


### 구조체 사용 \{#using-structs\}

일반적으로 Golang 구조체는 ClickHouse에서 하나의 데이터 행을 논리적으로 표현합니다. 이를 지원하기 위해 네이티브 인터페이스에서 여러 가지 편리한 함수를 제공합니다.

#### serialize를 사용한 Select \{#select-with-serialize\}

`Select` 메서드는 단일 호출만으로 응답 행 집합을 구조체 슬라이스로 마샬링할 수 있게 해줍니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)


#### struct 스캔 \{#scan-struct\}

`ScanStruct`를 사용하면 쿼리 결과의 단일 행을 struct로 마샬링할 수 있습니다.

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)


#### 구조체 추가 \{#append-struct\}

`AppendStruct`는 구조체를 기존 [배치](#batch-insert)에 추가하고 하나의 완전한 행으로 해석할 수 있도록 합니다. 이를 위해서는 구조체의 필드들이 테이블의 컬럼과 이름과 타입이 모두 일치해야 합니다. 모든 컬럼에는 이에 해당하는 구조체 필드가 있어야 하지만, 구조체의 일부 필드는 이에 해당하는 컬럼 표현이 없을 수 있습니다. 이러한 필드들은 단순히 무시됩니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)


### Type conversions \{#type-conversions\}

클라이언트는 데이터 삽입과 응답 마샬링 모두에 대해 가능한 한 다양한 변수 타입을 유연하게 허용하는 것을 목표로 합니다. 대부분의 경우 ClickHouse 컬럼 타입에 대응하는 Golang 타입이 존재합니다. 예를 들어 [UInt64](/sql-reference/data-types/int-uint/)는 [uint64](https://pkg.go.dev/builtin#uint64)에 매핑됩니다. 이러한 논리적 매핑은 항상 지원되어야 합니다. 변수 자체나 수신된 데이터에 대한 변환이 먼저 이루어지는 경우, 그 결과를 컬럼에 삽입하거나 응답을 수신하는 데 사용할 수 있는 다양한 변수 타입을 활용할 수 있습니다. 클라이언트는 이러한 변환을 투명하게 지원하여, 삽입 전에 데이터를 정확히 일치시키기 위해 사용자가 직접 변환할 필요가 없도록 하고, 쿼리 시에도 유연한 마샬링을 제공하는 것을 목표로 합니다. 이와 같은 투명한 변환은 정밀도 손실을 허용하지 않습니다. 예를 들어 `uint32`는 `UInt64` 컬럼에서 데이터를 수신하는 데 사용할 수 없습니다. 반대로, 문자열은 포맷 요구 사항을 만족하는 경우 `datetime64` 필드에 삽입할 수 있습니다.

현재 원시 타입에 대해 지원되는 타입 변환은 [여기](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)에 정리되어 있습니다.

이 작업은 계속 진행 중이며, 삽입 시점(`Append`/`AppendRow`)과 읽기 시점(`Scan`을 통해)으로 구분할 수 있습니다. 특정 변환에 대한 지원이 필요한 경우 이슈를 등록해 주십시오.

### 복합 타입 \{#complex-types\}

#### Date/DateTime 타입 \{#datedatetime-types\}

ClickHouse Go 클라이언트는 `Date`, `Date32`, `DateTime`, `DateTime64` 날짜/DateTime 타입을 지원합니다. 날짜는 `2006-01-02` 형식의 문자열로 삽입하거나 Go의 기본 타입인 `time.Time{}` 또는 `sql.NullTime`을 사용하여 삽입할 수 있습니다. DateTime 역시 `time.Time{}` 및 `sql.NullTime`을 지원하지만, 문자열로 전달하는 경우에는 선택적인 타임존 오프셋과 함께 `2006-01-02 15:04:05` 형식을 사용해야 합니다(예: `2006-01-02 15:04:05 +08:00`). 읽기 시점에는 `time.Time{}` 및 `sql.NullTime`이 모두 지원되며, `sql.Scanner` 인터페이스를 구현한 모든 타입을 사용할 수 있습니다.

타임존 정보의 처리 방식은 ClickHouse 타입과 값이 삽입되는지, 읽히는지 여부에 따라 달라집니다.

* **DateTime/DateTime64**
  * **삽입(insert)** 시점에는 값이 UNIX 타임스탬프 형식으로 ClickHouse에 전송됩니다. 타임존이 제공되지 않으면 클라이언트는 클라이언트의 로컬 타임존을 사용합니다. `time.Time{}` 또는 `sql.NullTime`은 이에 맞게 epoch 값으로 변환됩니다.
  * **조회(select)** 시점에는 `time.Time` 값을 반환할 때 컬럼에 타임존이 설정되어 있다면 해당 타임존이 사용됩니다. 설정되어 있지 않다면 서버의 타임존이 사용됩니다.
* **Date/Date32**
  * **삽입(insert)** 시점에는 날짜를 UNIX 타임스탬프로 변환할 때 각 날짜의 타임존이 고려되며, Date 타입은 ClickHouse에서 로케일 정보를 갖지 않으므로 저장 전에 타임존만큼 오프셋된 후 날짜로 저장됩니다. 문자열 값에 타임존이 지정되지 않은 경우 로컬 타임존이 사용됩니다.
  * **조회(select)** 시점에는 날짜가 `time.Time{}` 또는 `sql.NullTime{}` 인스턴스로 스캔되며, 타임존 정보 없이 반환됩니다.

#### Array \{#array\}

Array는 슬라이스(slice)로 삽입해야 합니다. 요소에 대한 타입 규칙은 [primitive type](#type-conversions)에 대한 규칙과 동일하며, 가능한 경우 요소가 변환됩니다.

Scan 시에는 슬라이스에 대한 포인터를 제공해야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)


#### 맵 \{#map\}

맵은 키와 값이 [앞에서](#type-conversions) 정의한 타입 규칙을 따르는 Golang 맵 타입으로 삽입해야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)


#### 튜플(Tuple) \{#tuples\}

튜플은 임의의 길이의 컬럼 그룹을 나타냅니다. 컬럼은 명시적으로 이름을 지정할 수도 있고, 타입만 지정할 수도 있습니다. 예:

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

이러한 접근 방식 중에서는 네임드 튜플(named tuple)이 더 높은 유연성을 제공합니다. 이름 없는 튜플은 슬라이스(slice)를 사용해 삽입하고 읽어야 하지만, 네임드 튜플은 맵과도 호환됩니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

참고: 타입이 지정된 슬라이스와 맵이 지원되며, 이름이 있는 튜플에서 하위 컬럼들이 모두 동일한 타입인 경우에만 사용할 수 있습니다.


#### Nested \{#nested\}

Nested 필드는 이름이 지정된 Tuple의 Array와 동일하게 동작합니다. 사용 방식은 사용자가 [flatten&#95;nested](/operations/settings/settings#flatten_nested)를 1로 설정했는지 0으로 설정했는지에 따라 달라집니다.

flatten&#95;nested를 0으로 설정하면 Nested 컬럼은 하나의 튜플 배열로 유지됩니다. 이를 통해 맵의 슬라이스를 사용하여 삽입 및 조회를 수행하고 임의의 중첩 수준을 사용할 수 있습니다. 아래 예시에서 보이는 것처럼 맵의 키는 컬럼 이름과 같아야 합니다.

참고: 맵이 튜플을 표현하므로 `map[string]interface{}` 타입이어야 합니다. 값에는 현재 강한 타입 검사가 적용되지 않습니다.

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

[전체 예제 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested`의 기본값인 1을 사용하면, 중첩 컬럼은 개별 배열로 평탄화됩니다. 이를 위해서는 삽입 및 조회 시 중첩된 슬라이스를 사용해야 합니다. 임의의 깊이로 중첩된 경우에도 동작할 수 있지만, 공식적으로 지원되지는 않습니다.


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

[전체 예제 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

참고: Nested 컬럼은 동일한 차원을 가져야 합니다. 예를 들어 위 예제에서 `Col_2_2`와 `Col_2_1`은 동일한 개수의 요소를 가져야 합니다.

더 단순한 인터페이스와 중첩(nesting)에 대한 공식 지원 때문에 `flatten_nested=0` 사용을 권장합니다.


#### Geo 타입 \{#geo-types\}

클라이언트는 Geo 타입인 Point, Ring, Polygon, Multi Polygon을 지원합니다. 이러한 필드는 Go 언어에서 [github.com/paulmach/orb](https://github.com/paulmach/orb) 패키지를 사용해 표현됩니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)


#### UUID \{#uuid\}

UUID 타입은 [github.com/google/uuid](https://github.com/google/uuid) 패키지에서 지원됩니다. 또한 UUID를 문자열 또는 `sql.Scanner`나 `Stringify`를 구현하는 임의의 타입으로 전달하거나 마샬링할 수도 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)


#### Decimal \{#decimal\}

Go에는 내장 `Decimal` 타입이 없으므로, 원본 쿼리를 수정하지 않고도 Decimal 타입을 직접적으로 다루기 위해 서드파티 패키지 [github.com/shopspring/decimal](https://github.com/shopspring/decimal) 사용을 권장합니다.

:::note
서드파티 의존성을 피하기 위해 대신 `Float`를 사용하고 싶을 수 있습니다. 하지만 [정확한 값이 필요한 경우 ClickHouse에서 Float 타입 사용은 권장되지 않습니다](https://clickhouse.com/docs/sql-reference/data-types/float).

그럼에도 클라이언트 측에서 Go의 내장 `Float` 타입 사용을 선택하는 경우, ClickHouse 쿼리에서 [toFloat64() 함수](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64) 또는 [그 변형들](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#toFloat64OrZero)을 사용하여 `Decimal`을 `Float`로 명시적으로 변환해야 합니다. 이 변환 과정에서 정밀도가 손실될 수 있음을 유의해야 합니다.
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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)


#### Nullable \{#nullable\}

Nil의 Go 값은 ClickHouse의 NULL을 나타냅니다. 이는 필드가 널 허용(Nullable)로 선언된 경우에 사용할 수 있습니다. INSERT 시점에는 Nil을 일반 컬럼과 널 허용 컬럼 모두에 전달할 수 있습니다. 일반 컬럼의 경우 해당 타입의 기본값이 저장되며, 예를 들어 `String` 타입에서는 빈 문자열이 저장됩니다. 널 허용 컬럼의 경우 ClickHouse에 NULL 값이 저장됩니다.

Scan 시점에는 Nullable 필드의 nil 값을 표현하기 위해, 널을 허용하는 타입에 대한 포인터(예: `*string`)를 전달해야 합니다. 아래 예시에서 `col1`은 Nullable(String)이므로 `**string`을 받습니다. 이를 통해 nil을 표현할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

클라이언트는 또한 `sql.Null*` 타입(예: `sql.NullInt64`)을 지원합니다. 이러한 타입은 ClickHouse의 해당 타입들과 호환됩니다.


#### Big Ints - Int128, Int256, UInt128, UInt256 \{#big-ints---int128-int256-uint128-uint256\}

64비트를 초과하는 정수 타입은 Go의 기본 [big](https://pkg.go.dev/math/big) 패키지를 사용하여 표현됩니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)


### Compression \{#compression\}

사용 중인 기반 프로토콜에 따라 지원되는 압축 방식이 달라집니다. 네이티브 프로토콜에서는 클라이언트가 `LZ4` 및 `ZSTD` 압축을 지원합니다. 이는 블록 단위로만 수행됩니다. 연결 구성에 `Compression` 설정을 포함하여 압축을 활성화할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

HTTP 표준 인터페이스를 사용하는 경우 추가 압축 기법을 사용할 수 있습니다. 자세한 내용은 [database/sql API - Compression](#compression)을 참조하십시오.


### 매개변수 바인딩 \{#parameter-binding\}

클라이언트는 `Exec`, `Query`, `QueryRow` 메서드에 대해 매개변수 바인딩을 지원합니다. 아래 예시와 같이 이름 기반, 번호 기반, 위치 기반 매개변수를 모두 지원합니다. 각 방식에 대한 예시는 아래에 제공합니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)


#### 특수 사례 \{#special-cases\}

기본적으로 슬라이스는 쿼리에 매개변수로 전달될 때 값이 쉼표로 구분된 목록으로 펼쳐집니다. 값 집합을 대괄호(`[ ]`)로 감싼 상태로 전달해야 하는 경우에는 `ArraySet`을 사용해야 합니다.

그룹/튜플이 필요하며, IN 연산자와 함께 사용할 수 있도록 소괄호 `( )`로 감싸야 하는 경우에는 `GroupSet`을 사용할 수 있습니다. 이는 아래 예제와 같이 여러 개의 그룹이 필요한 경우에 특히 유용합니다.

마지막으로, DateTime64 필드는 매개변수가 적절하게 표현되도록 정밀도가 필요합니다. 그러나 클라이언트는 필드의 정밀도 수준을 알 수 없으므로, 사용자가 이를 제공해야 합니다. 이를 위해 `DateNamed` 매개변수를 제공합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)


### 컨텍스트 사용 \{#using-context\}

Go 컨텍스트는 마감 시각, 취소 신호, 그리고 기타 요청 범위에 속하는 값들을 API 경계를 넘어 전달하는 수단을 제공합니다. 커넥션의 모든 메서드는 첫 번째 인수로 컨텍스트를 받습니다. 이전 예제에서는 `context.Background()`를 사용했지만, 이 기능을 활용해 설정과 마감 시각을 전달하고 쿼리를 취소할 수 있습니다.

`withDeadline`으로 생성한 컨텍스트를 전달하면 쿼리에 실행 시간 제한을 둘 수 있습니다. 이는 절대 시각 기준이며, 만료되면 커넥션을 해제하고 ClickHouse로 취소 신호를 전송할 뿐입니다. `WithCancel`을 사용하여 쿼리를 명시적으로 취소할 수도 있습니다.

`clickhouse.WithQueryID` 및 `clickhouse.WithQuotaKey` 헬퍼 함수를 사용하면 쿼리 ID와 쿼터 키를 지정할 수 있습니다. 쿼리 ID는 로그에서 쿼리를 추적하거나 취소 목적으로 활용하는 데 유용합니다. 쿼터 키는 고유 키 값을 기준으로 ClickHouse 사용량에 제한을 두는 데 사용할 수 있습니다. 자세한 내용은 [Quotas Management ](/operations/access-rights#quotas-management)를 참조하십시오.

또한 컨텍스트를 사용하여 전체 커넥션이 아니라 특정 쿼리에만 설정이 적용되도록 할 수 있습니다. 예시는 [Connection Settings](#connection-settings)에 나와 있습니다.

마지막으로 `clickhouse.WithBlockSize`를 통해 블록 버퍼의 크기를 제어할 수 있습니다. 이는 커넥션 단위 설정인 `BlockBufferSize`를 오버라이드하며, 동시에 디코딩되어 메모리에 유지되는 블록의 최대 개수를 제어합니다. 값이 클수록 메모리를 더 사용하는 대신 더 높은 수준의 병렬 처리가 가능해질 수 있습니다.

위에서 설명한 기능들에 대한 예제는 아래에 제시되어 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)


### 진행/프로파일/로그 정보 \{#progressprofilelog-information\}

진행(Progress), 프로파일(Profile), 로그(Log) 정보는 쿼리에서 요청할 수 있습니다. 진행 정보는 ClickHouse에서 읽고 처리한 행과 바이트 수에 대한 통계를 보고합니다. 한편 프로파일 정보는 클라이언트에 반환된 데이터에 대한 요약을 제공하며, 압축되지 않은 바이트 수, 행 수, 블록 수의 합계를 포함합니다. 마지막으로 로그 정보는 메모리 사용량 및 데이터 속도와 같은 스레드에 대한 통계를 제공합니다.

이 정보를 얻으려면 [Context](#using-context)를 사용해야 하며, 여기에 콜백 함수를 전달할 수 있습니다.

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

// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
```

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)


### 동적 스캔 \{#dynamic-scanning\}

스키마나 반환되는 필드의 타입을 알 수 없는 테이블을 읽어야 하는 경우가 있을 수 있습니다. 이는 애드혹(ad-hoc) 데이터 분석을 수행하거나 범용 도구를 구현하는 경우에 일반적으로 발생합니다. 이를 위해 쿼리 응답에는 컬럼 타입 정보가 포함되어 있습니다. 이 정보는 Go의 reflection과 함께 사용하여 런타임에 올바른 타입의 변수 인스턴스를 생성하고, 이를 `Scan`에 전달하는 데 사용할 수 있습니다.

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
defer rows.Close()
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
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
```

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)


### 외부 테이블 \{#external-tables\}

[외부 테이블](/engines/table-engines/special/external-data/)은(는) 클라이언트가 SELECT 쿼리와 함께 데이터를 ClickHouse로 전송할 수 있도록 합니다. 이 데이터는 임시 테이블에 저장되며, 쿼리 자체에서 쿼리 평가에 사용할 수 있습니다.

쿼리와 함께 외부 데이터를 클라이언트로 전송하려면, 컨텍스트를 통해 전달하기 전에 `ext.NewTable`을(를) 사용하여 외부 테이블을 구성해야 합니다.

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
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)


### Open telemetry \{#open-telemetry\}

ClickHouse는 [trace context](/operations/opentelemetry/)를 네이티브 프로토콜의 일부로 전달할 수 있습니다. 클라이언트는 `clickhouse.withSpan` 함수를 통해 Span을 생성하고 Context를 통해 전달하여 이를 구현합니다.

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
// NOTE: Do not skip rows.Err() check
if err := rows.Err(); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

트레이싱을 활용하는 방법에 대한 자세한 내용은 [OpenTelemetry 지원](/operations/opentelemetry/) 문서를 참조하십시오.


## Database/SQL API \{#databasesql-api\}

`database/sql` 또는 "표준" API는 애플리케이션 코드가 표준 인터페이스를 따름으로써, 기저에 어떤 데이터베이스가 있는지와 무관하게 동작해야 하는 시나리오에서 이 클라이언트를 사용할 수 있도록 합니다. 이는 추가적인 추상화 계층과 간접 참조, 그리고 ClickHouse와 반드시 일치하지 않을 수 있는 프리미티브(primitive)로 인한 일부 비용을 수반합니다. 그러나 이러한 비용은 일반적으로 도구가 여러 데이터베이스에 연결해야 하는 시나리오에서는 수용 가능한 수준입니다.

또한 이 클라이언트는 HTTP를 전송 계층으로 사용하는 것을 지원합니다. 데이터는 여전히 최적의 성능을 위해 네이티브 포맷으로 인코딩됩니다.

아래 내용은 ClickHouse API 문서의 구조를 최대한 그대로 따르는 것을 목표로 합니다.

표준 API에 대한 전체 코드 예시는 [여기](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)에서 확인할 수 있습니다.

### 연결 \{#connecting-1\}

연결은 `clickhouse://<host>:<port>?<query_option>=<value>` 형식의 DSN 문자열을 사용하여 `Open` 메서드로 수행하거나, `clickhouse.OpenDB` 메서드를 사용하여 수행할 수 있습니다. 후자는 `database/sql` 명세의 일부는 아니지만 `sql.DB` 인스턴스를 반환합니다. 이 메서드는 프로파일링과 같이 `database/sql` 명세만으로는 적절한 방식으로 노출하기 어려운 기능을 제공합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**별도로 표시된 경우를 제외하고, 이후 나오는 모든 예제에서는 ClickHouse `conn` 변수가 이미 생성되어 있으며 사용할 수 있다고 가정합니다.**


#### 연결 설정 \{#connection-settings-1\}

다음 매개변수를 DSN 문자열에 전달할 수 있습니다:

* `hosts` - 로드 밸런싱 및 장애 조치를 위한 단일 주소 호스트의 쉼표로 구분된 목록입니다. [여러 노드에 연결](#connecting-to-multiple-nodes)을 참고하십시오.
* `username/password` - 인증 자격 증명입니다. [인증](#authentication)을 참고하십시오.
* `database` - 현재 기본 데이터베이스를 선택합니다.
* `dial_timeout` - `300ms`, `1s`와 같은 기간(duration)을 나타내는 문자열입니다. 부호가 있을 수도 있는 10진수 숫자들로 이루어진 시퀀스에, 각 숫자마다 선택적인 소수부와 단위 접미사가 붙습니다. 유효한 시간 단위는 `ms`, `s`, `m`입니다.
* `connection_open_strategy` - `random/in_order` (기본값 `random`)입니다. [여러 노드에 연결](#connecting-to-multiple-nodes)을 참고하십시오.
  * `round_robin` - 집합에 포함된 서버들 중에서 라운드 로빈 방식으로 선택합니다.
  * `in_order` - 지정된 순서에서 첫 번째로 살아 있는 서버를 선택합니다.
* `debug` - 디버그 출력을 활성화합니다 (boolean 값).
* `compress` - 압축 알고리즘을 지정합니다: `none`(기본값), `zstd`, `lz4`, `gzip`, `deflate`, `br`. `true`로 설정하면 `lz4`가 사용됩니다. 네이티브 통신에서는 `lz4`와 `zstd`만 지원됩니다.
* `compress_level` - 압축 수준(기본값은 `0`)입니다. 자세한 내용은 Compression을 참고하십시오. 알고리즘별로 동작이 다릅니다.
  * `gzip` - `-2`(최고 속도)부터 `9`(최고 압축률)까지
  * `deflate` - `-2`(최고 속도)부터 `9`(최고 압축률)까지
  * `br` - `0`(최고 속도)부터 `11`(최고 압축률)까지
  * `zstd`, `lz4` - 무시됩니다.
* `secure` - 보안 SSL 연결을 설정합니다 (기본값은 `false`).
* `skip_verify` - 인증서 검증을 건너뜁니다 (기본값은 `false`).
* `block_buffer_size` - 블록 버퍼 크기를 제어할 수 있도록 합니다. [`BlockBufferSize`](#connection-settings)를 참고하십시오. (기본값은 `2`)

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)


#### Connection pooling \{#connection-pooling-1\}

[Connecting to Multiple Nodes](#connecting-to-multiple-nodes)에 설명된 대로 제공된 노드 주소 목록의 사용 방식을 조정할 수 있습니다. 그러나 연결 관리 및 연결 풀링(connection pooling)은 설계상 `sql.DB`에 위임됩니다. 
연결 풀링(connection pooling)은 Native(TCP)와 HTTP 프로토콜 모두에서 활성화됩니다.

#### HTTP를 통한 연결 \{#connecting-over-http\}

기본적으로 연결은 네이티브 프로토콜을 통해 설정됩니다. HTTP를 사용해야 하는 경우, DSN을 수정하여 HTTP 프로토콜을 포함하거나 연결 옵션에서 Protocol을 지정하여 이를 활성화할 수 있습니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)


#### 여러 노드에 연결하기 \{#connecting-to-multiple-nodes-1\}

`OpenDB`를 사용하는 경우 ClickHouse API에서와 동일한 옵션 설정 방식을 사용하여 여러 호스트에 연결할 수 있으며, 필요에 따라 `ConnOpenStrategy`를 지정할 수 있습니다.

DSN 기반 연결에서는 연결 문자열에 여러 호스트와 `connection_open_strategy` 파라미터를 지정할 수 있으며, 이 파라미터 값으로는 `round_robin` 또는 `in_order`를 사용할 수 있습니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)


### TLS 사용 \{#using-tls-1\}

DSN 연결 문자열을 사용하는 경우 매개변수 &quot;secure=true&quot;로 SSL을 활성화할 수 있습니다. `OpenDB` 메서드는 nil이 아닌 TLS struct를 지정하는 방식에 의존한다는 점에서 [TLS용 네이티브 API](#using-tls)와 동일한 접근 방식을 사용합니다. DSN 연결 문자열은 SSL 검증을 건너뛰기 위한 skip&#95;verify 매개변수를 지원하지만, 더 고급 TLS 구성이 필요한 경우에는 구성을 전달할 수 있는 `OpenDB` 메서드를 사용해야 합니다.

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

[전체 코드 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)


### 인증 \{#authentication-1\}

`OpenDB`를 사용하는 경우 인증 정보는 일반적인 옵션으로 전달할 수 있습니다. DSN 기반 연결에서는 사용자 이름과 비밀번호를 연결 문자열에 전달할 수 있으며, 매개변수로 지정하거나 주소에 인코딩된 자격 증명으로 포함할 수 있습니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)


### 실행 \{#execution-1\}

연결을 얻은 후 Exec 메서드를 사용하여 `sql` SQL 문을 실행할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

이 메서드는 context를 전달하는 기능을 지원하지 않으며, 기본적으로 background context에서 실행됩니다. 필요하다면 `ExecContext`를 사용할 수 있습니다. 자세한 내용은 [Context 사용](#using-context)을 참조하십시오.


### 배치 삽입 \{#batch-insert-1\}

배치 처리는 `Being` 메서드를 통해 `sql.Tx`를 생성하여 구현할 수 있습니다. 이렇게 생성한 `sql.Tx`에서 `INSERT` 구문과 함께 `Prepare` 메서드를 사용하여 배치를 얻을 수 있습니다. 이 메서드는 `Exec` 메서드를 사용해 행을 추가할 수 있는 `sql.Stmt`를 반환합니다. 배치는 원래의 `sql.Tx`에서 `Commit`이 실행될 때까지 메모리에 누적됩니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)


### 행 조회 \{#querying-rows-1\}

단일 행을 조회하려면 `QueryRow` 메서드를 사용합니다. 이 메서드는 *sql.Row를 반환하며, 이 객체에서 `Scan`을 호출할 때 컬럼이 마샬링될 변수들의 포인터를 전달합니다. `QueryRowContext` 변형을 사용하면 background 이외의 context를 전달할 수 있습니다. 자세한 내용은 [Using Context](#using-context)를 참고하십시오.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

여러 행을 반복 처리하려면 `Query` 메서드를 사용해야 합니다. 이 메서드는 행을 순회하기 위해 `Next`를 호출할 수 있는 `*sql.Rows` 구조체를 반환합니다. 이에 해당하는 `QueryContext` 메서드를 사용하면 context를 전달할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)


### 비동기 Insert \{#async-insert-1\}

비동기 insert는 `ExecContext` 메서드를 사용해 insert를 실행하여 구현할 수 있습니다. 아래 예시와 같이 비동기 모드가 활성화된 context를 전달해야 합니다. 이를 통해 사용자는 클라이언트가 서버가 insert를 완료할 때까지 대기할지, 아니면 데이터가 수신되는 즉시 응답할지를 지정할 수 있습니다. 이는 [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) 파라미터를 효과적으로 제어합니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### 열 지향 삽입 \{#columnar-insert-1\}

표준 인터페이스에서는 지원하지 않습니다.

### 구조체 사용 \{#using-structs-1\}

표준 인터페이스에서는 지원하지 않습니다.

### 형식 변환 \{#type-conversions-1\}

표준 `database/sql` 인터페이스는 [ClickHouse API](#type-conversions)와 동일한 형식을 지원해야 합니다. 주로 복합 형식과 관련된 몇 가지 예외가 있으며, 이에 대해서는 아래에서 설명합니다. ClickHouse API와 마찬가지로 이 클라이언트는 삽입과 응답 마샬링 모두에 대해 가능한 한 다양한 타입을 허용하도록 최대한 유연하게 동작하는 것을 목표로 합니다. 자세한 내용은 [형식 변환](#type-conversions)을 참조하십시오.

### Complex types \{#complex-types-1\}

별도 언급이 없는 한, 복합 타입(complex type) 처리는 [ClickHouse API](#complex-types)와 동일하게 동작합니다. 차이점은 `database/sql` 내부 구현으로 인해 발생합니다.

#### 맵(Maps) \{#maps\}

ClickHouse API와 달리, 표준 API에서는 스캔 시 맵의 타입을 명확하게 지정해야 합니다. 예를 들어 `Map(String,String)` 필드에는 `map[string]interface{}`를 전달할 수 없으며, 대신 `map[string]string`을 사용해야 합니다. `interface{}` 변수는 항상 호환 가능하므로 더 복잡한 구조에 사용할 수 있습니다. 구조체(Struct)는 읽기 시에는 지원되지 않습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

데이터 삽입 동작은 ClickHouse API와 동일합니다.


### Compression \{#compression-1\}

표준 API는 기본 [ClickHouse API](#compression)와 동일한 압축 알고리즘을 지원하며, 블록 단위의 `lz4` 및 `zstd` 압축을 제공합니다. 추가로 HTTP 연결에 대해서는 gzip, deflate, br 압축도 지원합니다. 이들 중 하나라도 활성화되어 있으면 삽입 시와 쿼리 응답 시 블록 단위로 압축이 수행됩니다. ping 또는 쿼리 요청과 같은 다른 요청은 압축되지 않은 상태로 유지됩니다. 이러한 동작은 `lz4` 및 `zstd` 옵션과 동일합니다.

`OpenDB` 메서드를 사용해 연결을 설정하는 경우, Compression 설정을 전달할 수 있습니다. 여기에는 압축 수준을 지정하는 기능도 포함됩니다(아래 참조). DSN과 함께 `sql.Open`을 통해 연결하는 경우에는 `compress` 파라미터를 사용합니다. 이 값은 `gzip`, `deflate`, `br`, `zstd`, `lz4`와 같은 특정 압축 알고리즘이 될 수도 있고, 불리언 플래그가 될 수도 있습니다. true로 설정된 경우 `lz4`가 사용됩니다. 기본값은 `none`, 즉 압축이 비활성화된 상태입니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

적용되는 압축 수준은 DSN 매개변수 `compress_level` 또는 Compression 옵션의 `Level` 필드로 제어할 수 있습니다. 기본값은 0이며, 알고리즘마다 다르게 동작합니다:

* `gzip` - `-2`(최고 속도)부터 `9`(최고 압축률)까지
* `deflate` - `-2`(최고 속도)부터 `9`(최고 압축률)까지
* `br` - `0`(최고 속도)부터 `11`(최고 압축률)까지
* `zstd`, `lz4` - 무시됩니다


### 파라미터 바인딩 \{#parameter-binding-1\}

표준 API는 [ClickHouse API](#parameter-binding)와 동일한 파라미터 바인딩 기능을 지원하여, `Exec`, `Query`, `QueryRow` 메서드(및 이에 상응하는 [Context](#using-context) 기반 변형 메서드)에 파라미터를 전달할 수 있습니다. 위치 기반, 이름 기반, 번호 기반 파라미터를 모두 지원합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

단, [특수 사례](#special-cases)는 여전히 동일하게 적용됩니다.


### 컨텍스트 사용 \{#using-context-1\}

표준 API는 [ClickHouse API](#using-context)와 마찬가지로 컨텍스트를 통해 데드라인, 취소 신호, 기타 요청 범위(scope)의 값을 전달하는 기능을 동일하게 지원합니다. ClickHouse API와는 달리, 여기서는 메서드의 `Context` 변형을 사용하여 이를 구현합니다. 예를 들어 기본적으로 백그라운드 컨텍스트를 사용하는 `Exec` 메서드에는 컨텍스트를 첫 번째 매개변수로 전달할 수 있는 `ExecContext` 변형이 있습니다. 이를 통해 애플리케이션 플로우의 어느 단계에서든 컨텍스트를 전달할 수 있습니다. 예를 들어 `ConnContext`를 사용할 때는 연결을 설정하는 시점에, `QueryRowContext`를 사용할 때는 쿼리 행을 요청하는 시점에 컨텍스트를 전달할 수 있습니다. 사용 가능한 모든 메서드의 예시는 아래에 나와 있습니다.

데드라인, 취소 신호, 쿼리 ID, QUOTA 키 및 연결 설정을 전달하기 위해 컨텍스트를 사용하는 방법에 대한 자세한 내용은 [ClickHouse API](#using-context)의 「Using Context」를 참조하십시오.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)


### 세션 \{#sessions\}

네이티브 연결은 기본적으로 세션을 가지지만, HTTP를 통한 연결에서는 설정으로 컨텍스트를 전달하려면 사용자가 세션 ID를 생성해야 합니다. 이를 통해 세션에 종속되는 임시 테이블(Temporary tables)과 같은 기능을 사용할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)


### 동적 스캐닝 \{#dynamic-scanning-1\}

[ClickHouse API](#dynamic-scanning)와 마찬가지로, 컬럼 타입 정보가 제공되어 적절한 타입의 변수 인스턴스를 런타임에 생성하여 `Scan`에 전달할 수 있습니다. 이를 통해 미리 타입을 알 수 없는 컬럼도 읽을 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)


### 외부 테이블 \{#external-tables-1\}

[외부 테이블](/engines/table-engines/special/external-data/)은(는) 클라이언트가 `SELECT` 쿼리와 함께 ClickHouse로 데이터를 전송할 수 있도록 합니다. 이 데이터는 임시 테이블에 저장되며, 쿼리 자체에서 평가를 위해 사용할 수 있습니다.

쿼리에 외부 데이터를 포함해 전송하려면, 컨텍스트를 통해 전달하기 전에 `ext.NewTable`을 사용하여 외부 테이블을 먼저 생성해야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)


### Open telemetry \{#open-telemetry-1\}

ClickHouse는 네이티브 프로토콜의 일부로 [trace context](/operations/opentelemetry/)를 전달할 수 있습니다. 클라이언트에서는 `clickhouse.withSpan` 함수를 사용해 Span을 생성하고 Context를 통해 전달하여 이를 구현합니다. 이 기능은 HTTP를 전송 방식으로 사용할 때는 지원되지 않습니다.

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

[전체 예제 코드](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)


## 성능 팁 \{#performance-tips\}

* 가능하다면 ClickHouse API를 활용하십시오. 특히 원시 타입(primitive type)에 사용하면 reflection과 indirection을 크게 줄일 수 있습니다.
* 대용량 데이터셋을 읽는 경우 [`BlockBufferSize`](#connection-settings)를 조정하는 것을 고려하십시오. 이는 메모리 사용량을 증가시키지만, 행을 순회(iteration)하는 동안 더 많은 블록을 병렬로 디코딩할 수 있게 합니다. 기본값 2는 보수적인 값으로, 메모리 오버헤드를 최소화합니다. 값을 더 크게 설정하면 메모리에 더 많은 블록이 상주하게 됩니다. 쿼리에 따라 생성되는 블록 크기가 달라질 수 있으므로, 이에 대해서는 테스트가 필요합니다. 이 값은 Context를 통해 [쿼리 수준](#using-context)에서 설정할 수 있습니다.
* 데이터를 삽입할 때 타입을 명확히 지정하십시오. 클라이언트는 가능한 한 유연하게 동작하도록 설계되어, 예를 들어 UUID나 IP에 대해 문자열 파싱을 허용하지만, 이는 데이터 검증이 필요하며 삽입 시점에 오버헤드가 발생합니다.
* 가능하면 컬럼 지향 방식으로 삽입(column-oriented insert)하십시오. 이 또한 강한 타입을 사용하여, 클라이언트가 값을 변환할 필요가 없도록 하는 것이 좋습니다.
* 최적의 삽입 성능을 위해 ClickHouse [권장 사항](/sql-reference/statements/insert-into/#performance-considerations)을 따르십시오.