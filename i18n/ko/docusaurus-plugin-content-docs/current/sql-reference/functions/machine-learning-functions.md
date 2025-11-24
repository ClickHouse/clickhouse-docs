---
'description': 'Machine Learning Functions에 대한 문서'
'sidebar_label': 'Machine Learning'
'slug': '/sql-reference/functions/machine-learning-functions'
'title': '기계 학습 함수'
'doc_type': 'reference'
---


# 기계 학습 함수

## evalMLMethod {#evalmlmethod}

회귀 모델에 맞춘 예측은 `evalMLMethod` 기능을 사용합니다. `linearRegression`에서 링크를 참조하십시오.

## stochasticLinearRegression {#stochasticlinearregression}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 집계 함수는 선형 모델과 MSE 손실 함수를 사용하여 확률적 경량 하강 방법을 구현합니다. 새로운 데이터에 대한 예측을 위해 `evalMLMethod`를 사용합니다.

## stochasticLogisticRegression {#stochasticlogisticregression}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 집계 함수는 이진 분류 문제를 위한 확률적 경량 하강 방법을 구현합니다. 새로운 데이터에 대한 예측을 위해 `evalMLMethod`를 사용합니다.

## naiveBayesClassifier {#naivebayesclassifier}

n-그램과 라플라스 스무딩을 사용하여 입력 텍스트를 분류합니다. 모델은 ClickHouse에서 사용하기 전에 구성되어야 합니다.

**구문**

```sql
naiveBayesClassifier(model_name, input_text);
```

**인수**

- `model_name` — 미리 구성된 모델의 이름. [String](../data-types/string.md)
  모델은 ClickHouse의 구성 파일에 정의되어야 합니다 (아래 참조).
- `input_text` — 분류할 텍스트. [String](../data-types/string.md)
  입력은 제공된 그대로 처리됩니다 (대소문자/구두점 보존).

**반환 값**
- 예측된 클래스 ID는 부Unsigned 정수로 반환됩니다. [UInt32](../data-types/int-uint.md)
  클래스 ID는 모델 구축 중 정의된 범주에 해당합니다.

**예시**

언어 감지 모델로 텍스트를 분류합니다:
```sql
SELECT naiveBayesClassifier('language', 'How are you?');
```
```response
┌─naiveBayesClassifier('language', 'How are you?')─┐
│ 0                                                │
└──────────────────────────────────────────────────┘
```
*결과 `0`은 영어를 나타낼 수 있고, `1`은 프랑스를 나타낼 수 있습니다 - 클래스의 의미는 교육 데이터에 따라 다릅니다.*

---

### 구현 세부 사항 {#implementation-details}

