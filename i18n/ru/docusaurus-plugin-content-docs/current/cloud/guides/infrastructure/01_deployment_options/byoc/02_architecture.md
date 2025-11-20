---
title: 'Архитектура'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'Архитектура'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Развертывание ClickHouse в собственной облачной инфраструктуре'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## Архитектура {#architecture}

Метрики и журналы хранятся в BYOC VPC клиента. В настоящее время журналы хранятся локально в EBS. В будущем обновлении журналы будут храниться в LogHouse — сервисе ClickHouse в BYOC VPC клиента. Метрики реализованы через стек Prometheus и Thanos, который хранится локально в BYOC VPC клиента.

<br />

<Image img={byoc1} size='lg' alt='Архитектура BYOC' background='black' />

<br />
