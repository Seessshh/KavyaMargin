import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { PdfReader } from 'pdfreader';
import 'dotenv/config';

const router = express.Router();

// 1. Ensure the 'uploads' directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf', 
    'text/plain', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|txt|docx)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter
});

// 3. Helper Function: Promise-based PDF Extraction
const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    let extractedText = "";
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(extractedText);
      else if (item.text) extractedText += item.text + " ";
    });
  });
};

// 4. AI-FREE CONTRACT PARSING FUNCTIONS
const extractEntitiesFromText = (text) => {
  const entities = {
    client: extractClientName(text),
    startDate: extractDate(text, 'start'),
    endDate: extractDate(text, 'end'),
    payment: extractPayment(text)
  };
  return entities;
};

const extractClientName = (text) => {
  // Look for patterns like "between [Client Name] and"
  const clientPatterns = [
    /(?:between|bw|by and between)\s+([A-Za-z\s&.,]+?)\s+(?:and|&|with)/i,
    /(?:client|customer|vendor|company)\s*:?\s*([A-Za-z\s&.,]+?)\n/i,
    /(?:party\s*1|party\s*one)\s*:?\s*([A-Za-z\s&.,]+?)\n/i
  ];

  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: look for company names (words ending with Inc, LLC, Ltd, Corp, etc.)
  const companyPattern = /([A-Z][a-zA-Z\s&.]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Technologies|Solutions|Group)\b)/g;
  const companies = text.match(companyPattern);
  if (companies && companies.length > 0) {
    return companies[0].trim();
  }

  return "Client Not Specified";
};

