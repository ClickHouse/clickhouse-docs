---
sidebar_label: '快速入门'
description: '分步指南：创建你的第一个 Amazon S3 ClickPipe。'
slug: /integrations/clickpipes/object-storage/s3/get-started
title: '创建你的第一个 Amazon S3 ClickPipe'
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
import CreateClickPipe from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';
import Image from '@theme/IdealImage';


# 创建第一个 Amazon S3 ClickPipe \{#creating-your-first-amazon-s3-clickpipe\}

S3 ClickPipe 提供了一种完全托管且具备高可用性的方式，将来自 Amazon S3 和兼容 S3 的对象存储中的数据摄取到 ClickHouse Cloud 中。它支持具有恰好一次（exactly-once）语义的**一次性摄取**和**持续摄取**。

可以通过 ClickPipes UI 手动部署和管理 S3 ClickPipes，也可以使用 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 以编程方式进行管理。

<CreateClickPipe provider="s3"/>