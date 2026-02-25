---
slug: /use-cases/observability/clickstack/migration/elastic/search
title: 'ClickStack 및 Elastic에서 검색하기'
pagination_prev: null
pagination_next: null
sidebar_label: '검색'
sidebar_position: 3
description: 'ClickStack 및 Elastic에서 검색하기'
doc_type: 'guide'
keywords: ['clickstack', '검색', '로그', '관측성', '전문 검색']
---

import Image from '@theme/IdealImage';
import hyperdx_search from '@site/static/images/use-cases/observability/hyperdx-search.png';
import hyperdx_sql from '@site/static/images/use-cases/observability/hyperdx-sql.png';


## ClickStack와 Elastic에서 검색하기 \{#search-in-clickstack-and-elastic\}

ClickHouse는 고성능 분석 워크로드를 위해 처음부터 설계된 SQL 네이티브 엔진입니다. 반면 Elasticsearch는 SQL을 내부 Elasticsearch query DSL로 변환하는 SQL 유사 인터페이스를 제공하므로, SQL이 일급 시민이 아니며 [기능 동등성](https://www.elastic.co/docs/explore-analyze/query-filter/languages/sql-limitations)이 제한됩니다. 

ClickHouse는 완전한 SQL을 지원할 뿐만 아니라, [`argMax`](/sql-reference/aggregate-functions/reference/argmax), [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram), [`quantileTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)과 같이 관측성에 특화된 다양한 함수를 추가로 제공하여 구조화된 로그, 메트릭, 트레이스를 더 쉽게 쿼리할 수 있도록 합니다.

단순한 로그 및 트레이스 탐색의 경우, ClickStack UI(HyperDX)는 필드-값 쿼리, 범위, 와일드카드 등을 직관적인 텍스트 기반으로 필터링할 수 있는 [Lucene 스타일의 구문](/use-cases/observability/clickstack/search)을 제공합니다. 이는 Elasticsearch의 [Lucene 구문](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-query-string-query#query-string-syntax) 및 [Kibana Query Language](https://www.elastic.co/docs/reference/query-languages/kql)의 일부 요소와 유사합니다.

<Image img={hyperdx_search} alt="Search" size="lg"/>

검색 인터페이스는 이러한 익숙한 구문을 지원하지만, 내부적으로는 이를 효율적인 SQL `WHERE` 절로 변환하여 Kibana 사용자에게는 친숙한 경험을 제공하면서도 필요한 경우 SQL의 강력한 기능을 그대로 활용할 수 있도록 합니다. 이를 통해 ClickHouse에서 제공하는 [문자열 검색 함수](/sql-reference/functions/string-search-functions), [유사도 함수](/sql-reference/functions/string-functions#stringJaccardIndex), [날짜·시간 함수](/sql-reference/functions/date-time-functions)의 전체 범위를 활용할 수 있습니다.

<Image img={hyperdx_sql} alt="SQL" size="lg"/>

아래에서는 ClickStack과 Elasticsearch의 Lucene 쿼리 언어를 비교합니다.

## ClickStack search syntax vs Elasticsearch query string \{#clickstack-vs-elasticsearch-query-string\}

ClickStack와 Elasticsearch는 모두 직관적인 로그 및 트레이스 필터링을 위한 유연한 쿼리 언어를 지원합니다. Elasticsearch의 query string은 DSL과 인덱싱 엔진에 긴밀하게 통합되어 있는 반면, ClickStack은 내부적으로 ClickHouse SQL로 변환되는 Lucene 영감의 문법을 사용합니다. 아래 표에서는 두 시스템에서 공통적인 검색 패턴이 어떻게 동작하는지, 문법상의 유사점과 백엔드 실행 방식의 차이점을 중심으로 보여 줍니다.

| **Feature** | **ClickStack Syntax** | **Elasticsearch Syntax** | **Comments** |
|-------------------------|----------------------------------------|----------------------------------------|--------------|
| Free text search        | `error` | `error` | 모든 인덱싱된 필드를 대상으로 매치합니다. ClickStack에서는 내부적으로 다중 필드 SQL `ILIKE`로 다시 작성됩니다. |
| Field match             | `level:error` | `level:error` | 문법이 동일합니다. ClickStack은 ClickHouse에서 필드의 정확한 값을 매치합니다. |
| Phrase search           | `"disk full"` | `"disk full"` | 따옴표로 둘러싼 텍스트는 정확한 시퀀스를 매치합니다. ClickHouse는 문자열 동일성 비교 또는 `ILIKE`를 사용합니다. |
| Field phrase match      | `message:"disk full"` | `message:"disk full"` | SQL `ILIKE` 또는 정확한 매치로 변환됩니다. |
| OR conditions           | `error OR warning` | `error OR warning` | 용어들에 대한 논리적 OR입니다. 두 시스템 모두 이를 기본적으로 지원합니다. |
| AND conditions          | `error AND db` | `error AND db` | 둘 다 교집합으로 해석됩니다. 사용자 관점의 문법 차이는 없습니다. |
| Negation                | `NOT error` or `-error` | `NOT error` or `-error` | 동일하게 지원됩니다. ClickStack은 이를 SQL `NOT ILIKE`로 변환합니다. |
| Grouping                | `(error OR fail) AND db` | `(error OR fail) AND db` | 두 시스템 모두에서 표준적인 불리언 그룹화 방식입니다. |
| Wildcards               | `error*` or `*fail*` | `error*`, `*fail*` | ClickStack은 선행/후행 와일드카드를 모두 지원합니다. Elasticsearch는 성능상의 이유로 기본 설정에서 선행 와일드카드를 비활성화합니다. `f*ail`과 같이 용어 내부에 사용하는 와일드카드는 지원되지 않습니다. 와일드카드는 필드 매치와 함께 사용해야 합니다.|
| Ranges (numeric/date)   | `duration:[100 TO 200]` | `duration:[100 TO 200]` | ClickStack은 SQL `BETWEEN`을 사용하고, Elasticsearch는 range 쿼리로 확장합니다. `duration:[100 TO *]`와 같은 범위의 비한정 `*`는 지원되지 않습니다. 필요하다면 아래의 `Unbounded ranges`를 사용하십시오.|
| Unbounded ranges (numeric/date)   | `duration:>10` or `duration:>=10` | `duration:>10` or `duration:>=10` | ClickStack은 표준 SQL 연산자를 사용합니다.|
| Inclusive/exclusive     | `duration:{100 TO 200}` (exclusive)    | Same                                   | 중괄호는 배타적인 경계를 의미합니다. `duration:[100 TO *]`와 같이 범위에서 `*`는 지원되지 않습니다.|
| Exists check            | N/A                       | `_exists_:user` or `field:*` | `_exists_`는 지원되지 않습니다. `LogAttributes`와 같은 `맵(Map)` 컬럼의 경우 `LogAttributes.log.file.path: *`를 사용하십시오. 루트 컬럼은 반드시 존재해야 하며, 이벤트에 포함되지 않는 경우 기본값이 설정됩니다. 기본값 또는 누락된 컬럼을 검색하려면 Elasticsearch와 동일한 문법인 `ServiceName:*` 또는 `ServiceName != ''`을 사용하십시오. |
| Regex                   |      `match` function          | `name:/joh?n(ath[oa]n)/` | 현재 Lucene 문법에서는 지원되지 않습니다. SQL과 [`match`](/sql-reference/functions/string-search-functions#match) 함수 또는 다른 [문자열 검색 함수](/sql-reference/functions/string-search-functions)를 사용할 수 있습니다.|
| Fuzzy match             |      `editDistance('quikc', field) = 1` | `quikc~` | 현재 Lucene 문법에서는 지원되지 않습니다. `editDistance('rror', SeverityText) = 1`과 같이 거리 함수를 SQL에서 사용하거나 [다른 유사도 함수](/sql-reference/functions/string-functions#jaroSimilarity)를 사용할 수 있습니다. |
| Proximity search        | Not supported                       | `"fox quick"~5` | 현재 Lucene 문법에서는 지원되지 않습니다. |
| Boosting                | `quick^2 fox` | `quick^2 fox` | 현재 ClickStack에서는 지원되지 않습니다. |
| Field wildcard          | `service.*:error` | `service.*:error` | 현재 ClickStack에서는 지원되지 않습니다. |
| Escaped special chars   | Escape reserved characters with `\` | Same      | 예약된 기호는 이스케이프해야 합니다. |

## 존재/누락 차이점 \{#empty-value-differences\}

필드를 이벤트에서 완전히 생략할 수 있고, 따라서 실제로 「존재하지 않는」 상태가 될 수 있는 Elasticsearch와 달리, ClickHouse에서는 테이블 스키마에 정의된 모든 컬럼이 반드시 존재해야 합니다. INSERT 이벤트에 어떤 필드가 제공되지 않으면:

- [`Nullable`](/sql-reference/data-types/nullable) 필드의 경우 `NULL`로 설정됩니다.
- 널을 허용하지 않는 필드(기본값인 경우)에는 기본값이 채워집니다(대개 빈 문자열, 0 또는 이와 동등한 값).

ClickStack에서는 [`Nullable`](/sql-reference/data-types/nullable)이 [권장되지 않기](/optimize/avoid-nullable-columns) 때문에 후자의 동작을 사용합니다.

이 동작 방식 때문에, Elasticsearch 의미에서 어떤 필드가 「존재하는지」 여부를 직접적으로 확인하는 것은 지원되지 않습니다. 

대신 `field:*` 또는 `field != ''`를 사용하여 비어 있지 않은 값이 존재하는지를 확인할 수 있습니다. 따라서 실제로 누락된 필드와 명시적으로 비워 둔 필드를 구분하는 것은 불가능합니다.

실무에서는 관측성 용도에서 이 차이가 문제를 일으키는 경우는 드물지만, 시스템 간에 쿼리를 변환할 때는 이 점을 염두에 두는 것이 중요합니다.