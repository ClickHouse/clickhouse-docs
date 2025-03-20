---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online streamlines the power of data to make people faster and more confident decision makers from anywhere.'
---

import MySQLCloudSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import tableau_online_01 from '@site/static/images/integrations/data-visualization/tableau_online_01.png';
import tableau_online_02 from '@site/static/images/integrations/data-visualization/tableau_online_02.png';
import tableau_online_03 from '@site/static/images/integrations/data-visualization/tableau_online_03.png';
import tableau_online_04 from '@site/static/images/integrations/data-visualization/tableau_online_04.png';
import tableau_desktop_01 from '@site/static/images/integrations/data-visualization/tableau_desktop_01.png';
import tableau_desktop_02 from '@site/static/images/integrations/data-visualization/tableau_desktop_02.png';
import tableau_desktop_03 from '@site/static/images/integrations/data-visualization/tableau_desktop_03.png';
import tableau_desktop_04 from '@site/static/images/integrations/data-visualization/tableau_desktop_04.png';
import tableau_desktop_05 from '@site/static/images/integrations/data-visualization/tableau_desktop_05.png';


# Tableau Online

Tableau Online 可以通过 MySQL 接口连接 ClickHouse 云或本地 ClickHouse 设置，使用官方的 MySQL 数据源。

## ClickHouse 云设置 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## 本地 ClickHouse 服务器设置 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## 将 Tableau Online 连接到 ClickHouse（无 SSL 的本地设置） {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

登录到您的 Tableau Cloud 站点，并添加一个新的已发布数据源。

<img src={tableau_online_01} class="image" alt="创建一个新的已发布数据源" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

从可用连接器列表中选择 "MySQL"。

<img src={tableau_online_02} class="image" alt="选择 MySQL 连接器" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

指定您在 ClickHouse 设置期间收集的连接详情。

<img src={tableau_online_03} class="image" alt="指定您的连接详情" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

Tableau Online 将会探测数据库并提供可用表的列表。将所需的表拖到右侧的画布上。此外，您可以点击 "立即更新" 以预览数据，并微调探测到的字段类型或名称。

<img src={tableau_online_04} class="image" alt="选择要使用的表" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

之后，剩下的只是点击右上角的 "以此发布" ，您就可以像往常一样在 Tableau Online 中使用新创建的数据集。

注意：如果您想将 Tableau Online 与 Tableau Desktop 结合使用并在两者之间共享 ClickHouse 数据集，请确保您也使用默认 MySQL 连接器的 Tableau Desktop，遵循选择 MySQL 从数据源下拉菜单中显示的 [这里](https://www.tableau.com/support/drivers) 的设置指南。如果您有 M1 Mac，检查 [此故障排除线程](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) 获取驱动安装的变通方法。

## 将 Tableau Online 连接到 ClickHouse（带 SSL 的云或本地设置） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

由于无法通过 Tableau Online MySQL 连接设置向导提供 SSL 证书， 
唯一的方法是使用 Tableau Desktop 设置连接，然后将其导出到 Tableau Online。然而，这个过程相对简单。

在 Windows 或 Mac 机器上运行 Tableau Desktop，选择 "连接" -> "到服务器" -> "MySQL"。
在此之前，可能需要先在您的机器上安装 MySQL 驱动程序。 
您可以通过遵循选择 MySQL 从数据源下拉菜单中显示的 [这里](https://www.tableau.com/support/drivers) 的设置指南来完成此操作。
如果您有 M1 Mac，检查 [此故障排除线程](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) 获取驱动安装的变通方法。

<img src={tableau_desktop_01} class="image" alt="创建一个新的数据源" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

:::note
在 MySQL 连接设置 UI 中，确保 "SSL" 选项已启用。 
ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签署。 
您可以 [在这里](https://letsencrypt.org/certs/isrgrootx1.pem) 下载此根证书。
:::

提供您的 ClickHouse Cloud 实例 MySQL 用户凭据及下载的根证书的路径。

<img src={tableau_desktop_02} class="image" alt="指定您的凭据" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

像往常一样选择所需的表（与 Tableau Online 类似）， 
然后选择 "服务器" -> "发布数据源" -> Tableau Cloud。

<img src={tableau_desktop_03} class="image" alt="发布数据源" style={{width: '75%', 'background-color': 'transparent'}}/>
<br/>

重要：您需要在 "身份验证" 选项中选择 "嵌入密码"。

<img src={tableau_desktop_04} class="image" alt="数据源发布设置 - 嵌入您的凭据" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

此外，选择 "更新工作簿以使用已发布的数据源"。

<img src={tableau_desktop_05} class="image" alt="数据源发布设置 - 更新工作簿以供在线使用" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

最后，点击 "发布"，您的数据源和嵌入凭据将自动在 Tableau Online 中打开。


## 已知限制（ClickHouse 23.11） {#known-limitations-clickhouse-2311}

在 ClickHouse `23.11` 中修复了所有已知限制。如果您遇到其他不兼容问题，请不要犹豫 [联系我们](https://clickhouse.com/company/contact) 或创建 [新问题](https://github.com/ClickHouse/ClickHouse/issues)。
