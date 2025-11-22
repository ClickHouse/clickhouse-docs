---
description: 'ClickHouse C++ 开发编码风格指南'
sidebar_label: 'C++ 风格指南'
sidebar_position: 70
slug: /development/style
title: 'C++ 风格指南'
doc_type: 'guide'
---



# C++ 风格指南



## 通用建议 {#general-recommendations}

以下内容为建议而非强制要求。
如果您正在编辑代码,建议遵循现有代码的格式。
代码风格用于保持一致性。一致性使代码更易于阅读和搜索。
许多规则并无逻辑依据,而是由既定实践所决定。


## 格式化 {#formatting}

**1.** 大部分格式化工作由 `clang-format` 自动完成。

**2.** 缩进为 4 个空格。请配置您的开发环境,使制表符添加四个空格。

**3.** 左花括号和右花括号必须单独占一行。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 如果整个函数体是单个 `statement`,可以将其放在一行上。在花括号周围放置空格(行尾的空格除外)。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 对于函数,不要在括号周围放置空格。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** 在 `if`、`for`、`while` 和其他表达式中,在左括号前插入一个空格(与函数调用相反)。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 在二元运算符(`+`、`-`、`*`、`/`、`%` 等)和三元运算符 `?:` 周围添加空格。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 如果需要换行,将运算符放在新行上,并在其前面增加缩进。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 如果需要,可以使用空格在行内进行对齐。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 不要在运算符 `.`、`->` 周围使用空格。

如有必要,可以将运算符换行到下一行。在这种情况下,其前面的缩进会增加。

**11.** 不要使用空格将一元运算符(`--`、`++`、`*`、`&` 等)与参数分隔开。

**12.** 在逗号后放置空格,但不要在其前面放置。`for` 表达式中的分号也遵循相同规则。

**13.** 不要使用空格分隔 `[]` 运算符。

**14.** 在 `template <...>` 表达式中,在 `template` 和 `<` 之间使用空格;`<` 之后或 `>` 之前不要使用空格。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 在类和结构体中,将 `public`、`private` 和 `protected` 与 `class/struct` 写在同一级别,并缩进其余代码。

```cpp
template <typename T>
class MultiVersion
{
public:
    /// 供使用的对象版本。shared_ptr 管理版本的生命周期。
    using Version = std::shared_ptr<const T>;
    ...
}
```

**16.** 如果整个文件使用相同的 `namespace`,并且没有其他重要内容,则 `namespace` 内部不需要缩进。

**17.** 如果 `if`、`for`、`while` 或其他表达式的代码块由单个 `statement` 组成,则花括号是可选的。将 `statement` 放在单独的行上。此规则也适用于嵌套的 `if`、`for`、`while` 等。

但如果内部 `statement` 包含花括号或 `else`,则外部代码块应使用花括号。

```cpp
/// 完成写入。
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行尾不应有任何空格。

**19.** 源文件采用 UTF-8 编码。


**20.** 可以在字符串字面量中使用非ASCII字符。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " 微秒/命中。";
```

**21.** 不要在同一行中编写多个表达式。

**22.** 在函数内将代码分成若干片段，各片段之间最多只用一行空行分隔。

**23.** 使用一到两个空行分隔函数、类等。

**24.** `A const`（与值相关）必须写在类型名之前。

```cpp
//正确
const char * pos
const std::string & s
//不正确
char const * pos
```

**25.** 在声明指针或引用时，`*` 和 `&` 符号的两侧都应加上空格。

```cpp
//正确
const char * pos
//不正确
const char* pos
const char *pos
```

**26.** 在使用模板类型时，使用 `using` 关键字为其定义别名（最简单的情况除外）。

换句话说，模板参数只在 `using` 中指定一次，不会在代码中重复。

`using` 可以在局部作用域中声明，例如在函数内部。

