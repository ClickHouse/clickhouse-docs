---
sidebar_label: '구성 참고'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'configuration', 'options', 'reference', 'DSN', '연결 풀', 'TLS', 'compression', 'timeout']
description: '`clickhouse-go` 클라이언트의 각 옵션에 대한 전체 구성 참고 문서로, 연결 수준, Context 수준 및 batch 옵션을 다룹니다.'
slug: /integrations/language-clients/go/config-reference
title: 'Go 클라이언트 구성 참고'
doc_type: 'reference'
---

이 페이지에서는 `clickhouse-go` v2.x에서 설정할 수 있는 모든 옵션을 문서화합니다. 코드 예시가 포함된 가이드는 [구성](/integrations/language-clients/go/configuration)을 참조하십시오.

:::note[버전 어노테이션]
`clickhouse-go` v2.35.0 이상에서 추가된 옵션은 설명 옆에 *(vX.Y.Z부터)*로 표시됩니다. &quot;Since&quot; 태그가 없는 옵션은 v2.0부터 제공되었으며, 지원되는 모든 릴리스에 포함되어 있습니다.
:::

## 옵션 설정 방법 \{#how-options-are-set\}

옵션은 다음 3가지 범위로 구분됩니다:

| Scope          | How to set                           | Lifetime             |
| -------------- | ------------------------------------ | -------------------- |
| **Connection** | `clickhouse.Options` 구조체 또는 DSN 문자열  | 해당 connection의 모든 쿼리 |
| **Query**      | `clickhouse.Context()`와 `WithXxx` 함수 | 단일 쿼리 실행             |
| **Batch**      | `PrepareBatch()` 옵션 함수               | 단일 batch 작업          |

범위가 겹치면 더 구체적인 범위가 우선합니다: **Batch &gt; Query &gt; Connection**. `Settings`의 경우 쿼리 수준 키는 connection 수준 키와 머지되며, 충돌이 발생하면 쿼리 수준 설정이 우선합니다.

**Options 구조체 사용:**

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default", Password: ""},
    DialTimeout: 10 * time.Second,
    Compression: &clickhouse.Compression{Method: clickhouse.CompressionLZ4},
})
```

**DSN 문자열 사용:**

```go
db, err := sql.Open("clickhouse", "clickhouse://user:pass@localhost:9000/default?dial_timeout=10s&compress=lz4")
```

**커넥터 사용 시(database/sql에서 Options struct 사용):**

```go
db := sql.OpenDB(clickhouse.Connector(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default"},
    DialTimeout: 10 * time.Second,
}))
// Set database/sql-only pool settings after creation
db.SetConnMaxIdleTime(5 * time.Minute)
```

**Context를 통해(쿼리 단위):**

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query-123"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
rows, err := conn.Query(ctx, "SELECT ...")
```

***

## 연결 옵션 \{#connection-options\}

### 프로토콜 및 연결 \{#protocol-and-connection\}

| 옵션                 | 유형                         | 기본값                                                       | DSN 매개변수                                                         | 설명                                                                                         | 권장 사항                                                                                                                                                                                        | 잘못 구성된 경우                                                                                                                     |
| ------------------ | -------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Protocol`         | `Protocol` (int)           | `네이티브`                                                  | 스킴: `clickhouse://`=`네이티브`, `http://`=HTTP                       | 통신 프로토콜입니다. TCP에는 `네이티브` (0), HTTP에는 `HTTP` (1)을 사용합니다                                   | 약 30% 더 나은 성능을 위해 네이티브를 사용하세요. 프록시 지원, 방화벽 통과(포트 80/443), 또는 HTTP 전용 압축(`gzip`/`br`)이 필요하면 HTTP를 사용하세요. [TCP vs HTTP](/integrations/language-clients/go/configuration#tcp-vs-http)를 참조하세요. | 네이티브 포트(9000)에서 HTTP 스킴을 사용하면 connection refused 오류가 발생합니다. 방화벽에서 네이티브가 차단되면 시간 초과가 발생합니다.                                |
| `Addr`             | `[]string`                 | `["localhost:9000"]` (`네이티브`) `["localhost:8123"]` (HTTP) | URL에서 쉼표로 구분된 호스트                                                | 연결 및 장애 조치에 사용할 `"host:port"` 주소 목록입니다                                                     | 운영 환경에서는 고가용성(HA)을 위해 여러 주소를 지정하세요. 올바른 포트는 9000 (`네이티브`), 8123 (HTTP), 9440 (`네이티브`+TLS), 8443 (HTTP+TLS)입니다.                                                                               | 단일 주소만 사용하면 장애 조치를 할 수 없습니다. 잘못된 포트를 사용하면 `"connection refused"` 오류가 발생합니다. 비어 있거나 nil이면 기본값으로 localhost가 사용되어 분산 배포에서 실패합니다. |
| `ConnOpenStrategy` | `ConnOpenStrategy` (uint8) | `ConnOpenInOrder` (0)                                     | `connection_open_strategy` (`in_order`, `round_robin`, `random`) | `Addr`에서 서버를 선택하는 전략입니다. `InOrder` (0)=장애 조치, `RoundRobin` (1)=부하 분산, `Random` (2)=무작위입니다. | active-standby에는 `InOrder`를 사용하세요. active-active/K8s에는 `RoundRobin`을 사용하세요. thundering herd 현상을 피하려면 `Random`을 사용하세요.                                                                        | active-active에서 `InOrder`를 사용하면 첫 번째 서버에 모든 부하가 집중되고 나머지는 유휴 상태가 됩니다. 장애 발생 시 모든 전략은 모든 서버를 시도하며, 차이는 *처음* 시도하는 서버에만 있습니다.    |

***

### 인증 \{#authentication\}

