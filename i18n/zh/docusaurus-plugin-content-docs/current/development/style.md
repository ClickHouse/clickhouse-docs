---
description: 'ClickHouse C++ 代码风格指南'
sidebar_label: 'C++ 风格指南'
sidebar_position: 70
slug: /development/style
title: 'C++ 风格指南'
doc_type: 'guide'
---



# C++ 编码风格指南



## 通用建议 {#general-recommendations}

以下内容是建议，非强制要求。
如果你在编辑代码，遵循现有代码的格式通常是更合理的做法。
代码风格的目的是保持一致性。一致性可以让代码更易阅读，也更便于在代码中搜索。
许多规则并没有严格的逻辑依据；更多是由既有实践所约定的。



## 格式

**1.** 大部分格式由 `clang-format` 自动完成。

**2.** 缩进为 4 个空格。请将你的开发环境配置为按一次 Tab 键插入四个空格。

**3.** 花括号的起始和结束必须各自单独占一行。

```cpp
inline void readBoolText(bool & x, ReadBuffer & buf)
{
    char tmp = '0';
    readChar(tmp, buf);
    x = tmp != '0';
}
```

**4.** 如果整个函数体只有一个 `statement`，则可以将其写在一行内。在花括号两侧添加空格（行末已有的空格除外）。

```cpp
inline size_t mask() const                { return buf_size() - 1; }
inline size_t place(HashValue x) const    { return x & mask(); }
```

**5.** 在函数中，括号内外不要加空格。

```cpp
void reinsert(const Value & x)
```

```cpp
memcpy(&buf[place_value], &x, sizeof(x));
```

**6.** 在 `if`、`for`、`while` 等表达式中，在左圆括号前加一个空格（与函数调用不同）。

```cpp
for (size_t i = 0; i < rows; i += storage.index_granularity)
```

**7.** 在二元运算符（`+`、`-`、`*`、`/`、`%` 等）和三元运算符 `?:` 的两侧添加空格。

```cpp
UInt16 year = (s[0] - '0') * 1000 + (s[1] - '0') * 100 + (s[2] - '0') * 10 + (s[3] - '0');
UInt8 month = (s[5] - '0') * 10 + (s[6] - '0');
UInt8 day = (s[8] - '0') * 10 + (s[9] - '0');
```

**8.** 如果输入换行符，应将运算符放在新的一行开头，并在其前面增加缩进。

```cpp
if (elapsed_ns)
    message << " ("
        << rows_read_on_server * 1000000000 / elapsed_ns << " 行/秒，"
        << bytes_read_on_server * 1000.0 / elapsed_ns << " MB/秒）";
```

**9.** 如有需要，可以在同一行内使用空格进行对齐。

```cpp
dst.ClickLogID         = click.LogID;
dst.ClickEventID       = click.EventID;
dst.ClickGoodEvent     = click.GoodEvent;
```

**10.** 不要在运算符 `.`、`->` 两侧使用空格。

如有必要，可以将运算符换行到下一行。在这种情况下，应增加运算符前面的缩进。

**11.** 不要使用空格将一元运算符（`--`、`++`、`*`、`&` 等）与其操作数分开。

**12.** 逗号后面加一个空格，前面不要加空格。`for` 表达式中的分号也遵循同样的规则。

**13.** 不要在 `[]` 运算符两侧使用空格。

**14.** 在 `template <...>` 表达式中，在 `template` 和 `<` 之间使用一个空格；在 `<` 之后和 `>` 之前不要使用空格。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
{}
```

**15.** 在类和结构中，将 `public`、`private` 和 `protected` 与 `class/struct` 保持同一缩进级别，其余代码再向内缩进。

```cpp
template <typename T>
class MultiVersion
{
public:
    /// 用于使用的对象版本。shared_ptr 管理版本的生命周期。
    using Version = std::shared_ptr<const T>;
    ...
}
```

**16.** 如果整个文件使用相同的 `namespace`，且没有其他特殊之处，则在 `namespace` 内不需要再增加缩进层级。

**17.** 如果 `if`、`for`、`while` 或其他表达式的代码块只包含单个 `statement`，则花括号是可选的。将该 `statement` 单独放在一行即可。此规则同样适用于嵌套的 `if`、`for`、`while` 等。

但如果内部的 `statement` 本身包含花括号或 `else`，则外层代码块应使用花括号书写。

```cpp
/// 完成写入操作。
for (auto & stream : streams)
    stream.second->finalize();
