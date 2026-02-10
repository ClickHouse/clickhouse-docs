---
title: 'Акцессоры DataStore'
sidebar_label: 'Акцессоры'
slug: /chdb/datastore/accessors
description: 'Акцессоры для строк, DateTime, массивов, JSON, URL, IP и геоданных — более 185 методов'
keywords: ['chdb', 'datastore', 'accessor', 'str', 'dt', 'arr', 'json', 'url', 'ip', 'geo']
doc_type: 'reference'
---

# Аксессоры DataStore \{#datastore-accessors\}

DataStore предоставляет 7 пространств имен аксессоров с более чем 185 методами для доменно-специфических операций.

| Аксессор | Методы | Описание |
|----------|--------|----------|
| `.str` | 56 | Операции со строками |
| `.dt` | 42+ | Операции с DateTime |
| `.arr` | 37 | Операции с массивами (специфично для ClickHouse) |
| `.json` | 13 | Разбор JSON (специфично для ClickHouse) |
| `.url` | 15 | Разбор URL (специфично для ClickHouse) |
| `.ip` | 9 | Операции с IP-адресами (специфично для ClickHouse) |
| `.geo` | 14 | Операции с геоданными и расстояниями (специфично для ClickHouse) |

---

## Аксессор строк (`.str`) \{#str\}

Поддерживаются все 56 методов аксессора `.str` в pandas, а также строковые функции ClickHouse.

### Изменение регистра \{#str-case\}

| Method         | ClickHouse  | Description                          |
| -------------- | ----------- | ------------------------------------ |
| `upper()`      | `upper()`   | Преобразовать в верхний регистр      |
| `lower()`      | `lower()`   | Преобразовать в нижний регистр       |
| `capitalize()` | `initcap()` | Сделать заглавной первую букву       |
| `title()`      | `initcap()` | Преобразовать в формат Title Case    |
| `swapcase()`   | -           | Инвертировать регистр                |
| `casefold()`   | `lower()`   | Унифицировать регистр (case folding) |

```python
ds['name_upper'] = ds['name'].str.upper()
ds['name_title'] = ds['name'].str.title()
```


### Длина и размер \{#str-length\}

| Метод           | ClickHouse      | Описание                |
| --------------- | --------------- | ----------------------- |
| `len()`         | `length()`      | Длина строки в байтах   |
| `char_length()` | `char_length()` | Длина строки в символах |

```python
ds['name_len'] = ds['name'].str.len()
```


### Подстроки и срезы \{#str-substring\}

| Method               | ClickHouse    | Description          |
| -------------------- | ------------- | -------------------- |
| `slice(start, stop)` | `substring()` | Извлечение подстроки |
| `slice_replace()`    | -             | Замена среза         |
| `left(n)`            | `left()`      | Первые n символов    |
| `right(n)`           | `right()`     | Последние n символов |
| `get(i)`             | -             | Символ по индексу    |

```python
ds['first_3'] = ds['name'].str.slice(0, 3)
ds['last_4'] = ds['name'].str.right(4)
```


### Обрезка пробелов \{#str-trim\}

| Method     | ClickHouse    | Description                          |
| ---------- | ------------- | ------------------------------------ |
| `strip()`  | `trim()`      | Удаляет пробельные символы           |
| `lstrip()` | `trimLeft()`  | Удаляет начальные пробельные символы |
| `rstrip()` | `trimRight()` | Удаляет конечные пробельные символы  |

```python
ds['trimmed'] = ds['text'].str.strip()
```


### Поиск и сопоставление \{#str-search\}

| Method            | ClickHouse     | Description                               |
| ----------------- | -------------- | ----------------------------------------- |
| `contains(pat)`   | `position()`   | Содержит подстроку                        |
| `startswith(pat)` | `startsWith()` | Начинается с префикса                     |
| `endswith(pat)`   | `endsWith()`   | Заканчивается суффиксом                   |
| `find(sub)`       | `position()`   | Найти позицию                             |
| `rfind(sub)`      | -              | Найти справа                              |
| `index(sub)`      | `position()`   | Найти или выбросить исключение            |
| `rindex(sub)`     | -              | Найти справа или выбросить исключение     |
| `match(pat)`      | `match()`      | Совпадение с регулярным выражением        |
| `fullmatch(pat)`  | -              | Полное совпадение с регулярным выражением |
| `count(pat)`      | -              | Подсчёт вхождений                         |

