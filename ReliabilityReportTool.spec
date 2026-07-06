# -*- mode: python ; coding: utf-8 -*-

import os
from glob import glob

from PyInstaller.utils.hooks import collect_submodules


project_root = os.path.abspath(SPECPATH)
backend_dir = os.path.join(project_root, 'backend')


def existing_dir(path):
    return os.path.isdir(path)


datas = []

frontend_dist = os.path.join(project_root, 'frontend', 'dist')
if existing_dir(frontend_dist):
    datas.append((frontend_dist, os.path.join('frontend', 'dist')))

src_templates = os.path.join(project_root, 'src', 'templates')
if existing_dir(src_templates):
    datas.append((src_templates, os.path.join('src', 'templates')))

backend_templates = os.path.join(project_root, 'backend', 'data', 'templates')
if existing_dir(backend_templates):
    datas.append((backend_templates, os.path.join('backend', 'data', 'templates')))


def collect_weasyprint_runtime():
    candidates = []
    configured = os.environ.get('WEASYPRINT_DLL_DIRECTORIES', '')
    candidates.extend([path.strip() for path in configured.split(';') if path.strip()])
    candidates.extend([
        r'D:\RJHZ\msys64\ucrt64\bin',
        r'D:\RJHZ\msys64\mingw64\bin',
        r'C:\msys64\ucrt64\bin',
        r'C:\msys64\mingw64\bin',
        r'C:\msys64\clang64\bin',
        r'C:\Program Files\GTK3-Runtime Win64\bin',
        r'C:\Program Files\GTK3-Runtime\bin',
    ])

    for directory in candidates:
        if not existing_dir(directory):
            continue
        required = [
            os.path.join(directory, 'libgobject-2.0-0.dll'),
            os.path.join(directory, 'libpango-1.0-0.dll'),
        ]
        if not all(os.path.isfile(path) for path in required):
            continue
        return [(path, 'weasyprint-runtime') for path in glob(os.path.join(directory, '*.dll'))]
    return []


binaries = collect_weasyprint_runtime()

hiddenimports = (
    ['flask_cors']
    + collect_submodules('weasyprint')
    + collect_submodules('cssselect2')
    + collect_submodules('tinycss2')
    + collect_submodules('fontTools')
)


a = Analysis(
    [os.path.join('backend', 'desktop_app.py')],
    pathex=[project_root, backend_dir],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ReliabilityReportTool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ReliabilityReportTool',
)
