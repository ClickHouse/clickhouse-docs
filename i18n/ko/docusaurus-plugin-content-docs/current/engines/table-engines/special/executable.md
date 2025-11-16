---
'description': '`Executable` 및 `ExecutablePool` 테이블 엔진을 사용하면 생성할 행을 정의하는 스크립트(행을 **stdout**에
  작성함으로써)를 통해 생성된 테이블을 정의할 수 있습니다.'
'sidebar_label': 'Executable/ExecutablePool'
'sidebar_position': 40
'slug': '/engines/table-engines/special/executable'
'title': 'Executable 및 ExecutablePool 테이블 엔진'
'doc_type': 'reference'
---


# 실행 가능 및 ExecutablePool 테이블 엔진

`Executable` 및 `ExecutablePool` 테이블 엔진을 사용하면 사용자가 정의한 스크립트에서 행이 생성되는 테이블을 정의할 수 있습니다(**stdout**에 행 쓰기). 실행 가능한 스크립트는 `users_scripts` 디렉터리에 저장되며 모든 소스에서 데이터를 읽을 수 있습니다.

- `Executable` 테이블: 모든 쿼리에서 스크립트가 실행됩니다.
- `ExecutablePool` 테이블: 지속적인 프로세스 풀을 유지하며, 읽기 위해 풀에서 프로세스를 가져옵니다.

옵션으로 하나 이상의 입력 쿼리를 포함하여 스크립트가 읽을 수 있도록 결과를 **stdin**으로 스트리밍할 수 있습니다.

## `Executable` 테이블 생성하기 {#creating-an-executable-table}

`Executable` 테이블 엔진은 두 가지 매개변수를 필요로 합니다: 스크립트의 이름과 들어오는 데이터의 형식. 선택적으로 하나 이상의 입력 쿼리를 전달할 수 있습니다:

```sql
Executable(script_name, format, [input_query...])
```

다음은 `Executable` 테이블의 관련 설정입니다:

- `send_chunk_header`
  - 설명: 프로세스에 청크를 보내기 전에 각 청크의 행 수를 전송합니다. 이 설정은 미리 일부 리소스를 할당하도록 스크립트를 더 효율적으로 작성하는 데 도움이 될 수 있습니다.
  - 기본값: false
- `command_termination_timeout`
  - 설명: 명령 종료 시간 초과(초 단위)
  - 기본값: 10
- `command_read_timeout`
  - 설명: 명령 stdout에서 데이터를 읽는 시간 초과(밀리초 단위)
  - 기본값: 10000
- `command_write_timeout`
  - 설명: 명령 stdin에 데이터를 쓰는 시간 초과(밀리초 단위)
  - 기본값: 10000

예제를 살펴봅시다. 다음 Python 스크립트는 `my_script.py`라는 이름으로 `user_scripts` 폴더에 저장되어 있습니다. 이 스크립트는 숫자 `i`를 읽고, 각 문자열 앞에 탭으로 구분된 숫자가 있는 `i` 개의 랜덤 문자열을 출력합니다:

```python
#!/usr/bin/python3

import sys
import string
import random

def main():

    # Read input value
    for number in sys.stdin:
        i = int(number)

        # Generate some random rows
        for id in range(0, i):
            letters = string.ascii_letters
            random_string =  ''.join(random.choices(letters ,k=10))
            print(str(id) + '\t' + random_string + '\n', end='')

        # Flush results to stdout
        sys.stdout.flush()

if __name__ == "__main__":
    main()
```

다음 `my_executable_table`은 `my_script.py`의 출력을 기반으로 생성됩니다. 매번 `my_executable_table`에서 `SELECT`를 실행하면 10개의 랜덤 문자열이 생성됩니다:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

테이블을 생성하는 것은 즉시 반환되며 스크립트를 호출하지 않습니다. `my_executable_table`을 쿼리하면 스크립트가 호출됩니다:

```sql
SELECT * FROM my_executable_table
```

```response
┌─x─┬─y──────────┐
│ 0 │ BsnKBsNGNH │
│ 1 │ mgHfBCUrWM │
│ 2 │ iDQAVhlygr │
│ 3 │ uNGwDuXyCk │
│ 4 │ GcFdQWvoLB │
│ 5 │ UkciuuOTVO │
│ 6 │ HoKeCdHkbs │
│ 7 │ xRvySxqAcR │
│ 8 │ LKbXPHpyDI │
│ 9 │ zxogHTzEVV │
└───┴────────────┘
```

## 쿼리 결과를 스크립트에 전달하기 {#passing-query-results-to-a-script}

Hacker News 웹사이트 사용자는 댓글을 남깁니다. Python에는 댓글이 긍정적인지, 부정적인지, 중립적인지 판단하는 데 사용되는 자연어 처리 도구 키트(`nltk`)와 `SentimentIntensityAnalyzer`가 포함되어 있습니다. 이 값은 -1(매우 부정적인 댓글)과 1(매우 긍정적인 댓글) 사이의 값을 부여합니다. 이제 `nltk`를 사용하여 Hacker News 댓글의 감정을 계산하는 `Executable` 테이블을 만들어 봅시다.

