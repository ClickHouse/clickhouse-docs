---
description: 'На этой странице объясняется, как сервер ClickHouse может настраиваться с помощью конфигурационных файлов в синтаксисе XML или YAML.'
sidebar_label: 'Конфигурационные файлы'
sidebar_position: 50
slug: /operations/configuration-files
title: 'Конфигурационные файлы'
doc_type: 'guide'
---

:::note
Профили настроек и конфигурационные файлы на основе XML не поддерживаются в ClickHouse Cloud. Поэтому в ClickHouse Cloud вы не найдете файл config.xml. Вместо этого следует использовать SQL-команды для управления настройками через профили настроек.

Для получения дополнительной информации см. ["Configuring Settings"](/manage/settings)
:::

Сервер ClickHouse может настраиваться с помощью конфигурационных файлов в синтаксисе XML или YAML.
В большинстве типов установки сервер ClickHouse запускается с `/etc/clickhouse-server/config.xml` в качестве файла конфигурации по умолчанию, но также возможно указать расположение файла конфигурации вручную при запуске сервера, используя параметр командной строки `--config-file` или `-C`.
Дополнительные конфигурационные файлы могут быть помещены в каталог `config.d/` относительно основного файла конфигурации, например в каталог `/etc/clickhouse-server/config.d/`.
Файлы в этом каталоге и основной конфигурационный файл объединяются на этапе предварительной обработки до применения конфигурации на сервере ClickHouse.
Конфигурационные файлы объединяются в алфавитном порядке.
Чтобы упростить обновления и улучшить модульность, рекомендуется оставлять файл `config.xml` по умолчанию без изменений и размещать дополнительную настройку в `config.d/`.
Конфигурация ClickHouse Keeper находится в `/etc/clickhouse-keeper/keeper_config.xml`.
Аналогично, дополнительные конфигурационные файлы для Keeper необходимо помещать в `/etc/clickhouse-keeper/keeper_config.d/`.

Допускается сочетать конфигурационные файлы XML и YAML, например, у вас может быть основной файл конфигурации `config.xml` и дополнительные файлы конфигурации `config.d/network.xml`, `config.d/timezone.yaml` и `config.d/keeper.yaml`.
Смешивание XML и YAML в одном конфигурационном файле не поддерживается.
Файлы конфигурации XML должны использовать `<clickhouse>...</clickhouse>` в качестве тега верхнего уровня.
В конфигурационных файлах YAML тег `clickhouse:` является необязательным; если он отсутствует, парсер вставляет его автоматически.

## Объединение конфигураций \\{#merging\\}

Два конфигурационных файла (обычно основной конфигурационный файл и дополнительный конфигурационный файл из `config.d/`) объединяются следующим образом:

* Если узел (т. е. путь, ведущий к элементу) присутствует в обоих файлах и не имеет атрибутов `replace` или `remove`, он включается в объединённый конфигурационный файл, а дочерние элементы из обоих узлов включаются и рекурсивно объединяются.
* Если один из двух узлов содержит атрибут `replace`, он включается в объединённый конфигурационный файл, но при этом включаются только дочерние элементы из узла с атрибутом `replace`.
* Если один из двух узлов содержит атрибут `remove`, узел не включается в объединённый конфигурационный файл (если он уже существует, он удаляется).

Например, если заданы два конфигурационных файла:

```xml title="config.xml"
<clickhouse>
    <config_a>
        <setting_1>1</setting_1>
    </config_a>
    <config_b>
        <setting_2>2</setting_2>
    </config_b>
    <config_c>
        <setting_3>3</setting_3>
    </config_c>
</clickhouse>
```

и

```xml title="config.d/other_config.xml"
<clickhouse>
    <config_a>
        <setting_4>4</setting_4>
    </config_a>
    <config_b replace="replace">
        <setting_5>5</setting_5>
    </config_b>
    <config_c remove="remove">
        <setting_6>6</setting_6>
    </config_c>
</clickhouse>
```

В результате получится объединённый файл конфигурации:

```xml
<clickhouse>
    <config_a>
        <setting_1>1</setting_1>
        <setting_4>4</setting_4>
    </config_a>
    <config_b>
        <setting_5>5</setting_5>
    </config_b>
</clickhouse>
```

### Подстановка значений из переменных окружения и узлов ZooKeeper \\{#from_env_zk\\}

Чтобы указать, что значение элемента должно быть заменено значением переменной окружения, используйте атрибут `from_env`.

Например, с переменной окружения `$MAX_QUERY_SIZE = 150000`:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

