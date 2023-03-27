---
slug: /en/manage/security/ip-egress-traffic-list
sidebar_label: IP Egress Traffic List
title: IP Egress Traffic List
---

## Integrations could require egress access

If you are using integration like the MySQL or PostgreSQL Engine, it is possible that you need to authorize ClickHouse Cloud to access to your instances.

You could use this list of public IPs in `firewalls` or `Authorized networks` in GCP or in `Security Groups` for Azure, AWS or in any other infrastrucutre egrees management system you are using.

According to the region your ClickHouse Service is using, add the three IP address that match with this public API https://api.clickhouse.cloud/static-ips.json

```
❯ curl -s https://api.clickhouse.cloud/static-ips.json | jq '.'
{
  "aws": [
    {
      "cell": "cell0",
      "public_ips": {
        "public-a": "3.110.39.68",
        "public-b": "15.206.7.77",
        "public-c": "3.6.83.17"
      },
      "region": "ap-south-1",
      "s3_endpoint": "vpce-0a975c9130d07276d"
    },
...
```

For example a ClickHouse cloud service running in `us-east-2` using the integration to connect to an RDS in AWS, should have the following Inbound security group rules:

![Security group rules](@site/docs/en/_snippets/images/aws-rds-mysql.png)

For the same ClickHouse cloud service running in `us-east-2`, but this time connected to an MySQL in GCP, the `Authorized networks` should look like this:

![Authorized networks](@site/docs/en/_snippets/images/gcp-authorized-network.png)
