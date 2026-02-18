---
sidebar_label: '드라이버 API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect 드라이버 API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect 드라이버 API'
doc_type: 'reference'
---

# ClickHouse Connect 드라이버 API \{#clickhouse-connect-driver-api\}

:::note
대부분의 API 메서드에서는 전달할 수 있는 인자의 종류가 많고 그중 대부분이 선택적이므로, 키워드 인자(keyword argument)를 사용하는 것을 권장합니다.

*여기에 문서화되지 않은 메서드는 API의 일부로 간주되지 않으며, 제거되거나 변경될 수 있습니다.*
:::

## 클라이언트 초기화 \{#client-initialization\}

`clickhouse_connect.driver.client` 클래스는 Python 애플리케이션과 ClickHouse 데이터베이스 서버 간의 주요 인터페이스를 제공합니다. `clickhouse_connect.get_client` 함수를 사용하여 Client 인스턴스를 생성하며, 이 인스턴스는 다음 인수를 받습니다:

### Connection arguments \{#connection-arguments\}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | `http` 또는 `https`여야 합니다.                                                                                                                                                                                                                        |
| host                     | str         | localhost                     | ClickHouse 서버의 호스트 이름 또는 IP 주소입니다. 설정하지 않으면 `localhost`가 사용됩니다.                                                                                                                                                           |
| port                     | int         | 8123 or 8443                  | ClickHouse HTTP 또는 HTTPS 포트입니다. 설정하지 않으면 기본적으로 8123이 사용되며, *secure*=*True* 또는 *interface*=*https*인 경우 8443이 사용됩니다.                                                                                                  |
| username                 | str         | default                       | ClickHouse 사용자 이름입니다. 설정하지 않으면 `default` ClickHouse 사용자가 사용됩니다.                                                                                                                                                               |
| password                 | str         | *&lt;empty string&gt;*        | *username*에 대한 비밀번호입니다.                                                                                                                                                                                                                      |
| database                 | str         | *None*                        | 이 연결에 사용할 기본 데이터베이스입니다. 설정하지 않으면 ClickHouse Connect에서 *username*의 기본 데이터베이스를 사용합니다.                                                                                                                         |
| secure                   | bool        | False                         | HTTPS/TLS를 사용합니다. interface 또는 port 인수에서 유추된 값을 이 설정이 재정의합니다.                                                                                                                                                              |
| dsn                      | str         | *None*                        | 표준 DSN(Data Source Name) 형식의 문자열입니다. 별도로 설정되지 않은 경우 이 문자열에서 다른 연결 값(예: host 또는 user)을 추출합니다.                                                                                                               |
| compress                 | bool or str | True                          | ClickHouse HTTP insert 및 쿼리 결과에 대한 압축을 활성화합니다. [Additional Options (Compression)](additional-options.md#compression)을 참조하십시오.                                                                                                 |
| query_limit              | int         | 0 (unlimited)                 | `query` 응답에서 반환할 최대 행 수입니다. 0으로 설정하면 행 수를 제한하지 않습니다. 결과를 스트리밍하지 않으면 모든 결과가 한 번에 메모리에 로드되므로, 큰 query_limit 값은 메모리 부족 예외를 발생시킬 수 있습니다.                                |
| query_retries            | int         | 2                             | `query` 요청에 대한 최대 재시도 횟수입니다. "재시도 가능한" HTTP 응답에 대해서만 재시도합니다. 의도치 않은 중복 요청을 방지하기 위해 드라이버는 `command` 또는 `insert` 요청을 자동으로 재시도하지 않습니다.                                        |
| connect_timeout          | int         | 10                            | HTTP 연결 타임아웃(초)입니다.                                                                                                                                                                                                                          |
| send_receive_timeout     | int         | 300                           | HTTP 연결의 송신/수신 타임아웃(초)입니다.                                                                                                                                                                                                             |
| client_name              | str         | *None*                        | HTTP User Agent 헤더 앞에 추가할 client_name입니다. ClickHouse `system.query_log`에서 클라이언트 쿼리를 추적하는 데 사용할 수 있습니다.                                                                                                              |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | 사용할 `urllib3` 라이브러리 PoolManager입니다. 서로 다른 호스트에 대한 여러 연결 풀이 필요한 고급 사용 사례에 적합합니다.                                                                                                                           |
| http_proxy               | str         | *None*                        | HTTP 프록시 주소입니다(HTTP_PROXY 환경 변수 설정과 동일).                                                                                                                                                                                             |
| https_proxy              | str         | *None*                        | HTTPS 프록시 주소입니다(HTTPS_PROXY 환경 변수 설정과 동일).                                                                                                                                                                                           |
| apply_server_timezone    | bool        | True                          | 타임존 인식 쿼리 결과에 대해 서버 타임존을 사용합니다. [Timezone Precedence](advanced-querying.md#time-zones)를 참조하십시오.                                                                                                                         |
| show_clickhouse_errors   | bool        | True                          | 클라이언트 예외에 ClickHouse 서버의 상세 오류 메시지와 예외 코드를 포함합니다.                                                                                                                                                                       |
| autogenerate_session_id  | bool        | *None*                        | 전역 `autogenerate_session_id` 설정을 재정의합니다. True인 경우 세션 ID가 제공되지 않았을 때 UUID4 세션 ID를 자동으로 생성합니다.                                                                                                                    |
| proxy_path               | str         | &lt;empty string&gt;          | 프록시 구성을 위해 ClickHouse 서버 URL에 추가할 선택적 경로 접두사입니다.                                                                                                                                                                            |
| form_encode_query_params | bool        | False                         | URL 파라미터 대신 요청 본문에서 쿼리 파라미터를 폼 인코딩된 데이터로 전송합니다. URL 길이 제한을 초과할 수 있는 대규모 파라미터 집합을 가진 쿼리에 유용합니다.                                                                                         |
| rename_response_column   | str         | *None*                        | 쿼리 결과에서 응답 컬럼 이름을 변경하기 위한 선택적 콜백 함수 또는 컬럼 이름 매핑입니다.                                                                                                                                                            |

### HTTPS/TLS 인수 \{#httpstls-arguments\}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLS를 사용하는 경우 ClickHouse 서버 TLS/SSL 인증서(호스트명, 만료일 등)를 검증합니다.                                                                                                                                                                                                  |
| ca_cert          | str  | *None*  | *verify*=*True*인 경우, ClickHouse 서버 인증서를 검증하기 위한 인증 기관(Certificate Authority) 루트 인증서 파일 경로(.pem 형식)입니다. verify가 False이면 무시됩니다. 운영 체제가 검증하는 전역적으로 신뢰할 수 있는 루트 인증서인 경우에는 필요하지 않습니다.                          |
| client_cert      | str  | *None*  | TLS 클라이언트 인증서(상호 TLS 인증용)의 파일 경로(.pem 형식)입니다. 파일에는 중간 인증서를 포함한 전체 인증서 체인이 포함되어야 합니다.                                                                                                                                                     |
| client_cert_key  | str  | *None*  | 클라이언트 인증서의 개인 키 파일 경로입니다. 개인 키가 클라이언트 인증서 파일에 포함되어 있지 않은 경우 필수입니다.                                                                                                                                                                             |
| server_host_name | str  | *None*  | TLS 인증서의 CN 또는 SNI로 식별되는 ClickHouse 서버 호스트명입니다. 다른 호스트명을 사용하는 프록시나 터널을 통해 연결할 때 SSL 오류를 방지하려면 이 값을 설정하십시오.                                                                                                                       |
| tls_mode         | str  | *None*  | 고급 TLS 동작을 제어합니다. `proxy` 및 `strict`는 ClickHouse와의 상호 TLS 연결을 수립하지 않지만 클라이언트 인증서와 키는 전송합니다. `mutual`은 클라이언트 인증서를 사용하는 ClickHouse 상호 TLS 인증을 가정합니다. *None*/기본 동작은 `mutual`입니다.                                     |

### Settings argument \{#settings-argument\}

마지막으로 `get_client`의 `settings` 인자는 각 클라이언트 요청마다 서버로 추가 ClickHouse 설정을 전달하는 데 사용됩니다. 대부분의 경우, 읽기 전용(*readonly*=*1*) 권한만 가진 사용자는 쿼리와 함께 전송된 설정을 변경할 수 없으므로, ClickHouse Connect는 최종 요청에서 이러한 설정을 제거하고 경고를 기록합니다. 아래 설정들은 ClickHouse Connect에서 사용하는 HTTP 쿼리/세션에만 적용되며, 일반적인 ClickHouse 설정으로는 문서화되어 있지 않습니다.

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse 서버가 HTTP 채널에 쓰기 전에 사용하는 버퍼 크기(바이트 단위)입니다.                                                                                      |
| session_id        | 서버에서 관련된 쿼리를 연관시키기 위한 고유한 세션 ID입니다. 임시 테이블에 필요합니다.                                                                                |
| compress          | ClickHouse 서버가 POST 응답 데이터를 압축할지 여부입니다. 이 설정은 "raw" 쿼리에만 사용해야 합니다.                                                                   |
| decompress        | ClickHouse 서버로 전송되는 데이터를 압축 해제해야 하는지 여부입니다. 이 설정은 "raw" insert에만 사용해야 합니다.                                                       |
| quota_key         | 이 요청과 연관된 quota key입니다. QUOTA에 대한 ClickHouse 서버 문서를 참조하십시오.                                                                                |
| session_check     | 세션 상태를 확인하는 데 사용됩니다.                                                                                                                                |
| session_timeout   | session ID로 식별되는 세션이 타임아웃되어 더 이상 유효하지 않게 되기 전까지의 비활성 상태 유지 시간(초)입니다. 기본값은 60초입니다.                                       |
| wait_end_of_query | 전체 응답을 ClickHouse 서버에서 버퍼링합니다. 이 설정은 요약 정보를 반환하는 데 필요하며, 스트리밍이 아닌 쿼리에서 자동으로 설정됩니다.                                    |
| role              | 세션에 사용할 ClickHouse role입니다. 쿼리 컨텍스트에 포함할 수 있는 유효한 전송 설정입니다.                                                                          |

각 쿼리와 함께 전송할 수 있는 다른 ClickHouse 설정에 대해서는 [ClickHouse 문서](/operations/settings/settings.md)를 참조하십시오.

### 클라이언트 생성 예시 \{#client-creation-examples\}

* 파라미터를 지정하지 않으면 ClickHouse Connect 클라이언트는 `localhost`의 기본 HTTP 포트에 기본 사용자와 비밀번호 없이 연결합니다:

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# Output: '22.10.1.98'
```

* HTTPS로 보호되는 외부 ClickHouse 서버에 연결하기

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# Output: 'Etc/UTC'
```

* 세션 ID, 기타 사용자 정의 연결 매개변수, ClickHouse 설정을 지정하여 연결합니다.

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host='play.clickhouse.com',
    user='play',
    password='clickhouse',
    port=443,
    session_id='example_session_1',
    connect_timeout=15,
    database='github',
    settings={'distributed_ddl_task_timeout':300},
)
print(client.database)
# Output: 'github'
```


## 클라이언트 라이프사이클 및 모범 사례 \{#client-lifecycle-and-best-practices\}

ClickHouse Connect 클라이언트를 생성하는 작업은 연결을 설정하고, 서버 메타데이터를 조회하며, 설정을 초기화하는 과정을 수반하는 비용이 큰 작업입니다. 최적의 성능을 위해 다음 모범 사례를 따르십시오.

### 핵심 원칙 \{#core-principles\}

- **클라이언트 재사용**: 애플리케이션 시작 시 한 번 클라이언트를 생성하고, 애플리케이션 수명 동안 재사용합니다.
- **빈번한 생성 피하기**: 각 쿼리나 요청마다 새 클라이언트를 생성하지 않습니다 (이렇게 하면 작업당 수백 밀리초가 낭비됩니다).
- **적절히 정리하기**: 종료 시 항상 클라이언트를 닫아 연결 풀 리소스를 해제합니다.
- **가능하면 공유하기**: 하나의 클라이언트가 연결 풀을 통해 많은 동시 쿼리를 처리할 수 있습니다 (아래 스레딩 관련 설명을 참고하십시오).

### 기본 패턴 \{#basic-patterns\}

**✅ 권장: 단일 클라이언트 재사용**

```python
import clickhouse_connect

# Create once at startup
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')

# Reuse for all queries
for i in range(1000):
    result = client.query('SELECT count() FROM users')

# Close on shutdown
client.close()
```

**❌ 잘못된 예: 클라이언트를 매번 새로 생성하기**

```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```


### 멀티스레드 애플리케이션 \{#multi-threaded-applications\}

:::warning
클라이언트 인스턴스는 세션 ID를 사용할 때 **스레드 세이프(thread-safe)가 아닙니다**. 기본적으로 클라이언트에는 자동으로 생성된 세션 ID가 있으며, 동일한 세션에서 쿼리를 동시에 실행하면 `ProgrammingError`가 발생합니다.
:::

스레드 간에 클라이언트를 안전하게 공유하려면:

```python
import clickhouse_connect
import threading

# Option 1: Disable sessions (recommended for shared clients)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Required for thread safety
)

