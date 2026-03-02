---
sidebar_label: '설정 구성'
slug: /manage/settings
title: '설정 구성'
description: '특정 사용자 또는 역할별로 ClickHouse Cloud 서비스 설정을 구성하는 방법'
keywords: ['ClickHouse Cloud', '설정 구성', 'Cloud 설정', '사용자 설정', '역할 설정']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';

# 설정 구성 \{#configuring-settings\}

특정 [사용자](/operations/access-rights#user-account-management) 또는 [역할](/operations/access-rights#role-management)에 대해 ClickHouse Cloud 서비스의 설정을 지정하려면 [SQL 기반 Settings Profiles](/operations/access-rights#settings-profiles-management)을(를) 사용해야 합니다. Settings Profiles를 적용하면 서비스가 중지되거나 유휴 상태가 되거나 업그레이드되더라도 구성한 설정이 유지됩니다. Settings Profiles에 대한 자세한 내용은 [이 페이지](/operations/settings/settings-profiles.md)를 참조하십시오.

XML 기반 Settings Profiles 및 [설정 파일](/operations/configuration-files.md)은 현재 ClickHouse Cloud에서 지원되지 않습니다.

ClickHouse Cloud 서비스에 대해 지정할 수 있는 설정에 대한 자세한 내용은 [문서](/operations/settings)에서 범주별로 가능한 모든 설정을 참조하십시오.

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud 설정 사이드바" border />