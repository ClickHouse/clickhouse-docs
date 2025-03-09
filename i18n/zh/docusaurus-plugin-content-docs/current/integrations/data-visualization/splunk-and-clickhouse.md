---
sidebar_label: Splunk
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'integration', 'data visualization']
description: '连接 Splunk 仪表盘到 ClickHouse'
---

import splunk_1 from '@site/static/images/integrations/splunk/splunk-1.png';
import splunk_2 from '@site/static/images/integrations/splunk/splunk-2.png';
import splunk_3 from '@site/static/images/integrations/splunk/splunk-3.png';
import splunk_4 from '@site/static/images/integrations/splunk/splunk-4.png';
import splunk_5 from '@site/static/images/integrations/splunk/splunk-5.png';
import splunk_6 from '@site/static/images/integrations/splunk/splunk-6.png';
import splunk_7 from '@site/static/images/integrations/splunk/splunk-7.png';
import splunk_8 from '@site/static/images/integrations/splunk/splunk-8.png';
import splunk_9 from '@site/static/images/integrations/splunk/splunk-9.png';
import splunk_10 from '@site/static/images/integrations/splunk/splunk-10.png';


# 连接 Splunk 到 ClickHouse

Splunk 是一种流行的安全和可观察性技术。它也是一个强大的搜索和仪表盘引擎。还有数以百计的 Splunk 应用程序可用于解决不同的用例。

对于 ClickHouse，我们利用 [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)，它与高性能的 ClickHouse JDBC 驱动程序简单集成，能够直接查询 ClickHouse 中的表。

