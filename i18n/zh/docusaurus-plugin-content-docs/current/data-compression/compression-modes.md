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
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';

# 压缩模式

ClickHouse 协议支持 **数据块** 的压缩和校验和。 
如果不确定选择哪个模式，请使用 `LZ4`。

:::tip
了解有关 [列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec) 的更多信息，并在创建表时或之后指定它们。
:::

## 模式 {#modes}

| 值     | 名称               | 描述                                      |
|--------|--------------------|-------------------------------------------|
| `0x02` | [无](#none-mode)   | 无压缩，仅有校验和                         |
| `0x82` | LZ4                | 极快，良好的压缩效果                       |
| `0x90` | ZSTD               | Zstandard，速度较快，最佳压缩效果         |

LZ4 和 ZSTD 都由同一作者创建，但具有不同的权衡。 
根据 [Facebook 基准测试](https://facebook.github.io/zstd/#benchmarks):

| 名称                     | 比率  | 编码      | 解码         |
|-------------------------|-------|-----------|--------------|
| **zstd** 1.4.5 -1      | 2.8   | 500 MB/s  | 1660 MB/s    |
| **lz4** 1.9.2          | 2.1   | 740 MB/s  | 4530 MB/s    |

## 块 {#block}

| 字段              | 类型     | 描述                                                           |
|-------------------|----------|----------------------------------------------------------------|
| checksum           | uint128  | [哈希](../native-protocol/hash.md) (header + compressed data) |
| raw_size           | uint32   | 无头部的原始大小                                               |
| data_size          | uint32   | 解压后的数据大小                                               |
| mode               | byte     | 压缩模式                                                       |
| compressed_data    | binary   | 压缩数据块                                                   |

<Image img={CompressionBlock} size="md" alt="说明 ClickHouse 压缩块结构的图表"/>

头部是 (raw_size + data_size + mode)，原始大小由 len(header + compressed_data) 组成。

校验和是 `hash(header + compressed_data)`，使用 [ClickHouse CityHash](../native-protocol/hash.md)。

## 无模式 {#none-mode}

如果使用 *无* 模式，则 `compressed_data` 等于原始数据。 
无压缩模式对于通过校验和确保额外的数据完整性是有用的，因为哈希开销是微不足道的。