```cpp
//正确
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//不正确
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 不要在同一条语句中声明多个不同类型的变量。

```cpp
//不正确
int x, *y;
```

**28.** 不要使用 C 风格类型转换。

```cpp
//不正确
std::cerr << (int)c <<; std::endl;
//正确
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 在类和结构体中，在每个可见性作用域内分别对成员和函数进行分组。

**30.** 对于小型类和结构体，不必将方法声明与实现分离。

这一点对任意类或结构体中的小型方法同样适用。

对于模板类和结构体，不要将方法声明与实现分离（否则它们必须定义在同一个翻译单元中）。

**31.** 可以在 140 个字符处换行，而不是 80 个字符。

**32.** 如果不需要使用后置形式，一律使用前置自增/自减运算符。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```


## 注释 {#comments}

**1.** 务必为所有非平凡的代码部分添加注释。

这非常重要。编写注释可能会帮助你意识到代码是不必要的,或者设计存在问题。

```cpp
/** Part of piece of memory, that can be used.
  * For example, if internal_buffer is 1MB, and there was only 10 bytes loaded to buffer from file for reading,
  * then working_buffer will have size of only 10 bytes
  * (working_buffer.end() will point to position right after those 10 bytes available for read).
  */
```

**2.** 注释可以根据需要尽可能详细。

**3.** 将注释放在它们所描述的代码之前。在极少数情况下,注释可以放在代码之后的同一行。

```cpp
/** Parses and executes the query.
*/
void executeQuery(
    ReadBuffer & istr, /// Where to read the query from (and data for INSERT, if applicable)
    WriteBuffer & ostr, /// Where to write the result
    Context & context, /// DB, tables, data types, engines, functions, aggregate functions...
    BlockInputStreamPtr & query_plan, /// Here could be written the description on how query was executed
    QueryProcessingStage::Enum stage = QueryProcessingStage::Complete /// Up to which stage process the SELECT query
    )
```

**4.** 注释应仅使用英文编写。

**5.** 如果你正在编写库,请在主头文件中包含详细的注释来解释它。

**6.** 不要添加不提供额外信息的注释。特别是,不要留下这样的空注释:

```cpp
/*
* Procedure Name:
* Original procedure name:
* Author:
* Date of creation:
* Dates of modification:
* Modification authors:
* Original file name:
* Purpose:
* Intent:
* Designation:
* Classes used:
* Constants:
* Local variables:
* Parameters:
* Date of creation:
* Purpose:
*/
```

该示例借鉴自资源 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/。

**7.** 不要在每个文件的开头编写无用的注释(作者、创建日期等)。

**8.** 单行注释以三个斜杠开头:`///`,多行注释以 `/**` 开头。这些注释被视为"文档"。

注意:你可以使用 Doxygen 从这些注释生成文档。但通常不使用 Doxygen,因为在 IDE 中导航代码更方便。

**9.** 多行注释的开头和结尾不得有空行(关闭多行注释的那一行除外)。

**10.** 对于注释掉代码,使用基本注释,而不是"文档"注释。

**11.** 在提交之前删除注释掉的代码部分。

**12.** 不要在注释或代码中使用粗俗语言。

**13.** 不要使用大写字母。不要使用过多的标点符号。

```cpp
/// WHAT THE FAIL???
```

**14.** 不要使用注释来制作分隔符。

```cpp
///******************************************************
```

**15.** 不要在注释中开始讨论。

```cpp
/// Why did you do this stuff?
```

**16.** 无需在代码块末尾编写注释来描述它的内容。

```cpp
/// for
```


## 命名规范 {#names}

**1.** 变量和类成员的名称使用小写字母加下划线。

```cpp
size_t max_block_size;
```

**2.** 函数(方法)的名称使用驼峰命名法,以小写字母开头。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 类(结构体)的名称使用驼峰命名法,以大写字母开头。接口不使用除 I 之外的前缀。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 的命名方式与类相同。

**5.** 模板类型参数的名称:简单情况下使用 `T`;`T`、`U`;`T1`、`T2`。

