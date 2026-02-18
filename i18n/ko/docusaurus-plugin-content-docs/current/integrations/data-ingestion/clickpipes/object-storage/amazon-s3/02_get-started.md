---
sidebar_label: '시작하기'
description: '첫 번째 Amazon S3 ClickPipe를 생성하는 단계별 가이드입니다.'
slug: /integrations/clickpipes/object-storage/s3/get-started
title: '첫 번째 Amazon S3 ClickPipe 생성하기'
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
import CreateClickPipe from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';
import Image from '@theme/IdealImage';


# 첫 번째 Amazon S3 ClickPipe 생성하기 \{#creating-your-first-amazon-s3-clickpipe\}

S3 ClickPipe는 Amazon S3 및 S3 호환 오브젝트 스토리지에서 ClickHouse Cloud로 데이터를 수집하기 위한 완전 관리형이면서 내결함성을 갖춘 방식을 제공합니다. **1회성 수집**과 **지속적인 수집**을 모두 지원하며, 정확히 한 번만 처리되는(exactly-once) 의미 체계를 보장합니다.

S3 ClickPipes는 ClickPipes UI를 사용해 수동으로 배포 및 관리할 수 있으며, [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 및 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe)을 사용해 프로그래밍 방식으로도 관리할 수 있습니다.

<CreateClickPipe provider="s3"/>