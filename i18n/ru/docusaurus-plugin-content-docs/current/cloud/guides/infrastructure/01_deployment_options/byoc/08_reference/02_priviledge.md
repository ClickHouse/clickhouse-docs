---
title: 'Привилегии BYOC'
slug: /cloud/reference/byoc/reference/priviledge
sidebar_label: 'Привилегии'
keywords: ['BYOC', 'облако', 'bring your own cloud', 'привилегии']
description: 'Разверните ClickHouse в собственной облачной инфраструктуре'
doc_type: 'reference'
---

## Роли IAM CloudFormation \{#cloudformation-iam-roles\}

### Bootstrap-роль IAM \{#bootstrap-iam-role\}

Bootstrap-роль IAM имеет следующие права доступа:

- **Операции EC2 и VPC**: нужны для настройки VPC и кластеров EKS.
- **Операции S3 (например, `s3:CreateBucket`)**: нужны для создания бакетов для хранилища ClickHouse BYOC.
- **Операции IAM (например, `iam:CreatePolicy`)**: нужны контроллерам для создания дополнительных ролей (подробнее см. в следующем разделе).
- **Операции EKS**: ограничены ресурсами, имена которых начинаются с префикса `clickhouse-cloud`.

### Дополнительные роли IAM, создаваемые контроллером \{#additional-iam-roles-created-by-the-controller\}

Помимо роли `ClickHouseManagementRole`, создаваемой через CloudFormation, контроллер создаст несколько дополнительных ролей.

Эти роли предназначены для использования приложениями, работающими внутри кластера EKS клиента:

- **State Exporter Role**
  - Компонент ClickHouse, который передает информацию о состоянии сервиса в ClickHouse Cloud.
  - Требует разрешения на запись в очередь SQS, принадлежащую ClickHouse Cloud.
- **Load-Balancer Controller**
  - Стандартный контроллер балансировщика нагрузки AWS.
  - Контроллер EBS CSI для управления томами для сервисов ClickHouse.
- **External-DNS**
  - Распространяет DNS-конфигурации в Route 53.
- **Cert-Manager**
  - Выпускает TLS-сертификаты для доменов сервиса BYOC.
- **Cluster Autoscaler**
  - Регулирует размер группы узлов по мере необходимости.

Роли **K8s-control-plane** и **k8s-worker** предназначены для использования сервисами AWS EKS.

Наконец, **`data-plane-mgmt`** позволяет компоненту ClickHouse Cloud Control Plane приводить в соответствие необходимые пользовательские ресурсы, такие как `ClickHouseCluster` и Istio Virtual Service/Gateway.