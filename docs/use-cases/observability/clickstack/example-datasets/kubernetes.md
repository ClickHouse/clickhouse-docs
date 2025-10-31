---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Monitoring Kubernetes'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'Getting started with ClickStack and monitoring Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

This guide allows you to collect logs and metrics from your Kubernetes system, sending them to **ClickStack** for visualization and analysis. For demo data we use optionally use the ClickStack fork of the official Open Telemetry demo.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Prerequisites {#prerequisites}

This guide requires you to have:

- A **Kubernetes cluster** (v1.20+ recommended) with at least 32 GiB of RAM and 100GB of disk space available on one node for ClickHouse.
- **[Helm](https://helm.sh/)** v3+
- **`kubectl`**, configured to interact with your cluster

## Deployment options {#deployment-options}

You can follow this guide using either of the following deployment options:

- **Self-hosted**: Deploy ClickStack entirely within your Kubernetes cluster, including:
  - ClickHouse
  - HyperDX
  - MongoDB (used for dashboard state and configuration)

- **Cloud-hosted**: Use **ClickHouse Cloud**, with HyperDX managed externally. This eliminates the need to run ClickHouse or HyperDX inside your cluster.

To simulate application traffic, you can optionally deploy the ClickStack fork of the [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo). This generates telemetry data including logs, metrics, and traces. If you already have workloads running in your cluster, you can skip this step and monitor existing pods, nodes, and containers.

<VerticalStepper headerLevel="h3">

### Install cert-manager (Optional) {#install-cert-manager}

If your setup needs TLS certificates, install [cert-manager](https://cert-manager.io/) using Helm:

```shell
# Add Cert manager repo 

helm repo add jetstack https://charts.jetstack.io 

helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
```

### Deploy the OpenTelemetry Demo (Optional) {#deploy-otel-demo}

This **step is optional and intended for users with no existing pods to monitor**. Although users with existing services deployed in their Kubernetes environment can skip, this demo does include instrumented microservices which generate trace and session replay data - allowing users to explore all features of ClickStack.

The following deploys the ClickStack fork of the OpenTelemetry Demo application stack within a Kubernetes cluster, tailored for observability testing and showcasing instrumentation. It includes backend microservices, load generators, telemetry pipelines, supporting infrastructure (e.g., Kafka, Redis), and SDK integrations with ClickStack.

All services are deployed to the `otel-demo` namespace. Each deployment includes:

- Automatic instrumentation with OTel and ClickStack SDKS for traces, metrics, and logs.
- All services send their instrumentation to a `my-hyperdx-hdx-oss-v2-otel-collector` OpenTelemetry collector (not deployed)
- [Forwarding of resource tags](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods) to correlate logs, metrics and traces via the environment variable `OTEL_RESOURCE_ATTRIBUTES`.

```shell
## download demo Kubernetes manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
# wget alternative
# wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
```

On deployment of the demo, confirm all pods have been successfully created and are in the `Running` state:

```shell
kubectl get pods -n=otel-demo

NAME                                 READY   STATUS    RESTARTS   AGE
accounting-fd44f4996-fcl4k           1/1     Running   0          13m
ad-769f968468-qq8mw                  1/1     Running   0          13m
artillery-loadgen-7bc4bdf47d-5sb96   1/1     Running   0          13m
cart-5b4c98bd8-xm7m2                 1/1     Running   0          13m
checkout-784f69b785-cnlpp            1/1     Running   0          13m
currency-fd7775b9c-rf6cr             1/1     Running   0          13m
email-5c54598f99-2td8s               1/1     Running   0          13m
flagd-5466775df7-zjb4x               2/2     Running   0          13m
fraud-detection-5769fdf75f-cjvgh     1/1     Running   0          13m
frontend-6dcb696646-fmcdz            1/1     Running   0          13m
frontend-proxy-7b8f6cd957-s25qj      1/1     Running   0          13m
image-provider-5fdb455756-fs4xv      1/1     Running   0          13m
kafka-7b6666866d-xfzn6               1/1     Running   0          13m
load-generator-57cbb7dfc9-ncxcf      1/1     Running   0          13m
payment-6d96f9bcbd-j8tj6             1/1     Running   0          13m
product-catalog-7fb77f9c78-49bhj     1/1     Running   0          13m
quote-576c557cdf-qn6pr               1/1     Running   0          13m
recommendation-546cc68fdf-8x5mm      1/1     Running   0          13m
shipping-7fc69f7fd7-zxrx6            1/1     Running   0          13m
valkey-cart-5f7b667bb7-gl5v4         1/1     Running   0          13m
```

<DemoArchitecture/>

### Add the ClickStack Helm chart repository {#add-helm-clickstack}

To deploy ClickStack, we use the [official Helm chart](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm).

This requires us to add the HyperDX Helm repository:

```shell
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Deploy ClickStack {#deploy-clickstack}

With the Helm chart installed, you can deploy ClickStack to your cluster. You can either run all components, including ClickHouse and HyperDX, within your Kubernetes environment, or use ClickHouse Cloud, where HyperDX is also available as a managed service.
<br/>

<details>
<summary>Self-managed deployment</summary>

The following command installs ClickStack to the `otel-demo` namespace. The helm chart deploys:

- A ClickHouse instance
- HyperDX
- The ClickStack distribution of the OTel collector
- MongoDB for storage of HyperDX application state

:::note
You might need to adjust the `storageClassName` according to your Kubernetes cluster configuration. 
:::

Users not deploying the OTel demo can modify this, selecting an appropriate namespace.

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
```

:::warning ClickStack in production

This chart also installs ClickHouse and the OTel collector. For production, it is recommended that you use the clickhouse and OTel collector operators and/or use ClickHouse Cloud.

To disable clickhouse and OTel collector, set the following values:

```shell
helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

:::

</details>

<details>
<summary>Using ClickHouse Cloud</summary>

If you'd rather use ClickHouse Cloud, you can deploy ClickStack and [disable the included ClickHouse](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud). 

:::note
The chart currently always deploys both HyperDX and MongoDB. While these components offer an alternative access path, they are not integrated with ClickHouse Cloud authentication. These components are intended for administrators in this deployment model, [providing access to the secure ingestion key](#retrieve-ingestion-api-key) needed to ingest through the deployed OTel collector, but should not be exposed to end users.
:::

```shell
# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
```

</details>

To verify the deployment status, run the following command and confirm all components are in the `Running` state. Note that ClickHouse will be absent from this for users using ClickHouse Cloud:

```shell
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

NAME                                                    READY   STATUS    RESTARTS   AGE
my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
```

### Access the HyperDX UI {#access-the-hyperdx-ui}

:::note
Even when using ClickHouse Cloud, the local HyperDX instance deployed in the Kubernetes cluster is still required. It provides an ingestion key managed by the OpAMP server bundled with HyperDX, with secures ingestion through the deployed OTel collector - a capability not currently available in the ClickHouse Cloud-hosted version.
:::

For security, the service uses `ClusterIP` and is not exposed externally by default.

To access the HyperDX UI, port forward from 3000 to the local port 8080.

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

Navigate [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user, providing a username and password that meets the complexity requirements.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### Retrieve ingestion API key {#retrieve-ingestion-api-key}

Ingestion to the OTel collector deployed by the ClickStack collector is secured with an ingestion key.

Navigate to [`Team Settings`](http://localhost:8080/team) and copy the `Ingestion API Key` from the `API Keys` section. This API key ensures data ingestion through the OpenTelemetry collector is secure.

<Image img={copy_api_key} alt="Copy API key" size="lg"/>

### Create API Key Kubernetes Secret {#create-api-key-kubernetes-secret}

Create a new Kubernetes secret with the Ingestion API Key and a config map containing the location of the OTel collector deployed with the ClickStack helm chart. Later components will use this to allow ingest into the collector deployed with the ClickStack Helm chart:

```shell
# create secret with the ingestion API key
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
-n otel-demo

# create a ConfigMap pointing to the ClickStack OTel collector deployed above
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```

Restart the OpenTelemetry demo application pods to take into account the Ingestion API Key. 

```shell
kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
```

Trace and log data from demo services should now begin to flow into HyperDX.

<Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes Data" size="lg"/>

### Add the OpenTelemetry Helm repo {#add-otel-helm-repo}

To collect Kubernetes metrics, we will deploy a standard OTel collector, configuring this to send data securely to our ClickStack collector using the above ingestion API key.

This requires us to install the OpenTelemetry Helm repo:

```shell
# Add Otel Helm repo
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
```

### Deploy Kubernetes collector components {#deploy-kubernetes-collector-components}

To collect logs and metrics from both the cluster itself and each node, we'll need to deploy two separate OpenTelemetry collectors, each with its own manifest. The two manifests provided - `k8s_deployment.yaml` and `k8s_daemonset.yaml`  - work together to collect comprehensive telemetry data from your Kubernetes cluster.

- `k8s_deployment.yaml` deploys a **single OpenTelemetry Collector instance** responsible for collecting **cluster-wide events and metadata**. It gathers Kubernetes events, cluster metrics, and enriches telemetry data with pod labels and annotations. This collector runs as a standalone deployment with a single replica to avoid duplicate data.

- `k8s_daemonset.yaml` deploys a **DaemonSet-based collector** that runs on every node in your cluster. It collects **node-level and pod-level metrics**, as well as container logs, using components like `kubeletstats`, `hostmetrics`, and Kubernetes attribute processors. These collectors enrich logs with metadata and send them to HyperDX using the OTLP exporter.

Together, these manifests enable full-stack observability across the cluster, from infrastructure to application-level telemetry, and send the enriched data to ClickStack for centralized analysis.

First, install the collector as a deployment:

```shell
# download manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
# install the helm chart
helm install --namespace otel-demo k8s-otel-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
```

<details>
<summary>k8s_deployment.yaml</summary>

```yaml
# k8s_deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
 
# We only want one of these collectors - any more and we'd produce duplicate data
replicaCount: 1
 
presets:
  kubernetesAttributes:
    enabled: true
    # When enabled, the processor will extract all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled, the processor will extract all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect Kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects Kubernetes events by default.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Configures the Kubernetes Cluster Receiver to collect cluster-level metrics.
  # Adds the k8s_cluster receiver to the metrics pipeline and adds the necessary rules to ClusteRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
  clusterMetrics:
    enabled: true

extraEnvs:
  - name: HYPERDX_API_KEY
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: HYPERDX_API_KEY
        optional: true
  - name: YOUR_OTEL_COLLECTOR_ENDPOINT
    valueFrom:
      configMapKeyRef:
        name: otel-config-vars
        key: YOUR_OTEL_COLLECTOR_ENDPOINT
 
config:
  exporters:
    otlphttp:
      endpoint: "${env:YOUR_OTEL_COLLECTOR_ENDPOINT}"
      compression: gzip
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

</details>

Next, deploy the collector as a DaemonSet for node and pod-level metrics and logs:

```shell
# download manifest file
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
# install the helm chart
helm install --namespace otel-demo k8s-otel-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

<details>

<summary>
`k8s_daemonset.yaml`
</summary>

```yaml
# k8s_daemonset.yaml
mode: daemonset

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
   
# Required to use the kubeletstats cpu/memory utilization metrics
clusterRole:
  create: true
  rules:
    - apiGroups:
        - ''
      resources:
        - nodes/proxy
      verbs:
        - get
 
presets:
  logsCollection:
    enabled: true
  hostMetrics:
    enabled: true
  # Configures the Kubernetes Processor to add Kubernetes metadata.
  # Adds the k8sattributes processor to all the pipelines and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
  kubernetesAttributes:
    enabled: true
    # When enabled, the processor will extract all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled, the processor will extract all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect node, pod, and container metrics from the API server on a kubelet..
  # Adds the kubeletstats receiver to the metrics pipeline and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
  kubeletMetrics:
    enabled: true

extraEnvs:
  - name: HYPERDX_API_KEY
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: HYPERDX_API_KEY
        optional: true
  - name: YOUR_OTEL_COLLECTOR_ENDPOINT
    valueFrom:
      configMapKeyRef:
        name: otel-config-vars
        key: YOUR_OTEL_COLLECTOR_ENDPOINT

config:
  receivers:
    # Configures additional kubelet metrics
    kubeletstats:
      collection_interval: 20s
      auth_type: 'serviceAccount'
      endpoint: '${env:K8S_NODE_NAME}:10250'
      insecure_skip_verify: true
      metrics:
        k8s.pod.cpu_limit_utilization:
          enabled: true
        k8s.pod.cpu_request_utilization:
          enabled: true
        k8s.pod.memory_limit_utilization:
          enabled: true
        k8s.pod.memory_request_utilization:
          enabled: true
        k8s.pod.uptime:
          enabled: true
        k8s.node.uptime:
          enabled: true
        k8s.container.cpu_limit_utilization:
          enabled: true
        k8s.container.cpu_request_utilization:
          enabled: true
        k8s.container.memory_limit_utilization:
          enabled: true
        k8s.container.memory_request_utilization:
          enabled: true
        container.uptime:
          enabled: true
 
  exporters:
    otlphttp:
      endpoint: "${env:YOUR_OTEL_COLLECTOR_ENDPOINT}"
      compression: gzip
      headers:
        authorization: "${env:HYPERDX_API_KEY}"
 
  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

</details>

### Explore Kubernetes data in HyperDX {#explore-kubernetes-data-hyperdx}

Navigate to your HyperDX UI - either using your Kubernetes-deployed instance or via ClickHouse Cloud.

<p/>
<details>
<summary>Using ClickHouse Cloud</summary>

If using ClickHouse Cloud, simply log in to your ClickHouse Cloud service and select "HyperDX" from the left menu. You will be automatically authenticated and will not need to create a user.

When prompted to create a datasource, retain all default values within the create source model, completing the Table field with the value `otel_logs` - to create a logs source. All other settings should be auto-detected, allowing you to click `Save New Source`.

<Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

You will also need to create a datasource for traces and metrics.

For example, to create sources for traces and OTel metrics, users can select `Create New Source` from the top menu.

<Image force img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

From here, select the required source type followed by the appropriate table e.g. for traces, select the table `otel_traces`. All settings should be auto-detected.

<Image force img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note Correlating sources
Note that different data sources in ClickStack—such as logs and traces—can be correlated with each other. To enable this, additional configuration is required on each source. For example, in the logs source, you can specify a corresponding trace source, and vice versa in the traces source. See "Correlated sources" for further details.
:::

</details>

<details>

<summary>Using self-managed deployment</summary>

To access the local deployed HyperDX, you can port forward using the local command and access HyperDX at [http://localhost:8080](http://localhost:8080).

```shell
kubectl port-forward \
 pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
  8080:3000 \
 -n otel-demo
```

:::note ClickStack in production
In production, we recommend using an ingress with TLS if you are not using HyperDX in ClickHouse Cloud. For example:

```shell
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
--set hyperdx.ingress.enabled=true \
--set hyperdx.ingress.host=your-domain.com \
--set hyperdx.ingress.tls.enabled=true
```
::::

</details>

To explore the Kubernetes data, navigate to the dedicated present dashboard at `/kubernetes` e.g. [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes).

Each of the tabs, Pods, Nodes, and Namespaces, should be populated with data.

</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
