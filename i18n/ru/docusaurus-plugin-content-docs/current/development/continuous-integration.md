---
description: 'Обзор системы непрерывной интеграции ClickHouse'
sidebar_label: 'Непрерывная интеграция (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: 'Непрерывная интеграция (CI)'
doc_type: 'reference'
---

# Непрерывная интеграция (CI) \{#continuous-integration-ci\}

Когда вы отправляете pull request, для вашего кода выполняются автоматические проверки системой ClickHouse [непрерывной интеграции (CI)](tests.md#test-automation).
Это происходит после того, как сопровождающий репозитория (кто‑то из команды ClickHouse) просмотрел ваш код и добавил к вашему pull request метку `can be tested`.
Результаты проверок перечислены на странице pull request в GitHub, как описано в [документации по проверкам GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks).
Если проверка завершилась с ошибкой, возможно, вам потребуется её исправить.
На этой странице приведён обзор проверок, с которыми вы можете столкнуться, и того, что можно сделать для их исправления.

Если кажется, что сбой проверки не связан с вашими изменениями, это может быть временной ошибкой или проблемой с инфраструктурой.
Запушьте пустой коммит в pull request, чтобы перезапустить проверки CI:

```shell
git reset
git commit --allow-empty
git push
```

Если вы не уверены, как поступить, обратитесь за помощью к мейнтейнеру проекта.

## Объединение с master \{#merge-with-master\}

Проверяет, что PR может быть объединён с веткой master.
Если это невозможно, проверка завершится с ошибкой `Cannot fetch mergecommit`.
Чтобы пройти эту проверку, разрешите конфликт, как описано в [документации GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github), или выполните слияние ветки `master` в ветку вашего pull request с помощью git.

## Проверка документации \{#docs-check\}

Эта проверка пытается собрать сайт документации ClickHouse.
Она может завершиться с ошибкой, если вы изменили что-то в документации.
Наиболее вероятная причина — некорректная перекрёстная ссылка в документации.
Перейдите к отчёту проверки и найдите сообщения `ERROR` и `WARNING`.

## Проверка описания \{#description-check\}

Убедитесь, что описание вашего pull request соответствует шаблону [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md).
Вы должны указать категорию изменения для changelog (например, Bug Fix) и написать понятное пользователю сообщение, описывающее изменение, для [CHANGELOG.md](../whats-new/changelog/index.md)

## Docker-образ \{#docker-image\}

Собирает Docker-образы сервера ClickHouse и Keeper, чтобы проверить, что они корректно собираются.

### Тесты официальной библиотеки Docker \{#official-docker-library-tests\}

Запускает тесты из [официальной библиотеки Docker](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files), чтобы проверить, что Docker-образ `clickhouse/clickhouse-server` работает корректно.

Чтобы добавить новые тесты, создайте каталог `ci/jobs/scripts/docker_server/tests/$test_name` и скрипт `run.sh` в нём.

Дополнительные сведения о тестах можно найти в [документации по скриптам заданий CI](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server).

## Проверка маркера \{#marker-check\}

Эта проверка означает, что система CI начала обрабатывать pull request.
Когда у неё статус «pending», это означает, что ещё не все проверки были запущены.
После того как все проверки будут запущены, её статус изменится на «success».

## Проверка стиля \{#style-check\}

Выполняет различные проверки стиля кода.

В задаче Style Check выполняются следующие базовые проверки:

##### cpp \{#cpp\}

Выполняет простые проверки стиля кода на основе регулярных выражений с помощью скрипта [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) (его также можно запускать локально).\
Если проверка завершается с ошибкой, исправьте проблемы со стилем в соответствии с [руководством по стилю кода](style.md).

##### codespell, aspell \{#codespell\}

Проверяют грамматические ошибки и опечатки.

##### mypy \{#mypy\}

Выполняет статическую проверку типов для кода на Python.

### Запуск задачи проверки стиля локально \{#running-style-check-locally\}

Всю задачу *Style Check* можно запустить локально в Docker-контейнере с помощью:

```sh
python -m ci.praktika run "Style check"
```

Чтобы выполнить отдельную проверку (например, проверку *cpp*):

```sh
python -m ci.praktika run "Style check" --test cpp
```

Эти команды скачивают Docker-образ `clickhouse/style-test` и запускают задачу в контейнеризованной среде.
Дополнительные зависимости не требуются — достаточно Python 3 и Docker.

## Быстрый тест \{#fast-test\}

Обычно это первая проверка, которая запускается для PR.
Она собирает ClickHouse и запускает большинство [stateless-функциональных тестов](tests.md#functional-tests), пропуская некоторые.
Если она не проходит, последующие проверки не запускаются, пока проблема не будет устранена.
Ознакомьтесь с отчетом, чтобы увидеть, какие тесты завершились с ошибкой, затем воспроизведите сбой локально, как описано [здесь](/development/tests#running-a-test-locally).

#### Запуск быстрого теста локально: \{#running-fast-test-locally\}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

Эти команды загружают Docker-образ `clickhouse/fast-test` и запускают задачу в контейнеризированной среде.
Никаких зависимостей, кроме Python 3 и Docker, не требуется.

## Проверка сборки \{#build-check\}

Выполняет сборку ClickHouse в различных конфигурациях для использования на следующих шагах.

### Локальный запуск сборки \{#running-builds-locally\}

Сборку можно запустить локально в среде, имитирующей CI, с помощью:

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

Никаких дополнительных зависимостей, кроме Python 3 и Docker, не требуется.

#### Доступные задания сборки \{#available-build-jobs\}

Имена заданий сборки указаны в точности так, как они отображаются в отчёте CI:

**Сборки AMD64:**

* `Build (amd_debug)` - отладочная сборка с символами
* `Build (amd_release)` - оптимизированная релизная сборка
* `Build (amd_asan)` - сборка с Address Sanitizer
* `Build (amd_tsan)` - сборка с Thread Sanitizer
* `Build (amd_msan)` - сборка с Memory Sanitizer
* `Build (amd_ubsan)` - сборка с Undefined Behavior Sanitizer
* `Build (amd_binary)` - быстрая релизная сборка без Thin LTO
* `Build (amd_compat)` - совместимая сборка для более старых систем
* `Build (amd_musl)` - сборка с musl libc
* `Build (amd_darwin)` - сборка для macOS
* `Build (amd_freebsd)` - сборка для FreeBSD

**Сборки ARM64:**

* `Build (arm_release)` - оптимизированная релизная сборка ARM64
* `Build (arm_asan)` - сборка ARM64 с Address Sanitizer
* `Build (arm_coverage)` - сборка ARM64 с инструментированием для покрытия
* `Build (arm_binary)` - быстрая релизная сборка ARM64 без Thin LTO
* `Build (arm_darwin)` - сборка macOS ARM64
* `Build (arm_v80compat)` - сборка совместимости ARMv8.0

**Другие архитектуры:**

* `Build (ppc64le)` - PowerPC, 64-бит, порядок байтов Little Endian
* `Build (riscv64)` - RISC-V, 64-бит
* `Build (s390x)` - IBM System/390, 64-бит
* `Build (loongarch64)` - LoongArch, 64-бит

Если задание выполнено успешно, результаты сборки будут доступны в каталоге `<repo_root>/ci/tmp/build`.

**Примечание:** Для сборок, не относящихся к категории «Другие архитектуры» (сборки из категории «Другие архитектуры» используют кросс-компиляцию), архитектура вашей локальной машины должна совпадать с типом сборки, чтобы она была выполнена так, как запрошено в `BUILD_JOB_NAME`.

#### Пример \{#example-run-local\}

Чтобы выполнить локальную отладочную сборку:

```bash
python -m ci.praktika run "Build (amd_debug)"
```

Если описанный выше подход вам не подходит, используйте параметры cmake из лога сборки и следуйте [общему процессу сборки](../development/build.md).
## Functional stateless tests \{#functional-stateless-tests\}

Запускает [функциональные stateless-тесты](tests.md#functional-tests) для бинарных файлов ClickHouse, собранных в различных конфигурациях — release, debug, с санитайзерами и т. д.
Изучите отчёт, чтобы увидеть, какие тесты завершаются с ошибкой, затем воспроизведите сбой локально, как описано [здесь](/development/tests#functional-tests).
Обратите внимание, что для воспроизведения необходимо использовать правильную конфигурацию сборки — тест может падать под AddressSanitizer, но проходить в Debug.
Скачайте бинарный файл со [страницы проверок сборки CI](/install/advanced) или соберите его локально.

## Интеграционные тесты \{#integration-tests\}

Выполняет [интеграционные тесты](tests.md#integration-tests).

## Проверка исправления ошибки \{#bugfix-validate-check\}

Проверяет, что либо добавлен новый тест (функциональный или интеграционный), либо есть изменённые тесты, которые падают при использовании бинарника, собранного из ветки master.
Эта проверка запускается, когда у pull request есть метка "pr-bugfix".

## Стресс-тест \{#stress-test\}

Запускает функциональные тесты без сохранения состояния одновременно с нескольких клиентов для выявления ошибок, связанных с конкурентным выполнением. Если тест завершился неуспешно:

    * Сначала исправьте все остальные ошибки тестов;
    * Ознакомьтесь с отчетом, найдите журналы сервера и проверьте их на возможные причины
      ошибки.

## Проверка совместимости \{#compatibility-check\}

Проверяет, запускается ли бинарный файл `clickhouse` на дистрибутивах со старыми версиями libc.
Если проверка не проходит, обратитесь за помощью к мейнтейнеру.

## AST fuzzer \{#ast-fuzzer\}

Выполняет случайно сгенерированные запросы для обнаружения ошибок в программе.
Если он завершится с ошибкой, обратитесь за помощью к мейнтейнеру.

## Тесты производительности \{#performance-tests\}

Измеряйте, как изменяется производительность запросов.
Это самая длительная проверка, она занимает чуть меньше 6 часов.
Отчёт о тестах производительности подробно описан [здесь](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report).
