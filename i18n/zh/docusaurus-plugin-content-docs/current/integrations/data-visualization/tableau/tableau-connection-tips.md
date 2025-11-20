---
sidebar_label: '连接提示'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '使用 ClickHouse 官方连接器时的 Tableau 连接建议。'
title: '连接提示'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 连接说明

<ClickHouseSupportedBadge/>



## 初始 SQL 选项卡 {#initial-sql-tab}

如果在高级选项卡中启用了 _Set Session ID_ 复选框（默认启用），您可以使用以下方式设置会话级别的[设置](/operations/settings/settings/)：

```text
SET my_setting=value;
```


## 高级选项卡 {#advanced-tab}

在 99% 的情况下您不需要使用高级选项卡,对于剩余的 1% 情况,您可以使用以下设置:

- **自定义连接参数**。默认情况下已指定 `socket_timeout`,如果某些数据提取更新时间过长,可能需要更改此参数。此参数的值以毫秒为单位。其余参数可以在[此处](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java)找到,在此字段中以逗号分隔添加它们
- **JDBC 驱动程序 custom_http_params**。此字段允许您通过向[驱动程序的 `custom_http_params` 参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)传递值,将某些参数添加到 ClickHouse 连接字符串中。例如,当激活 _Set Session ID_ 复选框时,就是这样指定 `session_id` 的
- **JDBC 驱动程序 `typeMappings`**。此字段允许您[传递 ClickHouse 数据类型到 JDBC 驱动程序使用的 Java 数据类型的映射列表](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。连接器借助此参数会自动将大整数显示为字符串,您可以通过传递自己的映射集来更改此行为 _(我不知道为什么)_,使用
  ```text
  UInt256=java.lang.Double,Int256=java.lang.Double
  ```
  在相应章节中阅读更多关于映射的信息


- **JDBC 驱动 URL 参数**。您可以在此字段中传递其余的[驱动参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration),例如 `jdbcCompliance`。请注意,参数值必须以 URL 编码格式传递。如果在此字段和高级选项卡的前置字段中同时传递了 `custom_http_params` 或 `typeMappings`,则高级选项卡中前两个字段的值具有更高优先级
- **Set Session ID** 复选框。用于在 Initial SQL 选项卡中设置会话级设置,会生成格式为 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` 的 `session_id`,其中包含时间戳和伪随机数

## UInt64、Int128、(U)Int256 数据类型的有限支持 {#limited-support-for-uint64-int128-uint256-data-types}

默认情况下,驱动程序将 _UInt64、Int128、(U)Int256_ 类型的字段显示为字符串,**但这只是显示而非转换**。这意味着当您尝试编写计算字段时,将会出现错误

```text
LEFT([myUInt256], 2) // 错误!
```

为了像处理字符串一样处理大整数字段,需要显式地将字段包装在 STR() 函数中

```text
LEFT(STR([myUInt256]), 2) // 正常工作!
```

不过,此类字段最常用于查找唯一值的数量 _(例如 Yandex.Metrica 中的 Watch ID、Visit ID 等 ID)_ 或作为 _维度_ 来指定可视化的详细程度,这些场景下效果很好。

```text
COUNTD([myUInt256]) // 同样正常工作!
```

现在使用包含 UInt64 字段的表的数据预览(查看数据)功能时,不会出现错误。
