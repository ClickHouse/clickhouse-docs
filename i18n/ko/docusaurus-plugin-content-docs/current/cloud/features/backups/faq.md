---
slug: /cloud/features/backups/faq
sidebar_label: '백업 FAQ'
title: '백업 청구 금액 차이 FAQ'
description: 'ClickHouse Cloud 백업 청구 및 보관에 관한 자주 묻는 질문'
keywords: ['backups', 'cloud backups', 'billing', 'retention', 'faq']
doc_type: 'reference'
---

### 백업 스토리지 비용이 왜 오르나요? \{#why-bill-going-up\}

ClickHouse Cloud는 안정적인 복구를 위해 전체 백업과 증분 백업을 조합해 데이터 백업 버전을 최대 8개까지 유지합니다. 이전에는 인보이스에 이 데이터의 일부만 반영되었습니다. 2026년 07월 01일부터는 청구 금액이 서비스에 실제로 유지되는 스토리지 용량과 일치하도록 이를 교정합니다.

:::note
백업 스토리지의 GB당 가격은 변경되지 않았습니다. 이번 교정은 인보이스에 표시되는 백업 버전 수가 서비스에 실제로 유지되는 수와 일치하도록 조정합니다.
:::

### 요금 인상인가요? \{#is-this-a-price-increase\}

아닙니다. GB당 요금은 변경되지 않았습니다. 인보이스에 포함되는 백업 버전 수를 바로잡는 것입니다.

### 과거에 적게 청구된 금액도 나중에 청구되나요? \{#past-undercharges\}

아니요. 이전 청구 기간의 요금을 소급 적용하거나 추가 청구하지 않습니다. 교정은 2026년 7월 1일 이후의 청구에만 적용됩니다.

### 보관 중인 모든 백업 버전은 어디에서 확인할 수 있나요? \{#see-backup-versions\}

보관 중인 모든 백업 버전은 4월 23일부터 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 또한 특정 버전이 현재 과금 중인지, 아니면 보관 중이지만 아직 과금되지 않은 상태인지도 확인할 수 있습니다. 업데이트된 [요금 계산기](https://clickhouse.com/pricing)에도 이러한 비용이 반영되어 있습니다.

### 질문이 있으면 누구에게 문의해야 합니까? \{#contact\}

[ClickHouse Support](https://clickhouse.com/support/program)로 문의하십시오. 구체적인 상황에 대해서는 담당 팀과도 상의하실 수 있습니다.

### 이것이 백업의 신뢰성이나 가용성에 영향을 주나요? \{#reliability\}

아닙니다. 백업 범위, 보존 기간, 복구 기능은 변경되지 않습니다. 백업의 저장 방식이나 관리 방식은 그대로이며, 백업 과금 방식만 바로잡는 것입니다.

### 자세한 내용은 어디에서 확인할 수 있습니까? \{#more-details\}

4월 23일에 자세한 내용이 담긴 안내 이메일이 발송될 예정입니다. 실제 백업 비용을 더 정확하게 추산하려면 [요금 계산기](https://clickhouse.com/pricing)를 사용할 수 있습니다.

### 청구 변경 사항은 언제부터 시행되나요? \{#when-changes-go-live\}

청구 변경 사항은 최초 공지 후 60일이 지난 2026년 7월 1일부터 적용됩니다.