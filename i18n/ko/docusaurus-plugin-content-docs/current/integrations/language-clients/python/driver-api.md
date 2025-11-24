---
'sidebar_label': '드라이버 API'
'sidebar_position': 2
'keywords':
- 'clickhouse'
- 'python'
- 'driver'
- 'api'
- 'client'
'description': 'ClickHouse Connect 드라이버 API'
'slug': '/integrations/language-clients/python/driver-api'
'title': 'ClickHouse Connect 드라이버 API'
'doc_type': 'reference'
---


# ClickHouse Connect 드라이버 API {#clickhouse-connect-driver-api}

:::note
기본적으로 많은 수의 가능한 인수가 있으며, 그 중 대부분이 선택적이기 때문에 키워드 인수를 사용하는 것이 권장됩니다.

*여기에 문서화되지 않은 메서드는 API의 일부로 간주되지 않으며, 제거되거나 변경될 수 있습니다.*
:::
## 클라이언트 초기화 {#client-initialization}

`clickhouse_connect.driver.client` 클래스는 Python 애플리케이션과 ClickHouse 데이터베이스 서버 간의 주요 인터페이스를 제공합니다. `clickhouse_connect.get_client` 함수를 사용하여 다음 인수를 받는 Client 인스턴스를 얻을 수 있습니다.
### 연결 인수 {#connection-arguments}

