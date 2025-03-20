---
slug: /manage/security/cloud-endpoints-api
sidebar_label: 'Cloud IP Addresses'
title: 'Cloud IP Addresses'
description: 'This page documents the Cloud Endpoints API security features within ClickHouse. It details how to secure your ClickHouse deployments by managing access through authentication and authorization mechanisms.'
---

import Image from '@theme/IdealImage';
import aws_rds_mysql from '@site/static/images/_snippets/aws-rds-mysql.png';
import gcp_authorized_network from '@site/static/images/_snippets/gcp-authorized-network.png';

## Static IPs API {#static-ips-api}

If you need to fetch the list of static IPs, you can use the following ClickHouse Cloud API endpoint: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). This API provides the endpoints for ClickHouse Cloud services, such as ingress/egress IPs and S3 endpoints per region and cloud.

If you are using an integration like the MySQL or PostgreSQL Engine, it is possible that you need to authorize ClickHouse Cloud to access your instances. You can use this API to retrieve the public IPs and configure them in `firewalls` or `Authorized networks` in GCP or in `Security Groups` for Azure, AWS, or in any other infrastructure egress management system you are using.

For example, to allow access from a ClickHouse Cloud service hosted on AWS in the region `ap-south-1`, you can add the `egress_ips` addresses for that region:

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

For example, an AWS RDS instance running in `us-east-2` that needs to connect to a ClickHouse cloud service should have the following Inbound security group rules:

<Image img={aws_rds_mysql} size="lg" alt="AWS Security group rules" border />

For the same ClickHouse Cloud service running in `us-east-2`, but this time connected to an MySQL in GCP, the `Authorized networks` should look like this:

<Image img={gcp_authorized_network} size="md" alt="GCP Authorized networks" border />
