---
title: 'Architecture'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'Architecture'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';

## Architecture {#architecture}

Metrics and logs are stored within the customer's BYOC VPC. Logs are currently stored in locally in EBS. In a future update, logs will be stored in LogHouse, which is a ClickHouse service in the customer's BYOC VPC. Metrics are implemented via a Prometheus and Thanos stack stored locally in the customer's BYOC VPC.

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />
