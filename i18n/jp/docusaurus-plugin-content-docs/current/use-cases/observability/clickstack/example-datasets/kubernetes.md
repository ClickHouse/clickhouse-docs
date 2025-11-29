---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Kubernetes の監視'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack ではじめる Kubernetes 監視'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'ログ', 'オブザーバビリティ', 'コンテナ監視']
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

このガイドでは、Kubernetes システムからログとメトリクスを収集し、可視化と分析のために **ClickStack** に送信します。デモデータとしては、必要に応じて公式 OpenTelemetry デモの ClickStack フォークを使用します。

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube 動画プレーヤー" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 前提条件 {#prerequisites}

このガイドを進めるには、次のものが必要です：

- **Kubernetes クラスター**（v1.20 以上を推奨）で、少なくとも 32 GiB の RAM と、1 ノード上に ClickHouse 用として 100 GB の空きディスク容量があること
- **[Helm](https://helm.sh/)** v3 以上
- クラスターを操作できるように設定された **`kubectl`**

## デプロイメントのオプション {#deployment-options}

このガイドは、次のいずれかのデプロイメントオプションで進めることができます。

- **セルフホスト型**: Kubernetes クラスター内に ClickStack を完全にデプロイします（以下を含む）:
  - ClickHouse
  - HyperDX
  - MongoDB（ダッシュボードの状態および設定に使用）

- **クラウドホスト型**: **ClickHouse Cloud** を使用し、HyperDX はクラスター外で管理します。これにより、クラスター内で ClickHouse や HyperDX を実行する必要がなくなります。

アプリケーショントラフィックをシミュレートするために、オプションとして ClickStack フォーク版の [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo) をデプロイできます。これにより、ログ、メトリクス、トレースを含むテレメトリデータが生成されます。すでにクラスター内でワークロードが稼働している場合は、この手順をスキップし、既存のポッド、ノード、コンテナを監視できます。

<VerticalStepper headerLevel="h3">
  ### cert-managerのインストール（オプション）

  セットアップにTLS証明書が必要な場合は、Helmを使用して[cert-manager](https://cert-manager.io/)をインストールします：

  ```shell
  # cert-manager リポジトリを追加 

  helm repo add jetstack https://charts.jetstack.io 

  helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
  ```

  ### OpenTelemetryデモのデプロイ（オプション）

  この**手順は任意であり、監視対象となる既存のポッドがないユーザーを対象としています**。Kubernetes環境に既存のサービスがデプロイされているユーザーはスキップできますが、このデモにはインストルメント化されたマイクロサービスが含まれており、トレースとセッションリプレイのデータを生成するため、ClickStackの全機能を確認できます。

  以下では、オブザーバビリティのテストと計装のデモンストレーションに最適化された、ClickStackフォーク版のOpenTelemetry Demo ApplicationスタックをKubernetesクラスタにデプロイします。バックエンドマイクロサービス、負荷生成ツール、テレメトリパイプライン、サポートインフラストラクチャ(Kafka、Redisなど)、およびClickStackとのSDK統合が含まれます。

  すべてのサービスは`otel-demo`ネームスペースにデプロイされます。各デプロイメントには次の内容が含まれます:

  * OTel と ClickStack SDKs を用いたトレース、メトリクス、ログの自動インストルメンテーション。
  * すべてのサービスは、`my-hyperdx-hdx-oss-v2-otel-collector` という名前の OpenTelemetry コレクター（まだデプロイされていない）に計測データを送信します
  * 環境変数 `OTEL_RESOURCE_ATTRIBUTES` を介してログ、メトリクス、トレースを相関付けるための[リソースタグのポッドへの転送](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)。

  ```shell
  ## デモ用Kubernetesマニフェストファイルをダウンロード
  curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  # wgetを使用する場合
  # wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
  ```

  デモのデプロイ後、すべてのポッドが正常に作成され、`Running` 状態であることを確認してください:

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

  <DemoArchitecture />

  ### ClickStack Helm チャートリポジトリを追加する

  ClickStackをデプロイするには、[公式Helmチャート](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)を使用します。

  HyperDX Helmリポジトリを追加します:

  ```shell
  helm repo add hyperdx https://hyperdxio.github.io/helm-charts
  helm repo update
  ```

  ### ClickStackのデプロイ

  Helm チャートをインストールすると、クラスタに ClickStack をデプロイできます。ClickHouse と HyperDX を含むすべてのコンポーネントを Kubernetes 環境内で実行するか、HyperDX がマネージドサービスとして提供されている ClickHouse Cloud を使用するかを選択できます。

  <br />

  <details>
    <summary>セルフマネージドデプロイメント</summary>

    次のコマンドは、`otel-demo` ネームスペースに ClickStack をインストールします。Helm チャートは以下をデプロイします。

    * ClickHouse インスタンス
    * HyperDX
    * ClickStack ディストリビューションの OTel collector
    * HyperDX アプリケーション状態を保存するための MongoDB

    :::note
    Kubernetes クラスターの構成に応じて、`storageClassName` の値を調整する必要がある場合があります。
    :::

    OTel デモをデプロイしないユーザーは、この設定を変更し、適切なネームスペースを選択できます。

    ```shell
    helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
    ```

    :::warning 本番環境での ClickStack

    このチャートは、ClickHouse と OTel collector もあわせてインストールします。本番環境では、ClickHouse および OTel collector の Operator を使用するか、ClickHouse Cloud を利用することを推奨します。

    ClickHouse と OTel collector を無効化するには、次の値を設定してください:

    ```shell
    helm install myrelease <チャート名またはパス> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
    ```

    :::
  </details>

  <details>
    <summary>ClickHouse Cloud の使用</summary>

    ClickHouse Cloud を利用したい場合は、ClickStack をデプロイして、[同梱の ClickHouse を無効化](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)できます。

    :::note
    現時点では、このチャートは常に HyperDX と MongoDB の両方をデプロイします。これらのコンポーネントは別経路でのアクセス手段を提供しますが、ClickHouse Cloud の認証とは統合されていません。このデプロイメントモデルでは、デプロイ済みの OTel collector 経由でインジェストするために必要な[セキュアなインジェスト API キーへのアクセスを提供](#retrieve-ingestion-api-key)する管理者向けコンポーネントとして想定されており、エンドユーザーに公開すべきではありません。
    :::

    ```shell
    # ClickHouse Cloudの認証情報を指定
    export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # 完全なhttps URL
    export CLICKHOUSE_USER=<CLICKHOUSE_USER>
    export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

    helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
    ```
  </details>

  デプロイメントのステータスを確認するには、以下のコマンドを実行し、すべてのコンポーネントが `Running` 状態であることを確認してください。なお、ClickHouse Cloud を使用している場合、ClickHouse はこの出力には表示されません。

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

  NAME                                                    READY   STATUS    RESTARTS   AGE
  my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
  ```

  ### HyperDX UIへのアクセス

  :::note
  ClickHouse Cloudを使用する場合でも、KubernetesクラスタにデプロイされたローカルのHyperDXインスタンスは引き続き必要です。HyperDXにバンドルされているOpAMPサーバーが管理するインジェストキーを提供し、デプロイされたOTel collectorを通じて安全なインジェストを実現します。この機能は現在、ClickHouse Cloudのホスト版では提供されていません。
  :::

  セキュリティのため、このサービスは`ClusterIP`を使用し、デフォルトでは外部に公開されません。

  HyperDX UIにアクセスするには、ポート3000をローカルポート8080にポートフォワードしてください。

  ```shell
  kubectl port-forward \
   pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
    8080:3000 \
   -n otel-demo
  ```

  [http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

  複雑性要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  ### インジェスト API key を取得する

  ClickStack collectorによってデプロイされたOTel collectorへのインジェストは、インジェストキーで保護されています。

  [`Team Settings`](http://localhost:8080/team) に移動し、`API Keys` セクションから `Ingestion API Key` をコピーします。このインジェスト API key により、OpenTelemetry コレクターを通じたデータインジェストが安全に行われます。

  <Image img={copy_api_key} alt="API キーをコピー" size="lg" />

  ### API キー Kubernetes Secret の作成

  インジェスト API key を含む新しい Kubernetes secret と、ClickStack Helm チャートでデプロイされた OTel collector の場所を含む config map を作成します。後続のコンポーネントは、これを使用して ClickStack Helm チャートでデプロイされた collector へのデータ取り込みを可能にします:

  ```shell
  # インジェスト API key でシークレットを作成
  kubectl create secret generic hyperdx-secret \
  --from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
  -n otel-demo

  # 上記でデプロイした ClickStack OTel collector を指す ConfigMap を作成
  kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
  ```

  インジェスト API key を適用するため、OpenTelemetry Demo Application のポッドを再起動してください。

  ```shell
  kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
  ```

  デモサービスからのトレースおよびログデータが、HyperDXへ流入し始めます。

  <Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes データ" size="lg" />

  ### OpenTelemetry Helmリポジトリを追加する

  Kubernetesメトリクスを収集するために、標準的なOTel collectorをデプロイし、上記のインジェストAPI keyを使用してClickStack collectorへデータを安全に送信するように設定します。

  OpenTelemetry Helmリポジトリをインストールする必要があります:

  ```shell
  # OTel Helmリポジトリを追加
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
  ```

  ### Kubernetesコレクターコンポーネントのデプロイ

  クラスタ全体と各ノードの両方からログとメトリクスを収集するには、それぞれ独自のマニフェストを持つ2つの個別のOpenTelemetryコレクターをデプロイする必要があります。提供される2つのマニフェスト(`k8s_deployment.yaml`と`k8s_daemonset.yaml`)は連携して、Kubernetesクラスタから包括的なテレメトリデータを収集します。

  * `k8s_deployment.yaml` は、**単一の OpenTelemetry Collector インスタンス** をデプロイし、**クラスタ全体のイベントとメタデータ** の収集を担当します。Kubernetes のイベントやクラスタメトリクスを収集し、ポッドのラベルおよびアノテーションをテレメトリーデータに付与してリッチ化します。このコレクターは、重複データを防ぐため、レプリカ数 1 のスタンドアロンなデプロイメントとして実行されます。

  * `k8s_daemonset.yaml` は、クラスター内のすべてのノードで実行される **デーモンセットベースのコレクター** をデプロイします。これは、`kubeletstats`、`hostmetrics`、Kubernetes Attribute Processor などのコンポーネントを使用して、**ノードレベルおよびポッドレベルのメトリクス** に加えてコンテナログを収集します。このコレクターはログにメタデータを付与し、OTLP エクスポーター経由で HyperDX に送信します。

  これらのマニフェストにより、インフラストラクチャからアプリケーションレベルのテレメトリまで、クラスタ全体のフルスタック可観測性が実現され、エンリッチされたデータがClickStackに送信されて一元的な分析が行われます。

  まず、コレクターをデプロイメントとしてインストールします：

  ```shell
  # マニフェストファイルをダウンロード
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
  # Helm チャートをインストール
  helm install --namespace otel-demo k8s-otel-deployment open-telemetry/opentelemetry-collector -f k8s_deployment.yaml
  ```

  <details>
    <summary>k8s&#95;deployment.yaml</summary>

    ```yaml
    # k8s_deployment.yaml
    mode: deployment

    image:
      repository: otel/opentelemetry-collector-contrib
      tag: 0.123.0
     
    # このコレクターは1つのみ必要です - 複数存在するとデータが重複します
    replicaCount: 1
     
    presets:
      kubernetesAttributes:
        enabled: true
        # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。
        # ラベルの正確な名前がキーとして使用されます。
        extractAllPodLabels: true
        # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。
        # アノテーションの正確な名前がキーとして使用されます。
        extractAllPodAnnotations: true
      # Kubernetesイベントを収集するようコレクターを設定します。
      # k8sobject receiverをログパイプラインに追加し、デフォルトでKubernetesイベントを収集します。
      # 詳細: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-objects-receiver
      kubernetesEvents:
        enabled: true
      # クラスターレベルのメトリクスを収集するようKubernetes Cluster Receiverを設定します。
      # k8s_cluster receiverをメトリクスパイプラインに追加し、必要なルールをClusterRoleに追加します。
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

  次に、ノードおよびポッドレベルのメトリクスとログを収集するため、コレクターをデーモンセットとしてデプロイします：

  ```shell
  # マニフェストファイルをダウンロード
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_daemonset.yaml
  # Helm チャートをインストール
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
       
    # kubeletstats の CPU/メモリ使用率メトリクスを使用するために必要
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
      # Kubernetes メタデータを追加するために Kubernetes プロセッサを設定します。
      # すべてのパイプラインに k8sattributes プロセッサを追加し、クラスター ロールに必要なルールを追加します。
      # 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubernetes-attributes-processor
      kubernetesAttributes:
        enabled: true
        # 有効にすると、プロセッサは関連するポッドのすべてのラベルを抽出し、リソース属性として追加します。
        # ラベルの正確な名前がキーになります。
        extractAllPodLabels: true
        # 有効にすると、プロセッサは関連するポッドのすべてのアノテーションを抽出し、リソース属性として追加します。
        # アノテーションの正確な名前がキーになります。
        extractAllPodAnnotations: true
      # キューブレット上の API サーバーからノード、ポッド、コンテナのメトリクスを収集するようにコレクターを設定します。
      # メトリクスパイプラインに kubeletstats レシーバーを追加し、クラスター ロールに必要なルールを追加します。
      # 詳細情報: https://opentelemetry.io/docs/kubernetes/collector/components/#kubeletstats-receiver
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
        # 追加のキューブレットメトリクスを設定
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

  ### HyperDXでKubernetesデータを探索する

  HyperDX UIにアクセスします。Kubernetesにデプロイしたインスタンス、またはClickHouse Cloud経由のいずれかを使用します。

  <p />

  <details>
    <summary>ClickHouse Cloud の使用</summary>

    ClickHouse Cloud を使用する場合は、ClickHouse Cloud サービスにログインし、左側のメニューから「HyperDX」を選択するだけです。自動的に認証されるため、ユーザーを作成する必要はありません。

    データソースの作成を求められたら、作成モーダル内のデフォルト値はすべてそのままにし、Table フィールドに値 `otel_logs` を入力してログ用のソースを作成します。その他の設定は自動検出されるため、`Save New Source` をクリックできます。

    <Image force img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX データソース" size="lg" />

    トレースとメトリクス用のデータソースも作成する必要があります。

    たとえば、トレースおよび OTel メトリクス用のソースを作成するには、上部メニューから `Create New Source` を選択します。

    <Image force img={hyperdx_create_new_source} alt="HyperDX 新しいソースの作成" size="lg" />

    ここからは、必要なソース種別を選択し、続いて適切なテーブルを選択します。たとえばトレースの場合は、テーブル `otel_traces` を選択します。すべての設定は自動検出されます。

    <Image force img={hyperdx_create_trace_datasource} alt="HyperDX トレースソースの作成" size="lg" />

    :::note ソースの相関付け
    ClickStack 内の異なるデータソース（ログやトレースなど）は、互いに相関付けることができる点に注意してください。これを有効にするには、各ソースで追加の設定が必要です。たとえばログソースでは、対応するトレースソースを指定でき、逆にトレースソース側でもログソースを指定できます。詳細については「相関ソース」を参照してください。
    :::
  </details>

  <details>
    <summary>自己管理型デプロイメントを使用する</summary>

    ローカルにデプロイされた HyperDX にアクセスするには、ローカルコマンドを使用してポートフォワーディングを行い、[http://localhost:8080](http://localhost:8080) から HyperDX にアクセスします。

    ```shell
    kubectl port-forward \
     pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
      8080:3000 \
     -n otel-demo
    ```

    :::note 本番環境での ClickStack
    本番環境では、ClickHouse Cloud 上で HyperDX を使用していない場合、TLS 対応のイングレスを使用することを推奨します。例えば、次のとおりです。

    ```shell
    helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
    --set hyperdx.ingress.enabled=true \
    --set hyperdx.ingress.host=your-domain.com \
    --set hyperdx.ingress.tls.enabled=true
    ```

    ::::
  </details>

  Kubernetesデータを確認するには、`/kubernetes`の専用ダッシュボードに移動してください（例: [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)）。

  各タブ(ポッド、ノード、ネームスペース)にデータが入力されている必要があります。
</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse の Kubernetes ダッシュボード" size="lg"/>