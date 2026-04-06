#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Export Routes - API endpoints for PDF export operations

Handles PDF generation from report content.
"""

import os
import tempfile
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file, current_app

export_bp = Blueprint('export', __name__)

_dll_directory_handles = []
_registered_dll_directories = set()
_selected_weasy_dll_directory = None


def _has_weasyprint_runtime(directory):
    return (
        os.path.isfile(os.path.join(directory, 'libgobject-2.0-0.dll')) and
        os.path.isfile(os.path.join(directory, 'libpango-1.0-0.dll'))
    )


def _prepare_weasyprint_windows_dlls():
    """
    On Windows + Python 3.8+, ctypes doesn't reliably search PATH for DLLs.
    Try known Pango/GTK locations and WEASYPRINT_DLL_DIRECTORIES.
    """
    if os.name != 'nt':
        return

    global _selected_weasy_dll_directory

    if _selected_weasy_dll_directory:
        return

    configured = os.environ.get('WEASYPRINT_DLL_DIRECTORIES', '')
    configured_dirs = [p.strip() for p in configured.split(';') if p.strip()]
    default_dirs = [
        r'C:\msys64\ucrt64\bin',
        r'C:\msys64\mingw64\bin',
        r'C:\msys64\clang64\bin',
        r'C:\Program Files\GTK3-Runtime Win64\bin',
        r'C:\Program Files\GTK3-Runtime\bin',
    ]
    candidate_dirs = configured_dirs if configured_dirs else default_dirs

    # Use exactly one runtime directory to avoid mixing different GTK toolchains.
    selected = None
    for directory in candidate_dirs:
        if os.path.isdir(directory) and _has_weasyprint_runtime(directory):
            selected = directory
            break

    if not selected:
        for directory in candidate_dirs:
            if os.path.isdir(directory):
                selected = directory
                break

    if not selected or selected in _registered_dll_directories:
        return

    try:
        handle = os.add_dll_directory(selected)
    except Exception:
        return

    _dll_directory_handles.append(handle)
    _registered_dll_directories.add(selected)
    _selected_weasy_dll_directory = selected


@export_bp.route('/pdf', methods=['POST'])
def export_pdf():
    """
    Export report content to PDF.
    
    Expects JSON payload with:
    - html: The HTML content to convert
    - title: Report title for filename
    - templateType: The template type used
    """
    data = request.get_json()
    
    if not data or 'html' not in data:
        return jsonify({'error': 'No HTML content provided'}), 400
    
    html_content = data['html']
    title = data.get('title', 'Report')
    
    # Generate filename with date
    date_str = datetime.now().strftime('%Y%m%d')
    safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
    filename = f"{safe_title}_{date_str}.pdf"

    try:
        _prepare_weasyprint_windows_dlls()
        # Try to use weasyprint for PDF generation
        from weasyprint import HTML, CSS
    except Exception as e:
        current_app.logger.warning(f"WeasyPrint unavailable: {e}")
        return jsonify({
            'fallback': True,
            'message': f'Server-side PDF generation not available: {e}',
            'html': html_content,
            'filename': filename
        })

    try:
        # Create PDF in temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            tmp_path = tmp_file.name

        # Base CSS for PDF
        base_css = CSS(string='''
            @page {
                size: A4;
                margin: 0;
            }
            html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
            }
            body {
                font-family: "Microsoft YaHei", "SimSun", sans-serif;
                margin: 0;
                padding: 0;
            }
            .export-document {
                width: 210mm;
                margin: 0 auto;
            }
            .export-document .a4-page {
                width: 210mm;
                min-height: 297mm;
                height: 297mm;
                max-height: 297mm;
                box-sizing: border-box;
                position: relative;
                overflow: hidden;
            }
            .export-document .page-header,
            .export-document .page-content {
                width: 180mm;
                max-width: 180mm;
                margin-left: auto;
                margin-right: auto;
            }
            .export-document .page-footer {
                position: absolute;
                left: 15mm;
                right: 15mm;
                bottom: 15mm;
                width: auto;
                margin: 0;
            }
            .page {
                page-break-after: always;
            }
            .page:last-child {
                page-break-after: auto;
            }
        ''')
        
        # Generate PDF
        HTML(string=html_content).write_pdf(tmp_path, stylesheets=[base_css])

        # Send file
        response = send_file(
            tmp_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
        
        # Clean up temp file after sending
        @response.call_on_close
        def cleanup():
            try:
                os.unlink(tmp_path)
            except:
                pass

        return response
    except Exception as e:
        current_app.logger.error(f"PDF export error: {e}")
        return jsonify({'error': str(e)}), 500


@export_bp.route('/preview', methods=['POST'])
def preview_pdf():
    """
    Generate PDF preview (returns PDF data as base64).
    """
    data = request.get_json()
    
    if not data or 'html' not in data:
        return jsonify({'error': 'No HTML content provided'}), 400
    
    html_content = data['html']

    try:
        import base64
        _prepare_weasyprint_windows_dlls()
        from weasyprint import HTML, CSS
    except Exception as e:
        current_app.logger.warning(f"WeasyPrint preview unavailable: {e}")
        return jsonify({
            'fallback': True,
            'message': f'Server-side PDF generation not available: {e}'
        })

    try:
        # Base CSS for PDF
        base_css = CSS(string='''
            @page {
                size: A4;
                margin: 0;
            }
            html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
            }
            body {
                font-family: "Microsoft YaHei", "SimSun", sans-serif;
                margin: 0;
                padding: 0;
            }
            .export-document {
                width: 210mm;
                margin: 0 auto;
            }
            .export-document .a4-page {
                width: 210mm;
                min-height: 297mm;
                height: 297mm;
                max-height: 297mm;
                box-sizing: border-box;
                position: relative;
                overflow: hidden;
            }
            .export-document .page-header,
            .export-document .page-content {
                width: 180mm;
                max-width: 180mm;
                margin-left: auto;
                margin-right: auto;
            }
            .export-document .page-footer {
                position: absolute;
                left: 15mm;
                right: 15mm;
                bottom: 15mm;
                width: auto;
                margin: 0;
            }
        ''')

        # Generate PDF to bytes
        pdf_bytes = HTML(string=html_content).write_pdf(stylesheets=[base_css])

        # Convert to base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

        return jsonify({
            'success': True,
            'pdfData': f'data:application/pdf;base64,{pdf_base64}'
        })
    except Exception as e:
        current_app.logger.error(f"PDF preview error: {e}")
        return jsonify({'error': str(e)}), 500


@export_bp.route('/upload-image', methods=['POST'])
def upload_report_image():
    """
    Upload an image for use in the report.
    Returns the image as a data URL for embedding in the report.
    """
    import base64
    
    if 'file' not in request.files:
        # Check for multiple files
        if 'files[]' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        files = request.files.getlist('files[]')
    else:
        files = [request.files['file']]
    
    results = []
    
    for file in files:
        if file.filename == '':
            continue
        
        # Check file extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if ext not in allowed_extensions:
            continue
        
        try:
            # Read and convert to base64
            file_content = file.read()
            base64_data = base64.b64encode(file_content).decode('utf-8')
            
            # Determine MIME type
            mime_types = {
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'bmp': 'image/bmp',
                'webp': 'image/webp'
            }
            mime_type = mime_types.get(ext, 'image/png')
            
            results.append({
                'filename': file.filename,
                'dataUrl': f'data:{mime_type};base64,{base64_data}'
            })
        except Exception as e:
            current_app.logger.error(f"Image upload error: {e}")
    
    if not results:
        return jsonify({'error': 'No valid images uploaded'}), 400
    
    return jsonify({
        'success': True,
        'images': results
    })
