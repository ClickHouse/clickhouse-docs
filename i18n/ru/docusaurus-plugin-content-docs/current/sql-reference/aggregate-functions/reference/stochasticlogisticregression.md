---
description: 'Эта функция реализует стохастическую логистическую регрессию. Ее можно использовать
  для задачи бинарной классификации, она поддерживает те же настраиваемые параметры, что и stochasticLinearRegression
  и работает аналогичным образом.'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
doc_type: 'reference'
---



# stochasticLogisticRegression

Функция реализует стохастическую логистическую регрессию. Может использоваться для задач бинарной классификации, поддерживает те же настраиваемые параметры, что и stochasticLinearRegression, и работает аналогичным образом.

### Параметры {#parameters}

Параметры полностью совпадают с параметрами stochasticLinearRegression:
`learning rate` (скорость обучения), `l2 regularization coefficient` (коэффициент L2-регуляризации), `mini-batch size` (размер мини-батча), `method for updating weights` (метод обновления весов).
Подробнее см. [параметры](../reference/stochasticlinearregression.md/#parameters).

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** Обучение

<!-- -->

    См. раздел `Fitting` (Обучение) в описании [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression).

    Прогнозируемые метки должны находиться в диапазоне \[-1, 1\].

**2.** Прогнозирование

<!-- -->

    Используя сохраненное состояние, можно предсказать вероятность того, что объект имеет метку `1`.

    ```sql
    WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) FROM test_data
    ```

    Запрос вернет столбец с вероятностями. Обратите внимание, что первым аргументом `evalMLMethod` является объект `AggregateFunctionState`, далее следуют столбцы с признаками.

    Также можно задать пороговое значение вероятности для отнесения элементов к различным меткам.

    ```sql
    SELECT ans < 1.1 AND ans > 0.5 FROM
    (WITH (SELECT state FROM your_model) AS model SELECT
    evalMLMethod(model, param1, param2) AS ans FROM test_data)
    ```

    В результате будут получены метки.

    `test_data` — таблица, аналогичная `train_data`, но может не содержать целевое значение.

**См. также**

- [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [Разница между линейной и логистической регрессией.](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
