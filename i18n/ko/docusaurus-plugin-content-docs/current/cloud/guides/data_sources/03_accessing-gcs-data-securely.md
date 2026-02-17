---
slug: /cloud/data-sources/secure-gcs
sidebar_label: 'GCS 데이터에 안전하게 액세스하기'
title: 'GCS 데이터에 안전하게 액세스하기'
description: '이 문서에서는 ClickHouse Cloud 고객이 GCS 데이터에 안전하게 액세스하는 방법을 설명합니다'
keywords: ['GCS']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import IAM_and_admin from '@site/static/images/cloud/guides/accessing-data/GCS/IAM_and_admin.png';
import create_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_service_account.png';
import create_and_continue from '@site/static/images/cloud/guides/accessing-data/GCS/create_and_continue.png';
import storage_object_user_role from '@site/static/images/cloud/guides/accessing-data/GCS/storage_object_user.png';
import note_service_account_email from '@site/static/images/cloud/guides/accessing-data/GCS/note_service_account_email.png';
import cloud_storage_settings from '@site/static/images/cloud/guides/accessing-data/GCS/cloud_storage_settings.png';
import create_key_for_service_account from '@site/static/images/cloud/guides/accessing-data/GCS/create_key_for_service_account.png';
import create_key from '@site/static/images/cloud/guides/accessing-data/GCS/create_a_key.png';
import clickpipes_hmac_key from '@site/static/images/cloud/guides/accessing-data/GCS/clickpipes_hmac_key.png';

이 가이드는 Google Cloud Storage(GCS)에 안전하게 인증을 수행하고 ClickHouse Cloud에서 데이터에 접근하는 방법을 설명합니다.


## 소개 \{#introduction\}

ClickHouse Cloud는 Google Cloud 서비스 계정에 연결된 HMAC(Hash-based Message Authentication Code) 키를 사용하여 GCS에 연결합니다.
이 방식은 쿼리에 자격 증명을 직접 포함하지 않고도 GCS 버킷에 안전하게 액세스할 수 있도록 합니다.

동작 방식은 다음과 같습니다.

1. 적절한 GCS 권한을 가진 Google Cloud 서비스 계정을 생성합니다.
2. 해당 서비스 계정에 대한 HMAC 키를 생성합니다.
3. 이 HMAC 자격 증명을 ClickHouse Cloud에 제공합니다.
4. ClickHouse Cloud는 이 자격 증명을 사용하여 GCS 버킷에 액세스합니다.

이 방식은 서비스 계정에 대한 IAM 정책을 통해 GCS 버킷에 대한 모든 액세스를 관리할 수 있게 하여, 개별 버킷 정책을 수정하지 않고도 액세스 권한을 부여하거나 취소하기를 더 쉽게 만듭니다.

## 사전 준비 사항 \{#prerequisites\}

이 가이드를 따라 진행하려면 다음이 필요합니다.

- 활성 상태인 ClickHouse Cloud 서비스
- Cloud Storage가 활성화된 Google Cloud 프로젝트
- GCP 프로젝트에서 서비스 계정을 만들고 HMAC 키를 생성할 수 있는 권한

## 설치 및 설정 \{#setup\}

