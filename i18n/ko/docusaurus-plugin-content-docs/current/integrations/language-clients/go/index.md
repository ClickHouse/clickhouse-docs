---
'sidebar_label': 'Go'
'sidebar_position': 1
'keywords':
- 'clickhouse'
- 'go'
- 'client'
- 'golang'
'slug': '/integrations/go'
'description': 'ClickHouse를 위한 Go 클라이언트는 사용자가 Go 표준 DATABASE/sql 인터페이스 또는 최적화된 네이티브
  인터페이스를 사용하여 ClickHouse에 연결할 수 있도록 합니다.'
'title': 'ClickHouse Go'
'doc_type': 'reference'
'integration':
- 'support_level': 'core'
- 'category': 'language_client'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go
## 간단한 예제 {#a-simple-example}

간단한 예제를 통해 시작해 보겠습니다. 이는 ClickHouse에 연결하고 시스템 데이터베이스에서 선택하는 것입니다. 시작하려면 연결 세부정보가 필요합니다.
### 연결 세부정보 {#connection-details}

<ConnectionDetails />
### 모듈 초기화 {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### 샘플 코드 복사 {#copy-in-some-sample-code}

다음 코드를 `clickhouse-golang-example` 디렉토리에 `main.go`로 복사합니다.

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
### go mod tidy 실행 {#run-go-mod-tidy}

```bash
go mod tidy
```
### 연결 세부정보 설정 {#set-your-connection-details}
이전에 연결 세부정보를 조회했습니다. 이를 `main.go`의 `connect()` 함수에 설정합니다:

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
### 예제 실행 {#run-the-example}
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
### 더 알아보기 {#learn-more}
이 카테고리의 나머지 문서는 ClickHouse Go 클라이언트의 세부 사항을 다룹니다.
## ClickHouse Go 클라이언트 {#clickhouse-go-client}

