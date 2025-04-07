description: 'Эта функция реализует стохастическую линейную регрессию. Она поддерживает настройки для темпа обучения, коэффициента L2 регуляризации, размера мини-пакета и имеет несколько методов для обновления весов (Adam, простой SGD, Momentum, Nesterov).'
sidebar_position: 192
slug: /sql-reference/aggregate-functions/reference/stochasticlinearregression
title: 'stochasticLinearRegression'
```


# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

Эта функция реализует стохастическую линейную регрессию. Она поддерживает настройки для темпа обучения, коэффициента L2 регуляризации, размера мини-пакета и имеет несколько методов для обновления весов ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (по умолчанию), [простой SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Momentum](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) и [Nesterov](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)).

### Параметры {#parameters}

Существует 4 настраиваемых параметра. Они передаются функции последовательно, но нет необходимости передавать все четыре - будут использоваться значения по умолчанию, однако для хорошей модели требуется настройка некоторых параметров.

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` - коэффициент шага длины, когда выполняется шаг градиентного спуска. Слишком большой темп обучения может привести к бесконечным весам модели. Значение по умолчанию - `0.00001`.
2.  `l2 regularization coefficient`, который может помочь предотвратить переобучение. Значение по умолчанию - `0.1`.
3.  `mini-batch size` устанавливает количество элементов, для которых будут вычислены и суммированы градиенты для выполнения одного шага градиентного спуска. Чистый стохастический спуск использует один элемент, однако наличие маленьких пакетов (около 10 элементов) делает градиентные шаги более стабильными. Значение по умолчанию - `15`.
4.  `method for updating weights`, это: `Adam` (по умолчанию), `SGD`, `Momentum` и `Nesterov`. `Momentum` и `Nesterov` требуют немного больше вычислений и памяти, однако они оказываются полезными с точки зрения скорости сходимости и стабильности стохастических методов градиента.

### Использование {#usage}

`stochasticLinearRegression` используется в два этапа: подгонка модели и предсказание на новых данных. Чтобы подогнать модель и сохранить её состояние для дальнейшего использования, мы используем комбинатор `-State`, который сохраняет состояние (например, веса модели). Для предсказания мы используем функцию [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod), которая принимает состояние в качестве аргумента, а также признаки для предсказания.

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** Подгонка

Такой запрос может быть использован.

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

Здесь нам также нужно вставить данные в таблицу `train_data`. Количество параметров не фиксировано, оно зависит только от количества аргументов, переданных в `linearRegressionState`. Все они должны быть числовыми значениями. Обратите внимание, что колонка с целевым значением (которое мы хотели бы научиться предсказывать) вставляется в качестве первого аргумента.

**2.** Предсказание

После сохранения состояния в таблицу, мы можем использовать его несколько раз для предсказания или даже объединить с другими состояниями и создать новые, еще лучшие модели.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

Запрос вернет колонку предсказанных значений. Обратите внимание, что первым аргументом `evalMLMethod` является объект `AggregateFunctionState`, затем идут колонки признаков.

`test_data` - это таблица, аналогичная `train_data`, но она может не содержать целевое значение.

### Примечания {#notes}

1.  Чтобы объединить две модели, пользователь может создать такой запрос:
    `sql  SELECT state1 + state2 FROM your_models`
    где таблица `your_models` содержит обе модели. Этот запрос вернет новый объект `AggregateFunctionState`.

2.  Пользователь может получить веса созданной модели для своих нужд без сохранения модели, если не используется комбинатор `-State`.
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    Такой запрос подгонит модель и вернет её веса - первыми будут веса, соответствующие параметрам модели, последним будет смещение. Таким образом, в приведенном выше примере запрос вернет колонку с 3 значениями.

**См. также**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [Разница между линейной и логистической регрессией](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)
