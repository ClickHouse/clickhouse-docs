---
description: 'Документация по математическим функциям'
sidebar_label: 'Математические'
sidebar_position: 125
slug: /sql-reference/functions/math-functions
title: 'Математические функции'
---


# Математические функции

## e {#e}

Возвращает $e$ ([постоянная Эйлера](https://en.wikipedia.org/wiki/Euler%27s_constant)).

**Синтаксис**

```sql
e()
```

**Возвращаемое значение**

Тип: [Float64](../data-types/float.md).

## pi {#pi}

Возвращает $\pi$ ([Пи](https://en.wikipedia.org/wiki/Pi)).

**Синтаксис**

```sql
pi()
```
**Возвращаемое значение**

Тип: [Float64](../data-types/float.md).

## exp {#exp}

Возвращает $e^{x}$, где x — заданный аргумент функции.

**Синтаксис**

```sql
exp(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Пример**

Запрос:

```sql
SELECT round(exp(-1), 4);
```

Результат:

```response
┌─round(exp(-1), 4)─┐
│            0.3679 │
└───────────────────┘
```

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## log {#log}

Возвращает натуральный логарифм аргумента.

**Синтаксис**

```sql
log(x)
```

Псевдоним: `ln(x)`

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## exp2 {#exp2}

Возвращает 2 в степени заданного аргумента.

**Синтаксис**

```sql
exp2(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## intExp2 {#intexp2}

Как [`exp`](#exp), но возвращает UInt64.

**Синтаксис**

```sql
intExp2(x)
```

## log2 {#log2}

Возвращает двоичный логарифм аргумента.

**Синтаксис**

```sql
log2(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## exp10 {#exp10}

Возвращает 10 в степени заданного аргумента.

**Синтаксис**

```sql
exp10(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## intExp10 {#intexp10}

Как [`exp10`](#exp10), но возвращает UInt64.

**Синтаксис**

```sql
intExp10(x)
```

## log10 {#log10}

Возвращает десятичный логарифм аргумента.

**Синтаксис**

```sql
log10(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## sqrt {#sqrt}

Возвращает квадратный корень аргумента.

```sql
sqrt(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## cbrt {#cbrt}

Возвращает кубический корень аргумента.

```sql
cbrt(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## erf {#erf}

Если `x` неотрицателен, то $erf(\frac{x}{\sigma\sqrt{2}})$ — это вероятность того, что случайная величина с нормальным распределением со стандартным отклонением $\sigma$ принимает значение, отделенное от ожидаемого значения на более чем `x`.

**Синтаксис**

```sql
erf(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

**Пример**

(правило трех сигм)

```sql
SELECT erf(3 / sqrt(2));
```

```result
┌─erf(divide(3, sqrt(2)))─┐
│      0.9973002039367398 │
└─────────────────────────┘
```

## erfc {#erfc}

Возвращает число, близкое к $1-erf(x)$ без потери точности для больших значений `x`.

**Синтаксис**

```sql
erfc(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## lgamma {#lgamma}

Возвращает логарифм гамма-функции.

**Синтаксис**

```sql
lgamma(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## tgamma {#tgamma}

Возвращает гамма-функцию.

**Синтаксис**

```sql
gamma(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## sin {#sin}

Возвращает синус аргумента.

**Синтаксис**

```sql
sin(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT sin(1.23);
```

```response
0.9424888019316975
```

## cos {#cos}

Возвращает косинус аргумента.

**Синтаксис**

```sql
cos(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## tan {#tan}

Возвращает тангенс аргумента.

**Синтаксис**

```sql
tan(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## asin {#asin}

Возвращает арксинус аргумента.

**Синтаксис**

```sql
asin(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## acos {#acos}

Возвращает арккосинус аргумента.

**Синтаксис**

```sql
acos(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## atan {#atan}

Возвращает арктангенс аргумента.

**Синтаксис**

```sql
atan(x)
```

**Аргументы**

- `x` - [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

Тип: [Float*](../data-types/float.md).

## pow {#pow}

Возвращает $x^y$.

**Синтаксис**

```sql
pow(x, y)
```

Псевдоним: `power(x, y)`

**Аргументы**

- `x` - [(U)Int8/16/32/64](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md)
- `y` - [(U)Int8/16/32/64](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md)

**Возвращаемое значение**

Тип: [Float64](../data-types/float.md).

## cosh {#cosh}

Возвращает [гиперболический косинус](https://in.mathworks.com/help/matlab/ref/cosh.html) аргумента.

**Синтаксис**

```sql
cosh(x)
```

**Аргументы**

- `x` — Угол в радианах. Значения из интервала: $-\infty \lt x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Значения из интервала: $1 \le cosh(x) \lt +\infty$.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT cosh(0);
```

Результат:

```result
┌─cosh(0)──┐
│        1 │
└──────────┘
```

## acosh {#acosh}

Возвращает [обратный гиперболический косинус](https://www.mathworks.com/help/matlab/ref/acosh.html).

**Синтаксис**

```sql
acosh(x)
```

**Аргументы**

- `x` — Гиперболический косинус угла. Значения из интервала: $1 \le x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Угол в радианах. Значения из интервала: $0 \le acosh(x) \lt +\infty$.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT acosh(1);
```

Результат:

```result
┌─acosh(1)─┐
│        0 │
└──────────┘
```

## sinh {#sinh}

Возвращает [гиперболический синус](https://www.mathworks.com/help/matlab/ref/sinh.html).

**Синтаксис**

```sql
sinh(x)
```

**Аргументы**

- `x` — Угол в радианах. Значения из интервала: $-\infty \lt x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Значения из интервала: $-\infty \lt sinh(x) \lt +\infty$.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT sinh(0);
```

Результат:

```result
┌─sinh(0)──┐
│        0 │
└──────────┘
```

## asinh {#asinh}

Возвращает [обратный гиперболический синус](https://www.mathworks.com/help/matlab/ref/asinh.html).

**Синтаксис**

```sql
asinh(x)
```

**Аргументы**

- `x` — Гиперболический синус угла. Значения из интервала: $-\infty \lt x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Угол в радианах. Значения из интервала: $-\infty \lt asinh(x) \lt +\infty$.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT asinh(0);
```

Результат:

```result
┌─asinh(0)─┐
│        0 │
└──────────┘
```

## tanh {#tanh}

Возвращает [гиперболический тангенс](https://www.mathworks.com/help/matlab/ref/tanh.html).

**Синтаксис**

```sql
tanh(x)
```

**Аргументы**

- `x` — Угол в радианах. Значения из интервала: $-\infty \lt x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Значения из интервала: $-1 \lt tanh(x) \lt 1$.

Тип: [Float*](/sql-reference/data-types/float).

**Пример**

```sql
SELECT tanh(0);
```

Результат:

```result
0
```

## atanh {#atanh}

Возвращает [обратный гиперболический тангенс](https://www.mathworks.com/help/matlab/ref/atanh.html).

**Синтаксис**

```sql
atanh(x)
```

**Аргументы**

- `x` — Гиперболический тангенс угла. Значения из интервала: $-1 \lt x \lt 1$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Угол в радианах. Значения из интервала: $-\infty \lt atanh(x) \lt +\infty$.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT atanh(0);
```

Результат:

```result
┌─atanh(0)─┐
│        0 │
└──────────┘
```

## atan2 {#atan2}

Возвращает [atan2](https://en.wikipedia.org/wiki/Atan2) как угол в евклидовой плоскости, заданный в радианах, между положительной осью x и лучом к точке `(x, y) ≠ (0, 0)`.

**Синтаксис**

```sql
atan2(y, x)
```

**Аргументы**

- `y` — y-координата точки, через которую проходит луч. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).
- `x` — x-координата точки, через которую проходит луч. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Угол `θ`, такой что $-\pi \lt 0 \le \pi$, в радианах.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT atan2(1, 1);
```

Результат:

```result
┌────────atan2(1, 1)─┐
│ 0.7853981633974483 │
└────────────────────┘
```

## hypot {#hypot}

Возвращает длину гипотенузы прямоугольного треугольника. [Hypot](https://en.wikipedia.org/wiki/Hypot) предотвращает проблемы, возникающие при возведении очень больших или очень маленьких чисел в квадрат.

**Синтаксис**

```sql
hypot(x, y)
```

**Аргументы**

- `x` — Первый катет прямоугольного треугольника. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).
- `y` — Второй катет прямоугольного треугольника. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Длина гипотенузы прямоугольного треугольника.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT hypot(1, 1);
```

Результат:

```result
┌────────hypot(1, 1)─┐
│ 1.4142135623730951 │
└────────────────────┘
```

## log1p {#log1p}

Вычисляет `log(1+x)`. [Вычисление](https://en.wikipedia.org/wiki/Natural_logarithm#lnp1) `log1p(x)` более точно, чем `log(1+x)` для малых значений x.

**Синтаксис**

```sql
log1p(x)
```

**Аргументы**

- `x` — Значения из интервала: $-1 \lt x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Значения из интервала: $-\infty < log1p(x) \lt +\infty$.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT log1p(0);
```

Результат:

```result
┌─log1p(0)─┐
│        0 │
└──────────┘
```

## sign {#sign}

Возвращает знак действительного числа.

**Синтаксис**

```sql
sign(x)
```

**Аргументы**

- `x` — Значения из $-\infty$ до $+\infty$. Поддерживает все числовые типы в ClickHouse.

**Возвращаемое значение**

- -1 для `x < 0`
- 0 для `x = 0`
- 1 для `x > 0`

**Примеры**

Знак для нулевого значения:

```sql
SELECT sign(0);
```

Результат:

```result
┌─sign(0)─┐
│       0 │
└─────────┘
```

Знак для положительного значения:

```sql
SELECT sign(1);
```

Результат:

```result
┌─sign(1)─┐
│       1 │
└─────────┘
```

Знак для отрицательного значения:

```sql
SELECT sign(-1);
```

Результат:

```result
┌─sign(-1)─┐
│       -1 │
└──────────┘
```

## sigmoid {#sigmoid}

Возвращает [сигмоидальную функцию](https://en.wikipedia.org/wiki/Sigmoid_function).

**Синтаксис**

```sql
sigmoid(x)
```

**Параметры**

- `x` — входное значение. Значения из интервала: $-\infty \lt x \lt +\infty$. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Соответствующее значение вдоль сигмоидальной кривой от 0 до 1. [Float64](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT round(sigmoid(x), 5) FROM (SELECT arrayJoin([-1, 0, 1]) AS x);
```

Результат:

```result
0.26894
0.5
0.73106
```

## degrees {#degrees}

Преобразует радианы в градусы.

**Синтаксис**

```sql
degrees(x)
```

**Аргументы**

- `x` — Входное значение в радианах. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).
- `x` — Входное значение в радианах. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).  

**Возвращаемое значение**

- Значение в градусах. [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT degrees(3.141592653589793);
```

Результат:

```result
┌─degrees(3.141592653589793)─┐
│                        180 │
└────────────────────────────┘
```

## radians {#radians}

Преобразует градусы в радианы.

**Синтаксис**

```sql
radians(x)
```

**Аргументы**

- `x` — Входное значение в градусах. [(U)Int*](../data-types/int-uint.md), [Float*](../data-types/float.md) или [Decimal*](../data-types/decimal.md).

**Возвращаемое значение**

- Значение в радианах.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

```sql
SELECT radians(180);
```

Результат:

```result
┌──────radians(180)─┐
│ 3.141592653589793 │
└───────────────────┘
```

## factorial {#factorial}

Вычисляет факториал целого числа. Работает с любым нативным целочисленным типом, включая UInt(8|16|32|64) и Int(8|16|32|64). Возвращаемый тип — UInt64.

Факториал 0 равен 1. Также функция factorial() возвращает 1 для любого отрицательного значения. Максимальное положительное значение для входного аргумента равно 20, значение 21 или больше приведет к возникновению исключения.


**Синтаксис**

```sql
factorial(n)
```

**Пример**

```sql
SELECT factorial(10);
```

Результат:

```result
┌─factorial(10)─┐
│       3628800 │
└───────────────┘
```

## width_bucket {#width_bucket}

Возвращает номер ведра, в которое попадает `operand` в гистограмме с `count` равными по ширине ведрами, охватывающими диапазон от `low` до `high`. Возвращает `0`, если `operand < low`, и возвращает `count+1`, если `operand >= high`.

`operand`, `low`, `high` могут быть любым нативным числовым типом. `count` может быть только беззнаковым целым числом, и его значение не может быть равно нулю.

**Синтаксис**

```sql
widthBucket(operand, low, high, count)
```
Псевдоним: `WIDTH_BUCKET`

**Пример**

```sql
SELECT widthBucket(10.15, -8.6, 23, 18);
```

Результат:

```result
┌─widthBucket(10.15, -8.6, 23, 18)─┐
│                               11 │
└──────────────────────────────────┘
```

## proportionsZTest {#proportionsztest}

Возвращает статистику теста для двух пропорционального Z-теста — статистического теста для сравнения пропорций двух популяций `x` и `y`.

**Синтаксис**

```sql
proportionsZTest(successes_x, successes_y, trials_x, trials_y, conf_level, pool_type)
```

**Аргументы**

- `successes_x`: Количество успехов в популяции `x`. [UInt64](../data-types/int-uint.md).
- `successes_y`: Количество успехов в популяции `y`. [UInt64](../data-types/int-uint.md).
- `trials_x`: Количество испытаний в популяции `x`. [UInt64](../data-types/int-uint.md).
- `trials_y`: Количество испытаний в популяции `y`. [UInt64](../data-types/int-uint.md).
- `conf_level`: Уровень доверия для теста. [Float64](../data-types/float.md).
- `pool_type`: Выбор пула (метод, которым оценивается стандартная ошибка). Может быть либо `unpooled`, либо `pooled`. [String](../data-types/string.md). 

:::note
Для аргумента `pool_type`: В объединенной версии две пропорции усредняются, и для оценки стандартной ошибки используется только одна пропорция. В раздельной версии две пропорции используются отдельно.
:::

**Возвращаемое значение**

- `z_stat`: Z-статистика. [Float64](../data-types/float.md).
- `p_val`: P-значение. [Float64](../data-types/float.md).
- `ci_low`: Нижняя граница доверительного интервала. [Float64](../data-types/float.md).
- `ci_high`: Верхняя граница доверительного интервала. [Float64](../data-types/float.md).

**Пример**

Запрос:

```sql
SELECT proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled');
```

Результат:

```response
┌─proportionsZTest(10, 11, 100, 101, 0.95, 'unpooled')───────────────────────────────┐
│ (-0.20656724435948853,0.8363478437079654,-0.09345975390115283,0.07563797172293502) │
└────────────────────────────────────────────────────────────────────────────────────┘
```
