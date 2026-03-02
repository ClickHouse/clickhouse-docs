---
sidebar_label: 'AlloyDB Postgres'
description: 'ClickPipes 소스로 사용할 AlloyDB Postgres 인스턴스 설정'
slug: /integrations/clickpipes/postgres/source/alloydb
title: 'AlloyDB Postgres 소스 설정 가이드'
doc_type: 'guide'
---

import edit_instance from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/1_edit_instance.png';
import set_flags from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/2_set_flags.png';
import verify_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/3_verify_logical_replication.png';
import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/4_configure_network_security.png';
import configure_network_security2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/5_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# AlloyDB Postgres 소스 설정 가이드 \{#alloydb-postgres-source-setup-guide\}

## 지원되는 버전 \{#supported-versions\}

ClickPipes를 사용하여 AlloyDB 인스턴스에서 ClickHouse Cloud로 데이터를 전송하려면, 인스턴스를 **논리 복제(logical replication)**를 위해 구성해야 합니다. 이는 **AlloyDB 14 버전부터** 지원됩니다.

## 논리 복제(logical replication) 활성화 \{#enable-logical-replication\}

AlloyDB 인스턴스에서 논리 복제가 활성화되어 있는지 확인하려면 기본(Primary) 인스턴스에서 다음 쿼리를 실행하십시오.

```sql
SHOW  wal_level;
```

결과가 `logical`인 경우 논리 복제가 이미 활성화되어 있으므로 [다음 단계](#create-a-clickpipes-user-and-manage-replication-permissions)로 넘어가면 됩니다. 결과가 `replica`이면 기본 인스턴스에서 [`alloydb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) 플래그와 [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) 플래그를 `on`으로 설정해야 합니다.

:::warning
[AlloyDB 플래그 문서](https://cloud.google.com/alloydb/docs/reference/alloydb-flags)에 나와 있듯이, 논리 복제를 활성화하는 플래그를 수정하면 기본 인스턴스를 다시 시작해야 합니다.
:::

이러한 플래그를 활성화하려면:

1. Google Cloud Console에서 AlloyDB [Clusters](https://console.cloud.google.com/alloydb/clusters) 페이지로 이동합니다. 기본 인스턴스의 **Actions** 메뉴에서 **Edit**을 클릭합니다.

   <Image img={edit_instance} alt="기본 인스턴스 구성 편집" size="lg" border />

2. **Advanced configuration options**까지 스크롤한 후 섹션을 확장합니다. **Flags** 아래에서 **Add a database flag**를 클릭합니다.

   * [`allowdb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) 플래그를 추가하고 값을 `on`으로 설정합니다.
   * [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) 플래그를 추가하고 값을 `on`으로 설정합니다.

   <Image img={set_flags} alt="allowdb.enable_pglogical 및 alloydb.logical_decoding 플래그를 on으로 설정" size="lg" border />

3. 구성 변경 사항을 저장하려면 **Update instance**를 클릭합니다. 이 작업을 수행하면 **기본 인스턴스가 다시 시작된다는 점에 유의하십시오.**

4. 인스턴스 상태가 `Updating`에서 `Ready`로 변경되면, 기본 인스턴스에서 다음 쿼리를 실행하여 논리 복제가 활성화되었는지 확인합니다:

   ```sql
   SHOW  wal_level;
   ```

   결과는 `logical`이어야 합니다.

   <Image img={verify_logical_replication} alt="논리 복제가 활성화되었는지 확인" size="lg" border />


## ClickPipes 사용자를 생성하고 복제(replication) 권한 관리하기 \{#create-a-clickpipes-user-and-manage-replication-permissions\}

관리자 사용자로 AlloyDB 인스턴스에 접속한 후 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 앞 단계에서 생성한 사용자에게 스키마 단위의 읽기 전용 권한을 부여합니다. 다음 예시는 `public` 스키마에 대한 권한을 보여 줍니다. 복제하려는 테이블이 포함된 각 스키마마다 이 명령을 반복해서 실행합니다:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 사용자에게 복제(replication) 권한을 부여합니다:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. 복제하려는 테이블을 포함하는 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)을 생성합니다. 성능 오버헤드를 줄이기 위해 publication에는 반드시 필요한 테이블만 포함하기를 강력히 권장합니다.

   :::warning
   publication에 포함되는 모든 테이블에는 **primary key**가 정의되어 있거나, **replica identity**가 `FULL`로 설정되어 있어야 합니다. 범위 설정에 대한 안내는 [Postgres FAQ](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)를 참조하십시오.
   :::

   - 특정 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 특정 스키마 내 모든 테이블에 대한 publication을 생성하려면:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication에는 지정한 테이블에서 발생한 변경 이벤트 집합이 포함되며, 이후 복제 스트림을 수집하는 데 사용됩니다.

## 네트워크 액세스 구성 \{#configure-network-access\}

:::note
ClickPipes는 Private Service Connect(PSC) 연결을 지원하지 않습니다. AlloyDB 인스턴스에 퍼블릭 액세스를 허용하지 않는 경우, [SSH 터널을 사용](#configure-network-access)하여 안전하게 연결할 수 있습니다. PSC는 향후 지원될 예정입니다.
:::

다음으로, ClickPipes에서 AlloyDB 인스턴스로의 연결을 허용하도록 구성해야 합니다.

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="ClickPipes IP 허용">

1. Google Cloud Console에서 AlloyDB [Clusters](https://console.cloud.google.com/alloydb/clusters) 페이지로 이동합니다. 기본(primary) 인스턴스를 선택하여 **Overview** 페이지를 엽니다.

2. **Instances in your cluster** 섹션으로 내려가서 **Edit primary**를 클릭합니다.

3. 퍼블릭 인터넷을 통한 인스턴스 연결을 허용하려면 **Enable Public IP** 체크박스를 선택합니다. **Authorized external networks** 아래에 서비스가 배포된 리전에 해당하는 [ClickPipes 정적 IP 주소 목록](../../index.md#list-of-static-ips)을 입력합니다.

   <Image img={configure_network_security} alt="IP 허용 목록을 사용하여 퍼블릭 액세스를 위한 네트워킹 구성" size="lg" border/>

   :::note
   AlloyDB는 주소를 [CIDR 표기법](https://cloud.google.com/alloydb/docs/connection-overview#public-ip)으로 지정할 것을 요구합니다. 제공된 ClickPipes 정적 IP 주소 목록의 각 주소 뒤에 `/32`를 추가하여 이 표기법에 맞게 조정할 수 있습니다.
   :::

4. **Network Security**에서 **Require SSL Encryption (default)** 옵션이 선택되어 있는지 확인합니다(선택되어 있지 않다면 선택합니다).

5. **Update instance**를 클릭하여 네트워크 보안 구성 변경 사항을 저장합니다.

</TabItem>
<TabItem value="ssh-tunnel" label="SSH 터널 사용">

AlloyDB 인스턴스에 퍼블릭 액세스를 허용하지 않는 경우, 먼저 SSH 배스천 호스트를 설정하여 연결을 안전하게 터널링해야 합니다. Google Cloud Platform에서 SSH 배스천 호스트를 설정하려면:

1. [공식 문서](https://cloud.google.com/compute/docs/instances/create-start-instance)를 따라 Google Compute Engine(GCE) 인스턴스를 생성하고 시작합니다.
   - GCE 인스턴스가 AlloyDB 인스턴스와 동일한 Virtual Private Network(VPC)에 있는지 확인합니다.
   - GCE 인스턴스에 [정적 퍼블릭 IP 주소](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address)가 있는지 확인합니다. ClickPipes를 SSH 배스천 호스트에 연결할 때 이 IP 주소를 사용합니다.

2. 서비스가 배포된 리전에 해당하는 [ClickPipes 정적 IP 주소 목록](../../index.md#list-of-static-ips)에서 오는 트래픽을 허용하도록 SSH 배스천 호스트의 방화벽 규칙을 업데이트합니다.

3. SSH 배스천 호스트에서 오는 트래픽을 허용하도록 AlloyDB의 방화벽 규칙을 업데이트합니다.

</TabItem>
</Tabs>

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Postgres 인스턴스에서 ClickHouse Cloud로 데이터 수집을 시작할 수 있습니다.
Postgres 인스턴스를 설정할 때 사용한 연결 정보를 기록해 두시기 바랍니다. 이 정보는 ClickPipe를 생성하는 과정에서 필요합니다.