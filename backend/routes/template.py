#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Template Routes - API endpoints for template operations

Handles template CRUD operations, logo/signature management, and template import/export.
"""

import base64
import json
import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename

template_bp = Blueprint('template', __name__)

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


@template_bp.route('/default/<template_type>', methods=['GET'])
def get_default_template(template_type):
    """Get the default template configuration for a template type."""
    # Map template type to JSON file
    template_files = {
        'general': 'general_template.json',
        'general_en': 'general_en_template.json',
        'huawei': 'huawei_template.json'
    }
    
    if template_type not in template_files:
        return jsonify({'error': 'Invalid template type'}), 400
    
    # First check in src/templates directory
    src_template_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'src', 'templates', template_files[template_type]
    )
    
    if os.path.exists(src_template_path):
        try:
            with open(src_template_path, 'r', encoding='utf-8') as f:
                template = json.load(f)
            return jsonify(template)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # Fallback to data/templates
    templates_dir = current_app.config['TEMPLATES_DIR']
    filepath = os.path.join(templates_dir, template_files[template_type])
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Template not found'}), 404
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            template = json.load(f)
        return jsonify(template)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/custom', methods=['GET'])
def list_custom_templates():
    """List all custom templates."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    templates = []
    
    if os.path.exists(templates_dir):
        for filename in os.listdir(templates_dir):
            if filename.startswith('custom_') and filename.endswith('.json'):
                filepath = os.path.join(templates_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        template = json.load(f)
                        templates.append({
                            'id': template.get('id'),
                            'name': template.get('name', 'Unnamed Template'),
                            'baseType': template.get('baseType', 'general'),
                            'updatedAt': template.get('updatedAt'),
                            'createdAt': template.get('createdAt')
                        })
                except Exception as e:
                    current_app.logger.error(f"Error reading template {filename}: {e}")
    
    templates.sort(key=lambda x: x.get('updatedAt', ''), reverse=True)
    return jsonify({'templates': templates})


@template_bp.route('/custom/<template_id>', methods=['GET'])
def get_custom_template(template_id):
    """Get a specific custom template by ID."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Template not found'}), 404
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            template = json.load(f)
        return jsonify(template)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/latest/<base_type>', methods=['GET'])
def get_latest_template(base_type):
    """Get the most recently updated custom template for a base type."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    templates = []
    
    if os.path.exists(templates_dir):
        for filename in os.listdir(templates_dir):
            if filename.startswith('custom_') and filename.endswith('.json'):
                filepath = os.path.join(templates_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        template = json.load(f)
                        if template.get('baseType') == base_type:
                            templates.append(template)
                except Exception as e:
                    current_app.logger.error(f"Error reading template {filename}: {e}")
    
    if not templates:
        return jsonify(None)
    
    # Sort by updatedAt and return the latest
    templates.sort(key=lambda x: x.get('updatedAt', ''), reverse=True)
    return jsonify(templates[0])


@template_bp.route('/applied/<base_type>', methods=['GET'])
def get_applied_template(base_type):
    """Get the template that has been applied to the report editor for a base type."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    applied_file = os.path.join(templates_dir, f'applied_{base_type}.json')
    
    # If applied template file exists, return it
    if os.path.exists(applied_file):
        try:
            with open(applied_file, 'r', encoding='utf-8') as f:
                template = json.load(f)
            return jsonify(template)
        except Exception as e:
            current_app.logger.error(f"Error reading applied template: {e}")
    
    # Fallback: return None (no template has been applied yet)
    return jsonify(None)


@template_bp.route('/apply/<template_id>', methods=['POST'])
def apply_template_to_report(template_id):
    """Mark a template as applied to the report editor (copy to applied file)."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    source_filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
    
    if not os.path.exists(source_filepath):
        return jsonify({'error': 'Template not found'}), 404
    
    try:
        # Read the source template
        with open(source_filepath, 'r', encoding='utf-8') as f:
            template = json.load(f)
        
        base_type = template.get('baseType', 'general')
        applied_file = os.path.join(templates_dir, f'applied_{base_type}.json')
        
        # Copy to applied file
        template['appliedAt'] = datetime.now().isoformat()
        with open(applied_file, 'w', encoding='utf-8') as f:
            json.dump(template, f, ensure_ascii=False, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Template applied successfully',
            'appliedAt': template['appliedAt']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/custom', methods=['POST'])
def create_custom_template():
    """Create a new custom template."""
    data = request.get_json()
    
    template_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    template = {
        'id': template_id,
        'name': data.get('name', 'Custom Template'),
        'baseType': data.get('baseType', 'general'),
        'settings': data.get('settings', {}),
        'logo': data.get('logo'),
        'signatures': data.get('signatures', {}),
        'departmentSeal': data.get('departmentSeal'),
        'templateContentData': data.get('templateContentData', {}),
        'securityLevel': data.get('securityLevel', '内部公开'),
        'tableColumnWidths': data.get('tableColumnWidths', {}),
        'fieldFormats': data.get('fieldFormats', {}),
        'createdAt': now,
        'updatedAt': now
    }
    
    templates_dir = current_app.config['TEMPLATES_DIR']
    filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(template, f, ensure_ascii=False, indent=2)
        return jsonify(template), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/custom/<template_id>', methods=['PUT'])
def update_custom_template(template_id):
    """Update an existing custom template."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Template not found'}), 404
    
    data = request.get_json()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            template = json.load(f)
        
        # Update fields
        for key in ['name', 'settings', 'logo', 'signatures', 'departmentSeal', 'templateContentData', 'securityLevel', 'tableColumnWidths', 'fieldFormats']:
            if key in data:
                template[key] = data[key]
        
        template['updatedAt'] = datetime.now().isoformat()
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(template, f, ensure_ascii=False, indent=2)
        
        return jsonify(template)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/custom/<template_id>', methods=['DELETE'])
def delete_custom_template(template_id):
    """Delete a custom template."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Template not found'}), 404
    
    try:
        os.remove(filepath)
        return jsonify({'message': 'Template deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/reset/<base_type>', methods=['DELETE'])
def reset_templates_by_type(base_type):
    """Delete all custom templates of a specific base type to reset to default."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    deleted_count = 0
    
    if os.path.exists(templates_dir):
        for filename in os.listdir(templates_dir):
            if filename.startswith('custom_') and filename.endswith('.json'):
                filepath = os.path.join(templates_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        template = json.load(f)
                        if template.get('baseType') == base_type:
                            os.remove(filepath)
                            deleted_count += 1
                except Exception as e:
                    current_app.logger.error(f"Error processing template {filename}: {e}")
    
    return jsonify({
        'message': f'Reset successful. Deleted {deleted_count} custom template(s).',
        'deletedCount': deleted_count
    })


@template_bp.route('/upload-image', methods=['POST'])
def upload_image():
    """Upload an image (logo, signature, or department seal)."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    image_type = request.form.get('type', 'logo')  # logo, signature, seal
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG'}), 400
    
    try:
        # Read file and convert to base64
        file_content = file.read()
        base64_data = base64.b64encode(file_content).decode('utf-8')
        
        # Determine MIME type
        ext = file.filename.rsplit('.', 1)[1].lower()
        mime_type = f'image/{ext}' if ext != 'jpg' else 'image/jpeg'
        
        # Create data URL
        data_url = f'data:{mime_type};base64,{base64_data}'
        
        return jsonify({
            'success': True,
            'type': image_type,
            'dataUrl': data_url,
            'filename': secure_filename(file.filename)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/export/<template_id>', methods=['GET'])
def export_template(template_id):
    """Export a custom template as a JSON file."""
    templates_dir = current_app.config['TEMPLATES_DIR']
    filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Template not found'}), 404
    
    try:
        return send_file(
            filepath,
            mimetype='application/json',
            as_attachment=True,
            download_name=f'template_{template_id}.json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@template_bp.route('/import', methods=['POST'])
def import_template():
    """Import a template from a JSON file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.json'):
        return jsonify({'error': 'Invalid file type. Only JSON files are allowed'}), 400
    
    try:
        content = file.read().decode('utf-8')
        template_data = json.loads(content)
        
        # Validate required fields
        if 'settings' not in template_data and 'baseType' not in template_data:
            return jsonify({'error': 'Invalid template format'}), 400
        
        # Create new template with new ID
        template_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        template = {
            'id': template_id,
            'name': template_data.get('name', 'Imported Template'),
            'baseType': template_data.get('baseType', 'general'),
            'settings': template_data.get('settings', {}),
            'logo': template_data.get('logo'),
            'signatures': template_data.get('signatures', {}),
            'departmentSeal': template_data.get('departmentSeal'),
            'templateContentData': template_data.get('templateContentData', {}),
            'securityLevel': template_data.get('securityLevel', '内部公开'),
            'tableColumnWidths': template_data.get('tableColumnWidths', {}),
            'fieldFormats': template_data.get('fieldFormats', {}),
            'createdAt': now,
            'updatedAt': now,
            'importedFrom': template_data.get('id')
        }
        
        templates_dir = current_app.config['TEMPLATES_DIR']
        filepath = os.path.join(templates_dir, f'custom_{template_id}.json')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(template, f, ensure_ascii=False, indent=2)
        
        return jsonify(template), 201
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
