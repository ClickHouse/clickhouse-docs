---
slug: /data-compression/compression-modes
sidebar_position: 6
title: 圧縮モード
description: ClickHouse のカラム圧縮モード
keywords: [圧縮, コーデック, エンコーディング, モード]
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';


# 圧縮モード

ClickHouse プロトコルは **データブロック** の圧縮をチェックサム付きでサポートしています。
どのモードを選択するかわからない場合は `LZ4` を使用してください。

:::tip
利用可能な [カラム圧縮コーデック](/sql-reference/statements/create/table#column_compression_codec) についてもっと学び、テーブル作成時またはその後に指定してください。
:::

## モード {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | 圧縮なし、チェックサムのみ                  |
| `0x82` | LZ4                | 非常に高速で、良好な圧縮率                    |
| `0x90` | ZSTD               | Zstandard、かなり高速で、最高の圧縮率          |

LZ4 と ZSTD は同じ著者によって作成されていますが、異なるトレードオフがあります。
[Facebook のベンチマーク](https://facebook.github.io/zstd/#benchmarks) から：

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## ブロック {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [ハッシュ](../native-protocol/hash.md) (ヘッダー + 圧縮データ) |
| raw_size        | uint32  | ヘッダーなしの生サイズ                           |
| data_size       | uint32  | 圧縮されていないデータサイズ                      |
| mode            | byte    | 圧縮モード                                      |
| compressed_data | binary  | 圧縮データのブロック                             |

<img src={CompressionBlock} alt="ClickHouse の圧縮ブロック構造を示す図" />

ヘッダーは (raw_size + data_size + mode) で、raw size は len(header + compressed_data) から成ります。

チェックサムは `hash(header + compressed_data)` で、[ClickHouse CityHash](../native-protocol/hash.md) を使用します。

## None モード {#none-mode}

*None* モードが使用されると、`compressed_data` は元のデータと等しくなります。
圧縮なしモードは、チェックサムによる追加のデータ整合性を確保するために有用です。なぜなら、ハッシュ化のオーバーヘッドは無視できるからです。
