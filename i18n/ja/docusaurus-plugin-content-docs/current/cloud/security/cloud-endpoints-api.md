---
slug: /manage/security/cloud-endpoints-api
sidebar_label: クラウド IP アドレス
title: クラウド IP アドレス
---


## 静的 IP API {#static-ips-api}

静的 IP の一覧を取得する必要がある場合、次の ClickHouse Cloud API エンドポイントを使用できます: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json)。この API は、地域やクラウドごとのインバウンド/アウトバウンド IP と S3 エンドポイントなど、ClickHouse Cloud サービスのエンドポイントを提供します。

MySQL や PostgreSQL エンジンのような統合を使用している場合、ClickHouse Cloud にインスタンスへのアクセスを許可する必要があるかもしれません。この API を使用して、パブリック IP を取得し、それを GCP の `firewalls` や `Authorized networks`、Azure、AWS の `Security Groups`、または使用している他のインフラストラクチャのアウトバウンド管理システムに設定できます。

たとえば、`ap-south-1` の地域で AWS にホストされている ClickHouse Cloud サービスへのアクセスを許可するには、その地域の `egress_ips` アドレスを追加できます:

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

たとえば、`us-east-2` で実行されている AWS RDS インスタンスが ClickHouse Cloud サービスに接続する必要がある場合、次のようなインバウンドセキュリティグループルールを設定する必要があります:

![AWS セキュリティグループのルール](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/aws-rds-mysql.png)

`us-east-2` で実行されている同じ ClickHouse Cloud サービスが、今度は GCP 内の MySQL に接続している場合、`Authorized networks` は次のようになります:

![GCP 認可ネットワーク](@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/images/gcp-authorized-network.png)
