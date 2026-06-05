---
slug: /use-cases/observability/clickstack/monitoring-kubernetes
title: 'Kubernetesの監視'
description: 'Kubernetes クラスターからログ、インフラストラクチャ メトリクス、イベントを Managed ClickStack に収集します'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'k8s', 'マネージド', 'オブザーバビリティ', 'ログ', 'メトリクス', 'イベント', 'デーモンセット', 'helm']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import clickstack_search_with_k8_logs from '@site/static/images/use-cases/observability/clickstack-search-with-k8-logs.png';
import clickstack_dashboard_kubernetes from '@site/static/images/use-cases/observability/clickstack-dashboard-kubernetes.png';

このガイドでは、クラスターからログ、インフラストラクチャメトリクス、Kubernetes イベントを Managed ClickStack に収集し、組み込みの Kubernetes ダッシュボードで表示する方法を説明します。

この構成は、標準的な OpenTelemetry パターンです。[OpenTelemetry Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) を使って 2 つの collector をデプロイし、それぞれが OTLP 経由で ClickStack のゲートウェイ collector に転送します。**デーモンセット** は各ノードで実行され、コンテナログとキューブレットのメトリクスを収集します。単一レプリカの **デプロイメント** は、Kubernetes イベントとクラスター全体のメトリクスを収集します。ゲートウェイ ロールの詳細については、[Collector roles](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) を参照してください。

このガイドでは、[OpenTelemetry Collector のセットアップ](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) を完了しており、ClickStack のゲートウェイ collector が稼働していることを前提としています。

Kubernetes 上で動作するワークロードでは、ゲートウェイ collector 自体も **ClickStack collector イメージを使用して、同じクラスター内に公式の OpenTelemetry Helm チャートで** デプロイする必要があります。インストールするには、[collector のデプロイ](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector) の Helm を使う手順に従ってください。**この OTLP エンドポイントは必ず控えておいてください**。

