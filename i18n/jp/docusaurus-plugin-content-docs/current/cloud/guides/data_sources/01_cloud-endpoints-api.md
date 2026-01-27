---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'Cloud IP アドレス'
title: 'Cloud IP アドレス'
description: 'このページでは、ClickHouse の Cloud Endpoints API が提供するセキュリティ機能について説明します。認証および認可の仕組みによるアクセス制御を通じて、ClickHouse デプロイメントをどのように保護するかを詳しく解説します。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '静的 IP アドレス', 'クラウドエンドポイント', 'API', 'セキュリティ', '送信 (egress) IP アドレス', 'イングレス (ingress) IP アドレス', 'ファイアウォール']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API \{#static-ips-api\}

静的 IP の一覧を取得する必要がある場合は、次の ClickHouse Cloud API エンドポイントを使用できます：[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。この API は、イングレス/エグレス IP や、リージョンおよびクラウドごとの S3 エンドポイントなど、ClickHouse Cloud サービスのエンドポイントを提供します。

MySQL Engine や PostgreSQL Engine などのインテグレーションを使用している場合、ClickHouse Cloud からインスタンスへのアクセスを許可する必要が生じることがあります。この API を使用してパブリック IP を取得し、GCP の `firewalls` や `Authorized networks`、Azure や AWS の `Security Groups`、あるいはその他利用しているインフラの egress 管理システムに設定できます。

たとえば、リージョン `ap-south-1` の AWS 上でホストされている ClickHouse Cloud サービスからのアクセスを許可するには、そのリージョンの `egress_ips` アドレスを追加します。

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

例えば、`us-east-2` で稼働しており、ClickHouse Cloud サービスに接続する必要がある AWS RDS インスタンスの場合、インバウンドのセキュリティグループルールは次のように設定します：

<Image img={aws_rds_mysql} size="lg" alt="AWS Security group rules" border />

同じく `us-east-2` で稼働している ClickHouse Cloud サービスに、今度は GCP 上の MySQL から接続する場合、`Authorized networks` の設定は次のようになります：

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
