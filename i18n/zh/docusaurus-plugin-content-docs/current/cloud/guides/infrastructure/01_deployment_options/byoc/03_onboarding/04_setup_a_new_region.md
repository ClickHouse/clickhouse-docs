---
title: '部署额外基础设施'
slug: /cloud/reference/byoc/onboarding/new_region
sidebar_label: '额外基础设施'
keywords: ['BYOC', 'Cloud', '自带云', '接入', '额外基础设施', '多区域', '多账户']
description: '在新区域或账户中部署额外的 BYOC 基础设施'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_new_infra_1 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'
import byoc_new_infra_2 from '@site/static/images/cloud/reference/byoc-new-infra-2.png'
import byoc_new_infra_3 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'

在完成初始接入流程后，您可能希望在不同区域，或在另一个 AWS 账户或 GCP 项目中部署额外的 BYOC 基础设施。

要添加新的 BYOC 部署：

<VerticalStepper headerLevel="list">
  1. 在 ClickHouse Cloud 控制台中导航到您组织的 &quot;Infrastructure&quot; 页面。

  <Image img={byoc_new_infra_1} size="lg" alt="BYOC infra 页面" />

  2. 选择 &quot;Add new account&quot; 或 &quot;Add new infrastructure&quot;，并按照引导式界面完成设置过程。

  <Image img={byoc_new_infra_2} size="lg" alt="BYOC infra 页面" />
</VerticalStepper>