```python
# Contains substring
ds['has_john'] = ds['name'].str.contains('John')

# Regex match
ds['valid_email'] = ds['email'].str.match(r'^[\w.-]+@[\w.-]+\.\w+$')
```


### Замена \{#str-replace\}

| Method                           | ClickHouse           | Description                       |
| -------------------------------- | -------------------- | --------------------------------- |
| `replace(pat, repl)`             | `replace()`          | Заменить все вхождения            |
| `replace(pat, repl, regex=True)` | `replaceRegexpAll()` | Заменить по регулярному выражению |
| `removeprefix(prefix)`           | -                    | Удалить префикс                   |
| `removesuffix(suffix)`           | -                    | Удалить суффикс                   |
| `translate(table)`               | -                    | Преобразовать символы             |

```python
ds['cleaned'] = ds['text'].str.replace('\n', ' ')
ds['digits_only'] = ds['phone'].str.replace(r'\D', '', regex=True)
```


### Разделение \{#str-split\}

| Method            | ClickHouse        | Description               |
| ----------------- | ----------------- | ------------------------- |
| `split(sep)`      | `splitByString()` | Разбить на массив         |
| `rsplit(sep)`     | -                 | Разбить справа            |
| `partition(sep)`  | -                 | Разбить на 3 части        |
| `rpartition(sep)` | -                 | Разбить справа на 3 части |

```python
ds['parts'] = ds['path'].str.split('/')
```


### Дополнение \{#str-padding\}

| Method          | ClickHouse          | Описание                     |
| --------------- | ------------------- | ---------------------------- |
| `pad(width)`    | `leftPad()`         | Дополнение слева             |
| `ljust(width)`  | `rightPad()`        | Выравнивание по правому краю |
| `rjust(width)`  | `leftPad()`         | Выравнивание по левому краю  |
| `center(width)` | -                   | Выравнивание по центру       |
| `zfill(width)`  | `leftPad(..., '0')` | Дополнение нулями            |

```python
ds['padded_id'] = ds['id'].astype(str).str.zfill(6)
```


### Тесты символов \{#str-tests\}

| Метод         | Описание                                    |
| ------------- | ------------------------------------------- |
| `isalpha()`   | Все буквенные символы                       |
| `isdigit()`   | Все цифры                                   |
| `isalnum()`   | Буквенно-цифровые символы                   |
| `isspace()`   | Все пробельные символы                      |
| `isupper()`   | Все символы в верхнем регистре              |
| `islower()`   | Все символы в нижнем регистре               |
| `istitle()`   | Каждое слово с заглавной буквы (Title Case) |
| `isnumeric()` | Числовые символы                            |
| `isdecimal()` | Десятичные цифры                            |

```python
ds['is_numeric'] = ds['code'].str.isdigit()
```


### Другое \{#str-other\}

| Method | Описание |
|--------|-------------|
| `repeat(n)` | Повторить n раз |
| `reverse()` | Развернуть строку |
| `wrap(width)` | Перенести текст по ширине |
| `encode(enc)` | Выполнить кодирование |
| `decode(enc)` | Выполнить декодирование |
| `normalize(form)` | Выполнить нормализацию Unicode |
| `extract(pat)` | Извлечь группы по регулярному выражению |
| `extractall(pat)` | Извлечь все совпадения |
| `cat(sep)` | Соединить все |
| `get_dummies(sep)` | Создать фиктивные переменные |

---

## Аксессор DateTime (`.dt`) \{#dt\}

Все 42+ метода pandas `.dt`, а также функции ClickHouse для работы с датой и временем.

### Компоненты даты \{#dt-components\}

