---
slug: /manage/security/cloud-endpoints-api
sidebar_label: 'クラウド IP アドレス'
title: 'クラウド IP アドレス'
description: 'このページでは、ClickHouse のクラウドエンドポイント API セキュリティ機能を文書化します。認証と認可メカニズムを通じてアクセスを管理することで、ClickHouse デプロイメントを保護する方法を詳細に説明します。'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API {#static-ips-api}

静的 IP のリストを取得する必要がある場合は、次の ClickHouse Cloud API エンドポイントを使用できます：[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。この API は、ClickHouse Cloud サービスのエンドポイントを提供します。例えば、地域とクラウド別のインバウンド/アウトバウンド IP および S3 エンドポイントです。

MySQL や PostgreSQL エンジンのような統合を使用している場合は、ClickHouse Cloud がインスタンスにアクセスするための認可が必要な場合があります。この API を使用して、パブリック IP を取得し、GCP の `firewalls` や `Authorized networks`、または Azure、AWS の `Security Groups`、または使用している他のインフラのエグレス管理システムに設定できます。

例えば、`ap-south-1` 地域にホストされている AWS の ClickHouse Cloud サービスからのアクセスを許可するには、その地域の `egress_ips` アドレスを追加できます：

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

例えば、`us-east-2` で稼働している AWS RDS インスタンスが ClickHouse Cloud サービスに接続する必要がある場合、次のインバウンドセキュリティグループルールを持っている必要があります：

<Image img={aws_rds_mysql} size="lg" alt="AWS セキュリティグループルール" border />

同じく `us-east-2` で稼働している ClickHouse Cloud サービスですが、今回は GCP に接続されている MySQLの場合、`Authorized networks` は次のようになります：

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
