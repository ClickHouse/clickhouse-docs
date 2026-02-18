---
description: '`Executable` 및 `ExecutablePool` 테이블 엔진은 사용자가 작성한 스크립트가 **stdout**으로 출력하는 행을 기반으로 하는 테이블을 정의할 수 있도록 합니다.'
sidebar_label: 'Executable/ExecutablePool'
sidebar_position: 40
slug: /engines/table-engines/special/executable
title: 'Executable 및 ExecutablePool 테이블 엔진'
doc_type: 'reference'
---

# Executable 및 ExecutablePool 테이블 엔진 \{#executable-and-executablepool-table-engines\}

`Executable` 및 `ExecutablePool` 테이블 엔진을 사용하면, 사용자가 정의한 스크립트(행을 **stdout**으로 쓰는 방식)를 통해 행이 생성되는 테이블을 정의할 수 있습니다. 실행 스크립트는 `users_scripts` 디렉터리에 저장되며, 임의의 소스에서 데이터를 읽을 수 있습니다.

* `Executable` 테이블: 쿼리가 실행될 때마다 스크립트가 실행됩니다.
* `ExecutablePool` 테이블: 상시 실행되는 프로세스 풀을 유지하고, 읽기 작업을 위해 풀에서 프로세스를 가져와 사용합니다.

선택적으로 하나 이상의 입력 쿼리를 포함해, 해당 쿼리 결과를 **stdin**으로 스트리밍하여 스크립트가 이를 읽을 수 있도록 할 수 있습니다.

## `Executable` 테이블 생성 \{#creating-an-executable-table\}

`Executable` 테이블 엔진에는 스크립트 이름과 입력 데이터 형식, 두 가지 매개변수가 필요합니다. 필요에 따라 하나 이상의 입력 쿼리를 추가로 전달할 수 있습니다.

```sql
Executable(script_name, format, [input_query...])
```

다음은 `Executable` 테이블에 대한 관련 설정입니다:

* `send_chunk_header`
  * Description: 청크를 처리하기 전에 각 청크에 포함된 행 수를 먼저 전송합니다. 이 설정은 일부 리소스를 미리 할당하여 스크립트를 더 효율적으로 작성하는 데 도움이 됩니다.
  * Default value: false
* `command_termination_timeout`
  * Description: 명령 종료 타임아웃(초 단위)입니다.
  * Default value: 10
* `command_read_timeout`
  * Description: 명령의 stdout에서 데이터를 읽는 작업에 대한 타임아웃(밀리초)입니다.
  * Default value: 10000
* `command_write_timeout`
  * Description: 명령의 stdin에 데이터를 쓰는 작업에 대한 타임아웃(밀리초)입니다.
  * Default value: 10000

예제를 살펴보겠습니다. 다음 Python 스크립트의 이름은 `my_script.py`이며 `user_scripts` 폴더에 저장되어 있습니다. 이 스크립트는 숫자 `i`를 입력으로 받아 `i`개의 임의 문자열을 출력하며, 각 문자열 앞에 탭으로 구분된 번호를 함께 출력합니다:

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

다음 `my_executable_table`은 `my_script.py`의 출력 결과를 기반으로 만들어지며, `my_executable_table`에서 `SELECT`를 실행할 때마다 무작위 문자열 10개를 생성합니다:

```sql
CREATE TABLE my_executable_table (
   x UInt32,
   y String
)
ENGINE = Executable('my_script.py', TabSeparated, (SELECT 10))
```

테이블 생성은 즉시 완료되며 스크립트는 호출되지 않습니다. `my_executable_table`에 쿼리를 실행하면 스크립트가 호출됩니다:

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

## 쿼리 결과를 스크립트로 전달하기 \{#passing-query-results-to-a-script\}

Hacker News 웹사이트의 사용자는 댓글을 남깁니다. Python에는 댓글이 긍정적인지, 부정적인지, 중립적인지를 판단하기 위한 자연어 처리 툴킷(`nltk`)과 `SentimentIntensityAnalyzer`가 포함되어 있습니다. 여기에는 -1(매우 부정적인 댓글)에서 1(매우 긍정적인 댓글) 사이의 값을 할당하는 기능도 제공됩니다. 이제 `nltk`를 사용하여 Hacker News 댓글의 감성을 분석하는 `Executable` 테이블을 만들어 보겠습니다.

이 예시는 [여기](/engines/table-engines/mergetree-family/textindexes/#hacker-news-dataset)에 설명된 `hackernews` 테이블을 사용합니다. `hackernews` 테이블에는 `UInt64` 타입의 `id` 컬럼과 `comment`라는 이름의 `String` 컬럼이 포함되어 있습니다. 먼저 `Executable` 테이블을 다음과 같이 정의합니다:

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

`sentiment` 테이블에 대한 몇 가지 설명입니다:

* 파일 `sentiment.py`는 `user_scripts` 폴더(`user_scripts_path` 설정의 기본 폴더)에 저장됩니다.
* `TabSeparated` 포맷은 Python 스크립트가 탭으로 구분된 값을 포함하는 원시 데이터 행을 생성해야 함을 의미합니다.
* 이 쿼리는 `hackernews`에서 두 개의 컬럼을 선택합니다. Python 스크립트는 들어오는 행에서 해당 컬럼 값을 파싱해야 합니다.

다음은 `sentiment.py`의 정의입니다:

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

Python 스크립트에 대한 몇 가지 설명입니다:

* 이 기능이 동작하려면 `nltk.downloader.download('vader_lexicon')`을 실행해야 합니다. 이 코드를 스크립트 안에 포함할 수도 있지만, 그렇게 하면 `sentiment` 테이블에서 쿼리가 실행될 때마다 매번 다운로드가 이루어지므로 비효율적입니다.
* `row`의 각 값은 `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 쿼리 결과 세트의 하나의 행이 됩니다.
* 입력되는 행은 탭으로 구분되어 있으므로, Python `split` 함수를 사용해 `id`와 `comment`를 분리합니다.
* `polarity_scores`의 결과는 여러 값을 가진 JSON 객체입니다. 여기서는 이 JSON 객체에서 `compound` 값만 가져오도록 했습니다.
* ClickHouse의 `sentiment` 테이블은 `TabSeparated` 포맷을 사용하며 두 개의 컬럼을 포함하므로, `print` 함수에서 이 컬럼들을 탭 문자로 구분합니다.

`sentiment` 테이블에서 행을 선택하는 쿼리를 작성할 때마다 `SELECT id, comment FROM hackernews WHERE id > 0 AND comment != '' LIMIT 20` 쿼리가 실행되고, 그 결과가 `sentiment.py`로 전달됩니다. 이제 테스트해 보겠습니다:

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

## `ExecutablePool` 테이블 생성 \{#creating-an-executablepool-table\}

`ExecutablePool`의 구문은 `Executable`과 유사하지만, `ExecutablePool` 테이블에만 적용되는 몇 가지 관련 설정이 있습니다:

* `pool_size`
  * 설명: 프로세스 풀의 크기입니다. 크기가 0이면 크기에 대한 제한이 없습니다.
  * 기본값: 16
* `max_command_execution_time`
  * 설명: 최대 명령 실행 시간(초)입니다.
  * 기본값: 10

위의 `sentiment` 테이블은 `Executable` 대신 `ExecutablePool`을 사용하도록 쉽게 변환할 수 있습니다:

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

클라이언트가 `sentiment_pooled` 테이블을 조회하면 ClickHouse는 필요에 따라 최대 4개의 프로세스를 유지합니다.
