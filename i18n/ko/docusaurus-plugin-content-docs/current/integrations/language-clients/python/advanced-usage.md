---
sidebar_label: '고급 사용법'
sidebar_position: 6
keywords: ['clickhouse', 'python', 'advanced', 'raw', 'async', 'threading']
description: 'ClickHouse Connect의 고급 사용법'
slug: /integrations/language-clients/python/advanced-usage
title: '고급 사용법'
doc_type: 'reference'
---

# 고급 활용 \{#advanced-usage\}

## Raw API \{#raw-api\}

ClickHouse 데이터와 네이티브 또는 타사 데이터 타입 및 구조 간 변환이 필요하지 않은 사용 사례에서는, ClickHouse Connect 클라이언트가 ClickHouse 연결을 직접 사용할 수 있는 메서드를 제공합니다.

### Client `raw_query` method \{#client-rawquery-method\}

`Client.raw_query` 메서드는 클라이언트 연결을 사용하여 ClickHouse HTTP 쿼리 인터페이스를 직접 사용할 수 있도록 합니다. 반환 값은 가공되지 않은 `bytes` 객체입니다. 이 메서드는 최소한의 인터페이스로 매개변수 바인딩, 오류 처리, 재시도, 설정 관리를 제공하는 편리한 래퍼입니다:

