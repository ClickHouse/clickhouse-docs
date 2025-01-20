---
slug: /en/integrations/prometheus
sidebar_label: Prometheus
title: Prometheus
description: Export ClickHouse metrics to Prometheus
keywords: [prometheus, grafana, monitoring, metrics, exporter] 
---

# Prometheus Integration

The feature supports integrating [Prometheus](https://prometheus.io/) to monitor ClickHouse Cloud services. Access to Prometheus metrics is exposed via the [ClickHouse Cloud API](/en/cloud/manage/api/api-overview) endpoint that allows users to securely connect and export metrics into their Prometheus metrics collector. These metrics can be integrated with dashboards e.g., Grafana, Datadog for visualization.

To get started, [generate an API key](/en/cloud/manage/openapi).

## Prometheus Endpoint API to retrieve ClickHouse Cloud Metrics

### API Reference

|Method|Path|
|---|---|
|GET|https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus|

**Request Parameters**

|Name|Type|
|---|---|
|Organization ID|uuid|
|Service ID|uuid|

### Authentication

Use your ClickHouse Cloud API key for basic authentication:

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus 
```

### Sample Response

```
# HELP ClickHouse_ServiceInfo Information about service, including cluster status and ClickHouse version
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1

# HELP ClickHouseProfileEvents_Query Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6

# HELP ClickHouseProfileEvents_QueriesWithSubqueries Count queries with all subqueries
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230

# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Count SELECT queries with all subqueries
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224

# HELP ClickHouseProfileEvents_FileOpen Number of files opened.
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157

# HELP ClickHouseProfileEvents_Seek Number of times the 'lseek' function was called.
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840
```

### Metric Labels

All metrics have the following labels:

|Label|Description|
|---|---|
|clickhouse_org|Organization ID|
|clickhouse_service|Service ID|
|clickhouse_service_name|Service name|

### Information Metrics

ClickHouse Cloud provides a special metric `ClickHouse_ServiceInfo` which is a `gauge` that always has the value of `1`. This metric contains all the **Metric Labels** as well as the following labels:

|Label|Description|
|---|---|
|clickhouse_cluster_status|Status of the service. Could be one of the following: [`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|Version of the ClickHouse server that the service is running|
|scrape|Indicates the status of the last scrape. Could be either `full` or `partial`|
|full|Indicates that there were no errors during the last metrics scrape|
|partial|Indicates that there were some errors during the last metrics scrape and only `ClickHouse_ServiceInfo` metric was returned.|

Requests to retrieve metrics will not resume an idled service. In the case that a service is in the `idle` state, only the `ClickHouse_ServiceInfo` metric will be returned.

### Configuring Prometheus

The Prometheus server collects metrics from configured targets at the given intervals. Below is an example configuration for the Prometheus server to use the ClickHouse Cloud Prometheus Endpoint:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
    - targets: ["localhost:9090"]
  - job_name: "clickhouse"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    scheme: https
    metrics_path: "/v1/organizations/<ORG_ID>/services/<SERVICE_ID>/prometheus"
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
```

Note the `honor_labels` configuration parameter needs to be set to `true` for the instance label to be properly populated.

## Integrating with Grafana

Users have two primary ways to integrate with Grafana:

- **Metrics Endpoint** – This approach has the advantage of not requiring any additional components or infrastructure. This offering is limited to Grafana Cloud and only requires the ClickHouse Cloud Prometheus Endpoint URL and credentials.
- **Grafana Alloy** - Grafana Alloy is a vendor-neutral distribution of the OpenTelemetry (OTel) Collector, replacing the Grafana Agent. This can be used as a scraper, is deployable in your own infrastructure, and is compatible with any Prometheus endpoint.

We provide instructions on using these options below, focusing on the details specific to the ClickHouse Cloud Prometheus Endpoint.

### Grafana Cloud with Metrics Endpoint

- Login to your Grafana Cloud account
- Add a new connection by selecting the **Metrics Endpoint**
- Configure the Scrape URL to point to the Prometheus endpoint and use basic auth to configure your connection with the API key/secret
- Test the connection to ensure you are able to connect

<img src={require('./images/prometheus-grafana-metrics-endpoint.png').default}    
  class='image'
  alt='Configure Grafana Metrics Endpoint'
  style={{width: '600px'}} />

<br />

Once configured, you should see the metrics in the drop-down that you can select to configure dashboards:

<img src={require('./images/prometheus-grafana-dropdown.png').default}    
  class='image'
  alt='Grafana Metrics Explorer Drop-down'
  style={{width: '400px'}} />

<br />

<img src={require('./images/prometheus-grafana-chart.png').default}    
  class='image'
  alt='Grafana Metrics Explorer Chart'
  style={{width: '800px'}} />

### Grafana Cloud with Alloy

If you are using Grafana Cloud, Alloy can be installed by navigating to the Alloy menu in Grafana and following the onscreen instructions:

<img src={require('./images/prometheus-grafana-alloy.png').default}    
  class='image'
  alt='Grafana Alloy'
  style={{width: '600px'}} />

<br />

This should configure Alloy with a `prometheus.remote_write` component for sending data to a Grafana Cloud endpoint with an authentication token. Users then need to only modify the Alloy config (found in `/etc/alloy/config.alloy` for Linux) to include a scraper for the ClickHouse Cloud Prometheus Endpoint.

The following shows an example configuration for Alloy with a `prometheus.scrape` component for scraping metrics from the ClickHouse Cloud Endpoint, as well as the automatically configured `prometheus.remote_write` component. Note that the `basic_auth` configuration component contains our Cloud API key ID and secret as the username and password, respectively.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
	__address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/Promethues",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/services/f7fefb6e-41a5-48fa-9f5f-deaaa442d5d8/prometheus
  }]

  honor_labels = true

  basic_auth {
  	username = "KEY_ID"
  	password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service below
}

prometheus.remote_write "metrics_service" {
  endpoint {
	url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
	basic_auth {
  	  username = "<Grafana API username>"
  	  password = "<grafana API token>"
    }
  }
}
```

Note the `honor_labels` configuration parameter needs to be set to `true` for the instance label to be properly populated.

### Grafana self-managed with Alloy

Self-managed users of Grafana can find the instructions for installing the Alloy agent [here](https://grafana.com/docs/alloy/latest/get-started/install/). We assume users have configured Alloy to send Prometheus metrics to their desired destination. The `prometheus.scrape` component below causes Alloy to scrape the ClickHouse Cloud Endpoint. We assume `prometheus.remote_write` receives the scraped metrics. Adjust the `forward_to key` to the target destination if this does not exist.

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
  targets = [{
	__address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/Promethues",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/services/f7fefb6e-41a5-48fa-9f5f-deaaa442d5d8/prometheus
  }]

  honor_labels = true

  basic_auth {
  	username = "KEY_ID"
  	password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // forward to metrics_service. Modify to your preferred receiver
}
```

Once configured, you should see ClickHouse related metrics in your metrics explorer:

<img src={require('./images/prometheus-grafana-metrics-explorer.png').default}    
  class='image'
  alt='Grafana Metrics Explorer'
  style={{width: '800px'}} />

<br />

Note the `honor_labels` configuration parameter needs to be set to `true` for the instance label to be properly populated.

## Integrating with Datadog

You can use the Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux) and [OpenMetrics integration](https://docs.datadoghq.com/integrations/openmetrics/) to collect metrics from the ClickHouse Cloud endpoint. Below is a simple example configuration for this agent and integration. Please note though that you may want to select only those metrics that you care about the most. The catch-all example below will export many thousands of metric-instance combinations which Datadog will treat as custom metrics.

```yaml
init_config:

instances:
   - openmetrics_endpoint: 'https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/services/f7fefb6e-41a5-48fa-9f5f-deaaa442d5d8/prometheus'
     namespace: 'clickhouse'
     metrics:
         - '^ClickHouse.*'
     username: username
     password: password
```

<br />

<img src={require('./images/prometheus-datadog.png').default}    
  class='image'
  alt='Prometheus Datadog Integration'
  style={{width: '600px'}} />