이 예제는 [여기](/engines/table-engines/mergetree-family/invertedindexes/#hacker-news-dataset)에서 설명한 `hackernews` 테이블을 사용합니다. `hackernews` 테이블에는 `UInt64` 유형의 `id` 컬럼과 `comment`라는 이름의 `String` 컬럼이 포함되어 있습니다. `Executable` 테이블을 정의해 보겠습니다:

```sql
CREATE TABLE sentiment (
   id UInt64,
   sentiment Float32
)
ENGINE = Executable(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20)
);
```

`sentiment` 테이블에 대한 몇 가지 설명:

- `sentiment.py` 파일은 `user_scripts` 폴더에 저장됩니다(기본 `user_scripts_path` 설정의 기본 폴더).
- `TabSeparated` 형식은 우리의 Python 스크립트가 탭으로 구분된 값을 포함하는 원시 데이터 행을 생성해야 한다는 것을 의미합니다.
- 이 쿼리는 `hackernews`에서 두 개의 컬럼을 선택합니다. Python 스크립트는 들어오는 행에서 해당 컬럼 값을 구문 분석해야 합니다.

`sentiment.py`의 정의는 다음과 같습니다:

```python
#!/usr/local/bin/python3.9

import sys
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

def main():
    sentiment_analyzer = SentimentIntensityAnalyzer()

    while True:
        try:
            row = sys.stdin.readline()
            if row == '':
                break

            split_line = row.split("\t")

            id = str(split_line[0])
            comment = split_line[1]

            score = sentiment_analyzer.polarity_scores(comment)['compound']
            print(id + '\t' + str(score) + '\n', end='')
            sys.stdout.flush()
        except BaseException as x:
            break

if __name__ == "__main__":
    main()
```

우리의 Python 스크립트에 대한 몇 가지 설명:

- 이 작업을 수행하려면 `nltk.downloader.download('vader_lexicon')`를 실행해야 합니다. 이 코드는 스크립트에 포함되었을 수 있지만, 그러면 `sentiment` 테이블에서 쿼리가 실행될 때마다 다운로드되므로 비효율적입니다.
- `row`의 각 값은 `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 결과 세트의 행이 됩니다.
- 들어오는 행은 탭으로 구분되어 있으므로 Python의 `split` 함수를 사용하여 `id`와 `comment`를 구문 분석합니다.
- `polarity_scores`의 결과는 몇 가지 값을 포함하는 JSON 객체입니다. 우리는 이 JSON 객체의 `compound` 값을 가져오기로 결정했습니다.
- ClickHouse의 `sentiment` 테이블은 `TabSeparated` 형식을 사용하고 두 개의 컬럼이 포함되어 있으므로, 우리의 `print` 함수는 이러한 컬럼을 탭으로 구분합니다.

`sentiment` 테이블에서 행을 선택하는 쿼리를 쓸 때마다 `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 쿼리가 실행되고 결과가 `sentiment.py`로 전달됩니다. 테스트해 보겠습니다:

```sql
SELECT *
FROM sentiment
```

응답은 다음과 같습니다:

```response
┌───────id─┬─sentiment─┐
│  7398199 │    0.4404 │
│ 21640317 │    0.1779 │
│ 21462000 │         0 │
│ 25168863 │         0 │
│ 25168978 │   -0.1531 │
│ 25169359 │         0 │
│ 25169394 │   -0.9231 │
│ 25169766 │    0.4137 │
│ 25172570 │    0.7469 │
│ 25173687 │    0.6249 │
│ 28291534 │         0 │
│ 28291669 │   -0.4767 │
│ 28291731 │         0 │
│ 28291949 │   -0.4767 │
│ 28292004 │    0.3612 │
│ 28292050 │    -0.296 │
│ 28292322 │         0 │
│ 28295172 │    0.7717 │
│ 28295288 │    0.4404 │
│ 21465723 │   -0.6956 │
└──────────┴───────────┘
```

## `ExecutablePool` 테이블 생성하기 {#creating-an-executablepool-table}

`ExecutablePool`의 구문은 `Executable`과 유사하지만 `ExecutablePool` 테이블에 고유한 몇 가지 관련 설정이 있습니다:

- `pool_size`
  - 설명: 프로세스 풀 크기. 크기가 0이면 크기 제한이 없습니다.
  - 기본값: 16
- `max_command_execution_time`
  - 설명: 최대 명령 실행 시간(초 단위)
  - 기본값: 10

위의 `sentiment` 테이블을 `Executable` 대신 `ExecutablePool`을 사용하도록 쉽게 변환할 수 있습니다:

```sql
CREATE TABLE sentiment_pooled (
   id UInt64,
   sentiment Float32
)
ENGINE = ExecutablePool(
    'sentiment.py',
    TabSeparated,
    (SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20000)
)
SETTINGS
    pool_size = 4;
```

ClickHouse는 클라이언트가 `sentiment_pooled` 테이블을 쿼리할 때 필요에 따라 4개의 프로세스를 유지합니다.