此集成的理想用例是在使用 ClickHouse 处理大型数据源时，例如 NetFlow、Avro 或 Protobuf 二进制数据、DNS、VPC 流日志以及其他可以与您团队共享的 OTEL 日志，以便在 Splunk 上搜索和创建仪表盘。通过这种方式，数据不会被导入到 Splunk 索引层，而是直接从 ClickHouse 查询，类似于其他可视化集成，如 [Metabase](https://www.metabase.com/) 或 [Superset](https://superset.apache.org/)。

## 目标​ {#goal}

在本指南中，我们将使用 ClickHouse JDBC 驱动程序将 ClickHouse 连接到 Splunk。我们将安装本地版本的 Splunk Enterprise，但我们不会索引任何数据。相反，我们通过 DB Connect 查询引擎使用搜索功能。

使用本指南，您将能够创建一个连接到 ClickHouse 的仪表盘，类似于这样：

<img src={splunk_1} class="image" alt="Splunk"/>

:::note
本指南使用 [纽约市出租车数据集](/getting-started/example-datasets/nyc-taxi)。您可以从 [我们的文档](http://localhost:3000/docs/getting-started/example-datasets) 中使用许多其他数据集。
:::

## 前提条件 {#prerequisites}

在开始之前，您需要：
- Splunk Enterprise 以使用搜索头功能
- [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) 要求已安装在您的操作系统或容器上
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- 对及时实例的管理员或 SSH 访问权限
- ClickHouse 连接详细信息（如果您使用的是 ClickHouse Cloud，请参见 [这里](/integrations/metabase#1-gather-your-connection-details)）

## 在 Splunk Enterprise 上安装和配置 DB Connect {#install-and-configure-db-connect-on-splunk-enterprise}

您首先必须在 Splunk Enterprise 实例上安装 Java Runtime Environment。如果您使用 Docker，可以使用命令 `microdnf install java-11-openjdk`。

记下 `java_home` 路径：`java -XshowSettings:properties -version`。

确保在 Splunk Enterprise 上安装了 DB Connect 应用程序。您可以在 Splunk Web UI 的应用程序部分找到它：
- 登录 Splunk Web 并转到 应用程序 > 查找更多应用程序
- 使用搜索框查找 DB Connect
- 点击 Splunk DB Connect 旁边的绿色“安装”按钮
- 点击“重启 Splunk”

如果您在安装 DB Connect 应用程序时遇到问题，请参见 [该链接](https://splunkbase.splunk.com/app/2686) 获取额外说明。

一旦确认 DB Connect 应用已安装，请将 java_home 路径添加到 DB Connect 应用中的配置 -> 设置，然后点击保存并重置。

<img src={splunk_2} class="image" alt="Splunk 2"/>

## 配置 ClickHouse 的 JDBC {#configure-jdbc-for-clickhouse}

下载 [ClickHouse JDBC 驱动程序](https://github.com/ClickHouse/clickhouse-java) 到 DB Connect 驱动程序文件夹，例如：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

然后，您必须编辑 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf` 中的连接类型配置，以添加 ClickHouse JDBC 驱动程序类的详细信息。

将以下配置段添加到文件中：

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

使用 `$SPLUNK_HOME/bin/splunk restart` 重启 Splunk。

返回 DB Connect 应用程序，转到配置 > 设置 > 驱动程序。您应该会看到 ClickHouse 旁边有一个绿色勾：

<img src={splunk_3} class="image" alt="Splunk 3"/>

## 将 Splunk 搜索连接到 ClickHouse {#connect-splunk-search-to-clickhouse}

导航至 DB Connect 应用程序配置 -> 数据库 -> 身份：为您的 ClickHouse 创建一个身份。

从配置 -> 数据库 -> 连接中创建一个新的 ClickHouse 连接，并选择“新建连接”。

<img width="100" style={{width: '250px'}} src={splunk_4} class="image"/>

<br />

添加 ClickHouse 主机详细信息，并确保选中“启用 SSL”：

<img src={splunk_5} class="image" alt="Splunk 5"/>

保存连接后，您将成功将 ClickHouse 连接到 Splunk！

:::note
如果您收到错误，请确保已将您的 Splunk 实例的 IP 地址添加到 ClickHouse Cloud IP 访问列表中。有关更多信息，请参见 [文档](/cloud/security/setting-ip-filters)。
:::

## 运行 SQL 查询 {#run-a-sql-query}

我们现在将运行一个 SQL 查询来测试一切是否正常。

在 DB Connect 应用程序的 DataLab 部分中选择您的连接详细信息。我们在此演示中使用 `trips` 表：

<img src={splunk_6} class="image" alt="Splunk 6"/>

在 `trips` 表上执行一个 SQL 查询，返回表中所有记录的计数：

<img src={splunk_7} class="image" alt="Splunk 7"/>

如果您的查询成功，您应该会看到结果。

## 创建一个仪表盘 {#create-a-dashboard}

让我们创建一个利用 SQL 和强大的 Splunk 处理语言 (SPL) 的仪表盘。

在继续之前，您必须首先 [停用 DPL 安全保护](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)。

运行以下查询，以显示前 10 个最频繁的叫车社区：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

选择可视化选项卡查看创建的柱状图：

<img src={splunk_8} class="image" alt="Splunk 8"/>

我们将通过点击“另存为 > 保存到仪表盘”来创建一个仪表盘。

让我们再添加一个查询，显示根据乘客数量的平均车费。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

这次，我们创建柱状图可视化并将其保存到之前的仪表盘。

<img src={splunk_9} class="image" alt="Splunk 9"/>

最后，让我们再添加一个查询，显示乘客数量与行程距离之间的相关性：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

我们的最终仪表盘应如下所示：

<img src={splunk_10} class="image" alt="Splunk 10"/>

## 时间序列数据 {#time-series-data}

Splunk 具有数百个内置函数，仪表盘可以使用这些函数来可视化和展示时间序列数据。此示例将结合 SQL 和 SPL 创建一个能够与 Splunk 中的时间序列数据一起使用的查询。

```sql
dbxquery query="SELECT time, orig_h, duration
FROM "demo"."conn" WHERE time >= now() - interval 1 HOURS" connection="chc"
| eval time = strptime(time, "%Y-%m-%d %H:%M:%S.%3Q")
| eval _time=time
| timechart avg(duration) as duration by orig_h
| eval duration=round(duration/60)
| sort - duration:
```

## 了解更多 {#learn-more}

如果您想了解有关 Splunk DB Connect 和如何构建仪表盘的更多信息，请访问 [Splunk 文档](https://docs.splunk.com/Documentation)。
