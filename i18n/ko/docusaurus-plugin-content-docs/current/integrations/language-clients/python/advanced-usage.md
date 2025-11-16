---
'sidebar_label': '고급 사용법'
'sidebar_position': 6
'keywords':
- 'clickhouse'
- 'python'
- 'advanced'
- 'raw'
- 'async'
- 'threading'
'description': 'ClickHouse Connect와 함께하는 고급 사용법'
'slug': '/integrations/language-clients/python/advanced-usage'
'title': '고급 사용법'
'doc_type': 'reference'
---



# 고급 사용법 {#advanced-usage}

## 원시 API {#raw-api}

ClickHouse 데이터와 기본 또는 제3자 데이터 유형 및 구조 간의 변환이 필요 없는 경우에 대한 사용 사례의 경우, ClickHouse Connect 클라이언트는 ClickHouse 연결의 직접 사용을 위한 메서드를 제공합니다.

### 클라이언트 `raw_query` 메서드 {#client-rawquery-method}

`Client.raw_query` 메서드는 클라이언트 연결을 사용하여 ClickHouse HTTP 쿼리 인터페이스의 직접 사용을 허용합니다. 반환 값은 처리되지 않은 `bytes` 객체입니다. 매개변수 바인딩, 오류 처리, 재시도 및 최소 인터페이스를 사용한 설정 관리와 함께 편리한 래퍼를 제공합니다:

| 매개변수         | 타입                    | 기본값      | 설명                                                                                                                                                   |
|------------------|-----------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| query            | str                   | *필수*     | 유효한 ClickHouse 쿼리                                                                                                                               |
| parameters       | dict 또는 iterable    | *없음*     | [매개변수 설명](driver-api.md#parameters-argument)를 참조하십시오.                                                                                     |
| settings         | dict                  | *없음*     | [설정 설명](driver-api.md#settings-argument)를 참조하십시오.                                                                                         |
| fmt              | str                   | *없음*     | 결과 바이트에 대한 ClickHouse 출력 형식. (지정하지 않으면 ClickHouse는 TSV를 사용합니다)                                                                |
| use_database     | bool                  | True        | 쿼리 컨텍스트에 대해 ClickHouse Connect 클라이언트에 할당된 데이터베이스를 사용하십시오.                                                               |
| external_data    | ExternalData          | *없음*     | 쿼리에서 사용할 파일 또는 이진 데이터를 포함하는 ExternalData 객체입니다. [고급 쿼리 (외부 데이터)](advanced-querying.md#external-data)를 참조하십시오. |

결과 `bytes` 객체를 처리하는 것은 호출자의 책임입니다. `Client.query_arrow`는 ClickHouse `Arrow` 출력 형식을 사용하는 이 메서드를 얇게 감싼 것입니다.

### 클라이언트 `raw_stream` 메서드 {#client-rawstream-method}
`Client.raw_stream` 메서드는 `raw_query` 메서드와 동일한 API를 가지지만 `bytes` 객체의 생성기/스트림 소스로 사용할 수 있는 `io.IOBase` 객체를 반환합니다. 현재 `query_arrow_stream` 메서드에서 사용됩니다.

### 클라이언트 `raw_insert` 메서드 {#client-rawinsert-method}

`Client.raw_insert` 메서드는 클라이언트 연결을 사용하여 `bytes` 객체 또는 `bytes` 객체 생성기를 직접 삽입할 수 있도록 합니다. 삽입 페이로드를 처리하지 않기 때문에 성능이 매우 뛰어납니다. 이 메서드는 설정 및 삽입 형식을 지정할 수 있는 옵션을 제공합니다:

| 매개변수       | 타입                                     | 기본값      | 설명                                                                                     |
|----------------|----------------------------------------|-------------|------------------------------------------------------------------------------------------|
| table          | str                                    | *필수*     | 단순 또는 데이터베이스 한정 테이블 이름                                                |
| column_names   | Sequence[str]                          | *없음*     | 삽입 블록의 컬럼 이름. `fmt` 매개변수에 이름이 포함되지 않을 경우 필수입니다.         |
| insert_block   | str, bytes, Generator[bytes], BinaryIO | *필수*     | 삽입할 데이터. 문자열은 클라이언트 인코딩으로 인코딩됩니다.                               |
| settings       | dict                                   | *없음*     | [설정 설명](driver-api.md#settings-argument)를 참조하십시오.                             |
| fmt            | str                                    | *없음*     | `insert_block` 바이트의 ClickHouse 입력 형식. (지정하지 않으면 ClickHouse는 TSV를 사용합니다) |

`insert_block`이 지정된 형식에 따르고 지정된 압축 방법을 사용하는지 확인하는 것은 호출자의 책임입니다. ClickHouse Connect는 파일 업로드 및 PyArrow 테이블에 대해 이러한 원시 삽입을 사용하며, 구문 분석은 ClickHouse 서버에 위임됩니다.

## 쿼리 결과를 파일로 저장하기 {#saving-query-results-as-files}

`raw_stream` 메서드를 사용하여 ClickHouse에서 로컬 파일 시스템으로 파일을 직접 스트리밍할 수 있습니다. 예를 들어, 쿼리 결과를 CSV 파일로 저장하고 싶다면 다음 코드 스니펫을 사용할 수 있습니다:

```python
import clickhouse_connect

if __name__ == '__main__':
    client = clickhouse_connect.get_client()
    query = 'SELECT number, toString(number) AS number_as_str FROM system.numbers LIMIT 5'
    fmt = 'CSVWithNames'  # or CSV, or CSVWithNamesAndTypes, or TabSeparated, etc.
    stream = client.raw_stream(query=query, fmt=fmt)
    with open("output.csv", "wb") as f:
        for chunk in stream:
            f.write(chunk)
```

위 코드는 다음 내용을 포함하는 `output.csv` 파일을 생성합니다:

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

유사하게, [TabSeparated](/interfaces/formats/TabSeparated) 및 기타 형식으로 데이터를 저장할 수 있습니다. 사용 가능한 모든 형식 옵션에 대한 개요는 [입력 및 출력 데이터 형식](/interfaces/formats)을 참조하십시오.

## 멀티스레드, 멀티프로세스, 비동기/이벤트 기반 사용 사례 {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

ClickHouse Connect는 멀티스레드, 멀티프로세스 및 이벤트 루프 기반/비동기 애플리케이션에서 잘 작동합니다. 모든 쿼리 및 삽입 처리는 단일 스레드 내에서 발생하므로, 일반적으로 작업이 스레드 안전합니다. (저수준에서 일부 작업의 병렬 처리 기능이 향후 개선사항으로 추가되어 단일 스레드의 성능 저하를 극복할 수 있지만, 그 경우에도 스레드 안전성은 유지됩니다.)

각 쿼리 또는 삽입 실행은 각각 자신의 `QueryContext` 또는 `InsertContext` 객체 내에 상태를 유지하므로, 이러한 도우미 객체는 스레드 안전하지 않으며 여러 처리 스트림 간에 공유되어서는 안 됩니다. [QueryContexts](advanced-querying.md#querycontexts) 및 [InsertContexts](advanced-inserting.md#insertcontexts) 섹션에서 컨텍스트 객체에 대한 추가 논의를 참조하십시오.

추가로, 동시에 "비행 중"인 두 개 이상의 쿼리 및/또는 삽입이 있는 애플리케이션에서는 두 가지 추가 고려 사항이 있습니다. 첫 번째는 쿼리/삽입과 관련된 ClickHouse "세션"이며, 두 번째는 ClickHouse Connect 클라이언트 인스턴스에서 사용하는 HTTP 연결 풀입니다.

## AsyncClient 래퍼 {#asyncclient-wrapper}

ClickHouse Connect는 일반 `Client`에 대한 비동기 래퍼를 제공하여 `asyncio` 환경에서 클라이언트를 사용할 수 있습니다.

`AsyncClient`의 인스턴스를 얻으려면, 표준 `get_client`와 같은 매개변수를 받는 `get_async_client` 팩토리 함수를 사용할 수 있습니다:

```python
import asyncio

import clickhouse_connect


async def main():
    client = await clickhouse_connect.get_async_client()
    result = await client.query("SELECT name FROM system.databases LIMIT 1")
    print(result.result_rows)
    # Output:
    # [('INFORMATION_SCHEMA',)]

asyncio.run(main())
```

`AsyncClient`는 표준 `Client`와 동일한 매개변수를 가진 동일한 메서드를 가지고 있지만, 적용 가능한 경우 코루틴입니다. 내부적으로, I/O 작업을 수행하는 `Client`의 메서드는 [run_in_executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 호출로 감싸집니다.

I/O 작업이 완료될 때까지 기다리는 동안 실행 스레드와 GIL이 해제되므로, `AsyncClient` 래퍼를 사용할 때 멀티스레드 성능이 향상됩니다.

참고: 일반 `Client`와 달리, `AsyncClient`는 기본적으로 `autogenerate_session_id`를 `False`로 강제합니다.

참고: [run_async 예제](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).

## ClickHouse 세션 ID 관리 {#managing-clickhouse-session-ids}

각 ClickHouse 쿼리는 ClickHouse "세션"의 컨텍스트 내에서 발생합니다. 세션은 현재 두 가지 목적으로 사용됩니다:
- 여러 쿼리와 특정 ClickHouse 설정을 연관시키기 위해 (참조: [사용자 설정](/operations/settings/settings.md)). ClickHouse `SET` 명령은 사용자 세션의 범위에 대한 설정을 변경하는 데 사용됩니다.
- [임시 테이블](/sql-reference/statements/create/table#temporary-tables)을 추적하기 위해.

기본적으로, ClickHouse Connect `Client` 인스턴스를 사용하여 실행되는 각 쿼리는 해당 클라이언트의 세션 ID를 사용합니다. 단일 클라이언트를 사용할 때 `SET` 문 및 임시 테이블은 예상대로 작동합니다. 그러나 ClickHouse 서버는 동일한 세션 내에서 동시 쿼리를 허용하지 않습니다 (시도하면 클라이언트가 `ProgrammingError`를 발생시킵니다). 동시 쿼리를 실행하는 애플리케이션의 경우 다음 패턴 중 하나를 사용하십시오:
1. 세션 격리가 필요한 각 스레드/프로세스/이벤트 핸들러에 대해 별도의 `Client` 인스턴스를 생성합니다. 이렇게 하면 클라이언트별 세션 상태(임시 테이블 및 `SET` 값)가 유지됩니다.
2. `query`, `command`, 또는 `insert`를 호출할 때 `settings` 인수를 통해 각 쿼리에 대해 고유한 `session_id`를 사용합니다. 이를 통해 공유 세션 상태를 요구하지 않을 수 있습니다.
3. 클라이언트를 생성하기 전에 `autogenerate_session_id=False`로 설정하여 공유 클라이언트에서 세션을 비활성화합니다 (혹은 이를 바로 `get_client`에 전달합니다).

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

대신, `get_client(...)`에 직접 `autogenerate_session_id=False`를 전달할 수 있습니다.

이 경우 ClickHouse Connect는 `session_id`를 전송하지 않으며, 서버는 별도의 요청이 동일한 세션에 속한다고 간주하지 않습니다. 임시 테이블 및 세션 수준의 설정은 요청 간에 지속되지 않습니다.

## HTTP 연결 풀 사용자 정의 {#customizing-the-http-connection-pool}

ClickHouse Connect는 `urllib3` 연결 풀이 서버에 대한 기본 HTTP 연결을 처리하는 데 사용됩니다. 기본적으로 모든 클라이언트 인스턴스는 동일한 연결 풀을 공유하며, 이는 대부분의 사용 사례에 충분합니다. 이 기본 풀은 애플리케이션에서 사용되는 각 ClickHouse 서버에 대해 최대 8개의 HTTP Keep Alive 연결을 유지합니다.

대규모 멀티스레드 애플리케이션의 경우, 별도의 연결 풀이 적합할 수 있습니다. 사용자 정의 연결 풀은 기본 `clickhouse_connect.get_client` 함수의 `pool_mgr` 키워드 인수로 제공될 수 있습니다:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

위 예에서 보여준 것처럼, 클라이언트는 풀 관리자를 공유할 수 있으며, 각 클라이언트에 대해 별도의 풀 관리자를 생성할 수 있습니다. PoolManager 생성 시 사용할 수 있는 옵션에 대한 자세한 내용은 [`urllib3` 문서](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)를 참조하십시오.