| Option          | Type                        | Default               | DSN param                          | Description                                                                              | Best practice                                               | When misconfigured                                                                                         |
| --------------- | --------------------------- | --------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Auth.Username` | `string`                    | `"default"`           | `username` or URL user portion     | ClickHouse 인증에 사용할 사용자 이름                                                                | 운영 환경에서는 `default`를 절대 사용하지 마십시오. 최소 권한만 가진 전용 사용자를 생성하십시오. | 잘못된 사용자 이름: `"Code: 516. DB::Exception: Authentication failed"`. 빈 문자열: `"default"`를 자동으로 사용합니다.           |
| `Auth.Password` | `string`                    | `""`                  | `password` or URL password portion | ClickHouse 인증에 사용할 비밀번호                                                                  | 운영 환경에서는 환경 변수 또는 시크릿 관리자를 사용하십시오. DSN의 특수 문자는 URL 인코딩하십시오. | 잘못된 비밀번호: `"Code: 516. DB::Exception: Authentication failed"`. 특수 문자를 URL 인코딩하지 않으면 구문 분석 오류가 발생합니다.       |
| `Auth.Database` | `string`                    | `""` (server default) | `database` or URL path (`/mydb`)   | 연결의 기본 데이터베이스                                                                            | 항상 명시적으로 지정하십시오. 운영 환경에서는 애플리케이션별 전용 데이터베이스를 사용하십시오.        | 존재하지 않음: `"Code: 81. DB::Exception: Database xyz doesn't exist"`. 멀티 테넌트 구성에서 비워 두면 쿼리가 잘못된 데이터베이스로 전송됩니다. |
| `GetJWT`        | `func(ctx) (string, error)` | `nil`                 | (programmatic only)                | ClickHouse Cloud 인증용 JWT를 반환하는 콜백입니다. `WithJWT(token)`으로 쿼리별로 재정의할 수 있습니다. *(v2.35.0부터)* | 토큰 캐싱/갱신을 구현하십시오. 연결/요청마다 호출됩니다.                            | 만료된 토큰: 인증 오류. 콜백이 차단되면 시간 초과가 발생합니다. JWT는 사용자 이름/비밀번호보다 우선합니다. TLS가 필요하며, 없으면 자동으로 사용자 이름/비밀번호로 대체됩니다.    |

```go
GetJWT: func(ctx context.Context) (string, error) {
    return getTokenFromVault(ctx)
}
```

***

### 타임아웃 \{#timeouts\}

| Option        | 유형              | 기본값         | DSN param      | 설명                                                                                    | 모범 사례                                                        | 잘못 구성된 경우                                                                                                                     |
| ------------- | --------------- | ----------- | -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `DialTimeout` | `time.Duration` | `30s`       | `dial_timeout` | 새 연결을 설정하는 데 허용되는 최대 시간입니다. `MaxOpenConns` 한도에 도달한 경우 풀에서 연결을 가져오기 위해 대기하는 시간도 제어합니다. | LAN에서는 5-10초, WAN/Cloud에서는 15-30초를 권장합니다. 1초 미만으로 설정하지 마십시오. | 너무 짧으면 혼잡 시 `"clickhouse: acquire conn timeout"`이 발생합니다. 너무 길면(60초 초과) 장애 발생 시 애플리케이션이 멈춘 것처럼 보일 수 있습니다.                      |
| `ReadTimeout` | `time.Duration` | `5m` (300s) | `read_timeout` | 각 읽기 호출에서 서버 응답을 기다리는 최대 시간입니다. 전체 쿼리가 아니라 블록별로 적용됩니다. Context 데드라인이 우선 적용됩니다.        | 짧은 대화형 쿼리에는 10-30초, 긴 분석 쿼리에는 5-30분을 권장합니다.                  | 너무 짧으면 쿼리 실행 중간에 `"i/o timeout"` 또는 `"read: connection reset by peer"`가 발생할 수 있으며, 서버는 계속 쿼리를 실행합니다. 너무 길면 끊어진 연결을 감지하지 못합니다. |

***

### 연결 풀 \{#connection-pool\}

| Option            | Type            | Default                      | DSN param           | API               | Description                                                                                   | Best practice                                                                                                                | When misconfigured                                                                                                                                            |
| ----------------- | --------------- | ---------------------------- | ------------------- | ----------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MaxIdleConns`    | `int`           | `5`                          | `max_idle_conns`    | 둘 다               | 풀에서 유휴 상태(사용되지는 않지만 살아 있는)인 연결의 최대 수                                                          | 예상 동시 쿼리 수의 50~~80%로 설정합니다. 낮음: 2~~5, 중간: 10~~20, 높음: 20~~50.                                                                | 너무 낮으면 연결 생성/해제가 잦아지고 지연 시간이 증가합니다. 너무 높으면 메모리가 낭비됩니다. `MaxOpenConns`로 자동 제한됩니다.                                                                              |
| `MaxOpenConns`    | `int`           | `MaxIdleConns + 5` (기본값: 10) | `max_open_conns`    | 둘 다               | 전체 연결 수(유휴 + 활성)의 최대값                                                                         | 낮음: 10~~20, 중간: 20~~50, 높음: 50~100. 산식: 동시 쿼리 + 버스트 + 버퍼. 모니터링: `SELECT * FROM system.metrics WHERE metric='TCPConnection'`. | 너무 낮으면 `"clickhouse: acquire conn timeout"`가 발생합니다. 너무 높으면 서버에서 `"Too many connections"`가 발생하고 FD 제한을 초과할 수 있습니다. ClickHouse 기본 `max_connections`: 1024 (공유). |
| `ConnMaxLifetime` | `time.Duration` | `1h`                         | `conn_max_lifetime` | 둘 다               | 연결을 재사용할 수 있는 최대 기간입니다. 풀에 반환될 때 검사됩니다.                                                       | 안정적인 환경에서는 1~~5시간. K8s/롤링 배포에서는 5~~15분. 무한대로 설정하지 마십시오.                                                                      | 너무 짧으면(&lt; 1m) 연결 생성/해제가 잦아지고 지연 시간이 증가합니다. 너무 길거나 무한대이면 오래된 연결이 유지되고, DNS 변경이 반영되지 않으며, 트래픽이 리밸런싱되지 않습니다.                                                   |
| `ConnMaxIdleTime` | `time.Duration` | `0` (없음)                     | —                   | `database/sql` 전용 | 연결이 닫히기 전까지 *유휴* 상태로 유지될 수 있는 최대 시간입니다. `Options` 구조체에는 없으며 `db.SetConnMaxIdleTime()`로 설정합니다. | K8s/버스트성 워크로드에서는 트래픽 급증 후 유휴 연결을 회수할 수 있도록 5~10분으로 설정합니다.                                                                    | 설정하지 않으면 유휴 연결은 `ConnMaxLifetime`까지 유지됩니다. 너무 짧으면(&lt; 30s) 일반적인 유휴 구간에도 연결이 다시 생성됩니다.                                                                        |

