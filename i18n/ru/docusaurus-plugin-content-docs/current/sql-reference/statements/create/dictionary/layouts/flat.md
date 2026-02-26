---
slug: /sql-reference/statements/create/dictionary/layouts/flat
title: 'плоское размещение словаря'
sidebar_label: 'плоский'
sidebar_position: 2
description: 'Хранение словаря в памяти в виде плоских массивов.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

При использовании макета `flat` словарь полностью хранится в памяти в виде плоских массивов.
Объем используемой памяти пропорционален размеру наибольшего ключа (по занимаемому месту).

:::tip
Этот тип макета обеспечивает наилучшую производительность среди всех доступных методов хранения словаря.
:::

Ключ словаря имеет тип [UInt64](/sql-reference/data-types/int-uint.md), а значение ограничено `max_array_size` (по умолчанию — 500 000).
Если при создании словаря обнаруживается ключ большего размера, ClickHouse генерирует исключение и не создает словарь.
Начальный размер плоских массивов словаря контролируется настройкой `initial_array_size` (по умолчанию — 1024).

Поддерживаются все типы источников.
При обновлении словаря данные (из файла или из таблицы) читаются целиком.

Пример конфигурации:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
      <flat>
        <initial_array_size>50000</initial_array_size>
        <max_array_size>5000000</max_array_size>
      </flat>
    </layout>
    ```
  </TabItem>
</Tabs>

<br />
