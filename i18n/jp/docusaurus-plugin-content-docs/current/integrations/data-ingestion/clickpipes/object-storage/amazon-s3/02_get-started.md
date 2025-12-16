---
sidebar_label: 'はじめに'
description: '初めての Amazon S3 ClickPipe を作成するためのステップバイステップのガイド。'
slug: /integrations/clickpipes/object-storage/s3/get-started
title: '初めての Amazon S3 ClickPipe を作成する'
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
import CreateClickPipe from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';
import Image from '@theme/IdealImage';


# 最初の Amazon S3 ClickPipe を作成する {#creating-your-first-amazon-s3-clickpipe}

S3 ClickPipe は、Amazon S3 および S3 互換オブジェクトストレージから ClickHouse Cloud へデータをインジェストするための、フルマネージドで高い耐障害性を備えた手段を提供します。**一度きり**のインジェストと **継続的なインジェスト** の両方を、厳密な exactly-once セマンティクスでサポートします。

S3 ClickPipes は、ClickPipes UI を使用して手動でデプロイおよび管理できるほか、[OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) や [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) を使用してプログラム的にデプロイおよび管理することも可能です。

<CreateClickPipe provider="s3"/>