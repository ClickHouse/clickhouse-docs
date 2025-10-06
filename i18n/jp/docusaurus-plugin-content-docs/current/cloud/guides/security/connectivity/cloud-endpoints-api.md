---
'slug': '/manage/security/cloud-endpoints-api'
'sidebar_label': 'クラウド IP アドレス'
'title': 'クラウド IP アドレス'
'description': 'このページでは、ClickHouse 内のクラウドエンドポイント API セキュリティ機能について説明します。認証と認可メカニズムを介してアクセスを管理することで、ClickHouse
  デプロイメントを保護する方法を詳述します。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API {#static-ips-api}

静的IPのリストを取得する必要がある場合は、次のClickHouse Cloud APIエンドポイントを使用できます: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。このAPIは、地域やクラウドごとに、ingress/egress IPやS3エンドポイントなど、ClickHouse Cloudサービス用のエンドポイントを提供します。

MySQLやPostgreSQLエンジンのような統合を使用している場合は、ClickHouse Cloudがインスタンスにアクセスできるように認証が必要な場合があります。このAPIを使用して、パブリックIPを取得し、GCPの`firewalls`や`Authorized networks`、Azure、AWSの`Security Groups`、または使用している他のインフラストラクチャのエグレス管理システムに構成できます。

例えば、`ap-south-1`地域にホストされたClickHouse Cloudサービスからのアクセスを許可するには、その地域の`egress_ips`アドレスを追加できます：

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

例えば、`us-east-2`で実行されているAWS RDSインスタンスがClickHouse Cloudサービスに接続する必要がある場合、次のInboudセキュリティグループルールを持っている必要があります：

<Image img={aws_rds_mysql} size="lg" alt="AWS Security group rules" border />

同じClickHouse Cloudサービスが`us-east-2`で実行されているが、今度はGCPのMySQLに接続されている場合、`Authorized networks`は次のようになります：

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
