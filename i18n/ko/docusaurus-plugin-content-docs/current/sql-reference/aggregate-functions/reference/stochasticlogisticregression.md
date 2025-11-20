---
'description': '이 함수는 확률적 로지스틱 회귀를 구현합니다. 이진 분류 문제에 사용할 수 있으며, stochasticLinearRegression과
  동일한 사용자 정의 매개변수를 지원하고 동일한 방식으로 작동합니다.'
'sidebar_position': 193
'slug': '/sql-reference/aggregate-functions/reference/stochasticlogisticregression'
'title': 'stochasticLogisticRegression'
'doc_type': 'reference'
---


# stochasticLogisticRegression

이 함수는 확률적 로지스틱 회귀를 구현합니다. 이 함수는 이진 분류 문제에 사용할 수 있으며, stochasticLinearRegression과 동일한 사용자 정의 매개변수를 지원하고 동일한 방식으로 작동합니다.

### Parameters {#parameters}

매개변수는 stochasticLinearRegression과 정확히 동일합니다:
`learning rate`, `l2 regularization coefficient`, `mini-batch size`, `method for updating weights`.
더 많은 정보는 [parameters](../reference/stochasticlinearregression.md/#parameters)를 참조하십시오.

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** 피팅

<!-- -->

    [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) 설명의 `Fitting` 섹션을 참조하십시오.

    예측된 레이블은 \[-1, 1\] 범위 안에 있어야 합니다.

**2.** 예측

<!-- -->

    저장된 상태를 사용하여 레이블 `1`을 가진 객체의 확률을 예측할 수 있습니다.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

    쿼리는 확률의 컬럼을 반환합니다. `evalMLMethod`의 첫 번째 인자는 `AggregateFunctionState` 객체이며, 다음 인자는 특성의 컬럼입니다.

    확률의 경계값을 설정하여 요소를 서로 다른 레이블에 할당할 수도 있습니다.

```sql
SELECT ans < 1.1 AND ans > 0.5 FROM
(WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) AS ans FROM test_data)
```

    그러면 결과는 레이블이 됩니다.

    `test_data`는 `train_data`와 같은 테이블이지만 목표 값을 포함하지 않을 수 있습니다.

**참고**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [선형 회귀와 로지스틱 회귀의 차이.](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
