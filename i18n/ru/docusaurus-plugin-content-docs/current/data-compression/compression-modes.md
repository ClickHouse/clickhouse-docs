---
slug: /data-compression/compression-modes
sidebar_position: 6
title: 'Режимы сжатия'
description: 'Режимы сжатия столбцов ClickHouse'
keywords: ['compression', 'codec', 'encoding', 'modes']
doc_type: 'reference'
---

import CompressionBlock from '@site/static/images/data-compression/ch_compression_block.png';
import Image from '@theme/IdealImage';


# Режимы сжатия

Протокол ClickHouse поддерживает сжатие **блоков данных** с контрольными суммами.
Если вы не уверены, какой режим выбрать, используйте `LZ4`.

:::tip
Подробнее о доступных [кодеках сжатия столбцов](/sql-reference/statements/create/table#column_compression_codec) и об их указании при создании таблиц или позже.
:::



## Режимы {#modes}

| value  | name               | description                              |
| ------ | ------------------ | ---------------------------------------- |
| `0x02` | [None](#none-mode) | Без сжатия, только контрольные суммы     |
| `0x82` | LZ4                | Очень быстрое, хорошее сжатие            |
| `0x90` | ZSTD               | Zstandard, достаточно быстрое, лучшее сжатие |

Оба алгоритма LZ4 и ZSTD созданы одним автором, но с разными компромиссами.
Из [тестов производительности Facebook](https://facebook.github.io/zstd/#benchmarks):

| name              | коэффициент | кодирование | декодирование  |
| ----------------- | ----- | -------- | --------- |
| **zstd** 1.4.5 -1 | 2.8   | 500 МБ/с | 1660 МБ/с |
| **lz4** 1.9.2     | 2.1   | 740 МБ/с | 4530 МБ/с |


## Block {#block}

| field           | type    | description                                                      |
| --------------- | ------- | ---------------------------------------------------------------- |
| checksum        | uint128 | [Хеш](../native-protocol/hash.md) (заголовок + сжатые данные) |
| raw_size        | uint32  | Полный размер без заголовка                                          |
| data_size       | uint32  | Размер несжатых данных                                           |
| mode            | byte    | Режим сжатия                                                 |
| compressed_data | binary  | Блок сжатых данных                                         |

<Image
  img={CompressionBlock}
  size='md'
  alt='Диаграмма структуры блока сжатия ClickHouse'
/>

Заголовок состоит из (raw_size + data_size + mode), полный размер включает len(header + compressed_data).

Контрольная сумма вычисляется как `hash(header + compressed_data)` с использованием [ClickHouse CityHash](../native-protocol/hash.md).


## Режим None {#none-mode}

Если используется режим _None_, `compressed_data` равны исходным данным.
Режим без сжатия полезен для обеспечения дополнительной целостности данных с помощью контрольных сумм, так как накладные расходы на хеширование незначительны.
