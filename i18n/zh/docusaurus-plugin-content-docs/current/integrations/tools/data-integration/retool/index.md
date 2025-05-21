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
'description': 'Quickly build web and mobile apps with rich user interfaces, automate
  complex tasks, and integrate AI—all powered by your data.'
'title': 'Connecting Retool to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Retool 连接到 ClickHouse

<CommunityMaintainedBadge/>

## 1. 收集你的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 创建一个 ClickHouse 资源 {#2-create-a-clickhouse-resource}

登录到你的 Retool 账户并导航到 _Resources_ 选项卡。选择“创建新资源” -> “资源”：

<Image img={retool_01} size="lg" border alt="创建新资源" />
<br/>

从可用连接器列表中选择“JDBC”：

<Image img={retool_02} size="lg" border alt="选择 JDBC 连接器" />
<br/>

在设置向导中，确保选择 `com.clickhouse.jdbc.ClickHouseDriver` 作为“驱动名称”：

<Image img={retool_03} size="lg" border alt="选择正确的驱动程序" />
<br/>

按照以下格式填写你的 ClickHouse 凭据：`jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`。
如果你的实例需要 SSL，或者你使用的是 ClickHouse Cloud，请将 `&ssl=true` 添加到连接字符串中，使其看起来像 `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`。

<Image img={retool_04} size="lg" border alt="指定你的凭据" />
<br/>

之后，测试你的连接：

<Image img={retool_05} size="lg" border alt="测试你的连接" />
<br/>

现在，你应该能够使用你的 ClickHouse 资源继续使用你的应用。
