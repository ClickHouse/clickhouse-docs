---
'keywords':
- 'clickhouse'
- 'python'
- 'client'
- 'connect'
- 'integrate'
'slug': '/integrations/python'
'description': 'Python을 ClickHouse에 연결하기 위한 ClickHouse Connect 프로젝트 스위트'
'title': 'Python과 ClickHouse Connect 통합'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'language_client'
- 'website': 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Introduction {#introduction}

ClickHouse Connect는 다양한 Python 애플리케이션과의 상호 운용성을 제공하는 핵심 데이터베이스 드라이버입니다.

- 주요 인터페이스는 패키지 `clickhouse_connect.driver`의 `Client` 객체입니다. 이 핵심 패키지에는 ClickHouse 서버와 통신하는 데 사용되는 다양한 헬퍼 클래스 및 유틸리티 함수와 삽입 및 선택 쿼리의 고급 관리를 위한 "컨텍스트" 구현이 포함되어 있습니다.
- 패키지 `clickhouse_connect.datatypes`는 모든 비실험적인 ClickHouse 데이터 유형에 대한 기본 구현 및 하위 클래스를 제공합니다. 그 주요 기능은 ClickHouse 데이터를 ClickHouse "네이티브" 바이너리 컬럼형 형식으로 직렬화 및 역직렬화하는 것이며, 이는 ClickHouse와 클라이언트 애플리케이션 간의 가장 효율적인 전송을 달성하는 데 사용됩니다.
- 패키지 `clickhouse_connect.cdriver`의 Cython/C 클래스는 순수 Python보다 성능을 크게 향상시키기 위해 가장 일반적인 직렬화 및 역직렬화를 최적화합니다.
- 패키지 `clickhouse_connect.cc_sqlalchemy`에는 `datatypes` 및 `dbi` 패키지를 기반으로 한 [SQLAlchemy](https://www.sqlalchemy.org/) 방언이 있습니다. 이 구현은 `JOIN`(`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`)이 포함된 `SELECT` 쿼리, `WHERE` 절, `ORDER BY`, `LIMIT`/`OFFSET`, `DISTINCT` 작업, `WHERE` 조건이 있는 경량 `DELETE` 문, 테이블 반사 및 기본 DDL 작업(`CREATE TABLE`, `CREATE`/`DROP DATABASE`)을 포함한 SQLAlchemy Core 기능을 지원합니다. 고급 ORM 기능이나 고급 DDL 기능은 지원하지 않지만 ClickHouse의 OLAP 지향 데이터베이스에 대한 대부분의 분석 워크로드에 적합한 강력한 쿼리 기능을 제공합니다.
- 핵심 드라이버 및 [ClickHouse Connect SQLAlchemy](sqlalchemy.md) 구현은 ClickHouse를 Apache Superset에 연결하는 선호하는 방법입니다. `ClickHouse Connect` 데이터베이스 연결 또는 `clickhousedb` SQLAlchemy 방언 연결 문자열을 사용하십시오.

이 문서는 clickhouse-connect 릴리즈 0.9.2 기준으로 актуально합니다.

:::note
공식 ClickHouse Connect Python 드라이버는 ClickHouse 서버와의 통신에 HTTP 프로토콜을 사용합니다. 이는 HTTP 로드 밸런서 지원을 가능하게 하며, 방화벽 및 프록시가 있는 기업 환경에서 잘 작동하지만, 네이티브 TCP 기반 프로토콜에 비해 압축 및 성능이 약간 낮고, 쿼리 취소와 같은 일부 고급 기능에 대한 지원이 부족합니다. 특정 사용 사례에 대해서는 네이티브 TCP 기반 프로토콜을 사용하는 [커뮤니티 Python 드라이버](/interfaces/third-party/client-libraries.md) 중 하나 사용을 고려할 수 있습니다.
:::

## Requirements and compatibility {#requirements-and-compatibility}

|       Python |   |       Platform¹ |   |      ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |  Pandas |   | Polars |   |
|-------------:|:--|----------------:|:--|----------------:|:---|------------:|:--|----------------:|:--|--------:|:--|-------:|:--|
| 2.x, &lt;3.9 | ❌ |     Linux (x86) | ✅ |       &lt;25.x³ | 🟡 |  &lt;1.4.40 | ❌ |         &lt;1.4 | ❌ | &ge;1.5 | ✅ |    1.x | ✅ |
|        3.9.x | ✅ | Linux (Aarch64) | ✅ |           25.x³ | 🟡 |  &ge;1.4.40 | ✅ |           1.4.x | ✅ |     2.x | ✅ |        |   |
|       3.10.x | ✅ |     macOS (x86) | ✅ |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅ |           1.5.x | ✅ |         |   |        |   |
|       3.11.x | ✅ |     macOS (ARM) | ✅ | 25.6.x (Stable) | ✅  |             |   |           2.0.x | ✅ |         |   |        |   |
|       3.12.x | ✅ |         Windows | ✅ | 25.7.x (Stable) | ✅  |             |   |           2.1.x | ✅ |         |   |        |   |
|       3.13.x | ✅ |                 |   |    25.8.x (LTS) | ✅  |             |   |           3.0.x | ✅ |         |   |        |   |
|              |   |                 |   | 25.9.x (Stable) | ✅  |             |   |                 |   |         |   |        |   |

¹ClickHouse Connect는 나열된 플랫폼에 대해 명시적으로 테스트되었습니다. 또한 훌륭한 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 프로젝트를 위해 C 최적화가 적용된 테스트되지 않은 바이너리 휠이 모든 아키텍처에 대해 빌드됩니다. 마지막으로 ClickHouse Connect는 순수 Python으로 실행될 수 있으므로 소스 설치는 최신 Python 설치에서 작동해야 합니다.

²SQLAlchemy 지원은 Core 기능(쿼리, 기본 DDL)로 제한됩니다. ORM 기능은 지원되지 않습니다. 상세한 내용은 [SQLAlchemy Integration Support](sqlalchemy.md) 문서를 참조하십시오.

³ClickHouse Connect는 일반적으로 공식 지원 범위를 벗어난 버전과 잘 작동합니다.

## Installation {#installation}

다음과 같이 pip를 통해 [PyPI](https://pypi.org/project/clickhouse-connect/)에서 ClickHouse Connect를 설치합니다:

`pip install clickhouse-connect`

ClickHouse Connect를 소스에서 설치할 수도 있습니다:
* [GitHub 저장소](https://github.com/ClickHouse/clickhouse-connect)에서 `git clone`합니다.
* (선택 사항) C/Cython 최적화를 빌드하고 활성화하려면 `pip install cython`을 실행합니다.
* 프로젝트 루트 디렉토리로 이동한 후 `pip install .`을 실행합니다.

## Support policy {#support-policy}

문제를 보고하기 전에 ClickHouse Connect의 최신 버전으로 업데이트하십시오. 문제는 [GitHub 프로젝트](https://github.com/ClickHouse/clickhouse-connect/issues)에 제출해야 합니다. ClickHouse Connect의 향후 릴리스는 릴리스 시점의 활성 지원 ClickHouse 버전과 호환될 예정입니다. 활성 지원되는 ClickHouse 서버 버전은 [여기](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)에서 확인할 수 있습니다. 어떤 ClickHouse 서버 버전을 사용해야 할지 확실하지 않은 경우 [여기](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)에서 이 논의를 읽으십시오. 우리의 CI 테스트 매트릭스는 최신 두 개의 LTS 릴리스 및 최신 세 개의 안정 릴리스를 테스트합니다. 그러나 HTTP 프로토콜과 ClickHouse 릴리스 간의 최소한의 브레이크 체인지로 인해 ClickHouse Connect는 일반적으로 공식 지원 범위를 벗어난 서버 버전과 잘 작동하지만, 특정 고급 데이터 유형과의 호환성은 다를 수 있습니다.

## Basic usage {#basic-usage}

### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

### Establish a connection {#establish-a-connection}

ClickHouse에 연결하기 위한 두 가지 예시가 있습니다:
- localhost의 ClickHouse 서버에 연결하기.
- ClickHouse Cloud 서비스에 연결하기.

#### Use a ClickHouse Connect client instance to connect to a ClickHouse server on localhost: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### Use a ClickHouse Connect client instance to connect to a ClickHouse Cloud service: {#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service}

:::tip
앞에서 수집한 연결 세부정보를 사용하십시오. ClickHouse Cloud 서비스는 TLS가 필요하므로 포트 8443을 사용하십시오.
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### Interact with your database {#interact-with-your-database}

ClickHouse SQL 명령을 실행하려면 클라이언트 `command` 메서드를 사용하십시오:

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

배치 데이터를 삽입하려면 클라이언트 `insert` 메서드와 행과 값의 2차원 배열을 사용하십시오:

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQL을 사용하여 데이터를 검색하려면 클라이언트 `query` 메서드를 사용하십시오:

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)

# Output: [(2000, -50.9035)]
```
