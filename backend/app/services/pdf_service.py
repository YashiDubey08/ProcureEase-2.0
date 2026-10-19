import os
import pymupdf

def extract_pdf_pages(file_path):
    """
    Extracts text page-by-page using PyMuPDF (fitz).
    Returns:
        dict: {
            "success": bool,
            "total_pages": int,
            "pages": [{"page_num": int, "text": str}],
            "full_text": str,
            "error": str or None
        }
    """
    if not os.path.exists(file_path):
        return {
            "success": False,
            "total_pages": 0,
            "pages": [],
            "full_text": "",
            "error": "File does not exist on disk."
        }

    try:
        doc = pymupdf.open(file_path)
    except Exception as e:
        return {
            "success": False,
            "total_pages": 0,
            "pages": [],
            "full_text": "",
            "error": f"Invalid or corrupted PDF file: {str(e)}"
        }

    total_pages = len(doc)
    if total_pages == 0:
        doc.close()
        return {
            "success": False,
            "total_pages": 0,
            "pages": [],
            "full_text": "",
            "error": "The PDF document contains 0 pages."
        }

    pages_data = []
    full_text_parts = []

    try:
        for idx in range(total_pages):
            page = doc[idx]
            page_text = page.get_text("text").strip()
            pages_data.append({
                "page_num": idx + 1,
                "text": page_text
            })
            if page_text:
                full_text_parts.append(f"--- PAGE {idx + 1} ---\n{page_text}")
    except Exception as e:
        doc.close()
        return {
            "success": False,
            "total_pages": total_pages,
            "pages": pages_data,
            "full_text": "\n\n".join(full_text_parts),
            "error": f"Error occurred while extracting page text: {str(e)}"
        }

    doc.close()
    full_text = "\n\n".join(full_text_parts)

    if not full_text.strip():
        return {
            "success": True,
            "total_pages": total_pages,
            "pages": pages_data,
            "full_text": "",
            "warning": "The PDF was parsed, but contains no selectable text (scanned image or empty)."
        }

    return {
        "success": True,
        "total_pages": total_pages,
        "pages": pages_data,
        "full_text": full_text,
        "error": None
    }
