---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBC Bridge 允许 ClickHouse 访问任何提供 JDBC 驱动的外部数据源中的数据'
title: '使用 JDBC 将 ClickHouse 连接到外部数据源'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# 使用 JDBC 将 ClickHouse 连接到外部数据源

:::note
使用 JDBC 需要 ClickHouse JDBC Bridge，因此你需要在本地机器上使用 `clickhouse-local`，将数据库中的数据流式传输到 ClickHouse Cloud。有关详情，请访问文档 **Migrate** 部分中的 [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) 页面。
:::

**概览：** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> 结合 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 使用，可以让 ClickHouse 访问任意具备可用 <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC 驱动</a> 的外部数据源：

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge 架构图" background='white'/>
当外部数据源没有原生内置的[集成引擎](/engines/table-engines/integrations)、表函数或外部字典，但存在该数据源的 JDBC 驱动时，这种方式就非常实用。

你可以使用 ClickHouse JDBC Bridge 进行读写操作，并且可以并行连接多个外部数据源。比如，你可以在 ClickHouse 中跨多个外部和内部数据源实时运行分布式查询。

在本课程中，我们将演示如何轻松安装、配置和运行 ClickHouse JDBC Bridge，以将 ClickHouse 连接到外部数据源。本课程将使用 MySQL 作为外部数据源。

让我们开始吧！

:::note Prerequisites
你可以访问一台具备以下条件的机器：
1. 拥有 Unix shell 和互联网访问权限
2. 安装了 <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. 安装了当前版本的 **Java**（例如 <a href="https://openjdk.java.net" target="_blank">OpenJDK</a>，版本 >= 17）
4. 安装并运行了当前版本的 **MySQL**（例如 <a href="https://www.mysql.com" target="_blank">MySQL</a>，版本 >= 8）
5. 安装并运行了当前版本的 **ClickHouse**（[安装说明](/getting-started/install/install.mdx)）
:::



## 在本地安装 ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-locally}

使用 ClickHouse JDBC Bridge 最简单的方式是将其安装并运行在 ClickHouse 所在的同一主机上:<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge 本地部署图" background='white'/>

首先连接到运行 ClickHouse 的机器上的 Unix shell,并创建一个本地文件夹,稍后我们将在其中安装 ClickHouse JDBC Bridge(您可以自由命名该文件夹并将其放置在任意位置):

```bash
mkdir ~/clickhouse-jdbc-bridge
```

现在将 ClickHouse JDBC Bridge 的<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">当前版本</a>下载到该文件夹中:

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

为了能够连接到 MySQL,我们需要创建一个命名数据源:

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

现在您可以将以下配置复制并粘贴到文件 `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` 中:

```json
{
  "mysql8": {
    "driverUrls": [
      "https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar"
    ],
    "jdbcUrl": "jdbc:mysql://<host>:<port>",
    "username": "<username>",
    "password": "<password>"
  }
}
```

:::note
在上述配置文件中

- 您可以为数据源使用任意名称,我们使用了 `mysql8`
- 在 `jdbcUrl` 的值中,您需要根据正在运行的 MySQL 实例将 `<host>` 和 `<port>` 替换为相应的值,例如 `"jdbc:mysql://localhost:3306"`
- 您需要将 `<username>` 和 `<password>` 替换为您的 MySQL 凭据,如果不使用密码,可以删除上述配置文件中的 `"password": "<password>"` 行
- 在 `driverUrls` 的值中,我们只需指定一个可以下载 MySQL JDBC 驱动程序<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">当前版本</a>的 URL。这就是我们需要做的全部,ClickHouse JDBC Bridge 将自动下载该 JDBC 驱动程序(到操作系统特定的目录中)。
  :::

<br />

现在我们可以启动 ClickHouse JDBC Bridge 了:

```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

:::note
我们以前台模式启动了 ClickHouse JDBC Bridge。要停止 Bridge,您可以将上述 Unix shell 窗口切换到前台并按 `CTRL+C`。
:::


## 在 ClickHouse 中使用 JDBC 连接 {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse 可以通过 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 来访问 MySQL 数据。

执行以下示例最简单的方法是将它们复制粘贴到 [`clickhouse-client`](/interfaces/cli.md) 或 [Play UI](/interfaces/http.md) 中。

- jdbc 表函数:

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```

:::note
jdbc 表函数的第一个参数使用的是我们在上面配置的命名数据源的名称。
:::

- JDBC 表引擎:

```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```

:::note
jdbc 引擎子句的第一个参数使用的是我们在上面配置的命名数据源的名称

ClickHouse JDBC 引擎表的结构必须与所连接的 MySQL 表的结构保持一致,例如列名和顺序必须相同,列数据类型必须兼容
:::


## 外部安装 ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-externally}

对于分布式 ClickHouse 集群(包含多个 ClickHouse 主机的集群),建议在独立主机上外部安装和运行 ClickHouse JDBC Bridge:

<Image
  img={Jdbc03}
  size='lg'
  alt='ClickHouse JDBC Bridge 外部部署架构图'
  background='white'
/>
这样做的优势在于每个 ClickHouse 主机都可以访问 JDBC Bridge。
否则,需要为每个需要通过 Bridge 访问外部数据源的 ClickHouse
实例分别进行本地安装。

要外部安装 ClickHouse JDBC Bridge,请执行以下步骤:

1. 按照本指南第 1 节中描述的步骤,在专用主机上安装、配置并运行 ClickHouse JDBC Bridge。

2. 在每个 ClickHouse 主机上,将以下配置块添加到 <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse 服务器配置</a>中(根据您选择的配置格式,使用 XML 或 YAML 版本):

<Tabs>
<TabItem value="xml" label="XML">

```xml
<jdbc_bridge>
   <host>JDBC-Bridge-Host</host>
   <port>9019</port>
</jdbc_bridge>
```

</TabItem>
<TabItem value="yaml" label="YAML">

```yaml
jdbc_bridge:
  host: JDBC-Bridge-Host
  port: 9019
```

</TabItem>
</Tabs>

:::note

- 您需要将 `JDBC-Bridge-Host` 替换为专用 ClickHouse JDBC Bridge 主机的主机名或 IP 地址
- 我们指定了默认的 ClickHouse JDBC Bridge 端口 `9019`,如果您为 JDBC Bridge 使用了不同的端口,则必须相应调整上述配置
  :::

[//]: # "## 4. Additional Info"
[//]: #
[//]: # "TODO: "
[//]: # "- mention that for jdbc table function it is more performant (not two queries each time) to also specify the schema as a parameter"
[//]: #
[//]: # "- mention ad hoc query vs table query, saved query, named query"
[//]: #
[//]: # "- mention insert into "
