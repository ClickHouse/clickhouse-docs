---
slug: /data-compression/compression-modes
sidebar_position: 6
title: 'Режимы сжатия'
description: 'Режимы сжатия столбцов ClickHouse'
keywords: ['сжатие', 'кодек', 'кодирование', 'режимы']
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# Режимы сжатия

Протокол ClickHouse поддерживает **сжатие блоков данных** с контрольными суммами. Используйте `LZ4`, если не уверены, какой режим выбрать.

:::tip
Узнайте больше о [кодеках сжатия столбцов](/sql-reference/statements/create/table#column_compression_codec), доступных и укажите их при создании ваших таблиц или после.
:::

## Режимы {#modes}

| value  | name               | description                              |
|--------|--------------------|------------------------------------------|
| `0x02` | [None](#none-mode) | Без сжатия, только контрольные суммы     |
| `0x82` | LZ4                | Чрезвычайно быстрое, хорошее сжатие     |
| `0x90` | ZSTD               | Zstandard, довольно быстрое, лучшее сжатие |

Оба LZ4 и ZSTD созданы одним автором, но с различными компромиссами. Из [бенчмарков Facebook](https://facebook.github.io/zstd/#benchmarks):

| name              | ratio | encoding | decoding  |
|-------------------|-------|----------|-----------|
| **zstd** 1.4.5 -1 | 2.8   | 500 MB/s | 1660 MB/s |
| **lz4** 1.9.2     | 2.1   | 740 MB/s | 4530 MB/s |

## Блок {#block}

| field           | type    | description                                      |
|-----------------|---------|--------------------------------------------------|
| checksum        | uint128 | [Хеш](../native-protocol/hash.md) (заголовок + сжатые данные) |
| raw_size        | uint32  | Размер без заголовка                             |
| data_size       | uint32  | Размер не сжатых данных                          |
| mode            | byte    | Режим сжатия                                    |
| compressed_data | binary  | Блок сжатых данных                              |

<Image img={CompressionBlock} size="md" alt="Диаграмма, иллюстрирующая структуру блока сжатия ClickHouse"/>

Заголовок - это (raw_size + data_size + mode), raw размер состоит из длины (header + compressed_data).

Контрольная сумма равна `hash(header + compressed_data)`, используя [ClickHouse CityHash](../native-protocol/hash.md).

## Режим None {#none-mode}

Если используется режим *None*, `compressed_data` равен оригинальным данным. 
Режим без сжатия полезен для обеспечения дополнительной целостности данных с помощью контрольных сумм, поскольку 
накладные расходы на хэширование незначительны.
