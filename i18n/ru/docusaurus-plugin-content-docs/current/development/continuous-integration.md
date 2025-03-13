---
slug: /development/continuous-integration
sidebar_position: 55
sidebar_label: Непрерывная интеграция (CI)
---


# Непрерывная интеграция (CI)

Когда вы отправляете pull request, для вашего кода запускаются некоторые автоматизированные проверки в системе ClickHouse [непрерывной интеграции (CI)](tests.md#test-automation).
Это происходит после того, как куратор репозитория (кто-то из команды ClickHouse) проверит ваш код и добавит тег `can be tested` к вашему pull request.
Результаты проверок отображаются на странице pull request в GitHub, как описано в [документации GitHub по проверкам](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks).
Если проверка не была выполнена, вам может понадобиться её исправить.
Эта страница предоставляет обзор проверок, с которыми вы можете столкнуться, и действий, которые вы можете предпринять, чтобы их исправить.

Если кажется, что сбой проверки не связан с вашими изменениями, это может быть временная ошибка или проблема с инфраструктурой.
Отправьте пустой коммит в pull request, чтобы перезапустить проверки CI:

```shell
git reset
git commit --allow-empty
git push
```

Если вы не уверены, что делать, попросите помощи у куратора.

## Слияние с Master {#merge-with-master}

Проверяет, может ли PR быть слит с master.
Если нет, он завершится с сообщением `Cannot fetch mergecommit`.
Чтобы исправить эту проверку, разрешите конфликт, как описано в [документации GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github), или объедините ветку `master` с вашей веткой pull request с использованием git.

## Проверка документации {#docs-check}

Пытается собрать сайт документации ClickHouse.
Она может завершиться неудачно, если вы изменили что-то в документации.
Наиболее вероятная причина — это неправильная перекрестная ссылка в документации.
Перейдите к отчету проверки и ищите сообщения `ERROR` и `WARNING`.

## Проверка описания {#description-check}

Проверяет, соответствует ли описание вашего pull request шаблону [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md).
Вы должны указать категорию изменений в changelog (например, Исправление ошибок) и написать сообщение, понятное пользователям, описывающее изменения для [CHANGELOG.md](../whats-new/changelog/index.md)

## Публикация в DockerHub {#push-to-dockerhub}

Создает образы docker, используемые для сборки и тестирования, а затем публикует их в DockerHub.

## Проверка маркеров {#marker-check}

Эта проверка означает, что система CI начала обрабатывать pull request.
Когда она имеет статус 'pending', это означает, что не все проверки еще были запущены.
После запуска всех проверок статус изменится на 'success'.

## Проверка стиля {#style-check}

Выполняет некоторые простые проверки кода на основе регулярных выражений, используя бинарный файл [`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style) (заметьте, что его можно запустить локально).
Если она завершается неудачно, исправьте ошибки стиля, следуя [руководству по стилю кода](style.md).

#### Запуск проверки стиля локально: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output

# запуск всех проверок
python3 tests/ci/style_check.py --no-push


# запуск указанного скрипта проверки (например: ./check-mypy)
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy


# найти все скрипты проверки стиля в директории:
cd ./utils/check-style


# Проверить дублирующиеся включения
./check-duplicate-includes.sh


# Проверить форматирование c++
./check-style


# Проверить форматирование python с помощью black
./check-black


# Проверить подсказки типов python с помощью mypy
./check-mypy


# Проверить python с помощью flake8
./check-flake8


# Проверить код с помощью codespell
./check-typos


# Проверить орфографию в документации
./check-doc-aspell


# Проверить пробелы
./check-whitespaces


# Проверить рабочие процессы github actions
./check-workflows


# Проверить подпроекты
./check-submodules


# Проверить shell скрипты с помощью shellcheck
./shellcheck-run.sh
```

## Быстрый тест {#fast-test}

Обычно это первая проверка, которая выполняется для PR.
Она собирает ClickHouse и запускает большинство [безстатусных функциональных тестов](tests.md#functional-tests), пропуская некоторые из них.
Если она завершается неудачно, дальнейшие проверки не запускаются, пока это не будет исправлено.
Посмотрите отчет, чтобы увидеть, какие тесты не прошли, затем воспроизводите сбой локально, как описано [здесь](/development/tests#running-a-test-locally).

#### Запуск быстрого теста локально: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse

# эта команда docker выполняет минимальную сборку ClickHouse и запускает FastTests
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### Файлы страницы состояния {#status-page-files}

- `runlog.out.log` — это общий журнал, который включает все другие журналы.
- `test_log.txt`
- `submodule_log.txt` содержит сообщения о клонировании и чекауте необходимых подпроектов.
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt` содержит сообщения о проверке флагов C/C++ и Linux.

#### Столбцы страницы состояния {#status-page-columns}

- *Имя теста* содержит имя теста (без пути, например, все типы тестов будут усечены до имени).
- *Статус теста* — один из _Пропущен_, _Успех_ или _Неудача_.
- *Время теста, сек.* — пусто для этого теста.

## Проверка сборки {#build-check}

Собирает ClickHouse в различных конфигурациях для использования в последующих этапах.
Вам нужно исправить сборки, которые завершились неудачно.
Журналы сборки часто содержат достаточно информации, чтобы исправить ошибку, но вам может понадобиться воспроизвести сбой локально.
Опции `cmake` можно найти в журнале сборки, используйте grep для поиска `cmake`.
Используйте эти опции и следуйте [общему процессу сборки](../development/build.md).

### Подробности отчета {#report-details}

- **Компилятор**: `clang-19`, возможно, с указанием целевой платформы
- **Тип сборки**: `Debug` или `RelWithDebInfo` (cmake).
- **Санитайзер**: `none` (без санитайзеров), `address` (ASan), `memory` (MSan), `undefined` (UBSan) или `thread` (TSan).
- **Статус**: `success` или `fail`
- **Журнал сборки**: ссылка на лог сборки и копирования файлов, полезно, когда сборка завершилась неудачно.
- **Время сборки**.
- **Артефакты**: файлы результата сборки (где `XXX` это версия сервера, например, `20.8.1.4344`).
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: Главный собранный бинарный файл.
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: бинарный файл GoogleTest с юнит-тестами ClickHouse.
  - `performance.tar.zst`: Специальный пакет для тестов производительности.


## Специальная проверка сборки {#special-build-check}
Проводит статический анализ и проверки стиля кода с использованием `clang-tidy`. Отчет аналогичен [проверке сборки](#build-check). Исправьте ошибки, найденные в журнале сборки.

#### Запуск clang-tidy локально: {#running-clang-tidy-locally}

Существует удобный скрипт `packager`, который запускает сборку clang-tidy в docker
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## Функциональные безстатусные тесты {#functional-stateless-tests}
Запускает [безстатусные функциональные тесты](tests.md#functional-tests) для собранных в различных конфигурациях бинарных файлов ClickHouse — release, debug, с санитайзерами и т. д.
Посмотрите отчет, чтобы увидеть, какие тесты не прошли, затем воспроизведите сбой локально, как описано [здесь](/development/tests#functional-tests).
Обратите внимание, что вы должны использовать правильную конфигурацию сборки для воспроизведения — тест может не пройти под AddressSanitizer, но пройти в Debug.
Скачайте бинарный файл со [страницы проверок сборки CI](/install#install-a-ci-generated-binary) или соберите его локально.

## Функциональные статусы тестов {#functional-stateful-tests}

Запускает [статусные функциональные тесты](tests.md#functional-tests).
Относитесь к ним так же, как к функциональным безстатусным тестам.
Разница в том, что они требуют таблицы `hits` и `visits` из [датасета clickstream](../getting-started/example-datasets/metrica.md) для запуска.

## Интеграционные тесты {#integration-tests}
Запускает [интеграционные тесты](tests.md#integration-tests).

## Проверка исправления ошибок {#bugfix-validate-check}

Проверяет, что либо создан новый тест (функциональный или интеграционный), либо некоторые измененные тесты не проходят с бинарным файлом, собранным на ветке master.
Эта проверка срабатывает, когда pull request имеет метку "pr-bugfix".

## Стресс-тест {#stress-test}
Запускает безстатусные функциональные тесты одновременно с нескольких клиентов для выявления ошибок, связанных с конкуренцией. Если он завершился неудачно:

    * Сначала исправьте все другие ошибки тестов;
    * Посмотрите на отчет, чтобы найти серверные журналы и проверьте их на возможные причины ошибки.

## Проверка совместимости {#compatibility-check}

Проверяет, что бинарный файл `clickhouse` работает на дистрибутивах со старыми версиями libc.
Если он завершится неудачно, попросите помощи у куратора.

## AST Fuzzer {#ast-fuzzer}
Запускает случайно сгенерированные запросы для выявления ошибок программы.
Если он завершился неудачно, попросите помощи у куратора.


## Тесты производительности {#performance-tests}
Измеряет изменения в производительности запросов.
Это самая продолжительная проверка, которая занимает чуть меньше 6 часов.
Отчет о тестах производительности подробно описан [здесь](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report).