对于更复杂的情况,可以遵循类名的规则,或添加前缀 `T`。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 模板常量参数的名称:可以遵循变量名的规则,或在简单情况下使用 `N`。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 对于抽象类(接口),可以添加 `I` 前缀。

```cpp
class IProcessor
```

**8.** 如果变量仅在局部使用,可以使用简短名称。

在所有其他情况下,使用能够描述其含义的名称。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` 和全局常量的名称使用全大写字母加下划线。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 文件名应使用与其内容相同的风格。

如果文件包含单个类,则文件名与类名相同(驼峰命名法)。

如果文件包含单个函数,则文件名与函数名相同(驼峰命名法)。

**11.** 如果名称包含缩写,则:

- 对于变量名,缩写应使用小写字母 `mysql_connection`(而不是 `mySQL_connection`)。
- 对于类和函数的名称,保持缩写中的大写字母 `MySQLConnection`(而不是 `MySqlConnection`)。

**12.** 仅用于初始化类成员的构造函数参数应与类成员同名,但在末尾添加下划线。

```cpp
FileQueueProcessor(
    const std::string & path_,
    const std::string & prefix_,
    std::shared_ptr<FileHandler> handler_)
    : path(path_),
    prefix(prefix_),
    handler(handler_),
    log(&Logger::get("FileQueueProcessor"))
{
}
```

如果参数未在构造函数体中使用,则可以省略下划线后缀。

**13.** 局部变量和类成员的名称没有区别(不需要前缀)。

```cpp
timer (not m_timer)
```

**14.** 对于 `enum` 中的常量,使用以大写字母开头的驼峰命名法。全大写字母也可以接受。如果 `enum` 不是局部的,使用 `enum class`。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 所有名称必须使用英文。不允许使用希伯来语单词的音译。

    而不是 T_PAAMAYIM_NEKUDOTAYIM

**16.** 如果缩写是广为人知的(可以在维基百科或搜索引擎中轻松找到缩写的含义),则可以使用缩写。

    `AST`、`SQL`。

    而不是 `NVDH`(一些随机字母)

如果缩短版本是常用的,则可以使用不完整的单词。

如果在注释中包含完整名称,也可以使用缩写。

**17.** C++ 源代码文件名必须使用 `.cpp` 扩展名。头文件必须使用 `.h` 扩展名。


## 如何编写代码 {#how-to-write-code}

**1.** 内存管理。

手动内存释放（`delete`）只能在库代码中使用。

在库代码中，`delete` 操作符只能在析构函数中使用。

在应用程序代码中，内存必须由拥有它的对象释放。

示例：

- 最简单的方法是将对象放在栈上，或使其成为另一个类的成员。
- 对于大量小对象，使用容器。
- 对于堆中少量对象的自动释放，使用 `shared_ptr/unique_ptr`。

**2.** 资源管理。

使用 `RAII`，参见上文。

**3.** 错误处理。

使用异常。在大多数情况下，只需抛出异常，无需捕获（因为有 `RAII`）。

在离线数据处理应用程序中，通常可以不捕获异常。

在处理用户请求的服务器中，通常只需在连接处理程序的顶层捕获异常。

在线程函数中，应该捕获并保留所有异常，以便在 `join` 后在主线程中重新抛出。

```cpp
/// 如果还没有进行任何计算，则同步计算第一个块
if (!started)
{
    calculate();
    started = true;
}
else /// 如果计算已在进行中，则等待结果
    pool.wait();

if (exception)
    exception->rethrow();
```

永远不要在不处理的情况下隐藏异常。永远不要盲目地将所有异常记录到日志中。

```cpp
//不正确
catch (...) {}
```

如果需要忽略某些异常，只对特定的异常这样做，并重新抛出其余的异常。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

当使用带有响应代码或 `errno` 的函数时，始终检查结果并在出错时抛出异常。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "无法关闭文件 {}", file_name);
```

