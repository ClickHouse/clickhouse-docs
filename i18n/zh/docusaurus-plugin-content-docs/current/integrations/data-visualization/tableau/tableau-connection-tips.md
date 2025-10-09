---
'sidebar_label': 'Connection Tips'
'sidebar_position': 3
'slug': '/integrations/tableau/connection-tips'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': '使用 ClickHouse 官方连接器时的 Tableau 连接提示。'
'title': '连接提示'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';


# 连接技巧
## 初始 SQL 标签 {#initial-sql-tab}
如果高级标签上的 *设置会话 ID* 勾选框已被激活（默认情况下），请随意使用 
[会话级设置](/operations/settings/settings/) 
```text
SET my_setting=value;
```
## 高级标签 {#advanced-tab}

在 99% 的情况下，你不需要使用高级标签，对于剩下的 1%，你可以使用以下设置：
- **自定义连接参数**。默认情况下，已经指定了 `socket_timeout`，如果某些提取更新需要很长时间，可能需要更改此参数。此参数的值以毫秒为单位指定。其余参数可以在 [这里](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) 找到，用逗号分隔后添加到此字段中。
- **JDBC 驱动自定义 http 参数**。此字段允许你通过将值传递给驱动的 [`custom_http_params` 参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，将一些参数放入 ClickHouse 连接字符串中。例如，当 *设置会话 ID* 勾选框被激活时，就是这样指定 `session_id` 的。
- **JDBC 驱动 `typeMappings`**。此字段允许你 [将 ClickHouse 数据类型映射到 JDBC 驱动使用的 Java 数据类型](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。由于此参数，连接器会自动将大整数显示为字符串，你可以通过传递自己的映射集来更改这一点 *(我不知道为什么)* 
```text
UInt256=java.lang.Double,Int256=java.lang.Double
```
  在相应的章节中了解更多关于映射的信息

- **JDBC 驱动 URL 参数**。你可以在此字段中传递其余的 [驱动参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，例如 `jdbcCompliance`。请注意，参数值必须以 URL 编码格式传递，在此字段及高级标签的前两个字段中传递 `custom_http_params` 或 `typeMappings` 时，前两个字段的值具有更高的优先级。
- **设置会话 ID** 勾选框。它用于在初始 SQL 标签中设置会话级别的设置，生成一个带有时间戳和伪随机数的 `session_id`，格式为 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`。
## 对 UInt64、Int128、(U)Int256 数据类型的有限支持 {#limited-support-for-uint64-int128-uint256-data-types}
默认情况下，驱动会将 *UInt64、Int128、(U)Int256* 类型的字段显示为字符串，**但它是显示，而不是转换**。这意味着当你尝试写入下一个计算字段时，会出现错误
```text
LEFT([myUInt256], 2) // Error!
```
为了将大整数字段作为字符串使用，必须显式地将字段包裹在 STR() 函数中。

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

然而，此类字段通常用于查找唯一值的数量 *(如 Watch ID、Yandex.Metrica 中的 Visit ID)*，或作为 *维度* 来指定可视化的细节，这样的使用效果良好。

```text
COUNTD([myUInt256]) // Works well too!
```
当使用具有 UInt64 字段的表的数据预览（查看数据）时，现在不会出现错误。
