---
'slug': '/data-compression/compression-modes'
'sidebar_position': 6
'title': '압축 모드'
'description': 'ClickHouse 컬럼 압축 모드'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
- 'modes'
'doc_type': 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 압축 모드

ClickHouse 프로토콜은 **데이터 블록**의 압축과 체크섬을 지원합니다. 어떤 모드를 선택해야 할지 확실치 않다면 `LZ4`를 사용하세요.

:::tip
사용 가능한 [컬럼 압축 코덱](../../sql-reference/statements/create/table#column_compression_codec)에 대해 더 알아보고, 테이블을 생성할 때 또는 그 후에 지정하세요.
:::

## 모드 {#modes}

| 값    | 이름                | 설명                                      |
|-------|---------------------|---------------------------------------------|
| `0x02` | [없음](#none-mode)  | 압축 없음, 오직 체크섬만                   |
| `0x82` | LZ4                 | 매우 빠르고, 좋은 압축 성능                |
| `0x90` | ZSTD                | Zstandard, 꽤 빠르고, 최고의 압축 성능     |

LZ4와 ZSTD는 동일한 저자에 의해 만들어졌지만, 각기 다른 트레이드오프를 가지고 있습니다. [Facebook 벤치마크](https://facebook.github.io/zstd/#benchmarks)에서:

| 이름                | 비율  | 인코딩   | 디코딩    |
|---------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1   | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2       | 2.1   | 740 MB/s | 4530 MB/s |

## 블록 {#block}

| 필드              | 타입      | 설명                                                    |
|-------------------|-----------|-------------------------------------------------------|
| 체크섬            | uint128   | (헤더 + 압축 데이터)의 [해시](../native-protocol/hash.md)  |
| 원본 크기         | uint32    | 헤더를 제외한 원본 크기                                 |
| 데이터 크기       | uint32    | 압축되지 않은 데이터 크기                               |
| 모드              | byte      | 압축 모드                                             |
| 압축 데이터       | binary    | 압축된 데이터 블록                                     |

<Image img={CompressionBlock} size="md" alt="ClickHouse 압축 블록 구조를 설명하는 그림"/>

헤더는 (원본 크기 + 데이터 크기 + 모드)로 구성되며, 원본 크기는 len(헤더 + 압축 데이터)로 구성됩니다.

체크섬은 `hash(헤더 + 압축 데이터)`이며, [ClickHouse CityHash](../native-protocol/hash.md)를 사용합니다.

## 없음 모드 {#none-mode}

*없음* 모드가 사용되면 `압축 데이터`는 원래 데이터와 동일합니다. 압축 모드가 없으면 체크섬을 통해 추가적인 데이터 무결성을 보장하는 데 유용한데, 해싱 오버헤드는 무시할 수 있을 정도로 작기 때문입니다.
