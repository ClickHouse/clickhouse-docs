---
'sidebar_label': 'UI를 사용하여 백업 또는 복원'
'slug': '/cloud/manage/backups/backup-restore-via-ui'
'title': 'UI에서 백업을 만들거나 백업을 복원하는 방법'
'description': 'UI에서 자신의 버킷을 사용하여 백업을 만들거나 백업을 복원하는 방법에 대한 페이지'
'sidebar_position': 2
'doc_type': 'guide'
'keywords':
- 'backups'
- 'disaster recovery'
- 'data protection'
- 'restore'
- 'cloud features'
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


# Backup / restore via user-interface {#ui-experience}

## AWS {#AWS}

### Taking backups to AWS {#taking-backups-to-aws}

#### 1. Steps to follow in AWS {#aws-steps}

:::note
이 단계는 ["S3 데이터에 안전하게 접근하기"](/cloud/data-sources/secure-s3)에 설명된 안전한 s3 설정과 유사하지만, 역할 권한에서 추가적인 작업이 필요합니다.
:::

AWS 계정에서 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Create an AWS S3 bucket {#create-s3-bucket}

백업을 내보낼 AWS S3 버킷을 귀하의 계정에 만듭니다.

##### Create an IAM role {#create-iam-role}

AWS는 역할 기반 인증을 사용하므로, ClickHouse Cloud 서비스가 이 버킷에 쓸 수 있도록 가정할 수 있는 IAM 역할을 생성합니다.

* a. ClickHouse Cloud 서비스 설정 페이지의 네트워크 보안 정보에서 ARNs를 얻습니다. 이는 다음과 유사하게 보입니다:

<Image img={arn} alt="AWS S3 ARN" size="lg" />

* b. 이 역할을 위해 다음과 같은 신뢰 정책을 생성합니다:

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

##### Update permissions for role {#update-permissions-for-role}

이 ClickHouse Cloud 서비스가 S3 버킷에 쓸 수 있도록 이 역할에 대해 권한을 설정해야 합니다.
이는 역할을 위한 권한 정책을 생성하여 아래와 같은 JSON을 사용하여 수행됩니다. 여기서 두 군데에 귀하의 버킷 ARN을 대체해야 합니다.

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

#### 2. Steps to follow in ClickHouse Cloud {#cloud-steps}

ClickHouse Cloud 콘솔에서 외부 버킷을 구성하기 위해 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Change external backup {#configure-external-bucket}

설정 페이지에서 외부 백업 설정을 클릭합니다:

<Image img={change_external_backup} alt="Change external backup" size="lg" />

##### Configure AWS IAM Role ARN and S3 bucket details {#configure-aws-iam-role-arn-and-s3-bucket-details}

다음 화면에서 방금 생성한 AWS IAM Role ARN 및 S3 버킷 URL을 다음 형식으로 제공합니다:

<Image img={configure_arn_s3_details} alt="Configure AWS IAM Role ARN and S3 bucket details" size="lg" />

##### Save changes {#save-changes}

“외부 버킷 저장”을 클릭하여 설정을 저장합니다.

##### Changing the backup schedule from the default schedule {#changing-the-backup-schedule}

이제 외부 백업은 기본 일정에 따라 귀하의 버킷에서 수행됩니다.
또는 “설정” 페이지에서 백업 일정을 구성할 수 있습니다.
다르게 구성할 경우, 사용자 정의 일정이 귀하의 버킷에 백업을 작성하는 데 사용되며, 기본 일정(24시간마다 백업)은 ClickHouse 클라우드 소유의 버킷에서 백업에 사용됩니다.

##### View backups stored in your bucket {#view-backups-stored-in-your-bucket}

백업 페이지는 아래와 같이 귀하의 버킷에 있는 백업을 별도의 테이블로 표시합니다:

<Image img={view_backups} alt="View backups stored in your bucket" size="lg" />

</VerticalStepper>

### Restoring backups from AWS {#restoring-backups-from-aws}

AWS에서 백업을 복원하려면 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Create a new service to restore to {#create-new-service-to-restore-to}

복원할 새로운 서비스를 만듭니다.

##### Add service ARN {#add-service-arn}

새로 생성된 서비스의 ARN(ClickHouse Cloud 콘솔의 서비스 설정 페이지에서)을 IAM 역할의 신뢰 정책에 추가합니다. 이는 위 AWS 단계 섹션의 [두 번째 단계](#create-iam-role)와 동일합니다. 이는 새로운 서비스가 S3 버킷에 접근할 수 있도록 하기 위해 필요합니다.

##### Get SQL command used to restore backup {#obtain-sql-command-to-restore-backup}

UI에서 백업 목록 위의 “백업 접근 또는 복원” 링크를 클릭하여 백업을 복원하는 데 사용되는 SQL 명령을 가져옵니다. 명령은 다음과 같아야 합니다:

<Image img={backup_command} alt="Get SQL command used to restore backup" size="md" />

:::warning Moving backups to another location
백업을 다른 위치로 이동하면 새 위치를 참조하도록 복원 명령을 사용자 지정해야 합니다.
:::

:::tip ASYNC command
복원 명령의 경우, 대량 복원을 위해 마지막에 `ASYNC` 명령을 추가할 수도 있습니다.
이렇게 하면 복원이 비동기적으로 발생하여 연결이 끊어지더라도 복원이 계속 진행됩니다.
`ASYNC` 명령은 즉시 성공 상태를 반환합니다.
이것은 복원이 성공적이었다는 것을 의미하지 않습니다.
복원 완료 및 성공 여부를 확인하기 위해 `system.backups` 테이블을 모니터링해야 합니다.
:::

##### Run the restore command {#run-the-restore-command}

새로 생성된 서비스의 SQL 콘솔에서 복원 명령을 실행하여 백업을 복원합니다.

</VerticalStepper>

## GCP {#gcp}

### Taking backups to GCP {#taking-backups-to-gcp}

GCP에 백업을 수행하려면 아래 단계를 따르세요:

#### Steps to follow in GCP {#gcp-steps-to-follow}

<VerticalStepper headerLevel="h5">

##### Create a GCP storage bucket {#create-a-gcp-storage-bucket}

백업을 내보낼 GCP 계정에 스토리지 버킷을 생성합니다.

##### Generate an HMAC Key and Secret {#generate-an-hmac-key-and-secret}

비밀번호 기반 인증에 필요한 HMAC Key 및 Secret을 생성합니다. 아래 단계를 따라 키를 생성합니다:

* a. 서비스 계정을 생성합니다.
  * I. Google Cloud Console에서 IAM 및 관리 섹션으로 이동하여 `서비스 계정`을 선택합니다.
  * II. `서비스 계정 생성`을 클릭하고 이름 및 ID를 제공합니다. `생성 후 계속`을 클릭합니다.
  * III. 스토리지 객체 사용자 역할을 이 서비스 계정에 부여합니다.
  * IV. 서비스 계정 생성을 완료하려면 `완료`를 클릭합니다.

* b. HMAC 키를 생성합니다.
  * I. Google Cloud Console에서 클라우드 스토리지로 가서 `설정`을 선택합니다.
  * II. 상호 운용성 탭으로 이동합니다.
  * III. `서비스 계정 HMAC` 섹션에서 `서비스 계정용 키 생성`을 클릭합니다.
  * IV. 이전 단계에서 생성한 서비스 계정을 드롭다운 메뉴에서 선택합니다.
  * V. `키 생성`을 클릭합니다.

* c. 자격 증명을 안전하게 저장합니다:
  * I. 시스템이 Access ID(당신의 HMAC 키)와 Secret(당신의 HMAC 비밀)을 표시합니다. 이 값을 저장하세요. 비밀은 이 창을 닫은 후 다시는 표시되지 않습니다.

</VerticalStepper>

#### Steps to follow in ClickHouse Cloud {#gcp-cloud-steps}

ClickHouse Cloud 콘솔에서 외부 버킷을 구성하기 위해 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Change external backup {#gcp-configure-external-bucket}

`설정` 페이지에서 `외부 백업 변경`을 클릭합니다.

<Image img={change_external_backup} alt="Change external backup" size="lg" />

##### Configure GCP HMAC Key and Secret {#gcp-configure-gcp-hmac-key-and-secret}

팝업 대화 상자에서 GCP 버킷 경로, 이전 섹션에서 생성한 HMAC 키 및 비밀을 제공합니다.

<Image img={gcp_configure} alt="Configure GCP HMAC Key and Secret" size="md" />

##### Save external bucket {#gcp-save-external-bucket}

`외부 버킷 저장`을 클릭하여 설정을 저장합니다.

##### Changing the backup schedule from the default schedule {#gcp-changing-the-backup-schedule}

이제 외부 백업은 기본 일정에 따라 귀하의 버킷에서 수행됩니다.
또는 `설정` 페이지에서 백업 일정을 구성할 수 있습니다.
다르게 구성할 경우, 사용자 정의 일정이 귀하의 버킷에 백업을 작성하는 데 사용되며, 기본 일정(24시간마다 백업)은 ClickHouse 클라우드 소유의 버킷에서 백업에 사용됩니다.

##### View backups stored in your bucket {#gcp-view-backups-stored-in-your-bucket}

백업 페이지는 아래와 같이 귀하의 버킷에 있는 백업을 별도의 테이블로 표시합니다:

<Image img={gcp_stored_backups} alt="View backups stored in your bucket" size="lg" />

</VerticalStepper>

### Restoring backups from GCP {#gcp-restoring-backups-from-gcp}

GCP에서 백업을 복원하려면 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Create a new service to restore to {#gcp-create-new-service-to-restore-to}

복원할 새로운 서비스를 만듭니다.

##### Get SQL command used to restore backup {#gcp-obtain-sql-command-to-restore-backup}

UI에서 백업 목록 위의 `백업 접근 또는 복원` 링크를 클릭하여 백업을 복원하는 데 사용되는 SQL 명령을 가져옵니다. 명령은 다음과 같아야 하며, 드롭다운에서 적절한 백업을 선택하여 해당 특정 백업의 복원 명령을 가져옵니다. 명령에 비밀 액세스 키를 추가해야 합니다:

<Image img={gcp_restore_command} alt="Get SQL command used to restore backup" size="md" />

:::warning Moving backups to another location
백업을 다른 위치로 이동하면 새 위치를 참조하도록 복원 명령을 사용자 지정해야 합니다.
:::

:::tip ASYNC command
복원 명령의 경우, 대량 복원을 위해 마지막에 `ASYNC` 명령을 추가할 수도 있습니다.
이렇게 하면 복원이 비동기적으로 발생하여 연결이 끊어지더라도 복원이 계속 진행됩니다.
`ASYNC` 명령은 즉시 성공 상태를 반환합니다.
이것은 복원이 성공적이었다는 것을 의미하지 않습니다.
복원 완료 및 성공 여부를 확인하기 위해 `system.backups` 테이블을 모니터링해야 합니다.
:::

##### Run SQL command to restore backup {#gcp-run-sql-command-to-restore-backup}

새로 생성된 서비스의 SQL 콘솔에서 복원 명령을 실행하여 백업을 복원합니다.

</VerticalStepper>

## Azure {#azure}

### Taking backups to Azure {#taking-backups-to-azure}

Azure에 백업을 수행하려면 아래 단계를 따르세요:

#### Steps to follow in Azure {#steps-to-follow-in-azure}

<VerticalStepper headerLevel="h5">

##### Create a storage account {#azure-create-a-storage-account}

백업을 저장할 Azure 포털의 스토리지 계정을 생성하거나 기존 스토리지 계정을 선택합니다.

##### Get connection string {#azure-get-connection-string}

* a. 스토리지 계정 개요에서 `보안 + 네트워킹`이라는 섹션을 찾아 `액세스 키`를 클릭합니다.
* b. 여기에서 `key1` 및 `key2`를 확인할 수 있습니다. 각 키 아래에는 `연결 문자열` 필드가 있습니다.
* c. `표시`를 클릭하여 연결 문자열을 확인합니다. ClickHouse Cloud에 설정하는 데 사용할 연결 문자열을 복사합니다.

</VerticalStepper>

#### Steps to follow in ClickHouse Cloud {#azure-cloud-steps}

ClickHouse Cloud 콘솔에서 외부 버킷을 구성하기 위해 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Change external backup {#azure-configure-external-bucket}

`설정` 페이지에서 `외부 백업 변경`을 클릭합니다.

<Image img={change_external_backup} alt="Change external backup" size="lg" />

##### Provide connection string and container name for your Azure storage account {#azure-provide-connection-string-and-container-name-azure}

다음 화면에서 이전 섹션에 생성된 Azure 스토리지 계정의 연결 문자열 및 컨테이너 이름을 제공합니다:

<Image img={azure_connection_details} alt="Provide connection string and container name for your Azure storage account" size="md" />

##### Save external bucket {#azure-save-external-bucket}

`외부 버킷 저장`을 클릭하여 설정을 저장합니다.

##### Changing the backup schedule from the default schedule {#azure-changing-the-backup-schedule}

이제 외부 백업은 기본 일정에 따라 귀하의 버킷에서 수행됩니다. 또는 “설정” 페이지에서 백업 일정을 구성할 수 있습니다. 다르게 구성할 경우, 사용자 정의 일정이 귀하의 버킷에 백업을 작성하는 데 사용되며, 기본 일정(24시간마다 백업)은 ClickHouse 클라우드 소유의 버킷에서 백업에 사용됩니다.

##### View backups stored in your bucket {#azure-view-backups-stored-in-your-bucket}

백업 페이지는 아래와 같이 귀하의 버킷에 있는 백업을 별도의 테이블로 표시합니다:

<Image img={view_backups_azure} alt="View backups stored in your bucket" size="md" />

</VerticalStepper>

### Restoring backups from Azure {#azure-restore-steps}

Azure에서 백업을 복원하려면 아래 단계를 따르세요:

<VerticalStepper headerLevel="h5">

##### Create a new service to restore to {#azure-create-new-service-to-restore-to}

복원할 새로운 서비스를 만듭니다. 현재는 새로운 서비스에만 백업 복원을 지원합니다.

##### Get SQL command used to restore backup {#azure-obtain-sql-command-to-restore-backup}

UI에서 백업 목록 위의 `백업 접근 또는 복원` 링크를 클릭하여 백업을 복원하는 데 사용되는 SQL 명령을 가져옵니다. 명령은 다음과 같아야 하며, 드롭다운에서 적절한 백업을 선택하여 해당 특정 백업의 복원 명령을 가져옵니다. 명령에 Azure 스토리지 계정 연결 문자열을 추가해야 합니다.

<Image img={restore_backups_azure} alt="Restore backups in Azure" size="md" />

:::warning Moving backups to another location
백업을 다른 위치로 이동하면 새 위치를 참조하도록 복원 명령을 사용자 지정해야 합니다.
:::

:::tip ASYNC command
복원 명령의 경우, 대량 복원을 위해 마지막에 `ASYNC` 명령을 추가할 수도 있습니다.
이렇게 하면 복원이 비동기적으로 발생하여 연결이 끊어지더라도 복원이 계속 진행됩니다.
`ASYNC` 명령은 즉시 성공 상태를 반환합니다.
이것은 복원이 성공적이었다는 것을 의미하지 않습니다.
복원 완료 및 성공 여부를 확인하기 위해 `system.backups` 테이블을 모니터링해야 합니다.
:::

##### Run SQL command to restore backup {#azure-run-sql-command-to-restore-backup}

새로 생성된 서비스의 SQL 콘솔에서 복원 명령을 실행하여 백업을 복원합니다.

</VerticalStepper>
