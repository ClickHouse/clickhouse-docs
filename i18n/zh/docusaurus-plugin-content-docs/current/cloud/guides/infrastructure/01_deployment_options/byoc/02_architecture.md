---
title: '架构'
slug: /cloud/reference/byoc/architecture
sidebar_label: '架构'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 架构 \\{#architecture\\}

指标和日志存储在客户的 BYOC VPC 中。当前日志本地存储在 EBS 中。在后续更新中，日志将存储在 LogHouse 中，LogHouse 是部署在客户 BYOC VPC 内的 ClickHouse 服务。指标通过 Prometheus 和 Thanos 技术栈实现，并本地存储在客户的 BYOC VPC 中。

<br />

<Image img={byoc1} size="lg" alt="BYOC 架构" background='black'/>

<br />
