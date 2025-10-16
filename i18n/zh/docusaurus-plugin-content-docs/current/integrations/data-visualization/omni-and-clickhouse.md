---
'sidebar_label': 'Omni'
'slug': '/integrations/omni'
'keywords':
- 'clickhouse'
- 'Omni'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Omni是一个用于BI、数据应用和嵌入式分析的企业平台，可帮助您实时探索和分享洞察。'
'title': 'Omni'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omni 可以通过官方 ClickHouse 数据源连接到 ClickHouse Cloud 或本地部署。

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 创建 ClickHouse 数据源 {#2-create-a-clickhouse-data-source}

导航到 Admin -> Connections，然后点击右上角的“添加连接”按钮。

<Image size="lg" img={omni_01} alt="Omni 管理界面显示 Connections 部分的 Add Connection 按钮" border />
<br/>

选择 `ClickHouse`。在表单中输入您的凭证。

<Image size="lg" img={omni_02} alt="Omni 连接配置界面显示 ClickHouse 凭证表单字段" border />
<br/>

现在您应该可以在 Omni 中查询和可视化 ClickHouse 的数据。
