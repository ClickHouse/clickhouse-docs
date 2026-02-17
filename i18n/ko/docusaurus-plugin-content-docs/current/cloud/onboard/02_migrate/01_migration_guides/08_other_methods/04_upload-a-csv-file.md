---
title: '파일 업로드'
slug: /cloud/migrate/upload-a-csv-file
description: 'Cloud로 파일을 업로드하는 방법을 설명합니다'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import csv_01 from '@site/static/images/cloud/migrate/csv_01.png';
import csv_02 from '@site/static/images/cloud/migrate/csv_02.png';
import csv_03 from '@site/static/images/cloud/migrate/csv_03.png';
import csv_04 from '@site/static/images/cloud/migrate/csv_04.png';
import csv_05 from '@site/static/images/cloud/migrate/csv_05.png';
import csv_06 from '@site/static/images/cloud/migrate/csv_06.png';
import csv_07 from '@site/static/images/cloud/migrate/csv_07.png';
import csv_08 from '@site/static/images/cloud/migrate/csv_08.png';
import csv_09 from '@site/static/images/cloud/migrate/csv_09.png';
import csv_10 from '@site/static/images/cloud/migrate/csv_10.png';


# Cloud에 파일 업로드 \{#upload-files-to-cloud\}

ClickHouse Cloud는 파일을 손쉽게 가져오는 기능을 제공하며,
다음 형식을 지원합니다:

| 형식                             |
|---------------------------------|
| `CSV`                           |
| `CSVWithNamesAndTypes`          |
| `CSVWithNames`                  |
| `JSONEachRow`                   |
| `TabSeparated`                  |
| `TabSeparatedWithNames`         |
| `TabSeparatedWithNamesAndTypes` |

<VerticalStepper headerLevel="h2">

## 파일 업로드 \{#upload-file\}

Cloud 홈 페이지에서 아래와 같이 서비스를 선택합니다:

<Image img={csv_01} alt="upload_file_02" />

서비스가 유휴 상태인 경우 먼저 다시 시작해야 합니다.

아래와 같이 왼쪽 탭에서 `Data sources`를 선택합니다:

<Image img={csv_02} alt="upload_file_03" />

그 다음, 데이터 소스 페이지 오른쪽에서 `Upload a file`을 선택합니다:

<Image img={csv_03} alt="upload_file_04" />

파일 선택 대화상자가 표시되며, Cloud 서비스의 테이블에 데이터를
삽입하는 데 사용할 파일을 선택할 수 있습니다.

<Image img={csv_04} alt="upload_file_05" />

## 테이블 구성 \{#configure-table\}

파일 업로드가 완료되면 데이터를 삽입할 테이블을 구성할 수 있습니다.
처음 세 행이 포함된 테이블 미리 보기가 표시됩니다.

<Image img={csv_08} alt="upload_file_08" />

이제 대상 테이블을 선택할 수 있습니다. 옵션은 다음과 같습니다:

- 새 테이블
- 기존 테이블

<br/>
데이터를 업로드할 데이터베이스를 지정할 수 있으며,
새 테이블인 경우 생성될 테이블 이름을 지정할 수 있습니다.
또한 정렬 키를 선택할 수도 있습니다:

<Image img={csv_05} alt="upload_file_05" />

파일에서 읽은 컬럼은 `Source field`로 표시되며, 각 필드에 대해 다음을 변경할 수 있습니다:
- 추론된 타입
- 기본값
- 컬럼을 [Nullable](/sql-reference/data-types/nullable)로 설정할지 여부

<Image img={csv_06} alt="upload_file_06" />

:::note 필드 제외
가져오기에 포함하고 싶지 않은 필드는 제거할 수도 있습니다.
:::

사용할 테이블 엔진 유형을 지정할 수 있습니다:

- `MergeTree`
- `ReplacingMergeTree`
- `SummingMergeTree`
- `Null`
<br/>
파티셔닝 키 표현식과 기본 키(primary key) 표현식을 지정할 수 있습니다.

<Image img={csv_07} alt="upload_file_07" />

데이터를 가져오려면 (위에 표시된 대로) `Import to ClickHouse`를 클릭합니다.
데이터 가져오기는 아래와 같이 `Status` 컬럼의 `queued` 상태 배지로 표시되듯
대기열에 추가됩니다. 또한 (위에 표시된 대로) `Open as query`를 클릭하여
SQL 콘솔에서 INSERT 쿼리를 열 수 있습니다. 이 쿼리는 `URL` 테이블 함수를 사용하여
S3 버킷에 업로드된 파일을 삽입합니다.

<Image img={csv_09} alt="upload_file_09" />

작업이 실패하면 `Data upload history` 탭의 `Status` 컬럼에 `failed` 상태 배지가
표시됩니다. 업로드 실패 원인에 대한 자세한 정보를 보려면 `View Details`를 클릭할 수 있습니다.
실패한 INSERT에 대한 오류 메시지를 기반으로 테이블 구성을 수정하거나
데이터를 정제해야 할 수도 있습니다.

<Image img={csv_10} alt="upload_file_11" />

</VerticalStepper>