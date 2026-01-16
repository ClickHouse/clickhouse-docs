---
sidebar_label: 'はじめに'
description: 'はじめての Google Cloud Storage ClickPipe を作成するためのステップバイステップガイド。'
slug: /integrations/clickpipes/object-storage/gcs/get-started
title: 'はじめての Google Cloud Storage ClickPipe の作成'
doc_type: 'guide'
---

import CreateClickPipe from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';


# 最初の GCS ClickPipe を作成する \\{#creating-your-first-gcs-clickpipe\\}

GCS ClickPipe は、Google Cloud Storage (GCS) からデータを取り込むための、フルマネージドで高い耐障害性を備えた手段を提供します。**1 回限り**のインジェストと**継続的なインジェスト**の両方を、厳密に 1 回だけのセマンティクスでサポートします。

GCS ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を使用してプログラムから操作することもできます。

<CreateClickPipe provider="gcs"/>