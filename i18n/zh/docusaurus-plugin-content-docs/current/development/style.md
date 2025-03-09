---
slug: /development/style
sidebar_position: 70
sidebar_label: C++ 风格指南
---


# C++ 风格指南

## 一般建议 {#general-recommendations}

以下是建议，而不是要求。
如果您正在编辑代码，遵循现有代码的格式很有意义。
代码风格是为了保持一致性。一致性使代码更易于阅读，也使搜索代码更容易。
许多规则没有逻辑原因；它们是由既定的实践所决定的。

## 格式化 {#formatting}

**1.** 大多数格式化由 `clang-format` 自动完成。

**2.** 缩进为 4 个空格。配置您的开发环境，使制表符添加四个空格。

**3.** 开放和闭合的花括号必须在单独的行上。

``` cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 如果整个函数体是一个单一的 `statement`，可以放在一行上。在花括号周围加上空格（除了行末的空格）。

``` cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 对于函数。不要在括号周围加空格。

``` cpp
void reinsert(const Value & x)
```

``` cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** 在 `if`、`for`、`while` 和其他表达式中，在开放括号前插入一个空格（与函数调用不同）。

``` cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 在二元运算符（`+`、`-`、`*`、`/`、`%` 等）和三元运算符 `?:` 周围添加空格。

``` cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 如果换行，运算符放在新行并增加缩进。

``` cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " rows/s., "
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/s.) ";
```

**9.** 如果需要，您可以在行内使用空格进行对齐。

``` cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 不要在运算符`.`、`->`周围使用空格。

如果需要，运算符可以换行。在这种情况下，它前面的偏移量增加。

**11.** 在一元运算符（`--`、`++`、`*`、`&` 等）与参数之间不要用空格分隔。

**12.** 在逗号后面加一个空格，但之前不要加。此规则同样适用于 `for` 表达式内的分号。

**13.** 不要用空格分隔 `[]` 运算符。

**14.** 在 `template <...>` 表达式中，在 `template` 和 `<` 之间使用空格；在 `<` 之后和 `>` 之前都不加空格。

``` cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 在类和结构中，将 `public`、`private` 和 `protected` 与 `class/struct` 对齐，并缩进其余代码。

``` cpp
template <typename T>
class MultiVersion
{
public:
    /// 对象的版本供使用。shared_ptr 管理版本的生命周期。
    using Version = std::shared_ptr<const T>;
    ...
}
```

**16.** 如果整个文件使用相同的 `namespace`，并且没有其他显著内容，则在 `namespace` 内部不需要偏移。

**17.** 如果 `if`、`for`、`while` 或其他表达式的块只包含一个 `statement`，则花括号是可选的。将 `statement` 放在单独的行上。此规则对于嵌套的 `if`、`for`、`while` 也是有效的。

但是如果内置 `statement` 包含花括号或 `else`，则外部块应写在花括号内。

``` cpp
/// 完成写入。
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行末不应有任何空格。

**19.** 源文件应为 UTF-8 编码。

**20.** 字符串字面量中可以使用非 ASCII 字符。

``` cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 不要在一行中写多个表达式。

**22.** 在函数内部将代码块分组，并用不超过一行空行将它们分开。

**23.** 用一行或两行空行分隔函数、类等。

**24.** `A const`（与值相关）必须在类型名称之前书写。

``` cpp
//正确
const char * pos
const std::string & s
//错误
char const * pos
```

**25.** 在声明指针或引用时，`*` 和 `&` 符号两侧应隔开空格。

``` cpp
//正确
const char * pos
//错误
const char* pos
const char *pos
```

**26.** 使用模板类型时，使用 `using` 关键字对其进行别名（在最简单的情况下除外）。

换句话说，模板参数只在 `using` 中指定，而不在代码中重复。

`using` 可以在局部声明，例如在函数内部。

``` cpp
//正确
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//错误
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 不要在一条语句中声明多个不同类型的变量。

``` cpp
//错误
int x, *y;
```

**28.** 不要使用 C 风格的强制转换。

``` cpp
//错误
std::cerr << (int)c <<; std::endl;
//正确
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 在类和结构中，在每个可见性作用域内分别分组成员和函数。

**30.** 对于小类和结构，没有必要将方法声明与实现分开。

对于任何类或结构中的小方法也是如此。

对于模板类和结构，不要将方法声明与实现分开（因为否则必须在同一翻译单元中定义它们）。

**31.** 您可以在 140 个字符处换行，而不是 80 个。

**32.** 如果不需要后缀增量/减量运算符，始终使用前缀增量/减量运算符。

``` cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```

## 注释 {#comments}

**1.** 确保为所有非平凡部分的代码添加注释。

这非常重要。写下注释可能会帮助您意识到代码是不必要的，或者设计得不正确。

``` cpp
/** 可以使用的内存块的一部分。
  * 例如，如果 internal_buffer 为 1MB，并且从文件中只加载了 10 字节到缓存中进行读取，
  * 那么 working_buffer 的大小将只有 10 字节
  * （working_buffer.end() 将指向那些 10 字节可供读取后的位置）。
  */
