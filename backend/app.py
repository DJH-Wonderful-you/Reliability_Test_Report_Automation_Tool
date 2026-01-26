#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Flask Main Application for Reliability Test Report Automation Tool

This is the main entry point for the backend server.
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS

# Import route blueprints
from routes.report import report_bp
from routes.template import template_bp
from routes.export import export_bp


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    
    # Enable CORS for development
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Data storage directory
    app.config['DATA_DIR'] = os.path.join(os.path.dirname(__file__), 'data')
    app.config['DRAFTS_DIR'] = os.path.join(app.config['DATA_DIR'], 'drafts')
    app.config['TEMPLATES_DIR'] = os.path.join(app.config['DATA_DIR'], 'templates')
    app.config['UPLOADS_DIR'] = os.path.join(app.config['DATA_DIR'], 'uploads')
    
    # Create directories if they don't exist
    for dir_path in [app.config['DATA_DIR'], app.config['DRAFTS_DIR'], 
                     app.config['TEMPLATES_DIR'], app.config['UPLOADS_DIR']]:
        os.makedirs(dir_path, exist_ok=True)
    
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
