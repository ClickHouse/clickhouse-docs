---
sidebar_label: '시작하기'
description: '첫 번째 BigQuery ClickPipe를 생성하는 단계별 가이드입니다.'
slug: /integrations/clickpipes/bigquery/get-started
title: '첫 번째 BigQuery ClickPipe 생성하기'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step3.png';
import cp_step4 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step4.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step5.png';
import Image from '@theme/IdealImage';


# 첫 번째 BigQuery ClickPipe 만들기 \{#creating-your-first-bigquery-clickpipe\}

<IntroClickPipe/>

## 사전 준비 사항 \{#pre-requisites\}

* GCP 프로젝트에서 [service accounts](https://docs.cloud.google.com/iam/docs/service-account-overview)와 [IAM roles](https://docs.cloud.google.com/iam/docs/roles-overview)를 관리할 수 있는 권한이 있거나 관리자에게 도움을 받아야 합니다. [공식 문서](https://docs.cloud.google.com/iam/docs/service-accounts-create)를 참고하여 필요한 [permissions](./01_overview.md#permissions)만 최소한으로 부여된 전용 service account를 생성할 것을 권장합니다.

* 초기 로드 과정에서는 스테이징을 위한 Google Cloud Storage(GCS) 버킷을 사용자가 직접 제공해야 합니다. [공식 문서](https://docs.cloud.google.com/storage/docs/creating-buckets)를 참고하여 ClickPipe용 전용 버킷을 생성할 것을 권장합니다. 이후에는 중간 버킷이 ClickPipes에 의해 제공 및 관리됩니다.

<VerticalStepper type="numbered" headerLevel="h2">

## 데이터 소스 선택 \{#1-select-the-data-source\}

**1.** ClickHouse Cloud의 기본 내비게이션 메뉴에서 **Data sources**를 선택한 후 **Create ClickPipe**를 클릭합니다.

    <Image img={cp_step0} alt="가져오기 선택" size="lg" border/>

**2.** **BigQuery** 타일을 클릭합니다.

    <Image img={cp_step1} alt="BigQuery 타일 선택" size="lg" border/>

## ClickPipe 연결 설정 \{#2-setup-your-clickpipe-connection\}

새로운 ClickPipe를 설정하려면 BigQuery 데이터 웨어하우스에 어떻게 연결하고 인증할지, 그리고 스테이징용 GCS 버킷에 대한 세부 정보를 제공해야 합니다.

**1.** ClickPipes용으로 생성한 service account의 `.json` 키를 업로드합니다. 해당 service account에 필요한 최소 [permissions](./01_overview.md#permissions)이 부여되어 있는지 확인합니다.

    <Image img={cp_step2} alt="Service account 키 업로드" size="lg" border/>    

**2.** **Replication method**를 선택합니다. Private Preview에서는 [**Initial load only**](./01_overview.md#initial-load)만 지원됩니다.

**3.** 초기 로드 중 데이터를 스테이징할 GCS 버킷 경로를 입력합니다.

**4.** **Next**를 클릭하여 설정을 검증합니다.

## ClickPipe 구성 \{#3-configure-your-clickpipe\}

BigQuery 데이터셋의 크기나 동기화하려는 테이블의 전체 크기에 따라 ClickPipe에 대한 기본 수집 설정을 조정해야 할 수 있습니다.

## 테이블 구성 \{#4-configure-tables\}

**1.** BigQuery 테이블을 복제할 ClickHouse 데이터베이스를 선택합니다. 기존 데이터베이스를 선택하거나 새로 생성할 수 있습니다.

**2.** 복제하려는 테이블과 필요에 따라 컬럼을 선택합니다. 제공된 service account에 액세스 권한이 있는 데이터셋만 목록에 표시됩니다.

    <Image img={cp_step3} alt="권한" size="lg" border/>

**3.** 선택한 각 테이블에 대해 **Advanced settings** > **Use a custom sorting key**에서 사용자 지정 sorting key를 반드시 정의합니다. 이후에는 상위 데이터베이스에 존재하는 클러스터링 또는 파티셔닝 키를 기반으로 sorting key가 자동으로 추론될 예정입니다.

    :::warning
    ClickHouse에서 쿼리 성능을 최적화하려면 복제된 테이블에 대해 [sorting key](../../../../best-practices/choosing_a_primary_key.md)를 반드시 정의해야 합니다. 그렇지 않으면 sorting key가 `tuple()`로 설정되어 primary index가 생성되지 않으며, ClickHouse는 해당 테이블에 대한 모든 쿼리를 전체 테이블 스캔으로 수행합니다.
    :::

    <Image img={cp_step4} alt="권한" size="lg" border/>

## 권한 구성 \{#6-configure-permissions\}

마지막으로 내부 ClickPipes 사용자에 대한 권한을 구성할 수 있습니다.

**Permissions:** ClickPipes는 대상 테이블에 데이터를 기록하기 위한 전용 사용자를 생성합니다. 이 내부 사용자에 대해 사용자 지정 role 또는 사전 정의된 role 중 하나를 선택할 수 있습니다:
- `Full access`: 클러스터에 대한 전체 액세스 권한입니다. 대상 테이블과 함께 materialized views 또는 딕셔너리를 사용하는 경우 필요합니다.
- `Only destination`: 대상 테이블에만 insert 권한을 부여합니다.

## 설정 완료 \{#7-complete-setup\}

**Create ClickPipe**를 클릭하여 설정을 완료합니다. 그러면 개요 페이지로 리디렉션되며, 여기에서 초기 로드 진행 상태를 확인하고 BigQuery ClickPipes에 대한 세부 정보를 확인할 수 있습니다.

<Image img={cp_step5} alt="권한" size="lg" border/>

</VerticalStepper>