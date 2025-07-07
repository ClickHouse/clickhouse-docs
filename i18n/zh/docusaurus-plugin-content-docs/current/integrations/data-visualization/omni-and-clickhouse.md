---
'sidebar_label': 'Omni'
'slug': '/integrations/omni'
'keywords':
- 'clickhouse'
- 'Omni'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Omni 是一个用于商业智能、数据应用和嵌入式分析的企业平台，帮助您实时探索和分享洞察。'
'title': 'Omni'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omni可以通过官方的ClickHouse数据源连接到ClickHouse Cloud或本地部署。

## 1. 收集连接详情 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 创建ClickHouse数据源 {#2-create-a-clickhouse-data-source}

导航到Admin -> Connections，点击右上角的“Add Connection”按钮。

<Image size="lg" img={omni_01} alt="Omni管理界面，显示Connections部分的Add Connection按钮" border />
<br/>

选择`ClickHouse`。在表单中输入您的凭证。

<Image size="lg" img={omni_02} alt="Omni连接配置界面，展示ClickHouse的凭证表单字段" border />
<br/>

现在您可以在Omni中查询和可视化ClickHouse中的数据。
