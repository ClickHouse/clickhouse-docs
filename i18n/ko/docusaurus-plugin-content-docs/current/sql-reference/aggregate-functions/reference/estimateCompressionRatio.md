---
'description': '주어진 컬럼의 압축 비율을 압축하지 않고 추정합니다.'
'sidebar_position': 132
'slug': '/sql-reference/aggregate-functions/reference/estimateCompressionRatio'
'title': 'estimateCompressionRatio'
'doc_type': 'reference'
---

## estimateCompressionRatio {#estimatecompressionration}

주어진 컬럼의 압축 비율을 압축하지 않고 추정합니다.

**구문**

```sql
estimateCompressionRatio(codec, block_size_bytes)(column)
```

**인수**

- `column` - 임의의 유형의 컬럼

**매개변수**

- `codec` - [문자열](../../../sql-reference/data-types/string.md)로, [압축 코덱](/sql-reference/statements/create/table#column_compression_codec) 또는 여러 개의 쉼표로 구분된 코덱이 포함된 단일 문자열.
- `block_size_bytes` - 압축 데이터의 블록 크기. 이는 [`max_compress_block_size`](../../../operations/settings/merge-tree-settings.md#max_compress_block_size)와 [`min_compress_block_size`](../../../operations/settings/merge-tree-settings.md#min_compress_block_size) 두 가지를 설정하는 것과 유사합니다. 기본값은 1 MiB (1048576 바이트)입니다.

두 매개변수는 선택 사항입니다.

**반환 값**

- 주어진 컬럼에 대한 추정 압축 비율을 반환합니다.

유형: [Float64](/sql-reference/data-types/float).

**예제**

```sql title="Input table"
CREATE TABLE compression_estimate_example
(
    `number` UInt64
)
ENGINE = MergeTree()
ORDER BY number
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO compression_estimate_example
SELECT number FROM system.numbers LIMIT 100_000;
```

```sql title="Query"
SELECT estimateCompressionRatio(number) AS estimate FROM compression_estimate_example;
```

```text title="Response"
┌───────────estimate─┐
│ 1.9988506608699999 │
└────────────────────┘
```

:::note
위 결과는 서버의 기본 압축 코덱에 따라 다를 수 있습니다. [컬럼 압축 코덱](/sql-reference/statements/create/table#column_compression_codec)을 참조하세요.
:::

```sql title="Query"
SELECT estimateCompressionRatio('T64')(number) AS estimate FROM compression_estimate_example;
```

```text title="Response"
┌──────────estimate─┐
│ 3.762758101688538 │
└───────────────────┘
```

함수는 여러 개의 코덱을 지정할 수도 있습니다:

```sql title="Query"
SELECT estimateCompressionRatio('T64, ZSTD')(number) AS estimate FROM compression_estimate_example;
```

```response title="Response"
┌───────────estimate─┐
│ 143.60078980434392 │
└────────────────────┘
```