```

**2.** 注释可以详细到所需的程度。

**3.** 在描述它们的代码之前放置注释。在少数情况下，注释可以在代码之后，置于同一行。

``` cpp
/** 解析并执行查询。
*/
void executeQuery(
    ReadBuffer & istr, /// 从哪里读取查询（以及 INSERT 的数据，如果适用的话）
    WriteBuffer & ostr, /// 写入结果的地方
    Context & context, /// 数据库、表、数据类型、引擎、函数、聚合函数...
    BlockInputStreamPtr & query_plan, /// 这里可以写下有关查询是如何执行的描述
    QueryProcessingStage::Enum stage = QueryProcessingStage::Complete /// 处理 SELECT 查询的阶段
)
```

**4.** 注释应仅使用英语编写。

**5.** 如果您在编写库，请在主头文件中包含详细说明的注释。

**6.** 不要添加不提供额外信息的注释。特别是，不要留下像这样的空注释：

``` cpp
/*
* 过程名称：
* 原始过程名称：
* 作者：
* 创建日期：
* 修改日期：
* 修改作者：
* 原始文件名：
* 目的：
* 意图：
* 归属：
* 使用的类：
* 常量：
* 局部变量：
* 参数：
* 创建日期：
* 目的：
*/
```

该示例取自资源 http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/.

**7.** 不要在每个文件的开头写垃圾注释（作者、创建日期..）。

**8.** 单行注释以三个斜杠开头：`///`，多行注释以 `/**` 开头。这些注释被视为“文档”。

注意：您可以使用 Doxygen 从这些注释生成文档。但是，Doxygen 通常不被使用，因为在 IDE 中导航代码更方便。

**9.** 多行注释的开头和结尾不得有空行（闭合多行注释的行除外）。

**10.** 对于注释掉的代码，使用基本注释，而不是“文档”注释。

**11.** 在提交之前删除被注释掉的代码部分。

**12.** 注释或代码中不要使用粗俗语言。

**13.** 不要使用大写字母。不要使用过多的标点符号。

``` cpp
/// 这搞什么鬼？？？
```

**14.** 不要使用注释来作为分隔符。

``` cpp
///******************************************************
```

**15.** 不要在注释中开始讨论。

``` cpp
/// 你为什么要这样做？
```

**16.** 不需要在块的末尾写注释来描述它的内容。

``` cpp
/// for
```

## 命名 {#names}

**1.** 在变量和类成员的名称中使用小写字母和下划线。

``` cpp
size_t max_block_size;
```

**2.** 对于函数（方法）的名称，使用小写字母开头的 camelCase。

``` cpp
std::string getName() const override { return "Memory"; }
```

**3.** 对于类（结构）的名称，使用以大写字母开头的 CamelCase。接口不使用 I 以外的前缀。

``` cpp
class StorageMemory : public IStorage
```

**4.** `using` 的命名方式与类相同。

**5.** 模板类型参数的名称：在简单的情况下，使用 `T`；`T`、`U`；`T1`、`T2`。

在更复杂的情况下，遵循类名的规则，或添加前缀 `T`。

``` cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 模板常量参数的名称：既可以遵循变量名称的规则，也可以在简单情况下使用 `N`。

``` cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 对于抽象类（接口），可以添加 `I` 前缀。

``` cpp
class IProcessor
```

**8.** 如果您在本地使用变量，可以使用简短的名称。

在所有其他情况下，使用描述其含义的名称。

``` cpp
bool info_successfully_loaded = false;
```

**9.** `define` 和全局常量的名称使用全大写字母和下划线。

``` cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 文件名应使用与内容相同的风格。

如果文件只包含一个类，则将文件命名为与类相同的名称（CamelCase）。

如果文件只包含一个函数，则将文件命名为与函数相同的名称（camelCase）。

**11.** 如果名称包含缩写，则：

- 对于变量名称，缩写应使用小写字母 `mysql_connection`（而不是 `mySQL_connection`）。
- 对于类和函数的名称，保留缩写中的大写字母 `MySQLConnection`（而不是 `MySqlConnection`）。

**12.** 仅用于初始化类成员的构造函数参数应与类成员同名，但后面加上下划线。

``` cpp
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

