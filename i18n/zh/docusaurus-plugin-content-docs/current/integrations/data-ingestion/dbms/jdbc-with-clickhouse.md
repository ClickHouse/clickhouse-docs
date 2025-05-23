---
'sidebar_label': 'JDBC'
'sidebar_position': 2
'keywords':
- 'clickhouse'
- 'jdbc'
- 'connect'
- 'integrate'
'slug': '/integrations/jdbc/jdbc-with-clickhouse'
'description': 'ClickHouse JDBC Bridge允许ClickHouse访问任何可用JDBC驱动程序的外部数据源中的数据'
'title': '使用JDBC连接ClickHouse到外部数据源'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# 将 ClickHouse 连接到外部数据源的 JDBC

:::note
使用 JDBC 需要 ClickHouse JDBC 桥，因此您需要在本地机器上使用 `clickhouse-local` 将数据从您的数据库流式传输到 ClickHouse Cloud。请访问文档中 **迁移** 部分的 [**使用 clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) 页面以获取详细信息。
:::

**概述：** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC 桥</a> 结合 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 使 ClickHouse 能够访问任何外部数据源的数据，只要该数据源可用 <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC 驱动程序</a>：

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge architecture diagram" background='white'/>
当没有可用的原生内置 [集成引擎](/engines/table-engines/integrations)、表函数或外部字典时，这非常方便，但该数据源存在 JDBC 驱动程序。

您可以使用 ClickHouse JDBC 桥进行读取和写入。同时可以并行访问多个外部数据源，例如，您可以在 ClickHouse 上跨多个外部和内部数据源实时运行分布式查询。

在本课中，我们将展示如何轻松安装、配置和运行 ClickHouse JDBC 桥，以便将 ClickHouse 连接到外部数据源。我们将使用 MySQL 作为本课的外部数据源。

让我们开始吧！

:::note 先决条件
您可以访问以下具有的机器：
1. 一个具有 Unix shell 和互联网访问的机器
2. 已安装 <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. 已安装最新版本的 **Java** （例如 <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> 版本 >= 17）
4. 已安装并运行最新版本的 **MySQL** （例如 <a href="https://www.mysql.com" target="_blank">MySQL</a> 版本 >=8）
5. 已安装并运行最新版本的 **ClickHouse** [安装](/getting-started/install/install.mdx)
:::

## 在本地安装 ClickHouse JDBC 桥 {#install-the-clickhouse-jdbc-bridge-locally}

使用 ClickHouse JDBC 桥的最简单方法是在与 ClickHouse 运行的同一主机上安装和运行它：<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge locally deployment diagram" background='white'/>

我们首先连接到运行 ClickHouse 的机器上的 Unix shell，并创建一个本地文件夹，以便稍后在其中安装 ClickHouse JDBC 桥（您可以随意命名文件夹并放置在您喜欢的位置）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

现在我们将 <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">当前版本</a> 的 ClickHouse JDBC 桥下载到该文件夹中：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

为了能够连接到 MySQL，我们创建一个命名数据源：

```bash
cd ~/clickhouse-jdbc-bridge
mkdir -p config/datasources
touch config/datasources/mysql8.json
```

现在您可以将以下配置复制并粘贴到文件 `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` 中：

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
在上面的配置文件中
- 您可以自由使用任何您喜欢的命名数据源，我们使用了 `mysql8`
- 在 `jdbcUrl` 的值中，您需要将 `<host>` 和 `<port>` 替换为根据您运行的 MySQL 实例适当的值，例如 `"jdbc:mysql://localhost:3306"`
- 您需要将 `<username>` 和 `<password>` 替换为您的 MySQL 凭据，如果您不使用密码，可以删除配置文件中 `"password": "<password>"` 这一行
- 在 `driverUrls` 的值中，我们只指定了一个 URL，以便从中下载 <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">当前版本</a> 的 MySQL JDBC 驱动程序。就这样，ClickHouse JDBC 桥将自动下载该 JDBC 驱动程序（到操作系统特定目录中）。
:::

<br/>

现在我们准备启动 ClickHouse JDBC 桥：
```bash
cd ~/clickhouse-jdbc-bridge
java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```
:::note
我们在前台模式下启动了 ClickHouse JDBC 桥。为了停止桥接，您可以将上面的 Unix shell 窗口带到前台并按 `CTRL+C`。
:::


## 从 ClickHouse 内部使用 JDBC 连接 {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse 现在可以通过使用 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 来访问 MySQL 数据。

执行以下示例的最简单方法是将它们复制并粘贴到 [`clickhouse-client`](/interfaces/cli.md) 或 [Play UI](/interfaces/http.md) 中。

- jdbc 表函数：

```sql
SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```
:::note
作为 jdbc 表函数的第一个参数，我们使用上面配置的命名数据源的名称。
:::



- JDBC 表引擎：
```sql
CREATE TABLE mytable (
     <column> <column_type>,
     ...
)
ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

SELECT * FROM mytable;
```
:::note
作为 jdbc 引擎子句的第一个参数，我们使用上面配置的命名数据源的名称。

ClickHouse JDBC 引擎表的架构和连接的 MySQL 表的架构必须对齐，例如，列名和顺序必须相同，并且列的数据类型必须兼容。
:::




## 外部安装 ClickHouse JDBC 桥 {#install-the-clickhouse-jdbc-bridge-externally}

对于分布式 ClickHouse 集群（多个 ClickHouse 主机的集群），在其自己的主机上安装和运行 ClickHouse JDBC 桥是有意义的：
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge external deployment diagram" background='white'/>
这有一个优势，即每个 ClickHouse 主机都可以访问 JDBC 桥。否则，每个需要通过桥接访问外部数据源的 ClickHouse 实例都需要在本地安装 JDBC 桥。

为了在外部安装 ClickHouse JDBC 桥，我们执行以下步骤：

1. 我们在专用主机上安装、配置和运行 ClickHouse JDBC 桥，按照本指南第一部分中描述的步骤进行操作。

2. 在每个 ClickHouse 主机上，我们将以下配置块添加到 <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse 服务器配置</a> 中（根据您选择的配置格式，使用 XML 或 YAML 版本）：

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
   - 您需要将 `JDBC-Bridge-Host` 替换为专用 ClickHouse JDBC 桥主机的主机名或 IP 地址
   - 我们指定了默认的 ClickHouse JDBC 桥端口 `9019`，如果您使用不同的端口，那么您必须相应地调整上面的配置
:::

