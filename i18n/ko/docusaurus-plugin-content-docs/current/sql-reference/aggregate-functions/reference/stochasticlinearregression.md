---
'description': '이 함수는 확률적 선형 회귀를 구현합니다. 학습률, L2 정규화 계수, 미니 배치 크기에 대한 사용자 정의 매개변수를
  지원하며, 가중치를 업데이트하는 몇 가지 방법(Adam, 간단한 SGD, 모멘텀, 네스테로프)이 있습니다.'
'sidebar_position': 192
'slug': '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
'title': 'stochasticLinearRegression'
'doc_type': 'reference'
---



# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

이 함수는 확률적 선형 회귀를 구현합니다. 학습률, L2 정규화 계수, 미니 배치 크기에 대한 사용자 지정 매개변수를 지원하며, 가중치를 업데이트하는 몇 가지 방법([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (기본값으로 사용), [simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum), [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf))이 있습니다.

### Parameters {#parameters}

4개의 사용자 정의 가능한 매개변수가 있습니다. 이들은 순차적으로 함수에 전달되지만, 네 개 모두를 전달할 필요는 없습니다 - 기본 값이 사용되지만, 좋은 모델을 위해서는 일부 매개변수 조정이 필요합니다.

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate`는 기울기 하강 단계가 수행될 때 단계 길이에 대한 계수입니다. 학습률이 너무 크면 모델의 가중치가 무한이 될 수 있습니다. 기본값은 `0.00001`입니다.
2.  `l2 regularization coefficient`는 과적합을 방지하는 데 도움이 될 수 있습니다. 기본값은 `0.1`입니다.
3.  `mini-batch size`는 기울기를 계산하고 합산하여 기울기 하강의 한 단계를 수행하는 요소의 수를 설정합니다. 순수 확률적 하강은 하나의 요소를 사용하지만, 작은 배치(약 10 요소)를 가지면 기울기 단계가 더 안정적입니다. 기본값은 `15`입니다.
4.  `method for updating weights`는 다음과 같습니다: `Adam` (기본값), `SGD`, `Momentum`, `Nesterov`. `Momentum` 및 `Nesterov`는 약간 더 많은 계산과 메모리가 필요하지만, 수렴 속도와 확률적 기울기 방법의 안정성 측면에서 유용합니다.

### Usage {#usage}

`stochasticLinearRegression`는 모델을 피팅하고 새로운 데이터에 대한 예측을 수행하는 두 단계에서 사용됩니다. 모델을 피팅하고 나중에 사용할 수 있도록 상태를 저장하려면, `-State` 조합기를 사용하여 상태(예: 모델 가중치)를 저장합니다.
예측을 하려면 [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod) 함수를 사용하며, 이 함수는 상태를 인수로 받고 예측할 기능을 받습니다.

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** 피팅

다음과 같은 쿼리를 사용할 수 있습니다.

```sql
CREATE TABLE IF NOT EXISTS train_data
(
    param1 Float64,
    param2 Float64,
    target Float64
) ENGINE = Memory;

CREATE TABLE your_model ENGINE = Memory AS SELECT
stochasticLinearRegressionState(0.1, 0.0, 5, 'SGD')(target, param1, param2)
AS state FROM train_data;
```

여기서 `train_data` 테이블에 데이터를 삽입해야 합니다. 매개변수의 수는 고정되지 않으며, 이는 `linearRegressionState`에 전달된 인수의 수에만 의존합니다. 이들은 모두 숫자 값이어야 합니다.
목표 값(예측하려고 학습하고자 하는 값)이 있는 컬럼은 첫 번째 인수로 삽입되어야 합니다.

**2.** 예측

상태를 테이블에 저장한 후, 여러 번 예측에 사용할 수 있거나 다른 상태와 병합하여 새로운, 더 나은 모델을 만들 수 있습니다.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

쿼리는 예측된 값의 컬럼을 반환합니다. `evalMLMethod`의 첫 번째 인수는 `AggregateFunctionState` 객체이며, 다음 인수들은 예측할 기능의 컬럼입니다.

`test_data`는 `train_data`와 같은 테이블이지만 목표 값을 포함하지 않을 수 있습니다.

### Notes {#notes}

1.  두 모델을 병합하려면 사용자는 다음과 같은 쿼리를 생성할 수 있습니다:
    `sql  SELECT state1 + state2 FROM your_models`
    여기서 `your_models` 테이블은 두 모델 모두를 포함합니다. 이 쿼리는 새로운 `AggregateFunctionState` 객체를 반환합니다.

2.  사용자는 모델을 저장하지 않고도 생성된 모델의 가중치를 자신의 목적을 위해 가져올 수 있습니다; `-State` 조합기가 사용되지 않은 경우:
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    이러한 쿼리는 모델을 피팅하고 그 가중치를 반환합니다 - 처음은 모델의 매개변수와 일치하는 가중치이며, 마지막은 바이어스입니다. 따라서 위의 쿼리는 3개의 값이 있는 컬럼을 반환합니다.

**See Also**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [Difference between linear and logistic regressions](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
