#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Report Routes - API endpoints for report operations

Handles report CRUD operations, draft management, and state persistence.
"""

import json
import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app

report_bp = Blueprint('report', __name__)


@report_bp.route('/drafts', methods=['GET'])
def list_drafts():
    """List all saved report drafts."""
    drafts_dir = current_app.config['DRAFTS_DIR']
    drafts = []
    
    if os.path.exists(drafts_dir):
        for filename in os.listdir(drafts_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(drafts_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        draft = json.load(f)
                        drafts.append({
                            'id': draft.get('id'),
                            'title': draft.get('title', 'Untitled'),
                            'templateType': draft.get('templateType', 'general'),
                            'updatedAt': draft.get('updatedAt'),
                            'createdAt': draft.get('createdAt')
                        })
                except Exception as e:
                    current_app.logger.error(f"Error reading draft {filename}: {e}")
    
    # Sort by updated date, newest first
    drafts.sort(key=lambda x: x.get('updatedAt', ''), reverse=True)
    return jsonify({'drafts': drafts})


@report_bp.route('/drafts/<draft_id>', methods=['GET'])
def get_draft(draft_id):
    """Get a specific draft by ID."""
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'{draft_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Draft not found'}), 404
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            draft = json.load(f)
        return jsonify(draft)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route('/drafts', methods=['POST'])
def create_draft():
    """Create a new draft."""
    data = request.get_json()
    
    draft_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    draft = {
        'id': draft_id,
        'title': data.get('title', 'Untitled Report'),
        'templateType': data.get('templateType', 'general'),
        'content': data.get('content', {}),
        'createdAt': now,
        'updatedAt': now
    }
    
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'{draft_id}.json')
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(draft, f, ensure_ascii=False, indent=2)
        return jsonify(draft), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route('/drafts/<draft_id>', methods=['PUT'])
def update_draft(draft_id):
    """Update an existing draft."""
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'{draft_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Draft not found'}), 404
    
    data = request.get_json()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            draft = json.load(f)
        
        # Update fields
        if 'title' in data:
            draft['title'] = data['title']
        if 'content' in data:
            draft['content'] = data['content']
        if 'templateType' in data:
            draft['templateType'] = data['templateType']
        
        draft['updatedAt'] = datetime.now().isoformat()
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(draft, f, ensure_ascii=False, indent=2)
        
        return jsonify(draft)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route('/drafts/<draft_id>', methods=['DELETE'])
def delete_draft(draft_id):
    """Delete a draft."""
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'{draft_id}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'Draft not found'}), 404
    
    try:
        os.remove(filepath)
        return jsonify({'message': 'Draft deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route('/autosave', methods=['POST'])
def autosave():
    """Auto-save current editing state."""
    data = request.get_json()
    draft_id = data.get('id')
    
    if not draft_id:
        # Create new draft for autosave
        draft_id = 'autosave_' + data.get('templateType', 'general')
    
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'{draft_id}.json')
    
    now = datetime.now().isoformat()
    
    draft = {
        'id': draft_id,
        'title': data.get('title', 'Auto-saved Report'),
        'templateType': data.get('templateType', 'general'),
        'content': data.get('content', {}),
        'updatedAt': now,
        'isAutosave': True
    }
    
    # Preserve createdAt if exists
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                existing = json.load(f)
                draft['createdAt'] = existing.get('createdAt', now)
        except:
            draft['createdAt'] = now
    else:
        draft['createdAt'] = now
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(draft, f, ensure_ascii=False, indent=2)
        return jsonify({'message': 'Auto-saved successfully', 'id': draft_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route('/autosave/<template_type>', methods=['GET'])
def get_autosave(template_type):
    """Get auto-saved state for a template type."""
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'autosave_{template_type}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'exists': False})
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            draft = json.load(f)
        return jsonify({'exists': True, 'draft': draft})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@report_bp.route('/autosave/<template_type>', methods=['DELETE'])
def delete_autosave(template_type):
    """Delete auto-saved state for a template type."""
    drafts_dir = current_app.config['DRAFTS_DIR']
    filepath = os.path.join(drafts_dir, f'autosave_{template_type}.json')
    
    if not os.path.exists(filepath):
        return jsonify({'message': 'No autosave found', 'deleted': False})
    
    try:
        os.remove(filepath)
        return jsonify({'message': 'Autosave deleted successfully', 'deleted': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
