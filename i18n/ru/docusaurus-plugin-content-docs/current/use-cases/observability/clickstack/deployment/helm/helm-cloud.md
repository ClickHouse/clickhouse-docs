---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Облачные развертывания с помощью Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Специфичные для облака конфигурации развертывания ClickStack в GKE, EKS и AKS'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'облачное развертывание Kubernetes', 'продакшн-развертывание']
---

В этом руководстве рассматриваются конфигурации, специфичные для облачных платформ, для развертывания ClickStack в управляемых Kubernetes‑сервисах. Для базовой установки см. [основное руководство по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

При развертывании в GKE может потребоваться переопределить некоторые значения из‑за особенностей сетевой инфраструктуры облака.

### Проблема с разрешением DNS для LoadBalancer \{#loadbalancer-dns-resolution-issue\}

Сервис LoadBalancer в GKE может вызывать внутренние проблемы с разрешением DNS, при которых взаимодействие между подами осуществляется через внешние IP‑адреса вместо использования сетевого трафика внутри кластера. Это, в частности, влияет на подключение OTel collector к серверу OpAMP.

**Симптомы:**

* В логах OTel collector отображаются ошибки `connection refused` с IP‑адресами кластера
* Сбои подключения к OpAMP, например: `dial tcp 34.118.227.30:4320: connect: connection refused`

**Решение:**

Используйте полностью квалифицированное доменное имя (FQDN) в URL сервера OpAMP:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### Дополнительные соображения по GKE \{#other-gke-considerations\}

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

Для развертывания в EKS рассмотрите следующие распространённые конфигурации:

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

## Контрольный список для продакшн-развертывания в облаке \{#production-cloud-deployment-checklist\}

Перед развертыванием ClickStack в продакшене у любого провайдера облачных услуг:

- [ ] Настройте корректный `frontendUrl` с вашим внешним доменом или IP-адресом
- [ ] Настройте Входной шлюз с TLS для доступа по HTTPS
- [ ] Переопределите `otel.opampServerUrl` с использованием FQDN (полного доменного имени), если возникают проблемы с подключением (особенно в GKE)
- [ ] Скорректируйте `clickhouse.config.clusterCidrs` под CIDR вашей подсети подов
- [ ] Настройте постоянное хранилище для продакшн-нагрузок
- [ ] Задайте подходящие запросы и лимиты ресурсов
- [ ] Включите мониторинг и оповещения
- [ ] Настройте резервное копирование и восстановление после сбоев
- [ ] Реализуйте корректное управление секретами

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

### Персистентное хранилище \{#persistent-storage\}

Убедитесь, что для хранения данных настроены персистентные тома.

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**Классы хранилища, зависящие от облачного провайдера:**

* **GKE**: `pd-ssd` или `pd-balanced`
* **EKS**: `gp3` или `io2`
* **AKS**: `managed-premium` или `managed-csi`

### Примечания по совместимости с браузерами \{#browser-compatibility-notes\}

Для развертываний, работающих только по HTTP (разработка/тестирование), некоторые браузеры могут показывать ошибки криптографического API из‑за требований к защищённому контексту. Для продуктивных развертываний всегда используйте HTTPS с корректными TLS‑сертификатами, настроенными через конфигурацию входного шлюза.

См. раздел [Конфигурация входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) с инструкциями по настройке TLS.

## Следующие шаги \{#next-steps\}

- [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — API-ключи, секреты и входной шлюз
- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — настройка внешних систем
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка