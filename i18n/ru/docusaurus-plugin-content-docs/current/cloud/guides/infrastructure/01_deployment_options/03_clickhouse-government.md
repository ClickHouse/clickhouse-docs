---
title: 'ClickHouse Government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['госсектор', 'fips', 'fedramp', 'гособлако']
description: 'Обзор решения ClickHouse Government'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## Обзор \{#overview\}

ClickHouse Government — это пакет для самостоятельного развёртывания, который включает ту же проприетарную версию ClickHouse, что используется в ClickHouse Cloud, и наш ClickHouse Operator, настроенные для разделения вычислительных ресурсов и хранилища и дополнительно защищённые для соответствия строгим требованиям государственных учреждений и организаций государственного сектора. Он развёртывается в кластерах Kubernetes с S3‑совместимым хранилищем.

В настоящее время этот пакет доступен в AWS, в ближайшее время ожидается поддержка развёртываний на bare metal.

:::note Примечание
ClickHouse Government предназначен для государственных учреждений, организаций государственного сектора или облачных компаний‑разработчиков ПО, поставляющих решения этим учреждениям и организациям, обеспечивая им полный контроль и управление их выделенной инфраструктурой. Этот вариант доступен только по [обращению к нам](https://clickhouse.com/government).
:::



## Преимущества по сравнению с open source \{#benefits-over-os\}

Следующие возможности отличают ClickHouse Government от самостоятельных развертываний open source:

<VerticalStepper headerLevel="h3">

### Повышенная производительность \{#enhanced-performance\}
- Нативное разделение вычислительных ресурсов и хранилища
- Проприетарные облачные функции, такие как [shared merge tree](/cloud/reference/shared-merge-tree) и функциональность [warehouse](/cloud/reference/warehouses)

### Проверено и подтверждено на множестве сценариев использования и в различных условиях \{#tested-proven\}
- Полностью протестировано и проверено в ClickHouse Cloud

### Пакет по соответствию требованиям \{#compliance-package\}
- Документация по [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) для ускорения получения Authorization to Operate (ATO)

### Полнофункциональный план развития с регулярным добавлением новых возможностей \{#full-featured-roadmap\}
Дополнительные возможности, которые появятся в ближайшее время:
- API для программного управления ресурсами
  - Автоматизированное создание резервных копий
  - Автоматизированные операции вертикального масштабирования
- Интеграция с поставщиком услуг идентификации

</VerticalStepper>



## Архитектура \{#architecture\}

ClickHouse Government полностью автономен в рамках вашей среды развертывания и состоит из вычислительных ресурсов, управляемых в Kubernetes, и хранилища в совместимом с S3 объектном хранилище.

<br />

<Image img={private_gov_architecture} size="md" alt="Архитектура ClickHouse Government" background='black'/>

<br />



## Процесс подключения \{#onboarding-process\}

Клиенты могут начать процесс подключения, обратившись [к нам](https://clickhouse.com/government). Для подходящих клиентов мы предоставим подробное руководство по развертыванию окружения и доступ к образам контейнеров и Helm-чартам для развертывания.



## Общие требования \{#general-requirements\}

В этом разделе приведен обзор ресурсов, необходимых для развертывания ClickHouse Government. Подробные руководства по развертыванию предоставляются в рамках онбординга. Типы и размеры экземпляров/серверов зависят от сценария использования.

### ClickHouse Government в AWS \{#clickhouse-government-aws\}

Необходимые ресурсы:
- [ECR](https://docs.aws.amazon.com/ecr/) для получения образов и Helm-чартов
- Удостоверяющий центр, способный выпускать сертификаты, соответствующие требованиям FIPS
- Кластер [EKS](https://docs.aws.amazon.com/eks/) с [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) для аутентификации и провайдером [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)
- Серверные узлы под управлением Amazon Linux
- Для оператора требуется группа узлов x86
- Бакет S3 в том же регионе, что и кластер EKS
- Если требуется входной шлюз, дополнительно настройте NLB
- Одна роль AWS на кластер ClickHouse для операций clickhouse-server/keeper
