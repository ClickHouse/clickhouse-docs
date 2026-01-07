---
sidebar_label: 'JDBC'
sidebar_position: 2
keywords: ['clickhouse', 'jdbc', 'connect', 'integrate']
slug: /integrations/jdbc/jdbc-with-clickhouse
description: 'ClickHouse JDBC Bridge 使 ClickHouse 能够访问任何提供 JDBC 驱动程序的外部数据源的数据'
title: '使用 JDBC 将 ClickHouse 连接到外部数据源'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Jdbc01 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-01.png';
import Jdbc02 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-02.png';
import Jdbc03 from '@site/static/images/integrations/data-ingestion/dbms/jdbc-03.png';


# 使用 JDBC 将 ClickHouse 连接到外部数据源 {#connecting-clickhouse-to-external-data-sources-with-jdbc}

:::note
使用 JDBC 需要 ClickHouse JDBC Bridge，因此您需要在本地机器上使用 `clickhouse-local`，将数据库中的数据以流式方式传输到 ClickHouse Cloud。请访问文档 **Migrate** 部分中的 [**Using clickhouse-local**](/cloud/migration/clickhouse-local#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge) 页面了解详细信息。
:::

**概述：** <a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge" target="_blank">ClickHouse JDBC Bridge</a> 与 [jdbc 表函数（jdbc table function）](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎（JDBC table engine）](/engines/table-engines/integrations/jdbc.md) 结合使用，可以让 ClickHouse 访问任何提供 <a href="https://en.wikipedia.org/wiki/JDBC_driver" target="_blank">JDBC driver</a> 的外部数据源中的数据：

<Image img={Jdbc01} size="lg" alt="ClickHouse JDBC Bridge 架构图" background='white'/>
当某个外部数据源没有原生内置的[集成引擎](/engines/table-engines/integrations)、表函数或外部字典可用，但存在该数据源的 JDBC driver 时，这种方式就非常实用。

您可以使用 ClickHouse JDBC Bridge 进行读写操作，也可以并行连接多个外部数据源。例如，您可以在 ClickHouse 上实时对多个外部和内部数据源运行分布式查询。

在本教程中，我们将向您展示如何轻松安装、配置并运行 ClickHouse JDBC Bridge，从而将 ClickHouse 连接到外部数据源。本教程中我们将使用 MySQL 作为外部数据源。

让我们开始吧！

:::note 先决条件
您可以访问一台满足以下条件的机器：
1. 可以使用 Unix shell，并能够访问互联网
2. 已安装 <a href="https://www.gnu.org/software/wget/" target="_blank">wget</a>
3. 已安装较新的 **Java** 版本（例如 <a href="https://openjdk.java.net" target="_blank">OpenJDK</a> 版本 >= 17）
4. 已安装并运行较新的 **MySQL** 版本（例如 <a href="https://www.mysql.com" target="_blank">MySQL</a> 版本 >= 8）
5. 已安装并运行较新的 **ClickHouse** 版本（参见[安装指南](/getting-started/install/install.mdx)）
:::

## 在本地安装 ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-locally}

使用 ClickHouse JDBC Bridge 最简单的用法，是将它安装并运行在与 ClickHouse 相同的主机上：<Image img={Jdbc02} size="lg" alt="ClickHouse JDBC Bridge 本地部署示意图" background="white" />

首先连接到运行 ClickHouse 的那台机器的 Unix shell，并创建一个本地目录，稍后我们会将 ClickHouse JDBC Bridge 安装到该目录中（目录名称和位置可按需自定义）：

```bash
mkdir ~/clickhouse-jdbc-bridge
```

现在将 ClickHouse JDBC Bridge 的<a href="https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/" target="_blank">当前版本</a>下载到该文件夹中：

```bash
cd ~/clickhouse-jdbc-bridge
wget https://github.com/ClickHouse/clickhouse-jdbc-bridge/releases/download/v2.0.7/clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

为了能够连接到 MySQL，我们将创建一个命名的数据源：

```bash
 cd ~/clickhouse-jdbc-bridge
 mkdir -p config/datasources
 touch config/datasources/mysql8.json
```

现在可以将以下配置复制并粘贴到文件 `~/clickhouse-jdbc-bridge/config/datasources/mysql8.json` 中：

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
在上面的配置文件中：

* 你可以自由为数据源选择任意名称，我们在这里使用了 `mysql8`
* 在 `jdbcUrl` 的值中，你需要将 `<host>` 和 `<port>` 替换为与你正在运行的 MySQL 实例相对应的值，例如 `"jdbc:mysql://localhost:3306"`
* 你需要将 `<username>` 和 `<password>` 替换为你的 MySQL 凭据；如果你不使用密码，可以删除上面配置文件中的 `"password": "<password>"` 这一行
* 在 `driverUrls` 的值中，我们只是指定了一个 URL，用于下载 MySQL JDBC 驱动的<a href="https://repo1.maven.org/maven2/mysql/mysql-connector-java/" target="_blank">当前版本</a>。只需完成这些配置，ClickHouse JDBC Bridge 就会自动下载该 JDBC 驱动（到一个特定于操作系统的目录中）。
  :::

<br />

现在我们可以启动 ClickHouse JDBC Bridge 了：

```bash
 cd ~/clickhouse-jdbc-bridge
 java -jar clickhouse-jdbc-bridge-2.0.7-shaded.jar
```

:::note
我们已在前台模式下启动了 ClickHouse JDBC Bridge。要停止该 Bridge，可以将上面的 Unix shell 窗口切回到前台，然后按下 `CTRL+C`。
:::


## 在 ClickHouse 中使用 JDBC 连接 {#use-the-jdbc-connection-from-within-clickhouse}

ClickHouse 现在可以通过使用 [jdbc 表函数](/sql-reference/table-functions/jdbc.md) 或 [JDBC 表引擎](/engines/table-engines/integrations/jdbc.md) 来访问 MySQL 数据。

执行以下示例的最简单方式是将它们复制并粘贴到 [`clickhouse-client`](/interfaces/cli.md) 或 [Play UI](/interfaces/http) 中。

* jdbc 表函数：

```sql
 SELECT * FROM jdbc('mysql8', 'mydatabase', 'mytable');
```

:::note
作为 `jdbc` 表函数的第一个参数，我们使用的是上面配置的命名数据源的名称。
:::

* JDBC 表引擎：

```sql
 CREATE TABLE mytable (
      <column> <column_type>,
      ...
 )
 ENGINE = JDBC('mysql8', 'mydatabase', 'mytable');

 SELECT * FROM mytable;
```

:::note
作为 `jdbc` 引擎子句的第一个参数，我们使用的是上面配置的命名数据源名称。

ClickHouse JDBC 引擎表的 schema 必须与所连接的 MySQL 表的 schema 保持一致，例如列名及其顺序必须相同，且列的数据类型必须彼此兼容。
:::


## 在外部安装 ClickHouse JDBC Bridge {#install-the-clickhouse-jdbc-bridge-externally}

对于分布式 ClickHouse 集群（拥有多个 ClickHouse 主机的集群），在独立主机上以外部方式安装并运行 ClickHouse JDBC Bridge 是一种合理的做法：
<Image img={Jdbc03} size="lg" alt="ClickHouse JDBC Bridge 外部部署示意图" background='white'/>
这样做的优点是，每个 ClickHouse 主机都可以访问 JDBC Bridge。否则，就需要在每个需要通过 Bridge 访问外部数据源的 ClickHouse 实例上本地安装 JDBC Bridge。

要在外部安装 ClickHouse JDBC Bridge，请执行以下步骤：

1. 按照本指南第 1 节中的步骤，在专用主机上安装、配置并运行 ClickHouse JDBC Bridge。

2. 在每个 ClickHouse 主机上，将以下配置块添加到 <a href="https://clickhouse.com/docs/operations/configuration-files/#configuration_files" target="_blank">ClickHouse 服务器配置</a> 中（根据选择的配置格式，使用 XML 或 YAML 版本）：

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
- 需要将 `JDBC-Bridge-Host` 替换为专用 ClickHouse JDBC Bridge 主机的主机名或 IP 地址
- 此处使用的是 ClickHouse JDBC Bridge 的默认端口 `9019`，如果为 JDBC Bridge 配置了其他端口，则必须相应地调整上述配置
:::

[//]: # (## 4. Additional Info)

[//]: # ()

[//]: # (TODO: )

[//]: # (- mention that for jdbc table function it is more performant &#40;not two queries each time&#41; to also specify the schema as a parameter)

[//]: # ()

[//]: # (- mention ad hoc query vs table query, saved query, named query)

[//]: # ()

[//]: # (- mention insert into )