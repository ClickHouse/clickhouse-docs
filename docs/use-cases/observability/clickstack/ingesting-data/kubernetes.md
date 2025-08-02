---
slug: /use-cases/observability/clickstack/ingesting-data/kubernetes
pagination_prev: null
pagination_next: null
description: 'Kubernetes integration for ClickStack - The ClickHouse Observability Stack'
title: 'Kubernetes'
keywords: [clickstack, observability, kubernetes, k8s, daemonset, deployment, helm, opentelemetry, otel-collector, logs, metrics, kubeletstats, k8s-events, cluster-metrics]
---

ClickStack uses the OpenTelemetry (OTel) collector to collect logs, metrics, and Kubernetes events from Kubernetes clusters and forward them to ClickStack. We support the native OTel log format and require no additional vendor-specific configuration.

This guide integrates the following:

- **Logs**
- **Infra Metrics**

:::note
To send over application-level metrics or APM/traces, you'll need to add the corresponding language integration to your application as well.
:::

## Creating the OTel Helm chart configuration files {#creating-the-otel-helm-chart-config-files}

To collect logs and metrics from both each node and the cluster itself, we'll need to deploy two separate OpenTelemetry collectors. One will be deployed as a DaemonSet to collect logs and metrics from each node, and the other will be deployed as a deployment to collect logs and metrics from the cluster itself.

### Creating the DaemonSet configuration {#creating-the-daemonset-configuration}

The DaemonSet will collect logs and metrics from each node in the cluster but will not collect Kubernetes events or cluster-wide metrics.

Create a file called `daemonset.yaml` with the following contents:

```yaml
# daemonset.yaml
mode: daemonset

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
  # More info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect node, pod, and container metrics from the API server on a kubelet..
  # Adds the kubeletstats receiver to the metrics pipeline and adds the necessary rules to ClusterRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
  kubeletMetrics:
    enabled: true

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
      endpoint: 'https://in-otel.hyperdx.io'
      headers:
        authorization: '<YOUR_INGESTION_API_KEY>'
      compression: gzip

  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

### Creating the deployment configuration {#creating-the-deployment-configuration}

To collect Kubernetes events and cluster-wide metrics, we'll need to deploy a separate OpenTelemetry collector as a deployment.

Create a file called `deployment.yaml` with the following contents:

```yaml copy
# deployment.yaml
mode: deployment

# We only want one of these collectors - any more, and we'd produce duplicate data
replicaCount: 1

presets:
  kubernetesAttributes:
    enabled: true
    # When enabled the processor will extra all labels for an associated pod and add them as resource attributes.
    # The label's exact name will be the key.
    extractAllPodLabels: true
    # When enabled the processor will extra all annotations for an associated pod and add them as resource attributes.
    # The annotation's exact name will be the key.
    extractAllPodAnnotations: true
  # Configures the collector to collect Kubernetes events.
  # Adds the k8sobject receiver to the logs pipeline and collects Kubernetes events by default.
  # More info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Configures the Kubernetes Cluster Receiver to collect cluster-level metrics.
  # Adds the k8s_cluster receiver to the metrics pipeline and adds the necessary rules to ClusteRole.
  # More Info: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
  clusterMetrics:
    enabled: true

config:
  exporters:
    otlphttp:
      endpoint: 'https://in-otel.hyperdx.io'
      headers:
        authorization: '<YOUR_INGESTION_API_KEY>'
      compression: gzip

  service:
    pipelines:
      logs:
        exporters:
          - otlphttp
      metrics:
        exporters:
          - otlphttp
```

## Deploying the OpenTelemetry collector {#deploying-the-otel-collector}

The OpenTelemetry collector can now be deployed in your Kubernetes cluster using
the [OpenTelemetry Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector).

Add the OpenTelemetry Helm repo:

```shell copy
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

Install the chart with the above config:

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f daemonset.yaml
```

Now the metrics, logs and Kubernetes events from your Kubernetes cluster should
now appear inside HyperDX.

## Forwarding resource tags to pods (Recommended) {#forwarding-resouce-tags-to-pods}

To correlate application-level logs, metrics, and traces with Kubernetes metadata
(ex. pod name, namespace, etc.), you'll want to forward the Kubernetes metadata
to your application using the `OTEL_RESOURCE_ATTRIBUTES` environment variable.

Here's an example deployment that forwards the Kubernetes metadata to the
application using environment variables:

```yaml
# my_app_deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
        # Combined with the Kubernetes Attribute Processor, this will ensure
        # the pod's logs and metrics will be associated with a service name.
        service.name: <MY_APP_NAME>
    spec:
      containers:
        - name: app-container
          image: my-image
          env:
            # ... other environment variables
            # Collect K8s metadata from the downward API to forward to the app
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_UID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.uid
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
            - name: NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
            - name: DEPLOYMENT_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.labels['deployment']
            # Forward the K8s metadata to the app via OTEL_RESOURCE_ATTRIBUTES
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
```