def worker(thread_id):
    # All threads can now safely use the same client
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
# Output:
# Thread 0: 0
# Thread 7: 7
# Thread 1: 1
# Thread 9: 9
# Thread 4: 4
# Thread 2: 2
# Thread 8: 8
# Thread 5: 5
# Thread 6: 6
# Thread 3: 3
```

**세션에 대한 대안:** 세션이 필요한 경우(예: 임시 테이블용), 스레드마다 별도의 클라이언트를 생성하십시오.

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```


### 적절한 정리 작업 \{#proper-cleanup\}

종료 시에는 항상 클라이언트를 닫아야 합니다. `client.close()`는 클라이언트가 풀 매니저를 소유한 경우에만(예: 사용자 지정 TLS/프록시 옵션으로 생성된 경우) 클라이언트를 해제하고 풀에 있는 HTTP 연결을 닫습니다. 기본 공유 풀을 사용할 때는 `client.close_connections()`를 사용하여 소켓을 선제적으로 정리하십시오. 그렇지 않은 경우 연결은 유휴 만료 및 프로세스 종료 시점에 자동으로 정리됩니다.

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

또는 컨텍스트 매니저를 사용합니다:

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```


### 여러 클라이언트를 사용해야 할 때 \{#when-to-use-multiple-clients\}

다음과 같은 경우 여러 클라이언트를 사용하는 것이 적절합니다.

- **서버가 다른 경우**: ClickHouse 서버 또는 클러스터마다 하나의 클라이언트
- **자격 증명이 다른 경우**: 서로 다른 사용자 또는 액세스 수준마다 별도의 클라이언트
- **데이터베이스가 다른 경우**: 여러 데이터베이스를 동시에 다루어야 할 때
- **세션을 분리해야 하는 경우**: 임시 테이블이나 세션별 설정을 위해 별도 세션이 필요할 때
- **스레드별 격리가 필요한 경우**: 각 스레드에 독립적인 세션이 필요할 때 (위에서 설명한 것처럼)

## 공통 메서드 인수 \{#common-method-arguments\}

여러 클라이언트 메서드는 공통 `parameters` 및 `settings` 인수 중 하나 또는 둘 다를 사용합니다. 이러한 키워드 인수에 대해서는 아래에서 설명합니다.

### Parameters 인자 \{#parameters-argument\}

ClickHouse Connect Client의 `query*` 및 `command` 메서드는 Python 표현식을 ClickHouse 값 표현식에 바인딩하는 데 사용되는 선택적 `parameters` 키워드 인자를 받습니다. 두 가지 유형의 바인딩을 사용할 수 있습니다.

#### 서버 측 바인딩 \{#server-side-binding\}

ClickHouse는 대부분의 쿼리 값에 대해 [서버 측 바인딩](/interfaces/cli.md#cli-queries-with-parameters)을 지원하며, 바인딩된 값은 HTTP 쿼리 매개변수로 쿼리와 분리되어 전송됩니다. ClickHouse Connect는 `{<name>:<datatype>}` 형식의 바인딩 표현식을 감지하면 적절한 쿼리 매개변수를 추가합니다. 서버 측 바인딩에서는 `parameters` 인수가 Python 딕셔너리여야 합니다.

* Python 딕셔너리, DateTime 값, 문자열 값을 사용하는 서버 측 바인딩

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

서버에서는 다음과 같은 쿼리가 생성됩니다:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
서버 측 바인딩은 ClickHouse 서버에서 `SELECT` 쿼리에만 지원합니다. `ALTER`, `DELETE`, `INSERT` 또는 기타 유형의 쿼리에서는 동작하지 않습니다. 이는 향후 변경될 수 있습니다. 자세한 내용은 https://github.com/ClickHouse/ClickHouse/issues/42092를 참조하십시오.
:::


#### 클라이언트 측 바인딩 \{#client-side-binding\}

ClickHouse Connect는 템플릿 SQL 쿼리를 생성할 때 더 높은 유연성을 제공하는 클라이언트 측 파라미터 바인딩도 지원합니다. 클라이언트 측 바인딩을 사용할 때 `parameters` 인수는 딕셔너리 또는 시퀀스여야 합니다. 클라이언트 측 바인딩은 파라미터 치환을 위해 Python [「printf 스타일」](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 문자열 포매팅을 사용합니다.

서버 측 바인딩과 달리 클라이언트 측 바인딩은 데이터베이스, 테이블, 컬럼 이름과 같은 데이터베이스 식별자에는 작동하지 않습니다. Python 스타일 포매팅은 서로 다른 유형의 문자열을 구분할 수 없으며, 이들은 서로 다른 방식으로 포매팅해야 하기 때문입니다(데이터베이스 식별자에는 백틱 또는 이중 인용부호를, 데이터 값에는 단일 인용부호를 사용).

* Python Dictionary, DateTime 값 및 문자열 이스케이프를 사용하는 예

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

이는 서버에서 다음과 같은 쿼리를 생성합니다:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

* Python Sequence(Tuple), Float64 및 IPv4Address를 사용한 예제

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

이 경우 서버에서 다음과 같은 쿼리가 생성됩니다:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64 인수(초 단위 미만 정밀도를 가지는 ClickHouse 타입)를 바인딩하려면 두 가지 사용자 정의 방식 중 하나를 사용해야 합니다.

* Python `datetime.datetime` 값을 새로운 DT64Param 클래스로 래핑합니다. 예를 들어:
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # 딕셔너리를 사용한 서버 측 바인딩
    parameters={'p1': DT64Param(dt_value)}

    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # 리스트를 사용한 클라이언트 측 바인딩
    parameters=['a string', DT64Param(datetime.now())]
  ```
  * 매개변수 값 딕셔너리를 사용하는 경우, 매개변수 이름에 문자열 `_64`를 붙입니다.
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # 딕셔너리를 사용한 서버 측 바인딩

    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```

:::


### Settings 인자 \{#settings-argument-1\}

주요 ClickHouse Connect Client `insert` 및 `select` 메서드는 모두 선택적 `settings` 키워드 인자를 받아, 포함된 SQL 문에 대해 ClickHouse 서버 [user settings](/operations/settings/settings.md)을(를) 전달합니다. `settings` 인자는 딕셔너리여야 합니다. 각 항목은 ClickHouse 설정 이름과 그에 대응하는 값이어야 합니다. 값은 서버로 쿼리 파라미터를 전송할 때 문자열로 변환된다는 점에 유의하십시오.

클라이언트 수준 설정과 마찬가지로, ClickHouse Connect는 서버에서 *readonly*=*1*로 표시한 설정은 모두 제외하며, 이에 대한 로그 메시지를 남깁니다. ClickHouse HTTP 인터페이스를 통한 쿼리에만 적용되는 설정은 항상 유효합니다. 해당 설정은 `get_client` [API](#settings-argument)에서 설명합니다.

ClickHouse 설정 사용 예시는 다음과 같습니다:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```


