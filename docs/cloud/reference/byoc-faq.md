## FAQ {#faq}

### Compute {#compute}

#### Can I create multiple services in this single EKS cluster? {#can-i-create-multiple-services-in-this-single-eks-cluster}

Yes. The infrastructure only needs to be provisioned once for every AWS account and region combination.

### Which regions do you support for BYOC? {#which-regions-do-you-support-for-byoc}

BYOC supports the same set of [regions](/cloud/reference/supported-regions#aws-regions ) as ClickHouse Cloud.

#### Will there be some resource overhead? What are the resources needed to run services other than ClickHouse instances? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

Besides Clickhouse instances (ClickHouse servers and ClickHouse Keeper), we run services such as `clickhouse-operator`, `aws-cluster-autoscaler`, Istio etc. and our monitoring stack.

Currently we have 3 m5.xlarge nodes (one for each AZ) in a dedicated node group to run those workloads.

### Network and Security {#network-and-security}

#### Can we revoke permissions set up during installation after setup is complete? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

This is currently not possible.

#### Have you considered some future security controls for ClickHouse engineers to access customer infra for troubleshooting? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

Yes. Implementing a customer controlled mechanism where customers can approve engineers' access to the cluster is on our roadmap. At the moment, engineers must go through our internal escalation process to gain just-in-time access to the cluster. This is logged and audited by our security team.

#### What is the size of the VPC IP range created? {#what-is-the-size-of-the-vpc-ip-range-created}

By default we use `10.0.0.0/16` for BYOC VPC. We recommend reserving at least /22 for potential future scaling,
but if you prefer to limit the size, it is possible to use /23 if it is likely that you will be limited
to 30 server pods.

#### Can I decide maintenance frequency {#can-i-decide-maintenance-frequency}

Contact support to schedule maintenance windows. Please expect a minimum of a weekly update schedule.

## Observability {#observability}

### Built-in Monitoring Tools {#built-in-monitoring-tools}

#### Observability Dashboard {#observability-dashboard}

ClickHouse Cloud includes an advanced observability dashboard that displays metrics such as memory usage, query rates, and I/O. This can be accessed in the **Monitoring** section of ClickHouse Cloud web console interface.

<br />

<Image img={byoc3} size="lg" alt="Observability dashboard" border />

<br />

#### Advanced Dashboard {#advanced-dashboard}

You can customize a dashboard using metrics from system tables like `system.metrics`, `system.events`, and `system.asynchronous_metrics` and more to monitor server performance and resource utilization in detail.

<br />

<Image img={byoc4} size="lg" alt="Advanced dashboard" border />

<br />

#### Prometheus Integration {#prometheus-integration}

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

Please also see [this blog post](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) and the [Prometheus setup docs for ClickHouse](/integrations/prometheus).