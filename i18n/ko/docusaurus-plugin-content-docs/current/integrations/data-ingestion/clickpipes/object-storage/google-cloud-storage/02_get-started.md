---
sidebar_label: '시작하기'
description: '처음 Google Cloud Storage ClickPipe를 만드는 단계별 가이드입니다.'
slug: /integrations/clickpipes/object-storage/gcs/get-started
title: '처음 만드는 Google Cloud Storage ClickPipe'
doc_type: 'guide'
---

import CreateClickPipe from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/_create_clickpipe.md';


# 처음 만드는 GCS ClickPipe \{#creating-your-first-gcs-clickpipe\}

GCS ClickPipe는 Google Cloud Storage(GCS)에서 데이터를 수집하기 위한 완전 관리형의 복원력 있는 방법을 제공합니다. 정확히 한 번 처리되는 의미 체계와 함께 **일회성** 수집과 **지속적인 수집**을 모두 지원합니다.

GCS ClickPipes는 ClickPipes UI를 사용해 수동으로 배포하고 관리할 수 있을 뿐만 아니라, [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post)와 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs/resources/clickpipe)을 사용해 프로그래밍 방식으로도 배포하고 관리할 수 있습니다.

<CreateClickPipe provider="gcs"/>