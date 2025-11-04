---
'slug': '/data-compression/compression-modes'
'sidebar_position': 6
'title': '压缩模式'
'description': 'ClickHouse 列压缩模式'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
- 'modes'
'doc_type': 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 压缩模式

ClickHouse 协议支持带有校验和的 **数据块** 压缩。
如果不确定选择哪种模式，请使用 `LZ4`。

:::tip
了解更多关于 [列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec) 的信息，并在创建表时或之后指定它们。
:::

## 模式 {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 无压缩，仅校验和                           |
| `0x82` | LZ4                | 极快，良好的压缩效果                      |
| `0x90` | ZSTD               | Zstandard，速度较快，压缩效果最佳        |

LZ4 和 ZSTD 由同一作者创建，但各有不同的权衡。
来自 [Facebook 基准测试](https://facebook.github.io/zstd/#benchmarks)：

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## 块 {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [哈希](../native-protocol/hash.md) 值为 (header + 压缩数据) |
| raw_size        | uint32  | 不带头信息的原始大小                            |
| data_size       | uint32  | 未压缩的数据大小                                |
| mode            | byte    | 压缩模式                                        |
| compressed_data | binary  | 压缩数据块                                      |

<Image img={CompressionBlock} size="md" alt="Diagram illustrating ClickHouse compression block structure"/>

头信息为 (raw_size + data_size + mode)，原始大小由 len(header + compressed_data) 组成。

校验和为 `hash(header + compressed_data)`，使用 [ClickHouse CityHash](../native-protocol/hash.md)。

## 无模式 {#none-mode}

如果使用 *None* 模式，`compressed_data` 等于原始数据。
无压缩模式有助于通过校验和确保额外的数据完整性，因为哈希开销微不足道。
