---
sidebar_label: 'QuickSight'
slug: /integrations/quicksight
keywords: ['clickhouse', 'aws', 'amazon', 'QuickSight', 'mysql', 'connect', 'integrate', 'ui']
description: 'Amazon QuickSight 为数据驱动型组织提供统一的商业智能 (BI) 支持。'
title: 'QuickSight'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import MySQLOnPremiseSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# QuickSight \\{#quicksight\\}

<ClickHouseSupportedBadge/>

QuickSight 可以通过官方 MySQL 数据源，并使用 Direct Query 模式，经由 MySQL 接口连接到本地部署的 ClickHouse 集群（23.11+）。

## 本地部署 ClickHouse 服务器的设置 \\{#on-premise-clickhouse-server-setup\\}

请参阅[官方文档](/interfaces/mysql)，了解如何设置启用了 MySQL 接口的 ClickHouse 服务器。

除了在服务器的 `config.xml` 中添加一条配置项之外

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

对于将要使用 MySQL 接口的用户，还*必须*使用 [Double SHA1 密码加密](/operations/settings/settings-users#user-namepassword)。

在 shell 中生成一个使用 Double SHA1 加密的随机密码：

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

输出结果应类似如下所示：

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

第一行是生成的密码，第二行是我们可用于配置 ClickHouse 的哈希。

下面是一个使用该生成哈希的 `mysql_user` 配置示例：

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

将 `password_double_sha1_hex` 条目替换为你自己生成的 Double SHA1 哈希值。

QuickSight 需要在该 MySQL 用户的配置中添加若干额外设置。

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

不过，建议将其分配给一个不同的 profile，这样你的 MySQL 用户可以使用该 profile，而不是使用默认的那个。

最后，配置 ClickHouse Server 监听所需的 IP 地址。
在 `config.xml` 中，取消注释下面的配置以监听所有地址：

```bash
<listen_host>::</listen_host>
```

如果本机已安装 `mysql` 可执行文件，可以在命令行中测试连接。
使用上文示例中的用户名（`mysql_user`）和密码（`LZOQYnqQN4L/T6L0`），命令行命令如下：

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

## 将 QuickSight 连接到 ClickHouse \\{#connecting-quicksight-to-clickhouse\\}

首先，访问 [https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com)，进入 Datasets，然后单击 "New dataset"（新建数据集）：

<Image size="md" img={quicksight_01} alt="Amazon QuickSight 仪表盘，在 Datasets 区域显示 New dataset 按钮" border />
<br/>

搜索 QuickSight 自带的官方 MySQL 连接器（名称为 **MySQL**）：

<Image size="md" img={quicksight_02} alt="QuickSight 数据源选择界面，搜索结果中高亮显示 MySQL" border />
<br/>

填写连接参数。请注意，MySQL 接口端口默认为 9004，
具体端口可能会因服务器配置不同而有所差异。

<Image size="md" img={quicksight_03} alt="QuickSight MySQL 连接配置表单，包含主机名、端口、数据库和凭证字段" border />
<br/>

现在，您有两种方式可以从 ClickHouse 获取数据。第一种方式是从列表中选择一张表：

<Image size="md" img={quicksight_04} alt="QuickSight 表选择界面，显示来自 ClickHouse 的可用数据库表" border />
<br/>

或者，您也可以编写自定义 SQL 来获取数据：

<Image size="md" img={quicksight_05} alt="QuickSight 自定义 SQL 查询编辑器，用于从 ClickHouse 获取数据" border />
<br/>

单击 "Edit/Preview data"（编辑/预览数据）后，您应该能够看到解析出的表结构，或者根据需要调整自定义 SQL（如果您选择通过这种方式访问数据）：

<Image size="md" img={quicksight_06} alt="QuickSight 数据预览界面，显示包含列和示例数据的表结构" border />
<br/>

请确保在 UI 左下角选中了 "Direct Query"（直接查询）模式：

<Image size="md" img={quicksight_07} alt="QuickSight 界面，在左下角高亮显示 Direct Query 模式选项" border />
<br/>

现在，您可以继续发布数据集并创建新的可视化了！

## 已知限制 \\{#known-limitations\\}

- SPICE 导入功能不能正常工作；请改用 Direct Query 模式。请参见 [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553)。
