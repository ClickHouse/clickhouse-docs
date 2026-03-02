---
sidebar_label: '백업 일정 구성'
slug: /cloud/manage/backups/configurable-backups
description: '백업을 구성하는 방법을 설명하는 가이드'
title: '백업 일정 구성'
keywords: ['백업', 'Cloud 백업', '복원']
doc_type: 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="구성 가능한 백업" linking_verb_are="True" />

서비스의 백업 스케줄을 설정하려면 콘솔에서 **Settings** 탭으로 이동한 후 **Change backup configuration**을 클릭합니다.

<Image img={backup_settings} size="lg" alt="백업 설정 구성" border />

그러면 오른쪽에 탭이 열리고 여기에서 보존 기간, 빈도, 시작 시간을 선택할 수 있습니다. 선택한 설정이 적용되도록 저장해야 합니다.

<Image img={backup_configuration_form} size="lg" alt="백업 보존 기간과 빈도 선택" border />

:::note
시작 시간과 빈도는 상호 배타적입니다. 시작 시간이 우선합니다.
:::

:::note
백업 스케줄을 변경하면 일부 백업이 서비스의 기본 백업에 포함되지 않을 수 있어 스토리지 요금의 월간 청구액이 증가할 수 있습니다. 아래의 [&quot;백업 비용 이해하기&quot;](/cloud/manage/backups/overview#understanding-backup-cost) 섹션을 참조하십시오.
:::
