// Built-in content: used by the frontend when no API is reachable,
// and as the seed data for the backend store on first run.
export const DEFAULT_CONTENT = {
  profile: {
    name: 'Farhan Akhtar',
    tagline: 'AI & ML undergrad building intelligent, human-friendly software',
    role: 'AI & ML Undergraduate',
    location: 'Jharkhand, India',
    college: 'SIRT Bhopal',
    branch: 'Artificial Intelligence & Machine Learning (AIML)',
    email: 'farhan@xoiom.dev',
    photo: '',
    about: [
      "Hey there! I'm Farhan — a computer science undergraduate who's happiest when a model learns something new. I spend my time exploring artificial intelligence: from classic machine learning to deep neural networks, and everything I can ship to the web in between.",
      "I'm from Jharkhand, India, and I'm currently pursuing my B.Tech in Artificial Intelligence & Machine Learning at SIRT Bhopal. My goal is simple — build things that are useful, reliable, and a little bit magical.",
      "When I'm not studying, you'll find me shipping small projects, reading ML papers, or polishing this website — which I designed and built myself, down to the private admin panel that keeps every word here in my hands."
    ],
    stats: [
      { label: 'Years of coding', value: 3 },
      { label: 'Projects built', value: 12 },
      { label: 'Technologies', value: 15 },
      { label: 'Coffee cups / week', value: 7 }
    ],
    socials: {
      github: 'https://github.com/farhanakhtar001458-ai',
      linkedin: '',
      twitter: '',
      website: ''
    }
  },
  skills: [
    {
      id: 'langs',
      name: 'Languages',
      icon: 'code',
      items: [
        { name: 'Python', level: 85 },
        { name: 'C', level: 75 },
        { name: 'C++', level: 70 },
        { name: 'JavaScript', level: 78 },
        { name: 'SQL', level: 70 }
      ]
    },
    {
      id: 'aiml',
      name: 'AI / Machine Learning',
      icon: 'brain',
      items: [
        { name: 'Machine Learning', level: 80 },
        { name: 'Deep Learning', level: 70 },
        { name: 'Computer Vision', level: 65 },
        { name: 'NLP', level: 60 },
        { name: 'Data Analysis', level: 75 }
      ]
    },
    {
      id: 'web',
      name: 'Web Development',
      icon: 'globe',
      items: [
        { name: 'HTML & CSS', level: 88 },
        { name: 'React', level: 75 },
        { name: 'Node.js / Express', level: 72 },
        { name: 'REST APIs', level: 78 }
      ]
    },
    {
      id: 'tools',
      name: 'Tools & Frameworks',
      icon: 'wrench',
      items: [
        { name: 'Git & GitHub', level: 85 },
        { name: 'Jupyter', level: 80 },
        { name: 'TensorFlow / PyTorch', level: 65 },
        { name: 'OpenCV', level: 68 },
        { name: 'Linux', level: 70 }
      ]
    },
    {
      id: 'soft',
      name: 'Beyond Code',
      icon: 'spark',
      items: [
        { name: 'Problem Solving', level: 90 },
        { name: 'Teamwork', level: 85 },
        { name: 'Communication', level: 82 },
        { name: 'Fast Learner', level: 92 }
      ]
    }
  ],
  projects: [
    {
      id: 'p1',
      title: 'Face-Recognition Attendance System',
      desc: 'Real-time classroom attendance that detects faces and marks them automatically using OpenCV and face embeddings — no cameras wired into the room needed.',
      tags: ['Python', 'OpenCV', 'Machine Learning'],
      link: '',
      repo: 'https://github.com/farhanakhtar001458-ai',
      featured: true
    },
    {
      id: 'p2',
      title: 'Disease Prediction Model',
      desc: 'A machine-learning classifier that predicts likely diseases from symptom inputs, with an easy-to-read explainer for why it made the call.',
      tags: ['scikit-learn', 'Pandas', 'Flask'],
      link: '',
      repo: '',
      featured: false
    },
    {
      id: 'p3',
      title: 'Xoiom — This Portfolio',
      desc: 'A full-stack 3D glassmorphic portfolio: React frontend, Express API, and a private admin panel that controls every word on the page.',
      tags: ['React', 'Node.js', 'Express'],
      link: '',
      repo: 'https://github.com/farhanakhtar001458-ai/xoiom',
      featured: true
    },
    {
      id: 'p4',
      title: 'Sentiment Analyzer',
      desc: 'An NLP pipeline that classifies the mood of reviews and comments, trained and evaluated step by step in Jupyter notebooks.',
      tags: ['NLP', 'Python', 'Pandas'],
      link: '',
      repo: '',
      featured: false
    }
  ],
  journey: [
    {
      id: 'j1',
      kind: 'study',
      title: 'B.Tech — AI & ML (AIML)',
      org: 'SIRT Bhopal',
      period: '2024 — Present',
      desc: 'Studying artificial intelligence, machine learning, deep learning — and everything worth learning along the way.'
    },
    {
      id: 'j2',
      kind: 'build',
      title: 'Self-taught builder',
      org: 'Personal projects',
      period: '2023 — Present',
      desc: 'Teaching myself web development and ML through projects, documentation, and a healthy amount of late nights.'
    },
    {
      id: 'j3',
      kind: 'life',
      title: 'Roots in Jharkhand',
      org: 'Jharkhand, India',
      period: 'Always',
      desc: 'Where the journey began — from small-town curiosity to big-tech dreams.'
    }
  ],
  messages: []
};
