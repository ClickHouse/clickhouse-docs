---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['private', 'on-prem']
description: 'Обзор решения ClickHouse Private'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## Обзор {#overview}

ClickHouse Private — это самостоятельно развертываемый пакет, состоящий из той же проприетарной версии ClickHouse, которая используется в ClickHouse Cloud, и нашего ClickHouse Operator, настроенного для разделения вычислительных ресурсов и хранилища. Он развертывается в средах Kubernetes с хранилищем, совместимым с S3.

В настоящее время этот пакет доступен для AWS и IBM Cloud, развертывание на физических серверах появится в ближайшее время.

:::note Примечание
ClickHouse Private предназначен для крупных предприятий с наиболее строгими требованиями к соответствию нормативным требованиям и обеспечивает полный контроль и управление выделенной инфраструктурой. Эта опция доступна только при [обращении к нам](https://clickhouse.com/company/contact?loc=nav).
:::


## Преимущества перед open-source {#benefits-over-os}

Следующие возможности отличают ClickHouse Private от самостоятельно управляемых развертываний open source:

<VerticalStepper headerLevel="h3">

### Повышенная производительность {#enhanced-performance}

- Встроенное разделение вычислений и хранения
- Проприетарные облачные возможности, такие как [shared merge tree](/cloud/reference/shared-merge-tree) и функциональность [warehouse](/cloud/reference/warehouses)

### Протестировано и проверено в различных сценариях использования и условиях {#tested-proven-through-variety-of-use-cases}

- Полностью протестировано и проверено в ClickHouse Cloud

### Полнофункциональная дорожная карта с регулярным добавлением новых возможностей {#full-featured-roadmap}

Дополнительные возможности, которые скоро появятся:

- API для программного управления ресурсами
  - Автоматическое резервное копирование
  - Автоматическое вертикальное масштабирование
- Интеграция с провайдером идентификации

</VerticalStepper>


## Архитектура {#architecture}

ClickHouse Private полностью автономен в вашей среде развёртывания и состоит из вычислительных ресурсов, управляемых в Kubernetes, и хранилища в S3-совместимом решении для хранения данных.

<br />

<Image
  img={private_gov_architecture}
  size='md'
  alt='Архитектура ClickHouse Private'
  background='black'
/>

<br />


## Процесс подключения {#onboarding-process}

Клиенты могут начать процесс подключения, обратившись к [нам](https://clickhouse.com/company/contact?loc=nav). Для соответствующих требованиям клиентов мы предоставим подробное руководство по развертыванию окружения и доступ к образам и Helm-чартам для развертывания.


## Общие требования {#general-requirements}

Этот раздел содержит обзор ресурсов, необходимых для развертывания ClickHouse Private. Подробные руководства по развертыванию предоставляются в процессе подключения. Типы и размеры экземпляров/серверов зависят от варианта использования.

### ClickHouse Private на AWS {#clickhouse-private-aws}

Необходимые ресурсы:

- [ECR](https://docs.aws.amazon.com/ecr/) для получения образов и Helm-чартов
- Кластер [EKS](https://docs.aws.amazon.com/eks/) с [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) для аутентификации и провайдером [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)
- Серверные узлы работают под управлением Amazon Linux
- Для оператора требуется группа узлов x86
- Бакет S3 в том же регионе, что и кластер EKS
- Если требуется ingress, также необходимо настроить NLB
- Одна роль AWS на кластер ClickHouse для операций clickhouse-server/keeper

### ClickHouse Private на IBM Cloud {#clickhouse-private-ibm-cloud}

Необходимые ресурсы:

- [Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started) для получения образов и Helm-чартов
- [Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started) с [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model), [Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block), [Cloud DNS](https://www.ibm.com/products/dns) и [Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable)
- Серверные узлы работают под управлением Ubuntu
- Для оператора требуется группа узлов x86
- [Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage) в том же регионе, что и кластер Cloud Kubernetes Service
- Если требуется ingress, также необходимо настроить NLB
- Одна сервисная учетная запись на кластер ClickHouse для операций clickhouse-server/keeper
