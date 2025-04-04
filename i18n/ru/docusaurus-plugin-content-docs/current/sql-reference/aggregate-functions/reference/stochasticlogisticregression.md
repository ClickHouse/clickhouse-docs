---
description: 'Эта функция реализует стохастическую логистическую регрессию. Она может
  использоваться для задач бинарной классификации, поддерживает те же пользовательские параметры, что и stochasticLinearRegression
  и работает аналогично.'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
---


# stochasticLogisticRegression

Эта функция реализует стохастическую логистическую регрессию. Она может использоваться для задач бинарной классификации, поддерживает те же пользовательские параметры, что и stochasticLinearRegression и работает аналогично.

### Параметры {#parameters}

Параметры точно такие же, как в stochasticLinearRegression:
`learning rate`, `l2 regularization coefficient`, `mini-batch size`, `method for updating weights`.
Для получения дополнительной информации смотрите [параметры](../reference/stochasticlinearregression.md/#parameters).

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** Обучение

<!-- -->

    См. раздел `Обучение` в описании [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression).

    Предсказанные метки должны находиться в \[-1, 1\].

**2.** Прогнозирование

<!-- -->

    Используя сохраненное состояние, мы можем предсказать вероятность того, что объект имеет метку `1`.

    ```sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    Запрос вернет колонку вероятностей. Обратите внимание, что первым аргументом функции `evalMLMethod` является объект `AggregateFunctionState`, следующими являются столбцы признаков.

    Мы также можем установить границу вероятности, которая присваивает элементам разные метки.

    ```sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    Тогда результатом будут метки.

    `test_data` - это таблица, аналогичная `train_data`, но может не содержать целевое значение.

**Смотрите Также**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [Разница между линейной и логистической регрессиями.](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
