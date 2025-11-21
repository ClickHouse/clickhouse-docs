---
slug: /data-compression/compression-modes
sidebar_position: 6
title: '压缩模式'
description: 'ClickHouse 列压缩模式'
keywords: ['compression', 'codec', 'encoding', 'modes']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 压缩模式

ClickHouse 协议支持带校验和的 **数据块** 压缩。
如果不确定选择哪种模式，请使用 `LZ4`。

:::tip
详细了解可用的[列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)，并在创建表时或创建后为表指定这些编解码器。
:::



## 模式 {#modes}

| 值     | 名称               | 描述                                     |
| ------ | ------------------ | ---------------------------------------- |
| `0x02` | [None](#none-mode) | 无压缩,仅校验和                          |
| `0x82` | LZ4                | 极快速度,良好压缩                        |
| `0x90` | ZSTD               | Zstandard,速度较快,最佳压缩              |

LZ4 和 ZSTD 均由同一作者开发,但在性能权衡上有所不同。
来自 [Facebook 基准测试](https://facebook.github.io/zstd/#benchmarks):

| 名称              | 压缩比 | 编码速度 | 解码速度  |
| ----------------- | ------ | -------- | --------- |
| **zstd** 1.4.5 -1 | 2.8    | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1    | 740 MB/s | 4530 MB/s |


## Block {#block}

| field           | type    | description                                                      |
| --------------- | ------- | ---------------------------------------------------------------- |
| checksum        | uint128 | (header + compressed data) 的[哈希值](../native-protocol/hash.md) |
| raw_size        | uint32  | 不含头部的原始大小                                          |
| data_size       | uint32  | 未压缩数据大小                                           |
| mode            | byte    | 压缩模式                                                 |
| compressed_data | binary  | 压缩数据块                                         |

<Image
  img={CompressionBlock}
  size='md'
  alt='展示 ClickHouse 压缩块结构的示意图'
/>

头部为 (raw_size + data_size + mode),原始大小包含 len(header + compressed_data)。

校验和为 `hash(header + compressed_data)`,使用 [ClickHouse CityHash](../native-protocol/hash.md)。


## None 模式 {#none-mode}

如果使用 _None_ 模式,`compressed_data` 等于原始数据。
无压缩模式可用于通过校验和确保额外的数据完整性,因为哈希计算开销微乎其微。
