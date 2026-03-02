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

Если на вкладке Advanced (по умолчанию) установлен флажок *Set Session ID*, вы можете задать сеансовые [настройки](/operations/settings/settings/) с помощью

```text
SET my_setting=value;
```


## Вкладка Advanced \{#advanced-tab\}

В 99% случаев вкладка Advanced не нужна, для оставшегося 1% можно использовать следующие настройки:

- **Custom Connection Parameters**. По умолчанию уже указан `socket_timeout`; этот параметр может потребоваться изменить, если некоторые экстракты обновляются очень долго. Значение этого параметра указывается в миллисекундах. Остальные параметры можно найти [здесь](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) и добавлять их в это поле, разделяя запятыми.
- **JDBC Driver custom_http_params**. Это поле позволяет добавить некоторые параметры в строку подключения ClickHouse, передавая значения в [параметр драйвера `custom_http_params`](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Например, так задаётся `session_id`, когда активирован чекбокс *Set Session ID*.
- **JDBC Driver `typeMappings`**. Это поле позволяет [передать список сопоставлений типов данных ClickHouse с типами данных Java, используемыми драйвером JDBC](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Коннектор автоматически отображает большие целые числа как строки благодаря этому параметру; вы можете изменить это, передав свой набор сопоставлений *(я не знаю зачем)* с помощью
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  Подробнее о сопоставлении читайте в соответствующем разделе.

- **JDBC Driver URL Parameters**. В это поле можно передать остальные [параметры драйвера](https://github.com/ClickHouse/clickhouse-jdbc#configuration), например `jdbcCompliance`. Будьте внимательны: значения параметров должны передаваться в формате URL Encoded, и в случае передачи `custom_http_params` или `typeMappings` и в этом поле, и в предыдущих полях вкладки Advanced значения из двух предыдущих полей на вкладке Advanced будут иметь более высокий приоритет.
- Чекбокс **Set Session ID**. Нужен для задания настроек на уровне сессии во вкладке Initial SQL, генерирует `session_id` с временной меткой и псевдослучайным числом в формате `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`.

## Ограниченная поддержка типов данных UInt64, Int128, (U)Int256 \{#limited-support-for-uint64-int128-uint256-data-types\}

По умолчанию драйвер отображает поля типов *UInt64, Int128, (U)Int256* как строки, **но он именно отображает их, а не преобразует**. Это означает, что при попытке записать следующее вычисляемое поле вы получите ошибку

```text
LEFT([myUInt256], 2) // Error!
```

Чтобы работать с полями больших целочисленных типов как со строками, необходимо явно оборачивать их в функцию STR()

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

Однако такие поля чаще всего используются для подсчёта числа уникальных значений *(ID, таких как Watch ID, Visit ID в Yandex.Metrica)* или в качестве *Dimension* для задания детализации визуализации; в этих случаях они хорошо подходят.

```text
COUNTD([myUInt256]) // Works well too!
```

При использовании предварительного просмотра данных (View data) для таблицы с полями типа UInt64 ошибка больше не возникает.