```

**18.** 行尾不应包含任何尾随空格。

**19.** 源文件采用 UTF-8 编码。


**20.** 字符串字面量中可以使用非 ASCII 字符。

```cpp
<< ", " << (timer.elapsed() / chunks_stats.hits) << " μsec/hit.";
```

**21.** 不要在同一行写多个表达式。

**22.** 将函数内部的代码按区块分组，区块之间最多用一行空行分隔。

**23.** 使用一到两行空行分隔函数、类等结构。

**24.** 与值相关的 `A const` 必须写在类型名之前。

```cpp
//正确
const char * pos
const std::string & s
//不正确
char const * pos
```

**25.** 在声明指针或引用时，`*` 和 `&` 符号左右两侧都应有空格。

```cpp
//正确
const char * pos
//错误
const char* pos
const char *pos
```

**26.** 使用模板类型时，除最简单的情况外，请使用 `using` 关键字为其定义别名。

换句话说，模板参数只在 `using` 中指定，不会在代码的其他地方重复出现。

`using` 可以在局部作用域中声明，例如在函数内部。

```cpp
//正确
using FileStreams = std::map<std::string, std::shared_ptr<Stream>>;
FileStreams streams;
//错误
std::map<std::string, std::shared_ptr<Stream>> streams;
```

**27.** 不要在同一条语句中同时声明多个不同类型的变量。

```cpp
//不正确
int x, *y;
```

**28.** 不要使用 C 风格的类型转换。

```cpp
//不正确
std::cerr << (int)c <<; std::endl;
//正确
std::cerr << static_cast<int>(c) << std::endl;
```

**29.** 在类和结构体中，应在每个可见性作用域内将数据成员和成员函数分开分组。

**30.** 对于小型类和结构体，没有必要将方法声明与其实现分离。

对于任何类或结构体中的小型方法，同样适用。

对于模板类和结构体，不要将方法声明与实现分离（否则它们必须在同一个翻译单元中定义）。

**31.** 可以在 140 个字符处换行，而不是 80 个字符。

**32.** 如果不需要后置形式，应始终使用自增/自减运算符的前置形式。

```cpp
for (Names::const_iterator it = column_names.begin(); it != column_names.end(); ++it)
```


## 注释

**1.** 一定要为所有非一目了然的代码部分添加注释。

这非常重要。编写注释的过程可能会让你意识到这段代码其实没有必要，或者它的设计存在问题。

```cpp
/** 可使用的内存片段部分。
  * 例如,若 internal_buffer 为 1MB,但从文件加载到缓冲区用于读取的数据仅有 10 字节,
  * 则 working_buffer 的大小将仅为 10 字节
  * (working_buffer.end() 将指向这 10 个可读字节之后的位置)。
  */
```

**2.** 注释可以根据需要写得足够详细。

**3.** 将注释放在其描述的代码前面。极少数情况下，注释可以写在代码之后，与代码位于同一行。

```cpp
/** 解析并执行查询。
*/
void executeQuery(
    ReadBuffer & istr, /// 读取查询的来源(如适用,还包括 INSERT 的数据)
    WriteBuffer & ostr, /// 写入结果的目标位置
    Context & context, /// 数据库、表、数据类型、引擎、函数、聚合函数等
    BlockInputStreamPtr & query_plan, /// 可在此处写入查询执行方式的描述
    QueryProcessingStage::Enum stage = QueryProcessingStage::Complete /// SELECT 查询处理到哪个阶段
    )
```

**4.** 注释应只使用英文编写。

**5.** 如果你在编写一个库，请在主头文件中加入详细注释对其进行说明。

**6.** 不要添加没有提供额外信息的注释。特别是不要留下如下这样的空注释：

```cpp
/*
* 过程名称:
* 原始过程名称:
* 作者:
* 创建日期:
* 修改日期:
* 修改作者:
* 原始文件名:
* 用途:
* 意图:
* 说明:
* 使用的类:
* 常量:
* 局部变量:
* 参数:
* 创建日期:
* 用途:
*/
```

该示例借用了资源 [http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/](http://home.tamk.fi/~jaalto/course/coding-style/doc/unmaintainable-code/) 中的内容。

**7.** 不要在每个文件开头写无用的注释（作者、创建日期等）。

**8.** 单行注释以三个斜杠开头：`///`，多行注释以 `/**` 开头。这些注释被视为“文档”。

