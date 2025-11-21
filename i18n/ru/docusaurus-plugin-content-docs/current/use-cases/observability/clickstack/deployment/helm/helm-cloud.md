---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Облачные развертывания с помощью Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Облачные конфигурации для развертывания ClickStack в GKE, EKS и AKS'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'развертывание Kubernetes в облаке', 'боевое развертывание']
---

В этом руководстве рассматриваются облачно-специфичные конфигурации для развертывания ClickStack в управляемых сервисах Kubernetes. Для базовой установки см. [основное руководство по развертыванию с помощью Helm](/docs/use-cases/observability/clickstack/deployment/helm).



## Google Kubernetes Engine (GKE) {#google-kubernetes-engine-gke}

При развертывании в GKE может потребоваться переопределить некоторые значения из-за особенностей работы сети в облачной среде.

### Проблема разрешения DNS для LoadBalancer {#loadbalancer-dns-resolution-issue}

Сервис LoadBalancer в GKE может вызывать проблемы с внутренним разрешением DNS, при которых взаимодействие между подами разрешается во внешние IP-адреса вместо того, чтобы оставаться внутри сети кластера. Это особенно влияет на подключение коллектора OTEL к серверу OpAMP.

**Симптомы:**

- В логах коллектора OTEL отображаются ошибки "connection refused" с IP-адресами кластера
- Сбои подключения OpAMP вида: `dial tcp 34.118.227.30:4320: connect: connection refused`

**Решение:**

Используйте полное доменное имя (FQDN) для URL сервера OpAMP:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### Другие особенности GKE {#other-gke-considerations}


```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Укажите внешний IP-адрес вашего LoadBalancer

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


# При необходимости скорректируйте сетевые настройки pod-ов GKE

clickhouse:
config:
clusterCidrs:

* &quot;10.8.0.0/16&quot;  # GKE обычно использует этот диапазон
* &quot;10.0.0.0/8&quot;   # Резервный вариант для других конфигураций

```
```


## Amazon EKS {#amazon-eks}


При развертывании в EKS рассмотрите следующие типичные конфигурации:

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"
```


# EKS обычно использует следующие CIDR-диапазоны адресов pod'ов
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"



# Включение ingress для production-среды

hyperdx:
ingress:
enabled: true
host: &quot;hyperdx.yourdomain.com&quot;
tls:
enabled: true

```
```


## Azure AKS {#azure-aks}


Для развертываний в AKS:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"
```


# Сетевое взаимодействие подов в AKS

clickhouse:
config:
clusterCidrs:

* &quot;10.244.0.0/16&quot;  # Стандартный AKS pod CIDR
* &quot;10.0.0.0/8&quot;

```
```


## Контрольный список развертывания в облаке для production {#production-cloud-deployment-checklist}

Перед развертыванием ClickStack в production на любом облачном провайдере:

- [ ] Настройте корректный `frontendUrl` с вашим внешним доменом/IP-адресом
- [ ] Настройте ingress с TLS для доступа по HTTPS
- [ ] Переопределите `otel.opampServerUrl`, используя FQDN, при возникновении проблем с подключением (особенно на GKE)
- [ ] Настройте `clickhouse.config.clusterCidrs` для CIDR сети ваших подов
- [ ] Настройте постоянное хранилище для production-нагрузок
- [ ] Установите соответствующие запросы и лимиты ресурсов
- [ ] Включите мониторинг и оповещения
- [ ] Настройте резервное копирование и аварийное восстановление
- [ ] Реализуйте надлежащее управление секретами


## Рекомендации для production-окружения {#production-best-practices}

### Управление ресурсами {#resource-management}

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

### Высокая доступность {#high-availability}

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

### Постоянное хранилище {#persistent-storage}

Убедитесь, что постоянные тома настроены для сохранения данных:

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd" # Используйте класс хранилища, соответствующий вашему облачному провайдеру
```

**Классы хранилища для облачных провайдеров:**

- **GKE**: `pd-ssd` or `pd-balanced`
- **EKS**: `gp3` or `io2`
- **AKS**: `managed-premium` or `managed-csi`

### Примечания о совместимости с браузерами {#browser-compatibility-notes}

При развертывании только по HTTP (для разработки/тестирования) некоторые браузеры могут выдавать ошибки crypto API из-за требований безопасного контекста. Для production-развертываний всегда используйте HTTPS с корректными TLS-сертификатами через конфигурацию ingress.

См. раздел [Конфигурация Ingress](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) для получения инструкций по настройке TLS.


## Следующие шаги {#next-steps}

- [Руководство по конфигурации](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — API-ключи, секреты и ingress
- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — Настройка внешних систем
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — Базовая установка
