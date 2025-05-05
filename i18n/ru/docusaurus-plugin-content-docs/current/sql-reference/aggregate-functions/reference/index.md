---
description: 'Лендинг для агрегатных функций с полным списком агрегатных функций'
sidebar_position: 36
slug: /sql-reference/aggregate-functions/reference/
title: 'Агрегатные функции'
toc_folder_title: 'Справочные данные'
toc_hidden: true
---


# Агрегатные функции

ClickHouse поддерживает все стандартные SQL агрегатные функции ([sum](../reference/sum.md), [avg](../reference/avg.md), [min](../reference/min.md), [max](../reference/max.md), [count](../reference/count.md)), а также широкий спектр других агрегатных функций.

<!-- Таблица содержания этой страницы автоматически генерируется с 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
из полей YAML front matter: slug, description, title.

Если вы нашли ошибку, пожалуйста, отредактируйте YML frontmatter соответствующих страниц.
-->| Страница | Описание |
|-----|-----|
| [intervalLengthSum](/sql-reference/aggregate-functions/reference/intervalLengthSum) | Вычисляет общую длину объединения всех диапазонов (сегментов на числовой оси). |
| [median](/sql-reference/aggregate-functions/reference/median) | Функции `median*` являются псевдонимами для соответствующих функций `quantile*`. Они вычисляют медиану числовой выборки. |
| [welchTTest](/sql-reference/aggregate-functions/reference/welchttest) | Применяет t-тест Уэлча к выборкам из двух популяций. |
| [groupArrayMovingSum](/sql-reference/aggregate-functions/reference/grouparraymovingsum) | Вычисляет скользящую сумму входных значений. |
| [groupBitmapAnd](/sql-reference/aggregate-functions/reference/groupbitmapand) | Вычисляет AND по битовой колонке, возвращает кардинальность типа UInt64, если добавить суффикс -State, то возвращает объект битовой карты. |
| [topKWeighted](/sql-reference/aggregate-functions/reference/topkweighted) | Возвращает массив примерно наиболее частых значений в указанной колонке. Полученный массив отсортирован по убыванию приблизительной частоты значений (не по самим значениям). Кроме того, учитывается вес значения. |
| [distinctJSONPaths](/sql-reference/aggregate-functions/reference/distinctjsonpaths) | Вычисляет список различных путей, хранящихся в колонке JSON. |
| [kolmogorovSmirnovTest](/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest) | Применяет тест Колмогорова-Смирнова к выборкам из двух популяций. |
| [quantileExactWeightedInterpolated](/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated) | Вычисляет квантиль числовой последовательности с использованием линейной интерполяции, принимая во внимание вес каждого элемента. |
| [largestTriangleThreeBuckets](/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets) | Применяет алгоритм Largest-Triangle-Three-Buckets к входным данным. |
| [approx_top_sum](/sql-reference/aggregate-functions/reference/approxtopsum) | Возвращает массив примерно наиболее частых значений и их счетчиков в указанной колонке. |
| [covarSamp](/sql-reference/aggregate-functions/reference/covarsamp) | Вычисляет значение `Σ((x - x̅)(y - y̅)) / (n - 1)` |
| [groupBitmapOr](/sql-reference/aggregate-functions/reference/groupbitmapor) | Вычисляет OR по битовой колонке, возвращает кардинальность типа UInt64, если добавить суффикс -State, то возвращает объект битовой карты. Это эквивалентно `groupBitmapMerge`. |
| [varSamp](/sql-reference/aggregate-functions/reference/varSamp) | Вычисляет смещенную выборочную дисперсию набора данных. |
| [cramersVBiasCorrected](/sql-reference/aggregate-functions/reference/cramersvbiascorrected) | Вычисляет V Крамера, но использует коррекцию смещения. |
| [quantiles Functions](/sql-reference/aggregate-functions/reference/quantiles) | quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK |
| [anyLast](/sql-reference/aggregate-functions/reference/anylast) | Выбирает последнее встреченное значение в колонке. |
| [corrStable](/sql-reference/aggregate-functions/reference/corrstable) | Вычисляет коэффициент корреляции Пирсона, но использует численно стабильный алгоритм. |
| [stddevPopStable](/sql-reference/aggregate-functions/reference/stddevpopstable) | Результат равен квадратному корню из varPop. В отличие от stddevPop, эта функция использует численно стабильный алгоритм. |
| [maxIntersections](/sql-reference/aggregate-functions/reference/maxintersections) | Агрегатная функция, которая вычисляет максимальное количество раз, когда группа интервалов пересекается (если все интервалы пересекаются хотя бы раз). |
| [flameGraph](/sql-reference/aggregate-functions/reference/flame_graph) | Агрегатная функция, которая строит планировку с использованием списка трассировок стека. |
| [min](/sql-reference/aggregate-functions/reference/min) | Агрегатная функция, которая вычисляет минимум из группы значений. |
| [sumMapWithOverflow](/sql-reference/aggregate-functions/reference/summapwithoverflow) | Суммирует массив `value` по ключам, указанным в массиве `key`. Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, суммированные для соответствующих ключей. Отличается от функции sumMap тем, что выполняет суммирование с переполнением. |
| [uniq](/sql-reference/aggregate-functions/reference/uniq) | Вычисляет приблизительное количество различных значений аргумента. |
| [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest) | Вычисляет приблизительный квантиль числовой последовательности с использованием алгоритма t-digest. |
| [groupArrayMovingAvg](/sql-reference/aggregate-functions/reference/grouparraymovingavg) | Вычисляет скользящее среднее входных значений. |
| [rankCorr](/sql-reference/aggregate-functions/reference/rankCorr) | Вычисляет коэффициент ранговой корреляции. |
| [covarSampStable](/sql-reference/aggregate-functions/reference/covarsampstable) | Похожа на covarSamp, но работает медленнее при меньшей вычислительной ошибке. |
| [avgWeighted](/sql-reference/aggregate-functions/reference/avgweighted) | Вычисляет взвешенное арифметическое среднее. |
| [skewSamp](/sql-reference/aggregate-functions/reference/skewsamp) | Вычисляет выборочную асимметрию последовательности. |
| [groupArrayInsertAt](/sql-reference/aggregate-functions/reference/grouparrayinsertat) | Вставляет значение в массив в указанной позиции. |
| [array_concat_agg](/sql-reference/aggregate-functions/reference/array_concat_agg) | Документация для функции array_concat_agg |
| [entropy](/sql-reference/aggregate-functions/reference/entropy) | Вычисляет энтропию Шеннона для колонки значений. |
| [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch) | Вычисляет приблизительное количество различных значений аргументов с использованием Theta Sketch Framework. |
| [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic) | Вычисляет приблизительный квантиль числовой последовательности. |
| [simpleLinearRegression](/sql-reference/aggregate-functions/reference/simplelinearregression) | Выполняет простую (одномерную) линейную регрессию. |
| [covarPop](/sql-reference/aggregate-functions/reference/covarpop) | Вычисляет ковариацию популяции. |
| [groupBitmapXor](/sql-reference/aggregate-functions/reference/groupbitmapxor) | Вычисляет XOR по битовой колонке и возвращает кардинальность типа UInt64, если используется с суффиксом -State, тогда возвращает объект битовой карты. |
| [maxMap](/sql-reference/aggregate-functions/reference/maxmap) | Вычисляет максимум из массива `value` по ключам, указанным в массиве `key`. |
| [varPopStable](/sql-reference/aggregate-functions/reference/varpopstable) | Возвращает дисперсию популяции. В отличие от varPop, эта функция использует численно стабильный алгоритм. Она работает медленнее, но обеспечивает меньшую вычислительную ошибку. |
| [avg](/sql-reference/aggregate-functions/reference/avg) | Вычисляет арифметическое среднее. |
| [kurtPop](/sql-reference/aggregate-functions/reference/kurtpop) | Вычисляет эксцесс последовательности. |
| [aggThrow](/sql-reference/aggregate-functions/reference/aggthrow) | Эта функция может быть использована для тестирования устойчивости к исключениям. Она выбрасывает исключение при создании с заданной вероятностью. |
| [argMin](/sql-reference/aggregate-functions/reference/argmin) | Вычисляет значение `arg` для минимального значения `val`. Если имеется несколько строк с равным `val`, значение `arg`, которое возвращается, не является детерминированным. |
| [first_value](/sql-reference/aggregate-functions/reference/first_value) | Это псевдоним для any, но он был введен для совместимости с Оконными Функциями, где иногда необходимо обрабатывать значения `NULL` (по умолчанию все агрегатные функции ClickHouse игнорируют значения NULL). |
| [sumKahan](/sql-reference/aggregate-functions/reference/sumkahan) | Вычисляет сумму чисел с помощью алгоритма Кахана для компенсированного суммирования. |
| [count](/sql-reference/aggregate-functions/reference/count) | Считывает количество строк или нестекущих значений NULL. |
| [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) | Добавляет разность между последовательными строками. Если разность отрицательна, она игнорируется. |
| [studentTTest](/sql-reference/aggregate-functions/reference/studentttest) | Применяет t-тест Стьюдента к выборкам из двух популяций. |
| [sumWithOverflow](/sql-reference/aggregate-functions/reference/sumwithoverflow) | Вычисляет сумму чисел, используя тот же тип данных для результата, что и для входных параметров. Если сумма превышает максимальное значение для этого типа данных, она вычисляется с переполнением. |
| [sum](/sql-reference/aggregate-functions/reference/sum) | Вычисляет сумму. Работает только для чисел. |
| [boundingRatio](/sql-reference/aggregate-functions/reference/boundingRatio) | Агрегатная функция, вычисляющая наклон между самыми левыми и правыми точками в группе значений. |
| [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) | Вычисляет точное количество различных значений аргументов. |
| [exponentialTimeDecayedCount](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedCount) | Возвращает кумулятивное экспоненциальное затухание во временном ряде на индексе `t` во времени. |
| [sumCount](/sql-reference/aggregate-functions/reference/sumcount) | Вычисляет сумму чисел и одновременно считает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе есть несколько функций `sum`, `count` или `avg`, их можно заменить на одну функцию `sumCount`, чтобы повторно использовать вычисления. Эта функция редко требуется использовать явно. |
| [varSampStable](/sql-reference/aggregate-functions/reference/varsampstable) | Вычисляет выборочную дисперсию набора данных. В отличие от `varSamp`, эта функция использует численно стабильный алгоритм. Она работает медленнее, но обеспечивает меньшую вычислительную ошибку. |
| [topK](/sql-reference/aggregate-functions/reference/topk) | Возвращает массив примерно наиболее частых значений в указанной колонке. Полученный массив отсортирован по убыванию приблизительной частоты значений (не по самим значениям). |
| [maxIntersectionsPosition](/sql-reference/aggregate-functions/reference/maxintersectionsposition) | Агрегатная функция, которая вычисляет позиции вхождений функции maxIntersections. |
| [stddevSampStable](/sql-reference/aggregate-functions/reference/stddevsampstable) | Результат равен квадратному корню из varSamp. В отличие от этой функции используется численно стабильный алгоритм. |
| [varPop](/en/sql-reference/aggregate-functions/reference/varPop) | Вычисляет дисперсию популяции. |
| [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted) | Точно вычисляет квантиль числовой последовательности, принимая во внимание вес каждого элемента. |
| [covarPopMatrix](/sql-reference/aggregate-functions/reference/covarpopmatrix) | Возвращает матрицу ковариации популяции по N переменным. |
| [sparkbar](/sql-reference/aggregate-functions/reference/sparkbar) | Функция строит частотный гистограмм значений `x` и уровень повторения `y` этих значений в интервале `[min_x, max_x]`. |
| [contingency](/sql-reference/aggregate-functions/reference/contingency) | Функция `contingency` вычисляет коэффициент контингенции, значение, которое измеряет связь между двумя колонками в таблице. Вычисление схоже с функцией `cramersV`, но с другим знаменателем под извлечением квадратного корня. |
| [stochasticLinearRegression](/sql-reference/aggregate-functions/reference/stochasticlinearregression) | Эта функция реализует стохастическую линейную регрессию. Она поддерживает пользовательские параметры для скорости обучения, коэффициента L2-регуляризации, размера мини-выборки и имеет несколько методов для обновления весов (Adam, простой SGD, Momentum, Nesterov). |
| [analysisOfVariance](/sql-reference/aggregate-functions/reference/analysis_of_variance) | Обеспечивает статистический тест для однофакторного анализа дисперсии (тест ANOVA). Это тест над несколькими группами нормально распределенных наблюдений, чтобы выяснить, имеют ли все группы одинаковое среднее значение или нет. |
| [groupConcat](/sql-reference/aggregate-functions/reference/groupconcat) | Вычисляет конкатенированную строку из группы строк, опционально разделенную разделителем и опционально ограниченную максимальным количеством элементов. |
| [exponentialTimeDecayedMax](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedMax) | Возвращает максимум вычисленного экспоненциально сглаженного скользящего среднего на индексе `t` во времени с тем, что на `t-1`.  |
| [any](/sql-reference/aggregate-functions/reference/any) | Выбирает первое встреченное значение в колонке. |
| [covarSampMatrix](/sql-reference/aggregate-functions/reference/covarsampmatrix) | Возвращает матрицу выборочной ковариации по N переменным. |
| [groupArrayLast](/sql-reference/aggregate-functions/reference/grouparraylast) | Создает массив последних значений аргументов. |
| [singleValueOrNull](/sql-reference/aggregate-functions/reference/singlevalueornull) | Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли только одно уникальное ненулевое значение в данных. |
| [theilsU](/sql-reference/aggregate-functions/reference/theilsu) | Функция `theilsU` вычисляет коэффициент неопределенности Тейла, значение, которое измеряет связь между двумя колонками в таблице. |
| [cramersV](/sql-reference/aggregate-functions/reference/cramersv) | Результат функции `cramersV` варьируется от 0 (соответствующего отсутствию связи между переменными) до 1 и может достигать 1 только тогда, когда каждое значение полностью определяется другим. Его можно рассматривать как ассоциацию между двумя переменными в процентах от их максимальной возможной вариации. |
| [last_value](/sql-reference/aggregate-functions/reference/last_value) | Выбирает последнее встреченное значение, аналогично `anyLast`, но может принимать NULL. |
| [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming) | С установленной точностью вычисляет квантиль числовой последовательности. |
| [groupBitmap](/sql-reference/aggregate-functions/reference/groupbitmap) | Вычисления битов или агрегатные вычисления из колонки беззнакового целого числа, возвращает кардинальность типа UInt64, если добавить суффикс -State, тогда возвращает объект битовой карты. |
| [minMap](/sql-reference/aggregate-functions/reference/minmap) | Вычисляет минимум из массива `value` по ключам, указанным в массиве `key`. |
| [exponentialTimeDecayedAvg](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedAvg) | Возвращает экспоненциально сглаженное взвешенное скользящее среднее значений временного ряда в точке `t` во времени. |
| [skewPop](/sql-reference/aggregate-functions/reference/skewpop) | Вычисляет асимметрию последовательности. |
| [mannWhitneyUTest](/sql-reference/aggregate-functions/reference/mannwhitneyutest) | Применяет тест рангов Манна-Уитни к выборкам из двух популяций. |
| [quantileGK](/sql-reference/aggregate-functions/reference/quantileGK) | Вычисляет квантиль числовой последовательности с использованием алгоритма Гринвальда-Ханны. |
| [groupArrayIntersect](/sql-reference/aggregate-functions/reference/grouparrayintersect) | Возвращает пересечение заданных массивов (возвращает все элементы массивов, которые есть во всех заданных массивах). |
| [estimateCompressionRatio](/sql-reference/aggregate-functions/reference/estimateCompressionRatio) | Оценивает коэффициент сжатия заданной колонки без сжатия. |
| [groupArraySample](/sql-reference/aggregate-functions/reference/grouparraysample) | Создает массив выборочных значений аргументов. Размер полученного массива ограничен до `max_size` элементов. Значения аргументов выбираются и добавляются в массив случайным образом. |
| [stddevSamp](/sql-reference/aggregate-functions/reference/stddevsamp) | Результат равен квадратному корню из varSamp. |
| [quantile](/sql-reference/aggregate-functions/reference/quantile) | Вычисляет приблизительный квантиль числовой последовательности. |
| [groupArray](/sql-reference/aggregate-functions/reference/grouparray) | Создает массив значений аргументов. Значения могут быть добавлены в массив в любом (неопределенном) порядке. |
| [exponentialTimeDecayedSum](/sql-reference/aggregate-functions/reference/exponentialTimeDecayedSum) | Возвращает сумму экспоненциально сглаженных скользящих средних значений временного ряда на индексе `t` во времени. |
| [categoricalInformationValue](/sql-reference/aggregate-functions/reference/categoricalinformationvalue) | Вычисляет значение `(P(tag = 1) - P(tag = 0))(log(P(tag = 1)) - log(P(tag = 0)))` для каждой категории. |
| [corr](/sql-reference/aggregate-functions/reference/corr) | Вычисляет коэффициент корреляции Пирсона. |
| [approx_top_k](/sql-reference/aggregate-functions/reference/approxtopk) | Возвращает массив примерно наиболее частых значений и их счетов в указанной колонке. |
| [corrMatrix](/sql-reference/aggregate-functions/reference/corrmatrix) | Вычисляет матрицу корреляции по N переменным. |
| [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch) | Вычисляет приблизительный квантиль выборки с гарантией относительной ошибки. |
| [anyHeavy](/sql-reference/aggregate-functions/reference/anyheavy) | Выбирает часто встречающееся значение с использованием алгоритма тяжеловесных элементов. Если есть значение, которое встречается более чем в половине случаев в каждом из потоков выполнения запроса, это значение возвращается. Обычно результат является недетерминированным. |
| [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16) | Вычисляет приблизительный квантиль выборки, состоящей из чисел bfloat16. |
| [max](/sql-reference/aggregate-functions/reference/max) | Агрегатная функция, которая вычисляет максимум из группы значений. |
| [groupBitXor](/sql-reference/aggregate-functions/reference/groupbitxor) | Применяет побитовый `XOR` для последовательности чисел. |
| [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted) | С установленной точностью вычисляет квантиль числовой последовательности в соответствии с весом каждого члена последовательности. |
| [quantileInterpolatedWeighted](/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted) | Вычисляет квантиль числовой последовательности с использованием линейной интерполяции, принимая во внимание вес каждого элемента. |
| [stddevPop](/sql-reference/aggregate-functions/reference/stddevpop) | Результат равен квадратному корню из varPop. |
| [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) | Вычисляет приблизительное количество различных значений аргументов. |
| [covarPopStable](/sql-reference/aggregate-functions/reference/covarpopstable) | Вычисляет значение популяционной ковариации. |
| [argMax](/sql-reference/aggregate-functions/reference/argmax) | Вычисляет значение `arg` для максимального значения `val`. |
| [groupBitOr](/sql-reference/aggregate-functions/reference/groupbitor) | Применяет побитовый `OR` для последовательности чисел. |
| [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted) | Вычисляет приблизительный квантиль числовой последовательности с использованием алгоритма t-digest. |
| [distinctDynamicTypes](/sql-reference/aggregate-functions/reference/distinctdynamictypes) | Вычисляет список различных типов данных, хранящихся в динамической колонке. |
| [sumMap](/sql-reference/aggregate-functions/reference/summap) | Суммирует массив `value` по ключам, указанным в массиве `key`. Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, суммированные для соответствующих ключей без переполнения. |
| [kurtSamp](/sql-reference/aggregate-functions/reference/kurtsamp) | Вычисляет выборочный эксцесс последовательности. |
| [stochasticLogisticRegression](/sql-reference/aggregate-functions/reference/stochasticlogisticregression) | Эта функция реализует стохастическую логистическую регрессию. Она может быть использована для задачи бинарной классификации, поддерживает те же пользовательские параметры, что и stochasticLinearRegression и работает аналогично. |
| [exponentialMovingAverage](/sql-reference/aggregate-functions/reference/exponentialMovingAverage) | Вычисляет экспоненциальное скользящее среднее значений за определенное время. |
| [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) | Вычисляет приблизительное количество различных значений аргументов. Это то же самое, что uniqCombined, но использует 64-битный хэш для всех типов данных, а не только для строкового типа данных. |
| [meanZTest](/sql-reference/aggregate-functions/reference/meanztest) | Применяет Z-тест для средних значений к выборкам из двух популяций. |
| [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12) | Вычисляет приблизительное количество различных значений аргументов, используя алгоритм HyperLogLog. |
| [groupArrayArray](/sql-reference/aggregate-functions/reference/grouparrayarray) | Агрегирует массивы в более крупный массив этих массивов. |
| [groupUniqArray](/sql-reference/aggregate-functions/reference/groupuniqarray) | Создает массив из различных значений аргументов. |
| [groupBitAnd](/sql-reference/aggregate-functions/reference/groupbitand) | Применяет побитовый `AND` для последовательности чисел. |
| [deltaSum](/sql-reference/aggregate-functions/reference/deltasum) | Суммирует арифметическую разность между последовательными строками. |
| [groupArraySorted](/sql-reference/aggregate-functions/reference/grouparraysorted) | Возвращает массив с первыми N элементами в порядке возрастания. |
| [quantileExact Functions](/sql-reference/aggregate-functions/reference/quantileexact) | quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive, quantileExactInclusive функции |
