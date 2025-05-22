---
'sidebar_label': 'QuickSight'
'slug': '/integrations/quicksight'
'keywords':
- 'clickhouse'
- 'aws'
- 'amazon'
- 'QuickSight'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': '亚马逊 QuickSight 通过统一的商业智能 (BI) 为数据驱动的组织提供动力。'
'title': 'QuickSight'
---

import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import quicksight_01 from '@site/static/images/integrations/data-visualization/quicksight_01.png';
import quicksight_02 from '@site/static/images/integrations/data-visualization/quicksight_02.png';
import quicksight_03 from '@site/static/images/integrations/data-visualization/quicksight_03.png';
import quicksight_04 from '@site/static/images/integrations/data-visualization/quicksight_04.png';
import quicksight_05 from '@site/static/images/integrations/data-visualization/quicksight_05.png';
import quicksight_06 from '@site/static/images/integrations/data-visualization/quicksight_06.png';
import quicksight_07 from '@site/static/images/integrations/data-visualization/quicksight_07.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QuickSight

<CommunityMaintainedBadge/>

QuickSight 可以通过 MySQL 接口使用官方 MySQL 数据源和直接查询模式连接到本地 ClickHouse 设置（23.11 及以上版本）。

## On-premise ClickHouse Server Setup {#on-premise-clickhouse-server-setup}

请参考 [官方文档](/interfaces/mysql) 了解如何设置启用 MySQL 接口的 ClickHouse 服务器。

除了在服务器的 `config.xml` 中添加条目

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

外，还 _要求_ 对将使用 MySQL 接口的用户使用 [双 SHA1 密码加密](/operations/settings/settings-users#user-namepassword)。

从 shell 生成一个用双 SHA1 加密的随机密码：

```shell
PASSWORD=$(base64 < /dev/urandom | head -c16); echo "$PASSWORD"; echo -n "$PASSWORD" | sha1sum | tr -d '-' | xxd -r -p | sha1sum | tr -d '-'
```

输出应如下所示：

```text
LZOQYnqQN4L/T6L0
fbc958cc745a82188a51f30de69eebfc67c40ee4
```

第一行是生成的密码，第二行是我们可以用来配置 ClickHouse 的哈希值。

下面是使用生成哈希的 `mysql_user` 配置示例：

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

用您自己生成的双 SHA1 哈希替换 `password_double_sha1_hex` 条目。

QuickSight 还需要在 MySQL 用户档案中进行几个附加设置。

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

但是，建议将其分配给可供 MySQL 用户使用的不同档案，而不是默认的档案。

最后，配置 Clickhouse 服务器以侦听所需的 IP 地址。
在 `config.xml` 中，取消注释以下内容以侦听所有地址：

```bash
<listen_host>::</listen_host>
```

如果您可以使用 `mysql` 二进制文件，您可以从命令行测试连接。
使用上面的示例用户名 (`mysql_user`) 和密码 (`LZOQYnqQN4L/T6L0`) 从命令行的命令将是：

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

## Connecting QuickSight to ClickHouse {#connecting-quicksight-to-clickhouse}

首先，访问 [https://quicksight.aws.amazon.com](https://quicksight.aws.amazon.com)，导航到数据集并单击“新建数据集”：

<Image size="md" img={quicksight_01} alt="Amazon QuickSight dashboard showing the New dataset button in Datasets section" border />
<br/>

搜索与 QuickSight 打包的官方 MySQL 连接器（名称为 **MySQL**）：

<Image size="md" img={quicksight_02} alt="QuickSight data source selection screen with MySQL highlighted in search results" border />
<br/>

指定您的连接详细信息。请注意，MySQL 接口端口默认为 9004，具体情况可能因您的服务器配置而异。

<Image size="md" img={quicksight_03} alt="QuickSight MySQL connection configuration form with hostname, port, database and credential fields" border />
<br/>

现在，您有两种选择来获取 ClickHouse 中的数据。首先，您可以从列表中选择一个表：

<Image size="md" img={quicksight_04} alt="QuickSight table selection interface showing database tables available from ClickHouse" border />
<br/>

或者，您可以指定自定义 SQL 以获取数据：

<Image size="md" img={quicksight_05} alt="QuickSight custom SQL query editor for fetching data from ClickHouse" border />
<br/>

通过单击“编辑/预览数据”，您应该能够查看已检查的表结构或调整自定义 SQL，如果这是您决定获取数据的方式：

<Image size="md" img={quicksight_06} alt="QuickSight data preview showing table structure with columns and sample data" border />
<br/>

确保您在 UI 左下角选择了“直接查询”模式：

<Image size="md" img={quicksight_07} alt="QuickSight interface with Direct Query mode option highlighted in bottom corner" border />
<br/>

现在，您可以继续发布您的数据集并创建新的可视化！

## Known limitations {#known-limitations}

- SPICE 导入未按预期工作；请改用直接查询模式。详情请见 [#58553](https://github.com/ClickHouse/ClickHouse/issues/58553)。
