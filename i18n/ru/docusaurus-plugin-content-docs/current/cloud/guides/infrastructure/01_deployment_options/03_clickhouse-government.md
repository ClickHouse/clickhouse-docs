---
title: 'ClickHouse government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['госсектор', 'fips', 'fedramp', 'гособлако']
description: 'Обзор решения ClickHouse Government'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## Обзор \{#overview\}

ClickHouse Government — это пакет для самостоятельного развёртывания, который включает ту же проприетарную версию ClickHouse, что используется в ClickHouse Cloud, и наш ClickHouse Operator, настроенные для разделения вычислительных ресурсов и хранилища и дополнительно защищённые для соответствия строгим требованиям государственных учреждений и организаций государственного сектора.

:::note Примечание
ClickHouse Government предназначен для государственных учреждений, организаций государственного сектора или облачных компаний‑разработчиков ПО, поставляющих решения этим учреждениям и организациям, обеспечивая им полный контроль и управление их выделенной инфраструктурой. Минимальный размер развертывания — 2 ТБ. Этот вариант доступен только по [обращению к нам](https://clickhouse.com/government).
:::

## Преимущества по сравнению с open source \{#benefits-over-os\}

Следующие возможности отличают ClickHouse Government от самостоятельных развертываний open source:

* Нативное разделение вычислительных ресурсов и хранилища
* Проприетарные облачные функции, такие как [shared merge tree](/cloud/reference/shared-merge-tree) и функциональность [warehouse](/cloud/reference/warehouses)
* Версии базы данных ClickHouse и оператора, полностью протестированные и проверенные в ClickHouse Cloud
* Документация по [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) для ускорения получения Authorization to Operate (ATO)
* API для программного выполнения операций, включая резервное копирование и масштабирование

## Архитектура \{#architecture\}

ClickHouse Government полностью автономен в рамках вашей среды развертывания, предлагая наше облачно-нативное разделение вычислительного ресурса и хранилища. 

<br />

<Image img={private_gov_architecture} size="md" alt="Архитектура ClickHouse Government" background='black'/>

<br />

## Поддерживаемые конфигурации \{#supported-configurations\}

ClickHouse Government в настоящее время доступен в следующих конфигурациях:

| Среда | Оркестрация                      | Хранилище                   | Статус                 |
| :---- | :------------------------------- | :-------------------------- | :--------------------- |
| AWS   | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | Доступно               |
| GCP   | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | Предварительная версия |

## Процесс онбординга \{#onboarding-process\}

Клиенты могут [связаться с нами](https://clickhouse.com/company/contact?loc=nav), чтобы запросить звонок для обсуждения соответствия ClickHouse Government их сценарию использования. Будут рассматриваться сценарии использования, соответствующие минимальным требованиям по масштабу и развертываемые в поддерживаемых конфигурациях. Возможности онбординга ограничены. Процесс установки предполагает следование руководству по установке для конкретной среды, в которой будет развернут ClickHouse, с использованием образов и Helm-чартов, загруженных из AWS ECR.