<VerticalStepper headerLevel="h2">
  ## 前提条件を確認する \{#gather-prerequisites\}

  以下が必要です：

  * `kubectl` が設定済みの **Kubernetes クラスター** (v1.20+ を推奨) 。
  * **[Helm](https://helm.sh/) v3+**。
  * クラスター内からアクセス可能な ClickStack ゲートウェイ collector の **OTLP エンドポイント**。たとえば `http://clickstack-otel-collector.observability.svc.cluster.local:4318` です。collector は、デーモンセットとデプロイメントの両方から到達可能な場所にデプロイする必要があります。通常は同じクラスター内、または `LoadBalancer` 型の service 経由で到達できる場所に配置します。
  * ゲートウェイ collector のデプロイ時に設定した `OTLP_AUTH_TOKEN` の値です。collector を保護していない場合は、以下のシークレット作成手順を省略し、マニフェストから `authorization` ヘッダーを削除できます。

  :::note ゲートウェイの実行場所
  クラスター内デプロイメントの場合は、ゲートウェイcollectorをKubernetesの`Deployment`または`StatefulSet`として同一クラスター内で実行し、クラスター内サービスDNSを通じてアドレス指定します。クラスター外で実行するゲートウェイの場合は、外部からアクセス可能なURLを使用してください。
  :::

  ## 認証シークレットとConfigMapの作成 \{#create-secret-and-configmap\}

  collectorを配置するネームスペースを選択し、`OTLP_AUTH_TOKEN`を格納するシークレットとゲートウェイを指定するConfigMapを作成します。

  ```shell
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  export OTEL_COLLECTOR_ENDPOINT="http://clickstack-otel-collector.observability.svc.cluster.local:4318"
  export NAMESPACE=observability

  kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

  kubectl create secret generic clickstack-otlp-secret \
    --from-literal=OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
    -n ${NAMESPACE}

  kubectl create configmap otel-config-vars \
    --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=${OTEL_COLLECTOR_ENDPOINT} \
    -n ${NAMESPACE}
  ```

  以下の両方のcollectorは`extraEnvs`を通じてこれらの値を読み取るため、同じSecretとConfigMapが共有されます。

  ## OpenTelemetry Helm リポジトリの追加 \{#add-otel-helm-repo\}

  ```shell
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
  helm repo update
  ```

  ## クラスター collectorのデプロイ \{#deploy-cluster-collector\}

  これは、**Kubernetesイベント**と**クラスター全体のメトリクス** (ノード数、ポッドのフェーズ、デプロイメントのステータスなど) を収集する単一レプリカのデプロイメントです。複数のレプリカを実行すると、重複が発生します。

  以下を `k8s_deployment.yaml` として保存します：

  <details>
    <summary>`k8s_deployment.yaml`</summary>

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
        extractAllPodLabels: true
        extractAllPodAnnotations: true
      # Collects Kubernetes events via the k8sobject receiver.
      kubernetesEvents:
        enabled: true
      # Collects cluster-level metrics via the k8s_cluster receiver.
      clusterMetrics:
        enabled: true

    extraEnvs:
      - name: OTLP_AUTH_TOKEN
        valueFrom:
          secretKeyRef:
            name: clickstack-otlp-secret
            key: OTLP_AUTH_TOKEN
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
            authorization: "${env:OTLP_AUTH_TOKEN}"
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

  インストール:

  ```shell
  helm install k8s-otel-deployment open-telemetry/opentelemetry-collector \
    -f k8s_deployment.yaml \
    -n ${NAMESPACE}
  ```

  ## node collectorのデプロイ \{#deploy-node-collector\}

  これは、**コンテナーログ**、**ホストメトリクス**、および**キューブレットメトリクス** (ポッドおよびコンテナーごとのリクエストとリミットに対するCPUおよびメモリ使用率) を収集するために、すべてのノード上で実行されるデーモンセットです。

  以下を `k8s_daemonset.yaml` として保存します：

  <details>
    <summary>`k8s_daemonset.yaml`</summary>

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
      kubernetesAttributes:
        enabled: true
        extractAllPodLabels: true
        extractAllPodAnnotations: true
      kubeletMetrics:
        enabled: true

    extraEnvs:
      - name: OTLP_AUTH_TOKEN
        valueFrom:
          secretKeyRef:
            name: clickstack-otlp-secret
            key: OTLP_AUTH_TOKEN
            optional: true
      - name: YOUR_OTEL_COLLECTOR_ENDPOINT
        valueFrom:
          configMapKeyRef:
            name: otel-config-vars
            key: YOUR_OTEL_COLLECTOR_ENDPOINT

    config:
      receivers:
        # Additional kubelet metrics expressed as utilisation against requests and limits.
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
            authorization: "${env:OTLP_AUTH_TOKEN}"

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

  インストール:

  ```shell
  helm install k8s-otel-daemonset open-telemetry/opentelemetry-collector \
    -f k8s_daemonset.yaml \
    -n ${NAMESPACE}
  ```

  両方のリリースが正常な状態であることを確認します：

  ```shell
  kubectl get pods -n ${NAMESPACE} -l app.kubernetes.io/name=opentelemetry-collector
  ```

  各ノードにデプロイメントのポッドが1つとデーモンセットのポッドが1つ表示され、すべて `Running` 状態になっているはずです。

  ## Kubernetesの属性をアプリに転送する (推奨) \{#forward-k8s-attributes\}

  アプリケーションのログ、メトリクス、トレースをKubernetesメタデータ (ポッド名、ネームスペース、ノード、デプロイメント) と相関付けるには、`OTEL_RESOURCE_ATTRIBUTES` を使用してメタデータをアプリケーションに転送してください。デーモンセットの `k8sattributes` プロセッサーが、受信したテレメトリーに対して一致するポッドおよびノードのアトリビュートを付与します。

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
          service.name: <MY_APP_NAME>
      spec:
        containers:
          - name: app-container
            image: my-image
            env:
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
              - name: OTEL_RESOURCE_ATTRIBUTES
                value: k8s.pod.name=$(POD_NAME),k8s.pod.uid=$(POD_UID),k8s.namespace.name=$(POD_NAMESPACE),k8s.node.name=$(NODE_NAME),k8s.deployment.name=$(DEPLOYMENT_NAME)
  ```

  ## ClickStack UIで確認する \{#confirm-in-ui\}

  [ClickHouse Cloud console](https://console.clickhouse.cloud) でサービスを開き、左側のメニューから **ClickStack** を選択します。

  <Image img={clickstack_cloud} size="lg" alt="ClickStack を起動する" border />

  **Search** ビューで、ログソースを `Logs` に切り替え、時間範囲を **Last 15 minutes** に設定します。クラスター全体のコンテナーログが数秒以内に表示され、`k8s.namespace.name`、`k8s.pod.name`、`k8s.node.name` などのアトリビュートが付与された状態で確認できます。

  <Image img={clickstack_search_with_k8_logs} size="lg" alt="Kubernetesログを表示したClickStackのSearch view" />

  インフラストラクチャのメトリクスとイベントをコンテキストで確認するには、**Dashboards** -&gt; **Kubernetes** に移動して、組み込みの **Kubernetes** ダッシュボードを開いてください。`Pods`、`Nodes`、`Namespaces` の各タブにデータが入力されているはずです。

  <Image img={clickstack_dashboard_kubernetes} size="lg" alt="ClickStack Kubernetesダッシュボード" border />

  何も表示されない場合：

  * デーモンセットとデプロイメントのポッドが `Running` 状態であることを確認し、`kubectl logs -n ${NAMESPACE} <pod>` でそれらのログを追って確認します。
  * `YOUR_OTEL_COLLECTOR_ENDPOINT` にクラスター内から到達できることを確認します (collector のポッドの 1 つに `kubectl exec` で入り、`curl` で確認します) 。
  * シークレット内の `OTLP_AUTH_TOKEN` が、ゲートウェイ collector に設定した値と一致していることを確認してください。

  ## 参考資料 \{#further-reading\}

  * [Kubernetes インテグレーション リファレンス](/use-cases/observability/clickstack/integrations/kubernetes) で、receiver、プロセッサ、チューニングオプションの完全な一覧を参照してください。
  * アプリケーション側でのエンリッチメントの詳細については、[リソースタグをポッドに転送する](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)を参照してください。
  * [collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) OTLP エンドポイントでの TLS と最小権限のインジェストユーザー。
  * 想定スループットでのゲートウェイおよびエージェントのデプロイメント向け[リソース見積もり](/use-cases/observability/clickstack/ingesting-data/otel-collector#estimating-resources)。
  * 本番環境への移行時の推奨事項については、[本番環境への移行](/use-cases/observability/clickstack/production)を参照してください。
</VerticalStepper>