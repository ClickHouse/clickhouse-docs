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

ClickHouse Private — это самостоятельно развертываемый пакет, включающий ту же проприетарную версию ClickHouse, которая используется в ClickHouse Cloud, а также наш ClickHouse Operator, настроенные для разделения вычислений и хранилища. Он разворачивается в Kubernetes‑окружениях с S3‑совместимым хранилищем.

В настоящее время этот пакет доступен в AWS и IBM Cloud; в скором времени появится поддержка развертываний на физических серверах (bare metal).

:::note Note
ClickHouse Private предназначен для крупных предприятий с наиболее строгими требованиями к соответствию нормативным требованиям (compliance) и обеспечивает полный контроль и управление их выделенной инфраструктурой. Этот вариант доступен только при [обращении к нам](https://clickhouse.com/company/contact?loc=nav).
:::



## Преимущества по сравнению с open source {#benefits-over-os}

Следующие возможности отличают ClickHouse Private от самостоятельно управляемых open source-развертываний:

<VerticalStepper headerLevel="h3">

### Повышенная производительность {#enhanced-performance}
- Нативное разделение вычислительных ресурсов и хранилища данных
- Проприетарные облачные функции, такие как [shared merge tree](/cloud/reference/shared-merge-tree) и [warehouse](/cloud/reference/warehouses)

### Проверено и подтверждено на множестве сценариев и в различных условиях {#tested-proven-through-variety-of-use-cases}
- Полностью протестировано и проверено в ClickHouse Cloud

### Полноценный план развития с регулярным добавлением новых функций {#full-featured-roadmap}
Дополнительные возможности, которые появятся в ближайшее время:
- API для программного управления ресурсами
  - Автоматизированное создание резервных копий
  - Автоматизированные операции вертикального масштабирования
- Интеграция с провайдерами идентификации

</VerticalStepper>



## Архитектура {#architecture}

ClickHouse Private полностью автономен в пределах вашей среды развертывания и состоит из вычислительных ресурсов, управляемых в Kubernetes, и хранилища в совместимом с S3 объектном хранилище.

<br />

<Image img={private_gov_architecture} size="md" alt="Архитектура ClickHouse Private" background='black'/>

<br />



## Процесс онбординга {#onboarding-process}

Клиенты могут начать процесс онбординга, связавшись с [нами](https://clickhouse.com/company/contact?loc=nav). Для подходящих клиентов мы предоставим подробное руководство по развертыванию окружения и доступ к образам и Helm-чартам для этого развертывания.



## Общие требования {#general-requirements}

Этот раздел предназначен для обзора ресурсов, необходимых для развертывания ClickHouse Private. Конкретные руководства по развертыванию предоставляются в рамках процесса онбординга. Типы и размеры экземпляров/серверов зависят от варианта использования.

### ClickHouse Private в AWS {#clickhouse-private-aws}

Необходимые ресурсы:
- [ECR](https://docs.aws.amazon.com/ecr/) для получения образов и Helm-чартов
- Кластер [EKS](https://docs.aws.amazon.com/eks/) с [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) для аутентификации и провайдером [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)
- Серверные узлы на базе Amazon Linux
- Оператору требуется группа узлов x86
- Бакет S3 в том же регионе, что и кластер EKS
- Если требуется входной шлюз, необходимо также настроить NLB
- Одна роль AWS для каждого кластера ClickHouse для операций clickhouse-server/keeper

### ClickHouse Private в IBM Cloud {#clickhouse-private-ibm-cloud}

Необходимые ресурсы:
- [Container Registry](https://cloud.ibm.com/docs/Registry?topic=Registry-getting-started) для получения образов и Helm-чартов
- [Cloud Kubernetes Service](https://cloud.ibm.com/docs/containers?topic=containers-getting-started) с [CNI](https://www.ibm.com/docs/en/cloud-private/3.2.x?topic=networking-kubernetes-network-model), [Cloud Block Storage for VPC](https://cloud.ibm.com/docs/containers?topic=containers-vpc-block), [Cloud DNS](https://www.ibm.com/products/dns) и [Cluster Autoscaler](https://cloud.ibm.com/docs/containers?topic=containers-cluster-scaling-install-addon-enable)
- Серверные узлы на базе Ubuntu
- Оператору требуется группа узлов x86
- [Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage?topic=cloud-object-storage-getting-started-cloud-object-storage) в том же регионе, что и кластер Cloud Kubernetes Service
- Если требуется входной шлюз, необходимо также настроить NLB
- Одна учетная запись службы для каждого кластера ClickHouse для операций clickhouse-server/keeper
