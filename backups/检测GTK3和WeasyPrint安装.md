# 检测GTK3和WeasyPrint安装状态

## 在CMD中的检测命令

### 1. 检测GTK3是否在PATH中
```cmd
where gdk-pixbuf-query-loaders
```

**成功输出示例:**
```
D:\Program Files\GTK3-Runtime Win64\bin\gdk-pixbuf-query-loaders.exe
```

**失败输出:**
```
信息: 用提供的模式无法找到文件。
```

### 2. 检测其他GTK组件
```cmd
where libgtk-3-0.dll
where libcairo-2.dll
where libpango-1.0-0.dll
```

### 3. 查看当前PATH环境变量
```cmd
echo %PATH%
```
查找输出中是否包含 `GTK3-Runtime Win64\bin`

### 4. 检测WeasyPrint是否安装
```cmd
cd D:\RJHZ\Projects_Code\Python\Reliability_Test_Report_Automation_Tool
python -c "import weasyprint; print('WeasyPrint已安装')"
```

**成功输出:**
```
WeasyPrint已安装
```

**失败输出:**
```
ModuleNotFoundError: No module named 'weasyprint'
```

### 5. 检测WeasyPrint是否能正常工作
```cmd
python -c "from weasyprint import HTML; print('WeasyPrint工作正常!')"
```

**成功输出:**
```
WeasyPrint工作正常!
```

**失败输出(缺少GTK):**
```
OSError: cannot load library 'gobject-2.0-0': error 0x7e
```

---

## 关于环境变量生效的问题

### 不需要重启电脑!

添加环境变量后,**不需要重启电脑**,但需要:

### ✅ 必须做的:
1. **关闭所有CMD/PowerShell窗口**
2. **重新打开CMD/PowerShell**

### ❌ 不会生效的情况:
- 在同一个CMD窗口中添加PATH后直接测试(需要重新打开窗口)
- 只修改了用户PATH,但在系统服务中运行(需要修改系统PATH)

---

## 完整检测流程

### 步骤1: 检查PATH是否包含GTK
```cmd
echo %PATH% | findstr "GTK3"
```

**如果有输出**: PATH已包含GTK路径
**如果无输出**: PATH中没有GTK路径

### 步骤2: 检查GTK文件是否存在
```cmd
dir "D:\Program Files\GTK3-Runtime Win64\bin\gdk-pixbuf-query-loaders.exe"
```

**成功**: 显示文件信息
**失败**: 系统找不到指定的文件

### 步骤3: 测试GTK命令
```cmd
where gdk-pixbuf-query-loaders
```

### 步骤4: 测试WeasyPrint
```cmd
cd D:\RJHZ\Projects_Code\Python\Reliability_Test_Report_Automation_Tool
python -c "from weasyprint import HTML; HTML(string='<h1>Test</h1>').write_pdf('test.pdf'); print('成功生成test.pdf')"
```

如果成功,会在当前目录生成 `test.pdf` 文件。

---

## 故障排除

### 问题1: where命令找不到gdk-pixbuf-query-loaders

**原因**: PATH没有生效

**解决方案**:
1. 关闭所有CMD窗口
2. 重新打开CMD
3. 再次测试

### 问题2: 重新打开CMD后仍然找不到

**原因**: PATH没有正确添加到系统环境变量

**解决方案**:
1. 按 Win + R
2. 输入 `sysdm.cpl` 回车
3. 点击"高级"标签
4. 点击"环境变量"
5. 检查"系统变量"中的"Path"是否包含:
   ```
   D:\Program Files\GTK3-Runtime Win64\bin
   ```
6. 如果没有,手动添加
7. 点击"确定"保存
8. 关闭所有CMD窗口,重新打开

### 问题3: WeasyPrint导入成功但无法生成PDF

**原因**: GTK库文件损坏或版本不兼容

**解决方案**:
1. 卸载GTK3运行时
2. 重新下载并安装
3. 确保安装时勾选"Add to PATH"

### 问题4: 在IDE中运行失败,但CMD中成功

**原因**: IDE没有重新加载环境变量

**解决方案**:
1. 完全关闭IDE(如VSCode, PyCharm)
2. 重新打开IDE
3. 重新运行

---

## 快速验证脚本

创建一个批处理文件 `check_gtk.bat`:

```batch
@echo off
echo ========================================
echo 检测GTK3和WeasyPrint安装状态
echo ========================================
echo.

echo [1/5] 检查PATH中是否包含GTK3...
echo %PATH% | findstr "GTK3" >nul
if %errorlevel%==0 (
    echo ✓ PATH中包含GTK3路径
) else (
    echo ✗ PATH中不包含GTK3路径
)
echo.

echo [2/5] 检查GTK3文件是否存在...
if exist "D:\Program Files\GTK3-Runtime Win64\bin\gdk-pixbuf-query-loaders.exe" (
    echo ✓ GTK3文件存在
) else (
    echo ✗ GTK3文件不存在
)
echo.

echo [3/5] 测试GTK3命令...
where gdk-pixbuf-query-loaders >nul 2>&1
if %errorlevel%==0 (
    echo ✓ GTK3命令可用
) else (
    echo ✗ GTK3命令不可用
)
echo.

echo [4/5] 检查WeasyPrint是否安装...
python -c "import weasyprint" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ WeasyPrint已安装
) else (
    echo ✗ WeasyPrint未安装
)
echo.

echo [5/5] 测试WeasyPrint是否工作...
python -c "from weasyprint import HTML; print('OK')" >nul 2>&1
if %errorlevel%==0 (
    echo ✓ WeasyPrint工作正常
) else (
    echo ✗ WeasyPrint无法工作
)
echo.

echo ========================================
echo 检测完成
echo ========================================
pause
```

运行这个批处理文件可以一次性检查所有状态。

---

## 总结

### 检测命令(按顺序执行):

```cmd
REM 1. 检查PATH
echo %PATH% | findstr "GTK3"

REM 2. 检查GTK命令
where gdk-pixbuf-query-loaders

REM 3. 检查WeasyPrint
cd D:\RJHZ\Projects_Code\Python\Reliability_Test_Report_Automation_Tool
python -c "from weasyprint import HTML; print('成功!')"
```

### 关于重启:
- ❌ **不需要重启电脑**
- ✅ **需要重新打开CMD/PowerShell窗口**
- ✅ **需要重启IDE(如果在IDE中运行)**

### 如果所有检测都通过:
恭喜!你可以开始使用WeasyPrint生成矢量PDF了!