如果参数未在构造函数主体中使用，则可以省略下划线后缀。

**13.** 局部变量和类成员的名称没有区别（不需要前缀）。

``` cpp
timer（而不是 m_timer）
```

**14.** 对于 `enum` 中的常量，使用 CamelCase 及大写字母。全大写也是可以的。如果 `enum` 不是局部的，使用 `enum class`。

``` cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 所有名称必须使用英语。不允许转录希伯来语单词。

    不是 T_PAAMAYIM_NEKUDOTAYIM

**16.** 缩写是可以接受的，只要它们是众所周知的（当您可以很容易地在维基百科或搜索引擎中找到缩写的含义时）。

    `AST`、`SQL`。

    不是 `NVDH`（一些随机字母）

不完全单词是可接受的，只要缩短版本是常用的。

如果缩写旁边包含全名，可以使用缩写。

**17.** C++ 源代码的文件名必须具有 `.cpp` 扩展名。头文件必须具有 `.h` 扩展名。

## 如何编写代码 {#how-to-write-code}

**1.** 内存管理。

手动内存释放（`delete`）只能在库代码中使用。

在库代码中，`delete` 操作符只能在析构函数中使用。

在应用程序代码中，内存必须由拥有它的对象释放。

示例：

- 最简单的方法是将对象放在栈上，或将其成为另一个类的成员。
- 对于大量小对象，使用容器。
- 对于少量对象的自动释放，可以使用 `shared_ptr/unique_ptr`。

**2.** 资源管理。

使用 `RAII`，详见上述内容。

**3.** 错误处理。

使用异常。在大多数情况下，您只需抛出异常，而不需要捕获它（因为 `RAII`）。

在离线数据处理应用程序中，通常可以不捕获异常。

在处理用户请求的服务器中，通常只需在连接处理程序的顶层捕获异常即可。

在线程函数中，您应捕获和保存所有异常，在 `join` 后重新抛出。

``` cpp
/// 如果尚未进行任何计算，则同步计算第一个块
if (!started)
{
    calculate();
    started = true;
}
else /// 如果计算已经在进行中，则等待结果
    pool.wait();

if (exception)
    exception->rethrow();
```

永远不要在未处理的情况下隐藏异常。永远不要盲目将所有异常记录下来。

``` cpp
//错误
catch (...) {}
```

如果您需要忽略某些异常，则仅对特定异常执行此操作，并重新抛出其余异常。

``` cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

在使用带有响应代码或 `errno` 的函数时，始终检查结果，并在出现错误时抛出异常。

``` cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "Cannot close file {}", file_name);
```

您可以使用 assert 来检查代码中的不变性。

**4.** 异常类型。

在应用程序代码中没有必要使用复杂的异常层次结构。异常文本应对系统管理员来说是易于理解的。

**5.** 从析构函数抛出异常。

这不推荐，但允许。

使用以下选项：

- 创建一个函数（`done()` 或 `finalize()`），提前完成可能导致异常的所有工作。如果调用了该函数，那么在析构函数中不应该有异常。
- 过于复杂的任务（例如通过网络发送消息）可以放在单独的方法中，类的使用者必须在销毁之前调用。
- 如果析构函数中有异常，更好地记录它而不是隐藏它（如果logger可用）。
- 在简单应用程序中，可以依赖 `std::terminate`（对于默认情况下为 `noexcept` 的 C++11）来处理异常。

**6.** 匿名代码块。

您可以在单个函数内部创建一个单独的代码块，以使特定变量局部，以便析构函数在退出该块时被调用。

``` cpp
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

- 尽量在单个 CPU 核心上获得尽可能好的性能。如果有必要，您可以并行化代码。

在服务器应用程序中：

- 使用线程池处理请求。到目前为止，我们没有处理需要用户空间上下文切换的任务。

不使用 Fork 进行并行化。

**8.** 线程同步。

通常可以让不同线程使用不同的内存单元（甚至更好：不同的缓存行），并且不使用任何线程同步（除非 `joinAll`）。

如果需要同步，在大多数情况下，仅使用 `lock_guard` 下的互斥锁就足够了。

在其他情况下使用系统同步原语。不使用忙等待。

仅在最简单的情况下使用原子操作。

不要尝试实现无锁数据结构，除非这是您主要的专业领域。

**9.** 指针与引用。

在大多数情况下，首选引用。

**10.** `const`。

使用常量引用、指向常量的指针、`const_iterator` 和 `const` 方法。

将 `const` 视为默认，仅在必要时使用非 `const`。

在通过值传递变量时，使用 `const` 通常没有意义。

**11.** unsigned。

如有必要使用 `unsigned`。

**12.** 数字类型。

使用 `UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32` 和 `Int64`，以及 `size_t`、`ssize_t` 和 `ptrdiff_t`。

不要使用这些类型表示数字：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 传递参数。

如果要移动复杂值，则按值传递；如果要在循环中更新值，则按引用传递。

如果函数捕获了在堆中创建的对象的所有权，将参数类型设为 `shared_ptr` 或 `unique_ptr`。

**14.** 返回值。

在大多数情况下，只需使用 `return`。不要写 `return std::move(res)`。

如果函数在堆上分配对象并返回它，则使用 `shared_ptr` 或 `unique_ptr`。

在少数情况下（在循环中更新值），可能需要通过参数返回值。在这种情况下，参数应为引用。

``` cpp
using AggregateFunctionPtr = std::shared_ptr<IAggregateFunction>;

