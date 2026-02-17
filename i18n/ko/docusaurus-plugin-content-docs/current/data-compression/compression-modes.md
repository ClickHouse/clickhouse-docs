---
slug: /data-compression/compression-modes
sidebar_position: 6
title: '압축 모드'
description: 'ClickHouse 컬럼 압축 모드'
keywords: ['압축', '코덱', '인코딩', '모드']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 압축 모드 \{#compression-modes\}

ClickHouse 프로토콜은 체크섬을 포함한 **데이터 블록** 압축을 지원합니다.
어떤 모드를 선택해야 할지 잘 모르겠다면 `LZ4`를 사용하십시오.
``
:::tip
사용 가능한 [컬럼 압축 코덱](/sql-reference/statements/create/table#column_compression_codec)에 대해 자세히 확인한 후, 테이블을 생성할 때 또는 생성한 이후에 지정하십시오.
:::

## 모드 \{#modes\}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 압축 없음, 체크섬만 사용                 |
| `0x82` | LZ4                | 매우 빠르며, 압축 효율도 우수함         |
| `0x90` | ZSTD               | Zstandard, 상당히 빠르고 압축률이 가장 좋음 |

LZ4와 ZSTD는 동일한 저자가 만들었지만, 서로 다른 장단점을 가집니다.
[Facebook benchmarks](https://facebook.github.io/zstd/#benchmarks) 결과에 따르면:

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## Block \{#block\}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | (header + compressed data)의 [해시(Hash)](../native-protocol/hash.md) |
| raw_size        | uint32  | 헤더를 제외한 원시 크기                          |
| data_size       | uint32  | 압축 해제된 데이터 크기                          |
| mode            | byte    | 압축 모드                                       |
| compressed_data | binary  | 압축된 데이터 블록                              |

<Image img={CompressionBlock} size="md" alt="ClickHouse 압축 블록 구조를 나타내는 다이어그램"/>

헤더는 (raw_size + data_size + mode)로 구성되며, raw_size는 len(header + compressed_data)의 길이입니다.

Checksum은 [ClickHouse CityHash](../native-protocol/hash.md)를 사용하여 `hash(header + compressed_data)`로 계산됩니다.

## None 모드 \{#none-mode\}

*None* 모드를 사용하면 `compressed_data`는 원본 데이터와 동일합니다.
압축을 사용하지 않는 이 모드는 해시 계산 오버헤드가 거의 무시할 수 있는 수준이므로,
체크섬을 통해 데이터 무결성을 추가로 검증하는 데 유용합니다.