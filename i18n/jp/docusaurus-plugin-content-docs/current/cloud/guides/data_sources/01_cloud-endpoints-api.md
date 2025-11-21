---
slug: /manage/data-sources/cloud-endpoints-api
sidebar_label: 'Cloud の IP アドレス'
title: 'Cloud の IP アドレス'
description: 'このページでは、ClickHouse における Cloud Endpoints API のセキュリティ機能について説明します。認証および認可メカニズムによるアクセス管理を通じて、ClickHouse のデプロイメントをどのように保護するかを詳しく解説します。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '静的 IP アドレス', 'cloud endpoints', 'API', 'セキュリティ', '送信 (egress) IP アドレス', '受信 (ingress) IP アドレス', 'ファイアウォール']
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';


## 静的IP API {#static-ips-api}

静的IPのリストを取得する必要がある場合は、次のClickHouse Cloud APIエンドポイントを使用できます:[`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。このAPIは、リージョンおよびクラウドごとのイングレス/エグレスIPやS3エンドポイントなど、ClickHouse Cloudサービスのエンドポイント情報を提供します。

MySQLやPostgreSQLエンジンなどの統合機能を使用している場合、ClickHouse Cloudがお使いのインスタンスにアクセスできるよう認可する必要がある場合があります。このAPIを使用してパブリックIPを取得し、GCPの`firewalls`や`Authorized networks`、Azure、AWSの`Security Groups`、またはその他のインフラストラクチャエグレス管理システムで設定できます。

例えば、リージョン`ap-south-1`のAWS上でホストされているClickHouse Cloudサービスからのアクセスを許可するには、そのリージョンの`egress_ips`アドレスを追加します:

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

例えば、`us-east-2`で実行されているAWS RDSインスタンスがClickHouse Cloudサービスに接続する必要がある場合、次のインバウンドセキュリティグループルールを設定します:

<Image img={aws_rds_mysql} size='lg' alt='AWSセキュリティグループルール' border />

同じClickHouse Cloudサービスが`us-east-2`で実行されており、今回はGCPのMySQLに接続する場合、`Authorized networks`は次のようになります:

<Image
  img={gcp_authorized_network}
  size='md'
  alt='GCP認可ネットワーク'
  border
/>
