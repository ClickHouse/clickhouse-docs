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

S3 ClickPipe 提供了一种全托管且具备弹性的方式，可将 Amazon S3 和兼容 S3 的对象存储中的数据摄取到 ClickHouse Cloud。它支持 **一次性** 和 **持续摄取** 两种模式，并具备精确一次语义。

<CreateClickPipe provider="s3" />