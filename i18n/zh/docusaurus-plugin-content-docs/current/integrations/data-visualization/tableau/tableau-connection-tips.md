---
sidebar_label: '连接提示'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '使用 ClickHouse 官方连接器时的 Tableau 连接建议。'
title: '连接提示'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 连接建议 \{#connection-tips\}

<ClickHouseSupportedBadge/>

## Initial SQL 选项卡 \{#initial-sql-tab\}

如果在 Advanced 选项卡中启用了 *Set Session ID* 复选框（默认启用），你可以使用以下语句设置会话级别的[设置](/operations/settings/settings/)：

```text
SET my_setting=value;
```


## 高级选项卡 \{#advanced-tab\}

在 99% 的情况下，无需使用“高级”选项卡；对于剩余 1% 的场景，可以使用以下设置：

- **Custom Connection Parameters**。默认已经指定了 `socket_timeout`，如果某些抽取更新耗时非常长，可能需要调整此参数。该参数的取值单位为毫秒。其余可用参数可以在[这里](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)找到，将它们以逗号分隔的形式添加到此字段中
- **JDBC Driver custom_http_params**。此字段允许通过向[驱动的 `custom_http_params` 参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)传递值，将部分参数附加到 ClickHouse 连接字符串中。例如，当勾选 *Set Session ID* 复选框时，就会通过这种方式指定 `session_id`
- **JDBC Driver `typeMappings`**。此字段允许你[传递 ClickHouse 数据类型到 JDBC 驱动使用的 Java 数据类型的映射列表](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。连接器得益于此参数会自动将大整数显示为字符串，你可以通过传入自己的映射 Set（*我不知道为什么*）来修改这一行为，例如：
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  关于映射的更多内容，请参见相应章节

- **JDBC Driver URL Parameters**。可以在此字段中传递其余[驱动参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，例如 `jdbcCompliance`。请注意，参数值必须以 URL 编码格式传递；并且当在此字段以及高级选项卡前面几个字段中传递 `custom_http_params` 或 `typeMappings` 时，高级选项卡中前两个字段的取值具有更高优先级
- **Set Session ID** 复选框。用于在 Initial SQL 选项卡中设置会话级别的设置，会以 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` 的格式生成包含时间戳和伪随机数的 `session_id`

## 对 UInt64、Int128、(U)Int256 数据类型的支持有限 \{#limited-support-for-uint64-int128-uint256-data-types\}

默认情况下，驱动程序会将 *UInt64, Int128, (U)Int256* 类型的字段显示为字符串，**只是显示而不进行转换**。这意味着当你尝试写入后续的计算字段时，就会报错

```text
LEFT([myUInt256], 2) // Error!
```

要像处理字符串一样处理大整数字段，必须将该字段显式包裹在 STR() 函数中

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

然而，此类字段最常用于统计唯一值的数量（*ID，例如 Yandex.Metrica 中的 Watch ID、Visit ID*），或作为一个 *Dimension* 来指定可视化的细节粒度，在这些用途中表现良好。

```text
COUNTD([myUInt256]) // Works well too!
```

在使用表的数据预览（View data）功能查看包含 UInt64 字段的表时，现在不会再出现错误。
