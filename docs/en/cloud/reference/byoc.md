---
title: BYOC (Bring Your Own Cloud) for AWS
slug: /en/cloud/reference/byoc
sidebar_label: BYOC (Bring Your Own Cloud)
keywords: [byoc, cloud, bring your own cloud]
description: Deploy ClickHouse on your own cloud infrastructure
---

## Overview

BYOC (Bring Your Own Cloud) allows you to deploy ClickHouse Cloud on your own cloud infrastructure. This is useful if you have specific requirements or constraints that prevent you from using the ClickHouse Cloud managed service.

**If you would like access, please contact [support](https://clickhouse.com/support/program).** Refer to our [Terms of Service](https://clickhouse.com/legal/agreements/terms-of-service) for additional information.

BYOC is currently only supported for AWS, with GCP and Microsoft Azure in development.

:::note 
BYOC is designed specifically for large-scale deployments.
:::

## Glossary

- **ClickHouse VPC:**  The VPC owned by ClickHouse Cloud. 
- **Customer BYOC VPC:** The VPC, owned by the customer’s cloud account, is provisioned and managed by ClickHouse Cloud and dedicated to a ClickHouse Cloud BYOC deployment.
- **Customer VPC** Other VPCs owned by the customer cloud account used for applications that need to connect to the Customer BYOC VPC.

## Architecture

Metrics and logs are stored within the customer's BYOC VPC. Logs are currently stored in locally in EBS. In a future update, logs will be stored in LogHouse, which is a ClickHouse service in the customer's BYOC VPC. Metrics are implemented via a Prometheus and Thanos stack stored locally in the customer's BYOC VPC.

<br />

<img src={require('./images/byoc-1.png').default}
    alt='BYOC Architecture'
    class='image'
    style={{width: '800px'}}
/>

<br />

## Onboarding Process

Customers can initiate the onboarding process by reaching out to ClickHouse [support](https://clickhouse.com/support/program). Customers need to have a dedicated AWS account and know the region they will use. At this time, we are allowing users to launch BYOC services only in the regions that we support for ClickHouse Cloud.

### Prepare a Dedicated AWS Account

Customers must prepare a dedicated AWS account for hosting the ClickHouse BYOC deployment to ensure better isolation. With this and the initial organization admin’s email, you can contact ClickHouse support.

### Apply CloudFormation Template

BYOC setup is initialized via a [CloudFormation stack](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml), which creates only a role allowing BYOC controllers from ClickHouse Cloud to manage infrastructure. The S3, VPC, and compute resources for running ClickHouse are not included in this stack.

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### Setup BYOC Infrastructure

After creating the CloudFormation stack, you will be prompted to set up the infrastructure, including S3, VPC, and the EKS cluster, from the cloud console. Certain configurations must be determined at this stage, as they cannot be changed later. Specifically:

- **The region you want to use**, you can choose one of any [public regions](clickhouse.com/docs/en/cloud/reference/supported-regions) we have for ClickHouse Cloud.
- **The VPC CIDR range for BYOC**: By default, we use `10.0.0.0/16` for the BYOC VPC CIDR range. If you plan to use VPC peering with another account, ensure the CIDR ranges do not overlap. Allocate a proper CIDR range for BYOC, with a minimum size of `/22` to accommodate necessary workloads.
- **Availability Zones for BYOC VPC**: If you plan to use VPC peering, aligning availability zones between the source and BYOC accounts can help reduce cross-AZ traffic costs. In AWS, availability zone suffixes (`a, b, c`) may represent different physical zone IDs across accounts. See the [AWS guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html) for details.

### Optional: Setup VPC Peering

To create or delete VPC peering for ClickHouse BYOC, follow the steps:

#### Step 1 Create a peering connection
1. Navigate to the VPC Dashboard in ClickHouse BYOC account.
2. Select Peering Connections.
3. Click Create Peering Connection
4. Set the VPC Requester to the ClickHouse VPC ID.
5. Set the VPC Acceptor to the target VPC ID. (Select another account if applicable)
6. Click Create Peering Connection.

<br />

<img src={require('./images/byoc-vpcpeering-1.png').default}
    alt='BYOC Create Peering Connection'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Step 2 Accept the peering connection request
Go to the peering account, in the (VPC -> Peering connections -> Actions -> Accept request) page customer can approve this VPC peering request.

<br />

<img src={require('./images/byoc-vpcpeering-2.png').default}
    alt='BYOC Accept Peering Connection'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Step 3 Add destination to ClickHouse VPC route tables
In ClickHouse BYOC account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the ClickHouse VPC ID. Edit each route table attached to the private subnets.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the target VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<br />

<img src={require('./images/byoc-vpcpeering-3.png').default}
    alt='BYOC Add route table'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Step 4 Add destination to the target VPC route tables
In the peering AWS account,
1. Select Route Tables in the VPC Dashboard.
2. Search for the target VPC ID.
3. Click the Edit button under the Routes tab.
4. Click Add another route.
5. Enter the CIDR range of the ClickHouse VPC for the Destination.
6. Select “Peering Connection” and the ID of the peering connection for the Target.

<br />

<img src={require('./images/byoc-vpcpeering-4.png').default}
    alt='BYOC Add route table'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Step 5 Enable Private Load Balancer for ClickHouse BYOC
Contact ClickHouse support to enable Private Load Balancer. 

---
The ClickHouse service should now be accessible from the peered VPC.

To access ClickHouse privately, a private load balancer and endpoint are provisioned for secure connectivity from the user's peered VPC. The private endpoint follows the public endpoint format with a `-private` suffix. For example:  
- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`  
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

Optional, after verifying that peering is working, you can request the removal of the public load balancer for ClickHouse BYOC.

## Upgrade Process

We regularly upgrade the software, including ClickHouse database version upgrades, ClickHouse Operator, EKS, and other components.

While we aim for seamless upgrades (e.g., rolling upgrades and restarts), some, such as ClickHouse version changes and EKS node upgrades, may impact service. Customers can specify a maintenance window (e.g., every Tuesday at 1:00 a.m. PDT), ensuring such upgrades occur only during the scheduled time.

:::note
Maintenance windows do not apply to security and vulnerability fixes. These are handled as off-cycle upgrades, with timely communication to coordinate a suitable time and minimize operational impact. 
:::

## CloudFormation IAM Roles

### Bootstrap IAM role

The bootstrap IAM role has the following permissions:

- **EC2 and VPC operations**: Required for setting up VPC and EKS clusters.  
- **S3 operations (e.g., `s3:CreateBucket`)**: Needed to create buckets for ClickHouse BYOC storage.  
- **`route53:*` permissions**: Required for external DNS to configure records in Route 53.  
- **IAM operations (e.g., `iam:CreatePolicy`)**: Needed for controllers to create additional roles (see the next section for details).  
- **EKS operations**: Limited to resources with names starting with the `clickhouse-cloud` prefix.

### Additional IAM roles created by the controller

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

## Network Boundaries

This section covers different network traffic to and from the customer BYOC VPC:

- **Inbound**: Traffic entering the customer BYOC VPC.  
- **Outbound**: Traffic originating from the customer BYOC VPC and sent to an external destination.  
- **Public**: A network endpoint accessible from the public internet.  
- **Private**: A network endpoint accessible only through private connections, such as VPC peering, VPC Private Link, or Tailscale.  

**Istio ingress is deployed behind an AWS NLB to accept ClickHouse client traffic.**  

*Inbound, Public (can be Private)*

The Istio ingress gateway terminates TLS. The certificate, provisioned by CertManager with Let's Encrypt, is stored as a secret within the EKS cluster. Traffic between Istio and ClickHouse is [encrypted by AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types) since they reside in the same VPC.  

By default, ingress is publicly accessible with IP allow list filtering. Customers can configure VPC peering to make it private and disable public connections. We highly recommend setting up an [IP filter](/en/cloud/security/setting-ip-filters) to restrict access.

### Troubleshooting access

*Inbound, Public (can be Private)*

ClickHouse Cloud engineers require troubleshooting access via Tailscale. They are provisioned with just-in-time certificate-based authentication for BYOC deployments.  

### Billing scraper

*Outbound, Private*

The Billing scraper collects billing data from ClickHouse and sends it to an S3 bucket owned by ClickHouse Cloud.  

It runs as a sidecar alongside the ClickHouse server container, periodically scraping CPU and memory metrics. Requests within the same region are routed through VPC gateway service endpoints.

### Alerts

*Outbound, Public*

AlertManager is configured to send alerts to ClickHouse Cloud when the customer's ClickHouse cluster is unhealthy.  

Metrics and logs are stored within the customer's BYOC VPC. Logs are currently stored locally in EBS. In a future update, they will be stored in LogHouse, a ClickHouse service within the BYOC VPC. Metrics use a Prometheus and Thanos stack, stored locally in the BYOC VPC.  

### Service state

*Outbound*

State Exporter sends ClickHouse service state information to an SQS owned by ClickHouse Cloud.

## Features

### Supported features

- **SharedMergeTree**: ClickHouse Cloud and BYOC use the same binary and configuration.  
- **Console access for managing service state**:  
  - Supports operations such as start, stop, and terminate.  
  - View services and status.  
- **Backup and restore.**  
- **Manual vertical and horizontal scaling.**
- **Idling.**  
- **Runtime security monitoring and alerting via Falco (`falco-metrics`).**  
- **Zero Trust Network via Tailscale.**  
- **Monitoring**:  
  - The Cloud console includes built-in health dashboards for monitoring service health.  
  - Prometheus scraping for centralized monitoring with Prometheus, Grafana, and Datadog. See the [Prometheus documentation](/en/integrations/prometheus) for setup instructions.  
- **VPC Peering.**  
- **Integrations**: See the full list on [this page](/en/integrations).  
- **Secure S3.**  
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/).**  

### Planned features (currently unsupported)

- [AWS KMS](https://aws.amazon.com/kms/) aka CMEK (customer-managed encryption keys)
- ClickPipes for ingest
- Autoscaling
- MySQL interface

## FAQ

### Compute

#### Can I create multiple services in this single EKS cluster?

Yes. The infrastructure only needs to be provisioned once for every AWS account and region combination.

### Which regions do you support for BYOC?

BYOC supports the same set of [regions](/en/cloud/reference/supported-regions#aws-regions ) as ClickHouse Cloud.

#### Will there be some resource overhead? What are the resources needed to run services other than ClickHouse instances?

Besides Clickhouse instances (ClickHouse servers and ClickHouse Keeper), we run services such as clickhouse-operator, aws-cluster-autoscaler, Istio etc. and our monitoring stack. 

Currently we have 3 m5.xlarge nodes (one for each AZ) in a dedicated node group to run those workloads.

### Network and Security

#### Can we revoke permissions set up during installation after setup is complete?

This is currently not possible.

#### Have you considered some future security controls for ClickHouse engineers to access customer infra for troubleshooting?

Yes. Implementing a customer controlled mechanism where customers can approve engineers' access to the cluster is on our roadmap. At the moment, engineers must go through our internal escalation process to gain just-in-time access to the cluster. This is logged and audited by our security team.

#### What is the size of the VPC IP range created?

By default we use `10.0.0.0/16` for BYOC VPC. We recommend reserving at least /22 for potential future scaling,
but if you prefer to limit the size, it is possible to use /23 if it is likely that you will be limited
to 30 server pods.

#### Can I decide maintenance frequency

Contact support to schedule maintenance windows. Please expect a minimum of a weekly update schedule. 

## Observability

### Built-in Monitoring Tools

#### Observability Dashboard

ClickHouse Cloud includes an advanced observability dashboard that displays metrics such as memory usage, query rates, and I/O. This can be accessed in the **Monitoring** section of ClickHouse Cloud web console interface.

<br />

<img src={require('./images/byoc-3.png').default}
    alt='Observability dashboard'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Advanced Dashboard

You can customize a dashboard using metrics from system tables like `system.metrics`, `system.events`, and `system.asynchronous_metrics` and more to monitor server performance and resource utilization in detail.

<br />

<img src={require('./images/byoc-4.png').default}
    alt='Advanced dashboard'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Prometheus Integration

ClickHouse Cloud provides a Prometheus endpoint that you can use to scrape metrics for monitoring. This allows for integration with tools like Grafana and Datadog for visualization.

**Sample request via https endpoint /metrics_all**
    
```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**Sample Response**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount The age of the oldest mutation (in seconds)
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings The number of warnings issued by the server. It usually indicates about possible misconfiguration
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**Authentication**

A ClickHouse username and password pair can be used for authentication. We recommend creating a dedicated user with minimal permissions for scraping metrics. At minimum, a `READ` permission is required on the `system.custom_metrics` table across replicas. For example:

```sql
GRANT REMOTE ON *.* TO scraping_user          
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Configuring Prometheus**

An example configuration is shown below. The `targets` endpoint is the same one used for accessing the ClickHouse service.

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

Please also see [this blog post](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) and the [Prometheus setup docs for ClickHouse](/en/integrations/prometheus).
