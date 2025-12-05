---
slug: /data-compression/compression-modes
sidebar_position: 6
title: '圧縮モード'
description: 'ClickHouse のカラム圧縮モード'
keywords: ['compression', 'codec', 'encoding', 'modes']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';

# 圧縮モード {#compression-modes}

ClickHouse プロトコルは、チェックサム付きの **データブロック** の圧縮をサポートしています。
どのモードを選ぶべきか迷う場合は、`LZ4` を使用してください。

:::tip
利用可能な [カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec) について詳しく確認し、テーブル作成時または作成後にそれらを指定してください。
:::

## モード {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 圧縮なし、チェックサムのみ               |
| `0x82` | LZ4                | 非常に高速で、良好な圧縮率               |
| `0x90` | ZSTD               | Zstandard。比較的高速で、圧縮率が最も高い |

LZ4 と ZSTD は同じ開発者によって作られていますが、トレードオフが異なります。
[Facebook によるベンチマーク](https://facebook.github.io/zstd/#benchmarks)では次のように示されています:

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## ブロック {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | (header + compressed data) の[ハッシュ](../native-protocol/hash.md) |
| raw_size        | uint32  | ヘッダーを含まない生データサイズ                 |
| data_size       | uint32  | 非圧縮データサイズ                               |
| mode            | byte    | 圧縮モード                                       |
| compressed_data | binary  | 圧縮データのブロック                             |

<Image img={CompressionBlock} size="md" alt="ClickHouse の圧縮ブロック構造を示す図"/>

ヘッダーは (raw_size + data_size + mode) で構成され、raw_size は header + compressed_data の長さです。

Checksum は [ClickHouse CityHash](../native-protocol/hash.md) を用いて `hash(header + compressed_data)` として計算されます。

## None モード {#none-mode}

*None* モードを使用する場合、`compressed_data` は元のデータと同一になります。
非圧縮モードは、ハッシュ計算のオーバーヘッドが無視できる程度に小さいため、チェックサムによって追加のデータ完全性を確保するのに有用です。