const extractDate = (text, type) => {
  const datePatterns = [
    // Format: January 15, 2024
    /(?:effective|start|commence|begin|end|terminate|expiry).*?(?:date|on|:)?\s*(?:is|shall be|on|:)?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    // Format: 15/01/2024 or 01/15/2024
    /(?:effective|start|commence|begin|end|terminate|expiry).*?(?:date|on|:)?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
    // Format: 2024-01-15
    /(?:effective|start|commence|begin|end|terminate|expiry).*?(?:date|on|:)?\s*(\d{4}-\d{2}-\d{2})/i
  ];

  const dateText = type === 'start' ? 'start|commence|begin|effective' : 'end|terminate|expiry|conclusion';
  const relevantPattern = new RegExp(datePatterns.map(p => p.source).join('|'), 'i');
  
  const match = text.match(relevantPattern);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Look for standalone dates
  const standaloneDates = text.match(/([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g);
  if (standaloneDates && standaloneDates.length > 0) {
    return type === 'start' ? standaloneDates[0] : standaloneDates[standaloneDates.length - 1];
  }

  return "Date Not Specified";
};

const extractPayment = (text) => {
  // Look for monetary amounts
  const paymentPatterns = [
    /(?:amount|value|consideration| fee|payment|sum|total)\s*:?\s*₹?([\d,]+(?:\.\d{2})?)/i,
    /(?:₹|Rs\.?|rupees?)\s*([\d,]+(?:\.\d{2})?)/i,
    /USD?\s*([\d,]+(?:\.\d{2})?)/i,
    /([\d,]+(?:\.\d{2})?)\s*(?:rupees?|USD|\$)/i
  ];

  for (const pattern of paymentPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return `₹${match[1].replace(/,/g, '')}`;
    }
  }

  return "Amount Not Specified";
};

const extractRisks = (text) => {
  const risks = [];
  
  // Risk keywords and their associated risk levels
  const riskKeywords = {
    high: ['penalty', 'breach', 'termination', 'litigation', 'dispute', 'lawsuit', 'liable', 'indemnity'],
    medium: ['delay', 'non-compliance', 'violation', 'default', 'consequence'],
    low: ['notice', 'review', 'update', 'amendment']
  };

  const sentences = text.split(/[.!?]+/);
  
  // Check for penalty/breach clauses (High Risk)
  const penaltySentences = sentences.filter(s => 
    /(penalty|breach|termination|liable|indemnity)/i.test(s)
  );
  
  if (penaltySentences.length > 0) {
    risks.push({
      level: "High",
      message: `Penalty and breach clauses detected. Found ${penaltySentences.length} relevant mentions including potential liability and termination conditions.`
    });
  }

  // Check for compliance issues (Medium Risk)
  const complianceSentences = sentences.filter(s => 
    /(compliance|regulation|standard|requirement)/i.test(s)
  );
  
  if (complianceSentences.length > 0) {
    risks.push({
      level: "Medium",
      message: `Compliance requirements identified. Contract contains ${complianceSentences.length} references to regulatory compliance and standards.`
    });
  }

  // Check for payment delays (Medium Risk)
  const paymentSentences = sentences.filter(s => 
    /(payment|due|overdue|late fee|interest)/i.test(s)
  );
  
  if (paymentSentences.length > 0) {
    risks.push({
      level: "Medium",
      message: `Payment terms and conditions found. Review payment schedules, late fees, and interest clauses.`
    });
  }

  // Check for notice periods (Low Risk)
  const noticeSentences = sentences.filter(s => 
    /(notice|period|days?|weeks?)/i.test(s)
  );
  
  if (noticeSentences.length > 0) {
    risks.push({
      level: "Low",
      message: `Notice and communication requirements detected. Review notice periods and communication protocols.`
    });
  }

  // If no specific risks found, add a general review note
  if (risks.length === 0) {
    risks.push({
      level: "Low",
      message: "Contract requires general legal review for standard terms and conditions."
    });
  }

  return risks;
};

const extractClauses = (text) => {
  const clauses = [];
  
  // Common clause types to look for
  const clauseTypes = [
    { name: "Payment Terms", keywords: ["payment", "invoice", "billing", "fee", "amount"], color: "emerald" },
    { name: "Confidentiality", keywords: ["confidential", "non-disclosure", "secret", "privacy"], color: "blue" },
    { name: "Termination", keywords: ["termination", "end", "expire", "cancel"], color: "rose" },
    { name: "Liability", keywords: ["liability", "responsible", "damages", "loss"], color: "amber" },
    { name: "Intellectual Property", keywords: ["intellectual property", "copyright", "trademark", "patent"], color: "purple" },
    { name: "Force Majeure", keywords: ["force majeure", "act of god", "unavoidable"], color: "indigo" },
    { name: "Dispute Resolution", keywords: ["dispute", "arbitration", "mediation", "court"], color: "orange" },
    { name: "Governing Law", keywords: ["governing law", "jurisdiction", "legal framework"], color: "teal" }
  ];

  const sentences = text.split(/[.!?]+/);

  clauseTypes.forEach(clauseType => {
    const matchingSentences = sentences.filter(sentence => 
      clauseType.keywords.some(keyword => 
        new RegExp(keyword, 'i').test(sentence)
      )
    );

    if (matchingSentences.length > 0) {
      const status = matchingSentences.length > 2 ? "Verified" : "Review Required";
      
      clauses.push({
        name: clauseType.name,
        status: status,
        iconName: status === "Verified" ? "ShieldCheck" : "AlertTriangle",
        color: clauseType.color
      });
    }
  });

  // If no specific clauses found, add some generic ones
  if (clauses.length === 0) {
    clauses.push(
      { name: "General Terms", status: "Review Required", iconName: "AlertTriangle", color: "amber" },
      { name: "Standard Clauses", status: "Review Required", iconName: "AlertTriangle", color: "amber" }
    );
  }

  return clauses;
};

// 5. Contract Storage (same as before)
const contractStorage = new Map();

// 6. Search Clauses Function (same as before)
const searchClausesInText = (fullText, keywords) => {
  const results = [];
  const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = sentences.filter(sentence => regex.test(sentence));
    
    matches.slice(0, 3).forEach(match => {
      results.push({
        keyword,
        text: match.trim(),
        relevance: match.length,
        position: fullText.indexOf(match.trim())
      });
    });
  });
  
  return results
    .filter((result, index, self) => 
      index === self.findIndex(r => r.text === result.text)
    )
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
};