| Property        | ClickHouse        | Description              |
| --------------- | ----------------- | ------------------------ |
| `year`          | `toYear()`        | Год                      |
| `month`         | `toMonth()`       | Месяц (1–12)             |
| `day`           | `toDayOfMonth()`  | День (1–31)              |
| `hour`          | `toHour()`        | Час (0–23)               |
| `minute`        | `toMinute()`      | Минута (0–59)            |
| `second`        | `toSecond()`      | Секунда (0–59)           |
| `millisecond`   | `toMillisecond()` | Миллисекунда             |
| `microsecond`   | `toMicrosecond()` | Микросекунда             |
| `quarter`       | `toQuarter()`     | Квартал (1–4)            |
| `dayofweek`     | `toDayOfWeek()`   | День недели (0=Пн)       |
| `dayofyear`     | `toDayOfYear()`   | День года                |
| `week`          | `toWeek()`        | Номер недели             |
| `days_in_month` | -                 | Количество дней в месяце |

```python
ds['year'] = ds['date'].dt.year
ds['month'] = ds['date'].dt.month
ds['day_of_week'] = ds['date'].dt.dayofweek
```


### Усечение \{#dt-truncation\}

| Method                  | ClickHouse           | Description     |
| ----------------------- | -------------------- | --------------- |
| `to_start_of_day()`     | `toStartOfDay()`     | Начало дня      |
| `to_start_of_week()`    | `toStartOfWeek()`    | Начало недели   |
| `to_start_of_month()`   | `toStartOfMonth()`   | Начало месяца   |
| `to_start_of_quarter()` | `toStartOfQuarter()` | Начало квартала |
| `to_start_of_year()`    | `toStartOfYear()`    | Начало года     |
| `to_start_of_hour()`    | `toStartOfHour()`    | Начало часа     |
| `to_start_of_minute()`  | `toStartOfMinute()`  | Начало минуты   |

```python
ds['month_start'] = ds['date'].dt.to_start_of_month()
```


### Арифметика \{#dt-arithmetic\}

| Method               | ClickHouse         | Description       |
| -------------------- | ------------------ | ----------------- |
| `add_years(n)`       | `addYears()`       | Добавляет годы    |
| `add_months(n)`      | `addMonths()`      | Добавляет месяцы  |
| `add_weeks(n)`       | `addWeeks()`       | Добавляет недели  |
| `add_days(n)`        | `addDays()`        | Добавляет дни     |
| `add_hours(n)`       | `addHours()`       | Добавляет часы    |
| `add_minutes(n)`     | `addMinutes()`     | Добавляет минуты  |
| `add_seconds(n)`     | `addSeconds()`     | Добавляет секунды |
| `subtract_years(n)`  | `subtractYears()`  | Вычитает годы     |
| `subtract_months(n)` | `subtractMonths()` | Вычитает месяцы   |
| `subtract_days(n)`   | `subtractDays()`   | Вычитает дни      |

```python
ds['next_month'] = ds['date'].dt.add_months(1)
ds['last_week'] = ds['date'].dt.subtract_weeks(1)
```


### Булевые проверки \{#dt-checks\}

| Method               | Description             |
| -------------------- | ----------------------- |
| `is_month_start()`   | Первый день месяца      |
| `is_month_end()`     | Последний день месяца   |
| `is_quarter_start()` | Первый день квартала    |
| `is_quarter_end()`   | Последний день квартала |
| `is_year_start()`    | Первый день года        |
| `is_year_end()`      | Последний день года     |
| `is_leap_year()`     | Високосный год          |

```python
ds['is_eom'] = ds['date'].dt.is_month_end()
```


### Форматирование \{#dt-formatting\}

| Method          | ClickHouse         | Description            |
| --------------- | ------------------ | ---------------------- |
| `strftime(fmt)` | `formatDateTime()` | Форматировать в строку |
| `day_name()`    | -                  | Название дня           |
| `month_name()`  | -                  | Название месяца        |

```python
ds['date_str'] = ds['date'].dt.strftime('%Y-%m-%d')
ds['day_name'] = ds['date'].dt.day_name()
```


### Часовой пояс \{#dt-timezone\}

| Метод             | ClickHouse     | Описание                      |
| ----------------- | -------------- | ----------------------------- |
| `tz_convert(tz)`  | `toTimezone()` | Преобразовать часовой пояс    |
| `tz_localize(tz)` | -              | Локализовать к часовому поясу |

