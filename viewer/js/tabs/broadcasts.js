// Waynautic Academy — WhatsApp Broadcasts Engine

function getWhatsAppAngleInstruction() {
  const angleSelect = document.getElementById("wa-angle-select");
  const selectedAngle = angleSelect ? angleSelect.value : 'auto';

  if (selectedAngle === 'internship') {
    return "Primary Angle: Emphasize the guaranteed 3-Month Industry Internship right after the 4-week AI training, dual certificates, and real client projects.";
  } else if (selectedAngle === 'contrarian') {
    return "Primary Angle: Contrarian wake-up call about why basic tutorials and superficial API calls don't get developers hired in 2026, and why enterprise RAG/MCP matters.";
  } else if (selectedAngle === 'story') {
    return "Primary Angle: Student breakthrough story — going from tutorial hell to building production agentic AI systems with 1-on-1 mentor guidance.";
  } else if (selectedAngle === 'webinar') {
    return "Primary Angle: ₹19 Live AI Masterclass Webinar flash invite — 90 minutes of live hands-on building, code-along, and Q&A.";
  } else if (selectedAngle === 'free') {
    return "Primary Angle: Zero-friction invitation for a Free 1-on-1 AI Career Consultation (15 Mins) with Pramod Gogadare.";
  }
  return "Primary Angle: Dynamic creative angle tailored to the user's specific request. Vary the opening hook and vocabulary.";
}
