---
sidebar_label: '비순차 모드 구성'
sidebar_position: 3
title: '연속 수집용 비순차 모드 구성'
slug: /integrations/clickpipes/object-storage/gcs/unordered-mode
description: 'GCS ClickPipes에서 연속 수집용 비순차 모드를 구성하는 단계별 가이드입니다.'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

기본적으로 GCS ClickPipe는 파일이 버킷에 [사전식 순서](/integrations/clickpipes/object-storage/gcs/overview#continuous-ingestion-lexicographical-order)로 추가된다고 가정합니다. 버킷에 연결된 [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) 구독을 설정하면 암시적인 순서가 없는 파일도 GCS ClickPipe에서 수집하도록 구성할 수 있습니다. 이를 통해 ClickPipes는 `OBJECT_FINALIZE` 알림을 수신하여 파일 이름 지정 규칙과 관계없이 새 파일을 모두 수집할 수 있습니다.

:::note
비순차 모드는 공개 버킷에서 **지원되지 않습니다**. 이 모드를 사용하려면 **Service Account** 인증과 버킷에 연결된 [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) 구독이 필요합니다.
:::


## 작동 방식 \{#how-it-works\}

이 모드에서는 GCS ClickPipe가 선택한 경로의 **모든 파일**을 초기 로드한 다음, 지정된 경로와 일치하는 객체 알림을 Pub/Sub 구독을 통해 수신합니다. 이전에 이미 확인한 파일에 대한 메시지, 경로와 일치하지 않는 파일, 또는 다른 유형의 이벤트는 **무시됩니다**. 특정 파일이나 시점부터 수집을 시작하는 것은 **불가능합니다** — ClickPipes는 항상 선택한 경로의 모든 파일을 로드합니다.

데이터를 수집하는 동안 다양한 유형의 장애가 발생할 수 있으며, 이로 인해 일부만 삽입되거나 중복 데이터가 생길 수 있습니다. 객체 스토리지 ClickPipes는 삽입 실패에 강하며, 임시 스테이징 테이블을 사용해 정확히 한 번 의미론을 제공합니다. 데이터는 먼저 스테이징 테이블에 삽입되며, 문제가 발생하면 스테이징 테이블을 비우고 깨끗한 상태에서 삽입을 다시 시도합니다. 삽입이 성공적으로 완료된 후에만 파티션이 대상 테이블로 이동됩니다.

<VerticalStepper type="numbered" headerLevel="h2">

## Google Cloud Pub/Sub topic 생성 \{#create-pubsub-topic\}

**1.** Google Cloud Console에서 **Pub/Sub > Topics > Create topic**으로 이동합니다. 기본 구독이 포함된 새 topic을 만들고 **Topic Name**을 기록합니다.

**2.** 위에서 생성한 Pub/Sub topic에 [`OBJECT_FINALIZE` 이벤트](https://docs.cloud.google.com/storage/docs/pubsub-notifications)를 게시하도록 GCS 버킷 알림을 구성합니다.

**2.1.** 이 단계는 Google Cloud Console에서 수행할 수 없으므로 `gcloud` 클라이언트 또는 선호하는 Google Cloud용 프로그래밍 인터페이스를 사용해야 합니다. 예를 들어 `gcloud`를 사용하는 경우 다음과 같습니다.

  ```bash
  # Create a Pub/Sub notification for new objects in the bucket
  gcloud storage buckets notifications create "gs://${YOUR_BUCKET_NAME}" \
    --topic="projects/${YOUR_PROJECT_ID}/topics/${YOUR_TOPIC_NAME}" \
    --event-types="OBJECT_FINALIZE" \
    --payload-format="json"

  # List the Pub/Sub notifications in the bucket
  gcloud storage buckets notifications describe
  ```

## 서비스 계정 구성 \{#configure-service-account\}

**1.** ClickPipes가 지정된 버킷의 객체를 나열하고 가져오며, Pub/Sub 구독의 알림을 소비하고 모니터링할 수 있도록 [필수 권한](/integrations/clickpipes/object-storage/gcs/overview#permissions)을 가진 [서비스 계정](http://docs.cloud.google.com/iam/docs/keys-create-delete)을 구성합니다.

**1.1.** 이 단계는 Google Cloud Console, `gcloud` 클라이언트 또는 선호하는 Google Cloud용 프로그래밍 인터페이스를 사용해 수행할 수 있습니다. 예를 들어 `gcloud`를 사용하는 경우 다음과 같습니다.

  ```bash
  # 1. Grant read access to the GCS bucket
  gcloud storage buckets add-iam-policy-binding "gs://${YOUR_BUCKET_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

  # 2. Grant read access to the Pub/Sub subscription
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.subscriber"

  # 3. Grant permission to get the Pub/Sub subscription metadata
  gcloud pubsub subscriptions add-iam-policy-binding "${YOUR_SUBSCRIPTION_NAME}" \
    --member="serviceAccount:${YOUR_SERVICE_ACCOUNT}@${YOUR_PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/pubsub.viewer"
  ```

## 비순차 모드로 ClickPipe 생성 \{#create-clickpipe\}

**1.** ClickHouse Cloud console에서 **Data Sources > Create ClickPipe**로 이동한 다음 **Google Cloud Storage**를 선택합니다. GCS 버킷에 연결하는 데 필요한 세부 정보를 입력합니다. **Authentication method**에서 **Service Account**를 선택하고 `.json` 서비스 계정 키를 제공합니다.

**2.** **지속적 수집**을 켠 다음, 수집 모드로 **Any order**를 선택하고 버킷에 연결된 구독의 **Pub/Sub subscription** 이름을 입력합니다. 구독 이름은 다음 형식을 따라야 합니다.

```text
projects/${YOUR_PROJECT_ID}/subscriptions/${YOUR_SUBSCRIPTION_NAME}
```

**3.** **Incoming data**를 클릭합니다. 대상 테이블의 **Sorting key**를 정의합니다. 매핑된 schema를 필요에 맞게 조정한 다음, ClickPipes 데이터베이스 사용자의 role을 구성합니다.

**4.** 구성을 검토하고 **Create ClickPipe**를 클릭합니다. ClickPipes는 버킷을 초기 스캔하여 지정된 경로와 일치하는 기존 파일을 모두 로드한 다음, topic에 새 `OBJECT_FINALIZE` 이벤트가 도착하면 파일 처리를 시작합니다.

</VerticalStepper>