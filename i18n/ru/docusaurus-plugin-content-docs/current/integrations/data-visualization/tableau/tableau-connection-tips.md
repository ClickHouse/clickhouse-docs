---
sidebar_label: 'Советы по подключению'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Рекомендации по подключению Tableau при использовании официального коннектора ClickHouse.'
title: 'Советы по подключению'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Рекомендации по подключению \{#connection-tips\}

<ClickHouseSupportedBadge/>

## Вкладка Initial SQL \{#initial-sql-tab\}

Если на вкладке Advanced (по умолчанию) установлен флажок *Set Session ID*, вы можете задать [настройки](/operations/settings/settings/) на уровне сеанса с помощью

```text
SET my_setting=value;
```


## Вкладка Advanced \{#advanced-tab\}

В 99% случаев вам не понадобится вкладка Advanced, для оставшегося 1% вы можете использовать следующие настройки:

- **Custom Connection Parameters**. По умолчанию уже указан `socket_timeout`; этот параметр может потребовать изменения, если обновление некоторых выгрузок занимает очень много времени. Значение этого параметра указывается в миллисекундах. Остальные параметры можно найти [здесь](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java); добавляйте их в это поле, разделяя запятыми.
- **JDBC Driver custom_http_params**. Это поле позволяет добавить некоторые параметры в строку подключения к ClickHouse, передавая значения в [параметр драйвера `custom_http_params`](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Например, таким образом указывается `session_id`, когда активирован флажок *Set Session ID*.
- **JDBC Driver `typeMappings`**. Это поле позволяет [передать список сопоставлений типов данных ClickHouse с типами данных Java, которые использует JDBC‑драйвер](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Коннектор автоматически отображает большие целые числа как строки благодаря этому параметру; вы можете изменить это, передав свой набор сопоставлений *(я не знаю, зачем)*, используя
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  Подробнее о сопоставлении типов данных читайте в соответствующем разделе.

- **JDBC Driver URL Parameters**. В это поле вы можете передать оставшиеся [параметры драйвера](https://github.com/ClickHouse/clickhouse-jdbc#configuration), например `jdbcCompliance`. Будьте внимательны: значения параметров должны передаваться в формате URL-encoded, и в случае передачи `custom_http_params` или `typeMappings` и в этом поле, и в предыдущих полях вкладки Advanced значения двух предыдущих полей на вкладке Advanced имеют более высокий приоритет.
- Флажок **Set Session ID**. Необходим для задания сеансовых настроек на вкладке Initial SQL: генерирует `session_id` с меткой времени и псевдослучайным числом в формате `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`.

## Ограниченная поддержка типов данных UInt64, Int128, (U)Int256 \{#limited-support-for-uint64-int128-uint256-data-types\}

По умолчанию драйвер отображает поля типов *UInt64, Int128, (U)Int256* как строки, **при этом он их именно отображает, а не конвертирует**. Это означает, что при попытке записать вычисляемое поле, как показано ниже, вы получите ошибку.

```text
LEFT([myUInt256], 2) // Error!
```

Чтобы работать с крупными целочисленными полями как со строками, необходимо явно обернуть это поле вызовом функции STR()

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

Однако такие поля чаще всего используются для подсчёта числа уникальных значений *(ID, таких как Watch ID, Visit ID в Yandex.Metrica)* или в качестве *измерения (Dimension)* для задания степени детализации визуализации, и для этих целей они хорошо подходят.

```text
COUNTD([myUInt256]) // Works well too!
```

При использовании предварительного просмотра данных (View data) для таблицы с полями типа UInt64 ошибка больше не возникает.
