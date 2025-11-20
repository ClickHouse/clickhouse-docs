---
'sidebar_label': '설정 구성하기'
'slug': '/manage/settings'
'title': '설정 구성하기'
'description': '특정 사용자 또는 역할을 위한 ClickHouse Cloud 서비스의 설정을 구성하는 방법'
'keywords':
- 'ClickHouse Cloud'
- 'settings configuration'
- 'cloud settings'
- 'user settings'
- 'role settings'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import cloud_settings_sidebar from '@site/static/images/cloud/manage/cloud-settings-sidebar.png';


# 설정 구성

특정 [사용자](/operations/access-rights#user-account-management) 또는 [역할](/operations/access-rights#role-management)에 대한 ClickHouse Cloud 서비스의 설정을 지정하려면 [SQL 기반 설정 프로파일](/operations/access-rights#settings-profiles-management)을 사용해야 합니다. 설정 프로파일을 적용하면 서비스를 중단하거나 유휴 상태가 되거나 업그레이드할 때에도 구성한 설정이 유지됩니다. 설정 프로파일에 대한 자세한 내용은 [이 페이지](/operations/settings/settings-profiles.md)를 참조하십시오.

현재 ClickHouse Cloud에서는 XML 기반 설정 프로파일과 [구성 파일](/operations/configuration-files.md)을 지원하지 않는다는 점에 유의하십시오.

ClickHouse Cloud 서비스에 대해 지정할 수 있는 설정에 대한 자세한 내용은 [우리 문서](/operations/settings)에서 카테고리별로 가능한 모든 설정을 확인하십시오.

<Image img={cloud_settings_sidebar} size="sm" alt="Cloud settings sidebar" border/>
