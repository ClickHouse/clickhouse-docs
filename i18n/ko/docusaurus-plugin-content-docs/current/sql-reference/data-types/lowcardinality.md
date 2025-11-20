---
'description': '문서 LowCardinality 최적화에 대한 문자열 컬럼'
'sidebar_label': 'LowCardinality(T)'
'sidebar_position': 42
'slug': '/sql-reference/data-types/lowcardinality'
'title': 'LowCardinality(T)'
'doc_type': 'reference'
---


# LowCardinality(T)

다른 데이터 유형의 내부 표현을 딕셔너리 인코딩으로 변경합니다.

## Syntax {#syntax}

```sql
LowCardinality(data_type)
```

**Parameters**

- `data_type` — [String](../../sql-reference/data-types/string.md), [FixedString](../../sql-reference/data-types/fixedstring.md), [Date](../../sql-reference/data-types/date.md), [DateTime](../../sql-reference/data-types/datetime.md), 및 [Decimal](../../sql-reference/data-types/decimal.md)를 제외한 숫자. `LowCardinality`는 일부 데이터 유형에 대해 비효율적일 수 있으며, [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types) 설정 설명을 참조하십시오.

## Description {#description}

`LowCardinality`는 데이터 저장 방법 및 데이터 처리 규칙을 변경하는 슈퍼구조체입니다. ClickHouse는 `LowCardinality`-컬럼에 [딕셔너리 코딩](https://en.wikipedia.org/wiki/Dictionary_coder)을 적용합니다. 딕셔너리 인코딩된 데이터를 운영하면 많은 응용 프로그램에 대해 [SELECT](../../sql-reference/statements/select/index.md) 쿼리의 성능이 크게 향상됩니다.

`LowCardinality` 데이터 유형 사용의 효율성은 데이터 다양성에 따라 달라집니다. 딕셔너리에 10,000개 미만의 고유 값이 포함된 경우, ClickHouse는 주로 데이터 읽기 및 저장의 효율성이 높습니다. 반면, 딕셔너리에 100,000개 이상의 고유 값이 포함된 경우, ClickHouse는 일반 데이터 유형을 사용할 때보다 성능이 떨어질 수 있습니다.

문자열 작업 시 [Enum](../../sql-reference/data-types/enum.md) 대신 `LowCardinality`를 사용하는 것을 고려하십시오. `LowCardinality`는 사용에 있어 더 많은 유연성을 제공하며, 종종 동일하거나 더 높은 효율성을 드러냅니다.

## Example {#example}

`LowCardinality`-컬럼이 있는 테이블을 생성합니다:

```sql
CREATE TABLE lc_t
(
    `id` UInt16,
    `strings` LowCardinality(String)
)
ENGINE = MergeTree()
ORDER BY id
```

## Related Settings and Functions {#related-settings-and-functions}

Settings:

- [low_cardinality_max_dictionary_size](../../operations/settings/settings.md#low_cardinality_max_dictionary_size)
- [low_cardinality_use_single_dictionary_for_part](../../operations/settings/settings.md#low_cardinality_use_single_dictionary_for_part)
- [low_cardinality_allow_in_native_format](../../operations/settings/settings.md#low_cardinality_allow_in_native_format)
- [allow_suspicious_low_cardinality_types](../../operations/settings/settings.md#allow_suspicious_low_cardinality_types)
- [output_format_arrow_low_cardinality_as_dictionary](/operations/settings/formats#output_format_arrow_low_cardinality_as_dictionary)

Functions:

- [toLowCardinality](../../sql-reference/functions/type-conversion-functions.md#tolowcardinality)

## Related content {#related-content}

- Blog: [ClickHouse 최적화하기 위한 스키마 및 코덱](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- Blog: [ClickHouse에서 시계열 데이터 작업하기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- [문자열 최적화 (러시아어 비디오 발표)](https://youtu.be/rqf-ILRgBdY?list=PL0Z2YDlm0b3iwXCpEFiOOYmwXzVmjJfEt). [영어 슬라이드](https://github.com/ClickHouse/clickhouse-presentations/raw/master/meetup19/string_optimization.pdf)
