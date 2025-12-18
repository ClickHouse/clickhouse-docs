---
sidebar_label: 'Начало работы'
description: 'Пошаговое руководство по созданию первого ClickPipe для Google Cloud Storage.'
slug: /integrations/clickpipes/object-storage/gcs/get-started
title: 'Создание первого ClickPipe для Google Cloud Storage'
doc_type: 'guide'
---

import CreateClickPipe from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';


# Создание первого GCS ClickPipe {#creating-your-first-gcs-clickpipe}

GCS ClickPipe обеспечивает полностью управляемый и отказоустойчивый способ приёма данных из Google Cloud Storage (GCS). Он поддерживает как **однократную**, так и **непрерывную ингестию** с семантикой «ровно один раз».

GCS ClickPipes могут быть развернуты и управляться вручную с помощью ClickPipes UI, а также программно с использованием [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).

<CreateClickPipe provider="gcs"/>