## Client `command` Method \{#client-command-method\}

`Client.command` 메서드는 일반적으로 데이터를 반환하지 않거나 전체 데이터셋이 아닌 단일 기본 타입 값 또는 배열 값을 반환하는 SQL 쿼리를 ClickHouse 서버로 전송할 때 사용합니다. 이 메서드는 다음 매개변수를 받습니다:

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | 단일 값 또는 여러 값으로 이루어진 단일 행을 반환하는 ClickHouse SQL 문입니다.                                                                                  |
| parameters    | dict or iterable | *None*     | [parameters 설명](#parameters-argument)을 참고하십시오.                                                                                                        |
| data          | str or bytes     | *None*     | POST body로 명령에 함께 포함할 수 있는 선택적 데이터입니다.                                                                                                   |
| settings      | dict             | *None*     | [settings 설명](#settings-argument)을 참고하십시오.                                                                                                            |
| use_database  | bool             | True       | 클라이언트 생성 시 지정한 데이터베이스를 사용합니다. False인 경우, 명령은 연결된 사용자에 대해 ClickHouse 서버의 기본 데이터베이스를 사용합니다.               |
| external_data | ExternalData     | *None*     | 쿼리에서 사용할 파일 또는 바이너리 데이터를 포함하는 `ExternalData` 객체입니다. [고급 쿼리(External Data)](advanced-querying.md#external-data)를 참고하십시오. |

### 명령 예시 \{#command-examples\}

#### DDL SQL 문 \{#ddl-statements\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Create a table
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Returns QuerySummary with query_id

# Show table definition
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# Output:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()

# Drop table
client.command("DROP TABLE test_command")
```


#### 단일 값만 반환하는 간단한 쿼리 \{#simple-queries-returning-single-values\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Single value result
count = client.command("SELECT count() FROM system.tables")
print(count)
# Output: 151

# Server version
version = client.command("SELECT version()")
print(version)
# Output: "25.8.2.29"
```


#### 파라미터가 있는 명령 \{#commands-with-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using client-side parameters
table_name = "system"
result = client.command(
    "SELECT count() FROM system.tables WHERE database = %(db)s",
    parameters={"db": table_name}
)

# Using server-side parameters
result = client.command(
    "SELECT count() FROM system.tables WHERE database = {db:String}",
    parameters={"db": "system"}
)
```


#### 설정을 사용하는 명령 \{#commands-with-settings\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```


## Client `query` Method \{#client-query-method\}

`Client.query` 메서드는 ClickHouse 서버에서 단일 「배치(batch)」 데이터셋을 가져오는 주요 방법입니다. 이 메서드는 HTTP 위에서 Native ClickHouse 포맷을 사용하여 대규모 데이터셋(최대 약 100만 행)을 효율적으로 전송합니다. 이 메서드는 다음과 같은 매개변수를 받습니다:

| Parameter           | Type             | Default    | Description                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required* | ClickHouse SQL SELECT 또는 DESCRIBE 쿼리입니다.                                                                                                                                     |
| parameters          | dict or iterable | *None*     | [parameters 설명](#parameters-argument)을 참고하십시오.                                                                                                                             |
| settings            | dict             | *None*     | [settings 설명](#settings-argument)을 참고하십시오.                                                                                                                                 |
| query_formats       | dict             | *None*     | 결과 값에 대한 데이터 타입 서식을 지정합니다. Advanced Usage (Read Formats)를 참고하십시오.                                                                                          |
| column_formats      | dict             | *None*     | 컬럼별 데이터 타입 서식을 지정합니다. Advanced Usage (Read Formats)를 참고하십시오.                                                                                                  |
| encoding            | str              | *None*     | ClickHouse String 컬럼을 Python 문자열로 인코딩할 때 사용하는 인코딩입니다. 설정하지 않으면 Python 기본값인 `UTF-8`이 사용됩니다.                                                   |
| use_none            | bool             | True       | ClickHouse null 값에 대해 Python *None* 타입을 사용합니다. False인 경우 ClickHouse null 값에 대해 데이터 타입 기본값(예: 0)을 사용합니다. 참고로 성능상의 이유로 NumPy/Pandas에서는 기본값이 False입니다. |
| column_oriented     | bool             | False      | 결과를 행 시퀀스가 아닌 컬럼 시퀀스로 반환합니다. Python 데이터를 다른 컬럼 지향 데이터 포맷으로 변환하는 데 유용합니다.                                                            |
| query_tz            | str              | *None*     | `zoneinfo` 데이터베이스의 타임존 이름입니다. 이 타임존이 쿼리가 반환하는 모든 datetime 또는 Pandas Timestamp 객체에 적용됩니다.                                                     |
| column_tzs          | dict             | *None*     | 컬럼 이름을 타임존 이름에 매핑하는 딕셔너리입니다. `query_tz`와 유사하지만, 컬럼마다 서로 다른 타임존을 지정할 수 있습니다.                                                          |
| use_extended_dtypes | bool             | True       | Pandas 확장 dtypes(예: StringArray)와 ClickHouse NULL 값에 대해 pandas.NA 및 pandas.NaT를 사용합니다. `query_df` 및 `query_df_stream` 메서드에만 적용됩니다.                       |
| external_data       | ExternalData     | *None*     | 쿼리에서 사용할 파일 또는 바이너리 데이터를 포함하는 ExternalData 객체입니다. [Advanced Queries (External Data)](advanced-querying.md#external-data)를 참고하십시오.              |
| context             | QueryContext     | *None*     | 재사용 가능한 QueryContext 객체로, 위의 메서드 인자를 캡슐화하는 데 사용할 수 있습니다. [Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts)를 참고하십시오.      |

### 쿼리 예제 \{#query-examples\}

#### 기본 쿼리 \{#basic-query\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Simple SELECT query
result = client.query("SELECT name, database FROM system.tables LIMIT 3")

# Access results as rows
for row in result.result_rows:
    print(row)
# Output:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')

# Access column names and types
print(result.column_names)
# Output: ("name", "database")
print([col_type.name for col_type in result.column_types])
# Output: ['String', 'String']
```


#### 쿼리 결과 조회 \{#accessing-query-results\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

# Row-oriented access (default)
print(result.result_rows)
# Output: [[0, "0"], [1, "1"], [2, "2"]]

# Column-oriented access
print(result.result_columns)
# Output: [[0, 1, 2], ["0", "1", "2"]]

# Named results (list of dictionaries)
for row_dict in result.named_results():
    print(row_dict)
# Output: 
# {"number": 0, "str": "0"}
# {"number": 1, "str": "1"}
# {"number": 2, "str": "2"}

# First row as dictionary
print(result.first_item)
# Output: {"number": 0, "str": "0"}

# First row as tuple
print(result.first_row)
# Output: (0, "0")
```


#### 클라이언트 측 파라미터를 사용하는 쿼리 \{#query-with-client-side-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using dictionary parameters (printf-style)
query = "SELECT * FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)

# Using tuple parameters
query = "SELECT * FROM system.tables WHERE database = %s LIMIT %s"
parameters = ("system", 5)
result = client.query(query, parameters=parameters)
```


#### 서버 측 파라미터를 사용하는 쿼리 \{#query-with-server-side-parameters\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```


#### 설정이 지정된 쿼리 \{#query-with-settings\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Pass ClickHouse settings with the query
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={
        "max_block_size": 100000,
        "max_execution_time": 30
    }
)
```


### `QueryResult` 객체 \{#the-queryresult-object\}

기본 `query` 메서드는 다음과 같은 public 프로퍼티를 가진 `QueryResult` 객체를 반환합니다:

- `result_rows` -- 행 시퀀스(Sequence of rows) 형태로 반환된 데이터의 행렬로, 각 행 요소는 컬럼 값들의 시퀀스입니다.
- `result_columns` -- 컬럼 시퀀스(Sequence of columns) 형태로 반환된 데이터의 행렬로, 각 컬럼 요소는 해당 컬럼에 대한 행 값들의 시퀀스입니다.
- `column_names` -- `result_set` 내 컬럼 이름을 나타내는 문자열 튜플
- `column_types` -- `result_columns` 내 각 컬럼에 대한 ClickHouse 데이터 타입을 나타내는 ClickHouseType 인스턴스의 튜플
- `query_id` -- ClickHouse `query_id` ( `system.query_log` 테이블에서 쿼리를 확인할 때 유용함)
- `summary` -- `X-ClickHouse-Summary` HTTP 응답 헤더로 반환된 모든 데이터
- `first_item` -- 응답의 첫 번째 행을 딕셔너리로 가져오기 위한 편의 프로퍼티(키는 컬럼 이름)
- `first_row` -- 결과의 첫 번째 행을 반환하는 편의 프로퍼티
- `column_block_stream` -- 컬럼 지향 형식으로 쿼리 결과를 생성하는 제너레이터입니다. 이 프로퍼티는 직접 참조하지 않아야 합니다(아래 참조).
- `row_block_stream` -- 행 지향 형식으로 쿼리 결과를 생성하는 제너레이터입니다. 이 프로퍼티는 직접 참조하지 않아야 합니다(아래 참조).
- `rows_stream` -- 호출당 단일 행을 반환하는 쿼리 결과 제너레이터입니다. 이 프로퍼티는 직접 참조하지 않아야 합니다(아래 참조).
- `summary` -- `command` 메서드에서 설명한 대로, ClickHouse가 반환하는 요약 정보 딕셔너리

`*_stream` 프로퍼티는 반환된 데이터를 이터레이터로 사용할 수 있는 Python Context를 반환합니다. 이 프로퍼티들은 Client의 `*_stream` 메서드를 통해서만 간접적으로 접근해야 합니다. 

스트리밍 쿼리 결과(StreamContext 객체 사용)에 대한 전체 세부 내용은 [고급 쿼리(스트리밍 쿼리)](advanced-querying.md#streaming-queries)에 설명되어 있습니다.

## NumPy, Pandas 또는 Arrow 형식으로 쿼리 결과 사용하기 \{#consuming-query-results-with-numpy-pandas-or-arrow\}

ClickHouse Connect는 NumPy, Pandas, Arrow 데이터 형식에 특화된 쿼리 메서드를 제공합니다. 예제, 스트리밍 기능, 고급 타입 처리 방식 등을 포함하여 이러한 메서드 사용에 대한 자세한 내용은 [고급 쿼리(NumPy, Pandas 및 Arrow 쿼리)](advanced-querying.md#numpy-pandas-and-arrow-queries)를 참조하십시오.

## 클라이언트 스트리밍 쿼리 메서드 \{#client-streaming-query-methods\}

대용량 결과 집합을 스트리밍하기 위해 ClickHouse Connect는 여러 스트리밍 방식을 제공합니다. 자세한 내용과 예시는 [고급 쿼리(스트리밍 쿼리)](advanced-querying.md#streaming-queries)를 참조하십시오.

## Client `insert` Method \{#client-insert-method\}

ClickHouse에 여러 레코드를 삽입할 때는 `Client.insert` 메서드를 사용합니다. 이 메서드는 다음 매개변수를 받습니다:

| Parameter          | Type                              | Default    | Description                                                                                                                                                                                   |
|--------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                               | *Required* | 데이터를 삽입할 ClickHouse 테이블입니다. 데이터베이스를 포함한 전체 테이블 이름도 사용할 수 있습니다.                                                                                           |
| data               | Sequence of Sequences             | *Required* | 삽입할 데이터의 행렬입니다. 각 원소가 행(각 행은 컬럼 값 시퀀스)인 행 지향 시퀀스이거나, 각 원소가 컬럼(각 컬럼은 행 값 시퀀스)인 컬럼 지향 시퀀스일 수 있습니다.                                 |
| column_names       | Sequence of str, or str           | '*'        | 데이터 행렬에 대한 column_names 리스트입니다. 대신 '*'를 사용하면 ClickHouse Connect가 테이블의 모든 컬럼 이름을 가져오기 위해 사전 쿼리(pre-query)를 실행합니다.                               |
| database           | str                               | ''         | insert 대상 데이터베이스 이름입니다. 지정하지 않으면 클라이언트에 설정된 데이터베이스가 사용됩니다.                                                                                            |
| column_types       | Sequence of ClickHouseType        | *None*     | ClickHouseType 인스턴스 리스트입니다. column_types와 column_type_names 둘 다 지정되지 않은 경우 ClickHouse Connect가 테이블의 모든 컬럼 타입을 가져오기 위해 사전 쿼리(pre-query)를 실행합니다.   |
| column_type_names  | Sequence of ClickHouse type names | *None*     | ClickHouse 데이터 타입 이름 리스트입니다. column_types와 column_type_names 둘 다 지정되지 않은 경우 ClickHouse Connect가 테이블의 모든 컬럼 타입을 가져오기 위해 사전 쿼리(pre-query)를 실행합니다. |
| column_oriented    | bool                              | False      | True이면 `data` 인자를 컬럼들의 시퀀스로 간주하여 데이터 삽입을 위한 피벗 변환이 필요하지 않습니다. 그렇지 않으면 `data`를 행들의 시퀀스로 해석합니다.                                           |
| settings           | dict                              | *None*     | [settings 설명](#settings-argument)을 참고하십시오.                                                                                                                                            |
| context            | InsertContext                     | *None*     | 재사용 가능한 InsertContext 객체를 사용하여 위 메서드 인자들을 캡슐화할 수 있습니다. [고급 Insert(InsertContexts)](advanced-inserting.md#insertcontexts)를 참고하십시오.                          |
| transport_settings | dict                              | *None*     | 전송 레벨 설정(HTTP 헤더 등)에 대한 선택적 딕셔너리입니다.                                                                                                                                     |

이 메서드는 "command" 메서드에서 설명한 것과 같은 쿼리 요약(query summary) 딕셔너리를 반환합니다. 어떤 이유로든 insert가 실패하면 예외가 발생합니다.

Pandas DataFrame, PyArrow Table, Arrow 기반 DataFrame과 함께 동작하는 특수화된 insert 메서드에 대해서는 [고급 Insert(Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods)를 참고하십시오.

:::note
NumPy 배열은 유효한 Sequence of Sequences이며 기본 `insert` 메서드의 `data` 인자로 사용할 수 있으므로, 별도의 특수화 메서드가 필요하지 않습니다.
:::

### 예시 \{#examples\}

아래 예시는 스키마가 `(id UInt32, name String, age UInt8)`인 기존 테이블 `users`가 존재한다고 가정합니다.

#### 기본 행 기반 insert \{#basic-row-oriented-insert\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Row-oriented data: each inner list is a row
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert("users", data, column_names=["id", "name", "age"])
```


#### 컬럼 지향 insert \{#column-oriented-insert\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Column-oriented data: each inner list is a column
data = [
    [1, 2, 3],  # id column
    ["Alice", "Bob", "Joe"],  # name column
    [25, 30, 28],  # age column
]

client.insert("users", data, column_names=["id", "name", "age"], column_oriented=True)
```


#### 컬럼 타입을 명시하여 Insert \{#insert-with-explicit-column-types\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Useful when you want to avoid a DESCRIBE query to the server
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    column_type_names=["UInt32", "String", "UInt8"],
)
```


#### 특정 데이터베이스에 데이터 삽입 \{#insert-into-specific-database\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]

# Insert into a table in a specific database
client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    database="production",
)
```


## 파일 삽입 \{#file-inserts\}

파일에서 ClickHouse 테이블로 데이터를 직접 삽입하는 방법은 [고급 삽입(파일 삽입)](advanced-inserting.md#file-inserts)을 참조하십시오.

## Raw API \{#raw-api\}

형 변환을 수행하지 않고 ClickHouse HTTP 인터페이스에 직접 액세스해야 하는 고급 사용 사례는 [고급 사용법(Raw API)](advanced-usage.md#raw-api)를 참조하십시오.

## 유틸리티 클래스와 함수 \{#utility-classes-and-functions\}

다음 클래스와 함수는 "public" `clickhouse-connect` API의 일부로 간주되며, 위에서 문서화한 클래스와 메서드와 마찬가지로 마이너 릴리스 전반에 걸쳐 안정적으로 유지됩니다. 이들 클래스와 함수에 대한 비호환 변경은 패치 릴리스가 아닌 마이너 릴리스에서만 발생하며, 적어도 한 번의 마이너 릴리스 기간 동안은 사용 중단(deprecated) 상태로 제공됩니다.

### 예외 \{#exceptions\}

모든 사용자 정의 예외(DB API 2.0 명세에 정의된 예외 포함)는 `clickhouse_connect.driver.exceptions` 모듈에 정의되어 있습니다. 드라이버에서 실제로 감지되는 예외는 모두 이들 타입 중 하나입니다.

### ClickHouse SQL 유틸리티 \{#clickhouse-sql-utilities\}

`clickhouse_connect.driver.binding` 모듈에 있는 FUNCTION들과 DT64Param 클래스는 ClickHouse SQL 쿼리를 적절하게 구성하고 이스케이프하는 데 사용할 수 있습니다. 마찬가지로 `clickhouse_connect.driver.parser` 모듈에 있는 FUNCTION들은 ClickHouse 데이터 타입 이름을 파싱하는 데 사용할 수 있습니다.

## 멀티스레드, 멀티프로세스, 비동기/이벤트 기반 사용 사례 \{#multithreaded-multiprocess-and-asyncevent-driven-use-cases\}

멀티스레드, 멀티프로세스, 비동기/이벤트 기반 애플리케이션에서 ClickHouse Connect를 사용하는 방법에 대해서는 [고급 사용법(멀티스레드, 멀티프로세스, 비동기/이벤트 기반 사용 사례)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)를 참조하십시오.

## AsyncClient 래퍼 \{#asyncclient-wrapper\}

asyncio 환경에서 AsyncClient 래퍼를 사용하는 방법에 대해서는 [고급 사용법(AsyncClient 래퍼)](advanced-usage.md#asyncclient-wrapper) 섹션을 참조하십시오.

## ClickHouse 세션 ID 관리 \{#managing-clickhouse-session-ids\}

멀티 스레드 또는 동시 처리 애플리케이션에서 ClickHouse 세션 ID를 관리하는 방법에 대한 내용은 [고급 사용법(ClickHouse 세션 ID 관리)](advanced-usage.md#managing-clickhouse-session-ids)를 참조하십시오.

## HTTP 연결 풀 사용자 정의 \{#customizing-the-http-connection-pool\}

대규모 멀티스레드 애플리케이션에서 HTTP 연결 풀을 사용자 정의하는 방법은 [고급 사용법(HTTP 연결 풀 사용자 정의)](advanced-usage.md#customizing-the-http-connection-pool)을 참조하십시오.