注意：你可以使用 Doxygen 从这些注释生成文档。但一般不会使用 Doxygen，因为在 IDE 中浏览代码更方便。

**9.** 多行注释的开头和结尾处不能有空行（关闭多行注释的那一行除外）。

**10.** 注释掉代码时使用普通注释，而不是“文档化”注释。

**11.** 在提交之前删除被注释掉的代码片段。

**12.** 不要在注释或代码中使用脏话或辱骂性用语。

**13.** 不要使用大写字母，也不要使用过多的标点符号。

```cpp
/// 这是什么鬼???
```

**14.** 不要使用注释作为分隔符。

```cpp
///******************************************************
```

**15.** 不要在评论中发起讨论。

```cpp
/// 为什么要执行这些操作？
```

**16.** 无需在代码块末尾再写注释来说明该块的作用。

```cpp
/// for
```


## 命名

**1.** 变量名和类成员名应使用小写字母并以下划线分隔。

```cpp
size_t max_block_size;
```

**2.** 函数（方法）名使用以小写字母开头的驼峰命名法（camelCase）。

```cpp
std::string getName() const override { return "Memory"; }
```

**3.** 对于类（struct）的名称，使用首字母大写的 CamelCase。接口前缀只能使用 I，不使用其他前缀。

```cpp
class StorageMemory : public IStorage
```

**4.** `using` 的命名方式与类相同。

**5.** 模板类型参数的命名：在简单情况下，使用 `T`；`T`、`U`；`T1`、`T2`。

在更复杂的情况下，要么遵循类名的命名规则，要么添加前缀 `T`。

```cpp
template <typename TKey, typename TValue>
struct AggregatedStatElement
```

**6.** 模板常量参数的命名：可以遵循变量命名规则，或在简单情况下使用 `N`。

```cpp
template <bool without_www>
struct ExtractDomain
```

**7.** 对于抽象类（接口），可以使用 `I` 作为前缀。

```cpp
class IProcessor
```

**8.** 如果变量仅在局部使用，可以使用较短的变量名。

在其他所有情况下，请使用能够体现其含义的变量名。

```cpp
bool info_successfully_loaded = false;
```

**9.** `define` 和全局常量的名称使用全大写加下划线。

```cpp
#define MAX_SRC_TABLE_NAMES_TO_STORE 1000
```

**10.** 文件名应与其内容使用相同的命名风格。

如果一个文件只包含一个类，文件名应与类名一致（CamelCase）。

如果文件只包含一个函数，文件名应与函数名一致（camelCase）。

**11.** 如果名称中包含缩写，则：

* 对于变量名，缩写应使用小写字母 `mysql_connection`（而不是 `mySQL_connection`）。
* 对于类名和函数名，保留缩写中的大写字母 `MySQLConnection`（而不是 `MySqlConnection`）。

**12.** 仅用于初始化类成员的构造函数参数，其命名应与对应的类成员相同，但在末尾加下划线。

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

如果该参数在构造函数体中未被使用，则可以省略下划线后缀。

**13.** 局部变量和类成员在命名方式上不作区分（不需要任何前缀）。

```cpp
timer(而非 m_timer)
```

**14.** 对于 `enum` 中的常量，使用首字母大写的 CamelCase 命名。也可以使用 ALL&#95;CAPS。如果 `enum` 为非局部枚举，请使用 `enum class`。

```cpp
enum class CompressionMethod
{
    QuickLZ = 0,
    LZ4     = 1,
};
```

**15.** 所有名称必须使用英文。不允许对希伯来语单词进行音译。

不要写 T&#95;PAAMAYIM&#95;NEKUDOTAYIM

**16.** 如果缩写广为人知（例如你可以在Wikipedia或搜索引擎中轻松查到其含义），则可以使用缩写。

`AST`, `SQL`.

不要写 `NVDH`（一些随机字母）

如果截断形式是常用写法，则可以使用不完整的单词。

如果在注释中紧挨着给出了全称，你也可以使用缩写。

