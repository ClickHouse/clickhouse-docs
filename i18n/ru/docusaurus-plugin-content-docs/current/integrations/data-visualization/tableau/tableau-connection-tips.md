---
sidebar_label: 'Рекомендации по подключению'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Рекомендации по подключению Tableau при использовании официального коннектора ClickHouse.'
title: 'Рекомендации по подключению'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Рекомендации по подключению

<ClickHouseSupportedBadge/>



## Вкладка Initial SQL {#initial-sql-tab}

Если флажок _Set Session ID_ активирован на вкладке Advanced (по умолчанию), вы можете установить [настройки](/operations/settings/settings/) уровня сессии с помощью

```text
SET my_setting=value;
```


## Вкладка Advanced {#advanced-tab}

В 99% случаев вкладка Advanced не нужна, для оставшегося 1% можно использовать следующие настройки:

- **Custom Connection Parameters**. По умолчанию уже указан параметр `socket_timeout`, который может потребоваться изменить, если некоторые извлечения данных обновляются очень долго. Значение этого параметра указывается в миллисекундах. Остальные параметры можно найти [здесь](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java), добавляйте их в это поле через запятую
- **JDBC Driver custom_http_params**. Это поле позволяет добавить параметры в строку подключения ClickHouse, передавая значения в [параметр драйвера `custom_http_params`](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Например, так указывается `session_id` при активации флажка _Set Session ID_
- **JDBC Driver `typeMappings`**. Это поле позволяет [передать список сопоставлений типов данных ClickHouse с типами данных Java, используемыми драйвером JDBC](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Благодаря этому параметру коннектор автоматически отображает большие целые числа как строки, вы можете изменить это, передав свой набор сопоставлений _(не знаю зачем)_, используя
  ```text
  UInt256=java.lang.Double,Int256=java.lang.Double
  ```
  Подробнее о сопоставлении типов читайте в соответствующем разделе


- **Параметры URL JDBC-драйвера**. В этом поле можно передать остальные [параметры драйвера](https://github.com/ClickHouse/clickhouse-jdbc#configuration), например `jdbcCompliance`. Обратите внимание: значения параметров должны передаваться в формате URL Encoded. Если параметры `custom_http_params` или `typeMappings` указаны как в этом поле, так и в предыдущих полях вкладки Advanced, приоритет имеют значения из предыдущих двух полей вкладки Advanced
- Флажок **Set Session ID**. Необходим для установки настроек на уровне сессии на вкладке Initial SQL. Генерирует `session_id` с временной меткой и псевдослучайным числом в формате `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`

## Ограниченная поддержка типов данных UInt64, Int128, (U)Int256 {#limited-support-for-uint64-int128-uint256-data-types}

По умолчанию драйвер отображает поля типов _UInt64, Int128, (U)Int256_ как строки, **но именно отображает, а не преобразует**. Это означает, что при попытке создать вычисляемое поле вы получите ошибку

```text
LEFT([myUInt256], 2) // Ошибка!
```

Для работы с большими целочисленными полями как со строками необходимо явно обернуть поле в функцию STR()

```text
LEFT(STR([myUInt256]), 2) // Работает!
```

Однако такие поля чаще всего используются для подсчета количества уникальных значений _(идентификаторы типа Watch ID, Visit ID в Яндекс.Метрике)_ или в качестве _измерения_ для указания детализации визуализации, и в этих случаях всё работает корректно.

```text
COUNTD([myUInt256]) // Тоже работает!
```

При использовании предварительного просмотра данных (View data) таблицы с полями UInt64 ошибка больше не возникает.
