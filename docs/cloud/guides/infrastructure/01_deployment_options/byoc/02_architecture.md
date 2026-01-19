---
title: 'Architecture'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'Architecture'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';

## Glossary {#glossary}

- **ClickHouse VPC:**  The VPC owned by ClickHouse Cloud.
- **Customer BYOC VPC:** The VPC, owned by the customer's cloud account, is provisioned and managed by ClickHouse Cloud and dedicated to a ClickHouse Cloud BYOC deployment.
- **Customer VPC** Other VPCs owned by the customer cloud account used for applications that need to connect to the Customer BYOC VPC.

## Architecture {#architecture}

BYOC separates the **ClickHouse control plane**, which runs in the ClickHouse VPC, from the **data plane**, which runs entirely in your cloud account. The ClickHouse VPC hosts the ClickHouse Cloud Console, authentication and user management, APIs, billing, and infrastructure management components such as the BYOC controller and alerting/incident tooling. These services orchestrate and monitor your deployment, but they do not store your data.

In your **Customer BYOC VPC**, ClickHouse provisions a Kubernetes cluster (for example, Amazon EKS) that runs the ClickHouse data plane. As shown in the diagram, this includes the ClickHouse cluster itself, the ClickHouse operator, and supporting services such as ingress, DNS, certificate management, and state exporters and scrapers. A dedicated monitoring stack (Prometheus, Grafana, Alertmanager, and optionally Thanos for long-term storage) also runs within your VPC, ensuring that metrics and alerts originate from and remain in your environment.

All ClickHouse data, backups, and observability data stay in your cloud account. Data parts and backups are stored in your object storage (for example, Amazon S3), while logs are stored on the storage volumes attached to your ClickHouse nodes. In a future update, logs will be written to LogHouse, a ClickHouse-based logging service that also runs inside your BYOC VPC. Metrics can be stored locally or in an independent bucket in your BYOC VPC for long-term retention. Control-plane connectivity between the ClickHouse VPC and your BYOC VPC is provided over a secure, tightly scoped channel (for example, via Tailscale as shown in the diagram); this is used only for management operations, not for query traffic.

Applications and users connect to ClickHouse through either a public or private endpoint exposed from your BYOC VPC. Your application VPCs can reach these endpoints over VPC peering or other private connectivity options, so query traffic flows directly between your workloads and the ClickHouse cluster within your environment.

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />

Based on the architecture described above, you will need to provide a cloud account and grant ClickHouse Cloud the minimum required permissions to access it. The main cloud resources ClickHouse Cloud will deploy in your account are:

* **VPC:** A Virtual Private Cloud dedicated to your ClickHouse deployment. This can be managed either by ClickHouse or by you, the customer, and is typically peered with your application VPCs.
* **IAM roles and policies:** Roles and permissions necessary for Kubernetes, ClickHouse services, and the monitoring stack. These can be provisioned by ClickHouse or supplied by the customer.
* **Storage buckets:** Used for storing data parts, backups, and (optionally) long-term metrics and log archives.
* **Kubernetes cluster:** This can be Amazon EKS, Google GKE, or Azure AKS, depending on your cloud provider, and hosts the ClickHouse servers and supporting services shown in the architecture diagram.

By default, ClickHouse Cloud provisions a new, dedicated VPC and sets up the necessary IAM roles to ensure secure operation of Kubernetes services. For organizations with advanced networking or security needs, there is also the option to manage the VPC and IAM roles independently. This approach allows for greater customization of network configurations and more precise control over permissions. However, choosing to self-manage these resources will increase your operational responsibilities.

**Additional recommendations and considerations:**
- Ensure that network CIDR ranges for your BYOC VPC do not overlap with any existing VPCs you plan to peer with.
- Tag your resources clearly to simplify management and support.
- Plan for adequate subnet sizing and distribution across availability zones for high availability.
- Consult the [security playbook](/cloud/security/audit-logging/byoc-security-playbook) to understand shared responsibility and best practices when ClickHouse Cloud operates within your environment.
- Review the full onboarding guide for step-by-step instructions on initial account setup, VPC configuration, network connectivity (for example, VPC peering), and IAM role delegation.

If you have unique requirements or constraints, contact ClickHouse Support for guidance on advanced network configurations or custom IAM policies.