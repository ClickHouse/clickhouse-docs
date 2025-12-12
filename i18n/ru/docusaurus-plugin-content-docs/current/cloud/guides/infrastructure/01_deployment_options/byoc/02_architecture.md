---
title: 'Архитектура'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'Архитектура'
keywords: ['BYOC', 'облако', 'использование собственного облака']
description: 'Развертывание ClickHouse в собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## Архитектура {#architecture}

Метрики и логи хранятся в VPC клиента в модели BYOC. В настоящее время логи хранятся локально в EBS. В одном из будущих обновлений логи будут храниться в LogHouse — сервисе ClickHouse в VPC клиента в модели BYOC. Метрики реализованы с помощью стека Prometheus и Thanos, который также хранится локально в VPC клиента в модели BYOC.

<br />

<Image img={byoc1} size="lg" alt="Архитектура BYOC" background='black'/>

<br />
