---
slug: /manage/security/cloud-endpoints-api
sidebar_label: 云 IP 地址
title: 云 IP 地址
---

import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## 静态 IP API {#static-ips-api}

如果您需要获取静态 IP 列表，可以使用以下 ClickHouse Cloud API 端点：[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。此 API 提供 ClickHouse Cloud 服务的端点，例如每个区域和云的入站/出站 IP 和 S3 端点。

如果您正在使用 MySQL 或 PostgreSQL 引擎等集成，您可能需要授权 ClickHouse Cloud 访问您的实例。您可以使用此 API 检索公共 IP 并在 GCP 中配置它们于 `firewalls` 或 `Authorized networks`，或者在 Azure、AWS 中配置于 `Security Groups`，亦或在您使用的任何其他基础设施出站管理系统中配置。

例如，要允许来自位于区域 `ap-south-1` 的 AWS 上托管的 ClickHouse Cloud 服务的访问，您可以添加该区域的 `egress_ips` 地址：

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

例如，一个在 `us-east-2` 中运行的 AWS RDS 实例需要连接到 ClickHouse 云服务，应该具有以下入站安全组规则：

<img src={aws_rds_mysql} class="image" alt="AWS 安全组规则" />

对于同样在 `us-east-2` 中运行的 ClickHouse Cloud 服务，但这次连接到 GCP 中的 MySQL，`Authorized networks` 应该看起来像这样：

<img src={gcp_authorized_network} class="image" alt="GCP 授权网络" />
