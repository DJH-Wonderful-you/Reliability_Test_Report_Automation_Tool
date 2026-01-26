#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PDF Parser Script for Reliability Test Report Automation Tool

This script extracts text content, positions, colors, and font sizes from the
'通用.pdf' template file to generate a JSON template for the web application.
"""

import json
import os
import pdfplumber
from pathlib import Path


def rgb_to_color_name(rgb):
    """
    Convert RGB tuple to color name (black or blue).
    
    Args:
        rgb: RGB tuple or single value
        
    Returns:
        'blue' if the color is blue-ish, 'black' otherwise
    """
    if rgb is None:
        return 'black'
    
    # Handle different color formats
    if isinstance(rgb, (list, tuple)):
        if len(rgb) >= 3:
            r, g, b = rgb[0], rgb[1], rgb[2]
            # Check if it's blue (high blue value, low red and green)
            if b > 0.5 and r < 0.5 and g < 0.5:
                return 'blue'
            # Check for specific blue values in 0-1 range
            if b > r and b > g and b > 0.3:
                return 'blue'
        elif len(rgb) == 1:
            # Grayscale
            return 'black'
    elif isinstance(rgb, (int, float)):
        # Single value (grayscale)
        return 'black'
    
    return 'black'


def extract_text_elements(page, page_num):
    """
    Extract all text elements from a PDF page with their properties.
    
    Args:
        page: pdfplumber page object
        page_num: Page number (0-indexed)
        
    Returns:
        List of text element dictionaries
    """
    elements = []
    chars = page.chars
    
    # Group characters by their approximate position to form text blocks
    current_text = ""
    current_x = None
    current_y = None
    current_size = None
    current_color = None
    current_top = None
    
    # Sort chars by top (y position) then by x position
    sorted_chars = sorted(chars, key=lambda c: (round(c['top'], 1), c['x0']))
    
    text_blocks = []
    current_block = {
        'chars': [],
        'top': None,
        'x0': None,
        'fontname': None,
        'size': None,
        'color': None
    }
    
    for char in sorted_chars:
        if char['text'].strip() == '':
            continue
            
        char_top = round(char['top'], 1)
        char_size = round(char['size'], 1) if char.get('size') else 11
        char_color = char.get('non_stroking_color') or char.get('stroking_color')
        
        # Check if this char belongs to the current block
        same_line = (current_block['top'] is None or 
                     abs(char_top - current_block['top']) < 3)
        same_style = (current_block['size'] is None or 
                      (abs(char_size - current_block['size']) < 0.5 and
                       rgb_to_color_name(char_color) == rgb_to_color_name(current_block['color'])))
        
        # Check horizontal continuity
        horizontal_gap = 15  # Max gap between characters in same block
        if current_block['chars']:
            last_char = current_block['chars'][-1]
            too_far = char['x0'] - last_char['x1'] > horizontal_gap
        else:
            too_far = False
        
        if same_line and same_style and not too_far:
            current_block['chars'].append(char)
            if current_block['top'] is None:
                current_block['top'] = char_top
                current_block['x0'] = char['x0']
                current_block['fontname'] = char.get('fontname', '')
                current_block['size'] = char_size
                current_block['color'] = char_color
        else:
            # Save current block and start new one
            if current_block['chars']:
                text_blocks.append(current_block)
            current_block = {
                'chars': [char],
                'top': char_top,
                'x0': char['x0'],
                'fontname': char.get('fontname', ''),
                'size': char_size,
                'color': char_color
            }
    
    # Don't forget the last block
    if current_block['chars']:
        text_blocks.append(current_block)
    
    # Convert blocks to elements
    for block in text_blocks:
        if not block['chars']:
            continue
            
        text = ''.join([c['text'] for c in block['chars']])
        x0 = block['x0']
        x1 = block['chars'][-1]['x1']
        y = block['top']
        
        color_name = rgb_to_color_name(block['color'])
        
        element = {
            'text': text,
            'x': round(x0, 2),
            'y': round(y, 2),
            'width': round(x1 - x0, 2),
            'fontSize': round(block['size'], 1) if block['size'] else 11,
            'fontName': block['fontname'] or 'default',
            'color': color_name,
            'editable': color_name == 'blue',
            'page': page_num
        }
        elements.append(element)
    
    return elements


def identify_sections(elements, page_height):
    """
    Identify header, footer, and content sections from elements.
    
    Args:
        elements: List of text elements
        page_height: Height of the PDF page
        
    Returns:
        Dictionary with header, footer, and sections
    """
    # Thresholds for header/footer detection (in points)
    header_threshold = 80  # Top 80 points is header
    footer_threshold = page_height - 120  # Bottom 120 points is footer
    
    header_elements = []
    footer_elements = []
    content_elements = []
    
    for elem in elements:
        if elem['y'] < header_threshold:
            header_elements.append(elem)
        elif elem['y'] > footer_threshold:
            footer_elements.append(elem)
        else:
            content_elements.append(elem)
    
    return {
        'header': header_elements,
        'footer': footer_elements,
        'content': content_elements
    }


def group_into_logical_sections(content_elements):
    """
    Group content elements into logical sections based on their layout.
    
    Args:
        content_elements: List of content text elements
        
    Returns:
        List of section dictionaries
    """
    # Sort by Y position
    sorted_elements = sorted(content_elements, key=lambda e: (e['y'], e['x']))
    
    sections = []
    current_section = None
    
    # Common section headers in the template
    section_headers = [
        '测试结果信息', '测试图片', '测试条件', '测试结论',
        '产品信息', '测试目的', '测试标准', '测试设备',
        'Test Results', 'Test Images', 'Test Conditions'
    ]
    
    for elem in sorted_elements:
        text = elem['text'].strip()
        
        # Check if this is a section header
        is_header = any(header in text for header in section_headers)
        
        if is_header or current_section is None:
            if current_section is not None:
                sections.append(current_section)
            current_section = {
                'name': text if is_header else 'General',
                'fields': [],
                'startY': elem['y']
            }
        
        current_section['fields'].append(elem)
    
    if current_section is not None:
        sections.append(current_section)
    
    return sections


def parse_pdf(pdf_path, output_path):
    """
    Parse a PDF file and extract template data.
    
    Args:
        pdf_path: Path to the PDF file
        output_path: Path to save the JSON output
    """
    print(f"Parsing PDF: {pdf_path}")
    
    with pdfplumber.open(pdf_path) as pdf:
        all_elements = []
        page_info = None
        
        for page_num, page in enumerate(pdf.pages):
            # Get page dimensions
            if page_info is None:
                page_info = {
                    'width': round(page.width, 2),
                    'height': round(page.height, 2)
                }
            
            # Extract text elements
            elements = extract_text_elements(page, page_num)
            all_elements.extend(elements)
            
            print(f"  Page {page_num + 1}: Found {len(elements)} text elements")
        
        # Identify sections
        sections_data = identify_sections(all_elements, page_info['height'])
        
        # Group content into logical sections
        logical_sections = group_into_logical_sections(sections_data['content'])
        
        # Build output structure
        output = {
            'pageSize': page_info,
            'totalPages': len(pdf.pages),
            'header': {
                'elements': sections_data['header'],
                'height': 80
            },
            'footer': {
                'elements': sections_data['footer'],
                'height': 120
            },
            'sections': logical_sections,
            'allElements': all_elements
        }
        
        # Analyze font sizes for header/footer
        if sections_data['header']:
            header_sizes = [e['fontSize'] for e in sections_data['header']]
            output['header']['defaultFontSize'] = max(header_sizes) if header_sizes else 14
        
        if sections_data['footer']:
            footer_sizes = [e['fontSize'] for e in sections_data['footer']]
            output['footer']['defaultFontSize'] = max(footer_sizes) if footer_sizes else 10
        
        # Create output directory if needed
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"\nTemplate data saved to: {output_path}")
        print(f"Total elements: {len(all_elements)}")
        print(f"  - Header elements: {len(sections_data['header'])}")
        print(f"  - Footer elements: {len(sections_data['footer'])}")
        print(f"  - Content sections: {len(logical_sections)}")
        
        # Print summary of editable vs fixed fields
        editable_count = sum(1 for e in all_elements if e['editable'])
        fixed_count = len(all_elements) - editable_count
        print(f"  - Editable fields (blue): {editable_count}")
        print(f"  - Fixed fields (black): {fixed_count}")
        
        return output


def main():
    """Main entry point."""
    # Get project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    
    # Input PDF path
    pdf_path = project_root / "Reference document" / "通用.pdf"
    
    # Output JSON path
    output_path = project_root / "src" / "templates" / "general_template.json"
    
    if not pdf_path.exists():
        print(f"Error: PDF file not found: {pdf_path}")
        return
    
    # Parse the PDF
    template_data = parse_pdf(str(pdf_path), str(output_path))
    
    # Also print a sample of the extracted data
    print("\n--- Sample of extracted elements ---")
    for i, elem in enumerate(template_data['allElements'][:10]):
        color_indicator = "[EDITABLE]" if elem['editable'] else "[FIXED]"
        print(f"{color_indicator} {elem['text'][:50]}... (x={elem['x']}, y={elem['y']}, size={elem['fontSize']})")


if __name__ == "__main__":
    main()
