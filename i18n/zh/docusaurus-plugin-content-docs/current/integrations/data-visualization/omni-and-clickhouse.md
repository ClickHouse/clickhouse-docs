---
'sidebar_label': 'Omni'
'slug': '/integrations/omni'
'keywords':
- 'clickhouse'
- 'Omni'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Omni 是一个企业级平台，用于商业智能、数据应用和嵌入式分析，帮助您实时探索和分享洞察。'
'title': 'Omni'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Omni

<CommunityMaintainedBadge/>

Omni 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署。

## 1. 收集连接细节 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航到 Admin -> Connections，然后单击右上角的“添加连接”按钮。

<Image size="lg" img={omni_01} alt="Omni 管理界面显示在 Connections 部分的添加连接按钮" border />
<br/>

选择 `ClickHouse`。在表单中输入您的凭据。

<Image size="lg" img={omni_02} alt="Omni 连接配置界面用于 ClickHouse 显示凭据表单字段" border />
<br/>

现在您应该可以在 Omni 中查询和可视化来自 ClickHouse 的数据。
