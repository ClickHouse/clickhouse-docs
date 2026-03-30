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

## Customer-managed VPC (BYO-VPC) for GCP {#customer-managed-vpc-gcp}

If you prefer to use an existing VPC to deploy ClickHouse BYOC instead of having ClickHouse Cloud provision a new VPC, follow the steps below. This approach provides greater control over your network configuration and allows you to integrate ClickHouse BYOC into your existing network infrastructure.

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

### Contact ClickHouse support {#contact-clickhouse-support}

After completing the above configuration steps, create a support ticket with the following information:

* Your GCP project ID
* The GCP region where you want to deploy the service
* Your VPC network name
* The subnet name you've allocated for ClickHouse
* (Optional) The secondary IPv4 range names dedicated for ClickHouse. This is only required if the private subnet has multiple secondary IPv4 ranges and not all of them are intended for ClickHouse use

Our team will review your configuration and complete the provisioning from our side.
