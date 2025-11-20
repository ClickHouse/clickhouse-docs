---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'Cloud IP addresses'
title: '云端 IP 地址'
description: '本页介绍 ClickHouse 中 Cloud Endpoints API 的安全特性，并说明如何通过身份验证和授权机制管理访问，从而保护您的 ClickHouse 部署。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'static IP addresses', 'cloud endpoints', 'API', 'security', 'egress IPs', 'ingress IPs', 'firewall']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';


## 静态 IP API {#static-ips-api}

如果您需要获取静态 IP 列表,可以使用以下 ClickHouse Cloud API 端点:[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。该 API 提供 ClickHouse Cloud 服务的端点信息,包括各区域和云平台的入站/出站 IP 以及 S3 端点。

如果您使用了 MySQL 或 PostgreSQL 引擎等集成,可能需要授权 ClickHouse Cloud 访问您的实例。您可以使用此 API 获取公网 IP,并在 GCP 的 `firewalls` 或 `Authorized networks` 中配置这些 IP,或在 Azure、AWS 的 `Security Groups` 中配置,也可以在您使用的任何其他基础设施出站管理系统中进行配置。

例如,要允许托管在 AWS `ap-south-1` 区域的 ClickHouse Cloud 服务进行访问,您可以添加该区域的 `egress_ips` 地址:

```bash
❯ curl -s https://api.clickhouse.cloud/static-ips.json | jq '.'
{
  "aws": [
    {
      "egress_ips": [
        "3.110.39.68",
        "15.206.7.77",
        "3.6.83.17"
      ],
      "ingress_ips": [
        "15.206.78.111",
        "3.6.185.108",
        "43.204.6.248"
      ],
      "region": "ap-south-1",
      "s3_endpoints": "vpce-0a975c9130d07276d"
    },
...
```

例如,运行在 `us-east-2` 区域且需要连接到 ClickHouse Cloud 服务的 AWS RDS 实例应配置以下入站安全组规则:

<Image img={aws_rds_mysql} size='lg' alt='AWS 安全组规则' border />

对于同样运行在 `us-east-2` 区域的 ClickHouse Cloud 服务,如果这次连接到 GCP 中的 MySQL,则 `Authorized networks` 应配置如下:

<Image
  img={gcp_authorized_network}
  size='md'
  alt='GCP 授权网络'
  border
/>
