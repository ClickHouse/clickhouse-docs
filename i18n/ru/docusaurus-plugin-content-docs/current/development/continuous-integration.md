---
description: 'Обзор системы непрерывной интеграции ClickHouse'
sidebar_label: 'Непрерывная интеграция (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: 'Непрерывная интеграция (CI)'
---


# Непрерывная интеграция (CI)

Когда вы отправляете pull request, некоторые автоматизированные проверки вашего кода выполняются системой [непрерывной интеграции (CI)](tests.md#test-automation) ClickHouse.
Это происходит после того, как служитель репозитория (кто-то из команды ClickHouse) просматривает ваш код и добавляет метку `can be tested` к вашему pull request.
Результаты проверок перечислены на странице pull request в GitHub, как описано в [документации по проверкам GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks).
Если проверка не прошла, вам может потребоваться исправить ее.
Эта страница дает представление о проверках, с которыми вы можете столкнуться, и о том, что вы можете сделать для их исправления.

Если кажется, что сбой проверки не связан с вашими изменениями, это может быть временный сбой или проблема с инфраструктурой.
Отправьте пустой коммит в pull request, чтобы перезапустить проверки CI:

```shell
git reset
git commit --allow-empty
git push
```

Если вы не уверены, что делать, спросите у служителя о помощи.

## Слияние с Master {#merge-with-master}

Проверяет, может ли PR быть слит в мастер.
Если нет, он завершится с сообщением `Cannot fetch mergecommit`.
Чтобы исправить эту проверку, разрешите конфликт, как описано в [документации GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github) или слейте ветку `master` в вашу ветку pull request с помощью git.

## Проверка документации {#docs-check}

Пытается собрать сайт документации ClickHouse.
Она может завершиться с ошибкой, если вы изменили что-то в документации.
Наиболее вероятной причиной является то, что какая-то перекрестная ссылка в документации неверна.
Перейдите к отчету о проверке и ищите сообщения `ERROR` и `WARNING`.

## Проверка описания {#description-check}

Проверяет, соответствует ли описание вашего pull request шаблону [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md).
Вы должны указать категорию изменений для вашего изменения (например, Исправление ошибки) и написать читаемое пользователем сообщение, описывающее изменение для [CHANGELOG.md](../whats-new/changelog/index.md).

## Пуш в DockerHub {#push-to-dockerhub}

Собирает образы docker, используемые для сборки и тестирования, затем отправляет их в DockerHub.

## Проверка маркера {#marker-check}

Эта проверка означает, что система CI начала обрабатывать pull request.
Когда он имеет статус 'pending', это означает, что не все проверки были еще запущены.
После того как все проверки будут запущены, статус изменится на 'success'.

## Проверка стиля {#style-check}

Выполняет некоторые простые проверки стиля кода на основе регулярных выражений, используя бинарный файл [`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style) (обратите внимание, что его можно запустить локально).
Если он потерпит неудачу, исправьте ошибки стиля в соответствии с [руководством по стилю кода](style.md).

#### Запуск проверки стиля локально: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output

# запуск всех проверок
python3 tests/ci/style_check.py --no-push


# запустите указанный скрипт проверки (например: ./check-mypy)
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy


# найдите все скрипты проверки стиля в директории:
cd ./utils/check-style


# Проверка дублирующих включений
./check-duplicate-includes.sh


# Проверка форматирования c++
./check-style


# Проверка форматирования python с помощью black
./check-black


# Проверка подстановки типов python с помощью mypy
./check-mypy


# Проверка python с помощью flake8
./check-flake8


# Проверка кода с помощью codespell
./check-typos


# Проверка правописания в документах
./check-doc-aspell


# Проверка пробелов
./check-whitespaces


# Проверка рабочих процессов github actions
./check-workflows


# Проверка подмодулей
./check-submodules


# Проверка shell скриптов с помощью shellcheck
./shellcheck-run.sh
```

## Быстрый тест {#fast-test}

Обычно это первая проверка, которая выполняется для PR.
Он собирает ClickHouse и выполняет большинство [статeless функциональных тестов](tests.md#functional-tests), пропуская некоторые.
Если он не проходит, дальнейшие проверки не запускаются, пока он не будет исправлен.
Посмотрите на отчет, чтобы увидеть, какие тесты не прошли, затем воспроизведите сбой локально, как описано [здесь](/development/tests#running-a-test-locally).

#### Запуск Быстрого теста локально: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse

# эта команда docker выполняет минимальную сборку ClickHouse и запускает Быстрые тесты против него
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### Файлы страницы состояния {#status-page-files}

- `runlog.out.log` является общим журналом, который включает все другие журналы.
- `test_log.txt`
- `submodule_log.txt` содержит сообщения о клонировании и проверке необходимых подмодулей.
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt` содержит сообщения о проверке флагов C/C++ и Linux.

#### Колонки страницы состояния {#status-page-columns}

- *Имя теста* содержит имя теста (без пути, например, все типы тестов будут сокращены до имени).
- *Статус теста* -- один из _Пропуск_, _Успех_ или _Неудача_.
- *Время теста, сек.* -- пусто для этого теста.


## Проверка сборки {#build-check}

Собирает ClickHouse в различных конфигурациях для использования на следующих этапах.
Вам необходимо устранить сбои сборки.
Журналы сборки часто содержат достаточно информации для исправления ошибки, но вам может понадобиться воспроизвести сбой локально.
Опции `cmake` можно найти в журнале сборки, используя grep для `cmake`.
Используйте эти параметры и следуйте [общему процессу сборки](../development/build.md).

### Подробности отчета {#report-details}

- **Компилятор**: `clang-19`, опционально с наименованием целевой платформы
- **Тип сборки**: `Debug` или `RelWithDebInfo` (cmake).
- **Санитайзер**: `none` (без санитайзеров), `address` (ASan), `memory` (MSan), `undefined` (UBSan) или `thread` (TSan).
- **Статус**: `success` или `fail`
- **Журнал сборки**: ссылка на журнал сборки и копирования файлов, полезная, когда сборка не удалась.
- **Время сборки**.
- **Артефакты**: файлы результатов сборки (с `XXX` как версией сервера, например, `20.8.1.4344`).
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: Основной собранный бинарный файл.
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: бинарный файл GoogleTest с юнит-тестами ClickHouse.
  - `performance.tar.zst`: специальный пакет для тестов производительности.


## Проверка специальной сборки {#special-build-check}
Выполняет статический анализ и проверки стиля кода с использованием `clang-tidy`. Отчет аналогичен [проверке сборки](#build-check). Исправьте ошибки, найденные в журнале сборки.

#### Запуск clang-tidy локально: {#running-clang-tidy-locally}

Существует удобный скрипт `packager`, который выполняет сборку clang-tidy в docker
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## Функциональные статeless тесты {#functional-stateless-tests}
Запускает [статeless функциональные тесты](tests.md#functional-tests) для бинарных файлов ClickHouse, собранных в различных конфигурациях -- релиз, отладка, с санитайзерами и т. д.
Посмотрите на отчет, чтобы увидеть, какие тесты не прошли, затем воспроизведите сбой локально, как описано [здесь](/development/tests#functional-tests).
Обратите внимание, что вам необходимо использовать правильную конфигурацию сборки для воспроизведения -- тест может не пройти под AddressSanitizer, но пройти в режиме Debug.
Скачайте бинарный файл со [страницы проверок сборки CI](/install#install-a-ci-generated-binary) или соберите его локально.

## Функциональные stateful тесты {#functional-stateful-tests}

Запускает [stateful функциональные тесты](tests.md#functional-tests).
Относитесь к ним так же, как к функциональным статeless тестам.
Разница в том, что они требуют таблицы `hits` и `visits` из [наборов данных clickstream](../getting-started/example-datasets/metrica.md) для своего выполнения.

## Интеграционные тесты {#integration-tests}
Запускает [интеграционные тесты](tests.md#integration-tests).

## Проверка исправления ошибок {#bugfix-validate-check}

Проверяет, что либо новый тест (функциональный или интеграционный), либо некоторые измененные тесты, которые не проходят с бинарным файлом, собранным на ветке master.
Эта проверка запускается, когда к pull request добавили метку "pr-bugfix".

## Стресс-тест {#stress-test}
Запускает статeless функциональные тесты одновременно от нескольких клиентов для обнаружения ошибок, связанных с параллелизмом. Если он не проходит:

    * Исправьте сначала все другие сбойные тесты;
    * Посмотрите на отчет, чтобы найти журналы сервера и проверьте их на возможные причины
      ошибки.

## Проверка совместимости {#compatibility-check}

Проверяет, что бинарный файл `clickhouse` запускается на дистрибутивах со старыми версиями libc.
Если он не проходит, спросите у служителя о помощи.

## Fuzzer AST {#ast-fuzzer}
Запускает случайным образом сгенерированные запросы, чтобы поймать ошибки программы.
Если он не проходит, спросите у служителя о помощи.

## Тесты производительности {#performance-tests}
Измеряют изменения в производительности запросов.
Это самая длительная проверка, которая занимает чуть менее 6 часов для выполнения.
Отчет о тестах производительности подробно описан [здесь](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report).