Итоговая конфигурация будет следующей:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

То же самое можно сделать с помощью `from_zk` (узла ZooKeeper):

```xml
<clickhouse>
    <postgresql_port from_zk="/zk_configs/postgresql_port"/>
</clickhouse>
```

```shell
# clickhouse-keeper-client
/ :) touch /zk_configs
/ :) create /zk_configs/postgresql_port "9005"
/ :) get /zk_configs/postgresql_port
9005
```

В итоге вы получите следующую конфигурацию:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### Значения по умолчанию \\{#default-values\\}

Элемент с атрибутом `from_env` или `from_zk` может дополнительно иметь атрибут `replace="1"` (этот атрибут должен указываться перед `from_env`/`from_zk`).
В этом случае элемент может задавать значение по умолчанию.
Элемент принимает значение переменной окружения или узла ZooKeeper, если оно задано, в противном случае используется значение по умолчанию.

Повторим предыдущий пример, но будем считать, что `MAX_QUERY_SIZE` не задана:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

В результате конфигурация будет выглядеть следующим образом:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## Подстановка содержимого из файла \\{#substitution-with-file-content\\}

Также можно заменять части конфигурации содержимым файлов. Это можно сделать двумя способами:

* *Подстановка значений*: Если элемент имеет атрибут `incl`, его значение будет заменено содержимым указанного файла. По умолчанию путь к файлу с подстановками — `/etc/metrika.xml`. Это можно изменить в элементе [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) в конфигурации сервера. Значения подстановок задаются в элементах `/clickhouse/substitution_name` в этом файле. Если подстановка, указанная в `incl`, не существует, об этом делается запись в журнал. Чтобы ClickHouse не записывал отсутствующие подстановки в журнал, укажите атрибут `optional="true"` (например, для настроек [macros](../operations/server-configuration-parameters/settings.md#macros)).
* *Подстановка элементов*: Если необходимо заменить целый элемент подстановкой, используйте `include` в качестве имени элемента. Имя элемента `include` можно комбинировать с атрибутом `from_zk = "/path/to/node"`. В этом случае значение элемента будет заменено содержимым узла ZooKeeper по пути `/path/to/node`. Это также работает, если вы храните целое поддерево XML в узле ZooKeeper — оно будет полностью вставлено в исходный элемент.

Пример этого показан ниже:

```xml
<clickhouse>
    <!-- Appends XML subtree found at `/profiles-in-zookeeper` ZK path to `<profiles>` element. -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- Replaces `include` element with the subtree found at `/users-in-zookeeper` ZK path. -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

Если вы хотите объединить подставляемое содержимое с существующей конфигурацией вместо простого добавления в конец, вы можете использовать атрибут `merge="true"`. Например: `<include from_zk="/some_path" merge="true">`. В этом случае существующая конфигурация будет объединена с подставляемым содержимым, а текущие настройки конфигурации будут заменены значениями из подстановки.

## Шифрование и скрытие конфигурации \\{#encryption\\}

Вы можете использовать симметричное шифрование для шифрования элемента конфигурации, например пароля в открытом виде или закрытого ключа.
Для этого сначала настройте [кодек шифрования](../sql-reference/statements/create/table.md#encryption-codecs), затем добавьте атрибут `encrypted_by` со значением — именем кодека шифрования — к элементу, который нужно зашифровать.

В отличие от атрибутов `from_zk`, `from_env` и `incl` или элемента `include`, никакая подстановка (то есть расшифровка зашифрованного значения) в предварительно обработанном файле не выполняется.
Расшифровка выполняется только во время работы процесса сервера.

Например:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex>00112233445566778899aabbccddeeff</key_hex>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

Атрибуты [`from_env`](#from_env_zk) и [`from_zk`](#from_env_zk) также могут применяться к `encryption_codecs`:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_env="CLICKHOUSE_KEY_HEX"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

    <interserver_http_credentials>
        <user>admin</user>
        <password encrypted_by="AES_128_GCM_SIV">961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85</password>
    </interserver_http_credentials>

</clickhouse>
```

Ключи шифрования и зашифрованные значения могут быть определены в любом конфигурационном файле.

Пример файла `config.xml`:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

Пример файла `users.xml`:

```xml
<clickhouse>

    <users>
        <test_user>
            <password encrypted_by="AES_128_GCM_SIV">96280000000D000000000030D4632962295D46C6FA4ABF007CCEC9C1D0E19DA5AF719C1D9A46C446</password>
            <profile>default</profile>
        </test_user>
    </users>

</clickhouse>
```

Чтобы зашифровать значение, можно, например, использовать программу `encrypt_decrypt`:

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

Даже при использовании зашифрованных элементов конфигурации зашифрованные элементы по‑прежнему видны в предварительно обработанном конфигурационном файле.
Если это создаёт проблему для вашего развертывания ClickHouse, есть два варианта: либо установите права доступа к предварительно обработанному файлу 600, либо используйте атрибут `hide_in_preprocessed`.

Например:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```

## Настройки пользователя \\{#user-settings\\}

Файл `config.xml` может задавать отдельный конфигурационный файл с пользовательскими настройками, профилями и квотами. Относительный путь к этому файлу задаётся в элементе `users_config`. По умолчанию это `users.xml`. Если `users_config` не указан, пользовательские настройки, профили и квоты задаются непосредственно в `config.xml`.

Пользовательскую конфигурацию можно разбить на отдельные файлы аналогично `config.xml` и `config.d/`.
Имя каталога определяется как значение настройки `users_config` без суффикса `.xml`, к которому добавляется `.d`.
Каталог `users.d` используется по умолчанию, так как `users_config` по умолчанию равен `users.xml`.

Обратите внимание, что файлы конфигурации сначала [объединяются](#merging) с учётом настроек, а include-директивы обрабатываются после этого.

## Пример XML \\{#example\\}

Например, вы можете использовать отдельный файл конфигурации для каждого пользователя следующим образом:

```bash
$ cat /etc/clickhouse-server/users.d/alice.xml
```

```xml
<clickhouse>
    <users>
      <alice>
          <profile>analytics</profile>
            <networks>
                  <ip>::/0</ip>
            </networks>
          <password_sha256_hex>...</password_sha256_hex>
          <quota>analytics</quota>
      </alice>
    </users>
</clickhouse>
```

## Примеры YAML \\{#example-1\\}

Здесь вы можете увидеть конфигурацию по умолчанию в формате YAML: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example).

Между форматами YAML и XML есть некоторые отличия с точки зрения конфигурации ClickHouse.
Ниже приведены рекомендации по написанию конфигурации в формате YAML.

XML‑тег с текстовым значением представляется в виде пары ключ–значение YAML

```yaml
key: value
```

Соответствующий XML-код:

```xml
<key>value</key>
```

Вложенный XML-узел представляется в виде YAML-отображения:

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

Соответствующий XML-код:

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

Чтобы создать один и тот же XML‑тег несколько раз, используйте последовательность YAML:

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

Соответствующий XML-файл:

```xml
<seq_key>val1</seq_key>
<seq_key>val2</seq_key>
<seq_key>
    <key1>val3</key1>
</seq_key>
<seq_key>
    <map>
        <key2>val4</key2>
        <key3>val5</key3>
    </map>
</seq_key>
```

Чтобы задать атрибут XML, можно использовать ключ атрибута с префиксом `@`. Учтите, что по стандарту YAML символ `@` является зарезервированным, поэтому его необходимо заключать в двойные кавычки:

```yaml
map:
  "@attr1": value1
  "@attr2": value2
  key: 123
```

Соответствующий XML:

```xml
<map attr1="value1" attr2="value2">
    <key>123</key>
</map>
```

Можно также использовать атрибуты в последовательности YAML:

```yaml
seq:
  - "@attr1": value1
  - "@attr2": value2
  - 123
  - abc
```

Соответствующий XML:

```xml
<seq attr1="value1" attr2="value2">123</seq>
<seq attr1="value1" attr2="value2">abc</seq>
```

Упомянутый выше синтаксис не позволяет представить XML-текстовые узлы с XML-атрибутами в виде YAML. Этот особый случай можно реализовать, используя ключ атрибута
`#text`:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

Соответствующий XML:

```xml
<map_key attr1="value1">value2</map>
```

## Детали реализации \\{#implementation-details\\}

Для каждого файла конфигурации сервер при запуске также генерирует файлы `file-preprocessed.xml`. Эти файлы содержат все выполненные подстановки и переопределения и предназначены только для ознакомления. Если в конфигурационных файлах использовались подстановки через ZooKeeper, но ZooKeeper недоступен при старте сервера, сервер загружает конфигурацию из предварительно обработанного файла.

Сервер отслеживает изменения в конфигурационных файлах, а также в файлах и узлах ZooKeeper, которые использовались при выполнении подстановок и переопределений, и «на лету» перезагружает настройки пользователей и кластеров. Это означает, что вы можете изменять кластер, пользователей и их настройки без перезапуска сервера.
