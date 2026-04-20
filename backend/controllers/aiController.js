const Product = require('../models/Product');

// @desc    Generate a custom bundle using keywords from DB
// @route   POST /api/ai/generate
// @access  Public
const generateAIBundle = async (req, res, next) => {
  try {
    const { requirements } = req.body;

    if (!requirements) {
      res.status(400);
      throw new Error('Please provide text requirements to generate a bundle');
    }

    const lowerReq = requirements.toLowerCase();

    let budget = 5000;
    const budgetMatch = lowerReq.match(/under\s*[₹$]?\s*(\d+)/) || lowerReq.match(/[₹$]\s*(\d+)/);
    if (budgetMatch && budgetMatch[1]) {
      budget = parseInt(budgetMatch[1], 10);
    }

    const keywords = [];
    if (lowerReq.includes('student') || lowerReq.includes('study')) keywords.push('desk', 'chair', 'lamp', 'bed');
    if (lowerReq.includes('work from home') || lowerReq.includes('wfh') || lowerReq.includes('office')) keywords.push('desk', 'chair', 'monitor');
    if (lowerReq.includes('living')) keywords.push('sofa', 'tv', 'rug', 'table');
    if (lowerReq.includes('bedroom') || lowerReq.includes('sleep')) keywords.push('bed', 'mattress', 'wardrobe');

    if (keywords.length === 0) keywords.push('bed', 'sofa', 'tv');

    // Fetch related products
    const products = await Product.find({
      $or: keywords.map(kw => ({
        $or: [
          { name: { $regex: kw, $options: 'i' } },
          { description: { $regex: kw, $options: 'i' } }
        ]
      }))
    });

    let selectedItems = [];
    let currentTotal = 0;
    let categorySet = new Set();

    // Naive greed selection
    for (const item of products) {
      if (currentTotal + item.monthlyRent <= budget && !categorySet.has(item.category + item.name)) {
        selectedItems.push(item);
        currentTotal += item.monthlyRent;
        categorySet.add(item.category + item.name);
      }
    }

    if (selectedItems.length === 0) {
      if (products.length > 0) {
        selectedItems.push(products[0]);
        currentTotal = products[0].monthlyRent;
      }
    }

    res.json({
      bundleName: "AI Architect Signature Setup",
      message: `We analyzed your request and curated these items matching your parameters.`,
      items: selectedItems,
      totalMonthlyRent: currentTotal
    });

  } catch (error) {
    next(error);
  }
};


const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1) Clean punctuation safely and normalize common abbreviations
    let cleanMsg = message.toLowerCase().replace(/[^\w\s₹$\d]/g, '');
    // Normalize: "a c" (from "a.c") back to "ac"
    cleanMsg = cleanMsg.replace(/\ba\s+c\b/g, 'ac');
    const paddedMsg = " " + cleanMsg + " "; // Padding for safer whole-word matching

    // 2) Extract budget if present
    let budget = 10000;
    const budgetMatch = cleanMsg.match(/under\s*[₹$]?\s*(\d+)/) || cleanMsg.match(/[₹$]\s*(\d+)/);
    if (budgetMatch && budgetMatch[1]) {
      budget = parseInt(budgetMatch[1], 10);
    }

    let keywords = [];
    let isBundle = false;

    // 3) Extract bundle scenario keywords
    if (paddedMsg.includes(" student ") || paddedMsg.includes(" study ")) { keywords.push("desk", "chair", "lamp", "bed"); isBundle = true; }
    if (paddedMsg.includes(" work from home ") || paddedMsg.includes(" wfh ") || paddedMsg.includes(" office ")) { keywords.push("desk", "chair", "monitor"); isBundle = true; }
    if (paddedMsg.includes(" living ")) { keywords.push("sofa", "tv", "rug", "table"); isBundle = true; }
    if (paddedMsg.includes(" bedroom ") || paddedMsg.includes(" sleep ")) { keywords.push("bed", "mattress", "wardrobe"); isBundle = true; }

    // 4) Explicit single-item keywords
    if (!isBundle) {
      if (paddedMsg.includes(" sofa ")) keywords.push("sofa");
      if (paddedMsg.includes(" bed ")) keywords.push("bed");
      if (paddedMsg.includes(" table ") || paddedMsg.includes(" desk ")) keywords.push("table", "desk");
      if (paddedMsg.includes(" chair ")) keywords.push("chair");
      if (paddedMsg.includes(" tv ") || paddedMsg.includes(" television ") || paddedMsg.includes(" monitor ")) keywords.push("tv", "monitor");
      if (paddedMsg.includes(" ac ") || paddedMsg.includes(" air conditioner ")) keywords.push("split ac");
      if (paddedMsg.includes(" cooler ") || paddedMsg.includes(" air cooler ")) keywords.push("cooler");
    }

    // 5) Dynamic fallback — strip stop words and use remaining text
    if (keywords.length === 0) {
      const stopWords = /\b(i|m|im|am|looking|for|rent|want|need|show|me|do|you|have|a|an|the|is|there|any|some|what|where|how|much|please|can|get|find)\b/g;

      const searchQuery = cleanMsg
        .replace(/under\s*[₹$]?\s*\d+/, '')
        .replace(/[₹$]\s*\d+/, '')
        .replace(stopWords, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (searchQuery.length > 1) {
        keywords.push(searchQuery);
      } else {
        return res.json({
          reply: "Thank you for reaching out to Flexirent Concierge! Please tell me what specific furniture or appliances you are looking to rent."
        });
      }
    }

    // 6) Build MongoDB query
    // For multi-word keywords like "split ac", ALL words must match the same product name.
    // For single-word keywords, standard regex match.
    const keywordQueries = keywords.map(k => {
      const words = k.split(" ").filter(w => w.length > 0);
      if (words.length === 1) {
        return { name: { $regex: words[0], $options: "i" } };
      }
      // All words must exist in the product name
      return { $and: words.map(word => ({ name: { $regex: word.trim(), $options: "i" } })) };
    });

    const queryParams = {
      $and: [
        { $or: keywordQueries },
        { monthlyRent: { $lte: budget } }
      ]
    };

    // Singles limit to 1, bundles up to 6
    const products = await Product.find(queryParams).limit(isBundle ? 6 : 1);

    if (products.length === 0) {
      return res.json({
        reply: "Thank you for your inquiry. At this time, we do not have an exact match for those criteria in our catalog. Please try exploring our categories or adjusting your budget."
      });
    }

    const replyText = products.map(p =>
      `• ${p.name} — ₹${p.monthlyRent}/mo`
    ).join("\n");

    return res.json({
      reply: `Here ${products.length > 1 ? 'are' : 'is'} the most relevant match${products.length > 1 ? 'es' : ''} we found for you:\n${replyText}`,
      items: products
    });

  } catch (error) {
    console.error("Chat API DB error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
};

module.exports = { generateAIBundle, chatWithAI };