ClickHouse는 두 개의 공식 Go 클라이언트를 지원합니다. 이 클라이언트들은 보완적이며 의도적으로 서로 다른 사용 사례를 지원합니다.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go 표준 database/sql 인터페이스 또는 기본 인터페이스를 지원하는 고수준 언어 클라이언트.
* [ch-go](https://github.com/ClickHouse/ch-go) - 저수준 클라이언트. 기본 인터페이스만 지원.

clickhouse-go는 높은 수준의 인터페이스를 제공하여 사용자가 행 지향 의미론과 데이터 유형에 관대한 배치 방식을 사용하여 데이터를 쿼리하고 삽입할 수 있습니다. ch-go는 반면에, 유형 엄격성과 더 복잡한 사용법의 대가로 CPU 및 메모리 오버헤드가 적은 빠른 데이터 블록 스트리밍을 제공하는 최적화된 컬럼 지향 인터페이스를 제공합니다.

2.3 버전부터 Clickhouse-go는 인코딩, 디코딩 및 압축과 같은 저수준 기능에 ch-go를 활용합니다. clickhouse-go는 또한 Go의 `database/sql` 인터페이스 표준을 지원합니다. 두 클라이언트 모두 최적의 성능을 제공하기 위해 인코딩을 위해 네이티브 형식을 사용하고 네이티브 ClickHouse 프로토콜을 통해 통신할 수 있습니다. clickhouse-go는 또한 사용자가 트래픽을 프록시하거나 로드 밸런싱해야 하는 경우 HTTP를 운반 메커니즘으로 지원합니다.

클라이언트 라이브러리를 선택할 때 사용자는 각각의 장단점을 알고 있어야 합니다 - [클라이언트 라이브러리 선택하기](#choosing-a-client-library) 참조.

|               | 네이티브 형식 | 네이티브 프로토콜 | HTTP 프로토콜 | 행 지향 API | 열 지향 API | 유형 유연성 | 압축 | 쿼리 플레이스홀더 |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |
## 클라이언트 선택하기 {#choosing-a-client}

클라이언트 라이브러리를 선택하는 것은 사용 패턴과 최적의 성능에 대한 필요에 따라 다릅니다. 초당 수백만 건의 삽입이 필요한 삽입 중심 사용 사례의 경우, 저수준 클라이언트 [ch-go](https://github.com/ClickHouse/ch-go) 사용을 권장합니다. 이 클라이언트는 ClickHouse의 네이티브 형식이 요구하는 행 지향 형식에서 열로 데이터를 전환하는 관련 오버헤드를 피합니다. 또한, `interface{}`(`any`) 유형의 반사가 없이 간단한 사용을 가능하게 합니다.

집계 또는 낮은 처리량의 삽입 작업에 집중된 쿼리 워크로드의 경우, [clickhouse-go](https://github.com/ClickHouse/clickhouse-go)는 친숙한 `database/sql` 인터페이스와 더 간단한 행 의미론을 제공합니다. 사용자는 또한 선택적으로 HTTP를 운반 프로토콜로 사용하고 도움 함수들을 사용하여 행을 구조체와 주고받을 수 있습니다.
## clickhouse-go 클라이언트 {#the-clickhouse-go-client}

clickhouse-go 클라이언트는 ClickHouse와 통신하기 위한 두 개의 API 인터페이스를 제공합니다:

* ClickHouse 클라이언트 전용 API
* `database/sql` 표준 - Golang에서 제공하는 SQL 데이터베이스를 위한 일반 인터페이스.

`database/sql`은 데이터베이스에 독립적인 인터페이스를 제공하여 개발자가 데이터 저장소를 추상화할 수 있도록 하지만, 성능에 영향을 미치는 몇 가지 유형 및 쿼리 의미론을 강제합니다. 그래서 [성능이 중요한 경우](https://github.com/clickHouse/clickHouse-go#benchmark)에는 클라이언트 전용 API를 사용하는 것이 좋습니다. 그러나 여러 데이터베이스를 지원하는 도구에 ClickHouse를 통합하려는 사용자는 표준 인터페이스를 사용하기를 선호할 수 있습니다.

두 인터페이스 모두 [네이티브 형식](/native-protocol/basics.md)과 네이티브 프로토콜을 사용하여 데이터를 인코딩하며, 표준 인터페이스는 HTTP를 통한 통신을 지원합니다.

|                    | 네이티브 형식 | 네이티브 프로토콜 | HTTP 프로토콜 | 대량 쓰기 지원 | 구조체 마샬링 | 압축 | 쿼리 플레이스홀더 |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |
## 설치 {#installation}

드라이버의 v1은 더 이상 사용되지 않으며 기능 업데이트 또는 새로운 ClickHouse 유형에 대한 지원을 제공하지 않습니다. 사용자들은 성능이 우수한 v2로 마이그레이션해야 합니다.

클라이언트의 2.x 버전을 설치하려면, go.mod 파일에 해당 패키지를 추가합니다:

`require github.com/ClickHouse/clickhouse-go/v2 main`

또는 저장소를 클론합니다:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

다른 버전을 설치하려면 경로 또는 브랜치 이름을 적절하게 수정합니다.

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
### 버전 관리 및 호환성 {#versioning--compatibility}

클라이언트는 ClickHouse와 독립적으로 출시됩니다. 2.x는 현재 개발 중인 주요 버전을 나타냅니다. 모든 2.x 버전은 서로 호환되어야 합니다.
#### ClickHouse 호환성 {#clickhouse-compatibility}

클라이언트는 다음을 지원합니다:

- [여기](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)에 기록된 현재 지원되는 모든 ClickHouse 버전. ClickHouse 버전이 더 이상 지원되지 않을 경우, 클라이언트 릴리스에 대해 더 이상 적극적으로 테스트되지 않습니다.
- 클라이언트의 릴리스 날짜로부터 2년 이내의 모든 ClickHouse 버전. 단, LTS 버전만 적극적으로 테스트됩니다.
#### Golang 호환성 {#golang-compatibility}

| 클라이언트 버전 | Golang 버전 |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## ClickHouse 클라이언트 API {#clickhouse-client-api}

ClickHouse 클라이언트 API의 모든 코드 예제는 [여기](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)에서 확인할 수 있습니다.
### 연결 {#connecting}

다음 예제는 서버 버전을 반환하며 ClickHouse에 연결하는 방법을 보여줍니다 - ClickHouse가 보안되지 않고 기본 사용자로 접근할 수 있다고 가정합니다.

기본 네이티브 포트를 사용하여 연결합니다.

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

**모든 후속 예제에서는 명시적으로 표시되지 않는 한 ClickHouse `conn` 변수가 생성되어 사용할 수 있다고 가정합니다.**
#### 연결 설정 {#connection-settings}

연결을 열 때, Options 구조체를 사용하여 클라이언트의 동작을 제어할 수 있습니다. 다음 설정을 사용할 수 있습니다:

* `Protocol` - 네이티브 또는 HTTP. HTTP는 현재 [database/sql API](#databasesql-api)만 지원됩니다.
* `TLS` - TLS 옵션. 널이 아닌 값은 TLS를 활성화합니다. [TLS 사용하기](#using-tls) 참조.
* `Addr` - 포트를 포함한 주소 슬라이스.
* `Auth` - 인증 세부사항. [인증](#authentication) 참조.
* `DialContext` - 연결을 설정하는 방법을 결정하는 사용자 정의 다이얼 함수.
* `Debug` - 디버깅을 활성화할지 여부(true/false).
* `Debugf` - 디버그 출력을 소비하기 위한 함수를 제공합니다. `debug`를 true로 설정해야 합니다.
* `Settings` - ClickHouse 설정의 맵. 이는 모든 ClickHouse 쿼리에 적용됩니다. [Context 사용하기](#using-context)를 통해 쿼리별로 설정을 할 수 있습니다.
* `Compression` - 블록에 대한 압축을 활성화합니다. [압축](#compression) 참조.
* `DialTimeout` - 연결을 설정하는 최대 시간. 기본값은 `1s`.
* `MaxOpenConns` - 언제든지 사용할 수 있는 최대 연결 수. 유휴 풀에는 더 많거나 적은 연결이 있을 수 있지만, 언제든지 사용할 수 있는 것은 이 숫자입니다. 기본값은 `MaxIdleConns+5`.
* `MaxIdleConns` - 풀에서 유지할 연결 수. 가능한 경우 연결이 재사용됩니다. 기본값은 `5`.
* `ConnMaxLifetime` - 연결을 사용할 수 있도록 유지하는 최대 수명. 기본값은 1시간. 이 시간 이후에 연결이 파괴되며 필요에 따라 새로운 연결이 풀에 추가됩니다.
* `ConnOpenStrategy` - 노드 주소 목록을 사용하는 방법을 결정합니다. [여러 노드에 연결하기](#connecting-to-multiple-nodes) 참조.
* `BlockBufferSize` - 한 번에 버퍼에 디코딩할 최대 블록 수. 더 큰 값은 메모리 사용의 대가로 병렬 처리를 증가시킵니다. 블록 크기는 쿼리에 따라 다르므로 연결에서 설정할 수 있지만, 반환되는 데이터에 따라 쿼리별로 오버라이드하는 것이 좋습니다. 기본값은 `2`.

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
[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)
#### 연결 풀링 {#connection-pooling}

클라이언트는 연결 풀을 유지하며 필요에 따라 쿼리 간에 이러한 연결을 재사용합니다. 최대 `MaxOpenConns`가 언제든지 사용되며, 최대 풀 크기는 `MaxIdleConns`에 의해 제어됩니다. 클라이언트는 각 쿼리 실행을 위해 풀에서 연결을 가져오고 재사용을 위해 풀로 반환합니다. 연결은 배치의 수명 동안 사용되며 `Send()`에서 해제됩니다.

정해진 연결을 다음 쿼리에 사용할지 여부는 보장되지 않으며, 사용자가 `MaxOpenConns=1`로 설정하지 않는 이상 그렇습니다. 이는 드물게 필요하지만 사용자가 임시 테이블을 사용할 경우 필요할 수 있습니다.

또한 `ConnMaxLifetime`는 기본적으로 1시간입니다. 이는 노드가 클러스터에서 나가게 될 경우 ClickHouse에 대한 부하가 불균형하게 되는 경우를 초래할 수 있습니다. 문제가 있는 노드가 클러스터에 돌아와도, 이러한 연결은 기본적으로 1시간 동안 지속되며 새로 고쳐지지 않습니다. 사용자들은 많은 워크로드에서 이 값을 낮추는 것을 고려해야 합니다.
### TLS 사용하기 {#using-tls}

저수준에서는, 모든 클라이언트 연결 메서드(`DSN/OpenDB/Open`)는 [Go tls 패키지](https://pkg.go.dev/crypto/tls)를 사용하여 안전한 연결을 설정합니다. Options 구조체에 널이 아닌 `tls.Config` 포인터가 포함된 경우 클라이언트는 TLS를 사용해야 함을 알고 있습니다.

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

이 최소한의 `TLS.Config`는 ClickHouse 서버의 안전한 네이티브 포트(정상적으로 9440)에 연결하는 데 일반적으로 충분합니다. ClickHouse 서버에 유효한 인증서가 없으면 (만료되었거나 잘못된 호스트명, 공개적으로 인정된 루트 인증 기관에서 서명되지 않음), `InsecureSkipVerify`를 true로 설정할 수 있지만, 이는 강하게 권장되지 않습니다.

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

추가 TLS 매개 변수가 필요한 경우, 애플리케이션 코드는 `tls.Config` 구조체의 원하는 필드를 설정해야 합니다. 여기에는 특정 암호 모음, 특정 TLS 버전(예: 1.2 또는 1.3)을 강제로 설정하거나, 내부 CA 인증서 체인을 추가하고, ClickHouse 서버에 의해 필요에 따라 클라이언트 인증서(및 개인 키)를 추가하는 등의 옵션이 포함될 수 있습니다.
### 인증 {#authentication}

사용자 이름과 비밀번호를 지정하기 위해 연결 세부정보에 Auth 구조체를 지정합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)
### 여러 노드에 연결하기 {#connecting-to-multiple-nodes}

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

다음 두 가지 연결 전략을 사용할 수 있습니다:

* `ConnOpenInOrder` (기본값) - 주소는 순서대로 사용됩니다. 후속 주소는 목록의 앞쪽 주소에서 연결할 수 없을 경우에만 사용됩니다. 이는 사실상 장애 조치 전략입니다.
* `ConnOpenRoundRobin` - 라운드로빈 전략을 사용하여 주소 간에 부하를 분산합니다.

이는 옵션 `ConnOpenStrategy`를 통해 제어할 수 있습니다.

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
### 실행 {#execution}

임의의 문장은 `Exec` 메서드를 통해 실행할 수 있습니다. 이는 DDL 및 간단한 문장에 유용합니다. 대량 삽입이나 쿼리 반복에 사용해서는 안 됩니다.

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

쿼리에 Context를 전달할 수 있는 점에 유의하세요. 이는 특정 쿼리 수준 설정을 전달하는 데 사용할 수 있습니다 - [Context 사용하기](#using-context) 참조.
### 배치 삽입 {#batch-insert}

많은 행을 삽입하기 위해 클라이언트는 배치 의미론을 제공합니다. 이는 행을 추가할 수 있는 배치를 준비해야 합니다. 해당 배치는 `Send()` 메서드를 통해 전송됩니다. 배치는 `Send`가 실행될 때까지 메모리에 보관됩니다.

연결 누수를 방지하기 위해 배치에서 `Close`를 호출하는 것이 권장됩니다. 이는 배치를 준비한 후 `defer` 키워드를 통해 수행할 수 있습니다. 이렇게 하면 `Send`가 호출되지 않은 경우 연결이 정리됩니다. 행이 추가되지 않았다면 쿼리 로그에 0 행 삽입이 나타날 것입니다.

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

ClickHouse에 대한 권장 사항은 [여기](/guides/inserting-data#best-practices-for-inserts)에서 적용됩니다. 배치는 go 루틴 간에 공유하지 말고 각 루틴을 위해 별도의 배치를 구성해야 합니다.

위의 예제에서, 행을 추가할 때 변수 유형이 컬럼 유형과 일치해야 한다는 점을 유의하십시오. 매핑이 보통 분명하지만, 이 인터페이스는 유연성을 제공하려고 하며, 정밀도 손실이 발생하지 않는다면 유형이 변환됩니다. 예를 들어, 문자열을 datetime64에 삽입하는 것을 보여줍니다.

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

각 열 유형에 대한 지원되는 go 유형의 전체 요약은 [유형 변환](#type-conversions)에서 확인하십시오.
### 행 쿼리 {#querying-rows}

사용자는 `QueryRow` 메서드를 사용하여 단일 행에 대해 쿼리를 하거나 `Query`를 통해 결과 집합을 반복하는 커서를 얻을 수 있습니다. 전자는 데이터가 직렬화될 대상을 수용하지만, 후자는 각 행에 대해 `Scan`을 호출해야 합니다.

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

두 경우 모두 직렬화할 열 값을 저장할 변수에 대한 포인터를 전달해야 합니다. 이는 기본적으로 `SELECT` 문서에서 지정된 순서로 전달되어야 하며, 기본적으로 `SELECT *`의 경우, 열 선언의 순서가 사용됩니다.

삽입과 유사하게, Scan 메서드는 대상 변수가 적절한 유형이어야 합니다. 이는 다시 유연성을 목표로 하며, 가능한 경우 유형을 변환합니다; 예를 들어, 위의 예에서는 UUID 열이 문자열 변수에 읽히는 것을 보여줍니다. 각 열 유형에 대한 지원되는 go 유형의 전체 목록은 [유형 변환](#type-conversions)에서 확인하십시오.

마지막으로, `Query` 및 `QueryRow` 메서드에 `Context`를 전달할 수 있는 점도 유의하십시오. 이는 쿼리 수준 설정을 전달하는 데 사용할 수 있습니다 - [Context 사용하기](#using-context)에서 자세한 정보를 참조하십시오.
### 비동기 삽입 {#async-insert}

비동기 삽입은 Async 메서드를 통해 지원됩니다. 이 메서드는 사용자가 클라이언트가 삽입이 완료될 때까지 기다려야 하는지, 데이터가 수신된 후 응답하도록 해야 하는지 지정할 수 있습니다. 이는 기본적으로 [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert) 매개변수를 제어합니다.

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
### 컬럼형 삽입 {#columnar-insert}

삽입은 열 형식으로 삽입할 수 있습니다. 이는 데이터가 이미 이 구조로 방향이 설정되어 있을 경우 성능상의 이점을 제공할 수 있습니다.

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
### 구조체 사용하기 {#using-structs}

사용자에게 Golang 구조체는 ClickHouse의 데이터 행에 대한 논리적 표현을 제공합니다. 이를 돕기 위해, 기본 인터페이스는 여러 편리한 함수를 제공합니다.
#### 직렬화와 함께 선택 {#select-with-serialize}

Select 메서드는 응답 행 집합을 단일 호출로 구조체 슬라이스로 마샬링할 수 있게 합니다.

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
#### 구조체 스캔 {#scan-struct}

`ScanStruct`는 쿼리에서 단일 행을 구조체로 마샬링할 수 있게 합니다.

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
#### 구조체 추가 {#append-struct}

`AppendStruct`는 기존 [배치](#batch-insert)에 구조체를 추가하고 전체 행으로 해석할 수 있게 합니다. 이는 구조체의 열이 테이블과 이름 및 유형 모두 일치해야 합니다. 모든 열에는 상응하는 구조체 필드가 있어야 하지만, 어떤 필드는 상응하는 열 표현이 없을 수 있습니다. 이러한 필드는 단순히 무시됩니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)
### 유형 변환 {#type-conversions}

클라이언트는 삽입 및 응답의 마샬링에 대해 가능한 한 유연하게 변수를 수용합니다. 대부분의 경우, ClickHouse 컬럼 유형에 해당하는 Golang 타입이 존재합니다, 예: [UInt64](/sql-reference/data-types/int-uint/)는 [uint64](https://pkg.go.dev/builtin#uint64)와 같습니다. 이러한 논리적 매핑은 항상 지원되어야 합니다. 사용자는 변수가 삽입되거나 응답을 수신하기 위해 사용하는 경우, 이 둘 중 하나의 변환이 선행될 경우에 사용되는 변수를 활용할 수 있습니다. 클라이언트는 이러한 변환을 투명하게 지원하려 하며, 사용자가 삽입 전 데이터를 정확히 정렬할 필요가 없도록 하고 쿼리 시간에 유연한 마샬링을 제공합니다. 이 투명한 변환은 정밀 손실을 허용하지 않습니다. 예를 들어, uint32는 UInt64 컬럼에서 데이터를 수신하는 데 사용할 수 없습니다. 반대로, 문자열은 형식 요구 사항을 충족하면 datetime64 필드에 삽입할 수 있습니다.

현재 지원되는 기본형에 대한 유형 변환은 [여기](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)에서 포착됩니다.

이 작업은 진행 중이며 삽입(`Append`/`AppendRow`) 및 읽기 시간(`Scan`을 통해)으로 구분할 수 있습니다. 특정 변환에 대한 지원이 필요한 경우, 문제를 제기해 주시기 바랍니다.
### 복합 유형 {#complex-types}
#### 날짜/날짜 시간 유형 {#datedatetime-types}

ClickHouse Go 클라이언트는 `Date`, `Date32`, `DateTime`, 및 `DateTime64` 날짜/날짜 시간 유형을 지원합니다. 날짜는 `2006-01-02` 형식의 문자열로 삽입할 수 있으며, 또는 기본 Go `time.Time{}` 또는 `sql.NullTime`을 사용할 수 있습니다. 날짜 시간은 후자의 유형도 지원하지만, 문자열은 `2006-01-02 15:04:05` 형식에 옵셔널 시간대 오프셋을 추가하여 전달해야 합니다, 예: `2006-01-02 15:04:05 +08:00`. `time.Time{}` 및 `sql.NullTime`은 읽기 시간에도 지원되며 `sql.Scanner` 인터페이스의 모든 구현에서 사용할 수 있습니다.

시간대 정보의 처리는 ClickHouse 유형에 따라 삽입되거나 읽히는지에 따라 다릅니다:

* **DateTime/DateTime64**
  * 삽입 시 값은 ClickHouse에 UNIX 타임스탬프 형식으로 전송됩니다. 시간대가 제공되지 않으면 클라이언트는 클라이언트의 로컬 시간대를 가정합니다. `time.Time{}` 또는 `sql.NullTime`은 그에 따라 epoch로 변환됩니다.
  * 선택 시 열의 시간대가 설정된 경우 `time.Time` 값을 반환합니다. 설정되지 않은 경우 서버의 시간대가 사용됩니다.
* **Date/Date32**
  * 삽입 시, 날짜를 UNIX 타임스탬프로 변환할 때 모든 날짜의 시간대가 고려됩니다, 즉, ClickHouse의 날짜 유형은 로캘이 없기 때문에 저장 전 시간대에 의해 오프셋됩니다. 이는 문자열 값으로 지정되지 않으면 로컬 시간대가 사용됩니다.
  * 선택 시, 날짜는 `time.Time{}` 또는 `sql.NullTime{}` 인스턴스에 스캔되며 시간대 정보는 없이 반환됩니다.
#### 배열 {#array}

배열은 슬라이스로 삽입되어야 합니다. 요소에 대한 유형 규칙은 [기본형](#type-conversions)과 일치하며, 가능한 경우 요소는 변환됩니다.

스캔 시간에는 슬라이스에 대한 포인터가 제공되어야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)
#### 맵 {#map}

맵은 Golang 맵으로 삽입되어야 하며, 키와 값은 앞서 정의된 유형 규칙을 준수해야 합니다 [여기서](#type-conversions).

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)
#### 튜플 {#tuples}

튜플은 임의 길이의 컬럼 그룹을 나타냅니다. 컬럼은 명시적으로 이름이 지정되거나 유형만 지정할 수 있습니다, 예:

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

이러한 방법 중에서, 이름이 지정된 튜플은 더 큰 유연성을 제공합니다. 이름이 없는 튜플은 슬라이스를 사용하여 삽입 및 읽어야 하지만, 이름이 지정된 튜플은 맵과 호환됩니다.

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

참고: 유형 슬라이스와 맵은 지원되며, 이름이 지정된 튜플의 모든 하위 열은 동일한 유형이어야 합니다.
#### 중첩 {#nested}

중첩 필드는 이름이 지정된 튜플의 배열과 같습니다. 사용자는 [flatten_nested](/operations/settings/settings#flatten_nested)를 1 또는 0으로 설정하여 사용할 수 있습니다.

flatten_nested를 0으로 설정하면, 중첩 열은 단일 튜플 배열로 남아 있습니다. 이를 통해 사용자는 삽입 및 검색을 위해 맵의 슬라이스를 사용할 수 있으며 임의의 수준의 중첩을 사용할 수 있습니다. 맵의 키는 컬럼의 이름과 같아야 하며, 아래 예제에서 확인할 수 있습니다.

참고: 맵은 튜플을 나타내기 때문에 `map[string]interface{}` 유형이어야 합니다. 값은 현재 강한 타입을 가지지 않습니다.

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

[전체 예제 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested`의 기본값인 1을 사용하면, 중첩 열은 별도의 배열로 평면화됩니다. 이를 위해서는 삽입 및 검색에 중첩된 슬라이스를 사용해야 합니다. 임의의 수준의 중첩이 효과적일 수 있지만, 공식적으로 지원되지는 않습니다.

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

참고: 중첩 열은 동일한 차원이 있어야 합니다. 예를 들어, 위의 예에서 `Col_2_2`와 `Col_2_1`은 동일한 수의 요소를 가져야 합니다.

더 간단한 인터페이스와 중첩에 대한 공식 지원 때문에, `flatten_nested=0`을 권장합니다.
#### 지리 유형 {#geo-types}

클라이언트는 포인트, 링, 다각형 및 멀티 다각형과 같은 지리 유형을 지원합니다. 이러한 필드는 패키지 [github.com/paulmach/orb](https://github.com/paulmach/orb)를 사용하여 Golang에서 처리됩니다.

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
#### UUID {#uuid}

UUID 유형은 패키지 [github.com/google/uuid](https://github.com/google/uuid)에서 지원됩니다. 사용자는 UUID를 문자열 또는 `sql.Scanner` 또는 `Stringify`를 구현하는 모든 유형으로 전송하고 마샬링할 수 있습니다.

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
#### Decimal {#decimal}

Decimal 유형은 패키지 [github.com/shopspring/decimal](https://github.com/shopspring/decimal)에서 지원됩니다.

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
#### Nullable {#nullable}

Go의 Nil 값은 ClickHouse의 NULL을 나타냅니다. 이는 필드가 Nullable로 선언된 경우 사용할 수 있습니다. 삽입 시, 일반 및 Nullable 열 버전 모두에 대해 Nil을 전달할 수 있습니다. 전자의 경우, 타입의 기본값이 유지되며, 예를 들어 문자열의 경우 빈 문자열이 저장됩니다. Nullable 버전의 경우 ClickHouse에 NULL 값이 저장됩니다.

스캔 시간에는 사용자가 널을 지원하는 유형의 포인터, 예를 들어 *string을 전달하여 Nullable 필드의 널 값이 표현되도록 해야 합니다. 아래 예제에서 col1은 Nullable(String)이므로 **string을 받습니다. 이를 통해 널이 표현될 수 있습니다.

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

클라이언트는 또한 `sql.Null*` 유형, 예: `sql.NullInt64`를 지원합니다. 이들은 ClickHouse의 해당 유형과 호환됩니다.
#### 큰 정수 - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

64 비트 이상의 숫자 유형은 기본 Go [big](https://pkg.go.dev/math/big) 패키지를 사용하여 표현됩니다.

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
### 압축 {#compression}

압축 방법에 대한 지원은 사용 중인 기본 프로토콜에 따라 다릅니다. 네이티브 프로토콜의 경우 클라이언트는 `LZ4` 및 `ZSTD` 압축을 지원합니다. 이는 블록 수준에서만 수행됩니다. 압축은 연결에 `Compression` 구성 요소를 포함하여 활성화할 수 있습니다.

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

표준 인터페이스를 사용할 경우 추가 압축 기술을 사용할 수 있습니다. 자세한 내용은 [database/sql API - 압축](#compression)를 참조하십시오.
### 매개변수 바인딩 {#parameter-binding}

클라이언트는 `Exec`, `Query`, 및 `QueryRow` 메서드에 대한 매개변수 바인딩을 지원합니다. 아래 예제에서 보여주듯이 이름이 지정된, 번호가 매겨진 및 위치 매개변수를 사용할 수 있습니다. 아래에 이러한 예를 제공합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)
#### 특수 사례 {#special-cases}

기본적으로 슬라이스는 쿼리에 매개변수로 전달되면 쉼표로 구분된 값 목록으로 펼쳐집니다. 사용자가 `[ ]`로 감싼 값 집합을 주입해야 할 경우, `ArraySet`을 사용해야 합니다.

그룹/튜플이 필요하고 `( )`로 감싸야 할 경우, 예를 들어 IN 연산자와 같은 경우, 사용자는 `GroupSet`을 이용할 수 있습니다. 이는 아래 예제에서 여러 그룹이 필요한 경우 특히 유용합니다.

마지막으로, DateTime64 필드는 정밀도를 요구합니다. 필드에 대한 정밀도 수준은 클라이언트에서 알 수 없으므로, 사용자가 이를 제공해야 합니다. 이를 쉽고 간단하게 하기 위해 `DateNamed` 매개변수를 제공합니다.

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
### 컨텍스트 사용하기 {#using-context}

Go 컨텍스트는 마감 기한, 취소 신호 및 기타 요청 범위 값을 API 경계를 넘어 전달하는 수단을 제공합니다. 연결의 모든 메서드는 첫 번째 변수로 컨텍스트를 수용합니다. 이전 예에서는 context.Background()를 사용했지만, 사용자는 이 기능을 사용하여 설정과 마감 기한을 전달하고 쿼리를 취소할 수 있습니다.

`withDeadline`을 통해 생성된 컨텍스트를 전달하면 쿼리에 대해 실행 시간 제한을 설정할 수 있습니다. 이는 절대 시간이며, 만료는 연결을 해제하고 ClickHouse에 취소 신호를 전송합니다. `WithCancel`을 사용하여 쿼리를 명시적으로 취소할 수도 있습니다.

헬퍼 함수 `clickhouse.WithQueryID` 및 `clickhouse.WithQuotaKey`는 쿼리 ID와 할당량 키를 지정할 수 있도록 합니다. 쿼리 ID는 로그에서 쿼리를 추적하고 취소하는 데 유용할 수 있습니다. 할당량 키는 고유한 키 값에 따라 ClickHouse 사용에 대한 제한을 부과하는 데 사용할 수 있습니다 - 이와 관련하여 자세한 내용은 [할당량 관리](/operations/access-rights#quotas-management)를 참조하십시오.

사용자는 또한 특정 쿼리만을 위해 설정이 적용되도록 컨텍스트를 사용할 수 있습니다 - 전체 연결이 아니라 [연결 설정](#connection-settings)에서 보여진 것과 같이.

마지막으로 사용자는 `clickhouse.WithBlockSize`를 통해 블록 버퍼의 크기를 제어할 수 있습니다. 이는 연결 수준 설정 `BlockBufferSize`를 오버라이드하고, 한 번에 디코딩되고 메모리에 보관되는 블록의 최대 수를 제어합니다. 더 큰 값은 메모리 사용량의 대가로 더 많은 병렬 처리를 의미할 수 있습니다.

위의 예제들은 아래에 표시됩니다.

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
### 진행/프로필/로그 정보 {#progressprofilelog-information}

진행, 프로필 및 로그 정보는 쿼리에 대해 요청할 수 있습니다. 진행 정보는 ClickHouse에서 읽고 처리한 행 및 바이트 수에 대한 통계를 보고합니다. 반면에 프로필 정보는 클라이언트에 반환된 데이터의 요약을 제공하며, 비압축된 바이트 수, 행 및 블록의 총합을 포함합니다. 마지막으로, 로그 정보는 스레드에 대한 통계, 예를 들어 메모리 사용량 및 데이터 속도를 제공합니다.

이 정보를 얻으려면 사용자가 [Context](#using-context)를 사용해야 하며, 사용자는 콜백 함수를 전달할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

### 동적 스캔 {#dynamic-scanning}

사용자는 스키마나 반환되는 필드의 유형을 모르는 테이블을 읽어야 할 수 있습니다. 이는 직접적인 데이터 분석이 수행되거나 일반 도구가 작성되는 경우에 일반적입니다. 이를 위해, 쿼리 응답에서 컬럼 유형 정보를 사용할 수 있습니다. 이 정보는 Go 리플렉션과 함께 사용되어 정확한 유형 변수를 런타임 인스턴스로 생성할 수 있으며, 이를 Scan에 전달할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

### 외부 테이블 {#external-tables}

[외부 테이블](/engines/table-engines/special/external-data/)은 클라이언트가 ClickHouse에 데이터를 전송할 수 있도록 하며, SELECT 쿼리를 사용합니다. 이 데이터는 임시 테이블에 저장되며, 쿼리 자체에서 평가를 위해 사용할 수 있습니다.

쿼리와 함께 클라이언트에 외부 데이터를 전송하려면 사용자가 `ext.NewTable`을 통해 외부 테이블을 작성한 후 이를 컨텍스트를 통해 전달해야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

### 오픈 텔레메트리 {#open-telemetry}

ClickHouse는 [트레이스 컨텍스트](/operations/opentelemetry/)를 네이티브 프로토콜의 일부로 전달할 수 있도록 허용합니다. 클라이언트는 `clickhouse.withSpan` 함수를 통해 Span을 생성하고 이를 Context를 통해 전달하여 이를 수행합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

추적 활용에 대한 전체 세부정보는 [OpenTelemetry 지원](/operations/opentelemetry/)에서 확인할 수 있습니다.

## 데이터베이스/SQL API {#databasesql-api}

`database/sql` 또는 "표준" API는 사용자가 애플리케이션 코드가 기본 데이터베이스에 구애받지 않고 표준 인터페이스를 준수하도록 하여 클라이언트를 사용할 수 있도록 합니다. 이는 몇 가지 비용이 발생합니다 - ClickHouse와 반드시 정렬되지 않은 추가 추상화 및 간접 레이어와 원시 값들입니다. 그러나 이러한 비용은 도구가 여러 데이터베이스에 연결해야 하는 시나리오에서는 일반적으로 수용 가능합니다.

추가로, 이 클라이언트는 HTTP를 전송 레이어로 사용하는 것도 지원합니다 - 데이터는 최적의 성능을 위해 여전히 네이티브 형식으로 인코딩됩니다.

다음은 ClickHouse API 문서의 구조를 반영하려고 합니다.

표준 API에 대한 전체 코드 예제는 [여기](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)에서 확인할 수 있습니다.

### 연결 {#connecting-1}

연결은 `clickhouse://<host>:<port>?<query_option>=<value>` 형식의 DSN 문자열과 `Open` 메서드를 사용하거나 `clickhouse.OpenDB` 메서드를 통해 이룰 수 있습니다. 후자는 `database/sql` 사양의 일부가 아니지만 `sql.DB` 인스턴스를 반환합니다. 이 방법은 프로파일링과 같은 기능을 제공하는데, 이는 `database/sql` 사양을 통해 명확하게 노출할 수 없습니다.

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

**이후 모든 예제에서는 명시적으로 보여지지 않는 한 ClickHouse `conn` 변수가 생성되었으며 사용 가능하다고 가정합니다.**

#### 연결 설정 {#connection-settings-1}

다음 매개변수를 DSN 문자열에 전달할 수 있습니다:

* `hosts` - 로드 밸런싱 및 장애 조치를 위한 단일 주소 호스트의 쉼표로 구분된 목록 - [여러 노드에 연결](#connecting-to-multiple-nodes) 참조.
* `username/password` - 인증 자격 증명 - [인증](#authentication) 참조
* `database` - 현재 기본 데이터베이스 선택
* `dial_timeout` - 기간 문자열은 선택적으로 부호가 있는 십진수 숫자의 시퀀스이며, 각 숫자는 선택적 분수와 `300ms`, `1s`와 같은 단위 접미사를 가질 수 있습니다. 유효한 시간 단위는 `ms`, `s`, `m`입니다.
* `connection_open_strategy` - `random/in_order` (기본값 `random`) - [여러 노드에 연결](#connecting-to-multiple-nodes) 참조
  - `round_robin` - 설정에서 라운드 로빈 서버 선택
  - `in_order` - 지정된 순서로 첫 번째 활성 서버 선택
* `debug` - 디버그 출력 활성화 (boolean 값)
* `compress` - 압축 알고리즘 지정 - `none` (기본값), `zstd`, `lz4`, `gzip`, `deflate`, `br`. true로 설정하면 `lz4`가 사용됩니다. 네이티브 통신에 대해서는 오직 `lz4`와 `zstd`만 지원됩니다.
* `compress_level` - 압축 수준 (기본값은 `0`). 압축에 대한 자세한 내용은 다음을 참조하십시오. 이것은 알고리즘에 따라 다릅니다:
  - `gzip` - `-2` (최고 속도)에서 `9` (최고 압축)
  - `deflate` - `-2` (최고 속도)에서 `9` (최고 압축)
  - `br` - `0` (최고 속도)에서 `11` (최고 압축)
  - `zstd`, `lz4` - 무시됨
* `secure` - 안전한 SSL 연결 설정 (기본값은 `false`)
* `skip_verify` - 인증서 검증 건너뛰기 (기본값은 `false`)
* `block_buffer_size` - 사용자가 블록 버퍼 크기를 제어할 수 있게 해줍니다. [`BlockBufferSize`](#connection-settings) 참조. (기본값은 `2`)

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

#### 연결 풀링 {#connection-pooling-1}

사용자는 [여러 노드에 연결](#connecting-to-multiple-nodes)에서 설명한 대로 제공된 노드 주소 목록의 사용에 영향을 미칠 수 있습니다. 그러나 연결 관리와 풀링은 설계상 `sql.DB`에 위임됩니다.

#### HTTP로 연결 {#connecting-over-http}

기본적으로 연결은 네이티브 프로토콜을 통해 설정됩니다. HTTP가 필요한 사용자는 DSN을 수정하여 HTTP 프로토콜을 포함시키거나 연결 옵션에서 프로토콜을 지정함으로써 이를 활성화할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

#### 여러 노드에 연결 {#connecting-to-multiple-nodes-1}

`OpenDB`를 사용하는 경우 ClickHouse API에서 사용되는 것과 동일한 옵션 접근 방식을 사용하여 여러 호스트에 연결하고, 선택적으로 `ConnOpenStrategy`를 지정할 수 있습니다.

DSN 기반 연결의 경우, 문자열은 여러 호스트와 `connection_open_strategy` 매개변수를 받아들이며, 이 매개변수의 값으로 `round_robin` 또는 `in_order`를 설정할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)

### TLS 사용 {#using-tls-1}

DSN 연결 문자열을 사용하는 경우, "secure=true" 매개변수를 통해 SSL을 활성화할 수 있습니다. `OpenDB` 메서드는 [TLS를 위한 네이티브 API](#using-tls)와 동일한 접근 방식을 사용하며, nil이 아닌 TLS 구조체의 지정에 의존합니다. DSN 연결 문자열은 SSL 인증을 건너뛰기 위해 skip_verify 매개변수를 지원하지만, 더 고급 TLS 구성에는 `OpenDB` 메서드가 필요합니다 - 이는 구성을 전달할 수 있도록 허용합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)

### 인증 {#authentication-1}

`OpenDB`를 사용하는 경우, 인증 정보를 일반적인 옵션을 통해 전달할 수 있습니다. DSN 기반 연결의 경우, 연결 문자열에 사용자 이름과 비밀번호를 매개변수로 전달하거나 주소에 인코딩된 자격 증명으로 전달할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)

### 실행 {#execution-1}

연결이 확보되면 사용자는 Exec 메서드를 통해 `sql` 명령문을 실행할 수 있습니다.

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

이 메서드는 컨텍스트를 받는 것을 지원하지 않습니다 - 기본적으로 백그라운드 컨텍스트로 실행됩니다. 사용자는 필요한 경우 `ExecContext`를 사용할 수 있습니다 - [Context 사용하기](#using-context) 참조.

### 배치 삽입 {#batch-insert-1}

배치 의미론은 `Being` 메서드를 통해 `sql.Tx`를 생성함으로써 달성할 수 있습니다. 여기서 `INSERT` 문과 함께 `Prepare` 메서드를 사용해 배치를 얻을 수 있습니다. 이렇게 하면 행을 추가할 수 있는 `sql.Stmt`가 반환됩니다. 원래 `sql.Tx`에서 `Commit`이 실행될 때까지 배치는 메모리에 축적됩니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

### 행 쿼리 {#querying-rows-1}

단일 행 쿼리는 `QueryRow` 메서드를 사용하여 수행할 수 있습니다. 이는 *sql.Row를 반환하며, 여기서는 컬럼이 매핑될 변수에 대한 포인터로 Scan을 호출할 수 있습니다. `QueryRowContext` 변형은 백그라운드가 아닌 컨텍스트를 전달하도록 허용합니다 - [Context 사용하기](#using-context) 참조.

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

여러 행을 반복하려면 `Query` 메서드를 사용해야 합니다. 이는 Next가 호출되어 행을 순회하는 `*sql.Rows` 구조체를 반환합니다. `QueryContext` 대응은 컨텍스트 전달을 허용합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### 비동기 삽입 {#async-insert-1}

비동기 삽입은 `ExecContext` 메서드를 통해 삽입을 실행함으로써 달성할 수 있습니다. 이 메서드는 비동기 모드가 활성화된 컨텍스트를 전달해야 하며, 아래와 같이 표현됩니다. 이를 통해 사용자는 클라이언트가 서버가 삽입을 완료할 때까지 기다릴 것인지 아니면 데이터가 수신되면 응답할 것인지를 지정할 수 있습니다. 이는 매개변수 [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)를 효과적으로 제어합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)

### 컬럼형 삽입 {#columnar-insert-1}

표준 인터페이스를 사용하여 지원되지 않습니다.

### 구조체 사용 {#using-structs-1}

표준 인터페이스를 사용하여 지원되지 않습니다.

### 타입 변환 {#type-conversions-1}

표준 `database/sql` 인터페이스는 [ClickHouse API](#type-conversions)와 동일한 유형을 지원해야 합니다. 복잡한 유형에 대한 몇 가지 예외가 있으며, 아래에 문서화되어 있습니다. ClickHouse API와 유사하게, 클라이언트는 삽입 및 응답 매핑에 대해 가능한 한 유연하게 변수를 수용하는 것을 목표로 합니다. 추가 세부정보는 [타입 변환](#type-conversions)에서 참조하십시오.

### 복합 타입 {#complex-types-1}

명시되지 않은 한, 복합 타입 처리는 [ClickHouse API](#complex-types)와 동일해야 합니다. 차이점은 `database/sql` 내부로 인한 것입니다.

#### 맵 {#maps}

ClickHouse API와 달리, 표준 API는 스캔 유형에서 맵이 강하게 지정되도록 요구합니다. 예를 들어, 사용자는 `Map(String,String)` 필드에 대한 `map[string]interface{}`를 전달할 수 없으며 대신 `map[string]string`을 사용해야 합니다. `interface{}` 변수는 항상 호환되며 더 복잡한 구조체를 위해 사용할 수 있습니다. 구조체는 읽기 시간에 지원되지 않습니다.

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

삽입 동작은 ClickHouse API와 동일합니다.

### 압축 {#compression-1}

표준 API는 네이티브 [ClickHouse API](#compression)와 동일한 압축 알고리즘을 지원합니다. 즉, 블록 수준에서 `lz4`와 `zstd` 압축이 가능합니다. 또한, gzip, deflate 및 br 압축은 HTTP 연결을 위해 지원됩니다. 이러한 것이 활성화되면 압축은 삽입 중 및 쿼리 응답에 대해 수행됩니다. 핑 또는 쿼리 요청과 같은 다른 요청은 압축되지 않은 상태로 유지됩니다. 이는 `lz4` 및 `zstd` 옵션과 일치합니다.

`OpenDB` 메서드를 사용하여 연결을 설정하는 경우 압축 구성(configuration)을 전달할 수 있습니다. 여기에는 압축 수준을 지정할 수 있는 기능이 포함됩니다(아래 참조). `sql.Open`을 통해 DSN으로 연결할 경우, `compress` 매개변수를 활용하십시오. 이는 `gzip`, `deflate`, `br`, `zstd` 또는 `lz4`와 같은 특정 압축 알고리즘일 수도 있고, boolean 플래그일 수도 있습니다. true로 설정되면 `lz4`가 사용됩니다. 기본값은 `none`, 즉 압축 비활성화입니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

적용된 압축 수준은 DSN 매개변수 compress_level 또는 Compression 옵션의 Level 필드를 통해 제어할 수 있습니다. 기본값은 0이지만 알고리즘에 따라 다릅니다:

* `gzip` - `-2` (최고 속도)에서 `9` (최고 압축)
* `deflate` - `-2` (최고 속도)에서 `9` (최고 압축)
* `br` - `0` (최고 속도)에서 `11` (최고 압축)
* `zstd`, `lz4` - 무시됨

### 매개변수 바인딩 {#parameter-binding-1}

표준 API는 [ClickHouse API](#parameter-binding)와 동일한 매개변수 바인딩 기능을 지원하여 매개변수를 `Exec`, `Query` 및 `QueryRow` 메서드(및 해당 [Context](#using-context) 변형)에 전달할 수 있습니다. 위치 기반, 이름 기반 및 번호 기반 매개변수가 지원됩니다.

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

주: [특별한 경우](#special-cases)가 여전히 적용됩니다.

### Context 사용 {#using-context-1}

표준 API는 ClickHouse API와 같이 컨텍스트를 통해 기한, 취소 신호 및 기타 요청 범위 값을 전달하는 동일한 기능을 지원합니다. ClickHouse API와 달리, 이는 메서드의 Context 변형을 사용하여 달성됩니다. 즉, 기본적으로 백그라운드 컨텍스트를 사용하는 메서드인 `Exec`에는 우선 매개변수로 컨텍스트를 전달할 수 있는 변형인 `ExecContext`이 있습니다. 이를 통해 애플리케이션 흐름의 어떤 단계에서든 컨텍스트를 전달할 수 있습니다. 예를 들어, 사용자는 `ConnContext`를 통해 연결을 설정하거나 `QueryRowContext`를 통해 쿼리 행을 요청할 때 컨텍스트를 전달할 수 있습니다. 사용 가능한 모든 메서드의 예는 아래에 나와 있습니다.

기한, 취소 신호, 쿼리 ID, 쿼타 키 및 연결 설정을 전달하기 위해 Context를 사용하는 것에 대한 더 자세한 내용은 ClickHouse API의 [Context 사용](#using-context) 참조하십시오.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### 세션 {#sessions}

네이티브 연결은 본질적으로 세션을 갖지만, HTTP를 통한 연결은 사용자가 설정으로 전달하기 위한 세션 ID를 생성해야 합니다. 이를 통해 세션에 결합된 기능, 예를 들어 임시 테이블을 사용할 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 동적 스캔 {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning)와 유사하게, 올바른 유형 변수를 런타임 인스턴스로 생성하여 Scan에 전달할 수 있도록 사용자가 스캔할 수 있는 열 유형 정보가 제공됩니다. 이를 통해 타입이 알려지지 않은 열을 읽을 수 있습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### 외부 테이블 {#external-tables-1}

[외부 테이블](/engines/table-engines/special/external-data/)은 클라이언트가 ClickHouse에 데이터를 전송할 수 있게 하고, `SELECT` 쿼리를 사용합니다. 이 데이터는 임시 테이블에 저장되며, 쿼리 자체에서 평가를 위해 사용될 수 있습니다.

쿼리와 함께 클라이언트에 외부 데이터를 전송하려면 사용자가 `ext.NewTable`을 통해 외부 테이블을 구축한 후 이를 컨텍스트를 통해 전달해야 합니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

### 오픈 텔레메트리 {#open-telemetry-1}

ClickHouse는 [트레이스 컨텍스트](/operations/opentelemetry/)를 네이티브 프로토콜의 일부로 전달할 수 있도록 허용합니다. 클라이언트는 `clickhouse.withSpan` 함수를 통해 Span을 생성하고 이를 Context를 통해 전달하여 이를 수행합니다. HTTP가 전송으로 사용될 때는 지원되지 않습니다.

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

[전체 예제](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## 성능 팁 {#performance-tips}

* 가능한 경우 ClickHouse API를 활용하십시오, 특히 원시 유형에 대해. 이는 상당한 리플렉션 및 간접 호출을 피할 수 있습니다.
* 대규모 데이터셋을 읽는 경우, [`BlockBufferSize`](#connection-settings)를 수정하는 것을 고려하십시오. 이는 메모리 사용량을 증가시킬 것이지만, 행 반복 중에 더 많은 블록을 병렬로 디코딩할 수 있게 해줍니다. 기본값인 2는 보수적이며 메모리 오버헤드를 최소화합니다. 더 높은 값은 메모리 내에서 더 많은 블록을 의미합니다. 이는 쿼리에 따라 블록 크기가 다를 수 있으므로 테스트가 필요합니다. 따라서 Context를 통해 [쿼리 수준](#using-context)에서 설정할 수 있습니다.
* 데이터를 삽입할 때는 고유한 유형으로 구체적으로 명시하십시오. 클라이언트는 유연성을 목표로 하지만, 예를 들어 UUID나 IP를 위해 문자열을 구문 분석하는 것을 허용할 수 있지만, 이는 데이터 유효성 검사를 필요로 하며 삽입 시 비용이 발생합니다.
* 가능한 경우 컬럼 지향 삽입을 사용하십시오. 이는 강하게 타입이 지정되어야 하며, 클라이언트가 값을 변환해야 할 필요성을 피할 수 있습니다.
* ClickHouse [권장 사항](/sql-reference/statements/insert-into/#performance-considerations)을 따라 최적의 삽입 성능을 확보하십시오.