<VerticalStepper headerLevel="h3">
  ### Google Cloud 서비스 계정 생성하기

  1. Google Cloud 콘솔에서 IAM &amp; Admin → Service Accounts로 이동합니다.

  <Image img={IAM_and_admin} size="md" alt="" />

  2. 왼쪽 메뉴에서 `Service accounts`를 클릭한 다음, `Create service account`를 클릭합니다:

  <Image img={create_service_account} size="md" alt="" />

  서비스 계정의 이름과 설명을 입력하세요. 예를 들면 다음과 같습니다:

  ```text
  Service account name: clickhouse-gcs-access (or your preferred name)
  Service account description: Service account for ClickHouse Cloud to access GCS buckets
  ```

  `Create and continue`를 클릭하세요

  <Image img={create_and_continue} size="sm" alt="" />

  서비스 계정에 `Storage Object User` 역할을 부여하세요:

  <Image img={storage_object_user_role} size="sm" alt="" />

  이 역할은 GCS 객체에 대한 읽기 및 쓰기 액세스를 제공합니다

  :::tip
  읽기 전용 액세스를 위해서는 `Storage Object Viewer`를 사용하세요
  더 세밀한 제어를 위해서는 커스텀 역할을 생성할 수 있습니다
  :::

  `Continue`를 클릭한 다음 `Done`을 클릭하세요

  서비스 계정 이메일 주소를 기록해 두세요:

  <Image img={note_service_account_email} size="md" alt="" />

  ### 서비스 계정에 버킷 액세스 권한 부여하기

  프로젝트 수준 또는 개별 버킷 수준에서 액세스 권한을 부여하실 수 있습니다.

  #### 옵션 1: 특정 버킷에 대한 액세스 권한 부여(권장)

  1. `Cloud Storage` → `Buckets`로 이동하십시오
  2. 액세스 권한을 부여할 버킷을 클릭하십시오
  3. `Permissions` 탭으로 이동하세요
  4. 「Permissions」에서 이전 단계에서 생성한 principal에 대해 `Grant access`를 클릭합니다
  5. &quot;New principals&quot; 필드에 서비스 계정의 이메일 주소를 입력합니다
  6. 적절한 역할을 선택하십시오:

  * 읽기/쓰기 액세스용 Storage Object USER
  * 읽기 전용 액세스용 Storage Object Viewer

  7. `Save`를 클릭하십시오
  8. 추가 버킷에 대해서도 반복하십시오

  #### 옵션 2: 프로젝트 수준 액세스 권한 부여하기

  1. `IAM & Admin` → `IAM`으로 이동하십시오
  2. `Grant access` 버튼을 클릭합니다
  3. `New principals` 필드에 서비스 계정의 이메일 주소를 입력합니다.
  4. Storage Object User를 선택합니다(읽기 전용 권한만 필요한 경우 Storage Object Viewer를 선택합니다).
  5. 「SAVE」를 클릭하십시오

  :::warning 보안 모범 사례
  프로젝트 전체 권한이 아닌 ClickHouse가 접근해야 하는 특정 버킷에만 액세스 권한을 부여하세요.
  :::

  ### 서비스 계정용 HMAC 키 생성하기

  `Cloud Storage` → `Settings` → `Interoperability`로 이동하세요:

  <Image img={cloud_storage_settings} size="sm" alt="" />

  &quot;Access keys&quot; 섹션이 표시되지 않으면 `Enable interoperability access`를 클릭하세요

  「서비스 계정용 액세스 키(Access keys for service accounts)」 아래에서 `Create a key for a service account`를 클릭하세요:

  <Image img={create_key_for_service_account} size="md" alt="" />

  앞서 생성한 서비스 계정을 선택하세요 (예: clickhouse-gcs-access@your-project.iam.gserviceaccount.com)

  `Create key`를 클릭하세요:

  <Image img={create_key} size="md" alt="" />

  HMAC 키가 표시됩니다.
  Access Key와 Secret을 즉시 저장하세요. 이후에는 Secret을 다시 확인할 수 없습니다.

  예시 키는 아래와 같습니다:

  ```vbnet
  Access Key: GOOG1EF4YBJVNFQ2YGCP3SLV4Y7CMFHW7HPC6EO7RITLJDDQ75639JK56SQVD
  Secret: nFy6DFRr4sM9OnV6BG4FtWVPR25JfqpmcdZ6w9nV
  ```

  :::danger 중요
  이 자격 증명을 안전하게 보관하세요.
  이 화면을 닫은 후에는 시크릿을 다시 조회할 수 없습니다.
  시크릿을 분실하면 새로운 키를 생성해야 합니다.
  :::

  ## ClickHouse Cloud에서 HMAC 키 사용

  이제 HMAC 자격 증명을 사용하여 ClickHouse Cloud에서 GCS에 액세스할 수 있습니다.
  이를 위해 GCS 테이블 함수를 사용하세요:

  ```sql
  SELECT *
  FROM gcs(
      'https://storage.googleapis.com/clickhouse-docs-example-bucket/epidemiology.csv',
      'GOOG1E...YOUR_ACCESS_KEY',
      'YOUR_SECRET_KEY',
      'CSVWithNames'
  );
  ```

  여러 파일에 와일드카드를 사용하세요:

  ```sql
  SELECT *
  FROM gcs(
  'https://storage.googleapis.com/clickhouse-docs-example-bucket/*.parquet',
  'GOOG1E...YOUR_ACCESS_KEY',
  'YOUR_SECRET_KEY',
  'Parquet'
  );
  ```

  ## GCS용 ClickPipes에서 HMAC 인증

  ClickPipes는 Google Cloud Storage 인증에 HMAC(Hash-based Message Authentication Code) 키를 사용합니다.

  [GCS ClickPipe를 설정](/integrations/clickpipes/object-storage/gcs/get-started)하는 경우:

  1. ClickPipe 설정 중 `Authentication method`에서 `Credentials`를 선택하십시오
  2. 이전 단계에서 얻은 HMAC 자격 증명을 제공하십시오

  <Image img={clickpipes_hmac_key} size="md" alt="" />

  :::note
  서비스 계정 인증은 현재 지원되지 않습니다. HMAC 키를 사용하십시오.
  GCS 버킷 URL은 `https://storage.googleapis.com/<bucket>/<path>` 형식을 사용해야 합니다(`gs://`는 사용할 수 없음).
  :::

  HMAC 키는 `roles/storage.objectViewer` 역할을 가진 서비스 계정과 연결되어야 합니다. 이 역할에는 다음이 포함됩니다:

  * `storage.objects.list`: 버킷에 있는 객체 목록을 조회합니다
  * `storage.objects.get`: 객체를 가져오거나 읽기 위해 사용합니다
