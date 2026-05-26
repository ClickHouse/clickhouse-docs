---
slug: /cloud/managed-postgres/monitoring/dashboard
sidebar_label: '대시보드'
title: 'Managed Postgres 모니터링 대시보드'
description: 'Managed Postgres 서비스를 위한 Cloud Console 기본 제공 대시보드'
keywords: ['managed postgres', '모니터링', '대시보드', 'Cloud Console', 'cpu', 'memory', 'iops']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import dashboard from '@site/static/images/managed-postgres/monitoring/dashboard.png';

# 모니터링 대시보드 \{#monitoring-dashboard\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-dashboard" />

인스턴스의 왼쪽 사이드바에 있는 **모니터링** 탭에는
선택한 기간 동안의 리소스 사용량과 데이터베이스 활동을 보여주는
실시간 차트가 표시됩니다.

<Image img={dashboard} alt="IOPS, CPU 사용량, 메모리, 디스크, 네트워크 트래픽, 데이터베이스 크기, 연결, 처리량, 트랜잭션, 캐시 적중률, 교착 상태를 보여주는 모니터링 대시보드" size="lg" border />

## 패널 \{#panels\}

대시보드는 메트릭을 다음 패널로 나눠 보여줍니다:

* **IOPS** — 초당 디스크 읽기 및 쓰기 작업 수
* **CPU usage** — `user`, `system`, `iowait`, `softirq`,
  `steal`별 사용량
* **Memory usage** — 전체 대비 사용 중인 메모리, 캐시, 버퍼의
  비율
* **Disk usage** — 서비스에 할당된 스토리지 대비 사용 중인 파일 시스템
  공간의 비율
* **Network traffic** — 수신 및 전송된 바이트 수
* **Database size** — 데이터베이스별 바이트 수(`postgres`
  기본 데이터베이스와 사용자가 생성한 모든 데이터베이스 포함)
* **Connection count** — 활성 및 유휴 연결 수
* **Operation throughput** — 초당 fetch, 삽입, 업데이트 및 삭제
  수
* **Transactions** — 초당 커밋 및 롤백 수
* **Cache hit ratio** — 디스크가 아니라 버퍼 캐시에서 처리된 block
  읽기의 비율
* **Deadlocks** — 서버에서 감지된 교착 상태

## 시간 범위 \{#time-period\}

**시간 범위** 선택기를 사용하여 지난 1시간, 1일,
1주 또는 사용자 지정 범위로 변경할 수 있습니다.

## 관련 페이지 \{#related\}

* [Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus) — 동일한 메트릭을 자체 관측성 스택으로 스크레이프합니다
* [메트릭 참고](/cloud/managed-postgres/monitoring/metrics) — 타입과 레이블이 포함된 전체 메트릭 목록