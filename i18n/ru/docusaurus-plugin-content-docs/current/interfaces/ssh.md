---
description: 'Документация по SSH-интерфейсу в ClickHouse'
keywords: ['client', 'ssh', 'putty']
sidebar_label: 'SSH-интерфейс'
sidebar_position: 60
slug: /interfaces/ssh
title: 'SSH-интерфейс'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# SSH-интерфейс с псевдотерминалом (PTY) {#ssh-interface-with-pty}

<ExperimentalBadge />

<CloudNotSupportedBadge />

## Предисловие {#preface}

Сервер ClickHouse позволяет устанавливать прямое подключение по протоколу SSH. Можно использовать любой клиент.

После создания [пользователя базы данных, аутентифицируемого с помощью SSH-ключа](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys):

```sql
CREATE USER abcuser IDENTIFIED WITH ssh_key BY KEY '<СКРЫТО>' TYPE 'ssh-ed25519';
```

Вы можете использовать этот ключ для подключения к серверу ClickHouse. При этом будет открыт псевдотерминал (PTY) с интерактивной сессией clickhouse-client.

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022
ClickHouse embedded version 25.1.1.1.

ip-10-1-13-116.us-west-2.compute.internal :) SELECT 1;

SELECT 1

Query id: cdd91b7f-215b-4537-b7df-86d19bf63f64

   ┌─1─┐
1. │ 1 │
   └───┘

1 row in set. Elapsed: 0.002 sec.
```

Выполнение команд через SSH в неинтерактивном режиме также поддерживается:

```bash
> ssh -i ~/test_ssh/id_ed25519 abcuser@localhost -p 9022 "select 1"
1
```

## Конфигурация сервера {#server-configuration}

Чтобы включить функцию SSH-сервера, необходимо раскомментировать или добавить следующий раздел в файл `config.xml`:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
<ssh_server>
   <host_rsa_key>путь-к-ключу</host_rsa_key>
   <!--host_ecdsa_key>путь-к-ключу</host_ecdsa_key-->
   <!--host_ed25519_key>путь-к-ключу</host_ed25519_key-->
</ssh_server>
```

Ключ хоста является неотъемлемой частью протокола SSH. Его открытая часть хранится в файле `~/.ssh/known_hosts` на стороне клиента и, как правило, используется для предотвращения атак типа «man-in-the-middle». При первом подключении к серверу вы увидите сообщение, приведённое ниже:

```shell
Подлинность хоста '[localhost]:9022 ([127.0.0.1]:9022)' не может быть установлена.
Отпечаток RSA-ключа: SHA256:3qxVlJKMr/PEKw/hfeg06HAK451Tt0eenhwqQvh58Do.
Этот ключ не известен под другими именами
Вы уверены, что хотите продолжить подключение (yes/no/[fingerprint])?
```

Это по сути означает: «Вы хотите сохранить открытый ключ этого хоста и продолжить подключение?».

Вы можете указать своему SSH‑клиенту не проверять хост, передав параметр:

```bash
ssh -o "StrictHostKeyChecking no" user@host
```

## Настройка встроенного клиента {#configuring-embedded-client}

Вы можете передавать параметры встроенному клиенту аналогично тому, как это делается для обычного `clickhouse-client`, но с некоторыми ограничениями.
Поскольку используется протокол SSH, единственный способ передать параметры целевому хосту — через переменные окружения.

Например, задать `format` можно следующим образом:

```bash
> ssh -o SetEnv="format=Pretty" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```

Вы можете изменять любые пользовательские настройки таким образом и дополнительно передавать большинство обычных опций `clickhouse-client` (за исключением тех, которые не имеют смысла в этой конфигурации).

Важно:

Если одновременно переданы опция `query` и SSH-команда, SSH-команда добавляется в список запросов на выполнение:

```bash
ubuntu ip-10-1-13-116@~$ ssh -o SetEnv="format=Pretty query=\"SELECT 2;\"" -i ~/test_ssh/id_ed25519  abcuser@localhost -p 9022 "SELECT 1"
   ┏━━━┓
   ┃ 2 ┃
   ┡━━━┩
1. │ 2 │
   └───┘
   ┏━━━┓
   ┃ 1 ┃
   ┡━━━┩
1. │ 1 │
   └───┘
```