```python
ds['utc_time'] = ds['timestamp'].dt.tz_convert('UTC')
```

***


## Аксессор массива (`.arr`) \{#arr\}

Операции с массивами, специфичные для ClickHouse (37 методов).

### Свойства \{#arr-properties\}

| Свойство    | ClickHouse   | Описание                    |
| ----------- | ------------ | --------------------------- |
| `length`    | `length()`   | Длина массива               |
| `size`      | `length()`   | Псевдоним для `length`      |
| `empty`     | `empty()`    | Является ли массив пустым   |
| `not_empty` | `notEmpty()` | Является ли массив непустым |

```python
ds['tag_count'] = ds['tags'].arr.length
ds['has_tags'] = ds['tags'].arr.not_empty
```


### Доступ к элементам \{#arr-access\}

| Метод                   | ClickHouse              | Описание          |
| ----------------------- | ----------------------- | ----------------- |
| `array_first()`         | `arrayElement(..., 1)`  | Первый элемент    |
| `array_last()`          | `arrayElement(..., -1)` | Последний элемент |
| `array_element(n)`      | `arrayElement()`        | N-й элемент       |
| `array_slice(off, len)` | `arraySlice()`          | Срез массива      |

```python
ds['first_tag'] = ds['tags'].arr.array_first()
ds['last_tag'] = ds['tags'].arr.array_last()
```


### Агрегации \{#arr-aggregations\}

| Method            | ClickHouse       | Description                     |
| ----------------- | ---------------- | ------------------------------- |
| `array_sum()`     | `arraySum()`     | Сумма элементов                 |
| `array_avg()`     | `arrayAvg()`     | Среднее значение                |
| `array_min()`     | `arrayMin()`     | Минимум                         |
| `array_max()`     | `arrayMax()`     | Максимум                        |
| `array_product()` | `arrayProduct()` | Произведение элементов          |
| `array_uniq()`    | `arrayUniq()`    | Количество уникальных элементов |

```python
ds['total'] = ds['values'].arr.array_sum()
ds['average'] = ds['values'].arr.array_avg()
```


### Преобразования \{#arr-transformations\}

| Method                 | ClickHouse           | Description                          |
| ---------------------- | -------------------- | ------------------------------------ |
| `array_sort()`         | `arraySort()`        | Сортировка по возрастанию            |
| `array_reverse_sort()` | `arrayReverseSort()` | Сортировка по убыванию               |
| `array_reverse()`      | `arrayReverse()`     | Обратный порядок                     |
| `array_distinct()`     | `arrayDistinct()`    | Уникальные элементы                  |
| `array_compact()`      | `arrayCompact()`     | Удаление последовательных дубликатов |
| `array_flatten()`      | `arrayFlatten()`     | Сплющивание вложенных массивов       |

```python
ds['sorted_tags'] = ds['tags'].arr.array_sort()
ds['unique_tags'] = ds['tags'].arr.array_distinct()
```


### Модификации \{#arr-modifications\}

| Метод | ClickHouse | Описание |
|--------|------------|-------------|
| `array_push_back(elem)` | `arrayPushBack()` | Добавить в конец |
| `array_push_front(elem)` | `arrayPushFront()` | Добавить в начало |
| `array_pop_back()` | `arrayPopBack()` | Удалить последний элемент |
| `array_pop_front()` | `arrayPopFront()` | Удалить первый элемент |
| `array_concat(other)` | `arrayConcat()` | Объединить |

### Поиск \{#arr-search\}

| Method              | ClickHouse     | Description                     |
| ------------------- | -------------- | ------------------------------- |
| `has(elem)`         | `has()`        | Содержит элемент                |
| `index_of(elem)`    | `indexOf()`    | Найти индекс                    |
| `count_equal(elem)` | `countEqual()` | Подсчитать количество вхождений |

```python
ds['has_python'] = ds['skills'].arr.has('Python')
```


### Операции со строками \{#arr-string\}

| Method                     | ClickHouse            | Description                          |
| -------------------------- | --------------------- | ------------------------------------ |
| `array_string_concat(sep)` | `arrayStringConcat()` | Объединяет элементы массива в строку |

```python
ds['tags_str'] = ds['tags'].arr.array_string_concat(', ')
```

