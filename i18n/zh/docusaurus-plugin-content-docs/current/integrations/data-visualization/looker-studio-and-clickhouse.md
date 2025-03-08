---
sidebar_label: Looker Studio
slug: /integrations/lookerstudio
keywords: [clickhouse, looker, studio, connect, mysql, integrate, ui]
description: Looker Studio, formerly Google Data Studio, is an online tool for converting data into customizable informative reports and dashboards.
---

import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';


# Looker Studio

Looker Studio 可以通过官方的 Google MySQL 数据源使用 MySQL 接口连接到 ClickHouse。

## ClickHouse 云设置 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## 本地 ClickHouse 服务器设置 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## 连接 Looker Studio 到 ClickHouse {#connecting-looker-studio-to-clickhouse}

首先，使用你的 Google 账号登录 https://lookerstudio.google.com 并创建一个新的数据源：

<img src={looker_studio_01} class="image" alt="Creating a new data source" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

搜索 Google 提供的官方 MySQL 连接器（名为 **MySQL**）：

<img src={looker_studio_02} class="image" alt="MySQL connector search" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

指定你的连接详细信息。请注意，MySQL 接口的默认端口为 9004，具体可能根据你的服务器配置不同而有所变化。

<img src={looker_studio_03} class="image" alt="Specifying the connection details" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

现在，你有两个选项来从 ClickHouse 获取数据。首先，你可以使用表浏览器功能：

<img src={looker_studio_04} class="image" alt="Using the Table Browser" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

或者，你可以指定自定义查询来获取数据：

<img src={looker_studio_05} class="image" alt="Using a custom query to fetch the data" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

最后，你应该能够看到已检查的表结构，并在必要时调整数据类型。

<img src={looker_studio_06} class="image" alt="Viewing the introspected table structure" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

现在你可以继续探索你的数据或创建新的报告！

## 在 ClickHouse 云中使用 Looker Studio {#using-looker-studio-with-clickhouse-cloud}

在使用 ClickHouse 云时，你需要先启用 MySQL 接口。你可以在连接对话框的 "MySQL" 标签中进行设置。

<img src={looker_studio_enable_mysql} class="image" alt="Looker Studio Require MySQL enabled first" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

在 Looker Studio UI 中，选择 "启用 SSL" 选项。ClickHouse 云的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签署。你可以在 [这里](https://letsencrypt.org/certs/isrgrootx1.pem) 下载这个根证书。

<img src={looker_studio_mysql_cloud} class="image" alt="Looker Studio with ClickHouse Cloud SSL Config" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

其余的步骤与上面前一部分所列相同。
