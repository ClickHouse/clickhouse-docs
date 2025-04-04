---
description: 'Обзор системы непрерывной интеграции ClickHouse'
sidebar_label: 'Непрерывная интеграция (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: 'Непрерывная интеграция (CI)'
---


# Непрерывная интеграция (CI)

Когда вы отправляете pull request, для вашего кода запускаются некоторые автоматические проверки системой ClickHouse [непрерывной интеграции (CI)](tests.md#test-automation).
Это происходит после того, как куратор репозитория (кто-то из команды ClickHouse) проверит ваш код и добавит метку `можно тестировать` к вашему pull request.
Результаты проверок перечислены на странице pull request на GitHub, как описано в [документации по проверкам GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks).
Если проверка не прошла, возможно, вам потребуется ее исправить.
Эта страница дает обзор проверок, с которыми вы можете столкнуться, и того, что вы можете сделать, чтобы их исправить.

Если кажется, что неудача проверки не связана с вашими изменениями, это может быть временная ошибка или проблема с инфраструктурой.
Отправьте пустую коммит в pull request, чтобы перезапустить проверки CI:

```shell
git reset
git commit --allow-empty
git push
```

Если вы не уверены, что делать, спросите у куратора о помощи.

## Слияние с Master {#merge-with-master}

Проверяет, что PR можно слить с master.
Если нет, он завершится с сообщением `Не удается получить mergecommit`.
Чтобы исправить эту проверку, разрешите конфликт, как описано в [документации GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github), или объедините ветку `master` с вашей веткой pull request с помощью git.

## Проверка документации {#docs-check}

Пытается собрать веб-сайт документации ClickHouse.
Это может завершиться неудачей, если вы изменили что-то в документации.
Наиболее вероятная причина — ошибка в кросс-ссылающейся ссылке в документации.
Перейдите к отчету о проверке и поищите сообщения `ERROR` и `WARNING`.

## Проверка описания {#description-check}

Проверяет, что описание вашего pull request соответствует шаблону [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md).
Вы должны указать категорию изменений для вашего изменения (например, Исправление ошибки) и написать читаемое пользователем сообщение, описывающее изменение для [CHANGELOG.md](../whats-new/changelog/index.md).

## Публикация в DockerHub {#push-to-dockerhub}

Создает образы docker, используемые для сборки и тестирования, а затем отправляет их в DockerHub.

## Проверка маркера {#marker-check}

Эта проверка означает, что система CI начала обрабатывать pull request.
Когда он имеет статус 'в ожидании', это означает, что не все проверки еще были запущены.
После того как все проверки были запущены, статус изменится на 'успешно'.

## Проверка стиля {#style-check}

Выполняет некоторые простые проверки стиля кода на основе regex, используя двоичный файл [`utils/check-style/check-style`](https://github.com/ClickHouse/ClickHouse/blob/master/utils/check-style/check-style) (обратите внимание, что его можно запустить локально).
Если она не проходит, исправьте ошибки стиля, следуя [руководству по стилю кода](style.md).

#### Запуск проверки стиля локально: {#running-style-check-locally}

```sh
mkdir -p /tmp/test_output

# выполнение всех проверок
python3 tests/ci/style_check.py --no-push


# запуск указанного скрипта проверки (например: ./check-mypy)
docker run --rm --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output -u $(id -u ${USER}):$(id -g ${USER}) --cap-add=SYS_PTRACE --entrypoint= -w/ClickHouse/utils/check-style clickhouse/style-test ./check-mypy


# найти все скрипты проверки стиля в каталоге:
cd ./utils/check-style


# Проверить дублирующиеся импорты
./check-duplicate-includes.sh


# Проверить форматирование c++
./check-style


# Проверить форматирование python с помощью black
./check-black


# Проверить типизацию python с помощью mypy
./check-mypy


# Проверить python с помощью flake8
./check-flake8


# Проверить код с помощью codespell
./check-typos


# Проверить орфографию документации
./check-doc-aspell


# Проверить пробелы
./check-whitespaces


# Проверить рабочие процессы github actions
./check-workflows


# Проверить подсистемы
./check-submodules


# Проверить сценарии оболочки с помощью shellcheck
./shellcheck-run.sh
```

## Быстрый тест {#fast-test}

Обычно это первая проверка, которая выполняется для PR.
Она собирает ClickHouse и запускает большинство [безразмерных функциональных тестов](tests.md#functional-tests), пропуская некоторые.
Если она не проходит, дальнейшие проверки не начинают работать, пока она не будет исправлена.
Посмотрите в отчет, чтобы увидеть, какие тесты не удались, а затем воспроизведите ошибку локально, как описано [здесь](/development/tests#running-a-test-locally).

#### Запуск быстрого теста локально: {#running-fast-test-locally}

```sh
mkdir -p /tmp/test_output
mkdir -p /tmp/fasttest-workspace
cd ClickHouse

# эта команда docker выполняет минимальную сборку ClickHouse и запускает против нее FastTests
docker run --rm --cap-add=SYS_PTRACE -u $(id -u ${USER}):$(id -g ${USER})  --network=host -e FASTTEST_WORKSPACE=/fasttest-workspace -e FASTTEST_OUTPUT=/test_output -e FASTTEST_SOURCE=/ClickHouse --cap-add=SYS_PTRACE -e stage=clone_submodules --volume=/tmp/fasttest-workspace:/fasttest-workspace --volume=.:/ClickHouse --volume=/tmp/test_output:/test_output clickhouse/fasttest
```

#### Файлы страницы состояния {#status-page-files}

- `runlog.out.log` — общий журнал, который включает все другие журналы.
- `test_log.txt`
- `submodule_log.txt` содержит сообщения о клонировании и чек-ауте необходимых подсистем.
- `stderr.log`
- `stdout.log`
- `clickhouse-server.log`
- `clone_log.txt`
- `install_log.txt`
- `clickhouse-server.err.log`
- `build_log.txt`
- `cmake_log.txt` содержит сообщения о проверке флагов C/C++ и Linux.

#### Столбцы страницы состояния {#status-page-columns}

- *Название теста* содержит название теста (без пути, т.е. все типы тестов будут сокращены до названия).
- *Статус теста* — один из _Пропущено_, _Успешно_ или _Неудачно_.
- *Время теста, сек.* — пусто для этого теста.

## Проверка сборки {#build-check}

Собирает ClickHouse в различных конфигурациях для использования на следующих этапах.
Вам нужно исправить сборки, которые не прошли.
Журналы сборки часто содержат достаточную информацию для исправления ошибки, но возможно, вам придется воспроизвести неудачу локально.
Опции `cmake` можно найти в журнале сборки, ищите `cmake`.
Используйте эти опции и следуйте [общему процессу сборки](../development/build.md).

### Подробности отчета {#report-details}

- **Компилятор**: `clang-19`, при необходимости с названием целевой платформы
- **Тип сборки**: `Debug` или `RelWithDebInfo` (cmake).
- **Санитайзер**: `none` (без санитайзеров), `address` (ASan), `memory` (MSan), `undefined` (UBSan) или `thread` (TSan).
- **Статус**: `success` или `fail`
- **Журнал сборки**: ссылка на журнал сборки и копирования файлов, полезная, когда сборка не удалась.
- **Время сборки**.
- **Артефакты**: файлы результатов сборки (с `XXX`, представляющим версию сервера, например, `20.8.1.4344`).
  - `clickhouse-client_XXX_amd64.deb`
  - `clickhouse-common-static-dbg_XXX[+asan, +msan, +ubsan, +tsan]_amd64.deb`
  - `clickhouse-common-staticXXX_amd64.deb`
  - `clickhouse-server_XXX_amd64.deb`
  - `clickhouse`: Основной построенный бинарный файл.
  - `clickhouse-odbc-bridge`
  - `unit_tests_dbms`: бинарный файл GoogleTest с юнит-тестами ClickHouse.
  - `performance.tar.zst`: Специальный пакет для тестов производительности.

## Специальная проверка сборки {#special-build-check}
Выполняет статический анализ и проверки стиля кода с использованием `clang-tidy`. Отчет аналогичен [проверке сборки](#build-check). Исправьте ошибки, найденные в журнале сборки.

#### Запуск clang-tidy локально: {#running-clang-tidy-locally}

Существует удобный скрипт `packager`, который запускает clang-tidy сборку в docker
```sh
mkdir build_tidy
./docker/packager/packager --output-dir=./build_tidy --package-type=binary --compiler=clang-19 --debug-build --clang-tidy
```

## Функциональные безразмерные тесты {#functional-stateless-tests}
Запускает [безразмерные функциональные тесты](tests.md#functional-tests) для сборок ClickHouse, выполненных в различных конфигурациях — релиз, отладка, с санитайзерами и т.д.
Посмотрите в отчет, чтобы увидеть, какие тесты не удались, а затем воспроизведите ошибку локально, как описано [здесь](/development/tests#functional-tests).
Обратите внимание, что вам нужно использовать правильную конфигурацию сборки для воспроизведения — тест может не пройти с AddressSanitizer, но пройти в Debug.
Скачайте бинарный файл со [страницы проверок сборки CI](/install#install-a-ci-generated-binary), или создайте его локально.

## Функциональные состояниевые тесты {#functional-stateful-tests}

Запускает [состояниеовые функциональные тесты](tests.md#functional-tests).
Обращайтесь с ними так же, как и с безразмерными функциональными тестами.
Разница в том, что они требуют таблицы `hits` и `visits` из [набора данных clickstream](../getting-started/example-datasets/metrica.md) для выполнения.

## Интеграционные тесты {#integration-tests}
Запускает [интеграционные тесты](tests.md#integration-tests).

## Проверка исправлений ошибок {#bugfix-validate-check}

Проверяет, что либо новый тест (функциональный или интеграционный), либо есть измененные тесты, которые не проходят с бинарным файлом, собранным на основной ветке.
Эта проверка запускается, когда pull request имеет метку "pr-bugfix".

## Стресс-тест {#stress-test}
Запускает безразмерные функциональные тесты одновременно от нескольких клиентов для обнаружения ошибок, связанных с конкуренцией. Если он завершился неудачно:

    * Сначала исправьте все остальные неудачи тестов;
    * Посмотрите в отчет, чтобы найти журналы сервера и проверьте их на возможные причины
      ошибки.

## Проверка совместимости {#compatibility-check}

Проверяет, что бинарный файл `clickhouse` работает на дистрибутивах с старыми версиями libc.
Если он не прошел, спросите у куратора о помощи.

## Fuzzer AST {#ast-fuzzer}
Запускает случайно сгенерированные запросы для выявления ошибок программы.
Если он не прошел, спросите у куратора о помощи.

## Тесты производительности {#performance-tests}
Измеряют изменения в производительности запросов.
Это самая длительная проверка, которая занимает чуть меньше 6 часов на выполнение.
Отчет о тестах производительности описан подробно [здесь](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report).
