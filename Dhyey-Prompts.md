# AI Copilot Usage Log

In alignment with SimPPL's AI-first engineering culture, I utilized LLMs (ChatGPT/Claude) primarily as a coding copilot to accelerate boilerplate generation, UI styling, and basic syntax formatting. 

### Prompt 1
**Component:** Chatbot Frontend UI (`ChatBot.jsx`)
**Prompt:** "Generate a React component for a floating chat window using Tailwind CSS. It should have a toggle button at the bottom right, a header, a message map area, and an input field."
**What was wrong & How I fixed it:** The AI hardcoded the height of the chat window to `h-[600px]`, which broke the layout and pushed the header off-screen on smaller laptop displays. I discarded the hardcoded height and implemented a dynamic viewport calculation (`max-h-[calc(100vh-130px)]`) and added `shrink-0` to the header and input components to ensure only the message area triggered the scrollbar.

### Prompt 2
**Component:** Data Cleaning Pipeline (`topic_utils.py`)
**Prompt:** "Write a Python regex snippet to remove all HTML tags from a string, as well as strip out standard URLs starting with http or https."
**What was wrong & How I fixed it:** The AI provided a naive `<.*?>` regex which failed to handle broken HTML tags effectively and left behind stray HTML entities (like `&nbsp;` and `&quot;`) which poisoned the TF-IDF vectorizer. I refined the regex manually and built a custom `INTERNET_GARBAGE` stop-word list to aggressively scrub the data before passing it to the SentenceTransformer.

### Prompt 3
**Component:** Timeline Visualization (`Chart.js`)
**Prompt:** "Give me the configuration object for a react-chartjs-2 Line chart to make it look like a smooth area chart. I want the line to have a tension curve and the area underneath to be a semi-transparent version of the line color."
**What was wrong & How I fixed it:** The AI provided standard Chart.js v2 syntax, which caused registration errors in the modern v3+ modular setup. Furthermore, its method for generating the transparent background involved a complex canvas gradient function. I updated the component to the modern `ChartJS.register()` pattern and vastly simplified the transparency by dynamically appending a hex alpha channel (`+ "1A"`) to the cluster's base color directly in the dataset loop.

### Prompt 4
**Component:** FastAPI Boilerplate (`main.py`)
**Prompt:** "Give me the boilerplate code to set up a FastAPI app with CORS middleware enabled for all origins, and an async context manager for the lifespan events."
**What was wrong & How I fixed it:** The AI successfully provided the boilerplate structure but missed the `allow_credentials=True` flag in the `CORSMiddleware` configuration. This oversight caused immediate preflight (OPTIONS) request failures when connecting the React frontend. I manually added the flag and restructured the lifespan manager to safely load the FAISS index and MiniLM models into global memory before accepting traffic.

### Prompt 5
**Component:** Network Graph Styling (`react-force-graph-2d`)
**Prompt:** "I am using react-force-graph-2d. Give me a code snippet to map the 'group' attribute of a node to a specific color, and make the node size relative to a 'val' attribute."
**What was wrong & How I fixed it:** The AI suggested using a complex React `useState` hook to maintain a color dictionary, which caused unnecessary and heavy re-renders of the physics engine every time the graph updated. I removed the state management entirely and passed a deterministic color function directly into the `nodeColor` prop for optimal rendering performance.
