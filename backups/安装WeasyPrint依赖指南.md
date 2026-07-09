# Windows上安装WeasyPrint依赖指南

## 方法1: 使用GTK3运行时安装器(推荐)

### 步骤1: 下载GTK3运行时
访问以下链接下载GTK3 for Windows:
- 官方下载: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
- 下载最新版本的安装器(例如: `gtk3-runtime-3.24.31-2022-01-04-ts-win64.exe`)

### 步骤2: 安装GTK3
1. 运行下载的安装器
2. 选择默认安装路径(通常是 `C:\Program Files\GTK3-Runtime Win64`)
3. 确保勾选"Add to PATH"选项
4. 完成安装

### 步骤3: 验证安装
打开命令提示符,运行:
```bash
where gdk-pixbuf-query-loaders
```
如果显示路径,说明安装成功。

### 步骤4: 安装WeasyPrint
```bash
.\.venv\Scripts\pip.exe install weasyprint -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 步骤5: 测试WeasyPrint
```bash
.\.venv\Scripts\python.exe -c "from weasyprint import HTML; print('WeasyPrint工作正常')"
```

---

## 方法2: 使用MSYS2(适合开发者)

### 步骤1: 安装MSYS2
1. 下载MSYS2: https://www.msys2.org/
2. 运行安装器,使用默认路径 `C:\msys64`
3. 完成安装后,打开MSYS2终端

### 步骤2: 安装GTK3依赖
在MSYS2终端中运行:
```bash
pacman -S mingw-w64-x86_64-gtk3
pacman -S mingw-w64-x86_64-cairo
pacman -S mingw-w64-x86_64-pango
pacman -S mingw-w64-x86_64-gdk-pixbuf2
```

### 步骤3: 添加到系统PATH
将以下路径添加到系统环境变量PATH:
```
C:\msys64\mingw64\bin
```

### 步骤4: 安装WeasyPrint
```bash
.\.venv\Scripts\pip.exe install weasyprint -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 方法3: 使用预编译的GTK包

### 步骤1: 下载GTK包
从以下地址下载预编译的GTK3包:
- https://github.com/wingtk/gvsbuild/releases

### 步骤2: 解压到指定目录
解压到 `C:\gtk` 或其他目录

### 步骤3: 添加到PATH
将以下路径添加到系统环境变量PATH:
```
C:\gtk\bin
```

### 步骤4: 安装WeasyPrint
```bash
.\.venv\Scripts\pip.exe install weasyprint -i https://pypi.tuna.tsinghua.edu.cn/simple
```

---

## 常见问题

### 问题1: 找不到gobject-2.0-0.dll
**解决方案**: 确保GTK3的bin目录已添加到系统PATH

### 问题2: 中文字体显示为方块
**解决方案**: 需要配置字体路径,参见下面的字体配置部分

### 问题3: ImportError: cannot load library 'gobject-2.0-0'
**解决方案**: 
1. 重启命令提示符/PowerShell
2. 确认PATH环境变量已生效
3. 运行 `where gobject-2.0-0.dll` 确认文件可找到

---

## 中文字体配置

WeasyPrint需要正确配置中文字体才能显示中文。

### 创建字体配置文件
创建文件 `backend/font_config.py`:

```python
import os
from pathlib import Path

# Windows系统字体目录
WINDOWS_FONTS_DIR = Path(os.environ.get('WINDIR', 'C:\\Windows')) / 'Fonts'

# 常用中文字体
CHINESE_FONTS = {
    'SimSun': 'simsun.ttc',      # 宋体
    'SimHei': 'simhei.ttf',      # 黑体
    'Microsoft YaHei': 'msyh.ttc',  # 微软雅黑
    'KaiTi': 'simkai.ttf',       # 楷体
}

def get_font_path(font_name):
    """获取字体文件路径"""
    font_file = CHINESE_FONTS.get(font_name)
    if font_file:
        font_path = WINDOWS_FONTS_DIR / font_file
        if font_path.exists():
            return str(font_path)
    return None
```

### 在export.py中使用字体配置
修改 `backend/routes/export.py`,添加字体配置:

```python
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

# 创建字体配置
font_config = FontConfiguration()

# CSS with font configuration
base_css = CSS(string='''
    @font-face {
        font-family: 'SimSun';
        src: local('SimSun'), local('宋体');
    }
    @font-face {
        font-family: 'Microsoft YaHei';
        src: local('Microsoft YaHei'), local('微软雅黑');
    }
    body {
        font-family: "Microsoft YaHei", "SimSun", sans-serif;
    }
''', font_config=font_config)

# Generate PDF with font configuration
HTML(string=html_content).write_pdf(
    tmp_path, 
    stylesheets=[base_css],
    font_config=font_config
)
```

---

## 验证安装

运行以下测试脚本验证WeasyPrint是否正常工作:

```python
# test_weasyprint.py
from weasyprint import HTML, CSS

html_content = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: "Microsoft YaHei", "SimSun", sans-serif; }
    </style>
</head>
<body>
    <h1>测试中文显示</h1>
    <p>这是一段中文测试文本。</p>
    <p>Test English text.</p>
</body>
</html>
'''

HTML(string=html_content).write_pdf('test_output.pdf')
print('PDF生成成功! 请检查 test_output.pdf')
```

运行测试:
```bash
.\.venv\Scripts\python.exe test_weasyprint.py
```

---

## 推荐方案

对于大多数用户,推荐使用**方法1(GTK3运行时安装器)**,因为:
1. 安装简单,一键完成
2. 自动配置PATH
3. 不需要额外的开发工具
4. 占用空间小

如果方法1不可行,可以尝试方法3(预编译包)。

---

## 如果安装失败

如果以上方法都无法成功安装,建议继续使用当前的**超高质量客户端渲染方案**(scale=4),
这个方案在实际使用中效果已经非常接近矢量PDF,且无需任何系统依赖。