可以使用 assert 来检查代码中的不变量。

**4.** 异常类型。

在应用程序代码中不需要使用复杂的异常层次结构。异常文本应该让系统管理员能够理解。

**5.** 从析构函数抛出异常。

不建议这样做，但允许这样做。

使用以下选项：

- 创建一个函数（`done()` 或 `finalize()`），提前完成所有可能导致异常的工作。如果调用了该函数，则析构函数中以后不应该有异常。
- 过于复杂的任务（例如通过网络发送消息）可以放在单独的方法中，类用户必须在销毁之前调用该方法。
- 如果析构函数中有异常，最好记录它而不是隐藏它（如果日志记录器可用）。
- 在简单的应用程序中，可以依赖 `std::terminate`（对于 C++11 中默认为 `noexcept` 的情况）来处理异常。

**6.** 匿名代码块。

可以在单个函数内创建一个单独的代码块，以使某些变量成为局部变量，从而在退出该块时调用析构函数。

```cpp
Block block = data.in->read();

{
    std::lock_guard<std::mutex> lock(mutex);
    data.ready = true;
    data.block = block;
}

ready_any.set();
```

**7.** 多线程。

在离线数据处理程序中：

- 尝试在单个 CPU 核心上获得最佳性能。然后，如有必要，可以并行化代码。

在服务器应用程序中：

- 使用线程池来处理请求。到目前为止，我们还没有任何需要用户空间上下文切换的任务。

Fork 不用于并行化。

**8.** 线程同步。

通常可以让不同的线程使用不同的内存单元（更好的是：不同的缓存行），并且不使用任何线程同步（除了 `joinAll`）。

如果需要同步，在大多数情况下，使用 `lock_guard` 下的互斥锁就足够了。

在其他情况下，使用系统同步原语。不要使用忙等待。

原子操作应该只在最简单的情况下使用。

除非这是您的主要专业领域，否则不要尝试实现无锁数据结构。

**9.** 指针与引用。

在大多数情况下，优先使用引用。

**10.** `const`。

使用常量引用、指向常量的指针、`const_iterator` 和 `const` 方法。

将 `const` 视为默认值，仅在必要时使用非 `const`。


在按值传递变量时，通常使用 `const` 没有什么意义。

**11.** unsigned。

如有必要，使用 `unsigned`。

**12.** 数值类型。

使用类型 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32` 和 `Int64`，以及 `size_t`、`ssize_t` 和 `ptrdiff_t`。

不要使用这些类型来表示数字：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 传递参数。

如果复杂类型的值后续要被移动，则按值传递并使用 `std::move`；如果你想在循环中更新该值，则按引用传递。

如果函数需要获取在堆上创建的对象的所有权，将参数类型设为 `shared_ptr` 或 `unique_ptr`。

**14.** 返回值。

在大多数情况下，只需使用 `return`。不要写 `return std::move(res)`。

如果函数在堆上分配对象并返回它，使用 `shared_ptr` 或 `unique_ptr`。

在少数情况下（在循环中更新一个值），你可能需要通过参数返回该值。在这种情况下，参数应为引用。

```cpp
using AggregateFunctionPtr = std::shared_ptr<IAggregateFunction>;

/** 允许根据名称创建聚合函数。
  */
