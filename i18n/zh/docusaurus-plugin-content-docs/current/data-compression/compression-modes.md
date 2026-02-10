---
slug: /data-compression/compression-modes
sidebar_position: 6
title: '压缩模式'
description: 'ClickHouse 列压缩模式'
keywords: ['压缩', '编解码器', '编码', '模式']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 压缩模式 \{#compression-modes\}

ClickHouse 协议支持对带有校验和的**数据块**进行压缩。
如果不确定选择哪种模式，请使用 `LZ4`。

:::tip
了解更多可用的[列压缩编解码器](/sql-reference/statements/create/table#column_compression_codec)，并在创建表时或之后指定它们。
:::

## 模式 \{#modes\}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None（无压缩）](#none-mode) | 不进行压缩，仅计算校验和           |
| `0x82` | LZ4                | 极快，压缩效果良好         |
| `0x90` | ZSTD               | Zstandard，速度较快，压缩率最高 |

LZ4 和 ZSTD 均由同一位作者开发，但在性能取舍上有所不同。
数据摘自 [Facebook 基准测试](https://facebook.github.io/zstd/#benchmarks)：

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## 块 \{#block\}

| 字段           | 类型    | 说明                                              |
|----------------|---------|---------------------------------------------------|
| checksum        | uint128 | (header + compressed data) 的 [哈希](../native-protocol/hash.md) |
| raw_size        | uint32  | 不包含头部的原始大小                             |
| data_size       | uint32  | 解压后的数据大小                                 |
| mode            | byte    | 压缩模式                                         |
| compressed_data | binary  | 压缩数据块                                       |

<Image img={CompressionBlock} size="md" alt="展示 ClickHouse 压缩块结构的示意图"/>

头部由 (raw_size + data_size + mode) 组成，raw_size 为 len(header + compressed_data)。

Checksum 为 `hash(header + compressed_data)`，使用 [ClickHouse CityHash](../native-protocol/hash.md)。

## None 模式 \{#none-mode\}

如果使用 *None* 模式，`compressed_data` 等于原始数据。
无压缩模式在使用校验和进一步确保数据完整性时很有用，因为
哈希计算的开销可以忽略不计。