**알고리즘**
Naive Bayes 분류 알고리즘을 사용하고, [라플라스 스무딩](https://en.wikipedia.org/wiki/Additive_smoothing)을 통해 n-그램 확률에 따라 보지 못한 n-그램을 처리합니다. 이는 [이 문서](https://web.stanford.edu/~jurafsky/slp3/4.pdf)를 기반으로 합니다.

**주요 특징**
- 모든 크기의 n-그램 지원
- 세 가지 토큰화 모드:
  - `byte`: 원시 바이트로 작동합니다. 각 바이트는 하나의 토큰입니다.
  - `codepoint`: UTF‑8에서 디코딩된 유니코드 스칼라 값으로 작동합니다. 각 코드 포인트는 하나의 토큰입니다.
  - `token`: 유니코드 공백의 연속을 기준으로 나눕니다 (정규 표현식 \s+). 토큰은 공백이 아닌 부분의 부분 문자열입니다; 구두점은 인접할 경우 토큰의 일부입니다 (예: "you?"는 하나의 토큰입니다).

---

### 모델 구성 {#model-configuration}

언어 감지를 위한 Naive Bayes 모델을 생성하는 샘플 소스 코드는 [여기](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models)에서 찾을 수 있습니다.

또한, 샘플 모델과 관련된 구성 파일은 [여기](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models)에서 찾을 수 있습니다.

ClickHouse의 Naive Bayes 모델에 대한 구성 예시는 다음과 같습니다:

```xml
<clickhouse>
    <nb_models>
        <model>
            <name>sentiment</name>
            <path>/etc/clickhouse-server/config.d/sentiment.bin</path>
            <n>2</n>
            <mode>token</mode>
            <alpha>1.0</alpha>
            <priors>
                <prior>
                    <class>0</class>
                    <value>0.6</value>
                </prior>
                <prior>
                    <class>1</class>
                    <value>0.4</value>
                </prior>
            </priors>
        </model>
    </nb_models>
</clickhouse>
```

**구성 매개변수**

| 매개변수  | 설명                                                                                                         | 예시                                                     | 기본값            |
| ---------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------ |
| **name**   | 고유한 모델 식별자                                                                                         | `language_detection`                                     | *필수*            |
| **path**   | 모델 바이너리의 전체 경로                                                                                   | `/etc/clickhouse-server/config.d/language_detection.bin` | *필수*            |
| **mode**   | 토큰화 방법:<br/>- `byte`: 바이트 시퀀스<br/>- `codepoint`: 유니코드 문자<br/>- `token`: 단어 토큰     | `token`                                                  | *필수*            |
| **n**      | N-그램 크기 (`token` 모드):<br/>- `1`=단어<br/>- `2`=단어 쌍<br/>- `3`=단어 삼중                         | `2`                                                      | *필수*            |
| **alpha**  | 클래스 분류 중 모델에 나타나지 않는 n-그램을 처리하기 위해 사용되는 라플라스 스무딩 계수                 | `0.5`                                                    | `1.0`              |
| **priors** | 클래스 확률 (% 문서가 클래스에 속하는지)                                                                      | 60% 클래스 0, 40% 클래스 1                              | 동일 분포 |

**모델 훈련 가이드**

**파일 형식**
사람이 읽을 수 있는 형식으로 n=1 및 token 모드의 경우, 모델은 다음과 같을 수 있습니다:
```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

n=3 및 codepoint 모드의 경우는 다음과 같을 수 있습니다:
```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

사람이 읽을 수 있는 형식은 ClickHouse에서 직접 사용되지 않으며, 아래 설명된 이진 형식으로 변환되어야 합니다.

**이진 형식 세부 사항**
각 n-그램은 다음과 같이 저장됩니다:
1. 4바이트 `class_id` (UInt, 리틀 엔디안)
2. 4바이트 `n-그램` 바이트 길이 (UInt, 리틀 엔디안)
3. 원시 `n-그램` 바이트
4. 4바이트 `count` (UInt, 리틀 엔디안)

**전처리 요구 사항**
모델이 문서 코퍼스에서 생성되기 전에, 문서는 지정된 `mode`와 `n`에 따라 n-그램을 추출하기 위해 전처리되어야 합니다. 전처리 단계는 다음과 같습니다:
1. **토큰화 모드에 따라 각 문서의 시작과 끝에 경계 마커 추가:**
   - **Byte**: `0x01` (시작), `0xFF` (끝)
   - **Codepoint**: `U+10FFFE` (시작), `U+10FFFF` (끝)
   - **Token**: `<s>` (시작), `</s>` (끝)

   *참고:* 문서의 시작과 끝에 `(n - 1)` 토큰이 추가됩니다.

2. **`n=3` 및 `token` 모드의 예:**

   - **문서:** `"ClickHouse is fast"`
   - **처리된 결과:** `<s> <s> ClickHouse is fast </s> </s>`
   - **생성된 삼중그램:**
     - `<s> <s> ClickHouse`
     - `<s> ClickHouse is`
     - `ClickHouse is fast`
     - `is fast </s>`
     - `fast </s> </s>`

`byte` 및 `codepoint` 모드의 모델 생성을 단순화하기 위해, 문서를 먼저 토큰으로 쪼개는 것이 편리할 수 있습니다 (바이트 모드의 경우 `byte`s의 목록, 코드 포인트 모드의 경우 `codepoint`s의 목록). 그런 다음 문서의 시작과 끝에 각각 `n - 1`개의 시작 토큰과 끝 토큰을 추가합니다. 마지막으로 n-그램을 생성하고 직렬화된 파일에 기록합니다.

---

<!-- 
아래 태그의 내부 내용은 시스템 함수에서 생성된 문서로 빌드 시간에 변경 또는 제거됩니다. 
수정하지 마십시오. 
문서: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->
