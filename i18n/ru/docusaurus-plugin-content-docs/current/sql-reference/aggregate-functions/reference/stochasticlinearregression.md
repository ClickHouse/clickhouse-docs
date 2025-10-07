---
'description': 'Эта функция реализует стохастическую линейную регрессию. Она поддерживает
  пользовательские параметры для скорости обучения, коэффициента L2 регуляризации,
  размера мини-партии и имеет несколько методов для обновления весов (Adam, простой
  SGD, Momentum, Nesterov).'
'sidebar_position': 192
'slug': '/sql-reference/aggregate-functions/reference/stochasticlinearregression'
'title': 'stochasticLinearRegression'
'doc_type': 'reference'
---
# stochasticLinearRegression {#agg_functions_stochasticlinearregression_parameters}

Эта функция реализует стохастическую линейную регрессию. Она поддерживает пользовательские параметры для скорости обучения, коэффициента L2 регуляризации, размера мини-партии и имеет несколько методов обновления весов ([Adam](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Adam) (используется по умолчанию), [простой SGD](https://en.wikipedia.org/wiki/Stochastic_gradient_descent), [Импульс](https://en.wikipedia.org/wiki/Stochastic_gradient_descent#Momentum) и [Нестерова](https://mipt.ru/upload/medialibrary/d7e/41-91.pdf)).

### Параметры {#parameters}

Существует 4 настраиваемых параметра. Они передаются функции последовательно, но нет необходимости передавать все четыре - будут использованы значения по умолчанию, однако для хорошей модели требуется настройка некоторых параметров.

```text
stochasticLinearRegression(0.00001, 0.1, 15, 'Adam')
```

1.  `learning rate` - коэффициент длины шага, когда выполняется шаг градиентного спуска. Слишком большое значение скорости обучения может привести к бесконечным весам модели. Значение по умолчанию - `0.00001`.
2.  `l2 regularization coefficient`, который может помочь предотвратить переобучение. Значение по умолчанию - `0.1`.
3.  `mini-batch size` задает количество элементов, по которым будут вычисляться и суммироваться градиенты для выполнения одного шага градиентного спуска. Чистый стохастический спад использует один элемент, однако наличие небольших партий (около 10 элементов) делает шаги градиента более стабильными. Значение по умолчанию - `15`.
4.  `method for updating weights`, они: `Adam` (по умолчанию), `SGD`, `Momentum` и `Nesterov`. `Momentum` и `Nesterov` требуют немного больше вычислений и памяти, однако они оказываются полезными с точки зрения скорости сходимости и стабильности стохастических методов градиента.

### Использование {#usage}

`stochasticLinearRegression` используется в два этапа: подгонка модели и прогнозирование на новых данных. Для подгонки модели и сохранения ее состояния для дальнейшего использования мы используем комбнатор `-State`, который сохраняет состояние (например, веса модели).
Для прогнозирования используем функцию [evalMLMethod](/sql-reference/functions/machine-learning-functions#evalmlmethod), которая принимает состояние в качестве аргумента, а также признаки для прогнозирования.

<a name="stochasticlinearregression-usage-fitting"></a>

**1.** Подгонка

Можно использовать такой запрос.

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

Здесь также необходимо вставить данные в таблицу `train_data`. Количество параметров не фиксировано, оно зависит только от числа аргументов, переданных в `linearRegressionState`. Все они должны быть числовыми значениями.
Обратите внимание, что колонка с целевым значением (которое мы хотим научиться предсказывать) вставляется в качестве первого аргумента.

**2.** Прогнозирование

После сохранения состояния в таблице мы можем использовать его несколько раз для прогнозирования или даже объединять с другими состояниями и создавать новые, еще лучшие модели.

```sql
WITH (SELECT state FROM your_model) AS model SELECT
evalMLMethod(model, param1, param2) FROM test_data
```

Запрос вернет колонку предсказанных значений. Обратите внимание, что первым аргументом `evalMLMethod` является объект `AggregateFunctionState`, а следующие - колонки признаков.

`test_data` - это таблица вроде `train_data`, но она может не содержать целевое значение.

### Примечания {#notes}

1.  Для объединения двух моделей пользователь может создать такой запрос:
    `sql  SELECT state1 + state2 FROM your_models`
    где таблица `your_models` содержит обе модели. Этот запрос вернет новый объект `AggregateFunctionState`.

2.  Пользователь может извлечь веса созданной модели для собственных нужд без сохранения модели, если не используется комбнатор `-State`.
    `sql  SELECT stochasticLinearRegression(0.01)(target, param1, param2) FROM train_data`
    Такой запрос подгонит модель и вернет ее веса - первыми будут веса, соответствующие параметрам модели, последний - смещение. Таким образом, в приведенном примере запрос вернет колонку с 3 значениями.

**Смотрите также**

- [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression)
- [Разница между линейной и логистической регрессиями](https://stackoverflow.com/questions/12146914/what-is-the-difference-between-linear-regression-and-logistic-regression)