---
slug: /en/manage/security/ip-egress-traffic-list
sidebar_label: IP Egress Traffic List
title: IP Egress Traffic List
---

## Integrations could require egress access

If you are using integration like the MySQL or PostgreSQL Engine, it is possible that you need to authorize ClickHouse Cloud to access to your instances.

You could use this list of public IPs in `firewalls` or `Authorized networks` in GCP or in `Security Groups` for Azure, AWS or in any other infrastrucutre egrees management system you are using.

According to the region your ClickHouse Service is using, add the three IP address that match with this public API https://api.clickhouse.cloud/static-ips.json

For example a ClickHouse cloud service running in `us-east-2` using the integration to connect to an RDS in AWS, should have the following Inbound security group rules:

![Security group rules](@site/docs/en/_snippets/images/aws-rds-mysql.png)

For the same ClickHouse cloud service running in `us-east-2`, but this time connected to an MySQL in GCP, the `Authorized networks` should look like this:

![Authorized networks](@site/docs/en/_snippets/images/gcp-authorized-network.png)