:::note `database/sql` 전용
`ConnMaxIdleTime`은 표준 Go `database/sql` 풀 설정입니다. `clickhouse.Options` 구조체나 `clickhouse.Open()`에서는 사용할 수 없습니다. `OpenDB()` 후에 설정하십시오:

```go
db := clickhouse.OpenDB(&clickhouse.Options{...})
db.SetConnMaxIdleTime(5 * time.Minute)
```

:::

자세한 사용 방법은 [연결 풀링](/integrations/language-clients/go/configuration#connection-pooling)을 참조하십시오.

***

### 표준 database/sql 풀 설정 \{#sql-db-settings\}

`clickhouse.OpenDB()` 또는 `sql.Open("clickhouse", dsn)`를 사용하면 반환되는 `*sql.DB`에서 Go의 표준 풀 메서드를 사용할 수 있습니다. `OpenDB()`는 `Options`의 처음 3개 항목을 자동으로 적용합니다.

| Method                     | Options equivalent | Notes                   |
| -------------------------- | ------------------ | ----------------------- |
| `db.SetMaxIdleConns(n)`    | `MaxIdleConns`     | `OpenDB()`에서 자동으로 적용합니다 |
| `db.SetMaxOpenConns(n)`    | `MaxOpenConns`     | `OpenDB()`에서 자동으로 적용합니다 |
| `db.SetConnMaxLifetime(d)` | `ConnMaxLifetime`  | `OpenDB()`에서 자동으로 적용합니다 |
| `db.SetConnMaxIdleTime(d)` | *없음*               | 생성 후 수동으로 설정해야 합니다      |

:::note[ClickHouse API (clickhouse.Open)]
이 메서드들은 `clickhouse.Open()`이 반환하는 connection에서는 사용할 수 **없습니다**. ClickHouse API는 `Options` 구조체의 필드를 직접 사용해 내부적으로 자체 풀을 관리합니다.
:::

***

### 압축 \{#compression\}

| 옵션                     | 유형                         | 기본값                 | DSN 매개변수                                                                     | 설명                                                                   | 권장 사항                                                                                                                | 잘못 구성된 경우                                                                                                      |
| ---------------------- | -------------------------- | ------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Compression.Method`   | `CompressionMethod` (byte) | None                | `compress` (`lz4`, `zstd`, `lz4hc`, `gzip`, `deflate`, `br`, 또는 LZ4용 `true`) | 데이터 전송에 사용할 압축 알고리즘입니다. 아래 프로토콜 지원 매트릭스를 참조하십시오.                     | LAN: None 또는 LZ4. WAN: ZSTD 또는 LZ4. CPU 제약이 있는 경우: LZ4. 최대 압축: ZSTD (`네이티브`) 또는 Brotli (HTTP). 1 MB 미만의 삽입에는 생략하십시오. | `네이티브`에서 GZIP/Brotli 사용 시: 핸드셰이크 실패. HTTP에서 LZ4HC 사용 시: 오류 또는 자동 폴백. 느린 네트워크에서 압축을 사용하지 않으면 삽입이 10~100배 느려집니다. |
| `Compression.Level`    | `int`                      | `3`                 | `compress_level`                                                             | 알고리즘별 압축 강도입니다. GZIP/Deflate: -2~~9. Brotli: 0~~11. LZ4/ZSTD: 무시됩니다. | GZIP의 균형 잡힌 설정: 3~~6. Brotli의 균형 잡힌 설정: 4~~6.                                                                        | 매우 높은 레벨: CPU 사용량이 크게 증가하지만 이점은 미미합니다. LZ4/ZSTD에 0이 아닌 값을 지정해도 자동으로 무시됩니다. 압축을 활성화하지 않고 레벨만 설정한 경우: 효과가 없습니다.  |
| `MaxCompressionBuffer` | `int` (bytes)              | `10485760` (10 MiB) | `max_compression_buffer`                                                     | 플러시 전 최대 압축 버퍼 크기입니다. 각 연결은 자체 버퍼를 사용합니다.                            | 기본값 10 MiB면 충분합니다. 열이 많은 행에는 20~50 MiB를 사용하십시오. 총 메모리 = 버퍼 x `MaxOpenConns`.                                         | 너무 작음 (&lt; 1 MiB): 플러시가 자주 발생해 효율이 떨어집니다. 너무 큼 (&gt; 100 MiB): 연결 수가 많으면 OOM이 발생합니다.                          |

**프로토콜별 압축 메서드 지원:**

| Method               | `네이티브` | HTTP |
| -------------------- | ------ | ---- |
| `CompressionLZ4`     | 예      | 예    |
| `CompressionLZ4HC`   | 예      | 아니요  |
| `CompressionZSTD`    | 예      | 예    |
| `CompressionGZIP`    | 아니요    | 예    |
| `CompressionDeflate` | 아니요    | 예    |
| `CompressionBrotli`  | 아니요    | 예    |

***

### TLS \{#tls\}

| 옵션    | 유형            | 기본값        | DSN 매개변수                          | 설명                                                                           | 권장 사항                                                                                                                      | 오구성 시                                                                                                                                                                                                                                                                                                                                                                 |
| ----- | ------------- | ---------- | --------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TLS` | `*tls.Config` | `nil` (평문) | `secure=true`, `skip_verify=true` | TLS/SSL 구성입니다. `nil`이 아니면 TLS가 활성화됩니다. 포트: `네이티브` 9000/9440, HTTP 8123/8443. | 프로덕션 환경과 ClickHouse Cloud에서는 항상 활성화하십시오(필수). 프로덕션에서는 `InsecureSkipVerify: false`로 설정하십시오. 사용자 지정 CA는 `RootCAs`를 통해 추가하십시오. | 포트가 잘못되면 `"connection reset by peer"` 오류가 발생합니다. 프로덕션에서 `skip_verify=true`를 사용하면 MITM 공격에 취약해집니다. 인증서가 만료되면 `"x509: certificate has expired"` 오류가 발생합니다. 호스트가 잘못되면 `"x509: certificate is valid for X, not Y"` 오류가 발생합니다. 신뢰되지 않는 CA를 사용하면 `"x509: certificate signed by unknown authority"` 오류가 발생합니다. `secure=true`와 함께 HTTP DSN을 사용하는 경우 대신 `https://` 스킴을 사용하십시오. |

코드 예시는 [TLS](/integrations/language-clients/go/configuration#using-tls)를 참조하십시오.

***

### 로깅 \{#logging\}

| 옵션                    | 유형                     | 기본값           | DSN 매개변수 | 설명                                                                                           | 권장 사항                                                                     | 잘못 구성된 경우                                                       |
| --------------------- | ---------------------- | ------------- | -------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `Logger`              | `*slog.Logger`         | `nil` (로깅 없음) | —        | Go의 `log/slog`를 통한 구조화 로거입니다. 우선순위: `Debug`+`Debugf` &gt; `Logger` &gt; no-op. *(v2.43.0부터)* | 운영 환경에서는 JSON 핸들러와 함께 `slog`를 사용하십시오. `logger.With(...)`로 앱 컨텍스트를 추가하십시오. | —                                                               |
| `Debug` (deprecated)  | `bool`                 | `false`       | `debug`  | 이전 방식의 디버그 토글입니다. 대신 `Logger`를 사용하십시오. `Debugf`가 설정되지 않으면 stdout에 로그를 출력합니다.                 | —                                                                         | 운영 환경에서 활성화하면 성능 오버헤드가 발생하고, 과도한 로그가 출력되며, 민감한 데이터가 노출될 수 있습니다. |
| `Debugf` (deprecated) | `func(string, ...any)` | `nil`         | —        | 사용자 지정 디버그 로그 함수입니다. 대신 `Logger`를 사용하십시오. `Debug: true`가 필요합니다.                              | —                                                                         | —                                                               |

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
conn, err := clickhouse.Open(&clickhouse.Options{
    Logger: logger,
    // ...
})
```

[로깅](/integrations/language-clients/go/configuration#logging)에서 전체 예시를 확인하십시오.

***

### 버퍼와 메모리 \{#buffers-and-memory\}

| 옵션                     | 유형      | 기본값     | DSN param           | 쿼리별                       | 설명                                                 | 모범 사례                                                                                 | 잘못 구성된 경우                                                                                |
| ---------------------- | ------- | ------- | ------------------- | ------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `BlockBufferSize`      | `uint8` | `2`     | `block_buffer_size` | 예 (`WithBlockBufferSize`) | 결과를 읽을 때 버퍼링할 디코딩된 블록입니다. 읽기와 디코딩을 동시에 수행할 수 있습니다. | 기본값 2면 충분합니다. 대용량 스트리밍 결과에는 5-10을 사용하십시오. 메모리 = 버퍼 x 블록 크기 x 동시 쿼리 수입니다.              | 너무 작음(1): 블록 읽기가 지연되어 지연 시간이 증가합니다. 너무 큼(&gt; 50): 메모리 사용량이 커지고 추가 효과는 크지 않습니다.          |
| `FreeBufOnConnRelease` | `bool`  | `false` | —                   | 아니요                       | 각 쿼리 후 connection 메모리 버퍼를 재사용하지 않고 해제합니다.          | 쿼리 처리량이 높을 때는 `false`를 사용하십시오. 메모리 제약이 있는 컨테이너 또는 드물게 큰 배치를 처리하는 경우에는 `true`를 사용하십시오. | `false` + 제한된 메모리: 버퍼가 누적됩니다(메모리 = 버퍼 x 유휴 연결 수). `true` + 높은 처리율: GC 부담 증가, CPU 사용량 증가. |

***

### HTTP 전용 \{#http-specific\}

:::warning[Native에서는 조용히 무시됨]
이 옵션은 `Protocol: clickhouse.HTTP`에만 영향을 줍니다. 네이티브 프로토콜을 사용할 때는 조용히 무시되며, 오류나 경고도 발생하지 않습니다.
:::

| Option                | 유형                                                 | Default               | DSN param                  | 설명                                                                    | 모범 사례                                                                    | 잘못 구성된 경우                                                                                      |
| --------------------- | -------------------------------------------------- | --------------------- | -------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `HttpHeaders`         | `map[string]string`                                | `nil`                 | —                          | 모든 요청에 추가되는 HTTP 헤더                                                   | tracing(`X-Request-ID`), 인증 프록시 헤더에 사용하십시오. 필요한 항목만 최소한으로 설정하십시오.        | 내부 헤더(`Content-Type`, `Authorization`)를 재정의하면 동작이 예측 불가능해질 수 있습니다.                             |
| `HttpUrlPath`         | `string`                                           | `""`                  | `http_path`                | 요청에 덧붙는 URL 경로입니다. 앞의 `/`는 자동으로 추가됩니다.                                | 경로 기반 라우팅을 사용하는 리버스 프록시 뒤에 있을 때 사용하십시오.                                  | 경로가 잘못되면 프록시/LB에서 HTTP 404가 발생합니다.                                                             |
| `HttpMaxConnsPerHost` | `int`                                              | `0` (unlimited)       | —                          | 전송 계층에서 호스트별 TCP 연결 수를 제어합니다(`http.Transport.MaxConnsPerHost`).       | 대부분의 애플리케이션에서는 0으로 두십시오. 서버에 엄격한 연결 제한이 있을 때만 설정하십시오.                    | 너무 낮으면(예: `MaxOpenConns`=50에서 10) 서버 부하가 낮아도 전송 병목으로 인해 쿼리가 느려집니다.                             |
| `HTTPProxyURL`        | `*url.URL`                                         | `nil` (uses env vars) | `http_proxy` (URL-encoded) | 요청을 라우팅하는 데 사용하는 HTTP 프록시                                             | 프록시가 필요하면 명시적으로 설정하십시오. `HTTP_PROXY`/`HTTPS_PROXY` 환경 변수보다 우선 적용됩니다.     | 주소가 잘못되면 `"dial tcp: lookup proxy: no such host"`가 발생합니다. 프록시에 인증이 필요하면 HTTP 407이 발생합니다.       |
| `TransportFunc`       | `func(*http.Transport) (http.RoundTripper, error)` | `nil`                 | —                          | 사용자 지정 HTTP transport 팩터리입니다. 래핑할 기본 transport를 전달받습니다. *(v2.41.0부터)* | 관측성 미들웨어에 사용하십시오. `Proxy`, `DialContext`, `TLSClientConfig`는 재정의하지 마십시오. | `nil`을 반환하면 panic이 발생합니다. 클라이언트 필드를 재정의하면 TLS/프록시가 조용히 무시됩니다. RoundTripper를 차단하면 교착 상태가 발생합니다. |

:::note[2계층 HTTP 풀링]
HTTP를 사용할 때는 두 개의 연결 풀이 있습니다:

* **1계층(애플리케이션):** `MaxIdleConns` / `MaxOpenConns` -- `httpConnect` 객체를 제어합니다
* **2계층(전송):** `HttpMaxConnsPerHost` -- 기반 TCP 연결을 제어합니다

네이티브 프로토콜은 단순한 1:1 매핑을 사용하며 `HttpMaxConnsPerHost`를 무시합니다.
:::

```go
TransportFunc: func(t *http.Transport) (http.RoundTripper, error) {
    return &loggingRoundTripper{transport: t}, nil
}
```

***

### 고급 연결 \{#advanced-connection\}

| 옵션             | 유형                                                     | 기본값                   | DSN 매개변수 | 설명                                                      | 권장 사항                                                            | 잘못 구성된 경우                                                                                                            |
| -------------- | ------------------------------------------------------ | --------------------- | -------- | ------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DialContext`  | `func(ctx, addr) (net.Conn, error)`                    | `nil` (표준 다이얼러)       | —        | TCP 연결용 사용자 지정 다이얼 함수입니다. 네이티브와 HTTP 모두에서 작동합니다.        | 99%의 경우 `nil`로 두십시오. Unix 소켓, SOCKS 프록시, 사용자 지정 DNS에 사용하십시오.     | Context를 따르지 않으면 멈춤 현상이나 리소스 누수가 발생합니다. `TLS`가 설정된 경우 사용자 지정 다이얼러가 TLS를 직접 처리해야 합니다. `net.Conn`이 유효하지 않으면 충돌이 발생합니다. |
| `DialStrategy` | `func(ctx, connID, options, dial) (DialResult, error)` | `DefaultDialStrategy` | —        | 사용자 지정 서버 선택 및 연결 전략입니다. `ConnOpenStrategy`보다 우선 적용됩니다. | 99.9%의 경우 기본값을 사용하십시오. 지리 인식 라우팅, 가중치 기반 선택, 상태 검사에만 사용자 지정하십시오. | 모든 서버를 시도하지 않으면 정상 서버가 있어도 실패합니다. 내부에서 비용이 큰 작업을 수행하면 연결할 때마다 풀 획득이 차단됩니다.                                           |

***

### 클라이언트 정보 \{#client-information\}

| Option       | Type                | Default                         | DSN param                       | Per-query                | Description                                                                                                                              | Best practice                                                                                              | When misconfigured                                     |
| ------------ | ------------------- | ------------------------------- | ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ClientInfo` | `ClientInfo` struct | 자동: `clickhouse-go` 버전 + Go 런타임 | `client_info_product=myapp/1.0` | 예 (`WithClientInfo`, 추가) | ClickHouse에 전송되는 애플리케이션 식별 정보입니다. `Products` (`[]struct{Name,Version}`)와 `Comment` (`[]string`)를 포함합니다. `system.query_log`에서 확인할 수 있습니다. | 항상 앱 이름과 버전을 설정하십시오. 쿼리 출처 추적: `SELECT client_name FROM system.query_log WHERE client_name LIKE '%myapp%'` | 설정하지 않으면 여러 서비스가 있는 환경에서 어떤 서비스가 쿼리를 실행했는지 식별할 수 없습니다. |

```go
ClientInfo: clickhouse.ClientInfo{
    Products: []struct{ Name, Version string }{
        {Name: "my-service", Version: "1.0.0"},
    },
}
// Appears as: clickhouse-go/2.x my-service/1.0.0 (lv:go/1.23; os:linux)
```

***

### ClickHouse 서버 설정 \{#server-settings\}

| 옵션              | 유형                            | 기본값   | DSN 매개변수                                     | 쿼리별                                  | 설명                                                                                                                        | 모범 사례                                          | 잘못 구성된 경우                                                                                                                               |
| --------------- | ----------------------------- | ----- | -------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Settings`      | `map[string]any`              | `nil` | 인식되지 않은 모든 매개변수(예: `?max_execution_time=60`) | 예 (`WithSettings`, 충돌 시 Context가 우선) | 모든 쿼리에 적용되는 ClickHouse 서버 설정입니다. DSN 변환: `"true"`→`1`, `"false"`→`0`, 숫자→`int`.                                           | 공통 제한은 연결 수준에서 설정하고, Context를 통해 쿼리별로 재정의하십시오. | 오타: 알림 없이 무시되거나 버전에 따라 오류가 발생합니다. 잘못된 타입: `"Cannot parse string 'abc' as Int64"`. `max_execution_time=0`이고 deadline이 없으면 쿼리가 무기한 실행됩니다. |
| `CustomSetting` | `CustomSetting{Value string}` | —     | —                                            | 예 (`WithSettings`를 통해)               | 네이티브 프로토콜에서 설정을 &quot;custom&quot;(중요하지 않은 설정)으로 표시합니다. 서버가 이를 인식하지 못해도 오류가 발생하지 않습니다. HTTP는 기본적으로 모든 설정을 custom으로 처리합니다. | 실험적이거나 버전별 설정에 사용하십시오.                         | 중요한 설정을 custom으로 표시하면 지원되지 않을 때 알림 없이 무시됩니다.                                                                                            |

**일반적인 설정:**

| 설정                   | 유형  | 설명                           |
| -------------------- | --- | ---------------------------- |
| `max_execution_time` | int | 초 단위 쿼리 시간 제한                |
| `max_memory_usage`   | int | 쿼리별 메모리 제한(바이트)              |
| `max_block_size`     | int | 처리용 블록 크기                    |
| `readonly`           | int | 1 = 읽기 전용, 2 = 읽기 전용 + 설정 변경 |

```go
Settings: clickhouse.Settings{
    "max_execution_time":  60,                                        // important -- errors if unknown
    "my_custom_setting":   clickhouse.CustomSetting{Value: "value"},  // custom -- ignored if unknown
}
```

***

## Context 수준의 쿼리 옵션 \{#context-options\}

`clickhouse.Context()`를 사용해 쿼리별로 설정합니다:

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
```

:::note[Context 데드라인 동작]
Context에 데드라인이 1초를 초과해 설정되어 있으면 `max_execution_time`은 자동으로 `seconds_remaining + 5`로 설정됩니다. 이 값은 수동으로 설정한 값을 모두 덮어씁니다.
:::

| 옵션                        | 유형                           | 기본값                  | 프로토콜       | 설명                                                                                                                                                                 | 권장 사항                                                                                     | 잘못 설정된 경우                                                                                                                                      |
| ------------------------- | ---------------------------- | -------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `WithQueryID`             | `string`                     | 자동 생성됨               | 둘 다        | 사용자 지정 쿼리 식별자입니다. `system.query_log` 및 `system.processes`에서 확인할 수 있습니다.                                                                                            | UUID를 사용하세요. `KILL QUERY WHERE query_id='...'`에 사용할 때 유용합니다.                              | 중복된 ID: `system.query_log`에서 혼동을 일으킬 수 있습니다.                                                                                                   |
| `WithQuotaKey`            | `string`                     | `""`                 | 둘 다        | 멀티 테넌트 환경의 리소스 제한을 위한 QUOTA 키입니다. 서버 측 QUOTA 구성이 필요합니다.                                                                                                            | 고객별/사용자별 제한을 설정할 때 사용하세요.                                                                 | Quota가 구성되지 않으면 조용히 무시됩니다.                                                                                                                     |
| `WithJWT`                 | `string`                     | `""`                 | HTTPS 전용   | ClickHouse Cloud에서 쿼리별 JWT 재정의. *(v2.35.0부터)*                                                                                                                      | 멀티 테넌트 프록시에서 요청별 인증에 사용합니다.                                                               | TLS 없이: 무시되며, 연결 인증이 대신 사용됩니다. 만료된 경우: `"Token has expired"`.                                                                                  |
| `WithSettings`            | `Settings`                   | connection 설정 상속     | 둘 다        | 쿼리별 서버 설정입니다. 연결 설정과 머지되며, 충돌 시 Context가 우선합니다.                                                                                                                    | 쿼리 유형에 따라 `max_execution_time` 또는 `max_rows_to_read`를 재정의하세요.                             | 연결 수준 `Settings`와 같습니다.                                                                                                                        |
| `WithParameters`          | `매개변수` (`map[string]string`) | `nil`                | 둘 다        | 서버 측 매개변수화 쿼리에 사용하는 값입니다. 쿼리 구문: `{param_name:Type}`.                                                                                                              | SQL 인젝션 방지를 위해 문자열 연결 대신 사용합니다.                                                           | 누락된 매개변수: `"Substitution {param_name:Type} isn't set"`. 유형이 잘못된 경우: `"Cannot parse string 'abc' as UInt64"`.                                   |
| `WithAsync`               | `bool` (wait)                | 동기식                  | 둘 다 지원     | 비동기 삽입 모드입니다. `async_insert=1`을 설정합니다. `wait=true`로 설정하면 `wait_for_async_insert=1`이 추가됩니다. ClickHouse 21.11+가 필요합니다. *(v2.41.0부터 지원되며, 기존 `WithStdAsync`를 대체합니다.)* | 처리량이 많은 삽입 작업에 사용하세요.                                                                     | `wait=false`: 오류가 비동기적으로 보고될 수 있으므로 `system.asynchronous_insert_log`를 확인하십시오. SELECT와 함께 사용 시: 무시됩니다. 이전 서버: `"Unknown setting async_insert"`. |
| `WithLogs`                | `func(*Log)`                 | `nil`                | 네이티브 전용    | 쿼리 실행 중 서버 로그 항목에 대한 콜백입니다.                                                                                                                                        | 빠르게 처리되도록 유지하세요 -- 실행이 차단됩니다. 무거운 처리는 goroutine을 사용하세요.                                   | HTTP에서는: 아무 알림 없이 호출되지 않습니다.                                                                                                                   |
| `WithProgress`            | `func(*Progress)`            | `nil`                | 네이티브 전용    | 쿼리 진행률 업데이트(처리된 행/바이트).                                                                                                                                            | 빠르게 유지하세요 -- 실행을 차단합니다.                                                                   | HTTP에서는: 아무 알림 없이 호출되지 않습니다.                                                                                                                   |
| `WithProfileInfo`         | `func(*ProfileInfo)`         | `nil`                | 네이티브 전용    | 쿼리 실행 통계 콜백입니다.                                                                                                                                                    | 빠르게 유지하십시오 -- 실행이 차단됩니다.                                                                  | HTTP에서는 조용히 호출되지 않습니다.                                                                                                                         |
| `WithProfileEvents`       | `func([]ProfileEvent)`       | `nil`                | 네이티브 전용    | 성능 카운터 콜백입니다.                                                                                                                                                      | 빠르게 유지하십시오 -- 실행이 차단됩니다.                                                                  | HTTP에서는 조용히 호출되지 않습니다.                                                                                                                         |
| `WithoutProfileEvents`    | —                            | 이벤트 전송               | 네이티브 전용    | profile events를 비활성화합니다. 25.11 이상 서버에서 성능을 최적화합니다. *(v2.44.0부터)*                                                                                                   | profile events가 필요 없는 경우에 사용합니다.                                                          | 구형 서버에서는 알 수 없는 설정 오류가 발생합니다.                                                                                                                  |
| `WithExternalTable`       | `...*ext.Table`              | `nil`                | 둘 다        | 쿼리에 임시 조회 테이블을 연결합니다. 데이터는 쿼리별로 전송됩니다.                                                                                                                             | 테이블 크기는 10 MB 미만으로 유지하세요. 네이티브가 HTTP(멀티파트)보다 더 효율적입니다.                                    | 큰 테이블: 쿼리마다 네트워크 오버헤드가 발생합니다.                                                                                                                  |
| `WithUserLocation`        | `*time.Location`             | 서버 시간대               | 둘 다        | DateTime 파싱에 사용할 시간대를 재정의합니다.                                                                                                                                      | 클라이언트/서버 시간대가 서로 다르면 명시적으로 설정하십시오.                                                        | 잘못된 시간대: DateTime 값이 몇 시간씩 어긋나도 드러나지 않을 수 있으며, 데이터 손상으로 이어질 수 있습니다.                                                                            |
| `WithColumnNamesAndTypes` | `[]ColumnNameAndType`        | `nil` (DESCRIBE를 실행) | HTTP에서만 지원 | 컬럼 정보를 미리 제공하여 HTTP 삽입 시 `DESCRIBE TABLE` 왕복 호출을 생략합니다. *(v2.37.0부터)*                                                                                              | 스키마를 알고 있으며 안정적인 경우에 사용합니다.                                                               | 잘못된 타입: `"Cannot convert String to UInt64"`. 마이그레이션 후 스키마 변경: 오래된 정보.                                                                          |
| `WithBlockBufferSize`     | `uint8`                      | connection 수준(2)     | 둘 다 지원     | 단일 쿼리에서 연결 수준 `BlockBufferSize`를 재정의합니다.                                                                                                                           | 특정 쿼리에서 큰 결과 집합에 대해서는 값을 늘리십시오.                                                           | —                                                                                                                                              |
| `WithClientInfo`          | `ClientInfo`                 | connection 수준        | 둘 다        | 단일 쿼리에 추가 클라이언트 정보를 덧붙입니다. 대체하지 않고 덧붙입니다. *(v2.42.0부터)*                                                                                                            | 요청별 Context(예: endpoint 이름)를 추가합니다.                                                       | —                                                                                                                                              |
| `WithSpan`                | `trace.SpanContext`          | 없음                   | 네이티브 전용    | 분산 tracing을 위한 OpenTelemetry span 컨텍스트입니다.                                                                                                                         | [OpenTelemetry](/integrations/language-clients/go/clickhouse-api#open-telemetry)를 참고하십시오. | —                                                                                                                                              |

```go
ctx := clickhouse.Context(ctx,
    clickhouse.WithQueryID("query-123"),
    clickhouse.WithParameters(clickhouse.Parameters{
        "user_id": "12345",
    }),
    clickhouse.WithProgress(func(p *clickhouse.Progress) {
        log.Printf("Progress: %d rows, %d bytes", p.Rows, p.Bytes)
    }),
)
rows, err := conn.Query(ctx, "SELECT * FROM users WHERE id = {user_id:String}")
```

***

## 배치 옵션 \{#batch-options\}

`PrepareBatch()`에 전달됩니다. 임포트: `github.com/ClickHouse/clickhouse-go/v2/lib/driver`.

| 옵션                      | 기본값                | 설명                                                                          | 권장 사항                                          | 잘못 구성된 경우                                                              |
| ----------------------- | ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| `WithReleaseConnection` | 연결이 `Send()`까지 유지됨 | `PrepareBatch()` 직후 connection을 풀에 즉시 반환합니다. `Send()`/`Flush()` 시 다시 획득합니다. | 풀 고갈을 방지하려면 오래 유지되는 배치(수분~수시간)에 사용하십시오.        | 오래 유지되는 배치에 사용하지 않으면 활성 작업이 많을 때 `"acquire conn timeout"`이 발생할 수 있습니다. |
| `WithCloseOnFlush`      | 배치가 열린 상태로 유지됨     | `Flush()`가 호출되면 배치를 자동으로 닫습니다.                                              | 단발성 배치에 사용하십시오. `Close()`를 명시적으로 호출하지 않아도 됩니다. | 여러 번 `Flush()`를 호출하는 경우 함께 사용하면 첫 번째 플러시에서 배치가 닫혀 이후 작업이 실패합니다.        |

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO table",
    driver.WithReleaseConnection(),
    driver.WithCloseOnFlush(),
)
```

***

## 빠른 참고용 표 \{#quick-reference-tables\}

### 연결 풀 크기 설정 권장 사항 \{#pool-sizing\}

| 애플리케이션 유형       | MaxIdleConns | MaxOpenConns | ConnMaxLifetime |
| --------------- | ------------ | ------------ | --------------- |
| 트래픽이 적은 웹 앱     | 5            | 10           | 1h              |
| 트래픽이 중간 수준인 API | 20           | 50           | 30m             |
| 트래픽이 많은 서비스     | 50           | 100          | 15m             |
| 백그라운드 배치 작업     | 10           | 20           | 2h              |
| Kubernetes 배포   | 10           | 20           | 10m             |
| 서버리스(Lambda)    | 1            | 5            | 5m              |

### 타임아웃 권장값 \{#timeout-recommendations\}

| 환경            | DialTimeout | ReadTimeout |
| ------------- | ----------- | ----------- |
| 로컬 / LAN      | 5s          | 30s         |
| Cloud, 동일 리전  | 10s         | 2m          |
| Cloud, 리전 간   | 30s         | 5m          |
| OLAP workload | 10s         | 30m         |
| 실시간 / OLTP    | 5s          | 10s         |

### DSN 매개변수 빠른 참고 \{#dsn-parameters\}

| DSN 매개변수                   | Options 필드               | 예시                                      |
| -------------------------- | ------------------------ | --------------------------------------- |
| `username`                 | `Auth.Username`          | `?username=admin`                       |
| `password`                 | `Auth.Password`          | `?password=secret`                      |
| `database`                 | `Auth.Database`          | `?database=mydb` 또는 경로에 `/mydb`         |
| `dial_timeout`             | `DialTimeout`            | `?dial_timeout=10s`                     |
| `read_timeout`             | `ReadTimeout`            | `?read_timeout=5m`                      |
| `max_open_conns`           | `MaxOpenConns`           | `?max_open_conns=50`                    |
| `max_idle_conns`           | `MaxIdleConns`           | `?max_idle_conns=20`                    |
| `conn_max_lifetime`        | `ConnMaxLifetime`        | `?conn_max_lifetime=30m`                |
| `connection_open_strategy` | `ConnOpenStrategy`       | `?connection_open_strategy=round_robin` |
| `block_buffer_size`        | `BlockBufferSize`        | `?block_buffer_size=10`                 |
| `compress`                 | `Compression.Method`     | `?compress=lz4`                         |
| `compress_level`           | `Compression.Level`      | `?compress_level=6`                     |
| `max_compression_buffer`   | `MaxCompressionBuffer`   | `?max_compression_buffer=20971520`      |
| `secure`                   | `TLS`                    | `?secure=true`                          |
| `skip_verify`              | `TLS.InsecureSkipVerify` | `?skip_verify=true`                     |
| `debug`                    | `Debug`                  | `?debug=true`                           |
| `client_info_product`      | `ClientInfo.Products`    | `?client_info_product=myapp/1.0`        |
| `http_proxy`               | `HTTPProxyURL`           | `?http_proxy=http%3A%2F%2Fproxy%3A8080` |
| `http_path`                | `HttpUrlPath`            | `?http_path=/clickhouse`                |
| *(그 외 항목)*                 | `Settings[key]`          | `?max_execution_time=60`                |

***

## 문제 해결 \{#troubleshooting\}

### 연결 풀 고갈: &quot;acquire conn timeout&quot; \{#acquire-conn-timeout\}

**원인:** 연결 풀이 고갈되었습니다. `MaxOpenConns`에 설정된 연결이 모두 사용 중이었고, `DialTimeout` 내에 사용 가능한 연결이 나오지 않았습니다.

**해결 방법**

다음 단계를 순서대로 시도하고, 설정값을 조정하기 전에 근본 원인부터 진단하십시오.

1. 연결을 점유한 채 오래 실행되는 쿼리가 있는지 확인하십시오: `SELECT query_id, elapsed FROM system.processes ORDER BY elapsed DESC`. 있다면 먼저 느린 쿼리부터 해결하십시오.
2. 오래 유지되는 배치(`PrepareBatch()`와 `Send()` 사이가 수분~수시간인 경우)를 실행한다면, 배치가 열려 있는 동안 연결을 풀로 반환하도록 `WithReleaseConnection()`을 사용하십시오.
3. 관찰된 동시성에 맞게 `MaxOpenConns`를 늘리십시오.
4. 일시적인 급증이 예상되고 연결 획득 대기가 실제 병목일 때만 `DialTimeout`을 늘리십시오.

### 읽기 타임아웃 및 연결 재설정(connection reset) 오류 \{#io-timeout\}

**원인:** 서버 응답을 기다리는 동안 `ReadTimeout`이 초과되었거나, 서버 또는 네트워크에 의해 연결이 종료되었습니다.

**해결 방법:**

* 장시간 실행되는 쿼리의 경우 `ReadTimeout`을 늘리십시오
* 쿼리별 타임아웃을 제어하려면 Context 데드라인을 사용하십시오
* ClickHouse 서버 측 `max_execution_time` 제한을 확인하십시오

### &quot;Code: 516. 인증 실패&quot; \{#auth-failed\}

**원인:** 사용자 이름 또는 비밀번호가 잘못되었거나 해당 사용자가 존재하지 않습니다.

**해결 방법:**

* `system.users` 테이블(table)에서 자격 증명을 확인합니다
* DSN 비밀번호의 특수 문자에 URL 인코딩 문제가 없는지 확인합니다
* 해당 사용자가 지정된 데이터베이스에 접근할 수 있는지 확인합니다

### TLS 인증서 오류 \{#tls-errors\}

| 오류                                              | 원인          | 해결 방법                                    |
| ----------------------------------------------- | ----------- | ---------------------------------------- |
| `x509: certificate has expired`                 | 서버 인증서가 만료됨 | 서버 인증서를 갱신하세요                            |
| `x509: certificate is valid for X, not Y`       | 호스트명 불일치    | 올바른 호스트명을 사용하거나 SAN에 추가하세요               |
| `x509: certificate signed by unknown authority` | 신뢰할 수 없는 CA | CA를 `tls.Config.RootCAs`에 추가하세요          |
| `connection reset by peer`                      | TLS/포트 불일치  | TLS에는 포트 9440(네이티브) 또는 8443(HTTP)을 사용하세요 |

### 점진적인 메모리 증가 \{#memory-growth\}

**원인:** 큰 유휴 연결 버퍼가 누적됩니다.

**해결 방법:**

* 메모리 제약이 있는 환경에서는 `FreeBufOnConnRelease: true`로 설정합니다
* 유휴 연결 수를 제한하려면 `MaxIdleConns`를 줄이십시오
* 압축을 사용하는 경우 `MaxCompressionBuffer`를 줄이십시오
* 연결이 더 자주 재생성되도록 `ConnMaxLifetime`를 낮추십시오