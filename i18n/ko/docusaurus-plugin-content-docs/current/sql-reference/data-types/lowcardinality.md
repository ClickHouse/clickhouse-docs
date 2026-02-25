---
description: '문자열 컬럼을 위한 LowCardinality 최적화 문서'
sidebar_label: 'LowCardinality(T)'
sidebar_position: 42
slug: /sql-reference/data-types/lowcardinality
title: 'LowCardinality(T)'
doc_type: 'reference'
---

# LowCardinality(T) \{#lowcardinalityt\}

다른 데이터 타입의 내부 표현을 딕셔너리 인코딩된 형태로 변경합니다.

## 구문 \{#syntax\}

```sql
LowCardinality(data_type)
```

**매개변수**

* `data_type` — [String](../../sql-reference/data-types/string.md), [FixedString](../../sql-reference/data-types/fixedstring.md), [Date](../../sql-reference/data-types/date.md), [DateTime](../../sql-reference/data-types/datetime.md), 그리고 [Decimal](../../sql-reference/data-types/decimal.md)을 제외한 숫자형 데이터. `LowCardinality`는 일부 데이터 타입에서는 효율적이지 않습니다. 자세한 내용은 [allow&#95;suspicious&#95;low&#95;cardinality&#95;types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 설정 설명을 참조하십시오.


## Description \{#description\}

`LowCardinality`는 데이터 저장 방식과 데이터 처리 규칙을 변경하는 상위 구조입니다. ClickHouse는 `LowCardinality`-컬럼에 [dictionary coding](https://en.wikipedia.org/wiki/Dictionary_coder)을 적용합니다. 딕셔너리로 인코딩된 데이터를 사용하면 많은 애플리케이션에서 [SELECT](../../sql-reference/statements/select/index.md) 쿼리의 성능이 크게 향상됩니다.

`LowCardinality` 데이터 타입의 효율성은 데이터의 고유 값 개수에 따라 달라집니다. 딕셔너리에 서로 다른 값이 10,000개 미만이면 ClickHouse는 대체로 데이터 읽기 및 저장 측면에서 더 높은 효율성을 보입니다. 딕셔너리에 서로 다른 값이 100,000개를 초과하면 일반적인 데이터 타입을 사용할 때와 비교해 ClickHouse의 성능이 더 나빠질 수 있습니다.

문자열을 처리할 때 [Enum](../../sql-reference/data-types/enum.md) 대신 `LowCardinality` 사용을 고려하십시오. `LowCardinality`는 사용 측면에서 더 높은 유연성을 제공하며, 동일하거나 더 높은 효율성을 보이는 경우가 많습니다.

## 예시 \{#example\}

다음과 같이 `LowCardinality` 컬럼을 갖는 테이블을 생성합니다:

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```


## 관련 설정 및 함수 \{#related-settings-and-functions\}

Settings:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

Functions:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#toLowCardinality)

## 관련 콘텐츠 \{#related-content\}

- 블로그: [스키마와 코덱으로 ClickHouse 최적화하기](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 블로그: [ClickHouse에서 시계열 데이터 다루기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [문자열 최적화(러시아어 동영상 발표)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt). [영어 슬라이드 자료](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)