---
description: 'Эта функция реализует стохастическую линейную регрессию. Она поддерживает настраиваемые параметры скорости обучения, коэффициента L2-регуляризации, размера мини-батча и несколько методов обновления весов (Adam, простой SGD, Momentum, Nesterov).'
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
doc_type: 'reference'
---

# stochasticLinearRegression \\{#agg_functions_stochasticlinearregression_parameters\\}

Эта функция реализует стохастическую линейную регрессию. В ней предусмотрены настраиваемые параметры скорости обучения, коэффициента L2‑регуляризации, размера мини‑батча, а также несколько методов обновления весов ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (используется по умолчанию), [simple SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) и [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)).

### Параметры \{#parameters\}

Существует четыре настраиваемых параметра. Они передаются в функцию последовательно, но нет необходимости указывать все четыре — будут использованы значения по умолчанию. Однако для получения качественной модели требуется некоторая настройка параметров.

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1. `learning rate` — это коэффициент, определяющий длину шага при выполнении шага градиентного спуска. Слишком большое значение learning rate может привести к бесконечно большим значениям весов модели. Значение по умолчанию — `0.00001`.
2. `l2 regularization coefficient` — коэффициент L2-регуляризации, который может помочь предотвратить переобучение. Значение по умолчанию — `0.1`.
3. `mini-batch size` задаёт количество элементов, для которых градиенты будут вычислены и суммированы для выполнения одного шага градиентного спуска. Чистый стохастический спуск использует один элемент, однако использование небольших мини-батчей (около 10 элементов) делает шаги градиентного спуска более стабильными. Значение по умолчанию — `15`.
4. `method for updating weights` — метод обновления весов; доступны следующие варианты: `Adam` (по умолчанию), `SGD`, `Momentum` и `Nesterov`. `Momentum` и `Nesterov` требуют несколько больше вычислений и памяти, однако на практике оказываются полезными с точки зрения скорости сходимости и устойчивости стохастических градиентных методов.


### Использование \{#usage\}

`stochasticLinearRegression` используется в два этапа: сначала выполняется обучение модели, затем — предсказание на новых данных. Чтобы обучить модель и сохранить её состояние для последующего использования, мы используем комбинатор `-State`, который сохраняет состояние (например, веса модели).
Для предсказания мы используем функцию [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod), которая принимает состояние в качестве аргумента, а также признаки, по которым нужно выполнить предсказание.

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

Здесь нам также необходимо записать данные в таблицу `train_data`. Количество параметров не является фиксированным, оно зависит только от числа аргументов, переданных в `linearRegressionState`. Все они должны быть числовыми значениями.
Обратите внимание, что столбец с целевым значением (которое мы хотим научиться предсказывать) передаётся в качестве первого аргумента.

**2.** Предсказание

После сохранения состояния в таблицу мы можем повторно использовать его для предсказаний или даже объединять с другими состояниями и создавать новые, ещё более качественные модели.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

Запрос вернёт столбец предсказанных значений. Обратите внимание, что первый аргумент `evalMLMethod` — объект `AggregateFunctionState`, далее идут столбцы признаков.

`test_data` — это таблица, аналогичная `train_data`, но может не содержать целевое значение.


### Примечания \{#notes\}

1. Для объединения двух моделей пользователь может создать такой запрос:
   `sql  SELECT state1 + state2 FROM your_models`
   где таблица `your_models` содержит обе модели. Этот запрос вернет новый объект `AggregateFunctionState`.

2. Пользователь может извлечь веса созданной модели для собственных целей, не сохраняя саму модель, если не используется комбинатор `-State`.
   `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
   Такой запрос обучит модель и вернет ее веса: сначала идут веса, соответствующие параметрам модели, последний — это смещение (bias). Таким образом, в приведенном выше примере запрос вернет столбец с тремя значениями.

**См. также**

* [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
* [Разница между линейной и логистической регрессиями](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
