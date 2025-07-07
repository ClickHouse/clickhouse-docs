---
'slug': '/data-compression/compression-modes'
'sidebar_position': 6
'title': '压缩模式'
'description': 'ClickHouse 列 压缩模式'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
- 'modes'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 压缩模式

ClickHouse 协议支持 **数据块** 的压缩和校验和。
如果不确定选择哪个模式，请使用 `LZ4`。

:::tip
了解更多关于可用的 [列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)，并在创建表时或之后进行指定。
:::

## 模式 {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 无压缩，只有校验和                        |
| `0x82` | LZ4                | 极其快速，压缩效果良好                    |
| `0x90` | ZSTD               | Zstandard，速度相当快，压缩效果最好         |

LZ4 和 ZSTD 的作者相同，但各自有不同的权衡。
来自 [Facebook 基准测试](https://facebook.github.io/zstd/#benchmarks)：

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## 块 {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [哈希](../native-protocol/hash.md) (header + compressed data) |
| raw_size        | uint32  | 不含头的原始大小                               |
| data_size       | uint32  | 解压缩数据的大小                                |
| mode            | byte    | 压缩模式                                        |
| compressed_data | binary  | 压缩数据块                                      |

<Image img={CompressionBlock} size="md" alt="图示 ClickHouse 压缩块结构"/>

头部为 (raw_size + data_size + mode)，原始大小由 len(header + compressed_data) 组成。

校验和为 `hash(header + compressed_data)`，使用 [ClickHouse CityHash](../native-protocol/hash.md)。

## 无模式 {#none-mode}

如果使用 *None* 模式，`compressed_data` 等于原始数据。
无压缩模式有助于通过校验和确保额外的数据完整性，因为
哈希的开销微不足道。
