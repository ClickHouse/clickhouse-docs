---
slug: '/data-compression/compression-modes'
sidebar_position: 6
title: '圧縮モード'
description: 'ClickHouseのカラム圧縮モード'
keywords:
- 'compression'
- 'codec'
- 'encoding'
- 'modes'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 圧縮モード

ClickHouseプロトコルは、**データブロック**の圧縮をチェックサムと共にサポートしています。モードを選択する際に不明な場合は、`LZ4`を使用してください。

:::tip
利用可能な[カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec)について詳しく学び、テーブルを作成する際やその後に指定してください。
:::

## モード {#modes}

| 値    | 名前               | 説明                                      |
|-------|--------------------|-------------------------------------------|
| `0x02` | [なし](#none-mode) | 圧縮なし、チェックサムのみ                  |
| `0x82` | LZ4                | 非常に高速で、良好な圧縮                     |
| `0x90` | ZSTD               | Zstandard、高速で、最適な圧縮                 |

LZ4とZSTDは同じ著者によって作成されていますが、異なるトレードオフがあります。 [Facebookのベンチマーク](https://facebook.github.io/zstd/#benchmarks)から：

| 名前              | 比率 | エンコーディング | デコーディング  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## ブロック {#block}

| フィールド       | 型      | 説明                                      |
|-----------------|---------|-------------------------------------------|
| checksum        | uint128 | [ハッシュ](../native-protocol/hash.md) (ヘッダー + 圧縮データ) |
| raw_size        | uint32  | ヘッダーなしの生データサイズ                   |
| data_size       | uint32  | 非圧縮データサイズ                          |
| mode            | byte    | 圧縮モード                                 |
| compressed_data | binary  | 圧縮データのブロック                        |

<Image img={CompressionBlock} size="md" alt="ClickHouse圧縮ブロック構造を示す図"/>

ヘッダーは(raw_size + data_size + mode)であり、生サイズはlen(header + compressed_data)から構成されています。

チェックサムは`hash(header + compressed_data)`であり、[ClickHouse CityHash](../native-protocol/hash.md)を使用しています。

## なしモード {#none-mode}

*なし*モードが使用されている場合、`compressed_data`はオリジナルデータと等しくなります。圧縮なしのモードは、チェックサムを使用して追加のデータ整合性を確保するために有用です。なぜなら、ハッシュingのオーバーヘッドは無視できるからです。
