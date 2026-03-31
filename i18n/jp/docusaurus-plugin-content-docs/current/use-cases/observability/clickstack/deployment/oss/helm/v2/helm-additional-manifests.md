---
slug: /use-cases/observability/clickstack/deployment/helm-additional-manifests
title: 'Helm 追加マニフェスト'
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'additionalManifests を使用して、ClickStack Helm チャートとあわせてカスタム Kubernetes オブジェクトをデプロイする'
doc_type: 'guide'
keywords: ['ClickStack 追加マニフェスト', 'Helm カスタムリソース', 'NetworkPolicy', 'HPA', 'ALB イングレス', 'Kubernetes']
---

:::note Chart version 2.x のみ
`additionalManifests` 機能は、サブチャートベースの **v2.x** Helm チャートでのみ使用できます。
:::

`additionalManifests` を使うと、ClickStack チャートとあわせて任意の Kubernetes オブジェクトをデプロイできます。これは、`NetworkPolicy`、`HorizontalPodAutoscaler`、`ServiceAccount`、`PodMonitor`、カスタム `Ingress` オブジェクトなど、チャートが標準ではテンプレート化していないリソースや、そのほかの Kubernetes API オブジェクトに使用します。

## 仕組み \{#how-it-works\}

`additionalManifests` の各エントリは、完全な Kubernetes リソース定義です。このチャートでは、次の処理を行います。

1. リスト内の各エントリを順に処理します
2. エントリを YAML に変換します (`toYaml`)
3. Helm の `tpl` を使用して、その YAML 内のテンプレート式を評価します

テンプレート式では、次を参照できます。

* `.Release.Name`, `.Release.Namespace`
* `include "clickstack.fullname" .` とその他のチャートヘルパー
* `.Values.*`

```yaml
additionalManifests:
  - apiVersion: v1
    kind: ConfigMap
    metadata:
      name: '{{ include "clickstack.fullname" . }}-custom'
    data:
      release: '{{ .Release.Name }}'
```

## Values ファイルの制約 \{#values-file-constraints\}

`additionalManifests` は values ファイルで設定します。values ファイルは、`tpl` の実行前に YAML として解析されます。

* values ファイル内の `{{ ... }}` は、必ず引用符で囲まれた文字列内に記述する必要があります
* 構造的なテンプレートブロックは、有効な values YAML ではありません (例: `{{- include ... | nindent ... }}` 単体)
* 非文字列フィールド (例: 数値のポート) には、リテラル値または名前付きポートを使用します
* 構造的なテンプレート処理が必要な場合は、生の values ファイルではなく、ラッパーチャートのテンプレートを使用します

```yaml
# Valid in values.yaml
name: '{{ include "clickstack.fullname" . }}-app'

# Invalid in values.yaml (unquoted template expression)
name: {{ include "clickstack.fullname" . }}-app

# Invalid in values.yaml (structural template block)
labels:
  {{- include "clickstack.labels" . | nindent 2 }}
```

## 利用可能な チャート ヘルパー \{#available-chart-helpers\}

これらのヘルパーは `templates/_helpers.tpl` で定義されています。

| Helper                           | 説明                    | Values ファイルでの使用         |
| -------------------------------- | --------------------- | ----------------------- |
| `clickstack.name`                | チャート 名 (63 文字に切り詰め)  | クォート付きスカラーで安全に使用可能      |
| `clickstack.fullname`            | リリース修飾付きの名前           | クォート付きスカラーで安全に使用可能      |
| `clickstack.chart`               | チャート 名 + バージョン       | クォート付きスカラーで安全に使用可能      |
| `clickstack.selectorLabels`      | セレクターラベルのブロック         | ラッパーチャート のテンプレートでのみ使用 |
| `clickstack.labels`              | 標準ラベルのブロック            | ラッパーチャート のテンプレートでのみ使用 |
| `clickstack.mongodb.fullname`    | MongoDB CR 名          | クォート付きスカラーで安全に使用可能      |
| `clickstack.clickhouse.fullname` | ClickHouse CR 名       | クォート付きスカラーで安全に使用可能      |
| `clickstack.otel.fullname`       | OTel collector 名      | クォート付きスカラーで安全に使用可能      |

## 例 \{#examples\}

### ServiceAccount \{#serviceaccount\}

```yaml
additionalManifests:
  - apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: '{{ include "clickstack.fullname" . }}'
      namespace: '{{ .Release.Namespace }}'
      labels:
        app.kubernetes.io/name: '{{ include "clickstack.name" . }}'
        app.kubernetes.io/instance: '{{ .Release.Name }}'
      annotations:
        eks.amazonaws.com/role-arn: "arn:aws:iam::123456789:role/my-role"
```

### NetworkPolicy \{#networkpolicy\}

HyperDX ポッドへのインバウンドトラフィックを制限します:

