---
title: '알림'
slug: /cloud/notifications
description: 'ClickHouse Cloud 서비스 알림'
keywords: ['클라우드', '알림', '경고', '서비스 알림', '청구 알림']
sidebar_label: '알림'
sidebar_position: 3
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';


# 알림 \{#notifications\}

ClickHouse Cloud는 서비스 또는 조직과 관련된 중요한 이벤트에 대해 알림을 전송합니다. 알림이 어떻게 전송되고 구성되는지 이해하려면 몇 가지 개념을 알아두어야 합니다.

1. **알림 범주**: 청구 알림, 서비스 관련 알림 등과 같은 알림 그룹을 의미합니다. 각 범주에는 전달 방식을 구성할 수 있는 여러 알림이 있습니다.
2. **알림 심각도**: 알림의 중요도에 따라 알림 심각도는 `info`, `warning`, `critical`일 수 있습니다. 이는 구성할 수 없습니다.
3. **알림 채널**: 채널은 UI, 이메일, Slack 등 알림을 수신하는 방식을 의미합니다. 이는 대부분의 알림에서 구성할 수 있습니다.

## 알림 수신 \{#receiving-notifications\}

알림은 다양한 채널을 통해 수신할 수 있습니다. ClickHouse Cloud는 이메일, ClickHouse Cloud UI, Slack을 통해 알림을 수신할 수 있도록 지원합니다. 현재 알림을 보려면 왼쪽 상단 메뉴의 종 아이콘을 클릭하십시오. 그러면 플라이아웃이 열립니다. 플라이아웃 하단의 **View All** 버튼을 클릭하면 모든 알림의 활동 로그를 보여주는 페이지로 이동합니다.

<Image img={notifications_1} size="md" alt="ClickHouse Cloud 알림 플라이아웃" border />

<Image img={notifications_2} size="md" alt="ClickHouse Cloud 알림 활동 로그" border />

## 알림 사용자 지정 \{#customizing-notifications\}

각 알림마다 알림을 수신하는 방식을 사용자 지정할 수 있습니다. 설정 화면은 알림 플라이아웃 또는 알림 활동 로그의 두 번째 탭에서 열 수 있습니다.

Cloud UI를 통해 전달되는 알림은 사용자별로 사용자 지정할 수 있으며, 이러한 설정은 각 사용자에게 개별적으로 반영됩니다. 본인 이메일로 전달되는 알림도 사용자 지정할 수 있지만, 사용자 지정 이메일로 전달되는 알림과 Slack 채널로 전달되는 알림은 관리자 권한이 있는 사용자만 사용자 지정할 수 있습니다.

특정 알림의 전달 방식을 구성하려면 연필 아이콘을 클릭하여 알림 전달 채널을 수정하십시오.

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
**Payment failed**와 같은 일부 **필수** 알림은 구성할 수 없습니다.
:::

## 서비스 알림 \{#service-notifications\}

ClickHouse는 특정 경고 조건이 충족되면 서비스 알림을 전송합니다. ClickHouse Cloud의 서비스 알림에 대한 자세한 내용은 아래를 참조하십시오.

| 알림 시점            | 구체적인 경고 조건                                                          | 기본 알림 채널            | 해결 단계                                                                                                   |
| ---------------- | ------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| 클러스터를 확장할 수 없음   | 권장 클러스터 크기가 수직 확장의 최대 제한을 초과할 때입니다. 권장 클러스터 크기가 변경되면 새 알림이 생성됩니다.   |                     | 레플리카당 자동 확장 최대 크기 제한을 늘리는 것을 고려하십시오. [scaling](/manage/scaling)을 참조하십시오.                                |
| 파트가 너무 많음 오류     | &#39;too many parts&#39; 오류가 감지될 때입니다. 알림은 달력 기준으로 하루에 한 번만 트리거됩니다. | 관리자 사용자는 이메일을 받습니다. | 삽입을 batch 처리하는 것을 고려하십시오. [Exception: Too many parts](/knowledgebase/exception-too-many-parts)를 참조하십시오. |
| 실패한 뮤테이션         | 뮤테이션이 15분 동안 실패 상태인 경우입니다. 알림은 달력 기준으로 하루에 한 번만 트리거됩니다.             | 관리자 사용자는 이메일을 받습니다. | 실패한 뮤테이션을 중지하십시오. [Avoid mutations](/best-practices/avoid-mutations)를 참조하십시오.                           |
| 높은 쿼리 동시성        | 쿼리 동시성이 레플리카당 1,000을 초과할 때입니다. 알림은 달력 기준으로 하루에 한 번만 트리거됩니다.         | 관리자 사용자는 이메일을 받습니다. | 레플리카 추가를 고려하십시오.                                                                                        |
| 클러스터 확장 완료       | 클러스터 크기가 변경될 때입니다.                                                  |                     | 해당 없음                                                                                                   |
| 클러스터를 축소할 수 없음   | 권장 클러스터 크기가 수직 확장의 최대 제한을 초과할 때입니다. 권장 클러스터 크기가 변경되면 새 알림이 생성됩니다.   |                     | 레플리카당 자동 확장 최소 크기 제한을 낮추는 것을 고려하십시오. [scaling](/manage/scaling)을 참조하십시오.                                |
| ClickHouse 버전 변경 | ClickHouse 서비스 버전 업데이트가 시작될 때와 완료될 때입니다.                            |                     | 해당 없음                                                                                                   |

## ClickPipes 알림 \{#clickpipes-notifications\}

ClickHouse는 ClickPipe에 장애나 문제가 발생하면 ClickPipes 알림을 전송합니다. 

## 청구 알림 \{#billing-notifications\}

ClickHouse는 결제 관련 문제가 발생하거나 선불 약정 사용량이 특정 임곗값에 도달하면 청구 알림을 전송합니다. 

## 지원되는 알림 \{#supported-notifications\}

현재 결제 관련 알림(결제 실패, 사용량이 특정 임곗값을 초과한 경우 등)과 스케일링 이벤트 관련 알림(스케일링 완료, 스케일링 차단 등)을 전송합니다.

## 관련 페이지 \{#related\}

* [Cloud Console 모니터링](/cloud/monitoring/cloud-console) — 서비스 상태, 리소스, 쿼리 성능을 확인할 수 있는 기본 제공 대시보드
* [모니터링 개요](/cloud/monitoring) — ClickHouse Cloud의 모든 모니터링 방법을 비교합니다

:::note
크레딧 임곗값 알림은 현재 약정 지출 계약이 있는 조직에서만 사용할 수 있습니다. 종량제(PAYG) 조직에는 이러한 알림이 제공되지 않습니다.
:::