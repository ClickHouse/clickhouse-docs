---
title: 'Introduction'
slug: /cloud/reference/byoc/overview
sidebar_label: 'BYOC Introduction'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Deploy ClickHouse on your own cloud infrastructure'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';

## Overview {#overview}

BYOC (Bring Your Own Cloud) allows you to deploy ClickHouse Cloud on your own cloud infrastructure. This is useful if you have specific requirements or constraints that prevent you from using the ClickHouse Cloud managed service.

**If you would like access, please [contact us](https://clickhouse.com/cloud/bring-your-own-cloud).** Refer to our [Terms of Service](https://clickhouse.com/legal/agreements/terms-of-service) for additional information.

BYOC is currently only supported for AWS, with GCP and Microsoft Azure in development.

:::note 
BYOC is designed specifically for large-scale deployments, and requires customers to sign a committed contract.
:::

## Glossary {#glossary}

- **ClickHouse VPC:**  The VPC owned by ClickHouse Cloud.
- **Customer BYOC VPC:** The VPC, owned by the customer’s cloud account, is provisioned and managed by ClickHouse Cloud and dedicated to a ClickHouse Cloud BYOC deployment.
- **Customer VPC** Other VPCs owned by the customer cloud account used for applications that need to connect to the Customer BYOC VPC.

## Architecture {#architecture}

Metrics and logs are stored within the customer's BYOC VPC. Logs are currently stored in locally in EBS. In a future update, logs will be stored in LogHouse, which is a ClickHouse service in the customer's BYOC VPC. Metrics are implemented via a Prometheus and Thanos stack stored locally in the customer's BYOC VPC.

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />