---
sidebar_label: '连接提示'
sidebar_position: 3
slug: /integrations/tableau/connection-tips
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: '使用 ClickHouse 官方连接器时的 Tableau 连接提示。'
---


# 连接提示
## 初始 SQL 选项卡 {#initial-sql-tab}
如果在高级选项卡上启用了 *设置会话 ID* 复选框（默认启用），可以使用以下方式设置会话级别的 [设置](/operations/settings/settings/)：
```text
SET my_setting=value;
``` 
## 高级选项卡 {#advanced-tab}

在 99% 的情况下，您不需要使用高级选项卡，对于剩下的 1% 的情况，您可以使用以下设置：
- **自定义连接参数**。默认情况下，`socket_timeout` 已经指定，如果某些提取更新的时间太长，则可能需要更改此参数。该参数的值以毫秒为单位指定。其余参数可以在 [此处](https://github.com/ClickHouse/clickhouse-jdbc/blob/master/clickhouse-client/src/main/java/com/clickhouse/client/config/ClickHouseClientOption.java) 找到，添加时用逗号分隔
- **JDBC 驱动程序 custom_http_params**。该字段允许您通过将值传递给 [驱动程序的 `custom_http_params` 参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration) 将某些参数放入 ClickHouse 连接字符串。例如，当启用 *设置会话 ID* 复选框时，`session_id` 的指定方式如下
- **JDBC 驱动程序 `typeMappings`**。该字段允许您 [将 ClickHouse 数据类型映射传递给 JDBC 驱动程序使用的 Java 数据类型列表](https://github.com/ClickHouse/clickhouse-jdbc#configuration)。由于该参数，连接器会自动将大整数显示为字符串，您可以通过传递您的映射集来更改此行为 *(我不知道为什么)*：
    ```text
    UInt256=java.lang.Double,Int256=java.lang.Double
    ```
  在相应的部分中了解更多关于映射的信息

- **JDBC 驱动程序 URL 参数**。您可以在该字段中传递其余的 [驱动程序参数](https://github.com/ClickHouse/clickhouse-jdbc#configuration)，例如 `jdbcCompliance`。请注意，参数值必须以 URL 编码格式传递，并且在传递 `custom_http_params` 或 `typeMappings` 时，以及在高级选项卡前两个字段中，前两个字段的值具有更高的优先级
- **设置会话 ID** 复选框。它用于在初始 SQL 选项卡中设置会话级别设置，生成格式为 `"tableau-jdbc-connector-*{timestamp}*-*{number}*"` 的带时间戳和伪随机数的 `session_id`
## 对 UInt64、Int128、(U)Int256 数据类型的有限支持 {#limited-support-for-uint64-int128-uint256-data-types}
默认情况下，驱动程序将 *UInt64、Int128、(U)Int256* 类型的字段显示为字符串，**但只是显示，而不是转换**。这意味着当您尝试写入下一个计算字段时，将会出现错误：
```text
LEFT([myUInt256], 2) // 错误！
```
为了将大整数字段作为字符串进行处理，必须显式地将字段包装在 STR() 函数中

```text
LEFT(STR([myUInt256]), 2) // 正常工作！
```

然而，这些字段通常用于查找唯一值的数量 *(如 Yandex.Metrica 中的 Watch ID、Visit ID)*，或者作为 *维度* 来指定可视化的细节，这样的用法也很有效。

```text
COUNTD([myUInt256]) // 也正常工作！
```
在使用带有 UInt64 字段的表的数据预览（查看数据）时，现在不会出现错误。
