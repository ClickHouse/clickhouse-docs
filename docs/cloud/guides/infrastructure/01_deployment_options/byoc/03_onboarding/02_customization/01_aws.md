---
title: 'AWS customized setup'
slug: /cloud/reference/byoc/onboarding/customization-aws
sidebar_label: 'AWS customized setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding', 'AWS', 'VPC']
description: 'Deploy ClickHouse BYOC into your existing AWS VPC'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png';
import byoc_aws_existing_vpc_ui from '@site/static/images/cloud/reference/byoc-aws-existing-vpc-ui.png';

## Customer-managed VPC (BYO-VPC) for AWS {#customer-managed-vpc-aws}

If you prefer to use an existing VPC to deploy ClickHouse BYOC instead of having ClickHouse Cloud provision a new VPC, follow the steps below. This approach provides greater control over your network configuration and allows you to integrate ClickHouse BYOC into your existing network infrastructure.

<VerticalStepper headerLevel="h3">

### Configure your existing VPC {#configure-existing-vpc}

1. Tag the VPC with `clickhouse-byoc="true"`.
2. Allocate at least 3 private subnets across 3 different availability zones for ClickHouse Cloud to use.
3. Ensure each subnet has a minimum CIDR range of `/23` (e.g., 10.0.0.0/23) to provide sufficient IP addresses for the ClickHouse deployment.
4. Add the tag `kubernetes.io/role/internal-elb=1` and `clickhouse-byoc="true"` to each subnet to enable proper load balancer configuration.

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC Subnet" />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC Subnet Tags" />

### Configure S3 Gateway Endpoint {#configure-s3-endpoint}

If your VPC doesn't already have an S3 Gateway Endpoint configured, you'll need to create one to enable secure, private communication between your VPC and Amazon S3. This endpoint allows your ClickHouse services to access S3 without going through the public internet. Please refer to the screenshot below for an example configuration.

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" />

### Ensure network connectivity {#ensure-network-connectivity}

**Outbound Internet Access**
Your VPC must permit at least outbound internet access so that ClickHouse BYOC components can communicate with the Tailscale control plane. Tailscale is used to provide secure, zero-trust networking for private management operations. Initial registration and setup with Tailscale require public internet connectivity, which can be achieved either directly or via a NAT gateway. This connectivity is required to maintain both the privacy and security of your BYOC deployment.

**DNS Resolution**
Ensure your VPC has working DNS resolution and doesn't block, interfere with, or overwrite standard DNS names. ClickHouse BYOC relies on DNS to resolve Tailscale control servers and ClickHouse service endpoints. If DNS is unavailable or misconfigured, BYOC services may fail to connect or operate properly.

### Configure your AWS account {#configure-aws-account}

The initial BYOC setup creates a privileged IAM role (`ClickHouseManagementRole`) that enables BYOC controllers from ClickHouse Cloud to manage your infrastructure. This can be performed using either a [CloudFormation template](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc_v2.yaml) or a Terraform module (see below).

:::warning The IAM role name is a hard requirement
The role must be named exactly `ClickHouseManagementRole` — no prefixes, suffixes, or renaming to satisfy an organizational naming convention. The name is hard-coded in ClickHouse's automation and identical for every customer, so a renamed role applies successfully but provisioning then fails because ClickHouse cannot assume the expected role. More generally, do not change anything in the provided template or module without ClickHouse's explicit approval; supported customizations are exposed as parameters.
:::

When deploying for a `BYO-VPC` setup, set the `IncludeVPCWritePermissions` parameter to `false` to ensure ClickHouse Cloud doesn't receive permissions to modify your customer-managed VPC.

:::note
Storage buckets, Kubernetes cluster, and compute resources required for running ClickHouse aren't included in this initial setup. They will be provisioned in a later step. While you control your VPC, ClickHouse Cloud still requires IAM permissions to create and manage the Kubernetes cluster, IAM roles for service accounts, S3 buckets, and other essential resources in your AWS account.
:::

#### Terraform module {#terraform-module-aws}