class AggregateFunctionFactory
{
public:
    AggregateFunctionFactory();
    AggregateFunctionPtr get(const String & name, const DataTypes & argument_types) const;
```

**15.** `namespace`。

对于应用程序代码，没有必要使用单独的 `namespace`。

小型库也不需要这样做。

对于中大型库，把所有内容都放在同一个 `namespace` 中。

在库的 `.h` 文件中，可以使用 `namespace detail` 来隐藏应用程序代码不需要的实现细节。

在 `.cpp` 文件中，可以使用 `static` 或匿名 `namespace` 来隐藏符号。

此外，`namespace` 也可以用于一个 `enum`，以防止相应的名称泄漏到外部的 `namespace` 中（但更好的做法是使用 `enum class`）。

**16.** 延迟初始化。

如果初始化需要参数，那么通常不应该编写默认构造函数。

如果之后需要延迟初始化，可以添加一个默认构造函数，用于创建一个无效对象。或者，对于数量较少的对象，可以使用 `shared_ptr/unique_ptr`。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// 用于延迟初始化
Loader() {}
```

**17.** 虚函数。

如果类并不打算用于多态场景，就不需要将函数声明为虚函数。这同样适用于析构函数。

**18.** 编码。

在所有地方使用 UTF-8。使用 `std::string` 和 `char *`。不要使用 `std::wstring` 和 `wchar_t`。

**19.** 日志记录。

可在代码各处查看示例。

在提交前，删除所有无意义和调试用途的日志，以及任何其他类型的调试输出。

应避免在循环中进行日志记录，即使是在 Trace 级别。

在任何日志级别下，日志都必须是可读的。

日志记录应主要只在应用程序代码中使用。

日志消息必须用英文书写。

日志最好能被系统管理员理解。

不要在日志中使用粗俗用语。

在日志中使用 UTF-8 编码。在少数情况下，你可以在日志中使用非 ASCII 字符。

**20.** 输入输出。

不要在对应用性能至关重要的内部循环中使用 `iostreams`（并且绝不要使用 `stringstream`）。

请改用 `DB/IO` 库。

**21.** 日期和时间。

参见 `DateLUT` 库。

**22.** include。

始终使用 `#pragma once`，而不是 include 头文件保护宏。

**23.** using。

不要使用 `using namespace`。可以对某些特定标识符使用 `using`，但要将其限制在类或函数的局部范围内。

**24.** 除非必要，不要为函数使用 `trailing return type`。

```cpp
auto f() -> void
```

**25.** 变量声明与初始化。

```cpp
//正确的方式
std::string s = "Hello";
std::string s{"Hello"};

//错误的方式
auto s = std::string{"Hello"};
```

**26.** 对于虚函数，在基类中写 `virtual`，而在派生类中不要再写 `virtual`，而要写成 `override`。


## C++ 中未使用的特性 {#unused-features-of-c}

**1.** 不使用虚继承。

**2.** 现代 C++ 中具有便捷语法糖的构造,例如:

```cpp
// 不使用语法糖的传统方式
template <typename G, typename = std::enable_if_t<std::is_same<G, F>::value, void>> // 通过 std::enable_if 实现 SFINAE,使用 ::value
std::pair<int, int> func(const E<G> & e) // 显式指定返回类型
{
    if (elements.count(e)) // .count() 成员资格测试
    {
        // ...
    }

    elements.erase(
        std::remove_if(
            elements.begin(), elements.end(),
            [&](const auto x){
                return x == 1;
            }),
        elements.end()); // remove-erase 惯用法

    return std::make_pair(1, 2); // 通过 make_pair() 创建 pair
}

// 使用语法糖 (C++14/17/20)
template <typename G>
requires std::same_v<G, F> // 通过 C++20 concept 实现 SFINAE,使用 C++14 模板别名
auto func(const E<G> & e) // auto 返回类型 (C++14)
{
    if (elements.contains(e)) // C++20 .contains 成员资格测试
    {
        // ...
    }

    elements.erase_if(
        elements,
        [&](const auto x){
            return x == 1;
        }); // C++20 std::erase_if

    return {1, 2}; // 或者: return std::pair(1, 2); // 通过初始化列表或值初始化创建 pair (C++17)
}
```


## 平台 {#platform}

**1.** 我们为特定平台编写代码。

但在其他条件相同的情况下,优先选择跨平台或可移植的代码。

**2.** 语言:C++20(参见可用的 [C++20 特性](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)列表)。

**3.** 编译器:`clang`。在撰写本文时(2025年3月),代码使用 clang 版本 >= 19 进行编译。

使用标准库(`libc++`)。

**4.** 操作系统:Linux Ubuntu,版本不低于 Precise。

**5.** 代码针对 x86_64 CPU 架构编写。

CPU 指令集为我们服务器支持的最低指令集。目前为 SSE 4.2。

**6.** 使用 `-Wall -Wextra -Werror -Weverything` 编译标志,少数情况除外。

**7.** 对所有库使用静态链接,难以静态链接的库除外(参见 `ldd` 命令的输出)。

**8.** 代码在发布设置下进行开发和调试。


## 工具 {#tools}

**1.** KDevelop 是一个优秀的 IDE。

**2.** 调试时,使用 `gdb`、`valgrind`(`memcheck`)、`strace`、`-fsanitize=...` 或 `tcmalloc_minimal_debug`。

**3.** 性能分析时,使用 `Linux Perf`、`valgrind`(`callgrind`)或 `strace -cf`。

**4.** 源代码托管在 Git 中。

**5.** 使用 `CMake` 进行构建。

**6.** 程序通过 `deb` 软件包发布。

**7.** 提交到 master 分支的代码不得破坏构建。

但只有选定的修订版本被认为是可用的。

**8.** 尽可能频繁地提交代码,即使代码只是部分完成。

为此请使用分支。

如果您在 `master` 分支中的代码尚不可构建,请在 `push` 之前将其从构建中排除。您需要在几天内完成或删除它。

**9.** 对于非简单的更改,请使用分支并将其发布到服务器上。

**10.** 未使用的代码会从代码仓库中删除。


## 库 {#libraries}

**1.** 使用 C++20 标准库(允许实验性扩展),以及 `boost` 和 `Poco` 框架。

**2.** 不允许使用操作系统软件包中的库,也不允许使用预安装的库。所有库都应以源代码形式放置在 `contrib` 目录中,并与 ClickHouse 一起构建。详情请参阅[添加新第三方库的指南](/development/contrib#adding-and-maintaining-third-party-libraries)。

**3.** 始终优先使用已经在用的库。


## 通用建议 {#general-recommendations-1}

**1.** 尽可能少写代码。

**2.** 尝试最简单的解决方案。

**3.** 在了解代码的工作原理和内部循环的运行方式之前,不要编写代码。

**4.** 在最简单的情况下,使用 `using` 而不是类或结构体。

**5.** 如果可能,不要编写拷贝构造函数、赋值运算符、析构函数(除非是虚析构函数,当类包含至少一个虚函数时)、移动构造函数或移动赋值运算符。换句话说,编译器生成的函数必须能够正确工作。可以使用 `default`。

**6.** 鼓励简化代码。尽可能减少代码量。


## 其他建议 {#additional-recommendations}

**1.** 不建议为 `stddef.h` 中的类型显式指定 `std::`

换句话说,我们建议使用 `size_t` 而不是 `std::size_t`,因为前者更简洁。

可以添加 `std::`。

**2.** 不建议为标准 C 库中的函数显式指定 `std::`

换句话说,应使用 `memcpy` 而不是 `std::memcpy`。

原因是存在类似的非标准函数,例如 `memmem`。我们偶尔会使用这些函数。这些函数不存在于 `namespace std` 中。

如果到处都使用 `std::memcpy` 而不是 `memcpy`,那么不带 `std::` 的 `memmem` 看起来会很不协调。

尽管如此,如果你更倾向于使用 `std::`,仍然可以使用。

**3.** 当标准 C++ 库中有相同的函数时使用 C 函数。

如果这样做更高效,则是可以接受的。

例如,在复制大块内存时使用 `memcpy` 而不是 `std::copy`。

**4.** 多行函数参数。

允许使用以下任何一种换行风格:

```cpp
function(
  T1 x1,
  T2 x2)
```

```cpp
function(
  size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

```cpp
function(size_t left, size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```

```cpp
function(
      size_t left,
      size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```