**17.** 包含 C++ 源代码的文件必须使用 `.cpp` 扩展名。头文件必须使用 `.h` 扩展名。


## 如何编写代码

**1.** 内存管理。

手动释放内存（`delete`）只能用于库代码中。

在库代码中，`delete` 运算符只能在析构函数中使用。

在应用代码中，内存必须由拥有它的对象负责释放。

示例：

* 最简单的方法是将对象放在栈上，或者将其作为另一个类的成员。
* 对于大量小对象，使用容器。
* 对于少量驻留在堆上的对象的自动释放，使用 `shared_ptr/unique_ptr`。

**2.** 资源管理。

使用 `RAII`，并参考上文。

**3.** 错误处理。

使用异常。在大多数情况下，只需要抛出异常，而不需要捕获它（得益于 `RAII`）。

在离线数据处理应用中，通常可以接受不捕获异常。

在处理用户请求的服务器程序中，通常只需在连接处理器的顶层捕获异常。

在线程函数中，应捕获并保存所有异常，以便在 `join` 之后在主线程中重新抛出它们。

```cpp
/// 如果尚未进行任何计算,则同步计算第一个数据块
if (!started)
{
    calculate();
    started = true;
}
else /// 如果计算正在进行中,则等待结果
    pool.wait();

if (exception)
    exception->rethrow();
```

切勿在未适当处理时直接吞掉异常；也不要盲目地把所有异常都写入日志。

```cpp
//不正确
catch (...) {}
```

如果需要忽略某些异常，只忽略特定的异常，并将其余异常重新抛出。

```cpp
catch (const DB::Exception & e)
{
    if (e.code() == ErrorCodes::UNKNOWN_AGGREGATE_FUNCTION)
        return nullptr;
    else
        throw;
}
```

在使用带有返回码或 `errno` 的函数时，务必检查返回结果，并在发生错误时抛出异常。

```cpp
if (0 != close(fd))
    throw ErrnoException(ErrorCodes::CANNOT_CLOSE_FILE, "无法关闭文件 {}", file_name);
```

你可以使用 `assert` 在代码中检查不变量。

**4.** 异常类型。

在应用代码中没有必要使用复杂的异常层次结构。异常信息应当让系统管理员可以理解。

**5.** 从析构函数抛出异常。

不推荐这么做，但这是被允许的。

可以采用以下方式：

* 创建一个函数（`done()` 或 `finalize()`），提前完成所有可能导致抛出异常的工作。如果该函数已经被调用，那么之后在析构函数中就不应该再有异常抛出。
* 过于复杂的任务（例如通过网络发送消息）可以放到一个单独的方法中，由类的使用者在销毁前显式调用。
* 如果在析构函数中出现异常，最好将其记录到日志中，而不是直接隐藏（前提是有可用的日志记录器）。
* 在简单应用程序中，可以接受依赖 `std::terminate`（针对 C++11 中默认 `noexcept` 的情况）来处理异常。

**6.** 匿名代码块。

你可以在单个函数中创建一个单独的代码块，使某些变量只在该作用域内可见，这样在离开该代码块时就会调用它们的析构函数。

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

* 尽量在单个 CPU 核心上获得尽可能好的性能。如有需要，再对代码进行并行化。

在服务端应用程序中：

* 使用线程池来处理请求。目前为止，我们还没有遇到需要在用户态进行上下文切换的任务。

不要使用 fork 进行并行化。

**8.** 线程同步。

很多情况下，可以让不同线程使用不同的内存单元（更好的是使用不同的缓存行），从而无需进行任何线程同步（除了 `joinAll`）。

如果需要同步，在大多数情况下，使用配合 `lock_guard` 的互斥量就足够了。

在其他情况下使用系统提供的同步原语。不要使用忙等待。

原子操作只应在最简单的场景中使用。

不要尝试实现无锁数据结构，除非这是你的主要专业领域。

**9.** 指针 vs 引用。

在大多数情况下，应优先使用引用。

**10.** `const`。

使用常量引用、指向常量的指针、`const_iterator` 和 `const` 方法。

将 `const` 视为默认选项，仅在确有必要时才使用非 `const`。


在按值传递变量时，通常使用 `const` 没有意义。

**11.** unsigned。

在必要时使用 `unsigned`。

