---
'sidebar_label': 'Retool'
'slug': '/integrations/retool'
'keywords':
- 'clickhouse'
- 'retool'
- 'connect'
- 'integrate'
- 'ui'
- 'admin'
- 'panel'
- 'dashboard'
- 'nocode'
- 'no-code'
'description': '快速构建具有丰富用户界面的 Web 和移动应用，自动化复杂任务，并集成 AI — 所有这一切都由您的数据驱动。'
'title': '将 Retool 连接到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Retool 连接到 ClickHouse

<CommunityMaintainedBadge/>

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建 ClickHouse 资源 {#2-create-a-clickhouse-resource}

登录到您的 Retool 账户并导航到 _Resources_ 选项卡。选择 "创建新资源" -> "资源":

<Image img={retool_01} size="lg" border alt="创建新资源" />
<br/>

从可用连接器列表中选择 "JDBC"：

<Image img={retool_02} size="lg" border alt="选择 JDBC 连接器" />
<br/>

在设置向导中，确保选择 `com.clickhouse.jdbc.ClickHouseDriver` 作为 "驱动程序名称"：

<Image img={retool_03} size="lg" border alt="选择正确的驱动程序" />
<br/>

按照以下格式填写您的 ClickHouse 凭据： `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
如果您的实例需要 SSL 或您正在使用 ClickHouse Cloud，请在连接字符串中添加 `&ssl=true`，使其看起来像 `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`

<Image img={retool_04} size="lg" border alt="指定您的凭据" />
<br/>

之后，测试您的连接：

<Image img={retool_05} size="lg" border alt="测试您的连接" />
<br/>

现在，您应该能够使用您的 ClickHouse 资源继续进行应用程序开发。
