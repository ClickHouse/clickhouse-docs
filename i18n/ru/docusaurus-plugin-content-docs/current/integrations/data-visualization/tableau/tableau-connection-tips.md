---
sidebar_label: 'Советы по подключению'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'онлайн', 'mysql', 'подключиться', 'интегрировать', 'ui']
description: 'Советы по подключению Tableau при использовании официального коннектора ClickHouse.'
title: 'Советы по подключению'
---

import Image from '@theme/IdealImage';


# Советы по подключению
## Вкладка Initial SQL {#initial-sql-tab}
Если флажок *Set Session ID* активирован на вкладке Advanced (по умолчанию), вы можете установить настройки уровня сеанса [settings](/operations/settings/settings/) с помощью
```text
SET my_setting=value;
``` 
## Вкладка Advanced {#advanced-tab}

В 99% случаев вам не нужна вкладка Advanced, для оставшихся 1% вы можете использовать следующие параметры:
- **Custom Connection Parameters**. По умолчанию, `socket_timeout` уже указан, этот параметр может потребовать изменения, если некоторые извлечения обновляются очень долго. Значение этого параметра указывается в миллисекундах. Остальные параметры можно найти [здесь](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java), добавьте их в это поле, разделив запятыми
- **JDBC Driver custom_http_params**. Это поле позволяет добавить некоторые параметры в строку подключения ClickHouse, передавая значения в [`custom_http_params` параметр драйвера](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Например, так указывается `session_id`, когда флажок *Set Session ID* активирован.
- **JDBC Driver `typeMappings`**. Это поле позволяет вам [передать список сопоставлений типов данных ClickHouse с типами данных Java, используемыми JDBC-драйвером](https://github.com/ClickHouse/clickhouse-jdbc#configuration). Коннектор автоматически отображает большие целые числа как строки благодаря этому параметру, вы можете изменить это, передавая свой набор сопоставлений *(Я не знаю почему)* с помощью
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  Узнайте больше о сопоставлениях в соответствующем разделе.

- **Параметры URL JDBC Driver**. Вы можете передать оставшиеся [параметры драйвера](https://github.com/ClickHouse/clickhouse-jdbc#configuration), например `jdbcCompliance`, в этом поле. Будьте осторожны, значения параметров должны передаваться в формате URL Encoded, а в случае передачи `custom_http_params` или `typeMappings` в этом поле и в предыдущих полях вкладки Advanced, значения двух предыдущих полей имеют более высокий приоритет.
- **Set Session ID** checkbox. Этот флажок необходим для установки настроек уровня сеанса на вкладке Initial SQL, генерирует `session_id` с временной меткой и псевдослучайным числом в формате `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`
## Ограниченная поддержка типов данных UInt64, Int128, (U)Int256 {#limited-support-for-uint64-int128-uint256-data-types}
По умолчанию драйвер отображает поля типов *UInt64, Int128, (U)Int256* как строки, **но он отображает, а не преобразует**. Это означает, что когда вы пытаетесь записать следующее вычисляемое поле, вы получите ошибку
```text
LEFT([myUInt256], 2) // Ошибка!
```
Чтобы работать с большими целыми полями как со строками, необходимо явно обернуть поле в функцию STR()

```text
LEFT(STR([myUInt256]), 2) // Работает отлично!
```

Тем не менее, такие поля чаще всего используются для нахождения числа уникальных значений *(ID, таких как Watch ID, Visit ID в Яндекс.Метрике)* или как *Dimension* для уточнения детализации визуализации, это работает хорошо.

```text
COUNTD([myUInt256]) // Тоже отлично работает!
```
При использовании предварительного просмотра данных (Просмотр данных) таблицы с полями UInt64 ошибка теперь не появляется.