**12.** 数值类型。

使用这些类型：`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Int8`、`Int16`、`Int32` 和 `Int64`，以及 `size_t`、`ssize_t` 和 `ptrdiff_t`。

不要对数字使用这些类型：`signed/unsigned long`、`long long`、`short`、`signed/unsigned char`、`char`。

**13.** 传递参数。

如果复杂类型的值之后会被移动，则按值传递并使用 `std::move`；如果希望在循环中更新该值，则按引用传递。

如果函数获取在堆上创建的对象的所有权，则将参数类型设为 `shared_ptr` 或 `unique_ptr`。

**14.** 返回值。

在大多数情况下，只需使用 `return`。不要写 `return std::move(res)`。

如果函数在堆上分配一个对象并返回它，请使用 `shared_ptr` 或 `unique_ptr`。

在少数情况下（在循环中更新一个值），可能需要通过参数返回该值。在这种情况下，该参数应为引用。

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

没有必要为应用程序代码单独使用一个 `namespace`。

小型库也不需要这样做。

对于中大型库，把所有内容都放在一个 `namespace` 中。

在库的 `.h` 文件中，你可以使用 `namespace detail` 来隐藏应用程序代码不需要的实现细节。

在 `.cpp` 文件中，你可以使用 `static` 或匿名 `namespace` 来隐藏符号。

此外，可以为 `enum` 使用一个 `namespace`，以防止相应的名称进入外部 `namespace`（但最好使用 `enum class`）。

**16.** 延迟初始化。

如果初始化需要参数，则通常不应编写默认构造函数。

如果之后需要延迟初始化，可以添加一个默认构造函数，用来创建一个无效对象。或者，对于数量较少的对象，可以使用 `shared_ptr/unique_ptr`。

```cpp
Loader(DB::Connection * connection_, const std::string & query, size_t max_block_size_);

/// 用于延迟初始化
Loader() {}
```

**17.** 虚函数。

如果类不打算用于多态场景，就不需要将函数声明为虚函数。析构函数同样适用这一原则。

**18.** 编码。

统一使用 UTF-8。使用 `std::string` 和 `char *`。不要使用 `std::wstring` 和 `wchar_t`。

**19.** 日志记录。

参考代码中的各处示例。

在提交之前，删除所有无意义的和调试用的日志记录，以及任何其他类型的调试输出。

应尽量避免在循环中记录日志，即使是在 Trace 级别。

在任何日志级别下，日志都必须可读。

日志记录在大多数情况下只应在应用程序代码中使用。

日志消息必须用英语书写。

日志最好能让系统管理员容易理解。

不要在日志中使用粗话或脏话。

在日志中使用 UTF-8 编码。在少数情况下，你可以在日志中使用非 ASCII 字符。

**20.** 输入输出。

不要在对应用性能至关重要的内部循环中使用 `iostreams`（并且绝不要使用 `stringstream`）。

改用 `DB/IO` 库。

**21.** 日期和时间。

参见 `DateLUT` 库。

**22.** include。

一律使用 `#pragma once`，而不是头文件保护宏（include guards）。

**23.** using。

不要使用 `using namespace`。你可以对某个具体名称使用 `using`，但要将其限制在类或函数的局部范围内。

**24.** 除非确有必要，不要对函数使用 `trailing return type`。

```cpp
auto f() -> void
```

**25.** 变量声明和初始化。

```cpp
//正确方式
std::string s = "Hello";
std::string s{"Hello"};

//错误方式
auto s = std::string{"Hello"};
```

**26.** 对于虚函数，在基类中使用 `virtual` 关键字，而在派生类中不要再写 `virtual`，改为写 `override`。


## 未使用的 C++ 特性

**1.** 不使用虚继承。

**2.** 在现代 C++ 中具有便捷语法糖的构造，例如：

```cpp
// 不使用语法糖的传统方式
template <typename G, typename = std::enable_if_t<std::is_same<G, F>::value, void>> // 通过 std::enable_if 实现 SFINAE，使用 ::value
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
requires std::same_v<G, F> // 通过 C++20 concept 实现 SFINAE，使用 C++14 模板别名
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

    return {1, 2}; // 或者：return std::pair(1, 2); // 通过初始化列表或值初始化创建 pair (C++17)
}
```


## 平台 {#platform}

