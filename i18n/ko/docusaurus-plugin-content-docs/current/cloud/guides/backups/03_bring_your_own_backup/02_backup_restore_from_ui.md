---
sidebar_label: 'UI를 사용하여 백업 또는 복원'
slug: /cloud/manage/backups/backup-restore-via-ui
title: 'UI에서 백업 생성 또는 복원'
description: '사용자 버킷을 사용해 UI에서 백업을 생성하거나 복원하는 방법을 설명하는 페이지입니다.'
sidebar_position: 2
doc_type: 'guide'
keywords: ['backups', 'disaster recovery', 'data protection', 'restore', 'cloud features']
---

import Image from '@theme/IdealImage'
import arn from '@site/static/images/cloud/manage/backups/arn.png'
import change_external_backup from '@site/static/images/cloud/manage/backups/change_external_backup.png'
import configure_arn_s3_details from '@site/static/images/cloud/manage/backups/configure_arn_s3_details.png'
import view_backups from '@site/static/images/cloud/manage/backups/view_backups.png'
import backup_command from '@site/static/images/cloud/manage/backups/backup_command.png'
import gcp_configure from '@site/static/images/cloud/manage/backups/gcp_configure.png'
import gcp_stored_backups from '@site/static/images/cloud/manage/backups/gcp_stored_backups.png'
import gcp_restore_command from '@site/static/images/cloud/manage/backups/gcp_restore_command.png'
import azure_connection_details from '@site/static/images/cloud/manage/backups/azure_connection_details.png'
import view_backups_azure from '@site/static/images/cloud/manage/backups/view_backups_azure.png'
import restore_backups_azure from '@site/static/images/cloud/manage/backups/restore_backups_azure.png'


# 사용자 인터페이스(UI)를 통한 백업 및 복원 \{#ui-experience\}

## AWS \{#AWS\}

### AWS로 백업 전송하기 \{#taking-backups-to-aws\}

#### 1. AWS에서 따라야 할 단계 \{#aws-steps\}

:::note
이 단계는 ["Accessing S3 data securely"](/cloud/data-sources/secure-s3)에 설명된 보안 S3 설정과 유사하지만, 역할 권한 설정에서 추가로 수행해야 할 작업이 있습니다.
:::

AWS 계정에서 다음 단계를 수행하십시오:

<VerticalStepper headerLevel="h5">

##### AWS S3 버킷 생성 \{#create-s3-bucket\}

백업을 내보낼 AWS 계정에 AWS S3 버킷을 생성합니다.

##### IAM 역할 생성 \{#create-iam-role\}

AWS는 역할 기반 인증을 사용하므로, ClickHouse Cloud 서비스가 이 버킷에 쓸 수 있도록 AssumeRole 할 수 있는 IAM 역할을 생성합니다.

* a. ClickHouse Cloud 서비스 설정 페이지에서 「Network security information」 아래에 있는 ARN을 확인합니다. ARN은 다음과 유사한 형태입니다:

<Image img={arn} alt="AWS S3 ARN" size="lg" />

