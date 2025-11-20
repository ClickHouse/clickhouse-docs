---
'sidebar_label': 'MongoDB Atlas'
'description': 'ClickPipes를 위한 소스로 MongoDB Atlas를 설정하는 방법에 대한 단계별 가이드'
'slug': '/integrations/clickpipes/mongodb/source/atlas'
'title': 'MongoDB Atlas 소스 설정 가이드'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import mongo_atlas_configuration from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-cluster-overview-configuration.png'
import mngo_atlas_additional_settings from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-expand-additional-settings.png'
import mongo_atlas_retention_hours from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-set-retention-hours.png'
import mongo_atlas_add_user from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-add-new-database-user.png'
import mongo_atlas_add_roles from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-database-user-privilege.png'
import mongo_atlas_restrict_access from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongo-atlas-restrict-access.png'
import Image from '@theme/IdealImage';


# MongoDB Atlas 소스 설정 가이드

## oplog 보존 설정 {#enable-oplog-retention}

복제를 위해 최소 24시간의 oplog 보존이 요구됩니다. 초기 스냅샷이 완료되기 전에 oplog가 잘리지 않도록 oplog 보존을 72시간 이상으로 설정하는 것을 권장합니다. UI를 통해 oplog 보존을 설정하려면:

1. MongoDB Atlas 콘솔에서 클러스터의 `개요` 탭으로 이동하여 `구성` 탭을 클릭합니다.
<Image img={mongo_atlas_configuration} alt="클러스터 구성으로 이동" size="lg" border/>

2. `추가 설정`을 클릭하고 `기타 구성 옵션`으로 스크롤합니다.
<Image img={mngo_atlas_additional_settings} alt="추가 설정 확장" size="lg" border/>

3. `기타 구성 옵션`을 클릭하고 최소 oplog 윈도우를 `72시간` 또는 그 이상으로 설정합니다.
<Image img={mongo_atlas_retention_hours} alt="oplog 보존 시간 설정" size="lg" border/>

4. `변경 사항 검토`를 클릭하여 검토한 후 `변경 사항 적용`을 클릭하여 변경 사항을 배포합니다.

## 데이터베이스 사용자 구성 {#configure-database-user}

MongoDB Atlas 콘솔에 로그인한 후, 왼쪽 탐색 바의 보안 탭 아래에서 `데이터베이스 액세스`를 클릭합니다. "새 데이터베이스 사용자 추가"를 클릭합니다.

ClickPipes는 비밀번호 인증을 요구합니다:

<Image img={mongo_atlas_add_user} alt="데이터베이스 사용자 추가" size="lg" border/>

ClickPipes는 다음 역할을 가진 사용자를 요구합니다:

- `readAnyDatabase`
- `clusterMonitor`

이는 `특정 권한` 섹션에서 찾을 수 있습니다:

<Image img={mongo_atlas_add_roles} alt="사용자 역할 구성" size="lg" border/>

ClickPipes 사용자에게 액세스 권한을 부여할 클러스터(들)/인스턴스(들)를 추가로 지정할 수 있습니다:

<Image img={mongo_atlas_restrict_access} alt="클러스터/인스턴스 접근 제한" size="lg" border/>

## 다음 단계는 무엇인가요? {#whats-next}

이제 [ClickPipe를 생성](../index.md)하고 MongoDB 인스턴스에서 ClickHouse Cloud로 데이터를 수집할 수 있습니다. MongoDB 인스턴스를 설정할 때 사용한 연결 세부 정보를 메모해 두어야 ClickPipe 생성 과정에서 필요합니다.
