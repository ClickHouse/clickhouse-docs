---
slug: /data-compression/compression-modes
sidebar_position: 6
title: 'Режимы сжатия'
description: 'Режимы сжатия столбцов ClickHouse'
keywords: ['сжатие', 'кодек', 'кодирование', 'режимы']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# Режимы сжатия {#compression-modes}

Протокол ClickHouse поддерживает сжатие **блоков данных** с контрольными суммами.
Используйте `LZ4`, если не уверены, какой режим выбрать.

:::tip
Узнайте больше о [кодеках сжатия столбцов](/sql-reference/statements/create/table#column_compression_codec) и задавайте их при создании таблиц или позже.
:::



## Режимы {#modes}

| value  | name               | description                                       |
|--------|--------------------|---------------------------------------------------|
| `0x02` | [None](#none-mode) | Без сжатия, только контрольные суммы             |
| `0x82` | LZ4                | Очень быстрое, хорошее сжатие                    |
| `0x90` | ZSTD               | Zstandard, достаточно быстрое, лучшее сжатие     |

И LZ4, и ZSTD разработаны одним и тем же автором, но с разными компромиссами по характеристикам.
По результатам [бенчмарков Facebook](https://facebook.github.io/zstd/#benchmarks):

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |



## Блок {#block}

| поле            | тип     | описание                                         |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [Хеш](../native-protocol/hash.md) от (header + compressed data) |
| raw_size        | uint32  | Сырой размер без заголовка                       |
| data_size       | uint32  | Размер несжатых данных                           |
| mode            | byte    | Режим сжатия                                     |
| compressed_data | binary  | Блок сжатых данных                               |

<Image img={CompressionBlock} size="md" alt="Диаграмма, иллюстрирующая структуру блока сжатия ClickHouse"/>

Заголовок — это (raw_size + data_size + mode), сырой размер равен длине (header + compressed_data).

Контрольная сумма рассчитывается как `hash(header + compressed_data)` с использованием [ClickHouse CityHash](../native-protocol/hash.md).



## Режим None {#none-mode}

Если используется режим *None*, `compressed_data` совпадает с исходными данными.
Режим без сжатия полезен для обеспечения дополнительной целостности данных с помощью контрольных сумм, так как накладные расходы на хеширование незначительны.