* b. 이 역할에 대해 다음과 같이 신뢰 정책(trust policy)을 생성합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "backup service",
      "Effect": "Allow",
      "Principal": {
        "AWS":  "arn:aws:iam::463754717262:role/CH-S3-bordeaux-ar-90-ue2-29-Role"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

##### 역할에 대한 권한 업데이트 \{#update-permissions-for-role\}

해당 ClickHouse Cloud 서비스가 S3 버킷에 쓸 수 있도록, 이 역할에 대한 권한도 설정해야 합니다.
역할에 대해 아래 예시와 유사한 JSON으로 권한 정책(permissions policy)을 생성하고, 두 곳의 Resource 값에 지정된 버킷 ARN을 사용자 버킷 ARN으로 교체합니다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "s3:Get*",
        "s3:List*",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui/*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::byob-ui/*/.lock"
      ],
      "Effect": "Allow"
    }
  ]
}
```
</VerticalStepper>

#### 2. ClickHouse Cloud에서 따라야 할 단계 \{#cloud-steps\}

ClickHouse Cloud 콘솔에서 다음 단계를 따라 외부 버킷을 구성합니다:

<VerticalStepper headerLevel="h5">

##### 외부 백업 변경 \{#configure-external-bucket\}

「Settings」 페이지에서 「Set up external backup」을 클릭합니다:

<Image img={change_external_backup} alt="외부 백업 변경" size="lg" />

##### AWS IAM Role ARN 및 S3 버킷 세부 정보 구성 \{#configure-aws-iam-role-arn-and-s3-bucket-details\}

다음 화면에서 방금 생성한 AWS IAM Role ARN과 아래 형식의 S3 버킷 URL을 입력합니다:

<Image img={configure_arn_s3_details} alt="AWS IAM Role ARN 및 S3 버킷 세부 정보 구성" size="lg" />

##### 변경 사항 저장 \{#save-changes\}

설정을 저장하려면 「Save External Bucket」을 클릭합니다.

##### 기본 백업 일정 변경 \{#changing-the-backup-schedule\}

이제 외부 백업은 기본 일정에 따라 버킷에서 수행됩니다.
또한 「Settings」 페이지에서 백업 일정을 별도로 구성할 수도 있습니다.
다르게 구성된 경우, 사용자 지정 일정이 버킷으로의 백업을 수행하는 데 사용되고,
기본 일정(24시간마다 백업)은 ClickHouse Cloud에서 소유한 버킷으로의 백업에 사용됩니다.

##### 버킷에 저장된 백업 보기 \{#view-backups-stored-in-your-bucket\}

「Backups」 페이지에는 아래와 같이 버킷에 있는 해당 백업이 별도의 테이블로 표시됩니다:

<Image img={view_backups} alt="버킷에 저장된 백업 보기" size="lg" />

</VerticalStepper>

### AWS에서 백업 복원 \{#restoring-backups-from-aws\}

아래 단계에 따라 AWS에서 백업을 복원합니다.

<VerticalStepper headerLevel="h5">

##### 복원 대상 신규 서비스 생성 \{#create-new-service-to-restore-to\}

백업을 복원할 새 서비스를 생성합니다.

##### 서비스 ARN 추가 \{#add-service-arn\}

새로 생성한 서비스의 ARN(ClickHouse Cloud 콘솔의 서비스 설정 페이지에서 확인 가능)을 IAM 역할의 신뢰 정책에 추가합니다. 이는 위의 AWS 단계 섹션에 있는 [두 번째 단계](#create-iam-role)와 동일합니다. 새 서비스가 S3 버킷에 접근할 수 있도록 하기 위해 필요합니다.

##### 백업 복원에 사용되는 SQL 명령어 가져오기 \{#obtain-sql-command-to-restore-backup\}

UI의 백업 목록 위에 있는 「access or restore a backup」 링크를 클릭하여 백업을 복원하는 SQL 명령어를 가져옵니다. 명령어는 다음과 비슷한 형태입니다.

<Image img={backup_command} alt="백업 복원에 사용되는 SQL 명령어 가져오기" size="md" />

:::warning 백업을 다른 위치로 이동하는 경우
백업을 다른 위치로 이동한 경우, 복원 명령어에서 새 위치를 참조하도록 수정해야 합니다.
:::

:::tip ASYNC 명령어
대규모 복원을 수행할 때 Restore 명령어 끝에 선택적으로 `ASYNC` 명령어를 추가할 수 있습니다.
이렇게 하면 복원이 비동기적으로 수행되어, 연결이 끊기더라도 복원이 계속 진행됩니다.
`ASYNC` 명령어는 즉시 성공 상태를 반환한다는 점이 중요합니다.
이는 복원이 실제로 성공했다는 의미는 아닙니다.
복원이 완료되었는지, 그리고 성공 또는 실패했는지 확인하려면 `system.backups` 테이블을 모니터링해야 합니다.
:::

##### 복원 명령어 실행 \{#run-the-restore-command\}

새로 생성된 서비스의 SQL 콘솔에서 복원 명령어를 실행하여 백업을 복원합니다.

</VerticalStepper>

## GCP \{#gcp\}

### GCP로 백업 저장하기 \{#taking-backups-to-gcp\}

다음 단계를 따라 GCP로 백업을 저장하십시오:

#### GCP에서 따라야 할 단계 \{#gcp-steps-to-follow\}

<VerticalStepper headerLevel="h5">

##### GCP 스토리지 버킷 생성 \{#create-a-gcp-storage-bucket\}

백업을 내보내기 위해 GCP 계정에 스토리지 버킷을 생성합니다.

##### HMAC Key 및 Secret 생성 \{#generate-an-hmac-key-and-secret\}

비밀번호 기반 인증에 필요한 HMAC Key 및 Secret을 생성합니다. 아래 단계를 따라 키를 생성하십시오.

* a. 서비스 계정 생성
  * I.  Google Cloud Console에서 IAM & Admin 섹션으로 이동한 후 `Service Accounts`를 선택합니다.
  * II. `Create Service Account`를 클릭하고 이름과 ID를 입력합니다. `Create and Continue`를 클릭합니다.
  * III. 이 서비스 계정에 Storage Object User 역할을 부여합니다.
  * IV. `Done`을 클릭하여 서비스 계정 생성을 완료합니다.

* b. HMAC 키 생성
  * I. Google Cloud Console에서 Cloud Storage로 이동한 후 `Settings`를 선택합니다.
  * II. Interoperability 탭으로 이동합니다.
  * III. `Service account HMAC` 섹션에서 `Create a key for a service account`를 클릭합니다.
  * IV. 이전 단계에서 생성한 서비스 계정을 드롭다운 메뉴에서 선택합니다.
  * V. `Create key`를 클릭합니다.

* c. 자격 증명을 안전하게 보관:
  * I. 시스템이 Access ID(HMAC key)와 Secret(HMAC secret)을 표시합니다. 이 값을 저장해야 하며, 
       이 창을 닫은 이후에는 Secret이 다시 표시되지 않습니다.

</VerticalStepper>

#### ClickHouse Cloud에서 따라야 할 단계 \{#gcp-cloud-steps\}

외부 버킷을 구성하려면 ClickHouse Cloud 콘솔에서 아래 단계를 따르십시오.

<VerticalStepper headerLevel="h5">

##### 외부 백업 변경 \{#gcp-configure-external-bucket\}

`Settings` 페이지에서 `Change external backup`을 클릭합니다.

<Image img={change_external_backup} alt="외부 백업 변경" size="lg" />

##### GCP HMAC Key 및 Secret 구성 \{#gcp-configure-gcp-hmac-key-and-secret\}

팝업 대화 상자에서 이전 섹션에서 생성한 GCP 버킷 경로, HMAC key 및 Secret을 입력합니다.

<Image img={gcp_configure} alt="GCP HMAC Key 및 Secret 구성" size="md" />

##### 외부 버킷 저장 \{#gcp-save-external-bucket\}

`Save External Bucket`을 클릭하여 설정을 저장합니다.

##### 기본 일정에서 백업 일정 변경 \{#gcp-changing-the-backup-schedule\}

이제 외부 백업은 기본 일정에 따라 버킷에서 수행됩니다.  
또한 `Settings` 페이지에서 백업 일정을 별도로 구성할 수도 있습니다.  
백업 일정이 다르게 구성된 경우, 사용자 지정 일정은 버킷으로 백업을 기록하는 데 사용되고, 기본 일정(24시간마다 백업)은 ClickHouse Cloud 소유 버킷의 백업에 사용됩니다.

##### 버킷에 저장된 백업 보기 \{#gcp-view-backups-stored-in-your-bucket\}

Backups 페이지에는 아래와 같이 해당 버킷에 있는 백업이 별도의 테이블로 표시됩니다.

<Image img={gcp_stored_backups} alt="버킷에 저장된 백업 보기" size="lg" />

</VerticalStepper>

### GCP에서 백업 복원하기 \{#gcp-restoring-backups-from-gcp\}

아래 단계를 따라 GCP에서 백업을 복원하십시오.

<VerticalStepper headerLevel="h5">

##### 복원 대상 새 서비스 생성 \{#gcp-create-new-service-to-restore-to\}

백업을 복원할 새 서비스를 생성합니다.

##### 백업 복원에 사용되는 SQL 명령 가져오기 \{#gcp-obtain-sql-command-to-restore-backup\}

UI의 백업 목록 위에 있는 `access or restore a backup` 링크를 클릭하여 
백업을 복원하는 데 사용할 SQL 명령을 확인합니다. 명령은 다음과 비슷한 형태이며,
드롭다운에서 적절한 백업을 선택하여 해당 백업에 대한 복원 
명령을 가져올 수 있습니다. 이 명령에 비밀 액세스 키(secret access key)를 
추가해야 합니다:

<Image img={gcp_restore_command} alt="백업 복원에 사용되는 SQL 명령 가져오기" size="md" />

:::warning 백업을 다른 위치로 이동하는 경우
백업을 다른 위치로 이동했다면, 새 위치를 참조하도록 복원 명령을 수정해야 합니다.
:::

:::tip ASYNC 명령
대용량 복원의 경우 Restore 명령 끝에 선택적으로 `ASYNC` 명령을 추가할 수 있습니다.
이렇게 하면 복원이 비동기적으로 실행되므로, 연결이 끊어지더라도 복원이 계속 진행됩니다.
단, ASYNC 명령은 즉시 성공 상태를 반환합니다.
이는 복원이 실제로 성공했다는 의미는 아닙니다.
복원이 완료되었는지, 그리고 성공했는지 실패했는지 확인하려면 `system.backups` 테이블을 모니터링해야 합니다.
:::

##### 백업을 복원하기 위한 SQL 명령 실행 \{#gcp-run-sql-command-to-restore-backup\}

새로 생성한 서비스의 SQL 콘솔에서 복원 명령을 실행하여 
백업을 복원합니다.

</VerticalStepper>

## Azure \{#azure\}

### Azure로 백업 수행하기 \{#taking-backups-to-azure\}

다음 단계를 따라 Azure로 백업을 수행합니다:

#### Azure에서 수행할 단계 \{#steps-to-follow-in-azure\}

<VerticalStepper headerLevel="h5">

##### Storage account 생성 \{#azure-create-a-storage-account\}

백업을 저장할 Azure 포털에서 새 storage account를 생성하거나 기존 storage account를 선택합니다.

##### Connection string 가져오기 \{#azure-get-connection-string\}

* a. storage account 개요 페이지에서 `Security + networking` 섹션을 찾은 후 `Access keys`를 클릭합니다.
* b. 여기에서 `key1`과 `key2`를 확인할 수 있습니다. 각 키 아래에 `Connection string` 필드가 있습니다.
* c. `Show`를 클릭하여 connection string을 표시합니다. ClickHouse Cloud에 설정할 때 사용할 connection string을 복사합니다.

</VerticalStepper>

#### ClickHouse Cloud에서 수행할 단계 \{#azure-cloud-steps\}

ClickHouse Cloud 콘솔에서 다음 단계를 수행하여 외부 버킷을 구성합니다:

<VerticalStepper headerLevel="h5">

##### 외부 백업 변경 \{#azure-configure-external-bucket\}

`Settings` 페이지에서 `Change external backup`을 클릭합니다.

<Image img={change_external_backup} alt="외부 백업 변경" size="lg" />

##### Azure 스토리지 계정의 연결 문자열과 컨테이너 이름 제공 \{#azure-provide-connection-string-and-container-name-azure\}

다음 화면에서 이전 섹션에서 생성한 Azure 스토리지 계정의 Connection String과
Container Name을 입력합니다:

<Image img={azure_connection_details} alt="Azure 스토리지 계정의 연결 문자열과 컨테이너 이름 제공" size="md" />

##### 외부 버킷 저장 \{#azure-save-external-bucket\}

설정을 저장하려면 `Save External Bucket`을 클릭합니다.

##### 기본 스케줄에서 백업 스케줄 변경 \{#azure-changing-the-backup-schedule\}

이제 외부 백업은 기본 스케줄에 따라 사용자의 버킷에 생성됩니다. 또한 `Settings` 페이지에서
백업 스케줄을 별도로 구성할 수도 있습니다. 다르게 구성된 경우, 사용자 지정 스케줄은
사용자의 버킷으로 백업을 기록하는 데 사용되고, 기본 스케줄(24시간마다 백업)은
ClickHouse Cloud 소유 버킷에 대한 백업에 사용됩니다.

##### 버킷에 저장된 백업 보기 \{#azure-view-backups-stored-in-your-bucket\}

`Backups` 페이지에는 아래와 같이 버킷에 있는 이러한 백업이 별도의 테이블에
표시됩니다:

<Image img={view_backups_azure} alt="버킷에 저장된 백업 보기" size="md" />

</VerticalStepper>

### Azure에서 백업 복원하기 \{#azure-restore-steps\}

Azure에서 백업을 복원하려면 아래 단계를 따르십시오:

<VerticalStepper headerLevel="h5">

##### 복원 대상이 될 새 서비스 생성 \{#azure-create-new-service-to-restore-to\}

백업을 복원할 새 서비스를 생성합니다. 현재는 새 서비스로만 
백업 복원을 지원합니다.

##### 백업 복원에 사용할 SQL 명령 가져오기 \{#azure-obtain-sql-command-to-restore-backup\}

UI에서 백업 목록 위에 있는 `access or restore a backup` 링크를 클릭하여 
백업을 복원하는 SQL 명령을 가져옵니다. 명령은 다음과 같은 형태이며, 드롭다운에서 적절한 백업을 선택하여 
해당 백업에 대한 복원 명령을 얻을 수 있습니다. 이 명령에 Azure 
storage account 연결 문자열을 추가해야 합니다.

<Image img={restore_backups_azure} alt="Azure에서 백업 복원" size="md" />

:::warning 백업을 다른 위치로 이동하는 경우
백업을 다른 위치로 이동한 경우, 새 위치를 참조하도록 복원 명령을 수정해야 합니다.
:::

:::tip ASYNC 명령
복원 명령의 경우, 대규모 복원을 위해 선택적으로 끝에 `ASYNC` 명령을 추가할 수 있습니다.
이를 통해 복원이 비동기적으로 수행되므로, 연결이 끊기더라도 복원이 계속 실행됩니다.
`ASYNC` 명령은 즉시 성공 상태를 반환한다는 점이 중요합니다.
이는 복원이 실제로 성공했음을 의미하지는 않습니다.
복원이 완료되었는지, 그리고 성공 또는 실패했는지 확인하려면 `system.backups` 테이블을 모니터링해야 합니다.
:::

##### 백업을 복원하기 위한 SQL 명령 실행 \{#azure-run-sql-command-to-restore-backup\}

새로 생성한 서비스의 SQL 콘솔에서 복원 명령을 실행하여 
백업을 복원합니다.

</VerticalStepper>