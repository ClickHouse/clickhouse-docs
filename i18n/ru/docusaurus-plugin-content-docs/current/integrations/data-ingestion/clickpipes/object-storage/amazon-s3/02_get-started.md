---
sidebar_label: 'Начало работы'
description: 'Пошаговое руководство по созданию первого Amazon S3 ClickPipe.'
slug: /integrations/clickpipes/object-storage/s3/get-started
title: 'Создание первого Amazon S3 ClickPipe'
doc_type: 'guide'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import CreateClickPipe from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';
import Image from '@theme/IdealImage';


# Создание первого Amazon S3 ClickPipe {#creating-your-first-amazon-s3-clickpipe}

S3 ClickPipe предоставляет полностью управляемый и отказоустойчивый способ приёма данных из Amazon S3 и S3-совместимых объектных хранилищ в ClickHouse Cloud. Он поддерживает как **однократную**, так и **непрерывную ингестию** с семантикой exactly-once.

S3 ClickPipes можно развёртывать и управлять ими вручную через ClickPipes UI, а также программно с помощью [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).

<CreateClickPipe provider="s3"/>