***


## JSON-аксессор (`.json`) \{#json\}

Специфический для ClickHouse разбор JSON (13 методов).

| Метод              | ClickHouse            | Описание                         |
| ------------------ | --------------------- | -------------------------------- |
| `get_string(path)` | `JSONExtractString()` | Извлечь строку                   |
| `get_int(path)`    | `JSONExtractInt()`    | Извлечь целое число              |
| `get_float(path)`  | `JSONExtractFloat()`  | Извлечь число с плавающей точкой |
| `get_bool(path)`   | `JSONExtractBool()`   | Извлечь логическое значение      |
| `get_raw(path)`    | `JSONExtractRaw()`    | Извлечь «сырой» JSON             |
| `get_keys()`       | `JSONExtractKeys()`   | Получить ключи                   |
| `get_type(path)`   | `JSONType()`          | Получить тип                     |
| `get_length(path)` | `JSONLength()`        | Получить длину                   |
| `has_key(key)`     | `JSONHas()`           | Проверить наличие ключа          |
| `is_valid()`       | `isValidJSON()`       | Проверить корректность JSON      |
| `to_json_string()` | `toJSONString()`      | Преобразовать в JSON             |

```python
# Parse JSON columns
ds['user_name'] = ds['json_data'].json.get_string('user.name')
ds['user_age'] = ds['json_data'].json.get_int('user.age')
ds['is_active'] = ds['json_data'].json.get_bool('user.active')
ds['has_email'] = ds['json_data'].json.has_key('user.email')
```

***


## URL аксессор (`.url`) \{#url\}

Специфичный для ClickHouse разбор URL-адреса (15 методов).

