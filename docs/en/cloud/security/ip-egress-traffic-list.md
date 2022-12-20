---
slug: /en/manage/security/ip-egress-traffic-list
sidebar_label: IP Egress Traffic List
title: IP Egress Traffic List
---

## Integrations could require egress access

If you are using integration like the MySQL or PostgreSQL Engine, It's possible that you need to authorize ClickHouse Cloud to access to your instances.

You could use this list of public IPs in `firewalls` or `Authorized networks` in GCP or in `Security Groups` in AWS or in any other infrastrucutre egrees management system you are using.

According to the region your ClickHouse Service is using, add the three IP address that match with this list:

```
us-east-1
  "public-a" = "52.205.46.187"
  "public-b" = "44.208.152.165"
  "public-c" = "52.22.199.32"

us-east-2
  "public-a" = "18.117.209.120"
  "public-b" = "3.21.42.89"
  "public-c" = "3.135.147.1"

us-west-2
  "public-a" = "54.244.160.153"
  "public-b" = "35.165.97.55"
  "public-c" = "44.236.63.111"

ap-south-1
  "public-a" = "3.110.39.68"
  "public-b" = "15.206.7.77"
  "public-c" = "3.6.83.17"

ap-southeast-1
  "public-a" = "54.254.37.170"
  "public-b" = "46.137.240.41"
  "public-c" = "52.74.24.166"

eu-central-1
  "public-a" = "18.197.49.136"
  "public-b" = "3.74.177.59"
  "public-c" = "3.64.109.93"

eu-west-1
  "public-a" = "54.73.98.215"
  "public-b" = "108.128.86.193"
  "public-c" = "34.240.176.195"
```
