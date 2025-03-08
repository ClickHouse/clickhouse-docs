---
slug: /sql-reference/aggregate-functions/reference/
toc_folder_title: Справочник
sidebar_position: 36
toc_hidden: true
---


# Агрегатные функции

ClickHouse поддерживает все стандартные SQL агрегатные функции ([sum](../reference/sum.md), [avg](../reference/avg.md), [min](../reference/min.md), [max](../reference/max.md), [count](../reference/count.md)), а также широкий спектр других агрегатных функций.

<!-- Таблица содержания для этой страницы автоматически генерируется 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
из полей YAML front matter: slug, description, title.

Если вы заметили ошибку, пожалуйста, отредактируйте YAML frontmatter на самих страницах.
-->
| Страница | Описание |
|-----|-----|
| [intervalLengthSum](/sql-reference/aggregate-functions/reference/intervalLengthSum) | Вычисляет общую длину объединения всех диапазонов (сегментов на числовой оси). |
| [median](/sql-reference/aggregate-functions/reference/median) | Функции `median*` являются псевдонимами для соответствующих функций `quantile*`. Они вычисляют медиану выборки числовых данных. |
| [welchTTest](/sql-reference/aggregate-functions/reference/welchttest) | Применяет t-тест Уэлча к выборкам из двух популяций. |
| [groupArrayMovingSum](/sql-reference/aggregate-functions/reference/grouparraymovingsum) | Вычисляет скользящую сумму входных значений. |
| [groupBitmapAnd](/sql-reference/aggregate-functions/reference/groupbitmapand) | Вычисляет логическое И для колонки битовой карты, возвращает кардинальность типа UInt64. Если добавить суффикс -State, то будет возвращен объект битовой карты. |
| [topKWeighted](/sql-reference/aggregate-functions/reference/topkweighted) | Возвращает массив примерно наиболее частых значений в указанной колонке. Результирующий массив отсортирован по убыванию приблизительной частоты значений (а не по самим значениям). Дополнительно учитывается вес значения. |
| [distinctJSONPaths](/sql-reference/aggregate-functions/reference/distinctjsonpaths) | Вычисляет список различных путей, хранящихся в колонке JSON. |
| [kolmogorovSmirnovTest](/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | Применяет тест Колмогорова-Смирнова к выборкам из двух популяций. |
| [quantileExactWeightedInterpolated](/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | Вычисляет квантиль числовой последовательности данных с использованием линейной интерполяции, принимая во внимание вес каждого элемента. |
| [largestTriangleThreeBuckets](/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | Применяет алгоритм Largest-Triangle-Three-Buckets к входным данным. |
| [approx_top_sum](/sql-reference/aggregate-functions/reference/approxtopsum) | Возвращает массив примерно наиболее частых значений и их количества в указанной колонке. |
| [covarSamp](/sql-reference/aggregate-functions/reference/covarsamp) | Вычисляет значение `Σ((x - x̅)(y - y̅)) / (n - 1)` |
| [groupBitmapOr](/sql-reference/aggregate-functions/reference/groupbitmapor) | Вычисляет логическое ИЛИ для колонки битовой карты, возвращает кардинальность типа UInt64. Если добавить суффикс -State, то будет возвращен объект битовой карты. Это эквивалентно `groupBitmapMerge`. |
| [varSamp](/sql-reference/aggregate-functions/reference/varSamp) | Вычисляет выборочную дисперсию набора данных. |
| [cramersVBiasCorrected](/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | Вычисляет Cramer's V, но использует коррекцию смещения. |
| [quantiles Functions](/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/sql-reference/aggregate-functions/reference/anylast) | Выбирает последнее встреченное значение в колонке. |
| [corrStable](/sql-reference/aggregate-functions/reference/corrstable) | Вычисляет коэффициент корреляции Пирсона, но использует численно стабильный алгоритм. |
| [stddevPopStable](/sql-reference/aggregate-functions/reference/stddevpopstable) | Результат равен квадратному корню из varPop. В отличие от stddevPop, эта функция использует численно стабильный алгоритм. |
| [maxIntersections](/sql-reference/aggregate-functions/reference/maxintersections) | Агрегатная функция, которая вычисляет максимальное количество пересечений группы интервалов друг с другом (если все интервалы пересекаются хотя бы раз). |
| [flameGraph](/sql-reference/aggregate-functions/reference/flame_graph) | Агрегатная функция, которая строит flamegraph, используя список стековых трассировок. |
| [min](/sql-reference/aggregate-functions/reference/min) | Агрегатная функция, которая вычисляет минимум среди группы значений. |
| [sumMapWithOverflow](/sql-reference/aggregate-functions/reference/summapwithoverflow) | Суммирует массив `value` в соответствии с ключами, указанными в массиве `key`. Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, сложенные для соответствующих ключей. Отличается от функции sumMap тем, что она выполняет сложение с переполнением. |
| [uniq](/sql-reference/aggregate-functions/reference/uniq) | Вычисляет приблизительное количество различных значений аргумента. |
| [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) | Вычисляет приблизительный квантиль числовой последовательности данных с использованием алгоритма t-digest. |
| [groupArrayMovingAvg](/sql-reference/aggregate-functions/reference/grouparraymovingavg) | Вычисляет скользящее среднее входных значений. |
| [rankCorr](/sql-reference/aggregate-functions/reference/rankCorr) | Вычисляет коэффициент ранговой корреляции. |
| [covarSampStable](/sql-reference/aggregate-functions/reference/covarsampstable) | Похоже на covarSamp, но работает медленнее, обеспечивая меньшую вычислительную погрешность. |
| [avgWeighted](/sql-reference/aggregate-functions/reference/avgweighted) | Вычисляет взвешенное арифметическое среднее. |
| [skewSamp](/sql-reference/aggregate-functions/reference/skewsamp) | Вычисляет выборочную асимметрию последовательности. |
| [groupArrayInsertAt](/sql-reference/aggregate-functions/reference/grouparrayinsertat) | Вставляет значение в массив в указанной позиции. |
| [](/sql-reference/aggregate-functions/reference/array_concat_agg) |  |
| [entropy](/sql-reference/aggregate-functions/reference/entropy) | Вычисляет энтропию Шеннона для колонки значений. |
| [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch) | Вычисляет приблизительное количество различных значений аргумента, используя Theta Sketch Framework. |
| [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) | Вычисляет приблизительный квантиль числовой последовательности данных. |
| [simpleLinearRegression](/sql-reference/aggregate-functions/reference/simplelinearregression) | Выполняет простую (одномерную) линейную регрессию. |
| [covarPop](/sql-reference/aggregate-functions/reference/covarpop) | Вычисляет популяционную ковариацию. |
| [groupBitmapXor](/sql-reference/aggregate-functions/reference/groupbitmapxor) | Вычисляет логическое исключающее ИЛИ для колонки битовой карты и возвращает кардинальность типа UInt64. Если используется суффикс -State, то возвращается объект битовой карты. |
| [maxMap](/sql-reference/aggregate-functions/reference/maxmap) | Вычисляет максимум из массива `value` в соответствии с ключами, указанными в массиве `key`. |
| [varPopStable](/sql-reference/aggregate-functions/reference/varpopstable) | Возвращает популяционную дисперсию. В отличие от varPop, эта функция использует численно стабильный алгоритм. Работает медленнее, но обеспечивает меньшую вычислительную погрешность. |
| [avg](/sql-reference/aggregate-functions/reference/avg) | Вычисляет арифметическое среднее. |
| [kurtPop](/sql-reference/aggregate-functions/reference/kurtpop) | Вычисляет куртозис последовательности. |
| [aggThrow](/sql-reference/aggregate-functions/reference/aggthrow) | Эта функция может быть использована для проверки безопасности исключений. Она вызовет исключение при создании с заданной вероятностью. |
| [argMin](/sql-reference/aggregate-functions/reference/argmin) | Вычисляет значение `arg` для минимального значения `val`. Если есть несколько строк с одинаковым максимальным `val`, то получение связанного `arg` не является детерминированным. |
| [first_value](/sql-reference/aggregate-functions/reference/first_value) | Это псевдоним для any, но он был введен для совместимости с оконными функциями, где иногда необходимо обрабатывать значения `NULL` (по умолчанию все агрегатные функции ClickHouse игнорируют значения NULL). |
| [sumKahan](/sql-reference/aggregate-functions/reference/sumkahan) | Вычисляет сумму чисел с использованием алгоритма компенсированного сложения Кахана. |
| [count](/sql-reference/aggregate-functions/reference/count) | Считывает количество строк или значений, не равных NULL. |
| [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) | Добавляет разницу между последовательными строками. Если разница отрицательная, она игнорируется. |
| [studentTTest](/sql-reference/aggregate-functions/reference/studentttest) | Применяет t-тест Стьюдента к выборкам из двух популяций. |
| [sumWithOverflow](/sql-reference/aggregate-functions/reference/sumwithoverflow) | Вычисляет сумму чисел, используя тот же тип данных для результата, что и для входных параметров. Если сумма превышает максимальное значение для этого типа данных, она вычисляется с переполнением. |
| [sum](/sql-reference/aggregate-functions/reference/sum) | Вычисляет сумму. Работает только для чисел. |
| [boundingRatio](/sql-reference/aggregate-functions/reference/boundingRatio) | Агрегатная функция, которая вычисляет наклон между наиболее левыми и наиболее правыми точками среди группы значений. |
| [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) | Вычисляет точное количество различных значений аргумента. |
| [exponentialTimeDecayedCount](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | Возвращает кумулятивное экспоненциальное затухание по временной серии в индексе `t` во времени. |
| [sumCount](/sql-reference/aggregate-functions/reference/sumcount) | Вычисляет сумму чисел и одновременно считает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе есть несколько функций `sum`, `count` или `avg`, их можно заменить на одну функцию `sumCount`, чтобы повторно использовать вычисления. Функция редко требуется использовать явно. |
| [varSampStable](/sql-reference/aggregate-functions/reference/varsampstable) | Вычисляет выборочную дисперсию набора данных. В отличие от `varSamp`, эта функция использует численно стабильный алгоритм. Работает медленнее, но обеспечивает меньшую вычислительную погрешность. |
| [topK](/sql-reference/aggregate-functions/reference/topk) | Возвращает массив примерно наиболее частых значений в указанной колонке. Результирующий массив отсортирован по убыванию приблизительной частоты значений (а не по самим значениям). |
| [maxIntersectionsPosition](/sql-reference/aggregate-functions/reference/maxintersectionsposition) | Агрегатная функция, которая вычисляет позиции вхождений функции maxIntersections. |
| [stddevSampStable](/sql-reference/aggregate-functions/reference/stddevsampstable) | Результат равен квадратному корню из varSamp. В отличие от этого, функция использует численно стабильный алгоритм. |
| [varPop](/en/sql-reference/aggregate-functions/reference/varPop) | Вычисляет популяционную дисперсию. |
| [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) | Точно вычисляет квантиль числовой последовательности данных, учитывая вес каждого элемента. |
| [covarPopMatrix](/sql-reference/aggregate-functions/reference/covarpopmatrix) | Возвращает популяционную ковариационную матрицу по N переменным. |
| [sparkbar](/sql-reference/aggregate-functions/reference/sparkbar) | Функция строит частотный гистограмму для значений `x` и частоты повторения `y` этих значений по интервалу `[min_x, max_x]`. |
| [contingency](/sql-reference/aggregate-functions/reference/contingency) | Функция `contingency` вычисляет коэффициент контингентности, значение, которое измеряет ассоциацию между двумя колонками в таблице. Вычисление похоже на функцию `cramersV`, но с другим знаменателем в квадратном корне. |
| [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) | Эта функция реализует стохастическую линейную регрессию. Она поддерживает пользовательские параметры для скорости обучения, коэффициента L2 регуляризации, размера мини-пакета и имеет несколько методов обновления весов (Adam, простой SGD, Momentum, Nesterov). |
| [analysisOfVariance](/sql-reference/aggregate-functions/reference/analysis_of_variance) | Предоставляет статистический тест одностороннего анализа вариации (тест ANOVA). Это тест над несколькими группами нормально распределенных наблюдений, чтобы выяснить, имеют ли все группы одинаковое среднее или нет. |
| [groupConcat](/sql-reference/aggregate-functions/reference/groupconcat) | Вычисляет сконкатенированную строку из группы строк, опционально разделенных разделителем и ограниченных максимальным количеством элементов. |
| [exponentialTimeDecayedMax](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | Возвращает максимум из вычисленного экспоненциально сглаженного скользящего среднего в индексе `t` во времени с тем, что в `t-1`.  |
| [any](/sql-reference/aggregate-functions/reference/any) | Выбирает первое встреченное значение в колонке. |
| [covarSampMatrix](/sql-reference/aggregate-functions/reference/covarsampmatrix) | Возвращает выборочную ковариационную матрицу по N переменным. |
| [groupArrayLast](/sql-reference/aggregate-functions/reference/grouparraylast) | Создает массив последних значений аргументов. |
| [singleValueOrNull](/sql-reference/aggregate-functions/reference/singlevalueornull) | Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапроса, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли только одно уникальное ненулевое значение в данных. |
| [theilsU](/sql-reference/aggregate-functions/reference/theilsu) | Функция `theilsU` вычисляет коэффициент неопределенности Тейла, значение, которое измеряет ассоциацию между двумя колонками в таблице. |
| [cramersV](/sql-reference/aggregate-functions/reference/cramersv) | Результат функции `cramersV` колеблется от 0 (соответствует отсутствию ассоциации между переменными) до 1 и может достигать 1 только тогда, когда каждое значение полностью определяется другим. Это можно рассматривать как ассоциацию между двумя переменными в процентном отношении к их максимальной возможной вариации. |
| [last_value](/sql-reference/aggregate-functions/reference/last_value) | Выбирает последнее встреченное значение, аналогично `anyLast`, но может принимать NULL. |
| [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) | При определенной точности вычисляет квантиль числовой последовательности данных. |
| [groupBitmap](/sql-reference/aggregate-functions/reference/groupbitmap) | Битовые или агрегатные вычисления из колонки беззнаковых целых чисел, возвращает кардинальность типа UInt64, если добавить суффикс -State, то вернуть объект битовой карты. |
| [minMap](/sql-reference/aggregate-functions/reference/minmap) | Вычисляет минимум из массива `value` в соответствии с ключами, указанными в массиве `key`. |
| [exponentialTimeDecayedAvg](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | Возвращает экспоненциально сглаженное взвешенное скользящее среднее значений временной серии в момент времени `t`. |
| [skewPop](/sql-reference/aggregate-functions/reference/skewpop) | Вычисляет асимметрию последовательности. |
| [mannWhitneyUTest](/sql-reference/aggregate-functions/reference/mannwhitneyutest) | Применяет тест рангового согласия Манна-Уитни к выборкам из двух популяций. |
| [quantileGK](/sql-reference/aggregate-functions/reference/quantileGK) | Вычисляет квантиль числовой последовательности данных с использованием алгоритма Гринвальда-Ханна. |
| [groupArrayIntersect](/sql-reference/aggregate-functions/reference/grouparrayintersect) | Возвращает пересечение данных массивов (возвращает все элементы массивов, которые есть во всех данных массивах). |
| [groupArraySample](/sql-reference/aggregate-functions/reference/grouparraysample) | Создает массив выборочных значений аргументов. Размер результирующего массива ограничен значением `max_size`. Значения аргументов выбираются и добавляются в массив случайным образом. |
| [stddevSamp](/sql-reference/aggregate-functions/reference/stddevsamp) | Результат равен квадратному корню из varSamp. |
| [quantile](/sql-reference/aggregate-functions/reference/quantile) | Вычисляет приблизительный квантиль числовой последовательности данных. |
| [groupArray](/sql-reference/aggregate-functions/reference/grouparray) | Создает массив значений аргументов. Значения могут добавляться в массив в любом (неопределенном) порядке. |
| [exponentialTimeDecayedSum](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | Возвращает сумму экспоненциально сглаженных скользящих средних значений временной серии в индексе `t` во времени. |
| [categoricalInformationValue](/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории. |
| [corr](/sql-reference/aggregate-functions/reference/corr) | Вычисляет коэффициент корреляции Пирсона. |
| [approx_top_k](/sql-reference/aggregate-functions/reference/approxtopk) | Возвращает массив примерно наиболее частых значений и их количества в указанной колонке. |
| [corrMatrix](/sql-reference/aggregate-functions/reference/corrmatrix) | Вычисляет корреляционную матрицу для N переменных. |
| [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) | Вычисляет приблизительный квантиль выборки с гарантией относительной погрешности. |
| [anyHeavy](/sql-reference/aggregate-functions/reference/anyheavy) | Выбирает часто встречающееся значение с использованием алгоритма heavy hitters. Если есть значение, которое встречается более чем в половине случаев в каждом из потоков выполнения запроса, то это значение возвращается. Обычно результат является недетерминированным. |
| [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) | Вычисляет приблизительный квантиль выборки, состоящей из чисел bfloat16. |
| [max](/sql-reference/aggregate-functions/reference/max) | Агрегатная функция, которая вычисляет максимум среди группы значений. |
| [groupBitXor](/sql-reference/aggregate-functions/reference/groupbitxor) | Применяет побитовое `XOR` для наборов чисел. |
| [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) | При определенной точности вычисляет квантиль числовой последовательности данных в зависимости от веса каждого элемента последовательности. |
| [quantileInterpolatedWeighted](/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | Вычисляет квантиль числовой последовательности данных с использованием линейной интерполяции, принимая во внимание вес каждого элемента. |
| [stddevPop](/sql-reference/aggregate-functions/reference/stddevpop) | Результат равен квадратному корню из varPop. |
| [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) | Вычисляет приблизительное количество различных значений аргумента. |
| [covarPopStable](/sql-reference/aggregate-functions/reference/covarpopstable) | Вычисляет значение популяционной ковариации. |
| [argMax](/sql-reference/aggregate-functions/reference/argmax) | Вычисляет значение `arg` для максимального значения `val`. |
| [groupBitOr](/sql-reference/aggregate-functions/reference/groupbitor) | Применяет побитовое `OR` к множеству чисел. |
| [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | Вычисляет приблизительный квантиль числовой последовательности данных с использованием алгоритма t-digest. |
| [distinctDynamicTypes](/sql-reference/aggregate-functions/reference/distinctdynamictypes) | Вычисляет список различных типов данных, хранящихся в динамической колонке. |
| [sumMap](/sql-reference/aggregate-functions/reference/summap) | Суммирует массив `value` в соответствии с ключами, указанными в массиве `key`. Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, сложенные для соответствующих ключей без переполнения. |
| [kurtSamp](/sql-reference/aggregate-functions/reference/kurtsamp) | Вычисляет выборочный куртозис последовательности. |
| [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | Эта функция реализует стохастическую логистическую регрессию. Может использоваться для проблем бинарной классификации, поддерживает те же пользовательские параметры, что и stochasticLinearRegression, и работает аналогичным образом. |
| [exponentialMovingAverage](/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | Вычисляет экспоненциальное скользящее среднее значений за определенное время. |
| [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) | Вычисляет приблизительное количество различных значений аргумента. Это то же самое, что uniqCombined, но использует 64-битный хэш для всех типов данных, а не только для строкового типа. |
| [meanZTest](/sql-reference/aggregate-functions/reference/meanztest) | Применяет Z-тест среднего к выборкам из двух популяций. |
| [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12) | Вычисляет приблизительное количество различных значений аргумента, используя алгоритм HyperLogLog. |
| [groupArrayArray](/sql-reference/aggregate-functions/reference/grouparrayarray) | Агрегирует массивы в больший массив этих массивов. |
| [groupUniqArray](/sql-reference/aggregate-functions/reference/groupuniqarray) | Создает массив из различных значений аргументов. |
| [groupBitAnd](/sql-reference/aggregate-functions/reference/groupbitand) | Применяет побитовое `AND` для наборов чисел. |
| [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) | Суммирует арифметическую разницу между последовательными строками. |
| [groupArraySorted](/sql-reference/aggregate-functions/reference/grouparraysorted) | Возвращает массив с первыми N элементами в порядке возрастания. |
| [quantileExact Functions](/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive функции |

