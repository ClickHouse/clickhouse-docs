---
slug: /data-compression/compression-modes
sidebar_position: 6
title: 压缩模式
description: ClickHouse 列压缩模式
keywords: ['compression', 'codec', 'encoding', 'modes']
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';


# 压缩模式

ClickHouse 协议支持带有校验和的 **数据块** 压缩。
如果不确定选择哪种模式，请使用 `LZ4`。

:::tip
了解更多关于可用的 [列压缩编码器](/sql-reference/statements/create/table#column_compression_codec)，并在创建表时或之后指定它们。
:::

## 模式 {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 不压缩，仅有校验和                       |
| `0x82` | LZ4                | 极快，良好的压缩效果                     |
| `0x90` | ZSTD               | Zstandard，相当快，最佳压缩效果          |

LZ4 和 ZSTD 的作者相同，但有不同的权衡。
根据 [Facebook 基准测试](https://facebook.github.io/zstd/#benchmarks)：

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## 块 {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [Hash](../native-protocol/hash.md) of (header + compressed data) |
| raw_size        | uint32  | 原始大小（不含头部信息）                         |
| data_size       | uint32  | 解压后的数据大小                                 |
| mode            | byte    | 压缩模式                                         |
| compressed_data | binary  | 压缩数据块                                       |

<img src={CompressionBlock} alt="展示 ClickHouse 压缩块结构的图示" />

头部是 (raw_size + data_size + mode)，原始大小由 len(header + compressed_data) 组成。

校验和是 `hash(header + compressed_data)`，使用 [ClickHouse CityHash](../native-protocol/hash.md)。

## 无压缩模式 {#none-mode}

如果使用 *None* 模式，`compressed_data` 等于原始数据。
无压缩模式在确保数据完整性方面是有用的，因为其校验和开销可以忽略不计。
