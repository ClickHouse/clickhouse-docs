---
slug: '/operations/configuration-files'
sidebar_label: 'Файлы конфигурации'
sidebar_position: 50
description: 'Эта страница объясняет, как сервер ClickHouse может быть сконфигурирован'
title: 'Файлы конфигурации'
doc_type: guide
---
:::note
Профили настроек и файлы конфигурации на основе XML не поддерживаются для ClickHouse Cloud. Таким образом, в ClickHouse Cloud вы не найдете файл config.xml. Вместо этого вам следует использовать SQL команды для управления настройками через профили настроек.

Дополнительные сведения см. в ["Настройка параметров"](/manage/settings)
:::

Сервер ClickHouse может быть настроен с помощью файлов конфигурации в формате XML или YAML.  
В большинстве типов установки сервер ClickHouse работает с `/etc/clickhouse-server/config.xml` в качестве файла конфигурации по умолчанию, но также возможно указать местоположение файла конфигурации вручную при запуске сервера с помощью параметра командной строки `--config-file` или `-C`.  
Дополнительные файлы конфигурации могут быть размещены в директории `config.d/` относительно основного файла конфигурации, например, в директории `/etc/clickhouse-server/config.d/`.  
Файлы в этой директории и основной файл конфигурации объединяются на этапе предварительной обработки перед применением конфигурации в сервере ClickHouse.  
Файлы конфигурации объединяются в алфавитном порядке.  
Для упрощения обновлений и улучшения модульности рекомендуется оставить файл `config.xml` неповрежденным и разместить дополнительные настройки в `config.d/`.  
Конфигурация ClickHouse Keeper хранится в `/etc/clickhouse-keeper/keeper_config.xml`.  
Аналогичным образом, дополнительные файлы конфигурации для Keeper должны быть размещены в `/etc/clickhouse-keeper/keeper_config.d/`.  

Возможно смешивание файлов конфигурации XML и YAML, например, вы можете иметь основной файл конфигурации `config.xml` и дополнительные файлы конфигурации `config.d/network.xml`, `config.d/timezone.yaml` и `config.d/keeper.yaml`.  
Смешивание XML и YAML внутри одного файла конфигурации не поддерживается.  
XML-файлы конфигурации должны использовать `<clickhouse>...</clickhouse>` в качестве верхнего тега.  
В YAML-файлах конфигурации `clickhouse:` является необязательным, если отсутствует, парсер автоматически добавляет его.  

## Объединение конфигурации {#merging}

Два файла конфигурации (обычно основной файл конфигурации и другой файл конфигурации из `config.d/`) объединяются следующим образом:

- Если узел (т.е. путь, ведущий к элементу) присутствует в обоих файлах и не имеет атрибутов `replace` или `remove`, он включается в объединенный файл конфигурации, и дочерние элементы из обоих узлов включаются и объединяются рекурсивно.
- Если один из двух узлов содержит атрибут `replace`, он включается в объединенный файл конфигурации, но только дочерние элементы узла с атрибутом `replace` включаются.
- Если один из двух узлов содержит атрибут `remove`, узел не включается в объединенный файл конфигурации (если он уже существует, он удаляется).

Например, если есть два файла конфигурации:

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

Результирующий объединенный файл конфигурации будет следующим:

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

### Замена значений с помощью переменных окружения и узлов ZooKeeper {#from_env_zk}

Чтобы указать, что значение элемента должно быть заменено значением переменной окружения, вы можете использовать атрибут `from_env`.

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

Результирующая конфигурация будет:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

То же самое возможно и с использованием `from_zk` (узел ZooKeeper):

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

В результате получится следующая конфигурация:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

#### Значения по умолчанию {#default-values}

Элемент с атрибутами `from_env` или `from_zk` может дополнительно содержать атрибут `replace="1"` (последний должен появляться перед `from_env`/`from_zk`).  
В этом случае элемент может определить значение по умолчанию.  
Элемент принимает значение переменной окружения или узла ZooKeeper, если установлено, в противном случае принимает значение по умолчанию.

Предыдущий пример повторяется, но предполагается, что `MAX_QUERY_SIZE` не установлен:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size replace="1" from_env="MAX_QUERY_SIZE">150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

В результате получится конфигурация:

```xml
<clickhouse>
    <profiles>
        <default>
            <max_query_size>150000</max_query_size>
        </default>
    </profiles>
</clickhouse>
```

## Замена содержимого файла {#substitution-with-file-content}

Также возможно заменить части конфигурации содержимым файла. Это можно сделать двумя способами:

- *Замена значений*: Если элемент имеет атрибут `incl`, его значение будет заменено содержимым указанного файла. По умолчанию путь к файлу с заменами — `/etc/metrika.xml`. Это можно изменить в элементе [`include_from`](../operations/server-configuration-parameters/settings.md#include_from) в конфигурации сервера. Значения замен указываются в элементах `/clickhouse/substitution_name` в этом файле. Если замена, указанная в `incl`, не существует, это записывается в журнал. Чтобы предотвратить ведение журнала отсутствующих замен ClickHouse, укажите атрибут `optional="true"` (например, настройки для [макросов](../operations/server-configuration-parameters/settings.md#macros)).
- *Замена элементов*: Если вы хотите заменить весь элемент заменой, используйте `include` в качестве имени элемента. Имя элемента `include` можно комбинировать с атрибутом `from_zk = "/path/to/node"`. В этом случае значение элемента заменяется содержимым узла ZooKeeper по адресу `/path/to/node`. Это также работает, если вы храните целое поддерево XML как узел ZooKeeper, оно будет полностью вставлено в исходный элемент.

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

Если вы хотите объединить заменяющее содержимое с существующей конфигурацией вместо добавления, вы можете использовать атрибут `merge="true"`. Например: `<include from_zk="/some_path" merge="true">`. В этом случае существующая конфигурация будет объединена с содержимым замены, и настройки существующей конфигурации заменятся значениями из замены.

## Шифрование и скрытие конфигурации {#encryption}

Вы можете использовать симметричное шифрование для шифрования элемента конфигурации, например, пароля в открытом виде или закрытого ключа.  
Для этого сначала настройте [кодек шифрования](../sql-reference/statements/create/table.md#encryption-codecs), затем добавьте атрибут `encrypted_by` с названием кодека шифрования в качестве значения к элементу для шифрования.

В отличие от атрибутов `from_zk`, `from_env` и `incl`, или элемента `include`, никакая замена (т.е. расшифровка зашифрованного значения) не выполняется в предварительно обработанном файле.  
Расшифровка происходит только во время выполнения в процессе сервера.

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

Ключи шифрования и зашифрованные значения могут быть определены в любом файле конфигурации.

Пример `config.xml` приведен ниже:

```xml
<clickhouse>

    <encryption_codecs>
        <aes_128_gcm_siv>
            <key_hex from_zk="/clickhouse/aes128_key_hex"/>
        </aes_128_gcm_siv>
    </encryption_codecs>

</clickhouse>
```

Пример `users.xml` приведен ниже:

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

Для шифрования значения вы можете использовать (пример) программу `encrypt_decrypt`:

```bash
./encrypt_decrypt /etc/clickhouse-server/config.xml -e AES_128_GCM_SIV abcd
```

```text
961F000000040000000000EEDDEF4F453CFE6457C4234BD7C09258BD651D85
```

Даже с зашифрованными элементами конфигурации зашифрованные элементы все еще появляются в предварительно обработанном файле конфигурации.  
Если это является проблемой для вашей развертки ClickHouse, есть два варианта: либо установить разрешения на файл предварительно обработанного файла на 600, либо использовать атрибут `hide_in_preprocessed`.

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

Файл `config.xml` может указывать отдельную конфигурацию с настройками пользователей, профилями и квотами. Относительный путь к этой конфигурации устанавливается в элементе `users_config`. По умолчанию это `users.xml`. Если `users_config` опущен, настройки пользователей, профили и квоты указываются непосредственно в `config.xml`.

Конфигурацию пользователей можно разделить на отдельные файлы, аналогично `config.xml` и `config.d/`.  
Имя директории определяется как настройка `users_config` без постфикса `.xml`, соединенного с `.d`.  
Директория `users.d` используется по умолчанию, так как `users_config` по умолчанию указывает на `users.xml`.

Обратите внимание, что файлы конфигурации сначала [объединяются](#merging), учитывая настройки, а затем включения обрабатываются после этого.

## Пример XML {#example}

Например, у вас может быть отдельный файл конфигурации для каждого пользователя, например:

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

Здесь вы можете увидеть конфигурацию по умолчанию, написанную в YAML: [`config.yaml.example`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.yaml.example).

Существует несколько различий между форматами YAML и XML в конфигурациях ClickHouse.  
Советы по написанию конфигурации в формате YAML представлены ниже.

XML-тег с текстовым значением представлен парой ключ-значение в YAML:

```yaml
key: value
```

Соответствующий XML:

```xml
<key>value</key>
```

Вложенный узел XML представлен картой в YAML:

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

Чтобы создать один и тот же XML-тег несколько раз, используйте последовательность YAML:

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

Чтобы указать атрибут XML, вы можете использовать ключ атрибута с префиксом `@`. Обратите внимание, что `@` зарезервирован стандартом YAML, поэтому должен быть заключен в двойные кавычки:

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

Также возможно использовать атрибуты в последовательности YAML:

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

Указанный синтаксис не позволяет выразить текстовые узлы XML с атрибутами XML как YAML. Этот особый случай можно достичь, используя ключ атрибута `#text`:

```yaml
map_key:
  "@attr1": value1
  "#text": value2
```

Соответствующий XML:

```xml
<map_key attr1="value1">value2</map>
```

## Подробности реализации {#implementation-details}

Для каждого файла конфигурации сервер также генерирует файлы `file-preprocessed.xml` при запуске. Эти файлы содержат все завершенные замены и переопределения и предназначены для информационного использования. Если в файлах конфигурации использовались замены ZooKeeper, но ZooKeeper недоступен при старте сервера, сервер загружает конфигурацию из предварительно обработанного файла.

Сервер отслеживает изменения в файлах конфигурации, а также файлах и узлах ZooKeeper, которые использовались при выполнении замен и переопределений, и на лету перезагружает настройки для пользователей и кластеров. Это означает, что вы можете изменять кластер, пользователей и их настройки без перезапуска сервера.