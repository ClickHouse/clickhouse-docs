---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online 让数据的力量触手可及，使人们无论身在何处都能更快速、更自信地做出决策。'
title: 'Tableau Online'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import MySQLCloudSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
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

# Tableau Online \{#tableau-online\}

Tableau Online 可以通过官方 MySQL 数据源，使用 MySQL 接口连接到 ClickHouse Cloud 或本地部署的 ClickHouse 环境。

## ClickHouse Cloud 配置 \{#clickhouse-cloud-setup\}

<MySQLCloudSetup />

## 本地部署 ClickHouse 服务器安装与配置 \{#on-premise-clickhouse-server-setup\}

<MySQLOnPremiseSetup />

## 将 Tableau Online 连接到 ClickHouse（本地部署且不使用 SSL） \{#connecting-tableau-online-to-clickhouse-on-premise-without-ssl\}

登录您的 Tableau Cloud 站点并添加一个新的 Published Data Source（已发布数据源）。

<Image size="md" img={tableau_online_01} alt="Tableau Online 界面显示用于创建已发布数据源的 “New” 按钮" border />

<br/>

从可用连接器列表中选择 “MySQL”。

<Image size="md" img={tableau_online_02} alt="Tableau Online 连接器选择界面，其中 MySQL 选项被高亮显示" border />

<br/>

填写在 ClickHouse 部署/配置过程中获取的连接信息。

<Image size="md" img={tableau_online_03} alt="Tableau Online MySQL 连接配置界面，包含服务器、端口、数据库和凭证字段" border />

<br/>

Tableau Online 会自动扫描数据库并提供可用表的列表。将所需的表拖动到右侧画布上。此外，您可以点击 “Update Now” 预览数据，并根据需要微调自动识别出的字段类型或名称。

<Image size="md" img={tableau_online_04} alt="Tableau Online 数据源页面，左侧显示数据库表，右侧是具有拖放功能的画布" border />

<br/>

完成后，只需点击右上角的 “Publish As”，即可像往常一样在 Tableau Online 中使用新创建的数据集。

注意：如果您想将 Tableau Online 与 Tableau Desktop 配合使用，并在二者之间共享 ClickHouse 数据集，请确保在 Tableau Desktop 中同样使用默认的 MySQL 连接器，并按照在 Data Source 下拉框中选择 MySQL 时显示的安装指南进行配置，该指南位于[此处](https://www.tableau.com/support/drivers)。如果您使用的是 M1 Mac，请查看[此故障排除帖](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac) 以获取驱动安装的替代方案。

## 将 Tableau Online 连接到 ClickHouse（云端或本地部署，使用 SSL） \{#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl\}

由于无法在 Tableau Online 的 MySQL 连接设置向导中提供 SSL 证书，
唯一的方法是使用 Tableau Desktop 完成连接设置，然后将其发布到 Tableau Online。不过，这一过程其实非常简单。

在运行 Windows 或 macOS 的机器上启动 Tableau Desktop，然后选择 "Connect" -> "To a Server" -> "MySQL"。
通常，你需要先在本机安装 MySQL 驱动。
可以在 Data Source 下拉菜单中选择 MySQL 后，按照[此处](https://www.tableau.com/support/drivers)显示的设置指南进行安装。
如果你使用的是 M1 Mac，请查看[这个故障排查帖](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)，获取安装驱动的替代方案。

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop 界面，显示 Connect 菜单，其中 MySQL 选项被高亮" border />
<br/>

:::note
在 MySQL 连接设置界面中，请确保启用了 "SSL" 选项。
ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签发。
你可以在[这里](https://letsencrypt.org/certs/isrgrootx1.pem)下载该根证书。
:::

填写你的 ClickHouse Cloud 实例的 MySQL 用户凭据，以及刚刚下载的根证书路径。

<Image size="sm" img={tableau_desktop_02} alt="Tableau Desktop MySQL 连接对话框，已启用 SSL 选项，并显示 server、username、password 和 certificate 字段" border />
<br/>

像平常一样选择需要的表（与在 Tableau Online 中类似），
然后选择 "Server" -> "Publish Data Source" -> Tableau Cloud。

<Image size="md" img={tableau_desktop_03} alt="Tableau Desktop 显示 Server 菜单，其中 Publish Data Source 选项被高亮" border />
<br/>

重要：你需要在 "Authentication" 选项中选择 "Embedded password"。

<Image size="md" img={tableau_desktop_04} alt="Tableau Desktop 发布对话框，显示 Authentication 选项，其中 Embedded password 已被选中" border />
<br/>

另外，勾选 "Update workbook to use the published data source"。

<Image size="sm" img={tableau_desktop_05} alt="Tableau Desktop 发布对话框，已勾选 'Update workbook to use the published data source' 选项" border />
<br/>

最后，点击 "Publish"，你嵌入了凭据的数据源会在 Tableau Online 中自动打开。

## 已知限制（ClickHouse 23.11） \{#known-limitations-clickhouse-2311\}

所有已知限制均已在 ClickHouse `23.11` 中修复。如果您遇到任何其他不兼容问题，请随时[联系我们](https://clickhouse.com/company/contact)或创建一个[新 issue](https://github.com/ClickHouse/ClickHouse/issues)。