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

## 빠른 시작 \{#quick-start\}

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

## 개요 \{#overview\}

ClickHouse는 두 개의 공식 Go 클라이언트를 지원합니다. 이들 클라이언트는 상호 보완적이며, 의도적으로 서로 다른 사용 사례를 지원합니다.

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go 표준 `database/sql` 인터페이스 또는 네이티브 ClickHouse API를 지원하는 고수준 언어 클라이언트입니다.
* [ch-go](https://github.com/ClickHouse/ch-go) - 저수준 클라이언트입니다. 네이티브 인터페이스만 지원합니다.

clickhouse-go는 고수준 인터페이스를 제공하여, 행(row) 지향 시맨틱과 배치 처리(batching)를 사용해 데이터를 쿼리하고 삽입할 수 있도록 합니다. 이때 타입에는 비교적 유연하게 동작하며, 잠재적인 정밀도 손실이 발생하지 않는 한 값을 변환합니다. 반면 ch-go는 최적화된 열 지향 인터페이스를 제공하여, 타입 엄격성과 더 복잡한 사용성을 감수하는 대신 낮은 CPU 및 메모리 오버헤드로 빠른 데이터 블록 스트리밍을 제공합니다.

버전 2.3부터 clickhouse-go는 인코딩, 디코딩, 압축과 같은 저수준 기능에 ch-go를 활용합니다. 두 클라이언트 모두 인코딩에 네이티브 형식을 사용하여 최적의 성능을 제공하며, 네이티브 ClickHouse 프로토콜을 통해 통신할 수 있습니다. clickhouse-go는 또한 프록시 사용이나 트래픽 로드 밸런싱이 필요한 경우 HTTP를 전송 메커니즘으로도 지원합니다.

### 연결하는 네 가지 방법 \{#four-ways-to-connect\}

clickhouse-go는 **어떤 API**를 사용할지와 **어떤 전송 방식**을 사용할지, 두 가지를 독립적으로 선택할 수 있습니다. 이 두 선택을 조합하면 네 가지 연결 모드가 나옵니다:

|                                                | **TCP** (네이티브 프로토콜, 포트 9000/9440) |     **HTTP** (포트 8123/8443)    |
| :--------------------------------------------- | :-------------------------------: | :----------------------------: |
| **ClickHouse API** (`clickhouse.Open`)         |          기본값 — 가장 뛰어난 성능          | `Protocol: clickhouse.HTTP` 설정 |
| **`database/sql` API** (`OpenDB` / `sql.Open`) |      `clickhouse://host:9000`     |       `http://host:8123`       |

**API 선택:** 최대 성능과 전체 기능 세트(진행률 콜백, 열 지향 삽입, 폭넓은 타입 지원)가 필요하면 ClickHouse API를 선택하십시오. ORM이나 표준 Go 데이터베이스 인터페이스를 사용하는 도구와 통합해야 한다면 `database/sql`을 선택하십시오.

**전송 방식 선택:** TCP가 더 빠르며 기본값입니다. 인프라 요구 사항 때문에 HTTP가 필요한 경우 HTTP로 전환하십시오. 예를 들어 HTTP 로드 밸런서나 프록시를 통해 연결해야 하거나, 임시 테이블이 포함된 세션 또는 추가 압축 알고리즘(`gzip`, `deflate`, `br`)과 같은 HTTP 전용 기능이 필요한 경우입니다.

두 API 모두 전송 방식과 관계없이 네이티브 바이너리 인코딩을 사용하므로 HTTP에는 직렬화 오버헤드가 없습니다.

|                    | 네이티브 형식 | TCP 전송 | HTTP 전송 | 대량 쓰기 | Struct 마샬링 |  압축 | 진행률 콜백 |
| :----------------: | :-----: | :----: | :-----: | :---: | :--------: | :-: | :----: |
|   ClickHouse API   |    ✅    |    ✅   |    ✅    |   ✅   |      ✅     |  ✅  |    ✅   |
| `database/sql` API |    ✅    |    ✅   |    ✅    |   ✅   |            |  ✅  |        |

### 클라이언트 선택하기 \{#choosing-a-client\}

클라이언트 라이브러리 선택은 사용 패턴과 최적의 성능 요구 사항에 따라 달라집니다. 초당 수백만 건 수준의 대량 INSERT가 필요한 경우에는 저수준 클라이언트인 [ch-go](https://github.com/ClickHouse/ch-go) 사용을 권장합니다. 이 클라이언트는 ClickHouse 네이티브 포맷이 요구하는 것처럼 행 지향(row-oriented) 포맷에서 열 지향 포맷으로 변환(pivot)할 때 발생하는 오버헤드를 피합니다. 또한 사용 편의를 위해 리플렉션(reflection)이나 `interface{}` (`any`) 타입 사용도 피합니다.

집계에 중점을 둔 쿼리 워크로드나 처리량이 낮은 INSERT 워크로드의 경우, [clickhouse-go](https://github.com/ClickHouse/clickhouse-go)는 익숙한 `database/sql` 인터페이스와 더 직관적인 행 중심 동작 방식을 제공합니다. 또한 선택적으로 전송 프로토콜로 HTTP를 사용할 수 있으며, 헬퍼 함수를 활용하여 행을 struct로 또는 그 반대로 마샬링할 수 있습니다.

|               | 네이티브 형식 | 네이티브 프로토콜 | HTTP 프로토콜 | 행 지향 API | 열 지향 API | 타입 유연성 |  압축 | 쿼리 플레이스홀더 |
| :-----------: | :-----: | :-------: | :-------: | :------: | :-------: | :----: | :-: | :-------: |
| clickhouse-go |    ✅    |     ✅     |     ✅     |     ✅    |     ✅     |    ✅   |  ✅  |     ✅     |
|     ch-go     |    ✅    |     ✅     |           |          |     ✅     |        |  ✅  |           |

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


### 버전 관리 \{#versioning\}

클라이언트는 ClickHouse와는 별도로 릴리스됩니다. 2.x는 현재 개발 중인 메이저 버전을 나타냅니다. 2.x의 모든 버전은 서로 호환됩니다.

#### ClickHouse 호환성 \{#clickhouse-compatibility\}

클라이언트는 다음을 지원합니다.

- [여기](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)에 기록된, 현재 지원되는 모든 ClickHouse 버전. ClickHouse 버전에 대한 지원이 종료되면 해당 버전은 클라이언트 릴리스에서 더 이상 적극적으로 테스트되지 않습니다.
- 클라이언트가 릴리스된 날짜로부터 2년 이내의 모든 ClickHouse 버전. 단, LTS 버전만 적극적으로 테스트합니다.

#### Golang 호환성 \{#golang-compatibility\}

|       클라이언트 버전       |  Golang 버전 |
| :------------------: | :--------: |
|  =&gt; 2.0 &lt;= 2.2 | 1.17, 1.18 |
| &gt;= 2.3, &lt; 2.41 |    1.18+   |
|      &gt;= 2.41      |    1.21+   |
|      &gt;= 2.43      |    1.24+   |

## 모범 사례 \{#best-practices\}

* 가능하다면 ClickHouse API를 활용하십시오. 특히 원시 타입(primitive type)에 사용하면 reflection과 indirection을 크게 줄일 수 있습니다.
* 대용량 데이터셋을 읽는 경우 [`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings)를 조정하는 것을 고려하십시오. 이는 메모리 사용량을 증가시키지만, 행을 순회(iteration)하는 동안 더 많은 블록을 병렬로 디코딩할 수 있게 합니다. 기본값 2는 보수적인 값으로, 메모리 오버헤드를 최소화합니다. 값을 더 크게 설정하면 메모리에 더 많은 블록이 상주하게 됩니다. 쿼리에 따라 생성되는 블록 크기가 달라질 수 있으므로, 이에 대해서는 테스트가 필요합니다. 이 값은 Context를 통해 [쿼리 수준](/integrations/language-clients/go/clickhouse-api#using-context)에서 설정할 수 있습니다.
* 데이터를 삽입할 때 타입을 명확히 지정하십시오. 클라이언트는 가능한 한 유연하게 동작하도록 설계되어, 예를 들어 UUID나 IP에 대해 문자열 파싱을 허용하지만, 이는 데이터 검증이 필요하며 삽입 시점에 오버헤드가 발생합니다.
* 가능하면 열 지향 방식으로 삽입(column-oriented insert)하십시오. 이 또한 강한 타입을 사용하여, 클라이언트가 값을 변환할 필요가 없도록 하는 것이 좋습니다.
* 최적의 삽입 성능을 위해 ClickHouse [권장 사항](/sql-reference/statements/insert-into/#performance-considerations)을 따르십시오.

## 다음 단계 \{#next-steps\}

* [구성](/integrations/language-clients/go/configuration) — 연결 설정, TLS, 인증, 로깅, 압축
* [ClickHouse API](/integrations/language-clients/go/clickhouse-api) — 쿼리 및 삽입을 위한 네이티브 Go API
* [Database/SQL API](/integrations/language-clients/go/database-sql-api) — 표준 `database/sql` 인터페이스
* [타입](/integrations/language-clients/go/data-types) — Go 타입 매핑 및 복합 타입 지원