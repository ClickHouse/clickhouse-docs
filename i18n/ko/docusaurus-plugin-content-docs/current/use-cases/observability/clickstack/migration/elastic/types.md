---
'slug': '/use-cases/observability/clickstack/migration/elastic/types'
'title': '매핑 타입'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '타입'
'sidebar_position': 2
'description': 'ClickHouse 및 Elasticsearch의 매핑 타입'
'show_related_blogs': true
'keywords':
- 'JSON'
- 'Codecs'
'doc_type': 'reference'
---

Elasticsearch와 ClickHouse는 다양한 데이터 유형을 지원하지만, 이들의 기본 스토리지 및 쿼리 모델은 근본적으로 다릅니다. 이 섹션에서는 일반적으로 사용되는 Elasticsearch 필드 유형을 ClickHouse의 동등한 유형으로 매핑하고, 마이그레이션을 안내하는 데 도움이 되는 컨텍스트를 제공합니다. 해당하는 동등한 항목이 없는 경우, 대안이나 주석이 제공됩니다.

| **Elasticsearch Type**        | **ClickHouse Equivalent**   | **Comments** |
|-------------------------------|------------------------------|--------------|
| `boolean`                     | [`UInt8`](/sql-reference/data-types/int-uint)  or [`Bool`](/sql-reference/data-types/boolean)        | ClickHouse는 최신 버전에서 `UInt8`의 별칭으로 `Boolean`을 지원합니다. |
| `keyword`                     | [`String`](/sql-reference/data-types/string)                    | 정확한 매치 필터링, 그룹화 및 정렬에 사용됩니다. |
| `text`                        | [`String`](/sql-reference/data-types/string)                    | ClickHouse에서의 전체 텍스트 검색은 제한적입니다; 토큰화는 `tokens`와 배열 함수를 결합한 사용자 정의 로직을 사용해야 합니다. |
| `long`                        | [`Int64`](/sql-reference/data-types/int-uint)                     | 64비트 부호 있는 정수입니다. |
| `integer`                     | [`Int32`](/sql-reference/data-types/int-uint)                      | 32비트 부호 있는 정수입니다. |
| `short`                       | [`Int16`](/sql-reference/data-types/int-uint)                      | 16비트 부호 있는 정수입니다. |
| `byte`                        | [`Int8`](/sql-reference/data-types/int-uint)                       | 8비트 부호 있는 정수입니다. |
| `unsigned_long`              | [`UInt64`](/sql-reference/data-types/int-uint)                    | 부호 없는 64비트 정수입니다. |
| `double`                      | [`Float64`](/sql-reference/data-types/float)                   | 64비트 부동 소수점입니다. |
| `float`                       | [`Float32`](/sql-reference/data-types/float)                   | 32비트 부동 소수점입니다. |
| `half_float`                 | [`Float32`](/sql-reference/data-types/float) or [`BFloat16`](/sql-reference/data-types/float)      | 가장 가까운 동등 항목입니다. ClickHouse에는 16비트 부동 소수점이 없습니다. ClickHouse는 `BFloat16`을 제공하는데, 이는 Half-float IEE-754와 다릅니다: half-float는 더 작은 범위에서 더 높은 정밀도를 제공하고, bfloat16은 더 넓은 범위를 위해 정밀도를 희생하여 기계 학습 작업에 더 적합합니다. |
| `scaled_float`              | [`Decimal(x, y)`](/sql-reference/data-types/decimal)             | 고정 소수점 수치 값을 저장합니다. |
| `date`                       | [`DateTime`](/sql-reference/data-types/datetime)    | 초 정밀도의 동등한 날짜 타입입니다. |
| `date_nanos`                 | [`DateTime64`](/sql-reference/data-types/datetime64)    | ClickHouse는 `DateTime64(9)`로 나노초 정밀도를 지원합니다. |
| `binary`                      | [`String`](/sql-reference/data-types/string), [`FixedString(N)`](/sql-reference/data-types/fixedstring)  | 이진 필드는 base64 디코딩이 필요합니다. |
| `ip`                          | [`IPv4`](/sql-reference/data-types/ipv4), [`IPv6`](/sql-reference/data-types/ipv6)    | 기본 `IPv4` 및 `IPv6` 타입이 제공됩니다. |
| `object`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Map`](/sql-reference/data-types/map), [`Tuple`](/sql-reference/data-types/tuple), [`JSON`](/sql-reference/data-types/newjson) | ClickHouse는 [`Nested`](/sql-reference/data-types/nested-data-structures/nested) 또는 [`JSON`](/sql-reference/data-types/newjson)을 사용하여 JSON 유사 객체를 모델링할 수 있습니다. |
| `flattened`                  | [`String`](/sql-reference/data-types/string)                      | Elasticsearch의 평면화된 유형은 전체 JSON 객체를 단일 필드로 저장하여 중첩된 키에 대한 유연하고 스키마 없는 접근을 가능하게 합니다. ClickHouse에서는 유사한 기능을 String 유형을 사용하여 얻을 수 있지만, 물리화된 뷰에서 처리가 필요합니다. |
| `nested`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                    | ClickHouse `Nested` 열은 사용자가 `flatten_nested=0`을 사용할 경우 그룹화된 하위 필드에 대한 유사한 의미를 제공합니다. |
| `join`                        | NA                           | 부모-자식 관계에 대한 직접적인 개념이 없습니다. ClickHouse는 테이블 간의 조인을 지원하므로 필요하지 않습니다. |
| `alias`                       | [`Alias`](/sql-reference/statements/create/table#alias) column modifier      | 별칭은 [지원됩니다](/sql-reference/statements/create/table#alias) 필드 수정자를 통해 사용할 수 있습니다. 이러한 별칭에 함수 적용이 가능합니다 e.g. `size String ALIAS formatReadableSize(size_bytes)`|
| `range` types (`*_range`)     | [`Tuple(start, end)`](/sql-reference/data-types/tuple) or [`Array(T)`](/sql-reference/data-types/array) | ClickHouse는 기본 범위 유형이 없지만, 숫자 및 날짜 범위는 [`Tuple(start, end)`](/sql-reference/data-types/tuple) 또는 [`Array`](/sql-reference/data-types/array) 구조를 사용하여 표현할 수 있습니다. IP 범위(`ip_range`)의 경우 CIDR 값을 `String`으로 저장하고 `isIPAddressInRange()`와 같은 함수를 사용하여 평가합니다. 또는 효율적인 필Filtering을 위해 `ip_trie` 기반의 조회 딕셔너리를 고려할 수 있습니다. |
| `aggregate_metric_double`     | [`AggregateFunction(...)`](/sql-reference/data-types/aggregatefunction) and [`SimpleAggregateFunction(...)`](/sql-reference/data-types/simpleaggregatefunction)    | 사전 집계 메트릭을 모델링하기 위해 집계 함수 상태 및 물리화된 뷰를 사용합니다. 모든 집계 함수는 집계 상태를 지원합니다.|
| `histogram`                   | [`Tuple(Array(Float64), Array(UInt64))`](/sql-reference/data-types/tuple) | 수동으로 배열이나 사용자 정의 스키마를 사용하여 버킷과 개수를 나타냅니다. |
| `annotated-text`              | [`String`](/sql-reference/data-types/string)                    | 엔티티 인식 검색 또는 주석에 대한 기본 지원이 없습니다. |
| `completion`, `search_as_you_type` | NA                    | 기본적인 자동 완성 또는 제안 엔진이 없습니다. `String` 및 [검색 함수](/sql-reference/functions/string-search-functions)로 재현할 수 있습니다. |
| `semantic_text`               | NA                           | 기본적인 의미론적 검색이 없습니다 - 임베딩을 생성하고 벡터 검색을 사용합니다. |
| `token_count`                 | [`Int32`](/sql-reference/data-types/int-uint)                    | 토큰 수를 수동으로 계산하기 위해 수집 중에 사용합니다 e.g. `length(tokens())` 함수 e.g. 물리화된 열에서 |
| `dense_vector`                | [`Array(Float32)`](/sql-reference/data-types/array)            | 임베딩 저장을 위한 배열 사용 |
| `sparse_vector`               | [`Map(UInt32, Float32)`](/sql-reference/data-types/map)      | 맵을 사용하여 스파스 벡터를 시뮬레이션합니다. 기본 스파스 벡터 지원이 없습니다. |
| `rank_feature` / `rank_features` | [`Float32`](/sql-reference/data-types/float), [`Array(Float32)`](/sql-reference/data-types/array) | 기본 쿼리 시간 부스트가 없지만, 스코어링 로직에서 수동으로 모델링할 수 있습니다. |
| `geo_point`                   | [`Tuple(Float64, Float64)`](/sql-reference/data-types/tuple) or [`Point`](/sql-reference/data-types/geo#point) | (위도, 경도) 튜플을 사용합니다. [`Point`](/sql-reference/data-types/geo#point)는 ClickHouse 타입으로 사용 가능합니다. |
| `geo_shape`, `shape`          | [`Ring`](/sql-reference/data-types/geo#ring), [`LineString`](/sql-reference/data-types/geo#linestring), [`MultiLineString`](/sql-reference/data-types/geo#multilinestring), [`Polygon`](/sql-reference/data-types/geo#polygon), [`MultiPolygon`](/sql-reference/data-types/geo#multipolygon)                          | 지리 도형 및 공간 인덱싱에 대한 기본 지원이 있습니다. |
| `percolator`                  | NA                           | 쿼리를 색인화하는 개념이 없습니다. 대신 표준 SQL + 증가 물리화된 뷰를 사용합니다. |
| `version`                     | [`String`](/sql-reference/data-types/string)                    | ClickHouse에는 기본 버전 타입이 없습니다. 문자열로 버전을 저장하고 필요한 경우 의미론적 비교를 수행하기 위해 사용자 정의 UDF를 사용합니다. 범위 쿼리가 필요한 경우 숫자 형식으로 정규화하는 것을 고려하십시오. |

### Notes {#notes}

- **배열**: Elasticsearch에서는 모든 필드가 네이티브로 배열을 지원합니다. ClickHouse에서는 배열이 명시적으로 정의되어야 합니다 (예: `Array(String)`), 이를 통해 특정 위치에 접근하고 쿼리할 수 있습니다 e.g. `an_array[1]`.
- **다중 필드**: Elasticsearch는 [동일한 필드를 여러 방법으로 인덱싱](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/multi-fields#_multi_fields_with_multiple_analyzers)할 수 있습니다 (예: `text` 및 `keyword`). ClickHouse에서는 이 패턴을 별도의 열 또는 뷰를 사용하여 모델링해야 합니다.
- **맵 및 JSON 유형** - ClickHouse에서 [`Map`](/sql-reference/data-types/map) 유형은 `resourceAttributes` 및 `logAttributes`와 같은 동적 키-값 구조를 모델링하는 데 일반적으로 사용됩니다. 이 유형은 임의의 키를 런타임에 추가할 수 있게 하여 스키마 없는 유연한 수집을 가능하게 합니다 — Elasticsearch의 JSON 객체와 유사합니다. 그러나 고려해야 할 중요한 제한 사항이 있습니다:

  - **일관된 값 유형**: ClickHouse의 [`Map`](/sql-reference/data-types/map) 열은 일관된 값 유형을 가져야 합니다 (예: `Map(String, String)`). 혼합형 값을 강제하지 않고 사용할 수 없습니다.
  - **성능 비용**: [`Map`](/sql-reference/data-types/map)에서 어떤 키에 접근하는 것은 전체 맵을 메모리에 로드해야 하며, 이는 성능에 최적이 아닐 수 있습니다.
  - **하위 열 없음**: JSON과 달리 [`Map`](/sql-reference/data-types/map)에서의 키는 실제 하위 열로 표현되지 않아 ClickHouse의 인덱싱, 압축 및 효율적인 쿼리 기능이 제한됩니다.

  이러한 제한으로 인해 ClickStack은 동적 속성 필드에서 ClickHouse의 향상된 [`JSON`](/sql-reference/data-types/newjson) 유형으로 [`Map`](/sql-reference/data-types/map)에서 마이그레이션하고 있습니다. [`JSON`](/sql-reference/data-types/newjson) 유형은 `Map`의 많은 단점을 해결합니다:

  - **진정한 컬럼형 스토리지**: 각 JSON 경로가 하위 열로 저장되어 효율적인 압축, 필터링 및 벡터화된 쿼리 실행을 가능하게 합니다.
  - **혼합형 지원**: 서로 다른 데이터 유형(예: 정수, 문자열, 배열)이 동일한 경로에서 강제 변환 없이 공존할 수 있습니다.
  - **파일 시스템 확장성**: 동적 키(`max_dynamic_paths`) 및 유형(`max_dynamic_types`)에 대한 내부 제한이 있어 디스크의 열 파일 폭발을 방지합니다, 높은 카디널리티 키 집합을 가지고 있더라도.
  - **조밀한 저장**: 널 및 누락된 값이 불필요한 오버헤드를 피하기 위해 스파스하게 저장됩니다.

    [`JSON`](/sql-reference/data-types/newjson) 유형은 관찰 가능성 작업에 특히 적합하며, 스키마 없는 수집의 유연성과 네이티브 ClickHouse 유형의 성능 및 확장성을 제공하여 [`Map`](/sql-reference/data-types/map)의 이상적인 대체품이 됩니다.

    JSON 유형에 대한 자세한 내용은 [JSON 가이드](https://clickhouse.com/docs/integrations/data-formats/json/overview)와 ["ClickHouse를 위한 새로운 강력한 JSON 데이터 유형을 구축한 방법"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)를 권장합니다.
