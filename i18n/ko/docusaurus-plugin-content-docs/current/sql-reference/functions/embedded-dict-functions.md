---
'description': '내장 딕셔너리로 작업하는 함수에 대한 Documentation'
'sidebar_label': 'Embedded dictionary'
'slug': '/sql-reference/functions/ym-dict-functions'
'title': '내장 딕셔너리로 작업하는 함수'
'doc_type': 'reference'
---


# Embedded 딕셔너리와 작업하기 위한 함수

:::note
아래 함수들이 작동하기 위해서는 서버 구성에서 모든 임베디드 딕셔너리를 가져오기 위한 경로와 주소를 지정해야 합니다. 이러한 딕셔너리는 이 함수들 중 하나가 처음 호출될 때 로드됩니다. 참조 리스트를 로드할 수 없는 경우, 예외가 발생합니다.

따라서 이 섹션에 보여지는 예제는 먼저 구성하지 않으면 기본적으로 [ClickHouse Fiddle](https://fiddle.clickhouse.com/) 및 빠른 릴리스와 프로덕션 배포에서 예외를 발생시킵니다.
:::

참조 리스트를 생성하는 방법에 대한 정보는 ["Dictionaries"](../dictionaries#embedded-dictionaries) 섹션을 참조하십시오.

## 다중 지리 정보 {#multiple-geobases}

ClickHouse는 특정 지역이 속하는 국가에 대한 다양한 관점을 지원하기 위해 여러 대체 지리 정보를 동시에 처리하는 것을 지원합니다.

'clickhouse-server' 구성은 지역 계층이 포함된 파일을 지정합니다:

```<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>```

Besides this file, it also searches for files nearby that have the `_` symbol and any suffix appended to the name (before the file extension).
For example, it will also find the file `/opt/geo/regions_hierarchy_ua.txt`, if present. Here `ua` is called the dictionary key. For a dictionary without a suffix, the key is an empty string.

All the dictionaries are re-loaded during runtime (once every certain number of seconds, as defined in the [`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) config parameter, or once an hour by default). However, the list of available dictionaries is defined once, when the server starts.

All functions for working with regions have an optional argument at the end – the dictionary key. It is referred to as the geobase.

Example:

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName {#regiontoname}

지역 ID 및 지리 정보를 받아 해당 언어로 된 지역 이름의 문자열을 반환합니다. 지정된 ID의 지역이 존재하지 않으면 빈 문자열을 반환합니다.

**구문**

```sql
regionToName(id\[, lang\])
```
**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- `geobase`로 지정된 해당 언어에서 지역의 이름. [String](../data-types/string).
- 그렇지 않으면 빈 문자열입니다. 

**예제**

쿼리:

```sql
SELECT regionToName(number::UInt32,'en') FROM numbers(0,5);
```

결과:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┐
│                                            │
│ World                                      │
│ USA                                        │
│ Colorado                                   │
│ Boulder County                             │
└────────────────────────────────────────────┘
```

### regionToCity {#regiontocity}

지리 정보에서 지역 ID를 받아들입니다. 이 지역이 도시 또는 도시의 일부인 경우, 해당 도시의 지역 ID를 반환합니다. 그렇지 않은 경우, 0을 반환합니다.

**구문**

```sql
regionToCity(id [, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 해당 도시의 지역 ID, 존재하는 경우. [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCity(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

결과:

```response
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCity(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                          │
│ World                                      │  0 │                                                          │
│ USA                                        │  0 │                                                          │
│ Colorado                                   │  0 │                                                          │
│ Boulder County                             │  0 │                                                          │
│ Boulder                                    │  5 │ Boulder                                                  │
│ China                                      │  0 │                                                          │
│ Sichuan                                    │  0 │                                                          │
│ Chengdu                                    │  8 │ Chengdu                                                  │
│ America                                    │  0 │                                                          │
│ North America                              │  0 │                                                          │
│ Eurasia                                    │  0 │                                                          │
│ Asia                                       │  0 │                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────┘
```

### regionToArea {#regiontoarea}

지역을 지역(지리 정보에서 유형 5)으로 변환합니다. 이 함수는 ['regionToCity'](#regiontocity)와 동일합니다.

**구문**

```sql
regionToArea(id [, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 해당 지역의 지역 ID, 존재하는 경우. [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT DISTINCT regionToName(regionToArea(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

결과:

```text
┌─regionToName(regionToArea(toUInt32(number), \'ua\'))─┐
│                                                      │
│ Moscow and Moscow region                             │
│ St. Petersburg and Leningrad region                  │
│ Belgorod region                                      │
│ Ivanovsk region                                      │
│ Kaluga region                                        │
│ Kostroma region                                      │
│ Kursk region                                         │
│ Lipetsk region                                       │
│ Orlov region                                         │
│ Ryazan region                                        │
│ Smolensk region                                      │
│ Tambov region                                        │
│ Tver region                                          │
│ Tula region                                          │
└──────────────────────────────────────────────────────┘
```

### regionToDistrict {#regiontodistrict}

지역을 연방 지구(지리 정보에서 유형 4)로 변환합니다. 이 함수는 'regionToCity'와 동일합니다.

**구문**

```sql
regionToDistrict(id [, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 해당 도시의 지역 ID, 존재하는 경우. [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT DISTINCT regionToName(regionToDistrict(toUInt32(number), 'ua'))
FROM system.numbers
LIMIT 15
```

결과:

```text
┌─regionToName(regionToDistrict(toUInt32(number), \'ua\'))─┐
│                                                          │
│ Central federal district                                 │
│ Northwest federal district                               │
│ South federal district                                   │
│ North Caucases federal district                          │
│ Privolga federal district                                │
│ Ural federal district                                    │
│ Siberian federal district                                │
│ Far East federal district                                │
│ Scotland                                                 │
│ Faroe Islands                                            │
│ Flemish region                                           │
│ Brussels capital region                                  │
│ Wallonia                                                 │
│ Federation of Bosnia and Herzegovina                     │
└──────────────────────────────────────────────────────────┘
```

### regionToCountry {#regiontocountry}

지역을 국가(지리 정보에서 유형 3)로 변환합니다. 이 함수는 'regionToCity'와 동일합니다.

**구문**

```sql
regionToCountry(id [, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 해당 국가의 지역 ID, 존재하는 경우. [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToCountry(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

결과:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToCountry(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                             │
│ World                                      │  0 │                                                             │
│ USA                                        │  2 │ USA                                                         │
│ Colorado                                   │  2 │ USA                                                         │
│ Boulder County                             │  2 │ USA                                                         │
│ Boulder                                    │  2 │ USA                                                         │
│ China                                      │  6 │ China                                                       │
│ Sichuan                                    │  6 │ China                                                       │
│ Chengdu                                    │  6 │ China                                                       │
│ America                                    │  0 │                                                             │
│ North America                              │  0 │                                                             │
│ Eurasia                                    │  0 │                                                             │
│ Asia                                       │  0 │                                                             │
└────────────────────────────────────────────┴────┴─────────────────────────────────────────────────────────────┘
```

### regionToContinent {#regiontocontinent}

지역을 대륙(지리 정보에서 유형 1)으로 변환합니다. 이 함수는 'regionToCity'와 동일합니다.

**구문**

```sql
regionToContinent(id [, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 해당 대륙의 지역 ID, 존재하는 경우. [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

결과:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                               │
│ World                                      │  0 │                                                               │
│ USA                                        │ 10 │ North America                                                 │
│ Colorado                                   │ 10 │ North America                                                 │
│ Boulder County                             │ 10 │ North America                                                 │
│ Boulder                                    │ 10 │ North America                                                 │
│ China                                      │ 12 │ Asia                                                          │
│ Sichuan                                    │ 12 │ Asia                                                          │
│ Chengdu                                    │ 12 │ Asia                                                          │
│ America                                    │  9 │ America                                                       │
│ North America                              │ 10 │ North America                                                 │
│ Eurasia                                    │ 11 │ Eurasia                                                       │
│ Asia                                       │ 12 │ Asia                                                          │
└────────────────────────────────────────────┴────┴───────────────────────────────────────────────────────────────┘
```

### regionToTopContinent {#regiontotopcontinent}

지역에 대한 계층 구조에서 가장 높은 대륙을 찾습니다.

**구문**

```sql
regionToTopContinent(id[, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 최상위 대륙의 식별자 (지역의 계층 구조를 올라갈 때). [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToTopContinent(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

결과:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─id─┬─regionToName(regionToTopContinent(CAST(number, 'UInt32')), 'en')─┐
│                                            │  0 │                                                                  │
│ World                                      │  0 │                                                                  │
│ USA                                        │  9 │ America                                                          │
│ Colorado                                   │  9 │ America                                                          │
│ Boulder County                             │  9 │ America                                                          │
│ Boulder                                    │  9 │ America                                                          │
│ China                                      │ 11 │ Eurasia                                                          │
│ Sichuan                                    │ 11 │ Eurasia                                                          │
│ Chengdu                                    │ 11 │ Eurasia                                                          │
│ America                                    │  9 │ America                                                          │
│ North America                              │  9 │ America                                                          │
│ Eurasia                                    │ 11 │ Eurasia                                                          │
│ Asia                                       │ 11 │ Eurasia                                                          │
└────────────────────────────────────────────┴────┴──────────────────────────────────────────────────────────────────┘
```

### regionToPopulation {#regiontopopulation}

지역의 인구를 가져옵니다. 인구는 지리 정보가 포함된 파일에 기록될 수 있습니다. ["Dictionaries"](../dictionaries#embedded-dictionaries) 섹션을 참조하십시오. 지역에 대해 인구가 기록되지 않은 경우 0을 반환합니다. 지리 정보에서 인구는 자식 지역에 대해 기록될 수 있지만 부모 지역에 대해서는 기록되지 않을 수 있습니다.

**구문**

```sql
regionToPopulation(id[, geobase])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 지역의 인구. [UInt32](../data-types/int-uint).
- 존재하지 않으면 0.

**예제**

쿼리:

```sql
SELECT regionToName(number::UInt32, 'en'), regionToPopulation(number::UInt32) AS id, regionToName(id, 'en') FROM numbers(13);
```

결과:

```text
┌─regionToName(CAST(number, 'UInt32'), 'en')─┬─population─┐
│                                            │          0 │
│ World                                      │ 4294967295 │
│ USA                                        │  330000000 │
│ Colorado                                   │    5700000 │
│ Boulder County                             │     330000 │
│ Boulder                                    │     100000 │
│ China                                      │ 1500000000 │
│ Sichuan                                    │   83000000 │
│ Chengdu                                    │   20000000 │
│ America                                    │ 1000000000 │
│ North America                              │  600000000 │
│ Eurasia                                    │ 4294967295 │
│ Asia                                       │ 4294967295 │
└────────────────────────────────────────────┴────────────┘
```

### regionIn {#regionin}

`lhs` 지역이 `rhs` 지역에 속하는지 확인합니다. 속하면 1과 같은 UInt8 숫자를 반환하고, 속하지 않으면 0을 반환합니다.

**구문**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**매개변수**

- `lhs` — 지리 정보에서 Lhs 지역 ID. [UInt32](../data-types/int-uint).
- `rhs` — 지리 정보에서 Rhs 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 속하는 경우 1. [UInt8](../data-types/int-uint).
- 속하지 않으면 0.

**구현 세부정보**

관계는 반사적입니다 – 어떤 지역도 자신에게 속합니다.

**예제**

쿼리:

```sql
SELECT regionToName(n1.number::UInt32, 'en') || (regionIn(n1.number::UInt32, n2.number::UInt32) ? ' is in ' : ' is not in ') || regionToName(n2.number::UInt32, 'en') FROM numbers(1,2) AS n1 CROSS JOIN numbers(1,5) AS n2;
```

결과:

```text
World is in World
World is not in USA
World is not in Colorado
World is not in Boulder County
World is not in Boulder
USA is in World
USA is in USA
USA is not in Colorado
USA is not in Boulder County
USA is not in Boulder    
```

### regionHierarchy {#regionhierarchy}

지리 정보에서 지역 ID인 UInt32 숫자를 받아들입니다. 전달된 지역과 체인에 따라 모든 부모로 구성된 지역 ID의 배열을 반환합니다.

**구문**

```sql
regionHierarchy(id\[, geobase\])
```

**매개변수**

- `id` — 지리 정보에서 지역 ID. [UInt32](../data-types/int-uint).
- `geobase` — 딕셔너리 키. [다중 지리 정보](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

- 전달된 지역과 체인에 따라 모든 부모로 구성된 지역 ID의 배열. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**예제**

쿼리:

```sql
SELECT regionHierarchy(number::UInt32) AS arr, arrayMap(id -> regionToName(id, 'en'), arr) FROM numbers(5);
```

결과:

```text
┌─arr────────────┬─arrayMap(lambda(tuple(id), regionToName(id, 'en')), regionHierarchy(CAST(number, 'UInt32')))─┐
│ []             │ []                                                                                           │
│ [1]            │ ['World']                                                                                    │
│ [2,10,9,1]     │ ['USA','North America','America','World']                                                    │
│ [3,2,10,9,1]   │ ['Colorado','USA','North America','America','World']                                         │
│ [4,3,2,10,9,1] │ ['Boulder County','Colorado','USA','North America','America','World']                        │
└────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
