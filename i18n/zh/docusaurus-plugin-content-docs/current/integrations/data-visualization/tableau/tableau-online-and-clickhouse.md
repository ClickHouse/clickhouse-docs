---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online 充分释放数据的力量，让人们无论身在何处都能更快速、更自信地做出决策。'
title: 'Tableau Online'
doc_type: 'guide'
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

Tableau Online 可以通过官方 MySQL 数据源，借助 MySQL 接口连接到 ClickHouse Cloud 或本地部署的 ClickHouse 实例。



## ClickHouse Cloud 设置 {#clickhouse-cloud-setup}

<MySQLCloudSetup />


## 本地部署 ClickHouse 服务器配置 {#on-premise-clickhouse-server-setup}

<MySQLOnPremiseSetup />


## 将 Tableau Online 连接到 ClickHouse(本地部署,无 SSL){#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

登录到您的 Tableau Cloud 站点并添加新的已发布数据源。

<Image
  size='md'
  img={tableau_online_01}
  alt="Tableau Online 界面显示用于创建已发布数据源的"新建"按钮"
  border
/>
<br />

从可用连接器列表中选择"MySQL"。

<Image
  size='md'
  img={tableau_online_02}
  alt='Tableau Online 连接器选择界面,MySQL 选项已高亮显示'
  border
/>
<br />

指定在 ClickHouse 设置过程中收集的连接详细信息。

<Image
  size='md'
  img={tableau_online_03}
  alt='Tableau Online MySQL 连接配置界面,包含服务器、端口、数据库和凭据字段'
  border
/>
<br />

Tableau Online 将自动检查数据库并提供可用表的列表。将所需的表拖动到右侧的画布上。此外,您可以点击"立即更新"来预览数据,以及调整检查到的字段类型或名称。

<Image
  size='md'
  img={tableau_online_04}
  alt='Tableau Online 数据源页面,左侧显示数据库表,右侧显示具有拖放功能的画布'
  border
/>
<br />

之后,只需点击右上角的"发布为"按钮,您就可以像往常一样在 Tableau Online 中使用新创建的数据集。

注意:如果您想将 Tableau Online 与 Tableau Desktop 结合使用并在它们之间共享 ClickHouse 数据集,请确保在 Tableau Desktop 中也使用默认的 MySQL 连接器,并按照从数据源下拉菜单中选择 MySQL 时显示的[此处](https://www.tableau.com/support/drivers)设置指南进行操作。如果您使用的是 M1 Mac,请查看[此故障排除主题](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)以获取驱动程序安装的解决方法。


## 将 Tableau Online 连接到 ClickHouse(云端或本地部署,使用 SSL){#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

由于无法通过 Tableau Online MySQL 连接设置向导提供 SSL 证书,
唯一的方法是使用 Tableau Desktop 设置连接,然后将其导出到 Tableau Online。不过,此过程非常简单。

在 Windows 或 Mac 计算机上运行 Tableau Desktop,然后选择"连接"->"到服务器"->"MySQL"。
您可能需要先在计算机上安装 MySQL 驱动程序。
您可以按照[此处](https://www.tableau.com/support/drivers)显示的设置指南进行操作,从数据源下拉菜单中选择 MySQL。
如果您使用的是 M1 Mac,请查看[此故障排除主题](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)以获取驱动程序安装的解决方法。

<Image
  size='md'
  img={tableau_desktop_01}
  alt='Tableau Desktop 界面显示连接菜单,其中 MySQL 选项已突出显示'
  border
/>
<br />

:::note
在 MySQL 连接设置界面中,确保启用"SSL"选项。
ClickHouse Cloud 的 SSL 证书由 [Let's Encrypt](https://letsencrypt.org/certificates/) 签发。
您可以在[此处](https://letsencrypt.org/certs/isrgrootx1.pem)下载此根证书。
:::

提供您的 ClickHouse Cloud 实例 MySQL 用户凭据以及已下载根证书的路径。

<Image
  size='sm'
  img={tableau_desktop_02}
  alt='Tableau Desktop MySQL 连接对话框,已启用 SSL 选项,包含服务器、用户名、密码和证书字段'
  border
/>
<br />

像往常一样选择所需的表(与 Tableau Online 类似),
然后选择"服务器"->"发布数据源"-> Tableau Cloud。

<Image
  size='md'
  img={tableau_desktop_03}
  alt='Tableau Desktop 显示服务器菜单,其中发布数据源选项已突出显示'
  border
/>
<br />

重要提示:您需要在"身份验证"选项中选择"嵌入式密码"。

<Image
  size='md'
  img={tableau_desktop_04}
  alt='Tableau Desktop 发布对话框显示身份验证选项,已选择嵌入式密码'
  border
/>
<br />

此外,选择"更新工作簿以使用已发布的数据源"。

<Image
  size='sm'
  img={tableau_desktop_05}
  alt="Tableau Desktop 发布对话框,已勾选'更新工作簿以使用已发布的数据源'选项"
  border
/>
<br />

最后,点击"发布",您的带有嵌入式凭据的数据源将在 Tableau Online 中自动打开。


## 已知限制(ClickHouse 23.11) {#known-limitations-clickhouse-2311}

所有已知限制均已在 ClickHouse `23.11` 中修复。如果您遇到任何其他不兼容问题,请随时[联系我们](https://clickhouse.com/company/contact)或[提交新 issue](https://github.com/ClickHouse/ClickHouse/issues)。
