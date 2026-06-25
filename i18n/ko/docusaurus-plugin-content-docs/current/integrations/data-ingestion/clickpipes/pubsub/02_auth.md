---
slug: /integrations/clickpipes/pubsub/auth
sidebar_label: 'Pub/Sub IAM 권한'
title: 'Pub/Sub IAM 권한'
description: '이 문서에서는 ClickPipes가 Google Cloud Pub/Sub에 인증하고 토픽에서 데이터를 수집하는 데 필요한 GCP IAM 권한을 설명합니다.'
doc_type: 'guide'
keywords: ['Google Cloud Pub/Sub', 'GCP IAM', '서비스 계정']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

:::note
[여기](https://clickhouse.com/cloud/clickpipes#pubsub-private-preview)에서 비공개 프리뷰 대기 명단에 등록할 수 있습니다.
:::

이 문서에서는 ClickPipes가 Google Cloud Pub/Sub에 인증하고 토픽에서 데이터를 수집하는 데 필요한 GCP IAM 권한과, 해당 권한만 정확히 부여하는 서비스 계정을 설정하는 방법을 설명합니다.

## 사전 요구 사항 \{#prerequisite\}

이 가이드를 진행하려면 다음이 필요합니다:

* 활성화된 ClickHouse Cloud 서비스
* 수집할 Pub/Sub 토픽이 포함된 GCP 프로젝트
* 서비스 계정을 생성하고 역할을 부여할 수 있는 해당 프로젝트의 IAM 권한

## 인증 모델 \{#authentication-model\}

Pub/Sub용 ClickPipes는 [서비스 계정 JSON 키](https://cloud.google.com/iam/docs/keys-create-delete)를 사용하여 GCP에 인증합니다. 파이프를 생성할 때 키 파일을 업로드하면 ClickPipes는 이를 저장 상태에서 암호화하고, 런타임에 다음 용도로 사용합니다.

* 프로젝트의 토픽을 나열하고 읽습니다.
* 메시지 소비에 ClickPipes가 사용하는 [관리형 subscription](/integrations/clickpipes/pubsub#managed-subscriptions)을 생성하고 삭제합니다.
* 해당 subscription에서 메시지를 소비합니다.
* (선택 사항) 스키마 레지스트리에서 네이티브 Pub/Sub 스키마를 읽습니다.

현재 Workload Identity 또는 자격 증명을 인라인으로 붙여넣는 옵션은 지원되지 않으며, 서비스 계정 JSON 키만 지원되는 인증 방식입니다.

## 필수 권한 \{#required-permissions\}

ClickPipes를 사용하려면 해당 토픽을 소유한 GCP 프로젝트에 다음 IAM 권한이 필요합니다. 이 권한은 검색(토픽 나열, 유효성 검사, 샘플링), subscription 관리, 정상 운영 상태에서의 수집, 정리 작업을 포함한 파이프의 전체 수명 주기를 포괄합니다.

### 토픽 액세스(검색 및 검증) \{#topic-access\}

| Permission                         | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| `pubsub.topics.list`               | 검색 중 프로젝트에서 사용 가능한 토픽 목록을 조회합니다                 |
| `pubsub.topics.get`                | 토픽의 존재 여부를 확인하고 스키마(schema) 설정을 조회합니다           |
| `pubsub.topics.attachSubscription` | **토픽**에 대한 subscription을 생성할 때 해당 **토픽**에 필요합니다 |

### subscription 수명 주기(탐색 및 수집) \{#subscription-lifecycle\}

| Permission                     | Purpose                                            |
| ------------------------------ | -------------------------------------------------- |
| `pubsub.subscriptions.create`  | 관리형 subscription(`clickpipes-{pipeID}`)과 임시 탐색 subscription 생성         |
| `pubsub.subscriptions.get`     | 상태 점검(60초마다), 팔로워 폴링, subscription 유효성 검사                    |
| `pubsub.subscriptions.delete`  | 임시 탐색 subscription 정리 및 파이프 삭제 시 관리형 subscription 삭제                  |
| `pubsub.subscriptions.consume` | `Receive()`, `Ack()`, `Nack()`, 및 타임스탬프로 seek하는 작업 |

### 스키마 액세스(선택 사항 — 네이티브 Avro/Protobuf 토픽에만 해당) \{#schema-access\}

| 권한                   | 목적                                     |
| -------------------- | -------------------------------------- |
| `pubsub.schemas.get` | Pub/Sub 스키마 레지스트리에서 네이티브 스키마 정의를 가져옵니다 |

## 미리 정의된 역할 \{#predefined-roles\}

| 역할                                                                                                   | 충분한가?   | 비고                                                                                                                  |
| ---------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| [`roles/pubsub.editor`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.editor)         | 예       | 필요한 모든 권한을 포함합니다. 가장 포괄적인 옵션입니다.                                                                                    |
| [`roles/pubsub.subscriber`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.subscriber) | **아니요** | `topics.list`, `topics.attachSubscription`, `subscriptions.create`, `subscriptions.delete`, `schemas.get` 권한이 없습니다. |
| [`roles/pubsub.viewer`](https://cloud.google.com/iam/docs/understanding-roles#pubsub.viewer)         | **아니요** | 읽기 전용이므로 subscription 관리나 메시지 수신은 할 수 없습니다.                                                                                   |
| 사용자 지정 역할 *(권장)*                                                                                     | 예       | 최소 권한 원칙에 따라 위의 7개 핵심 권한(선택 사항인 `schemas.get` 포함)을 사용하십시오.                                                          |

## 설정 \{#setup\}

<VerticalStepper headerLevel="h3" />

### 사용자 지정 역할 생성(권장) \{#create-custom-role\}

최소 권한 원칙에 따라 ClickPipes에 필요한 권한만 정확히 포함하는 사용자 지정 역할을 생성하십시오.

다음과 같이 `gcloud` CLI로 수행할 수 있습니다:

```bash
gcloud iam roles create clickpipes.pubsub.ingestion \
  --project=YOUR_PROJECT_ID \
  --title="ClickPipes Pub/Sub Ingestion" \
  --description="Permissions required by ClickHouse ClickPipes to ingest from Pub/Sub" \
  --permissions=pubsub.topics.list,pubsub.topics.get,pubsub.topics.attachSubscription,pubsub.subscriptions.create,pubsub.subscriptions.get,pubsub.subscriptions.delete,pubsub.subscriptions.consume \
  --stage=GA
```

또는 GCP Console에서 **IAM &amp; Admin → Roles → Create role**로 이동하여 [필수 권한](#required-permissions)에 나열된 권한을 추가하세요.

:::note 선택적 권한
네이티브 Pub/Sub Avro 또는 Protobuf 스키마를 사용하는 토픽에서 수집하는 경우 `--permissions` 목록에 `pubsub.schemas.get`을 추가하세요. 그렇지 않다면 역할을 최소한으로 유지하기 위해 추가하지 마세요.
:::

사용자 지정 역할을 만들지 않으려면 대신 `roles/pubsub.editor`를 부여할 수 있습니다.

### 서비스 계정 생성 \{#create-service-account\}

ClickPipe용 서비스 계정을 생성합니다:

```bash
gcloud iam service-accounts create clickpipes-pubsub \
  --project=YOUR_PROJECT_ID \
  --display-name="ClickPipes Pub/Sub Ingestion"
```

### 서비스 계정에 역할 부여 \{#grant-role\}

프로젝트 수준에서 생성한 역할(또는 `roles/pubsub.editor`)을 서비스 계정에 바인딩하십시오:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="projects/YOUR_PROJECT_ID/roles/clickpipes.pubsub.ingestion"
```

### 서비스 계정 키 생성 및 다운로드 \{#create-key\}

서비스 계정의 JSON 키를 생성한 다음 로컬로 다운로드합니다:

```bash
gcloud iam service-accounts keys create clickpipes-pubsub-key.json \
  --iam-account=clickpipes-pubsub@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

파이프를 생성할 때 ClickPipes UI에서 이 `clickpipes-pubsub-key.json` 파일을 업로드합니다.

:::note 키를 비밀 정보로 취급하십시오
서비스 계정 키는 GCP 프로젝트에 대한 액세스 권한을 부여합니다. 이 파일은 안전하게 보관하고, 소스 제어에 커밋하지 말고, 주기적으로 교체하십시오. ClickPipes는 업로드 후 저장된 키를 암호화합니다.
:::

## 참고 사항 \{#notes\}

* `pubsub.topics.attachSubscription` 권한은 subscription이 아니라 **토픽 리소스**에 필요합니다. subscription 수준의 권한만 부여할 때 이 부분을 흔히 놓칩니다.
* 토픽이 네이티브 Pub/Sub 스키마(Avro 또는 Protobuf)를 사용하지 않는 경우 `pubsub.schemas.get` 권한은 필요하지 않습니다.
* 관리형 구독의 이름은 `clickpipes-{pipeID}`이며, ack 마감 시간은 60초, 메시지 보존 기간은 7일이고 메시지 순서 지정이 활성화되어 있습니다.
* 임시 검색용 구독의 이름은 `clickpipes-discovery-{uuid}`이며, ack 마감 시간은 10초, 보존 기간은 10분이고 24시간 후 자동 만료되는 TTL이 적용됩니다.
* ClickPipes는 `PermissionDenied` 및 `Unauthenticated` 오류를 재시도 불가로 처리합니다. 권한이 누락되면 파이프는 무기한 재시도하지 않고 즉시 실패합니다.