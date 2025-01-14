---
title: Supported Cloud Regions
sidebar_label: Supported Cloud Regions
keywords: [aws, gcp, google cloud, azure, cloud, regions]
description: Supported regions for ClickHouse Cloud
---
# Supported Cloud Regions
## AWS Regions

- ap-northeast-1 (Tokyo)
- ap-south-1 (Mumbai)
- ap-southeast-1 (Singapore)
- ap-southeast-2 (Sydney)
- eu-central-1 (Frankfurt)
- eu-west-1 (Ireland)
- eu-west-2 (London)
- us-east-1 (N. Virginia)
- us-east-2 (Ohio)
- us-west-2 (Oregon)

**Under Consideration:**
- ca-central-1 (Canada)
- me-central-1 (Middle East)
- af-south-1 (South Africa)
- eu-north-1 (Stockholm)
- sa-east-1 (South America)
 

## Google Cloud regions

- asia-southeast1 (Singapore)
- europe-west4 (Netherlands)
- us-central1 (Iowa)
- us-east1 (South Carolina)

**Under Consideration:**
- australia-southeast1 (Sydney)
- us-west-1 (Oregon)
- eu-west-1 (Belgium)

## Azure regions

- West US 3 (Arizona)
- East US 2 (Virginia)
- Germany West Central (Frankfurt)

:::note 
Need to deploy to a region not currently listed? [Submit a request](https://clickhouse.com/pricing?modal=open). 
:::

## Private regions
We offer Private regions in select cases for large-scale deployments. Please [Contact us](https://clickhouse.com/company/contact) for private region requests.

Key considerations for private regions:
- Services will not auto-scale.
- Services cannot be stopped or idled.
- Development services (2 replicas) are not supported.
- Manual scaling (both vertical and horizontal) can be enabled with a support ticket.
- If a service requires configuration with CMEK, the customer must provide the AWS KMS key during service launch.
- To launch services new and additional, requests will need to be made through a support ticket.
  
Additional requirements may apply for HIPAA compliance (including signing a BAA). Note that HIPAA is currently available only for Dedicated services
