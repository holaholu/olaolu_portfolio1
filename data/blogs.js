const blogs = [
  {
    slug: 'ai-infrastructure-developer-tools',
    title: 'Building AI Infrastructure: Lessons from Shipping Developer Tools',
    excerpt: 'What I learned designing internal platforms that make machine learning models usable, observable, and maintainable in production.',
    category: 'AI Infrastructure',
    date: '2024-11-18',
    readTime: '14 min read',
    tags: ['MLOps', 'Platform Engineering', 'LLMs'],
    content: [
      {
        heading: 'The gap between model and product',
        text: 'Most AI projects fail not because the model is bad, but because the surrounding infrastructure is brittle. A great LLM in a Jupyter notebook is not a product. After building several internal AI tools, I have come to see infrastructure as the decisive factor in whether an AI feature actually ships.'
      },
      {
        heading: 'Design around the feedback loop',
        text: 'Developer tools live or die by how fast the user can iterate. For AI features, that means minimizing the time between a prompt change, evaluation, and deployment. We invested in a single command that runs offline evaluation against a golden dataset, then promotes the winning variant to staging. That loop became our product velocity.'
      },
      {
        heading: 'Observability is not optional',
        text: 'Unlike traditional software, AI systems can degrade silently. Inputs drift, model outputs drift, and user expectations drift. We built lightweight tracing for every LLM call: latency, cost, token usage, and a sampled transcript of inputs and outputs. These traces became the first place we looked when a feature felt "off".'
      },
      {
        heading: 'Prefer composition over black boxes',
        text: 'It is tempting to wrap everything in one massive agent. In practice, smaller components that do one thing well are easier to test, swap, and debug. We split our pipeline into retriever, synthesizer, validator, and formatter stages. Each stage had its own contract and its own tests.'
      },
      {
        heading: 'Make rollback boring',
        text: 'The best infrastructure decision we made was versioned prompts and model configs tied to git commits. When a new prompt started producing worse results in production, we reverted in seconds instead of hours. Boring rollbacks are a competitive advantage.'
      },
      {
        heading: 'Final thought',
        text: 'AI infrastructure is not glamorous, but it is where the value compounds. The teams that ship reliably are the ones that treat AI code like production code: tested, observable, and easy to change.'
      }
    ]
  },
  {
    slug: 'rag-production-lessons',
    title: 'RAG in Production: What Works, What Breaks, and What to Measure',
    excerpt: 'A practical walkthrough of moving retrieval-augmented generation from prototype to a production-grade system.',
    category: 'LLMs',
    date: '2025-01-12',
    readTime: '16 min read',
    tags: ['RAG', 'Vector Databases', 'Evaluation'],
    content: [
      {
        heading: 'The prototype trap',
        text: 'A RAG prototype is deceptively simple: chunk some documents, store embeddings, retrieve, then ask a language model to answer. In production, the story changes. Latency, recall, hallucinations, and maintenance all show up at once.'
      },
      {
        heading: 'Chunking is a product decision',
        text: 'The right chunk size depends on what the user is trying to do. We started with fixed-size chunks and quickly found they broke logical boundaries. Semantic chunking, guided by headers and transitions, improved answer quality more than any embedding model change.'
      },
      {
        heading: 'Retrieval quality beats generation quality',
        text: 'If the context is wrong, even the best LLM cannot save the answer. We built an evaluation set of 200 representative questions and measured context recall and precision. Tuning hybrid search with reranking gave us bigger gains than switching LLMs.'
      },
      {
        heading: 'You need a real answer metric',
        text: 'BLEU and ROUGE are not enough. We used LLM-as-judge for faithfulness and relevance, but always kept a human-validated subset to sanity-check automatic scores. The metric you optimize becomes the ceiling of your product.'
      },
      {
        heading: 'Plan for stale data',
        text: 'Documents update. Embeddings get stale. We added metadata filters and refresh jobs tied to source systems. Knowing when your knowledge base is out of date matters as much as knowing what is in it.'
      },
      {
        heading: 'Closing',
        text: 'Production RAG is a retrieval problem dressed up as a generation problem. Focus on data quality, evaluation, and observable retrieval before chasing the latest model release.'
      }
    ]
  },
  {
    slug: 'llm-agents-state-machines',
    title: 'Why I Build LLM Agents as State Machines',
    excerpt: 'Moving from free-form agent loops to explicit state machines made our agentic systems more predictable, testable, and debuggable.',
    category: 'LLM Agents',
    date: '2025-03-05',
    readTime: '12 min read',
    tags: ['Agents', 'LangGraph', 'System Design'],
    content: [
      {
        heading: 'The autonomy illusion',
        text: 'When LLM agents first became popular, the promise was a system that could plan, act, and reason on its own. In practice, unconstrained autonomy leads to opaque behavior, infinite loops, and hard-to-debug failures. I now design agents as explicit state machines.'
      },
      {
        heading: 'States give you contracts',
        text: 'Each state has a clear input, a clear responsibility, and a clear set of transitions. A "plan" state produces a plan. A "tool" state executes one tool. A "verify" state checks whether the result satisfies the goal. When something breaks, I know exactly where to look.'
      },
      {
        heading: 'Tool use is not free text',
        text: 'Letting the model emit arbitrary JSON to call tools is fragile. We moved to structured outputs with schemas and strict validation. If the output does not match the schema, the state machine halts instead of guessing.'
      },
      {
        heading: 'Human-in-the-loop by design',
        text: 'Not every decision should be automated. We added explicit approval states for high-stakes actions. This turned out to be easier to implement in a state machine than in an open-ended loop because the pause point is just another node.'
      },
      {
        heading: 'Testability follows structure',
        text: 'Because states are isolated, we can unit-test each one. We can also replay traces by stepping through the same graph with the same inputs. That reproducibility makes regression testing possible.'
      },
      {
        heading: 'Bottom line',
        text: 'State machines do not eliminate the magic of LLMs. They put guardrails around it. For production agents, I will take predictability over maximum autonomy every time.'
      }
    ]
  },
  {
    slug: 'mlops-small-teams',
    title: 'MLOps for Small Teams: A Pragmatic Starting Point',
    excerpt: 'You do not need a dedicated platform team to get 80% of the MLOps value. Here is the stack and workflow I recommend.',
    category: 'MLOps',
    date: '2025-05-20',
    readTime: '18 min read',
    tags: ['MLOps', 'CI/CD', 'FastAPI'],
    content: [
      {
        heading: 'Start with the experiment, not the platform',
        text: 'The first goal is to find a model that actually solves the problem. Until then, most MLOps tooling is premature. I usually begin with a notebook, a small dataset, and a single evaluation metric. Only after the prototype repeatedly passes a manual sniff test do I think about operationalizing it.'
      },
      {
        heading: 'Version everything that changes',
        text: 'Code, data, and models all change. Use git for code, a simple dataset registry or DVC for data, and a model registry for artifacts. Even a spreadsheet of experiment results is better than nothing, but a real registry pays for itself the first time you need to reproduce a result.'
      },
      {
        heading: 'Containerize the inference path early',
        text: 'The moment you have a model worth sharing, wrap the inference code in a container. It forces you to clarify dependencies, input schemas, and the serving interface. FastAPI plus Docker is my default starting point for Python models.'
      },
      {
        heading: 'Automated tests are a form of documentation',
        text: 'Write tests for data expectations, model input/output contracts, and endpoint behavior. They do not need to be exhaustive. A few well-chosen tests catch regressions and onboard new teammates faster than any README.'
      },
      {
        heading: 'Monitor the right things',
        text: 'Start with latency, errors, input distribution drift, and a handful of output quality samples. Fancy dashboards can wait. Alert on symptoms users care about, not every metric you can collect.'
      },
      {
        heading: 'Grow the platform as you grow the pain',
        text: 'Do not build a full platform on day one. Add a tool when a repeated pain becomes expensive. Small teams win by staying close to the problem and iterating fast.'
      }
    ]
  },
  {
    slug: 'evaluating-fine-tuned-models',
    title: 'How I Evaluate Fine-Tuned Models Without Losing My Mind',
    excerpt: 'A structured approach to comparing base, fine-tuned, and prompted models so you know what actually improved.',
    category: 'Machine Learning',
    date: '2025-07-08',
    readTime: '14 min read',
    tags: ['Fine-Tuning', 'Evaluation', 'LLMs'],
    content: [
      {
        heading: 'Define the task, not the metric',
        text: 'Before touching a benchmark, write down what success looks like in user terms. A summarizer is useful if it preserves key facts and sounds natural. A classifier is useful if it catches edge cases the heuristic missed. The metric serves the task, not the other way around.'
      },
      {
        heading: 'Build a representative test set',
        text: 'I split my evaluation data by scenario, not just randomly. Real user queries, synthetic adversarial examples, and historical failure cases each get their own bucket. A model that wins on average can still fail where it matters most.'
      },
      {
        heading: 'Compare against strong baselines',
        text: 'A fine-tuned model should beat a good prompt on a capable base model. If it does not, you are paying training and maintenance costs for no benefit. I always include the best zero-shot prompt I can write as a baseline.'
      },
      {
        heading: 'Look at qualitative failures',
        text: 'Aggregate scores hide important failure modes. I keep a running document of worst outputs and review them after each experiment. Often the fix is a data curation problem, not a modeling one.'
      },
      {
        heading: 'Measure cost and latency too',
        text: 'A more accurate model is not always better. If it is twice as slow or ten times as expensive, the trade-off may not be worth it. Report accuracy, latency, and cost together.'
      },
      {
        heading: 'Final note',
        text: 'Evaluation is a discipline, not a one-off step. The teams that maintain clean eval sets and honest baselines make better decisions about when to fine-tune and when to stop.'
      }
    ]
  }
];
