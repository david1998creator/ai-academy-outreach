// Waynautic Academy — LinkedIn Posts Engine

function getLinkedInAngleInstruction() {
  const liAngleSelect = document.getElementById("li-angle-select");
  const selectedAngle = liAngleSelect ? liAngleSelect.value : 'auto';

  if (selectedAngle === 'tech') {
    return "Focus on technical architecture: RAG chunking, hybrid search (BM25 + Dense embeddings), re-rankers, and MCP tool calling.";
  } else if (selectedAngle === 'lead') {
    return "Focus on viral lead generation: Offer the 2026 AI Engineering Roadmap PDF and instruct readers to comment 'ROADMAP' below.";
  } else if (selectedAngle === 'award') {
    return "Focus on enterprise credibility: Highlight Waynautic winning 'Best AI/ML Testing Strategy 2025' at the GenAI & ML Awards.";
  } else if (selectedAngle === 'hot_take') {
    return "Contrarian perspective: Why prompt engineering alone is dead in 2026, and why real software engineering with AI is what gets compensated.";
  }
  return "Focus on high-engagement thought leadership for senior software engineers.";
}
