---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver는 멀티플랫폼 데이터베이스 도구입니다.'
title: 'ClickHouse에 DBeaver 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', '데이터베이스 관리', 'SQL 클라이언트', 'JDBC 연결', '멀티플랫폼']
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# DBeaver를 ClickHouse에 연결하기 \{#connect-dbeaver-to-clickhouse\}

<PartnerBadge/>

DBeaver는 여러 에디션으로 제공됩니다. 이 가이드에서는 [DBeaver Community](https://dbeaver.io/)를 사용합니다. 다양한 에디션과 기능은 [여기](https://dbeaver.com/edition/)에서 확인할 수 있습니다. DBeaver는 JDBC를 사용하여 ClickHouse에 연결합니다.

:::note
ClickHouse에서 `Nullable`(널 허용) 컬럼에 대한 지원이 개선된 DBeaver 23.1.0 이상 버전을 사용하십시오.
:::

## 1. ClickHouse 정보 준비하기 \{#1-gather-your-clickhouse-details\}

DBeaver는 HTTP(S)를 통한 JDBC를 사용하여 ClickHouse에 연결합니다. 다음 정보가 필요합니다.

- 엔드포인트
- 포트 번호
- 사용자 이름
- 비밀번호

## 2. DBeaver 다운로드 \{#2-download-dbeaver\}

DBeaver는 https://dbeaver.io/download/에서 다운로드할 수 있습니다.

## 3. 데이터베이스 추가 \{#3-add-a-database\}

- **Database &gt; New Database Connection** 메뉴 또는 **Database Navigator**의 **New Database Connection** 아이콘을 사용하여 **Connect to a database** 대화 상자를 엽니다.

<Image img={dbeaver_add_database} size="md" border alt="새 데이터베이스 추가" />

- **Analytical**을 선택한 다음 **ClickHouse**를 선택합니다.

- JDBC URL을 구성합니다. **Main** 탭에서 Host, Port, Username, Password, Database를 설정합니다.

<Image img={dbeaver_host_port} size="md" border alt="호스트 이름, 포트, 사용자, 비밀번호, 데이터베이스 이름 설정" />

- 기본적으로 **SSL &gt; Use SSL** 속성은 설정되어 있지 않습니다. ClickHouse Cloud 또는 HTTP 포트에서 SSL이 필요한 서버에 연결하는 경우 **SSL &gt; Use SSL**을 활성화합니다.

<Image img={dbeaver_use_ssl} size="md" border alt="필요한 경우 SSL 활성화" />

- 연결을 테스트합니다.

<Image img={dbeaver_test_connection} size="md" border alt="연결 테스트" />

DBeaver에서 ClickHouse 드라이버가 설치되어 있지 않은 것을 감지하면 드라이버 다운로드를 제안합니다.

<Image img={dbeaver_download_driver} size="md" border alt="ClickHouse 드라이버 다운로드" />

- 드라이버를 다운로드한 후 **Test**를 클릭하여 다시 연결을 테스트합니다.

<Image img={dbeaver_test_connection} size="md" border alt="연결 테스트" />

## 4. ClickHouse에서 쿼리 실행 \{#4-query-clickhouse\}

쿼리 편집기를 열어 쿼리를 실행합니다.

- 연결을 마우스 오른쪽 버튼으로 클릭한 후 **SQL Editor > Open SQL Script**를 선택하여 쿼리 편집기를 엽니다:

<Image img={dbeaver_sql_editor} size="md" border alt="SQL 편집기 열기" />

- `system.query_log`에 대한 예시 쿼리:

<Image img={dbeaver_query_log_select} size="md" border alt="예시 쿼리" />

## 다음 단계 \{#next-steps\}

DBeaver의 기능을 알아보려면 [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki)를 참고하고, ClickHouse의 기능을 알아보려면 [ClickHouse 문서](https://clickhouse.com/docs)를 참고하십시오.