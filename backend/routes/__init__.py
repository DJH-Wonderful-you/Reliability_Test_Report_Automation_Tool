#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Routes package initialization
"""

from .report import report_bp
from .template import template_bp
from .export import export_bp

__all__ = ['report_bp', 'template_bp', 'export_bp']
