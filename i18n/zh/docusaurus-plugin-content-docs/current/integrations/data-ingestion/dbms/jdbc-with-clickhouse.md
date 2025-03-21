---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: '/integrations/jdbc/jdbc-with-clickhouse'
description: 'ClickHouse JDBC Bridge 允许 ClickHouse 从任何可用 JDBC 驱动程序的外部数据源访问数据'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# 使用 JDBC 将 ClickHouse 连接到外部数据源

:::note
使用 JDBC 需要 ClickHouse JDBC 桥接，因此您需要在本地机器上使用 `clickhouse-local` 从您的数据库将数据流式传输到 ClickHouse Cloud。请访问文档中 **Migrate** 部分的 [**使用 clickhouse-local**](/integrations/migration/clickhouse-local-etl.md#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) 页面以获取详细信息。
:::

**概述：** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> 结合 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 可以让 ClickHouse 访问任何可用 <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC 驱动程序</a> 的外部数据源：

<img src={Jdbc01} class="image" alt="ClickHouse JDBC Bridge"/>
这对于没有适用于该外部数据源的原生内置 [集成引擎](/engines/table-engines/integrations)、表函数或外部字典的情况非常有用，但该数据源存在 JDBC 驱动程序。

您可以使用 ClickHouse JDBC Bridge 进行读写操作。同时，可以并行连接多个外部数据源，例如，可以在 ClickHouse 中对多个外部和内部数据源进行分布式查询，实时访问。

在本节中，我们将向您展示如何轻松安装、配置和运行 ClickHouse JDBC Bridge，以便将 ClickHouse 连接到外部数据源。我们将使用 MySQL 作为本节的外部数据源。

让我们开始吧！

:::note 先决条件
您可以访问一台具有以下条件的机器：
1. Unix shell 和互联网连接
2. <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a> 已安装
3. 当前版本的 **Java**（例如 <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> 版本 >= 17）已安装
4. 当前版本的 **MySQL**（例如 <a href="https://www.mysql.com" target="_blank">MySQL</a> 版本 >=8）已安装并正在运行
5. 当前版本的 **ClickHouse** [已安装](/getting-started/install.md) 并正在运行
:::

## 本地安装 ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-locally}

使用 ClickHouse JDBC Bridge 最简单的方法是在 ClickHouse 正在运行的同一主机上安装和运行它：<img src={Jdbc02} class="image" alt="ClickHouse JDBC Bridge locally"/>

让我们首先连接到 ClickHouse 运行所在机器的 Unix shell，并创建一个本地文件夹，用于稍后安装 ClickHouse JDBC Bridge（可以根据需要命名文件夹并放置在任何位置）：
```bash
mkdir ~/clickhouse-jdbc-bridge
```

现在，我们将下载 <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">当前版本</a> 的 ClickHouse JDBC Bridge 到该文件夹中：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

为了能够连接到 MySQL，我们将创建一个命名数据源：

 ```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
 ```

 您现在可以将以下配置复制并粘贴到文件 `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` 中：

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
- 您可以为数据源使用任何名称，我们使用了 `mysql8`
- 在 `jdbcUrl` 的值中，您需要根据正在运行的 MySQL 实例用适当的值替换 `<host>` 和 `<port>`，例如：`"jdbc:mysql://localhost:3306"`
- 您需要用您的 MySQL 凭据替换 `<username>` 和 `<password>`，如果您不使用密码，可以删除配置文件中 `"password": "<password>"` 行
- 在 `driverUrls` 的值中，我们仅指定了一个可以下载 <a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">当前版本</a> MySQL JDBC 驱动程序的 URL。这就是我们需要做的，ClickHouse JDBC Bridge 将自动下载该 JDBC 驱动程序（到操作系统特定的目录中）。
:::

<br/>

现在我们准备启动 ClickHouse JDBC Bridge：
 ```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
 ```
:::note
我们在前台模式下启动了 ClickHouse JDBC Bridge。为了停止该桥，您可以将上面的 Unix shell 窗口恢复到前台并按 `CTRL+C`。
:::


## 从 ClickHouse 内部使用 JDBC 连接 {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse 现在可以通过使用 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 访问 MySQL 数据。

执行以下示例的最简单方法是复制并粘贴到 [`clickhouse-client`](/interfaces/cli.md) 或 [Play UI](/interfaces/http.md) 中。

- jdbc 表函数：

 ```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
 ```
:::note
作为 jdbc 表函数的第一个参数，我们使用上述配置中命名的数据源的名称。
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
作为 jdbc 引擎子句的第一个参数，我们使用上述配置中命名的数据源的名称。

ClickHouse JDBC 引擎表的架构和连接的 MySQL 表的架构必须一致，例如，列名和顺序必须相同，列数据类型必须兼容。
:::


## 外部安装 ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-externally}

对于分布式 ClickHouse 集群（拥有多个 ClickHouse 主机的集群），将 ClickHouse JDBC Bridge 外部安装并在其独立主机上运行是有意义的：
<img src={Jdbc03} class="image" alt="ClickHouse JDBC Bridge externally"/>
这有一个优点，即每个 ClickHouse 主机都可以访问 JDBC Bridge。否则，JDBC Bridge 将需要在每个应通过该桥访问外部数据源的 ClickHouse 实例上本地安装。

为了外部安装 ClickHouse JDBC Bridge，我们需要执行以下步骤：

1. 我们在专用主机上安装、配置并运行 ClickHouse JDBC Bridge，按照本指南第一部分中描述的步骤进行操作。

2. 在每个 ClickHouse 主机上，我们将以下配置块添加到 <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse 服务器配置</a>（根据您选择的配置格式，使用 XML 或 YAML 版本之一）：

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
   - 我们指定了默认的 ClickHouse JDBC Bridge 端口 `9019`，如果您为 JDBC Bridge 使用了其他端口，则必须相应地调整上述配置
:::