**1.** 我们为特定平台编写代码。

但在其他条件相同的情况下，更推荐编写跨平台或可移植的代码。

**2.** 语言：C++20（参见可用的 [C++20 功能列表](https://en.cppreference.com/w/cpp/compiler_support#C.2B.2B20_features)）。

**3.** 编译器：`clang`。在撰写本文时（2025 年 3 月），代码使用版本 >= 19 的 clang 进行编译。

使用的标准库为 `libc++`。

**4.** 操作系统：Linux Ubuntu，不早于 Precise 版本。

**5.** 代码针对 x86_64 CPU 架构编写。

CPU 指令集为我们服务器中支持的最小公共子集，目前为 SSE 4.2。

**6.** 使用 `-Wall -Wextra -Werror -Weverything` 编译选项，但有少量例外。

**7.** 对除那些难以进行静态链接的库以外的所有库使用静态链接（参见 `ldd` 命令的输出）。

**8.** 使用发布（release）配置进行代码开发和调试。



## 工具 {#tools}

**1.** KDevelop 是一个不错的 IDE。

**2.** 调试时使用 `gdb`、`valgrind`（`memcheck`）、`strace`、`-fsanitize=...` 或 `tcmalloc_minimal_debug`。

**3.** 性能分析时使用 `Linux Perf`、`valgrind`（`callgrind`）或 `strace -cf`。

**4.** 源代码托管在 Git 中。

**5.** 构建使用 `CMake`。

**6.** 程序通过 `deb` 包发布。

**7.** 提交到 master 的变更不得导致构建失败。

虽然只有选定的修订版本会被视为可用版本。

**8.** 尽可能频繁地提交，即使代码只完成了一部分。

为此请使用分支。

如果你在 `master` 分支上的代码暂时还无法构建，在 `push` 之前将其从构建中排除。你需要在几天内完成它或将其删除。

**9.** 对于较为复杂的修改，请使用分支并将其发布到服务器上。

**10.** 未使用的代码会从仓库中删除。



## 库 {#libraries}

**1.** 使用 C++20 标准库（允许使用 experimental 扩展特性），以及 `boost` 和 `Poco` 框架。

**2.** 不允许使用来自操作系统软件包的库，也不允许使用预装的库。所有库都应以源代码形式放在 `contrib` 目录中，并与 ClickHouse 一同构建。详情参见[添加新的第三方库指南](/development/contrib#adding-and-maintaining-third-party-libraries)。

**3.** 始终优先使用已经在使用的库。



## 通用建议 {#general-recommendations-1}

**1.** 尽可能少写代码。

**2.** 优先尝试最简单的解决方案。

**3.** 在弄清楚代码将如何工作以及内部循环如何运作之前，不要开始写代码。

**4.** 在最简单的情况下，使用 `using` 而不是类或结构体。

**5.** 如果可能，不要编写拷贝构造函数、赋值运算符、析构函数（如果类中至少有一个虚函数，则虚析构函数除外）、移动构造函数或移动赋值运算符。换句话说，应保证编译器生成的函数就能正确工作。你可以使用 `default`。

**6.** 鼓励简化代码。在可能的情况下尽量减少代码量。



## 其他补充建议

**1.** 对来自 `stddef.h` 的类型显式添加 `std::`

是不推荐的。换句话说，我们建议写 `size_t` 而不是 `std::size_t`，因为它更简洁。

不过，添加 `std::` 也是可以接受的。

**2.** 对来自标准 C 库的函数显式添加 `std::`

是不推荐的。换句话说，请写 `memcpy` 而不是 `std::memcpy`。

原因在于存在类似的非标准函数，例如 `memmem`。我们有时会使用这些函数。这些函数并不存在于 `namespace std` 中。

如果你在所有地方都写 `std::memcpy` 而不是 `memcpy`，那么 `memmem` 不带 `std::` 的写法就会显得很奇怪。

尽管如此，如果你更喜欢带 `std::` 的写法，仍然可以使用。

**3.** 在标准 C++ 库中存在等价函数时，仍然使用 C 语言库函数。

如果这样做更高效，这是可以接受的。

例如，在复制大块内存时，请使用 `memcpy` 而不是 `std::copy`。

**4.** 多行函数参数。

以下任一换行风格都是允许的：

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
