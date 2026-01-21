---
sidebar_label: '连接技巧'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '使用 ClickHouse 官方连接器时的 Tableau 连接技巧。'
title: '连接技巧'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 连接建议 \{#connection-tips\}

<ClickHouseSupportedBadge/>

## 初始 SQL 选项卡 \{#initial-sql-tab\}

如果在“高级”选项卡中勾选了 *Set Session ID* 复选框（默认勾选），就可以自由设置会话级[设置](/operations/settings/settings/)。

```text
SET my_setting=value;
```


## 高级选项卡 \{#advanced-tab\}

在 99% 的情况下你不需要使用高级选项卡，只有在剩下的 1% 情况下才可能需要使用以下设置：

- **Custom Connection Parameters**。默认情况下已经指定了 `socket_timeout`，如果某些抽取任务更新耗时非常长，可能需要调整此参数。该参数的值以毫秒为单位。其余可用参数可以在[这里](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)找到，将它们用逗号分隔后填入此字段。
- **JDBC Driver custom_http_params**。该字段允许你通过向[驱动的 `custom_http_params` 参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)传递值，将一些参数附加到 ClickHouse 连接字符串中。例如，当勾选 *Set Session ID* 复选框时，就可以通过这种方式指定 `session_id`。
- **JDBC Driver `typeMappings`**。该字段允许你[传递 ClickHouse 数据类型到 JDBC 驱动使用的 Java 数据类型的映射列表](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。连接器会借助此参数自动将大整数显示为字符串，你可以通过传入自己的映射集合来更改这一行为（*我不知道为什么*），例如使用
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  关于类型映射的更多信息请参阅相应章节。

- **JDBC Driver URL Parameters**。你可以在此字段中传递其他[驱动参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，例如 `jdbcCompliance`。请注意，参数值必须以 URL 编码格式传递；并且如果在此字段以及高级选项卡前两个字段中同时传递了 `custom_http_params` 或 `typeMappings`，则高级选项卡中前两个字段的取值优先级更高。
- **Set Session ID** 复选框。用于在 Initial SQL 选项卡中设置会话级别的设置，它会生成一个带有时间戳和伪随机数的 `session_id`，格式为 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`。

## 对 UInt64、Int128、(U)Int256 数据类型的有限支持 \{#limited-support-for-uint64-int128-uint256-data-types\}

默认情况下，驱动会将 *UInt64、Int128、(U)Int256* 类型的字段显示为字符串，**只是显示而非转换**。这意味着当您尝试编写如下计算字段时，将会报错。

```text
LEFT([myUInt256], 2) // Error!
```

若要像处理字符串一样处理大整数类型的字段，需要显式地用 STR() 函数包裹该字段。

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

然而，此类字段通常用于统计唯一值的个数（*例如 Yandex.Metrica 中的 Watch ID、Visit ID*），或者作为 *Dimension（维度）* 来控制可视化的细节粒度，在这些场景下工作良好。

```text
COUNTD([myUInt256]) // Works well too!
```

现在在使用包含 UInt64 字段的表的数据预览（View data）功能时，将不再出现错误。
