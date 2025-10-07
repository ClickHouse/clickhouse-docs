---
'sidebar_label': 'Looker Studio'
'slug': '/integrations/lookerstudio'
'keywords':
- 'clickhouse'
- 'looker'
- 'studio'
- 'connect'
- 'mysql'
- 'integrate'
- 'ui'
'description': 'Looker Studio，前身为 Google Data Studio，是一个将数据转换为可定制的信息报告和仪表板的在线工具。'
'title': 'Looker Studio'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import MySQLCloudSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Looker Studio

<CommunityMaintainedBadge/>

Looker Studio 可以通过 MySQL 接口使用官方 Google MySQL 数据源连接到 ClickHouse。

## ClickHouse Cloud 设置 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## 本地 ClickHouse 服务器设置 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## 将 Looker Studio 连接到 ClickHouse {#connecting-looker-studio-to-clickhouse}

首先，使用您的 Google 账户登录 https://lookerstudio.google.com 并创建一个新的数据源：

<Image size="md" img={looker_studio_01} alt="在 Looker Studio 界面中创建新的数据源" border />
<br/>

搜索 Google 提供的官方 MySQL 连接器（名称为 **MySQL**）：

<Image size="md" img={looker_studio_02} alt="在 Looker Studio 连接器列表中搜索 MySQL 连接器" border />
<br/>

指定您的连接细节。请注意，MySQL 接口的端口默认是 9004，具体可能根据您的服务器配置而有所不同。

<Image size="md" img={looker_studio_03} alt="在 Looker Studio 中指定 ClickHouse MySQL 连接详细信息" border />
<br/>

现在，您有两个选项可以从 ClickHouse 中提取数据。首先，您可以使用表浏览器功能：

<Image size="md" img={looker_studio_04} alt="使用表浏览器在 Looker Studio 中选择 ClickHouse 表" border />
<br/>

或者，您可以指定自定义查询以提取数据：

<Image size="md" img={looker_studio_05} alt="使用自定义 SQL 查询从 ClickHouse 中提取数据" border />
<br/>

最后，您应该能够查看反射的表结构，并在必要时调整数据类型。

<Image size="md" img={looker_studio_06} alt="在 Looker Studio 中查看反射的 ClickHouse 表结构" border />
<br/>

现在您可以继续探索数据或创建新的报告！

## 在 ClickHouse Cloud 中使用 Looker Studio {#using-looker-studio-with-clickhouse-cloud}

使用 ClickHouse Cloud 时，您需要首先启用 MySQL 接口。您可以在连接对话框的 "MySQL" 选项卡中完成此操作。

<Image size="md" img={looker_studio_enable_mysql} alt="在 ClickHouse Cloud 设置中启用 MySQL 接口" border />
<br/>

在 Looker Studio 用户界面中，选择 "启用 SSL" 选项。ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签发。您可以在 [此处](https://letsencrypt.org/certs/isrgrootx1.pem) 下载此根证书。

<Image size="md" img={looker_studio_mysql_cloud} alt="Looker Studio 与 ClickHouse Cloud SSL 设置的连接配置" border />
<br/>

其余步骤与前面部分列出的步骤相同。
