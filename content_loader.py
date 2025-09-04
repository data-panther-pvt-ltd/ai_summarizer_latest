import os
import re
from typing import List
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader, WebBaseLoader
from langchain.schema import Document


class ContentLoader:
    """Handles loading of different content types including files and text"""
    
    def __init__(self):
        self.supported_file_types = {
            "text/plain": TextLoader,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": Docx2txtLoader,
            "application/pdf": PyPDFLoader
        }
    
    def _clean_web_content(self, text: str) -> str:
        """Clean web content by removing unwanted formatting and noise"""
        if not text:
            return text
        
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        text = re.sub(r'\\n', '\n', text)
        text = re.sub(r'\\t', '\t', text)
        text = re.sub(r'\\r', '', text)
        
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'&[a-zA-Z]+;', '', text)
        
        text = re.sub(r'[•·▪▫◦‣⁃]\s*', '', text)
        text = re.sub(r'[─━│┃┄┅┆┇┈┉┊┋]', '', text)
        
        text = re.sub(r'Share this page|Print this page|Email this page', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Cookie Policy|Privacy Policy|Terms of Service|Contact Us', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Subscribe|Newsletter|Sign up|Follow us', '', text, flags=re.IGNORECASE)
        
        text = re.sub(r'Home|About|Services|Products|Blog|News', '', text, flags=re.IGNORECASE)
        
        text = text.strip()
        
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line and len(line) > 3:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def load_file(self, uploaded_file) -> List[Document]:
        try:
            uploads_dir = "uploads"
            if not os.path.exists(uploads_dir):
                os.makedirs(uploads_dir)
            
            temp_file_path = os.path.join(uploads_dir, uploaded_file.name)
            with open(temp_file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            
            if uploaded_file.type in self.supported_file_types:
                loader_class = self.supported_file_types[uploaded_file.type]
                loader = loader_class(temp_file_path)
            else:
                raise ValueError(f"File type {uploaded_file.type} is not supported!")
            
            documents = loader.load()
            
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            
            return documents
            
        except Exception as e:
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            raise e
    
    def load_text(self, text: str) -> List[Document]:
        if not text.strip():
            raise ValueError("Text cannot be empty!")
        
        document = Document(page_content=text, metadata={"source": "manual_input"})
        return [document]
    
    def load_url(self, url: str) -> List[Document]:
        try:
            if not url:
                raise ValueError("URL cannot be empty!")
        
            loader = WebBaseLoader(web_path=url)
            documents = loader.load()

            # Clean the content of each document
            cleaned_documents = []
            for doc in documents:
                cleaned_content = self._clean_web_content(doc.page_content)
                if cleaned_content.strip():  # Only keep documents with meaningful content
                    cleaned_doc = Document(
                        page_content=cleaned_content,
                        metadata=doc.metadata
                    )
                    cleaned_documents.append(cleaned_doc)

            print(cleaned_documents)

            return cleaned_documents

        except Exception as e:
            print(e)
            raise e