---
title: 'BYOC Priviledge'
slug: /cloud/reference/byoc/reference/priviledge
sidebar_label: 'Priviledge'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'priviledge']
description: 'Deploy ClickHouse on your own cloud infrastructure'
doc_type: 'reference'
---
## CloudFormation IAM roles {#cloudformation-iam-roles}

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
