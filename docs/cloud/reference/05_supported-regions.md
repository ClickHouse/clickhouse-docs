---
title: 'Supported cloud regions'
sidebar_label: 'Supported Cloud regions'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'Supported regions for ClickHouse Cloud'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'

# Supported cloud regions

## AWS regions {#aws-regions}

- ap-northeast-1 (Tokyo)
- ap-northeast-2 (South Korea, Seoul)
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
- il-central-1 (Israel, Tel Aviv)

**Private Region:**
- ca-central-1 (Canada)
- af-south-1 (South Africa)
- eu-north-1 (Stockholm)
- sa-east-1 (South America)
 
## Google cloud regions {#google-cloud-regions}

- asia-southeast1 (Singapore)
- asia-northeast1 (Tokyo)
- europe-west4 (Netherlands)
- us-central1 (Iowa)
- us-east1 (South Carolina)

**Private Region:**

- us-west1 (Oregon)
- australia-southeast1(Sydney)
- europe-west3 (Frankfurt)
- europe-west6 (Zurich)
- northamerica-northeast1 (Montréal)

## Azure regions {#azure-regions}

- West US 3 (Arizona)
- East US 2 (Virginia)
- Germany West Central (Frankfurt)

**Private Region:**

- Japan East (Tokyo, Saitama)
- UAE North (Dubai)

:::note 
Need to deploy to a region not currently listed? [Submit a request](https://clickhouse.com/pricing?modal=open). 
:::

## Private regions {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

We offer Private regions for our Enterprise tier services. Please [Contact us](https://clickhouse.com/company/contact) for private region requests.

Key considerations for private regions:
- Services will not auto-scale; however, manual vertical and horizontal scaling is supported.
- Services cannot be idled.
- Status page is not available for private regions.
  
Additional requirements may apply for HIPAA compliance (including signing a BAA). Note that HIPAA is currently available only for Enterprise tier services

## HIPAA compliant regions {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

Customers must sign a Business Associate Agreement (BAA) and request onboarding through Sales or Support to set up services in HIPAA compliant regions. The following regions support HIPAA compliance:
- AWS af-south-1 (South Africa) **Private Region**
- AWS ca-central-1 (Canada) **Private Region**
- AWS eu-central-1 (Frankfurt)
- AWS eu-north-1 (Stockholm) **Private Region**
- AWS eu-west-1 (Ireland)
- AWS eu-west-2 (London)
- AWS sa-east-1 (South America) **Private Region**
- AWS us-east-1 (N. Virginia)
- AWS us-east-2 (Ohio)
- AWS us-west-2 (Oregon)
- GCP europe-west4 (Netherlands)
- GCP us-central1 (Iowa)
- GCP us-east1 (South Carolina)

## PCI compliant regions {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

Customers must request onboarding through Sales or Support to set up services in PCI compliant regions. The following regions support PCI compliance:
- AWS af-south-1 (South Africa) **Private Region**
- AWS ca-central-1 (Canada) **Private Region**
- AWS eu-central-1 (Frankfurt)
- AWS eu-north-1 (Stockholm) **Private Region**
- AWS eu-west-1 (Ireland)
- AWS eu-west-2 (London)
- AWS sa-east-1 (South America) **Private Region**
- AWS us-east-1 (N. Virginia)
- AWS us-east-2 (Ohio)
- AWS us-west-2 (Oregon)
