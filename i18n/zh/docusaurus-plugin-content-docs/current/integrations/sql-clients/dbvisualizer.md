---
'sidebar_label': 'DbVisualizer'
'slug': '/integrations/dbvisualizer'
'description': 'DbVisualizer是一个具有对ClickHouse的扩展支持的数据库工具。'
'title': 'Connecting DbVisualizer to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 DbVisualizer 和 ClickHouse

<CommunityMaintainedBadge/>

## 开始或下载 DbVisualizer {#start-or-download-dbvisualizer}

DbVisualizer 可在 https://www.dbvis.com/download/ 获取。

## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 内置 JDBC 驱动管理 {#2-built-in-jdbc-driver-management}

DbVisualizer 包含最最新的 ClickHouse JDBC 驱动。它内置了完整的 JDBC 驱动管理，指向最新版本及驱动的历史版本。

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizer 驱动管理界面显示 ClickHouse JDBC 驱动配置" />

## 3. 连接到 ClickHouse {#3-connect-to-clickhouse}

要使用 DbVisualizer 连接数据库，您必须首先创建并设置数据库连接。

1. 从 **数据库->创建数据库连接** 创建一个新连接，并从弹出菜单中选择数据库驱动。

2. 新连接的 **对象视图** 标签被打开。

3. 在 **名称** 字段中输入连接的名称，并可选地在 **备注** 字段中输入连接的描述。

4. 将 **数据库类型** 保持为 **自动检测**。

5. 如果在 **驱动类型** 中选择的驱动带有绿色对勾标记，则可以使用。如果没有绿色对勾标记，您可能需要在 **驱动管理器** 中配置该驱动。

6. 在其余字段中输入关于数据库服务器的信息。

7. 通过单击 **Ping 服务器** 按钮验证能否与指定的地址和端口建立网络连接。

8. 如果 Ping 服务器的结果显示可以访问服务器，请单击 **连接** 以连接到数据库服务器。

:::tip
如果您在连接数据库时遇到问题，请参阅 [解决连接问题](https://confluence.dbvis.com/display/UG231/Fixing+Connection+Issues) 获取一些提示。

## 了解更多 {#learn-more}

要获取有关 DbVisualizer 的更多信息，请访问 [DbVisualizer 文档](https://confluence.dbvis.com/display/UG231/Users+Guide)。
