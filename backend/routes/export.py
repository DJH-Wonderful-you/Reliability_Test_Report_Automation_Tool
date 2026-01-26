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
        # Try to use weasyprint for PDF generation
        from weasyprint import HTML, CSS
        
        # Create PDF in temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            tmp_path = tmp_file.name
        
        # Base CSS for PDF
        base_css = CSS(string='''
            @page {
                size: A4;
                margin: 0;
            }
            body {
                font-family: "Microsoft YaHei", "SimSun", sans-serif;
                margin: 0;
                padding: 0;
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
        
    except ImportError:
        # Fallback: Return HTML for client-side PDF generation
        return jsonify({
            'fallback': True,
            'message': 'Server-side PDF generation not available. Use client-side generation.',
            'html': html_content,
            'filename': filename
        })
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
        from weasyprint import HTML, CSS
        
        # Base CSS for PDF
        base_css = CSS(string='''
            @page {
                size: A4;
                margin: 0;
            }
            body {
                font-family: "Microsoft YaHei", "SimSun", sans-serif;
                margin: 0;
                padding: 0;
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
        
    except ImportError:
        return jsonify({
            'fallback': True,
            'message': 'Server-side PDF generation not available'
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
