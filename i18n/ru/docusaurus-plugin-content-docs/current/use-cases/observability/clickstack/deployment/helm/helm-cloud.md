---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Облачные развертывания с использованием Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Облачные конфигурации для развертывания ClickStack в GKE, EKS и AKS'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'облачное развертывание Kubernetes', 'развертывание в продакшене']
---

В этом руководстве рассматриваются облачные конфигурации для развертывания ClickStack в управляемых облачных сервисах Kubernetes. Для базовой установки см. [основное руководство по развертыванию Helm](/docs/use-cases/observability/clickstack/deployment/helm).



## Google Kubernetes Engine (GKE)

При развертывании в GKE может потребоваться переопределить некоторые значения из‑за специфики сетевого поведения в облаке.

### Проблема с DNS‑разрешением для LoadBalancer

Сервис LoadBalancer в GKE может вызывать проблемы с внутренним DNS‑разрешением, когда взаимодействие между подами (pod‑to‑pod) идёт через внешние IP‑адреса вместо того, чтобы оставаться в пределах сети кластера. Это, в частности, влияет на подключение OTel collector к OpAMP‑серверу.

**Симптомы:**

* В логах OTel collector отображаются ошибки «connection refused» с IP‑адресами кластера
* Сбои подключения OpAMP, например: `dial tcp 34.118.227.30:4320: connect: connection refused`

**Решение:**

Используйте полностью квалифицированное доменное имя (FQDN) для URL OpAMP‑сервера:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### Прочие особенности GKE


```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Укажите внешний IP вашего LoadBalancer

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


# При необходимости настройте сетевые параметры подов в GKE

clickhouse:
config:
clusterCidrs:

* &quot;10.8.0.0/16&quot;  # GKE обычно использует этот диапазон
* &quot;10.0.0.0/8&quot;   # Запасной вариант для других конфигураций

```
```


## Amazon EKS {#amazon-eks}



При развертывании в EKS рассмотрите следующие типовые конфигурации:

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"
```


# В EKS обычно используются следующие диапазоны подсетей CIDR для подов
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"



# Включение входного шлюза для рабочей среды

hyperdx:
ingress:
enabled: true
host: &quot;hyperdx.yourdomain.com&quot;
tls:
enabled: true

```
```


## Azure AKS {#azure-aks}



Для развертывания в AKS:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"
```


# Сетевая подсистема подов в AKS

clickhouse:
config:
clusterCidrs:

* &quot;10.244.0.0/16&quot;  # Стандартный CIDR подсети подов AKS
* &quot;10.0.0.0/8&quot;

```
```


## Контрольный список развертывания production-окружения в облаке {#production-cloud-deployment-checklist}

Перед развертыванием ClickStack в production-окружении у любого облачного провайдера:

- [ ] Настройте корректное значение `frontendUrl` с вашим внешним доменным именем/IP-адресом
- [ ] Настройте Входной шлюз с TLS для доступа по HTTPS
- [ ] Переопределите `otel.opampServerUrl` с использованием FQDN, если возникают проблемы с подключением (особенно в GKE)
- [ ] Скорректируйте `clickhouse.config.clusterCidrs` в соответствии с CIDR-сетями ваших подов
- [ ] Настройте постоянное хранилище для production-нагрузок
- [ ] Задайте соответствующие запросы и лимиты ресурсов
- [ ] Включите мониторинг и оповещения
- [ ] Настройте резервное копирование и восстановление после сбоев
- [ ] Реализуйте корректное управление секретами



## Лучшие практики для продакшена

### Управление ресурсами

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

### Высокая доступность

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

### Персистентное хранилище

Убедитесь, что для сохранения данных настроены персистентные тома:

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Используйте класс хранилища, соответствующий вашему облачному провайдеру
```

**Облачные классы хранилища:**

* **GKE**: `pd-ssd` или `pd-balanced`
* **EKS**: `gp3` или `io2`
* **AKS**: `managed-premium` или `managed-csi`

### Замечания по совместимости с браузерами

Для развертываний по HTTP (разработка/тестирование) некоторые браузеры могут показывать ошибки Crypto API из-за требований к защищённому контексту. Для боевых развертываний всегда используйте HTTPS с корректными TLS‑сертификатами через конфигурацию входного шлюза.

См. [конфигурацию входного шлюза](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) для инструкций по настройке TLS.


## Дальнейшие шаги {#next-steps}

- [Руководство по настройке](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — ключи API, секреты и входной шлюз
- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — настройка внешних систем
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка
