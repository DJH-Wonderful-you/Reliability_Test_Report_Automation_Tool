#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Flask Main Application for Reliability Test Report Automation Tool

This is the main entry point for the backend server.
"""

import os
import shutil
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS

# Import route blueprints
from routes.report import report_bp
from routes.template import template_bp
from routes.export import export_bp


def _project_root():
    if getattr(sys, 'frozen', False):
        return getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    return os.path.dirname(os.path.dirname(__file__))


def _resource_path(*parts):
    return os.path.join(_project_root(), *parts)


def _runtime_data_dir():
    configured = os.environ.get('RELIABILITY_TOOL_DATA_DIR')
    if configured:
        return configured
    if getattr(sys, 'frozen', False):
        return os.path.join(os.path.dirname(sys.executable), 'data')
    return os.path.join(os.path.dirname(__file__), 'data')


def _seed_templates(target_templates_dir):
    source_templates_dir = _resource_path('backend', 'data', 'templates')
    if not os.path.isdir(source_templates_dir):
        return

    os.makedirs(target_templates_dir, exist_ok=True)
    for filename in os.listdir(source_templates_dir):
        if not filename.endswith('.json'):
            continue
        source = os.path.join(source_templates_dir, filename)
        target = os.path.join(target_templates_dir, filename)
        if not os.path.exists(target):
            shutil.copy2(source, target)


def create_app(static_folder=None, data_dir=None):
    """Create and configure the Flask application."""
    app = Flask(
        __name__,
        static_folder=static_folder or _resource_path('frontend', 'dist'),
        static_url_path=''
    )
    
    # Enable CORS for development
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 64MB max request size (supports vector PDF payloads)
    
    # Data storage directory
    app.config['DATA_DIR'] = data_dir or _runtime_data_dir()
    app.config['DRAFTS_DIR'] = os.path.join(app.config['DATA_DIR'], 'drafts')
    app.config['TEMPLATES_DIR'] = os.path.join(app.config['DATA_DIR'], 'templates')
    app.config['UPLOADS_DIR'] = os.path.join(app.config['DATA_DIR'], 'uploads')
    
    # Create directories if they don't exist
    for dir_path in [app.config['DATA_DIR'], app.config['DRAFTS_DIR'], 
                     app.config['TEMPLATES_DIR'], app.config['UPLOADS_DIR']]:
        os.makedirs(dir_path, exist_ok=True)

    _seed_templates(app.config['TEMPLATES_DIR'])
    
    # Register blueprints
    app.register_blueprint(report_bp, url_prefix='/api/report')
    app.register_blueprint(template_bp, url_prefix='/api/template')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    
    # Serve frontend static files
    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'version': '1.0.0'}
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=5000)
