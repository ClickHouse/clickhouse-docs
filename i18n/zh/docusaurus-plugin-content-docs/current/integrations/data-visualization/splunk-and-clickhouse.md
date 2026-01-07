---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', '集成', '数据可视化']
description: '将 Splunk 仪表板连接到 ClickHouse'
title: '连接 Splunk 与 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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

# 将 Splunk 连接到 ClickHouse {#connecting-splunk-to-clickhouse}

<ClickHouseSupportedBadge/>

:::tip
想要将 ClickHouse 审计日志存储到 Splunk 吗？请参考 ["Storing ClickHouse Cloud Audit logs into Splunk"](/integrations/audit-splunk) 指南。
:::

Splunk 是一款广泛应用于安全和可观测性的产品，同时也是一个功能强大的搜索和仪表盘引擎。Splunk 提供了数百个应用，以满足不同的使用场景。

在 ClickHouse 场景中，我们使用的是 [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)，它提供了与高性能 ClickHouse JDBC 驱动的简单集成，可以直接查询 ClickHouse 中的表。

此集成的理想用例是：当使用 ClickHouse 来处理诸如 NetFlow、Avro 或 Protobuf 二进制数据、DNS、VPC 流日志，以及其他 OTel 日志等大规模数据源时，可将这些数据在 Splunk 中与团队共享，用于搜索和构建仪表盘。通过这种方式，数据不会被摄取到 Splunk 的索引层，而是类似于其他可视化集成（如 [Metabase](https://www.metabase.com/) 或 [Superset](https://superset.apache.org/)）一样，直接从 ClickHouse 中进行查询。

## 目标​ {#goal}

在本指南中，我们将使用 ClickHouse JDBC 驱动程序将 ClickHouse 连接到 Splunk。我们会安装本地版本的 Splunk Enterprise，但不会对任何数据进行索引。相反，我们只通过 DB Connect 查询引擎使用搜索功能。

完成本指南后，你将能够创建一个连接到 ClickHouse 的仪表盘，类似下面这样：

<Image img={splunk_1} size="lg" border alt="Splunk 仪表盘显示纽约市出租车数据可视化" />

:::note
本指南使用了 [New York City Taxi 数据集](/getting-started/example-datasets/nyc-taxi)。你还可以在[我们的文档](http://localhost:3000/docs/getting-started/example-datasets)中找到许多其他可用的数据集。
:::

## 前提条件 {#prerequisites}

在开始之前，您需要：
- Splunk Enterprise（用于使用搜索头（search head）功能）
- 在您的操作系统或容器中安装满足要求的 [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites)
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- 对运行 Splunk Enterprise 的操作系统实例具有管理员权限或 SSH 访问权限
- ClickHouse 连接信息（如果您使用 ClickHouse Cloud，请参阅[此处](/integrations/metabase#1-gather-your-connection-details)）

## 在 Splunk Enterprise 上安装并配置 DB Connect {#install-and-configure-db-connect-on-splunk-enterprise}

必须先在 Splunk Enterprise 实例上安装 Java Runtime Environment。若使用 Docker，可运行命令 `microdnf install java-11-openjdk`。

记下 `java_home` 路径：`java -XshowSettings:properties -version`。

确保已在 Splunk Enterprise 上安装 DB Connect 应用。你可以在 Splunk Web UI 的 Apps 区域找到它：

- 登录 Splunk Web 并前往 Apps > Find More Apps
- 使用搜索框查找 DB Connect
- 点击 Splunk DB Connect 旁边的绿色“Install”按钮
- 点击“Restart Splunk”

如果在安装 DB Connect 应用时遇到问题，请参阅[此链接](https://splunkbase.splunk.com/app/2686)以获取更多说明。

在确认已安装 DB Connect 应用后，在 Configuration -> Settings 中为 DB Connect 应用添加 `java_home` 路径，然后点击保存并重置。

<Image img={splunk_2} size="md" border alt="Splunk DB Connect 设置页面显示 Java Home 配置" />

## 为 ClickHouse 配置 JDBC {#configure-jdbc-for-clickhouse}

将 [ClickHouse JDBC 驱动程序](https://github.com/ClickHouse/clickhouse-java) 下载到 DB Connect Drivers 文件夹，例如：

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

然后，你需要编辑 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf` 中的连接类型配置，以添加 ClickHouse JDBC Driver 类的相关信息。

在该文件中添加以下配置节（stanza）：

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

返回 DB Connect 应用，依次进入 Configuration &gt; Settings &gt; Drivers。此时应当在 ClickHouse 旁边看到一个绿色对号：

<Image img={splunk_3} size="lg" border alt="Splunk DB Connect drivers page showing ClickHouse driver successfully installed" />


## 将 Splunk 搜索连接到 ClickHouse {#connect-splunk-search-to-clickhouse}

导航到 DB Connect App Configuration -> Databases -> Identities，在其中为你的 ClickHouse 创建一个 Identity。

在 Configuration -> Databases -> Connections 中创建到 ClickHouse 的新连接，并选择 "New Connection"。

<Image img={splunk_4} size="sm" border alt="Splunk DB Connect 新建连接按钮" />

<br />

添加 ClickHouse 主机信息，并确保勾选 "Enable SSL"：

<Image img={splunk_5} size="md" border alt="用于 ClickHouse 的 Splunk 连接配置页面" />

保存连接后，即可在 Splunk 中成功连接到 ClickHouse！

:::note
如果出现错误，请确保已经将 Splunk 实例的 IP 地址添加到 ClickHouse Cloud 的 IP 访问列表中。更多信息参见[文档](/cloud/security/setting-ip-filters)。
:::

## 运行 SQL 查询 {#run-a-sql-query}

现在我们将运行一个 SQL 查询，以验证一切工作正常。

在 DB Connect App 的 DataLab 部分中，在 SQL Explorer 中选择你的连接信息。本演示中我们使用 `trips` 表：

<Image img={splunk_6} size="md" border alt="Splunk SQL Explorer 选择连接到 ClickHouse" />

在 `trips` 表上执行一个 SQL 查询，以返回表中所有记录的总数：

<Image img={splunk_7} size="md" border alt="Splunk SQL 查询执行结果，显示 trips 表中的记录总数" />

如果查询成功，你应该会看到结果。

## 创建仪表板 {#create-a-dashboard}

现在来创建一个仪表板，结合使用 SQL 和功能强大的 Splunk Processing Language（SPL）。

在继续之前，必须先[禁用 DPL 保护机制](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)。

运行以下查询，以显示上车次数最多的前 10 个社区：

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

选择“可视化”选项卡以查看创建的柱状图：

<Image img={splunk_8} size="lg" border alt="Splunk 柱状图可视化，显示前 10 大上车地区" />

现在点击 Save As &gt; Save to a Dashboard 来创建一个仪表板。

接下来添加另一个查询，根据乘客人数显示平均车费。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

这次，我们来创建一个柱状图可视化，并将其保存到前一个仪表板中。

<Image img={splunk_9} size="lg" border alt="展示按乘客数量统计平均车费的 Splunk 柱状图" />

最后，我们再添加一个查询，用于展示乘客人数与行程距离之间的相关性：

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

我们的最终仪表板应如下所示：

<Image img={splunk_10} size="lg" border alt="最终的 Splunk 仪表板，包含纽约市出租车数据的多种可视化图表" />


## 时间序列数据 {#time-series-data}

Splunk 提供了数百个内置函数，供仪表板用于时间序列数据的可视化和展示。此示例将结合 SQL 与 SPL，创建一个可在 Splunk 中处理时间序列数据的查询。

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

如果您想进一步了解 Splunk DB Connect 以及如何构建仪表板，请访问 [Splunk 文档](https://docs.splunk.com/Documentation)。