---
title: 'ClickHouse для государственного сектора'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['government', 'fips', 'fedramp', 'gov cloud']
description: 'Обзор решения ClickHouse Government'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## Обзор {#overview}

ClickHouse Government — это пакет для самостоятельного развёртывания, состоящий из той же проприетарной версии ClickHouse, которая используется в ClickHouse Cloud, и нашего ClickHouse Operator, настроенного для разделения вычислительных ресурсов и хранилища и усиленного для соответствия строгим требованиям государственных учреждений и организаций государственного сектора. Развёртывание выполняется в средах Kubernetes с S3-совместимым хранилищем.

В настоящее время этот пакет доступен для AWS, развёртывание на физических серверах появится в ближайшее время.

:::note Примечание
ClickHouse Government предназначен для государственных учреждений, организаций государственного сектора или облачных компаний-разработчиков программного обеспечения, продающих решения этим учреждениям и организациям, и обеспечивает полный контроль и управление выделенной инфраструктурой. Эта опция доступна только при [обращении к нам](https://clickhouse.com/government).
:::


## Преимущества перед open-source {#benefits-over-os}

Следующие возможности отличают ClickHouse Government от самостоятельно управляемых развертываний open source:

<VerticalStepper headerLevel="h3">

### Повышенная производительность {#enhanced-performance}

- Нативное разделение вычислительных ресурсов и хранилища
- Проприетарные облачные возможности, такие как [shared merge tree](/cloud/reference/shared-merge-tree) и функциональность [warehouse](/cloud/reference/warehouses)

### Протестировано и проверено в различных сценариях использования и условиях {#tested-proven}

- Полностью протестировано и проверено в ClickHouse Cloud

### Пакет соответствия требованиям {#compliance-package}

- Документация [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) для ускорения получения разрешения на эксплуатацию (Authorization to Operate, ATO)

### Полнофункциональная дорожная карта с регулярным добавлением новых возможностей {#full-featured-roadmap}

Дополнительные возможности, которые скоро появятся:

- API для программного управления ресурсами
  - Автоматическое резервное копирование
  - Автоматические операции вертикального масштабирования
- Интеграция с провайдерами идентификации

</VerticalStepper>


## Архитектура {#architecture}

ClickHouse Government полностью автономен в вашей среде развёртывания и состоит из вычислительных ресурсов, управляемых в Kubernetes, и хранилища в S3-совместимом решении для хранения данных.

<br />

<Image
  img={private_gov_architecture}
  size='md'
  alt='Архитектура ClickHouse Government'
  background='black'
/>

<br />


## Процесс подключения {#onboarding-process}

Клиенты могут начать процесс подключения, обратившись к [нам](https://clickhouse.com/government). Квалифицированным клиентам мы предоставим подробное руководство по развертыванию среды и доступ к образам и Helm-чартам для развертывания.


## Общие требования {#general-requirements}

Этот раздел содержит обзор ресурсов, необходимых для развертывания ClickHouse Government. Конкретные руководства по развертыванию предоставляются в процессе подключения. Типы и размеры экземпляров/серверов зависят от варианта использования.

### ClickHouse Government на AWS {#clickhouse-government-aws}

Необходимые ресурсы:

- [ECR](https://docs.aws.amazon.com/ecr/) для получения образов и Helm-чартов
- Центр сертификации, способный генерировать сертификаты, соответствующие стандарту FIPS
- Кластер [EKS](https://docs.aws.amazon.com/eks/) с [CNI](https://github.com/aws/amazon-vpc-cni-k8s), [EBS CSI Driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver), [DNS](https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html), [Cluster Autoscaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md), [IMDS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html) для аутентификации и провайдером [OIDC](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html)
- Серверные узлы работают под управлением Amazon Linux
- Для оператора требуется группа узлов x86
- Бакет S3 в том же регионе, что и кластер EKS
- Если требуется входящий трафик, также необходимо настроить NLB
- Одна роль AWS на каждый кластер ClickHouse для операций clickhouse-server/keeper
