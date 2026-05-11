---
slug: /use-cases/observability/clickstack/integrations/kubernetes
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け Kubernetes 連携 - ClickHouse オブザーバビリティスタック'
title: 'Kubernetes'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', 'observability', 'container monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は OpenTelemetry (OTel) collector を使用して、Kubernetes クラスターからログ、メトリクス、Kubernetes イベントを収集し、それらを ClickStack に転送します。ネイティブな OTel ログ形式をサポートしており、追加のベンダー固有設定は不要です。

このガイドで対象とするのは、次のデータです:

* **ログ**
* **インフラメトリクス**

:::note
アプリケーションレベルのメトリクスや APM/トレースを送信するには、対応する言語インテグレーションをアプリケーション側にも追加する必要があります。
:::

このガイドでは、[ClickStack OTel collector をゲートウェイとしてデプロイ](/use-cases/observability/clickstack/ingesting-data/otel-collector)し、インジェスト API key で保護していることを前提とします。


## OTel Helm チャートの設定ファイルを作成する \{#creating-the-otel-helm-chart-config-files\}

各ノードとクラスター自体の両方からログとメトリクスを収集するために、2 種類の OpenTelemetry コレクターをデプロイする必要があります。1 つは各ノードからログとメトリクスを収集するためにデーモンセットとしてデプロイし、もう 1 つはクラスター自体からログとメトリクスを収集するためにデプロイメントとしてデプロイします。

### API key Secret の作成 \{#create-api-key-secret\}

HyperDX で発行した [インジェスト API key](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data) を使用して、新しい Kubernetes Secret を作成します。これは、以下でインストールするコンポーネントが ClickStack の OTel collector へ安全にインジェストするために使用されます。

```shell
kubectl create secret generic hyperdx-secret \
--from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
```

さらに、ClickStack の OTel collector の場所を指定する ConfigMap を作成します:

```shell
kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=<OTEL_COLLECTOR_ENDPOINT>
# e.g. kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
```


### デーモンセット構成の作成 \{#creating-the-daemonset-configuration\}

デーモンセットは、クラスター内の各ノードからログとメトリクスを収集しますが、Kubernetes イベントやクラスター全体のメトリクスは収集しません。

デーモンセットのマニフェストをダウンロードします:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
```


<Tabs groupId="daemonset-configs">
  <TabItem value="clickstack-managed" label="マネージド版 ClickStack" default>
    <details>
      <summary>`k8s_daemonset.yaml`</summary>

      ```yaml
      # daemonset.yaml
      mode: daemonset

      # kubeletstats の CPU/メモリ使用率メトリクスを利用するために必須
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
        # Kubernetes プロセッサーを構成して Kubernetes メタデータを追加します。
        # すべてのパイプラインに k8sattributes プロセッサーを追加し、クラスター ロールに必要なルールを追加します。
        # 詳細は https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor を参照してください。
        kubernetesAttributes:
          enabled: true
          # 有効化すると、プロセッサーは関連するポッドのすべてのラベルを取得し、
          # それらをリソース属性として追加します。
          # ラベルの正確な名前がキーとして使用されます。
          extractAllPodLabels: true
          # 有効化すると、プロセッサーは関連するポッドのすべてのアノテーションを取得し、
          # それらをリソース属性として追加します。
          # アノテーションの正確な名前がキーとして使用されます。
          extractAllPodAnnotations: true
        # コレクターを構成して、キューブレット上の API サーバーからノード、ポッド、およびコンテナのメトリクスを収集します。
        # metrics パイプラインに kubeletstats receiver を追加し、クラスター ロールに必要なルールを追加します。
        # 詳細は https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver を参照してください。
        kubeletMetrics:
          enabled: true

      extraEnvs:
        - name: YOUR_OTEL_COLLECTOR_ENDPOINT
          valueFrom:
            configMapKeyRef:
              name: otel-config-vars
              key: YOUR_OTEL_COLLECTOR_ENDPOINT

      config:
        receivers:
          # 追加の kubelet メトリクスを構成します。
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
  </TabItem>

  <TabItem value="clickstack-oss" label="ClickStack オープンソース版">
    <details>
      <summary>`k8s_daemonset.yaml`</summary>

      ```yaml
      # daemonset.yaml
      mode: daemonset

      # kubeletstats の CPU/メモリ使用率メトリクスを利用するために必須
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
        # Kubernetes メタデータを追加するための Kubernetes Processor を構成します。
        # すべてのパイプラインに k8sattributes プロセッサーを追加し、必要なルールをクラスター ロールに追加します。
        # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
        kubernetesAttributes:
          enabled: true
          # 有効にすると、このプロセッサーは関連付けられたポッドのすべてのラベルを抽出し、リソース属性として追加します。
          # ラベルの正確な名前がキーとして使用されます。
          extractAllPodLabels: true
          # 有効にすると、このプロセッサーは関連付けられたポッドのすべてのアノテーションを抽出し、リソース属性として追加します。
          # アノテーションの正確な名前がキーとして使用されます。
          extractAllPodAnnotations: true
        # コレクターを構成し、キューブレット上の API サーバーからノード、ポッド、およびコンテナのメトリクスを収集します。
        # kubeletstats レシーバーをメトリクス パイプラインに追加し、必要なルールをクラスター ロールに追加します。
        # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
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
          # 追加の kubelet メトリクスを収集するように構成します。
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
            headers:
              authorization: "${env:HYPERDX_API_KEY}"
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
    </details>
  </TabItem>
</Tabs>

### デプロイメント設定の作成 \{#creating-the-deployment-configuration\}

Kubernetes のイベントおよびクラスター全体のメトリクスを収集するには、別の OpenTelemetry コレクターをデプロイメントとしてデプロイする必要があります。

デプロイメントマニフェストをダウンロードします:

```shell
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
```


<Tabs groupId="deployment-configs">
<TabItem value="clickstack-managed" label="マネージド ClickStack" default>

<details>
<summary>k8s_deployment.yaml</summary>

```yaml
# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
 
