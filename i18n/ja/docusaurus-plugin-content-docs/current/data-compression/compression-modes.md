---
slug: /data-compression/compression-modes
sidebar_position: 6
title: 圧縮モード
description: ClickHouseカラム圧縮モード
keywords: [圧縮, コーデック, エンコーディング, モード]
---

# 圧縮モード

ClickHouseプロトコルは、**データブロック**の圧縮とチェックサムをサポートしています。  
どのモードを選ぶか不明な場合は、`LZ4`を使用してください。

:::tip
利用可能な[カラム圧縮コーデック](/sql-reference/statements/create/table.md/#column-compression-codecs)について詳しく学び、テーブルを作成する際、またはその後に指定してください。
:::

## モード {#modes}

| 値     | 名前                | 説明                                           |
|--------|---------------------|-----------------------------------------------|
| `0x02` | [None](#none-mode)  | 圧縮なし、チェックサムのみ                     |
| `0x82` | LZ4                 | 非常に高速、良好な圧縮                         |
| `0x90` | ZSTD                | Zstandard、かなり高速、最良の圧縮             |

LZ4とZSTDは同じ著者によって作成されていますが、異なるトレードオフがあります。  
[Facebookのベンチマーク](https://facebook.github.io/zstd/#benchmarks)から：

| 名前               | 比率  | エンコーディング | デコーディング  |
|---------------------|-------|------------------|------------------|
| **zstd** 1.4.5 -1   | 2.8   | 500 MB/s         | 1660 MB/s        |
| **lz4** 1.9.2       | 2.1   | 740 MB/s         | 4530 MB/s        |

## ブロック {#block}

| フィールド            | 型      | 説明                                                    |
|----------------------|---------|-------------------------------------------------------|
| checksum             | uint128 | (ヘッダー + 圧縮データ)の[ハッシュ](../native-protocol/hash.md)      |
| raw_size             | uint32  | ヘッダーなしの生サイズ                                  |
| data_size            | uint32  | 非圧縮データサイズ                                      |
| mode                 | byte    | 圧縮モード                                            |
| compressed_data      | binary  | 圧縮データのブロック                                    |

![圧縮ブロックダイアグラム](./images/ch_compression_block.png)

ヘッダーは (raw_size + data_size + mode) で、生サイズは len(header + compressed_data) から成ります。

チェックサムは `hash(header + compressed_data)` で、[ClickHouse CityHash](../native-protocol/hash.md)を使用します。

## Noneモード {#none-mode}

*None*モードを使用する場合、`compressed_data`は元のデータと等しいです。  
圧縮なしのモードは、チェックサムによって追加のデータ整合性を保証するために便利です。なぜなら、  
ハッシュ処理のオーバーヘッドは無視できるためです。