/** 允许通过其名称创建聚合函数。
  */
class AggregateFunctionFactory
{
public:
    AggregateFunctionFactory();
    AggregateFunctionPtr get(const String & name, const DataTypes & argument_types) const;
```

**15.** `namespace`。

在应用程序代码中不需要使用单独的 `namespace`。

小型库也无需这样做。

对于中大型库，将所有内容放在一个 `namespace` 中。

在库的 `.h` 文件中，您可以使用 `namespace detail` 来隐藏应用程序代码中不需要的实现细节。

在 `.cpp` 文件中，您可以使用 `static` 或匿名 `namespace` 来隐藏符号。

此外，还可以将 `namespace` 用于 `enum`，以防止相应的名称落入外部 `namespace`（但更好的是使用 `enum class`）。

**16.** 延迟初始化。

如果需要初始化的参数，那么通常不应编写默认构造函数。

如果之后需要延迟初始化，可以添加一个默认构造函数，该构造函数将创建一个无效对象。或者，对于少量对象，可以使用 `shared_ptr/unique_ptr`。

``` cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// 用于延迟初始化
Loader() {}
```

**17.** 虚函数。

如果类不打算用于多态，则无须使函数为虚函数。这同样适用于析构函数。

**18.** 编码。

请在所有地方使用 UTF-8。使用 `std::string` 和 `char *`。不使用 `std::wstring` 和 `wchar_t`。

**19.** 日志记录。

请参见代码中的示例。

在提交之前，删除所有无意义的调试日志和任何其他类型的调试输出。

在循环中记录日志应避免，即使是在 Trace 级别。

在任何日志级别下，日志都必须具有可读性。

日志通常只能在应用程序代码中使用。

日志消息必须用英语书写。

日志应尽可能易于系统管理员理解。

日志中不得使用粗俗语言。

在日志中使用 UTF-8 编码。在少数情况下可以使用非 ASCII 字符。

**20.** 输入输出。

在对应用程序性能至关重要的内部循环中，不要使用 `iostreams`（并且永远不要使用 `stringstream`）。

请使用 `DB/IO` 库。

**21.** 日期和时间。

请参见 `DateLUT` 库。

**22.** 包含。

始终使用 `#pragma once` 而不是包含保护。

**23.** 使用。

不使用 `using namespace`。您可以在特定内容中使用 `using`，但请将其放置在类或函数内部。

**24.** 除非必要，否则不要为函数使用 `trailing return type`。

``` cpp
auto f() -> void
```

**25.** 变量的声明和初始化。

``` cpp
//正确的方式
std::string s = "Hello";
std::string s{"Hello"};

//错误的方式
auto s = std::string{"Hello"};
```

**26.** 对于虚函数，在基类中写 `virtual`，但在派生类中写 `override`，而不是 `virtual`。

## C++ 的未使用特性 {#unused-features-of-c}

**1.** 不使用虚继承。

**2.** 在现代 C++ 中具有方便语法糖的构造，例如：

```cpp
// 传统方法没有语法糖
template <typename G, typename = std::enable_if_t<std::is_same<G, F>::value, void>> // 通过 std::enable_if 进行 SFINAE，使用 ::value
std::pair<int, int> func(const E<G> & e) // 明确指定返回类型
{
    if (elements.count(e)) // .count() 成员测试
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

    return std::make_pair(1, 2); // 通过 make_pair() 创建对
}

// 使用语法糖（C++14/17/20）
template <typename G>
requires std::same_v<G, F> // 通过 C++20 概念进行 SFINAE，使用 C++14 模板别名
auto func(const E<G> & e) // auto 返回类型（C++14）
{
    if (elements.contains(e)) // C++20 .contains 成员测试
    {
        // ...
    }

    elements.erase_if(
        elements,
        [&](const auto x){
            return x == 1;
        }); // C++20 std::erase_if

    return {1, 2}; // 或：返回 std::pair(1, 2); // 通过初始化列表或值初始化（C++17）创建对
}
```

## 平台 {#platform}

**1.** 我们为特定平台编写代码。

但在其他条件相同的情况下，优先选择跨平台或可移植代码。

**2.** 语言：C++20（请参见可用的 [C++20 特性](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)）。

**3.** 编译器：`clang`。撰写时（2025 年 3 月），代码使用 clang 版本 >= 19 编译。

使用标准库（`libc++`）。

**4.** 操作系统：Linux Ubuntu，不早于 Precise。

**5.** 代码是为 x86_64 CPU 架构编写的。

CPU 指令集是我们服务器中最低的支持集。目前，它是 SSE 4.2。

**6.** 使用 `-Wall -Wextra -Werror -Weverything` 编译标志，但有一些例外。

**7.** 除了那些难以静态链接的库外，使用静态链接的所有库（见 `ldd` 命令的输出）。

**8.** 代码在发布设置下开发和调试。

## 工具 {#tools}

**1.** KDevelop 是一个很好的 IDE。

**2.** 对于调试，使用 `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...` 或 `tcmalloc_minimal_debug`。

**3.** 对于性能分析，使用 `Linux Perf`、`valgrind`（`callgrind`）或 `strace -cf`。

**4.** 源代码在 Git 中。

**5.** 汇编使用 `CMake`。

**6.** 程序以 `deb` 包形式发布。

**7.** 提交到 master 的代码不得破坏构建。

尽管仅选定的修订被认为是可工作的。

**8.** 尽可能频繁地提交，即使代码仅部分完成。

为此使用分支。

如果您在 `master` 分支中的代码尚未可构建，请在 `push` 之前将其排除在构建之外。您需要在几天内完成它或删除它。

**9.** 对于非平凡的更改，使用分支并在服务器上发布。

**10.** 未使用的代码从代码库中删除。

## 库 {#libraries}

**1.** 使用 C++20 标准库（允许实验性扩展），以及 `boost` 和 `Poco` 框架。

**2.** 不允许使用 OS 包中的库。不允许使用预安装的库。所有库应以源代码形式放置在 `contrib` 目录中，并与 ClickHouse 一起构建。有关详细信息，请参见 [添加和维护第三方库的指南](/development/contrib#adding-and-maintaining-third-party-libraries)。

**3.** 总是优先考虑已经在使用的库。

## 一般建议 {#general-recommendations-1}

**1.** 尽量编写尽可能少的代码。

**2.** 尝试最简单的解决方案。

**3.** 在您知道代码将如何工作以及内部循环将如何运作之前，不要编写代码。

**4.** 在最简单的情况下，使用 `using` 而不是类或结构。

**5.** 如果可能，不要编写复制构造函数、赋值运算符、析构函数（除非是虚拟的，如果类包含至少一个虚拟函数）、移动构造函数或移动赋值运算符。换句话说，编译器生成的函数必须正常工作。您可以使用 `default`。

**6.** 鼓励代码简化。在可能的情况下减少代码的大小。

## 附加建议 {#additional-recommendations}

**1.** 明确指定 `std::` 对于来自 `stddef.h` 的类型

是不推荐的。换句话说，我们建议编写 `size_t` 而不是 `std::size_t`，因为它更简短。

可以添加 `std::`。

**2.** 明确指定 `std::` 对于标准 C 库的函数

是不推荐的。换句话说，写 `memcpy` 而不是 `std::memcpy`。

原因是有一些类似的非标准函数，例如 `memmem`。我们确实会偶尔使用这些函数。这些函数在 `namespace std` 中不存在。

如果您到处都写 `std::memcpy` 而不是 `memcpy`，那么没有 `std::` 的 `memmem` 看起来将会很奇怪。

尽管如此，如果您喜欢，它仍然可以使用 `std::`。

**3.** 使用 C 的函数，当标准 C++ 库中有相同的函数可用时。

如果效率更高，这是可以接受的。

例如，使用 `memcpy` 而不是 `std::copy` 来复制大型内存块。

**4.** 多行函数参数。

允许以下任意一种换行风格：

``` cpp
function(
  T1 x1,
  T2 x2)
```

``` cpp
function(
  size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

``` cpp
function(size_t left, size_t right,
  const & RangesInDataParts ranges,
  size_t limit)
```

``` cpp
function(size_t left, size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```

``` cpp
function(
      size_t left,
      size_t right,
      const & RangesInDataParts ranges,
      size_t limit)
```
