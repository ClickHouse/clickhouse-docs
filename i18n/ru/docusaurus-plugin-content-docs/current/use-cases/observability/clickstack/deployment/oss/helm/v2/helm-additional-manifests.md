---
slug: /use-cases/observability/clickstack/deployment/helm-additional-manifests
title: 'Дополнительные манифесты Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Развертывание пользовательских объектов Kubernetes вместе с Helm-чартом ClickStack с помощью additionalManifests'
doc_type: 'guide'
keywords: ['Дополнительные манифесты ClickStack', 'Пользовательские ресурсы Helm', 'NetworkPolicy', 'HPA', 'Входной шлюз ALB', 'Kubernetes']
---

:::note Только для версии чарта 2.x
Функция `additionalManifests` доступна только в Helm-чарте **v2.x** на основе субчартов.
:::

Параметр `additionalManifests` позволяет развертывать произвольные объекты Kubernetes вместе с чартом ClickStack. Используйте его для ресурсов, для которых в чарте нет встроенных шаблонов, например `NetworkPolicy`, `HorizontalPodAutoscaler`, `ServiceAccount`, `PodMonitor`, пользовательских объектов `Ingress` или любых других объектов Kubernetes API.

## Как это работает \{#how-it-works\}

Каждая запись в `additionalManifests` — это полное определение ресурса Kubernetes. Чарт:

1. Обрабатывает по очереди каждую запись в списке
2. Преобразует запись в YAML (`toYaml`)
3. Вычисляет выражения шаблона в этом YAML с помощью Helm `tpl`

Выражения шаблона могут ссылаться на:

* `.Release.Name`, `.Release.Namespace`
* `include "clickstack.fullname" .` и другие хелперы чарта
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

## Ограничения файла values \{#values-file-constraints\}

`additionalManifests` настраивается в файле values, а файлы values обрабатываются как YAML до запуска `tpl`.

* Любые `{{ ... }}` в файле values должны находиться внутри строки в кавычках
* Структурные блоки шаблонов недопустимы в YAML-файле values (например, `{{- include ... | nindent ... }}` сам по себе)
* Для нестроковых полей (например, числовых портов) используйте литеральные значения или именованные порты
* Если вам нужна структурная шаблонизация, используйте шаблон обёрточного чарта вместо обычного файла values

```yaml
# Valid in values.yaml
name: '{{ include "clickstack.fullname" . }}-app'

# Invalid in values.yaml (unquoted template expression)
name: {{ include "clickstack.fullname" . }}-app

# Invalid in values.yaml (structural template block)
labels:
  {{- include "clickstack.labels" . | nindent 2 }}
```

## Доступные хелперы чарта \{#available-chart-helpers\}

Эти хелперы определены в `templates/_helpers.tpl`:

| Хелпер                           | Описание                           | Использование в файле values                           |
| -------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `clickstack.name`                | Имя чарта (усечено до 63 символов) | Безопасно использовать в строковых скалярах в кавычках |
| `clickstack.fullname`            | Имя с учётом релиза                | Безопасно использовать в строковых скалярах в кавычках |
| `clickstack.chart`               | Имя чарта + версия                 | Безопасно использовать в строковых скалярах в кавычках |
| `clickstack.selectorLabels`      | Блок меток селектора               | Только для шаблонов wrapper чарта                      |
| `clickstack.labels`              | Стандартный блок меток             | Только для шаблонов wrapper чарта                      |
| `clickstack.mongodb.fullname`    | Имя CR MongoDB                     | Безопасно использовать в строковых скалярах в кавычках |
| `clickstack.clickhouse.fullname` | Имя CR ClickHouse                  | Безопасно использовать в строковых скалярах в кавычках |
| `clickstack.otel.fullname`       | Имя OTel collector                 | Безопасно использовать в строковых скалярах в кавычках |

## Примеры \{#examples\}

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

Ограничьте входящий трафик к подам HyperDX:

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

### Входной шлюз AWS ALB \{#aws-alb-ingress\}

При использовании [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) отключите встроенный в чарт входной шлюз nginx и настройте пользовательский входной шлюз ALB:

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

Полный пример настройки ALB, включая внутренний входной шлюз OTel collector и HPA, см. в [примере значений ALB](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress).

### TargetGroupBinding \{#targetgroupbinding\}

В сценариях с ALB, где требуются явные ресурсы `TargetGroupBinding`:

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

## Продвинутое: шаблоны обёрточных чартов \{#advanced-wrapper-chart-templates\}

Если вам нужны структурные хелперы, такие как `include "clickstack.labels" . | nindent 4`, генерируйте их через шаблон обёрточного чарта (`templates/*.yaml`), а не вставляйте эти блоки напрямую в файлы values.

Пример фрагмента шаблона обёрточного чарта:

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

## Рекомендации \{#tips\}

### Хуки Helm \{#helm-hooks\}

Каждая запись `additionalManifests` формируется как отдельный YAML-документ. Вы можете добавить аннотации хуков Helm, чтобы управлять порядком установки и обновления:

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

### Порядок применения CRD \{#crd-ordering\}

Если в дополнительные манифесты входят пользовательские ресурсы (например, `PodMonitor`), соответствующие CRD уже должны существовать в кластере до установки или обновления.

### Объединение нескольких ресурсов \{#combining-multiple-resources\}

`additionalManifests` — это список. Его элементы обрабатываются по порядку, и каждый из них становится отдельным YAML-документом.

## Следующие шаги \{#next-steps\}

* [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) - Базовая установка
* [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API-ключи, секреты и входной шлюз
* [Развертывания в Cloud](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Конфигурации GKE, EKS и AKS
* [Репозиторий Helm-чартов ClickStack](https://github.com/ClickHouse/ClickStack-helm-charts) - Исходный код чартов и справочник по параметрам values