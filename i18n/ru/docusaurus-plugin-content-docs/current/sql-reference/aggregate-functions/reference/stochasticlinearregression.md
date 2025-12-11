---
description: 'Эта функция реализует стохастическую линейную регрессию. Поддерживает пользовательские параметры для скорости обучения, коэффициента L2-регуляризации, размера мини-батча и несколько методов обновления весов (Adam, простой SGD, Momentum, Nesterov).'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---

# stochasticLinearRegression {#agg&#95;functions&#95;stochasticlinearregression&#95;parameters}

Эта функция реализует стохастическую линейную регрессию. Она поддерживает настройку скорости обучения, коэффициента L2-регуляризации, размера мини-батча, а также несколько методов обновления весов ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (используется по умолчанию), [simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) и [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)).

### Параметры {#parameters}

Доступно 4 настраиваемых параметра. Они передаются функции последовательно, но нет необходимости передавать все четыре — будут использованы значения по умолчанию; однако для построения качественной модели обычно требуется дополнительная настройка параметров.

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1. `learning rate` — коэффициент, определяющий длину шага при выполнении шага градиентного спуска. Слишком большое значение может привести к стремлению весов модели к бесконечности. Значение по умолчанию — `0.00001`.
2. `l2 regularization coefficient` — коэффициент L2‑регуляризации, который может помочь предотвратить переобучение. Значение по умолчанию — `0.1`.
3. `mini-batch size` задаёт число элементов, по которым вычисляются и суммируются градиенты для выполнения одного шага градиентного спуска. Чистый стохастический спуск использует один элемент, однако использование небольших батчей (порядка 10 элементов) делает шаги градиентного спуска более стабильными. Значение по умолчанию — `15`.
4. `method for updating weights` — метод обновления весов; доступны: `Adam` (по умолчанию), `SGD`, `Momentum` и `Nesterov`. `Momentum` и `Nesterov` требуют немного больше вычислений и памяти, однако они оказываются полезны с точки зрения скорости сходимости и устойчивости стохастических градиентных методов.

### Использование {#usage}

`stochasticLinearRegression` используется в два этапа: обучение модели и предсказание на новых данных. Чтобы обучить модель и сохранить её состояние для последующего использования, применяется комбинатор `-State`, который сохраняет состояние (например, веса модели).
Для предсказаний используется функция [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod), которая принимает состояние как аргумент, а также признаки, по которым нужно сделать предсказание.

<a name="stochasticlinearregression-usage-fitting" />

**1.** Обучение

Можно использовать следующий запрос.

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

Здесь нам также необходимо вставить данные в таблицу `train_data`. Количество параметров не фиксировано: оно зависит только от числа аргументов, переданных в `linearRegressionState`. Все они должны быть числовыми значениями.
Обратите внимание, что столбец с целевым значением (которое мы хотим научиться предсказывать) передаётся в качестве первого аргумента.

**2.** Предсказание

После сохранения состояния в таблицу мы можем использовать его многократно для предсказаний или даже объединять с другими состояниями и создавать новые, ещё более качественные модели.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

Запрос вернёт столбец предсказанных значений. Обратите внимание, что первый аргумент `evalMLMethod` — это объект `AggregateFunctionState`, далее указаны столбцы с признаками.

`test_data` — это таблица, аналогичная `train_data`, но она может не содержать целевого значения.

### Примечания {#notes}

1. Чтобы объединить две модели, пользователь может выполнить такой запрос:
   `sql  SELECT state1 + state2 FROM your_models`
   где таблица `your_models` содержит обе модели. Этот запрос вернёт новый объект `AggregateFunctionState`.

2. Пользователь может получить веса созданной модели для собственных целей, не сохраняя модель, если не используется комбинатор `-State`.
   `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
   Такой запрос обучит модель и вернёт её веса: сначала идут веса, соответствующие параметрам модели, последний — смещение (bias). Поэтому в приведённом выше примере запрос вернёт столбец из трёх значений.

**См. также**

* [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
* [Различие между линейной и логистической регрессией](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
