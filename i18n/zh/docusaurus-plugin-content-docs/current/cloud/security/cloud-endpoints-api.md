---
'slug': '/manage/security/cloud-endpoints-api'
'sidebar_label': '云 IP 地址'
'title': '云 IP 地址'
'description': '此页面记录了 ClickHouse 中 Cloud Endpoints API 的安全特性。它详细说明了如何通过身份验证和授权机制管理访问来保护你的
  ClickHouse 部署。'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API {#static-ips-api}

如果您需要获取静态 IP 列表，可以使用以下 ClickHouse Cloud API 端点：[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。该 API 提供 ClickHouse Cloud 服务的端点，例如每个区域和云的入口/出口 IP 和 S3 端点。

如果您使用像 MySQL 或 PostgreSQL 引擎的集成，您可能需要授权 ClickHouse Cloud 访问您的实例。您可以使用该 API 检索公共 IP 并在 GCP 的 `firewalls` 或 `Authorized networks` 中进行配置，或者在 Azure、AWS 或您使用的任何其他基础设施出口管理系统的 `Security Groups` 中进行配置。

例如，要允许在区域 `ap-south-1` 上托管的 ClickHouse Cloud 服务访问，您可以添加该区域的 `egress_ips` 地址：

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

例如，在 `us-east-2` 中运行的 AWS RDS 实例，如果需要连接到 ClickHouse Cloud 服务，则应具有以下入站安全组规则：

<Image img={aws_rds_mysql} size="lg" alt="AWS Security group rules" border />

对于同一 ClickHouse Cloud 服务，在 `us-east-2` 中运行，但这次连接到 GCP 中的 MySQL，`Authorized networks` 应如下所示：

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
