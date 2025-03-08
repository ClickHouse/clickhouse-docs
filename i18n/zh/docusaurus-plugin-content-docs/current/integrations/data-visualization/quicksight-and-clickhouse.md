---
sidebar_label: QuickSight
slug: /integrations/quicksight
keywords: [clickhouse, aws, amazon, QuickSight, mysql, connect, integrate, ui]
description: Amazon QuickSight 支持以统一的商业智能 (BI) 赋能以数据驱动的组织。
---

import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';


# QuickSight

QuickSight 可以通过官方 MySQL 数据源和 Direct Query 模式连接到本地 ClickHouse 设置 (23.11+)。

## 本地 ClickHouse 服务器设置 {#on-premise-clickhouse-server-setup}

请参阅 [官方文档](/interfaces/mysql) 了解如何设置启用 MySQL 接口的 ClickHouse 服务器。

除了在服务器的 `config.xml` 中添加条目外，

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

还必须为将使用 MySQL 接口的用户使用 [双重 SHA1 密码加密](/operations/settings/settings-users#user-namepassword)。

从 shell 生成一个随机密码并用双重 SHA1 加密：

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

输出应类似于以下内容：

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

第一行是生成的密码，第二行是我们可以用来配置 ClickHouse 的哈希。

以下是使用生成的哈希的 `mysql_user` 的示例配置：

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<users>
    <mysql_user>
        <password_double_sha1_hex>fbc958cc745a82188a51f30de69eebfc67c40ee4</password_double_sha1_hex>
        <networks>
            <ip>::/0</ip>
        </networks>
        <profile>default</profile>
        <quota>default</quota>
    </mysql_user>
</users>
```

将 `password_double_sha1_hex` 条目替换为您自己生成的双重 SHA1 哈希。

QuickSight 需要在 MySQL 用户的配置文件中添加几个其他设置。

`/etc/clickhouse-server/users.d/mysql_user.xml`

```xml
<profiles>
    <default>
        <prefer_column_name_to_alias>1</prefer_column_name_to_alias>
        <mysql_map_string_to_text_in_show_columns>1</mysql_map_string_to_text_in_show_columns>
        <mysql_map_fixed_string_to_text_in_show_columns>1</mysql_map_fixed_string_to_text_in_show_columns>
    </default>
</profiles>
```

但是，建议将其分配给可以由您的 MySQL 用户使用的不同配置文件，而不是默认配置文件。

最后，配置 Clickhouse 服务器监听所需的 IP 地址。
在 `config.xml` 中取消注释以监听所有地址：

```bash
<listen_host>::</listen_host> 
```

如果您有可用的 `mysql` 二进制文件，您可以从命令行测试连接。
使用样本用户名 (`mysql_user`) 和密码 (`LZOQYnqQN4L/T6L0`)，命令行将是：

```bash
mysql --protocol tcp -h localhost -u mysql_user -P 9004 --password=LZOQYnqQN4L/T6L0
```

```response
mysql> show databases;
+--------------------+
| name               |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| information_schema |
| system             |
+--------------------+
4 rows in set (0.00 sec)
Read 4 rows, 603.00 B in 0.00156 sec., 2564 rows/sec., 377.48 KiB/sec.
```

## 将 QuickSight 连接到 ClickHouse {#connecting-quicksight-to-clickhouse}

首先，访问 https://quicksight.aws.amazon.com，导航到数据集并点击“新建数据集”：

<img src={quicksight_01} class="image" alt="Creating a new dataset" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

搜索 QuickSight 附带的官方 MySQL 连接器（名为 **MySQL**）：

<img src={quicksight_02} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

指定您的连接详细信息。请注意，MySQL 接口端口默认为 9004，具体可能因您的服务器配置而异。

<img src={quicksight_03} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

现在，您有两种选择来从 ClickHouse 获取数据。首先，您可以从列表中选择一个表：

<img src={quicksight_04} class="image" alt="Selecting a table from the list" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

或者，您可以指定自定义 SQL 来获取数据：

<img src={quicksight_05} class="image" alt="Using custom SQL to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

通过点击“编辑/预览数据”，您应该能够查看被 introspected 的表结构或调整您的自定义 SQL，如果您决定通过这种方式访问数据：

<img src={quicksight_06} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

确保在 UI 左下角选择了“Direct Query”模式：

<img src={quicksight_07} class="image" alt="Choosing the Direct Query mode" style={{width: '50%', 'background-color': 'transparent'}}/>  
<br/>

现在，您可以继续发布数据集并创建新的可视化！

## 已知限制 {#known-limitations}

- SPICE 导入未按预期工作；请改用 Direct Query 模式。参见 [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553)。
