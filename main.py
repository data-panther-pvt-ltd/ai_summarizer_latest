import streamlit as st
from content_loader import ContentLoader
from summarizer import DocumentSummarizer
from dotenv import load_dotenv
from auth import authenticate_user, show_user_info, require_authentication
load_dotenv()

st.set_page_config(
    page_title="AI Text Summarizer",
    page_icon="📚"
)

st.title("📚 AI Text Summarizer")

auth_status, authenticator = authenticate_user()

if auth_status is False:
    st.error("❌ Username/password is incorrect")
    st.stop()
elif auth_status is None:
    # st.warning("🔐 Please enter your username and password")
    st.stop()

if auth_status:
    show_user_info(authenticator, "sidebar")
    st.markdown("Transform your documents, text into concise summaries with AI!")

    content_loader = ContentLoader()

    with st.sidebar:
        st.header("⚙️ Configuration")
    
        # AI Model Selection
        st.subheader("🤖 AI Model")
        available_models = {
            "Llama 3.2 ": "llama3.2:latest",
            "DeepSeek R1": "deepseek-r1:latest"
        }

        
        selected_model = st.selectbox(
            "Choose AI Model:",
            options=list(available_models.keys()),
            index=0,
            help="Select the AI model for summarization. Larger models provide better quality but are slower."
        )
        
        # Summarization Length Options
        st.subheader("📏 Summary Length")
        length_option = st.radio(
            "Choose summary length:",
            ["Small (100-200 words)", "Medium (300-500 words)", "Large (600-800 words)", "Custom"],
            help="Select how detailed you want your summary to be"
        )
        
        custom_word_count = None
        if length_option == "Custom":
            custom_word_count = st.number_input(
                "Target word count:",
                value=300,
                step=1,
                format="%d",
                help="Specify the exact number of words for your summary"
            )
        
        # Summary Style
        st.subheader("🎨 Summary Style")
        summary_style = st.selectbox(
            "Choose summary style:",
            ["Professional", "Academic", "Simple", "Bullet Points", "Executive Summary"],
            help="Select the tone and format of your summary"
        )

    # Main content area
    tab1, tab2, tab3 = st.tabs(["✏️ Enter Text", "📄 Upload File", "🌐 Enter URL"])

    documents = None

    with tab1:
        st.markdown("### ✏️ Enter text to summarize")
        manual_text = st.text_area(
            "Paste your text here:",
            height=300,
            placeholder="Enter or paste the text you want to summarize...",
            key="text_input",
            help="You can paste any text content here for summarization"
        )
        
        if manual_text.strip():
            try:
                documents = content_loader.load_text(manual_text)
                
                # Display text info
                col1, col2 = st.columns(2)
                with col1:
                    st.metric("Characters", len(manual_text))
                with col2:
                    st.metric("Words", len(manual_text.split()))
                    
            except Exception as e:
                st.error(f"❌ Error loading text: {str(e)}")
                st.stop()

    with tab2:
        st.markdown("### 📁 Upload a document to summarize")
        uploaded_file = st.file_uploader(
            "Choose a Text, PDF or docx file:", 
            type=["txt", "pdf", "docx"],
            key="file_uploader",
            help="Supported formats: TXT, PDF, DOCX"
        )
        
        if uploaded_file is not None:
            with st.spinner("🔄 Processing file..."):
                try:
                    documents = content_loader.load_file(uploaded_file)
                    st.success(f"✅ File '{uploaded_file.name}' loaded successfully!")
                        
                except Exception as e:
                    st.error(f"❌ Error loading file: {str(e)}")
                    st.stop()

    with tab3:
        st.markdown("### 🌐 Enter URL to summarize")
        url_input = st.text_input(
            "Enter webpage URL:",
            placeholder="https://example.com/article",
            key="url_input",
            help="Enter the URL of a webpage you want to summarize"
        )
        
        if url_input.strip():
            with st.spinner("🔄 Loading webpage content..."):
                try:
                    documents = content_loader.load_url(url_input)
                    st.success(f"✅ Webpage content loaded successfully!")
                    print(documents)
                    
                    # Display content info
                    if documents:
                        total_chars = sum(len(doc.page_content) for doc in documents)
                        total_words = sum(len(doc.page_content.split()) for doc in documents)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.metric("Characters", total_chars)
                        with col2:
                            st.metric("Words", total_words)
                            
                except Exception as e:
                    st.error(f"❌ Error loading webpage: {str(e)}")
                    st.info("💡 Tip: Make sure the URL is valid and accessible.")
                    st.stop()


    # Summarize button
    if st.button("🚀 Generate Summary", type="primary", disabled=documents is None):
        if documents is None:
            st.warning("⚠️ Please upload a file, enter text, or provide a URL first.")
        else:
            summarizer = DocumentSummarizer(model_name=available_models[selected_model])
            
            # Determine target length
            if length_option == "Small (100-200 words)":
                target_length = "Write a detailed and in-depth summary between 100-200 words"
            elif length_option == "Medium (300-500 words)":
                target_length = "Write a detailed and in-depth summary between 300-500 words"
            elif length_option == "Large (600-800 words)":
                target_length = "Write a detailed and in-depth summary between 600-800 words"
            else:  # Custom
                target_length = f"Write a detailed and in-depth summary that should be {custom_word_count} words"
            
            # Create progress container
            progress_container = st.container()
            
            with progress_container:
                with st.spinner(f"Generating {length_option.lower()} summary using {selected_model}..."):
                    try:
                        final_summary = summarizer.summarize_documents(
                            documents, 
                            target_length=target_length,
                            style=summary_style
                        )
                        
                        st.markdown("## 📋 Generated Summary")
                        
                        summary_words = len(final_summary.split())
                        st.caption(f"📊 Summary length: {summary_words} words | Style: {summary_style}")
                        
                        with st.container():
                            st.markdown(final_summary)
                        
                        st.download_button(
                                label="📄 Download as Markdown",
                                data=final_summary,
                                file_name="summary.md",
                                mime="text/markdown",
                                use_container_width=True
                            )
                        
                    except Exception as e:
                        st.error(f"❌ Error generating summary: {str(e)}")
                        st.info("💡 Tip: Try a different AI model or check if Ollama is running with the selected model.")
                        st.stop()