// ==========================================
// NEW ENDPOINTS (Same as before)
// ==========================================

router.get('/clause/:contractId', async (req, res) => {
  const { contractId } = req.params;
  const { search, keywords } = req.query;
  
  try {
    const contractData = contractStorage.get(contractId);
    if (!contractData) {
      return res.status(404).json({ 
        success: false,
        message: 'Contract not found'
      });
    }
    
    let results = [];
    
    if (search || keywords) {
      const searchTerms = (search || keywords).split(',').map(term => term.trim().toLowerCase());
      results = searchClausesInText(contractData.fullText, searchTerms);
    }
    
    res.json({
      success: true,
      contractId,
      fileName: contractData.fileName,
      fullText: contractData.fullText.substring(0, 5000),
      searchResults: results,
      extractedAt: contractData.extractedAt,
      totalLength: contractData.fullText.length
    });
    
  } catch (error) {
    console.error("Error retrieving clause:", error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve clause text'
    });
  }
});

router.post('/search-clauses', async (req, res) => {
  const { contractId, keywords } = req.body;
  
  try {
    const contractData = contractStorage.get(contractId);
    if (!contractData) {
      return res.status(404).json({ 
        success: false,
        message: 'Contract not found' 
      });
    }
    
    const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
    const searchResults = searchClausesInText(contractData.fullText, keywordArray);
    
    res.json({
      success: true,
      contractId,
      results: searchResults,
      totalMatches: searchResults.length
    });
    
  } catch (error) {
    console.error("Error searching clauses:", error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to search clauses'
    });
  }
});

// ==========================================
// POST: Upload & Analyze Contract (AI-FREE)
// ==========================================
router.post('/analyze', upload.single('contract'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }


    let extractedText = "";

    // --- STEP 1: EXTRACT TEXT ---
    try {
      if (req.file.originalname.match(/\.pdf$/i)) {
        const dataBuffer = fs.readFileSync(req.file.path);
        extractedText = await extractTextFromPDF(dataBuffer);
       
      } else {
        extractedText = fs.readFileSync(req.file.path, 'utf8');
      }
    } catch (parseError) {
      console.error("❌ Extraction Failed:", parseError);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: "Failed to read document." });
    }

    // --- STEP 2: AI-FREE ANALYSIS ---
    try {
      
      
      // Extract entities, risks, and clauses using text parsing
      const entities = extractEntitiesFromText(extractedText);
      const risks = extractRisks(extractedText);
      const clauses = extractClauses(extractedText);
      
      const analysisResult = {
        entities,
        risks,
        clauses
      };
      
      // Store extracted text for later retrieval
      const contractId = `${Date.now()}-${req.file.originalname.replace(/\.[^/.]+$/, "")}`;
      contractStorage.set(contractId, {
        fullText: extractedText,
        fileName: req.file.originalname,
        extractedAt: new Date().toISOString()
      });
      
      analysisResult.contractId = contractId;
      analysisResult.fileName = req.file.originalname;
      


      // Clean up the local file from /uploads
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

     
      res.status(200).json(analysisResult);

    } catch (analysisError) {
      console.error("❌ Analysis Error:", analysisError);
      
      // Send fallback response
      const fallbackResponse = {
        contractId: null,
        fileName: req.file.originalname,
        entities: {
          client: "Unable to extract",
          startDate: "Unknown",
          endDate: "Unknown", 
          payment: "Unknown"
        },
        risks: [
          { level: "High", message: "Failed to analyze contract - parsing error" }
        ],
        clauses: [
          { name: "Analysis Error", status: "Review Required", iconName: "AlertTriangle", color: "rose" }
        ]
      };
      
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(200).json(fallbackResponse);
    }

  } catch (error) {
    console.error("❌ Fatal Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
