---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: 'Looker Studio，前身为 Google Data Studio，是一款在线工具，可将数据转换成可自定义的信息报告和仪表盘。'
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

Looker Studio 可以通过 MySQL 接口，使用 Google 官方提供的 MySQL 数据源连接到 ClickHouse。



## ClickHouse Cloud 配置 {#clickhouse-cloud-setup}
<MySQLCloudSetup />



## 本地部署 ClickHouse 服务器的设置 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />



## 将 Looker Studio 连接到 ClickHouse {#connecting-looker-studio-to-clickhouse}

首先，使用 Google 账号登录 https://lookerstudio.google.com，并创建一个新的 Data Source（数据源）：

<Image size="md" img={looker_studio_01} alt="在 Looker Studio 界面中创建新的数据源" border />
<br/>

在连接器列表中搜索由 Google 提供的官方 MySQL 连接器（名称为 **MySQL**）：

<Image size="md" img={looker_studio_02} alt="在 Looker Studio 连接器列表中搜索 MySQL 连接器" border />
<br/>

填写连接信息。请注意，MySQL 接口端口默认是 9004，
并且可能会因服务器配置而有所不同。

<Image size="md" img={looker_studio_03} alt="在 Looker Studio 中填写 ClickHouse 的 MySQL 连接信息" border />
<br/>

现在，有两种方式可以从 ClickHouse 获取数据。第一种是使用 Table Browser 功能：

<Image size="md" img={looker_studio_04} alt="在 Looker Studio 中使用 Table Browser 选择 ClickHouse 表" border />
<br/>

或者，也可以通过编写自定义查询来获取数据：

<Image size="md" img={looker_studio_05} alt="在 Looker Studio 中使用自定义 SQL 查询从 ClickHouse 获取数据" border />
<br/>

最后，你应该可以看到自动探查得到的表结构，并在必要时调整数据类型。

<Image size="md" img={looker_studio_06} alt="在 Looker Studio 中查看自动探查得到的 ClickHouse 表结构" border />
<br/>

现在，你可以开始探索数据或创建新的报表了！



## 在 ClickHouse Cloud 中使用 Looker Studio {#using-looker-studio-with-clickhouse-cloud}

使用 ClickHouse Cloud 时，需要先启用 MySQL 接口。可以在连接对话框的 “MySQL” 选项卡中完成此操作。

<Image size="md" img={looker_studio_enable_mysql} alt="在 ClickHouse Cloud 设置中启用 MySQL 接口" border />
<br/>

在 Looker Studio 界面中，选择 “Enable SSL” 选项。ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签发。可以在[这里](https://letsencrypt.org/certs/isrgrootx1.pem)下载该根证书。

<Image size="md" img={looker_studio_mysql_cloud} alt="配置带有 ClickHouse Cloud SSL 设置的 Looker Studio 连接" border />
<br/>

其余步骤与上一节中列出的步骤相同。
