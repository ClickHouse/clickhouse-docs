---
'sidebar_label': 'Splunk'
'sidebar_position': 198
'slug': '/integrations/splunk'
'keywords':
- 'Splunk'
- 'integration'
- 'data visualization'
'description': '将 Splunk 仪表板连接到 ClickHouse'
'title': '将 Splunk 连接到 ClickHouse'
'doc_type': 'guide'
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


# 连接 Splunk 到 ClickHouse

<ClickHouseSupportedBadge/>

Splunk 是一种广泛使用的安全和可观察性技术。它也是一个强大的搜索和仪表板引擎。还有数百个 Splunk 应用可用于解决不同的用例。

针对 ClickHouse， 我们使用 [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)，它具有简单的集成方式，与高性能的 ClickHouse JDBC 驱动程序直接查询 ClickHouse 中的表。

此集成的理想用例是，当您使用 ClickHouse 处理大型数据源时，例如 NetFlow、Avro 或 Protobuf 二进制数据、DNS、VPC 流日志和其他可以与您的团队共享以在 Splunk 中进行搜索和创建仪表板的 OTEL 日志。通过这种方式，数据不会被引入到 Splunk 索引层，而是直接从 ClickHouse 查询，就像其他可视化集成工具，例如 [Metabase](https://www.metabase.com/) 或 [Superset](https://superset.apache.org/) 一样。

## 目标​ {#goal}

在本指南中，我们将使用 ClickHouse JDBC 驱动程序将 ClickHouse 连接到 Splunk。我们将在本地安装 Splunk Enterprise 的版本，但我们不索引任何数据。相反，我们将通过 DB Connect 查询引擎使用搜索功能。

使用本指南，您将能够创建一个连接到 ClickHouse 的仪表板，类似于以下内容：

<Image img={splunk_1} size="lg" border alt="显示 NYC 出租车数据可视化的 Splunk 仪表板" />

:::note
本指南使用 [纽约市出租车数据集](/getting-started/example-datasets/nyc-taxi)。您还可以从 [我们的文档](http://localhost:3000/docs/getting-started/example-datasets) 中使用许多其他数据集。
:::

## 先决条件 {#prerequisites}

在开始之前，您需要：
- Splunk Enterprise 以使用搜索头功能
- 安装在您操作系统或容器上的 [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) 要求
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- 对您的 Splunk Enterprise OS 实例的管理员或 SSH 访问权限
- ClickHouse 连接详细信息（如果您使用的是 ClickHouse Cloud，请参见 [这里](/integrations/metabase#1-gather-your-connection-details)）

## 在 Splunk Enterprise 上安装和配置 DB Connect {#install-and-configure-db-connect-on-splunk-enterprise}

您必须首先在 Splunk Enterprise 实例上安装 Java Runtime Environment。如果您使用的是 Docker，可以使用命令 `microdnf install java-11-openjdk`。

请记下 `java_home` 路径：`java -XshowSettings:properties -version`。

确保在 Splunk Enterprise 上安装了 DB Connect 应用。您可以在 Splunk Web UI 的应用部分找到它：
- 登录到 Splunk Web，转到 应用 > 查找更多应用
- 使用搜索框查找 DB Connect
- 点击 Splunk DB Connect 旁边的绿色“安装”按钮
- 点击“重启 Splunk”

如果您在安装 DB Connect 应用时遇到问题，请参见 [此链接](https://splunkbase.splunk.com/app/2686) 获取其他说明。

一旦您确认 DB Connect 应用已安装，添加 java_home 路径到 DB Connect 应用的配置 -> 设置中，然后点击保存再重置。

<Image img={splunk_2} size="md" border alt="显示 Java Home 配置的 Splunk DB Connect 设置页面" />

## 为 ClickHouse 配置 JDBC {#configure-jdbc-for-clickhouse}

下载 [ClickHouse JDBC 驱动程序](https://github.com/ClickHouse/clickhouse-java) 到 DB Connect 驱动程序文件夹，例如：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

然后，您必须在 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf` 中编辑连接类型配置，以添加 ClickHouse JDBC 驱动程序类详细信息。

将以下内容添加到文件中：

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

返回到 DB Connect 应用，转到 配置 > 设置 > 驱动程序。您应该在 ClickHouse 旁边看到一个绿色勾号：

<Image img={splunk_3} size="lg" border alt="显示 ClickHouse 驱动程序已成功安装的 Splunk DB Connect 驱动程序页面" />

## 将 Splunk 搜索连接到 ClickHouse {#connect-splunk-search-to-clickhouse}

导航到 DB Connect 应用配置 -> 数据库 -> 身份：为您的 ClickHouse 创建一个身份。

从配置 -> 数据库 -> 连接中创建一个新的 ClickHouse 连接，选择“新建连接”。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect 新连接按钮" />

<br />

添加 ClickHouse 主机详细信息并确保勾选“启用 SSL”：

<Image img={splunk_5} size="md" border alt="ClickHouse 的 Splunk 连接配置页面" />

保存连接后，您将成功将 ClickHouse 连接到 Splunk！

:::note
如果您收到错误，请确保已将 Splunk 实例的 IP 地址添加到 ClickHouse Cloud IP 访问列表中。有关更多信息，请参见 [文档](/cloud/security/setting-ip-filters)。
:::

## 运行 SQL 查询 {#run-a-sql-query}

现在我们将运行 SQL 查询以测试一切是否正常。

在 DB Connect 应用的 DataLab 部分，从 SQL Explorer 中选择您的连接详细信息。我们在这个演示中使用 `trips` 表：

<Image img={splunk_6} size="md" border alt="选择连接到 ClickHouse 的 Splunk SQL Explorer" />

对 `trips` 表执行 SQL 查询，返回表中所有记录的数量：

<Image img={splunk_7} size="md" border alt="显示 trips 表中记录数量的 Splunk SQL 查询执行" />

如果您的查询成功，您应该看到结果。

## 创建仪表板 {#create-a-dashboard}

让我们创建一个利用 SQL 和强大的 Splunk 处理语言 (SPL) 的仪表板。

在继续之前，您必须首先 [停用 DPL 保护措施](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)。

运行以下查询，展示我们最多有 10 个乘客打车的社区：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

选择可视化选项卡以查看创建的柱状图：

<Image img={splunk_8} size="lg" border alt="显示前 10 个上下车社区的 Splunk 列表图可视化" />

现在通过点击“另存为”>“保存到仪表板”来创建仪表板。

让我们添加另一个查询，显示基于乘客数量的平均车费。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

这次，我们将创建一个条形图可视化并将其保存到先前的仪表板中。

<Image img={splunk_9} size="lg" border alt="探索乘客数量所产生的平均车费的 Splunk 条形图" />

最后，让我们再添加一个查询，展示乘客数量和旅行距离之间的相关性：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

我们最终的仪表板应该如下所示：

<Image img={splunk_10} size="lg" border alt="最终的 Splunk 仪表板，展示 NYC 出租车数据的多个可视化" />

## 时间序列数据 {#time-series-data}

Splunk 拥有数百种内置函数，仪表板可以使用这些函数来可视化和展示时间序列数据。这个示例将结合 SQL + SPL 创建一个可以与 Splunk 中的时间序列数据一起使用的查询。

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

如果您想查找有关 Splunk DB Connect 以及如何构建仪表板的更多信息，请访问 [Splunk 文档](https://docs.splunk.com/Documentation)。
