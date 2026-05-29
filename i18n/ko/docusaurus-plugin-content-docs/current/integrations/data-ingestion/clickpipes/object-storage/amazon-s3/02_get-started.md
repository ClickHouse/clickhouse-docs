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

S3 ClickPipe는 Amazon S3 및 S3 호환 객체 스토어의 데이터를 ClickHouse Cloud로 수집할 수 있는 완전 관리형의 복원력 높은 방법을 제공합니다. 정확히 한 번 처리 의미 체계를 통해 **일회성** 수집과 **지속적인 수집**을 모두 지원합니다.

<CreateClickPipe provider="s3" />