# このコレクターは 1 つだけにします。複数起動すると重複したデータが生成されます。
replicaCount: 1
 
presets:
  kubernetesAttributes:
    enabled: true
    # 有効化すると、関連付けられたポッドのすべての label を抽出し、リソース属性として追加します。
    # label の完全な名前がキーとして使用されます。
    extractAllPodLabels: true
    # 有効化すると、関連付けられたポッドのすべての annotation を抽出し、リソース属性として追加します。
    # annotation の完全な名前がキーとして使用されます。
    extractAllPodAnnotations: true
  # コレクターを構成して Kubernetes イベントを収集します。
  # logs パイプラインに k8sobject receiver を追加し、デフォルトで Kubernetes イベントを収集します。
  # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Kubernetes Cluster Receiver を構成してクラスター単位のメトリクスを収集します。
  # metrics パイプラインに k8s_cluster receiver を追加し、ClusterRole に必要なルールを追加します。
  # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
  clusterMetrics:
    enabled: true

extraEnvs:
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

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack オープンソース">

<details>
<summary>k8s_deployment.yaml</summary>

```yaml
# deployment.yaml
mode: deployment

image:
  repository: otel/opentelemetry-collector-contrib
  tag: 0.123.0
 
# このコレクターは 1 つだけにします。複数起動すると重複したデータが生成されます。
replicaCount: 1
 
presets:
  kubernetesAttributes:
    enabled: true
    # 有効化すると、関連付けられたポッドのすべての label を抽出し、リソース属性として追加します。
    # label の完全な名前がキーとして使用されます。
    extractAllPodLabels: true
    # 有効化すると、関連付けられたポッドのすべての annotation を抽出し、リソース属性として追加します。
    # annotation の完全な名前がキーとして使用されます。
    extractAllPodAnnotations: true
  # コレクターを構成して Kubernetes イベントを収集します。
  # logs パイプラインに k8sobject receiver を追加し、デフォルトで Kubernetes イベントを収集します。
  # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
  kubernetesEvents:
    enabled: true
  # Kubernetes Cluster Receiver を構成してクラスター単位のメトリクスを収集します。
  # metrics パイプラインに k8s_cluster receiver を追加し、ClusterRole に必要なルールを追加します。
  # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-cluster-receiver
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

</TabItem>
</Tabs>

## OpenTelemetry Collector のデプロイ \{#deploying-the-otel-collector\}

OpenTelemetry Collector は、[OpenTelemetry Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) を使用して Kubernetes クラスターにデプロイできるようになりました。

OpenTelemetry の Helm リポジトリを追加します:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts # Add OTel Helm repo
```

上記の設定でチャートをインストールします。

```shell copy
helm install my-opentelemetry-collector-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
helm install my-opentelemetry-collector-daemonset open-telemetry/opentelemetry-collector -f k8s_daemonset.yaml
```

これで、Kubernetes クラスターのメトリクス、ログ、および Kubernetes イベントが HyperDX に表示されるようになっているはずです。


## リソースタグをポッドに転送する (推奨) \{#forwarding-resouce-tags-to-pods\}

アプリケーションレベルのログ、メトリクス、トレースを Kubernetes メタデータ
（例: ポッド名、ネームスペース など）と相関付けるには、`OTEL_RESOURCE_ATTRIBUTES`
環境変数を使用して Kubernetes メタデータをアプリケーションに転送する必要があります。

以下は、環境変数を使用して Kubernetes メタデータをアプリケーションに
転送するデプロイメントの例です。

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