```yaml
additionalManifests:
  - apiVersion: networking.k8s.io/v1
    kind: NetworkPolicy
    metadata:
      name: '{{ include "clickstack.fullname" . }}-allow-ingress'
    spec:
      podSelector:
        matchLabels:
          app.kubernetes.io/name: '{{ include "clickstack.name" . }}'
          app.kubernetes.io/instance: '{{ .Release.Name }}'
      policyTypes:
        - Ingress
      ingress:
        - from:
            - namespaceSelector:
                matchLabels:
                  kubernetes.io/metadata.name: ingress-nginx
          ports:
            - protocol: TCP
              port: 3000
            - protocol: TCP
              port: 8000
```

### HorizontalPodAutoscaler \{#horizontalpodautoscaler\}

```yaml
additionalManifests:
  - apiVersion: autoscaling/v2
    kind: HorizontalPodAutoscaler
    metadata:
      name: '{{ include "clickstack.fullname" . }}-hpa'
    spec:
      scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: '{{ include "clickstack.fullname" . }}-app'
      minReplicas: 2
      maxReplicas: 10
      metrics:
        - type: Resource
          resource:
            name: cpu
            target:
              type: Utilization
              averageUtilization: 75
```

### PodMonitor (Prometheus Operator) \{#podmonitor\}

```yaml
additionalManifests:
  - apiVersion: monitoring.coreos.com/v1
    kind: PodMonitor
    metadata:
      name: '{{ include "clickstack.fullname" . }}'
      labels:
        release: prometheus
    spec:
      selector:
        matchLabels:
          app.kubernetes.io/name: '{{ include "clickstack.name" . }}'
          app.kubernetes.io/instance: '{{ .Release.Name }}'
      podMetricsEndpoints:
        - port: app
          interval: 30s
```

### AWS ALB イングレス \{#aws-alb-ingress\}

[AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)を使用する場合は、チャートに組み込まれた nginx イングレスを無効にし、独自の ALB イングレスを定義します：

```yaml
hyperdx:
  ingress:
    enabled: false

additionalManifests:
  - apiVersion: networking.k8s.io/v1
    kind: Ingress
    metadata:
      name: '{{ include "clickstack.fullname" . }}-alb'
      annotations:
        alb.ingress.kubernetes.io/scheme: internet-facing
        alb.ingress.kubernetes.io/target-type: ip
        alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:us-east-1:123456789:certificate/abc-123"
        alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
        alb.ingress.kubernetes.io/ssl-redirect: "443"
        alb.ingress.kubernetes.io/group.name: clickstack
        alb.ingress.kubernetes.io/healthcheck-path: /api/health
    spec:
      ingressClassName: alb
      rules:
        - host: clickstack.example.com
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: '{{ include "clickstack.fullname" . }}-app'
                    port:
                      name: app
```

内部 OTel collector 用イングレスと HPA を含む完全な ALB 設定例については、[ALB example values](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress)を参照してください。

### TargetGroupBinding \{#targetgroupbinding\}

`TargetGroupBinding` リソースを明示的に必要とする ALB の構成では、

```yaml
additionalManifests:
  - apiVersion: elbv2.k8s.aws/v1beta1
    kind: TargetGroupBinding
    metadata:
      name: '{{ include "clickstack.fullname" . }}-tgb'
    spec:
      serviceRef:
        name: '{{ include "clickstack.fullname" . }}-app'
        port: app
      targetGroupARN: "arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/my-tg/abc123"
      targetType: ip
```

## 応用: ラッパーチャートのテンプレート \{#advanced-wrapper-chart-templates\}

`include "clickstack.labels" . | nindent 4` のような構造に関するヘルパーが必要な場合は、それらのブロックを values ファイルに直接記述するのではなく、ラッパーチャートのテンプレート (`templates/*.yaml`) でレンダリングしてください。

ラッパーチャートテンプレートのスニペット例:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "clickstack.fullname" . }}-extra
  labels:
    {{- include "clickstack.labels" . | nindent 4 }}
data:
  appPort: "{{ .Values.hyperdx.ports.app }}"
```

## ヒント \{#tips\}

### Helm フック \{#helm-hooks\}

各 `additionalManifests` エントリは、それぞれ独立した YAML ドキュメントとしてレンダリングされます。インストール/アップグレード時の適用順序を制御するには、Helm フックのアノテーションを追加します。

```yaml
additionalManifests:
  - apiVersion: batch/v1
    kind: Job
    metadata:
      name: post-install-job
      annotations:
        helm.sh/hook: post-install
        helm.sh/hook-delete-policy: hook-succeeded
    spec:
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: migrate
              image: my-migration-image:latest
              command: ["./migrate.sh"]
```

### CRD の順序 \{#crd-ordering\}

追加マニフェストにカスタムリソース (たとえば `PodMonitor`) が含まれている場合、インストールまたはアップグレードを実行する前に、それらの CRD があらかじめクラスタ内に存在している必要があります。

### 複数のリソースを組み合わせる \{#combining-multiple-resources\}

`additionalManifests` はリストです。各エントリはリストの順序でレンダリングされ、それぞれが独立した YAML ドキュメントになります。

## 次のステップ \{#next-steps\}

* [Helm ガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本インストール
* [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレス
* [Cloud デプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の構成
* [ClickStack Helm チャートのリポジトリ](https://github.com/ClickHouse/ClickStack-helm-charts) - チャートのソースコードと values のリファレンス