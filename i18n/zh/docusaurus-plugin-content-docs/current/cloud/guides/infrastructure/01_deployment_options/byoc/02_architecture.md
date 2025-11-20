---
title: '架构'
slug: /cloud/reference/byoc/architecture
sidebar_label: '架构'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '在您自有的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 架构 {#architecture}

指标和日志存储在客户的 BYOC VPC 内。日志目前存储在本地 EBS 中。在未来的更新中,日志将存储在 LogHouse 中,LogHouse 是客户 BYOC VPC 内的一个 ClickHouse 服务。指标通过存储在客户 BYOC VPC 本地的 Prometheus 和 Thanos 技术栈来实现。

<br />

<Image img={byoc1} size='lg' alt='BYOC 架构' background='black' />

<br />
