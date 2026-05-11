---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'Python을 ClickHouse에 연결하기 위한 ClickHouse Connect 프로젝트 제품군'
title: 'ClickHouse Connect를 사용한 Python 통합'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# 소개 \{#introduction\}

ClickHouse Connect는 다양한 Python 애플리케이션과의 상호 운용성을 제공하는 핵심 데이터베이스 드라이버입니다.

- 기본 인터페이스는 `clickhouse_connect.driver` 패키지의 `Client` 객체입니다. 해당 코어 패키지에는 ClickHouse 서버와 통신하는 데 사용되는 여러 보조 클래스와 유틸리티 함수, 그리고 insert 및 select 쿼리를 고급 수준에서 관리하기 위한 "context" 구현도 포함되어 있습니다.
- `clickhouse_connect.datatypes` 패키지는 실험적이 아닌 모든 ClickHouse 데이터 타입에 대한 기본 구현과 서브클래스를 제공합니다. 주요 기능은 ClickHouse 데이터를 ClickHouse "Native" 바이너리 컬럼형 포맷으로 직렬화(Serialization) 및 역직렬화(Deserialization)하는 것으로, 이를 통해 ClickHouse와 클라이언트 애플리케이션 간에 가장 효율적인 전송을 달성합니다.
- `clickhouse_connect.cdriver` 패키지의 Cython/C 클래스는 가장 일반적인 직렬화 및 역직렬화 작업 일부를 최적화하여 순수 Python 대비 성능을 크게 향상시킵니다.
- `clickhouse_connect.cc_sqlalchemy` 패키지에는 `datatypes` 및 `dbi` 패키지를 기반으로 구축된 [SQLAlchemy](https://www.sqlalchemy.org/) dialect가 있습니다. 이 구현은 `JOIN`(`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), `WHERE` 절, `ORDER BY`, `LIMIT`/`OFFSET`, `DISTINCT` 연산, `WHERE` 조건이 있는 경량 `DELETE` SQL 문, 테이블 리플렉션, 기본 DDL 작업(`CREATE TABLE`, `CREATE`/`DROP DATABASE`) 등을 포함한 SQLAlchemy Core 기능을 지원합니다. 고급 ORM 기능이나 고급 DDL 기능은 지원하지 않지만, ClickHouse의 OLAP 지향 데이터베이스에서 수행되는 대부분의 분석 워크로드에 적합한 강력한 쿼리 기능을 제공합니다.
- 코어 드라이버와 [ClickHouse Connect SQLAlchemy](sqlalchemy.md) 구현은 ClickHouse를 Apache Superset에 연결하는 권장 방법입니다. `ClickHouse Connect` 데이터베이스 연결 또는 SQLAlchemy dialect용 `clickhousedb` 연결 문자열을 사용하십시오.

이 문서는 clickhouse-connect 0.9.2 릴리스를 기준으로 작성되었습니다.

:::note
공식 ClickHouse Connect Python 드라이버는 ClickHouse 서버와의 통신에 HTTP 프로토콜을 사용합니다. 이를 통해 HTTP 로드 밸런서를 지원할 수 있으며, 방화벽과 프록시가 있는 엔터프라이즈 환경에서도 잘 동작합니다. 다만 네이티브 TCP 기반 프로토콜과 비교하면 압축률과 성능이 다소 낮고, 쿼리 취소와 같은 일부 고급 기능은 지원하지 않습니다. 특정 사용 사례에서는 네이티브 TCP 기반 프로토콜을 사용하는 [커뮤니티 Python 드라이버](/interfaces/third-party/client-libraries.md) 중 하나를 사용하는 방안을 고려할 수 있습니다.
:::

## 요구 사항 및 호환성 \{#requirements-and-compatibility\}

|       Python |   |       Platform¹ |   |      ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |  Pandas |   | Polars |   |
|-------------:|:--|----------------:|:--|----------------:|:---|------------:|:--|----------------:|:--|--------:|:--|-------:|:--|
| 2.x, &lt;3.9 | ❌ |     Linux (x86) | ✅ |       &lt;25.x³ | 🟡 |  &lt;1.4.40 | ❌ |         &lt;1.4 | ❌ | &ge;1.5 | ✅ |    1.x | ✅ |
|        3.9.x | ✅ | Linux (Aarch64) | ✅ |           25.x³ | 🟡 |  &ge;1.4.40 | ✅ |           1.4.x | ✅ |     2.x | ✅ |        |   |
|       3.10.x | ✅ |     macOS (x86) | ✅ |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅ |           1.5.x | ✅ |         |   |        |   |
|       3.11.x | ✅ |     macOS (ARM) | ✅ | 25.6.x (Stable) | ✅  |             |   |           2.0.x | ✅ |         |   |        |   |
|       3.12.x | ✅ |         Windows | ✅ | 25.7.x (Stable) | ✅  |             |   |           2.1.x | ✅ |         |   |        |   |
|       3.13.x | ✅ |                 |   |    25.8.x (LTS) | ✅  |             |   |           3.0.x | ✅ |         |   |        |   |
|              |   |                 |   | 25.9.x (Stable) | ✅  |             |   |                 |   |         |   |        |   |

¹ClickHouse Connect는 표에 명시된 플랫폼에서 명시적으로 테스트되었습니다. 또한, 우수한 [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/) 프로젝트가 지원하는 모든 아키텍처용으로 C 최적화가 포함된, 미검증 바이너리 wheel도 빌드됩니다. 마지막으로 ClickHouse Connect는 순수 Python으로도 실행될 수 있으므로, 소스 설치는 대부분의 최신 Python 설치 환경에서 정상적으로 동작합니다.

²SQLAlchemy 지원은 Core 기능(쿼리, 기본 DDL)으로 제한됩니다. ORM 기능은 지원되지 않습니다. 자세한 내용은 [SQLAlchemy Integration Support](sqlalchemy.md) 문서를 참조하십시오.

³ClickHouse Connect는 공식적으로 지원되는 범위를 벗어난 버전에서도 일반적으로 잘 동작합니다.

## 설치 \{#installation\}

pip을 사용하여 [PyPI](https://pypi.org/project/clickhouse-connect/)에서 ClickHouse Connect를 설치합니다.

`pip install clickhouse-connect`

ClickHouse Connect는 소스 코드에서 설치할 수도 있습니다.

* `git clone`으로 [GitHub 저장소](https://github.com/ClickHouse/clickhouse-connect)를 클론합니다.
* (선택 사항) C/Cython 최적화를 빌드하고 활성화하기 위해 `pip install cython`을 실행합니다.
* 프로젝트 루트 디렉터리로 `cd`로 이동한 후 `pip install .`을 실행합니다.

## 지원 정책 \{#support-policy\}

문제를 보고하기 전에 ClickHouse Connect를 최신 버전으로 업데이트하십시오. 문제는 [GitHub 프로젝트](https://github.com/ClickHouse/clickhouse-connect/issues)에 등록하십시오. 향후 ClickHouse Connect 릴리스는 릴리스 시점에 적극적으로 지원되는 ClickHouse 버전과 호환되도록 설계됩니다. 현재 적극적으로 지원되는 ClickHouse 서버 버전은 [여기](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)에서 확인할 수 있습니다. 어떤 버전의 ClickHouse 서버를 사용해야 할지 확신이 서지 않는 경우, 이 토론을 [여기](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases)에서 읽어보십시오. CI 테스트 매트릭스에서는 최신 LTS 릴리스 2개와 최신 안정(stable) 릴리스 3개를 대상으로 테스트합니다. 그러나 HTTP 프로토콜을 사용하고 ClickHouse 릴리스 간의 변경 사항이 최소이기 때문에, ClickHouse Connect는 공식적으로 지원되는 범위를 벗어난 서버 버전과도 일반적으로 잘 동작합니다. 다만 일부 고급 데이터 타입(data type)에 대한 호환성은 달라질 수 있습니다.

## 기본 사용 방법 \{#basic-usage\}

### 연결 세부 정보 확인 \{#gather-your-connection-details\}

<ConnectionDetails />

### 연결 설정 \{#establish-a-connection\}

ClickHouse에 연결하는 방법에는 다음 두 가지가 있습니다:

- localhost에서 실행 중인 ClickHouse 서버에 연결
- ClickHouse Cloud 서비스에 연결

#### ClickHouse Connect 클라이언트 인스턴스를 사용하여 localhost의 ClickHouse 서버에 연결하십시오: \{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```


#### ClickHouse Connect 클라이언트 인스턴스를 사용하여 ClickHouse Cloud 서비스에 연결합니다: \{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service\}

:::tip
이전에 수집한 연결 정보를 사용하십시오. ClickHouse Cloud 서비스에는 TLS가 필요하므로 포트 8443을 사용해야 합니다.
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```


### 데이터베이스와 상호작용하기 \{#interact-with-your-database\}

ClickHouse SQL 명령을 실행하려면 클라이언트의 `command` 메서드를 사용하십시오.

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

배치 데이터를 삽입하려면 행과 값으로 구성된 2차원 배열과 함께 클라이언트의 `insert` 메서드를 사용합니다.

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

ClickHouse SQL로 데이터를 조회하려면 클라이언트의 `query` 메서드를 사용합니다:

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# Output: [(2000, -50.9035)]
```
