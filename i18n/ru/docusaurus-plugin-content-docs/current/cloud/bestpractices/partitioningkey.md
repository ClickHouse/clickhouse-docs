---
slug: '/cloud/bestpractices/low-cardinality-partitioning-key'
sidebar_label: 'Выбор ключа партиции с низкой кардинальностью'
title: 'Выбор ключа партиции с низкой кардинальностью'
---

import partitioning01 from '@site/static/images/cloud/bestpractices/partitioning-01.png';
import partitioning02 from '@site/static/images/cloud/bestpractices/partitioning-02.png';

Когда вы отправляете оператор вставки (который должен содержать много строк - см. [раздел выше](/optimize/bulk-inserts)) в таблицу в ClickHouse Cloud, и эта
таблица не использует [ключ партиции](/engines/table-engines/mergetree-family/custom-partitioning-key.md), то все данные строк из этой вставки записываются в новую часть в хранилище:

<img src={partitioning01}
  class="image"
  alt="Вставка без ключа партиции - создана одна часть"
  style={{width: '100%', background: 'none'}} />

Однако, когда вы отправляете оператор вставки в таблицу в ClickHouse Cloud, и эта таблица имеет ключ партиции, то ClickHouse:
- проверяет значения ключа партиции строк, содержащихся в вставке
- создает одну новую часть в хранилище на каждое уникальное значение ключа партиции
- помещает строки в соответствующие части по значению ключа партиции

<img src={partitioning02}
  class="image"
  alt="Вставка с ключом партиции - создано несколько частей на основе значений ключа партиции"
  style={{width: '100%', background: 'none'}} />

Следовательно, чтобы минимизировать количество запросов на запись в объектное хранилище ClickHouse Cloud, используйте ключ партиции с низкой кардинальностью или избегайте использования любого ключа партиции для вашей таблицы.
