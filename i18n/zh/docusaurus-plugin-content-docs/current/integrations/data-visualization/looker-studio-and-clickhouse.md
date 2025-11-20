---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio（原名 Google Data Studio）是一款在线工具，用于将数据转换为可自定义的信息报告和仪表板。'
title: 'Looker Studio'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker Studio

<PartnerBadge/>

Looker Studio 可以使用官方的 Google MySQL 数据源，通过 MySQL 接口连接到 ClickHouse。



## ClickHouse Cloud 设置 {#clickhouse-cloud-setup}

<MySQLCloudSetup />


## 本地部署 ClickHouse 服务器 {#on-premise-clickhouse-server-setup}

<MySQLOnPremiseSetup />


## 将 Looker Studio 连接到 ClickHouse {#connecting-looker-studio-to-clickhouse}

首先,使用您的 Google 账户登录 https://lookerstudio.google.com 并创建一个新的数据源:

<Image
  size='md'
  img={looker_studio_01}
  alt='在 Looker Studio 界面中创建新数据源'
  border
/>
<br />

搜索 Google 提供的官方 MySQL 连接器(名称为 **MySQL**):

<Image
  size='md'
  img={looker_studio_02}
  alt='在 Looker Studio 连接器列表中搜索 MySQL 连接器'
  border
/>
<br />

指定您的连接详细信息。请注意,MySQL 接口端口默认为 9004,
具体端口可能因服务器配置而异。

<Image
  size='md'
  img={looker_studio_03}
  alt='在 Looker Studio 中指定 ClickHouse MySQL 连接详细信息'
  border
/>
<br />

现在,您有两种方式从 ClickHouse 获取数据。第一种方式是使用表浏览器功能:

<Image
  size='md'
  img={looker_studio_04}
  alt='在 Looker Studio 中使用表浏览器选择 ClickHouse 表'
  border
/>
<br />

或者,您也可以指定自定义查询来获取数据:

<Image
  size='md'
  img={looker_studio_05}
  alt='在 Looker Studio 中使用自定义 SQL 查询从 ClickHouse 获取数据'
  border
/>
<br />

最后,您应该能够看到解析出的表结构,并在必要时调整数据类型。

<Image
  size='md'
  img={looker_studio_06}
  alt='在 Looker Studio 中查看解析出的 ClickHouse 表结构'
  border
/>
<br />

现在您可以继续探索数据或创建新报告了!


## 在 ClickHouse Cloud 中使用 Looker Studio {#using-looker-studio-with-clickhouse-cloud}

使用 ClickHouse Cloud 时,需要先启用 MySQL 接口。可以在连接对话框的"MySQL"选项卡中进行配置。

<Image
  size='md'
  img={looker_studio_enable_mysql}
  alt='在 ClickHouse Cloud 设置中启用 MySQL 接口'
  border
/>
<br />

在 Looker Studio 用户界面中,选择"Enable SSL"选项。ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签发。可以从[此处](https://letsencrypt.org/certs/isrgrootx1.pem)下载根证书。

<Image
  size='md'
  img={looker_studio_mysql_cloud}
  alt='配置 ClickHouse Cloud SSL 设置的 Looker Studio 连接'
  border
/>
<br />

其余步骤与上一节所述相同。
