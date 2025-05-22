---
'sidebar_label': '连接技巧'
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
'description': '使用 ClickHouse 官方连接器时的 Tableau 连接技巧。'
'title': '连接技巧'
---

import Image from '@theme/IdealImage';


# 连接提示
## 初始 SQL 选项卡 {#initial-sql-tab}
如果高级选项卡上的 *设置会话 ID* 复选框已激活（默认为启用），请随意使用会话级 [设置](/operations/settings/settings/) 进行设置
```text
SET my_setting=value;
```
## 高级选项卡 {#advanced-tab}

在 99% 的情况下，您无需使用高级选项卡，对于剩余的 1%，您可以使用以下设置：
- **自定义连接参数**。默认情况下，`socket_timeout` 已经指定，如果某些提取更新的时间非常长，则可能需要更改此参数。此参数的值以毫秒为单位。其余参数可在 [这里](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) 查找，使用逗号分隔将它们添加到此字段中。
- **JDBC 驱动程序 custom_http_params**。该字段允许您通过将值传递给驱动程序的 [`custom_http_params` 参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，将一些参数放入 ClickHouse 连接字符串中。例如，当 *设置会话 ID* 复选框激活时，`session_id` 是这样指定的。
- **JDBC 驱动程序 `typeMappings`**。该字段允许您 [将 ClickHouse 数据类型映射列表传递给 JDBC 驱动程序使用的 Java 数据类型](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。得益于此参数，连接器会自动将大整数显示为字符串，您可以通过传递您的映射集来更改此设置 *(我不知道为什么)*，使用
```text
UInt256=java.lang.Double,Int256=java.lang.Double
```
  在相应部分中阅读更多关于映射的信息。

- **JDBC 驱动程序 URL 参数**。您可以将其余的 [驱动程序参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，例如 `jdbcCompliance`，传递到此字段中。请注意，参数值必须以 URL 编码格式传递，并且在此字段和高级选项卡的前面字段中传递 `custom_http_params` 或 `typeMappings` 的情况下，前两个字段的值具有更高的优先级。
- **设置会话 ID** 复选框。它用于在初始 SQL 选项卡中设置会话级别的设置，生成一个带有时间戳和伪随机数的 `session_id`，格式为 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"`。
## 对 UInt64，Int128，(U)Int256 数据类型的支持有限 {#limited-support-for-uint64-int128-uint256-data-types}
默认情况下，驱动程序将 *UInt64，Int128，(U)Int256* 类型的字段显示为字符串，**但它显示，而不是转换**。这意味着当您尝试写入下一个计算字段时，将收到错误
```text
LEFT([myUInt256], 2) // Error!
```
为了将大整数字段作为字符串处理，必须显式使用 STR() 函数包装字段。

```text
LEFT(STR([myUInt256]), 2) // Works well!
```

然而，这些字段最常用于查找唯一值的数量 *(例如 Yandex.Metrica 中的 Watch ID、Visit ID)* 或作为 *维度* 来指定可视化的细节，这样使用效果很好。

```text
COUNTD([myUInt256]) // Works well too!
```
在使用具有 UInt64 字段的表的数据预览（查看数据）时，现在不会出现错误。
