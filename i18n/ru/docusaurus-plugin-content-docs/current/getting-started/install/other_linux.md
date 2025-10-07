---
'description': 'Установить ClickHouse на MacOS'
'keywords':
- 'ClickHouse'
- 'install'
- 'Linux'
- 'tar'
'sidebar_label': 'Другие Linux'
'slug': '/install/linux_other'
'title': 'Установить ClickHouse с использованием tgz архивов'
'hide_title': true
'doc_type': 'guide'
---

import Tar from './_snippets/_linux_tar_install.md'

```yaml
title: 'Архивация и работа с tar'
sidebar_label: 'Архивация с tar'
keywords: ['tar', 'архивация', 'упаковка']
description: 'Справочное руководство по использованию tar для создания архивов и извлечения файлов.'


# Архивация и работа с tar

`tar` (от "tape archive") - это утилита, широко используемая для создания архивов, упаковки и извлечения файлов. Она часто применяется в UNIX-подобных системах.

## Основные команды

- Создать архив:
  ```bash
  tar -cvf archive.tar /path/to/directory

- Извлечь архив:
  ```bash
  tar -xvf archive.tar

- Просмотреть содержимое архива:
  ```bash
  tar -tvf archive.tar

- Сжать архив с использованием gzip:
  ```bash
  tar -czvf archive.tar.gz /path/to/directory

- Извлечь сжатый архив:
  ```bash
  tar -xzvf archive.tar.gz

## Опции

- `c` - создать новый архив
- `x` - извлечь файлы из архива
- `v` - выводить процесс на экран
- `f` - указывает имя файла архива
- `z` - сжать или распаковать архив с использованием gzip

## Пример использования

Чтобы создать сжатый архив всех файлов в текущей директории:

```bash
tar -czvf my_archive.tar.gz .

Для извлечения содержимого архива в текущую директорию:

```bash
tar -xzvf my_archive.tar.gz

Благодаря своим возможностям, `tar` является незаменимым инструментом для работы с файлами в системах на базе UNIX и Linux.
