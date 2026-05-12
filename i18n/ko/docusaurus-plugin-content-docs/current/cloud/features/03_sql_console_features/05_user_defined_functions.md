---
sidebar_label: '사용자 정의 함수'
slug: /cloud/features/user-defined-functions
title: 'Cloud의 사용자 정의 함수'
description: 'Cloud에서 자체 실행 가능한 Python 함수를 추가합니다'
doc_type: 'guide'
keywords: ['사용자 정의 함수', 'UDF']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

사용자 정의 함수(UDF)를 사용하면 ClickHouse에서 기본 제공하는 1,000개 이상의 [함수](/sql-reference/functions/regular-functions)로는 제공되지 않는 동작까지 확장할 수 있습니다.

ClickHouse Cloud에서 사용자 정의 함수를 생성하는 방법은 두 가지입니다:

1. SQL을 사용하여
2. UI와 자체 코드를 사용하여 (비공개 프리뷰)

## SQL 사용자 정의 함수 \{#sql-udfs\}

SQL UDF는 람다 식을 사용해 [`CREATE FUNCTION`](/sql-reference/statements/create/function) SQL 문으로 생성할 수 있습니다.

이 예시에서는 간단한 실행형 사용자 정의 함수인 `isBusinessHours`를 생성합니다.
이 함수는 특정 타임스탬프가 일반적인 업무 시간에 해당하는지 검사하여, 해당하면 true를 반환하고 그렇지 않으면 false를 반환합니다.

1. Cloud Console에 로그인하고 SQL 콘솔을 여세요
2. 다음 SQL 쿼리를 작성하여 `isBusinessHours` 함수를 생성하세요:

```sql
CREATE FUNCTION isBusinessHours AS (ts) ->
toDayOfWeek(ts) BETWEEN 1 AND 5
AND toHour(ts) BETWEEN 9 AND 17;
```

3. 새로 생성한 UDF를 테스트하려면 아래를 실행하십시오:

```sql
SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
```

다음과 같은 결과가 반환되어야 합니다:

```response
1   0
```

4. 방금 생성한 UDF를 제거하려면 `DROP FUNCTION` 명령을 사용할 수 있습니다:

```sql
DROP FUNCTION isBusinessHours
```

:::warning 중요
ClickHouse Cloud의 UDF는 **사용자 수준 설정을 상속하지 않습니다**. 기본 시스템 설정으로 실행됩니다.
:::

이는 다음을 의미합니다:

* 세션 수준 설정(`SET` 문으로 설정됨)은 UDF 실행 컨텍스트로 전파되지 않습니다
* 사용자 프로필 설정은 UDF에 상속되지 않습니다
* 쿼리 수준 설정은 UDF 실행 내에서 적용되지 않습니다

## UI를 통해 생성된 사용자 정의 함수 \{#ui-udfs\}

<PrivatePreviewBadge />

ClickHouse Cloud는 사용자 정의 함수를 생성할 수 있는 UI 구성 환경을 제공합니다.

