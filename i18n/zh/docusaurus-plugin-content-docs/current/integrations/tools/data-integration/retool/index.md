---
sidebar_label: Retool
slug: /integrations/retool
keywords: [clickhouse, retool, connect, integrate, ui, admin, panel, dashboard, nocode, no-code]
description: 快速构建具有丰富用户界面的web和移动应用程序，自动化复杂任务，并集成AI——一切都由您的数据驱动。
---
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';


# 将 Retool 连接到 ClickHouse

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建 ClickHouse 资源 {#2-create-a-clickhouse-resource}

登录您的 Retool 账户并导航到 _Resources_ 选项卡。选择“创建新资源” -> “资源”：

<img src={retool_01} className="image" alt="Creating a new resource" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

从可用连接器列表中选择“JDBC”：

<img src={retool_02} className="image" alt="Choosing JDBC connector" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

在设置向导中，确保选择 `com.clickhouse.jdbc.ClickHouseDriver` 作为“驱动程序名称”：

<img src={retool_03} className="image" alt="Selecting the right driver" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

以以下格式填写您的 ClickHouse 凭据：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。如果您的实例需要 SSL 或您正在使用 ClickHouse Cloud，请在连接字符串中添加 `&ssl=true`，使其看起来像 `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`。

<img src={retool_04} className="image" alt="Specifying your credentials" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

之后，测试您的连接：

<img src={retool_05} className="image" alt="Testing your connection" style={{width: '75%', 'backgroundColor': 'transparent'}}/>
<br/>

现在，您应该能够使用您的 ClickHouse 资源继续进行您的应用程序。
