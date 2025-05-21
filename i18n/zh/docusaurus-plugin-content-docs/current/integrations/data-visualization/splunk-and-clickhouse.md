---
'sidebar_label': 'Splunk'
'sidebar_position': 198
'slug': '/integrations/splunk'
'keywords':
- 'Splunk'
- 'integration'
- 'data visualization'
'description': '将 Splunk 仪表板连接到 ClickHouse'
'title': '连接 Splunk 至 ClickHouse'
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


# 将Splunk连接到ClickHouse

<ClickHouseSupportedBadge/>

Splunk是一种流行的安全性和可观测性技术。它也是一个强大的搜索和仪表板引擎。为了满足不同的用例，Splunk有数百个可用的应用程序。

针对ClickHouse，我们利用了[Splunk DB Connect应用程序](https://splunkbase.splunk.com/app/2686)，该应用程序可以简单地集成到高性能的ClickHouse JDBC驱动程序中，直接查询ClickHouse中的表。

此集成的理想用例是在使用ClickHouse处理大数据源时，例如NetFlow、Avro或Protobuf二进制数据、DNS、VPC流日志以及其他可以与您的团队共享的OTEL日志，以便在Splunk中进行搜索和创建仪表板。通过这种方法，数据不被引入Splunk索引层，而是像其他可视化集成（例如[Metabase](https://www.metabase.com/)或[Superset](https://superset.apache.org/)）一样直接从ClickHouse进行查询。

## 目标​ {#goal}

在本指南中，我们将使用ClickHouse JDBC驱动程序将ClickHouse连接到Splunk。我们将安装Splunk Enterprise的本地版本，但不进行任何数据索引。相反，我们通过DB Connect查询引擎使用搜索功能。

通过本指南，您将能够创建一个连接到ClickHouse的仪表板，类似于以下所示：

<Image img={splunk_1} size="lg" border alt="Splunk仪表板显示纽约市出租车数据可视化" />

:::note
本指南使用了[纽约市出租车数据集](/getting-started/example-datasets/nyc-taxi)。您可以从[我们的文档](http://localhost:3000/docs/getting-started/example-datasets)中使用许多其他数据集。
:::

## 前提条件 {#prerequisites}

在您开始之前，您需要：
- 使用搜索头功能的Splunk Enterprise
- 在您的操作系统或容器上安装[Java运行时环境（JRE）](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)要求
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- 对您的Splunk Enterprise操作系统实例的管理员或SSH访问权限
- ClickHouse连接详情（如果您使用ClickHouse Cloud，请参阅[这里](/integrations/metabase#1-gather-your-connection-details)）

## 在Splunk Enterprise上安装和配置DB Connect {#install-and-configure-db-connect-on-splunk-enterprise}

您必须首先在Splunk Enterprise实例上安装Java运行时环境。如果您使用Docker，可以使用命令`microdnf install java-11-openjdk`。

记下`java_home`路径：`java -XshowSettings:properties -version`。

确保在Splunk Enterprise上安装了DB Connect应用程序。您可以在Splunk Web UI的应用程序部分找到它：
- 登录Splunk Web并转到Apps > Find More Apps
- 使用搜索框查找DB Connect
- 点击Splunk DB Connect旁边的绿色“安装”按钮
- 点击“重启Splunk”

如果您在安装DB Connect应用程序时遇到问题，请参阅[此链接](https://splunkbase.splunk.com/app/2686)以获取附加说明。

验证DB Connect应用程序已安装后，将java_home路径添加到DB Connect应用程序的Configuration -> Settings中，然后点击保存并重置。

<Image img={splunk_2} size="md" border alt="显示Java Home配置的Splunk DB Connect设置页面" />

## 为ClickHouse配置JDBC {#configure-jdbc-for-clickhouse}

将[ClickHouse JDBC驱动程序](https://github.com/ClickHouse/clickhouse-java)下载到DB Connect Drivers文件夹，例如：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

然后，您必须编辑`$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf`中的连接类型配置，以添加ClickHouse JDBC驱动程序类的详细信息。

在文件中添加以下段落：

```text
[ClickHouse]
displayName = ClickHouse
serviceClass = com.splunk.dbx2.DefaultDBX2JDBC
jdbcUrlFormat = jdbc:ch://<host>:<port>/<database>
jdbcUrlSSLFormat = jdbc:ch://<host>:<port>/<database>?ssl=true
jdbcDriverClass = com.clickhouse.jdbc.ClickHouseDriver
ui_default_catalog = $database$
```

使用`$SPLUNK_HOME/bin/splunk restart`重启Splunk。

返回DB Connect应用程序，转到Configuration > Settings > Drivers。您应该看到ClickHouse旁边有一个绿勾：

<Image img={splunk_3} size="lg" border alt="Splunk DB Connect驱动页面显示ClickHouse驱动成功安装" />

## 将Splunk搜索连接到ClickHouse {#connect-splunk-search-to-clickhouse}

导航到DB Connect应用程序Configuration -> Databases -> Identities：为您的ClickHouse创建一个Identity。

从Configuration -> Databases -> Connections创建一个新的ClickHouse连接，选择“新连接”。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect新连接按钮" />

<br />

添加ClickHouse主机详细信息，并确保勾选“启用SSL”：

<Image img={splunk_5} size="md" border alt="Splunk连接配置页面用于ClickHouse" />

保存连接后，您将成功将ClickHouse连接到Splunk！

:::note
如果您收到错误消息，请确保您已将Splunk实例的IP地址添加到ClickHouse Cloud IP访问列表。有关更多信息，请参阅[文档](/cloud/security/setting-ip-filters)。
:::

## 运行SQL查询 {#run-a-sql-query}

现在我们将运行一个SQL查询来测试一切是否正常。

从DB Connect应用程序的DataLab部分选择您的连接详情。我们在此演示中使用`trips`表：

<Image img={splunk_6} size="md" border alt="Splunk SQL Explorer选择连接到ClickHouse" />

在`trips`表上执行一条SQL查询，以返回表中所有记录的计数：

<Image img={splunk_7} size="md" border alt="Splunk SQL查询执行显示trips表中记录的计数" />

如果您的查询成功，您应该会看到结果。

## 创建仪表板 {#create-a-dashboard}

让我们创建一个通过SQL与强大的Splunk处理语言（SPL）相结合的仪表板。

在继续之前，您必须先[停用DPL保护措施](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)。

运行以下查询，显示我们最常见的前10个接送邻里：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

选择可视化选项卡以查看生成的柱状图：

<Image img={splunk_8} size="lg" border alt="Splunk柱状图可视化显示前10个接送邻里" />

接下来，我们将点击“另存为”>“保存到仪表板”来创建仪表板。

让我们添加另一个查询，显示基于乘客人数的平均费用。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

这一次，我们将创建一个柱状图可视化并保存到之前的仪表板。

<Image img={splunk_9} size="lg" border alt="Splunk柱状图显示按乘客计数的平均费用" />

最后，我们再添加一个查询，显示乘客人数与旅行距离之间的关联：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

我们的最终仪表板应如下所示：

<Image img={splunk_10} size="lg" border alt="最终Splunk仪表板显示NYC出租车数据的多种可视化" />

## 时间序列数据 {#time-series-data}

Splunk有数百个内置函数，仪表板可以利用这些函数来可视化和呈现时间序列数据。此示例将结合SQL + SPL来创建可以在Splunk中处理时间序列数据的查询。

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

如果您想了解有关Splunk DB Connect和如何构建仪表板的更多信息，请访问[Splunk文档](https://docs.splunk.com/Documentation)。
