---
slug: /data-compression/compression-modes
sidebar_position: 6
title: '圧縮モード'
description: 'ClickHouseのカラム圧縮モード'
keywords: ['圧縮', 'コーデック', 'エンコーディング', 'モード']
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 圧縮モード

ClickHouseプロトコルは、**データブロック**の圧縮をチェックサムと共にサポートします。  
モードを選ぶ際に迷ったら、`LZ4`を使用してください。

:::tip
[カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)についてもっと学び、テーブル作成時または後で指定してください。
:::

## モード {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 圧縮なし、チェックサムのみ                   |
| `0x82` | LZ4                | 非常に高速、良好な圧縮                       |
| `0x90` | ZSTD               | Zstandard、かなり高速、最良の圧縮              |

LZ4とZSTDは同じ著者によって作成されましたが、それぞれ異なるトレードオフがあります。  
[Facebookのベンチマーク](https://facebook.github.io/zstd/#benchmarks)から：

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## ブロック {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [ハッシュ](../native-protocol/hash.md) (ヘッダー + 圧縮データ) |
| raw_size        | uint32  | ヘッダーなしの生サイズ                          |
| data_size       | uint32  | 圧縮されていないデータサイズ                     |
| mode            | byte    | 圧縮モード                                     |
| compressed_data | binary  | 圧縮データのブロック                             |

<Image img={CompressionBlock} size="md" alt="ClickHouse圧縮ブロック構造を示す図"/>

ヘッダーは（raw_size + data_size + mode）で構成され、生サイズはlen(header + compressed_data)から成ります。

チェックサムは`hash(header + compressed_data)`で、[ClickHouse CityHash](../native-protocol/hash.md)を使用しています。

## Noneモード {#none-mode}

*None*モードを使用する場合、`compressed_data`は元のデータと等しくなります。  
圧縮なしのモードは、チェックサムを使用して追加のデータ整合性を確保するために役立ちます。  
なぜなら、ハッシュのオーバーヘッドは無視できるからです。
