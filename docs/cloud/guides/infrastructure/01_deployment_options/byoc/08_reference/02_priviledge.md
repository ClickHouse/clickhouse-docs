---
title: 'BYOC privilege'
slug: /cloud/reference/byoc/reference/privilege
sidebar_label: 'Privilege'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'privilege']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---

## AWS IAM roles {#aws-iam-roles}

### Bootstrap IAM role {#bootstrap-iam-role}

The bootstrap IAM role has the following permissions:

- **EC2 and VPC operations**: Required for setting up VPC and EKS clusters.
- **S3 operations (e.g., `s3:CreateBucket`)**: Needed to create buckets for ClickHouse BYOC storage.
- **IAM operations (e.g., `iam:CreatePolicy`)**: Needed for controllers to create additional roles (see the next section for details).
- **EKS operations**: Limited to resources with names starting with the `clickhouse-cloud` prefix.

### Additional IAM roles created by the controller {#additional-iam-roles-created-by-the-controller}

In addition to the `ClickHouseManagementRole` created via CloudFormation, the controller will create several additional roles.

These roles are assumed by applications running within the customer's EKS cluster:

- **State Exporter Role**
  - ClickHouse component that reports service health information to ClickHouse Cloud.
  - Requires permission to write to an SQS queue owned by ClickHouse Cloud.
- **Load-Balancer Controller**
  - Standard AWS load balancer controller.
  - EBS CSI Controller to manage volumes for ClickHouse services.
- **External-DNS**
  - Propagates DNS configurations to Route 53.
- **Cert-Manager**
  - Provisions TLS certificates for BYOC service domains.
- **Cluster Autoscaler**
  - Adjusts the node group size as needed.

**K8s-control-plane** and **k8s-worker** roles are meant to be assumed by AWS EKS services.

Lastly, **`data-plane-mgmt`** allows a ClickHouse Cloud Control Plane component to reconcile necessary custom resources, such as `ClickHouseCluster` and the Istio Virtual Service/Gateway.

## GCP service accounts {#gcp-service-accounts}

### Bootstrap service account {#bootstrap-service-account}

The bootstrap service account is granted project-scoped custom roles with the following permissions:

- **Common**: Baseline read and identity permissions.
- **VPC**: Manage the VPC, subnets, routing, and Private Service Connect attachments that host your BYOC infrastructure.
- **Cluster**: Manages GKE clusters and in-cluster resources.
- **Storage**: Used to manage Cloud Storage buckets used for ClickHouse backups, shared state, and monitoring data.
- **IAM Role**: Manages service accounts and custom roles inside the project. This role does not grant the ability to create service account keys, bind organization policies, or touch any resources in other projects.

### Additional service accounts created by the controller {#additional-service-accounts-created-by-the-controller}

In addition to the `clickhouse-management` service account created via Terraform as part of onboarding. When you provision your first BYOC service, ClickHouse’s control plane (authenticating as `clickhouse-management`) creates additional service accounts in your project for specific in-cluster workloads. Each of these is created with a narrow, single-purpose permission set.

- **GKE node runtime identity**
  - Attached to every GKE node virtual machine in your BYOC cluster.
  - Used by kubelet, node-local agents, and the Cloud Operations collectors to emit logs and metrics, and by the image pulling subsystem to download container images.
- **Billing scraper identity**
  - Used by standalone scraper workload to collect billing telemetry.
- **Monitoring identity**
  - Target identity for the monitoring stack running in your cluster. Used to read/write long-term metric storage in a GCS bucket dedicated to this deployment.
- **ClickHouse runtime management identity**
  - Used by ClickHouse's runtime data-plane management controller which handles day-2 operations such as Private Service Connect endpoint management, bucket lifecycle adjustments, and service-account rotations.

## Azure service principal and managed identities {#azure-service-principal-and-managed-identities}

:::note
Azure BYOC is in Private Preview. See the [BYOC overview](/cloud/reference/byoc/overview) to join the waitlist.
:::

Azure uses a different identity model from AWS and GCP. Rather than a cross-account role, onboarding grants ClickHouse's multi-tenant application access to your subscription, and the controller uses [AKS workload identity federation](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) (OIDC) to give in-cluster workloads scoped Azure permissions without any shared secrets or storage keys.

### Bootstrap service principal {#bootstrap-service-principal}

The onboarding Terraform module registers ClickHouse's multi-tenant application as an Enterprise Application (service principal) in your Entra ID tenant and assigns it a least-privilege custom role, `ClickHouse BYOC Provisioner`, scoped to the target subscription. This is the Azure equivalent of the AWS bootstrap role and the GCP bootstrap service account.

The custom role grants only what is needed to provision and manage BYOC infrastructure in the subscription:

- **Resource provider registration**: Register the `Network`, `ContainerService`, `ManagedIdentity`, and `Storage` providers.
- **Resource groups**: Create and manage the resource groups that hold the BYOC deployment.
- **Networking**: Manage virtual networks, subnets, public IPs, NAT gateways, network security groups, and DNS zones.
- **Storage**: Manage storage accounts and blob containers used for ClickHouse data, backups, shared state, and monitoring.
- **AKS**: Manage managed clusters and node pools.
- **Managed identities**: Manage user-assigned managed identities and their federated identity credentials (for the workloads below).
- **Authorization**: Create and assign the custom role definitions used to scope the managed identities.

In addition, the service principal is granted a single Microsoft Graph application permission, `Application.ReadWrite.OwnedBy`. This lets the provisioner manage only the application objects it creates and owns; it does not grant any directory-wide or user-management permission.

### Additional managed identities created by the controller {#additional-managed-identities-created-by-the-controller}

When you provision BYOC infrastructure, ClickHouse's control plane (authenticating as the bootstrap service principal) creates several user-assigned managed identities in your subscription. Each is federated to a specific in-cluster Kubernetes service account through the AKS OIDC issuer and is granted a narrow, single-purpose set of Azure roles.

- **AKS cluster identity**
  - The AKS cluster authenticates with a dedicated service principal granted `Network Contributor` on the deployment's resource group and `AcrPull` on ClickHouse's container registry (for pulling ClickHouse images).
  - The load balancer, Azure Disk CSI driver, and cluster autoscaler are AKS-managed add-ons and run under the AKS control-plane and kubelet identities. Unlike AWS, they do not have dedicated per-workload identities.
- **Monitoring identity**
  - Used by the in-cluster monitoring stack (Prometheus and Thanos) to read and write long-term metric storage in a blob container dedicated to this deployment.
- **Shared DNS identity**
  - Granted `DNS Zone Contributor` on the deployment's DNS zones and shared, via federated credentials, by External-DNS, Cert-Manager, and the Tailscale operator.
- **ClickHouse runtime management identity** (`data-plane-mgmt`)
  - Used by ClickHouse's runtime data-plane management controller for day-2 operations. Granted `Azure Kubernetes Service Cluster Admin Role` on the cluster, storage roles on the storage resource group, `Managed Identity Contributor`, and a read-only role for Private Link Service properties.
  - This identity federates against the ClickHouse management cluster's OIDC issuer, which is how the control plane authenticates into your subscription.
- **Billing scraper identity**
  - Used by the billing scraper to write CPU and memory telemetry to a billing blob container owned by ClickHouse Cloud. An ABAC condition restricts it to this deployment's own prefix within that container.
- **State exporter identity**
  - Federated to the state exporter workload, which reports service state to an Azure Service Bus queue owned by ClickHouse Cloud.
- **ClickHouse runtime identity**
  - Used by ClickHouse server pods to read and write their data and backup blob containers via workload identity — no storage account keys are used.
