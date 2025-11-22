---
description: 'Обзор системы непрерывной интеграции ClickHouse'
sidebar_label: 'Непрерывная интеграция (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: 'Непрерывная интеграция (CI)'
doc_type: 'reference'
---



# Непрерывная интеграция (CI)

Когда вы создаёте pull request, для вашего кода запускаются автоматические проверки системой [непрерывной интеграции (CI)](tests.md#test-automation) ClickHouse.
Это происходит после того, как мейнтейнер репозитория (кто-то из команды ClickHouse) просмотрел ваш код и добавил к вашему pull request метку `can be tested`.
Результаты проверок перечислены на странице pull request в GitHub, как описано в [документации по проверкам GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks).
Если какая-либо проверка не проходит, вам может потребоваться её исправить.
На этой странице даётся обзор проверок, с которыми вы можете столкнуться, и того, что вы можете сделать, чтобы их исправить.

Если похоже, что причина сбоя проверки не связана с вашими изменениями, это может быть временный сбой или проблема инфраструктуры.
Отправьте пустой коммит в ваш pull request, чтобы перезапустить проверки CI:

```shell
git reset
git commit --allow-empty
git push
```

Если вы не уверены, как поступить, обратитесь за помощью к мейнтейнеру проекта.


## Слияние с master {#merge-with-master}

Проверяет возможность слияния PR с веткой master.
Если слияние невозможно, проверка завершится с сообщением об ошибке `Cannot fetch mergecommit`.
Чтобы устранить эту ошибку, разрешите конфликт слияния, как описано в [документации GitHub](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github), или выполните слияние ветки `master` в вашу ветку pull request с помощью git.


## Проверка документации {#docs-check}

Выполняет сборку веб-сайта документации ClickHouse.
Проверка может завершиться ошибкой, если вы внесли изменения в документацию.
Наиболее вероятная причина — некорректная перекрёстная ссылка в документации.
Перейдите к отчёту проверки и найдите сообщения `ERROR` и `WARNING`.


## Проверка описания {#description-check}

Убедитесь, что описание вашего pull request соответствует шаблону [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md).
Необходимо указать категорию изменения для changelog (например, Bug Fix) и написать понятное для пользователей сообщение с описанием изменения для [CHANGELOG.md](../whats-new/changelog/index.md)


## Docker-образ {#docker-image}

Выполняет сборку Docker-образов сервера ClickHouse и keeper для проверки корректности сборки.

### Тесты официальной библиотеки Docker {#official-docker-library-tests}

Запускает тесты из [официальной библиотеки Docker](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files) для проверки корректной работы Docker-образа `clickhouse/clickhouse-server`.

Чтобы добавить новые тесты, создайте каталог `ci/jobs/scripts/docker_server/tests/$test_name` и скрипт `run.sh` в нём.

Дополнительные сведения о тестах можно найти в [документации по скриптам заданий CI](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server).


## Проверка маркера {#marker-check}

Эта проверка означает, что система CI начала обработку pull request.
Когда у неё статус 'pending', это означает, что ещё не все проверки были запущены.
После запуска всех проверок её статус меняется на 'success'.


## Проверка стиля {#style-check}

Выполняет различные проверки стиля в кодовой базе.

Базовые проверки в задании проверки стиля:

##### cpp {#cpp}

Выполняет простые проверки стиля кода на основе регулярных выражений с использованием скрипта [`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) (который также можно запустить локально).  
В случае ошибки исправьте проблемы со стилем в соответствии с [руководством по стилю кода](style.md).

##### codespell, aspell {#codespell}

Проверяет наличие грамматических ошибок и опечаток.

##### mypy {#mypy}

Выполняет статическую проверку типов для кода на Python.

### Локальный запуск задания проверки стиля {#running-style-check-locally}

Полное задание _проверки стиля_ можно запустить локально в контейнере Docker с помощью:

```sh
python -m ci.praktika run "Style check"
```

Для запуска конкретной проверки (например, проверки _cpp_):

```sh
python -m ci.praktika run "Style check" --test cpp
```

Эти команды загружают образ Docker `clickhouse/style-test` и запускают задание в контейнеризованной среде.
Не требуется никаких зависимостей, кроме Python 3 и Docker.


## Быстрый тест {#fast-test}

Обычно это первая проверка, которая запускается для pull request.
Она собирает ClickHouse и запускает большинство [функциональных тестов без состояния](tests.md#functional-tests), пропуская некоторые.
Если она завершается с ошибкой, дальнейшие проверки не запускаются до устранения проблемы.
Изучите отчёт, чтобы увидеть, какие тесты не прошли, затем воспроизведите ошибку локально, как описано [здесь](/development/tests#running-a-test-locally).

#### Локальный запуск быстрого теста: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

Эти команды загружают Docker-образ `clickhouse/fast-test` и запускают задачу в контейнеризованном окружении.
Требуются только Python 3 и Docker.


## Проверка сборки {#build-check}

Выполняет сборку ClickHouse в различных конфигурациях для использования на последующих этапах.

### Локальный запуск сборок {#running-builds-locally}

Сборку можно запустить локально в окружении, аналогичном CI, с помощью команды:

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

Требуются только Python 3 и Docker.

#### Доступные задачи сборки {#available-build-jobs}

Названия задач сборки точно соответствуют тем, что отображаются в отчёте CI:

**Сборки AMD64:**

- `Build (amd_debug)` — отладочная сборка с символами
- `Build (amd_release)` — оптимизированная релизная сборка
- `Build (amd_asan)` — сборка с Address Sanitizer
- `Build (amd_tsan)` — сборка с Thread Sanitizer
- `Build (amd_msan)` — сборка с Memory Sanitizer
- `Build (amd_ubsan)` — сборка с Undefined Behavior Sanitizer
- `Build (amd_binary)` — быстрая релизная сборка без Thin LTO
- `Build (amd_compat)` — сборка для совместимости со старыми системами
- `Build (amd_musl)` — сборка с musl libc
- `Build (amd_darwin)` — сборка для macOS
- `Build (amd_freebsd)` — сборка для FreeBSD

**Сборки ARM64:**

- `Build (arm_release)` — оптимизированная релизная сборка для ARM64
- `Build (arm_asan)` — сборка для ARM64 с Address Sanitizer
- `Build (arm_coverage)` — сборка для ARM64 с инструментацией покрытия кода
- `Build (arm_binary)` — быстрая релизная сборка для ARM64 без Thin LTO
- `Build (arm_darwin)` — сборка для macOS ARM64
- `Build (arm_v80compat)` — сборка для совместимости с ARMv8.0

**Другие архитектуры:**

- `Build (ppc64le)` — PowerPC 64-разрядная Little Endian
- `Build (riscv64)` — RISC-V 64-разрядная
- `Build (s390x)` — IBM System/390 64-разрядная
- `Build (loongarch64)` — LoongArch 64-разрядная

При успешном выполнении задачи результаты сборки будут доступны в каталоге `<repo_root>/ci/tmp/build`.

**Примечание:** Для сборок, не входящих в категорию «Другие архитектуры» (которые используют кросс-компиляцию), архитектура вашей локальной машины должна соответствовать типу сборки для создания сборки, указанной в `BUILD_JOB_NAME`.

#### Пример {#example-run-local}

Для запуска локальной отладочной сборки:

```bash
python -m ci.praktika run "Build (amd_debug)"
```


Если описанный выше подход вам не подходит, используйте параметры cmake из журнала сборки и следуйте [общему процессу сборки](../development/build.md).

## Функциональные stateless-тесты {#functional-stateless-tests}

Запускает [stateless функциональные тесты](tests.md#functional-tests) для бинарных файлов ClickHouse, собранных в различных конфигурациях — release, debug, с санитайзерами и т. д.
Изучите отчёт, чтобы определить, какие тесты завершились неудачно, затем воспроизведите ошибку локально, как описано [здесь](/development/tests#functional-tests).
Обратите внимание, что для воспроизведения необходимо использовать корректную конфигурацию сборки — тест может завершиться неудачно под AddressSanitizer, но пройти в Debug.
Загрузите бинарный файл со [страницы проверок сборки CI](/install/advanced) или соберите его локально.


## Интеграционные тесты {#integration-tests}

Выполняет [интеграционные тесты](tests.md#integration-tests).


## Проверка исправления ошибок {#bugfix-validate-check}

Проверяет, что новый тест (функциональный или интеграционный) или измененные тесты завершаются с ошибкой при использовании бинарного файла, собранного из ветки master.
Эта проверка запускается, когда pull request имеет метку «pr-bugfix».


## Нагрузочное тестирование {#stress-test}

Запускает stateless функциональные тесты одновременно из нескольких клиентов для обнаружения ошибок, связанных с параллелизмом. Если тест завершается неудачно:

    * Сначала устраните все остальные сбои тестов;
    * Изучите отчёт, найдите логи сервера и проверьте их на предмет возможных причин
      ошибки.


## Проверка совместимости {#compatibility-check}

Проверяет, что исполняемый файл `clickhouse` работает на дистрибутивах со старыми версиями libc.
Если проверка завершается неудачно, обратитесь за помощью к мейнтейнеру.


## AST-фаззер {#ast-fuzzer}

Выполняет случайно сгенерированные запросы для выявления программных ошибок.
В случае сбоя обратитесь за помощью к мейнтейнеру.


## Тесты производительности {#performance-tests}

Измеряют изменения в производительности запросов.
Это самая длительная проверка, которая занимает чуть менее 6 часов.
Отчёт о тестировании производительности подробно описан [здесь](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report).