| Method                        | ClickHouse               | Description                 |
| ----------------------------- | ------------------------ | --------------------------- |
| `domain()`                    | `domain()`               | Извлечь домен               |
| `domain_without_www()`        | `domainWithoutWWW()`     | Домен без www               |
| `top_level_domain()`          | `topLevelDomain()`       | Домен верхнего уровня (TLD) |
| `protocol()`                  | `protocol()`             | Протокол (http/https)       |
| `path()`                      | `path()`                 | Путь URL                    |
| `path_full()`                 | `pathFull()`             | Путь со строкой запроса     |
| `query_string()`              | `queryString()`          | Строка запроса              |
| `fragment()`                  | `fragment()`             | Фрагмент (#...)             |
| `port()`                      | `port()`                 | Номер порта                 |
| `extract_url_parameter(name)` | `extractURLParameter()`  | Получить параметр запроса   |
| `extract_url_parameters()`    | `extractURLParameters()` | Все параметры запроса       |
| `cut_url_parameter(name)`     | `cutURLParameter()`      | Удалить параметр запроса    |
| `decode_url_component()`      | `decodeURLComponent()`   | Декодировать URL-компонент  |
| `encode_url_component()`      | `encodeURLComponent()`   | Кодировать URL-компонент    |

```python
# Parse URLs
ds['domain'] = ds['url'].url.domain()
ds['path'] = ds['url'].url.path()
ds['utm_source'] = ds['url'].url.extract_url_parameter('utm_source')
```

***


## IP Accessor (`.ip`) \{#ip\}

Операции с IP-адресами, специфичные для ClickHouse (9 методов).

| Method                     | ClickHouse          | Description                |
| -------------------------- | ------------------- | -------------------------- |
| `to_ipv4()`                | `toIPv4()`          | Преобразование в IPv4      |
| `to_ipv6()`                | `toIPv6()`          | Преобразование в IPv6      |
| `ipv4_num_to_string()`     | `IPv4NumToString()` | Число в строку             |
| `ipv4_string_to_num()`     | `IPv4StringToNum()` | Строка в число             |
| `ipv6_num_to_string()`     | `IPv6NumToString()` | IPv6: число в строку       |
| `ipv4_to_ipv6()`           | `IPv4ToIPv6()`      | Преобразование в IPv6      |
| `is_ipv4_string()`         | `isIPv4String()`    | Проверка корректности IPv4 |
| `is_ipv6_string()`         | `isIPv6String()`    | Проверка корректности IPv6 |
| `ipv4_cidr_to_range(cidr)` | `IPv4CIDRToRange()` | CIDR в диапазон            |

```python
# IP operations
ds['is_valid_ip'] = ds['ip'].ip.is_ipv4_string()
ds['ip_num'] = ds['ip'].ip.ipv4_string_to_num()
```

***


## Гео-аксессор (`.geo`) \{#geo\}

Специфичные для ClickHouse операции с геоданными и расстояниями (14 методов).

### Функции расстояния \{#geo-distance\}

| Метод | ClickHouse | Описание |
|--------|------------|-------------|
| `great_circle_distance(...)` | `greatCircleDistance()` | Расстояние по дуге большого круга |
| `geo_distance(...)` | `geoDistance()` | Расстояние в системе WGS-84 |
| `l1_distance(v1, v2)` | `L1Distance()` | Манхэттенское расстояние |
| `l2_distance(v1, v2)` | `L2Distance()` | Евклидово расстояние |
| `l2_squared_distance(v1, v2)` | `L2SquaredDistance()` | Квадрат евклидова расстояния |
| `linf_distance(v1, v2)` | `LinfDistance()` | Расстояние Чебышёва |
| `cosine_distance(v1, v2)` | `cosineDistance()` | Косинусное расстояние |

### Операции с векторами \{#geo-vector\}

| Метод | ClickHouse | Описание |
|--------|------------|----------|
| `dot_product(v1, v2)` | `dotProduct()` | Скалярное произведение |
| `l2_norm(vec)` | `L2Norm()` | Норма вектора |
| `l2_normalize(vec)` | `L2Normalize()` | Нормализация |

### Функции H3 \{#geo-h3\}

| Method | ClickHouse | Description |
|--------|------------|-------------|
| `geo_to_h3(lon, lat, res)` | `geoToH3()` | Преобразование геокоординат в индекс H3 |
| `h3_to_geo(h3)` | `h3ToGeo()` | Преобразование H3 в геокоординаты |

### Операции с точками \{#geo-point\}

| Method                       | ClickHouse          | Description            |
| ---------------------------- | ------------------- | ---------------------- |
| `point_in_polygon(pt, poly)` | `pointInPolygon()`  | Точка в многоугольнике |
| `point_in_ellipses(...)`     | `pointInEllipses()` | Точка в эллипсах       |

```python
from chdb.datastore import F

# Calculate distances
ds['distance'] = F.great_circle_distance(
    ds['lon1'], ds['lat1'],
    ds['lon2'], ds['lat2']
)

# Vector similarity
ds['similarity'] = F.cosine_distance(ds['embedding1'], ds['embedding2'])
```

***


## Использование аксессоров \{#using-accessors\}

### Отложенное вычисление \{#lazy\}

Большинство аксессоров используют отложенное вычисление — они возвращают выражения, которые будут вычислены позже:

```python
# All these are lazy
ds['name_upper'] = ds['name'].str.upper()  # Not executed yet
ds['year'] = ds['date'].dt.year            # Not executed yet
ds['domain'] = ds['url'].url.domain()      # Not executed yet

# Execution happens when you access results
df = ds.to_df()  # Now everything executes
```


### Методы, которые выполняются немедленно \{#execute-immediately\}

Некоторые методы `.str` должны выполняться немедленно, так как они изменяют структуру:

| Метод | Возвращает | Почему |
|--------|---------|-----|
| `partition(sep)` | DataStore (3 столбца) | Создаёт несколько столбцов |
| `rpartition(sep)` | DataStore (3 столбца) | Создаёт несколько столбцов |
| `get_dummies(sep)` | DataStore (N столбцов) | Динамическое число столбцов |
| `extractall(pat)` | DataStore | Результат с MultiIndex |
| `cat(sep)` | str | Агрегация (N строк → 1) |

### Цепочка аксессоров \{#chaining\}

Методы аксессоров можно объединять в цепочки вызовов:

```python
ds['clean_name'] = (ds['name']
    .str.strip()
    .str.lower()
    .str.replace(' ', '_')
)

ds['next_month_start'] = (ds['date']
    .dt.add_months(1)
    .dt.to_start_of_month()
)
```
