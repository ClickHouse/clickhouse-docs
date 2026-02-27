---
sidebar_label: '데이터 카탈로그'
slug: /manage/data-catalogs
title: '데이터 카탈로그'
description: 'ClickHouse Cloud용 데이터 카탈로그 연동'
doc_type: 'landing-page'
keywords: ['데이터 카탈로그', 'Cloud 기능', '데이터 레이크', 'Iceberg', '연동']
---

import data_catalogs_ui from '@site/static/images/cloud/features/data-catalogs-ui.png';
import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

ClickHouse Cloud는 오픈 테이블 포맷 기반 데이터 카탈로그에 직접 연결하여, 데이터를 복제하지 않고도 데이터 레이크 테이블에 액세스할 수 있도록 합니다. 통합이 완료되면 카탈로그의 테이블이 ClickHouse 내부에서 쿼리 가능한 데이터베이스로 표시됩니다. 설정은 SQL 명령([DataLakeCatalog](/engines/database-engines/datalakecatalog))과 ClickHouse Cloud UI의 Data Sources 탭을 통해 수행할 수 있습니다.

UI를 사용할 경우:

* Data Catalog 오브젝트와 일관된 필드를 사용하는 양식을 통해 설정을 간소화합니다.
* 활성 데이터 카탈로그 통합을 위한 단일 인터페이스를 제공합니다.
* 저장 시 연결 및 자격 증명을 검증합니다.

<Image img={data_catalogs_ui} size="md" alt="데이터 카탈로그 통합이 구성된 ClickHouse Cloud UI" />

| 이름                   | 지원되는 오픈 테이블 포맷                   | 지원                                                               | 버전     |
| -------------------- | -------------------------------- | ---------------------------------------------------------------- | ------ |
| AWS Glue Catalog     | Iceberg                          | Cloud &amp; [Core](/use-cases/data-lake/glue-catalog)            | 25.10+ |
| Lakekeeper           | Iceberg                          | [Core](/use-cases/data-lake/lakekeeper-catalog)                  | 25.10+ |
| Microsoft OneLake    | Iceberg                          | Cloud &amp; [Core](/use-cases/data-lake/onelake-catalog)         | 25.12+ |
| Nessie               | Iceberg                          | [Core](/use-cases/data-lake/nessie-catalog)                      | 25.10+ |
| Polaris/Open Catalog | Iceberg                          | Core                                                             | 26.1+  |
| REST catalog         | Iceberg                          | [Core](/use-cases/data-lake/rest-catalog)                        | 25.10+ |
| Unity Catalog        | Iceberg(UniForm 사용 및 관리형), Delta | Cloud(Iceberg만) &amp; [Core](/use-cases/data-lake/unity-catalog) | 25.10+ |

Horizon과 S3 테이블 REST 엔드포인트를 포함하여 더 많은 카탈로그를 추가로 지원할 예정입니다.
