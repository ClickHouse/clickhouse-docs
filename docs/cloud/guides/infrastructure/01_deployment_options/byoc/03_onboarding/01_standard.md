---
title: 'Standard Onboarding'
slug: /cloud/reference/byoc/onboarding/standard
sidebar_label: 'Standard Process'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_onboarding_1 from '@site/static/images/cloud/reference/byoc-onboarding-1.png'
import byoc_onboarding_2 from '@site/static/images/cloud/reference/byoc-onboarding-2.png'
import byoc_onboarding_3 from '@site/static/images/cloud/reference/byoc-onboarding-3.png'

## What is Standard Onboarding? {#what-is-standard-onboarding}

**Standard onboarding** is the default, guided workflow for deploying ClickHouse in your own cloud account using BYOC. In this approach, ClickHouse Cloud provisions all of the core cloud resources required for your deployment—such as the VPC, subnets, security groups, Kubernetes (EKS/GKE) cluster, and supporting IAM roles/service accounts—within your AWS account/GCP project. This ensures consistent, secure configuration, and minimizes the manual steps required from your team.

With standard onboarding, you simply provide a dedicated AWS account/GCP project, and run an initial stack (via CloudFormation or Terraform) to create the minimum IAM permissions and trust required for ClickHouse Cloud to orchestrate further setup. All subsequent steps—including infrastructure provisioning and service launch—are managed through the ClickHouse Cloud web console.

Customers are strongly recommended to prepare a **dedicated** AWS account or GCP project for hosting the ClickHouse BYOC deployment to ensure better isolation in terms of permissions and resources. ClickHouse will deploy a dedicated set of cloud resources (VPC, Kubernetes cluster, IAM roles, S3 buckets, etc.) in your account.

If you need a more customized setup (for example, deploying into an existing VPC), refer to the [Customized Onboarding](/cloud/reference/byoc/onboarding/customization) documentation.

## Request access {#request-access}

To start the onboarding process, please [contact us](https://clickhouse.com/cloud/bring-your-own-cloud). Our team will guide you through the BYOC requirements, help you select the most suitable deployment options, and add your account to the allowlist.

## Onboarding {#onboarding-process} 

### Prepare an AWS account/GCP project {#prepare-an-aws-account}

Prepare a fresh AWS account or GCP project under your organization. Visit our web console: https://console.clickhouse.cloud/byocOnboarding to continue the setup. 

### Choose a Cloud Provider - Step 1 {#choose-cloud-provider}

<Image img={byoc_onboarding_1} size="lg" alt="BYOC choose CSP" background='black'/>

### Account/Project setup - Step 2 & 3 {#account-setup}

The initial BYOC setup can be performed using either a [CloudFormation template(AWS)](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) or a [Terraform module(GCP)](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/gcp). It creates a high priviledged IAM role, enabling BYOC controllers from ClickHouse Cloud to manage your infrastructure. 

<Image img={byoc_onboarding_2} size="lg" alt="BYOC initialize account" background='black'/>

:::note
Storage buckets, VPC, Kubernetes cluster, and compute resources required for running ClickHouse are not included in this initial setup. They will be provisioned in the next step.
:::
#### Alternative Terraform Module for AWS {#terraform-module-aws}

If you prefer to use Terraform instead of CloudFormation for AWS deployments, we also provide a [Terraform module for AWS](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz).

Usage:
```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

### Set up BYOC infrastructure - Step 4 {#setup-byoc-infrastructure}

You will be prompted to set up the infrastructure, including S3 buckets, VPC, and the Kubernetes cluster, from the ClickHouse Cloud console. Certain configurations must be determined at this stage, as they cannot be changed later. Specifically:

- **Region**: All **public regions** listed in our [supported regions](https://clickhouse.com/docs/cloud/reference/supported-regions) documentation are available for BYOC deployments. Private regions are not currently supported.

- **VPC CIDR range**: By default, we use `10.0.0.0/16` for the BYOC VPC CIDR range. If you plan to use VPC peering with another account, ensure the CIDR ranges do not overlap. Allocate a proper CIDR range for BYOC, with a minimum size of `/22` to accommodate necessary workloads.

- **Availability Zones**: If you plan to use VPC peering, aligning availability zones between the source and BYOC accounts can help reduce cross-AZ traffic costs. For example, in AWS, availability zone suffixes (`a`, `b`, `c`) may represent different physical zone IDs across accounts. See the [AWS guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) for details.

<Image img={byoc_onboarding_3} size="lg" alt="BYOC setup infra" background='black'/>