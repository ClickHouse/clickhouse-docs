---
sidebar_label: 'Splunk'
sidebar_position: 198
slug: /integrations/splunk
keywords: ['Splunk', 'integration', 'data visualization']
description: '将 Splunk 仪表板连接到 ClickHouse'
title: '将 Splunk 连接到 ClickHouse'
doc_type: 'guide'
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

:::tip
想要将 ClickHouse 审计日志存储到 Splunk 吗？请参考《[将 ClickHouse Cloud 审计日志存储到 Splunk](/integrations/audit-splunk)》指南。
:::

Splunk 是一种广泛使用的安全与可观测性技术平台，同时也是一个功能强大的搜索和仪表盘引擎。针对不同的使用场景，有数百款 Splunk 应用可供选择。

在 ClickHouse 场景中，我们使用 [Splunk DB Connect App](https://splunkbase.splunk.com/app/2686)，它可以方便地与高性能的 ClickHouse JDBC 驱动集成，从而直接查询 ClickHouse 中的表。

此集成的理想用例是：当你使用 ClickHouse 存储海量数据源时，例如 NetFlow、Avro 或 Protobuf 二进制数据、DNS、VPC 流日志，以及其他可以在 Splunk 中与团队共享、用于搜索和构建仪表盘的 OTEL 日志。通过这种方式，数据不会被写入 Splunk 的索引层，而是像与其他可视化工具（例如 [Metabase](https://www.metabase.com/) 或 [Superset](https://superset.apache.org/)）集成那样，直接从 ClickHouse 中进行查询。



## Goal​ {#goal}

在本指南中,我们将使用 ClickHouse JDBC 驱动程序将 ClickHouse 连接到 Splunk。我们将安装本地版本的 Splunk Enterprise,但不会对任何数据进行索引。我们将通过 DB Connect 查询引擎使用搜索功能。

通过本指南,您将能够创建一个连接到 ClickHouse 的仪表板,效果如下所示:

<Image
  img={splunk_1}
  size='lg'
  border
  alt='显示纽约市出租车数据可视化的 Splunk 仪表板'
/>

:::note
本指南使用[纽约市出租车数据集](/getting-started/example-datasets/nyc-taxi)。您还可以从[我们的文档](http://localhost:3000/docs/getting-started/example-datasets)中使用其他多个数据集。
:::


## 前置条件 {#prerequisites}

开始之前,您需要准备:

- Splunk Enterprise(用于使用搜索头功能)
- 在您的操作系统或容器上安装 [Java Runtime Environment (JRE)](https://docs.splunk.com/Documentation/DBX/3.16.0/DeployDBX/Prerequisites) 所需环境
- [Splunk DB Connect](https://splunkbase.splunk.com/app/2686)
- 您的 Splunk Enterprise 操作系统实例的管理员权限或 SSH 访问权限
- ClickHouse 连接详细信息(如果您使用 ClickHouse Cloud,请参阅[此处](/integrations/metabase#1-gather-your-connection-details))


## 在 Splunk Enterprise 上安装和配置 DB Connect {#install-and-configure-db-connect-on-splunk-enterprise}

您必须首先在 Splunk Enterprise 实例上安装 Java 运行时环境。如果您使用的是 Docker,可以使用命令 `microdnf install java-11-openjdk`。

记下 `java_home` 路径:`java -XshowSettings:properties -version`。

确保 DB Connect 应用已安装在 Splunk Enterprise 上。您可以在 Splunk Web UI 的应用部分找到它:

- 登录 Splunk Web 并转到应用 > 查找更多应用
- 使用搜索框查找 DB Connect
- 点击 Splunk DB Connect 旁边的绿色"安装"按钮
- 点击"重启 Splunk"

如果您在安装 DB Connect 应用时遇到问题,请参阅[此链接](https://splunkbase.splunk.com/app/2686)获取更多说明。

验证 DB Connect 应用已安装后,在配置 -> 设置中将 java_home 路径添加到 DB Connect 应用,然后点击保存并重置。

<Image
  img={splunk_2}
  size='md'
  border
  alt='显示 Java Home 配置的 Splunk DB Connect 设置页面'
/>


## 为 ClickHouse 配置 JDBC {#configure-jdbc-for-clickhouse}

将 [ClickHouse JDBC 驱动](https://github.com/ClickHouse/clickhouse-java) 下载到 DB Connect Drivers 文件夹,例如:

```bash
$SPLUNK_HOME/etc/apps/splunk_app_db_connect/drivers
```

然后需要编辑位于 `$SPLUNK_HOME/etc/apps/splunk_app_db_connect/default/db_connection_types.conf` 的连接类型配置文件,添加 ClickHouse JDBC 驱动类的详细信息。

在文件中添加以下配置段:

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

返回 DB Connect 应用,进入 Configuration > Settings > Drivers。您应该会看到 ClickHouse 旁边有一个绿色勾号:

<Image
  img={splunk_3}
  size='lg'
  border
  alt='Splunk DB Connect 驱动页面显示 ClickHouse 驱动已成功安装'
/>


## 将 Splunk 搜索连接到 ClickHouse {#connect-splunk-search-to-clickhouse}

导航至 DB Connect App Configuration -> Databases -> Identities:为您的 ClickHouse 创建一个身份标识。

从 Configuration -> Databases -> Connections 创建一个新的 ClickHouse 连接,并选择"New Connection"。

<Image
  img={splunk_4}
  size='sm'
  border
  alt='Splunk DB Connect 新建连接按钮'
/>

<br />

添加 ClickHouse 主机详细信息,并确保勾选"Enable SSL":

<Image
  img={splunk_5}
  size='md'
  border
  alt='ClickHouse 的 Splunk 连接配置页面'
/>

保存连接后,您将成功地将 ClickHouse 连接到 Splunk!

:::note
如果您收到错误,请确保已将 Splunk 实例的 IP 地址添加到 ClickHouse Cloud IP 访问列表中。有关更多信息,请参阅[文档](/cloud/security/setting-ip-filters)。
:::


## 运行 SQL 查询 {#run-a-sql-query}

现在我们将运行一个 SQL 查询来测试一切是否正常工作。

在 DB Connect App 的 DataLab 部分中,从 SQL Explorer 选择您的连接详细信息。本演示使用 `trips` 表:

<Image
  img={splunk_6}
  size='md'
  border
  alt='Splunk SQL Explorer 选择连接到 ClickHouse'
/>

在 `trips` 表上执行 SQL 查询,返回表中所有记录的数量:

<Image
  img={splunk_7}
  size='md'
  border
  alt='Splunk SQL 查询执行显示 trips 表中的记录数量'
/>

如果查询成功,您将看到查询结果。


## 创建仪表板 {#create-a-dashboard}

让我们创建一个仪表板,结合使用 SQL 和强大的 Splunk 处理语言 (SPL)。

在继续之前,您必须首先[停用 DPL 安全防护](https://docs.splunk.com/Documentation/Splunk/9.2.1/Security/SPLsafeguards?ref=hk#Deactivate_SPL_safeguards)。

运行以下查询,显示上车次数最多的前 10 个街区:

```sql
dbxquery query="SELECT pickup_ntaname, count(*) AS count
FROM default.trips GROUP BY pickup_ntaname
ORDER BY count DESC LIMIT 10;" connection="chc"
```

选择可视化选项卡以查看创建的柱状图:

<Image
  img={splunk_8}
  size='lg'
  border
  alt='Splunk 柱状图可视化,显示上车次数最多的前 10 个街区'
/>

现在我们将通过点击另存为 > 保存到仪表板来创建仪表板。

让我们添加另一个查询,显示基于乘客数量的平均车费。

```sql
dbxquery query="SELECT passenger_count,avg(total_amount)
FROM default.trips GROUP BY passenger_count;" connection="chc"
```

这次,让我们创建一个条形图可视化并将其保存到之前的仪表板。

<Image
  img={splunk_9}
  size='lg'
  border
  alt='Splunk 条形图,显示按乘客数量统计的平均车费'
/>

最后,让我们再添加一个查询,显示乘客数量与行程距离之间的关联:

```sql
dbxquery query="SELECT passenger_count, toYear(pickup_datetime) AS year,
round(trip_distance) AS distance, count(* FROM default.trips)
GROUP BY passenger_count, year, distance
ORDER BY year, count(*) DESC; " connection="chc"
```

我们的最终仪表板应该如下所示:

<Image
  img={splunk_10}
  size='lg'
  border
  alt='最终 Splunk 仪表板,包含 NYC 出租车数据的多个可视化'
/>


## 时间序列数据 {#time-series-data}

Splunk 提供了数百个内置函数，仪表板可以使用这些函数对时间序列数据进行可视化和展示。本示例将结合 SQL + SPL 创建一个查询，用于在 Splunk 中处理时间序列数据

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

如需了解有关 Splunk DB Connect 以及如何构建仪表板的更多信息,请访问 [Splunk 文档](https://docs.splunk.com/Documentation)。
