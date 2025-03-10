---
title: 'Загрузить CSV файл'
---

import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# Загрузить CSV файл

Вы можете загрузить CSV или TSV файл, содержащий строку заголовка с названиями колонок, и ClickHouse предварительно обработает партию 
строк для вывода типов данных колонок, а затем вставит строки в новую таблицу.

1. Начните с перехода на страницу **Подробности** вашего сервиса ClickHouse Cloud:

<img src={uploadcsv1} class="image" alt="Страница подробностей" />

2. Выберите **Загрузить данные** из выпадающего меню **Действия**:

<img src={uploadcsv2} class="image" alt="Добавить данные" />

3. Нажмите кнопку **Загрузка файла** на странице **Источники данных** и выберите файл для загрузки в появившемся диалоговом окне. Нажмите **Открыть**, чтобы продолжить (пример ниже на macOS, другие операционные системы могут отличаться).

<img src={uploadcsv3} class="image" alt="Выберите файл для загрузки" />

4. ClickHouse покажет вам типы данных, которые он вывел.

<img src={uploadcsv4} class="image" alt="Выведенные типы данных" />

5. ***Введите новое имя таблицы*** для вставки данных, затем нажмите кнопку **Импорт в ClickHouse**.

<img src={uploadcsv5} class="image" alt="Выберите файл для загрузки" />

6. Подключитесь к вашему сервису ClickHouse, убедитесь, что таблица была успешно создана, и ваши данные готовы к использованию! Если вы хотите визуализировать ваши данные, ознакомьтесь с некоторыми [BI инструментами](../data-visualization/index.md), которые могут легко подключаться к ClickHouse.
