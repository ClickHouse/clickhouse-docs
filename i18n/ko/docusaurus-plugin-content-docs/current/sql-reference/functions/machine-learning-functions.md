---
description: '머신 러닝 함수에 대한 문서'
sidebar_label: '머신 러닝'
slug: /sql-reference/functions/machine-learning-functions
title: '머신 러닝 함수'
doc_type: 'reference'
---



# 머신 러닝 함수 \{#machine-learning-functions\}



## evalMLMethod \{#evalmlmethod\}

적합된 회귀 모델로 예측할 때는 `evalMLMethod` FUNCTION을 사용합니다. 자세한 내용은 `linearRegression` 항목의 링크를 참고하십시오.



## stochasticLinearRegression \{#stochasticlinearregression\}

[stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 집계 함수는 선형 모델과 MSE 손실 함수를 사용하여 확률적 경사 하강법(stochastic gradient descent)을 구현합니다. 새로운 데이터에 대한 예측에는 `evalMLMethod`를 사용합니다.



## stochasticLogisticRegression \{#stochasticlogisticregression\}

[stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) 집계 FUNCTION은 이진 분류 문제에 대해 확률적 경사 하강법(stochastic gradient descent) 기법을 구현합니다. 새로운 데이터의 예측에는 `evalMLMethod`를 사용합니다.



## naiveBayesClassifier \{#naivebayesclassifier\}

n-그램과 Laplace 평활화를 사용하는 Naive Bayes 모델로 입력 텍스트를 분류합니다. 사용 전에 ClickHouse에서 해당 모델을 미리 구성해야 합니다.

**구문**

```sql
naiveBayesClassifier(model_name, input_text);
```

**인수**

* `model_name` — 미리 구성된 모델의 이름. [String](../data-types/string.md)
  모델은 반드시 ClickHouse의 설정 파일에 정의되어 있어야 합니다(아래 참조).
* `input_text` — 분류할 텍스트. [String](../data-types/string.md)
  입력은 제공된 그대로 처리됩니다(대소문자와 문장 부호가 그대로 유지됨).

**반환값**

* 예측된 클래스 ID를 부호 없는 정수로 반환합니다. [UInt32](../data-types/int-uint.md)
  클래스 ID는 모델 구성 시 정의된 범주에 대응합니다.

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

*결과 `0`은 영어, `1`은 프랑스를 나타낼 수 있으며, 클래스의 의미는 학습 데이터에 따라 달라집니다.*

***

### 구현 세부 사항 \{#implementation-details\}

**알고리즘**
Naive Bayes 분류 알고리즘을 사용하며, n-그램 확률에 기반하여 보지 못한 n-그램을 처리하기 위해 [이 자료](https://web.stanford.edu/~jurafsky/slp3/4.pdf)를 기반으로 [Laplace smoothing](https://en.wikipedia.org/wiki/Additive_smoothing)을 적용합니다.

**주요 기능**

* 임의 길이의 n-그램 지원
* 3가지 토큰화 모드:
  * `byte`: 원시 바이트 단위로 동작합니다. 각 바이트가 하나의 토큰입니다.
  * `codepoint`: UTF‑8에서 디코딩한 Unicode 스칼라 값 단위로 동작합니다. 각 codepoint가 하나의 토큰입니다.
  * `token`: Unicode 공백 시퀀스(정규식 \s+)를 기준으로 분리합니다. 토큰은 공백이 아닌 부분 문자열이며, 인접한 경우 구두점도 토큰의 일부가 됩니다(예: &quot;you?&quot;는 하나의 토큰입니다).

***

### 모델 구성 \{#model-configuration\}

언어 감지를 위한 Naive Bayes 모델을 생성하는 샘플 소스 코드는 [여기](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models)에서 찾을 수 있습니다.

또한 샘플 모델과 관련된 구성 파일은 [여기](https://github.com/nihalzp/ClickHouse-NaiveBayesClassifier-Models/tree/main/models)에서 사용할 수 있습니다.

다음은 ClickHouse에서 Naive Bayes 모델을 위한 구성 예시입니다:

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

| Parameter  | Description                                                                      | Example                                                  | Default |
| ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- | ------- |
| **name**   | 고유한 모델 식별자                                                                       | `language_detection`                                     | *필수*    |
| **path**   | 모델 바이너리의 전체 경로                                                                   | `/etc/clickhouse-server/config.d/language_detection.bin` | *필수*    |
| **mode**   | 토큰화 방식:<br />- `byte`: 바이트 시퀀스<br />- `codepoint`: 유니코드 문자<br />- `token`: 단어 토큰 | `token`                                                  | *필수*    |
| **n**      | N그램 크기(`token` 모드):<br />- `1`=단일 단어<br />- `2`=단어 쌍<br />- `3`=세 단어 묶음          | `2`                                                      | *필수*    |
| **alpha**  | 분류 시 모델에 존재하지 않는 n그램을 처리하기 위해 사용하는 라플라스 스무딩(Laplace smoothing) 계수                | `0.5`                                                    | `1.0`   |
| **priors** | 클래스 사전 확률(문서가 각 클래스에 속할 비율, %)                                                   | 클래스 0: 60%, 클래스 1: 40%                                   | 균등 분포   |

**모델 학습 가이드**


**파일 형식**
사람이 읽기 쉬운 형식에서 `n=1`이고 `token` 모드일 때, 모델은 다음과 같이 나타날 수 있습니다:

```text
<class_id> <n-gram> <count>
0 excellent 15
1 refund 28
```

`n=3`이고 `codepoint` 모드인 경우, 다음과 같습니다:

```text
<class_id> <n-gram> <count>
0 exc 15
1 ref 28
```

사람이 읽을 수 있는 형식은 ClickHouse에서 직접 사용되지 않으며, 아래에 설명된 이진 형식으로 변환해야 합니다.

**이진 형식 세부 정보**
각 n-gram은 다음과 같이 저장됩니다.

1. 4바이트 `class_id` (UInt, little-endian)
2. 4바이트 `n-gram` 바이트 길이 (UInt, little-endian)
3. 원본 `n-gram` 바이트
4. 4바이트 `count` (UInt, little-endian)

**전처리 요구사항**
문서 코퍼스로부터 모델을 생성하기 전에, 지정된 `mode` 및 `n`에 따라 n-gram을 추출할 수 있도록 문서를 전처리해야 합니다. 전처리 단계는 다음과 같습니다.

1. **토큰화 모드에 따라 각 문서의 시작과 끝에 경계 마커를 추가합니다.**

   * **Byte**: `0x01` (start), `0xFF` (end)
   * **Codepoint**: `U+10FFFE` (start), `U+10FFFF` (end)
   * **Token**: `<s>` (start), `</s>` (end)

   *참고:* 문서의 시작과 끝에 각각 `(n - 1)`개의 토큰을 추가합니다.

2. **`token` 모드에서 `n=3`인 예시:**

   * **문서:** `"ClickHouse is fast"`
   * **전처리 결과:** `<s> <s> ClickHouse is fast </s> </s>`
   * **생성된 3-그램(trigram):**
     * `<s> <s> ClickHouse`
     * `<s> ClickHouse is`
     * `ClickHouse is fast`
     * `is fast </s>`
     * `fast </s> </s>`

`byte` 및 `codepoint` 모드에서 모델 생성을 단순화하기 위해, 먼저 문서를 토큰(각각 `byte` 모드에서는 `byte` 목록, `codepoint` 모드에서는 `codepoint` 목록)으로 토큰화하는 것이 편리할 수 있습니다. 그런 다음 문서의 시작에 `n - 1`개의 시작 토큰을, 끝에 `n - 1`개의 종료 토큰을 추가합니다. 마지막으로 n-gram을 생성하여 직렬화된 파일에 기록합니다.

***

{/* 
  아래 태그 안의 내용은 문서 프레임워크를 빌드할 때
  system.functions에서 생성된 문서로 대체됩니다. 태그를 수정하거나 삭제하지 마십시오.
  참고: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