:::note
이 기능을 사용해 보고 싶다면 비공개 프리뷰에 등록할 수 있도록 [support](https://clickhouse.com/support/program)에 문의하십시오.
:::

이 예시에서는 특정 타임스탬프가 일반적인 업무 시간에 해당하는지 확인하는 간단한 실행형 사용자 정의 함수 `isBusinessHours`를 동일하게 생성합니다.
이전에는 SQL을 사용해 생성했지만, 이번에는 Python을 사용하고 UI를 통해 구성합니다.

<VerticalStepper headerLevel="h3">
  ### Python 파일 생성하기 \{#create-python-file\}

  로컬에서 새 파일 `main.py`를 생성하세요:

  ```python
  cat > main.py << 'EOF'
  import sys
  from datetime import datetime

  for line in sys.stdin:
      ts = datetime.fromisoformat(line.strip())
      result = 1 if (0 <= ts.weekday() <= 4 and 9 <= ts.hour <= 17) else 0
      print(result)
      sys.stdout.flush()
  EOF
  ```

  Python 스크립트에서 서드파티 패키지를 import하는 경우, 해당 의존성을 나열한 `requirements.txt` 파일을 생성해야 합니다. 예시:

  ```text
  requests>=2.28.0
  numpy>=1.23.0
  ```

  :::note
  ClickHouse Cloud는 다음 단계에서 UI를 통해 업로드할 zip 파일 안에 `main.py`가 있을 것으로 예상합니다.
  파일 이름을 다르게 지정하면 오류가 발생합니다.
  :::

  ### 의존성 및 로컬 파일 함께 묶기 \{#bundle-dependencies\}

  의존성 패키지와 추가 로컬 파일(예: wheel 파일, 설정 파일 또는 데이터 파일)을 포함하려면 해당 파일들을 `main.py` 및 `requirements.txt`와 동일한 디렉터리에 배치하세요. ZIP 아카이브를 생성할 때는 모든 파일을 포함하세요:

  ```bash
  zip is_business_hours.zip main.py requirements.txt
  ```

  Python 코드에서 `os.path.dirname(os.path.abspath(__file__))`를 사용하면 로컬로 번들된 경로의 기준 디렉터리를 참조할 수 있습니다. 이 값은 ZIP 아카이브 내에서 `main.py`가 위치한 디렉터리의 절대 경로를 반환하므로, 함께 번들된 다른 파일에도 접근할 수 있습니다:

  ```python
  import os

  # Get the base directory of the bundled files
  base_dir = os.path.dirname(os.path.abspath(__file__))
  config_path = os.path.join(base_dir, 'config.json')
  ```

  다음 작업이 필요할 때 유용합니다:

  * UDF에 포함된 설정 파일에 액세스
  * 사용자 지정 의존성용 wheel 패키지 로드
  * 추가 스크립트 또는 데이터 파일 참조

  이제 파일을 ZIP 아카이브로 압축하세요:

  ```bash
  zip is_business_hours.zip main.py
  ```

  ### UI를 통해 UDF 생성하기 \{#create-udf-via-ui\}

  1. Cloud Console 홈에서 왼쪽 하단 메뉴의 조직 이름을 클릭하세요.
  2. 메뉴에서 **사용자 정의 함수**를 선택하세요.
  3. 사용자 정의 함수 페이지에서 **Set up a UDF**를 클릭하세요. 화면 오른쪽에 구성 패널이 열립니다.
  4. 함수 이름을 입력하세요. 이 예시에서는 `isBusinessHours`를 사용합니다.
  5. 함수 타입으로 **Executable pool** 또는 **Executable** 중 하나를 선택하세요.
     * **Executable pool**: 지속적으로 유지되는 프로세스 풀이 관리되며, 읽기 시 해당 풀에서 프로세스를 가져옵니다.
     * **Executable**: 모든 쿼리마다 스크립트가 실행됩니다.
  6. 이 예시에서는 기본 설정을 사용합니다. 구성 매개변수의 전체 목록은 [Executable user-defined functions](/sql-reference/functions/udf#executable-user-defined-functions)를 참조하세요.
  7. **Browse File**을 클릭하여 이 튜토리얼 시작 부분에서 생성한 `.zip` 파일을 업로드하세요.
  8. 새 인수를 추가하세요. 이 예시에서는 타입이 `DateTime`인 인수 `timestamp`를 추가합니다.
  9. 반환 타입을 선택하세요. 이 예시에서는 `Bool`을 선택합니다.
  10. **Create UDF**를 클릭하세요. 현재 빌드 상태를 표시하는 대화 상자가 나타납니다.
      * 문제가 있으면 상태가 **error**로 변경됩니다.
      * 그렇지 않으면 상태가 **building**에서 **provisioning**으로 진행됩니다. 프로비저닝을 완료하려면 서비스가 활성 상태여야 합니다. 서비스가 idle 상태이면 서비스 이름 옆의 **UDF details** 패널에서 **Wake Up Service**를 클릭하세요.
      * 완료되면 상태가 **deployed**로 변경됩니다.

  ### UDF 테스트하기 \{#test-your-udf\}

  1. 페이지 왼쪽 상단에서 **Settings - return to your service view**를 클릭하여 SQL 콘솔 홈 페이지로 돌아가세요.
  2. 왼쪽 메뉴에서 **SQL 콘솔**을 클릭하세요.
  3. 다음 쿼리를 작성하세요:

  ```sql
  SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
  ```

  다음과 같은 결과가 표시됩니다:

  ```response
  true    false
  ```

  ### 새 버전 생성하기 \{#create-new-version\}

  1. Cloud Console 홈에서 왼쪽 하단 메뉴의 조직 이름을 클릭하세요.
  2. 메뉴에서 **사용자 정의 함수**를 선택하세요.
  3. `isBusinessHours` UDF의 **Actions** 아래에 있는 점 3개를 선택한 다음 **Create new version**을 클릭하세요.
  4. 수정된 코드가 포함된 zip 파일을 업로드하거나 설정을 변경한 다음 **Create new version**을 클릭하세요.

  이제 UI를 통해 첫 번째 사용자 정의 함수를 성공적으로 추가하고, 실행되는 것을 확인했으며, 필요할 경우 새 버전을 생성하는 방법도 확인했습니다.
</VerticalStepper>