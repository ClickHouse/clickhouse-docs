---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['private', 'on-prem']
description: 'Обзор решения ClickHouse Private'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## Обзор \{#overview\}

ClickHouse Private — это самостоятельно развертываемый пакет, включающий ту же проприетарную версию ClickHouse, которая работает в ClickHouse Cloud, а также наш ClickHouse Operator, настроенные для разделения вычислительных ресурсов и хранилища. 

:::note Note
ClickHouse Private предназначен для крупных предприятий, развертывающих системы с объемом памяти > 2 ТБ и требующих полного контроля над своей выделенной инфраструктурой. Клиенты несут ответственность за управление всей инфраструктурой и должны обладать опытом эксплуатации ClickHouse в крупном масштабе. Этот вариант доступен только если [связаться с нами](https://clickhouse.com/company/contact?loc=nav).
:::

## Преимущества по сравнению с open source \{#benefits-over-os\}

Следующие возможности отличают ClickHouse Private от самостоятельно управляемых open source-развертываний:

* Нативное разделение вычислительных ресурсов и хранилища данных
* Проприетарные облачные функции, такие как [shared merge tree](/cloud/reference/shared-merge-tree) и [warehouse](/cloud/reference/warehouses)
* Версии базы данных ClickHouse и оператора полностью протестированы и проверены в ClickHouse Cloud
* API для программного выполнения операций, включая резервное копирование и масштабирование

## Архитектура \{#architecture\}

ClickHouse Private полностью автономен в пределах вашей среды развертывания, предлагая наше cloud-native разделение вычислительных ресурсов и хранилища.

<br />

<Image img={private_gov_architecture} size="md" alt="Архитектура ClickHouse Private" background="black" />

<br />

## Поддерживаемые конфигурации \{#supported-configurations\}

В настоящее время ClickHouse Private поддерживается в следующих конфигурациях:

| Среда              | Оркестрация                      | Хранилище                   | Статус                 |
| :----------------- | :------------------------------- | :-------------------------- | :--------------------- |
| AWS                | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | Доступно               |
| GCP                | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | Предварительная версия |
| Физические серверы | Kubernetes                       | AIStor (требуется NVMe)     | Предварительная версия | 

## Процесс онбординга \{#onboarding-process\}

Клиенты могут [связаться с нами](https://clickhouse.com/company/contact?loc=nav), чтобы запросить звонок и обсудить применение ClickHouse Private для своего сценария использования. Мы рассматриваем сценарии использования, которые соответствуют минимальным требованиям по масштабу и развертываются в поддерживаемых конфигурациях. Возможности онбординга ограничены. Процесс установки предполагает выполнение инструкций из руководства по установке для конкретной среды, в которой будет развернут ClickHouse, с использованием образов и Helm-чартов, загруженных из AWS ECR.