---
title: 'Supported Cloud Regions'
sidebar_label: 'Supported Cloud Regions'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'Supported regions for ClickHouse Cloud'
slug: /cloud/reference/supported-regions
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# Supported Cloud Regions

## AWS Regions {#aws-regions}

- ap-northeast-1 (Tokyo)
- ap-south-1 (Mumbai)
- ap-southeast-1 (Singapore)
- ap-southeast-2 (Sydney)
- eu-central-1 (Frankfurt)
- eu-west-1 (Ireland)
- eu-west-2 (London)
- me-central-1 (UAE)
- us-east-1 (N. Virginia)
- us-east-2 (Ohio)
- us-west-2 (Oregon)

**Under Consideration:**
- ca-central-1 (Canada)
- af-south-1 (South Africa)
- eu-north-1 (Stockholm)
- sa-east-1 (South America)
- ap-northeast-2 (South Korea, Seoul)
 
## Google Cloud regions {#google-cloud-regions}

- asia-southeast1 (Singapore)
- europe-west4 (Netherlands)
- us-central1 (Iowa)
- us-east1 (South Carolina)

**Under Consideration:**

- us-west1 (Oregon)
- australia-southeast1(Sydney)
- asia-northeast1 (Tokyo)
- europe-west3 (Frankfurt)
- europe-west6 (Zurich)
- northamerica-northeast1 (Montréal)

## Azure regions {#azure-regions}

- West US 3 (Arizona)
- East US 2 (Virginia)
- Germany West Central (Frankfurt)

**Under Consideration:**

JapanEast
:::note 
Need to deploy to a region not currently listed? [Submit a request](https://clickhouse.com/pricing?modal=open). 
:::

## Private regions {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

We offer Private regions for our Enterprise tier services. Please [Contact us](https://clickhouse.com/company/contact) for private region requests.

Key considerations for private regions:
- Services will not auto-scale.
- Services cannot be stopped or idled.
- Manual scaling (both vertical and horizontal) can be enabled with a support ticket.
- If a service requires configuration with CMEK, the customer must provide the AWS KMS key during service launch.
- To launch services new and additional, requests will need to be made through a support ticket.
  
Additional requirements may apply for HIPAA compliance (including signing a BAA). Note that HIPAA is currently available only for Enterprise tier services

## HIPAA Compliant Regions {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

Customers must sign a Business Associate Agreement (BAA) and request onboarding through Sales or Support to set up services in HIPAA compliant regions. The following regions support HIPAA compliance:
- AWS us-east-1
- AWS us-west-2
- GCP us-central1
- GCP us-east1

## PCI Compliant Regions {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

Customers must request onboarding through Sales or Support to set up services in PCI compliant regions. The following regions support PCI compliance:
- AWS us-east-1
- AWS us-west-2
