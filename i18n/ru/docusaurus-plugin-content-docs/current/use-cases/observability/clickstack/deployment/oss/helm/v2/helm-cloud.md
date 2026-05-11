---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Облачные развертывания с Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Конфигурации для развертывания ClickStack в облачных Kubernetes-сервисах GKE, EKS и AKS'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Облачное развертывание Kubernetes', 'промышленное развертывание']
---

:::warning Версия чарта 2.x
На этой странице описан Helm-чарт **v2.x** на основе сабчартов. Если вы по-прежнему используете чарт v1.x с inline-template, см. [Облачные развертывания с Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1). Инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

В этом руководстве рассматриваются специфичные для облачных сред конфигурации развертывания ClickStack в управляемых Kubernetes-сервисах. Базовую установку см. в [основном руководстве по развертыванию с Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

При развертывании в GKE может потребоваться переопределить некоторые значения из-за особенностей сетевого поведения в облачной среде.

### Проблема с разрешением DNS для LoadBalancer \{#loadbalancer-dns-resolution-issue\}

Сервис LoadBalancer в GKE может вызывать проблемы с внутренним разрешением DNS: при обмене данными между подами трафик направляется на внешние IP-адреса вместо того, чтобы оставаться внутри сети кластера. Это особенно влияет на подключение OTEL collector к серверу OpAMP.

**Симптомы:**

* В логах OTEL collector появляются ошибки &quot;connection refused&quot; при использовании IP-адресов кластера
* Сбои подключения к OpAMP, например: `dial tcp 34.118.227.30:4320: connect: connection refused`

**Решение:**

Используйте полное доменное имя (FQDN) в URL сервера OpAMP:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set hyperdx.config.OPAMP_SERVER_URL="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### Пример значений для GKE \{#gke-example-values\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

  config:
    OPAMP_SERVER_URL: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 10Gi
```

## Amazon EKS \{#amazon-eks\}

При развертывании в EKS рассмотрите следующие распространенные конфигурации:

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 10Gi
```

Сведения о конфигурации Входного шлюза AWS ALB см. в [руководстве по дополнительным манифестам](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests#aws-alb-ingress) и в [примере значений ALB](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress).

## Azure AKS \{#azure-aks\}

Для развертывания в AKS:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 10Gi
```

## Контрольный список для развертывания в production-облаке \{#production-cloud-deployment-checklist\}

Перед развертыванием ClickStack в production у любого облачного провайдера:

* [ ] Настройте корректное значение `hyperdx.frontendUrl`, указав внешний домен/IP-адрес
* [ ] Настройте входной шлюз с TLS для доступа по HTTPS
* [ ] Переопределите URL сервера OpAMP, указав FQDN, если возникают проблемы с подключением (особенно в GKE)
* [ ] Настройте классы хранения для запросов томов ClickHouse и Keeper
* [ ] Задайте подходящие запросы и лимиты ресурсов
* [ ] Включите мониторинг и оповещения
* [ ] Настройте резервное копирование и аварийное восстановление
* [ ] Настройте надлежащее управление секретами через `hyperdx.secrets` или внешние секреты

## Лучшие практики промышленной эксплуатации \{#production-best-practices\}

### Управление ресурсами \{#resource-management\}

```yaml
hyperdx:
  deployment:
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: "2"
        memory: 4Gi

otel-collector:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi
```

### Высокая доступность \{#high-availability\}

```yaml
hyperdx:
  deployment:
    replicas: 3
    topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app.kubernetes.io/name: clickstack

  podDisruptionBudget:
    enabled: true
    minAvailable: 1
```

### Постоянное хранилище \{#persistent-storage\}

Убедитесь, что для хранения данных настроены постоянные тома в спецификациях CR оператора:

```yaml
clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi

mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              storageClassName: "fast-ssd"
              accessModes: ["ReadWriteOnce"]
              resources:
                requests:
                  storage: 10Gi
```

**Классы хранения для Cloud-провайдеров:**

* **GKE**: `pd-ssd` или `pd-balanced`
* **EKS**: `gp3` или `io2`
* **AKS**: `managed-premium` или `managed-csi`

### Примечания о совместимости браузеров \{#browser-compatibility-notes\}

В развертываниях, использующих только HTTP (для разработки/тестирования), в некоторых браузерах могут возникать ошибки Crypto API из-за требований к безопасному контексту. В производственных развертываниях всегда используйте HTTPS с корректными TLS-сертификатами через конфигурацию входного шлюза.

Инструкции по настройке TLS см. в разделе [Конфигурация входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup).

## Следующие шаги \{#next-steps\}

* [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - ключи API, секреты и входной шлюз
* [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - настройка внешних систем
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - миграция с v1.x на v2.x
* [Дополнительные манифесты](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - пользовательские объекты Kubernetes
* [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) - базовая установка
* [Развертывания в Cloud (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - конфигурации Cloud для v1.x