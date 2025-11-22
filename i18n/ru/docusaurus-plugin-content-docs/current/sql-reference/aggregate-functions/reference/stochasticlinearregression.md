---
description: 'Эта функция реализует стохастическую линейную регрессию. Она поддерживает настраиваемые параметры скорости обучения, коэффициента L2-регуляризации, размера мини-батча и предоставляет несколько методов обновления весов (Adam, простой SGD, Momentum, Nesterov).'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---



# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

Функция реализует стохастическую линейную регрессию. Поддерживает настраиваемые параметры скорости обучения, коэффициента L2-регуляризации, размера мини-батча, а также несколько методов обновления весов ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (используется по умолчанию), [простой SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) и [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)).

### Параметры {#parameters}

Функция принимает 4 настраиваемых параметра. Они передаются последовательно, но передавать все четыре необязательно — будут использованы значения по умолчанию. Однако для построения качественной модели требуется настройка параметров.

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` — коэффициент длины шага при выполнении шага градиентного спуска. Слишком большая скорость обучения может привести к неограниченному росту весов модели. Значение по умолчанию: `0.00001`.
2.  `l2 regularization coefficient` — коэффициент L2-регуляризации, помогающий предотвратить переобучение. Значение по умолчанию: `0.1`.
3.  `mini-batch size` — количество элементов, для которых вычисляются и суммируются градиенты для выполнения одного шага градиентного спуска. Чистый стохастический спуск использует один элемент, однако небольшие батчи (около 10 элементов) делают шаги градиента более стабильными. Значение по умолчанию: `15`.
4.  `method for updating weights` — метод обновления весов. Доступны: `Adam` (по умолчанию), `SGD`, `Momentum` и `Nesterov`. Методы `Momentum` и `Nesterov` требуют немного больше вычислений и памяти, но обеспечивают более высокую скорость сходимости и стабильность стохастических градиентных методов.

### Использование {#usage}

Функция `stochasticLinearRegression` используется в два этапа: обучение модели и предсказание на новых данных. Для обучения модели и сохранения её состояния для последующего использования применяется комбинатор `-State`, который сохраняет состояние (например, веса модели).
Для предсказания используется функция [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod), которая принимает в качестве аргументов состояние модели и признаки для предсказания.

<a name='stochasticlinearregression-usage-fitting'></a>

**1.** Обучение

Можно использовать следующий запрос:

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

Также необходимо вставить данные в таблицу `train_data`. Количество параметров не фиксировано и зависит только от количества аргументов, переданных в `linearRegressionState`. Все они должны быть числовыми значениями.
Обратите внимание, что столбец с целевым значением (которое требуется научиться предсказывать) передается первым аргументом.

**2.** Предсказание

После сохранения состояния в таблицу его можно многократно использовать для предсказания или даже объединять с другими состояниями для создания новых, более качественных моделей.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

Запрос вернет столбец предсказанных значений. Обратите внимание, что первый аргумент `evalMLMethod` — это объект `AggregateFunctionState`, далее следуют столбцы признаков.

Таблица `test_data` аналогична `train_data`, но может не содержать целевое значение.

### Примечания {#notes}

1.  Для объединения двух моделей можно использовать следующий запрос:
    `sql  SELECT state1 + state2 FROM your_models`
    где таблица `your_models` содержит обе модели. Запрос вернет новый объект `AggregateFunctionState`.

2.  Можно получить веса обученной модели для собственных целей без сохранения модели, если не используется комбинатор `-State`:
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    Такой запрос обучит модель и вернет её веса — сначала веса, соответствующие параметрам модели, последним идет смещение (bias). В приведенном примере запрос вернет столбец с 3 значениями.

**См. также**


- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [Различия между линейной и логистической регрессией](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
