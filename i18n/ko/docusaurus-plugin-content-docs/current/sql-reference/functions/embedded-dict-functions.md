---
description: '내장 딕셔너리 작업용 함수 문서'
sidebar_label: '내장 딕셔너리'
slug: /sql-reference/functions/ym-dict-functions
title: '내장 딕셔너리 작업용 함수'
doc_type: 'reference'
---

# 임베디드 딕셔너리 작업용 함수 \{#functions-for-working-with-embedded-dictionaries\}

:::note
아래 함수들이 동작하려면 서버 설정에서 모든 임베디드 딕셔너리를 가져오기 위한 경로와 주소를 지정해야 합니다. 딕셔너리는 이러한 함수들 중 하나가 처음 호출될 때 로드됩니다. 참조 목록을 로드할 수 없으면 예외가 발생합니다.

따라서 이 섹션에 제시된 예제는 필요한 구성을 먼저 수행하지 않으면 [ClickHouse Fiddle](https://fiddle.clickhouse.com/)과 기본 설정 상태의 빠른 배포 및 프로덕션 배포 환경에서 예외를 발생시킵니다.
:::

참조 목록 생성에 대한 정보는 [&quot;Dictionaries&quot;](../statements/create/dictionary/embedded) 섹션을 참조하십시오.

## 다중 지오베이스 \{#multiple-geobases\}

ClickHouse는 여러 개의 대체 지오베이스(지역 계층 구조)를 동시에 사용할 수 있도록 지원하여, 특정 지역이 어느 국가에 속하는지에 대한 다양한 관점을 제공합니다.

&#39;clickhouse-server&#39; 설정에서 지역 계층 구조가 정의된 파일을 지정합니다:

`<path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file>`

이 파일 외에도, 같은 디렉터리에서 파일 이름(확장자 앞)에 `_` 기호와 임의의 접미사가 추가된 파일들을 함께 검색합니다.
예를 들어, `/opt/geo/regions_hierarchy_ua.txt` 파일이 존재하면 이 파일도 함께 찾습니다. 여기서 `ua`는 딕셔너리 키라고 합니다. 접미사가 없는 딕셔너리의 키는 빈 문자열입니다.

모든 딕셔너리는 런타임 중에 주기적으로 다시 로드됩니다([`builtin_dictionaries_reload_interval`](/operations/server-configuration-parameters/settings#builtin_dictionaries_reload_interval) 설정 파라미터에 정의된 초 단위 주기마다, 기본값은 1시간). 다만, 사용 가능한 딕셔너리 목록은 서버가 시작될 때 한 번만 정의됩니다.

지역 관련 작업을 위한 모든 함수는 마지막 인수로 선택적인 딕셔너리 키를 받을 수 있습니다. 이를 지오베이스라고 합니다.

예시:

```sql
regionToCountry(RegionID) – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, '') – Uses the default dictionary: /opt/geo/regions_hierarchy.txt
regionToCountry(RegionID, 'ua') – Uses the dictionary for the 'ua' key: /opt/geo/regions_hierarchy_ua.txt
```

### regionToName

지역 ID와 지오베이스를 입력으로 받아 해당 언어의 지역 이름을 문자열로 반환합니다. 지정된 ID를 가진 지역이 존재하지 않으면 빈 문자열을 반환합니다.

**구문**

```sql
regionToName(id\[, lang\])
```

**매개변수**

* `id` — 지리 데이터베이스(geobase)의 지역 ID입니다. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키입니다. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* `geobase`에서 지정한 해당 언어로 된 지역 이름입니다. [String](../data-types/string).
* 그렇지 않으면 빈 문자열입니다.

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

### regionToCity

지오베이스(geobase)의 지역 ID를 인수로 받습니다. 이 지역이 도시이거나 도시의 일부인 경우 해당 도시에 대한 지역 ID를 반환합니다. 그렇지 않으면 0을 반환합니다.

**구문**

```sql
regionToCity(id [, geobase])
```

**매개변수**

* `id` — 지리 데이터베이스(geobase)의 지역 ID입니다. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키입니다. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 해당 도시가 존재하는 경우, 해당 도시에 대한 지역 ID입니다. [UInt32](../data-types/int-uint).
* 존재하지 않으면 0입니다.

**예시**

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

### regionToArea

지오베이스(geobase)에서 지역을 영역(타입 5)으로 변환합니다. 나머지 동작은 [&#39;regionToCity&#39;](#regiontocity) 함수와 동일합니다.

**구문**

```sql
regionToArea(id [, geobase])
```

**매개변수**

* `id` — 지오베이스의 지역 ID입니다. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키입니다. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 해당 연방 지구가 존재하는 경우 해당 지역 ID입니다. [UInt32](../data-types/int-uint).
* 존재하지 않으면 0을 반환합니다.

**예시**

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

### regionToDistrict

지역을 geobase에서 type 4인 연방 지구로 변환합니다. 그 외의 모든 면에서는 이 함수가 「regionToCity」와 동일하게 동작합니다.

**구문**

```sql
regionToDistrict(id [, geobase])
```

**매개변수**

* `id` — 지리 데이터베이스(geobase)의 지역 ID입니다. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키입니다. [여러 지리 데이터베이스](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 해당 도시가 존재하는 경우 해당 도시의 지역 ID입니다. [UInt32](../data-types/int-uint).
* 존재하지 않으면 0을 반환합니다.

**예시**

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

### regionToCountry

지역을 국가(geobase에서 타입 3)로 변환합니다. 이외의 모든 점에서 이 FUNCTION은 「regionToCity」와 동일합니다.

**구문**

```sql
regionToCountry(id [, geobase])
```

**매개변수**

* `id` — 지오베이스(geobase)의 지역 ID. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 해당 국가에 대응하는 지역 ID(존재하는 경우). [UInt32](../data-types/int-uint).
* 존재하지 않으면 0입니다.

**예시**

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

### regionToContinent

지역을 대륙(geobase에서 타입 1)으로 변환합니다. 이외의 모든 점에서 이 FUNCTION은 「regionToCity」와 동일합니다.

**구문**

```sql
regionToContinent(id [, geobase])
```

**매개변수**

* `id` — geobase의 지역 ID. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 존재하는 경우 해당 대륙의 Region ID입니다. [UInt32](../data-types/int-uint).
* 존재하지 않으면 0입니다.

**예시**

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

### regionToTopContinent

지역 계층 구조에서 최상위 대륙을 찾습니다.

**구문**

```sql
regionToTopContinent(id[, geobase])
```

**매개변수**

* `id` — geobase의 지역 ID. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 최상위 대륙의 식별자(지역 계층을 따라 상위로 올라갔을 때의 값). [UInt32](../data-types/int-uint).
* 해당하는 값이 없으면 0.

**예시**

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

### regionToPopulation

지역의 인구 수를 가져옵니다. 인구 수는 geobase와 함께 제공되는 파일에 기록될 수 있습니다. 「[Dictionaries](../statements/create/dictionary/embedded)」 섹션을 참조하십시오. 지역에 대한 인구 수가 기록되어 있지 않으면 0을 반환합니다. geobase에서는 상위 지역에는 인구 수가 기록되어 있지 않고 하위 지역에만 기록되어 있을 수 있습니다.

**구문**

```sql
regionToPopulation(id[, geobase])
```

**매개변수**

* `id` — geobase의 지역 ID. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항.

**반환 값**

* 해당 지역의 인구. [UInt32](../data-types/int-uint).
* 값이 없으면 0.

**예시**

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

### regionIn

`lhs` 지역이 `rhs` 지역에 속하는지 확인합니다. 속하면 값이 1인 UInt8 숫자를, 속하지 않으면 값이 0인 UInt8 숫자를 반환합니다.

**구문**

```sql
regionIn(lhs, rhs\[, geobase\])
```

**매개변수**

* `lhs` — 지오베이스의 Lhs 지역 ID. [UInt32](../data-types/int-uint).
* `rhs` — 지오베이스의 Rhs 지역 ID. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환값**

* 속해 있으면 1입니다. [UInt8](../data-types/int-uint).
* 속해 있지 않으면 0입니다.

**구현 세부 사항**

이 관계는 반사적(reflexive)입니다. 모든 지역은 자기 자신에도 속합니다.

**예시**

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

### regionHierarchy

입력값으로 UInt32 값을 사용합니다. 입력값은 지오베이스(geobase)의 지역 ID입니다. 전달된 지역과 그 상위 체인에 있는 모든 부모 지역의 지역 ID로 구성된 배열을 반환합니다.

**구문**

```sql
regionHierarchy(id\[, geobase\])
```

**매개변수**

* `id` — 지리 데이터베이스(geobase)의 지역 ID입니다. [UInt32](../data-types/int-uint).
* `geobase` — 딕셔너리 키입니다. [Multiple Geobases](#multiple-geobases)를 참조하십시오. [String](../data-types/string). 선택 사항입니다.

**반환 값**

* 전달된 지역과 그 상위 모든 지역으로 구성된 지역 ID 배열입니다. [Array](../data-types/array)([UInt32](../data-types/int-uint)).

**예시**

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

{/* 
  아래 태그 안의 내용은 문서 프레임워크 빌드 시 
  system.functions에서 생성된 문서로 대체됩니다. 태그를 수정하거나 제거하지 마십시오.
  자세한 내용은 https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md 를 참조하십시오.
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
