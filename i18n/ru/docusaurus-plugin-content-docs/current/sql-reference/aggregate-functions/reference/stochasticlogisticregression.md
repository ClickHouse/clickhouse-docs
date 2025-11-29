---
description: 'Эта функция реализует стохастическую логистическую регрессию. Она может использоваться для задач бинарной классификации, поддерживает те же настраиваемые параметры, что и stochasticLinearRegression, и работает аналогичным образом.'
sidebar_position: 193
slug: /sql-reference/aggregate-functions/reference/stochasticlogisticregression
title: 'stochasticLogisticRegression'
doc_type: 'reference'
---

# stochasticLogisticRegression {#stochasticlogisticregression}

Эта функция реализует стохастическую логистическую регрессию. Ее можно использовать для решения задачи бинарной классификации; она поддерживает те же настраиваемые параметры, что и stochasticLinearRegression, и работает аналогичным образом.

### Параметры {#parameters}

Параметры полностью совпадают с параметрами в stochasticLinearRegression:
`learning rate`, `l2 regularization coefficient`, `mini-batch size`, `method for updating weights`.
Для получения дополнительной информации см. раздел [параметры](../reference/stochasticlinearregression.md/#parameters).

```text
stochasticLogisticRegression(1.0, 1.0, 10, 'SGD')
```

**1.** Подгонка

{/* */ }

См. раздел `Fitting` в описании функции [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression).

Предсказанные метки должны находиться в диапазоне [-1, 1].

**2.** Прогнозирование

{/* */ }

Используя сохранённое состояние, мы можем предсказать вероятность того, что объект будет иметь метку `1`.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

Запрос вернёт столбец вероятностей. Обратите внимание, что первый аргумент функции `evalMLMethod` — объект `AggregateFunctionState`, а затем идут столбцы признаков.

Мы также можем задать порог вероятности, который распределяет элементы по разным меткам.

```sql
SELECT ans < 1.1 AND ans > 0.5 FROM
(WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) AS ans FROM test_data)
```

В результате будут получены метки.

`test_data` — это таблица, аналогичная `train_data`, но в ней может не быть целевого значения.

**См. также**

* [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
* [Разница между линейной и логистической регрессиями.](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