If you prefer to use Terraform instead of CloudFormation, use the [terraform-byoc-onboarding](https://github.com/ClickHouse/terraform-byoc-onboarding) module:

```hcl
module "clickhouse_onboarding" {
  source                        = "github.com/ClickHouse/terraform-byoc-onboarding.git//modules/aws?ref=<version>"
  external_id                   = "<external-id-provided-by-clickhouse>"
  include_vpc_write_permissions = false
}
```

Replace `<version>` with the latest tag from the module's [releases page](https://github.com/ClickHouse/terraform-byoc-onboarding/releases) — always use the latest release.

:::note
The module was previously distributed as a tarball at `https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz`. That URL remains available but is deprecated — use the GitHub module above.
:::

### Set up BYOC infrastructure {#set-up-byoc-infrastructure}

In the ClickHouse Cloud console, configure the following when setting up new infrastructure:

1. Under **VPC configuration**, select **Use existing VPC**.
2. Enter your **VPC ID** (e.g., `vpc-0bb751a5b888ad123`).
3. Enter the **Private subnet IDs** for the 3 subnets you configured earlier.
4. Optionally, enter **Public subnet IDs** if your setup requires public-facing load balancers.
5. Click **Set up Infrastructure** to begin provisioning.

<Image img={byoc_aws_existing_vpc_ui} size="lg" alt="ClickHouse Cloud BYOC setup UI with Use existing VPC selected" />

:::note
New region setup can take up to 40 minutes.
:::

</VerticalStepper>

## Customer-managed IAM roles {#customer-managed-iam-roles}

For organizations with advanced security requirements or strict compliance policies, you can provide your own IAM roles instead of having ClickHouse Cloud create them. This approach gives you complete control over IAM permissions and allows you to enforce your organization's security policies.

:::info
Customer-managed IAM roles are in private preview. Contact ClickHouse Support to enable this capability for your organization before following the steps below.
:::

With customer-managed IAM roles, you:

- Pre-create the per-infrastructure IAM roles that ClickHouse Cloud would otherwise create
- Remove IAM write permissions from the `ClickHouseManagementRole` used for cross-account access
- Maintain full control over role permissions and trust relationships

<VerticalStepper headerLevel="h3">

### Configure the management role without IAM write permissions {#byo-iam-management-role}

When performing the [initial BYOC setup](/cloud/reference/byoc/onboarding/standard), disable IAM write permissions on the management role. With the CloudFormation template, set the `IncludeIAMWritePermissions` parameter to `false`. With the Terraform module:

```hcl
module "clickhouse_onboarding" {
  source                        = "github.com/ClickHouse/terraform-byoc-onboarding.git//modules/aws?ref=<version>"
  external_id                   = "<external-id-provided-by-clickhouse>"
  include_iam_write_permissions = false
}
```

Replace `<version>` with the latest tag from the module's [releases page](https://github.com/ClickHouse/terraform-byoc-onboarding/releases) — always use the latest release.

### Create the per-infrastructure IAM roles {#byo-iam-per-infra-roles}

Before each BYOC infrastructure is provisioned, create its required IAM roles (EKS pod identity roles, the ClickHouse S3 access role, and the data-plane management role) with the [terraform-byoc-onboarding](https://github.com/ClickHouse/terraform-byoc-onboarding) per-infra module:

```hcl
module "clickhouse_per_infra_iam" {
  source = "github.com/ClickHouse/terraform-byoc-onboarding.git//modules/aws-per-infra-iam?ref=<version>"

  spoken_name = "<spoken-name-provided-by-clickhouse>"
  region      = "<aws-region-of-the-infrastructure>"
  external_id = "<external-id-provided-by-clickhouse>"
}
```

Replace `<version>` with the latest tag from the module's [releases page](https://github.com/ClickHouse/terraform-byoc-onboarding/releases) — always use the latest release.

### Keep the per-infrastructure roles up to date {#byo-iam-keep-up-to-date}

:::important
ClickHouse periodically adds roles and permissions required by new platform capabilities. When ClickHouse notifies you of an update, re-apply the per-infra module at the latest release — running an outdated version can cause provisioning and upgrades of your BYOC infrastructure to fail.
:::

</VerticalStepper>

For information about the IAM roles that ClickHouse Cloud creates by default, see the [BYOC Privilege Reference](/cloud/reference/byoc/reference/privilege).
