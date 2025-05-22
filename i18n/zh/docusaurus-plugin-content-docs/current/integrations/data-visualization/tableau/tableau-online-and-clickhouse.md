---
'sidebar_label': 'Tableau Online'
'sidebar_position': 2
'slug': '/integrations/tableau-online'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau Online 简化了数据的强大功能，使人们能够更加快速和自信地做出决策，无论身处何地。'
'title': 'Tableau Online'
---

import MySQLCloudSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
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

Tableau Online 可以通过官方的 MySQL 数据源连接到 ClickHouse Cloud 或本地的 ClickHouse 设置。

## ClickHouse Cloud 设置 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## 本地 ClickHouse 服务器设置 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## 连接 Tableau Online 到 ClickHouse（无 SSL 的本地设置） {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

登录到您的 Tableau Cloud 站点并添加新的发布数据源。

<Image size="md" img={tableau_online_01} alt="Tableau Online 界面显示 'New' 按钮以创建发布的数据源" border />
<br/>

从可用连接器列表中选择 "MySQL"。

<Image size="md" img={tableau_online_02} alt="Tableau Online 连接器选择屏幕，突出显示 MySQL 选项" border />
<br/>

指定在 ClickHouse 设置期间收集的连接详情。

<Image size="md" img={tableau_online_03} alt="Tableau Online MySQL 连接配置屏幕，显示服务器、端口、数据库和凭据字段" border />
<br/>

Tableau Online 会自动分析数据库并提供可用表的列表。将所需的表拖到右侧的画布上。此外，您可以点击 "Update Now" 预览数据，并微调分析的字段类型或名称。

<Image size="md" img={tableau_online_04} alt="Tableau Online 数据源页面显示左侧的数据库表和右侧的画布，具有拖放功能" border />
<br/>

之后，您只需点击右上角的 "Publish As"，就可以像往常一样在 Tableau Online 中使用新创建的数据集。

注意：如果您希望将 Tableau Online 与 Tableau Desktop 结合使用并在它们之间共享 ClickHouse 数据集，请确保您在使用默认的 MySQL 连接器的 Tableau Desktop 中执行相同操作，并按照在选择 MySQL 从数据源下拉列表中显示的设置指南 [here](https://www.tableau.com/support/drivers)。如果您有 M1 Mac，请查看 [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) 以获取驱动程序安装的解决方法。

## 连接 Tableau Online 到 ClickHouse（使用 SSL 的 Cloud 或本地设置） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

由于无法通过 Tableau Online MySQL 连接设置向导提供 SSL 证书，唯一的方法是使用 Tableau Desktop 设置连接，然后将其导出到 Tableau Online。然而，这个过程相当简单。

在 Windows 或 Mac 机器上运行 Tableau Desktop，选择 "Connect" -> "To a Server" -> "MySQL"。
可能需要先在您的机器上安装 MySQL 驱动程序。您可以按照在选择 MySQL 从数据源下拉列表中显示的设置指南 [here](https://www.tableau.com/support/drivers) 来进行安装。如果您有 M1 Mac，请查看 [this troubleshooting thread](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) 以获取驱动程序安装的解决方法。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop 界面显示连接菜单，突出显示 MySQL 选项" border />
<br/>

:::note
在 MySQL 连接设置 UI 中，确保启用 "SSL" 选项。
ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签名。
您可以在 [here](https://letsencrypt.org/certs/isrgrootx1.pem) 下载此根证书。
:::

提供您的 ClickHouse Cloud 实例 MySQL 用户凭据及下载的根证书的路径。

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop MySQL 连接对话框，启用 SSL 选项，显示服务器、用户名、密码和证书字段" border />
<br/>

像往常一样选择所需的表（类似于 Tableau Online），
然后选择 "Server" -> "Publish Data Source" -> Tableau Cloud。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop 显示服务器菜单，突出显示发布数据源选项" border />
<br/>

重要：您需要在 "Authentication" 选项中选择 "Embedded password"。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop 发布对话框显示的身份验证选项，选中嵌入密码" border />
<br/>

此外，选择 "Update workbook to use the published data source"。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop 发布对话框，选中 'Update workbook to use the published data source' 选项" border />
<br/>

最后，点击 "Publish"，您的数据源将自动在 Tableau Online 中打开，且具有嵌入的凭据。

## 已知限制（ClickHouse 23.11） {#known-limitations-clickhouse-2311}

在 ClickHouse `23.11` 中已修复所有已知限制。如果您遇到其他不兼容问题，请随时 [contact us](https://clickhouse.com/company/contact) 或创建 [new issue](https://github.com/ClickHouse/ClickHouse/issues)。
