---
title: 'Загрузить CSV Файл'
slug: /integrations/migration/upload-a-csv-file
description: 'Узнайте о загрузке CSV файла'
---

import Image from '@theme/IdealImage';
import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# Загрузить CSV Файл

Вы можете загрузить CSV или TSV файл, который содержит строку заголовка с именами колонок, и ClickHouse предварительно обработает партию
строк для вывода типов данных колонок, а затем вставит строки в новую таблицу.

1. Начните с перехода на страницу **Details** вашего сервиса ClickHouse Cloud:

<Image img={uploadcsv1} size='md' alt='Страница Details' />

2. Выберите **Load data** из выпадающего меню **Actions**:

<Image img={uploadcsv2} size='sm' alt='Добавить данные'/>

3. Нажмите кнопку **File upload** на странице **Datasources** и выберите файл, который вы хотите загрузить, в появившемся диалоговом окне. Нажмите **Open**, чтобы продолжить (Пример ниже на macOS, для других операционных систем может отличаться).

<Image img={uploadcsv3} size='md' alt='Выберите файл для загрузки' />

4. ClickHouse показывает вам типы данных, которые он вывел.

<Image img={uploadcsv4} size='md' alt='Выведенные типы данных' />

5. ***Введите новое имя таблицы*** для вставки данных, затем нажмите кнопку **Import to ClickHouse**.

<Image img={uploadcsv5} size='md' alt='Выберите файл для загрузки'/>

6. Подключитесь к вашему сервису ClickHouse, убедитесь, что таблица была успешно создана, и ваши данные готовы к использованию! Если вы хотите визуализировать ваши данные, ознакомьтесь с некоторыми [инструментами BI](../data-visualization/index.md), которые могут легко подключаться к ClickHouse.
