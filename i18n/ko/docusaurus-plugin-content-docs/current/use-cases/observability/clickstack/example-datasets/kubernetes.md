---
slug: /use-cases/observability/clickstack/getting-started/kubernetes
title: 'Kubernetes 모니터링'
sidebar_position: 1
pagination_prev: null
pagination_next: null
description: 'ClickStack를 사용한 Kubernetes 모니터링 시작하기'
doc_type: 'guide'
keywords: ['clickstack', 'kubernetes', 'logs', '관측성', '컨테이너 모니터링']
---

import Image from '@theme/IdealImage';
import DemoArchitecture from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_kubernetes_data from '@site/static/images/use-cases/observability/hyperdx-kubernetes-data.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';

이 가이드를 따르면 Kubernetes 시스템에서 로그와 메트릭을 수집하여 시각화 및 분석을 위해 **ClickStack**으로 전송할 수 있습니다. 데모 데이터에는 필요에 따라 공식 OpenTelemetry 데모의 ClickStack 포크를 사용할 수 있습니다.

<iframe width="768" height="432" src="https://www.youtube.com/embed/winI7256Ejk?si=TRThhzCJdq87xg_x" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 사전 준비 사항 \{#prerequisites\}

이 가이드를 따라 진행하려면 다음이 필요합니다.

- **Kubernetes 클러스터**(v1.20+ 권장) 1개: 하나의 노드에 ClickHouse용으로 최소 32 GiB RAM과 100 GB 디스크 공간이 있어야 합니다.
- **[helm](https://helm.sh/)** v3+
- 클러스터와 통신하도록 설정된 **`kubectl`**

## 배포 옵션 \{#deployment-options\}

이 가이드는 다음 두 가지 배포 옵션 중 하나를 사용하여 진행할 수 있습니다.

- **오픈 소스 ClickStack**: 다음 구성 요소를 포함하여 ClickStack 전체를 Kubernetes 클러스터 내에 배포합니다.
  - ClickHouse
  - HyperDX
  - MongoDB(대시보드 상태 및 구성을 저장하는 용도)

- **Managed ClickStack**: ClickHouse와 ClickStack UI(HyperDX)를 ClickHouse Cloud에서 관리합니다. 이를 통해 클러스터 내에서 ClickHouse나 HyperDX를 직접 운영할 필요가 없습니다.

애플리케이션 트래픽을 시뮬레이션하려는 경우, 선택적으로 [**OpenTelemetry Demo Application**](https://github.com/ClickHouse/opentelemetry-demo)의 ClickStack 포크를 배포할 수 있습니다. 이 애플리케이션은 로그, 메트릭, 트레이스를 포함한 텔레메트리 데이터를 생성합니다. 이미 클러스터에서 워크로드를 실행 중인 경우에는 이 단계를 건너뛰고 기존 파드, 노드 및 컨테이너를 모니터링하면 됩니다.

<VerticalStepper headerLevel="h3">
  ### cert-manager 설치(선택 사항)

  TLS 인증서가 필요한 경우, Helm을 사용하여 [cert-manager](https://cert-manager.io/)를 설치하세요:

  ```shell
  # Add Cert manager repo 

  helm repo add jetstack https://charts.jetstack.io 

  helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set startupapicheck.timeout=5m --set installCRDs=true --set global.leaderElection.namespace=cert-manager
  ```

  ### OpenTelemetry 데모 배포하기 (선택 사항)

  이 **단계는 선택 사항이며 모니터링할 기존 파드가 없는 경우를 위한 것입니다**. Kubernetes 환경에 배포된 기존 서비스가 있는 경우 건너뛸 수 있지만, 이 데모에는 트레이스 및 세션 재생 데이터를 생성하는 계측된 마이크로서비스가 포함되어 있어 사용자가 ClickStack의 모든 기능을 탐색할 수 있습니다.

  다음은 관측성 테스트 및 계측 시연을 위해 맞춤 구성된 OpenTelemetry Demo Application 스택의 ClickStack 포크를 Kubernetes 클러스터 내에 배포합니다. 백엔드 마이크로서비스, 부하 생성기, 텔레메트리 파이프라인, 지원 인프라(예: Kafka, Redis) 및 ClickStack과의 SDK 통합이 포함됩니다.

  모든 서비스는 `otel-demo` 네임스페이스에 배포됩니다. 각 배포에는 다음이 포함됩니다:

  * 트레이스, 메트릭, 로그를 위한 OTel 및 ClickStack SDKS를 사용한 자동 계측.
  * 모든 서비스는 계측 데이터를 `my-hyperdx-hdx-oss-v2-otel-collector`라는 OpenTelemetry collector(현재는 배포되지 않음)로 전송합니다
  * `OTEL_RESOURCE_ATTRIBUTES` 환경 변수를 통해 로그, 메트릭 및 트레이스를 연관시키기 위한 [리소스 태그 전달](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods).

  ```shell
  ## download demo Kubernetes manifest file
  curl -O https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  # wget alternative
  # wget https://raw.githubusercontent.com/ClickHouse/opentelemetry-demo/refs/heads/main/kubernetes/opentelemetry-demo.yaml
  kubectl apply --namespace otel-demo -f opentelemetry-demo.yaml
  ```

  데모를 배포한 후, 모든 파드가 성공적으로 생성되었고 `Running` 상태인지 확인하세요:

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

  ### ClickStack Helm 차트 저장소 추가하기

  ClickStack을 배포하려면 [공식 Helm 차트](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm)를 사용합니다.

  이를 위해서는 HyperDX Helm 저장소를 추가해야 합니다:

  ```shell
  helm repo add hyperdx https://hyperdxio.github.io/helm-charts
  helm repo update
  ```

  ### ClickStack 배포하기

  Helm 차트를 설치한 후 클러스터에 ClickStack을 배포할 수 있습니다. ClickHouse와 HyperDX를 포함한 모든 구성 요소를 Kubernetes 환경 내에서 실행하거나, 수집기만 배포하고 ClickHouse 및 HyperDX UI는 Managed ClickStack을 사용할 수 있습니다.

  <br />

  <details>
    <summary>ClickStack 오픈 소스(자가 관리형)</summary>

    다음 명령은 ClickStack을 `otel-demo` 네임스페이스에 설치합니다. Helm 차트는 다음 구성 요소를 배포합니다:

    * ClickHouse 인스턴스
    * HyperDX
    * ClickStack 배포판의 OTel collector
    * HyperDX 애플리케이션 상태 저장을 위한 MongoDB

    :::note
    Kubernetes 클러스터 구성에 따라 `storageClassName` 값을 조정해야 할 수 있습니다.
    :::

    OTel 데모를 배포하지 않는 사용자는 적절한 네임스페이스를 선택하도록 이 값을 수정할 수 있습니다.

    ```shell
    helm install my-hyperdx hyperdx/hdx-oss-v2   --set clickhouse.persistence.dataSize=100Gi --set global.storageClassName="standard-rwo" -n otel-demo
    ```

    :::warning 운영 환경에서 ClickStack

    이 차트는 ClickHouse와 OTel collector도 함께 설치합니다. 운영 환경에서는 ClickHouse 및 OTel collector operator를 사용하거나 Managed ClickStack을 사용할 것을 권장합니다.

    ClickHouse와 OTel collector를 비활성화하려면 다음 값을 설정하십시오:

    ```shell
    helm install myrelease <chart-name-or-path> --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
    ```

    :::
  </details>

  <details>
    <summary>Managed ClickStack</summary>

    Managed ClickStack를 사용하고자 한다면 ClickStack를 배포하면서 [포함된 ClickHouse를 비활성화](https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)할 수 있습니다.

    :::note
    현재 차트는 항상 HyperDX와 MongoDB를 함께 배포합니다. 이 컴포넌트들은 대체 접근 경로를 제공하기는 하지만, ClickHouse Cloud 인증과는 통합되어 있지 않습니다. 이 컴포넌트들은 이 배포 모델에서는 관리자용으로 사용되며, 배포된 OTel collector를 통해 데이터를 수집하는 데 필요한 [보안 수집 키에 접근할 수 있도록](#retrieve-ingestion-api-key) 제공되지만, 최종 사용자에게는 노출되지 않아야 합니다.
    :::

    ```shell
    # specify ClickHouse Cloud credentials
    export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
    export CLICKHOUSE_USER=<CLICKHOUSE_USER>
    export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

    helm install my-hyperdx hyperdx/hdx-oss-v2  --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} --set clickhouse.config.users.otelUserName=${CLICKHOUSE_USER} --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD} --set global.storageClassName="standard-rwo" -n otel-demo
    ```
  </details>

  배포 상태를 확인하려면 다음 명령을 실행하고 모든 구성 요소가 `Running` 상태인지 확인하세요. Managed ClickStack을 사용하는 경우 ClickHouse는 표시되지 않습니다:

  ```shell
  kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2" -n otel-demo

  NAME                                                    READY   STATUS    RESTARTS   AGE
  my-hyperdx-hdx-oss-v2-app-78876d79bb-565tb              1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-clickhouse-57975fcd6-ggnz2        1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-mongodb-984845f96-czb6m           1/1     Running   0          14m
  my-hyperdx-hdx-oss-v2-otel-collector-64cf698f5c-8s7qj   1/1     Running   0          14m
  ```

  ### HyperDX UI에 접근하기

  :::note
  Managed ClickStack을 사용하는 경우에도 Kubernetes 클러스터에 배포된 로컬 HyperDX 인스턴스는 여전히 필요합니다. 로컬 인스턴스는 HyperDX와 함께 번들로 제공되는 OpAMP 서버가 관리하는 수집 키를 제공하며, 배포된 OTel collector를 통한 안전한 수집을 보장합니다. 이 기능은 현재 Managed ClickStack에서 제공되지 않습니다.
  :::

  보안을 위해 서비스는 `클러스터 IP`를 사용하며 기본적으로 외부에 노출되지 않습니다.

  HyperDX UI에 접근하려면 포트 3000을 로컬 포트 8080으로 포워드하세요.

  ```shell
  kubectl port-forward \
   pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
    8080:3000 \
   -n otel-demo
  ```

  [http://localhost:8080](http://localhost:8080)으로 이동하여 HyperDX UI에 접근하세요.

  복잡도 요구사항을 충족하는 사용자 이름과 비밀번호를 제공하여 사용자를 생성하세요.

  <Image img={hyperdx_login} alt="HyperDX UI" size="lg" />

  ### 수집 API key 검색하기

  ClickStack collector에서 배포한 OTel collector로의 수집은 수집 키를 통해 보호됩니다.

  [`Team Settings`](http://localhost:8080/team)로 이동하여 `API Keys` 섹션에서 `Ingestion API Key`를 복사하십시오. 이 API key는 OpenTelemetry collector를 통한 데이터 수집을 안전하게 보장합니다.

  <Image img={copy_api_key} alt="API 키 복사" size="lg" />

  ### API 키 Kubernetes Secret 생성하기

  수집 API key를 포함하는 새로운 Kubernetes secret과 ClickStack Helm 차트로 배포된 OTel collector의 위치를 포함하는 config map을 생성하세요. 이후 구성 요소들은 이를 사용하여 ClickStack Helm 차트로 배포된 collector로 수집할 수 있습니다:

  ```shell
  # create secret with the ingestion API key
  kubectl create secret generic hyperdx-secret \
  --from-literal=HYPERDX_API_KEY=<ingestion_api_key> \
  -n otel-demo

  # create a ConfigMap pointing to the ClickStack OTel collector deployed above
  kubectl create configmap -n=otel-demo otel-config-vars --from-literal=YOUR_OTEL_COLLECTOR_ENDPOINT=http://my-hyperdx-hdx-oss-v2-otel-collector:4318
  ```

  수집 API Key를 반영하기 위해 OpenTelemetry Demo Application 파드를 재시작하세요.

  ```shell
  kubectl rollout restart deployment -n otel-demo -l app.kubernetes.io/part-of=opentelemetry-demo
  ```

  이제 데모 서비스의 트레이스 및 로그 데이터가 HyperDX로 유입됩니다.

  <Image img={hyperdx_kubernetes_data} alt="HyperDX Kubernetes 데이터" size="lg" />

  ### OpenTelemetry Helm 저장소 추가하기

  Kubernetes 메트릭을 수집하기 위해 표준 OTel collector를 배포하고, 위에서 생성한 수집 API key를 사용하여 ClickStack collector로 데이터를 안전하게 전송하도록 구성하세요.

  이를 위해서는 OpenTelemetry Helm 저장소를 설치해야 합니다:

  ```shell
  # Add Otel Helm repo
  helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 
  ```

  ### Kubernetes 수집기 구성 요소 배포하기

  클러스터 자체와 각 노드에서 로그 및 메트릭을 수집하려면 각각 고유한 매니페스트를 가진 두 개의 개별 OpenTelemetry 수집기를 배포해야 합니다. 제공된 두 매니페스트(`k8s_deployment.yaml` 및 `k8s_daemonset.yaml`)는 함께 작동하여 Kubernetes 클러스터에서 포괄적인 텔레메트리 데이터를 수집합니다.

  * `k8s_deployment.yaml`은 **단일 OpenTelemetry Collector 인스턴스**를 배포하며, 이 인스턴스는 **클러스터 전체의 이벤트와 메타데이터를 수집**합니다. Kubernetes 이벤트와 클러스터 메트릭을 수집하고, 파드 레이블과 어노테이션을 활용해 텔레메트리 데이터를 보강합니다. 이 Collector는 데이터 중복을 방지하기 위해 단일 레플리카로 구성된 독립적인 배포로 실행됩니다.

  * `k8s_daemonset.yaml`은(는) 클러스터의 모든 노드에서 실행되는 **데몬셋 기반 수집기**를 배포합니다. 이 수집기는 `kubeletstats`, `hostmetrics`, Kubernetes Attribute Processor와 같은 구성 요소를 사용하여 **노드 수준 및 파드 수준 메트릭**과 컨테이너 로그를 수집합니다. 이러한 수집기는 로그에 메타데이터를 추가하고, 이를 OTLP exporter를 통해 HyperDX로 전송합니다.

  이러한 매니페스트를 함께 사용하면 인프라부터 애플리케이션 수준의 텔레메트리까지 클러스터 전체에 걸친 풀스택 관측성을 구현할 수 있으며, 수집된 데이터를 ClickStack으로 전송하여 중앙 집중식 분석을 수행합니다.

  먼저, 컬렉터를 Deployment로 설치하세요:

  ```shell
  # download manifest file
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/example-datasets/_snippets/k8s_deployment.yaml
  # install the helm chart
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

  다음으로, 노드 및 파드 수준의 메트릭과 로그를 수집하기 위해 컬렉터를 데몬셋으로 배포하세요:

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

  ### HyperDX에서 Kubernetes 데이터 탐색

  HyperDX UI로 이동하세요 - Kubernetes에 배포된 인스턴스를 사용하거나 Managed ClickStack을 통해 접근할 수 있습니다.

  <p />

  <details>
    <summary>관리형 ClickStack</summary>

    관리형 ClickStack을 사용하는 경우 ClickHouse Cloud 서비스에 로그인한 후 왼쪽 메뉴에서 「ClickStack」을 선택하면 됩니다. 자동으로 인증되므로 별도의 사용자 생성은 필요하지 않습니다.

    로그, 메트릭, 트레이스용 데이터 소스가 미리 생성되어 있습니다.
  </details>

  <details>
    <summary>ClickStack 오픈 소스</summary>

    로컬에 배포된 HyperDX에 접속하려면 아래 로컬 명령으로 포트 포워딩을 수행한 뒤 [http://localhost:8080](http://localhost:8080)에서 HyperDX에 접속합니다.

    ```shell
    kubectl port-forward \
     pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}' -n otel-demo) \
      8080:3000 \
     -n otel-demo
    ```

    :::note ClickStack in production
    프로덕션 환경에서는 Managed ClickStack을 사용하지 않는 경우 TLS를 적용한 인그레스를 사용할 것을 권장합니다. 예를 들어 다음과 같습니다:

    ```shell
    helm upgrade my-hyperdx hyperdx/hdx-oss-v2 \
    --set hyperdx.ingress.enabled=true \
    --set hyperdx.ingress.host=your-domain.com \
    --set hyperdx.ingress.tls.enabled=true
    ```

    ::::
  </details>

  Kubernetes 데이터를 탐색하려면 `/kubernetes` 경로의 전용 대시보드로 이동하세요(예: [http://localhost:8080/kubernetes](http://localhost:8080/kubernetes)).

  파드(Pods), 노드(Nodes), 네임스페이스(Namespaces) 각 탭에 데이터가 채워져야 합니다.
</VerticalStepper>

<Image img={dashboard_kubernetes} alt="ClickHouse Kubernetes 대시보드" size="lg"/>