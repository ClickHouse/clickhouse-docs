---
slug: /en/manage/security/cloud-endpoints-api
sidebar_label: Static IPs
title: Static IPs
---

## List of Static IPs

The tables below list the static IPs and S3 endpoints for each supported cloud and region in ClickHouse Cloud.

### AWS

#### Egress IPs

| Region | IPs |
|--------|------|
| ap-south-1 | `15.206.7.77` `3.110.39.68` `3.6.83.17` |
| ap-southeast-1 | `46.137.240.41` `52.74.24.166` `54.254.37.170` |
| ap-southeast-2 | `13.210.79.90` `13.236.190.252` `13.54.63.56` |
| eu-central-1 | `18.197.49.136` `3.64.109.93` `3.74.177.59` |
| eu-west-1 | `108.128.86.193` `34.240.176.195` `54.73.98.215` |
| us-east-1 | `18.211.40.49` `35.175.32.241` `44.197.47.227` `44.208.152.165` `52.205.46.187` `52.22.199.32` |
| us-east-2 | `18.117.209.120` `3.135.147.1` `3.21.42.89` |
| us-west-2 | `35.165.97.55` `44.236.63.111` `54.244.160.153` |

#### Ingress IPs

| Region | IPs |
|--------|------|
| ap-south-1 | `15.206.78.111` `3.6.185.108` `43.204.6.248` |
| ap-southeast-1 | `18.138.54.172` `18.143.38.5` `18.143.51.125` |
| ap-southeast-2 | `3.105.241.252` `3.24.14.253` `3.25.31.112` |
| eu-central-1 | `3.125.141.249` `3.75.55.98` `52.58.240.109` |
| eu-west-1 | `79.125.122.80` `99.80.3.151` `99.81.5.155` |
| us-east-1 | `3.224.78.251` `34.231.116.224` `35.175.44.203` `44.206.134.58` `44.210.169.212` `52.206.111.15` |
| us-east-2 | `18.216.18.121` `18.218.245.169` `18.225.29.123` |
| us-west-2 | `35.82.252.60` `35.85.205.122` `44.226.232.172` |

#### S3 Endpoints

| Region | IPs |
|--------|------|
| ap-south-1 | `vpce-0a975c9130d07276d` |
| ap-southeast-1 | `vpce-04c0b7c7066498854` |
| ap-southeast-2 | `vpce-0b45293a83527b13c` |
| eu-central-1 | `vpce-0c58e8f7ed0f63623` |
| eu-west-1 | `vpce-0c85c2795779d8fb2` |
| us-east-1 | `vpce-05f1eeb392b983932` `vpce-0b8b558ea42181cf6` |
| us-east-2 | `vpce-09ff616fa76e09734` |
| us-west-2 | `vpce-0bc78cc5e63dfb27c` |

### GCP

#### Egress IPs

| Region | IPs |
|--------|------|
| europe-west4 | `34.147.18.130` `34.90.110.137` `34.90.16.52` `34.91.142.156` `35.234.163.128` |
| asia-southeast1 | `34.124.237.2` `34.142.232.74` `34.143.238.252` `35.240.251.145` `35.247.141.182` |
| us-central1 | `34.136.25.254` `34.170.139.51` `34.172.174.233` `34.173.64.62` `34.66.234.85` |

#### Ingress IPs

| Region | IPs |
|--------|------|
| europe-west4 | `35.201.102.65` |
| asia-southeast1 | `34.160.80.214` |
| us-central1 | `35.186.193.237` |

## Static IPs API

If you need to fetch the list of static IPs programatically, you can use the following ClickHouse Cloud API endpoint: [`https://api.clickhouse.cloud/static-ips.json`](https://api.clickhouse.cloud/static-ips.json). This API provides the endpoints for ClickHouse Cloud services, such as ingress/egress IPs and S3 endpoints per region and cloud.

If you are using an integration like the MySQL or PostgreSQL Engine, it is possible that you need to authorize ClickHouse Cloud to access your instances. You can use this API to retrieve the public IPs and configure them in `firewalls` or `Authorized networks` in GCP or in `Security Groups` for Azure, AWS, or in any other infrastructure egress management system you are using.

For example, to allow access from a ClickHouse Cloud service hosted on AWS in the region `ap-south-1`, you can add the `egress_ips` addresses for that region:

```
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

![AWS Security group rules](@site/docs/en/_snippets/images/aws-rds-mysql.png)

For the same ClickHouse Cloud service running in `us-east-2`, but this time connected to an MySQL in GCP, the `Authorized networks` should look like this:

![GCP Authorized networks](@site/docs/en/_snippets/images/gcp-authorized-network.png)
