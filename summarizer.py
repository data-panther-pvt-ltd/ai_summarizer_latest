from typing import List
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import Document

class DocumentSummarizer:
    """Handles direct document summarization without chunking"""
    
    def __init__(self, model_name: str = "gemma3:1b"):
        self.llm = ChatOllama(model=model_name)
        self.parser = StrOutputParser()
    
    def combine_documents(self, documents: List[Document]) -> str:
        combined_text = ""
        for doc in documents:
            combined_text += doc.page_content + "\n\n"
        return combined_text.strip()
    
    def get_style_prompt(self, style: str) -> str:
        """Get style-specific prompt instructions"""
        style_prompts = {
            "Professional": "Write in a professional, business-like tone suitable for corporate environments.",
            "Academic": "Use formal academic language with proper citations and scholarly tone.",
            "Simple": "Use simple, clear language that anyone can understand. Avoid jargon.",
            "Bullet Points": "Present the summary as a structured list with bullet points for key information.",
            "Executive Summary": "Create a high-level executive summary focusing on key decisions, outcomes, and recommendations."
        }
        return style_prompts.get(style, "Write in a clear and professional manner.")
    
    def summarize_documents(self, documents: List[Document], target_length: str = "300-500 words", style: str = "Professional") -> str:
        print("target len: ", target_length)
        print("style: ", style)
        combined_text = self.combine_documents(documents)
        
        style_instruction = self.get_style_prompt(style)
        
        summary_prompt = ChatPromptTemplate.from_template(
            f"""
            You are a professional summarizer. Follow these strict instructions:

            - {style_instruction}
            - Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity and conciseness.
            - Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.
            - Rely strictly on the provided text, without including external information
            - Maintain accuracy and preserve the original meaning
            - {target_length}
            - Please provide only the summary without any additional commentary
            - Return the summary in markdown format only.
            
            TEXT:
            {{text}}
            """
        )

        print(summary_prompt)
        print(self.llm)
        
        summary_chain = summary_prompt | self.llm | self.parser
        summary = summary_chain.invoke({"text": combined_text})
        
        return summary
