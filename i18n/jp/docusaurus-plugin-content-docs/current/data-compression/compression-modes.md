---
'slug': '/data-compression/compression-modes'
'sidebar_position': 6
'title': '圧縮モード'
'description': 'ClickHouse カラム圧縮モード'
'keywords':
- 'compression'
- 'codec'
- 'encoding'
- 'modes'
'doc_type': 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# 圧縮モード

ClickHouse プロトコルは **データブロック** の圧縮とチェックサムをサポートしています。どのモードを選択するか不明な場合は `LZ4` を使用してください。

:::tip
使用可能な [カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec) について詳しく学び、テーブルを作成する際や後で指定してください。
:::

## モード {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 圧縮なし、チェックサムのみ           |
| `0x82` | LZ4                | 非常に高速で、良好な圧縮性能         |
| `0x90` | ZSTD               | Zstandard、かなり高速で、最良の圧縮 |

LZ4 と ZSTD は同じ著者によって作成されましたが、異なるトレードオフがあります。
[Facebookのベンチマーク](https://facebook.github.io/zstd/#benchmarks) より:

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## ブロック {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [ハッシュ](../native-protocol/hash.md) (ヘッダー + 圧縮データ) |
| raw_size        | uint32  | ヘッダーなしの生サイズ                          |
| data_size       | uint32  | 圧縮されていないデータサイズ                    |
| mode            | byte    | 圧縮モード                                 |
| compressed_data | binary  | 圧縮データのブロック                         |

<Image img={CompressionBlock} size="md" alt="ClickHouse 圧縮ブロック構造を示す図"/>

ヘッダーは (raw_size + data_size + mode) で構成され、生サイズは len(header + compressed_data) からなります。

チェックサムは `hash(header + compressed_data)` で、[ClickHouse CityHash](../native-protocol/hash.md) を使用しています。

## None モード {#none-mode}

*None* モードが使用される場合、 `compressed_data` は元のデータと等しいです。
圧縮なしモードは、チェックサムによる追加のデータ整合性を確保するのに役立ちます。なぜなら、ハッシングのオーバーヘッドは無視できるためです。
