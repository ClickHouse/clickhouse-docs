---
sidebar_label: 'MongoDB Atlas 소스'
description: 'MongoDB Atlas를 ClickPipes 소스로 설정하는 방법을 단계별로 설명하는 가이드'
slug: /integrations/clickpipes/mongodb/source/atlas
title: 'MongoDB Atlas 소스 설정 가이드'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas 소스 설정 가이드 \{#mongodb-atlas-source-setup-guide\}

## oplog 보존 기간 구성 \{#enable-oplog-retention\}

복제를 위해서는 최소 24시간의 oplog 보존 기간이 필요합니다. 초기 스냅샷이 완료되기 전에 oplog가 잘려 나가지 않도록, oplog 보존 기간을 72시간 이상으로 설정할 것을 권장합니다. UI에서 oplog 보존 기간을 설정하려면:

1. MongoDB Atlas 콘솔에서 클러스터의 `Overview` 탭으로 이동한 후 `Configuration` 탭을 클릭합니다.

<Image img={mongo_atlas_configuration} alt="클러스터 구성 화면으로 이동" size="lg" border/>

2. `Additional Settings`를 클릭한 후 아래로 스크롤하여 `More Configuration Options`를 찾습니다.

<Image img={mngo_atlas_additional_settings} alt="추가 설정 확장" size="lg" border/>

3. `More Configuration Options`를 클릭한 후 최소 oplog 윈도우를 `72 hours` 이상으로 설정합니다.

<Image img={mongo_atlas_retention_hours} alt="oplog 보존 시간 설정" size="lg" border/>

4. `Review Changes`를 클릭하여 변경 사항을 검토한 다음, `Apply Changes`를 클릭하여 변경 사항을 배포합니다.

## 데이터베이스 사용자 구성 \{#configure-database-user\}

MongoDB Atlas 콘솔에 로그인한 후 왼쪽 내비게이션 바의 Security 탭에서 `Database Access`를 클릭합니다. 그런 다음 「Add New Database User」를 클릭합니다.

ClickPipes에는 비밀번호 기반 인증이 필요합니다.

<Image img={mongo_atlas_add_user} alt="데이터베이스 사용자 추가" size="lg" border/>

ClickPipes에는 다음 역할을 가진 사용자가 필요합니다.

- `readAnyDatabase`
- `clusterMonitor`

이 역할은 `Specific Privileges` 섹션에서 찾을 수 있습니다.

<Image img={mongo_atlas_add_roles} alt="사용자 역할 구성" size="lg" border/>

ClickPipes 사용자에 대한 액세스 권한을 부여할 클러스터/인스턴스를 보다 구체적으로 지정할 수도 있습니다.

<Image img={mongo_atlas_restrict_access} alt="클러스터/인스턴스 액세스 제한" size="lg" border/>

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 MongoDB 인스턴스에서 ClickHouse Cloud로 데이터 수집을 시작할 수 있습니다.
MongoDB 인스턴스를 설정할 때 사용한 연결 정보를 반드시 기록해 두십시오. ClickPipe를 생성하는 과정에서 이 연결 정보가 필요합니다.