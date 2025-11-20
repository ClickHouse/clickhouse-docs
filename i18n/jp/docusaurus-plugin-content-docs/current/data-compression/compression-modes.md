---
slug: /data-compression/compression-modes
sidebar_position: 6
title: '圧縮モード'
description: 'ClickHouse 列の圧縮モード'
keywords: ['compression', 'codec', 'encoding', 'modes']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 圧縮モード

ClickHouse プロトコルは、チェックサム付きの **データブロック** 圧縮をサポートします。
どのモードを選べばよいか分からない場合は、`LZ4` を使用してください。

:::tip
利用可能な [カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec) について確認し、テーブル作成時または作成後に指定してください。
:::



## モード {#modes}

| value  | name               | description                              |
| ------ | ------------------ | ---------------------------------------- |
| `0x02` | [None](#none-mode) | 圧縮なし、チェックサムのみ           |
| `0x82` | LZ4                | 非常に高速、良好な圧縮率         |
| `0x90` | ZSTD               | Zstandard、かなり高速、最高の圧縮率 |

LZ4とZSTDは同じ作者によって開発されていますが、異なるトレードオフがあります。
[Facebookのベンチマーク](https://facebook.github.io/zstd/#benchmarks)より:

| name              | ratio | encoding | decoding  |
| ----------------- | ----- | -------- | --------- |
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/秒 | 1660 MB/秒 |
| **lz4** 1.9.2     | 2.1   | 740 MB/秒 | 4530 MB/秒 |


## Block {#block}

| field           | type    | description                                                      |
| --------------- | ------- | ---------------------------------------------------------------- |
| checksum        | uint128 | (header + compressed data)の[ハッシュ](../native-protocol/hash.md) |
| raw_size        | uint32  | ヘッダーを除いた生データサイズ                                          |
| data_size       | uint32  | 非圧縮データサイズ                                           |
| mode            | byte    | 圧縮モード                                                 |
| compressed_data | binary  | 圧縮データブロック                                         |

<Image
  img={CompressionBlock}
  size='md'
  alt='ClickHouse圧縮ブロック構造を示す図'
/>

ヘッダーは(raw_size + data_size + mode)で構成され、raw_sizeはlen(header + compressed_data)を表します。

チェックサムは[ClickHouse CityHash](../native-protocol/hash.md)を使用した`hash(header + compressed_data)`です。


## Noneモード {#none-mode}

_None_モードを使用する場合、`compressed_data`は元のデータと同一になります。
非圧縮モードは、チェックサムによる追加のデータ整合性を確保するのに有用です。
これは、ハッシュ化のオーバーヘッドが無視できる程度であるためです。
