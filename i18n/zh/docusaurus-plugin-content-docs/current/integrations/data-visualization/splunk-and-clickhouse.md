---
'sidebar_label': 'Splunk'
'sidebar_position': 198
'slug': '/integrations/splunk'
'keywords':
- 'Splunk'
- 'integration'
- 'data visualization'
'description': '将 Splunk 仪表板连接到 ClickHouse'
'title': '连接 Splunk 到 ClickHouse'
---

import Image from '@theme/IdealImage';
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Splunk 连接到 ClickHouse

<ClickHouseSupportedBadge/>

Splunk 是一种流行的安全和可观察性技术。它也是一个强大的搜索和仪表盘引擎。为了满足不同的用例，有数百个 Splunk 应用可供选择。

对于 ClickHouse，我们利用了 [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)，该应用程序通过高性能的 ClickHouse JDBC 驱动程序与 ClickHouse 直接查询表的简单集成。

此集成的理想用例是当您使用 ClickHouse 处理大数据源，例如 NetFlow、Avro 或 Protobuf 二进制数据、DNS、VPC 流日志以及其他可以与您的团队共享以进行搜索和创建仪表盘的 OTEL 日志。通过这种方法，数据不会被导入到 Splunk 索引层，而是通过类似于 [Metabase](https://www.metabase.com/) 或 [Superset](https://superset.apache.org/) 的其他可视化集成直接从 ClickHouse 查询。

## 目标 {#goal}

在本指南中，我们将使用 ClickHouse JDBC 驱动程序将 ClickHouse 连接到 Splunk。我们将安装本地版本的 Splunk Enterprise，但不对任何数据进行索引。相反，我们将通过 DB Connect 查询引擎使用搜索功能。

通过本指南，您将能够创建一个连接到 ClickHouse 的仪表盘，类似于：

<Image img={splunk_1} size="lg" border alt="Splunk dashboard showing NYC taxi data visualizations" />

:::note
本指南使用 [纽约市出租车数据集](/getting-started/example-datasets/nyc-taxi)。您还可以从 [我们的文档](http://localhost:3000/docs/getting-started/example-datasets) 中使用许多其他数据集。
:::

## 先决条件 {#prerequisites}

在开始之前，您需要：
- 使用搜索头功能的 Splunk Enterprise
- 安装 [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) 的要求
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- 对您的 Splunk Enterprise 操作系统实例具有管理员或 SSH 访问权限
- ClickHouse 连接详细信息（如果您使用 ClickHouse Cloud，请参见 [此处](/integrations/metabase#1-gather-your-connection-details)）

## 在 Splunk Enterprise 上安装和配置 DB Connect {#install-and-configure-db-connect-on-splunk-enterprise}

您必须首先在 Splunk Enterprise 实例上安装 Java Runtime Environment。如果您使用 Docker，可以使用命令 `microdnf install java-11-openjdk`。

记下 `java_home` 路径：`java -XshowSettings:properties -version`。

确保在 Splunk Enterprise 上安装了 DB Connect 应用。您可以在 Splunk Web UI 的应用部分找到它：
- 登录到 Splunk Web，然后转到 Apps > Find More Apps
- 使用搜索框找到 DB Connect
- 点击 Splunk DB Connect 旁边的绿色“安装”按钮
- 点击“重启 Splunk”

如果您在安装 DB Connect 应用时遇到问题，请查看 [该链接](https://splunkbase.splunk.com/app/2686) 获取更多说明。

一旦您确认DB Connect应用已安装，请将java_home路径添加到DB Connect应用的配置 -> 设置中，然后点击保存，然后重置。

<Image img={splunk_2} size="md" border alt="Splunk DB Connect settings page showing Java Home configuration" />

## 为 ClickHouse 配置 JDBC {#configure-jdbc-for-clickhouse}

将 [ClickHouse JDBC 驱动程序](https://github.com/ClickHouse/clickhouse-java) 下载到 DB Connect 驱动程序文件夹中，例如：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

然后，您必须编辑连接类型配置文件 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`，以添加 ClickHouse JDBC 驱动程序类的详细信息。

将以下段落添加到文件中：

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

返回到 DB Connect 应用，转到配置 > 设置 > 驱动程序。您应该在 ClickHouse 旁边看到一个绿色勾：

<Image img={splunk_3} size="lg" border alt="Splunk DB Connect drivers page showing ClickHouse driver successfully installed" />

## 将 Splunk 搜索连接到 ClickHouse {#connect-splunk-search-to-clickhouse}

导航到 DB Connect 应用配置 -> 数据库 -> 身份：为您的 ClickHouse 创建一个身份。

从配置 -> 数据库 -> 连接创建新的 ClickHouse 连接并选择“新连接”。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect new connection button" />

<br />

添加 ClickHouse 主机详细信息并确保勾选“启用 SSL”：

<Image img={splunk_5} size="md" border alt="Splunk connection configuration page for ClickHouse" />

保存连接后，您已经成功将 ClickHouse 连接到 Splunk！

:::note
如果您收到错误，请确保已将您的 Splunk 实例的 IP 地址添加到 ClickHouse Cloud IP 访问列表中。有关更多信息，请参见 [文档](/cloud/security/setting-ip-filters)。
:::

## 运行 SQL 查询 {#run-a-sql-query}

现在我们将运行 SQL 查询，以测试一切是否正常。

在 DB Connect 应用的 DataLab 部分中选择您的连接详细信息。我们在此演示中使用 `trips` 表：

<Image img={splunk_6} size="md" border alt="Splunk SQL Explorer selecting connection to ClickHouse" />

在 `trips` 表上执行 SQL 查询，以返回表中所有记录的计数：

<Image img={splunk_7} size="md" border alt="Splunk SQL query execution showing count of records in trips table" />

如果查询成功，您应该会看到结果。

## 创建仪表盘 {#create-a-dashboard}

让我们创建一个利用 SQL 和强大的 Splunk 处理语言 (SPL) 组合的仪表盘。

在继续之前，您必须首先 [停用 DPL 保护措施](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)。

运行以下查询，以显示拥有最多接送的前 10 个社区：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

选择可视化选项卡以查看创建的柱状图：

<Image img={splunk_8} size="lg" border alt="Splunk column chart visualization showing top 10 pickup neighborhoods" />

我们现在将通过点击“另存为” > “保存到仪表盘”来创建一个仪表盘。

让我们添加另一个查询，以根据乘客数量显示平均车费。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

这次，让我们创建一个条形图可视化并将其保存到之前的仪表盘。

<Image img={splunk_9} size="lg" border alt="Splunk bar chart showing average fare by passenger count" />

最后，让我们再添加一个查询，显示乘客数量与行程距离之间的关系：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

我们的最终仪表盘应如下所示：

<Image img={splunk_10} size="lg" border alt="Final Splunk dashboard with multiple visualizations of NYC taxi data" />

## 时间序列数据 {#time-series-data}

Splunk 具有数百个内置函数，仪表盘可以利用这些函数对时间序列数据进行可视化和展示。此示例将结合 SQL + SPL 创建一个可以在 Splunk 中处理时间序列数据的查询。

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

如果您想了解有关 Splunk DB Connect 的更多信息以及如何构建仪表盘，请访问 [Splunk 文档](https://docs.splunk.com/Documentation)。
