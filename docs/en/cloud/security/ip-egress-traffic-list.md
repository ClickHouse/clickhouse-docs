---
slug: /en/manage/security/ip-egress-traffic-list
sidebar_label: IP Egress Traffic List
title: IP Egress Traffic List
---

## Integrations could require egress access

If you are using integration like the MySQL or PostgreSQL Engine, it is possible that you need to authorize ClickHouse Cloud to access to your instances.

The public API with the IP list is available on: <https://api.clickhouse.cloud/static-ips.json>

You could use this list of public IPs in `firewalls` or `Authorized networks` in GCP or in `Security Groups` for Azure, AWS or in any other infrastructure egress management system you are using.

For example, for a ClickHouse Service hosted on AWS in the region ap-south-1, you can add the `egress_ips` addresses for that region:

```
❯ curl -s https://api.clickhouse.cloud/static-ips.json | jq '.'
{
  "aws": [
    {
      "cell": "cell0",
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
      "s3_endpoint": "vpce-0a975c9130d07276d"
    },
...
```

For example a ClickHouse cloud service running in `us-east-2` using the integration to connect to an RDS in AWS, should have the following Inbound security group rules:

![Security group rules](@site/docs/en/_snippets/images/aws-rds-mysql.png)

For the same ClickHouse cloud service running in `us-east-2`, but this time connected to an MySQL in GCP, the `Authorized networks` should look like this:

![Authorized networks](@site/docs/en/_snippets/images/gcp-authorized-network.png)
