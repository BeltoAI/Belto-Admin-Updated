export const initialClasses = [
    {
      id: 1,
      name: 'Introduction to AI',
      description: 'This course introduces the fundamentals of Artificial Intelligence, focusing on basic concepts like machine learning, neural networks, and natural language processing.',
      students: 25,
      startDate: '2025-01-02',
      endDate: '2025-05-15',
      progress: '10/14',
      link: 'https://universitywebsite.com/professors/john-doe/courses/introduction-to-ai/pin',
      status: 'active',
      enrollmentCode: 'AI101',
      aiSettings: {
        model: 'Llama 3',
        copyPasteRestriction: false,
        temperature: 0.7,
        maxTokens: 1000
      },
      lectureMaterials: [
        {
          id: 1,
          title: 'AI Fundamentals PDF',
          type: 'pdf',
          uploadDate: '2025-01-05'
        },
        {
          id: 2,
          title: 'Neural Networks Video',
          type: 'video',
          uploadDate: '2025-01-12'
        }
      ],
      faqs: [
        {
          id: 1,
          question: 'What prerequisites are needed?',
          answer: 'Basic programming knowledge in Python is required.'
        }
      ]
    },
    {
      id: 2,
      name: 'Advanced Machine Learning',
      description: 'Deep dive into advanced machine learning techniques including deep learning architectures and model optimization.',
      students: 18,
      startDate: '2025-03-10',
      endDate: '2025-06-20',
      progress: '5/14',
      link: 'https://universitywebsite.com/professors/jane-smith/courses/advanced-ml/pin',
      status: 'active',
      enrollmentCode: 'ML202',
      aiSettings: {
        model: 'Zypher 7B',
        copyPasteRestriction: true,
        temperature: 0.5,
        maxTokens: 800
      },
      lectureMaterials: [
        {
          id: 1,
          title: 'Deep Learning Slides',
          type: 'presentation',
          uploadDate: '2025-03-15'
        }
      ],
      faqs: []
    },
    {
      id: 3,
      name: 'Natural Language Processing',
      description: 'Comprehensive study of NLP techniques for text analysis and generation.',
      students: 22,
      startDate: '2025-04-15',
      endDate: '2025-07-25',
      progress: '3/14',
      link: 'https://universitywebsite.com/professors/alex-johnson/courses/nlp/pin',
      status: 'archived',
      enrollmentCode: 'NLP303',
      aiSettings: {
        model: 'GPT-3.5',
        copyPasteRestriction: false,
        temperature: 0.9,
        maxTokens: 1200
      },
      lectureMaterials: [],
      faqs: [
        {
          id: 1,
          question: 'Required textbooks?',
          answer: 'Deep Learning for NLP by J. Smith'
        }
      ]
    }
];  