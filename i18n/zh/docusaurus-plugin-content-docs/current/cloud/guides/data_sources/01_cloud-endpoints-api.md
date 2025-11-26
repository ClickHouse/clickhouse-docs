---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'Cloud IP 地址'
title: 'Cloud IP 地址'
description: '本页介绍 ClickHouse 中 Cloud Endpoints API 的安全功能，说明如何通过身份验证和授权机制管理访问，从而保护 ClickHouse 部署。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '静态 IP 地址', 'cloud endpoints', 'API', '安全性', '出站 IP', '入站 IP', '防火墙']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';


## 静态 IP API

如果需要获取静态 IP 列表，可以使用以下 ClickHouse Cloud API 端点：[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。该 API 提供 ClickHouse Cloud 服务的端点信息，例如按云和区域划分的入口/出口 IP 以及 S3 端点。

如果使用 MySQL 或 PostgreSQL Engine 等集成功能，可能需要授权 ClickHouse Cloud 访问您的实例。可以使用此 API 获取公网 IP，并将其配置在 GCP 的 `firewalls` 或 `Authorized networks` 中，或配置在 Azure、AWS 的 `Security Groups` 中，或者配置到您使用的任何其他基础设施出站流量管理系统中。

例如，要允许来自托管在 AWS、区域为 `ap-south-1` 的 ClickHouse Cloud 服务的访问，可以添加该区域的 `egress_ips` 地址：

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

例如，在 `us-east-2` 区域运行且需要连接到 ClickHouse Cloud 服务的 AWS RDS 实例，其入站安全组规则应配置如下：

<Image img={aws_rds_mysql} size="lg" alt="AWS Security group rules" border />

对于同一在 `us-east-2` 运行的 ClickHouse Cloud 服务，但这次连接的是位于 GCP 的 MySQL 实例，其 `Authorized networks` 应配置如下：

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
