---
title: 'GCP customized setup'
slug: /cloud/reference/byoc/onboarding/customization-gcp
sidebar_label: 'GCP customized setup'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding', 'GCP', 'VPC']
description: 'Deploy ClickHouse BYOC into your existing GCP VPC'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_gcp_subnet from '@site/static/images/cloud/reference/byoc-gcp-subnet.png';
import byoc_gcp_existing_vpc_ui from '@site/static/images/cloud/reference/byoc-gcp-existing-vpc-ui.png';

## Customer-managed VPC (BYO-VPC) for GCP {#customer-managed-vpc-gcp}

If you prefer to use an existing VPC to deploy ClickHouse BYOC instead of having ClickHouse Cloud provision a new VPC, follow the steps below. This approach provides greater control over your network configuration and allows you to integrate ClickHouse BYOC into your existing network infrastructure.

<VerticalStepper headerLevel="h3">

### Configure your existing VPC {#configure-existing-vpc}

1. Allocate at least 1 private subnet in a [region supported by ClickHouse BYOC](/cloud/reference/supported-regions) for the ClickHouse Kubernetes (GKE) cluster. Ensure the subnet has a minimum CIDR range of `/24` (e.g., 10.0.0.0/24) to provide sufficient IP addresses for GKE cluster nodes.
2. Within the private subnet, allocate at least 1 secondary IPv4 range that will be used for GKE cluster pods. The secondary range should be at least `/23` to provide sufficient IP addresses for GKE cluster pods.
3. Enable **Private Google Access** on the subnet. This allows GKE nodes to reach Google APIs and services without requiring external IP addresses.

<Image img={byoc_gcp_subnet} size="lg" alt="BYOC GCP Subnet details showing primary and secondary IPv4 ranges with Private Google Access enabled" />

### Ensure network connectivity {#ensure-network-connectivity}

**Cloud NAT Gateway**
Ensure a [Cloud NAT gateway](https://cloud.google.com/nat/docs/overview) is deployed for the VPC. ClickHouse BYOC components require outbound internet access to communicate with the Tailscale control plane. Tailscale is used to provide secure, zero-trust networking for private management operations. The Cloud NAT gateway provides this outbound connectivity for instances without external IP addresses.

**DNS Resolution**
Ensure your VPC has working DNS resolution and doesn't block, interfere with, or overwrite standard DNS names. ClickHouse BYOC relies on DNS to resolve Tailscale control servers and ClickHouse service endpoints. If DNS is unavailable or misconfigured, BYOC services may fail to connect or operate properly.

### Set up BYOC infrastructure {#set-up-byoc-infrastructure}

In the ClickHouse Cloud console, configure the following when setting up new infrastructure:

1. Under **VPC configuration**, select **Use existing VPC**.
2. Enter your **VPC network name**.
3. Enter the **Subnet name** you allocated for ClickHouse.
4. Click **Set up Infrastructure** to begin provisioning.

<Image img={byoc_gcp_existing_vpc_ui} size="lg" alt="ClickHouse Cloud BYOC setup UI with Use existing VPC selected for GCP" />

</VerticalStepper>
