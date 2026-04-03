---
title: 'ClickHouse Cloud 배포 모니터링'
slug: /cloud/monitoring
description: 'ClickHouse Cloud의 모니터링 및 관측성 기능 개요'
keywords: ['cloud', '모니터링', '관측성', '메트릭']
sidebar_label: '개요'
sidebar_position: 1
doc_type: 'guide'
---

# ClickHouse Cloud 배포 모니터링 \{#monitoring-your-clickhouse-cloud-deployment\}

## 개요 \{#overview\}

이 가이드는 ClickHouse Cloud를 프로덕션 환경에 배포한 엔터프라이즈 팀을 위해 모니터링 및 관측성 기능에 관한 정보를 제공합니다. 엔터프라이즈 고객은 기본 제공 모니터링 기능, Datadog 및 AWS CloudWatch와 같은 도구를 포함한 기존 관측성 스택과의 통합, 그리고 ClickHouse의 모니터링이 자체 호스팅 배포와 어떻게 비교되는지에 대해 자주 문의합니다.

다음 방법으로 ClickHouse 배포를 모니터링할 수 있습니다.

| 섹션                                                                       | 설명                                                      | 유휴 서비스를 활성화하나요? | 설정 필요                |
| ------------------------------------------------------------------------ | ------------------------------------------------------- | --------------- | -------------------- |
| [Cloud Console dashboards](/cloud/monitoring/cloud-console)              | 서비스 상태, 리소스 사용률, 쿼리 성능을 위한 기본 제공 대시보드를 사용한 일상적인 모니터링    | 아니요             | 없음                   |
| [Notifications](/cloud/notifications)                                    | 스케일링 이벤트, 오류, 뮤테이션, 과금에 대한 알림                           | 아니요             | 없음(사용자 지정 가능)        |
| [Prometheus endpoint](/integrations/prometheus)                          | 메트릭을 Grafana, Datadog 또는 기타 Prometheus 호환 도구로 내보냅니다     | 아니요             | API key + scraper 구성 |
| [System table queries](/cloud/monitoring/system-tables)                  | `system` 테이블에 대한 직접 SQL 쿼리를 통한 심층 디버깅 및 사용자 지정 분석       | 예               | SQL 쿼리               |
| [Community and partner integrations](/cloud/monitoring/integrations)     | Datadog agent 통합, 커뮤니티 모니터링 도구, Billing &amp; Usage API | 상황에 따라 다름       | 도구별                  |
| [Advanced dashboard reference](/cloud/manage/monitor/advanced-dashboard) | 문제 해결 예시를 포함한 각 고급 대시보드 시각화에 대한 상세 참조                   | 아니요             | 없음                   |

## 빠른 시작 \{#quick-start\}

ClickHouse Cloud 콘솔의 **Monitoring** 탭을 여십시오. 이 [블로그](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)에서는 시작할 때 주의해야 할 일반적인 사항을 설명합니다.

대부분의 사용자에게는 [Cloud Console 대시보드](/cloud/monitoring/cloud-console)만으로도 별도의 구성 없이 서비스 상태, 리소스 사용률, 쿼리 성능을 모니터링하는 데 필요한 모든 것을 제공합니다. 외부 모니터링 스택과 통합해야 하는 경우 [Prometheus-compatible metrics endpoint](/integrations/prometheus)부터 시작하십시오.

## 시스템 영향 고려 사항 \{#system-impact\}

위의 접근 방식은 Prometheus 엔드포인트를 사용하거나, ClickHouse Cloud에서 관리되거나, 또는 [시스템 테이블을 직접 쿼리](/cloud/monitoring/system-tables)하는 방식을 조합해 사용합니다. 이 중 마지막 옵션은 운영 ClickHouse 서비스를 쿼리하는 방식에 의존하므로, 관찰 대상 시스템에 쿼리 부하를 추가하고 ClickHouse Cloud 인스턴스가 [유휴 상태가 되지 않게](/manage/scaling) 하여 비용에 영향을 줄 수 있습니다. 또한 운영 시스템에 장애가 발생하면 두 시스템이 결합되어 있으므로 모니터링도 영향을 받을 수 있습니다.

시스템 테이블을 직접 쿼리하는 방식은 심층적인 내부 분석과 디버깅에는 효과적이지만, 실시간 운영 환경 모니터링에는 그다지 적합하지 않습니다. [Cloud Console dashboards](/cloud/monitoring/cloud-console)와 [Prometheus endpoint](/integrations/prometheus)는 모두 유휴 서비스를 깨우지 않는 사전 수집된 메트릭을 사용하므로, 지속적인 운영 환경 모니터링에 더 적합합니다. 상세한 시스템 분석 기능과 운영 오버헤드 사이의 이러한 절충점을 고려하십시오.