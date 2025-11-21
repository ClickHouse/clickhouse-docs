---
title: 'Архитектура'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'Архитектура'
keywords: ['BYOC', 'облако', 'использование собственного облака']
description: 'Разверните ClickHouse в собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## Архитектура {#architecture}

Метрики и журналы хранятся в BYOC VPC клиента. В настоящее время журналы хранятся локально в EBS. В будущем обновлении журналы будут храниться в LogHouse — сервисе ClickHouse в BYOC VPC клиента. Метрики реализованы с помощью стека Prometheus и Thanos, который хранится локально в BYOC VPC клиента.

<br />

<Image img={byoc1} size='lg' alt='Архитектура BYOC' background='black' />

<br />
