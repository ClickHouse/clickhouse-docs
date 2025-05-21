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
'description': 'Tableau Online streamlines the power of data to make people faster
  and more confident decision makers from anywhere.'
'title': 'Tableau Online'
---

import MySQLCloudSetup from '@site/docs/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/docs/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
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

Tableau Online 可以通过 MySQL 接口连接到 ClickHouse Cloud 或本地 ClickHouse 设置，使用官方 MySQL 数据源。

## ClickHouse Cloud 设置 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## 本地 ClickHouse 服务器设置 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## 将 Tableau Online 连接到 ClickHouse（本地，无 SSL） {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

登录到您的 Tableau Cloud 站点并添加一个新的已发布数据源。

<Image size="md" img={tableau_online_01} alt="Tableau Online 界面显示创建已发布数据源的 '新建' 按钮" border />
<br/>

从可用连接器列表中选择 "MySQL"。

<Image size="md" img={tableau_online_02} alt="Tableau Online 连接器选择屏幕，突出显示 MySQL 选项" border />
<br/>

指定在 ClickHouse 设置期间收集的连接详细信息。

<Image size="md" img={tableau_online_03} alt="Tableau Online MySQL 连接配置屏幕，包括服务器、端口、数据库和凭证字段" border />
<br/>

Tableau Online 将对数据库进行反向工程，并提供可用表的列表。将所需的表拖动到右侧的画布上。此外，您可以点击 "立即更新" 以预览数据，并微调反向工程的字段类型或名称。

<Image size="md" img={tableau_online_04} alt="Tableau Online 数据源页面，左侧显示数据库表，右侧显示具有拖放功能的画布" border />
<br/>

之后，剩下的就是在右上角点击 "作为发布" ，您应该能够像往常一样在 Tableau Online 中使用新创建的数据集。

注意：如果您想将 Tableau Online 与 Tableau Desktop 结合使用并在二者之间共享 ClickHouse 数据集，请确保您在 Tableau Desktop 中也使用默认的 MySQL 连接器，按照在选择 MySQL 从数据源下拉菜单中显示的设置指南进行操作，[点击这里](https://www.tableau.com/support/drivers)。如果您使用的是 M1 Mac，请查看 [这个故障排除线程](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)，以获取驱动程序安装的变通方法。

## 将 Tableau Online 连接到 ClickHouse（Cloud 或本地设置，带 SSL） {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

由于无法通过 Tableau Online MySQL 连接设置向导提供 SSL 证书，唯一的方法是使用 Tableau Desktop 设置连接，然后将其导出到 Tableau Online。这个过程相对简单。

在 Windows 或 Mac 机器上运行 Tableau Desktop，然后选择 "连接" -> "到服务器" -> "MySQL"。
您可能需要先在您的机器上安装 MySQL 驱动程序。
您可以通过选择 MySQL 从数据源下拉菜单中显示的设置指南来执行此操作，[点击这里](https://www.tableau.com/support/drivers)。
如果您使用的是 M1 Mac，请查看 [这个故障排除线程](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)，以获取驱动程序安装的变通方法。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop 界面显示的连接菜单，突出显示 MySQL 选项" border />
<br/>

:::note
在 MySQL 连接设置 UI 中，请确保 "SSL" 选项已启用。
ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签名。
您可以 [这里](https://letsencrypt.org/certs/isrgrootx1.pem) 下载该根证书。
:::

提供您的 ClickHouse Cloud 实例 MySQL 用户凭证和下载的根证书的路径。

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop MySQL 连接对话框，SSL 选项已启用，包含服务器、用户名、密码和证书字段" border />
<br/>

像往常一样选择所需的表（与 Tableau Online 相似），然后选择 "服务器" -> "发布数据源" -> Tableau Cloud。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop 显示服务器菜单，突出显示发布数据源选项" border />
<br/>

重要提示：您需要在 "身份验证" 选项中选择 "嵌入密码"。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop 发布对话框，显示身份验证选项，已选择嵌入密码" border />
<br/>

此外，选择 "更新工作簿以使用已发布的数据源"。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop 发布对话框，选中 '更新工作簿以使用已发布的数据源' 选项" border />
<br/>

最后，点击 "发布"，您的数据源将自动以嵌入凭证在 Tableau Online 中打开。

## 已知限制 (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

ClickHouse `23.11` 中已修复所有已知限制。如果您遇到任何其他不兼容问题，请随时 [联系我们](https://clickhouse.com/company/contact) 或创建 [新问题](https://github.com/ClickHouse/ClickHouse/issues).
