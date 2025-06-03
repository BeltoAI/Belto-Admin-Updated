import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSend, FiPaperclip, FiCopy, FiX, FiUser } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';
import axios from 'axios';
import Image from 'next/image';
import ChatPreferences from './components/ChatPreferences';

const ChatSection = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [promptCount, setPromptCount] = useState(0);
  const [tokenUsage, setTokenUsage] = useState({ total: 0, max: 0 });
  const [tokenLimitExceeded, setTokenLimitExceeded] = useState(false);
  const [ragContext, setRagContext] = useState(null); // Track RAG context usage
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchParams = useSearchParams();
  const lectureId = searchParams.get('lectureId');

  // Auto-scroll when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  // Fetch preferences when component mounts
  useEffect(() => {
    if (lectureId) {
      fetchPreferences();
    }
  }, [lectureId]);

  // Debounced RAG content checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input.trim().length > 10) { // Only check for queries longer than 10 characters
        checkRagContent(input.trim());
      } else {
        setRagContext(null);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [input, lectureId]);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`/api/ai-preferences?lectureId=${lectureId}`);
      if (response.status === 200) {
        setPreferences(response.data);
        // Set max tokens from preferences if available
        if (response.data.maxTokens) {
          setTokenUsage(prev => ({ ...prev, max: response.data.maxTokens }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI preferences:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileProcessing(true);
    const newAttachments = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type and size
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not supported. Please upload PDF or DOC files.`);
          continue;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload to document processing endpoint
        const uploadResponse = await axios.post('/api/document-process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadResponse.status === 200 && uploadResponse.data) {
          newAttachments.push({
            name: file.name,
            type: file.type,
            content: uploadResponse.data.text || 'Content could not be extracted',
            url: uploadResponse.data.url || null
          });
          toast.success(`File ${file.name} processed successfully`);
        }
      }
      
      if (newAttachments.length > 0) {
        setAttachments([...attachments, ...newAttachments]);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process uploaded files. Please try again.');
    } finally {
      setFileProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }  };

  // Check for relevant content using RAG
  const checkRagContent = async (query) => {
    if (!lectureId || !query.trim()) {
      setRagContext(null);
      return;
    }

    try {
      const response = await axios.post('/api/rag', {
        query: query.trim(),
        lectureId: lectureId,
        maxResults: 3,
        format: 'raw'
      });

      if (response.data.success && response.data.contentCount > 0) {
        setRagContext({
          contentCount: response.data.contentCount,
          sources: response.data.content.map(item => ({
            source: item.source,
            sourceInfo: item.sourceInfo,
            similarity: item.similarity,
            type: item.type
          }))
        });
      } else {
        setRagContext(null);
      }
    } catch (error) {
      console.error('Error checking RAG content:', error);
      setRagContext(null);
    }
  };

  // Remove an attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;
    
    // Check if we've reached the prompt limit
    if (preferences?.numPrompts && promptCount >= preferences.numPrompts) {
      toast.error(`You have reached the maximum number of prompts (${preferences.numPrompts}) for this session.`);
      return;
    }
    
    // Check if we've reached the token limit
    if (tokenLimitExceeded) {
      toast.error(`You have exceeded the token limit (${tokenUsage.max}). Please start a new session.`);
      return;
    }

    // Create user message with attachments
    const userMessage = {
      role: 'user',
      content: input,
      attachments: attachments.length > 0 ? attachments.map(a => ({
        name: a.name,
        type: a.type
      })) : undefined
    };

    // Add message to chat and reset state
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Increment prompt count
    setPromptCount(prev => prev + 1);

    // Create context from attachments if any
    let contextFromAttachments = '';
    if (attachments.length > 0) {
      contextFromAttachments = '\n\nContext from attached documents:\n';
      attachments.forEach((attachment, index) => {
        contextFromAttachments += `\n[Document ${index + 1}: ${attachment.name}]\n${attachment.content}\n`;
      });
    }

    // Combine user message with context from attachments
    const messageContent = input.trim() + 
      (contextFromAttachments && input.trim() ? contextFromAttachments : contextFromAttachments);
    
    try {
      // Get system prompts from preferences
      const systemPrompts = preferences?.systemPrompts?.map(p => ({
        role: "system", 
        content: p.content
      })) || [];
      
      // Default system prompt if none are set in preferences
      if (systemPrompts.length === 0) {
        systemPrompts.push({
          role: "system",
          content: "You are a helpful AI assistant."
        });
      }
      
      const payload = {
        model: preferences?.model || "gpt-3.5-turbo",
        messages: [
          ...systemPrompts,
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          { 
            role: "user", 
            content: messageContent
          }
        ],
        temperature: preferences?.temperature || 0.7,
        stream: true,
        lectureId: lectureId
      };

      // Add max tokens if set in preferences
      if (preferences?.maxTokens) {
        payload.max_tokens = preferences.maxTokens;
      }

      // Clear attachments after sending
      setAttachments([]);

      const shouldStream = preferences?.streaming !== false;

      if (shouldStream) {
        const response = await fetch('/api/ai-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botMessageContent = '';
        let usageInfo = null;        const botMessage = {
          role: 'assistant',
          content: '',
          usage: null,
          ragUsed: ragContext && ragContext.contentCount > 0 // Track if RAG was used
        };
        
        setMessages(prev => [...prev, botMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0].delta.content || '';
                botMessageContent += content;
                
                // Check if this chunk contains usage info
                if (data.usage) {
                  usageInfo = data.usage;
                  
                  // Update total token usage
                  const newTotalTokens = (tokenUsage.total + usageInfo.total_tokens) || usageInfo.total_tokens;
                  setTokenUsage(prev => ({
                    ...prev,
                    total: newTotalTokens
                  }));
                  
                  // Check if the token limit is now exceeded
                  if (tokenUsage.max > 0 && newTotalTokens > tokenUsage.max) {
                    setTokenLimitExceeded(true);
                    reader.cancel(); // Stop the stream
                    
                    // Add a message indicating the token limit is exceeded
                    setMessages(prev => [
                      ...prev,
                      {
                        role: 'system',
                        content: `Token limit of ${tokenUsage.max} exceeded. Response was truncated.`
                      }
                    ]);
                    break;
                  }
                }
                  setMessages(prev => 
                  prev.map((msg, idx) => 
                    idx === prev.length - 1 ? { 
                      ...msg, 
                      content: botMessageContent,
                      usage: usageInfo,
                      ragUsed: ragContext && ragContext.contentCount > 0
                    } : msg
                  )
                );
              } catch (e) {
                console.error('Error parsing SSE:', e, line);
              }
            }
          }
        }
      } else {
        payload.stream = false;
        const response = await axios.post('/api/ai-proxy', payload);
        
        // Extract usage information from response
        const usage = response.data.usage || null;
        
        // Update total token usage if available
        let newTotalTokens = tokenUsage.total;
        if (usage && usage.total_tokens) {
          newTotalTokens = tokenUsage.total + usage.total_tokens;
          setTokenUsage(prev => ({
            ...prev,
            total: newTotalTokens
          }));
        }
          setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.choices[0].message.content,
          usage: usage,
          ragUsed: ragContext && ragContext.contentCount > 0 // Track if RAG was used
        }]);
        
        // Check if the token limit is now exceeded
        if (tokenUsage.max > 0 && newTotalTokens > tokenUsage.max) {
          setTokenLimitExceeded(true);
          setMessages(prev => [
            ...prev,
            {
              role: 'system',
              content: `Token limit of ${tokenUsage.max} exceeded. This was the last allowed response.`
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Error: ${error.message || 'Failed to get a response'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  // Calculate remaining tokens
  const remainingTokens = tokenUsage.max ? tokenUsage.max - tokenUsage.total : null;

  return (
    <div className="mt-8 bg-[#111111] rounded-xl p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        {/* Token usage information */}
        <div className="flex items-center">
          {tokenUsage.max > 0 && (
            <div className={`text-sm ${remainingTokens < 0 ? 'bg-red-900' : 'bg-gray-800'} rounded-md px-3 py-1.5`}>
              <span className={remainingTokens < 0 ? 'text-red-400 font-medium' : 'text-yellow-400 font-medium'}>
                {remainingTokens >= 0 ? remainingTokens : 0}
              </span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-400">{tokenUsage.max}</span>
              <span className="text-gray-400 ml-1">tokens remaining</span>
            </div>
          )}
        </div>
        
        {/* Prompt count and preferences */}
        <div className="flex items-center space-x-4">
          {preferences?.numPrompts && (
            <div className="text-sm text-gray-400">
              <span className="font-medium">{promptCount}</span>
              <span className="mx-1">/</span>
              <span>{preferences.numPrompts}</span>
              <span className="ml-1">prompts</span>
            </div>
          )}
          <ChatPreferences 
            preferences={preferences || {}} 
            onRefreshPreferences={fetchPreferences}
          />
        </div>
      </div>
      
      <div 
        ref={chatContainerRef} 
        className="bg-[#1a1a1a] rounded-lg p-4 h-[400px] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex justify-start">
              {/* Avatar for all messages */}
              <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                {message.role === 'user' ? (
                  <div className="bg-gray-800 w-full h-full rounded-full flex items-center justify-center">
                    <FiUser className="text-white" />
                  </div>
                ) : message.role === 'system' ? (
                  <div className="bg-red-500 w-full h-full rounded-full flex items-center justify-center text-black font-bold">
                    !
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Belto Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-gray-700 text-white' 
                    : message.role === 'system' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-[#262626] text-gray-200'
                }`}
              >                {message.role === 'assistant' && (
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        <span className="text-yellow-500">B</span>ELTO
                      </span>
                      {message.ragUsed && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded" title="Response enhanced with course materials">
                          📚 RAG
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {message.usage && (
                        <span className="text-xs text-gray-500" title="Tokens used in this response">
                          {message.usage.total_tokens || message.usage.completion_tokens || '?'} tokens
                        </span>
                      )}
                      <button 
                        onClick={() => copyToClipboard(message.content)}
                        className="text-gray-400 hover:text-white"
                        title="Copy to clipboard"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                
                {message.role === 'user' && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-300">YOU</span>
                  </div>
                )}
                
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* Display attachment indicators */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Attached: {message.attachments.map(a => a.name).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center mr-2">
              <Image
                src="/logo.png"
                alt="Belto Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="bg-[#262626] text-white rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Display current attachments */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="bg-gray-800 rounded-md px-3 py-1 flex items-center gap-2">
              <span className="text-sm text-gray-300 truncate max-w-[180px]">{file.name}</span>
              <button 
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>      )}
      
      {/* Display RAG context information */}
      {ragContext && (
        <div className="mb-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-sm font-medium text-blue-300">
              Relevant course materials found
            </span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
              {ragContext.contentCount} source{ragContext.contentCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ragContext.sources.map((source, index) => (
              <div key={index} className="bg-blue-900/40 rounded px-2 py-1 text-xs text-blue-200">
                {source.type === 'document' ? '📚' : '🌐'} 
                {source.sourceInfo.materialName || source.sourceInfo.url || 'Course Material'}
                <span className="ml-1 text-blue-400">
                  ({Math.round(source.similarity * 100)}% match)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-blue-300/70">
            These materials will be used to provide contextual answers
          </div>
        </div>
      )}
      
      {/* Input form with file upload */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#1a1a1a] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            disabled={
              isLoading || 
              fileProcessing || 
              (preferences?.numPrompts && promptCount >= preferences.numPrompts) ||
              tokenLimitExceeded
            }
          />
          
          {/* File upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={
              isLoading || 
              fileProcessing || 
              (preferences?.numPrompts && promptCount >= preferences.numPrompts) ||
              tokenLimitExceeded
            }
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 disabled:opacity-50"
            title="Attach document"
          >
            <FiPaperclip size={20} />
          </button>
          
          {/* Hidden file input */}
          <input 
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
            multiple
            disabled={
              isLoading || 
              fileProcessing || 
              (preferences?.numPrompts && promptCount >= preferences.numPrompts) ||
              tokenLimitExceeded
            }
          />
          
          <button
            type="submit"
            disabled={
              isLoading || 
              fileProcessing || 
              (!input.trim() && attachments.length === 0) || 
              (preferences?.numPrompts && promptCount >= preferences.numPrompts) ||
              tokenLimitExceeded
            }
            className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg px-4 py-2 disabled:opacity-50"
          >
            <FiSend size={20} />
          </button>
        </div>
        
        {/* Processing indicator */}
        {fileProcessing && (
          <div className="text-yellow-500 text-sm flex items-center gap-2 mt-1">
            <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <span>Processing document...</span>
          </div>
        )}
        
        {/* Prompt limit warning */}
        {preferences?.numPrompts && promptCount >= preferences.numPrompts && (
          <div className="text-red-400 text-sm mt-1">
            You have reached your prompt limit. Please start a new session.
          </div>
        )}
        
        {/* Token limit warning */}
        {tokenLimitExceeded && (
          <div className="text-red-400 text-sm mt-1">
            You have exceeded the token limit ({tokenUsage.max}). Please start a new session.
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatSection;