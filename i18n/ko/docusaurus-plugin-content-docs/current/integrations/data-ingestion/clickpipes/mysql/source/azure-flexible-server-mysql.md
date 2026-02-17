---
sidebar_label: 'Azure Flexible Server for MySQL'
description: 'ClickPipes 소스로 Azure Flexible Server for MySQL을 설정합니다'
slug: /integrations/clickpipes/mysql/source/azure-flexible-server-mysql
title: 'Azure Flexible Server for MySQL 소스 설정 가이드'
keywords: ['azure', 'flexible server', 'mysql', 'clickpipes', 'binlog']
doc_type: 'guide'
---

import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/azure-flexible-server-mysql/1_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Azure Flexible Server for MySQL 소스 설정 가이드 \{#azure-flexible-server-for-mysql-source-setup-guide\}

이 단계별 가이드는 Azure Flexible Server for MySQL을 구성하여 [MySQL ClickPipe](../index.md)를 사용해 데이터를 ClickHouse Cloud로 복제하는 방법을 설명합니다. 이 서비스에서는 **일회성 수집**만 지원합니다. MySQL CDC에 대한 일반적인 질문은 [MySQL FAQ 페이지](/integrations/data-ingestion/clickpipes/mysql/faq.md)를 참고하십시오.

:::warning
이 서비스에서는 **CDC를 통한 지속적인 수집이 지원되지 않습니다**. Azure Flexible Server for MySQL은 [`binlog_row_metadata`](https://dev.mysql.com/doc/refman/en/replication-options-binary-log.html#sysvar_binlog_row_metadata) 시스템 변수를 `FULL`로 설정하는 것을 허용하지 않으며, 이는 ClickPipes에서 전체 기능의 MySQL CDC를 위해 필수입니다.

[Azure 피드백 포럼](https://feedback.azure.com/d365community/forum/47b1e71d-ee24-ec11-b6e6-000d3a4f0da0)에 기능 요청을 제출하거나, [이 질문](https://learn.microsoft.com/en-us/answers/questions/766047/setting-binlog-row-metadata-to-full-in-azure-db-fo)에 추천을 추가하거나, 이 기능 제공을 요청하기 위해 [Azure 지원팀에 문의](https://azure.microsoft.com/en-us/support/create-ticket/)하십시오.
:::

## 데이터베이스 사용자 구성 \{#configure-database-user\}

관리자 계정으로 Azure Flexible Server for MySQL 인스턴스에 연결한 후 다음 명령을 실행합니다:

1. ClickPipes 전용 사용자를 생성합니다:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. 스키마 권한을 부여합니다. 다음 예시는 `mysql` 데이터베이스에 대한 권한을 보여 줍니다. 복제하려는 각 데이터베이스와 호스트마다 다음 명령을 반복합니다:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'%';
    ```

3. 권한 변경 사항을 적용합니다:

   ```sql
   FLUSH PRIVILEGES;
   ```

## 네트워크 액세스 구성 \{#configure-network-access\}

:::note
ClickPipes는 Azure Private Link 연결을 지원하지 않습니다. Azure Flexible Server for MySQL 인스턴스에 공용 액세스를 허용하지 않는 경우, 보안 연결을 위해 [SSH 터널을 사용](/integrations/clickpipes/mysql/source/azure-flexible-server-mysql#configure-network-access)할 수 있습니다. Azure Private Link는 향후 지원될 예정입니다.
:::

다음으로 ClickPipes에서 Azure Flexible Server for MySQL 인스턴스로의 연결을 허용해야 합니다.

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="ClickPipes IP 허용">

1. Azure Portal에서 **All resources**로 이동합니다. Azure Flexible Server for MySQL 인스턴스를 선택하여 **Overview** 페이지를 엽니다.

2. **Settings** 아래에서 **Networking**을 선택합니다. **Public access**가 활성화되어 있는지 확인합니다.

3. **Firewall rules** 섹션에서 서비스가 배포된 리전의 [ClickPipes 정적 IP 주소 목록](../../index.md#list-of-static-ips)을 입력합니다.

   <Image img={configure_network_security} alt="IP 허용 목록으로 공용 액세스를 위한 네트워크 구성" size="lg" border/>

4. **Save**를 클릭하여 네트워크 보안 구성 변경 내용을 저장합니다.

</TabItem>
<TabItem value="ssh-tunnel" label="SSH 터널 사용">

Azure Flexible Server for MySQL 인스턴스에 공용 액세스를 허용하지 않는 경우, 먼저 SSH 베스천 호스트를 설정하여 연결을 안전하게 터널링해야 합니다. Azure에서 SSH 베스천 호스트를 설정하려면:

1. [공식 문서](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu)를 따라 Azure Virtual Machine(VM)을 생성하고 시작합니다.
   - VM이 Azure Flexible Server for MySQL 인스턴스와 동일한 Virtual Network(VNet)에 있거나, 연결 가능한 피어링된 VNet에 있는지 확인합니다.
   - VM에 [정적 공용 IP 주소](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/virtual-network-public-ip-address)가 있는지 확인합니다. ClickPipes를 SSH 베스천 호스트에 연결할 때 이 IP 주소를 사용합니다.

2. 서비스가 배포된 리전의 [ClickPipes 정적 IP 주소 목록](../../index.md#list-of-static-ips)에서 오는 트래픽을 허용하도록 SSH 베스천 호스트의 Network Security Group(NSG) 규칙을 업데이트합니다.

3. SSH 베스천 호스트의 [프라이빗 IP 주소](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/private-ip-addresses)에서 오는 트래픽을 허용하도록 Azure Flexible Server for MySQL 인스턴스의 방화벽 규칙을 업데이트합니다.

</TabItem>
</Tabs>

## 다음 단계 \{#whats-next\}

이제 [ClickPipe를 생성](../index.md)하여 Azure Flexible Server for MySQL 인스턴스에서 ClickHouse Cloud로 데이터를 수집하기 시작할 수 있습니다. 인스턴스를 설정하는 동안 사용한 연결 정보를 반드시 기록해 두십시오. ClickPipe를 생성하는 과정에서 이 정보가 필요합니다.