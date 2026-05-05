---
slug: /use-cases/observability/clickstack/deployment/helm-cloud-v1
title: 'Развертывания в облаке с Helm (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 13
description: 'Конфигурации для развертывания ClickStack в GKE, EKS и AKS с помощью Helm-чарта v1.x'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'развертывание Kubernetes в облаке', 'промышленное развертывание']
---

:::warning Устарело — чарт v1.x
На этой странице описаны облачные развертывания для Helm-чарта v1.x на основе inline-template, который переведен в режим поддержки. Сведения о чарте v2.x см. в разделе [Развертывания в облаке с Helm](/docs/use-cases/observability/clickstack/deployment/helm-cloud). Информацию о миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

В этом руководстве рассматриваются конфигурации для развертывания ClickStack в управляемых Kubernetes-сервисах. Базовую установку см. в [основном руководстве по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm-v1).

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

При развертывании в GKE может потребоваться переопределить некоторые значения из-за особенностей работы сети в облачной среде.

### Проблема с DNS-разрешением для LoadBalancer \{#loadbalancer-dns-resolution-issue\}

Сервис LoadBalancer в GKE может вызывать проблемы с внутренним DNS-разрешением, из-за которых при обмене данными между подами имена разрешаются во внешние IP-адреса, а не остаются внутри сети кластера. Это особенно влияет на подключение OTEL collector к серверу OpAMP.

**Симптомы:**

* В логах OTEL collector появляются ошибки &quot;connection refused&quot; с IP-адресами кластера
* Сбои подключения к OpAMP, например: `dial tcp 34.118.227.30:4320: connect: connection refused`

**Решение:**

Используйте полное доменное имя (FQDN) для URL-адреса сервера OpAMP:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### Другие аспекты GKE \{#other-gke-considerations\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# Adjust for GKE pod networking if needed
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE commonly uses this range
      - "10.0.0.0/8"   # Fallback for other configurations
```

## Amazon EKS \{#amazon-eks\}

Для развертываний в EKS рассмотрите следующие распространенные конфигурации:

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS typically uses these pod CIDRs
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# Enable ingress for production
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```

## Azure AKS \{#azure-aks\}

Для развертывания в AKS:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod networking
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # Common AKS pod CIDR
      - "10.0.0.0/8"
```

## Контрольный список production-развертывания в Cloud \{#production-cloud-deployment-checklist\}

Перед развертыванием ClickStack в production в любом облаке:

* [ ] Настройте корректный `frontendUrl`, указав внешний домен/IP-адрес
* [ ] Настройте Входной шлюз с TLS для доступа по HTTPS
* [ ] Переопределите `otel.opampServerUrl`, указав FQDN, если возникают проблемы с подключением (особенно в GKE)
* [ ] Скорректируйте `clickhouse.config.clusterCidrs` в соответствии с CIDR сети ваших подов
* [ ] Настройте постоянное хранилище для production-нагрузок
* [ ] Задайте подходящие запросы и лимиты ресурсов
* [ ] Включите мониторинг и оповещения
* [ ] Настройте резервное копирование и аварийное восстановление
* [ ] Настройте надлежащее управление секретами

## Лучшие практики для продакшена \{#production-best-practices\}

### Управление ресурсами \{#resource-management\}

```yaml
hyperdx:
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
```

### Высокая доступность \{#high-availability\}

```yaml
hyperdx:
  replicaCount: 3

  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                    - clickstack
            topologyKey: kubernetes.io/hostname
```

### Постоянное хранилище \{#persistent-storage\}

Убедитесь, что для сохранения данных настроены постоянные тома:

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**Классы хранения для отдельных облачных платформ:**

* **GKE**: `pd-ssd` или `pd-balanced`
* **EKS**: `gp3` или `io2`
* **AKS**: `managed-premium` или `managed-csi`

### Примечания о совместимости браузеров \{#browser-compatibility-notes\}

При развертывании только по HTTP (разработка/тестирование) в некоторых браузерах могут возникать ошибки Crypto API из-за требований к защищенному контексту. Для production-развертываний всегда используйте HTTPS с корректными TLS-сертификатами через конфигурацию входного шлюза.

Инструкции по настройке TLS см. в разделе [Конфигурация входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup).

## Следующие шаги \{#next-steps\}

* [Руководство по настройке (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API-ключи, секреты и входной шлюз
* [Варианты развертывания (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - Настройка внешних систем
* [Основное руководство по Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - Базовая установка
* [Развертывания в Cloud (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Руководство по Cloud для v2.x
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - Миграция с v1.x на v2.x