| Parameter     | Type             | Default    | Description                                                                                                                                             |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| query         | str              | *Required* | 모든 유효한 ClickHouse 쿼리                                                                                                                                  |
| parameters    | dict or iterable | *None*     | [parameters 설명](driver-api.md#parameters-argument)을 참조하십시오.                                                                                        |
| settings      | dict             | *None*     | [settings 설명](driver-api.md#settings-argument)을 참조하십시오.                                                                                            |
| fmt           | str              | *None*     | 결과 `bytes`에 대한 ClickHouse Output Format입니다. (지정하지 않으면 ClickHouse는 TSV를 사용합니다)                                                                |
| use_database  | bool             | True       | 쿼리 컨텍스트에 ClickHouse Connect 클라이언트에서 지정한 데이터베이스를 사용합니다                                                                               |
| external_data | ExternalData     | *None*     | 쿼리에서 사용할 파일 또는 바이너리 데이터를 포함하는 ExternalData 객체입니다. [고급 쿼리(External Data)](advanced-querying.md#external-data)를 참조하십시오. |

결과 `bytes` 객체를 처리하는 책임은 호출자에게 있습니다. 또한 `Client.query_arrow`는 ClickHouse `Arrow` output format을 사용하는, 이 메서드에 대한 얇은 래퍼에 불과하다는 점에 유의하십시오.

### Client `raw_stream` method \{#client-rawstream-method\}

`Client.raw_stream` 메서드는 `raw_query` 메서드와 동일한 API를 제공하지만, `bytes` 객체의 generator/stream 소스로 사용할 수 있는 `io.IOBase` 객체를 반환합니다. 현재 `query_arrow_stream` 메서드에서 사용됩니다.

### Client `raw_insert` 메서드 \{#client-rawinsert-method\}

`Client.raw_insert` 메서드는 클라이언트 연결을 사용하여 `bytes` 객체 또는 `bytes` 객체 generator를 직접 삽입할 수 있도록 합니다. 삽입 페이로드에 대해 별도의 처리를 수행하지 않기 때문에 성능이 매우 우수합니다. 이 메서드는 settings 및 insert format을 지정할 수 있는 옵션을 제공합니다:

| Parameter    | Type                                   | Default    | Description                                                                                 |
|--------------|----------------------------------------|------------|---------------------------------------------------------------------------------------------|
| table        | str                                    | *Required* | 단순 테이블 이름 또는 데이터베이스 이름이 포함된 완전한 테이블 이름                        |
| column_names | Sequence[str]                          | *None*     | 삽입 블록의 컬럼 이름입니다. `fmt` 매개변수에 이름이 포함되어 있지 않다면 필수입니다.      |
| insert_block | str, bytes, Generator[bytes], BinaryIO | *Required* | 삽입할 데이터입니다. 문자열은 클라이언트 인코딩으로 인코딩됩니다.                           |
| settings     | dict                                   | *None*     | [settings에 대한 설명](driver-api.md#settings-argument)을 참조하십시오.                     |
| fmt          | str                                    | *None*     | `insert_block` bytes의 ClickHouse Input Format입니다. (지정하지 않으면 ClickHouse는 TSV를 사용합니다) |

`insert_block`이 지정된 format에 맞고 지정된 압축 방식을 사용하도록 보장하는 책임은 호출 측에 있습니다. ClickHouse Connect는 파일 업로드와 PyArrow Tables에 이러한 raw insert를 사용하며, 파싱은 ClickHouse 서버에 위임합니다.

## 쿼리 결과를 파일로 저장하기 \{#saving-query-results-as-files\}

`raw_stream` 메서드를 사용하면 ClickHouse에서 로컬 파일 시스템으로 파일을 직접 스트리밍할 수 있습니다. 예를 들어, 쿼리 결과를 CSV 파일로 저장하려면 다음 코드 예제를 사용할 수 있습니다.

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

위 코드를 실행하면 다음과 같은 내용의 `output.csv` 파일이 생성됩니다:

```csv
"number","number_as_str"
0,"0"
1,"1"
2,"2"
3,"3"
4,"4"
```

마찬가지로 데이터를 [TabSeparated](/interfaces/formats/TabSeparated) 및 기타 형식으로 저장할 수 있습니다. 사용 가능한 모든 형식 옵션에 대한 전체 개요는 [입력 및 출력 데이터 형식](/interfaces/formats)을 참고하십시오.


## 멀티스레드, 멀티프로세스, 그리고 비동기/이벤트 기반 사용 사례 \{#multithreaded-multiprocess-and-asyncevent-driven-use-cases\}

ClickHouse Connect는 멀티스레드, 멀티프로세스, 그리고 이벤트 루프 기반/비동기 애플리케이션에서 잘 동작합니다. 모든 쿼리 및 insert 처리는 단일 스레드 내에서 수행되므로, 일반적으로 연산은 스레드 안전합니다. (일부 연산의 병렬 처리를 저수준에서 지원하여 단일 스레드로 인한 성능 저하를 극복하는 것은 향후 가능한 개선 사항이지만, 그 경우에도 스레드 안전성은 유지됩니다.)

각각 실행되는 쿼리 또는 insert는 자체 `QueryContext` 또는 `InsertContext` 객체 안에 상태를 유지하므로, 이러한 헬퍼 객체는 스레드 안전하지 않으며 여러 처리 스트림 간에 공유해서는 안 됩니다. 컨텍스트 객체에 대한 추가 논의는 [QueryContexts](advanced-querying.md#querycontexts) 및 [InsertContexts](advanced-inserting.md#insertcontexts) 섹션을 참고하십시오.

또한 애플리케이션에서 두 개 이상의 쿼리와/또는 insert가 동시에 「진행 중(in flight)」인 경우, 염두에 두어야 할 추가적인 고려 사항이 두 가지 있습니다. 첫 번째는 쿼리/insert와 연관된 ClickHouse 「세션(session)」이며, 두 번째는 ClickHouse Connect 클라이언트 인스턴스에서 사용되는 HTTP 커넥션 풀입니다.

## AsyncClient 래퍼 \{#asyncclient-wrapper\}

ClickHouse Connect는 일반 `Client`에 대한 비동기 래퍼를 제공하여 `asyncio` 환경에서 클라이언트를 사용할 수 있도록 합니다.

`AsyncClient` 인스턴스를 얻으려면 표준 `get_client`와 동일한 매개변수를 받는 팩터리 함수인 `get_async_client`를 사용하면 됩니다:

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

`AsyncClient`는 표준 `Client`와 동일한 메서드와 파라미터를 가지지만, 해당되는 경우 이 메서드들은 코루틴(coroutine)으로 정의됩니다. 내부적으로는 I/O 작업을 수행하는 `Client`의 메서드들이 [run&#95;in&#95;executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) 호출로 래핑됩니다.

`AsyncClient` 래퍼를 사용하면 멀티스레딩 성능이 향상됩니다. I/O 작업이 완료되기를 기다리는 동안 실행 스레드와 GIL이 해제되기 때문입니다.

참고: 일반 `Client`와 달리, `AsyncClient`는 기본적으로 `autogenerate_session_id`를 `False`로 강제합니다.

함께 보기: [run&#95;async 예제](https://github.com/ClickHouse/clickhouse-connect/blob/main/examples/run_async.py).


## ClickHouse 세션 ID 관리 \{#managing-clickhouse-session-ids\}

각 ClickHouse 쿼리는 ClickHouse 「세션」 컨텍스트 내에서 실행됩니다. 세션은 현재 두 가지 목적으로 사용됩니다.

* 특정 ClickHouse 설정을 여러 쿼리와 연결하기 위해 사용됩니다([user settings](/operations/settings/settings.md) 참조). ClickHouse `SET` 명령은 사용자 세션 범위에서 설정을 변경하는 데 사용됩니다.
* [임시 테이블](/sql-reference/statements/create/table#temporary-tables)을 추적하는 데 사용됩니다.

기본적으로 ClickHouse Connect `Client` 인스턴스로 실행되는 각 쿼리는 해당 클라이언트의 세션 ID를 사용합니다. 단일 클라이언트를 사용할 때는 `SET` SQL 문과 임시 테이블이 예상대로 동작합니다. 그러나 ClickHouse 서버는 동일한 세션 내에서 동시 쿼리를 허용하지 않습니다(시도할 경우 클라이언트에서 `ProgrammingError`를 발생시킵니다). 동시 쿼리를 실행해야 하는 애플리케이션에서는 다음 패턴 중 하나를 사용하십시오.

1. 세션 격리가 필요한 각 스레드/프로세스/이벤트 핸들러마다 별도의 `Client` 인스턴스를 생성합니다. 이렇게 하면 클라이언트별 세션 상태(임시 테이블 및 `SET` 값)가 유지됩니다.
2. 세션 상태 공유가 필요하지 않은 경우, `query`, `command`, 또는 `insert` 호출 시 `settings` 인자를 통해 각 쿼리마다 고유한 `session_id`를 사용합니다.
3. 클라이언트를 생성하기 전에 `autogenerate_session_id=False`로 설정하여 공유 클라이언트에서 세션을 비활성화합니다(또는 이를 `get_client`에 직접 전달합니다).

```python
from clickhouse_connect import common
import clickhouse_connect

common.set_setting('autogenerate_session_id', False)  # This should always be set before creating a client
client = clickhouse_connect.get_client(host='somehost.com', user='dbuser', password=1234)
```

또는 `autogenerate_session_id=False`를 직접 `get_client(...)`에 전달하십시오.

이 경우 ClickHouse Connect는 `session_id`를 보내지 않으며, 서버는 개별 요청을 서로 동일한 세션에 속한 것으로 간주하지 않습니다. 임시 테이블과 세션 수준 설정은 요청 간에 유지되지 않습니다.


## HTTP 커넥션 풀 사용자 지정 \{#customizing-the-http-connection-pool\}

ClickHouse Connect는 서버에 대한 기본 HTTP 연결을 처리하기 위해 `urllib3` 커넥션 풀을 사용합니다. 기본적으로 모든 클라이언트 인스턴스는 동일한 커넥션 풀을 공유하며, 이는 대부분의 사용 사례에 충분합니다. 이 기본 풀은 애플리케이션에서 사용하는 각 ClickHouse 서버에 대해 최대 8개의 HTTP Keep-Alive 연결을 유지합니다.

대규모 멀티스레드 애플리케이션에는 별도의 커넥션 풀이 더 적합할 수 있습니다. 사용자 지정 커넥션 풀은 기본 `clickhouse_connect.get_client` 함수의 `pool_mgr` 키워드 인수로 제공할 수 있습니다:

```python
import clickhouse_connect
from clickhouse_connect.driver import httputil

big_pool_mgr = httputil.get_pool_manager(maxsize=16, num_pools=12)

client1 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
client2 = clickhouse_connect.get_client(pool_mgr=big_pool_mgr)
```

위 예제에서 볼 수 있듯이, 클라이언트는 PoolManager를 공유할 수도 있고 각 클라이언트마다 별도의 PoolManager를 생성할 수도 있습니다. PoolManager를 생성할 때 사용할 수 있는 옵션에 대한 자세한 내용은 [`urllib3` 문서](https://urllib3.readthedocs.io/en/stable/advanced-usage.html#customizing-pool-behavior)를 참조하십시오.
