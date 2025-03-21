---
slug: /data-compression/compression-modes
sidebar_position: 6
title: Режимы сжатия
description: Режимы сжатия колонок ClickHouse
keywords: ['compression', 'codec', 'encoding', 'modes']
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';


# Режимы сжатия

Протокол ClickHouse поддерживает **сжатие блоков данных** с контрольными суммами.  
Используйте `LZ4`, если не уверены, какой режим выбрать.

:::tip
Узнайте больше о [кодеках сжатия колонок](/sql-reference/statements/create/table#column_compression_codec), доступных для указания при создании таблиц или позже.
:::

## Режимы {#modes}

| значение | имя                  | описание                                 |
|----------|---------------------|------------------------------------------|
| `0x02`   | [None](#none-mode)  | Без сжатия, только контрольные суммы     |
| `0x82`   | LZ4                 | Очень быстро, хорошее сжатие            |
| `0x90`   | ZSTD                | Zstandard, довольно быстро, лучшее сжатие |

Оба LZ4 и ZSTD разработаны одним автором, но с разными компромиссами.  
Из [бенчмарков Facebook](https://facebook.github.io/zstd/#benchmarks):

| имя               | соотношение | кодирование | декодирование |
|-------------------|-------------|-------------|----------------|
| **zstd** 1.4.5 -1 | 2.8         | 500 MB/s    | 1660 MB/s      |
| **lz4** 1.9.2     | 2.1         | 740 MB/s    | 4530 MB/s      |

## Блок {#block}

| поле            | тип     | описание                                               |
|-----------------|---------|-------------------------------------------------------|
| checksum        | uint128 | [Хэш](../native-protocol/hash.md) от (заголовок + сжатые данные) |
| raw_size        | uint32  | Размер без заголовка                                   |
| data_size       | uint32  | Размер несжатых данных                                 |
| mode            | byte    | Режим сжатия                                         |
| compressed_data | binary  | Блок сжатых данных                                    |

<img src={CompressionBlock} alt="Диаграмма, иллюстрирующая структуру блока сжатия ClickHouse" />

Заголовок состоит из (raw_size + data_size + mode), размер raw состоит из len(header + compressed_data).

Контрольная сумма — это `hash(header + compressed_data)`, используя [ClickHouse CityHash](../native-protocol/hash.md).

## Режим None {#none-mode}

Если используется режим *None*, `compressed_data` равен оригинальным данным.  
Режим без сжатия полезен для обеспечения дополнительной целостности данных с контрольными суммами, поскольку overhead хеширования незначителен.