| 매개변수                | 유형         | 기본값                       | 설명                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | http 또는 https여야 합니다.                                                                                                                                                                                                                                |
| host                     | str         | localhost                     | ClickHouse 서버의 호스트 이름 또는 IP 주소입니다. 설정하지 않으면 `localhost`가 사용됩니다.                                                                                                                                                            |
| port                     | int         | 8123 또는 8443                  | ClickHouse HTTP 또는 HTTPS 포트입니다. 설정하지 않으면 8123으로 기본 설정되며, *secure*=*True* 또는 *interface*=*https*인 경우 8443으로 기본 설정됩니다.                                                                                                                             |
| username                 | str         | default                       | ClickHouse 사용자 이름입니다. 설정하지 않으면 `default` ClickHouse 사용자가 사용됩니다.                                                                                                                                                                     |
| password                 | str         | *&lt;빈 문자열&gt;*        | *username*의 비밀번호입니다.                                                                                                                                                                                                                          |
| database                 | str         | *None*                        | 연결의 기본 데이터베이스입니다. 설정하지 않으면 ClickHouse Connect는 *username*에 대해 기본 데이터베이스를 사용합니다.                                                                                                                                 |
| secure                   | bool        | False                         | HTTPS/TLS를 사용합니다. 이는 인터페이스 또는 포트 인수에서 유추된 값을 무시합니다.                                                                                                                                                                   |
| dsn                      | str         | *None*                        | 표준 DSN(데이터 소스 이름) 형식의 문자열입니다. 별도로 설정하지 않은 경우 이 문자열에서 다른 연결 값(예: 호스트 또는 사용자)이 추출됩니다.                                                                                           |
| compress                 | bool 또는 str | True                          | ClickHouse HTTP 삽입 및 쿼리 결과에 대해 압축을 활성화합니다. [추가 옵션 (압축)](additional-options.md#compression)를 참조하십시오.                                                                                                           |
| query_limit              | int         | 0 (무제한)                 | 모든 `query` 응답에 대해 반환할 최대 행 수입니다. 이 값을 0으로 설정하면 무제한 행이 반환됩니다. 대규모 쿼리 제한은 결과가 스트리밍되지 않는 경우 메모리 부족 예외를 발생할 수 있으므로 주의해야 합니다. |
| query_retries            | int         | 2                             | `query` 요청에 대한 최대 재시도 횟수입니다. "재시도 가능한" HTTP 응답만 재시도됩니다. `command` 또는 `insert` 요청은 의도하지 않은 중복 요청을 방지하기 위해 드라이버에 의해 자동으로 재시도되지 않습니다.                                |
| connect_timeout          | int         | 10                            | HTTP 연결 시간 초과(초)입니다.                                                                                                                                                                                                                   |
| send_receive_timeout     | int         | 300                           | HTTP 연결의 송신/수신 시간 초과(초)입니다.                                                                                                                                                                                              |
| client_name              | str         | *None*                        | HTTP 사용자 에이전트 헤더에 추가되는 client_name입니다. 이 값을 설정하면 ClickHouse 시스템 쿼리 로그에서 클라이언트 쿼리를 추적할 수 있습니다.                                                                                                                             |
| pool_mgr                 | obj         | *&lt;기본 PoolManager&gt;* | 사용할 `urllib3` 라이브러리 PoolManager입니다. 여러 호스트에 대해 여러 연결 풀을 요구하는 고급 사용 사례에 유용합니다.                                                                                                                              |
| http_proxy               | str         | *None*                        | HTTP 프록시 주소(HTTP_PROXY 환경 변수를 설정하는 것과 동일합니다).                                                                                                                                                                       |
| https_proxy              | str         | *None*                        | HTTPS 프록시 주소(HTTPS_PROXY 환경 변수를 설정하는 것과 동일합니다).                                                                                                                                                                     |
| apply_server_timezone    | bool        | True                          | 시간 인식 쿼리 결과에 서버 시간대를 사용합니다. [시간대 우선순위](advanced-querying.md#time-zones)를 참조하십시오.                                                                                                                                      |
| show_clickhouse_errors   | bool        | True                          | 클라이언트 예외에 ClickHouse 서버 오류 메시지와 예외 코드를 포함합니다.                                                                                                                                                           |
| autogenerate_session_id  | bool        | *None*                        | 전역 `autogenerate_session_id` 설정을 무시합니다. True로 설정하면 제공되지 않은 경우 UUID4 세션 ID를 자동으로 생성합니다.                                                                                                                      |
| proxy_path               | str         | &lt;빈 문자열&gt;          | 프록시 구성을 위해 ClickHouse 서버 URL에 추가할 선택적 경로 접두사입니다.                                                                                                                                                                    |
| form_encode_query_params | bool        | False                         | 쿼리 매개변수를 URL 매개변수 대신 요청 바디에 양식 인코딩된 데이터로 전송합니다. URL 길이 제한을 초과할 수 있는 많은 매개변수를 포함하는 쿼리에 유용합니다.                                                                           |
| rename_response_column   | str         | *None*                        | 쿼리 결과에서 응답 컬럼의 이름을 변경하기 위한 선택적 콜백 함수 또는 컬럼 이름 매핑입니다.                                                                                                                                                        |
### HTTPS/TLS 인수 {#httpstls-arguments}

| 매개변수        | 유형 | 기본값 | 설명                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | HTTPS/TLS를 사용하는 경우 ClickHouse 서버 TLS/SSL 인증서(hostname, expiration 등)를 검증합니다.                                                                                                                                                                               |
| ca_cert          | str  | *None*  | *verify*=*True*인 경우, ClickHouse 서버 인증서를 검증할 Certificate Authority 루트의 파일 경로입니다. .pem 형식으로 제공됩니다. verify가 False인 경우 무시됩니다. ClickHouse 서버 인증서가 운영 체제에 의해 검증된 전 세계적으로 신뢰된 루트인 경우 필요하지 않습니다. |
| client_cert      | str  | *None*  | 상호 TLS 인증을 위한 .pem 형식의 TLS 클라이언트 인증서에 대한 파일 경로입니다. 이 파일은 모든 중간 인증서를 포함하여 전체 인증서 체인을 포함해야 합니다.                                                                                                  |
| client_cert_key  | str  | *None*  | 클라이언트 인증서에 대한 개인 키의 파일 경로입니다. 개인 키가 클라이언트 인증서 키 파일에 포함되지 않은 경우 필요합니다.                                                                                                                                             |
| server_host_name | str  | *None*  | TLS 인증서의 CN 또는 SNI에 의해 식별되는 ClickHouse 서버 호스트 이름입니다. 다른 호스트 이름으로 프록시 또는 터널을 통해 연결할 때 SSL 오류를 방지하기 위해 이 값을 설정해야 합니다.                                                                                            |
| tls_mode         | str  | *None*  | 고급 TLS 동작을 제어합니다. `proxy` 및 `strict`는 ClickHouse 상호 TLS 연결을 발동하지 않지만 클라이언트 인증서와 키를 전송합니다. `mutual`은 ClickHouse 상호 TLS 인증을 클라이언트 인증서로 가정합니다. *None*/기본 동작은 `mutual`입니다.                                |
### 설정 인수 {#settings-argument}

마지막으로, `get_client`의 `settings` 인수는 각 클라이언트 요청에 대해 ClickHouse 설정을 서버에 전달하는 데 사용됩니다. 대부분의 경우, *readonly*=*1* 접근 권한을 가진 사용자는 쿼리와 함께 전송된 설정을 변경할 수 없으므로, ClickHouse Connect는 최종 요청에서 이러한 설정을 제거하고 경고를 기록합니다. 다음 설정은 ClickHouse Connect에서 사용하는 HTTP 쿼리/세션에만 적용되며 일반 ClickHouse 설정으로는 문서화되지 않습니다.

| 설정               | 설명                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | ClickHouse 서버가 HTTP 채널에 쓰기 전에 사용하는 버퍼 크기(바이트 단위)입니다.                                                                         |
| session_id        | 관련 쿼리를 서버에서 연관시키기 위한 고유 세션 ID입니다. 임시 테이블의 경우 필수입니다.                                                                   |
| compress          | ClickHouse 서버가 POST 응답 데이터를 압축할지를 결정합니다. 이 설정은 "raw" 쿼리에만 사용해야 합니다.                                        |
| decompress        | ClickHouse 서버에 전송된 데이터가 압축 해제되어야 하는지를 나타냅니다. 이 설정은 "raw" 삽입에만 사용해야 합니다.                                         |
| quota_key         | 이 요청과 관련된 쿼터 키입니다. 쿼터에 대한 ClickHouse 서버 문서를 참조하십시오.                                                                   |
| session_check     | 세션 상태를 확인하는 데 사용됩니다.                                                                                                                                |
| session_timeout   | 세션 ID로 식별된 세션이 타임 아웃되고 더 이상 유효하지 않게 되기 전에의 비활성 시간(초단위)입니다. 기본값은 60초입니다.         |
| wait_end_of_query | ClickHouse 서버에서 전체 응답을 버퍼링합니다. 이 설정은 요약 정보를 반환하는 데 필요하며, 비스트리밍 쿼리에서는 자동으로 설정됩니다. |
| role              | 세션에서 사용할 ClickHouse 역할입니다. 쿼리 컨텍스트에 포함될 수 있는 유효한 전송 설정입니다.                                                       |

각 쿼리와 함께 전송할 수 있는 다른 ClickHouse 설정은 [ClickHouse 문서](/operations/settings/settings.md)를 참조하십시오.
### 클라이언트 생성 예제 {#client-creation-examples}

- 매개변수 없이 ClickHouse Connect 클라이언트는 `localhost`의 기본 HTTP 포트에 기본 사용자 및 비밀번호 없이 연결됩니다:

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)

# Output: '22.10.1.98'
```

- 보안(HTTPS) 외부 ClickHouse 서버에 연결하기

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))

# Output: 'Etc/UTC'
```

- 세션 ID 및 기타 사용자 정의 연결 매개변수 및 ClickHouse 설정으로 연결합니다.

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
## 클라이언트 생명주기 및 모범 사례 {#client-lifecycle-and-best-practices}

ClickHouse Connect 클라이언트를 생성하는 것은 연결을 설정하고 서버 메타데이터를 검색하며 설정을 초기화하는 비용이 많이 드는 작업입니다. 최적의 성능을 위해 아래의 모범 사례를 따르십시오:
### 핵심 원칙 {#core-principles}

- **클라이언트 재사용**: 클라이언트를 애플리케이션 시작 시 한 번만 생성하고 애플리케이션 수명 동안 재사용합니다.
- **잦은 생성 피하기**: 각 쿼리나 요청에 대해 새로운 클라이언트를 생성하지 마십시오(각 작업에서 수백 밀리초를 낭비합니다).
- **적절한 정리**: 연결 풀 리소스를 해제하기 위해 항상 종료 시 클라이언트를 닫습니다.
- **가능한 경우 공유**: 단일 클라이언트가 여러 동시 쿼리를 처리할 수 있습니다(아래의 스레딩 노트를 참조하십시오).
### 기본 패턴 {#basic-patterns}

**✅ 좋음: 단일 클라이언트 재사용**

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

**❌ 나쁨: 클라이언트를 반복해서 생성**

```python

# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```
### 다중 스레드 애플리케이션 {#multi-threaded-applications}

:::warning
세션 ID를 사용할 때 클라이언트 인스턴스는 **스레드 안전하지 않습니다**. 기본적으로 클라이언트는 자동 생성된 세션 ID를 가지며, 동일한 세션 내에서 동시 쿼리는 `ProgrammingError`를 발생시킵니다.
:::

스레드 간 클라이언트를 안전하게 공유하려면:

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

**세션에 대한 대안:** 세션이 필요하면(예: 임시 테이블의 경우) 스레드마다 별도의 클라이언트를 생성하십시오:

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```
### 적절한 정리 {#proper-cleanup}

항상 종료 시 클라이언트를 닫아야 합니다. `client.close()`는 클라이언트가 자신의 풀 관리자를 소유할 때만 클라이언트를 처분하고 HTTP 연결을 닫습니다(예: 사용자 정의 TLS/프록시 옵션으로 생성된 경우). 기본 공유 풀의 경우, `client.close_connections()`를 사용하여 소켓을 능동적으로 정리하십시오. 그렇지 않으면 연결은 비활성 만료 및 프로세스 종료를 통해 자동으로 회수됩니다.

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

또는 컨텍스트 관리자를 사용할 수 있습니다:

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```
### 여러 클라이언트를 사용하는 경우 {#when-to-use-multiple-clients}

여러 클라이언트가 적합한 경우:

- **서버가 다를 경우**: ClickHouse 서버 또는 클러스터마다 하나의 클라이언트
- **자격 증명이 다를 경우**: 서로 다른 사용자 또는 접근 수준을 위한 별도의 클라이언트
- **데이터베이스가 다를 경우**: 여러 데이터베이스에서 작업해야 할 필요가 있을 때
- **격리된 세션**: 임시 테이블이나 세션 특정 설정을 위한 별도의 세션이 필요할 때
- **스레드별 격리**: 스레드에 독립적인 세션이 필요할 때(위에 설명된 대로)
## 공용 메서드 인수 {#common-method-arguments}

여러 클라이언트 메서드는 하나 또는 두 개의 공통 `parameters` 및 `settings` 인수를 사용합니다. 이러한 키워드 인수는 아래에 설명되어 있습니다.
### 매개변수 인수 {#parameters-argument}

ClickHouse Connect 클라이언트의 `query*` 및 `command` 메서드는 ClickHouse 값 표현에 Python 표현식을 바인딩하는 데 사용되는 선택적 `parameters` 키워드 인수를 허용합니다. 두 가지 종류의 바인딩이 가능합니다.
#### 서버 측 바인딩 {#server-side-binding}

ClickHouse는 [서버 측 바인딩](/interfaces/cli.md#cli-queries-with-parameters)을 대부분의 쿼리 값에 대해 지원하며, 바인딩된 값은 쿼리와는 별도로 HTTP 쿼리 매개변수로 전송됩니다. ClickHouse Connect는 형태 `{<name>:<datatype>}`의 바인딩 표현식을 감지하면 적절한 쿼리 매개변수를 추가합니다. 서버 측 바인딩의 경우, `parameters` 인수는 Python 사전이어야 합니다.

- Python 사전, DateTime 값 및 문자열 값으로서의 서버 측 바인딩

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

이것은 서버에서 다음 쿼리를 생성합니다:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
서버 측 바인딩은 `SELECT` 쿼리에 대해서만 ClickHouse 서버에 의해 지원됩니다. `ALTER`, `DELETE`, `INSERT` 또는 다른 유형의 쿼리에는 작동하지 않습니다. 이는 향후 변경될 수 있습니다. https://github.com/ClickHouse/ClickHouse/issues/42092를 참조하십시오.
:::
#### 클라이언트 측 바인딩 {#client-side-binding}

ClickHouse Connect는 클라이언트 측 매개변수 바인딩도 지원하여 템플릿 기반 SQL 쿼리를 생성하는 데 더 많은 유연성을 제공합니다. 클라이언트 측 바인딩의 경우, `parameters` 인수는 사전 또는 시퀀스여야 합니다. 클라이언트 측 바인딩은 매개변수 치환을 위해 Python의 ["printf" 스타일](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) 문자열 포맷팅을 사용합니다.

서버 측 바인딩과는 달리 클라이언트 측 바인딩은 데이터베이스 식별자(예: 데이터베이스, 테이블 또는 컬럼 이름)에 대해 작동하지 않습니다. 파이썬 스타일 포맷팅은 서로 다른 유형의 문자열을 구별할 수 없으며, 서로 다른 형식으로 포맷하여야 합니다(데이터베이스 식별자의 경우 백틱 또는 큰따옴표, 데이터 값의 경우 작은따옴표).

- Python 사전, DateTime 값 및 문자열 이스케이핑 예제

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

이것은 서버에서 다음 쿼리를 생성합니다:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

- Python 시퀀스(튜플), Float64 및 IPv4Address의 예제

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

이것은 서버에서 다음 쿼리를 생성합니다:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
DateTime64 인수를 바인딩하려면(서브 초 정밀도의 ClickHouse 유형), 두 가지 사용자 정의 접근 방식 중 하나가 필요합니다:
- Python `datetime.datetime` 값을 새로운 DT64Param 클래스로 감싸고, 예를 들어:
```python
query = 'SELECT {p1:DateTime64(3)}'  # Server-side binding with dictionary
parameters={'p1': DT64Param(dt_value)}

query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client-side binding with list 
parameters=['a string', DT64Param(datetime.now())]
```
  - 매개변수 값의 사전을 사용할 경우, 매개변수 이름에 문자열 `_64`를 추가합니다.
```python
query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server-side binding with dictionary

parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
```
:::
### 설정 인수 {#settings-argument-1}

모든 주요 ClickHouse Connect 클라이언트 "insert" 및 "select" 메서드는 포함된 SQL 문에 대한 ClickHouse 서버 [사용자 설정](/operations/settings/settings.md)을 전송하기 위한 선택적 `settings` 키워드 인수를 허용합니다. `settings` 인수는 사전이어야 합니다. 각 항목은 ClickHouse 설정 이름과 해당 값이어야 합니다. 서버에 쿼리 매개변수로 전송될 때 값이 문자열로 변환됩니다.

클라이언트 수준의 설정과 마찬가지로 ClickHouse Connect는 서버에서 *readonly*=*1*으로 표시된 설정을 삭제하며, 이와 관련된 로그 메시지가 기록됩니다. ClickHouse HTTP 인터페이스를 통해 쿼리에만 적용되는 설정은 항상 유효합니다. 이러한 설정은 `get_client` [API](#settings-argument) 아래에서 설명됩니다.

ClickHouse 설정 사용 예:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```
## 클라이언트 `command` 메서드 {#client-command-method}

`Client.command` 메서드를 사용하여 일반적으로 데이터를 반환하지 않거나 전체 데이터 세트 대신 단일 기본 값 또는 배열 값을 반환하는 ClickHouse 서버에 SQL 쿼리를 전송합니다. 이 메서드는 다음 매개변수를 사용합니다:

| 매개변수     | 유형             | 기본값    | 설명                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *필수* | 단일 값 또는 단일 행 값을 반환하는 ClickHouse SQL 문입니다.                                                                             |
| parameters    | dict 또는 iterable | *None*     | [매개변수 설명](#parameters-argument)을 참조하십시오.                                                                                                           |
| data          | str 또는 bytes     | *None*     | POST 본문에 명령과 함께 포함할 선택적 데이터입니다.                                                                                                   |
| settings      | dict             | *None*     | [설정 설명](#settings-argument)을 참조하십시오.                                                                                                               |
| use_database  | bool             | True       | 클라이언트 데이터베이스를 사용합니다(클라이언트 생성 시 지정됨). False는 명령이 연결된 사용자의 기본 ClickHouse 서버 데이터베이스를 사용함을 의미합니다. |
| external_data | ExternalData     | *None*     | 쿼리와 함께 사용할 파일 또는 이진 데이터가 포함된 `ExternalData` 객체입니다.  [고급 쿼리 (외부 데이터)](advanced-querying.md#external-data)를 참조하십시오.     |
### 명령 예제 {#command-examples}
#### DDL 문 {#ddl-statements}

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

# SETTINGS index_granularity = 8192


# Drop table
client.command("DROP TABLE test_command")
```
#### 단일 값을 반환하는 간단한 쿼리 {#simple-queries-returning-single-values}

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
#### 매개변수가 있는 명령 {#commands-with-parameters}

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
#### 설정이 있는 명령 {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```
## 클라이언트 `query` 메서드 {#client-query-method}

`Client.query` 메서드는 ClickHouse 서버에서 단일 "배치" 데이터 세트를 검색하는 기본 방법입니다. 이는 HTTP를 통해 대량의 데이터 세트를 효율적으로 전송하기 위해 원시 ClickHouse 형식을 활용합니다(약 100만 행까지). 이 메서드는 다음 매개변수를 사용합니다:

| 매개변수           | 유형             | 기본값    | 설명                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *필수* | ClickHouse SQL SELECT 또는 DESCRIBE 쿼리입니다.                                                                                                                                       |
| parameters          | dict 또는 iterable | *None*     | [매개변수 설명](#parameters-argument)을 참조하십시오.                                                                                                                                |
| settings            | dict             | *None*     | [설정 설명](#settings-argument)을 참조하십시오.                                                                                                                                    |
| query_formats       | dict             | *None*     | 결과 값에 대한 데이터 유형 형식 지정 사양입니다. 고급 사용법 (읽기 형식)을 참조하십시오.                                                                                             |
| column_formats      | dict             | *None*     | 각 열에 대한 데이터 유형 형식입니다. 고급 사용법 (읽기 형식)을 참조하십시오.                                                                                                                  |
| encoding            | str              | *None*     | ClickHouse 문자열 열을 Python 문자열로 인코딩하는 데 사용되는 인코딩입니다. 설정하지 않으면 Python은 기본적으로 `UTF-8`를 사용합니다.                                                                      |
| use_none            | bool             | True       | ClickHouse null에 대해 Python *None* 유형을 사용합니다. False이면 ClickHouse null에 대해 기본 데이터 유형(예: 0)을 사용합니다. NumPy/Pandas의 경우 성능상의 이유로 False로 기본 설정됩니다. |
| column_oriented     | bool             | False      | 결과를 행 시퀀스 대신 열 시퀀스로 반환합니다. Python 데이터를 다른 열 지향 데이터 형식으로 변환하는 데 유용합니다.                            |
| query_tz            | str              | *None*     | `zoneinfo` 데이터베이스의 시간대 이름입니다. 이 시간대는 쿼리에서 반환된 모든 datetime 또는 Pandas Timestamp 객체에 적용됩니다.                                     |
| column_tzs          | dict             | *None*     | 열 이름과 시간대 이름의 사전입니다. `query_tz`와 유사하지만 서로 다른 열에 대해 서로 다른 시간대를 지정할 수 있습니다.                                                    |
| use_extended_dtypes | bool             | True       | ClickHouse NULL 값에 대해 Pandas 확장 데이터 유형(예: StringArray), pandas.NA 및 pandas.NaT를 사용합니다. 이는 `query_df` 및 `query_df_stream` 메서드에만 적용됩니다.                  |
| external_data       | ExternalData     | *None*     | 쿼리와 함께 사용할 파일 또는 이진 데이터를 포함하는 ExternalData 객체입니다. [고급 쿼리 (외부 데이터)](advanced-querying.md#external-data)를 참조하십시오.                            |
| context             | QueryContext     | *None*     | 위의 메서드 인수를 캡슐화할 수 있는 재사용 가능한 QueryContext 객체를 사용할 수 있습니다. [고급 쿼리 (QueryContexts)](advanced-querying.md#querycontexts)를 참조하십시오.                   |
### 쿼리 예제 {#query-examples}
#### 기본 쿼리 {#basic-query}

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
#### 쿼리 결과 액세스 {#accessing-query-results}

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
#### 클라이언트 측 매개변수가 있는 쿼리 {#query-with-client-side-parameters}

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
#### 서버 측 매개변수가 있는 쿼리 {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()


# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```
#### 설정이 있는 쿼리 {#query-with-settings}

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
### `QueryResult` 객체 {#the-queryresult-object}

기본 `query` 메서드는 다음과 같은 공개 속성이 있는 `QueryResult` 객체를 반환합니다:

- `result_rows` -- 각 행 요소가 컬럼 값을 시퀀스 형태인 행의 시퀀스 형태로 반환된 데이터의 행렬.
- `result_columns` -- 각 열 요소가 해당 열의 행 값 시퀀스인 열의 시퀀스 형태로 반환된 데이터의 행렬
- `column_names` -- `result_set`의 열 이름을 나타내는 문자열 튜플
- `column_types` -- `result_columns`의 각 열에 대한 ClickHouse 데이터 유형을 나타내는 ClickHouseType 인스턴스의 튜플
- `query_id` -- ClickHouse query_id(시스템.query_log 테이블에서 쿼리를 검사하는 데 유용함)
- `summary` -- `X-ClickHouse-Summary` HTTP 응답 헤더에서 반환된 데이터
- `first_item` -- 응답의 첫 번째 행을 사전 형태로 검색하기 위한 편리한 속성(키는 열 이름)
- `first_row` -- 결과의 첫 번째 행을 반환하는 편리한 속성
- `column_block_stream` -- 열 지향 형식으로 쿼리 결과의 생성기입니다. 이 속성은 직접 참조해서는 안 됩니다(아래 참조).
- `row_block_stream` -- 행 지향 형식으로 쿼리 결과의 생성기입니다. 이 속성은 직접 참조해서는 안 됩니다(아래 참조).
- `rows_stream` -- 호출당 단일 행을 생성하는 쿼리 결과의 생성기입니다. 이 속성은 직접 참조해서는 안 됩니다(아래 참조).
- `summary` -- `command` 메서드 아래에 설명된 ClickHouse 반환된 요약 정보의 사전입니다.

`*_stream` 속성은 반환된 데이터를 반복하기 위한 이터레이터로 사용할 수 있는 Python Context를 반환합니다. 이 메서드는 Client의 `*_stream` 메서드를 사용하여 간접적으로만 접근해야 합니다. 

스트리밍 쿼리 결과의 모든 세부 사항(스트림 컨텍스트 객체 사용)은 [고급 쿼리 (스트리밍 쿼리)](advanced-querying.md#streaming-queries)에서 설명됩니다.
## NumPy, Pandas 또는 Arrow로 쿼리 결과 소비하기 {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect는 NumPy, Pandas 및 Arrow 데이터 형식에 대한 전문 쿼리 메서드를 제공합니다. 이러한 메서드를 사용하는 방법에 대한 자세한 정보는 [고급 쿼리 (NumPy, Pandas 및 Arrow 쿼리)](advanced-querying.md#numpy-pandas-and-arrow-queries)를 참조하십시오.
## 클라이언트 스트리밍 쿼리 메서드 {#client-streaming-query-methods}

ClickHouse Connect는 대규모 결과 세트를 스트리밍하기 위한 여러 스트리밍 메서드를 제공합니다. 자세한 사항 및 예제는 [고급 쿼리 (스트리밍 쿼리)](advanced-querying.md#streaming-queries)를 참조하십시오.
## Client `insert` 메서드 {#client-insert-method}

ClickHouse에 여러 레코드를 삽입하는 일반적인 사용 사례를 위해 `Client.insert` 메서드가 있습니다. 이 메서드는 다음 매개변수를 받습니다:

| 매개변수           | 유형                                | 기본값      | 설명                                                                                                                                                                                           |
|--------------------|------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                                | *필수*      | 삽입할 ClickHouse 테이블. 전체 테이블 이름(데이터베이스 포함)이 허용됩니다.                                                                                                                   |
| data               | Sequence of Sequences              | *필수*      | 삽입할 데이터의 매트릭스. 행의 시퀀스(각 행은 컬럼 값의 시퀀스) 또는 컬럼의 시퀀스(각 컬럼은 행 값의 시퀀스)일 수 있습니다.                                                             |
| column_names       | Sequence of str, or str            | '*'        | 데이터 매트릭스를 위한 column_names 목록. '*'가 사용되면 ClickHouse Connect는 테이블의 모든 열 이름을 검색하기 위해 "사전 쿼리"를 실행합니다.                                               |
| database           | str                                | ''         | 삽입의 대상 데이터베이스. 지정되지 않으면 클라이언트의 데이터베이스가 가정됩니다.                                                                                                           |
| column_types       | Sequence of ClickHouseType         | *없음*      | ClickHouseType 인스턴스 목록. column_types 또는 column_type_names가 지정되지 않으면 ClickHouse Connect는 테이블의 모든 열 유형을 검색하기 위해 "사전 쿼리"를 실행합니다.                   |
| column_type_names  | Sequence of ClickHouse type names  | *없음*      | ClickHouse 데이터 유형 이름 목록. column_types 또는 column_type_names가 지정되지 않으면 ClickHouse Connect는 테이블의 모든 열 유형을 검색하기 위해 "사전 쿼리"를 실행합니다.                |
| column_oriented    | bool                               | False      | True인 경우, `data` 인자는 컬럼의 시퀀스인 것으로 간주됩니다(데이터를 삽입하기 위한 "피벗"이 필요하지 않음). 그렇지 않으면 `data`는 행의 시퀀스로 해석됩니다.                              |
| settings           | dict                               | *없음*      | [설정 설명](#settings-argument)를 참조하십시오.                                                                                                                                               |
| context            | InsertContext                      | *없음*      | 위의 메서드 인수를 캡슐화하는 재사용 가능한 InsertContext 객체를 사용할 수 있습니다. [고급 삽입 (InsertContexts)](advanced-inserting.md#insertcontexts)를 참조하십시오.                         |
| transport_settings | dict                               | *없음*      | 선택적 전송 수준 설정(HTTP 헤더 등)의 사전입니다.                                                                                                                                               |

이 메서드는 "쿼리 요약" 사전을 반환합니다. 삽입이 어떤 이유로 실패하면 예외가 발생합니다.

Pandas DataFrame, PyArrow 테이블 및 Arrow-back 데이터 프레임과 함께 작동하는 특수 삽입 메서드에 대한 내용은 [고급 삽입 (특수 삽입 메서드)](advanced-inserting.md#specialized-insert-methods)를 참조하십시오.

:::note
NumPy 배열은 유효한 Sequence of Sequences이며, `data` 인자로 사용될 수 있으므로 특수화된 메서드는 필요하지 않습니다.
:::
### 예제 {#examples}

아래 예제는 스키마가 `(id UInt32, name String, age UInt8)`인 기존 테이블 `users`를 가정합니다.
#### 기본 행 지향 삽입 {#basic-row-oriented-insert}

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
#### 컬럼 지향 삽입 {#column-oriented-insert}

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
#### 명시적 열 유형으로 삽입 {#insert-with-explicit-column-types}

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
#### 특정 데이터베이스로 삽입 {#insert-into-specific-database}

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
## 파일 삽입 {#file-inserts}

파일에서 ClickHouse 테이블로 직접 데이터를 삽입하는 방법에 대한 내용은 [고급 삽입 (파일 삽입)](advanced-inserting.md#file-inserts)를 참조하십시오.
## 원시 API {#raw-api}

타입 변환 없이 ClickHouse HTTP 인터페이스에 직접 접근이 필요한 고급 사용 사례에 대한 내용은 [고급 사용법 (원시 API)](advanced-usage.md#raw-api)를 참조하십시오.
## 유틸리티 클래스 및 함수 {#utility-classes-and-functions}

다음 클래스와 함수는 "공식" `clickhouse-connect` API의 일부로 간주되며, 위에서 문서화된 클래스와 메서드처럼 마이너 릴리스에서 안정적입니다. 이러한 클래스와 함수에 대한 중단 변경 사항은 마이너(패치가 아님) 릴리스에서만 발생하며, 적어도 하나의 마이너 릴리스 동안 사용 중단 상태로 제공됩니다.
### 예외 {#exceptions}

모든 사용자 지정 예외(또한 DB API 2.0 사양에 정의된 예외)는 `clickhouse_connect.driver.exceptions` 모듈에 정의됩니다. 드라이버에 의해 실제로 감지된 예외는 이러한 유형 중 하나를 사용합니다.
### ClickHouse SQL 유틸리티 {#clickhouse-sql-utilities}

`clickhouse_connect.driver.binding` 모듈의 함수 및 DT64Param 클래스를 사용하여 ClickHouse SQL 쿼리를 적절하게 구축하고 이스케이프할 수 있습니다. 마찬가지로, `clickhouse_connect.driver.parser` 모듈의 함수를 사용하여 ClickHouse 데이터 유형 이름을 구문 분석할 수 있습니다.
## 다중 스레드, 다중 프로세스 및 비동기/이벤트 기반 사용 사례 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

다중 스레드, 다중 프로세스 및 비동기/이벤트 기반 애플리케이션에서 ClickHouse Connect를 사용하는 방법에 대한 내용은 [고급 사용법 (다중 스레드, 다중 프로세스 및 비동기/이벤트 기반 사용 사례)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases)를 참조하십시오.
## AsyncClient 래퍼 {#asyncclient-wrapper}

asyncio 환경을 위한 AsyncClient 래퍼 사용에 대한 내용은 [고급 사용법 (AsyncClient 래퍼)](advanced-usage.md#asyncclient-wrapper)를 참조하십시오.
## ClickHouse 세션 ID 관리 {#managing-clickhouse-session-ids}

다중 스레드 또는 동시 애플리케이션에서 ClickHouse 세션 ID를 관리하는 방법에 대한 내용은 [고급 사용법 (ClickHouse 세션 ID 관리)](advanced-usage.md#managing-clickhouse-session-ids)를 참조하십시오.
## HTTP 연결 풀 사용자 정의 {#customizing-the-http-connection-pool}

대규모 다중 스레드 애플리케이션을 위한 HTTP 연결 풀 사용자 정의 방법에 대한 내용은 [고급 사용법 (HTTP 연결 풀 사용자 정의)](advanced-usage.md#customizing-the-http-connection-pool)를 참조하십시오.
