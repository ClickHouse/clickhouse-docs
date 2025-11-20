---
'slug': '/use-cases/observability/clickstack/migration/elastic/search'
'title': 'ClickStack 및 Elastic에서 검색'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '검색'
'sidebar_position': 3
'description': 'ClickStack 및 Elastic에서 검색'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'search'
- 'logs'
- 'observability'
- 'full-text search'
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';

## ClickStack 및 Elastic에서 검색 {#search-in-clickstack-and-elastic}

ClickHouse는 고성능 분석 작업을 위해 처음부터 설계된 SQL 네이티브 엔진입니다. 반면 Elasticsearch는 SQL 유사 인터페이스를 제공하며, SQL을 기본 Elasticsearch 쿼리 DSL로 변환합니다. 이는 Elasticsearch가 일급 시민이 아니라는 것을 의미하며, [기능 동등성](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations)은 제한적입니다.

ClickHouse는 전체 SQL을 지원할 뿐만 아니라 [`argMax`](/sql-reference/aggregate-functions/reference/argmax), [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram), [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)와 같은 여러 관측 가능성 중심의 함수를 확장하여 구조화된 로그, 메트릭 및 추적 쿼리를 단순화합니다.

간단한 로그 및 추적 탐색을 위해 HyperDX는 필드-값 쿼리, 범위, 와일드카드 등을 위한 직관적이고 텍스트 기반의 [Lucene 스타일 구문](/use-cases/observability/clickstack/search)을 제공합니다. 이는 Elasticsearch의 [Lucene 구문](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 및 [Kibana 쿼리 언어](https://www.elastic.co/docs/reference/query-languages/kql)의 요소와 비교할 수 있습니다.

<Image img={hyperdx_search} alt="검색" size="lg"/>

HyperDX의 검색 인터페이스는 이 친숙한 구문을 지원하지만, 이를 내부적으로 SQL `WHERE` 절로 효율적으로 변환하여 Kibana 사용자에게 익숙한 경험을 제공하면서 필요 시 SQL의 강력을 활용할 수 있습니다. 이를 통해 사용자는 ClickHouse에서 모든 [문자열 검색 함수](/sql-reference/functions/string-search-functions), [유사도 함수](/sql-reference/functions/string-functions#stringJaccardIndex) 및 [날짜 시간 함수](/sql-reference/functions/date-time-functions)를 활용할 수 있습니다.

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

아래에서는 ClickStack과 Elasticsearch의 Lucene 쿼리 언어를 비교합니다.

## ClickStack 검색 구문 vs Elasticsearch 쿼리 문자열 {#hyperdx-vs-elasticsearch-query-string}

HyperDX와 Elasticsearch는 직관적인 로그 및 추적 필터링을 가능하게 하는 유연한 쿼리 언어를 제공합니다. Elasticsearch의 쿼리 문자열은 DSL 및 인덱스 엔진과 강력하게 통합되어 있는 반면, HyperDX는 내부적으로 ClickHouse SQL로 변환되는 Lucene에 영감을 받은 구문을 지원합니다. 아래 표는 두 시스템에서 일반적인 검색 패턴이 어떻게 작동하는지 보여주며, 구문상의 유사점과 백엔드 실행의 차이를 강조합니다.

| **기능** | **HyperDX 구문** | **Elasticsearch 구문** | **비고** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| 자유 텍스트 검색        | `error` | `error` | 모든 인덱스된 필드에서 일치합니다. ClickStack에서는 이를 다중 필드 SQL `ILIKE`로 다시 작성합니다. |
| 필드 일치             | `level:error` | `level:error` | 동일한 구문입니다. HyperDX는 ClickHouse에서 정확한 필드 값을 일치시킵니다. |
| 구문 검색           | `"disk full"` | `"disk full"` | 따옴표로 묶인 텍스트는 특정 순서에 일치합니다. ClickHouse는 문자열 동등성 또는 `ILIKE`를 사용합니다. |
| 필드 구문 일치      | `message:"disk full"` | `message:"disk full"` | SQL `ILIKE` 또는 정확한 일치로 변환됩니다. |
| OR 조건           | `error OR warning` | `error OR warning` | 용어의 논리적 OR; 두 시스템 모두 이를 본래 지원합니다. |
| AND 조건          | `error AND db` | `error AND db` | 두 가지 모두 교집합으로 변환됩니다. 사용자 구문에 차이가 없습니다. |
| 부정                | `NOT error` 또는 `-error` | `NOT error` 또는 `-error` | 동일하게 지원됩니다. HyperDX는 SQL `NOT ILIKE`로 변환합니다. |
| 그룹화                | `(error OR fail) AND db` | `(error OR fail) AND db` | 두 시스템 모두에서 표준 불리언 그룹화입니다. |
| 와일드카드               | `error*` 또는 `*fail*` | `error*`, `*fail*` | HyperDX는 앞뒤 모두에 와일드카드를 지원합니다. ES는 성능을 위해 기본적으로 앞의 와일드카드를 비활성화합니다. 용어 내의 와일드카드는 지원되지 않습니다. 예: `f*ail.` 와일드카드는 필드 일치와 함께 사용해야 합니다. |
| 범위(숫자/날짜)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | HyperDX는 SQL `BETWEEN`을 사용합니다. Elasticsearch는 범위 쿼리로 확장합니다. 제한 없는 `*` 범위는 지원되지 않습니다. 예: `duration:[100 TO *]`. 필요 시 아래의 `제한 없는 범위`를 사용하십시오.|
| 제한 없는 범위 (숫자/날짜)   | `duration:>10` 또는 `duration:>=10` | `duration:>10` 또는 `duration:>=10` | HyperDX는 표준 SQL 연산자를 사용합니다. |
| 포함/제외     | `duration:{100 TO 200}` (배제)    | 동일                                   | 중괄호는 배제 경계를 나타냅니다. 범위 내의 `*`는 지원되지 않습니다. 예: `duration:[100 TO *]` |
| 존재 체크            | N/A                       | `_exists_:user` 또는 `field:*` | `_exists_`는 지원되지 않습니다. `LogAttributes.log.file.path: *`를 사용하여 `Map` 컬럼, 예: `LogAttributes`를 확인하십시오. 루트 컬럼의 경우 이들이 존재해야 하며, 이벤트에 포함되지 않은 경우 기본값을 갖습니다. 기본값 또는 누락된 컬럼을 검색하려면 Elasticsearch와 동일한 구문을 사용하십시오. `ServiceName:*` 또는 `ServiceName != ''`. |
| 정규 표현식                   |      `match` 함수          | `name:/joh?n(ath[oa]n)/` | Lucene 구문에서는 현재 지원되지 않습니다. 사용자는 SQL과 [`match`](/sql-reference/functions/string-search-functions#match) 함수 또는 다른 [문자열 검색 함수](/sql-reference/functions/string-search-functions)를 사용할 수 있습니다.|
| 퍼지 일치             |      `editDistance('quikc', field) = 1` | `quikc~` | Lucene 구문에서는 현재 지원되지 않습니다. 거리 함수를 SQL에서 사용하여 `editDistance('rror', SeverityText) = 1` 또는 [다른 유사도 함수](/sql-reference/functions/string-functions#jaroSimilarity)를 사용할 수 있습니다. |
| 인접 검색        | 지원되지 않음                       | `"fox quick"~5` | Lucene 구문에서는 현재 지원되지 않습니다. |
| 부스트                | `quick^2 fox` | `quick^2 fox` | 현재 HyperDX에서는 지원되지 않습니다. |
| 필드 와일드카드          | `service.*:error` | `service.*:error` | 현재 HyperDX에서는 지원되지 않습니다. |
| 이스케이프된 특수 문자   | 예약된 문자를 `\`로 이스케이프 | 동일      | 예약된 기호를 위한 이스케이핑이 필요합니다. |

## 존재/누락 차이 {#empty-value-differences}

Elasticsearch와 달리, 이벤트에서 필드를 완전히 생략할 수 있고 따라서 "존재하지 않는다"고 진정으로 말할 수 있는 반면, ClickHouse는 테이블 스키마의 모든 컬럼이 존재해야 합니다. 삽입 이벤트에서 필드가 제공되지 않으면:

- [`Nullable`](/sql-reference/data-types/nullable) 필드의 경우 `NULL`로 설정됩니다.
- Nullable이 아닌 필드(기본값)의 경우 기본값(종종 빈 문자열, 0 또는 동등한 값)으로 채워집니다.

ClickStack에서는 후자를 사용하며, [`Nullable`](/sql-reference/data-types/nullable)는 [권장되지 않습니다](/optimize/avoid-nullable-columns).

이 동작은 Elasticsearch의 의미에서 필드가 "존재하는지" 확인하는 것을 직접 지원하지 않음을 의미합니다.

대신 사용자는 `field:*` 또는 `field != ''`를 사용하여 비어 있지 않은 값의 존재 여부를 확인할 수 있습니다. 따라서 진정으로 누락된 필드와 명시적으로 비어 있는 필드를 구별할 수 없습니다.

실제로 이 차이는 관측 가능성 사용 사례에 대한 문제를 거의 일으키지 않지만, 시스템 간 쿼리를 변환할 때 기억하는 것이 중요합니다.