</VerticalStepper>

## 모범 사례 {#best-practices}

### 환경별로 별도의 서비스 계정 사용 \{#separate-service-accounts\}

개발, 스테이징, 프로덕션 환경마다 별도의 서비스 계정을 생성합니다. 예를 들면 다음과 같습니다.

- `clickhouse-gcs-dev@project.iam.gserviceaccount.com`
- `clickhouse-gcs-staging@project.iam.gserviceaccount.com`
- `clickhouse-gcs-prod@project.iam.gserviceaccount.com`

이렇게 하면 다른 환경에는 영향을 주지 않고 특정 환경에 대한 접근 권한만 손쉽게 회수할 수 있습니다.

### 최소 권한 액세스 적용 {#apply-least-privilege-access}

필요한 최소 권한만 부여합니다.

- 읽기 전용 액세스에는 **Storage Object Viewer**를 사용합니다
- 프로젝트 전체가 아니라 특정 버킷에만 액세스를 부여합니다
- 특정 경로로의 액세스를 제한하기 위해 버킷 수준 조건 사용을 고려합니다

### HMAC 키를 정기적으로 교체하기 {#rotate-hmac-keys}

키 교체 주기를 수립합니다:

- 새 HMAC 키를 생성합니다
- ClickHouse 설정을 새 키로 업데이트합니다
- 새 키로 동작을 확인합니다
- 이전 HMAC 키를 삭제합니다

:::tip
Google Cloud는 HMAC 키 만료를 강제하지 않으므로, 로테이션 정책을 직접 구현해야 합니다.
:::

### Cloud Audit Logs로 액세스 모니터링 \{#monitor-access\}

Cloud Storage에 대해 Cloud Audit Logs를 활성화하고 모니터링합니다.

1. IAM & Admin → Audit Logs로 이동합니다.
2. 목록에서 Cloud Storage를 찾습니다.
3. `Admin Read`, `Data Read`, `Data Write logs`를 활성화합니다.
4. 이러한 로그를 사용하여 액세스 패턴을 모니터링하고 이상 징후를 탐지합니다.