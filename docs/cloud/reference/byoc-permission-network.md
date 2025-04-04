## CloudFormation IAM Roles {#cloudformation-iam-roles}

### Bootstrap IAM role {#bootstrap-iam-role}

The bootstrap IAM role has the following permissions:

- **EC2 and VPC operations**: Required for setting up VPC and EKS clusters.
- **S3 operations (e.g., `s3:CreateBucket`)**: Needed to create buckets for ClickHouse BYOC storage.
- **`route53:*` permissions**: Required for external DNS to configure records in Route 53.
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

## Network Boundaries {#network-boundaries}

This section covers different network traffic to and from the customer BYOC VPC:

- **Inbound**: Traffic entering the customer BYOC VPC.
- **Outbound**: Traffic originating from the customer BYOC VPC and sent to an external destination.
- **Public**: A network endpoint accessible from the public internet.
- **Private**: A network endpoint accessible only through private connections, such as VPC peering, VPC Private Link, or Tailscale.

**Istio ingress is deployed behind an AWS NLB to accept ClickHouse client traffic.**

*Inbound, Public (can be Private)*

The Istio ingress gateway terminates TLS. The certificate, provisioned by CertManager with Let's Encrypt, is stored as a secret within the EKS cluster. Traffic between Istio and ClickHouse is [encrypted by AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types) since they reside in the same VPC.

By default, ingress is publicly accessible with IP allow list filtering. Customers can configure VPC peering to make it private and disable public connections. We highly recommend setting up an [IP filter](/cloud/security/setting-ip-filters) to restrict access.

### Troubleshooting access {#troubleshooting-access}

*Inbound, Public (can be Private)*

ClickHouse Cloud engineers require troubleshooting access via Tailscale. They are provisioned with just-in-time certificate-based authentication for BYOC deployments.

### Billing scraper {#billing-scraper}

*Outbound, Private*

The Billing scraper collects billing data from ClickHouse and sends it to an S3 bucket owned by ClickHouse Cloud.

It runs as a sidecar alongside the ClickHouse server container, periodically scraping CPU and memory metrics. Requests within the same region are routed through VPC gateway service endpoints.

### Alerts {#alerts}

*Outbound, Public*

AlertManager is configured to send alerts to ClickHouse Cloud when the customer's ClickHouse cluster is unhealthy.

Metrics and logs are stored within the customer's BYOC VPC. Logs are currently stored locally in EBS. In a future update, they will be stored in LogHouse, a ClickHouse service within the BYOC VPC. Metrics use a Prometheus and Thanos stack, stored locally in the BYOC VPC.

### Service state {#service-state}

*Outbound*

State Exporter sends ClickHouse service state information to an SQS owned by ClickHouse Cloud.