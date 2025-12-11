---
sidebar_label: '快速开始'
description: '分步指南：创建第一个 Google Cloud Storage ClickPipe。'
slug: /integrations/clickpipes/object-storage/gcs/get-started
title: '创建你的第一个 Google Cloud Storage ClickPipe'
doc_type: 'guide'
---

import CreateClickPipe from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';


# 创建首个 GCS ClickPipe {#creating-your-first-gcs-clickpipe}

GCS ClickPipe 提供了一种完全托管且高可靠的方式，用于从 Google Cloud Storage (GCS) 摄取数据。它支持具有 “exactly-once” 语义的 **一次性摄取** 和 **持续摄取**。

可以通过 ClickPipes UI 手动部署和管理 GCS ClickPipes，也可以以编程方式使用 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 进行管理。

<CreateClickPipe provider="gcs"/>