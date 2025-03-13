---
slug: /manage/security/cloud-endpoints-api
sidebar_label: Cloud IP Addresses
title: Cloud IP Addresses
---

import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API {#static-ips-api}

静的IPのリストを取得する必要がある場合は、次のClickHouse Cloud APIエンドポイントを使用できます: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。このAPIは、地域やクラウドごとのClickHouse Cloudサービスに関するエンドポイントを提供します。これには、インバウンド/アウトバウンドIPおよびS3エンドポイントが含まれます。

MySQLやPostgreSQLエンジンのような統合を使用している場合、ClickHouse Cloudがあなたのインスタンスにアクセスできるように承認する必要があるかもしれません。このAPIを使用して、公開IPを取得し、GCPの`firewalls`や`Authorized networks`、またはAzure、AWSの`Security Groups`、あるいは使用している他のインフラストラクチャのエグレス管理システムに構成できます。

例えば、地域`ap-south-1`でホストされているAWSのClickHouse Cloudサービスからのアクセスを許可するには、その地域の`egress_ips`アドレスを追加できます:

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

例えば、`us-east-2`で稼働しているAWS RDSインスタンスがClickHouse Cloudサービスに接続する必要がある場合、以下のインバウンドセキュリティグループルールが必要です:

<img src={aws_rds_mysql} class="image" alt="AWS Security group rules" />

同じClickHouse Cloudサービスが`us-east-2`で稼働している場合に、今度はGCPのMySQLに接続している場合、`Authorized networks`は次のようになります:

<img src={gcp_authorized_network} class="image" alt="GCP Authorized networks" />
