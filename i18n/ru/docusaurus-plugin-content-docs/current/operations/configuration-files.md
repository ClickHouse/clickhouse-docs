---
description: 'На этой странице объясняется, как настраивать сервер ClickHouse с помощью файлов конфигурации в синтаксисе XML или YAML.'
sidebar_label: 'Файлы конфигурации'
sidebar_position: 50
slug: /operations/configuration-files
title: 'Файлы конфигурации'
doc_type: 'guide'
---

:::note
Профили настроек и файлы конфигурации на основе XML не поддерживаются в ClickHouse Cloud. Поэтому в ClickHouse Cloud вы не найдете файл config.xml. Вместо этого следует использовать SQL-команды для управления настройками через профили настроек.

Для получения дополнительной информации см. ["Configuring Settings"](/manage/settings)
:::

Сервер ClickHouse можно настраивать с помощью файлов конфигурации в синтаксисе XML или YAML.
В большинстве вариантов установки сервер ClickHouse запускается с файлом `/etc/clickhouse-server/config.xml` в качестве конфигурации по умолчанию, но также можно явно указать расположение файла конфигурации при запуске сервера, используя параметр командной строки `--config-file` или `-C`.
Дополнительные файлы конфигурации могут быть размещены в каталоге `config.d/` относительно основного файла конфигурации, например, в каталоге `/etc/clickhouse-server/config.d/`.
Файлы в этом каталоге и основной файл конфигурации объединяются на этапе предварительной обработки до применения конфигурации сервером ClickHouse.
Файлы конфигурации объединяются в алфавитном порядке.
Для упрощения обновлений и повышения модульности рекомендуется не изменять файл `config.xml` по умолчанию и размещать дополнительную настройку в `config.d/`.
Конфигурация ClickHouse Keeper хранится в `/etc/clickhouse-keeper/keeper_config.xml`.
Аналогично, дополнительные файлы конфигурации для Keeper должны быть размещены в `/etc/clickhouse-keeper/keeper_config.d/`.

Допускается смешивать конфигурационные файлы XML и YAML, например, можно иметь основной файл конфигурации `config.xml` и дополнительные файлы конфигурации `config.d/network.xml`, `config.d/timezone.yaml` и `config.d/keeper.yaml`.
Смешивание XML и YAML в пределах одного файла конфигурации не поддерживается.
Файлы конфигурации XML должны использовать `<clickhouse>...</clickhouse>` в качестве тега верхнего уровня.
В конфигурационных файлах YAML `clickhouse:` является необязательным: при его отсутствии парсер добавляет его автоматически.



## Объединение конфигурации {#merging}

Два конфигурационных файла (обычно основной конфигурационный файл и дополнительный конфигурационный файл из `config.d/`) объединяются следующим образом:

- Если узел (т. е. путь к элементу) присутствует в обоих файлах и не имеет атрибутов `replace` или `remove`, он включается в объединённый конфигурационный файл, а дочерние элементы из обоих узлов включаются и объединяются рекурсивно.
- Если один из двух узлов содержит атрибут `replace`, он включается в объединённый конфигурационный файл, но включаются только дочерние элементы узла с атрибутом `replace`.
- Если один из двух узлов содержит атрибут `remove`, узел не включается в объединённый конфигурационный файл (если он уже существует, он удаляется).

Например, при наличии двух конфигурационных файлов:

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

Результирующий объединённый конфигурационный файл будет иметь следующий вид:

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

### Подстановка переменных окружения и узлов ZooKeeper {#from_env_zk}

Чтобы указать, что значение элемента должно быть заменено значением переменной окружения, используйте атрибут `from_env`.

Например, при переменной окружения `$MAX_QUERY_SIZE = 150000`:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size from_env="MAX_QUERY_SIZE"/>
        </default>
    </profiles>
</clickhouse>
```

Результирующая конфигурация будет иметь следующий вид:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

Аналогично можно использовать `from_zk` (узел ZooKeeper):

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

В результате получается следующая конфигурация:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### Значения по умолчанию {#default-values}

Элемент с атрибутами `from_env` или `from_zk` может дополнительно иметь атрибут `replace="1"` (который должен располагаться перед `from_env`/`from_zk`).
В этом случае элемент может определять значение по умолчанию.
Элемент принимает значение переменной окружения или узла ZooKeeper, если оно установлено, в противном случае используется значение по умолчанию.

Предыдущий пример повторяется при условии, что `MAX_QUERY_SIZE` не установлена:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

В результате получается конфигурация:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```


## Подстановка содержимого из файла {#substitution-with-file-content}

Также возможно заменять части конфигурации содержимым файлов. Это можно сделать двумя способами:

- _Подстановка значений_: Если элемент имеет атрибут `incl`, его значение будет заменено содержимым указанного файла. По умолчанию путь к файлу с подстановками — `/etc/metrika.xml`. Его можно изменить в элементе [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) в конфигурации сервера. Значения подстановок указываются в элементах `/clickhouse/substitution_name` в этом файле. Если подстановка, указанная в `incl`, не существует, это записывается в лог. Чтобы ClickHouse не записывал в лог отсутствующие подстановки, укажите атрибут `optional="true"` (например, для настроек [macros](../operations/server-configuration-parameters/settings.md#macros)).
- _Подстановка элементов_: Если требуется заменить весь элемент подстановкой, используйте `include` в качестве имени элемента. Имя элемента `include` можно комбинировать с атрибутом `from_zk = "/path/to/node"`. В этом случае значение элемента заменяется содержимым узла ZooKeeper по пути `/path/to/node`. Это также работает, если вы храните целое XML-поддерево в виде узла ZooKeeper — оно будет полностью вставлено в исходный элемент.

Пример показан ниже:

```xml
<clickhouse>
    <!-- Добавляет XML-поддерево, найденное по пути `/profiles-in-zookeeper` в ZK, к элементу `<profiles>`. -->
    <profiles from_zk="/profiles-in-zookeeper" />

    <users>
        <!-- Заменяет элемент `include` поддеревом, найденным по пути `/users-in-zookeeper` в ZK. -->
        <include from_zk="/users-in-zookeeper" />
        <include from_zk="/other-users-in-zookeeper" />
    </users>
</clickhouse>
```

Если требуется объединить подставляемое содержимое с существующей конфигурацией вместо добавления, можно использовать атрибут `merge="true"`. Например: `<include from_zk="/some_path" merge="true">`. В этом случае существующая конфигурация будет объединена с содержимым из подстановки, а существующие параметры конфигурации будут заменены значениями из подстановки.


## Шифрование и сокрытие конфигурации {#encryption}

Вы можете использовать симметричное шифрование для шифрования элементов конфигурации, например, паролей в открытом виде или приватных ключей.
Для этого сначала настройте [кодек шифрования](../sql-reference/statements/create/table.md#encryption-codecs), затем добавьте атрибут `encrypted_by` с именем кодека шифрования в качестве значения к элементу, который необходимо зашифровать.

В отличие от атрибутов `from_zk`, `from_env` и `incl` или элемента `include`, подстановка (т. е. расшифровка зашифрованного значения) не выполняется в предобработанном файле.
Расшифровка происходит только во время выполнения в серверном процессе.

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

Пример `config.xml`:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

Пример `users.xml`:

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

Для шифрования значения можно использовать программу `encrypt_decrypt` (пример):

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

Даже при использовании зашифрованных элементов конфигурации они все равно отображаются в предобработанном конфигурационном файле.
Если это представляет проблему для вашего развертывания ClickHouse, существует две альтернативы: либо установите права доступа к предобработанному файлу на 600, либо используйте атрибут `hide_in_preprocessed`.

Например:

```xml
<clickhouse>

    <interserver_http_credentials hide_in_preprocessed="true">
        <user>admin</user>
        <password>secret</password>
    </interserver_http_credentials>

</clickhouse>
```


## Настройки пользователей {#user-settings}

Файл `config.xml` может указывать на отдельный конфигурационный файл с настройками пользователей, профилями и квотами. Относительный путь к этому конфигурационному файлу задается в элементе `users_config`. По умолчанию это `users.xml`. Если `users_config` не указан, настройки пользователей, профили и квоты задаются непосредственно в `config.xml`.

Конфигурация пользователей может быть разделена на отдельные файлы аналогично `config.xml` и `config.d/`.
Имя каталога определяется как значение настройки `users_config` без суффикса `.xml` с добавлением `.d`.
Каталог `users.d` используется по умолчанию, так как значение `users_config` по умолчанию равно `users.xml`.

Обратите внимание, что конфигурационные файлы сначала [объединяются](#merging) с учетом настроек, а директивы включения обрабатываются после этого.


## Пример XML {#example}

Например, можно создать отдельный конфигурационный файл для каждого пользователя:

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


## Примеры YAML {#example-1}

Здесь можно посмотреть конфигурацию по умолчанию в формате YAML: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example).

Между форматами YAML и XML существуют некоторые различия в контексте конфигураций ClickHouse.
Ниже приведены рекомендации по написанию конфигурации в формате YAML.

XML-тег с текстовым значением представляется парой ключ-значение в YAML

```yaml
key: value
```

Соответствующий XML:

```xml
<key>value</key>
```

Вложенный XML-узел представляется словарём YAML:

```yaml
map_key:
  key1: val1
  key2: val2
  key3: val3
```

Соответствующий XML:

```xml
<map_key>
    <key1>val1</key1>
    <key2>val2</key2>
    <key3>val3</key3>
</map_key>
```

Для создания одного и того же XML-тега несколько раз используйте последовательность YAML:

```yaml
seq_key:
  - val1
  - val2
  - key1: val3
  - map:
      key2: val4
      key3: val5
```

Соответствующий XML:

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

Для указания XML-атрибута можно использовать ключ атрибута с префиксом `@`. Обратите внимание, что символ `@` зарезервирован стандартом YAML, поэтому его необходимо заключать в двойные кавычки:

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

Также можно использовать атрибуты в последовательности YAML:

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

Описанный выше синтаксис не позволяет представить текстовые XML-узлы с XML-атрибутами в формате YAML. Этот особый случай можно реализовать с помощью ключа атрибута `#text`:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

Соответствующий XML:

```xml
<map_key attr1="value1">value2</map>
```


## Детали реализации {#implementation-details}

Для каждого конфигурационного файла сервер также генерирует файлы `file-preprocessed.xml` при запуске. Эти файлы содержат все выполненные подстановки и переопределения и предназначены для информационных целей. Если в конфигурационных файлах использовались подстановки ZooKeeper, но ZooKeeper недоступен при запуске сервера, сервер загружает конфигурацию из предобработанного файла.

Сервер отслеживает изменения в конфигурационных файлах, а также в файлах и узлах ZooKeeper, которые использовались при выполнении подстановок и переопределений, и перезагружает настройки пользователей и кластеров на лету. Это означает, что можно изменять кластер, пользователей и их настройки без перезапуска сервера.
